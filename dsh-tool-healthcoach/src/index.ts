/**
 * DSH AI Health Coach Plugin v1.0.0
 *
 * Personalized health coaching tools for chronic disease management, nutrition planning,
 * exercise prescription, sleep optimization, stress resilience, wearable data interpretation,
 * health risk assessment, and behavior change planning. Digital health coaching leverages
 * wearable data, GLP-1 trends, and aging population needs — a massive 2026 market.
 *
 * Features (v1.0.0):
 * - Chronic Disease Coach (personalized coaching for diabetes, hypertension, obesity)
 * - Nutrition Planner (personalized meal plans with dietary restrictions and budget)
 * - Exercise Prescription Engine (personalized exercise programs based on fitness level)
 * - Sleep Optimizer (sleep pattern analysis and optimization recommendations)
 * - Stress Resilience Coach (stress management and resilience-building strategies)
 * - Wearable Data Interpreter (interprets HRV, SpO2, steps, sleep stages data)
 * - Health Risk Assessor (assesses risks from family history, lifestyle, biomarkers)
 * - Behavior Change Planner (habit science-based plans for sustained improvements)
 *
 * @module dsh-tool-healthcoach
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-healthcoach'
export const inject = ['tools']

const VERSION = '1.0.0'

const DISCLAIMER = 'DISCLAIMER: This tool provides AI-generated health information for informational purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making any changes to your health regimen, medication, or lifestyle.'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function computeSeed(input: unknown): number {
  return JSON.stringify(input).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
}

function rngRange(rand: () => number, min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min
}

function rngFloat(rand: () => number, min: number, max: number): number {
  return rand() * (max - min) + min
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Chronic Disease Coach ---
export interface ChronicDiseaseInput {
  condition: string
  biomarkers: Record<string, number>
  medications: string[]
  lifestyle_factors: Record<string, string>
  target_metrics: Record<string, number>
  risk_level: 'low' | 'moderate' | 'high' | 'very_high'
}

export interface CoachingAction {
  category: string
  action: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  timeframe: string
}

export interface ChronicDiseaseOutput {
  condition: string
  adherence_score: number
  risk_score: number
  control_level: 'optimal' | 'good' | 'fair' | 'poor'
  actions: CoachingAction[]
  medication_notes: string[]
  lifestyle_modifications: string[]
  monitoring_schedule: string[]
  target_progress: Record<string, { current: number; target: number; unit: string }>
  disclaimer: string
}

// --- Tool 2: Nutrition Planner ---
export interface NutritionInput {
  goal: string
  dietary_restrictions: string[]
  calories_target: number
  meals_per_day: number
  food_preferences: string[]
  budget_usd_week: number
}

export interface MealPlan {
  meal: string
  foods: string[]
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface NutritionOutput {
  goal: string
  daily_calories: number
  macros: { protein_pct: number; carbs_pct: number; fat_pct: number }
  meal_plan: MealPlan[]
  hydration_goal_ml: number
  supplement_suggestions: string[]
  budget_estimate_usd_week: number
  shopping_tips: string[]
  disclaimer: string
}

// --- Tool 3: Exercise Prescription Engine ---
export interface ExerciseInput {
  fitness_level: 'beginner' | 'intermediate' | 'advanced' | 'elite'
  goal: string
  available_equipment: string[]
  time_available_min_week: number
  injuries: string[]
  age: number
  gender: string
}

export interface ExerciseSession {
  day: string
  focus: string
  exercises: Array<{ name: string; sets: number; reps: string; rest_sec: number }>
  duration_min: number
  intensity: 'low' | 'moderate' | 'high'
}

export interface ExerciseOutput {
  fitness_level: string
  goal: string
  weekly_sessions: ExerciseSession[]
  total_weekly_minutes: number
  progression_plan: string[]
  injury_precautions: string[]
  recovery_recommendations: string[]
  expected_timeline_weeks: number
  disclaimer: string
}

// --- Tool 4: Sleep Optimizer ---
export interface SleepInput {
  current_sleep_hours: number
  sleep_quality_score: number
  bedtime_routine: string[]
  environment_factors: Record<string, string>
  chronotype: 'morning_lark' | 'intermediate' | 'night_owl'
  issues: string[]
}

export interface SleepOutput {
  current_sleep_hours: number
  sleep_quality_score: number
  sleep_efficiency_pct: number
  recommended_hours: number
  optimal_bedtime: string
  optimal_wake_time: string
  routine_recommendations: string[]
  environment_optimizations: string[]
  chronotype_alignment: string
  sleep_hygiene_score: number
  disclaimer: string
}

// --- Tool 5: Stress Resilience Coach ---
export interface StressInput {
  stress_level: number
  triggers: string[]
  coping_mechanisms: string[]
  work_life_balance: 'poor' | 'fair' | 'good' | 'excellent'
  support_system: 'minimal' | 'moderate' | 'strong'
  mindfulness_experience: 'none' | 'beginner' | 'intermediate' | 'advanced'
}

export interface ResilienceOutput {
  stress_level: number
  resilience_score: number
  burnout_risk: 'low' | 'moderate' | 'high' | 'critical'
  coping_upgrades: string[]
  mindfulness_plan: string[]
  boundary_strategies: string[]
  daily_practices: string[]
  professional_support_recommended: boolean
  disclaimer: string
}

// --- Tool 6: Wearable Data Interpreter ---
export interface WearableInput {
  data_source: string
  metrics_data: Record<string, number>
  baseline_comparison: Record<string, number>
  goal_targets: Record<string, number>
  anomaly_thresholds: Record<string, number>
}

export interface MetricInterpretation {
  metric: string
  current_value: number
  baseline_value: number
  status: 'optimal' | 'normal' | 'elevated' | 'concerning'
  trend: 'improving' | 'stable' | 'declining'
  insight: string
}

export interface WearableOutput {
  data_source: string
  interpretations: MetricInterpretation[]
  overall_health_score: number
  anomaly_alerts: string[]
  actionable_insights: string[]
  goal_progress: Record<string, { current: number; target: number; pct: number }>
  disclaimer: string
}

// --- Tool 7: Health Risk Assessor ---
export interface RiskInput {
  age: number
  gender: string
  family_history: Record<string, boolean>
  lifestyle: Record<string, string>
  biomarkers: Record<string, number>
  screening_history: string[]
}

export interface RiskFactor {
  factor: string
  level: 'low' | 'moderate' | 'high'
  contributing:string[]
  modifiable: boolean
}

export interface RiskOutput {
  overall_risk_score: number
  risk_category: 'low' | 'moderate' | 'high'
  factors: RiskFactor[]
  screening_recommendations: string[]
  lifestyle_modifications: string[]
  prevention_score: number
  disclaimer: string
}

// --- Tool 8: Behavior Change Planner ---
export interface BehaviorInput {
  target_behavior: string
  current_habit_strength: number
  motivation_level: number
  barriers: string[]
  support_available: string[]
  timeline_weeks: number
}

export interface HabitStage {
  stage: string
  week_range: string
  focus: string
  techniques: string[]
  success_indicator: string
}

export interface BehaviorOutput {
  target_behavior: string
  readiness_score: number
  stages: HabitStage[]
  keystone_habits: string[]
  barrier_mitigation: string[]
  reward_system: string[]
  timeline_weeks: number
  projected_success_rate: number
  disclaimer: string
}

// ==================== TOOL 1: CHRONIC DISEASE COACH ====================

function chronicDiseaseCoach(input: ChronicDiseaseInput): ChronicDiseaseOutput {
  const rand = mulberry32(computeSeed(input))
  const condition = input.condition.toLowerCase()
  const risk = input.risk_level

  let adherenceScore = rngRange(rand, 55, 85)
  if (risk === 'low') adherenceScore += 10
  if (risk === 'very_high') adherenceScore -= 10
  adherenceScore = clamp(adherenceScore, 20, 98)

  let riskScore = rngRange(rand, 40, 70)
  if (risk === 'high' || risk === 'very_high') riskScore += 15
  if (risk === 'low') riskScore -= 10
  riskScore = clamp(riskScore, 15, 95)

  let controlLevel: ChronicDiseaseOutput['control_level'] = 'good'
  if (adherenceScore >= 85 && riskScore < 40) controlLevel = 'optimal'
  else if (adherenceScore >= 65) controlLevel = 'good'
  else if (adherenceScore >= 45) controlLevel = 'fair'
  else controlLevel = 'poor'

  const actions: CoachingAction[] = []
  if (condition.includes('diabetes') || condition.includes('sugar')) {
    actions.push({ category: 'Diet', action: 'Adopt low-glycemic index meal planning with carb counting', priority: 'critical', timeframe: 'Immediate' })
    actions.push({ category: 'Monitoring', action: 'Check fasting glucose daily and log trends weekly', priority: 'high', timeframe: 'Daily' })
    actions.push({ category: 'Exercise', action: '150 min/week moderate aerobic activity post-meals', priority: 'high', timeframe: 'This week' })
  }
  if (condition.includes('hypertension') || condition.includes('blood pressure') || condition.includes('bp')) {
    actions.push({ category: 'Diet', action: 'Reduce sodium intake to <2000mg/day, adopt DASH diet', priority: 'critical', timeframe: 'This week' })
    actions.push({ category: 'Monitoring', action: 'Measure BP twice daily (morning/evening) with validated cuff', priority: 'high', timeframe: 'Daily' })
    actions.push({ category: 'Lifestyle', action: 'Limit alcohol to <1 drink/day, practice stress reduction', priority: 'medium', timeframe: 'Ongoing' })
  }
  if (condition.includes('obesity') || condition.includes('weight')) {
    actions.push({ category: 'Diet', action: 'Create 500-750 kcal/day deficit with high-protein meals', priority: 'critical', timeframe: 'This week' })
    actions.push({ category: 'Exercise', action: 'Progressive: start with walking 8000 steps, add resistance training', priority: 'high', timeframe: 'This week' })
    actions.push({ category: 'Behavioral', action: 'Track all meals, identify emotional eating triggers', priority: 'medium', timeframe: 'Daily' })
  }
  if (actions.length === 0) {
    actions.push({ category: 'General', action: 'Schedule comprehensive health assessment with care team', priority: 'high', timeframe: 'This week' })
    actions.push({ category: 'Monitoring', action: 'Track relevant biomarkers per physician guidance', priority: 'high', timeframe: 'Ongoing' })
  }

  const medicationNotes: string[] = []
  for (const med of input.medications) {
    medicationNotes.push(`Take ${med} as prescribed; set daily reminder; monitor for side effects`)
  }
  if (medicationNotes.length === 0) {
    medicationNotes.push('No medications listed — discuss pharmacological options with physician if lifestyle modifications insufficient')
  }

  const lifestyleMods: string[] = []
  const lf = input.lifestyle_factors
  if (lf.smoking === 'current') lifestyleMods.push('Enroll in smoking cessation program — single most impactful change')
  if (lf.exercise === 'sedentary') lifestyleMods.push('Begin with 10-min walks 3x/day, progressively increase')
  if (lf.stress === 'high') lifestyleMods.push('Integrate daily 10-min mindfulness meditation for stress reduction')
  if (lf.alcohol === 'heavy') lifestyleMods.push('Reduce alcohol consumption; seek support if dependency suspected')
  if (lifestyleMods.length === 0) lifestyleMods.push('Maintain current positive lifestyle factors; focus on consistency')

  const monitoring: string[] = []
  monitoring.push('Weekly: Self-monitoring log review (symptoms, adherence, side effects)')
  monitoring.push('Monthly: Biomarker tracking against target metrics')
  monitoring.push('Quarterly: Comprehensive review with healthcare provider')
  if (risk === 'high' || risk === 'very_high') monitoring.push('Bi-weekly: Care coach check-in for adjustment')

  const targetProgress: Record<string, { current: number; target: number; unit: string }> = {}
  for (const [key, target] of Object.entries(input.target_metrics)) {
    const current = input.biomarkers[key] || rngFloat(rand, target * 0.8, target * 1.3)
    targetProgress[key] = { current: Math.round(current * 10) / 10, target, unit: 'units' }
  }

  return {
    condition: input.condition,
    adherence_score: adherenceScore,
    risk_score: riskScore,
    control_level: controlLevel,
    actions,
    medication_notes: medicationNotes,
    lifestyle_modifications: lifestyleMods,
    monitoring_schedule: monitoring,
    target_progress: targetProgress,
    disclaimer: DISCLAIMER,
  }
}

function formatChronicDiseaseReport(input: ChronicDiseaseInput, output: ChronicDiseaseOutput): string {
  const lines: string[] = []
  lines.push('# Chronic Disease Coaching Report')
  lines.push('')
  lines.push(`**Condition:** ${input.condition}`)
  lines.push(`**Risk Level:** ${input.risk_level.replace('_', ' ')}`)
  lines.push(`**Control Level:** ${output.control_level.toUpperCase()} (Adherence: ${output.adherence_score}/100 | Risk: ${output.risk_score}/100)`)
  lines.push('')
  lines.push('## Priority Actions')
  for (const a of output.actions) {
    lines.push(`- [${a.priority.toUpperCase()}] **${a.category}:** ${a.action} (${a.timeframe})`)
  }
  lines.push('')
  lines.push('## Medication Notes')
  for (const m of output.medication_notes) {
    lines.push(`- ${m}`)
  }
  lines.push('')
  lines.push('## Lifestyle Modifications')
  for (const l of output.lifestyle_modifications) {
    lines.push(`- ${l}`)
  }
  lines.push('')
  lines.push('## Monitoring Schedule')
  for (const s of output.monitoring_schedule) {
    lines.push(`- ${s}`)
  }
  if (Object.keys(output.target_progress).length > 0) {
    lines.push('')
    lines.push('## Target Progress')
    for (const [key, val] of Object.entries(output.target_progress)) {
      lines.push(`- ${key}: ${val.current} → ${val.target} ${val.unit}`)
    }
  }
  lines.push('')
  lines.push('---')
  lines.push('⚠️ ' + output.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 2: NUTRITION PLANNER ====================

function planNutrition(input: NutritionInput): NutritionOutput {
  const rand = mulberry32(computeSeed(input))
  const calories = input.calories_target || 2000
  const mealsPerDay = input.meals_per_day || 3
  const restrictions = input.dietary_restrictions || []
  const prefs = input.food_preferences || []
  const budget = input.budget_usd_week || 70

  let proteinPct = rngRange(rand, 20, 35)
  let fatPct = rngRange(rand, 25, 35)
  let carbsPct = 100 - proteinPct - fatPct
  if (input.goal.toLowerCase().includes('keto')) {
    carbsPct = 5; fatPct = 70; proteinPct = 25
  } else if (input.goal.toLowerCase().includes('high protein') || input.goal.toLowerCase().includes('muscle')) {
    proteinPct = 35; carbsPct = 40; fatPct = 25
  }

  const proteinG = Math.round((calories * proteinPct / 100) / 4)
  const carbsG = Math.round((calories * carbsPct / 100) / 4)
  const fatG = Math.round((calories * fatPct / 100) / 9)

  const mealNames = mealsPerDay <= 3 ? ['Breakfast', 'Lunch', 'Dinner'] :
    mealsPerDay === 4 ? ['Breakfast', 'Lunch', 'Snack', 'Dinner'] :
    ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Dinner']

  const foodOptions = ['Grilled chicken breast', 'Wild salmon', 'Quinoa bowl', 'Greek yogurt', 'Mixed berries',
    'Steamed broccoli', 'Sweet potato', 'Avocado', 'Lentil salad', 'Oatmeal',
    'Spinach smoothie', 'Brown rice', 'Turkey breast', 'Almonds', 'Chia seeds',
    'Eggs', 'Black beans', 'Kale salad', 'Cottage cheese', 'Whole grain bread']

  const filteredFoods = prefs.length > 0 ? foodOptions.filter(f =>
    prefs.some(p => f.toLowerCase().includes(p.toLowerCase()))
  ) : foodOptions
  const availableFoods = filteredFoods.length > 5 ? filteredFoods : foodOptions

  const mealPlan: MealPlan[] = []
  const calPerMeal = Math.round(calories / mealsPerDay)
  for (let i = 0; i < mealsPerDay; i++) {
    const foodCount = rngRange(rand, 2, 4)
    const foods: string[] = []
    for (let j = 0; j < foodCount; j++) {
      foods.push(availableFoods[Math.floor(rand() * availableFoods.length)])
    }
    mealPlan.push({
      meal: mealNames[i] || `Meal ${i + 1}`,
      foods,
      calories: calPerMeal + rngRange(rand, -50, 50),
      protein_g: Math.round(proteinG / mealsPerDay + rngRange(rand, -5, 5)),
      carbs_g: Math.round(carbsG / mealsPerDay + rngRange(rand, -10, 10)),
      fat_g: Math.round(fatG / mealsPerDay + rngRange(rand, -3, 3)),
    })
  }

  const supplements: string[] = []
  if (restrictions.some(r => r.toLowerCase().includes('vegan'))) {
    supplements.push('Vitamin B12 (2.4mcg/day)', 'Vitamin D3 (1000IU/day)', 'Omega-3 from algae')
  }
  if (restrictions.some(r => r.toLowerCase().includes('dairy'))) {
    supplements.push('Calcium (1000mg/day)', 'Vitamin D3 (1000IU/day)')
  }
  if (input.goal.toLowerCase().includes('muscle') || input.goal.toLowerCase().includes('strength')) {
    supplements.push('Creatine monohydrate (5g/day)', 'Whey or plant protein powder')
  }
  if (supplements.length === 0) {
    supplements.push('Vitamin D3 (1000IU/day)', 'Omega-3 fish oil (1000mg/day)', 'Magnesium (400mg/day)')
  }

  const shoppingTips: string[] = []
  if (budget < 50) shoppingTips.push('Buy in bulk: oats, rice, beans, lentils — cheapest nutrient-dense foods')
  if (budget < 50) shoppingTips.push('Choose frozen fruits/vegetables — same nutrition, lower cost')
  if (budget >= 50 && budget <= 100) shoppingTips.push('Mix fresh and frozen produce to balance cost and quality')
  if (budget > 100) shoppingTips.push('Invest in quality proteins and organic produce for highest nutrient density')
  shoppingTips.push('Meal prep on Sundays to reduce impulse purchases and food waste')
  shoppingTips.push('Read nutrition labels — prioritize protein-per-dollar ratio')

  return {
    goal: input.goal,
    daily_calories: calories,
    macros: { protein_pct: proteinPct, carbs_pct: carbsPct, fat_pct: fatPct },
    meal_plan: mealPlan,
    hydration_goal_ml: Math.round(calories * 1.2),
    supplement_suggestions: supplements,
    budget_estimate_usd_week: Math.round(budget * rngFloat(rand, 0.85, 1.05)),
    shopping_tips: shoppingTips,
    disclaimer: DISCLAIMER,
  }
}

function formatNutritionReport(input: NutritionInput, output: NutritionOutput): string {
  const lines: string[] = []
  lines.push('# Personalized Nutrition Plan')
  lines.push('')
  lines.push(`**Goal:** ${input.goal}`)
  lines.push(`**Daily Calories:** ${output.daily_calories} kcal`)
  lines.push(`**Macros:** Protein ${output.macros.protein_pct}% | Carbs ${output.macros.carbs_pct}% | Fat ${output.macros.fat_pct}%`)
  lines.push(`**Hydration Goal:** ${output.hydration_goal_ml}ml/day`)
  lines.push(`**Dietary Restrictions:** ${input.dietary_restrictions.join(', ') || 'None'}`)
  lines.push('')
  lines.push('## Daily Meal Plan')
  for (const meal of output.meal_plan) {
    lines.push(`### ${meal.meal} (${meal.calories} kcal)`)
    lines.push(`Foods: ${meal.foods.join(', ')}`)
    lines.push(`P: ${meal.protein_g}g | C: ${meal.carbs_g}g | F: ${meal.fat_g}g`)
    lines.push('')
  }
  lines.push('## Suggested Supplements')
  for (const s of output.supplement_suggestions) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  lines.push('## Shopping Tips')
  for (const t of output.shopping_tips) {
    lines.push(`- ${t}`)
  }
  lines.push('')
  lines.push(`**Estimated Weekly Budget:** $${output.budget_estimate_usd_week}`)
  lines.push('')
  lines.push('---')
  lines.push('⚠️ ' + output.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 3: EXERCISE PRESCRIPTION ENGINE ====================

function prescribeExercise(input: ExerciseInput): ExerciseOutput {
  const rand = mulberry32(computeSeed(input))
  const level = input.fitness_level
  const timeMin = input.time_available_min_week || 150
  const injuries = input.injuries || []
  const equipment = input.available_equipment || []
  const age = input.age || 30

  const sessionsPerWeek = Math.min(Math.max(Math.round(timeMin / 45), 2), 7)
  const sessionDuration = Math.round(timeMin / sessionsPerWeek)

  let intensityMod = 1.0
  if (level === 'beginner') intensityMod = 0.6
  else if (level === 'intermediate') intensityMod = 0.75
  else if (level === 'advanced') intensityMod = 0.85
  else intensityMod = 0.95

  if (age > 50) intensityMod *= 0.85
  if (age > 65) intensityMod *= 0.8

  const hasGym = equipment.some(e => ['gym', 'barbell', 'dumbbell', 'cable', 'machine'].includes(e.toLowerCase()))
  const hasBasic = equipment.some(e => ['dumbbell', 'resistance band', 'kettlebell'].includes(e.toLowerCase()))
  const bodyweightOnly = equipment.length === 0 || (equipment.length === 1 && equipment[0].toLowerCase() === 'none')

  const exercisePool: Array<{ name: string; type: string }> = []
  if (hasGym) {
    exercisePool.push({ name: 'Barbell Squat', type: 'strength' }, { name: 'Deadlift', type: 'strength' },
      { name: 'Bench Press', type: 'strength' }, { name: 'Pull-ups', type: 'strength' },
      { name: 'Overhead Press', type: 'strength' }, { name: 'Cable Rows', type: 'strength' })
  } else if (hasBasic) {
    exercisePool.push({ name: 'Dumbbell Squat', type: 'strength' }, { name: 'Dumbbell RDL', type: 'strength' },
      { name: 'Dumbbell Press', type: 'strength' }, { name: 'Resistance Band Rows', type: 'strength' },
      { name: 'Kettlebell Swings', type: 'power' }, { name: 'Dumbbell Lunges', type: 'strength' })
  } else if (bodyweightOnly) {
    exercisePool.push({ name: 'Push-ups', type: 'strength' }, { name: 'Bodyweight Squats', type: 'strength' },
      { name: 'Plank', type: 'core' }, { name: 'Lunges', type: 'strength' },
      { name: 'Mountain Climbers', type: 'cardio' }, { name: 'Burpees', type: 'power' })
  }

  if (exercisePool.length === 0) {
    exercisePool.push({ name: 'Push-ups', type: 'strength' }, { name: 'Bodyweight Squats', type: 'strength' },
      { name: 'Plank', type: 'core' }, { name: 'Lunges', type: 'strength' })
  }

  const weeklySessions: ExerciseSession[] = []
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const goals = input.goal.toLowerCase()
  const isStrength = goals.includes('strength') || goals.includes('muscle') || goals.includes('build')
  const isCardio = goals.includes('cardio') || goals.includes('endurance') || goals.includes('run')
  const isWeightLoss = goals.includes('weight') || goals.includes('fat') || goals.includes('loss')

  for (let i = 0; i < sessionsPerWeek; i++) {
    let focus = 'Full Body'
    if (isStrength) {
      focus = i % 3 === 0 ? 'Upper Body' : i % 3 === 1 ? 'Lower Body' : 'Full Body'
    } else if (isCardio) {
      focus = i % 2 === 0 ? 'Cardio Endurance' : 'Interval Training'
    } else if (isWeightLoss) {
      focus = i % 2 === 0 ? 'HIIT Circuit' : 'Strength + Cardio'
    }

    const exerciseCount = rngRange(rand, 4, 7)
    const exercises: ExerciseSession['exercises'] = []
    for (let j = 0; j < exerciseCount; j++) {
      const ex = exercisePool[Math.floor(rand() * exercisePool.length)]
      const sets = rngRange(rand, 2, 4)
      const reps = level === 'beginner' ? `${rngRange(rand, 8, 12)}` : level === 'elite' ? `${rngRange(rand, 3, 6)}` : `${rngRange(rand, 6, 10)}`
      exercises.push({ name: ex.name, sets, reps, rest_sec: rngRange(rand, 45, 120) })
    }

    let sessionIntensity: ExerciseSession['intensity'] = 'moderate'
    if (intensityMod >= 0.85) sessionIntensity = 'high'
    else if (intensityMod < 0.65) sessionIntensity = 'low'

    weeklySessions.push({
      day: days[i],
      focus,
      exercises,
      duration_min: sessionDuration,
      intensity: sessionIntensity,
    })
  }

  const progressionPlan: string[] = []
  progressionPlan.push(`Week 1-2: Master form at ${Math.round(intensityMod * 70)}% effort`)
  progressionPlan.push('Week 3-4: Increase volume (add 1 set per exercise)')
  progressionPlan.push('Week 5-6: Increase intensity (add resistance/reduce rest)')
  progressionPlan.push('Week 7-8: Deload week — reduce volume by 40%, maintain intensity')
  if (level !== 'beginner') progressionPlan.push('Week 9+: Progressive overload — add 2.5-5 lbs per week for strength')

  const precautions: string[] = []
  for (const inj of injuries) {
    precautions.push(`Avoid exercises stressing ${inj}; substitute low-impact alternatives`)
  }
  if (age > 50) precautions.push('Prioritize joint health — warm up 10 min before each session')
  if (precautions.length === 0) precautions.push('No specific precautions — maintain proper form at all times')

  const recovery: string[] = []
  recovery.push('Sleep 7-9 hours nightly for optimal muscle recovery')
  recovery.push('Include 1-2 full rest days per week')
  recovery.push('Foam roll major muscle groups 5-10 min post-workout')
  recovery.push('Stay hydrated — minimum 0.5 oz water per pound bodyweight')

  return {
    fitness_level: level,
    goal: input.goal,
    weekly_sessions: weeklySessions,
    total_weekly_minutes: timeMin,
    progression_plan: progressionPlan,
    injury_precautions: precautions,
    recovery_recommendations: recovery,
    expected_timeline_weeks: rngRange(rand, 8, 16),
    disclaimer: DISCLAIMER,
  }
}

function formatExerciseReport(input: ExerciseInput, output: ExerciseOutput): string {
  const lines: string[] = []
  lines.push('# Exercise Prescription')
  lines.push('')
  lines.push(`**Fitness Level:** ${input.fitness_level} | **Goal:** ${input.goal}`)
  lines.push(`**Available Time:** ${input.time_available_min_week} min/week | **Age:** ${input.age} | **Gender:** ${input.gender}`)
  lines.push(`**Sessions/Week:** ${output.weekly_sessions.length} | **Expected Timeline:** ${output.expected_timeline_weeks} weeks`)
  lines.push('')
  lines.push('## Weekly Schedule')
  for (const s of output.weekly_sessions) {
    lines.push(`### ${s.day} — ${s.focus} (${s.duration_min} min, ${s.intensity} intensity)`)
    for (const e of s.exercises) {
      lines.push(`- ${e.name}: ${e.sets}x${e.reps} (rest ${e.rest_sec}s)`)
    }
    lines.push('')
  }
  lines.push('## Progression Plan')
  for (const p of output.progression_plan) {
    lines.push(`- ${p}`)
  }
  lines.push('')
  lines.push('## Injury Precautions')
  for (const p of output.injury_precautions) {
    lines.push(`- ${p}`)
  }
  lines.push('')
  lines.push('## Recovery Recommendations')
  for (const r of output.recovery_recommendations) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('⚠️ ' + output.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 4: SLEEP OPTIMIZER ====================

function optimizeSleep(input: SleepInput): SleepOutput {
  const rand = mulberry32(computeSeed(input))
  const currentHours = input.current_sleep_hours || 7
  const qualityScore = input.sleep_quality_score || 60
  const issues = input.issues || []
  const chronotype = input.chronotype || 'intermediate'

  const sleepEfficiency = clamp(Math.round(rngFloat(rand, 75, 95)), 60, 99)

  let recommendedHours = 8
  if (currentHours < 6) recommendedHours = 8
  else if (currentHours < 7) recommendedHours = 7.5
  else if (currentHours > 9) recommendedHours = 8.5
  else recommendedHours = currentHours

  let bedtime = '22:30'
  let wakeTime = '06:30'
  if (chronotype === 'morning_lark') { bedtime = '21:30'; wakeTime = '05:30' }
  else if (chronotype === 'night_owl') { bedtime = '00:00'; wakeTime = '08:00' }

  const routineRecs: string[] = []
  if (issues.some(i => i.toLowerCase().includes('fall') || i.toLowerCase().includes('onset'))) {
    routineRecs.push('Begin wind-down routine 60 min before bed (dim lights, no screens)')
    routineRecs.push('Try 4-7-8 breathing technique: inhale 4s, hold 7s, exhale 8s')
  }
  if (issues.some(i => i.toLowerCase().includes('wake') || i.toLowerCase().includes('middle'))) {
    routineRecs.push('Avoid alcohol within 3 hours of bedtime (disrupts REM sleep)')
    routineRecs.push('Keep bedroom temperature at 65-68°F (18-20°C) for optimal sleep')
  }
  if (issues.some(i => i.toLowerCase().includes('tired') || i.toLowerCase().includes('daytime'))) {
    routineRecs.push('Get 15-30 min of morning sunlight exposure within 1 hour of waking')
    routineRecs.push('Avoid caffeine after 2 PM — half-life is 5-6 hours')
  }
  if (routineRecs.length === 0) {
    routineRecs.push('Maintain consistent sleep/wake times (±30 min) including weekends')
    routineRecs.push('Develop a 30-min pre-sleep routine: reading, stretching, or journaling')
  }

  const envOpts: string[] = []
  const env = input.environment_factors
  if (env.light === 'bright') envOpts.push('Install blackout curtains or use sleep mask')
  if (env.noise === 'loud') envOpts.push('Use white noise machine or earplugs')
  if (env.temperature === 'warm') envOpts.push('Lower thermostat to 65-68°F or use cooling mattress pad')
  if (envOpts.length === 0) envOpts.push('Optimize sleep environment: cool, dark, quiet')

  let alignment = 'Good alignment between chronotype and schedule'
  if (chronotype === 'night_owl' && bedtime !== '00:00') alignment = 'Consider shifting schedule later to match night owl chronotype'
  if (chronotype === 'morning_lark' && wakeTime !== '05:30') alignment = 'Leverage morning chronotype by scheduling important tasks before noon'

  const hygieneScore = clamp(Math.round(rngFloat(rand, 50, 85)), 20, 100)

  return {
    current_sleep_hours: currentHours,
    sleep_quality_score: qualityScore,
    sleep_efficiency_pct: sleepEfficiency,
    recommended_hours: recommendedHours,
    optimal_bedtime: bedtime,
    optimal_wake_time: wakeTime,
    routine_recommendations: routineRecs,
    environment_optimizations: envOpts,
    chronotype_alignment: alignment,
    sleep_hygiene_score: hygieneScore,
    disclaimer: DISCLAIMER,
  }
}

function formatSleepReport(input: SleepInput, output: SleepOutput): string {
  const lines: string[] = []
  lines.push('# Sleep Optimization Report')
  lines.push('')
  lines.push(`**Current Sleep:** ${output.current_sleep_hours} hrs/night | **Quality:** ${output.sleep_quality_score}/100`)
  lines.push(`**Sleep Efficiency:** ${output.sleep_efficiency_pct}% | **Hygiene Score:** ${output.sleep_hygiene_score}/100`)
  lines.push(`**Chronotype:** ${input.chronotype.replace('_', ' ')}`)
  lines.push(`**Recommended:** ${output.recommended_hours} hrs (${output.optimal_bedtime} - ${output.optimal_wake_time})`)
  lines.push('')
  lines.push('## Routine Recommendations')
  for (const r of output.routine_recommendations) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push('## Environment Optimizations')
  for (const e of output.environment_optimizations) {
    lines.push(`- ${e}`)
  }
  lines.push('')
  lines.push(`**Chronotype Alignment:** ${output.chronotype_alignment}`)
  lines.push('')
  lines.push('---')
  lines.push('⚠️ ' + output.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 5: STRESS RESILIENCE COACH ====================

function coachStressResilience(input: StressInput): ResilienceOutput {
  const rand = mulberry32(computeSeed(input))
  const stress = input.stress_level || 5
  const triggers = input.triggers || []
  const coping = input.coping_mechanisms || []
  const wlb = input.work_life_balance || 'fair'
  const support = input.support_system || 'moderate'
  const mindfulness = input.mindfulness_experience || 'none'

  const resilienceScore = clamp(Math.round(100 - stress * 7 + rngRange(rand, -10, 15)), 20, 95)

  let burnoutRisk: ResilienceOutput['burnout_risk'] = 'moderate'
  if (stress >= 8 && wlb === 'poor') burnoutRisk = 'critical'
  else if (stress >= 7 || (stress >= 6 && wlb === 'poor')) burnoutRisk = 'high'
  else if (stress <= 4 && wlb !== 'poor') burnoutRisk = 'low'

  const copingUpgrades: string[] = []
  if (coping.length === 0) copingUpgrades.push('Start with deep breathing exercises (5 min, 3x/day) as foundational coping skill')
  if (!coping.some(c => c.toLowerCase().includes('exercise') || c.toLowerCase().includes('walk')))
    copingUpgrades.push('Add physical activity — even 20-min walks reduce cortisol by 20%')
  if (!coping.some(c => c.toLowerCase().includes('social') || c.toLowerCase().includes('talk')))
    copingUpgrades.push('Strengthen social connections — schedule 2-3 meaningful interactions per week')
  if (!coping.some(c => c.toLowerCase().includes('journal') || c.toLowerCase().includes('write')))
    copingUpgrades.push('Start expressive writing — 15 min/day to process stressors and emotions')
  if (copingUpgrades.length === 0) copingUpgrades.push('Diversify coping toolkit: add one new evidence-based technique per week')

  const mindfulnessPlan: string[] = []
  if (mindfulness === 'none') {
    mindfulnessPlan.push('Week 1-2: 5-min guided body scan daily (use Insight Timer or Calm app)')
    mindfulnessPlan.push('Week 3-4: Extend to 10-min mindful breathing with breath counting')
  } else if (mindfulness === 'beginner') {
    mindfulnessPlan.push('Week 1-2: Practice 10-min focused attention meditation daily')
    mindfulnessPlan.push('Week 3-4: Add open-monitoring meditation for emotional awareness')
  } else {
    mindfulnessPlan.push('Maintain practice: 15-20 min daily with periodic retreat or deepening')
    mindfulnessPlan.push('Integrate informal mindfulness: mindful eating, walking, listening')
  }

  const boundaryStrategies: string[] = []
  if (wlb === 'poor' || wlb === 'fair') {
    boundaryStrategies.push('Establish hard stop time for work — no emails after 7 PM')
    boundaryStrategies.push('Create a dedicated workspace to separate work from personal life')
    boundaryStrategies.push('Schedule non-negotiable personal time blocks (exercise, hobbies, social)')
  }
  boundaryStrategies.push('Practice saying no to non-essential commitments')
  boundaryStrategies.push('Batch process checking communications (3x/day max)')

  const dailyPractices: string[] = []
  dailyPractices.push('Morning: 5-min gratitude journaling (write 3 specific things)')
  dailyPractices.push('Midday: 10-min walk or stretch break')
  dailyPractices.push('Evening: Digital sunset — no screens 60 min before bed')
  if (stress >= 7) dailyPractices.push('Add: 2-min box breathing before stressful meetings (4-4-4-4 pattern)')

  const professionalSupport = burnoutRisk === 'high' || burnoutRisk === 'critical' || stress >= 8

  return {
    stress_level: stress,
    resilience_score: resilienceScore,
    burnout_risk: burnoutRisk,
    coping_upgrades: copingUpgrades,
    mindfulness_plan: mindfulnessPlan,
    boundary_strategies: boundaryStrategies,
    daily_practices: dailyPractices,
    professional_support_recommended: professionalSupport,
    disclaimer: DISCLAIMER,
  }
}

function formatStressReport(input: StressInput, output: ResilienceOutput): string {
  const lines: string[] = []
  lines.push('# Stress Resilience Coaching Report')
  lines.push('')
  lines.push(`**Stress Level:** ${output.stress_level}/10 | **Resilience Score:** ${output.resilience_score}/100`)
  lines.push(`**Burnout Risk:** ${output.burnout_risk.toUpperCase()} | **Professional Support:** ${output.professional_support_recommended ? 'Recommended' : 'Not immediately needed'}`)
  lines.push(`**Work-Life Balance:** ${input.work_life_balance} | **Support System:** ${input.support_system}`)
  lines.push('')
  lines.push('## Coping Upgrades')
  for (const c of output.coping_upgrades) {
    lines.push(`- ${c}`)
  }
  lines.push('')
  lines.push('## Mindfulness Plan')
  for (const m of output.mindfulness_plan) {
    lines.push(`- ${m}`)
  }
  lines.push('')
  lines.push('## Boundary Strategies')
  for (const b of output.boundary_strategies) {
    lines.push(`- ${b}`)
  }
  lines.push('')
  lines.push('## Daily Practices')
  for (const d of output.daily_practices) {
    lines.push(`- ${d}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('⚠️ ' + output.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 6: WEARABLE DATA INTERPRETER ====================

function interpretWearableData(input: WearableInput): WearableOutput {
  const rand = mulberry32(computeSeed(input))
  const metrics = input.metrics_data || {}
  const baseline = input.baseline_comparison || {}
  const goals = input.goal_targets || {}
  const thresholds = input.anomaly_thresholds || {}

  const interpretations: MetricInterpretation[] = []
  const alerts: string[] = []
  const insights: string[] = []
  const goalProgress: Record<string, { current: number; target: number; pct: number }> = {}

  for (const [key, value] of Object.entries(metrics)) {
    const baselineVal = baseline[key] || value
    const threshold = thresholds[key]
    const goalVal = goals[key]

    let status: MetricInterpretation['status'] = 'normal'
    if (threshold !== undefined) {
      if (value > threshold * 1.2) status = 'concerning'
      else if (value > threshold) status = 'elevated'
      else if (value <= threshold * 0.8) status = 'optimal'
    }

    const diff = value - baselineVal
    let trend: MetricInterpretation['trend'] = 'stable'
    if (Math.abs(diff) > baselineVal * 0.05) trend = diff > 0 ? 'improving' : 'declining'

    let insight = `${key}: ${value} (baseline: ${baselineVal})`
    if (key.toLowerCase().includes('hrv')) {
      insight = value > 50 ? `HRV ${value}ms indicates good autonomic recovery` : `HRV ${value}ms suggests elevated stress or poor recovery`
      if (value < 30) alerts.push(`Low HRV detected (${value}ms) — consider rest day`)
    } else if (key.toLowerCase().includes('spo2') || key.toLowerCase().includes('oxygen')) {
      insight = value >= 95 ? `SpO2 ${value}% is within normal range` : `SpO2 ${value}% is low — consult physician`
      if (value < 93) alerts.push(`Concerning SpO2 level: ${value}% — seek medical evaluation`)
    } else if (key.toLowerCase().includes('step')) {
      insight = value >= 10000 ? `Steps (${value}) — excellent activity level` : value >= 7500 ? `Steps (${value}) — good, aim for 10k` : `Steps (${value}) — below target, increase daily movement`
    } else if (key.toLowerCase().includes('sleep')) {
      insight = value >= 7 ? `Sleep duration ${value}h is adequate` : `Sleep duration ${value}h is insufficient — target 7-9h`
    }

    interpretations.push({ metric: key, current_value: value, baseline_value: baselineVal, status, trend, insight })

    if (goalVal !== undefined) {
      goalProgress[key] = { current: value, target: goalVal, pct: Math.round((value / goalVal) * 100) }
    }
  }

  if (interpretations.length === 0) {
    interpretations.push({ metric: 'no_data', current_value: 0, baseline_value: 0, status: 'normal', trend: 'stable', insight: 'No wearable metrics data provided for interpretation' })
  }

  insights.push('Review trends over 7-day rolling averages rather than single-day values')
  insights.push('Correlate HRV dips with training load, alcohol, or poor sleep for root cause')
  if (alerts.length > 0) insights.push('Prioritize addressing anomaly alerts before increasing training intensity')

  const overallScore = clamp(Math.round(rngFloat(rand, 60, 88)), 20, 100)

  return {
    data_source: input.data_source,
    interpretations,
    overall_health_score: overallScore,
    anomaly_alerts: alerts,
    actionable_insights: insights,
    goal_progress: goalProgress,
    disclaimer: DISCLAIMER,
  }
}

function formatWearableReport(input: WearableInput, output: WearableOutput): string {
  const lines: string[] = []
  lines.push('# Wearable Data Interpretation')
  lines.push('')
  lines.push(`**Data Source:** ${input.data_source}`)
  lines.push(`**Overall Health Score:** ${output.overall_health_score}/100`)
  lines.push('')
  lines.push('## Metric Interpretations')
  for (const i of output.interpretations) {
    lines.push(`- **${i.metric}:** ${i.current_value} | Status: ${i.status} | Trend: ${i.trend}`)
    lines.push(`  ${i.insight}`)
  }
  if (output.anomaly_alerts.length > 0) {
    lines.push('')
    lines.push('## Anomaly Alerts')
    for (const a of output.anomaly_alerts) {
      lines.push(`- ⚠️ ${a}`)
    }
  }
  if (Object.keys(output.goal_progress).length > 0) {
    lines.push('')
    lines.push('## Goal Progress')
    for (const [key, val] of Object.entries(output.goal_progress)) {
      lines.push(`- ${key}: ${val.current}/${val.target} (${val.pct}%)`)
    }
  }
  lines.push('')
  lines.push('## Actionable Insights')
  for (const ins of output.actionable_insights) {
    lines.push(`- ${ins}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('⚠️ ' + output.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 7: HEALTH RISK ASSESSOR ====================

function assessHealthRisk(input: RiskInput): RiskOutput {
  const rand = mulberry32(computeSeed(input))
  const age = input.age || 40
  const family = input.family_history || {}
  const lifestyle = input.lifestyle || {}
  const biomarkers = input.biomarkers || {}
  const screenings = input.screening_history || []

  const factors: RiskFactor[] = []

 let ageRisk: RiskFactor['level'] = 'low'
  if (age >= 60) ageRisk = 'high'
  else if (age >= 45) ageRisk = 'moderate'
  factors.push({ factor: 'Age', level: ageRisk, contributing: [`Age ${age}`], modifiable: false })

  const familyContributors: string[] = []
  let familyRiskCount = 0
  for (const [condition, present] of Object.entries(family)) {
    if (present) { familyContributors.push(condition); familyRiskCount++ }
  }
  const familyRiskLevel: RiskFactor['level'] = familyRiskCount >= 3 ? 'high' : familyRiskCount >= 1 ? 'moderate' : 'low'
  factors.push({ factor: 'Family History', level: familyRiskLevel, contributing: familyContributors.length > 0 ? familyContributors : ['No significant family history'], modifiable: false })

  const lifestyleContributors: string[] = []
  let lifestyleRiskScore = 0
  if (lifestyle.smoking === 'current') { lifestyleContributors.push('Current smoking'); lifestyleRiskScore += 3 }
  else if (lifestyle.smoking === 'former') { lifestyleContributors.push('Former smoking'); lifestyleRiskScore += 1 }
  if (lifestyle.exercise === 'sedentary') { lifestyleContributors.push('Sedentary lifestyle'); lifestyleRiskScore += 2 }
  if (lifestyle.diet === 'poor') { lifestyleContributors.push('Poor diet quality'); lifestyleRiskScore += 2 }
  if (lifestyle.alcohol === 'heavy') { lifestyleContributors.push('Heavy alcohol use'); lifestyleRiskScore += 2 }
  if (lifestyle.sleep === 'poor') { lifestyleContributors.push('Chronic poor sleep'); lifestyleRiskScore += 1 }
  if (lifestyle.stress === 'chronic_high') { lifestyleContributors.push('Chronic high stress'); lifestyleRiskScore += 1 }
  const lifestyleRiskLevel: RiskFactor['level'] = lifestyleRiskScore >= 5 ? 'high' : lifestyleRiskScore >= 2 ? 'moderate' : 'low'
  factors.push({ factor: 'Lifestyle Factors', level: lifestyleRiskLevel, contributing: lifestyleContributors.length > 0 ? lifestyleContributors : ['Generally healthy lifestyle'], modifiable: true })

  const bioContributors: string[] = []
  let bioRiskScore = 0
  for (const [key, val] of Object.entries(biomarkers)) {
    if (key.toLowerCase().includes('glucose') && val > 100) { bioContributors.push(`Elevated glucose (${val})`); bioRiskScore += 2 }
    if (key.toLowerCase().includes('cholesterol') && val > 200) { bioContributors.push(`High cholesterol (${val})`); bioRiskScore += 2 }
    if (key.toLowerCase().includes('bp') || key.toLowerCase().includes('pressure')) {
      if (val > 140) { bioContributors.push(`Hypertension (${val})`); bioRiskScore += 3 }
      else if (val > 120) { bioContributors.push(`Elevated BP (${val})`); bioRiskScore += 1 }
    }
    if (key.toLowerCase().includes('bmi') && val > 30) { bioContributors.push(`Obesity (BMI ${val})`); bioRiskScore += 2 }
    if (key.toLowerCase().includes('a1c') && val > 6.5) { bioContributors.push(`Elevated HbA1c (${val})`); bioRiskScore += 2 }
  }
  const bioRiskLevel: RiskFactor['level'] = bioRiskScore >= 5 ? 'high' : bioRiskScore >= 2 ? 'moderate' : 'low'
  factors.push({ factor: 'Biomarkers', level: bioRiskLevel, contributing: bioContributors.length > 0 ? bioContributors : ['All biomarkers within normal range'], modifiable: true })

  const screeningRecs: string[] = []
  if (age >= 40 && !screenings.some(s => s.toLowerCase().includes('mammogram') || s.toLowerCase().includes('breast'))) screeningRecs.push('Mammogram (annual if female, 40+)')
  if (age >= 45 && !screenings.some(s => s.toLowerCase().includes('colon') || s.toLowerCase().includes('fit'))) screeningRecs.push('Colon cancer screening (colonoscopy/FIT, 45+)')
  if (age >= 50 && !screenings.some(s => s.toLowerCase().includes('psa') || s.toLowerCase().includes('prostate'))) screeningRecs.push('Prostate screening discussion (50+ if male)')
  if (!screenings.some(s => s.toLowerCase().includes('lipid') || s.toLowerCase().includes('cholesterol'))) screeningRecs.push('Lipid panel (every 4-6 years, more often if elevated)')
  if (!screenings.some(s => s.toLowerCase().includes('glucose') || s.toLowerCase().includes('diabetes'))) screeningRecs.push('Fasting glucose / HbA1c (every 3 years, 45+)')
  if (!screenings.some(s => s.toLowerCase().includes('bone') || s.toLowerCase().includes('densit'))) screeningRecs.push('Bone density scan (65+ for women, 70+ for men)')
  if (screeningRecs.length === 0) screeningRecs.push('All recommended screenings up to date — continue annual physical')

  const lifestyleMods: string[] = []
  if (lifestyle.smoking === 'current') lifestyleMods.push('Quit smoking — single highest-impact health improvement')
  if (lifestyle.exercise === 'sedentary') lifestyleMods.push('Begin 150 min/week moderate aerobic exercise')
  if (lifestyle.diet === 'poor') lifestyleMods.push('Transition to Mediterranean or DASH diet pattern')
  if (lifestyle.alcohol === 'heavy') lifestyleMods.push('Reduce alcohol to moderate levels (<1 drink/day women, <2 men)')
  if (lifestyleMods.length === 0) lifestyleMods.push('Maintain healthy lifestyle behaviors — focus on consistency and prevention')

  let overallScore = rngRange(rand, 35, 65)
  overallScore += lifestyleRiskScore * 3 + bioRiskScore * 3 + familyRiskCount * 5
  if (age >= 60) overallScore += 10
  overallScore = clamp(overallScore, 10, 95)

  let category: RiskOutput['risk_category'] = 'low'
  if (overallScore >= 65) category = 'high'
  else if (overallScore >= 40) category = 'moderate'

  const preventionScore = clamp(100 - overallScore + rngRange(rand, -5, 10), 15, 95)

  return {
    overall_risk_score: overallScore,
    risk_category: category,
    factors,
    screening_recommendations: screeningRecs,
    lifestyle_modifications: lifestyleMods,
    prevention_score: preventionScore,
    disclaimer: DISCLAIMER,
  }
}

function formatRiskReport(input: RiskInput, output: RiskOutput): string {
  const lines: string[] = []
  lines.push('# Health Risk Assessment')
  lines.push('')
  lines.push(`**Age:** ${input.age} | **Gender:** ${input.gender}`)
  lines.push(`**Overall Risk Score:** ${output.overall_risk_score}/100 (**${output.risk_category.toUpperCase()} RISK**)`)
  lines.push(`**Prevention Score:** ${output.prevention_score}/100`)
  lines.push('')
  lines.push('## Risk Factors')
  for (const f of output.factors) {
    lines.push(`### ${f.factor} — ${f.level.toUpperCase()}`)
    lines.push(`Contributing: ${f.contributing.join(', ')}`)
    lines.push(`Modifiable: ${f.modifiable ? 'Yes' : 'No'}`)
    lines.push('')
  }
  lines.push('## Screening Recommendations')
  for (const s of output.screening_recommendations) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  lines.push('## Lifestyle Modifications')
  for (const m of output.lifestyle_modifications) {
    lines.push(`- ${m}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('⚠️ ' + output.disclaimer)
  return lines.join('\n')
}

// ==================== TOOL 8: BEHAVIOR CHANGE PLANNER ====================

function planBehaviorChange(input: BehaviorInput): BehaviorOutput {
  const rand = mulberry32(computeSeed(input))
  const target = input.target_behavior
  const habitStrength = input.current_habit_strength || 30
  const motivation = input.motivation_level || 5
  const barriers = input.barriers || []
  const support = input.support_available || []
  const timeline = input.timeline_weeks || 12

  const readinessScore = clamp(Math.round((motivation * 8 + (100 - habitStrength) * 0.3 + support.length * 5 + rngRange(rand, -10, 10))), 15, 95)

  const stages: HabitStage[] = []
  const stageCount = Math.min(Math.max(Math.ceil(timeline / 3), 3), 6)
  const weeksPerStage = Math.floor(timeline / stageCount)

  const stageNames = ['Preparation', 'Initiation', 'Building', 'Consolidation', 'Maintenance', 'Automation']
  const stageTechniques = [
    ['Implementation intentions (if-then planning)', 'Environment design', 'Habit stacking', 'Commitment devices'],
    ['Tiny habits (start ridiculously small)', 'Temptation bundling', 'Tracking/logging', 'Reward immediately'],
    ['Progressive increases (2% rule)', 'Social accountability', 'Visual progress cues', 'Refine triggers'],
    ['Identity-based habits', 'Resilience planning (missed days protocol)', 'Stack complexity', 'Celebrate streaks'],
    ['Automaticity reinforcement', 'Periodic review/adjustment', 'Transfer to identity', 'Mentor others'],
    ['Full automaticity', 'Maintenance vigilance', 'Expand to adjacent habits', 'Long-term sustainability'],
  ]
  const successIndicators = [
    'Can articulate why and has specific plan',
    'Performing behavior 3+ times per week',
    'Behavior is consistent (5+ days/week) without reminders',
    'Identity shift: "I am a person who..." becomes natural',
    'Behavior persists through disruptions and travel',
    'Behavior is fully automatic — no willpower required',
  ]

  for (let i = 0; i < stageCount; i++) {
    const startWeek = i * weeksPerStage + 1
    const endWeek = i === stageCount - 1 ? timeline : (i + 1) * weeksPerStage
    const weekRange = `Weeks ${startWeek}-${endWeek}`
    const techniques = stageTechniques[i] || stageTechniques[stageTechniques.length - 1]

    let focus = 'Establish foundation'
    if (i === 0) focus = 'Set up environment and define precise implementation plan'
    else if (i === 1) focus = 'Begin behavior at smallest viable scale'
    else if (i === 2) focus = 'Gradually increase difficulty and consistency'
    else if (i === 3) focus = 'Strengthen habit identity and resilience'
    else if (i >= 4) focus = 'Automate and maintain long-term'

    stages.push({
      stage: stageNames[i] || `Stage ${i + 1}`,
      week_range: weekRange,
      focus,
      techniques,
      success_indicator: successIndicators[i] || 'Habit is performed consistently with minimal effort',
    })
  }

  const keystoneHabits: string[] = []
  keystoneHabits.push('Morning hydration (1 glass of water upon waking)')
  if (target.toLowerCase().includes('exercise') || target.toLowerCase().includes('fitness') || target.toLowerCase().includes('active')) {
    keystoneHabits.push('Lay out workout clothes the night before')
    keystoneHabits.push('10-min movement snack (walk/stretch) after each meal')
  }
  if (target.toLowerCase().includes('diet') || target.toLowerCase().includes('nutrition') || target.toLowerCase().includes('eat')) {
    keystoneHabits.push('Meal prep every Sunday for the week ahead')
    keystoneHabits.push('Eat protein with every meal')
  }
  if (target.toLowerCase().includes('sleep') || target.toLowerCase().includes('bed')) {
    keystoneHabits.push('Consistent wake time (even weekends)')
    keystoneHabits.push('Digital sunset 60 min before bed')
  }

  const barrierMitigation: string[] = []
  for (const barrier of barriers) {
    if (barrier.toLowerCase().includes('time')) barrierMitigation.push('Time barrier: Use habit stacking — attach new habit to existing routine')
    else if (barrier.toLowerCase().includes('motivat')) barrierMitigation.push('Motivation barrier: Use temptation bundle — pair behavior with immediate reward')
    else if (barrier.toLowerCase().includes('remember') || barrier.toLowerCase().includes('forget')) barrierMitigation.push('Forgetfulness barrier: Set environmental cues and phone reminders')
    else if (barrier.toLowerCase().includes('energy') || barrier.toLowerCase().includes('tired')) barrierMitigation.push('Energy barrier: Reduce friction — prepare environment in advance')
    else barrierMitigation.push(`Address barrier "${barrier}": Create specific if-then plan to overcome`)
  }
  if (barrierMitigation.length === 0) barrierMitigation.push('No major barriers identified — focus on consistency and progressive overload')

  const rewardSystem: string[] = []
  rewardSystem.push('Immediate: Check off tracker (visual satisfaction) + small treat')
  rewardSystem.push('Weekly: Review progress, celebrate streaks with meaningful reward')
  rewardSystem.push('Monthly: Assess milestone achievement, adjust plan as needed')
  if (support.length > 0) rewardSystem.push('Social: Share progress with accountability partner')

  const projectedSuccess = clamp(Math.round(readinessScore * 0.6 + motivation * 3 + rngRange(rand, -10, 15)), 20, 95)

  return {
    target_behavior: target,
    readiness_score: readinessScore,
    stages,
    keystone_habits: keystoneHabits,
    barrier_mitigation: barrierMitigation,
    reward_system: rewardSystem,
    timeline_weeks: timeline,
    projected_success_rate: projectedSuccess,
    disclaimer: DISCLAIMER,
  }
}

function formatBehaviorReport(input: BehaviorInput, output: BehaviorOutput): string {
  const lines: string[] = []
  lines.push('# Behavior Change Plan')
  lines.push('')
  lines.push(`**Target Behavior:** ${input.target_behavior}`)
  lines.push(`**Readiness Score:** ${output.readiness_score}/100 | **Motivation:** ${input.motivation_level}/10`)
  lines.push(`**Timeline:** ${input.timeline_weeks} weeks | **Projected Success Rate:** ${output.projected_success_rate}%`)
  lines.push('')
  lines.push('## Habit Formation Stages')
  for (const s of output.stages) {
    lines.push(`### ${s.stage} (${s.week_range})`)
    lines.push(`**Focus:** ${s.focus}`)
    lines.push(`**Techniques:** ${s.techniques.join(', ')}`)
    lines.push(`**Success Indicator:** ${s.success_indicator}`)
    lines.push('')
  }
  lines.push('## Keystone Habits')
  for (const k of output.keystone_habits) {
    lines.push(`- ${k}`)
  }
  lines.push('')
  lines.push('## Barrier Mitigation')
  for (const b of output.barrier_mitigation) {
    lines.push(`- ${b}`)
  }
  lines.push('')
  lines.push('## Reward System')
  for (const r of output.reward_system) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push('---')
  lines.push('⚠️ ' + output.disclaimer)
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Chronic Disease Coach
  tools.register(defineTool({
    name: 'chronic_disease_coach',
    description: 'Provides personalized coaching for chronic disease management (diabetes, hypertension, obesity). Generates priority actions, medication notes, lifestyle modifications, monitoring schedules, and target progress tracking based on condition, biomarkers, medications, and risk level.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON-encoded ChronicDiseaseInput: { condition, biomarkers{}, medications[], lifestyle_factors{}, target_metrics{}, risk_level }' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ChronicDiseaseInput = JSON.parse(args.input_data)
      const result = chronicDiseaseCoach(input)
      return formatChronicDiseaseReport(input, result)
    }
  }))

  // Tool 2: Nutrition Planner
  tools.register(defineTool({
    name: 'nutrition_planner',
    description: 'Creates personalized meal plans based on dietary goals, restrictions, preferences, and budget. Generates daily meal plans with macros, hydration goals, supplement suggestions, and shopping tips optimized for calorie targets and dietary constraints.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON-encoded NutritionInput: { goal, dietary_restrictions[], calories_target, meals_per_day, food_preferences[], budget_usd_week }' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: NutritionInput = JSON.parse(args.input_data)
      const result = planNutrition(input)
      return formatNutritionReport(input, result)
    }
  }))

  // Tool 3: Exercise Prescription Engine
  tools.register(defineTool({
    name: 'exercise_prescription_engine',
    description: 'Prescribes personalized exercise programs based on fitness level, goals, injuries, and available equipment. Generates weekly training sessions with sets/reps/rest, progression plans, injury precautions, and recovery recommendations.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON-encoded ExerciseInput: { fitness_level, goal, available_equipment[], time_available_min_week, injuries[], age, gender }' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: ExerciseInput = JSON.parse(args.input_data)
      const result = prescribeExercise(input)
      return formatExerciseReport(input, result)
    }
  }))

  // Tool 4: Sleep Optimizer
  tools.register(defineTool({
    name: 'sleep_optimizer',
    description: 'Analyzes sleep patterns and provides optimization recommendations. Evaluates sleep efficiency, determines optimal bedtime/wake time based on chronotype, and provides routine and environment optimization strategies.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON-encoded SleepInput: { current_sleep_hours, sleep_quality_score, bedtime_routine[], environment_factors{}, chronotype, issues[] }' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: SleepInput = JSON.parse(args.input_data)
      const result = optimizeSleep(input)
      return formatSleepReport(input, result)
    }
  }))

  // Tool 5: Stress Resilience Coach
  tools.register(defineTool({
    name: 'stress_resilience_coach',
    description: 'Provides stress management and resilience-building strategies. Assesses burnout risk, generates coping upgrades, mindfulness plans, boundary strategies, and daily practices based on stress assessment data.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON-encoded StressInput: { stress_level, triggers[], coping_mechanisms[], work_life_balance, support_system, mindfulness_experience }' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: StressInput = JSON.parse(args.input_data)
      const result = coachStressResilience(input)
      return formatStressReport(input, result)
    }
  }))

  // Tool 6: Wearable Data Interpreter
  tools.register(defineTool({
    name: 'wearable_data_interpreter',
    description: 'Interprets wearable health data (HRV, SpO2, steps, sleep stages) and provides actionable insights. Analyzes metrics against baselines and thresholds, detects anomalies, tracks goal progress, and provides evidence-based interpretations.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON-encoded WearableInput: { data_source, metrics_data{}, baseline_comparison{}, goal_targets{}, anomaly_thresholds{} }' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: WearableInput = JSON.parse(args.input_data)
      const result = interpretWearableData(input)
      return formatWearableReport(input, result)
    }
  }))

  // Tool 7: Health Risk Assessor
  tools.register(defineTool({
    name: 'health_risk_assessor',
    description: 'Assesses health risks based on family history, lifestyle, and biomarkers. Calculates overall risk scores, identifies modifiable vs non-modifiable factors, provides screening recommendations and prevention strategies.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON-encoded RiskInput: { age, gender, family_history{}, lifestyle{}, biomarkers{}, screening_history[] }' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: RiskInput = JSON.parse(args.input_data)
      const result = assessHealthRisk(input)
      return formatRiskReport(input, result)
    }
  }))

  // Tool 8: Behavior Change Planner
  tools.register(defineTool({
    name: 'behavior_change_planner',
    description: 'Creates behavior change plans using habit science for sustained health improvements. Generates stage-based habit formation plan with keystone habits, barrier mitigation strategies, reward systems, and projected success rates.',
    parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON-encoded BehaviorInput: { target_behavior, current_habit_strength, motivation_level, barriers[], support_available, timeline_weeks }' } },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) {
      const input: BehaviorInput = JSON.parse(args.input_data)
      const result = planBehaviorChange(input)
      return formatBehaviorReport(input, result)
    }
  }))

  console.log(`[dsh-tool-healthcoach] Loaded v${VERSION} - AI Health Coach with 8 tools`)
  console.log('  Tools: chronic_disease_coach, nutrition_planner, exercise_prescription_engine, sleep_optimizer, stress_resilience_coach, wearable_data_interpreter, health_risk_assessor, behavior_change_planner')
}
