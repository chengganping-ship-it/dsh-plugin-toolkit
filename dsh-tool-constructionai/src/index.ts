import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'constructionai';
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
// 1. project_schedule_optimizer — 项目进度优化
// ============================================================
export interface ScheduleInput {
  project_type?: string;
  total_duration_days?: number;
  num_tasks?: number;
  num_crews?: number;
  start_date?: string;
  weather_delay_days?: number;
  critical_path_tasks?: number;
}

export interface ScheduleResult {
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

  const tasks: Array<{ name: string; duration_days: number; es: number; ef: number; ls: number; lf: number; slack: number }> = [];
  let cursor = 0;
  for (let i = 0; i < cpTasks; i++) {
    const dur = Math.round(5 + rng() * 30);
    const es = cursor;
    const ef = es + dur;
    tasks.push({ name: taskNames[i % taskNames.length], duration_days: dur, es, ef, ls: es, lf: ef, slack: 0 });
    cursor = ef;
  }

  const nonCpCount = Math.min(numTasks - cpTasks, 5 + Math.floor(rng() * 5));
  for (let i = 0; i < nonCpCount; i++) {
    const dur = Math.round(3 + rng() * 20);
    const slack = Math.round(rng() * 15);
    const es = Math.round(rng() * cursor * 0.6);
    tasks.push({ name: taskNames[(cpTasks + i) % taskNames.length], duration_days: dur, es, ef: es + dur, ls: es + slack, lf: es + dur + slack, slack });
  }

  const phases = [
    { phase: '基础施工', ratio: 0.15 },
    { phase: '主体施工', ratio: 0.4 },
    { phase: '装饰装修', ratio: 0.3 },
    { phase: '竣工收尾', ratio: 0.15 },
  ];
  let prevEnd = 0;
  const ganttSummary = phases.map(p => {
    const len = Math.round(totalDur * p.ratio);
    const start = prevEnd;
    const end = start + len;
    prevEnd = end;
    return { phase: p.phase, start: `第${start}天`, end: `第${end}天`, progress_pct: Math.round(60 + rng() * 40) };
  });

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
    critical_path: { tasks, total_duration: cursor },
    gantt_summary: ganttSummary,
    resource_allocation: resourceAlloc,
    risk_factors: risks,
    optimization: { original_duration: totalDur, optimized_duration: totalDur - timeSaved, time_saved_days: timeSaved, suggestion: `通过关键路径优化和资源均衡，可缩短工期约${timeSaved}天` },
    disclaimer: DISCLAIMER,
  };
}

function formatSchedule(r: ScheduleResult): string {
  let s = '=== Construction AI — 项目进度优化分析报告 ===\n\n';
  s += `【项目类型】优化对象: 全生命周期施工项目\n`;
  s += `【关键路径】\n`;
  s += `  总工期: ${r.critical_path.total_duration} 天\n`;
  r.critical_path.tasks.forEach((t, i) => {
    s += `  ${i + 1}. ${t.name}: ${t.duration_days}天 | ES=${t.es} EF=${t.ef} LS=${t.ls} LF=${t.lf} 浮动=${t.slack}天\n`;
  });
  s += '\n【甘特图概要】\n';
  r.gantt_summary.forEach(g => { s += `  ${g.phase}: ${g.start} ~ ${g.end} (完成${g.progress_pct}%)\n`; });
  s += '\n【资源配置】\n';
  r.resource_allocation.forEach(rc => { s += `  ${rc.crew}: ${rc.assigned_tasks}项任务 | 利用率${rc.utilization_pct}%\n`; });
  s += '\n【风险因素】\n';
  r.risk_factors.forEach(rf => { s += `  ${rf.factor} — 影响${rf.impact_days}天 | 概率:${rf.probability}\n    应对: ${rf.mitigation}\n`; });
  s += '\n【优化建议】\n';
  s += `  原工期: ${r.optimization.original_duration}天\n`;
  s += `  优化后: ${r.optimization.optimized_duration}天\n`;
  s += `  节省: ${r.optimization.time_saved_days}天\n`;
  s += `  ${r.optimization.suggestion}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. cost_estimation_ai — 智能造价估算
// ============================================================
export interface CostInput {
  project_type?: string;
  building_area_sqm?: number;
  structure_type?: string;
  num_floors?: number;
  region?: string;
  price_index?: number;
  quote_date?: string;
}

export interface CostResult {
  bill_summary: { direct_cost: number; indirect_cost: number; profit_tax: number; total_cost: number; cost_per_sqm: number };
  breakdown: Array<{ category: string; amount: number; percent: number }>;
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
    return { ...m, current_price: current, trend: current > m.base_price * 1.05 ? '上涨' : current < m.base_price * 0.95 ? '下跌' : '平稳' };
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
    breakdown, quota_analysis: quotaItems, market_inquiry: marketInquiry,
    cost_optimization: { potential_saving_pct: savingPct, suggestions },
    disclaimer: DISCLAIMER,
  };
}

function formatCost(r: CostResult): string {
  let s = '=== Construction AI — 智能造价估算报告 ===\n\n';
  s += '【造价汇总】\n';
  s += `  直接费: ¥${r.bill_summary.direct_cost.toLocaleString()}\n`;
  s += `  间接费: ¥${r.bill_summary.indirect_cost.toLocaleString()}\n`;
  s += `  利润税金: ¥${r.bill_summary.profit_tax.toLocaleString()}\n`;
  s += `  总造价: ¥${r.bill_summary.total_cost.toLocaleString()}\n`;
  s += `  单方造价: ¥${r.bill_summary.cost_per_sqm}/m²\n\n`;
  s += '【费用构成】\n';
  r.breakdown.forEach(b => { s += `  ${b.category}: ¥${b.amount.toLocaleString()} (${b.percent}%)\n`; });
  s += '\n【定额分析】\n';
  r.quota_analysis.forEach(q => { s += `  ${q.item}: ${q.quantity}${q.unit} x ¥${q.unit_price} = ¥${q.total.toLocaleString()}\n`; });
  s += '\n【市场询价】\n';
  r.market_inquiry.forEach(m => { s += `  ${m.material}: ¥${m.current_price}/${m.unit} (${m.trend})\n`; });
  s += '\n【成本优化】\n';
  s += `  潜在节约率: ${r.cost_optimization.potential_saving_pct}%\n`;
  r.cost_optimization.suggestions.forEach(sg => { s += `  ${sg.item}: 节约¥${sg.saving.toLocaleString()} — ${sg.method}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. safety_monitor_ai — 智能安全监控
// ============================================================
export interface SafetyInput {
  project_phase?: string;
  num_workers?: number;
  high_risk_operations?: string[];
  safety_incidents_ytd?: number;
  weather_condition?: string;
  site_area_sqm?: number;
}

export interface SafetyResult {
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
    risk_identification: risks, hazard_inspection: inspections,
    accident_prevention: { training_completion_rate: trainingRate, ppe_compliance_rate: ppeRate, permit_approval_rate: permitRate, emergency_drill_count: drillCount },
    safety_score: { overall, management: mgmtScore, site_conditions: siteScore, personnel: personScore, grade },
    action_plan: actions, disclaimer: DISCLAIMER,
  };
}

