/**
 * Anomaly Detection Engine
 *
 * Detects funding rate spikes, crashes, and regime changes
 * that often precede major volatility events.
 *
 * Breakthrough: No competitor offers real-time anomaly alerts
 * with statistical significance scoring.
 */

import { FundingRate } from '../exchanges/base.js';

export interface AnomalyEvent {
  symbol: string;
  exchange: string;
  type: 'SPIKE' | 'CRASH' | 'DIVERGENCE' | 'REGIME_CHANGE';
  severity: number;        // 0-100
  currentRate: number;
  baselineRate: number;    // rolling mean
  deviation: number;       // standard deviations from mean
  zScore: number;
  description: string;
  timestamp: number;
}

interface RateHistory {
  rates: number[];
  timestamps: number[];
  maxLen: number;
}

const histories = new Map<string, RateHistory>();

const MAX_HISTORY = 144; // ~12h at 5min intervals
const MIN_SAMPLES = 12;  // need at least 1h of data

function key(exchange: string, symbol: string): string {
  return `${exchange}:${symbol}`;
}

function recordRate(exchange: string, symbol: string, rate: number, ts: number) {
  const k = key(exchange, symbol);
  let h = histories.get(k);
  if (!h) {
    h = { rates: [], timestamps: [], maxLen: MAX_HISTORY };
    histories.set(k, h);
  }
  h.rates.push(rate);
  h.timestamps.push(ts);
  if (h.rates.length > h.maxLen) {
    h.rates.shift();
    h.timestamps.shift();
  }
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[], avg: number): number {
  if (arr.length < 2) return 0;
  const variance = arr.reduce((sum, v) => sum + (v - avg) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

export function detectAnomalies(rates: FundingRate[]): AnomalyEvent[] {
  const events: AnomalyEvent[] = [];

  for (const r of rates) {
    recordRate(r.exchange, r.symbol, r.fundingRate, r.fetchedAt);
    const k = key(r.exchange, r.symbol);
    const h = histories.get(k)!;

    if (h.rates.length < MIN_SAMPLES) continue;

    const avg = mean(h.rates);
    const sd = stdDev(h.rates, avg);
    if (sd === 0) continue;

    const zScore = (r.fundingRate - avg) / sd;
    const absZ = Math.abs(zScore);

    // Spike: rate suddenly much higher
    if (zScore > 3 && r.fundingRate > 0) {
      events.push({
        symbol: r.symbol, exchange: r.exchange,
        type: 'SPIKE',
        severity: Math.min(100, Math.round(absZ * 20)),
        currentRate: r.fundingRate, baselineRate: avg,
        deviation: r.fundingRate - avg, zScore,
        description: `${r.symbol} ${r.exchange} 费率飙升 ${zScore.toFixed(1)}σ 高于均值`,
        timestamp: r.fetchedAt,
      });
    }

    // Crash: rate suddenly much lower (or negative)
    if (zScore < -3) {
      events.push({
        symbol: r.symbol, exchange: r.exchange,
        type: 'CRASH',
        severity: Math.min(100, Math.round(absZ * 20)),
        currentRate: r.fundingRate, baselineRate: avg,
        deviation: r.fundingRate - avg, zScore,
        description: `${r.symbol} ${r.exchange} 费率闪崩 ${zScore.toFixed(1)}σ 低于均值`,
        timestamp: r.fetchedAt,
      });
    }

    // Regime change: sustained shift in mean
    if (h.rates.length >= 48) {
      const recent = h.rates.slice(-12);
      const older = h.rates.slice(-48, -36);
      const recentAvg = mean(recent);
      const olderAvg = mean(older);
      const recentSD = stdDev(recent, recentAvg);
      if (recentSD > 0) {
        const regimeZ = Math.abs(recentAvg - olderAvg) / recentSD;
        if (regimeZ > 2 && Math.abs(recentAvg - olderAvg) > Math.abs(olderAvg) * 0.5) {
          events.push({
            symbol: r.symbol, exchange: r.exchange,
            type: 'REGIME_CHANGE',
            severity: Math.min(100, Math.round(regimeZ * 15)),
            currentRate: r.fundingRate, baselineRate: olderAvg,
            deviation: recentAvg - olderAvg, zScore: regimeZ,
            description: `${r.symbol} ${r.exchange} 费率机制变化: ${olderAvg > 0 ? '+' : ''}${(olderAvg * 100).toFixed(4)}% → ${(recentAvg * 100).toFixed(4)}%`,
            timestamp: r.fetchedAt,
          });
        }
      }
    }
  }

  // Cross-exchange divergence: same symbol, very different rates
  const bySymbol = new Map<string, FundingRate[]>();
  for (const r of rates) {
    if (!bySymbol.has(r.symbol)) bySymbol.set(r.symbol, []);
    bySymbol.get(r.symbol)!.push(r);
  }
  for (const [symbol, items] of bySymbol) {
    if (items.length < 2) continue;
    const max = Math.max(...items.map(i => i.fundingRate));
    const min = Math.min(...items.map(i => i.fundingRate));
    const spread = max - min;
    if (spread > 0.002) { // > 0.2% difference
      const high = items.find(i => i.fundingRate === max)!;
      const low = items.find(i => i.fundingRate === min)!;
      events.push({
        symbol, exchange: `${high.exchange}/${low.exchange}`,
        type: 'DIVERGENCE',
        severity: Math.min(100, Math.round(spread * 5000)),
        currentRate: max, baselineRate: min,
        deviation: spread, zScore: spread / 0.001,
        description: `${symbol} 跨所费率分歧: ${high.exchange} ${(max * 100).toFixed(4)}% vs ${low.exchange} ${(min * 100).toFixed(4)}%`,
        timestamp: Date.now(),
      });
    }
  }

  return events.sort((a, b) => b.severity - a.severity);
}

export function getHistoryStats(exchange: string, symbol: string): { mean: number; stdDev: number; samples: number } | null {
  const h = histories.get(key(exchange, symbol));
  if (!h || h.rates.length < 2) return null;
  const m = mean(h.rates);
  return { mean: m, stdDev: stdDev(h.rates, m), samples: h.rates.length };
}
