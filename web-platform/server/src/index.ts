/**
 * Funding Mirror Web Server
 *
 * REST API + WebSocket for real-time arbitrage monitoring
 * Features: 5 exchanges, anomaly detection, prediction, capacity estimation
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fetchAllRates, fetchBinance, fetchBinanceOrderBook, fetchBybit, fetchBybitOrderBook, FundingRate, OrderBook } from './exchanges/base.js';
import { detectAnomalies, AnomalyEvent } from './engine/anomaly.js';
import { predictRates, Prediction } from './engine/predictor.js';
import { estimateCapacity, CapacityEstimate } from './engine/capacity.js';
import * as path from 'path';
import * as url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 8771;
const POLL_INTERVAL = 30000; // 30s

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json());

// ==================== STATE ====================

interface ArbitrageOpportunity {
  symbol: string;
  longEx: string;
  shortEx: string;
  spreadPct: number;
  netAnnualized: number;
  longRate: number;
  shortRate: number;
  riskScore: number;
  capacity?: CapacityEstimate;
}

let latestRates: FundingRate[] = [];
let latestOpportunities: ArbitrageOpportunity[] = [];
let latestAnomalies: AnomalyEvent[] = [];
let latestPredictions: Prediction[] = [];
let latestErrors: Record<string, string> = {};
let lastPollTime = 0;
let pollCount = 0;
let startTime = Date.now();

// ==================== POLLING LOOP ====================

async function poll() {
  pollCount++;
  const t0 = Date.now();

  try {
    const { rates, errors } = await fetchAllRates();
    latestRates = rates;
    latestErrors = errors;
    lastPollTime = Date.now();

    // Detect anomalies
    latestAnomalies = detectAnomalies(rates);

    // Calculate opportunities
    latestOpportunities = findOpportunities(rates);

    // Fetch order books for top symbols (for prediction + capacity)
    const topSymbols = [...new Set(latestOpportunities.slice(0, 5).map(o => o.symbol))];
    const orderBooks = new Map<string, OrderBook>();

    for (const sym of topSymbols.slice(0, 3)) {
      const [bb, bob] = await Promise.allSettled([
        fetchBinanceOrderBook(sym),
        fetchBybitOrderBook(sym),
      ]);
      if (bb.status === 'fulfilled') orderBooks.set(`Binance:${sym}`, bb.value);
      if (bob.status === 'fulfilled') orderBooks.set(`Bybit:${sym}`, bob.value);
    }

    // Run prediction engine
    latestPredictions = predictRates(rates, orderBooks)
      .filter(p => p.confidence >= 50)
      .slice(0, 20);

    // Calculate capacity for top opportunities
    for (const opp of latestOpportunities.slice(0, 5)) {
      const longBook = orderBooks.get(`${opp.longEx}:${opp.symbol}`);
      const shortBook = orderBooks.get(`${opp.shortEx}:${opp.symbol}`);
      opp.capacity = estimateCapacity(opp.symbol, opp.longEx, opp.shortEx, opp.spreadPct, longBook, shortBook);
    }

    const elapsed = Date.now() - t0;
    console.log(`[#${pollCount}] ${new Date().toLocaleTimeString('zh-CN')} | ${rates.length} rates across ${new Set(rates.map(r => r.exchange)).size} exchanges | ${latestOpportunities.length} opps | ${latestAnomalies.length} anomalies | ${elapsed}ms`);

    // Broadcast to WebSocket clients
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
  const PERIODS_PER_YEAR = 365 * 3;
  const FEE_PER_PERIOD = 0.08;

  for (const [symbol, items] of bySymbol) {
    if (items.length < 2) continue;
    let bestSpread = 0;
    let bestLong: FundingRate | null = null;
    let bestShort: FundingRate | null = null;

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const spread = items[i].fundingRate - items[j].fundingRate;
        if (spread > bestSpread) {
          bestSpread = spread;
          bestLong = items[i];
          bestShort = items[j];
        }
      }
    }

    if (!bestLong || !bestShort) continue;
    const spreadPct = bestSpread * 100;
    const netAnnualized = spreadPct * PERIODS_PER_YEAR - FEE_PER_PERIOD * PERIODS_PER_YEAR;

    if (spreadPct > 0.005 && netAnnualized > 0) {
      // Risk score
      let risk = 50;
      if (spreadPct > 0.05) risk -= 20;
      if (bestLong.openInterest > 1e8 && bestShort.openInterest > 1e8) risk -= 10;
      if (Math.abs(bestLong.fundingRate) > 0.005 || Math.abs(bestShort.fundingRate) > 0.005) risk += 15;

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
    type: 'snapshot',
    timestamp: Date.now(),
    data: {
      rates: latestRates.slice(0, 50),
      opportunities: latestOpportunities.slice(0, 20),
      anomalies: latestAnomalies.slice(0, 10),
      predictions: latestPredictions.slice(0, 15),
      stats: {
        totalRates: latestRates.length,
        exchanges: [...new Set(latestRates.map(r => r.exchange))],
        oppCount: latestOpportunities.length,
        anomalyCount: latestAnomalies.length,
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
  console.log(`  Client connected (${clients.size} total)`);
  // Send current state immediately
  if (latestRates.length > 0) {
    ws.send(JSON.stringify({
      type: 'snapshot',
      timestamp: Date.now(),
      data: {
        rates: latestRates.slice(0, 50),
        opportunities: latestOpportunities.slice(0, 20),
        anomalies: latestAnomalies.slice(0, 10),
        predictions: latestPredictions.slice(0, 15),
        stats: {
          totalRates: latestRates.length,
          exchanges: [...new Set(latestRates.map(r => r.exchange))],
          oppCount: latestOpportunities.length,
          anomalyCount: latestAnomalies.length,
          errors: latestErrors,
        },
      },
    }));
  }
  ws.on('close', () => { clients.delete(ws); });
});

// ==================== REST API ====================

app.get('/api/rates', (req, res) => {
  const exchange = req.query.exchange as string;
  const symbol = req.query.symbol as string;
  let filtered = latestRates;
  if (exchange) filtered = filtered.filter(r => r.exchange === exchange);
  if (symbol) filtered = filtered.filter(r => r.symbol === symbol);
  res.json({ count: filtered.length, rates: filtered.slice(0, 200) });
});

app.get('/api/opportunities', (req, res) => {
  const minNet = parseFloat(req.query.minNet as string) || 0;
  const filtered = latestOpportunities.filter(o => o.netAnnualized >= minNet);
  res.json({ count: filtered.length, opportunities: filtered });
});

app.get('/api/anomalies', (_req, res) => {
  res.json({ count: latestAnomalies.length, anomalies: latestAnomalies });
});

app.get('/api/predictions', (_req, res) => {
  res.json({ count: latestPredictions.length, predictions: latestPredictions });
});

app.get('/api/stats', (_req, res) => {
  const uptime = Date.now() - startTime;
  res.json({
    status: 'ok',
    uptime: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m`,
    pollCount,
    totalRates: latestRates.length,
    exchanges: [...new Set(latestRates.map(r => r.exchange))],
    opportunities: latestOpportunities.length,
    anomalies: latestAnomalies.length,
    predictions: latestPredictions.length,
    wsClients: clients.size,
    lastPoll: lastPollTime ? new Date(lastPollTime).toISOString() : null,
    errors: latestErrors,
  });
});

// ==================== STATIC DASHBOARD ====================

const clientDist = path.join(__dirname, '../../client/public');
app.use(express.static(clientDist));

app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

// ==================== START ====================

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  Funding Mirror Server');
  console.log('='.repeat(60));
  console.log(`  REST API:  http://localhost:${PORT}/api`);
  console.log(`  WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`  Dashboard: http://localhost:${PORT}`);
  console.log(`  Exchanges: Binance / Bybit / OKX / Gate / Bitget`);
  console.log(`  Poll interval: ${POLL_INTERVAL / 1000}s`);
  console.log('='.repeat(60));
});

// Initial poll
poll();
setInterval(poll, POLL_INTERVAL);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});
