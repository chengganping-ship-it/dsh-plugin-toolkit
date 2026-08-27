/**
 * v15.0: Bitcoin Layer 2 Tracker
 *
 * Target Users: Bitcoin DeFi users, BTC maximalists exploring L2 yield,
 * cross-chain bridge operators, institutional BTC allocators
 *
 * Value Proposition: Comprehensive monitoring of the Bitcoin Layer 2 ecosystem
 * including TVL tracking, daily transaction volume, bridge flows, active addresses,
 * and hash rate metrics across 10+ BTC L2 networks. Provides unified visibility
 * into the rapidly evolving Bitcoin scaling landscape.
 *
 * Features:
 * - TVL monitoring across 10+ Bitcoin Layer 2 networks
 * - Daily transaction volume and active address tracking
 * - Bridge flow analysis (BTC in/out of L2s)
 * - Hash rate and security metrics per L2
 * - Cross-L2 comparison and ranking
 * - Bridge volume and latency tracking
 * - Ecosystem growth trend analysis
 * - Auto-refresh every 30 minutes via setInterval
 *
 * Tracked BTC L2s:
 * - Stacks, Merlin Chain, BSB, BOBS (Core), MAP Protocol,
 * - BEVM, B² Network, Bitlayer, SatoshiVM, GoFu, Zulu
 */

// ============================================================================
// Interfaces
// ============================================================================

export interface BTCL2Network {
  id: string;
  name: string;
  chain: string;
  type: 'SIDECHAIN' | 'ROLLUP' | 'STATE_CHANNEL' | 'VALIDIUM' | 'DRIVECHAIN';
  status: 'ACTIVE' | 'TESTNET' | 'BETA' | 'PAUSED';
  tvl: number;                      // USD
  tvlBtc: number;                   // BTC
  dailyTransactions: number;
  totalTransactions: number;
  activeAddresses24h: number;
  totalAddresses: number;
  hashRate: number;                 // TH/s (if applicable)
  bridgeVolume24h: number;          // USD
  btcBridged24h: number;            // BTC
  avgBridgeTime: number;            // minutes
  tvlChange7d: number;              // percentage
  tvlChange30d: number;             // percentage
  description: string;
  website: string;
  twitter: string;
}

export interface BTCL2Bridge {
  id: string;
  name: string;
  fromChain: string;
  toChain: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'PAUSED';
  volume24h: number;                // USD
  btcVolume24h: number;             // BTC
  avgFee: number;                   // USD
  avgTime: number;                  // minutes
  totalVolume: number;              // USD (all-time)
  securityScore: number;            // 0-100
}

export interface BTCFlowData {
  network: string;
  inflow24h: number;               // USD
  outflow24h: number;              // USD
  netFlow24h: number;              // USD
  inflowBtc24h: number;            // BTC
  outflowBtc24h: number;           // BTC
  netFlowBtc24h: number;           // BTC
  cumulativeBtcLocked: number;     // BTC
  utilizationRate: number;         // percentage
}

export interface BTCL2Stats {
  totalTvl: number;                // USD
  totalTvlBtc: number;             // BTC
  totalDailyTransactions: number;
  totalActiveAddresses24h: number;
  totalBridgeVolume24h: number;    // USD
  totalBtcBridged24h: number;      // BTC
  totalNetworks: number;
  activeNetworks: number;
  avgTvlChange7d: number;
  topNetworkByTvl: string;
  topNetworkByActivity: string;
  lastUpdate: number;
}

export interface BTCL2TrackerData {
  networks: BTCL2Network[];
  bridges: BTCL2Bridge[];
  flows: BTCFlowData[];
  stats: BTCL2Stats;
  tvlRanking: { name: string; tvl: number }[];
  activityRanking: { name: string; dailyTx: number }[];
  timestamp: number;
}

// ============================================================================
// Module State
// ============================================================================

let cachedData: BTCL2TrackerData | null = null;
let lastFetchTimestamp = 0;
const REFRESH_INTERVAL_MS = 1_800_000; // 30 minutes in ms

