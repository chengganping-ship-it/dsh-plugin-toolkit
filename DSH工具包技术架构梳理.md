# DSH Plugin Toolkit — 技术架构完整梳理

> **186 插件 | 1488 工具 | 5 层突破基础设施 | L2→L4 升级**
>
> 仓库: `chengganping-ship-it/dsh-plugin-toolkit` (GitHub)

---

## 一、项目全景

### 1.1 规模统计

| 维度 | 数值 |
|------|------|
| 插件总数 | 186 (`dsh-tool-*` 目录) |
| 工具总数 | 1488 (每个插件 8 个工具) |
| 覆盖品类 | 37 个垂直行业分类 |
| 代码规范 | TypeScript 5.0+ strict mode |
| 确定性 | 100% 种子PRNG，零随机性输出 |
| 编译结果 | 零 TypeScript 编译错误 |

### 1.2 插件格式 (统一范式)

每个插件遵循完全相同的结构：

```
dsh-tool-{name}/
├── package.json      # 依赖 & 元数据
├── tsconfig.json     # TypeScript 配置
├── cordis.yml        # DSH 插件清单 (名称/版本/工具列表)
├── src/
│   └── index.ts      # 8 个工具实现
└── lib/              # 编译产物 (gitignored)
```

### 1.3 核心 API: `defineTool`

所有 1488 个工具都使用同一个 `defineTool` API 模式：

```typescript
import { defineTool } from '@deepseek-ai/dsh-tools'

ctx.tools.register(defineTool({
  name: 'carbon_price_predictor',
  description: '碳配额价格预测...',
  parameters: {
    input_data: {
      type: 'string',
      description: 'JSON-encoded input',
      required: true,
    }
  },
  output: { schema: {...}, render: 'text' },
  async execute(args: { input_data: string }): Promise<string> {
    const params = JSON.parse(args.input_data)
    // ... 执行逻辑
    return result  // 字符串输出
  }
}))
```

---

## 二、突破基础设施 (L1-L5) 架构

```
┌─────────────────────────────────────────────────────────────────┐
│                    L5: 多Agent编排旗舰Demo                       │
│         5个Agent × 4阶段DAG → 碳中和战略计划                     │
├─────────────────────────────────────────────────────────────────┤
│                    L4: 成本治理引擎                              │
│         预算追踪 + 阈值告警 + Token优化 + 强制执行                │
├─────────────────────────────────────────────────────────────────┤
│                    L3: 自验证循环引擎                            │
│         执行 → 验证 → 重试 → 自批判 → 升级                      │
├─────────────────────────────────────────────────────────────────┤
│                    L2: A2A AgentCard 协议层                     │
│         185个AgentCard JSON → 跨平台Agent互操作                  │
├─────────────────────────────────────────────────────────────────┤
│                    L1: MCP 无状态桥接层                          │
│         186插件(1488工具) → MCP协议暴露 → 任意AI客户端            │
├─────────────────────────────────────────────────────────────────┤
│              186 DSH Plugins (1488 Tools)                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、L1: MCP Bridge — 无状态桥接层

### 3.1 核心思想

将 186 个 DSH 插件（1488 个工具）通过 MCP (Model Context Protocol) 标准协议暴露给任意 AI 客户端（Claude Desktop、Cursor、VSCode 等）。

### 3.2 技术架构

```
MCP Client (Claude/Cursor)
    ↓ MCP Protocol (Stdio Transport)
[dsh-mcp-bridge Server]
    ↓ Plugin Discovery
    ├── 扫描 dsh-tool-* 目录
    ├── 解析 cordis.yml (YAML轻量解析器)
    └── 可选: 从 src/index.ts 提取工具名
    ↓ Schema Conversion
    ├── DSH defineTool → MCP Tool Schema
    ├── 命名: {plugin}.{tool}  (如 carbontradingagent.carbon_price_predictor)
    └── input_data → JSON Schema
    ↓ Execution
    ├── 动态 import 插件模块
    ├── Mock cordis context 捕获注册
    └── 路由到正确的插件.工具
```

### 3.3 关键文件

| 文件 | 职责 |
|------|------|
| `src/index.ts` | MCP 服务器入口，ListTools/CallTool 处理器 |
| `src/plugin-discovery.ts` | 自动发现插件，YAML 解析，源码工具提取 |
| `src/tool-adapter.ts` | DSH→MCP schema 转换，执行包装 |
| `src/cost-tracker.ts` | Token 估算，预算检查 |
| `src/types.ts` | 类型定义 (DiscoveredPlugin, BridgeConfig, MCPToolDefinition) |
| `.mcp.json` | Claude Desktop 一键配置 |

### 3.4 核心实现亮点

**无状态设计** — 遵循 2026.07.28 MCP 规范重新设计，无 session，每次请求自带身份。

**智能插件发现** — 双重提取策略：
1. 优先从 `cordis.yml` 解析工具列表
2. 若仅有数量 (`tools: 8`)，降级到正则扫描 `src/index.ts` 的 `defineTool` 调用

**动态工具加载** — 按需加载，首次调用时 `import(plugin/src/index.ts)` 创建 mock context 拦截 `tools.register()` 调用。

**命名空间隔离** — 所有工具以 `{plugin}.{tool}` 格式命名（如 `carbontradingagent.carbon_price_predictor`），避免跨插件名称冲突。

### 3.5 使用方式

```bash
# 本地运行 (stdio 模式)
cd mcp-bridge
npm install
npm run build
node lib/index.js

