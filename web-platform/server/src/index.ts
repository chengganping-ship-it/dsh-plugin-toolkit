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
import { TradeExecutor, ExchangeCredentials, OrderRequest } from './engine/executor.js';
import { predictML, MLPrediction, getModelState, getPredictionAccuracy, getPredictionHistory } from './engine/ml.js';
import { optimizePortfolio, PortfolioResult, getCorrelationMatrix, getRiskDecomposition } from './engine/portfolio.js';
import { detectRegime, RegimeState, getRegimeStats, getCurrentRegime } from './engine/regime.js';
import { fetchDeFiRates, findCrossDomainArbitrage, getDeFiSummary, CrossDomainArbitrage } from './engine/defi.js';
import { routeOrder, RouterDecision, RouterConfig, getRouterState, updateTradeState, updateRouterConfig, getRouterConfig } from './engine/router.js';
import { getAttribution, AttributionBreakdown, getAttributionMetrics, recordAttributionTrade, updateEquitySnapshot, getEquityCurve, PnLSnapshot } from './engine/attribution.js';
import { recordRequest, recordResponse, getHealthStatus, getUsageSummary, getOptimalPollIntervals, shouldPoll, getExchangeLimits, ExchangeHealth } from './engine/health.js';
import { evaluateStrategies, StrategySignal, Strategy, createStrategy, updateStrategy, deleteStrategy, getAllStrategies, getStrategyTemplates, toggleStrategy, getUserStrategies } from './engine/strategy.js';
import { configureBot, sendBotMessage, generateStatusReport, generateTopOpportunitiesReport, generateHealthReport, generateKellyResponse, generateRegimeReport, getBotConfig, getBotMessageLog } from './engine/bot.js';
import { calculateFees, FeeBreakdown, getFeeSchedule, getNetworkFees, calculateBreakeven, rankByNetProfitability } from './engine/fees.js';
import { addRateSample, calculateVolSurface, getVolComparison, detectVolRegimeChange, getVolSurfaceGrid, VolSurface } from './engine/volatility.js';
import { addAccount, removeAccount, listAccounts, getAggregatedPortfolio, getBalanceRecommendations, simulateBalanceUpdate, AggregatedPortfolio } from './engine/accounts.js';
import { aggregateYields, getTopYields, getYieldsByRisk, getYieldSummary, clearYieldCache, YieldOpportunity } from './engine/yield.js';
import { analyzeSentiment, getSentimentHistory, getCachedSentiment, clearSentimentCache, SentimentSummary, NewsItem } from './engine/sentiment.js';
import { getBestRoute, clearQuoteCache, DexQuote } from './engine/dexRouter.js';
import { generateApiKey, validateApiKey, checkPermission, listApiKeys, revokeApiKey, ApiKey } from './auth/auth.js';
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

// ==================== AUTH MIDDLEWARE ====================

function authMiddleware(requiredPerm: string = 'read') {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization || '';
    const apiKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : req.query.api_key as string;

    if (!apiKey) {
      // Allow read without auth in development
      if (process.env.NODE_ENV !== 'production' && requiredPerm === 'read') return next();
      return res.status(401).json({ error: 'API key required' });
    }

    const key = validateApiKey(apiKey);
    if (!key) return res.status(403).json({ error: 'Invalid API key or rate limited' });
    if (!checkPermission(key, requiredPerm)) return res.status(403).json({ error: 'Insufficient permissions' });

    (req as any).apiKey = key;
    next();
  };
}

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

// ==================== v4.0 ENGINE STATE ====================
let latestMLPredictions: MLPrediction[] = [];
let latestPortfolio: PortfolioResult | null = null;
let latestRegime: RegimeState | null = null;
let latestCrossDomain: CrossDomainArbitrage[] = [];
let defiRatesLoaded = false;

// ==================== v5.0 ENGINE STATE ====================
let latestRouterDecisions: RouterDecision[] = [];
let equityCurveData: PnLSnapshot[] = [];
let initialEquity = 100000;
let currentEquity = 100000;

// ==================== v6.0 ENGINE STATE ====================
let latestStrategySignals: StrategySignal[] = [];
let latestFeeBreakdowns: FeeBreakdown[] = [];
let latestVolSurface: VolSurface | null = null;
let aggregatedPortfolio: AggregatedPortfolio | null = null;
let botMessageCount = 0;

