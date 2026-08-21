import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'textileagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供纺织制造工艺参考，不替代专业纺织工程师决策。';

// mulberry32 deterministic PRNG
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function round(v: number, d = 2): number {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// ============================================================
// 1. fabric_quality_inspector — 面料质量检测与瑕疵评级
// ============================================================
interface FabricQualityInput {
  fabric_type?: string;
  weave_pattern?: string;
  weight_gsm?: number;
  width_cm?: number;
  batch_id?: string;
  inspection_method?: string;
  defect_types?: string[];
  sample_size?: number;
}

interface FabricQualityResult {
  overall_grade: { grade: string; score: number; acceptance: string };
  defect_analysis: Array<{ defect: string; count: number; severity: string; points_per_defect: number; total_points: number }>;
  physical_properties: { weight_gsm: number; tensile_strength_n: number; tear_strength_n: number; shrinkage_percent: number; color_fastness: number };
  four_point_system: { total_points: number; points_per_100sqm: number; grade: string };
  appearance: { hand_feel: string; surface_uniformity: string; color_consistency: string; pilling_grade: number };
  recommendations: string[];
  disclaimer: string;
}

function analyzeFabricQuality(data: FabricQualityInput): FabricQualityResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const fabricType = data.fabric_type || pick(rng, ['纯棉坯布', '涤棉混纺', '纯涤纶', '棉麻混纺', '弹力牛仔布', '羊毛面料', '尼龙面料', '色织布']);
  const weight = data.weight_gsm ?? round(100 + rng() * 300, 0);
  const width = data.width_cm ?? pick(rng, [150, 180, 200, 220, 250]);
  const sampleSize = data.sample_size ?? Math.round(50 + rng() * 150);

  const defectTypes = [
    { defect: '断经', severity: '严重', points: 4 },
    { defect: '断纬', severity: '严重', points: 4 },
    { defect: '粗节', severity: '中等', points: 2 },
    { defect: '油污', severity: '中等', points: 2 },
    { defect: '色差', severity: '轻微', points: 1 },
    { defect: '筘路', severity: '轻微', points: 1 },
    { defect: '棉结', severity: '轻微', points:1 },
    { defect: '破洞', severity: '严重', points: 4 },
    { defect: '纬斜', severity: '中等', points: 2 },
    { defect: '松板印', severity: '轻微', points: 1 },
  ];

  const defectCount = 3 + Math.floor(rng() * 5);
  const defects = defectTypes.slice(0, defectCount).map(d => {
    const count = Math.max(1, Math.round(rng() * 8));
    return { ...d, count, points_per_defect: d.points, total_points: count * d.points };
  });

  const totalPoints = defects.reduce((s, d) => s + d.total_points, 0);
  const inspectionArea = sampleSize * (width / 100) * 30;
  const pointsPer100Sqm = round((totalPoints * 100) / inspectionArea, 1);
  const grade = pointsPer100Sqm <= 10 ? 'A级(优等)' : pointsPer100Sqm <= 20 ? 'B级(一等)' : pointsPer100Sqm <= 35 ? 'C级(合格)' : 'D级(不合格)';
  const score = Math.max(0, round(100 - pointsPer100Sqm * 1.5, 1));

  const tensileBase = fabricType.includes('涤纶') ? 800 : fabricType.includes('尼龙') ? 700 : fabricType.includes('牛仔') ? 500 : 300;
  const tensile = round(tensileBase + rng() * tensileBase * 0.5, 0);
  const tear = round(tensile * (0.08 + rng() * 0.07), 0);
  const shrinkage = round(rng() * 8, 1);
  const colorFastness = round(3 + rng() * 2, 1);

  const handFeel = pick(rng, ['柔软', '适中', '偏硬', '滑爽', '厚实']);
  const uniformity = pick(rng, ['均匀良好', '基本均匀', '轻微不匀', '局部不匀']);
  const colorConsistency = pick(rng, ['色差极小', '可接受范围', '轻微色差', '需关注']);
  const pillingGrade = round(2 + rng() * 3, 1);

  const recommendations: string[] = [];
  if (pointsPer100Sqm > 20) recommendations.push('建议加强织造过程质量控制，降低瑕疵密度');
  if (shrinkage > 5) recommendations.push('缩水率偏高，建议增加预缩整理工序');
  if (colorFastness < 4) recommendations.push('色牢度不足，建议优化染色固色工艺');
  if (pillingGrade < 3.5) recommendations.push('抗起球等级偏低，建议增加烧毛或抗整理');
  if (recommendations.length === 0) recommendations.push('面料质量总体良好，可正常放行');

  return {
    overall_grade: { grade, score, acceptance: score >= 60 ? '接受' : '拒收' },
    defect_analysis: defects,
    physical_properties: { weight_gsm: weight, tensile_strength_n: tensile, tear_strength_n: tear, shrinkage_percent: shrinkage, color_fastness: colorFastness },
    four_point_system: { total_points: totalPoints, points_per_100sqm: pointsPer100Sqm, grade },
    appearance: { hand_feel: handFeel, surface_uniformity: uniformity, color_consistency: colorConsistency, pilling_grade: pillingGrade },
    recommendations,
    disclaimer: DISCLAIMER,
  };
}

