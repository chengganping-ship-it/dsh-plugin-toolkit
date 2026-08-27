/**
 * Subscription Tier & API Key Management for Funding Mirror
 *
 * Provides tiered access control, API key lifecycle management,
 * sliding-window rate limiting, and engine access gating.
 *
 * Storage: SQLite via the shared db instance (server/src/store/db.ts).
 * Rate limiting: in-memory sliding window with periodic cleanup.
 */

import crypto from 'crypto';
import { getDb } from './store/db.js';

// =============================================================================
// Tier Definitions
// =============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface TierConfig {
  name: string;
  priceMonthly: number;
  rateLimitPerMinute: number;
  maxEngines: number;
  hasWebSocket: boolean;
  hasHistorical: boolean;
  hasAlerts: boolean;
  support: 'community' | 'email' | 'dedicated';
  maxApiKeyCount: number;
  dataRetentionDays: number;
}

const TIERS: Record<SubscriptionTier, TierConfig> = {
  free: {
    name: 'Free',
    priceMonthly: 0,
    rateLimitPerMinute: 5,
    maxEngines: 3,
    hasWebSocket: false,
    hasHistorical: false,
    hasAlerts: false,
    support: 'community',
    maxApiKeyCount: 1,
    dataRetentionDays: 1,
  },
  pro: {
    name: 'Pro',
    priceMonthly: 49,
    rateLimitPerMinute: 60,
    maxEngines: 30,
    hasWebSocket: true,
    hasHistorical: true,
    hasAlerts: true,
    support: 'email',
    maxApiKeyCount: 5,
    dataRetentionDays: 30,
  },
  enterprise: {
    name: 'Enterprise',
    priceMonthly: 299,
    rateLimitPerMinute: 1000,
    maxEngines: 999, // unlimited
    hasWebSocket: true,
    hasHistorical: true,
    hasAlerts: true,
    support: 'dedicated',
    maxApiKeyCount: 50,
    dataRetentionDays: 365,
  },
};

// =============================================================================
// Engine Access Control
// =============================================================================

/**
 * Engine version mapping. Each engine belongs to a version tier.
 * Free: v6-v7, Pro: v6-v13, Enterprise: all (including custom).
 */
const ENGINE_VERSION_MAP: Record<string, number> = {
  // v6 engines
  'strategy': 6,
  'fees': 6,
  'volatility': 6,
  'accounts': 6,
  'yield': 6,
  'sentiment': 6,
  'dexRouter': 6,
  'whale': 6,
  'bridge': 6,
  'options': 6,
  'grid': 6,
  'liquidation': 6,
  'termstructure': 6,
  'execution': 6,
  'risk': 6,
  'orderbook': 6,
  'rebalance': 6,
  'crossBorderAlert': 6,
  'resumeOptimizer': 6,
  // v7 engines
  'nftArbitrage': 7,
  'rwaTracker': 7,
  'templateStore': 7,
  'airdropFarm': 7,
  'perpetualDex': 7,
  'securityScanner': 7,
  'smartMoney': 7,
  'mevProtection': 7,
  'bridgeMonitor': 7,
  'yieldAggregator': 7,
  'nftPricePredictor': 7,
  'onChainAnalytics': 7,
  'daoGovernance': 7,
  'rwaYieldMonitor': 7,
  'predictionArb': 7,
  'optionGreeks': 7,
  'fundingBacktester': 7,
  'exchangeSpreadAlert': 7,
  'gasOptimizer': 7,
  'onChainReputation': 7,
  'crossChainDex': 7,
  'derivativesLiquidity': 7,
  'contractUpgrade': 7,
  'stablecoinDepeg': 7,
  'deFiPoints': 7,
  'intentTrading': 7,
  'insurance': 7,
  'cryptoMacro': 7,
  'layerZeroTracker': 7,
  'flashLoanArb': 7,
  'onChainCredit': 7,
  'nftLending': 7,
  'yieldOptimizer': 7,
  'mevShare': 7,
  'optionsDex': 7,
  'liquidStakingTracker': 7,
  'airdropEligibility': 7,
  'tokenomicsAnalyzer': 7,
  'sentimentIndex': 7,
  'smartMoneyHoldings': 7,
  'mevBuilderRevenue': 7,
  'governanceVoterTracker': 7,
  'predictionMarketAnalytics': 7,
  'cryptoETFFlowTracker': 7,
  'optionsFlowAnalytics': 7,
  'stablecoinCurveTracker': 7,
  'tokenUnlock': 7,
  'rpcMonitor': 7,
  'stablecoinResidualArb': 7,
  'fundingHeatmap': 7,
  'bridgeTVLMonitor': 7,
  'proofOfReserves': 7,
  // v8 engines
  'ml': 8,
  'portfolio': 8,
  'regime': 8,
  'defi': 8,
  'router': 8,
  'attribution': 8,
  'health': 8,
  'bot': 8,
  // v9 engines
  'kelly': 9,
  'backtest': 9,
  'paper': 9,
  'history': 9,
  'executor': 9,
  'alerts': 9,
  // v10 engines
  'anomaly': 10,
  'predictor': 10,
  'capacity': 10,
  'crosspair': 10,
  // v11+ engines (enterprise-only)
  'custom': 11,
};

