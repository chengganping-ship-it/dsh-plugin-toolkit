/**
 * DSH Cost Governance — Dashboard Data Generator
 *
 * Aggregates cost data from the cost tracker and budget manager to produce
 * a unified dashboard dataset compatible with common charting libraries
 * (Chart.js, Recharts, ECharts). Generates time-series, per-plugin breakdown,
 * top tools, KPIs, and optimization summary.
 *
 * @module dsh-cost-governance/dashboard
 * @version 1.0.0
 */

import type {
  DashboardData,
  DashboardKPIs,
  ToolCostSummary,
  CostDataPoint,
  BudgetStatus,
  PluginCostSummary,
  CostAlert,
  ToolCallRecord,
} from './types.js';
import type { CostTracker } from './cost-tracker.js';
import type { BudgetManager } from './budget-manager.js';
import type { AlertingSystem } from './alerting.js';
import { CostOptimizer } from './optimizer.js';

// =============================================================================
// Dashboard Generator Class
// =============================================================================

/**
 * Generates dashboard-ready cost data for visualization.
 *
 * Outputs JSON-compatible objects that can be rendered by any charting library.
 */
export class DashboardGenerator {
  private costTracker: CostTracker;
  private budgetManager: BudgetManager;
  private alertingSystem: AlertingSystem;

  constructor(
    costTracker: CostTracker,
    budgetManager: BudgetManager,
    alertingSystem: AlertingSystem
  ) {
    this.costTracker = costTracker;
    this.budgetManager = budgetManager;
    this.alertingSystem = alertingSystem;
  }

  // ---------------------------------------------------------------------------
  // Full Dashboard Generation
  // ---------------------------------------------------------------------------

  /**
   * Generate complete dashboard dataset.
   *
   * @param granularity — Time granularity for time-series charts
   * @param topN — Number of entries for top-plugin/tool tables
   * @returns DashboardData ready for JSON serialization
   */
  generate(granularity: 'daily' | 'weekly' = 'daily', topN: number = 10): DashboardData {
    const records = this.costTracker.getRecords();
    const budgetStatus = this.budgetManager.getStatus();
    const kpis = this.computeKPIs(records);
    const timeSeries = this.costTracker.getTimeSeries(granularity);
    const pluginBreakdown = this.costTracker.getPluginSummaries().slice(0, topN);
    const topTools = this.computeTopTools(records, topN);
    const recentAlerts = this.alertingSystem.getRecentAlerts(5);

    // Compute optimization summary
    const optimizer = new CostOptimizer(records);
    const optReport = optimizer.generateReport(kpis.totalCostUSD);

    return {
      generatedAt: new Date().toISOString(),
      budgetStatus,
      timeSeries,
      pluginBreakdown,
      topTools,
      recentAlerts,
      kpis,
      optimizationSummary: {
        potentialSavingsUSD: optReport.potentialMonthlySavingsUSD,
        topRecommendation:
          optReport.recommendations.length > 0
            ? optReport.recommendations[0].title
            : 'No immediate optimizations needed',
      },
    };
  }

  // ---------------------------------------------------------------------------
  // KPI Computation
  // ---------------------------------------------------------------------------

