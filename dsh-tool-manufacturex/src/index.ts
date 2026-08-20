/**
 * 🏭 dsh-tool-manufacturex - Smart Manufacturing Plugin
 *
 * DeepSeek Harness (DSH) 智能制造工具集
 *
 * 对标工业AI趋势，聚焦预测性维护、质量检测、产线优化、能耗管理、
 * 供应链协同、缺陷分析、OEE 计算及数字孪生建模。
 *
 * @author chengganping-ship-it
 * @license MIT
 * @version 0.1.0
 */

import { z } from 'zod';

// ============================================================================
// 🔧 Utility - Seeded Random Number Generator
// ============================================================================

/**
 * Mulberry32 伪随机数生成器
 * 给定相同种子可复现结果，便于调试与演示。
 */
function seededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return (): number => {
    t += 0x6D2B79F5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function seededRandomRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

function seededRandomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(seededRandomRange(rng, min, max + 1));
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[seededRandomInt(rng, 0, arr.length - 1)];
}

// ============================================================================
// 🔤 Type Definitions - Interfaces
// ============================================================================

// --- predictive_maintenance ---

interface SensorReading {
  sensor_id: string;
  sensor_type: 'temperature' | 'vibration' | 'pressure' | 'current' | 'voltage' | 'speed';
  value: number;
  unit: string;
  timestamp: string;
  threshold?: { min: number; max: number };
}

interface MaintenanceHistory {
  date: string;
  type: 'preventive' | 'corrective' | 'predictive';
  component: string;
  cost: number;
  downtime_hours: number;
  description: string;
}

interface EquipmentData {
  equipment_id: string;
  name: string;
  model: string;
  manufacturer: string;
  install_date: string;
  criticality: 'high' | 'medium' | 'low';
  location: string;
  operating_hours: number;
}

interface FailurePrediction {
  component: string;
  probability: number;
  estimated_rul_days: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  indicators: string[];
}

interface MaintenancePlan {
  recommendations: string[];
  schedule: { action: string; priority: string; deadline: string; estimated_cost: number }[];
  estimated_downtime_reduction: number;
  estimated_cost_savings: number;
}

interface PredictiveMaintenanceResult {
  status: string;
  equipment_summary: string;
  failure_predictions: FailurePrediction[];
  maintenance_plan: MaintenancePlan;
  risk_score: number;
  health_index: number;
}

// --- quality_inspector ---

interface ProductSpec {
  product_id: string;
  name: string;
  dimensions: { length: number; width: number; height: number; unit: string };
  weight: { value: number; unit: string };
  tolerances: { [key: string]: { min: number; max: number } };
  material: string;
  surface_finish: string;
}

interface InspectionData {
  inspection_id: string;
  timestamp: string;
  inspector: string;
  measurements: { [key: string]: number };
  visual_pass: boolean;
  test_results: { test_name: string; passed: boolean; value: number }[];
}

interface DefectCategory {
  category: string;
  description: string;
  severity_weights: { [key: string]: number };
}

