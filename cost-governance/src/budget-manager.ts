/**
 * DSH Cost Governance — Budget Manager
 *
 * Manages budget allocation, enforcement, and rollover across monthly/quarterly
 * billing cycles. Supports per-user and per-plugin budget caps with configurable
 * warning and hard-limit thresholds.
 *
 * @module dsh-cost-governance/budget-manager
 * @version 1.0.0
 */

import type {
  BudgetConfig,
  BudgetStatus,
  EntitySpend,
} from './types.js';
import { DEFAULT_BUDGET_CONFIG } from './types.js';

// =============================================================================
// Constants
// =============================================================================

const MS_PER_DAY = 86_400_000;

// =============================================================================
// Budget Manager Class
// =============================================================================

/**
 * Manages budgets for the DSH Plugin Toolkit.
 *
 * Responsibilities:
 * - Set and enforce monthly/quarterly budgets
 * - Track spend vs budget in real time
 * - Enforce hard limits (reject when over budget)
 * - Support per-user and per-plugin budget allocation
 * - Rollover unused budget (optional)
 */
export class BudgetManager {
  private config: BudgetConfig;
  private currentSpendUSD: number = 0;
  private currentMonth: string;
  private perUserSpend: Map<string, number> = new Map();
  private perPluginSpend: Map<string, number> = new Map();
  private rolloverBalanceUSD: number = 0;
  private spendHistory: Map<string, number> = new Map(); // month -> spend

  constructor(config: Partial<BudgetConfig> = {}) {
    this.config = { ...DEFAULT_BUDGET_CONFIG, ...config };
    this.currentMonth = this.getCurrentMonth();
  }

  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  /**
   * Get the current budget configuration.
   */
  getConfig(): BudgetConfig {
    return { ...this.config };
  }

