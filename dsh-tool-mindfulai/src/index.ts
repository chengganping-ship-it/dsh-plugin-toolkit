import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'mindfulai';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供心理健康参考，不替代专业医疗诊断与治疗。如有严重心理问题，请咨询专业医师。';

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
// 1. meditation_session_generator
// ============================================================
export interface MeditationInput {
  meditation_type?: string;
  duration_minutes?: number;
  experience_level?: string;
  focus_area?: string;
  environment?: string;
  time_of_day?: string;
}

export interface MeditationResult {
  session_overview: { type: string; duration_minutes: number; level: string; focus: string; goal: string };
  breathing_guide: { technique: string; inhale_seconds: number; hold_seconds: number; exhale_seconds: number; cycles: number };
  script_phases: Array<{ phase: string; duration_minutes: number; instruction: string; guidance: string }>;
  body_scan: Array<{ body_part: string; action: string; duration_seconds: number }>;
  ambient_recommendations: Array<{ element: string; suggestion: string; purpose: string }>;
  closing_ritual: { reflection_prompt: string; gratitude_exercise: string; transition_advice: string };
  disclaimer: string;
}

function generateMeditationSession(data: MeditationInput): MeditationResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const medType = data.meditation_type || pick(rng, ['正念冥想', '呼吸冥想', '身体扫描', '慈心冥想', '行走冥想', '观想冥想']);
  const duration = data.duration_minutes ?? Math.round(5 + rng() * 25);
  const level = data.experience_level || pick(rng, ['初学者', '中级', '高级']);
  const focus = data.focus_area || pick(rng, ['压力缓解', '焦虑管理', '专注提升', '情绪平衡', '睡眠准备', '自我觉察']);

  const breathTechniques = [
    { technique: '4-7-8呼吸法', inhale_seconds: 4, hold_seconds: 7, exhale_seconds: 8 },
    { technique: '腹式呼吸', inhale_seconds: 4, hold_seconds: 2, exhale_seconds: 6 },
    { technique: '箱式呼吸', inhale_seconds: 4, hold_seconds: 4, exhale_seconds: 4 },
    { technique: '交替鼻孔呼吸', inhale_seconds: 4, hold_seconds: 4, exhale_seconds: 4 },
    { technique: '自然呼吸觉察', inhale_seconds: 3, hold_seconds: 0, exhale_seconds: 3 },
  ];
  const breath = pick(rng, breathTechniques);
  const totalBreathSec = (breath.inhale_seconds + breath.hold_seconds + breath.exhale_seconds);
  const cycles = Math.max(3, Math.round((duration * 60 * 0.4) / totalBreathSec));

  const phaseNames = ['准备与调息', '专注引导', '深度放松', '核心练习', '温和回归'];
  const phaseInstructions = [
    '找到一个舒适的坐姿，轻轻闭上眼睛，将注意力带到呼吸上',
    '让思绪如云朵般飘过，不评判不执着，只是觉察',
    '感受身体每一个细胞的放松，从头顶到脚趾逐渐释放紧张',
    '将注意力集中在当下的体验中，不带任何期待地觉察',
    '慢慢加深呼吸，轻轻活动手指脚趾，准备好回到当下',
  ];
  const phaseGuidances = [
    '保持脊柱自然挺直，双肩放松下沉，嘴角微微上扬',
    '当发现走神时，温柔地将注意力带回呼吸，这是正常的',
    '释放所有不需要紧抓的想法，让它们自由来去',
    '接纳此刻的一切体验——无论是舒适还是不适',
    '保持觉察的惯性，将这份平静带入接下来的生活',
  ];
  const phaseCount = Math.min(5, Math.max(3, Math.round(duration / 5)));
  const phases: Array<{ phase: string; duration_minutes: number; instruction: string; guidance: string }> = [];
  let remainingDur = duration;
  for (let i = 0; i < phaseCount; i++) {
    const isLast = i === phaseCount - 1;
    const phaseDur = isLast ? remainingDur : Math.round(remainingDur / (phaseCount - i));
    remainingDur -= phaseDur;
    phases.push({ phase: phaseNames[i], duration_minutes: phaseDur, instruction: phaseInstructions[i], guidance: phaseGuidances[i] });
  }

  const bodyParts = [
    { body_part: '头顶与头皮', action: '觉察并释放紧张', duration_seconds: 15 },
    { body_part: '眉心与眼周', action: '放松平滑眉心', duration_seconds: 15 },
    { body_part: '下颌与颈部', action: '微微张开嘴释放下颌紧张', duration_seconds: 20 },
    { body_part: '双肩与上背', action: '让肩膀远离耳朵下沉', duration_seconds: 20 },
    { body_part: '双臂与双手', action: '感受手臂的重量完全放松', duration_seconds: 20 },
    { body_part: '胸腔与腹部', action: '随呼吸自然起伏', duration_seconds: 20 },
    { body_part: '下背与髋部', action: '释放腰椎的压力', duration_seconds: 20 },
    { body_part: '大腿与膝盖', action: '让双腿完全放松', duration_seconds: 15 },
    { body_part: '小腿与双脚', action: '感受与地面的连接', duration_seconds: 15 },
  ];

  const ambientElements = [
    { element: '背景音', suggestion: pick(rng, ['白噪音(雨声)', '颂钵音疗', '自然森林音', '溪流声', '静音']), purpose: '遮蔽环境干扰，辅助专注' },
    { element: '香薰', suggestion: pick(rng, ['薰衣草精油', '檀香', '乳香', '不需要香薰']), purpose: '通过嗅觉通道激活副交感神经' },
    { element: '光线', suggestion: pick(rng, ['柔和暖光', '自然光', '暗光环境']), purpose: '减少视觉刺激，帮助神经系统平静' },
    { element: '姿势', suggestion: pick(rng, ['盘腿坐', '椅子上正坐', '仰躺']), purpose: '平衡舒适与警觉，避免沉睡' },
  ];

  const reflectionPrompts = [
    '这次练习中，你注意到了什么新的感受？',
    '如果给你的内心状态起个名字，会是什么？',
    '今天你想放下的一件事是什么？',
    '此刻你的身体哪个部位最需要关怀？',
    '这次练习前后，你的内心发生了什么微妙变化？',
  ];
  const gratitudes = [
    '列出今天三件让你感恩的小事',
    '回想一个让你感到温暖的瞬间',
    '对身体的某个部分表达感谢',
    '感谢自己愿意花时间照顾内心',
  ];

  return {
    session_overview: { type: medType, duration_minutes: duration, level, focus, goal: `通过${medType}练习，达到${focus}的目标` },
    breathing_guide: { ...breath, cycles },
    script_phases: phases,
    body_scan: bodyParts,
    ambient_recommendations: ambientElements,
    closing_ritual: { reflection_prompt: pick(rng, reflectionPrompts), gratitude_exercise: pick(rng, gratitudes), transition_advice: '缓慢睁眼，保持觉察状态，将正念带入下一个活动' },
    disclaimer: DISCLAIMER,
  };
}

