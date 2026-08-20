# DSH Plugin Toolkit

**56 DeepSeek Harness plugins — 838 tools**

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

## 快速发布

```bash
cd dsh-tool-xxx
npm install && npm run build
npm login
npm publish
```

## 完整插件列表 (56个)

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

## License

MIT