  /**
   * Compute key performance indicators for the dashboard header.
   */
  private computeKPIs(records: ToolCallRecord[]): DashboardKPIs {
    const totalCalls = records.length;
    const totalCost = records.reduce((s, r) => s + r.estimatedCostUSD, 0);
    const succeeded = records.filter((r) => r.success).length;
    const cached = records.filter((r) => r.cached).length;
    const uniquePlugins = new Set(records.map((r) => r.pluginName)).size;
    const uniqueUsers = new Set(records.map((r) => r.userId)).size;

    return {
      totalCalls,
      totalCostUSD: Math.round(totalCost * 100000) / 100000,
      averageCostPerCallUSD:
        totalCalls > 0 ? Math.round((totalCost / totalCalls) * 100000) / 100000 : 0,
      successRate:
        totalCalls > 0 ? Math.round((succeeded / totalCalls) * 10000) / 10000 : 1,
      activePlugins: uniquePlugins,
      cacheHitRate:
        totalCalls > 0 ? Math.round((cached / totalCalls) * 10000) / 10000 : 0,
      costPerUserUSD:
        uniqueUsers > 0 ? Math.round((totalCost / uniqueUsers) * 100000) / 100000 : 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Top Tools Computation
  // ---------------------------------------------------------------------------

  /**
   * Compute top-N tools by total cost across all plugins.
   */
  private computeTopTools(records: ToolCallRecord[], n: number): ToolCostSummary[] {
    const toolMap = new Map<string, {
      pluginName: string;
      toolName: string;
      calls: number;
      cost: number;
      latencySum: number;
      successes: number;
    }>();

    for (const record of records) {
      const key = `${record.pluginName}:${record.toolName}`;
      const entry = toolMap.get(key) ?? {
        pluginName: record.pluginName,
        toolName: record.toolName,
        calls: 0,
        cost: 0,
        latencySum: 0,
        successes: 0,
      };

      entry.calls++;
      entry.cost += record.estimatedCostUSD;
      entry.latencySum += record.latencyMs;
      if (record.success) entry.successes++;
      toolMap.set(key, entry);
    }

    const tools: ToolCostSummary[] = Array.from(toolMap.values()).map((entry) => ({
      pluginName: entry.pluginName,
      toolName: entry.toolName,
      totalCalls: entry.calls,
      totalCostUSD: Math.round(entry.cost * 100000) / 100000,
      avgLatencyMs:
        entry.calls > 0 ? Math.round(entry.latencySum / entry.calls) : 0,
      successRate:
        entry.calls > 0
          ? Math.round((entry.successes / entry.calls) * 10000) / 10000
          : 1,
    }));

    return tools.sort((a, b) => b.totalCostUSD - a.totalCostUSD).slice(0, n);
  }

  // ---------------------------------------------------------------------------
  // Convenience Methods
  // ---------------------------------------------------------------------------

  /**
   * Generate summary data for the dashboard header cards.
   */
  generateHeaderCards(): {
    totalSpend: number;
    totalCalls: number;
    activePlugins: number;
    budgetStatus: string;
    savingsPotential: number;
  } {
    const kpis = this.computeKPIs(this.costTracker.getRecords());
    const budgetStatus = this.budgetManager.getStatus();
    const optimizer = new CostOptimizer(this.costTracker.getRecords());
    const report = optimizer.generateReport(kpis.totalCostUSD);

    return {
      totalSpend: kpis.totalCostUSD,
      totalCalls: kpis.totalCalls,
      activePlugins: kpis.activePlugins,
      budgetStatus: budgetStatus.status,
      savingsPotential: report.potentialMonthlySavingsUSD,
    };
  }

  /**
   * Generate data for a pie/donut chart of spend by plugin.
   */
  generateSpendByPluginChart(): { labels: string[]; values: number[]; colors: string[] } {
    const plugins = this.costTracker.getPluginSummaries().slice(0, 8);
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    ];

    return {
      labels: plugins.map((p) => p.pluginName),
      values: plugins.map((p) => p.totalCostUSD),
      colors: colors.slice(0, plugins.length),
    };
  }

  /**
   * Generate data for a line/area chart of cost over time.
   */
  generateCostTimeSeriesChart(
    granularity: 'daily' | 'weekly' = 'daily'
  ): { timestamps: string[]; costs: number[]; tokens: number[]; calls: number[] } {
    const series = this.costTracker.getTimeSeries(granularity);

    return {
      timestamps: series.map((p) => p.timestamp),
      costs: series.map((p) => p.totalCostUSD),
      tokens: series.map((p) => p.totalTokens),
      calls: series.map((p) => p.callCount),
    };
  }

  /**
   * Generate data for a bar chart comparing plugin efficiency.
   */
  generatePluginEfficiencyChart(): {
    plugins: string[];
    avgCostPerCall: number[];
    failureRates: number[];
  } {
    const plugins = this.costTracker.getPluginSummaries().slice(0, 10);

    return {
      plugins: plugins.map((p) => p.pluginName),
      avgCostPerCall: plugins.map((p) => p.averageCostPerCallUSD),
      failureRates: plugins.map((p) => p.failureRate * 100),
    };
  }

  /**
   * Serialize dashboard data to JSON string for API response.
   */
  toJSON(data: DashboardData, pretty: boolean = true): string {
    if (pretty) {
      return JSON.stringify(data, null, 2);
    }
    return JSON.stringify(data);
  }
}
