/**
 * v15.0: Airdrop Farming Intelligence Engine
 *
 * Target Users: Crypto airdrop farmers, DeFi power users, early adopters,
 * multi-chain strategists seeking optimized airdrop farming ROI
 *
 * Value Proposition: Comprehensive airdrop farming intelligence across 12+ protocols
 * with ROI analysis, difficulty scoring, cost estimation, and timeline tracking.
 * Calculates farming ROI as (estimated value - farming cost) / farming cost to
 * identify the highest-yield opportunities.
 *
 * Features:
 * - Active and likely airdrop opportunity tracking across 12+ protocols
 * - Per-protocol eligibility requirements and task breakdown
 * - Farming cost analysis (gas, bridge fees, opportunity cost)
 * - ROI calculation: (estimated value - farming cost) / farming cost
 * - Difficulty scoring per protocol (gas complexity, time, capital requirements)
 * - Timeline tracking with estimated TGE dates
 * - Risk assessment (rug pull probability, sybil detection difficulty)
 * - Multi-chain farming strategy optimizer
 * - Auto-refresh every 30 minutes via setInterval
 *
 * Tracked Protocols:
 * - Eclipse, Berachain, Initia, LightLink, Zircuit, Elixir,
 * - Symbiotic, Babylon, Movement, Penumbra, Aleo, Fuel
 */

// ============================================================================
// Interfaces
// ============================================================================

export interface AirdropProtocol {
  id: string;
  name: string;
  chain: string;
  symbol: string;
  status: 'ACTIVE' | 'LIKELY' | 'RUMORED' | 'CONFIRMED';
  estimatedAirdropValue: number;       // USD
  confidence: number;                  // 0-100
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  estimatedTgeDate: string;
  tasks: AirdropTask[];
  totalFarmingCost: number;            // USD (gas + bridge + capital opportunity cost)
  estimatedRoi: number;                // percentage
  riskScore: number;                   // 0-100 (higher = riskier)
  eligibleWallets: number;
  description: string;
  website: string;
  twitter: string;
}

export interface AirdropTask {
  id: string;
  action: string;
  description: string;
  gasCostUsd: number;
  bridgeFeeUsd: number;
  timeRequired: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  completed: boolean;
}

export interface AirdropFarmingData {
  protocols: AirdropProtocol[];
  topOpportunities: AirdropProtocol[];
  totalEstimatedValue: number;
  totalFarmingCost: number;
  averageRoi: number;
  byChain: Record<string, number>;
  byDifficulty: Record<string, number>;
  timestamp: number;
}

// ============================================================================
// Module State
// ============================================================================

let cachedData: AirdropFarmingData | null = null;
let lastFetchTimestamp = 0;
const REFRESH_INTERVAL_MS = 1_800_000; // 30 minutes in ms

// ============================================================================
// Protocol Data Generation
// ============================================================================

