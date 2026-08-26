/**
 * Funding Mirror Web Server v2
 *
 * Full-stack arbitrage platform with:
 * - 5 exchanges: Binance / Bybit / OKX / Gate / Bitget
 * - Real-time arbitrage detection
 * - Anomaly detection (statistical)
 * - Rate prediction (order book + momentum)
 * - Capacity estimation (order book depth)
 * - Cross-pair correlation arbitrage
 * - Advanced backtesting (4 strategies)
 * - Paper trading with live PnL
 * - SQLite persistence
 * - WebSocket + REST API
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fetchAllRates, fetchBinanceOrderBook, fetchBybitOrderBook, FundingRate, OrderBook } from './exchanges/base.js';
import { detectAnomalies, AnomalyEvent } from './engine/anomaly.js';
import { predictRates, Prediction } from './engine/predictor.js';
import { estimateCapacity, CapacityEstimate } from './engine/capacity.js';
import { detectCrossPair, CrossPairSignal } from './engine/crosspair.js';
import { runBacktest, generateSyntheticRates, BacktestParams, BacktestResult } from './engine/backtest.js';
import { openPosition, updatePositions, getTradeStats, PaperTradeStats } from './engine/paper.js';
import { calcKelly, calcMultiKelly } from './engine/kelly.js';
import { fetchAllHistory } from './engine/history.js';
import { sendAlert, AlertConfig, createDefaultConfig } from './engine/alerts.js';
import { initDb, insertRates, insertOpportunity, getDbStats, getTopOpportunities, getAnomalySummary } from './store/db.js';
import * as path from 'path';
import * as url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8771;
const POLL_INTERVAL = 30000;

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// ==================== STATE ====================

interface ArbitrageOpportunity {
  symbol: string; longEx: string; shortEx: string;
  spreadPct: number; netAnnualized: number;
  longRate: number; shortRate: number;
  riskScore: number; capacity?: CapacityEstimate;
}

let latestRates: FundingRate[] = [];
let latestOpportunities: ArbitrageOpportunity[] = [];
let latestAnomalies: AnomalyEvent[] = [];
let latestPredictions: Prediction[] = [];
let latestCrossPair: CrossPairSignal[] = [];
let latestErrors: Record<string, string> = {};
let lastPollTime = 0;
let pollCount = 0;
let startTime = Date.now();
let alertConfig: AlertConfig = createDefaultConfig();

// ==================== POLLING ====================

async function poll() {
  pollCount++;
  const t0 = Date.now();

  try {
    const { rates, errors } = await fetchAllRates();
    latestRates = rates;
    latestErrors = errors;
    lastPollTime = Date.now();

    insertRates(rates.map(r => ({
      exchange: r.exchange, symbol: r.symbol, fundingRate: r.fundingRate,
      markPrice: r.markPrice, openInterest: r.openInterest,
      volume24h: r.volume24h, nextFundingTs: r.nextFundingTime,
      fetchedAt: r.fetchedAt,
    })));

    latestAnomalies = detectAnomalies(rates);
    latestCrossPair = detectCrossPair(rates);
    latestOpportunities = findOpportunities(rates);

    const topSymbols = [...new Set(latestOpportunities.slice(0, 5).map(o => o.symbol))].slice(0, 3);
    const orderBooks = new Map<string, OrderBook>();
    for (const sym of topSymbols) {
      const [bb, bob] = await Promise.allSettled([
        fetchBinanceOrderBook(sym),
        fetchBybitOrderBook(sym),
      ]);
      if (bb.status === 'fulfilled') orderBooks.set(`Binance:${sym}`, bb.value);
      if (bob.status === 'fulfilled') orderBooks.set(`Bybit:${sym}`, bob.value);
    }

    latestPredictions = predictRates(rates, orderBooks).filter(p => p.confidence >= 45).slice(0, 20);

    for (const opp of latestOpportunities.slice(0, 5)) {
      opp.capacity = estimateCapacity(opp.symbol, opp.longEx, opp.shortEx, opp.spreadPct,
        orderBooks.get(`${opp.longEx}:${opp.symbol}`), orderBooks.get(`${opp.shortEx}:${opp.symbol}`));
      insertOpportunity({
        symbol: opp.symbol, longEx: opp.longEx, shortEx: opp.shortEx,
        spreadPct: opp.spreadPct, netAnnualized: opp.netAnnualized,
        riskScore: opp.riskScore, capacityUsd: opp.capacity?.maxCapacityUsd,
        detectedAt: Date.now(),
      });
    }

    const rateMap = new Map<string, { fundingRate: number; markPrice: number }>();
    for (const r of rates) rateMap.set(`${r.exchange}:${r.symbol}`, { fundingRate: r.fundingRate, markPrice: r.markPrice || 0 });
    updatePositions(rateMap);

    // Send alerts
    for (const anom of latestAnomalies.slice(0, 3)) {
      sendAlert(alertConfig, {
        type: 'ANOMALY', symbol: anom.symbol, severity: anom.severity,
        title: `${anom.type} - ${anom.symbol}`, message: anom.description,
      });
    }
    for (const opp of latestOpportunities.slice(0, 2)) {
      if (opp.spreadPct > 0.05) {
        sendAlert(alertConfig, {
          type: 'OPPORTUNITY', symbol: opp.symbol,
          severity: Math.min(100, Math.round(opp.spreadPct * 1000)),
          title: `Arb ${opp.symbol} ${opp.netAnnualized}%`,
          message: `Spread ${opp.spreadPct}% | Long ${opp.longEx} / Short ${opp.shortEx}`,
        });
      }
    }

    const elapsed = Date.now() - t0;
    console.log(`[#${pollCount}] ${new Date().toLocaleTimeString('zh-CN')} | ${rates.length} rates | ${[...new Set(rates.map(r => r.exchange))].length} ex | ${latestOpportunities.length} opps | ${latestAnomalies.length} anom | ${latestCrossPair.length} cross | ${elapsed}ms`);

    broadcast();
  } catch (err: any) {
    console.error(`Poll error: ${err.message}`);
  }
}

function findOpportunities(rates: FundingRate[]): ArbitrageOpportunity[] {
  const bySymbol = new Map<string, FundingRate[]>();
  for (const r of rates) {
    if (!bySymbol.has(r.symbol)) bySymbol.set(r.symbol, []);
    bySymbol.get(r.symbol)!.push(r);
  }

  const opps: ArbitrageOpportunity[] = [];
  const PERIODS = 365 * 3;
  const FEE = 0.08;

  for (const [symbol, items] of bySymbol) {
    if (items.length < 2) continue;
    let bestSpread = 0;
    let bestLong: FundingRate | null = null;
    let bestShort: FundingRate | null = null;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const spread = items[i].fundingRate - items[j].fundingRate;
        if (spread > bestSpread) { bestSpread = spread; bestLong = items[i]; bestShort = items[j]; }
      }
    }
    if (!bestLong || !bestShort) continue;
    const spreadPct = bestSpread * 100;
    const netAnnualized = spreadPct * PERIODS - FEE * PERIODS;
    if (spreadPct > 0.005 && netAnnualized > 0) {
      let risk = 50;
      if (spreadPct > 0.05) risk -= 20;
      if (bestLong.openInterest > 1e8 && bestShort.openInterest > 1e8) risk -= 10;
      if (Math.abs(bestLong.fundingRate) > 0.005) risk += 15;
      opps.push({
        symbol, longEx: bestLong.exchange, shortEx: bestShort.exchange,
        spreadPct: +spreadPct.toFixed(4), netAnnualized: +netAnnualized.toFixed(2),
        longRate: bestLong.fundingRate, shortRate: bestShort.fundingRate,
        riskScore: Math.max(0, Math.min(100, risk)),
      });
    }
  }
  return opps.sort((a, b) => b.netAnnualized - a.netAnnualized);
}

// ==================== WEBSOCKET ====================

const clients = new Set<WebSocket>();
function broadcast() {
  const msg = JSON.stringify({
    type: 'snapshot', timestamp: Date.now(),
    data: {
      rates: latestRates.slice(0, 50),
      opportunities: latestOpportunities.slice(0, 25),
      anomalies: latestAnomalies.slice(0, 10),
      predictions: latestPredictions.slice(0, 15),
      crossPair: latestCrossPair.slice(0, 10),
      paperStats: getTradeStats(),
      stats: {
        totalRates: latestRates.length,
        exchanges: [...new Set(latestRates.map(r => r.exchange))],
        oppCount: latestOpportunities.length,
        anomalyCount: latestAnomalies.length,
        predictions: latestPredictions.length,
        crossPair: latestCrossPair.length,
        errors: latestErrors,
      },
    },
  });
  for (const ws of clients) {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  }
}

wss.on('connection', (ws) => {
  clients.add(ws);
  if (latestRates.length > 0) {
    ws.send(JSON.stringify({
      type: 'snapshot', timestamp: Date.now(),
      data: {
        rates: latestRates.slice(0, 50),
        opportunities: latestOpportunities.slice(0, 25),
        anomalies: latestAnomalies.slice(0, 10),
        predictions: latestPredictions.slice(0, 15),
        crossPair: latestCrossPair.slice(0, 10),
        paperStats: getTradeStats(),
        stats: {
          totalRates: latestRates.length,
          exchanges: [...new Set(latestRates.map(r => r.exchange))],
          oppCount: latestOpportunities.length,
          anomalyCount: latestAnomalies.length,
          predictions: latestPredictions.length,
          crossPair: latestCrossPair.length,
          errors: latestErrors,
        },
      },
    }));
  }
  ws.on('close', () => clients.delete(ws));
});

// ==================== REST API ====================

app.get('/api/rates', (req, res) => {
  let filtered = latestRates;
  if (req.query.exchange) filtered = filtered.filter(r => r.exchange === req.query.exchange);
  if (req.query.symbol) filtered = filtered.filter(r => r.symbol === req.query.symbol);
  res.json({ count: filtered.length, rates: filtered.slice(0, 300) });
});

app.get('/api/opportunities', (req, res) => {
  const minNet = parseFloat(req.query.minNet as string) || 0;
  res.json({ count: latestOpportunities.filter(o => o.netAnnualized >= minNet).length, opportunities: latestOpportunities.filter(o => o.netAnnualized >= minNet) });
});

app.get('/api/anomalies', (_req, res) => {
  res.json({ count: latestAnomalies.length, anomalies: latestAnomalies });
});

app.get('/api/predictions', (_req, res) => {
  res.json({ count: latestPredictions.length, predictions: latestPredictions });
});

app.get('/api/crosspair', (_req, res) => {
  res.json({ count: latestCrossPair.length, signals: latestCrossPair });
});

app.get('/api/stats', (_req, res) => {
  const dbStats = getDbStats();
  const uptime = Date.now() - startTime;
  res.json({
    status: 'ok',
    uptime: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m`,
    pollCount,
    totalRates: latestRates.length,
    exchanges: [...new Set(latestRates.map(r => r.exchange))],
    opportunities: latestOpportunities.length,
    anomalies: latestAnomalies.length,
    crossPair: latestCrossPair.length,
    wsClients: clients.size,
    lastPoll: lastPollTime ? new Date(lastPollTime).toISOString() : null,
    db: dbStats,
    errors: latestErrors,
  });
});

app.get('/api/paper/stats', (_req, res) => {
  res.json(getTradeStats());
});

app.post('/api/paper/open', (req, res) => {
  const { symbol, longEx, shortEx, spreadPct, notional } = req.body;
  if (!symbol || !longEx || !shortEx) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const pos = openPosition({ symbol, longEx, shortEx, spreadPct: spreadPct || 0.01, notional });
  res.json({ success: true, position: pos });
});

app.post('/api/backtest', (req, res) => {
  const params: BacktestParams = {
    strategy: req.body.strategy || 'PURE_CARRY',
    symbol: req.body.symbol || 'BTCUSDT',
    startTs: req.body.startTs || Date.now() - 30 * 86400000,
    endTs: req.body.endTs || Date.now(),
    initialCapital: req.body.initialCapital || 100000,
    feePerTrade: req.body.feePerTrade || 0.04,
    slippage: req.body.slippage || 0.02,
    maxPositionPct: req.body.maxPositionPct || 25,
    stopLoss: req.body.stopLoss || 2,
    takeProfit: req.body.takeProfit || 5,
    minSpread: req.body.minSpread || 0.01,
  };
  const rateA = generateSyntheticRates(params.symbol, 30, 0.0005, 0.0001);
  const rateB = generateSyntheticRates(params.symbol, 30, 0.0003, 0.0001);
  const result = runBacktest(rateA, rateB, params);
  res.json(result);
});

app.get('/api/backtest/strategies', (_req, res) => {
  res.json({
    strategies: [
      { id: 'PURE_CARRY', name: 'Pure Carry', desc: 'Capture funding rate spread, hold until convergence' },
      { id: 'MOMENTUM', name: 'Momentum', desc: 'Enter when spread is widening, exit when it peaks' },
      { id: 'MEAN_REVERSION', name: 'Mean Reversion', desc: 'Bet on spread returning to historical mean' },
      { id: 'COMPOUND', name: 'Compound', desc: 'Reinvest profits for exponential growth' },
    ],
  });
});

app.get('/api/history/opportunities', (req, res) => {
  const hours = parseInt(req.query.hours as string) || 24;
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({ hours, opportunities: getTopOpportunities(limit, hours) });
});

app.get('/api/history/anomalies', (req, res) => {
  const hours = parseInt(req.query.hours as string) || 24;
  res.json({ hours, summary: getAnomalySummary(hours) });
});

// ---- Kelly Criterion API ----

app.post('/api/kelly', (req, res) => {
  const { winRate, avgWin, avgLoss, spreadPct, capital } = req.body;
  const result = calcKelly({
    winRate: winRate || 0.5,
    avgWin: avgWin || 0.5,
    avgLoss: avgLoss || 0.3,
    currentSpread: spreadPct || 0.02,
    volatility: 0.01,
    maxDrawdownBudget: 5,
  }, capital || 100000);
  res.json(result);
});

// ---- Real Historical Data API ----

app.get('/api/history/rates/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const { rates, errors } = await fetchAllHistory(symbol);
  res.json({ symbol, count: rates.length, rates: rates.slice(-200), errors });
});

// ---- Real Backtest (uses historical data) ----

app.post('/api/backtest/real', async (req, res) => {
  const symbol = req.body.symbol || 'BTCUSDT';
  const strategy = req.body.strategy || 'PURE_CARRY';

  // Fetch real historical rates with timeout
  const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 20000));
  let rates: any[] = [];
  let errors: Record<string, string> = {};
  try {
    const result = await Promise.race([fetchAllHistory(symbol), timeout]) as any;
    rates = result.rates;
    errors = result.errors;
  } catch {
    errors.fetch = 'Timeout or error fetching history';
  }

  const binanceRates = rates.filter(r => r.exchange === 'Binance').map((r: any) => ({
    ts: r.fundingTime, rate: r.fundingRate, price: r.markPrice || 0,
  }));
  const bybitRates = rates.filter(r => r.exchange === 'Bybit').map((r: any) => ({
    ts: r.fundingTime, rate: r.fundingRate, price: 0,
  }));

  if (binanceRates.length < 10 || bybitRates.length < 10) {
    const rateA = generateSyntheticRates(symbol, 30, 0.0005, 0.0001);
    const rateB = generateSyntheticRates(symbol, 30, 0.0003, 0.0001);
    const result = runBacktest(rateA, rateB, {
      strategy, symbol,
      startTs: Date.now() - 30 * 86400000, endTs: Date.now(),
      initialCapital: req.body.initialCapital || 100000,
      feePerTrade: req.body.feePerTrade || 0.04,
      slippage: req.body.slippage || 0.02,
      maxPositionPct: req.body.maxPositionPct || 25,
    });
    return res.json({ ...result, dataSource: 'SYNTHETIC', errors });
  }

  const result = runBacktest(binanceRates, bybitRates, {
    strategy, symbol,
    startTs: binanceRates[0].ts, endTs: binanceRates[binanceRates.length - 1].ts,
    initialCapital: req.body.initialCapital || 100000,
    feePerTrade: req.body.feePerTrade || 0.04,
    slippage: req.body.slippage || 0.02,
    maxPositionPct: req.body.maxPositionPct || 25,
  });
  res.json({ ...result, dataSource: 'REAL', sampleSize: Math.min(binanceRates.length, bybitRates.length) });
});

// ---- Alert Config API ----

app.get('/api/alerts/config', (_req, res) => {
  res.json(alertConfig);
});

app.post('/api/alerts/config', (req, res) => {
  alertConfig = {
    ...alertConfig,
    ...req.body,
    telegram: req.body.telegram ? { ...alertConfig.telegram, ...req.body.telegram } : alertConfig.telegram,
    discord: req.body.discord ? { ...alertConfig.discord, ...req.body.discord } : alertConfig.discord,
    slack: req.body.slack ? { ...alertConfig.slack, ...req.body.slack } : alertConfig.slack,
  };
  res.json({ success: true, config: alertConfig });
});

app.post('/api/alerts/test', async (_req, res) => {
  await sendAlert(alertConfig, {
    type: 'OPPORTUNITY', symbol: 'TEST',
    severity: 80, title: 'Test Alert',
    message: 'Funding Mirror alert system is working!',
  });
  res.json({ success: true });
});

// ==================== STATIC ====================

const clientPublic = path.join(__dirname, '../../client/public');
app.use(express.static(clientPublic));
app.get('*', (_req, res) => res.sendFile(path.join(clientPublic, 'index.html')));

// ==================== START ====================

initDb();
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Funding Mirror Server v2.0');
  console.log('='.repeat(60));
  console.log(`  REST:      http://localhost:${PORT}/api`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`  Dashboard: http://localhost:${PORT}`);
  console.log(`  Exchanges: Binance / Bybit / OKX / Gate / Bitget`);
  console.log(`  Features: Arbitrage + Anomaly + Prediction + CrossPair + Backtest + Paper`);
  console.log('='.repeat(60));
});

poll();
setInterval(poll, POLL_INTERVAL);

process.on('SIGINT', () => { console.log('...'); server.close(() => process.exit(0)); });