/** Minimum version required for each tier */
const TIER_MIN_VERSION: Record<SubscriptionTier, number> = {
  free: 6,
  pro: 6,
  enterprise: 6,
};

/** Maximum version allowed for each tier (inclusive) */
const TIER_MAX_VERSION: Record<SubscriptionTier, number> = {
  free: 7,
  pro: 13,
  enterprise: 999,
};

// =============================================================================
// API Key Interface
// =============================================================================

export interface ApiKey {
  key: string;           // fm_live_xxxxx or fm_test_xxxxx
  tier: SubscriptionTier;
  createdAt: number;
  expiresAt: number | null;  // null = never expires
  isActive: boolean;
  callCount: number;
  lastCallAt: number;
  label: string;         // user-defined label
  allowedOrigins: string[];  // CORS whitelist
}

// =============================================================================
// Rate Limiting (In-Memory Sliding Window)
// =============================================================================

interface RateLimitEntry {
  timestamps: number[];  // call timestamps within the window
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

/**
 * Periodic cleanup of stale rate-limit entries.
 * Returns the number of entries removed.
 */
function cleanupRateLimits(): number {
  const now = Date.now();
  let removed = 0;
  for (const [key, entry] of rateLimitMap) {
    // Remove timestamps older than the window
    entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (entry.timestamps.length === 0) {
      rateLimitMap.delete(key);
      removed++;
    }
  }
  return removed;
}

// Run cleanup every 5 minutes
const rateLimitCleanupInterval = setInterval(() => {
  cleanupRateLimits();
}, 300_000);

// Allow process to exit even if interval is active
rateLimitCleanupInterval.unref();

// =============================================================================
// Database Migration
// =============================================================================

let migrationDone = false;

function ensureMigration(): void {
  if (migrationDone) return;
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      key TEXT PRIMARY KEY,
      tier TEXT NOT NULL DEFAULT 'free',
      created_at INTEGER NOT NULL,
      expires_at INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      call_count INTEGER NOT NULL DEFAULT 0,
      last_call_at INTEGER NOT NULL DEFAULT 0,
      label TEXT NOT NULL DEFAULT '',
      allowed_origins TEXT NOT NULL DEFAULT '[]'
    );
    CREATE INDEX IF NOT EXISTS idx_api_keys_tier ON api_keys(tier);
    CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
  `);
  migrationDone = true;
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateKey(prefix: 'live' | 'test' = 'live'): string {
  return `fm_${prefix}_${crypto.randomBytes(24).toString('hex')}`;
}

function dbRowToApiKey(row: Record<string, unknown>): ApiKey {
  return {
    key: row.key as string,
    tier: row.tier as SubscriptionTier,
    createdAt: row.created_at as number,
    expiresAt: row.expires_at as number | null,
    isActive: (row.is_active as number) === 1,
    callCount: row.call_count as number,
    lastCallAt: row.last_call_at as number,
    label: row.label as string,
    allowedOrigins: JSON.parse(row.allowed_origins as string),
  };
}

// =============================================================================
// Exported Functions
// =============================================================================

/**
 * Creates a new API key for the given tier.
 * Enforces max key count per tier.
 */
export function createApiKey(
  tier: SubscriptionTier,
  label: string,
  expiresInDays?: number
): ApiKey {
  ensureMigration();
  const db = getDb();

  // Check current key count for this tier
  const countRow = db.prepare(
    'SELECT COUNT(*) as c FROM api_keys WHERE tier = ? AND is_active = 1'
  ).get(tier) as { c: number };

  const tierConfig = TIERS[tier];
  if (countRow.c >= tierConfig.maxApiKeyCount) {
    throw new Error(
      `Tier "${tier}" has reached the maximum of ${tierConfig.maxApiKeyCount} active API keys. ` +
      `Revoke an existing key or upgrade your plan.`
    );
  }

  const now = Date.now();
  const apiKey: ApiKey = {
    key: generateKey('live'),
    tier,
    createdAt: now,
    expiresAt: expiresInDays ? now + expiresInDays * 86_400_000 : null,
    isActive: true,
    callCount: 0,
    lastCallAt: 0,
    label,
    allowedOrigins: [],
  };

  db.prepare(`
    INSERT INTO api_keys (key, tier, created_at, expires_at, is_active, call_count, last_call_at, label, allowed_origins)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    apiKey.key,
    apiKey.tier,
    apiKey.createdAt,
    apiKey.expiresAt,
    apiKey.isActive ? 1 : 0,
    apiKey.callCount,
    apiKey.lastCallAt,
    apiKey.label,
    JSON.stringify(apiKey.allowedOrigins)
  );

  return apiKey;
}

