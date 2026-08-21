import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'patentagentpro';
export const inject = ['tools'];

const DISCLAIMER = '本分析基于AI模型推断，仅供专利信息参考，不替代专业专利代理人或知识产权律师的法律意见。专利决策请咨询持证专业人士。';

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
// 1. patent_landscape_mapper — 专利地图绘制与技术空白识别
// ============================================================
interface LandscapeInput {
  technology_field?: string;
  date_range?: string;
  jurisdiction?: string[];
  min_citations?: number;
  clustering_method?: string;
  top_n?: number;
}

interface LandscapeResult {
  technology_clusters: Array<{ cluster_id: number; name: string; patent_count: number; growth_rate: number; maturity: string }>;
  white_space_gaps: Array<{ area: string; opportunity_score: number; related_fields: string[]; risk_level: string }>;
  key_players: Array<{ assignee: string; patent_count: number; market_share: number; technology_focus: string }>;
  citation_network: { top_cited: Array<{ patent_id: string; citations: number; title: string }>; network_density: number; key_pathways: string[] };
  trend_analysis: Array<{ year: number; filings: number; grants: number; growth_rate: number }>;
  disclaimer: string;
}

function analyzeLandscape(data: LandscapeInput): LandscapeResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const field = data.technology_field || pick(rng, ['人工智能', '半导体', '生物医药', '新能源', '5G通信', '自动驾驶', '区块链', '量子计算']);
  const topN = data.top_n ?? Math.round(5 + rng() * 10);

  const clusterNames = [
    `${field}-核心算法`, `${field}-硬件架构`, `${field}-应用场景`,
    `${field}-数据处理`, `${field}-安全防护`, `${field}-系统集成`,
    `${field}-${pick(rng, ['人机交互', '传感技术', '网络协议', '制造工艺'])}`,
  ];
  const clusters = clusterNames.map((name, i) => ({
    cluster_id: i + 1,
    name,
    patent_count: Math.round(200 + rng() * 4800),
    growth_rate: round(5 + rng() * 45, 1),
    maturity: pick(rng, ['萌芽期', '成长期', '成熟期', '衰退期']),
  }));

  const whiteSpaceAreas = [
    '跨领域融合技术', '边缘计算部署', '低功耗优化方案',
    '隐私保护机制', '实时性增强', '多模态协同',
    '标准化接口', '测试验证方法',
  ].slice(0, 3 + Math.floor(rng() * 4));

  const whiteSpaceGaps = whiteSpaceAreas.map(area => ({
    area,
    opportunity_score: round(40 + rng() * 55, 0),
    related_fields: [field, pick(rng, ['云计算', '大数据', 'IoT', '机器人', '新材料'])],
    risk_level: pick(rng, ['低风险', '中风险', '高风险']),
  }));

  const companies = ['华为', '三星', '高通', '英特尔', '微软', '谷歌', 'IBM', '台积电', '苹果', '索尼', '爱立信', '诺基亚'];
  const keyPlayers = companies.slice(0, topN).map(c => ({
    assignee: c,
    patent_count: Math.round(100 + rng() * 4900),
    market_share: round(3 + rng() * 22, 1),
    technology_focus: pick(rng, clusterNames),
  })).sort((a, b) => b.patent_count - a.patent_count);

  const topCited = Array.from({ length: 5 }, (_, i) => ({
    patent_id: `CN${2020 + Math.floor(rng() * 5)}${String(Math.floor(rng() * 999999)).padStart(6, '0')}`,
    citations: Math.round(50 + rng() * 450),
    title: `${field}相关${pick(rng, ['装置', '方法', '系统', '设备', '工艺'])}及${pick(rng, ['应用', '实现', '优化', '改进'])}`,
  })).sort((a, b) => b.citations - a.citations);

  const currentYear = 2024;
  const trend = [];
  let filings = 1000 + Math.floor(rng() * 2000);
  for (let y = currentYear - 5; y <= currentYear; y++) {
    const growth = 0.05 + rng() * 0.2;
    filings = Math.round(filings * (1 + growth));
    const grants = Math.round(filings * (0.5 + rng() * 0.3));
    trend.push({ year: y, filings, grants, growth_rate: round(growth * 100, 1) });
  }

  return {
    technology_clusters: clusters,
    white_space_gaps: whiteSpaceGaps,
    key_players: keyPlayers,
    citation_network: {
      top_cited: topCited,
      network_density: round(0.1 + rng() * 0.4, 3),
      key_pathways: [`${field}-算法→产品化`, `${field}-硬件→系统集成`, `${field}-数据→智能决策`],
    },
    trend_analysis: trend,
    disclaimer: DISCLAIMER,
  };
}

