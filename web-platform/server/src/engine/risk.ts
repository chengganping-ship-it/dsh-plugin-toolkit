/**
 * Advanced Risk Metrics Engine
 *
 * Calculates institutional-grade risk metrics:
 * - VaR (Value at Risk): maximum loss at given confidence
 * - CVaR (Conditional VaR): expected loss beyond VaR
 * - Sortino Ratio: Sharpe but only penalizes downside volatility
 * - Calmar Ratio: return / max drawdown
 * - Omega Ratio: probability weighted gains/losses
 *
 * Breakthrough: Professional risk management tools never before
 * available for funding rate arbitrage.
 */

export interface RiskMetrics {
  var95: number;            // Value at Risk (95% confidence)
  var99: number;            // Value at Risk (99% confidence)
  cvar95: number;           // Conditional VaR (Expected Shortfall)
  sortinoRatio: number;     // Sortino ratio
  calmarRatio: number;      // Calmar ratio (return / max DD)
  omegaRatio: number;       // Omega ratio
  upsideCapture: number;    // avg positive return
  downsideCapture: number;  // avg negative return
  skewness: number;         // return distribution skew
  kurtosis: number;         // tail risk
  tailRisk: 'LOW' | 'MODERATE' | 'HIGH';
}

function mean(arr: number[]): number {
  return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

function percentile(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor(sorted.length * p);
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}

export function calcRiskMetrics(returns: number[], annualizedReturn: number, maxDrawdown: number): RiskMetrics {
  if (returns.length < 5) {
    return {
      var95: 0, var99: 0, cvar95: 0, sortinoRatio: 0, calmarRatio: 0,
      omegaRatio: 0, upsideCapture: 0, downsideCapture: 0, skewness: 0, kurtosis: 0, tailRisk: 'LOW',
    };
  }

  // VaR & CVaR
  const var95 = -percentile(returns, 0.05);
  const var99 = -percentile(returns, 0.01);
  const tailLosses = returns.filter(r => r < -var95);
  const cvar95 = tailLosses.length > 0 ? -mean(tailLosses) : var95;

  // Downside deviation (for Sortino)
  const downside = returns.filter(r => r < 0);
  const downsideDev = stdDev(downside.length > 0 ? downside : [0]);
  const sortinoRatio = downsideDev > 0 ? (mean(returns) / downsideDev) * Math.sqrt(365 * 3) : 0;

  // Calmar
  const calmarRatio = maxDrawdown > 0 ? (annualizedReturn / maxDrawdown) : 0;

  // Omega
  const gains = returns.filter(r => r > 0);
  const losses = returns.filter(r => r < 0);
  const sumGains = gains.reduce((s, r) => s + r, 0);
  const sumLosses = Math.abs(losses.reduce((s, r) => s + r, 0));
  const omegaRatio = sumLosses > 0 ? sumGains / sumLosses : sumGains > 0 ? 999 : 0;

  // Skewness & Kurtosis
  const m = mean(returns);
  const sd = stdDev(returns) || 1;
  const n = returns.length;
  const skewness = returns.reduce((s, r) => s + ((r - m) / sd) ** 3, 0) / n;
  const kurtosis = returns.reduce((s, r) => s + ((r - m) / sd) ** 4, 0) / n - 3; // excess kurtosis

  let tailRisk: RiskMetrics['tailRisk'] = 'LOW';
  if (kurtosis > 3 || var99 > 5) tailRisk = 'HIGH';
  else if (kurtosis > 1 || var95 > 2) tailRisk = 'MODERATE';

  return {
    var95: +var95.toFixed(3),
    var99: +var99.toFixed(3),
    cvar95: +cvar95.toFixed(3),
    sortinoRatio: +sortinoRatio.toFixed(3),
    calmarRatio: +calmarRatio.toFixed(3),
    omegaRatio: +omegaRatio.toFixed(3),
    upsideCapture: +(gains.length > 0 ? mean(gains) : 0).toFixed(4),
    downsideCapture: +(losses.length > 0 ? mean(losses) : 0).toFixed(4),
    skewness: +skewness.toFixed(3),
    kurtosis: +kurtosis.toFixed(3),
    tailRisk,
  };
}
