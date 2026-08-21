import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-semiconagentpro'
export const inject = ['tools']

// =============================================================================
// Seeded Random Number Generator (mulberry32 + string hash seed)
// =============================================================================
class SeededRandom {
  private state: number;
  constructor(seed: number) { this.state = seed; }
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  static seedFromString(s: string): number {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    return h >>> 0;
  }
  pick<T>(arr: T[]): T { return arr[Math.floor(this.next() * arr.length)]; }
  range(min: number, max: number): number { return min + this.next() * (max - min); }
  intRange(min: number, max: number): number { return Math.floor(this.range(min, max + 1)); }
}

// =============================================================================
// Output helper
// =============================================================================
function outputSchema(schema: unknown, render: (_a: any, v: any) => any[]) {
  return { schema: { type: 'string' as const } as any, render: render as any };
}

// =============================================================================
// Tool 1: yield_optimization_engine — 晶圆良率分析与工艺窗口优化
// =============================================================================
const yield_optimization_engine = defineTool({
  name: 'yield_optimization_engine',
  description: 'Perform wafer yield analysis with process window optimization. Analyzes yield loss mechanisms, identifies critical process parameters, and recommends optimal process windows for maximum die yield in semiconductor fabs.',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON with: technology_node (e.g. "7nm"), wafer_count, defect_density_data, process_parameters, current_yield_pct, target_yield_pct, layer_info'
    }
  },
  output: outputSchema({ type: 'string' }, (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]),
  async execute(args: { input_data: string }) {
    const data = JSON.parse(args.input_data);
    const seed = SeededRandom.seedFromString(JSON.stringify(data));
    const rng = new SeededRandom(seed);

    const techNode = data.technology_node || '7nm';
    const waferCount = data.wafer_count || 1000;
    const currentYield = data.current_yield_pct || 82.5;
    const targetYield = data.target_yield_pct || 95.0;

    // Analyze yield loss components
    const lossComponents = [
      { mechanism: 'Random Defects', contributor: 'Particle contamination', loss_pct: rng.range(1.2, 3.8), severity: 'High' },
      { mechanism: 'Systematic Defects', contributor: 'Lithography misalignment', loss_pct: rng.range(0.8, 2.5), severity: 'Critical' },
      { mechanism: 'Parametric Failures', contributor: 'Gate oxide thickness variation', loss_pct: rng.range(0.5, 1.8), severity: 'Medium' },
      { mechanism: 'Edge Exclusion', contributor: 'Bevel region defects', loss_pct: rng.range(0.3, 0.9), severity: 'Low' },
      { mechanism: 'Via/Contact Failures', contributor: 'Etch residue / void formation', loss_pct: rng.range(0.4, 1.5), severity: 'High' },
      { mechanism: 'Metal CMP Dishing', contributor: 'Chemical-mechanical planarization', loss_pct: rng.range(0.2, 0.8), severity: 'Medium' },
    ];

    const totalLoss = lossComponents.reduce((s, c) => s + c.loss_pct, 0);
    const computedYield = Math.max(0, 100 - totalLoss);

    // Process window recommendations
    const recommendations = [
      { parameter: 'Lithography Focus (nm)', current: rng.range(-50, 50), optimal: rng.range(-10, 10), window: '±15nm', impact_pct: rng.range(0.8, 2.0) },
      { parameter: 'Exposure Dose (mJ/cm²)', current: rng.range(28, 35), optimal: rng.range(30, 33), window: '±1.5 mJ/cm²', impact_pct: rng.range(0.5, 1.5) },
      { parameter: 'Anneal Temperature (°C)', current: rng.range(980, 1050), optimal: rng.range(1000, 1020), window: '±8°C', impact_pct: rng.range(0.3, 1.2) },
      { parameter: 'Etch RF Power (W)', current: rng.range(350, 450), optimal: rng.range(380, 420), window: '±20W', impact_pct: rng.range(0.2, 0.9) },
      { parameter: 'CMP Pressure (psi)', current: rng.range(4.0, 6.5), optimal: rng.range(4.8, 5.5), window: '±0.3 psi', impact_pct: rng.range(0.1, 0.6) },
    ];

    // Cp/Cpk analysis
    const processCapability = [
      { metric: 'Gate Length', cp: rng.range(1.2, 2.1), cpk: rng.range(1.0, 1.8), status: 'Capable' },
      { metric: 'Oxide Thickness', cp: rng.range(1.4, 2.4), cpk: rng.range(1.2, 2.0), status: 'Capable' },
      { metric: 'Contact Resistance', cp: rng.range(0.9, 1.6), cpk: rng.range(0.7, 1.3), status: 'Marginal' },
      { metric: 'Metal Sheet Rho', cp: rng.range(1.3, 2.0), cpk: rng.range(1.1, 1.7), status: 'Capable' },
    ];

    const report = {
      analysis_id: `YOE-${seed.toString(16).toUpperCase().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      technology_node: techNode,
      wafer_count: waferCount,
      yield_summary: { current_yield_pct: currentYield, computed_yield_pct: +computedYield.toFixed(2), target_yield_pct: targetYield, gap_to_target_pct: +(targetYield - computedYield).toFixed(2) },
      yield_loss_breakdown: lossComponents.map(c => ({ ...c, loss_pct: +c.loss_pct.toFixed(3) })),
      process_window_optimization: recommendations.map(r => ({ ...r, current: +r.current.toFixed(1), optimal: +r.optimal.toFixed(1), impact_pct: +r.impact_pct.toFixed(2) })),
      process_capability_analysis: processCapability.map(p => ({ ...p, cp: +p.cp.toFixed(2), cpk: +p.cpk.toFixed(2) })),
      projection: { estimated_yield_after_optimization_pct: +(computedYield + recommendations.reduce((s, r) => s + r.impact_pct, 0)).toFixed(2), roi_estimate: `$${(waferCount * 0.5 * (targetYield - currentYield) / 100 * 50).toFixed(0)}k/month` },
    };
    return JSON.stringify(report, null, 2);
  }
});

// =============================================================================
// Tool 2: chip_design_verifier — 芯片设计规则检查与DRC/LVS验证
// =============================================================================
const chip_design_verifier = defineTool({
  name: 'chip_design_verifier',
  description: 'Perform chip design rule checking (DRC) with LVS verification. Validates layout against foundry design rules, checks electrical connectivity, and identifies violations for advanced semiconductor nodes.',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON with: design_name, technology_node, layout_format (GDS/OASIS), layers, cell_count, check_types (array), rule_deck_version'
    }
  },
  output: outputSchema({ type: 'string' }, (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]),
  async execute(args: { input_data: string }) {
    const data = JSON.parse(args.input_data);
    const seed = SeededRandom.seedFromString(JSON.stringify(data));
    const rng = new SeededRandom(seed);

    const designName = data.design_name || 'AI_Accelerator_Top';
    const techNode = data.technology_node || '5nm';
    const cellCount = data.cell_count || 12500000;
    const ruleDeck = data.rule_deck_version || 'TSMC_N5_2024_v3.2';

    // DRC violation categories
    const drcViolations = [
      { rule: 'M1_MIN_SPACING', description: 'Metal-1 minimum spacing violation', category: 'Spacing', count: rng.intRange(3, 47), severity: 'Critical', layer: 'M1', fix_priority: 1 },
      { rule: 'VIA0_ENCLOSURE', description: 'Via-0 enclosure by Metal-1', category: 'Enclosure', count: rng.intRange(1, 23), severity: 'Critical', layer: 'VIA0', fix_priority: 2 },
      { rule: 'M2_MIN_AREA', description: 'Metal-2 minimum area violation', category: 'Area', count: rng.intRange(5, 31), severity: 'Major', layer: 'M2', fix_priority: 3 },
      { rule: 'MINT_SPACING', description: 'Multi-layer interconnect spacing', category: 'Spacing', count: rng.intRange(0, 12), severity: 'Major', layer: 'MINT', fix_priority: 4 },
      { rule: 'DENSITY_M3', description: 'Metal-3 density fill violation', category: 'Density', count: rng.intRange(8, 56), severity: 'Minor', layer: 'M3', fix_priority: 5 },
      { rule: 'ANTENNA_GATE', description: 'Antenna effect on gate oxide', category: 'Antenna', count: rng.intRange(2, 18), severity: 'Major', layer: 'POLY', fix_priority: 3 },
      { rule: 'END_OF_LINE', description: 'End-of-line spacing for EUV layers', category: 'Spacing', count: rng.intRange(4, 28), severity: 'Critical', layer: 'EUV_M1', fix_priority: 1 },
    ];

    // LVS verification
    const lvsResults = {
      schematic_instances: cellCount,
      layout_instances: cellCount + rng.intRange(-5, 5),
      net_count_schematic: Math.floor(cellCount * 2.3),
      net_count_layout: Math.floor(cellCount * 2.3) + rng.intRange(-3, 3),
      matched_nets_pct: +(rng.range(99.7, 100)).toFixed(3),
      unmatched_components: rng.intRange(0, 8),
      short_circuits: rng.intRange(0, 3),
      open_circuits: rng.intRange(0, 5),
      status: 'Clean',
    };
    if (lvsResults.unmatched_components > 5 || lvsResults.short_circuits > 1) lvsResults.status = 'Review Required';

    // Rule deck checks
    const ruleChecks = [
      { check_name: 'Width Rules', total_rules: 245, passed: rng.intRange(240, 245), failed: 0 },
      { check_name: 'Spacing Rules', total_rules: 380, passed: rng.intRange(365, 380), failed: 0 },
      { check_name: 'Enclosure Rules', total_rules: 156, passed: rng.intRange(150, 156), failed: 0 },
      { check_name: 'Area Rules', total_rules: 92, passed: rng.intRange(88, 92), failed: 0 },
      { check_name: 'Density Rules', total_rules: 64, passed: rng.intRange(55, 64), failed: 0 },
      { check_name: 'Antenna Rules', total_rules: 38, passed: rng.intRange(33, 38), failed: 0 },
    ].map(r => ({ ...r, failed: r.total_rules - r.passed }));

    const totalDRCViolations = drcViolations.reduce((s, v) => s + v.count, 0);
    const totalRuleFails = ruleChecks.reduce((s, r) => s + r.failed, 0);

    const report = {
      verification_id: `CDV-${seed.toString(16).toUpperCase().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      design_info: { design_name: designName, technology_node: techNode, cell_count: cellCount, rule_deck: ruleDeck, layout_format: data.layout_format || 'GDS' },
      drc_summary: { total_violations: totalDRCViolations, critical: drcViolations.filter(v => v.severity === 'Critical').reduce((s, v) => s + v.count, 0), major: drcViolations.filter(v => v.severity === 'Major').reduce((s, v) => s + v.count, 0), minor: drcViolations.filter(v => v.severity === 'Minor').reduce((s, v) => s + v.count, 0) },
      drc_violations: drcViolations,
      lvs_results: lvsResults,
      rule_deck_checks: ruleChecks,
      total_rule_check_failures: totalRuleFails,
      signoff_status: totalDRCViolations === 0 && lvsResults.status === 'Clean' ? 'PASSED - Ready for Tapeout' : totalDRCViolations < 20 ? 'CONDITIONAL - Minor fixes required' : 'FAILED - Significant rework needed',
      estimated_fix_time_hours: Math.ceil(totalDRCViolations * 0.5 + lvsResults.unmatched_components * 2),
    };
    return JSON.stringify(report, null, 2);
  }
});

