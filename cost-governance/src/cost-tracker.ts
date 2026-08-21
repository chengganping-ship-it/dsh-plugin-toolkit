/**
 * DSH Cost Governance — Cost Tracker
 *
 * Records every DSH tool call with token estimates, tracks token usage per
 * plugin (186 plugins), estimates cost based on configurable rates, maintains
 * time-series tracking, and exports cost data as JSON/CSV.
 *
 * @module dsh-cost-governance/cost-tracker
 * @version 1.0.0
 */

import type {
  ToolCallRecord,
  TokenCost,
  CostDataPoint,
  TimeGranularity,
  CostTrackerConfig,
  CostExportPayload,
  ExportFormat,
  PluginCostSummary,
} from './types.js';
import { DEFAULT_COST_TRACKER_CONFIG } from './types.js';

// =============================================================================
// ID Generation
// =============================================================================

let recordCounter = 0;

function generateId(): string {
  recordCounter++;
  return `call_${Date.now().toString(36)}_${recordCounter.toString(36)}`;
}

// =============================================================================
// Cost Estimation
// =============================================================================

/**
 * Estimate token count from character length using configurable ratio.
 */
export function estimateTokens(text: string, charsPerToken: number): number {
  return Math.ceil(text.length / charsPerToken);
}

/**
 * Estimate USD cost for given token counts and pricing rates.
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  inputRate: number,
  outputRate: number
): number {
  const inputCost = (inputTokens / 1000) * inputRate;
  const outputCost = (outputTokens / 1000) * outputRate;
  return Math.round((inputCost + outputCost) * 100000) / 100000;
}

// =============================================================================
// Cost Tracker Class
// =============================================================================

/**
 * Tracks cost across all DSH tool invocations.
 *
 * Features:
 * - Per-call token and cost estimation
 * - Per-plugin aggregation (186 plugins)
 * - Time-series tracking (hourly, daily, weekly)
 * - Deduplication of repeated calls
 * - Export as JSON/CSV
 */
export class CostTracker {
  private config: CostTrackerConfig;
  private records: ToolCallRecord[] = [];
  private signatureCache: Map<string, number> = new Map(); // signature -> last timestamp