# 或配置 Claude Desktop
# .mcp.json 已预填一键配置
```

---

## 四、L2: A2A Cards — Agent互操作协议

### 4.1 核心思想

为 185 个插件生成 Google A2A v1.0 标准的 `AgentCard` JSON 描述符，实现跨平台 Agent 间任务委派。

### 4.2 AgentCard 结构 (A2A v1.0)

```json
{
  "name": "carbontradingagent",
  "description": "碳市场分析AI Agent",
  "url": "https://github.com/chengganping-ship-it/dsh-plugin-toolkit",
  "version": "0.1.0",
  "capabilities": {
    "streaming": false,
    "pushNotifications": false
  },
  "skills": [
    {
      "id": "carbon_price_predictor",
      "description": "碳配额价格预测",
      "inputModes": ["application/json"],
      "outputModes": ["text/plain"]
    }
  ]
}
```

### 4.3 关键文件

| 文件 | 职责 |
|------|------|
| `schema.ts` | A2A v1.0 TypeScript 接口定义 |
| `generate.ts` | 从 cordis.yml 自动生成 185 个 AgentCard |
| `cards/*.json` | 185 个已生成的 AgentCard 文件 |

### 4.4 自动生成的核心逻辑

遍历 `dsh-tool-*` 目录 → 读取 `cordis.yml` → 提取 name/version/description/tools → 按 A2A schema 组装 JSON。

---

## 五、L3: Loop Engineering — 自验证循环引擎

### 5.1 核心思想

2026 年 Agentic Engineering 学科的核心范式：**执行 → 验证 → 重试 → 升级**。每个工具调用都被包裹在自验证循环中，自动检查输出质量，失败时重试。

### 5.2 算法流程

```
executeWithLoop(toolName, executeFn, input, config):
  for attempt 1..maxRetries:
    ┌─ output = await executeFn(input)
    ├─ errors = runValidators(output, validators)
    ├─ score = selfCritique ? analyzeCritique(output) : undefined
    ├─ record attempt {output, errors, score}
    │
    ├─ if errors == 0: → ✅ SUCCESS, return result
    │
    └─ if attempt < maxRetries:
         onRetry(attempt, errors)
         sleep(backoffMs * attempt)  // 线性回退

  // 全部尝试耗尽
  best = selectBestAttempt(attempts)  // 最少错误 → 最高分 → 最新
  return { success: false, output: best, warnings }
```

### 5.3 六个内建验证器

| 验证器 | 用途 |
|--------|------|
| `jsonValidator` | 校验 JSON 语法和必需字段 |
| `markdownStructureValidator` | 校验 Markdown 结构 (标题数、表格) |
| `noHallucinationMarkers` | 检测 LLM 幻觉标记 ("As an AI", 占位符等) |
| `lengthValidator` | 长度边界 (字符数/词数) |
| `keywordPresenceValidator` | 必须/任选/禁止关键词检查 |
| `disclaimerValidator` | 免责声明检查 (金融/医疗/法律) |

### 5.4 自批判模块 (Self-Critique)

无需 LLM 调用的启发式评分系统，三维度加权：

| 维度 | 权重 | 检测项 |
|------|------|--------|
| **完整性** | 35% | 标题、列表、表格、数字数量、词数 |
| **一致性** | 30% | 矛盾表述、标题层级、未完成的句子、重复 |
| **可操作性** | 35% | 建议关键词、日期、百分比、行动项 |

### 5.5 关键文件

| 文件 | 职责 |
|------|------|
| `src/loop-executor.ts` | 核心循环执行器 |
| `src/validators.ts` | 6 个可复用验证器 |
| `src/self-critique.ts` | 启发式质量评分 |
| `src/types.ts` | LoopConfig, LoopResult, AttemptRecord |
| `examples/carbon-loop-demo.ts` | 碳价预测工具的自验证 demo |

### 5.6 使用示例

```typescript
import { executeWithLoop } from 'dsh-loop-engineering'
import { markdownStructureValidator, disclaimerValidator } from 'dsh-loop-engineering/validators'

const result = await executeWithLoop(
  'carbon_price_predictor',
  async (input) => carbonTool.execute(input),
  '{"market": "CN-ETS"}',
  {
    maxRetries: 3,
    backoffMs: 500,
    validators: [
      markdownStructureValidator({ minHeaders: 2 }),
      disclaimerValidator(),
    ],
    selfCritique: true,
    onRetry: (attempt, error) => console.log(`Retry #${attempt}: ${error}`),
  }
)

console.log(result.success)     // true/false
console.log(result.finalScore)  // 0-100 质量评分
console.log(result.attempts)    // 每次尝试的记录
```

---

## 六、L4: Cost Governance — 成本治理引擎

### 6.1 核心思想

解决 AI Agent 最大痛点之一 — **成本失控**。Gartner 数据显示 40% 的 AI 项目因成本问题被砍。L4 提供全链路 Token 追踪、预算强制和成本优化。

### 6.2 三层预算体系

```
Global Monthly Budget ──── 全局月度预算
    └── Per-User Budget ──── 按用户限额
        └── Per-Plugin Budget ── 按插件限额
```

### 6.3 状态机

```
OK → WARNING (80%) → CRITICAL (95%) → EXCEEDED (100%)
 │         │              │                  │
允许执行   允许执行        允许执行            拒绝执行
                      + 告警                + 阻断
```

### 6.4 关键文件

| 文件 | 职责 |
|------|------|
| `src/budget-manager.ts` | 预算核心：限额、追踪、月度滚动、按实体分摊 |
| `src/cost-tracker.ts` | 调用级 Token 捕捉，读写量的 token 估算 |
| `src/optimizer.ts` | 成本优化建议 (模型降级、缓存策略) |
| `src/alerting.ts` | 阈值触发告警 (Webhook/Log/Callback) |
| `src/dashboard.ts` | ASCII 终端看板 (实时成本可视化) |
| `src/types.ts` | BudgetConfig, BudgetStatus, CostRecord |
| `prompts/cost-awareness.md` | 注入 LLM 的成本感知提示词模板 |

### 6.5 使用示例

```typescript
import { BudgetManager } from 'dsh-cost-governance'

const budget = new BudgetManager({
  monthlyBudgetUSD: 50.0,
  warningThreshold: 0.8,
  hardLimitThreshold: 1.0,
  perPluginBudgetUSD: 5.0,
  rolloverEnabled: true,
})

// 检查调用是否被允许
const allowed = budget.isAllowed('plugin', 'carbontradingagent')

// 记录每次调用消耗
budget.recordSpend(0.0023, 'plugin', 'carbontradingagent')

// 获取状态
const status = budget.getStatus()
// { status: 'warning', percentageUsed: 0.82, projectedSpendUSD: 52.30 }
```

---

## 七、L5: 多Agent编排旗舰Demo

### 7.1 核心思想

演示 L4 (Collaborative Intelligence) 的最高形态：5 个 DSH 插件 Agent 跨域协作，通过 4 阶段顺序工作流共同产出碳中和战略计划。

### 7.2 编排拓扑

```
Phase 1: Baseline Assessment (基线评估)
  ├── CarbonTradingAgent  → compliance_gap_analyzer
  ├── ManufacturingAgent  → carbon_footprint_assessment
  └── EcoAgent            → carbon_sink_assessment
           ↓
Phase 2: Reduction Strategy (减排策略)
  ├── EnergyAgent         → solar_rooftop_assessment + energy_efficiency_audit
  └── ManufacturingAgent  → process_optimization
           ↓
Phase 3: Carbon Trading (碳交易计划)
  └── CarbonTradingAgent  → offset_portfolio_optimizer + ets_market_analyzer
           ↓
Phase 4: Implementation Roadmap (财务路线图)
  └── FinanceAgent        → financial_modeling (NPV/IRR)
           ↓
  最终: Consolidated Carbon Neutrality Plan (整合报告)
```

### 7.3 关键文件

| 文件 | 职责 |
|------|------|
| `orchestrator.ts` | 顺序 4 阶段调度器，终端输出美化，Markdown 报告生成 |
| `agents/carbon-agent.ts` | CarbonTradingAgent 包装器 (8工具) |
| `agents/energy-agent.ts` | EnergyAgent 包装器 (8工具) |
| `agents/manufacturing-agent.ts` | ManufacturingAgent 包装器 (8工具) |
| `agents/eco-agent.ts` | EcoAgent 包装器 (8工具) |
| `agents/finance-agent.ts` | FinanceAgent 包装器 (8工具) |
| `workflow/1-assessment.ts` | Phase 1: 并行执行 3 个 Agent |
| `workflow/2-strategy.ts` | Phase 2: 能源+制造减排方案 |
| `workflow/3-trading.ts` | Phase 3: 碳交易策略 |
| `workflow/4-roadmap.ts` | Phase 4: 财务投资路线图 |
| `types.ts` | AgentTaskResult 接口定义 |

### 7.4 执行模型

```typescript
// Orchestrator 入口
async function main() {
  const phase1 = await runAssessmentPhase()  // 3个Agent并行
  const phase2 = await runStrategyPhase()    // 2个Agent并行
  const phase3 = await runTradingPhase()      // 碳市场分析
  const phase4 = await runRoadmapPhase()      // 财务建模
  
  const report = generateReport([phase1, phase2, phase3, phase4], totalDuration)
  await writeFile('./neutrality-plan.md', report)
}
```

### 7.5 运行方式

```bash
cd demos/multi-agent-carbon-neutral
npm install
npm run build
node lib/orchestrator.js

# 输出: 
# 1. 终端彩色实时进度
# 2. neutrality-plan.md 整合报告
```

---

## 八、186 插件分类总表

### 8.1 按 Wave 迭代进程

| Wave | 时间 | 新增 | 累计 |
|------|------|------|------|
| Enterprise Core | 2025 | 22 plugins | 22 |
| Finance & Compliance | 2025 | 16 plugins | 38 |
| Developer & Engineering | 2025 | 13 plugins | 51 |
| Vertical Industries | 2025 | 19 plugins | 70 |
| Wave 20 | 2026.08 | 5 | 75 |
| ... | ... | ... | ... |
| Wave 37 | 2026.08 | 5 | **186** |

### 8.2 37 个品类覆盖 (选摘)

| 品类 | 代表插件 |
|------|----------|
| 供应链 | supplyriskshield, logistagentpro, manufact |
| 医疗 | healthagentpro, pharmaaiagent, medagent |
| 金融 | fintechagentpro, wealthagentpro, cryptosignal |
| 教育 | eduagentpro, langlearnagentpro, eduflow |
| 能源 | energyagentpro, hydrogenenergyagent, powergridagent |
| 碳交易 | carbontradingagent, ecoagentpro, climate |
| 农业 | agriagentpro, seedbreedingagent, dairyfarmagent |
| 游戏 | gameaiagent, vibecodingagent, agentfactory |
| 太空 | spaceaeroagent, autodriveagent, dronedeliveryagent |
| ... | ... (共 37 个品类) |

---

## 九、技术栈总结

| 层次 | 技术选型 |
|------|----------|
| **语言** | TypeScript 5.0+ (strict mode, ES2022 target) |
| **插件框架** | DeepSeek Harness (Cordis) 依赖注入 |
| **协议** | MCP v1.30 (@modelcontextprotocol/sdk), Google A2A v1.0 |
| **Schema** | Zod v4 (MCP Bridge), 自定义 YAML 解析器 |
| **构建** | 独立 tsc 编译 (每个插件独立构建) |
| **输出确定性** | 种子 PRNG (mulberry32) — 100% 可复现 |
| **依赖管理** | 每个插件独立 package.json + npm |
| **MIT 许可证** | 完全开源 |

---

## 十、设计模式与原则

### 10.1 统一 Contract: `input_data: string`

所有 1488 个工具共享统一的输入契约 — 单个 `input_data` 字符串参数，实际参数 JSON 编码在内部。这个设计使得 MCP Bridge 可以用一个通用 schema 暴露所有工具。

### 10.2 渐进式降级

MCP Bridge 和 Agent Discovery 都实现了多层降级：
1. 完整 cordis.yml → 直接解析工具列表
2. 仅有数量 → 自动扫描源码提取
3. 无源码 → 仍然注册（执行时返回声明）

### 10.3 关注点分离

- **L1 (MCP)** 只负责协议适配
- **L2 (A2A)** 只负责互操作描述
- **L3 (Loop)** 只负责质量验证
- **L4 (Cost)** 只负责预算治理
- **L5 (Demo)** 只负责效果演示

每层可独立使用，也可组合叠加。

### 10.4 零外部运行时依赖

除了 MCP Bridge 依赖 `@modelcontextprotocol/sdk`，其他层（Loop、Cost、A2A）均为纯 TypeScript 实现，零运行时 npm 依赖，可直接嵌入任何项目。

---

## 十一、下一步可探索方向

1. **StreamableHTTP 传输** — 从 stdio 升级到 HTTP 流，支持负载均衡
2. **A2A 运行时验证** — 生成后自动验证 AgentCard 语法
3. **Loop→Cost 联动** — 由 Cost Governance 驱动 Loop 的重试预算
4. **更多 Demo 场景** — 财务审计、供应链优化、医疗诊断等多 Agent 场景
5. **插件热重载** — Watch mode 已骨架实现，可完成完整的自动发现刷新

---

*文档生成时间: 2026-08 | 当前 commit: 912065b*