function formatFabricQuality(r: FabricQualityResult): string {
  let s = '=== 面料质量检测与瑕疵评级报告 ===\n\n';
  s += '【综合评级】\n';
  s += `  等级: ${r.overall_grade.grade}\n`;
  s += `  评分: ${r.overall_grade.score}/100\n`;
  s += `  判定: ${r.overall_grade.acceptance}\n\n`;
  s += '【瑕疵分析(四分制)】\n';
  r.defect_analysis.forEach(d => {
    s += `  ${d.defect} — 数量: ${d.count} | 严重度: ${d.severity} | 扣分: ${d.total_points}分\n`;
  });
  s += `  总扣分: ${r.four_point_system.total_points}分\n`;
  s += `  每100㎡扣分: ${r.four_point_system.points_per_100sqm}分\n`;
  s += `  4-Point评级: ${r.four_point_system.grade}\n\n`;
  s += '【物理性能】\n';
  s += `  克重: ${r.physical_properties.weight_gsm} g/m²\n`;
  s += `  拉伸强力: ${r.physical_properties.tensile_strength_n} N\n`;
  s += `  撕裂强力: ${r.physical_properties.tear_strength_n} N\n`;
  s += `  缩水率: ${r.physical_properties.shrinkage_percent}%\n`;
  s += `  色牢度: ${r.physical_properties.color_fastness}级\n\n`;
  s += '【外观评价】\n';
  s += `  手感: ${r.appearance.hand_feel}\n`;
  s += `  布面均匀度: ${r.appearance.surface_uniformity}\n`;
  s += `  颜色一致性: ${r.appearance.color_consistency}\n`;
  s += `  抗起球等级: ${r.appearance.pilling_grade}级\n\n`;
  s += '【改进建议】\n';
  r.recommendations.forEach(rec => { s += `  • ${rec}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. dyeing_process_optimizer — 染色工艺优化与色差控制
// ============================================================
interface DyeingInput {
  fabric_type?: string;
  fiber_composition?: string;
  target_color?: string;
  color_system?: string;
  target_de?: number;
  machine_type?: string;
  bath_ratio?: number;
  dye_type?: string;
  auxiliaries?: string[];
}

interface DyeingResult {
  color_target: { l: number; a: number; b: number; de_target: number; tolerance: string };
  recipe_formulation: Array<{ chemical: string; concentration_g_l: number; function: string; addition_stage: string }>;
  temperature_profile: Array<{ stage: string; temp_c: number; duration_min: number; rate_c_per_min: number }>;
  color_difference: { de_actual: number; dl: number; da: number; db: number; result: string; pass_fail: string };
  process_parameters: { ph: number; bath_ratio: number; liquor_ratio: string; total_time_min: number; fixation_rate: number };
  quality_checks: Array<{ item: string; standard: string; actual: string; status: string }>;
  troubleshooting: Array<{ issue: string; cause: string; solution: string }>;
  disclaimer: string;
}

function analyzeDyeing(data: DyeingInput): DyeingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const fabricType = data.fabric_type || pick(rng, ['纯棉针织布', '涤棉梭织物', '涤纶经编布', '尼龙塔夫绸', '棉麻混纺布']);
  const dyeType = data.dye_type || pick(rng, ['活性染料', '分散染料', '还原染料', '酸性染料', '直接染料']);
  const machineType = data.machine_type || pick(rng, ['气流染色机', '喷射染色机', '卷染机', '经轴染色机', '溢流染色机']);
  const bathRatio = data.bath_ratio ?? pick(rng, [1/8, 1/10, 1/12, 1/15]);
  const targetDe = data.target_de ?? round(1.0 + rng() * 1.5, 2);

  const lVal = round(30 + rng() * 60, 2);
  const aVal = round(-20 + rng() * 40, 2);
  const bVal = round(-20 + rng() * 40, 2);

  const recipes: Record<string, Array<{ chemical: string; concentration_g_l: number; function: string; addition_stage: string }>> = {
    '活性染料': [
      { chemical: '活性染料', concentration_g_l: round(5 + rng() * 25, 1), function: '着色', addition_stage: '初染' },
      { chemical: '元明粉', concentration_g_l: round(30 + rng() * 40, 0), function: '促染', addition_stage: '初染' },
      { chemical: '纯碱', concentration_g_l: round(10 + rng() * 15, 0), function: '固色', addition_stage: '加碱' },
      { chemical: '匀染剂', concentration_g_l: round(0.5 + rng() * 1, 1), function: '匀染', addition_stage: '初染' },
    ],
    '分散染料': [
      { chemical: '分散染料', concentration_g_l: round(2 + rng() * 15, 1), function: '着色', addition_stage: '初染' },
      { chemical: '醋酸', concentration_g_l: round(0.5 + rng() * 1, 1), function: 'pH调节', addition_stage: '初染' },
      { chemical: '高温匀染剂', concentration_g_l: round(1 + rng() * 2, 1), function: '匀染', addition_stage: '初染' },
      { chemical: '分散剂', concentration_g_l: round(1 + rng() * 1.5, 1), function: '分散', addition_stage: '初染' },
    ],
    '还原染料': [
      { chemical: '还原染料', concentration_g_l: round(5 + rng() * 20, 1), function: '着色', addition_stage: '初染' },
      { chemical: '烧碱', concentration_g_l: round(15 + rng() * 15, 0), function: '还原', addition_stage: '初染' },
      { chemical: '保险粉', concentration_g_l: round(3 + rng() * 5, 0), function: '还原剂', addition_stage: '初染' },
      { chemical: '扩散剂NNO', concentration_g_l: round(1 + rng() * 2, 1), function: '扩散', addition_stage: '初染' },
    ],
  };
  const recipe = recipes[dyeType] || recipes['活性染料'];

  const tempProfile = dyeType === '分散染料'
    ? [
        { stage: '升温1', temp_c: round(60 + rng() * 10, 0), duration_min: 10, rate_c_per_min: round(1 + rng() * 0.5, 1) },
        { stage: '升温2', temp_c: round(100 + rng() * 10, 0), duration_min: 20, rate_c_per_min: round(1.5 + rng() * 0.5, 1) },
        { stage: '高温保温', temp_c: round(130 + rng() * 10, 0), duration_min: round(30 + rng() * 30, 0), rate_c_per_min: 0 },
        { stage: '降温', temp_c: round(75 + rng() * 10, 0), duration_min: 15, rate_c_per_min: round(2 + rng() * 1, 1) },
      ]
    : [
        { stage: '升温', temp_c: round(40 + rng() * 20, 0), duration_min: 15, rate_c_per_min: round(1 + rng() * 1, 1) },
        { stage: '保温染色', temp_c: round(60 + rng() * 20, 0), duration_min: round(30 + rng() * 30, 0), rate_c_per_min: 0 },
        { stage: '加碱固色', temp_c: round(60 + rng() * 10, 0), duration_min: round(20 + rng() * 20, 0), rate_c_per_min: 0 },
        { stage: '降温水洗', temp_c: round(50 + rng() * 10, 0), duration_min: 15, rate_c_per_min: round(1.5 + rng() * 1, 1) },
      ];

  const dlVal = round(-1 + rng() * 2, 2);
  const daVal = round(-1 + rng() * 2, 2);
  const dbVal = round(-1 + rng() * 2, 2);
  const deActual = round(Math.sqrt(dlVal * dlVal + daVal * daVal + dbVal * dbVal), 2);
  const passFail = deActual <= targetDe ? '合格(PASS)' : '不合格(FAIL)';

  const totalTime = tempProfile.reduce((s, t) => s + t.duration_min, 0);
  const fixationRate = round(75 + rng() * 20, 1);

  const checks = [
    { item: '色差(DE)', standard: `≤${targetDe}`, actual: `${deActual}`, status: deActual <= targetDe ? '合格' : '不合格' },
    { item: '干摩擦牢度', standard: '≥3-4级', actual: `${round(3 + rng() * 1.5, 1)}级`, status: '合格' },
    { item: '湿摩擦牢度', standard: '≥3级', actual: `${round(2.5 + rng() * 1.5, 1)}级`, status: '合格' },
    { item: '皂洗牢度', standard: '≥3-4级', actual: `${round(3 + rng() * 1.5, 1)}级`, status: '合格' },
    { item: '日晒牢度', standard: '≥4级', actual: `${round(3.5 + rng() * 2, 1)}级`, status: '合格' },
  ];

  const troubleshooting = [
    { issue: '色花(染色不匀)', cause: '升温速率过快或匀染剂不足', solution: '降低升温速率，增加匀染剂用量，延长保温时间' },
    { issue: '色差批次间', cause: '染液浓度波动或布速不一致', solution: '精确称量染料，校准配料系统，统一工艺参数' },
    { issue: '色牢度不足', cause: '固色条件不充分或后处理不足', solution: '优化固色温度/时间，加强皂洗和水洗工序' },
    { issue: '低聚物沾污', cause: '涤纶高温染色低聚物析出', solution: '加入低聚物分散剂，染色后热迁移清洗' },
  ];

  return {
    color_target: { l: lVal, a: aVal, b: bVal, de_target: targetDe, tolerance: `DE≤${targetDe}` },
    recipe_formulation: recipe,
    temperature_profile: tempProfile,
    color_difference: { de_actual: deActual, dl: dlVal, da: daVal, db: dbVal, result: `DL=${dlVal} DA=${daVal} DB=${dbVal}`, pass_fail: passFail },
    process_parameters: { ph: round(4.5 + rng() * 7, 1), bath_ratio: bathRatio, liquor_ratio: `1:${Math.round(1/bathRatio)}`, total_time_min: totalTime, fixation_rate: fixationRate },
    quality_checks: checks,
    troubleshooting,
    disclaimer: DISCLAIMER,
  };
}

function formatDyeing(r: DyeingResult): string {
  let s = '=== 染色工艺优化与色差控制报告 ===\n\n';
  s += '【目标色值】\n';
  s += `  L*: ${r.color_target.l} | a*: ${r.color_target.a} | b*: ${r.color_target.b}\n`;
  s += `  DE目标: ≤${r.color_target.de_target} | 容差: ${r.color_target.tolerance}\n\n`;
  s += '【配方方案】\n';
  r.recipe_formulation.forEach(c => {
    s += `  ${c.chemical}: ${c.concentration_g_l} g/L — ${c.function} (阶段: ${c.addition_stage})\n`;
  });
  s += '\n【温控曲线】\n';
  r.temperature_profile.forEach(t => {
    s += `  ${t.stage}: ${t.temp_c}°C × ${t.duration_min}min (升温速率: ${t.rate_c_per_min}°C/min)\n`;
  });
  s += `\n【色差检测】\n`;
  s += `  DE实际值: ${r.color_difference.de_actual} | ${r.color_difference.result}\n`;
  s += `  判定: ${r.color_difference.pass_fail}\n\n`;
  s += '【工艺参数】\n';
  s += `  pH: ${r.process_parameters.ph}\n`;
  s += `  浴比: ${r.process_parameters.liquor_ratio}\n`;
  s += `  总时长: ${r.process_parameters.total_time_min} min\n`;
  s += `  上染率: ${r.process_parameters.fixation_rate}%\n\n`;
  s += '【质量检测】\n';
  r.quality_checks.forEach(q => {
    s += `  ${q.item}: 标准${q.standard} | 实测${q.actual} | ${q.status}\n`;
  });
  s += '\n【常见问题与对策】\n';
  r.troubleshooting.forEach(t => {
    s += `  ${t.issue}\n    原因: ${t.cause}\n    对策: ${t.solution}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. textile_machine_scheduler — 织机排产与效率OEE分析
// ============================================================
interface SchedulerInput {
  loom_type?: string;
  num_looms?: number;
  order_list?: Array<{ order_id: string; fabric_type: string; quantity_m: number; deadline_days: number; priority: string }>;
  shift_pattern?: string;
  working_hours?: number;
  target_oee?: number;
  warp_type?: string;
  weft_density?: number;
}

interface SchedulerResult {
  oee_analysis: { availability: number; performance: number; quality: number; oee: number; benchmark: string; world_class: boolean };
  production_schedule: Array<{ loom_id: string; order_id: string; fabric: string; start_time: string; duration_h: number; expected_output_m: number }>;
  utilization: { total_capacity_m: number; planned_output_m: number; utilization_rate: number; idle_hours: number };
  downtime_analysis: Array<{ type: string; duration_min: number; frequency: number; impact: string; solution: string }>;
  efficiency_metrics: { rpm: number; picks_per_min: number; waste_rate: number; first_pass_yield: number; on_time_delivery: number };
  maintenance_plan: Array<{ type: string; interval_days: number; last_done: string; next_due: string; duration_h: number }>;
  disclaimer: string;
}

function analyzeScheduler(data: SchedulerInput): SchedulerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const loomType = data.loom_type || pick(rng, ['喷气织机', '剑杆织机', '喷水织机', '片梭织机', '多臂织机']);
  const numLooms = data.num_looms ?? Math.round(20 + rng() * 80);
  const workingHours = data.working_hours ?? 22;
  const targetOee = data.target_oee ?? round(75 + rng() * 15, 1);

  const availability = round(80 + rng() * 15, 1);
  const performance = round(75 + rng() * 20, 1);
  const quality = round(90 + rng() * 8, 1);
  const oee = round((availability / 100) * (performance / 100) * (quality / 100) * 100, 1);
  const worldClass = oee >= 85;

  const fabrics = ['纯棉平布', '涤棉斜纹', '牛仔布', '府绸', '牛津纺', '灯芯绒', '帆布'];
  const schedule = [];
  for (let i = 0; i < Math.min(numLooms, 8); i++) {
    const fabric = pick(rng, fabrics);
    const rpm = loomType === '喷气织机' ? round(600 + rng() * 300, 0) : round(200 + rng() * 200, 0);
    const picks = round(400 + rng() * 300, 0);
    const efficiency = performance / 100;
    const output = round(workingHours * 60 * picks * efficiency / 1000, 0);
    schedule.push({
      loom_id: `L${String(i + 1).padStart(3, '0')}`,
      order_id: `ORD-${String(Math.round(rng() * 9000 + 1000))}`,
      fabric,
      start_time: `${6 + Math.floor(rng() * 2)}:00`,
      duration_h: workingHours,
      expected_output_m: output,
    });
  }

  const plannedOutput = schedule.reduce((s, sch) => s + sch.expected_output_m, 0);
  const totalCapacity = plannedOutput * (100 / performance);
  const utilizationRate = round((plannedOutput / totalCapacity) * 100, 1);

  const downtimes = [
    { type: '经纱断头', duration_min: round(3 + rng() * 5, 1), frequency: round(10 + rng() * 20, 0), impact: '中等', solution: '优化上机张力，加强经纱准备质量' },
    { type: '纬纱断头', duration_min: round(2 + rng() * 4, 1), frequency: round(15 + rng() * 25, 0), impact: '中等', solution: '调整引纬气压/水压，优化梭口参数' },
    { type: '机械故障', duration_min: round(15 + rng() * 45, 0), frequency: round(1 + rng() * 3, 0), impact: '严重', solution: '执行TPM预防性维护，备品备件管理' },
    { type: '换轴/上轴', duration_min: round(30 + rng() * 30, 0), frequency: round(2 + rng() * 4, 0), impact: '中等', solution: '优化换轴流程，采用快速换SMED' },
    { type: '清洁保养', duration_min: round(10 + rng() * 15, 0), frequency: round(2 + rng() * 2, 0), impact: '轻微', solution: '安排在交接班时段，减少停机影响' },
  ];

  const rpm = loomType === '喷气织机' ? round(600 + rng() * 300, 0) : round(200 + rng() * 200, 0);
  const wasteRate = round(0.5 + rng() * 3, 1);
  const firstPassYield = round(92 + rng() * 7, 1);
  const onTimeDelivery = round(80 + rng() * 18, 1);

  const maintenance = [
    { type: '日常润滑', interval_days: 1, last_done: '今日', next_due: '明日', duration_h: 0.5 },
    { type: '皮带检查', interval_days: 7, last_done: '3天前', next_due: '4天后', duration_h: 1 },
    { type: '主喷嘴清洁', interval_days: 14, last_done: '5天前', next_due: '9天后', duration_h: 1.5 },
    { type: '综框检修', interval_days: 30, last_done: '10天前', next_due: '20天后', duration_h: 3 },
    { type: '大修/全面保养', interval_days: 90, last_done: '30天前', next_due: '60天后', duration_h: 8 },
  ];

  return {
    oee_analysis: { availability, performance, quality, oee, benchmark: oee >= targetOee ? '达标' : '未达标', world_class: worldClass },
    production_schedule: schedule,
    utilization: { total_capacity_m: round(totalCapacity, 0), planned_output_m: plannedOutput, utilization_rate: utilizationRate, idle_hours: round((1 - utilizationRate / 100) * workingHours, 1) },
    downtime_analysis: downtimes,
    efficiency_metrics: { rpm, picks_per_min: round(400 + rng() * 300, 0), waste_rate: wasteRate, first_pass_yield: firstPassYield, on_time_delivery: onTimeDelivery },
    maintenance_plan: maintenance,
    disclaimer: DISCLAIMER,
  };
}

function formatScheduler(r: SchedulerResult): string {
  let s = '=== 织机排产与效率OEE分析报告 ===\n\n';
  s += '【OEE分析】\n';
  s += `  开动率: ${r.oee_analysis.availability}%\n`;
  s += `  性能率: ${r.oee_analysis.performance}%\n`;
  s += `  合格率: ${r.oee_analysis.quality}%\n`;
  s += `  OEE: ${r.oee_analysis.oee}% (${r.oee_analysis.benchmark})\n`;
  s += `  世界级水平: ${r.oee_analysis.world_class ? '是' : '否'}\n\n`;
  s += '【生产排程】\n';
  r.production_schedule.forEach(p => {
    s += `  ${p.loom_id} → ${p.order_id}(${p.fabric}) | ${p.start_time}开工 | ${p.duration_h}h | 预计产量: ${p.expected_output_m}m\n`;
  });
  s += '\n【产能利用】\n';
  s += `  总产能: ${r.utilization.total_capacity_m} m/班\n`;
  s += `  计划产量: ${r.utilization.planned_output_m} m/班\n`;
  s += `  利用率: ${r.utilization.utilization_rate}%\n`;
  s += `  闲置时间: ${r.utilization.idle_hours} h/班\n\n`;
  s += '【停机分析】\n';
  r.downtime_analysis.forEach(d => {
    s += `  ${d.type}: ${d.duration_min}min/次 × ${d.frequency}次/班 | 影响: ${d.impact}\n`;
    s += `    对策: ${d.solution}\n`;
  });
  s += '\n【效率指标】\n';
  s += `  织机转速: ${r.efficiency_metrics.rpm} rpm\n`;
  s += `  入纬率: ${r.efficiency_metrics.picks_per_min} picks/min\n`;
  s += `  废布率: ${r.efficiency_metrics.waste_rate}%\n`;
  s += `  一次下机合格率: ${r.efficiency_metrics.first_pass_yield}%\n`;
  s += `  准时交付率: ${r.efficiency_metrics.on_time_delivery}%\n\n`;
  s += '【维护计划】\n';
  r.maintenance_plan.forEach(m => {
    s += `  ${m.type}: 每${m.interval_days}天 | 上次: ${m.last_done} | 下次: ${m.next_due} | 耗时: ${m.duration_h}h\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. yarn_strength_predictor — 纱线强度预测与配棉方案
// ============================================================
interface YarnInput {
  yarn_count?: string;
  fiber_blend?: Array<{ fiber: string; percentage: number; grade: string }>;
  spinning_method?: string;
  target_tenacity?: number;
  target_csp?: number;
  twist_per_m?: number;
  application?: string;
}

interface YarnResult {
  strength_prediction: { tenacity_cn_tex: number; elongation_percent: number; csp: number; uniformity_cv: number; thin_places: number; thick_places: number; neps: number };
  cotton_blending: Array<{ origin: string; grade: string; micronaire: number; staple_mm: string; strength_cn: number; percentage: number; cost_per_kg: number }>;
  spinning_process: { method: string; process_flow: string[]; rpm: number; twist_per_m: number; draft_ratio: number };
  quality_grade: { uster_grade: string; classimat_faults: Array<{ type: string; count: number; class: string }>; overall_grade: string };
  cost_breakdown: { raw_material_kg: number; spinning_cost_kg: number; total_cost_kg: number; market_price_kg: number; margin: number };
  optimization: Array<{ area: string; current: string; optimized: string; benefit: string }>;
  disclaimer: string;
}

function analyzeYarn(data: YarnInput): YarnResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const yarnCount = data.yarn_count || pick(rng, ['20S', '32S', '40S', '60S', '80S']);
  const spinningMethod = data.spinning_method || pick(rng, ['环锭纺', '紧密纺', '气流纺', '涡流纺']);
  const twistPm = data.twist_per_m ?? round(600 + rng() * 600, 0);

  const countNum = parseInt(yarnCount.replace('S', ''));
  const tenacity = round(8 + rng() * 7 + (100 - countNum) * 0.05, 2);
  const elongation = round(4 + rng() * 5, 1);
  const csp = round(tenacity * (1 + elongation / 100) * parseFloat(yarnCount.replace('S','')) * 0.8 + rng() * 500, 0);
  const uniformityCv = round(8 + rng() * 8, 1);
  const thinPlaces = Math.round(rng() * 50);
  const thickPlaces = Math.round(rng() * 80);
  const neps = Math.round(rng() * 100);

  const origins = [
    { origin: '新疆棉', grade: '2级', micronaire: round(4.0 + rng() * 0.8, 1), staple_mm: '29', strength_cn: round(28 + rng() * 6, 1), cost_per_kg: round(14 + rng() * 4, 2) },
    { origin: '澳大利亚棉', grade: '1级', micronaire: round(4.2 + rng() * 0.6, 1), staple_mm: '30', strength_cn: round(32 + rng() * 5, 1), cost_per_kg: round(16 + rng() * 5, 2) },
    { origin: '美棉(SJV)', grade: '1级', micronaire: round(3.8 + rng() * 0.8, 1), staple_mm: '28', strength_cn: round(30 + rng() * 6, 1), cost_per_kg: round(15 + rng() * 4, 2) },
    { origin: '印度棉', grade: '3级', micronaire: round(3.5 + rng() * 1, 1), staple_mm: '26', strength_cn: round(24 + rng() * 6, 1), cost_per_kg: round(11 + rng() * 3, 2) },
    { origin: '巴西棉', grade: '2级', micronaire: round(4.0 + rng() * 0.7, 1), staple_mm: '28', strength_cn: round(27 + rng() * 5, 1), cost_per_kg: round(13 + rng() * 4, 2) },
  ];
  const numFibers = 2 + Math.floor(rng() * 2);
  const selectedFibers = origins.slice(0, numFibers);
  let remaining = 100;
  const blending = selectedFibers.map((f, i) => {
    const pct = i === selectedFibers.length - 1 ? remaining : Math.round(40 + rng() * 30);
    remaining -= pct;
    return { ...f, percentage: pct };
  });

  const processFlow = spinningMethod === '紧密纺'
    ? ['开清棉', '梳棉', '预并条', '条并卷', '精梳', '并条×2', '粗纱', '细纱(紧密)', '络筒']
    : spinningMethod === '气流纺'
    ? ['开清棉', '梳棉', '并条×2', '气流纺', '络筒']
    : ['开清棉', '梳棉', '预并条', '条并卷', '精梳', '并条×2', '粗纱', '环锭细纱', '络筒'];

  const usterGrade = uniformityCv <= 10 ? 'A级(前25%)' : uniformityCv <= 13 ? 'B级(前50%)' : uniformityCv <= 16 ? 'C级(前75%)' : 'D级(后25%)';

  const classimatFaults = [
    { type: 'A3', count: Math.round(rng() * 20), class: '短粗节' },
    { type: 'B3', count: Math.round(rng() * 30), class: '短粗节' },
    { type: 'C3', count: Math.round(rng() * 25), class: '长粗节' },
    { type: 'D3', count: Math.round(rng() * 15), class: '长粗节' },
    { type: 'E', count: Math.round(rng() * 5), class: '超长粗节' },
    { type: 'F', count: Math.round(rng() * 40), class: '细节' },
    { type: 'G', count: Math.round(rng() * 30), class: '棉结' },
  ];

  const rawCost = round(blending.reduce((s, b) => s + b.cost_per_kg * b.percentage / 100, 0), 2);
  const spinningCost = round(3 + rng() * 4, 2);
  const totalCost = round(rawCost + spinningCost, 2);
  const marketPrice = round(totalCost * (1.08 + rng() * 0.15), 2);

  const optimizations = [
    { area: '配棉成本', current: `¥${rawCost}/kg`, optimized: `¥${round(rawCost * 0.95, 2)}/kg`, benefit: '低价替代5%纤维，保持质量稳定' },
    { area: '纱线CV%', current: `${uniformityCv}%`, optimized: `${round(uniformityCv * 0.9, 1)}%`, benefit: '优化并条工艺，降低条干不匀' },
    { area: '千锭时断头', current: `${Math.round(30 + rng() * 20)}根`, optimized: `${Math.round(20 + rng() * 10)}根`, benefit: '调整钢丝圈型号，改善纱线通道' },
    { area: '能耗', current: `${round(3 + rng() * 1, 2)}kWh/kg`, optimized: `${round(2.5 + rng() * 0.5, 2)}kWh/kg`, benefit: '优化风机变频，降低空调能耗' },
  ];

  return {
    strength_prediction: { tenacity_cn_tex: tenacity, elongation_percent: elongation, csp, uniformity_cv: uniformityCv, thin_places: thinPlaces, thick_places: thickPlaces, neps },
    cotton_blending: blending,
    spinning_process: { method: spinningMethod, process_flow: processFlow, rpm: round(8000 + rng() * 15000, 0), twist_per_m: twistPm, draft_ratio: round(15 + rng() * 25, 1) },
    quality_grade: { uster_grade: usterGrade, classimat_faults: classimatFaults, overall_grade: usterGrade.startsWith('A') ? '优等' : usterGrade.startsWith('B') ? '一等' : '合格' },
    cost_breakdown: { raw_material_kg: rawCost, spinning_cost_kg: spinningCost, total_cost_kg: totalCost, market_price_kg: marketPrice, margin: round(((marketPrice - totalCost) / totalCost) * 100, 1) },
    optimization: optimizations,
    disclaimer: DISCLAIMER,
  };
}

function formatYarn(r: YarnResult): string {
  let s = '=== 纱线强度预测与配棉方案报告 ===\n\n';
  s += '【强度预测】\n';
  s += `  断裂强度: ${r.strength_prediction.tenacity_cn_tex} cN/tex\n`;
  s += `  断裂伸长率: ${r.strength_prediction.elongation_percent}%\n`;
  s += `  纱线强力(CSP): ${r.strength_prediction.csp}\n`;
  s += `  条干CV%: ${r.strength_prediction.uniformity_cv}%\n`;
  s += `  细节: ${r.strength_prediction.thin_places}个/km | 粗节: ${r.strength_prediction.thick_places}个/km | 棉结: ${r.strength_prediction.neps}个/km\n\n`;
  s += '【配棉方案】\n';
  r.cotton_blending.forEach(c => {
    s += `  ${c.origin}(${c.grade}): ${c.percentage}% | 马克隆值: ${c.micronaire} | 主体长度: ${c.staple_mm}mm | 单强: ${c.strength_cn}cN | 成本: ¥${c.cost_per_kg}/kg\n`;
  });
  s += '\n【纺纱工艺】\n';
  s += `  方法: ${r.spinning_process.method}\n`;
  s += `  工艺路线: ${r.spinning_process.process_flow.join(' → ')}\n`;
  s += `  锭速: ${r.spinning_process.rpm} rpm | 捻度: ${r.spinning_process.twist_per_m}捻/m | 牵伸倍数: ${r.spinning_process.draft_ratio}\n\n`;
  s += '【质量评级】\n';
  s += `  USTER评级: ${r.quality_grade.uster_grade}\n`;
  s += `  综合等级: ${r.quality_grade.overall_grade}\n`;
  s += '  Classimat纱疵:\n';
  r.quality_grade.classimat_faults.forEach(f => {
    s += `    ${f.type}(${f.class}): ${f.count}个/100km\n`;
  });
  s += '\n【成本核算】\n';
  s += `  原料成本: ¥${r.cost_breakdown.raw_material_kg}/kg\n`;
  s += `  纺纱加工费: ¥${r.cost_breakdown.spinning_cost_kg}/kg\n`;
  s += `  总成本: ¥${r.cost_breakdown.total_cost_kg}/kg\n`;
  s += `  市场价: ¥${r.cost_breakdown.market_price_kg}/kg\n`;
  s += `  毛利率: ${r.cost_breakdown.margin}%\n\n`;
  s += '【优化建议】\n';
  r.optimization.forEach(o => {
    s += `  ${o.area}: ${o.current} → ${o.optimized} | ${o.benefit}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. textile_waste_reducer — 裁剪排料优化与废料最小化
// ============================================================
interface WasteReducerInput {
  fabric_width_cm?: number;
  fabric_length_m?: number;
  garment_parts?: Array<{ name: string; width_cm: number; height_cm: number; quantity: number; allow_rotation: boolean }>;
  fabric_type?: string;
  marker_efficiency_target?: number;
  nesting_method?: string;
  fabric_cost_per_m?: number;
}

interface WasteReducerResult {
  nesting_plan: { method: string; efficiency: number; total_marker_length_m: number; fabric_saved_m: number; cost_saving: number };
  layout_details: Array<{ part: string; quantity_placed: number; positions: string; rotation_used: boolean }>;
  waste_analysis: { total_waste_percent: number; waste_categories: Array<{ type: string; percentage: number; area_sqm: number; cause: string }>; recyclable_percent: number };
  marker_comparison: Array<{ method: string; efficiency: number; fabric_used_m: number; savings_vs_manual: number }>;
  auto_nesting_benefits: { time_saved_min: number; material_saving_percent: number; consistency: number; scalability: string };
  cost_impact: { current_fabric_cost: number; optimized_fabric_cost: number; monthly_savings: number; annual_savings: number; roi_months: number };
  disclaimer: string;
}

function analyzeWasteReducer(data: WasteReducerInput): WasteReducerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const fabricWidth = data.fabric_width_cm ?? 150;
  const fabricLength = data.fabric_length_m ?? 100;
  const costPerM = data.fabric_cost_per_m ?? round(15 + rng() * 35, 2);

  const efficiency = round(78 + rng() * 12, 1);
  const totalArea = fabricWidth / 100 * fabricLength;
  const usedArea = totalArea * (efficiency / 100);
  const wasteArea = totalArea - usedArea;
  const usedLength = usedArea / (fabricWidth / 100);

  const parts = [
    { part: '前片', quantity_placed: Math.round(8 + rng() * 12), positions: '交错排列', rotation_used: true },
    { part: '后片', quantity_placed: Math.round(8 + rng() * 12), positions: '交错排列', rotation_used: true },
    { part: '袖子', quantity_placed: Math.round(14 + rng() * 18), positions: '嵌套排布', rotation_used: true },
    { part: '领子', quantity_placed: Math.round(20 + rng() * 20), positions: '紧密嵌套', rotation_used: false },
    { part: '口袋', quantity_placed: Math.round(16 + rng() * 16), positions: '缝隙排布', rotation_used: false },
  ];

  const wasteCategories = [
    { type: '裁床头尾损耗', percentage: round(2 + rng() * 2, 1), area_sqm: round(totalArea * 0.025, 2), cause: '每匹布起头尾余量' },
    { type: '排料间隙', percentage: round(3 + rng() * 4, 1), area_sqm: round(totalArea * 0.045, 2), cause: '裁片间安全距离' },
    { type: '布边损耗', percentage: round(1 + rng() * 2, 1), area_sqm: round(totalArea * 0.015, 2), cause: '布边不整齐无法利用' },
    { type: '图案匹配损耗', percentage: round(2 + rng() * 3, 1), area_sqm: round(totalArea * 0.03, 2), cause: '对花对格额外消耗' },
    { type: '余料/不可用', percentage: round(2 + rng() * 3, 1), area_sqm: round(totalArea * 0.025, 2), cause: '无法避免的残余布料' },
  ];

  const totalWastePct = round(100 - efficiency, 1);

  const comparisons = [
    { method: '手工排料', efficiency: round(65 + rng() * 8, 1), fabric_used_m: round(fabricLength * (efficiency / (65 + rng() * 8)), 1), savings_vs_manual: 0 },
    { method: '交互式排料', efficiency: round(75 + rng() * 5, 1), fabric_used_m: round(fabricLength * (efficiency / (75 + rng() * 5)), 1), savings_vs_manual: round(rng() * 5, 1) },
    { method: '自动排料(当前)', efficiency: efficiency, fabric_used_m: round(usedLength, 1), savings_vs_manual: round(100 - (usedLength / fabricLength) * 100 - (100 - efficiency), 1) },
    { method: 'AI智能排料', efficiency: round(efficiency + 3 + rng() * 4, 1), fabric_used_m: round(usedLength * (efficiency / (efficiency + 3 + rng() * 4)), 1), savings_vs_manual: round(5 + rng() * 5, 1) },
  ];

  const timeSaved = round(30 + rng() * 60, 0);
  const materialSaving = round(3 + rng() * 8, 1);
  const currentCost = round(fabricLength * costPerM, 0);
  const optimizedCost = round(usedLength * costPerM, 0);
  const savingsPerLay = currentCost - optimizedCost;
  const monthlySavings = round(savingsPerLay * (20 + rng() * 10), 0);
  const roiMonths = round(2 + rng() * 8, 1);

  return {
    nesting_plan: { method: pick(rng, ['自动嵌套+手动微调', '全自动AI排料', '交互式自动排料']), efficiency: round(efficiency, 1), total_marker_length_m: round(usedLength, 1), fabric_saved_m: round(fabricLength - usedLength, 1), cost_saving: savingsPerLay },
    layout_details: parts,
    waste_analysis: { total_waste_percent: totalWastePct, waste_categories: wasteCategories, recyclable_percent: round(40 + rng() * 35, 1) },
    marker_comparison: comparisons,
    auto_nesting_benefits: { time_saved_min: timeSaved, material_saving_percent: materialSaving, consistency: round(85 + rng() * 12, 1), scalability: '支持多尺码混合排料，订单批量自动优化' },
    cost_impact: { current_fabric_cost: currentCost, optimized_fabric_cost: optimizedCost, monthly_savings: monthlySavings, annual_savings: round(monthlySavings * 12, 0), roi_months: roiMonths },
    disclaimer: DISCLAIMER,
  };
}

function formatWasteReducer(r: WasteReducerResult): string {
  let s = '=== 裁剪排料优化与废料最小化报告 ===\n\n';
  s += '【排料方案】\n';
  s += `  方法: ${r.nesting_plan.method}\n`;
  s += `  排料效率: ${r.nesting_plan.efficiency}%\n`;
  s += `  标记长度: ${r.nesting_plan.total_marker_length_m} m\n`;
  s += `  节省面料: ${r.nesting_plan.fabric_saved_m} m\n`;
  s += `  成本节约: ¥${r.nesting_plan.cost_saving}\n\n`;
  s += '【裁片排布】\n';
  r.layout_details.forEach(p => {
    s += `  ${p.part}: 排放${p.quantity_placed}片 | ${p.positions} | ${p.rotation_used ? '已旋转' : '未旋转'}\n`;
  });
  s += '\n【废料分析】\n';
  s += `  总废料率: ${r.waste_analysis.total_waste_percent}%\n`;
  s += `  可回收率: ${r.waste_analysis.recyclable_percent}%\n`;
  r.waste_analysis.waste_categories.forEach(w => {
    s += `  ${w.type}: ${w.percentage}% (${w.area_sqm}㎡) — ${w.cause}\n`;
  });
  s += '\n【排料方式对比】\n';
  r.marker_comparison.forEach(m => {
    s += `  ${m.method}: 效率${m.efficiency}% | 用布${m.fabric_used_m}m | 节约${m.savings_vs_manual}%\n`;
  });
  s += '\n【自动排料优势】\n';
  s += `  节省时间: ${r.auto_nesting_benefits.time_saved_min} min/床\n`;
  s += `  节约面料: ${r.auto_nesting_benefits.material_saving_percent}%\n`;
  s += `  一致性: ${r.auto_nesting_benefits.consistency}%\n`;
  s += `  扩展性: ${r.auto_nesting_benefits.scalability}\n\n`;
  s += '【成本影响】\n';
  s += `  当前面料成本: ¥${r.cost_impact.current_fabric_cost}/床\n`;
  s += `  优化后成本: ¥${r.cost_impact.optimized_fabric_cost}/床\n`;
  s += `  月节约: ¥${r.cost_impact.monthly_savings}\n`;
  s += `  年节约: ¥${r.cost_impact.annual_savings}\n`;
  s += `  投资回收期: ${r.cost_impact.roi_months} 个月\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. sustainable_textile_auditor — 可持续纺织认证与OEKO-TEX合规
// ============================================================
interface SustainabilityInput {
  product_type?: string;
  target_market?: string;
  certifications?: string[];
  supply_chain_tiers?: number;
  water_usage_l_per_kg?: number;
  carbon_footprint_kg?: number;
  chemical_management?: string;
  social_compliance?: string;
}

interface SustainabilityResult {
  oeko_tex_status: { standard: string; product_class: string; tests_passed: number; tests_total: number; compliance_score: number; certificate_valid: boolean };
  certification_roadmap: Array<{ certification: string; status: string; priority: string; timeline: string; cost_estimate: number; market_value: string }>;
  environmental_metrics: { water_footprint_l_per_kg: number; carbon_kg_per_kg: number; energy_mj_per_kg: number; waste_water_m3: number; renewable_energy_percent: number };
  chemical_compliance: Array<{ substance: string; limit_ppm: number; actual_ppm: number; status: string; regulation: string }>;
  social_audit: { score: number; working_hours_compliance: number; wage_compliance: number; safety_score: number; child_labor_free: boolean; findings: string[] };
  circular_economy: { recyclability: number; recycled_content_percent: number; biodegradability: string; take_back_program: boolean; lca_score: number };
  disclaimer: string;
}

function analyzeSustainability(data: SustainabilityInput): SustainabilityResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const productType = data.product_type || pick(rng, ['婴幼儿服装', '内衣', '外套', '家纺', '运动服', '牛仔']);
  const targetMarket = data.target_market || pick(rng, ['欧盟', '北美', '日本', '中国', '全球']);

  const productClass = productType.includes('婴幼儿') ? 'I类(婴幼儿用品)' : productType.includes('内衣') ? 'II类(直接接触皮肤)' : productType.includes('家纺') ? 'III类(非直接接触皮肤)' : 'IV类(装饰材料)';
  const testsPassed = Math.round(80 + rng() * 20);
  const testsTotal = 100;
  const complianceScore = round((testsPassed / testsTotal) * 100, 1);

  const certifications = [
    { certification: 'OEKO-TEX Standard 100', status: pick(rng, ['已获证', '申请中', '计划中']), priority: '高', timeline: pick(rng, ['已获证', '3个月', '6个月']), cost_estimate: round(15000 + rng() * 25000, 0), market_value: '欧盟市场准入必备' },
    { certification: 'GOTS(全球有机纺织品)', status: pick(rng, ['计划中', '申请中', '未开始']), priority: '中', timeline: pick(rng, ['6个月', '12个月', '18个月']), cost_estimate: round(30000 + rng() * 50000, 0), market_value: '有机产品溢价20-30%' },
    { certification: 'GRS(全球回收标准)', status: pick(rng, ['计划中', '未开始']), priority: '中', timeline: pick(rng, ['6个月', '12个月']), cost_estimate: round(25000 + rng() * 30000, 0), market_value: '再生产品市场增长35%/年' },
    { certification: 'bluesign', status: pick(rng, ['未开始', '计划中']), priority: '低', timeline: pick(rng, ['12个月', '18个月']), cost_estimate: round(40000 + rng() * 60000, 0), market_value: '户外品牌供应链要求' },
    { certification: 'ZDHC(零排放)', status: pick(rng, ['申请中', '计划中']), priority: '高', timeline: pick(rng, ['3个月', '6个月']), cost_estimate: round(10000 + rng() * 20000, 0), market_value: '化学品管理合规要求' },
  ];

  const waterUsage = data.water_usage_l_per_kg ?? round(50 + rng() * 150, 0);
  const carbonFp = data.carbon_footprint_kg ?? round(5 + rng() * 20, 2);

  const chemicals = [
    { substance: '甲醛', limit_ppm: productType.includes('婴幼儿') ? 20 : 75, actual_ppm: round(rng() * 60, 1), regulation: 'OEKO-TEX/GB18401' },
    { substance: '重金属(铅)', limit_ppm: 0.2, actual_ppm: round(rng() * 0.3, 2), regulation: 'OEKO-TEX' },
    { substance: '重金属(镉)', limit_ppm: 0.1, actual_ppm: round(rng() * 0.15, 2), regulation: 'OEKO-TEX' },
    { substance: '邻苯二甲酸酯', limit_ppm: 100, actual_ppm: round(rng() * 80, 1), regulation: 'REACH' },
    { substance: 'APEO', limit_ppm: 100, actual_ppm: round(rng() * 90, 1), regulation: 'ZDHC' },
    { substance: '可分解致癌芳香胺', limit_ppm: 20, actual_ppm: round(rng() * 15, 1), regulation: 'GB18401' },
    { substance: '有机锡化合物', limit_ppm: 1.0, actual_ppm: round(rng() * 0.8, 2), regulation: 'REACH' },
  ].map(c => ({ ...c, status: c.actual_ppm <= c.limit_ppm ? '合格' : '超标' }));

  const socialScore = round(60 + rng() * 35, 1);
  const findings: string[] = [];
  if (socialScore < 70) findings.push('工作时间记录不完整，需加强考勤管理');
  if (socialScore < 80) findings.push('部分消防通道标识不清晰，建议整改');
  if (socialScore < 85) findings.push('员工访谈中发现加班补偿政策需完善');
  if (findings.length === 0) findings.push('社会责任合规状况良好');

  const circularity = round(40 + rng() * 45, 1);
  const recycledContent = round(rng() * 60, 1);

  return {
    oeko_tex_status: { standard: 'OEKO-TEX Standard 100', product_class: productClass, tests_passed: testsPassed, tests_total: testsTotal, compliance_score: complianceScore, certificate_valid: complianceScore >= 80 },
    certification_roadmap: certifications,
    environmental_metrics: { water_footprint_l_per_kg: waterUsage, carbon_kg_per_kg: carbonFp, energy_mj_per_kg: round(30 + rng() * 50, 1), waste_water_m3: round(waterUsage * 0.7 / 1000, 2), renewable_energy_percent: round(10 + rng() * 50, 1) },
    chemical_compliance: chemicals,
    social_audit: { score: socialScore, working_hours_compliance: round(70 + rng() * 28, 1), wage_compliance: round(75 + rng() * 23, 1), safety_score: round(65 + rng() * 30, 1), child_labor_free: true, findings },
    circular_economy: { recyclability: circularity, recycled_content_percent: recycledContent, biodegradability: pick(rng, ['部分可降解', '不可降解', '可堆肥', '需专业回收']), take_back_program: pick(rng, [true, false]), lca_score: round(50 + rng() * 35, 1) },
    disclaimer: DISCLAIMER,
  };
}

function formatSustainability(r: SustainabilityResult): string {
  let s = '=== 可持续纺织认证与OEKO-TEX合规报告 ===\n\n';
  s += '【OEKO-TEX认证状态】\n';
  s += `  标准: ${r.oeko_tex_status.standard}\n`;
  s += `  产品级别: ${r.oeko_tex_status.product_class}\n`;
  s += `  检测通过: ${r.oeko_tex_status.tests_passed}/${r.oeko_tex_status.tests_total}\n`;
  s += `  合规评分: ${r.oeko_tex_status.compliance_score}/100\n`;
  s += `  证书有效: ${r.oeko_tex_status.certificate_valid ? '是' : '否'}\n\n`;
  s += '【认证路线图】\n';
  r.certification_roadmap.forEach(c => {
    s += `  ${c.certification}: ${c.status} | 优先级: ${c.priority} | 时间: ${c.timeline} | 费用: ¥${c.cost_estimate.toLocaleString()} | ${c.market_value}\n`;
  });
  s += '\n【环境指标】\n';
  s += `  水足迹: ${r.environmental_metrics.water_footprint_l_per_kg} L/kg\n`;
  s += `  碳足迹: ${r.environmental_metrics.carbon_kg_per_kg} kgCO₂/kg\n`;
  s += `  能耗: ${r.environmental_metrics.energy_mj_per_kg} MJ/kg\n`;
  s += `  废水排放: ${r.environmental_metrics.waste_water_m3} m³/kg\n`;
  s += `  可再生能源: ${r.environmental_metrics.renewable_energy_percent}%\n\n`;
  s += '【化学品合规】\n';
  r.chemical_compliance.forEach(c => {
    s += `  ${c.substance}: 限值${c.limit_ppm}ppm | 实测${c.actual_ppm}ppm | ${c.status} | ${c.regulation}\n`;
  });
  s += '\n【社会责任审核】\n';
  s += `  综合评分: ${r.social_audit.score}/100\n`;
  s += `  工时合规: ${r.social_audit.working_hours_compliance}%\n`;
  s += `  薪酬合规: ${r.social_audit.wage_compliance}%\n`;
  s += `  安全评分: ${r.social_audit.safety_score}/100\n`;
  s += `  无童工: ${r.social_audit.child_labor_free ? '是' : '否'}\n`;
  s += '  发现项:\n';
  r.social_audit.findings.forEach(f => { s += `    - ${f}\n`; });
  s += '\n【循环经济】\n';
  s += `  可回收性: ${r.circular_economy.recyclability}%\n`;
  s += `  再生成分: ${r.circular_economy.recycled_content_percent}%\n`;
  s += `  可降解性: ${r.circular_economy.biodegradability}\n`;
  s += `  回收计划: ${r.circular_economy.take_back_program ? '已建立' : '未建立'}\n`;
  s += `  LCA评分: ${r.circular_economy.lca_score}/100\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. textile_cost_calculator — 面料成本核算与报价
// ============================================================
interface CostInput {
  fabric_type?: string;
  yarn_count?: string;
  weave_type?: string;
  width_cm?: number;
  weight_gsm?: number;
  order_quantity_m?: number;
  yarn_price_per_kg?: number;
  processing_cost_per_m?: number;
  profit_margin?: number;
  incoterm?: string;
}

interface CostResult {
  cost_breakdown: { yarn_cost: number; weaving_cost: number; dyeing_cost: number; finishing_cost: number; overhead: number; total_cost_per_m: number };
  quotation: { ex_works_price: number; fob_price: number; cif_price: number; recommended_selling: number; profit_margin: number; profit_per_m: number };
  yarn_consumption: { warp_yarn_kg_per_m: number; weft_yarn_kg_per_m: number; total_yarn_kg_per_m: number; yarn_cost_per_m: number };
  volume_discount: Array<{ quantity_m: number; discount_percent: number; unit_price: number; total_value: number }>;
  cost_optimization: Array<{ area: string; current_cost: number; optimized_cost: number; saving_per_m: number; suggestion: string }>;
  competitive_analysis: { market_low: number; market_avg: number; market_high: number; our_position: string; competitiveness: string };
  disclaimer: string;
}

function analyzeCost(data: CostInput): CostResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const fabricType = data.fabric_type || pick(rng, ['纯棉平布', '涤棉斜纹', '牛仔布', '府绸', '牛津纺']);
  const yarnCount = data.yarn_count || pick(rng, ['20S', '32S', '40S', '60S']);
  const width = data.width_cm ?? 150;
  const weight = data.weight_gsm ?? round(120 + rng() * 200, 0);
  const quantity = data.order_quantity_m ?? round(500 + rng() * 4500, 0);
  const yarnPrice = data.yarn_price_per_kg ?? round(18 + rng() * 15, 2);

  const countNum = parseInt(yarnCount.replace('S', ''));
  const warpDensity = round(80 + rng() * 60, 0);
  const weftDensity = round(40 + rng() * 40, 0);
  const warpYarn = round((warpDensity * width * countNum * 0.00065) / 100, 4);
  const weftYarn = round((weftDensity * width * countNum * 0.00065) / 100, 4);
  const totalYarn = round(warpYarn + weftYarn, 4);
  const yarnCostPerM = round(totalYarn * yarnPrice, 2);

  const weavingCost = round(0.5 + rng() * 2, 2);
  const dyeingCost = round(2 + rng() * 5, 2);
  const finishingCost = round(1 + rng() * 3, 2);
  const overhead = round((yarnCostPerM + weavingCost + dyeingCost + finishingCost) * (0.05 + rng() * 0.08), 2);
  const totalCost = round(yarnCostPerM + weavingCost + dyeingCost + finishingCost + overhead, 2);

  const margin = data.profit_margin ?? round(10 + rng() * 20, 1);
  const sellingPrice = round(totalCost * (1 + margin / 100), 2);
  const exWorks = sellingPrice;
  const fob = round(sellingPrice + 0.3 + rng() * 0.5, 2);
  const cif = round(fob + 0.5 + rng() * 1, 2);

  const discounts = [
    { quantity_m: 500, discount_percent: 0, unit_price: round(sellingPrice, 2), total_value: round(sellingPrice * 500, 0) },
    { quantity_m: 1000, discount_percent: round(2 + rng() * 2, 1), unit_price: round(sellingPrice * (1 - (2 + rng() * 2) / 100), 2), total_value: 0 },
    { quantity_m: 3000, discount_percent: round(5 + rng() * 3, 1), unit_price: round(sellingPrice * (1 - (5 + rng() * 3) / 100), 2), total_value: 0 },
    { quantity_m: 5000, discount_percent: round(8 + rng() * 4, 1), unit_price: round(sellingPrice * (1 - (8 + rng() * 4) / 100), 2), total_value: 0 },
  ];
  discounts.forEach(d => { d.total_value = round(d.unit_price * d.quantity_m, 0); });

  const optimizations = [
    { area: '纱线成本', current_cost: round(yarnCostPerM, 2), optimized_cost: round(yarnCostPerM * 0.93, 2), saving_per_m: round(yarnCostPerM * 0.07, 2), suggestion: '优化配棉比例，采用30%低价替代棉' },
    { area: '织造损耗', current_cost: round(weavingCost, 2), optimized_cost: round(weavingCost * 0.85, 2), saving_per_m: round(weavingCost * 0.15, 2), suggestion: '降低断头率，提高织机效率' },
    { area: '染化料成本', current_cost: round(dyeingCost, 2), optimized_cost: round(dyeingCost * 0.88, 2), saving_per_m: round(dyeingCost * 0.12, 2), suggestion: '采用短流程工艺，减少染化料用量' },
    { area: '能源成本', current_cost: round(finishingCost * 0.4, 2), optimized_cost: round(finishingCost * 0.3, 2), saving_per_m: round(finishingCost * 0.1, 2), suggestion: '余热回收+变频改造，节能15%' },
  ];

  const marketLow = round(totalCost * 1.05, 2);
  const marketAvg = round(totalCost * 1.2, 2);
  const marketHigh = round(totalCost * 1.45, 2);
  const position = sellingPrice < marketAvg ? '中低端' : sellingPrice < marketHigh ? '中高端' : '高端';

  return {
    cost_breakdown: { yarn_cost: yarnCostPerM, weaving_cost: weavingCost, dyeing_cost: dyeingCost, finishing_cost: finishingCost, overhead, total_cost_per_m: totalCost },
    quotation: { ex_works_price: exWorks, fob_price: fob, cif_price: cif, recommended_selling: sellingPrice, profit_margin: margin, profit_per_m: round(sellingPrice - totalCost, 2) },
    yarn_consumption: { warp_yarn_kg_per_m: warpYarn, weft_yarn_kg_per_m: weftYarn, total_yarn_kg_per_m: totalYarn, yarn_cost_per_m: yarnCostPerM },
    volume_discount: discounts,
    cost_optimization: optimizations,
    competitive_analysis: { market_low: marketLow, market_avg: marketAvg, market_high: marketHigh, our_position: position, competitiveness: position === '中低端' ? '价格竞争力强' : position === '中高端' ? '性价比较高' : '品质溢价定位' },
    disclaimer: DISCLAIMER,
  };
}

function formatCost(r: CostResult): string {
  let s = '=== 面料成本核算与报价报告 ===\n\n';
  s += '【成本构成】\n';
  s += `  纱线成本: ¥${r.cost_breakdown.yarn_cost}/m (${round((r.cost_breakdown.yarn_cost / r.cost_breakdown.total_cost_per_m) * 100, 1)}%)\n`;
  s += `  织造加工费: ¥${r.cost_breakdown.weaving_cost}/m (${round((r.cost_breakdown.weaving_cost / r.cost_breakdown.total_cost_per_m) * 100, 1)}%)\n`;
  s += `  染色加工费: ¥${r.cost_breakdown.dyeing_cost}/m (${round((r.cost_breakdown.dyeing_cost / r.cost_breakdown.total_cost_per_m) * 100, 1)}%)\n`;
  s += `  后整理费: ¥${r.cost_breakdown.finishing_cost}/m (${round((r.cost_breakdown.finishing_cost / r.cost_breakdown.total_cost_per_m) * 100, 1)}%)\n`;
  s += `  制造费用: ¥${r.cost_breakdown.overhead}/m (${round((r.cost_breakdown.overhead / r.cost_breakdown.total_cost_per_m) * 100, 1)}%)\n`;
  s += `  总成本: ¥${r.cost_breakdown.total_cost_per_m}/m\n\n`;
  s += '【报价方案】\n';
  s += `  EXW(工厂交货): ¥${r.quotation.ex_works_price}/m\n`;
  s += `  FOB(离岸价): ¥${r.quotation.fob_price}/m\n`;
  s += `  CIF(到岸价): ¥${r.quotation.cif_price}/m\n`;
  s += `  建议售价: ¥${r.quotation.recommended_selling}/m\n`;
  s += `  利润率: ${r.quotation.profit_margin}% | 利润: ¥${r.quotation.profit_per_m}/m\n\n`;
  s += '【纱线用量】\n';
  s += `  经纱: ${r.yarn_consumption.warp_yarn_kg_per_m} kg/m\n`;
  s += `  纬纱: ${r.yarn_consumption.weft_yarn_kg_per_m} kg/m\n`;
  s += `  总纱耗: ${r.yarn_consumption.total_yarn_kg_per_m} kg/m\n`;
  s += `  纱线成本: ¥${r.yarn_consumption.yarn_cost_per_m}/m\n\n`;
  s += '【数量折扣】\n';
  r.volume_discount.forEach(d => {
    s += `  ≥${d.quantity_m}m: 单价¥${d.unit_price}/m | 折扣${d.discount_percent}% | 总额¥${d.total_value.toLocaleString()}\n`;
  });
  s += '\n【成本优化】\n';
  r.cost_optimization.forEach(o => {
    s += `  ${o.area}: ¥${o.current_cost} → ¥${o.optimized_cost} (节约¥${o.saving_per_m}/m) | ${o.suggestion}\n`;
  });
  s += '\n【竞争分析】\n';
  s += `  市场低端: ¥${r.competitive_analysis.market_low}/m\n`;
  s += `  市场均价: ¥${r.competitive_analysis.market_avg}/m\n`;
  s += `  市场高端: ¥${r.competitive_analysis.market_high}/m\n`;
  s += `  我方定位: ${r.competitive_analysis.our_position} (${r.competitive_analysis.competitiveness})\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. smart_warehouse_textile — 纺织原料仓储与智能搬运
// ============================================================
interface WarehouseInput {
  warehouse_area_sqm?: number;
  storage_type?: string;
  inventory_items?: Array<{ type: string; quantity: number; unit: string; zone: string }>;
  agv_count?: number;
  wms_system?: string;
  daily_throughput?: number;
  picking_method?: string;
  automation_level?: string;
}

interface WarehouseResult {
  layout_optimization: { zones: Array<{ name: string; area_sqm: number; capacity: number; utilization: number; items: string }>; total_capacity: number; space_utilization: number };
  agv_fleet: { count: number; type: string; routes: Array<{ from: string; to: string; distance_m: number; trips_per_day: number; load_kg: number }>; efficiency: number; charging_strategy: string };
  inventory_management: { sku_count: number; turnover_days: number; accuracy: number; abc_classification: Array<{ class: string; percent_skus: number; percent_value: number; strategy: string }> };
  smart_operations: { auto_reorder: boolean; batch_picking: boolean; cross_docking: boolean; real_time_tracking: boolean; digital_twin: boolean; benefits: string[] };
  kpi_dashboard: { order_fulfillment_rate: number; picking_accuracy: number; avg_order_time_min: number; storage_density: number; energy_efficiency: number; labor_productivity: number };
  cost_benefit: { current_labor_cost: number; automated_labor_cost: number; monthly_savings: number; investment: number; payback_months: number; five_year_roi: number };
  disclaimer: string;
}

function analyzeWarehouse(data: WarehouseInput): WarehouseResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const area = data.warehouse_area_sqm ?? round(2000 + rng() * 8000, 0);
  const agvCount = data.agv_count ?? Math.round(3 + rng() * 12);
  const dailyThroughput = data.daily_throughput ?? round(50 + rng() * 200, 0);

  const zones = [
    { name: '纱线存储区', area_sqm: round(area * 0.25, 0), capacity: round(area * 0.25 * 2.5, 0), utilization: round(70 + rng() * 25, 1), items: '棉纱、化纤纱、混纺纱' },
    { name: '坯布存储区', area_sqm: round(area * 0.3, 0), capacity: round(area * 0.3 * 1.8, 0), utilization: round(65 + rng() * 28, 1), items: '纯棉坯布、混纺坯布、色织布' },
    { name: '染化料库', area_sqm: round(area * 0.1, 0), capacity: round(area * 0.1 * 1.2, 0), utilization: round(60 + rng() * 30, 1), items: '染料、助剂、整理剂' },
    { name: '成品库区', area_sqm: round(area * 0.2, 0), capacity: round(area * 0.2 * 2.0, 0), utilization: round(68 + rng() * 25, 1), items: '成品面料、服装半成品' },
    { name: '辅料/包材区', area_sqm: round(area * 0.08, 0), capacity: round(area * 0.08 * 1.5, 0), utilization: round(55 + rng() * 30, 1), items: '纸箱、胶带、标签、衣架' },
    { name: '收发暂存区', area_sqm: round(area * 0.07, 0), capacity: round(area * 0.07 * 1.0, 0), utilization: round(50 + rng() * 35, 1), items: '待检品、待发货品' },
  ];
  const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0);
  const spaceUtil = round(zones.reduce((s, z) => s + z.utilization, 0) / zones.length, 1);

  const routes = [
    { from: '纱线库', to: '纺纱车间', distance_m: round(30 + rng() * 50, 0), trips_per_day: Math.round(8 + rng() * 12), load_kg: round(200 + rng() * 300, 0) },
    { from: '坯布库', to: '染色车间', distance_m: round(40 + rng() * 60, 0), trips_per_day: Math.round(6 + rng() * 10), load_kg: round(300 + rng() * 400, 0) },
    { from: '染化料库', to: '染色车间', distance_m: round(20 + rng() * 30, 0), trips_per_day: Math.round(10 + rng() * 15), load_kg: round(100 + rng() * 200, 0) },
    { from: '成品库', to: '发货区', distance_m: round(50 + rng() * 80, 0), trips_per_day: Math.round(10 + rng() * 15), load_kg: round(400 + rng() * 500, 0) },
    { from: '辅料区', to: '裁剪车间', distance_m: round(35 + rng() * 45, 0), trips_per_day: Math.round(5 + rng() * 8), load_kg: round(150 + rng() * 250, 0) },
  ];

  const abcClassification = [
    { class: 'A(高价值)', percent_skus: round(10 + rng() * 10, 1), percent_value: round(65 + rng() * 15, 1), strategy: '每日盘点，精确补货，安全库存低' },
    { class: 'B(中价值)', percent_skus: round(20 + rng() * 10, 1), percent_value: round(20 + rng() * 10, 1), strategy: '周度盘点，定期补货，适度安全库存' },
    { class: 'C(低价值)', percent_skus: round(55 + rng() * 15, 1), percent_value: round(5 + rng() * 8, 1), strategy: '月度盘点，批量补货，较高安全库存' },
  ];

  const benefits = [
    'AGV替代人工搬运，减少搬运工伤事故',
    'WMS实时库存可视化，降低库存积压',
    '智能拣选路径优化，提升拣货效率40%',
    '批次追溯系统，支持质量溯源',
    '自动补货提醒，避免断料停产',
  ];

  const currentLabor = round(8 + rng() * 12, 0) * 6500;
  const automatedLabor = round(currentLabor * (0.4 + rng() * 0.2), 0);
  const monthlySavings = currentLabor - automatedLabor;
  const investment = round(agvCount * (80000 + rng() * 70000) + 200000 + rng() * 300000, 0);
  const paybackMonths = round(investment / monthlySavings, 1);

  return {
    layout_optimization: { zones, total_capacity: totalCapacity, space_utilization: spaceUtil },
    agv_fleet: { count: agvCount, type: pick(rng, ['潜伏式AGV', '叉式AGV', '辊筒式AGV', '复合式AGV']), routes, efficiency: round(80 + rng() * 15, 1), charging_strategy: '机会充电(快充)，利用作业间隙自动补电' },
    inventory_management: { sku_count: Math.round(200 + rng() * 800), turnover_days: round(15 + rng() * 30, 0), accuracy: round(95 + rng() * 4.5, 1), abc_classification: abcClassification },
    smart_operations: { auto_reorder: true, batch_picking: true, cross_docking: pick(rng, [true, false]), real_time_tracking: true, digital_twin: pick(rng, [true, false]), benefits },
    kpi_dashboard: { order_fulfillment_rate: round(92 + rng() * 7, 1), picking_accuracy: round(98 + rng() * 1.8, 1), avg_order_time_min: round(15 + rng() * 25, 1), storage_density: round(1.5 + rng() * 1.5, 2), energy_efficiency: round(70 + rng() * 25, 1), labor_productivity: round(80 + rng() * 18, 1) },
    cost_benefit: { current_labor_cost: round(currentLabor, 0), automated_labor_cost: round(automatedLabor, 0), monthly_savings: round(monthlySavings, 0), investment, payback_months: paybackMonths, five_year_roi: round((monthlySavings * 60 - investment) / investment * 100, 1) },
    disclaimer: DISCLAIMER,
  };
}

function formatWarehouse(r: WarehouseResult): string {
  let s = '=== 纺织原料仓储与智能搬运报告 ===\n\n';
  s += '【仓储布局】\n';
  r.layout_optimization.zones.forEach(z => {
    s += `  ${z.name}: ${z.area_sqm}㎡ | 容量${z.capacity}位 | 利用率${z.utilization}% | ${z.items}\n`;
  });
  s += `  总容量: ${r.layout_optimization.total_capacity} 存储位\n`;
  s += `  空间利用率: ${r.layout_optimization.space_utilization}%\n\n`;
  s += '【AGV搬运车队】\n';
  s += `  数量: ${r.agv_fleet.count}台 | 类型: ${r.agv_fleet.type}\n`;
  s += `  效率: ${r.agv_fleet.efficiency}% | 充电策略: ${r.agv_fleet.charging_strategy}\n`;
  s += '  搬运路线:\n';
  r.agv_fleet.routes.forEach(rt => {
    s += `    ${rt.from} → ${rt.to}: ${rt.distance_m}m | ${rt.trips_per_day}次/天 | 载重${rt.load_kg}kg\n`;
  });
  s += '\n【库存管理】\n';
  s += `  SKU数量: ${r.inventory_management.sku_count}\n`;
  s += `  周转天数: ${r.inventory_management.turnover_days}天\n`;
  s += `  库存准确率: ${r.inventory_management.accuracy}%\n`;
  s += '  ABC分类:\n';
  r.inventory_management.abc_classification.forEach(a => {
    s += `    ${a.class}: SKU占比${a.percent_skus}% | 价值占比${a.percent_value}% | ${a.strategy}\n`;
  });
  s += '\n【智能运营】\n';
  s += `  自动补货: ${r.smart_operations.auto_reorder ? '已启用' : '未启用'}\n`;
  s += `  批量拣选: ${r.smart_operations.batch_picking ? '已启用' : '未启用'}\n`;
  s += `  越库作业: ${r.smart_operations.cross_docking ? '已启用' : '未启用'}\n`;
  s += `  实时追踪: ${r.smart_operations.real_time_tracking ? '已启用' : '未启用'}\n`;
  s += `  数字孪生: ${r.smart_operations.digital_twin ? '已启用' : '未启用'}\n`;
  s += '  效益:\n';
  r.smart_operations.benefits.forEach(b => { s += `    • ${b}\n`; });
  s += '\n【KPI仪表板】\n';
  s += `  订单履行率: ${r.kpi_dashboard.order_fulfillment_rate}%\n`;
  s += `  拣选准确率: ${r.kpi_dashboard.picking_accuracy}%\n`;
  s += `  平均订单处理: ${r.kpi_dashboard.avg_order_time_min} min\n`;
  s += `  存储密度: ${r.kpi_dashboard.storage_density} t/㎡\n`;
  s += `  能源效率: ${r.kpi_dashboard.energy_efficiency}%\n`;
  s += `  劳动生产率: ${r.kpi_dashboard.labor_productivity}%\n\n`;
  s += '【成本效益】\n';
  s += `  当前人工成本: ¥${r.cost_benefit.current_labor_cost.toLocaleString()}/月\n`;
  s += `  自动化后人工: ¥${r.cost_benefit.automated_labor_cost.toLocaleString()}/月\n`;
  s += `  月节约: ¥${r.cost_benefit.monthly_savings.toLocaleString()}\n`;
  s += `  投资总额: ¥${r.cost_benefit.investment.toLocaleString()}\n`;
  s += `  回收期: ${r.cost_benefit.payback_months} 个月\n`;
  s += `  5年ROI: ${r.cost_benefit.five_year_roi}%\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. fabric_quality_inspector
  tools.register(defineTool({
    name: 'fabric_quality_inspector',
    description: '面料质量检测与瑕疵评级 — 基于四分制检验体系，提供瑕疵分析、物理性能测试、外观评价和改进建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含fabric_type, weave_pattern, weight_gsm, width_cm, batch_id, inspection_method, defect_types, sample_size等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFabricQuality(analyzeFabricQuality(JSON.parse(args.input_data)));
    },
  }));

  // 2. dyeing_process_optimizer
  tools.register(defineTool({
    name: 'dyeing_process_optimizer',
    description: '染色工艺优化与色差控制 — 基于面料类型和目标色值，提供配方方案、温控曲线、色差检测(DELTA E)和工艺参数优化',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含fabric_type, fiber_composition, target_color, color_system, target_de, machine_type, bath_ratio, dye_type, auxiliaries等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatDyeing(analyzeDyeing(JSON.parse(args.input_data)));
    },
  }));

  // 3. textile_machine_scheduler
  tools.register(defineTool({
    name: 'textile_machine_scheduler',
    description: '织机排产与效率OEE分析 — 基于订单需求和设备状态，提供生产排程、OEE分析、停机分析和维护计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含loom_type, num_looms, order_list, shift_pattern, working_hours, target_oee, warp_type, weft_density等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatScheduler(analyzeScheduler(JSON.parse(args.input_data)));
    },
  }));

  // 4. yarn_strength_predictor
  tools.register(defineTool({
    name: 'yarn_strength_predictor',
    description: '纱线强度预测与配棉方案 — 基于纤维特性和纺纱工艺，提供强度预测、配棉方案、纺纱工艺和质量评级',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含yarn_count, fiber_blend, spinning_method, target_tenacity, target_csp, twist_per_m, application等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatYarn(analyzeYarn(JSON.parse(args.input_data)));
    },
  }));

  // 5. textile_waste_reducer
  tools.register(defineTool({
    name: 'textile_waste_reducer',
    description: '裁剪排料优化与废料最小化 — 基于裁片形状和面料规格，提供自动排料方案、废料分析和成本节约方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含fabric_width_cm, fabric_length_m, garment_parts, fabric_type, marker_efficiency_target, nesting_method, fabric_cost_per_m等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatWasteReducer(analyzeWasteReducer(JSON.parse(args.input_data)));
    },
  }));

  // 6. sustainable_textile_auditor
  tools.register(defineTool({
    name: 'sustainable_textile_auditor',
    description: '可持续纺织认证与OEKO-TEX合规 — 基于产品和供应链数据，提供OEKO-TEX认证状态、认证路线图、环境指标和化学品合规检测',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含product_type, target_market, certifications, supply_chain_tiers, water_usage_l_per_kg, carbon_footprint_kg, chemical_management, social_compliance等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSustainability(analyzeSustainability(JSON.parse(args.input_data)));
    },
  }));

  // 7. textile_cost_calculator
  tools.register(defineTool({
    name: 'textile_cost_calculator',
    description: '面料成本核算与报价 — 基于纱线价格、工艺参数和订单数量，提供成本构成分析、报价方案、数量折扣和竞争分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含fabric_type, yarn_count, weave_type, width_cm, weight_gsm, order_quantity_m, yarn_price_per_kg, processing_cost_per_m, profit_margin, incoterm等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCost(analyzeCost(JSON.parse(args.input_data)));
    },
  }));

  // 8. smart_warehouse_textile
  tools.register(defineTool({
    name: 'smart_warehouse_textile',
    description: '纺织原料仓储与智能搬运 — 基于仓库参数和库存数据，提供仓储布局优化、AGV搬运方案、库存管理和KPI仪表板',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含warehouse_area_sqm, storage_type, inventory_items, agv_count, wms_system, daily_throughput, picking_method, automation_level等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatWarehouse(analyzeWarehouse(JSON.parse(args.input_data)));
    },
  }));
}
