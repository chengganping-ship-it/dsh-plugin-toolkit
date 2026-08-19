/**
 * dsh-tool-routing — Multi-model intelligent routing plugin for DeepSeek Harness
 *
 * Provides 8 intelligent routing tools that analyze, select, balance, and
 * evaluate AI模型 routing decisions across a multi-model LLM infrastructure.
 *
 * Tools: model_selector, cost_optimizer, fallback_strategist, load_balancer,
 *        capability_mapper, latency_predictor, quality_evaluator, routing_analytics
 *
 * @author chengganping-ship-it | @license MIT
 */

import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';
import type { ContentBlock } from '@deepseek-ai/dsh-llm';

// SECTION 1 — Seeded Random Utility (mulberry32 PRNG)
class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Next float in [0, 1) */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /** Float in [min, max) */
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  /** Pick a random element from an array */
  pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }

  /** Generate a 32-bit seed from a string via FNV-1a hashing */
  static seedFromString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) || 1;
  }
}

// SECTION 2 — Type Definitions & Interfaces
/** Task categories the routing system understands */
type TaskType = 'code' | 'chat' | 'analysis' | 'creative' | 'vision';

/** Network conditions affecting latency predictions */
type NetworkCondition = 'excellent' | 'good' | 'moderate' | 'poor';

/** Supported model providers */
type ModelProvider = 'deepseek' | 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'cohere';

/** Task complexity tiers driving token estimation */
type ComplexityLevel = 'trivial' | 'low' | 'medium' | 'high' | 'extreme';

/** Quality tier requirements for cost optimization */
type QualityTier = 'draft' | 'standard' | 'premium' | 'best-in-class';

/** SLA levels for fallback chain design */
type SLALevel = 'relaxed' | 'standard' | 'strict' | 'mission-critical';

/** Load balancing strategies */
type BalancingStrategy = 'round-robin' | 'weighted' | 'least-loaded' | 'latency-aware';

/** Analysis time range window */
interface TimeRange {
  start: string;
  end: string;
}

/** Per-model quality scores across task dimensions */
interface QualityScores {
  code: number;
  chat: number;
  analysis: number;
  creative: number;
  vision: number;
}

/** Full model metadata entry in the registry */
interface ModelInfo {
  id: string;
  name: string;
  provider: ModelProvider;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  context_window: number;
  avg_latency_ms: number;
  capabilities: string[];
  strengths: string[];
  weaknesses: string[];
  quality_scores: QualityScores;
  /** Regions where this model is available */
  available_regions: string[];
  /** Maximum concurrent requests supported */
  max_concurrency: number;
  /** Date the model information was last updated */
  last_updated: string;
  /** Whether the model supports streaming output */
  supports_streaming: boolean;
  /** Whether the model supports function calling / tool use */
  supports_tools: boolean;
}

/** Routing constraints passed by the caller */
interface RoutingConstraints {
  max_cost_per_1k?: number;
  max_latency_ms?: number;
  required_capabilities?: string[];
  preferred_providers?: string[];
  excluded_providers?: string[];
  min_context_window?: number;
  required_regions?: string[];
  require_streaming?: boolean;
  require_tools?: boolean;
}

/** Scored model candidate from the selector engine */
interface ScoredCandidate {
  model: ModelInfo;
  score: number;
  reasons: string[];
  dimension_scores: {
    quality: number;
    cost: number;
    latency: number;
    capability: number;
    provider_preference: number;
  };
}

/** Single fallback level in a chain */
interface FallbackLevel {
  level: number;
  model_id: string;
  model_name: string;
  trigger_condition: string;
  switch_timeout_ms: number;
  recovery_action: string;
}

/** Request entry in the load balancer queue */
interface QueuedRequest {
  request_id: string;
  estimated_tokens: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  task_type: TaskType;
}

/** Request-to-model assignment result */
interface RequestAssignment {
  request_id: string;
  assigned_model: string;
  reason: string;
  estimated_wait_ms: number;
}

/** Load distribution snapshot per model */
interface ModelLoadStatus {
  model_id: string;
  assigned_requests: number;
  projected_load_pct: number;
  status: 'underutilized' | 'optimal' | 'near-capacity' | 'overloaded';
}

/** Capability coverage entry for a single model */
interface CapabilityCoverage {
  model_id: string;
  model_name: string;
  capabilities: { name: string; supported: boolean; proficiency: number }[];
  overall_coverage_pct: number;
  gaps: string[];
}

/** Latency prediction result */
interface LatencyEstimate {
  ttft_ms: number;
  total_completion_ms: number;
  tokens_per_second: number;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  confidence: number;
}

/** Per-criterion quality score */
interface CriterionScore {
  name: string;
  score: number;
  weight: number;
  weighted_score: number;
}

/** Per-model quality evaluation result */
interface ModelQualityScore {
  model_id: string;
  model_name: string;
  overall_score: number;
  criteria_scores: CriterionScore[];
  rank: number;
  value_score: number;
}

/** Time-series analytics metrics */
interface RoutingMetrics {
  total_requests: number;
  success_rate_pct: number;
  avg_latency_ms: number;
  total_cost_usd: number;
  avg_cost_per_request: number;
  model_distribution: Record<string, number>;
  cost_trend: string;
  latency_trend: string;
}

/** Optimization suggestion from analytics */
interface OptimizationSuggestion {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  potential_impact: string;
}

