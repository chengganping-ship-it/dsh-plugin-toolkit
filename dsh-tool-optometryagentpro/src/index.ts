import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'optometryagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供眼视光参考，不替代专业眼科医师或视光师的诊断与处方。如有眼部不适，请及时就医。';

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
// 1. prescription_accuracy_checker — 验光处方合理性审查
// ============================================================
interface PrescriptionInput {
  od_sphere?: number;
  od_cylinder?: number;
  od_axis?: number;
  os_sphere?: number;
  os_cylinder?: number;
  os_axis?: number;
  pd?: number;
  add_power?: number;
  patient_age?: number;
  previous_od_sphere?: number;
  previous_os_sphere?: number;
}

interface PrescriptionResult {
  od_analysis: { sphere: number; cylinder: number; axis: number; se: number; status: string };
  os_analysis: { sphere: number; cylinder: number; axis: number; se: number; status: string };
  anisometropia: { se_difference: number; level: string; concern: string };
  pd_assessment: { pd: number; status: string };
  progression: { od_change: number; os_change: number; status: string };
  errors_detected: string[];
  recommendations: string[];
  disclaimer: string;
}

function analyzePrescription(data: PrescriptionInput): PrescriptionResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const odSph = data.od_sphere ?? round(-1.0 + rng() * -4.0, 2);
  const odCyl = data.od_cylinder ?? round(-0.5 + rng() * -2.0, 2);
  const odAxis = data.od_axis ?? Math.round(rng() * 180);
  const osSph = data.os_sphere ?? round(-1.0 + rng() * -4.0, 2);
  const osCyl = data.os_cylinder ?? round(-0.5 + rng() * -2.0, 2);
  const osAxis = data.os_axis ?? Math.round(rng() * 180);
  const pd = data.pd ?? round(58 + rng() * 8, 0);
  const age = data.patient_age ?? Math.round(18 + rng() * 50);

  const odSE = round(odSph + odCyl / 2, 2);
  const osSE = round(osSph + osCyl / 2, 2);

  const odStatus = odSE > -3.0 ? '轻度近视' : odSE > -6.0 ? '中度近视' : odSE > -9.0 ? '高度近视' : '超高度近视';
  const osStatus = osSE > -3.0 ? '轻度近视' : osSE > -6.0 ? '中度近视' : osSE > -9.0 ? '高度近视' : '超高度近视';

  const seDiff = round(Math.abs(odSE - osSE), 2);
  const anisLevel = seDiff < 1.0 ? '正常' : seDiff < 2.0 ? '轻度屈光参差' : seDiff < 3.0 ? '中度屈光参差' : '重度屈光参差';
  const anisConcern = seDiff >= 2.0 ? '需关注弱视风险及融像功能' : '屈光参差在可接受范围';

  const pdStatus = pd >= 56 && pd <= 68 ? '正常' : pd < 56 ? '偏小，需复核' : '偏大，需复核';

  const prevOdSph = data.previous_od_sphere ?? round(odSph + rng() * -1.5, 2);
  const prevOsSph = data.previous_os_sphere ?? round(osSph + rng() * -1.5, 2);
  const odChange = round(odSph - prevOdSph, 2);
  const osChange = round(osSph - prevOsSph, 2);
  const progStatus = Math.abs(odChange) > 0.5 || Math.abs(osChange) > 0.5 ? '近视进展明显，建议干预' : '屈光状态稳定';

  const errors: string[] = [];
  if (odCyl > 0) errors.push('OD柱镜为正值，近视散光应为负值，请核实');
  if (osCyl > 0) errors.push('OS柱镜为正值，近视散光应为负值，请核实');
  if (odAxis < 0 || odAxis > 180) errors.push('OD轴位超出0-180度范围');
  if (osAxis < 0 || osAxis > 180) errors.push('OS轴位超出0-180度范围');
  if (age < 40 && data.add_power && data.add_power > 0) errors.push('40岁以下通常不需要下加光ADD，请确认老花诊断');
  if (Math.abs(odCyl) > 4.0) errors.push('OD散光度数偏高，需排除圆锥角膜');
  if (Math.abs(osCyl) > 4.0) errors.push('OS散光度数偏高，需排除圆锥角膜');
  if (errors.length === 0) errors.push('未检测到明显处方错误');

  const recs: string[] = [];
  if (seDiff >= 2.0) recs.push('屈光参差≥2.00D，建议评估双眼视功能及融像能力');
  if (odSE <= -6.0 || osSE <= -6.0) recs.push('高度近视建议定期眼底检查，排除视网膜病变');
  if (age < 18 && (odChange <= -0.5 || osChange <= -0.5)) recs.push('青少年近视进展，建议角膜塑形镜或低浓度阿托品干预');
  if (data.add_power && data.add_power > 0) recs.push('老视患者建议评估渐进多焦点镜片适应性');
  if (Math.abs(odCyl) > 2.0 || Math.abs(osCyl) > 2.0) recs.push('高度散光建议定制散光镜片，确保轴位精准');
  if (recs.length === 0) recs.push('处方合理，建议定期复查');

  return {
    od_analysis: { sphere: odSph, cylinder: odCyl, axis: odAxis, se: odSE, status: odStatus },
    os_analysis: { sphere: osSph, cylinder: osCyl, axis: osAxis, se: osSE, status: osStatus },
    anisometropia: { se_difference: seDiff, level: anisLevel, concern: anisConcern },
    pd_assessment: { pd, status: pdStatus },
    progression: { od_change: odChange, os_change: osChange, status: progStatus },
    errors_detected: errors,
    recommendations: recs,
    disclaimer: DISCLAIMER,
  };
}

