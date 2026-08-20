/**
 * DSH Intelligent Travel Planner Plugin v0.1.0
 *
 * Smart travel planning toolkit for DeepSeek Harness - itinerary optimization,
 * budget planning, booking strategy, calendar coordination, local discovery,
 * contingency planning, travel document checking, and carbon footprint calculation.
 * Designed for multi-source data coordination across calendars, booking platforms,
 * and travel information services.
 *
 * Features (v0.1.0):
 * - Itinerary Optimizer (route optimization with time allocation and preference matching)
 * - Budget Planner (comprehensive budget breakdown with savings strategies)
 * - Booking Strategist (optimal timing and channel recommendations)
 * - Calendar Coordinator (conflict detection across work and family calendars)
 * - Local Discovery (personalized recommendations with dietary considerations)
 * - Contingency Planner (emergency contacts and alternative arrangements)
 * - Travel Document Checker (visa/passport requirements and expiry alerts)
 * - Carbon Footprint Calculator (emissions quantification and offset suggestions)
 *
 * @module dsh-tool-travelplanner
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-travelplanner'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== UTILITY ====================

/** Generate a deterministic pseudo-random number from a string seed (range: 0-1) */
function seededRandom(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs((Math.sin(hash) * 10000) % 1)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return hash
}

// ==================== TYPES ====================

// --- Tool 1: Itinerary Optimizer ---
interface Destination {
  name: string
  country: string
  duration_days: number
  priority: 'must_visit' | 'nice_to_have' | 'optional'
  best_season: string[]
  avg_daily_cost_usd: number
  travel_time_from_prev_hours: number
  category: 'city' | 'nature' | 'beach' | 'cultural' | 'adventure' | 'relaxation'
}

interface TravelPreferences {
  pace: 'relaxed' | 'moderate' | 'packed'
  interests: string[]
  travel_style: 'luxury' | 'comfort' | 'budget' | 'backpacker'
  avoid: string[]
  must_include: string[]
}

interface TravelConstraints {
  max_budget_usd: number
  fixed_dates: { start: string; end: string } | null
  max_travel_hours_per_day: number
  mobility_requirements: string[]
}

interface ItineraryInput {
  destinations: Destination[]
  duration: number
  preferences: TravelPreferences
  constraints: TravelConstraints
}

interface DayPlan {
  day: number
  date: string
  destination: string
  activities: string[]
  travel_time_hours: number
  estimated_cost_usd: number
  notes: string
}

interface ItineraryResult {
  optimized_route: string[]
  days: DayPlan[]
  total_estimated_cost_usd: number
  total_travel_time_hours: number
  preference_match_score: number
  warnings: string[]
  tips: string[]
}

// --- Tool 2: Budget Planner ---
interface BudgetInput {
  travel_style: 'luxury' | 'comfort' | 'budget' | 'backpacker'
  destinations: string[]
  duration: number
  currency: string
  travelers: number
  include_flights: boolean
}

interface BudgetCategory {
  category: string
  estimated_cost_usd: number
  percentage: number
  range_low: number
  range_high: number
  tips: string[]
}

interface SavingsStrategy {
  strategy: string
  potential_savings_usd: number
  difficulty: 'easy' | 'moderate' | 'hard'
  description: string
}

interface BudgetResult {
  total_estimated_usd: number
  per_person_usd: number
  per_day_usd: number
  breakdown: BudgetCategory[]
  savings_strategies: SavingsStrategy[]
  currency: string
  confidence: 'high' | 'medium' | 'low'
  summary: string
}

// --- Tool 3: Booking Strategist ---
interface BookingInput {
  travel_dates: { departure: string; return: string }
  flexibility_days: number
  loyalty_programs: string[]
  booking_targets: string[]
  trip_type: 'leisure' | 'business' | 'mixed'
  advance_notice_days: number
}

interface BookingTarget {
  target_type: string
  best_booking_window: string
  optimal_day: string
  estimated_savings_percent: number
  recommended_channels: string[]
  price_trend: 'rising' | 'stable' | 'falling' | 'volatile'
  urgency: 'book_now' | 'book_soon' | 'monitor' | 'wait'
  tips: string[]
}

interface BookingStrategyResult {
  targets: BookingTarget[]
  overall_timing_score: number
  loyalty_optimization: string[]
  price_alert_recommendations: string[]
  summary: string
}

// --- Tool 4: Calendar Coordinator ---
interface CalendarInput {
  travel_dates: { departure: string; return: string }
  work_calendar: CalendarEvent[]
  family_calendar: CalendarEvent[]
  delegates: string[]
  importance_threshold: 'low' | 'medium' | 'high'
}

interface CalendarEvent {
  title: string
  date: string
  time: string
  duration_hours: number
  flexibility: 'fixed' | 'reschedulable' | 'delegable' | 'skippable'
  importance: 'critical' | 'high' | 'medium' | 'low'
  type: 'meeting' | 'deadline' | 'event' | 'personal' | 'family'
}

interface CalendarConflict {
  event_title: string
  conflict_date: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  resolution_options: string[]
  recommended_action: string
}

interface CalendarCoordinatorResult {
  conflicts: CalendarConflict[]
  reschedulable_items: string[]
  delegable_items: string[]
  coverage_gaps: string[]
  preparation_checklist: string[]
  auto_reply_template: string
  summary: string
}

// --- Tool 5: Local Discovery ---
interface DiscoveryInput {
  destination: string
  interests: string[]
  dietary_restrictions: string[]
  budget_level: 'splurge' | 'moderate' | 'budget'
  travel_dates: { start: string; end: string }
  group_size: number
  mobility_needs: string[]
}

interface DiscoveryItem {
  name: string
  category: string
  description: string
  estimated_cost: string
  rating: number
  why_recommended: string
  booking_required: boolean
  address_hint: string
  best_time: string
  dietary_friendly: boolean
}

interface DiscoveryResult {
  recommendations: DiscoveryItem[]
  food_spots: DiscoveryItem[]
  hidden_gems: DiscoveryItem[]
  day_trips: DiscoveryItem[]
  local_tips: string[]
  safety_notes: string[]
  summary: string
}

// --- Tool 6: Contingency Planner ---
interface ContingencyInput {
  trip_details: {
    destinations: string[]
    travel_dates: { departure: string; return: string }
    booking_references: string[]
    insurance_policy: string
    emergency_contacts: string[]
  }
  risk_factors: string[]
  traveler_profiles: string[]
  budget_contingency_percent: number
}

interface EmergencyContact {
  service_type: string
  contact_info: string
  available_hours: string
  notes: string
}

interface ContingencyPlan {
  scenario: string
  probability: 'high' | 'medium' | 'low'
  severity: 'critical' | 'high' | 'medium' | 'low'
  immediate_actions: string[]
  backup_options: string[]
  estimated_extra_cost_usd: number
  trigger_condition: string
}

interface ContingencyResult {
  emergency_contacts: EmergencyContact[]
  contingency_plans: ContingencyPlan[]
  insurance_coverage_notes: string[]
  document_backup_checklist: string[]
  communication_plan: string[]
  summary: string
}

// --- Tool 7: Travel Document Checker ---
interface DocumentInput {
  nationality: string
  destinations: string[]
  travel_dates: { departure: string; return: string }
  passport_expiry: string
  existing_visas: string[]
  traveler_age: number
  special_circumstances: string[]
}

interface DocumentRequirement {
  destination: string
  requirement_type: string
  status: 'met' | 'action_needed' | 'not_required' | 'check_required'
  deadline: string
  description: string
  official_link_hint: string
  estimated_processing_days: number
  urgency: 'immediate' | 'soon' | 'monitor' | 'none'
}

interface DocumentResult {
  requirements: DocumentRequirement[]
  passport_status: { valid: boolean; message: string; days_until_expiry: number }
  action_items: string[]
  renewal_recommendations: string[]
  visa_timeline: string[]
  summary: string
}

// --- Tool 8: Carbon Footprint Calculator ---
interface CarbonInput {
  transport_modes: Array<{ mode: string; distance_km: number; passengers: number }>
  accommodation_type: string
  nights: number
  activities: string[]
  include_offset: boolean
}

interface TransportEmission {
  mode: string
  distance_km: number
  co2_kg: number
  percentage: number
  comparison_to_avg: string
}

interface OffsetOption {
  method: string
  cost_usd: number
  co2_offset_kg: number
  credibility: 'high' | 'medium' | 'low'
  description: string
}

interface CarbonResult {
  total_co2_kg: number
  transport_emissions: TransportEmission[]
  accommodation_co2_kg: number
  activities_co2_kg: number
  per_person_co2_kg: number
  offset_options: OffsetOption[]
  reduction_tips: string[]
  comparison_benchmarks: { domestic_avg_kg: number; international_avg_kg: number }
  rating: 'excellent' | 'good' | 'average' | 'high' | 'very_high'
  summary: string
}

// ==================== TOOL 1: ITINERARY OPTIMIZER ====================