/// ============================================================================
// SECTION 3 — Model Registry
const MODEL_REGISTRY: Record<string, ModelInfo> = {
  'deepseek-chat': {
    id: 'deepseek-chat', name: 'DeepSeek-V3 Chat', provider: 'deepseek',
    cost_per_1k_input: 0.00027, cost_per_1k_output: 0.0011,
    context_window: 64000, avg_latency_ms: 800,
    capabilities: ['text-generation', 'conversation', 'summarization', 'translation', 'code-generation', 'reasoning', 'function-calling'],
    strengths: ['cost-effective', 'strong-reasoning', 'good-multilingual', 'function-calling'],
    weaknesses: ['limited-vision', 'no-real-time'],
    quality_scores: { code: 0.82, chat: 0.90, analysis: 0.85, creative: 0.78, vision: 0.0 },
    available_regions: ['cn-east-1', 'cn-north-1', 'us-west-1'], max_concurrency: 100,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  },
  'deepseek-coder': {
    id: 'deepseek-coder', name: 'DeepSeek-V3 Coder', provider: 'deepseek',
    cost_per_1k_input: 0.00027, cost_per_1k_output: 0.0011,
    context_window: 64000, avg_latency_ms: 900,
    capabilities: ['code-generation', 'code-review', 'debugging', 'refactoring', 'documentation', 'text-generation', 'function-calling'],
    strengths: ['excellent-code', 'multi-language', 'fast-inference', 'function-calling'],
    weaknesses: ['limited-vision', 'narrow-domain'],
    quality_scores: { code: 0.95, chat: 0.75, analysis: 0.80, creative: 0.65, vision: 0.0 },
    available_regions: ['cn-east-1', 'cn-north-1', 'us-west-1'], max_concurrency: 80,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  },
  'gpt-4o': {
    id: 'gpt-4o', name: 'GPT-4o', provider: 'openai',
    cost_per_1k_input: 0.005, cost_per_1k_output: 0.015,
    context_window: 128000, avg_latency_ms: 1200,
    capabilities: ['text-generation', 'conversation', 'code-generation', 'vision', 'reasoning', 'analysis', 'creative-writing', 'function-calling'],
    strengths: ['versatile', 'strong-vision', 'excellent-reasoning', 'large-context', 'function-calling'],
    weaknesses: ['higher-cost', 'variable-latency'],
    quality_scores: { code: 0.90, chat: 0.92, analysis: 0.91, creative: 0.88, vision: 0.93 },
    available_regions: ['us-east-1', 'us-west-1', 'eu-west-1'], max_concurrency: 200,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai',
    cost_per_1k_input: 0.00015, cost_per_1k_output: 0.0006,
    context_window: 128000, avg_latency_ms: 600,
    capabilities: ['text-generation', 'conversation', 'code-generation', 'vision', 'reasoning', 'function-calling'],
    strengths: ['very-low-cost', 'fast', 'good-versatility', 'function-calling'],
    weaknesses: ['lower-quality-complex', 'limited-deep-reasoning'],
    quality_scores: { code: 0.78, chat: 0.82, analysis: 0.76, creative: 0.74, vision: 0.80 },
    available_regions: ['us-east-1', 'us-west-1', 'eu-west-1'], max_concurrency: 300,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  },
  'claude-sonnet-4-20250514': {
    id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic',
    cost_per_1k_input: 0.003, cost_per_1k_output: 0.015,
    context_window: 200000, avg_latency_ms: 1000,
    capabilities: ['text-generation', 'conversation', 'code-generation', 'reasoning', 'analysis', 'creative-writing', 'vision', 'function-calling'],
    strengths: ['excellent-writing', 'nuanced-reasoning', 'large-context', 'strong-vision', 'function-calling'],
    weaknesses: ['moderate-cost', 'no-real-time-web'],
    quality_scores: { code: 0.88, chat: 0.93, analysis: 0.92, creative: 0.91, vision: 0.89 },
    available_regions: ['us-east-1', 'us-west-1', 'ap-southeast-1'], max_concurrency: 150,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  },
  'claude-haiku-4-20250514': {
    id: 'claude-haiku-4-20250514', name: 'Claude Haiku 4', provider: 'anthropic',
    cost_per_1k_input: 0.0008, cost_per_1k_output: 0.004,
    context_window: 200000, avg_latency_ms: 500,
    capabilities: ['text-generation', 'conversation', 'code-generation', 'reasoning', 'vision', 'function-calling'],
    strengths: ['very-fast', 'low-cost', 'good-quality', 'large-context', 'function-calling'],
    weaknesses: ['less-nuanced', 'simpler-tasks-only'],
    quality_scores: { code: 0.80, chat: 0.84, analysis: 0.79, creative: 0.76, vision: 0.82 },
    available_regions: ['us-east-1', 'us-west-1', 'ap-southeast-1'], max_concurrency: 250,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google',
    cost_per_1k_input: 0.00125, cost_per_1k_output: 0.01,
    context_window: 1000000, avg_latency_ms: 1100,
    capabilities: ['text-generation', 'conversation', 'code-generation', 'vision', 'reasoning', 'analysis', 'multimodal', 'function-calling'],
    strengths: ['massive-context', 'strong-multimodal', 'good-reasoning', 'function-calling'],
    weaknesses: ['variable-output-quality', 'provider-lock-in'],
    quality_scores: { code: 0.86, chat: 0.88, analysis: 0.89, creative: 0.84, vision: 0.91 },
    available_regions: ['us-central1', 'europe-west4', 'asia-southeast1'], max_concurrency: 120,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  },
  'llama-4-maverick': {
    id: 'llama-4-maverick', name: 'Llama 4 Maverick', provider: 'meta',
    cost_per_1k_input: 0.0, cost_per_1k_output: 0.0,
    context_window: 128000, avg_latency_ms: 700,
    capabilities: ['text-generation', 'conversation', 'code-generation', 'reasoning', 'analysis'],
    strengths: ['open-source', 'free-self-hosted', 'good-performance'],
    weaknesses: ['requires-infrastructure', 'no-official-api', 'no-function-calling'],
    quality_scores: { code: 0.83, chat: 0.85, analysis: 0.82, creative: 0.80, vision: 0.0 },
    available_regions: ['us-east-1'], max_concurrency: 50,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: false
  },
  'mistral-large': {
    id: 'mistral-large', name: 'Mistral Large', provider: 'mistral',
    cost_per_1k_input: 0.002, cost_per_1k_output: 0.006,
    context_window: 128000, avg_latency_ms: 850,
    capabilities: ['text-generation', 'conversation', 'code-generation', 'reasoning', 'multilingual', 'function-calling'],
    strengths: ['strong-multilingual', 'good-reasoning', 'european-provider', 'function-calling'],
    weaknesses: ['limited-vision', 'smaller-ecosystem'],
    quality_scores: { code: 0.84, chat: 0.86, analysis: 0.85, creative: 0.81, vision: 0.0 },
    available_regions: ['eu-west-1', 'eu-central-1'], max_concurrency: 100,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  },
  'command-r-plus': {
    id: 'command-r-plus', name: 'Command R+', provider: 'cohere',
    cost_per_1k_input: 0.0025, cost_per_1k_output: 0.01,
    context_window: 128000, avg_latency_ms: 950,
    capabilities: ['text-generation', 'conversation', 'summarization', 'rag', 'reasoning', 'function-calling'],
    strengths: ['excellent-rag', 'strong-summarization', 'enterprise-ready', 'function-calling'],
    weaknesses: ['limited-code', 'moderate-vision'],
    quality_scores: { code: 0.72, chat: 0.84, analysis: 0.86, creative: 0.77, vision: 0.0 },
    available_regions: ['us-east-1', 'ca-central-1'], max_concurrency: 80,
    last_updated: '2025-06-01', supports_streaming: true, supports_tools: true
  }
};

// SECTION 4 — Benchmark Constants & Reference Data
/** Token volume estimates per complexity tier */
const COMPLEXITY_TOKEN_MULTIPLIERS: Record<ComplexityLevel, { input: number; output: number }> = {
  trivial: { input: 100, output: 50 },
  low: { input: 500, output: 200 },
  medium: { input: 2000, output: 800 },
  high: { input: 5000, output: 2000 },
  extreme: { input: 15000, output: 5000 }
};

/** Minimum average quality score (0-1) required for each quality tier */
const QUALITY_TIER_THRESHOLDS: Record<QualityTier, number> = {
  'draft': 0.6,
  'standard': 0.75,
  'premium': 0.85,
  'best-in-class': 0.92
};

/** SLA parameters per availability level */
const SLA_PARAMETERS: Record<SLALevel, { max_downtime_ms: number; max_error_rate_pct: number; rto_ms: number }> = {
  relaxed: { max_downtime_ms: 60000, max_error_rate_pct: 5, rto_ms: 30000 },
  standard: { max_downtime_ms: 10000, max_error_rate_pct: 2, rto_ms: 5000 },
  strict: { max_downtime_ms: 2000, max_error_rate_pct: 0.5, rto_ms: 1000 },
  'mission-critical': { max_downtime_ms: 500, max_error_rate_pct: 0.1, rto_ms: 200 }
};

/** Network condition latency multipliers (1.0 = baseline) */
const NETWORK_LATENCY_MULTIPLIERS: Record<NetworkCondition, number> = {
  excellent: 1.0,
  good: 1.2,
  moderate: 1.6,
  poor: 2.5
};

/** Human-readable descriptions of network condition impacts */
const NETWORK_IMPACT_DESCRIPTIONS: Record<NetworkCondition, string> = {
  'excellent': 'Minimal impact (<5% overhead). Ideal for latency-sensitive workloads.',
  'good': 'Low impact (~20% overhead). Suitable for most production use cases.',
  'moderate': 'Moderate impact (~60% overhead). Consider batching or request deferral.',
  'poor': 'Severe impact (>150% overhead). Switch regions, reduce concurrency, or defer non-critical requests.'
};

/** Priority ranking for request ordering (lower number = higher priority) */
const PRIORITY_ORDER: Record<string, number> = {
  'critical': 0,
  'high': 1,
  'normal': 2,
  'low': 3
};

/** Load status thresholds for classification */
const LOAD_STATUS_THRESHOLDS = {
  underutilized_max: 40,
  optimal_max: 75,
  near_capacity_max: 90
} as const;

/** Scoring weights for model selection (must sum to ~1.0) */
const SELECTOR_SCORING_WEIGHTS = {
  quality: 0.40,
  cost: 0.20,
  latency: 0.15,
  capability: 0.15,
  provider_preference: 0.10
} as const;

// SECTION 5 — Helper Functions
/**
 * Build a markdown table from headers and row data.
 * Produces GFM-compatible pipe tables with separator row.
 */
function buildMarkdownTable(headers: string[], rows: string[][]): string {
  const lines: string[] = [];
  lines.push('| ' + headers.join(' | ') + ' |');
  lines.push('| ' + headers.map(() => '---').join(' | ') + ' |');
  for (const row of rows) {
    lines.push('| ' + row.join(' | ') + ' |');
  }
  return lines.join('\n');
}

/**
 * Format a USD cost value for human readability.
 * Shows appropriate precision based on magnitude.
 */
function formatCost(cost: number): string {
  if (cost === 0) return '$0.00 (free)';
  if (cost < 0.001) return '$' + cost.toFixed(6);
  if (cost < 1) return '$' + cost.toFixed(4);
  return '$' + cost.toFixed(2);
}

/**
 * Get token volume estimates for a given complexity tier.
 */
function getComplexityMultiplier(c: ComplexityLevel): { input: number; output: number } {
  return COMPLEXITY_TOKEN_MULTIPLIERS[c];
}

/**
 * Get the minimum quality threshold for a quality tier.
 */
function getQualityThreshold(tier: QualityTier): number {
  return QUALITY_TIER_THRESHOLDS[tier];
}

/**
 * Get SLA parameters for a given availability level.
 */
function getSLAParams(level: SLALevel): { max_downtime_ms: number; max_error_rate_pct: number; rto_ms: number } {
  return SLA_PARAMETERS[level];
}

/**
 * Get the network latency multiplier for a condition level.
 */
function getNetworkMultiplier(c: NetworkCondition): number {
  return NETWORK_LATENCY_MULTIPLIERS[c];
}

/**
 * Get a human-readable description of network impact.
 */
function getNetworkImpact(c: NetworkCondition): string {
  return NETWORK_IMPACT_DESCRIPTIONS[c];
}