function formatMeditation(r: MeditationResult): string {
  let s = '=== MindfulAI - 冥想会话生成报告 ===\n\n';
  s += '【会话概要】\n';
  s += `  类型: ${r.session_overview.type}\n`;
  s += `  时长: ${r.session_overview.duration_minutes}分钟\n`;
  s += `  级别: ${r.session_overview.level}\n`;
  s += `  焦点: ${r.session_overview.focus}\n`;
  s += `  目标: ${r.session_overview.goal}\n\n`;
  s += '【呼吸指南】\n';
  s += `  技巧: ${r.breathing_guide.technique}\n`;
  s += `  吸气${r.breathing_guide.inhale_seconds}秒 - 屏息${r.breathing_guide.hold_seconds}秒 - 呼气${r.breathing_guide.exhale_seconds}秒\n`;
  s += `  建议循环: ${r.breathing_guide.cycles}次\n\n`;
  s += '【脚本阶段】\n';
  r.script_phases.forEach((p, i) => { s += `  ${i + 1}. ${p.phase} (${p.duration_minutes}分钟)\n     ${p.instruction}\n     引导: ${p.guidance}\n`; });
  s += '\n【身体扫描】\n';
  r.body_scan.forEach(b => { s += `  ${b.body_part}: ${b.action} (${b.duration_seconds}秒)\n`; });
  s += '\n【环境建议】\n';
  r.ambient_recommendations.forEach(a => { s += `  ${a.element}: ${a.suggestion} (${a.purpose})\n`; });
  s += '\n【结束仪式】\n';
  s += `  反思: ${r.closing_ritual.reflection_prompt}\n`;
  s += `  感恩: ${r.closing_ritual.gratitude_exercise}\n`;
  s += `  过渡: ${r.closing_ritual.transition_advice}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. mood_pattern_analyst
// ============================================================
export interface MoodAnalystInput {
  tracking_period_days?: number;
  avg_mood_score?: number;
  mood_variability?: number;
  dominant_emotions?: string[];
  sleep_avg_hours?: number;
  exercise_frequency_weekly?: number;
  stress_level_avg?: number;
  social_interaction_level?: string;
}

export interface MoodAnalystResult {
  mood_overview: { period_days: number; avg_score: number; variability: number; trend: string; dominant_emotion: string };
  pattern_analysis: Array<{ pattern: string; description: string; frequency: string; impact: string }>;
  correlation_insights: Array<{ factor: string; correlation: string; strength: number; insight: string }>;
  weekly_breakdown: Array<{ day: string; mood_score: number; energy_level: number; key_event: string }>;
  triggers_and_protectors: { triggers: Array<{ trigger: string; severity: string; occurrence: string }>; protectors: Array<{ protector: string; effectiveness: string; recommendation: string }> };
  recommendation: { summary: string; priority_actions: string[]; monitoring_suggestion: string };
  disclaimer: string;
}

function analyzeMoodPatterns(data: MoodAnalystInput): MoodAnalystResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const period = data.tracking_period_days ?? Math.round(7 + rng() * 23);
  const avgMood = data.avg_mood_score ?? round(4 + rng() * 4, 1);
  const variability = data.mood_variability ?? round(0.5 + rng() * 2.5, 1);
  const sleepAvg = data.sleep_avg_hours ?? round(5.5 + rng() * 3, 1);
  const stressAvg = data.stress_level_avg ?? round(3 + rng() * 5, 1);

  const trend = variability > 2 ? '波动较大' : avgMood > 7 ? '整体积极' : avgMood > 5 ? '稳中有升' : '需要关注';
  const emotions = ['平静', '焦虑', '愉悦', '疲惫', '感恩', '沮丧', '充满希望', '烦躁', '满足', '孤独'];
  const dominant = data.dominant_emotions ? data.dominant_emotions[0] : pick(rng, emotions);

  const patterns = [
    { pattern: '晨间低谷', description: '早晨醒来后2小时内情绪得分显著低于日均', frequency: '约60%的工作日', impact: '影响上午工作效率和人际互动' },
    { pattern: '午后回升', description: '午餐后情绪逐渐回升，下午3-5点达峰值', frequency: '约55%的追踪日', impact: '下午是处理创意性任务的黄金时段' },
    { pattern: '夜间反思', description: '睡前1-2小时出现过度思考倾向', frequency: '约45%的夜晚', impact: '可能影响入睡速度和睡眠质量' },
    { pattern: '周末效应', description: '周末情绪得分平均比工作日高0.8分', frequency: '规律性出现', impact: '提示工作相关压力是主要影响因素' },
    { pattern: '社交后反弹', description: '高强度社交后1-2天内情绪下降', frequency: '约30%的社交事件后', impact: '需要更多独处时间恢复能量' },
  ];
  const selectedPatterns = patterns.slice(0, Math.round(3 + rng() * 2));

  const correlations = [
    { factor: '睡眠时长', correlation: avgMood > 6 ? '正相关' : '弱正相关', strength: round(0.4 + rng() * 0.4, 2), insight: `平均睡眠${sleepAvg}小时，睡眠充足时情绪平均提升${round(0.5 + rng() * 1.5, 1)}分` },
    { factor: '运动频率', correlation: '正相关', strength: round(0.3 + rng() * 0.5, 2), insight: '每周3次以上中等强度运动与积极情绪显著相关' },
    { factor: '压力水平', correlation: '负相关', strength: round(0.5 + rng() * 0.4, 2), insight: `平均压力水平${stressAvg}/10，高压日情绪得分下降约${round(1 + rng() * 2, 1)}分` },
    { factor: '社交互动', correlation: '正相关', strength: round(0.2 + rng() * 0.5, 2), insight: '高质量社交比社交频率对情绪的影响更大' },
    { factor: '天气/光照', correlation: '弱正相关', strength: round(0.1 + rng() * 0.3, 2), insight: '光照充足的日子情绪得分略有提升' },
  ];
  const selectedCorrelations = correlations.slice(0, Math.round(3 + rng() * 2));

  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const keyEvents = ['工作截止日期', '重要会议', '与朋友聚餐', '运动锻炼', '独处时间', '家庭时光', '学习新技能', '长睡一晚', '冥想练习', '无特别事件'];
  const weeklyBreakdown = dayNames.map(day => ({
    day,
    mood_score: round(Math.max(1, Math.min(10, avgMood + (rng() - 0.5) * variability * 2)), 1),
    energy_level: round(Math.max(1, Math.min(10, 5 + (rng() - 0.5) * 4)), 1),
    key_event: pick(rng, keyEvents),
  }));

  const triggers = [
    { trigger: '工作压力/截止日期', severity: '高', occurrence: '约每周2-3次' },
    { trigger: '人际冲突', severity: '中高', occurrence: '约每周1次' },
    { trigger: '睡眠不足', severity: '中', occurrence: '约每周2次' },
    { trigger: '负面自我对话', severity: '中', occurrence: '约每天1-2次' },
  ];
  const protectors = [
    { protector: '规律运动', effectiveness: '高', recommendation: '每周保持3-5次中等强度运动' },
    { protector: '充足睡眠', effectiveness: '高', recommendation: '固定睡眠时间，目标7-8小时' },
    { protector: '正念练习', effectiveness: '中高', recommendation: '每日10分钟正念冥想' },
    { protector: '社交支持', effectiveness: '中', recommendation: '定期与信任的朋友交流' },
  ];

  const priorityActions = [
    '建立每日情绪记录习惯，识别个人触发因素',
    '在情绪低谷时段安排低难度任务',
    '制定睡眠改善计划，固定就寝时间',
    '学习认知重评技术，调整自动负性思维',
    '增加户外活动时间，提升光照暴露',
  ];

  return {
    mood_overview: { period_days: period, avg_score: avgMood, variability, trend, dominant_emotion: dominant },
    pattern_analysis: selectedPatterns,
    correlation_insights: selectedCorrelations,
    weekly_breakdown: weeklyBreakdown,
    triggers_and_protectors: { triggers, protectors },
    recommendation: { summary: `过去${period}天情绪${trend}，主导情绪为「${dominant}」。建议重点关注触发因素管理和保护因素强化。`, priority_actions: priorityActions.slice(0, Math.round(3 + rng() * 2)), monitoring_suggestion: '建议继续追踪2-4周，重点关注已识别的模式是否稳定存在' },
    disclaimer: DISCLAIMER,
  };
}

function formatMoodAnalyst(r: MoodAnalystResult): string {
  let s = '=== MindfulAI - 情绪模式分析报告 ===\n\n';
  s += '【情绪概览】\n';
  s += `  追踪周期: ${r.mood_overview.period_days}天\n`;
  s += `  平均得分: ${r.mood_overview.avg_score}/10\n`;
  s += `  波动性: ${r.mood_overview.variability}\n`;
  s += `  趋势: ${r.mood_overview.trend}\n`;
  s += `  主导情绪: ${r.mood_overview.dominant_emotion}\n\n`;
  s += '【模式分析】\n';
  r.pattern_analysis.forEach(p => { s += `  ${p.pattern}: ${p.description}\n    频率:${p.frequency} | 影响:${p.impact}\n`; });
  s += '\n【相关洞察】\n';
  r.correlation_insights.forEach(c => { s += `  ${c.factor}: ${c.correlation}(强度${c.strength})\n    ${c.insight}\n`; });
  s += '\n【周度分解】\n';
  r.weekly_breakdown.forEach(w => { s += `  ${w.day}: 情绪${w.mood_score}/10 精力${w.energy_level}/10 | ${w.key_event}\n`; });
  s += '\n【触发因素】\n';
  r.triggers_and_protectors.triggers.forEach(t => { s += `  [${t.severity}] ${t.trigger} — ${t.occurrence}\n`; });
  s += '【保护因素】\n';
  r.triggers_and_protectors.protectors.forEach(p => { s += `  [${p.effectiveness}] ${p.protector}: ${p.recommendation}\n`; });
  s += '\n【建议】\n';
  s += `  总结: ${r.recommendation.summary}\n`;
  s += '  优先行动:\n';
  r.recommendation.priority_actions.forEach((a, i) => { s += `    ${i + 1}. ${a}\n`; });
  s += `  监控建议: ${r.recommendation.monitoring_suggestion}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. cbt_exercise_creator
// ============================================================
export interface CbtInput {
  target_issue?: string;
  severity_level?: string;
  preferred_format?: string;
  session_goal?: string;
  cognitive_distortions?: string[];
  experience_level?: string;
}

export interface CbtResult {
  exercise_overview: { target_issue: string; severity: string; format: string; goal: string; estimated_minutes: number };
  thought_record: { situation: string; automatic_thought: string; emotion: string; emotion_intensity: number; evidence_for: string; evidence_against: string; balanced_thought: string; re_rated_intensity: number };
  cognitive_distortions: Array<{ distortion: string; description: string; example: string; reframe_strategy: string }>;
  behavioral_experiment: { hypothesis: string; experiment_design: string; predicted_outcome: string; actual_outcome_prompt: string; learning_prompt: string };
  coping_statements: string[];
  homework_assignment: { task: string; frequency: string; tracking_method: string; review_date: string };
  disclaimer: string;
}

function createCbtExercise(data: CbtInput): CbtResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const issue = data.target_issue || pick(rng, ['社交焦虑', '广泛性焦虑', '抑郁情绪', '愤怒管理', '低自尊', '完美主义']);
  const severity = data.severity_level || pick(rng, ['轻度', '中度', '中重度']);
  const format = data.preferred_format || pick(rng, ['思维记录表', '行为实验', '认知重构', '暴露阶梯']);

  const thoughtRecords = [
    { situation: '在会议上发言时感到紧张', automatic_thought: '所有人都在评判我，我会出丑', emotion: '焦虑', emotion_intensity: 8, evidence_for: '有时确实有人会提出质疑', evidence_against: '大多数人是友善的，之前发言也没有出丑，同事还给了积极反馈', balanced_thought: '即使有人质疑也是正常的讨论，我有能力应对提问' },
    { situation: '收到上级的修改意见', automatic_thought: '我做得很差，我能力不够', emotion: '沮丧', emotion_intensity: 7, evidence_for: '确实需要修改', evidence_against: '修改意见是正常的反馈流程，不等于否定我的能力，上次也得到了认可', balanced_thought: '反馈是成长的机会，不代表我能力不足' },
    { situation: '邀请朋友聚会被婉拒', automatic_thought: '他们不喜欢我，我不值得被邀请', emotion: '伤心', emotion_intensity: 6, evidence_for: '这次被拒绝了', evidence_against: '朋友解释了真实原因，之前我们相处很愉快，他们主动约过我', balanced_thought: '一次拒绝不等于不被喜欢，每个人都有自己的安排' },
    { situation: '面对一项新任务', automatic_thought: '我肯定会搞砸，还是不要尝试了', emotion: '恐惧', emotion_intensity: 7, evidence_for: '之前确实犯过错', evidence_against: '我已经完成了许多新任务，有学习能力，可以寻求帮助', balanced_thought: '新任务有挑战是正常的，我有能力学习和应对' },
  ];
  const record = pick(rng, thoughtRecords);
  const reRated = Math.max(1, record.emotion_intensity - Math.round(2 + rng() * 3));

  const distortions = [
    { distortion: '全或无思维', description: '以非黑即白的方式看待事物，忽视中间地带', example: '「如果这个项目不完美，我就是个失败者」', reframe_strategy: '用0-100的尺度评估，寻找中间状态的可能性' },
    { distortion: '读心术', description: '假设自己知道别人对自己的负面评价', example: '「他一定觉得我很无聊」', reframe_strategy: '列出支持与反对这个想法的证据，寻找其他可能解释' },
    { distortion: '灾难化', description: '将事情的最坏结果视为必然发生', example: '「如果我搞砸了演讲，我的职业生涯就完了」', reframe_strategy: '评估最坏情况发生的概率，以及即使发生你能否应对' },
    { distortion: '过度概括', description: '从单一事件得出普遍性结论', example: '「这次约会不顺利，我永远不会找到伴侣」', reframe_strategy: '将事件视为独立的一次经历，而非定义你的全部证据' },
    { distortion: '情绪推理', description: '因为感觉如此就认为事实如此', example: '「我感到无力，所以我一定是个无能的人」', reframe_strategy: '区分感受与事实，情绪是信号而非证据' },
    { distortion: '应该思维', description: '用严格的「应该」或「必须」来要求自己', example: '「我应该总是表现出色，不应该犯错」', reframe_strategy: '将「应该」替换为「希望」或「可以」，允许灵活性' },
  ];
  const selectedDistortions = distortions.slice(0, Math.round(3 + rng() * 2));

  const experiments = [
    { hypothesis: '如果我主动发言，别人会嘲笑我', experiment_design: '在下次小组讨论中主动发言一次，观察他人反应', predicted_outcome: '至少一人会表现出不耐烦或嘲笑', actual_outcome_prompt: '记录实际发生的情况：他人的表情、言语、后续互动', learning_prompt: '实际结果与预测有什么不同？这对你的信念意味着什么？' },
    { hypothesis: '如果我不反复检查，一定会出错', experiment_design: '选择一项低风险任务只检查一次就提交', predicted_outcome: '会出现明显错误并受到批评', actual_outcome_prompt: '记录是否真的出现了错误，错误的严重程度如何', learning_prompt: '一次检查的结果如何？你的预测准确吗？' },
    { hypothesis: '如果我拒绝别人，他们就不会喜欢我', experiment_design: '温和地拒绝一个不合理的请求', predicted_outcome: '对方会生气并疏远我', actual_outcome_prompt: '记录对方的反应和后续关系变化', learning_prompt: '拒绝后关系发生了什么变化？对方是否尊重了你的边界？' },
  ];
  const experiment = pick(rng, experiments);

  const copingStatements = [
    '我有能力应对这个挑战，就像过去一样',
    '情绪是暂时的，它会来也会走',
    '我不需要完美，我只需要尽力',
    '我的价值不由单一事件定义',
    '感到害怕是正常的，我可以选择行动',
    '我已经度过了很多困难时刻，这次也可以',
    '允许自己不完美，这是人性的一部分',
    '每一个小进步都值得被看见',
  ];
  const selectedCoping = copingStatements.slice(0, Math.round(4 + rng() * 3));

  const homeworkTasks = [
    { task: '每天记录一次自动思维，使用思维记录表', frequency: '每日1次', tracking_method: '使用手机备忘录或纸质日记', review_date: '1周后' },
    { task: '选择一个行为实验并执行', frequency: '本周完成1次', tracking_method: '记录预测vs实际结果', review_date: '完成后立即' },
    { task: '练习认知重构，每天识别一个认知扭曲', frequency: '每日1次', tracking_method: '写下原想法和重构后的想法', review_date: '1周后' },
    { task: '朗读应对陈述并内化', frequency: '每日早晚各1次', tracking_method: '录音回放或默念', review_date: '2周后' },
  ];
  const homework = pick(rng, homeworkTasks);

  return {
    exercise_overview: { target_issue: issue, severity, format, goal: `通过${format}练习，缓解${issue}症状`, estimated_minutes: Math.round(15 + rng() * 30) },
    thought_record: { ...record, re_rated_intensity: reRated },
    cognitive_distortions: selectedDistortions,
    behavioral_experiment: experiment,
    coping_statements: selectedCoping,
    homework_assignment: homework,
    disclaimer: DISCLAIMER,
  };
}