function optimizeItinerary(input: ItineraryInput): ItineraryResult {
  const { destinations, duration, preferences, constraints } = input

  if (destinations.length === 0) {
    return {
      optimized_route: [],
      days: [],
      total_estimated_cost_usd: 0,
      total_travel_time_hours: 0,
      preference_match_score: 0,
      warnings: ['No destinations provided'],
      tips: ['Add at least one destination to begin planning'],
    }
  }

  // Sort destinations by priority and travel time (greedy nearest-neighbor)
  const priorityOrder = { must_visit: 0, nice_to_have: 1, optional: 2 }
  const sorted = [...destinations].sort((a, b) => {
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (pDiff !== 0) return pDiff
    return a.travel_time_from_prev_hours - b.travel_time_from_prev_hours
  })

  // Optimize route using nearest-neighbor heuristic
  const optimizedRoute: string[] = []
  const remaining = [...sorted]
  let current = remaining.shift()
  if (current) optimizedRoute.push(current.name)

  while (remaining.length > 0 && current) {
    let nearestIdx = 0
    let nearestTime = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const travelTime = seededRandom(`${current.name}-${remaining[i].name}`) * 8 + 1
      if (travelTime < nearestTime) {
        nearestTime = travelTime
        nearestIdx = i
      }
    }
    current = remaining.splice(nearestIdx, 1)[0]
    optimizedRoute.push(current.name)
  }

  // Allocate days proportionally
  const totalPriorityWeight = sorted.reduce((s, d) => {
    const w = d.priority === 'must_visit' ? 3 : d.priority === 'nice_to_have' ? 2 : 1
    return s + w
  }, 0)

  const paceMultiplier = preferences.pace === 'relaxed' ? 1.3 : preferences.pace === 'packed' ? 0.7 : 1.0
  const days: DayPlan[] = []
  let dayCounter = 1
  let totalCost = 0
  let totalTravelTime = 0
  const warnings: string[] = []
  const tips: string[] = []

  const startDate = constraints.fixed_dates ? new Date(constraints.fixed_dates.start) : new Date()

  for (const dest of sorted) {
    const weight = dest.priority === 'must_visit' ? 3 : dest.priority === 'nice_to_have' ? 2 : 1
    const allocatedDays = Math.max(1, Math.round((weight / totalPriorityWeight) * duration * paceMultiplier))
    const travelTime = Math.round(dest.travel_time_from_prev_hours * 10) / 10
    totalTravelTime += travelTime

    for (let d = 0; d < allocatedDays && dayCounter <= duration; d++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + dayCounter - 1)
      const dailyCost = dest.avg_daily_cost_usd * (preferences.travel_style === 'luxury' ? 2 : preferences.travel_style === 'budget' ? 0.5 : preferences.travel_style === 'backpacker' ? 0.3 : 1)

      const activities: string[] = []
      if (d === 0) activities.push(`Arrive at ${dest.name}`, 'Check-in and settle')
      if (dest.category === 'city') activities.push('City exploration', 'Museum visit', 'Local cuisine experience')
      else if (dest.category === 'nature') activities.push('Nature hike', 'Scenic viewpoints', 'Wildlife spotting')
      else if (dest.category === 'beach') activities.push('Beach time', 'Water sports', 'Sunset viewing')
      else if (dest.category === 'cultural') activities.push('Historical sites', 'Cultural performance', 'Local artisan market')
      else if (dest.category === 'adventure') activities.push('Adventure activity', 'Guided expedition', 'Photography session')
      else activities.push('Spa/wellness', 'Leisurely stroll', 'Sunset viewing')

      if (preferences.interests.includes('food')) activities.push('Food tour / cooking class')
      if (preferences.interests.includes('photography')) activities.push('Photography golden hour session')
      if (preferences.interests.includes('shopping')) activities.push('Souvenir shopping')

      days.push({
        day: dayCounter,
        date: currentDate.toISOString().split('T')[0],
        destination: dest.name,
        activities,
        travel_time_hours: d === 0 ? travelTime : 0,
        estimated_cost_usd: Math.round(dailyCost),
        notes: dest.priority === 'must_visit' ? 'Priority destination' : 'Flexible timing',
      })

      totalCost += dailyCost
      dayCounter++
    }
  }

  // Check constraints
  if (constraints.max_budget_usd && totalCost > constraints.max_budget_usd) {
    warnings.push(`Estimated cost $${Math.round(totalCost)} exceeds budget $${constraints.max_budget_usd}`)
    tips.push('Consider reducing duration or choosing budget accommodations')
  }
  if (totalTravelTime > constraints.max_travel_hours_per_day * duration) {
    warnings.push('High travel time relative to trip duration')
    tips.push('Consider fewer destinations or closer locations')
  }
  if (preferences.pace === 'packed' && duration < 7) {
    tips.push('Packed pace on short trip — consider relaxed pace for better experience')
  }

  // Preference match score
  const interestMatches = destinations.filter(d =>
    preferences.interests.some(i => d.category.includes(i) || d.name.toLowerCase().includes(i.toLowerCase()))
  ).length
  const matchScore = clamp((interestMatches / destinations.length) * 100, 10, 98)

  return {
    optimized_route: optimizedRoute,
    days,
    total_estimated_cost_usd: Math.round(totalCost),
    total_travel_time_hours: Math.round(totalTravelTime * 10) / 10,
    preference_match_score: Math.round(matchScore),
    warnings,
    tips: tips.length > 0 ? tips : ['Book accommodations early for best rates', 'Download offline maps', 'Notify bank of travel dates'],
  }
}

