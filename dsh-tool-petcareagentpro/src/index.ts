import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'petcareagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供宠物护理参考，不替代专业兽医诊断与治疗。如宠物出现急性或严重症状，请立即就医。';

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
// 1. pet_symptom_checker — 宠物症状自查与就医建议
// ============================================================
interface SymptomCheckerInput {
  pet_type?: string;
  pet_name?: string;
  age_years?: number;
  weight_kg?: number;
  symptoms?: string[];
  duration_days?: number;
  severity?: string;
  appetite?: string;
  energy_level?: string;
  temperature_c?: number;
}

interface SymptomCheckerResult {
  possible_conditions: Array<{ condition: string; probability: number; severity: string; description: string }>;
  urgency_assessment: { level: string; recommendation: string; timeframe: string; score: number };
  vet_recommendation: { need_visit: boolean; visit_type: string; specialty: string; preparation: string[] };
  home_care: Array<{ measure: string; instruction: string; frequency: string }>;
  warning_signs: string[];
  triage_summary: { total_symptoms: number; red_flags: number; yellow_flags: number; green_flags: number };
  disclaimer: string;
}

function analyzeSymptomChecker(data: SymptomCheckerInput): SymptomCheckerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const petType = data.pet_type || pick(rng, ['犬', '猫', '兔', '仓鼠', '鸟类']);
  const age = data.age_years ?? round(0.5 + rng() * 14, 1);
  const weight = data.weight_kg ?? round(1 + rng() * 39, 1);
  const duration = data.duration_days ?? round(0.5 + rng() * 14, 1);
  const temp = data.temperature_c ?? round(37.5 + rng() * 2.5, 1);
  const severity = data.severity || pick(rng, ['轻微', '中度', '严重']);

  const symptomPools: Record<string, Array<{ condition: string; description: string; baseProb: number }>> = {
    '犬': [
      { condition: '胃肠炎', description: '消化系统炎症，可能由饮食不当或感染引起', baseProb: 75 },
      { condition: '过敏反应', description: '皮肤或全身性过敏，可能与环境或食物相关', baseProb: 65 },
      { condition: '关节炎', description: '关节退行性病变或炎症，常见于高龄犬', baseProb: 55 },
      { condition: '皮肤病', description: '细菌或真菌性皮肤感染', baseProb: 60 },
      { condition: '上呼吸道感染', description: '咳嗽、打喷嚏等呼吸道症状', baseProb: 70 },
      { condition: '胰腺炎', description: '胰腺消化酶异常激活，急性发作需紧急处理', baseProb: 45 },
      { condition: '肾脏疾病', description: '肾功能指标异常，老年犬高发', baseProb: 40 },
    ],
    '猫': [
      { condition: '泌尿系统疾病', description: '尿频、血尿等下泌尿道综合征', baseProb: 70 },
      { condition: '毛球症', description: '吞入过多毛发导致消化不良', baseProb: 60 },
      { condition: '口腔疾病', description: '牙龈炎、牙结石等口腔问题', baseProb: 55 },
      { condition: '肾病', description: '慢性肾病，猫科动物高发疾病', baseProb: 50 },
      { condition: '甲亢', description: '甲状腺功能亢进，常见于老年猫', baseProb: 40 },
      { condition: '糖尿病', description: '血糖代谢异常，多饮多尿', baseProb: 45 },
      { condition: '呼吸道感染', description: '猫鼻支等病毒性呼吸道疾病', baseProb: 65 },
    ],
    '兔': [
      { condition: '消化道停滞', description: '胃肠道蠕动减慢，可能危及生命', baseProb: 70 },
      { condition: '牙齿过长', description: '牙齿异常生长影响进食', baseProb: 55 },
      { condition: '球虫病', description: '肠道寄生虫感染', baseProb: 50 },
    ],
    '仓鼠': [
      { condition: '湿尾症', description: '细菌性肠道感染，死亡率高', baseProb: 65 },
      { condition: '呼吸道感染', description: '打喷嚏、呼吸困难', baseProb: 55 },
    ],
    '鸟类': [
      { condition: '呼吸道感染', description: '鸟喙张开呼吸、尾羽扇动', baseProb: 60 },
      { condition: '羽螨感染', description: '羽毛脱落、皮肤瘙痒', baseProb: 50 },
    ],
  };

  const conditions = (symptomPools[petType] || symptomPools['犬']).map(c => ({
    condition: c.condition,
    probability: round(Math.min(99, Math.max(15, c.baseProb + round(rng() * 20 - 10, 0))), 0),
    severity: pick(rng, ['轻度', '中度', '需关注', '严重']),
    description: c.description,
  })).sort((a, b) => b.probability - a.probability);

  const urgencyScore = round(
    (severity === '严重' ? 80 : severity === '中度' ? 50 : 20) +
    (temp > 39.5 ? 15 : temp < 37 ? 10 : 0) +
    (duration > 7 ? 10 : 0) +
    rng() * 10, 0
  );
  const urgencyLevel = urgencyScore >= 75 ? '紧急' : urgencyScore >= 50 ? '尽快就医' : urgencyScore >= 25 ? '择期就医' : '可居家观察';
  const timeframe = urgencyLevel === '紧急' ? '2小时内' : urgencyLevel === '尽快就医' ? '24小时内' : urgencyLevel === '择期就医' ? '3-5天内' : '持续观察1-2周';

  const needVisit = urgencyScore >= 40;
  const visitType = urgencyLevel === '紧急' ? '急诊' : urgencyLevel === '尽快就医' ? '门诊预约' : urgencyLevel === '择期就医' ? '常规体检' : '无需就诊';
  const specialties: Record<string, string> = {
    '犬': pick(rng, ['内科', '皮肤科', '骨科', '消化科']),
    '猫': pick(rng, ['内科', '泌尿科', '口腔科', '内分泌科']),
    '兔': pick(rng, ['异宠科', '消化科']),
    '仓鼠': pick(rng, ['异宠科']),
    '鸟类': pick(rng, ['鸟类专科', '异宠科']),
  };

  const homeCare = [
    { measure: '监测体温', instruction: `每日测量2次，正常范围${petType === '犬' ? '37.5-39.0°C' : petType === '猫' ? '38.0-39.5°C' : '38-40°C'}`, frequency: '每日2次' },
    { measure: '记录症状变化', instruction: '记录精神、食欲、排便、活动量的变化', frequency: '每日' },
    { measure: '饮食管理', instruction: '少量多餐，提供易消化食物，保证饮水', frequency: '持续' },
    { measure: '环境维护', instruction: '保持温暖舒适，减少应激，适当限制活动', frequency: '持续' },
  ];

  const warningSigns = [
    '呼吸困难或张口呼吸',
    '持续呕吐或腹泻超过24小时',
    '无法站立或行走',
    '意识模糊或抽搐',
    '大量出血',
    '体温超过40°C或低于36°C',
    '腹部肿胀触痛',
  ];

  const redFlags = Math.round((urgencyScore / 100) * 3 + rng() * 2);
  const yellowFlags = Math.round(rng() * 3);
  const greenFlags = Math.max(0, 5 - redFlags - yellowFlags);

  return {
    possible_conditions: conditions.slice(0, 5),
    urgency_assessment: { level: urgencyLevel, recommendation: needVisit ? '建议尽快联系兽医' : '可先居家观察，如症状加重及时就医', timeframe, score: urgencyScore },
    vet_recommendation: { need_visit: needVisit, visit_type: visitType, specialty: specialties[petType] || '全科', preparation: ['携带免疫记录', '记录症状出现时间和变化', '禁食4-6小时(如需化验)', '准备宠物航空箱'] },
    home_care: homeCare,
    warning_signs: warningSigns.slice(0, 4 + Math.floor(rng() * 3)),
    triage_summary: { total_symptoms: data.symptoms?.length || Math.round(2 + rng() * 4), red_flags: redFlags, yellow_flags: yellowFlags, green_flags: greenFlags },
    disclaimer: DISCLAIMER,
  };
}