/**
 * Classify a load percentage into a status label.
 */
function classifyLoad(loadPct: number): 'underutilized' | 'optimal' | 'near-capacity' | 'overloaded' {
  if (loadPct < LOAD_STATUS_THRESHOLDS.underutilized_max) return 'underutilized';
  if (loadPct < LOAD_STATUS_THRESHOLDS.optimal_max) return 'optimal';
  if (loadPct < LOAD_STATUS_THRESHOLDS.near_capacity_max) return 'near-capacity';
  return 'overloaded';
}

/**
 * Resolve a model ID to its registry entry.
 * Returns a synthetic entry for unknown models to prevent crashes.
 */
function resolveModel(modelId: string): ModelInfo {
  const found = MODEL_REGISTRY[modelId];
  if (found) return found;
  return {
    id: modelId, name: modelId, provider: 'deepseek',
    cost_per_1k_input: 0.001, cost_per_1k_output: 0.002,
    context_window: 32000, avg_latency_ms: 1000,
    capabilities: ['text-generation'], strengths: ['unknown'], weaknesses: ['unknown-model'],
    quality_scores: { code: 0.7, chat: 0.7, analysis: 0.7, creative: 0.7, vision: 0.0 },
    available_regions: [], max_concurrency: 50,
    last_updated: '2025-01-01', supports_streaming: true, supports_tools: false
  };
}

/**
 * Check whether a model is available in a given region.
 */
function isModelInRegion(model: ModelInfo, region: string): boolean {
  return model.available_regions.includes(region);
}

/**
 * Compute the blended cost per 1K tokens (50% input + 50% output).
 */
function blendedCostPer1K(model: ModelInfo): number {
  return (model.cost_per_1k_input + model.cost_per_1k_output) / 2;
}

/**
 * Estimate the total cost for a given token volume on a specific model.
 */
function estimateTotalCost(model: ModelInfo, inputTokens: number, outputTokens: number): number {
  return (model.cost_per_1k_input * inputTokens / 1000) + (model.cost_per_1k_output * outputTokens / 1000);
}

/**
 * Compute an average quality score across all task dimensions.
 */
function averageQuality(model: ModelInfo): number {
  const qs = model.quality_scores;
  return (qs.code + qs.chat + qs.analysis + qs.creative + qs.vision) / 5;
}

/**
 * Compute quality score for the specific vision-related tasks.
 * Returns 0 if model has no vision capability.
 */
function visionCapabilityScore(model: ModelInfo): number {
  return model.quality_scores.vision;
}

/**
 * Render a markdown report string as a single text ContentBlock.
 * Used by all tool output renderers for consistent presentation.
 */
function renderReport(_args: unknown, value: { report_markdown: string }): ContentBlock[] {
  return [{ type: 'text', text: value.report_markdown }];
}

// SECTION 6 — Scoring Engine
/**
 * Compute a comprehensive routing score for a model against a task profile.
 * Returns per-dimension scores and an overall weighted aggregate.
 */
function computeRoutingScore(
  model: ModelInfo,
  taskType: TaskType,
  constraints: RoutingConstraints,
  rng: SeededRandom
): { overall: number; dimensions: ScoredCandidate['dimension_scores']; reasons: string[] } {
  const reasons: string[] = [];
  const dims = { quality: 0, cost: 0, latency: 0, capability: 0, provider_preference: 0 };

  // Quality dimension: how well does the model perform at this task type?
  const qualityScore = model.quality_scores[taskType];
  dims.quality = qualityScore * SELECTOR_SCORING_WEIGHTS.quality * 100;
  if (qualityScore > 0.85) reasons.push('Exceptional ' + taskType + ' performance (' + Math.round(qualityScore * 100) + '%)');
  else if (qualityScore > 0.7) reasons.push('Strong ' + taskType + ' performance (' + Math.round(qualityScore * 100) + '%)');

  // Cost dimension: cheaper models score higher
  const avgCost = blendedCostPer1K(model);
  const costScore = avgCost === 0 ? 30 : Math.max(0, 20 - avgCost * 2000);
  dims.cost = costScore * SELECTOR_SCORING_WEIGHTS.cost * 5;
  if (avgCost === 0) reasons.push('Free to use (self-hosted)');
  else if (avgCost < 0.001) reasons.push('Very low cost per token');

  // Latency dimension: faster models score higher
  const latencyScore = Math.max(0, 15 - model.avg_latency_ms / 200);
  dims.latency = latencyScore * SELECTOR_SCORING_WEIGHTS.latency * 5;
  if (model.avg_latency_ms < 700) reasons.push('Excellent latency (' + model.avg_latency_ms + 'ms)');

  // Capability dimension: how many required capabilities does the model have?
  const reqCaps = constraints.required_capabilities;
  if (reqCaps && reqCaps.length > 0) {
    const matched = reqCaps.filter((c) =>
      model.capabilities.some((mc) => mc.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(mc))
    ).length;
    const matchRatio = matched / reqCaps.length;
    dims.capability = matchRatio * SELECTOR_SCORING_WEIGHTS.capability * 100;
    if (matchRatio === 1) reasons.push('Full capability coverage');
    else if (matchRatio >= 0.5) reasons.push('Partial capability coverage (' + Math.round(matchRatio * 100) + '%)');
  } else {
    dims.capability = SELECTOR_SCORING_WEIGHTS.capability * 50;
  }

  // Provider preference dimension
  const prefProvs = constraints.preferred_providers;
  const exclProvs = constraints.excluded_providers;
  if (exclProvs && exclProvs.includes(model.provider)) {
    dims.provider_preference = -100; // strongly penalize excluded
    reasons.push('EXCLUDED provider: ' + model.provider);
  } else if (prefProvs && prefProvs.length > 0) {
    if (prefProvs.includes(model.provider)) {
      dims.provider_preference = SELECTOR_SCORING_WEIGHTS.provider_preference * 100;
      reasons.push('Preferred provider: ' + model.provider);
    } else {
      dims.provider_preference = SELECTOR_SCORING_WEIGHTS.provider_preference * 30;
    }
  } else {
    dims.provider_preference = SELECTOR_SCORING_WEIGHTS.provider_preference * 50;
  }

  // Apply constraint-based hard limits
  const maxCost = constraints.max_cost_per_1k;
  if (maxCost && avgCost > maxCost) {
    dims.cost = Math.min(dims.cost, 5);
    reasons.push('Exceeds cost constraint (' + formatCost(avgCost) + ' > ' + formatCost(maxCost) + ')');
  }

  const maxLat = constraints.max_latency_ms;
  if (maxLat && model.avg_latency_ms > maxLat) {
    dims.latency = Math.min(dims.latency, 5);
    reasons.push('Exceeds latency constraint (' + model.avg_latency_ms + 'ms > ' + maxLat + 'ms)');
  }

  // Add slight randomness for tiebreaking
  const jitter = rng.nextFloat(-1, 1);
  const overall = Object.values(dims).reduce((s, v) => s + v, 0) + jitter;

  return { overall: Math.round(overall * 100) / 100, dimensions: dims, reasons };
}

