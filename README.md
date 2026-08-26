# Funding Mirror — 加密费率套利监控平台 v3.5

> **不给你看快照，给你看真相。所有数据来自 Binance/Bybit/OKX/Gate/Bitget 真实 API。**

---

## 和竞品对比（所有同类）

| 功能 | 竞品 | 我们 |
|------|------|------|
| 当前费率 | ✅ | ✅ |
| 跨交易所套利 | ❌ | ✅ |
| **5 交易所** | 最多 3 | ✅ |
| **实时套利热力图** | ❌ | ✅ |
| **费率异常检测 (Z-score)** | ❌ | ✅ |
| **费率方向预测** | ❌ | ✅ |
| **容量估算** | ❌ | ✅ |
| **跨品种套利 (协整)** | ❌ | ✅ |
| **Kelly 准则仓位优化** | ❌ | ✅ |
| **VaR/CVaR/Sortino/Calmar/Omega** | ❌ | ✅ |
| **真实历史数据回测** | ❌ | ✅ |
| **4 策略回测对比** | ❌ | ✅ |
| **实时 equity 曲线图** | ❌ | ✅ |
| **模拟交易 (Paper Trading)** | ❌ | ✅ |
| **Telegram/Discord/Slack 告警** | ❌ | ✅ |
| **SQLite 持久化** | ❌ | ✅ |
| **REST API + WebSocket** | ❌ | ✅ |
| **JWT 认证 + API Key 管理** | ❌ | ✅ |
| **真实交易执行 (Binance/Bybit)** | ❌ | ✅ |
| **Docker 部署** | ❌ | ✅ |
| **移动端响应式** | ❌ | ✅ |
| **7x24 Sentinel 监控** | ❌ | ✅ |
| **MCP Server (6 工具)** | ❌ | ✅ |

---

## 架构

```
crypto-funding-rate/     → MCP Server (6 工具) + Sentinel v2.0
web-platform/server/     → REST + WebSocket + 11 引擎 + SQLite + Auth
web-platform/client/    → 实时仪表盘 (8 面板 + 曲线图 + 移动端)
docker-compose.yml       → 一键部署
```

## 11 大引擎

1. **Arbitrage Detector** — 5 交易所费率套利
2. **Anomaly Detection** — Z-score 统计异常
3. **Rate Predictor** — 订单簿失衡 + 动量 + 均值回归
4. **Capacity Estimator** — 订单簿深度 → 容量/滑点
5. **Cross-Pair Engine** — Pearson 协整跨品种套利
6. **Kelly Optimizer** — Kelly 准则仓位优化
7. **Backtester** — 4 策略 + 真实数据 + 风险指标
8. **Paper Trader** — 实时模拟交易
9. **Risk Metrics** — VaR, CVaR, Sortino, Calmar, Omega
10. **Trade Executor** — 真实 Binance/Bybit 交易
11. **Alert System** — Telegram/Discord/Slack 告警

---

## 快速启动

### Docker (推荐)

```bash
docker-compose up -d
```

打开 http://localhost:8771

### 手动

```bash
# Sentinel
cd crypto-funding-rate && npm install && npm run build
node dist/sentinel.js

# Web Platform
cd web-platform/server && npm install && npm run build
npm start
```

---

## REST API (25+ 端点)

```
GET  /api/rates | /api/opportunities | /api/anomalies | /api/predictions
GET  /api/crosspair | /api/stats | /api/paper/stats | /api/backtest/strategies
GET  /api/trade/positions | /api/trade/orders
GET  /api/history/rates/:symbol | /api/history/opportunities | /api/history/anomalies
POST /api/backtest | /api/backtest/real | /api/kelly | /api/paper/open
POST /api/trade/credentials | /api/trade/order | /api/trade/arbitrage/open | /api/trade/arbitrage/close
POST /api/alerts/config | /api/alerts/test
POST/GET/DELETE /api/auth/keys
WS   /ws
```

### 认证

```bash
# 默认管理员密钥 (环境变量 ADMIN_API_KEY)
curl -H "Authorization: Bearer admin-key-change-me" http://localhost:8771/api/stats

# 创建新 API Key
curl -X POST -H "Authorization: Bearer admin-key-change-me" \
  -H "Content-Type: application/json" \
  -d '{"name":"trader","permissions":["read","trade"]}' \
  http://localhost:8771/api/auth/keys
```

### 真实交易

```bash
# 1. 设置交易所 API 密钥
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -d '{"exchange":"Binance","apiKey":"xxx","secretKey":"yyy","testnet":true}' \
  http://localhost:8771/api/trade/credentials

# 2. 下单
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -d '{"exchange":"Binance","symbol":"BTCUSDT","side":"BUY","quantity":0.001,"type":"MARKET"}' \
  http://localhost:8771/api/trade/order

# 3. 一键套利开仓
curl -X POST -H "Authorization: Bearer $API_KEY" \
  -d '{"symbol":"BTCUSDT","longEx":"Binance","shortEx":"Bybit","quantityUsdt":1000,"longPrice":65000,"shortPrice":65000}' \
  http://localhost:8771/api/trade/arbitrage/open
```

---

## 实测（2026-08-26）

```
[#1] 17:11:21 | 3309 rates | 5 ex | 27 opps | 9 anom | 14985ms
Kelly: halfKelly=2.5%, size=$2,500, growth=2.4%
History: 800 real rates from Binance/Bybit/OKX
Trade: dry-run order executed successfully
Auth: JWT + API key management working
```

---

## License

MIT
