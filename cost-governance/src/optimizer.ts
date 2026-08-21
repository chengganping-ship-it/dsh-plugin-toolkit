/**
 * DSH Cost Governance — Cost Optimization Engine
 *
 * Analyzes cost data to identify waste, rank expensive plugins by spend,
 * detect low-value calls (errors, empty results), and generate actionable
 * recommendations: batch calls, cache similar queries, downgrade models.
 *
 * @module dsh-cost-governance/optimizer
 * @version 1.0.0
 */

import type {
  ToolCallRecord,
  OptimizationReport,
  OptimizationRecommendation,
  PluginCostSummary,
  LowValueAnalysis,
} from './types.js';
import { MODEL_PRICING } from './types.js';

// =============================================================================
// Constants
// =============================================================================

const EMPTY_RESULT_PATTERNS = [
  /^\s*$/,
  /^null$/i,
  /^undefined$/i,
  /^\[\]$/,
  /^\{\}$/,
  /^no results? found$/i,
  /^empty$/i,
  /^无结果$/,
  /^没有数据$/,
  /^未找到/,
];

// =============================================================================
// Optimizer Class
// =============================================================================

/**
 * Generates cost optimization recommendations by analyzing spend patterns.
 */
export class CostOptimizer {
  private records: ToolCallRecord[];

  constructor(records: ToolCallRecord[]) {
    this.records = records;
  }

  // ---------------------------------------------------------------------------
  // Full Report Generation
  // ---------------------------------------------------------------------------

  /**
   * Generate a comprehensive optimization report.
   */
  generateReport(currentMonthlySpendUSD: number = 0): OptimizationReport {
    const topPlugins = this.getTopExpensivePlugins(10);
    const lowValue = this.analyzeLowValueCalls();
    const recommendations = this.generateRecommendations(topPlugins, lowValue);

    const totalSavings = recommendations.reduce(
      (sum, r) => sum + r.estimatedMonthlySavingsUSD,
      0
    );

    const topRec = recommendations.length > 0 ? recommendations[0] : null;

    return {
      generatedAt: new Date().toISOString(),
      currentMonthlySpendUSD,
      potentialMonthlySavingsUSD: Math.round(totalSavings * 100) / 100,
      savingsPercentage:
        currentMonthlySpendUSD > 0
          ? Math.round((totalSavings / currentMonthlySpendUSD) * 10000) / 10000
          : 0,
      recommendations,
      topExpensivePlugins: topPlugins,
      lowValueAnalysis: lowValue,
    };
  }

  // ---------------------------------------------------------------------------
  // Top Expensive Plugins
  // ---------------------------------------------------------------------------

  /**
   * Identify the top N most expensive plugins by total spend.
   */
  getTopExpensivePlugins(n: number = 10): PluginCostSummary[] {
    const pluginMap = new Map<string, {
      calls: number;
      cost: number;
      failures: number;
    }>();

    let totalCost = 0;

    for (const record of this.records) {
      totalCost += record.estimatedCostUSD;
      const entry = pluginMap.get(record.pluginName) ?? {
        calls: 0,
        cost: 0,
        failures: 0,
      };
      entry.calls++;
      entry.cost += record.estimatedCostUSD;
      if (!record.success) entry.failures++;
      pluginMap.set(record.pluginName, entry);
    }

    const summaries: PluginCostSummary[] = Array.from(pluginMap.entries()).map(
      ([pluginName, data]) => ({
        pluginName,
        totalCalls: data.calls,
        totalCostUSD: Math.round(data.cost * 100000) / 100000,
        averageCostPerCallUSD:
          data.calls > 0
            ? Math.round((data.cost / data.calls) * 100000) / 100000
            : 0,
        failedCalls: data.failures,
        failureRate:
          data.calls > 0
            ? Math.round((data.failures / data.calls) * 10000) / 10000
            : 0,
        spendPercentage:
          totalCost > 0
            ? Math.round((data.cost / totalCost) * 10000) / 10000
            : 0,
      })
    );

    return summaries.sort((a, b) => b.totalCostUSD - a.totalCostUSD).slice(0, n);
  }

  // ---------------------------------------------------------------------------
  // Low-Value Call Analysis
  // ---------------------------------------------------------------------------