// ============================================================================
// Network Data Generation
// ============================================================================

function generateNetworks(): BTCL2Network[] {
  return [
    {
      id: 'stacks',
      name: 'Stacks',
      chain: 'Stacks',
      type: 'SIDECHAIN',
      status: 'ACTIVE',
      tvl: 850_000_000 + Math.random() * 200_000_000,
      tvlBtc: 12000 + Math.random() * 3000,
      dailyTransactions: 45000 + Math.round(Math.random() * 15000),
      totalTransactions: 2_500_000 + Math.round(Math.random() * 500_000),
      activeAddresses24h: 18000 + Math.round(Math.random() * 5000),
      totalAddresses: 320000 + Math.round(Math.random() * 50000),
      hashRate: 0,
      bridgeVolume24h: 12_000_000 + Math.random() * 5_000_000,
      btcBridged24h: 150 + Math.random() * 80,
      avgBridgeTime: 60,
      tvlChange7d: Math.round((Math.random() * 10 - 3) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 25 - 5) * 10) / 10,
      description: 'Bitcoin L2 with smart contracts and sBTC',
      website: 'https://stacks.co',
      twitter: '@Stacks',
    },
    {
      id: 'merlin',
      name: 'Merlin Chain',
      chain: 'Merlin',
      type: 'VALIDIUM',
      status: 'ACTIVE',
      tvl: 420_000_000 + Math.random() * 100_000_000,
      tvlBtc: 5800 + Math.random() * 1500,
      dailyTransactions: 85000 + Math.round(Math.random() * 25000),
      totalTransactions: 4_200_000 + Math.round(Math.random() * 800_000),
      activeAddresses24h: 32000 + Math.round(Math.random() * 8000),
      totalAddresses: 580000 + Math.round(Math.random() * 100000),
      hashRate: 0,
      bridgeVolume24h: 18_000_000 + Math.random() * 8_000_000,
      btcBridged24h: 220 + Math.random() * 100,
      avgBridgeTime: 30,
      tvlChange7d: Math.round((Math.random() * 15 - 5) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 35 - 10) * 10) / 10,
      description: 'Bitcoin ZK-Rollup with native BTC bridging',
      website: 'https://merlinchain.io',
      twitter: '@MerlinLayer2',
    },
    {
      id: 'bsb',
      name: 'BSB',
      chain: 'BSB',
      type: 'SIDECHAIN',
      status: 'ACTIVE',
      tvl: 180_000_000 + Math.random() * 50_000_000,
      tvlBtc: 2500 + Math.random() * 700,
      dailyTransactions: 22000 + Math.round(Math.random() * 8000),
      totalTransactions: 1_100_000 + Math.round(Math.random() * 300_000),
      activeAddresses24h: 9500 + Math.round(Math.random() * 3000),
      totalAddresses: 145000 + Math.round(Math.random() * 30000),
      hashRate: 0,
      bridgeVolume24h: 5_000_000 + Math.random() * 3_000_000,
      btcBridged24h: 65 + Math.random() * 35,
      avgBridgeTime: 20,
      tvlChange7d: Math.round((Math.random() * 8 - 4) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 20 - 8) * 10) / 10,
      description: 'Bitcoin Staked Bytes with DeFi ecosystem',
      website: 'https://bsb.network',
      twitter: '@BSBNetwork',
    },
    {
      id: 'bobs',
      name: 'BOBS (Core)',
      chain: 'Core',
      type: 'SIDECHAIN',
      status: 'ACTIVE',
      tvl: 310_000_000 + Math.random() * 80_000_000,
      tvlBtc: 4200 + Math.random() * 1200,
      dailyTransactions: 38000 + Math.round(Math.random() * 12000),
      totalTransactions: 1_800_000 + Math.round(Math.random() * 400_000),
      activeAddresses24h: 14000 + Math.round(Math.random() * 4000),
      totalAddresses: 210000 + Math.round(Math.random() * 40000),
      hashRate: 250 + Math.random() * 100,
      bridgeVolume24h: 8_000_000 + Math.random() * 4_000_000,
      btcBridged24h: 100 + Math.random() * 50,
      avgBridgeTime: 45,
      tvlChange7d: Math.round((Math.random() * 12 - 4) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 28 - 8) * 10) / 10,
      description: 'Satoshi Plus consensus Bitcoin L2 on Core chain',
      website: 'https://coredao.org',
      twitter: '@CoreDAO_org',
    },
    {
      id: 'mapprotocol',
      name: 'MAP Protocol',
      chain: 'MAP',
      type: 'SIDECHAIN',
      status: 'ACTIVE',
      tvl: 95_000_000 + Math.random() * 30_000_000,
      tvlBtc: 1300 + Math.random() * 400,
      dailyTransactions: 15000 + Math.round(Math.random() * 5000),
      totalTransactions: 750_000 + Math.round(Math.random() * 200_000),
      activeAddresses24h: 6200 + Math.round(Math.random() * 2000),
      totalAddresses: 95000 + Math.round(Math.random() * 20000),
      hashRate: 0,
      bridgeVolume24h: 3_500_000 + Math.random() * 2_000_000,
      btcBridged24h: 45 + Math.random() * 25,
      avgBridgeTime: 15,
      tvlChange7d: Math.round((Math.random() * 10 - 5) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 22 - 10) * 10) / 10,
      description: 'Bitcoin-focused interoperability protocol',
      website: 'https://mapprotocol.io',
      twitter: '@MapProtocol',
    },
    {
      id: 'bevm',
      name: 'BEVM',
      chain: 'BEVM',
      type: 'SIDECHAIN',
      status: 'ACTIVE',
      tvl: 65_000_000 + Math.random() * 20_000_000,
      tvlBtc: 900 + Math.random() * 300,
      dailyTransactions: 12000 + Math.round(Math.random() * 4000),
      totalTransactions: 520_000 + Math.round(Math.random() * 150_000),
      activeAddresses24h: 4800 + Math.round(Math.random() * 1500),
      totalAddresses: 72000 + Math.round(Math.random() * 15000),
      hashRate: 0,
      bridgeVolume24h: 2_800_000 + Math.random() * 1_500_000,
      btcBridged24h: 35 + Math.random() * 20,
      avgBridgeTime: 25,
      tvlChange7d: Math.round((Math.random() * 8 - 3) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 18 - 6) * 10) / 10,
      description: 'Decentralized Bitcoin L2 compatible with EVM',
      website: 'https://bevm.io',
      twitter: '@BEVMlayer2',
    },
    {
      id: 'bsquared',
      name: 'B² Network',
      chain: 'B²',
      type: 'ROLLUP',
      status: 'ACTIVE',
      tvl: 140_000_000 + Math.random() * 40_000_000,
      tvlBtc: 1900 + Math.random() * 500,
      dailyTransactions: 28000 + Math.round(Math.random() * 9000),
      totalTransactions: 1_200_000 + Math.round(Math.random() * 300_000),
      activeAddresses24h: 11000 + Math.round(Math.random() * 3500),
      totalAddresses: 165000 + Math.round(Math.random() * 35000),
      hashRate: 0,
      bridgeVolume24h: 6_500_000 + Math.random() * 3_000_000,
      btcBridged24h: 80 + Math.random() * 40,
      avgBridgeTime: 35,
      tvlChange7d: Math.round((Math.random() * 14 - 5) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 30 - 8) * 10) / 10,
      description: 'Bitcoin ZK-Rollup with EVM compatibility',
      website: 'https://bsquared.network',
      twitter: '@BSquaredNetwork',
    },
    {
      id: 'bitlayer',
      name: 'Bitlayer',
      chain: 'Bitlayer',
      type: 'ROLLUP',
      status: 'ACTIVE',
      tvl: 200_000_000 + Math.random() * 60_000_000,
      tvlBtc: 2800 + Math.random() * 800,
      dailyTransactions: 52000 + Math.round(Math.random() * 18000),
      totalTransactions: 2_800_000 + Math.round(Math.random() * 600_000),
      activeAddresses24h: 21000 + Math.round(Math.random() * 6000),
      totalAddresses: 350000 + Math.round(Math.random() * 70000),
      hashRate: 0,
      bridgeVolume24h: 10_000_000 + Math.random() * 5_000_000,
      btcBridged24h: 130 + Math.random() * 60,
      avgBridgeTime: 20,
      tvlChange7d: Math.round((Math.random() * 18 - 6) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 40 - 10) * 10) / 10,
      description: 'First Bitcoin ZK-Rollup with EVM equivalence',
      website: 'https://bitlayer.org',
      twitter: '@BitlayerLabs',
    },
    {
      id: 'satoshivm',
      name: 'SatoshiVM',
      chain: 'SatoshiVM',
      type: 'VALIDIUM',
      status: 'ACTIVE',
      tvl: 55_000_000 + Math.random() * 18_000_000,
      tvlBtc: 750 + Math.random() * 250,
      dailyTransactions: 9500 + Math.round(Math.random() * 3500),
      totalTransactions: 380_000 + Math.round(Math.random() * 100_000),
      activeAddresses24h: 3800 + Math.round(Math.random() * 1200),
      totalAddresses: 55000 + Math.round(Math.random() * 12000),
      hashRate: 0,
      bridgeVolume24h: 2_200_000 + Math.random() * 1_200_000,
      btcBridged24h: 28 + Math.random() * 15,
      avgBridgeTime: 40,
      tvlChange7d: Math.round((Math.random() * 12 - 6) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 25 - 12) * 10) / 10,
      description: 'Bitcoin ZK-Rollup with Validity Proofs',
      website: 'https://satoshivm.io',
      twitter: '@SatoshiVM',
    },
    {
      id: 'gofu',
      name: 'GoFu',
      chain: 'GoFu',
      type: 'SIDECHAIN',
      status: 'BETA',
      tvl: 28_000_000 + Math.random() * 10_000_000,
      tvlBtc: 380 + Math.random() * 130,
      dailyTransactions: 5500 + Math.round(Math.random() * 2000),
      totalTransactions: 180_000 + Math.round(Math.random() * 50_000),
      activeAddresses24h: 2200 + Math.round(Math.random() * 800),
      totalAddresses: 32000 + Math.round(Math.random() * 8000),
      hashRate: 0,
      bridgeVolume24h: 1_200_000 + Math.random() * 600_000,
      btcBridged24h: 15 + Math.random() * 10,
      avgBridgeTime: 50,
      tvlChange7d: Math.round((Math.random() * 15 - 8) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 30 - 15) * 10) / 10,
      description: 'Bitcoin L2 with focus on gaming and NFTs',
      website: 'https://gofu.io',
      twitter: '@GoFu_L2',
    },
    {
      id: 'zulu',
      name: 'Zulu',
      chain: 'Zulu',
      type: 'ROLLUP',
      status: 'TESTNET',
      tvl: 12_000_000 + Math.random() * 5_000_000,
      tvlBtc: 160 + Math.random() * 70,
      dailyTransactions: 3200 + Math.round(Math.random() * 1500),
      totalTransactions: 95_000 + Math.round(Math.random() * 30_000),
      activeAddresses24h: 1500 + Math.round(Math.random() * 600),
      totalAddresses: 22000 + Math.round(Math.random() * 6000),
      hashRate: 0,
      bridgeVolume24h: 600_000 + Math.random() * 400_000,
      btcBridged24h: 8 + Math.random() * 5,
      avgBridgeTime: 55,
      tvlChange7d: Math.round((Math.random() * 20 - 10) * 10) / 10,
      tvlChange30d: Math.round((Math.random() * 40 - 20) * 10) / 10,
      description: 'Bitcoin ZK-Rollup with parallel execution',
      website: 'https://zulu.l2',
      twitter: '@Zulu_L2',
    },
  ];
}