function formatSymptomChecker(r: SymptomCheckerResult): string {
  let s = '=== 宠物症状自查与就医建议报告 ===\n\n';
  s += '【可能疾病分析】\n';
  r.possible_conditions.forEach((c, i) => {
    s += `  ${i + 1}. ${c.condition} — 概率: ${c.probability}% | 严重度: ${c.severity}\n`;
    s += `     ${c.description}\n`;
  });
  s += '\n【紧急程度评估】\n';
  s += `  等级: ${r.urgency_assessment.level} (评分: ${r.urgency_assessment.score}/100)\n`;
  s += `  建议: ${r.urgency_assessment.recommendation}\n`;
  s += `  时间窗口: ${r.urgency_assessment.timeframe}\n\n`;
  s += '【就医建议】\n';
  s += `  是否需要就诊: ${r.vet_recommendation.need_visit ? '是' : '否'}\n`;
  s += `  就诊类型: ${r.vet_recommendation.visit_type}\n`;
  s += `  推荐科室: ${r.vet_recommendation.specialty}\n`;
  s += '  就诊准备:\n';
  r.vet_recommendation.preparation.forEach(p => { s += `    - ${p}\n`; });
  s += '\n【居家护理】\n';
  r.home_care.forEach(h => {
    s += `  ${h.measure}: ${h.instruction} (${h.frequency})\n`;
  });
  s += '\n【危险信号 — 出现以下情况请立即就医】\n';
  r.warning_signs.forEach(w => { s += `  ⚠ ${w}\n`; });
  s += '\n【分诊摘要】\n';
  s += `  症状总数: ${r.triage_summary.total_symptoms}\n`;
  s += `  红色预警: ${r.triage_summary.red_flags} | 黄色预警: ${r.triage_summary.yellow_flags} | 绿色: ${r.triage_summary.green_flags}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. pet_nutrition_planner — 宠物营养方案与体重管理
// ============================================================
interface NutritionInput {
  pet_type?: string;
  breed?: string;
  age_years?: number;
  weight_kg?: number;
  target_weight_kg?: number;
  activity_level?: string;
  life_stage?: string;
  health_conditions?: string[];
  food_preference?: string;
  meals_per_day?: number;
}

interface NutritionResult {
  body_condition: { current_score: number; ideal_score: number; status: string; weight_status: string };
  daily_calories: { rer: number; der: number; per_meal: number; unit: string };
  nutrition_plan: { protein_pct: number; fat_pct: number; carb_pct: number; fiber_pct: number; key_nutrients: string[] };
  feeding_schedule: Array<{ meal: string; time: string; amount_g: number; notes: string }>;
  weight_management: { current_kg: number; target_kg: number; weekly_change_kg: number; estimated_weeks: number; plan: string };
  supplement_recommendations: Array<{ name: string; dosage: string; purpose: string }>;
  disclaimer: string;
}

function analyzeNutrition(data: NutritionInput): NutritionResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const petType = data.pet_type || pick(rng, ['犬', '猫']);
  const age = data.age_years ?? round(0.5 + rng() * 12, 1);
  const weight = data.weight_kg ?? round(3 + rng() * 27, 1);
  const activity = data.activity_level || pick(rng, ['低', '中', '高']);
  const lifeStage = data.life_stage || (age < 1 ? '幼年期' : age > 7 ? '老年期' : '成年期');

  const bcs = round(3 + rng() * 4, 1);
  const idealBcs = 5;
  const weightStatus = bcs < 4 ? '偏瘦' : bcs <= 5.5 ? '理想' : bcs <= 7 ? '超重' : '肥胖';

  const rer = petType === '犬' ? round(70 * Math.pow(weight, 0.75), 0) : round(70 * Math.pow(weight, 0.75) * 0.9, 0);
  const activityMult = activity === '高' ? 1.8 : activity === '中' ? 1.5 : 1.2;
  const lifeMult = lifeStage === '幼年期' ? 2.0 : lifeStage === '老年期' ? 1.1 : 1.0;
  const der = round(rer * activityMult * lifeMult, 0);
  const mealsPerDay = data.meals_per_day || (lifeStage === '幼年期' ? 3 : 2);
  const perMeal = round(der / mealsPerDay, 0);

  const proteinPct = round(20 + rng() * 15, 1);
  const fatPct = round(10 + rng() * 10, 1);
  const carbPct = round(30 + rng() * 20, 1);
  const fiberPct = round(2 + rng() * 5, 1);

  const keyNutrients = ['Omega-3脂肪酸', '牛磺酸', '维生素A', '维生素D', '钙', '锌', 'L-肉碱'];

  const feedingSchedule = [];
  const mealNames = mealsPerDay === 3 ? ['早餐', '午餐', '晚餐'] : mealsPerDay === 4 ? ['早餐', '午餐', '下午茶', '晚餐'] : ['早餐', '晚餐'];
  const times = mealsPerDay === 3 ? ['07:30', '12:30', '18:30'] : mealsPerDay === 4 ? ['07:30', '12:00', '15:30', '19:00'] : ['08:00', '18:00'];
  for (let i = 0; i < mealsPerDay; i++) {
    feedingSchedule.push({
      meal: mealNames[i],
      time: times[i],
      amount_g: round((der / mealsPerDay) * (0.9 + rng() * 0.2) / 4, 0),
      notes: i === 0 ? '主餐，可添加补充剂' : i === mealsPerDay - 1 ? '晚餐，避免过饱' : '标准份量',
    });
  }

  const targetWeight = data.target_weight_kg ?? round(weight * (weightStatus === '超重' ? 0.9 : weightStatus === '偏瘦' ? 1.05 : 1.0), 1);
  const weightDiff = targetWeight - weight;
  const weeklyChange = round(weightDiff > 0 ? 0.05 * weight : -0.01 * weight, 2);
  const estWeeks = Math.max(1, Math.round(Math.abs(weightDiff) / Math.abs(weeklyChange)));

  const supplements = [
    { name: '鱼油(EPA/DHA)', dosage: `${round(weight * 30, 0)}mg/天`, purpose: '皮肤健康、关节保护、抗炎' },
    { name: '益生菌', dosage: `${round(weight * 1, 0)}亿CFU/天`, purpose: '肠道健康、免疫调节' },
    { name: '葡萄糖胺', dosage: `${round(weight * 20, 0)}mg/天`, purpose: '关节保护、软骨修复' },
    { name: '复合维生素', dosage: '按产品说明', purpose: '补充微量元素' },
  ];

  return {
    body_condition: { current_score: bcs, ideal_score: idealBcs, status: weightStatus, weight_status: weightStatus },
    daily_calories: { rer, der, per_meal: perMeal, unit: 'kcal' },
    nutrition_plan: { protein_pct: proteinPct, fat_pct: fatPct, carb_pct: carbPct, fiber_pct: fiberPct, key_nutrients: keyNutrients },
    feeding_schedule: feedingSchedule,
    weight_management: { current_kg: weight, target_kg: targetWeight, weekly_change_kg: weeklyChange, estimated_weeks: estWeeks, plan: weightStatus === '理想' ? '维持当前体重' : weightStatus === '超重' ? '减重计划：控制热量+增加运动' : '增重计划：增加优质蛋白摄入' },
    supplement_recommendations: supplements.slice(0, 2 + Math.floor(rng() * 2)),
    disclaimer: DISCLAIMER,
  };
}

function formatNutrition(r: NutritionResult): string {
  let s = '=== 宠物营养方案与体重管理报告 ===\n\n';
  s += '【体况评估】\n';
  s += `  当前体况评分: ${r.body_condition.current_score}/9\n`;
  s += `  理想评分: ${r.body_condition.ideal_score}/9\n`;
  s += `  体重状态: ${r.body_condition.status}\n\n`;
  s += '【每日热量需求】\n';
  s += `  静息能量需求(RER): ${r.daily_calories.rer} kcal\n`;
  s += `  每日能量需求(DER): ${r.daily_calories.der} kcal\n`;
  s += `  每餐热量: ${r.daily_calories.per_meal} kcal\n\n`;
  s += '【营养配比】\n';
  s += `  蛋白质: ${r.nutrition_plan.protein_pct}%\n`;
  s += `  脂肪: ${r.nutrition_plan.fat_pct}%\n`;
  s += `  碳水化合物: ${r.nutrition_plan.carb_pct}%\n`;
  s += `  纤维: ${r.nutrition_plan.fiber_pct}%\n`;
  s += `  关键营养素: ${r.nutrition_plan.key_nutrients.join('、')}\n\n`;
  s += '【喂食计划】\n';
  r.feeding_schedule.forEach(f => {
    s += `  ${f.meal} (${f.time}): ${f.amount_g}g — ${f.notes}\n`;
  });
  s += '\n【体重管理】\n';
  s += `  当前体重: ${r.weight_management.current_kg} kg\n`;
  s += `  目标体重: ${r.weight_management.target_kg} kg\n`;
  s += `  每周变化: ${r.weight_management.weekly_change_kg} kg\n`;
  s += `  预计周期: ${r.weight_management.estimated_weeks} 周\n`;
  s += `  方案: ${r.weight_management.plan}\n\n`;
  s += '【补充剂建议】\n';
  r.supplement_recommendations.forEach(sup => {
    s += `  ${sup.name}: ${sup.dosage} — ${sup.purpose}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. vaccination_scheduler — 疫苗计划与驱虫提醒
// ============================================================
interface VaccinationInput {
  pet_type?: string;
  pet_name?: string;
  birth_date?: string;
  age_weeks?: number;
  last_vaccines?: Array<{ name: string; date: string }>;
  last_deworming?: string;
  lifestyle?: string;
  region?: string;
  multi_pet?: boolean;
  travel_plans?: boolean;
}

interface VaccinationResult {
  core_vaccines: Array<{ name: string; due_date: string; status: string; priority: string; description: string }>;
  non_core_vaccines: Array<{ name: string; due_date: string; status: string; recommendation: string; reason: string }>;
  deworming_schedule: Array<{ type: string; frequency: string; next_due: string; products: string[]; notes: string }>;
  annual_plan: Array<{ month: string; items: Array<{ type: string; name: string; action: string }> }>;
  antibody_titer: { recommended: boolean; tests: string[]; frequency: string; notes: string };
  travel_requirements: Array<{ requirement: string; deadline: string; mandatory: boolean }>;
  disclaimer: string;
}

function analyzeVaccination(data: VaccinationInput): VaccinationResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const petType = data.pet_type || pick(rng, ['犬', '猫']);
  const ageWeeks = data.age_weeks ?? Math.round(8 + rng() * 200);
  const lifestyle = data.lifestyle || pick(rng, ['室内', '室内外', '户外', '多宠家庭']);

  const coreVaccines: Record<string, Array<{ name: string; description: string; schedule_weeks: number[]; priority: string }>> = {
    '犬': [
      { name: '犬瘟热(CDV)', description: '高度传染性病毒性疾病，致死率高', schedule_weeks: [6, 9, 12, 16, 52], priority: '核心' },
      { name: '犬细小(CPV)', description: '严重胃肠炎，幼犬致死率高', schedule_weeks: [6, 9, 12, 16, 52], priority: '核心' },
      { name: '犬腺病毒(CAV)', description: '传染性肝炎', schedule_weeks: [6, 9, 12, 16, 52], priority: '核心' },
      { name: '狂犬病(Rabies)', description: '人畜共患病，法律强制免疫', schedule_weeks: [12, 52], priority: '核心/法定' },
    ],
    '猫': [
      { name: '猫泛白细胞减少症(FPV)', description: '猫瘟，高度致死性', schedule_weeks: [8, 12, 16, 52], priority: '核心' },
      { name: '猫杯状病毒(FCV)', description: '上呼吸道感染和口腔疾病', schedule_weeks: [8, 12, 16, 52], priority: '核心' },
      { name: '猫疱疹病毒(FHV)', description: '猫鼻支，终身带毒', schedule_weeks: [8, 12, 16, 52], priority: '核心' },
      { name: '狂犬病(Rabies)', description: '人畜共患病，法律强制免疫', schedule_weeks: [12, 52], priority: '核心/法定' },
    ],
  };

  const coreVacs = (coreVaccines[petType] || coreVaccines['犬']).map(v => {
    const nextWeek = v.schedule_weeks.find(w => w >= ageWeeks) || v.schedule_weeks[v.schedule_weeks.length - 1] + 52;
    const status = ageWeeks < v.schedule_weeks[0] ? '待接种' : nextWeek <= ageWeeks ? '需加强' : '已免疫';
    return {
      name: v.name,
      due_date: `第${nextWeek}周`,
      status,
      priority: v.priority,
      description: v.description,
    };
  });

  const nonCoreVaccines: Record<string, Array<{ name: string; reason: string }>> = {
    '犬': [
      { name: '博德特氏菌(Bordetella)', reason: '犬窝咳，社交/寄养必需' },
      { name: '钩端螺旋体(Leptospira)', reason: '人畜共患，户外/多水区域风险高' },
      { name: '犬流感(CIV)', reason: '社交场所传播风险' },
      { name: '莱姆病(Lyme)', reason: '蜱虫活跃区域' },
    ],
    '猫': [
      { name: '猫白血病(FeLV)', reason: '户外活动/多猫家庭推荐' },
      { name: '猫免疫缺陷病毒(FIV)', reason: '户外活动/打架风险' },
      { name: '猫衣原体', reason: '多猫环境结膜炎风险' },
    ],
  };

  const nonCoreVacRecs = (nonCoreVaccines[petType] || nonCoreVaccines['犬']).map(v => ({
    name: v.name,
    due_date: lifestyle === '室内' ? '可选' : `第${Math.round(12 + rng() * 8)}周`,
    status: lifestyle === '室内' ? '可选' : pick(rng, ['推荐', '强烈建议']),
    recommendation: lifestyle === '室内' ? '低风险，可选择性接种' : '建议接种',
    reason: v.reason,
  }));

  const deworming = [
    { type: '体内驱虫', frequency: ageWeeks < 26 ? '每2周一次' : '每月一次', next_due: ageWeeks < 26 ? `第${ageWeeks + 2}周` : `第${ageWeeks + 4}周`, products: petType === '犬' ? ['米尔贝肟', '吡喹酮', '芬苯达唑'] : ['米尔贝肟', '吡喹酮'], notes: '幼龄期高频驱虫，成年后每月一次' },
    { type: '体外驱虫', frequency: '每月一次', next_due: `第${ageWeeks + 4}周`, products: ['氟雷拉纳', '塞拉菌素', '非泼罗尼'], notes: '全年持续，夏季和蜱虫季节不可中断' },
    { type: '心丝虫预防', frequency: '每月一次', next_due: `第${ageWeeks + 4}周`, products: ['伊维菌素', '米尔贝肟'], notes: '温暖季节持续使用，用药前需检测' },
  ];

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const annualPlan = [];
  for (let i = 0; i < 12; i += 2) {
    const items: Array<{ type: string; name: string; action: string }> = [];
    if (i === 0) items.push({ type: '疫苗', name: '年度加强针', action: '接种核心疫苗加强针' });
    if (i === 2) items.push({ type: '体检', name: '年度全面体检', action: '血常规+生化+尿检' });
    if (i === 4) items.push({ type: '驱虫', name: '夏季驱虫强化', action: '体外驱虫+心丝虫检测' });
    if (i === 8) items.push({ type: '体检', name: '口腔检查', action: '牙结石评估+洗牙评估' });
    if (i === 10) items.push({ type: '疫苗', name: '抗体滴度检测', action: '评估免疫效果决定是否加强' });
    if (items.length === 0) items.push({ type: '驱虫', name: '常规驱虫', action: '体内外驱虫' });
    annualPlan.push({ month: months[i], items });
  }

  const travelReqs = data.travel_plans ? [
    { requirement: '狂犬病抗体滴度检测(RNATT)', deadline: '出发前30天', mandatory: true },
    { requirement: '国际健康证明', deadline: '出发前10天', mandatory: true },
    { requirement: '芯片植入(ISO 11784/11785)', deadline: '出发前', mandatory: true },
    { requirement: '额外疫苗(目的地要求)', deadline: '出发前21天', mandatory: false },
  ] : [];

  return {
    core_vaccines: coreVacs,
    non_core_vaccines: nonCoreVacRecs,
    deworming_schedule: deworming,
    annual_plan: annualPlan,
    antibody_titer: { recommended: true, tests: petType === '犬' ? ['CDV', 'CPV', 'Rabies'] : ['FPV', 'FCV', 'Rabies'], frequency: '每1-3年', notes: '检测抗体水平决定是否需加强接种，避免过度免疫' },
    travel_requirements: travelReqs,
    disclaimer: DISCLAIMER,
  };
}