function formatSafety(r: SafetyResult): string {
  let s = '=== Construction AI — 智能安全监控报告 ===\n\n';
  s += '【风险识别】\n';
  r.risk_identification.forEach(risk => { s += `  ${risk.risk} — 等级:${risk.level} | 位置:${risk.location}\n    概率:${risk.probability} | 后果:${risk.consequence}\n`; });
  s += '\n【隐患排查】\n';
  r.hazard_inspection.forEach(h => { s += `  ${h.item} [${h.status}] 严重度:${h.severity}\n    整改: ${h.rectification}\n`; });
  s += '\n【事故预防】\n';
  s += `  培训完成率: ${r.accident_prevention.training_completion_rate}%\n`;
  s += `  PPE佩戴率: ${r.accident_prevention.ppe_compliance_rate}%\n`;
  s += `  作业许可率: ${r.accident_prevention.permit_approval_rate}%\n`;
  s += `  应急演练: ${r.accident_prevention.emergency_drill_count}次/季度\n\n`;
  s += '【安全评分】\n';
  s += `  综合评分: ${r.safety_score.overall}/100 (${r.safety_score.grade})\n`;
  s += `  安全管理: ${r.safety_score.management} | 现场条件: ${r.safety_score.site_conditions} | 人员行为: ${r.safety_score.personnel}\n\n`;
  s += '【行动计划】\n';
  r.action_plan.forEach(a => { s += `  [${a.priority}] ${a.action} — 负责人:${a.responsible} | 期限:${a.deadline}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. field_coordination_planner — 现场协调规划
// ============================================================
export interface FieldCoordinationInput {
  project_phase?: string;
  num_crews?: number;
  num_work_zones?: number;
  shift_type?: string;
  coordination_scope?: string;
  num_subcontractors?: number;
  site_area_sqm?: number;
}

export interface FieldCoordinationResult {
  daily_coordination_plan: Array<{ time: string; activity: string; crew: string; zone: string; priority: string }>;
  crew_deployment: Array<{ crew: string; zone: string; shift: string; task: string; headcount: number }>;
  interface_management: Array<{ trade_a: string; trade_b: string; interface_point: string; status: string; action: string }>;
  logistics_plan: { material_delivery: Array<{ material: string; delivery_time: string; zone: string; quantity: string }>; equipment_rotation: Array<{ equipment: string; from_zone: string; to_zone: string; schedule: string }> };
  communication_protocol: { morning_briefing: string; emergency_channel: string; escalation_path: string; reporting_cycle: string };
  coordination_efficiency: { interface_conflicts: number; resolution_rate: number; schedule_adherence: number; crew_utilization: number };
  disclaimer: string;
}

function analyzeFieldCoordination(data: FieldCoordinationInput): FieldCoordinationResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const numCrews = data.num_crews ?? Math.round(4 + rng() * 6);
  const numZones = data.num_work_zones ?? Math.round(3 + rng() * 5);

  const zones = ['A区-基础', 'B区-主体', 'C区-装饰', 'D区-机电', 'E区-室外', 'F区-仓储'];
  const zoneList = zones.slice(0, numZones);

  const dailyActivities = [
    { time: '06:00-06:30', activity: '早班会/安全交底', priority: '高' },
    { time: '06:30-08:00', activity: '钢筋绑扎', priority: '高' },
    { time: '06:30-08:00', activity: '模板支设', priority: '中' },
    { time: '08:00-08:30', activity: '材料进场验收', priority: '中' },
    { time: '08:30-11:30', activity: '混凝土浇筑', priority: '高' },
    { time: '08:30-11:30', activity: '砌筑作业', priority: '中' },
    { time: '11:30-13:00', activity: '午休', priority: '低' },
    { time: '13:00-15:00', activity: '机电预埋', priority: '中' },
    { time: '13:00-16:00', activity: '抹灰施工', priority: '中' },
    { time: '15:00-17:00', activity: '防水施工', priority: '高' },
    { time: '16:00-17:30', activity: '质量巡检', priority: '高' },
    { time: '17:30-18:00', activity: '当日总结/次日计划', priority: '高' },
  ];

  const crewNames = ['钢筋班组', '模板班组', '混凝土班组', '砌筑班组', '抹灰班组', '水电班组', '防水班组', '装饰班组'];
  const crewList = crewNames.slice(0, numCrews);

  const dailyPlan = dailyActivities.map(act => ({
    time: act.time,
    activity: act.activity,
    crew: pick(rng, crewList),
    zone: pick(rng, zoneList),
    priority: act.priority,
  }));

  const crewDeployment = crewList.map(c => ({
    crew: c,
    zone: pick(rng, zoneList),
    shift: pick(rng, ['早班(6:00-14:00)', '中班(10:00-18:00)', '夜班(18:00-2:00)']),
    task: pick(rng, ['绑扎钢筋', '支设模板', '浇筑混凝土', '砌筑墙体', '抹灰找平', '管线预埋', '防水施工', '面层装饰']),
    headcount: Math.round(5 + rng() * 15),
  }));

  const interfacePairs = [
    { a: '结构', b: '机电', point: '预埋套管' },
    { a: '土建', b: '装饰', point: '基层交接' },
    { a: '暖通', b: '电气', point: '综合管线' },
    { a: '给排水', b: '消防', point: '管道交叉' },
    { a: '幕墙', b: '结构', point: '预埋件' },
    { a: '电梯', b: '机电', point: '机房条件' },
  ];
  const interfaceReport = interfacePairs.slice(0, Math.min(numZones + 1, interfacePairs.length)).map(p => ({
    trade_a: p.a,
    trade_b: p.b,
    interface_point: p.point,
    status: pick(rng, ['已协调', '待确认', '冲突中']),
    action: pick(rng, ['召开专题协调会', '调整施工顺序', 'BIM复核碰撞', '现场核定标高']),
  }));

  const materialDeliveries = [
    { material: '钢筋(螺纹钢)', delivery_time: '06:00-07:00', zone: pick(rng, zoneList), quantity: `${Math.round(10 + rng() * 30)}吨` },
    { material: '混凝土(C30)', delivery_time: '07:30-08:30', zone: pick(rng, zoneList), quantity: `${Math.round(20 + rng() * 60)}m³` },
    { material: '加气砌块', delivery_time: '09:00-10:00', zone: pick(rng, zoneList), quantity: `${Math.round(100 + rng() * 200)}块` },
    { material: '砂浆(湿拌)', delivery_time: '13:00-14:00', zone: pick(rng, zoneList), quantity: `${Math.round(5 + rng() * 15)}m³` },
  ];

  const equipmentRotation = [
    { equipment: '塔吊TC1', from_zone: zoneList[0], to_zone: zoneList[zoneList.length > 1 ? 1 : 0], schedule: '08:00-09:00配合转臂' },
    { equipment: '施工电梯', from_zone: zoneList[0], to_zone: pick(rng, zoneList), schedule: '全天运行' },
    { equipment: '混凝土泵车', from_zone: '场外', to_zone: pick(rng, zoneList), schedule: '浇筑期间就位' },
  ];

  const conflicts = Math.round(rng() * 5);
  const resolutionRate = round(70 + rng() * 28, 1);
  const scheduleAdherence = round(75 + rng() * 23, 1);
  const crewUtilization = round(60 + rng() * 35, 1);

  return {
    daily_coordination_plan: dailyPlan,
    crew_deployment: crewDeployment,
    interface_management: interfaceReport,
    logistics_plan: { material_delivery: materialDeliveries, equipment_rotation: equipmentRotation },
    communication_protocol: { morning_briefing: '每日06:00早班会，部署当日任务与安全要点', emergency_channel: '对讲机频道1 + 项目经理手机', escalation_path: '班组长 → 施工员 → 项目经理 → 公司应急办', reporting_cycle: '每日17:30提交当日进度报告' },
    coordination_efficiency: { interface_conflicts: conflicts, resolution_rate: resolutionRate, schedule_adherence: scheduleAdherence, crew_utilization: crewUtilization },
    disclaimer: DISCLAIMER,
  };
}

function formatFieldCoordination(r: FieldCoordinationResult): string {
  let s = '=== Construction AI — 现场协调规划报告 ===\n\n';
  s += '【日常协调计划】\n';
  r.daily_coordination_plan.forEach(p => { s += `  ${p.time} | ${p.activity} | ${p.crew} @ ${p.zone} [${p.priority}]\n`; });
  s += '\n【班组部署】\n';
  r.crew_deployment.forEach(c => { s += `  ${c.crew} @ ${c.zone} | ${c.shift} | ${c.task} | ${c.headcount}人\n`; });
  s += '\n【接口管理】\n';
  r.interface_management.forEach(i => { s += `  ${i.trade_a} ↔ ${i.trade_b} (${i.interface_point}) [${i.status}] → ${i.action}\n`; });
  s += '\n【物流计划 — 材料配送】\n';
  r.logistics_plan.material_delivery.forEach(m => { s += `  ${m.material}: ${m.delivery_time} → ${m.zone} | ${m.quantity}\n`; });
  s += '【物流计划 — 设备调度】\n';
  r.logistics_plan.equipment_rotation.forEach(e => { s += `  ${e.equipment}: ${e.from_zone} → ${e.to_zone} | ${e.schedule}\n`; });
  s += '\n【沟通机制】\n';
  s += `  早班会: ${r.communication_protocol.morning_briefing}\n`;
  s += `  应急通道: ${r.communication_protocol.emergency_channel}\n`;
  s += `  升级路径: ${r.communication_protocol.escalation_path}\n`;
  s += `  报告周期: ${r.communication_protocol.reporting_cycle}\n\n`;
  s += '【协调效率】\n';
  s += `  接口冲突数: ${r.coordination_efficiency.interface_conflicts}\n`;
  s += `  解决率: ${r.coordination_efficiency.resolution_rate}%\n`;
  s += `  进度达标率: ${r.coordination_efficiency.schedule_adherence}%\n`;
  s += `  班组利用率: ${r.coordination_efficiency.crew_utilization}%\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. bim_model_validator — BIM模型验证
// ============================================================
export interface BimValidatorInput {
  model_format?: string;
  building_area_sqm?: number;
  num_disciplines?: number;
  lod_level?: number;
  model_file_size_mb?: number;
  validation_scope?: string;
}

export interface BimValidatorResult {
  clash_detection: { total_clashes: number; hard_clashes: number; soft_clashes: number; resolved_pct: number; top_categories: Array<{ category: string; count: number; severity: string }> };
  model_quality: { lod_compliance: number; geometry_errors: number; parameter_completeness: number; naming_convention_score: number; overall_score: number };
  validation_report: Array<{ discipline: string; issues: number; status: string; recommendation: string }>;
  quantity_extraction: { concrete_cum: number; steel_rebar_ton: number; formwork_sqm: number; masonry_cum: number; accuracy_pct: number };
  improvement_recommendations: Array<{ area: string; current_score: number; target_score: number; action: string }>;
  disclaimer: string;
}

function analyzeBimValidator(data: BimValidatorInput): BimValidatorResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const area = data.building_area_sqm ?? round(5000 + rng() * 45000, 0);
  const disciplines = data.num_disciplines ?? Math.round(3 + rng() * 5);
  const lod = data.lod_level ?? pick(rng, [200, 300, 350, 400]);

  const totalClashes = Math.round(10 + rng() * 150);
  const hardClashes = Math.round(totalClashes * (0.15 + rng() * 0.3));
  const softClashes = totalClashes - hardClashes;
  const resolvedPct = round(40 + rng() * 55, 1);

  const clashCategories = [
    { category: '结构-暖通', count: Math.round(hardClashes * 0.3), severity: '高' },
    { category: '结构-电气', count: Math.round(hardClashes * 0.2), severity: '高' },
    { category: '暖通-给排水', count: Math.round(softClashes * 0.3), severity: '中' },
    { category: '电气-消防', count: Math.round(softClashes * 0.25), severity: '中' },
    { category: '装饰-机电', count: Math.round(softClashes * 0.15), severity: '低' },
  ];

  const lodCompliance = round(60 + rng() * 35, 1);
  const geoErrors = Math.round(rng() * 20);
  const paramComplete = round(65 + rng() * 30, 1);
  const namingScore = round(50 + rng() * 45, 1);
  const overallScore = round((lodCompliance + paramComplete + namingScore) / 3, 1);

  const discNames = ['建筑', '结构', '暖通', '给排水', '电气', '消防', '幕墙'];
  const validationReport = discNames.slice(0, disciplines).map(d => ({
    discipline: d,
    issues: Math.round(rng() * 15),
    status: pick(rng, ['通过', '需复核', '未通过']),
    recommendation: pick(rng, ['加强建模标准执行', '统一命名规范', '完善构件参数', '优化模型拆分策略']),
  }));

  const concrete = round(area * (0.3 + rng() * 0.2), 0);
  const steelRebar = round(concrete * (0.08 + rng() * 0.04), 1);
  const formwork = round(area * (2.5 + rng() * 1.5), 0);
  const masonry = round(area * (0.15 + rng() * 0.1), 0);
  const accuracy = round(80 + rng() * 17, 1);

  const recommendations = [
    { area: '碰撞检测', current_score: resolvedPct, target_score: 95, action: '建立设计阶段碰撞检查机制' },
    { area: 'LOD合规', current_score: lodCompliance, target_score: 90, action: '制定各阶段LOD交付标准' },
    { area: '参数完整度', current_score: paramComplete, target_score: 92, action: '强制必填参数校验规则' },
    { area: '命名规范', current_score: namingScore, target_score: 88, action: '发布项目级建模标准手册' },
  ];

  return {
    clash_detection: { total_clashes: totalClashes, hard_clashes: hardClashes, soft_clashes: softClashes, resolved_pct: resolvedPct, top_categories: clashCategories },
    model_quality: { lod_compliance: lodCompliance, geometry_errors: geoErrors, parameter_completeness: paramComplete, naming_convention_score: namingScore, overall_score: overallScore },
    validation_report: validationReport,
    quantity_extraction: { concrete_cum: concrete, steel_rebar_ton: steelRebar, formwork_sqm: formwork, masonry_cum: masonry, accuracy_pct: accuracy },
    improvement_recommendations: recommendations,
    disclaimer: DISCLAIMER,
  };
}

function formatBimValidator(r: BimValidatorResult): string {
  let s = '=== Construction AI — BIM模型验证报告 ===\n\n';
  s += '【碰撞检测】\n';
  s += `  碰撞总数: ${r.clash_detection.total_clashes}\n`;
  s += `  硬碰撞: ${r.clash_detection.hard_clashes} | 软碰撞: ${r.clash_detection.soft_clashes}\n`;
  s += `  已解决率: ${r.clash_detection.resolved_pct}%\n`;
  s += '  主要碰撞类别:\n';
  r.clash_detection.top_categories.forEach(c => { s += `    ${c.category}: ${c.count}处 [${c.severity}]\n`; });
  s += '\n【模型质量】\n';
  s += `  LOD合规率: ${r.model_quality.lod_compliance}%\n`;
  s += `  几何错误: ${r.model_quality.geometry_errors}处\n`;
  s += `  参数完整度: ${r.model_quality.parameter_completeness}%\n`;
  s += `  命名规范得分: ${r.model_quality.naming_convention_score}/100\n`;
  s += `  综合评分: ${r.model_quality.overall_score}/100\n\n`;
  s += '【验证报告】\n';
  r.validation_report.forEach(v => { s += `  ${v.discipline}: ${v.issues}个问题 [${v.status}] — ${v.recommendation}\n`; });
  s += '\n【工程量提取】\n';
  s += `  混凝土: ${r.quantity_extraction.concrete_cum} m³\n`;
  s += `  钢筋: ${r.quantity_extraction.steel_rebar_ton} 吨\n`;
  s += `  模板: ${r.quantity_extraction.formwork_sqm} m²\n`;
  s += `  砌体: ${r.quantity_extraction.masonry_cum} m³\n`;
  s += `  精度: ${r.quantity_extraction.accuracy_pct}%\n\n`;
  s += '【改进建议】\n';
  r.improvement_recommendations.forEach(imp => { s += `  ${imp.area}: ${imp.current_score} → ${imp.target_score} | ${imp.action}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. subcontractor_performance_tracker — 分包商绩效追踪
// ============================================================
export interface SubtrackerInput {
  trade_type?: string;
  num_subcontractors?: number;
  contract_value?: number;
  evaluation_period?: string;
  project_phase?: string;
  tracking_months?: number;
}

export interface SubtrackerResult {
  performance_dashboard: Array<{ subcontractor: string; quality_score: number; schedule_score: number; safety_score: number; cooperation_score: number; overall: number; grade: string; trend: string }>;
  kpi_breakdown: { quality_avg: number; schedule_avg: number; safety_avg: number; cooperation_avg: number; overall_avg: number };
  risk_alerts: Array<{ subcontractor: string; alert_type: string; severity: string; description: string; action: string }>;
  payment_status: Array<{ subcontractor: string; contract_amount: number; completed_ratio: number; paid_amount: number; pending_amount: number; status: string }>;
  ranking: { top_performers: Array<string>; needs_improvement: Array<string>; replacement_recommended: Array<string> };
  disclaimer: string;
}

function analyzeSubtracker(data: SubtrackerInput): SubtrackerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const numSubs = data.num_subcontractors ?? Math.round(3 + rng() * 7);
  const contractVal = data.contract_value ?? round(5000000 + rng() * 45000000, 0);

  const subNames = ['中建XX劳务', '华东建设', '华泰建筑', '永达劳务', '鑫源工程', '鼎盛建设', '鸿达劳务', '金盾消防', '天宇幕墙', '恒通机电'];
  const subs = subNames.slice(0, numSubs);

  const performances = subs.map(name => {
    const q = round(60 + rng() * 35, 0);
    const sch = round(55 + rng() * 40, 0);
    const saf = round(65 + rng() * 33, 0);
    const coop = round(50 + rng() * 45, 0);
    const overall = round((q + sch + saf + coop) / 4, 0);
    return {
      subcontractor: name, quality_score: q, schedule_score: sch, safety_score: saf, cooperation_score: coop, overall,
      grade: overall >= 85 ? 'A' : overall >= 70 ? 'B' : overall >= 60 ? 'C' : 'D',
      trend: pick(rng, ['上升', '稳定', '下降', '波动']),
    };
  });

  const qualityAvg = round(performances.reduce((a, p) => a + p.quality_score, 0) / performances.length, 1);
  const scheduleAvg = round(performances.reduce((a, p) => a + p.schedule_score, 0) / performances.length, 1);
  const safetyAvg = round(performances.reduce((a, p) => a + p.safety_score, 0) / performances.length, 1);
  const cooperationAvg = round(performances.reduce((a, p) => a + p.cooperation_score, 0) / performances.length, 1);
  const overallAvg = round(performances.reduce((a, p) => a + p.overall, 0) / performances.length, 1);

  const alertTypes = [
    { alert_type: '质量风险', description: '近期验收合格率持续低于标准', action: '约谈整改，增加专项检查频次' },
    { alert_type: '进度滞后', description: '连续两周未完成计划节点', action: '要求提交赶工方案，评估违约责任' },
    { alert_type: '安全隐患', description: '安全检查发现重复性问题', action: '停工整顿，强制安全培训' },
    { alert_type: '配合度低', description: '多次缺席协调会议', action: '书面警告，计入履约评价' },
  ];
  const highRiskSubs = performances.filter(p => p.grade === 'C' || p.grade === 'D');
  const riskAlerts = highRiskSubs.length > 0
    ? highRiskSubs.slice(0, 3).map(p => ({ subcontractor: p.subcontractor, severity: pick(rng, ['中', '高']), ...pick(rng, alertTypes) }))
    : [{ subcontractor: pick(rng, subs), severity: '低', alert_type: '监控提醒', description: '整体运行正常，需持续关注', action: '定期复评' }];

  const paymentStatus = subs.map(name => {
    const contractAmt = round(contractVal / numSubs * (0.6 + rng() * 0.8), 0);
    const completedRatio = round(0.3 + rng() * 0.7, 1);
    const paidAmt = round(contractAmt * completedRatio * (0.7 + rng() * 0.25), 0);
    const pendingAmt = round(contractAmt * completedRatio - paidAmt, 0);
    return {
      subcontractor: name, contract_amount: contractAmt, completed_ratio: completedRatio,
      paid_amount: paidAmt, pending_amount: Math.max(0, pendingAmt),
      status: pendingAmt < contractAmt * 0.05 ? '正常' : '待支付',
    };
  });

  const sorted = [...performances].sort((a, b) => b.overall - a.overall);
  const topPerformers = sorted.filter(p => p.grade === 'A').map(p => p.subcontractor);
  const needsImprovement = sorted.filter(p => p.grade === 'C').map(p => p.subcontractor);
  const replacementRecommended = sorted.filter(p => p.grade === 'D').map(p => p.subcontractor);
  if (topPerformers.length === 0 && sorted.length > 0) topPerformers.push(sorted[0].subcontractor);

  return {
    performance_dashboard: performances,
    kpi_breakdown: { quality_avg: qualityAvg, schedule_avg: scheduleAvg, safety_avg: safetyAvg, cooperation_avg: cooperationAvg, overall_avg: overallAvg },
    risk_alerts: riskAlerts, payment_status: paymentStatus,
    ranking: { top_performers: topPerformers, needs_improvement: needsImprovement, replacement_recommended: replacementRecommended },
    disclaimer: DISCLAIMER,
  };
}

function formatSubtracker(r: SubtrackerResult): string {
  let s = '=== Construction AI — 分包商绩效追踪报告 ===\n\n';
  s += '【绩效看板】\n';
  r.performance_dashboard.forEach(p => {
    s += `  ${p.subcontractor}: 质量${p.quality_score} 进度${p.schedule_score} 安全${p.safety_score} 配合${p.cooperation_score} | 综合${p.overall} (${p.grade}级) 趋势:${p.trend}\n`;
  });
  s += '\n【KPI均值】\n';
  s += `  质量: ${r.kpi_breakdown.quality_avg} | 进度: ${r.kpi_breakdown.schedule_avg} | 安全: ${r.kpi_breakdown.safety_avg} | 配合: ${r.kpi_breakdown.cooperation_avg} | 综合: ${r.kpi_breakdown.overall_avg}\n\n`;
  s += '【风险预警】\n';
  r.risk_alerts.forEach(a => { s += `  [${a.severity}] ${a.subcontractor}: ${a.alert_type} — ${a.description}\n    措施: ${a.action}\n`; });
  s += '\n【支付状态】\n';
  r.payment_status.forEach(p => { s += `  ${p.subcontractor}: 合同¥${p.contract_amount.toLocaleString()} | 完成${p.completed_ratio}% | 已付¥${p.paid_amount.toLocaleString()} | 待付¥${p.pending_amount.toLocaleString()} [${p.status}]\n`; });
  s += '\n【排名】\n';
  s += `  优秀: ${r.ranking.top_performers.join('、') || '无'}\n`;
  s += `  需提升: ${r.ranking.needs_improvement.join('、') || '无'}\n`;
  s += `  建议替换: ${r.ranking.replacement_recommended.join('、') || '无'}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. material_procurement_scheduler — 材料采购调度
// ============================================================
export interface ProcurementInput {
  project_type?: string;
  building_area_sqm?: number;
  num_material_categories?: number;
  procurement_lead_time_days?: number;
  supplier_count?: number;
  delivery_mode?: string;
  buffer_stock_days?: number;
}

export interface ProcurementResult {
  procurement_schedule: Array<{ material: string; quantity: string; unit: string; required_by: string; lead_time_days: number; supplier: string; status: string; estimated_cost: number }>;
  supplier_performance: Array<{ supplier: string; on_time_rate: number; quality_rate: number; price_competitiveness: number; overall_rating: string }>;
  cost_summary: { total_estimated: number; by_category: Array<{ category: string; amount: number; percent: number }>; saving_opportunities: Array<{ method: string; potential_saving_pct: number }> };
  risk_mitigation: Array<{ risk: string; probability: string; impact: string; strategy: string }>;
  inventory_plan: { buffer_stock_days: number; reorder_strategy: string; storage_requirement_sqm: number; just_in_time_items: Array<string> };
  disclaimer: string;
}

function analyzeProcurement(data: ProcurementInput): ProcurementResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const area = data.building_area_sqm ?? round(5000 + rng() * 45000, 0);
  const bufferDays = data.buffer_stock_days ?? Math.round(7 + rng() * 14);
  const leadTime = data.procurement_lead_time_days ?? Math.round(14 + rng() * 30);

  const procurementItems = [
    { material: '螺纹钢HRB400', quantity: round(area * 45, 0).toString(), unit: 'kg', required_by: '第30天前', lead_time_days: leadTime, supplier: '宝钢/沙钢', status: pick(rng, ['已下单', '询价中', '待认价']), estimated_cost: round(area * 45 * round(4 + rng() * 1.5, 2), 0) },
    { material: '商品混凝土C30', quantity: round(area * 0.4, 0).toString(), unit: 'm³', required_by: '第15天前', lead_time_days: Math.round(3 + rng() * 5), supplier: '中建混凝土', status: pick(rng, ['已下单', '生产中']), estimated_cost: round(area * 0.4 * round(450 + rng() * 100, 0), 0) },
    { material: '加气混凝土砌块', quantity: round(area * 0.2, 0).toString(), unit: 'm³', required_by: '第60天前', lead_time_days: Math.round(10 + rng() * 10), supplier: '本地建材商', status: pick(rng, ['已下单', '询价中']), estimated_cost: round(area * 0.2 * round(250 + rng() * 80, 0), 0) },
    { material: '水泥P.O42.5', quantity: round(area * 0.15, 0).toString(), unit: '吨', required_by: '第20天前', lead_time_days: Math.round(7 + rng() * 7), supplier: '海螺/华新', status: pick(rng, ['已下单', '在途']), estimated_cost: round(area * 0.15 * round(400 + rng() * 80, 0), 0) },
    { material: '中砂', quantity: round(area * 0.3, 0).toString(), unit: '吨', required_by: '持续供应', lead_time_days: Math.round(3 + rng() * 5), supplier: '砂石料场', status: '框架协议', estimated_cost: round(area * 0.3 * round(100 + rng() * 30, 0), 0) },
    { material: '防水涂料', quantity: round(area * 0.05, 0).toString(), unit: '吨', required_by: '第45天前', lead_time_days: Math.round(14 + rng() * 7), supplier: '东方雨虹/科顺', status: pick(rng, ['询价中', '待认价']), estimated_cost: round(area * 0.05 * round(8000 + rng() * 4000, 0), 0) },
    { material: '铝合金门窗', quantity: round(area * 0.1, 0).toString(), unit: 'm²', required_by: '第90天前', lead_time_days: Math.round(30 + rng() * 15), supplier: '定制加工厂', status: pick(rng, ['已下单', '待深化']), estimated_cost: round(area * 0.1 * round(400 + rng() * 300, 0), 0) },
    { material: '电缆(低压)', quantity: round(area * 0.8, 0).toString(), unit: 'm', required_by: '第75天前', lead_time_days: Math.round(20 + rng() * 10), supplier: '远东/宝胜', status: pick(rng, ['询价中', '待认价']), estimated_cost: round(area * 0.8 * round(15 + rng() * 10, 0), 0) },
  ];

  const totalCost = procurementItems.reduce((a, p) => a + p.estimated_cost, 0);

  const supplierNames = ['宝钢/沙钢', '中建混凝土', '海螺/华新', '东方雨虹', '定制加工厂', '远东电缆', '本地建材商', '德国西门子'];
  const supplierPerf = supplierNames.slice(0, 4 + Math.round(rng() * 4)).map(name => {
    const onTime = round(70 + rng() * 28, 1);
    const quality = round(75 + rng() * 23, 1);
    const price = round(60 + rng() * 35, 1);
    const overall = (onTime + quality + price) / 3;
    return { supplier: name, on_time_rate: onTime, quality_rate: quality, price_competitiveness: price, overall_rating: overall >= 85 ? '优秀' : overall >= 70 ? '良好' : overall >= 60 ? '合格' : '需改进' };
  });

  const categories = [
    { category: '钢材类', amount: round(totalCost * 0.35, 0), percent: 0 },
    { category: '混凝土及骨料', amount: round(totalCost * 0.25, 0), percent: 0 },
    { category: '装饰材料', amount: round(totalCost * 0.2, 0), percent: 0 },
    { category: '机电材料', amount: round(totalCost * 0.15, 0), percent: 0 },
    { category: '其他材料', amount: round(totalCost * 0.05, 0), percent: 0 },
  ];
  categories.forEach(c => { c.percent = round((c.amount / totalCost) * 100, 1); });

  const savingOpps = [
    { method: '集中招标采购', potential_saving_pct: round(3 + rng() * 5, 1) },
    { method: '战略合作供应商', potential_saving_pct: round(2 + rng() * 3, 1) },
    { method: '锁价合同', potential_saving_pct: round(1 + rng() * 4, 1) },
  ];

  const risks = [
    { risk: '钢材价格波动', probability: '高', impact: '成本增加3-5%', strategy: '签订锁价合同，分批采购' },
    { risk: '供应商产能不足', probability: '中', impact: '供应延迟1-2周', strategy: '备选供应商机制，提前排产' },
    { risk: '运输中断', probability: '低', impact: '延迟3-5天', strategy: '安全库存，多式联运' },
    { risk: '质量不合格', probability: '中', impact: '退货重采', strategy: '进场验收，第三方检测' },
  ];

  return {
    procurement_schedule: procurementItems,
    supplier_performance: supplierPerf,
    cost_summary: { total_estimated: totalCost, by_category: categories, saving_opportunities: savingOpps },
    risk_mitigation: risks,
    inventory_plan: { buffer_stock_days: bufferDays, reorder_strategy: '动态再订货点 + 月度盘点', storage_requirement_sqm: round(area * 0.05, 0), just_in_time_items: ['商品混凝土', '钢筋(按日配送)', '砂浆'] },
    disclaimer: DISCLAIMER,
  };
}

function formatProcurement(r: ProcurementResult): string {
  let s = '=== Construction AI — 材料采购调度报告 ===\n\n';
  s += '【采购计划】\n';
  r.procurement_schedule.forEach(p => { s += `  ${p.material}: ${p.quantity}${p.unit} | ${p.required_by} | 交期${p.lead_time_days}天 | ${p.supplier} [${p.status}] ¥${p.estimated_cost.toLocaleString()}\n`; });
  s += '\n【供应商绩效】\n';
  r.supplier_performance.forEach(sp => { s += `  ${sp.supplier}: 准时率${sp.on_time_rate}% 质量率${sp.quality_rate}% 价格竞争力${sp.price_competitiveness}% [${sp.overall_rating}]\n`; });
  s += '\n【成本汇总】\n';
  s += `  预估总额: ¥${r.cost_summary.total_estimated.toLocaleString()}\n`;
  r.cost_summary.by_category.forEach(c => { s += `  ${c.category}: ¥${c.amount.toLocaleString()} (${c.percent}%)\n`; });
  s += '  节约机会:\n';
  r.cost_summary.saving_opportunities.forEach(o => { s += `    ${o.method}: 节约${o.potential_saving_pct}%\n`; });
  s += '\n【风险缓解】\n';
  r.risk_mitigation.forEach(risk => { s += `  ${risk.risk}: 概率${risk.probability} | 影响${risk.impact}\n    策略: ${risk.strategy}\n`; });
  s += '\n【库存计划】\n';
  s += `  缓冲库存: ${r.inventory_plan.buffer_stock_days}天\n`;
  s += `  再订货策略: ${r.inventory_plan.reorder_strategy}\n`;
  s += `  仓储面积: ${r.inventory_plan.storage_requirement_sqm}m²\n`;
  s += `  JIT物料: ${r.inventory_plan.just_in_time_items.join('、')}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. progress_digital_twin — 进度数字孪生
// ============================================================
export interface DigitalTwinInput {
  project_phase?: string;
  planned_duration_days?: number;
  elapsed_days?: number;
  num_milestones?: number;
  num_work_packages?: number;
  bim_model_available?: boolean;
  iot_sensors_active?: number;
}

export interface DigitalTwinResult {
  progress_comparison: { planned_pct: number; actual_pct: number; variance_pct: number; spi: number; status: string };
  milestone_tracking: Array<{ milestone: string; planned_date: string; forecast_date: string; status: string; delay_days: number }>;
  work_package_status: Array<{ package: string; planned_progress: number; actual_progress: number; variance: number; resource_status: string }>;
  iot_monitoring: Array<{ sensor_type: string; location: string; reading: string; status: string; alert: string }>;
  forecast_completion: { original_completion: string; forecast_completion: string; delay_days: number; confidence: number; risk_level: string };
  ai_insights: Array<{ insight: string; impact: string; recommendation: string }>;
  disclaimer: string;
}

function analyzeDigitalTwin(data: DigitalTwinInput): DigitalTwinResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const totalDur = data.planned_duration_days ?? Math.round(180 + rng() * 360);
  const elapsed = data.elapsed_days ?? Math.round(totalDur * (0.2 + rng() * 0.6));
  const plannedPct = round((elapsed / totalDur) * 100, 1);
  const actualPct = round(plannedPct * (0.8 + rng() * 0.25), 1);
  const variance = round(actualPct - plannedPct, 1);
  const spi = round(actualPct / plannedPct, 2);
  const status = spi >= 0.95 ? '正常' : spi >= 0.85 ? '轻度滞后' : spi >= 0.75 ? '中度滞后' : '严重滞后';

  const milestoneDefs = [
    { milestone: '基础完工', day: round(totalDur * 0.15, 0) },
    { milestone: '主体封顶', day: round(totalDur * 0.45, 0) },
    { milestone: '机电安装完成', day: round(totalDur * 0.7, 0) },
    { milestone: '精装修完成', day: round(totalDur * 0.85, 0) },
    { milestone: '竣工验收', day: round(totalDur * 0.95, 0) },
    { milestone: '交付使用', day: totalDur },
  ];
  const milestoneTracking = milestoneDefs.map(m => {
    const delay = Math.round((rng() - 0.3) * 20);
    return {
      milestone: m.milestone,
      planned_date: `第${m.day}天`,
      forecast_date: `第${m.day + Math.max(0, delay)}天`,
      status: delay <= 0 ? '已达成' : delay <= 5 ? '风险' : '延迟',
      delay_days: Math.max(0, delay),
    };
  });

  const workPackages = [
    { package: '地基与基础', weight: 15 },
    { package: '主体结构', weight: 30 },
    { package: '建筑装饰', weight: 20 },
    { package: '机电安装', weight: 20 },
    { package: '室外工程', weight: 10 },
    { package: '竣工资料', weight: 5 },
  ];
  const workPackageStatus = workPackages.map(wp => {
    const progress = Math.min(100, round(actualPct * (0.8 + rng() * 0.3), 1));
    return { package: wp.package, planned_progress: wp.weight, actual_progress: Math.min(wp.weight, round(progress * wp.weight / 100, 1)), variance: round(progress - plannedPct, 1), resource_status: pick(rng, ['充足', '正常', '紧张', '需补充']) };
  });

  const iotSensors = [
    { sensor_type: '沉降监测', location: '基坑周边', reading: `${round(-2 + rng() * 5, 1)}mm`, status: pick(rng, ['正常', '预警']), alert: '日变化量<2mm/天' },
    { sensor_type: '塔吊荷载', location: 'TC1吊钩', reading: `${round(4 + rng() * 6, 1)}t`, status: pick(rng, ['正常', '预警']), alert: '额定荷载16t' },
    { sensor_type: '环境监测', location: '场界', reading: `PM2.5: ${Math.round(30 + rng() * 70)}ug/m³`, status: pick(rng, ['正常', '超标']), alert: '标准值75ug/m³' },
    { sensor_type: '混凝土温度', location: '大体积浇筑区', reading: `${Math.round(25 + rng() * 30)}°C`, status: pick(rng, ['正常', '预警']), alert: '内外温差<25°C' },
    { sensor_type: '噪声监测', location: '场界北侧', reading: `${Math.round(50 + rng() * 25)}dB`, status: pick(rng, ['正常', '超标']), alert: '昼间标准70dB' },
  ];

  const delayDays = Math.round(Math.max(0, (plannedPct - actualPct) / 100 * totalDur / Math.max(spi, 0.5)));
  const forecastDate = new Date();
  forecastDate.setDate(forecastDate.getDate() + (totalDur - elapsed) + delayDays);
  const confidence = round(60 + rng() * 35, 1);
  const riskLevel = delayDays > 20 ? '高' : delayDays > 10 ? '中' : '低';

  const aiInsights = [
    { insight: `SPI=${spi}，当前进度${status}`, impact: `预计延迟${delayDays}天`, recommendation: '优化关键路径资源配置，压缩非关键工序时差' },
    { insight: '主体结构施工效率低于基准15%', impact: '影响后续工序穿插', recommendation: '增加模板周转，优化劳动力配置' },
    { insight: '近期混凝土供应量波动较大', impact: '可能造成浇筑中断', recommendation: '增加备用搅拌站，签订应急供应协议' },
    { insight: '雨季即将来临，影响室外作业', impact: '有效施工天数减少', recommendation: '提前安排室内工序，做好雨季施工措施' },
  ];

  return {
    progress_comparison: { planned_pct: plannedPct, actual_pct: actualPct, variance_pct: variance, spi, status },
    milestone_tracking: milestoneTracking,
    work_package_status: workPackageStatus,
    iot_monitoring: iotSensors,
    forecast_completion: { original_completion: `第${totalDur}天`, forecast_completion: `第${totalDur + delayDays}天 (${forecastDate.toISOString().slice(0, 10)})`, delay_days: delayDays, confidence, risk_level: riskLevel },
    ai_insights: aiInsights,
    disclaimer: DISCLAIMER,
  };
}

function formatDigitalTwin(r: DigitalTwinResult): string {
  let s = '=== Construction AI — 进度数字孪生报告 ===\n\n';
  s += '【进度对比】\n';
  s += `  计划进度: ${r.progress_comparison.planned_pct}%\n`;
  s += `  实际进度: ${r.progress_comparison.actual_pct}%\n`;
  s += `  偏差: ${r.progress_comparison.variance_pct}%\n`;
  s += `  SPI: ${r.progress_comparison.spi}\n`;
  s += `  状态: ${r.progress_comparison.status}\n\n`;
  s += '【里程碑追踪】\n';
  r.milestone_tracking.forEach(m => { s += `  ${m.milestone}: 计划${m.planned_date} | 预测${m.forecast_date} [${m.status}] 延迟${m.delay_days}天\n`; });
  s += '\n【工作包状态】\n';
  r.work_package_status.forEach(w => { s += `  ${w.package}: 计划${w.planned_progress}% 完成${w.actual_progress}% | 偏差${w.variance}% | 资源[${w.resource_status}]\n`; });
  s += '\n【IoT监测】\n';
  r.iot_monitoring.forEach(i => { s += `  ${i.sensor_type} (${i.location}): ${i.reading} [${i.status}] | ${i.alert}\n`; });
  s += '\n【完工预测】\n';
  s += `  原定完工: ${r.forecast_completion.original_completion}\n`;
  s += `  预测完工: ${r.forecast_completion.forecast_completion}\n`;
  s += `  延迟天数: ${r.forecast_completion.delay_days}天\n`;
  s += `  置信度: ${r.forecast_completion.confidence}%\n`;
  s += `  风险等级: ${r.forecast_completion.risk_level}\n\n`;
  s += '【AI洞察】\n';
  r.ai_insights.forEach(ai => { s += `  ${ai.impact} — ${ai.recommendation}\n`; });
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
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSchedule(analyzeSchedule(JSON.parse(args.input_data))); },
  }));

  // 2. cost_estimation_ai
  tools.register(defineTool({
    name: 'cost_estimation_ai',
    description: '智能造价估算 — 基于项目特征和市场数据，提供造价汇总、费用构成、定额分析、市场询价和成本优化建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_type, building_area_sqm, structure_type, num_floors, region, price_index, quote_date等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCost(analyzeCost(JSON.parse(args.input_data))); },
  }));

  // 3. safety_monitor_ai
  tools.register(defineTool({
    name: 'safety_monitor_ai',
    description: '智能安全监控 — 基于施工阶段和人员配置，提供风险识别、隐患排查、事故预防、安全评分和行动计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_phase, num_workers, high_risk_operations, safety_incidents_ytd, weather_condition, site_area_sqm等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSafety(analyzeSafety(JSON.parse(args.input_data))); },
  }));

  // 4. field_coordination_planner
  tools.register(defineTool({
    name: 'field_coordination_planner',
    description: '现场协调规划 — 基于施工阶段和人员部署，提供日常协调计划、班组部署、接口管理、物流计划、沟通机制和协调效率分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_phase, num_crews, num_work_zones, shift_type, coordination_scope, num_subcontractors, site_area_sqm等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatFieldCoordination(analyzeFieldCoordination(JSON.parse(args.input_data))); },
  }));

  // 5. bim_model_validator
  tools.register(defineTool({
    name: 'bim_model_validator',
    description: 'BIM模型验证 — 基于模型参数，提供碰撞检测、模型质量评估、专业验证报告、工程量提取和改进建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含model_format, building_area_sqm, num_disciplines, lod_level, model_file_size_mb, validation_scope等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatBimValidator(analyzeBimValidator(JSON.parse(args.input_data))); },
  }));

  // 6. subcontractor_performance_tracker
  tools.register(defineTool({
    name: 'subcontractor_performance_tracker',
    description: '分包商绩效追踪 — 提供绩效看板、KPI均值分析、风险预警、支付状态和排名评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含trade_type, num_subcontractors, contract_value, evaluation_period, project_phase, tracking_months等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSubtracker(analyzeSubtracker(JSON.parse(args.input_data))); },
  }));

  // 7. material_procurement_scheduler
  tools.register(defineTool({
    name: 'material_procurement_scheduler',
    description: '材料采购调度 — 提供采购计划、供应商绩效、成本汇总、风险缓解和库存计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_type, building_area_sqm, num_material_categories, procurement_lead_time_days, supplier_count, delivery_mode, buffer_stock_days等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatProcurement(analyzeProcurement(JSON.parse(args.input_data))); },
  }));

  // 8. progress_digital_twin
  tools.register(defineTool({
    name: 'progress_digital_twin',
    description: '进度数字孪生 — 基于进度数据和IoT监测，提供进度对比、里程碑追踪、工作包状态、IoT监测、完工预测和AI洞察',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含project_phase, planned_duration_days, elapsed_days, num_milestones, num_work_packages, bim_model_available, iot_sensors_active等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatDigitalTwin(analyzeDigitalTwin(JSON.parse(args.input_data))); },
  }));
}
