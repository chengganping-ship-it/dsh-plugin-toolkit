# 工具清单

## 活跃工具

### crypto-funding-rate — 加密货币资金费率套利分析

**真实数据源：** Binance Futures / OKX / Bybit 公开 API

**功能：**
- `get_funding_rates` — 实时获取多个交易所的资金费率
- `find_arbitrage` — 跨交易所套利机会检测（扣除手续费后净收益）
- `analyze_symbol` — 单一币种的深度分析

**数据格式：** 真实 API 返回的 JSON，不是随机生成的数字。

**实测验证：**
```
BTCUSDT:
  Binance: 0.01% (mark $80,454.98)
  OKX:     0.01%
  Bybit:   0.0034%
  → 套利: Long Binance + Short Bybit = ~7.06% 净年化

ETHUSDT:
  Binance: 0.01% (mark $2,498.89)
  OKX:     0.01%
  Bybit:   0.0062%
  → 套利: Long Binance + Short Bybit = ~3.99% 净年化
```

---

## 已清除

2026-08-24 清除了 360 个假插件（2880 个假工具），全部基于 mulberry32 随机数生成器，不产出任何真实价值。共删除 1779 个文件、595,665 行代码。