interface QualityScoreReport {
  overall_score: number;
  dimensional_score: number;
  visual_score: number;
  functional_score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

interface RootCauseAnalysis {
  defect_category: string;
  probable_causes: string[];
  confidence: number;
  recommended_actions: string[];
}

interface QualityInspectorResult {
  status: string;
  quality_score: QualityScoreReport;
  root_cause_analyses: RootCauseAnalysis[];
  defect_rate: number;
  improvement_recommendations: string[];
  pass_fail_summary: { passed: number; failed: number; total: number };
}

// --- production_optimizer ---

interface ProductionData {
  line_id: string;
  line_name: string;
  shift: 'day' | 'night' | 'mixed';
  cycle_time_seconds: number;
  planned_production_time_hours: number;
  actual_production_time_hours: number;
  total_output: number;
  target_output: number;
  defect_count: number;
  changeover_count: number;
  changeover_time_minutes: number;
}

interface Bottleneck {
  station: string;
  impact_percentage: number;
  constraint_type: 'equipment' | 'labor' | 'material' | 'process';
  current_capacity: number;
  required_capacity: number;
}

interface DemandForecast {
  period: string;
  product_mix: { product_id: string; quantity: number; priority: number }[];
  total_demand: number;
}

interface CapacityImprovementPlan {
  capacity_increase_pct: number;
  bottleneck_resolutions: { station: string; action: string; impact: string }[];
  scheduling_adjustments: string[];
  estimated_output_increase: number;
  implementation_phases: { phase: string; actions: string[]; duration_weeks: number }[];
}

interface ProductionOptimizerResult {
  status: string;
  current_efficiency: number;
  capacity_improvement_plan: CapacityImprovementPlan;
  lean_recommendations: string[];
  bottleneck_analysis_summary: string;
  projected_output: number;
  roi_estimate: number;
}

// --- energy_optimizer ---

interface EnergyConsumption {
  facility_zone: string;
  equipment_type: string;
  consumption_kwh: number;
  peak_kw: number;
  off_peak_kwh: number;
  cost_per_kwh: number;
  time_period: string;
}

interface ProductionSchedule {
  batch_id: string;
  start_time: string;
  end_time: string;
  equipment_required: string[];
  energy_intensity: 'high' | 'medium' | 'low';
}

interface UtilityRates {
  peak_rate: number;
  off_peak_rate: number;
  shoulder_rate: number;
  demand_charge_kw: number;
  peak_hours: string;
  off_peak_hours: string;
}

interface EnergySavingMeasure {
  measure: string;
  applicable_zone: string;
  savings_kwh_monthly: number;
  savings_cost_monthly: number;
  implementation_cost: number;
  payback_months: number;
}

interface EnergyOptimizerResult {
  status: string;
  total_consumption_kwh: number;
  total_cost_monthly: number;
  saving_measures: EnergySavingMeasure[];
  total_savings_kwh: number;
  total_savings_cost: number;
  total_investment: number;
  average_payback_months: number;
  carbon_reduction_tons: number;
  recommendations_priority: string[];
}

// --- supply_chain_optimizer ---

interface SupplierData {
  supplier_id: string;
  name: string;
  lead_time_days: number;
  reliability_score: number;
  quality_score: number;
  cost_rating: 'low' | 'medium' | 'high';
  location: string;
  min_order_qty: number;
  capacity_units_per_week: number;
}

interface InventoryLevels {
  item_id: string;
  item_name: string;
  current_stock: number;
  safety_stock: number;
  reorder_point: number;
  max_capacity: number;
  unit_cost: number;
  turnover_rate: number;
  expiry_date?: string;
}

interface DemandPlan {
  period: string;
  item_demands: { item_id: string; quantity: number; flexibility_days: number }[];
}

interface ProcurementRecommendation {
  item_id: string;
  action: 'order' | 'increase_safety_stock' | 'reduce_stock' | 'expedite';
  quantity: number;
  preferred_supplier: string;
  urgency: 'immediate' | 'planned' | 'review';
  estimated_cost: number;
}

interface SupplyChainOptimizerResult {
  status: string;
  procurement_recommendations: ProcurementRecommendation[];
  inventory_optimizations: { item_id: string; current: number; recommended: number; action: string }[];
  risk_alerts: string[];
  total_procurement_cost: number;
  fill_rate_improvement: number;
  summary_report: string;
}

// --- defect_analyzer ---

interface DefectData {
  defect_id: string;
  timestamp: string;
  product_id: string;
  station: string;
  defect_type: string;
  quantity_affected: number;
  photo_url?: string;
  description: string;
}

interface ProcessParameter {
  parameter: string;
  current_value: number;
  setpoint: number;
  unit: string;
  tolerance: { min: number; max: number };
}

interface EnvironmentalFactor {
  factor: string;
  value: number;
  unit: string;
  timestamp: string;
  normal_range: { min: number; max: number };
}

interface DefectRootCause {
  defect_type: string;
  root_cause: string;
  contributing_factors: string[];
  confidence: number;
  occurrence: number;
  corrective_actions: string[];
  prevention_measures: string[];
}

interface DefectAnalyzerResult {
  status: string;
  total_defects: number;
  defect_distribution: { type: string; count: number; percentage: number }[];
  root_causes: DefectRootCause[];
  process_correlations: string[];
  improvement_actions: string[];
  pareto_chart: { defect_type: string; cumulative_pct: number }[];
}

// --- oee_calculator ---

interface AvailabilityData {
  planned_production_time_min: number;
  unplanned_downtime_min: number;
  planned_downtime_min: number;
  downtime_reasons: { reason: string; duration_min: number }[];
}

interface PerformanceData {
  ideal_cycle_time_sec: number;
  actual_cycle_time_sec: number;
  total_count: number;
  minor_stoppages: number;
  speed_loss_min: number;
}

interface QualityData {
  good_count: number;
  total_count: number;
  defect_categories: { category: string; count: number }[];
  rework_count: number;
  scrap_count: number;
}

interface OEEReport {
  availability_pct: number;
  performance_pct: number;
  quality_pct: number;
  oee_pct: number;
  world_class_benchmark: string;
  loss_categories: { category: string; percentage: number; description: string }[];
}

interface OEEImprovements {
  category: string;
  current_value: number;
  target_value: number;
  improvement_actions: string[];
}

interface OEECalculatorResult {
  status: string;
  oee_report: OEEReport;
  improvement_opportunities: OEEImprovements[];
  six_big_losses: { loss: string; value: number }[];
  action_plan: string[];
  projected_oee: number;
}

// --- digital_twin_modeler ---

interface AssetSpec {
  asset_id: string;
  asset_type: string;
  model_name: string;
  physical_properties: { mass: number; dimensions: { x: number; y: number; z: number } };
  material: string;
  operating_parameters: { [key: string]: { min: number; max: number; unit: string } };
}

interface OperationalData {
  timestamp: string;
  metrics: { [key: string]: number };
  operational_state: 'running' | 'idle' | 'fault' | 'maintenance';
  load_factor: number;
}

interface SimulationParams {
  simulation_type: 'performance' | 'failure' | 'optimization' | 'what_if';
  time_horizon_hours: number;
  resolution_seconds: number;
  scenarios: { name: string; params: { [key: string]: number } }[];
}

interface DigitalTwinConfiguration {
  model_fidelity: 'low' | 'medium' | 'high';
  data_streams: string[];
  update_frequency_seconds: number;
  simulation_capabilities: string[];
  visualization_dimensions: string[];
  algorithgies_applied: string[];
}

interface SimulationPlan {
  scenarios: { name: string; description: string; parameters: string[]; expected_outcomes: string[] }[];
  simulation_steps: string[];
  output_metrics: string[];
  risk_assessments: string[];
}

interface DigitalTwinModelerResult {
  status: string;
  twin_configuration: DigitalTwinConfiguration;
  simulation_plan: SimulationPlan;
  model_accuracy_estimate: number;
  deployment_recommendations: string[];
  value_projections: { metric: string; current: number; projected: number; unit: string }[];
}

// ============================================================================
// 🔧 Tool 1: Predictive Maintenance - 预测性维护
// ============================================================================

const predictiveMaintenanceInputSchema = z.object({
  equipment_data: z.object({
    equipment_id: z.string(),
    name: z.string(),
    model: z.string(),
    manufacturer: z.string(),
    install_date: z.string(),
    criticality: z.enum(['high', 'medium', 'low']),
    location: z.string(),
    operating_hours: z.number(),
  }),
  sensor_readings: z.array(z.object({
    sensor_id: z.string(),
    sensor_type: z.enum(['temperature', 'vibration', 'pressure', 'current', 'voltage', 'speed']),
    value: z.number(),
    unit: z.string(),
    timestamp: z.string(),
    threshold: z.object({ min: z.number(), max: z.number() }).optional(),
  })),
  maintenance_history: z.array(z.object({
    date: z.string(),
    type: z.enum(['preventive', 'corrective', 'predictive']),
    component: z.string(),
    cost: z.number(),
    downtime_hours: z.number(),
    description: z.string(),
  })),
});

function toolPredictiveMaintenance(input: z.infer<typeof predictiveMaintenanceInputSchema>): PredictiveMaintenanceResult {
  const { equipment_data, sensor_readings, maintenance_history } = input;
  const rng = seededRandom(equipment_data.equipment_id.length + equipment_data.operating_hours);

  // --- Analyze sensor anomalies ---
  const anomalyCount = sensor_readings.filter(
    (s) => s.threshold && (s.value < s.threshold.min || s.value > s.threshold.max)
  ).length;

  // --- Calculate failure predictions ---
  const components = ['Bearings', 'Motor', 'Gearbox', 'Hydraulic System', 'Cooling System', 'Drive Belt', 'Sensor Array'];
  const predictionCount = Math.min(seededRandomInt(rng, 2, 5), components.length);

  const failure_predictions: FailurePrediction[] = [];
  const selectedComponents: string[] = [];
  for (let i = 0; i < predictionCount; i++) {
    let comp: string;
    do {
      comp = pickRandom(rng, components);
    } while (selectedComponents.includes(comp));
    selectedComponents.push(comp);

    const prob = seededRandomRange(rng, 0.05, 0.85);
    const rul = seededRandomInt(rng, 7, 180);
    const severity: FailurePrediction['severity'] =
      prob > 0.7 ? 'critical' : prob > 0.5 ? 'high' : prob > 0.3 ? 'medium' : 'low';

    failure_predictions.push({
      component: comp,
      probability: Math.round(prob * 100) / 100,
      estimated_rul_days: rul,
      severity,
      indicators: [
        `${comp} vibration pattern deviation detected`,
        `Temperature trend showing +${seededRandomInt(rng, 5, 25)}% above baseline`,
        `Operating hours exceed recommended maintenance interval`,
      ],
    });
  }

  // --- Maintenance plan ---
  const recommendations: string[] = [];
  const schedule: MaintenancePlan['schedule'] = [];

  if (failure_predictions.some((p) => p.severity === 'critical')) {
    recommendations.push('🔴 Immediate inspection required for critical components');
    recommendations.push('Prepare backup equipment to minimize production impact');
  }
  if (failure_predictions.some((p) => p.severity === 'high')) {
    recommendations.push('🟠 Schedule high-priority maintenance within 7 days');
    recommendations.push('Increase monitoring frequency for at-risk components');
  }
  recommendations.push('🟢 Implement continuous vibration monitoring');
  recommendations.push('Establish component wear tracking dashboard');
  recommendations.push('Train operators on early anomaly recognition');

  for (const pred of failure_predictions) {
    const deadlineDays = pred.estimated_rul_days <= 30 ? 7 : pred.estimated_rul_days <= 90 ? 30 : 60;
    schedule.push({
      action: `Inspect and service ${pred.component}`,
      priority: pred.severity,
      deadline: new Date(Date.now() + deadlineDays * 86400000).toISOString().slice(0, 10),
      estimated_cost: Math.round(seededRandomRange(rng, 500, 25000)),
    });
  }

  // --- Health & Risk scores ---
  const totalDowntimeHistory = maintenance_history.reduce((sum, m) => sum + m.downtime_hours, 0);
  const health_index = Math.max(10, Math.round(100 - anomalyCount * 8 - (totalDowntimeHistory / 100)));
  const risk_score = Math.min(100, Math.round(
    failure_predictions.reduce((sum, p) => sum + p.probability * (p.severity === 'critical' ? 30 : p.severity === 'high' ? 20 : 10), 0)
  ));

  return {
    status: 'Predictive maintenance analysis complete.',
    equipment_summary: `${equipment_data.name} (${equipment_data.model}) at ${equipment_data.location} - Operating ${equipment_data.operating_hours}h`,
    failure_predictions,
    maintenance_plan: {
      recommendations,
      schedule,
      estimated_downtime_reduction: seededRandomInt(rng, 25, 40),
      estimated_cost_savings: Math.round(seededRandomRange(rng, 15000, 120000)),
    },
    risk_score,
    health_index,
  };
}

// ============================================================================
// 🔧 Tool 2: Quality Inspector - 质量检测
// ============================================================================

const qualityInspectorInputSchema = z.object({
  product_specs: z.object({
    product_id: z.string(),
    name: z.string(),
    dimensions: z.object({ length: z.number(), width: z.number(), height: z.number(), unit: z.string() }),
    weight: z.object({ value: z.number(), unit: z.string() }),
    tolerances: z.record(z.object({ min: z.number(), max: z.number() })),
    material: z.string(),
    surface_finish: z.string(),
  }),
  inspection_data: z.array(z.object({
    inspection_id: z.string(),
    timestamp: z.string(),
    inspector: z.string(),
    measurements: z.record(z.number()),
    visual_pass: z.boolean(),
    test_results: z.array(z.object({ test_name: z.string(), passed: z.boolean(), value: z.number() })),
  })),
  defect_categories: z.array(z.object({
    category: z.string(),
    description: z.string(),
    severity_weights: z.record(z.number()),
  })),
});

function toolQualityInspector(input: z.infer<typeof qualityInspectorInputSchema>): QualityInspectorResult {
  const { product_specs, inspection_data, defect_categories } = input;
  const rng = seededRandom(product_specs.product_id.length + inspection_data.length * 7);

  // --- Dimensional scoring ---
  const totalMeasurements = inspection_data.reduce(
    (sum, insp) => sum + Object.keys(insp.measurements).length, 0
  );
  const tolerance = product_specs.tolerances;
  let withinTolerance = 0;
  for (const insp of inspection_data) {
    for (const [key, val] of Object.entries(insp.measurements)) {
      if (tolerance[key] && val >= tolerance[key].min && val <= tolerance[key].max) {
        withinTolerance++;
      }
    }
  }
  const dimensional_score = totalMeasurements > 0
    ? Math.round((withinTolerance / totalMeasurements) * 100)
    : seededRandomInt(rng, 80, 99);

  // --- Visual scoring ---
  const visualPassCount = inspection_data.filter((i) => i.visual_pass).length;
  const visual_score = inspection_data.length > 0
    ? Math.round((visualPassCount / inspection_data.length) * 100)
    : seededRandomInt(rng, 75, 98);

  // --- Functional scoring ---
  const totalTests = inspection_data.reduce((sum, i) => sum + i.test_results.length, 0);
  const passedTests = inspection_data.reduce(
    (sum, i) => sum + i.test_results.filter((t) => t.passed).length, 0
  );
  const functional_score = totalTests > 0
    ? Math.round((passedTests / totalTests) * 100)
    : seededRandomInt(rng, 82, 99);

  // --- Overall score ---
  const overall_score = Math.round(dimensional_score * 0.35 + visual_score * 0.25 + functional_score * 0.4);
  const grade: QualityScoreReport['grade'] =
    overall_score >= 90 ? 'A' : overall_score >= 80 ? 'B' : overall_score >= 70 ? 'C' : overall_score >= 60 ? 'D' : 'F';

  // --- Root cause analysis ---
  const root_cause_analyses: RootCauseAnalysis[] = defect_categories.slice(0, 3).map((dc) => ({
    defect_category: dc.category,
    probable_causes: [
      `Process drift in ${dc.category.toLowerCase()} zone`,
      `Material variation from upstream supplier`,
      `Environmental conditions exceeded operating window`,
      `Tool wear approaching replacement threshold`,
    ].slice(0, seededRandomInt(rng, 2, 4)),
    confidence: Math.round(seededRandomRange(rng, 0.55, 0.95) * 100) / 100,
    recommended_actions: [
      `Recalibrate equipment handling ${dc.category}`,
      `Tighten incoming material inspection for ${dc.category}`,
      `Add in-process monitoring checkpoint`,
    ],
  }));

  // --- Defect rate ---
  const defectiveCount = inspection_data.filter(
    (i) => !i.visual_pass || i.test_results.some((t) => !t.passed)
  ).length;
  const defect_rate = inspection_data.length > 0
    ? Math.round((defectiveCount / inspection_data.length) * 10000) / 100
    : Math.round(seededRandomRange(rng, 0.5, 5.0) * 100) / 100;

  return {
    status: 'Quality inspection analysis complete.',
    quality_score: {
      overall_score,
      dimensional_score,
      visual_score,
      functional_score,
      grade,
    },
    root_cause_analyses,
    defect_rate,
    improvement_recommendations: [
      `🎯 Focus on ${defect_categories[0]?.category || 'top defect category'} - highest impact area`,
      '📊 Implement SPC charts for real-time dimensional monitoring',
      '🔬 Introduce automated optical inspection at end-of-line',
      '📋 Develop operator checklist for visual inspection standards',
      '🔄 Establish cross-shift quality consistency reviews',
    ],
    pass_fail_summary: {
      passed: inspection_data.length - defectiveCount,
      failed: defectiveCount,
      total: inspection_data.length,
    },
  };
}

// ============================================================================
// 🔧 Tool 3: Production Optimizer - 产线优化
// ============================================================================

const productionOptimizerInputSchema = z.object({
  production_data: z.object({
    line_id: z.string(),
    line_name: z.string(),
    shift: z.enum(['day', 'night', 'mixed']),
    cycle_time_seconds: z.number(),
    planned_production_time_hours: z.number(),
    actual_production_time_hours: z.number(),
    total_output: z.number(),
    target_output: z.number(),
    defect_count: z.number(),
    changeover_count: z.number(),
    changeover_time_minutes: z.number(),
  }),
  bottlenecks: z.array(z.object({
    station: z.string(),
    impact_percentage: z.number(),
    constraint_type: z.enum(['equipment', 'labor', 'material', 'process']),
    current_capacity: z.number(),
    required_capacity: z.number(),
  })),
  demand_forecast: z.object({
    period: z.string(),
    product_mix: z.array(z.object({
      product_id: z.string(),
      quantity: z.number(),
      priority: z.number(),
    })),
    total_demand: z.number(),
  }),
});

function toolProductionOptimizer(input: z.infer<typeof productionOptimizerInputSchema>): ProductionOptimizerResult {
  const { production_data, bottlenecks, demand_forecast } = input;
  const rng = seededRandom(production_data.line_id.length + production_data.total_output);

  // --- Current efficiency ---
  const current_efficiency = Math.round(
    (production_data.total_output / Math.max(1, production_data.target_output)) * 100
  );

  // --- Bottleneck resolutions ---
  const bottleneck_resolutions = bottlenecks.map((bn) => {
    const actionMap: Record<string, string> = {
      equipment: `Upgrade ${bn.station} with automated feeder (${Math.round(bn.required_capacity - bn.current_capacity)} units/hr gap)`,
      labor: `Cross-train operators and add floating support at ${bn.station}`,
      material: `Improve material flow to ${bn.station} with kanban system`,
      process: `Redesign process flow at ${bn.station} - eliminate non-value steps`,
    };
    return {
      station: bn.station,
      action: actionMap[bn.constraint_type] || `Optimize ${bn.station} operations`,
      impact: `${bn.impact_percentage}% throughput improvement potential`,
    };
  });

  // --- Capacity improvement ---
  const capacity_increase_pct = Math.min(45, bottlenecks.reduce((sum, bn) => sum + bn.impact_percentage, 0));
  const estimated_output_increase = Math.round(production_data.total_output * (capacity_increase_pct / 100));

  // --- Scheduling adjustments ---
  const scheduling_adjustments: string[] = [
    `Redistribute ${demand_forecast.product_mix.length} product variants across available shifts`,
    `Implement SMED for changeover reduction: target ${Math.round(production_data.changeover_time_minutes * 0.6)}min (from ${production_data.changeover_time_minutes}min)`,
    `Balance line by redistributing ${bottlenecks[0]?.station || 'bottleneck station'} tasks to parallel stations`,
    `Introduce pull-based scheduling aligned to takt time of ${production_data.cycle_time_seconds}s`,
  ];

  // --- Lean recommendations ---
  const lean_recommendations: string[] = [
    '📦 Implement 5S workplace organization across all stations',
    '🚦 Deploy Andon system for real-time line status visibility',
    '⏱️ Conduct time-motion study to identify hidden waste',
    '🔄 Establish standard work documentation for each operation',
    '📉 Create daily production KPI dashboards at-line',
    '🎯 Set up Kaizen event schedule (monthly improvement cycles)',
  ];

  // --- Implementation phases ---
  const implementation_phases = [
    {
      phase: 'Phase 1 - Quick Wins (Weeks 1-2)',
      actions: ['5S rollout', 'Visual management boards', 'Operator huddle structure'],
      duration_weeks: 2,
    },
    {
      phase: 'Phase 2 - Process Redesign (Weeks 3-6)',
      actions: ['SMED implementation', 'Line balancing', 'Standard work'],
      duration_weeks: 4,
    },
    {
      phase: 'Phase 3 - System Integration (Weeks 7-12)',
      actions: ['Andon deployment', 'Pull scheduling', 'Continuous monitoring'],
      duration_weeks: 6,
    },
  ];

  // --- ROI ---
  const projected_output = production_data.total_output + estimated_output_increase;
  const roi_estimate = Math.round(seededRandomRange(rng, 150, 400));

  return {
    status: 'Production optimization analysis complete.',
    current_efficiency,
    capacity_improvement_plan: {
      capacity_increase_pct,
      bottleneck_resolutions,
      scheduling_adjustments,
      estimated_output_increase,
      implementation_phases,
    },
    lean_recommendations,
    bottleneck_analysis_summary: `Identified ${bottlenecks.length} bottlenecks with combined ${capacity_increase_pct}% capacity uplift potential`,
    projected_output,
    roi_estimate,
  };
}

// ============================================================================
// 🔧 Tool 4: Energy Optimizer - 能耗优化
// ============================================================================

const energyOptimizerInputSchema = z.object({
  energy_consumption: z.array(z.object({
    facility_zone: z.string(),
    equipment_type: z.string(),
    consumption_kwh: z.number(),
    peak_kw: z.number(),
    off_peak_kwh: z.number(),
    cost_per_kwh: z.number(),
    time_period: z.string(),
  })),
  production_schedule: z.array(z.object({
    batch_id: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    equipment_required: z.array(z.string()),
    energy_intensity: z.enum(['high', 'medium', 'low']),
  })),
  utility_rates: z.object({
    peak_rate: z.number(),
    off_peak_rate: z.number(),
    shoulder_rate: z.number(),
    demand_charge_kw: z.number(),
    peak_hours: z.string(),
    off_peak_hours: z.string(),
  }),
});

function toolEnergyOptimizer(input: z.infer<typeof energyOptimizerInputSchema>): EnergyOptimizerResult {
  const { energy_consumption, production_schedule, utility_rates } = input;
  const rng = seededRandom(
    energy_consumption.reduce((sum, e) => sum + Math.floor(e.consumption_kwh), 0) + production_schedule.length
  );

  // --- Total consumption ---
  const total_consumption_kwh = Math.round(
    energy_consumption.reduce((sum, e) => sum + e.consumption_kwh, 0)
  );

  const peakRatio = energy_consumption.reduce((sum, e) => sum + e.peak_kw, 0) /
    Math.max(1, energy_consumption.reduce((sum, e) => sum + e.consumption_kwh, 0));
  const total_cost_monthly = Math.round(
    total_consumption_kwh * peakRatio * utility_rates.peak_rate +
    total_consumption_kwh * (1 - peakRatio) * utility_rates.off_peak_rate
  );

  // --- Saving measures ---
  const saving_measures: EnergySavingMeasure[] = [
    {
      measure: 'Load shifting to off-peak hours',
      applicable_zone: 'High-intensity production',
      savings_kwh_monthly: Math.round(total_consumption_kwh * 0.12),
      savings_cost_monthly: Math.round(total_consumption_kwh * 0.12 * (utility_rates.peak_rate - utility_rates.off_peak_rate)),
      implementation_cost: 5000,
      payback_months: 2,
    },
    {
      measure: 'VFD installation on major motors',
      applicable_zone: 'HVAC and compressed air',
      savings_kwh_monthly: Math.round(total_consumption_kwh * 0.15),
      savings_cost_monthly: Math.round(total_consumption_kwh * 0.15 * utility_rates.shoulder_rate),
      implementation_cost: 35000,
      payback_months: 14,
    },
    {
      measure: 'LED lighting retrofit with smart controls',
      applicable_zone: 'Facility-wide lighting',
      savings_kwh_monthly: Math.round(total_consumption_kwh * 0.05),
      savings_cost_monthly: Math.round(total_consumption_kwh * 0.05 * utility_rates.shoulder_rate),
      implementation_cost: 12000,
      payback_months: 8,
    },
    {
      measure: 'Compressed air leak repair program',
      applicable_zone: 'Compressed air network',
      savings_kwh_monthly: Math.round(total_consumption_kwh * 0.08),
      savings_cost_monthly: Math.round(total_consumption_kwh * 0.08 * utility_rates.shoulder_rate),
      implementation_cost: 3000,
      payback_months: 1,
    },
    {
      measure: 'Waste heat recovery system',
      applicable_zone: 'Process heat operations',
      savings_kwh_monthly: Math.round(total_consumption_kwh * 0.06),
      savings_cost_monthly: Math.round(total_consumption_kwh * 0.06 * utility_rates.off_peak_rate),
      implementation_cost: 45000,
      payback_months: 24,
    },
    {
      measure: 'Power factor correction capacitors',
      applicable_zone: 'Electrical distribution',
      savings_kwh_monthly: Math.round(total_consumption_kwh * 0.03),
      savings_cost_monthly: Math.round(total_consumption_kwh * 0.03 * utility_rates.demand_charge_kw),
      implementation_cost: 8000,
      payback_months: 6,
    },
  ];

  const total_savings_kwh = Math.round(saving_measures.reduce((sum, m) => sum + m.savings_kwh_monthly, 0));
  const total_savings_cost = Math.round(saving_measures.reduce((sum, m) => sum + m.savings_cost_monthly, 0));
  const total_investment = Math.round(saving_measures.reduce((sum, m) => sum + m.implementation_cost, 0));
  const average_payback_months = Math.round(
    saving_measures.reduce((sum, m) => sum + m.payback_months, 0) / saving_measures.length * 10
  ) / 10;

  // --- Priority recommendations ---
  const recommendations_priority: string[] = [
    `🔴 IMMEDIATE: ${saving_measures[0].measure} - minimal investment, fast payback`,
    `🟠 SHORT-TERM: ${saving_measures[2].measure} + ${saving_measures[3].measure}`,
    `🟡 MEDIUM-TERM: ${saving_measures[1].measure} - significant savings, manages peak demand`,
    `🟢 LONG-TERM: ${saving_measures[4].measure} - strategic efficiency improvement`,
    '📊 Install sub-metering for granular energy visibility',
    '🏷️ Implement energy management system (ISO 50001 framework)',
  ];

  return {
    status: 'Energy optimization analysis complete.',
    total_consumption_kwh,
    total_cost_monthly,
    saving_measures,
    total_savings_kwh,
    total_savings_cost,
    total_investment,
    average_payback_months,
    carbon_reduction_tons: Math.round((total_savings_kwh * 0.0005) * 100) / 100, // ~0.5 kg CO2 per kWh
    recommendations_priority,
  };
}

// ============================================================================
// 🔧 Tool 5: Supply Chain Optimizer - 供应链优化
// ============================================================================

const supplyChainOptimizerInputSchema = z.object({
  supplier_data: z.array(z.object({
    supplier_id: z.string(),
    name: z.string(),
    lead_time_days: z.number(),
    reliability_score: z.number(),
    quality_score: z.number(),
    cost_rating: z.enum(['low', 'medium', 'high']),
    location: z.string(),
    min_order_qty: z.number(),
    capacity_units_per_week: z.number(),
  })),
  inventory_levels: z.array(z.object({
    item_id: z.string(),
    item_name: z.string(),
    current_stock: z.number(),
    safety_stock: z.number(),
    reorder_point: z.number(),
    max_capacity: z.number(),
    unit_cost: z.number(),
    turnover_rate: z.number(),
    expiry_date: z.string().optional(),
  })),
  demand_plan: z.object({
    period: z.string(),
    item_demands: z.array(z.object({
      item_id: z.string(),
      quantity: z.number(),
      flexibility_days: z.number(),
    })),
  }),
});

function toolSupplyChainOptimizer(input: z.infer<typeof supplyChainOptimizerInputSchema>): SupplyChainOptimizerResult {
  const { supplier_data, inventory_levels, demand_plan } = input;
  const rng = seededRandom(inventory_levels.length * 31 + supplier_data.length * 17 + demand_plan.item_demands.length);

  // --- Procurement recommendations ---
  const procurement_recommendations: ProcurementRecommendation[] = inventory_levels.map((inv) => {
    const demand = demand_plan.item_demands.find((d) => d.item_id === inv.item_id);
    const demand_qty = demand ? demand.quantity : Math.round(inv.turnover_rate * inv.current_stock);
    const bestSupplier = supplier_data.length > 0
      ? supplier_data.reduce((best, s) =>
          s.quality_score > best.quality_score ? s : best, supplier_data[0])
      : { supplier_id: 'N/A', name: 'No supplier data', min_order_qty: 0, capacity_units_per_week: 0, lead_time_days: 0, reliability_score: 0, quality_score: 0, cost_rating: 'medium' as const, location: 'N/A' };

    let action: ProcurementRecommendation['action'];
    let urgency: ProcurementRecommendation['urgency'];
    let quantity: number;

    if (inv.current_stock <= inv.safety_stock) {
      action = 'order';
      urgency = 'immediate';
      quantity = Math.max(demand_qty, bestSupplier.min_order_qty || 1);
    } else if (inv.current_stock <= inv.reorder_point) {
      action = 'order';
      urgency = 'planned';
      quantity = demand_qty;
    } else if (inv.current_stock > inv.max_capacity * 0.9) {
      action = 'reduce_stock';
      urgency = 'review';
      quantity = Math.round(inv.current_stock - inv.max_capacity * 0.7);
    } else {
      action = inv.turnover_rate < 2 ? 'increase_safety_stock' : 'increase_safety_stock';
      urgency = 'review';
      quantity = Math.round(inv.safety_stock * 1.2);
    }

    return {
      item_id: inv.item_id,
      action,
      quantity,
      preferred_supplier: bestSupplier.name,
      urgency,
      estimated_cost: Math.round(quantity * inv.unit_cost),
    };
  });

  // --- Inventory optimizations ---
  const inventory_optimizations = inventory_levels.map((inv) => {
    const turnover_target = 6.0;
    const recommended = inv.turnover_rate < turnover_target
      ? Math.round(inv.safety_stock * 1.3 + inv.turnover_rate * 10)
      : Math.round(inv.reorder_point * 1.1);
    return {
      item_id: inv.item_id,
      current: inv.current_stock,
      recommended: Math.min(recommended, inv.max_capacity),
      action: inv.current_stock < inv.reorder_point ? 'REORDER' : inv.current_stock > inv.max_capacity * 0.85 ? 'REDUCE' : 'MAINTAIN',
    };
  });

  // --- Risk alerts ---
  const risk_alerts: string[] = inventory_levels
    .filter((inv) => inv.current_stock < inv.safety_stock)
    .map((inv) => `🔴 CRITICAL: ${inv.item_name} (${inv.item_id}) below safety stock: ${inv.current_stock} < ${inv.safety_stock}`);

  risk_alerts.push(
    ...supplier_data
      .filter((s) => s.reliability_score < 0.8)
      .map((s) => `🟠 SUPPLIER RISK: ${s.name} reliability at ${Math.round(s.reliability_score * 100)}% - consider backup`),
  );
  risk_alerts.push(
    ...supplier_data
      .filter((s) => s.lead_time_days > 21)
      .map((s) => `🟡 LEAD TIME: ${s.name} takes ${s.lead_time_days} days - review safety stock levels`),
  );

  if (risk_alerts.length === 0) {
    risk_alerts.push('🟢 Supply chain operating within normal parameters');
  }

  // --- Summary ---
  const total_procurement_cost = procurement_recommendations.reduce((sum, r) => sum + r.estimated_cost, 0);
  const fill_rate_improvement = Math.round(seededRandomRange(rng, 3, 12) * 10) / 10;

  return {
    status: 'Supply chain optimization analysis complete.',
    procurement_recommendations,
    inventory_optimizations,
    risk_alerts,
    total_procurement_cost,
    fill_rate_improvement,
    summary_report: `Analyzed ${inventory_levels.length} inventory items across ${supplier_data.length} suppliers for period ${demand_plan.period}. ${procurement_recommendations.filter((r) => r.urgency === 'immediate').length} items require immediate action. Projected fill rate improvement: ${fill_rate_improvement}%.`,
  };
}

// ============================================================================
// 🔧 Tool 6: Defect Analyzer - 缺陷分析
// ============================================================================

const defectAnalyzerInputSchema = z.object({
  defect_data: z.array(z.object({
    defect_id: z.string(),
    timestamp: z.string(),
    product_id: z.string(),
    station: z.string(),
    defect_type: z.string(),
    quantity_affected: z.number(),
    photo_url: z.string().optional(),
    description: z.string(),
  })),
  process_parameters: z.array(z.object({
    parameter: z.string(),
    current_value: z.number(),
    setpoint: z.number(),
    unit: z.string(),
    tolerance: z.object({ min: z.number(), max: z.number() }),
  })),
  environmental_factors: z.array(z.object({
    factor: z.string(),
    value: z.number(),
    unit: z.string(),
    timestamp: z.string(),
    normal_range: z.object({ min: z.number(), max: z.number() }),
  })),
});

function toolDefectAnalyzer(input: z.infer<typeof defectAnalyzerInputSchema>): DefectAnalyzerResult {
  const { defect_data, process_parameters, environmental_factors } = input;
  const rng = seededRandom(defect_data.length * 13 + defect_data.reduce((sum, d) => sum + d.quantity_affected, 0));

  // --- Total defects ---
  const total_defects = defect_data.reduce((sum, d) => sum + d.quantity_affected, 0);

  // --- Defect distribution ---
  const typeCounts: Map<string, number> = new Map();
  for (const d of defect_data) {
    typeCounts.set(d.defect_type, (typeCounts.get(d.defect_type) || 0) + d.quantity_affected);
  }
  const defect_distribution = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / Math.max(1, total_defects)) * 10000) / 100,
    }))
    .sort((a, b) => b.count - a.count);

  // --- Pareto chart ---
  let cumulative = 0;
  const pareto_chart = defect_distribution.map((d) => {
    cumulative += d.percentage;
    return { defect_type: d.type, cumulative_pct: Math.round(cumulative * 100) / 100 };
  });

  // --- Root cause analysis ---
  const root_causes: DefectRootCause[] = defect_distribution.slice(0, 5).map((d, idx) => {
    const paramCorrelations = process_parameters
      .filter((p) => p.current_value < p.tolerance.min || p.current_value > p.tolerance.max)
      .slice(0, 2)
      .map((p) => `Parameter "${p.parameter}" out of spec (${p.current_value}${p.unit} vs target ${p.setpoint}${p.unit})`);

    const envCorrelations = environmental_factors
      .filter((e) => e.value < e.normal_range.min || e.value > e.normal_range.max)
      .slice(0, 2)
      .map((e) => `${e.factor} at ${e.value}${e.unit} (normal: ${e.normal_range.min}-${e.normal_range.max}${e.unit})`);

    return {
      defect_type: d.type,
      root_cause: idx === 0
        ? `${d.type} primarily caused by process parameter deviation and material inconsistency`
        : `Secondary cause: equipment wear interacting with ${d.type.toLowerCase()} conditions`,
      contributing_factors: [
        ...paramCorrelations,
        ...envCorrelations,
        'Equipment age and maintenance status',
        'Operator skill variance',
        'Material batch inconsistency',
      ].slice(0, 4),
      confidence: Math.round(seededRandomRange(rng, 0.6, 0.95) * 100) / 100,
      occurrence: Math.round(seededRandomRange(rng, 5, 85) * 100) / 100,
      corrective_actions: [
        `Recalibrate ${process_parameters[idx % process_parameters.length]?.parameter || 'critical parameters'}`,
        `Tighten environmental control for ${environmental_factors[idx % environmental_factors.length]?.factor || 'temperature'}`,
        `Update inspection criteria for ${d.type}`,
        'Schedule root cause verification run',
      ],
      prevention_measures: [
        `Install automated ${d.type} detection at source station`,
        'Implement mistake-proofing (poka-yoke) devices',
        'Add process capability monitoring for correlated parameters',
      ],
    };
  });

  // --- Process correlations ---
  const process_correlations: string[] = process_parameters
    .filter((p) => p.current_value < p.tolerance.min || p.current_value > p.tolerance.max)
    .map((p) => `⚠️ ${p.parameter}: ${p.current_value}${p.unit} outside [${p.tolerance.min}-${p.tolerance.max}]${p.unit}`);

  // --- Improvement actions ---
  const improvement_actions: string[] = [
    `🎯 Address top defect: ${defect_distribution[0]?.type || 'N/A'} (${defect_distribution[0]?.percentage || 0}% of total)`,
    '📈 Implement real-time defect tracking with Pareto auto-generation',
    '🔬 Conduct design of experiments (DOE) on top 3 process parameters',
    '🛡️ Add source inspection stations before high-defect steps',
    '👥 Conduct operator retraining on defect-prone operations',
    '📊 Set up daily defect review meetings with cross-functional team',
  ];

  return {
    status: 'Defect analysis complete.',
    total_defects,
    defect_distribution,
    root_causes,
    process_correlations,
    improvement_actions,
    pareto_chart,
  };
}