  /**
   * Update budget configuration.
   */
  setConfig(config: Partial<BudgetConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Set a new monthly budget.
   */
  setMonthlyBudget(usd: number): void {
    this.config.monthlyBudgetUSD = usd;
  }

  /**
   * Set per-user budget cap.
   */
  setPerUserBudget(usd: number | undefined): void {
    this.config.perUserBudgetUSD = usd;
  }

  /**
   * Set per-plugin budget cap.
   */
  setPerPluginBudget(usd: number | undefined): void {
    this.config.perPluginBudgetUSD = usd;
  }

  // ---------------------------------------------------------------------------
  // Spend Tracking
  // ---------------------------------------------------------------------------

  /**
   * Record spend amount (called by CostTracker after each tool call).
   */
  recordSpend(usd: number, entityType: 'user' | 'plugin', entityId: string): void {
    this.checkMonthRollover();

    this.currentSpendUSD += usd;

    if (entityType === 'user') {
      const current = this.perUserSpend.get(entityId) ?? 0;
      this.perUserSpend.set(entityId, current + usd);
    } else {
      const current = this.perPluginSpend.get(entityId) ?? 0;
      this.perPluginSpend.set(entityId, current + usd);
    }
  }

  /**
   * Get total current month spend.
   */
  getCurrentSpend(): number {
    return Math.round(this.currentSpendUSD * 100000) / 100000;
  }

  /**
   * Get spend for a specific user.
   */
  getUserSpend(userId: string): number {
    return this.perUserSpend.get(userId) ?? 0;
  }

  /**
   * Get spend for a specific plugin.
   */
  getPluginSpend(pluginName: string): number {
    return this.perPluginSpend.get(pluginName) ?? 0;
  }

  // ---------------------------------------------------------------------------
  // Budget Status
  // ---------------------------------------------------------------------------

  /**
   * Get full budget status snapshot including projections.
   */
  getStatus(): BudgetStatus {
    this.checkMonthRollover();

    const budget = this.config.monthlyBudgetUSD + this.rolloverBalanceUSD;
    const spent = this.currentSpendUSD;
    const percentageUsed = budget > 0 ? spent / budget : 0;
    const now = new Date();
    const daysRemaining = this.getDaysRemainingInMonth(now);
    const dayOfMonth = now.getDate();
    const daysInMonth = this.getDaysInMonth(now);

    // Projected spend: current spend / elapsed days * total days
    const elapsedDays = dayOfMonth;
    const runRate = elapsedDays > 0 ? spent / elapsedDays : 0;
    const projectedSpendUSD = runRate * daysInMonth;

    let status: BudgetStatus['status'];
    let allowed: boolean;

    if (percentageUsed >= 1.0) {
      status = 'exceeded';
      allowed = false;
    } else if (percentageUsed >= 0.95) {
      status = 'critical';
      allowed = true;
    } else if (percentageUsed >= this.config.warningThreshold) {
      status = 'warning';
      allowed = true;
    } else {
      status = 'ok';
      allowed = true;
    }

    return {
      monthlyBudgetUSD: budget,
      spentUSD: Math.round(spent * 100000) / 100000,
      remainingUSD: Math.max(0, Math.round((budget - spent) * 100000) / 100000),
      percentageUsed: Math.round(percentageUsed * 10000) / 10000,
      status,
      daysRemaining,
      projectedSpendUSD: Math.round(projectedSpendUSD * 100) / 100,
      allowed,
    };
  }

  /**
   * Check if a call is allowed based on all budget constraints.
   *
   * @param entityType - Type of entity to check
   * @param entityId - Entity identifier
   * @returns Whether the call can proceed
   */
  isAllowed(entityType: 'user' | 'plugin', entityId: string): boolean {
    const status = this.getStatus();

    // Global budget exceeded
    if (!status.allowed) {
      return false;
    }

    // Hard limit check
    if (status.percentageUsed >= this.config.hardLimitThreshold) {
      return false;
    }

    // Per-user budget check
    if (entityType === 'user' && this.config.perUserBudgetUSD !== undefined) {
      const userSpend = this.perUserSpend.get(entityId) ?? 0;
      if (userSpend >= this.config.perUserBudgetUSD) {
        return false;
      }
    }

    // Per-plugin budget check
    if (entityType === 'plugin' && this.config.perPluginBudgetUSD !== undefined) {
      const pluginSpend = this.perPluginSpend.get(entityId) ?? 0;
      if (pluginSpend >= this.config.perPluginBudgetUSD) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get per-entity spend summaries.
   */
  getEntitySpends(): EntitySpend[] {
    const results: EntitySpend[] = [];

    // User spends
    for (const [entityId, spentUSD] of this.perUserSpend.entries()) {
      const budgetCapUSD = this.config.perUserBudgetUSD ?? this.config.monthlyBudgetUSD;
      results.push({
        entityId,
        entityType: 'user',
        budgetCapUSD,
        spentUSD: Math.round(spentUSD * 100000) / 100000,
        percentageUsed: budgetCapUSD > 0 ? Math.round((spentUSD / budgetCapUSD) * 10000) / 10000 : 0,
      });
    }

    // Plugin spends
    for (const [entityId, spentUSD] of this.perPluginSpend.entries()) {
      const budgetCapUSD = this.config.perPluginBudgetUSD ?? this.config.monthlyBudgetUSD;
      results.push({
        entityId,
        entityType: 'plugin',
        budgetCapUSD,
        spentUSD: Math.round(spentUSD * 100000) / 100000,
        percentageUsed: budgetCapUSD > 0 ? Math.round((spentUSD / budgetCapUSD) * 10000) / 10000 : 0,
      });
    }

    return results.sort((a, b) => b.spentUSD - a.spentUSD);
  }

  // ---------------------------------------------------------------------------
  // Rollover Support
  // ---------------------------------------------------------------------------

  /**
   * Handle month rollover: carry over unused budget if enabled.
   */
  private checkMonthRollover(): void {
    const newMonth = this.getCurrentMonth();
    if (newMonth === this.currentMonth) {
      return;
    }

    // Save previous month's spend
    this.spendHistory.set(this.currentMonth, this.currentSpendUSD);

    if (this.config.rolloverEnabled) {
      const budget = this.config.monthlyBudgetUSD + this.rolloverBalanceUSD;
      const unused = Math.max(0, budget - this.currentSpendUSD);
      // Rollover up to 100% of current budget cap
      this.rolloverBalanceUSD = Math.min(unused, this.config.monthlyBudgetUSD);
    } else {
      this.rolloverBalanceUSD = 0;
    }

    // Reset tracking for new month
    this.currentSpendUSD = 0;
    this.perUserSpend.clear();
    this.perPluginSpend.clear();
    this.currentMonth = newMonth;
  }

  /**
   * Manual month rollover (primarily for testing).
   */
  forceMonthRollover(): void {
    this.checkMonthRollover();
  }

  /**
   * Get spend history by month.
   */
  getSpendHistory(): Map<string, number> {
    return new Map(this.spendHistory);
  }

  // ---------------------------------------------------------------------------
  // Reset
  // ---------------------------------------------------------------------------

  /**
   * Reset all budget tracking data.
   */
  reset(): void {
    this.currentSpendUSD = 0;
    this.perUserSpend.clear();
    this.perPluginSpend.clear();
    this.rolloverBalanceUSD = 0;
    this.spendHistory.clear();
    this.currentMonth = this.getCurrentMonth();
  }

  // ---------------------------------------------------------------------------
  // Utility
  // ---------------------------------------------------------------------------

  /**
   * Get current month in YYYY-MM format.
   */
  private getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Get number of days in a given month.
   */
  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  /**
   * Get days remaining in the current month.
   */
  private getDaysRemainingInMonth(date: Date): number {
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay.getDate() - date.getDate();
  }
}
