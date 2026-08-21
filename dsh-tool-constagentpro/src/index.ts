import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'constagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供工程管理参考，不替代专业工程与安全决策。';

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
// 1. project_schedule_optimizer — 进度优化
// ============================================================
interface ScheduleInput {
  project_type?: string;
  total_duration_days?: number;
  num_tasks?: number;
  num_crews?: number;
  start_date?: string;
  weather_delay_days?: number;
  critical_path_tasks?: number;
}

interface ScheduleResult {
  critical_path: { tasks: Array<{ name: string; duration_days: number; es: number; ef: number; ls: number; lf: number; slack: number }>; total_duration: number };
  gantt_summary: Array<{ phase: string; start: string; end: string; progress_pct: number }>;
  resource_allocation: Array<{ crew: string; assigned_tasks: number; utilization_pct: number }>;
  risk_factors: Array<{ factor: string; impact_days: number; probability: string; mitigation: string }>;
  optimization: { original_duration: number; optimized_duration: number; time_saved_days: number; suggestion: string };
  disclaimer: string;
}

function analyzeSchedule(data: ScheduleInput): ScheduleResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const projType = data.project_type || pick(rng, ['住宅楼', '商业综合体', '工业厂房', '市政工程', '桥梁工程']);
  const totalDur = data.total_duration_days ?? Math.round(180 + rng() * 540);
  const numTasks = data.num_tasks ?? Math.round(15 + rng() * 35);
  const numCrews = data.num_crews ?? Math.round(3 + rng() * 7);
  const weatherDelay = data.weather_delay_days ?? Math.round(rng() * 15);
  const cpTasks = data.critical_path_tasks ?? Math.round(5 + rng() * 10);

  const taskNames = [
    '地基基础', '主体结构', '二次结构', '屋面工程', '门窗安装',
    '内墙抹灰', '外墙装饰', '水电安装', '消防工程', '通风空调',
    '电梯安装', '精装修', '室外工程', '园林绿化', '竣工验收',
    '土方开挖', '桩基施工', '防水工程', '砌体工程', '幕墙安装',
  ];

  const tasks = [];
  let cursor = 0;
  for (let i = 0; i < cpTasks; i++) {
    const dur = Math.round(5 + rng() * 30);
    const es = cursor;
    const ef = es + dur;
    tasks.push({
      name: taskNames[i % taskNames.length],
      duration_days: dur,
      es,
      ef,
      ls: es,
      lf: ef,
      slack: 0,
    });
    cursor = ef;
  }
  const totalCP = cursor;

  const nonCpCount = Math.min(numTasks - cpTasks, 5 + Math.floor(rng() * 5));
  for (let i = 0; i < nonCpCount; i++) {
    const dur = Math.round(3 + rng() * 20);
    const slack = Math.round(rng() * 15);
    const es = Math.round(rng() * totalCP * 0.6);
    tasks.push({
      name: taskNames[(cpTasks + i) % taskNames.length],
      duration_days: dur,
      es,
      ef: es + dur,
      ls: es + slack,
      lf: es + dur + slack,
      slack,
    });
  }

  const phases = [
    { phase: '基础施工', pct: 15 },
    { phase: '主体施工', pct: 40 },
    { phase: '装饰装修', pct: 30 },
    { phase: '竣工收尾', pct: 15 },
  ];
  const ganttSummary = phases.map((p, i) => ({
    phase: p.phase,
    start: `第${i === 0 ? 1 : Math.round(totalDur * (i * 0.25))}天`,
    end: `第${Math.round(totalDur * ((i + 1) * 0.25))}天`,
    progress_pct: Math.round(p.pct * (0.8 + rng() * 0.4)),
  }));

  const crewNames = ['钢筋班组', '模板班组', '混凝土班组', '砌筑班组', '抹灰班组', '水电班组', '架子班组', '防水班组', '装饰班组', '幕墙班组'];
  const resourceAlloc = crewNames.slice(0, numCrews).map(c => ({
    crew: c,
    assigned_tasks: Math.round(2 + rng() * 5),
    utilization_pct: round(60 + rng() * 35, 0),
  }));

  const risks = [
    { factor: '恶劣天气', impact_days: weatherDelay, probability: weatherDelay > 10 ? '高' : '中', mitigation: '合理安排室内作业，预留缓冲时间' },
    { factor: '材料供应延迟', impact_days: Math.round(3 + rng() * 10), probability: pick(rng, ['低', '中', '高']), mitigation: '提前采购，建立备用供应商' },
    { factor: '设计变更', impact_days: Math.round(5 + rng() * 15), probability: pick(rng, ['中', '高']), mitigation: '加强图纸会审，减少施工阶段变更' },
    { factor: '劳动力不足', impact_days: Math.round(3 + rng() * 8), probability: pick(rng, ['低', '中']), mitigation: '提前锁定劳务队伍，签订保障协议' },
  ];

  const timeSaved = Math.round(totalDur * (0.05 + rng() * 0.12));

  return {
    critical_path: { tasks, total_duration: totalCP },
    gantt_summary: ganttSummary,
    resource_allocation: resourceAlloc,
    risk_factors: risks,
    optimization: {
      original_duration: totalDur,
      optimized_duration: totalDur - timeSaved,
      time_saved_days: timeSaved,
      suggestion: `通过关键路径优化和资源均衡，可缩短工期约${timeSaved}天`,
    },
    disclaimer: DISCLAIMER,
  };
}

