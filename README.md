# Funding Mirror — 加密费率套利监控平台 v3

> **不给你看快照，给你看真相。所有数据来自 Binance/Bybit/OKX/Gate/Bitget 真实 API。**

---

## 和竞品对比（Coinglass / CryptoQuant / Hyblock / 所有同类）

| 功能 | 竞品 | 我们 |
|------|------|------|
| 当前费率 | ✅ | ✅ |
| 跨交易所套利 | ❌ | ✅ |
| **5 交易所 (Binance/Bybit/OKX/Gate/Bitget)** | 最多 3 | ✅ |
| **实时套利热力图** | ❌ | ✅ |
| **费率异常检测 (Z-score 统计)** | ❌ | ✅ |
| **费率方向预测 (订单簿+动量)** | ❌ | ✅ |
| **容量估算 (订单簿深度)** | ❌ | ✅ |
| **跨品种套利 (BTC-ETH 协整)** | ❌ | ✅ |
| **Kelly 准则仓位优化** | ❌ | ✅ |
| **VaR/CVaR/Sortino/Calmar/Omega** | ❌ | ✅ |
| **真实历史数据回测** | ❌ | ✅ |
| **4 策略回测对比** | ❌ | ✅ |
| **实时 equity 曲线图** | ❌ | ✅ |
| **模拟交易 (Paper Trading)** | ❌ | ✅ |
| **Telegram/Discord/Slack 告警** | ❌ | ✅ |
| **SQLite 持久化** | ❌ | ✅ |
| **REST API + WebSocket** | ❌ | ✅ |
| **移动端响应式** | ❌ | ✅ |
| **7x24 Sentinel 监控** | ❌ | ✅ |
| **MCP Server (6 工具)** | ❌ | ✅ |

---

## 架构

```
crypto-funding-rate/     → MCP Server (6 工具) + Sentinel v2.0
web-platform/server/     → REST + WebSocket + 9 大引擎 + SQLite
web-platform/client/    → 实时仪表盘 (8 面板 + 曲线图)
```

## 9 大引擎

1. **Arbitrage Detector** — 跨交易所费率套利
2. **Anomaly Detection** — Z-score 统计异常 (突变/闪崩/分歧/机制变化)
3. **Rate Predictor** — 订单簿失衡 + 动量 + 均值回归
4. **Capacity Estimator** — 订单簿深度 → 最大容量/滑点/捕获率
5. **Cross-Pair Engine** — Pearson 相关性 + Z-score 跨品种套利
6. **Kelly Optimizer** — Kelly 准则仓位优化 (Full/Half/Quarter)
7. **Backtester** — 4 策略回测 + 完整风险指标
8. **Paper Trader** — 实时模拟交易 + 自动止损止盈
9. **Risk Metrics** — VaR, CVaR, Sortino, Calmar, Omega, 偏度, 峰度

---

## 启动

```bash
# 1. Sentinel (7x24 监控)
cd crypto-funding-rate && npm install && npm run build
node dist/sentinel.js --config sentinel.json

# 2. Web Platform
cd web-platform/server && npm install && npm run build
npm start
```

打开 http://localhost:8771

---

## REST API

| 端点 | 说明 |
|------|------|
| `GET /api/rates` | 实时费率 |
| `GET /api/opportunities?minNet=3` | 套利机会 |
| `GET /api/anomalies` | 异常检测 |
| `GET /api/predictions` | 费率预测 |
| `GET /api/crosspair` | 跨品种信号 |
| `GET /api/stats` | 系统状态 + DB |
| `GET /api/paper/stats` | 模拟交易 |
| `POST /api/backtest` | 策略回测 |
| `POST /api/backtest/real` | 真实数据回测 |
| `POST /api/kelly` | Kelly 仓位优化 |
| `GET /api/history/rates/:symbol` | 真实历史费率 |
| `POST /api/alerts/config` | 配置告警 |
| `WS /ws` | 实时推送 |

---

## 实测（2026-08-26）

```
[#1] 16:53:16 | 3309 rates | 5 ex | 33 opps | 10 anom | 0 cross | 14211ms
Kelly: halfKelly=2.5%, recommended=$2,500, growth=2.4%
History: 800 real rates from Binance/Bybit/OKX
DB: persisted 3309 rates per poll
```

---

## License

MIT
