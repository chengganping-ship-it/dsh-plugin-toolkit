/**
 * DSH AI Hospitality & Tourism Plugin v0.1.0
 *
 * Smart hospitality and tourism toolkit for DeepSeek Harness - hotel revenue
 * optimization, guest experience personalization, travel itinerary planning,
 * dynamic pricing, review sentiment analysis, housekeeping scheduling,
 * restaurant menu optimization, and events conference planning. Designed for
 * the massive travel and hospitality market being transformed by AI agents.
 *
 * Features (v0.1.0):
 * - hotel_revenue_optimizer - Revenue management with occupancy/ADR/RevPAR analysis
 * - guest_experience_personalizer - Personalized guest journey and preference mapping
 * - travel_itinerary_planner - Multi-destination travel planning with budget optimization
 * - dynamic_pricing_hospitality - Real-time pricing strategy for hotels and services
 * - review_sentiment_analyzer - Sentiment extraction from guest reviews and feedback
 * - housekeeping_scheduler_ai - AI-powered housekeeping staff and room scheduling
 * - restaurant_menu_optimizer - Menu engineering with profitability analysis
 * - events_conference_planner - Corporate events and conference planning
 *
 * @module dsh-tool-hospitalityai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-hospitalityai'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM (mulberry32) ====================

function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return Math.abs(hash) || 1
}

interface Rng {
  next(): number
  nextFloat(minVal: number, maxVal: number): number
}

function seededRng(input: string): Rng {
  const fn = mulberry32(hashString(JSON.stringify(input)))
  return {
    next: fn,
    nextFloat: (minVal: number, maxVal: number) => fn() * (maxVal - minVal) + minVal
  }
}

function clamp(value: number, minVal: number, maxVal: number): number {
  return Math.min(Math.max(value, minVal), maxVal)
}

// ==================== TYPES ====================

// --- Tool 1: Hotel Revenue Optimizer ---
export interface HotelRevenueInput {
  hotel_name?: string
  total_rooms?: number
  occupied_rooms?: number
  average_daily_rate?: number
  competitor_rates?: number[]
  season?: 'peak' | 'shoulder' | 'low'
  events_nearby?: string[]
  historical_occupancy?: number[]
}

export interface RevenueMetric {
  metric_name: string
  current_value: number
  benchmark: number
  status: 'above' | 'below' | 'at'
  recommendation: string
}

export interface RevenueOptimizationResult {
  revpar: number
  occupancy_rate: number
  adr: number
  revenue_opportunity_usd: number
  metrics: RevenueMetric[]
  strategies: string[]
  pricing_adjustments: string[]
  forecast_next_quarter: { month: string; projected_occupancy: number; projected_adr: number }[]
}

// --- Tool 2: Guest Experience Personalizer ---
export interface GuestProfileInput {
  guest_id?: string
  loyalty_tier?: 'new' | 'bronze' | 'silver' | 'gold' | 'platinum'
  past_stays?: number
  preferences?: string[]
  dietary_restrictions?: string[]
  purpose_of_visit?: 'leisure' | 'business' | 'celebration' | 'family'
  special_requests?: string[]
  previous_complaints?: string[]
  spending_pattern?: 'budget' | 'moderate' | 'luxury'
}

export interface PersonalizedAmenity {
  category: string
  item: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  estimated_cost_usd: number
}

export interface GuestExperienceResult {
  guest_segment: string
  personalization_score: number
  recommended_amenities: PersonalizedAmenity[]
  room_upgrade_eligible: boolean
  communication_tone: string
  surprise_delight: string[]
  retention_risk: 'low' | 'medium' | 'high'
  lifetime_value_estimate_usd: number
  notes: string[]
}

// --- Tool 3: Travel Itinerary Planner ---
export interface TravelItineraryInput {
  origin?: string
  destinations?: string[]
  travel_dates?: { start: string; end: string }
  budget_usd?: number
  travelers?: number
  interests?: string[]
  pace?: 'relaxed' | 'moderate' | 'packed'
  transport_preference?: 'flight' | 'train' | 'car' | 'mixed'
  accommodation_type?: 'luxury' | 'boutique' | 'budget' | 'airbnb'
}

export interface ItineraryDay {
  day: number
  date: string
  location: string
  activities: string[]
  transport: string
  accommodation: string
  estimated_cost_usd: number
  tips: string[]
}

export interface TravelItineraryResult {
  trip_summary: string
  total_estimated_cost_usd: number
  cost_per_person_usd: number
  days: ItineraryDay[]
  packing_suggestions: string[]
  travel_tips: string[]
  contingency_notes: string[]
  booking_recommendations: string[]
}

// --- Tool 4: Dynamic Pricing Hospitality ---
export interface DynamicPricingInput {
  hotel_name?: string
  room_type?: string
  base_rate?: number
  current_demand?: 'very_low' | 'low' | 'normal' | 'high' | 'very_high'
  competitor_avg_rate?: number
  days_until_checkin?: number
  local_events?: string[]
  historical_pickup_rate?: number
  remaining_inventory_pct?: number
}

export interface PricingTier {
  tier_name: string
  price_usd: number
  conditions: string
  expected_conversion_pct: number
  revenue_impact: string
}

export interface DynamicPricingResult {
  recommended_rate_usd: number
  min_rate_usd: number
  max_rate_usd: number
  pricing_tiers: PricingTier[]
  strategy: string
  confidence_pct: number
  restrictions: string[]
  upsell_opportunities: string[]
  competitive_positioning: string
}

// --- Tool 5: Review Sentiment Analyzer ---
export interface ReviewSentimentInput {
  reviews?: string[]
  source?: 'tripadvisor' | 'google' | 'booking' | 'direct' | 'all'
  time_period?: string
  min_rating?: number
  max_rating?: number
  categories?: string[]
}

export interface SentimentScore {
  category: string
  score: number
  label: 'positive' | 'neutral' | 'negative'
  mention_count: number
  top_phrases: string[]
}

export interface ReviewSentimentResult {
  overall_sentiment: 'positive' | 'neutral' | 'negative'
  overall_score: number
  total_reviews_analyzed: number
  category_scores: SentimentScore[]
  key_strengths: string[]
  key_weaknesses: string[]
  actionable_insights: string[]
  trend_direction: 'improving' | 'stable' | 'declining'
  benchmark_comparison: string
}

// --- Tool 6: Housekeeping Scheduler AI ---
export interface HousekeepingInput {
  total_rooms?: number
  occupied_rooms?: number
  checkout_rooms?: number
  vip_rooms?: number
  staff_available?: number
  shift_hours?: number
  priority_rooms?: string[]
  maintenance_issues?: string[]
  event_disruptions?: string[]
}

export interface CleaningAssignment {
  room_range: string
  staff_count: number
  estimated_minutes: number
  priority: 'urgent' | 'high' | 'normal' | 'low'
  special_instructions: string[]
}

export interface HousekeepingScheduleResult {
  total_cleaning_minutes: number
  staff_utilization_pct: number
  assignments: CleaningAssignment[]
  priority_sequence: string[]
  estimated_completion_time: string
  quality_check_rooms: string[]
  efficiency_tips: string[]
  contingency_plans: string[]
}

// --- Tool 7: Restaurant Menu Optimizer ---
export interface MenuOptimizerInput {
  menu_items?: string[]
  food_cost_pct?: number
  avg_dish_price?: number
  category?: 'fine_dining' | 'casual' | 'fast_casual' | 'cafe' | 'bar'
  popular_items?: string[]
  low_performers?: string[]
  seasonal_ingredients?: string[]
  dietary_trends?: string[]
}

export interface MenuItemAnalysis {
  item_name: string
  profit_margin_pct: number
  popularity_score: number
  classification: 'star' | 'plow_horse' | 'puzzle' | 'dog'
  recommendation: string
  suggested_price_usd: number
}

export interface MenuOptimizationResult {
  menu_health_score: number
  item_analyses: MenuItemAnalysis[]
  stars: string[]
  plow_horses: string[]
  puzzles: string[]
  dogs: string[]
  suggested_additions: string[]
  suggested_removals: string[]
  pricing_recommendations: string[]
  seasonal_specials: string[]
}

// --- Tool 8: Events Conference Planner ---
export interface EventsConferenceInput {
  event_type?: 'conference' | 'wedding' | 'corporate' | 'gala' | 'workshop' | 'exhibition'
  expected_attendees?: number
  duration_hours?: number
  budget_usd?: number
  venue_type?: 'indoor' | 'outdoor' | 'hybrid'
  catering_required?: boolean
  av_requirements?: string[]
  date_flexibility?: 'fixed' | 'flexible' | 'very_flexible'
  theme?: string
}

export interface EventBreakdown {
  category: string
  percentage: number
  estimated_cost_usd: number
  recommendations: string[]
}

export interface EventMilestone {
  milestone: string
  deadline_offset_days: number
  status: 'pending' | 'in_progress' | 'completed'
  notes: string
}

export interface EventsConferenceResult {
  event_feasibility: 'highly_feasible' | 'feasible' | 'challenging' | 'not_recommended'
  budget_breakdown: EventBreakdown[]
  milestone_timeline: EventMilestone[]
  venue_recommendations: string[]
  catering_options: string[]
  av_setup: string[]
  risk_factors: string[]
  attendee_experience_tips: string[]
  marketing_suggestions: string[]
}

// ==================== TOOL 1: HOTEL REVENUE OPTIMIZER ====================

function optimizeHotelRevenue(input: HotelRevenueInput): RevenueOptimizationResult {
  const rng = seededRng(JSON.stringify(input))
  const totalRooms = input.total_rooms || 150
  const occupiedRooms = input.occupied_rooms || Math.round(totalRooms * 0.72)
  const adr = input.average_daily_rate || 180
  const occupancyRate = (occupiedRooms / totalRooms) * 100
  const revpar = (occupiedRooms * adr) / totalRooms
  const season = input.season || 'shoulder'

  const seasonMultiplier = season === 'peak' ? 1.4 : season === 'low' ? 0.7 : 1.0
  const metrics: RevenueMetric[] = []

  metrics.push({
    metric_name: 'Occupancy Rate',
    current_value: Math.round(occupancyRate * 10) / 10,
    benchmark: 75,
    status: occupancyRate >= 75 ? 'above' : occupancyRate >= 65 ? 'at' : 'below',
    recommendation: occupancyRate < 75 ? 'Implement targeted promotions for low-demand periods' : 'Maintain current occupancy with focus rate management'
  })

  metrics.push({
    metric_name: 'ADR (Average Daily Rate)',
    current_value: adr,
    benchmark: 195,
    status: adr >= 195 ? 'above' : adr >= 175 ? 'at' : 'below',
    recommendation: adr < 195 ? 'Opportunity to increase ADR through value-add packages' : 'Continue premium pricing with enhanced service'
  })

  metrics.push({
    metric_name: 'RevPAR',
    current_value: Math.round(revpar * 100) / 100,
    benchmark: 146.25,
    status: revpar >= 146.25 ? 'above' : revpar >= 130 ? 'at' : 'below',
    recommendation: revpar < 146.25 ? 'Focus on both occupancy and ADR optimization' : 'RevPAR performing well - explore ancillary revenue'
  })

  const competitorAvg = input.competitor_rates && input.competitor_rates.length > 0
    ? input.competitor_rates.reduce((a, b) => a + b, 0) / input.competitor_rates.length
    : 175

  metrics.push({
    metric_name: 'Competitive Index',
    current_value: Math.round((adr / competitorAvg) * 100),
    benchmark: 100,
    status: (adr / competitorAvg) * 100 >= 100 ? 'above' : 'below',
    recommendation: adr < competitorAvg ? 'Price below market - consider rate increase' : 'Leading market on rate - ensure value delivery'
  })

  const strategies: string[] = []
  const pricingAdjustments: string[] = []

  if (occupancyRate < 70) {
    strategies.push('Launch flash sale for next 14 days to boost occupancy')
    strategies.push('Partner with OTAs for promotional placement')
    pricingAdjustments.push('Offer 15-20% discount on weekdays')
  } else if (occupancyRate > 85) {
    strategies.push('Implement length-of-stay restrictions to maximize revenue')
    strategies.push('Increce bar on high-demand dates')
    pricingAdjustments.push('Raise rates by 10-25% for remaining inventory')
  } else {
    strategies.push('Focus on ancillary revenue: spa, dining, parking')
    pricingAdjustments.push('Test 5-10% rate increase on weekends')
  }

  if (season === 'peak') {
    strategies.push('Activate minimum stay requirements (2-3 nights)')
    pricingAdjustments.push('Implement premium pricing tier for peak dates')
  } else if (season === 'low') {
    strategies.push('Create themed packages to drive demand')
    strategies.push('Target corporate and group segments')
    pricingAdjustments.push('Offer value-add packages instead of rate cuts')
  }

  if (input.events_nearby && input.events_nearby.length > 0) {
    strategies.push(`Leverage nearby events: ${input.events_nearby.slice(0, 3).join(', ')}`)
    pricingAdjustments.push('Apply event-driven surge pricing')
  }

  const revenueGap = (totalRooms * 0.8 * adr * seasonMultiplier) - (occupiedRooms * adr)
  const revenueOpportunity = Math.max(0, Math.round(revenueGap))

  const forecast: { month: string; projected_occupancy: number; projected_adr: number }[] = []
  const months = ['Next Month M+1', 'Next Month M+2', 'Next Month M+3']
  for (let i = 0; i < 3; i++) {
    const projOcc = clamp(occupancyRate + rng.nextFloat(-8, 10) + (i === 0 ? 3 : 0), 40, 98)
    const projAdr = Math.round(adr * (1 + rng.nextFloat(-0.05, 0.12)))
    forecast.push({ month: months[i], projected_occupancy: Math.round(projOcc * 10) / 10, projected_adr: projAdr })
  }

  if (pricingAdjustments.length === 0) {
    pricingAdjustments.push('Maintain current pricing with minor seasonal adjustments')
  }
  if (strategies.length === 0) {
    strategies.push('Continue current performance monitoring')
    strategies.push('Invest in guest experience enhancements')
  }

  return {
    revpar: Math.round(revpar * 100) / 100,
    occupancy_rate: Math.round(occupancyRate * 10) / 10,
    adr,
    revenue_opportunity_usd: revenueOpportunity,
    metrics,
    strategies,
    pricing_adjustments: pricingAdjustments,
    forecast_next_quarter: forecast
  }
}

function formatRevenueReport(input: HotelRevenueInput, result: RevenueOptimizationResult): string {
  const lines: string[] = []
  lines.push('# Hotel Revenue Optimization Report')
  lines.push('')
  lines.push(`**Hotel:** ${input.hotel_name || 'Property Analysis'} | **Season:** ${(input.season || 'shoulder').toUpperCase()}`)
  lines.push('')
  lines.push('## Key Performance Indicators')
  lines.push('')
  lines.push('| Metric | Current | Benchmark | Status |')
  lines.push('|---------|---------|-----------|--------|')
  for (const m of result.metrics) {
    const statusIcon = m.status === 'above' ? 'ABOVE' : m.status === 'below' ? 'BELOW' : 'AT'
    lines.push(`| ${m.metric_name} | ${m.current_value} | ${m.benchmark} | ${statusIcon} |`)
  }
  lines.push('')
  lines.push(`**RevPAR:** $${result.revpar} | **Occupancy:** ${result.occupancy_rate}% | **ADR:** $${result.adr}`)
  lines.push('')
  lines.push(`**Revenue Opportunity:** $${result.revenue_opportunity_usd.toLocaleString()}/night at target occupancy`)
  lines.push('')
  lines.push('## Recommended Strategies')
  for (const s of result.strategies) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  lines.push('## Pricing Adjustments')
  for (const p of result.pricing_adjustments) {
    lines.push(`- ${p}`)
  }
  lines.push('')
  lines.push('## Quarterly Forecast')
  lines.push('| Month | Projected Occupancy | Projected ADR |')
  lines.push('|-------|-------------------|---------------|')
  for (const f of result.forecast_next_quarter) {
    lines.push(`| ${f.month} | ${f.projected_occupancy}% | $${f.projected_adr} |`)
  }
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 2: GUEST EXPERIENCE PERSONALIZER ====================

function personalizeGuestExperience(input: GuestProfileInput): GuestExperienceResult {
  const rng = seededRng(JSON.stringify(input))
  const loyalty = input.loyalty_tier || 'new'
  const pastStays = input.past_stays || 0
  const purpose = input.purpose_of_visit || 'leisure'
  const spending = input.spending_pattern || 'moderate'

  const loyaltyMultiplier = loyalty === 'platinum' ? 5 : loyalty === 'gold' ? 3 : loyalty === 'silver' ? 2 : loyalty === 'bronze' ? 1.5 : 1
  const personalizationScore = clamp(Math.round((pastStays * 5 + loyaltyMultiplier * 15 + (input.preferences?.length || 0) * 8) * (1 + rng.nextFloat(-0.1, 0.1))), 10, 98)

  const segmentMap: Record<string, string> = {
    luxury: 'Premium Leisure Traveler',
    moderate: 'Value-Conscious Guest',
    budget: 'Budget Explorer'
  }

  let segment = segmentMap[spending] || 'Standard Guest'
  if (purpose === 'business') segment = 'Business Traveler'
  if (purpose === 'celebration') segment = 'Celebration Guest'
  if (pastStays > 10) segment = 'Loyalty Champion'

  const amenities: PersonalizedAmenity[] = []

  if (loyalty === 'gold' || loyalty === 'platinum') {
    amenities.push({ category: 'Room', item: 'Complimentary upgrade (subject to availability)', reason: 'Loyalty tier recognition', priority: 'high', estimated_cost_usd: 0 })
    amenities.push({ category: 'Welcome', item: 'Personalized welcome amenity', reason: 'VIP guest recognition', priority: 'high', estimated_cost_usd: 35 })
  }

  if (input.preferences) {
    if (input.preferences.includes('wellness') || input.preferences.includes('spa')) {
      amenities.push({ category: 'Experience', item: 'Spa credit or fitness class', reason: 'Wellness interest detected', priority: 'medium', estimated_cost_usd: 50 })
    }
    if (input.preferences.includes('food') || input.preferences.includes('dining')) {
      amenities.push({ category: 'Dining', item: 'Chef table or wine tasting experience', reason: 'Culinary interest', priority: 'medium', estimated_cost_usd: 75 })
    }
    if (input.preferences.includes('family') || input.preferences.includes('kids')) {
      amenities.push({ category: 'Family', item: 'Kids activity package', reason: 'Family travel detected', priority: 'high', estimated_cost_usd: 40 })
    }
    if (input.preferences.includes('business') || input.preferences.includes('work')) {
      amenities.push({ category: 'Business', item: 'Express laundry and late checkout', reason: 'Business travel needs', priority: 'high', estimated_cost_usd: 30 })
    }
  }

  if (input.dietary_restrictions && input.dietary_restrictions.length > 0) {
    amenities.push({ category: 'Dining', item: 'Customized in-room dining menu', reason: `Dietary needs: ${input.dietary_restrictions.join(', ')}`, priority: 'high', estimated_cost_usd: 0 })
  }

  if (purpose === 'celebration') {
    amenities.push({ category: 'Celebration', item: 'Complimentary champagne and cake', reason: 'Special occasion', priority: 'high', estimated_cost_usd: 60 })
  }

  if (amenities.length < 3) {
    amenities.push({ category: 'General', item: 'Late checkout (2pm)', reason: 'Standard loyalty perk', priority: 'low', estimated_cost_usd: 0 })
  }

  const roomUpgradeEligible = loyalty === 'gold' || loyalty === 'platinum' || (loyalty === 'silver' && pastStays > 5)

  const toneMap: Record<string, string> = {
    luxury: 'Warm, anticipatory, and exclusive',
    moderate: 'Friendly, helpful, and professional',
    budget: 'Efficient, welcoming, and value-oriented'
  }

  const surpriseItems: string[] = []
  if (loyalty === 'platinum') surpriseItems.push('Handwritten welcome note from GM', 'Turndown gift (local artisan product)')
  else if (loyalty === 'gold') surpriseItems.push('Complimentary room refreshment', 'Priority restaurant reservation')
  else if (pastStays > 3) surpriseItems.push('Welcome back recognition', 'Preferred room assignment')
  else surpriseItems.push('Local area guide', 'Personalized restaurant recommendation')

  const retentionRisk: 'low' | 'medium' | 'high' = (input.previous_complaints && input.previous_complaints.length > 2) ? 'high' : (loyalty === 'new' && pastStays === 0) ? 'medium' : 'low'

  const ltvBase = spending === 'luxury' ? 5000 : spending === 'moderate' ? 2000 : 800
  const ltv = Math.round(ltvBase * loyaltyMultiplier * (1 + pastStays * 0.1) * (1 + rng.nextFloat(-0.1, 0.15)))

  const notes: string[] = []
  if (input.special_requests && input.special_requests.length > 0) {
    notes.push(`Special requests on file: ${input.special_requests.join(', ')}`)
  }
  if (input.previous_complaints && input.previous_complaints.length > 0) {
    notes.push(`Previous issues to proactively address: ${input.previous_complaints.length} complaint(s)`)
  }
  notes.push(`Personalization score: ${personalizationScore}/100`)
  if (retentionRisk === 'high') {
    notes.push('PRIORITY: Escalate to guest relations manager for service recovery protocol')
  }

  return {
    guest_segment: segment,
    personalization_score: personalizationScore,
    recommended_amenities: amenities,
    room_upgrade_eligible: roomUpgradeEligible,
    communication_tone: toneMap[spending] || 'Professional and courteous',
    surprise_delight: surpriseItems,
    retention_risk: retentionRisk,
    lifetime_value_estimate_usd: ltv,
    notes
  }
}

function formatGuestExperienceReport(input: GuestProfileInput, result: GuestExperienceResult): string {
  const lines: string[] = []
  lines.push('# Guest Experience Personalization Report')
  lines.push('')
  lines.push(`**Guest ID:** ${input.guest_id || 'N/A'} | **Loyalty Tier:** ${(input.loyalty_tier || 'new').toUpperCase()} | **Segment:** ${result.guest_segment}`)
  lines.push('')
  lines.push('## Profile Summary')
  lines.push(`- **Past Stays:** ${input.past_stays || 0}`)
  lines.push(`- **Purpose:** ${input.purpose_of_visit || 'leisure'}`)
  lines.push(`- **Spending Pattern:** ${input.spending_pattern || 'moderate'}`)
  lines.push(`- **Retention Risk:** ${result.retention_risk.toUpperCase()}`)
  lines.push(`- **Est. Lifetime Value:** $${result.lifetime_value_estimate_usd.toLocaleString()}`)
  lines.push(`- **Personalization Score:** ${result.personalization_score}/100`)
  lines.push(`- **Room Upgrade Eligible:** ${result.room_upgrade_eligible ? 'YES' : 'NO'}`)
  lines.push('')
  lines.push('## Communication Tone')
  lines.push(result.communication_tone)
  lines.push('')
  lines.push('## Recommended Amenities')
  lines.push('| Priority | Category | Item | Cost | Reason |')
  lines.push('|----------|----------|------|------|--------|')
  for (const a of result.recommended_amenities) {
    lines.push(`| ${a.priority.toUpperCase()} | ${a.category} | ${a.item} | $${a.estimated_cost_usd} | ${a.reason} |`)
  }
  lines.push('')
  lines.push('## Surprise & Delight')
  for (const s of result.surprise_delight) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  if (result.notes.length > 0) {
    lines.push('## Important Notes')
    for (const n of result.notes) {
      lines.push(`- ${n}`)
    }
  }
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 3: TRAVEL ITINERARY PLANNER ====================

function planTravelItinerary(input: TravelItineraryInput): TravelItineraryResult {
  const rng = seededRng(JSON.stringify(input))
  const destinations = input.destinations && input.destinations.length > 0 ? input.destinations : ['Paris', 'Rome']
  const travelers = input.travelers || 2
  const budget = input.budget_usd || 5000
  const pace = input.pace || 'moderate'
  const interests = input.interests || ['culture', 'food', 'history']

  const startStr = input.travel_dates?.start || new Date().toISOString().split('T')[0]
  const startDate = new Date(startStr)
  const endStr = input.travel_dates?.end || new Date(startDate.getTime() + 7 * 86400000).toISOString().split('T')[0]
  const endDate = new Date(endStr)
  const totalDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000))

  const paceMultiplier = pace === 'relaxed' ? 0.7 : pace === 'packed' ? 1.5 : 1.0
  const daysPerStop = Math.max(1, Math.round((totalDays / destinations.length) * paceMultiplier))

  const days: ItineraryDay[] = []
  let dayCounter = 1
  let totalCost = 0

  const accommodationMap: Record<string, string> = {
    luxury: '5-star hotel or luxury resort',
    boutique: 'Boutique hotel with local character',
    budget: 'Well-rated 3-star hotel or hostel',
    airbnb: 'Vacation rental with kitchen access'
  }

  const transportMap: Record<string, string> = {
    flight: 'Flight between destinations',
    train: 'High-speed rail',
    car: 'Rental car / scenic drive',
    mixed: 'Mixed transport (flight + local transit)'
  }

  for (const dest of destinations) {
    if (dayCounter > totalDays) break
    const stopDays = Math.min(daysPerStop, totalDays - dayCounter + 1)

    for (let d = 0; d < stopDays; d++) {
      if (dayCounter > totalDays) break
      const currentDate = new Date(startDate.getTime() + (dayCounter - 1) * 86400000)
      const activities: string[] = []

      if (d === 0) {
        activities.push(`Arrive in ${dest}`, 'Check in and freshen up', 'Orientation walk of local neighborhood')
      }

      const baseActivities = [
        `${dest} city center exploration`, 'Local market visit', 'Photography walk'
      ]
      if (interests.includes('food')) baseActivities.push('Food tour at local restaurant', 'Cooking class')
      if (interests.includes('culture') || interests.includes('history')) baseActivities.push('Museum or gallery visit', 'Historical landmark tour')
      if (interests.includes('nature') || interests.includes('outdoor')) baseActivities.push('Park or garden visit', 'Scenic viewpoint hike')
      if (interests.includes('shopping')) baseActivities.push('Boutique shopping district', 'Local artisan market')
      if (interests.includes('nightlife')) baseActivities.push('Rooftop bar experience', 'Live music venue')

      const numActivities = Math.round(3 * paceMultiplier)
      for (let a = 0; a < numActivities; a++) {
        activities.push(baseActivities[Math.floor(rng.next() * baseActivities.length)])
      }

      const dailyCost = Math.round((budget / totalDays) * (1 + rng.nextFloat(-0.2, 0.3)))
      totalCost += dailyCost

      days.push({
        day: dayCounter,
        date: currentDate.toISOString().split('T')[0],
        location: dest,
        activities: [...new Set(activities)].slice(0, 6),
        transport: d === 0 ? (transportMap[input.transport_preference || 'mixed'] || 'Mixed transport') : 'Local transit',
        accommodation: accommodationMap[input.accommodation_type || 'boutique'] || 'Boutique hotel',
        estimated_cost_usd: dailyCost,
        tips: [`Book ${dest} attractions in advance for best rates`, 'Keep digital copies of tickets']
      })
      dayCounter++
    }
  }

  const packing: string[] = []
  packing.push(`Clothing for ${destinations.length} destination(s) - layer for temperature changes`)
  packing.push('Comfortable walking shoes')
  if (interests.includes('beach') || interests.includes('swimming')) packing.push('Swimwear and sunscreen')
  if (interests.includes('hiking')) packing.push('Hiking boots and rain jacket')
  packing.push('Universal power adapter')
  packing.push('Portable charger and daypack')
  packing.push('Travel documents and insurance info')

  const travelTips: string[] = []
  travelTips.push(`Notify bank of travel to: ${destinations.join(', ')}`)
  travelTips.push('Download offline maps for each destination')
  travelTips.push('Save embassy/consulate contact information')
  travelTips.push('Carry some local currency for small purchases')
  if (travelers > 2) travelTips.push('Group travel: set meeting points in case of separation')

  const contingency: string[] = []
  contingency.push('Keep 10-15% of budget as emergency reserve')
  contingency.push('Save accommodation address/phone in local language')
  contingency.push('Travel insurance: verify coverage for all destinations')
  contingency.push('Share itinerary with emergency contact')

  const booking: string[] = []
  booking.push(`Book accommodations in ${destinations.join(', ')} at least 3 weeks ahead`)
  booking.push('Compare flight prices across 3+ booking platforms')
  booking.push('Reserve popular restaurants for dinner slots')
  booking.push('Pre-book skip-the-line tickets for major attractions')

  return {
    trip_summary: `${totalDays}-day trip to ${destinations.join(', ')} for ${travelers} traveler(s)`,
    total_estimated_cost_usd: totalCost,
    cost_per_person_usd: Math.round(totalCost / travelers),
    days,
    packing_suggestions: packing,
    travel_tips: travelTips,
    contingency_notes: contingency,
    booking_recommendations: booking
  }
}

function formatTravelItineraryReport(input: TravelItineraryInput, result: TravelItineraryResult): string {
  const lines: string[] = []
  lines.push('# Travel Itinerary Plan')
  lines.push('')
  lines.push(`**Trip:** ${result.trip_summary}`)
  lines.push(`**Budget:** $${input.budget_usd?.toLocaleString() || '5,000'} | **Estimated Cost:** $${result.total_estimated_cost_usd.toLocaleString()} | **Per Person:** $${result.cost_per_person_usd.toLocaleString()}`)
  lines.push(`**Route:** ${(input.destinations || []).join(' -> ')}`)
  lines.push('')
  lines.push('## Day-by-Day Itinerary')
  for (const d of result.days) {
    lines.push(`### Day ${d.day} - ${d.date} | ${d.location}`)
    lines.push(`Transport: ${d.transport} | Accommodation: ${d.accommodation} | Cost: $${d.estimated_cost_usd}`)
    for (const a of d.activities) {
      lines.push(`- ${a}`)
    }
    lines.push('')
  }
  lines.push('## Packing Suggestions')
  for (const p of result.packing_suggestions) {
    lines.push(`- ${p}`)
  }
  lines.push('')
  lines.push('## Travel Tips')
  for (const t of result.travel_tips) {
    lines.push(`- ${t}`)
  }
  lines.push('')
  lines.push('## Booking Recommendations')
  for (const b of result.booking_recommendations) {
    lines.push(`- ${b}`)
  }
  lines.push('')
  lines.push('## Contingency Notes')
  for (const c of result.contingency_notes) {
    lines.push(`- ${c}`)
  }
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 4: DYNAMIC PRICING HOSPITALITY ====================

function calculateDynamicPricing(input: DynamicPricingInput): DynamicPricingResult {
  const rng = seededRng(JSON.stringify(input))
  const baseRate = input.base_rate || 200
  const demand = input.current_demand || 'normal'
  const competitorAvg = input.competitor_avg_rate || 190
  const daysUntil = input.days_until_checkin || 14
  const remainingInv = input.remaining_inventory_pct || 40

  const demandMultiplier: Record<string, number> = {
    very_low: 0.75, low: 0.88, normal: 1.0, high: 1.25, very_high: 1.55
  }

  const urgencyFactor = daysUntil <= 3 ? 1.2 : daysUntil <= 7 ? 1.1 : daysUntil <= 14 ? 1.0 : 0.92
  const scarcityFactor = remainingInv <= 15 ? 1.3 : remainingInv <= 30 ? 1.15 : remainingInv <= 50 ? 1.0 : 0.9
  const eventFactor = input.local_events && input.local_events.length > 0 ? (1 + input.local_events.length * 0.05) : 1.0

  const recommendedRate = Math.round(baseRate * (demandMultiplier[demand] || 1.0) * urgencyFactor * scarcityFactor * eventFactor * (1 + rng.nextFloat(-0.03, 0.05)))
  const minRate = Math.round(recommendedRate * 0.8)
  const maxRate = Math.round(recommendedRate * 1.35)

  const tiers: PricingTier[] = []
  tiers.push({
    tier_name: 'Advance Purchase (Non-refundable)',
    price_usd: Math.round(recommendedRate * 0.82),
    conditions: 'Book 31+ days in advance, no changes allowed',
    expected_conversion_pct: 15,
    revenue_impact: 'Secures baseline revenue early'
  })
  tiers.push({
    tier_name: 'Flexible Rate',
    price_usd: recommendedRate,
    conditions: 'Free cancellation until 48h before check-in',
    expected_conversion_pct: 45,
    revenue_impact: 'Primary revenue driver'
  })
  tiers.push({
    tier_name: 'Premium/Last Minute',
    price_usd: Math.round(recommendedRate * 1.3),
    conditions: 'Booked within 48h of arrival, includes perks',
    expected_conversion_pct: 20,
    revenue_impact: 'Captures urgent demand at premium'
  })
  tiers.push({
    tier_name: 'Package Bundle',
    price_usd: Math.round(recommendedRate * 1.45),
    conditions: 'Rate + dining credit + spa access',
    expected_conversion_pct: 20,
    revenue_impact: 'Increases total spend per booking'
  })

  let strategy = 'Balanced pricing with moderate restrictions'
  if (demand === 'very_high') strategy = 'Aggressive revenue maximization - tighten restrictions and raise rates'
  else if (demand === 'high') strategy = 'Revenue optimization - selective discounting only for loyal guests'
  else if (demand === 'very_low') strategy = 'Volume-focused - open discounts and remove restrictions'
  else if (demand === 'low') strategy = 'Competitive positioning - targeted promotions to fill gaps'

  const restrictions: string[] = []
  if (demand === 'high' || demand === 'very_high') {
    restrictions.push('Minimum 2-night stay on weekends')
    restrictions.push('Non-refundable deposit required')
    restrictions.push('No same-day booking discount')
  }
  if (remainingInv <= 20) {
    restrictions.push('Close out discount codes')
    restrictions.push('Restrict OTA inventory to 10%')
  }
  if (restrictions.length === 0) {
    restrictions.push('Standard cancellation policy applies')
    restrictions.push('Open all discount channels')
  }

  const upsells: string[] = []
  upsells.push('Room upgrade offer at 40% discount (pre-arrival email)')
  upsells.push('Late checkout for $45')
  if (input.local_events && input.local_events.length > 0) {
    upsells.push(`Event tickets package: ${input.local_events[0]}`)
  }
  upsells.push('Airport transfer bundle')
  upsells.push('In-room dining credit ($50 for $35)')

  const compPositioning = recommendedRate > competitorAvg * 1.1 ? 'Premium positioning (above market)' :
    recommendedRate < competitorAvg * 0.9 ? 'Value positioning (below market)' : 'Market-aligned pricing'

  const confidence = clamp(Math.round(75 + rng.nextFloat(-10, 15)), 50, 98)

  return {
    recommended_rate_usd: recommendedRate,
    min_rate_usd: minRate,
    max_rate_usd: maxRate,
    pricing_tiers: tiers,
    strategy,
    confidence_pct: confidence,
    restrictions,
    upsell_opportunities: upsells,
    competitive_positioning: compPositioning
  }
}

function formatDynamicPricingReport(input: DynamicPricingInput, result: DynamicPricingResult): string {
  const lines: string[] = []
  lines.push('# Dynamic Pricing Strategy Report')
  lines.push('')
  lines.push(`**Hotel:** ${input.hotel_name || 'Property Analysis'} | **Room Type:** ${input.room_type || 'Standard'} | **Demand:** ${(input.current_demand || 'normal').toUpperCase()}`)
  lines.push('')
  lines.push('## Rate Recommendation')
  lines.push('')
  lines.push(`| Min Rate | Recommended | Max Rate | Confidence |`)
  lines.push(`|----------|-------------|----------|------------|`)
  lines.push(`| $${result.min_rate_usd} | $${result.recommended_rate_usd} | $${result.max_rate_usd} | ${result.confidence_pct}% |`)
  lines.push('')
  lines.push(`**Strategy:** ${result.strategy}`)
  lines.push(`**Competitive Positioning:** ${result.competitive_positioning}`)
  lines.push('')
  lines.push('## Pricing Tiers')
  lines.push('| Tier | Price | Conversion Est. | Revenue Impact |')
  lines.push('|------|-------|-----------------|---------------|')
  for (const t of result.pricing_tiers) {
    lines.push(`| ${t.tier_name} | $${t.price_usd} | ${t.expected_conversion_pct}% | ${t.revenue_impact} |`)
  }
  lines.push('')
  lines.push('## Restrictions & Rules')
  for (const r of result.restrictions) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push('## Upsell Opportunities')
  for (const u of result.upsell_opportunities) {
    lines.push(`- ${u}`)
  }
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 5: REVIEW SENTIMENT ANALYZER ====================

function analyzeReviewSentiment(input: ReviewSentimentInput): ReviewSentimentResult {
  const rng = seededRng(JSON.stringify(input))
  const reviews = input.reviews || [
    'Amazing stay with beautiful rooms and excellent service',
    'Breakfast was disappointing and room was noisy',
    'Perfect location and very friendly staff',
    'Bed was uncomfortable and bathroom needed updating',
    'Great value for money, would definitely come back'
  ]

  const categories = input.categories || ['service', 'cleanliness', 'location', 'value', 'rooms', 'food']
  const categoryScores: SentimentScore[] = []

  for (const cat of categories) {
    let posCount = 0
    let negCount = 0
    const phrases: string[] = []

    const posWords = ['excellent', 'amazing', 'great', 'perfect', 'wonderful', 'beautiful', 'friendly', 'clean', 'comfortable', 'love', 'best', 'fantastic']
    const negWords = ['terrible', 'bad', 'disappointing', 'noisy', 'dirty', 'uncomfortable', 'poor', 'rude', 'worst', 'broken', 'outdated', 'overpriced']

    const catKeywords: Record<string, string[]> = {
      service: ['service', 'staff', 'reception', 'check-in', 'check-out', 'concierge', 'helpful', 'friendly'],
      cleanliness: ['clean', 'dirty', 'spotless', 'hygiene', 'fresh', 'tidy', 'mess'],
      location: ['location', 'central', 'accessible', 'nearby', 'transport', 'walk', 'distance'],
      value: ['value', 'price', 'worth', 'expensive', 'cheap', 'overpriced', 'money'],
      rooms: ['room', 'bed', 'bathroom', 'suite', 'balcony', 'view', 'pillow', 'shower'],
      food: ['breakfast', 'dinner', 'restaurant', 'food', 'meal', 'cuisine', 'dining']
    }

    const keywords = catKeywords[cat] || [cat]
    for (const review of reviews) {
      const lower = review.toLowerCase()
      const hasKeyword = keywords.some(k => lower.includes(k))
      if (hasKeyword) {
        const hasPos = posWords.some(w => lower.includes(w))
        const hasNeg = negWords.some(w => lower.includes(w))
        if (hasPos) posCount++
        if (hasNeg) negCount++
        const words = lower.split(' ')
        for (let i = 0; i < words.length; i++) {
          if (keywords.some(k => words[i].includes(k))) {
            phrases.push(words.slice(Math.max(0, i - 1), i + 2).join(' '))
          }
        }
      }
    }

    const total = posCount + negCount || 1
    const score = clamp(((posCount / total) * 100), 5, 98)
    const label: 'positive' | 'neutral' | 'negative' = score >= 65 ? 'positive' : score >= 40 ? 'neutral' : 'negative'

    categoryScores.push({
      category: cat,
      score: Math.round(score),
      label,
      mention_count: total,
      top_phrases: [...new Set(phrases)].slice(0, 3)
    })
  }

  const strengths: string[] = []
  const weaknesses: string[] = []
  const insights: string[] = []

  for (const cs of categoryScores) {
    if (cs.label === 'positive' && cs.score >= 70) {
      strengths.push(`${cs.category}: ${cs.score}% positive sentiment`)
    }
    if (cs.label === 'negative' && cs.score < 45) {
      weaknesses.push(`${cs.category}: ${cs.score}% positive sentiment - needs attention`)
    }
  }

  if (strengths.length === 0) strengths.push('General satisfaction with overall stay experience')
  if (weaknesses.length === 0) weaknesses.push('No major concerns identified - maintain current standards')

  insights.push('Prioritize improvement on lowest-scoring categories first')
  insights.push('Respond to negative reviews within 24 hours for best recovery')
  insights.push('Leverage positive review themes in marketing materials')
  insights.push('Create action plan for each negative category with 30-day targets')

  const avgScore = categoryScores.reduce((s, c) => s + c.score, 0) / categoryScores.length
  const overallSentiment: 'positive' | 'neutral' | 'negative' = avgScore >= 65 ? 'positive' : avgScore >= 40 ? 'neutral' : 'negative'

  const trendDir: 'improving' | 'stable' | 'declining' = rng.next() < 0.4 ? 'improving' : rng.next() < 0.6 ? 'stable' : 'declining'

  return {
    overall_sentiment: overallSentiment,
    overall_score: Math.round(avgScore),
    total_reviews_analyzed: reviews.length,
    category_scores: categoryScores,
    key_strengths: strengths,
    key_weaknesses: weaknesses,
    actionable_insights: insights,
    trend_direction: trendDir,
    benchmark_comparison: avgScore >= 70 ? 'Above industry average (70%)' : avgScore >= 55 ? 'At industry average' : 'Below industry average - action required'
  }
}

function formatReviewSentimentReport(input: ReviewSentimentInput, result: ReviewSentimentResult): string {
  const lines: string[] = []
  lines.push('# Review Sentiment Analysis Report')
  lines.push('')
  lines.push(`**Source:** ${input.source || 'all'} | **Reviews Analyzed:** ${result.total_reviews_analyzed} | **Overall Sentiment:** ${result.overall_sentiment.toUpperCase()}`)
  lines.push('')
  lines.push(`**Overall Score:** ${result.overall_score}% | **Trend:** ${result.trend_direction.toUpperCase()} | ${result.benchmark_comparison}`)
  lines.push('')
  lines.push('## Category Scores')
  lines.push('| Category | Score | Label | Mentions | Top Phrases |')
  lines.push('|----------|-------|-------|----------|-------------|')
  for (const cs of result.category_scores) {
    lines.push(`| ${cs.category} | ${cs.score}% | ${cs.label.toUpperCase()} | ${cs.mention_count} | ${cs.top_phrases.join('; ') || 'N/A'} |`)
  }
  lines.push('')
  lines.push('## Key Strengths')
  for (const s of result.key_strengths) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  lines.push('## Key Weaknesses')
  for (const w of result.key_weaknesses) {
    lines.push(`- ${w}`)
  }
  lines.push('')
  lines.push('## Actionable Insights')
  for (const i of result.actionable_insights) {
    lines.push(`- ${i}`)
  }
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 6: HOUSEKEEPING SCHEDULER AI ====================

function scheduleHousekeeping(input: HousekeepingInput): HousekeepingScheduleResult {
  const rng = seededRng(JSON.stringify(input))
  const totalRooms = input.total_rooms || 150
  const occupied = input.occupied_rooms || 108
  const checkouts = input.checkout_rooms || 45
  const vipRooms = input.vip_rooms || 8
  const staff = input.staff_available || 12
  const shiftHours = input.shift_hours || 8

  const minutesPerRoom = 28
  const vipExtraMinutes = 15
  const priorityRooms = input.priority_rooms || []

  const assignments: CleaningAssignment[] = []
  const vipCount = Math.min(vipRooms, checkouts)
  const standardCheckouts = checkouts - vipCount
  const stayoverRooms = Math.max(0, occupied - checkouts)

  if (vipCount > 0) {
    assignments.push({
      room_range: `VIP Rooms (${vipCount} rooms)`,
      staff_count: Math.max(1, Math.ceil(vipCount / 3)),
      estimated_minutes: (minutesPerRoom + vipExtraMinutes) * vipCount,
      priority: 'urgent',
      special_instructions: ['Double-check all amenities', 'Place VIP welcome gift', 'Report any maintenance issues immediately', 'Quality supervisor sign-off required']
    })
  }

  if (standardCheckouts > 0) {
    assignments.push({
      room_range: `Standard Check-outs (${standardCheckouts} rooms)`,
      staff_count: Math.max(2, Math.ceil(standardCheckouts / 6)),
      estimated_minutes: minutesPerRoom * standardCheckouts,
      priority: 'high',
      special_instructions: ['Full deep clean protocol', 'Check minibar and restock', 'Report damages or missing items']
    })
  }

  if (stayoverRooms > 0) {
    assignments.push({
      room_range: `Stayover Rooms (${stayoverRooms} rooms)`,
      staff_count: Math.max(2, Math.ceil(stayoverRooms / 10)),
      estimated_minutes: Math.round(minutesPerRoom * 0.5 * stayoverRooms),
      priority: 'normal',
      special_instructions: ['Towel and linen replacement as requested', 'Trash removal and surface clean', 'Do not disturb sign awareness']
    })
  }

  if (priorityRooms.length > 0) {
    assignments.push({
      room_range: `Priority Rooms (${priorityRooms.length} rooms)`,
      staff_count: Math.max(1, Math.ceil(priorityRooms.length / 2)),
      estimated_minutes: (minutesPerRoom + 10) * priorityRooms.length,
      priority: 'urgent',
      special_instructions: ['Expedited cleaning for early arrivals', 'Front desk coordination required', 'Priority inspection']
    })
  }

  const totalMinutes = assignments.reduce((s, a) => s + a.estimated_minutes, 0)
  const availableMinutes = staff * shiftHours * 60
  const utilization = clamp(Math.round((totalMinutes / availableMinutes) * 100), 20, 100)

  const prioritySequence: string[] = []
  if (vipCount > 0) prioritySequence.push(`1. VIP rooms (${vipCount}) - within first hour`)
  if (priorityRooms.length > 0) prioritySequence.push(`2. Priority rooms (${priorityRooms.length}) - before noon`)
  if (standardCheckouts > 0) prioritySequence.push(`3. Standard check-outs (${standardCheckouts}) - by 3 PM`)
  if (stayoverRooms > 0) prioritySequence.push(`4. Stayover rooms (${stayoverRooms}) - during low-activity hours`)

  const completionHours = Math.max(1, Math.round((totalMinutes / (staff * 60)) * 10) / 10)
  const hours = Math.floor(completionHours)
  const mins = Math.round((completionHours - hours) * 60)
  const completionTime = `${hours}h ${mins}m`

  const qualityCheckRooms: string[] = []
    qualityCheckRooms.push(`All ${vipCount} VIP rooms (supervisor inspection)`)
  qualityCheckRooms.push(`${Math.min(5, standardCheckouts)} random standard rooms`)
  if (input.maintenance_issues && input.maintenance_issues.length > 0) {
    qualityCheckRooms.push(`${input.maintenance_issues.length} maintenance-affected rooms`)
  }

  const efficiencyTips: string[] = []
  if (utilization > 90) efficiencyTips.push('High utilization - consider calling backup staff or adjusting priorities')
  if (utilization < 50) efficiencyTips.push('Lower utilization - good time for deep-cleaning or training')
  efficiencyTips.push('Pre-position cleaning carts on each floor before shift start')
  efficiencyTips.push('Coordinate with front desk for real-time room status updates')
  efficiencyTips.push('Batch rooms by floor to minimize transit time')

  const contingency: string[] = []
  if (input.maintenance_issues && input.maintenance_issues.length > 0) {
    contingency.push(`Active maintenance issues: ${input.maintenance_issues.join(', ')} - notify engineering`)
  }
  if (input.event_disruptions && input.event_disruptions.length > 0) {
    contingency.push(`Event impact: ${input.event_disruptions.join(', ')} - adjust staffing accordingly`)
  }
  contingency.push('If staff call in sick: redistribute rooms to remaining team, extend shift by 1hr if needed')
  contingency.push('If VIP arrival early: pull 2 staff from stayover cleaning for priority')
  contingency.push('Keep 2 rooms pre-cleaned as buffer for unexpected VIP arrivals')

  return {
    total_cleaning_minutes: totalMinutes,
    staff_utilization_pct: utilization,
    assignments,
    priority_sequence: prioritySequence,
    estimated_completion_time: completionTime,
    quality_check_rooms: qualityCheckRooms,
    efficiency_tips: efficiencyTips,
    contingency_plans: contingency
  }
}

function formatHousekeepingReport(input: HousekeepingInput, result: HousekeepingScheduleResult): string {
  const lines: string[] = []
  lines.push('# AI Housekeeping Schedule Report')
  lines.push('')
  lines.push(`**Total Rooms:** ${input.total_rooms || 150} | **Occupied:** ${input.occupied_rooms || 108} | **Check-outs:** ${input.checkout_rooms || 45} | **Staff:** ${input.staff_available || 12}`)
  lines.push('')
  lines.push(`**Total Cleaning Load:** ${result.total_cleaning_minutes} minutes | **Utilization:** ${result.staff_utilization_pct}% | **Completion Time:** ${result.estimated_completion_time}`)
  lines.push('')
  lines.push('## Staff Assignments')
  for (const a of result.assignments) {
    lines.push(`### ${a.priority.toUpperCase()} - ${a.room_range}`)
    lines.push(`Staff: ${a.staff_count} | Est. Time: ${a.estimated_minutes} minutes`)
    for (const instr of a.special_instructions) {
      lines.push(`- ${instr}`)
    }
    lines.push('')
  }
  lines.push('## Priority Sequence')
  for (const p of result.priority_sequence) {
    lines.push(`- ${p}`)
  }
  lines.push('')
  lines.push('## Quality Check Rooms')
  for (const q of result.quality_check_rooms) {
    lines.push(`- ${q}`)
  }
  lines.push('')
  lines.push('## Efficiency Tips')
  for (const t of result.efficiency_tips) {
    lines.push(`- ${t}`)
  }
  lines.push('')
  lines.push('## Contingency Plans')
  for (const c of result.contingency_plans) {
    lines.push(`- ${c}`)
  }
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 7: RESTAURANT MENU OPTIMIZER ====================

function optimizeMenu(input: MenuOptimizerInput): MenuOptimizationResult {
  const rng = seededRng(JSON.stringify(input))
  const items = input.menu_items || ['Grilled Salmon', 'Beef Tenderloin', 'Caesar Salad', 'Pasta Carbonara', 'Chocolate Souffle', 'Lobster Bisque', 'Veggie Burger', 'Fish & Chips']
  const foodCostPct = input.food_cost_pct || 30
  const avgPrice = input.avg_dish_price || 28
  const category = input.category || 'casual'

  const itemAnalyses: MenuItemAnalysis[] = []
  const stars: string[] = []
  const plowHorses: string[] = []
  const puzzles: string[] = []
  const dogs: string[] = []

  for (const item of items) {
    const popularity = clamp(Math.round(40 + rng.nextFloat(-20, 50)), 10, 98)
    const profitMargin = clamp(Math.round((100 - foodCostPct) + rng.nextFloat(-15, 20)), 15, 85)

    let classification: 'star' | 'plow_horse' | 'puzzle' | 'dog'
    let recommendation: string
    let suggestedPrice = avgPrice

    if (popularity >= 60 && profitMargin >= 55) {
      classification = 'star'
      recommendation = 'Prominent placement on menu - maintain quality and price'
      suggestedPrice = Math.round(avgPrice * 1.15)
      stars.push(item)
    } else if (popularity >= 60 && profitMargin < 55) {
      classification = 'plow_horse'
      recommendation = 'Increase price slightly or reduce portion cost to improve margin'
      suggestedPrice = Math.round(avgPrice * 1.08)
      plowHorses.push(item)
    } else if (popularity < 60 && profitMargin >= 55) {
      classification = 'puzzle'
      recommendation = 'Promote through staff recommendations and menu engineering'
      suggestedPrice = avgPrice
      puzzles.push(item)
    } else {
      classification = 'dog'
      recommendation = 'Consider removal or complete rework of recipe and presentation'
      suggestedPrice = Math.round(avgPrice * 0.9)
      dogs.push(item)
    }

    itemAnalyses.push({
      item_name: item,
      profit_margin_pct: profitMargin,
      popularity_score: popularity,
      classification,
      recommendation,
      suggested_price_usd: suggestedPrice
    })
  }

  const suggestedAdditions: string[] = []
  if (input.dietary_trends) {
    for (const trend of input.dietary_trends.slice(0, 3)) {
      suggestedAdditions.push(`${trend}-friendly option (market demand)`)
    }
  }
  if (input.seasonal_ingredients && input.seasonal_ingredients.length > 0) {
    suggestedAdditions.push(`Seasonal special featuring ${input.seasonal_ingredients[0]}`)
  }
  if (suggestedAdditions.length === 0) {
    suggestedAdditions.push('Plant-based protein option (growing demand)')
    suggestedAdditions.push('Local sourcing highlight dish')
    suggestedAdditions.push('Chef seasonal tasting special')
  }

  const removals = dogs.slice(0, 2).map(d => `${d} - low popularity and low margin`)

  const pricingRecs: string[] = []
  if (plowHorses.length > 0) pricingRecs.push(`Increase prices on: ${plowHorses.slice(0, 2).join(', ')} (popular but underpriced)`)
  if (puzzles.length > 0) pricingRecs.push(`Promote high-margin items: ${puzzles.slice(0, 2).join(', ')} (deserve more orders)`)
  pricingRecs.push('Use decoy pricing: place highest-margin item next to premium option')
  pricingRecs.push('Remove dollar signs from menu (reduces price sensitivity)')

  const seasonalSpecials: string[] = []
  if (input.seasonal_ingredients) {
    for (const ing of input.seasonal_ingredients.slice(0, 3)) {
      seasonalSpecials.push(`${ing} special - limited time offer`)
    }
  }
  if (seasonalSpecials.length === 0) {
    seasonalSpecials.push('Summer berry dessert special')
    seasonalSpecials.push('Harvest seasonal vegetable plate')
    seasonalSpecials.push('Holiday tasting menu (limited availability)')
  }

  const healthScore = clamp(Math.round(
    (stars.length * 15) + (puzzles.length * 10) - (dogs.length * 10) + (itemAnalyses.reduce((s, i) => s + i.profit_margin_pct, 0) / itemAnalyses.length) + rng.nextFloat(-5, 10)
  ), 15, 98)

  return {
    menu_health_score: healthScore,
    item_analyses: itemAnalyses,
    stars,
    plow_horses: plowHorses,
    puzzles,
    dogs,
    suggested_additions: suggestedAdditions,
    suggested_removals: removals,
    pricing_recommendations: pricingRecs,
    seasonal_specials: seasonalSpecials
  }
}

function formatMenuOptimizerReport(input: MenuOptimizerInput, result: MenuOptimizationResult): string {
  const lines: string[] = []
  lines.push('# Restaurant Menu Optimization Report')
  lines.push('')
  lines.push(`**Category:** ${(input.category || 'casual').toUpperCase()} | **Items Analyzed:** ${result.item_analyses.length} | **Menu Health Score:** ${result.menu_health_score}/100`)
  lines.push('')
  lines.push('## Menu Item Analysis')
  lines.push('| Item | Margin | Popularity | Class | Suggested Price | Recommendation |')
  lines.push('|------|--------|------------|-------|-----------------|----------------|')
  for (const ia of result.item_analyses) {
    lines.push(`| ${ia.item_name} | ${ia.profit_margin_pct}% | ${ia.popularity_score} | ${ia.classification.toUpperCase()} | $${ia.suggested_price_usd} | ${ia.recommendation} |`)
  }
  lines.push('')
  lines.push('## Classification Summary')
  lines.push(`**Stars** (high pop + high margin): ${result.stars.join(', ') || 'None'}`)
  lines.push(`**Plow Horses** (high pop + low margin): ${result.plow_horses.join(', ') || 'None'}`)
  lines.push(`**Puzzles** (low pop + high margin): ${result.puzzles.join(', ') || 'None'}`)
  lines.push(`**Dogs** (low pop + low margin): ${result.dogs.join(', ') || 'None'}`)
  lines.push('')
  lines.push('## Suggested Additions')
  for (const a of result.suggested_additions) {
    lines.push(`- ${a}`)
  }
  lines.push('')
  if (result.suggested_removals.length > 0) {
    lines.push('## Suggested Removals')
    for (const r of result.suggested_removals) {
      lines.push(`- ${r}`)
    }
    lines.push('')
  }
  lines.push('## Pricing Recommendations')
  for (const p of result.pricing_recommendations) {
    lines.push(`- ${p}`)
  }
  lines.push('')
  lines.push('## Seasonal Specials')
  for (const s of result.seasonal_specials) {
    lines.push(`- ${s}`)
  }
  lines.push('')
  return lines.join('\n')
}

// ==================== TOOL 8: EVENTS CONFERENCE PLANNER ====================

function planEventsConference(input: EventsConferenceInput): EventsConferenceResult {
  const rng = seededRng(JSON.stringify(input))
  const eventType = input.event_type || 'conference'
  const attendees = input.expected_attendees || 150
  const duration = input.duration_hours || 8
  const budget = input.budget_usd || 25000
  const venueType = input.venue_type || 'indoor'

  const budgetBreakdown: EventBreakdown[] = []

  if (eventType === 'wedding') {
    budgetBreakdown.push({ category: 'Venue & Catering', percentage: 45, estimated_cost_usd: Math.round(budget * 0.45), recommendations: ['Book 12-18 months ahead', 'Consider off-peak dates for savings'] })
    budgetBreakdown.push({ category: 'Photography & Decor', percentage: 20, estimated_cost_usd: Math.round(budget * 0.20), recommendations: ['Prioritize photography - lasting memories', 'DIY where possible for decor'] })
    budgetBreakdown.push({ category: 'Entertainment & Attire', percentage: 15, estimated_cost_usd: Math.round(budget * 0.15), recommendations: ['Book DJ/band 6+ months ahead', 'Include attire in early budget'] })
    budgetBreakdown.push({ category: 'Miscellaneous', percentage: 20, estimated_cost_usd: Math.round(budget * 0.20), recommendations: ['Contingency fund (10%)', 'Gifts, transport, unexpected'] })
  } else if (eventType === 'corporate') {
    budgetBreakdown.push({ category: 'Venue & AV', percentage: 35, estimated_cost_usd: Math.round(budget * 0.35), recommendations: ['Negotiate AV package deals', 'Check for in-house tech support'] })
    budgetBreakdown.push({ category: 'Catering', percentage: 25, estimated_cost_usd: Math.round(budget * 0.25), recommendations: ['Buffet more cost-effective than plated', 'Include dietary options'] })
    budgetBreakdown.push({ category: 'Speakers & Content', percentage: 20, estimated_cost_usd: Math.round(budget * 0.20), recommendations: ['Book keynote 6+ months ahead', 'Record sessions for post-event value'] })
    budgetBreakdown.push({ category: 'Marketing & Materials', percentage: 20, estimated_cost_usd: Math.round(budget * 0.20), recommendations: ['Digital-first approach saves costs', 'Sponsorship to offset expenses'] })
  } else {
    budgetBreakdown.push({ category: 'Venue', percentage: 30, estimated_cost_usd: Math.round(budget * 0.30), recommendations: ['Book 6-12 months ahead', 'Negotiate multi-day discounts'] })
    budgetBreakdown.push({ category: 'Catering', percentage: 25, estimated_cost_usd: Math.round(budget * 0.25), recommendations: ['Per-person pricing for accuracy', 'Coffee breaks boost engagement'] })
    budgetBreakdown.push({ category: 'AV & Technology', percentage: 20, estimated_cost_usd: Math.round(budget * 0.20), recommendations: ['Test all equipment day before', 'Have backup for critical components'] })
    budgetBreakdown.push({ category: 'Marketing & Operations', percentage: 25, estimated_cost_usd: Math.round(budget * 0.25), recommendations: ['Early bird pricing drives registrations', 'Event app reduces printing costs'] })
  }

  const milestones: EventMilestone[] = []
  const baseOffset = eventType === 'wedding' ? 365 : eventType === 'conference' ? 180 : 120

  milestones.push({ milestone: 'Venue booking confirmed', deadline_offset_days: baseOffset, status: 'pending', notes: 'Sign contract and pay deposit' })
  milestones.push({ milestone: 'Keynote speakers confirmed', deadline_offset_days: Math.round(baseOffset * 0.7), status: 'pending', notes: 'Confirm travel arrangements' })
  milestones.push({ milestone: 'Marketing launch', deadline_offset_days: Math.round(baseOffset * 0.5), status: 'pending', notes: 'Open registration, send save-the-dates' })
  milestones.push({ milestone: 'Catering menu finalized', deadline_offset_days: Math.round(baseOffset * 0.25), status: 'pending', notes: 'Confirm headcount and dietary needs' })
  milestones.push({ milestone: 'AV setup and rehearsal', deadline_offset_days: 1, status: 'pending', notes: 'Full tech rehearsal with speakers' })
  milestones.push({ milestone: 'Event day execution', deadline_offset_days: 0, status: 'pending', notes: 'Run-of-show briefing with all teams' })

  const venueRecs: string[] = []
  if (venueType === 'indoor') {
    venueRecs.push(`Conference center with ${attendees + 50} capacity`)
    venueRecs.push('Hotel ballroom with breakout rooms')
    venueRecs.push('University lecture hall complex')
  } else if (venueType === 'outdoor') {
    venueRecs.push('Garden venue with indoor backup option')
    venueRecs.push('Rooftop event space with weather contingency')
    venueRecs.push('Resort grounds with pavilion')
  } else {
    venueRecs.push('Hybrid venue with built-in streaming capability')
    venueRecs.push('Convention center with virtual event platform')
  }

  const cateringOptions: string[] = []
  if (input.catering_required) {
    cateringOptions.push(`Platted dinner for ${attendees} (premium experience)`)
    cateringOptions.push(`Buffet service for ${attendees} (cost-effective)`)
    cateringOptions.push('Food stations (interactive, encourages networking)')
    cateringOptions.push('Boxed lunches (efficient for multi-session events)')
    cateringOptions.push('Coffee/tea station with light pastries (break service)')
  } else {
    cateringOptions.push('Catering not required - consider light refreshments for attendee comfort')
  }

  const avSetup: string[] = []
  if (input.av_requirements && input.av_requirements.length > 0) {
    for (const av of input.av_requirements) {
      avSetup.push(`${av} - confirm setup time and technician availability`)
    }
  } else {
    avSetup.push('Projector and screen for main stage')
    avSetup.push('Wireless microphone (lapel + handheld)')
    avSetup.push('Sound system with zone control')
    avSetup.push('Recording equipment for session capture')
  }
  if (venueType === 'hybrid') {
    avSetup.push('Live streaming setup with chat moderation')
    avSetup.push('Virtual Q&A platform integration')
  }

  const risks: string[] = []
  risks.push('Weather contingency for outdoor components')
  risks.push('Speaker cancellation - have backup speakers on standby')
  risks.push('Lower-than-expected registration - build in 20% buffer')
  risks.push('AV equipment failure - redundant systems for critical components')
  if (attendees > 300) risks.push('Crowd management and safety - coordinate with venue security')

  const experienceTips: string[] = []
  experienceTips.push('Personalized welcome message at registration')
  experienceTips.push('Networking breaks every 90 minutes for engagement')
  experienceTips.push('Mobile event app with schedule and networking features')
  experienceTips.push('Post-event survey within 24 hours for feedback')
  experienceTips.push('Follow-up content delivery within 1 week')

  const marketing: string[] = []
  marketing.push('Early bird pricing (20% discount) opens 3 months before')
  marketing.push('Social media campaign with event hashtag')
  marketing.push('Email drip sequence to target audience')
  marketing.push('Partner/sponsor cross-promotion')
  marketing.push('Post-event highlight reel for future promotion')

  const perPersonBudget = budget / attendees
  const feasibility: 'highly_feasible' | 'feasible' | 'challenging' | 'not_recommended' =
    perPersonBudget >= 150 ? 'highly_feasible' : perPersonBudget >= 75 ? 'feasible' : perPersonBudget >= 30 ? 'challenging' : 'not_recommended'

  return {
    event_feasibility: feasibility,
    budget_breakdown: budgetBreakdown,
    milestone_timeline: milestones,
    venue_recommendations: venueRecs,
    catering_options: cateringOptions,
    av_setup: avSetup,
    risk_factors: risks,
    attendee_experience_tips: experienceTips,
    marketing_suggestions: marketing
  }
}

function formatEventsConferenceReport(input: EventsConferenceInput, result: EventsConferenceResult): string {
  const lines: string[] = []
  lines.push('# Events & Conference Planning Report')
  lines.push('')
  lines.push(`**Event Type:** ${(input.event_type || 'conference').toUpperCase()} | **Attendees:** ${input.expected_attendees || 150} | **Duration:** ${input.duration_hours || 8}h | **Budget:** $${(input.budget_usd || 25000).toLocaleString()}`)
  lines.push('')
  lines.push(`**Feasibility:** ${result.event_feasibility.replace('_', ' ').toUpperCase()}`)
  lines.push('')
  lines.push('## Budget Breakdown')
  lines.push('| Category | Percentage | Estimated Cost | Recommendations |')
  lines.push('|----------|------------|----------------|-----------------|')
  for (const b of result.budget_breakdown) {
    lines.push(`| ${b.category} | ${b.percentage}% | $${b.estimated_cost_usd.toLocaleString()} | ${b.recommendations.join('; ')} |`)
  }
  lines.push('')
  lines.push('## Milestone Timeline')
  lines.push('| Milestone | Days Before Event | Status | Notes |')
  lines.push('|-----------|-------------------|--------|-------|')
  for (const m of result.milestone_timeline) {
    lines.push(`| ${m.milestone} | ${m.deadline_offset_days} | ${m.status.replace('_', ' ').toUpperCase()} | ${m.notes} |`)
  }
  lines.push('')
  lines.push('## Venue Recommendations')
  for (const v of result.venue_recommendations) {
    lines.push(`- ${v}`)
  }
  lines.push('')
  lines.push('## Catering Options')
  for (const c of result.catering_options) {
    lines.push(`- ${c}`)
  }
  lines.push('')
  lines.push('## AV Setup')
  for (const a of result.av_setup) {
    lines.push(`- ${a}`)
  }
  lines.push('')
  lines.push('## Risk Factors')
  for (const r of result.risk_factors) {
    lines.push(`- ${r}`)
  }
  lines.push('')
  lines.push('## Attendee Experience Tips')
  for (const e of result.attendee_experience_tips) {
    lines.push(`- ${e}`)
  }
  lines.push('')
  lines.push('## Marketing Suggestions')
  for (const m of result.marketing_suggestions) {
    lines.push(`- ${m}`)
  }
  lines.push('')
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Hotel Revenue Optimizer
  tools.register(defineTool({
    name: 'hotel_revenue_optimizer',
    description: 'Analyze hotel revenue performance with RevPAR, ADR, and occupancy metrics. Compares against benchmarks, identifies revenue opportunities, recommends pricing strategies, and provides quarterly forecasts. Input includes hotel data, competitor rates, season, and nearby events.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: hotel_name (string), total_rooms (number), occupied_rooms (number), average_daily_rate (number), competitor_rates (number[]), season (peak|shoulder|low), events_nearby (string[]), historical_occupancy (number[])', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: HotelRevenueInput = JSON.parse(args.input_data)
      const result = optimizeHotelRevenue(input)
      return formatRevenueReport(input, result)
    }
  }))

  // Tool 2: Guest Experience Personalizer
  tools.register(defineTool({
    name: 'guest_experience_personalizer',
    description: 'Create personalized guest experiences based on loyalty tier, past stays, preferences, dietary needs, and purpose of visit. Recommends amenities, room upgrades, communication tone, and surprise-and-delight moments. Includes retention risk assessment and lifetime value estimation.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: guest_id (string), loyalty_tier (new|bronze|silver|gold|platinum), past_stays (number), preferences (string[]), dietary_restrictions (string[]), purpose_of_visit (leisure|business|celebration|family), special_requests (string[]), previous_complaints (string[]), spending_pattern (budget|moderate|luxury)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: GuestProfileInput = JSON.parse(args.input_data)
      const result = personalizeGuestExperience(input)
      return formatGuestExperienceReport(input, result)
    }
  }))

  // Tool 3: Travel Itinerary Planner
  tools.register(defineTool({
    name: 'travel_itinerary_planner',
    description: 'Plan multi-destination travel itineraries with day-by-day scheduling, activity recommendations, transport options, accommodation suggestions, and budget optimization. Supports various travel paces, interests, and group sizes.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: origin (string), destinations (string[]), travel_dates (object with start/end), budget_usd (number), travelers (number), interests (string[]), pace (relaxed|moderate|packed), transport_preference (flight|train|car|mixed), accommodation_type (luxury|boutique|budget|airbnb)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: TravelItineraryInput = JSON.parse(args.input_data)
      const result = planTravelItinerary(input)
      return formatTravelItineraryReport(input, result)
    }
  }))

  // Tool 4: Dynamic Pricing Hospitality
  tools.register(defineTool({
    name: 'dynamic_pricing_hospitality',
    description: 'Calculate optimal real-time pricing for hotel rooms based on demand levels, competitor rates, booking urgency, remaining inventory, local events, and historical pickup rates. Provides tiered pricing strategies with restrictions and upsell opportunities.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: hotel_name (string), room_type (string), base_rate (number), current_demand (very_low|low|normal|high|very_high), competitor_avg_rate (number), days_until_checkin (number), local_events (string[]), historical_pickup_rate (number), remaining_inventory_pct (number)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: DynamicPricingInput = JSON.parse(args.input_data)
      const result = calculateDynamicPricing(input)
      return formatDynamicPricingReport(input, result)
    }
  }))

  // Tool 5: Review Sentiment Analyzer
  tools.register(defineTool({
    name: 'review_sentiment_analyzer',
    description: 'Analyze guest review sentiment across multiple categories (service, cleanliness, location, value, rooms, food). Identifies strengths, weaknesses, trends, and provides actionable insights for reputation management.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: reviews (string[]), source (tripadvisor|google|booking|direct|all), time_period (string), min_rating (number), max_rating (number), categories (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: ReviewSentimentInput = JSON.parse(args.input_data)
      const result = analyzeReviewSentiment(input)
      return formatReviewSentimentReport(input, result)
    }
  }))

  // Tool 6: Housekeeping Scheduler AI
  tools.register(defineTool({
    name: 'housekeeping_scheduler_ai',
    description: 'AI-powered housekeeping staff and room scheduling. Optimizes cleaning assignments by priority (VIP, checkout, stayover), calculates staff utilization, estimates completion time, and provides contingency plans for disruptions.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: total_rooms (number), occupied_rooms (number), checkout_rooms (number), vip_rooms (number), staff_available (number), shift_hours (number), priority_rooms (string[]), maintenance_issues (string[]), event_disruptions (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: HousekeepingInput = JSON.parse(args.input_data)
      const result = scheduleHousekeeping(input)
      return formatHousekeepingReport(input, result)
    }
  }))

  // Tool 7: Restaurant Menu Optimizer
  tools.register(defineTool({
    name: 'restaurant_menu_optimizer',
    description: 'Menu engineering analysis using the BCG matrix (stars, plow horses, puzzles, dogs). Analyzes profitability and popularity of menu items, suggests pricing changes, identifies items to add/remove, and recommends seasonal specials.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: menu_items (string[]), food_cost_pct (number), avg_dish_price (number), category (fine_dining|casual|fast_casual|cafe|bar), popular_items (string[]), low_performers (string[]), seasonal_ingredients (string[]), dietary_trends (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: MenuOptimizerInput = JSON.parse(args.input_data)
      const result = optimizeMenu(input)
      return formatMenuOptimizerReport(input, result)
    }
  }))

  // Tool 8: Events Conference Planner
  tools.register(defineTool({
    name: 'events_conference_planner',
    description: 'Plan corporate events, conferences, weddings, and exhibitions. Provides budget breakdowns, milestone timelines, venue recommendations, catering options, AV setup, risk factors, and attendee experience tips.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: event_type (conference|wedding|corporate|gala|workshop|exhibition), expected_attendees (number), duration_hours (number), budget_usd (number), venue_type (indoor|outdoor|hybrid), catering_required (boolean), av_requirements (string[]), date_flexibility (fixed|flexible|very_flexible), theme (string)', required: true }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const input: EventsConferenceInput = JSON.parse(args.input_data)
      const result = planEventsConference(input)
      return formatEventsConferenceReport(input, result)
    }
  }))
}