  /**
   * Detect low-value calls: errors, empty results, duplicates.
   */
  analyzeLowValueCalls(): LowValueAnalysis {
    let errorCallCount = 0;
    let errorCallCostUSD = 0;
    let emptyResultCount = 0;
    let emptyResultCostUSD = 0;
    let duplicateCallCount = 0;
    let duplicateCallCostUSD = 0;

    // Track seen call signatures for duplicate detection
    const seenSignatures = new Set<string>();

    for (const record of this.records) {
      // Error calls
      if (!record.success) {
        errorCallCount++;
        errorCallCostUSD += record.estimatedCostUSD;
      }

      // Empty results (heuristic based on very low output tokens)
      if (record.success && record.outputTokens < 5) {
        emptyResultCount++;
        emptyResultCostUSD += record.estimatedCostUSD;
      }

      // Duplicate calls (same plugin + tool within time proximity)
      const signature = `${record.pluginName}:${record.toolName}:${record.userId}`;
      if (seenSignatures.has(signature)) {
        duplicateCallCount++;
        duplicateCallCostUSD += record.estimatedCostUSD;
      } else {
        seenSignatures.add(signature);
      }
    }

    errorCallCostUSD = Math.round(errorCallCostUSD * 100000) / 100000;
    emptyResultCostUSD = Math.round(emptyResultCostUSD * 100000) / 100000;
    duplicateCallCostUSD = Math.round(duplicateCallCostUSD * 100000) / 100000;

    return {
      errorCallCount,
      errorCallCostUSD,
      emptyResultCount,
      emptyResultCostUSD,
      duplicateCallCount,
      duplicateCallCostUSD,
      totalWastefulSpendUSD: Math.round(
        (errorCallCostUSD + emptyResultCostUSD + duplicateCallCostUSD) * 100000
      ) / 100000,
    };
  }

  /**
   * Check if an output string qualifies as "empty result".
   */
  isEmptyResult(outputData: string): boolean {
    return EMPTY_RESULT_PATTERNS.some((pattern) => pattern.test(outputData));
  }

  // ---------------------------------------------------------------------------
  // Recommendation Generation
  // ---------------------------------------------------------------------------

  /**
   * Generate optimization recommendations based on analysis.
   */
  private generateRecommendations(
    topPlugins: PluginCostSummary[],
    lowValue: LowValueAnalysis
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // 1. Eliminate error calls
    if (lowValue.errorCallCount > 0) {
      recommendations.push({
        severity: lowValue.errorCallCostUSD > 1 ? 'high' : 'medium',
        category: 'eliminate',
        title: 'Fix failing tool calls',
        description: `${lowValue.errorCallCount} tool calls failed, wasting $${lowValue.errorCallCostUSD.toFixed(4)}. Investigate error patterns and fix root causes.`,
        pluginName: 'global',
        estimatedMonthlySavingsUSD: lowValue.errorCallCostUSD,
        implementationEffort: 'medium',
        actionItems: [
          'Review error logs to identify common failure patterns',
          'Add input validation before tool calls',
          'Implement retry logic with exponential backoff',
          'Set up alerts for plugins with >10% failure rate',
        ],
      });
    }

    // 2. Eliminate duplicate calls
    if (lowValue.duplicateCallCount > 0) {
      recommendations.push({
        severity: lowValue.duplicateCallCostUSD > 0.5 ? 'medium' : 'low',
        category: 'cache',
        title: 'Cache duplicate tool calls',
        description: `${lowValue.duplicateCallCount} duplicate calls detected, costing $${lowValue.duplicateCallCostUSD.toFixed(4)}. Implement result caching for identical queries.`,
        pluginName: 'global',
        estimatedMonthlySavingsUSD: lowValue.duplicateCallCostUSD,
        implementationEffort: 'low',
        actionItems: [
          'Enable deduplication in the cost tracker',
          'Implement TTL-based result cache (5-30s for real-time data)',
          'Use memoization for deterministic tool calls',
          'Set cache-control headers on downstream APIs',
        ],
      });
    }

    // 3. Downgrade models for inexpensive plugins
    if (topPlugins.length > 0) {
      const expensiveTop3 = topPlugins.slice(0, 3);
      for (const plugin of expensiveTop3) {
        if (plugin.averageCostPerCallUSD > 0.001) {
          const savingsPerCall = plugin.averageCostPerCallUSD * 0.6; // 60% from model downgrade
          const monthlySavings = savingsPerCall * plugin.totalCalls * 30; // projected to month

          recommendations.push({
            severity: monthlySavings > 5 ? 'high' : 'medium',
            category: 'downgrade',
            title: `Downgrade model for ${plugin.pluginName}`,
            description: `${plugin.pluginName} costs $${plugin.averageCostPerCallUSD.toFixed(5)}/call average. Switching from Claude Sonnet to GPT-4o-mini could save ~60% per call.`,
            pluginName: plugin.pluginName,
            estimatedMonthlySavingsUSD: Math.round(monthlySavings * 100) / 100,
            implementationEffort: 'low',
            actionItems: [
              `Test ${plugin.pluginName} with GPT-4o-mini or Claude Haiku`,
              'Compare output quality with current model',
              'Set model tier per-plugin via configuration',
              'Monitor quality metrics after downgrade',
            ],
          });
        }
      }
    }

    // 4. Batch operations recommendation
    if (topPlugins.length > 0) {
      const highFrequencyPlugins = topPlugins.filter((p) => p.totalCalls > 50);
      if (highFrequencyPlugins.length > 0) {
        const totalCalls = highFrequencyPlugins.reduce((s, p) => s + p.totalCalls, 0);
        const batchSavings = totalCalls * 0.0001; // estimated per-call savings from batching

        recommendations.push({
          severity: batchSavings > 1 ? 'high' : 'medium',
          category: 'batch',
          title: 'Batch tool calls for high-frequency plugins',
          description: `${highFrequencyPlugins.length} plugins have >50 calls each. Batching similar requests can reduce overhead and token waste.`,
          pluginName: highFrequencyPlugins.map((p) => p.pluginName).join(', '),
          estimatedMonthlySavingsUSD: Math.round(batchSavings * 30 * 100) / 100,
          implementationEffort: 'medium',
          actionItems: [
            'Identify tools that accept batch inputs',
            'Implement request queue with debounce',
            'Group calls by plugin and execute in parallel',
            'Set up batch processing windows (e.g., 100ms)',
          ],
        });
      }
    }

    // 5. Rate limiting recommendation for anomalous plugins
    const highFailurePlugins = topPlugins.filter((p) => p.failureRate > 0.3);
    if (highFailurePlugins.length > 0) {
      for (const plugin of highFailurePlugins) {
        recommendations.push({
          severity: 'critical',
          category: 'rate-limit',
          title: `Rate-limit ${plugin.pluginName} (${Math.round(plugin.failureRate * 100)}% failure rate)`,
          description: `${plugin.pluginName} has ${plugin.failedCalls}/${plugin.totalCalls} failed calls. Implement circuit breaker and rate limiting.`,
          pluginName: plugin.pluginName,
          estimatedMonthlySavingsUSD: Math.round(plugin.totalCostUSD * plugin.failureRate * 100) / 100,
          implementationEffort: 'medium',
          actionItems: [
            `Set rate limit for ${plugin.pluginName} to prevent cascading failures`,
            'Implement circuit breaker pattern',
            'Add fallback behavior for failed calls',
            'Alert on-call team if failure rate exceeds threshold',
          ],
        });
      }
    }

    // 6. Off-peak scheduling for non-urgent calls
    if (topPlugins.length > 3) {
      recommendations.push({
        severity: 'low',
        category: 'off-peak',
        title: 'Schedule non-urgent calls during off-peak hours',
        description: 'Some DSH tools (report generation, data aggregation) can be deferred to off-peak hours when model rates may be lower.',
        pluginName: 'global',
        estimatedMonthlySavingsUSD:
          Math.round(this.records.reduce((s, r) => s + r.estimatedCostUSD, 0) * 0.1 * 100) / 100,
        implementationEffort: 'high',
        actionItems: [
          'Classify tools as real-time vs. deferrable',
          'Implement job queue for background processing',
          'Schedule batch jobs during off-peak hours',
          'Negotiate volume discount with model providers',
        ],
      });
    }

    // Sort by estimated savings descending
    return recommendations.sort(
      (a, b) => b.estimatedMonthlySavingsUSD - a.estimatedMonthlySavingsUSD
    );
  }

