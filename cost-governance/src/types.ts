/**
 * DSH Cost Governance — Shared Types
 *
 * Core type definitions for the cost governance layer that provides
 * enterprise-grade cost visibility, budget enforcement, and optimization
 * recommendations for running 186 DSH plugins at scale.
 *
 * @module dsh-cost-governance/types
 * @version 1.0.0
 */

// =============================================================================
// Token & Cost Types
// =============================================================================

/**
 * Token usage and estimated cost for a single tool invocation.
 */
export interface TokenCost {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
}

/**
 * Aggregated cost metrics for a single plugin (across all its tools).
 */
export interface PluginCost {
  pluginName: string;
  toolName: string;
  callCount: number;
  totalTokens: number;
  totalCostUSD: number;
  avgLatencyMs: number;
}

/**
 * A single recorded tool call with full cost metadata.
 */
export interface ToolCallRecord {
  /** Unique identifier for this call record */
  id: string;
  /** Plugin that owns the tool */
  pluginName: string;
  /** Tool name (within the plugin) */
  toolName: string;
  /** User/agent that initiated the call */
  userId: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Input token count */
  inputTokens: number;
  /** Output token count */
  outputTokens: number;
  /** Estimated cost in USD */
  estimatedCostUSD: number;
  /** Call latency in milliseconds */
  latencyMs: number;
  /** Whether the call succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Whether the result was served from cache */
  cached: boolean;
}

// =============================================================================
// Budget Types
// =============================================================================

/**
 * Budget configuration for cost governance.
 */
export interface BudgetConfig {
  /** Monthly budget in USD */
  monthlyBudgetUSD: number;
  /** Warning threshold (0.0-1.0). Default 0.8 = warn at 80% spend. */
  warningThreshold: number;
  /** Hard limit threshold (0.0-1.0). Default 1.0 = block at 100% spend. */
  hardLimitThreshold: number;
  /** Optional per-user monthly budget cap in USD */
  perUserBudgetUSD?: number;
  /** Optional per-plugin monthly budget cap in USD */
  perPluginBudgetUSD?: number;
  /** Whether unused budget rolls over to next month */
  rolloverEnabled: boolean;
}

/**
 * Current budget status snapshot.
 */
export interface BudgetStatus {
  /** Configured monthly budget */
  monthlyBudgetUSD: number;
  /** Total spent this month */
  spentUSD: number;
  /** Remaining budget */
  remainingUSD: number;
  /** Percentage spent (0.0-1.0+ */
  percentageUsed: number;
  /** Current status level */
  status: 'ok' | 'warning' | 'critical' | 'exceeded';
  /** Days remaining in current billing cycle */
  daysRemaining: number;
  /** Projected end-of-month spend based on current run rate */
  projectedSpendUSD: number;
  /** Whether new calls are allowed */
  allowed: boolean;
}

/**
 * Per-entity budget spend tracking.
 */
export interface EntitySpend {
  /** Entity identifier (user id or plugin name) */
  entityId: string;
  /** Entity type */
  entityType: 'user' | 'plugin';
  /** Budget cap for this entity */
  budgetCapUSD: number;
  /** Amount spent this period */
  spentUSD: number;
  /** Percentage of entity budget consumed */
  percentageUsed: number;
}

// =============================================================================
// Time-Series Types
// =============================================================================

/**
 * Time granularity for cost aggregation.
 */
export type TimeGranularity = 'hourly' | 'daily' | 'weekly' | 'monthly';

/**
 * A single data point in a cost time series.
 */
export interface CostDataPoint {
  /** ISO 8601 timestamp for the start of the period */
  timestamp: string;
  /** Number of calls in this period */
  callCount: number;
  /** Total tokens consumed */
  totalTokens: number;
  /** Total cost in USD */
  totalCostUSD: number;
  /** Number of failed calls */
  failedCalls: number;
  /** Number of unique plugins used */
  uniquePlugins: number;
}

// =============================================================================
// Optimizer Types
// =============================================================================

/**
 * A cost optimization recommendation.
 */
export interface OptimizationRecommendation {
  /** Severity of the recommendation */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Category of optimization */
  category: 'batch' | 'cache' | 'downgrade' | 'eliminate' | 'rate-limit' | 'off-peak';
  /** Human-readable title */
  title: string;
  /** Detailed description */
  description: string;
  /** Plugin name this applies to (or 'global') */
  pluginName: string;
  /** Estimated monthly savings in USD */
  estimatedMonthlySavingsUSD: number;
  /** Effort required to implement */
  implementationEffort: 'trivial' | 'low' | 'medium' | 'high';
  /** Concrete action items */
  actionItems: string[];
}

/**
 * Complete optimization report.
 */
export interface OptimizationReport {
  /** When the report was generated */
  generatedAt: string;
  /** Total current monthly spend */
  currentMonthlySpendUSD: number;
  /** Total potential monthly savings */
  potentialMonthlySavingsUSD: number;
  /** Percentage of spend that could be saved */
  savingsPercentage: number;
  /** Ranked list of recommendations */
  recommendations: OptimizationRecommendation[];
  /** Top-10 most expensive plugins */
  topExpensivePlugins: PluginCostSummary[];
  /** Low-value call analysis */
  lowValueAnalysis: LowValueAnalysis;
}

/**
 * Plugin cost summary for ranking.
 */
export interface PluginCostSummary {
  pluginName: string;
  totalCalls: number;
  totalCostUSD: number;
  averageCostPerCallUSD: number;
  failedCalls: number;
  failureRate: number;
  /** Percentage of total spend */
  spendPercentage: number;
}

/**
 * Analysis of low-value (wasteful) calls.
 */
