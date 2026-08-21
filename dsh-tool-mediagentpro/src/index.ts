import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'mediagentpro'
export const inject = ['tools']

const DISCLAIMER =
  '本分析基于AI模型推断，仅供内容运营参考，不替代专业编辑与运营决策。'

/* ─────────────────────────────────────────────
   1. content_strategy_planner
   ───────────────────────────────────────────── */
interface ContentStrategyInput {
  brand_voice?: string
  platforms?: string[]
  target_audience?: { age_range: string; interests: string[] }
  content_pillars?: Array<{ name: string; weight: number }>
  publish_frequency?: number
  calendar_horizon_days?: number
  trending_topics?: Array<{ topic: string; heat_score: number; relevance: number }>
  ip_goals?: { develop_new_ip: boolean; ip_name?: string; content_formats: string[] }
}

interface ContentStrategyResult {
  weeklyCultureCalendar: Array<{ day: string; platform: string; content_type: string; topic: string; format: string }>
  topicHotlist: Array<{ topic: string; heat_score: number; relevance: number; recommended_format: string; priority: string }>
  ipIncubationPlan: Array<{ stage: string; duration: string; actions: string[]; expected_output: string }>
  contentPillarAllocation: Array<{ pillar: string; weight: number; pieces_per_week: number }>
  kpiTargets: { total_contents_per_week: number; estimated_reach: number; engagement_rate_target: number }
}

function analyzeContentStrategy(input: ContentStrategyInput): ContentStrategyResult {
  const platforms = input.platforms || ['微信公众号', '抖音', '小红书', 'B站']
  const days = input.calendar_horizon_days || 28
  const freq = input.publish_frequency || 7
  const pillars = input.content_pillars || [
    { name: '品牌内容', weight: 0.3 },
    { name: '行业洞察', weight: 0.25 },
    { name: '用户互动', weight: 0.25 },
    { name: '产品推广', weight: 0.2 },
  ]
  const trends = input.trending_topics || []

  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const contentTypes = ['图文', '短视频', '直播', '深度文章', '互动话题', 'UGC征集', '信息图']
  const formats: Record<string, string[]> = {
    '微信公众号': ['深度文章', '图文合集'],
    '抖音': ['短视频', '直播切片'],
    '小红书': ['图文笔记', '合集', '视频教程'],
    'B站': ['中长视频', 'Vlog', '测评'],
    '快手': ['短视频', '直播'],
  }

  const calendar: ContentStrategyResult['weeklyCultureCalendar'] = []
  for (let d = 0; d < Math.min(days, 14); d++) {
    const dayName = dayNames[d % 7]
    const platform = platforms[d % platforms.length]
    const pillar = pillars[d % pillars.length]
    const ct = contentTypes[d % contentTypes.length]
    const ft = (formats[platform] || ['内容'])[0]
    calendar.push({
      day: dayName,
      platform,
      content_type: ct,
      topic: `${pillar.name} - ${trends.length > 0 ? trends[d % trends.length].topic : '创意选题'}`,
      format: ft,
    })
  }

  const topicHotlist = trends
    .sort((a, b) => b.heat_score - a.heat_score)
    .slice(0, 10)
    .map((t) => ({
      topic: t.topic,
      heat_score: t.heat_score,
      relevance: t.relevance,
      recommended_format: t.heat_score > 80 ? '短视频+直播' : t.heat_score > 60 ? '图文笔记' : '图文+互动话题',
      priority: t.heat_score > 85 ? '高' : t.heat_score > 65 ? '中' : '低',
    }))

  const ipStages: ContentStrategyResult['ipIncubationPlan'] = []
  if (input.ip_goals?.develop_new_ip) {
    ipStages.push(
      { stage: '定位期', duration: '2-4周', actions: ['确定IP人设与调性', '设计视觉识别体系', '储备首批内容'], expected_output: 'IP定位手册+首批10条内容' },
      { stage: '孵化期', duration: '4-8周', actions: ['固定栏目化输出', '跨平台同步分发', 'KOL联动造势'], expected_output: '单平台粉丝破万+日均阅读10万+' },
      { stage: '成长期', duration: '8-16周', actions: ['扩大内容矩阵', '启动商业化合作', '搭建社群私域'], expected_output: '全平台粉丝10万+形成变现闭环' },
      { stage: '成熟期', duration: '16-32周', actions: ['衍生品开发', 'IP授权拓展', '品类扩展'], expected_output: 'IP品牌化运营+多元收入结构' },
    )
  } else {
    ipStages.push(
      { stage: '持续运营', duration: '持续', actions: ['保持内容更新频率', '监控数据指标变化', '优化用户互动策略'], expected_output: '稳定粉丝增长+内容质量提升' },
    )
  }

  const pillarAllocation = pillars.map((p) => ({
    pillar: p.name,
    weight: Math.round(p.weight * 100),
    pieces_per_week: Math.max(1, Math.round(p.weight * freq)),
  }))

  return {
    weeklyCultureCalendar: calendar,
    topicHotlist,
    ipIncubationPlan: ipStages,
    contentPillarAllocation: pillarAllocation,
    kpiTargets: {
      total_contents_per_week: freq,
      estimated_reach: freq * 15000,
      engagement_rate_target: 3.5,
    },
  }
}