// ==================== v7.0 ENGINE STATE ====================
let latestYields: YieldOpportunity[] = [];
let lastYieldFetch = 0;
let latestSentiment: SentimentSummary | null = null;
let lastSentimentFetch = 0;
let latestDexQuote: DexQuote | null = null;

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

    // v4.0: ML ensemble prediction
    latestMLPredictions = predictML(rates, orderBooks).filter(p => p.confidence >= 40).slice(0, 15);

    // v4.0: Regime detection
    const regimeInput = latestOpportunities.slice(0, 30).map(o => ({
      spread: o.spreadPct / 100,
      volatility: 0.0003 + Math.random() * 0.0002,
      fundingRate: o.longRate,
    }));
    if (regimeInput.length >= 3) {
      latestRegime = detectRegime(regimeInput);
    }

    // v4.0: Portfolio optimization
    if (latestOpportunities.length >= 2) {
      const portfolioInput = latestOpportunities.slice(0, 10).map(o => ({
        symbol: o.symbol,
        longExchange: o.longEx,
        shortExchange: o.shortEx,
        spreadPct: o.spreadPct / 100,
        netAnnualized: o.netAnnualized / 100,
        volatility: 0.0003 + Math.random() * 0.0002,
        winRate: 0.55 + Math.random() * 0.1,
        sharpe: o.netAnnualized / 10,
      }));
      latestPortfolio = optimizePortfolio(portfolioInput, 100000);
      if (latestRegime) {
        // Apply regime risk multiplier
        for (const pos of latestPortfolio.positions) {
          pos.recommendedSize = Math.round(pos.recommendedSize * latestRegime.riskMultiplier);
          pos.kellyFraction = +(pos.kellyFraction * latestRegime.riskMultiplier).toFixed(3);
        }
        latestPortfolio.totalAllocation = latestPortfolio.positions.reduce((s, p) => s + p.recommendedSize, 0);
      }
    }

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

    // v4.0: Cross-domain arbitrage (DeFi vs CeFi)
    if (defiRatesLoaded) {
      latestCrossDomain = findCrossDomainArbitrage(
        latestRates.slice(0, 50).map(r => ({ symbol: r.symbol, fundingRate: r.fundingRate, exchange: r.exchange }))
      ).slice(0, 5);
    }

    // v5.0: Smart Order Router - fuse all signals into execution decisions
    const capMap = new Map<string, CapacityEstimate>();
    for (const opp of latestOpportunities.slice(0, 10)) {
      if (opp.capacity) {
        capMap.set(`${opp.longEx}:${opp.symbol}`, opp.capacity);
        capMap.set(`${opp.shortEx}:${opp.symbol}`, opp.capacity);
      }
    }
    const paperStats = getTradeStats();
    latestRouterDecisions = routeOrder(
      latestMLPredictions, latestPortfolio, latestRegime, capMap, paperStats.totalPnlPct
    );

    // v5.0: P&L tracking
    const totalPnl = paperStats.totalPnlPct / 100 * currentEquity;
    equityCurveData.push({
      timestamp: Date.now(),
      totalEquity: currentEquity + totalPnl,
      totalReturn: paperStats.totalPnlPct,
      unrealizedPnl: 0,
      realizedPnl: totalPnl,
      fundingEarned: 0,
      tradingPnl: totalPnl,
      fees: 0,
      drawdown: paperStats.maxDrawdown,
    });
    if (equityCurveData.length > 2000) equityCurveData.shift();
    currentEquity = initialEquity + totalPnl;

    // v6.0: Sample rates for volatility surface
    if (pollCount % 6 === 0) { // every ~2 min
      for (const r of latestRates.slice(0, 30)) {
        addRateSample(r.exchange, r.symbol, r.fundingRate, r.volume24h);
      }
    }

    // v6.0: Strategy evaluation
    if (latestOpportunities.length > 0) {
      const stratData = latestOpportunities.slice(0, 20).map(o => ({
        symbol: o.symbol,
        longEx: o.longEx,
        shortEx: o.shortEx,
        spreadPct: o.spreadPct / 100,
        netAnnualized: o.netAnnualized / 100,
        volatility: 0.0003,
        mlConfidence: 60,
        regime: latestRegime?.current || 'TRANSITION',
        momentumBps: Math.random() * 2,
        holdHours: 0,
        pnlPct: 0,
        drawdownPct: 0,
      }));
      latestStrategySignals = evaluateStrategies(stratData).slice(0, 10);
    }

    // v6.0: Fee analysis for top opportunities
    if (latestOpportunities.length > 0) {
      latestFeeBreakdowns = latestOpportunities.slice(0, 5).map(opp =>
        calculateFees({
          symbol: opp.symbol,
          longExchange: opp.longEx,
          shortExchange: opp.shortEx,
          spreadPct: opp.spreadPct / 100,
          size: 100000,
          fundingRate: opp.netAnnualized / 100,
        })
      );
    }

    // v6.0: Volatility surface for BTC every 5 min
    if (pollCount % 30 === 0) {
      latestVolSurface = calculateVolSurface('BTCUSDT', 'Binance');
    }

    // v6.0: Multi-account aggregation
    aggregatedPortfolio = getAggregatedPortfolio();

    // v7.0: Yield farm aggregation (every 5 minutes)
    if (pollCount % 10 === 0 || latestYields.length === 0) {
      try {
        const cexRates = latestOpportunities.slice(0, 10).map(o => ({
          symbol: o.symbol,
          rate: o.netAnnualized / 100 / 1095, // convert annual to per-8h
          exchange: o.longEx,
        }));
        latestYields = await aggregateYields(cexRates);
        lastYieldFetch = Date.now();
      } catch (e) {
        // Yield fetch failed, keep cached data
      }
    }

    // v7.0: Sentiment analysis (every 3 minutes)
    if (pollCount % 6 === 0 || !latestSentiment) {
      try {
        latestSentiment = await analyzeSentiment();
        lastSentimentFetch = Date.now();
      } catch (e) {
        // Sentiment fetch failed, keep cached data
      }
    }

    const elapsed = Date.now() - t0;
    const tradeActions = latestRouterDecisions.filter(d => d.action !== 'SKIP' && d.action !== 'WAIT').length;
    const strategyHits = latestStrategySignals.length;
    console.log(`[#${pollCount}] ${new Date().toLocaleTimeString('zh-CN')} | ${rates.length}rates | ${[...new Set(rates.map(r => r.exchange))].length}ex | ${latestOpportunities.length}opps | ML:${latestMLPredictions.length} Regime:${latestRegime?.current || '?'} Strat:${strategyHits} Router:${tradeActions} | ${elapsed}ms`);

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
  const tradeDecisions = latestRouterDecisions.filter(d => d.action !== 'SKIP' && d.action !== 'WAIT');
  const msg = JSON.stringify({
    type: 'snapshot', timestamp: Date.now(),
    data: {
      rates: latestRates.slice(0, 50),
      opportunities: latestOpportunities.slice(0, 25),
      anomalies: latestAnomalies.slice(0, 10),
      predictions: latestPredictions.slice(0, 15),
      crossPair: latestCrossPair.slice(0, 10),
      paperStats: getTradeStats(),
      mlPredictions: latestMLPredictions.slice(0, 10),
      regime: latestRegime,
      portfolio: latestPortfolio,
      crossDomain: latestCrossDomain.slice(0, 5),
      routerDecisions: tradeDecisions.slice(0, 5),
      equity: equityCurveData.slice(-50),
      health: getUsageSummary(),
      strategySignals: latestStrategySignals.slice(0, 5),
      feeBreakdown: latestFeeBreakdowns.slice(0, 3),
      volSurfacePoints: latestVolSurface?.points?.slice(0, 6) || [],
      yields: latestYields.slice(0, 12),
      sentiment: latestSentiment,
      dexQuote: latestDexQuote,
      stats: {
        totalRates: latestRates.length,
        exchanges: [...new Set(latestRates.map(r => r.exchange))],
        oppCount: latestOpportunities.length,
        anomalyCount: latestAnomalies.length,
        predictions: latestPredictions.length,
        crossPair: latestCrossPair.length,
        mlPredictions: latestMLPredictions.length,
        regime: latestRegime?.current || 'N/A',
        portfolioPositions: latestPortfolio?.positions.length || 0,
        crossDomain: latestCrossDomain.length,
        routerDecisions: tradeDecisions.length,
        currentEquity,
        strategySignals: latestStrategySignals.length,
        feeAnalyses: latestFeeBreakdowns.length,
        volSurfacePoints: latestVolSurface?.points?.length || 0,
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
    const tradeDecisions = latestRouterDecisions.filter(d => d.action !== 'SKIP' && d.action !== 'WAIT');
    ws.send(JSON.stringify({
      type: 'snapshot', timestamp: Date.now(),
      data: {
        rates: latestRates.slice(0, 50),
        opportunities: latestOpportunities.slice(0, 25),
        anomalies: latestAnomalies.slice(0, 10),
        predictions: latestPredictions.slice(0, 15),
        crossPair: latestCrossPair.slice(0, 10),
        paperStats: getTradeStats(),
        mlPredictions: latestMLPredictions.slice(0, 10),
        regime: latestRegime,
        portfolio: latestPortfolio,
        crossDomain: latestCrossDomain.slice(0, 5),
        routerDecisions: tradeDecisions.slice(0, 5),
        equity: equityCurveData.slice(-50),
        health: getUsageSummary(),
        yields: latestYields.slice(0, 12),
        sentiment: latestSentiment,
        dexQuote: latestDexQuote,
        stats: {
          totalRates: latestRates.length,
          exchanges: [...new Set(latestRates.map(r => r.exchange))],
          oppCount: latestOpportunities.length,
          anomalyCount: latestAnomalies.length,
          predictions: latestPredictions.length,
          crossPair: latestCrossPair.length,
          mlPredictions: latestMLPredictions.length,
          regime: latestRegime?.current || 'N/A',
          portfolioPositions: latestPortfolio?.positions.length || 0,
          crossDomain: latestCrossDomain.length,
          routerDecisions: tradeDecisions.length,
          currentEquity,
          errors: latestErrors,
        },
      },
    }));
  }
  ws.on('close', () => clients.delete(ws));
});

// ==================== REST API ====================

app.get('/api/rates', authMiddleware('read'), (req, res) => {
  let filtered = latestRates;
  if (req.query.exchange) filtered = filtered.filter(r => r.exchange === req.query.exchange);
  if (req.query.symbol) filtered = filtered.filter(r => r.symbol === req.query.symbol);
  res.json({ count: filtered.length, rates: filtered.slice(0, 300) });
});

app.get('/api/opportunities', authMiddleware('read'), (req, res) => {
  const minNet = parseFloat(req.query.minNet as string) || 0;
  res.json({ count: latestOpportunities.filter(o => o.netAnnualized >= minNet).length, opportunities: latestOpportunities.filter(o => o.netAnnualized >= minNet) });
});

app.get('/api/anomalies', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestAnomalies.length, anomalies: latestAnomalies });
});

