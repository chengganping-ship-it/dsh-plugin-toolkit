/**
 * DSH API Economy & Monetization Engine Plugin v0.1.0
 *
 * API discovery, rate limiting strategy, developer experience scoring, and API product management toolkit for DeepSeek Harness Agent.
 * Designed for API product managers, developer relations teams, and platform engineers.
 *
 * Features (v0.1.0):
 * - API Valuator (revenue potential and market positioning)
 * - Rate Limiter Designer (traffic-aware rate limit strategy)
 * - Developer Experience Scorer (DX friction analysis and satisfaction)
 * - API Monetization Advisor (pricing model and tier structure)
 * - API Analytics Dashboard (health scoring and capacity planning)
 * - API Security Auditor (OWASP compliance and vulnerability assessment)
 * - GraphQL Optimizer (query optimization and N+1 resolution)
 * - API Portfolio Manager (lifecycle analysis and consolidation)
 *
 * @module dsh-tool-apieco
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-apieco'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface ApiEndpoint {
  path: string
  method: string
  traffic: number
  avgResponseTime: number
  errorRate: number
}

interface ApiData {
  endpoints: ApiEndpoint[]
  traffic: number
  developer_count: number
  uptime: number
  uniqueness: number
  category?: string
  name?: string
  version?: string
}

interface TrafficPattern {
  peak_rps: number
  avg_rps: number
  burst_size: number
  endpoints: string[]
  time_window?: string
}

interface DxData {
  documentation: number
  sdk_languages: string[]
  response_time: number
  error_rate: number
  support_response: number
  sandbox_available?: boolean
  onboarding_steps?: number
}

interface UsageData {
  free_tier_users: number
  paid_tier_users: number
  conversion_rate: number
  arpu: number
  churn_rate?: number
  mrr?: number
}

interface ApiMetrics {
  calls: number
  latency: number
  errors: number
  unique_users: number
  top_endpoints: Array<{ path: string; calls: number }>
  period?: string
}

interface SecurityConfig {
  auth_method: string
  rate_limiting: boolean
  cors: boolean
  input_validation: boolean
  encryption: string
  oauth_scopes?: boolean
  ip_whitelist?: boolean
  waf_enabled?: boolean
  ddos_protection?: boolean
  audit_logging?: boolean
}

interface GraphqlData {
  queries: string[]
  resolvers: number
  n_plus_1_issues: number
  depth_complexity: number
  avg_response_size?: number
  cache_hit_rate?: number
}

interface ApiPortfolioItem {
  name: string
  version: string
  status: 'active' | 'deprecated' | 'beta' | 'retired'
  consumers: number
  revenue: number
  last_updated?: string
  dependencies?: string[]
}

// ==================== TOOL 1: API VALUATOR ====================

interface ValuationResult {
  estimated_value: number
  revenue_potential: number
  market_position: string
  monetization_options: string[]
  value_factors: {
    traffic_score: number
    developer_adoption: number
    reliability: number
    uniqueness: number
    scalability: number
  }
  recommendations: string[]
}

function calculateApiValue(data: ApiData): ValuationResult {
  const trafficScore = Math.min(Math.log10(data.traffic + 1) / 7, 1)
  const devAdoption = Math.min(data.developer_count / 10000, 1)
  const reliability = data.uptime / 100
  const uniqueness = data.uniqueness / 100
  const endpointDiversity = Math.min(data.endpoints.length / 50, 1)
  const avgErrorRate = data.endpoints.reduce((s, e) => s + e.errorRate, 0) / Math.max(data.endpoints.length, 1)
  const qualityScore = 1 - Math.min(avgErrorRate / 0.05, 1)

  const compositeScore = (
    trafficScore * 0.25 +
    devAdoption * 0.2 +
    reliability * 0.2 +
    uniqueness * 0.15 +
    endpointDiversity * 0.1 +
    qualityScore * 0.1
  )

  const estimatedValue = Math.round(compositeScore * 10000000)
  const revenuePotential = Math.round(trafficScore * devAdoption * reliability * 5000000)

  let market_position = 'Niche'
  if (compositeScore > 0.8) market_position = 'Market Leader'
  else if (compositeScore > 0.6) market_position = 'Strong Contender'
  else if (compositeScore > 0.4) market_position = 'Competitive'
  else if (compositeScore > 0.2) market_position = 'Emerging'

  const monetization_options: string[] = []
  if (data.developer_count > 100) monetization_options.push('Freemium tiered pricing')
  if (data.traffic > 1000000) monetization_options.push('Usage-based billing')
  if (uniqueness > 70) monetization_options.push('Premium enterprise licensing')
  if (data.endpoints.length > 20) monetization_options.push('Bundle/subscription packages')
  if (data.uptime > 99.5) monetization_options.push('SLA-backed guaranteed uptime tier')
  if (data.developer_count > 5000) monetization_options.push('Marketplace/app ecosystem revenue share')
  if (monetization_options.length === 0) monetization_options.push('Developer pays-per-call model')

  const recommendations: string[] = []
  if (reliability < 0.99) recommendations.push('Improve uptime to 99%+ to unlock premium pricing tiers')
  if (uniqueness < 50) recommendations.push('Differentiate with unique data or capabilities to increase value')
  if (data.developer_count < 500) recommendations.push('Focus on developer acquisition before monetization')
  if (endpointDiversity < 0.3) recommendations.push('Expand API surface area to increase addressable market')
  if (qualityScore < 0.8) recommendations.push('Reduce error rates to improve developer trust and retention')

  return {
    estimated_value: estimatedValue,
    revenue_potential: revenuePotential,
    market_position,
    monetization_options,
    value_factors: {
      traffic_score: Math.round(trafficScore * 100),
      developer_adoption: Math.round(devAdoption * 100),
      reliability: Math.round(reliability * 100),
      uniqueness: Math.round(uniqueness * 100),
      scalability: Math.round((trafficScore + endpointDiversity) / 2 * 100)
    },
    recommendations
  }
}

function formatValuationReport(result: ValuationResult): string {
  const lines: string[] = []
  lines.push('## API Valuation Report')
  lines.push('')
  lines.push(`**Estimated Value:** $${(result.estimated_value / 1e6).toFixed(2)}M`)
  lines.push(`**Revenue Potential:** $${(result.revenue_potential / 1e6).toFixed(2)}M/year`)
  lines.push(`**Market Position:** ${result.market_position}`)
  lines.push('')
  lines.push('### Value Factors')
  lines.push(`- Traffic Score: ${result.value_factors.traffic_score}/100`)
  lines.push(`- Developer Adoption: ${result.value_factors.developer_adoption}/100`)
  lines.push(`- Reliability: ${result.value_factors.reliability}/100`)
  lines.push(`- Uniqueness: ${result.value_factors.uniqueness}/100`)
  lines.push(`- Scalability: ${result.value_factors.scalability}/100`)
  lines.push('')
  lines.push('### Monetization Options')
  for (const opt of result.monetization_options) {
    lines.push(`- ${opt}`)
  }
  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push('### Recommendations')
    for (const rec of result.recommendations) {
      lines.push(`- ${rec}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 2: RATE LIMITER DESIGNER ====================

interface RateLimitResult {
  rate_limit_strategy: string
  tier_definitions: Array<{
    name: string
    requests_per_second: number
    requests_per_day: number
    burst_allowance: number
    price: string
  }>
  throttle_rules: Array<{
    condition: string
    action: string
    retry_after_seconds: number
  }>
  overflow_handling: string
}

function designRateLimiter(patterns: TrafficPattern): RateLimitResult {
  const { peak_rps, avg_rps, burst_size, endpoints } = patterns

  let strategy = 'Token Bucket'
  if (peak_rps > 10000) strategy = 'Hybrid (Token Bucket + Sliding Window)'
  else if (burst_size / avg_rps > 10) strategy = 'Leaky Queue with Priority'
  else if (avg_rps < 100) strategy = 'Fixed Window Counter'

  const tier_multiplier = peak_rps / avg_rps
  const tiers: RateLimitResult['tier_definitions'] = [
    {
      name: 'Free',
      requests_per_second: Math.max(1, Math.round(avg_rps * 0.01)),
      requests_per_day: Math.max(100, Math.round(avg_rps * 0.01 * 86400)),
      burst_allowance: Math.max(5, Math.round(burst_size * 0.005)),
      price: '$0/month'
    },
    {
      name: 'Developer',
      requests_per_second: Math.max(5, Math.round(avg_rps * 0.05)),
      requests_per_day: Math.max(10000, Math.round(avg_rps * 0.05 * 86400)),
      burst_allowance: Math.max(20, Math.round(burst_size * 0.02)),
      price: '$49/month'
    },
    {
      name: 'Pro',
      requests_per_second: Math.max(20, Math.round(avg_rps * 0.15)),
      requests_per_day: Math.max(100000, Math.round(avg_rps * 0.15 * 86400)),
      burst_allowance: Math.max(50, Math.round(burst_size * 0.05)),
      price: '$299/month'
    },
    {
      name: 'Enterprise',
      requests_per_second: Math.max(50, Math.round(avg_rps * 0.4)),
      requests_per_day: Math.max(500000, Math.round(avg_rps * 0.4 * 86400)),
      burst_allowance: Math.max(100, Math.round(burst_size * 0.15)),
      price: 'Custom pricing'
    }
  ]

  const throttle_rules: RateLimitResult['throttle_rules'] = [
    {
      condition: `Exceed ${tiers[0].requests_per_second} RPS (Free tier)`,
      action: 'Return 429 with Retry-After header',
      retry_after_seconds: 60
    },
    {
      condition: `Burst exceeds ${Math.round(burst_size * 0.01)} requests in 1 second`,
      action: 'Queue requests with priority ordering',
      retry_after_seconds: 5
    },
    {
      condition: `Sustained >80% of tier limit for >5 minutes`,
      action: 'Soft throttle with gradual slowdown',
      retry_after_seconds: 30
    },
    {
      condition: `Global capacity >90% utilization`,
      action: 'Activate fair-use throttling across all tiers',
      retry_after_seconds: 10
    }
  ]

  let overflow_handling = 'Queue with exponential backoff'
  if (tier_multiplier > 5) {
    overflow_handling = 'Priority queue with tier-based preemption: Enterprise > Pro > Developer > Free. Excess Free tier requests dropped first with 503 response.'
  } else if (peak_rps > 50000) {
    overflow_handling = 'Distributed rate limiting with Redis Cluster. Overflow routed to secondary capacity pool. Auto-scaling triggers at 80% utilization.'
  }

  return {
    rate_limit_strategy: strategy,
    tier_definitions: tiers,
    throttle_rules,
    overflow_handling
  }
}

function formatRateLimiterReport(result: RateLimitResult): string {
  const lines: string[] = []
  lines.push('## Rate Limiter Design')
  lines.push('')
  lines.push(`**Strategy:** ${result.rate_limit_strategy}`)
  lines.push('')
  lines.push('### Tier Definitions')
  lines.push('| Tier | RPS | Daily Limit | Burst | Price |')
  lines.push('|------|-----|-------------|-------|-------|')
  for (const t of result.tier_definitions) {
    lines.push(`| ${t.name} | ${t.requests_per_second} | ${t.requests_per_day.toLocaleString()} | ${t.burst_allowance} | ${t.price} |`)
  }
  lines.push('')
  lines.push('### Throttle Rules')
  for (const rule of result.throttle_rules) {
    lines.push(`- **${rule.condition}** → ${rule.action} (retry after ${rule.retry_after_seconds}s)`)
  }
  lines.push('')
  lines.push(`### Overflow Handling`)
  lines.push(result.overflow_handling)
  return lines.join('\n')
}

// ==================== TOOL 3: DEVELOPER EXPERIENCE SCORER ====================

interface DxResult {
  dx_score: number
  friction_points: string[]
  onboarding_improvements: string[]
  developer_satisfaction: string
  dx_breakdown: {
    documentation: number
    sdk_support: number
    performance: number
    reliability: number
    support: number
  }
}

function scoreDeveloperExperience(data: DxData): DxResult {
  const docScore = data.documentation
  const sdkScore = Math.min(data.sdk_languages.length / 6, 1) * 100
  const perfScore = data.response_time < 100 ? 100 : data.response_time < 300 ? 70 : data.response_time < 500 ? 40 : 20
  const reliabilityScore = data.error_rate < 0.001 ? 100 : data.error_rate < 0.01 ? 70 : data.error_rate < 0.05 ? 40 : 20
  const supportScore = data.support_response < 6 ? 100 : data.support_response < 24 ? 70 : data.support_response < 72 ? 40 : 20

  const dx_score = Math.round(
    docScore * 0.25 +
    sdkScore * 0.2 +
    perfScore * 0.2 +
    reliabilityScore * 0.2 +
    supportScore * 0.15
  )

  const friction_points: string[] = []
  if (docScore < 70) friction_points.push('Incomplete or outdated documentation')
  if (data.sdk_languages.length < 3) friction_points.push('Limited SDK language support')
  if (data.response_time > 200) friction_points.push('Slow API response times')
  if (data.error_rate > 0.01) friction_points.push('High error rate causing integration failures')
  if (data.support_response > 24) friction_points.push('Slow support response times')
  if (!data.sandbox_available) friction_points.push('No sandbox/testing environment')
  if ((data.onboarding_steps ?? 5) > 5) friction_points.push('Complex onboarding with too many steps')

  const onboarding_improvements: string[] = []
  if (docScore < 80) onboarding_improvements.push('Add interactive API explorer and code samples')
  if (data.sdk_languages.length < 4) onboarding_improvements.push('Release SDKs for top-requested languages')
  if (!data.sandbox_available) onboarding_improvements.push('Provide sandbox environment with mock data')
  if ((data.onboarding_steps ?? 5) > 3) onboarding_improvements.push('Streamline onboarding to under 3 steps')
  onboarding_improvements.push('Add quickstart guide with copy-paste examples')
  onboarding_improvements.push('Implement progressive disclosure for advanced features')

  let developer_satisfaction = 'Poor'
  if (dx_score >= 85) developer_satisfaction = 'Excellent'
  else if (dx_score >= 70) developer_satisfaction = 'Good'
  else if (dx_score >= 50) developer_satisfaction = 'Fair'

  return {
    dx_score,
    friction_points,
    onboarding_improvements,
    developer_satisfaction,
    dx_breakdown: {
      documentation: Math.round(docScore),
      sdk_support: Math.round(sdkScore),
      performance: perfScore,
      reliability: reliabilityScore,
      support: supportScore
    }
  }
}

function formatDxReport(result: DxResult): string {
  const lines: string[] = []
  lines.push('## Developer Experience Score')
  lines.push('')
  lines.push(`**DX Score:** ${result.dx_score}/100 — **${result.developer_satisfaction}**`)
  lines.push('')
  lines.push('### Score Breakdown')
  lines.push(`- Documentation: ${result.dx_breakdown.documentation}/100`)
  lines.push(`- SDK Support: ${result.dx_breakdown.sdk_support}/100`)
  lines.push(`- Performance: ${result.dx_breakdown.performance}/100`)
  lines.push(`- Reliability: ${result.dx_breakdown.reliability}/100`)
  lines.push(`- Support: ${result.dx_breakdown.support}/100`)
  lines.push('')
  if (result.friction_points.length > 0) {
    lines.push('### Friction Points')
    for (const fp of result.friction_points) {
      lines.push(`- ${fp}`)
    }
    lines.push('')
  }
  lines.push('### Onboarding Improvements')
  for (const imp of result.onboarding_improvements) {
    lines.push(`- ${imp}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 4: API MONETIZATION ADVISOR ====================

interface MonetizationResult {
  pricing_model_recommendation: string
  tier_structure: Array<{
    name: string
    price: string
    features: string[]
    target_segment: string
  }>
  revenue_projection: {
    conservative: number
    moderate: number
    optimistic: number
    timeframe: string
  }
  churn_risk: string
  churn_mitigation: string[]
}

function adviseMonetization(data: UsageData): MonetizationResult {
  const totalUsers = data.free_tier_users + data.paid_tier_users
  const conversionRate = data.conversion_rate
  const arpu = data.arpu

  let pricing_model_recommendation = 'Usage-based pricing'
  if (conversionRate > 0.1 && arpu > 100) {
    pricing_model_recommendation = 'Tiered subscription with usage overages — high conversion and ARPU indicate willingness to pay for predictable pricing'
  } else if (conversionRate < 0.02) {
    pricing_model_recommendation = 'Freemium with generous free tier — low conversion suggests price sensitivity; grow user base first'
  } else if (arpu < 20) {
    pricing_model_recommendation = 'Pay-as-you-go with volume discounts — low ARPU indicates need for micro-transaction friendly model'
  } else if (totalUsers > 100000 && conversionRate > 0.05) {
    pricing_model_recommendation = 'Hybrid: Base subscription + usage overages — large user base supports tiered approach with usage component'
  }

  const tier_structure: MonetizationResult['tier_structure'] = [
    {
      name: 'Free',
      price: '$0/month',
      features: ['1,000 API calls/month', 'Community support', 'Basic documentation', 'Single user'],
      target_segment: 'Hobbyists, students, evaluation'
    },
    {
      name: 'Starter',
      price: `$${Math.round(arpu * 0.5)}/month`,
      features: ['50,000 API calls/month', 'Email support', 'SDK access', '3 team users', 'Basic analytics'],
      target_segment: 'Startups, small projects'
    },
    {
      name: 'Growth',
      price: `$${Math.round(arpu * 1.5)}/month`,
      features: ['500,000 API calls/month', 'Priority support', 'SLA guarantee', '10 team users', 'Advanced analytics', 'Webhooks'],
      target_segment: 'Growing businesses, scale-ups'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited API calls', 'Dedicated support', '99.99% SLA', 'Unlimited users', 'Custom integrations', 'On-premise option', 'Compliance certifications'],
      target_segment: 'Large enterprises, regulated industries'
    }
  ]

  const currentMrr = data.mrr ?? (data.paid_tier_users * arpu)
  const projectedConversion = Math.min(conversionRate * 1.5, 0.25)
  const revenue_projection = {
    conservative: Math.round(currentMrr * 1.2),
    moderate: Math.round(currentMrr * 2.5),
    optimistic: Math.round(currentMrr * 5),
    timeframe: '12 months'
  }

  const churnRate = data.churn_rate ?? 0.05
  let churn_risk = 'Low'
  if (churnRate > 0.1) churn_risk = 'Critical'
  else if (churnRate > 0.07) churn_risk = 'High'
  else if (churnRate > 0.04) churn_risk = 'Moderate'

  const churn_mitigation: string[] = []
  if (churnRate > 0.05) churn_mitigation.push('Implement usage alerts to prevent bill shock')
  if (conversionRate < 0.05) churn_mitigation.push('Add value-qualified leads program to improve conversion quality')
  churn_mitigation.push('Offer annual commitment discounts (20% off) to reduce monthly churn')
  churn_mitigation.push('Build API usage dashboards so customers see ongoing value')
  if (churnRate > 0.07) churn_mitigation.push('Deploy proactive health scoring with automated intervention workflows')

  return {
    pricing_model_recommendation,
    tier_structure,
    revenue_projection,
    churn_risk,
    churn_mitigation
  }
}

function formatMonetizationReport(result: MonetizationResult): string {
  const lines: string[] = []
  lines.push('## API Monetization Advisory')
  lines.push('')
  lines.push(`**Recommended Model:** ${result.pricing_model_recommendation}`)
  lines.push('')
  lines.push('### Tier Structure')
  for (const tier of result.tier_structure) {
    lines.push(`**${tier.name}** — ${tier.price} (${tier.target_segment})`)
    for (const f of tier.features) {
      lines.push(`  - ${f}`)
    }
  }
  lines.push('')
  lines.push(`### Revenue Projection (${result.revenue_projection.timeframe})`)
  lines.push(`- Conservative: $${(result.revenue_projection.conservative / 1e6).toFixed(1)}M`)
  lines.push(`- Moderate: $${(result.revenue_projection.moderate / 1e6).toFixed(1)}M`)
  lines.push(`- Optimistic: $${(result.revenue_projection.optimistic / 1e6).toFixed(1)}M`)
  lines.push('')
  lines.push(`**Churn Risk:** ${result.churn_risk}`)
  if (result.churn_mitigation.length > 0) {
    lines.push('')
    lines.push('### Churn Mitigation')
    for (const m of result.churn_mitigation) {
      lines.push(`- ${m}`)
    }
  }
  return lines.join('\n')
}

// ==================== TOOL 5: API ANALYTICS DASHBOARD ====================

interface AnalyticsResult {
  health_score: number
  usage_trends: {
    direction: 'growing' | 'stable' | 'declining'
    growth_rate: number
    peak_usage_hour: number
    api_efficiency: number
  }
  anomaly_alerts: Array<{
    severity: 'info' | 'warning' | 'critical'
    message: string
    metric: string
    value: number
  }>
  capacity_planning: {
    current_utilization: number
    recommended_capacity: number
    scaling_timeline: string
    bottleneck_endpoints: string[]
  }
}

function analyzeApiMetrics(metrics: ApiMetrics): AnalyticsResult {
  const errorRate = metrics.errors / Math.max(metrics.calls, 1)
  const avgLatency = metrics.latency
  const callsPerUser = metrics.calls / Math.max(metrics.unique_users, 1)

  const errorScore = errorRate < 0.001 ? 100 : errorRate < 0.01 ? 75 : errorRate < 0.05 ? 40 : 20
  const latencyScore = avgLatency < 100 ? 100 : avgLatency < 200 ? 80 : avgLatency < 500 ? 50 : 25
  const utilizationScore = Math.min(metrics.unique_users / 10000, 1) * 100
  const health_score = Math.round(errorScore * 0.35 + latencyScore * 0.35 + utilizationScore * 0.3)

  const growthRate = (callsPerUser - 100) / 100
  let direction: 'growing' | 'stable' | 'declining' = 'stable'
  if (growthRate > 0.2) direction = 'growing'
  else if (growthRate < -0.2) direction = 'declining'

  const usage_trends = {
    direction,
    growth_rate: Math.round(growthRate * 100),
    peak_usage_hour: 14,
    api_efficiency: Math.round((1 - errorRate) * Math.max(0, 1 - avgLatency / 1000) * 100)
  }

  const anomaly_alerts: AnalyticsResult['anomaly_alerts'] = []
  if (errorRate > 0.05) {
    anomaly_alerts.push({
      severity: 'critical',
      message: `Error rate at ${(errorRate * 100).toFixed(2)}% exceeds 5% threshold`,
      metric: 'error_rate',
      value: errorRate
    })
  } else if (errorRate > 0.01) {
    anomaly_alerts.push({
      severity: 'warning',
      message: `Error rate at ${(errorRate * 100).toFixed(2)}% above 1% target`,
      metric: 'error_rate',
      value: errorRate
    })
  }

  if (avgLatency > 500) {
    anomaly_alerts.push({
      severity: 'critical',
      message: `Average latency ${avgLatency}ms exceeds 500ms SLA`,
      metric: 'latency',
      value: avgLatency
    })
  } else if (avgLatency > 200) {
    anomaly_alerts.push({
      severity: 'warning',
      message: `Average latency ${avgLatency}ms above 200ms target`,
      metric: 'latency',
      value: avgLatency
    })
  }

  if (metrics.unique_users > 8000) {
    anomaly_alerts.push({
      severity: 'info',
      message: `User base approaching capacity: ${metrics.unique_users} active users`,
      metric: 'unique_users',
      value: metrics.unique_users
    })
  }

  const topEndpoints = metrics.top_endpoints ?? []
  const bottleneckEndpoints = topEndpoints
    .filter(e => e.calls > metrics.calls * 0.3)
    .map(e => e.path)

  const currentUtilization = Math.round((metrics.unique_users / 10000) * 100)
  const capacity_planning = {
    current_utilization: Math.min(currentUtilization, 100),
    recommended_capacity: Math.round(metrics.unique_users * 1.5),
    scaling_timeline: currentUtilization > 80 ? 'Immediate — within 1 week' : currentUtilization > 60 ? 'Plan within 1 month' : 'No action needed for 3+ months',
    bottleneck_endpoints: bottleneckEndpoints
  }

  return {
    health_score,
    usage_trends,
    anomaly_alerts,
    capacity_planning
  }
}

function formatAnalyticsReport(result: AnalyticsResult): string {
  const lines: string[] = []
  lines.push('## API Analytics Dashboard')
  lines.push('')
  lines.push(`**Health Score:** ${result.health_score}/100`)
  lines.push('')
  lines.push('### Usage Trends')
  lines.push(`- Direction: ${result.usage_trends.direction.toUpperCase()}`)
  lines.push(`- Growth Rate: ${result.usage_trends.growth_rate}%`)
  lines.push(`- Peak Usage Hour: ${result.usage_trends.peak_usage_hour}:00 UTC`)
  lines.push(`- API Efficiency: ${result.usage_trends.api_efficiency}/100`)
  lines.push('')
  if (result.anomaly_alerts.length > 0) {
    lines.push('### Anomaly Alerts')
    for (const alert of result.anomaly_alerts) {
      const icon = alert.severity === 'critical' ? '[CRITICAL]' : alert.severity === 'warning' ? '[WARNING]' : '[INFO]'
      lines.push(`${icon} ${alert.message}`)
    }
    lines.push('')
  }
  lines.push('### Capacity Planning')
  lines.push(`- Current Utilization: ${result.capacity_planning.current_utilization}%`)
  lines.push(`- Recommended Capacity: ${result.capacity_planning.recommended_capacity.toLocaleString()} users`)
  lines.push(`- Scaling Timeline: ${result.capacity_planning.scaling_timeline}`)
  if (result.capacity_planning.bottleneck_endpoints.length > 0) {
    lines.push(`- Bottleneck Endpoints: ${result.capacity_planning.bottleneck_endpoints.join(', ')}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 6: API SECURITY AUDITOR ====================

interface SecurityResult {
  security_score: number
  vulnerabilities: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical'
    title: string
    description: string
    cwe_id: string
  }>
  owasp_compliance: {
    overall: string
    items: Array<{ control: string; status: 'pass' | 'fail' | 'partial'; detail: string }>
  }
  remediation_steps: string[]
}

function auditApiSecurity(config: SecurityConfig): SecurityResult {
  let score = 0
  const vulnerabilities: SecurityResult['vulnerabilities'] = []
  const owaspItems: SecurityResult['owasp_compliance']['items'] = []

  // Authentication assessment
  if (config.auth_method === 'oauth2') {
    score += 25
    owaspItems.push({ control: 'Authentication', status: 'pass', detail: 'OAuth 2.0 implemented' })
  } else if (config.auth_method === 'api_key') {
    score += 15
    owaspItems.push({ control: 'Authentication', status: 'partial', detail: 'API key auth — consider OAuth 2.0 for production' })
    vulnerabilities.push({
      severity: 'medium',
      title: 'API Key Authentication',
      description: 'API keys lack scoped permissions and are vulnerable to exposure in client-side code',
      cwe_id: 'CWE-798'
    })
  } else if (config.auth_method === 'basic') {
    score += 5
    owaspItems.push({ control: 'Authentication', status: 'fail', detail: 'Basic auth is insecure for production APIs' })
    vulnerabilities.push({
      severity: 'critical',
      title: 'Basic Authentication',
      description: 'Basic auth transmits credentials in easily decodable format without TLS',
      cwe_id: 'CWE-319'
    })
  } else if (config.auth_method === 'none') {
    owaspItems.push({ control: 'Authentication', status: 'fail', detail: 'No authentication mechanism detected' })
    vulnerabilities.push({
      severity: 'critical',
      title: 'Missing Authentication',
      description: 'API has no authentication — fully exposed to unauthorized access',
      cwe_id: 'CWE-306'
    })
  }

  // Rate limiting
  if (config.rate_limiting) {
    score += 15
    owaspItems.push({ control: 'Rate Limiting', status: 'pass', detail: 'Rate limiting enabled' })
  } else {
    owaspItems.push({ control: 'Rate Limiting', status: 'fail', detail: 'No rate limiting — vulnerable to abuse' })
    vulnerabilities.push({
      severity: 'high',
      title: 'Missing Rate Limiting',
      description: 'Without rate limiting, API is vulnerable to brute force and DDoS attacks',
      cwe_id: 'CWE-770'
    })
  }

  // CORS
  if (config.cors) {
    score += 10
    owaspItems.push({ control: 'CORS', status: 'pass', detail: 'CORS configured' })
  } else {
    score += 5
    owaspItems.push({ control: 'CORS', status: 'partial', detail: 'CORS not configured — may block legitimate clients' })
  }

  // Input validation
  if (config.input_validation) {
    score += 15
    owaspItems.push({ control: 'Input Validation', status: 'pass', detail: 'Input validation enabled' })
  } else {
    owaspItems.push({ control: 'Input Validation', status: 'fail', detail: 'No input validation — injection risk' })
    vulnerabilities.push({
      severity: 'critical',
      title: 'Missing Input Validation',
      description: 'Without input validation, API is vulnerable to injection attacks (SQL, XSS, command)',
      cwe_id: 'CWE-20'
    })
  }

  // Encryption
  if (config.encryption === 'tls13') {
    score += 15
    owaspItems.push({ control: 'Encryption', status: 'pass', detail: 'TLS 1.3 encryption' })
  } else if (config.encryption === 'tls12') {
    score += 12
    owaspItems.push({ control: 'Encryption', status: 'pass', detail: 'TLS 1.2 encryption — consider upgrading to 1.3' })
  } else if (config.encryption === 'none') {
    owaspItems.push({ control: 'Encryption', status: 'fail', detail: 'No encryption — data transmitted in plaintext' })
    vulnerabilities.push({
      severity: 'critical',
      title: 'No Transport Encryption',
      description: 'Data transmitted without encryption — vulnerable to interception and MITM attacks',
      cwe_id: 'CWE-319'
    })
  }

  // Additional security controls
  if (config.oauth_scopes) { score += 5; owaspItems.push({ control: 'OAuth Scopes', status: 'pass', detail: 'Scoped permissions configured' }) }
  if (config.ip_whitelist) { score += 5; owaspItems.push({ control: 'IP Whitelisting', status: 'pass', detail: 'IP restrictions enabled' }) }
  if (config.waf_enabled) { score += 5; owaspItems.push({ control: 'WAF', status: 'pass', detail: 'Web Application Firewall active' }) }
  if (config.ddos_protection) { score += 5; owaspItems.push({ control: 'DDoS Protection', status: 'pass', detail: 'DDoS mitigation enabled' }) }
  if (config.audit_logging) { score += 5; owaspItems.push({ control: 'Audit Logging', status: 'pass', detail: 'Request audit logging enabled' }) }

  const overall = score >= 80 ? 'Compliant' : score >= 60 ? 'Partially Compliant' : score >= 40 ? 'Needs Improvement' : 'Non-Compliant'

  const remediation_steps: string[] = []
  if (!config.input_validation) remediation_steps.push('Implement strict input validation with allowlists for all API parameters')
  if (config.auth_method === 'basic' || config.auth_method === 'none') remediation_steps.push('Migrate to OAuth 2.0 with PKCE for authentication')
  if (!config.rate_limiting) remediation_steps.push('Deploy rate limiting at edge (per IP, per user, per endpoint)')
  if (config.encryption === 'none') remediation_steps.push('Enforce TLS 1.2+ for all API endpoints; redirect HTTP to HTTPS')
  if (!config.waf_enabled) remediation_steps.push('Enable Web Application Firewall with OWASP Core Rule Set')
  if (!config.audit_logging) remediation_steps.push('Implement comprehensive audit logging for security event detection')
  if (remediation_steps.length === 0) remediation_steps.push('Maintain current security posture with regular penetration testing')

  return {
    security_score: Math.min(score, 100),
    vulnerabilities,
    owasp_compliance: { overall, items: owaspItems },
    remediation_steps
  }
}

function formatSecurityReport(result: SecurityResult): string {
  const lines: string[] = []
  lines.push('## API Security Audit')
  lines.push('')
  lines.push(`**Security Score:** ${result.security_score}/100 — **${result.owasp_compliance.overall}**`)
  lines.push('')
  if (result.vulnerabilities.length > 0) {
    lines.push('### Vulnerabilities')
    for (const v of result.vulnerabilities) {
      lines.push(`[${v.severity.toUpperCase()}] **${v.title}** (${v.cwe_id})`)
      lines.push(`  ${v.description}`)
    }
    lines.push('')
  }
  lines.push('### OWASP Compliance')
  for (const item of result.owasp_compliance.items) {
    const statusIcon = item.status === 'pass' ? 'PASS' : item.status === 'fail' ? 'FAIL' : 'PARTIAL'
    lines.push(`- [${statusIcon}] ${item.control}: ${item.detail}`)
  }
  lines.push('')
  lines.push('### Remediation Steps')
  for (let i = 0; i < result.remediation_steps.length; i++) {
    lines.push(`${i + 1}. ${result.remediation_steps[i]}`)
  }
  return lines.join('\n')
}

// ==================== TOOL 7: GRAPHQL OPTIMIZER ====================

interface GraphqlOptimizationResult {
  query_optimization: string[]
  batching_strategies: string[]
  caching_recommendations: string[]
  performance_gains: {
    estimated_latency_reduction: number
    estimated_cost_reduction: number
    resolver_efficiency_gain: number
  }
}

function optimizeGraphql(data: GraphqlData): GraphqlOptimizationResult {
  const query_optimization: string[] = []
  const batching_strategies: string[] = []
  const caching_recommendations: string[] = []

  if (data.n_plus_1_issues > 0) {
    query_optimization.push(`Implement DataLoader for ${data.n_plus_1_issues} detected N+1 query patterns — batch DB calls into single queries`)
    query_optimization.push('Use query complexity analysis to reject queries exceeding depth/complexity thresholds')
  }

  if (data.depth_complexity > 10) {
    query_optimization.push(`Limit query depth from current ${data.depth_complexity} to max 7 levels — prevents expensive recursive resolvers`)
  }

  if (data.queries.length > 5) {
    query_optimization.push('Implement persisted queries for production — whitelist allowed queries and reject ad-hoc')
  }

  query_optimization.push('Add query cost analysis middleware to enforce per-query resource limits')
  query_optimization.push('Use field-level instrumentation to identify and optimize slow resolvers')

  batching_strategies.push('Implement DataLoader pattern for all relational data (one-to-many, many-to-many)')
  batching_strategies.push('Batch resolver calls by entity type within single request context')
  batching_strategies.push('Use Redis-backed DataLoader for cross-request batching of hot entities')
  if (data.resolvers > 20) {
    batching_strategies.push(`Consolidate ${data.resolvers} resolvers into domain-specific batch resolvers to reduce overhead`)
  }

  const cacheHitRate = data.cache_hit_rate ?? 0
  if (cacheHitRate < 0.5) {
    caching_recommendations.push('Enable automatic persisted queries (APQ) with CDN caching for repeated queries')
    caching_recommendations.push('Implement response caching with entity-based cache keys and TTL-based invalidation')
  }
  caching_recommendations.push('Add @cacheControl directives with per-field maxAge for granular cache policies')
  caching_recommendations.push('Deploy Redis cache layer for frequently accessed entity types')
  caching_recommendations.push('Use stale-while-revalidate pattern for non-critical data')

  const nPlusOneReduction = Math.min(data.n_plus_1_issues * 15, 60)
  const depthReduction = Math.min((data.depth_complexity - 5) * 3, 20)
  const cacheImprovement = Math.round((0.8 - cacheHitRate) * 30)

  return {
    query_optimization,
    batching_strategies,
    caching_recommendations,
    performance_gains: {
      estimated_latency_reduction: Math.min(nPlusOneReduction + depthReduction, 75),
      estimated_cost_reduction: Math.min(Math.round(nPlusOneReduction * 0.7), 50),
      resolver_efficiency_gain: Math.min(Math.round((data.n_plus_1_issues * 10) + cacheImprovement), 80)
    }
  }
}

function formatGraphqlReport(result: GraphqlOptimizationResult): string {
  const lines: string[] = []
  lines.push('## GraphQL Optimization Report')
  lines.push('')
  lines.push('### Query Optimization')
  for (const opt of result.query_optimization) {
    lines.push(`- ${opt}`)
  }
  lines.push('')
  lines.push('### Batching Strategies')
  for (const strat of result.batching_strategies) {
    lines.push(`- ${strat}`)
  }
  lines.push('')
  lines.push('### Caching Recommendations')
  for (const cache of result.caching_recommendations) {
    lines.push(`- ${cache}`)
  }
  lines.push('')
  lines.push('### Estimated Performance Gains')
  lines.push(`- Latency Reduction: ${result.performance_gains.estimated_latency_reduction}%`)
  lines.push(`- Cost Reduction: ${result.performance_gains.estimated_cost_reduction}%`)
  lines.push(`- Resolver Efficiency Gain: ${result.performance_gains.resolver_efficiency_gain}%`)
  return lines.join('\n')
}

// ==================== TOOL 8: API PORTFOLIO MANAGER ====================

interface PortfolioResult {
  lifecycle_analysis: Array<{
    name: string
    version: string
    status: string
    lifecycle_stage: 'growth' | 'mature' | 'declining' | 'sunset'
    recommendation: string
  }>
  deprecation_candidates: string[]
  consolidation_opportunities: Array<{
    apis: string[]
    rationale: string
    estimated_savings: string
  }>
  roadmap_recommendations: string[]
}

function manageApiPortfolio(apis: ApiPortfolioItem[]): PortfolioResult {
  const lifecycle_analysis: PortfolioResult['lifecycle_analysis'] = []
  const deprecation_candidates: string[] = []
  const consolidation_opportunities: PortfolioResult['consolidation_opportunities'] = []

  for (const api of apis) {
    let lifecycle_stage: 'growth' | 'mature' | 'declining' | 'sunset' = 'mature'
    let recommendation = 'Maintain current version'

    if (api.status === 'retired') {
      lifecycle_stage = 'sunset'
      recommendation = 'Plan migration path for remaining consumers'
    } else if (api.status === 'deprecated') {
      lifecycle_stage = 'declining'
      recommendation = 'Accelerate consumer migration; set sunset date'
      deprecation_candidates.push(api.name)
    } else if (api.status === 'beta') {
      lifecycle_stage = 'growth'
      recommendation = 'Gather feedback and promote to GA within 90 days'
    } else if (api.consumers < 10 && api.revenue < 1000) {
      lifecycle_stage = 'declining'
      recommendation = 'Evaluate for deprecation — low adoption and revenue'
      deprecation_candidates.push(api.name)
    } else if (api.consumers > 1000 && api.revenue > 50000) {
      lifecycle_stage = 'growth'
      recommendation = 'Invest in scaling and feature expansion'
    } else {
      lifecycle_stage = 'mature'
      recommendation = 'Optimize for reliability and cost efficiency'
    }

    lifecycle_analysis.push({
      name: api.name,
      version: api.version,
      status: api.status,
      lifecycle_stage,
      recommendation
    })
  }

  // Find consolidation opportunities
  const nameGroups = new Map<string, string[]>()
  for (const api of apis) {
    const baseName = api.name.replace(/[-_]?v\d+$/, '').replace(/[-_]?api$/i, '')
    if (!nameGroups.has(baseName)) nameGroups.set(baseName, [])
    nameGroups.get(baseName)!.push(api.name)
  }

  for (const [base, group] of nameGroups) {
    if (group.length > 1) {
      consolidation_opportunities.push({
        apis: group,
        rationale: `Multiple APIs serving similar domain (${base}) — consolidate into unified API`,
        estimated_savings: `$${(group.length * 5000).toLocaleString()}/month in maintenance`
      })
    }
  }

  // Find low-revenue APIs that could be merged
  const lowRevenueApis = apis.filter(a => a.revenue < 5000 && a.consumers < 50)
  if (lowRevenueApis.length >= 3) {
    consolidation_opportunities.push({
      apis: lowRevenueApis.map(a => a.name),
      rationale: `${lowRevenueApis.length} APIs with low adoption — merge into shared utility API`,
      estimated_savings: `$${(lowRevenueApis.length * 3000).toLocaleString()}/month`
    })
  }

  const roadmap_recommendations: string[] = []
  const activeCount = apis.filter(a => a.status === 'active').length
  const betaCount = apis.filter(a => a.status === 'beta').length
  const deprecatedCount = apis.filter(a => a.status === 'deprecated').length

  if (deprecatedCount > 0) {
    roadmap_recommendations.push(`Prioritize migration of ${deprecatedCount} deprecated API(s) to reduce technical debt`)
  }
  if (betaCount > 2) {
    roadmap_recommendations.push(`Promote ${betaCount} beta APIs to GA or retire to focus engineering resources`)
  }
  if (apis.length > 15) {
    roadmap_recommendations.push(`Portfolio has ${apis.length} APIs — consider consolidation to reduce operational complexity`)
  }
  roadmap_recommendations.push('Establish API design standards and review board for new API proposals')
  roadmap_recommendations.push('Implement unified API gateway for consistent auth, rate limiting, and observability')
  if (consolidation_opportunities.length > 0) {
    roadmap_recommendations.push(`Execute ${consolidation_opportunities.length} consolidation opportunity(ies) to reduce costs`)
  }

  return {
    lifecycle_analysis,
    deprecation_candidates,
    consolidation_opportunities,
    roadmap_recommendations
  }
}

function formatPortfolioReport(result: PortfolioResult): string {
  const lines: string[] = []
  lines.push('## API Portfolio Management Report')
  lines.push('')
  lines.push('### Lifecycle Analysis')
  lines.push('| API | Version | Status | Stage | Recommendation |')
  lines.push('|-----|---------|--------|-------|----------------|')
  for (const item of result.lifecycle_analysis) {
    lines.push(`| ${item.name} | ${item.version} | ${item.status} | ${item.lifecycle_stage} | ${item.recommendation} |`)
  }
  lines.push('')
  if (result.deprecation_candidates.length > 0) {
    lines.push('### Deprecation Candidates')
    for (const dep of result.deprecation_candidates) {
      lines.push(`- ${dep}`)
    }
    lines.push('')
  }
  if (result.consolidation_opportunities.length > 0) {
    lines.push('### Consolidation Opportunities')
    for (const cons of result.consolidation_opportunities) {
      lines.push(`**Merge:** ${cons.apis.join(' + ')}`)
      lines.push(`  Rationale: ${cons.rationale}`)
      lines.push(`  Savings: ${cons.estimated_savings}`)
    }
    lines.push('')
  }
  lines.push('### Roadmap Recommendations')
  for (let i = 0; i < result.roadmap_recommendations.length; i++) {
    lines.push(`${i + 1}. ${result.roadmap_recommendations[i]}`)
  }
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'api_valuator',
    description: 'Estimate API market value and revenue potential based on traffic, developer adoption, uptime, uniqueness, and endpoint diversity. Returns valuation, market position, and monetization options.',
    parameters: {
      api_data: { type: 'string', required: true, description: 'JSON object with fields: endpoints (array of {path, method, traffic, avg_response_time, error_rate}), traffic (total requests/month), developer_count, uptime (percentage), uniqueness (0-100 score)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { api_data: string }) {
      const data: ApiData = JSON.parse(args.api_data)
      const result = calculateApiValue(data)
      return formatValuationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'rate_limiter_designer',
    description: 'Design optimal rate limiting strategy based on traffic patterns. Generates tier definitions, throttle rules, and overflow handling recommendations.',
    parameters: {
      traffic_patterns: { type: 'string', required: true, description: 'JSON object with fields: peak_rps, avg_rps, burst_size, endpoints (array of path strings)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { traffic_patterns: string }) {
      const data: TrafficPattern = JSON.parse(args.traffic_patterns)
      const result = designRateLimiter(data)
      return formatRateLimiterReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'developer_experience_scorer',
    description: 'Score developer experience (DX) across documentation, SDK support, performance, reliability, and support. Identifies friction points and onboarding improvements.',
    parameters: {
      dx_data: { type: 'string', required: true, description: 'JSON object with fields: documentation (0-100 score), sdk_languages (array), response_time (ms), error_rate (0-1), support_response (hours), sandbox_available (bool), onboarding_steps (int)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { dx_data: string }) {
      const data: DxData = JSON.parse(args.dx_data)
      const result = scoreDeveloperExperience(data)
      return formatDxReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'api_monetization_advisor',
    description: 'Recommend optimal pricing model and tier structure based on usage data. Projects revenue and assesses churn risk with mitigation strategies.',
    parameters: {
      usage_data: { type: 'string', required: true, description: 'JSON object with fields: free_tier_users, paid_tier_users, conversion_rate (0-1), arpu (USD), churn_rate (0-1, optional), mrr (optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { usage_data: string }) {
      const data: UsageData = JSON.parse(args.usage_data)
      const result = adviseMonetization(data)
      return formatMonetizationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'api_analytics_dashboard',
    description: 'Generate API health score, usage trends, anomaly alerts, and capacity planning recommendations from operational metrics.',
    parameters: {
      api_metrics: { type: 'string', required: true, description: 'JSON object with fields: calls (total), latency (avg ms), errors (count), unique_users, top_endpoints (array of {path, calls})' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { api_metrics: string }) {
      const data: ApiMetrics = JSON.parse(args.api_metrics)
      const result = analyzeApiMetrics(data)
      return formatAnalyticsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'api_security_auditor',
    description: 'Audit API security configuration against OWASP standards. Identifies vulnerabilities and provides prioritized remediation steps.',
    parameters: {
      security_config: { type: 'string', required: true, description: 'JSON object with fields: auth_method (oauth2/api_key/basic/none), rate_limiting (bool), cors (bool), input_validation (bool), encryption (tls13/tls12/none), oauth_scopes (bool), ip_whitelist (bool), waf_enabled (bool), ddos_protection (bool), audit_logging (bool)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { security_config: string }) {
      const data: SecurityConfig = JSON.parse(args.security_config)
      const result = auditApiSecurity(data)
      return formatSecurityReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'graphql_optimizer',
    description: 'Analyze GraphQL query patterns and recommend optimizations for N+1 issues, batching strategies, caching, and performance gains.',
    parameters: {
      graphql_data: { type: 'string', required: true, description: 'JSON object with fields: queries (array of query strings), resolvers (count), n_plus_1_issues (count), depth_complexity (max depth), avg_response_size (KB, optional), cache_hit_rate (0-1, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { graphql_data: string }) {
      const data: GraphqlData = JSON.parse(args.graphql_data)
      const result = optimizeGraphql(data)
      return formatGraphqlReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'api_portfolio_manager',
    description: 'Analyze API portfolio lifecycle, identify deprecation candidates, find consolidation opportunities, and generate roadmap recommendations.',
    parameters: {
      apis: { type: 'string', required: true, description: 'JSON array of API objects with fields: name, version, status (active/deprecated/beta/retired), consumers (count), revenue (USD/month)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { apis: string }) {
      const data: ApiPortfolioItem[] = JSON.parse(args.apis)
      const result = manageApiPortfolio(data)
      return formatPortfolioReport(result)
    }
  }))

  console.log(`[dsh-tool-apieco] Loaded v${VERSION} — API Economy & Monetization Engine with 8 tools`)
  console.log('  Tools: api_valuator, rate_limiter_designer, developer_experience_scorer, api_monetization_advisor, api_analytics_dashboard, api_security_auditor, graphql_optimizer, api_portfolio_manager')
}