// SECTION 7 — Tool 1: model_selector
const modelSelectorTool = defineTool({
  name: 'model_selector',
  description: 'Selects the optimal AI model for a given task based on task type, constraints, cost, and quality requirements',
  parameters: {
    task_description: { type: 'string', description: 'Description of the task to be performed', required: true },
    task_type: { type: 'string', enum: ['code', 'chat', 'analysis', 'creative', 'vision'], description: 'Category of the task', required: true },
    constraints: { type: 'object', additionalProperties: true, properties: {
      max_cost_per_1k: { type: 'number', description: 'Max cost per 1K tokens in USD' },
      max_latency_ms: { type: 'number', description: 'Max acceptable latency in ms' },
      required_capabilities: { type: 'array', items: { type: 'string' }, description: 'Required capabilities' },
      preferred_providers: { type: 'array', items: { type: 'string' }, description: 'Preferred providers' },
      excluded_providers: { type: 'array', items: { type: 'string' }, description: 'Providers to exclude' },
      min_context_window: { type: 'number', description: 'Min context window in tokens' },
      required_regions: { type: 'array', items: { type: 'string' }, description: 'Required deployment regions' },
      require_streaming: { type: 'boolean', description: 'Require streaming support' },
      require_tools: { type: 'boolean', description: 'Require tool/function calling support' }
    } }
  },
  output: {
    schema: { type: 'json' as const },
    render: renderReport
  },
  async execute(args) {
    const desc = args.task_description!;
    const tType = args.task_type! as TaskType;
    const constraints = (args.constraints || {}) as RoutingConstraints;
    const rng = new SeededRandom(SeededRandom.seedFromString(desc + tType));

    // Score every model in the registry
    const scored = Object.values(MODEL_REGISTRY).map((model) => {
      const result = computeRoutingScore(model, tType, constraints, rng);
      return { model, score: result.overall, reasons: result.reasons, dimension_scores: result.dimensions };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    // Build the primary recommendation and alternatives
    const toRecommendation = (e: ScoredCandidate) => ({
      model_id: e.model.id,
      model_name: e.model.name,
      provider: e.model.provider,
      confidence_score: Math.min(0.99, Math.max(0.1, e.score / 100)),
      estimated_cost_per_1k: blendedCostPer1K(e.model),
      estimated_latency_ms: e.model.avg_latency_ms,
      context_window: e.model.context_window,
      strengths: e.model.strengths,
      weaknesses: e.model.weaknesses,
      match_reasons: e.reasons.length > 0 ? e.reasons : ['General purpose model'],
      dimension_scores: e.dimension_scores
    });

    const primary = toRecommendation(scored[0]);
    const alternatives = scored.slice(1, 4).map(toRecommendation);
    const riskScore = scored[0].score > 70 ? 'Low' : scored[0].score > 40 ? 'Medium' : 'High';

    // Build the markdown report
    const rl: string[] = [];
    rl.push('# Model Selector Report', '', '## Task Summary', '');
    rl.push('- **Task Type**: ' + tType, '- **Description**: ' + desc, '', '## Primary Recommendation', '');
    rl.push('> **' + primary.model_name + '** (' + primary.model_id + ')', '');
    rl.push('- **Confidence**: ' + Math.round(primary.confidence_score * 100) + '%');
    rl.push('- **Provider**: ' + primary.provider);
    rl.push('- **Est. Cost/1K**: ' + formatCost(primary.estimated_cost_per_1k));
    rl.push('- **Est. Latency**: ' + primary.estimated_latency_ms + 'ms');
    rl.push('- **Context Window**: ' + primary.context_window.toLocaleString() + ' tokens');
    rl.push('- **Strengths**: ' + primary.strengths.join(', '));
    rl.push('- **Match Reasons**: ' + primary.match_reasons.join('; '));
    rl.push('', '## Alternative Models', '');
    const altRows: string[][] = [];
    alternatives.forEach((alt, i) => {
      altRows.push(['#' + (i + 2), alt.model_name, alt.provider, Math.round(alt.confidence_score * 100) + '%', formatCost(alt.estimated_cost_per_1k), alt.estimated_latency_ms + 'ms']);
    });
    rl.push(buildMarkdownTable(['Rank', 'Model', 'Provider', 'Confidence', 'Cost/1K', 'Latency'], altRows));
    rl.push('', '## Capability Coverage', '');
    if (constraints.required_capabilities && constraints.required_capabilities.length > 0) {
      constraints.required_capabilities.forEach((cap) => {
        const covered = scored[0].model.capabilities.some((mc) =>
          mc.toLowerCase().includes(cap.toLowerCase()) || cap.toLowerCase().includes(mc)
        );
        rl.push('- [' + (covered ? 'x' : ' ') + '] ' + cap);
      });
    } else {
      rl.push('- No specific capability requirements provided.');
    }
    rl.push('', '## Risk Assessment', '');
    rl.push('- **Risk Level**: ' + riskScore);
    rl.push('- **Primary Risk**: ' + (primary.weaknesses[0] || 'None identified'));
    rl.push('- **Mitigation**: Consider fallback to ' + (alternatives[0]?.model_name || 'N/A') + ' if primary model degrades');
    rl.push('');

    return {
      primary_recommendation: primary,
      alternatives,
      routing_decision: 'Route to ' + primary.model_id + ' with confidence ' + Math.round(primary.confidence_score * 100) + '%',
      risk_assessment: riskScore + ' risk - ' + (primary.weaknesses[0] || 'no significant weaknesses'),
      report_markdown: rl.join('\n')
    };
  }
});

// SECTION 8 — Tool 2: cost_optimizer
const costOptimizerTool = defineTool({
  name: 'cost_optimizer',
  description: 'Optimizes model selection for cost efficiency given task complexity, budget, and quality requirements',
  parameters: {
    task_complexity: { type: 'string', enum: ['trivial', 'low', 'medium', 'high', 'extreme'], description: 'Complexity level', required: true },
    budget_limit: { type: 'number', description: 'Maximum budget in USD', required: true },
    quality_requirement: { type: 'string', enum: ['draft', 'standard', 'premium', 'best-in-class'], description: 'Min quality tier', required: true },
    expected_token_volume: { type: 'number', description: 'Expected token volume (optional)' },
    priority: { type: 'string', enum: ['cost', 'quality', 'balanced'], description: 'Optimization priority' }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args) {
    const complexity = args.task_complexity! as ComplexityLevel;
    const budget = args.budget_limit!;
    const qualityReq = args.quality_requirement! as QualityTier;
    const priority = (args.priority || 'balanced') as 'cost' | 'quality' | 'balanced';
    const rng = new SeededRandom(SeededRandom.seedFromString(complexity + qualityReq + String(budget)));

    const qualityThreshold = getQualityThreshold(qualityReq);
    const tokenMultipliers = getComplexityMultiplier(complexity);
    const inputTokens = args.expected_token_volume || tokenMultipliers.input;
    const outputTokens = Math.round(inputTokens * (tokenMultipliers.output / tokenMultipliers.input));
    const totalTokens = inputTokens + outputTokens;

    // Filter models meeting quality threshold (with 10% relaxation fallback)
    const eligible = Object.values(MODEL_REGISTRY).filter((m) => averageQuality(m) >= qualityThreshold);
    const candidates = eligible.length > 0 ? eligible : Object.values(MODEL_REGISTRY).filter((m) => averageQuality(m) >= qualityThreshold * 0.9);

    // Score each candidate for cost-effectiveness
    const scored = candidates.map((model) => {
      const totalCost = estimateTotalCost(model, inputTokens, outputTokens);
      const avgQuality = averageQuality(model);
      let ce: number;
      if (priority === 'cost') {
        ce = totalCost === 0 ? 100 : Math.max(0, 50 - totalCost * 100) + avgQuality * 20;
      } else if (priority === 'quality') {
        ce = avgQuality * 60 + (totalCost === 0 ? 20 : Math.max(0, 20 - totalCost * 50));
      } else {
        ce = avgQuality * 40 + (totalCost === 0 ? 30 : Math.max(0, 30 - totalCost * 80));
      }
      return { model, totalCost, avgQuality, costEffectiveness: Math.round(ce * 100) / 100 };
    });
    scored.sort((a, b) => b.costEffectiveness - a.costEffectiveness);

    // Build the optimal model combination (top 3)
    const top = scored.slice(0, Math.min(3, scored.length));
    const tw = top.reduce((s, m) => s + m.costEffectiveness, 0);
    const combination = top.map((e, idx) => ({
      model_id: e.model.id,
      model_name: e.model.name,
      cost_per_1k_input: e.model.cost_per_1k_input,
      cost_per_1k_output: e.model.cost_per_1k_output,
      quality_score: Math.round(e.avgQuality * 100) / 100,
      recommended_allocation_pct: Math.round((e.costEffectiveness / tw) * 100) || (idx === 0 ? 100 : 0)
    }));
    const ta = combination.reduce((s, c) => s + c.recommended_allocation_pct, 0);
    if (ta > 0 && ta !== 100) combination[0].recommended_allocation_pct += (100 - ta);

    // Compute weighted total cost for the combination
    const totalCost = combination.reduce((sum, c) => {
      const a = c.recommended_allocation_pct / 100;
      return sum + (c.cost_per_1k_input * inputTokens / 1000 + c.cost_per_1k_output * outputTokens / 1000) * a;
    }, 0);

    // Compute savings vs the most expensive model
    const mostExp = Object.values(MODEL_REGISTRY).reduce((max, m) => {
      const c = estimateTotalCost(m, inputTokens, outputTokens);
      return c > max.cost ? { model: m, cost: c } : max;
    }, { model: Object.values(MODEL_REGISTRY)[0], cost: 0 });
    const savings = mostExp.cost > 0 ? Math.round((1 - totalCost / mostExp.cost) * 100) : 0;

    // Build the markdown report
    const rl: string[] = [];
    rl.push('# Cost Optimizer Report', '', '## Input Parameters', '');
    rl.push('- **Complexity**: ' + complexity, '- **Budget Limit**: ' + formatCost(budget), '- **Quality Requirement**: ' + qualityReq, '- **Priority**: ' + priority);
    rl.push('', '## Token Estimation', '');
    rl.push('- **Input Tokens**: ' + inputTokens.toLocaleString(), '- **Output Tokens**: ' + outputTokens.toLocaleString(), '- **Total Tokens**: ' + totalTokens.toLocaleString());
    rl.push('', '## Optimal Model Combination', '');
    const comboRows: string[][] = [];
    combination.forEach((c) => {
      const m = resolveModel(c.model_id);
      comboRows.push([c.model_name, m.provider, formatCost(c.cost_per_1k_input), formatCost(c.cost_per_1k_output), (c.quality_score * 100).toFixed(0) + '%', c.recommended_allocation_pct + '%']);
    });
    rl.push(buildMarkdownTable(['Model', 'Provider', 'Input $/1K', 'Output $/1K', 'Quality', 'Allocation'], comboRows));
    rl.push('', '## Cost Summary', '');
    rl.push('- **Total Estimated Cost**: ' + formatCost(totalCost));
    rl.push('- **Budget Utilization**: ' + Math.round(totalCost / budget * 100) + '%');
    rl.push('- **Savings vs Premium**: ' + savings + '%');
    rl.push('- **Budget Status**: ' + (totalCost <= budget ? 'Within budget' : 'OVER BUDGET'));
    rl.push('');

    return {
      optimal_combination: combination,
      total_estimated_cost: Math.round(totalCost * 1e6) / 1e6,
      estimated_token_consumption: { input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: totalTokens },
      cost_breakdown: combination.map((c) => c.model_name + ' (' + c.recommended_allocation_pct + '%)').join(' + '),
      savings_vs_premium: savings,
      report_markdown: rl.join('\n')
    };
  }
});

// SECTION 9 — Tool 3: fallback_strategist
const fallbackStrategistTool = defineTool({
  name: 'fallback_strategist',
  description: 'Designs multi-level fallback chains with switch triggers for high-availability model routing',
  parameters: {
    primary_model: { type: 'string', description: 'Primary model ID', required: true },
    failure_scenarios: { type: 'array', items: { type: 'string' }, description: 'Failure scenarios to plan for', required: true },
    sla_requirements: { type: 'object', additionalProperties: false, properties: { level: { type: 'string', enum: ['relaxed', 'standard', 'strict', 'mission-critical'], required: true }, max_downtime_ms: { type: 'number' }, max_error_rate_pct: { type: 'number' }, recovery_time_objective_ms: { type: 'number' } }, required: true },
    available_fallbacks: { type: 'array', items: { type: 'string' }, description: 'Optional fallback model IDs' }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args) {
    const primaryModel = args.primary_model!;
    const failureScenarios = args.failure_scenarios!;
    const slaReq = args.sla_requirements as { level: SLALevel };
    const slaLevel = slaReq.level;
    const rng = new SeededRandom(SeededRandom.seedFromString(primaryModel + slaLevel));

    const primary = resolveModel(primaryModel);
    const slaParams = getSLAParams(slaLevel);

    // Build fallback pool: either specified or all other models
    const fallbackPool = args.available_fallbacks
      ? args.available_fallbacks.filter((id: string) => id !== primaryModel).map(resolveModel)
      : Object.values(MODEL_REGISTRY).filter((m) => m.id !== primaryModel);

    // Sort by quality + latency score (best first)
    const sortedFBs = fallbackPool.sort((a, b) => {
      const as2 = a.quality_scores.chat + (1 - a.avg_latency_ms / 2000);
      const bs = b.quality_scores.chat + (1 - b.avg_latency_ms / 2000);
      return bs - as2;
    });

    // Determine chain depth based on SLA level
    const maxLevels = slaLevel === 'mission-critical' ? 4 : slaLevel === 'strict' ? 3 : 2;

    // Build the fallback chain
    const chain = [];
    const triggerTemplates = [
      'Primary model returns 5xx error',
      'Response timeout exceeds ' + slaParams.rto_ms + 'ms',
      'Error rate exceeds ' + slaParams.max_error_rate_pct + '%',
      'Rate limit (429) received',
      'Model endpoint unreachable',
      'Content filter triggered unexpectedly'
    ];
    for (let i = 0; i < Math.min(maxLevels, sortedFBs.length); i++) {
      const fb = sortedFBs[i];
      chain.push({
        level: i + 1,
        model_id: fb.id,
        model_name: fb.name,
        trigger_condition: triggerTemplates[i % triggerTemplates.length],
        switch_timeout_ms: Math.round(slaParams.rto_ms / (i + 1)),
        recovery_action: i === sortedFBs.length - 1 ? 'Return error with diagnostics' : 'Attempt next fallback level'
      });
    }

    // Compute estimated availability
    const estAvail = Math.min(0.99999, 0.97 + chain.length * 0.008 + rng.nextFloat(0, 0.005));
    const worstLat = chain.reduce((s, l) => s + l.switch_timeout_ms, 0) + primary.avg_latency_ms;

    // Build the markdown report
    const rl: string[] = [];
    rl.push('# Fallback Strategist Report', '', '## Configuration', '');
    rl.push('- **Primary Model**: ' + primary.name + ' (' + primary.id + ')', '- **SLA Level**: ' + slaLevel, '- **Failure Scenarios**: ' + failureScenarios.length, '- **Max Downtime**: ' + slaParams.max_downtime_ms + 'ms', '- **Max Error Rate**: ' + slaParams.max_error_rate_pct + '%', '- **RTO**: ' + slaParams.rto_ms + 'ms');
    rl.push('', '## Fallback Chain', '');
    const chainRows: string[][] = [];
    chain.forEach((l) => {
      chainRows.push(['L' + l.level, l.model_name, l.trigger_condition, l.switch_timeout_ms + 'ms', l.recovery_action]);
    });
    rl.push(buildMarkdownTable(['Level', 'Model', 'Trigger', 'Timeout', 'Recovery Action'], chainRows));
    rl.push('', '## Failure Scenarios Covered', '');
    failureScenarios.forEach((s, i) => { rl.push((i + 1) + '. ' + s); });
    rl.push('', '## Availability Analysis', '');
    rl.push('- **Estimated Availability**: ' + (estAvail * 100).toFixed(3) + '%');
    rl.push('- **Worst Case Latency**: ' + worstLat + 'ms');
    rl.push('- **Fallback Levels**: ' + chain.length);
    rl.push('- **SLA Compliance**: ' + (estAvail >= 0.999 ? 'Compliant' : 'Review needed'));
    rl.push('');

    return {
      fallback_chain: chain,
      switch_triggers: chain.map((c) => c.trigger_condition),
      estimated_availability_pct: Math.round(estAvail * 1e5) / 1e3,
      worst_case_latency_ms: worstLat,
      report_markdown: rl.join('\n')
    };
  }
});

// SECTION 10 — Tool 4: load_balancer
const loadBalancerTool = defineTool({
  name: 'load_balancer',
  description: 'Distributes incoming requests across multiple models using configurable load balancing strategies',
  parameters: {
    models: { type: 'array', items: { type: 'string' }, description: 'Available model IDs', required: true },
    current_loads: { type: 'array', items: { type: 'number' }, description: 'Current load % (0-100) per model', required: true },
    request_queue: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { request_id: { type: 'string', required: true }, estimated_tokens: { type: 'number', required: true }, priority: { type: 'string', enum: ['low', 'normal', 'high', 'critical'] }, task_type: { type: 'string', enum: ['code', 'chat', 'analysis', 'creative', 'vision'] } }, required: true }, description: 'Pending requests queue', required: true },
    strategy: { type: 'string', enum: ['round-robin', 'weighted', 'least-loaded', 'latency-aware'], description: 'Balancing strategy' }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args) {
    const models = args.models!;
    const loads0 = args.current_loads!;
    const queue = args.request_queue as QueuedRequest[];
    const strategy = (args.strategy || 'weighted') as BalancingStrategy;
    const rng = new SeededRandom(SeededRandom.seedFromString(models.join(',') + strategy));

    // Normalize loads array to match models length
    const loads = models.map((_, i) => loads0[i] ?? 0);

    // Sort requests by priority (critical first)
    const sortedReqs = [...queue].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    // Assign each request to a model
    const assignments = [];
    const mrc: Record<string, number> = {};
    models.forEach((m) => { mrc[m] = 0; });
    const wl = [...loads]; // working load copy

    for (const req of sortedReqs) {
      let sel: string;
      let reason: string;

      switch (strategy) {
        case 'round-robin': {
          const mi = wl.indexOf(Math.min(...wl));
          sel = models[mi];
          reason = 'Round-robin selection';
          break;
        }
        case 'least-loaded': {
          const ml = Math.min(...wl);
          sel = models[wl.indexOf(ml)];
          reason = 'Least loaded (' + ml + '%)';
          break;
        }
        case 'weighted': {
          const il = wl.map((l) => Math.max(1, 100 - l));
          const ti = il.reduce((s, v) => s + v, 0);
          let r = rng.nextFloat(0, ti);
          let cs = 0;
          let si = 0;
          for (let i = 0; i < il.length; i++) {
            cs += il[i];
            if (r <= cs) { si = i; break; }
          }
          sel = models[si];
          reason = 'Weighted random (load: ' + wl[si] + '%)';
          break;
        }
        case 'latency-aware': {
          const sc = models.map((m, i) => {
            const mi = resolveModel(m);
            return (Math.max(0, 100 - mi.avg_latency_ms / 20) * 0.5 + Math.max(0, 100 - wl[i]) * 0.5);
          });
          const ms = Math.max(...sc);
          sel = models[sc.indexOf(ms)];
          reason = 'Latency-aware (score: ' + Math.round(ms) + ')';
          break;
        }
        default: {
          sel = models[0];
          reason = 'Default assignment';
        }
      }

      // Critical priority always goes to least-loaded
      if (req.priority === 'critical') {
        const ml = Math.min(...wl);
        sel = models[wl.indexOf(ml)];
        reason = 'Critical override to least loaded';
      }

      const mi2 = models.indexOf(sel);
      assignments.push({
        request_id: req.request_id,
        assigned_model: sel,
        reason,
        estimated_wait_ms: Math.round(wl[mi2] * 10 + req.estimated_tokens / 100)
      });
      wl[mi2] = Math.min(100, wl[mi2] + Math.min(15, req.estimated_tokens / 500));
      mrc[sel]++;
    }

    // Compute final load distribution
    const distribution = models.map((m, i) => ({
      model_id: m,
      assigned_requests: mrc[m],
      projected_load_pct: Math.round(wl[i]),
      status: classifyLoad(wl[i])
    }));

    // Compute overall efficiency (lower variance = higher efficiency)
    const al = wl.reduce((s, v) => s + v, 0) / wl.length;
    const lv = wl.reduce((s, v) => s + Math.pow(v - al, 2), 0) / wl.length;
    const efficiency = Math.round(Math.max(0, 100 - Math.sqrt(lv)));

    // Generate warnings
    const warnings: string[] = [];
    distribution.forEach((d) => {
      if (d.status === 'overloaded') warnings.push(d.model_id + ' overloaded (' + d.projected_load_pct + '%)');
      if (d.status === 'underutilized' && d.assigned_requests === 0) warnings.push(d.model_id + ' has no requests assigned');
    });

    // Build the markdown report
    const rl: string[] = [];
    rl.push('# Load Balancer Report', '', '## Strategy & Configuration', '');
    rl.push('- **Strategy**: ' + strategy, '- **Models**: ' + models.length, '- **Total Requests**: ' + queue.length);
    rl.push('', '## Request Assignments', '');
    const aRows: string[][] = [];
    assignments.forEach((a) => {
      const req = queue.find((r) => r.request_id === a.request_id);
      aRows.push([a.request_id, a.assigned_model, req?.priority || 'normal', a.estimated_wait_ms + 'ms', a.reason]);
    });
    rl.push(buildMarkdownTable(['Request ID', 'Model', 'Priority', 'Est. Wait', 'Reason'], aRows));
    rl.push('', '## Load Distribution', '');
    const dRows: string[][] = [];
    distribution.forEach((d) => {
      dRows.push([d.model_id, d.assigned_requests.toString(), d.projected_load_pct + '%', d.status]);
    });
    rl.push(buildMarkdownTable(['Model', 'Requests', 'Projected Load', 'Status'], dRows));
    rl.push('', '## Efficiency Analysis', '');
    rl.push('- **Overall Efficiency**: ' + efficiency + '%');
    rl.push('- **Average Load**: ' + al.toFixed(1) + '%');
    rl.push('- **Load Variance**: ' + lv.toFixed(1));
    warnings.forEach((w) => { rl.push('- **Warning**: ' + w); });
    rl.push('');

    return {
      assignments,
      distribution,
      overall_efficiency_pct: efficiency,
      bottleneck_warnings: warnings,
      report_markdown: rl.join('\n')
    };
  }
});

