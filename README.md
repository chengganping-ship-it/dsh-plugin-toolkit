# Funding Mirror — 加密费率套利监控平台 v2

> **不给你看快照，给你看真相。所有数据来自 Binance/Bybit/OKX/Gate/Bitget 真实 API。**

---

## 和竞品（Coinglass / CryptoQuant / Hyblock）对比

| 功能 | 竞品 | 我们 |
|------|------|------|
| 当前费率 | ✅ | ✅ |
| 标记价/指数价/持仓量/成交额 | 部分 | ✅ |
| 跨交易所套利计算 | ❌ | ✅ |
| **5 交易所 (Binance/Bybit/OKX/Gate/Bitget)** | 最多 3 个 | ✅ |
| **实时套利热力图 Web UI** | ❌ | ✅ |
| **费率异常检测 (突变/闪崩/分歧)** | ❌ | ✅ |
| **费率方向预测 (基于订单簿失衡)** | ❌ | ✅ |
| **容量估算 (能投多少钱)** | ❌ | ✅ |
| **跨品种套利 (BTC-ETH 协整)** | ❌ | ✅ |
| **高级回测 (4 策略 + Sharpe + 回撤)** | ❌ | ✅ |
| **模拟交易 (Paper Trading + 实时 PnL)** | ❌ | ✅ |
| **SQLite 历史数据持久化** | ❌ | ✅ |
| **REST API + WebSocket** | ❌ | ✅ |
| **7x24 监控 + Telegram/Discord 告警** | ❌ | ✅ |
| **风控模块（最大回撤/日交易上限）** | ❌ | ✅ |

---

## 架构：三件套

```
crypto-funding-rate/     → MCP Server (6 工具) + Sentinel v2.0 (7x24 监控)
web-platform/server/     → REST API + WebSocket + 6 大引擎
web-platform/client/     → 实时仪表盘 (热力图 + 回测 + 模拟交易)
```

---

## 实测数据（2026-08-26）

```
[#2] 16:33:14 | 3309 rates | 5 ex | 34 opps | 13 anom | 0 cross | 9255ms

SQLite: 6618 rates persisted, 10 opportunities tracked
API: /api/stats, /api/opportunities, /api/anomalies, /api/backtest all live
Dashboard: served at http://localhost:8771
```

---

## 启动

### 1. MCP Server + Sentinel

```bash
cd crypto-funding-rate
npm install && npm run build
node dist/sentinel.js --config sentinel.json
```

### 2. Web Platform

```bash
cd web-platform/server
npm install && npm run build
npm start
```

打开 http://localhost:8771

---

## REST API

| 端点 | 说明 |
|------|------|
| `GET /api/rates?exchange=Binance` | 实时费率 |
| `GET /api/opportunities?minNet=3` | 套利机会（含容量） |
| `GET /api/anomalies` | 费率异常告警 |
| `GET /api/predictions` | 费率方向预测 |
| `GET /api/crosspair` | 跨品种套利信号 |
| `GET /api/stats` | 系统状态 + DB 统计 |
| `GET /api/paper/stats` | 模拟交易统计 |
| `POST /api/backtest` | 运行策略回测 |
| `POST /api/paper/open` | 开仓模拟交易 |
| `WS /ws` | WebSocket 实时推送 |

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
└── web-platform/
    ├── server/
    │   ├── src/
    │   │   ├── index.ts              # Express + WebSocket 服务器
    │   │   ├── exchanges/
    │   │   │   └── base.ts           # 5 交易所连接器
    │   │   ├── engine/
    │   │   │   ├── anomaly.ts        # 异常检测引擎 (Z-score)
    │   │   │   ├── predictor.ts      # 费率预测引擎
    │   │   │   ├── capacity.ts       # 容量估算器
    │   │   │   ├── crosspair.ts      # 跨品种套利引擎
    │   │   │   ├── backtest.ts       # 回测引擎 (4 策略)
    │   │   │   └── paper.ts          # 模拟交易引擎
    │   │   └── store/
    │   │       └── db.ts             # SQLite 持久化
    │   └── package.json
    └── client/
        └── public/
            └── index.html            # 实时仪表盘
```

---

## License

MIT
