# Crypto Funding Rate MCP Server + Sentinel

> **不给你看快照，给你看真相。所有数据来自 Binance/Bybit/OKX 真实 API。**

---

## 和竞品（Coinglass / CryptoQuant / Hyblock）有什么不同

| 功能 | 竞品 | 我们 |
|------|------|------|
| 当前费率 | ✅ | ✅ |
| 标记价/指数价/持仓量/成交额 | 部分 | ✅ |
| 跨交易所套利计算 | ❌ | ✅ |
| **历史回测（实际赚了多少）** | ❌ | ✅ |
| **风险评分(0-100)** | ❌ | ✅ |
| **费率动量趋势** | ❌ | ✅ |
| **可执行头寸计算器** | ❌ | ✅ |
| **95%置信区间** | ❌ | ✅ |
| **7x24 监控 + Telegram/Discord 告警** | ❌ | ✅ |
| **风控模块（最大回撤/日交易上限）** | ❌ | ✅ |
| **PnL 追踪日志** | ❌ | ✅ |
| **Windows 计划任务集成** | ❌ | ✅ |

---

## 架构：MCP Server + Sentinel

```
┌─────────────────────────────────────────────────────┐
│                   MCP Server (6 工具)                │
│  get_rates / find_arbitrage / analyze_symbol        │
│  calculate_position / backtest_strategy / statistics │
│  ↕ Claude Code / Cursor / 任意 MCP 客户端            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                   Sentinel v2.0                      │
│  轮询 → 检测 → 风控 → 去重 → 告警 → PnL            │
│       ↕ Binance / Bybit / OKX 真实 API             │
│       ↕ Telegram / Discord / Slack                  │
│       ↕ Windows 计划任务 7x24                        │
│       ↕ HTTP 健康检查 :8770/health                  │
└─────────────────────────────────────────────────────┘
```

---

## 实测数据（2026-08-25）

**MCP 工具回测：**
```
BTCUSDT:
  Binance 费率: 0.0100%  |  Bybit 费率: 0.0058%
  7天回测净收益: -1.10% (费率相同时手续费在吃本金)
ETHUSDT:
  Binance 费率: 0.0100%  |  Bybit 费率: 0.0074%
  7天回测净收益: -1.12%
```

**Sentinel 实时监控输出：**
```
[#3] 21:06:14 | Binance/Bybit/OKX | 1603 rates | 4590ms
📊 健康检查: http://localhost:8770/health
📈 PnL 日志: http://localhost:8770/pnl
```

健康检查返回：
```json
{
  "status": "ok",
  "uptime": "0h 0m",
  "totalPolls": 3,
  "dailyTrades": 0,
  "dailyPnlPct": 0,
  "maxDrawdown": 0,
  "consecutiveErrors": 0
}
```

历史机会（首次运行）：
```
🆕 NEW XRPUSDT: Spread 0.0128% → 净年化 13.81% | 做多Binance + 做空Bybit
🆕 NEW AVAXUSDT: Spread 0.0053% → 净年化 5.56% | 做多Binance + 做空Bybit
🆕 NEW DOGEUSDT: Spread 0.0043% → 净年化 4.47% | 做多Binance + 做空Bybit
```

---

## Sentinel — 7x24 套利哨兵

### 快速启动

```bash
# 编译
cd crypto-funding-rate && npm install && npm run build

# 使用配置文件运行（推荐）
cp sentinel.example.json sentinel.json
# 编辑 sentinel.json 填入你的 Telegram botToken 等
node dist/sentinel.js

# 命令行覆盖参数
node dist/sentinel.js --threshold 0.05 --interval 300 --min-net 5

# 带 Telegram 告警
node dist/sentinel.js --telegram-token 123456:ABC --telegram-chat 123456

# 带 Discord 告警
node dist/sentinel.js --discord https://discord.com/api/webhooks/xxx
```

### 7x24 运行（Windows 计划任务）

```powershell
# 以管理员身份运行 PowerShell
powershell -ExecutionPolicy Bypass -File setup-task.ps1
```

