# DSH Plugin Toolkit

**86 DeepSeek Harness plugins — 1078 tools**

仓库: https://github.com/chengganping-ship-it/dsh-plugin-toolkit

## 对标竞品覆盖矩阵

| 竞品/需求 | 我们的插件 | 对标优势 |
|-----------|-----------|----------|
| Claude Code Auto Mode | dsh-tool-automode | 89%拦截率+5级安全分类 |
| Playwright Skill (290K安装) | dsh-tool-browserforge | 测试脚本+截图+表单+无障碍 |
| Context7 (52K stars) | dsh-tool-docforge | 多源聚合+版本diff+质量评分 |
| Claude-Mem (48K stars) | dsh-tool-memlink | 记忆图谱+衰减分析+冲突检测 |
| ECC (61 Agents, 20万⭐) | dsh-tool-agentmatrix | 动态角色分配+自适应编排 |
| AgentShield | dsh-tool-redblue | 利用链分析+STRIDE威胁模型 |
| Superpowers (147K stars) | dsh-tool-promptlab | 代码可用率40%→85% |
| Repomix | dsh-tool-compress | Token压缩+语义去重+成本分析 |
| MiniMax Audio (200国) | dsh-tool-voiceforge | TTS+克隆+播客+多语言 |
| Medical AI ($3000亿市场) | dsh-tool-medagent | 临床决策+EHR编码+药物安全 |
| Legal AI (YC W26) | dsh-tool-legalpro | 法律研究+案件分析+文书生成 |
| ERP Agent (Anthropic趋势) | dsh-tool-erpagent | 对账+计提+合规+工作流 |
| 垂直Agent (35%盈利) | dsh-tool-findebt / insurnaut / manufacturex | 高溢价+85%续费率 |
| Google数字装配线 | dsh-tool-workflow | 多Agent协作工作流引擎 |
| A2A开放协议 (Salesforce+Google) | dsh-tool-a2abridge | 跨平台Agent互联 |
| MCP模型上下文协议 | dsh-tool-mcphub | 工具即插即用标准 |
| 全员AI副手 (Google Trend #1) | dsh-tool-personalai | 每位员工的数字副手 |
| Agent安全治理 (Google Trend #5) | dsh-tool-agentguard | 主动防御+零信任 |
| AI网红营销 (400亿$市场) | dsh-tool-influencerX | 创作者发现+合规+ROI预测+危机预警 |
| Agent Skills市场 (日增4400⭐) | dsh-tool-skillmarket | 注册+交易+评级+争议仲裁+认证 |
| 创意资产管理 (Adobe趋势) | dsh-tool-creativault | 入库+标签+合规+搜索+版本+归档 |
| 数据治理引擎 (合规刚需) | dsh-tool-datagov | 目录+质量+血缘+隐私+合规+审计 |
| AI教育引擎 (新职业赛道) | dsh-tool-eduflow | 画像+差距+路径+微学习+认证 |
| AIOps智能运维 (Gartner MQ) | dsh-tool-opsinsight | 告警融合+根因分析+自愈+混沌工程 |
| 全渠道客服AI (WhatsApp趋势) | dsh-tool-supportgenius | 全渠道收件箱+意图识别+工单路由+升级 |
| 智能合规引擎 (合规刚需) | dsh-tool-complianceai | 合同扫描+法规雷达+风险评估+审计准备 |
| AI测试领航 (测试增强) | dsh-tool-testpilot | 用例生成+数据构造+缺陷预测+契约测试 |
| 社媒运营Agent (社媒自动化) | dsh-tool-socialagent | 内容日历+A/B测试+危机检测+ROI |
| Agentic HR (Josh Bersin HR 2030) | dsh-tool-peoplex | 技能图谱+预测+Agentic招聘+薪酬AI |
| AI科研加速 (AI Scientist) | dsh-tool-researchos | 文献综述+假设+实验+论文+评审 |
| 云原生自治运维 (FinOps) | dsh-tool-cloudops | 成本+K8s+可靠性+碳追踪+混沌 |
| 表格智能体 (57%自动化) | dsh-tool-spreadsheet | 公式EDA透视图表+场景+模板 |
| B2B销售引擎 (十万亿$) | dsh-tool-salesengine | 线索+外联+商机+竞争+教练+管线 |
| AI Agent安全 (Check Point) | dsh-tool-cyberagent | Agent防火墙+行为画像+依赖守卫+影子AI检测 |
| 合同全生命周期 (TermScout) | dsh-tool-clmengine | 起草+谈判+义务+续约+AI条款+签署 |
| 客户数据Agent (CDP趋势) | dsh-tool-cdpagent | 统一+细分+旅程+激活+同意+归因 |
| 知识图谱Pro (语义层) | dsh-tool-kgpro | 本体+实体+推理+问答+可视化 |
| 智能会议助理 | dsh-tool-meetingmind | 议程+引导+决策+追踪+异步+分析 |
| 财资编排Agent (渣打2026) | dsh-tool-treasuryagent | 现金+流动性+支付+外汇+反欺诈+投资 |
| ESG Agent (德勤2026) | dsh-tool-esgengine | 碳核算+报告+供应链+绿色金融+气候 |
| 战略采购Agent (88%ROI) | dsh-tool-procureagent | 支出+供应商+寻源+合同+P2P+尾部 |
| 外勤服务Agent | dsh-tool-fieldforce | 工单+调度+移动+资产+区域+效能 |
| 企业预测Agent | dsh-tool-predictagent | 需求+财务+情景+维护+流失+信用 |

## Wave 开发路线

| Wave | 主题 | 数量 | 对标 |
|------|------|------|------|
| 1 | 金融/合规/供应链 | 5 | 基础工具 |
| 2 | AI内容/DeFi/ESG/预测 | 5 | 垂直场景 |
| 3 | 法律/健康/房产/图谱/营销 | 5 | 专业服务 |
| 4 | 安全/气候/物流/HR/API | 5 | 企业需求 |
| 5 | 记忆治理/抓取/技能/压缩 | 5 | Agent基础设施 |
| 6 | 竞品对标进化 | 5 | Memlink/Docforge/Redblue |
| 7 | Vibe Coding/治理/路由 | 5 | 2026 Q3热门 |
| 8 | CI/CD/browser/RAG/auto | 5 | 开发者最热需求 |
| 9 | Voice/ERP/test/contract | 5 | 空白市场填补 |
| 10 | 旅行/知识/审计 | 5 | 个人生产力 |
| 11 | 医疗/法律/金融/保险/制造 | 5 | 高溢价垂直领域 |
| 12 | Google 2026五大趋势全覆盖 | 5 | 数字装配线+A2A+MCP+个人助手+安全治理 |
| 13 | 高增长市场精准卡位 | 5 | 网红营销+Skills市场+创意资产+数据治理+AI教育 |
| 14 | 企业核心系统全覆盖 | 5 | AIOps+全渠道客服+合规+测试+社媒 |
| 15 | 十亿级个人+专业服务 | 5 | Agentic HR+科研+云运营+表格+销售 |
| 16 | 安全+法务+数据+知识+效率 | 5 | AI Agent安全+CLM+CDP+知识图谱+会议 |
| 17 | 财资+ESG+采购+外勤+预测 | 5 | 财资编排+ESG+采购自动化+外勤+预测 |

## 快速发布

```bash
cd dsh-tool-xxx
npm install && npm run build
npm login
npm publish
```

## 完整插件列表 (86个)

| # | 插件 | 分类 | 核心能力 |
|---|------|------|----------|
| 1 | dsh-tool-codereview | 代码审查 | 390工具，安全扫描+架构审查 |
| 2 | dsh-tool-cryptosignal | 金融 | 加密货币套利信号 |
| 3 | dsh-tool-regulator | 合规 | 跨境法规追踪 |
| 4 | dsh-tool-ecomintel | 电商 | 竞品情报分析 |
| 5 | dsh-tool-agentcoord | Agent | 多Agent协同 |
| 6 | dsh-tool-supplyrisk | 供应链 | 供应风险预警 |
| 7 | dsh-tool-amefactory | 内容 | AI内容工厂 |
| 8 | dsh-tool-defiscanner | DeFi | DeFi安全扫描 |
| 9 | dsh-tool-ingredient | 食品 | 成分合规检测 |
| 10 | dsh-tool-esgscore | ESG | ESG评级分析 |
| 11 | dsh-tool-predict | 预测 | 预测分析引擎 |
| 12 | dsh-tool-legalmind | 法律 | 法律文档分析 |
| 13 | dsh-tool-healthai | 医疗 | 医疗诊断支持 |
| 14 | dsh-tool-realestate | 房产 | 房产投资分析 |
| 15 | dsh-tool-knowgraph | 图谱 | 知识图谱构建 |
| 16 | dsh-tool-martech | 营销 | 营销归因分析 |
| 17 | dsh-tool-cybersec | 安全 | 威胁情报分析 |
| 18 | dsh-tool-climate | 气候 | 碳信用分析 |
| 19 | dsh-tool-logistics | 物流 | 路线优化 |
| 20 | dsh-tool-hrtalent | HR | 人才管理分析 |
| 21 | dsh-tool-apieco | API | API生态管理 |
| 22 | dsh-tool-memory | 记忆 | Agent记忆系统 |
| 23 | dsh-tool-governance | 治理 | Agent安全治理 |
| 24 | dsh-tool-reach | 抓取 | 网页智能抓取 |
| 25 | dsh-tool-skills | 技能 | 技能市场管理 |
| 26 | dsh-tool-compress | 压缩 | Token优化压缩 |
| 27 | dsh-tool-memlink | 关联 | 跨插件记忆链接 |
| 28 | dsh-tool-docforge | 文档 | 实时文档注入 |
| 29 | dsh-tool-redblue | 审计 | 红蓝对抗安全审计 |
| 30 | dsh-tool-agentmatrix | 矩阵 | 多Agent协同矩阵 |
| 31 | dsh-tool-apistalk | 追踪 | API变更追踪 |
| 32 | dsh-tool-edutech | 教育 | 教育技术智能 |
| 33 | dsh-tool-fintech | 金融科技 | 金融风险检测 |
| 34 | dsh-tool-insurance | 保险 | 保险分析引擎 |
| 35 | dsh-tool-manufact | 制造 | 制造优化 |
| 36 | dsh-tool-robotic | 机器人 | RPA自动化 |
| 37 | dsh-tool-vibecoder | 编码 | Vibe Coding设计系统 |
| 38 | dsh-tool-trustzone | 沙箱 | 信任执行环境 |
| 39 | dsh-tool-routing | 路由 | 多模型智能路由 |
| 40 | dsh-tool-knowledge | 知识 | 持久化知识管理 |
| 41 | dsh-tool-auditor | 审计 | Agent行为审计 |
| 42 | dsh-tool-cicdpipe | CI/CD | 流水线自动化 |
| 43 | dsh-tool-browserforge | 浏览器 | 浏览器自动化 |
| 44 | dsh-tool-ragengine | RAG | 检索增强生成引擎 |
| 45 | dsh-tool-automode | 自动 | 安全自动执行 |
| 46 | dsh-tool-promptlab | 提示 | 提示工程实验室 |
| 47 | dsh-tool-voiceforge | 语音 | 语音AI引擎 |
| 48 | dsh-tool-erpagent | ERP | 企业ERP自动化 |
| 49 | dsh-tool-testengineer | 测试 | AI测试工程 |
| 50 | dsh-tool-contractmaster | 合同 | 合同全生命周期 |
| 51 | dsh-tool-travelplanner | 旅行 | 智能旅行规划 |
| 52 | dsh-tool-medagent | 医疗 | 医疗AI Agent |
| 53 | dsh-tool-legalpro | 法务 | 法律AI Pro |
| 54 | dsh-tool-findebt | 尽调 | 财务尽调分析 |
| 55 | dsh-tool-insurnaut | 保险 | 保险Navigator |
| 56 | dsh-tool-manufacturex | 制造 | 智能制造Agent |
| 57 | dsh-tool-workflow | 工作流 | 数字装配线引擎 |
| 58 | dsh-tool-a2abridge | 互联 | 跨平台A2A协议桥 |
| 59 | dsh-tool-mcphub | 工具 | MCP上下文协议中心 |
| 60 | dsh-tool-personalai | 生产力 | 个人AI数字副手 |
| 61 | dsh-tool-agentguard | 安全 | Agent安全治理引擎 |
| 62 | dsh-tool-influencerX | 营销 | AI网红营销引擎 |
| 63 | dsh-tool-skillmarket | 市场 | Agent技能交易平台 |
| 64 | dsh-tool-creativault | 创意 | 品牌资产管理系统 |
| 65 | dsh-tool-datagov | 数据 | 数据治理合规引擎 |
| 66 | dsh-tool-eduflow | 教育 | AI学习与技能发展 |
| 67 | dsh-tool-opsinsight | 运维 | AIOps智能运维引擎 |
| 68 | dsh-tool-supportgenius | 客服 | 全渠道客服AI |
| 69 | dsh-tool-complianceai | 合规 | 智能合规引擎 |
| 70 | dsh-tool-testpilot | 测试 | AI测试领航员 |
| 71 | dsh-tool-socialagent | 社媒 | 社交媒体运营Agent |
| 72 | dsh-tool-peoplex | HR | Agentic人力资源引擎 |
| 73 | dsh-tool-researchos | 科研 | AI科研加速助手 |
| 74 | dsh-tool-cloudops | 云运维 | 云原生自治运维 |
| 75 | dsh-tool-spreadsheet | 表格 | 智能表格Agent |
| 76 | dsh-tool-salesengine | 销售 | B2B销售引擎 |
| 77 | dsh-tool-cyberagent | 安全 | AI Agent安全引擎 |
| 78 | dsh-tool-clmengine | 合同 | 合同全生命周期 |
| 79 | dsh-tool-cdpagent | 数据 | 客户数据Agent |
| 80 | dsh-tool-kgpro | 知识 | 知识图谱Pro |
| 81 | dsh-tool-meetingmind | 效率 | 智能会议助理 |
| 82 | dsh-tool-treasuryagent | 财资 | 财资编排Agent |
| 83 | dsh-tool-esgengine | 可持续 | ESG与可持续发展Agent |
| 84 | dsh-tool-procureagent | 采购 | 战略采购Agent |
| 85 | dsh-tool-fieldforce | 外勤 | 外勤服务管理Agent |
| 86 | dsh-tool-predictagent | 预测 | 企业预测智能Agent |

## Wave 17 — 财资+ESG+采购+外勤+预测

| 领域 | 对标信号 | 我们的插件 |
|------|----------|----------|
| 财资编排 | 渣打2026：从数字化到编排化+AI嵌入智能层 | dsh-tool-treasuryagent |
| ESG可持续 | 德勤2026：ESG从合规成本变营收驱动；微软2026可持续发展 | dsh-tool-esgengine |
| 战略采购 | AI Agent 88%正向ROI场景；采购是最大可自动化流程 | dsh-tool-procureagent |
| 外勤服务 | IoT+AI Agent重塑现场服务 | dsh-tool-fieldforce |
| 企业预测 | 预测性AI从工具变成Agent，行业数字孪生爆发 | dsh-tool-predictagent |

## Wave 16 — 安全+法务+数据+知识+效率

| 领域 | 规模/信号 | 我们的插件 |
|------|----------|-----------|
| AI Agent安全 | Check Point: 300亿￥复合增长100%，94%认为AI是安全最重要驱动力 | dsh-tool-cyberagent |
| 合同生命周期 | TermScout 2026: 38%NDA含AI条款，AI披露义务年增240% | dsh-tool-clmengine |
| 客户数据 | CDP市场17.2%增长，68%新项目采用AI Agent+可组合架构 | dsh-tool-cdpagent |
| 知识图谱 | 语义层成企业AI必备，图谱问答爆发 | dsh-tool-kgpro |
| 智能会议 | 会议效率是组织效能最大杠杆 | dsh-tool-meetingmind |

## Wave 15 — 十亿级个人+专业服务

本波次5个插件覆盖专业服务+个人生产力最后高地：

| 领域 | 规模/信号 | 我们的插件 | 时机 |
|------|----------|-----------|------|
| Agentic HR | Josh Bersin HR 2030: HR团队缩减50%，130个Agent | dsh-tool-peoplex | 每家企业都要重构HR |
| AI科研加速 | AI Scientist、paperdigest爆发 | dsh-tool-researchos | 科研全流程自动化空白 |
| 云原生运维 | FinOps+K8s自治+碳中和 | dsh-tool-cloudops | 云支出1.5万亿$，浪费30%+ |
| 表格智能 | 麦肯锡57%工作可自动化，表格是最后堡垒 | dsh-tool-spreadsheet | Excel用户超10亿 |
| B2B销售 | 十万亿$服务市场，销售效率落差 | dsh-tool-salesengine | AI销售+RevOps是顶层风口 |

## Wave 14 — 企业核心系统全覆盖

本波次5个插件补齐企业运营最后关键系统：

| 系统 | 信号 | 我们的插件 | 核心场景 |
|------|------|-----------|----------|
| AIOps智能运维 | Gartner 2026可观测MQ发布，GPT-5.6-Cyber MTTR 4h→22min | dsh-tool-opsinsight | 告警降噪、根因分析、自愈执行 |
| 全渠道客服AI | 49%企业AI优先用于客服，50+WhatsApp自动化工具 | dsh-tool-supportgenius | 统一收件箱、意图分类、工单路由 |
| 合规管理 | GDPR/PIPL/等保执法加强，合规科技Spend增长 | dsh-tool-complianceai | 合同扫描、风险评估、审计准备 |
| 测试增强 | 测试用例生成+缺陷预测成为标配 | dsh-tool-testpilot | 数据构造、覆盖率优化、API契约测试 |
| 社媒运营 | 社交平台月活超50亿，短视频爆发 | dsh-tool-socialagent | A/B测试、竞品监控、危机检测 |

## Wave 13 — 高增长市场精准卡位

本波次5个插件精准切入400亿$以上高增长、低竞争赛道：

| 市场 | 规模/信号 | 我们的插件 | 时机 |
|------|----------|-----------|------|
| AI网红营销 | 2025年325亿$→2026年400亿$，品牌执行效率落差持续扩大 | dsh-tool-influencerX | 平台创作者超1.5亿，传统方式已到极限 |
| Agent Skills市场 | Google/OpenAI/MS 48h内跟进标准，20天内技能数18.5倍增长 | dsh-tool-skillmarket | Skills范式取代MCP成为新的能力分发层 |
| 创意资产管理 | "第三波创意民主化"，视频进入盒子时代 | dsh-tool-creativault | 设计爆炸式增长，品牌合规是刚需 |
| 数据治理 | 数据治理+AI安全评估岗位热度攀升，PIPL/GDPR等保2.0执法加强 | dsh-tool-datagov | 数据资产化+AI监管双轮驱动 |
| AI教育 | Z世代重塑消费逻辑，新职业赛道爆发 | dsh-tool-eduflow | 终身学习+技能认证是每个职场人的刚需 |

## Wave 12 — Google AI Agent Trends 2026 全面对标

基于Google Cloud《AI Agent Trends 2026》报告（3466位企业高管调研），本波次5个插件精准覆盖5大核心趋势：

| Google 2026 趋势 | 我们的插件 | 差异化优势 |
|----------------|-----------|------------|
| 1. 人人拥有AI Agent (49%客服/46%营销/45%技术) | dsh-tool-personalai | 8大日常场景，用意图代替指令 |
| 2. 数字装配线 (88%正ROI) | dsh-tool-workflow | 端到端多步工作流，断点续传+SLA |
| 3. 智能体可发现性 (A2A+MCP) | dsh-tool-a2abridge + mcphub | 跨平台5大框架互联+协议即插即用 |
| 4. 管家级客户体验 (42h→近实时) | workflow+personalai | 个性化跨渠道实时服务 |
| 5. 安全主动防御 (46%用于安全) | dsh-tool-agentguard | 行为审计+红队+零信任+合规自动 |

## License

MIT