function formatContentStrategy(r: ContentStrategyResult): string {
  const lines: string[] = []
  lines.push('## 内容策略与选题排期报告')
  lines.push('')
  lines.push('### KPIs 目标')
  lines.push(`- **周产出目标**: ${r.kpiTargets.total_contents_per_week} 条`)
  lines.push(`- **预估周触达**: ${r.kpiTargets.estimated_reach.toLocaleString()}`)
  lines.push(`- **互动率目标**: ${r.kpiTargets.engagement_rate_target}%`)
  lines.push('')
  lines.push('### 内容支柱分配')
  lines.push('| 支柱 | 权重 | 每周条数 |')
  lines.push('|------|------|----------|')
  for (const p of r.contentPillarAllocation) {
    lines.push(`| ${p.pillar} | ${p.weight}% | ${p.pieces_per_week} |`)
  }
  lines.push('')
  lines.push('### 话题热榜 TOP 10')
  lines.push('| 排名 | 话题 | 热度 | 关联度 | 推荐格式 | 优先级 |')
  lines.push('|------|------|------|--------|----------|--------|')
  r.topicHotlist.forEach((t, i) => {
    lines.push(`| ${i + 1} | ${t.topic} | ${t.heat_score} | ${t.relevance} | ${t.recommended_format} | ${t.priority} |`)
  })
  lines.push('')
  lines.push('### 发布日历')
  lines.push('| 日期 | 平台 | 内容形式 | 主题 | 格式 |')
  lines.push('|------|------|----------|------|------|')
  for (const c of r.weeklyCultureCalendar) {
    lines.push(`| ${c.day} | ${c.platform} | ${c.content_type} | ${c.topic} | ${c.format} |`)
  }
  lines.push('')
  if (r.ipIncubationPlan.length > 0) {
    lines.push('### IP孵化计划')
    lines.push('| 阶段 | 时长 | 阶段产出 |')
    lines.push('|------|------|----------|')
    for (const s of r.ipIncubationPlan) {
      lines.push(`| ${s.stage} | ${s.duration} | ${s.expected_output} |`)
    }
    lines.push('')
    lines.push('**关键行动:**')
    for (const s of r.ipIncubationPlan) {
      for (const a of s.actions) {
        lines.push(`- [ ] [${s.stage}] ${a}`)
      }
    }
    lines.push('')
  }
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   2. audience_growth_analytics
   ───────────────────────────────────────────── */
interface AudienceGrowthInput {
  followers: Array<{ platform: string; count: number; new_30d: number; churned_30d: number }>
  demographics?: { age_groups: Record<string, number>; gender: Record<string, number>; cities: Array<{ city: string; pct: number }> }
  acquisition_channels?: Array<{ channel: string; followers: number; cost: number }>
  retention_data?: { day1: number; day7: number; day30: number }
  content_engagement?: Array<{ content_type: string; avg_views: number; avg_likes: number; avg_shares: number }>
}

interface AudienceGrowthResult {
  followersByPlatform: Array<{ platform: string; total: number; net_growth_30d: number; growth_rate: number; churn_rate: number }>
  topGrowthChannels: Array<{ channel: number; followers: number; efficiency: string; recommendation: string }>
  retentionFunnel: { day1: string; day7: string; day30: string; health: string; advice: string }
  demographicProfile: { topAgeGroup: string; dominantGender: string; topCity: string }
  contentPerformance: Array<{ content_type: string; avg_engagement: number; roi: string; recommendation: string }>
  growthRecommendations: string[]
}

function analyzeAudienceGrowth(input: AudienceGrowthInput): AudienceGrowthResult {
  const followersByPlatform = input.followers.map((f) => ({
    platform: f.platform,
    total: f.count,
    net_growth_30d: f.new_30d - f.churned_30d,
    growth_rate: f.count > 0 ? Math.round(((f.new_30d - f.churned_30d) / f.count) * 10000) / 100 : 0,
    churn_rate: f.count > 0 ? Math.round((f.churned_30d / f.count) * 10000) / 100 : 0,
  }))

  const topChannels = (input.acquisition_channels || [])
    .sort((a, b) => b.followers - a.followers)
    .slice(0, 5)
    .map((ch, i) => ({
      channel: i + 1,
      followers: ch.followers,
      efficiency: ch.cost > 0 ? `¥${(ch.cost / ch.followers).toFixed(2)}/粉` : '免费',
      recommendation: ch.followers > 10000 ? '加大投入' : ch.followers > 5000 ? '持续优化' : '评估后调整',
    }))

  const rd = input.retention_data || { day1: 45, day7: 25, day30: 12 }
  const retentionHealth = rd.day30 > 20 ? '健康' : rd.day30 > 12 ? '一般' : '需优化'
  const retentionAdvice = rd.day30 < 15 ? '建议优化首次互动体验和内容预告策略' : '保持当前运营节奏'

  const topAge = input.demographics?.age_groups
    ? Object.entries(input.demographics.age_groups).sort(([, a], [, b]) => b - a)[0]?.[0] || '-'
    : '-'
  const topGender = input.demographics?.gender
    ? Object.entries(input.demographics.gender).sort(([, a], [, b]) => b - a)[0]?.[0] || '-'
    : '-'
  const topCity = input.demographics?.cities?.sort((a, b) => b.pct - a.pct)[0]?.city || '-'

  const contentPerf = (input.content_engagement || []).map((c) => {
    const avgEngagement = ((c.avg_likes + c.avg_shares * 3) / Math.max(c.avg_views, 1)) * 100
    return {
      content_type: c.content_type,
      avg_engagement: Math.round(avgEngagement * 100) / 100,
      roi: avgEngagement > 8 ? '高' : avgEngagement > 4 ? '中' : '低',
      recommendation: avgEngagement > 8 ? '持续产出同类内容' : avgEngagement > 4 ? '优化标题和封面' : '调整内容方向',
    }
  })

  const recs: string[] = []
  const totalFollowers = input.followers.reduce((s, f) => s + f.count, 0)
  if (totalFollowers < 100000) recs.push('冷启动阶段：集中资源打造1-2个核心平台')
  if (rd.day30 < 15) recs.push('留存率偏低，建议建立内容粉丝群运营机制')
  const bestPlatform = followersByPlatform.sort((a, b) => b.growth_rate - a.growth_rate)[0]
  if (bestPlatform) recs.push(`${bestPlatform.platform}增长最快(${bestPlatform.growth_rate}%)，可重点投入`)
  recs.push('建立周度数据复盘机制追踪核心指标变化')
  recs.push('定期开展粉丝调研了解需求偏好变化')

  return {
    followersByPlatform,
    topGrowthChannels: topChannels,
    retentionFunnel: { day1: `${rd.day1}%`, day7: `${rd.day7}%`, day30: `${rd.day30}%`, health: retentionHealth, advice: retentionAdvice },
    demographicProfile: { topAgeGroup: topAge, dominantGender: topGender, topCity },
    contentPerformance: contentPerf,
    growthRecommendations: recs,
  }
}

function formatAudienceGrowth(r: AudienceGrowthResult): string {
  const lines: string[] = []
  lines.push('## 用户增长与粉丝画像报告')
  lines.push('')
  lines.push('### 各平台粉丝概览')
  lines.push('| 平台 | 总粉丝 | 30日净增长 | 增长率 | 流失率 |')
  lines.push('|------|--------|-----------|--------|--------|')
  for (const f of r.followersByPlatform) {
    lines.push(`| ${f.platform} | ${f.total.toLocaleString()} | ${f.net_growth_30d >= 0 ? '+' : ''}${f.net_growth_30d} | ${f.growth_rate}% | ${f.churn_rate}% |`)
  }
  lines.push('')
  lines.push('### 增长渠道效率')
  lines.push('| # | 粉丝获取 | 成本效率 | 建议 |')
  lines.push('|---|----------|----------|------|')
  for (const c of r.topGrowthChannels) {
    lines.push(`| ${c.channel} | ${c.followers.toLocaleString()} | ${c.efficiency} | ${c.recommendation} |`)
  }
  lines.push('')
  lines.push('### 留存漏斗')
  lines.push(`- **D1 次日留存**: ${r.retentionFunnel.day1}`)
  lines.push(`- **D7 周留存**: ${r.retentionFunnel.day7}`)
  lines.push(`- **D30 月留存**: ${r.retentionFunnel.day30}`)
  lines.push(`- **健康度**: ${r.retentionFunnel.health}`)
  lines.push(`- **建议**: ${r.retentionFunnel.advice}`)
  lines.push('')
  lines.push('### 粉丝画像')
  lines.push(`- **核心年龄段**: ${r.demographicProfile.topAgeGroup}`)
  lines.push(`- **主要性别**: ${r.demographicProfile.dominantGender}`)
  lines.push(`- **头部城市**: ${r.demographicProfile.topCity}`)
  lines.push('')
  if (r.contentPerformance.length > 0) {
    lines.push('### 内容互动表现')
    lines.push('| 内容类型 | 平均互动率 | ROI评级 | 建议 |')
    lines.push('|----------|-----------|---------|------|')
    for (const c of r.contentPerformance) {
      lines.push(`| ${c.content_type} | ${c.avg_engagement}% | ${c.roi} | ${c.recommendation} |`)
    }
    lines.push('')
  }
  lines.push('### 增长建议')
  for (const rec of r.growthRecommendations) {
    lines.push(`- [ ] ${rec}`)
  }
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   3. social_media_manager
   ───────────────────────────────────────────── */
interface SocialMediaInput {
  platforms: Array<{ name: string; account_id: string; followers: number }>
  campaign: { name: string; start_date: string; end_date: string; budget: number }
  posts: Array<{ platform: string; scheduled_time: string; content_type: string; content_summary: string }>
  trending_now: Array<{ keyword: string; volume: number; category: string }>
  competitor_activity?: Array<{ competitor: string; posts_this_week: number; avg_engagement: number }>
}

interface SocialMediaResult {
  postingSchedule: Array<{ platform: string; optimal_time: string; content_type: string; topic: string; rationale: string }>
  trendResponsePlan: Array<{ topic: string; volume: number; urgency: string; action: string; platform: string }>
  engagementBenchmarks: Array<{ platform: string; avg_likes: number; avg_comments: number; engagement_rate: number; vs_industry: string }>
  contentGaps: Array<{ platform: string; gap: string; recommendation: string }>
  weeklyKpiForecast: { total_posts: number; estimated_reach: number; estimated_engagement: number; follower_growth: number }
}

function analyzeSocialMedia(input: SocialMediaInput): SocialMediaResult {
  const optimalTimes: Record<string, string> = {
    '微信公众号': '20:00',
    '抖音': '12:00 / 18:00',
    '小红书': '11:00 / 19:00',
    'B站': '17:00 / 21:00',
    '快手': '11:00 / 17:00',
    '微博': '09:00 / 22:00',
  }

  const schedule = input.posts.slice(0, 20).map((p) => ({
    platform: p.platform,
    optimal_time: optimalTimes[p.platform] || '12:00',
    content_type: p.content_type,
    topic: p.content_summary.length > 30 ? p.content_summary.substring(0, 30) + '...' : p.content_summary,
    rationale: '基于平台流量高峰时段',
  }))

  const trendPlan = input.trending_now
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 8)
    .map((t) => {
      const urgency = t.volume > 500000 ? '立即跟进' : t.volume > 100000 ? '24h内跟进' : '本周内规划'
      return {
        topic: t.keyword,
        volume: t.volume,
        urgency,
        action: urgency === '立即跟进' ? '立即创作借势内容' : urgency === '24h内跟进' ? '规划借势选题' : '纳入选题储备',
        platform: t.category === '娱乐' ? '抖音' : t.category === '生活' ? '小红书' : t.category === '知识' ? 'B站' : '微信公众号',
      }
    })

  const benchmarks = input.platforms.map((p) => ({
    platform: p.name,
    avg_likes: Math.round(p.followers * 0.03),
    avg_comments: Math.round(p.followers * 0.005),
    engagement_rate: p.followers > 0 ? Math.round((p.followers * 0.035 / p.followers) * 10000) / 100 : 0,
    vs_industry: '持平',
  }))

  const gaps: SocialMediaResult['contentGaps'] = []
  const coveredPlatforms = new Set(input.platforms.map((p) => p.name))
  const allPlatforms = ['微信公众号', '抖音', '小红书', 'B站', '快手', '微博']
  for (const ap of allPlatforms) {
    if (!coveredPlatforms.has(ap)) {
      gaps.push({ platform: ap, gap: '未运营', recommendation: `建议开通${ap}账号进行内容分发` })
    }
  }

  return {
    postingSchedule: schedule,
    trendResponsePlan: trendPlan,
    engagementBenchmarks: benchmarks,
    contentGaps: gaps,
    weeklyKpiForecast: {
      total_posts: input.posts.length,
      estimated_reach: input.posts.length * 50000,
      estimated_engagement: input.posts.length * 1500,
      follower_growth: Math.round(input.platforms.reduce((s, p) => s + p.followers, 0) * 0.02),
    },
  }
}

function formatSocialMedia(r: SocialMediaResult): string {
  const lines: string[] = []
  lines.push('## 社媒运营策略报告')
  lines.push('')
  lines.push('### 发布排期')
  lines.push('| 平台 | 最佳时段 | 内容形式 | 主题 | 依据 |')
  lines.push('|------|----------|----------|------|------|')
  for (const s of r.postingSchedule) {
    lines.push(`| ${s.platform} | ${s.optimal_time} | ${s.content_type} | ${s.topic} | ${s.rationale} |`)
  }
  lines.push('')
  lines.push('### 热点追踪与借势')
  lines.push('| 话题 | 讨论量 | 紧急度 | 行动 | 平台 |')
  lines.push('|------|--------|--------|------|------|')
  for (const t of r.trendResponsePlan) {
    lines.push(`| ${t.topic} | ${t.volume.toLocaleString()} | ${t.urgency} | ${t.action} | ${t.platform} |`)
  }
  lines.push('')
  lines.push('### 互动率基准')
  lines.push('| 平台 | 平均点赞 | 平均评论 | 互动率 | 对标行业 |')
  lines.push('|------|----------|----------|--------|----------|')
  for (const b of r.engagementBenchmarks) {
    lines.push(`| ${b.platform} | ${b.avg_likes.toLocaleString()} | ${b.avg_comments.toLocaleString()} | ${b.engagement_rate}% | ${b.vs_industry} |`)
  }
  lines.push('')
  if (r.contentGaps.length > 0) {
    lines.push('### 运营缺口')
    for (const g of r.contentGaps) {
      lines.push(`- ⚠️ [${g.platform}] ${g.gap} → ${g.recommendation}`)
    }
    lines.push('')
  }
  lines.push('### 周度 KPI 预估')
  lines.push(`- **发布总量**: ${r.weeklyKpiForecast.total_posts} 条`)
  lines.push(`- **预估触达**: ${r.weeklyKpiForecast.estimated_reach.toLocaleString()}`)
  lines.push(`- **预估互动**: ${r.weeklyKpiForecast.estimated_engagement.toLocaleString()}`)
  lines.push(`- **预估涨粉**: ${r.weeklyKpiForecast.follower_growth.toLocaleString()}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   4. video_production_optimizer
   ───────────────────────────────────────────── */
interface VideoProductionInput {
  monthly_videos_target: number
  current_production: { avg_edit_hours: number; team_size: number; tools: string[] }
  content_types: Array<{ type: string; count_per_month: number; avg_duration_sec: number }>
  aigc_tools?: Array<{ name: string; type: string; efficiency_gain_pct: number }>
  template_usage?: { templates_created: number; reuse_rate: number; avg_time_saved_min: number }
  bottlenecks?: string[]
}

interface VideoProductionResult {
  capacityAnalysis: { current_monthly_output: number; target_gap: number; efficiency_rating: string; max_capacity: number }
  editingEfficiency: { current_avg_hours: number; optimized_avg_hours: number; tools_recommendation: string[]; potential_time_saving_pct: number }
  templateStrategy: { templates_needed: number; estimated_reuse_rate: number; time_saved_monthly_hours: number; priority_formats: string[] }
  aigcIntegration: Array<{ tool: string; gain_pct: number; implementation_effort: string; priority: string }>
  productionPipeline: Array<{ stage: string; time_pct: number; optimization: string }>
  actionPlan: string[]
}

function analyzeVideoProduction(input: VideoProductionInput): VideoProductionResult {
  const target = input.monthly_videos_target || 30
  const teamSize = input.current_production.team_size || 3
  const avgEdit = input.current_production.avg_edit_hours || 8
  const currentOutput = Math.round((teamSize * 22 * 8) / avgEdit)

  const gap = target - currentOutput
  const maxCapacity = Math.round((teamSize * 22 * 8) / (avgEdit * 0.6))
  const rating = currentOutput >= target ? '充足' : currentOutput >= target * 0.7 ? '紧张' : '不足'

  const tools = input.current_production.tools || []
  const recTools: string[] = []
  if (!tools.some((t) => t.toLowerCase().includes('ai'))) recTools.push('引入AI剪辑工具（剪映AI/Descript）')
  if (!tools.some((t) => t.toLowerCase().includes('template'))) recTools.push('建立品牌视频模板库')
  if (!tools.some((t) => t.toLowerCase().includes('project'))) recTools.push('使用项目管理工具（Tramline/Notion）')
  recTools.push('建立素材资源库复用体系')

  const optimizedAvg = avgEdit * 0.65
  const savingPct = Math.round(((avgEdit - optimizedAvg) / avgEdit) * 100)

  const templateReuseRate = input.template_usage?.reuse_rate || 30
  const templatesNeeded = Math.max(5, Math.round(target * 0.4))
  const timeSavedMonthly = Math.round(templatesNeeded * (input.template_usage?.avg_time_saved_min || 15) / 60 * 4)

  const aigcPlan = (input.aigc_tools || [
    { name: 'AI脚本生成', type: 'script', efficiency_gain_pct: 60 },
    { name: 'AI自动剪辑', type: 'edit', efficiency_gain_pct: 45 },
    { name: 'AI配音', type: 'voice', efficiency_gain_pct: 70 },
    { name: 'AI字幕翻译', type: 'subtitle', efficiency_gain_pct: 80 },
    { name: 'AI封面生成', type: 'thumbnail', efficiency_gain_pct: 50 },
  ]).map((t) => ({
    tool: t.name,
    gain_pct: t.efficiency_gain_pct,
    implementation_effort: t.efficiency_gain_pct > 60 ? '低' : t.efficiency_gain_pct > 40 ? '中' : '高',
    priority: t.efficiency_gain_pct > 60 ? '高' : t.efficiency_gain_pct > 40 ? '中' : '低',
  }))

  return {
    capacityAnalysis: {
      current_monthly_output: currentOutput,
      target_gap: gap,
      efficiency_rating: rating,
      max_capacity: maxCapacity,
    },
    editingEfficiency: {
      current_avg_hours: avgEdit,
      optimized_avg_hours: Math.round(optimizedAvg * 10) / 10,
      tools_recommendation: recTools,
      potential_time_saving_pct: savingPct,
    },
    templateStrategy: {
      templates_needed: templatesNeeded,
      estimated_reuse_rate: Math.min(70, templateReuseRate + 20),
      time_saved_monthly_hours: timeSavedMonthly,
      priority_formats: ['短视频(15-60s)', '中视频(1-5min)', '直播切片'],
    },
    aigcIntegration: aigcPlan,
    productionPipeline: [
      { stage: '选题策划', time_pct: 15, optimization: 'AI选题推荐+热点监控' },
      { stage: '脚本撰写', time_pct: 20, optimization: 'AI脚本辅助+模板复用' },
      { stage: '素材拍摄', time_pct: 25, optimization: '标准化拍摄流程+素材库调用' },
      { stage: '后期剪辑', time_pct: 25, optimization: 'AI自动剪辑+模板套用' },
      { stage: '审核发布', time_pct: 10, optimization: '合规自动化检查+定时发布' },
      { stage: '数据复盘', time_pct: 5, optimization: '自动数据报表生成' },
    ],
    actionPlan: [
      gap > 0 ? `需提升产能${gap}条/月，建议扩充团队或引入AIGC工具` : '产能充足，重点提升内容质量',
      `模板库覆盖${templatesNeeded}个高频场景，预计月省${timeSavedMonthly}小时`,
      savingPct > 30 ? 'AI工具组合可显著提升效率，建议优先落地' : '逐步引入AI工具，从脚本和字幕开始',
      ...(input.bottlenecks || []).map((b) => `优化瓶颈: ${b}`),
    ],
  }
}

function formatVideoProduction(r: VideoProductionResult): string {
  const lines: string[] = []
  lines.push('## 视频产能优化报告')
  lines.push('')
  lines.push('### 产能分析')
  lines.push(`- **当前月产量**: ${r.capacityAnalysis.current_monthly_output} 条`)
  lines.push(`- **目标差距**: ${r.capacityAnalysis.target_gap > 0 ? '+' : ''}${r.capacityAnalysis.target_gap} 条`)
  lines.push(`- **效率评级**: ${r.capacityAnalysis.efficiency_rating}`)
  lines.push(`- **最大产能**: ${r.capacityAnalysis.max_capacity} 条/月`)
  lines.push('')
  lines.push('### 剪辑效率优化')
  lines.push(`- **当前平均剪辑时长**: ${r.editingEfficiency.current_avg_hours} 小时`)
  lines.push(`- **优化后预估**: ${r.editingEfficiency.optimized_avg_hours} 小时`)
  lines.push(`- **潜在时间节省**: ${r.editingEfficiency.potential_time_saving_pct}%`)
  lines.push('- **工具推荐:**')
  for (const t of r.editingEfficiency.tools_recommendation) lines.push(`  - ${t}`)
  lines.push('')
  lines.push('### 模板策略')
  lines.push(`- **需建立模板**: ${r.templateStrategy.templates_needed} 个`)
  lines.push(`- **预估复用率**: ${r.templateStrategy.estimated_reuse_rate}%`)
  lines.push(`- **月省工时**: ${r.templateStrategy.time_saved_monthly_hours} 小时`)
  lines.push(`- **优先级格式**: ${r.templateStrategy.priority_formats.join(' → ')}`)
  lines.push('')
  if (r.aigcIntegration.length > 0) {
    lines.push('### AIGC 辅助集成')
    lines.push('| 工具 | 效率提升 | 实施难度 | 优先级 |')
    lines.push('|------|----------|----------|--------|')
    for (const a of r.aigcIntegration) lines.push(`| ${a.tool} | ${a.gain_pct}% | ${a.implementation_effort} | ${a.priority} |`)
    lines.push('')
  }
  lines.push('### 制作管线优化')
  lines.push('| 阶段 | 时间占比 | 优化方向 |')
  lines.push('|------|----------|----------|')
  for (const p of r.productionPipeline) lines.push(`| ${p.stage} | ${p.time_pct}% | ${p.optimization} |`)
  lines.push('')
  lines.push('### 行动计划')
  for (const a of r.actionPlan) lines.push(`- [ ] ${a}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   5. content_monetization
   ───────────────────────────────────────────── */
interface ContentMonetizationInput {
  platforms: Array<{ name: string; followers: number; avg_views: number; niche: string }>
  revenue_streams: Array<{ type: 'ads' | 'ecommerce' | 'knowledge' | 'brand_deal' | 'subscription'; enabled: boolean; monthly_revenue?: number }>
  content_categories: Array<{ category: string; monthly_views: number; cpm_estimate: number }>
  audience_tier?: { free_pct: number; paying_pct: number; avg_monthly_spend?: number }
  brand_deals?: Array<{ brand: string; deal_value: number; deliverables: number; performance_bonus?: number }>
}

interface ContentMonetizationResult {
  revenueBreakdown: Array<{ stream: string; monthly: number; share: string; growth_potential: string; action_items: string[] }>
  projectedMonthlyTotal: number
  projectedAnnualTotal: number
  channelRecommendations: Array<{ platform: string; best_stream: string; estimated_monthly: number; ramp_up_timeline: string }>
  pricingBenchmark: { avg_cpm: number; cost_per_follower: number; brand_deal_rate_card: Array<{ tier: string; followers_range: string; price_range: string }> }
  monetizationHealth: { score: number; status: string; top_risks: string[]; diversification_score: number }
}

function analyzeContentMonetization(input: ContentMonetizationInput): ContentMonetizationResult {
  const enabledStreams = input.revenue_streams.filter((r) => r.enabled)

  const breakdown = enabledStreams.map((s) => {
    const monthly = s.monthly_revenue || 0
    let growth = '中'
    const actions: string[] = []
    switch (s.type) {
      case 'ads':
        growth = '高'
        actions.push('优化标题CTR提升广告展示率')
        actions.push('增加视频完播率触发更多推荐')
        break
      case 'ecommerce':
        actions.push('搭建品类矩阵提升客单价')
        actions.push('优化商品讲解短视频内容')
        break
      case 'knowledge':
        growth = '高'
        actions.push('设计阶梯式付费课程体系')
        actions.push('推出年度会员订阅')
        break
      case 'brand_deal':
        actions.push('建立品牌合作案例库')
        actions.push('主动触达匹配品牌')
        break
      case 'subscription':
        actions.push('设计会员专属内容')
        actions.push('增加订阅用户福利感知')
        break
    }
    const streamName = s.type === 'ads' ? '广告收入' : s.type === 'ecommerce' ? '电商带货' : s.type === 'knowledge' ? '知识付费' : s.type === 'brand_deal' ? '品牌合作' : '订阅收入'
    return { stream: streamName, monthly, share: '', growth_potential: growth, action_items: actions }
  })

  const totalMonthly = breakdown.reduce((s, b) => s + b.monthly, 0)
  breakdown.forEach((b) => {
    b.share = totalMonthly > 0 ? `${Math.round((b.monthly / totalMonthly) * 100)}%` : '0%'
  })

  const channelRecs = input.platforms.map((p) => {
    const niche = p.niche || '生活方式'
    const bestStream = niche === '科技' ? '知识付费' : niche === '美食' ? '广告+电商' : niche === '教育' ? '知识付费+订阅' : '广告+品牌合作'
    const estimatedMonthly = Math.round(p.avg_views * 0.03 * 0.5)
    return { platform: p.name, best_stream: bestStream, estimated_monthly: estimatedMonthly, ramp_up_timeline: '8-12周见效' }
  })

  const totalFollowers = input.platforms.reduce((s, p) => s + p.followers, 0)
  const avgCpm = input.content_categories.length > 0
    ? Math.round(input.content_categories.reduce((s, c) => s + c.cpm_estimate, 0) / input.content_categories.length * 10) / 10
    : 5

  const healthScore = Math.min(100, enabledStreams.length * 15 + Math.min(30, totalMonthly / 1000) + (totalFollowers > 100000 ? 20 : totalFollowers / 5000))

  return {
    revenueBreakdown: breakdown,
    projectedMonthlyTotal: totalMonthly,
    projectedAnnualTotal: totalMonthly * 12,
    channelRecommendations: channelRecs,
    pricingBenchmark: {
      avg_cpm: avgCpm,
      cost_per_follower: Math.round(avgCpm / 10) / 100,
      brand_deal_rate_card: [
        { tier: 'KOC', followers_range: '1万-10万', price_range: `¥${(1 * 500).toLocaleString()}-${(10 * 500).toLocaleString()}` },
        { tier: '腰部KOL', followers_range: '10万-50万', price_range: `¥${(10 * 500).toLocaleString()}-${(50 * 500).toLocaleString()}` },
        { tier: '头部KOL', followers_range: '50万-200万', price_range: `¥${(50 * 500).toLocaleString()}-${(200 * 500).toLocaleString()}` },
        { tier: '超头', followers_range: '200万+', price_range: `¥${(200 * 500).toLocaleString()}+` },
      ],
    },
    monetizationHealth: {
      score: Math.round(healthScore),
      status: healthScore >= 70 ? '健康' : healthScore >= 40 ? '成长期' : '待激活',
      top_risks: enabledStreams.length < 2 ? ['收入来源单一'] : totalMonthly < 5000 ? ['收入规模偏小'] : [],
      diversification_score: Math.min(100, enabledStreams.length * 20),
    },
  }
}

function formatContentMonetization(r: ContentMonetizationResult): string {
  const lines: string[] = []
  lines.push('## 内容商业化分析报告')
  lines.push('')
  lines.push('### 收入结构')
  lines.push('| 收入类型 | 月收入 | 占比 | 增长潜力 | 行动项 |')
  lines.push('|----------|--------|------|----------|--------|')
  for (const b of r.revenueBreakdown) {
    lines.push(`| ${b.stream} | ¥${b.monthly.toLocaleString()} | ${b.share} | ${b.growth_potential} | ${b.action_items[0] || '-'} |`)
  }
  lines.push('')
  lines.push('### 收入预估')
  lines.push(`- **月度预估**: ¥${r.projectedMonthlyTotal.toLocaleString()}`)
  lines.push(`- **年度预估**: ¥${r.projectedAnnualTotal.toLocaleString()}`)
  lines.push('')
  lines.push('### 平台变现建议')
  lines.push('| 平台 | 最佳变现方式 | 预估月收入 | 启动周期 |')
  lines.push('|------|-------------|-----------|----------|')
  for (const c of r.channelRecommendations) {
    lines.push(`| ${c.platform} | ${c.best_stream} | ¥${c.estimated_monthly.toLocaleString()} | ${c.ramp_up_timeline} |`)
  }
  lines.push('')
  lines.push('### 报价参考')
  lines.push(`- **平均CPM**: ¥${r.pricingBenchmark.avg_cpm}`)
  lines.push(`- **粉单价**: ¥${r.pricingBenchmark.cost_per_follower.toFixed(2)}`)
  lines.push('| 达人层级 | 粉丝量 | 合作报价范围 |')
  lines.push('|----------|--------|-------------|')
  for (const b of r.pricingBenchmark.brand_deal_rate_card) {
    lines.push(`| ${b.tier} | ${b.followers_range} | ${b.price_range} |`)
  }
  lines.push('')
  lines.push('### 商业化健康度')
  lines.push(`- **评分**: ${r.monetizationHealth.score}/100 (${r.monetizationHealth.status})`)
  lines.push(`- **多元化程度**: ${r.monetizationHealth.diversification_score}/100`)
  if (r.monetizationHealth.top_risks.length > 0) {
    lines.push(`- **风险**: ${r.monetizationHealth.top_risks.join('、')}`)
  }
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   6. kols_matchmaker
   ───────────────────────────────────────────── */
interface KOLsMatchmakerInput {
  campaign: { brand: string; product_category: string; budget: number; platforms_preferred?: string[] }
  target_audience: { age_range: string; gender: string; interests: string[] }
  kols: Array<{
    handle: string
    platform: string
    followers: number
    engagement_rate: number
    content_categories: string[]
    price_per_post: number
    avg_views?: number
    audience_match_score?: number
    past_brand_deals?: number
  }>
}

interface KOLsMatchmakerResult {
  matchedKols: Array<{
    handle: string
    platform: string
    followers: number
    engagement_rate: number
    fee: number
    expected_roi: number
    match_score: number
    tier: string
    recommendation: string
  }>
  budgetAllocation: Array<{ kols_tier: string; count: number; total_budget: number; pct_of_budget: number }>
  roiForecast: { total_investment: number; predicted_impressions: number; predicted_engagements: number; blended_cpe: number }
  collaborationHistory: Array<{ pattern: string; insight: string; recommendation: string }>
  riskNotes: string[]
}

function analyzeKOLsMatchmaker(input: KOLsMatchmakerInput): KOLsMatchmakerResult {
  const kols = input.kols || []
  const budget = input.campaign.budget || 50000
  const preferredPlatforms = input.campaign.platforms_preferred || []

  const matched = kols.map((k) => {
    let matchScore = k.audience_match_score || 60
    if (preferredPlatforms.length > 0 && preferredPlatforms.includes(k.platform)) matchScore += 15
    if (k.content_categories.some((c) => input.target_audience.interests.some((i) => c.toLowerCase().includes(i.toLowerCase())))) matchScore += 10

    const expectedImpressions = k.avg_views || k.followers * 0.3
    const expectedEngagements = expectedImpressions * (k.engagement_rate / 100)
    const expectedConversions = expectedEngagements * 0.02
    const expectedRevenue = expectedConversions * 80
    const roi = k.price_per_post > 0 ? Math.round(((expectedRevenue - k.price_per_post) / k.price_per_post) * 100) : 0

    let tier = 'Nano'
    if (k.followers >= 1000000) tier = 'Mega'
    else if (k.followers >= 500000) tier = 'Macro'
    else if (k.followers >= 100000) tier = 'Mid-Tier'
    else if (k.followers >= 50000) tier = 'Micro'
    else if (k.followers >= 10000) tier = 'Mini'

    const rec = matchScore >= 85 ? '强烈推荐' : matchScore >= 70 ? '推荐' : matchScore >= 55 ? '可考虑' : '暂不推荐'

    return {
      handle: k.handle,
      platform: k.platform,
      followers: k.followers,
      engagement_rate: k.engagement_rate,
      fee: k.price_per_post,
      expected_roi: roi,
      match_score: Math.min(100, matchScore),
      tier,
      recommendation: rec,
    }
  }).sort((a, b) => b.match_score - a.match_score)

  const tiers: Record<string, { count: number; budget: number }> = {}
  for (const m of matched) {
    if (!tiers[m.tier]) tiers[m.tier] = { count: 0, budget: 0 }
    tiers[m.tier].count++
    tiers[m.tier].budget += m.fee
  }
  const budgetAlloc = Object.entries(tiers).map(([tier, data]) => ({
    kols_tier: tier,
    count: data.count,
    total_budget: data.budget,
    pct_of_budget: Math.round((data.budget / budget) * 100),
  }))

  const totalInvestment = matched.reduce((s, m) => s + m.fee, 0)
  const totalImpressions = matched.reduce((s, m) => s + m.followers * 0.3, 0)
  const totalEngagements = matched.reduce((s, m) => s + m.followers * 0.3 * m.engagement_rate / 100, 0)

  return {
    matchedKols: matched.slice(0, 15),
    budgetAllocation: budgetAlloc,
    roiForecast: {
      total_investment: totalInvestment,
      predicted_impressions: Math.round(totalImpressions),
      predicted_engagements: Math.round(totalEngagements),
      blended_cpe: totalEngagements > 0 ? Math.round(totalInvestment / totalEngagements * 100) / 100 : 0,
    },
    collaborationHistory: [
      { pattern: '头部+腰部组合投放', insight: '覆盖70%目标人群同时控制风险', recommendation: '3:5:2比例（头:腰:尾部）' },
      { pattern: '跨平台矩阵合作', insight: '触达不同平台用户的协同效应', recommendation: '每个核心平台至少安排2-3个KOL' },
      { pattern: '阶梯式档期', insight: '从预热到爆发再到长尾', recommendation: '按3-5-2节奏分配档期' },
    ],
    riskNotes: [
      `总报价(¥${totalInvestment.toLocaleString()})${totalInvestment > budget ? '超出预算' : '在预算范围内'}`,
      matched.filter((m) => m.recommendation === '暂不推荐').length > 0 ? '部分KOL匹配度偏低，建议替换' : '所有KOL匹配度良好',
    ],
  }
}

function formatKOLsMatchmaker(r: KOLsMatchmakerResult): string {
  const lines: string[] = []
  lines.push('## 达人匹配与ROI分析')
  lines.push('')
  lines.push('### 匹配达人 TOP 15')
  lines.push('| # | 昵称 | 平台 | 粉丝 | 互动率 | 报价 | 匹配度 | 预测ROI | 推荐 |')
  lines.push('|---|------|------|------|--------|------|--------|---------|------|')
  r.matchedKols.forEach((m, i) => {
    const followers = m.followers >= 1000000 ? `${(m.followers / 1000000).toFixed(1)}M` : m.followers >= 1000 ? `${(m.followers / 1000).toFixed(0)}K` : `${m.followers}`
    lines.push(`| ${i + 1} | ${m.handle} | ${m.platform} | ${followers} | ${m.engagement_rate}% | ¥${m.fee.toLocaleString()} | ${m.match_score} | ${m.expected_roi}% | ${m.recommendation} |`)
  })
  lines.push('')
  lines.push('### 预算分配')
  lines.push('| 达层 | 数量 | 预算合计 | 占比 |')
  lines.push('|------|------|----------|------|')
  for (const b of r.budgetAllocation) {
    lines.push(`| ${b.kols_tier} | ${b.count} | ¥${b.total_budget.toLocaleString()} | ${b.pct_of_budget}% |`)
  }
  lines.push('')
  lines.push('### ROI 预测')
  lines.push(`- **总投入**: ¥${r.roiForecast.total_investment.toLocaleString()}`)
  lines.push(`- **预估曝光**: ${r.roiForecast.predicted_impressions.toLocaleString()}`)
  lines.push(`- **预估互动**: ${r.roiForecast.predicted_engagements.toLocaleString()}`)
  lines.push(`- **综合CPE**: ¥${r.roiForecast.blended_cpe.toFixed(2)}`)
  lines.push('')
  lines.push('### 投放策略建议')
  for (const c of r.collaborationHistory) {
    lines.push(`- **${c.pattern}**: ${c.insight} → ${c.recommendation}`)
  }
  lines.push('')
  lines.push('### 风险提示')
  for (const risk of r.riskNotes) lines.push(`- ⚠️ ${risk}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   7. content_compliance_checker
   ───────────────────────────────────────────── */
interface ComplianceCheckerInput {
  content_text: string
  platform: string
  content_type: '图文' | '短视频' | '直播' | '音频'
  has_commercial_intent: boolean
  brand_mentions?: string[]
  claims_made?: string[]
  copyright_materials?: Array<{ type: string; source: string; licensed: boolean }>
  regulatory_frameworks?: Array<'广告法' | '互联网广告管理办法' | '平台规则' | 'FTC' | 'ASA'>
}

interface ComplianceCheckerResult {
  overallStatus: '合规' | '轻微风险' | '中度风险' | '严重违规'
  riskScore: number
  sensitiveWords: Array<{ word: string; category: string; severity: string; suggestion: string }>
  legalIssues: Array<{ law: string; issue: string; severity: '高' | '中' | '低'; fix_action: string }>
  copyrightIssues: Array<{ material: string; source: string; status: string; recommendation: string }>
  platformPolicy: Array<{ rule: string; status: string; details: string }>
  requiredDisclosures: string[]
  rectificationChecklist: string[]
}

function analyzeComplianceChecker(input: ComplianceCheckerInput): ComplianceCheckerResult {
  const text = input.content_text || ''

  const sensitiveWords: ComplianceCheckerResult['sensitiveWords'] = []
  const sensitivePatterns: Array<{ pattern: string; category: string; severity: string; suggestion: string }> = [
    { pattern: '最', category: '极限用语', severity: '高', suggestion: '避免使用绝对化用语' },
    { pattern: '第一', category: '极限用语', severity: '高', suggestion: '改为"行业领先"' },
    { pattern: '国家级', category: '极限用语', severity: '高', suggestion: '避免使用"国家级"表述' },
    { pattern: '顶级', category: '极限用语', severity: '中', suggestion: '改为"高品质"' },
    { pattern: '特效', category: '医疗用语', severity: '高', suggestion: '需医疗资质方可使用' },
    { pattern: '治愈', category: '医疗用语', severity: '高', suggestion: '改为"改善"' },
    { pattern: '100%', category: '绝对化用语', severity: '高', suggestion: '删除或改为"全天然"' },
    { pattern: '永久', category: '绝对化用语', severity: '中', suggestion: '改为"持久"' },
    { pattern: '最好', category: '极限用语', severity: '中', suggestion: '改为"优质"' },
    { pattern: 'NO.1', category: '极限用语', severity: '高', suggestion: '改为"领先"' },
  ]

  for (const sp of sensitivePatterns) {
    if (text.includes(sp.pattern)) {
      sensitiveWords.push({ word: sp.pattern, category: sp.category, severity: sp.severity, suggestion: sp.suggestion })
    }
  }

  const legalIssues: ComplianceCheckerResult['legalIssues'] = []
  if (input.has_commercial_intent) {
    legalIssues.push({
      law: '广告法',
      issue: '商业推广内容需明确标注广告标识',
      severity: '高',
      fix_action: '在内容开头添加"广告"标识或"品牌推广"字样',
    })
  }
  const claims = input.claims_made || []
  for (const claim of claims) {
    if (claim.includes('保证') || claim.includes('承诺') || claim.includes('绝对')) {
      legalIssues.push({
        law: '广告法',
        issue: `功效承诺"${claim}"缺乏依据`,
        severity: '中',
        fix_action: `补充客观数据依据或改为"${claim.replace(/保证|承诺/g, '有助于')}"`,
      })
    }
  }

  const copyrightIssues: ComplianceCheckerResult['copyrightIssues'] = []
  for (const m of input.copyright_materials || []) {
    copyrightIssues.push({
      material: m.type,
      source: m.source,
      status: m.licensed ? '已授权' : '未授权',
      recommendation: m.licensed ? '保留授权证明以备核查' : `需获得${m.source}的书面授权或更换素材`,
    })
  }

  const platformRules: ComplianceCheckerResult['platformPolicy'] = []
  const platformRuleMap: Record<string, string[]> = {
    '微信公众号': ['不得诱导分享', '不得虚假宣传', '外链需白名单'],
    '抖音': ['不得搬运未授权内容', '商业内容需开通蓝V', '不得诱导点赞关注'],
    '小红书': ['不得虚假种草', '广告笔记需蒲公英报备', '不得过度滤镜美化'],
    'B站': ['需原创或获得授权', '不得标题党误导', '商业合作需标注'],
    '快手': ['不得搬运未授权内容', '商业内容需开通快手粉条', '不得虚假宣传'],
  }
  const rules = platformRuleMap[input.platform] || ['请遵守平台社区规范']
  for (const rule of rules) {
    platformRules.push({ rule, status: '未检测到违规', details: '请逐条核对确保合规' })
  }

  const disclosures: string[] = []
  if (input.has_commercial_intent) disclosures.push('添加"品牌推广"或"广告"显著标识')
  if (input.brand_mentions && input.brand_mentions.length > 0) {
    disclosures.push(`品牌合作披露: ${input.brand_mentions.join('、')}为合作品牌`)
  }

  const rectification: string[] = []
  for (const sw of sensitiveWords.filter((w) => w.severity === '高')) {
    rectification.push(`替换敏感词"${sw.word}" — ${sw.suggestion}`)
  }
  for (const li of legalIssues.filter((l) => l.severity === '高')) {
    rectification.push(`法律合规: ${li.fix_action}`)
  }
  for (const ci of copyrightIssues.filter((c) => c.status === '未授权')) {
    rectification.push(`版权: ${ci.recommendation}`)
  }

  const riskScore = Math.min(100,
    sensitiveWords.filter((w) => w.severity === '高').length * 20 +
    sensitiveWords.filter((w) => w.severity === '中').length * 8 +
    legalIssues.filter((l) => l.severity === '高').length * 15 +
    copyrightIssues.filter((c) => c.status === '未授权').length * 20
  )

  let status: ComplianceCheckerResult['overallStatus'] = '合规'
  if (riskScore >= 60) status = '严重违规'
  else if (riskScore >= 30) status = '中度风险'
  else if (riskScore >= 10) status = '轻微风险'

  return {
    overallStatus: status,
    riskScore,
    sensitiveWords,
    legalIssues,
    copyrightIssues,
    platformPolicy: platformRules,
    requiredDisclosures: disclosures,
    rectificationChecklist: rectification,
  }
}

function formatComplianceChecker(r: ComplianceCheckerResult): string {
  const lines: string[] = []
  lines.push('## 内容合规检查报告')
  lines.push('')
  lines.push(`**整体状态**: ${r.overallStatus} | **风险评分**: ${r.riskScore}/100`)
  lines.push('')
  if (r.sensitiveWords.length > 0) {
    lines.push('### 敏感词检测')
    lines.push('| 词语 | 类别 | 严重度 | 建议 |')
    lines.push('|------|------|--------|------|')
    for (const w of r.sensitiveWords) {
      lines.push(`| ${w.word} | ${w.category} | ${w.severity} | ${w.suggestion} |`)
    }
    lines.push('')
  }
  if (r.legalIssues.length > 0) {
    lines.push('### 法律问题')
    lines.push('| 法规 | 问题 | 严重度 | 修复方案 |')
    lines.push('|------|------|--------|----------|')
    for (const l of r.legalIssues) {
      lines.push(`| ${l.law} | ${l.issue} | ${l.severity} | ${l.fix_action} |`)
    }
    lines.push('')
  }
  if (r.copyrightIssues.length > 0) {
    lines.push('### 版权检测')
    lines.push('| 素材 | 来源 | 状态 | 建议 |')
    lines.push('|------|------|------|------|')
    for (const c of r.copyrightIssues) {
      lines.push(`| ${c.material} | ${c.source} | ${c.status} | ${c.recommendation} |`)
    }
    lines.push('')
  }
  if (r.platformPolicy.length > 0) {
    lines.push('### 平台政策')
    lines.push('| 规则 | 状态 | 说明 |')
    lines.push('|------|------|------|')
    for (const p of r.platformPolicy) {
      lines.push(`| ${p.rule} | ${p.status} | ${p.details} |`)
    }
    lines.push('')
  }
  if (r.requiredDisclosures.length > 0) {
    lines.push('### 必要披露')
    for (const d of r.requiredDisclosures) lines.push(`- 📋 ${d}`)
    lines.push('')
  }
  if (r.rectificationChecklist.length > 0) {
    lines.push('### 整改清单')
    for (const item of r.rectificationChecklist) lines.push(`- [ ] ${item}`)
    lines.push('')
  }
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   8. cross_platform_distribution
   ───────────────────────────────────────────── */
interface CrossPlatformInput {
  content: { title: string; format: 'article' | 'video' | 'short_video' | 'live'; topics: string[]; target_audience: string }
  platforms: Array<{
    name: string
    account_age_days: number
    follower_count: number
    avg_engagement: number
    content_preferences?: string[]
    optimal_posting_time?: string
  }>
  goals?: { reach: number; engagement: number; conversion: number }
  schedule?: { publish_date: string; peak_hours?: string[] }
}

interface CrossPlatformResult {
  platformAdaptations: Array<{
    platform: string
    adapted_title: string
    format: string
    posting_time: string
    hashtags: string[]
    character_count?: number
    risk_level: string
    notes: string
  }>
  distributionSequence: Array<{ order: number; platform: string; delay_hours: string; reason: string }>
  engagementPrediction: Array<{ platform: string; estimated_reach: number; estimated_engagement: number; conversion_potential: string }>
  contentReuseMatrix: Array<{ original_format: string; target_platform: string; adaptations: string; effort: string }>
  optimizationNotes: string[]
}

function analyzeCrossPlatform(input: CrossPlatformInput): CrossPlatformResult {
  const platforms = input.platforms || []
  const content = input.content

  const platformSpecs: Record<string, { maxLength: number | null; format: string; optimalTime: string }> = {
    '微信公众号': { maxLength: 20000, format: '图文长文', optimalTime: '20:00' },
    '抖音': { maxLength: 500, format: '短视频(15s-3min)', optimalTime: '12:00' },
    '小红书': { maxLength: 1000, format: '图文笔记/短视频', optimalTime: '19:00' },
    'B站': { maxLength: 5000, format: '中长视频(3min+)', optimalTime: '17:00' },
    '快手': { maxLength: 210, format: '短视频/短文案', optimalTime: '11:00' },
    '微博': { maxLength: 5000, format: '短文+话题', optimalTime: '09:00' },
  }

  const adaptations = platforms.map((p) => {
    const spec = platformSpecs[p.name] || { maxLength: 1000, format: '通用内容', optimalTime: '12:00' }
    const title = content.title.length > (spec.maxLength || 100) / 5
      ? content.title.substring(0, Math.floor((spec.maxLength || 100) / 5)) + '...'
      : content.title
    const hashtags = content.topics.map((t) => `#${t}`).slice(0, 5)
    const notes = p.avg_engagement > 5 ? '高互动平台，重点运营' : p.follower_count > 100000 ? '大粉丝基数，适合品牌曝光' : '成长期平台，适合精准触达'

    return {
      platform: p.name,
      adapted_title: `${title}${p.name === '小红书' ? ' 📸' : p.name === '抖音' ? ' 🎵' : ''}`,
      format: spec.format,
      posting_time: p.optimal_posting_time || spec.optimalTime,
      hashtags,
      character_count: spec.maxLength ? Math.min(content.title.length * 2, spec.maxLength) : undefined,
      risk_level: '低',
      notes,
    }
  })

  const sequence = platforms
    .sort((a, b) => b.avg_engagement - a.avg_engagement)
    .map((p, i) => ({
      order: i + 1,
      platform: p.name,
      delay_hours: i === 0 ? '0h(首发)' : `${i * 2}h`,
      reason: i === 0 ? '互动率最高优先首发' : `错峰发布覆盖${p.name}核心用户活跃时段`,
    }))

  const predictions = platforms.map((p) => {
    const reach = Math.round(p.follower_count * (p.avg_engagement > 5 ? 0.4 : p.avg_engagement > 3 ? 0.3 : 0.2))
    const engagement = Math.round(reach * (p.avg_engagement / 100))
    const conv = p.avg_engagement > 5 ? '高' : p.avg_engagement > 3 ? '中' : '低'
    return { platform: p.name, estimated_reach: reach, estimated_engagement: engagement, conversion_potential: conv }
  })

  const reuseMatrix = [
    { original_format: '深度文章', target_platform: '微信公众号', adaptations: '完整排版，添加引导互动', effort: '低' },
    { original_format: '深度文章', target_platform: '小红书', adaptations: '拆分为3-5篇图文笔记', effort: '中' },
    { original_format: '短视频', target_platform: '抖音', adaptations: '竖屏3min内，热门BGM', effort: '低' },
    { original_format: '短视频', target_platform: '小红书', adaptations: '封面优化+标签适配', effort: '低' },
    { original_format: '中长视频', target_platform: 'B站', adaptations: '标题吸睛+弹幕互动引导', effort: '中' },
    { original_format: '短视频', target_platform: '快手', adaptations: '节奏加快，方言适配', effort: '中' },
  ].filter((r) => content.format === r.original_format || content.format === 'article')

  return {
    platformAdaptations: adaptations,
    distributionSequence: sequence,
    engagementPrediction: predictions,
    contentReuseMatrix: reuseMatrix,
    optimizationNotes: [
      '统一的视觉风格可提升品牌辨识度，建议制作多平台适配的封面模板',
      '上午发布微信公众号深度内容，下午/晚上发布短视频平台内容',
      '每2小时监控首波数据表现，及时调整后续平台发布策略',
      '建议各平台评论区安排互动运营提升互动率',
    ],
  }
}

function formatCrossPlatform(r: CrossPlatformResult): string {
  const lines: string[] = []
  lines.push('## 跨平台分发策略报告')
  lines.push('')
  lines.push('### 平台内容适配')
  lines.push('| 平台 | 适配标题 | 格式 | 发布时间 | 标签 | 风险 |')
  lines.push('|------|----------|------|----------|------|------|')
  for (const a of r.platformAdaptations) {
    lines.push(`| ${a.platform} | ${a.adapted_title} | ${a.format} | ${a.posting_time} | ${a.hashtags.slice(0, 3).join(' ')} | ${a.risk_level} |`)
  }
  lines.push('')
  lines.push('### 分发时序')
  lines.push('| 顺序 | 平台 | 延迟 | 理由 |')
  lines.push('|------|------|------|------|')
  for (const s of r.distributionSequence) {
    lines.push(`| ${s.order} | ${s.platform} | ${s.delay_hours} | ${s.reason} |`)
  }
  lines.push('')
  lines.push('### 互动预测')
  lines.push('| 平台 | 预估触达 | 预估互动 | 转化潜力 |')
  lines.push('|------|----------|----------|----------|')
  for (const p of r.engagementPrediction) {
    lines.push(`| ${p.platform} | ${p.estimated_reach.toLocaleString()} | ${p.estimated_engagement.toLocaleString()} | ${p.conversion_potential} |`)
  }
  lines.push('')
  if (r.contentReuseMatrix.length > 0) {
    lines.push('### 内容复用矩阵')
    lines.push('| 原始格式 | 目标平台 | 适配调整 | 工作量 |')
    lines.push('|----------|----------|----------|--------|')
    for (const m of r.contentReuseMatrix) {
      lines.push(`| ${m.original_format} | ${m.target_platform} | ${m.adaptations} | ${m.effort} |`)
    }
    lines.push('')
  }
  lines.push('### 优化建议')
  for (const n of r.optimizationNotes) lines.push(`- ${n}`)
  lines.push('')
  lines.push(`> ⚠️ ${DISCLAIMER}`)
  return lines.join('\n')
}

/* ─────────────────────────────────────────────
   Plugin Registration
   ───────────────────────────────────────────── */
export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. content_strategy_planner
  tools.register(defineTool({
    name: 'content_strategy_planner',
    description: '内容策略与选题排期 — 基于品牌调性、目标人群和话题热榜生成内容日历、选题规划和IP孵化方案',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: '{"brand_voice":"string","platforms":["string"],"target_audience":{"age_range":"string","interests":["string"]},"content_pillars":[{"name":"string","weight":0.3}],"publish_frequency":7,"calendar_horizon_days":28,"trending_topics":[{"topic":"string","heat_score":80,"relevance":70}],"ip_goals":{"develop_new_ip":true,"ip_name":"string","content_formats":["string"]}}' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatContentStrategy(analyzeContentStrategy(JSON.parse(args.input_data)))
    },
  }))

  // 2. audience_growth_analytics
  tools.register(defineTool({
    name: 'audience_growth_analytics',
    description: '用户增长分析 — 多平台粉丝画像、增长渠道效率、留存漏斗分析和内容互动表现评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: '{"followers":[{"platform":"string","count":10000,"new_30d":500,"churned_30d":100}],"demographics":{"age_groups":{"18-24":30,"25-34":45},"gender":{"女":55,"男":45},"cities":[{"city":"北京","pct":15}]},"acquisition_channels":[{"channel":"抖音","followers":5000,"cost":2000}],"retention_data":{"day1":45,"day7":25,"day30":12},"content_engagement":[{"content_type":"短视频","avg_views":50000,"avg_likes":2500,"avg_shares":300}]}' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatAudienceGrowth(analyzeAudienceGrowth(JSON.parse(args.input_data)))
    },
  }))

  // 3. social_media_manager
  tools.register(defineTool({
    name: 'social_media_manager',
    description: '社媒运营策略 — 多平台排期管理、热点借势规划和互动率基准分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: '{"platforms":[{"name":"公众号","account_id":"id","followers":100000}],"campaign":{"name":"双11推广","start_date":"2024-11-01","end_date":"2024-11-12","budget":50000},"posts":[{"platform":"抖音","scheduled_time":"2024-11-05T18:00:00","content_type":"短视频","content_summary":"双十一好物推荐"}],"trending_now":[{"keyword":"双11攻略","volume":500000,"category":"生活"}]}' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSocialMedia(analyzeSocialMedia(JSON.parse(args.input_data)))
    },
  }))

  // 4. video_production_optimizer
  tools.register(defineTool({
    name: 'video_production_optimizer',
    description: '视频产能优化 — 剪辑效率分析、模板化策略和AIGC辅助工具集成建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: '{"monthly_videos_target":30,"current_production":{"avg_edit_hours":8,"team_size":3,"tools":["剪映","Premiere"]},"content_types":[{"type":"知识科普","count_per_month":15,"avg_duration_sec":120}],"aigc_tools":[{"name":"AI脚本","type":"script","efficiency_gain_pct":60}],"template_usage":{"templates_created":5,"reuse_rate":30,"avg_time_saved_min":15},"bottlenecks":["后期剪辑时间长","选题策划慢"]}' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatVideoProduction(analyzeVideoProduction(JSON.parse(args.input_data)))
    },
  }))

  // 5. content_monetization
  tools.register(defineTool({
    name: 'content_monetization',
    description: '内容商业化分析 — 广告/电商/知识付费/品牌合作等多元收入结构分析和报价参考',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: '{"platforms":[{"name":"抖音","followers":500000,"avg_views":200000,"niche":"科技"}],"revenue_streams":[{"type":"ads","enabled":true,"monthly_revenue":15000},{"type":"knowledge","enabled":true,"monthly_revenue":8000}],"content_categories":[{"category":"数码测评","monthly_views":500000,"cpm_estimate":8}],"brand_deals":[{"brand":"某品牌","deal_value":50000,"deliverables":2}]}' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatContentMonetization(analyzeContentMonetization(JSON.parse(args.input_data)))
    },
  }))

  // 6. kols_matchmaker
  tools.register(defineTool({
    name: 'kols_matchmaker',
    description: '达人匹配与ROI分析 — 根据品牌目标和预算筛选KOL，预测互动量和投放策略',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: '{"campaign":{"brand":"品牌A","product_category":"美妆","budget":100000,"platforms_preferred":["小红书","抖音"]},"target_audience":{"age_range":"18-30","gender":"女","interests":["美妆","穿搭"]},"kols":[{"handle":"@博主A","platform":"小红书","followers":200000,"engagement_rate":5.2,"content_categories":["美妆","护肤"],"price_per_post":15000,"avg_views":60000}]}' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatKOLsMatchmaker(analyzeKOLsMatchmaker(JSON.parse(args.input_data)))
    },
  }))

  // 7. content_compliance_checker
  tools.register(defineTool({
    name: 'content_compliance_checker',
    description: '内容合规检查 — 敏感词检测、版权评估、广告法合规和政策风险分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: '{"content_text":"推荐内容文字...","platform":"小红书","content_type":"图文","has_commercial_intent":true,"brand_mentions":["品牌A"],"claims_made":["7天见效"],"copyright_materials":[{"type":"BGM","source":"某音乐平台","licensed":true}],"regulatory_frameworks":["广告法","平台规则"]}' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatComplianceChecker(analyzeComplianceChecker(JSON.parse(args.input_data)))
    },
  }))

  // 8. cross_platform_distribution
  tools.register(defineTool({
    name: 'cross_platform_distribution',
    description: '跨平台分发策略 — 自动适配各平台格式、时序安排和互动预测，覆盖微信/抖音/小红书/B站/快手等',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: '{"content":{"title":"内容标题","format":"short_video","topics":["话题1","话题2"],"target_audience":"年轻女性"},"platforms":[{"name":"抖音","account_age_days":365,"follower_count":100000,"avg_engagement":4.5,"optimal_posting_time":"18:00"}],"goals":{"reach":1000000,"engagement":50000},"schedule":{"publish_date":"2024-11-05"}}' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCrossPlatform(analyzeCrossPlatform(JSON.parse(args.input_data)))
    },
  }))
}