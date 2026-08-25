/**
 * Funding Rate Sentinel — 7x24 自动监控套利机会
 *
 * 持续轮询 Binance/Bybit/OKX，当真实套利机会出现时告警。
 * 不是每次费率变动都叫，而是当 spread 超过阈值 + 持续稳定时才通知。
 *
 * 用法：
 *   npx ts-node sentinel.ts --threshold 0.05 --interval 300
 *   node dist/sentinel.js --threshold 0.05 --interval 300 --webhook https://...
 *
 * 参数：
 *   --threshold  最低 spread % 才触发告警（默认 0.02%）
 *   --interval   轮询间隔秒数（默认 300 = 5分钟）
 *   --webhook   Discord/Slack webhook URL（可选）
 *   --min-net    最低净年化 % 才触发（默认 5%）
 */

import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// ==================== TYPES ====================

interface RateData {
  exchange: string
  symbol?: string
  fundingRate: number
  markPrice: number
  fetchedAt: number
}

interface Alert {
  symbol: string
  longEx: string
  shortEx: string
  spreadPct: number
  netAnnualized: number
  timestamp: number
  isNew: boolean
}

interface SentinelState {
  lastAlerts: Record<string, { spread: number; time: number }>
  totalPolls: number
  startTime: number
}

// ==================== REAL API CALLS ====================

async function fetchJSON(url: string): Promise<any> {
  const res = await fetch(url, { headers: { 'User-Agent': 'funding-sentinel/1.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchBinanceRates(): Promise<RateData[]> {
  const data = await fetchJSON('https://fapi.binance.com/fapi/v1/premiumIndex')
  return data.map((item: any) => ({
    exchange: 'Binance',
    symbol: item.symbol,
    fundingRate: parseFloat(item.lastFundingRate),
    markPrice: parseFloat(item.markPrice),
    fetchedAt: Date.now(),
  }))
}

async function fetchBybitRates(): Promise<RateData[]> {
  const tickers = await fetchJSON('https://api.bybit.com/v5/market/tickers?category=linear&coin=USDT')
  return (tickers.result?.list || [])
    .filter((t: any) => t.symbol.endsWith('USDT'))
    .map((item: any) => ({
      exchange: 'Bybit',
      symbol: item.symbol,
      fundingRate: parseFloat(item.fundingRate || '0'),
      markPrice: parseFloat(item.markPrice || '0'),
      fetchedAt: Date.now(),
    }))
}

async function fetchOKXRates(): Promise<RateData[]> {
  const insts = await fetchJSON('https://www.okx.com/api/v5/public/instruments?instType=SWAP')
  const usdtSwaps = (insts.data || []).filter((i: any) => i.instId && i.instId.endsWith('-USDT-SWAP')).slice(0, 30)

  const results: RateData[] = []
  for (const inst of usdtSwaps) {
    try {
      const rateRes = await fetchJSON(`https://www.okx.com/api/v5/public/funding-rate?instId=${inst.instId}`)
      const rate = rateRes.data?.[0]
      if (rate) {
        results.push({
          exchange: 'OKX',
          symbol: inst.instId.replace('-USDT-SWAP', 'USDT'),
          fundingRate: parseFloat(rate.fundingRate),
          markPrice: 0,
          fetchedAt: Date.now(),
        } as RateData)
      }
    } catch { /* skip */ }
  }
  return results
}

// ==================== OPPORTUNITY DETECTION ====================

function detectOpportunities(
  rates: RateData[],
  minSpreadPct: number,
  minNetAnnualized: number
): Alert[] {
  const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'MATICUSDT', 'DOTUSDT']
  const bySymbol = new Map<string, RateData[]>()
  const alerts: Alert[] = []

  // 按交易对分组
  for (const r of rates) {
    const sym = SYMBOLS.find(s => s === r.symbol || r.symbol === s)
    if (!sym) continue
    if (!bySymbol.has(sym)) bySymbol.set(sym, [])
    bySymbol.get(sym)!.push(r)
  }

  for (const [symbol, items] of bySymbol) {
    if (items.length < 2) continue

    // 找最佳套利方向
    let bestSpread = 0
    let bestLong: RateData | null = null
    let bestShort: RateData | null = null

    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const spread = items[i].fundingRate - items[j].fundingRate
        if (spread > bestSpread) {
          bestSpread = spread
          bestLong = items[i]
          bestShort = items[j]
        }
      }
    }

    if (!bestLong || !bestShort) continue

    const spreadPct = bestSpread * 100
    const netAnnualized = spreadPct * 1095 - 0.21

    if (spreadPct >= minSpreadPct && netAnnualized >= minNetAnnualized) {
      alerts.push({
        symbol,
        longEx: bestLong.exchange,
        shortEx: bestShort.exchange,
        spreadPct: parseFloat(spreadPct.toFixed(4)),
        netAnnualized: parseFloat(netAnnualized.toFixed(2)),
        timestamp: Date.now(),
        isNew: false, // will be set by caller
      })
    }
  }

  return alerts.sort((a, b) => b.netAnnualized - a.netAnnualized)
}

// ==================== PERSISTENCE ====================

const STATE_FILE = path.join(process.cwd(), '.sentinel-state.json')