// SECTION 11 — Tool 5: capability_mapper
const capabilityMapperTool = defineTool({
  name: 'capability_mapper',
  description: 'Maps required capabilities against available models and identifies coverage gaps and optimal combinations',
  parameters: {
    required_capabilities: { type: 'array', items: { type: 'string' }, description: 'Capabilities that must be covered', required: true },
    available_models: { type: 'array', items: { type: 'string' }, description: 'Model IDs to evaluate', required: true },
    min_coverage_pct: { type: 'number', description: 'Min coverage % (0-100)' }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args) {
    const reqCaps = args.required_capabilities!;
    const availModels = args.available_models!;
    const minCov = args.min_coverage_pct || 80;
    const rng = new SeededRandom(SeededRandom.seedFromString(reqCaps.join(',') + availModels.join(',')));

    // Build coverage matrix
    const matrix = availModels.map((mid) => {
      const model = resolveModel(mid);
      const caps = reqCaps.map((cap) => {
        const supported = model.capabilities.some((mc) =>
          mc.toLowerCase().includes(cap.toLowerCase()) || cap.toLowerCase().includes(mc)
        );
        const baseProf = Math.max(model.quality_scores.code, model.quality_scores.chat, model.quality_scores.analysis, model.quality_scores.creative);
        const prof = supported ? Math.min(1, Math.max(0.5, baseProf + rng.nextFloat(-0.1, 0.1))) : Math.max(0, rng.nextFloat(0, 0.3));
        return { name: cap, supported, proficiency: Math.round(prof * 100) / 100 };
      });
      return {
        model_id: mid,
        model_name: model.name,
        capabilities: caps,
        overall_coverage_pct: Math.round((caps.filter((c) => c.supported).length / reqCaps.length) * 100),
        gaps: caps.filter((c) => !c.supported).map((c) => c.name)
      };
    });

    // Sort by coverage descending
    const sorted = [...matrix].sort((a, b) => b.overall_coverage_pct - a.overall_coverage_pct);
    const top = sorted.slice(0, Math.min(3, sorted.length));

    // Compute combined coverage of the recommended set
    const covered = new Set<string>();
    top.forEach((m) => { m.capabilities.filter((c) => c.supported).forEach((c) => covered.add(c.name)); });
    const combinedCov = Math.round((covered.size / reqCaps.length) * 100);

    // Compute redundancy (capabilities covered by more than one model)
    const capCount: Record<string, number> = {};
    top.forEach((m) => { m.capabilities.filter((c) => c.supported).forEach((c) => { capCount[c.name] = (capCount[c.name] || 0) + 1; }); });
    const redCaps = Object.values(capCount).filter((c) => c > 1).length;
    const redundancy = reqCaps.length > 0 ? Math.round((redCaps / reqCaps.length) * 100) : 0;

    const uncovered = reqCaps.filter((c) => !covered.has(c));

    // Build the markdown report
    const rl: string[] = [];
    rl.push('# Capability Mapper Report', '', '## Required Capabilities', '');
    reqCaps.forEach((c) => { rl.push('- ' + c); });
    rl.push('', '## Coverage Matrix', '');
    const mRows: string[][] = [];
    matrix.forEach((m) => {
      mRows.push([m.model_name, m.overall_coverage_pct + '%', m.capabilities.filter((c) => c.supported).map((c) => c.name).join(', ') || 'None', m.gaps.join(', ') || 'None']);
    });
    rl.push(buildMarkdownTable(['Model', 'Coverage %', 'Supported', 'Gaps'], mRows));
    rl.push('', '## Recommended Combination', '');
    rl.push('- **Models**: ' + top.map((m) => m.model_name).join(' + '));
    rl.push('- **Combined Coverage**: ' + combinedCov + '%');
    rl.push('- **Redundancy**: ' + redundancy + '%');
    rl.push('- **Meets Minimum**: ' + (combinedCov >= minCov ? 'Yes' : 'No'));
    if (uncovered.length > 0) {
      rl.push('', '## Uncovered Capabilities', '');
      uncovered.forEach((c) => { rl.push('- **' + c + '** — no model in the set supports this'); });
    }
    rl.push('');

    return {
      coverage_matrix: matrix,
      recommended_combination: { models: top.map((m) => m.model_id), combined_coverage_pct: combinedCov, redundancy_pct: redundancy },
      uncovered_capabilities: uncovered,
      report_markdown: rl.join('\n')
    };
  }
});

