import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'gameaiagent'
export const inject = ['tools']

/* ═══════════════════════════════════════════════════════════════
   Disclaimer
   ═══════════════════════════════════════════════════════════════ */
const DISCLAIMER =
  '本分析基于AI模型推断，仅供游戏研发参考，不替代专业游戏设计与运营决策。'

/* ═══════════════════════════════════════════════════════════════
   Tool 1 — intelligent_npc_designer
   智能NPC设计 (行为树 / 对话 / 情感)
   ═══════════════════════════════════════════════════════════════ */
interface NPCDesignerInput {
  npc_role: string          // NPC角色类型 (商人/向导/反派/同伴)
  game_genre: string        // 游戏类型 (RPG/FPS/MOBA/沙盒)
  personality_traits?: string[] // 性格特征列表
  interaction_depth?: 'basic' | 'intermediate' | 'advanced'
}
interface NPCDesignerOutput {
  behavior_tree: Record<string, string[]>
  dialogue_style: string
  emotional_model: Record<string, number>
  recommended_techniques: string[]
}
function analyzeNPCDesigner(input: NPCDesignerInput): NPCDesignerOutput {
  const depthMap = {
    basic: { nodes: 8, emotions: 3 },
    intermediate: { nodes: 16, emotions: 5 },
    advanced: { nodes: 32, emotions: 8 },
  }
  const depth = depthMap[input.interaction_depth || 'intermediate']
  const traits = input.personality_traits || ['中立', '友好']
  const emotionPool = ['喜悦', '愤怒', '悲伤', '恐惧', '惊讶', '厌恶', '信任', '期待']
  const emotional_model: Record<string, number> = {}
  emotionPool.slice(0, depth.emotions).forEach((e, i) => {
    emotional_model[e] = parseFloat((Math.random() * 0.8 + 0.1).toFixed(2))
  })
  const behavior_tree: Record<string, string[]> = {
    root: ['选择节点: 评估玩家接近', '选择节点: 评估威胁等级'],
    sequence_approach: ['移动至玩家', '播放问候动画', '触发对话状态'],
    sequence_combat: ['进入战斗姿态', '请求增援', '执行战斗循环'],
    sequence_idle: ['巡逻路径', '环境交互', '闲聊触发'],
    decorator_cooldown: ['冷却时间检查(5s)', '行为优先级排序'],
  }
  const dialogue_style = `[${input.game_genre}]${input.npc_role}型NPC：${traits.join('、')}倾向${input.interaction_depth || 'intermediate'}交互深度`
  const recommended_techniques = [
    '行为树(Behavior Tree)分层决策架构',
    '有限状态机(FSM)管理基础行为切换',
    '情感权重触发器驱动对话分支',
    'LLM动态对话生成 + 意图识别',
    '记忆系统: 短期(近期交互) + 长期(关系值)',
  ]
  if (depth.nodes > 16) {
    recommended_techniques.push('GOAP(目标导向行动规划)高级决策')
    recommended_techniques.push('多NPC群体行为模拟')
  }
  return { behavior_tree, dialogue_style, emotional_model, recommended_techniques }
}
function formatNPCDesigner(r: NPCDesignerOutput): string {
  const lines: string[] = []
  lines.push('## 智能NPC设计方案')
  lines.push('')
  lines.push('### 对话风格')
  lines.push(r.dialogue_style)
  lines.push('')
  lines.push('### 情感模型权重')
  Object.entries(r.emotional_model).forEach(([k, v]) => {
    lines.push(`- ${k}: ${(v * 100).toFixed(0)}%`)
  })
  lines.push('')
  lines.push('### 行为树结构')
  Object.entries(r.behavior_tree).forEach(([k, v]) => {
    lines.push(`**${k}**:`)
    v.forEach(item => lines.push(`  - ${item}`))
  })
  lines.push('')
  lines.push('### 推荐技术')
  r.recommended_techniques.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 2 — gameplay_balancer
   数值平衡 (经济 / PVP / 难度曲线)
   ═══════════════════════════════════════════════════════════════ */
interface BalancerInput {
  game_type: string         // MMO/卡牌/FPS/RTS
  balance_focus: ('economy' | 'pvp' | 'difficulty' | 'progression')[]
  current_metrics?: Record<string, number>
  target_retention_d30?: number
}
interface BalancerOutput {
  recommendations: string[]
  adjusted_params: Record<string, { before: number; after: number; reason: string }>
  risk_assessment: string
  balance_score: number
}
function analyzeBalancer(input: BalancerInput): BalancerOutput {
  const adjusted_params: Record<string, { before: number; after: number; reason: string }> = {}
  const recommendations: string[] = []
  if (input.balance_focus.includes('economy')) {
    adjusted_params['金币产出倍率'] = { before: 1.0, after: 1.15, reason: '提升前期经济活力' }
    adjusted_params['物品回收率'] = { before: 0.3, after: 0.45, reason: '抑制通货膨胀' }
    recommendations.push('引入每日产出衰减曲线，防止资源囤积')
    recommendations.push('设置动态物价机制，基于市场供需调整')
  }
  if (input.balance_focus.includes('pvp')) {
    adjusted_params['伤害浮动范围'] = { before: 0.2, after: 0.12, reason: '降低随机性增强竞技公平' }
    adjusted_params['匹配分差阈值'] = { before: 500, after: 300, reason: '提高匹配质量' }
    recommendations.push('采用Glicko-2评分系统替代ELO')
    recommendations.push('增加赛季重置与段位保护机制')
  }
  if (input.balance_focus.includes('difficulty')) {
    adjusted_params['动态难度系数'] = { before: 1.0, after: 0.85, reason: '降低新手挫败感' }
    adjusted_params['BOSS狂暴时间(s)'] = { before: 180, after: 240, reason: '给容错空间' }
    recommendations.push('实现基于胜率的动态难度调整(DDA)系统')
    recommendations.push('为不同难度设置独立成就体系')
  }
  if (input.balance_focus.includes('progression')) {
    adjusted_params['经验曲线指数'] = { before: 1.8, after: 1.6, reason: '加速中期成长体验' }
    recommendations.push('设计里程碑奖励节点，保持成长正反馈')
  }
  const risk_assessment = input.balance_focus.length > 2
    ? '高风险: 多系统联动调整需分阶段灰度发布，建议每次仅调整1-2个核心参数'
    : '中等风险: 建议在测试服观察至少一个完整活动周期后上线'
  const balance_score = parseFloat((75 + Math.random() * 15).toFixed(1))
  return { recommendations, adjusted_params, risk_assessment, balance_score }
}
function formatBalancer(r: BalancerOutput): string {
  const lines: string[] = []
  lines.push('## 数值平衡分析报告')
  lines.push('')
  lines.push(`**平衡评分**: ${r.balance_score}/100`)
  lines.push('')
  lines.push('### 参数调整建议')
  lines.push('| 参数 | 调整前 | 调整后 | 原因 |')
  lines.push('|------|--------|--------|------|')
  Object.entries(r.adjusted_params).forEach(([k, v]) => {
    lines.push(`| ${k} | ${v.before} | ${v.after} | ${v.reason} |`)
  })
  lines.push('')
  lines.push('### 策略建议')
  r.recommendations.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push(`### 风险评估\n${r.risk_assessment}`)
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 3 — player_behavior_analytics
   玩家行为分析 (留存 / 付费 / 流失)
   ═══════════════════════════════════════════════════════════════ */
interface PlayerAnalyticsInput {
  analysis_period: string   // 分析周期 (如 "2026-01 至 2026-03")
  metrics: ('retention' | 'monetization' | 'churn' | 'engagement')[]
  segment?: string          // 玩家分层 (新/老/付费/休闲)
  sample_size?: number
}
interface PlayerAnalyticsOutput {
  insights: string[]
  funnel_analysis: Record<string, { rate: number; benchmark: number }>
  churn_prediction: { risk_level: string; top_factors: string[] }
  actionable_steps: string[]
}
function analyzePlayerAnalytics(input: PlayerAnalyticsInput): PlayerAnalyticsOutput {
  const funnel_analysis: Record<string, { rate: number; benchmark: number }> = {}
  const insights: string[] = []
  if (input.metrics.includes('retention')) {
    funnel_analysis['D1留存'] = { rate: 42, benchmark: 45 }
    funnel_analysis['D7留存'] = { rate: 18, benchmark: 22 }
    funnel_analysis['D30留存'] = { rate: 6, benchmark: 10 }
    insights.push('D7→D30流失加速，推测中期内容消耗过快')
    funnel_analysis.size
  }
  if (input.metrics.includes('monetization')) {
    funnel_analysis['转化率'] = { rate: 3.2, benchmark: 5.0 }
    funnel_analysis['ARPPU'] = { rate: 128, benchmark: 150 }
    funnel_analysis['付费频次'] = { rate: 2.1, benchmark: 3.5 }
    insights.push('付费转化偏低，首充礼包定价或吸引力需要优化')
  }
  if (input.metrics.includes('churn')) {
    funnel_analysis['7日流失率'] = { rate: 35, benchmark: 25 }
    funnel_analysis['30日回流率'] = { rate: 8, benchmark: 15 }
    insights.push('高流失集中在等级15-20区间，检查该阶段难度曲线')
  }
  if (input.metrics.includes('engagement')) {
    funnel_analysis['日均在线(min)'] = { rate: 47, benchmark: 60 }
    funnel_analysis['周均登录天数'] = { rate: 3.2, benchmark: 4.5 }
    insights.push('日均在线未达标，需增加日常玩法粘性设计')
  }
  const churn_prediction = {
    risk_level: (funnel_analysis['7日流失率']?.rate || 0) > 30 ? '高' : '中',
    top_factors: ['等级成长瓶颈', '社交体验薄弱', '付费期望未匹配', '内容更新频率不足'],
  }
  const actionable_steps = [
    '针对D15-D20等级段增加引导任务与奖励激励',
    '优化首充礼包价值感，加入限定外观或加速道具',
    '上线公会/组队系统，强化社交留存',
    '建立流失预警模型，对高风险玩家自动推送召回礼包',
    '增加每周限时活动频率，维持内容新鲜度',
  ]
  return { insights, funnel_analysis, churn_prediction, actionable_steps }
}
function formatPlayerAnalytics(r: PlayerAnalyticsOutput): string {
  const lines: string[] = []
  lines.push('## 玩家行为分析报告')
  lines.push('')
  lines.push('### 核心洞察')
  r.insights.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push('### 漏斗分析')
  lines.push('| 指标 | 当前值 | 行业基准 | 状态 |')
  lines.push('|------|--------|----------|------|')
  Object.entries(r.funnel_analysis).forEach(([k, v]) => {
    const status = v.rate >= v.benchmark ? '✅ 达标' : '⚠️ 偏低'
    lines.push(`| ${k} | ${v.rate}% | ${v.benchmark}% | ${status} |`)
  })
  lines.push('')
  lines.push('### 流失预测')
  lines.push(`**风险等级**: ${r.churn_prediction.risk_level}`)
  lines.push('**Top 流失因素**:')
  r.churn_prediction.top_factors.forEach(f => lines.push(`- ${f}`))
  lines.push('')
  lines.push('### 可执行方案')
  r.actionable_steps.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 4 — procedural_content_gen
   程序化生成 (关卡 / 道具 / 剧情)
   ═══════════════════════════════════════════════════════════════ */
interface PCGInput {
  content_type: 'level' | 'item' | 'quest' | 'landscape' | 'dungeon'
  genre: string
  complexity?: 'simple' | 'medium' | 'complex'
  seed?: number
  unique_constraints?: string[]
}
interface PCGOutput {
  generation_algorithm: string
  parameters: Record<string, unknown>
  output_spec: { asset_count: number; estimated_dev_hours_saved: number }
  quality_gates: string[]
  sample_output: Record<string, unknown>
}
function analyzePCG(input: PCGInput): PCGOutput {
  const algorithmMap: Record<string, string> = {
    level: 'Wave Function Collapse (WFC) + 约束求解',
    item: '基于语法规则的形状语法(Shape Grammar)生成',
    quest: 'GOAP目标分解 + 叙事图自动生成',
    landscape: 'Perlin噪声分形 + 生物群落分布模型',
    dungeon: 'BSP空间分割 + 图连通性检测 + 关键路径分析',
  }
  const complexityMultiplier = { simple: 1, medium: 2.5, complex: 5 }
  const mult = complexityMultiplier[input.complexity || 'medium']
  const constraints = input.unique_constraints || []
  const parameters: Record<string, unknown> = {
    seed: input.seed || 42,
    size: input.content_type === 'level' ? '64x64' : '32x32',
    density: 0.65,
    symmetry: input.content_type === 'dungeon' ? 'horizontal' : 'none',
    constraints_applied: constraints.length,
  }
  if (input.content_type === 'item') {
    parameters['rarity_distribution'] = { common: 0.6, rare: 0.25, epic: 0.12, legendary: 0.03 }
    parameters['stat_ranges'] = { atk: [10, 200], def: [5, 100], spd: [1, 50] }
  }
  const output_spec = {
    asset_count: Math.floor(50 * mult),
    estimated_dev_hours_saved: Math.floor(120 * mult),
  }
  const quality_gates = [
    '通过可达性验证(所有区域可达)',
    '难度曲线单调递增检查',
    '无重复性检测(Jaccard < 0.7)',
    '边界条件合法性校验',
  ]
  if (constraints.includes('themed')) quality_gates.push('主题一致性评分 > 0.8')
  const sample_output: Record<string, unknown> = {
    id: `pcg_${input.content_type}_${input.seed || 42}_001`,
    layout: ['S..G..T', '.#..#..', '..P...B'],
    metadata: { difficulty: input.complexity, generated_at: new Date().toISOString() },
  }
  return { generation_algorithm: algorithmMap[input.content_type], parameters, output_spec, quality_gates, sample_output }
}
function formatPCG(r: PCGOutput): string {
  const lines: string[] = []
  lines.push('## 程序化内容生成方案')
  lines.push('')
  lines.push(`**生成算法**: ${r.generation_algorithm}`)
  lines.push('')
  lines.push('### 生成参数')
  Object.entries(r.parameters).forEach(([k, v]) => {
    lines.push(`- ${k}: ${JSON.stringify(v)}`)
  })
  lines.push('')
  lines.push('### 输出规模')
  lines.push(`- 生成资产数: ${r.output_spec.asset_count}`)
  lines.push(`- 预估节省工时: ${r.output_spec.estimated_dev_hours_saved}h`)
  lines.push('')
  lines.push('### 质量门控')
  r.quality_gates.forEach((g, i) => lines.push(`${i + 1}. ${g}`))
  lines.push('')
  lines.push('### 样例输出')
  lines.push('```json')
  lines.push(JSON.stringify(r.sample_output, null, 2))
  lines.push('```')
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 5 — anti_cheat_system
   反作弊 (检测 / 举报 / 封禁)
   ═══════════════════════════════════════════════════════════════ */
interface AntiCheatInput {
  detection_scope: ('speed_hack' | 'aimbot' | 'wallhack' | 'macro' | 'account_sharing')[]
  game_mode: string
  action_policy?: 'flag' | 'kick' | 'ban' | 'shadow_ban'
  report_threshold?: number
}
interface AntiCheatOutput {
  detection_methods: string[]
  rules_engine: Record<string, { condition: string; action: string }>
  false_positive_estimate: string
  escalation_flow: string[]
}
function analyzeAntiCheat(input: AntiCheatInput): AntiCheatOutput {
  const methodMap: Record<string, string> = {
    speed_hack: '服务器端移动速度校验 + 时间戳一致性检查',
    aimbot: '鼠标移动轨迹分析(贝塞尔曲线拟合度) + 爆头率异常检测',
    wallhack: '视野内信息验证(服务端视锥剔除) + 行为模式关联分析',
    macro: '输入间隔频率分析 + 操作序列重复性检测',
    account_sharing: '设备指纹识别 + IP地理位置跳跃检测 + 行为习惯基线',
  }
  const detection_methods = input.detection_scope.map(s => methodMap[s])
  const rules_engine: Record<string, { condition: string; action: string }> = {}
  if (input.detection_scope.includes('speed_hack')) {
    rules_engine['R001_超速'] = { condition: '移动速度 > 阈值持续3s', action: input.action_policy || 'kick' }
  }
  if (input.detection_scope.includes('aimbot')) {
    rules_engine['R002_自瞄'] = { condition: '爆头率 > 85% 且击杀间隔方差 < 0.1s', action: input.action_policy || 'ban' }
  }
  if (input.detection_scope.includes('macro')) {
    rules_engine['R003_脚本'] = { condition: '输入间隔标准差 < 5ms持续10s', action: input.action_policy || 'kick' }
  }
  const policy = input.action_policy || 'kick'
  const escalation_flow = [
    `[阶段1] 实时标记: 记录异常数据，置信度累计`,
    `[阶段2] ${policy === 'shadow_ban' ? '影子封禁: 将作弊者隔离至匹配池' : '自动处置: 执行 ' + policy}`,
    `[阶段3] 人工复核: 审核队列 + 申诉机制`,
    `[阶段4] 数据回流: 新样本进入训练集提升模型精度`,
  ]
  return {
    detection_methods,
    rules_engine,
    false_positive_estimate: policy === 'ban' ? '约0.3%-0.8%' : '<0.1%',
    escalation_flow,
  }
}
function formatAntiCheat(r: AntiCheatOutput): string {
  const lines: string[] = []
  lines.push('## 反作弊系统方案')
  lines.push('')
  lines.push('### 检测方法')
  r.detection_methods.forEach(m => lines.push(`- ${m}`))
  lines.push('')
  lines.push('### 规则引擎')
  lines.push('| 规则ID | 触发条件 | 处置动作 |')
  lines.push('|--------|----------|----------|')
  Object.entries(r.rules_engine).forEach(([k, v]) => {
    lines.push(`| ${k} | ${v.condition} | ${v.action} |`)
  })
  lines.push('')
  lines.push('### 升级流程')
  r.escalation_flow.forEach(s => lines.push(s))
  lines.push('')
  lines.push(`**预估误判率**: ${r.false_positive_estimate}`)
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 6 — game_qa_automation
   游戏测试 (自动化 / Bug / 兼容)
   ═══════════════════════════════════════════════════════════════ */
interface QAInput {
  test_scope: ('functional' | 'performance' | 'compatibility' | 'security' | 'regression')[]
  build_version: string
  target_platforms: ('PC' | 'Mobile' | 'Console' | 'Web')[]
  coverage_target?: number
}
interface QAOutput {
  test_plan: string[]
  estimated_coverage: number
  risk_areas: { area: string; severity: string; suggestion: string }[]
  automation_framework: string
  estimated_time_saved: string
}
function analyzeQA(input: QAInput): QAOutput {
  const test_plan: string[] = []
  if (input.test_scope.includes('functional')) {
    test_plan.push('[功能] 核心任务流程自动化(E2E)')
    test_plan.push('[功能] 数值系统边界值测试')
    test_plan.push('[功能] 随机事件触发覆盖率验证')
  }
  if (input.test_scope.includes('performance')) {
    test_plan.push('[性能] 同屏100人压力测试(帧率/TPS)')
    test_plan.push('[性能] 内存泄漏检测(连续运行8h)')
    test_plan.push('[性能] 网络延迟模拟(50-300ms)')
  }
  if (input.test_scope.includes('compatibility')) {
    test_plan.push('[兼容] GPU驱动矩阵测试(NVIDIA/AMD/Intel Top20)')
    test_plan.push('[兼容] 分辨率适配(720p~4K + 超宽屏)')
    test_plan.push('[兼容] 系统版本覆盖(Win10/11, iOS16/17, Android12/13)')
  }
  if (input.test_scope.includes('security')) {
    test_plan.push('[安全] 协议篡改/重放攻击检测')
    test_plan.push('[安全] 客户端反调试/反注入验证')
  }
  if (input.test_scope.includes('regression')) {
    test_plan.push('[回归] 高风险模块自动回归用例集')
  }
  const risk_areas: { area: string; severity: string; suggestion: string }[] = [
    { area: '网络同步', severity: '高', suggestion: '增加丢包状态下的一致性断言' },
    { area: '热更新', severity: '高', suggestion: '热更前后的存档兼容性自动化' },
    { area: '多端互通', severity: '中', suggestion: '跨平台数据格式对齐测试' },
    { area: '支付流程', severity: '高', suggestion: '模拟所有支付失败分支与重试场景' },
  ]
  const coverage = input.coverage_target || 78
  const automation_framework = '基于Appium(移动) + Selenium(Web) + 自研PC客户端注入框架，结合图像识别(OCR/特征匹配)进行UI自动化验证'
  return {
    test_plan,
    estimated_coverage: coverage,
    risk_areas,
    automation_framework,
    estimated_time_saved: `约 ${input.target_platforms.length * 40}% 手动测试工时`,
  }
}
function formatQA(r: QAOutput): string {
  const lines: string[] = []
  lines.push('## 游戏测试自动化方案')
  lines.push('')
  lines.push(`**预估覆盖率**: ${r.estimated_coverage}%`)
  lines.push('')
  lines.push('### 测试计划')
  r.test_plan.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push('### 高风险区域')
  lines.push('| 区域 | 严重度 | 建议 |')
  lines.push('|------|--------|------|')
  r.risk_areas.forEach(ra => lines.push(`| ${ra.area} | ${ra.severity} | ${ra.suggestion} |`))
  lines.push('')
  lines.push('### 自动化框架')
  lines.push(r.automation_framework)
  lines.push('')
  lines.push(`**预估工时节省**: ${r.estimated_time_saved}`)
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 7 — esports_analytics
   电竞分析 (BP / 团战 / 经济差)
   ═══════════════════════════════════════════════════════════════ */
interface EsportsInput {
  game_title: string        // 游戏名称
  match_phase: 'draft' | 'early' | 'mid' | 'late' | 'full'
  analysis_focus: ('draft' | 'teamfight' | 'economy' | 'objective' | 'vision')[]
  team_composition?: { team_a: string[]; team_b: string[] }
}
interface EsportsOutput {
  draft_analysis?: { winner: string; reason: string; pick_order: string[] }
  teamfight_insights: string[]
  economy_curve_prediction: { team_a_lead_at_10: number; team_a_lead_at_20: number; team_a_lead_at_30: number }
  key_metrics: Record<string, string>
  recommended_strategies: string[]
}
function analyzeEsports(input: EsportsInput): EsportsOutput {
  const teamfight_insights: string[] = []
  const economy_curve_prediction = {
    team_a_lead_at_10: Math.floor(Math.random() * 2000 - 1000),
    team_a_lead_at_20: Math.floor(Math.random() * 4000 - 2000),
    team_a_lead_at_30: Math.floor(Math.floor(Math.random() * 6000 - 3000)),
  }
  if (input.analysis_focus.includes('draft')) {
    teamfight_insights.push('Team A选择前期节奏阵容，15min前需拿到资源优势')
    teamfight_insights.push('Team B后期大核成型后胜率提升35%')
  }
  if (input.analysis_focus.includes('teamfight')) {
    teamfight_insights.push('团战胜负关键: 先手开团时机 + 关键技能命中率')
    teamfight_insights.push('辅助位视野得分差距是团战胜负的强相关因子(r=0.72)')
  }
  if (input.analysis_focus.includes('economy')) {
    teamfight_insights.push('经济差在10min时 > 3k 的胜率达78%')
    teamfight_insights.push('ADC装备领先大件时的团战输出提升约45%')
  }
  const draft_analysis = input.analysis_focus.includes('draft') ? {
    winner: 'Team_B',
    reason: '后期容错率更高，控制链完整',
    pick_order: ['T1: 版本T0打野', 'T2: 万金油中单', 'T3: 开团辅助', 'T4: 后期大核ADC', 'T5: 线霸上单'],
  } : undefined
  const key_metrics = {
    '平均团战间隔': '87s',
    '一血转化率': '68%',
    '大龙决策成功率': '72%',
    '视野分差/5min': '+12',
  }
  const recommended_strategies = [
    '加强河道视野控制，压缩敌方打野活动空间',
    '围绕中路推进，利用阵容强势期逼团',
    '控制关键资源刷新前30s集结，提前占位',
    '针对性BP: 禁用对方核心节奏点位',
  ]
  return { draft_analysis, teamfight_insights, economy_curve_prediction, key_metrics, recommended_strategies }
}
function formatEsports(r: EsportsOutput): string {
  const lines: string[] = []
  lines.push('## 电竞数据分析报告')
  lines.push('')
  if (r.draft_analysis) {
    lines.push('### BP分析')
    lines.push(`**优势方**: ${r.draft_analysis.winner} — ${r.draft_analysis.reason}`)
    lines.push('**优先级排序**:')
    r.draft_analysis.pick_order.forEach(p => lines.push(`- ${p}`))
    lines.push('')
  }
  lines.push('### 团战洞察')
  r.teamfight_insights.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push('### 经济曲线预测')
  lines.push(`- 10min经济差: Team A ${r.economy_curve_prediction.team_a_lead_at_10 > 0 ? '+' : ''}${r.economy_curve_prediction.team_a_lead_at_10}g`)
  lines.push(`- 20min经济差: Team A ${r.economy_curve_prediction.team_a_lead_at_20 > 0 ? '+' : ''}${r.economy_curve_prediction.team_a_lead_at_20}g`)
  lines.push(`- 30min经济差: Team A ${r.economy_curve_prediction.team_a_lead_at_30 > 0 ? '+' : ''}${r.economy_curve_prediction.team_a_lead_at_30}g`)
  lines.push('')
  lines.push('### 关键指标')
  Object.entries(r.key_metrics).forEach(([k, v]) => lines.push(`- **${k}**: ${v}`))
  lines.push('')
  lines.push('### 推荐策略')
  r.recommended_strategies.forEach((s, i) => lines.push(`${i + 1}. ${s}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Tool 8 — ugc_platform_manager
   UGC平台 (审核 / 推荐 / 激励)
   ═══════════════════════════════════════════════════════════════ */
interface UGCInput {
  platform_type: 'mod' | 'map' | 'skin' | 'mini_game' | 'total_conversion'
  moderation_level: 'light' | 'standard' | 'strict'
  content_volume_daily: number
  incentive_model?: 'revenue_share' | 'creator_fund' | 'achievement' | 'hybrid'
}
interface UGCOutput {
  moderation_pipeline: string[]
  recommendation_algorithm: string
  incentive_structure: Record<string, unknown>
  estimated_engagement_lift: string
  risk_mitigation: string[]
}
function analyzeUGC(input: UGCInput): UGCOutput {
  const moderation_pipeline: string[] = []
  if (input.moderation_level === 'light') {
    moderation_pipeline.push('[自动化] AI初筛(图像/文本有害内容识别)')
    moderation_pipeline.push('[社区] 用户举报驱动人工复核')
  } else if (input.moderation_level === 'standard') {
    moderation_pipeline.push('[自动化] AI初筛 + 版权特征比对')
    moderation_pipeline.push('[人工] 审核队列(平均处理<24h)')
    moderation_pipeline.push('[社区] 用户举报 + 信誉分加权')
  } else {
    moderation_pipeline.push('[自动化] AI多模态审核(图像/音频/文本/代码)')
    moderation_pipeline.push('[人工] 专业审核团队(平均处理<4h)')
    moderation_pipeline.push('[安全] 沙箱环境中运行检测')
    moderation_pipeline.push('[合规] 人工终审 + 随机抽检10%')
  }
  let recommendation_algorithm = '基于内容的协同过滤 + 热度衰减排序'
  if (input.platform_type === 'mini_game') {
    recommendation_algorithm = '用户画像匹配 + 游玩时长加权 + 好友关系社交推荐'
  } else if (input.platform_type === 'map') {
    recommendation_algorithm = '难度标签匹配 + 风格偏好聚类 + 游玩完成率信号'
  }
  const incentive_structure: Record<string, unknown> = {}
  const model = input.incentive_model || 'hybrid'
  if (model === 'revenue_share' || model === 'hybrid') {
    incentive_structure['revenue_share'] = '创作者获得订阅/下载收入70%分成'
  }
  if (model === 'creator_fund' || model === 'hybrid') {
    incentive_structure['creator_fund'] = '月度创作基金池，按下载量+评分分配'
  }
  if (model === 'achievement' || model === 'hybrid') {
    incentive_structure['badges'] = ['千下载里程碑', '月度精选', '年度创作者']
  }
  const risk_mitigation = [
    'DMCA侵权投诉快速下架流程(<24h)',
    '恶意内容传播速率监控(Rt>1.5自动限流)',
    '创作者身份认证(KYC)降低匿名风险',
    '未成年人内容分级与访问控制',
  ]
  return {
    moderation_pipeline,
    recommendation_algorithm,
    incentive_structure,
    estimated_engagement_lift: `+${(15 + Math.random() * 20).toFixed(0)}%`,
    risk_mitigation,
  }
}
function formatUGC(r: UGCOutput): string {
  const lines: string[] = []
  lines.push('## UGC平台运营方案')
  lines.push('')
  lines.push('### 内容审核管线')
  r.moderation_pipeline.forEach((p, i) => lines.push(`${i + 1}. ${p}`))
  lines.push('')
  lines.push(`**推荐算法**: ${r.recommendation_algorithm}`)
  lines.push('')
  lines.push('### 激励结构')
  Object.entries(r.incentive_structure).forEach(([k, v]) => {
    lines.push(`- ${k}: ${v}`)
  })
  lines.push('')
  lines.push(`**预估活跃度提升**: ${r.estimated_engagement_lift}`)
  lines.push('')
  lines.push('### 风险管控')
  r.risk_mitigation.forEach(t => lines.push(`- ${t}`))
  lines.push('')
  lines.push(`> ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ═══════════════════════════════════════════════════════════════
   Plugin Registration
   ═══════════════════════════════════════════════════════════════ */
export function apply(ctx: Context) {
  const tools = ctx.tools

  /* Tool 1 — intelligent_npc_designer */
  tools.register(defineTool({
    name: 'intelligent_npc_designer',
    description: '智能NPC设计 — 基于行为树、对话风格与情感模型生成NPC完整设计方案，支持RPG/FPS/MOBA/沙盒等多类型。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { npc_role, game_genre, personality_traits?, interaction_depth? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatNPCDesigner(analyzeNPCDesigner(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 2 — gameplay_balancer */
  tools.register(defineTool({
    name: 'gameplay_balancer',
    description: '数值平衡分析 — 对经济系统、PVP对战、难度曲线、成长体系进行平衡评估并给出调参建议。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { game_type, balance_focus, current_metrics?, target_retention_d30? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatBalancer(analyzeBalancer(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 3 — player_behavior_analytics */
  tools.register(defineTool({
    name: 'player_behavior_analytics',
    description: '玩家行为分析 — 分析留存率、付费转化、流失预测、参与度等核心指标并给出可执行建议。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { analysis_period, metrics, segment?, sample_size? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPlayerAnalytics(analyzePlayerAnalytics(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 4 — procedural_content_gen */
  tools.register(defineTool({
    name: 'procedural_content_gen',
    description: '程序化内容生成 — 提供关卡/道具/剧情/地牢/地形的自动生成算法方案与质量门控机制。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { content_type, genre, complexity?, seed?, unique_constraints? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPCG(analyzePCG(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 5 — anti_cheat_system */
  tools.register(defineTool({
    name: 'anti_cheat_system',
    description: '反作弊系统 — 针对加速/自瞄/透视/脚本/共享账号等作弊手段提供检测方法、规则引擎与升级流程。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { detection_scope, game_mode, action_policy?, report_threshold? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAntiCheat(analyzeAntiCheat(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 6 — game_qa_automation */
  tools.register(defineTool({
    name: 'game_qa_automation',
    description: '游戏测试自动化 — 制定功能/性能/兼容/安全/回归测试计划，评估覆盖率与风险区域。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { test_scope, build_version, target_platforms, coverage_target? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatQA(analyzeQA(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 7 — esports_analytics */
  tools.register(defineTool({
    name: 'esports_analytics',
    description: '电竞数据分析 — 分析BP选人、团战模式、经济曲线、视野控制等电竞核心维度。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { game_title, match_phase, analysis_focus, team_composition? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatEsports(analyzeEsports(JSON.parse(args.input_data)))
    },
  }))

  /* Tool 8 — ugc_platform_manager */
  tools.register(defineTool({
    name: 'ugc_platform_manager',
    description: 'UGC平台管理 — 提供内容审核管线、推荐算法、创作者激励结构与风险管控方案。',
    parameters: {
      input_data: {
        type: 'string' as const,
        required: true,
        description: 'JSON: { platform_type, moderation_level, content_volume_daily, incentive_model? }',
      },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatUGC(analyzeUGC(JSON.parse(args.input_data)))
    },
  }))
}
