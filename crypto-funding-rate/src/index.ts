/**
 * Crypto Funding Rate MCP Server v2
 *
 * 真实可靠的跨交易所资金费率套利分析工具。
 *
 * 数据源：
 *   Binance: /fapi/v1/premiumIndex  → 费率、标记价、指数价、下次结算时间
 *   Bybit:   /v5/market/tickers     → 费率、标记价、指数价、OI、成交量（一个接口全拿）
 *   OKX:     /api/v5/public/funding-rate + /api/v5/market/ticker → 费率 + 价格分开拿
 *
 * 套利计算：
 *   每 8 小时一次 = 每年 1095 次
 *   净收益 = (spread × 1095) - 双边手续费(0.16%) - 安全边际(0.05%)
 *
 * 风险评分：
 *   - 流动性：基于持仓量和成交额
 *   - 费率边界：OKX 有 ±0.375% 限制，极端行情会被卡
 *   - 费率方向稳定性：当前费率是否在合理范围
 *
 * 没有随机数、没有模拟数据、没有免责声明式的废话。
 * 所有数字来自真实 API，所有计算可复现。
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

// ==================== TYPES ====================

interface ExchangeRate {
  exchange: string
  symbol: string
  fundingRate: number        // 当前/预测费率（小数）
  fundingRatePct: number     // 百分比形式
  annualizedPct: number      // × 1095 后的年化
  markPrice: number          // 标记价格（USD）
  indexPrice: number         // 指数价格（USD）
  basis: number              // (mark - index) / index
  nextFundingTime: string    // ISO
  openInterest?: number      // 持仓量
  openInterestValue?: number // 持仓价值（USD）
  turnover24h?: number       // 24h 成交额
  maxFundingRate?: number    // 费率上限
  minFundingRate?: number    // 费率下限
  fetchedAt: number
}

interface ArbitrageSignal {
  symbol: string
  direction: 'RECEIVE' | 'PAY'
  longExchange: string       // 做多的交易所（收费率）
  shortExchange: string      // 做空的交易所（付费率）
  spreadPct: number          // 单次 spread
  annualizedPct: number      // 年化 spread
  estimatedNetPct: number    // 扣除费用后净收益
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  riskNotes: string[]
  btcPrice: number           // 用于计算合约数量
}

// ==================== REAL API CALLS ====================

async function fetchJSON(url: string, timeoutMs = 15000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'crypto-funding-rate-mcp/2.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
    const json = await res.json()
    if (json.code && json.code !== '0' && json.code !== 0) {
      throw new Error(`API error: ${json.msg || json.retMsg || json.code}`)
    }
    return json
  } finally {
    clearTimeout(timer)
  }
}

async function fetchBinanceRates(symbols: string[]): Promise<ExchangeRate[]> {
  const url = 'https://fapi.binance.com/fapi/v1/premiumIndex'
  const data = await fetchJSON(url)
  const now = Date.now()

  return data
    .filter((item: any) => symbols.includes(item.symbol))
    .map((item: any) => {
      const mark = parseFloat(item.markPrice)
      const idx = parseFloat(item.indexPrice)
      const rate = parseFloat(item.lastFundingRate)
      return {
        exchange: 'Binance',
        symbol: item.symbol,
        fundingRate: rate,
        fundingRatePct: rate * 100,
        annualizedPct: rate * 100 * 1095,
        markPrice: mark,
        indexPrice: idx,
        basis: ((mark - idx) / idx) * 100,
        nextFundingTime: new Date(item.nextFundingTime).toISOString(),
        fetchedAt: now,
      }
    })
}

async function fetchBybitRates(symbols: string[]): Promise<ExchangeRate[]> {
  const results: ExchangeRate[] = []
  const now = Date.now()

  for (const symbol of symbols) {
    try {
      const url = `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`
      const json = await fetchJSON(url)
      const item = json.result?.list?.[0]
      if (!item) continue

      const mark = parseFloat(item.markPrice || '0')
      const idx = parseFloat(item.indexPrice || '0')
      const rate = parseFloat(item.fundingRate || '0')

      results.push({
        exchange: 'Bybit',
        symbol,
        fundingRate: rate,
        fundingRatePct: rate * 100,
        annualizedPct: rate * 100 * 1095,
        markPrice: mark,
        indexPrice: idx,
        basis: mark > 0 && idx > 0 ? ((mark - idx) / idx) * 100 : 0,
        nextFundingTime: item.nextFundingTime ? new Date(parseInt(item.nextFundingTime)).toISOString() : new Date(now + 8 * 3600000).toISOString(),
        openInterest: item.openInterest ? parseFloat(item.openInterest) : undefined,
        openInterestValue: item.openInterestValue ? parseFloat(item.openInterestValue) : undefined,
        turnover24h: item.turnover24h ? parseFloat(item.turnover24h) : undefined,
        fetchedAt: now,
      })
    } catch {
      // 跳过不可用的交易对
    }
  }
  return results
}

async function fetchOKXRates(symbols: string[]): Promise<ExchangeRate[]> {
  const results: ExchangeRate[] = []
  const now = Date.now()

  for (const symbol of symbols) {
    const instId = symbol.replace('USDT', '-USDT-SWAP')
    try {
      // OKX 需要两个接口：一个拿费率，一个拿价格
      const [rateRes, tickerRes] = await Promise.all([
        fetchJSON(`https://www.okx.com/api/v5/public/funding-rate?instId=${instId}`).catch(() => null),
        fetchJSON(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`).catch(() => null),
      ])

      const rateItem = rateRes?.data?.[0]
      const tickerItem = tickerRes?.data?.[0]
      if (!rateItem) continue

      const mark = tickerItem ? parseFloat(tickerItem.last || '0') : 0
      const idx = 0 // OKX 不在此接口提供指数价格
      const rate = parseFloat(rateItem.fundingRate || '0')

      results.push({
        exchange: 'OKX',
        symbol,
        fundingRate: rate,
        fundingRatePct: rate * 100,
        annualizedPct: rate * 100 * 1095,
        markPrice: mark,
        indexPrice: idx,
        basis: 0,
        nextFundingTime: rateItem.nextFundingTime ? new Date(parseInt(rateItem.nextFundingTime)).toISOString() : new Date(now + 8 * 3600000).toISOString(),
        maxFundingRate: rateItem.maxFundingRate ? parseFloat(rateItem.maxFundingRate) : undefined,
        minFundingRate: rateItem.minFundingRate ? parseFloat(rateItem.minFundingRate) : undefined,
        fetchedAt: now,
      })
    } catch {
      // 跳过不可用的交易对
    }
  }
  return results
}

// ==================== ARBITRAGE ENGINE ====================

const TRADE_FEE_PER_LEG = 0.0004  // 0.04% per trade (taker)
const ROUND_TRIP_COST = TRADE_FEE_PER_LEG * 4 // 开多 + 开空 + 平多 + 平空
const SAFETY_MARGIN = 0.05 // 0.05% safety buffer for slippage
const FUNDINGS_PER_YEAR = 1095 // 365 days × 3 times/day

function calculateArbitrage(rates: ExchangeRate[]): ArbitrageSignal[] {
  const bySymbol = new Map<string, ExchangeRate[]>()
  for (const r of rates) {
    if (r.markPrice <= 0) continue // 跳过无效价格
    if (!bySymbol.has(r.symbol)) bySymbol.set(r.symbol, [])
    bySymbol.get(r.symbol)!.push(r)
  }

  const signals: ArbitrageSignal[] = []

  for (const [symbol, symbolRates] of bySymbol) {
    if (symbolRates.length < 2) continue

    for (let i = 0; i < symbolRates.length; i++) {
      for (let j = i + 1; j < symbolRates.length; j++) {
        const a = symbolRates[i]
        const b = symbolRates[j]

        // 在 A 收费率、在 B 付费率
        const spread = a.fundingRate - b.fundingRate
        if (spread <= 0) continue

        const annualizedPct = spread * 100 * FUNDINGS_PER_YEAR
        const netPct = annualizedPct - (ROUND_TRIP_COST * 100) - SAFETY_MARGIN

        // 生成风险提示
        const riskNotes: string[] = []

        // OKX 费率边界检查
        for (const r of [a, b]) {
          if (r.maxFundingRate && Math.abs(r.fundingRate) > r.maxFundingRate * 0.8) {
            riskNotes.push(`${r.exchange} 费率接近边界(${r.fundingRate > 0 ? '+' : ''}${(r.fundingRate * 100).toFixed(4)}%/±${(r.maxFundingRate * 100).toFixed(2)}%)下一步可能跳变`)
          }
        }

        // 高费率风险
        if (Math.abs(a.fundingRate) > 0.001 || Math.abs(b.fundingRate) > 0.001) {
          riskNotes.push('费率>0.1%，不可持续，警惕费率翻转')
        }

        // 流动性检查
        for (const r of [a, b]) {
          if (r.turnover24h && r.turnover24h < 100000000) {
            riskNotes.push(`${r.exchange} 24h成交额$${((r.turnover24h / 1e6).toFixed(0))}M，流动性一般`)
          }
        }

        // 基差风险
        const basisRisk = Math.abs(a.basis) > 0.5 || Math.abs(b.basis) > 0.5
        if (basisRisk) {
          riskNotes.push('标记价偏离指数价>0.5%，注意收敛风险')
        }

        const btcPrice = (a.markPrice > 0 ? a.markPrice : b.markPrice) || 80000

        signals.push({
          symbol,
          direction: 'RECEIVE',
          longExchange: a.exchange,
          shortExchange: b.exchange,
          spreadPct: spread * 100,
          annualizedPct,
          estimatedNetPct: netPct,
          confidence: netPct > 15 && riskNotes.length === 0 ? 'HIGH' : netPct > 5 ? 'MEDIUM' : 'LOW',
          riskNotes,
          btcPrice,
        })
      }
    }
  }

  return signals.sort((a, b) => b.estimatedNetPct - a.estimatedNetPct)
}

// ==================== RISK SCORING ====================

function assessExchangeRisk(rate: ExchangeRate): { score: number; notes: string[] } {
  let score = 100 // 满分 100
  const notes: string[] = []

  // 1. 费率绝对值越大越危险
  const absRate = Math.abs(rate.fundingRate)
  if (absRate > 0.001) { score -= 30; notes.push('费率>0.1% 极高') }
  else if (absRate > 0.0005) { score -= 15; notes.push('费率>0.05% 偏高') }

  // 2. 接近费率边界
  if (rate.maxFundingRate && absRate > rate.maxFundingRate * 0.7) {
    score -= 20; notes.push('接近费率边界')
  }

  // 3. 流动性折扣
  if (rate.turnover24h && rate.turnover24h < 50000000) {
    score -= 10; notes.push('24h成交额偏低')
  }

  // 4. 持仓量折扣
  if (rate.openInterestValue && rate.openInterestValue < 500000000) {
    score -= 10; notes.push('持仓价值偏低')
  }

  return { score: Math.max(0, score), notes }
}

// ==================== MCP SERVER ====================

const server = new Server(
  { name: 'crypto-funding-rate', version: '2.0.0' },
  { capabilities: { tools: {} } }
)

const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'MATICUSDT', 'DOTUSDT']

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_rates',
      description: '获取 Binance、Bybit、OKX 三个交易所的真实资金费率、标记价、持仓量、成交量。不掺任何随机数。',
      inputSchema: {
        type: 'object',
        properties: {
          symbols: {
            type: 'array',
            items: { type: 'string' },
            description: '交易对列表，如 ["BTCUSDT","ETHUSDT"]。默认热门币种前10。',
          },
        },
      },
    },
    {
      name: 'find_arbitrage',
      description: '发现跨交易所套利机会。计算净收益（扣双边手续费0.16% + 安全边际0.05%）。附带风险评分。',
      inputSchema: {
        type: 'object',
        properties: {
          symbols: {
            type: 'array',
            items: { type: 'string' },
            description: '交易对列表。默认热门币种。',
          },
          min_net_pct: {
            type: 'number',
            description: '最低净年化收益门槛 %（默认 0，不设限）。',
          },
          risk_threshold: {
            type: 'number',
            description: '最低风险评分 0-100（默认 0，不设限）。',
          },
        },
      },
    },
    {
      name: 'analyze_symbol',
      description: '单币种深度分析：三个交易所的费率、基差、流动性、风险评分对比。',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: '交易对，如 "BTCUSDT"' },
        },
        required: ['symbol'],
      },
    },
    {
      name: 'calculate_position',
      description: '根据套利信号计算可执行的头寸大小、成本、收益。输入金额和方向，输出实际下单参数。',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string' },
          notional_usd: { type: 'number', description: '名义价值（USD），如 10000' },
          long_exchange: { type: 'string' },
          short_exchange: { type: 'string' },
        },
        required: ['symbol', 'notional_usd', 'long_exchange', 'short_exchange'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const symbols: string[] = (args as any)?.symbols || DEFAULT_SYMBOLS
  const min = Date.now()

  try {
    switch (name) {
      case 'get_rates': {
        const results = await Promise.allSettled([
          fetchBinanceRates(symbols),
          fetchBybitRates(symbols),
          fetchOKXRates(symbols),
        ])

        const all: ExchangeRate[] = []
        const errors: Record<string, string> = {}

        if (results[0].status === 'fulfilled') all.push(...results[0].value)
        else errors.binance = String(results[0].reason?.message || 'failed')

        if (results[1].status === 'fulfilled') all.push(...results[1].value)
        else errors.bybit = String(results[1].reason?.message || 'failed')

        if (results[2].status === 'fulfilled') all.push(...results[2].value)
        else errors.okx = String(results[2].reason?.message || 'failed')

        if (all.length === 0) {
          return {
            content: [{ type: 'text', text: JSON.stringify({ error: 'ALL_EXCHANGES_FAILED', errors, timestamp: new Date().toISOString() }, null, 2) }],
            isError: true,
          }
        }

        const elapsed = Date.now() - min
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              timestamp: new Date().toISOString(),
              fetchTimeMs: elapsed,
              totalRates: all.length,
              sources: {
                binance: all.filter(r => r.exchange === 'Binance').length || null,
                bybit: all.filter(r => r.exchange === 'Bybit').length || null,
                okx: all.filter(r => r.exchange === 'OKX').length || null,
              },
              errors: Object.keys(errors).length > 0 ? errors : undefined,
              rates: all.sort((a, b) => a.symbol.localeCompare(b.symbol) || a.exchange.localeCompare(b.exchange)),
            }, null, 2),
          }],
        }
      }

      case 'find_arbitrage': {
        const minNetPct = (args as any)?.min_net_pct ?? 0
        const riskThreshold = (args as any)?.risk_threshold ?? 0

        const results = await Promise.allSettled([
          fetchBinanceRates(symbols),
          fetchBybitRates(symbols),
          fetchOKXRates(symbols),
        ])

        const all: ExchangeRate[] = []
        if (results[0].status === 'fulfilled') all.push(...results[0].value)
        if (results[1].status === 'fulfilled') all.push(...results[1].value)
        if (results[2].status === 'fulfilled') all.push(...results[2].value)

        if (all.length < 2) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: 'INSUFFICIENT_DATA', message: '需要至少两个交易所的数据', ratesFetched: all.length }) }], isError: true }
        }

        const signals = calculateArbitrage(all)
        const filtered = signals.filter(s => s.estimatedNetPct >= minNetPct)

        // 对每个信号做风险评分
        const enriched = filtered.map(signal => {
          const longRate = all.find(r => r.exchange === signal.longExchange && r.symbol === signal.symbol)
          const shortRate = all.find(r => r.exchange === signal.shortExchange && r.symbol === signal.symbol)
          const longRisk = longRate ? assessExchangeRisk(longRate) : { score: 0, notes: [] }
          const shortRisk = shortRate ? assessExchangeRisk(shortRate) : { score: 0, notes: [] }
          const avgRisk = Math.round((longRisk.score + shortRisk.score) / 2)

          return {
            ...signal,
            riskScore: avgRisk,
            riskNotes: [...signal.riskNotes, ...longRisk.notes, ...shortRisk.notes],
            longExchangeRisk: longRisk.score,
            shortExchangeRisk: shortRisk.score,
          }
        }).filter(s => s.riskScore >= riskThreshold)

        const elapsed = Date.now() - min
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              timestamp: new Date().toISOString(),
              fetchTimeMs: elapsed,
              totalRates: all.length,
              signalsFound: enriched.length,
              parameters: { minNetPct, riskThreshold },
              signals: enriched.slice(0, 15),
              methodology: {
                fundingsPerYear: FUNDINGS_PER_YEAR,
                roundTripFeePct: ROUND_TRIP_COST * 100,
                safetyMarginPct: SAFETY_MARGIN,
                formula: 'net = (spread × 1095) - 0.16% - 0.05%',
              },
            }, null, 2),
          }],
        }
      }

      case 'analyze_symbol': {
        const symbol = ((args as any)?.symbol as string)?.toUpperCase()
        if (!symbol) return { content: [{ type: 'text', text: 'Error: symbol required' }], isError: true }

        const results = await Promise.allSettled([
          fetchBinanceRates([symbol]),
          fetchBybitRates([symbol]),
          fetchOKXRates([symbol]),
        ])

        const rates: ExchangeRate[] = []
        if (results[0].status === 'fulfilled') rates.push(...results[0].value)
        if (results[1].status === 'fulfilled') rates.push(...results[1].value)
        if (results[2].status === 'fulfilled') rates.push(...results[2].value)

        if (rates.length === 0) {
          return { content: [{ type: 'text', text: `No data for ${symbol}` }], isError: true }
        }

        const signals = calculateArbitrage(rates)
        const riskAssessments = rates.map(r => ({
          exchange: r.exchange,
          ...assessExchangeRisk(r),
        }))

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              symbol,
              timestamp: new Date().toISOString(),
              rates,
              bestSignal: signals[0] || null,
              riskAssessment: riskAssessments,
            }, null, 2),
          }],
        }
      }

      case 'calculate_position': {
        const symbol = ((args as any)?.symbol as string)?.toUpperCase()
        const notional = (args as any)?.notional_usd as number
        const longEx = (args as any)?.long_exchange as string
        const shortEx = (args as any)?.short_exchange as string

        if (!symbol || !notional || !longEx || !shortEx) {
          return { content: [{ type: 'text', text: 'Error: symbol, notional_usd, long_exchange, short_exchange all required' }], isError: true }
        }

        const rates = await Promise.allSettled([
          fetchBinanceRates([symbol]),
          fetchBybitRates([symbol]),
          fetchOKXRates([symbol]),
        ])

        const all: ExchangeRate[] = []
        if (rates[0].status === 'fulfilled') all.push(...rates[0].value)
        if (rates[1].status === 'fulfilled') all.push(...rates[1].value)
        if (rates[2].status === 'fulfilled') all.push(...rates[2].value)

        const longRate = all.find(r => r.exchange === longEx && r.symbol === symbol)
        const shortRate = all.find(r => r.exchange === shortEx && r.symbol === symbol)

        if (!longRate || !shortRate) {
          return { content: [{ type: 'text', text: `Cannot find rates for ${symbol} on ${longEx}/${shortEx}` }], isError: true }
        }

        const spread = longRate.fundingRate - shortRate.fundingRate
        if (spread <= 0) {
          return { content: [{ type: 'text', text: `No arbitrage: ${longEx} rate (${(longRate.fundingRatePct).toFixed(4)}%) <= ${shortEx} rate (${(shortRate.fundingRatePct).toFixed(4)}%)` }], isError: true }
        }

        const price = longRate.markPrice > 0 ? longRate.markPrice : shortRate.markPrice
        const contracts = notional / price
        const feeCost = notional * ROUND_TRIP_COST
        const perFunding = notional * spread
        const annualGross = perFunding * FUNDINGS_PER_YEAR
        const annualNet = annualGross - feeCost - (notional * SAFETY_MARGIN / 100)

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              symbol,
              notionalUsd: notional,
              direction: `Long ${longEx} + Short ${shortEx}`,
              entry: {
                long: { exchange: longEx, price: longRate.markPrice, size: `${contracts.toFixed(6)} ${symbol.replace('USDT', '')}` },
                short: { exchange: shortEx, price: shortRate.markPrice, size: `${contracts.toFixed(6)} ${symbol.replace('USDT', '')}` },
              },
              funding: {
                longRate: `${(longRate.fundingRatePct).toFixed(4)}%`,
                shortRate: `${(shortRate.fundingRatePct).toFixed(4)}%`,
                spread: `${(spread * 100).toFixed(4)}%`,
                perFundingUsd: `$${perFunding.toFixed(2)}`,
                nextFunding: longRate.nextFundingTime,
              },
              costs: {
                roundTripFee: `$${feeCost.toFixed(2)}`,
                safetyMargin: `$${(notional * SAFETY_MARGIN / 100).toFixed(2)}`,
              },
              returns: {
                annualGross: `$${annualGross.toFixed(2)}`,
                annualNet: `$${annualNet.toFixed(2)}`,
                annualNetPct: `${((annualNet / notional) * 100).toFixed(2)}%`,
                monthlyNet: `$${(annualNet / 12).toFixed(2)}`,
                dailyNet: `$${(annualNet / 365).toFixed(2)}`,
              },
            }, null, 2),
          }],
        }
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true }
    }
  } catch (err: any) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'UNEXPECTED', message: err.message, stack: err.stack?.split('\n').slice(0, 3) }) }],
      isError: true,
    }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[crypto-funding-rate v2] Running. Real APIs: Binance + Bybit + OKX.')
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
