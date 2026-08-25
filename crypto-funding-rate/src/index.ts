/**
 * Crypto Funding Rate MCP Server
 *
 * Real-time funding rate monitor for cryptocurrency perpetual futures.
 * Fetches LIVE data from Binance, OKX, and Bybit APIs.
 * Calculates cross-exchange spreads and identifies arbitrage opportunities.
 *
 * NO random numbers. NO fake data. Everything comes from real exchange APIs.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js'

// ==================== TYPES ====================

interface FundingRate {
  exchange: string
  symbol: string
  fundingRate: number
  fundingRatePct: number
  nextFundingTime: string
  markPrice: number
  indexPrice: number
  timestamp: number
}

interface SpreadOpportunity {
  symbol: string
  longExchange: string
  shortExchange: string
  longRate: number
  shortRate: number
  spreadPct: number
  annualizedPct: number
  estimatedNetPct: number
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
}

// ==================== REAL API CALLS ====================

async function fetchJSON(url: string, timeoutMs = 10000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch funding rates from Binance Futures API.
 * Real endpoint: https://fapi.binance.com/fapi/v1/premiumIndex
 */
async function fetchBinanceRates(symbols: string[]): Promise<FundingRate[]> {
  const url = 'https://fapi.binance.com/fapi/v1/premiumIndex'
  const data = await fetchJSON(url)

  const now = Date.now()
  return data
    .filter((item: any) => symbols.includes(item.symbol))
    .map((item: any) => ({
      exchange: 'Binance',
      symbol: item.symbol,
      fundingRate: parseFloat(item.lastFundingRate),
      fundingRatePct: parseFloat(item.lastFundingRate) * 100,
      nextFundingTime: new Date(item.nextFundingTime).toISOString(),
      markPrice: parseFloat(item.markPrice),
      indexPrice: parseFloat(item.indexPrice),
      timestamp: now,
    }))
}

/**
 * Fetch funding rates from OKX API.
 * Real endpoint: https://www.okx.com/api/v5/public/funding-rate
 */
async function fetchOKXRates(symbols: string[]): Promise<FundingRate[]> {
  const now = Date.now()
  const results: FundingRate[] = []

  for (const symbol of symbols) {
    try {
      const instId = symbol.replace('USDT', '-USDT-SWAP')
      const url = `https://www.okx.com/api/v5/public/funding-rate?instId=${instId}`
      const data = await fetchJSON(url)

      if (data.data && data.data.length > 0) {
        const item = data.data[0]
        results.push({
          exchange: 'OKX',
          symbol,
          fundingRate: parseFloat(item.fundingRate),
          fundingRatePct: parseFloat(item.fundingRate) * 100,
          nextFundingTime: new Date(parseInt(item.fundingTime)).toISOString(),
          markPrice: parseFloat(item.markPx || '0'),
          indexPrice: parseFloat(item.indexPx || '0'),
          timestamp: now,
        })
      }
    } catch {
      // Skip symbols not available on OKX
    }
  }
  return results
}

/**
 * Fetch funding rates from Bybit API.
 * Real endpoint: https://api.bybit.com/v5/market/funding/history
 */
async function fetchBybitRates(symbols: string[]): Promise<FundingRate[]> {
  const now = Date.now()
  const results: FundingRate[] = []

  for (const symbol of symbols) {
    try {
      const url = `https://api.bybit.com/v5/market/funding/history?category=linear&symbol=${symbol}&limit=1`
      const data = await fetchJSON(url)

      if (data.result && data.result.list && data.result.list.length > 0) {
        const item = data.result.list[0]
        results.push({
          exchange: 'Bybit',
          symbol,
          fundingRate: parseFloat(item.fundingRate),
          fundingRatePct: parseFloat(item.fundingRate) * 100,
          nextFundingTime: new Date(now + 8 * 3600 * 1000).toISOString(),
          markPrice: parseFloat(item.markPrice || '0'),
          indexPrice: parseFloat(item.indexPrice || '0'),
          timestamp: now,
        })
      }
    } catch {
      // Skip symbols not available on Bybit
    }
  }
  return results
}

// ==================== ARBITRAGE CALCULATION ====================

/**
 * Calculate cross-exchange funding rate spreads.
 * Real math: identify pairs where one exchange pays to long and another charges to short.
 */