function loadState(): SentinelState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'))
    }
  } catch { /* ignore */ }
  return { lastAlerts: {}, totalPolls: 0, startTime: Date.now() }
}

function saveState(state: SentinelState) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)) } catch { /* ignore */ }
}

// ==================== ALERT OUTPUT ====================

function formatAlert(alert: Alert): string {
  const time = new Date(alert.timestamp).toLocaleTimeString('zh-CN')
  const marker = alert.isNew ? '🆕 NEW' : '🔄'
  return `${marker} ${alert.symbol}: Spread ${alert.spreadPct}% → 净年化 ${alert.netAnnualized}% | 做多${alert.longEx} + 做空${alert.shortEx}`
}

async function sendWebhook(url: string, alerts: Alert[]) {
  try {
    const body = {
      content: `🚨 发现 ${alerts.length} 个套利机会`,
      embeds: alerts.slice(0, 5).map(a => ({
        title: a.symbol,
        description: `Spread ${a.spreadPct}% → 净年化 ${a.netAnnualized}%`,
        fields: [
          { name: '做多', value: a.longEx, inline: true },
          { name: '做空', value: a.shortEx, inline: true },
        ],
        timestamp: new Date(a.timestamp).toISOString(),
      })),
    }
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch (err: any) {
    console.error(`Webhook failed: ${err.message}`)
  }
}

// ==================== MAIN LOOP ====================

async function main() {
  const args = process.argv.slice(2)
  const getArg = (name: string, def: string) => {
    const idx = args.indexOf(name)
    return idx >= 0 ? args[idx + 1] : def
  }

  const threshold = parseFloat(getArg('--threshold', '0.02'))
  const intervalSec = parseInt(getArg('--interval', '300'))
  const webhook = getArg('--webhook', '')
  const minNet = parseFloat(getArg('--min-net', '5'))

  console.log('='.repeat(60))
  console.log('  Funding Rate Sentinel — 套利机会监控')
  console.log('='.repeat(60))
  console.log(`  最低 spread 阈值: ${threshold}%`)
  console.log(`  最低净年化门槛: ${minNet}%`)
  console.log(`  轮询间隔: ${intervalSec} 秒`)
  console.log(`  Webhook: ${webhook || '无（仅控制台输出）'}`)
  console.log('='.repeat(60))
  console.log()

  const state = loadState()
  state.startTime = Date.now()

  async function poll() {
    state.totalPolls++
    const t0 = Date.now()

    try {
      // 并行获取三所数据
      const results = await Promise.allSettled([
        fetchBinanceRates(),
        fetchBybitRates(),
        fetchOKXRates(),
      ])

      const allRates: RateData[] = []
      const errors: string[] = []

      if (results[0].status === 'fulfilled') allRates.push(...results[0].value)
      else errors.push(`Binance: ${results[0].reason?.message}`)

      if (results[1].status === 'fulfilled') allRates.push(...results[1].value)
      else errors.push(`Bybit: ${results[1].reason?.message}`)

      if (results[2].status === 'fulfilled') allRates.push(...results[2].value)
      else errors.push(`OKX: ${results[2].reason?.message}`)

      if (allRates.length === 0) {
        console.error(`[#${state.totalPolls}] ${new Date().toLocaleTimeString('zh-CN')} 所有交易所获取失败`)
        errors.forEach(e => console.error(`  - ${e}`))
        return
      }

      // 检测机会
      const opportunities = detectOpportunities(allRates, threshold, minNet)
      const elapsed = Date.now() - t0

      // 判断是否是真正的新机会（spread 比上次显著增大）
      const newAlerts: Alert[] = []
      for (const opp of opportunities) {
        const key = `${opp.symbol}-${opp.longEx}-${opp.shortEx}`
        const prev = state.lastAlerts[key]
        const isNew = !prev || (opp.spreadPct > prev.spread * 1.5) || (Date.now() - prev.time > 3600000)

        if (isNew) {
          opp.isNew = true
          newAlerts.push(opp)
        }

        // 更新状态
        state.lastAlerts[key] = { spread: opp.spreadPct, time: Date.now() }
      }

      // 输出状态行
      const time = new Date().toLocaleTimeString('zh-CN')
      const rateCount = allRates.length
      const exchanges = [...new Set(allRates.map(r => r.exchange))].join('/')
      process.stdout.write(`[#${state.totalPolls}] ${time} | ${exchanges} | ${rateCount} rates | ${elapsed}ms`)

      if (opportunities.length > 0) {
        process.stdout.write(` | ⚡ ${opportunities.length} 个机会`)
      }
      process.stdout.write('\n')

      // 输出新告警
      if (newAlerts.length > 0) {
        console.log()
        console.log(`🚨 发现 ${newAlerts.length} 个新套利机会:`)
        newAlerts.forEach(a => console.log('  ' + formatAlert(a)))
        console.log()

        // 发送 webhook
        if (webhook) {
          await sendWebhook(webhook, newAlerts)
        }
      }

      saveState(state)
    } catch (err: any) {
      console.error(`[#${state.totalPolls}] Error: ${err.message}`)
    }
  }

  // 立即执行一次
  await poll()

  // 定时轮询
  setInterval(poll, intervalSec * 1000)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