function formatCbt(r: CbtResult): string {
  let s = '=== MindfulAI - CBT练习生成报告 ===\n\n';
  s += '【练习概要】\n';
  s += `  目标问题: ${r.exercise_overview.target_issue}\n`;
  s += `  严重程度: ${r.exercise_overview.severity}\n`;
  s += `  练习形式: ${r.exercise_overview.format}\n`;
  s += `  目标: ${r.exercise_overview.goal}\n`;
  s += `  预计时长: ${r.exercise_overview.estimated_minutes}分钟\n\n`;
  s += '【思维记录】\n';
  s += `  情境: ${r.thought_record.situation}\n`;
  s += `  自动思维: ${r.thought_record.automatic_thought}\n`;
  s += `  情绪: ${r.thought_record.emotion} (强度${r.thought_record.emotion_intensity}/10)\n`;
  s += `  支持证据: ${r.thought_record.evidence_for}\n`;
  s += `  反对证据: ${r.thought_record.evidence_against}\n`;
  s += `  平衡思维: ${r.thought_record.balanced_thought}\n`;
  s += `  重评强度: ${r.thought_record.re_rated_intensity}/10\n\n`;
  s += '【认知扭曲识别】\n';
  r.cognitive_distortions.forEach(d => { s += `  ${d.distortion}: ${d.description}\n    示例: ${d.example}\n    重构策略: ${d.reframe_strategy}\n`; });
  s += '\n【行为实验】\n';
  s += `  假设: ${r.behavioral_experiment.hypothesis}\n`;
  s += `  设计: ${r.behavioral_experiment.experiment_design}\n`;
  s += `  预测: ${r.behavioral_experiment.predicted_outcome}\n`;
  s += `  记录提示: ${r.behavioral_experiment.actual_outcome_prompt}\n`;
  s += `  学习提示: ${r.behavioral_experiment.learning_prompt}\n\n`;
  s += '【应对陈述】\n';
  r.coping_statements.forEach((c, i) => { s += `  ${i + 1}. ${c}\n`; });
  s += '\n【家庭作业】\n';
  s += `  任务: ${r.homework_assignment.task}\n`;
  s += `  频率: ${r.homework_assignment.frequency}\n`;
  s += `  追踪: ${r.homework_assignment.tracking_method}\n`;
  s += `  复习: ${r.homework_assignment.review_date}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. stress_management_coach
// ============================================================
export interface StressCoachInput {
  current_stress_level?: number;
  primary_stressors?: string[];
  coping_methods_used?: string[];
  physical_symptoms?: string[];
  work_life_balance_score?: number;
  support_system?: string;
  stress_duration_weeks?: number;
}

export interface StressCoachResult {
  stress_assessment: { current_level: number; category: string; duration_weeks: number; primary_stressor: string; physical_impact: string };
  stressor_analysis: Array<{ stressor: string; controllability: string; urgency: string; impact_level: string; strategy: string }>;
  coping_inventory: { current_methods: Array<{ method: string; effectiveness: string; recommendation: string }>; new_methods: Array<{ method: string; description: string; how_to_start: string }> };
  relaxation_plan: Array<{ technique: string; duration_minutes: string; frequency: string; when_to_use: string }>;
  lifestyle_adjustments: Array<{ area: string; current_state: string; target_state: string; action_steps: string[] }>;
  emergency_protocol: { warning_signs: string[]; immediate_actions: string[]; when_to_seek_help: string };
  disclaimer: string;
}

function coachStressManagement(data: StressCoachInput): StressCoachResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const stressLevel = data.current_stress_level ?? Math.round(4 + rng() * 5);
  const duration = data.stress_duration_weeks ?? Math.round(2 + rng() * 10);
  const category = stressLevel >= 8 ? '高度压力' : stressLevel >= 6 ? '中度压力' : stressLevel >= 4 ? '轻度压力' : '正常范围';

  const stressors = [
    { stressor: '工作负荷过重', controllability: '部分可控', urgency: '高', impact_level: '高', strategy: '任务优先级排序，学会说「不」，与上级沟通工作量' },
    { stressor: '人际关系冲突', controllability: '部分可控', urgency: '中', impact_level: '中高', strategy: '学习非暴力沟通，设定健康边界，寻求调解' },
    { stressor: '财务压力', controllability: '部分可控', urgency: '高', impact_level: '高', strategy: '制定预算计划，寻求财务咨询，探索增收途径' },
    { stressor: '健康担忧', controllability: '部分可控', urgency: '中', impact_level: '中高', strategy: '定期体检，建立健康习惯，学习疾病知识减少未知恐惧' },
    { stressor: '未来不确定性', controllability: '低', urgency: '低', impact_level: '中', strategy: '专注可控因素，练习接纳不确定性，建立应急预案' },
    { stressor: '完美主义倾向', controllability: '高', urgency: '低', impact_level: '中', strategy: '设定「足够好」标准，练习自我接纳，认知重构' },
  ];
  const selectedStressors = stressors.slice(0, Math.round(3 + rng() * 2));

  const currentMethods = [
    { method: '运动', effectiveness: pick(rng, ['高', '中']), recommendation: '保持规律运动习惯，每周至少3次' },
    { method: '社交', effectiveness: pick(rng, ['高', '中']), recommendation: '主动联系朋友，不要孤立自己' },
    { method: '娱乐', effectiveness: pick(rng, ['中', '低']), recommendation: '选择主动休闲而非被动刷屏' },
    { method: '饮食', effectiveness: pick(rng, ['中', '低']), recommendation: '避免用暴饮暴食应对压力' },
  ];
  const newMethods = [
    { method: '渐进性肌肉放松', description: '系统性地紧张和放松各肌肉群', how_to_start: '从脚部开始，每组肌肉紧张5秒后放松10秒' },
    { method: '4-7-8呼吸法', description: '通过特定节奏呼吸激活副交感神经', how_to_start: '吸气4秒、屏息7秒、呼气8秒，重复4轮' },
    { method: '正念行走', description: '将注意力集中在行走的感官体验上', how_to_start: '每天10分钟慢走，专注脚底触地的感觉' },
    { method: '感恩日记', description: '每天记录三件感恩的事', how_to_start: '睡前花5分钟写下当天值得感恩的事' },
  ];

  const relaxationPlan = [
    { technique: '深呼吸练习', duration_minutes: '5-10分钟', frequency: '每日2-3次', when_to_use: '感到紧张或焦虑时立即使用' },
    { technique: '身体扫描', duration_minutes: '15-20分钟', frequency: '每日1次', when_to_use: '睡前或午休时' },
    { technique: '渐进性肌肉放松', duration_minutes: '15-20分钟', frequency: '每日1次', when_to_use: '身体感到紧绷时' },
    { technique: '引导想象', duration_minutes: '10-15分钟', frequency: '需要时使用', when_to_use: '需要快速平静时' },
    { technique: '正念冥想', duration_minutes: '10-20分钟', frequency: '每日1次', when_to_use: '固定时间练习形成习惯' },
  ];

  const lifestyleAreas = [
    { area: '睡眠', current_state: '可能不足或质量不佳', target_state: '7-8小时高质量睡眠', action_steps: ['固定就寝和起床时间', '睡前1小时远离屏幕', '创造凉爽黑暗的睡眠环境'] },
    { area: '运动', current_state: '可能缺乏规律运动', target_state: '每周150分钟中等强度运动', action_steps: ['选择喜欢的运动形式', '从每天10分钟开始', '找运动伙伴增加动力'] },
    { area: '社交', current_state: '可能因压力而退缩', target_state: '保持有意义的社交连接', action_steps: ['每周至少一次深度交流', '主动寻求支持', '参加兴趣社群'] },
    { area: '工作节奏', current_state: '可能持续高强度', target_state: '有节奏的工作与休息', action_steps: ['使用番茄工作法', '每小时起身活动', '设定工作边界'] },
  ];

  const warningSigns = [
    '持续失眠或睡眠模式显著改变',
    '频繁头痛、胃痛或其他身体不适',
    '难以集中注意力或做决定',
    '对平时喜欢的事物失去兴趣',
    '容易哭泣或情绪失控',
    '增加使用酒精或其他物质',
  ];
  const immediateActions = [
    '停止当前活动，进行3次深呼吸',
    '到户外散步5-10分钟',
    '联系信任的朋友或家人',
    '使用冰水刺激（冷水洗脸或握冰块）激活潜水反射',
    '写下此刻的感受和想法',
  ];

  return {
    stress_assessment: { current_level: stressLevel, category, duration_weeks: duration, primary_stressor: selectedStressors[0].stressor, physical_impact: stressLevel >= 7 ? '已出现明显躯体症状' : stressLevel >= 5 ? '有轻度躯体反应' : '躯体影响较小' },
    stressor_analysis: selectedStressors,
    coping_inventory: { current_methods: currentMethods.slice(0, Math.round(2 + rng() * 2)), new_methods: newMethods.slice(0, Math.round(2 + rng() * 2)) },
    relaxation_plan: relaxationPlan.slice(0, Math.round(3 + rng() * 2)),
    lifestyle_adjustments: lifestyleAreas.slice(0, Math.round(3 + rng() * 1)),
    emergency_protocol: { warning_signs: warningSigns.slice(0, Math.round(4 + rng() * 2)), immediate_actions: immediateActions.slice(0, Math.round(3 + rng() * 2)), when_to_seek_help: '当压力持续超过2周且影响日常功能，或出现自伤想法时，请立即寻求专业帮助' },
    disclaimer: DISCLAIMER,
  };
}

function formatStressCoach(r: StressCoachResult): string {
  let s = '=== MindfulAI - 压力管理教练报告 ===\n\n';
  s += '【压力评估】\n';
  s += `  当前水平: ${r.stress_assessment.current_level}/10 (${r.stress_assessment.category})\n`;
  s += `  持续时长: ${r.stress_assessment.duration_weeks}周\n`;
  s += `  主要压力源: ${r.stress_assessment.primary_stressor}\n`;
  s += `  躯体影响: ${r.stress_assessment.physical_impact}\n\n`;
  s += '【压力源分析】\n';
  r.stressor_analysis.forEach(st => { s += `  ${st.stressor}: 可控性${st.controllability} | 紧迫性${st.urgency} | 影响${st.impact_level}\n    策略: ${st.strategy}\n`; });
  s += '\n【应对资源盘点 - 现有方法】\n';
  r.coping_inventory.current_methods.forEach(c => { s += `  ${c.method} [效果:${c.effectiveness}] — ${c.recommendation}\n`; });
  s += '【应对资源盘点 - 新方法推荐】\n';
  r.coping_inventory.new_methods.forEach(n => { s += `  ${n.method}: ${n.description}\n    如何开始: ${n.how_to_start}\n`; });
  s += '\n【放松计划】\n';
  r.relaxation_plan.forEach(rp => { s += `  ${rp.technique}: ${rp.duration_minutes} | ${rp.frequency} | 适用场景: ${rp.when_to_use}\n`; });
  s += '\n【生活方式调整】\n';
  r.lifestyle_adjustments.forEach(l => { s += `  ${l.area}: ${l.current_state} → ${l.target_state}\n`; l.action_steps.forEach((a, i) => { s += `    ${i + 1}. ${a}\n`; }); });
  s += '\n【应急方案】\n';
  s += '  预警信号:\n';
  r.emergency_protocol.warning_signs.forEach(w => { s += `    • ${w}\n`; });
  s += '  即时行动:\n';
  r.emergency_protocol.immediate_actions.forEach(a => { s += `    • ${a}\n`; });
  s += `  求助时机: ${r.emergency_protocol.when_to_seek_help}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. sleep_quality_optimizer
// ============================================================
export interface SleepOptimizerInput {
  avg_sleep_hours?: number;
  sleep_onset_minutes?: number;
  wake_episodes_nightly?: number;
  sleep_quality_score?: number;
  bedtime?: string;
  wake_time?: string;
  caffeine_intake_mg?: number;
  screen_time_before_bed_minutes?: number;
  exercise_timing?: string;
  bedroom_environment?: string;
}

export interface SleepOptimizerResult {
  sleep_assessment: { total_sleep_hours: number; sleep_efficiency_pct: number; onset_minutes: number; quality_score: number; sleep_debt_hours: number; grade: string };
  sleep_hygiene_audit: Array<{ factor: string; current_status: string; ideal_status: string; priority: string; recommendation: string }>;
  circadian_analysis: { chronotype: string; optimal_bedtime: string; optimal_wake_time: string; light_exposure_advice: string; meal_timing_advice: string };
  wind_down_routine: Array<{ time_before_bed: string; activity: string; purpose: string }>;
  sleep_environment: Array<{ element: string; current_ideal: string; adjustment: string }>;
  two_week_plan: Array<{ week: number; focus: string; daily_actions: string[] }>;
  disclaimer: string;
}

function optimizeSleep(data: SleepOptimizerInput): SleepOptimizerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const totalSleep = data.avg_sleep_hours ?? round(5.5 + rng() * 2.5, 1);
  const onsetMin = data.sleep_onset_minutes ?? Math.round(10 + rng() * 40);
  const wakeEpisodes = data.wake_episodes_nightly ?? Math.round(rng() * 3);
  const qualityScore = data.sleep_quality_score ?? round(4 + rng() * 4, 1);
  const caffeine = data.caffeine_intake_mg ?? Math.round(50 + rng() * 250);
  const screenTime = data.screen_time_before_bed_minutes ?? Math.round(15 + rng() * 90);

  const timeInBed = totalSleep + (onsetMin / 60) + (wakeEpisodes * 0.1);
  const efficiency = round((totalSleep / timeInBed) * 100, 1);
  const sleepDebt = round(Math.max(0, 8 - totalSleep), 1);
  const grade = qualityScore >= 8 ? '优秀' : qualityScore >= 6.5 ? '良好' : qualityScore >= 5 ? '一般' : '需改善';

  const hygieneFactors = [
    { factor: '睡眠时长', current_status: `${totalSleep}小时`, ideal_status: '7-9小时', priority: totalSleep < 7 ? '高' : '中', recommendation: totalSleep < 7 ? '逐步提前就寝时间，每周提前15分钟' : '保持当前时长，关注质量提升' },
    { factor: '入睡时间', current_status: `${onsetMin}分钟`, ideal_status: '<20分钟', priority: onsetMin > 30 ? '高' : '中', recommendation: onsetMin > 30 ? '建立固定睡前仪式，避免睡前刺激' : '继续保持良好习惯' },
    { factor: '咖啡因摄入', current_status: `${caffeine}mg/天`, ideal_status: '<200mg且下午2点后不摄入', priority: caffeine > 200 ? '高' : '低', recommendation: caffeine > 200 ? '逐步减少咖啡因，下午2点后避免摄入' : '当前摄入量合理' },
    { factor: '屏幕时间', current_status: `睡前${screenTime}分钟`, ideal_status: '睡前60分钟无屏幕', priority: screenTime > 30 ? '高' : '中', recommendation: screenTime > 30 ? '设置睡前1小时无屏幕时间，使用夜间模式' : '继续保持' },
    { factor: '睡眠环境', current_status: data.bedroom_environment || '待评估', ideal_status: '凉爽(18-22°C)、黑暗、安静', priority: '中', recommendation: '使用遮光窗帘，保持室温适宜，必要时使用白噪音' },
    { factor: '作息规律', current_status: '待评估', ideal_status: '每天固定就寝和起床时间(包括周末)', priority: '高', recommendation: '设定固定睡眠时间，周末偏差不超过1小时' },
  ];

  const chronotypes = ['早鸟型(晨型人)', '中间型', '夜猫型(晚型人)'];
  const chronotype = pick(rng, chronotypes);
  const bedtimeMap: Record<string, string> = { '早鸟型(晨型人)': '22:00-22:30', '中间型': '22:30-23:00', '夜猫型(晚型人)': '23:00-23:30' };
  const wakeMap: Record<string, string> = { '早鸟型(晨型人)': '06:00-06:30', '中间型': '06:30-07:00', '夜猫型(晚型人)': '07:00-07:30' };

  const windDown = [
    { time_before_bed: '3小时', activity: '完成最后一餐', purpose: '避免消化系统活跃影响睡眠' },
    { time_before_bed: '2小时', activity: '完成运动(如需要)', purpose: '运动后体温下降有助于入睡' },
    { time_before_bed: '1.5小时', activity: '洗热水澡', purpose: '体温先升后降触发睡意' },
    { time_before_bed: '1小时', activity: '关闭电子屏幕', purpose: '减少蓝光抑制褪黑素分泌' },
    { time_before_bed: '30分钟', activity: '轻柔拉伸或阅读', purpose: '帮助身心从活跃状态过渡' },
    { time_before_bed: '15分钟', activity: '呼吸练习或冥想', purpose: '激活副交感神经，准备入睡' },
  ];

  const environmentElements = [
    { element: '温度', current_ideal: '18-22°C为佳', adjustment: '使用空调或被子调节，偏凉更利于深睡眠' },
    { element: '光线', current_ideal: '完全黑暗', adjustment: '使用遮光窗帘，关闭所有光源，必要时眼罩' },
    { element: '声音', current_ideal: '安静或稳定白噪音', adjustment: '使用耳塞或白噪音机屏蔽突发噪音' },
    { element: '床品', current_ideal: '舒适支撑', adjustment: '床垫硬度适中，枕头高度合适' },
  ];

  const week1Actions = ['设定固定就寝和起床时间并严格执行', '下午2点后不再摄入咖啡因', '睡前1小时停止使用电子屏幕', '每天记录睡眠日志'];
  const week2Actions = ['建立完整的睡前放松仪式', '优化卧室环境(温度、光线、声音)', '增加日间户外光照时间30分钟', '评估第一周改变的效果并调整'];

  return {
    sleep_assessment: { total_sleep_hours: totalSleep, sleep_efficiency_pct: efficiency, onset_minutes: onsetMin, quality_score: qualityScore, sleep_debt_hours: sleepDebt, grade },
    sleep_hygiene_audit: hygieneFactors,
    circadian_analysis: { chronotype, optimal_bedtime: bedtimeMap[chronotype], optimal_wake_time: wakeMap[chronotype], light_exposure_advice: '早晨起床后30分钟内接受自然光照射，帮助校准生物钟', meal_timing_advice: '晚餐在就寝前3小时完成，避免过饱或过饿入睡' },
    wind_down_routine: windDown,
    sleep_environment: environmentElements,
    two_week_plan: [{ week: 1, focus: '建立基础睡眠卫生习惯', daily_actions: week1Actions }, { week: 2, focus: '深化优化与环境调整', daily_actions: week2Actions }],
    disclaimer: DISCLAIMER,
  };
}