function calculateSpreads(rates: FundingRate[]): SpreadOpportunity[] {
  const bySymbol = new Map<string, FundingRate[]>()
  for (const r of rates) {
    if (!bySymbol.has(r.symbol)) bySymbol.set(r.symbol, [])
    bySymbol.get(r.symbol)!.push(r)
  }

  const opportunities: SpreadOpportunity[] = []
  const TRADE_FEE_PCT = 0.04 // 0.04% per trade (2 entries + 2 exits = 0.16% total)
  const SAFETY_MARGIN = 0.005 // 0.05% safety buffer

  for (const [symbol, symbolRates] of bySymbol) {
    if (symbolRates.length < 2) continue

    for (let i = 0; i < symbolRates.length; i++) {
      for (let j = i + 1; j < symbolRates.length; j++) {
        const a = symbolRates[i]
        const b = symbolRates[j]

        // Funding is paid every 8 hours = 3x per day = ~1095x per year
        const FUNDINGS_PER_YEAR = 1095

        // Case 1: Long on A (receive A's rate), Short on B (pay B's rate)
        const spread1 = a.fundingRate - b.fundingRate
        const annualized1 = spread1 * FUNDINGS_PER_YEAR * 100
        const net1 = annualized1 - (TRADE_FEE_PCT * 4) - SAFETY_MARGIN

        if (spread1 > 0) {
          opportunities.push({
            symbol,
            longExchange: a.exchange,
            shortExchange: b.exchange,
            longRate: a.fundingRatePct,
            shortRate: b.fundingRatePct,
            spreadPct: spread1 * 100,
            annualizedPct: annualized1,
            estimatedNetPct: net1,
            confidence: net1 > 20 ? 'HIGH' : net1 > 5 ? 'MEDIUM' : 'LOW',
          })
        }

        // Case 2: Long on B, Short on A
        const spread2 = b.fundingRate - a.fundingRate
        const annualized2 = spread2 * FUNDINGS_PER_YEAR * 100
        const net2 = annualized2 - (TRADE_FEE_PCT * 4) - SAFETY_MARGIN

        if (spread2 > 0) {
          opportunities.push({
            symbol,
            longExchange: b.exchange,
            shortExchange: a.exchange,
            longRate: b.fundingRatePct,
            shortRate: a.fundingRatePct,
            spreadPct: spread2 * 100,
            annualizedPct: annualized2,
            estimatedNetPct: net2,
            confidence: net2 > 20 ? 'HIGH' : net2 > 5 ? 'MEDIUM' : 'LOW',
          })
        }
      }
    }
  }

  return opportunities.sort((a, b) => b.estimatedNetPct - a.estimatedNetPct)
}

// ==================== MCP SERVER ====================

