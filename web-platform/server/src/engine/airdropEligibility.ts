/**
 * v2.0: Airdrop Eligibility & Estimated Value Engine
 *
 * Breakthrough: Comprehensive airdrop intelligence engine that tracks qualification
 * status, estimates potential reward value, and prioritizes actions across 10 major
 * upcoming/ongoing airdrop campaigns. Simulates wallet-level eligibility scoring
 * based on hypothetical on-chain activity patterns.
 *
 * Features:
 * - 10 major airdrop campaign tracking (Layer3, Zora, Puffer, Renzo, EigenLayer,
 *   Blast Mode, zkSync2, Starknet, Soneium, Berachain)
 * - Eligibility scoring (0-100) per protocol with activity simulation
 * - Task-level completion tracking with deadlines
 * - Urgency-based priority ranking (HIGH / MEDIUM / LOW)
 * - Estimated airdrop value modeling per protocol
 * - Probability-weighted return projections
 * - Top opportunities panel with effort/reward analysis
 * - Portfolio-level eligibility aggregation
 * - Actionable timeline with CRITICAL / RECOMMENDED / OPTIONAL events
 * - 30-minute TTL cache with manual clear
 *
 * Status Tiers:
 * - CONFIRMED: Token exists, eligibility criteria published
 * - LIKELY: Strong team signals, token registration, testnet incentives live
 * - SPECULATIVE: Community rumors, no official confirmation
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface AirdropTask {
  task: string;
  completed: boolean;
  deadline: string;
}

export interface ProtocolEligibility {
  name: string;
  blockchain: string;
  estimatedValue: number;
  probability: number;
  status: 'CONFIRMED' | 'LIKELY' | 'SPECULATIVE';
  estimatedDate: string;
  requirements: string[];
  tasks: AirdropTask[];
  eligibilityScore: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface TopOpportunity {
  protocol: string;
  urgency: string;
  potentialValue: number;
  effort: string;
  timeRequired: string;
  actionSteps: string[];
}

export interface PortfolioEligibility {
  totalProtocols: number;
  eligibleProtocols: number;
  totalEstimatedValue: number;
  avgProbability: number;
}

export interface TimelineEvent {
  protocol: string;
  event: string;
  date: string;
  action: string;
  importance: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL';
}

export interface AirdropEligibilityData {
  protocols: ProtocolEligibility[];
  topOpps: TopOpportunity[];
  portfolioEligibility: PortfolioEligibility;
  timeline: TimelineEvent[];
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Cache
// ---------------------------------------------------------------------------

let cachedData: AirdropEligibilityData | null = null;
let lastFetchTimestamp: number = 0;
const REFRESH_INTERVAL_MS = 1_800_000; // 30 minutes

// ---------------------------------------------------------------------------
// Protocol configuration: static metadata for 10 tracked campaigns
// ---------------------------------------------------------------------------

interface ProtocolConfig {
  name: string;
  blockchain: string;
  estimatedValue: number;
  probability: number;
  status: 'CONFIRMED' | 'LIKELY' | 'SPECULATIVE';
  estimatedDate: string;
  requirements: string[];
  taskTemplates: Array<{ task: string; deadlineOffsetDays: number }>;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

const PROTOCOL_CONFIGS: ProtocolConfig[] = [
  {
    name: 'Layer3',
    blockchain: 'Ethereum',
    estimatedValue: 1200,
    probability: 78,
    status: 'LIKELY',
    estimatedDate: '2026-08-15',
    requirements: [
      'Complete 100+ Layer3 Quests',
      'Stake L3 tokens for 30+ days',
      'Refer 5+ active users',
      'Hold Galxe OATs from Layer3 campaigns',
    ],
    taskTemplates: [
      { task: 'Complete daily quests on Layer3', deadlineOffsetDays: 14 },
      { task: 'Stake minimum 100 L3 tokens', deadlineOffsetDays: 30 },
      { task: 'Refer 3+ verified users', deadlineOffsetDays: 45 },
      { task: 'Mint Galxe OAT for existing campaigns', deadlineOffsetDays: 7 },
      { task: 'Claim all pending quest rewards', deadlineOffsetDays: 21 },
    ],
    priority: 'HIGH',
  },
  {
    name: 'Zora',
    blockchain: 'Zora Network',
    estimatedValue: 850,
    probability: 65,
    status: 'LIKELY',
    estimatedDate: '2026-09-01',
    requirements: [
      'Mint 25+ NFTs on Zora Marketplace',
      'Create at least 1 collection',
      'Trade volume > 0.1 ETH on Zora',
      'Hold Zora Premier Pass',
    ],
    taskTemplates: [
      { task: 'Mint 25+ NFTs from trending drops', deadlineOffsetDays: 10 },
      { task: 'Create a min. 10-item NFT collection', deadlineOffsetDays: 60 },
      { task: 'Generate 0.1 ETH+ trading volume', deadlineOffsetDays: 30 },
      { task: 'Bridge ETH to Zora Network', deadlineOffsetDays: 5 },
    ],
    priority: 'MEDIUM',
  },
  {
    name: 'Puffer',
    blockchain: 'Ethereum',
    estimatedValue: 2400,
    probability: 92,
    status: 'CONFIRMED',
    estimatedDate: '2026-07-30',
    requirements: [
      'Deposit ETH into Puffer Vault for pufETH',
      'Stake pufETH on EigenLayer',
      'Maintain position for 90+ days',
      'Hold pufETH in DeFi composability protocols',
    ],
    taskTemplates: [
      { task: 'Deposit min. 0.05 ETH for pufETH', deadlineOffsetDays: 3 },
      { task: 'Restake pufETH on EigenLayer', deadlineOffsetDays: 7 },
      { task: 'Hold pufETH for 90+ consecutive days', deadlineOffsetDays: 95 },
      { task: 'Supply pufETH as collateral on Aave', deadlineOffsetDays: 30 },
      { task: 'Provide pufETH/ETH liquidity on Uniswap V3', deadlineOffsetDays: 14 },
      { task: 'Run Puffer loyalty points check weekly', deadlineOffsetDays: 21 },
    ],
    priority: 'HIGH',
  },
  {
    name: 'Renzo',
    blockchain: 'Ethereum',
    estimatedValue: 1800,
    probability: 88,
    status: 'CONFIRMED',
    estimatedDate: '2026-08-10',
    requirements: [
      'Deposit ETH/restaked assets into Renzo for ezETH',
      'Stake ezETH on EigenLayer',
      'Maintain ezETH balance for 60+ days',
      'Participate in Renzo ezPoints program',
    ],
    taskTemplates: [
      { task: 'Deposit ETH to mint ezETH', deadlineOffsetDays: 2 },
      { task: 'Restake ezETH via EigenLayer', deadlineOffsetDays: 5 },
      { task: 'Accumulate 500+ ezPoints', deadlineOffsetDays: 60 },
      { task: 'Provide ezETH liquidity on Balancer', deadlineOffsetDays: 14 },
      { task: 'Vote in Renzo governance', deadlineOffsetDays: 90 },
    ],
    priority: 'HIGH',
  },
  {
    name: 'EigenLayer Season 2',
    blockchain: 'Ethereum',
    estimatedValue: 3200,
    probability: 95,
    status: 'CONFIRMED',
    estimatedDate: '2026-07-20',
    requirements: [
      'Restake ETH or LSTs on EigenLayer',
      'Delegate to an active operator',
      'Accumulate EigenLayer Points (ELP)',
      'Maintain restake for full season duration',
    ],
    taskTemplates: [
      { task: 'Restake 0.1+ ETH on EigenLayer', deadlineOffsetDays: 1 },
      { task: 'Delegate to top-5 ranked operator', deadlineOffsetDays: 3 },
      { task: 'Opt-in to all eligible LRTs', deadlineOffsetDays: 14 },
      { task: 'Subscribe to EigenPod for native restaking', deadlineOffsetDays: 30 },
      { task: 'Maintain position through season end', deadlineOffsetDays: 120 },
    ],
    priority: 'HIGH',
  },
  {
    name: 'Blast Mode',
    blockchain: 'Blast',
    estimatedValue: 600,
    probability: 72,
    status: 'CONFIRMED',
    estimatedDate: '2026-08-25',
    requirements: [
      'Bridge ETH to Blast L2',
      'Interact with 5+ Blast DApps',
      'Accumulate Blast Gold points',
      'Maintain 0.05+ ETH balance on Blast',
    ],
    taskTemplates: [
      { task: 'Bridge min. 0.05 ETH to Blast L2', deadlineOffsetDays: 5 },
      { task: 'Interact with 3+ Blast-native DEXs', deadlineOffsetDays: 14 },
      { task: 'Lend assets on Blast lending protocols', deadlineOffsetDays: 21 },
      { task: 'Join Blast BIG BANG incentive program', deadlineOffsetDays: 10 },
      { task: 'Refer friends via Blast referral link', deadlineOffsetDays: 30 },
    ],
    priority: 'MEDIUM',
  },
  {
    name: 'zkSync2',
    blockchain: 'zkSync Era',
    estimatedValue: 1500,
    probability: 70,
    status: 'LIKELY',
    estimatedDate: '2026-10-01',
    requirements: [
      'Complete 50+ transactions on zkSync Era',
      'Bridge > 0.5 ETH total to zkSync',
      'Use 3+ native zkSync DApps',
      'Hold zkSync Lite legacy assets',
    ],
    taskTemplates: [
      { task: 'Bridge 0.5+ ETH to zkSync Era', deadlineOffsetDays: 7 },
      { task: 'Perform 25+ swaps on SyncSwap', deadlineOffsetDays: 21 },
      { task: 'Provide liquidity on Maverick zkSync', deadlineOffsetDays: 30 },
      { task: 'Mint NFTs on zkSync native marketplaces', deadlineOffsetDays: 14 },
      { task: 'Complete 50+ total on-chain transactions', deadlineOffsetDays: 45 },
      { task: 'Use zkPay paymaster for gasless txns', deadlineOffsetDays: 10 },
    ],
    priority: 'MEDIUM',
  },
  {
    name: 'Starknet Season 2',
    blockchain: 'Starknet',
    estimatedValue: 1100,
    probability: 58,
    status: 'LIKELY',
    estimatedDate: '2026-11-15',
    requirements: [
      'Deploy a Cairo contract or interact with 10+ DApps',
      'Accumulate STRK DeFi Spring points',
      'Stake STRK on Starknet',
      'Maintain on-chain activity for 6+ months',
    ],
    taskTemplates: [
      { task: 'Claim STRK from DeFi Spring program', deadlineOffsetDays: 14 },
      { task: 'Stake STRK via STRK staking portal', deadlineOffsetDays: 30 },
      { task: 'Provide liquidity on JediSwap / MySwap', deadlineOffsetDays: 21 },
      { task: 'Bridge 100+ USDC to Starknet', deadlineOffsetDays: 7 },
    ],
    priority: 'LOW',
  },
  {
    name: 'Soneium',
    blockchain: 'Soneium',
    estimatedValue: 750,
    probability: 45,
    status: 'SPECULATIVE',
    estimatedDate: '2026-12-01',
    requirements: [
      'Complete Soneium Quests',
      'Bridge ETH to Soneium from Ethereum',
      'Interact with Soneium ecosystem DApps',
      'Hold Soneium Builder NFT',
    ],
    taskTemplates: [
      { task: 'Complete all Soneium Star Quests', deadlineOffsetDays: 30 },
      { task: 'Bridge 0.1+ ETH to Soneium', deadlineOffsetDays: 5 },
      { task: 'Use Soneium MIP coin for transactions', deadlineOffsetDays: 14 },
      { task: 'Mint Soneium commemorative NFT', deadlineOffsetDays: 21 },
    ],
    priority: 'LOW',
  },
  {
    name: 'Berachain',
    blockchain: 'Berachain',
    estimatedValue: 2800,
    probability: 82,
    status: 'CONFIRMED',
    estimatedDate: '2026-08-30',
    requirements: [
      'Provide流动性 on BEX (Berachain DEX)',
      'Lend/borrow on Bend protocol',
      'Mint stablecoin BHARE via BeraBorrow',
      'Participate in Boyco yield markets',
    ],
    taskTemplates: [
      { task: 'Provide liquidity on BEX pools', deadlineOffsetDays: 7 },
      { task: 'Deposit collateral on Bend protocol', deadlineOffsetDays: 10 },
      { task: 'Mint BHARE stablecoin against collateral', deadlineOffsetDays: 14 },
      { task: 'Participate in Boyco pre-deposit markets', deadlineOffsetDays: 3 },
      { task: 'Stake BGT for validator governance', deadlineOffsetDays: 30 },
    ],
    priority: 'HIGH',
  },
];

// ---------------------------------------------------------------------------
// Simulation helpers
// ---------------------------------------------------------------------------

function simulateEligibilityScore(config: ProtocolConfig): number {
  // Base score from probability, plus variance from simulated activity
  const activityBonus = Math.round(Math.random() * 25);
  const base = Math.round(config.probability * 0.7);
  return Math.min(100, Math.max(15, base + activityBonus));
}

function simulateTaskCompletion(templates: Array<{ task: string; deadlineOffsetDays: number }>): AirdropTask[] {
  const now = Date.now();
  // Pick 3-6 tasks randomly
  const count = 3 + Math.floor(Math.random() * 4);
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, templates.length));

  return selected.map(t => {
    const deadline = new Date(now + t.deadlineOffsetDays * 86_400_000);
    // Tasks with earlier deadlines more likely to be completed
    const completionChance = Math.max(0.1, 0.85 - (t.deadlineOffsetDays / 120));
    return {
      task: t.task,
      completed: Math.random() < completionChance,
      deadline: deadline.toISOString().slice(0, 10),
    };
  });
}

function computePriorityFromScore(score: number, status: string, estimatedValue: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  const valueWeight = estimatedValue > 1500 ? 1.2 : estimatedValue > 800 ? 1.0 : 0.8;
  const statusBonus = status === 'CONFIRMED' ? 10 : status === 'LIKELY' ? 5 : 0;
  const weighted = score * valueWeight + statusBonus;

  if (weighted >= 70) return 'HIGH';
  if (weighted >= 40) return 'MEDIUM';
  return 'LOW';
}

// ---------------------------------------------------------------------------
// Top opportunity builder
// ---------------------------------------------------------------------------

function buildTopOpps(protocols: ProtocolEligibility[]): TopOpportunity[] {
  return protocols
    .filter(p => p.eligibilityScore >= 40)
    .sort((a, b) => {
      // Sort by value * probability descending
      const scoreA = a.estimatedValue * (a.probability / 100) * (a.eligibilityScore / 100);
      const scoreB = b.estimatedValue * (b.probability / 100) * (b.eligibilityScore / 100);
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map(p => {
      const remainingTasks = p.tasks.filter(t => !t.completed).length;
      const urgency = p.priority === 'HIGH' && remainingTasks <= 2
        ? 'Act now - deadlines approaching'
        : p.priority === 'HIGH'
        ? 'High priority - complete soon'
        : p.priority === 'MEDIUM'
        ? 'Moderate - plan this week'
        : 'Low urgency - opportunity open';

      const effort = remainingTasks <= 1
        ? 'Minimal (1-2 txns)'
        : remainingTasks <= 3
        ? 'Moderate (3-5 txns)'
        : 'Significant (6+ txns)';

      const timeRequired = remainingTasks <= 1
        ? '5 minutes'
        : remainingTasks <= 3
        ? '30 minutes'
        : '1-2 hours';

      const actionSteps = p.tasks
        .filter(t => !t.completed)
        .map(t => t.task)
        .concat(['Double-check eligibility on official portal']);

      return {
        protocol: p.name,
        urgency,
        potentialValue: Math.round(p.estimatedValue * (p.probability / 100)),
        effort,
        timeRequired,
        actionSteps,
      };
    });
}

// ---------------------------------------------------------------------------
// Timeline builder
// ---------------------------------------------------------------------------

function buildTimeline(protocols: ProtocolEligibility[]): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const p of protocols) {
    // Add estimated airdrop date event
    const dateObj = new Date(p.estimatedDate);
    const daysUntil = Math.round((dateObj.getTime() - Date.now()) / 86_400_000);

    if (daysUntil <= 7) {
      events.push({
        protocol: p.name,
        event: 'TGE / Claim window opens',
        date: p.estimatedDate,
        action: `Claim ${p.name} token allocation`,
        importance: 'CRITICAL',
      });
    } else if (daysUntil <= 30) {
      events.push({
        protocol: p.name,
        event: 'Claim deadline approaching',
        date: p.estimatedDate,
        action: `Complete all ${p.name} eligibility tasks`,
        importance: 'CRITICAL',
      });
    } else {
      events.push({
        protocol: p.name,
        event: 'Estimated TGE',
        date: p.estimatedDate,
        action: `Continue accumulating ${p.name} points/activity`,
        importance: 'RECOMMENDED',
      });
    }

    // Add deadline-driven events for incomplete near-term tasks
    const urgentTask = p.tasks.find(t => {
      if (t.completed) return false;
      const daysToDeadline = Math.round((new Date(t.deadline).getTime() - Date.now()) / 86_400_000);
      return daysToDeadline <= 14;
    });

    if (urgentTask) {
      events.push({
        protocol: p.name,
        event: `Deadline: ${urgentTask.task}`,
        date: urgentTask.deadline,
        action: `Complete "${urgentTask.task}" before deadline`,
        importance: 'RECOMMENDED',
      });
    }

    // Season / snapshot events for confirmed protocols
    if (p.status === 'CONFIRMED') {
      const snapshotDate = new Date(dateObj.getTime() - 14 * 86_400_000);
      events.push({
        protocol: p.name,
        event: 'Expected final snapshot',
        date: snapshotDate.toISOString().slice(0, 10),
        action: `Maximize ${p.name} position before snapshot`,
        importance: daysUntil <= 60 ? 'CRITICAL' : 'RECOMMENDED',
      });
    }
  }

  // Sort by date ascending
  events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Add monthly maintenance event
  const maintenanceDate = new Date(Date.now() + 30 * 86_400_000);
  events.push({
    protocol: 'Portfolio',
    event: 'Monthly airdrop eligibility review',
    date: maintenanceDate.toISOString().slice(0, 10),
    action: 'Review and update task completion status',
    importance: 'OPTIONAL',
  });

  return events;
}

// ---------------------------------------------------------------------------
// Main analysis function
// ---------------------------------------------------------------------------

export async function analyzeAirdropEligibility(): Promise<AirdropEligibilityData> {
  if (cachedData && Date.now() - lastFetchTimestamp < REFRESH_INTERVAL_MS) {
    return cachedData;
  }

  // Build protocol eligibility with simulated user activity
  const protocols: ProtocolEligibility[] = PROTOCOL_CONFIGS.map(config => {
    const eligibilityScore = simulateEligibilityScore(config);
    const tasks = simulateTaskCompletion(config.taskTemplates);
    const priority = computePriorityFromScore(eligibilityScore, config.status, config.estimatedValue);

    return {
      name: config.name,
      blockchain: config.blockchain,
      estimatedValue: config.estimatedValue,
      probability: config.probability,
      status: config.status,
      estimatedDate: config.estimatedDate,
      requirements: config.requirements,
      tasks,
      eligibilityScore,
      priority,
    };
  });

  const topOpps = buildTopOpps(protocols);

  // Portfolio aggregation
  const eligibleProtocols = protocols.filter(p => p.eligibilityScore >= 50).length;
  const totalEstimatedValue = protocols.reduce(
    (sum, p) => sum + Math.round(p.estimatedValue * (p.probability / 100)),
    0,
  );
  const avgProbability = Math.round(
    protocols.reduce((sum, p) => sum + p.probability, 0) / protocols.length,
  );

  const portfolioEligibility: PortfolioEligibility = {
    totalProtocols: protocols.length,
    eligibleProtocols,
    totalEstimatedValue,
    avgProbability,
  };

  const timeline = buildTimeline(protocols);

  cachedData = {
    protocols,
    topOpps,
    portfolioEligibility,
    timeline,
    generatedAt: new Date().toISOString(),
  };

  lastFetchTimestamp = Date.now();
  return cachedData;
}

// ---------------------------------------------------------------------------
// Cache accessors
// ---------------------------------------------------------------------------

export function getCachedAirdropEligibility(): AirdropEligibilityData | null {
  return cachedData;
}

export function clearAirdropEligibilityCache(): void {
  cachedData = null;
  lastFetchTimestamp = 0;
}
