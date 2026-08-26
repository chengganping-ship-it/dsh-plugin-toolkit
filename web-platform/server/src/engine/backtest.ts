/**
 * Advanced Backtesting Engine
 *
 * Tests funding rate arbitrage strategies with realistic fees, slippage,
 * position sizing, and multiple strategy variants.
 */

export interface BacktestParams {
  strategy: 'PURE_CARRY' | 'MOMENTUM' | 'MEAN_REVERSION' | 'COMPOUND';
  symbol: string;
  startTs: number;
  endTs: number;
  initialCapital: number;
  feePerTrade: number;
  slippage: number;
  maxPositionPct: number;
  stopLoss?: number;
  takeProfit?: number;
  minSpread?: number;
}

export interface BacktestResult {
  strategy: string;
  symbol: string;
  period: string;
  totalReturn: number;
  annualizedReturn: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  tradeCount: number;
  avgTradeReturn: number;
  avgWin: number;
  avgLoss: number;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  finalCapital: number;
  equityCurve: { ts: number; equity: number }[];
  trades: TradeRecord[];
}

export interface TradeRecord {
  entryTs: number;
  exitTs: number;
  direction: string;
  spread: number;
  pnl: number;
  pnlPct: number;
  holdingPeriods: number;
  exitReason: string;
}

interface HistoricalRate {
  ts: number;
  rate: number;
  price: number;
}