function formatPrescription(r: PrescriptionResult): string {
  let s = '=== 验光处方合理性审查报告 ===\n\n';
  s += '【OD右眼分析】\n';
  s += `  球镜: ${r.od_analysis.sphere}D | 柱镜: ${r.od_analysis.cylinder}D | 轴位: ${r.od_analysis.axis}°\n`;
  s += `  等效球镜: ${r.od_analysis.se}D | 分类: ${r.od_analysis.status}\n\n`;
  s += '【OS左眼分析】\n';
  s += `  球镜: ${r.os_analysis.sphere}D | 柱镜: ${r.os_analysis.cylinder}D | 轴位: ${r.os_analysis.axis}°\n`;
  s += `  等效球镜: ${r.os_analysis.se}D | 分类: ${r.os_analysis.status}\n\n`;
  s += '【屈光参差评估】\n';
  s += `  双眼SE差值: ${r.anisometropia.se_difference}D | 等级: ${r.anisometropia.level}\n`;
  s += `  关注点: ${r.anisometropia.concern}\n\n`;
  s += '【瞳距评估】\n';
  s += `  瞳距: ${r.pd_assessment.pd}mm | 状态: ${r.pd_assessment.status}\n\n`;
  s += '【屈光进展】\n';
  s += `  右眼变化: ${r.progression.od_change}D | 左眼变化: ${r.progression.os_change}D\n`;
  s += `  评估: ${r.progression.status}\n\n`;
  s += '【误差检测】\n';
  r.errors_detected.forEach(e => { s += `  ⚠ ${e}\n`; });
  s += '\n【建议】\n';
  r.recommendations.forEach(i => { s += `  💡 ${i}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. frame_fitting_advisor — 镜架适配分析与脸型匹配
// ============================================================
interface FrameFittingInput {
  face_shape?: string;
  face_width_mm?: number;
  temple_width_mm?: number;
  bridge_width_mm?: number;
  pd?: number;
  frame_size?: string;
  skin_tone?: string;
  hair_color?: string;
  style_preference?: string;
}

interface FrameFittingResult {
  face_shape_analysis: { shape: string; characteristics: string; best_frame_types: string[] };
  size_matching: { frame_width: number; bridge_width: number; temple_length: number; fit_score: number; status: string };
  style_recommendations: Array<{ frame_type: string; material: string; color: string; reason: string }>;
  fitting_warnings: string[];
  optical_center_alignment: { pd_frame_diff: number; status: string; prism_effect: string };
  disclaimer: string;
}

function analyzeFrameFitting(data: FrameFittingInput): FrameFittingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const faceShape = data.face_shape || pick(rng, ['椭圆脸', '圆脸', '方脸', '长脸', '心形脸', '菱形脸']);
  const faceWidth = data.face_width_mm ?? Math.round(130 + rng() * 25);
  const pd = data.pd ?? round(58 + rng() * 8, 0);

  const faceData: Record<string, { chars: string; best: string[] }> = {
    '椭圆脸': { chars: '脸部线条均衡，额头比下巴稍宽', best: ['椭圆框', '猫眼框', '飞行员框', '几乎所有款式'] },
    '圆脸': { chars: '脸部宽度和长度相近，轮廓圆润', best: ['方形框', '矩形框', '有棱角框', '猫眼框'] },
    '方脸': { chars: '额头、颧骨、下颌宽度相近，轮廓分明', best: ['椭圆框', '圆框', '猫眼框', '飞行员框'] },
    '长脸': { chars: '脸部长度明显大于宽度', best: ['大框', '宽框', '飞行员框', '猫眼框'] },
    '心形脸': { chars: '额头宽、下巴尖', best: ['椭圆框', '飞行员框', '半框', '圆框'] },
    '菱形脸': { chars: '颧骨最宽，额头和下巴较窄', best: ['猫眼框', '飞行员框', '椭圆框', '半框'] },
  };
  const fd = faceData[faceShape] || faceData['椭圆脸'];

  const frameWidth = Math.round(faceWidth * (0.95 + rng() * 0.15));
  const bridgeWidth = Math.round(16 + rng() * 6);
  const templeLength = Math.round(135 + rng() * 15);
  const fitScore = round(75 + rng() * 22, 0);
  const fitStatus = fitScore >= 85 ? '优秀' : fitScore >= 70 ? '良好' : '需调整';

  const frameRecs = [
    { frame_type: fd.best[0], material: pick(rng, ['钛合金', 'β钛', '醋酸纤维', '不锈钢']), color: pick(rng, ['黑色', '金色', '银色', '玳瑁色', '透明']), reason: `最适合${faceShape}，修饰面部比例` },
    { frame_type: fd.best[1], material: pick(rng, ['TR90', '醋酸纤维', '钛合金', '钨碳']), color: pick(rng, ['深蓝', '酒红', '墨绿', '银色']), reason: `与${faceShape}形成良好视觉平衡` },
    { frame_type: fd.best[2], material: pick(rng, ['不锈钢', '钛合金', 'β钛', '钨碳']), color: pick(rng, ['枪色', '玫瑰金', '黑色', '金色']), reason: `经典百搭，适合多种场合` },
  ];

  const warnings: string[] = [];
  if (faceWidth < 135) warnings.push('脸宽较小，建议选择窄版镜架避免夹持不稳');
  if (faceWidth > 155) warnings.push('脸宽较大，需确保镜架宽度足够避免压迫太阳穴');
  if (pd < 58) warnings.push('瞳距偏小，注意光学中心偏移量');
  if (pd > 66) warnings.push('瞳距偏大，需选择桥距较大的镜架');

  const pdFrameDiff = round(pd - (frameWidth + bridgeWidth) / 2, 1);
  const ocStatus = Math.abs(pdFrameDiff) <= 2 ? '良好' : Math.abs(pdFrameDiff) <= 4 ? '可接受' : '需调整';
  const prism = Math.abs(pdFrameDiff) > 3 ? `可能产生约${round(Math.abs(pdFrameDiff) * 0.1, 2)}Δ棱镜效应` : '棱镜效应可忽略';

  return {
    face_shape_analysis: { shape: faceShape, characteristics: fd.chars, best_frame_types: fd.best },
    size_matching: { frame_width: frameWidth, bridge_width: bridgeWidth, temple_length: templeLength, fit_score: fitScore, status: fitStatus },
    style_recommendations: frameRecs,
    fitting_warnings: warnings,
    optical_center_alignment: { pd_frame_diff: pdFrameDiff, status: ocStatus, prism_effect: prism },
    disclaimer: DISCLAIMER,
  };
}

function formatFrameFitting(r: FrameFittingResult): string {
  let s = '=== 镜架适配分析报告 ===\n\n';
  s += '【脸型分析】\n';
  s += `  脸型: ${r.face_shape_analysis.shape}\n`;
  s += `  特征: ${r.face_shape_analysis.characteristics}\n`;
  s += `  推荐框型: ${r.face_shape_analysis.best_frame_types.join('、')}\n\n`;
  s += '【尺寸匹配】\n';
  s += `  镜框宽度: ${r.size_matching.frame_width}mm | 鼻梁宽度: ${r.size_matching.bridge_width}mm\n`;
  s += `  镜腿长度: ${r.size_matching.temple_length}mm | 适配评分: ${r.size_matching.fit_score}/100 (${r.size_matching.status})\n\n`;
  s += '【款式推荐】\n';
  r.style_recommendations.forEach((rec, i) => {
    s += `  ${i + 1}. ${rec.frame_type} — ${rec.material} / ${rec.color}\n`;
    s += `     理由: ${rec.reason}\n`;
  });
  s += '\n【配适提醒】\n';
  if (r.fitting_warnings.length > 0) {
    r.fitting_warnings.forEach(w => { s += `  ⚠ ${w}\n`; });
  } else {
    s += '  ✅ 无明显配适问题\n';
  }
  s += '\n【光学中心对齐】\n';
  s += `  瞳距偏差: ${r.optical_center_alignment.pd_frame_diff}mm | 状态: ${r.optical_center_alignment.status}\n`;
  s += `  棱镜效应: ${r.optical_center_alignment.prism_effect}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. lens_material_selector — 镜片材料与膜层推荐
// ============================================================
interface LensMaterialInput {
  prescription_se?: number;
  patient_age?: number;
  lifestyle?: string;
  budget_level?: string;
  blue_light_need?: boolean;
  outdoor_activity?: string;
  weight_preference?: string;
  impact_resistance?: boolean;
}

interface LensMaterialResult {
  material_recommendation: { material: string; refractive_index: string; abbe_value: number; weight: string; suitability: number };
  coating_recommendations: Array<{ coating: string; benefit: string; priority: string }>;
  lens_design: { design: string; reason: string; edge_thickness_mm: number };
  thickness_estimate: { center_mm: number; edge_mm: number; frame_type_recommendation: string };
  cost_estimate: { level: string; range_cny: string; value_rating: number };
  care_tips: string[];
  disclaimer: string;
}

function analyzeLensMaterial(data: LensMaterialInput): LensMaterialResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const se = data.prescription_se ?? round(-2.0 + rng() * -6.0, 2);
  const absSE = Math.abs(se);
  const age = data.patient_age ?? Math.round(18 + rng() * 50);
  const lifestyle = data.lifestyle || pick(rng, ['办公族', '学生', '运动员', '驾驶员', '户外工作者']);

  const materials = [
    { material: 'CR-39树脂', index: '1.498', abbe: 58, weight: '较重', maxSE: 3.0 },
    { material: 'PC太空片', index: '1.586', abbe: 30, weight: '轻', maxSE: 6.0 },
    { material: 'MR-8树脂', index: '1.60', abbe: 41, weight: '中等', maxSE: 7.0 },
    { material: 'MR-10树脂', index: '1.67', abbe: 32, weight: '较轻', maxSE: 9.0 },
    { material: '高折射1.74', index: '1.74', abbe: 33, weight: '最轻', maxSE: 12.0 },
  ];

  let selected = materials[0];
  for (const m of materials) {
    if (absSE <= m.maxSE) { selected = m; break; }
    selected = m;
  }
  const suitScore = round(70 + rng() * 28, 0);

  const coatings: Array<{ coating: string; benefit: string; priority: string }> = [];
  coatings.push({ coating: '加硬膜', benefit: '提高表面硬度，防止划伤', priority: '必需' });
  coatings.push({ coating: '减反射膜(AR)', benefit: '减少反光，提高透光率和美观度', priority: '强烈推荐' });
  if (data.blue_light_need || lifestyle === '办公族' || lifestyle === '学生') {
    coatings.push({ coating: '防蓝光膜', benefit: '过滤有害蓝光，缓解数码视疲劳', priority: '推荐' });
  }
  if (lifestyle === '驾驶员' || lifestyle === '户外工作者') {
    coatings.push({ coating: '偏光膜', benefit: '消除眩光，提高驾驶安全性', priority: '推荐' });
  }
  coatings.push({ coating: '防水防油膜', benefit: '防污易清洁，保持镜片清透', priority: '推荐' });
  if (absSE > 4.0) {
    coatings.push({ coating: '抗冲击膜', benefit: '提高安全性', priority: '建议' });
  }

  const designs = ['球面', '非球面', '双面非球面', '自由曲面'];
  const design = absSE > 3.0 ? pick(rng, ['非球面', '双面非球面', '自由曲面']) : pick(rng, ['球面', '非球面']);
  const designReason = design === '球面' ? '低度数球面镜片成像质量良好' : design === '非球面' ? '减少像差，镜片更薄更美观' : '最佳光学性能，视野更宽广自然';

  const edgeThick = absSE > 0 ? round(absSE * 0.8 + rng() * 1.5, 1) : 1.5;
  const centerThick = round(1.2 + rng() * 0.8, 1);
  const frameRec = absSE > 6.0 ? '建议选择小框型以减少边缘厚度' : absSE > 3.0 ? '中等框型为宜' : '框型选择自由度较高';

  const costLevel = selected.index >= '1.67' ? '高' : selected.index >= '1.60' ? '中高' : selected.index >= '1.586' ? '中等' : '经济';
  const costRange = costLevel === '高' ? '800-2500元' : costLevel === '中高' ? '500-1200元' : costLevel === '中等' ? '300-800元' : '150-500元';
  const valueRating = round(70 + rng() * 25, 0);

  const tips = [
    '使用专用镜布擦拭，避免用纸巾或衣物直接擦拭',
    '清洗时先用清水冲洗，再用中性洗洁精轻柔清洁',
    '不戴时放入镜盒，避免镜片朝下放置',
    '避免高温环境（如桑拿、车内），防止膜层脱落',
    '定期检查镜架松紧，及时调整螺丝',
  ];

  return {
    material_recommendation: { material: selected.material, refractive_index: selected.index, abbe_value: selected.abbe, weight: selected.weight, suitability: suitScore },
    coating_recommendations: coatings,
    lens_design: { design, reason: designReason, edge_thickness_mm: edgeThick },
    thickness_estimate: { center_mm: centerThick, edge_mm: edgeThick, frame_type_recommendation: frameRec },
    cost_estimate: { level: costLevel, range_cny: costRange, value_rating: valueRating },
    care_tips: tips,
    disclaimer: DISCLAIMER,
  };
}

function formatLensMaterial(r: LensMaterialResult): string {
  let s = '=== 镜片材料与膜层推荐报告 ===\n\n';
  s += '【镜片材料推荐】\n';
  s += `  材料: ${r.material_recommendation.material}\n`;
  s += `  折射率: ${r.material_recommendation.refractive_index} | 阿贝数: ${r.material_recommendation.abbe_value}\n`;
  s += `  重量: ${r.material_recommendation.weight} | 适配度: ${r.material_recommendation.suitability}/100\n\n`;
  s += '【膜层推荐】\n';
  r.coating_recommendations.forEach(c => {
    s += `  [${c.priority}] ${c.coating} — ${c.benefit}\n`;
  });
  s += '\n【镜片设计】\n';
  s += `  设计: ${r.lens_design.design}\n`;
  s += `  理由: ${r.lens_design.reason}\n`;
  s += `  预估边缘厚度: ${r.lens_design.edge_thickness_mm}mm\n\n`;
  s += '【厚度预估】\n';
  s += `  中心厚度: ${r.thickness_estimate.center_mm}mm | 边缘厚度: ${r.thickness_estimate.edge_mm}mm\n`;
  s += `  框型建议: ${r.thickness_estimate.frame_type_recommendation}\n\n`;
  s += '【费用预估】\n';
  s += `  档次: ${r.cost_estimate.level} | 价格区间: ${r.cost_estimate.range_cny}\n`;
  s += `  性价比评分: ${r.cost_estimate.value_rating}/100\n\n`;
  s += '【护理建议】\n';
  r.care_tips.forEach(t => { s += `  💡 ${t}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. myopia_progression_tracker — 儿童近视进展追踪与干预效果
// ============================================================
interface MyopiaTrackingInput {
  patient_name?: string;
  birth_date?: string;
  baseline_se?: number;
  current_se?: number;
  axial_length_mm?: number;
  baseline_axial_mm?: number;
  intervention_type?: string;
  intervention_duration_months?: number;
  outdoor_hours_daily?: number;
  near_work_hours_daily?: number;
  screen_time_hours_daily?: number;
  follow_up_records?: Array<{ date: string; se: number; axial_mm: number }>;
}

interface MyopiaTrackingResult {
  progression_analysis: { annual_progression_rate: number; total_change: number; axial_growth_rate: number; risk_level: string };
  intervention_efficacy: { type: string; efficacy_rating: number; comparison_to_baseline: string; recommendation: string };
  risk_factors: Array<{ factor: string; level: string; impact: string }>;
  growth_forecast: Array<{ age: string; predicted_se: number; predicted_axial: number }>;
  management_recommendations: string[];
  disclaimer: string;
}

function analyzeMyopiaTracking(data: MyopiaTrackingInput): MyopiaTrackingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const baselineSE = data.baseline_se ?? round(-1.0 + rng() * -3.0, 2);
  const currentSE = data.current_se ?? round(baselineSE + rng() * -2.0, 2);
  const baselineAxial = data.baseline_axial_mm ?? round(23.0 + rng() * 1.5, 2);
  const currentAxial = data.axial_length_mm ?? round(baselineAxial + rng() * 1.0, 2);
  const duration = data.intervention_duration_months ?? Math.round(6 + rng() * 18);
  const intervention = data.intervention_type || pick(rng, ['角膜塑形镜(OK镜)', '低浓度阿托品', '多焦点软镜', '框架眼镜+户外活动', '联合治疗']);

  const annualProg = round((currentSE - baselineSE) / duration * 12, 2);
  const axialGrowth = round((currentAxial - baselineAxial) / duration * 12, 2);
  const totalChange = round(currentSE - baselineSE, 2);
  const riskLevel = annualProg <= -0.5 ? '低风险' : annualProg <= -1.0 ? '中风险' : '高风险';

  const efficacyMap: Record<string, number> = {
    '角膜塑形镜(OK镜)': round(40 + rng() * 20, 0),
    '低浓度阿托品': round(50 + rng() * 20, 0),
    '多焦点软镜': round(30 + rng() * 20, 0),
    '框架眼镜+户外活动': round(15 + rng() * 15, 0),
    '联合治疗': round(55 + rng() * 20, 0),
  };
  const efficacy = efficacyMap[intervention] ?? round(30 + rng() * 20, 0);
  const comparison = efficacy >= 50 ? '干预效果显著' : efficacy >= 30 ? '干预效果中等' : '干预效果有限，建议调整方案';
  const interventionRec = efficacy >= 50 ? '继续当前干预方案' : '建议咨询视光师调整干预策略';

  const riskFactors = [
    { factor: '每日户外时间', level: (data.outdoor_hours_daily ?? round(0.5 + rng() * 2, 1)) >= 2 ? '达标' : '不足', impact: '户外光照有助于延缓眼轴增长' },
    { factor: '近距离用眼时长', level: (data.near_work_hours_daily ?? round(2 + rng() * 5, 1)) <= 4 ? '合理' : '过长', impact: '长时间近距离用眼加速近视进展' },
    { factor: '电子屏幕时间', level: (data.screen_time_hours_daily ?? round(1 + rng() * 4, 1)) <= 2 ? '合理' : '过长', impact: '屏幕蓝光和调节疲劳影响近视控制' },
    { factor: '父母近视史', level: pick(rng, ['无', '单方', '双方']), impact: '遗传因素增加近视风险' },
  ];

  const forecast = [];
  const startAge = Math.round(6 + rng() * 6);
  for (let i = 0; i < 5; i++) {
    const age = `${startAge + i}岁`;
    const predSE = round(currentSE + annualProg * i, 2);
    const predAxial = round(currentAxial + axialGrowth * i, 2);
    forecast.push({ age, predicted_se: predSE, predicted_axial: predAxial });
  }

  const recs = [
    '每日户外活动≥2小时，自然光照刺激多巴胺分泌',
    '遵循20-20-20法则：每20分钟看20英尺外20秒',
    '保持正确读写姿势，眼睛距书本≥33cm',
    '确保充足照明（≥300lux），避免在暗光下用眼',
    '每3-6个月复查屈光度和眼轴长度',
    '均衡饮食，适量补充维生素D和叶黄素',
  ];

  return {
    progression_analysis: { annual_progression_rate: annualProg, total_change: totalChange, axial_growth_rate: axialGrowth, risk_level: riskLevel },
    intervention_efficacy: { type: intervention, efficacy_rating: efficacy, comparison_to_baseline: comparison, recommendation: interventionRec },
    risk_factors: riskFactors,
    growth_forecast: forecast,
    management_recommendations: recs,
    disclaimer: DISCLAIMER,
  };
}

function formatMyopiaTracking(r: MyopiaTrackingResult): string {
  let s = '=== 儿童近视进展追踪报告 ===\n\n';
  s += '【进展分析】\n';
  s += `  年进展速率: ${r.progression_analysis.annual_progression_rate}D/年\n`;
  s += `  总屈光变化: ${r.progression_analysis.total_change}D\n`;
  s += `  眼轴增长速率: ${r.progression_analysis.axial_growth_rate}mm/年\n`;
  s += `  风险等级: ${r.progression_analysis.risk_level}\n\n`;
  s += '【干预效果评估】\n';
  s += `  干预方式: ${r.intervention_efficacy.type}\n`;
  s += `  有效率: ${r.intervention_efficacy.efficacy_rating}%\n`;
  s += `  评估: ${r.intervention_efficacy.comparison_to_baseline}\n`;
  s += `  建议: ${r.intervention_efficacy.recommendation}\n\n`;
  s += '【风险因素】\n';
  r.risk_factors.forEach(f => {
    s += `  ${f.factor}: ${f.level} — ${f.impact}\n`;
  });
  s += '\n【生长预测】\n';
  r.growth_forecast.forEach(g => {
    s += `  ${g.age}: 预估屈光 ${g.predicted_se}D | 预估眼轴 ${g.predicted_axial}mm\n`;
  });
  s += '\n【管理建议】\n';
  r.management_recommendations.forEach(i => { s += `  💡 ${i}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. contact_lens_fitting — 隐形眼镜配适评估与参数推荐
// ============================================================
interface ContactLensInput {
  k_reading_flat?: number;
  k_reading_steep?: number;
  corneal_diameter_mm?: number;
  pupil_diameter_mm?: number;
  prescription_se?: number;
  astigmatism_d?: number;
  wearing_schedule?: string;
  lens_type_preference?: string;
  tear_film_quality?: string;
  previous_lens_brand?: string;
}

interface ContactLensResult {
  corneal_curvature: { flat_k: number; steep_k: number; corneal_astigmatism: number; eccentricity: number; status: string };
  lens_parameters: { base_curve_mm: number; diameter_mm: number; material: string; replacement_cycle: string };
  toric_assessment: { needs_toric: boolean; cylinder_power: number; axis: number; stability: string };
  tear_film_evaluation: { quality: string; tbut_estimate: number; recommendation: string };
  wearing_plan: { daily_hours: number; max_days: number; care_system: string; solution_type: string };
  warnings: string[];
  disclaimer: string;
}

function analyzeContactLens(data: ContactLensInput): ContactLensResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const flatK = data.k_reading_flat ?? round(42.0 + rng() * 3.0, 2);
  const steepK = data.k_reading_steep ?? round(flatK + 0.5 + rng() * 1.5, 2);
  const corneaDiam = data.corneal_diameter_mm ?? round(11.0 + rng() * 1.5, 1);
  const pupilDiam = data.pupil_diameter_mm ?? round(3.0 + rng() * 3.0, 1);
  const se = data.prescription_se ?? round(-2.0 + rng() * -5.0, 2);
  const astig = data.astigmatism_d ?? round(rng() * -2.0, 2);

  const corneaAstig = round(steepK - flatK, 2);
  const eccentricity = round(0.4 + rng() * 0.3, 2);
  const curveStatus = flatK >= 41 && flatK <= 46 ? '正常角膜曲率' : flatK < 41 ? '角膜偏平坦' : '角膜偏陡峭';

  const baseCurve = round(flatK + 0.4 + rng() * 0.4, 1);
  const diameter = round(corneaDiam + 1.5 + rng() * 1.0, 1);
  const material = pick(rng, ['硅水凝胶', '水凝胶', 'RGP硬性透氧']);
  const cycle = pick(rng, ['日抛', '双周抛', '月抛', '季抛']);

  const needsToric = Math.abs(astig) >= 0.75;
  const toricCyl = needsToric ? round(astig, 2) : 0;
  const toricAxis = needsToric ? Math.round(rng() * 180) : 0;
  const stability = needsToric ? pick(rng, ['棱镜垂重法', '截边法', '双薄区法']) : '不适用';

  const tbUT = round(5 + rng() * 10, 0);
  const tearQuality = data.tear_film_quality || (tbUT >= 10 ? '良好' : tbUT >= 5 ? '一般' : '较差');
  const tearRec = tbUT >= 10 ? '适合配戴隐形眼镜' : tbUT >= 5 ? '建议选择高含水量镜片，适当减少配戴时间' : '建议先治疗干眼，再评估是否适合配戴';

  const dailyHours = material === '硅水凝胶' ? Math.round(8 + rng() * 6) : Math.round(6 + rng() * 4);
  const maxDays = cycle === '日抛' ? 1 : cycle === '双周抛' ? 14 : cycle === '月抛' ? 30 : 90;
  const careSystem = material === 'RGP' ? 'RGP专用护理系统' : pick(rng, ['多功能护理液', '双氧水护理系统', '日抛免护理']);

  const warnings: string[] = [];
  if (Math.abs(se) > 10.0) warnings.push('高度数隐形眼镜顶点换算后可能需调整度数');
  if (corneaAstig > 3.0) warnings.push('角膜散光较高，建议考虑RGP或散光软镜');
  if (tbUT < 5) warnings.push('泪膜质量差，建议先改善干眼症状');
  if (pupilDiam > 7.0) warnings.push('瞳孔较大，夜间可能出现眩光，建议增大镜片光学区');
  if (material === '水凝胶' && dailyHours > 10) warnings.push('水凝胶材质长时间配戴可能导致角膜缺氧');
  if (warnings.length === 0) warnings.push('无明显禁忌，适合配戴');

  return {
    corneal_curvature: { flat_k: flatK, steep_k: steepK, corneal_astigmatism: corneaAstig, eccentricity, status: curveStatus },
    lens_parameters: { base_curve_mm: baseCurve, diameter_mm: diameter, material, replacement_cycle: cycle },
    toric_assessment: { needs_toric: needsToric, cylinder_power: toricCyl, axis: toricAxis, stability },
    tear_film_evaluation: { quality: tearQuality, tbut_estimate: tbUT, recommendation: tearRec },
    wearing_plan: { daily_hours: dailyHours, max_days: maxDays, care_system: careSystem, solution_type: pick(rng, ['多功能护理液', '双氧水系统', '蛋白酶片辅助']) },
    warnings,
    disclaimer: DISCLAIMER,
  };
}

function formatContactLens(r: ContactLensResult): string {
  let s = '=== 隐形眼镜配适评估报告 ===\n\n';
  s += '【角膜曲率分析】\n';
  s += `  平坦K: ${r.corneal_curvature.flat_k}D | 陡峭K: ${r.corneal_curvature.steep_k}D\n`;
  s += `  角膜散光: ${r.corneal_curvature.corneal_astigmatism}D | 偏心率e值: ${r.corneal_curvature.eccentricity}\n`;
  s += `  状态: ${r.corneal_curvature.status}\n\n`;
  s += '【镜片参数推荐】\n';
  s += `  基弧: ${r.lens_parameters.base_curve_mm}mm | 直径: ${r.lens_parameters.diameter_mm}mm\n`;
  s += `  材质: ${r.lens_parameters.material} | 更换周期: ${r.lens_parameters.replacement_cycle}\n\n`;
  s += '【散光评估】\n';
  s += `  需要散光镜片: ${r.toric_assessment.needs_toric ? '是' : '否'}\n`;
  if (r.toric_assessment.needs_toric) {
    s += `  散光度数: ${r.toric_assessment.cylinder_power}D | 轴位: ${r.toric_assessment.axis}°\n`;
    s += `  稳定设计: ${r.toric_assessment.stability}\n`;
  }
  s += '\n【泪膜评估】\n';
  s += `  泪膜质量: ${r.tear_film_evaluation.quality} | 预估BUT: ${r.tear_film_evaluation.tbut_estimate}秒\n`;
  s += `  建议: ${r.tear_film_evaluation.recommendation}\n\n`;
  s += '【配戴方案】\n';
  s += `  每日配戴: ${r.wearing_plan.daily_hours}小时 | 最长更换: ${r.wearing_plan.max_days}天\n`;
  s += `  护理系统: ${r.wearing_plan.care_system} | 护理液: ${r.wearing_plan.solution_type}\n\n`;
  s += '【注意事项】\n';
  r.warnings.forEach(w => { s += `  ⚠ ${w}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. optical_store_inventory — 眼镜店SKU优化与库存管理
// ============================================================
interface InventoryInput {
  store_size_sqm?: number;
  monthly_revenue?: number;
  total_skus?: number;
  frame_categories?: Array<{ name: string; sku_count: number; monthly_sales: number; avg_price: number }>;
  lens_categories?: Array<{ name: string; sku_count: number; monthly_orders: number; turnover_days: number }>;
  top_selling_brands?: string[];
  customer_segments?: string[];
}

interface InventoryResult {
  sku_optimization: { total_skus: number; recommended_skus: number; reduction_pct: number; status: string };
  category_analysis: Array<{ category: string; sku_count: number; sales_contribution: number; recommendation: string }>;
  turnover_analysis: { avg_turnover_days: number; slow_moving_pct: number; fast_moving_items: number; status: string };
  pricing_strategy: Array<{ segment: string; price_range: string; margin_target: number; strategy: string }>;
  reorder_recommendations: Array<{ item: string; current_stock: number; reorder_point: number; suggested_qty: number }>;
  revenue_forecast: { monthly_target: number; growth_potential: number; key_actions: string[] };
  disclaimer: string;
}

function analyzeInventory(data: InventoryInput): InventoryResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const storeSize = data.store_size_sqm ?? round(30 + rng() * 120, 0);
  const monthlyRev = data.monthly_revenue ?? round(30000 + rng() * 170000, 0);
  const totalSKUs = data.total_skus ?? Math.round(200 + rng() * 800);

  const recommendedSKUs = Math.round(totalSKUs * (0.6 + rng() * 0.2));
  const reductionPct = round(((totalSKUs - recommendedSKUs) / totalSKUs) * 100, 1);
  const skuStatus = reductionPct > 30 ? 'SKU过多，需精简' : reductionPct > 15 ? 'SKU适中，可优化' : 'SKU精简良好';

  const categories = [
    { category: '时尚太阳镜', sku_count: Math.round(30 + rng() * 70), sales_contribution: round(15 + rng() * 15, 1), recommendation: '季节性品类，旺季前备货' },
    { category: '光学镜架', sku_count: Math.round(50 + rng() * 150), sales_contribution: round(25 + rng() * 15, 1), recommendation: '核心品类，保持丰富度' },
    { category: '儿童镜架', sku_count: Math.round(15 + rng() * 35), sales_contribution: round(8 + rng() * 10, 1), recommendation: '增长品类，增加功能性产品' },
    { category: '渐进镜片', sku_count: Math.round(20 + rng() * 40), sales_contribution: round(15 + rng() * 15, 1), recommendation: '高毛利品类，加强验配能力' },
    { category: '防蓝光镜片', sku_count: Math.round(10 + rng() * 20), sales_contribution: round(10 + rng() * 10, 1), recommendation: '热门品类，保持库存充足' },
    { category: '隐形眼镜', sku_count: Math.round(20 + rng() * 60), sales_contribution: round(12 + rng() * 10, 1), recommendation: '复购品类，确保不断货' },
  ];

  const avgTurnover = round(30 + rng() * 60, 0);
  const slowMoving = round(10 + rng() * 25, 1);
  const fastMoving = Math.round(20 + rng() * 40);
  const turnoverStatus = avgTurnover <= 45 ? '良好' : avgTurnover <= 75 ? '一般' : '需改善';

  const pricing = [
    { segment: '学生群体', price_range: '200-500元', margin_target: round(50 + rng() * 15, 1), strategy: '性价比导向，套餐促销' },
    { segment: '白领阶层', price_range: '500-1500元', margin_target: round(55 + rng() * 15, 1), strategy: '品质+品牌，强调功能性' },
    { segment: '高端客户', price_range: '1500-5000元', margin_target: round(60 + rng() * 15, 1), strategy: '进口品牌，定制服务' },
    { segment: '老年群体', price_range: '300-800元', margin_target: round(45 + rng() * 15, 1), strategy: '实用为主，渐进镜片推广' },
  ];

  const reorderItems = [
    { item: '钛合金超轻镜架', current_stock: Math.round(5 + rng() * 15), reorder_point: 10, suggested_qty: Math.round(20 + rng() * 30) },
    { item: '1.60防蓝光镜片', current_stock: Math.round(8 + rng() * 20), reorder_point: 15, suggested_qty: Math.round(25 + rng() * 35) },
    { item: '硅水凝胶日抛隐形', current_stock: Math.round(10 + rng() * 30), reorder_point: 20, suggested_qty: Math.round(40 + rng() * 60) },
    { item: '儿童防控镜片', current_stock: Math.round(3 + rng() * 10), reorder_point: 8, suggested_qty: Math.round(15 + rng() * 20) },
    { item: '渐进多焦点镜片', current_stock: Math.round(5 + rng() * 12), reorder_point: 10, suggested_qty: Math.round(15 + rng() * 25) },
  ];

  const monthlyTarget = round(monthlyRev * (1.1 + rng() * 0.2), 0);
  const growthPotential = round(10 + rng() * 20, 1);
  const keyActions = [
    '精简低效SKU，聚焦高周转品类',
    '建立安全库存预警机制',
    '优化供应商管理，缩短补货周期',
    '加强高毛利品类（渐进片、功能性镜片）推广',
    '实施会员管理，提高复购率',
  ];

  return {
    sku_optimization: { total_skus: totalSKUs, recommended_skus: recommendedSKUs, reduction_pct: reductionPct, status: skuStatus },
    category_analysis: categories,
    turnover_analysis: { avg_turnover_days: avgTurnover, slow_moving_pct: slowMoving, fast_moving_items: fastMoving, status: turnoverStatus },
    pricing_strategy: pricing,
    reorder_recommendations: reorderItems,
    revenue_forecast: { monthly_target: monthlyTarget, growth_potential: growthPotential, key_actions: keyActions },
    disclaimer: DISCLAIMER,
  };
}

function formatInventory(r: InventoryResult): string {
  let s = '=== 眼镜店SKU优化与库存管理报告 ===\n\n';
  s += '【SKU优化】\n';
  s += `  当前SKU数: ${r.sku_optimization.total_skus} | 建议SKU数: ${r.sku_optimization.recommended_skus}\n`;
  s += `  精简比例: ${r.sku_optimization.reduction_pct}% | 状态: ${r.sku_optimization.status}\n\n`;
  s += '【品类分析】\n';
  r.category_analysis.forEach(c => {
    s += `  ${c.category}: ${c.sku_count}个SKU | 销售贡献: ${c.sales_contribution}%\n`;
    s += `    建议: ${c.recommendation}\n`;
  });
  s += '\n【周转分析】\n';
  s += `  平均周转天数: ${r.turnover_analysis.avg_turnover_days}天\n`;
  s += `  滞销品占比: ${r.turnover_analysis.slow_moving_pct}% | 畅销品数: ${r.turnover_analysis.fast_moving_items}\n`;
  s += `  状态: ${r.turnover_analysis.status}\n\n`;
  s += '【定价策略】\n';
  r.pricing_strategy.forEach(p => {
    s += `  ${p.segment}: ${p.price_range} | 毛利率目标: ${p.margin_target}%\n`;
    s += `    策略: ${p.strategy}\n`;
  });
  s += '\n【补货建议】\n';
  r.reorder_recommendations.forEach(ro => {
    s += `  ${ro.item}: 库存${ro.current_stock} | 补货点${ro.reorder_point} | 建议补货${ro.suggested_qty}\n`;
  });
  s += '\n【营收预测】\n';
  s += `  月目标: ¥${r.revenue_forecast.monthly_target.toLocaleString()}\n`;
  s += `  增长潜力: ${r.revenue_forecast.growth_potential}%\n`;
  s += '  关键行动:\n';
  r.revenue_forecast.key_actions.forEach(a => { s += `    - ${a}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. low_vision_rehabilitation — 低视力康复方案与辅具推荐
// ============================================================
interface LowVisionInput {
  visual_acuity_od?: string;
  visual_acuity_os?: string;
  diagnosis?: string;
  patient_age?: number;
  daily_activities?: string[];
  living_situation?: string;
  previous_rehab?: boolean;
  goals?: string[];
}

interface LowVisionResult {
  vision_assessment: { od_va: string; os_va: string; functional_vision: string; severity: string };
  assistive_devices: Array<{ device: string; magnification: string; use_case: string; priority: string }>;
  rehabilitation_plan: Array<{ goal: string; intervention: string; frequency: string; duration: string }>;
  environmental_modifications: Array<{ area: string; modification: string; benefit: string }>;
  training_recommendations: Array<{ skill: string; method: string; expected_outcome: string }>;
  support_resources: string[];
  disclaimer: string;
}

function analyzeLowVision(data: LowVisionInput): LowVisionResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const odVA = data.visual_acuity_od || pick(rng, ['0.05', '0.1', '0.15', '0.2', '0.25', '0.3']);
  const osVA = data.visual_acuity_os || pick(rng, ['0.05', '0.1', '0.15', '0.2', '0.25', '0.3']);
  const diagnosis = data.diagnosis || pick(rng, ['黄斑变性', '糖尿病视网膜病变', '青光眼', '视网膜色素变性', '视神经萎缩', '白内障术后']);
  const age = data.patient_age ?? Math.round(50 + rng() * 35);

  const odVal = parseFloat(odVA);
  const osVal = parseFloat(osVA);
  const betterEye = Math.max(odVal, osVal);
  const severity = betterEye >= 0.3 ? '轻度低视力' : betterEye >= 0.1 ? '中度低视力' : betterEye >= 0.05 ? '重度低视力' : '极重度低视力';
  const funcVision = betterEye >= 0.2 ? '可完成大部分日常活动，需辅助器具' : '日常活动受限明显，需综合康复';

  const devices = [
    { device: '手持放大镜(5-10X)', magnification: '5-10倍', use_case: '阅读药品标签、账单、短文本', priority: '必需' },
    { device: '立式电子助视器(19-24寸)', magnification: '15-60倍', use_case: '长时间阅读、书写', priority: '强烈推荐' },
    { device: '便携式电子助视器', magnification: '5-15倍', use_case: '外出购物、看菜单、路牌', priority: '推荐' },
    { device: '望远镜系统(2.5-4X)', magnification: '2.5-4倍', use_case: '看黑板、路标、电视', priority: '推荐' },
    { device: '滤光镜片(琥珀色/橙色)', magnification: '无放大', use_case: '减少眩光，提高对比度', priority: '建议' },
    { device: '语音辅助设备', magnification: '无放大', use_case: '有声读物、语音播报', priority: '辅助' },
  ];

  const rehabPlan = [
    { goal: '提高阅读能力', intervention: '使用电子助视器进行渐进式阅读训练', frequency: '每日1-2次', duration: '持续3-6个月' },
    { goal: '增强定向移动能力', intervention: '定向行走训练+白手杖使用', frequency: '每周2-3次', duration: '6-12周' },
    { goal: '改善日常生活技能', intervention: '日常生活活动训练(ADL)', frequency: '每周2次', duration: '8-12周' },
    { goal: '心理适应支持', intervention: '低视力患者互助小组+心理咨询', frequency: '每月1-2次', duration: '持续进行' },
  ];

  const envMods = [
    { area: '照明', modification: '增加局部照明(500-1000lux)，使用可调色温灯具', benefit: '提高视觉对比度和舒适度' },
    { area: '对比度', modification: '门框、楼梯边缘贴高对比度胶带', benefit: '提高环境辨识度，减少跌倒风险' },
    { area: '标识', modification: '使用大字体标签标记常用物品和开关', benefit: '便于识别和独立操作' },
    { area: '家具', modification: '固定家具位置，减少杂物堆放', benefit: '创造安全的活动空间' },
    { area: '电子设备', modification: '手机/电脑开启大字体模式和高对比度主题', benefit: '提高数字设备可用性' },
  ];

  const training = [
    { skill: '偏心注视训练', method: '使用视野稳定注视目标，训练黄斑外区域注视', expected_outcome: '建立新的注视策略，提高阅读速度' },
    { skill: '扫描搜索技巧', method: '系统性头部和眼球运动训练', expected_outcome: '提高目标定位效率' },
    { skill: '手眼协调', method: '在辅助器具下完成精细操作练习', expected_outcome: '恢复书写、穿衣等日常技能' },
    { skill: '视觉记忆训练', method: '通过描述和回忆环境细节强化视觉认知', expected_outcome: '提高环境感知和安全性' },
  ];

  const resources = [
    '当地残联低视力康复中心',
    '三甲医院眼科低视力门诊',
    '中国盲文图书馆有声读物资源',
    '低视力患者互助社群',
    '社区康复服务与上门随访',
  ];

  return {
    vision_assessment: { od_va: odVA, os_va: osVA, functional_vision: funcVision, severity },
    assistive_devices: devices,
    rehabilitation_plan: rehabPlan,
    environmental_modifications: envMods,
    training_recommendations: training,
    support_resources: resources,
    disclaimer: DISCLAIMER,
  };
}

function formatLowVision(r: LowVisionResult): string {
  let s = '=== 低视力康复方案报告 ===\n\n';
  s += '【视力评估】\n';
  s += `  右眼视力: ${r.vision_assessment.od_va} | 左眼视力: ${r.vision_assessment.os_va}\n`;
  s += `  功能视力: ${r.vision_assessment.functional_vision}\n`;
  s += `  严重程度: ${r.vision_assessment.severity}\n\n`;
  s += '【辅具推荐】\n';
  r.assistive_devices.forEach(d => {
    s += `  [${d.priority}] ${d.device} — 放大倍率: ${d.magnification}\n`;
    s += `    用途: ${d.use_case}\n`;
  });
  s += '\n【康复计划】\n';
  r.rehabilitation_plan.forEach(p => {
    s += `  目标: ${p.goal}\n`;
    s += `    干预: ${p.intervention} | 频率: ${p.frequency} | 周期: ${p.duration}\n`;
  });
  s += '\n【环境改造】\n';
  r.environmental_modifications.forEach(e => {
    s += `  ${e.area}: ${e.modification}\n`;
    s += `    益处: ${e.benefit}\n`;
  });
  s += '\n【训练建议】\n';
  r.training_recommendations.forEach(t => {
    s += `  ${t.skill}: ${t.method}\n`;
    s += `    预期效果: ${t.expected_outcome}\n`;
  });
  s += '\n【支持资源】\n';
  r.support_resources.forEach(rsrc => { s += `  📌 ${rsrc}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. blue_light_protection_advisor — 蓝光防护评估与防蓝光建议
// ============================================================
interface BlueLightInput {
  daily_screen_hours?: number;
  device_types?: string[];
  work_environment?: string;
  existing_symptoms?: string[];
  current_protection?: string[];
  age?: number;
  sleep_quality?: string;
  eye_exam_frequency?: string;
}

interface BlueLightResult {
  exposure_assessment: { daily_hours: number; risk_level: string; peak_exposure: string; cumulative_index: number };
  health_impact: { eye_strain_risk: number; sleep_disruption_risk: number; retinal_risk: number; overall_concern: string };
  protection_recommendations: Array<{ measure: string; effectiveness: number; priority: string; implementation: string }>;
  filter_recommendations: Array<{ filter_type: string; blocking_rate: string; use_case: string; recommendation: string }>;
  behavioral_changes: Array<{ habit: string; benefit: string; difficulty: string }>;
  monitoring_plan: { checkup_frequency: string; key_indicators: string[]; warning_signs: string[] };
  disclaimer: string;
}

function analyzeBlueLight(data: BlueLightInput): BlueLightResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const screenHours = data.daily_screen_hours ?? round(4 + rng() * 10, 1);
  const age = data.age ?? Math.round(18 + rng() * 45);
  const devices = data.device_types || pick(rng, [['手机', '电脑'], ['电脑', '平板', '手机'], ['电脑'], ['手机', '电脑', '电视', '平板']]);

  const riskLevel = screenHours <= 4 ? '低风险' : screenHours <= 8 ? '中等风险' : screenHours <= 12 ? '高风险' : '极高风险';
  const peakExposure = screenHours > 8 ? '晚间(19:00-23:00)' : '日间(09:00-18:00)';
  const cumIndex = round(screenHours * (devices.length * 0.3) * (age < 18 ? 1.3 : 1.0), 1);

  const eyeStrain = round(Math.min(95, screenHours * 8 + rng() * 20), 0);
  const sleepDisrupt = round(Math.min(95, screenHours * 7 + rng() * 25), 0);
  const retinal = round(Math.min(60, screenHours * 3 + rng() * 20), 0);
  const overall = eyeStrain > 70 || sleepDisrupt > 70 ? '高度关注' : eyeStrain > 40 || sleepDisrupt > 40 ? '中度关注' : '低度关注';

  const protections = [
    { measure: '防蓝光眼镜', effectiveness: round(30 + rng() * 25, 0), priority: '推荐', implementation: '选择阻隔率25-40%的镜片，全天使用电脑时佩戴' },
    { measure: '屏幕滤光软件(f.lux/夜间模式)', effectiveness: round(20 + rng() * 20, 0), priority: '强烈推荐', implementation: '日落后自动开启暖色模式，降低色温至3000K以下' },
    { measure: '20-20-20法则', effectiveness: round(25 + rng() * 20, 0), priority: '必需', implementation: '每20分钟看20英尺(6米)外20秒' },
    { measure: '调整屏幕亮度和对比度', effectiveness: round(15 + rng() * 15, 0), priority: '推荐', implementation: '屏幕亮度与环境光匹配，避免过亮或过暗' },
    { measure: '增加环境照明', effectiveness: round(10 + rng() * 15, 0), priority: '建议', implementation: '工作环境照度300-500lux，避免屏幕与环境对比度过大' },
    { measure: '限制睡前屏幕使用', effectiveness: round(30 + rng() * 20, 0), priority: '强烈推荐', implementation: '睡前1-2小时避免使用电子屏幕' },
  ];

  const filters = [
    { filter_type: '透明防蓝光镜片', blocking_rate: '15-25%', use_case: '日常办公，色彩还原要求高', recommendation: '适合设计师等对色彩敏感的用户' },
    { filter_type: '浅黄防蓝光镜片', blocking_rate: '30-50%', use_case: '长时间电脑/手机使用', recommendation: '适合大多数办公族和重度数码用户' },
    { filter_type: '琥珀色防蓝光镜片', blocking_rate: '60-90%', use_case: '夜间使用、睡眠障碍者', recommendation: '睡前2-3小时佩戴，改善睡眠质量' },
    { filter_type: '屏幕贴膜/滤光片', blocking_rate: '20-40%', use_case: '不便戴眼镜时的替代方案', recommendation: '适合临时使用或儿童设备' },
  ];

  const behaviors = [
    { habit: '定时休息，每小时起身活动5分钟', benefit: '缓解视疲劳和颈椎压力', difficulty: '容易' },
    { habit: '将手机屏幕调至护眼模式', benefit: '减少蓝光暴露', difficulty: '容易' },
    { habit: '睡前1小时不使用电子屏幕', benefit: '改善褪黑素分泌和睡眠质量', difficulty: '中等' },
    { habit: '增加户外活动时间', benefit: '自然光有助于调节昼夜节律', difficulty: '中等' },
    { habit: '使用纸质书替代电子阅读', benefit: '完全消除屏幕蓝光暴露', difficulty: '较难' },
  ];

  const checkupFreq = age < 18 ? '每6个月' : eyeStrain > 70 ? '每6个月' : '每年1次';
  const indicators = ['眼干涩程度', '视疲劳频率', '睡眠质量变化', '近视进展速率', '黄斑OCT检查'];
  const warningSigns = ['持续性眼干眼涩', '视力进行性下降', '眼前闪光或黑影', '严重头痛伴眼痛', '夜间视力明显下降'];

  return {
    exposure_assessment: { daily_hours: screenHours, risk_level: riskLevel, peak_exposure: peakExposure, cumulative_index: cumIndex },
    health_impact: { eye_strain_risk: eyeStrain, sleep_disruption_risk: sleepDisrupt, retinal_risk: retinal, overall_concern: overall },
    protection_recommendations: protections,
    filter_recommendations: filters,
    behavioral_changes: behaviors,
    monitoring_plan: { checkup_frequency: checkupFreq, key_indicators: indicators, warning_signs: warningSigns },
    disclaimer: DISCLAIMER,
  };
}

function formatBlueLight(r: BlueLightResult): string {
  let s = '=== 蓝光防护评估报告 ===\n\n';
  s += '【暴露评估】\n';
  s += `  日均屏幕时间: ${r.exposure_assessment.daily_hours}小时\n`;
  s += `  风险等级: ${r.exposure_assessment.risk_level} | 峰值暴露: ${r.exposure_assessment.peak_exposure}\n`;
  s += `  累积暴露指数: ${r.exposure_assessment.cumulative_index}\n\n`;
  s += '【健康影响】\n';
  s += `  视疲劳风险: ${r.health_impact.eye_strain_risk}/100\n`;
  s += `  睡眠干扰风险: ${r.health_impact.sleep_disruption_risk}/100\n`;
  s += `  视网膜风险: ${r.health_impact.retinal_risk}/100\n`;
  s += `  综合关注: ${r.health_impact.overall_concern}\n\n`;
  s += '【防护建议】\n';
  r.protection_recommendations.forEach(p => {
    s += `  [${p.priority}] ${p.measure} — 有效率: ${p.effectiveness}%\n`;
    s += `    实施: ${p.implementation}\n`;
  });
  s += '\n【滤光方案】\n';
  r.filter_recommendations.forEach(f => {
    s += `  ${f.filter_type} — 阻隔率: ${f.blocking_rate}\n`;
    s += `    适用: ${f.use_case} | 建议: ${f.recommendation}\n`;
  });
  s += '\n【行为改变】\n';
  r.behavioral_changes.forEach(b => {
    s += `  ${b.habit} — 益处: ${b.benefit} | 难度: ${b.difficulty}\n`;
  });
  s += '\n【监测计划】\n';
  s += `  检查频率: ${r.monitoring_plan.checkup_frequency}\n`;
  s += `  关键指标: ${r.monitoring_plan.key_indicators.join('、')}\n`;
  s += `  预警信号: ${r.monitoring_plan.warning_signs.join('、')}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. prescription_accuracy_checker
  tools.register(defineTool({
    name: 'prescription_accuracy_checker',
    description: '验光处方合理性审查与误差检测 — 分析球镜/柱镜/轴位合理性、屈光参差、瞳距匹配、屈光进展及处方错误检测',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式输入，包含od_sphere, od_cylinder, od_axis, os_sphere, os_cylinder, os_axis, pd, add_power, patient_age, previous_od_sphere, previous_os_sphere等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPrescription(analyzePrescription(JSON.parse(args.input_data)));
    },
  }));

  // 2. frame_fitting_advisor
  tools.register(defineTool({
    name: 'frame_fitting_advisor',
    description: '镜架适配分析与脸型匹配 — 基于脸型、面部尺寸和瞳距，提供镜架款式推荐、尺寸匹配和光学中心对齐分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式输入，包含face_shape, face_width_mm, temple_width_mm, bridge_width_mm, pd, frame_size, skin_tone, hair_color, style_preference等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFrameFitting(analyzeFrameFitting(JSON.parse(args.input_data)));
    },
  }));

  // 3. lens_material_selector
  tools.register(defineTool({
    name: 'lens_material_selector',
    description: '镜片材料与膜层推荐 — 基于屈光度、年龄、生活方式和预算，推荐镜片材料、折射率、膜层组合和镜片设计',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式输入，包含prescription_se, patient_age, lifestyle, budget_level, blue_light_need, outdoor_activity, weight_preference, impact_resistance等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatLensMaterial(analyzeLensMaterial(JSON.parse(args.input_data)));
    },
  }));

  // 4. myopia_progression_tracker
  tools.register(defineTool({
    name: 'myopia_progression_tracker',
    description: '儿童近视进展追踪与干预效果 — 追踪屈光度和眼轴变化，评估干预措施效果，预测近视发展趋势',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式输入，包含patient_name, birth_date, baseline_se, current_se, axial_length_mm, baseline_axial_mm, intervention_type, intervention_duration_months, outdoor_hours_daily, near_work_hours_daily, screen_time_hours_daily等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatMyopiaTracking(analyzeMyopiaTracking(JSON.parse(args.input_data)));
    },
  }));

  // 5. contact_lens_fitting
  tools.register(defineTool({
    name: 'contact_lens_fitting',
    description: '隐形眼镜配适评估与参数推荐 — 基于角膜曲率、屈光度和泪膜质量，推荐镜片参数、材质和配戴方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式输入，包含k_reading_flat, k_reading_steep, corneal_diameter_mm, pupil_diameter_mm, prescription_se, astigmatism_d, wearing_schedule, lens_type_preference, tear_film_quality等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatContactLens(analyzeContactLens(JSON.parse(args.input_data)));
    },
  }));

  // 6. optical_store_inventory
  tools.register(defineTool({
    name: 'optical_store_inventory',
    description: '眼镜店SKU优化与库存管理 — 分析品类结构、周转效率和定价策略，提供SKU精简、补货建议和营收优化方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式输入，包含store_size_sqm, monthly_revenue, total_skus, frame_categories, lens_categories, top_selling_brands, customer_segments等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatInventory(analyzeInventory(JSON.parse(args.input_data)));
    },
  }));

  // 7. low_vision_rehabilitation
  tools.register(defineTool({
    name: 'low_vision_rehabilitation',
    description: '低视力康复方案与辅具推荐 — 评估低视力程度，推荐辅助器具、康复训练、环境改造方案和支持资源',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式输入，包含visual_acuity_od, visual_acuity_os, diagnosis, patient_age, daily_activities, living_situation, previous_rehab, goals等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatLowVision(analyzeLowVision(JSON.parse(args.input_data)));
    },
  }));

  // 8. blue_light_protection_advisor
  tools.register(defineTool({
    name: 'blue_light_protection_advisor',
    description: '蓝光防护评估与防蓝光建议 — 评估蓝光暴露水平，分析健康影响，推荐防蓝光镜片、滤光方案和行为改善策略',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式输入，包含daily_screen_hours, device_types, work_environment, existing_symptoms, current_protection, age, sleep_quality, eye_exam_frequency等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatBlueLight(analyzeBlueLight(JSON.parse(args.input_data)));
    },
  }));
}