/**
 * Validates an API key. Returns validity status, tier, and key data.
 */
export function validateApiKey(key: string): {
  valid: boolean;
  tier?: SubscriptionTier;
  keyData?: ApiKey;
} {
  ensureMigration();
  const db = getDb();

  const row = db.prepare('SELECT * FROM api_keys WHERE key = ?').get(key) as Record<string, unknown> | undefined;
  if (!row) return { valid: false };

  const apiKey = dbRowToApiKey(row);

  if (!apiKey.isActive) return { valid: false };
  if (apiKey.expiresAt !== null && apiKey.expiresAt < Date.now()) return { valid: false };

  return { valid: true, tier: apiKey.tier, keyData: apiKey };
}

/**
 * Deactivates (revokes) an API key.
 */
export function revokeApiKey(key: string): boolean {
  ensureMigration();
  const db = getDb();

  const result = db.prepare(
    'UPDATE api_keys SET is_active = 0 WHERE key = ? AND is_active = 1'
  ).run(key);

  return result.changes > 0;
}

/**
 * Returns call count and rate limit status for a key.
 */
export function getApiKeyUsage(key: string): {
  callCount: number;
  rateLimitPerMinute: number;
  remaining: number;
  resetAt: number;
} | null {
  ensureMigration();
  const db = getDb();

  const row = db.prepare('SELECT * FROM api_keys WHERE key = ?').get(key) as Record<string, unknown> | undefined;
  if (!row) return null;

  const apiKey = dbRowToApiKey(row);
  const tierConfig = TIERS[apiKey.tier];

  // Get current window state
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  const windowTimestamps = entry
    ? entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS)
    : [];
  const currentCount = windowTimestamps.length;
  const oldestInWindow = windowTimestamps.length > 0 ? Math.min(...windowTimestamps) : now;

  return {
    callCount: apiKey.callCount,
    rateLimitPerMinute: tierConfig.rateLimitPerMinute,
    remaining: Math.max(0, tierConfig.rateLimitPerMinute - currentCount),
    resetAt: oldestInWindow + RATE_LIMIT_WINDOW_MS,
  };
}

/**
 * Checks rate limit for a key using sliding window.
 * If allowed, records the call.
 */
export function checkRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  ensureMigration();
  const db = getDb();

  const row = db.prepare('SELECT * FROM api_keys WHERE key = ?').get(key) as Record<string, unknown> | undefined;
  if (!row) return { allowed: false, remaining: 0, resetAt: 0 };

  const apiKey = dbRowToApiKey(row);
  if (!apiKey.isActive) return { allowed: false, remaining: 0, resetAt: 0 };
  if (apiKey.expiresAt !== null && apiKey.expiresAt < Date.now()) {
    return { allowed: false, remaining: 0, resetAt: 0 };
  }

  const tierConfig = TIERS[apiKey.tier];
  const now = Date.now();

  // Get or create rate limit entry
  let entry = rateLimitMap.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    rateLimitMap.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (entry.timestamps.length >= tierConfig.rateLimitPerMinute) {
    const oldestInWindow = Math.min(...entry.timestamps);
    return {
      allowed: false,
      remaining: 0,
      resetAt: oldestInWindow + RATE_LIMIT_WINDOW_MS,
    };
  }

  // Record this call
  entry.timestamps.push(now);

  // Update persistent counters
  db.prepare(`
    UPDATE api_keys SET call_count = call_count + 1, last_call_at = ? WHERE key = ?
  `).run(now, key);

  const oldestInWindow = entry.timestamps.length > 0 ? Math.min(...entry.timestamps) : now;
  return {
    allowed: true,
    remaining: tierConfig.rateLimitPerMinute - entry.timestamps.length,
    resetAt: oldestInWindow + RATE_LIMIT_WINDOW_MS,
  };
}