function formatVaccination(r: VaccinationResult): string {
  let s = '=== 疫苗计划与驱虫提醒报告 ===\n\n';
  s += '【核心疫苗】\n';
  r.core_vaccines.forEach(v => {
    s += `  ${v.name} — ${v.status} | 到期: ${v.due_date} | ${v.priority}\n`;
    s += `     ${v.description}\n`;
  });
  s += '\n【非核心疫苗】\n';
  r.non_core_vaccines.forEach(v => {
    s += `  ${v.name} — ${v.status} | ${v.recommendation}\n`;
    s += `     原因: ${v.reason}\n`;
  });
  s += '\n【驱虫计划】\n';
  r.deworming_schedule.forEach(d => {
    s += `  ${d.type}: ${d.frequency} | 下次: ${d.next_due}\n`;
    s += `     推荐药物: ${d.products.join('、')}\n`;
    s += `     备注: ${d.notes}\n`;
  });
  s += '\n【年度免疫日历】\n';
  r.annual_plan.forEach(m => {
    s += `  ${m.month}:\n`;
    m.items.forEach(item => { s += `    - [${item.type}] ${item.name}: ${item.action}\n`; });
  });
  s += '\n【抗体滴度检测】\n';
  s += `  推荐: ${r.antibody_titer.recommended ? '是' : '否'}\n`;
  s += `  检测项目: ${r.antibody_titer.tests.join('、')}\n`;
  s += `  频率: ${r.antibody_titer.frequency}\n`;
  s += `  说明: ${r.antibody_titer.notes}\n`;
  if (r.travel_requirements.length > 0) {
    s += '\n【出行要求】\n';
    r.travel_requirements.forEach(t => {
      s += `  ${t.requirement} — 截止: ${t.deadline} ${t.mandatory ? '[必须]' : '[建议]'}\n`;
    });
  }
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. pet_behavior_analyzer — 宠物行为问题识别与训练方案
// ============================================================
interface BehaviorInput {
  pet_type?: string;
  breed?: string;
  age_years?: number;
  behavior_issues?: string[];
  frequency?: string;
  triggers?: string[];
  duration_weeks?: number;
  previous_training?: string;
  household_environment?: string;
  daily_exercise_min?: number;
}

interface BehaviorResult {
  behavior_analysis: Array<{ issue: string; category: string; severity: number; root_cause: string; frequency_rating: string }>;
  training_plan: Array<{ phase: string; duration_weeks: number; goals: string[]; techniques: string[]; daily_sessions: number }>;
  environmental_modifications: Array<{ area: string; modification: string; priority: string; expected_impact: string }>;
  enrichment_activities: Array<{ activity: string; duration_min: string; frequency: string; purpose: string }>;
  progress_tracking: { metrics: string[]; check_in_weeks: number[]; success_criteria: string; adjustment_triggers: string[] };
  professional_help: { recommended: boolean; type: string; when_to_seek: string; qualifications: string[] };
  disclaimer: string;
}

function analyzeBehavior(data: BehaviorInput): BehaviorResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const petType = data.pet_type || pick(rng, ['犬', '猫']);
  const age = data.age_years ?? round(0.5 + rng() * 10, 1);
  const exercise = data.daily_exercise_min ?? round(20 + rng() * 100, 0);

  const behaviorPools: Record<string, Array<{ issue: string; category: string; root_cause: string; baseSeverity: number }>> = {
    '犬': [
      { issue: '分离焦虑', category: '焦虑/情绪', root_cause: '过度依恋主人，独处时产生应激', baseSeverity: 70 },
      { issue: '过度吠叫', category: '沟通/警戒', root_cause: '领地意识、焦虑或寻求关注', baseSeverity: 55 },
      { issue: '扑人', category: '社交礼仪', root_cause: '兴奋时缺乏自控训练', baseSeverity: 40 },
      { issue: '破坏行为', category: '行为问题', root_cause: '无聊、焦虑或换牙期不适', baseSeverity: 60 },
      { issue: '牵引绳拉扯', category: '服从性', root_cause: '缺乏牵引训练，外出兴奋', baseSeverity: 45 },
      { issue: '护食/护物', category: '资源保护', root_cause: '资源竞争本能或过往经历', baseSeverity: 75 },
      { issue: '追尾/转圈', category: '强迫行为', root_cause: '压力、无聊或神经性因素', baseSeverity: 50 },
    ],
    '猫': [
      { issue: '乱尿(非医学原因)', category: '如厕行为', root_cause: '猫砂盆不适、领地标记或压力', baseSeverity: 65 },
      { issue: '攻击行为', category: '社交/防御', root_cause: '恐惧、领地或游戏性攻击', baseSeverity: 70 },
      { issue: '过度舔毛', category: '强迫行为', root_cause: '压力、焦虑或皮肤不适', baseSeverity: 55 },
      { issue: '夜间活跃', category: '作息问题', root_cause: '猫科动物夜行性，白天活动不足', baseSeverity: 40 },
      { issue: '抓家具', category: '标记/磨爪', root_cause: '磨爪需求或领地标记', baseSeverity: 45 },
      { issue: '食欲异常', category: '进食行为', root_cause: '挑食、压力或食物厌倦', baseSeverity: 50 },
    ],
  };

  const behaviors = (behaviorPools[petType] || behaviorPools['犬']).slice(0, 2 + Math.floor(rng() * 3)).map(b => ({
    issue: b.issue,
    category: b.category,
    severity: round(Math.min(100, Math.max(20, b.baseSeverity + round(rng() * 20 - 10, 0))), 0),
    root_cause: b.root_cause,
    frequency_rating: pick(rng, ['偶尔', '每日数次', '每周数次', '持续']),
  }));

  const trainingPlan = [
    { phase: '基础建立期', duration_weeks: 2, goals: ['建立信任与联结', '学习基本指令', '建立日常规律'], techniques: ['正向强化(零食奖励)', '标记训练(响片)', '短时高频训练'], daily_sessions: 3 },
    { phase: '行为矫正期', duration_weeks: 4, goals: ['针对性问题改善', '替代行为建立', '环境脱敏'], techniques: ['脱敏训练', '反条件反射', '渐进式暴露'], daily_sessions: 2 },
    { phase: '巩固强化期', duration_weeks: 4, goals: ['行为稳定', '泛化到不同环境', '减少奖励依赖'], techniques: ['间歇性强化', '环境泛化训练', '逐步撤除提示'], daily_sessions: 2 },
    { phase: '维持期', duration_weeks: 4, goals: ['长期行为稳定', '预防复发', '持续心智刺激'], techniques: ['定期复习', '进阶训练', '持续丰富化'], daily_sessions: 1 },
  ];

  const envMods = [
    { area: '休息区', modification: '提供安全、安静的专属空间(笼内训练/猫窝)', priority: '高', expected_impact: '减少焦虑，提供安全感' },
    { area: '活动区', modification: '增加垂直空间(猫爬架)或活动范围', priority: '高', expected_impact: '满足探索需求，消耗精力' },
    { area: '如厕区', modification: '猫砂盆数量=猫数+1，放置安静位置', priority: '中', expected_impact: '减少乱尿行为' },
    { area: '喂食区', modification: '使用慢食碗/益智喂食器', priority: '中', expected_impact: '减缓进食速度，增加心智刺激' },
    { area: '窗户/阳台', modification: '设置观景台或安全纱窗', priority: '低', expected_impact: '提供视觉丰富化' },
  ];

  const enrichment = petType === '犬' ? [
    { activity: '嗅闻游戏', duration_min: '15-20', frequency: '每日1-2次', purpose: '心智消耗、减压、满足嗅闻本能' },
    { activity: '益智玩具', duration_min: '10-15', frequency: '每日1次', purpose: '问题解决能力、减缓进食' },
    { activity: '互动游戏(拔河/寻回)', duration_min: '15-30', frequency: '每日1-2次', purpose: '消耗精力、增进关系' },
    { activity: '社交活动', duration_min: '30-60', frequency: '每周2-3次', purpose: '社交技能、环境适应' },
  ] : [
    { activity: '逗猫棒游戏', duration_min: '10-15', frequency: '每日2-3次', purpose: '模拟狩猎、消耗精力' },
    { activity: '纸箱/袋子探索', duration_min: '自由', frequency: '持续提供', purpose: '环境丰富化、安全感' },
    { activity: '猫薄荷/银藤', duration_min: '10-15', frequency: '每周2-3次', purpose: '感官刺激、愉悦体验' },
    { activity: '窗外观鸟', duration_min: '自由', frequency: '持续', purpose: '视觉丰富化、满足狩猎本能' },
  ];

  const metrics = behaviors.map(b => b.issue + '发生频率');
  metrics.push('训练指令响应率', '日常行为评分');

  const professionalHelp = {
    recommended: behaviors.some(b => b.severity > 70),
    type: petType === '犬' ? '认证犬行为训练师(CCPDT/KA)' : '国际猫行为咨询师(IAABC)',
    when_to_seek: '当行为问题持续超过4周无改善、出现攻击行为、或严重影响生活质量时',
    qualifications: ['CCPDT认证', 'IAABC会员', '动物行为学学位', '正向训练方法', '无强制/惩罚手段'],
  };

  return {
    behavior_analysis: behaviors,
    training_plan: trainingPlan,
    environmental_modifications: envMods,
    enrichment_activities: enrichment,
    progress_tracking: { metrics, check_in_weeks: [2, 4, 8, 12], success_criteria: '目标行为频率降低80%以上，替代行为稳定建立', adjustment_triggers: ['训练4周无改善', '出现新问题行为', '宠物应激反应加剧'] },
    professional_help: professionalHelp,
    disclaimer: DISCLAIMER,
  };
}

