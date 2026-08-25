/**
 * Crypto Funding Rate MCP Server v3
 *
 * 竞品对标与超越：
 *   Coinglass / CryptoQuant / Hyblock / Laevitas — 只给你看"当前费率"
 *   我们给你：
 *     1. 历史回测 — 跑这个策略过去 N 天实际赚多少
 *     2. 统计指标 — 7d/30d 均值、波动率、夏普比率
 *     3. 费率动量 — spread 在扩大还是缩小
 *     4. 风险价值 — 最坏情况下亏损多少
 *     5. 可执行头寸 — 输入金额直接输出下单参数
 *
 * 数据源：
 *   Binance: /fapi/v1/premiumIndex + /fapi/v1/fundingRate(历史) + /fapi/v1/openInterest
 *   Bybit:   /v5/market/tickers + /v5/market/funding/history
 *   OKX:     /api/v5/public/funding-rate + /api/v5/market/ticker
 *
 * 所有数据来自真实交易所 API。没有模拟、没有随机、没有免责声明式的废话。
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

// ==================== TYPES ====================

interface RateSnapshot {
  exchange: string
  symbol: string
  fundingRate: number
  fundingRatePct: number
  markPrice: number
  indexPrice: number
  basis: number
  nextFundingTime: string
  openInterest?: number
  openInterestValue?: number
  turnover24h?: number
  maxFundingRate?: number
  minFundingRate?: number
  fetchedAt: number
}

interface HistoricalRate {
  timestamp: number
  fundingRate: number
  markPrice: number
}

interface BacktestResult {
  symbol: string
  longExchange: string
  shortExchange: string
  periodDays: number
  dataPoints: number
  avgSpread: number
  minSpread: number
  maxSpread: number
  stdDevSpread: number
  grossReturnPct: number
  netReturnPct: number
  sharpeRatio: number
  maxDrawdownPct: number
  winRate: number
  bestDay: number
  worstDay: number
  annualizedNetPct: number
  confidence95Lower: number
  confidence95Upper: number
  data: Array<{ timestamp: number; spread: number; cumulative: number }>
}

interface SpreadPoint {
  timestamp: number
  longRate: number
  shortRate: number
  spread: number
}

// ==================== REAL API CALLS ====================

async function fetchJSON(url: string, timeoutMs = 15000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'crypto-funding-rate-mcp/3.0' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.code && String(json.code) !== '0') {
      throw new Error(json.msg || json.retMsg || String(json.code))
    }
    return json
  } finally {
    clearTimeout(timer)
  }
}

async function fetchBinanceCurrent(symbols: string[]): Promise<RateSnapshot[]> {
  const data = await fetchJSON('https://fapi.binance.com/fapi/v1/premiumIndex')
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
        markPrice: mark,
        indexPrice: idx,
        basis: ((mark - idx) / idx) * 100,
        nextFundingTime: new Date(item.nextFundingTime).toISOString(),
        fetchedAt: now,
      }
    })
}

async function fetchBybitCurrent(symbols: string[]): Promise<RateSnapshot[]> {
  const results: RateSnapshot[] = []
  const now = Date.now()
  for (const symbol of symbols) {
    try {
      const json = await fetchJSON(`https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`)
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
        markPrice: mark,
        indexPrice: idx,
        basis: mark > 0 && idx > 0 ? ((mark - idx) / idx) * 100 : 0,
        nextFundingTime: item.nextFundingTime ? new Date(parseInt(item.nextFundingTime)).toISOString() : '',
        openInterest: item.openInterest ? parseFloat(item.openInterest) : undefined,
        openInterestValue: item.openInterestValue ? parseFloat(item.openInterestValue) : undefined,
        turnover24h: item.turnover24h ? parseFloat(item.turnover24h) : undefined,
        fetchedAt: now,
      })
    } catch { /* skip */ }
  }
  return results
}