export interface LowValueAnalysis {
  /** Calls that returned errors */
  errorCallCount: number;
  errorCallCostUSD: number;
  /** Calls that returned empty/meaningless results */
  emptyResultCount: number;
  emptyResultCostUSD: number;
  /** Duplicate calls (same plugin+tool within dedup window) */
  duplicateCallCount: number;
  duplicateCallCostUSD: number;
  /** Total wasteful spend */
  totalWastefulSpendUSD: number;
}

// =============================================================================
// Alerting Types
// =============================================================================

/**
 * Alert severity level.
 */
export type AlertSeverity = 'info' | 'warning' | 'critical';

/**
 * A cost governance alert.
 */
export interface CostAlert {
  /** Unique alert id */
  id: string;
  /** Alert severity */
  severity: AlertSeverity;
  /** Alert category */
  category: 'budget_threshold' | 'anomaly_spike' | 'plugin_anomaly' | 'per_user_limit' | 'per_plugin_limit';
  /** Alert title */
  title: string;
  /** Alert message */
  message: string;
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Relevant metric value */
  metricValue: number;
  /** Threshold that was crossed */
  threshold: number;
  /** Entity that triggered the alert */
  entityId?: string;
  entityType?: 'user' | 'plugin' | 'global';
  /** Whether alert has been acknowledged */
  acknowledged: boolean;
}

/**
 * Alert channel handler type.
 */
export type AlertHandler = (alert: CostAlert) => void | Promise<void>;

/**
 * Alerting configuration.
 */
export interface AlertingConfig {
  /** Console alert output enabled */
  consoleEnabled: boolean;
  /** File to write alerts to (null = disabled) */
  logFilePath?: string;
  /** Custom webhook callback URL */
  webhookUrl?: string;
  /** Custom handler functions */
  handlers: AlertHandler[];
  /** Minimum severity to emit */
  minSeverity: AlertSeverity;
  /** Cooldown period between same-type alerts in seconds */
  cooldownSeconds: number;
}

// =============================================================================
// Dashboard Types
// =============================================================================

/**
 * Complete dashboard dataset for rendering.
 */
export interface DashboardData {
  /** Dashboard generation timestamp */
  generatedAt: string;
  /** Budget status snapshot */
  budgetStatus: BudgetStatus;
  /** Time-series cost data */
  timeSeries: CostDataPoint[];
  /** Per-plugin cost breakdown */
  pluginBreakdown: PluginCostSummary[];
  /** Top-N most expensive tools */
  topTools: ToolCostSummary[];
  /** Recent alerts */
  recentAlerts: CostAlert[];
  /** Key performance indicators */
  kpis: DashboardKPIs;
  /** Optimization summary */
  optimizationSummary: {
    potentialSavingsUSD: number;
    topRecommendation: string;
  };
}

/**
 * Top expensive tool entry.
 */
export interface ToolCostSummary {
  pluginName: string;
  toolName: string;
  totalCalls: number;
  totalCostUSD: number;
  avgLatencyMs: number;
  successRate: number;
}

/**
 * Key performance indicators for dashboard header.
 */
export interface DashboardKPIs {
  totalCalls: number;
  totalCostUSD: number;
  averageCostPerCallUSD: number;
  successRate: number;
  activePlugins: number;
  cacheHitRate: number;
  costPerUserUSD: number;
}

// =============================================================================
// Cost Tracker Config
// =============================================================================

/**
 * Configuration for the cost tracker.
 */
export interface CostTrackerConfig {
  /** Cost per 1K input tokens in USD */
  inputCostPer1KTokens: number;
  /** Cost per 1K output tokens in USD */
  outputCostPer1KTokens: number;
  /** Characters per token heuristic ratio */
  charsPerToken: number;
  /** Maximum records to retain in memory (oldest evicted) */
  maxRecords: number;
  /** Deduplication window in milliseconds */
  deduplicationWindowMs: number;
}

/**
 * Default cost tracker configuration.
 */
export const DEFAULT_COST_TRACKER_CONFIG: CostTrackerConfig = {
  inputCostPer1KTokens: 0.003,
  outputCostPer1KTokens: 0.015,
  charsPerToken: 4,
  maxRecords: 100_000,
  deduplicationWindowMs: 5_000,
};

/**
 * Default budget configuration.
 */
export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  monthlyBudgetUSD: 1000,
  warningThreshold: 0.8,
  hardLimitThreshold: 1.0,
  rolloverEnabled: false,
};

/**
 * Default alerting configuration.
 */
export const DEFAULT_ALERTING_CONFIG: AlertingConfig = {
  consoleEnabled: true,
  handlers: [],
  minSeverity: 'info',
  cooldownSeconds: 300,
};

// =============================================================================
// Configuration Rates (per-model pricing tiers)
// =============================================================================

/**
 * Known model pricing tiers (input/output per 1M tokens USD).
 */
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
  'claude-haiku-4-20250514': { input: 0.25, output: 1.25 },
  'gemini-2.5-pro': { input: 1.25, output: 5.0 },
  'gemini-2.5-flash': { input: 0.15, output: 0.6 },
  'deepseek-v3': { input: 0.27, output: 1.1 },
  'deepseek-r1': { input: 0.55, output: 2.19 },
};

// =============================================================================
// Export Format Types
// =============================================================================

/**
 * Format for cost data export.
 */
export type ExportFormat = 'json' | 'csv';

/**
 * Serialized export payload.
 */
export interface CostExportPayload {
  /** Export format version */
  version: string;
  /** Export timestamp */
  exportedAt: string;
  /** Included time range */
  dateRange: { start: string; end: string };
  /** Summary totals */
  summary: {
    totalCalls: number;
    totalCostUSD: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    successRate: number;
  };
  /** Exported records */
  records: ToolCallRecord[];
}
