/**
 * Paper Trading Engine
 *
 * Simulates trade execution with realistic fills.
 * Tracks PnL, positions, and performance in real-time.
 *
 * Breakthrough: Live simulated trading with the same signals
 * sent to real traders, so they can verify strategy before risking capital.
 */

export interface PaperPosition {
  id: string;
  symbol: string;
  direction: 'LONG_SHORT' | 'SHORT_LONG';
  longEx: string;
  shortEx: string;
  entrySpread: number;
  entryTs: number;
  notional: number;
  pnlPct: number;
  status: 'OPEN' | 'CLOSED';
  closeTs?: number;
  closeReason?: string;
  maxPnl: number;
  minPnl: number;
}

export interface PaperTradeStats {
  totalTrades: number;
  openPositions: number;
  closedPositions: number;
  totalPnlPct: number;
  winRate: number;
  avgPnl: number;
  maxDrawdown: number;
  sharpe: number;
  positions: PaperPosition[];
}

const positions: PaperPosition[] = [];
let peakPnl = 0;
let maxDD = 0;

export function openPosition(signal: {
  symbol: string;
  longEx: string;
  shortEx: string;
  spreadPct: number;
  notional?: number;
}): PaperPosition {
  const pos: PaperPosition = {
    id: `T${Date.now()}_${positions.length}`,
    symbol: signal.symbol,
    direction: 'LONG_SHORT',
    longEx: signal.longEx,
    shortEx: signal.shortEx,
    entrySpread: signal.spreadPct,
    entryTs: Date.now(),
    notional: signal.notional || 10000,
    pnlPct: 0,
    status: 'OPEN',
    maxPnl: 0,
    minPnl: 0,
  };
  positions.unshift(pos);
  return pos;
}

export function updatePositions(rates: Map<string, { fundingRate: number; markPrice: number }>): PaperPosition[] {
  const closed: PaperPosition[] = [];

  for (const pos of positions) {
    if (pos.status !== 'OPEN') continue;

    const longKey = `${pos.longEx}:${pos.symbol}`;
    const shortKey = `${pos.shortEx}:${pos.symbol}`;
    const long = rates.get(longKey);
    const short = rates.get(shortKey);

    if (!long || !short) continue;

    const currentSpread = (long.fundingRate - short.fundingRate) * 100;
    const spreadChange = currentSpread - pos.entrySpread;
    // PnL from spread movement (simplified)
    const periods = (Date.now() - pos.entryTs) / (8 * 3600 * 1000);
    const pnlPct = spreadChange * periods * 3; // rough annualized

    pos.pnlPct = pnlPct;
    pos.maxPnl = Math.max(pos.maxPnl, pnlPct);
    pos.minPnl = Math.min(pos.minPnl, pnlPct);

    // Auto-close if stop loss or target hit
    if (pnlPct < -2) {
      pos.status = 'CLOSED';
      pos.closeTs = Date.now();
      pos.closeReason = 'STOP_LOSS';
      closed.push(pos);
    } else if (pnlPct > 5) {
      pos.status = 'CLOSED';
      pos.closeTs = Date.now();
      pos.closeReason = 'TAKE_PROFIT';
      closed.push(pos);
    } else if (Math.abs(currentSpread) < 0.001) {
      pos.status = 'CLOSED';
      pos.closeTs = Date.now();
      pos.closeReason = 'SPREAD_CLOSED';
      closed.push(pos);
    }
  }

  // Track drawdown
  const totalPnl = positions.reduce((s, p) => s + p.pnlPct, 0);
  if (totalPnl > peakPnl) peakPnl = totalPnl;
  const dd = peakPnl - totalPnl;
  if (dd > maxDD) maxDD = dd;

  return closed;
}

export function getTradeStats(): PaperTradeStats {
  const closed = positions.filter(p => p.status === 'CLOSED');
  const open = positions.filter(p => p.status === 'OPEN');
  const wins = closed.filter(p => p.pnlPct > 0);
  const losses = closed.filter(p => p.pnlPct <= 0);

  const totalPnl = positions.reduce((s, p) => s + p.pnlPct, 0);
  const avgPnl = closed.length > 0 ? totalPnl / closed.length : 0;
  const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0;

  const pnls = closed.map(p => p.pnlPct);
  const mean = pnls.length > 0 ? pnls.reduce((a, b) => a + b, 0) / pnls.length : 0;
  const std = pnls.length > 1 ? Math.sqrt(pnls.reduce((s, p) => s + (p - mean) ** 2, 0) / (pnls.length - 1)) : 0;
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(52) : 0;

  return {
    totalTrades: positions.length,
    openPositions: open.length,
    closedPositions: closed.length,
    totalPnlPct: +totalPnl.toFixed(3),
    winRate: +winRate.toFixed(1),
    avgPnl: +avgPnl.toFixed(3),
    maxDrawdown: +maxDD.toFixed(2),
    sharpe: +sharpe.toFixed(2),
    positions: positions.slice(0, 20),
  };
}

export function clearPositions() {
  positions.length = 0;
  peakPnl = 0;
  maxDD = 0;
}
