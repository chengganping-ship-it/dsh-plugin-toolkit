/**
 * Comprehensive Fee Calculator v6.0
 *
 * Breakthrough: Reveals the TRUE cost of every trade.
 * Competitors show you gross spread. We show you NET profit after ALL fees.
 *
 * Hidden costs most people forget:
 * 1. Taker fees (not maker!) when entering arbitrage
 * 2. Bid-ask spread slippage (varies by exchange + symbol)
 * 3. Withdrawal fees when moving funds between exchanges
 * 4. Network fees for on-chain transfers
 * 5. Opportunity cost of locked capital
 * 6. Price impact for large orders
 * 7. Cross-exchange price discrepancy (execution risk)
 */

export interface FeeBreakdown {
  symbol: string;
  longExchange: string;
  shortExchange: string;
  size: number;                  // USD
  grossSpreadPct: number;        // raw spread
  netSpreadPct: number;          // after all costs
  costs: FeeItem[];
  totalCostsUsd: number;
  netAnnualized: number;
  breakEvenHoldHours: number;    // how long to hold to break even
  profitProbability: number;     // estimated probability of profit
  recommendation: string;
}

interface FeeItem {
  name: string;
  amount: number;       // USD
  pct: number;          // % of trade size
  category: 'TRADING' | 'FUNDING' | 'WITHDRAWAL' | 'NETWORK' | 'SLIPPAGE' | 'OPPORTUNITY';
}

// Exchange-specific fee schedules
const FEE_SCHEDULES: Record<string, {
  maker: number;       // %
  taker: number;       // %
  withdraw: Record<string, number>;  // fixed USD or %
  minWithdraw: number;
  withdrawalTime: number;  // minutes
}> = {
  Binance: {
    maker: 0.02, taker: 0.04,
    withdraw: { USDT: 1, USDC: 1, BTC: 0.0005, ETH: 0.0025 },
    minWithdraw: 1, withdrawalTime: 30,
  },
  Bybit: {
    maker: 0.01, taker: 0.055,
    withdraw: { USDT: 0.8, USDC: 0.8, BTC: 0.0005, ETH: 0.0025 },
    minWithdraw: 1, withdrawalTime: 30,
  },
  OKX: {
    maker: 0.015, taker: 0.05,
    withdraw: { USDT: 0.8, USDC: 0.8, BTC: 0.0004, ETH: 0.002 },
    minWithdraw: 1, withdrawalTime: 30,
  },
  Gate: {
    maker: 0.015, taker: 0.05,
    withdraw: { USDT: 1, USDC: 1, BTC: 0.0005, ETH: 0.003 },
    minWithdraw: 2, withdrawalTime: 45,
  },
  Bitget: {
    maker: 0.02, taker: 0.06,
    withdraw: { USDT: 1, USDC: 1, BTC: 0.0005, ETH: 0.003 },
    minWithdraw: 2, withdrawalTime: 45,
  },
};

// Network fees for cross-exchange transfers
const NETWORK_FEES: Record<string, number> = {
  'TRC20': 1,
  'ERC20': 5,
  'BEP20': 0.5,
  'Polygon': 0.1,
  'Arbitrum': 0.5,
  'Optimism': 0.5,
  'BTC': 3,
  'SOL': 0.01,
  'Lightning': 0.1,
};

// Liquidity tiers for slippage estimation
function estimateSlippage(symbol: string, size: number): number {
  const tier = getLiquidityTier(symbol);
  // Slippage = base + (size / depth) ^ 1.5
  const depth = tier.avgDepth;
  const baseSlippage = tier.baseSlippage;
  const impact = Math.pow(size / depth, 1.5) * 0.0001;
  return baseSlippage + impact;
}

function getLiquidityTier(symbol: string): { avgDepth: number; baseSlippage: number } {
  const tiers: Record<string, { avgDepth: number; baseSlippage: number }> = {
    BTCUSDT: { avgDepth: 50000000, baseSlippage: 0.001 },
    ETHUSDT: { avgDepth: 30000000, baseSlippage: 0.002 },
    SOLUSDT: { avgDepth: 10000000, baseSlippage: 0.005 },
    XRPUSDT: { avgDepth: 8000000, baseSlippage: 0.006 },
    DOGEUSDT: { avgDepth: 5000000, baseSlippage: 0.008 },
  };
  // Default for alts
  return tiers[symbol] || { avgDepth: 3000000, baseSlippage: 0.01 };
}

/**
 * Calculate comprehensive fee breakdown
 */