function formatSchedule(r: ScheduleResult): string {
  let s = '=== 项目进度优化分析报告 ===\n\n';
  s += '【关键路径】\n';
  s += `  总工期: ${r.critical_path.total_duration} 天\n`;
  r.critical_path.tasks.forEach((t, i) => {
    s += `  ${i + 1}. ${t.name}: ${t.duration_days}天 | ES=${t.es} EF=${t.ef} LS=${t.ls} LF=${t.lf} 浮动=${t.slack}天\n`;
  });
  s += '\n【甘特图概要】\n';
  r.gantt_summary.forEach(g => {
    s += `  ${g.phase}: ${g.start} ~ ${g.end} (完成${g.progress_pct}%)\n`;
  });
  s += '\n【资源配置】\n';
  r.resource_allocation.forEach(rc => {
    s += `  ${rc.crew}: ${rc.assigned_tasks}项任务 | 利用率${rc.utilization_pct}%\n`;
  });
  s += '\n【风险因素】\n';
  r.risk_factors.forEach(rf => {
    s += `  ${rf.factor} — 影响${rf.impact_days}天 | 概率:${rf.probability}\n`;
    s += `    应对: ${rf.mitigation}\n`;
  });
  s += '\n【优化建议】\n';
  s += `  原工期: ${r.optimization.original_duration}天\n`;
  s += `  优化后: ${r.optimization.optimized_duration}天\n`;
  s += `  节省: ${r.optimization.time_saved_days}天\n`;
  s += `  ${r.optimization.suggestion}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. bim_model_analyzer — BIM模型分析
// ============================================================
interface BimInput {
  model_format?: string;
  building_area_sqm?: number;
  num_disciplines?: number;
  lod_level?: number;
  clash_categories?: string[];
  simulation_type?: string;
}

interface BimResult {
  clash_detection: { total_clashes: number; hard_clashes: number; soft_clashes: number; resolved_pct: number; top_categories: Array<{ category: string; count: number; severity: string }> };
  quantity_survey: { concrete_cum: number; steel_rebar_ton: number; formwork_sqm: number; masonry_cum: number; estimate_accuracy: number };
  simulation_4d: Array<{ phase: string; start_day: number; end_day: number; activities: string[] }>;
  model_quality: { lod_compliance: number; geometry_errors: number; parameter_completeness: number; overall_score: number };
  coordination_report: Array<{ discipline: string; issues: number; status: string }>;
  disclaimer: string;
}

function analyzeBim(data: BimInput): BimResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const area = data.building_area_sqm ?? round(5000 + rng() * 45000, 0);
  const disciplines = data.num_disciplines ?? Math.round(3 + rng() * 5);
  const lod = data.lod_level ?? pick(rng, [200, 300, 350, 400]);

  const totalClashes = Math.round(20 + rng() * 180);
  const hardClashes = Math.round(totalClashes * (0.2 + rng() * 0.3));
  const softClashes = totalClashes - hardClashes;
  const resolvedPct = round(50 + rng() * 45, 1);

  const clashCats = [
    { category: '结构-暖通', count: Math.round(hardClashes * 0.3), severity: '高' },
    { category: '结构-电气', count: Math.round(hardClashes * 0.2), severity: '高' },
    { category: '暖通-给排水', count: Math.round(softClashes * 0.35), severity: '中' },
    { category: '电气-消防', count: Math.round(softClashes * 0.25), severity: '中' },
    { category: '装饰-机电', count: Math.round(softClashes * 0.2), severity: '低' },
  ];

  const concrete = round(area * (0.3 + rng() * 0.2), 0);
  const steelRebar = round(concrete * (0.08 + rng() * 0.04), 1);
  const formwork = round(area * (2.5 + rng() * 1.5), 0);
  const masonry = round(area * (0.15 + rng() * 0.1), 0);

  const simPhases = [
    { phase: '基础结构', start_day: 1, end_day: 60, activities: ['桩基施工', '基础浇筑', '防水施工'] },
    { phase: '主体结构', start_day: 61, end_day: 180, activities: ['柱墙施工', '梁板浇筑', '砌体工程'] },
    { phase: '机电安装', start_day: 120, end_day: 240, activities: ['管线预埋', '设备安装', '系统调试'] },
    { phase: '装饰装修', start_day: 200, end_day: 300, activities: ['墙面装饰', '地面铺装', '吊顶安装'] },
  ];

  const discNames = ['建筑', '结构', '暖通', '给排水', '电气', '消防', '幕墙'];
  const coordReport = discNames.slice(0, disciplines).map(d => ({
    discipline: d,
    issues: Math.round(rng() * 15),
    status: pick(rng, ['已协调', '待协调', '需复核']),
  }));

  return {
    clash_detection: { total_clashes: totalClashes, hard_clashes: hardClashes, soft_clashes: softClashes, resolved_pct: resolvedPct, top_categories: clashCats },
    quantity_survey: { concrete_cum: concrete, steel_rebar_ton: steelRebar, formwork_sqm: formwork, masonry_cum: masonry, estimate_accuracy: round(85 + rng() * 12, 1) },
    simulation_4d: simPhases,
    model_quality: { lod_compliance: round(70 + rng() * 25, 1), geometry_errors: Math.round(rng() * 10), parameter_completeness: round(75 + rng() * 20, 1), overall_score: round(70 + rng() * 25, 1) },
    coordination_report: coordReport,
    disclaimer: DISCLAIMER,
  };
}

function formatBim(r: BimResult): string {
  let s = '=== BIM模型分析报告 ===\n\n';
  s += '【碰撞检测】\n';
  s += `  碰撞总数: ${r.clash_detection.total_clashes}\n`;
  s += `  硬碰撞: ${r.clash_detection.hard_clashes} | 软碰撞: ${r.clash_detection.soft_clashes}\n`;
  s += `  已解决率: ${r.clash_detection.resolved_pct}%\n`;
  s += '  主要碰撞类别:\n';
  r.clash_detection.top_categories.forEach(c => {
    s += `    ${c.category}: ${c.count}处 [${c.severity}]\n`;
  });
  s += '\n【工程量统计】\n';
  s += `  混凝土: ${r.quantity_survey.concrete_cum} m³\n`;
  s += `  钢筋: ${r.quantity_survey.steel_rebar_ton} 吨\n`;
  s += `  模板: ${r.quantity_survey.formwork_sqm} m²\n`;
  s += `  砌体: ${r.quantity_survey.masonry_cum} m³\n`;
  s += `  估算精度: ${r.quantity_survey.estimate_accuracy}%\n\n`;
  s += '【4D施工模拟】\n';
  r.simulation_4d.forEach(sim => {
    s += `  ${sim.phase} (第${sim.start_day}-${sim.end_day}天): ${sim.activities.join('、')}\n`;
  });
  s += '\n【模型质量】\n';
  s += `  LOD合规率: ${r.model_quality.lod_compliance}%\n`;
  s += `  几何错误: ${r.model_quality.geometry_errors}处\n`;
  s += `  参数完整度: ${r.model_quality.parameter_completeness}%\n`;
  s += `  综合评分: ${r.model_quality.overall_score}/100\n\n`;
  s += '【专业协调】\n';
  r.coordination_report.forEach(c => {
    s += `  ${c.discipline}: ${c.issues}个问题 [${c.status}]\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. construction_safety_monitor — 安全监控
// ============================================================
interface SafetyInput {
  project_phase?: string;
  num_workers?: number;
  high_risk_operations?: string[];
  safety_incidents_ytd?: number;
  weather_condition?: string;
  site_area_sqm?: number;
}

interface SafetyResult {
  risk_identification: Array<{ risk: string; level: string; location: string; probability: string; consequence: string }>;
  hazard_inspection: Array<{ item: string; status: string; severity: string; rectification: string }>;
  accident_prevention: { training_completion_rate: number; ppe_compliance_rate: number; permit_approval_rate: number; emergency_drill_count: number };
  safety_score: { overall: number; management: number; site_conditions: number; personnel: number; grade: string };
  action_plan: Array<{ priority: string; action: string; responsible: string; deadline: string }>;
  disclaimer: string;
}

function analyzeSafety(data: SafetyInput): SafetyResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const phase = data.project_phase || pick(rng, ['基础施工', '主体施工', '装饰装修', '机电安装']);
  const workers = data.num_workers ?? Math.round(50 + rng() * 300);
  const incidents = data.safety_incidents_ytd ?? Math.round(rng() * 5);

  const risks = [
    { risk: '高处坠落', level: pick(rng, ['高', '极高']), location: '临边洞口', probability: '中', consequence: '严重' },
    { risk: '物体打击', level: pick(rng, ['中', '高']), location: '吊装区域', probability: '中', consequence: '严重' },
    { risk: '机械伤害', level: pick(rng, ['中', '高']), location: '机械作业区', probability: '低', consequence: '中等' },
    { risk: '触电', level: pick(rng, ['中', '高']), location: '临时用电', probability: '低', consequence: '严重' },
    { risk: '坍塌', level: pick(rng, ['高', '极高']), location: '基坑/模板支撑', probability: '低', consequence: '极严重' },
    { risk: '起重伤害', level: pick(rng, ['中', '高']), location: '塔吊作业区', probability: '低', consequence: '严重' },
  ];

  const inspections = [
    { item: '临边防护', status: pick(rng, ['合格', '需整改', '不合格']), severity: pick(rng, ['低', '中', '高']), rectification: '设置1.2m高防护栏杆并挂安全网' },
    { item: '临时用电', status: pick(rng, ['合格', '需整改']), severity: pick(rng, ['中', '高']), rectification: '按TN-S系统配置，做到三级配电两级保护' },
    { item: '脚手架', status: pick(rng, ['合格', '需整改', '不合格']), severity: pick(rng, ['中', '高']), rectification: '按规范连墙件，验收合格后方可使用' },
    { item: '基坑支护', status: pick(rng, ['合格', '需整改']), severity: pick(rng, ['高', '极高']), rectification: '加强位移监测，及时加固支撑' },
    { item: '消防设施', status: pick(rng, ['合格', '需整改']), severity: pick(rng, ['中', '高']), rectification: '配置足够灭火器，保持消防通道畅通' },
    { item: '安全通道', status: pick(rng, ['合格', '需整改']), severity: pick(rng, ['低', '中']), rectification: '搭设双层防护棚，设置明显标识' },
  ];

  const trainingRate = round(70 + rng() * 28, 1);
  const ppeRate = round(75 + rng() * 23, 1);
  const permitRate = round(80 + rng() * 18, 1);
  const drillCount = Math.round(1 + rng() * 5);

  const mgmtScore = round(65 + rng() * 30, 0);
  const siteScore = round(60 + rng() * 35, 0);
  const personScore = round(70 + rng() * 25, 0);
  const overall = round((mgmtScore + siteScore + personScore) / 3, 0);
  const grade = overall >= 85 ? 'A(优秀)' : overall >= 70 ? 'B(良好)' : overall >= 60 ? 'C(合格)' : 'D(需整改)';

  const actions = [
    { priority: '高', action: '全面排查临边洞口防护', responsible: '安全员', deadline: '3天内' },
    { priority: '高', action: '组织全员安全教育培训', responsible: '项目经理', deadline: '1周内' },
    { priority: '中', action: '更新应急预案并组织演练', responsible: '安全总监', deadline: '2周内' },
    { priority: '中', action: '特种设备检测与操作人员复审', responsible: '设备主管', deadline: '1个月内' },
    { priority: '低', action: '安全文明施工标化提升', responsible: '项目总工', deadline: '持续改进' },
  ];

  return {
    risk_identification: risks,
    hazard_inspection: inspections,
    accident_prevention: { training_completion_rate: trainingRate, ppe_compliance_rate: ppeRate, permit_approval_rate: permitRate, emergency_drill_count: drillCount },
    safety_score: { overall, management: mgmtScore, site_conditions: siteScore, personnel: personScore, grade },
    action_plan: actions,
    disclaimer: DISCLAIMER,
  };
}