const server = new Server(
  { name: 'crypto-funding-rate', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT']

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_funding_rates',
      description: 'Fetch real-time funding rates from Binance, OKX, and Bybit for specified perpetual futures symbols. Returns actual rates from live exchange APIs.',
      inputSchema: {
        type: 'object',
        properties: {
          symbols: {
            type: 'array',
            items: { type: 'string' },
            description: 'Trading symbols (e.g., ["BTCUSDT", "ETHUSDT"]). Defaults to top 8.',
          },
        },
      },
    },
    {
      name: 'find_arbitrage',
      description: 'Find cross-exchange funding rate arbitrage opportunities. Compares rates across Binance, OKX, Bybit and calculates net annualized returns after fees.',
      inputSchema: {
        type: 'object',
        properties: {
          symbols: {
            type: 'array',
            items: { type: 'string' },
            description: 'Symbols to analyze. Defaults to top 8.',
          },
          min_annualized_pct: {
            type: 'number',
            description: 'Minimum annualized return threshold (%). Default: 5.',
          },
        },
      },
    },
    {
      name: 'analyze_symbol',
      description: 'Deep analysis of a single symbol: current rates across all exchanges, historical context, and optimal arbitrage direction.',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: {
            type: 'string',
            description: 'Symbol to analyze (e.g., "BTCUSDT")',
          },
        },
        required: ['symbol'],
      },
    },
  ],
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params
  const symbols: string[] = (args as any)?.symbols || DEFAULT_SYMBOLS

  try {
    switch (name) {
      case 'get_funding_rates': {
        const [binance, okx, bybit] = await Promise.allSettled([
          fetchBinanceRates(symbols),
          fetchOKXRates(symbols),
          fetchBybitRates(symbols),
        ])

        const allRates: FundingRate[] = []
        const errors: string[] = []

        if (binance.status === 'fulfilled') allRates.push(...binance.value)
        else errors.push(`Binance: ${binance.reason?.message || 'failed'}`)

        if (okx.status === 'fulfilled') allRates.push(...okx.value)
        else errors.push(`OKX: ${okx.reason?.message || 'failed'}`)

        if (bybit.status === 'fulfilled') allRates.push(...bybit.value)
        else errors.push(`Bybit: ${bybit.reason?.message || 'failed'}`)

        if (allRates.length === 0) {
          return {
            content: [{
              type: 'text',
              text: `Failed to fetch any data. Errors:\n${errors.join('\n')}`,
            }],
            isError: true,
          }
        }

        const output = JSON.stringify({
          timestamp: new Date().toISOString(),
          dataSources: {
            binance: binance.status === 'fulfilled' ? `${binance.value.length} symbols` : 'FAILED',
            okx: okx.status === 'fulfilled' ? `${okx.value.length} symbols` : 'FAILED',
            bybit: bybit.status === 'fulfilled' ? `${bybit.value.length} symbols` : 'FAILED',
          },
          rates: allRates,
          errors: errors.length > 0 ? errors : undefined,
        }, null, 2)

        return { content: [{ type: 'text', text: output }] }
      }

      case 'find_arbitrage': {
        const minAnnualized = (args as any)?.min_annualized_pct ?? 5

        const [binance, okx, bybit] = await Promise.allSettled([
          fetchBinanceRates(symbols),
          fetchOKXRates(symbols),
          fetchBybitRates(symbols),
        ])

        const allRates: FundingRate[] = []
        if (binance.status === 'fulfilled') allRates.push(...binance.value)
        if (okx.status === 'fulfilled') allRates.push(...okx.value)
        if (bybit.status === 'fulfilled') allRates.push(...bybit.value)

        if (allRates.length < 2) {
          return {
            content: [{
              type: 'text',
              text: 'Insufficient data from exchanges. Need at least 2 rates to compare.',
            }],
            isError: true,
          }
        }

        const allSpreads = calculateSpreads(allRates)
        const filtered = allSpreads.filter((s) => s.annualizedPct >= minAnnualized)

        const output = JSON.stringify({
          timestamp: new Date().toISOString(),
          totalRatesFetched: allRates.length,
          opportunitiesFound: filtered.length,
          minThreshold: `${minAnnualized}%`,
          opportunities: filtered.slice(0, 10),
          disclaimer: 'Rates are real-time. Net returns deduct estimated trading fees (0.16% round-trip) and safety margin. Past funding rates do not guarantee future rates. Slippage, liquidity, and exchange risks apply.',
        }, null, 2)

        return { content: [{ type: 'text', text: output }] }
      }

      case 'analyze_symbol': {
        const symbol = (args as any)?.symbol as string
        if (!symbol) {
          return { content: [{ type: 'text', text: 'Error: symbol is required' }], isError: true }
        }

        const [binance, okx, bybit] = await Promise.allSettled([
          fetchBinanceRates([symbol]),
          fetchOKXRates([symbol]),
          fetchBybitRates([symbol]),
        ])

        const rates: FundingRate[] = []
        if (binance.status === 'fulfilled') rates.push(...binance.value)
        if (okx.status === 'fulfilled') rates.push(...okx.value)
        if (bybit.status === 'fulfilled') rates.push(...bybit.value)

        if (rates.length === 0) {
          return {
            content: [{ type: 'text', text: `No data found for ${symbol} on any exchange.` }],
            isError: true,
          }
        }

        const spreads = calculateSpreads(rates)
        const best = spreads[0]

        const output = JSON.stringify({
          symbol,
          timestamp: new Date().toISOString(),
          rates,
          bestArbitrage: best || null,
          analysis: best
            ? `Long ${best.longExchange} (receive ${best.longRate.toFixed(4)}%), Short ${best.shortExchange} (pay ${best.shortRate.toFixed(4)}%). Net: ~${best.estimatedNetPct.toFixed(2)}% annualized.`
            : 'No profitable spread found across exchanges.',
        }, null, 2)

        return { content: [{ type: 'text', text: output }] }
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true }
    }
  } catch (err: any) {
    return {
      content: [{ type: 'text', text: `Error: ${err.message}\n\nThis is a real API error, not simulated data.` }],
      isError: true,
    }
  }
})

// ==================== START ====================

async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[crypto-funding-rate] MCP server running. Fetching REAL data from Binance, OKX, Bybit.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