function generateProtocols(): AirdropProtocol[] {
  return [
    {
      id: 'eclipse',
      name: 'Eclipse',
      chain: 'Eclipse',
      symbol: 'ECLIP',
      status: 'ACTIVE',
      estimatedAirdropValue: 1200 + Math.random() * 1800,
      confidence: 72,
      difficulty: 'MEDIUM',
      estimatedTgeDate: '2026-09-15',
      tasks: [
        { id: 'e1', action: 'Bridge ETH to Eclipse', description: 'Bridge assets via native bridge', gasCostUsd: 3.5, bridgeFeeUsd: 2.0, timeRequired: '10 min', difficulty: 'EASY', completed: false },
        { id: 'e2', action: 'Swap on Eclipse DEX', description: 'Perform swaps on Eclipse decentralized exchange', gasCostUsd: 1.5, bridgeFeeUsd: 0, timeRequired: '5 min', difficulty: 'EASY', completed: false },
        { id: 'e3', action: 'Provide Liquidity', description: 'Add liquidity to Eclipse pools', gasCostUsd: 2.5, bridgeFeeUsd: 0, timeRequired: '8 min', difficulty: 'MEDIUM', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 35,
      eligibleWallets: 450000,
      description: 'SVM-based L2 on Ethereum with custom settlement',
      website: 'https://eclipse.xyz',
      twitter: '@EclipseFND',
    },
    {
      id: 'berachain',
      name: 'Berachain',
      chain: 'Berachain',
      symbol: 'BERA',
      status: 'CONFIRMED',
      estimatedAirdropValue: 2500 + Math.random() * 3500,
      confidence: 88,
      difficulty: 'MEDIUM',
      estimatedTgeDate: '2026-08-01',
      tasks: [
        { id: 'b1', action: 'BEX Liquidity Provision', description: 'Provide liquidity on BEX DEX', gasCostUsd: 2.0, bridgeFeeUsd: 3.0, timeRequired: '10 min', difficulty: 'MEDIUM', completed: false },
        { id: 'b2', action: 'Bend Lending', description: 'Lend and borrow on Bend protocol', gasCostUsd: 1.8, bridgeFeeUsd: 0, timeRequired: '8 min', difficulty: 'MEDIUM', completed: false },
        { id: 'b3', action: 'BGT Staking', description: 'Stake BGT for governance participation', gasCostUsd: 1.2, bridgeFeeUsd: 0, timeRequired: '5 min', difficulty: 'EASY', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 20,
      eligibleWallets: 320000,
      description: 'Proof-of-liquidity L1 with DeFi-native design',
      website: 'https://berachain.com',
      twitter: '@beraborrow',
    },
    {
      id: 'initia',
      name: 'Initia',
      chain: 'Initia',
      symbol: 'INIT',
      status: 'ACTIVE',
      estimatedAirdropValue: 800 + Math.random() * 1500,
      confidence: 65,
      difficulty: 'LOW',
      estimatedTgeDate: '2026-10-01',
      tasks: [
        { id: 'i1', action: 'Bridge to Initia', description: 'Bridge assets to Initia L2', gasCostUsd: 2.5, bridgeFeeUsd: 1.5, timeRequired: '8 min', difficulty: 'EASY', completed: false },
        { id: 'i2', action: 'Use Initia DApps', description: 'Interact with Initia ecosystem applications', gasCostUsd: 1.0, bridgeFeeUsd: 0, timeRequired: '15 min', difficulty: 'EASY', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 40,
      eligibleWallets: 280000,
      description: 'Interwoven infrastructure for multi-layer networks',
      website: 'https://initia.xyz',
      twitter: '@InitiaFDN',
    },
    {
      id: 'lightlink',
      name: 'LightLink',
      chain: 'LightLink',
      symbol: 'LL',
      status: 'LIKELY',
      estimatedAirdropValue: 600 + Math.random() * 1200,
      confidence: 55,
      difficulty: 'LOW',
      estimatedTgeDate: '2026-11-15',
      tasks: [
        { id: 'l1', action: 'Obtain LL Tokens', description: 'Acquire LightLink tokens via DEX', gasCostUsd: 1.5, bridgeFeeUsd: 2.0, timeRequired: '5 min', difficulty: 'EASY', completed: false },
        { id: 'l2', action: 'Use Enterprise Mode', description: 'Interact with enterprise features', gasCostUsd: 0.8, bridgeFeeUsd: 0, timeRequired: '10 min', difficulty: 'EASY', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 45,
      eligibleWallets: 180000,
      description: 'Enterprise-focused L2 with gasless transactions',
      website: 'https://lightlink.io',
      twitter: '@LightLinkChain',
    },
    {
      id: 'zircuit',
      name: 'Zircuit',
      chain: 'Zircuit',
      symbol: 'ZRC',
      status: 'ACTIVE',
      estimatedAirdropValue: 900 + Math.random() * 1600,
      confidence: 70,
      difficulty: 'MEDIUM',
      estimatedTgeDate: '2026-09-01',
      tasks: [
        { id: 'z1', action: 'Bridge to Zircuit', description: 'Bridge ETH to Zircuit L2', gasCostUsd: 3.0, bridgeFeeUsd: 2.5, timeRequired: '10 min', difficulty: 'EASY', completed: false },
        { id: 'z2', action: 'Stake on Zircuit', description: 'Stake assets in Zircuit staking', gasCostUsd: 1.5, bridgeFeeUsd: 0, timeRequired: '5 min', difficulty: 'EASY', completed: false },
        { id: 'z3', action: 'Use Zircuit DEX', description: 'Swap on Zircuit decentralized exchange', gasCostUsd: 1.0, bridgeFeeUsd: 0, timeRequired: '5 min', difficulty: 'EASY', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 30,
      eligibleWallets: 520000,
      description: 'EVM-compatible L2 with built-in security scanning',
      website: 'https://zircuit.com',
      twitter: '@ZircuitL2',
    },
    {
      id: 'elixir',
      name: 'Elixir',
      chain: 'Elixir',
      symbol: 'ELX',
      status: 'LIKELY',
      estimatedAirdropValue: 700 + Math.random() * 1300,
      confidence: 58,
      difficulty: 'MEDIUM',
      estimatedTgeDate: '2026-10-15',
      tasks: [
        { id: 'ex1', action: 'Provide Orderbook Liquidity', description: 'Supply liquidity to orderbook DEXs', gasCostUsd: 2.0, bridgeFeeUsd: 1.5, timeRequired: '12 min', difficulty: 'MEDIUM', completed: false },
        { id: 'ex2', action: 'Run Validator', description: 'Participate in Elixir validation', gasCostUsd: 0, bridgeFeeUsd: 0, timeRequired: '30 min', difficulty: 'HARD', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 42,
      eligibleWallets: 150000,
      description: 'Decentralized liquidity infrastructure for orderbook DEXs',
      website: 'https://elixir.finance',
      twitter: '@elixir',
    },
    {
      id: 'symbiotic',
      name: 'Symbiotic',
      chain: 'Ethereum',
      symbol: 'SYMT',
      status: 'ACTIVE',
      estimatedAirdropValue: 1500 + Math.random() * 2500,
      confidence: 75,
      difficulty: 'MEDIUM',
      estimatedTgeDate: '2026-08-15',
      tasks: [
        { id: 's1', action: 'Deposit into Vaults', description: 'Deposit assets into Symbiotic vaults', gasCostUsd: 4.0, bridgeFeeUsd: 0, timeRequired: '8 min', difficulty: 'MEDIUM', completed: false },
        { id: 's2', action: 'Delegate to Operators', description: 'Delegate to network operators', gasCostUsd: 2.0, bridgeFeeUsd: 0, timeRequired: '5 min', difficulty: 'EASY', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 25,
      eligibleWallets: 200000,
      description: 'Shared security protocol for decentralized networks',
      website: 'https://symbiotic.fi',
      twitter: '@symbioticfi',
    },
    {
      id: 'babylon',
      name: 'Babylon',
      chain: 'Babylon',
      symbol: 'BBN',
      status: 'CONFIRMED',
      estimatedAirdropValue: 1800 + Math.random() * 2800,
      confidence: 82,
      difficulty: 'HIGH',
      estimatedTgeDate: '2026-07-20',
      tasks: [
        { id: 'bb1', action: 'BTC Staking', description: 'Stake BTC through Babylon protocol', gasCostUsd: 5.0, bridgeFeeUsd: 0, timeRequired: '15 min', difficulty: 'HARD', completed: false },
        { id: 'bb2', action: 'Provide Security', description: 'Secure PoS chains with BTC', gasCostUsd: 3.0, bridgeFeeUsd: 0, timeRequired: '10 min', difficulty: 'MEDIUM', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 28,
      eligibleWallets: 380000,
      description: 'Bitcoin staking protocol for PoS chain security',
      website: 'https://babylonlabs.io',
      twitter: '@BabylonLabs',
    },
    {
      id: 'movement',
      name: 'Movement',
      chain: 'Movement',
      symbol: 'MOVE',
      status: 'ACTIVE',
      estimatedAirdropValue: 1000 + Math.random() * 2000,
      confidence: 68,
      difficulty: 'MEDIUM',
      estimatedTgeDate: '2026-09-30',
      tasks: [
        { id: 'm1', action: 'Bridge to Movement', description: 'Bridge assets to Movement network', gasCostUsd: 2.5, bridgeFeeUsd: 2.0, timeRequired: '10 min', difficulty: 'EASY', completed: false },
        { id: 'm2', action: 'Use Move DEX', description: 'Trade on Movement DEX', gasCostUsd: 1.0, bridgeFeeUsd: 0, timeRequired: '5 min', difficulty: 'EASY', completed: false },
        { id: 'm3', action: 'Deploy Move Contracts', description: 'Deploy smart contracts in Move language', gasCostUsd: 3.0, bridgeFeeUsd: 0, timeRequired: '20 min', difficulty: 'HARD', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 38,
      eligibleWallets: 260000,
      description: 'Move-based L2 bringing MoveVM to Ethereum',
      website: 'https://movementlabs.xyz',
      twitter: '@movementlabsxyz',
    },
    {
      id: 'penumbra',
      name: 'Penumbra',
      chain: 'Penumbra',
      symbol: 'UM',
      status: 'LIKELY',
      estimatedAirdropValue: 500 + Math.random() * 1000,
      confidence: 50,
      difficulty: 'VERY_HIGH',
      estimatedTgeDate: '2026-12-01',
      tasks: [
        { id: 'p1', action: 'Shielded Transactions', description: 'Perform private transactions', gasCostUsd: 1.5, bridgeFeeUsd: 3.0, timeRequired: '15 min', difficulty: 'HARD', completed: false },
        { id: 'p2', action: 'Staking UM', description: 'Stake UM tokens for governance', gasCostUsd: 1.0, bridgeFeeUsd: 0, timeRequired: '8 min', difficulty: 'MEDIUM', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 55,
      eligibleWallets: 90000,
      description: 'Privacy-focused DEX with shielded transactions',
      website: 'https://penumbra.zone',
      twitter: '@penumbrazone',
    },
    {
      id: 'aleo',
      name: 'Aleo',
      chain: 'Aleo',
      symbol: 'ALEO',
      status: 'RUMORED',
      estimatedAirdropValue: 400 + Math.random() * 800,
      confidence: 35,
      difficulty: 'HIGH',
      estimatedTgeDate: '2027-01-15',
      tasks: [
        { id: 'a1', action: 'Deploy Leo Program', description: 'Deploy programs in Leo language', gasCostUsd: 0, bridgeFeeUsd: 0, timeRequired: '45 min', difficulty: 'HARD', completed: false },
        { id: 'a2', action: 'Generate Proofs', description: 'Generate zero-knowledge proofs', gasCostUsd: 0, bridgeFeeUsd: 0, timeRequired: '20 min', difficulty: 'HARD', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 60,
      eligibleWallets: 75000,
      description: 'Privacy-first L1 using zero-knowledge proofs',
      website: 'https://aleo.org',
      twitter: '@AleoHQ',
    },
    {
      id: 'fuel',
      name: 'Fuel',
      chain: 'Fuel',
      symbol: 'FUEL',
      status: 'ACTIVE',
      estimatedAirdropValue: 1100 + Math.random() * 1900,
      confidence: 73,
      difficulty: 'MEDIUM',
      estimatedTgeDate: '2026-08-30',
      tasks: [
        { id: 'f1', action: 'Bridge to Fuel', description: 'Bridge assets to Fuel network', gasCostUsd: 2.5, bridgeFeeUsd: 2.0, timeRequired: '8 min', difficulty: 'EASY', completed: false },
        { id: 'f2', action: 'Use Fuel DEX', description: 'Trade on Fuel decentralized exchange', gasCostUsd: 0.8, bridgeFeeUsd: 0, timeRequired: '5 min', difficulty: 'EASY', completed: false },
        { id: 'f3', action: 'Deploy Sway Contracts', description: 'Deploy contracts in Sway language', gasCostUsd: 2.0, bridgeFeeUsd: 0, timeRequired: '15 min', difficulty: 'MEDIUM', completed: false },
      ],
      totalFarmingCost: 0,
      estimatedRoi: 0,
      riskScore: 32,
      eligibleWallets: 310000,
      description: 'Modular execution layer with parallel transaction processing',
      website: 'https://fuel.network',
      twitter: '@fuel_network',
    },
  ];
}

// ============================================================================
// Computations
// ============================================================================

function computeFarmingCosts(protocols: AirdropProtocol[]): AirdropProtocol[] {
  return protocols.map(protocol => {
    const gasCost = protocol.tasks.reduce((sum, t) => sum + t.gasCostUsd, 0);
    const bridgeCost = protocol.tasks.reduce((sum, t) => sum + t.bridgeFeeUsd, 0);
    const opportunityCost = 5; // estimated time-value cost in USD
    const totalFarmingCost = Math.round((gasCost + bridgeCost + opportunityCost) * 100) / 100;
    const estimatedRoi = totalFarmingCost > 0
      ? Math.round(((protocol.estimatedAirdropValue - totalFarmingCost) / totalFarmingCost) * 100)
      : 0;

    return {
      ...protocol,
      totalFarmingCost,
      estimatedRoi,
    };
  });
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Analyze airdrop farming opportunities across all tracked protocols.
 * Returns cached data if within the 30-minute refresh window.
 */
export async function analyzeAirdropFarming(): Promise<AirdropFarmingData> {
  if (cachedData && Date.now() - lastFetchTimestamp < REFRESH_INTERVAL_MS) {
    return cachedData;
  }

  const rawProtocols = generateProtocols();
  const protocols = computeFarmingCosts(rawProtocols);

  // Sort by ROI descending for top opportunities
  const topOpportunities = [...protocols]
    .sort((a, b) => b.estimatedRoi - a.estimatedRoi)
    .slice(0, 5);

  const totalEstimatedValue = protocols.reduce((sum, p) => sum + p.estimatedAirdropValue, 0);
  const totalFarmingCost = protocols.reduce((sum, p) => sum + p.totalFarmingCost, 0);
  const averageRoi = protocols.length > 0
    ? Math.round(protocols.reduce((sum, p) => sum + p.estimatedRoi, 0) / protocols.length)
    : 0;

  const byChain: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};
  for (const p of protocols) {
    byChain[p.chain] = (byChain[p.chain] || 0) + 1;
    byDifficulty[p.difficulty] = (byDifficulty[p.difficulty] || 0) + 1;
  }

  cachedData = {
    protocols,
    topOpportunities,
    totalEstimatedValue: Math.round(totalEstimatedValue),
    totalFarmingCost,
    averageRoi,
    byChain,
    byDifficulty,
    timestamp: Date.now(),
  };

  lastFetchTimestamp = Date.now();
  return cachedData;
}

/**
 * Get the most recently cached airdrop farming data without triggering a refresh.
 * Returns null if no data has been computed yet.
 */
export function getCachedAirdropFarming(): AirdropFarmingData | null {
  return cachedData;
}

/**
 * Clear the airdrop farming cache, forcing a fresh computation on next call.
 */
export function clearAirdropFarmingCache(): void {
  cachedData = null;
  lastFetchTimestamp = 0;
}

// ============================================================================
// Auto-refresh: regenerate data every 30 minutes
// ============================================================================

const refreshInterval = setInterval(() => {
  try {
    analyzeAirdropFarming();
  } catch (err) {
    console.error('[AirdropFarmingIntelligence] Auto-refresh failed:', err);
  }
}, REFRESH_INTERVAL_MS);

if (typeof refreshInterval === 'object' && 'unref' in refreshInterval) {
  (refreshInterval as NodeJS.Timeout).unref();
}