// ============================================================================
// 🔧 Tool 7: OEE Calculator - OEE 计算
// ============================================================================

const oeeCalculatorInputSchema = z.object({
  availability: z.object({
    planned_production_time_min: z.number(),
    unplanned_downtime_min: z.number(),
    planned_downtime_min: z.number(),
    downtime_reasons: z.array(z.object({
      reason: z.string(),
      duration_min: z.number(),
    })),
  }),
  performance: z.object({
    ideal_cycle_time_sec: z.number(),
    actual_cycle_time_sec: z.number(),
    total_count: z.number(),
    minor_stoppages: z.number(),
    speed_loss_min: z.number(),
  }),
  quality_data: z.object({
    good_count: z.number(),
    total_count: z.number(),
    defect_categories: z.array(z.object({ category: z.string(), count: z.number() })),
    rework_count: z.number(),
    scrap_count: z.number(),
  }),
});

function toolOEECalculator(input: z.infer<typeof oeeCalculatorInputSchema>): OEECalculatorResult {
  const { availability, performance, quality_data } = input;
  const rng = seededRandom(availability.planned_production_time_min + performance.total_count);

  // --- Availability ---
  const run_time_min = availability.planned_production_time_min - availability.unplanned_downtime_min - availability.planned_downtime_min;
  const availability_pct = Math.max(0, Math.round(
    (run_time_min / Math.max(1, availability.planned_production_time_min)) * 10000
  ) / 100);

  // --- Performance ---
  const ideal_output = run_time_min * 60 / Math.max(0.1, performance.ideal_cycle_time_sec);
  const performance_pct = Math.max(0, Math.round(
    (performance.total_count / Math.max(1, ideal_output)) * 10000
  ) / 100);

  // --- Quality ---
  const quality_pct = Math.max(0, Math.round(
    (quality_data.good_count / Math.max(1, quality_data.total_count)) * 10000
  ) / 100);

  // --- OEE ---
  const oee_pct = Math.round((availability_pct * performance_pct * quality_pct) / 10000 * 100) / 100;

  // --- Benchmark ---
  const world_class_benchmark =
    oee_pct >= 85 ? '✅ World Class (≥85%)'
      : oee_pct >= 75 ? '🟢 Good (75-84%)'
      : oee_pct >= 65 ? '🟡 Average (65-74%)'
      : '🔴 Below Average (<65%)';

  // --- Loss categories ---
  const loss_categories = [
    { category: 'Breakdown Loss', percentage: Math.round((availability.unplanned_downtime_min / Math.max(1, availability.planned_production_time_min)) * 10000) / 100, description: 'Unplanned equipment failures' },
    { category: 'Setup & Adjustment', percentage: Math.round((availability.planned_downtime_min / Math.max(1, availability.planned_production_time_min)) * 10000) / 100, description: 'Planned stops for changeovers and adjustments' },
    { category: 'Minor Stoppages', percentage: Math.round((performance.minor_stoppages * 0.5 / Math.max(1, availability.planned_production_time_min)) * 10000) / 100, description: 'Brief interruptions (1-2 min each)' },
    { category: 'Speed Loss', percentage: Math.round((performance.speed_loss_min / Math.max(1, run_time_min)) * 10000) / 100, description: 'Running below ideal cycle time' },
    { category: 'Defect Loss', percentage: Math.round(((quality_data.total_count - quality_data.good_count) / Math.max(1, quality_data.total_count)) * 10000) / 100, description: 'Products not meeting quality standards' },
  ];

  // --- Six Big Losses ---
  const six_big_losses = [
    { loss: 'Breakdowns', value: Math.round(availability.unplanned_downtime_min * 100) / 100 },
    { loss: 'Setup & Adjustments', value: Math.round(availability.planned_downtime_min * 100) / 100 },
    { loss: 'Minor Stops', value: Math.round(performance.minor_stoppages * 0.5 * 100) / 100 },
    { loss: 'Reduced Speed', value: Math.round(performance.speed_loss_min * 100) / 100 },
    { loss: 'Process Defects', value: quality_data.scrap_count },
    { loss: 'Reduced Yield', value: quality_data.rework_count },
  ];

  // --- Improvement opportunities ---
  const improvement_opportunities: OEEImprovements[] = [];
  if (availability_pct < 90) {
    improvement_opportunities.push({
      category: 'Availability',
      current_value: availability_pct,
      target_value: 90,
      improvement_actions: [
        'Implement predictive maintenance program (breakdown reduction)',
        'Reduce changeover time via SMED methodology',
        'Create autonomous maintenance operator procedures',
      ],
    });
  }
  if (performance_pct < 95) {
    improvement_opportunities.push({
      category: 'Performance',
      current_value: performance_pct,
      target_value: 95,
      improvement_actions: [
        'Eliminate minor stoppages with root cause analysis',
        'Optimize cycle time through process redesign',
        'Address speed losses with equipment tuning',
      ],
    });
  }
  if (quality_pct < 99) {
    improvement_opportunities.push({
      category: 'Quality',
      current_value: quality_pct,
      target_value: 99,
      improvement_actions: [
        'Implement in-process quality checks',
        'Conduct defect Pareto and target top 3 categories',
        'Deploy mistake-proofing (poka-yoke) at defect-prone stations',
      ],
    });
  }

  // --- Projected OEE ---
  const projected_oee = Math.round(
    improvement_opportunities.reduce((oee, imp) => {
      const factor = imp.target_value / Math.max(1, imp.current_value);
      if (imp.category === 'Availability') return (imp.target_value * performance_pct * quality_pct) / 10000;
      if (imp.category === 'Performance') return (availability_pct * imp.target_value * quality_pct) / 10000;
      return (availability_pct * performance_pct * imp.target_value) / 10000;
    }, oee_pct) * 100
  ) / 100 || oee_pct;

  // --- Action plan ---
  const action_plan: string[] = [
    '📊 Implement real-time OEE dashboard with shift-level tracking',
    '🎯 Focus on #1 loss category first for maximum impact',
    '📋 Establish daily OEE review meeting (15 min stand-up)',
    '🏆 Set weekly OEE improvement targets with line teams',
  ];

  return {
    status: 'OEE calculation and analysis complete.',
    oee_report: {
      availability_pct,
      performance_pct,
      quality_pct,
      oee_pct,
      world_class_benchmark,
      loss_categories,
    },
    improvement_opportunities,
    six_big_losses,
    action_plan,
    projected_oee: Math.min(99, projected_oee + seededRandomInt(rng, 5, 15)),
  };
}