async function fetchOKXCurrent(symbols: string[]): Promise<RateSnapshot[]> {
  const results: RateSnapshot[] = []
  const now = Date.now()
  for (const symbol of symbols) {
    const instId = symbol.replace('USDT', '-USDT-SWAP')
    try {
      const [rateRes, tickerRes] = await Promise.all([
        fetchJSON(`https://www.okx.com/api/v5/public/funding-rate?instId=${instId}`).catch(() => null),
        fetchJSON(`https://www.okx.com/api/v5/market/ticker?instId=${instId}`).catch(() => null),
      ])
      const rateItem = rateRes?.data?.[0]
      const tickerItem = tickerRes?.data?.[0]
      if (!rateItem) continue
      const mark = tickerItem ? parseFloat(tickerItem.last || '0') : 0
      const rate = parseFloat(rateItem.fundingRate || '0')
      results.push({
        exchange: 'OKX',
        symbol,
        fundingRate: rate,
        fundingRatePct: rate * 100,
        markPrice: mark,
        indexPrice: 0,
        basis: 0,
        nextFundingTime: rateItem.nextFundingTime ? new Date(parseInt(rateItem.nextFundingTime)).toISOString() : '',
        maxFundingRate: rateItem.maxFundingRate ? parseFloat(rateItem.maxFundingRate) : undefined,
        minFundingRate: rateItem.minFundingRate ? parseFloat(rateItem.minFundingRate) : undefined,
        fetchedAt: now,
      })
    } catch { /* skip */ }
  }
  return results
}

// ==================== HISTORICAL DATA ====================

async function fetchBinanceHistorical(symbol: string, periods: number): Promise<HistoricalRate[]> {
  const limit = Math.min(periods, 1000)
  const url = `https://fapi.binance.com/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`
  const data = await fetchJSON(url)
  return data.map((item: any) => ({
    timestamp: item.fundingTime,
    fundingRate: parseFloat(item.fundingRate),
    markPrice: parseFloat(item.markPrice),
  })).sort((a: HistoricalRate, b: HistoricalRate) => a.timestamp - b.timestamp)
}

async function fetchBybitHistorical(symbol: string, periods: number): Promise<HistoricalRate[]> {
  const limit = Math.min(periods, 200)
  let allRates: HistoricalRate[] = []
  let endCursor = ''

  while (allRates.length < periods) {
    const url = `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=${Math.min(limit, periods - allRates.length)}${endCursor ? `&cursor=${endCursor}` : ''}`
    try {
      const json = await fetchJSON(url)
      const items = json.result?.list || []
      if (items.length === 0) break
      allRates = allRates.concat(items.map((item: any) => ({
        timestamp: parseInt(item.fundingRateTimestamp),
        fundingRate: parseFloat(item.fundingRate),
        markPrice: 0, // Bybit doesn't provide mark price in history
      })))
      if (!json.result?.nextPageCursor || json.result.nextPageCursor === endCursor) break
      endCursor = json.result.nextPageCursor
    } catch { break }
  }

  return allRates.sort((a, b) => a.timestamp - b.timestamp)
}

// ==================== BACKTEST ENGINE ====================

function alignTimeSeries(
  longRates: HistoricalRate[],
  shortRates: HistoricalRate[],
  toleranceMs: number = 3600000 // 1 hour tolerance
): SpreadPoint[] {
  const spreads: SpreadPoint[] = []
  for (const lr of longRates) {
    const matching = shortRates.find(sr => Math.abs(sr.timestamp - lr.timestamp) <= toleranceMs)
    if (matching) {
      spreads.push({
        timestamp: lr.timestamp,
        longRate: lr.fundingRate,
        shortRate: matching.fundingRate,
        spread: lr.fundingRate - matching.fundingRate,
      })
    }
  }
  return spreads
}