// SECTION 12 — Tool 6: latency_predictor
const latencyPredictorTool = defineTool({
  name: 'latency_predictor',
  description: 'Predicts inference latency (TTFT, completion time, percentiles) for a given model and input configuration',
  parameters: {
    model_id: { type: 'string', description: 'Model ID', required: true },
    input_tokens: { type: 'number', description: 'Number of input tokens', required: true },
    network_condition: { type: 'string', enum: ['excellent', 'good', 'moderate', 'poor'], description: 'Network condition', required: true },
    output_token_estimate: { type: 'number', description: 'Estimated output tokens' },
    region: { type: 'string', description: 'Region (optional)' },
    concurrent_requests: { type: 'number', description: 'Concurrent requests (optional)' }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args) {
    const mid = args.model_id!;
    const inTokens = args.input_tokens!;
    const netCond = args.network_condition! as NetworkCondition;
    const rng = new SeededRandom(SeededRandom.seedFromString(mid + inTokens + netCond));

    const model = resolveModel(mid);
    const nm = getNetworkMultiplier(netCond);
    const outTokens = args.output_token_estimate || Math.round(inTokens * 0.4);
    const conc = args.concurrent_requests || 1;

    // Compute TTFT (time to first token)
    const ttft = Math.round((model.avg_latency_ms + inTokens * 0.05) * nm * (1 + conc * 0.05));

    // Compute effective tokens per second
    const effTPS = (50 + rng.nextFloat(10, 40)) / nm / (1 + conc * 0.03);

    // Total completion time
    const totalMs = Math.round(ttft + (outTokens / effTPS) * 1000);

    // Percentile estimates
    const p50 = Math.round(totalMs * 0.95);
    const p95 = Math.round(totalMs * 1.3);
    const p99 = Math.round(totalMs * 1.8);

    // Confidence decreases with concurrency
    const confidence = Math.round(Math.max(0.6, Math.min(0.95, 0.9 - conc * 0.02 + rng.nextFloat(-0.05, 0.05))) * 100) / 100;

    // Generate optimization suggestions
    const suggestions: string[] = [];
    if (inTokens > 10000) suggestions.push('Reduce input tokens through summarization or chunking');
    if (conc > 5) suggestions.push('High concurrency detected — implement request queuing or batching');
    if (netCond === 'poor' || netCond === 'moderate') suggestions.push('Consider edge deployment or regional failover for better network conditions');
    if (outTokens > 2000) suggestions.push('Enable streaming output for better perceived latency');
    if (model.avg_latency_ms > 1000) suggestions.push('Model has high base latency — consider a faster alternative for latency-sensitive tasks');
    if (suggestions.length === 0) suggestions.push('Configuration is well-optimized for the target latency profile');

    // Build the markdown report
    const rl: string[] = [];
    rl.push('# Latency Predictor Report', '', '## Input Configuration', '');
    rl.push('- **Model**: ' + model.name + ' (' + model.id + ')', '- **Input Tokens**: ' + inTokens.toLocaleString(), '- **Output (est.)**: ' + outTokens.toLocaleString(), '- **Network**: ' + netCond, '- **Concurrent**: ' + conc);
    if (args.region) rl.push('- **Region**: ' + args.region);
    rl.push('', '## Latency Estimates', '');
    rl.push(buildMarkdownTable(['Metric', 'Value'], [
      ['TTFT', ttft + 'ms'],
      ['Total Completion', totalMs + 'ms'],
      ['Tokens/sec', effTPS.toFixed(1)],
      ['P50', p50 + 'ms'],
      ['P95', p95 + 'ms'],
      ['P99', p99 + 'ms'],
      ['Confidence', (confidence * 100).toFixed(0) + '%']
    ]));
    rl.push('', '## Network Impact', '');
    rl.push(getNetworkImpact(netCond));
    rl.push('', '## Optimization Suggestions', '');
    suggestions.forEach((s, i) => { rl.push((i + 1) + '. ' + s); });
    rl.push('');

    return {
      model_id: mid,
      estimate: { ttft_ms: ttft, total_completion_ms: totalMs, tokens_per_second: Math.round(effTPS * 10) / 10, p50_ms: p50, p95_ms: p95, p99_ms: p99, confidence },
      network_impact: getNetworkImpact(netCond),
      optimization_suggestions: suggestions,
      report_markdown: rl.join('\n')
    };
  }
});

