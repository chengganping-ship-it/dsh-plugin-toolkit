/**
 * DSH MCP Bridge - Token Cost Governance
 *
 * Tracks estimated token usage per tool invocation using rough heuristics
 * based on input/output character size. Provides per-plugin aggregation,
 * budget threshold alerts (warn at 80%, block at 100%), and exports
 * cost reports as MCP resources.
 *
 * @module dsh-mcp-bridge/cost-tracker
 * @version 1.0.0
 */

import type {
  ToolCallReport,
  PluginCostReport,
  CostGovernanceState,
} from './types.js';

// =============================================================================
// Constants
// =============================================================================

/**
 * Rough heuristic: 1 token ~= 4 characters for mixed-language content.
 */
const CHARS_PER_TOKEN = 4;

/**
 * Estimated cost per 1M input tokens (USD).
 * Based on Claude Sonnet 3.5 / GPT-4o tier pricing as of 2026.
 */
const INPUT_COST_PER_MILLION_TOKENS = 3.0;

/**
 * Estimated cost per 1M output tokens (USD).
 */
const OUTPUT_COST_PER_MILLION_TOKENS = 15.0;

// =============================================================================
// Cost Estimation
// =============================================================================

/**
 * Estimate token count from character length.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Estimate USD cost for a given number of input and output tokens.
 */
export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * INPUT_COST_PER_MILLION_TOKENS;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_COST_PER_MILLION_TOKENS;
  return Math.round((inputCost + outputCost) * 100000) / 100000;
}

// =============================================================================
// Cost Tracker Class
// =============================================================================

/**
 * Tracks token usage and cost across all tool invocations.
 * Implements budget governance with configurable thresholds.
 */
export class CostTracker {
  private state: CostGovernanceState;

  constructor(budgetUsd: number = 0, warnThreshold: number = 0.8, blockThreshold: number = 1.0) {
    this.state = {
      records: [],
      byPlugin: new Map(),
      budgetUsd,
      warnThreshold,
      blockThreshold,
    };
  }

  // ---------------------------------------------------------------------------
  // Recording
  // ---------------------------------------------------------------------------

  /**
   * Record a tool invocation with estimated token usage and cost.
   */
  record(inputData: string, outputData: string, pluginName: string, toolName: string, success: boolean = true, error?: string): ToolCallReport {
    const inputTokens = estimateTokens(inputData);
    const outputTokens = estimateTokens(outputData);
    const estimatedCostUsd = estimateCost(inputTokens, outputTokens);

    const report: ToolCallReport = {
      plugin: pluginName,
      tool: toolName,
      timestamp: new Date().toISOString(),
      inputTokens,
      outputTokens,
      estimatedCostUsd,
      success,
      error,
    };

    this.state.records.push(report);
    this.aggregatePluginCost(pluginName, report);

    return report;
  }

  // ---------------------------------------------------------------------------
  // Aggregation
  // ---------------------------------------------------------------------------

  /**
   * Update per-plugin aggregated cost report.
   */
  private aggregatePluginCost(plugin: string, record: ToolCallReport): void {
    let report = this.state.byPlugin.get(plugin);

    if (!report) {
      report = {
        plugin,
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalEstimatedCostUsd: 0,
      };
      this.state.byPlugin.set(plugin, report);
    }

    report.totalCalls++;
    if (record.success) {
      report.successfulCalls++;
    } else {
      report.failedCalls++;
    }
    report.totalInputTokens += record.inputTokens;
    report.totalOutputTokens += record.outputTokens;
    report.totalEstimatedCostUsd = Math.round(
      (report.totalEstimatedCostUsd + record.estimatedCostUsd) * 100000
    ) / 100000;
  }

  // ---------------------------------------------------------------------------
  // Budget Governance
  // ---------------------------------------------------------------------------

  /**
   * Check whether a new call would exceed budget thresholds.
   */
  checkBudget(): { allowed: boolean; status: 'ok' | 'warning' | 'blocked'; totalSpent: number; budget: number; percentage: number } {
    const totalSpent = this.getTotalCost();
    const budget = this.state.budgetUsd;

    if (budget <= 0) {
      return { allowed: true, status: 'ok', totalSpent, budget, percentage: 0 };
    }

    const percentage = totalSpent / budget;

    if (percentage >= this.state.blockThreshold) {
      return { allowed: false, status: 'blocked', totalSpent, budget, percentage };
    }

    if (percentage >= this.state.warnThreshold) {
      return { allowed: true, status: 'warning', totalSpent, budget, percentage };
    }

    return { allowed: true, status: 'ok', totalSpent, budget, percentage };
  }

