# DSH Plugin Marketplace 上架指南

## 快速发布

所有46个插件已就绪，每个插件独立发布到npm和DSH市场：

```bash
cd dsh-tool-xxx
npm login          # 登录npm账号
npm publish        # 发布到npm
```

## DSH市场标签

每个插件已添加以下标签：
- `dsh` / `deepseek-harness` / `plugin` / `ai-agent` / `cordis`
- 功能标签（如 `crypto`, `security`, `rag`, `browser` 等）

## 上架检查清单

- [x] package.json 含 name, version, description
- [x] 含 MIT license
- [x] 含 cordis.yml manifest
- [x] 含 README.md 文档
- [x] TypeScript严格模式编译通过
- [x] npm run build 可执行
- [x] 含keywords标签

## 46个插件清单

| # | 插件 | 分类 | 安装命令 |
|---|------|------|----------|
| 1 | dsh-tool-cryptosignal | 金融 | npm i dsh-tool-cryptosignal |
| 2 | dsh-tool-regulator | 法律合规 | npm i dsh-tool-regulator |
| 3 | dsh-tool-ecomintel | 电商 | npm i dsh-tool-ecomintel |
| 4 | dsh-tool-agentcoord | Agent协同 | npm i dsh-tool-agentcoord |
| 5 | dsh-tool-supplyrisk | 供应链 | npm i dsh-tool-supplyrisk |
| 6 | dsh-tool-amefactory | 内容创作 | npm i dsh-tool-amefactory |
| 7 | dsh-tool-defiscanner | DeFi安全 | npm i dsh-tool-defiscanner |
| 8 | dsh-tool-ingredient | 食品/化妆品 | npm i dsh-tool-ingredient |
| 9 | dsh-tool-esgscore | ESG评级 | npm i dsh-tool-esgscore |
| 10 | dsh-tool-predict | 预测分析 | npm i dsh-tool-predict |
| 11 | dsh-tool-legalmind | 法律文档 | npm i dsh-tool-legalmind |
| 12 | dsh-tool-healthai | 医疗健康 | npm i dsh-tool-healthai |
| 13 | dsh-tool-realestate | 房地产 | npm i dsh-tool-realestate |
| 14 | dsh-tool-knowgraph | 知识图谱 | npm i dsh-tool-knowgraph |
| 15 | dsh-tool-martech | 营销技术 | npm i dsh-tool-martech |
| 16 | dsh-tool-cybersec | 网络安全 | npm i dsh-tool-cybersec |
| 17 | dsh-tool-climate | 气候/碳 | npm i dsh-tool-climate |
| 18 | dsh-tool-logistics | 物流 | npm i dsh-tool-logistics |
| 19 | dsh-tool-hrtalent | HR人才 | npm i dsh-tool-hrtalent |
| 20 | dsh-tool-apieco | API经济 | npm i dsh-tool-apieco |
| 21 | dsh-tool-memory | 记忆管理 | npm i dsh-tool-memory |
| 22 | dsh-tool-governance | 安全治理 | npm i dsh-tool-governance |
| 23 | dsh-tool-reach | 网页抓取 | npm i dsh-tool-reach |
| 24 | dsh-tool-skills | 技能市场 | npm i dsh-tool-skills |
| 25 | dsh-tool-compress | Token压缩 | npm i dsh-tool-compress |
| 26 | dsh-tool-memlink | 记忆关联 | npm i dsh-tool-memlink |
| 27 | dsh-tool-docforge | 文档注入 | npm i dsh-tool-docforge |
| 28 | dsh-tool-redblue | 红蓝对抗 | npm i dsh-tool-redblue |
| 29 | dsh-tool-agentmatrix | 多Agent协同 | npm i dsh-tool-agentmatrix |
| 30 | dsh-tool-apistalk | API追踪 | npm i dsh-tool-apistalk |
| 31 | dsh-tool-edutech | 教育 | npm i dsh-tool-edutech |
| 32 | dsh-tool-fintech | 金融科技 | npm i dsh-tool-fintech |
| 33 | dsh-tool-insurance | 保险 | npm i dsh-tool-insurance |
| 34 | dsh-tool-manufact | 制造业 | npm i dsh-tool-manufact |
| 35 | dsh-tool-robotic | 机器人 | npm i dsh-tool-robotic |
| 36 | dsh-tool-vibecoder | Vibe Coding | npm i dsh-tool-vibecoder |
| 37 | dsh-tool-trustzone | 信任沙箱 | npm i dsh-tool-trustzone |
| 38 | dsh-tool-routing | 模型路由 | npm i dsh-tool-routing |
| 39 | dsh-tool-knowledge | 知识管理 | npm i dsh-tool-knowledge |
| 40 | dsh-tool-auditor | 行为审计 | npm i dsh-tool-auditor |
| 41 | dsh-tool-cicdpipe | CI/CD | npm i dsh-tool-cicdpipe |
| 42 | dsh-tool-browserforge | 浏览器自动化 | npm i dsh-tool-browserforge |
| 43 | dsh-tool-ragengine | RAG引擎 | npm i dsh-tool-ragengine |
| 44 | dsh-tool-automode | 自动模式 | npm i dsh-tool-automode |
| 45 | dsh-tool-promptlab | 提示工程 | npm i dsh-tool-promptlab |

## GitHub Topics

仓库已添加 topics: `dsh`, `deepseek-harness`, `plugin`, `ai-agent`, `cordis`

## 后续版本规划

- v0.2.0: 添加MCP协议支持
- v0.3.0: 添加A2A协议适配
- v1.0.0: 正式稳定版