app.get('/api/predictions', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestPredictions.length, predictions: latestPredictions });
});

app.get('/api/crosspair', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestCrossPair.length, signals: latestCrossPair });
});

// ---- v4.0: ML Predictions API ----

app.get('/api/v4/ml/predictions', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestMLPredictions.length, predictions: latestMLPredictions });
});

app.get('/api/v4/ml/model', authMiddleware('read'), (_req, res) => {
  res.json(getModelState());
});

app.get('/api/v4/ml/accuracy', authMiddleware('read'), (_req, res) => {
  res.json(getPredictionAccuracy());
});

app.get('/api/v4/ml/history/:symbol', authMiddleware('read'), (req, res) => {
  const exchange = req.query.exchange as string || 'Binance';
  res.json({ predictions: getPredictionHistory(req.params.symbol, exchange) });
});

// ---- v4.0: Portfolio Optimization API ----

app.get('/api/v4/portfolio', authMiddleware('read'), (_req, res) => {
  res.json(latestPortfolio || { positions: [], message: 'No data yet' });
});

app.post('/api/v4/portfolio/optimize', authMiddleware('read'), (req, res) => {
  const { opportunities, capital } = req.body;
  const result = optimizePortfolio(opportunities || [], capital || 100000);
  res.json(result);
});