  constructor(config: Partial<CostTrackerConfig> = {}) {
    this.config = { ...DEFAULT_COST_TRACKER_CONFIG, ...config };
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  getConfig(): CostTrackerConfig {
    return { ...this.config };
  }

  setConfig(config: Partial<CostTrackerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // ---------------------------------------------------------------------------
  // Recording
  // ---------------------------------------------------------------------------

  /**
   * Record a tool call with estimated cost.
   *
   * @param inputData - Raw input string
   * @param outputData - Raw output string
   * @param pluginName - Plugin identifier
   * @param toolName - Tool name
   * @param userId - User/agent identifier
   * @param latencyMs - Call latency in milliseconds
   * @param success - Whether the call succeeded
   * @param error - Optional error message
   * @returns The recorded ToolCallRecord (or null if deduplicated)
   */
  record(
    inputData: string,
    outputData: string,
    pluginName: string,
    toolName: string,
    userId: string = 'anonymous',
    latencyMs: number = 0,
    success: boolean = true,
    error?: string
  ): ToolCallRecord | null {
    const now = Date.now();

    // Deduplication check
    const signature = `${pluginName}:${toolName}:${userId}:${inputData}`;
    const lastSeen = this.signatureCache.get(signature);
    const isDuplicate = lastSeen !== undefined && (now - lastSeen) < this.config.deduplicationWindowMs;

    // Update signature cache
    this.signatureCache.set(signature, now);

    // Clean old cache entries periodically
    if (this.signatureCache.size > 10_000) {
      this.cleanSignatureCache(now);
    }

    // Estimate tokens and cost
    const inputTokens = estimateTokens(inputData, this.config.charsPerToken);
    const outputTokens = estimateTokens(outputData, this.config.charsPerToken);
    const tokenCost: TokenCost = {
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens: inputTokens + outputTokens,
      estimatedCostUSD: estimateCost(
        inputTokens,
        outputTokens,
        this.config.inputCostPer1KTokens,
        this.config.outputCostPer1KTokens
      ),
    };

    const record: ToolCallRecord = {
      id: generateId(),
      pluginName,
      toolName,
      userId,
      timestamp: new Date(now).toISOString(),
      inputTokens: tokenCost.promptTokens,
      outputTokens: tokenCost.completionTokens,
      estimatedCostUSD: tokenCost.estimatedCostUSD,
      latencyMs,
      success,
      error,
      cached: false,
    };

    this.records.push(record);

    // Enforce max records limit (evict oldest)
    if (this.records.length > this.config.maxRecords) {
      this.records = this.records.slice(-this.config.maxRecords);
    }

    return isDuplicate ? null : record;
  }

  /**
   * Record a cached hit (no actual call made, zero cost).
   */
  recordCachedHit(
    pluginName: string,
    toolName: string,
    userId: string = 'anonymous'
  ): ToolCallRecord {
    const record: ToolCallRecord = {
      id: generateId(),
      pluginName,
      toolName,
      userId,
      timestamp: new Date().toISOString(),
      inputTokens: 0,
      outputTokens: 0,
      estimatedCostUSD: 0,
      latencyMs: 0,
      success: true,
      cached: true,
    };

    this.records.push(record);
    return record;
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  /**
   * Get all records.
   */
  getRecords(): ToolCallRecord[] {
    return [...this.records];
  }

  /**
   * Get records filtered by plugin name.
   */
  getRecordsByPlugin(pluginName: string): ToolCallRecord[] {
    return this.records.filter((r) => r.pluginName === pluginName);
  }

  /**
   * Get records filtered by user ID.
   */
  getRecordsByUser(userId: string): ToolCallRecord[] {
    return this.records.filter((r) => r.userId === userId);
  }

  /**
   * Get records within a time range.
   */
  getRecordsInRange(startISO: string, endISO: string): ToolCallRecord[] {
    return this.records.filter(
      (r) => r.timestamp >= startISO && r.timestamp <= endISO
    );
  }

  /**
   * Get total cost across all records.
   */
  getTotalCost(): number {
    return Math.round(
      this.records.reduce((sum, r) => sum + r.estimatedCostUSD, 0) * 100000
    ) / 100000;
  }

  /**
   * Get total token counts.
   */
  getTotalTokens(): { input: number; output: number; total: number } {
    const result = this.records.reduce(
      (acc, r) => ({
        input: acc.input + r.inputTokens,
        output: acc.output + r.outputTokens,
        total: acc.total + r.inputTokens + r.outputTokens,
      }),
      { input: 0, output: 0, total: 0 }
    );
    return result;
  }

  /**
   * Get total call count.
   */
  getTotalCalls(): number {
    return this.records.length;
  }

  /**
   * Get success rate (0.0 to 1.0).
   */
  getSuccessRate(): number {
    if (this.records.length === 0) return 1.0;
    const succeeded = this.records.filter((r) => r.success).length;
    return Math.round((succeeded / this.records.length) * 10000) / 10000;
  }

  /**
   * Get cache hit rate.
   */
  getCacheHitRate(): number {
    if (this.records.length === 0) return 0;
    const cached = this.records.filter((r) => r.cached).length;
    return Math.round((cached / this.records.length) * 10000) / 10000;
  }

  // ---------------------------------------------------------------------------
  // Time-Series Aggregation
  // ---------------------------------------------------------------------------

  /**
   * Aggregate cost data by time granularity.
   */
  getTimeSeries(granularity: TimeGranularity): CostDataPoint[] {
    const bucketMap = new Map<string, CostDataPoint>();

    for (const record of this.records) {
      const bucketKey = this.getBucketKey(record.timestamp, granularity);
      let bucket = bucketMap.get(bucketKey);

      if (!bucket) {
        bucket = {
          timestamp: bucketKey,
          callCount: 0,
          totalTokens: 0,
          totalCostUSD: 0,
          failedCalls: 0,
          uniquePlugins: 0,
        };
        bucketMap.set(bucketKey, bucket);
      }

      bucket.callCount++;
      bucket.totalTokens += record.inputTokens + record.outputTokens;
      bucket.totalCostUSD = Math.round(
        (bucket.totalCostUSD + record.estimatedCostUSD) * 100000
      ) / 100000;
      if (!record.success) {
        bucket.failedCalls++;
      }
    }

    // Calculate unique plugins per bucket
    for (const [bucketKey, bucket] of bucketMap.entries()) {
      const pluginSet = new Set(
        this.records
          .filter((r) => this.getBucketKey(r.timestamp, granularity) === bucketKey)
          .map((r) => r.pluginName)
      );
      bucket.uniquePlugins = pluginSet.size;
    }

    return Array.from(bucketMap.values()).sort(
      (a, b) => a.timestamp.localeCompare(b.timestamp)
    );
  }

  /**
   * Get bucket key for a given ISO timestamp and granularity.
   */
  private getBucketKey(isoTimestamp: string, granularity: TimeGranularity): string {
    const date = new Date(isoTimestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (granularity) {
      case 'hourly':
        return `${year}-${month}-${day}T${String(date.getHours()).padStart(2, '0')}:00:00.000Z`;
      case 'daily':
        return `${year}-${month}-${day}T00:00:00.000Z`;
      case 'weekly': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const wYear = weekStart.getFullYear();
        const wMonth = String(weekStart.getMonth() + 1).padStart(2, '0');
        const wDay = String(weekStart.getDate()).padStart(2, '0');
        return `${wYear}-${wMonth}-${wDay}T00:00:00.000Z`;
      }
      case 'monthly':
        return `${year}-${month}-01T00:00:00.000Z`;
    }
  }

  // ---------------------------------------------------------------------------
  // Per-Plugin Aggregation
  // ---------------------------------------------------------------------------

  /**
   * Get per-plugin cost summaries sorted by total cost descending.
   */
  getPluginSummaries(): PluginCostSummary[] {
    const pluginMap = new Map<string, {
      calls: number;
      cost: number;
      failures: number;
      totalPlugins: number;
    }>();

    for (const record of this.records) {
      const entry = pluginMap.get(record.pluginName) ?? {
        calls: 0,
        cost: 0,
        failures: 0,
        totalPlugins: 0,
      };
      entry.calls++;
      entry.cost = Math.round((entry.cost + record.estimatedCostUSD) * 100000) / 100000;
      if (!record.success) entry.failures++;
      pluginMap.set(record.pluginName, entry);
    }

    const totalCost = this.getTotalCost();

    const summaries: PluginCostSummary[] = Array.from(pluginMap.entries()).map(
      ([pluginName, data]) => ({
        pluginName,
        totalCalls: data.calls,
        totalCostUSD: data.cost,
        averageCostPerCallUSD:
          data.calls > 0 ? Math.round((data.cost / data.calls) * 100000) / 100000 : 0,
        failedCalls: data.failures,
        failureRate: data.calls > 0 ? Math.round((data.failures / data.calls) * 10000) / 10000 : 0,
        spendPercentage: totalCost > 0 ? Math.round((data.cost / totalCost) * 10000) / 10000 : 0,
      })
    );

    return summaries.sort((a, b) => b.totalCostUSD - a.totalCostUSD);
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  /**
   * Export cost data in the specified format.
   */
  export(format: ExportFormat): string {
    switch (format) {
      case 'json':
        return this.exportJSON();
      case 'csv':
        return this.exportCSV();
    }
  }

  /**
   * Export as JSON payload.
   */
  private exportJSON(): string {
    const payload: CostExportPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      dateRange: this.getDateRange(),
      summary: {
        totalCalls: this.records.length,
        totalCostUSD: this.getTotalCost(),
        totalInputTokens: this.getTotalTokens().input,
        totalOutputTokens: this.getTotalTokens().output,
        successRate: this.getSuccessRate(),
      },
      records: this.records,
    };

    return JSON.stringify(payload, null, 2);
  }

  /**
   * Export as CSV.
   */
  private exportCSV(): string {
    const headers = [
      'id',
      'timestamp',
      'pluginName',
      'toolName',
      'userId',
      'inputTokens',
      'outputTokens',
      'estimatedCostUSD',
      'latencyMs',
      'success',
      'cached',
      'error',
    ];

    const rows = this.records.map((r) =>
      [
        r.id,
        r.timestamp,
        r.pluginName,
        r.toolName,
        r.userId,
        r.inputTokens.toString(),
        r.outputTokens.toString(),
        r.estimatedCostUSD.toFixed(5),
        r.latencyMs.toString(),
        r.success.toString(),
        r.cached.toString(),
        r.error ? `"${r.error.replace(/"/g, '""')}"` : '',
      ].join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Get the date range of all records.
   */
  private getDateRange(): { start: string; end: string } {
    if (this.records.length === 0) {
      const now = new Date().toISOString();
      return { start: now, end: now };
    }
    const timestamps = this.records.map((r) => r.timestamp).sort();
    return { start: timestamps[0], end: timestamps[timestamps.length - 1] };
  }

  // ---------------------------------------------------------------------------
  // Cache & Cleanup
  // ---------------------------------------------------------------------------

  /**
   * Clean old deduplication cache entries.
   */
  private cleanSignatureCache(now: number): void {
    const cutoff = now - this.config.deduplicationWindowMs * 10;
    for (const [key, ts] of this.signatureCache.entries()) {
      if (ts < cutoff) {
        this.signatureCache.delete(key);
      }
    }
  }

  /**
   * Reset all tracking data.
   */
  reset(): void {
    this.records = [];
    this.signatureCache.clear();
  }
}