  /**
   * Get total estimated cost across all recorded calls.
   */
  getTotalCost(): number {
    return this.state.records.reduce((sum, r) => sum + r.estimatedCostUsd, 0);
  }

  /**
   * Get total estimated token count.
   */
  getTotalTokens(): { input: number; output: number } {
    return this.state.records.reduce(
      (acc, r) => ({
        input: acc.input + r.inputTokens,
        output: acc.output + r.outputTokens,
      }),
      { input: 0, output: 0 }
    );
  }

  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------

  /**
   * Get all recorded call reports.
   */
  getRecords(): ToolCallReport[] {
    return [...this.state.records];
  }

  /**
   * Get per-plugin cost reports sorted by total cost descending.
   */
  getPluginReports(): PluginCostReport[] {
    return Array.from(this.state.byPlugin.values()).sort(
      (a, b) => b.totalEstimatedCostUsd - a.totalEstimatedCostUsd
    );
  }

  /**
   * Generate a full cost summary report as a formatted string.
   */
  generateReport(): string {
    const totalCost = this.getTotalCost();
    const tokens = this.getTotalTokens();
    const plugins = this.getPluginReports();
    const budget = this.state.budgetUsd;
    const budgetStatus = this.checkBudget();

    const lines: string[] = [];
    lines.push('# DSH MCP Bridge - Cost Governance Report');
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| Metric | Value |');
    lines.push('|--------|-------|');
    lines.push(`| Total Tool Calls | ${this.state.records.length} |`);
    lines.push(`| Total Input Tokens | ${tokens.input.toLocaleString()} |`);
    lines.push(`| Total Output Tokens | ${tokens.output.toLocaleString()} |`);
    lines.push(`| Estimated Total Cost | $${totalCost.toFixed(5)} |`);
    lines.push(`| Budget | ${budget > 0 ? '$' + budget.toFixed(2) : 'Unlimited'} |`);
    lines.push(`| Budget Used | ${budget > 0 ? (budgetStatus.percentage * 100).toFixed(1) + '%' : 'N/A'} |`);
    lines.push(`| Status | ${budgetStatus.status === 'ok' ? 'OK' : budgetStatus.status === 'warning' ? 'WARNING' : 'BLOCKED'} |`);
    lines.push('');

    if (plugins.length > 0) {
      lines.push('## Cost by Plugin');
      lines.push('');
      lines.push('| Plugin | Calls | Input Tokens | Output Tokens | Est. Cost (USD) |');
      lines.push('|--------|-------|-------------|--------------|-----------------|');
      for (const p of plugins) {
        lines.push(
          `| ${p.plugin} | ${p.totalCalls} | ${p.totalInputTokens.toLocaleString()} | ${p.totalOutputTokens.toLocaleString()} | $${p.totalEstimatedCostUsd.toFixed(5)} |`
        );
      }
      lines.push('');
    }

    const recentCalls = this.state.records.slice(-20);
    if (recentCalls.length > 0) {
      lines.push('## Recent Tool Calls (Last 20)');
      lines.push('');
      lines.push('| # | Plugin | Tool | Input Tokens | Output Tokens | Cost (USD) | Status |');
      lines.push('|---|--------|------|-------------|--------------|------------|--------|');
      for (let i = 0; i < recentCalls.length; i++) {
        const c = recentCalls[i];
        lines.push(
          `| ${i + 1} | ${c.plugin} | ${c.tool} | ${c.inputTokens} | ${c.outputTokens} | $${c.estimatedCostUsd.toFixed(5)} | ${c.success ? 'OK' : 'FAIL'} |`
        );
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  // ---------------------------------------------------------------------------
  // Resource Export
  // ---------------------------------------------------------------------------

  /**
   * Export cost report as an MCP-compatible resource content.
   */
  exportAsResource(): { uri: string; mimeType: string; text: string } {
    return {
      uri: 'dsh-bridge://cost-report',
      mimeType: 'text/markdown',
      text: this.generateReport(),
    };
  }

  /**
   * Get current governance state for inspection.
   */
  getState(): CostGovernanceState {
    return {
      records: [...this.state.records],
      byPlugin: new Map(this.state.byPlugin),
      budgetUsd: this.state.budgetUsd,
      warnThreshold: this.state.warnThreshold,
      blockThreshold: this.state.blockThreshold,
    };
  }

  /**
   * Reset all tracked data.
   */
  reset(): void {
    this.state.records = [];
    this.state.byPlugin.clear();
  }
}