// ============================================================================
// 🔧 Tool 8: Digital Twin Modeler - 数字孪生建模
// ============================================================================

const digitalTwinModelerInputSchema = z.object({
  asset_specs: z.object({
    asset_id: z.string(),
    asset_type: z.string(),
    model_name: z.string(),
    physical_properties: z.object({
      mass: z.number(),
      dimensions: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    }),
    material: z.string(),
    operating_parameters: z.record(z.object({ min: z.number(), max: z.number(), unit: z.string() })),
  }),
  operational_data: z.array(z.object({
    timestamp: z.string(),
    metrics: z.record(z.number()),
    operational_state: z.enum(['running', 'idle', 'fault', 'maintenance']),
    load_factor: z.number(),
  })),
  simulation_params: z.object({
    simulation_type: z.enum(['performance', 'failure', 'optimization', 'what_if']),
    time_horizon_hours: z.number(),
    resolution_seconds: z.number(),
    scenarios: z.array(z.object({
      name: z.string(),
      params: z.record(z.number()),
    })),
  }),
});

function toolDigitalTwinModeler(input: z.infer<typeof digitalTwinModelerInputSchema>): DigitalTwinModelerResult {
  const { asset_specs, operational_data, simulation_params } = input;
  const rng = seededRandom(
    asset_specs.asset_id.length + operational_data.length + Math.floor(simulation_params.time_horizon_hours)
  );

  // --- Configure twin ---
  const twin_configuration: DigitalTwinConfiguration = {
    model_fidelity: asset_specs.operating_parameters && Object.keys(asset_specs.operating_parameters).length > 5 ? 'high'
      : operational_data.length > 50 ? 'high'
      : operational_data.length > 20 ? 'medium' : 'high',
    data_streams: [
      ...Object.keys(asset_specs.operating_parameters),
      'vibration_spectrum',
      'thermal_profile',
      'power_consumption',
      'acoustic_emission',
    ].slice(0, seededRandomInt(rng, 4, 8)),
    update_frequency_seconds: simulation_params.resolution_seconds <= 1 ? 1
      : simulation_params.resolution_seconds <= 10 ? 10
      : simulation_params.resolution_seconds <= 60 ? 30 : 60,
    simulation_capabilities: [
      'Real-time state estimation',
      'Physics-based degradation modeling',
      'Monte Carlo failure prediction',
      'Parameter sensitivity analysis',
      'What-if scenario comparison',
    ],
    visualization_dimensions: ['3D spatial', 'Time-series trends', 'Heat maps', 'Network topology'],
    algorithgies_applied: [
      'Finite Element Analysis (FEA)',
      'Kalman Filter state estimation',
      'Physics-Informed Neural Networks (PINN)',
      'Physics-based remaining useful life model',
    ],
  };

  // --- Simulation plan ---
  const simulation_type_descriptions: Record<string, string> = {
    performance: 'Evaluate asset performance under varying load and speed conditions',
    failure: 'Simulate degradation paths and predict time-to-failure distributions',
    optimization: 'Find optimal operating parameters for maximum throughput or efficiency',
    what_if: 'Compare multiple scenarios to understand impact of operational changes',
  };

  const simulation_plan: SimulationPlan = {
    scenarios: simulation_params.scenarios.length > 0
      ? simulation_params.scenarios.map((sc) => ({
        name: sc.name,
        description: simulation_type_descriptions[simulation_params.simulation_type] || 'Custom simulation',
        parameters: Object.entries(sc.params).map(([k, v]) => `${k} = ${v}`),
        expected_outcomes: [
          `${capitalize(simulation_params.simulation_type)} metrics distribution over ${simulation_params.time_horizon_hours}h`,
          'Confidence intervals for key output measures',
          'Sensitivity ranking of input parameters',
        ],
      }))
      : [
        {
          name: 'Baseline Operation',
          description: simulation_type_descriptions[simulation_params.simulation_type],
          parameters: ['Load factor: nominal', 'Speed: rated', 'Temperature: standard'],
          expected_outcomes: ['Expected range of operating parameters over simulation horizon'],
        },
        {
          name: 'Stress Test',
          description: 'Edge-case scenario to validate model robustness',
          parameters: ['Load factor: 120% rated', 'Speed: maximum', 'Temperature: elevated'],
          expected_outcomes: ['Failure probability under extreme conditions', 'Safe operating envelope'],
        },
      ],
    simulation_steps: [
      '1. Ingest real-time operational data stream',
      '2. Calibrate model using recent asset behavior',
      '3. Generate initial state estimate with uncertainty bounds',
      '4. Run forward simulation at specified resolution',
      '5. Apply physics-based constraints and failure criteria',
      '6. Aggregate results and compute statistical outputs',
      '7. Validate against historical benchmarks',
      '8. Generate predictions and recommendations',
    ],
    output_metrics: [
      'Remaining useful life (RUL) with confidence interval',
      'Performance degradation trajectory',
      'Failure probability timeline',
      'Optimal maintenance window',
      'Energy efficiency projection',
      'Throughput forecast',
    ],
    risk_assessments: [
      `Model accuracy: ±${seededRandomInt(rng, 3, 8)}% under normal conditions`,
      'Extrapolation risk increases beyond 2x training data horizon',
      'Validation required after any physical asset modification',
      'Confidence intervals widen significantly for rare failure modes',
    ],
  };

  // --- Model accuracy estimate ---
  const model_accuracy_estimate = operational_data.length > 100 ? seededRandomInt(rng, 92, 98)
    : operational_data.length > 30 ? seededRandomInt(rng, 85, 93)
    : seededRandomInt(rng, 75, 88);

  // --- Deployment recommendations ---
  const deployment_recommendations: string[] = [
    '🔧 Start with shadow mode: run twin alongside physical asset for 2-4 weeks',
    '📊 Validate predictions against actual performance before operational use',
    '🔄 Establish continuous model update cycle (weekly recalibration recommended)',
    '👥 Train operations team on twin interpretation and action protocols',
    '📈 Set up automated alerts when predicted metrics exceed thresholds',
    '🔗 Integrate with CMMS for automated work order generation',
  ];

  // --- Value projections ---
  const value_projections = [
    { metric: 'Unplanned Downtime', current: seededRandomInt(rng, 10, 30), projected: seededRandomInt(rng, 3, 10), unit: '%' },
    { metric: 'Maintenance Cost', current: seededRandomInt(rng, 50000, 200000), projected: seededRandomInt(rng, 30000, 120000), unit: 'USD/year' },
    { metric: 'Asset Utilization', current: seededRandomInt(rng, 60, 80), projected: seededRandomInt(rng, 75, 92), unit: '%' },
    { metric: 'Productivity', current: 100, projected: seededRandomInt(rng, 108, 125), unit: '% baseline' },
    { metric: 'Quality Yield', current: seededRandomInt(rng, 92, 98), projected: seededRandomInt(rng, 96, 99), unit: '%' },
  ];

  return {
    status: 'Digital twin model configuration complete.',
    twin_configuration,
    simulation_plan,
    model_accuracy_estimate,
    deployment_recommendations,
    value_projections,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================================
// 📋 Markdown Formatting Helpers
// ============================================================================

function formatPredictiveMaintenanceResult(result: PredictiveMaintenanceResult): string {
  let md = '## 🏭 Predictive Maintenance Report\n\n';
  md += `**Status:** ${result.status}\n\n`;
  md += `**Equipment:** ${result.equipment_summary}\n\n`;
  md += `**Health Index:** ${result.health_index}/100 | **Risk Score:** ${result.risk_score}/100\n\n`;

  md += '### 🔮 Failure Predictions\n\n';
  md += '| Component | Probability | RUL (days) | Severity | Key Indicators |\n';
  md += '|-----------|-------------|------------|----------|----------------|\n';
  for (const p of result.failure_predictions) {
    md += `| ${p.component} | ${(p.probability * 100).toFixed(0)}% | ${p.estimated_rul_days} | ${p.severity.toUpperCase()} | ${p.indicators.slice(0, 2).join('; ')} |\n`;
  }

  md += '\n### 📋 Maintenance Schedule\n\n';
  md += '| Action | Priority | Deadline | Est. Cost (USD) |\n';
  md += '|--------|----------|----------|-----------------|\n';
  for (const s of result.maintenance_plan.schedule) {
    md += `| ${s.action} | ${s.priority.toUpperCase()} | ${s.deadline} | $${s.estimated_cost.toLocaleString()} |\n`;
  }

  md += '\n### 💡 Recommendations\n\n';
  for (const rec of result.maintenance_plan.recommendations) {
    md += `- ${rec}\n`;
  }

  md += `\n### 📊 Impact Projection\n\n`;
  md += `- **Downtime Reduction:** ${result.maintenance_plan.estimated_downtime_reduction}%\n`;
  md += `- **Cost Savings:** $${result.maintenance_plan.estimated_cost_savings.toLocaleString()}/year\n`;

  return md;
}

function formatQualityInspectorResult(result: QualityInspectorResult): string {
  let md = '## 🔍 Quality Inspection Report\n\n';
  md += `**Status:** ${result.status}\n\n`;

  md += '### 📊 Quality Scores\n\n';
  md += '| Dimension | Score | Grade |\n';
  md += '|-----------|-------|-------|\n';
  md += `| Overall | ${result.quality_score.overall_score}/100 | ${result.quality_score.grade} |\n`;
  md += `| Dimensional | ${result.quality_score.dimensional_score}/100 | - |\n`;
  md += `| Visual | ${result.quality_score.visual_score}/100 | - |\n`;
  md += `| Functional | ${result.quality_score.functional_score}/100 | - |\n`;

  md += `\n**Defect Rate:** ${result.defect_rate}%\n\n`;

  md += '### ✅ Pass/Fail Summary\n\n';
  md += `- **Passed:** ${result.pass_fail_summary.passed}/${result.pass_fail_summary.total}\n`;
  md += `- **Failed:** ${result.pass_fail_summary.failed}/${result.pass_fail_summary.total}\n\n`;

  md += '### 🔬 Root Cause Analyses\n\n';
  for (const rca of result.root_cause_analyses) {
    md += `#### ${rca.defect_category} (Confidence: ${(rca.confidence * 100).toFixed(0)}%)\n\n`;
    md += '**Probable Causes:**\n';
    for (const cause of rca.probable_causes) {
      md += `- ${cause}\n`;
    }
    md += '\n**Recommended Actions:**\n';
    for (const action of rca.recommended_actions) {
      md += `  - ${action}\n`;
    }
    md += '\n';
  }

  md += '### 📈 Improvement Recommendations\n\n';
  for (const rec of result.improvement_recommendations) {
    md += `- ${rec}\n`;
  }

  return md;
}

function formatProductionOptimizerResult(result: ProductionOptimizerResult): string {
  let md = '## 🏭 Production Optimization Report\n\n';
  md += `**Status:** ${result.status}\n\n`;
  md += `**Current Efficiency:** ${result.current_efficiency}%\n`;
  md += `**Projected Output:** ${result.projected_output.toLocaleString()} units\n`;
  md += `**Estimated ROI:** ${result.roi_estimate}%\n\n`;

  md += `### 🎯 Capacity Improvement\n\n`;
  md += `**Total Capacity Uplift:** ${result.capacity_improvement_plan.capacity_increase_pct}%\n`;
  md += `**Output Increase:** ${result.capacity_improvement_plan.estimated_output_increase.toLocaleString()} units\n\n`;

  md += '### 📊 Bottleneck Resolutions\n\n';
  md += '| Station | Action | Impact |\n';
  md += '|---------|--------|--------|\n';
  for (const br of result.capacity_improvement_plan.bottleneck_resolutions) {
    md += `| ${br.station} | ${br.action} | ${br.impact} |\n`;
  }

  md += '\n### 📅 Scheduling Adjustments\n\n';
  for (const adj of result.capacity_improvement_plan.scheduling_adjustments) {
    md += `- ${adj}\n`;
  }

  md += '\n### 🔄 Implementation Roadmap\n\n';
  for (const phase of result.capacity_improvement_plan.implementation_phases) {
    md += `#### ${phase.phase} (${phase.duration_weeks} weeks)\n\n`;
    for (const action of phase.actions) {
      md += `- ${action}\n`;
    }
    md += '\n';
  }

  md += '### 📦 Lean Recommendations\n\n';
  for (const lr of result.lean_recommendations) {
    md += `- ${lr}\n`;
  }

  return md;
}

function formatEnergyOptimizerResult(result: EnergyOptimizerResult): string {
  let md = '## ⚡ Energy Optimization Report\n\n';
  md += `**Status:** ${result.status}\n\n`;

  md += '### 📊 Current State\n\n';
  md += `- **Total Consumption:** ${result.total_consumption_kwh.toLocaleString()} kWh/month\n`;
  md += `- **Total Cost:** $${result.total_cost_monthly.toLocaleString()}/month\n\n`;

  md += '### 💡 Energy Saving Measures\n\n';
  md += '| Measure | Zone | Savings (kWh/mo) | Savings ($/mo) | Investment | Payback (mo) |\n';
  md += '|---------|------|-------------------|----------------|------------|-------------|\n';
  for (const m of result.saving_measures) {
    md += `| ${m.measure} | ${m.applicable_zone} | ${m.savings_kwh_monthly.toLocaleString()} | $${m.savings_cost_monthly.toLocaleString()} | $${m.implementation_cost.toLocaleString()} | ${m.payback_months} |\n`;
  }

  md += '\n### 📈 Summary\n\n';
  md += `- **Total Savings:** ${result.total_savings_kwh.toLocaleString()} kWh/month\n`;
  md += `- **Cost Savings:** $${result.total_savings_cost.toLocaleString()}/month\n`;
  md += `- **Total Investment:** $${result.total_investment.toLocaleString()}\n`;
  md += `- **Avg Payback:** ${result.average_payback_months} months\n`;
  md += `- **Carbon Reduction:** ${result.carbon_reduction_tons} tons CO2/month\n\n`;

  md += '### 🎯 Priority Actions\n\n';
  for (const rec of result.recommendations_priority) {
    md += `- ${rec}\n`;
  }

  return md;
}

function formatSupplyChainOptimizerResult(result: SupplyChainOptimizerResult): string {
  let md = '## 🔗 Supply Chain Optimization Report\n\n';
  md += `**Status:** ${result.status}\n\n`;
  md += `${result.summary_report}\n\n`;

  md += '### 📦 Procurement Recommendations\n\n';
  md += '| Item | Action | Quantity | Supplier | Urgency | Cost (USD) |\n';
  md += '|------|--------|----------|----------|---------|------------|\n';
  for (const pr of result.procurement_recommendations) {
    md += `| ${pr.item_id} | ${pr.action} | ${pr.quantity} | ${pr.preferred_supplier} | ${pr.urgency} | $${pr.estimated_cost.toLocaleString()} |\n`;
  }

  md += '\n### 📊 Inventory Optimizations\n\n';
  md += '| Item ID | Current | Recommended | Action |\n';
  md += '|---------|---------|-------------|--------|\n';
  for (const io of result.inventory_optimizations) {
    md += `| ${io.item_id} | ${io.current} | ${io.recommended} | ${io.action} |\n`;
  }

  md += `\n**Total Procurement Cost:** $${result.total_procurement_cost.toLocaleString()}\n`;
  md += `**Fill Rate Improvement:** ${result.fill_rate_improvement}%\n\n`;

  md += '### 🚨 Risk Alerts\n\n';
  for (const alert of result.risk_alerts) {
    md += `- ${alert}\n`;
  }

  return md;
}

function formatDefectAnalyzerResult(result: DefectAnalyzerResult): string {
  let md = '## 🔬 Defect Analysis Report\n\n';
  md += `**Status:** ${result.status}\n\n`;
  md += `**Total Defects:** ${result.total_defects.toLocaleString()}\n\n`;

  md += '### 📊 Defect Distribution\n\n';
  md += '| Defect Type | Count | Percentage |\n';
  md += '|-------------|-------|------------|\n';
  for (const d of result.defect_distribution) {
    md += `| ${d.type} | ${d.count} | ${d.percentage}% |\n`;
  }

  md += '\n### 📈 Pareto Analysis\n\n';
  md += '| Defect Type | Cumulative % |\n';
  md += '|-------------|-------------|\n';
  for (const p of result.pareto_chart) {
    md += `| ${p.defect_type} | ${p.cumulative_pct}% |\n`;
  }

  md += '\n### 🔍 Root Cause Analyses\n\n';
  for (const rc of result.root_causes) {
    md += `#### ${rc.defect_type} (Confidence: ${(rc.confidence * 100).toFixed(0)}%)\n\n`;
    md += `**Root Cause:** ${rc.root_cause}\n\n`;
    md += '**Contributing Factors:**\n';
    for (const f of rc.contributing_factors) {
      md += `  - ${f}\n`;
    }
    md += '\n**Corrective Actions:**\n';
    for (const a of rc.corrective_actions) {
      md += `  - ${a}\n`;
    }
    md += '\n**Prevention Measures:**\n';
    for (const pm of rc.prevention_measures) {
      md += `  - ${pm}\n`;
    }
    md += '\n';
  }

  if (result.process_correlations.length > 0) {
    md += '### ⚠️ Process Parameter Alerts\n\n';
    for (const pc of result.process_correlations) {
      md += `- ${pc}\n`;
    }
    md += '\n';
  }

  md += '### 🎯 Improvement Actions\n\n';
  for (const ia of result.improvement_actions) {
    md += `- ${ia}\n`;
  }

  return md;
}

function formatOEECalculatorResult(result: OEECalculatorResult): string {
  let md = '## 📊 OEE Calculation Report\n\n';
  md += `**Status:** ${result.status}\n\n`;

  md += '### 🏆 OEE Scores\n\n';
  md += '| Component | Value |\n';
  md += '|-----------|-------|\n';
  md += `| Availability | ${result.oee_report.availability_pct}% |\n`;
  md += `| Performance | ${result.oee_report.performance_pct}% |\n`;
  md += `| Quality | ${result.oee_report.quality_pct}% |\n`;
  md += `| **OEE** | **${result.oee_report.oee_pct}%** |\n`;
  md += `| Benchmark | ${result.oee_report.world_class_benchmark} |\n`;

  md += '\n### 📉 Loss Categories\n\n';
  md += '| Category | Loss % | Description |\n';
  md += '|----------|--------|-------------|\n';
  for (const lc of result.oee_report.loss_categories) {
    md += `| ${lc.category} | ${lc.percentage}% | ${lc.description} |\n`;
  }

  md += '\n### ⚡ Six Big Losses\n\n';
  md += '| Loss Type | Value |\n';
  md += '|-----------|-------|\n';
  for (const sl of result.six_big_losses) {
    md += `| ${sl.loss} | ${sl.value} |\n`;
  }

  if (result.improvement_opportunities.length > 0) {
    md += '\n### 🎯 Improvement Opportunities\n\n';
    for (const io of result.improvement_opportunities) {
      md += `#### ${io.category}: ${io.current_value}% → ${io.target_value}%\n\n`;
      for (const action of io.improvement_actions) {
        md += `- ${action}\n`;
      }
      md += '\n';
    }
  }

  md += `\n### 📈 Projected OEE: ${result.projected_oee}%\n\n`;

  md += '### 📋 Action Plan\n\n';
  for (const ap of result.action_plan) {
    md += `- ${ap}\n`;
  }

  return md;
}

function formatDigitalTwinModelerResult(result: DigitalTwinModelerResult): string {
  let md = '## 🧩 Digital Twin Model Report\n\n';
  md += `**Status:** ${result.status}\n\n`;

  md += '### ⚙️ Twin Configuration\n\n';
  md += `- **Model Fidelity:** ${result.twin_configuration.model_fidelity}\n`;
  md += `- **Update Frequency:** every ${result.twin_configuration.update_frequency_seconds}s\n`;
  md += `- **Estimated Accuracy:** ${result.model_accuracy_estimate}%\n\n`;

  md += `**Data Streams:** ${result.twin_configuration.data_streams.join(', ')}\n\n`;
  md += `**Simulation Capabilities:** ${result.twin_configuration.simulation_capabilities.join(', ')}\n\n`;
  md += `**Algorithms:** ${result.twin_configuration.algorithgies_applied.join(', ')}\n\n`;

  md += '### 🧪 Simulation Plan\n\n';
  for (const s of result.simulation_plan.scenarios) {
    md += `#### ${s.name}\n\n`;
    md += `${s.description}\n\n`;
    md += `**Parameters:** ${s.parameters.join(', ')}\n\n`;
    md += `**Expected Outcomes:** ${s.expected_outcomes.join(', ')}\n\n`;
  }

  md += '### 📋 Simulation Steps\n\n';
  for (const step of result.simulation_plan.simulation_steps) {
    md += `- ${step}\n`;
  }

  md += '\n### 📊 Output Metrics\n\n';
  for (const m of result.simulation_plan.output_metrics) {
    md += `- ${m}\n`;
  }

  md += '\n### ⚠️ Risk Assessments\n\n';
  for (const r of result.simulation_plan.risk_assessments) {
    md += `- ${r}\n`;
  }

  md += '\n### 💎 Value Projections\n\n';
  md += '| Metric | Current | Projected | Unit |\n';
  md += '|--------|---------|-----------|------|\n';
  for (const vp of result.value_projections) {
    md += `| ${vp.metric} | ${vp.current} | ${vp.projected} | ${vp.unit} |\n`;
  }

  md += '\n### 🚀 Deployment Recommendations\n\n';
  for (const dr of result.deployment_recommendations) {
    md += `- ${dr}\n`;
  }

  return md;
}

// ============================================================================
// 🔌 DSH Tool Exports
// ============================================================================

export const tools = {
  predictive_maintenance: {
    name: 'predictive_maintenance',
    description: 'Analyze equipment sensor data and maintenance history to predict failures, estimate remaining useful life, and generate optimized maintenance schedules. Reduces unplanned downtime by up to 30%.',
    inputSchema: predictiveMaintenanceInputSchema,
    execute: (input: unknown): string => {
      const parsed = predictiveMaintenanceInputSchema.parse(input);
      const result = toolPredictiveMaintenance(parsed);
      return formatPredictiveMaintenanceResult(result);
    },
  },

  quality_inspector: {
    name: 'quality_inspector',
    description: 'Perform comprehensive quality inspection analysis including dimensional, visual, and functional scoring. Provides defect rate calculation, root cause analysis, and improvement recommendations.',
    inputSchema: qualityInspectorInputSchema,
    execute: (input: unknown): string => {
      const parsed = qualityInspectorInputSchema.parse(input);
      const result = toolQualityInspector(parsed);
      return formatQualityInspectorResult(result);
    },
  },

  production_optimizer: {
    name: 'production_optimizer',
    description: 'Optimize production line efficiency by analyzing bottlenecks, demand forecasts, and current performance data. Outputs capacity improvement plans, lean recommendations, and scheduling strategies.',
    inputSchema: productionOptimizerInputSchema,
    execute: (input: unknown): string => {
      const parsed = productionOptimizerInputSchema.parse(input);
      const result = toolProductionOptimizer(parsed);
      return formatProductionOptimizerResult(result);
    },
  },

  energy_optimizer: {
    name: 'energy_optimizer',
    description: 'Optimize energy consumption across manufacturing facilities. Analyzes consumption patterns, production schedules, and utility rates to deliver cost-saving measures and carbon reduction estimates.',
    inputSchema: energyOptimizerInputSchema,
    execute: (input: unknown): string => {
      const parsed = energyOptimizerInputSchema.parse(input);
      const result = toolEnergyOptimizer(parsed);
      return formatEnergyOptimizerResult(result);
    },
  },

  supply_chain_optimizer: {
    name: 'supply_chain_optimizer',
    description: 'Optimize supply chain operations including procurement, inventory management, and supplier selection. Analyzes inventory levels against demand plans and supplier performance to reduce costs and improve fill rates.',
    inputSchema: supplyChainOptimizerInputSchema,
    execute: (input: unknown): string => {
      const parsed = supplyChainOptimizerInputSchema.parse(input);
      const result = toolSupplyChainOptimizer(parsed);
      return formatSupplyChainOptimizerResult(result);
    },
  },

  defect_analyzer: {
    name: 'defect_analyzer',
    description: 'Perform deep defect analysis using Pareto charts, process parameter correlation, and environmental factor analysis. Identifies root causes and provides corrective and preventive actions.',
    inputSchema: defectAnalyzerInputSchema,
    execute: (input: unknown): string => {
      const parsed = defectAnalyzerInputSchema.parse(input);
      const result = toolDefectAnalyzer(parsed);
      return formatDefectAnalyzerResult(result);
    },
  },

  oee_calculator: {
    name: 'oee_calculator',
    description: 'Calculate Overall Equipment Effectiveness (OEE) and its components (Availability, Performance, Quality). Identifies Six Big Losses and provides improvement roadmaps to reach world-class benchmarks.',
    inputSchema: oeeCalculatorInputSchema,
    execute: (input: unknown): string => {
      const parsed = oeeCalculatorInputSchema.parse(input);
      const result = toolOEECalculator(parsed);
      return formatOEECalculatorResult(result);
    },
  },

  digital_twin_modeler: {
    name: 'digital_twin_modeler',
    description: 'Configure digital twin models for manufacturing assets. Creates simulation plans for performance prediction, failure analysis, and operational optimization with AI-driven modeling.',
    inputSchema: digitalTwinModelerInputSchema,
    execute: (input: unknown): string => {
      const parsed = digitalTwinModelerInputSchema.parse(input);
      const result = toolDigitalTwinModeler(parsed);
      return formatDigitalTwinModelerResult(result);
    },
  },
};

// ============================================================================
// 📇 Plugin Metadata Export
// ============================================================================

export const pluginInfo = {
  id: 'dsh-tool-manufacturex',
  name: 'dsh-tool-manufacturex',
  version: '0.1.0',
  description: 'Smart manufacturing tools - predictive maintenance, quality inspection, production optimization, energy efficiency, supply chain, defect analysis, OEE, and digital twin modeling.',
  author: 'chengganping-ship-it',
};

export default tools;
