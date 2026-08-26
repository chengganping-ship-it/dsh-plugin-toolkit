# Funding Mirror — 加密费率套利监控平台

> **不给你看快照，给你看真相。所有数据来自 Binance/Bybit/OKX/Gate/Bitget 真实 API。**

---

## 和竞品（Coinglass / CryptoQuant / Hyblock）有什么不同

| 功能 | 竞品 | 我们 |
|------|------|------|
| 当前费率 | ✅ | ✅ |
| 标记价/指数价/持仓量/成交额 | 部分 | ✅ |
| 跨交易所套利计算 | ❌ | ✅ |
| **5 交易所 (Binance/Bybit/OKX/Gate/Bitget)** | 最多 3 个 | ✅ |
| **历史回测（实际赚了多少）** | ❌ | ✅ |
| **风险评分(0-100)** | ❌ | ✅ |
| **费率动量趋势** | ❌ | ✅ |
| **可执行头寸计算器** | ❌ | ✅ |
| **95%置信区间** | ❌ | ✅ |
| **实时套利热力图 Web UI** | ❌ | ✅ |
| **费率异常检测 (突变/闪崩/分歧)** | ❌ | ✅ |
| **费率方向预测 (基于订单簿失衡)** | ❌ | ✅ |
| **容量估算 (能投多少钱)** | ❌ | ✅ |
| **REST API + WebSocket** | ❌ | ✅ |
| **7x24 监控 + Telegram/Discord 告警** | ❌ | ✅ |
| **风控模块（最大回撤/日交易上限）** | ❌ | ✅ |
| **PnL 追踪日志** | ❌ | ✅ |

---

## 架构：三件套

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

┌─────────────────────────────────────────────────────┐
│              Funding Mirror Web Platform             │
│  REST API + WebSocket + 实时热力图                  │
│       ↕ 5 交易所 (Binance/Bybit/OKX/Gate/Bitget)   │
│       ↕ 异常检测引擎 (Z-score/Regime/Divergence)    │
│       ↕ 费率预测引擎 (订单簿失衡 + 动量 + 均值回归)  │
│       ↕ 容量估算器 (基于订单簿深度)                  │
│       ↕ Web Dashboard (热力图 + 表格 + 告警)        │
└─────────────────────────────────────────────────────┘
```

---

## 实测数据（2026-08-26）

**Funding Mirror Web Platform 启动：**
```
[#1] 16:04:48 | 3309 rates across 5 exchanges | 58 opps | 21 anomalies | 14040ms
```

**REST API 返回：**
```json
{
  "status": "ok",
  "totalRates": 3309,
  "exchanges": ["Binance", "Bybit", "OKX", "Gate", "Bitget"],
  "opportunities": 58,
  "anomalies": 22,
  "predictions": 0
}
```

**套利机会示例（含容量估算）：**
```json
{
  "symbol": "STORJUSDT",
  "longEx": "Binance",
  "shortEx": "Bybit",
  "spreadPct": 1.3578,
  "netAnnualized": 1399.22,
  "capacity": {
    "maxCapacityUsd": 100000000,
    "recommendedSize": 50000000,
    "slippageAtCapacity": 0.4934,
    "spreadCapturePct": 63.65,
    "depthQuality": "DEEP"
  }
}
```

**异常检测示例：**
```json
{
  "symbol": "BNCUSDT",
  "type": "DIVERGENCE",
  "severity": 100,
  "description": "BNCUSDT 跨所费率分歧: Bitget 0.0000% vs Bybit -2.0000%",
  "zScore": 20
}
```

---

## Funding Mirror Web Platform

### 启动

```bash
cd web-platform/server
npm install
npm run build
npm start
```

打开 http://localhost:8771 查看实时仪表盘。

### REST API

| 端点 | 说明 |
|------|------|
| `GET /api/rates` | 所有费率数据 |
| `GET /api/opportunities?minNet=3` | 套利机会（含容量估算） |
| `GET /api/anomalies` | 费率异常告警 |
| `GET /api/predictions` | 费率方向预测 |
| `GET /api/stats` | 系统状态统计 |
| `WS /ws` | WebSocket 实时推送 |

### 突破性功能

**1. 实时套利热力图** — 所有币种按净年化排序，颜色编码一目了然

**2. 费率异常检测** — 基于 Z-score 统计检测费率突变、闪崩、跨所分歧、机制变化

**3. 费率方向预测** — 综合订单簿失衡 + 动量 + 均值回归，预测下一期费率方向

**4. 容量估算器** — 基于订单簿深度，告诉你每个机会能投多少钱、滑点多少、能捕获多少 spread

**5. 5 交易所全覆盖** — 比竞品多 Gate 和 Bitget，发现更多跨所机会

---

## Sentinel — 7x24 套利哨兵

```bash
cd crypto-funding-rate
npm install && npm run build
node dist/sentinel.js --config sentinel.json
```

Windows 计划任务安装：
```powershell
powershell -ExecutionPolicy Bypass -File setup-task.ps1
```

配置 Telegram/Discord/Slack 告警、风控参数见 `sentinel.example.json`。

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

---

## 项目结构

```
dsh-plugin-toolkit/
├── README.md
├── crypto-funding-rate/              # MCP Server + Sentinel
│   ├── src/
│   │   ├── index.ts                  # MCP Server (6 工具)
│   │   └── sentinel.ts               # Sentinel v2.0 守护进程
│   ├── sentinel.example.json
│   ├── setup-task.ps1
│   └── start-sentinel.bat
└── web-platform/                     # Funding Mirror Web
    ├── server/
    │   ├── src/
    │   │   ├── index.ts              # Express + WebSocket 服务器
    │   │   ├── exchanges/
    │   │   │   └── base.ts           # 5 交易所连接器
    │   │   └── engine/
    │   │       ├── anomaly.ts        # 异常检测引擎
    │   │       ├── predictor.ts      # 费率预测引擎
    │   │       └── capacity.ts       # 容量估算器
    │   └── package.json
    └── client/
        └── public/
            └── index.html            # 实时仪表盘 (热力图 + 表格)
```

---

## License

MIT
