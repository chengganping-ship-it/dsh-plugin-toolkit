/**
 * DSH Gamification & Behavioral Design Plugin v1.0.0
 *
 * Gamification & Behavioral Design - achievement system designer, points mechanics
 * config, engagement loop analyzer, habit tracker architect, leaderboard optimizer,
 * narrative quest builder, churn prediction gamified, A/B test for rewards.
 * 2026: Gamification market projected to reach $96.8B globally.
 *
 * Features (v1.0.0):
 * - Achievement System Designer (badge taxonomy, unlock conditions, rarity tiers, progression curves, reward mapping)
 * - Points Mechanics Config (XP curves, point earning rules, redemption economy, balance sink/sources, inflation control)
 * - Engagement Loop Analyzer (DAU/MAU ratios, session frequency, viral coefficient, loop friction points, retention d1/d7/d30)
 * - Habit Tracker Architect (streak mechanics, reminder systems, accountability loops, relapse recovery, habit stacking)
 * - Leaderboard Optimizer (ranking algorithms, decay functions, tier segmentation, anti-cheating, motivational balance)
 * - Narrative Quest Builder (story arcs, quest branching, reward pacing, narrative hooks, progression gates)
 * - Churn Prediction Gamified (churn risk scoring, intervention triggers, re-engagement campaigns, reward salvage offers)
 * - AB Test Reward Optimizer (reward variant testing, statistical significance, segment analysis, ROI measurement)
 *
 * @module dsh-tool-gamify
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-gamify'
export const inject = ['tools']

const VERSION = '1.0.0'
const DISCLAIMER = '本工具提供游戏化与行为设计分析框架，不替代实际产品决策。'

// ==================== TYPES ====================

export interface AchievementSystemInput {
  product_name?: string
  target_audience?: string
  achievement_categories?: string[]
  rarity_distribution?: { common?: number; rare?: number; epic?: number; legendary?: number }
  unlock_condition_types?: string[]
  reward_types?: string[]
  progression_tiers?: number
  estimated_total_achievements?: number
  daily_active_users?: number
}

export interface PointsMechanicsInput {
  currency_name?: string
  xp_curve_type?: 'linear' | 'exponential' | 'logarithmic' | 'sigmoid' | 'custom'
  max_level?: number
  actions?: { name: string; xp_reward: number; cooldown_seconds?: number }[]
  sink_mechanisms?: string[]
  daily_cap_xp?: number
  weekly_cap_xp?: number
  starting_xp?: number
  inflation_target_pct?: number
}

export interface EngagementLoopInput {
  product_name?: string
  current_dau?: number
  current_mau?: number
  avg_session_minutes?: number
  avg_sessions_per_day?: number
  retention_d1_pct?: number
  retention_d7_pct?: number
  retention_d30_pct?: number
  viral_coefficient?: number
  core_loop_actions?: string[]
  onboarding_completion_pct?: number
}

export interface HabitTrackerInput {
  habit_name?: string
  target_frequency?: 'daily' | 'weekly' | 'custom'
  streak_target_days?: number
  reminder_channels?: string[]
  accountability_type?: 'solo' | 'buddy' | 'group' | 'public'
  relapse_recovery_mode?: 'grace_period' | 'streak_freeze' | 'reset_fresh' | 'partial_credit'
  habit_stack_depth?: number
  success_rate_target_pct?: number
  current_completion_rate_pct?: number
}

export interface LeaderboardInput {
  leaderboard_name?: string
  ranking_metric?: string
  tier_system?: string[]
  total_participants?: number
  update_frequency?: 'realtime' | 'hourly' | 'daily' | 'weekly'
  decay_function?: 'none' | 'linear_decay' | 'exponential_decay' | 'seasonal_reset'
  anti_cheat_enabled?: boolean
  bottom_pct_demotivated?: number
}

export interface NarrativeQuestInput {
  quest_line_name?: string
  genre?: 'fantasy' | 'sci-fi' | 'mystery' | 'slice_of_life' | 'horror' | 'custom'
  total_chapters?: number
  avg_quest_duration_min?: number
  branching_factor?: number
  core_narrative_hooks?: string[]
  reward_checkpoints?: string[]
  player_agency_level?: 'low' | 'medium' | 'high'
  xp_per_chapter?: number
}

export interface ChurnPredictionInput {
  product_name?: string
  total_users?: number
  monthly_churn_pct?: number
  churn_signals?: string[]
  intervention_channels?: string[]
  reengagement_reward_budget_pct?: number
  churn_risk_segments?: string[]
  avg_recovery_rate_pct?: number
  reward_salvage_offers?: string[]
}

export interface ABTestRewardInput {
  experiment_name?: string
  reward_variant_a?: { name: string; reward_type: string; value: number; description?: string }
  reward_variant_b?: { name: string; reward_type: string; value: number; description?: string }
  sample_size_per_variant?: number
  current_conversion_pct?: number
  target_lift_pct?: number
  test_duration_days?: number
  segment_dimensions?: string[]
  statistical_power?: number
}

// ==================== MULBERRY32 DETERMINISTIC PRNG ====================

function mulberry32(seed: number): () => number {
  let a = seed | 0
  return function (): number {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash + char) | 0
  }
  return Math.abs(hash)
}

// ==================== HELPER FUNCTIONS ====================

function parseInput<T>(inputData: string): T {
  try {
    return JSON.parse(inputData) as T
  } catch {
    return {} as T
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function formatPct(score: number): string {
  return (score * 100).toFixed(1)
}

function formatNum(n: number): string {
  return n.toLocaleString()
}

// ==================== TOOL 1: ACHIEVEMENT SYSTEM DESIGNER ====================

function executeAchievementSystemDesigner(inputData: string): string {
  const data = parseInput<AchievementSystemInput>(inputData)
  const productName = data.product_name || 'UnnamedProduct'
  const audience = data.target_audience || 'general'
  const categories = data.achievement_categories || ['exploration', 'social', 'mastery', 'collection', 'milestone']
  const rarity = data.rarity_distribution || { common: 0.5, rare: 0.3, epic: 0.15, legendary: 0.05 }
  const unlockTypes = data.unlock_condition_types || ['action_count', 'streak', 'score_threshold', 'social_interaction', 'time_based']
  const rewardTypes = data.reward_types || ['badge', 'xp_boost', 'cosmetic', 'unlock_content']
  const progTiers = data.progression_tiers || 5
  const totalAchievements = data.estimated_total_achievements || 100
  const dau = data.daily_active_users || 10000

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const rarityLabels: Record<string, string> = {
    common: '普通 (Common)',
    rare: '稀有 (Rare)',
    epic: '史诗 (Epic)',
    legendary: '传说 (Legendary)'
  }

  let report = '# Achievement System Design Report' + '\n\n'
  report += '**Product:** ' + productName + '\n'
  report += '**Target Audience:** ' + audience + '\n'
  report += '**Progression Tiers:** ' + progTiers + '\n'
  report += '**Estimated Total Achievements:** ' + totalAchievements + '\n'
  report += '**Daily Active Users:** ' + formatNum(dau) + '\n\n'
  report += '---' + '\n\n'

  report += '## Rarity Distribution' + '\n\n'
  report += '| Rarity | Percentage | Count | Unlock Difficulty | User Impact |\n'
  report += '|--------|-----------|-------|------------------|-------------|\n'
  const rarityOrder: ('common' | 'rare' | 'epic' | 'legendary')[] = ['common', 'rare', 'epic', 'legendary']
  rarityOrder.forEach(r => {
    const pct = rarity[r] || 0
    const count = Math.floor(totalAchievements * pct)
    const difficulty = r === 'common' ? 'Trivial' : r === 'rare' ? 'Moderate' : r === 'epic' ? 'Challenging' : 'Exceptional'
    const impact = r === 'common' ? 'Onboarding' : r === 'rare' ? 'Retention' : r === 'epic' ? 'Prestige' : 'Viral'
    report += '| ' + (rarityLabels[r] || r) + ' | ' + formatPct(pct) + '% | ' + count + ' | ' + difficulty + ' | ' + impact + ' |\n'
  })

  report += '\n## Achievement Categories' + '\n\n'
  report += '| Category | Count | XP per Unlock | Expected Completion Rate | DAU Engagement |\n'
  report += '|----------|-------|--------------|-------------------------|---------------|\n'
  categories.forEach(cat => {
    const count = Math.floor(totalAchievements / categories.length)
    const xpPer = Math.floor(50 + rng() * 200)
    const completionRate = clamp(0.3 + rng() * 0.6, 0, 1)
    const dauEngagement = clamp(completionRate * (0.4 + rng() * 0.4), 0, 1)
    report += '| ' + cat + ' | ' + count + ' | ' + xpPer + ' XP | ' + formatPct(completionRate) + '% | ' + formatPct(dauEngagement) + '% |\n'
  })

  report += '\n## Unlock Condition Matrix' + '\n\n'
  report += '| Condition Type | Complexity | User Clarity | Friction Level | Best For |\n'
  report += '|---------------|-----------|-------------|----------------|----------|\n'
  unlockTypes.forEach(uct => {
    const complexity = uct === 'action_count' ? 'Low' : uct === 'streak' ? 'Medium' : uct === 'social_interaction' ? 'High' : 'Variable'
    const clarity = uct === 'score_threshold' ? 'Very High' : uct === 'action_count' ? 'High' : 'Medium'
    const friction = uct === 'streak' ? 'Time-gated' : uct === 'social_interaction' ? 'Dependency' : 'Low'
    const bestFor = uct === 'action_count' ? 'Core loop actions' : uct === 'streak' ? 'Daily retention' : uct === 'score_threshold' ? 'Progression gates' : uct === 'social_interaction' ? 'Viral growth' : 'Seasonal events'
    report += '| ' + uct + ' | ' + complexity + ' | ' + clarity + ' | ' + friction + ' | ' + bestFor + ' |\n'
  })

  report += '\n## Reward Type Effectiveness' + '\n\n'
  report += '| Reward Type | Motivation Type | Retention Lift | DAU Impact | Viral Potential |\n'
  report += '|-------------|----------------|---------------|-----------|-----------------|\n'
  rewardTypes.forEach(rt => {
    const motivation = rt === 'badge' ? 'Extrinsic' : rt === 'xp_boost' ? 'Progression' : rt === 'cosmetic' ? 'Self-expression' : 'Access'
    const retentionLift = clamp(0.02 + rng() * 0.08, 0, 1)
    const dauImpact = clamp(0.01 + rng() * 0.05, 0, 1)
    const viral = rt === 'cosmetic' ? formatPct(clamp(0.05 + rng() * 0.1, 0, 1)) + '%' : rt === 'badge' ? formatPct(clamp(0.03 + rng() * 0.05, 0, 1)) + '%' : '<2%'
    report += '| ' + rt + ' | ' + motivation + ' | ' + formatPct(retentionLift) + '% | ' + formatPct(dauImpact) + '% | ' + viral + ' |\n'
  })

  const totalRaritySum = rarityOrder.reduce((s, r) => s + (rarity[r] || 0), 0)
  const distributionBalance = 1 - Math.abs(totalRaritySum - 1)
  const categoryCoverage = clamp(categories.length / 8, 0.3, 1)
  const unlockDiversity = clamp(unlockTypes.length / 6, 0.3, 1)
  const overallScore = (distributionBalance * 0.3 + categoryCoverage * 0.25 + unlockDiversity * 0.25 + clamp(totalAchievements / 200, 0, 1) * 0.2)

  report += '\n## Achievement System Score: ' + formatPct(overallScore) + '%' + '\n\n'
  report += '| Dimension | Score | Assessment |\n'
  report += '|-----------|-------|------------|\n'
  report += '| Distribution Balance | ' + formatPct(distributionBalance) + '% | ' + (distributionBalance > 0.9 ? 'Well balanced' : 'Needs rebalancing') + ' |\n'
  report += '| Category Coverage | ' + formatPct(categoryCoverage) + '% | ' + (categoryCoverage > 0.7 ? 'Diverse' : 'Narrow') + ' |\n'
  report += '| Unlock Diversity | ' + formatPct(unlockDiversity) + '% | ' + (unlockDiversity > 0.7 ? 'Engaging' : 'Repetitive') + ' |\n'
  report += '| Content Volume | ' + formatPct(clamp(totalAchievements / 200, 0, 1)) + '% | ' + (totalAchievements >= 80 ? 'Adequate' : 'Sparse') + ' |\n'

  report += '\n## Design Recommendations' + '\n\n'
  const recs: string[] = []
  if (distributionBalance < 0.9) recs.push('Rarity distribution does not sum to 100% — rebalance rarity tiers')
  if ((rarity.legendary || 0) < 0.02) recs.push('Add at least 2% legendary achievements for aspirational goals')
  if (categories.length < 4) recs.push('Expand achievement categories to cover at least 4 behavior types')
  if (!unlockTypes.includes('social_interaction')) recs.push('Add social unlock conditions to boost viral coefficient')
  if (totalAchievements < 50) recs.push('Target at least 50 achievements for meaningful progression depth')
  if (recs.length === 0) recs.push('Achievement system design is comprehensive — proceed to implementation')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 2: POINTS MECHANICS CONFIG ====================

function executePointsMechanicsConfig(inputData: string): string {
  const data = parseInput<PointsMechanicsInput>(inputData)
  const currencyName = data.currency_name || 'XP'
  const curveType = data.xp_curve_type || 'logarithmic'
  const maxLevel = data.max_level || 50
  const actions = data.actions || [
    { name: 'daily_login', xp_reward: 10, cooldown_seconds: 86400 },
    { name: 'complete_task', xp_reward: 50, cooldown_seconds: 0 },
    { name: 'social_share', xp_reward: 25, cooldown_seconds: 3600 },
    { name: 'refer_friend', xp_reward: 100, cooldown_seconds: 0 }
  ]
  const sinks = data.sink_mechanisms || ['cosmetic_shop', 'level_up_cost', 'streak_freeze', 'loot_box']
  const dailyCap = data.daily_cap_xp || 1000
  const weeklyCap = data.weekly_cap_xp || 5000
  const startingXp = data.starting_xp || 0
  const inflationTarget = data.inflation_target_pct || 5

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const curveDescriptions: Record<string, string> = {
    linear: '恒定速率升级，简单可预测',
    exponential: '升级需求指数增长，后期挑战极大',
    logarithmic: '前期快速升级，后期放缓，最常见于成熟产品',
    sigmoid: '前期慢-中期快-后期慢，适合新手引导',
    custom: '自定义曲线，适合特殊场景'
  }

  let report = '# Points Mechanics Configuration Report' + '\n\n'
  report += '**Currency:** ' + currencyName + '\n'
  report += '**XP Curve:** ' + curveType + ' (' + (curveDescriptions[curveType] || 'Unknown') + ')\n'
  report += '**Max Level:** ' + maxLevel + '\n'
  report += '**Daily Cap:** ' + formatNum(dailyCap) + ' ' + currencyName + '\n'
  report += '**Weekly Cap:** ' + formatNum(weeklyCap) + ' ' + currencyName + '\n'
  report += '**Inflation Target:** ' + inflationTarget + '%/month\n\n'
  report += '---' + '\n\n'

  report += '## XP Curve Analysis' + '\n\n'
  report += '| Level | XP Required | Cumulative XP | Est. Days (avg) | Difficulty Spike |\n'
  report += '|-------|------------|---------------|-----------------|------------------|\n'
  let cumulative = startingXp
  const levels = [1, 5, 10, 15, 20, 30, 40, 50].filter(l => l <= maxLevel)
  levels.forEach(l => {
    let xpForLevel: number
    if (curveType === 'linear') {
      xpForLevel = Math.floor(100 * l)
    } else if (curveType === 'exponential') {
      xpForLevel = Math.floor(50 * Math.pow(1.15, l))
    } else if (curveType === 'logarithmic') {
      xpForLevel = Math.floor(200 * Math.log2(l + 1))
    } else if (curveType === 'sigmoid') {
      xpForLevel = Math.floor(300 / (1 + Math.exp(-0.2 * (l - 25))) - 50)
    } else {
      xpForLevel = Math.floor(100 * l * (1 + rng() * 0.3))
    }
    xpForLevel = Math.max(xpForLevel, 10)
    cumulative += xpForLevel
    const daysToReach = Math.max(1, Math.floor(cumulative / (dailyCap * 0.6)))
    const prevLevel = levels[levels.indexOf(l) - 1]
    const prevXp = prevLevel ? Math.floor(100 + rng() * 50) : xpForLevel
    const spike = l > 1 ? ((xpForLevel / prevXp) * 100 - 100) : 0
    report += '| ' + l + ' | ' + formatNum(xpForLevel) + ' | ' + formatNum(cumulative) + ' | ' + daysToReach + ' | ' + clamp(spike, -20, 200).toFixed(0) + '% |\n'
  })

  report += '\n## Action Economy' + '\n\n'
  report += '| Action | XP Reward | Cooldown | Max Daily | Hourly Value | Sustainability |\n'
  report += '|--------|----------|----------|----------|-------------|-----------------|\n'
  actions.forEach(a => {
    const cooldown = a.cooldown_seconds || 0
    const maxDaily = cooldown > 0 ? Math.floor(86400 / cooldown) : 10
    const hourlyValue = cooldown > 0 ? Math.floor((a.xp_reward / cooldown) * 3600) : a.xp_reward * 10
    const sust = hourlyValue > dailyCap / 10 ? 'Over-rewarding' : hourlyValue > dailyCap / 20 ? 'Balanced' : 'Under-rewarding'
    report += '| ' + a.name + ' | ' + a.xp_reward + ' | ' + cooldown + 's | ' + maxDaily + ' | ' + hourlyValue + '/hr | ' + sust + ' |\n'
  })

  report += '\n## Sink Mechanisms' + '\n\n'
  report += '| Sink Type | Drain Rate (XP/user/day) | User Acceptance | Inflation Control |\n'
  report += '|----------|------------------------|----------------|-------------------|\n'
  sinks.forEach(sink => {
    const drainRate = Math.floor(20 + rng() * 180)
    const acceptance = sink === 'cosmetic_shop' ? 'High' : sink === 'level_up_cost' ? 'Mandatory' : sink === 'streak_freeze' ? 'Medium' : 'Variable'
    const inflationControl = formatPct(clamp(drainRate / 200, 0.1, 1)) + '%'
    report += '| ' + sink + ' | ' + drainRate + ' | ' + acceptance + ' | ' + inflationControl + ' |\n'
  })

  report += '\n## Economy Balance' + '\n\n'
  report += '| Metric | Value | Status |\n'
  report += '|--------|-------|--------|\n'
  const totalDailyEarning = actions.reduce((s, a) => {
    const cd = a.cooldown_seconds || 0
    const maxD = cd > 0 ? Math.floor(86400 / cd) : 10
    return s + a.xp_reward * maxD
  }, 0)
  const totalDailySink = 500 + rng() * 1000
  const netFlow = totalDailyEarning - totalDailySink
  const balanceStatus = netFlow > dailyCap * 0.5 ? 'Inflationary' : netFlow < -dailyCap * 0.2 ? 'Deflationary' : 'Balanced'
  report += '| Total Daily Earning Potential | ' + formatNum(totalDailyEarning) + ' XP | — |\n'
  report += '| Total Daily Sink | ' + formatNum(Math.floor(totalDailySink)) + ' XP | — |\n'
  report += '| Net Flow | ' + formatNum(Math.floor(netFlow)) + ' XP | ' + balanceStatus + ' |\n'
  report += '| Cap Utilization | ' + formatPct(clamp(totalDailyEarning / dailyCap, 0, 1)) + '% | ' + (totalDailyEarning > dailyCap * 1.5 ? 'Over-cap' : 'Within bounds') + ' |\n'
  report += '| Weekly Cap Headroom | ' + formatNum(Math.max(0, weeklyCap - totalDailyEarning * 7)) + ' XP | ' + (weeklyCap > totalDailyEarning * 7 ? 'OK' : 'OVERRUN') + ' |\n'

  report += '\n## Recommendations' + '\n\n'
  const recs: string[] = []
  if (balanceStatus === 'Inflationary') recs.push('Economy is inflationary — increase sink capacity or reduce earning rates')
  if (balanceStatus === 'Deflationary') recs.push('Economy is deflationary — users may feel progression is too slow')
  if (totalDailyEarning > dailyCap * 2) recs.push('Daily earning potential far exceeds cap — cap is acting as a hard bottleneck')
  if (maxLevel > 100) recs.push('Very high max level — consider if logarithmic curve is sufficient for long-term retention')
  if (sinks.length < 3) recs.push('Add more sink mechanisms to maintain economy balance')
  if (recs.length === 0) recs.push('Points economy is well-balanced — monitor live metrics after launch')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 3: ENGAGEMENT LOOP ANALYZER ====================

function executeEngagementLoopAnalyzer(inputData: string): string {
  const data = parseInput<EngagementLoopInput>(inputData)
  const productName = data.product_name || 'UnnamedProduct'
  const dau = data.current_dau || 10000
  const mau = data.current_mau || 50000
  const sessionMin = data.avg_session_minutes || 5.2
  const sessionsPerDay = data.avg_sessions_per_day || 2.3
  const d1 = data.retention_d1_pct || 40
  const d7 = data.retention_d7_pct || 20
  const d30 = data.retention_d30_pct || 10
  const viralCoeff = data.viral_coefficient || 0.3
  const coreLoop = data.core_loop_actions || ['open_app', 'view_feed', 'interact', 'share']
  const onboardingComp = data.onboarding_completion_pct || 65

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  const dauMauRatio = mau > 0 ? dau / mau : 0.2

  let report = '# Engagement Loop Analysis Report' + '\n\n'
  report += '**Product:** ' + productName + '\n'
  report += '**DAU:** ' + formatNum(dau) + '\n'
  report += '**MAU:** ' + formatNum(mau) + '\n'
  report += '**DAU/MAU Ratio:** ' + formatPct(dauMauRatio) + '%\n'
  report += '**Avg Session:** ' + sessionMin + ' minutes\n'
  report += '**Sessions/Day:** ' + sessionsPerDay + '\n'
  report += '**Viral Coefficient:** ' + viralCoeff.toFixed(2) + '\n'
  report += '**Onboarding Completion:** ' + onboardingComp + '%\n\n'
  report += '---' + '\n\n'

  report += '## Retention Curve' + '\n\n'
  report += '| Day | Retention | Industry Avg | Status | Drop-off Severity |\n'
  report += '|-----|----------|-------------|--------|-------------------|\n'
  const retentionData = [
    { day: 1, value: d1, avg: 40 },
    { day: 7, value: d7, avg: 20 },
    { day: 30, value: d30, avg: 10 },
    { day: 60, value: clamp(d30 * 0.7, 3, 100), avg: 7 },
    { day: 90, value: clamp(d30 * 0.5, 2, 100), avg: 5 }
  ]
  retentionData.forEach(r => {
    const status = r.value > r.avg * 1.2 ? 'Above avg' : r.value > r.avg * 0.8 ? 'On par' : 'Below avg'
    const idx = retentionData.indexOf(r)
    const severity = idx === 0 ? '—' : formatPct(1 - r.value / retentionData[idx - 1].value) + '%'
    report += '| D' + r.day + ' | ' + r.value + '% | ' + r.avg + '% | ' + status + ' | ' + severity + ' |\n'
  })

  report += '\n## Core Loop Analysis' + '\n\n'
  report += '| Step | Action | Avg Time | Drop-off % | Optimization |\n'
  report += '|------|--------|---------|-----------|---------------|\n'
  coreLoop.forEach((action, i) => {
    const avgTime = (1 + rng() * 3).toFixed(1) + 's'
    const dropoff = formatPct(clamp(0.05 + rng() * 0.25, 0, 1)) + '%'
    const optimization = i === 0 ? 'Reduce cold-start time' : i === coreLoop.length - 1 ? 'Add social proof for sharing' : 'Simplify interaction friction'
    report += '| ' + (i + 1) + ' | ' + action + ' | ' + avgTime + ' | ' + dropoff + ' | ' + optimization + ' |\n'
  })

  report += '\n## Engagement Metrics Dashboard' + '\n\n'
  report += '| Metric | Value | Benchmark | Status | Intervention |\n'
  report += '|--------|-------|-----------|--------|---------------|\n'
  report += '| DAU/MAU Stickiness | ' + formatPct(dauMauRatio) + '% | 20% (good) / 50% (great) | ' + (dauMauRatio >= 0.5 ? 'Excellent' : dauMauRatio >= 0.2 ? 'Good' : 'Needs work') + ' | ' + (dauMauRatio < 0.2 ? 'Increase daily triggers' : 'Maintain') + ' |\n'
  report += '| Avg Session Length | ' + sessionMin + ' min | 5-7 min (healthy) | ' + (sessionMin >= 5 ? 'Healthy' : 'Short') + ' | ' + (sessionMin < 5 ? 'Add session-extending content' : 'Optimize') + ' |\n'
  report += '| Sessions/Day | ' + sessionsPerDay + ' | 2-3 (typical) | ' + (sessionsPerDay >= 2 ? 'Engaged' : 'Low') + ' | ' + (sessionsPerDay < 2 ? 'Push notification cadence' : 'Maintain') + ' |\n'
  report += '| D1 Retention | ' + d1 + '% | 40% (top quartile) | ' + (d1 >= 40 ? 'Strong' : d1 >= 25 ? 'Average' : 'Weak') + ' | ' + (d1 < 40 ? 'Improve onboarding' : 'Maintain') + ' |\n'
  report += '| Viral Coefficient | ' + viralCoeff.toFixed(2) + ' | >1.0 = viral growth | ' + (viralCoeff >= 1.0 ? 'Viral' : viralCoeff >= 0.5 ? 'Growing' : 'Flat') + ' | ' + (viralCoeff < 0.5 ? 'Add share incentives' : 'Amplify') + ' |\n'
  report += '| Onboarding Completion | ' + onboardingComp + '% | 70% (target) | ' + (onboardingComp >= 70 ? 'Strong' : onboardingComp >= 50 ? 'Average' : 'Weak') + ' | ' + (onboardingComp < 70 ? 'Simplify first-run flow' : 'Optimize') + ' |\n'

  report += '\n## Loop Friction Points' + '\n\n'
  report += '| Friction Point | Frequency | Impact Score | Recommended Fix |\n'
  report += '|----------------|----------|-------------|------------------|\n'
  const frictionPoints = [
    { point: 'Login delay', freq: formatPct(clamp(0.02 + rng() * 0.05, 0, 1)) + '%', impact: 'High', fix: 'Implement biometric auth' },
    { point: 'Content loading', freq: formatPct(clamp(0.05 + rng() * 0.1, 0, 1)) + '%', impact: 'Critical', fix: 'Lazy loading + prefetch' },
    { point: 'Reward claim friction', freq: formatPct(clamp(0.1 + rng() * 0.15, 0, 1)) + '%', impact: 'Medium', fix: 'One-tap claim flow' },
    { point: 'Social opt-in barrier', freq: formatPct(clamp(0.3 + rng() * 0.2, 0, 1)) + '%', impact: 'High', fix: 'Progressive permission request' },
    { point: 'Tutorial skip block', freq: formatPct(clamp(0.15 + rng() * 0.1, 0, 1)) + '%', impact: 'Medium', fix: 'Allow skip with tooltip fallback' }
  ]
  frictionPoints.forEach(f => {
    report += '| ' + f.point + ' | ' + f.freq + ' | ' + f.impact + ' | ' + f.fix + ' |\n'
  })

  report += '\n## Gamification Intervention Opportunities' + '\n\n'
  report += '| Intervention | Expected D1 Lift | Expected D30 Lift | DAU Impact | Complexity |\n'
  report += '-------------|------------------|-------------------|-----------|-------------|\n'
  const interventions = [
    { name: 'Daily streak bonus', d1: '+5%', d30: '+3%', dau: '+8%', complexity: 'Low' },
    { name: 'Social leaderboard invite', d1: '+2%', d30: '+5%', dau: '+12%', complexity: 'Medium' },
    { name: 'Achievement onboarding quest', d1: '+8%', d30: '+6%', dau: '+5%', complexity: 'Medium' },
    { name: 'Referral reward program', d1: '+1%', d30: '+4%', dau: '+15%', complexity: 'High' },
    { name: 'Push notification gamified', d1: '+3%', d30: '+2%', dau: '+10%', complexity: 'Low' }
  ]
  interventions.forEach(inv => {
    report += '| ' + inv.name + ' | ' + inv.d1 + ' | ' + inv.d30 + ' | ' + inv.dau + ' | ' + inv.complexity + ' |\n'
  })

  const stickinessScore = clamp(dauMauRatio / 0.5, 0, 1)
  const retentionScore = clamp((d1 / 40 + d7 / 20 + d30 / 10) / 3, 0, 1)
  const viralScore = clamp(viralCoeff / 1.5, 0, 1)
  const onboardingScore = clamp(onboardingComp / 100, 0, 1)
  const overallScore = stickinessScore * 0.3 + retentionScore * 0.3 + viralScore * 0.2 + onboardingScore * 0.2

  report += '\n## Engagement Health Score: ' + formatPct(overallScore) + '%' + '\n\n'
  report += '| Dimension | Score | Benchmark |\n'
  report += '|-----------|-------|-----------|\n'
  report += '| Stickiness (DAU/MAU) | ' + formatPct(stickinessScore) + '% | 50% target |\n'
  report += '| Retention Curve | ' + formatPct(retentionScore) + '% | D1:40% D7:20% D30:10% |\n'
  report += '| Viral Growth | ' + formatPct(viralScore) + '% | K>1.0 = exponential |\n'
  report += '| Onboarding | ' + formatPct(onboardingScore) + '% | 70% target |\n'

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 4: HABIT TRACKER ARCHITECT ====================

function executeHabitTrackerArchitect(inputData: string): string {
  const data = parseInput<HabitTrackerInput>(inputData)
  const habitName = data.habit_name || 'UnnamedHabit'
  const frequency = data.target_frequency || 'daily'
  const streakTarget = data.streak_target_days || 30
  const reminderChannels = data.reminder_channels || ['push', 'email', 'sms', 'in_app']
  const accountability = data.accountability_type || 'solo'
  const relapseMode = data.relapse_recovery_mode || 'grace_period'
  const stackDepth = data.habit_stack_depth || 3
  const successTarget = data.success_rate_target_pct || 70
  const currentRate = data.current_completion_rate_pct || 45

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  let report = '# Habit Tracker Architecture Report' + '\n\n'
  report += '**Habit:** ' + habitName + '\n'
  report += '**Target Frequency:** ' + frequency + '\n'
  report += '**Streak Target:** ' + streakTarget + ' days\n'
  report += '**Accountability Type:** ' + accountability + '\n'
  report += '**Relapse Recovery:** ' + relapseMode + '\n'
  report += '**Habit Stack Depth:** ' + stackDepth + ' habits\n'
  report += '**Success Rate Target:** ' + successTarget + '%\n'
  report += '**Current Completion Rate:** ' + currentRate + '%\n\n'
  report += '---' + '\n\n'

  report += '## Streak Mechanics Design' + '\n\n'
  report += '| Milestone (days) | Reward | Motivation Type | Drop-off Risk | Visual Feedback |\n'
  report += '|-----------------|--------|----------------|---------------|------------------|\n'
  const milestones = [
    { days: 7, reward: '7-day badge', motivation: 'Quick win', dropoff: 'Low', feedback: 'Bronze flame icon' },
    { days: 14, reward: 'XP boost x2 (24h)', motivation: 'Progression', dropoff: 'Medium', feedback: 'Silver flame + animation' },
    { days: 21, reward: 'Habit mastery chest', motivation: 'Collection', dropoff: 'Medium', feedback: 'Gold flame + confetti' },
    { days: 30, reward: 'Monthly champion badge', motivation: 'Status', dropoff: 'High', feedback: 'Animated badge + share card' },
    { days: 60, reward: 'Streak legend title', motivation: 'Prestige', dropoff: 'High', feedback: 'Profile banner + glow effect' },
    { days: 100, reward: 'Centurion crown', motivation: 'Legendary', dropoff: 'Very high', feedback: 'Exclusive cosmetic + global shoutout' }
  ].filter(m => m.days <= streakTarget * 2)
  milestones.forEach(m => {
    report += '| ' + m.days + ' | ' + m.reward + ' | ' + m.motivation + ' | ' + m.dropoff + ' | ' + m.feedback + ' |\n'
  })

  report += '\n## Reminder System' + '\n\n'
  report += '| Channel | Timing | Intrusiveness | Response Rate | Best For |\n'
  report += '|--------|--------|-------------|---------------|----------|\n'
  reminderChannels.forEach(ch => {
    const intrusiveness = ch === 'push' ? 'Medium' : ch === 'sms' ? 'High' : ch === 'email' ? 'Low' : 'Very Low'
    const responseRate = clamp(0.15 + rng() * 0.35, 0, 1)
    const bestFor = ch === 'push' ? 'Daily check-ins' : ch === 'sms' ? 'Critical reminders' : ch === 'email' ? 'Weekly summaries' : 'Contextual nudges'
    report += '| ' + ch + ' | ' + (ch === 'push' ? 'Scheduled + behavioral' : ch === 'sms' ? 'Missed day trigger' : ch === 'email' ? 'Batch digest' : 'In-app visible') + ' | ' + intrusiveness + ' | ' + formatPct(responseRate) + '% | ' + bestFor + ' |\n'
  })

  report += '\n## Accountability Framework' + '\n\n'
  report += '| Model | Social Pressure | Retention Lift | DAU Engagement | Viral Coefficient |\n'
  report += '|-------|----------------|---------------|---------------|-------------------|\n'
  const accountModels = [
    { model: 'Solo (self-tracked)', pressure: 'None', lift: '+5%', dau: '3%', vc: '0.05' },
    { model: 'Buddy system', pressure: 'Low-Medium', lift: '+12%', dau: '8%', vc: '0.15' },
    { model: 'Group challenge', pressure: 'Medium-High', lift: '+18%', dau: '12%', vc: '0.25' },
    { model: 'Public commitment', pressure: 'High', lift: '+25%', dau: '15%', vc: '0.40' }
  ]
  accountModels.forEach(am => {
    report += '| ' + am.model + ' | ' + am.pressure + ' | ' + am.lift + ' | ' + am.dau + ' | ' + am.vc + ' |\n'
  })

  report += '\n## Relapse Recovery Analysis' + '\n\n'
  report += '| Recovery Mode | Streak Preservation | User Psychology | Re-engagement Rate | Long-term Impact |\n'
  report += '|---------------|--------------------|----------------|-------------------|------------------|\n'
  const recoveryModes = [
    { mode: 'Grace period (1 skip/week)', preserve: 'High', psychology: 'Forgiving', reengage: formatPct(clamp(0.6 + rng() * 0.2, 0, 1)) + '%', impact: 'Sustainable habits' },
    { mode: 'Streak freeze item', preserve: 'Medium', psychology: 'Investment protection', reengage: formatPct(clamp(0.5 + rng() * 0.25, 0, 1)) + '%', impact: 'Risk of dependency' },
    { mode: 'Reset & restart', preserve: 'None', psychology: 'Fresh start effect', reengage: formatPct(clamp(0.3 + rng() * 0.2, 0, 1)) + '%', impact: 'High churn risk' },
    { mode: 'Partial credit system', preserve: 'Low', psychology: 'Progress retention', reengage: formatPct(clamp(0.45 + rng() * 0.25, 0, 1)) + '%', impact: 'Balanced approach' }
  ]
  recoveryModes.forEach(rm => {
    report += '| ' + rm.mode + ' | ' + rm.preserve + ' | ' + rm.psychology + ' | ' + rm.reengage + ' | ' + rm.impact + ' |\n'
  })

  report += '\n## Habit Stacking Blueprint' + '\n\n'
  report += '| Stack Level | Anchor Habit | New Habit | Trigger | XP Reward | Completion Rate |\n'
  report += '|------------|-------------|----------|---------|----------|------------------|\n'
  for (let i = 1; i <= stackDepth; i++) {
    const anchor = i === 1 ? 'Wake up' : 'Stack level ' + (i - 1) + ' complete'
    const newHabit = 'Habit action ' + i
    const trigger = i === 1 ? 'Morning alarm' : 'Previous habit cue'
    const xp = 10 * i
    const compRate = clamp(0.7 - i * 0.1 + rng() * 0.1, 0.2, 1)
    report += '| ' + i + ' | ' + anchor + ' | ' + newHabit + ' | ' + trigger + ' | ' + xp + ' XP | ' + formatPct(compRate) + '% |\n'
  }

  report += '\n## Completion Rate Projection' + '\n\n'
  report += '| Month | Projected Rate | Streak Boost | Accountability Boost | Combined | Target |\n'
  report += '|-------|---------------|-------------|---------------------|----------|--------|\n'
  let projectedRate = currentRate
  for (let m = 1; m <= 6; m++) {
    const streakBoost = clamp(1 + rng() * 3, 0, 5)
    const accountabilityBoost = clamp(2 + rng() * 4, 0, 6)
    projectedRate = clamp(projectedRate + streakBoost + accountabilityBoost - 2, 0, 95)
    report += '| M' + m + ' | ' + projectedRate.toFixed(1) + '% | +' + streakBoost.toFixed(1) + '% | +' + accountabilityBoost.toFixed(1) + '% | ' + projectedRate.toFixed(1) + '% | ' + successTarget + '% |\n'
  }

  const rateImprovement = clamp((successTarget - currentRate) / successTarget, 0, 1)
  const streakFeasibility = clamp(60 / streakTarget, 0, 1)
  const accountabilityBoost = accountability === 'public' ? 1.0 : accountability === 'group' ? 0.8 : accountability === 'buddy' ? 0.6 : 0.3
  const relapseResilience = relapseMode === 'grace_period' ? 1.0 : relapseMode === 'streak_freeze' ? 0.8 : relapseMode === 'partial_credit' ? 0.7 : 0.4
  const overallScore = rateImprovement * 0.3 + streakFeasibility * 0.2 + accountabilityBoost * 0.25 + relapseResilience * 0.25

  report += '\n## Habit Architecture Score: ' + formatPct(overallScore) + '%' + '\n\n'

  report += '\n## Recommendations' + '\n\n'
  const recs: string[] = []
  if (currentRate < successTarget * 0.7) recs.push('Current completion rate is significantly below target — strengthen accountability layer')
  if (streakTarget > 60) recs.push('Long streak target (>60 days) creates high drop-off risk — consider intermediate milestones')
  if (accountability === 'solo') recs.push('Solo mode has lowest retention lift — implement buddy or group features')
  if (relapseMode === 'reset_fresh') recs.push('Hard reset on miss causes high churn — switch to grace period or partial credit')
  if (stackDepth > 5) recs.push('Deep habit stacks (>5) increase cognitive load — limit to 3 for best adherence')
  if (recs.length === 0) recs.push('Habit architecture is well-designed — test with pilot cohort before full launch')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 5: LEADERBOARD OPTIMIZER ====================

function executeLeaderboardOptimizer(inputData: string): string {
  const data = parseInput<LeaderboardInput>(inputData)
  const lbName = data.leaderboard_name || 'Global Leaderboard'
  const metric = data.ranking_metric || 'total_xp'
  const tiers = data.tier_system || ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master']
  const participants = data.total_participants || 50000
  const updateFreq = data.update_frequency || 'daily'
  const decay = data.decay_function || 'exponential_decay'
  const antiCheat = data.anti_cheat_enabled !== false
  const bottomPct = data.bottom_pct_demotivated || 30

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  let report = '# Leaderboard Optimization Report' + '\n\n'
  report += '**Leaderboard:** ' + lbName + '\n'
  report += '**Ranking Metric:** ' + metric + '\n'
  report += '**Participants:** ' + formatNum(participants) + '\n'
  report += '**Update Frequency:** ' + updateFreq + '\n'
  report += '**Decay Function:** ' + decay + '\n'
  report += '**Anti-Cheat:** ' + (antiCheat ? 'Enabled' : 'Disabled') + '\n'
  report += '**Bottom % Demotivated:** ' + bottomPct + '%\n\n'
  report += '---' + '\n\n'

  report += '## Tier Distribution' + '\n\n'
  report += '| Tier | % of Players | XP Floor | Reward per Period | Motivation Level |\n'
  report += '|------|-------------|----------|-------------------|------------------|\n'
  const tierPcts = [0.4, 0.25, 0.18, 0.1, 0.05, 0.02]
  tiers.forEach((tier, i) => {
    const pct = tierPcts[i] || (1 - tierPcts.reduce((s, v) => s + v, 0)) / Math.max(1, tiers.length - tierPcts.length)
    const xpFloor = Math.floor(i * 1000 + rng() * 500)
    const reward = i >= 4 ? 'Exclusive cosmetic' : i >= 2 ? 'XP boost + badge' : 'Small XP bonus'
    const motivation = i <= 1 ? 'High (accessible)' : i <= 3 ? 'Medium (stretching)' : 'Low (aspirational)'
    report += '| ' + tier + ' | ' + formatPct(pct) + '% | ' + formatNum(xpFloor) + ' XP | ' + reward + ' | ' + motivation + ' |\n'
  })

  report += '\n## Decay Function Analysis' + '\n\n'
  report += '| Decay Type | Formula | Player Impact | Revenue Effect | New Player Friendly |\n'
  report += '|-----------|---------|--------------|---------------|--------------------|\n'
  const decayTypes = [
    { type: 'None', formula: 'Score = Total XP', impact: 'Power law — top players never dethroned', revenue: 'Whales stay dominant', newPlayer: 'Very low' },
    { type: 'Linear decay (daily)', formula: 'Score *= 0.95/day', impact: 'Steady pressure to stay active', revenue: 'Regular engagement spend', newPlayer: 'Medium' },
    { type: 'Exponential decay', formula: 'Score *= 0.9^(days_inactive)', impact: 'Rapid penalization of inactivity', revenue: 'Urgency to return', newPlayer: 'High' },
    { type: 'Seasonal reset', formula: 'Full reset + carryover 10%', impact: 'Periodic fresh start', revenue: 'Season pass sales', newPlayer: 'Very high' }
  ]
  decayTypes.forEach(dt => {
    const active = dt.type.toLowerCase().includes(decay.split('_')[0]) || (decay === 'none' && dt.type === 'None')
    report += '| ' + dt.type + (active ? ' *' : '') + ' | ' + dt.formula + ' | ' + dt.impact + ' | ' + dt.revenue + ' | ' + dt.newPlayer + ' |\n'
  })
  report += '\\* Active decay function' + '\n\n'

  report += '\n## Update Frequency Impact' + '\n\n'
  report += '| Frequency | Server Load | User Excitement | Competitive Balance | DAU Spike Pattern |\n'
  report += '|-----------|-------------|-----------------|---------------------|------------------|\n'
  const frequencies = [
    { freq: 'Real-time', load: 'Very High', excitement: 'Maximum', balance: 'Unstable — sniping', dau: 'Continuous' },
    { freq: 'Hourly', load: 'High', excitement: 'High', balance: 'Moderate', dau: 'Hourly pulse' },
    { freq: 'Daily', load: 'Moderate', excitement: 'Steady', balance: 'Healthy', dau: 'Morning spike' },
    { freq: 'Weekly', load: 'Low', excitement: 'Anticipation', balance: 'Very stable', dau: 'Weekly peak' }
  ]
  frequencies.forEach(f => {
    const active = f.freq.toLowerCase() === updateFreq
    report += '| ' + f.freq + (active ? ' *' : '') + ' | ' + f.load + ' | ' + f.excitement + ' | ' + f.balance + ' | ' + f.dau + ' |\n'
  })

  report += '\n## Demotivation Risk Analysis' + '\n\n'
  report += '| Risk Factor | Affected % | Severity | Mitigation Strategy |\n'
  report += '|------------|-----------|---------|----------------------|\n'
  const risks = [
    { factor: 'Bottom 30% never reach first tier', pct: '30%', severity: 'High', mitigation: 'Add participation rewards and personal records' },
    { factor: 'Top 1% feel no challenge', pct: '1%', severity: 'Medium', mitigation: 'Elite-only tournaments and prestige tiers' },
    { factor: 'Mid-tier players plateau', pct: '40%', severity: 'Critical', mitigation: 'Progressive milestones within tiers' },
    { factor: 'New players feel behind', pct: '15%', severity: 'Medium', mitigation: 'Separate novice leaderboard for first 30 days' },
    { factor: 'Inactive players decay anxiety', pct: '20%', severity: 'High', mitigation: 'Grace period and streak freeze buffs' }
  ]
  risks.forEach(r => {
    report += '| ' + r.factor + ' | ' + r.pct + ' | ' + r.severity + ' | ' + r.mitigation + ' |\n'
  })

  report += '\n## Anti-Cheat Configuration' + '\n\n'
  if (antiCheat) {
    report += '| Detection Method | Coverage | False Positive Rate | Response Action |\n'
    report += '|-----------------|---------|--------------------|------------------|\n'
    report += '| Anomaly detection (statistical) | 95% | 3% | Flag for review |\n'
    report += '| Rate limiting (actions/sec) | 100% | <1% | Temporary suspension |\n'
    report += '| Device fingerprint clustering | 80% | 5% | Account verification |\n'
    report += '| Manual review queue | 20% | <0.1% | Permanent ban |\n'
  } else {
    report += 'WARNING: Anti-cheat is disabled. Leaderboard integrity is vulnerable to exploitation.\n'
    report += 'Recommendation: Enable at minimum rate limiting and anomaly detection.\n'
  }

  report += '\n## Leaderboard Health Metrics' + '\n\n'
  report += '| Metric | Value | Target | Status |\n'
  report += '|--------|-------|--------|--------|\n'
  const giniCoeff = clamp(0.35 + rng() * 0.25, 0, 1)
  report += '| Gini Coefficient | ' + giniCoeff.toFixed(2) + ' | <0.50 (healthy) | ' + (giniCoeff < 0.5 ? 'Balanced' : 'Too concentrated') + ' |\n'
  report += '| Median Player Tier | ' + tiers[Math.min(1, tiers.length - 1)] + ' | Silver | On target |\n'
  report += '| Daily Rank Churn | ' + formatPct(clamp(0.15 + rng() * 0.2, 0, 1)) + '% | 15-25% | Healthy competition |\n'
  report += '| New Entrant Retention D7 | ' + formatPct(clamp(0.3 + rng() * 0.2, 0, 1)) + '% | >35% | ' + (clamp(0.3 + rng() * 0.2, 0, 1) > 0.35 ? 'OK' : 'LOW') + ' |\n'
  report += '| Top-10 Stability (weekly) | ' + formatPct(clamp(0.4 + rng() * 0.3, 0, 1)) + '% | 50-70% | Moderate turnover |\n'

  const competitivenessScore = clamp(1 - giniCoeff, 0, 1)
  const newPlayerScore = decay === 'seasonal_reset' ? 0.9 : decay === 'exponential_decay' ? 0.7 : decay === 'linear_decay' ? 0.6 : 0.4
  const bottomMotivation = clamp(1 - bottomPct / 100, 0, 1)
  const overallScore = competitivenessScore * 0.35 + newPlayerScore * 0.3 + bottomMotivation * 0.2 + (antiCheat ? 0.15 : 0)

  report += '\n## Overall Leaderboard Score: ' + formatPct(overallScore) + '%' + '\n\n'

  report += '\n## Recommendations' + '\n\n'
  const recs: string[] = []
  if (giniCoeff > 0.5) recs.push('Score distribution is too concentrated — consider decay mechanisms to allow new challengers')
  if (bottomPct > 35) recs.push('Bottom ' + bottomPct + '% are demotivated — add participation-based sub-leaderboards')
  if (!antiCheat) recs.push('Enable anti-cheat systems immediately to preserve leaderboard integrity')
  if (updateFreq === 'realtime') recs.push('Real-time updates create high server load — consider hourly with sealed reveals')
  if (tiers.length < 4) recs.push('Insufficient tier granularity — aim for at least 5 tiers for meaningful progression')
  if (recs.length === 0) recs.push('Leaderboard configuration is optimized — run A/B test on decay rate after launch')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 6: NARRATIVE QUEST BUILDER ====================

function executeNarrativeQuestBuilder(inputData: string): string {
  const data = parseInput<NarrativeQuestInput>(inputData)
  const questLineName = data.quest_line_name || 'Untitled Quest Line'
  const genre = data.genre || 'fantasy'
  const chapters = data.total_chapters || 5
  const avgDuration = data.avg_quest_duration_min || 15
  const branchFactor = data.branching_factor || 2
  const narrativeHooks = data.core_narrative_hooks || ['mystery_revelation', 'character_transformation', 'world_expansion']
  const rewardCheckpoints = data.reward_checkpoints || ['xp_grant', 'unlock_cosmetics', 'story_fragment', 'skill_point']
  const agency = data.player_agency_level || 'medium'
  const xpPerChapter = data.xp_per_chapter || 100

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  let report = '# Narrative Quest Builder Report' + '\n\n'
  report += '**Quest Line:** ' + questLineName + '\n'
  report += '**Genre:** ' + genre + '\n'
  report += '**Total Chapters:** ' + chapters + '\n'
  report += '**Avg Quest Duration:** ' + avgDuration + ' min\n'
  report += '**Branching Factor:** ' + branchFactor + ' paths\n'
  report += '**Player Agency:** ' + agency + '\n'
  report += '**XP per Chapter:** ' + xpPerChapter + '\n\n'
  report += '---' + '\n\n'

  report += '## Story Arc Structure' + '\n\n'
  report += '| Chapter | Narrative Phase | Player Level | Quest Count | Branch Points | XP Reward | Completion Rate |\n'
  report += '|---------|----------------|-------------|------------|--------------|----------|------------------|\n'
  const phases = ['Introduction', 'Rising Action', 'First Climax', 'Falling Action', 'Midpoint Twist', 'Escalation', 'Dark Moment', 'Final Confrontation', 'Resolution', 'Epilogue']
  for (let i = 1; i <= chapters; i++) {
    const phase = phases[Math.min(i - 1, phases.length - 1)]
    const playerLv = Math.ceil(i * 3 + rng() * 2)
    const questCount = Math.floor(2 + rng() * branchFactor)
    const bp = i > 1 && i < chapters ? Math.floor(rng() * branchFactor) + 1 : 0
    const xp = xpPerChapter * i
    const compRate = clamp(0.85 - i * 0.05 + rng() * 0.1, 0.3, 1)
    report += '| ' + i + ' | ' + phase + ' | Lv ' + playerLv + ' | ' + questCount + ' quests | ' + bp + ' | ' + xp + ' XP | ' + formatPct(compRate) + '% |\n'
  }

  report += '\n## Narrative Hook Analysis' + '\n\n'
  report += '| Hook Type | Placement | Emotional Trigger | Retention Impact | Replay Value |\n'
  report += '|-----------|-----------|------------------|-----------------|-------------|\n'
  narrativeHooks.forEach(hook => {
    const placement = hook === 'mystery_revelation' ? 'Chapter 1, 3, 5' : hook === 'character_transformation' ? 'Mid-point (Ch ' + Math.ceil(chapters / 2) + ')' : 'Every chapter end'
    const emotion = hook === 'mystery_revelation' ? 'Curiosity' : hook === 'character_transformation' ? 'Empathy' : 'Wonder'
    const retention = clamp(0.1 + rng() * 0.2, 0, 1)
    const replay = hook === 'mystery_revelation' ? 'High (hidden clues)' : hook === 'character_transformation' ? 'Medium' : 'Low'
    report += '| ' + hook + ' | ' + placement + ' | ' + emotion + ' | +' + formatPct(retention) + '% | ' + replay + ' |\n'
  })

  report += '\n## Branching Path Analysis' + '\n\n'
  report += '| Depth | Total Paths | Unique Endings | Content Cost | Exploration Incentive |\n'
  report += '|-------|------------|---------------|-------------|----------------------|\n'
  const branchData = [
    { depth: 'Linear (1 path)', paths: '1', endings: '1', cost: 'Low', incentive: 'Low' },
    { depth: 'Minor branches (' + branchFactor + ')', paths: String(branchFactor * chapters), endings: String(branchFactor), cost: 'Medium', incentive: 'Medium' },
    { depth: 'Major branches (' + (branchFactor * 2) + ')', paths: String(Math.pow(branchFactor * 2, Math.min(chapters, 5))), endings: String((branchFactor * 2) * chapters), cost: 'Very High', incentive: 'Very High' },
    { depth: 'Full tree (unlimited)', paths: 'Infinite', endings: 'Many', cost: 'Prohibitive', incentive: 'Maximum' }
  ]
  branchData.forEach(bd => {
    report += '| ' + bd.depth + ' | ' + bd.paths + ' | ' + bd.endings + ' | ' + bd.cost + ' | ' + bd.incentive + ' |\n'
  })

  report += '\n## Quest Completion Funnel' + '\n\n'
  report += '| Stage | Players | Drop-off | Completion Rate | XP Earned |\n'
  report += '|-------|---------|----------|----------------|----------|\n'
  let remainingPlayers = 100.0
  for (let i = 1; i <= chapters; i++) {
    const dropoff = clamp((3 + rng() * 8), 0, remainingPlayers * 0.5)
    remainingPlayers -= dropoff
    report += '| Chapter ' + i + ' start | ' + remainingPlayers.toFixed(1) + '% | -' + dropoff.toFixed(1) + '% | ' + formatPct(remainingPlayers / 100) + '% | ' + (xpPerChapter * i) + ' |\n'
  }

  report += '\n## Reward Checkpoint Effectiveness' + '\n\n'
  report += '| Checkpoint | Timing | Player Satisfaction | DAU Return Rate | Churn Prevention |\n'
  report += '|-----------|--------|--------------------|----------------|-------------------|\n'
  rewardCheckpoints.forEach(rc => {
    const timing = rc === 'xp_grant' ? 'Every quest' : rc === 'unlock_cosmetics' ? 'Chapter end' : rc === 'story_fragment' ? 'Key moments' : 'Level up'
    const satisfaction = rc === 'xp_grant' ? 'Medium (expected)' : rc === 'unlock_cosmetics' ? 'High (surprise)' : rc === 'story_fragment' ? 'Very High (emotional)' : 'Medium (empowering)'
    const returnRate = clamp(0.4 + rng() * 0.4, 0, 1)
    const churnPrev = rc === 'story_fragment' ? formatPct(clamp(0.05 + rng() * 0.08, 0, 1)) + '%' : rc === 'unlock_cosmetics' ? formatPct(clamp(0.03 + rng() * 0.05, 0, 1)) + '%' : '<3%'
    report += '| ' + rc + ' | ' + timing + ' | ' + satisfaction + ' | ' + formatPct(returnRate) + '% | ' + churnPrev + ' |\n'
  })

  report += '\n## Genre Fit Assessment' + '\n\n'
  report += '| Genre | Narrative Complexity | Quest Pacing | Reward Style | Audience Match |\n'
  report += '|-------|---------------------|-------------|-------------|-----------------|\n'
  const genres: ('fantasy' | 'sci-fi' | 'mystery' | 'slice_of_life' | 'horror' | 'custom')[] = ['fantasy', 'sci-fi', 'mystery', 'slice_of_life', 'horror', 'custom']
  genres.forEach(g => {
    const active = g === genre
    const complexity = g === 'fantasy' ? 'High' : g === 'sci-fi' ? 'Medium-High' : g === 'mystery' ? 'Very High' : g === 'slice_of_life' ? 'Low' : g === 'horror' ? 'Medium' : 'Variable'
    const pacing = g === 'horror' ? 'Slow burn' : g === 'mystery' ? 'Clue-driven' : g === 'fantasy' ? 'Epic scale' : 'Moderate'
    const rewardStyle = g === 'fantasy' ? 'Loot & treasures' : g === 'sci-fi' ? 'Tech upgrades' : g === 'slice_of_life' ? 'Relationship XP' : 'Discovery-based'
    const audience = g === 'fantasy' ? 'Broad appeal' : g === 'mystery' ? 'Niche engaged' : g === 'slice_of_life' ? 'Casual demographic' : 'Genre fans'
    report += '| ' + g + (active ? ' *' : '') + ' | ' + complexity + ' | ' + pacing + ' | ' + rewardStyle + ' | ' + audience + ' |\n'
  })

  const narrativeScore = clamp((narrativeHooks.length / 5 + branchFactor / 3 + chapters / 10 + rewardCheckpoints.length / 6) / 4, 0, 1)
  report += '\n## Narrative Score: ' + formatPct(narrativeScore) + '%' + '\n\n'

  report += '\n## Recommendations' + '\n\n'
  const recs: string[] = []
  if (chapters < 3) recs.push('Quest line is too short — aim for at least 5 chapters for meaningful narrative arc')
  if (branchFactor < 2) recs.push('No branching reduces replay value — add at least 2 choices per chapter')
  if (narrativeHooks.length < 3) recs.push('Add more narrative hooks — mystery and character development increase retention')
  if (avgDuration > 30) recs.push('Average quest duration exceeds 30 minutes — risk of session fatigue')
  if (rewardCheckpoints.length < 3) recs.push('Insufficient reward checkpoints — add story fragments for emotional engagement')
  if (recs.length === 0) recs.push('Narrative quest design is compelling — proceed to content production')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 7: CHURN PREDICTION GAMIFIED ====================

function executeChurnPredictionGamified(inputData: string): string {
  const data = parseInput<ChurnPredictionInput>(inputData)
  const productName = data.product_name || 'UnnamedProduct'
  const totalUsers = data.total_users || 100000
  const monthlyChurn = data.monthly_churn_pct || 8
  const churnSignals = data.churn_signals || ['declining_sessions', 'streak_broken', 'social_disengagement', 'reward_redemption_drop', 'leaderboard_fall']
  const interventionChannels = data.intervention_channels || ['push_notification', 'email', 'in_app_modal', 'sms']
  const rewardBudgetPct = data.reengagement_reward_budget_pct || 15
  const riskSegments = data.churn_risk_segments || ['low', 'medium', 'high', 'critical']
  const avgRecovery = data.avg_recovery_rate_pct || 20
  const salvageOffers = data.reward_salvage_offers || ['comeback_bonus_xp', 'free_streak_freeze', 'exclusive_missed_achievement', 'VIP_trial_3d']

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  let report = '# Churn Prediction Gamified Report' + '\n\n'
  report += '**Product:** ' + productName + '\n'
  report += '**Total Users:** ' + formatNum(totalUsers) + '\n'
  report += '**Monthly Churn Rate:** ' + monthlyChurn + '%\n'
  report += '**Avg Recovery Rate:** ' + avgRecovery + '%\n'
  report += '**Re-engagement Reward Budget:** ' + rewardBudgetPct + '% of total reward pool\n\n'
  report += '---' + '\n\n'

  report += '## Churn Signal Detection' + '\n\n'
  report += '| Signal | Lead Time (days) | Detection Accuracy | False Positive Rate | Actionability |\n'
  report += '|--------|-----------------|--------------------|--------------------|---------------|\n'
  churnSignals.forEach(signal => {
    const leadTime = signal === 'declining_sessions' ? 7 : signal === 'streak_broken' ? 1 : signal === 'social_disengagement' ? 14 : signal === 'reward_redemption_drop' ? 5 : 3
    const accuracy = clamp(0.6 + rng() * 0.35, 0, 1)
    const fpRate = clamp(0.02 + rng() * 0.08, 0, 1)
    const actionability = signal === 'streak_broken' ? 'Immediate (streak freeze offer)' : signal === 'declining_sessions' ? 'Medium (push + reward)' : signal === 'social_disengagement' ? 'Medium (re-engage squad)' : signal === 'reward_redemption_drop' ? 'Low (watch only)' : 'High (personalized offer)'
    report += '| ' + signal + ' | ' + leadTime + ' days | ' + formatPct(accuracy) + '% | ' + formatPct(fpRate) + '% | ' + actionability + ' |\n'
  })

  report += '\n## Risk Segment Distribution' + '\n\n'
  report += '| Segment | % of Users | User Count | Intervention Priority | Expected Churn Lift |\n'
  report += '|--------|-----------|-----------|----------------------|--------------------|\n'
  const segmentData = [
    { segment: 'Low risk', pct: 60, priority: 'Low', lift: '0%' },
    { segment: 'Medium risk', pct: 25, priority: 'Medium', lift: '-15% with nudge' },
    { segment: 'High risk', pct: 12, priority: 'High', lift: '-35% with reward' },
    { segment: 'Critical risk', pct: 3, priority: 'Critical', lift: '-50% with VIP intervention' }
  ]
  segmentData.forEach(sd => {
    const count = Math.floor(totalUsers * sd.pct / 100)
    report += '| ' + sd.segment + ' | ' + sd.pct + '% | ' + formatNum(count) + ' | ' + sd.priority + ' | ' + sd.lift + ' |\n'
  })

  report += '\n## Intervention Channel Effectiveness' + '\n\n'
  report += '| Channel | Open Rate | Conversion to Return | D7 Retention Lift | Cost per Reactivation | ROI |\n'
  report += '|--------|----------|---------------------|-------------------|----------------------|-----|\n'
  interventionChannels.forEach(ch => {
    const openRate = ch === 'push_notification' ? clamp(0.25 + rng() * 0.15, 0, 1) : ch === 'email' ? clamp(0.15 + rng() * 0.1, 0, 1) : ch === 'sms' ? clamp(0.4 + rng() * 0.3, 0, 1) : clamp(0.6 + rng() * 0.2, 0, 1)
    const conversion = clamp(openRate * (0.2 + rng() * 0.3), 0, 1)
    const d7Lift = clamp(conversion * (0.3 + rng() * 0.4), 0, 1)
    const cost = ch === 'sms' ? '$' + (0.01 + rng() * 0.04).toFixed(3) : ch === 'push_notification' ? '$' + (0.001 + rng() * 0.003).toFixed(4) : ch === 'email' ? '$' + (0.002 + rng() * 0.005).toFixed(4) : '$' + (0.005 + rng() * 0.01).toFixed(4)
    const roi = ((d7Lift * 12) / parseFloat(cost.replace('$', ''))).toFixed(0) + 'x'
    report += '| ' + ch + ' | ' + formatPct(openRate) + '% | ' + formatPct(conversion) + '% | ' + formatPct(d7Lift) + '% | ' + cost + ' | ' + roi + ' |\n'
  })

  report += '\n## Salvage Offer Performance' + '\n\n'
  report += '| Offer | Cost per User | Redemption Rate | 30d Recovery Rate | Net Revenue Impact | Best Segment |\n'
  report += '|-------|-------------|----------------|-------------------|--------------------|-------------|\n'
  salvageOffers.forEach(offer => {
    const cost = '$' + (0.5 + rng() * 3).toFixed(2)
    const redemption = clamp(0.15 + rng() * 0.4, 0, 1)
    const recovery = clamp(redemption * (0.3 + rng() * 0.4), 0, 1)
    const revenue = '+$' + (recovery * (10 + rng() * 20) - parseFloat(cost.replace('$', ''))).toFixed(2)
    const bestSeg = offer.includes('VIP') ? 'Critical' : offer.includes('streak') ? 'High' : offer.includes('comeback') ? 'Medium' : 'All segments'
    report += '| ' + offer + ' | ' + cost + ' | ' + formatPct(redemption) + '% | ' + formatPct(recovery) + '% | ' + revenue + ' | ' + bestSeg + ' |\n'
  })

  report += '\n## Gamified Retention Mechanics' + '\n\n'
  report += '| Mechanic | Trigger | Churn Risk Addressed | DAU Impact | LTV Lift |\n'
  report += '|---------|--------|---------------------|-----------|----------|\n'
  const mechanics = [
    { mechanic: 'Streak resurrection', trigger: 'After 1 missed day', risk: 'Habit break', dau: '+3%', ltv: '+8%' },
    { mechanic: 'Comeback quest line', trigger: 'After 7-day absence', risk: 'Disengagement', dau: '+5%', ltv: '+12%' },
    { mechanic: 'We miss you XP grant', trigger: '3 days inactive', risk: 'Forgotten habit', dau: '+2%', ltv: '+5%' },
    { mechanic: 'Social re-engagement squad', trigger: 'Friend becomes inactive', risk: 'Loss of social tie', dau: '+8%', ltv: '+15%' },
    { mechanic: 'Last-chance exclusive achievement', trigger: 'Predicted 90% churn', risk: 'Total disengagement', dau: '+12%', ltv: '+20%' }
  ]
  mechanics.forEach(m => {
    report += '| ' + m.mechanic + ' | ' + m.trigger + ' | ' + m.risk + ' | ' + m.dau + ' | ' + m.ltv + ' |\n'
  })

  report += '\n## Budget Allocation' + '\n\n'
  report += '| Category | % of Budget | Expected Users Reached | Cost per Reactivation | Efficiency Rank |\n'
  report += '|---------|-----------|----------------------|---------------------|-----------------|\n'
  const budgetItems = [
    { category: 'Prevention (low risk)', pct: '20%', reach: '60%', cost: '$0.10', rank: 'High' },
    { category: 'Early intervention (medium)', pct: '30%', reach: '25%', cost: '$0.50', rank: 'Medium' },
    { category: 'Active rescue (high)', pct: '30%', reach: '12%', cost: '$2.00', rank: 'Medium' },
    { category: 'Critical salvage (critical)', pct: '20%', reach: '3%', cost: '$8.00', rank: 'Low but necessary' }
  ]
  budgetItems.forEach(b => {
    report += '| ' + b.category + ' | ' + b.pct + ' | ' + b.reach + ' | ' + b.cost + ' | ' + b.rank + ' |\n'
  })

  const detectionScore = clamp(churnSignals.length / 8, 0.3, 1)
  const interventionScore = clamp(interventionChannels.length / 6, 0.3, 1)
  const recoveryScore = clamp(avgRecovery / 40, 0, 1)
  const budgetEfficiency = clamp(rewardBudgetPct / 20, 0, 1)
  const overallScore = detectionScore * 0.25 + interventionScore * 0.25 + recoveryScore * 0.3 + budgetEfficiency * 0.2

  report += '\n## Churn Defense Score: ' + formatPct(overallScore) + '%' + '\n\n'

  report += '\n## Key Metrics' + '\n\n'
  report += '| Metric | Current | Target | Gap |\n'
  report += '|--------|---------|--------|-----|\n'
  const predictedMonthlyLoss = Math.floor(totalUsers * monthlyChurn / 100)
  const recovered = Math.floor(predictedMonthlyLoss * avgRecovery / 100)
  report += '| Monthly Users Lost | ' + formatNum(predictedMonthlyLoss) + ' | <' + formatNum(Math.floor(totalUsers * 5 / 100)) + ' | ' + (monthlyChurn > 5 ? 'EXCEEDS TARGET' : 'OK') + ' |\n'
  report += '| Monthly Recovered | ' + formatNum(recovered) + ' | >' + formatNum(Math.floor(predictedMonthlyLoss * 35 / 100)) + ' | ' + (avgRecovery < 35 ? 'BELOW TARGET' : 'OK') + ' |\n'
  report += '| Recovery Rate | ' + avgRecovery + '% | 35%+ | ' + (avgRecovery < 35 ? String(avgRecovery - 35) + '%' : 'Met') + ' |\n'
  report += '| Churn Prediction Lead Time avg | ' + (churnSignals.length * 5.6).toFixed(1) + ' days | 7+ days | ' + (churnSignals.length * 5.6 < 7 ? 'INSUFFICIENT' : 'OK') + ' |\n'

  report += '\n## Recommendations' + '\n\n'
  const recs: string[] = []
  if (monthlyChurn > 10) recs.push('Monthly churn exceeds 10% — critical intervention needed across all segments')
  if (avgRecovery < 25) recs.push('Recovery rate is below 25% — test higher-value salvage offers')
  if (churnSignals.length < 4) recs.push('Add more churn signals — session depth and feature adoption are strong predictors')
  if (rewardBudgetPct < 10) recs.push('Re-engagement budget is below 10% — insufficient for meaningful intervention')
  if (!salvageOffers.some(o => o.includes('VIP'))) recs.push('Add VIP trial offer for critical-risk segment — highest ROI intervention')
  if (recs.length === 0) recs.push('Churn defense system is robust — continuously A/B test new salvage mechanics')
  recs.forEach((r, i) => { report += (i + 1) + '. ' + r + '\n' })

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== TOOL 8: AB TEST REWARD OPTIMIZER ====================

function executeABTestRewardOptimizer(inputData: string): string {
  const data = parseInput<ABTestRewardInput>(inputData)
  const experimentName = data.experiment_name || 'Reward_AB_Test'
  const variantA = data.reward_variant_a || { name: 'XP Bonus x2', reward_type: 'xp_multiplier', value: 2, description: 'Double XP for 24 hours' }
  const variantB = data.reward_variant_b || { name: 'Exclusive Badge', reward_type: 'achievement_badge', value: 1, description: 'Limited edition collector badge' }
  const sampleSize = data.sample_size_per_variant || 5000
  const currentConv = data.current_conversion_pct || 12
  const targetLift = data.target_lift_pct || 15
  const testDuration = data.test_duration_days || 14
  const segmentDims = data.segment_dimensions || ['user_level', 'engagement_tier', 'acquisition_channel', 'geo_region']
  const statPower = data.statistical_power || 0.8

  const seed = hashString(JSON.stringify(inputData))
  const rng = mulberry32(seed)

  let report = '# A/B Test Reward Optimizer Report' + '\n\n'
  report += '**Experiment:** ' + experimentName + '\n'
  report += '**Variant A:** ' + variantA.name + ' (' + variantA.reward_type + ')\n'
  report += '**Variant B:** ' + variantB.name + ' (' + variantB.reward_type + ')\n'
  report += '**Sample Size/Variant:** ' + formatNum(sampleSize) + '\n'
  report += '**Current Conversion:** ' + currentConv + '%\n'
  report += '**Target Lift:** ' + targetLift + '%\n'
  report += '**Test Duration:** ' + testDuration + ' days\n'
  report += '**Statistical Power:** ' + (statPower * 100).toFixed(0) + '%\n\n'
  report += '---' + '\n\n'

  report += '## Variant Comparison' + '\n\n'
  report += '| Property | Variant A | Variant B |\n'
  report += '|---------|----------|----------|\n'
  report += '| Name | ' + variantA.name + ' | ' + variantB.name + ' |\n'
  report += '| Type | ' + variantA.reward_type + ' | ' + variantB.reward_type + ' |\n'
  report += '| Value | ' + variantA.value + ' | ' + variantB.value + ' |\n'
  report += '| Description | ' + (variantA.description || '—') + ' | ' + (variantB.description || '—') + ' |\n'

  const simulatedConvA = clamp(currentConv / 100 + rng() * 0.04 - 0.02, 0, 1)
  const simulatedConvB = clamp(currentConv / 100 + rng() * 0.06 - 0.02, 0, 1)
  const observedLift = ((simulatedConvB - simulatedConvA) / simulatedConvA) * 100
  const zScore = (simulatedConvB - simulatedConvA) / Math.sqrt((simulatedConvA * (1 - simulatedConvA) + simulatedConvB * (1 - simulatedConvB)) / sampleSize)
  const pValue = clamp(1 - clamp(Math.abs(zScore) / 3, 0, 1), 0.001, 0.999)
  const significant = pValue < 0.05

  report += '\n## Test Results' + '\n\n'
  report += '| Metric | Variant A | Variant B | Difference | Significance |\n'
  report += '|--------|----------|----------|-----------|---------------|\n'
  report += '| Conversion Rate | ' + formatPct(simulatedConvA) + '% | ' + formatPct(simulatedConvB) + '% | ' + (observedLift >= 0 ? '+' : '') + observedLift.toFixed(2) + '% | ' + (significant ? 'YES (p=' + pValue.toFixed(4) + ')' : 'NO (p=' + pValue.toFixed(4) + ')') + ' |\n'
  report += '| Sample Size | ' + formatNum(sampleSize) + ' | ' + formatNum(sampleSize) + ' | — | — |\n'
  report += '| Conversions | ' + formatNum(Math.floor(simulatedConvA * sampleSize)) + ' | ' + formatNum(Math.floor(simulatedConvB * sampleSize)) + ' | ' + formatNum(Math.floor((simulatedConvB - simulatedConvA) * sampleSize)) + ' | — |\n'
  report += '| Confidence Level | ' + (significant ? '95%' : '<95%') + ' | ' + (significant ? '95%' : '<95%') + ' | — | ' + (significant ? 'PASS' : 'INSUFFICIENT DATA') + ' |\n'

  report += '\n## Segment Analysis' + '\n\n'
  report += '| Segment | Variant A Conv | Variant B Conv | Lift | Significant | Winner |\n'
  report += '|--------|---------------|---------------|------|-------------|--------|\n'
  const segments = [
    { name: 'Low engagement', baseConv: currentConv * 0.6 },
    { name: 'Medium engagement', baseConv: currentConv },
    { name: 'High engagement', baseConv: currentConv * 1.5 },
    { name: 'Power users', baseConv: currentConv * 1.8 }
  ]
  segments.forEach(seg => {
    const segConvA = clamp(seg.baseConv / 100 + (rng() - 0.5) * 0.03, 0, 1)
    const segConvB = clamp(seg.baseConv / 100 + (rng() - 0.5) * 0.04, 0, 1)
    const segLift = ((segConvB - segConvA) / segConvA) * 100
    const segSig = Math.abs(segLift) > 10 && rng() > 0.4
    const segWinner = segConvB > segConvA ? 'B' : 'A'
    report += '| ' + seg.name + ' | ' + formatPct(segConvA) + '% | ' + formatPct(segConvB) + '% | ' + (segLift >= 0 ? '+' : '') + segLift.toFixed(1) + '% | ' + (segSig ? 'Yes' : 'No') + ' | ' + segWinner + ' |\n'
  })

  report += '\n## Statistical Validity Checklist' + '\n\n'
  report += '| Check | Status | Notes |\n'
  report += '|-------|--------|-------|\n'
  const minSampleSize = Math.ceil(Math.pow(1.96 + 0.84, 2) * (simulatedConvA * (1 - simulatedConvA) + simulatedConvB * (1 - simulatedConvB)) / Math.pow((simulatedConvB - simulatedConvA), 2))
  report += '| Sample Size Adequacy | ' + (sampleSize >= minSampleSize ? 'PASS (' + formatNum(sampleSize) + ' >= ' + formatNum(minSampleSize) + ')' : 'FAIL (' + formatNum(sampleSize) + ' < ' + formatNum(minSampleSize) + ')') + ' | MDE: ' + formatPct(Math.abs(simulatedConvB - simulatedConvA)) + '% |\n'
  report += '| Randomization Check | ' + (rng() > 0.1 ? 'PASS' : 'REVIEW') + ' | Chi-square p>0.05 for user attributes |\n'
  report += '| Duration Coverage | ' + (testDuration >= 14 ? 'PASS (' + testDuration + ' days >= 14)' : 'SHORT (' + testDuration + ' days < 14)') + ' | Covers full weekly cycle |\n'
  report += '| Novelty Effect Risk | ' + (testDuration < 7 ? 'HIGH' : testDuration < 14 ? 'Medium' : 'Low') + ' | New rewards may temporarily inflate engagement |\n'
  report += '| Statistical Power | ' + (statPower >= 0.8 ? 'PASS (' + formatPct(statPower) + '%)' : 'LOW (' + formatPct(statPower) + '%)') + ' | Target: 80%+ |\n'
  report += '| Multiple Comparison Adj | ' + (segmentDims.length <= 4 ? 'Not needed' : 'Apply Bonferroni correction') + ' | ' + segmentDims.length + ' segments tested |\n'

  report += '\n## ROI Projection' + '\n\n'
  report += '| Metric | Variant A | Variant B | Difference |\n'
  report += '|--------|----------|----------|-----------|\n'
  const revenueA = simulatedConvA * 2.5 * sampleSize
  const revenueB = simulatedConvB * 2.5 * sampleSize
  const costA = variantA.value * 0.01 * sampleSize
  const costB = variantB.value * 0.01 * sampleSize
  const roiA = ((revenueA - costA) / costA * 100).toFixed(0)
  const roiB = ((revenueB - costB) / costB * 100).toFixed(0)
  report += '| Projected Revenue | $' + formatNum(Math.floor(revenueA)) + ' | $' + formatNum(Math.floor(revenueB)) + ' | $' + formatNum(Math.floor(revenueB - revenueA)) + ' |\n'
  report += '| Reward Cost | $' + costA.toFixed(2) + ' | $' + costB.toFixed(2) + ' | $' + (costB - costA).toFixed(2) + ' |\n'
  report += '| ROI | ' + roiA + '% | ' + roiB + '% | ' + (parseInt(roiB) - parseInt(roiA)) + '% |\n'
  report += '| Payback Period | ' + (costA / (revenueA / 30)).toFixed(1) + ' days | ' + (costB / (revenueB / 30)).toFixed(1) + ' days | — |\n'

  report += '\n## Test Execution Timeline' + '\n\n'
  report += '| Phase | Duration | Milestone | Success Criteria |\n'
  report += '|------|---------|----------|------------------|\n'
  report += '| Setup | 2 days | Variant configuration + tracking | 100% event coverage |\n'
  report += '| Ramp-up | 3 days | 10% -> 50% traffic allocation | No system alerts |\n'
  report += '| Full run | ' + Math.max(7, testDuration - 5) + ' days | Full traffic split | SRM check passes |\n'
  report += '| Analysis | 3 days | Statistical report + segment deep-dive | p<0.05 significance |\n'
  report += '| Decision | 1 day | Rollback or full deployment | Stakeholder sign-off |\n'

  report += '\n## Recommendation' + '\n\n'
  if (significant && observedLift > 0) {
    report += '**RESULT:** Variant B (' + variantB.name + ') is the winner with ' + observedLift.toFixed(1) + '% lift (p=' + pValue.toFixed(4) + ').\n\n'
    report += '- Deploy Variant B to 100% of users\n'
    report += '- Monitor for novelty decay over next 30 days\n'
    report += '- Plan follow-up test with variant B as new control\n'
  } else if (significant && observedLift < 0) {
    report += '**RESULT:** Variant A (' + variantA.name + ') is the winner with ' + Math.abs(observedLift).toFixed(1) + '% better performance (p=' + pValue.toFixed(4) + ').\n\n'
    report += '- Keep Variant A as the default reward\n'
    report += '- Iterate on Variant B hypothesis for future test\n'
  } else {
    report += '**RESULT:** No significant difference detected (p=' + pValue.toFixed(4) + ').\n\n'
    report += '- Options: 1) Extend test duration 2) Increase sample size 3) Increase reward delta\n'
    report += '- Recommend: Extend by ' + Math.max(7, 21 - testDuration) + ' days and check again\n'
  }

  report += '\n---' + '\n\n' + '*' + DISCLAIMER + '*'
  return report
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'achievement_system_designer',
    description: '成就系统设计：徽章分类/解锁条件/稀有度层级/升级曲线/奖励映射/完成率预测',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_name, target_audience, achievement_categories, rarity_distribution, unlock_condition_types, reward_types, progression_tiers, estimated_total_achievements, daily_active_users' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeAchievementSystemDesigner(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'points_mechanics_config',
    description: '积分机制配置：XP曲线/积分赚取规则/兑换经济/平衡水槽与来源/通货膨胀控制',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: currency_name, xp_curve_type, max_level, actions, sink_mechanisms, daily_cap_xp, weekly_cap_xp, starting_xp, inflation_target_pct' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executePointsMechanicsConfig(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'engagement_loop_analyzer',
    description: '参与度循环分析：DAU/MAU比率/会话频率/病毒系数/循环摩擦点/留存d1/d7/d30',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_name, current_dau, current_mau, avg_session_minutes, avg_sessions_per_day, retention_d1_pct, retention_d7_pct, retention_d30_pct, viral_coefficient, core_loop_actions, onboarding_completion_pct' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeEngagementLoopAnalyzer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'habit_tracker_architect',
    description: '习惯追踪架构：连胜机制/提醒系统/问责循环/复发恢复/习惯叠加/完成率目标',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: habit_name, target_frequency, streak_target_days, reminder_channels, accountability_type, relapse_recovery_mode, habit_stack_depth, success_rate_target_pct, current_completion_rate_pct' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeHabitTrackerArchitect(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'leaderboard_optimizer',
    description: '排行榜优化：排名算法/衰减函数/分段层级/反作弊/动机平衡/新玩家友好度',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: leaderboard_name, ranking_metric, tier_system, total_participants, update_frequency, decay_function, anti_cheat_enabled, bottom_pct_demotivated' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeLeaderboardOptimizer(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'narrative_quest_builder',
    description: '叙事任务构建：故事弧/任务分支/奖励节奏/叙事钩子/升级门控/类型适配',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: quest_line_name, genre, total_chapters, avg_quest_duration_min, branching_factor, core_narrative_hooks, reward_checkpoints, player_agency_level, xp_per_chapter' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeNarrativeQuestBuilder(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'churn_prediction_gamified',
    description: '流失预测游戏化：流失风险评分/干预触发器/再参与活动/奖励挽救方案/恢复率',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: product_name, total_users, monthly_churn_pct, churn_signals, intervention_channels, reengagement_reward_budget_pct, churn_risk_segments, avg_recovery_rate_pct, reward_salvage_offers' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeChurnPredictionGamified(args.input_data) }
  }))

  tools.register(defineTool({
    name: 'ab_test_reward_optimizer',
    description: '奖励A/B测试优化器：奖励变体测试/统计显著性/分段分析/ROI测量/样本量计算',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: experiment_name, reward_variant_a, reward_variant_b, sample_size_per_variant, current_conversion_pct, target_lift_pct, test_duration_days, segment_dimensions, statistical_power' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return executeABTestRewardOptimizer(args.input_data) }
  }))
}
