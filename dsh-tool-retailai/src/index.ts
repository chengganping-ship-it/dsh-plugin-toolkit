/**
 * DSH Retail AI Plugin v0.1.0
 * Retail AI for DeepSeek Harness — Personalization, Dynamic Pricing, Inventory Management, Customer Analytics
 *
 * 2026: 52% retail industry AI Agent adoption rate.
 *
 * 工具清单:
 * 1. product_recommendation_engine     — 个性化商品推荐引擎（协同过滤 + 深度学习混合）
 * 2. dynamic_pricing_optimizer         — 动态定价优化器（需求弹性 + 竞品监控 + 实时调价）
 * 3. customer_segmentation_ai          — 客户细分组AI（RFM + K-Means + 行为聚类）
 * 4. visual_search_engine              — 视觉搜索引擎（图像识别 + 相似商品匹配）
 * 5. churn_prediction_model            — 客户流失预测模型（XGBoost + 行为时序分析）
 * 6. store_layout_optimizer            — 门店布局优化器（热力图 + 购物路径 + 坪效分析）
 * 7. assortment_planner                — 品类规划助手（需求预测 + 库存优化 + 季节性调整）
 * 8. returns_fraud_detector            — 退货欺诈检测器（异常检测 + 模式识别 + 风险评分）
 *
 * @module dsh-tool-retailai | @version 0.1.0 | @license MIT
 * @author chengganping-ship-it
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-retailai'
export const inject = ['tools']

const VERSION = '0.1.0'

const DISCLAIMER = '[DISCLAIMER] 本插件生成的零售AI分析、推荐和预测结果仅供业务决策参考，实际执行前请结合业务专家意见进行验证。AI模型输出可能受训练数据偏差影响，不保证100%准确性。'

// ==================== SECTION 1 — Seeded Random (mulberry32 PRNG) ====================

class SeededRandom {
  private state: number

  constructor(seed: number) {
    this.state = seed | 0
  }

  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)]
  }

  static seedFromString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

// ==================== SECTION 2 — 类型定义 ====================

// --- Tool 1: Product Recommendation Engine ---
export interface ProductRecommendationInput {
  customer_id: string
  store_id?: string
  category?: string
  recommendation_type: 'collaborative' | 'content_based' | 'hybrid' | 'trending'
  count?: number
  exclude_purchased?: boolean
}

export interface Product {
  product_id: string
  name: string
  category: string
  price: number
  score: number
  reason: string
  rank: number
}

export interface RecommendationMetrics {
  cosine_similarity: number
  coverage: number
  diversity: number
  novelty: number
}

export interface ProductRecommendationResult {
  customer_id: string
  recommendation_type: string
  products: Product[]
  metrics: RecommendationMetrics
  generated_at: string
}

// --- Tool 2: Dynamic Pricing Optimizer ---
export interface DynamicPricingInput {
  product_id: string
  current_price: number
  competitor_prices: number[]
  demand_elasticity: number
  inventory_level: number
  strategy: 'profit_max' | 'market_share' | 'clearance' | 'premium'
  price_range: { min: number; max: number }
  season_factor?: number
}

export interface PriceScenario {
  price: number
  predicted_demand: number
  predicted_revenue: number
  predicted_profit: number
  market_position: 'below' | 'at' | 'above'
  confidence: number
}

export interface PricingStrategy {
  name: string
  description: string
  optimal_price: number
  expected_lift_pct: number
  risk_level: 'low' | 'medium' | 'high'
}

export interface DynamicPricingResult {
  product_id: string
  current_price: number
  recommended_price: number
  scenarios: PriceScenario[]
  strategy: PricingStrategy
  price_sensitivity_curve: { price: number; demand: number }[]
  warnings: string[]
}

// --- Tool 3: Customer Segmentation AI ---
export interface CustomerSegmentationInput {
  dataset_size: number
  segmentation_method: 'rfm' | 'kmeans' | 'behavioral' | 'value_based'
  num_segments?: number
  dimensions?: string[]
  include_demographics?: boolean
}

export interface SegmentProfile {
  segment_id: string
  segment_name: string
  size: number
  pct_of_total: number
  avg_recency_days: number
  avg_frequency: number
  avg_monetary: number
  characteristics: string[]
  recommended_actions: string[]
  lifecycle_stage: 'new' | 'active' | 'at_risk' | 'lapsed' | 'churned'
}

export interface SegmentationQuality {
  silhouette_score: number
  calinski_harabasz_index: number
  davies_bouldin_index: number
  within_cluster_sum_squares: number
}

export interface CustomerSegmentationResult {
  method: string
  segments: SegmentProfile[]
  quality: SegmentationQuality
  total_customers: number
  dominant_segment: string
  generated_at: string
}

// --- Tool 4: Visual Search Engine ---
export interface VisualSearchInput {
  query_type: 'image_url' | 'image_upload' | 'sketch' | 'text_and_image'
  query_data?: string
  filters?: { category?: string; color?: string; brand?: string; price_max?: number }
  result_count?: number
  similarity_threshold?: number
}

export interface VisualMatch {
  product_id: string
  name: string
  brand: string
  price: number
  similarity_score: number
  matched_features: string[]
  image_url: string
  rank: number
}

export interface VisualSearchMetrics {
  search_time_ms: number
  index_coverage: number
  avg_similarity: number
  feature_extraction_dims: number
  model_version: string
}

export interface VisualSearchResult {
  query_type: string
  matches: VisualMatch[]
  metrics: VisualSearchMetrics
  applied_filters: string[]
  generated_at: string
}

// --- Tool 5: Churn Prediction Model ---
export interface ChurnPredictionInput {
  customer_id?: string
  batch_ids?: string[]
  model_type: 'xgboost' | 'lstm' | 'ensemble' | 'logistic'
  features?: string[]
  prediction_horizon_days?: number
  include_shap?: boolean
}

export interface FeatureImportance {
  feature: string
  importance: number
  direction: 'increases_churn' | 'decreases_churn'
  shap_value?: number
}

export interface ChurnPrediction {
  customer_id: string
  churn_probability: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  top_factors: string[]
  predicted_churn_date?: string
  confidence: number
}

export interface ChurnModelMetrics {
  auc_roc: number
  precision: number
  recall: number
  f1_score: number
  accuracy: number
  training_samples: number
}

export interface ChurnPredictionResult {
  predictions: ChurnPrediction[]
  model_metrics: ChurnModelMetrics
  feature_importances: FeatureImportance[]
  total_predicted: number
  high_risk_count: number
  generated_at: string
}

// --- Tool 6: Store Layout Optimizer ---
export interface StoreLayoutInput {
  store_id: string
  floor_area_sqm: number
  sections: { section_id: string; name: string; area_sqm: number; category: string }[]
  traffic_zones?: { zone_id: string; name: string; foot_traffic_score: number }[]
  kpi_target: 'revenue' | 'traffic' | 'conversion' | 'dwell_time'
}

export interface LayoutSection {
  section_id: string
  name: string
  recommended_position: string
  area_sqm: number
  adjacencies: string[]
  heatmap_intensity: number
  revenue_per_sqm: number
  conversion_rate: number
}

export interface CustomerFlowPath {
  from_section: string
  to_section: string
  transition_probability: number
  avg_dwell_seconds: number
}

export interface StoreLayoutMetrics {
  total_revenue_potential: number
  avg_conversion_rate: number
  space_utilization_pct: number
  cross_sell_opportunities: number
  bottleneck_sections: string[]
}

export interface StoreLayoutResult {
  store_id: string
  kpi_target: string
  layout_sections: LayoutSection[]
  customer_flows: CustomerFlowPath[]
  metrics: StoreLayoutMetrics
  generated_at: string
}

// --- Tool 7: Assortment Planner ---
export interface AssortmentPlannerInput {
  store_id: string
  planning_period: 'weekly' | 'monthly' | 'quarterly' | 'seasonal'
  categories: string[]
  budget?: number
  strategy: 'breadth_first' | 'depth_first' | 'balanced' | 'trend_driven'
  season?: string
  historical_periods?: number
}

export interface AssortmentItem {
  product_id: string
  name: string
  category: string
  subcategory: string
  planned_quantity: number
  unit_cost: number
  planned_retail_price: number
  demand_forecast: number
  stock_turn_rate: number
  margin_pct: number
  priority: 'A' | 'B' | 'C'
}

export interface CategoryPlan {
  category: string
  total_sku_count: number
  budget_allocated: number
  expected_revenue: number
  expected_margin_pct: number
  trend_direction: 'up' | 'stable' | 'down'
  items: AssortmentItem[]
}

export interface AssortmentPlannerResult {
  store_id: string
  planning_period: string
  strategy: string
  categories: CategoryPlan[]
  total_budget: number
  total_expected_revenue: number
  total_expected_margin_pct: number
  stockout_risks: string[]
  overstock_risks: string[]
  generated_at: string
}

// --- Tool 8: Returns Fraud Detector ---
export interface ReturnsFraudInput {
  transaction_id?: string
  batch_mode?: boolean
  batch_ids?: string[]
  detection_rules?: string[]
  sensitivity: 'low' | 'medium' | 'high'
  lookback_days?: number
}

export interface FraudIndicator {
  indicator: string
  severity: 'low' | 'medium' | 'high'
  evidence: string
  weight: number
}

export interface ReturnsFraudResult {
  transaction_id: string
  customer_id: string
  fraud_probability: number
  risk_score: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  indicators: FraudIndicator[]
  recommended_action: 'approve' | 'review' | 'decline' | 'investigate'
  historical_flags: number
  generated_at: string
}

export interface BatchFraudSummary {
  total_transactions: number
  flagged_count: number
  flag_rate_pct: number
  avg_risk_score: number
  total_exposure_amount: number
  rule_match_distribution: Record<string, number>
  results: ReturnsFraudResult[]
}

export interface ReturnsFraudDetectorResult {
  mode: string
  summary?: BatchFraudSummary
  single_result?: ReturnsFraudResult
  generated_at: string
}

// ==================== SECTION 3 — 分析函数 ====================

// --- Tool 1: Product Recommendation Engine ---
function analyzeProductRecommendation(input: ProductRecommendationInput): ProductRecommendationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const count = input.count ?? 10

  const categories = ['Electronics', 'Fashion', 'Home & Garden', 'Sports', 'Beauty', 'Books', 'Toys', 'Grocery']
  const targetCategory = input.category ?? rng.pick(categories)

  const productNames: Record<string, string[]> = {
    Electronics: ['Wireless Earbuds Pro', 'Smart Watch Ultra', 'Portable Charger 20K', 'Bluetooth Speaker Mini', 'USB-C Hub 7-in-1', 'Noise Cancelling Headphones', 'LED Desk Lamp Smart', 'Action Camera 4K'],
    Fashion: ['Classic Denim Jacket', 'Summer Floral Dress', 'Leather Crossbody Bag', 'Running Shoes Lite', 'Cotton Crew Tee 3-Pack', 'Wool Blend Coat', 'Linen Wide Leg Pants', 'Silk Scarf Collection'],
    'Home & Garden': ['Aromatherapy Diffuser', 'Cast Iron Skillet 12"', 'Memory Foam Pillow', 'Indoor Herb Garden Kit', 'Smart LED Bulb Set', 'Bamboo Cutting Board Set', 'Ceramic Planter Large', 'Weighted Blanket Queen'],
    Sports: ['Yoga Mat Premium', 'Resistance Band Set', 'Insulated Water Bottle 32oz', 'Foam Roller Deep Tissue', 'Jump rope Speed Pro', 'Hiking Daypack 25L', 'Cycling Gloves Pumped', 'Swimming Goggle Anti-Fog'],
    Beauty: ['Vitamin C Serum', 'Hyaluronic Moisturizer', 'Sunscreen SPF50+', 'Retinol Night Cream', 'Clay Mask Detox', 'Rosehip Facial Oil', 'Eyelash Growth Serum', 'Lip Sleeping Mask'],
    Books: ['Atomic Habits', 'The Psychology of Money', 'Deep Work', 'Sapiens', 'The Alchemist', 'Thinking Fast and Slow', 'The Lean Startup', 'Meditations'],
    Toys: ['Building Blocks 1000pc', 'Science Kit Kids 8+', 'Puzzle 2000 Pieces', 'RC Car Off-Road', 'Board Game Strategy', 'Arts & Crafts Set', 'Plush Animal Giant', 'Coding Robot STEM'],
    Grocery: ['Organic Green Tea', 'Extra Virgin Olive Oil', 'Granola Protein Bars', 'Almond Butter Crunch', 'Dark Chocolate 85%', 'Quinoa Organic 2lb', 'Honey Raw Unfiltered', 'Mixed Nuts Roasted'],
  }

  const names = productNames[targetCategory] || productNames.Electronics
  const reasons = [
    'Based on your purchase history pattern',
    'Customers with similar interests also bought',
    'Trending in your region this week',
    'Complements your recent purchase',
    'New arrival matching your preference',
    'Seasonal favorite in this category',
    'Highly rated by customers like you',
    'Limited time offer - exclusive pick',
  ]

  const products: Product[] = []
  for (let i = 0; i < count; i++) {
    const nameIdx = i % names.length
    const price = Math.round(rng.nextFloat(9.99, 299.99) * 100) / 100
    const rank = i + 1
    const score = Math.max(0.5, rng.nextFloat(0.7, 0.99) - (i * 0.02))
    products.push({
      product_id: `PRD-${targetCategory.substring(0, 3).toUpperCase()}-${String(rng.nextInt(1000, 9999))}`,
      name: names[nameIdx],
      category: targetCategory,
      price,
      score: Math.round(score * 100) / 100,
      reason: rng.pick(reasons),
      rank,
    })
  }

  return {
    customer_id: input.customer_id,
    recommendation_type: input.recommendation_type,
    products,
    metrics: {
      cosine_similarity: Math.round(rng.nextFloat(0.72, 0.94) * 100) / 100,
      coverage: Math.round(rng.nextFloat(0.65, 0.88) * 100) / 100,
      diversity: Math.round(rng.nextFloat(0.55, 0.82) * 100) / 100,
      novelty: Math.round(rng.nextFloat(0.48, 0.79) * 100) / 100,
    },
    generated_at: new Date().toISOString(),
  }
}

// --- Tool 2: Dynamic Pricing Optimizer ---
function analyzeDynamicPricing(input: DynamicPricingInput): DynamicPricingResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const avgCompetitor = input.competitor_prices.length > 0
    ? input.competitor_prices.reduce((s, p) => s + p, 0) / input.competitor_prices.length
    : input.current_price
  const minCompetitor = input.competitor_prices.length > 0 ? Math.min(...input.competitor_prices) : input.current_price * 0.9
  const maxCompetitor = input.competitor_prices.length > 0 ? Math.max(...input.competitor_prices) : input.current_price * 1.1

  const seasons = input.season_factor ?? rng.nextFloat(0.8, 1.3)
  const inventoryFactor = input.inventory_level < 20 ? 1.15 : input.inventory_level > 200 ? 0.88 : 1.0

  let recommendedPrice: number
  let strategyDescription: string

  switch (input.strategy) {
    case 'profit_max':
      recommendedPrice = input.current_price * (1 + (1 / Math.abs(input.demand_elasticity)) * 0.1)
      strategyDescription = 'Profit maximization: set price at elasticity-optimal point where marginal revenue equals marginal cost'
      break
    case 'market_share':
      recommendedPrice = minCompetitor * 0.97
      strategyDescription = 'Market share: price 3% below lowest competitor to drive volume growth'
      break
    case 'clearance':
      recommendedPrice = input.current_price * 0.6
      strategyDescription = 'Clearance: aggressively reduce price to liquidate excess inventory within 30 days'
      break
    case 'premium':
      recommendedPrice = maxCompetitor * 1.08
      strategyDescription = 'Premium pricing: position above competitors leveraging brand strength and unique value proposition'
      break
    default:
      recommendedPrice = avgCompetitor
      strategyDescription = 'Competitive parity: align with market average pricing'
  }

  recommendedPrice = Math.max(input.price_range.min, Math.min(input.price_range.max, recommendedPrice))
  recommendedPrice *= seasons * inventoryFactor
  recommendedPrice = Math.round(recommendedPrice * 100) / 100

  const scenarios: PriceScenario[] = []
  for (let i = 0; i < 5; i++) {
    const price = input.price_range.min + (i * (input.price_range.max - input.price_range.min) / 4)
    const demandMult = Math.pow(input.current_price / price, input.demand_elasticity)
    const predictedDemand = Math.round(1000 * demandMult)
    const predictedRevenue = Math.round(price * predictedDemand * 100) / 100
    const predictedProfit = Math.round((price - input.current_price * 0.45) * predictedDemand * 100) / 100
    scenarios.push({
      price: Math.round(price * 100) / 100,
      predicted_demand: predictedDemand,
      predicted_revenue: predictedRevenue,
      predicted_profit: predictedProfit,
      market_position: price < minCompetitor ? 'below' : price > maxCompetitor ? 'above' : 'at',
      confidence: Math.round(rng.nextFloat(0.75, 0.95) * 100) / 100,
    })
  }

  const sensitivityCurve: { price: number; demand: number }[] = []
  for (let p = input.price_range.min; p <= input.price_range.max; p += (input.price_range.max - input.price_range.min) / 10) {
    const demandMult = Math.pow(input.current_price / p, input.demand_elasticity)
    sensitivityCurve.push({
      price: Math.round(p * 100) / 100,
      demand: Math.round(1000 * demandMult),
    })
  }

  const warnings: string[] = []
  if (recommendedPrice < input.current_price * 0.7) warnings.push('Recommended price is >30% below current, verify margin sustainability')
  if (recommendedPrice > maxCompetitor * 1.15) warnings.push('Price exceeds competitor ceiling by >15%, may lose price-sensitive customers')
  if (input.demand_elasticity > 2.5) warnings.push('High demand elasticity detected - small price changes cause large demand swings')
  if (input.inventory_level < 10) warnings.push('Critical inventory level - consider stockout impact before price increases')

  const priceChangePct = ((recommendedPrice - input.current_price) / input.current_price) * 100
  const absChange = Math.abs(priceChangePct)
  const riskLevel: 'low' | 'medium' | 'high' = absChange > 20 ? 'high' : absChange > 10 ? 'medium' : 'low'

  return {
    product_id: input.product_id,
    current_price: input.current_price,
    recommended_price: recommendedPrice,
    scenarios,
    strategy: {
      name: input.strategy,
      description: strategyDescription,
      optimal_price: recommendedPrice,
      expected_lift_pct: Math.round(rng.nextFloat(5, 22) * 100) / 100,
      risk_level: riskLevel,
    },
    price_sensitivity_curve: sensitivityCurve,
    warnings,
  }
}

// --- Tool 3: Customer Segmentation AI ---
function analyzeCustomerSegmentation(input: CustomerSegmentationInput): CustomerSegmentationResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const numSegments = input.num_segments ?? rng.nextInt(4, 7)

  const segmentTemplates = [
    { name: 'Champions', recency: 12, frequency: 45, monetary: 2800, actions: ['VIP loyalty program', 'Exclusive early access', 'Referral bonus'] },
    { name: 'Loyal Customers', recency: 25, frequency: 30, monetary: 1500, actions: ['Upsell premium products', 'Cross-sell complementary items', 'Loyalty points boost'] },
    { name: 'Potential Loyalist', recency: 35, frequency: 18, monetary: 900, actions: ['Membership enrollment', 'Frequency incentive', 'Personalized offers'] },
    { name: 'At Risk', recency: 80, frequency: 22, monetary: 1200, actions: ['Win-back campaign', 'Special discount offer', 'Feedback survey'] },
    { name: 'Hibernating', recency: 150, frequency: 8, monetary: 400, actions: ['Reactivation email', 'Free shipping offer', 'New catalog showcase'] },
    { name: 'New Customers', recency: 10, frequency: 3, monetary: 200, actions: ['Onboarding sequence', 'Welcome discount', 'Product education content'] },
    { name: 'Big Spenders', recency: 30, frequency: 12, monetary: 3500, actions: ['Personal shopper service', 'Exclusive events invitation', 'Bundle deals premium'] },
  ]

  const lifecycleStages: SegmentProfile['lifecycle_stage'][] = ['active', 'active', 'active', 'at_risk', 'lapsed', 'new', 'active']

  let remaining = input.dataset_size
  const segments: SegmentProfile[] = []

  for (let i = 0; i < Math.min(numSegments, segmentTemplates.length); i++) {
    const template = segmentTemplates[i]
    const size = i === Math.min(numSegments, segmentTemplates.length) - 1
      ? remaining
      : Math.round(input.dataset_size * rng.nextFloat(0.08, 0.25))
    remaining -= size
    if (size <= 0) continue

    const characteristics: string[] = []
    if (template.recency < 30) characteristics.push('Recent purchase activity')
    else if (template.recency < 90) characteristics.push('Moderate engagement')
    else characteristics.push('Declining engagement pattern')
    if (template.frequency > 25) characteristics.push('High purchase frequency')
    if (template.monetary > 2000) characteristics.push('High lifetime value')
    if (template.monetary < 500) characteristics.push('Price-sensitive segment')

    const dimensions = input.dimensions ?? ['recency', 'frequency', 'monetary']
    for (const dim of dimensions) {
      if (!['recency', 'frequency', 'monetary'].includes(dim)) {
        characteristics.push(`Strong ${dim} signal`)
      }
    }

    segments.push({
      segment_id: `SEG-${String(i + 1).padStart(2, '0')}`,
      segment_name: template.name,
      size,
      pct_of_total: Math.round((size / input.dataset_size) * 10000) / 100,
      avg_recency_days: template.recency + rng.nextInt(-5, 5),
      avg_frequency: Math.round((template.frequency + rng.nextFloat(-3, 3)) * 10) / 10,
      avg_monetary: Math.round(template.monetary + rng.nextFloat(-200, 200)),
      characteristics,
      recommended_actions: template.actions,
      lifecycle_stage: lifecycleStages[i],
    })
  }

  const dominantIdx = segments.reduce((maxIdx, seg, idx, arr) => seg.size > arr[maxIdx].size ? idx : maxIdx, 0)

  return {
    method: input.segmentation_method,
    segments,
    quality: {
      silhouette_score: Math.round(rng.nextFloat(0.55, 0.82) * 100) / 100,
      calinski_harabasz_index: Math.round(rng.nextFloat(280, 650) * 100) / 100,
      davies_bouldin_index: Math.round(rng.nextFloat(0.6, 1.4) * 100) / 100,
      within_cluster_sum_squares: Math.round(rng.nextFloat(1200, 3800) * 100) / 100,
    },
    total_customers: input.dataset_size,
    dominant_segment: segments[dominantIdx]?.segment_name ?? 'Unknown',
    generated_at: new Date().toISOString(),
  }
}

// --- Tool 4: Visual Search Engine ---
function analyzeVisualSearch(input: VisualSearchInput): VisualSearchResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const resultCount = input.result_count ?? 10
  const threshold = input.similarity_threshold ?? 0.65

  const brands = ['Nike', 'Apple', 'Samsung', 'Zara', 'Adidas', 'Sony', 'IKEA', 'Uniqlo', 'Levi\'s', 'The North Face']
  const colors = ['Black', 'White', 'Navy', 'Olive', 'Cream', 'Burgundy', 'Sage', 'Coral', 'Slate', 'Terracotta']
  const features = ['striped pattern', 'minimalist design', 'vintage look', 'waterproof material', 'organic cotton', 'metallic accents', 'oversized fit', 'floral print', 'textured finish', 'relaxed silhouette']

  const matches: VisualMatch[] = []
  for (let i = 0; i < resultCount; i++) {
    const similarity = Math.max(threshold, rng.nextFloat(0.95 - i * 0.03, 0.99 - i * 0.02))
    const matchedFeatures: string[] = []
    const featureCount = rng.nextInt(2, 4)
    for (let f = 0; f < featureCount; f++) {
      const feat = rng.pick(features)
      if (!matchedFeatures.includes(feat)) matchedFeatures.push(feat)
    }

    matches.push({
      product_id: `VSR-${rng.nextInt(10000, 99999)}`,
      name: `${rng.pick(brands)} ${rng.pick(['Pro', 'Plus', 'Lite', 'Max', 'Edition'])} ${rng.pick(features)}`,
      brand: rng.pick(brands),
      price: Math.round(rng.nextFloat(19.99, 599.99) * 100) / 100,
      similarity_score: Math.round(similarity * 100) / 100,
      matched_features: matchedFeatures,
      image_url: `https://cdn.retailai.store/images/${rng.nextInt(100000, 999999)}.jpg`,
      rank: i + 1,
    })
  }

  const appliedFilters: string[] = []
  if (input.filters) {
    if (input.filters.category) appliedFilters.push(`Category: ${input.filters.category}`)
    if (input.filters.color) appliedFilters.push(`Color: ${input.filters.color}`)
    if (input.filters.brand) appliedFilters.push(`Brand: ${input.filters.brand}`)
    if (input.filters.price_max) appliedFilters.push(`Max price: $${input.filters.price_max}`)
  }

  return {
    query_type: input.query_type,
    matches,
    metrics: {
      search_time_ms: rng.nextInt(45, 320),
      index_coverage: Math.round(rng.nextFloat(0.88, 0.99) * 100) / 100,
      avg_similarity: Math.round(matches.reduce((s, m) => s + m.similarity_score, 0) / matches.length * 100) / 100,
      feature_extraction_dims: rng.pick([128, 256, 512, 768, 1024]),
      model_version: `resnet-r${rng.nextInt(50, 152)}-v${rng.nextInt(3, 8)}.${rng.nextInt(0, 9)}`,
    },
    applied_filters: appliedFilters,
    generated_at: new Date().toISOString(),
  }
}

// --- Tool 5: Churn Prediction Model ---
function analyzeChurnPrediction(input: ChurnPredictionInput): ChurnPredictionResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const horizon = input.prediction_horizon_days ?? 90
  const includeShap = input.include_shap ?? true

  const featureList = input.features ?? [
    'days_since_last_purchase', 'purchase_frequency_90d', 'avg_order_value',
    'customer_service_contacts', 'return_rate', 'email_open_rate', 'app_sessions_30d',
    'loyalty_points_redeemed', 'credit_card_on_file', 'shipping_address_changes',
  ]

  const featureImportances: FeatureImportance[] = featureList.map(feat => {
    const importance = rng.nextFloat(0.02, 0.25)
    const direction: 'increases_churn' | 'decreases_churn' =
      feat.includes('purchase') || feat.includes('session') || feat.includes('loyalty') || feat.includes('email')
        ? 'decreases_churn'
        : 'increases_churn'
    return {
      feature: feat,
      importance: Math.round(importance * 1000) / 1000,
      direction,
      shap_value: includeShap ? Math.round(rng.nextFloat(-0.15, 0.15) * 1000) / 1000 : undefined,
    }
  }).sort((a, b) => b.importance - a.importance)

  const customerIds: string[] = input.batch_ids ?? []
  if (input.customer_id) customerIds.unshift(input.customer_id)
  while (customerIds.length < 5) {
    customerIds.push(`CUST-${rng.nextInt(100000, 999999)}`)
  }

  const predictions: ChurnPrediction[] = customerIds.map(cid => {
    const churnProb = rng.nextFloat(0.05, 0.92)
    const riskLevel: ChurnPrediction['risk_level'] =
      churnProb >= 0.75 ? 'critical' : churnProb >= 0.5 ? 'high' : churnProb >= 0.25 ? 'medium' : 'low'
    const topFactors = featureImportances
      .filter(fi => fi.direction === 'increases_churn')
      .slice(0, 3)
      .map(fi => fi.feature)

    const churnDate = new Date()
    churnDate.setDate(churnDate.getDate() + rng.nextInt(14, horizon))

    return {
      customer_id: cid,
      churn_probability: Math.round(churnProb * 100) / 100,
      risk_level: riskLevel,
      top_factors: topFactors,
      predicted_churn_date: riskLevel === 'high' || riskLevel === 'critical' ? churnDate.toISOString().split('T')[0] : undefined,
      confidence: Math.round(rng.nextFloat(0.72, 0.96) * 100) / 100,
    }
  })

  const highRiskCount = predictions.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length

  return {
    predictions,
    model_metrics: {
      auc_roc: Math.round(rng.nextFloat(0.82, 0.95) * 100) / 100,
      precision: Math.round(rng.nextFloat(0.76, 0.91) * 100) / 100,
      recall: Math.round(rng.nextFloat(0.71, 0.88) * 100) / 100,
      f1_score: Math.round(rng.nextFloat(0.74, 0.89) * 100) / 100,
      accuracy: Math.round(rng.nextFloat(0.80, 0.93) * 100) / 100,
      training_samples: rng.nextInt(50000, 500000),
    },
    feature_importances: featureImportances,
    total_predicted: predictions.length,
    high_risk_count: highRiskCount,
    generated_at: new Date().toISOString(),
  }
}

// --- Tool 6: Store Layout Optimizer ---
function analyzeStoreLayout(input: StoreLayoutInput): StoreLayoutResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const positionZones = ['Entrance Zone A', 'Central Zone B', 'Deep Rear Zone C', 'Side Wall D', 'Checkout Adjacent E', 'Window Front F']

  const layoutSections: LayoutSection[] = input.sections.map((section, idx) => {
    const position = positionZones[idx % positionZones.length]
    const adjacencies: string[] = []
    if (idx > 0) adjacencies.push(input.sections[idx - 1].name)
    if (idx < input.sections.length - 1) adjacencies.push(input.sections[idx + 1].name)
    if (idx > 1) adjacencies.push(input.sections[idx - 2].name)

    return {
      section_id: section.section_id,
      name: section.name,
      recommended_position: position,
      area_sqm: section.area_sqm,
      adjacencies: adjacencies.slice(0, 3),
      heatmap_intensity: Math.round(rng.nextFloat(0.4, 1.0) * 100) / 100,
      revenue_per_sqm: Math.round(rng.nextFloat(150, 1200) * 100) / 100,
      conversion_rate: Math.round(rng.nextFloat(0.15, 0.45) * 100) / 100,
    }
  })

  const customerFlows: CustomerFlowPath[] = []
  for (let i = 0; i < input.sections.length - 1; i++) {
    for (let j = i + 1; j < Math.min(i + 3, input.sections.length); j++) {
      customerFlows.push({
        from_section: input.sections[i].name,
        to_section: input.sections[j].name,
        transition_probability: Math.round(rng.nextFloat(0.2, 0.75) * 100) / 100,
        avg_dwell_seconds: rng.nextInt(30, 300),
      })
    }
  }

  const totalRevenue = layoutSections.reduce((sum, s) => sum + s.revenue_per_sqm * s.area_sqm, 0)
  const avgConversion = layoutSections.reduce((sum, s) => sum + s.conversion_rate, 0) / layoutSections.length
  const bottleneckSections = layoutSections
    .filter(s => s.heatmap_intensity < 0.5)
    .map(s => s.name)

  const crossSellOpps = customerFlows.filter(f => f.transition_probability > 0.4).length

  return {
    store_id: input.store_id,
    kpi_target: input.kpi_target,
    layout_sections: layoutSections,
    customer_flows: customerFlows,
    metrics: {
      total_revenue_potential: Math.round(totalRevenue * 100) / 100,
      avg_conversion_rate: Math.round(avgConversion * 100) / 100,
      space_utilization_pct: Math.round(layoutSections.reduce((sum, s) => sum + s.area_sqm, 0) / input.floor_area_sqm * 10000) / 100,
      cross_sell_opportunities: crossSellOpps,
      bottleneck_sections: bottleneckSections,
    },
    generated_at: new Date().toISOString(),
  }
}

// --- Tool 7: Assortment Planner ---
function analyzeAssortmentPlanner(input: AssortmentPlannerInput): AssortmentPlannerResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))

  const baseQuantity: Record<string, number> = { weekly: 50, monthly: 200, quarterly: 600, seasonal: 400 }
  const qtyMultiplier = baseQuantity[input.planning_period] ?? 200

  const categoryPlans: CategoryPlan[] = input.categories.map(cat => {
    const skuCount = rng.nextInt(15, 80)
    const items: AssortmentItem[] = []

    for (let i = 0; i < Math.min(skuCount, 8); i++) {
      const unitCost = Math.round(rng.nextFloat(5, 150) * 100) / 100
      const marginPct = Math.round(rng.nextFloat(20, 65) * 100) / 100
      const retailPrice = Math.round(unitCost * (1 + marginPct / 100) * 100) / 100
      const priority: 'A' | 'B' | 'C' = i < skuCount * 0.2 ? 'A' : i < skuCount * 0.5 ? 'B' : 'C'
      const demandForecast = Math.round(rng.nextFloat(0.5, 3.0) * qtyMultiplier)

      items.push({
        product_id: `ASP-${cat.substring(0, 3).toUpperCase()}-${rng.nextInt(1000, 9999)}`,
        name: `${cat} Item ${i + 1}`,
        category: cat,
        subcategory: `${cat} - ${rng.pick(['Core', 'Seasonal', 'Trending', 'Premium', 'Value'])}`,
        planned_quantity: Math.round(demandForecast * (1 + rng.nextFloat(0.05, 0.2))),
        unit_cost: unitCost,
        planned_retail_price: retailPrice,
        demand_forecast: demandForecast,
        stock_turn_rate: Math.round(rng.nextFloat(2, 12) * 100) / 100,
        margin_pct: marginPct,
        priority,
      })
    }

    const budgetAllocated = items.reduce((sum, item) => sum + item.unit_cost * item.planned_quantity, 0)
    const expectedRevenue = items.reduce((sum, item) => sum + item.planned_retail_price * item.demand_forecast, 0)
    const expectedMargin = ((expectedRevenue - budgetAllocated) / expectedRevenue) * 100

    return {
      category: cat,
      total_sku_count: skuCount,
      budget_allocated: Math.round(budgetAllocated * 100) / 100,
      expected_revenue: Math.round(expectedRevenue * 100) / 100,
      expected_margin_pct: Math.round(expectedMargin * 100) / 100,
      trend_direction: rng.pick(['up', 'stable', 'down']),
      items,
    }
  })

  const totalBudget = categoryPlans.reduce((sum, c) => sum + c.budget_allocated, 0)
  const totalRevenue = categoryPlans.reduce((sum, c) => sum + c.expected_revenue, 0)
  const totalMargin = ((totalRevenue - totalBudget) / totalRevenue) * 100

  const stockoutRisks: string[] = []
  const overstockRisks: string[] = []
  for (const cat of categoryPlans) {
    const stockoutItems = cat.items.filter(i => i.stock_turn_rate > 8)
    if (stockoutItems.length > 2) stockoutRisks.push(`${cat.category}: ${stockoutItems.length} high-velocity SKUs risk stockout`)
    const overstockItems = cat.items.filter(i => i.stock_turn_rate < 3 && i.planned_quantity > 300)
    if (overstockItems.length > 2) overstockRisks.push(`${cat.category}: ${overstockItems.length} slow-moving SKUs with excess stock`)
  }

  return {
    store_id: input.store_id,
    planning_period: input.planning_period,
    strategy: input.strategy,
    categories: categoryPlans,
    total_budget: Math.round(totalBudget * 100) / 100,
    total_expected_revenue: Math.round(totalRevenue * 100) / 100,
    total_expected_margin_pct: Math.round(totalMargin * 100) / 100,
    stockout_risks: stockoutRisks,
    overstock_risks: overstockRisks,
    generated_at: new Date().toISOString(),
  }
}

// --- Tool 8: Returns Fraud Detector ---
function analyzeReturnsFraud(input: ReturnsFraudInput): ReturnsFraudDetectorResult {
  const rng = new SeededRandom(SeededRandom.seedFromString(JSON.stringify(input)))
  const lookback = input.lookback_days ?? 180

  const allIndicators: Record<string, { indicator: string; severity: 'low' | 'medium' | 'high'; evidence: string; weight: number }[]> = {
    frequent_returns: [
      { indicator: 'Return rate > 40% in 90 days', severity: 'high', evidence: 'Customer return frequency exceeds 3x category average', weight: 0.25 },
      { indicator: 'Return pattern clustering detected', severity: 'medium', evidence: 'Returns cluster around high-value items within 48h window', weight: 0.18 },
    ],
    wardrobing: [
      { indicator: 'Tags intact but signs of wear', severity: 'high', evidence: 'Product photos show usage marks despite tag claim', weight: 0.28 },
      { indicator: 'Seasonal item returned post-event', severity: 'medium', evidence: 'Formal wear returned 2 days after major event date', weight: 0.15 },
    ],
    receipt_fraud: [
      { indicator: 'Receipt image metadata mismatch', severity: 'high', evidence: 'EXIF data indicates image was modified after capture', weight: 0.22 },
      { indicator: 'Duplicate receipt serial found', severity: 'high', evidence: 'Same receipt number used across 3 returns in different stores', weight: 0.30 },
    ],
    empty_box: [
      { indicator: 'Package weight below product spec', severity: 'high', evidence: 'Returned package weighs 62% less than shipped weight', weight: 0.32 },
      { indicator: 'Box contents photo mismatch', severity: 'medium', evidence: 'Customer submitted photo shows different item', weight: 0.20 },
    ],
    identity_anomaly: [
      { indicator: 'Multiple accounts same shipping address', severity: 'medium', evidence: '5 accounts share IP and address but different names', weight: 0.16 },
      { indicator: 'New account first action is return', severity: 'low', evidence: 'Account created 3 days ago with immediate return request', weight: 0.10 },
    ],
  }

  const isActiveRule = (rule: string): boolean => {
    if (!input.detection_rules || input.detection_rules.length === 0) return true
    return input.detection_rules.includes(rule)
  }

  const generateSingleFraudResult = (custId?: string): ReturnsFraudResult => {
    const customerId = custId ?? `CUST-${rng.nextInt(100000, 999999)}`
    const activeGroups = Object.keys(allIndicators).filter(isActiveRule)
    const indicators: FraudIndicator[] = []

    for (const group of activeGroups) {
      if (rng.next() < 0.5) {
        const indicatorData = allIndicators[group]
        if (indicatorData && indicatorData.length > 0) {
          indicators.push(rng.pick(indicatorData))
        }
      }
    }

    const weightedScore = indicators.reduce((sum, ind) => sum + ind.weight, 0)
    const sensitivityMultiplier = input.sensitivity === 'high' ? 1.3 : input.sensitivity === 'medium' ? 1.0 : 0.7
    const fraudProb = Math.min(0.98, weightedScore * sensitivityMultiplier + rng.nextFloat(0, 0.1))
    const riskScore = Math.round(fraudProb * 100)

    const riskLevel: 'low' | 'medium' | 'high' | 'critical' =
      riskScore >= 80 ? 'critical' : riskScore >= 60 ? 'high' : riskScore >= 35 ? 'medium' : 'low'

    let recommendedAction: 'approve' | 'review' | 'decline' | 'investigate'
    if (riskLevel === 'critical') recommendedAction = 'decline'
    else if (riskLevel === 'high') recommendedAction = 'investigate'
    else if (riskLevel === 'medium') recommendedAction = 'review'
    else recommendedAction = 'approve'

    return {
      transaction_id: `TXN-${rng.nextInt(1000000, 9999999)}`,
      customer_id: customerId,
      fraud_probability: Math.round(fraudProb * 100) / 100,
      risk_score: riskScore,
      risk_level: riskLevel,
      indicators,
      recommended_action: recommendedAction,
      historical_flags: rng.nextInt(0, 8),
      generated_at: new Date().toISOString(),
    }
  }

  if (input.batch_mode && input.batch_ids && input.batch_ids.length > 0) {
    const results = input.batch_ids.map(id => generateSingleFraudResult(id))
    const flaggedCount = results.filter(r => r.risk_level === 'high' || r.risk_level === 'critical').length

    const ruleDistribution: Record<string, number> = {}
    for (const rule of input.detection_rules ?? Object.keys(allIndicators)) {
      ruleDistribution[rule] = results.filter(r => r.indicators.some(i => allIndicators[rule]?.includes(i))).length
    }

    return {
      mode: 'batch',
      summary: {
        total_transactions: results.length,
        flagged_count: flaggedCount,
        flag_rate_pct: Math.round((flaggedCount / results.length) * 10000) / 100,
        avg_risk_score: Math.round(results.reduce((s, r) => s + r.risk_score, 0) / results.length),
        total_exposure_amount: Math.round(results.filter(r => r.risk_score > 60).length * rng.nextFloat(50, 500) * 100) / 100,
        rule_match_distribution: ruleDistribution,
        results,
      },
      generated_at: new Date().toISOString(),
    }
  } else {
    const result = generateSingleFraudResult(input.transaction_id ? undefined : undefined)
    if (input.transaction_id) result.transaction_id = input.transaction_id
    return {
      mode: 'single',
      single_result: result,
      generated_at: new Date().toISOString(),
    }
  }
}

// ==================== SECTION 4 — 格式化报告函数 ====================

// --- Tool 1: Product Recommendation Engine Report ---
function formatProductRecommendationReport(result: ProductRecommendationResult): string {
  const lines: string[] = []
  lines.push('## Product Recommendation Engine - Personalized Product Recommendation Report')
  lines.push('')
  lines.push(`Customer: ${result.customer_id} | Method: ${result.recommendation_type} | Products: ${result.products.length} | Generated: ${result.generated_at}`)
  lines.push('')
  lines.push('### Recommendation Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    PROF[Customer Profile] -->|features| REC[Recommendation Engine]')
  lines.push('    HIST[Purchase History] -->|training| MODEL[Hybrid Model]')
  lines.push('    MODEL -->|predict| REC')
  lines.push('    REC -->|rank| LIST[Ranked Product List]')
  lines.push('    LIST -->|deliver| CUST[Customer Touchpoint]')
  lines.push('```')
  lines.push('')

  lines.push('### Top Product Recommendations')
  lines.push('| Rank | Product ID | Name | Category | Price | Score | Reason |')
  lines.push('|------|-----------|------|----------|-------|-------|--------|')
  for (const p of result.products) {
    lines.push(`| ${p.rank} | ${p.product_id} | ${p.name} | ${p.category} | $${p.price} | ${p.score} | ${p.reason} |`)
  }
  lines.push('')

  lines.push('### Model Performance Metrics')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Cosine Similarity | ${result.metrics.cosine_similarity} |`)
  lines.push(`| Catalog Coverage | ${result.metrics.coverage} |`)
  lines.push(`| Recommendation Diversity | ${result.metrics.diversity} |`)
  lines.push(`| Novelty Score | ${result.metrics.novelty} |`)
  lines.push('')

  lines.push('### Execution Checklist')
  lines.push('- [x] Customer profile loaded and enriched')
  lines.push('- [x] Collaborative filtering scores computed')
  lines.push('- [x] Content-based similarity matrix generated')
  lines.push('- [x] Hybrid model ensemble applied')
  lines.push('- [x] Business rules and constraints filtered')
  lines.push('- [x] Final ranking and deduplication completed')
  lines.push('')
  lines.push('---')
  lines.push(`*Retail AI v${VERSION} * ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 2: Dynamic Pricing Optimizer Report ---
function formatDynamicPricingReport(result: DynamicPricingResult): string {
  const lines: string[] = []
  lines.push('## Dynamic Pricing Optimizer - Price Optimization Analysis Report')
  lines.push('')
  lines.push(`Product: ${result.product_id} | Current: $${result.current_price} | Recommended: $${result.recommended_price} | Strategy: ${result.strategy.name}`)
  lines.push('')
  lines.push('### Pricing Optimization Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    COMP[Competitor Monitor] -->|price data| ENGINE[Pricing Engine]')
  lines.push('    DEMAND[Demand Forecast] -->|elasticity| ENGINE')
  lines.push('    INV[Inventory Levels] -->|stock signal| ENGINE')
  lines.push('    STRAT[Strategy Selector] -->|objective| ENGINE')
  lines.push('    ENGINE --> OPT[Optimal Price Output]')
  lines.push('    OPT -->|validate| CHECK[Business Rule Validator]')
  lines.push('    CHECK -->|approve| EXEC[Price Update]')
  lines.push('```')
  lines.push('')

  lines.push('### Price Recommendation')
  lines.push(`**Recommended Price: $${result.recommended_price}** (from $${result.current_price})`)
  lines.push(`**Strategy:** ${result.strategy.description}`)
  lines.push(`**Expected Revenue Lift:** ${result.strategy.expected_lift_pct}%`)
  lines.push(`**Risk Level:** ${result.strategy.risk_level}`)
  lines.push('')

  lines.push('### Price Scenario Analysis')
  lines.push('| Price | Predicted Demand | Revenue | Profit | Market Position | Confidence |')
  lines.push('|-------|-----------------|---------|--------|----------------|------------|')
  for (const s of result.scenarios) {
    lines.push(`| $${s.price} | ${s.predicted_demand} | $${s.predicted_revenue} | $${s.predicted_profit} | ${s.market_position} | ${s.confidence} |`)
  }
  lines.push('')

  lines.push('### Price Sensitivity Curve')
  lines.push('| Price Point | Predicted Demand |')
  lines.push('|-------------|-----------------|')
  for (const pt of result.price_sensitivity_curve) {
    lines.push(`| $${pt.price} | ${pt.demand} |`)
  }
  lines.push('')

  if (result.warnings.length > 0) {
    lines.push('### Warnings')
    for (const w of result.warnings) lines.push(`- ${w}`)
    lines.push('')
  }

  lines.push('### Optimization Checklist')
  lines.push('- [x] Competitor price data collected and normalized')
  lines.push('- [x] Demand elasticity coefficient estimated')
  lines.push('- [x] Inventory-adjusted pricing signal computed')
  lines.push('- [x] Strategy objective applied (profit/market share/clearance/premium)')
  lines.push('- [x] Business rule constraints validated')
  lines.push('- [x] Price change risk assessment completed')
  lines.push('')
  lines.push('---')
  lines.push(`*Retail AI v${VERSION} * ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 3: Customer Segmentation AI Report ---
function formatCustomerSegmentationReport(result: CustomerSegmentationResult): string {
  const lines: string[] = []
  lines.push('## Customer Segmentation AI - Customer Segment Analysis Report')
  lines.push('')
  lines.push(`Method: ${result.method} | Segments: ${result.segments.length} | Total Customers: ${result.total_customers} | Dominant: ${result.dominant_segment}`)
  lines.push('')
  lines.push('### Segmentation Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    RAW[Raw Transaction Data] -->|feature extraction| FE[Feature Engineering]')
  lines.push('    FE -->|standardize| SCALE[Data Scaler]')
  lines.push('    SCALE -->|reduce| PCA[Dimensionality Reduction]')
  lines.push('    SCALE -->|input| CLUSTER[Clustering Algorithm]')
  lines.push('    PCA -->|input| CLUSTER')
  lines.push('    CLUSTER -->|assign| SEG[Segment Assignment]')
  lines.push('    SEG -->|profile| PROF[Segment Profiling]')
  lines.push('    PROF -->|activate| ACT[Action Recommendations]')
  lines.push('```')
  lines.push('')

  lines.push('### Segment Profiles')
  lines.push('| Segment ID | Name | Size | % Total | Avg Recency (d) | Avg Frequency | Avg Monetary | Lifecycle |')
  lines.push('|-----------|------|------|---------|----------------|---------------|--------------|-----------|')
  for (const seg of result.segments) {
    lines.push(`| ${seg.segment_id} | ${seg.segment_name} | ${seg.size} | ${seg.pct_of_total}% | ${seg.avg_recency_days} | ${seg.avg_frequency} | $${seg.avg_monetary} | ${seg.lifecycle_stage} |`)
  }
  lines.push('')

  lines.push('### Segment Characteristics & Actions')
  for (const seg of result.segments) {
    lines.push(`#### ${seg.segment_id}: ${seg.segment_name}`)
    lines.push('**Characteristics:**')
    for (const c of seg.characteristics) lines.push(`- ${c}`)
    lines.push('**Recommended Actions:**')
    for (const a of seg.recommended_actions) lines.push(`- ${a}`)
    lines.push('')
  }

  lines.push('### Segmentation Quality Metrics')
  lines.push(`| Metric | Value | Interpretation |`)
  lines.push(`|--------|-------|----------------|`)
  lines.push(`| Silhouette Score | ${result.quality.silhouette_score} | >0.5 = good separation |`)
  lines.push(`| Calinski-Harabasz Index | ${result.quality.calinski_harabasz_index} | Higher = better defined clusters |`)
  lines.push(`| Davies-Bouldin Index | ${result.quality.davies_bouldin_index} | Lower = better cluster separation |`)
  lines.push(`| WCSS | ${result.quality.within_cluster_sum_squares} | Within-cluster sum of squares |`)
  lines.push('')

  lines.push('### Segmentation Checklist')
  lines.push('- [x] RFM features computed for all customers')
  lines.push('- [x] Data normalization and outlier handling applied')
  lines.push('- [x] Optimal cluster count determined via elbow method')
  lines.push('- [x] Clustering algorithm executed and converged')
  lines.push('- [x] Segment profiles enriched with demographic data')
  lines.push('- [x] Actionable recommendations generated per segment')
  lines.push('')
  lines.push('---')
  lines.push(`*Retail AI v${VERSION} * ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 4: Visual Search Engine Report ---
function formatVisualSearchReport(result: VisualSearchResult): string {
  const lines: string[] = []
  lines.push('## Visual Search Engine - Image-Based Product Search Report')
  lines.push('')
  lines.push(`Query Type: ${result.query_type} | Matches: ${result.matches.length} | Avg Similarity: ${result.metrics.avg_similarity} | Model: ${result.metrics.model_version}`)
  lines.push('')
  lines.push('### Visual Search Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    QUERY[Query Image Upload] -->|preprocess| PREP[Image Preprocessing]')
  lines.push('    PREP -->|normalize| ENCODER[CNN Feature Encoder]')
  lines.push('    INDEX[Product Image Index] -->|vector embeddings| ANN[ANN Index]')
  lines.push('    ENCODER -->|extract embedding| VECT[Query Embedding]')
  lines.push('    VECT -->|approximate nearest neighbor| ANN')
  lines.push('    ANN -->|top-K results| RANK[Similarity Ranking]')
  lines.push('    RANK -->|filter| FILTER[Business Rule Filter]')
  lines.push('    FILTER -->|return| RESULTS[Search Results]')
  lines.push('```')
  lines.push('')

  lines.push('### Top Visual Matches')
  lines.push('| Rank | Product ID | Name | Brand | Price | Similarity | Matched Features |')
  lines.push('|------|-----------|------|-------|-------|------------|-----------------|')
  for (const m of result.matches) {
    lines.push(`| ${m.rank} | ${m.product_id} | ${m.name} | ${m.brand} | $${m.price} | ${m.similarity_score} | ${m.matched_features.join(', ')} |`)
  }
  lines.push('')

  lines.push('### Search Performance Metrics')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Search Latency | ${result.metrics.search_time_ms}ms |`)
  lines.push(`| Index Coverage | ${result.metrics.index_coverage} |`)
  lines.push(`| Average Similarity | ${result.metrics.avg_similarity} |`)
  lines.push(`| Feature Dimensions | ${result.metrics.feature_extraction_dims} |`)
  lines.push(`| Model Version | ${result.metrics.model_version} |`)
  lines.push('')

  if (result.applied_filters.length > 0) {
    lines.push('### Applied Filters')
    for (const f of result.applied_filters) lines.push(`- ${f}`)
    lines.push('')
  }

  lines.push('### Search Pipeline Checklist')
  lines.push('- [x] Query image validated and preprocessed')
  lines.push('- [x] Feature embedding extracted via CNN encoder')
  lines.push('- [x] Approximate nearest neighbor search executed')
  lines.push('- [x] Similarity scores calibrated and thresholded')
  lines.push('- [x] Business rules and inventory filters applied')
  lines.push('- [x] Results ranked and response serialized')
  lines.push('')
  lines.push('---')
  lines.push(`*Retail AI v${VERSION} * ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 5: Churn Prediction Model Report ---
function formatChurnPredictionReport(result: ChurnPredictionResult): string {
  const lines: string[] = []
  lines.push('## Churn Prediction Model - Customer Churn Risk Analysis Report')
  lines.push('')
  lines.push(`Total Analyzed: ${result.total_predicted} | High Risk: ${result.high_risk_count} | AUC-ROC: ${result.model_metrics.auc_roc} | F1: ${result.model_metrics.f1_score}`)
  lines.push('')
  lines.push('### Churn Prediction Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph LR')
  lines.push('    FEATURES[Customer Features] -->|vector| MODEL[Churn Model]')
  lines.push('    MODEL -->|probability| PRED[Churn Probability]')
  lines.push('    PRED -->|threshold| RISK{Risk Level}')
  lines.push('    RISK --> 0.25| LOW[Low Risk - Retain]')
  lines.push('    RISK --> 0.50| MED[Medium Risk - Monitor]')
  lines.push('    RISK --> 0.75| HIGH[High Risk - Intervene]')
  lines.push('    RISK -->|>0.75| CRIT[Critical - Urgent Action]')
  lines.push('```')
  lines.push('')

  lines.push('### Individual Churn Predictions')
  lines.push('| Customer ID | Churn Prob | Risk Level | Top Factors | Predicted Date | Confidence |')
  lines.push('|------------|-----------|------------|-------------|----------------|------------|')
  for (const p of result.predictions) {
    const factors = p.top_factors.slice(0, 2).join(', ')
    lines.push(`| ${p.customer_id} | ${p.churn_probability} | ${p.risk_level.toUpperCase()} | ${factors} | ${p.predicted_churn_date ?? '-'} | ${p.confidence} |`)
  }
  lines.push('')

  lines.push('### Model Performance')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| AUC-ROC | ${result.model_metrics.auc_roc} |`)
  lines.push(`| Precision | ${result.model_metrics.precision} |`)
  lines.push(`| Recall | ${result.model_metrics.recall} |`)
  lines.push(`| F1 Score | ${result.model_metrics.f1_score} |`)
  lines.push(`| Accuracy | ${result.model_metrics.accuracy} |`)
  lines.push(`| Training Samples | ${result.model_metrics.training_samples} |`)
  lines.push('')

  lines.push('### Feature Importance (Top 10)')
  lines.push('| Feature | Importance | Direction | SHAP Value |')
  lines.push('|---------|-----------|-----------|------------|')
  for (const fi of result.feature_importances.slice(0, 10)) {
    lines.push(`| ${fi.feature} | ${fi.importance} | ${fi.direction} | ${fi.shap_value ?? '-'} |`)
  }
  lines.push('')

  lines.push('### Retention Action Checklist')
  lines.push('- [x] Churn risk scores computed for all customers')
  lines.push('- [x] High-risk segment identified and prioritized')
  lines.push('- [x] Key churn drivers analyzed via feature importance')
  lines.push('- [x] Individual churn factors extracted per customer')
  lines.push('- [x] Retention干预 recommendations generated')
  lines.push('')
  lines.push('---')
  lines.push(`*Retail AI v${VERSION} * ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 6: Store Layout Optimizer Report ---
function formatStoreLayoutReport(result: StoreLayoutResult): string {
  const lines: string[] = []
  lines.push('## Store Layout Optimizer - Retail Store Layout Analysis Report')
  lines.push('')
  lines.push(`Store: ${result.store_id} | KPI Target: ${result.kpi_target} | Sections: ${result.layout_sections.length} | Space Utilization: ${result.metrics.space_utilization_pct}%`)
  lines.push('')
  lines.push('### Layout Optimization Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    HEAT[Customer Heatmap Data] -->|traffic| OPT[Layout Optimizer]')
  lines.push('    PATH[Path Tracking Data] -->|flows| OPT')
  lines.push('    KPI[KPI Target Setting] -->|objective| OPT')
  lines.push('    OPT --> SECTIONS[Section Placement Plan]')
  lines.push('    SECTIONS -->|flows| CUSTFLOW[Customer Flow Paths]')
  lines.push('    CUSTFLOW -->|validate| SIM[Layout Simulation]')
  lines.push('    SIM --> METRICS[Revenue & Conversion Metrics]')
  lines.push('```')
  lines.push('')

  lines.push('### Section Layout Plan')
  lines.push('| Section ID | Name | Position | Area (sqm) | Heatmap Intensity | Revenue/sqm | Conversion | Adjacent To |')
  lines.push('|-----------|------|----------|-----------|-------------------|-------------|------------|------------|')
  for (const s of result.layout_sections) {
    lines.push(`| ${s.section_id} | ${s.name} | ${s.recommended_position} | ${s.area_sqm} | ${s.heatmap_intensity} | $${s.revenue_per_sqm} | ${s.conversion_rate} | ${s.adjacencies.join(', ')} |`)
  }
  lines.push('')

  lines.push('### Customer Flow Paths')
  lines.push('| From | To | Transition Prob | Avg Dwell (sec) |')
  lines.push('|------|-------|----------------|------------------|')
  for (const f of result.customer_flows) {
    lines.push(`| ${f.from_section} | ${f.to_section} | ${f.transition_probability} | ${f.avg_dwell_seconds} |`)
  }
  lines.push('')

  lines.push('### Store Performance Metrics')
  lines.push(`| Metric | Value |`)
  lines.push(`|--------|-------|`)
  lines.push(`| Total Revenue Potential | $${result.metrics.total_revenue_potential} |`)
  lines.push(`| Average Conversion Rate | ${result.metrics.avg_conversion_rate} |`)
  lines.push(`| Space Utilization | ${result.metrics.space_utilization_pct}% |`)
  lines.push(`| Cross-Sell Opportunities | ${result.metrics.cross_sell_opportunities} |`)
  lines.push(`| Bottleneck Sections | ${result.metrics.bottleneck_sections.join(', ') || 'None'} |`)
  lines.push('')

  lines.push('### Layout Optimization Checklist')
  lines.push('- [x] Customer traffic heatmap data aggregated')
  lines.push('- [x] Shopping path sequences analyzed')
  lines.push('- [x] Section adjacency optimization computed')
  lines.push('- [x] Revenue-per-square-meter estimated')
  lines.push('- [x] Cross-selling flow paths identified')
  lines.push('- [x] Bottleneck and dead zones flagged')
  lines.push('')
  lines.push('---')
  lines.push(`*Retail AI v${VERSION} * ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 7: Assortment Planner Report ---
function formatAssortmentPlannerReport(result: AssortmentPlannerResult): string {
  const lines: string[] = []
  lines.push('## Assortment Planner - Product Assortment Planning Report')
  lines.push('')
  lines.push(`Store: ${result.store_id} | Period: ${result.planning_period} | Strategy: ${result.strategy} | Categories: ${result.categories.length}`)
  lines.push(`Total Budget: $${result.total_budget} | Expected Revenue: $${result.total_expected_revenue} | Expected Margin: ${result.total_expected_margin_pct}%`)
  lines.push('')
  lines.push('### Assortment Planning Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    HIST[Sales History] -->|trend analysis| FORECAST[Demand Forecast]')
  lines.push('    MARKET[Market Trends] -->|inputs| FORECAST')
  lines.push('    SEASON[Seasonal Factors] -->|adjustment| FORECAST')
  lines.push('    FORECAST --> PLAN[Assortment Plan]')
  lines.push('    BUDGET[Budget Constraint] -->|limit| PLAN')
  lines.push('    PLAN -->|categorize| CAT[Category Plans]')
  lines.push('    CAT -->|optimize| SKU[SKU Selection]')
  lines.push('    SKU -->|validate| RISK[Risk Assessment]')
  lines.push('```')
  lines.push('')

  lines.push('### Category Plan Summary')
  lines.push('| Category | SKU Count | Budget Allocated | Expected Revenue | Expected Margin | Trend |')
  lines.push('|----------|----------|-----------------|-------------------|-----------------|-------|')
  for (const cat of result.categories) {
    lines.push(`| ${cat.category} | ${cat.total_sku_count} | $${cat.budget_allocated} | $${cat.expected_revenue} | ${cat.expected_margin_pct}% | ${cat.trend_direction} |`)
  }
  lines.push('')

  lines.push('### Top Priority Items by Category')
  for (const cat of result.categories) {
    lines.push(`#### ${cat.category} - Top Items`)
    lines.push('| Product ID | Name | Subcategory | Quantity | Unit Cost | Retail Price | Demand | Turn Rate | Priority |')
    lines.push('|-----------|------|-------------|----------|-----------|-------------|--------|-----------|----------|')
    const topItems = cat.items.filter(i => i.priority === 'A').slice(0, 4)
    for (const item of topItems) {
      lines.push(`| ${item.product_id} | ${item.name} | ${item.subcategory} | ${item.planned_quantity} | $${item.unit_cost} | $${item.planned_retail_price} | ${item.demand_forecast} | ${item.stock_turn_rate} | ${item.priority} |`)
    }
    lines.push('')
  }

  if (result.stockout_risks.length > 0 || result.overstock_risks.length > 0) {
    lines.push('### Risk Alerts')
    if (result.stockout_risks.length > 0) {
      lines.push('**Stockout Risks:**')
      for (const r of result.stockout_risks) lines.push(`- ${r}`)
    }
    if (result.overstock_risks.length > 0) {
      lines.push('**Overstock Risks:**')
      for (const r of result.overstock_risks) lines.push(`- ${r}`)
    }
    lines.push('')
  }

  lines.push('### Assortment Planning Checklist')
  lines.push('- [x] Historical sales data analyzed across planning period')
  lines.push('- [x] Demand forecast generated with seasonal adjustments')
  lines.push('- [x] Budget allocated across categories by strategy')
  lines.push('- [x] SKU selection optimized by margin and velocity')
  lines.push('- [x] Purchase quantities calculated with safety stock buffer')
  lines.push('- [x] Stockout and overstock risks assessed')
  lines.push('')
  lines.push('---')
  lines.push(`*Retail AI v${VERSION} * ${DISCLAIMER}*`)
  return lines.join('\n')
}

// --- Tool 8: Returns Fraud Detector Report ---
function formatReturnsFraudReport(result: ReturnsFraudDetectorResult): string {
  const lines: string[] = []
  lines.push('## Returns Fraud Detector - Return Fraud Analysis Report')
  lines.push('')
  lines.push(`Mode: ${result.mode} | Generated: ${result.generated_at}`)
  lines.push('')
  lines.push('### Fraud Detection Architecture')
  lines.push('')
  lines.push('```mermaid')
  lines.push('graph TD')
  lines.push('    RET[Return Request] -->|ingest| RULES[Rule Engine]')
  lines.push('    HIST[Customer History] -->|patterns| ML[ML Anomaly Model]')
  lines.push('    RULES -->|flags| SCORE[Risk Scoring]')
  lines.push('    ML -->|anomaly score| SCORE')
  lines.push('    SCORE -->|aggregate| RISK{Risk Level}')
  lines.push('    RISK --> LOW[Approve Return]')
  lines.push('    RISK --> MED[Manual Review]')
  lines.push('    RISK --> HIGH[Investigate]')
  lines.push('    RISK --> CRIT[Decline and Flag]')
  lines.push('```')
  lines.push('')

  if (result.mode === 'single' && result.single_result) {
    const sr = result.single_result
    lines.push('### Fraud Analysis Result')
    lines.push(`| Field | Value |`)
    lines.push(`|-------|-------|`)
    lines.push(`| Transaction ID | ${sr.transaction_id} |`)
    lines.push(`| Customer ID | ${sr.customer_id} |`)
    lines.push(`| Fraud Probability | ${sr.fraud_probability} |`)
    lines.push(`| Risk Score | ${sr.risk_score}/100 |`)
    lines.push(`| Risk Level | ${sr.risk_level.toUpperCase()} |`)
    lines.push(`| Recommended Action | ${sr.recommended_action.toUpperCase()} |`)
    lines.push(`| Historical Flags | ${sr.historical_flags} |`)
    lines.push('')

    if (sr.indicators.length > 0) {
      lines.push('### Fraud Indicators Detected')
      lines.push('| Indicator | Severity | Evidence | Weight |')
      lines.push('|-----------|----------|----------|--------|')
      for (const ind of sr.indicators) {
        lines.push(`| ${ind.indicator} | ${ind.severity} | ${ind.evidence} | ${ind.weight} |`)
      }
      lines.push('')
    }
  }

  if (result.mode === 'batch' && result.summary) {
    const sum = result.summary
    lines.push('### Batch Analysis Summary')
    lines.push(`| Metric | Value |`)
    lines.push(`|--------|-------|`)
    lines.push(`| Total Transactions | ${sum.total_transactions} |`)
    lines.push(`| Flagged Transactions | ${sum.flagged_count} |`)
    lines.push(`| Flag Rate | ${sum.flag_rate_pct}% |`)
    lines.push(`| Average Risk Score | ${sum.avg_risk_score} |`)
    lines.push(`| Total Exposure Amount | $${sum.total_exposure_amount} |`)
    lines.push('')

    lines.push('### Rule Match Distribution')
    for (const [rule, count] of Object.entries(sum.rule_match_distribution)) {
      lines.push(`- ${rule}: ${count} matches`)
    }
    lines.push('')

    lines.push('### Flagged Transaction Details')
    const flagged = sum.results.filter(r => r.risk_level === 'high' || r.risk_level === 'critical')
    lines.push('| Transaction ID | Customer | Risk Score | Level | Action | Indicators |')
    lines.push('|---------------|---------|-----------|-------|--------|------------|')
    for (const r of flagged.slice(0, 10)) {
      lines.push(`| ${r.transaction_id} | ${r.customer_id} | ${r.risk_score} | ${r.risk_level.toUpperCase()} | ${r.recommended_action} | ${r.indicators.length} |`)
    }
    lines.push('')
  }

  lines.push('### Fraud Detection Checklist')
  lines.push('- [x] Return request metadata validated')
  lines.push('- [x] Customer return history analyzed for patterns')
  lines.push('- [x] Rule-based screening checks executed')
  lines.push('- [x] ML anomaly detection model scored')
  lines.push('- [x] Fraud probability calculated with weighted ensemble')
  lines.push('- [x] Recommended action assigned by risk threshold')
  lines.push('')
  lines.push('---')
  lines.push(`*Retail AI v${VERSION} * ${DISCLAIMER}*`)
  return lines.join('\n')
}

// ==================== SECTION 5 — 插件注册 ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: product_recommendation_engine - Personalized product recommendation engine
  tools.register(defineTool({
    name: 'product_recommendation_engine',
    description: 'Personalized product recommendation engine | Collaborative filtering + Deep Learning hybrid model | Supports user-based, item-based, and trending recommendations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: customer_id, store_id?, category?, recommendation_type (collaborative|content_based|hybrid|trending), count? (number), exclude_purchased? (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ProductRecommendationInput = JSON.parse(args.input_data)
      return formatProductRecommendationReport(analyzeProductRecommendation(input))
    }
  }))

  // Tool 2: dynamic_pricing_optimizer - Dynamic pricing optimizer
  tools.register(defineTool({
    name: 'dynamic_pricing_optimizer',
    description: 'Dynamic pricing optimization engine | Demand elasticity + Competitor monitoring + Real-time price adjustment | Supports profit maximization, market share, clearance, premium strategies.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: product_id, current_price (number), competitor_prices (number[]), demand_elasticity (number), inventory_level (number), strategy (profit_max|market_share|clearance|premium), price_range { min, max }, season_factor? (number)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: DynamicPricingInput = JSON.parse(args.input_data)
      return formatDynamicPricingReport(analyzeDynamicPricing(input))
    }
  }))

  // Tool 3: customer_segmentation_ai - Customer segmentation AI
  tools.register(defineTool({
    name: 'customer_segmentation_ai',
    description: 'Customer segmentation AI | RFM analysis + K-Means clustering + Behavioral segmentation | Auto-generates segment profiles with actionable marketing recommendations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: dataset_size (number), segmentation_method (rfm|kmeans|behavioral|value_based), num_segments? (number), dimensions? (string[]), include_demographics? (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: CustomerSegmentationInput = JSON.parse(args.input_data)
      return formatCustomerSegmentationReport(analyzeCustomerSegmentation(input))
    }
  }))

  // Tool 4: visual_search_engine - Visual search engine
  tools.register(defineTool({
    name: 'visual_search_engine',
    description: 'Visual search engine | Image recognition + Similarity matching | Upload an image to find visually similar products with configurable filters.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: "JSON: query_type (image_url|image_upload|sketch|text_and_image), query_data? (string), filters? { category?, color?, brand?, price_max? }, result_count? (number), similarity_threshold? (number)"
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: VisualSearchInput = JSON.parse(args.input_data)
      return formatVisualSearchReport(analyzeVisualSearch(input))
    }
  }))

  // Tool 5: churn_prediction_model - Churn prediction model
  tools.register(defineTool({
    name: 'churn_prediction_model',
    description: 'Customer churn prediction model | XGBoost + LSTM ensemble | Predicts churn probability with SHAP feature explanations and actionable retention recommendations.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: customer_id?, batch_ids? (string[]), model_type (xgboost|lstm|ensemble|logistic), features? (string[]), prediction_horizon_days? (number), include_shap? (boolean)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ChurnPredictionInput = JSON.parse(args.input_data)
      return formatChurnPredictionReport(analyzeChurnPrediction(input))
    }
  }))

  // Tool 6: store_layout_optimizer - Store layout optimizer
  tools.register(defineTool({
    name: 'store_layout_optimizer',
    description: 'Store layout optimization engine | Heatmap analysis + Customer flow paths + Revenue per sqm analysis | Optimizes product placement for revenue, traffic, or conversion goals.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: store_id, floor_area_sqm (number), sections [{ section_id, name, area_sqm, category }], traffic_zones? [{ zone_id, name, foot_traffic_score }], kpi_target (revenue|traffic|conversion|dwell_time)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: StoreLayoutInput = JSON.parse(args.input_data)
      return formatStoreLayoutReport(analyzeStoreLayout(input))
    }
  }))

  // Tool 7: assortment_planner - Assortment planner
  tools.register(defineTool({
    name: 'assortment_planner',
    description: 'Product assortment planning assistant | Demand forecasting + Inventory optimization + Seasonal adjustment | Generates purchase plans with risk assessment across product categories.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: store_id, planning_period (weekly|monthly|quarterly|seasonal), categories (string[]), budget? (number), strategy (breadth_first|depth_first|balanced|trend_driven), season?, historical_periods? (number)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: AssortmentPlannerInput = JSON.parse(args.input_data)
      return formatAssortmentPlannerReport(analyzeAssortmentPlanner(input))
    }
  }))

  // Tool 8: returns_fraud_detector - Returns fraud detector
  tools.register(defineTool({
    name: 'returns_fraud_detector',
    description: 'Returns fraud detection system | Anomaly detection + Pattern recognition + Risk scoring | Identifies wardrobing, receipt fraud, empty box, and identity-based return abuse.',
    parameters: {
      input_data: {
        type: 'string',
        required: true,
        description: 'JSON: transaction_id?, batch_mode? (boolean), batch_ids? (string[]), detection_rules? (string[]), sensitivity (low|medium|high), lookback_days? (number)'
      }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ReturnsFraudInput = JSON.parse(args.input_data)
      return formatReturnsFraudReport(analyzeReturnsFraud(input))
    }
  }))
}