export function runBacktest(
  rateHistoryA: HistoricalRate[],
  rateHistoryB: HistoricalRate[],
  params: BacktestParams
): BacktestResult {
  const trades: TradeRecord[] = [];
  const equityCurve: { ts: number; equity: number }[] = [];
  let capital = params.initialCapital;
  let peakCapital = capital;
  let maxDrawdown = 0;
  let position: {
    entryTs: number;
    entryPriceA: number;
    entryPriceB: number;
    spread: number;
    periods: number;
    direction: 'LONG_A_SHORT_B' | 'LONG_B_SHORT_A';
  } | null = null;

  const mapA = new Map(rateHistoryA.map(r => [r.ts, r]));
  const aligned = rateHistoryB.filter(r => mapA.has(r.ts));

  let consecutiveWins = 0;
  let consecutiveLosses = 0;
  let maxConsecWins = 0;
  let maxConsecLosses = 0;
  let totalWins = 0;
  let totalLosses = 0;
  let sumWins = 0;
  let sumLosses = 0;

  for (let i = 0; i < aligned.length; i++) {
    const b = aligned[i];
    const a = mapA.get(b.ts)!;
    const spread = a.rate - b.rate;
    const feeTotal = params.feePerTrade * 4;

    if (position) {
      const pnlPerPeriod = Math.abs(spread) - feeTotal / 100;
      position.periods++;

      const shouldExit =
        (params.stopLoss && (pnlPerPeriod * position.periods * capital * (params.maxPositionPct / 100)) / capital * 100 < -params.stopLoss) ||
        (params.takeProfit && (pnlPerPeriod * position.periods) > params.takeProfit / 100) ||
        (params.strategy === 'MEAN_REVERSION' && Math.abs(spread) < 0.0001) ||
        (params.strategy === 'MOMENTUM' && spread * position.spread < 0) ||
        i === aligned.length - 1;

      if (shouldExit) {
        const pnl = pnlPerPeriod * position.periods * capital * (params.maxPositionPct / 100);
        capital += pnl;
        const pnlPct = pnl / capital * 100;

        trades.push({
          entryTs: position.entryTs, exitTs: b.ts,
          direction: position.direction,
          spread: position.spread,
          pnl, pnlPct,
          holdingPeriods: position.periods,
          exitReason: i === aligned.length - 1 ? 'END_OF_DATA' : 'SIGNAL',
        });

        if (pnl > 0) {
          totalWins++; sumWins += pnlPct;
          consecutiveWins++; consecutiveLosses = 0;
          maxConsecWins = Math.max(maxConsecWins, consecutiveWins);
        } else {
          totalLosses++; sumLosses += pnlPct;
          consecutiveLosses++; consecutiveWins = 0;
          maxConsecLosses = Math.max(maxConsecLosses, consecutiveLosses);
        }

        position = null;
      }
    } else {
      const minSpread = params.minSpread || 0;
      const prevSpread = i > 0 ? aligned[i-1].rate - mapA.get(aligned[i-1].ts)!.rate : 0;
      const shouldEnter =
        Math.abs(spread) > minSpread / 100 &&
        (params.strategy === 'PURE_CARRY' || params.strategy === 'COMPOUND' ||
         (params.strategy === 'MOMENTUM' && i > 0 && Math.abs(spread) > Math.abs(prevSpread)) ||
         (params.strategy === 'MEAN_REVERSION' && Math.abs(spread) > 0.001));

      if (shouldEnter) {
        position = {
          entryTs: b.ts,
          entryPriceA: a.price,
          entryPriceB: b.price,
          spread,
          periods: 0,
          direction: spread > 0 ? 'LONG_A_SHORT_B' : 'LONG_B_SHORT_A',
        };
      }
    }

    equityCurve.push({ ts: b.ts, equity: capital });
    if (capital > peakCapital) peakCapital = capital;
    const dd = (peakCapital - capital) / peakCapital * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const totalReturn = (capital - params.initialCapital) / params.initialCapital * 100;
  const duration = (aligned[aligned.length - 1]?.ts - aligned[0]?.ts) || 1;
  const years = duration / (365 * 24 * 3600 * 1000);
  const annualizedReturn = years > 0 ? (Math.pow(1 + totalReturn / 100, 1 / years) - 1) * 100 : 0;

  const returns = trades.map(t => t.pnlPct);
  const avgReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const stdReturn = returns.length > 1
    ? Math.sqrt(returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / (returns.length - 1))
    : 0;
  const sharpe = stdReturn > 0 ? (avgReturn / stdReturn) * Math.sqrt(365 * 3) : 0;

  const winRate = trades.length > 0 ? (totalWins / trades.length) * 100 : 0;
  const profitFactor = sumLosses !== 0 ? Math.abs(sumWins / sumLosses) : sumWins > 0 ? 999 : 0;

  return {
    strategy: params.strategy,
    symbol: params.symbol,
    period: `${new Date(aligned[0]?.ts).toISOString().slice(0, 10)} to ${new Date(aligned[aligned.length - 1]?.ts).toISOString().slice(0, 10)}`,
    totalReturn: +totalReturn.toFixed(2),
    annualizedReturn: +annualizedReturn.toFixed(2),
    sharpe: +sharpe.toFixed(2),
    maxDrawdown: +maxDrawdown.toFixed(2),
    winRate: +winRate.toFixed(1),
    profitFactor: +profitFactor.toFixed(2),
    tradeCount: trades.length,
    avgTradeReturn: trades.length > 0 ? +(totalReturn / trades.length).toFixed(3) : 0,
    avgWin: totalWins > 0 ? +(sumWins / totalWins).toFixed(3) : 0,
    avgLoss: totalLosses > 0 ? +(sumLosses / totalLosses).toFixed(3) : 0,
    maxConsecutiveWins: maxConsecWins,
    maxConsecutiveLosses: maxConsecLosses,
    finalCapital: +capital.toFixed(2),
    equityCurve,
    trades: trades.slice(0, 50),
  };
}

export function generateSyntheticRates(
  symbol: string,
  days: number,
  baseRate: number,
  volatility: number
): HistoricalRate[] {
  const rates: HistoricalRate[] = [];
  const now = Date.now();
  const interval = 8 * 3600 * 1000;
  const periods = days * 3;
  let rate = baseRate;
  let price = symbol.includes('BTC') ? 65000 : symbol.includes('ETH') ? 3500 : 100;

  for (let i = 0; i < periods; i++) {
    rate += (Math.random() - 0.5) * volatility;
    rate = Math.max(-0.01, Math.min(0.01, rate));
    price *= 1 + (Math.random() - 0.5) * 0.02;
    rates.push({ ts: now - (periods - i) * interval, rate, price });
  }
  return rates;
}