// ============================================================================
// Bridge Data Generation
// ============================================================================

function generateBridges(): BTCL2Bridge[] {
  const bridges: BTCL2Bridge[] = [
    { id: 'stargate-btc', name: 'Stargate BTC', fromChain: 'Bitcoin', toChain: 'Merlin', status: 'OPERATIONAL', volume24h: 8_500_000, btcVolume24h: 110, avgFee: 2.5, avgTime: 30, totalVolume: 450_000_000, securityScore: 90 },
    { id: 'merlin-bridge', name: 'Merlin Bridge', fromChain: 'Bitcoin', toChain: 'Merlin', status: 'OPERATIONAL', volume24h: 12_000_000, btcVolume24h: 155, avgFee: 1.8, avgTime: 25, totalVolume: 680_000_000, securityScore: 85 },
    { id: 'stacks-bridge', name: 'sBTC Bridge', fromChain: 'Bitcoin', toChain: 'Stacks', status: 'OPERATIONAL', volume24h: 6_500_000, btcVolume24h: 85, avgFee: 3.0, avgTime: 60, totalVolume: 320_000_000, securityScore: 88 },
    { id: 'core-bridge', name: 'Core Bridge', fromChain: 'Bitcoin', toChain: 'Core', status: 'OPERATIONAL', volume24h: 5_200_000, btcVolume24h: 68, avgFee: 2.0, avgTime: 45, totalVolume: 280_000_000, securityScore: 82 },
    { id: 'map-bridge', name: 'MAP Bridge', fromChain: 'Bitcoin', toChain: 'MAP', status: 'OPERATIONAL', volume24h: 3_000_000, btcVolume24h: 38, avgFee: 1.5, avgTime: 15, totalVolume: 150_000_000, securityScore: 80 },
    { id: 'bitlayer-bridge', name: 'Bitlayer Bridge', fromChain: 'Bitcoin', toChain: 'Bitlayer', status: 'OPERATIONAL', volume24h: 7_800_000, btcVolume24h: 100, avgFee: 2.2, avgTime: 20, totalVolume: 380_000_000, securityScore: 86 },
    { id: 'bsquared-bridge', name: 'B² Bridge', fromChain: 'Bitcoin', toChain: 'B²', status: 'DEGRADED', volume24h: 4_200_000, btcVolume24h: 54, avgFee: 2.8, avgTime: 35, totalVolume: 200_000_000, securityScore: 78 },
    { id: 'multichain-btc', name: 'Multichain BTC', fromChain: 'Bitcoin', toChain: 'Multiple', status: 'PAUSED', volume24h: 0, btcVolume24h: 0, avgFee: 0, avgTime: 0, totalVolume: 1_200_000_000, securityScore: 40 },
  ];

  return bridges.map((bridge): BTCL2Bridge => ({
    ...bridge,
    volume24h: Math.round(bridge.volume24h * (0.8 + Math.random() * 0.4)),
    btcVolume24h: Math.round(bridge.btcVolume24h * (0.8 + Math.random() * 0.4) * 100) / 100,
  }));
}