function formatSleepOptimizer(r: SleepOptimizerResult): string {
  let s = '=== MindfulAI - 睡眠质量优化报告 ===\n\n';
  s += '【睡眠评估】\n';
  s += `  总睡眠: ${r.sleep_assessment.total_sleep_hours}小时\n`;
  s += `  睡眠效率: ${r.sleep_assessment.sleep_efficiency_pct}%\n`;
  s += `  入睡时间: ${r.sleep_assessment.onset_minutes}分钟\n`;
  s += `  质量评分: ${r.sleep_assessment.quality_score}/10\n`;
  s += `  睡眠负债: ${r.sleep_assessment.sleep_debt_hours}小时\n`;
  s += `  评级: ${r.sleep_assessment.grade}\n\n`;
  s += '【睡眠卫生审计】\n';
  r.sleep_hygiene_audit.forEach(h => { s += `  [${h.priority}] ${h.factor}: ${h.current_status} → 理想:${h.ideal_status}\n    建议: ${h.recommendation}\n`; });
  s += '\n【昼夜节律分析】\n';
  s += `  时型: ${r.circadian_analysis.chronotype}\n`;
  s += `  最佳就寝: ${r.circadian_analysis.optimal_bedtime}\n`;
  s += `  最佳起床: ${r.circadian_analysis.optimal_wake_time}\n`;
  s += `  光照建议: ${r.circadian_analysis.light_exposure_advice}\n`;
  s += `  进食时机: ${r.circadian_analysis.meal_timing_advice}\n\n`;
  s += '【睡前放松仪式】\n';
  r.wind_down_routine.forEach(w => { s += `  睡前${w.time_before_bed}: ${w.activity} (${w.purpose})\n`; });
  s += '\n【睡眠环境优化】\n';
  r.sleep_environment.forEach(e => { s += `  ${e.element}: ${e.current_ideal} — ${e.adjustment}\n`; });
  s += '\n【两周改善计划】\n';
  r.two_week_plan.forEach(wp => { s += `  第${wp.week}周: ${wp.focus}\n`; wp.daily_actions.forEach((a, i) => { s += `    ${i + 1}. ${a}\n`; }); });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. mindfulness_habit_builder
// ============================================================
export interface HabitBuilderInput {
  target_habit?: string;
  current_consistency_pct?: number;
  motivation_level?: number;
  available_time_daily_minutes?: number;
  preferred_reminder_time?: string;
  habit_duration_days?: number;
  past_attempts?: number;
  support_available?: string;
}

export interface HabitBuilderResult {
  habit_design: { target_habit: string; duration_days: number; daily_time_minutes: number; anchor_motivation: string; implementation_intention: string };
  stage_plan: Array<{ stage: string; days: string; focus: string; daily_action: string; success_criteria: string }>;
  obstacle_forecast: Array<{ obstacle: string; probability: string; prevention_strategy: string; recovery_protocol: string }>;
  tracking_system: { method: string; metrics: string[]; reward_schedule: string; accountability: string };
  motivation_boosters: Array<{ technique: string; description: string; when_to_apply: string }>;
  progress_milestones: Array<{ day: number; milestone: string; reward: string }>;
  disclaimer: string;
}

function buildMindfulnessHabit(data: HabitBuilderInput): HabitBuilderResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const habit = data.target_habit || pick(rng, ['每日冥想', '正念呼吸', '身体扫描', '感恩日记', '正念行走', '觉察练习']);
  const duration = data.habit_duration_days ?? 30;
  const dailyTime = data.available_time_daily_minutes ?? Math.round(5 + rng() * 15);

  const anchors = ['早晨起床后', '午餐前', '下班到家后', '晚餐后', '睡前'];
  const anchor = pick(rng, anchors);

  const stages = [
    { stage: '启动期(第1-7天)', days: '1-7', focus: '建立行为触发器', daily_action: `每天${anchor}进行${dailyTime}分钟${habit}，从最小可行量开始`, success_criteria: '连续7天完成，允许质量不高但必须完成' },
    { stage: '巩固期(第8-14天)', days: '8-14', focus: '稳定行为模式', daily_action: `保持固定时间${habit}，开始关注练习质量`, success_criteria: '完成率≥85%，开始体验练习带来的变化' },
    { stage: '深化期(第15-21天)', days: '15-21', focus: '提升练习深度', daily_action: `尝试将${habit}融入日常活动，增加微练习`, success_criteria: '能在日常生活中自发觉察，形成自动化倾向' },
    { stage: '内化期(第22-30天)', days: '22-30', focus: '习惯内化与扩展', daily_action: `稳定练习，探索${habit}的变体或延伸`, success_criteria: '习惯变得自然，不依赖意志力维持' },
  ];

  const obstacles = [
    { obstacle: '忘记练习', probability: '高', prevention_strategy: '设置多重提醒(手机闹钟+视觉提示+习惯叠加)', recovery_protocol: '错过后立即在下一个提醒点补做，不追悔' },
    { obstacle: '缺乏动力', probability: '中高', prevention_strategy: '记录每次练习后的感受变化，可视化进步', recovery_protocol: '回到最小版本(哪怕1分钟)，降低门槛' },
    { obstacle: '时间冲突', probability: '中', prevention_strategy: '提前规划，将练习视为不可协商的约会', recovery_protocol: '准备5分钟简化版，确保不断链' },
    { obstacle: '效果怀疑', probability: '中', prevention_strategy: '了解习惯养成的科学周期(平均66天)', recovery_protocol: '回顾追踪记录，看到累积效果' },
    { obstacle: '环境变化', probability: '低', prevention_strategy: '设计可移动版本的练习方案', recovery_protocol: '在新环境中快速重建锚点' },
  ];

  const trackingMethods = [
    { method: '习惯追踪APP或纸质日历打卡', metrics: ['每日完成率', '连续打卡天数', '练习质量自评(1-5)', '情绪变化记录'], reward_schedule: '每7天小奖励，每30天大奖励', accountability: '找一位习惯伙伴互相监督或加入社群' },
    { method: '每日微日记记录', metrics: ['是否完成', '练习时长', '关键感悟', '困难记录'], reward_schedule: '连续7天奖励自己一个小礼物', accountability: '每周向朋友分享进展' },
  ];
  const tracking = pick(rng, trackingMethods);

  const motivationBoosters = [
    { technique: '习惯叠加', description: '将新习惯绑定到已有习惯之后', when_to_apply: '设计触发器时，如「刷牙后立即冥想」' },
    { technique: '两分钟规则', description: '将练习缩减到2分钟版本', when_to_apply: '状态不佳时，先开始2分钟再说' },
    { technique: '视觉化进度', description: '用图表或日历直观展示连续记录', when_to_apply: '每天打卡时，看到连续记录会激励继续' },
    { technique: '身份认同', description: '将习惯融入自我认同：「我是一个正念练习者」', when_to_apply: '面对选择时，问「一个正念练习者会怎么做？」' },
    { technique: '环境设计', description: '让练习的提示物随处可见', when_to_apply: '布置练习空间，移除干扰物' },
  ];

  const milestones = [
    { day: 3, milestone: '完成前3天', reward: '给自己一个小零食或放松时间' },
    { day: 7, milestone: '完成第一周', reward: '看一部喜欢的电影或买一本好书' },
    { day: 14, milestone: '连续两周', reward: '安排一次特别的活动' },
    { day: 21, milestone: '三周习惯初步形成', reward: '购买一件与练习相关的物品' },
    { day: 30, milestone: '完成30天挑战', reward: '庆祝并设定下一个30天目标' },
  ];

  return {
    habit_design: { target_habit: habit, duration_days: duration, daily_time_minutes: dailyTime, anchor_motivation: `将${habit}与「${anchor}」绑定`, implementation_intention: `我将在${anchor}进行${dailyTime}分钟的${habit}，持续${duration}天` },
    stage_plan: stages,
    obstacle_forecast: obstacles.slice(0, Math.round(3 + rng() * 2)),
    tracking_system: tracking,
    motivation_boosters: motivationBoosters.slice(0, Math.round(3 + rng() * 2)),
    progress_milestones: milestones,
    disclaimer: DISCLAIMER,
  };
}

