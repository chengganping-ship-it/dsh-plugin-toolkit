/**
 * DSH Cost Governance — Alerting System
 *
 * Provides threshold-based alerts for budget consumption, anomaly detection
 * for sudden cost spikes, and per-plugin cost anomalies. Alerts are emitted
 * to configurable channels: console, file, webhook, and custom handlers.
 *
 * @module dsh-cost-governance/alerting
 * @version 1.0.0
 */

import type {
  CostAlert,
  AlertSeverity,
  AlertingConfig,
  AlertHandler,
  BudgetStatus,
  PluginCostSummary,
} from './types.js';
import { DEFAULT_ALERTING_CONFIG } from './types.js';

// =============================================================================
// ID Generation
// =============================================================================

let alertCounter = 0;

function generateAlertId(): string {
  alertCounter++;
  return `alert_${Date.now().toString(36)}_${alertCounter.toString(36)}`;
}

// =============================================================================
// Alerting Class
// =============================================================================

/**
 * Manages cost governance alerts with configurable channels and cooldown.
 */
export class AlertingSystem {
  private config: AlertingConfig;
  private alerts: CostAlert[] = [];
  private lastAlertTime: Map<string, number> = new Map(); // category:entityId -> timestamp

  constructor(config: Partial<AlertingConfig> = {}) {
    this.config = { ...DEFAULT_ALERTING_CONFIG, ...config };
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  getConfig(): AlertingConfig {
    return { ...this.config, handlers: [...this.config.handlers] };
  }

  setConfig(config: Partial<AlertingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Register a custom alert handler.
   */
  addHandler(handler: AlertHandler): void {
    this.config.handlers.push(handler);
  }

  /**
   * Remove all custom handlers.
   */
  clearHandlers(): void {
    this.config.handlers = [];
  }

  // ---------------------------------------------------------------------------
  // Alert Emission
  // ---------------------------------------------------------------------------

  /**
   * Emit an alert through all configured channels.
   */
  emit(alert: CostAlert): void {
    // Check cooldown
    const cooldownKey = `${alert.category}:${alert.entityId ?? 'global'}`;
    const lastTime = this.lastAlertTime.get(cooldownKey) ?? 0;
    const now = Date.now();

    if (now - lastTime < this.config.cooldownSeconds * 1000) {
      return; // Still in cooldown
    }

    this.lastAlertTime.set(cooldownKey, now);
    this.alerts.push(alert);

    // Severity filtering
    const severityOrder: Record<AlertSeverity, number> = {
      info: 0,
      warning: 1,
      critical: 2,
    };
    if (severityOrder[alert.severity] < severityOrder[this.config.minSeverity]) {
      return;
    }

    // Console output
    if (this.config.consoleEnabled) {
      this.writeToConsole(alert);
    }

    // File output
    if (this.config.logFilePath) {
      this.writeToFile(alert);
    }

    // Webhook
    if (this.config.webhookUrl) {
      this.sendWebhook(alert);
    }

    // Custom handlers
    for (const handler of this.config.handlers) {
      try {
        const result = handler(alert);
        if (result instanceof Promise) {
          result.catch((err) => {
            console.error('[AlertingSystem] Handler error:', err);
          });
        }
      } catch (err) {
        console.error('[AlertingSystem] Handler error:', err);
      }
    }
  }

  /**
   * Emit a budget threshold alert.
   */
  emitBudgetAlert(status: BudgetStatus): void {
    let severity: AlertSeverity;
    let title: string;

    switch (status.status) {
      case 'exceeded':
        severity = 'critical';
        title = 'Budget exceeded - calls blocked';
        break;
      case 'critical':
        severity = 'critical';
        title = 'Budget critically high (>95%)';
        break;
      case 'warning':
        severity = 'warning';
        title = 'Budget warning threshold reached (>80%)';
        break;
      default:
        return; // No alert needed
    }

    this.emit({
      id: generateAlertId(),
      severity,
      category: 'budget_threshold',
      title,
      message: `Monthly budget: $${status.monthlyBudgetUSD.toFixed(2)}. Spent: $${status.spentUSD.toFixed(2)} (${(status.percentageUsed * 100).toFixed(1)}%). Remaining: $${status.remainingUSD.toFixed(2)}. Projected: $${status.projectedSpendUSD.toFixed(2)}.`,
      timestamp: new Date().toISOString(),
      metricValue: status.percentageUsed,
      threshold: status.percentageUsed,
      entityId: 'global',
      entityType: 'global',
      acknowledged: false,
    });
  }

  /**
   * Emit a cost spike anomaly alert.
   */
  emitAnomalyAlert(
    currentCost: number,
    baselineCost: number,
    entityId: string = 'global',
    entityType: 'user' | 'plugin' | 'global' = 'global'
  ): void {
    const increaseRatio = baselineCost > 0 ? currentCost / baselineCost : currentCost;

    if (increaseRatio < 2.0) {
      return; // Less than 2x increase is normal fluctuation
    }

    const severity: AlertSeverity = increaseRatio > 5 ? 'critical' : 'warning';

    this.emit({
      id: generateAlertId(),
      severity,
      category: 'anomaly_spike',
      title: `Cost spike detected: ${increaseRatio.toFixed(1)}x above baseline`,
      message: `Cost for ${entityId} is $${currentCost.toFixed(4)} vs baseline $${baselineCost.toFixed(4)} (${increaseRatio.toFixed(1)}x increase).`,
      timestamp: new Date().toISOString(),
      metricValue: currentCost,
      threshold: baselineCost * 2,
      entityId,
      entityType,
      acknowledged: false,
    });
  }

  /**
   * Emit per-plugin cost anomaly alert.
   */
  emitPluginAnomaly(plugin: PluginCostSummary, expectedCostUSD: number): void {
    if (expectedCostUSD <= 0) return;

    const spikeRatio = plugin.totalCostUSD / expectedCostUSD;

    if (spikeRatio < 3.0) return; // Less than 3x expected is normal

    const severity: AlertSeverity = spikeRatio > 10 ? 'critical' : 'warning';

    this.emit({
      id: generateAlertId(),
      severity,
      category: 'plugin_anomaly',
      title: `Plugin cost anomaly: ${plugin.pluginName}`,
      message: `${plugin.pluginName} cost $${plugin.totalCostUSD.toFixed(4)} vs expected $${expectedCostUSD.toFixed(4)} (${spikeRatio.toFixed(1)}x). Calls: ${plugin.totalCalls}, Failures: ${plugin.failedCalls}.`,
      timestamp: new Date().toISOString(),
      metricValue: plugin.totalCostUSD,
      threshold: expectedCostUSD * 3,
      entityId: plugin.pluginName,
      entityType: 'plugin',
      acknowledged: false,
    });
  }

  /**
   * Emit per-user or per-plugin budget limit alert.
   */
  emitEntityLimitAlert(
    entityId: string,
    entityType: 'user' | 'plugin',
    spentUSD: number,
    budgetCapUSD: number
  ): void {
    const percentage = budgetCapUSD > 0 ? spentUSD / budgetCapUSD : 0;

    if (percentage < 0.9) return; // Only alert at 90%+

    const severity: AlertSeverity = percentage >= 1.0 ? 'critical' : 'warning';

    this.emit({
      id: generateAlertId(),
      severity,
      category: entityType === 'user' ? 'per_user_limit' : 'per_plugin_limit',
      title: `${entityType === 'user' ? 'User' : 'Plugin'} budget limit reached: ${entityId}`,
      message: `${entityId} has spent $${spentUSD.toFixed(4)} of $${budgetCapUSD.toFixed(2)} budget (${(percentage * 100).toFixed(1)}%).`,
      timestamp: new Date().toISOString(),
      metricValue: percentage,
      threshold: 0.9,
      entityId,
      entityType,
      acknowledged: false,
    });
  }

  // ---------------------------------------------------------------------------
  // Alert Retrieval
  // ---------------------------------------------------------------------------

  /**
   * Get all alerts.
   */
  getAlerts(): CostAlert[] {
    return [...this.alerts];
  }

  /**
   * Get alerts filtered by severity.
   */
  getAlertsBySeverity(severity: AlertSeverity): CostAlert[] {
    return this.alerts.filter((a) => a.severity === severity);
  }

  /**
   * Get unacknowledged alerts.
   */
  getUnacknowledgedAlerts(): CostAlert[] {
    return this.alerts.filter((a) => !a.acknowledged);
  }

  /**
   * Get recent alerts (last N).
   */
  getRecentAlerts(n: number = 10): CostAlert[] {
    return this.alerts.slice(-n);
  }

  /**
   * Acknowledge an alert by ID.
   */
  acknowledge(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Output Channels
  // ---------------------------------------------------------------------------

  /**
   * Write alert to console with color-coded severity.
   */
  private writeToConsole(alert: CostAlert): void {
    const timestamp = new Date(alert.timestamp).toLocaleTimeString();
    const prefix = `[CostGov:${alert.severity.toUpperCase()}]`;
    const entityInfo = alert.entityId ? ` (${alert.entityType}:${alert.entityId})` : '';

    if (alert.severity === 'critical') {
      console.error(`${timestamp} ${prefix} ${alert.title}${entityInfo}`);
      console.error(`  ${alert.message}`);
    } else if (alert.severity === 'warning') {
      console.warn(`${timestamp} ${prefix} ${alert.title}${entityInfo}`);
      console.warn(`  ${alert.message}`);
    } else {
      console.info(`${timestamp} ${prefix} ${alert.title}${entityInfo}`);
      console.info(`  ${alert.message}`);
    }
  }

  /**
   * Append alert to log file.
   */
  private writeToFile(alert: CostAlert): void {
    try {
      const fs = require('fs') as typeof import('fs');
      const logLine = JSON.stringify(alert) + '\n';
      fs.appendFileSync(this.config.logFilePath!, logLine);
    } catch (err) {
      console.error('[AlertingSystem] File write error:', err);
    }
  }

  /**
   * Send alert to webhook URL.
   */
  private sendWebhook(alert: CostAlert): void {
    try {
      void fetch(this.config.webhookUrl!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      }).catch((err) => {
        console.error('[AlertingSystem] Webhook error:', err);
      });
    } catch (err) {
      console.error('[AlertingSystem] Webhook error:', err);
    }
  }

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  /**
   * Clear all alerts and cooldown state.
   */
  reset(): void {
    this.alerts = [];
    this.lastAlertTime.clear();
  }
}