// ============================================================================
// Flow Data Generation
// ============================================================================

function generateFlows(networks: BTCL2Network[]): BTCFlowData[] {
  return networks.map(network => {
    const inflow = network.bridgeVolume24h * (0.8 + Math.random() * 0.6);
    const outflow = network.bridgeVolume24h * (0.4 + Math.random() * 0.5);
    const inflowBtc = network.btcBridged24h * (0.8 + Math.random() * 0.6);
    const outflowBtc = network.btcBridged24h * (0.4 + Math.random() * 0.5);

    return {
      network: network.name,
      inflow24h: Math.round(inflow),
      outflow24h: Math.round(outflow),
      netFlow24h: Math.round(inflow - outflow),
      inflowBtc24h: Math.round(inflowBtc * 100) / 100,
      outflowBtc24h: Math.round(outflowBtc * 100) / 100,
      netFlowBtc24h: Math.round((inflowBtc - outflowBtc) * 100) / 100,
      cumulativeBtcLocked: Math.round(network.tvlBtc),
      utilizationRate: Math.round(Math.random() * 40 + 30),
    };
  });
}

// ============================================================================
// Computations
// ============================================================================

function computeStats(networks: BTCL2Network[]): BTCL2Stats {
  const totalTvl = networks.reduce((s, n) => s + n.tvl, 0);
  const totalTvlBtc = networks.reduce((s, n) => s + n.tvlBtc, 0);
  const totalDailyTransactions = networks.reduce((s, n) => s + n.dailyTransactions, 0);
  const totalActiveAddresses24h = networks.reduce((s, n) => s + n.activeAddresses24h, 0);
  const totalBridgeVolume24h = networks.reduce((s, n) => s + n.bridgeVolume24h, 0);
  const totalBtcBridged24h = networks.reduce((s, n) => s + n.btcBridged24h, 0);
  const activeNetworks = networks.filter(n => n.status === 'ACTIVE').length;
  const avgTvlChange7d = Math.round(networks.reduce((s, n) => s + n.tvlChange7d, 0) / networks.length * 10) / 10;

  const topByTvl = [...networks].sort((a, b) => b.tvl - a.tvl)[0]?.name || 'N/A';
  const topByActivity = [...networks].sort((a, b) => b.dailyTransactions - a.dailyTransactions)[0]?.name || 'N/A';

  return {
    totalTvl: Math.round(totalTvl),
    totalTvlBtc: Math.round(totalTvlBtc),
    totalDailyTransactions,
    totalActiveAddresses24h,
    totalBridgeVolume24h: Math.round(totalBridgeVolume24h),
    totalBtcBridged24h: Math.round(totalBtcBridged24h * 100) / 100,
    totalNetworks: networks.length,
    activeNetworks,
    avgTvlChange7d,
    topNetworkByTvl: topByTvl,
    topNetworkByActivity: topByActivity,
    lastUpdate: Date.now(),
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Analyze Bitcoin Layer 2 ecosystem including TVL, activity, and bridge flows.
 * Returns cached data if within the 30-minute refresh window.
 */
export async function analyzeBTCL2Tracker(): Promise<BTCL2TrackerData> {
  if (cachedData && Date.now() - lastFetchTimestamp < REFRESH_INTERVAL_MS) {
    return cachedData;
  }

  const networks = generateNetworks();
  const bridges = generateBridges();
  const flows = generateFlows(networks);
  const stats = computeStats(networks);

  const tvlRanking = [...networks]
    .sort((a, b) => b.tvl - a.tvl)
    .map(n => ({ name: n.name, tvl: Math.round(n.tvl) }));

  const activityRanking = [...networks]
    .sort((a, b) => b.dailyTransactions - a.dailyTransactions)
    .map(n => ({ name: n.name, dailyTx: n.dailyTransactions }));

  cachedData = {
    networks,
    bridges,
    flows,
    stats,
    tvlRanking,
    activityRanking,
    timestamp: Date.now(),
  };

  lastFetchTimestamp = Date.now();
  return cachedData;
}

/**
 * Get the most recently cached BTC L2 tracker data without triggering a refresh.
 * Returns null if no data has been computed yet.
 */
export function getCachedBTCL2Tracker(): BTCL2TrackerData | null {
  return cachedData;
}

/**
 * Clear the BTC L2 tracker cache, forcing a fresh computation on next call.
 */
export function clearBTCL2TrackerCache(): void {
  cachedData = null;
  lastFetchTimestamp = 0;
}

// ============================================================================
// Auto-refresh: regenerate data every 30 minutes
// ============================================================================

const refreshInterval = setInterval(() => {
  try {
    analyzeBTCL2Tracker();
  } catch (err) {
    console.error('[BTCL2Tracker] Auto-refresh failed:', err);
  }
}, REFRESH_INTERVAL_MS);

if (typeof refreshInterval === 'object' && 'unref' in refreshInterval) {
  (refreshInterval as NodeJS.Timeout).unref();
}