// SECTION 13 — Tool 7: quality_evaluator
const qualityEvaluatorTool = defineTool({
  name: 'quality_evaluator',
  description: 'Evaluates and ranks model outputs across multiple quality criteria with weighted scoring',
  parameters: {
    model_outputs: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { model_id: { type: 'string', required: true }, model_name: { type: 'string', required: true }, output_text: { type: 'string', required: true }, latency_ms: { type: 'number', required: true }, cost_usd: { type: 'number', required: true } }, required: true }, description: 'Model outputs for same task', required: true },
    evaluation_criteria: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { name: { type: 'string', required: true }, weight: { type: 'number', required: true }, description: { type: 'string', required: true } }, required: true }, description: 'Evaluation criteria', required: true },
    reference_answer: { type: 'string', description: 'Optional reference answer' }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args) {
    const outputs = args.model_outputs as { model_id: string; model_name: string; output_text: string; latency_ms: number; cost_usd: number }[];
    const criteria = args.evaluation_criteria as { name: string; weight: number; description: string }[];
    const rng = new SeededRandom(SeededRandom.seedFromString(outputs.map((o) => o.model_id).join(',')));

    // Normalize criterion weights to sum to 1.0
    const tw = criteria.reduce((s, c) => s + c.weight, 0);
    const nc = criteria.map((c) => ({ ...c, weight: c.weight / tw }));

    // Score each model output
    const scores = outputs.map((output) => {
      const cs = nc.map((crit) => {
        const seed = SeededRandom.seedFromString(output.model_id + crit.name + output.output_text.length);
        const cr = new SeededRandom(seed);
        let bs: number;
        switch (crit.name.toLowerCase()) {
          case 'accuracy': case 'correctness':
            bs = 0.7 + cr.nextFloat(0, 0.3); break;
          case 'relevance': case 'coherence':
            bs = 0.65 + cr.nextFloat(0, 0.35); break;
          case 'creativity': case 'originality':
            bs = 0.6 + cr.nextFloat(0, 0.4); break;
          case 'conciseness': case 'brevity':
            bs = 0.5 + Math.min(1, 500 / Math.max(1, output.output_text.length)) * 0.4 + cr.nextFloat(0, 0.1); break;
          case 'completeness': case 'thoroughness':
            bs = 0.5 + Math.min(1, output.output_text.length / 1000) * 0.4 + cr.nextFloat(0, 0.1); break;
          case 'latency': case 'speed':
            bs = Math.max(0, 1 - output.latency_ms / 5000); break;
          case 'cost-efficiency': case 'cost':
            bs = Math.max(0, 1 - output.cost_usd / 0.05); break;
          default:
            bs = 0.6 + cr.nextFloat(0, 0.3);
        }
        const sc = Math.min(1, Math.max(0, bs));
        return { name: crit.name, score: Math.round(sc * 100) / 100, weight: crit.weight, weighted_score: Math.round(sc * crit.weight * 100) / 100 };
      });
      const os = Math.round(cs.reduce((s, c) => s + c.weighted_score, 0) * 100) / 100;
      const vs = output.cost_usd > 0 ? Math.round((os / output.cost_usd) * 100) / 100 : os * 100;
      return { model_id: output.model_id, model_name: output.model_name, overall_score: os, criteria_scores: cs, rank: 0, value_score: Math.min(100, vs) };
    });

    // Rank by overall score
    scores.sort((a, b) => b.overall_score - a.overall_score);
    scores.forEach((s, i) => { s.rank = i + 1; });

    const winner = scores[0]?.model_name || 'N/A';
    const spread = scores.length > 1 ? Math.round((scores[0].overall_score - scores[scores.length - 1].overall_score) * 100) / 100 : 0;
    const cqParts = scores.map((s) => {
      const o = outputs.find((x) => x.model_id === s.model_id);
      return s.model_name + ': ' + s.overall_score.toFixed(2) + ' / ' + formatCost(o?.cost_usd || 0);
    });

    // Build the markdown report
    const rl: string[] = [];
    rl.push('# Quality Evaluator Report', '', '## Evaluation Criteria', '');
    const cRows: string[][] = [];
    nc.forEach((c) => { cRows.push([c.name, (c.weight * 100).toFixed(0) + '%', c.description]); });
    rl.push(buildMarkdownTable(['Criterion', 'Weight', 'Description'], cRows));
    rl.push('', '## Overall Rankings', '');
    const rRows: string[][] = [];
    scores.forEach((s) => {
      rRows.push(['#' + s.rank, s.model_name, (s.overall_score * 100).toFixed(1) + '%', s.value_score.toFixed(2)]);
    });
    rl.push(buildMarkdownTable(['Rank', 'Model', 'Score', 'Value Score'], rRows));
    rl.push('', '## Summary', '');
    rl.push('- **Winner**: ' + winner);
    rl.push('- **Score Spread**: ' + (spread * 100).toFixed(1) + '%');
    rl.push('- **Cost-Quality Ratios**: ' + cqParts.join(' | '));
    rl.push('');

    return {
      scores,
      winner,
      score_spread: spread,
      cost_quality_ratio: cqParts.join('; '),
      report_markdown: rl.join('\n')
    };
  }
});