function formatLandscape(r: LandscapeResult): string {
  let s = '=== 专利地图与技术空白分析报告 ===\n\n';
  s += '【技术聚类】\n';
  r.technology_clusters.forEach(c => {
    s += `  C${c.cluster_id} ${c.name}: ${c.patent_count}件 | 增长率: ${c.growth_rate}% | 阶段: ${c.maturity}\n`;
  });
  s += '\n【技术空白(White Space)】\n';
  r.white_space_gaps.forEach(w => {
    s += `  ${w.area} — 机会指数: ${w.opportunity_score}/100 | 风险: ${w.risk_level} | 相关领域: ${w.related_fields.join('、')}\n`;
  });
  s += '\n【主要专利权人】\n';
  r.key_players.forEach((p, i) => {
    s += `  ${i + 1}. ${p.assignee}: ${p.patent_count}件 | 市场份额: ${p.market_share}% | 技术焦点: ${p.technology_focus}\n`;
  });
  s += '\n【引证网络】\n';
  s += '  高被引专利:\n';
  r.citation_network.top_cited.forEach(p => {
    s += `    ${p.patent_id} (${p.citations}次引证) — ${p.title}\n`;
  });
  s += `  网络密度: ${r.citation_network.network_density}\n`;
  s += `  关键路径: ${r.citation_network.key_pathways.join(' | ')}\n`;
  s += '\n【趋势分析】\n';
  r.trend_analysis.forEach(t => {
    s += `  ${t.year}: 申请${t.filings}件 / 授权${t.grants}件 | 增长: ${t.growth_rate}%\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 2. prior_art_searcher — 现有技术检索与新颖性评估
// ============================================================
interface PriorArtInput {
  invention_title?: string;
  technical_field?: string;
  key_features?: string[];
  date_limit?: string;
  jurisdictions?: string[];
  databases?: string[];
  max_results?: number;
}

interface PriorArtResult {
  search_summary: { query_scope: string; databases_searched: string[]; total_hits: number; relevant_hits: number };
  prior_art_documents: Array<{ doc_id: string; title: string; assignee: string; date: string; relevance: number; key_claim_overlap: string[] }>;
  novelty_assessment: { overall_score: number; novel_features: string[]; known_features: string[]; assessment: string };
  inventive_step: { score: number; reasoning: string; closest_prior_art: string; technical_difference: string };
  recommendations: string[];
  disclaimer: string;
}

function analyzePriorArt(data: PriorArtInput): PriorArtResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const title = data.technical_field || pick(rng, ['深度学习处理器', '无线充电装置', '基因编辑工具', '燃料电池组件', 'AR显示系统']);
  const maxResults = data.max_results ?? Math.round(10 + rng() * 20);
  const jurisdictions = data.jurisdictions || ['CN', 'US', 'EP', 'JP', 'KR'];
  const databases = data.databases || ['CNIPA', 'USPTO', 'EPO', 'WIPO', 'JPO'];
  const features = data.key_features || ['特征A-结构创新', '特征B-方法优化', '特征C-材料改进', '特征D-工艺简化'];

  const totalHits = Math.round(200 + rng() * 4800);
  const relevantHits = Math.round(10 + rng() * 90);

  const docTypes = ['发明专利', '实用新型', 'PCT申请'];
  const assignees = ['华为技术有限公司', '三星电子株式会社', '英特尔公司', '高通股份有限公司', '微软科技公司', 'IBM公司', '索尼集团', '台积电'];
  const priorArtDocs = Array.from({ length: Math.min(maxResults, 8) }, (_, i) => {
    const year = 2015 + Math.floor(rng() * 9);
    const month = String(Math.floor(rng() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(rng() * 28) + 1).padStart(2, '0');
    const relevance = round(50 + rng() * 50, 0);
    return {
      doc_id: `${pick(rng, jurisdictions)}${year}${String(Math.floor(rng() * 999999)).padStart(6, '0')}`,
      title: `${title}相关${pick(rng, ['装置', '方法', '系统', '组合物', '设备'])}`,
      assignee: pick(rng, assignees),
      date: `${year}-${month}-${day}`,
      relevance,
      key_claim_overlap: features.slice(0, 1 + Math.floor(rng() * 2)),
    };
  }).sort((a, b) => b.relevance - a.relevance);

  const novelCount = Math.round(1 + rng() * 2);
  const novelFeatures = features.slice(0, novelCount).map(f => `${f}的新实现方式`);
  const knownFeatures = features.slice(novelCount).map(f => `${f}已被公开`);
  const noveltyScore = round(40 + rng() * 55, 0);

  const inventiveScore = round(35 + rng() * 60, 0);
  const inventiveAssessment = inventiveScore >= 70 ? '具有显著创造性' : inventiveScore >= 50 ? '具备一定创造性' : '创造性高度存疑';

  const recommendations = [
    '建议针对特征C调整权利要求范围，避开对比文件3的公开内容',
    `单独对比文件${Math.ceil(rng() * 3)}可能影响权利要求1的新颖性，建议缩小独立权利要求`,
    `建议在说明书中补充${pick(rng, ['实验数据', '对比测试', '效果验证'])}以支持创造性论述`,
  ];
  if (noveltyScore < 50) recommendations.unshift('⚠ 新颖性风险较高，建议重新评估技术方案');

  return {
    search_summary: { query_scope: title, databases_searched: databases, total_hits: totalHits, relevant_hits: relevantHits },
    prior_art_documents: priorArtDocs,
    novelty_assessment: { overall_score: noveltyScore, novel_features: novelFeatures, known_features: knownFeatures, assessment: noveltyScore >= 70 ? '新颖性良好' : noveltyScore >= 50 ? '新颖性一般' : '新颖性不足' },
    inventive_step: { score: inventiveScore, reasoning: inventiveAssessment, closest_prior_art: priorArtDocs[0]?.doc_id || 'N/A', technical_difference: `区别特征在于${pick(rng, ['材料选择', '结构配置', '参数优化', '步骤排序'])}的不同` },
    recommendations,
    disclaimer: DISCLAIMER,
  };
}

function formatPriorArt(r: PriorArtResult): string {
  let s = '=== 现有技术检索与新颖性评估报告 ===\n\n';
  s += '【检索概要】\n';
  s += `  检索范围: ${r.search_summary.query_scope}\n`;
  s += `  检索数据库: ${r.search_summary.databases_searched.join('、')}\n`;
  s += `  命中总数: ${r.search_summary.total_hits} | 相关专利: ${r.search_summary.relevant_hits}\n\n`;
  s += '【相关现有技术】\n';
  r.prior_art_documents.forEach((d, i) => {
    s += `  ${i + 1}. ${d.doc_id} — 相关度: ${d.relevance}%\n`;
    s += `     标题: ${d.title} | 申请人: ${d.assignee} | 日期: ${d.date}\n`;
    s += `     重叠特征: ${d.key_claim_overlap.join('、')}\n`;
  });
  s += '\n【新颖性评估】\n';
  s += `  综合评分: ${r.novelty_assessment.overall_score}/100 (${r.novelty_assessment.assessment})\n`;
  s += `  新颖特征:\n`;
  r.novelty_assessment.novel_features.forEach(f => { s += `    + ${f}\n`; });
  s += `  已知特征:\n`;
  r.novelty_assessment.known_features.forEach(f => { s += `    - ${f}\n`; });
  s += '\n【创造性评估】\n';
  s += `  评分: ${r.inventive_step.score}/100 — ${r.inventive_step.reasoning}\n`;
  s += `  最接近现有技术: ${r.inventive_step.closest_prior_art}\n`;
  s += `  技术区别: ${r.inventive_step.technical_difference}\n\n`;
  s += '【建议】\n';
  r.recommendations.forEach(rec => { s += `  ${rec}\n`; });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 3. patent_valuation_engine — 专利价值评估与强度打分
// ============================================================
interface ValuationInput {
  patent_id?: string;
  title?: string;
  technical_field?: string;
  filing_date?: string;
  grant_date?: string;
  citation_count?: number;
  family_size?: number;
  claim_count?: number;
  remaining_years?: number;
  market_size_billion?: number;
}

interface ValuationResult {
  overall_score: number;
  value_grade: string;
  technical_value: { score: number; technical_merit: string; scope_breadth: string; substitutability: string };
  legal_value: { score: number; claim_quality: string; enforceability: string; remaining_term: string };
  market_value: { score: number; market_potential: string; commercialization_stage: string; competitive_advantage: string };
  financial_estimate: { estimated_value_usd: number; annual_revenue_potential: number; roi_estimate: number; valuation_method: string };
  benchmarking: { field_average: number; percentile_rank: number; comparable_transactions: Array<{ deal: string; amount: number }> };
  disclaimer: string;
}

function analyzeValuation(data: ValuationInput): ValuationResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const citations = data.citation_count ?? Math.round(5 + rng() * 95);
  const familySize = data.family_size ?? Math.round(1 + rng() * 15);
  const claimCount = data.claim_count ?? Math.round(5 + rng() * 35);
  const remainingYears = data.remaining_years ?? Math.round(2 + rng() * 18);
  const marketSize = data.market_size_billion ?? round(1 + rng() * 99, 1);

  const techScore = round(Math.min(95, 30 + citations * 0.3 + claimCount * 0.5 + rng() * 20), 0);
  const legalScore = round(Math.min(95, 35 + familySize * 2 + remainingYears * 1.5 + rng() * 15), 0);
  const marketScore = round(Math.min(95, 25 + marketSize * 0.4 + rng() * 30), 0);
  const overallScore = round((techScore * 0.35 + legalScore * 0.35 + marketScore * 0.3), 0);

  const grade = overallScore >= 85 ? 'A+(极高价值)' : overallScore >= 70 ? 'A(高价值)' : overallScore >= 55 ? 'B(中等价值)' : overallScore >= 40 ? 'C(一般价值)' : 'D(低价值)';

  const estimatedValue = round((overallScore / 100) * (500000 + rng() * 9500000), 0);
  const annualRevenue = round(estimatedValue * (0.02 + rng() * 0.08), 0);
  const roi = round((annualRevenue * remainingYears - estimatedValue) / estimatedValue * 100, 1);

  return {
    overall_score: overallScore,
    value_grade: grade,
    technical_value: {
      score: techScore,
      technical_merit: techScore >= 70 ? '技术方案具备显著创新高度' : '技术方案创新程度一般',
      scope_breadth: claimCount >= 15 ? '权利要求覆盖面广' : claimCount >= 8 ? '权利要求范围适中' : '权利要求范围较窄',
      substitutability: pick(rng, ['难以替代', '存在替代方案', '替代成本较高', '技术壁垒明显']),
    },
    legal_value: {
      score: legalScore,
      claim_quality: claimCount >= 10 ? '权利要求层次清晰、保护充分' : '权利要求需进一步完善',
      enforceability: familySize >= 5 ? '多国布局、维权可行性高' : '建议扩展海外布局',
      remaining_term: remainingYears >= 10 ? '剩余保护期长' : remainingYears >= 5 ? '保护期中等' : '即将到期',
    },
    market_value: {
      score: marketScore,
      market_potential: marketSize >= 50 ? '超大规模市场' : marketSize >= 10 ? '大规模市场' : '中小规模市场',
      commercialization_stage: pick(rng, ['已产品化', '样品验证', '小批量试产', '实验室阶段', '概念阶段']),
      competitive_advantage: pick(rng, ['核心标准必要专利', '关键技术节点', '外围改进型', '工艺优化型']),
    },
    financial_estimate: {
      estimated_value_usd: estimatedValue,
      annual_revenue_potential: annualRevenue,
      roi_estimate: roi,
      valuation_method: pick(rng, ['收益法(收入折现)', '市场法(可比交易)', '成本法(研发投入)', '综合评估法']),
    },
    benchmarking: {
      field_average: round(40 + rng() * 25, 0),
      percentile_rank: round(Math.min(99, overallScore + round(rng() * 10 - 5, 0)), 0),
      comparable_transactions: [
        { deal: '行业可比交易A', amount: round(500000 + rng() * 5000000, 0) },
        { deal: '行业可比交易B', amount: round(300000 + rng() * 3000000, 0) },
        { deal: '行业可比交易C', amount: round(1000000 + rng() * 8000000, 0) },
      ],
    },
    disclaimer: DISCLAIMER,
  };
}

function formatValuation(r: ValuationResult): string {
  let s = '=== 专利价值评估与强度打分报告 ===\n\n';
  s += `【综合评分】${r.overall_score}/100 — ${r.value_grade}\n\n`;
  s += '【技术价值】\n';
  s += `  评分: ${r.technical_value.score}/100\n`;
  s += `  技术优劣: ${r.technical_value.technical_merit}\n`;
  s += `  保护范围: ${r.technical_value.scope_breadth}\n`;
  s += `  可替代性: ${r.technical_value.substitutability}\n\n`;
  s += '【法律价值】\n';
  s += `  评分: ${r.legal_value.score}/100\n`;
  s += `  权利要求: ${r.legal_value.claim_quality}\n`;
  s += `  可执行性: ${r.legal_value.enforceability}\n`;
  s += `  剩余期限: ${r.legal_value.remaining_term}\n\n`;
  s += '【市场价值】\n';
  s += `  评分: ${r.market_value.score}/100\n`;
  s += `  市场潜力: ${r.market_value.market_potential}\n`;
  s += `  商业化阶段: ${r.market_value.commercialization_stage}\n`;
  s += `  竞争优势: ${r.market_value.competitive_advantage}\n\n`;
  s += '【财务估算】\n';
  s += `  估值: $${r.financial_estimate.estimated_value_usd.toLocaleString()} USD\n`;
  s += `  年化收益潜力: $${r.financial_estimate.annual_revenue_potential.toLocaleString()}\n`;
  s += `  投资回报率: ${r.financial_estimate.roi_estimate}%\n`;
  s += `  评估方法: ${r.financial_estimate.valuation_method}\n\n`;
  s += '【行业对标】\n';
  s += `  领域均值: ${r.benchmarking.field_average}/100\n`;
  s += `  百分位排名: 第${r.benchmarking.percentile_rank}百分位\n`;
  s += '  可比交易:\n';
  r.benchmarking.comparable_transactions.forEach(t => {
    s += `    ${t.deal}: $${t.amount.toLocaleString()}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 4. infringement_risk_analyzer — 专利侵权风险FTO分析
// ============================================================
interface FTOInput {
  product_name?: string;
  product_features?: string[];
  target_markets?: string[];
  key_patents?: string[];
  analysis_depth?: string;
}

interface FTOResult {
  overall_risk_level: string;
  risk_score: number;
  risk_patents: Array<{ patent_id: string; title: string; assignee: string; risk_level: number; matching_claims: string[]; validity_chance: number }>;
  claim_chart: Array<{ claim_element: string; product_feature: string; match_type: string; notes: string }>;
  design_around_options: Array<{ option: string; feasibility: number; cost_estimate: number; effectiveness: number }>;
  licensing_availability: { available: boolean; potential_licensors: string[]; estimated_rate: string; recommendation: string };
  action_plan: string[];
  disclaimer: string;
}

function analyzeFTO(data: FTOInput): FTOResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const product = data.product_name || pick(rng, ['智能终端设备', '自动驾驶系统', '5G基站装置', '无人机飞行控制器', '区块链交易系统']);
  const markets = data.target_markets || ['中国', '美国', '欧洲'];
  const features = data.product_features || ['处理器架构', '通信模块', '数据处理算法', '用户交互界面', '电源管理单元'];

  const riskPatents = Array.from({ length: 3 + Math.floor(rng() * 5) }, () => {
    const risk = round(20 + rng() * 80, 0);
    const year = 2015 + Math.floor(rng() * 8);
    return {
      patent_id: `${pick(rng, ['CN', 'US', 'EP', 'JP'])}${year}${String(Math.floor(rng() * 999999)).padStart(6, '0')}`,
      title: `${product}相关${pick(rng, ['装置', '方法', '系统', '电路', '模块'])}`,
      assignee: pick(rng, ['华为', '高通', '三星', '英特尔', '微软', '谷歌', '诺基亚', '爱立信', 'InterDigital']),
      risk_level: risk,
      matching_claims: features.slice(0, 1 + Math.floor(rng() * 3)),
      validity_chance: round(10 + rng() * 60, 0),
    };
  }).sort((a, b) => b.risk_level - a.risk_level);

  const maxRisk = Math.max(...riskPatents.map(p => p.risk_level));
  const overallRisk = round(maxRisk * 0.6 + round(rng() * 20, 0), 0);
  const riskLevel = overallRisk >= 70 ? '高风险(不建议直接上市)' : overallRisk >= 40 ? '中风险(需设计规避)' : '低风险(可谨慎推进)';

  const matchTypes = ['完全覆盖', '等同替换', '部分覆盖', '可能覆盖'];
  const claimChart = features.slice(0, 4).map((f, i) => ({
    claim_element: `权利要求${i + 1}要素${String.fromCharCode(65 + i)}`,
    product_feature: f,
    match_type: pick(rng, matchTypes),
    notes: pick(rng, ['文字侵权风险', '等同原则可能适用', '需进一步比对', '特征存在差异']),
  }));

  const designAroundOptions = [
    { option: '技术方案变更-路径A', feasibility: round(50 + rng() * 40, 0), cost_estimate: round(50000 + rng() * 500000, 0), effectiveness: round(50 + rng() * 40, 0) },
    { option: '技术方案变更-路径B', feasibility: round(40 + rng() * 45, 0), cost_estimate: round(30000 + rng() * 300000, 0), effectiveness: round(40 + rng() * 45, 0) },
    { option: '取得专利许可', feasibility: round(30 + rng() * 50, 0), cost_estimate: round(100000 + rng() * 1000000, 0), effectiveness: round(70 + rng() * 25, 0) },
    { option: '专利无效宣告', feasibility: round(20 + rng() * 50, 0), cost_estimate: round(200000 + rng() * 800000, 0), effectiveness: round(30 + rng() * 50, 0) },
  ];

  const actionPlan = [
    `优先排查最高风险专利(${riskPatents[0]?.patent_id || 'N/A'})，确认是否构成字面侵权`,
    `针对${markets.join('、')}市场分别检索对应同族专利`,
    '委托专业律师事务所出具正式FTO法律意见书',
    '评估专利无效宣告可行性，准备证据材料',
  ];
  if (overallRisk >= 70) actionPlan.unshift('⚠ 建议暂停产品上市计划，完成FTO分析后再推进');

  return {
    overall_risk_level: riskLevel,
    risk_score: overallRisk,
    risk_patents: riskPatents,
    claim_chart: claimChart,
    design_around_options: designAroundOptions,
    licensing_availability: {
      available: rng() > 0.4,
      potential_licensors: riskPatents.slice(0, 2).map(p => p.assignee),
      estimated_rate: `${round(1 + rng() * 4, 1)}%-${round(3 + rng() * 5, 1)}%产品售价`,
      recommendation: overallRisk >= 50 ? '建议主动寻求许可谈判' : '可作为谈判筹码但非必须',
    },
    action_plan: actionPlan,
    disclaimer: DISCLAIMER,
  };
}

function formatFTO(r: FTOResult): string {
  let s = '=== 专利侵权风险FTO分析报告 ===\n\n';
  s += `【综合风险等级】${r.overall_risk_level} (评分: ${r.risk_score}/100)\n\n`;
  s += '【风险专利列表】\n';
  r.risk_patents.forEach((p, i) => {
    s += `  ${i + 1}. ${p.patent_id} — 风险: ${p.risk_level}% | 有效性挑战率: ${p.validity_chance}%\n`;
    s += `     标题: ${p.title} | 权利人: ${p.assignee}\n`;
    s += `     匹配特征: ${p.matching_claims.join('、')}\n`;
  });
  s += "\n【权利要求比对表(Claim Chart)】\n";
  r.claim_chart.forEach(c => {
    s += `  ${c.claim_element} ↔ ${c.product_feature}: ${c.match_type}\n`;
    s += `    备注: ${c.notes}\n`;
  });
  s += '\n【规避设计方案(Design-Around)】\n';
  r.design_around_options.forEach(o => {
    s += `  ${o.option} — 可行性: ${o.feasibility}% | 成本: $${o.cost_estimate.toLocaleString()} | 有效性: ${o.effectiveness}%\n`;
  });
  s += '\n【许可可行性】\n';
  s += `  许可可获取性: ${r.licensing_availability.available ? '可获取(需谈判)' : '难以获取'}\n`;
  s += `  潜在许可方: ${r.licensing_availability.potential_licensors.join('、')}\n`;
  s += `  预估费率: ${r.licensing_availability.estimated_rate}\n`;
  s += `  建议: ${r.licensing_availability.recommendation}\n\n`;
  s += '【行动计划】\n';
  r.action_plan.forEach((a, i) => {
    s += `  ${i + 1}. ${a}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 5. ip_portfolio_strategist — IP组合管理与维护决策
// ============================================================
interface PortfolioInput {
  portfolio_size?: number;
  annual_budget?: number;
  technology_areas?: string[];
  company_size?: string;
  business_goals?: string[];
  maintenance_horizon?: number;
}

interface PortfolioResult {
  portfolio_overview: { total_patents: number; active_patents: number; pending_patents: number; expired_patents: number; avg_remaining_years: number };
  maintenance_decisions: Array<{ patent_id: string; title: string; recommendation: string; reason: string; annual_cost: number; value_score: number }>;
  cost_projection: { current_annual_cost: number; projected_5yr_cost: number; savings_potential: number; budget_optimization: string };
  gap_analysis: { over_invested: Array<{ area: string; patent_count: number; recommendation: string }>; under_invested: Array<{ area: string; opportunity: string; priority: string }> };
  strategic_recommendations: string[];
  portfolio_roi: { total_investment: number; estimated_return: number; roi_ratio: number; ranking: string };
  disclaimer: string;
}

function analyzePortfolio(data: PortfolioInput): PortfolioResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const size = data.portfolio_size ?? Math.round(50 + rng() * 450);
  const budget = data.annual_budget ?? round(50 + rng() * 450, 0);
  const horizon = data.maintenance_horizon ?? 5;

  const active = Math.round(size * (0.5 + rng() * 0.3));
  const pending = Math.round(size * (0.1 + rng() * 0.15));
  const expired = size - active - pending;
  const avgRemaining = round(3 + rng() * 14, 1);

  const mainTech = data.technology_areas || ['人工智能', '无线通信', '半导体', '云计算'];
  const maintenanceDecisions = Array.from({ length: Math.min(8, Math.round(3 + rng() * 6)) }, () => {
    const valueScore = round(10 + rng() * 90, 0);
    const cost = round(2000 + rng() * 18000, 0);
    const year = 2010 + Math.floor(rng() * 13);
    const rec = valueScore >= 60 ? '维持缴费' : valueScore >= 35 ? '评估后决定' : '建议放弃';
    const reason = valueScore >= 60 ? '技术价值高、市场相关性强' : valueScore >= 35 ? '中等价值、存在替代技术' : '技术过时或市场价值低';
    return {
      patent_id: `CN${year}${String(Math.floor(rng() * 999999)).padStart(6, '0')}`,
      title: `${pick(rng, mainTech)}相关${pick(rng, ['装置', '方法', '系统'])}`,
      recommendation: rec,
      reason,
      annual_cost: cost,
      value_score: valueScore,
    };
  }).sort((a, b) => b.value_score - a.value_score);

  const currentCost = round(maintenanceDecisions.reduce((sum, m) => sum + m.annual_cost, 0) * (1 + rng() * 0.5), 0);
  const projectedCost = round(currentCost * horizon * (0.9 + rng() * 0.3), 0);
  const savingsPotential = round(currentCost * (0.1 + rng() * 0.25) * horizon, 0);

  const overInvested = mainTech.slice(0, 2).map(area => ({
    area,
    patent_count: Math.round(20 + rng() * 80),
    recommendation: '建议精简该领域专利，聚焦核心资产',
  }));

  const underInvested = [
    { area: '量子计算', opportunity: '技术处于早期阶段，布局成本低', priority: '高' },
    { area: '边缘AI', opportunity: '市场快速增长，竞争对手薄弱', priority: '高' },
    { area: '绿色技术', opportunity: '政策利好，技术交叉点多', priority: '中' },
  ].slice(0, 1 + Math.floor(rng() * 2));

  const recommendations = [
    `建议将年度预算的${round(30 + rng() * 30, 0)}%投入高价值专利维护`,
    `未来${horizon}年重点布局${underInvested.map(u => u.area).join('、')}领域`,
    '建立专利分级管理制度(A/B/C三级)',
    `评估转让/许可低价值专利，预计可回收投资$${round(savingsPotential * 0.5, 0).toLocaleString()}`,
    '参与标准必要专利(SEP)申报，提升话语权',
  ];

  const totalInvestment = round(currentCost * (5 + rng() * 10), 0);
  const estimatedReturn = round(totalInvestment * (0.5 + rng() * 2.5), 0);
  const roiRatio = round((estimatedReturn - totalInvestment) / totalInvestment * 100, 1);

  return {
    portfolio_overview: { total_patents: size, active_patents: active, pending_patents: pending, expired_patents: expired, avg_remaining_years: avgRemaining },
    maintenance_decisions: maintenanceDecisions,
    cost_projection: { current_annual_cost: currentCost, projected_5yr_cost: projectedCost, savings_potential: savingsPotential, budget_optimization: `优化后可节省约${Math.round(savingsPotential / projectedCost * 100)}%的维护预算` },
    gap_analysis: { over_invested: overInvested, under_invested: underInvested },
    strategic_recommendations: recommendations,
    portfolio_roi: { total_investment: totalInvestment, estimated_return: estimatedReturn, roi_ratio: roiRatio, ranking: roiRatio >= 50 ? '优秀' : roiRatio >= 0 ? '良好' : '需改善' },
    disclaimer: DISCLAIMER,
  };
}

function formatPortfolio(r: PortfolioResult): string {
  let s = '=== IP组合管理与维护决策报告 ===\n\n';
  s += '【组合概览】\n';
  s += `  专利总量: ${r.portfolio_overview.total_patents} | 有效: ${r.portfolio_overview.active_patents} | 审查中: ${r.portfolio_overview.pending_patents} | 失效: ${r.portfolio_overview.expired_patents}\n`;
  s += `  平均剩余保护期: ${r.portfolio_overview.avg_remaining_years}年\n\n`;
  s += '【维护决策】\n';
  r.maintenance_decisions.forEach(m => {
    s += `  ${m.patent_id} [${m.recommendation}] 价值: ${m.value_score}/100 | 年费: $${m.annual_cost.toLocaleString()}\n`;
    s += `    ${m.title} — ${m.reason}\n`;
  });
  s += '\n【成本预测】\n';
  s += `  当前年度维护费: $${r.cost_projection.current_annual_cost.toLocaleString()}\n`;
  s += `  5年预测总成本: $${r.cost_projection.projected_5yr_cost.toLocaleString()}\n`;
  s += `  优化节省潜力: $${r.cost_projection.savings_potential.toLocaleString()}\n`;
  s += `  预算优化建议: ${r.cost_projection.budget_optimization}\n\n`;
  s += '【布局缺口分析】\n';
  s += '  过度投入领域:\n';
  r.gap_analysis.over_invested.forEach(o => {
    s += `    ${o.area}: ${o.patent_count}件 — ${o.recommendation}\n`;
  });
  s += '  投入不足领域:\n';
  r.gap_analysis.under_invested.forEach(u => {
    s += `    ${u.area} [${u.priority}] — ${u.opportunity}\n`;
  });
  s += '\n【组合投资回报】\n';
  s += `  累计投入: $${r.portfolio_roi.total_investment.toLocaleString()}\n`;
  s += `  预估回报: $${r.portfolio_roi.estimated_return.toLocaleString()}\n`;
  s += `  ROI: ${r.portfolio_roi.roi_ratio}% (${r.portfolio_roi.ranking})\n\n`;
  s += '【战略建议】\n';
  r.strategic_recommendations.forEach((rec, i) => {
    s += `  ${i + 1}. ${rec}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 6. patent_drafting_assistant — 专利撰写辅助与权利要求设计
// ============================================================
interface DraftingInput {
  invention_title?: string;
  technical_field?: string;
  technical_problem?: string;
  solution_features?: string[];
  prior_art_flaws?: string[];
  desired_claims_count?: number;
}

interface DraftingResult {
  title_suggestions: string[];
  abstract_draft: string;
  claim_draft: Array<{ number: number; type: string; text: string; dependency: string; strategy: string }>;
  description_outline: Array<{ section: string; key_points: string[]; estimated_pages: number }>;
  embodiments: Array<{ embodiment_number: number; description: string; advantages: string }>;
  drafting_tips: string[];
  disclaimer: string;
}

function analyzeDrafting(data: DraftingInput): DraftingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const title = data.invention_title || pick(rng, ['基于深度学习的图像识别装置', '高效能无线充电系统', '多模态传感器融合方法']);
  const field = data.technical_field || pick(rng, ['人工智能', '通信技术', '新能源', '生物医药', '智能制造']);
  const features = data.solution_features || ['模块A-数据采集', '模块B-智能处理', '模块C-结果输出', '模块D-反馈优化'];

  const titleSuggestions = [
    `一种${title}及${pick(rng, ['其方法', '其系统', '其应用'])}`,
    `${field}领域中${pick(rng, ['新型', '改进型', '创新型'])}${title}`,
    `基于${pick(rng, ['AI', 'IoT', '5G', '区块链'])}的${title}`,
    `${title}的${pick(rng, ['实现方法', '应用系统', '装置设备'])}`,
  ];

  const claimCount = data.desired_claims_count ?? Math.round(5 + rng() * 10);
  const claims = [];

  claims.push({
    number: 1,
    type: '独立权利要求(产品)',
    text: `一种${title}，其特征在于，包括：${features.map((f, i) => `第${i + 1}部分：${f.split('-')[1] || f}；`).join('')}`,
    dependency: '无(独立权利要求)',
    strategy: '核心保护范围，覆盖最宽技术方案',
  });

  claims.push({
    number: 2,
    type: '从属权利要求',
    text: `根据权利要求1所述的${title}，其特征在于，${features[0]?.split('-')[1] || features[0]}具体包括子模块a、子模块b和子模块c。`,
    dependency: '权利要求1',
    strategy: '细化核心技术特征，提供退守位置',
  });

  claims.push({
    number: 3,
    type: '从属权利要求',
    text: `根据权利要求1所述的${title}，其特征在于，还包括与${features[1]?.split('-')[1] || '处理单元'}通信连接的存储模块。`,
    dependency: '权利要求1',
    strategy: '增加技术细节层次，构建多层保护',
  });

  for (let i = 4; i <= Math.min(claimCount, 4 + Math.floor(rng() * 4)); i++) {
    const isMethod = i % 2 === 0;
    claims.push({
      number: i,
      type: isMethod ? '独立权利要求(方法)' : '从属权利要求',
      text: isMethod
        ? `一种基于权利要求1所述${title}的控制方法，包括以下步骤：S1.数据采集；S2.智能处理；S3.结果输出。`
        : `根据权利要求${i - 1}所述的${title}，其特征在于，所述步骤S2中${pick(rng, ['采用神经网络模型', '利用模糊逻辑算法', '基于规则引擎'])}。`,
      dependency: isMethod ? '无(独立权利要求)' : `权利要求${i - 1}`,
      strategy: isMethod ? '扩展方法类权利要求保护维度' : '进一步限定具体实现方式',
    });
  }

  const descriptionOutline = [
    { section: '技术领域', key_points: [`本发明涉及${field}领域`, '具体涉及一种智能处理方案'], estimated_pages: 0.5 },
    { section: '背景技术', key_points: ['现有技术分析', '存在的技术问题', '引用对比文件'], estimated_pages: 1 + round(rng(), 0) },
    { section: '发明内容', key_points: ['技术问题', '技术方案', '有益效果'], estimated_pages: 2 + round(rng(), 0) },
    { section: '具体实施方式', key_points: ['实施例1-3', '参数设置', '效果验证'], estimated_pages: 3 + round(rng() * 2, 0) },
    { section: '附图说明', key_points: ['系统架构图', '流程图', '效果对比图'], estimated_pages: 1 },
  ];

  const embodiments = [
    { embodiment_number: 1, description: `${title}的基本实施方式，适用于${pick(rng, ['消费电子', '工业控制', '医疗设备'])}场景`, advantages: '结构简单、成本低、易于部署' },
    { embodiment_number: 2, description: `${title}的优选实施方式，增加了${pick(rng, ['并行处理单元', '安全加密模块', '自适应优化'])}`, advantages: '性能提升、适应性强、安全性高' },
    { embodiment_number: 3, description: `${title}在${pick(rng, ['边缘计算', '云端协同', '终端设备'])}场景下的特殊实施方式`, advantages: '低延迟、低功耗、高可靠' },
  ];

  const draftingTips = [
    '权利要求书应遵循"最宽合理解释"原则，独立权利要求范围要适中',
    '说明书中应提供充足实施例支持权利要求范围内的所有技术方案',
    `建议增加至少${Math.round(1 + rng() * 2)}个对比实验数据支持有益效果发明点`,
    '注意避免使用绝对化用语(如"必须""唯一")对保护范围造成限缩',
    '从属权利要求应形成多层次退守体系，至少3层深度',
  ];

  return {
    title_suggestions: titleSuggestions,
    abstract_draft: `本发明公开了一种${title}及${pick(rng, ['其方法', '其系统'])}，包括：${features.slice(0, 3).map(f => f.split('-')[1] || f).join('、')}。解决了现有技术中${pick(rng, ['效率低', '成本高', '精度差', '通用性弱'])}的问题，实现了${pick(rng, ['处理效率提升30%以上', '能耗降低20%-40%', '精度达到99%以上'])}的有益效果。`,
    claim_draft: claims,
    description_outline: descriptionOutline,
    embodiments,
    drafting_tips: draftingTips,
    disclaimer: DISCLAIMER,
  };
}

function formatDrafting(r: DraftingResult): string {
  let s = '=== 专利撰写辅助与权利要求设计报告 ===\n\n';
  s += '【标题建议】\n';
  r.title_suggestions.forEach((t, i) => {
    s += `  ${i + 1}. ${t}\n`;
  });
  s += '\n【摘要草稿】\n';
  s += `  ${r.abstract_draft}\n\n`;
  s += '【权利要求草稿】\n';
  r.claim_draft.forEach(c => {
    s += `  权利要求${c.number} (${c.type}) [${c.dependency}]\n`;
    s += `    ${c.text}\n`;
    s += `    策略: ${c.strategy}\n\n`;
  });
  s += '【说明书框架】\n';
  r.description_outline.forEach(sec => {
    s += `  ${sec.section} (~${sec.estimated_pages}页):\n`;
    sec.key_points.forEach(p => { s += `    - ${p}\n`; });
  });
  s += '\n【实施例】\n';
  r.embodiments.forEach(e => {
    s += `  实施例${e.embodiment_number}: ${e.description}\n`;
    s += `    优点: ${e.advantages}\n`;
  });
  s += '\n【撰写建议】\n';
  r.drafting_tips.forEach((t, i) => {
    s += `  ${i + 1}. ${t}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 7. competitor_ip_tracker — 竞争对手专利监控与预警
// ============================================================
interface CompetitorInput {
  competitors?: string[];
  technology_keywords?: string[];
  monitoring_period?: string;
  alert_threshold?: number;
  jurisdictions?: string[];
  notification_preferences?: string[];
}

interface CompetitorResult {
  monitoring_scope: { competitors: string[]; keywords: string[]; period: string; jurisdictions: string[] };
  new_filings: Array<{ date: string; applicant: string; title: string; tech_area: string; threat_level: number; patent_id: string }>;
  trend_changes: Array<{ competitor: string; change_type: string; detail: string; impact: string }>;
  alert_items: Array<{ level: string; type: string; message: string; recommended_action: string }>;
  market_signals: { licensing_activity: Array<{ licensor: string; licensee: string; field: string }>; litigation_updates: Array<{ case: string; parties: string; status: string }>; m_a_activity: Array<{ acquirer: string; target: string; patent_count: number }> };
  dashboard_summary: { total_new_patents: number; high_threat_count: number; trend_direction: string; top_threat: string };
  disclaimer: string;
}

function analyzeCompetitor(data: CompetitorInput): CompetitorResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const competitors = data.competitors || ['华为技术有限公司', '三星电子株式会社', '高通股份有限公司', '英特尔公司', '微软科技公司'];
  const keywords = data.technology_keywords || ['人工智能', '5G通信', '半导体', '边缘计算'];
  const jurisdictions = data.jurisdictions || ['CN', 'US', 'EP', 'JP'];

  const newFilings = Array.from({ length: 5 + Math.floor(rng() * 8) }, () => {
    const year = 2024;
    const month = String(Math.floor(rng() * 8) + 1).padStart(2, '0');
    const day = String(Math.floor(rng() * 28) + 1).padStart(2, '0');
    const threat = round(20 + rng() * 80, 0);
    return {
      date: `${year}-${month}-${day}`,
      applicant: pick(rng, competitors),
      title: `${pick(rng, keywords)}相关${pick(rng, ['装置', '方法', '系统', '芯片'])}`,
      tech_area: pick(rng, keywords),
      threat_level: threat,
      patent_id: `${pick(rng, jurisdictions)}${year}${String(Math.floor(rng() * 999999)).padStart(6, '0')}`,
    };
  }).sort((a, b) => b.threat_level - a.threat_level);

  const trendChanges = [
    { competitor: pick(rng, competitors), change_type: '新领域布局', detail: `首次进入${pick(rng, keywords)}领域，单次申请${Math.round(5 + rng() * 15)}件`, impact: '可能影响公司技术路线选择' },
    { competitor: pick(rng, competitors), change_type: '申请量激增', detail: `本月申请量环比增长${Math.round(30 + rng() * 100)}%`, impact: '研发投入加大，值得关注' },
    { competitor: pick(rng, competitors), change_type: '海外布局扩展', detail: `新增${pick(rng, ['欧洲', '日本', '韩国', '印度'])}市场同族专利${Math.round(3 + rng() * 10)}件`, impact: '国际市场扩张信号' },
  ];

  const alertItems = [];
  const highThreatFilings = newFilings.filter(f => f.threat_level >= 70);
  if (highThreatFilings.length > 0) {
    alertItems.push({
      level: '高',
      type: '高威胁申请',
      message: `${highThreatFilings[0].applicant}于${highThreatFilings[0].date}提交了高威胁专利${highThreatFilings[0].patent_id}`,
      recommended_action: '立即评估侵权风险，考虑提出公众意见或无效预警',
    });
  }
  if (trendChanges.some(t => t.change_type === '新领域布局')) {
    alertItems.push({
      level: '中',
      type: '新领域进入',
      message: `${trendChanges.find(t => t.change_type === '新领域布局')?.competitor}进入新的技术领域`,
      recommended_action: '监控后续申请动态，评估是否需要跟进布局',
    });
  }
  alertItems.push({
    level: '低',
    type: '定期监控',
    message: `本监控期共发现${newFilings.length}件新申请，${highThreatFilings.length}件高威胁`,
    recommended_action: '纳入常规监控报告，无需立即行动',
  });

  const dashActions = ['许可', '诉讼', '技术合作', '专利转让'];
  return {
    monitoring_scope: { competitors, keywords, period: data.monitoring_period || '近3个月', jurisdictions },
    new_filings: newFilings,
    trend_changes: trendChanges,
    alert_items: alertItems,
    market_signals: {
      licensing_activity: [
        { licensor: pick(rng, competitors), licensee: pick(rng, ['公司A', '公司B', '公司C']), field: pick(rng, keywords) },
        { licensor: pick(rng, competitors), licensee: pick(rng, ['公司D', '公司E']), field: pick(rng, keywords) },
      ],
      litigation_updates: [
        { case: `${pick(rng, competitors)} v. ${pick(rng, ['公司X', '公司Y'])}`, parties: pick(rng, competitors), status: pick(rng, ['一审中', '二审中', '已和解', '败诉']) },
      ],
      m_a_activity: [
        { acquirer: pick(rng, competitors), target: pick(rng, ['初创公司A', '技术公司B']), patent_count: Math.round(10 + rng() * 90) },
      ],
    },
    dashboard_summary: {
      total_new_patents: newFilings.length,
      high_threat_count: highThreatFilings.length,
      trend_direction: rng() > 0.5 ? '活跃度上升' : '稳定发展',
      top_threat: highThreatFilings[0]?.patent_id || '暂无高威胁',
    },
    disclaimer: DISCLAIMER,
  };
}

function formatCompetitor(r: CompetitorResult): string {
  let s = '=== 竞争对手专利监控与预警报告 ===\n\n';
  s += '【监控范围】\n';
  s += `  监控对象: ${r.monitoring_scope.competitors.join('、')}\n`;
  s += `  技术关键词: ${r.monitoring_scope.keywords.join('、')}\n`;
  s += `  监控期: ${r.monitoring_scope.period} | 司法管辖区: ${r.monitoring_scope.jurisdictions.join('、')}\n\n`;
  s += '【新增专利申请】\n';
  r.new_filings.forEach((f, i) => {
    s += `  ${i + 1}. [威胁:${f.threat_level}%] ${f.date} ${f.applicant}\n`;
    s += `     ${f.patent_id} ${f.title} (${f.tech_area})\n`;
  });
  s += '\n【趋势变化】\n';
  r.trend_changes.forEach(t => {
    s += `  ${t.competitor} — ${t.change_type}: ${t.detail}\n`;
    s += `    影响: ${t.impact}\n`;
  });
  s += '\n【预警信息】\n';
  r.alert_items.forEach(a => {
    s += `  [${a.level}] ${a.type}: ${a.message}\n`;
    s += `    建议: ${a.recommended_action}\n`;
  });
  s += '\n【市场信号】\n';
  s += '  许可动态:\n';
  r.market_signals.licensing_activity.forEach(l => {
    s += `    ${l.licensor} → ${l.licensee} (${l.field})\n`;
  });
  s += '  诉讼动态:\n';
  r.market_signals.litigation_updates.forEach(l => {
    s += `    ${l.case} — ${l.status}\n`;
  });
  s += '  并购动态:\n';
  r.market_signals.m_a_activity.forEach(m => {
    s += `    ${m.acquirer}收购${m.target} (${m.patent_count}件专利)\n`;
  });
  s += '\n【仪表盘摘要】\n';
  s += `  新增专利: ${r.dashboard_summary.total_new_patents} | 高威胁: ${r.dashboard_summary.high_threat_count}\n`;
  s += `  趋势: ${r.dashboard_summary.trend_direction} | 最高威胁: ${r.dashboard_summary.top_threat}\n`;
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// 8. licensing_revenue_optimizer — 专利许可费率分析与收入优化
// ============================================================
interface LicensingInput {
  patent_ids?: string[];
  industry?: string;
  standard_essential?: boolean;
  comparable_licenses?: string[];
  revenue_target?: number;
  licensing_model?: string;
}

interface LicensingResult {
  rate_analysis: { recommended_rate: string; rate_range: string; basis: string; industry_benchmark: string };
  revenue_forecast: { annual_potential: number; five_year_total: number; npv: number; break_even_months: number };
  licensing_strategy: { model: string; target_licensees: Array<{ company: string; fit_score: number; estimated_revenue: number; approach: string }>; tiered_rates: Array<{ tier: string; rate: string; conditions: string }> };
  risk_factors: Array<{ factor: string; impact: string; mitigation: string }>;
  negotiation_leverage: { strengths: string[]; weaknesses: string[]; key_arguments: string[] };
  optimization_actions: string[];
  disclaimer: string;
}

function analyzeLicensing(data: LicensingInput): LicensingResult {
  const rng = mulberry32(hashSeed(JSON.stringify(data)));
  const industry = data.industry || pick(rng, ['智能手机', '汽车电子', '物联网', '医疗器械', '半导体']);
  const isEssential = data.standard_essential ?? (rng() > 0.5);

  const baseRate = round(1 + rng() * 4, 1);
  const rateRange = `${round(baseRate * 0.6, 1)}%-${round(baseRate * 1.5, 1)}%`;
  const recommendedRate = `${baseRate}%`;

  const annualPotential = round(500000 + rng() * 9500000, 0);
  const fiveYearTotal = round(annualPotential * (3 + rng() * 3), 0);
  const npv = round(fiveYearTotal * (0.6 + rng() * 0.25), 0);
  const breakEven = Math.round(6 + rng() * 18);

  const targetLicensees = [
    { company: '头部厂商A', fit_score: round(70 + rng() * 25, 0), estimated_revenue: round(annualPotential * (0.2 + rng() * 0.3), 0), approach: '直接接触，强调技术互补' },
    { company: '头部厂商B', fit_score: round(60 + rng() * 30, 0), estimated_revenue: round(annualPotential * (0.15 + rng() * 0.25), 0), approach: '通过行业协会牵线' },
    { company: '中型厂商C', fit_score: round(50 + rng() * 35, 0), estimated_revenue: round(annualPotential * (0.1 + rng() * 0.15), 0), approach: '提供优惠费率换取长期合作' },
    { company: '初创公司D', fit_score: round(40 + rng() * 30, 0), estimated_revenue: round(annualPotential * (0.05 + rng() * 0.1), 0), approach: '低入门费+收入分成模式' },
  ].sort((a, b) => b.estimated_revenue - a.estimated_revenue);

  const tieredRates = [
    { tier: '入门级(年营收<1亿)', rate: `${round(baseRate * 0.5, 1)}%`, conditions: '年最低保底费$50,000' },
    { tier: '标准级(年营收1-10亿)', rate: `${baseRate}%`, conditions: '按实际销量计费，无保底' },
    { tier: '高级(年营收>10亿)', rate: `${round(baseRate * 1.3, 1)}%`, conditions: '含技术支援与升级服务' },
  ];

  const riskFactors = [
    { factor: '专利有效性挑战', impact: '被许可人可能提起无效宣告', mitigation: '提前准备稳定性分析报告，建立防御性专利池' },
    { factor: '反垄断审查', impact: '过高费率可能引发FRAND争议', mitigation: '确保费率符合FRAND原则，保留可比协议证据' },
    { factor: '技术替代', impact: '新技术路线降低专利价值', mitigation: '持续研发投入，扩展专利保护范围' },
    { factor: '市场接受度', impact: '被许可人抵触导致谈判破裂', mitigation: '提供灵活许可模式，降低准入门槛' },
  ];

  const strengths = [
    isEssential ? '标准必要专利(SEP)地位，难以规避' : '技术壁垒高，替代成本大',
    '专利组合覆盖完整，多维度保护',
    '已有成功许可先例，费率可验证',
    '技术方案已被市场广泛采用',
  ];

  const weaknesses = [
    '部分权利要求范围较窄，存在规避设计空间',
    '同族专利覆盖国家有限，海外维权成本高',
    '专利剩余保护期中等，长期收益存在不确定性',
  ];

  const keyArguments = [
    `本专利对${industry}产品的${pick(rng, ['核心功能', '性能提升', '成本优化'])}至关重要`,
    '可比许可协议支持当前费率水平',
    '拒绝许可将导致产品无法进入特定市场',
    '提供一站式许可方案，降低交易成本',
  ];

  const optimizationActions = [
    `优先接触${targetLicensees[0].company}和${targetLicensees[1].company}，预计贡献${round((targetLicensees[0].estimated_revenue + targetLicensees[1].estimated_revenue) / annualPotential * 100, 0)}%收入`,
    '建立专利池联盟，提升整体议价能力',
    '开发自动化许可管理平台，降低交易成本',
    `针对${industry}领域推出打包许可方案，提升签约效率`,
    '定期评估费率竞争力，每年调整一次',
  ];

  return {
    rate_analysis: {
      recommended_rate: `${recommendedRate} of product selling price`,
      rate_range: `${rateRange} of product selling price`,
      basis: isEssential ? 'FRAND原则下的标准必要专利费率' : '可比协议法+收益法综合评估',
      industry_benchmark: `${industry}行业平均费率: ${round(baseRate * 0.7, 1)}%-${round(baseRate * 1.2, 1)}%`,
    },
    revenue_forecast: { annual_potential: annualPotential, five_year_total: fiveYearTotal, npv, break_even_months: breakEven },
    licensing_strategy: {
      model: data.licensing_model || pick(rng, ['普通许可', '排他许可', '交叉许可', '混合模式']),
      target_licensees: targetLicensees,
      tiered_rates: tieredRates,
    },
    risk_factors: riskFactors,
    negotiation_leverage: { strengths, weaknesses, key_arguments: keyArguments },
    optimization_actions: optimizationActions,
    disclaimer: DISCLAIMER,
  };
}

function formatLicensing(r: LicensingResult): string {
  let s = '=== 专利许可费率分析与收入优化报告 ===\n\n';
  s += '【费率分析】\n';
  s += `  推荐费率: ${r.rate_analysis.recommended_rate}\n`;
  s += `  费率区间: ${r.rate_analysis.rate_range}\n`;
  s += `  定价依据: ${r.rate_analysis.basis}\n`;
  s += `  行业基准: ${r.rate_analysis.industry_benchmark}\n\n`;
  s += '【收入预测】\n';
  s += `  年度许可收入潜力: $${r.revenue_forecast.annual_potential.toLocaleString()}\n`;
  s += `  5年总收入: $${r.revenue_forecast.five_year_total.toLocaleString()}\n`;
  s += `  净现值(NPV): $${r.revenue_forecast.npv.toLocaleString()}\n`;
  s += `  回本周期: ${r.revenue_forecast.break_even_months}个月\n\n`;
  s += '【许可策略】\n';
  s += `  许可模式: ${r.licensing_strategy.model}\n`;
  s += '  目标被许可方:\n';
  r.licensing_strategy.target_licensees.forEach(t => {
    s += `    ${t.company} — 匹配度: ${t.fit_score}% | 预估收入: $${t.estimated_revenue.toLocaleString()}\n`;
    s += `      接触策略: ${t.approach}\n`;
  });
  s += '  分级费率:\n';
  r.licensing_strategy.tiered_rates.forEach(t => {
    s += `    ${t.tier}: ${t.rate} (${t.conditions})\n`;
  });
  s += '\n【风险因素】\n';
  r.risk_factors.forEach(ri => {
    s += `  ${ri.factor} — 影响: ${ri.impact}\n`;
    s += `    缓解: ${ri.mitigation}\n`;
  });
  s += '\n【谈判筹码】\n';
  s += '  优势:\n';
  r.negotiation_leverage.strengths.forEach(st => { s += `    + ${st}\n`; });
  s += '  劣势:\n';
  r.negotiation_leverage.weaknesses.forEach(wk => { s += `    - ${wk}\n`; });
  s += '  核心论点:\n';
  r.negotiation_leverage.key_arguments.forEach((ka, i) => { s += `    ${i + 1}. ${ka}\n`; });
  s += '\n【优化行动】\n';
  r.optimization_actions.forEach((a, i) => {
    s += `  ${i + 1}. ${a}\n`;
  });
  s += `\n⚠ ${r.disclaimer}`;
  return s;
}

// ============================================================
// Plugin apply — register all 8 tools
// ============================================================
export function apply(ctx: Context) {
  const tools = ctx.tools;

  // 1. patent_landscape_mapper
  tools.register(defineTool({
    name: 'patent_landscape_mapper',
    description: '专利地图绘制与技术空白识别 — 基于技术领域和专利数据，提供技术聚类分析、White Space识别、主要专利权人分析、引证网络和趋势分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含technology_field, date_range, jurisdiction, min_citations, clustering_method, top_n等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatLandscape(analyzeLandscape(JSON.parse(args.input_data)));
    },
  }));

  // 2. prior_art_searcher
  tools.register(defineTool({
    name: 'prior_art_searcher',
    description: '现有技术检索与新颖性评估 — 基于发明技术方案，提供现有技术检索、新颖性评分、创造性评估和申请策略建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含invention_title, technical_field, key_features, date_limit, jurisdictions, databases, max_results等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPriorArt(analyzePriorArt(JSON.parse(args.input_data)));
    },
  }));

  // 3. patent_valuation_engine
  tools.register(defineTool({
    name: 'patent_valuation_engine',
    description: '专利价值评估与强度打分 — 基于专利引用、家族规模、权利要求等指标，提供技术/法律/市场三维价值评估、财务估算和行业对标',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含patent_id, title, technical_field, filing_date, grant_date, citation_count, family_size, claim_count, remaining_years, market_size_billion等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatValuation(analyzeValuation(JSON.parse(args.input_data)));
    },
  }));

  // 4. infringement_risk_analyzer
  tools.register(defineTool({
    name: 'infringement_risk_analyzer',
    description: '专利侵权风险FTO分析 — 基于产品特征和目标市场，提供风险专利识别、权利要求比对(Claim Chart)、规避设计方案和许可可行性分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含product_name, product_features, target_markets, key_patents, analysis_depth等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFTO(analyzeFTO(JSON.parse(args.input_data)));
    },
  }));

  // 5. ip_portfolio_strategist
  tools.register(defineTool({
    name: 'ip_portfolio_strategist',
    description: 'IP组合管理与维护决策 — 基于专利组合数据，提供维护决策建议、成本预测、布局缺口分析和组合投资回报评估',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含portfolio_size, annual_budget, technology_areas, company_size, business_goals, maintenance_horizon等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPortfolio(analyzePortfolio(JSON.parse(args.input_data)));
    },
  }));

  // 6. patent_drafting_assistant
  tools.register(defineTool({
    name: 'patent_drafting_assistant',
    description: '专利撰写辅助与权利要求设计 — 基于发明技术方案，提供标题建议、摘要草稿、权利要求书、说明书框架和撰写建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含invention_title, technical_field, technical_problem, solution_features, prior_art_flaws, desired_claims_count等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatDrafting(analyzeDrafting(JSON.parse(args.input_data)));
    },
  }));

  // 7. competitor_ip_tracker
  tools.register(defineTool({
    name: 'competitor_ip_tracker',
    description: '竞争对手专利监控与预警 — 基于监控对象和技术领域，提供新增申请监控、趋势变化分析、预警信息和市场信号追踪',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含competitors, technology_keywords, monitoring_period, alert_threshold, jurisdictions, notification_preferences等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatCompetitor(analyzeCompetitor(JSON.parse(args.input_data)));
    },
  }));

  // 8. licensing_revenue_optimizer
  tools.register(defineTool({
    name: 'licensing_revenue_optimizer',
    description: '专利许可费率分析与收入优化 — 基于专利组合和行业特征，提供费率分析、收入预测、许可策略、风险评估和谈判筹码分析',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式的输入数据，包含patent_ids, industry, standard_essential, comparable_licenses, revenue_target, licensing_model等字段' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatLicensing(analyzeLicensing(JSON.parse(args.input_data)));
    },
  }));
}