app.get('/api/v4/portfolio/correlation', authMiddleware('read'), (_req, res) => {
  res.json(getCorrelationMatrix());
});

app.get('/api/v4/portfolio/risk', authMiddleware('read'), (_req, res) => {
  res.json({ decomposition: getRiskDecomposition() });
});

// ---- v4.0: Regime Detection API ----

app.get('/api/v4/regime', authMiddleware('read'), (_req, res) => {
  res.json(latestRegime || { current: 'TRANSITION', message: 'No data yet' });
});

app.get('/api/v4/regime/stats', authMiddleware('read'), (_req, res) => {
  res.json(getRegimeStats());
});

// ---- v4.0: Cross-Domain Arbitrage (DeFi vs CeFi) API ----

app.get('/api/v4/defi/rates', authMiddleware('read'), (_req, res) => {
  res.json({ rates: cachedDeFiRates, summary: getDeFiSummary() });
});

app.get('/api/v4/defi/arbitrage', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestCrossDomain.length, opportunities: latestCrossDomain });
});

app.post('/api/v4/defi/refresh', authMiddleware('write'), async (_req, res) => {
  try {
    await fetchDeFiRates();
    defiRatesLoaded = true;
    res.json({ success: true, count: cachedDeFiRates.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', authMiddleware('read'), (_req, res) => {
  const dbStats = getDbStats();
  const uptime = Date.now() - startTime;
  const tradeDecisions = latestRouterDecisions.filter(d => d.action !== 'SKIP' && d.action !== 'WAIT');
  res.json({
    status: 'ok',
    version: '5.0',
    uptime: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m`,
    pollCount,
    totalRates: latestRates.length,
    exchanges: [...new Set(latestRates.map(r => r.exchange))],
    opportunities: latestOpportunities.length,
    anomalies: latestAnomalies.length,
    crossPair: latestCrossPair.length,
    mlPredictions: latestMLPredictions.length,
    regime: latestRegime?.current || 'N/A',
    portfolioPositions: latestPortfolio?.positions.length || 0,
    crossDomain: latestCrossDomain.length,
    routerDecisions: tradeDecisions.length,
    currentEquity,
    health: getUsageSummary(),
    wsClients: clients.size,
    lastPoll: lastPollTime ? new Date(lastPollTime).toISOString() : null,
    db: dbStats,
    errors: latestErrors,
  });
});

app.get('/api/paper/stats', authMiddleware('read'), (_req, res) => {
  res.json(getTradeStats());
});

app.post('/api/paper/open', (req, res) => {
  const { symbol, longEx, shortEx, spreadPct, notional } = req.body;
  if (!symbol || !longEx || !shortEx) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const pos = openPosition({ symbol, longEx, shortEx, spreadPct: spreadPct || 0.01, notional });
  updateTradeState(symbol, 'OPEN', { size: notional || 10000, longEx, shortEx });
  res.json({ success: true, position: pos });
});

// ---- v5.0: Smart Order Router API ----

app.get('/api/v5/router/decisions', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestRouterDecisions.length, decisions: latestRouterDecisions });
});

app.get('/api/v5/router/state', authMiddleware('read'), (_req, res) => {
  res.json(getRouterState());
});

app.get('/api/v5/router/config', authMiddleware('read'), (_req, res) => {
  res.json(getRouterConfig());
});

app.post('/api/v5/router/config', authMiddleware('write'), (req, res) => {
  const updated = updateRouterConfig(req.body);
  res.json({ success: true, config: updated });
});

// ---- v5.0: P&L Attribution API ----

app.get('/api/v5/attribution', authMiddleware('read'), (_req, res) => {
  res.json(getAttribution());
});

app.get('/api/v5/attribution/metrics', authMiddleware('read'), (_req, res) => {
  res.json(getAttributionMetrics());
});

app.get('/api/v5/equity', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json({ equity: getEquityCurve(limit), currentEquity, initialEquity });
});

// ---- v5.0: Health & Rate Limit API ----

app.get('/api/v5/health', authMiddleware('read'), (_req, res) => {
  res.json({ exchanges: getHealthStatus(), summary: getUsageSummary() });
});

app.get('/api/v5/health/limits', authMiddleware('read'), (_req, res) => {
  res.json(getExchangeLimits());
});

app.get('/api/v5/health/intervals', authMiddleware('read'), (req, res) => {
  const vol = parseFloat(req.query.volatility as string) || 0.5;
  res.json({ intervals: getOptimalPollIntervals(vol) });
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

// ---- v6.0: Custom Strategy Builder API ----

app.get('/api/v6/strategies', authMiddleware('read'), (_req, res) => {
  res.json({ strategies: getAllStrategies() });
});

app.get('/api/v6/strategies/templates', authMiddleware('read'), (_req, res) => {
  res.json({ templates: getStrategyTemplates() });
});

app.post('/api/v6/strategies', authMiddleware('write'), (req, res) => {
  const strategy = createStrategy(req.body);
  res.json({ success: true, strategy });
});

app.put('/api/v6/strategies/:id', authMiddleware('write'), (req, res) => {
  const updated = updateStrategy(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Strategy not found' });
  res.json({ success: true, strategy: updated });
});

app.delete('/api/v6/strategies/:id', authMiddleware('admin'), (req, res) => {
  const deleted = deleteStrategy(req.params.id);
  res.json({ success: deleted });
});

app.post('/api/v6/strategies/:id/toggle', authMiddleware('write'), (req, res) => {
  const enabled = req.body.enabled !== false;
  const result = toggleStrategy(req.params.id, enabled);
  if (!result) return res.status(404).json({ error: 'Strategy not found' });
  res.json({ success: true, strategy: result });
});

app.get('/api/v6/strategies/signals', authMiddleware('read'), (_req, res) => {
  res.json({ count: latestStrategySignals.length, signals: latestStrategySignals });
});

// ==================== v7.0: Yield Farm Aggregator API ====================

app.get('/api/v7/yields', authMiddleware('read'), (_req, res) => {
  res.json({
    count: latestYields.length,
    updatedAt: lastYieldFetch,
    yields: latestYields,
    summary: getYieldSummary(),
  });
});

app.get('/api/v7/yields/top', authMiddleware('read'), (req, res) => {
  const n = parseInt(req.query.n as string) || 10;
  res.json({ yields: getTopYields(n) });
});

app.get('/api/v7/yields/safe', authMiddleware('read'), (req, res) => {
  const maxRisk = parseInt(req.query.maxRisk as string) || 50;
  res.json({ yields: getYieldsByRisk(maxRisk) });
});

app.post('/api/v7/yields/refresh', authMiddleware('write'), async (_req, res) => {
  clearYieldCache();
  const cexRates = latestOpportunities.slice(0, 10).map(o => ({
    symbol: o.symbol,
    rate: o.netAnnualized / 100 / 1095,
    exchange: o.longEx,
  }));
  latestYields = await aggregateYields(cexRates);
  lastYieldFetch = Date.now();
  res.json({ success: true, count: latestYields.length });
});

// ==================== v7.0: Sentiment Analysis API ====================

app.get('/api/v7/sentiment', authMiddleware('read'), (_req, res) => {
  res.json({
    sentiment: latestSentiment,
    updatedAt: lastSentimentFetch,
  });
});

app.get('/api/v7/sentiment/history', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ history: getSentimentHistory(limit) });
});

app.get('/api/v7/sentiment/news', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const news = latestSentiment ? [...(latestSentiment.topPositive || []), ...(latestSentiment.topNegative || [])] : [];
  res.json({ count: news.length, news: news.slice(0, limit) });
});

app.post('/api/v7/sentiment/refresh', authMiddleware('write'), async (_req, res) => {
  clearSentimentCache();
  try {
    latestSentiment = await analyzeSentiment();
    lastSentimentFetch = Date.now();
    res.json({ success: true, sentiment: latestSentiment });
  } catch (e) {
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

// ==================== v7.0: DEX Router API ====================

app.get('/api/v7/dex/quote', authMiddleware('read'), async (req, res) => {
  try {
    const { from, to, amount, chain, slippage } = req.query;
    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required params: from, to, amount' });
    }
    const quote = await getBestRoute({
      fromToken: from as string,
      toToken: to as string,
      amount: parseFloat(amount as string),
      chain: (chain as string) || 'Ethereum',
      maxSlippage: parseFloat(slippage as string) || 0.5,
    });
    latestDexQuote = quote;
    res.json(quote);
  } catch (e) {
    res.status(500).json({ error: 'Failed to get DEX quote', message: String(e) });
  }
});

app.get('/api/v7/dex/latest', authMiddleware('read'), (_req, res) => {
  res.json({ quote: latestDexQuote });
});

app.post('/api/v7/dex/clear-cache', authMiddleware('write'), (_req, res) => {
  clearQuoteCache();
  res.json({ success: true });
});

// ---- v6.0: Telegram/Discord Bot API ----

app.post('/api/v6/bot/configure', authMiddleware('write'), (req, res) => {
  const config = configureBot(req.body);
  res.json({ success: true, config: getBotConfig() });
});

app.get('/api/v6/bot/config', authMiddleware('read'), (_req, res) => {
  res.json(getBotConfig());
});

app.post('/api/v6/bot/send', authMiddleware('write'), async (req, res) => {
  const sent = await sendBotMessage(req.body.message || 'Funding Mirror test');
  botMessageCount++;
  res.json({ success: sent, totalSent: botMessageCount });
});

app.get('/api/v6/bot/log', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 20;
  res.json({ log: getBotMessageLog(limit) });
});

// ---- v6.0: Fee Calculator API ----

app.get('/api/v6/fees/calculate', authMiddleware('read'), (req, res) => {
  const { symbol, longEx, shortEx, spreadPct, size } = req.query;
  if (!symbol || !longEx || !shortEx) {
    return res.status(400).json({ error: 'Missing required params' });
  }
  const breakdown = calculateFees({
    symbol: symbol as string,
    longExchange: longEx as string,
    shortExchange: shortEx as string,
    spreadPct: parseFloat(spreadPct as string) / 100 || 0.02,
    size: parseFloat(size as string) || 100000,
    fundingRate: 0.05,
  });
  res.json(breakdown);
});

app.get('/api/v6/fees/ranking', authMiddleware('read'), (_req, res) => {
  const ranked = rankByNetProfitability(latestOpportunities.slice(0, 10).map(o => ({
    symbol: o.symbol, longExchange: o.longEx, shortExchange: o.shortEx,
    spreadPct: o.spreadPct, netAnnualized: o.netAnnualized,
  })));
  res.json({ count: ranked.length, rankings: ranked });
});

app.get('/api/v6/fees/networks', authMiddleware('read'), (_req, res) => {
  res.json({ networks: getNetworkFees() });
});

app.get('/api/v6/fees/schedule/:exchange', authMiddleware('read'), (req, res) => {
  res.json(getFeeSchedule(req.params.exchange));
});

// ---- v6.0: Volatility Surface API ----

app.get('/api/v6/volatility/:symbol', authMiddleware('read'), (req, res) => {
  const exchange = req.query.exchange as string || 'Binance';
  res.json(calculateVolSurface(req.params.symbol, exchange));
});

app.get('/api/v6/volatility/:symbol/grid', authMiddleware('read'), (req, res) => {
  res.json(getVolSurfaceGrid(req.params.symbol));
});

app.get('/api/v6/volatility/compare', authMiddleware('read'), (req, res) => {
  const symbols = (req.query.symbols as string || 'BTCUSDT,ETHUSDT,SOLUSDT').split(',');
  const horizon = req.query.horizon as string || '4h';
  res.json({ comparison: getVolComparison(symbols, horizon) });
});

app.get('/api/v6/volatility/:symbol/regime', authMiddleware('read'), (req, res) => {
  res.json(detectVolRegimeChange(req.params.symbol, req.query.exchange as string || 'Binance'));
});

// ---- v6.0: Multi-Account Management API ----

app.get('/api/v6/accounts', authMiddleware('read'), (_req, res) => {
  res.json({ accounts: listAccounts(), portfolio: aggregatedPortfolio });
});

app.post('/api/v6/accounts', authMiddleware('write'), (req, res) => {
  const account = addAccount(req.body);
  res.json({ success: true, account: { id: account.id, name: account.name, exchange: account.exchange } });
});

app.delete('/api/v6/accounts/:id', authMiddleware('admin'), (req, res) => {
  const deleted = removeAccount(req.params.id);
  res.json({ success: deleted });
});

app.get('/api/v6/accounts/portfolio', authMiddleware('read'), (_req, res) => {
  res.json(aggregatedPortfolio || { accounts: [], netExposure: [], alerts: [] });
});

app.get('/api/v6/accounts/recommendations', authMiddleware('read'), (_req, res) => {
  res.json({ recommendations: getBalanceRecommendations() });
});

// Store exchange credentials per session (in production: encrypted DB)
const exchangeCreds = new Map<string, ExchangeCredentials>();

app.post('/api/trade/credentials', authMiddleware('trade'), (req, res) => {
  const { exchange, apiKey, secretKey, passphrase, testnet } = req.body;
  if (!exchange || !apiKey || !secretKey) {
    return res.status(400).json({ error: 'Missing credentials' });
  }
  const creds: ExchangeCredentials = {
    exchange,
    apiKey,
    secretKey,
    passphrase,
    testnet: testnet !== false,
  };
  exchangeCreds.set(exchange, creds);
  res.json({ success: true, exchange, testnet: creds.testnet });
});

app.get('/api/trade/positions', authMiddleware('read'), (_req, res) => {
  res.json({ positions: TradeExecutor.getPositions() });
});

app.get('/api/trade/orders', authMiddleware('read'), (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json({ orders: TradeExecutor.getOrderHistory(limit) });
});

app.post('/api/trade/order', authMiddleware('trade'), async (req, res) => {
  const { exchange, symbol, side, quantity, type, price } = req.body;
  const creds = exchangeCreds.get(exchange);
  if (!creds) {
    return res.status(400).json({ error: `No credentials for ${exchange}. POST /api/trade/credentials first.` });
  }

  try {
    const order: OrderRequest = { symbol, side, quantity, type: type || 'MARKET', price };
    const result = await TradeExecutor.executeOrder(creds, order);
    res.json({ success: true, order: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trade/arbitrage/open', authMiddleware('trade'), async (req, res) => {
  const { symbol, longEx, shortEx, quantityUsdt, longPrice, shortPrice } = req.body;
  const longCreds = exchangeCreds.get(longEx);
  const shortCreds = exchangeCreds.get(shortEx);

  if (!longCreds || !shortCreds) {
    return res.status(400).json({ error: 'Missing exchange credentials' });
  }

  try {
    const result = await TradeExecutor.openArbitragePosition(
      longCreds, shortCreds, symbol, quantityUsdt, longPrice, shortPrice
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trade/arbitrage/close', authMiddleware('trade'), async (req, res) => {
  const { symbol, longEx, shortEx, longQty, shortQty } = req.body;
  const longCreds = exchangeCreds.get(longEx);
  const shortCreds = exchangeCreds.get(shortEx);

  if (!longCreds || !shortCreds) {
    return res.status(400).json({ error: 'Missing exchange credentials' });
  }

  try {
    const result = await TradeExecutor.closeArbitragePosition(
      longCreds, shortCreds, symbol, longQty, shortQty
    );
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== AUTH MANAGEMENT ====================

app.post('/api/auth/keys', authMiddleware('admin'), (req, res) => {
  const { name, permissions } = req.body;
  const apiKey = generateApiKey(name || 'user', permissions || ['read']);
  res.json({ success: true, apiKey: apiKey.key, permissions: apiKey.permissions });
});

app.get('/api/auth/keys', authMiddleware('admin'), (_req, res) => {
  res.json({ keys: listApiKeys() });
});

app.delete('/api/auth/keys/:prefix', authMiddleware('admin'), (req, res) => {
  const success = revokeApiKey(req.params.prefix);
  res.json({ success });
});

// ==================== STATIC ====================

const clientPublic = path.join(__dirname, '../../client/public');
app.use(express.static(clientPublic));
app.get('*', (_req, res) => res.sendFile(path.join(clientPublic, 'index.html')));

// ==================== START ====================

let cachedDeFiRates: any[] = [];

async function loadDeFiRates() {
  try {
    const rates = await fetchDeFiRates();
    cachedDeFiRates = rates;
    defiRatesLoaded = true;
    console.log(`  DeFi rates loaded: ${rates.length} pools`);
  } catch (e) {
    console.log('  DeFi rates: using fallback data');
    defiRatesLoaded = true;
  }
}

initDb();
loadDeFiRates();
server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Funding Mirror Server v5.0');
  console.log('  Smart Router + Auto-Execution + P&L Attribution + Health');
  console.log('='.repeat(60));
  console.log(`  REST:      http://localhost:${PORT}/api`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`  Dashboard: http://localhost:${PORT}`);
  console.log(`  Exchanges: Binance / Bybit / OKX / Gate / Bitget`);
  console.log(`  Engines:  Arbitrage / Anomaly / Predict / Capacity / CrossPair`);
  console.log(`            Backtest / Paper / Risk / Alerts / Executor`);
  console.log(`  v4.0:     ML Ensemble / Portfolio Kelly / Regime / DeFi`);
  console.log(`  v5.0:     Smart Router / P&L Attribution / Health Monitor`);
  console.log('='.repeat(60));
});

poll();
setInterval(poll, POLL_INTERVAL);

process.on('SIGINT', () => { console.log('...'); server.close(() => process.exit(0)); });
