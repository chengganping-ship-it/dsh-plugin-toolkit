# DSH Plugin Toolkit

> **真实有用的 AI 工具集 — 每个工具都调用真实 API，产出真实可用的数据。**

---

## 这个仓库之前有什么

之前这个仓库里有 360 个"插件"，每个插件 8 个工具，共 2880 个工具。

**它们全是假的。**

每个工具的核心都是 `mulberry32` 随机数生成器 — 输入一个字符串，输出看起来专业但完全虚构的"分析报告"。没有调用任何真实 API，没有做任何真实计算，不解决任何真实问题。

2026-08-24，全部清除（1779 个文件，595,665 行假代码）。

---

## 这个仓库现在有什么

**少而精，每个工具必须：**

1. 调用真实 API 或执行真实算法
2. 产出可验证、可使用的结果
3. 解决一个真实存在的需求

**不做：**
- 随机数生成器伪装的分析工具
- 没有真实数据源的"模拟器"
- 华而不实的免责声明

---

## 工具列表

### crypto-funding-rate — 加密货币资金费率套利分析

**状态：** 已完成，真实运行中

**数据源：** [Binance Futures API](https://fapi.binance.com/fapi/v1/premiumIndex) | [OKX API](https://www.okx.com/api/v5/public/funding-rate) | [Bybit API](https://api.bybit.com/v5/market/funding/history)

**功能：**
- `get_funding_rates` — 实时获取多个交易所的资金费率
- `find_arbitrage` — 跨交易所套利机会检测（扣除手续费后净收益）
- `analyze_symbol` — 单一币种的深度分析

**使用方式：**

```bash
cd crypto-funding-rate
npm install
npm run build
```

然后在任何 MCP 客户端中配置：
```json
{
  "mcpServers": {
    "crypto-funding-rate": {
      "command": "node",
      "args": ["/path/to/crypto-funding-rate/dist/index.js"]
    }
  }
}
```

**实测输出示例：**
- BTCUSDT: Binance 费率 0.01%, Bybit 费率 0.0034%, 净年化 ~7.06%
- ETHUSDT: Binance 费率 0.01%, Bybit 费率 0.0062%, 净年化 ~3.99%

*数据为实时获取，每 8 小时更新一次。净收益已扣除往返手续费 0.16% 和安全边际。*

---

## 为什么这样做

360 个假插件不如 1 个真工具。

一个能真正帮你发现套利机会的工具，比 2880 个随机数生成器有价值一万倍。

---

## License

MIT
