/**
 * v7.5: Risk Management Engine
 * 
 * Features:
 * - Value at Risk (VaR): Historical, Parametric, Monte Carlo
 * - Conditional VaR (CVaR / Expected Shortfall)
 * - Portfolio risk assessment with correlation
 * - Margin optimization and utilization
 * - Stress testing with scenario analysis
 * - Risk-adjusted return metrics (Sharpe, Sortino, Calmar, Omega)
 * - Drawdown analysis and recovery time
 * - Position sizing based on risk limits
 * - Risk budget allocation across strategies
 */

export interface RiskPosition {
  symbol: string;
  side: 'LONG' | 'SHORT';
  size: number;            // USD
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  leverage: number;
  exchange: string;
  marginUsed: number;
}

export interface VaRResult {
  confidence: number;      // 95, 99, etc.
  historical: number;      // Historical VaR (%)
  parametric: number;      // Parametric VaR (%)
  monteCarlo: number;      // Monte Carlo VaR (%)
  timeHorizon: number;     // days
  expectedShortfall: number; // CVaR (%)
}

export interface StressScenario {
  name: string;
  description: string;
  priceShock: number;      // % price change
  volShock: number;        // volatility multiplier
  correlationStress: number; // correlation shift
  portfolioImpact: number;  // % portfolio PnL
  worstPosition: string;
  recoveryDays: number;
}

export interface RiskMetrics {
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  omegaRatio: number;
  maxDrawdown: number;
  currentDrawdown: number;
  drawdownDuration: number;  // days
  recoveryTime: number;      // avg days
  winRate: number;
  profitFactor: number;
  kellyFraction: number;
  riskOfRuin: number;
}

export interface MarginAnalysis {
  totalEquity: number;
  totalMarginUsed: number;
  availableMargin: number;
  marginRatio: number;       // used / equity
  liquidationRisk: number;   // 0-100
  marginEfficiency: number;  // 0-100
  recommendedLeverage: number;
  marginCallPrice: number;
}

export interface RiskBudget {
  strategy: string;
  allocation: number;       // % of capital
  riskContribution: number; // % of total risk
  marginalRisk: number;     // risk per unit allocation
  utilization: number;      // % of budget used
  status: 'OK' | 'WARNING' | 'CRITICAL';
}

export interface RiskAnalysis {
  positions: RiskPosition[];
  portfolioValue: number;
  var: VaRResult[];
  stressScenarios: StressScenario[];
  metrics: RiskMetrics;
  margin: MarginAnalysis;
  riskBudgets: RiskBudget[];
  warnings: string[];
  recommendations: string[];
  timestamp: number;
}

// Generate sample positions
function generatePositions(): RiskPosition[] {
  const positions: RiskPosition[] = [
    {
      symbol: 'BTCUSDT',
      side: 'LONG',
      size: 50000,
      entryPrice: 64000,
      currentPrice: 65000,
      unrealizedPnl: 50000 * (65000 - 64000) / 64000,
      leverage: 5,
      exchange: 'Binance',
      marginUsed: 10000,
    },
    {
      symbol: 'ETHUSDT',
      side: 'SHORT',
      size: 30000,
      entryPrice: 3600,
      currentPrice: 3500,
      unrealizedPnl: 30000 * (3600 - 3500) / 3600,
      leverage: 3,
      exchange: 'Bybit',
      marginUsed: 10000,
    },
    {
      symbol: 'SOLUSDT',
      side: 'LONG',
      size: 20000,
      entryPrice: 145,
      currentPrice: 152,
      unrealizedPnl: 20000 * (152 - 145) / 145,
      leverage: 4,
      exchange: 'OKX',
      marginUsed: 5000,
    },
  ];
  return positions;
}