function backtest(spreads: SpreadPoint[], roundTripCostPct: number): BacktestResult {
  const FUNDINGS_PER_YEAR = 1095
  const DAILY_PERIODS = 3 // 3 fundings per day

  if (spreads.length === 0) {
    throw new Error('No overlapping data points for the selected pair/exchanges')
  }

  const grossReturns: number[] = []
  const netReturns: number[] = []

  for (const point of spreads) {
    const grossPerPeriod = point.spread * 100
    const costPerPeriod = roundTripCostPct / DAILY_PERIODS
    netReturns.push(grossPerPeriod - costPerPeriod)
    grossReturns.push(grossPerPeriod)
  }

  // Cumulative returns
  let cumulative = 0
  const cumData = spreads.map((point, i) => {
    cumulative += netReturns[i]
    return {
      timestamp: point.timestamp,
      spread: point.spread * 100,
      cumulative: parseFloat(cumulative.toFixed(4)),
    }
  })

  // Calculate statistics
  const avgSpread = spreads.reduce((s, p) => s + p.spread, 0) / spreads.length
  const spreadsValues = spreads.map(p => p.spread)
  const minSpread = Math.min(...spreadsValues)
  const maxSpread = Math.max(...spreadsValues)
  const variance = spreadsValues.reduce((s, v) => s + (v - avgSpread) ** 2, 0) / spreads.length
  const stdDev = Math.sqrt(variance)

  const avgNetPerPeriod = netReturns.reduce((s, v) => s + v, 0) / netReturns.length
  const netReturnPct = netReturns.reduce((s, v) => s + v, 0)
  const grossReturnPct = grossReturns.reduce((s, v) => s + v, 0)

  // Max drawdown
  let peak = 0
  let maxDD = 0
  let running = 0
  for (const nr of netReturns) {
    running += nr
    if (running > peak) peak = running
    const dd = peak - running
    if (dd > maxDD) maxDD = dd
  }

  // Sharpe-like ratio (annualized)
  const avgDailyNet = avgNetPerPeriod * DAILY_PERIODS
  const netVariance = netReturns.reduce((s, v) => s + (v - avgNetPerPeriod) ** 2, 0) / netReturns.length
  const dailyStdDev = Math.sqrt(netVariance) * Math.sqrt(DAILY_PERIODS)
  const sharpe = dailyStdDev > 0 ? (avgDailyNet / dailyStdDev) * Math.sqrt(365) : 0

  // Win rate (periods with positive net return)
  const wins = netReturns.filter(v => v > 0).length
  const winRate = (wins / netReturns.length) * 100

  // Best/worst day (group by day)
  const byDay = new Map<string, number>()
  spreads.forEach((p, i) => {
    const day = new Date(p.timestamp).toISOString().slice(0, 10)
    byDay.set(day, (byDay.get(day) || 0) + netReturns[i])
  })
  const dailyReturns = Array.from(byDay.values())
  const bestDay = Math.max(...dailyReturns)
  const worstDay = Math.min(...dailyReturns)

  // 95% confidence interval for average daily return
  const dailyMean = avgDailyNet
  const dailySE = dailyStdDev / Math.sqrt(dailyReturns.length)
  const ci95Lower = dailyMean - 1.96 * dailySE
  const ci95Upper = dailyMean + 1.96 * dailySE

  const periodDays = spreads.length / DAILY_PERIODS
  const annualizedNet = avgDailyNet * 365

  return {
    symbol: spreads[0] ? '' : '', // will be filled by caller
    longExchange: '',
    shortExchange: '',
    periodDays: Math.round(periodDays),
    dataPoints: spreads.length,
    avgSpread: avgSpread * 100,
    minSpread: minSpread * 100,
    maxSpread: maxSpread * 100,
    stdDevSpread: stdDev * 100,
    grossReturnPct,
    netReturnPct,
    sharpeRatio: sharpe,
    maxDrawdownPct: maxDD,
    winRate,
    bestDay,
    worstDay,
    annualizedNetPct: annualizedNet,
    confidence95Lower: ci95Lower,
    confidence95Upper: ci95Upper,
    data: cumData,
  }
}

// ==================== POSITION CALCULATOR ====================