  // ---------------------------------------------------------------------------
  // Utility Methods
  // ---------------------------------------------------------------------------

  /**
   * Get the potential monthly savings formatted as a human-readable string.
   */
  static formatSavings(report: OptimizationReport): string {
    const lines: string[] = [];
    lines.push('=== Cost Optimization Report ===');
    lines.push(`Generated: ${report.generatedAt}`);
    lines.push(`Current Monthly Spend: $${report.currentMonthlySpendUSD.toFixed(2)}`);
    lines.push(`Potential Monthly Savings: $${report.potentialMonthlySavingsUSD.toFixed(2)}`);
    lines.push(`Savings Percentage: ${(report.savingsPercentage * 100).toFixed(1)}%`);
    lines.push('');

    if (report.topExpensivePlugins.length > 0) {
      lines.push('--- Top Expensive Plugins ---');
      report.topExpensivePlugins.forEach((p, i) => {
        lines.push(
          `  ${i + 1}. ${p.pluginName}: $${p.totalCostUSD.toFixed(4)} (${p.totalCalls} calls, ${(p.spendPercentage * 100).toFixed(1)}%)`
        );
      });
      lines.push('');
    }

    if (report.recommendations.length > 0) {
      lines.push('--- Recommendations ---');
      report.recommendations.forEach((r, i) => {
        lines.push(`  ${i + 1}. [${r.severity.toUpperCase()}] ${r.title}`);
        lines.push(`     Savings: $${r.estimatedMonthlySavingsUSD.toFixed(2)}/month | Effort: ${r.implementationEffort}`);
        lines.push(`     ${r.description}`);
      });
    }

    return lines.join('\n');
  }
}
