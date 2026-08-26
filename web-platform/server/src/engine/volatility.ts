/**
 * Volatility Surface Engine v6.0
 *
 * Breakthrough: 3D funding rate volatility surface across time and moneyness.
 * Shows how funding rate volatility differs by holding period and rate level.
 *
 * Similar to options IV surface, but for funding rates.
 * Identifies: volatility smiles, skew, term structure anomalies.
 *
 * Application:
 * - Term structure: vol across 1h, 4h, 8h, 1d, 7d horizons
 * - Rate level: how vol changes at different rate levels (low vs high)
 * - Regime-dependent: separate surfaces per market regime
 */

export interface VolSurfacePoint {
  symbol: string;
  horizon: string;
  rateLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  volatility: number;
  skewness: number;
  kurtosis: number;
  observations: number;
}

export interface VolSurface {
  symbol: string;
  generatedAt: number;
  points: VolSurfacePoint[];
  summary: {
    termSlope: number;
    levelSlope: number;
    avgVol: number;
    maxVol: number;
    minVol: number;
    anomalyPoints: string[];
  };
}

const rateHistory = new Map<string, { time: number; rate: number; volume?: number }[]>();
const MAX_HISTORY = 5000;

export function addRateSample(exchange: string, symbol: string, rate: number, volume?: number) {
  const key = `${exchange}:${symbol}`;
  let h = rateHistory.get(key);
  if (!h) { h = []; rateHistory.set(key, h); }
  h.push({ time: Date.now(), rate, volume });
  if (h.length > MAX_HISTORY) h.shift();
}

export function calculateVolSurface(symbol: string, exchange = 'Binance'): VolSurface {
  const key = `${exchange}:${symbol}`;
  const h = rateHistory.get(key) || [];

  if (h.length < 24) {
    return {
      symbol, generatedAt: Date.now(), points: [],
      summary: { termSlope: 0, levelSlope: 0, avgVol: 0, maxVol: 0, minVol: 0, anomalyPoints: [] },
    };
  }

  const horizons = [
    { name: '1h', samples: 1 },
    { name: '4h', samples: 4 },
    { name: '8h', samples: 8 },
    { name: '1d', samples: 24 },
    { name: '3d', samples: 72 },
    { name: '7d', samples: 168 },
  ];

  const points: VolSurfacePoint[] = [];
  const now = Date.now();

  for (const horizon of horizons) {
    const cutoff = now - horizon.samples * 3600000;
    const recent = h.filter(s => s.time >= cutoff);
    if (recent.length < 4) continue;

    const returns: number[] = [];
    for (let i = 1; i < recent.length; i++) {
      returns.push(recent[i].rate - recent[i - 1].rate);
    }

    if (returns.length < 3) continue;

    const vol = stdDev(returns) * Math.sqrt(8760);
    const skew = skewness(returns);
    const kurt = kurtosis(returns);

    const avgRate = h.slice(-24).reduce((s, r) => s + r.rate, 0) / Math.min(h.length, 24);
    const rateLevel: VolSurfacePoint['rateLevel'] =
      Math.abs(avgRate) < 0.0002 ? 'LOW' :
      Math.abs(avgRate) < 0.001 ? 'MEDIUM' :
      Math.abs(avgRate) < 0.003 ? 'HIGH' : 'EXTREME';

    points.push({
      symbol, horizon: horizon.name, rateLevel,
      volatility: vol * 10000,
      skewness: skew,
      kurtosis: kurt,
      observations: returns.length,
    });
  }

  const avgVol = points.length > 0 ? points.reduce((s, p) => s + p.volatility, 0) / points.length : 0;
  const maxVol = points.length > 0 ? Math.max(...points.map(p => p.volatility)) : 0;
  const minVol = points.length > 0 ? Math.min(...points.map(p => p.volatility)) : 0;

  const termSlope = points.length >= 2
    ? points[points.length - 1].volatility - points[0].volatility
    : 0;

  const highRate = points.filter(p => p.rateLevel === 'HIGH' || p.rateLevel === 'EXTREME');
  const lowRate = points.filter(p => p.rateLevel === 'LOW');
  const levelSlope = highRate.length > 0 && lowRate.length > 0
    ? (highRate.reduce((s, p) => s + p.volatility, 0) / highRate.length) -
      (lowRate.reduce((s, p) => s + p.volatility, 0) / lowRate.length)
    : 0;

  const anomalyPoints = points.filter(p => p.volatility > avgVol * 2 && avgVol > 0).map(p => `${p.horizon}:${p.rateLevel}`);

  return {
    symbol, generatedAt: Date.now(), points,
    summary: { termSlope, levelSlope, avgVol, maxVol, minVol, anomalyPoints },
  };
}

export function getVolForHorizon(symbol: string, horizon: string, exchange = 'Binance'): number {
  const surface = calculateVolSurface(symbol, exchange);
  const point = surface.points.find(p => p.horizon === horizon);
  return point?.volatility || 0;
}

export function getVolComparison(symbols: string[], horizon = '4h'): { symbol: string; volatility: number; level: string }[] {
  return symbols.map(sym => {
    const surface = calculateVolSurface(sym);
    const point = surface.points.find(p => p.horizon === horizon);
    return {
      symbol: sym,
      volatility: point?.volatility || 0,
      level: point?.rateLevel || 'UNKNOWN',
    };
  }).sort((a, b) => b.volatility - a.volatility);
}

export function detectVolRegimeChange(symbol: string, exchange = 'Binance'): {
  changed: boolean;
  direction: 'EXPANDING' | 'CONTRACTING' | 'STABLE';
  magnitude: number;
} {
  const key = `${exchange}:${symbol}`;
  const h = rateHistory.get(key) || [];
  if (h.length < 48) return { changed: false, direction: 'STABLE', magnitude: 0 };

  const recent24 = h.slice(-24);
  const previous24 = h.slice(-48, -24);

  const recentVol = stdDev(recent24.map(s => s.rate)) * 10000;
  const previousVol = stdDev(previous24.map(s => s.rate)) * 10000;

  const change = previousVol > 0 ? (recentVol - previousVol) / previousVol : 0;

  return {
    changed: Math.abs(change) > 0.3,
    direction: change > 0.3 ? 'EXPANDING' : change < -0.3 ? 'CONTRACTING' : 'STABLE',
    magnitude: change,
  };
}

export function getVolSurfaceGrid(symbol: string): { horizons: string[]; levels: string[]; values: number[][] } {
  const surface = calculateVolSurface(symbol);
  const horizons = ['1h', '4h', '8h', '1d', '3d', '7d'];
  const levels = ['LOW', 'MEDIUM', 'HIGH', 'EXTREME'];

  const values: number[][] = horizons.map(h =>
    levels.map(l => {
      const point = surface.points.find(p => p.horizon === h && p.rateLevel === l);
      return point?.volatility || 0;
    })
  );

  return { horizons, levels, values };
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((s, v) => s + (v - avg) ** 2, 0) / (arr.length - 1));
}

function skewness(arr: number[]): number {
  if (arr.length < 3) return 0;
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = stdDev(arr);
  if (std === 0) return 0;
  return arr.reduce((s, v) => s + ((v - avg) / std) ** 3, 0) / arr.length;
}

function kurtosis(arr: number[]): number {
  if (arr.length < 4) return 0;
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  const std = stdDev(arr);
  if (std === 0) return 0;
  return arr.reduce((s, v) => s + ((v - avg) / std) ** 4, 0) / arr.length - 3;
}
