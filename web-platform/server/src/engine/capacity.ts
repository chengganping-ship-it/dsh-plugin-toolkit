/**
 * Capacity Estimator
 *
 * Estimates how much capital can be deployed before
 * the spread compresses, based on order book depth.
 *
 * Breakthrough: No competitor tells you "you can deploy $X
 * before the opportunity disappears." This is the difference
 * between theoretical and actual profit.
 */

import { OrderBook, OrderBookLevel } from '../exchanges/base.js';

export interface CapacityEstimate {
  symbol: string;
  longExchange: string;
  shortExchange: string;
  maxCapacityUsd: number;    // max notional before slippage > spread
  slippageAtCapacity: number;
  spreadCapturePct: number;  // how much of spread you'd capture
  recommendedSize: number;   // conservative 50% of max
  depthQuality: 'DEEP' | 'MODERATE' | 'THIN';
}

function estimateSlippage(levels: OrderBookLevel[], notionalUsd: number, side: 'buy' | 'sell'): number {
  let remaining = notionalUsd;
  let totalCost = 0;
  let totalSize = 0;

  for (const level of levels) {
    const levelValue = level.price * level.size;
    if (remaining <= 0) break;

    const take = Math.min(remaining, levelValue);
    const sizeTaken = take / level.price;
    totalCost += take;
    totalSize += sizeTaken;
    remaining -= take;
  }

  if (totalSize === 0) return 1;
  const avgPrice = totalCost / totalSize;
  const edgePrice = levels[0].price;
  const slippage = side === 'buy'
    ? (avgPrice - edgePrice) / edgePrice
    : (edgePrice - avgPrice) / edgePrice;
  return Math.max(0, slippage);
}

export function estimateCapacity(
  symbol: string,
  longEx: string,
  shortEx: string,
  spreadPct: number,
  longBook: OrderBook | undefined,
  shortBook: OrderBook | undefined
): CapacityEstimate {
  const spread = spreadPct / 100;

  if (!longBook || !shortBook || !longBook.asks.length || !shortBook.bids.length) {
    return {
      symbol, longExchange: longEx, shortExchange: shortEx,
      maxCapacityUsd: 0, slippageAtCapacity: 0,
      spreadCapturePct: 0, recommendedSize: 0,
      depthQuality: 'THIN',
    };
  }

  // Binary search for max capacity where slippage < spread/2
  let lo = 1000;
  let hi = 100_000_000;
  let maxCap = 0;

  for (let iter = 0; iter < 30; iter++) {
    const mid = (lo + hi) / 2;
    const longSlip = estimateSlippage(longBook.asks, mid, 'buy');
    const shortSlip = estimateSlippage(shortBook.bids, mid, 'sell');
    const totalSlip = longSlip + shortSlip;

    if (totalSlip < spread * 0.5) {
      maxCap = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const finalLongSlip = estimateSlippage(longBook.asks, maxCap, 'buy');
  const finalShortSlip = estimateSlippage(shortBook.bids, maxCap, 'sell');
  const totalSlip = finalLongSlip + finalShortSlip;
  const captured = Math.max(0, spread - totalSlip);

  let depthQuality: CapacityEstimate['depthQuality'] = 'THIN';
  if (maxCap > 10_000_000) depthQuality = 'DEEP';
  else if (maxCap > 500_000) depthQuality = 'MODERATE';

  return {
    symbol, longExchange: longEx, shortExchange: shortEx,
    maxCapacityUsd: Math.round(maxCap),
    slippageAtCapacity: totalSlip * 100,
    spreadCapturePct: (captured / spread) * 100,
    recommendedSize: Math.round(maxCap * 0.5),
    depthQuality,
  };
}