// =============================================================================
// Tool 3: equipment_predictive_maintenance — 设备预测性维护与MTBF分析
// =============================================================================
const equipment_predictive_maintenance = defineTool({
  name: 'equipment_predictive_maintenance',
  description: 'Semiconductor equipment predictive maintenance with MTBF/MTTR analysis. Monitors tool health, predicts failures, schedules maintenance, and optimizes fab equipment utilization.',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON with: equipment_id, equipment_type, sensor_data (vibration/temperature/power), current_mtbf_hours, operating_hours, maintenance_history'
    }
  },
  output: outputSchema({ type: 'string' }, (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]),
  async execute(args: { input_data: string }) {
    const data = JSON.parse(args.input_data);
    const seed = SeededRandom.seedFromString(JSON.stringify(data));
    const rng = new SeededRandom(seed);

    const equipId = data.equipment_id || 'LITH-003';
    const equipType = data.equipment_type || 'ASML NXT:2050i Lithography Scanner';
    const operatingHours = data.operating_hours || 45000;
    const currentMTBF = data.current_mtbf_hours || 720;

    // Sensor readings
    const sensors = {
      vibration_rms: +rng.range(0.8, 4.2).toFixed(2),
      temperature_c: +rng.range(22.5, 26.8).toFixed(1),
      power_consumption_kw: +rng.range(85, 112).toFixed(1),
      vacuum_pressure_mtorr: +rng.range(1e-6, 5e-6).toExponential(2),
      gas_flow_sccm: +rng.range(48, 52).toFixed(1),
      rf_reflected_power_w: +rng.range(2, 15).toFixed(1),
      particle_count_per_wafer: rng.intRange(5, 45),
    };
    const sensorHealth = sensors.vibration_rms > 3.0 || sensors.rf_reflected_power_w > 10 || sensors.particle_count_per_wafer > 30 ? 'DEGRADED' : sensors.vibration_rms > 2.0 ? 'WARNING' : 'HEALTHY';

    // Failure mode prediction
    const failureModes = [
      { component: 'Laser Source', probability: +rng.range(0.02, 0.18).toFixed(3), remaining_useful_life_h: rng.intRange(800, 4500), risk_level: 'Medium', failure_impact: 'Line stop - No exposure possible' },
      { component: 'Wafer Stage Actuator', probability: +rng.range(0.01, 0.12).toFixed(3), remaining_useful_life_h: rng.intRange(1200, 6000), risk_level: 'Low', failure_impact: 'Alignment accuracy degradation' },
      { component: 'Projection Lens Assembly', probability: +rng.range(0.03, 0.22).toFixed(3), remaining_useful_life_h: rng.intRange(500, 3000), risk_level: 'High', failure_impact: 'CD uniformity failure, rework required' },
      { component: 'Vacuum Chuck', probability: +rng.range(0.01, 0.09).toFixed(3), remaining_useful_life_h: rng.intRange(2000, 8000), risk_level: 'Low', failure_impact: 'Wafer handling interruption' },
      { component: 'Gas Purge System', probability: +rng.range(0.05, 0.25).toFixed(3), remaining_useful_life_h: rng.intRange(400, 2500), risk_level: 'High', failure_impact: 'Contamination risk, optics damage' },
      { component: 'RF Generator', probability: +rng.range(0.02, 0.15).toFixed(3), remaining_useful_life_h: rng.intRange(900, 5000), risk_level: 'Medium', failure_impact: 'Process recipe inability to execute' },
    ];

    // Maintenance schedule
    const maintenancePlan = [
      { task: 'Lens cleaning & calibration', interval_days: 30, next_due_days: rng.intRange(2, 28), estimated_downtime_h: 4 },
      { task: 'Laser power calibration', interval_days: 90, next_due_days: rng.intRange(5, 85), estimated_downtime_h: 2 },
      { task: 'Vacuum seal replacement', interval_days: 180, next_due_days: rng.intRange(10, 170), estimated_downtime_h: 8 },
      { task: 'Wafer stage bearing inspection', interval_days: 365, next_due_days: rng.intRange(20, 350), estimated_downtime_h: 12 },
      { task: 'Complete optical path alignment', interval_days: 90, next_due_days: rng.intRange(7, 88), estimated_downtime_h: 6 },
    ];

    // OEE calculation
    const availability = +rng.range(0.82, 0.96).toFixed(3);
    const performance = +rng.range(0.78, 0.94).toFixed(3);
    const quality = +rng.range(0.95, 0.998).toFixed(3);
    const oee = +(availability * performance * quality).toFixed(3);

    const report = {
      maintenance_id: `EPM-${seed.toString(16).toUpperCase().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      equipment: { equipment_id: equipId, equipment_type: equipType, operating_hours: operatingHours, sensor_health_status: sensorHealth },
      sensor_readings: sensors,
      mtbf_analysis: { current_mtbf_h: currentMTBF, predicted_mtbf_h: Math.round(currentMTBF * rng.range(0.85, 1.15)), mttr_h: +rng.range(2, 12).toFixed(1), availability_pct: +(availability * 100).toFixed(1) },
      failure_mode_predictions: failureModes,
      recommended_maintenance: maintenancePlan,
      oee_metrics: { availability_pct: +(availability * 100).toFixed(1), performance_pct: +(performance * 100).toFixed(1), quality_pct: +(quality * 100).toFixed(1), oee_pct: +(oee * 100).toFixed(1) },
      cost_projection: { estimated_annual_maintenance_cost: `$${rng.intRange(180, 450)}k`, avoided_downtime_savings: `$${rng.intRange(500, 2000)}k`, roi_pct: +rng.range(120, 280).toFixed(0) },
    };
    return JSON.stringify(report, null, 2);
  }
});

// =============================================================================
// Tool 4: process_integration_advisor — 工艺整合方案与DOE实验设计
// =============================================================================
const process_integration_advisor = defineTool({
  name: 'process_integration_advisor',
  description: 'Provide process integration roadmaps with DOE experimental design. Generates multi-step process flows, designs experiments, and optimizes integration schemes for advanced semiconductor manufacturing.',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON with: technology_node, process_module (FEOL/BEOL/MOL), target_specs, materials, integration_challenges, num_factors, num_runs_budget'
    }
  },
  output: outputSchema({ type: 'string' }, (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]),
  async execute(args: { input_data: string }) {
    const data = JSON.parse(args.input_data);
    const seed = SeededRandom.seedFromString(JSON.stringify(data));
    const rng = new SeededRandom(seed);

    const techNode = data.technology_node || '3nm';
    const module = data.process_module || 'FEOL';
    const numFactors = data.num_factors || 5;
    const numRuns = data.num_runs_budget || 40;

    // Process flow steps
    const processSteps = module === 'FEOL' ? [
      { step: 1, name: 'Shallow Trench Isolation (STI)', critical_params: ['Trench depth', 'Oxide fill', 'CMP dishing'], defect_risks: ['Void formation', 'Liners pinch-off'] },
      { step: 2, name: 'Well & Channel Implant', critical_params: ['Dose', 'Energy', 'Tilt angle'], defect_risks: ['Channeling', 'Shadowing'] },
      { step: 3, name: 'Gate Oxide / High-k Deposition', critical_params: ['Thickness', 'Uniformity', 'Interface quality'], defect_risks: ['Pinholes', 'Fixed charge'] },
      { step: 4, name: 'Metal Gate Patterning', critical_params: ['CD control', 'Line edge roughness', 'Work function'], defect_risks: ['Bridge', 'Missing pattern'] },
      { step: 5, name: 'Source/Drain Extension', critical_params: ['Junction depth', 'Sheet resistance', 'Activation'], defect_risks: ['Dopant diffusion', 'TED'] },
      { step: 6, name: 'Spacer Formation & HDD', critical_params: ['Spacer width', 'Profile', 'HDD dose'], defect_risks: ['Spacer etch damage', 'Facet formation'] },
      { step: 7, name: 'Silicidation (NiPt Si)', critical_params: ['Anneal temp', 'Film thickness', 'Phase control'], defect_risks: ['Pipe defects', 'Si consumption'] },
    ] : module === 'BEOL' ? [
      { step: 1, name: 'Low-k Dielectric Deposition', critical_params: ['k-value', 'Porosity', 'Mechanical strength'], defect_risks: ['Delamination', 'Poisoning'] },
      { step: 2, name: 'Dual Damascene Patterning', critical_params: ['CD uniformity', 'Overlay', 'Profile angle'], defect_risks: ['Missing vias', 'Trench bridging'] },
      { step: 3, name: 'Barrier/Seed Deposition', critical_params: ['TaN thickness', 'Cu seed continuity', 'Step coverage'], defect_risks: ['Void formation', 'Overhang'] },
      { step: 4, name: 'Cu Electroplating', critical_params: ['Current density', 'Additives', 'Annealing'], defect_risks: ['Seams', 'Voids'] },
      { step: 5, name: 'Cu CMP', critical_params: ['Removal rate', 'Selectivity', 'Dishing'], defect_risks: ['Erosion', 'Scratches'] },
    ] : [
      { step: 1, name: 'Contact Etch Stop Layer', critical_params: ['Film stress', 'Thickness', 'Etch selectivity'], defect_risks: ['Under etch', 'Silicon damage'] },
      { step: 2, name: 'Contact Hole Etching', critical_params: ['Profile', 'CD', 'Selectivity'], defect_risks: ['Stop on gate', 'Not open'] },
      { step: 3, name: 'Contact Plug Fill (W)', critical_params: ['Nucleation', 'Fill capability', 'Resistivity'], defect_risks: ['Void', 'Seam'] },
      { step: 4, name: 'Contact CMP', critical_params: ['Dishing', 'Recess', 'Residue'], defect_risks: ['Plug pull-out', 'Leakage'] },
    ];

    // DOE Design
    const doeFactors = [
      { name: 'Temperature (°C)', low: rng.intRange(350, 400), high: rng.intRange(550, 650), unit: '°C' },
      { name: 'Pressure (Torr)', low: +rng.range(1, 5).toFixed(1), high: +rng.range(15, 30).toFixed(1), unit: 'Torr' },
      { name: 'Gas Flow (sccm)', low: rng.intRange(50, 100), high: rng.intRange(300, 500), unit: 'sccm' },
      { name: 'RF Power (W)', low: rng.intRange(200, 300), high: rng.intRange(600, 800), unit: 'W' },
      { name: 'Time (s)', low: rng.intRange(20, 40), high: rng.intRange(80, 150), unit: 's' },
      { name: 'Spacing (nm)', low: +rng.range(10, 20).toFixed(0), high: +rng.range(40, 60).toFixed(0), unit: 'nm' },
    ].slice(0, numFactors);

    const doeType = numRuns <= 16 ? 'Fractional Factorial (2^(k-1))' : numRuns <= 32 ? 'Central Composite Design' : 'Box-Behnken / Full Response Surface';
    const responses = ['Sheet Resistance (Ω/sq)', 'Uniformity (% 3sigma)', 'Defect Density (cm⁻²)', 'Step Coverage (%)', 'Etch Rate (nm/min)', 'Film Stress (MPa)'];

    const doeMatrix = [];
    for (let i = 0; i < Math.min(numRuns, 12); i++) {
      const run: any = { run: i + 1 };
      doeFactors.forEach(f => {
        const level = rng.next() > 0.5 ? 'high' : 'low';
        run[f.name.split(' ')[0]] = level === 'high' ? '+' : '-';
      });
      doeMatrix.push(run);
    }

    // RSM predictions
    const rsmModel = {
      significant_factors: doeFactors.slice(0, rng.intRange(2, Math.min(4, numFactors))).map(f => f.name),
      predicted_optimum: Object.fromEntries(doeFactors.map(f => [f.name.split(' ')[0], +rng.range(f.low, f.high).toFixed(2)])),
      predicted_response_value: +rng.range(0.85, 0.98).toFixed(3),
      r_squared: +rng.range(0.88, 0.97).toFixed(3),
      adj_r_squared: +rng.range(0.85, 0.95).toFixed(3),
      lack_of_fit_p_value: +rng.range(0.05, 0.35).toFixed(3),
    };

    // Risk assessment
    const risks = [
      { risk: 'Thermal Budget Overrun', probability: 'Medium', impact: 'High', mitigation: 'Use spike anneal, reduce soak time' },
      { risk: 'Defectivity Spike', probability: 'Low', impact: 'Critical', mitigation: 'Add intermediate cleans, monitor baseline' },
      { risk: 'Overlay Cascade', probability: 'Medium', impact: 'High', mitigation: 'Implement feed-forward correction' },
      { risk: 'Material Compatibility', probability: 'Low', impact: 'Medium', mitigation: 'Perform compatibility split matrix' },
    ];

    const report = {
      integration_id: `PIA-${seed.toString(16).toUpperCase().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      technology_node: techNode,
      process_module: module,
      process_flow: processSteps,
      doe_design: { design_type: doeType, num_factors: numFactors, num_runs: numRuns, factors: doeFactors, response_variables: responses, design_matrix_sample: doeMatrix },
      rsm_optimization: rsmModel,
      risk_assessment: risks,
      timeline_estimate: { development_weeks: rng.intRange(8, 24), qualification_weeks: rng.intRange(12, 36), ramp_to_production_weeks: rng.intRange(6, 16) },
    };
    return JSON.stringify(report, null, 2);
  }
});

