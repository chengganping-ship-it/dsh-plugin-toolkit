/**
 * Funding Rate Prediction Engine
 *
 * Predicts next funding rate direction using:
 * 1. Order book imbalance (bid/ask pressure)
 * 2. Rate momentum (recent trajectory)
 * 3. Mean reversion from rolling average
 *
 * Breakthrough: No competitor predicts funding rate direction
 * before it's set. This gives traders a head start.
 */

import { FundingRate, OrderBook } from '../exchanges/base.js';

export interface Prediction {
  symbol: string;
  exchange: string;
  currentRate: number;
  predictedRate: number;
  direction: 'INCREASING' | 'DECREASING' | 'STABLE';
  confidence: number;
  factors: string[];
  timestamp: number;
}

interface RateWindow {
  rates: number[];
  timestamps: number[];
}

const windows = new Map<string, RateWindow>();
const MAX_WINDOW = 48;

function winKey(ex: string, sym: string) { return `${ex}:${sym}`; }

function record(ex: string, sym: string, rate: number, ts: number) {
  const k = winKey(ex, sym);
  let w = windows.get(k);
  if (!w) { w = { rates: [], timestamps: [] }; windows.set(k, w); }
  w.rates.push(rate);
  w.timestamps.push(ts);
  if (w.rates.length > MAX_WINDOW) { w.rates.shift(); w.timestamps.shift(); }
}

function momentum(rates: number[]): number {
  if (rates.length < 6) return 0;
  const recent = rates.slice(-3);
  const older = rates.slice(-6, -3);
  const rAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const oAvg = older.reduce((a, b) => a + b, 0) / older.length;
  return rAvg - oAvg;
}

function orderBookImbalance(ob: OrderBook): number {
  if (!ob.bids.length || !ob.asks.length) return 0;
  const bidVol = ob.bids.slice(0, 5).reduce((s, l) => s + l.size, 0);
  const askVol = ob.asks.slice(0, 5).reduce((s, l) => s + l.size, 0);
  const total = bidVol + askVol;
  if (total === 0) return 0;
  return (bidVol - askVol) / total;
}

export function predictRates(
  rates: FundingRate[],
  orderBooks: Map<string, OrderBook>
): Prediction[] {
  const predictions: Prediction[] = [];

  for (const r of rates) {
    record(r.exchange, r.symbol, r.fundingRate, r.fetchedAt);
    const k = winKey(r.exchange, r.symbol);
    const w = windows.get(k)!;

    if (w.rates.length < 6) continue;

    const factors: string[] = [];
    let predictedDelta = 0;
    let confidence = 30;

    // Factor 1: Momentum
    const mom = momentum(w.rates);
    if (Math.abs(mom) > 0.0001) {
      predictedDelta += mom * 0.6;
      confidence += 15;
      factors.push(`momentum: ${mom > 0 ? 'up' : 'down'} (${(mom * 100).toFixed(5)}%)`);
    }

    // Factor 2: Order book pressure
    const obKey = `${r.exchange}:${r.symbol}`;
    const ob = orderBooks.get(obKey);
    if (ob) {
      const imb = orderBookImbalance(ob);
      const obEffect = imb * 0.0002;
      predictedDelta += obEffect;
      confidence += 20;
      factors.push(`book: ${imb > 0.1 ? 'buy' : imb < -0.1 ? 'sell' : 'neutral'} (${(imb * 100).toFixed(1)}%)`);
    }

    // Factor 3: Mean reversion
    const avg = w.rates.reduce((a, b) => a + b, 0) / w.rates.length;
    const deviation = r.fundingRate - avg;
    if (Math.abs(deviation) > 0.001) {
      predictedDelta -= deviation * 0.3;
      confidence += 10;
      factors.push(`reversion: dev ${(deviation * 100).toFixed(4)}% from mean`);
    }

    const predictedRate = r.fundingRate + predictedDelta;
    const change = predictedRate - r.fundingRate;
    let direction: Prediction['direction'] = 'STABLE';
    if (Math.abs(change) > 0.00005) {
      direction = change > 0 ? 'INCREASING' : 'DECREASING';
    }

    predictions.push({
      symbol: r.symbol, exchange: r.exchange,
      currentRate: r.fundingRate,
      predictedRate,
      direction,
      confidence: Math.min(95, Math.max(10, confidence)),
      factors,
      timestamp: Date.now(),
    });
  }

  return predictions.sort((a, b) => b.confidence - a.confidence);
}