function formatHabitBuilder(r: HabitBuilderResult): string {
  let s = '=== MindfulAI - 正念习惯养成报告 ===\n\n';
  s += '【习惯设计】\n';
  s += `  目标习惯: ${r.habit_design.target_habit}\n`;
  s += `  持续天数: ${r.habit_design.duration_days}天\n`;
  s += `  每日时长: ${r.habit_design.daily_time_minutes}分钟\n`;
  s += `  行为锚点: ${r.habit_design.anchor_motivation}\n`;
  s += `  执行意图: ${r.habit_design.implementation_intention}\n\n`;
  s += '【阶段计划】\n';
  r.stage_plan.forEach(st => { s += `  ${st.stage}: ${st.focus}\n    行动: ${st.daily_action}\n    标准: ${st.success_criteria}\n`; });
  s += '\n【障碍预测与应对】\n';
  r.obstacle_forecast.forEach(o => { s += `  ${o.obstacle} [概率:${o.probability}]\n    预防: ${o.prevention_strategy}\n    恢复: ${o.recovery_protocol}\n`; });
  s += '\n【追踪系统】\n';
  s += `  方法: ${r.tracking_system.method}\n`;
  s += '  指标:\n';
  r.tracking_system.metrics.forEach(m => { s += `    • ${m}\n`; });
  s += `  奖励计划: ${r.tracking_system.reward_schedule}\n`;
  s += `  问责机制: ${r.tracking_system.accountability}\n\n`;
  s += '【动力增强器】\n';
  r.motivation_boosters.forEach(m => { s += `  ${m.technique}: ${m.description} (${m.when_to_apply})\n`; });
  s += '\n【进度里程碑】\n';
  r.progress_milestones.forEach(pm => { s += `  第${pm.day}天: ${pm.milestone} — 奖励: ${pm.reward}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. emotional_intelligence_trainer
// ============================================================
export interface EQTrainerInput {
  focus_area?: string;
  current_eq_score?: number;
  relationship_context?: string;
  challenge_scenario?: string;
  eq_dimensions?: string[];
  learning_style?: string;
}

export interface EQTrainerResult {
  eq_assessment: { focus_area: string; current_level: string; strength_dimensions: string[]; growth_dimensions: string[]; overall_eq_estimate: string };
  dimension_breakdown: Array<{ dimension: string; description: string; current_level: number; target_level: number; exercises: string[] }>;
  scenario_practice: { scenario: string; your_likely_response: string; eq_challenge: string; improved_response: string; key_eq_skill: string };
  daily_practices: Array<{ practice: string; duration_minutes: number; how_to_do: string; eq_target: string }>;
  relationship_applications: Array<{ context: string; challenge: string; eq_strategy: string; example_phrases: string[] }>;
  growth_plan: { week_1_2: string; week_3_4: string; month_2_3: string; long_term: string };
  disclaimer: string;
}

function getExercisesForDimension(dimension: string, rng: () => number): string[] {
  const exerciseMap: Record<string, string[]> = {
    '自我觉察': ['身体扫描觉察情绪信号', '情绪词汇扩展练习', '情绪触发事件记录', '情绪与身体感受连接'],
    '自我管理': ['暂停技术(反应前数到10)', '认知重评练习', '冲动控制训练', '压力下的自我安抚'],
    '社会觉察': ['观察非语言信号', '主动倾听练习', '群体动态觉察', '文化差异敏感度'],
    '共情能力': ['换位思考练习', '情感回应训练', '无条件积极关注', '共情倾听实践'],
    '关系管理': ['冲突解决演练', '影响力与说服', '给予建设性反馈', '建立信任的行为'],
    '内在动机': ['价值观澄清练习', '目标与意义连接', '自我激励技术', '韧性培养'],
  };
  const exercises = exerciseMap[dimension] || ['反思练习', '实践应用'];
  return exercises.slice(0, Math.round(2 + rng() * 2));
}

function trainEmotionalIntelligence(data: EQTrainerInput): EQTrainerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const focus = data.focus_area || pick(rng, ['自我觉察', '自我管理', '社会觉察', '关系管理', '共情能力']);
  const eqScore = data.current_eq_score ?? Math.round(50 + rng() * 30);

  const dimensions = [
    { dimension: '自我觉察', description: '识别和理解自身情绪的能力', base: eqScore },
    { dimension: '自我管理', description: '有效调节情绪和冲动的能力', base: eqScore - 5 },
    { dimension: '社会觉察', description: '感知和理解他人情绪的能力', base: eqScore + 3 },
    { dimension: '共情能力', description: '深入体验他人感受并回应的能力', base: eqScore - 2 },
    { dimension: '关系管理', description: '建立和维护健康关系的能力', base: eqScore + 1 },
    { dimension: '内在动机', description: '被内在价值驱动而非外在奖励的能力', base: eqScore + 5 },
  ];

  const dimensionBreakdown = dimensions.map(d => {
    const level = Math.max(30, Math.min(95, Math.round(d.base + (rng() - 0.5) * 20)));
    const exercises = getExercisesForDimension(d.dimension, rng);
    return { dimension: d.dimension, description: d.description, current_level: level, target_level: Math.min(95, level + Math.round(10 + rng() * 15)), exercises };
  });

  const strengths = dimensionBreakdown.filter(d => d.current_level >= eqScore + 5).map(d => d.dimension);
  const growth = dimensionBreakdown.filter(d => d.current_level < eqScore - 2).map(d => d.dimension);
  if (strengths.length === 0) strengths.push(dimensionBreakdown[0].dimension);
  if (growth.length === 0) growth.push(dimensionBreakdown[dimensionBreakdown.length - 1].dimension);

  const scenarios = [
    { scenario: '同事在会议上公开批评了你的方案', your_likely_response: '感到愤怒和尴尬，可能反击或沉默回避', eq_challenge: '在情绪激动时保持冷静并建设性回应', improved_response: '深呼吸，承认对方观点中的合理部分，提议会后详细讨论', key_eq_skill: '自我管理 + 关系管理' },
    { scenario: '朋友最近总是取消和你的约定', your_likely_response: '感到被忽视，可能疏远对方或积累怨气', eq_challenge: '理解他人处境同时表达自己的需求', improved_response: '温和地表达你的感受，询问对方近况，共同寻找解决方案', key_eq_skill: '共情能力 + 关系管理' },
    { scenario: '你精心准备的成果没有得到认可', your_likely_response: '感到沮丧和委屈，可能降低未来投入', eq_challenge: '在外部反馈不足时保持内在动力', improved_response: '认可自己的努力，主动寻求具体反馈，将关注点放在成长上', key_eq_skill: '自我觉察 + 内在动机' },
    { scenario: '团队成员对项目方向有不同意见', your_likely_response: '可能坚持己见或过早妥协', eq_challenge: '在分歧中寻找共识并推动进展', improved_response: '倾听各方观点，找到共同目标，引导建设性讨论', key_eq_skill: '社会觉察 + 关系管理' },
  ];
  const scenario = pick(rng, scenarios);

  const dailyPractices = [
    { practice: '情绪标注', duration_minutes: 5, how_to_do: '每天三次停下来，用精确词汇描述当前情绪', eq_target: '自我觉察' },
    { practice: '积极倾听', duration_minutes: 10, how_to_do: '在对话中专注理解对方，不打断，用自己的话复述', eq_target: '共情能力' },
    { practice: '情绪日记', duration_minutes: 10, how_to_do: '记录当天的情绪触发事件、反应和替代方案', eq_target: '自我觉察 + 自我管理' },
    { practice: '感恩练习', duration_minutes: 5, how_to_do: '每天写下三件感恩的事和原因', eq_target: '内在动机' },
    { practice: '换位思考', duration_minutes: 5, how_to_do: '选择一个互动，尝试从对方视角理解其行为', eq_target: '社会觉察' },
  ];

  const relationshipApps = [
    { context: '亲密关系', challenge: '在冲突中保持尊重和理解', eq_strategy: '使用「我」陈述表达感受，避免指责', example_phrases: ['我感到...当...发生时', '我需要的是...', '我理解你的感受是...'] },
    { context: '职场关系', challenge: '给予和接受反馈', eq_strategy: '先肯定再建议，关注行为而非人格', example_phrases: ['我注意到...这让我想到...', '你的优势在于...同时可以尝试...', '感谢你的坦诚'] },
    { context: '家庭关系', challenge: '处理代际差异', eq_strategy: '尊重差异，寻找共同价值，设定健康边界', example_phrases: ['我理解你的出发点是...', '我们可以找到一个双方都舒适的方式', '我尊重你的选择，同时也需要你尊重我的'] },
    { context: '友谊', challenge: '在需要时寻求和提供支持', eq_strategy: '主动表达关心，学会接受帮助', example_phrases: ['我注意到你最近...你还好吗？', '谢谢你愿意听我说', '我在这里支持你'] },
  ];

  return {
    eq_assessment: { focus_area: focus, current_level: eqScore >= 75 ? '良好' : eqScore >= 60 ? '中等' : '发展中', strength_dimensions: strengths, growth_dimensions: growth, overall_eq_estimate: `${eqScore}/100` },
    dimension_breakdown: dimensionBreakdown,
    scenario_practice: scenario,
    daily_practices: dailyPractices.slice(0, Math.round(3 + rng() * 2)),
    relationship_applications: relationshipApps.slice(0, Math.round(2 + rng() * 2)),
    growth_plan: { week_1_2: '建立情绪觉察基础，每天练习情绪标注', week_3_4: '开始应用倾听和共情技巧到日常互动中', month_2_3: '深化关系管理技能，处理更具挑战性的情境', long_term: '将EQ技能内化为自然反应，持续精进' },
    disclaimer: DISCLAIMER,
  };
}

function formatEQTrainer(r: EQTrainerResult): string {
  let s = '=== MindfulAI - 情商训练报告 ===\n\n';
  s += '【情商评估】\n';
  s += `  聚焦领域: ${r.eq_assessment.focus_area}\n`;
  s += `  当前水平: ${r.eq_assessment.current_level} (${r.eq_assessment.overall_eq_estimate})\n`;
  s += `  优势维度: ${r.eq_assessment.strength_dimensions.join('、')}\n`;
  s += `  成长维度: ${r.eq_assessment.growth_dimensions.join('、')}\n\n`;
  s += '【维度分解】\n';
  r.dimension_breakdown.forEach(d => { s += `  ${d.dimension} (${d.current_level}→${d.target_level}): ${d.description}\n`; d.exercises.forEach(e => { s += `    练习: ${e}\n`; }); });
  s += '\n【情境练习】\n';
  s += `  情境: ${r.scenario_practice.scenario}\n`;
  s += `  你的可能反应: ${r.scenario_practice.your_likely_response}\n`;
  s += `  EQ挑战: ${r.scenario_practice.eq_challenge}\n`;
  s += `  改进反应: ${r.scenario_practice.improved_response}\n`;
  s += `  关键EQ技能: ${r.scenario_practice.key_eq_skill}\n\n`;
  s += '【日常练习】\n';
  r.daily_practices.forEach(d => { s += `  ${d.practice} (${d.duration_minutes}分钟): ${d.how_to_do} [目标:${d.eq_target}]\n`; });
  s += '\n【关系应用】\n';
  r.relationship_applications.forEach(rp => { s += `  ${rp.context}: ${rp.challenge}\n    策略: ${rp.eq_strategy}\n`; rp.example_phrases.forEach(p => { s += `    「${p}」\n`; }); });
  s += '\n【成长计划】\n';
  s += `  1-2周: ${r.growth_plan.week_1_2}\n`;
  s += `  3-4周: ${r.growth_plan.week_3_4}\n`;
  s += `  2-3月: ${r.growth_plan.month_2_3}\n`;
  s += `  长期: ${r.growth_plan.long_term}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. wellness_progress_tracker
// ============================================================
export interface WellnessTrackerInput {
  tracking_weeks?: number;
  wellness_dimensions?: string[];
  baseline_scores?: Record<string, number>;
  goals?: string[];
  current_habits?: string[];
  lifestyle_factors?: Record<string, string>;
}

export interface WellnessTrackerResult {
  overall_progress: { composite_score: number; change_from_baseline: number; percentile_rank: number; trend: string; assessment: string };
  dimension_progress: Array<{ dimension: string; baseline: number; current: number; change: number; status: string; next_milestone: number }>;
  habit_consistency: Array<{ habit: string; target_frequency: string; actual_frequency: number; consistency_pct: number; streak_days: number; status: string }>;
  goal_tracking: Array<{ goal: string; progress_pct: string; on_track: string; action_needed: string }>;
  weekly_trend: Array<{ week: number; composite_score: number; highlight: string; challenge: string }>;
  recommendations: { maintain: string[]; improve: string[]; next_focus: string };
  disclaimer: string;
}

function trackWellnessProgress(data: WellnessTrackerInput): WellnessTrackerResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const weeks = data.tracking_weeks ?? Math.round(4 + rng() * 8);
  const dimensions = data.wellness_dimensions || ['身体健康', '心理情绪', '社交连接', '睡眠质量', '压力管理', '意义感'];

  const baselineMap: Record<string, number> = data.baseline_scores || {};
  const defaultBaselines: Record<string, number> = { '身体健康': 55, '心理情绪': 50, '社交连接': 60, '睡眠质量': 45, '压力管理': 50, '意义感': 55 };
  const baselines: Record<string, number> = {};
  dimensions.forEach(d => { baselines[d] = baselineMap[d] || defaultBaselines[d] || Math.round(45 + rng() * 20); });

  const dimensionProgress = dimensions.map(d => {
    const baseline = baselines[d];
    const change = round((rng() - 0.2) * 20, 1);
    const current = Math.max(20, Math.min(100, round(baseline + change, 1)));
    const status = change > 5 ? '显著改善' : change > 0 ? '稳步提升' : change > -5 ? '基本持平' : '需要关注';
    return { dimension: d, baseline, current, change, status, next_milestone: Math.min(100, Math.round(current + 5 + rng() * 10)) };
  });

  const compositeBaseline = round(dimensionProgress.reduce((a, d) => a + d.baseline, 0) / dimensionProgress.length, 1);
  const compositeCurrent = round(dimensionProgress.reduce((a, d) => a + d.current, 0) / dimensionProgress.length, 1);
  const compositeChange = round(compositeCurrent - compositeBaseline, 1);
  const percentile = Math.round(40 + rng() * 40);
  const trend = compositeChange > 8 ? '显著上升' : compositeChange > 3 ? '稳步上升' : compositeChange > -2 ? '平稳' : '需要调整';

  const habits = (data.current_habits && data.current_habits.length > 0) ? data.current_habits : ['每日冥想', '规律运动', '充足睡眠', '正念饮食', '感恩练习'];
  const habitConsistency = habits.map(h => {
    const consistency = Math.round(40 + rng() * 55);
    const streak = Math.round(rng() * 14);
    return { habit: h, target_frequency: '每日', actual_frequency: round(consistency / 100 * 7, 1), consistency_pct: consistency, streak_days: streak, status: consistency >= 80 ? '优秀' : consistency >= 60 ? '良好' : consistency >= 40 ? '发展中' : '需加强' };
  });

  const goals = (data.goals && data.goals.length > 0) ? data.goals : ['建立每日冥想习惯', '将睡眠质量提升至8分', '每周运动4次', '减少压力反应频率'];
  const goalTracking = goals.map(g => {
    const progress = Math.round(20 + rng() * 70);
    return { goal: g, progress_pct: `${progress}%`, on_track: progress >= 60 ? '是' : progress >= 40 ? '部分' : '否', action_needed: progress >= 60 ? '保持当前节奏' : progress >= 40 ? '增加执行频率' : '重新评估目标可行性并调整策略' };
  });

  const weeklyTrend: Array<{ week: number; composite_score: number; highlight: string; challenge: string }> = [];
  const highlights = ['冥想习惯稳定建立', '睡眠质量明显改善', '压力管理技能提升', '社交连接增强', '运动频率达标', '情绪调节能力进步'];
  const challenges = ['工作压力增加', '睡眠偶尔被打断', '动力有所波动', '时间管理挑战', '天气影响运动', '社交活动减少'];
  for (let w = 1; w <= weeks; w++) {
    const score = round(compositeBaseline + (compositeChange / weeks) * w + (rng() - 0.5) * 5, 1);
    weeklyTrend.push({ week: w, composite_score: Math.max(20, Math.min(100, score)), highlight: pick(rng, highlights), challenge: pick(rng, challenges) });
  }

  const maintainRecs = ['继续保持已经建立的良好习惯', '定期回顾进步，强化内在动机', '分享你的经验，帮助他人也激励自己'];
  const improveRecs = ['针对得分最低的维度制定专项提升计划', '增加该维度的日常练习时间', '寻求专业指导或加入相关社群', '设置更具体的阶段性小目标'];

  return {
    overall_progress: { composite_score: compositeCurrent, change_from_baseline: compositeChange, percentile_rank: percentile, trend, assessment: `经过${weeks}周追踪，综合健康得分${compositeChange >= 0 ? '提升' : '变化'}${Math.abs(compositeChange)}分，整体趋势${trend}` },
    dimension_progress: dimensionProgress,
    habit_consistency: habitConsistency,
    goal_tracking: goalTracking,
    weekly_trend: weeklyTrend,
    recommendations: { maintain: maintainRecs, improve: improveRecs, next_focus: `重点关注「${dimensionProgress.sort((a, b) => a.current - b.current)[0].dimension}」维度，制定专项提升计划` },
    disclaimer: DISCLAIMER,
  };
}

function formatWellnessTracker(r: WellnessTrackerResult): string {
  let s = '=== MindfulAI - 健康进度追踪报告 ===\n\n';
  s += '【整体进度】\n';
  s += `  综合得分: ${r.overall_progress.composite_score}/100\n`;
  s += `  相对基线变化: ${r.overall_progress.change_from_baseline > 0 ? '+' : ''}${r.overall_progress.change_from_baseline}分\n`;
  s += `  百分位排名: 第${r.overall_progress.percentile_rank}百分位\n`;
  s += `  趋势: ${r.overall_progress.trend}\n`;
  s += `  评估: ${r.overall_progress.assessment}\n\n`;
  s += '【维度进度】\n';
  r.dimension_progress.forEach(d => { s += `  ${d.dimension}: ${d.baseline} → ${d.current} (${d.change > 0 ? '+' : ''}${d.change}) [${d.status}] 下一里程碑:${d.next_milestone}\n`; });
  s += '\n【习惯一致性】\n';
  r.habit_consistency.forEach(h => { s += `  ${h.habit}: 一致性${h.consistency_pct}% | 连续${h.streak_days}天 | 实际${h.actual_frequency}次/周 [${h.status}]\n`; });
  s += '\n【目标追踪】\n';
  r.goal_tracking.forEach(g => { s += `  ${g.goal}: ${g.progress_pct} [${g.on_track === '是' ? '达标' : g.on_track === '部分' ? '部分达标' : '需调整'}] ${g.action_needed}\n`; });
  s += '\n【周度趋势】\n';
  r.weekly_trend.forEach(w => { s += `  第${w.week}周: ${w.composite_score}分 | 亮点:${w.highlight} | 挑战:${w.challenge}\n`; });
  s += '\n【建议】\n';
  s += '  保持:\n';
  r.recommendations.maintain.forEach(m => { s += `    • ${m}\n`; });
  s += '  改进:\n';
  r.recommendations.improve.forEach(i => { s += `    • ${i}\n`; });
  s += `  下一步重点: ${r.recommendations.next_focus}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply - register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. meditation_session_generator
  tools.register(defineTool({
    name: 'meditation_session_generator',
    description: '冥想会话生成 - 基于用户偏好和经验级别，生成包含呼吸引导、脚本阶段、身体扫描和环境建议的完整冥想练习方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含meditation_type, duration_minutes, experience_level, focus_area, environment, time_of_day等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMeditation(generateMeditationSession(JSON.parse(args.input_data))); },
  }));

  // 2. mood_pattern_analyst
  tools.register(defineTool({
    name: 'mood_pattern_analyst',
    description: '情绪模式分析 - 基于追踪数据识别情绪模式、相关因素、触发因素和保护因素，提供个性化改善建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含tracking_period_days, avg_mood_score, mood_variability, dominant_emotions, sleep_avg_hours, exercise_frequency_weekly, stress_level_avg, social_interaction_level等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatMoodAnalyst(analyzeMoodPatterns(JSON.parse(args.input_data))); },
  }));

  // 3. cbt_exercise_creator
  tools.register(defineTool({
    name: 'cbt_exercise_creator',
    description: 'CBT练习生成 - 基于目标问题和严重程度，生成包含思维记录、认知扭曲识别、行为实验和应对陈述的完整CBT练习方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含target_issue, severity_level, preferred_format, session_goal, cognitive_distortions, experience_level等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatCbt(createCbtExercise(JSON.parse(args.input_data))); },
  }));

  // 4. stress_management_coach
  tools.register(defineTool({
    name: 'stress_management_coach',
    description: '压力管理教练 - 基于压力评估，提供压力源分析、应对资源盘点、放松计划、生活方式调整和应急方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含current_stress_level, primary_stressors, coping_methods_used, physical_symptoms, work_life_balance_score, support_system, stress_duration_weeks等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatStressCoach(coachStressManagement(JSON.parse(args.input_data))); },
  }));

  // 5. sleep_quality_optimizer
  tools.register(defineTool({
    name: 'sleep_quality_optimizer',
    description: '睡眠质量优化 - 基于睡眠数据，提供睡眠卫生审计、昼夜节律分析、睡前仪式、环境优化和两周改善计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含avg_sleep_hours, sleep_onset_minutes, wake_episodes_nightly, sleep_quality_score, bedtime, wake_time, caffeine_intake_mg, screen_time_before_bed_minutes, exercise_timing, bedroom_environment等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatSleepOptimizer(optimizeSleep(JSON.parse(args.input_data))); },
  }));

  // 6. mindfulness_habit_builder
  tools.register(defineTool({
    name: 'mindfulness_habit_builder',
    description: '正念习惯养成 - 基于目标习惯和当前一致性，提供阶段计划、障碍预测、追踪系统、动力增强器和进度里程碑',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含target_habit, current_consistency_pct, motivation_level, available_time_daily_minutes, preferred_reminder_time, habit_duration_days, past_attempts, support_available等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatHabitBuilder(buildMindfulnessHabit(JSON.parse(args.input_data))); },
  }));

  // 7. emotional_intelligence_trainer
  tools.register(defineTool({
    name: 'emotional_intelligence_trainer',
    description: '情商训练 - 基于聚焦领域和当前EQ水平，提供维度分解、情境练习、日常练习、关系应用和成长计划',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含focus_area, current_eq_score, relationship_context, challenge_scenario, eq_dimensions, learning_style等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatEQTrainer(trainEmotionalIntelligence(JSON.parse(args.input_data))); },
  }));

  // 8. wellness_progress_tracker
  tools.register(defineTool({
    name: 'wellness_progress_tracker',
    description: '健康进度追踪 - 基于追踪周期和基线数据，提供综合得分、维度进度、习惯一致性、目标追踪和周度趋势分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含tracking_weeks, wellness_dimensions, baseline_scores, goals, current_habits, lifestyle_factors等字段' },
    },
    output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] },
    async execute(args: { input_data: string }) { return formatWellnessTracker(trackWellnessProgress(JSON.parse(args.input_data))); },
  }));
}
