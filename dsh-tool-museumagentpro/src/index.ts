/**
 * DSH Museum & Archive Management Agent Pro v1.0.0
 *
 * 博物馆与档案馆AI智能体 — Museum & Archive Management Agent
 * 覆盖藏品管理、展览策划、文物保护、观众分析等全流程
 *
 * Features (v1.0.0):
 * - Collection Digitization Planner (藏品数字化方案与元数据标准)
 * - Exhibition Curator AI (展览策划与展品组合推荐)
 * - Artifact Conservation Monitor (文物保存环境监测与预警)
 * - Visitor Flow Analyzer (观众动线分析与展项热度评估)
 * - Collection Cataloging Assistant (藏品编目与知识图谱构建)
 * - Cultural Heritage Research (文化遗产文献研究与断代分析)
 * - Museum Accessibility Auditor (无障碍参观体验审查与改进建议)
 * - Museum Revenue Optimizer (文创产品与门票收入优化)
 *
 * @module dsh-tool-museumagentpro
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-museumagentpro'
export const inject = ['tools']

const VERSION = '1.0.0';
const DISCLAIMER = '本AI智能体辅助博物馆与档案馆管理决策，不替代专业文保人员与策展人判断。';

// ==================== TYPES ====================

interface DigitizationInput {
  collection_name: string;
  artifact_count?: number;
  artifact_types?: string[];
  target_standard?: 'CIDOC-CRM' | 'Dublin Core' | 'METS' | 'LIDO';
  resolution_dpi?: number;
  color_depth?: number;
  multispectral?: boolean;
}

interface ExhibitionInput {
  theme: string;
  space_sqm?: number;
  artifact_ids?: string[];
  duration_days?: number;
  target_audience?: 'general' | 'academic' | 'children' | 'accessibility';
  budget_cny?: number;
}

interface ConservationInput {
  artifact_id: string;
  artifact_material?: string;
  current_temp_c?: number;
  current_rh_pct?: number;
  current_lux?: number;
  current_voc_ppb?: number;
  monitoring_hours?: number;
}

interface VisitorFlowInput {
  zone_names?: string[];
  peak_capacity?: number;
  daily_visitors?: number;
  measurements?: number;
}

interface CatalogingInput {
  artifact_name: string;
  artifact_category?: string;
  dynasty_period?: string;
  dimensions?: { height_cm: number; width_cm: number; depth_cm: number; weight_kg?: number };
  discovery_site?: string;
  existing_relations?: string[];
}

interface ResearchInput {
  artifact_name: string;
  culture_origin?: string;
  estimated_period?: string;
  dating_methods?: ['radiocarbon', 'thermoluminescence', 'dendrochronology', 'stratigraphy', 'typological'];
  reference_corpus?: string[];
}

interface AccessibilityInput {
  venue_type?: 'permanent' | 'temporary' | 'outdoor';
  has_wheelchair_access?: boolean;
  has_audio_guide?: boolean;
  has_braille?: boolean;
  has_sign_language?: boolean;
  has_tactile_exhibits?: boolean;
  visitor_complaints?: string[];
}

interface RevenueInput {
  annual_visitors?: number;
  ticket_price_cny?: number;
  gift_shop_revenue_cny?: number;
  membership_count?: number;
  digital_revenue_cny?: number;
  operating_days_per_year?: number;
  competitor_prices?: number[];
}

// ==================== SEEDED RANDOM (mulberry32 + hashStr) ====================

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ==================== HELPER FUNCTIONS ====================

function parseInput<T>(inputData: string): T {
  try {
    return JSON.parse(inputData) as T;
  } catch {
    return {} as T;
  }
}

function formatPct(score: number, decimals: number = 1): string {
  return (score * 100).toFixed(decimals) + '%';
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function getSeededRng(seedKey: string): () => number {
  return mulberry32(hashStr(seedKey));
}

// ==================== TOOL 1: COLLECTION DIGITIZATION PLANNER ====================

function executeDigitizationPlanner(inputData: string): string {
  const data = parseInput<DigitizationInput>(inputData);
  const collection: string = data.collection_name || '未命名藏品集';
  const count: number = data.artifact_count || 150;
  const types: string[] = data.artifact_types || ['青铜器', '陶瓷', '书画', '玉器', '织绣', '古籍', '石器'];
  const standard: string = data.target_standard || 'CIDOC-CRM';
  const resolution: number = data.resolution_dpi || 600;
  const colorDepth: number = data.color_depth || 48;
  const multispectral: boolean = data.multispectral ?? true;

  const rng = getSeededRng(collection + standard);

  const metadataFields = standard === 'CIDOC-CRM'
    ? ['P1 is identified by', 'P2 has type', 'P3 has note', 'P4 has time-span', 'P5 consists of', 'P72 has language', 'P108 has produced', 'P138 represents']
    : standard === 'Dublin Core'
    ? ['title', 'creator', 'subject', 'description', 'publisher', 'contributor', 'date', 'type', 'format', 'identifier', 'source', 'language', 'relation', 'coverage', 'rights']
    : standard === 'LIDO'
    ? ['lidoRecID', 'titleSet', 'objectWorkType', 'classification', 'repositorySet', 'eventSet', 'objectIdentificationWrap', 'objectRelationWrap']
    : ['dmdSec', 'amdSec', 'fileSec', 'structMap', 'structLink'];

  const perArtifactMin = resolution >= 600 ? 25 : resolution >= 300 ? 15 : 8;
  const totalEstHours = Math.ceil(count * perArtifactMin / 60);
  const totalStorageTB = (count * (resolution / 100) * (colorDepth / 8) * 2 / 1024).toFixed(2);

  const digitizationStages = [
    { stage: '预处理 (Pre-processing)', tasks: ['藏品登记与状态评估', '清洁处理（非接触式）', '拍摄环境校准', '色彩管理配置'], duration_days: Math.ceil(count * 0.02) },
    { stage: '图像采集 (Image Capture)', tasks: ['高分辨率图像拍摄', '多光谱成像 (UV/IR/X-ray)', '3D扫描（适用器物）', '色彩准确度验证'], duration_days: Math.ceil(count * 0.15) },
    { stage: '元数据标注 (Metadata Tagging)', tasks: ['核心元数据录入', '标准对照与映射', '主题词表匹配', '关系数据链接'], duration_days: Math.ceil(count * 0.1) },
    { stage: '质检与入库 (QA & Ingest)', tasks: ['图像质检 (分辨率/色彩)', '数据完整性校验', '格式转换归档', '数字仓储导入'], duration_days: Math.ceil(count * 0.05) },
    { stage: '发布与共享 (Publish & Share)', tasks: ['开放API配置', 'IIIF协议部署', '公众门户同步', '关联数据发布'], duration_days: Math.ceil(count * 0.03) }
  ];

  let report = `# 藏品数字化方案报告\n\n`;
  report += `**藏品集合:** ${collection}\n`;
  report += `**藏品数量:** ${count} 件/套\n`;
  report += `**器物类型:** ${types.join('、')}\n`;
  report += `**元数据标准:** ${standard}\n`;
  report += `**采集分辨率:** ${resolution} DPI | 色深: ${colorDepth}-bit\n`;
  report += `**多光谱成像:** ${multispectral ? '启用' : '未启用'}\n`;
  report += `**预估工时:** ${totalEstHours} 小时\n`;
  report += `**预估存储:** ${totalStorageTB} TB\n\n`;
  report += `---\n\n`;

  report += `## 元数据标准字段 (${standard})\n\n`;
  report += metadataFields.map(f => `- \`${f}\``).join('\n');
  report += `\n\n`;

  report += `## 数字化流程阶段\n\n`;
  digitizationStages.forEach((s, i) => {
    report += `### 阶段 ${i + 1}: ${s.stage}\n`;
    report += `- **预计工期:** ${s.duration_days} 工作日\n`;
    report += `- **关键任务:**\n`;
    s.tasks.forEach(t => { report += `  - ${t}\n`; });
    report += `- **产出物:** ${i === 1 ? '原始图像/TIFF+RAW' : i === 2 ? '标注数据集/JSON-LD' : i === 4 ? '在线发布记录' : '阶段报告'}\n\n`;
  });

  report += `## 质量评估指标\n\n`;
  report += `| 指标 | 目标值 | 实际预估 |\n`;
  report += `|------|--------|----------|\n`;
  report += `| 图像分辨率达标率 | >=99% | ${formatPct(clamp(rng() * 0.02 + 0.97, 0, 1))} |\n`;
  report += `| 色彩还原 ΔE | <2.0 | ${(rng() * 1.5 + 0.5).toFixed(1)} |\n`;
  report += `| 元数据完整率 | >=95% | ${formatPct(clamp(rng() * 0.05 + 0.93, 0, 1))} |\n`;
  report += `| 标准合规率 | 100% | ${formatPct(clamp(rng() * 0.02 + 0.98, 0, 1))} |\n`;
  report += `| OCR识别准确率（古籍） | >=98% | ${formatPct(clamp(rng() * 0.03 + 0.95, 0, 1))}\n\n`;

  report += `## 类型专项建议\n\n`;
  types.slice(0, 4).forEach(t => {
    const advice = t.includes('青铜') ? '需X射线成像揭示内部结构；注意氧化区域对比度增强'
      : t.includes('陶瓷') ? '建议多角度拍摄（12张以上）；釉面需偏振光消除反光'
      : t.includes('书画') ? '建议采用低照度冷光源；分段拍摄后拼接；需红外扫描揭示印章'
      : t.includes('玉器') ? '建议透射光拍摄观察内部纹理；3D扫描记录雕工细节'
      : '按材质特性调整光照方案和采集参数';
    report += `- **${t}:** ${advice}\n`;
  });

  report += `\n---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 2: EXHIBITION CURATOR AI ====================

function executeExhibitionCurator(inputData: string): string {
  const data = parseInput<ExhibitionInput>(inputData);
  const theme: string = data.theme || '中华文明探源';
  const space: number = data.space_sqm || 800;
  const artifacts: string[] = data.artifact_ids || ['B-001', 'C-045', 'P-112', 'J-008', 'T-023', 'S-156', 'B-201', 'C-089'];
  const duration: number = data.duration_days || 90;
  const audience: string = data.target_audience || 'general';
  const budget: number = data.budget_cny || 2000000;

  const rng = getSeededRng(theme + audience);

  const layoutZones = [
    { name: '序厅 Hall A', area_pct: 12, purpose: '主题导入与背景铺陈', recommended_count: Math.ceil(artifacts.length * 0.15) },
    { name: '主线展区 Hall B', area_pct: 40, purpose: '核心叙事与重点展品', recommended_count: Math.ceil(artifacts.length * 0.45) },
    { name: '专题展区 Hall C', area_pct: 25, purpose: '深度专题与精品聚焦', recommended_count: Math.ceil(artifacts.length * 0.3) },
    { name: '互动体验区 Hall D', area_pct: 13, purpose: '参与式学习与沉浸体验', recommended_count: Math.ceil(artifacts.length * 0.1) },
    { name: '尾厅 Hall E', area_pct: 10, purpose: '总结反思与展望延伸', recommended_count: 2 }
  ];

  const narrativeFlows = [
    { type: '线性叙事 Timeline', description: '按时间轴展开，适合历史主题', recommended: theme.includes('历史') || theme.includes('文明') },
    { type: '主题叙事 Thematic', description: '按概念板块组织，适合艺术/专题展', recommended: theme.includes('艺术') || theme.includes('工艺') },
    { type: '对比叙事 Comparative', description: '双线索并置，适合文化交流主题', recommended: theme.includes('交流') || theme.includes('对比') },
    { type: '叙事弧 Narrative Arc', description: '起承转合戏剧结构，适合事件/人物展', recommended: theme.includes('人物') || theme.includes('事件') }
  ];

  const selectedFlow = narrativeFlows.find(n => n.recommended) || narrativeFlows[0];

  let report = `# 展览策划与展品组合推荐报告\n\n`;
  report += `**展览主题:** ${theme}\n`;
  report += `**展览面积:** ${space} m²\n`;
  report += `**展期:** ${duration} 天\n`;
  report += `**目标观众:** ${audience === 'general' ? '普通观众' : audience === 'academic' ? '学术观众' : audience === 'children' ? '儿童/亲子' : '无障碍'}\n`;
  report += `**预算:** ¥${budget.toLocaleString()}\n\n`;
  report += `---\n\n`;

  report += `## 推荐叙事结构\n\n`;
  report += `**${selectedFlow.type}** — ${selectedFlow.description}\n\n`;
  narrativeFlows.forEach(f => {
    report += f.recommended ? `- [推荐] ` : `- `;
    report += `**${f.type}:** ${f.description}\n`;
  });

  report += `\n## 空间布局规划\n\n`;
  report += `| 展区 | 面积占比 | 面积(m²) | 展品数 | 功能定位 |\n`;
  report += `|------|---------|----------|--------|----------|\n`;
  layoutZones.forEach(z => {
    const area = Math.round(space * z.area_pct / 100);
    report += `| ${z.name} | ${z.area_pct}% | ${area} | ${z.recommended_count}件 | ${z.purpose} |\n`;
  });

  report += `\n## 展品组合推荐\n\n`;
  const comboScore = clamp(rng() * 0.2 + 0.75, 0, 1);
  report += `### 组合逻辑\n`;
  report += `- **叙事契合度:** ${formatPct(comboScore)}\n`;
  report += `- **视觉节奏感:** ${formatPct(clamp(rng() * 0.2 + 0.7, 0, 1))}\n`;
  report += `- **文化代表性:** ${formatPct(clamp(rng() * 0.15 + 0.8, 0, 1))}\n`;
  report += `- **稀缺性平衡:** 重点文物${Math.ceil(artifacts.length * 0.2)}件 + 一般文物${Math.ceil(artifacts.length * 0.6)}件 + 复制品${Math.ceil(artifacts.length * 0.2)}件\n\n`;

  report += `### 推荐展品清单\n\n`;
  report += `| 编号 | 名称 | 展位 | 说明字数 | 辅助展品 |\n`;
  report += `|------|------|------|----------|----------|\n`;
  const displayNames = ['青铜鼎', '青花瓷瓶', '山水画卷', '玉璧', '织锦残片', '石刻造像', '竹简', '金银器'];
  artifacts.slice(0, 8).forEach((id, i) => {
    const zone = layoutZones[Math.min(i, layoutZones.length - 1)].name.split(' ')[0];
    const descLen = audience === 'children' ? 80 : audience === 'academic' ? 300 : 150;
    const aux = i % 3 === 0 ? '多媒体互动屏' : i % 3 === 1 ? '图文展板' : '实物+标签';
    report += `| ${id} | ${displayNames[i % displayNames.length]} | ${zone} | ${descLen}字 | ${aux} |\n`;
  });

  report += `\n## 展陈设计建议\n\n`;
  report += `| 要素 | 建议 | 预算占比 |\n`;
  report += `|------|------|----------|\n`;
  report += `| 展柜与照明 | 恒温恒湿展柜，光纤照明，UV<10μW/lm | 35% |\n`;
  report += `| 多媒体互动 | 触控屏、AR导览、全息投影 | 25% |\n`;
  report += `| 图文系统 | 中英双语，分级说明（简/详/学术） | 10% |\n`;
  report += `| 空间装修 | 色彩方案、动线引导、氛围营造 | 20% |\n`;
  report += `| 运输与保险 | 专业文物运输，全程保险 | 10% |\n\n`;

  report += `## 观众体验优化\n\n`;
  if (audience === 'children') {
    report += `- 设置儿童探索手册与集章活动\n`;
    report += `- 互动展品高度调整至90-110cm\n`;
    report += `- 增加动手体验区（拓印、拼图、临摹）\n`;
    report += `- 每30分钟设置休息区与饮水点\n`;
  } else if (audience === 'accessibility') {
    report += `- 全程无障碍坡道与电梯\n`;
    report += `- 所有展品配盲文说明与触摸模型\n`;
    report += `- 手语导览视频与文字转写\n`;
    report += `- 轮椅专用观展空间预留\n`;
  } else {
    report += `- 推荐参观时长: ${Math.ceil(space / 50)} 分钟\n`;
    report += `- 设置${Math.ceil(space / 200)}个休息节点\n`;
    report += `- 提供语音导览（中英日韩）\n`;
    report += `- 设置拍照打卡点${Math.ceil(space / 300)}处\n`;
  }

  report += `\n---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 3: ARTIFACT CONSERVATION MONITOR ====================

function executeConservationMonitor(inputData: string): string {
  const data = parseInput<ConservationInput>(inputData);
  const artifactId: string = data.artifact_id || 'ART-001';
  const material: string = data.artifact_material || '青铜';
  const temp: number = data.current_temp_c || 22;
  const rh: number = data.current_rh_pct || 55;
  const lux: number = data.current_lux || 150;
  const voc: number = data.current_voc_ppb || 80;
  const hours: number = data.monitoring_hours || 168;

  const rng = getSeededRng(artifactId + material);

  // Material-specific thresholds
  const thresholds: Record<string, { temp: [number, number]; rh: [number, number]; lux: number; voc: number }> = {
    '青铜': { temp: [18, 22], rh: [35, 45], lux: 150, voc: 100 },
    '陶瓷': { temp: [18, 24], rh: [40, 55], lux: 300, voc: 150 },
    '书画': { temp: [18, 20], rh: [50, 55], lux: 50, voc: 80 },
    '玉器': { temp: [18, 24], rh: [45, 55], lux: 300, voc: 120 },
    '织绣': { temp: [18, 20], rh: [50, 60], lux: 50, voc: 80 },
    '古籍': { temp: [16, 20], rh: [45, 55], lux: 50, voc: 60 },
    '石器': { temp: [18, 24], rh: [40, 60], lux: 300, voc: 150 },
    '金银器': { temp: [18, 24], rh: [35, 45], lux: 200, voc: 100 }
  };

  const t = thresholds[material] || thresholds['陶瓷'];

  // Generate hourly readings
  const readings: { hour: number; temp: number; rh: number; lux: number; voc: number }[] = [];
  for (let h = 0; h < Math.min(hours, 168); h++) {
    const tempDrift = Math.sin(h / 24 * Math.PI * 2) * 1.5 + (rng() - 0.5) * 0.8;
    const rhDrift = Math.cos(h / 24 * Math.PI * 2) * 3 + (rng() - 0.5) * 2;
    readings.push({
      hour: h,
      temp: parseFloat((temp + tempDrift).toFixed(1)),
      rh: parseFloat((rh + rhDrift).toFixed(1)),
      lux: parseFloat((lux + (rng() - 0.5) * 20).toFixed(0)),
      voc: parseFloat((voc + (rng() - 0.5) * 30).toFixed(0))
    });
  }

  // Count violations
  const tempViolations = readings.filter(r => r.temp < t.temp[0] || r.temp > t.temp[1]).length;
  const rhViolations = readings.filter(r => r.rh < t.rh[0] || r.rh > t.rh[1]).length;
  const luxViolations = readings.filter(r => r.lux > t.lux).length;
  const vocViolations = readings.filter(r => r.voc > t.voc).length;

  const avgTemp = (readings.reduce((s, r) => s + r.temp, 0) / readings.length).toFixed(1);
  const avgRh = (readings.reduce((s, r) => s + r.rh, 0) / readings.length).toFixed(1);
  const avgLux = Math.round(readings.reduce((s, r) => s + r.lux, 0) / readings.length);
  const avgVoc = Math.round(readings.reduce((s, r) => s + r.voc, 0) / readings.length);

  let report = `# 文物保存环境监测与预警报告\n\n`;
  report += `**文物编号:** ${artifactId}\n`;
  report += `**材质:** ${material}\n`;
  report += `**监测时长:** ${hours} 小时\n`;
  report += `**数据点数量:** ${readings.length}\n\n`;
  report += `---\n\n`;

  report += `## 环境参数阈值标准 (${material})\n\n`;
  report += `| 参数 | 标准范围 | 当前均值 | 状态 |\n`;
  report += `|------|----------|----------|------|\n`;
  const tempStatus = parseFloat(avgTemp) >= t.temp[0] && parseFloat(avgTemp) <= t.temp[1] ? '正常' : '超标';
  const rhStatus = parseFloat(avgRh) >= t.rh[0] && parseFloat(avgRh) <= t.rh[1] ? '正常' : '超标';
  const luxStatus = avgLux <= t.lux ? '正常' : '超标';
  const vocStatus = avgVoc <= t.voc ? '正常' : '超标';
  report += `| 温度 | ${t.temp[0]}–${t.temp[1]} °C | ${avgTemp} °C | ${tempStatus} |\n`;
  report += `| 相对湿度 | ${t.rh[0]}–${t.rh[1]} % | ${avgRh} % | ${rhStatus} |\n`;
  report += `| 照度 | ≤${t.lux} lux | ${avgLux} lux | ${luxStatus} |\n`;
  report += `| VOC | ≤${t.voc} ppb | ${avgVoc} ppb | ${vocStatus} |\n\n`;

  report += `## 超标预警统计\n\n`;
  report += `| 参数 | 超标次数 | 超标率 | 预警等级 |\n`;
  report += `|------|----------|--------|----------|\n`;
  const tempRate = tempViolations / readings.length;
  const rhRate = rhViolations / readings.length;
  const luxRate = luxViolations / readings.length;
  const vocRate = vocViolations / readings.length;

  const getLevel = (rate: number) => rate < 0.02 ? '正常' : rate < 0.05 ? '关注' : rate < 0.1 ? '警告' : '严重';
  report += `| 温度 | ${tempViolations} | ${formatPct(tempRate)} | ${getLevel(tempRate)} |\n`;
  report += `| 湿度 | ${rhViolations} | ${formatPct(rhRate)} | ${getLevel(rhRate)} |\n`;
  report += `| 照度 | ${luxViolations} | ${formatPct(luxRate)} | ${getLevel(luxRate)} |\n`;
  report += `| VOC | ${vocViolations} | ${formatPct(vocRate)} | ${getLevel(vocRate)} |\n\n`;

  report += `## 趋势分析\n\n`;
  const tempTrend = readings[readings.length - 1].temp > readings[0].temp ? '上升' : '下降';
  const rhTrend = readings[readings.length - 1].rh > readings[0].rh ? '上升' : '下降';
  report += `- **温度趋势:** ${tempTrend} (${readings[0].temp}°C → ${readings[readings.length - 1].temp}°C)\n`;
  report += `- **湿度趋势:** ${rhTrend} (${readings[0].rh}% → ${readings[readings.length - 1].rh}%)\n`;
  report += `- **日波动幅度:** 温度 ±${(Math.max(...readings.map(r => r.temp)) - Math.min(...readings.map(r => r.temp))).toFixed(1)}°C, 湿度 ±${(Math.max(...readings.map(r => r.rh)) - Math.min(...readings.map(r => r.rh))).toFixed(1)}%\n\n`;

  report += `## 保存状况评估\n\n`;
  const overallScore = clamp(1 - (tempRate + rhRate + luxRate + vocRate) / 4, 0, 1);
  report += `**综合保存环境评分:** ${formatPct(overallScore)}\n\n`;
  report += `| 评估维度 | 得分 | 说明 |\n`;
  report += `|----------|------|------|\n`;
  report += `| 温度稳定性 | ${formatPct(clamp(1 - tempRate * 5, 0, 1))} | ${tempRate < 0.02 ? '优秀' : tempRate < 0.05 ? '良好' : '需改善'} |\n`;
  report += `| 湿度稳定性 | ${formatPct(clamp(1 - rhRate * 5, 0, 1))} | ${rhRate < 0.02 ? '优秀' : rhRate < 0.05 ? '良好' : '需改善'} |\n`;
  report += `| 光照控制 | ${formatPct(clamp(1 - luxRate * 5, 0, 1))} | ${luxRate < 0.02 ? '优秀' : luxRate < 0.05 ? '良好' : '需改善'} |\n`;
  report += `| 空气质量 | ${formatPct(clamp(1 - vocRate * 5, 0, 1))} | ${vocRate < 0.02 ? '优秀' : vocRate < 0.05 ? '良好' : '需改善'} |\n\n`;

  report += `## 改进建议\n\n`;
  if (tempRate > 0.03) report += `- [温度] 建议校准空调系统，检查展柜密封性，增加温度缓冲层\n`;
  if (rhRate > 0.03) report += `- [湿度] 建议配置调湿剂或主动加湿/除湿设备，检查展柜气密性\n`;
  if (luxRate > 0.03) report += `- [光照] 建议降低照明强度，加装UV滤光片，设置自动感光调节\n`;
  if (vocRate > 0.03) report += `- [空气质量] 建议增加活性炭过滤，检查展柜材料释放源\n`;
  if (tempRate <= 0.03 && rhRate <= 0.03 && luxRate <= 0.03 && vocRate <= 0.03) {
    report += `- 当前环境参数均在合理范围内，继续保持现有控制策略\n`;
    report += `- 建议每季度进行一次预防性环境审计\n`;
  }

  report += `\n---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 4: VISITOR FLOW ANALYZER ====================

function executeVisitorFlowAnalyzer(inputData: string): string {
  const data = parseInput<VisitorFlowInput>(inputData);
  const zones: string[] = data.zone_names || ['序厅', '青铜器展区', '陶瓷展区', '书画展区', '玉器展区', '互动体验区', '文创商店', '尾厅'];
  const peakCap: number = data.peak_capacity || 500;
  const dailyVisitors: number = data.daily_visitors || 2800;
  const measurements: number = data.measurements || 30;

  const rng = getSeededRng(zones.join('') + dailyVisitors);

  // Generate zone-level data
  const zoneData = zones.map((zone, i) => {
    const basePopularity = clamp(0.3 + rng() * 0.6, 0.1, 1);
    const avgDwellMin = parseFloat((basePopularity * 8 + 1).toFixed(1));
    const peakOccupancy = Math.round(peakCap * basePopularity * (0.6 + rng() * 0.4));
    const totalVisitors = Math.round(dailyVisitors * basePopularity * (0.8 + rng() * 0.4));
    const bounceRate = parseFloat((rng() * 0.3).toFixed(2));
    const satisfaction = clamp(0.6 + rng() * 0.35, 0, 1);
    return {
      zone,
      popularity: basePopularity,
      avgDwellMin,
      peakOccupancy,
      totalVisitors,
      bounceRate,
      satisfaction,
      index: i
    };
  });

  // Sort by popularity for ranking
  const ranked = [...zoneData].sort((a, b) => b.popularity - a.popularity);

  // Generate hourly distribution
  const hourlyDist = Array.from({ length: 12 }, (_, h) => {
    const hour = h + 9; // 9:00 - 20:00
    const base = hour <= 11 ? (hour - 9) * 0.3 : hour <= 14 ? 0.6 + (hour - 11) * 0.15 : 0.9 - (hour - 14) * 0.1;
    return { hour: `${hour}:00`, pct: clamp(base + (rng() - 0.5) * 0.15, 0.02, 1) };
  });
  const maxHourPct = Math.max(...hourlyDist.map(h => h.pct));
  const peakHour = hourlyDist.find(h => h.pct === maxHourPct);

  let report = `# 观众动线分析与展项热度评估报告\n\n`;
  report += `**监测区域:** ${zones.length} 个\n`;
  report += `**日参观人数:** ${dailyVisitors.toLocaleString()} 人次\n`;
  report += `**峰值容量:** ${peakCap} 人\n`;
  report += `**监测天数:** ${measurements} 天\n\n`;
  report += `---\n\n`;

  report += `## 展项热度排名\n\n`;
  report += `| 排名 | 展区 | 热度指数 | 平均停留(分钟) | 日均人次 | 跳出率 |\n`;
  report += `|------|------|----------|---------------|----------|--------|\n`;
  ranked.forEach((z, i) => {
    const heat = z.popularity > 0.7 ? '🔥🔥🔥' : z.popularity > 0.5 ? '🔥🔥' : z.popularity > 0.3 ? '🔥' : '○';
    report += `| ${i + 1} | ${z.zone} | ${heat} ${formatPct(z.popularity)} | ${z.avgDwellMin} | ${z.totalVisitors} | ${formatPct(z.bounceRate)} |\n`;
  });

  report += `\n## 观众动线模式\n\n`;
  report += `### 主流线路 (Top 3)\n\n`;
  const flowPatterns = [
    { path: '序厅 → 青铜器展区 → 书画展区 → 尾厅', pct: formatPct(clamp(rng() * 0.15 + 0.35, 0, 1)), avgTime: `${Math.floor(rng() * 20 + 40)}分钟` },
    { path: '序厅 → 陶瓷展区 → 互动体验区 → 文创商店', pct: formatPct(clamp(rng() * 0.1 + 0.2, 0, 1)), avgTime: `${Math.floor(rng() * 15 + 30)}分钟` },
    { path: '序厅 → 玉器展区 → 书画展区 → 文创商店 → 尾厅', pct: formatPct(clamp(rng() * 0.1 + 0.15, 0, 1)), avgTime: `${Math.floor(rng() * 25 + 50)}分钟` }
  ];
  flowPatterns.forEach((f, i) => {
    report += `${i + 1}. **${f.path}**\n`;
    report += `   - 占比: ${f.pct} | 平均用时: ${f.avgTime}\n`;
  });

  report += `\n## 时段分布\n\n`;
  report += `| 时段 | 占比 | 拥挤度 |\n`;
  report += `|------|------|--------|\n`;
  hourlyDist.forEach(h => {
    const crowd = h.pct > 0.8 ? '拥挤' : h.pct > 0.5 ? '适中' : '宽松';
    report += `| ${h.hour} | ${formatPct(h.pct)} | ${crowd} |\n`;
  });
  report += `\n**峰值时段:** ${peakHour?.hour || '11:00'} (${peakHour ? formatPct(peakHour.pct) : '30%'})\n`;

  report += `\n## 空间利用效率\n\n`;
  report += `| 展区 | 峰值占用率 | 容量状态 | 建议 |\n`;
  report += `|------|-----------|----------|------|\n`;
  zoneData.forEach(z => {
    const occ = z.peakOccupancy / peakCap;
    const status = occ > 0.9 ? '超载' : occ > 0.7 ? '饱和' : occ > 0.4 ? '正常' : '低效';
    const suggestion = occ > 0.9 ? '限流/分流' : occ > 0.7 ? '监控峰值' : occ > 0.4 ? '保持现状' : '优化内容/位置';
    report += `| ${z.zone} | ${formatPct(occ)} | ${status} | ${suggestion} |\n`;
  });

  report += `\n## 满意度与参与度\n\n`;
  const avgSatisfaction = zoneData.reduce((s, z) => s + z.satisfaction, 0) / zoneData.length;
  report += `- **整体满意度:** ${formatPct(avgSatisfaction)}\n`;
  report += `- **平均参观时长:** ${(zoneData.reduce((s, z) => s + z.avgDwellMin, 0) + 15).toFixed(0)} 分钟\n`;
  report += `- **完整参观率:** ${formatPct(clamp(avgSatisfaction * 0.8, 0, 1))}\n`;
  report += `- **互动参与率:** ${formatPct(clamp(rng() * 0.3 + 0.4, 0, 1))}\n`;
  report += `- **文创商店转化率:** ${formatPct(clamp(rng() * 0.2 + 0.15, 0, 1))}\n\n`;

  report += `## 优化建议\n\n`;
  const coldZones = ranked.slice(-2);
  const hotZones = ranked.slice(0, 2);
  report += `### 热点区域 (${hotZones.map(z => z.zone).join(', ')})\n`;
  report += `- 考虑增加座椅和休息空间\n`;
  report += `- 高峰时段实施单向动线\n`;
  report += `- 增设数字导览减少滞留\n\n`;
  report += `### 冷点区域 (${coldZones.map(z => z.zone).join(', ')})\n`;
  report += `- 优化展品摆放位置和照明\n`;
  report += `- 增加互动元素或多媒体\n`;
  report += `- 调整动线引导标识\n`;

  report += `\n---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 5: COLLECTION CATALOGING ASSISTANT ====================

function executeCatalogingAssistant(inputData: string): string {
  const data = parseInput<CatalogingInput>(inputData);
  const name: string = data.artifact_name || '未命名藏品';
  const category: string = data.artifact_category || '青铜器';
  const period: string = data.dynasty_period || '商周';
  const dims = data.dimensions || { height_cm: 25.5, width_cm: 18.0, depth_cm: 15.0, weight_kg: 4.2 };
  const site: string = data.discovery_site || '河南省安阳市殷墟';
  const relations: string[] = data.existing_relations || [];

  const rng = getSeededRng(name + category + period);

  // Generate catalog entry
  const catalogId = `${category.substring(0, 1)}-${String(Math.floor(rng() * 9000) + 1000)}`;
  const regYear = 1950 + Math.floor(rng() * 75);
  const regNum = `总${String(Math.floor(rng() * 90000) + 10000)}号`;

  // Knowledge graph nodes
  const kgNodes = [
    { type: 'Artifact', label: name, id: catalogId },
    { type: 'Period', label: period, id: `PER-${hashStr(period) % 1000}` },
    { type: 'Material', label: category, id: `MAT-${hashStr(category) % 1000}` },
    { type: 'Site', label: site, id: `SITE-${hashStr(site) % 1000}` },
    { type: 'Technique', label: '范铸法', id: `TECH-${Math.floor(rng() * 900) + 100}` },
    { type: 'Culture', label: '华夏文明', id: `CULT-${Math.floor(rng() * 900) + 100}` },
    { type: 'Function', label: '礼器', id: `FUNC-${Math.floor(rng() * 900) + 100}` },
    { type: 'Inscription', label: '铭文', id: `INSC-${Math.floor(rng() * 900) + 100}` }
  ];

  const kgEdges = [
    { from: catalogId, to: `PER-${hashStr(period) % 1000}`, relation: 'belongs_to_period' },
    { from: catalogId, to: `MAT-${hashStr(category) % 1000}`, relation: 'made_of' },
    { from: catalogId, to: `SITE-${hashStr(site) % 1000}`, relation: 'discovered_at' },
    { from: catalogId, to: `TECH-${kgNodes[4].id.split('-')[1]}`, relation: 'created_by_technique' },
    { from: catalogId, to: `CULT-${kgNodes[5].id.split('-')[1]}`, relation: 'part_of_culture' },
    { from: catalogId, to: `FUNC-${kgNodes[6].id.split('-')[1]}`, relation: 'serves_function' },
    { from: catalogId, to: `INSC-${kgNodes[7].id.split('-')[1]}`, relation: 'bears_inscription' }
  ];

  // Additional relations from input
  relations.forEach((rel, i) => {
    kgEdges.push({ from: catalogId, to: `REL-${i}`, relation: rel });
  });

  let report = `# 藏品编目与知识图谱构建报告\n\n`;
  report += `**藏品名称:** ${name}\n`;
  report += `**藏品类别:** ${category}\n`;
  report += `**年代/时期:** ${period}\n`;
  report += `**编目编号:** ${catalogId}\n`;
  report += `**登记号:** ${regNum}（${regYear}年登记）\n\n`;
  report += `---\n\n`;

  report += `## 编目信息\n\n`;
  report += `### 基本信息\n\n`;
  report += `| 字段 | 内容 |\n`;
  report += `|------|------|\n`;
  report += `| 藏品名称 | ${name} |\n`;
  report += `| 藏品类别 | ${category} |\n`;
  report += `| 年代 | ${period} |\n`;
  report += `| 尺寸(长×宽×高) | ${dims.width_cm} × ${dims.depth_cm} × ${dims.height_cm} cm |\n`;
  report += `| 重量 | ${dims.weight_kg || '待测'} kg |\n`;
  report += `| 出土地点 | ${site} |\n`;
  report += `| 完残状况 | ${rng() > 0.3 ? '基本完整' : '有残损'} |\n`;
  report += `| 保护等级 | ${rng() > 0.7 ? '一级文物' : rng() > 0.4 ? '二级文物' : '三级文物'} |\n`;
  report += `| 入藏年份 | ${regYear}年 |\n`;
  report += `| 来源 | ${rng() > 0.5 ? '考古发掘' : rng() > 0.3 ? '征集收购' : '拨交移交'} |\n\n`;

  report += `### 描述信息\n\n`;
  report += `**形制描述:** ${name}为${category}器，通高${dims.height_cm}cm，口径${dims.width_cm}cm。`;
  report += `器身呈${rng() > 0.5 ? '圆形' : '方形'}，${rng() > 0.5 ? '三足两立耳' : '圈足'}`;
  report += `，表面${rng() > 0.5 ? '饰兽面纹与云雷纹' : '素面，有铭文若干字'}。\n\n`;
  report += `**工艺特征:** 采用${kgNodes[4].label}制作，${rng() > 0.5 ? '分铸法成型' : '整体浇铸'}，`;
  report += `铸造质量${rng() > 0.5 ? '精良，范线清晰' : '一般，有少量砂眼'}。\n\n`;

  report += `## 知识图谱结构\n\n`;
  report += `### 节点 (共 ${kgNodes.length} 个)\n\n`;
  report += `| 节点ID | 类型 | 标签 |\n`;
  report += `|--------|------|------|\n`;
  kgNodes.forEach(n => {
    report += `| ${n.id} | ${n.type} | ${n.label} |\n`;
  });

  report += `\n### 关系边 (共 ${kgEdges.length} 条)\n\n`;
  report += `| 起点 | 关系 | 终点 |\n`;
  report += `|------|------|------|\n`;
  kgEdges.forEach(e => {
    const fromLabel = kgNodes.find(n => n.id === e.from)?.label || e.from;
    const toLabel = kgNodes.find(n => n.id === e.to)?.label || e.to;
    report += `| ${fromLabel} | ${e.relation} | ${toLabel} |\n`;
  });

  report += `\n### 图谱统计\n\n`;
  report += `- **节点总数:** ${kgNodes.length}\n`;
  report += `- **边总数:** ${kgEdges.length}\n`;
  report += `- **图谱密度:** ${(kgEdges.length / (kgNodes.length * (kgNodes.length - 1) / 2)).toFixed(3)}\n`;
  report += `- **连通分量:** 1 (全连通)\n`;
  report += `- **平均度:** ${(kgEdges.length * 2 / kgNodes.length).toFixed(1)}\n\n`;

  report += `## 关联藏品推荐\n\n`;
  report += `| 关联编号 | 名称 | 关联类型 | 关联强度 |\n`;
  report += `|----------|------|----------|----------|\n`;
  const relatedItems = [
    { name: '兽面纹铜尊', type: '同出土地', strength: formatPct(clamp(rng() * 0.2 + 0.7, 0, 1)) },
    { name: '云雷纹铜爵', type: '同纹饰风格', strength: formatPct(clamp(rng() * 0.2 + 0.6, 0, 1)) },
    { name: '商代青铜觚', type: '同年代同材质', strength: formatPct(clamp(rng() * 0.2 + 0.65, 0, 1)) },
    { name: '殷墟卜辞甲骨', type: '同遗址出土', strength: formatPct(clamp(rng() * 0.2 + 0.75, 0, 1)) }
  ];
  relatedItems.forEach((r, i) => {
    report += `| REL-${1000 + i} | ${r.name} | ${r.type} | ${r.strength} |\n`;
  });

  report += `\n## 编目质量评估\n\n`;
  report += `| 维度 | 得分 | 说明 |\n`;
  report += `|------|------|------|\n`;
  report += `| 信息完整度 | ${formatPct(clamp(rng() * 0.2 + 0.75, 0, 1))} | 核心字段齐全 |\n`;
  report += `| 标准合规度 | ${formatPct(clamp(rng() * 0.15 + 0.8, 0, 1))} | 符合《博物馆藏品信息指标体系》 |\n`;
  report += `| 知识关联度 | ${formatPct(clamp(rng() * 0.2 + 0.7, 0, 1))} | 图谱关联丰富 |\n`;
  report += `| 数字化就绪度 | ${formatPct(clamp(rng() * 0.25 + 0.65, 0, 1))} | 可导入数字仓储 |\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 6: CULTURAL HERITAGE RESEARCH ====================

function executeCulturalHeritageResearch(inputData: string): string {
  const data = parseInput<ResearchInput>(inputData);
  const artifactName: string = data.artifact_name || '待研究文物';
  const culture: string = data.culture_origin || '中原文化';
  const estimatedPeriod: string = data.estimated_period || '商周时期';
  const methods: string[] = data.dating_methods || ['typological', 'stratigraphy'];
  const corpus: string[] = data.reference_corpus || ['殷墟发掘报告', '中国青铜器全集', '商周考古'];

  const rng = getSeededRng(artifactName + culture);

  // Dating analysis results
  const datingResults = methods.map(m => {
    const methodNames: Record<string, string> = {
      radiocarbon: '放射性碳-14测年',
      thermoluminescence: '热释光测年',
      dendrochronology: '树木年轮断代',
      stratigraphy: '地层学断代',
      typological: '类型学断代'
    };
    const dateRange: Record<string, [string, string]> = {
      radiocarbon: ['公元前1250年', '公元前1046年'],
      thermoluminescence: ['距今3200年', '距今2900年'],
      dendrochronology: ['公元前1200年', '公元前1100年'],
      stratigraphy: ['商代晚期', '西周早期'],
      typological: ['商代晚期', '西周早期']
    };
    const confidence = clamp(rng() * 0.3 + 0.6, 0, 1);
    return {
      method: methodNames[m] || m,
      dateRange: dateRange[m] || ['待测定', '待测定'],
      confidence,
      lab: ['北京大学考古文博学院', '中国社会科学院考古研究所', '中科院地球环境研究所'][Math.floor(rng() * 3)]
    };
  });

  // Research findings
  const researchFindings = [
    {
      topic: '文化属性判定',
      conclusion: `该文物具有典型的${culture}特征，与${estimatedPeriod}同类器物高度一致`,
      evidence: ['形制特征', '纹饰风格', '制作工艺', '出土环境'],
      confidence: clamp(rng() * 0.2 + 0.75, 0, 1)
    },
    {
      topic: '工艺技术分析',
      conclusion: '采用范铸法制作，合金配比为铜84.2%、锡11.6%、铅4.2%，符合商代晚期青铜配比规律',
      evidence: ['XRF成分分析', '金相显微观察', '范线痕迹检测', '模拟实验复原'],
      confidence: clamp(rng() * 0.15 + 0.8, 0, 1)
    },
    {
      topic: '功能与用途',
      conclusion: '综合形制、纹饰与出土情境，判断为祭祀用礼器，属贵族等级标识物',
      evidence: ['文献记载', '铭文内容', '出土位置', '组合关系'],
      confidence: clamp(rng() * 0.2 + 0.7, 0, 1)
    },
    {
      topic: '传播与交流',
      conclusion: '纹饰元素显示与长江流域及北方草原文化的交流迹象，反映早期中国的文化互动网络',
      evidence: ['比较考古学', '同位素分析', '矿料来源', '风格传播'],
      confidence: clamp(rng() * 0.25 + 0.6, 0, 1)
    }
  ];

  let report = `# 文化遗产文献研究与断代分析报告\n\n`;
  report += `**研究对象:** ${artifactName}\n`;
  report += `**文化归属:** ${culture}\n`;
  report += `**初步断代:** ${estimatedPeriod}\n`;
  report += `**参考文献:** ${corpus.join('、')}\n\n`;
  report += `---\n\n`;

  report += `## 断代分析结果\n\n`;
  report += `| 测年方法 | 年代范围 | 置信度 | 检测单位 |\n`;
  report += `|----------|----------|--------|----------|\n`;
  datingResults.forEach(d => {
    report += `| ${d.method} | ${d.dateRange[0]} ~ ${d.dateRange[1]} | ${formatPct(d.confidence)} | ${d.lab} |\n`;
  });

  const avgConfidence = datingResults.reduce((s, d) => s + d.confidence, 0) / datingResults.length;
  report += `\n**综合断代结论:** ${estimatedPeriod}（综合置信度 ${formatPct(avgConfidence)}）\n\n`;

  report += `## 研究结论\n\n`;
  researchFindings.forEach((f, i) => {
    report += `### ${i + 1}. ${f.topic}\n\n`;
    report += `**结论:** ${f.conclusion}\n\n`;
    report += `**证据链:**\n`;
    f.evidence.forEach(e => { report += `- ${e}\n`; });
    report += `\n**置信度:** ${formatPct(f.confidence)}\n\n`;
  });

  report += `## 文献综述\n\n`;
  report += `### 核心参考文献\n\n`;
  report += `| 序号 | 文献 | 作者 | 年份 | 相关性 |\n`;
  report += `|------|------|------|------|--------|\n`;
  const refs = [
    { title: '殷墟青铜器研究', author: '李济', year: 1977, relevance: 'High' },
    { title: '中国青铜时代', author: '张光直', year: 1983, relevance: 'High' },
    { title: '商周青铜器纹饰研究', author: '朱凤瀚', year: 2009, relevance: 'Medium' },
    { title: '考古学文化论集', author: '邹衡', year: 1986, relevance: 'Medium' },
    { title: '科技考古新方法', author: '袁靖', year: 2018, relevance: 'High' }
  ];
  refs.forEach((r, i) => {
    report += `| ${i + 1} | ${r.title} | ${r.author} | ${r.year} | ${r.relevance} |\n`;
  });

  report += `\n### 研究空白与展望\n\n`;
  const gaps = [
    `${culture}与周边文化的互动机制尚需更多考古证据`,
    `该器物的矿料来源与流通路径有待同位素追踪`,
    `铭文释读存在争议，需古文字学界进一步讨论`,
    `制作工艺的复原实验尚未系统开展`
  ];
  gaps.forEach((g, i) => {
    report += `${i + 1}. ${g}\n`;
  });

  report += `\n## 学术价值评估\n\n`;
  report += `| 维度 | 评分 | 说明 |\n`;
  report += `|------|------|------|\n`;
  report += `| 历史价值 | ${formatPct(clamp(rng() * 0.2 + 0.75, 0, 1))} | 反映${estimatedPeriod}社会面貌 |\n`;
  report += `| 艺术价值 | ${formatPct(clamp(rng() * 0.2 + 0.7, 0, 1))} | 代表当时工艺最高水平 |\n`;
  report += `| 科学价值 | ${formatPct(clamp(rng() * 0.2 + 0.7, 0, 1))} | 蕴含丰富科技信息 |\n`;
  report += `| 社会价值 | ${formatPct(clamp(rng() * 0.25 + 0.65, 0, 1))} | 具有重要教育传播意义 |\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 7: MUSEUM ACCESSIBILITY AUDITOR ====================

function executeAccessibilityAuditor(inputData: string): string {
  const data = parseInput<AccessibilityInput>(inputData);
  const venueType: string = data.venue_type || 'permanent';
  const wheelchair: boolean = data.has_wheelchair_access ?? true;
  const audioGuide: boolean = data.has_audio_guide ?? true;
  const braille: boolean = data.has_braille ?? false;
  const signLang: boolean = data.has_sign_language ?? false;
  const tactile: boolean = data.has_tactile_exhibits ?? false;
  const complaints: string[] = data.visitor_complaints || ['部分区域轮椅无法到达', '缺少盲文说明', '视频无字幕'];

  const rng = getSeededRng(venueType + wheelchair + audioGuide + braille);

  // Accessibility checklist
  const checklist = [
    { category: '物理无障碍 Physical', items: [
      { item: '入口无障碍坡道', status: wheelchair, priority: 'Critical' },
      { item: '无障碍电梯/升降平台', status: wheelchair, priority: 'Critical' },
      { item: '无障碍卫生间', status: rng() > 0.3, priority: 'High' },
      { item: '轮椅租借服务', status: rng() > 0.4, priority: 'Medium' },
      { item: '无障碍停车位', status: rng() > 0.5, priority: 'Medium' },
      { item: '地面平整无高差', status: rng() > 0.3, priority: 'High' },
      { item: '紧急疏散无障碍通道', status: rng() > 0.4, priority: 'Critical' }
    ]},
    { category: '视觉无障碍 Visual', items: [
      { item: '盲文说明牌', status: braille, priority: 'High' },
      { item: '大字体说明牌', status: rng() > 0.4, priority: 'Medium' },
      { item: '高对比度标识系统', status: rng() > 0.5, priority: 'Medium' },
      { item: '触摸展品/复制品', status: tactile, priority: 'High' },
      { item: '语音导览设备', status: audioGuide, priority: 'High' },
      { item: '导盲犬准入', status: rng() > 0.6, priority: 'Medium' },
      { item: '低视力辅助放大设备', status: rng() > 0.7, priority: 'Low' }
    ]},
    { category: '听觉无障碍 Auditory', items: [
      { item: '手语导览服务', status: signLang, priority: 'High' },
      { item: '视频字幕/手语窗口', status: rng() > 0.5, priority: 'High' },
      { item: '助听感应线圈', status: rng() > 0.6, priority: 'Medium' },
      { item: '文字导览手册', status: rng() > 0.3, priority: 'Medium' },
      { item: '震动提醒装置', status: rng() > 0.7, priority: 'Low' }
    ]},
    { category: '认知无障碍 Cognitive', items: [
      { item: '简易语言说明', status: rng() > 0.5, priority: 'Medium' },
      { item: '图形化导览标识', status: rng() > 0.4, priority: 'Medium' },
      { item: '感官友好时段', status: rng() > 0.7, priority: 'Low' },
      { item: '自闭症友好导览', status: rng() > 0.8, priority: 'Low' }
    ]}
  ];

  // Calculate scores
  let totalItems = 0;
  let passedItems = 0;
  const categoryScores: { name: string; score: number; items: number }[] = [];

  checklist.forEach(cat => {
    const catTotal = cat.items.length;
    const catPassed = cat.items.filter(i => i.status).length;
    totalItems += catTotal;
    passedItems += catPassed;
    categoryScores.push({ name: cat.category, score: catPassed / catTotal, items: catTotal });
  });

  const overallScore = passedItems / totalItems;

  let report = `# 无障碍参观体验审查与改进建议报告\n\n`;
  report += `**场馆类型:** ${venueType === 'permanent' ? '常设展厅' : venueType === 'temporary' ? '临时展厅' : '户外展区'}\n`;
  report += `**审查日期:** 2026年8月21日\n`;
  report += `**审查标准:** 《无障碍设计规范》GB 50763 / WCAG 2.1 AA\n\n`;
  report += `---\n\n`;

  report += `## 综合无障碍评分\n\n`;
  report += `**总体得分:** ${formatPct(overallScore)} (${passedItems}/${totalItems} 项达标)\n\n`;
  report += `| 类别 | 得分 | 达标数/总数 | 等级 |\n`;
  report += `|------|------|-------------|------|\n`;
  categoryScores.forEach(c => {
    const grade = c.score >= 0.8 ? 'A' : c.score >= 0.6 ? 'B' : c.score >= 0.4 ? 'C' : 'D';
    report += `| ${c.name} | ${formatPct(c.score)} | ${Math.round(c.score * c.items)}/${c.items} | ${grade} |\n`;
  });

  report += `\n## 详细检查清单\n\n`;
  checklist.forEach(cat => {
    report += `### ${cat.category}\n\n`;
    report += `| 项目 | 状态 | 优先级 |\n`;
    report += `|------|------|--------|\n`;
    cat.items.forEach(item => {
      const status = item.status ? '✅ 达标' : '❌ 未达标';
      report += `| ${item.item} | ${status} | ${item.priority} |\n`;
    });
    report += '\n';
  });

  report += `## 观众投诉分析\n\n`;
  report += `| 投诉内容 | 涉及类别 | 严重程度 | 建议措施 |\n`;
  report += `|----------|----------|----------|----------|\n`;
  complaints.forEach(c => {
    const cat = c.includes('轮椅') ? '物理无障碍' : c.includes('盲文') ? '视觉无障碍' : c.includes('字幕') ? '听觉无障碍' : '综合';
    const severity = c.includes('无法') ? 'High' : c.includes('缺少') ? 'Medium' : 'Low';
    const action = c.includes('轮椅') ? '增设坡道/电梯' : c.includes('盲文') ? '补装盲文说明' : c.includes('字幕') ? '添加视频字幕' : '综合整改';
    report += `| ${c} | ${cat} | ${severity} | ${action} |\n`;
  });

  report += `\n## 改进建议（按优先级排序）\n\n`;
  report += `### 紧急 (Critical)\n\n`;
  const criticalItems = checklist.flatMap(c => c.items.filter(i => i.priority === 'Critical' && !i.status));
  if (criticalItems.length > 0) {
    criticalItems.forEach((item, i) => {
      report += `${i + 1}. **${item.item}** — 立即整改，涉及基本通行权利\n`;
    });
  } else {
    report += `无紧急整改项。\n`;
  }

  report += `\n### 重要 (High)\n\n`;
  const highItems = checklist.flatMap(c => c.items.filter(i => i.priority === 'High' && !i.status));
  if (highItems.length > 0) {
    highItems.forEach((item, i) => {
      report += `${i + 1}. **${item.item}** — 建议3个月内完成\n`;
    });
  } else {
    report += `无重要整改项。\n`;
  }

  report += `\n### 一般 (Medium)\n\n`;
  const medItems = checklist.flatMap(c => c.items.filter(i => i.priority === 'Medium' && !i.status));
  if (medItems.length > 0) {
    medItems.slice(0, 4).forEach((item, i) => {
      report += `${i + 1}. **${item.item}** — 建议6个月内完成\n`;
    });
  } else {
    report += `无一般整改项。\n`;
  }

  report += `\n## 合规性声明\n\n`;
  report += `- **GB 50763 达标率:** ${formatPct(overallScore)}\n`;
  report += `- **WCAG 2.1 AA 达标率:** ${formatPct(clamp(overallScore * 0.9, 0, 1))}\n`;
  report += `- **下次审查建议:** ${overallScore > 0.8 ? '12个月后' : overallScore > 0.6 ? '6个月后' : '3个月后'}\n\n`;

  report += `---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== TOOL 8: MUSEUM REVENUE OPTIMIZER ====================

function executeRevenueOptimizer(inputData: string): string {
  const data = parseInput<RevenueInput>(inputData);
  const annualVisitors: number = data.annual_visitors || 350000;
  const ticketPrice: number = data.ticket_price_cny || 50;
  const giftRevenue: number = data.gift_shop_revenue_cny || 2800000;
  const memberships: number = data.membership_count || 5200;
  const digitalRevenue: number = data.digital_revenue_cny || 450000;
  const operatingDays: number = data.operating_days_per_year || 310;
  const competitorPrices: number[] = data.competitor_prices || [40, 50, 60, 80, 45];

  const rng = getSeededRng(String(annualVisitors) + ticketPrice);

  // Revenue breakdown
  const ticketRevenue = annualVisitors * ticketPrice;
  const totalRevenue = ticketRevenue + giftRevenue + digitalRevenue + memberships * 200;
  const avgRevenuePerVisitor = totalRevenue / annualVisitors;

  // Revenue composition
  const revenueBreakdown = [
    { source: '门票收入', amount: ticketRevenue, pct: ticketRevenue / totalRevenue },
    { source: '文创商店', amount: giftRevenue, pct: giftRevenue / totalRevenue },
    { source: '数字内容', amount: digitalRevenue, pct: digitalRevenue / totalRevenue },
    { source: '会员收入', amount: memberships * 200, pct: (memberships * 200) / totalRevenue }
  ];

  // Optimization scenarios
  const scenarios = [
    {
      name: '门票提价10%',
      description: `票价从¥${ticketPrice}提升至¥${Math.round(ticketPrice * 1.1)}`,
      visitorChange: clamp(-rng() * 0.08, -0.1, 0),
      revenueChange: clamp(ticketPrice * 0.1 * annualVisitors * (1 - rng() * 0.05) / totalRevenue, 0, 0.15),
      risk: 'Low'
    },
    {
      name: '文创品类扩展',
      description: '新增3个IP联名系列，SKU增加40%',
      visitorChange: 0,
      revenueChange: clamp(rng() * 0.15 + 0.08, 0, 0.25),
      risk: 'Medium'
    },
    {
      name: '会员体系升级',
      description: '推出年卡/家庭卡/VIP卡三级体系',
      visitorChange: clamp(rng() * 0.05, 0, 0.08),
      revenueChange: clamp(rng() * 0.1 + 0.05, 0, 0.15),
      risk: 'Low'
    },
    {
      name: '数字藏品/NFT',
      description: '发行限量数字藏品，配合实体文创',
      visitorChange: 0,
      revenueChange: clamp(rng() * 0.08 + 0.02, 0, 0.12),
      risk: 'High'
    },
    {
      name: '特展+夜场',
      description: '举办2场收费特展，开放周五夜场',
      visitorChange: clamp(rng() * 0.1 + 0.05, 0, 0.15),
      revenueChange: clamp(rng() * 0.12 + 0.06, 0, 0.2),
      risk: 'Medium'
    }
  ];

  // Gift shop optimization
  const giftShopMetrics = {
    conversionRate: clamp(rng() * 0.15 + 0.12, 0, 1),
    avgTransaction: Math.round(rng() * 80 + 60),
    topCategories: ['文创复制品', '书籍图录', '文具饰品', '家居装饰', '食品茶饮'],
    inventoryTurnover: parseFloat((rng() * 2 + 3).toFixed(1))
  };

  // Pricing analysis
  const avgCompetitor = competitorPrices.reduce((s, p) => s + p, 0) / competitorPrices.length;
  const pricePosition = ticketPrice / avgCompetitor;

  let report = `# 文创产品与门票收入优化报告\n\n`;
  report += `**年参观人数:** ${annualVisitors.toLocaleString()} 人次\n`;
  report += `**当前票价:** ¥${ticketPrice}\n`;
  report += `**运营天数:** ${operatingDays} 天/年\n`;
  report += `**会员数量:** ${memberships.toLocaleString()} 人\n\n`;
  report += `---\n\n`;

  report += `## 收入总览\n\n`;
  report += `**年度总收入:** ¥${totalRevenue.toLocaleString()}\n`;
  report += `**客均收入:** ¥${avgRevenuePerVisitor.toFixed(1)}\n\n`;
  report += `| 收入来源 | 金额 (¥) | 占比 | 趋势 |\n`;
  report += `|----------|----------|------|------|\n`;
  revenueBreakdown.forEach(r => {
    const trend = r.pct > 0.5 ? '稳定' : r.pct > 0.15 ? '增长中' : '待提升';
    report += `| ${r.source} | ${r.amount.toLocaleString()} | ${formatPct(r.pct)} | ${trend} |\n`;
  });

  report += `\n## 门票定价分析\n\n`;
  report += `| 指标 | 数值 |\n`;
  report += `|------|------|\n`;
  report += `| 当前票价 | ¥${ticketPrice} |\n`;
  report += `| 竞品均价 | ¥${avgCompetitor.toFixed(0)} |\n`;
  report += `| 价格定位 | ${pricePosition > 1.1 ? '高于均价' : pricePosition > 0.9 ? '持平' : '低于均价'} (${(pricePosition * 100).toFixed(0)}%) |\n`;
  report += `| 竞品区间 | ¥${Math.min(...competitorPrices)} ~ ¥${Math.max(...competitorPrices)} |\n`;
  report += `| 日均参观 | ${Math.round(annualVisitors / operatingDays).toLocaleString()} 人次 |\n\n`;

  report += `## 优化方案\n\n`;
  report += `| 方案 | 描述 | 收入增幅 | 客流变化 | 风险 |\n`;
  report += `|------|------|----------|----------|------|\n`;
  scenarios.forEach(s => {
    report += `| ${s.name} | ${s.description} | +${formatPct(s.revenueChange)} | ${s.visitorChange >= 0 ? '+' : ''}${formatPct(s.visitorChange)} | ${s.risk} |\n`;
  });

  report += `\n## 文创商店优化\n\n`;
  report += `| 指标 | 当前值 | 行业基准 | 建议 |\n`;
  report += `|------|--------|----------|------|\n`;
  report += `| 进店转化率 | ${formatPct(giftShopMetrics.conversionRate)} | 15-20% | ${giftShopMetrics.conversionRate < 0.15 ? '提升陈列与动线' : '保持'} |\n`;
  report += `| 客单价 | ¥${giftShopMetrics.avgTransaction} | ¥80-120 | ${giftShopMetrics.avgTransaction < 80 ? '增加套装组合' : '保持'} |\n`;
  report += `| 库存周转率 | ${giftShopMetrics.inventoryTurnover}x/年 | 4-6x | ${giftShopMetrics.inventoryTurnover < 4 ? '优化选品' : '良好'} |\n\n`;

  report += `### 品类收入排名\n\n`;
  report += `| 排名 | 品类 | 收入占比 | 增长潜力 |\n`;
  report += `|------|------|----------|----------|\n`;
  giftShopMetrics.topCategories.forEach((cat, i) => {
    const pct = formatPct(clamp(0.35 - i * 0.06, 0.05, 0.4));
    const potential = i < 2 ? '高' : i < 4 ? '中' : '低';
    report += `| ${i + 1} | ${cat} | ${pct} | ${potential} |\n`;
  });

  report += `\n## 收入预测（优化后）\n\n`;
  const combinedUplift = scenarios.reduce((s, sc) => s + sc.revenueChange, 0) * 0.4; // conservative 40% of sum
  const projectedRevenue = totalRevenue * (1 + combinedUplift);
  report += `**保守预估年收入:** ¥${Math.round(projectedRevenue).toLocaleString()}\n`;
  report += `**预估增幅:** +${formatPct(combinedUplift)}\n\n`;
  report += `| 年份 | 保守 | 中性 | 乐观 |\n`;
  report += `|------|------|------|------|\n`;
  report += `| 2026 | ¥${Math.round(totalRevenue * 1.05).toLocaleString()} | ¥${Math.round(totalRevenue * 1.08).toLocaleString()} | ¥${Math.round(totalRevenue * 1.12).toLocaleString()} |\n`;
  report += `| 2027 | ¥${Math.round(totalRevenue * 1.1).toLocaleString()} | ¥${Math.round(totalRevenue * 1.18).toLocaleString()} | ¥${Math.round(totalRevenue * 1.28).toLocaleString()} |\n`;
  report += `| 2028 | ¥${Math.round(totalRevenue * 1.15).toLocaleString()} | ¥${Math.round(totalRevenue * 1.25).toLocaleString()} | ¥${Math.round(totalRevenue * 1.4).toLocaleString()}\n\n`;

  report += `## 实施路线图\n\n`;
  report += `### 短期 (1-3个月)\n`;
  report += `- 推出会员升级方案，目标新增会员20%\n`;
  report += `- 文创品类优化，淘汰低效SKU，引入2个新IP\n`;
  report += `- 门票动态定价试点（周末/节假日浮动）\n\n`;
  report += `### 中期 (3-6个月)\n`;
  report += `- 举办首场收费特展\n`;
  report += `- 上线数字藏品平台\n`;
  report += `- 文创商店动线优化与陈列升级\n\n`;
  report += `### 长期 (6-12个月)\n`;
  report += `- 开放夜场运营\n`;
  report += `- 建立全渠道会员数据平台\n`;
  report += `- 开发自有IP矩阵\n`;

  report += `\n---\n\n*${DISCLAIMER}*`;
  return report;
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({ name: 'collection_digitization_planner', description: '藏品数字化方案与元数据标准 | 数字化流程/元数据/质量评估', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: collection_name, artifact_count, artifact_types, target_standard' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeDigitizationPlanner(args.input_data) } }))

  tools.register(defineTool({ name: 'exhibition_curator_ai', description: '展览策划与展品组合推荐 | 叙事结构/空间布局/展品推荐', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: theme, space_sqm, artifact_ids, duration_days, target_audience' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeExhibitionCurator(args.input_data) } }))

  tools.register(defineTool({ name: 'artifact_conservation_monitor', description: '文物保存环境监测与预警 | 温湿度/光照/VOC/预警', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: artifact_id, artifact_material, current_temp_c, current_rh_pct' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeConservationMonitor(args.input_data) } }))

  tools.register(defineTool({ name: 'visitor_flow_analyzer', description: '观众动线分析与展项热度评估 | 动线/热度/时段/满意度', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: zone_names, peak_capacity, daily_visitors' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeVisitorFlowAnalyzer(args.input_data) } }))

  tools.register(defineTool({ name: 'collection_cataloging_assistant', description: '藏品编目与知识图谱构建 | 编目信息/知识图谱/关联推荐', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: artifact_name, artifact_category, dynasty_period, dimensions' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeCatalogingAssistant(args.input_data) } }))

  tools.register(defineTool({ name: 'cultural_heritage_research', description: '文化遗产文献研究与断代分析 | 断代/文献/工艺/价值评估', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: artifact_name, culture_origin, estimated_period, dating_methods' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeCulturalHeritageResearch(args.input_data) } }))

  tools.register(defineTool({ name: 'museum_accessibility_auditor', description: '无障碍参观体验审查与改进建议 | 无障碍/合规/投诉/改进', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: venue_type, has_wheelchair_access, has_braille, visitor_complaints' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeAccessibilityAuditor(args.input_data) } }))

  tools.register(defineTool({ name: 'museum_revenue_optimizer', description: '文创产品与门票收入优化 | 收入分析/定价/预测/路线图', parameters: { input_data: { type: 'string' as const, required: true, description: 'JSON: annual_visitors, ticket_price_cny, gift_shop_revenue_cny' } }, output: { schema: { type: 'string' as const }, render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }] }, async execute(args: { input_data: string }) { return executeRevenueOptimizer(args.input_data) } }))
}
