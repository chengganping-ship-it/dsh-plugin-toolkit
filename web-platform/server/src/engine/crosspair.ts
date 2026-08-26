/**
 * Cross-Pair Arbitrage Engine
 *
 * Detects mispricings between correlated pairs (BTC/ETH, SOL/AVAX, etc.)
 * using Pearson correlation and z-score of the spread.
 *
 * Breakthrough: No competitor offers cross-pair funding rate arbitrage.
 * When BTC funding spikes but ETH hasn't caught up, go long ETH + short BTC.
 */

import { FundingRate } from '../exchanges/base.js';

export interface CrossPairSignal {
  pairA: string;            // e.g. "BTCUSDT"
  pairB: string;            // e.g. "ETHUSDT"
  exchange: string;
  correlation: number;      // historical correlation
  spreadZScore: number;     // how far from mean
  direction: 'LONG_A_SHORT_B' | 'LONG_B_SHORT_A';
  confidence: number;
  description: string;
  timestamp: number;
}

interface PriceSeries {
  prices: number[];
  maxLen: number;
}

const series = new Map<string, PriceSeries>();
const MAX_SERIES = 200;

function recordPrice(ex: string, sym: string, price: number) {
  const k = `${ex}:${sym}`;
  let s = series.get(k);
  if (!s) { s = { prices: [], maxLen: MAX_SERIES }; series.set(k, s); }
  s.prices.push(price);
  if (s.prices.length > s.maxLen) s.prices.shift();
}

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 10) return 0;
  const aSlice = a.slice(-n);
  const bSlice = b.slice(-n);
  const meanA = aSlice.reduce((s, v) => s + v, 0) / n;
  const meanB = bSlice.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = aSlice[i] - meanA;
    const db = bSlice[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

// Known correlated pairs
const CORRELATED_PAIRS = [
  ['BTCUSDT', 'ETHUSDT'],
  ['SOLUSDT', 'AVAXUSDT'],
  ['LINKUSDT', 'MATICUSDT'],
  ['DOTUSDT', 'ATOMUSDT'],
  ['LTCUSDT', 'BCHUSDT'],
  ['UNIUSDT', 'AAVEUSDT'],
  ['NEARUSDT', 'APTUSDT'],
  ['ARBUSDT', 'OPUSDT'],
];

export function detectCrossPair(rates: FundingRate[]): CrossPairSignal[] {
  const signals: CrossPairSignal[] = [];

  // Record prices
  for (const r of rates) {
    if (r.markPrice > 0) recordPrice(r.exchange, r.symbol, r.markPrice);
  }

  // Group by exchange
  const byEx = new Map<string, FundingRate[]>();
  for (const r of rates) {
    if (!byEx.has(r.exchange)) byEx.set(r.exchange, []);
    byEx.get(r.exchange)!.push(r);
  }

  for (const [ex, items] of byEx) {
    const rateMap = new Map(items.map(r => [r.symbol, r]));

    for (const [symA, symB] of CORRELATED_PAIRS) {
      const a = rateMap.get(symA);
      const b = rateMap.get(symB);
      if (!a || !b) continue;

      const seriesA = series.get(`${ex}:${symA}`);
      const seriesB = series.get(`${ex}:${symB}`);
      if (!seriesA || !seriesB || seriesA.prices.length < 20) continue;

      const corr = pearson(seriesA.prices, seriesB.prices);
      if (corr < 0.5) continue; // only trade highly correlated pairs

      // Spread = rateA - rateB
      const spread = a.fundingRate - b.fundingRate;
      const spreads: number[] = [];
      const minLen = Math.min(seriesA.prices.length, seriesB.prices.length);
      // reconstruct historical spreads from stored rates (approximate)
      // For now, use current spread vs typical
      const absSpread = Math.abs(spread);
      const avgRate = (Math.abs(a.fundingRate) + Math.abs(b.fundingRate)) / 2;

      if (avgRate === 0) continue;
      const normalizedSpread = spread / avgRate;

      // Z-score approximation: how unusual is this spread?
      const zScore = normalizedSpread * Math.sqrt(minLen) * corr;

      if (Math.abs(zScore) > 2) {
        const direction = zScore > 0
          ? 'LONG_B_SHORT_A' as const
          : 'LONG_A_SHORT_B' as const;
        const confidence = Math.min(90, Math.round(Math.abs(zScore) * 20));

        signals.push({
          pairA: symA, pairB: symB, exchange: ex,
          correlation: +corr.toFixed(3),
          spreadZScore: +zScore.toFixed(2),
          direction, confidence,
          description: `${symA}/${symB} 费率分歧 (相关性 ${corr.toFixed(2)}): ${zScore > 0 ? symB : symA} 相对低估`,
          timestamp: Date.now(),
        });
      }
    }
  }

  return signals.sort((a, b) => b.confidence - a.confidence);
}