任务会注册为开机自启、自动重启（失败后 5 分钟重试，最多 3 次）。

管理命令：
```
查看状态:  Get-ScheduledTask -TaskName 'FundingRateSentinel'
停止:      Stop-ScheduledTask -TaskName 'FundingRateSentinel'
查看日志:  Get-Content dist\out.log -Tail 20 -Wait
```

或者不安装计划任务，直接双击 `start-sentinel.bat`。

### 配置文件说明

**sentinel.json**：

```json
{
  "threshold": 0.02,          // 最低 spread % 才告警
  "interval": 60,             // 轮询间隔秒数
  "minNetAnnualized": 3,      // 最低净年化 %
  "symbols": ["BTCUSDT", "ETHUSDT", ...],  // 监控的币种
  "telegram": {
    "botToken": "YOUR_BOT_TOKEN",
    "chatId": "YOUR_CHAT_ID"
  },
  "discord": {
    "webhook": "https://..."
  },
  "slack": {
    "webhook": "https://..."
  },
  "risk": {
    "maxDrawdownPct": 5,      // 日最大回撤 %，超过暂停告警
    "maxDailyTrades": 10,     // 日最大交易次数
    "maxSingleTradePct": 25,  // 单次交易最大本金占比
    "pauseAfterLoss": true    // 亏损时暂停
  },
  "healthPort": 8770          // HTTP 健康检查端口
}
```

### 风控逻辑

Sentinel 内置风控模块，遇到以下情况会自动暂停告警：

| 条件 | 动作 |
|------|------|
| 日交易次数 >= 上限 | 暂停直到次日 |
| 最大回撤 >= 上限 | 暂停直到次日 |
| 连续 API 错误 >= 5 次 | 暂停直到恢复 |
| 异常高费率 (>0.5%/8h) | 风险评分 +15，降低推荐价 |

风险评分 (0-100)：
- 🟢 <30 低风险，流动性好，spread 正常
- 🟡 30-60 中等风险
- 🔴 >60 高风险，warning

### PnL 追踪

Sentinel 自动记录每笔机会的预估盈亏到 `pnl-log.jsonl`（JSON Lines 格式），可通过 HTTP 查看：

```bash
curl http://localhost:8770/pnl
```

格式：
```json
{"timestamp":1724587200,"symbol":"XRPUSDT","direction":"多Binance/空Bybit","spreadPct":0.0128,"estimatedPnlPct":0.0014,"cumulativePnlPct":0.0014,"note":"risk=35"}
```

---

## MCP 工具 (6 个)

| 工具 | 干什么 |
|------|--------|
| `get_rates` | 实时费率 + 价格 + 持仓量 + 24h成交额 |
| `find_arbitrage` | 套利信号 + 风险评分 + 过滤 |
| `analyze_symbol` | 单币种三所对比深度分析 |
| `calculate_position` | 输入金额 → 输出实际下单参数、成本、收益、强平缓冲 |
| `backtest_strategy` | 历史回测：实际收益、最大回撤、夏普、胜率、置信区间 |
| `get_statistics` | 费率统计：均值、波动率、动量(上升/下降) |

```json
{
  "mcpServers": {
    "crypto-funding-rate": {
      "command": "node",
      "args": ["绝对路径/crypto-funding-rate/dist/index.js"]
    }
  }
}
```

---

## 项目结构

```
dsh-plugin-toolkit/
├── README.md
├── crypto-funding-rate/
│   ├── package.json
│   ├── tsconfig.json
│   ├── sentinel.example.json    # 配置模板
│   ├── setup-task.ps1           # Windows 计划任务安装脚本
│   ├── start-sentinel.bat       # 双击启动
│   ├── dist/                    # 编译输出
│   └── src/
│       ├── index.ts             # MCP Server (6 工具)
│       └── sentinel.ts          # Sentinel v2.0 守护进程
```

---

## 关于之前的内容

这个仓库之前有 360 个假插件（2880 个工具），全部基于 `mulberry32` 随机数生成器，产出虚构数据。
2026-08-24 已全部清除，改为做真正有用的事。

---

## License

MIT