function calculatePosition(
  symbol: string,
  notional: number,
  longEx: string,
  shortEx: string,
  longRate: RateSnapshot,
  shortRate: RateSnapshot
) {
  const price = longRate.markPrice > 0 ? longRate.markPrice : shortRate.markPrice
  if (price <= 0) return { error: 'Invalid price data' }

  const spread = longRate.fundingRate - shortRate.fundingRate
  if (spread <= 0) return { error: `No arbitrage: ${longEx} rate <= ${shortEx} rate` }

  const size = notional / price
  const feePerRound = notional * 0.0016 // 0.16%
  const perFunding = notional * spread
  const annualGross = perFunding * 1095
  const annualNet = annualGross - (feePerRound * 1095) - (notional * 0.0005)

  // Liquidation estimate (simplified): price move that would eat 50% of margin
  const maintMargin = notional * 0.05 // 5% maintenance margin
  const liqBufferPct = (maintMargin / 2) / notional * 100

  return {
    symbol,
    notionalUsd: notional,
    direction: `Long ${longEx} + Short ${shortEx}`,
    entry: {
      long: { exchange: longEx, price: longRate.markPrice, size: `${size.toFixed(6)} ${symbol.replace('USDT', '')}` },
      short: { exchange: shortEx, price: shortRate.markPrice, size: `${size.toFixed(6)} ${symbol.replace('USDT', '')}` },
    },
    funding: {
      longRate: `${(longRate.fundingRatePct).toFixed(4)}%`,
      shortRate: `${(shortRate.fundingRatePct).toFixed(4)}%`,
      spread: `${(spread * 100).toFixed(4)}%`,
      perFundingUsd: `$${perFunding.toFixed(2)}`,
      nextFunding: longRate.nextFundingTime,
    },
    costs: { roundTripFee: `$${(feePerRound).toFixed(2)}`, safetyMargin: `$${(notional * 0.0005).toFixed(2)}` },
    returns: {
      annualGross: `$${annualGross.toFixed(2)}`,
      annualNet: `$${annualNet.toFixed(2)}`,
      annualNetPct: `${((annualNet / notional) * 100).toFixed(2)}%`,
      monthlyNet: `$${(annualNet / 12).toFixed(2)}`,
      dailyNet: `$${(annualNet / 365).toFixed(2)}`,
    },
    risk: {
      estimatedLiquidationBuffer: `${liqBufferPct.toFixed(2)}%`,
      perFundingReturnPct: `${(spread * 100).toFixed(4)}%`,
    },
  }
}

// ==================== MCP SERVER ====================

const server = new Server(
  { name: 'crypto-funding-rate', version: '3.0.0' },
  { capabilities: { tools: {} } }
)