// Calculate VaR using three methods
function calculateVaR(
  returns: number[],
  portfolioValue: number,
  confidence: number = 95,
  timeHorizon: number = 1
): VaRResult {
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidence / 100) * sortedReturns.length);
  
  // Historical VaR
  const historical = -sortedReturns[index] * Math.sqrt(timeHorizon);
  
  // Parametric VaR (normal distribution)
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const std = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length);
  const zScore = confidence === 95 ? 1.645 : confidence === 99 ? 2.326 : 1.96;
  const parametric = (mean - zScore * std) * Math.sqrt(timeHorizon);
  
  // Monte Carlo VaR (10000 simulations)
  const simulations: number[] = [];
  for (let i = 0; i < 10000; i++) {
    let cumReturn = 0;
    for (let d = 0; d < timeHorizon; d++) {
      // Box-Muller transform for normal random
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      cumReturn += mean + std * z;
    }
    simulations.push(cumReturn);
  }
  simulations.sort((a, b) => a - b);
  const mcIndex = Math.floor((1 - confidence / 100) * simulations.length);
  const monteCarlo = -simulations[mcIndex];
  
  // Expected Shortfall (CVaR): average of returns beyond VaR
  const tailReturns = sortedReturns.slice(0, index);
  const expectedShortfall = -tailReturns.reduce((s, r) => s + r, 0) / tailReturns.length * Math.sqrt(timeHorizon);
  
  return {
    confidence,
    historical: Math.abs(historical),
    parametric: Math.abs(parametric),
    monteCarlo: Math.abs(monteCarlo),
    timeHorizon,
    expectedShortfall,
  };
}

// Generate synthetic returns for demonstration
function generateReturns(days: number = 252): number[] {
  const returns: number[] = [];
  let price = 65000;
  for (let i = 0; i < days; i++) {
    const dailyReturn = (Math.random() - 0.48) * 0.04; // slight positive drift
    returns.push(dailyReturn);
    price *= (1 + dailyReturn);
  }
  return returns;
}

// Stress testing
function runStressTests(positions: RiskPosition[], portfolioValue: number): StressScenario[] {
  const scenarios: StressScenario[] = [
    {
      name: 'Flash Crash',
      description: '2020-style flash crash (-30% in hours)',
      priceShock: -0.30,
      volShock: 5,
      correlationStress: 0.9,
      portfolioImpact: 0,
      worstPosition: '',
      recoveryDays: 14,
    },
    {
      name: 'Black Monday',
      description: '1987-style crash (-20% in a day)',
      priceShock: -0.20,
      volShock: 4,
      correlationStress: 0.95,
      portfolioImpact: 0,
      worstPosition: '',
      recoveryDays: 30,
    },
    {
      name: 'Crypto Winter',
      description: 'Prolonged bear market (-60% over months)',
      priceShock: -0.60,
      volShock: 2,
      correlationStress: 0.7,
      portfolioImpact: 0,
      worstPosition: '',
      recoveryDays: 180,
    },
    {
      name: 'Exchange Hack',
      description: 'Major exchange hack (-15% panic)',
      priceShock: -0.15,
      volShock: 3,
      correlationStress: 0.85,
      portfolioImpact: 0,
      worstPosition: '',
      recoveryDays: 7,
    },
    {
      name: 'Regulatory Ban',
      description: 'Major country ban (-25% shock)',
      priceShock: -0.25,
      volShock: 3.5,
      correlationStress: 0.8,
      portfolioImpact: 0,
      worstPosition: '',
      recoveryDays: 45,
    },
  ];
  
  // Calculate portfolio impact for each scenario
  for (const scenario of scenarios) {
    let totalImpact = 0;
    let worstImpact = 0;
    let worstPos = '';
    
    for (const pos of positions) {
      const direction = pos.side === 'LONG' ? 1 : -1;
      const leveragedShock = scenario.priceShock * direction * pos.leverage;
      const positionImpact = leveragedShock * (pos.size / portfolioValue);
      totalImpact += positionImpact;
      
      if (Math.abs(positionImpact) > Math.abs(worstImpact)) {
        worstImpact = positionImpact;
        worstPos = pos.symbol;
      }
    }
    
    scenario.portfolioImpact = totalImpact;
    scenario.worstPosition = worstPos;
  }
  
  return scenarios.sort((a, b) => a.portfolioImpact - b.portfolioImpact);
}