// =============================================================================
// Tool 5: defect_classification_ai — 晶圆缺陷自动分类与根因定位
// =============================================================================
const defect_classification_ai = defineTool({
  name: 'defect_classification_ai',
  description: 'Auto-classify wafer defects with AI-powered root cause analysis. Identifies defect types from SEM/Review images, correlates with process steps, and traces root causes for yield improvement.',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON with: wafer_id, scan_tool, defect_count, defect_images_meta, process_layer, inspection_type (ADI/AEI/AAI), historical_data'
    }
  },
  output: outputSchema({ type: 'string' }, (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]),
  async execute(args: { input_data: string }) {
    const data = JSON.parse(args.input_data);
    const seed = SeededRandom.seedFromString(JSON.stringify(data));
    const rng = new SeededRandom(seed);

    const waferId = data.wafer_id || 'W20260821-003';
    const scanTool = data.scan_tool || 'KLA eSL10 Recipe#4421';
    const totalDefects = data.defect_count || 287;
    const processLayer = data.process_layer || 'M1';

    // Defect classification distribution
    const defectClasses = [
      { class: 'Particle', count: 0, size_range_um: '0.1–2.0', color: 'Bright', confidence: 0 },
      { class: 'Scratch', count: 0, size_range_um: '5.0–50.0', color: 'Dark line', confidence: 0 },
      { class: 'Bridge/Short', count: 0, size_range_um: '0.05–0.5', color: 'Bright bridge', confidence: 0 },
      { class: 'Void/Pinhole', count: 0, size_range_um: '0.02–0.3', color: 'Dark spot', confidence: 0 },
      { class: 'Residue', count: 0, size_range_um: '0.2–3.0', color: 'Variable', confidence: 0 },
      { class: 'Pattern Collapse', count: 0, size_range_um: '0.1–5.0', color: 'Distorted', confidence: 0 },
      { class: 'CD Variation', count: 0, size_range_um: 'N/A', color: 'N/A', confidence: 0 },
      { class: 'Foreign Material', count: 0, size_range_um: '0.5–10.0', color: 'Variable', confidence: 0 },
    ];

    // Distribute defects across classes
    let remaining = totalDefects;
    for (let i = 0; i < defectClasses.length - 1; i++) {
      const portion = Math.floor(rng.range(0.05, 0.35) * remaining);
      defectClasses[i].count = portion;
      defectClasses[i].confidence = +rng.range(0.82, 0.99).toFixed(3);
      remaining -= portion;
    }
    defectClasses[defectClasses.length - 1].count = remaining;
    defectClasses[defectClasses.length - 1].confidence = +rng.range(0.82, 0.99).toFixed(3);

    // Sort by count descending
    defectClasses.sort((a, b) => b.count - a.count);

    // Root cause analysis
    const rootCauses = [
      { defect_class: 'Particle', root_cause: 'Chamber wall flaking — accumulated deposition exceeds season count', evidence: 'Particle composition matches chamber coating material (Al₂O₃)', correlating_tool: 'PECVD Chamber B3', action: 'Wet clean + chamber season rebuild', priority: 'P1' },
      { defect_class: 'Scratch', root_cause: 'CMP pad conditioning disc wear causing embedded diamond loss', evidence: 'Scratch orientation matches CMP platen rotation direction', correlating_tool: 'CMP Tool #7 (Reflexion)', action: 'Replace conditioning disc & pad, requalify', priority: 'P1' },
      { defect_class: 'Bridge/Short', root_cause: 'Lithography focus-exposure matrix shifted from optimum', evidence: 'Bridge pattern correlates with scanner grid correction residuals', correlating_tool: 'ASML NXT:2050i #3', action: 'Update focus-exposure matrix, monitor with CD-SEM', priority: 'P2' },
      { defect_class: 'Void/Pinhole', root_cause: 'Barrier PVD step coverage insufficient at high aspect ratio', evidence: 'Void location correlates with worst step coverage region (>10:1 AR)', correlating_tool: 'Endura PVD CV #12', action: 'Switch to CVD-Co barrier process', priority: 'P1' },
      { defect_class: 'Residue', root_cause: 'Post-etch photoresist strip incomplete — N₂/H₂ ratio drift', evidence: 'Residual carbon detected by EDX at defect site', correlating_tool: 'Ashing Tool #5', action: 'Calibrate N₂/H₂ gas ratio, extend ash time 10%', priority: 'P2' },
      { defect_class: 'Pattern Collapse', root_cause: 'CAP rinse surface tension too high — incomplete surfactant exchange', evidence: 'Collapsed patterns limited to dense array patterns (pitch < 40nm)', correlating_tool: 'Wet Bench #9', action: 'Validate surfactant concentration in rinse bath', priority: 'P2' },
    ];

    // Trend analysis
    const trendData = Array.from({ length: 10 }, (_, i) => ({
      lot_id: `L${202608210 + i}`,
      defect_count: Math.max(0, totalDefects + rng.intRange(-80, 80)),
      timestamp: new Date(Date.now() - (9 - i) * 3600000).toISOString(),
    }));

    const avgDefects = +(trendData.reduce((s, t) => s + t.defect_count, 0) / trendData.length).toFixed(1);
    const cl = avgDefects;
    const ucl = cl + 3 * Math.sqrt(cl);
    const lcl = Math.max(0, cl - 3 * Math.sqrt(cl));

    const report = {
      classification_id: `DCA-${seed.toString(16).toUpperCase().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      scan_info: { wafer_id: waferId, scan_tool: scanTool, process_layer: processLayer, inspection_type: data.inspection_type || 'AEI', total_defects_detected: totalDefects },
      defect_classification_summary: defectClasses.filter(d => d.count > 0),
      killer_defect_count: defectClasses.filter(d => ['Bridge/Short', 'Void/Pinhole', 'Pattern Collapse'].includes(d.class)).reduce((s, d) => s + d.count, 0),
      defect_density_per_cm2: +(totalDefects / (Math.PI * 15 * 15)).toFixed(3),
      root_cause_analysis: rootCauses,
      trend_monitoring: { last_10_lots: trendData, control_limits: { cl: +cl.toFixed(1), ucl: +ucl.toFixed(1), lcl: +lcl.toFixed(1) }, out_of_control_points: trendData.filter(t => t.defect_count > ucl).length },
      recommendations: [
        'Implement real-time SPC alarm on particle defect class exceeding UCL',
        'Schedule excursion investigation for lots with defect count > ' + Math.round(ucl),
        'DeployADC confidence threshold at 0.90 to reduce escapage rate',
        'Correlate defect maps with scanner slit signatures for litho溯源',
      ],
    };
    return JSON.stringify(report, null, 2);
  }
});

// =============================================================================
// Tool 6: mask_data_prep_optimizer — 光罩数据处理与OPC优化
// =============================================================================
const mask_data_prep_optimizer = defineTool({
  name: 'mask_data_prep_optimizer',
  description: 'Optimize mask data preparation with OPC, SRAF, and MRC verification. Performs optical proximity correction, sub-resolution assist feature insertion, and lithography simulation for photomasks.',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON with: design_file, layer, technology_node, illumination_type, OPC_model, target_cd_nm, pitch_nm, mask_type (COG/PSM/AttPSM/EUV)'
    }
  },
  output: outputSchema({ type: 'string' }, (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]),
  async execute(args: { input_data: string }) {
    const data = JSON.parse(args.input_data);
    const seed = SeededRandom.seedFromString(JSON.stringify(data));
    const rng = new SeededRandom(seed);

    const designFile = data.design_file || 'AI_Core_Top_MX.gds';
    const layer = data.layer || 'M1';
    const techNode = data.technology_node || '5nm';
    const targetCD = data.target_cd_nm || 24;
    const pitch = data.pitch_nm || 48;
    const maskType = data.mask_type || 'EUV';
    const illumination = data.illumination_type || 'Dipole (Y) σ=0.85/0.65';

    // OPC model parameters
    const opcModel = {
      model_type: 'Physics-based + ML Hybrid',
      resist_model: 'CMP-resist hybrid (Calibre nmOPC)',
      optical_model: 'Abbe source, 33 harmonics',
      sigma_in: 0.65, sigma_out: 0.85, sigma_ratio: +rng.range(0.72, 0.78).toFixed(2),
      wavelength_nm: maskType === 'EUV' ? 13.5 : 193,
      numerical_aperture: maskType === 'EUV' ? 0.33 : 1.35,
      k1_factor: +(pitch / (maskType === 'EUV' ? 13.5 : 193) / (maskType === 'EUV' ? 0.33 : 1.35)).toFixed(3),
    };

    // OPC corrections applied
    const opcCorrections = [
      { correction_type: 'Edge Fragmentation', segments_per_edge: rng.intRange(5, 12), max_move_nm: +rng.range(1.5, 3.0).toFixed(1), iteration_count: rng.intRange(8, 15) },
      { correction_type: 'Bias Table Application', cd_bias_nm: +rng.range(-1.5, 2.0).toFixed(2), apply_to: 'All 1D features' },
      { correction_type: 'SRAF Insertion', sraf_width_nm: +rng.range(12, 20).toFixed(0), sraf_gap_nm: +rng.range(30, 50).toFixed(0), sraf_count: rng.intRange(1200, 4500) },
      { correction_type: 'Model-Based OPC', convergence_rms_nm: +rng.range(0.3, 1.2).toFixed(2), simulation_points: rng.intRange(800000, 3200000) },
      { correction_type: 'Inverse Lithography (ILT)', enabled: maskType === 'EUV', hotspot_reduction_pct: +rng.range(40, 75).toFixed(0) },
    ];

    // MRC (Mask Rule Check) verification
    const mrcChecks = [
      { check: 'Min Feature Size', limit_nm: maskType === 'EUV' ? 20 : 32, actual_min_nm: +rng.range(24, 42).toFixed(1), status: 'Pass' },
      { check: 'Min Space', limit_nm: maskType === 'EUV' ? 20 : 32, actual_min_nm: +rng.range(22, 45).toFixed(1), status: 'Pass' },
      { check: 'Min Area', limit_nm2: maskType === 'EUV' ? 400 : 1024, actual_min_nm2: +rng.range(500, 1200).toFixed(0), status: 'Pass' },
      { check: 'Corner-to-Corner', limit_nm: maskType === 'EUV' ? 25 : 40, actual_min_nm: +rng.range(28, 50).toFixed(1), status: 'Pass' },
      { check: 'Notch Size', limit_nm: maskType === 'EUV' ? 18 : 28, actual_min_nm: +rng.range(20, 40).toFixed(1), status: 'Pass' },
    ].map(m => ({ ...m, status: (m.actual_min_nm !== undefined && m.actual_min_nm > m.limit_nm) || (m.actual_min_nm2 !== undefined && m.actual_min_nm2 > m.limit_nm2) ? 'Pass' : 'Fail' }));

    // Lithography process window simulation
    const processWindow = {
      el_pw_nm: +rng.range(3, 8).toFixed(1),
      target_dof_um: maskType === 'EUV' ? 0.12 : 0.25,
      achieved_dof_um: +rng.range(0.08, 0.22).toFixed(3),
      best_focus_nm: 0,
      best_dose_mj_cm2: +rng.range(22, 35).toFixed(1),
      image_log_slope: +rng.range(3.5, 6.2).toFixed(2),
      mask_error_enhancement_factor: +rng.range(1.5, 3.0).toFixed(2),
      normalized_image_log_slope: +rng.range(1.8, 3.5).toFixed(2),
    };

    // Hotspot analysis
    const hotspots = [
      { type: 'Pinch', count: rng.intRange(3, 15), layer: 'M1', epe_nm: +rng.range(1.5, 3.5).toFixed(1), status: 'Corrected' },
      { type: 'Bridge', count: rng.intRange(2, 12), layer: 'M1', epe_nm: +rng.range(1.2, 3.0).toFixed(1), status: 'Corrected' },
      { type: 'Tip-to-Tip', count: rng.intRange(1, 8), layer: 'VIA0', epe_nm: +rng.range(1.0, 2.8).toFixed(1), status: 'Corrected' },
      { type: 'Line End Shortening', count: rng.intRange(5, 20), layer: 'POLY', epe_nm: +rng.range(2.0, 4.5).toFixed(1), status: 'Partially Corrected' },
      { type: 'Overlay Sensitive', count: rng.intRange(0, 6), layer: 'CONT', epe_nm: +rng.range(0.8, 2.5).toFixed(1), status: 'Review' },
    ];

    const totalHotspots = hotspots.reduce((s, h) => s + h.count, 0);

    const report = {
      mdp_id: `MDP-${seed.toString(16).toUpperCase().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      input_info: { design_file: designFile, layer, technology_node: techNode, target_cd_nm: targetCD, pitch_nm: pitch, mask_type: maskType, illumination },
      opc_model: opcModel,
      opc_corrections: opcCorrections,
      mrc_verification: mrcChecks,
      lithography_simulation: processWindow,
      hotspot_analysis: { total_hotspots: totalHotspots, initial_hotspots: Math.round(totalHotspots * rng.range(3, 8)), remaining_hotspots: hotspots, correction_rate_pct: +rng.range(85, 99).toFixed(1) },
      mask_complexity: { total_polygons: rng.intRange(50000000, 200000000), fracturing_time_min: +rng.range(45, 180).toFixed(0), file_size_gb: +rng.range(15, 85).toFixed(1) },
      quality_metrics: { epe_mean_nm: +rng.range(0.5, 1.5).toFixed(2), epe_3sigma_nm: +rng.range(1.5, 3.5).toFixed(2), cd_uniformity_pct: +rng.range(2.5, 7.0).toFixed(1), wafer_print_fidelity_pct: +rng.range(96, 99.5).toFixed(1) },
    };
    return JSON.stringify(report, null, 2);
  }
});