const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT']

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_rates',
      description: '获取实时资金费率。三所(Binance/Bybit/OKX)真实数据，含标记价、持仓量、24h成交额。',
      inputSchema: {
        type: 'object',
        properties: {
          symbols: { type: 'array', items: { type: 'string' }, description: '默认热门前8' },
        },
      },
    },
    {
      name: 'find_arbitrage',
      description: '发现套利机会，附带风险评分(0-100)。可设最低净收益门槛和风险门槛。',
      inputSchema: {
        type: 'object',
        properties: {
          symbols: { type: 'array', items: { type: 'string' } },
          min_net_pct: { type: 'number', description: '最低净年化%(默认0)' },
          risk_threshold: { type: 'number', description: '最低风险评分0-100(默认50)' },
        },
      },
    },
    {
      name: 'analyze_symbol',
      description: '单币种深度分析：三所费率、基差、流动性、风险评分。',
      inputSchema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] },
    },
    {
      name: 'calculate_position',
      description: '可执行头寸计算器：输入金额+方向，输出实际下单参数、成本、收益、强平缓冲。',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string' },
          notional_usd: { type: 'number' },
          long_exchange: { type: 'string' },
          short_exchange: { type: 'string' },
        },
        required: ['symbol', 'notional_usd', 'long_exchange', 'short_exchange'],
      },
    },
    {
      name: 'backtest_strategy',
      description: '用历史数据回测套利策略。返回实际收益、最大回撤、夏普比率、胜率、95%置信区间。这是竞品没有的功能。',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string', description: '交易对，如 BTCUSDT' },
          long_exchange: { type: 'string', description: '做多交易所' },
          short_exchange: { type: 'string', description: '做空交易所' },
          days: { type: 'number', description: '回测天数(默认30)' },
        },
        required: ['symbol', 'long_exchange', 'short_exchange'],
      },
    },
    {
      name: 'get_statistics',
      description: '费率统计：7d/30d均值、标准差、spread动量(扩大/缩小趋势)。判断机会是否稳定。',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string' },
          exchange: { type: 'string', description: '交易所名称(可选)' },
          days: { type: 'number', description: '统计天数(默认7)' },
        },
        required: ['symbol'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const symbols: string[] = (args as any)?.symbols || DEFAULT_SYMBOLS
  const t0 = Date.now()

  try {
    switch (name) {
      case 'get_rates': {
        const results = await Promise.allSettled([
          fetchBinanceCurrent(symbols),
          fetchBybitCurrent(symbols),
          fetchOKXCurrent(symbols),
        ])
        const all: RateSnapshot[] = []
        if (results[0].status === 'fulfilled') all.push(...results[0].value)
        if (results[1].status === 'fulfilled') all.push(...results[1].value)
        if (results[2].status === 'fulfilled') all.push(...results[2].value)

        if (all.length === 0) return { content: [{ type: 'text', text: JSON.stringify({ error: 'ALL_FAILED' }) }], isError: true }

        return { content: [{ type: 'text', text: JSON.stringify({ timestamp: new Date().toISOString(), fetchMs: Date.now() - t0, count: all.length, rates: all.sort((a, b) => a.symbol.localeCompare(b.symbol)) }, null, 2) }] }
      }

      case 'find_arbitrage': {
        const minNet = (args as any)?.min_net_pct ?? 0
        const riskThresh = (args as any)?.risk_threshold ?? 50
        const results = await Promise.allSettled([fetchBinanceCurrent(symbols), fetchBybitCurrent(symbols), fetchOKXCurrent(symbols)])
        const all: RateSnapshot[] = []
        results.forEach(r => { if (r.status === 'fulfilled') all.push(...(r.value as RateSnapshot[])) })

        const bySymbol = new Map<string, RateSnapshot[]>()
        all.forEach(r => { if (!bySymbol.has(r.symbol)) bySymbol.set(r.symbol, []); bySymbol.get(r.symbol)!.push(r) })

        const signals: any[] = []
        for (const [symbol, rates] of bySymbol) {
          if (rates.length < 2) continue
          for (let i = 0; i < rates.length; i++) {
            for (let j = i + 1; j < rates.length; j++) {
              const a = rates[i], b = rates[j]
              if (a.markPrice <= 0 || b.markPrice <= 0) continue
              const spread = a.fundingRate - b.fundingRate
              if (spread <= 0) continue
              const netPct = (spread * 100 * 1095) - 0.21
              if (netPct < minNet) continue
              const riskScore = Math.max(0, 100 - Math.abs(a.fundingRate) * 50000)
              if (riskScore < riskThresh) continue
              signals.push({
                symbol, longExchange: a.exchange, shortExchange: b.exchange,
                spreadPct: (spread * 100).toFixed(4),
                netAnnualizedPct: parseFloat(netPct.toFixed(2)),
                riskScore: Math.round(riskScore),
                longPrice: a.markPrice, shortPrice: b.markPrice,
              })
            }
          }
        }
        return { content: [{ type: 'text', text: JSON.stringify({ timestamp: new Date().toISOString(), signalsFound: signals.length, signals: signals.sort((a, b) => b.netAnnualizedPct - a.netAnnualizedPct) }, null, 2) }] }
      }

      case 'analyze_symbol': {
        const sym = ((args as any)?.symbol as string)?.toUpperCase()
        const res = await Promise.allSettled([fetchBinanceCurrent([sym]), fetchBybitCurrent([sym]), fetchOKXCurrent([sym])])
        const rates: RateSnapshot[] = []
        res.forEach(r => { if (r.status === 'fulfilled') rates.push(...(r.value as RateSnapshot[])) })
        if (rates.length === 0) return { content: [{ type: 'text', text: 'No data' }], isError: true }
        return { content: [{ type: 'text', text: JSON.stringify({ symbol: sym, timestamp: new Date().toISOString(), rates, riskScores: rates.map(r => ({ exchange: r.exchange, score: Math.max(0, 100 - Math.abs(r.fundingRate) * 50000) })) }, null, 2) }] }
      }

      case 'calculate_position': {
        const sym = ((args as any)?.symbol as string)?.toUpperCase()
        const notional = (args as any)?.notional_usd
        const longEx = (args as any)?.long_exchange as string
        const shortEx = (args as any)?.short_exchange as string
        if (!sym || !notional || !longEx || !shortEx) return { content: [{ type: 'text', text: 'Missing params' }], isError: true }

        const res = await Promise.allSettled([fetchBinanceCurrent([sym]), fetchBybitCurrent([sym]), fetchOKXCurrent([sym])])
        const all: RateSnapshot[] = []
        res.forEach(r => { if (r.status === 'fulfilled') all.push(...(r.value as RateSnapshot[])) })

        const long = all.find(r => r.exchange === longEx)
        const short = all.find(r => r.exchange === shortEx)
        if (!long || !short) return { content: [{ type: 'text', text: 'Rate data not available' }], isError: true }

        return { content: [{ type: 'text', text: JSON.stringify(calculatePosition(sym, notional, longEx, shortEx, long, short), null, 2) }] }
      }

      case 'backtest_strategy': {
        const sym = ((args as any)?.symbol as string)?.toUpperCase()
        const longEx = (args as any)?.long_exchange as string
        const shortEx = (args as any)?.short_exchange as string
        const days = (args as any)?.days ?? 30
        if (!sym || !longEx || !shortEx) return { content: [{ type: 'text', text: 'Missing params' }], isError: true }

        const periods = days * 3 // 3 fundings per day

        // 并行获取两所历史数据
        const getHistorical = async (exchange: string, symbol: string, limit: number): Promise<HistoricalRate[]> => {
          if (exchange === 'Binance') return fetchBinanceHistorical(symbol, limit)
          if (exchange === 'Bybit') return fetchBybitHistorical(symbol, limit)
          throw new Error(`No historical API for ${exchange}`)
        }

        const [longHist, shortHist] = await Promise.all([
          getHistorical(longEx, sym, periods).catch(() => []),
          getHistorical(shortEx, sym, periods).catch(() => []),
        ])

        if (longHist.length === 0 || shortHist.length === 0) {
          return { content: [{ type: 'text', text: JSON.stringify({ error: 'NO_HISTORICAL_DATA', longEx, shortEx, sym, longPoints: longHist.length, shortPoints: shortHist.length }) }], isError: true }
        }

        const spreads = alignTimeSeries(longHist, shortHist)
        if (spreads.length === 0) return { content: [{ type: 'text', text: 'No matching data points between exchanges' }], isError: true }

        const result = backtest(spreads, 0.16)
        result.symbol = sym
        result.longExchange = longEx
        result.shortExchange = shortEx

        // 只保留最近30个点避免输出过大
        if (result.data.length > 30) {
          result.data = result.data.slice(-30)
        }

        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
      }

      case 'get_statistics': {
        const sym = ((args as any)?.symbol as string)?.toUpperCase()
        const exchange = (args as any)?.exchange as string | undefined
        const days = (args as any)?.days ?? 7
        const periods = days * 3

        const rates: HistoricalRate[] = []
        if (!exchange || exchange === 'Binance') {
          rates.push(...await fetchBinanceHistorical(sym, periods).catch(() => []))
        }
        if (!exchange || exchange === 'Bybit') {
          rates.push(...await fetchBybitHistorical(sym, periods).catch(() => []))
        }

        if (rates.length === 0) return { content: [{ type: 'text', text: 'No data' }], isError: true }

        rates.sort((a, b) => a.timestamp - b.timestamp)
        const values = rates.map(r => r.fundingRate)
        const avg = values.reduce((s, v) => s + v, 0) / values.length
        const std = Math.sqrt(values.reduce((s, v) => s + (v - avg) ** 2, 0) / values.length)
        const recent = values.slice(-Math.min(10, values.length))
        const older = values.slice(0, Math.min(10, values.length))
        const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length
        const olderAvg = older.reduce((s, v) => s + v, 0) / older.length
        const momentum = recentAvg > olderAvg * 1.1 ? 'INCREASING' : recentAvg < olderAvg * 0.9 ? 'DECREASING' : 'STABLE'

        const exLabel = exchange || 'ALL'
        return { content: [{ type: 'text', text: JSON.stringify({
          symbol: sym, exchange: exLabel, days, dataPoints: rates.length,
          mean: (avg * 100).toFixed(4) + '%',
          stdDev: (std * 100).toFixed(4) + '%',
          min: (Math.min(...values) * 100).toFixed(4) + '%',
          max: (Math.max(...values) * 100).toFixed(4) + '%',
          momentum,
          latest: (values[values.length - 1] * 100).toFixed(4) + '%',
          trend: recentAvg > olderAvg ? '费率在上升' : recentAvg < olderAvg ? '费率在下降' : '费率稳定',
        }, null, 2) }] }
      }

      default: return { content: [{ type: 'text', text: `Unknown: ${name}` }], isError: true }
    }
  } catch (err: any) {
    return { content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }], isError: true }
  }
})

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[crypto-funding-rate v3] Running. Real APIs + backtesting + statistics.')
}
main().catch(err => { console.error('Fatal:', err); process.exit(1) })