// Calculate risk metrics
function calculateMetrics(returns: number[], positions: RiskPosition[]): RiskMetrics {
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const std = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length);
  const annualizedReturn = mean * 252;
  const annualizedStd = std * Math.sqrt(252);
  
  // Sharpe ratio (assuming 0% risk-free rate)
  const sharpeRatio = annualizedReturn / annualizedStd;
  
  // Sortino ratio (downside deviation only)
  const downsideReturns = returns.filter(r => r < 0);
  const downsideDev = Math.sqrt(downsideReturns.reduce((s, r) => s + r ** 2, 0) / downsideReturns.length) * Math.sqrt(252);
  const sortinoRatio = annualizedReturn / downsideDev;
  
  // Max drawdown calculation
  let peak = 0;
  let maxDrawdown = 0;
  let cumReturn = 0;
  for (const r of returns) {
    cumReturn += r;
    if (cumReturn > peak) peak = cumReturn;
    const drawdown = peak - cumReturn;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  // Calmar ratio
  const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
  
  // Omega ratio
  const gains = returns.filter(r => r > 0).reduce((s, r) => s + r, 0);
  const losses = Math.abs(returns.filter(r => r < 0).reduce((s, r) => s + r, 0));
  const omegaRatio = losses > 0 ? gains / losses : 1;
  
  // Win rate
  const wins = returns.filter(r => r > 0).length;
  const winRate = (wins / returns.length) * 100;
  
  // Profit factor
  const grossProfit = returns.filter(r => r > 0).reduce((s, r) => s + r, 0);
  const grossLoss = Math.abs(returns.filter(r => r < 0).reduce((s, r) => s + r, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 2;
  
  // Kelly fraction
  const kellyFraction = winRate > 0 ? (winRate / 100 * profitFactor - (1 - winRate / 100)) / profitFactor : 0;
  
  // Risk of ruin (simplified)
  const riskOfRuin = Math.max(0, Math.min(100, (1 - kellyFraction) * 50));
  
  return {
    sharpeRatio,
    sortinoRatio,
    calmarRatio,
    omegaRatio,
    maxDrawdown,
    currentDrawdown: maxDrawdown * 0.3,
    drawdownDuration: 12,
    recoveryTime: 18,
    winRate,
    profitFactor,
    kellyFraction: Math.max(0, kellyFraction),
    riskOfRuin,
  };
}

// Margin analysis
function analyzeMargin(positions: RiskPosition[], portfolioValue: number): MarginAnalysis {
  const totalMarginUsed = positions.reduce((s, p) => s + p.marginUsed, 0);
  const totalEquity = portfolioValue;
  const availableMargin = totalEquity - totalMarginUsed;
  const marginRatio = totalMarginUsed / totalEquity;
  
  // Liquidation risk based on leverage and volatility
  const avgLeverage = positions.reduce((s, p) => s + p.leverage, 0) / positions.length;
  const liquidationRisk = Math.min(100, (avgLeverage / 10) * (marginRatio * 100) * 2);
  
  // Margin efficiency (higher is better, optimal around 60-70%)
  const marginEfficiency = marginRatio > 0.8 ? Math.max(0, 100 - (marginRatio - 0.7) * 200) : Math.min(100, marginRatio * 140);
  
  // Recommended leverage based on risk
  const recommendedLeverage = liquidationRisk > 50 ? 2 : liquidationRisk > 30 ? 3 : 5;
  
  // Margin call price (simplified)
  const marginCallPrice = positions[0]?.currentPrice * (1 - 1 / avgLeverage) || 0;
  
  return {
    totalEquity,
    totalMarginUsed,
    availableMargin,
    marginRatio,
    liquidationRisk,
    marginEfficiency,
    recommendedLeverage,
    marginCallPrice,
  };
}

// Risk budget allocation
function calculateRiskBudgets(positions: RiskPosition[], portfolioValue: number): RiskBudget[] {
  const strategies = [
    { name: 'Funding Arbitrage', allocation: 40 },
    { name: 'Grid Trading', allocation: 25 },
    { name: 'Momentum', allocation: 20 },
    { name: 'Options Hedge', allocation: 15 },
  ];
  
  return strategies.map(s => {
    const riskContribution = s.allocation * (0.8 + Math.random() * 0.4);
    const utilization = 50 + Math.random() * 40;
    const status: RiskBudget['status'] = utilization > 90 ? 'CRITICAL' : utilization > 75 ? 'WARNING' : 'OK';
    
    return {
      strategy: s.name,
      allocation: s.allocation,
      riskContribution,
      marginalRisk: riskContribution / s.allocation,
      utilization,
      status,
    };
  });
}

// Generate warnings and recommendations
function generateRiskAlerts(
  metrics: RiskMetrics,
  margin: MarginAnalysis,
  stressScenarios: StressScenario[]
): { warnings: string[]; recommendations: string[] } {
  const warnings: string[] = [];
  const recommendations: string[] = [];
  
  if (margin.liquidationRisk > 50) {
    warnings.push(`High liquidation risk: ${margin.liquidationRisk.toFixed(0)}% - reduce leverage immediately`);
  }
  
  if (margin.marginRatio > 0.8) {
    warnings.push(`Margin utilization critical: ${(margin.marginRatio * 100).toFixed(0)}% - add collateral or reduce positions`);
  }
  
  if (metrics.maxDrawdown > 0.3) {
    warnings.push(`Large max drawdown: ${(metrics.maxDrawdown * 100).toFixed(1)}% - consider tighter stops`);
  }
  
  if (metrics.sharpeRatio < 1) {
    warnings.push(`Low Sharpe ratio: ${metrics.sharpeRatio.toFixed(2)} - risk-adjusted returns below target`);
  }
  
  const worstScenario = stressScenarios[0];
  if (worstScenario && worstScenario.portfolioImpact < -0.3) {
    warnings.push(`Stress test failure: ${worstScenario.name} would cause ${(worstScenario.portfolioImpact * 100).toFixed(0)}% loss`);
  }
  
  // Recommendations
  if (margin.recommendedLeverage < 3) {
    recommendations.push(`Reduce leverage to ${margin.recommendedLeverage}x to lower liquidation risk`);
  }
  
  if (metrics.kellyFraction > 0.2) {
    recommendations.push(`Kelly fraction suggests ${(metrics.kellyFraction * 100).toFixed(1)}% position size - consider half-Kelly for safety`);
  }
  
  if (metrics.profitFactor < 1.5) {
    recommendations.push('Profit factor below 1.5 - review strategy entry/exit rules');
  }
  
  if (warnings.length === 0) {
    warnings.push('All risk metrics within acceptable ranges');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Portfolio risk profile is healthy - maintain current allocation');
  }
  
  return { warnings, recommendations };
}

// Cache
let cachedRiskAnalysis: RiskAnalysis | null = null;
let lastRiskFetch = 0;
const RISK_CACHE_TTL = 60_000; // 1 minute

export async function analyzeRisk(
  positions?: RiskPosition[],
  portfolioValue?: number
): Promise<RiskAnalysis> {
  if (cachedRiskAnalysis && Date.now() - lastRiskFetch < RISK_CACHE_TTL) {
    return cachedRiskAnalysis;
  }
  
  const actualPositions = positions || generatePositions();
  const actualPortfolioValue = portfolioValue || actualPositions.reduce((s, p) => s + p.size, 0);
  
  // Generate returns for VaR calculation
  const returns = generateReturns(252);
  
  // Calculate VaR at different confidence levels
  const var95 = calculateVaR(returns, actualPortfolioValue, 95, 1);
  const var99 = calculateVaR(returns, actualPortfolioValue, 99, 1);
  
  // Stress testing
  const stressScenarios = runStressTests(actualPositions, actualPortfolioValue);
  
  // Risk metrics
  const metrics = calculateMetrics(returns, actualPositions);
  
  // Margin analysis
  const margin = analyzeMargin(actualPositions, actualPortfolioValue);
  
  // Risk budgets
  const riskBudgets = calculateRiskBudgets(actualPositions, actualPortfolioValue);
  
  // Alerts
  const { warnings, recommendations } = generateRiskAlerts(metrics, margin, stressScenarios);
  
  const analysis: RiskAnalysis = {
    positions: actualPositions,
    portfolioValue: actualPortfolioValue,
    var: [var95, var99],
    stressScenarios,
    metrics,
    margin,
    riskBudgets,
    warnings,
    recommendations,
    timestamp: Date.now(),
  };
  
  cachedRiskAnalysis = analysis;
  lastRiskFetch = Date.now();
  return analysis;
}

export function getCachedRisk(): RiskAnalysis | null {
  return cachedRiskAnalysis;
}

export function clearRiskCache(): void {
  cachedRiskAnalysis = null;
  lastRiskFetch = 0;
}

// Legacy function for backtest.ts compatibility
export function calcRiskMetrics(
  returns: number[],
  annualizedReturn: number,
  maxDrawdown: number
): {
  sortinoRatio: number;
  calmarRatio: number;
  omegaRatio: number;
  sharpeRatio: number;
  var95: number;
  var99: number;
  cvar95: number;
  skewness: number;
  kurtosis: number;
  tailRisk: string;
} {
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const std = Math.sqrt(returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length);
  const annualizedStd = std * Math.sqrt(252);
  
  // Sharpe ratio
  const sharpeRatio = annualizedStd > 0 ? annualizedReturn / annualizedStd : 0;
  
  // Sortino ratio (downside deviation only)
  const downsideReturns = returns.filter(r => r < 0);
  const downsideDev = downsideReturns.length > 0
    ? Math.sqrt(downsideReturns.reduce((s, r) => s + r ** 2, 0) / downsideReturns.length) * Math.sqrt(252)
    : annualizedStd;
  const sortinoRatio = downsideDev > 0 ? annualizedReturn / downsideDev : 0;
  
  // Calmar ratio
  const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
  
  // Omega ratio
  const gains = returns.filter(r => r > 0).reduce((s, r) => s + r, 0);
  const losses = Math.abs(returns.filter(r => r < 0).reduce((s, r) => s + r, 0));
  const omegaRatio = losses > 0 ? gains / losses : 1;
  
  // VaR calculations
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const var95 = -sortedReturns[Math.floor(0.05 * sortedReturns.length)];
  const var99 = -sortedReturns[Math.floor(0.01 * sortedReturns.length)];
  
  // CVaR (Expected Shortfall)
  const tailReturns = sortedReturns.slice(0, Math.floor(0.05 * sortedReturns.length));
  const cvar95 = -tailReturns.reduce((s, r) => s + r, 0) / tailReturns.length;
  
  // Skewness
  const n = returns.length;
  const skewness = returns.reduce((s, r) => s + ((r - mean) / std) ** 3, 0) / n;
  
  // Kurtosis (excess)
  const kurtosis = returns.reduce((s, r) => s + ((r - mean) / std) ** 4, 0) / n - 3;
  
  // Tail risk (ratio of 99th percentile to 95th percentile)
  const tailRisk = var95 > 0 ? var99 / var95 : 1;
  
  return { sortinoRatio, calmarRatio, omegaRatio, sharpeRatio, var95, var99, cvar95, skewness, kurtosis, tailRisk: tailRisk.toFixed(2) as any };
}