function formatItineraryReport(result: ItineraryResult): string {
  const lines: string[] = []

  lines.push('## Itinerary Optimization Result')
  lines.push('')
  lines.push(`Route: ${result.optimized_route.join(' → ')}`)
  lines.push(`Preference Match: ${result.preference_match_score}% | Total Cost: $${result.total_estimated_cost_usd} | Travel Time: ${result.total_travel_time_hours}h`)
  lines.push('')

  if (result.days.length > 0) {
    lines.push('### Day-by-Day Plan')
    lines.push('| Day | Date | Destination | Activities | Cost |')
    lines.push('|-----|------|-------------|------------|------|')
    for (const day of result.days) {
      lines.push(`| ${day.day} | ${day.date} | ${day.destination} | ${day.activities.slice(0, 3).join(', ')} | $${day.estimated_cost_usd} |`)
    }
    lines.push('')
  }

  if (result.warnings.length > 0) {
    lines.push('### Warnings')
    for (const w of result.warnings) {
      lines.push(`- ${w}`)
    }
    lines.push('')
  }

  if (result.tips.length > 0) {
    lines.push('### Tips')
    for (const t of result.tips) {
      lines.push(`- ${t}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: BUDGET PLANNER ====================

function planBudget(input: BudgetInput): BudgetResult {
  const { travel_style, destinations, duration, currency, travelers, include_flights } = input

  const styleMultiplier = travel_style === 'luxury' ? 3.0 : travel_style === 'comfort' ? 1.5 : travel_style === 'budget' ? 0.6 : 0.35
  const baseDailyCost = 80 * styleMultiplier
  const flightCost = include_flights ? 600 * styleMultiplier * (destinations.length > 2 ? 1.5 : 1) : 0

  const breakdown: BudgetCategory[] = []
  const accommodationCost = baseDailyCost * 0.35 * duration
  const foodCost = baseDailyCost * 0.25 * duration
  const transportCost = baseDailyCost * 0.15 * duration
  const activitiesCost = baseDailyCost * 0.15 * duration
  const miscCost = baseDailyCost * 0.10 * duration

  breakdown.push({
    category: 'Accommodation',
    estimated_cost_usd: Math.round(accommodationCost),
    percentage: 35,
    range_low: Math.round(accommodationCost * 0.7),
    range_high: Math.round(accommodationCost * 1.5),
    tips: ['Book 2-3 months ahead for best rates', 'Consider vacation rentals for groups', 'Check for loyalty discounts'],
  })
  breakdown.push({
    category: 'Food & Dining',
    estimated_cost_usd: Math.round(foodCost),
    percentage: 25,
    range_low: Math.round(foodCost * 0.6),
    range_high: Math.round(foodCost * 1.8),
    tips: ['Eat where locals eat for value', 'Book accommodations with breakfast included', 'Visit local markets for snacks'],
  })
  breakdown.push({
    category: 'Local Transport',
    estimated_cost_usd: Math.round(transportCost),
    percentage: 15,
    range_low: Math.round(transportCost * 0.5),
    range_high: Math.round(transportCost * 2),
    tips: ['Use public transit passes', 'Walk when possible for experience', 'Book trains early for discounts'],
  })
  breakdown.push({
    category: 'Activities & Experiences',
    estimated_cost_usd: Math.round(activitiesCost),
    percentage: 15,
    range_low: Math.round(activitiesCost * 0.4),
    range_high: Math.round(activitiesCost * 2.5),
    tips: ['Free walking tours available', 'City passes for multiple attractions', 'Book skip-the-line tickets online'],
  })
  breakdown.push({
    category: 'Miscellaneous',
    estimated_cost_usd: Math.round(miscCost),
    percentage: 10,
    range_low: Math.round(miscCost * 0.5),
    range_high: Math.round(miscCost * 3),
    tips: ['Travel insurance is essential', 'Budget for souvenirs', 'Keep emergency fund separate'],
  })

  if (include_flights) {
    breakdown.unshift({
      category: 'Flights',
      estimated_cost_usd: Math.round(flightCost),
      percentage: 0,
      range_low: Math.round(flightCost * 0.6),
      range_high: Math.round(flightCost * 1.8),
      tips: ['Use flight comparison tools', 'Be flexible with dates for savings', 'Set price alerts 6-8 weeks ahead'],
    })
  }

  const totalEstimated = breakdown.reduce((s, b) => s + b.estimated_cost_usd, 0)

  // Savings strategies
  const savingsStrategies: SavingsStrategy[] = [
    { strategy: 'Travel off-peak', potential_savings_usd: Math.round(totalEstimated * 0.25), difficulty: 'easy', description: 'Shift dates by 2-4 weeks to avoid peak season pricing' },
    { strategy: 'Accommodation alternatives', potential_savings_usd: Math.round(accommodationCost * 0.3), difficulty: 'easy', description: 'Use vacation rentals, hostels, or house-sitting instead of hotels' },
    { strategy: 'Public transit passes', potential_savings_usd: Math.round(transportCost * 0.4), difficulty: 'easy', description: 'Multi-day transit passes offer 40-60% savings vs single tickets' },
    { strategy: 'Meal planning', potential_savings_usd: Math.round(foodCost * 0.3), difficulty: 'moderate', description: 'Self-cater some meals, lunch specials, street food exploration' },
    { strategy: 'Flight hacking', potential_savings_usd: Math.round(flightCost * 0.35), difficulty: 'hard', description: 'Use miles, error fares, positioning flights, and flexible routing' },
    { strategy: 'Group discounts', potential_savings_usd: Math.round(activitiesCost * 0.2), difficulty: 'easy', description: 'Group rates for tours and activities when traveling with 4+ people' },
  ]

  const confidence: 'high' | 'medium' | 'low' = destinations.length <= 3 && duration <= 14 ? 'high' : destinations.length <= 5 ? 'medium' : 'low'

  return {
    total_estimated_usd: totalEstimated,
    per_person_usd: Math.round(totalEstimated / travelers),
    per_day_usd: Math.round(totalEstimated / duration),
    breakdown,
    savings_strategies: savingsStrategies,
    currency,
    confidence,
    summary: `${duration}-day trip to ${destinations.join(', ')} for ${travelers} traveler(s) | Estimated: $${totalEstimated} (${travel_style} style) | Confidence: ${confidence}`,
  }
}

function formatBudgetReport(result: BudgetResult): string {
  const lines: string[] = []

  lines.push('## Budget Planning Result')
  lines.push('')
  lines.push(`Total: $${result.total_estimated_usd} | Per Person: $${result.per_person_usd} | Per Day: $${result.per_day_usd} | Currency: ${result.currency}`)
  lines.push(`Confidence: ${result.confidence.toUpperCase()}`)
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  lines.push('### Budget Breakdown')
  lines.push('| Category | Cost | % | Range |')
  lines.push('|----------|------|---|-------|')
  for (const cat of result.breakdown) {
    lines.push(`| ${cat.category} | $${cat.estimated_cost_usd} | ${cat.percentage || '-'}% | $${cat.range_low} - $${cat.range_high} |`)
  }
  lines.push('')

  lines.push('### Savings Strategies')
  lines.push('| Strategy | Savings | Difficulty | Description |')
  lines.push('|----------|---------|------------|-------------|')
  for (const strat of result.savings_strategies) {
    lines.push(`| ${strat.strategy} | $${strat.potential_savings_usd} | ${strat.difficulty.toUpperCase()} | ${strat.description} |`)
  }
  lines.push('')

  lines.push('### Money-Saving Tips')
  for (const cat of result.breakdown) {
    for (const tip of cat.tips.slice(0, 2)) {
      lines.push(`- ${tip}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: BOOKING STRATEGIST ====================

function developBookingStrategy(input: BookingInput): BookingStrategyResult {
  const { travel_dates, flexibility_days, loyalty_programs, booking_targets, trip_type, advance_notice_days } = input

  const targets: BookingTarget[] = []
  const defaultTargets = booking_targets.length > 0 ? booking_targets : ['flights', 'accommodation', 'car_rental', 'activities']

  for (const target of defaultTargets) {
    const seed = `${target}-${travel_dates.departure}`
    const savingsPercent = Math.round(seededRandom(seed) * 30 + 5)
    const urgencyRoll = seededRandom(`${seed}-urgency`)

    let urgency: 'book_now' | 'book_soon' | 'monitor' | 'wait' = 'monitor'
    if (advance_notice_days < 14) urgency = 'book_now'
    else if (advance_notice_days < 45) urgency = 'book_soon'
    else if (advance_notice_days < 90) urgency = 'monitor'
    else urgency = 'wait'

    const priceTrends: Array<'rising' | 'stable' | 'falling' | 'volatile'> = ['rising', 'stable', 'falling', 'volatile']
    const priceTrend = priceTrends[Math.floor(seededRandom(`${seed}-trend`) * 4)]

    const channels: string[] = []
    if (target === 'flights') channels.push('Google Flights', 'Skyscanner', 'Airline direct', 'Kayak')
    else if (target === 'accommodation') channels.push('Booking.com', 'Airbnb', 'Hotel direct', 'Agoda')
    else if (target === 'car_rental') channels.push('Rentalcars.com', 'AutoSlash', 'Direct rental', 'Turo')
    else channels.push('GetYourGuide', 'Viator', 'Direct booking', 'Klook')

    const tips: string[] = []
    if (target === 'flights') {
      tips.push('Book 6-8 weeks ahead for domestic, 2-3 months for international')
      tips.push('Tuesday/Wednesday departures often cheaper')
      if (flexibility_days > 2) tips.push('Use flexible date search for up to 30% savings')
    } else if (target === 'accommodation') {
      tips.push('Book refundable rates first, monitor for price drops')
      tips.push('Check for last-minute deals 3-7 days before arrival')
    }

    targets.push({
      target_type: target,
      best_booking_window: target === 'flights' ? '6-8 weeks ahead' : target === 'accommodation' ? '4-6 weeks ahead' : '2-4 weeks ahead',
      optimal_day: target === 'flights' ? 'Tuesday 6-8 AM' : 'Any weekday',
      estimated_savings_percent: savingsPercent,
      recommended_channels: channels,
      price_trend: priceTrend,
      urgency,
      tips,
    })
  }

  // Loyalty optimization
  const loyaltyOpt: string[] = []
  if (loyalty_programs.length > 0) {
    for (const program of loyalty_programs) {
      loyaltyOpt.push(`Check ${program} points/miles redemption value before booking paid rates`)
    }
    loyaltyOpt.push('Stack loyalty discounts with credit card travel benefits')
    loyaltyOpt.push('Check for status-matched promotions across programs')
  } else {
    loyaltyOpt.push('Consider joining loyalty programs for your most-used airlines/hotels')
    loyaltyOpt.push('Travel credit cards offer points earning on all bookings')
  }

  // Price alerts
  const priceAlerts: string[] = []
  if (advance_notice_days > 30) {
    priceAlerts.push('Set price alerts now — monitor for 2-3 weeks before booking')
    priceAlerts.push('Use Google Flights price tracking for flight targets')
  }
  priceAlerts.push('Check for price drop guarantees and best-price policies')

  const timingScore = clamp(advance_notice_days / 90 * 100, 20, 95)

  return {
    targets,
    overall_timing_score: Math.round(timingScore),
    loyalty_optimization: loyaltyOpt,
    price_alert_recommendations: priceAlerts,
    summary: `Booking strategy for ${trip_type} trip | ${targets.length} targets | Timing score: ${Math.round(timingScore)}% | Advance notice: ${advance_notice_days} days`,
  }
}

function formatBookingStrategyReport(result: BookingStrategyResult): string {
  const lines: string[] = []

  lines.push('## Booking Strategy Result')
  lines.push('')
  lines.push(`Timing Score: ${result.overall_timing_score}% | Targets: ${result.targets.length}`)
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  lines.push('### Booking Targets')
  for (const target of result.targets) {
    const urgencyIcon = target.urgency === 'book_now' ? '[BOOK NOW]' : target.urgency === 'book_soon' ? '[BOOK SOON]' : target.urgency === 'monitor' ? '[MONITOR]' : '[WAIT]'
    lines.push(`#### ${target.target_type.toUpperCase()} ${urgencyIcon}`)
    lines.push(`| Field | Value |`)
    lines.push(`|-------|-------|`)
    lines.push(`| Best Window | ${target.best_booking_window} |`)
    lines.push(`| Optimal Day | ${target.optimal_day} |`)
    lines.push(`| Est. Savings | ${target.estimated_savings_percent}% |`)
    lines.push(`| Price Trend | ${target.price_trend.toUpperCase()} |`)
    lines.push(`| Channels | ${target.recommended_channels.join(', ')} |`)
    lines.push('')
    if (target.tips.length > 0) {
      for (const tip of target.tips) {
        lines.push(`- ${tip}`)
      }
      lines.push('')
    }
  }

  if (result.loyalty_optimization.length > 0) {
    lines.push('### Loyalty Optimization')
    for (const opt of result.loyalty_optimization) {
      lines.push(`- ${opt}`)
    }
    lines.push('')
  }

  if (result.price_alert_recommendations.length > 0) {
    lines.push('### Price Alert Recommendations')
    for (const alert of result.price_alert_recommendations) {
      lines.push(`- ${alert}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: CALENDAR COORDINATOR ====================

function coordinateCalendar(input: CalendarInput): CalendarCoordinatorResult {
  const { travel_dates, work_calendar, family_calendar, delegates, importance_threshold } = input

  const conflicts: CalendarConflict[] = []
  const reschedulable: string[] = []
  const delegable: string[] = []
  const coverageGaps: string[] = []
  const prepChecklist: string[] = []

  const depDate = new Date(travel_dates.departure)
  const retDate = new Date(travel_dates.return)

  // Check work calendar conflicts
  for (const event of work_calendar) {
    const eventDate = new Date(event.date)
    if (eventDate >= depDate && eventDate <= retDate) {
      const severity = event.importance === 'critical' ? 'critical' : event.importance === 'high' ? 'high' : event.importance === 'medium' ? 'medium' : 'low'

      if (severity === 'critical' || (severity === 'high' && importance_threshold !== 'low')) {
        const resolutionOptions: string[] = []
        if (event.flexibility === 'reschedulable') {
          resolutionOptions.push(`Reschedule to before ${travel_dates.departure} or after ${travel_dates.return}`)
          reschedulable.push(event.title)
        }
        if (event.flexibility === 'delegable' && delegates.length > 0) {
          resolutionOptions.push(`Delegate to ${delegates.join(' or ')}`)
          delegable.push(event.title)
        }
        if (event.flexibility === 'skippable') {
          resolutionOptions.push('Skip — non-essential during travel period')
        }
        resolutionOptions.push('Join remotely if possible')
        resolutionOptions.push('Request recording/summary for later review')

        conflicts.push({
          event_title: event.title,
          conflict_date: event.date,
          severity,
          resolution_options: resolutionOptions,
          recommended_action: resolutionOptions[0],
        })
      }
    }
  }

  // Check family calendar conflicts
  for (const event of family_calendar) {
    const eventDate = new Date(event.date)
    if (eventDate >= depDate && eventDate <= retDate) {
      if (event.importance === 'critical' || event.type === 'family') {
        conflicts.push({
          event_title: event.title,
          conflict_date: event.date,
          severity: event.importance === 'critical' ? 'critical' : 'medium',
          resolution_options: [
            'Adjust travel dates to accommodate',
            'Arrange family coverage',
            'Plan return for this specific event',
          ],
          recommended_action: event.importance === 'critical' ? 'Adjust travel dates' : 'Arrange family coverage',
        })
      }
    }
  }

  // Coverage gaps
  if (delegable.length > 0) {
    coverageGaps.push(`${delegable.length} work item(s) to delegate — brief ${delegates.join(', ')} before departure`)
  }
  if (work_calendar.filter(e => {
    const d = new Date(e.date)
    return d >= depDate && d <= retDate && e.importance === 'critical'
  }).length > 0) {
    coverageGaps.push('Critical work events during travel — ensure escalation path is defined')
  }

  // Preparation checklist
  prepChecklist.push('Set out-of-office auto-reply')
  prepChecklist.push('Brief delegates on handover items')
  prepChecklist.push('Set up emergency contact protocol for critical issues')
  prepChecklist.push('Download offline documents needed during travel')
  prepChecklist.push('Configure email filters and forwarding rules')
  if (conflicts.length > 3) {
    prepChecklist.push('Schedule pre-trip alignment meeting with team')
  }

  // Auto-reply template
  const autoReply = `I am out of the office from ${travel_dates.departure} to ${travel_dates.return} with limited access to email. For urgent matters, please contact ${delegates.length > 0 ? delegates.join(' or ') : '[delegate name]'}. I will respond to non-urgent messages upon my return.`

  const summary = `${conflicts.length} conflict(s) detected | ${reschedulable.length} reschedulable | ${delegable.length} delegable | ${coverageGaps.length} coverage gap(s)`

  return {
    conflicts: conflicts.sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      return sevOrder[a.severity] - sevOrder[b.severity]
    }),
    reschedulable_items: reschedulable,
    delegable_items: delegable,
    coverage_gaps: coverageGaps,
    preparation_checklist: prepChecklist,
    auto_reply_template: autoReply,
    summary,
  }
}

function formatCalendarReport(result: CalendarCoordinatorResult): string {
  const lines: string[] = []

  lines.push('## Calendar Coordination Result')
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  if (result.conflicts.length > 0) {
    lines.push('### Conflicts Detected')
    lines.push('| # | Event | Date | Severity | Recommended Action |')
    lines.push('|---|-------|------|----------|-------------------|')
    let idx = 1
    for (const c of result.conflicts) {
      const sevTag = c.severity === 'critical' ? 'CRITICAL' : c.severity === 'high' ? 'HIGH' : c.severity === 'medium' ? 'MEDIUM' : 'LOW'
      lines.push(`| ${idx} | ${c.event_title} | ${c.conflict_date} | ${sevTag} | ${c.recommended_action} |`)
      idx++
    }
    lines.push('')
  }

  if (result.reschedulable_items.length > 0) {
    lines.push('### Reschedulable Items')
    for (const item of result.reschedulable_items) {
      lines.push(`- ${item}`)
    }
    lines.push('')
  }

  if (result.delegable_items.length > 0) {
    lines.push('### Delegable Items')
    for (const item of result.delegable_items) {
      lines.push(`- ${item}`)
    }
    lines.push('')
  }

  if (result.coverage_gaps.length > 0) {
    lines.push('### Coverage Gaps')
    for (const gap of result.coverage_gaps) {
      lines.push(`- ${gap}`)
    }
    lines.push('')
  }

  lines.push('### Preparation Checklist')
  for (const item of result.preparation_checklist) {
    lines.push(`- [ ] ${item}`)
  }
  lines.push('')

  lines.push('### Auto-Reply Template')
  lines.push(`> ${result.auto_reply_template}`)

  return lines.join('\n')
}

// ==================== TOOL 5: LOCAL DISCOVERY ====================

function discoverLocal(input: DiscoveryInput): DiscoveryResult {
  const { destination, interests, dietary_restrictions, budget_level, group_size, mobility_needs } = input

  const recommendations: DiscoveryItem[] = []
  const foodSpots: DiscoveryItem[] = []
  const hiddenGems: DiscoveryItem[] = []
  const dayTrips: DiscoveryItem[] = []
  const localTips: string[] = []
  const safetyNotes: string[] = []

  const seed = `${destination}-${interests.join(',')}`

  // Generate recommendations based on interests
  const interestTemplates: Record<string, DiscoveryItem[]> = {
    food: [
      { name: `${destination} Night Market`, category: 'Food', description: 'Authentic street food experience with local vendors', estimated_cost: '$5-15', rating: 4.5, why_recommended: 'Local food culture immersion', booking_required: false, address_hint: 'City center, near main square', best_time: 'Evening 6-10 PM', dietary_friendly: true },
      { name: `Traditional Cooking Class`, category: 'Experience', description: 'Learn to cook regional specialties with a local chef', estimated_cost: '$30-60', rating: 4.7, why_recommended: 'Hands-on cultural experience', booking_required: true, address_hint: 'Local family home or cooking school', best_time: 'Morning sessions available', dietary_friendly: true },
    ],
    culture: [
      { name: `${destination} Heritage Museum`, category: 'Culture', description: 'Comprehensive history and art collection', estimated_cost: '$5-20', rating: 4.3, why_recommended: 'Essential cultural context', booking_required: false, address_hint: 'Historic district', best_time: 'Weekday mornings (less crowded)', dietary_friendly: true },
      { name: `Traditional Performance`, category: 'Entertainment', description: 'Local music, dance, or theater performance', estimated_cost: '$15-50', rating: 4.6, why_recommended: 'Authentic cultural expression', booking_required: true, address_hint: 'Cultural center or theater district', best_time: 'Evening shows 7-9 PM', dietary_friendly: true },
    ],
    nature: [
      { name: `${destination} Nature Reserve`, category: 'Nature', description: 'Protected natural area with hiking trails', estimated_cost: '$0-10', rating: 4.8, why_recommended: 'Best natural scenery in the region', booking_required: false, address_hint: 'City outskirts, accessible by bus', best_time: 'Early morning for wildlife', dietary_friendly: true },
      { name: `Scenic Viewpoint`, category: 'Sightseeing', description: 'Panoramic views of the surrounding landscape', estimated_cost: 'Free', rating: 4.4, why_recommended: 'Instagram-worthy photo spot', booking_required: false, address_hint: 'Hilltop or waterfront area', best_time: 'Sunrise or sunset', dietary_friendly: true },
    ],
    adventure: [
      { name: `Guided Adventure Tour`, category: 'Adventure', description: 'Expert-led outdoor activity (hiking, kayaking, etc.)', estimated_cost: '$40-100', rating: 4.7, why_recommended: 'Safe adventure with local expertise', booking_required: true, address_hint: 'Tour operator in city center', best_time: 'Morning departures', dietary_friendly: true },
    ],
    shopping: [
      { name: `${destination} Artisan Market`, category: 'Shopping', description: 'Handmade crafts and local products', estimated_cost: '$5-50', rating: 4.2, why_recommended: 'Unique souvenirs direct from makers', booking_required: false, address_hint: 'Old town or market district', best_time: 'Weekend mornings', dietary_friendly: true },
    ],
  }

  for (const interest of interests) {
    const templates = interestTemplates[interest.toLowerCase()]
    if (templates) {
      for (const t of templates) {
        const item = { ...t, rating: clamp(t.rating + (seededRandom(`${seed}-${t.name}`) - 0.5) * 0.4, 3.5, 5.0) }
        recommendations.push(item)
      }
    }
  }

  // Food spots
  const foodTemplates: DiscoveryItem[] = [
    { name: `Local Breakfast Spot`, category: 'Food', description: 'Traditional morning meal where locals start their day', estimated_cost: '$3-8', rating: 4.6, why_recommended: 'Authentic local breakfast experience', booking_required: false, address_hint: 'Residential neighborhoods', best_time: '7-9 AM', dietary_friendly: true },
    { name: `Rooftop Restaurant`, category: 'Dining', description: 'Scenic dining with city views', estimated_cost: '$20-50', rating: 4.4, why_recommended: 'Special occasion dining with atmosphere', booking_required: true, address_hint: 'Hotel district or city center', best_time: 'Sunset dinner', dietary_friendly: false },
    { name: `Street Food Alley`, category: 'Food', description: 'Concentrated street food vendors with variety', estimated_cost: '$2-10', rating: 4.5, why_recommended: 'Budget-friendly authentic flavors', booking_required: false, address_hint: 'Near main market area', best_time: 'Lunch or evening', dietary_friendly: true },
  ]

  for (const ft of foodTemplates) {
    const item = { ...ft, rating: clamp(ft.rating + (seededRandom(`${seed}-${ft.name}`) - 0.5) * 0.3, 3.5, 5.0) }
    if (dietary_restrictions.length > 0) {
      item.dietary_friendly = !dietary_restrictions.some(r => r.toLowerCase() === 'none')
      if (item.dietary_friendly) {
        item.description += ` | Accommodates: ${dietary_restrictions.join(', ')}`
      }
    }
    foodSpots.push(item)
  }

  // Hidden gems
  hiddenGems.push(
    { name: `Secret Garden Cafe`, category: 'Hidden Gem', description: 'Secluded courtyard cafe known only to locals', estimated_cost: '$5-12', rating: 4.8, why_recommended: 'Escape tourist crowds, peaceful atmosphere', booking_required: false, address_hint: 'Look for unmarked door in old quarter', best_time: 'Afternoon tea time', dietary_friendly: true },
    { name: `Sunset Point Local Secret`, category: 'Hidden Gem', description: 'Non-touristy viewpoint popular with residents', estimated_cost: 'Free', rating: 4.7, why_recommended: 'Best views without the crowds', booking_required: false, address_hint: 'Ask locals for directions', best_time: '30 minutes before sunset', dietary_friendly: true },
  )

  // Day trips
  dayTrips.push(
    { name: `Nearby Village Excursion`, category: 'Day Trip', description: 'Traditional village experience outside the city', estimated_cost: '$20-40', rating: 4.5, why_recommended: 'Rural culture and scenic landscapes', booking_required: false, address_hint: 'Bus station, 1-2 hours from city', best_time: 'Full day trip', dietary_friendly: true },
    { name: `Coastal/Countryside Tour`, category: 'Day Trip', description: 'Scenic route through surrounding countryside', estimated_cost: '$30-60', rating: 4.6, why_recommended: 'Diverse landscapes in one day', booking_required: true, address_hint: 'Tour departs from city center', best_time: 'Early morning departure', dietary_friendly: true },
  )

  // Local tips
  localTips.push('Learn 3-5 basic phrases in the local language — locals appreciate the effort')
  localTips.push('Carry small bills for markets and street vendors — many dont accept cards')
  localTips.push('Ask hotel staff for their personal favorites — best insider recommendations')
  localTips.push('Visit popular spots during off-peak hours for better experience')
  if (budget_level === 'budget') localTips.push('Lunch specials at dinner restaurants offer 30-50% savings')

  // Safety notes
  safetyNotes.push('Keep digital copies of important documents in cloud storage')
  safetyNotes.push('Know the local emergency number (not all countries use 911/112)')
  safetyNotes.push('Be cautious with street food if you have sensitive stomach — observe vendor hygiene')
  if (mobility_needs.length > 0) safetyNotes.push(`Research accessibility at each destination: ${mobility_needs.join(', ')}`)

  return {
    recommendations: recommendations.slice(0, 8),
    food_spots: foodSpots,
    hidden_gems: hiddenGems,
    day_trips: dayTrips,
    local_tips: localTips,
    safety_notes: safetyNotes,
    summary: `${recommendations.length} recommendations for ${destination} | ${foodSpots.length} food spots | ${hiddenGems.length} hidden gems | ${dayTrips.length} day trips`,
  }
}

function formatDiscoveryReport(result: DiscoveryResult): string {
  const lines: string[] = []

  lines.push('## Local Discovery Result')
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  if (result.recommendations.length > 0) {
    lines.push('### Top Recommendations')
    lines.push('| Name | Category | Cost | Rating | Why |')
    lines.push('|------|----------|------|--------|-----|')
    for (const r of result.recommendations) {
      lines.push(`| ${r.name} | ${r.category} | ${r.estimated_cost} | ${r.rating.toFixed(1)} | ${r.why_recommended} |`)
    }
    lines.push('')
  }

  if (result.food_spots.length > 0) {
    lines.push('### Food Spots')
    lines.push('| Name | Cost | Rating | Best Time | Dietary Friendly |')
    lines.push('|------|------|--------|-----------|-----------------|')
    for (const f of result.food_spots) {
      lines.push(`| ${f.name} | ${f.estimated_cost} | ${f.rating.toFixed(1)} | ${f.best_time} | ${f.dietary_friendly ? 'YES' : 'NO'} |`)
    }
    lines.push('')
  }

  if (result.hidden_gems.length > 0) {
    lines.push('### Hidden Gems')
    for (const g of result.hidden_gems) {
      lines.push(`- **${g.name}** (${g.estimated_cost}) — ${g.description}`)
    }
    lines.push('')
  }

  if (result.day_trips.length > 0) {
    lines.push('### Day Trip Ideas')
    for (const dt of result.day_trips) {
      lines.push(`- **${dt.name}** (${dt.estimated_cost}) — ${dt.description}`)
    }
    lines.push('')
  }

  if (result.local_tips.length > 0) {
    lines.push('### Local Tips')
    for (const tip of result.local_tips) {
      lines.push(`- ${tip}`)
    }
    lines.push('')
  }

  if (result.safety_notes.length > 0) {
    lines.push('### Safety Notes')
    for (const note of result.safety_notes) {
      lines.push(`- ${note}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 6: CONTINGENCY PLANNER ====================

function planContingency(input: ContingencyInput): ContingencyResult {
  const { trip_details, risk_factors, traveler_profiles, budget_contingency_percent } = input

  const emergencyContacts: EmergencyContact[] = [
    { service_type: 'Local Emergency', contact_info: '112 (EU) / 911 (US) / Local equivalent', available_hours: '24/7', notes: 'Universal emergency number in many countries' },
    { service_type: 'Embassy/Consulate', contact_info: 'Check embassy website for local number', available_hours: 'Business hours + emergency line', notes: 'For lost passports, legal issues, evacuations' },
    { service_type: 'Travel Insurance Hotline', contact_info: trip_details.insurance_policy || 'Check policy documents', available_hours: '24/7 most providers', notes: 'Medical emergencies, trip cancellation claims' },
    { service_type: 'Credit Card Lost/Stolen', contact_info: 'Card issuer 24/7 number', available_hours: '24/7', notes: 'Report immediately to prevent fraud' },
    { service_type: 'Medical Emergency', contact_info: 'Local ambulance + nearest hospital', available_hours: '24/7', notes: 'Know location of nearest hospital to accommodation' },
  ]

  const contingencyPlans: ContingencyPlan[] = []
  const defaultRisks = risk_factors.length > 0 ? risk_factors : ['flight_delay', 'lost_luggage', 'medical_emergency', 'natural_disaster', 'political_unrest']

  const planTemplates: Record<string, Partial<ContingencyPlan>> = {
    flight_delay: {
      scenario: 'Flight Delay or Cancellation',
      probability: 'medium',
      severity: 'medium',
      immediate_actions: ['Contact airline for rebooking options', 'Check travel insurance for delay coverage', 'Notify accommodation of late arrival', 'Download airline app for real-time updates'],
      backup_options: ['Alternative flights on partner airlines', 'Train/bus alternatives for regional travel', 'Next-day rebooking with hotel accommodation'],
      estimated_extra_cost_usd: 150,
      trigger_condition: 'Flight delayed > 4 hours or cancelled',
    },
    lost_luggage: {
      scenario: 'Lost or Delayed Luggage',
      probability: 'medium',
      severity: 'low',
      immediate_actions: ['File report at airline baggage desk before leaving airport', 'Keep receipt for essential purchases', 'Track bag via airline app', 'Know your rights — EU261/Interim expenses'],
      backup_options: ['Purchase essentials (clothes, toiletries) — claim reimbursement', 'Airline delivery to accommodation when found', 'Use travel insurance delayed baggage coverage'],
      estimated_extra_cost_usd: 100,
      trigger_condition: 'Luggage not on carousel after 30 minutes',
    },
    medical_emergency: {
      scenario: 'Medical Emergency',
      probability: 'low',
      severity: 'critical',
      immediate_actions: ['Call local emergency services', 'Contact travel insurance 24/7 hotline', 'Go to nearest hospital/clinic', 'Notify emergency contacts at home'],
      backup_options: ['Medical evacuation if needed', 'Local English-speaking doctors via embassy', 'Telemedicine consultation if minor'],
      estimated_extra_cost_usd: 500,
      trigger_condition: 'Any injury or illness requiring medical attention',
    },
    natural_disaster: {
      scenario: 'Natural Disaster or Severe Weather',
      probability: 'low',
      severity: 'critical',
      immediate_actions: ['Follow local authority instructions', 'Contact embassy for evacuation assistance', 'Move to safe location', 'Notify family of status'],
      backup_options: ['Evacuation to safe region', 'Embassy-organized evacuation', 'Trip interruption insurance claim'],
      estimated_extra_cost_usd: 800,
      trigger_condition: 'Official weather warning or natural event',
    },
    political_unrest: {
      scenario: 'Political Unrest or Security Incident',
      probability: 'low',
      severity: 'high',
      immediate_actions: ['Avoid demonstration areas', 'Monitor local news and embassy alerts', 'Stay in accommodation if advised', 'Register with embassy if available'],
      backup_options: ['Relocate to safer area', 'Early departure from country', 'Embassy assistance for evacuation'],
      estimated_extra_cost_usd: 600,
      trigger_condition: 'Government travel advisory or visible unrest',
    },
    lost_documents: {
      scenario: 'Lost Passport or Travel Documents',
      probability: 'low',
      severity: 'high',
      immediate_actions: ['File police report', 'Contact embassy for emergency travel document', 'Cancel/replace stolen cards', 'Use digital copies as temporary ID'],
      backup_options: ['Emergency travel document from embassy', 'Digital copies for identity verification', 'Trip modification if replacement takes time'],
      estimated_extra_cost_usd: 200,
      trigger_condition: 'Passport or essential documents lost/stolen',
    },
  }

  for (const risk of defaultRisks) {
    const template = planTemplates[risk]
    if (template) {
      contingencyPlans.push({
        scenario: template.scenario || risk,
        probability: template.probability || 'low',
        severity: template.severity || 'medium',
        immediate_actions: template.immediate_actions || ['Assess situation', 'Contact relevant authorities'],
        backup_options: template.backup_options || ['Contact embassy', 'Use travel insurance'],
        estimated_extra_cost_usd: template.estimated_extra_cost_usd || 200,
        trigger_condition: template.trigger_condition || 'Situation arises',
      })
    }
  }

  // Insurance notes
  const insuranceNotes: string[] = [
    trip_details.insurance_policy
      ? `Policy: ${trip_details.insurance_policy} — verify coverage for all destinations`
      : 'No insurance policy listed — strongly recommend comprehensive travel insurance',
    'Verify medical coverage limits — minimum $100k recommended for international travel',
    'Check pre-existing condition coverage if applicable',
    'Confirm adventure activity coverage if planning high-risk activities',
    'Keep digital and physical copies of insurance policy and claim procedures',
  ]

  // Document backup checklist
  const docChecklist: string[] = [
    'Passport — digital scan in cloud + physical photocopy separate from original',
    'Visa documents — digital copies on phone and cloud',
    'Travel insurance — policy number and claim hotline saved offline',
    'Flight confirmations — screenshots of booking references',
    'Accommodation confirmations — addresses in local language',
    'Emergency contacts — written copy not just in phone',
    'Credit card numbers — separate from cards, bank contact numbers',
    'Medical information — allergies, conditions, blood type, medications',
  ]

  // Communication plan
  const commPlan: string[] = [
    'Share full itinerary with emergency contact at home',
    'Set up regular check-in schedule (daily or every 2 days)',
    'Download messaging apps used at destination (WhatsApp, WeChat, etc.)',
    'Know international dialing codes for destination countries',
    'Enable international roaming or buy local SIM upon arrival',
    'Save embassy contact in phone before departure',
  ]

  const totalContingencyCost = contingencyPlans.reduce((s, p) => s + p.estimated_extra_cost_usd, 0)
  const recommendedBudget = Math.round(totalContingencyCost * budget_contingency_percent / 100)

  return {
    emergency_contacts: emergencyContacts,
    contingency_plans: contingencyPlans,
    insurance_coverage_notes: insuranceNotes,
    document_backup_checklist: docChecklist,
    communication_plan: commPlan,
    summary: `${contingencyPlans.length} contingency plans | Emergency fund: ~$${recommendedBudget} (${budget_contingency_percent}% of $${totalContingencyCost}) | ${emergencyContacts.length} emergency contacts`,
  }
}

function formatContingencyReport(result: ContingencyResult): string {
  const lines: string[] = []

  lines.push('## Contingency Planning Result')
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  lines.push('### Emergency Contacts')
  lines.push('| Service | Contact | Hours | Notes |')
  lines.push('|---------|---------|-------|-------|')
  for (const c of result.emergency_contacts) {
    lines.push(`| ${c.service_type} | ${c.contact_info} | ${c.available_hours} | ${c.notes} |`)
  }
  lines.push('')

  lines.push('### Contingency Plans')
  for (const plan of result.contingency_plans) {
    const sevIcon = plan.severity === 'critical' ? '[CRITICAL]' : plan.severity === 'high' ? '[HIGH]' : plan.severity === 'medium' ? '[MEDIUM]' : '[LOW]'
    lines.push(`#### ${plan.scenario} ${sevIcon}`)
    lines.push(`Probability: ${plan.probability.toUpperCase()} | Severity: ${plan.severity.toUpperCase()} | Extra Cost: ~$${plan.estimated_extra_cost_usd}`)
    lines.push(`Trigger: ${plan.trigger_condition}`)
    lines.push('')
    lines.push('Immediate Actions:')
    for (const action of plan.immediate_actions) {
      lines.push(`- ${action}`)
    }
    lines.push('')
    lines.push('Backup Options:')
    for (const opt of plan.backup_options) {
      lines.push(`- ${opt}`)
    }
    lines.push('')
  }

  lines.push('### Insurance Coverage Notes')
  for (const note of result.insurance_coverage_notes) {
    lines.push(`- ${note}`)
  }
  lines.push('')

  lines.push('### Document Backup Checklist')
  for (const item of result.document_backup_checklist) {
    lines.push(`- [ ] ${item}`)
  }
  lines.push('')

  lines.push('### Communication Plan')
  for (const item of result.communication_plan) {
    lines.push(`- ${item}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 7: TRAVEL DOCUMENT CHECKER ====================

function checkDocuments(input: DocumentInput): DocumentResult {
  const { nationality, destinations, travel_dates, passport_expiry, existing_visas, traveler_age, special_circumstances } = input

  const requirements: DocumentRequirement[] = []
  const actionItems: string[] = []
  const renewalRecommendations: string[] = []
  const visaTimeline: string[] = []

  // Passport check
  const today = new Date()
  const expiryDate = new Date(passport_expiry)
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const returnDate = new Date(travel_dates.return)
  const daysUntilReturn = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const monthsValidAfterReturn = Math.ceil((expiryDate.getTime() - returnDate.getTime()) / (1000 * 60 * 60 * 24 * 30))

  let passportValid = true
  let passportMessage = 'Passport is valid for travel'

  if (daysUntilExpiry < 0) {
    passportValid = false
    passportMessage = 'PASSPORT HAS EXPIRED — must renew before any travel'
    actionItems.push('URGENT: Renew passport immediately — expedited service recommended')
  } else if (monthsValidAfterReturn < 6) {
    passportValid = false
    passportMessage = `Passport expires ${monthsValidAfterReturn} months after return — many countries require 6+ months validity`
    actionItems.push('Renew passport before travel — most destinations require 6 months validity beyond return date')
    renewalRecommendations.push('Apply for renewal at least 8 weeks before travel')
  } else if (monthsValidAfterReturn < 12) {
    passportMessage = `Passport valid but expires ${monthsValidAfterReturn} months after return — monitor closely`
    renewalRecommendations.push('Consider renewing soon for future travel flexibility')
  }

  // Destination-specific requirements
  const visaRequirements: Record<string, { type: string; processing_days: number; notes: string }> = {
    'US': { type: 'ESTA or Visa', processing_days: 3, notes: 'ESTA valid 2 years, apply 72h before departure' },
    'UK': { type: 'ETA or Standard Visitor', processing_days: 3, notes: 'ETA for eligible nationals, apply 3 days before' },
    'EU': { type: 'ETIAS (2025+) or Schengen Visa', processing_days: 15, notes: '90/180 day rule for non-EU nationals' },
    'China': { type: 'Visa required', processing_days: 7, notes: 'Apply at Chinese consulate, invitation letter may be needed' },
    'Japan': { type: 'Visa or Visa Waiver', processing_days: 5, notes: 'Many nationals eligible for 90-day visa waiver' },
    'Australia': { type: 'ETA or eVisitor', processing_days: 2, notes: 'ETA processed online, usually instant' },
    'India': { type: 'eVisa', processing_days: 3, notes: 'Apply online 4-7 days before travel' },
    'Brazil': { type: 'Visa or eVisa', processing_days: 5, notes: 'Requirements vary by nationality' },
    'Thailand': { type: 'Visa Exemption or VoA', processing_days: 0, notes: 'Many nationals get 30-45 days visa-free' },
    'Singapore': { type: 'Visa-free or eVisa', processing_days: 3, notes: 'Most Western nationals visa-free 90 days' },
  }

  for (const dest of destinations) {
    const req = visaRequirements[dest]
    if (req) {
      const hasExisting = existing_visas.some(v => v.toLowerCase().includes(dest.toLowerCase()))
      const status: 'met' | 'action_needed' | 'not_required' | 'check_required' = hasExisting ? 'met' : 'action_needed'
      const urgency: 'immediate' | 'soon' | 'monitor' | 'none' = status === 'action_needed' ? (req.processing_days > 5 ? 'soon' : 'monitor') : 'none'

      requirements.push({
        destination: dest,
        requirement_type: req.type,
        status,
        deadline: travel_dates.departure,
        description: req.notes,
        official_link_hint: `Search: "${dest} embassy ${nationality} visa requirements"`,
        estimated_processing_days: req.processing_days,
        urgency,
      })

      if (status === 'action_needed') {
        actionItems.push(`${dest}: Apply for ${req.type} — ${req.processing_days} days processing`)
        visaTimeline.push(`${dest}: Apply ${req.processing_days + 7} days before departure`)
      }
    } else {
      requirements.push({
        destination: dest,
        requirement_type: 'Check requirements',
        status: 'check_required',
        deadline: travel_dates.departure,
        description: `Verify visa requirements for ${nationality} citizens visiting ${dest}`,
        official_link_hint: `Search: "${dest} visa requirements for ${nationality}"`,
        estimated_processing_days: 14,
        urgency: 'monitor',
      })
    }
  }

  // Special circumstances
  if (special_circumstances.includes('minor')) {
    actionItems.push('Minor traveling — may need consent letter from both parents')
    requirements.push({ destination: 'All', requirement_type: 'Minor travel consent', status: 'action_needed', deadline: travel_dates.departure, description: 'Notarized consent letter from non-traveling parent(s)', official_link_hint: 'Check embassy requirements', estimated_processing_days: 7, urgency: 'soon' })
  }
  if (special_circumstances.includes('dual_nationality')) {
    actionItems.push('Dual nationality — check which passport to use for entry/exit')
  }
  if (traveler_age >= 65) {
    renewalRecommendations.push('Seniors may benefit from travel insurance with pre-existing condition coverage')
  }

  return {
    requirements,
    passport_status: { valid: passportValid, message: passportMessage, days_until_expiry: daysUntilExpiry },
    action_items: actionItems,
    renewal_recommendations: renewalRecommendations,
    visa_timeline: visaTimeline,
    summary: `${destinations.length} destination(s) checked | Passport: ${passportValid ? 'VALID' : 'ACTION NEEDED'} | ${requirements.length} requirement(s) | ${actionItems.length} action item(s)`,
  }
}

function formatDocumentReport(result: DocumentResult): string {
  const lines: string[] = []

  lines.push('## Travel Document Check Result')
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  const ppIcon = result.passport_status.valid ? '[VALID]' : '[ACTION NEEDED]'
  lines.push(`### Passport Status ${ppIcon}`)
  lines.push(`Message: ${result.passport_status.message}`)
  lines.push(`Days until expiry: ${result.passport_status.days_until_expiry}`)
  lines.push('')

  if (result.requirements.length > 0) {
    lines.push('### Destination Requirements')
    lines.push('| Destination | Requirement | Status | Processing | Urgency |')
    lines.push('|-------------|-------------|--------|------------|---------|')
    for (const r of result.requirements) {
      const statusTag = r.status === 'met' ? 'MET' : r.status === 'action_needed' ? 'ACTION NEEDED' : r.status === 'not_required' ? 'NOT REQUIRED' : 'CHECK'
      const urgTag = r.urgency === 'immediate' ? 'IMMEDIATE' : r.urgency === 'soon' ? 'SOON' : r.urgency === 'monitor' ? 'MONITOR' : 'NONE'
      lines.push(`| ${r.destination} | ${r.requirement_type} | ${statusTag} | ${r.estimated_processing_days}d | ${urgTag} |`)
    }
    lines.push('')
  }

  if (result.action_items.length > 0) {
    lines.push('### Action Items')
    for (const item of result.action_items) {
      lines.push(`- [ ] ${item}`)
    }
    lines.push('')
  }

  if (result.visa_timeline.length > 0) {
    lines.push('### Visa Application Timeline')
    for (const t of result.visa_timeline) {
      lines.push(`- ${t}`)
    }
    lines.push('')
  }

  if (result.renewal_recommendations.length > 0) {
    lines.push('### Renewal Recommendations')
    for (const rec of result.renewal_recommendations) {
      lines.push(`- ${rec}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: CARBON FOOTPRINT CALCULATOR ====================

function calculateCarbonFootprint(input: CarbonInput): CarbonResult {
  const { transport_modes, accommodation_type, nights, activities, include_offset } = input

  // Emission factors (kg CO2 per km or per night)
  const emissionFactors: Record<string, number> = {
    flight_short: 0.255,
    flight_long: 0.195,
    train: 0.041,
    bus: 0.089,
    car: 0.171,
    car_ev: 0.053,
    ferry: 0.120,
    motorcycle: 0.113,
    bicycle: 0,
    walking: 0,
  }

  const accommodationFactors: Record<string, number> = {
    hotel: 29.5,
    resort: 45.0,
    hostel: 15.0,
    airbnb: 20.0,
    vacation_rental: 25.0,
    camping: 5.0,
    eco_lodge: 8.0,
  }

  const activityFactors: Record<string, number> = {
    skiing: 15.0,
    scuba_diving: 25.0,
    safari: 30.0,
    boat_tour: 12.0,
    hiking: 0.5,
    city_tour: 2.0,
    museum_visit: 1.0,
    beach: 0.2,
    spa: 5.0,
    theme_park: 18.0,
  }

  // Calculate transport emissions
  const transportEmissions: TransportEmission[] = []
  let totalTransportCO2 = 0

  for (const t of transport_modes) {
    const factor = emissionFactors[t.mode] || 0.15
    const co2 = t.distance_km * factor
    totalTransportCO2 += co2
    transportEmissions.push({
      mode: t.mode,
      distance_km: t.distance_km,
      co2_kg: Math.round(co2 * 100) / 100,
      percentage: 0,
      comparison_to_avg: co2 > t.distance_km * 0.2 ? 'Above average' : co2 > t.distance_km * 0.1 ? 'Average' : 'Below average',
    })
  }

  // Calculate percentages
  for (const te of transportEmissions) {
    te.percentage = totalTransportCO2 > 0 ? Math.round((te.co2_kg / totalTransportCO2) * 100) : 0
  }

  // Accommodation emissions
  const accomFactor = accommodationFactors[accommodation_type] || 25.0
  const accommodationCO2 = accomFactor * nights

  // Activity emissions
  let activitiesCO2 = 0
  for (const act of activities) {
    activitiesCO2 += activityFactors[act] || 3.0
  }

  const totalCO2 = totalTransportCO2 + accommodationCO2 + activitiesCO2
  const passengers = transport_modes.length > 0 ? transport_modes[0].passengers : 1
  const perPersonCO2 = totalCO2 / passengers

  // Offset options
  const offsetOptions: OffsetOption[] = []
  if (include_offset) {
    offsetOptions.push(
      { method: 'Reforestation Project', cost_usd: Math.round(totalCO2 * 0.012 * 100) / 100, co2_offset_kg: Math.round(totalCO2), credibility: 'high', description: 'Verified tree planting programs with long-term monitoring' },
      { method: 'Renewable Energy Credits', cost_usd: Math.round(totalCO2 * 0.008 * 100) / 100, co2_offset_kg: Math.round(totalCO2), credibility: 'high', description: 'Support wind/solar projects via certified RECs' },
      { method: 'Direct Air Capture', cost_usd: Math.round(totalCO2 * 0.25 * 100) / 100, co2_offset_kg: Math.round(totalCO2), credibility: 'medium', description: 'Emerging technology — permanent carbon removal' },
      { method: 'Cookstove Distribution', cost_usd: Math.round(totalCO2 * 0.015 * 100) / 100, co2_offset_kg: Math.round(totalCO2 * 0.8), credibility: 'high', description: 'Community impact + carbon reduction in developing regions' },
    )
  }

  // Reduction tips
  const reductionTips: string[] = []
  if (transportEmissions.some(t => t.mode.includes('flight'))) {
    reductionTips.push('Choose direct flights — takeoff/landing produce disproportionate emissions')
    reductionTips.push('Consider train alternatives for trips under 500km — 90% fewer emissions')
  }
  if (accommodation_type === 'hotel' || accommodation_type === 'resort') {
    reductionTips.push('Choose eco-certified accommodations — 30-50% lower carbon footprint')
  }
  reductionTips.push('Pack light — every kg matters for flight emissions')
  reductionTips.push('Use public transit at destination instead of taxis/rental cars')
  reductionTips.push('Eat local/seasonal food — reduces food miles and supports community')

  // Rating
  const avgPerDay = totalCO2 / Math.max(nights, 1)
  let rating: 'excellent' | 'good' | 'average' | 'high' | 'very_high' = 'average'
  if (avgPerDay < 20) rating = 'excellent'
  else if (avgPerDay < 50) rating = 'good'
  else if (avgPerDay < 100) rating = 'average'
  else if (avgPerDay < 200) rating = 'high'
  else rating = 'very_high'

  return {
    total_co2_kg: Math.round(totalCO2 * 100) / 100,
    transport_emissions: transportEmissions,
    accommodation_co2_kg: Math.round(accommodationCO2 * 100) / 100,
    activities_co2_kg: Math.round(activitiesCO2 * 100) / 100,
    per_person_co2_kg: Math.round(perPersonCO2 * 100) / 100,
    offset_options: offsetOptions,
    reduction_tips: reductionTips,
    comparison_benchmarks: { domestic_avg_kg: 250, international_avg_kg: 1200 },
    rating,
    summary: `Total: ${Math.round(totalCO2)}kg CO2 | Per person: ${Math.round(perPersonCO2)}kg | Rating: ${rating.toUpperCase()} | ${offsetOptions.length} offset options`,
  }
}

function formatCarbonReport(result: CarbonResult): string {
  const lines: string[] = []

  lines.push('## Carbon Footprint Calculation Result')
  lines.push('')
  lines.push(`Total: ${result.total_co2_kg}kg CO2 | Per Person: ${result.per_person_co2_kg}kg | Rating: ${result.rating.toUpperCase()}`)
  lines.push('')
  lines.push(`Summary: ${result.summary}`)
  lines.push('')

  lines.push('### Emissions Breakdown')
  lines.push('| Source | CO2 (kg) |')
  lines.push('|--------|----------|')
  for (const te of result.transport_emissions) {
    lines.push(`| ${te.mode} (${te.distance_km}km) | ${te.co2_kg} |`)
  }
  lines.push(`| Accommodation | ${result.accommodation_co2_kg} |`)
  lines.push(`| Activities | ${result.activities_co2_kg} |`)
  lines.push(`| **TOTAL** | **${result.total_co2_kg}** |`)
  lines.push('')

  lines.push('### Benchmarks')
  lines.push(`| Benchmark | CO2 (kg) |`)
  lines.push(`|-----------|----------|`)
  lines.push(`| Domestic avg trip | ${result.comparison_benchmarks.domestic_avg_kg} |`)
  lines.push(`| International avg trip | ${result.comparison_benchmarks.international_avg_kg} |`)
  lines.push(`| **Your trip** | **${result.total_co2_kg}** |`)
  lines.push('')

  if (result.offset_options.length > 0) {
    lines.push('### Offset Options')
    lines.push('| Method | Cost | CO2 Offset | Credibility |')
    lines.push('|--------|------|------------|-------------|')
    for (const o of result.offset_options) {
      lines.push(`| ${o.method} | $${o.cost_usd} | ${o.co2_offset_kg}kg | ${o.credibility.toUpperCase()} |`)
    }
    lines.push('')
  }

  if (result.reduction_tips.length > 0) {
    lines.push('### Reduction Tips')
    for (const tip of result.reduction_tips) {
      lines.push(`- ${tip}`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'itinerary_optimizer',
    description: 'Optimize travel itinerary with route planning, day-by-day scheduling, and preference matching. Takes destinations, duration, preferences, and constraints to produce an optimized travel plan with cost estimates and warnings.',
    parameters: {
      itinerary_input: { type: 'string', required: true, description: 'JSON object: destinations[], duration, preferences, constraints' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { itinerary_input: string }) {
      const input: ItineraryInput = JSON.parse(args.itinerary_input)
      const result = optimizeItinerary(input)
      return formatItineraryReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'budget_planner',
    description: 'Create comprehensive travel budget with category breakdown, savings strategies, and per-person/per-day cost analysis. Supports multiple travel styles and currencies.',
    parameters: {
      budget_input: { type: 'string', required: true, description: 'JSON object: travel_style, destinations[], duration, currency, travelers, include_flights' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { budget_input: string }) {
      const input: BudgetInput = JSON.parse(args.budget_input)
      const result = planBudget(input)
      return formatBudgetReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'booking_strategist',
    description: 'Develop optimal booking strategy with timing recommendations, channel suggestions, loyalty program optimization, and price trend analysis for flights, accommodation, and activities.',
    parameters: {
      booking_input: { type: 'string', required: true, description: 'JSON object: travel_dates, flexibility_days, loyalty_programs[], booking_targets[], trip_type, advance_notice_days' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { booking_input: string }) {
      const input: BookingInput = JSON.parse(args.booking_input)
      const result = developBookingStrategy(input)
      return formatBookingStrategyReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'calendar_coordinator',
    description: 'Coordinate travel dates with work and family calendars. Detects conflicts, identifies reschedulable/delegable items, generates preparation checklist, and creates auto-reply templates.',
    parameters: {
      calendar_input: { type: 'string', required: true, description: 'JSON object: travel_dates, work_calendar[], family_calendar[], delegates[], importance_threshold' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { calendar_input: string }) {
      const input: CalendarInput = JSON.parse(args.calendar_input)
      const result = coordinateCalendar(input)
      return formatCalendarReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'local_discovery',
    description: 'Generate personalized local recommendations including food spots, hidden gems, cultural experiences, and day trips. Considers interests, dietary restrictions, budget level, and mobility needs.',
    parameters: {
      discovery_input: { type: 'string', required: true, description: 'JSON object: destination, interests[], dietary_restrictions[], budget_level, travel_dates, group_size, mobility_needs[]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { discovery_input: string }) {
      const input: DiscoveryInput = JSON.parse(args.discovery_input)
      const result = discoverLocal(input)
      return formatDiscoveryReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'contingency_planner',
    description: 'Create comprehensive contingency plans for travel risks. Includes emergency contacts, scenario-specific response plans, insurance coverage notes, document backup checklist, and communication plans.',
    parameters: {
      contingency_input: { type: 'string', required: true, description: 'JSON object: trip_details, risk_factors[], traveler_profiles[], budget_contingency_percent' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { contingency_input: string }) {
      const input: ContingencyInput = JSON.parse(args.contingency_input)
      const result = planContingency(input)
      return formatContingencyReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'travel_document_checker',
    description: 'Check travel document requirements including passport validity, visa requirements by destination, processing timelines, and special circumstance handling. Provides action items and renewal recommendations.',
    parameters: {
      document_input: { type: 'string', required: true, description: 'JSON object: nationality, destinations[], travel_dates, passport_expiry, existing_visas[], traveler_age, special_circumstances[]' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { document_input: string }) {
      const input: DocumentInput = JSON.parse(args.document_input)
      const result = checkDocuments(input)
      return formatDocumentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'carbon_footprint_calculator',
    description: 'Calculate travel carbon footprint from transport, accommodation, and activities. Provides emissions breakdown, offset options, reduction tips, and comparison benchmarks.',
    parameters: {
      carbon_input: { type: 'string', required: true, description: 'JSON object: transport_modes[], accommodation_type, nights, activities[], include_offset' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { carbon_input: string }) {
      const input: CarbonInput = JSON.parse(args.carbon_input)
      const result = calculateCarbonFootprint(input)
      return formatCarbonReport(result)
    }
  }))

  console.log(`[dsh-tool-travelplanner] Loaded v${VERSION} - Intelligent Travel Planner with 8 tools`)
  console.log('  Tools: itinerary_optimizer, budget_planner, booking_strategist, calendar_coordinator, local_discovery, contingency_planner, travel_document_checker, carbon_footprint_calculator')
}