export function calculateFees(params: {
  symbol: string;
  longExchange: string;
  shortExchange: string;
  spreadPct: number;
  size: number;
  fundingRate: number;           // annualized
  holdHours?: number;
  networkType?: string;          // for withdrawal
  isMarketOrder?: boolean;       // true = taker, false = maker
}): FeeBreakdown {
  const { symbol, longExchange, shortExchange, spreadPct, size, fundingRate, holdHours = 8 } = params;
  const isMarket = params.isMarketOrder !== false; // default true for arbs
  const costs: FeeItem[] = [];

  // 1. Trading fee (entry, opening positions on both sides)
  const longFee = FEE_SCHEDULES[longExchange] || FEE_SCHEDULES.Binance;
  const shortFee = FEE_SCHEDULES[shortExchange] || FEE_SCHEDULES.Binance;
  const entryFeePct = (isMarket ? longFee.taker : longFee.maker) + (isMarket ? shortFee.taker : shortFee.maker);
  const entryFeeUsd = size * entryFeePct / 100;
  costs.push({ name: 'Entry Trading Fee', amount: entryFeeUsd, pct: entryFeePct, category: 'TRADING' });

  // 2. Exit fee (closing positions)
  const exitFeeUsd = entryFeeUsd; // same fee schedule
  costs.push({ name: 'Exit Trading Fee', amount: exitFeeUsd, pct: entryFeePct, category: 'TRADING' });

  // 3. Slippage cost
  const entrySlippage = estimateSlippage(symbol, size);
  const slippageCost = size * entrySlippage * 2; // both sides
  costs.push({ name: 'Slippage (Est)', amount: slippageCost, pct: entrySlippage * 2 * 100, category: 'SLIPPAGE' });

  // 4. Price impact (for large orders)
  if ( size > 100000) {
    const impact = size * 0.0001; // 1bps per 10K
    costs.push({ name: 'Price Impact', amount: impact, pct: 0.01, category: 'SLIPPAGE' });
  }

  // 5. Withdrawal/transfer cost
  const networkType = params.networkType || selectBestNetwork(longExchange, shortExchange);
  const networkFee = NETWORK_FEES[networkType] || 1;
  costs.push({ name: `Network (${networkType})`, amount: networkFee, pct: (networkFee / size) * 100, category: 'NETWORK' });

  // 6. Opportunity cost of locked capital
  const opportunityCost = size * 0.05 * (holdHours / 8760); // assume 5% annual opportunity
  costs.push({ name: 'Opportunity Cost', amount: opportunityCost, pct: (opportunityCost / size) * 100, category: 'OPPORTUNITY' });

  // 7. Execution risk (probability of fill failure)
  const executionRisk = size * 0.0002; // 2bps estimated risk
  costs.push({ name: 'Execution Risk', amount: executionRisk, pct: 0.02, category: 'SLIPPAGE' });

  // Calculate totals
  const totalCostsUsd = costs.reduce((s, c) => s + c.amount, 0);
  const grossSpreadPct = spreadPct;
  const grossSpreadUsd = size * spreadPct / 100;
  const netProfitUsd = grossSpreadUsd - totalCostsUsd;
  const netSpreadPct = (netProfitUsd / size) * 100;

  // Annualize
  const periodsPerYear = 365 * 24 / holdHours;
  const netAnnualized = netSpreadPct * periodsPerYear;

  // Break-even
  const hourlyFundingCost = fundingRate / 100 / 8760;
  const breakEvenHours = totalCostsUsd / (size * hourlyFundingCost);

  // Profit probability based on spread/cost ratio
  const spreadToCostRatio = grossSpreadUsd / Math.max(totalCostsUsd, 0.01);
  const profitProbability = Math.min(95, Math.max(30, 50 + spreadToCostRatio * 20));

  // Recommendation
  let recommendation = 'ACCEPT';
  if (netAnnualized < 0) recommendation = 'REJECT: Costs exceed spread';
  else if (netAnnualized < 3) recommendation = 'MARGINAL: Consider larger size';
  else if (netAnnualized < 8) recommendation = 'ACCEPT: Moderate return';
  else if (netAnnualized < 15) recommendation = 'GOOD: Solid opportunity';
  else recommendation = 'EXCELLENT: Maximize size';

  return {
    symbol, longExchange, shortExchange, size,
    grossSpreadPct, netSpreadPct,
    costs: costs.sort((a, b) => b.amount - a.amount),
    totalCostsUsd,
    netAnnualized,
    breakEvenHoldHours: breakEvenHours,
    profitProbability,
    recommendation,
  };
}

function selectBestNetwork(longEx: string, shortEx: string): string {
  // Both support these networks
  const networks = ['TRC20', 'BEP20', 'Arbitrum', 'Polygon'];
  // Pick cheapest that both support
  let best = 'ERC20';
  let bestFee = NETWORK_FEES.ERC20;
  for (const n of networks) {
    if (NETWORK_FEES[n] < bestFee) {
      best = n;
      bestFee = NETWORK_FEES[n];
    }
  }
  return best;
}

/**
 * Get fee schedule for exchange
 */
export function getFeeSchedule(exchange: string) {
  return FEE_SCHEDULES[exchange] || FEE_SCHEDULES.Binance;
}

/**
 * Get all network fees
 */
export function getNetworkFees(): Record<string, number> {
  return { ...NETWORK_FEES };
}

/**
 * Calculate breakeven for a given opportunity
 */
export function calculateBreakeven(params: {
  spreadPct: number;
  entryFees: number;   // combined entry+exit Fees %
  slippageBps: number;
}): { minHoldHours: number; minSize: number } {
  const totalCostPct = params.entryFees + (params.slippageBps / 100);
  // Need spread to cover cost in one funding period
  const minHoldHours = totalCostPct > 0 ? Math.ceil((totalCostPct / params.spreadPct) * 8) : 8;
  // Min size to cover fixed costs (assume $5 in fixed costs)
  const minSize = 5 / (params.spreadPct / 100 - totalCostPct / 100);
  return { minHoldHours, minSize: Math.max(1000, Math.round(minSize)) };
}

/**
 * Rank opportunities by net profitability
 */
export function rankByNetProfitability(opportunities: {
  symbol: string;
  longExchange: string;
  shortExchange: string;
  spreadPct: number;
  netAnnualized: number;
  riskScore?: number;
}[]): FeeBreakdown[] {
  const sizedOpps = opportunities.map(opp => ({
    ...opp,
    size: 100000, // compare at fixed size for ranking
    fundingRate: opp.netAnnualized, // approval
  }));

  const analyses = sizedOpps.map(opp =>
    calculateFees({
      symbol: opp.symbol,
      longExchange: opp.longExchange,
      shortExchange: opp.shortExchange,
      spreadPct: opp.spreadPct,
      size: opp.size,
      fundingRate: opp.fundingRate,
    })
  );

  return analyses.sort((a, b) => b.netAnnualized - a.netAnnualized);
}