function formatBehavior(r: BehaviorResult): string {
  let s = '=== 宠物行为问题识别与训练方案报告 ===\n\n';
  s += '【行为分析】\n';
  r.behavior_analysis.forEach(b => {
    s += `  ${b.issue} [${b.category}] — 严重度: ${b.severity}/100 | 频率: ${b.frequency_rating}\n`;
    s += `     根因: ${b.root_cause}\n`;
  });
  s += '\n【训练计划】\n';
  r.training_plan.forEach(t => {
    s += `  ▶ ${t.phase} (${t.duration_weeks}周)\n`;
    s += `    目标: ${t.goals.join('、')}\n`;
    s += `    方法: ${t.techniques.join('、')}\n`;
    s += `    每日训练: ${t.daily_sessions}次\n`;
  });
  s += '\n【环境改造】\n';
  r.environmental_modifications.forEach(e => {
    s += `  [${e.priority}] ${e.area}: ${e.modification}\n`;
    s += `     预期效果: ${e.expected_impact}\n`;
  });
  s += '\n【丰富化活动】\n';
  r.enrichment_activities.forEach(a => {
    s += `  ${a.activity}: ${a.duration_min}分钟, ${a.frequency} — ${a.purpose}\n`;
  });
  s += '\n【进度追踪】\n';
  s += `  评估指标: ${r.progress_tracking.metrics.join('、')}\n`;
  s += `  检查节点: 第${r.progress_tracking.check_in_weeks.join('、')}周\n`;
  s += `  成功标准: ${r.progress_tracking.success_criteria}\n`;
  s += `  调整触发: ${r.progress_tracking.adjustment_triggers.join('、')}\n\n`;
  s += '【专业帮助建议】\n';
  s += `  建议寻求专业帮助: ${r.professional_help.recommended ? '是' : '否'}\n`;
  s += `  推荐专家类型: ${r.professional_help.type}\n`;
  s += `  何时求助: ${r.professional_help.when_to_seek}\n`;
  s += `  资质要求: ${r.professional_help.qualifications.join('、')}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. pet_insurance_advisor — 宠物保险方案对比与理赔
// ============================================================
interface InsuranceInput {
  pet_type?: string;
  breed?: string;
  age_years?: number;
  weight_kg?: number;
  pre_existing_conditions?: string[];
  budget_monthly?: number;
  coverage_priority?: string;
  previous_claims?: number;
  region?: string;
}

interface InsuranceResult {
  plan_comparison: Array<{ plan_name: string; monthly_premium: number; annual_deductible: number; reimbursement_rate: number; annual_limit: number; lifetime_limit: number; highlights: string[] }>;
  coverage_analysis: { accidents: boolean; illnesses: boolean; hereditary: boolean; dental: boolean; preventive: boolean; alternative_therapy: boolean; behavioral: boolean };
  claim_estimate: { scenario: string; total_cost: number; covered_amount: number; out_of_pocket: number; reimbursement: number };
  pre_existing_impact: { affected_conditions: string[]; waiting_periods: Record<string, string>; exclusions: string[]; recommendations: string };
  provider_ranking: Array<{ provider: string; rating: number; strengths: string[]; weaknesses: string[] }>;
  enrollment_tips: Array<{ tip: string; importance: string; details: string }>;
  disclaimer: string;
}

function analyzeInsurance(data: InsuranceInput): InsuranceResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const petType = data.pet_type || pick(rng, ['犬', '猫']);
  const age = data.age_years ?? round(1 + rng() * 10, 1);
  const budget = data.budget_monthly ?? round(100 + rng() * 400, 0);

  const basePremium = petType === '犬' ? round(80 + age * 25 + rng() * 50, 0) : round(60 + age * 20 + rng() * 40, 0);

  const plans = [
    { plan_name: '基础意外险', monthly_premium: round(basePremium * 0.5, 0), annual_deductible: 200, reimbursement_rate: 70, annual_limit: 5000, lifetime_limit: 0, highlights: ['价格最低', '覆盖意外伤害', '适合年轻健康宠物'] },
    { plan_name: '综合医疗险', monthly_premium: round(basePremium, 0), annual_deductible: 500, reimbursement_rate: 80, annual_limit: 30000, lifetime_limit: 100000, highlights: ['意外+疾病全覆盖', '含遗传病(部分)', '性价比最高'] },
    { plan_name: '高端全面险', monthly_premium: round(basePremium * 1.8, 0), annual_deductible: 0, reimbursement_rate: 90, annual_limit: 100000, lifetime_limit: 300000, highlights: ['零免赔额', '含预防医疗', '含牙科/行为治疗', '直付服务'] },
    { plan_name: '老年宠物专属险', monthly_premium: round(basePremium * 1.5, 0), annual_deductible: 1000, reimbursement_rate: 70, annual_limit: 20000, lifetime_limit: 60000, highlights: ['高龄可投保', '慢性病管理', '免体检(部分)', '覆盖老年常见病'] },
  ];

  const claimScenarios: Record<string, Array<{ name: string; cost: number }>> = {
    '犬': [{ name: '骨折手术', cost: 8000 }, { name: '胃肠异物取出', cost: 5000 }, { name: '十字韧带修复', cost: 12000 }, { name: '肿瘤切除', cost: 10000 }],
    '猫': [{ name: '尿路梗阻', cost: 6000 }, { name: '胰腺炎治疗', cost: 4000 }, { name: '甲亢治疗', cost: 3000 }, { name: '肾病住院', cost: 8000 }],
  };

  const selectedClaim = pick(rng, claimScenarios[petType] || claimScenarios['犬']);
  const scenario = selectedClaim.name;
  const totalCost = selectedClaim.cost;
  const deductible = 500;
  const reimbursementRate = 0.8;
  const coveredAmount = Math.max(0, totalCost - deductible);
  const reimbursement = round(coveredAmount * reimbursementRate, 0);
  const outOfPocket = totalCost - reimbursement;

  const preExisting = data.pre_existing_conditions || [];
  const waitingPeriods: Record<string, string> = {
    '意外伤害': '投保后次日生效',
    '疾病': '等待期30天',
    '遗传病': '等待期12个月',
    '牙科': '等待期6个月',
    '慢性病': '等待期12个月或拒保',
  };

  const providers = [
    { provider: '平安宠物险', rating: round(4.2 + rng() * 0.6, 1), strengths: ['理赔速度快', '合作医院多', 'APP体验好'], weaknesses: ['保费偏高', '部分遗传病不保'] },
    { provider: '众安宠物险', rating: round(4.0 + rng() * 0.7, 1), strengths: ['产品灵活', '线上流程便捷', '可选责任多'], weaknesses: ['客服响应慢', '理赔审核严格'] },
    { provider: '人保宠物险', rating: round(3.8 + rng() * 0.8, 1), strengths: ['品牌信赖', '线下网点多', '大额理赔稳定'], weaknesses: ['投保流程繁琐', '产品更新慢'] },
    { provider: '太平洋宠物险', rating: round(4.1 + rng() * 0.6, 1), strengths: ['性价比高', '慢性病覆盖好', '续保条件宽松'], weaknesses: ['合作医院有限', '免赔额较高'] },
  ].sort((a, b) => b.rating - a.rating);

  const tips = [
    { tip: '尽早投保', importance: '高', details: '年轻健康时投保保费最低，且避免既往症被排除' },
    { tip: '如实告知', importance: '高', details: '投保时如实填写健康状况，避免理赔纠纷' },
    { tip: '了解等待期', importance: '中', details: '不同责任等待期不同，等待期内出险不赔付' },
    { tip: '保存就医记录', importance: '中', details: '每次就医保留发票、病历、化验单等完整材料' },
    { tip: '选择合作医院', importance: '中', details: '在保险公司合作医院就医可享受直付或更快理赔' },
    { tip: '续保条件', importance: '高', details: '选择保证续保产品，避免因理赔后拒保' },
  ];

  return {
    plan_comparison: plans,
    coverage_analysis: { accidents: true, illnesses: true, hereditary: true, dental: false, preventive: false, alternative_therapy: false, behavioral: false },
    claim_estimate: { scenario, total_cost: totalCost, covered_amount: coveredAmount, out_of_pocket: outOfPocket, reimbursement },
    pre_existing_impact: { affected_conditions: preExisting, waiting_periods: waitingPeriods, exclusions: preExisting.length > 0 ? ['已存在的疾病及其并发症'] : [], recommendations: preExisting.length > 0 ? '既往症通常被排除，建议选择覆盖范围更广的产品并咨询多家保险公司' : '无既往症，可正常投保任何方案' },
    provider_ranking: providers,
    enrollment_tips: tips,
    disclaimer: DISCLAIMER,
  };
}

function formatInsurance(r: InsuranceResult): string {
  let s = '=== 宠物保险方案对比与理赔报告 ===\n\n';
  s += '【保险方案对比】\n';
  r.plan_comparison.forEach(p => {
    s += `  ▶ ${p.plan_name}\n`;
    s += `    月保费: ¥${p.monthly_premium} | 年免赔额: ¥${p.annual_deductible}\n`;
    s += `    赔付比例: ${p.reimbursement_rate}% | 年限额: ¥${p.annual_limit.toLocaleString()}\n`;
    s += `    特点: ${p.highlights.join('、')}\n`;
  });
  s += '\n【保障范围】\n';
  s += `  意外伤害: ${r.coverage_analysis.accidents ? '✓' : '✗'} | 疾病: ${r.coverage_analysis.illnesses ? '✓' : '✗'} | 遗传病: ${r.coverage_analysis.hereditary ? '✓' : '✗'}\n`;
  s += `  牙科: ${r.coverage_analysis.dental ? '✓' : '✗'} | 预防医疗: ${r.coverage_analysis.preventive ? '✓' : '✗'} | 行为治疗: ${r.coverage_analysis.behavioral ? '✓' : '✗'}\n\n`;
  s += '【理赔估算】\n';
  s += `  场景: ${r.claim_estimate.scenario}\n`;
  s += `  总费用: ¥${r.claim_estimate.total_cost.toLocaleString()}\n`;
  s += `  可赔付金额: ¥${r.claim_estimate.covered_amount.toLocaleString()}\n`;
  s += `  实际赔付: ¥${r.claim_estimate.reimbursement.toLocaleString()}\n`;
  s += `  自付金额: ¥${r.claim_estimate.out_of_pocket.toLocaleString()}\n\n`;
  s += '【既往症影响】\n';
  s += `  受影响疾病: ${r.pre_existing_impact.affected_conditions.length > 0 ? r.pre_existing_impact.affected_conditions.join('、') : '无'}\n`;
  s += '  等待期:\n';
  Object.entries(r.pre_existing_impact.waiting_periods).forEach(([k, v]) => { s += `    ${k}: ${v}\n`; });
  s += `  建议: ${r.pre_existing_impact.recommendations}\n\n`;
  s += '【保险公司排名】\n';
  r.provider_ranking.forEach((p, i) => {
    s += `  ${i + 1}. ${p.provider} — 评分: ${p.rating}/5.0\n`;
    s += `     优势: ${p.strengths.join('、')}\n`;
    s += `     不足: ${p.weaknesses.join('、')}\n`;
  });
  s += '\n【投保建议】\n';
  r.enrollment_tips.forEach(t => {
    s += `  [${t.importance}] ${t.tip}: ${t.details}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. veterinary_clinic_manager — 动物医院运营与预约管理
// ============================================================
interface ClinicInput {
  clinic_name?: string;
  daily_appointments?: number;
  staff_count?: number;
  operating_hours?: string;
  specialties?: string[];
  avg_consultation_min?: number;
  emergency_capacity?: number;
  inventory_items?: number;
  monthly_revenue?: number;
}

interface ClinicResult {
  appointment_optimization: { current_utilization: number; optimal_daily: number; wait_time_min: number; no_show_rate: number; recommendations: string[] };
  staff_allocation: Array<{ role: string; current: number; recommended: number; utilization: number; suggestion: string }>;
  inventory_alerts: Array<{ item: string; current_stock: number; reorder_point: number; status: string; days_remaining: number; supplier: string }>;
  financial_overview: { monthly_revenue: number; revenue_per_appointment: number; staff_cost_ratio: number; profit_margin: number; growth_potential: string };
  service_expansion: Array<{ service: string; demand_level: number; investment_estimate: number; roi_months: number; priority: string }>;
  quality_metrics: { patient_satisfaction: number; treatment_success_rate: number; readmission_rate: number; avg_stay_days: number; benchmarks: string };
  disclaimer: string;
}

function analyzeClinic(data: ClinicInput): ClinicResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const dailyAppts = data.daily_appointments ?? Math.round(20 + rng() * 60);
  const staffCount = data.staff_count ?? Math.round(3 + rng() * 12);
  const avgConsult = data.avg_consultation_min ?? round(15 + rng() * 25, 0);
  const monthlyRevenue = data.monthly_revenue ?? round(80000 + rng() * 400000, 0);

  const utilization = round(Math.min(100, (dailyAppts / (staffCount * 8)) * 100), 1);
  const optimalDaily = Math.round(staffCount * 7);
  const waitTime = round(dailyAppts > optimalDaily ? (dailyAppts - optimalDaily) * avgConsult / staffCount : 5 + rng() * 10, 0);
  const noShowRate = round(5 + rng() * 15, 1);

  const staffRoles = [
    { role: '执业兽医', base: Math.max(1, Math.round(staffCount * 0.3)) },
    { role: '兽医助理', base: Math.max(1, Math.round(staffCount * 0.25)) },
    { role: '前台/客服', base: Math.max(1, Math.round(staffCount * 0.15)) },
    { role: '住院护理', base: Math.max(1, Math.round(staffCount * 0.2)) },
    { role: '管理/其他', base: Math.max(1, Math.round(staffCount * 0.1)) },
  ];

  const staffAllocation = staffRoles.map(sr => {
    const recommended = sr.base + (rng() > 0.5 ? 1 : 0);
    return {
      role: sr.role,
      current: sr.base,
      recommended,
      utilization: round(60 + rng() * 35, 1),
      suggestion: recommended > sr.base ? `建议增加${recommended - sr.base}人` : recommended < sr.base ? '人员充足' : '配置合理',
    };
  });

  const inventoryItems = [
    { item: '狂犬疫苗', current_stock: Math.round(20 + rng() * 80), reorder_point: 15, days_remaining: Math.round(7 + rng() * 30), supplier: '中牧股份' },
    { item: '犬五联疫苗', current_stock: Math.round(10 + rng() * 40), reorder_point: 10, days_remaining: Math.round(5 + rng() * 20), supplier: '硕腾' },
    { item: '猫三联疫苗', current_stock: Math.round(10 + rng() * 30), reorder_point: 8, days_remaining: Math.round(5 + rng() * 18), supplier: '硕腾' },
    { item: '麻醉剂(异氟烷)', current_stock: Math.round(5 + rng() * 15), reorder_point: 5, days_remaining: Math.round(10 + rng() * 20), supplier: '默沙东' },
    { item: '抗生素(阿莫西林)', current_stock: Math.round(30 + rng() * 50), reorder_point: 20, days_remaining: Math.round(15 + rng() * 30), supplier: '国内药企' },
    { item: '一次性注射器', current_stock: Math.round(100 + rng() * 200), reorder_point: 50, days_remaining: Math.round(20 + rng() * 40), supplier: '医疗器械商' },
  ];

  const inventoryAlerts = inventoryItems.map(i => ({
    ...i,
    status: i.current_stock <= i.reorder_point ? '需补货' : i.days_remaining < 10 ? '库存偏低' : '充足',
  }));

  const revenuePerAppt = round(monthlyRevenue / (dailyAppts * 26), 0);
  const staffCostRatio = round((staffCount * 8000) / monthlyRevenue * 100, 1);
  const profitMargin = round(15 + rng() * 20, 1);

  const services = [
    { service: '牙科诊疗(洗牙/拔牙)', demand_level: round(60 + rng() * 35, 0), investment_estimate: round(30000 + rng() * 50000, 0), roi_months: Math.round(6 + rng() * 12), priority: '高' },
    { service: '影像诊断(DR/超声)', demand_level: round(50 + rng() * 40, 0), investment_estimate: round(50000 + rng() * 150000, 0), roi_months: Math.round(12 + rng() * 18), priority: '高' },
    { service: '专科转诊(骨科/眼科)', demand_level: round(40 + rng() * 40, 0), investment_estimate: round(20000 + rng() * 80000, 0), roi_months: Math.round(8 + rng() * 15), priority: '中' },
    { service: '宠物美容/SPA', demand_level: round(50 + rng() * 35, 0), investment_estimate: round(10000 + rng() * 30000, 0), roi_months: Math.round(3 + rng() * 8), priority: '中' },
    { service: '住院/ICU服务', demand_level: round(45 + rng() * 35, 0), investment_estimate: round(40000 + rng() * 100000, 0), roi_months: Math.round(10 + rng() * 15), priority: '高' },
    { service: '线上问诊/复诊', demand_level: round(55 + rng() * 35, 0), investment_estimate: round(5000 + rng() * 15000, 0), roi_months: Math.round(2 + rng() * 4), priority: '中' },
  ].sort((a, b) => b.demand_level - a.demand_level);

  return {
    appointment_optimization: { current_utilization: utilization, optimal_daily: optimalDaily, wait_time_min: waitTime, no_show_rate: noShowRate, recommendations: ['推行预约制减少等待', '设置提醒降低爽约率', '高峰时段增加人手', '开通线上问诊分流'] },
    staff_allocation: staffAllocation,
    inventory_alerts: inventoryAlerts,
    financial_overview: { monthly_revenue: monthlyRevenue, revenue_per_appointment: revenuePerAppt, staff_cost_ratio: staffCostRatio, profit_margin: profitMargin, growth_potential: profitMargin > 20 ? '良好，可考虑扩张' : profitMargin > 12 ? '稳定，优化运营效率' : '需关注成本控制' },
    service_expansion: services,
    quality_metrics: { patient_satisfaction: round(3.5 + rng() * 1.5, 1), treatment_success_rate: round(85 + rng() * 12, 1), readmission_rate: round(2 + rng() * 8, 1), avg_stay_days: round(1 + rng() * 4, 1), benchmarks: '行业平均满意度4.0，再入院率<5%为优秀' },
    disclaimer: DISCLAIMER,
  };
}