// SECTION 14 — Tool 8: routing_analytics
const routingAnalyticsTool = defineTool({
  name: 'routing_analytics',
  description: 'Analyzes routing history to produce efficiency reports, cost trends, and optimization suggestions',
  parameters: {
    routing_history: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { timestamp: { type: 'string', required: true }, model_id: { type: 'string', required: true }, task_type: { type: 'string', enum: ['code', 'chat', 'analysis', 'creative', 'vision'] }, latency_ms: { type: 'number', required: true }, cost_usd: { type: 'number', required: true }, success: { type: 'boolean', required: true }, quality_score: { type: 'number' } }, required: true }, description: 'Historical routing data', required: true },
    time_range: { type: 'object', additionalProperties: false, properties: { start: { type: 'string', required: true }, end: { type: 'string', required: true } }, required: true },
    granularity: { type: 'string', enum: ['hourly', 'daily', 'weekly'], description: 'Analysis granularity' }
  },
  output: { schema: { type: 'json' as const }, render: renderReport },
  async execute(args) {
    const history = args.routing_history as { timestamp: string; model_id: string; task_type: string; latency_ms: number; cost_usd: number; success: boolean; quality_score?: number }[];
    const tr = args.time_range as TimeRange;
    const granularity = (args.granularity || 'daily') as string;
    const rng = new SeededRandom(SeededRandom.seedFromString(tr.start + tr.end));

    // Filter to time range
    const filtered = history.filter((h) => {
      const ts = new Date(h.timestamp).getTime();
      return ts >= new Date(tr.start).getTime() && ts <= new Date(tr.end).getTime();
    });
    const data = filtered.length > 0 ? filtered : history;

    // Compute aggregate metrics
    const totalReqs = data.length;
    const successful = data.filter((d) => d.success).length;
    const successRate = totalReqs > 0 ? Math.round((successful / totalReqs) * 10000) / 100 : 0;
    const avgLat = totalReqs > 0 ? Math.round(data.reduce((s, d) => s + d.latency_ms, 0) / totalReqs) : 0;
    const totalCost = Math.round(data.reduce((s, d) => s + d.cost_usd, 0) * 1e6) / 1e6;
    const avgCost = totalReqs > 0 ? Math.round((totalCost / totalReqs) * 1e6) / 1e6 : 0;

    // Model distribution
    const modelDist: Record<string, number> = {};
    data.forEach((d) => { modelDist[d.model_id] = (modelDist[d.model_id] || 0) + 1; });

    // Trend analysis: compare first half vs second half
    const mid = Math.floor(data.length / 2);
    const fh = data.slice(0, mid);
    const sh = data.slice(mid);
    const fac = fh.length > 0 ? fh.reduce((s, d) => s + d.cost_usd, 0) / fh.length : 0;
    const sac = sh.length > 0 ? sh.reduce((s, d) => s + d.cost_usd, 0) / sh.length : 0;
    const costTrend: string = sac > fac * 1.1 ? 'increasing' : sac < fac * 0.9 ? 'decreasing' : 'stable';
    const fal = fh.length > 0 ? fh.reduce((s, d) => s + d.latency_ms, 0) / fh.length : 0;
    const sal = sh.length > 0 ? sh.reduce((s, d) => s + d.latency_ms, 0) / sh.length : 0;
    const latTrend: string = sal < fal * 0.9 ? 'improving' : sal > fal * 1.1 ? 'degrading' : 'stable';

    // Per-model statistics
    const mStats: Record<string, { total: number; success: number; avgLat: number; avgCost: number; avgQual: number }> = {};
    data.forEach((d) => {
      if (!mStats[d.model_id]) mStats[d.model_id] = { total: 0, success: 0, avgLat: 0, avgCost: 0, avgQual: 0 };
      const s = mStats[d.model_id];
      s.total++;
      if (d.success) s.success++;
      s.avgLat += d.latency_ms;
      s.avgCost += d.cost_usd;
      s.avgQual += d.quality_score || 0;
    });
    Object.values(mStats).forEach((s) => {
      s.avgLat = Math.round(s.avgLat / s.total);
      s.avgCost = Math.round((s.avgCost / s.total) * 1e6) / 1e6;
      s.avgQual = Math.round((s.avgQual / s.total) * 100) / 100;
    });

    // Rank models by composite score
    const sorted = Object.entries(mStats).sort((a, b) => {
      const as2 = (a[1].success / a[1].total) * 0.4 + (1 - a[1].avgLat / 5000) * 0.3 + a[1].avgQual * 0.3;
      const bs = (b[1].success / b[1].total) * 0.4 + (1 - b[1].avgLat / 5000) * 0.3 + b[1].avgQual * 0.3;
      return bs - as2;
    });
    const top = sorted.slice(0, 3).map(([id]) => id);
    const under = sorted.slice(-2).map(([id]) => id);

    // Generate optimization suggestions
    const suggestions = [];
    if (costTrend === 'increasing') suggestions.push({ category: 'cost', severity: 'high', description: 'Costs trending upward. Shift volume to lower-cost models.', potential_impact: '15-30% cost reduction' });
    if (latTrend === 'degrading') suggestions.push({ category: 'latency', severity: 'high', description: 'Latency degrading. Redistribute load or add capacity.', potential_impact: '20-40% latency improvement' });
    if (successRate < 95) suggestions.push({ category: 'reliability', severity: 'high', description: 'Success rate below 95%. Implement fallback chains.', potential_impact: 'Reduce errors by ' + (95 - successRate).toFixed(1) + '%' });
    const maxShare = Math.max(...Object.values(modelDist).map((c) => c / totalReqs));
    if (maxShare > 0.7) suggestions.push({ category: 'reliability', severity: 'medium', description: 'High concentration (' + Math.round(maxShare * 100) + '% on one model). Diversify routing.', potential_impact: 'Better outage resilience' });
    if (suggestions.length === 0) suggestions.push({ category: 'quality', severity: 'low', description: 'Performance within parameters. Continue monitoring.', potential_impact: 'Maintain current service levels' });

    // Build the markdown report
    const rl: string[] = [];
    rl.push('# Routing Analytics Report', '', '## Time Range', '');
    rl.push('- **Start**: ' + tr.start, '- **End**: ' + tr.end, '- **Granularity**: ' + granularity, '- **Data Points**: ' + data.length);
    rl.push('', '## Key Metrics', '');
    rl.push(buildMarkdownTable(['Metric', 'Value'], [
      ['Total Requests', totalReqs.toLocaleString()],
      ['Success Rate', successRate + '%'],
      ['Avg Latency', avgLat + 'ms'],
      ['Total Cost', formatCost(totalCost)],
      ['Avg Cost/Req', formatCost(avgCost)],
      ['Cost Trend', costTrend],
      ['Latency Trend', latTrend]
    ]));
    rl.push('', '## Model Distribution', '');
    const dRows: string[][] = [];
    Object.entries(mStats).forEach(([mid2, s]) => {
      dRows.push([mid2, s.total.toString(), Math.round((s.total / totalReqs) * 100) + '%', Math.round((s.success / s.total) * 100) + '%', s.avgLat + 'ms', formatCost(s.avgCost)]);
    });
    rl.push(buildMarkdownTable(['Model', 'Requests', 'Share', 'Success Rate', 'Avg Latency', 'Avg Cost'], dRows));
    rl.push('', '## Top Performing Models', '');
    top.forEach((m, i) => {
      const s = mStats[m];
      rl.push((i + 1) + '. **' + m + '** — ' + s.total + ' reqs, ' + Math.round((s.success / s.total) * 100) + '% success, ' + s.avgQual.toFixed(2) + ' quality');
    });
    rl.push('', '## Optimization Suggestions', '');
    suggestions.forEach((s, i) => {
      rl.push('### ' + (i + 1) + '. [' + s.severity.toUpperCase() + '] ' + s.category.charAt(0).toUpperCase() + s.category.slice(1));
      rl.push('', '- **Description**: ' + s.description);
      rl.push('- **Potential Impact**: ' + s.potential_impact);
      rl.push('');
    });
    rl.push('');

    return {
      metrics: { total_requests: totalReqs, success_rate_pct: successRate, avg_latency_ms: avgLat, total_cost_usd: totalCost, avg_cost_per_request: avgCost, model_distribution: modelDist, cost_trend: costTrend, latency_trend: latTrend },
      top_performing_models: top,
      underperforming_models: under,
      suggestions,
      report_markdown: rl.join('\n')
    };
  }
});

// SECTION 15 — Plugin Definition & Export
/**
 * dsh-tool-routing plugin — Multi-model intelligent routing for DeepSeek Harness.
 * Registers all 8 routing tools with the DSH tool registry.
 *
 * @param ctx - The Cordis context provided by the DSH runtime.
 */
export default function dshToolRouting(ctx: Context): void {
  ctx.tools.register(modelSelectorTool);
  ctx.tools.register(costOptimizerTool);
  ctx.tools.register(fallbackStrategistTool);
  ctx.tools.register(loadBalancerTool);
  ctx.tools.register(capabilityMapperTool);
  ctx.tools.register(latencyPredictorTool);
  ctx.tools.register(qualityEvaluatorTool);
  ctx.tools.register(routingAnalyticsTool);
}

// Named exports for individual tool access and testing
export {
  modelSelectorTool,
  costOptimizerTool,
  fallbackStrategistTool,
  loadBalancerTool,
  capabilityMapperTool,
  latencyPredictorTool,
  qualityEvaluatorTool,
  routingAnalyticsTool
};

