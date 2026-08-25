# Crypto Funding Rate MCP Server

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

竞品给你看一个"机会"就完了，不管你是否真的会赚钱。我们先帮你跑历史回测，用数据告诉你这个策略过去 7 天实际收益多少。

---

## 实测数据（2026-08-25 实时）

```
BTCUSDT:
  Binance 费率: 0.0100%  |  Bybit 费率: 0.0058%
  7天回测净收益: -1.10% (费率相同时手续费在吃本金)
  费率趋势: INCREASING（在上升）

ETHUSDT:
  Binance 费率: 0.0100%  |  Bybit 费率: 0.0074%
  7天回测净收益: -1.12%
  费率趋势: INCREASING
```

回测告诉我们真相：**当两个交易所费率接近时，0.16% 的手续费会吃掉你。** 只有当其中一个交易所费率显著更高时才值得做。这正是这个工具的价值 — 帮你过滤假机会。

---

## 6 个工具

| 工具 | 干什么 |
|------|--------|
| `get_rates` | 实时费率 + 价格 + 持仓量 + 24h成交额 |
| `find_arbitrage` | 套利信号 + 风险评分 + 过滤 |
| `analyze_symbol` | 单币种三所对比深度分析 |
| `calculate_position` | 输入金额 → 输出实际下单参数、成本、收益、强平缓冲 |
| `backtest_strategy` | 历史回测：实际收益、最大回撤、夏普、胜率、置信区间 |
| `get_statistics` | 费率统计：均值、波动率、动量(上升/下降) |

---

## Sentinel — 24/7 套利监控守护进程

除了 MCP 工具，还有一个独立运行的 Sentinel 守护进程，持续监控三所费率差，发现真正有利可图的机会时立即告警。

```bash
# 编译
cd crypto-funding-rate && npm install && npm run build

# 运行（默认每60秒轮询，spread>0.1% 告警）
node dist/sentinel.js

# 自定义参数
node dist/sentinel.js --threshold 0.001 --interval 60 --min-net 3

# 带 Discord/Slack 通知
node dist/sentinel.js --webhook https://discord.com/api/webhooks/xxx
```

**实测输出（2026-08-25 20:58）：**
```
[#1] 20:58:05 | Binance/Bybit/OKX | 1642 rates | 14820ms | ⚡ 4 个机会

🚨 发现 4 个新套利机会:
  🆕 NEW XRPUSDT: Spread 0.0128% → 净年化 13.81% | 做多Binance + 做空Bybit
  🆕 NEW AVAXUSDT: Spread 0.0053% → 净年化 5.56% | 做多Binance + 做空Bybit
  🆕 NEW DOGEUSDT: Spread 0.0043% → 净年化 4.47% | 做多Binance + 做空Bybit
  🆕 NEW BTCUSDT: Spread 0.0038% → 净年化 3.97% | 做多Binance + 做空Bybit
```

Sentinel 智能去重：同一个机会不会重复骚扰你，只有当 spread 扩大 50% 以上或 1 小时过去后才会再次提醒。

---

## 使用 MCP 工具

```bash
cd crypto-funding-rate
npm install
npm run build
```

在 Claude Code / Cursor / 任何 MCP 客户端中配置：
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

## 关于之前的内容

这个仓库之前有 360 个假插件（2880 个工具），全部基于 `mulberry32` 随机数生成器，产出虚构数据。
2026-08-24 已全部清除，改为做真正有用的事。

---

## License

MIT