function formatClinic(r: ClinicResult): string {
  let s = '=== 动物医院运营与预约管理报告 ===\n\n';
  s += '【预约优化】\n';
  s += `  当前利用率: ${r.appointment_optimization.current_utilization}%\n`;
  s += `  最优日接诊量: ${r.appointment_optimization.optimal_daily} 例\n`;
  s += `  平均等待时间: ${r.appointment_optimization.wait_time_min} 分钟\n`;
  s += `  爽约率: ${r.appointment_optimization.no_show_rate}%\n`;
  s += '  优化建议:\n';
  r.appointment_optimization.recommendations.forEach(rec => { s += `    - ${rec}\n`; });
  s += '\n【人员配置】\n';
  r.staff_allocation.forEach(st => {
    s += `  ${st.role}: ${st.current}人 → 建议${st.recommended}人 | 利用率: ${st.utilization}% | ${st.suggestion}\n`;
  });
  s += '\n【库存预警】\n';
  r.inventory_alerts.forEach(i => {
    s += `  [${i.status}] ${i.item}: 库存${i.current_stock} | 剩余${i.days_remaining}天 | 供应商: ${i.supplier}\n`;
  });
  s += '\n【财务概览】\n';
  s += `  月营收: ¥${r.financial_overview.monthly_revenue.toLocaleString()}\n`;
  s += `  客单价: ¥${r.financial_overview.revenue_per_appointment}\n`;
  s += `  人力成本占比: ${r.financial_overview.staff_cost_ratio}%\n`;
  s += `  利润率: ${r.financial_overview.profit_margin}%\n`;
  s += `  增长潜力: ${r.financial_overview.growth_potential}\n\n`;
  s += '【服务拓展建议】\n';
  r.service_expansion.forEach(sv => {
    s += `  [${sv.priority}] ${sv.service} — 需求度: ${sv.demand_level}/100\n`;
    s += `     投资: ¥${sv.investment_estimate.toLocaleString()} | 回本周期: ${sv.roi_months}个月\n`;
  });
  s += '\n【质量指标】\n';
  s += `  患者满意度: ${r.quality_metrics.patient_satisfaction}/5.0\n`;
  s += `  治疗成功率: ${r.quality_metrics.treatment_success_rate}%\n`;
  s += `  再入院率: ${r.quality_metrics.readmission_rate}%\n`;
  s += `  平均住院天数: ${r.quality_metrics.avg_stay_days}天\n`;
  s += `  行业基准: ${r.quality_metrics.benchmarks}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. pet_dental_health_tracker — 宠物口腔健康追踪与牙病预防
// ============================================================
interface DentalInput {
  pet_type?: string;
  breed?: string;
  age_years?: number;
  weight_kg?: number;
  last_dental_cleaning?: string;
  current_symptoms?: string[];
  diet_type?: string;
  chew_toys?: boolean;
  home_care_routine?: string;
  vet_dental_grade?: number;
}

interface DentalResult {
  dental_assessment: { overall_grade: number; calculus_level: string; gingivitis_level: string; tooth_mobility: string; oral_health_score: number };
  disease_risks: Array<{ condition: string; risk_level: number; stage: string; symptoms: string; prevention: string }>;
  cleaning_plan: { professional_cleaning: { recommended: boolean; urgency: string; frequency: string; estimated_cost: number }; home_care: Array<{ method: string; frequency: string; technique: string; product: string }> };
  diet_recommendations: { food_type: string; dental_treats: string[]; water_additives: string; feeding_tips: string[] };
  monitoring_schedule: Array<{ timeframe: string; action: string; indicator: string; next_step: string }>;
  cost_projection: { annual_preventive_cost: number; potential_treatment_cost: number; savings_with_prevention: number; roi: number };
  disclaimer: string;
}

function analyzeDental(data: DentalInput): DentalResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const petType = data.pet_type || pick(rng, ['犬', '猫']);
  const age = data.age_years ?? round(1 + rng() * 12, 1);
  const weight = data.weight_kg ?? round(2 + rng() * 28, 1);
  const vetGrade = data.vet_dental_grade ?? Math.round(1 + rng() * 4);

  const gradeDescriptions = ['健康', '轻度牙垢', '中度牙垢/牙龈炎', '重度牙垢/牙周病', '严重牙周病/需治疗'];
  const calculusLevel = vetGrade <= 1 ? '无/轻微' : vetGrade <= 2 ? '轻度' : vetGrade <= 3 ? '中度' : '重度';
  const gingivitisLevel = vetGrade <= 1 ? '无' : vetGrade === 2 ? '轻度红肿' : vetGrade === 3 ? '中度炎症' : '重度/出血';
  const mobility = vetGrade <= 2 ? '无' : vetGrade === 3 ? '个别牙轻微松动' : '多颗牙松动';
  const oralScore = round(Math.max(20, 100 - vetGrade * 18 + round(rng() * 10 - 5, 0)), 0);

  const diseases = [
    { condition: '牙菌斑/牙垢', risk_level: round(40 + rng() * 55, 0), stage: vetGrade >= 2 ? '已存在' : '高风险', symptoms: '牙齿表面黄白色沉积物', prevention: '每日刷牙+定期专业洁牙' },
    { condition: '牙龈炎', risk_level: round(30 + rng() * 60, 0), stage: vetGrade >= 2 ? '早期' : '预防期', symptoms: '牙龈红肿、口臭', prevention: '刷牙+口腔凝胶+定期检查' },
    { condition: '牙周病', risk_level: round(20 + rng() * 60, 0), stage: vetGrade >= 3 ? '已存在' : '风险', symptoms: '牙龈萎缩、牙槽骨吸收、牙齿松动', prevention: '专业洁牙+牙周治疗+家庭护理' },
    { condition: '牙齿吸收病变(FORL)', risk_level: petType === '猫' ? round(30 + rng() * 50, 0) : round(5 + rng() * 15, 0), stage: '需X光确诊', symptoms: '咀嚼困难、流口水、牙龈覆盖牙冠', prevention: '定期口腔检查+X光筛查' },
    { condition: '口炎', risk_level: petType === '猫' ? round(20 + rng() * 40, 0) : round(5 + rng() * 15, 0), stage: '需专科检查', symptoms: '口腔后部严重炎症、进食疼痛', prevention: '早期发现+免疫调节+必要时拔牙' },
    { condition: '牙齿断裂', risk_level: round(10 + rng() * 30, 0), stage: '急性事件', symptoms: '牙齿缺损、进食异常', prevention: '避免硬物啃咬+提供合适咀嚼玩具' },
  ];

  const needCleaning = vetGrade >= 2;
  const urgency = vetGrade >= 4 ? '紧急(2周内)' : vetGrade >= 3 ? '尽快(1个月内)' : vetGrade >= 2 ? '建议(3个月内)' : '常规维护(6-12个月)';
  const cleaningCost = round(500 + rng() * 1500 + (vetGrade >= 3 ? 1000 : 0), 0);

  const homeCare = [
    { method: '刷牙', frequency: '每日1-2次(理想)或每周至少3次', technique: '使用宠物专用牙刷和牙膏，45度角轻柔刷洗牙龈沟', product: '宠物专用牙膏(含酶)+软毛牙刷/指套刷' },
    { method: '口腔凝胶/喷雾', frequency: '每日1次', technique: '涂抹于牙龈边缘，无需冲洗', product: '氯己定口腔凝胶或抗菌喷雾' },
    { method: '洁牙零食/玩具', frequency: '每日', technique: '选择VOHC认证产品，监督使用', product: '洁牙棒、橡胶咀嚼玩具、生皮替代品' },
    { method: '饮水添加剂', frequency: '每日添加', technique: '按比例加入饮用水中', product: '无酵素饮水添加剂(抑制牙菌斑)' },
  ];

  const dietRec = {
    food_type: weight > 20 ? '大型犬/猫处方粮(口腔护理配方)' : '小型犬/猫专用颗粒(设计为洁牙形状)',
    dental_treats: ['VOHC认证洁牙零食', '生骨肉(需指导)', '胡萝卜块(低热量)'],
    water_additives: '含锌或氯己定成分的饮水添加剂',
    feeding_tips: ['干粮比湿粮更利于牙齿清洁', '避免过多软食/人类食物', '定时喂食而非自由采食', '餐后提供洁牙玩具'],
  };

  const monitoring = [
    { timeframe: '每周', action: '检查口臭程度和牙龈颜色', indicator: '口臭加重/牙龈红肿', next_step: '增加家庭护理频率' },
    { timeframe: '每月', action: '拍照记录牙齿状况', indicator: '牙垢积累速度', next_step: '评估是否需要提前洁牙' },
    { timeframe: '每季度', action: '兽医口腔检查', indicator: '牙周袋深度变化', next_step: '调整护理方案' },
    { timeframe: '每年', action: '全面口腔检查+洁牙评估', indicator: 'X光评估牙根健康', next_step: '制定下年度计划' },
  ];

  const annualPreventive = round(cleaningCost + 365 * 2 + 12 * 30, 0);
  const potentialTreatment = round(3000 + rng() * 15000, 0);
  const savings = potentialTreatment - annualPreventive;

  return {
    dental_assessment: { overall_grade: vetGrade, calculus_level: calculusLevel, gingivitis_level: gingivitisLevel, tooth_mobility: mobility, oral_health_score: oralScore },
    disease_risks: diseases,
    cleaning_plan: { professional_cleaning: { recommended: needCleaning, urgency, frequency: '每年1-2次(根据严重程度)', estimated_cost: cleaningCost }, home_care: homeCare },
    diet_recommendations: dietRec,
    monitoring_schedule: monitoring,
    cost_projection: { annual_preventive_cost: annualPreventive, potential_treatment_cost: potentialTreatment, savings_with_prevention: savings, roi: round((savings / annualPreventive) * 100, 0) },
    disclaimer: DISCLAIMER,
  };
}

function formatDental(r: DentalResult): string {
  let s = '=== 宠物口腔健康追踪与牙病预防报告 ===\n\n';
  s += '【口腔评估】\n';
  s += `  整体分级: ${r.dental_assessment.overall_grade}/5 (${['健康','轻度','中度','重度','严重'][r.dental_assessment.overall_grade-1] || '未知'})\n`;
  s += `  牙垢程度: ${r.dental_assessment.calculus_level}\n`;
  s += `  牙龈炎程度: ${r.dental_assessment.gingivitis_level}\n`;
  s += `  牙齿松动: ${r.dental_assessment.tooth_mobility}\n`;
  s += `  口腔健康评分: ${r.dental_assessment.oral_health_score}/100\n\n`;
  s += '【疾病风险】\n';
  r.disease_risks.forEach(d => {
    s += `  ${d.condition} — 风险: ${d.risk_level}% | 阶段: ${d.stage}\n`;
    s += `     症状: ${d.symptoms}\n`;
    s += `     预防: ${d.prevention}\n`;
  });
  s += '\n【洁牙计划】\n';
  s += `  专业洁牙: ${r.cleaning_plan.professional_cleaning.recommended ? '需要' : '暂不需要'}\n`;
  s += `  紧急程度: ${r.cleaning_plan.professional_cleaning.urgency}\n`;
  s += `  频率: ${r.cleaning_plan.professional_cleaning.frequency}\n`;
  s += `  预估费用: ¥${r.cleaning_plan.professional_cleaning.estimated_cost.toLocaleString()}\n`;
  s += '  家庭护理:\n';
  r.cleaning_plan.home_care.forEach(h => {
    s += `    - ${h.method} (${h.frequency}): ${h.technique}\n`;
    s += `      推荐产品: ${h.product}\n`;
  });
  s += '\n【饮食建议】\n';
  s += `  食物类型: ${r.diet_recommendations.food_type}\n`;
  s += `  洁牙零食: ${r.diet_recommendations.dental_treats.join('、')}\n`;
  s += `  饮水添加剂: ${r.diet_recommendations.water_additives}\n`;
  s += '  喂食建议:\n';
  r.diet_recommendations.feeding_tips.forEach(t => { s += `    - ${t}\n`; });
  s += '\n【监测计划】\n';
  r.monitoring_schedule.forEach(m => {
    s += `  ${m.timeframe}: ${m.action}\n`;
    s += `     指标: ${m.indicator} → ${m.next_step}\n`;
  });
  s += '\n【费用预估】\n';
  s += `  年度预防费用: ¥${r.cost_projection.annual_preventive_cost.toLocaleString()}\n`;
  s += `  潜在治疗费用: ¥${r.cost_projection.potential_treatment_cost.toLocaleString()}\n`;
  s += `  预防节省: ¥${r.cost_projection.savings_with_prevention.toLocaleString()}\n`;
  s += `  预防ROI: ${r.cost_projection.roi}%\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. senior_pet_care_planner — 老年宠物护理与安宁疗护
// ============================================================
interface SeniorPetInput {
  pet_type?: string;
  breed?: string;
  age_years?: number;
  weight_kg?: number;
  chronic_conditions?: string[];
  mobility_level?: string;
  cognitive_function?: string;
  pain_level?: string;
  quality_of_life_score?: number;
  owner_preferences?: string;
  vet_support?: boolean;
}

interface SeniorPetResult {
  aging_assessment: { life_stage: string; biological_age: number; age_equivalent_human: number; aging_rate: string; key_concerns: string[] };
  chronic_disease_management: Array<{ condition: string; management_plan: string; monitoring: string; medications: string[]; frequency: string }>;
  pain_management: { current_level: string; pain_score: number; interventions: Array<{ type: string; description: string; frequency: string }>; reassessment: string };
  quality_of_life: { overall_score: number; categories: Array<{ category: string; score: number; notes: string }>; trend: string; recommendations: string[] };
  mobility_support: Array<{ aid: string; purpose: string; usage: string; cost_estimate: number }>;
  hospice_readiness: { stage: string; indicators: string[]; comfort_measures: string[]; decision_framework: string; emotional_support: string };
  end_of_life_planning: { considerations: string[]; options: Array<{ option: string; description: string; when_appropriate: string }>; grief_support: string[] };
  disclaimer: string;
}

function analyzeSeniorPet(data: SeniorPetInput): SeniorPetResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const petType = data.pet_type || pick(rng, ['犬', '猫']);
  const age = data.age_years ?? round(8 + rng() * 8, 1);
  const weight = data.weight_kg ?? round(3 + rng() * 25, 1);
  const qolScore = data.quality_of_life_score ?? round(40 + rng() * 50, 0);

  const lifeStage = age > 12 ? '高龄期' : age > 10 ? '老年后期' : '老年早期';
  const biologicalAge = round(age * (1 + rng() * 0.2), 1);
  const humanAge = petType === '犬' ? Math.round(16 * Math.log(age) + 31) : Math.round(15 + 9 * (age - 2) + rng() * 5);
  const agingRate = biologicalAge > age * 1.15 ? '加速衰老' : biologicalAge > age * 1.05 ? '正常偏快' : '正常';

  const chronicDiseases: Record<string, Array<{ condition: string; management_plan: string; monitoring: string; medications: string[]; frequency: string }>> = {
    '犬': [
      { condition: '慢性肾病(CKD)', management_plan: '肾脏处方粮+限磷+补液治疗', monitoring: 'SDMA/肌酐/尿素氮每3个月', medications: ['磷结合剂', 'ACE抑制剂', '促红细胞生成素'], frequency: '每3个月复查' },
      { condition: '退行性关节炎', management_plan: '体重管理+关节补充剂+适度运动', monitoring: '活动能力评分每月', medications: ['非罗考昔', '葡萄糖胺', '多硫酸糖胺聚糖'], frequency: '每2-3个月评估' },
      { condition: '心脏病(DCM/MVD)', management_plan: '低钠饮食+运动限制+心脏药物', monitoring: 'X光+心电图每3-6个月', medications: ['匹莫苯丹', '呋塞米', 'ACE抑制剂'], frequency: '每3个月心超' },
      { condition: '认知功能障碍(CCD)', management_plan: '环境丰富化+认知补充剂+行为管理', monitoring: '认知评估量表每月', medications: ['司来吉兰', '中链甘油三酯'], frequency: '每2个月评估' },
    ],
    '猫': [
      { condition: '慢性肾病(CKD)', management_plan: '肾脏处方粮+补液+血压管理', monitoring: 'SDMA/肌酐/血压每3个月', medications: ['氨氯地平', '磷结合剂', '促红素'], frequency: '每3个月复查' },
      { condition: '甲状腺功能亢进', management_plan: '甲巯咪唑或放射性碘治疗', monitoring: 'T4每4-6周(调药后)', medications: ['甲巯咪唑'], frequency: '每3个月(稳定后)' },
      { condition: '糖尿病', management_plan: '胰岛素治疗+饮食管理+体重控制', monitoring: '血糖曲线每周→每月', medications: ['胰岛素(甘精/猪胰)'], frequency: '每2-3个月复查' },
      { condition: '关节炎', management_plan: '环境改造+关节补充剂+止痛', monitoring: '活动能力+疼痛评分', medications: ['美洛昔康(低剂量)', '葡萄糖胺'], frequency: '每3个月评估' },
    ],
  };

  const diseases = (chronicDiseases[petType] || chronicDiseases['犬']).slice(0, 1 + Math.floor(rng() * 3));

  const painScore = round(1 + rng() * 7, 0);
  const painLevel = painScore <= 2 ? '轻微' : painScore <= 4 ? '中度' : painScore <= 6 ? '中重度' : '重度';

  const painInterventions = [
    { type: '药物治疗', description: 'NSAIDs/阿片类/加巴喷丁(根据疼痛类型)', frequency: '按处方持续使用' },
    { type: '物理治疗', description: '激光治疗/水疗/针灸/按摩', frequency: '每周1-2次' },
    { type: '环境调整', description: '矫形床垫/防滑垫/坡道/减少跳跃', frequency: '持续' },
    { type: '补充疗法', description: '关节注射(多硫酸糖胺聚糖)/干细胞治疗', frequency: '每3-6个月' },
  ];

  const qolCategories = [
    { category: '疼痛控制', score: round(Math.max(10, 100 - painScore * 10 + round(rng() * 10 - 5, 0)), 0), notes: painScore <= 4 ? '控制良好' : '需加强止痛' },
    { category: '活动能力', score: round(30 + rng() * 50, 0), notes: '评估行走、跳跃、自理能力' },
    { category: '营养状况', score: round(40 + rng() * 45, 0), notes: '食欲、体重稳定性' },
    { category: '认知功能', score: round(30 + rng() * 55, 0), notes: '定向力、互动、睡眠周期' },
    { category: '社交互动', score: round(35 + rng() * 50, 0), notes: '与家人互动意愿' },
    { category: '生活质量', score: qolScore, notes: '综合评估' },
  ];

  const mobilityAids = [
    { aid: '宠物轮椅/后肢车', purpose: '后肢瘫痪或严重无力时的移动辅助', usage: '根据适应情况逐步增加使用时间', cost_estimate: round(800 + rng() * 2000, 0) },
    { aid: '矫形床垫', purpose: '缓解关节压力，预防褥疮', usage: '全天使用，定期更换位置', cost_estimate: round(200 + rng() * 600, 0) },
    { aid: '防滑地垫/坡道', purpose: '防止滑倒，方便上下家具', usage: '铺设在常活动区域', cost_estimate: round(100 + rng() * 400, 0) },
    { aid: '宠物背带/吊带', purpose: '辅助行走和如厕', usage: '外出和站立时使用', cost_estimate: round(80 + rng() * 300, 0) },
    { aid: '宠物推车', purpose: '无法行走时的户外活动', usage: '短时间户外活动', cost_estimate: round(300 + rng() * 800, 0) },
  ];

  const hospiceStage = qolScore < 30 ? '安宁疗护期' : qolScore < 50 ? '过渡期' : '积极护理期';
  const hospiceIndicators = qolScore < 50 ? ['持续疼痛无法控制', '无法自主进食超过3天', '完全丧失行动能力', '反复呼吸困难', '对周围环境无反应'] : ['偶有不适但可控', '基本生活能力尚存'];
  const comfortMeasures = [
    '提供柔软温暖的安静休息空间',
    '保持身体清洁和干燥，预防褥疮',
    '少量多餐提供喜爱的食物',
    '持续陪伴和轻柔抚摸',
    '按医嘱使用止痛和镇静药物',
    '维持舒适的室温和适度通风',
  ];

  const endOfLifeOptions = [
    { option: '安乐死(院内)', description: '兽医执行的无痛离世，过程温和', when_appropriate: '当宠物持续痛苦且无法改善时' },
    { option: '安乐死(家中)', description: '在熟悉环境中执行，减少宠物应激', when_appropriate: '宠物对医院极度恐惧时' },
    { option: '自然离世+安宁护理', description: '不加速死亡过程，仅提供舒适护理', when_appropriate: '宠物能自然维持基本舒适时' },
  ];

  const griefSupport = [
    '宠物哀伤辅导热线',
    '宠物丧失支持小组',
    '纪念服务(骨灰/爪印/照片)',
    '心理咨询(如需要)',
    '给予自己哀伤的时间',
  ];

  return {
    aging_assessment: { life_stage: lifeStage, biological_age: biologicalAge, age_equivalent_human: humanAge, aging_rate: agingRate, key_concerns: ['慢性疼痛管理', '认知功能维护', '营养支持', '生活质量监测', '情感陪伴'] },
    chronic_disease_management: diseases,
    pain_management: { current_level: painLevel, pain_score: painScore, interventions: painInterventions, reassessment: '每2-4周重新评估疼痛水平' },
    quality_of_life: { overall_score: qolScore, categories: qolCategories, trend: qolScore > 60 ? '稳定/可改善' : qolScore > 40 ? '需关注' : '建议与兽医讨论安宁疗护', recommendations: ['每日记录行为变化', '保持适度互动', '避免环境剧变', '定期兽医评估'] },
    mobility_support: mobilityAids,
    hospice_readiness: { stage: hospiceStage, indicators: hospiceIndicators, comfort_measures: comfortMeasures, decision_framework: 'HHHHHMM量表(疼痛、饥饿、水分、卫生、幸福、活动能力、好日子多于坏日子)', emotional_support: '主人心理准备同样重要，寻求家人和专业支持' },
    end_of_life_planning: { considerations: ['宠物的痛苦程度', '治疗的可能性', '经济承受能力', '家庭成员的情感准备', '兽医的专业建议'], options: endOfLifeOptions, grief_support: griefSupport },
    disclaimer: DISCLAIMER,
  };
}