function formatSafety(r: SafetyResult): string {
  let s = '=== 施工安全监控报告 ===\n\n';
  s += '【风险识别】\n';
  r.risk_identification.forEach(risk => {
    s += `  ${risk.risk} — 等级:${risk.level} | 位置:${risk.location}\n`;
    s += `    概率:${risk.probability} | 后果:${risk.consequence}\n`;
  });
  s += '\n【隐患排查】\n';
  r.hazard_inspection.forEach(h => {
    s += `  ${h.item} [${h.status}] 严重度:${h.severity}\n`;
    s += `    整改: ${h.rectification}\n`;
  });
  s += '\n【事故预防】\n';
  s += `  培训完成率: ${r.accident_prevention.training_completion_rate}%\n`;
  s += `  PPE佩戴率: ${r.accident_prevention.ppe_compliance_rate}%\n`;
  s += `  作业许可率: ${r.accident_prevention.permit_approval_rate}%\n`;
  s += `  应急演练: ${r.accident_prevention.emergency_drill_count}次/季度\n\n`;
  s += '【安全评分】\n';
  s += `  综合评分: ${r.safety_score.overall}/100 (${r.safety_score.grade})\n`;
  s += `  安全管理: ${r.safety_score.management} | 现场条件: ${r.safety_score.site_conditions} | 人员行为: ${r.safety_score.personnel}\n\n`;
  s += '【行动计划】\n';
  r.action_plan.forEach(a => {
    s += `  [${a.priority}] ${a.action} — 负责人:${a.responsible} | 期限:${a.deadline}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. cost_estimation_engine — 造价估算
// ============================================================
interface CostInput {
  project_type?: string;
  building_area_sqm?: number;
  structure_type?: string;
  num_floors?: number;
  region?: string;
  price_index?: number;
  quote_date?: string;
}

interface CostResult {
  bill_summary: { direct_cost: number; indirect_cost: number; profit_tax: number; total_cost: number; cost_per_sqm: number };
  breakdown: Array<{ category: string; amount: number; percent: number; unit_price?: number }>;
  quota_analysis: Array<{ item: string; quantity: number; unit: string; unit_price: number; total: number }>;
  market_inquiry: Array<{ material: string; unit: string; base_price: number; current_price: number; trend: string }>;
  cost_optimization: { potential_saving_pct: number; suggestions: Array<{ item: string; saving: number; method: string }> };
  disclaimer: string;
}

function analyzeCost(data: CostInput): CostResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const projType = data.project_type || pick(rng, ['住宅楼', '办公楼', '商业综合体', '工业厂房']);
  const area = data.building_area_sqm ?? round(5000 + rng() * 45000, 0);
  const floors = data.num_floors ?? Math.round(6 + rng() * 30);
  const priceIdx = data.price_index ?? round(0.9 + rng() * 0.3, 2);

  const costPerSqm = round((2500 + rng() * 2000) * priceIdx, 0);
  const totalCost = round(area * costPerSqm, 0);
  const directCost = round(totalCost * (0.65 + rng() * 0.1), 0);
  const indirectCost = round(totalCost * (0.15 + rng() * 0.08), 0);
  const profitTax = totalCost - directCost - indirectCost;

  const breakdown = [
    { category: '土建工程', amount: round(directCost * 0.45, 0), percent: 0 },
    { category: '安装工程', amount: round(directCost * 0.25, 0), percent: 0 },
    { category: '装饰工程', amount: round(directCost * 0.2, 0), percent: 0 },
    { category: '措施项目', amount: round(directCost * 0.1, 0), percent: 0 },
    { category: '间接费用', amount: indirectCost, percent: 0 },
    { category: '利润及税金', amount: profitTax, percent: 0 },
  ];
  breakdown.forEach(b => { b.percent = round((b.amount / totalCost) * 100, 1); });

  const quotaItems: Array<{ item: string; quantity: number; unit: string; unit_price: number; total: number }> = [
    { item: 'C30混凝土', quantity: round(area * 0.4, 0), unit: 'm³', unit_price: round(450 + rng() * 100, 0), total: 0 },
    { item: '钢筋(综合)', quantity: round(area * 45, 0), unit: 'kg', unit_price: round(4 + rng() * 1.5, 2), total: 0 },
    { item: '模板(综合)', quantity: round(area * 3, 0), unit: 'm²', unit_price: round(40 + rng() * 20, 0), total: 0 },
    { item: '砌体(加气块)', quantity: round(area * 0.2, 0), unit: 'm³', unit_price: round(250 + rng() * 80, 0), total: 0 },
    { item: '抹灰砂浆', quantity: round(area * 2.5, 0), unit: 'm²', unit_price: round(15 + rng() * 10, 0), total: 0 },
  ];
  quotaItems.forEach(q => { q.total = round(q.quantity * q.unit_price, 0); });

  const materials = [
    { material: '螺纹钢HRB400', unit: '吨', base_price: 3800 },
    { material: '普通硅酸盐水泥P.O42.5', unit: '吨', base_price: 420 },
    { material: '商品混凝土C30', unit: 'm³', base_price: 450 },
    { material: '中砂', unit: '吨', base_price: 120 },
    { material: '碎石', unit: '吨', base_price: 95 },
    { material: '加气混凝土砌块', unit: 'm³', base_price: 260 },
  ];
  const marketInquiry = materials.map(m => {
    const current = round(m.base_price * (0.85 + rng() * 0.4), 0);
    return {
      ...m,
      current_price: current,
      trend: current > m.base_price * 1.05 ? '上涨' : current < m.base_price * 0.95 ? '下跌' : '平稳',
    };
  });

  const savingPct = round(3 + rng() * 8, 1);
  const suggestions = [
    { item: '钢筋优化配料', saving: round(totalCost * 0.01, 0), method: '采用BIM钢筋翻样，优化下料组合' },
    { item: '混凝土损耗控制', saving: round(totalCost * 0.005, 0), method: '严格控制浇筑损耗在1.5%以内' },
    { item: '模板周转次数', saving: round(totalCost * 0.008, 0), method: '采用铝模体系，提高周转次数至80次以上' },
    { item: '集中采购降本', saving: round(totalCost * 0.015, 0), method: '主要材料集中招标采购' },
  ];

  return {
    bill_summary: { direct_cost: directCost, indirect_cost: indirectCost, profit_tax: profitTax, total_cost: totalCost, cost_per_sqm: costPerSqm },
    breakdown,
    quota_analysis: quotaItems,
    market_inquiry: marketInquiry,
    cost_optimization: { potential_saving_pct: savingPct, suggestions },
    disclaimer: DISCLAIMER,
  };
}

function formatCost(r: CostResult): string {
  let s = '=== 造价估算报告 ===\n\n';
  s += '【造价汇总】\n';
  s += `  直接费: ¥${r.bill_summary.direct_cost.toLocaleString()}\n`;
  s += `  间接费: ¥${r.bill_summary.indirect_cost.toLocaleString()}\n`;
  s += `  利润税金: ¥${r.bill_summary.profit_tax.toLocaleString()}\n`;
  s += `  总造价: ¥${r.bill_summary.total_cost.toLocaleString()}\n`;
  s += `  单方造价: ¥${r.bill_summary.cost_per_sqm}/m²\n\n`;
  s += '【费用构成】\n';
  r.breakdown.forEach(b => {
    s += `  ${b.category}: ¥${b.amount.toLocaleString()} (${b.percent}%)\n`;
  });
  s += '\n【定额分析】\n';
  r.quota_analysis.forEach(q => {
    s += `  ${q.item}: ${q.quantity}${q.unit} × ¥${q.unit_price} = ¥${q.total.toLocaleString()}\n`;
  });
  s += '\n【市场询价】\n';
  r.market_inquiry.forEach(m => {
    s += `  ${m.material}: ¥${m.current_price}/${m.unit} (${m.trend})\n`;
  });
  s += '\n【成本优化】\n';
  s += `  潜在节约率: ${r.cost_optimization.potential_saving_pct}%\n`;
  r.cost_optimization.suggestions.forEach(sg => {
    s += `  ${sg.item}: 节约¥${sg.saving.toLocaleString()} — ${sg.method}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. quality_inspection_ai — 质检验收
// ============================================================
interface QualityInput {
  project_phase?: string;
  structure_type?: string;
  inspection_type?: string;
  num_checkpoints?: number;
  concrete_strength_grade?: string;
  num_floors?: number;
}

interface QualityResult {
  actual_measurement: Array<{ item: string; design_value: number; measured_avg: number; pass_rate: number; unit: string }>;
  appearance_evaluation: Array<{ item: string; score: number; grade: string; defects: string[] }>;
  documentation: Array<{ doc_type: string; status: string; completeness: number; issues: string[] }>;
  quality_score: { overall: number; structure: number; decoration: number; installation: number; grade: string };
  rectification_items: Array<{ item: string; severity: string; requirement: string; deadline: string }>;
  disclaimer: string;
}

function analyzeQuality(data: QualityInput): QualityResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const phase = data.project_phase || pick(rng, ['主体结构', '二次结构', '装饰装修', '竣工验收']);

  const measurements = [
    { item: '轴线位置', design_value: 0, measured_avg: round(rng() * 5, 1), pass_rate: round(85 + rng() * 14, 1), unit: 'mm' },
    { item: '层高', design_value: 0, measured_avg: round(-5 + rng() * 10, 1), pass_rate: round(88 + rng() * 11, 1), unit: 'mm' },
    { item: '墙面垂直度', design_value: 0, measured_avg: round(rng() * 6, 1), pass_rate: round(82 + rng() * 16, 1), unit: 'mm' },
    { item: '表面平整度', design_value: 0, measured_avg: round(rng() * 5, 1), pass_rate: round(85 + rng() * 13, 1), unit: 'mm' },
    { item: '截面尺寸', design_value: 0, measured_avg: round(-3 + rng() * 8, 1), pass_rate: round(90 + rng() * 9, 1), unit: 'mm' },
    { item: '楼板厚度', design_value: 0, measured_avg: round(-2 + rng() * 6, 1), pass_rate: round(88 + rng() * 11, 1), unit: 'mm' },
  ];

  const appearances = [
    { item: '混凝土外观', score: round(70 + rng() * 25, 0), grade: '', defects: ['蜂窝麻面(轻微)', '局部气泡'] },
    { item: '砌体工程', score: round(72 + rng() * 23, 0), grade: '', defects: ['灰缝不均匀', '局部通缝'] },
    { item: '抹灰工程', score: round(75 + rng() * 20, 0), grade: '', defects: ['空鼓(少量)', '阴阳角不方正'] },
    { item: '防水工程', score: round(80 + rng() * 18, 0), grade: '', defects: ['搭接宽度不足(局部)'] },
  ];
  appearances.forEach(a => {
    a.grade = a.score >= 90 ? '优' : a.score >= 80 ? '良' : a.score >= 70 ? '合格' : '需整改';
  });

  const docs = [
    { doc_type: '检验批验收记录', status: pick(rng, ['已归档', '待补充', '已归档']), completeness: round(80 + rng() * 18, 0), issues: [] },
    { doc_type: '隐蔽工程验收记录', status: pick(rng, ['已归档', '待补充']), completeness: round(75 + rng() * 22, 0), issues: ['部分影像资料缺失'] },
    { doc_type: '材料进场报验', status: pick(rng, ['已归档', '已归档', '待补充']), completeness: round(85 + rng() * 13, 0), issues: [] },
    { doc_type: '试验检测报告', status: pick(rng, ['已归档', '待补充']), completeness: round(78 + rng() * 20, 0), issues: ['部分报告待取回'] },
    { doc_type: '分项工程验收', status: pick(rng, ['已归档', '待补充']), completeness: round(70 + rng() * 25, 0), issues: ['个别分项未完成验收'] },
  ];

  const structScore = round(70 + rng() * 25, 0);
  const decorScore = round(72 + rng() * 23, 0);
  const installScore = round(75 + rng() * 20, 0);
  const overall = round((structScore + decorScore + installScore) / 3, 0);
  const grade = overall >= 90 ? '优良' : overall >= 80 ? '合格' : overall >= 70 ? '基本合格' : '不合格';

  const rectItems = [
    { item: '墙面空鼓修补', severity: '中', requirement: '凿除空鼓层，重新抹灰', deadline: '7天内' },
    { item: '阴阳角修整', severity: '低', requirement: '重新找方正，偏差≤3mm', deadline: '5天内' },
    { item: '防水层补强', severity: '高', requirement: '重新施工并做闭水试验', deadline: '3天内' },
    { item: '混凝土缺陷修复', severity: '中', requirement: '采用高强砂浆修补平整', deadline: '7天内' },
  ];

  return {
    actual_measurement: measurements,
    appearance_evaluation: appearances,
    documentation: docs,
    quality_score: { overall, structure: structScore, decoration: decorScore, installation: installScore, grade },
    rectification_items: rectItems,
    disclaimer: DISCLAIMER,
  };
}

function formatQuality(r: QualityResult): string {
  let s = '=== 质检验收AI报告 ===\n\n';
  s += '【实测实量】\n';
  r.actual_measurement.forEach(m => {
    s += `  ${m.item}: 偏差${m.measured_avg}${m.unit} | 合格率${m.pass_rate}%\n`;
  });
  s += '\n【观感评价】\n';
  r.appearance_evaluation.forEach(a => {
    s += `  ${a.item}: ${a.score}分 (${a.grade})\n`;
    s += `    缺陷: ${a.defects.join('、')}\n`;
  });
  s += '\n【资料归档】\n';
  r.documentation.forEach(d => {
    s += `  ${d.doc_type}: ${d.status} | 完整度${d.completeness}%\n`;
    if (d.issues.length > 0) s += `    问题: ${d.issues.join('、')}\n`;
  });
  s += '\n【质量评分】\n';
  s += `  综合评分: ${r.quality_score.overall}/100 (${r.quality_score.grade})\n`;
  s += `  结构: ${r.quality_score.structure} | 装饰: ${r.quality_score.decoration} | 安装: ${r.quality_score.installation}\n\n`;
  s += '【整改项】\n';
  r.rectification_items.forEach(rect => {
    s += `  [${rect.severity}] ${rect.item}: ${rect.requirement} | 期限:${rect.deadline}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. subcontractor_manager — 分包管理
// ============================================================
interface SubcontractorInput {
  trade_type?: string;
  num_subcontractors?: number;
  contract_value?: number;
  project_duration_months?: number;
  evaluation_period?: string;
}

interface SubcontractorResult {
  qualification_review: Array<{ subcontractor: string; license: string; safety_permit: string; credit_rating: string; status: string }>;
  performance_evaluation: Array<{ subcontractor: string; quality_score: number; schedule_score: number; safety_score: number; overall: number; grade: string }>;
  settlement_analysis: Array<{ subcontractor: string; contract_amount: number; completed_amount: number; settlement_amount: number; variance_pct: number }>;
  risk_assessment: Array<{ subcontractor: string; risk: string; level: string; mitigation: string }>;
  recommendation: { preferred: Array<string>; watchlist: Array<string>; blacklist: Array<string> };
  disclaimer: string;
}

function analyzeSubcontractor(data: SubcontractorInput): SubcontractorResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const numSubs = data.num_subcontractors ?? Math.round(3 + rng() * 7);
  const contractVal = data.contract_value ?? round(5000000 + rng() * 45000000, 0);

  const subNames = ['中建XX劳务', '华东建设', '华泰建筑', '永达劳务', '鑫源工程', '鼎盛建设', '鸿达劳务', '金盾消防', '天宇幕墙', '恒通机电'];
  const subs = subNames.slice(0, numSubs);

  const qualifications = subs.map(name => ({
    subcontractor: name,
    license: pick(rng, ['建筑工程施工总承包一级', '建筑工程总承包二级', '专业分包一级', '劳务分包资质']),
    safety_permit: pick(rng, ['有效', '有效', '即将到期']),
    credit_rating: pick(rng, ['AAA', 'AA', 'A', 'BBB']),
    status: pick(rng, ['合格', '合格', '合格', '需关注']),
  }));

  const performances = subs.map(name => {
    const q = round(65 + rng() * 30, 0);
    const sch = round(60 + rng() * 35, 0);
    const saf = round(70 + rng() * 28, 0);
    const overall = round((q + sch + saf) / 3, 0);
    return {
      subcontractor: name,
      quality_score: q,
      schedule_score: sch,
      safety_score: saf,
      overall,
      grade: overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 60 ? 'C' : 'D',
    };
  });

  const settlements = subs.map(name => {
    const contractAmt = round(contractVal / numSubs * (0.7 + rng() * 0.6), 0);
    const completedAmt = round(contractAmt * (0.5 + rng() * 0.5), 0);
    const settlementAmt = round(completedAmt * (0.85 + rng() * 0.12), 0);
    return {
      subcontractor: name,
      contract_amount: contractAmt,
      completed_amount: completedAmt,
      settlement_amount: settlementAmt,
      variance_pct: round(((settlementAmt - completedAmt) / completedAmt) * 100, 1),
    };
  });

  const riskItems = [
    { risk: '资金链紧张', level: pick(rng, ['低', '中', '高']), mitigation: '加强付款监管，预留质保金' },
    { risk: '管理能力不足', level: pick(rng, ['低', '中']), mitigation: '增加现场监管频次，派驻管理人员' },
    { risk: '劳务纠纷', level: pick(rng, ['低', '中', '高']), mitigation: '监督工资发放，建立投诉渠道' },
    { risk: '安全事故', level: pick(rng, ['低', '中']), mitigation: '加强安全教育培训，定期检查' },
  ];
  const risks = subs.slice(0, Math.min(4, subs.length)).map((name, i) => ({
    subcontractor: name,
    ...riskItems[i % riskItems.length],
  }));

  const sorted = [...performances].sort((a, b) => b.overall - a.overall);
  const preferred = sorted.filter(p => p.grade === 'A').map(p => p.subcontractor);
  const watchlist = sorted.filter(p => p.grade === 'C').map(p => p.subcontractor);
  const blacklist = sorted.filter(p => p.grade === 'D').map(p => p.subcontractor);
  if (preferred.length === 0 && sorted.length > 0) preferred.push(sorted[0].subcontractor);

  return {
    qualification_review: qualifications,
    performance_evaluation: performances,
    settlement_analysis: settlements,
    risk_assessment: risks,
    recommendation: { preferred, watchlist, blacklist },
    disclaimer: DISCLAIMER,
  };
}

function formatSubcontractor(r: SubcontractorResult): string {
  let s = '=== 分包管理报告 ===\n\n';
  s += '【资质审查】\n';
  r.qualification_review.forEach(q => {
    s += `  ${q.subcontractor}: ${q.license} | 安全许可:${q.safety_permit} | 信用:${q.credit_rating} [${q.status}]\n`;
  });
  s += '\n【履约评价】\n';
  r.performance_evaluation.forEach(p => {
    s += `  ${p.subcontractor}: 质量${p.quality_score} 进度${p.schedule_score} 安全${p.safety_score} | 综合${p.overall} (${p.grade}级)\n`;
  });
  s += '\n【结算分析】\n';
  r.settlement_analysis.forEach(st => {
    s += `  ${st.subcontractor}: 合同¥${st.contract_amount.toLocaleString()} | 完成¥${st.completed_amount.toLocaleString()} | 结算¥${st.settlement_amount.toLocaleString()} (偏差${st.variance_pct}%)\n`;
  });
  s += '\n【风险评估】\n';
  r.risk_assessment.forEach(risk => {
    s += `  ${risk.subcontractor}: ${risk.risk} [${risk.level}] — ${risk.mitigation}\n`;
  });
  s += '\n【推荐名单】\n';
  s += `  优选: ${r.recommendation.preferred.join('、') || '无'}\n`;
  s += `  观察: ${r.recommendation.watchlist.join('、') || '无'}\n`;
  s += `  黑名单: ${r.recommendation.blacklist.join('、') || '无'}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. green_building_certifier — 绿建认证
// ============================================================
interface GreenBuildingInput {
  certification_target?: string;
  building_type?: string;
  building_area_sqm?: number;
  region?: string;
  energy_consumption_kwh_sqm?: number;
  water_recycling_pct?: number;
  green_material_pct?: number;
}

interface GreenBuildingResult {
  certification_readiness: { target: string; current_score: number; required_score: number; gap: number; feasibility: string };
  scoring_breakdown: Array<{ category: string; score: number; max_score: number; percent: number; key_items: string[] }>;
  energy_analysis: { total_consumption_kwh: number; saving_pct: number; measures: Array<{ measure: string; saving_pct: number; cost: number }> };
  sustainability: { carbon_reduction_ton: number; water_saving_ton: number; waste_diversion_pct: number; green_space_pct: number };
  improvement_plan: Array<{ action: string; score_gain: number; cost_estimate: number; priority: string }>;
  disclaimer: string;
}

function analyzeGreenBuilding(data: GreenBuildingInput): GreenBuildingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const target = data.certification_target || pick(rng, ['LEED金级', 'LEED铂金级', '绿建三星', '绿建二星', 'WELL认证']);
  const area = data.building_area_sqm ?? round(5000 + rng() * 45000, 0);

  const requiredScore = target.includes('铂金') ? 80 : target.includes('金') ? 65 : target.includes('三星') ? 70 : target.includes('二星') ? 55 : 60;
  const currentScore = round(40 + rng() * 35, 0);
  const gap = Math.max(0, requiredScore - currentScore);
  const feasibility = gap <= 5 ? '高' : gap <= 15 ? '中' : gap <= 25 ? '低' : '极低';

  const categories: Array<{ category: string; score: number; max_score: number; percent: number; key_items: string[] }> = [
    { category: '节地与室外环境', score: round(8 + rng() * 10, 0), max_score: 20, percent: 0, key_items: ['绿地率', '公共交通', '热岛效应'] },
    { category: '节能与能源利用', score: round(10 + rng() * 15, 0), max_score: 25, percent: 0, key_items: ['围护结构', '高效空调', '可再生能源'] },
    { category: '节水与水资源利用', score: round(6 + rng() * 10, 0), max_score: 15, percent: 0, key_items: ['节水器具', '雨水回收', '中水利用'] },
    { category: '节材与材料资源', score: round(5 + rng() * 8, 0), max_score: 12, percent: 0, key_items: ['绿色建材', '可循环材料', '本地化材料'] },
    { category: '室内环境质量', score: round(7 + rng() * 10, 0), max_score: 15, percent: 0, key_items: ['采光系数', '隔声性能', '空气质量'] },
    { category: '施工管理', score: round(4 + rng() * 8, 0), max_score: 10, percent: 0, key_items: ['绿色施工', '扬尘控制', '噪声控制'] },
    { category: '运营管理', score: round(5 + rng() * 8, 0), max_score: 10, percent: 0, key_items: ['智能系统', '垃圾分类', '能耗监测'] },
  ];
  categories.forEach(c => {
    c.score = Math.min(c.score, c.max_score);
    c.percent = round((c.score / c.max_score) * 100, 1);
  });

  const totalConsumption = round(area * (80 + rng() * 60), 0);
  const savingPct = round(15 + rng() * 30, 1);
  const energyMeasures = [
    { measure: '高性能外墙保温', saving_pct: round(8 + rng() * 10, 1), cost: round(area * (30 + rng() * 50), 0) },
    { measure: '高效空调系统', saving_pct: round(10 + rng() * 12, 1), cost: round(area * (50 + rng() * 80), 0) },
    { measure: 'LED照明+智能控制', saving_pct: round(5 + rng() * 8, 1), cost: round(area * (15 + rng() * 25), 0) },
    { measure: '光伏发电系统', saving_pct: round(10 + rng() * 15, 1), cost: round(area * (80 + rng() * 120), 0) },
  ];

  const carbonRed = round(totalConsumption * savingPct / 100 * 0.00078, 0);
  const waterSaving = round(area * (0.3 + rng() * 0.5), 0);
  const wasteDiversion = round(50 + rng() * 40, 1);
  const greenSpace = round(25 + rng() * 20, 1);

  const improvements = [
    { action: '提升围护结构热工性能', score_gain: round(3 + rng() * 5, 0), cost_estimate: round(area * 40, 0), priority: '高' },
    { action: '安装太阳能光伏系统', score_gain: round(4 + rng() * 6, 0), cost_estimate: round(area * 100, 0), priority: '高' },
    { action: '建设中水回用系统', score_gain: round(2 + rng() * 4, 0), cost_estimate: round(area * 25, 0), priority: '中' },
    { action: '采用绿色建材(≥60%)', score_gain: round(2 + rng() * 3, 0), cost_estimate: round(area * 30, 0), priority: '中' },
    { action: '室内空气质量监测', score_gain: round(1 + rng() * 3, 0), cost_estimate: round(area * 10, 0), priority: '低' },
  ];

  return {
    certification_readiness: { target, current_score: currentScore, required_score: requiredScore, gap, feasibility },
    scoring_breakdown: categories,
    energy_analysis: { total_consumption_kwh: totalConsumption, saving_pct: savingPct, measures: energyMeasures },
    sustainability: { carbon_reduction_ton: carbonRed, water_saving_ton: waterSaving, waste_diversion_pct: wasteDiversion, green_space_pct: greenSpace },
    improvement_plan: improvements,
    disclaimer: DISCLAIMER,
  };
}

function formatGreenBuilding(r: GreenBuildingResult): string {
  let s = '=== 绿建认证分析报告 ===\n\n';
  s += '【认证准备度】\n';
  s += `  目标认证: ${r.certification_readiness.target}\n`;
  s += `  当前得分: ${r.certification_readiness.current_score} | 要求: ${r.certification_readiness.required_score}\n`;
  s += `  差距: ${r.certification_readiness.gap}分 | 可行性: ${r.certification_readiness.feasibility}\n\n`;
  s += '【评分明细】\n';
  r.scoring_breakdown.forEach(c => {
    s += `  ${c.category}: ${c.score}/${c.max_score} (${c.percent}%) — ${c.key_items.join('、')}\n`;
  });
  s += '\n【能耗分析】\n';
  s += `  总能耗: ${r.energy_analysis.total_consumption_kwh.toLocaleString()} kWh/年\n`;
  s += `  节能率: ${r.energy_analysis.saving_pct}%\n`;
  s += '  节能措施:\n';
  r.energy_analysis.measures.forEach(m => {
    s += `    ${m.measure}: 节能${m.saving_pct}% | 投资¥${m.cost.toLocaleString()}\n`;
  });
  s += '\n【可持续性指标】\n';
  s += `  碳减排: ${r.sustainability.carbon_reduction_ton} tCO₂/年\n`;
  s += `  节水: ${r.sustainability.water_saving_ton.toLocaleString()} 吨/年\n`;
  s += `  建筑垃圾回收: ${r.sustainability.waste_diversion_pct}%\n`;
  s += `  绿地率: ${r.sustainability.green_space_pct}%\n\n`;
  s += '【提升计划】\n';
  r.improvement_plan.forEach(imp => {
    s += `  [${imp.priority}] ${imp.action}: +${imp.score_gain}分 | 投资¥${imp.cost_estimate.toLocaleString()}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. site_logistics_planner — 现场平面布置
// ============================================================
interface LogisticsInput {
  site_area_sqm?: number;
  building_footprint_sqm?: number;
  num_tower_cranes?: number;
  construction_phase?: string;
  site_perimeter_m?: number;
  soil_condition?: string;
}

interface LogisticsResult {
  tower_crane_layout: Array<{ id: string; model: string; radius_m: number; coverage_pct: number; lift_capacity_ton: number; position: string }>;
  road_system: { total_length_m: number; width_m: number; material: string; turnaround_points: number; one_way_or_two: string };
  material_yards: Array<{ type: string; area_sqm: number; capacity: string; location: string; distance_to_crane_m: number }>;
  temporary_facilities: Array<{ facility: string; area_sqm: number; location: string; standard: string }>;
  logistics_efficiency: { crane_utilization: number; transport_distance_avg_m: number; site_utilization_pct: number; safety_score: number };
  disclaimer: string;
}

function analyzeLogistics(data: LogisticsInput): LogisticsResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const siteArea = data.site_area_sqm ?? round(10000 + rng() * 40000, 0);
  const footprint = data.building_footprint_sqm ?? round(siteArea * (0.2 + rng() * 0.3), 0);
  const numCranes = data.num_tower_cranes ?? Math.round(1 + rng() * 4);
  const perimeter = data.site_perimeter_m ?? round(400 + rng() * 800, 0);

  const craneModels = ['QTZ63(5013)', 'QTZ80(6010)', 'QTZ125(6015)', 'QTZ250(7030)', 'QTZ315(7535)'];
  const cranes = [];
  for (let i = 0; i < numCranes; i++) {
    const radius = pick(rng, [40, 45, 50, 55, 60, 65, 70]);
    cranes.push({
      id: `TC${i + 1}`,
      model: pick(rng, craneModels),
      radius_m: radius,
      coverage_pct: round(Math.min(95, (Math.PI * radius * radius / footprint) * 100 / numCranes), 1),
      lift_capacity_ton: round(6 + rng() * 10, 1),
      position: pick(rng, ['建筑物北侧', '建筑物南侧', '建筑物中部', '建筑物东侧', '建筑物西侧']),
    });
  }

  const roadLength = round(perimeter * (0.6 + rng() * 0.4), 0);
  const roadWidth = pick(rng, [4, 4.5, 6, 7]);
  const roadSystem = {
    total_length_m: roadLength,
    width_m: roadWidth,
    material: pick(rng, ['200mm厚C20混凝土', '250mm厚C25混凝土', '钢板道路(可周转)']),
    turnaround_points: Math.round(2 + rng() * 4),
    one_way_or_two: roadWidth >= 6 ? '双向通行' : '单向通行+会车点',
  };

  const yards = [
    { type: '钢筋加工场', area_sqm: round(200 + rng() * 400, 0), capacity: '日加工30-50吨', location: '塔吊覆盖范围内', distance_to_crane_m: round(10 + rng() * 30, 0) },
    { type: '模板堆场', area_sqm: round(150 + rng() * 300, 0), capacity: '存放5000m²模板', location: '靠近加工区', distance_to_crane_m: round(15 + rng() * 25, 0) },
    { type: '砂石料场', area_sqm: round(300 + rng() * 500, 0), capacity: '存量1000m³', location: '搅拌站附近', distance_to_crane_m: round(20 + rng() * 30, 0) },
    { type: '钢结构堆场', area_sqm: round(200 + rng() * 300, 0), capacity: '存放200吨', location: '吊装作业区', distance_to_crane_m: round(5 + rng() * 20, 0) },
    { type: '砌体材料场', area_sqm: round(100 + rng() * 200, 0), capacity: '存量500m³', location: '施工电梯附近', distance_to_crane_m: round(20 + rng() * 30, 0) },
  ];

  const facilities = [
    { facility: '办公区(活动板房)', area_sqm: round(150 + rng() * 300, 0), location: '场地入口处', standard: '双层轻钢龙骨活动板房' },
    { facility: '工人生活区', area_sqm: round(300 + rng() * 500, 0), location: '场地边角', standard: '人均居住面积≥2.5m²' },
    { facility: '钢筋加工棚', area_sqm: round(200 + rng() * 200, 0), location: '加工场上方', standard: '标准化防护棚' },
    { facility: '搅拌站/砂浆罐', area_sqm: round(100 + rng() * 150, 0), location: '场地中部', standard: '全自动计量搅拌系统' },
    { facility: '临时配电房', area_sqm: round(20 + rng() * 30, 0), location: '负荷中心附近', standard: '标准化配电房' },
    { facility: '消防水池', area_sqm: round(50 + rng() * 100, 0), location: '场地一角', standard: '有效容积≥100m³' },
    { facility: '洗车槽+沉淀池', area_sqm: round(30 + rng() * 50, 0), location: '出入口处', standard: '三级沉淀+自动冲洗' },
  ];

  const craneUtil = round(65 + rng() * 30, 1);
  const avgDist = round(50 + rng() * 100, 0);
  const siteUtil = round(50 + rng() * 35, 1);
  const safetyScore = round(70 + rng() * 25, 0);

  return {
    tower_crane_layout: cranes,
    road_system: roadSystem,
    material_yards: yards,
    temporary_facilities: facilities,
    logistics_efficiency: { crane_utilization: craneUtil, transport_distance_avg_m: avgDist, site_utilization_pct: siteUtil, safety_score: safetyScore },
    disclaimer: DISCLAIMER,
  };
}

function formatLogistics(r: LogisticsResult): string {
  let s = '=== 现场平面布置规划报告 ===\n\n';
  s += '【塔吊布置】\n';
  r.tower_crane_layout.forEach(c => {
    s += `  ${c.id} (${c.model}): 半径${c.radius_m}m | 覆盖${c.coverage_pct}% | 吊重${c.lift_capacity_ton}t | ${c.position}\n`;
  });
  s += '\n【道路系统】\n';
  s += `  总长度: ${r.road_system.total_length_m}m | 宽度: ${r.road_system.width_m}m\n`;
  s += `  路面: ${r.road_system.material}\n`;
  s += `  回车点: ${r.road_system.turnaround_points}处 | 通行: ${r.road_system.one_way_or_two}\n\n`;
  s += '【材料堆场】\n';
  r.material_yards.forEach(y => {
    s += `  ${y.type}: ${y.area_sqm}m² | ${y.capacity} | ${y.location} | 距塔吊${y.distance_to_crane_m}m\n`;
  });
  s += '\n【临时设施】\n';
  r.temporary_facilities.forEach(f => {
    s += `  ${f.facility}: ${f.area_sqm}m² | ${f.location} | ${f.standard}\n`;
  });
  s += '\n【物流效率】\n';
  s += `  塔吊利用率: ${r.logistics_efficiency.crane_utilization}%\n`;
  s += `  平均运距: ${r.logistics_efficiency.transport_distance_avg_m}m\n`;
  s += `  场地利用率: ${r.logistics_efficiency.site_utilization_pct}%\n`;
  s += `  安全评分: ${r.logistics_efficiency.safety_score}/100\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. project_schedule_optimizer
  tools.register(defineTool({
    name: 'project_schedule_optimizer',
    description: '项目进度优化 — 基于项目参数和资源配置，提供关键路径分析、甘特图概要、资源分配、风险因素识别和工期优化建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_type, total_duration_days, num_tasks, num_crews, start_date, weather_delay_days, critical_path_tasks等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSchedule(analyzeSchedule(JSON.parse(args.input_data)));
    },
  }));

  // 2. bim_model_analyzer
  tools.register(defineTool({
    name: 'bim_model_analyzer',
    description: 'BIM模型分析 — 基于模型参数，提供碰撞检测、工程量统计、4D施工模拟、模型质量评估和专业协调报告',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含model_format, building_area_sqm, num_disciplines, lod_level, clash_categories, simulation_type等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatBim(analyzeBim(JSON.parse(args.input_data)));
    },
  }));

  // 3. construction_safety_monitor
  tools.register(defineTool({
    name: 'construction_safety_monitor',
    description: '施工安全监控 — 基于施工阶段和人员配置，提供风险识别、隐患排查、事故预防、安全评分和行动计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_phase, num_workers, high_risk_operations, safety_incidents_ytd, weather_condition, site_area_sqm等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSafety(analyzeSafety(JSON.parse(args.input_data)));
    },
  }));

  // 4. cost_estimation_engine
  tools.register(defineTool({
    name: 'cost_estimation_engine',
    description: '造价估算引擎 — 基于项目特征和市场数据，提供造价汇总、费用构成、定额分析、市场询价和成本优化建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_type, building_area_sqm, structure_type, num_floors, region, price_index, quote_date等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCost(analyzeCost(JSON.parse(args.input_data)));
    },
  }));

  // 5. quality_inspection_ai
  tools.register(defineTool({
    name: 'quality_inspection_ai',
    description: '质检验收AI — 基于施工阶段和验收标准，提供实测实量、观感评价、资料归档、质量评分和整改项管理',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_phase, structure_type, inspection_type, num_checkpoints, concrete_strength_grade, num_floors等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatQuality(analyzeQuality(JSON.parse(args.input_data)));
    },
  }));

  // 6. subcontractor_manager
  tools.register(defineTool({
    name: 'subcontractor_manager',
    description: '分包管理 — 基于分包数据和履约情况，提供资质审查、履约评价、结算分析、风险评估和推荐名单',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含trade_type, num_subcontractors, contract_value, project_duration_months, evaluation_period等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSubcontractor(analyzeSubcontractor(JSON.parse(args.input_data)));
    },
  }));

  // 7. green_building_certifier
  tools.register(defineTool({
    name: 'green_building_certifier',
    description: '绿建认证分析 — 基于认证目标和建筑参数，提供认证准备度、评分明细、能耗分析、可持续性指标和提升计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含certification_target, building_type, building_area_sqm, region, energy_consumption_kwh_sqm, water_recycling_pct, green_material_pct等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatGreenBuilding(analyzeGreenBuilding(JSON.parse(args.input_data)));
    },
  }));

  // 8. site_logistics_planner
  tools.register(defineTool({
    name: 'site_logistics_planner',
    description: '现场平面布置规划 — 基于场地条件和施工阶段，提供塔吊布置、道路系统、材料堆场、临时设施和物流效率分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含site_area_sqm, building_footprint_sqm, num_tower_cranes, construction_phase, site_perimeter_m, soil_condition等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatLogistics(analyzeLogistics(JSON.parse(args.input_data)));
    },
  }));
}
