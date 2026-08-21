/**
 * DSH Cost Governance Layer
 *
 * Enterprise-grade cost visibility, budget enforcement, and optimization
 * recommendations for running 186 DSH plugins at scale.
 *
 * Problem: Gartner reports 40% of AI Agent projects are cancelled due to
 * cost overruns ($50-200/user/month per agent).
 *
 * Solution: This layer provides comprehensive cost governance across all
 * 186 DSH plugins with real-time tracking, budget enforcement, anomaly
 * detection, and actionable optimization recommendations.
 *
 * @module dsh-cost-governance
 * @version 1.0.0
 */

// =============================================================================
// Core Classes
// =============================================================================

export { BudgetManager } from './budget-manager.js';
export { CostTracker, estimateTokens, estimateCost } from './cost-tracker.js';
export { CostOptimizer } from './optimizer.js';
export { AlertingSystem } from './alerting.js';
export { DashboardGenerator } from './dashboard.js';

// =============================================================================
// All Types
// =============================================================================

export type {
  TokenCost,
  PluginCost,
  ToolCallRecord,
  BudgetConfig,
  BudgetStatus,
  EntitySpend,
  CostDataPoint,
  TimeGranularity,
  OptimizationRecommendation,
  OptimizationReport,
  PluginCostSummary,
  LowValueAnalysis,
  AlertSeverity,
  CostAlert,
  AlertingConfig,
  AlertHandler,
  DashboardData,
  ToolCostSummary,
  DashboardKPIs,
  CostTrackerConfig,
  CostExportPayload,
  ExportFormat,
} from './types.js';

// =============================================================================
// Constants
// =============================================================================

export {
  DEFAULT_COST_TRACKER_CONFIG,
  DEFAULT_BUDGET_CONFIG,
  DEFAULT_ALERTING_CONFIG,
  MODEL_PRICING,
} from './types.js';