// =============================================================================
// Tool 7: semiconductor_supply_chain — 芯片供应链风险与交期管理
// =============================================================================
const semiconductor_supply_chain = defineTool({
  name: 'semiconductor_supply_chain',
  description: 'Analyze semiconductor supply chain risks, component lead times, and logistics resilience. Identifies single-point-of-failure suppliers, forecasts delivery delays, and recommends mitigation strategies.',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON with: product_name, bom_components (array), suppliers, demand_forecast, current_inventory_days, geographic_risks, logistics_routes'
    }
  },
  output: outputSchema({ type: 'string' }, (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]),
  async execute(args: { input_data: string }) {
    const data = JSON.parse(args.input_data);
    const seed = SeededRandom.seedFromString(JSON.stringify(data));
    const rng = new SeededRandom(seed);

    const productName = data.product_name || 'AI Inference Chip (HBM3)';
    const inventoryDays = data.current_inventory_days || 21;

    // BOM components and risk assessment
    const bomComponents = [
      { component: 'SoC Die (3nm)', supplier: 'TSMC', region: 'Taiwan', lead_time_weeks: rng.intRange(12, 20), risk_level: 'High', single_source: true, unit_cost_usd: rng.intRange(800, 1500), quarterly_demand_k: rng.intRange(20, 80) },
      { component: 'HBM3 24GB Stack', supplier: 'SK Hynix', region: 'South Korea', lead_time_weeks: rng.intRange(16, 28), risk_level: 'Medium', single_source: false, unit_cost_usd: rng.intRange(180, 320), quarterly_demand_k: rng.intRange(20, 80) },
      { component: 'Silicon Interposer', supplier: 'TSMC/CoWoS', region: 'Taiwan', lead_time_weeks: rng.intRange(20, 36), risk_level: 'High', single_source: true, unit_cost_usd: rng.intRange(150, 400), quarterly_demand_k: rng.intRange(20, 80) },
      { component: 'ABF Substrate', supplier: 'Unimicron', region: 'Taiwan', lead_time_weeks: rng.intRange(8, 16), risk_level: 'Medium', single_source: false, unit_cost_usd: rng.intRange(30, 80), quarterly_demand_k: rng.intRange(25, 90) },
      { component: 'Power Management IC', supplier: 'Monolithic Power Systems', region: 'USA', lead_time_weeks: rng.intRange(6, 14), risk_level: 'Low', single_source: false, unit_cost_usd: rng.intRange(5, 25), quarterly_demand_k: rng.intRange(30, 100) },
      { component: 'Clock Generator', supplier: 'Renesas', region: 'Japan', lead_time_weeks: rng.intRange(10, 20), risk_level: 'Low', single_source: false, unit_cost_usd: rng.intRange(3, 15), quarterly_demand_k: rng.intRange(30, 100) },
      { component: 'Decoupling Capacitors (MLCC)', supplier: 'Murata', region: 'Japan', lead_time_weeks: rng.intRange(4, 12), risk_level: 'Low', single_source: false, unit_cost_usd: rng.intRange(0.05, 0.5), quarterly_demand_k: rng.intRange(500, 2000) },
      { component: 'Thermal Interface Material', supplier: 'Shin-Etsu', region: 'Japan', lead_time_weeks: rng.intRange(4, 10), risk_level: 'Low', single_source: false, unit_cost_usd: rng.intRange(2, 8), quarterly_demand_k: rng.intRange(20, 80) },
      { component: 'FCBGA Package', supplier: 'ASE Group', region: 'Taiwan', lead_time_weeks: rng.intRange(6, 12), risk_level: 'Medium', single_source: false, unit_cost_usd: rng.intRange(40, 120), quarterly_demand_k: rng.intRange(20, 80) },
    ];

    // Risk analysis
    const geographic_risks = [
      { region: 'Taiwan', risk_score: rng.intRange(65, 85), risk_factors: ['Geopolitical tension', 'Earthquake zone', 'TSMC concentration'], mitigation: 'Diversify to Samsung Foundry, Intel Foundry' },
      { region: 'South Korea', risk_score: rng.intRange(30, 50), risk_factors: ['Labor strikes', 'Memory market volatility'], mitigation: 'Dual-source memory from Micron (USA)' },
      { region: 'Japan', risk_score: rng.intRange(15, 30), risk_factors: ['Aging workforce', 'Historical natural disasters'], mitigation: 'Strategic stockpile for 6-month supply' },
      { region: 'China', risk_score: rng.intRange(55, 75), risk_factors: ['Export controls', 'Technology sanctions'], mitigation: 'Exclude from sensitive node supply chain' },
    ];

    // Demand forecast
    const demandForecast = Array.from({ length: 8 }, (_, i) => ({
      quarter: `Q${(i % 4) + 1} 202${Math.floor(i / 4) + 6}`,
      forecast_demand_k: rng.intRange(15, 90),
      lower_bound_k: 0,
      upper_bound_k: 0,
    })).map(d => ({ ...d, lower_bound_k: Math.round(d.forecast_demand_k * 0.8), upper_bound_k: Math.round(d.forecast_demand_k * 1.25) }));

    // Mitigation strategies
    const strategies = [
      { strategy: 'Safety Stock Increase', target_components: ['SoC Die', 'Silicon Interposer'], additional_inventory_days: 30, cost_impact_usd: rng.intRange(500000, 1500000), benefit: 'Reduces stock-out risk by 40%' },
      { strategy: 'Second Source Qualification', target_components: ['ABF Substrate', 'FCBGA Package'], timeline_months: rng.intRange(6, 12), cost_impact_usd: rng.intRange(200000, 800000), benefit: 'Removes single-point-of-failure' },
      { strategy: 'Long-term Supply Agreement', target_components: ['HBM3 Stack'], duration_years: 3, cost_impact_usd: rng.intRange(1000000, 5000000), benefit: 'Guaranteed allocation at fixed price' },
      { strategy: 'Regional Diversification', target_components: ['SoC Die (Samsung/Intel)'], timeline_months: rng.intRange(12, 24), cost_impact_usd: rng.intRange(2000000, 8000000), benefit: 'Reduces Taiwan concentration risk by 30%' },
    ];

    const totalBOMCost = bomComponents.reduce((s, c) => s + c.unit_cost_usd, 0);

    const report = {
      supply_chain_id: `SCM-${seed.toString(16).toUpperCase().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      product: productName,
      bom_summary: { total_components: bomComponents.length, total_bom_cost_usd: +totalBOMCost.toFixed(2), avg_lead_time_weeks: +(bomComponents.reduce((s, c) => s + c.lead_time_weeks, 0) / bomComponents.length).toFixed(1), max_lead_time_weeks: Math.max(...bomComponents.map(c => c.lead_time_weeks)) },
      bom_detail: bomComponents,
      supply_risk_heatmap: geographic_risks,
      single_source_components: bomComponents.filter(c => c.single_source).map(c => c.component),
      current_inventory_coverage_days: inventoryDays,
      inventory_status: inventoryDays < 14 ? 'CRITICAL - Below safety stock' : inventoryDays < 30 ? 'LOW - Consider replenishment' : 'ADEQUATE',
      demand_forecast_8q: demandForecast,
      mitigation_strategies: strategies,
      overall_supply_chain_risk_score: +rng.range(45, 72).toFixed(0),
    };
    return JSON.stringify(report, null, 2);
  }
});

// =============================================================================
// Tool 8: fab_energy_sustainability — 晶圆厂能耗分析与超纯水/化学品管理
// =============================================================================
const fab_energy_sustainability = defineTool({
  name: 'fab_energy_sustainability',
  description: 'Analyze fab energy consumption with UPW/chemicals management. Tracks carbon footprint, water usage, chemical waste, and sustainability KPIs for semiconductor manufacturing facilities.',
  parameters: {
    input_data: {
      type: 'string' as const, required: true,
      description: 'JSON with: fab_name, wafer_starts_per_month, energy_consumption_mwh, upw_usage_liters, chemical_inventory, renewable_energy_pct, scope12_emissions_tco2e, sustainability_targets'
    }
  },
  output: outputSchema({ type: 'string' }, (_a: any, v: any) => [{ type: 'text' as const, text: v as string }]),
  async execute(args: { input_data: string }) {
    const data = JSON.parse(args.input_data);
    const seed = SeededRandom.seedFromString(JSON.stringify(data));
    const rng = new SeededRandom(seed);

    const fabName = data.fab_name || 'Fab-12A (3nm Ramp)';
    const waferStarts = data.wafer_starts_per_month || 45000;
    const totalEnergyMWh = data.energy_consumption_mwh || 85000;
    const upwLiters = data.upw_usage_liters || 180000000;
    const renewablePct = data.renewable_energy_pct || 22;
    const scope12Emissions = data.scope12_emissions_tco2e || 52000;

    // Energy breakdown
    const energyBreakdown = [
      { system: 'Process Equipment', consumption_pct: +rng.range(35, 45).toFixed(1), mwh_monthly: +(totalEnergyMWh * 0.40).toFixed(0), key_tools: ['Lithography (EUV/DUV)', 'Etch', 'CVD/PVD', 'Implant'] },
      { system: 'HVAC / Cleanroom', consumption_pct: +rng.range(20, 28).toFixed(1), mwh_monthly: +(totalEnergyMWh * 0.24).toFixed(0), key_tools: ['MAU', 'FFU array', 'Chilled water pumps'] },
      { system: 'UPW Systems', consumption_pct: +rng.range(8, 14).toFixed(1), mwh_monthly: +(totalEnergyMWh * 0.11).toFixed(0), key_tools: ['RO systems', 'UV sterilization', 'Polish loops'] },
      { system: 'Vacuum & Exhaust', consumption_pct: +rng.range(6, 10).toFixed(1), mwh_monthly: +(totalEnergyMWh * 0.08).toFixed(0), key_tools: ['Dry pumps', 'Turbo pumps', 'Scrubbers'] },
      { system: 'Facilities Support', consumption_pct: +rng.range(5, 10).toFixed(1), mwh_monthly: +(totalEnergyMWh * 0.07).toFixed(0), key_tools: ['Chillers', 'Compressors', 'Lighting'] },
      { system: 'Abatement Systems', consumption_pct: +rng.range(3, 7).toFixed(1), mwh_monthly: +(totalEnergyMWh * 0.05).toFixed(0), key_tools: ['Point-of-use abatement', 'Central scrubbers', 'Thermal oxidizers'] },
    ];

    // UPW analysis
    const upwAnalysis = {
      total_production_liters_month: upwLiters,
      upw_per_wafer_liters: +(upwLiters / waferStarts).toFixed(0),
      resistivity_target_mohm_cm: 18.2,
      resistivity_actual_mohm_cm: +rng.range(18.0, 18.2).toFixed(2),
      toc_ppb: +rng.range(0.3, 1.5).toFixed(2),
      particle_count_per_ml_0_06um: rng.intRange(1, 8),
      recovery_rate_pct: +rng.range(75, 88).toFixed(1),
      reclamation_potential_pct: +rng.range(15, 30).toFixed(1),
      cost_per_liter_usd: +rng.range(0.003, 0.008).toFixed(4),
    };

    // Chemical management
    const chemicals = [
      { chemical: 'Sulfuric Acid (H₂SO₄)', usage_kg_month: rng.intRange(8000, 25000), hazard_class: 'Corrosive', recycling_pct: +rng.range(0, 5).toFixed(0), cost_usd_month: rng.intRange(5000, 15000) },
      { chemical: 'Hydrogen Peroxide (H₂O₂)', usage_kg_month: rng.intRange(5000, 18000), hazard_class: 'Oxidizer', recycling_pct: 0, cost_usd_month: rng.intRange(8000, 25000) },
      { chemical: 'Isopropyl Alcohol (IPA)', usage_kg_month: rng.intRange(2000, 8000), hazard_class: 'Flammable', recycling_pct: +rng.range(40, 70).toFixed(0), cost_usd_month: rng.intRange(3000, 12000) },
      { chemical: 'Photoresist (EUV)', usage_liters_month: rng.intRange(200, 800), hazard_class: 'Organic solvent', recycling_pct: 0, cost_usd_month: rng.intRange(200000, 800000) },
      { chemical: 'Tetramethylammonium Hydroxide (TMAH)', usage_kg_month: rng.intRange(1000, 5000), hazard_class: 'Toxic', recycling_pct: +rng.range(20, 50).toFixed(0), cost_usd_month: rng.intRange(5000, 20000) },
      { chemical: 'Hydrofluoric Acid (HF)', usage_kg_month: rng.intRange(500, 3000), hazard_class: 'Highly Toxic', recycling_pct: +rng.range(10, 30).toFixed(0), cost_usd_month: rng.intRange(2000, 8000) },
      { chemical: 'CMP Slurry', usage_liters_month: rng.intRange(5000, 20000), hazard_class: 'Suspension', recycling_pct: 0, cost_usd_month: rng.intRange(100000, 500000) },
      { chemical: 'Specialty Gases (NF₃/SF₆)', usage_kg_month: rng.intRange(2000, 10000), hazard_class: 'GHG / High GWP', recycling_pct: +rng.range(5, 20).toFixed(0), cost_usd_month: rng.intRange(50000, 200000) },
    ];

    // Emissions
    const emissions = {
      scope1_direct_tco2e: +(scope12Emissions * rng.range(0.15, 0.30)).toFixed(0),
      scope2_indirect_tco2e: +(scope12Emissions * rng.range(0.70, 0.85)).toFixed(0),
      pfc_emissions_tco2e: +(scope12Emissions * rng.range(0.05, 0.15)).toFixed(0),
      total_scope12_tco2e: scope12Emissions,
      emissions_per_wafer_kg: +(scope12Emissions * 1000 / waferStarts).toFixed(1),
      renewable_energy_pct: renewablePct,
      carbon_intensity_kg_per_kwh: +((100 - renewablePct) / 100 * 0.5).toFixed(3),
    };

    // Sustainability KPIs
    const sustainabilityKPIs = {
      energy_per_wafer_kwh: +(totalEnergyMWh * 1000 / waferStarts).toFixed(1),
      water_per_wafer_l: +(upwLiters / waferStarts).toFixed(0),
      landfill_waste_pct: +rng.range(5, 20).toFixed(1),
      recycling_rate_pct: +rng.range(60, 85).toFixed(1),
      chemical_reuse_pct: +rng.range(15, 40).toFixed(1),
      esg_score: rng.intRange(55, 82),
      re100_progress_pct: renewablePct,
      net_zero_target_year: rng.intRange(2040, 2050),
    };

    const report = {
      sustainability_id: `FES-${seed.toString(16).toUpperCase().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      fab_info: { fab_name: fabName, wafer_starts_per_month: waferStarts, technology_node: '3nm' },
      energy_analysis: { total_monthly_mwh: totalEnergyMWh, breakdown: energyBreakdown, energy_per_wafer_kwh: sustainabilityKPIs.energy_per_wafer_kwh, renewable_energy_pct: renewablePct, energy_cost_usd_month: rng.intRange(5000000, 12000000) },
      upw_management: upwAnalysis,
      chemical_management: chemicals,
      carbon_emissions: emissions,
      sustainability_kpis: sustainabilityKPIs,
      recommendations: [
        'Increase UPW reclamation to 25% — potential savings: $' + (upwLiters * 0.1 * upwAnalysis.cost_per_liter_usd / 1000).toFixed(0) + 'k/month',
        'Install solar PV on roof space — estimated +8% renewable energy share',
        'Replace NF₃ with lower-GWP etch gases in select chambers',
        'Implement AI-based HVAC optimization — projected 12% cleanroom energy reduction',
        'Target landfill diversion rate > 90% by 2027 through waste stream segregation',
      ],
      capex_projections: { energy_efficiency_investments_usd: `$${rng.intRange(2, 8)}M`, carbon_reduction_savings_tco2e_annual: rng.intRange(3000, 12000), payback_period_years: +rng.range(2, 5).toFixed(1) },
    };
    return JSON.stringify(report, null, 2);
  }
});

// =============================================================================
// Register all tools
// =============================================================================
export function apply(ctx: Context) {
  const tools = ctx.tools
  tools.register(yield_optimization_engine)
  tools.register(chip_design_verifier)
  tools.register(equipment_predictive_maintenance)
  tools.register(process_integration_advisor)
  tools.register(defect_classification_ai)
  tools.register(mask_data_prep_optimizer)
  tools.register(semiconductor_supply_chain)
  tools.register(fab_energy_sustainability)
}