/**
 * Returns the TierConfig for a given tier.
 */
export function getTierConfig(tier: SubscriptionTier): TierConfig {
  return TIERS[tier];
}

/**
 * Checks if a tier can access a given engine.
 */
export function isEngineAllowed(engineId: string, tier: SubscriptionTier): boolean {
  const version = ENGINE_VERSION_MAP[engineId];
  if (version === undefined) {
    // Unknown engines are enterprise-only
    return tier === 'enterprise';
  }
  const maxVersion = TIER_MAX_VERSION[tier];
  return version <= maxVersion;
}

/**
 * Returns the list of engine IDs allowed for a tier.
 */
export function getAllowedEngines(tier: SubscriptionTier): string[] {
  const maxVersion = TIER_MAX_VERSION[tier];
  return Object.entries(ENGINE_VERSION_MAP)
    .filter(([, version]) => version <= maxVersion)
    .map(([engineId]) => engineId);
}

/**
 * Returns a summary of the subscription system state.
 */
export function getSubscriptionSummary(): {
  totalKeys: number;
  activeKeys: number;
  callsToday: number;
  tierBreakdown: Record<SubscriptionTier, { keys: number; active: number }>;
} {
  ensureMigration();
  const db = getDb();

  const totalRow = db.prepare('SELECT COUNT(*) as c FROM api_keys').get() as { c: number };
  const activeRow = db.prepare('SELECT COUNT(*) as c FROM api_keys WHERE is_active = 1').get() as { c: number };

  const dayAgo = Date.now() - 86_400_000;
  const callsRow = db.prepare(
    'SELECT COALESCE(SUM(call_count), 0) as c FROM api_keys WHERE last_call_at > ?'
  ).get(dayAgo) as { c: number };

  const tierBreakdown: Record<SubscriptionTier, { keys: number; active: number }> = {
    free: { keys: 0, active: 0 },
    pro: { keys: 0, active: 0 },
    enterprise: { keys: 0, active: 0 },
  };

  const tierRows = db.prepare(
    'SELECT tier, COUNT(*) as total, SUM(is_active) as active FROM api_keys GROUP BY tier'
  ).all() as Array<{ tier: string; total: number; active: number }>;

  for (const row of tierRows) {
    const t = row.tier as SubscriptionTier;
    if (tierBreakdown[t]) {
      tierBreakdown[t] = { keys: row.total, active: row.active };
    }
  }

  return {
    totalKeys: totalRow.c,
    activeKeys: activeRow.c,
    callsToday: callsRow.c,
    tierBreakdown,
  };
}

/**
 * Removes expired and deactivated keys from the database.
 * Also cleans up in-memory rate limit entries.
 * Returns the number of keys removed.
 */
export function cleanupExpiredKeys(): number {
  ensureMigration();
  const db = getDb();

  const now = Date.now();

  // Find keys to remove (expired or deactivated)
  const keysToRemove = db.prepare(
    'SELECT key FROM api_keys WHERE is_active = 0 OR (expires_at IS NOT NULL AND expires_at < ?)'
  ).all(now) as Array<{ key: string }>;

  // Delete from database
  const result = db.prepare(
    'DELETE FROM api_keys WHERE is_active = 0 OR (expires_at IS NOT NULL AND expires_at < ?)'
  ).run(now);

  // Clean up rate limit entries
  for (const { key } of keysToRemove) {
    rateLimitMap.delete(key);
  }

  // Also clean up stale rate limit entries
  cleanupRateLimits();

  return result.changes;
}

// =============================================================================
// Re-exports for convenience
// =============================================================================

export { TIERS };