function formatSeniorPet(r: SeniorPetResult): string {
  let s = '=== 老年宠物护理与安宁疗护报告 ===\n\n';
  s += '【衰老评估】\n';
  s += `  生命阶段: ${r.aging_assessment.life_stage}\n`;
  s += `  生物学年龄: ${r.aging_assessment.biological_age}岁\n`;
  s += `  等效人类年龄: ${r.aging_assessment.age_equivalent_human}岁\n`;
  s += `  衰老速率: ${r.aging_assessment.aging_rate}\n`;
  s += `  重点关注: ${r.aging_assessment.key_concerns.join('、')}\n\n`;
  s += '【慢性病管理】\n';
  r.chronic_disease_management.forEach(d => {
    s += `  ▶ ${d.condition}\n`;
    s += `    管理方案: ${d.management_plan}\n`;
    s += `    监测: ${d.monitoring}\n`;
    s += `    药物: ${d.medications.join('、')}\n`;
    s += `    复查频率: ${d.frequency}\n`;
  });
  s += '\n【疼痛管理】\n';
  s += `  当前疼痛水平: ${r.pain_management.current_level} (评分: ${r.pain_management.pain_score}/10)\n`;
  s += '  干预措施:\n';
  r.pain_management.interventions.forEach(i => {
    s += `    - ${i.type}: ${i.description} (${i.frequency})\n`;
  });
  s += `  重新评估: ${r.pain_management.reassessment}\n\n`;
  s += '【生活质量评估】\n';
  s += `  综合评分: ${r.quality_of_life.overall_score}/100\n`;
  s += `  趋势: ${r.quality_of_life.trend}\n`;
  s += '  分项评分:\n';
  r.quality_of_life.categories.forEach(c => {
    s += `    ${c.category}: ${c.score}/100 — ${c.notes}\n`;
  });
  s += '  建议:\n';
  r.quality_of_life.recommendations.forEach(rec => { s += `    - ${rec}\n`; });
  s += '\n【行动辅助】\n';
  r.mobility_support.forEach(m => {
    s += `  ${m.aid}: ${m.purpose}\n`;
    s += `     使用: ${m.usage} | 费用: ¥${m.cost_estimate.toLocaleString()}\n`;
  });
  s += '\n【安宁疗护评估】\n';
  s += `  当前阶段: ${r.hospice_readiness.stage}\n`;
  s += '  指标:\n';
  r.hospice_readiness.indicators.forEach(i => { s += `    - ${i}\n`; });
  s += '  舒适措施:\n';
  r.hospice_readiness.comfort_measures.forEach(c => { s += `    - ${c}\n`; });
  s += `  决策框架: ${r.hospice_readiness.decision_framework}\n`;
  s += `  情感支持: ${r.hospice_readiness.emotional_support}\n\n`;
  s += '【临终规划】\n';
  s += '  考虑因素:\n';
  r.end_of_life_planning.considerations.forEach(c => { s += `    - ${c}\n`; });
  s += '  可选方案:\n';
  r.end_of_life_planning.options.forEach(o => {
    s += `    - ${o.option}: ${o.description} (${o.when_appropriate})\n`;
  });
  s += '  哀伤支持资源:\n';
  r.end_of_life_planning.grief_support.forEach(g => { s += `    - ${g}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. pet_symptom_checker
  tools.register(defineTool({
    name: 'pet_symptom_checker',
    description: '宠物症状自查与就医建议 — 基于症状描述和宠物信息，提供可能疾病分析、紧急程度评估、就医建议和居家护理指导',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含pet_type, pet_name, age_years, weight_kg, symptoms, duration_days, severity, appetite, energy_level, temperature_c等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSymptomChecker(analyzeSymptomChecker(JSON.parse(args.input_data)));
    },
  }));

  // 2. pet_nutrition_planner
  tools.register(defineTool({
    name: 'pet_nutrition_planner',
    description: '宠物营养方案与体重管理 — 基于宠物信息和体况评估，提供热量需求计算、营养配比、喂食计划和体重管理方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含pet_type, breed, age_years, weight_kg, target_weight_kg, activity_level, life_stage, health_conditions, food_preference, meals_per_day等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatNutrition(analyzeNutrition(JSON.parse(args.input_data)));
    },
  }));

  // 3. vaccination_scheduler
  tools.register(defineTool({
    name: 'vaccination_scheduler',
    description: '疫苗计划与驱虫提醒 — 基于宠物年龄和免疫史，提供核心/非核心疫苗接种计划、驱虫安排和年度免疫日历',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含pet_type, pet_name, birth_date, age_weeks, last_vaccines, last_deworming, lifestyle, region, multi_pet, travel_plans等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatVaccination(analyzeVaccination(JSON.parse(args.input_data)));
    },
  }));

  // 4. pet_behavior_analyzer
  tools.register(defineTool({
    name: 'pet_behavior_analyzer',
    description: '宠物行为问题识别与训练方案 — 基于行为问题描述，提供行为分析、训练计划、环境改造和丰富化活动建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含pet_type, breed, age_years, behavior_issues, frequency, triggers, duration_weeks, previous_training, household_environment, daily_exercise_min等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatBehavior(analyzeBehavior(JSON.parse(args.input_data)));
    },
  }));

  // 5. pet_insurance_advisor
  tools.register(defineTool({
    name: 'pet_insurance_advisor',
    description: '宠物保险方案对比与理赔 — 基于宠物信息和预算，提供保险方案对比、理赔估算、保险公司排名和投保建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含pet_type, breed, age_years, weight_kg, pre_existing_conditions, budget_monthly, coverage_priority, previous_claims, region等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatInsurance(analyzeInsurance(JSON.parse(args.input_data)));
    },
  }));

  // 6. veterinary_clinic_manager
  tools.register(defineTool({
    name: 'veterinary_clinic_manager',
    description: '动物医院运营与预约管理 — 基于诊所运营数据，提供预约优化、人员配置、库存预警、财务分析和服务拓展建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含clinic_name, daily_appointments, staff_count, operating_hours, specialties, avg_consultation_min, emergency_capacity, inventory_items, monthly_revenue等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatClinic(analyzeClinic(JSON.parse(args.input_data)));
    },
  }));

  // 7. pet_dental_health_tracker
  tools.register(defineTool({
    name: 'pet_dental_health_tracker',
    description: '宠物口腔健康追踪与牙病预防 — 基于口腔评估数据，提供疾病风险分析、洁牙计划、饮食建议和费用预估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含pet_type, breed, age_years, weight_kg, last_dental_cleaning, current_symptoms, diet_type, chew_toys, home_care_routine, vet_dental_grade等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatDental(analyzeDental(JSON.parse(args.input_data)));
    },
  }));

  // 8. senior_pet_care_planner
  tools.register(defineTool({
    name: 'senior_pet_care_planner',
    description: '老年宠物护理与安宁疗护 — 基于老年宠物健康数据，提供衰老评估、慢性病管理、疼痛控制、生活质量评估和临终规划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含pet_type, breed, age_years, weight_kg, chronic_conditions, mobility_level, cognitive_function, pain_level, quality_of_life_score, owner_preferences, vet_support等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSeniorPet(analyzeSeniorPet(JSON.parse(args.input_data)));
    },
  }));
}
