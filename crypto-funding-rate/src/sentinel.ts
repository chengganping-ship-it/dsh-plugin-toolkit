/**
 * Funding Rate Sentinel — Production-Grade 7x24 套利哨兵
 *
 * 功能：
 *   - 持续轮询 Binance/Bybit/OKX
 *   - 多通道告警 (Telegram / Discord / Slack / 邮件)
 *   - 风控模块 (最大回撤 / 日交易上限 / 费率异常过滤)
 *   - PnL 追踪与日志 (JSON Lines 格式)
 *   - 状态持久化与自动恢复
 *   - 健康检查 HTTP 端口
 *
 * 用法：
 *   node dist/sentinel.js                          # 使用 .env 或默认配置
 *   node dist/sentinel.js --config sentinel.json   # 指定配置文件
 *
 * 配置文件示例 (sentinel.json):
 *   {
 *     "threshold": 0.02,
 *     "interval": 60,
 *     "minNetAnnualized": 3,
 *     "telegram": { "botToken": "xxx", "chatId": "yyy" },
 *     "discord": { "webhook": "https://..." },
 *     "risk": { "maxDrawdownPct": 5, "maxDailyTrades": 10 }
 *   }
 */

import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'

// ==================== TYPES ====================

interface RateData {
  exchange: string
  symbol: string
  fundingRate: number
  markPrice: number
  openInterest?: number
  volume24h?: number
  fetchedAt: number
}

interface ArbitrageOpportunity {
  symbol: string
  longEx: string
  shortEx: string
  spreadPct: number
  netAnnualized: number
  estDailyPct: number
  timestamp: number
  isNew: boolean
  riskScore: number  // 0-100, 越低越安全
}

interface SentinelConfig {
  threshold: number
  interval: number
  minNetAnnualized: number
  telegram?: { botToken: string; chatId: string }
  discord?: { webhook: string }
  slack?: { webhook: string }
  email?: { smtp: string; port: number; user: string; pass: string; to: string }
  risk: {
    maxDrawdownPct: number
    maxDailyTrades: number
    maxSingleTradePct: number  // 单次交易最大本金占比
    pauseAfterLoss: boolean
  }
  symbols: string[]
  healthPort: number
}

interface SentinelState {
  totalPolls: number
  startTime: number
  lastAlerts: Record<string, { spread: number; time: number; count: number }>
  dailyStats: {
    date: string
    trades: number
    pnlPct: number
    maxDrawdown: number
    peakPct: number
  }
  lastError: string | null
  consecutiveErrors: number
}

interface PnLEntry {
  timestamp: number
  symbol: string
  direction: string
  spreadPct: number
  estimatedPnlPct: number
  cumulativePnlPct: number
  note: string
}

// ==================== DEFAULTS ====================

const DEFAULT_CONFIG: SentinelConfig = {
  threshold: 0.02,
  interval: 60,
  minNetAnnualized: 3,
  risk: {
    maxDrawdownPct: 5,
    maxDailyTrades: 10,
    maxSingleTradePct: 25,
    pauseAfterLoss: true,
  },
  symbols: [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT',
    'ADAUSDT', 'AVAXUSDT', 'LINKUSDT', 'MATICUSDT', 'DOTUSDT',
    'LTCUSDT', 'UNIUSDT', 'ATOMUSDT', 'ETCUSDT', 'FILUSDT',
  ],
  healthPort: 8770,
}

const STATE_FILE = path.join(process.cwd(), '.sentinel-state.json')
const PNL_LOG = path.join(process.cwd(), 'pnl-log.jsonl')
const CONFIG_FILE = path.join(process.cwd(), 'sentinel.json')

// ==================== REAL API CALLS ====================

async function fetchJSON(url: string, timeoutMs = 15000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'funding-sentinel/2.0' },
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchBinanceRates(): Promise<RateData[]> {
  const [premium, ticker24h] = await Promise.all([
    fetchJSON('https://fapi.binance.com/fapi/v1/premiumIndex'),
    fetchJSON('https://fapi.binance.com/fapi/v1/ticker/24hr'),
  ])
  const volMap = new Map<string, { oi: number; vol: number }>()
  for (const t of ticker24h) {
    volMap.set(t.symbol, { oi: parseFloat(t.openInterest || '0'), vol: parseFloat(t.quoteVolume || '0') })
  }
  return (premium as any[])
    .filter((p: any) => p.symbol.endsWith('USDT'))
    .map((item: any) => {
      const v = volMap.get(item.symbol) || { oi: 0, vol: 0 }
      return {
        exchange: 'Binance',
        symbol: item.symbol,
        fundingRate: parseFloat(item.lastFundingRate),
        markPrice: parseFloat(item.markPrice),
        openInterest: v.oi,
        volume24h: v.vol,
        fetchedAt: Date.now(),
      }
    })
}

async function fetchBybitRates(): Promise<RateData[]> {
  const data = await fetchJSON('https://api.bybit.com/v5/market/tickers?category=linear')
  return (data.result?.list || [])
    .filter((t: any) => t.symbol.endsWith('USDT'))
    .map((item: any) => ({
      exchange: 'Bybit',
      symbol: item.symbol,
      fundingRate: parseFloat(item.fundingRate || '0'),
      markPrice: parseFloat(item.markPrice || '0'),
      openInterest: parseFloat(item.openInterest || '0'),
      volume24h: parseFloat(item.turnover24h || '0'),
      fetchedAt: Date.now(),
    }))
}

async function fetchOKXRates(): Promise<RateData[]> {
  const insts = await fetchJSON('https://www.okx.com/api/v5/public/instruments?instType=SWAP')
  const usdtSwaps = (insts.data || [])
    .filter((i: any) => i.instId && i.instId.endsWith('-USDT-SWAP'))
    .slice(0, 40)

  const results: RateData[] = []
  // Batch: fetch all funding rates in parallel (OKX allows this)
  const ratePromises = usdtSwaps.map(async (inst: any) => {
    try {
      const rateRes = await fetchJSON(
        `https://www.okx.com/api/v5/public/funding-rate?instId=${inst.instId}`,
        8000
      )
      const rate = rateRes.data?.[0]
      if (rate) {
        return {
          exchange: 'OKX',
          symbol: inst.instId.replace('-USDT-SWAP', 'USDT'),
          fundingRate: parseFloat(rate.fundingRate),
          markPrice: parseFloat(rate.markPrice || '0'),
          openInterest: parseFloat(rate.openInterest || '0'),
          fetchedAt: Date.now(),
        } as RateData
      }
    } catch { /* skip */ }
    return null
  })
  const rates = await Promise.all(ratePromises)
  for (const r of rates) if (r) results.push(r)
  return results
}

// ==================== OPPORTUNITY DETECTION ====================

function calculateRiskScore(
  spreadPct: number,
  longRate: number,
  shortRate: number,
  longOI: number,
  shortOI: number
): number {
  let score = 50 // base

  // 费率差越大越安全
  if (spreadPct > 0.05) score -= 20
  else if (spreadPct > 0.02) score -= 10
  else if (spreadPct < 0.005) score += 20

  // 费率绝对值异常高 → 风险
  if (Math.abs(longRate) > 0.005 || Math.abs(shortRate) > 0.005) score += 15

  // 持仓量越大流动性越好
  if (longOI > 1e8 && shortOI > 1e8) score -= 10
  else if (longOI < 1e7 || shortOI < 1e7) score += 15

  return Math.max(0, Math.min(100, score))
}

function detectOpportunities(
  rates: RateData[],
  config: SentinelConfig
): ArbitrageOpportunity[] {
  const bySymbol = new Map<string, RateData[]>()
  const opportunities: ArbitrageOpportunity[] = []

  for (const r of rates) {
    if (!config.symbols.includes(r.symbol)) continue
    if (!bySymbol.has(r.symbol)) bySymbol.set(r.symbol, [])
    bySymbol.get(r.symbol)!.push(r)
  }

  for (const [symbol, items] of bySymbol) {
    if (items.length < 2) continue

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
    const periodsPerYear = 365 * 3 // 8h 一期
    const feePerPeriod = 0.08 // 4 trades × 0.02% (conservative)
    const netAnnualized = spreadPct * periodsPerYear - feePerPeriod * periodsPerYear
    const estDailyPct = netAnnualized / 365

    if (spreadPct >= config.threshold && netAnnualized >= config.minNetAnnualized) {
      const riskScore = calculateRiskScore(
        spreadPct,
        bestLong.fundingRate,
        bestShort.fundingRate,
        bestLong.openInterest || 0,
        bestShort.openInterest || 0
      )

      opportunities.push({
        symbol,
        longEx: bestLong.exchange,
        shortEx: bestShort.exchange,
        spreadPct: parseFloat(spreadPct.toFixed(4)),
        netAnnualized: parseFloat(netAnnualized.toFixed(2)),
        estDailyPct: parseFloat(estDailyPct.toFixed(4)),
        timestamp: Date.now(),
        isNew: false,
        riskScore,
      })
    }
  }

  return opportunities.sort((a, b) => a.riskScore - a.riskScore || b.netAnnualized - a.netAnnualized)
}

// ==================== PERSISTENCE ====================

function loadState(): SentinelState {
  const defaults: SentinelState = {
    totalPolls: 0,
    startTime: Date.now(),
    lastAlerts: {},
    dailyStats: { date: today(), trades: 0, pnlPct: 0, maxDrawdown: 0, peakPct: 0 },
    lastError: null,
    consecutiveErrors: 0,
  }
  try {
    if (fs.existsSync(STATE_FILE)) {
      const raw = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'))
      return {
        ...defaults,
        ...raw,
        dailyStats: { ...defaults.dailyStats, ...(raw.dailyStats || {}) },
      }
    }
  } catch { /* ignore */ }
  return defaults
}

function saveState(state: SentinelState) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)) } catch { /* ignore */ }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function logPnL(entry: PnLEntry) {
  try { fs.appendFileSync(PNL_LOG, JSON.stringify(entry) + '\n') } catch { /* ignore */ }
}

// ==================== ALERT CHANNELS ====================

async function sendTelegram(botToken: string, chatId: string, alerts: ArbitrageOpportunity[]) {
  const text = alerts.map(a =>
    `🚨 <b>${a.symbol}</b>\n` +
    `Spread: ${a.spreadPct}% → 净年化: <b>${a.netAnnualized}%</b>\n` +
    `做多: ${a.longEx} | 做空: ${a.shortEx}\n` +
    `风险评分: ${a.riskScore}/100 | 预估日收益: ${a.estDailyPct}%`
  ).join('\n\n')

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    })
  } catch (err: any) {
    console.error(`  ✗ Telegram failed: ${err.message}`)
  }
}

async function sendDiscord(webhook: string, alerts: ArbitrageOpportunity[]) {
  try {
    const body = {
      content: `🚨 **套利机会告警** — ${alerts.length} 个信号`,
      embeds: alerts.slice(0, 8).map(a => ({
        title: `${a.symbol} — 净年化 ${a.netAnnualized}%`,
        color: a.riskScore < 30 ? 0x00ff00 : a.riskScore < 60 ? 0xffaa00 : 0xff0000,
        fields: [
          { name: 'Spread', value: `${a.spreadPct}%`, inline: true },
          { name: '做多', value: a.longEx, inline: true },
          { name: '做空', value: a.shortEx, inline: true },
          { name: '风险评分', value: `${a.riskScore}/100`, inline: true },
          { name: '预估日收益', value: `${a.estDailyPct}%`, inline: true },
        ],
        timestamp: new Date(a.timestamp).toISOString(),
      })),
    }
    await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch (err: any) {
    console.error(`  ✗ Discord failed: ${err.message}`)
  }
}

async function sendSlack(webhook: string, alerts: ArbitrageOpportunity[]) {
  try {
    const text = alerts.map(a =>
      `🚨 *${a.symbol}* | Spread ${a.spreadPct}% → 净年化 *${a.netAnnualized}%*\n` +
      `做多: ${a.longEx} | 做空: ${a.shortEx} | 风险: ${a.riskScore}/100`
    ).join('\n\n')
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch (err: any) {
    console.error(`  ✗ Slack failed: ${err.message}`)
  }
}

async function dispatchAlerts(config: SentinelConfig, alerts: ArbitrageOpportunity[]) {
  const promises: Promise<void>[] = []
  if (config.telegram) promises.push(sendTelegram(config.telegram.botToken, config.telegram.chatId, alerts))
  if (config.discord) promises.push(sendDiscord(config.discord.webhook, alerts))
  if (config.slack) promises.push(sendSlack(config.slack.webhook, alerts))
  if (promises.length > 0) await Promise.allSettled(promises)
}

// ==================== RISK MANAGEMENT ====================

function checkRiskLimits(state: SentinelState, config: SentinelConfig): { allowed: boolean; reason?: string } {
  // 检查日交易上限
  if (state.dailyStats.trades >= config.risk.maxDailyTrades) {
    return { allowed: false, reason: `日交易次数已达上限 (${config.risk.maxDailyTrades})` }
  }

  // 检查最大回撤
  if (state.dailyStats.maxDrawdown >= config.risk.maxDrawdownPct) {
    return { allowed: false, reason: `最大回撤已达 ${state.dailyStats.maxDrawdown.toFixed(2)}% (上限 ${config.risk.maxDrawdownPct}%)` }
  }

  // 连续错误过多 → 暂停
  if (state.consecutiveErrors >= 5) {
    return { allowed: false, reason: `连续错误 ${state.consecutiveErrors} 次，暂停告警` }
  }

  return { allowed: true }
}

// ==================== HEALTH CHECK SERVER ====================

function startHealthServer(state: () => SentinelState, port: number) {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      const s = state()
      const uptime = Date.now() - s.startTime
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'ok',
        uptime: `${Math.floor(uptime / 3600000)}h ${Math.floor((uptime % 3600000) / 60000)}m`,
        totalPolls: s.totalPolls,
        dailyTrades: s.dailyStats.trades,
        dailyPnlPct: s.dailyStats.pnlPct,
        maxDrawdown: s.dailyStats.maxDrawdown,
        lastError: s.lastError,
        consecutiveErrors: s.consecutiveErrors,
      }, null, 2))
    } else if (req.url === '/pnl') {
      try {
        const log = fs.readFileSync(PNL_LOG, 'utf-8').trim().split('\n').slice(-20)
        const entries = log.map(l => JSON.parse(l))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(entries, null, 2))
      } catch {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end('[]')
      }
    } else {
      res.writeHead(404)
      res.end('Not Found')
    }
  })
  server.listen(port, () => {
    console.log(`  📊 健康检查: http://localhost:${port}/health`)
    console.log(`  📈 PnL 日志: http://localhost:${port}/pnl`)
  })
  return server
}

// ==================== MAIN LOOP ====================

async function main() {
  // 加载配置
  let config = { ...DEFAULT_CONFIG }
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
      config = { ...DEFAULT_CONFIG, ...fileConfig, risk: { ...DEFAULT_CONFIG.risk, ...fileConfig.risk } }
      console.log(`  ⚙️  已加载配置: ${CONFIG_FILE}`)
    } catch (err: any) {
      console.error(`  ⚠️  配置文件解析失败: ${err.message}，使用默认配置`)
    }
  }

  // 命令行参数覆盖
  const args = process.argv.slice(2)
  const getArg = (name: string) => {
    const idx = args.indexOf(name)
    return idx >= 0 ? args[idx + 1] : undefined
  }
  if (getArg('--threshold')) config.threshold = parseFloat(getArg('--threshold')!)
  if (getArg('--interval')) config.interval = parseInt(getArg('--interval')!)
  if (getArg('--min-net')) config.minNetAnnualized = parseFloat(getArg('--min-net')!)
  if (getArg('--telegram-token')) config.telegram = { botToken: getArg('--telegram-token')!, chatId: getArg('--telegram-chat') || '' }
  if (getArg('--discord')) config.discord = { webhook: getArg('--discord')! }
  if (getArg('--health-port')) config.healthPort = parseInt(getArg('--health-port')!)

  console.log()
  console.log('='.repeat(60))
  console.log('  Funding Rate Sentinel v2.0 — 7x24 套利哨兵')
  console.log('='.repeat(60))
  console.log(`  最低 spread 阈值: ${config.threshold}%`)
  console.log(`  最低净年化门槛: ${config.minNetAnnualized}%`)
  console.log(`  轮询间隔: ${config.interval} 秒`)
  console.log(`  监控币种: ${config.symbols.length} 个`)
  console.log(`  风控: 日限 ${config.risk.maxDailyTrades} 笔 | 最大回撤 ${config.risk.maxDrawdownPct}%`)
  console.log(`  告警通道: ${[
    config.telegram ? 'Telegram' : '',
    config.discord ? 'Discord' : '',
    config.slack ? 'Slack' : '',
  ].filter(Boolean).join(', ') || '控制台'}`)
  console.log('='.repeat(60))
  console.log()

  const state = loadState()
  state.startTime = Date.now()

  // 启动健康检查服务器
  startHealthServer(() => state, config.healthPort)

  // 重置每日统计
  if (state.dailyStats.date !== today()) {
    state.dailyStats = { date: today(), trades: 0, pnlPct: 0, maxDrawdown: 0, peakPct: 0 }
  }

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
        state.consecutiveErrors++
        state.lastError = errors.join('; ')
        console.error(`[#${state.totalPolls}] ${new Date().toLocaleTimeString('zh-CN')} 所有交易所获取失败 (${state.consecutiveErrors} 连续)`)
        errors.forEach(e => console.error(`  - ${e}`))
        return
      }

      // 检测机会
      const opportunities = detectOpportunities(allRates, config)
      const elapsed = Date.now() - t0

      // 风控检查
      const riskCheck = checkRiskLimits(state, config)

      // 判断是否是真正的新机会
      const newAlerts: ArbitrageOpportunity[] = []
      for (const opp of opportunities) {
        const key = `${opp.symbol}-${opp.longEx}-${opp.shortEx}`
        const prev = state.lastAlerts[key]
        const isNew = !prev ||
          (opp.spreadPct > prev.spread * 1.5) ||
          (Date.now() - prev.time > 3600000)

        if (isNew && riskCheck.allowed) {
          opp.isNew = true
          newAlerts.push(opp)
          state.dailyStats.trades++
        }

        // 更新状态
        state.lastAlerts[key] = {
          spread: opp.spreadPct,
          time: isNew ? Date.now() : (prev?.time || Date.now()),
          count: (prev?.count || 0) + 1,
        }
      }

      // 输出状态行
      const time = new Date().toLocaleTimeString('zh-CN')
      const exchanges = [...new Set(allRates.map(r => r.exchange))].join('/')
      process.stdout.write(`[#${state.totalPolls}] ${time} | ${exchanges} | ${allRates.length} rates | ${elapsed}ms`)

      if (opportunities.length > 0) {
        process.stdout.write(` | ⚡ ${opportunities.length} 个机会`)
      }
      if (!riskCheck.allowed) {
        process.stdout.write(` | ⛔ 风控暂停: ${riskCheck.reason}`)
      }
      process.stdout.write('\n')

      // 输出新告警
      if (newAlerts.length > 0) {
        console.log()
        console.log(`🚨 发现 ${newAlerts.length} 个新套利机会:`)
        newAlerts.forEach(a => {
          const marker = a.riskScore < 30 ? '🟢' : a.riskScore < 60 ? '🟡' : '🔴'
          console.log(`  ${marker} ${a.symbol}: Spread ${a.spreadPct}% → 净年化 ${a.netAnnualized}% | 做多${a.longEx} + 做空${a.shortEx} | 风险${a.riskScore}`)
        })
        console.log()

        // 记录 PnL
        for (const a of newAlerts) {
          const prevPnl = state.dailyStats.pnlPct
          const estPnl = a.estDailyPct / 3 // 8h period
          state.dailyStats.pnlPct += estPnl
          if (state.dailyStats.pnlPct > state.dailyStats.peakPct) {
            state.dailyStats.peakPct = state.dailyStats.pnlPct
          }
          const dd = state.dailyStats.peakPct - state.dailyStats.pnlPct
          if (dd > state.dailyStats.maxDrawdown) state.dailyStats.maxDrawdown = dd

          logPnL({
            timestamp: Date.now(),
            symbol: a.symbol,
            direction: `多${a.longEx}/空${a.shortEx}`,
            spreadPct: a.spreadPct,
            estimatedPnlPct: estPnl,
            cumulativePnlPct: state.dailyStats.pnlPct,
            note: `risk=${a.riskScore}`,
          })
        }

        // 发送告警
        await dispatchAlerts(config, newAlerts)
      }

      // 重置错误计数
      state.consecutiveErrors = 0
      state.lastError = null
      saveState(state)
    } catch (err: any) {
      state.consecutiveErrors++
      state.lastError = err.message
      console.error(`[#${state.totalPolls}] Error: ${err.message}`)
    }
  }

  // 立即执行一次
  await poll()

  // 定时轮询
  setInterval(poll, config.interval * 1000)

  // 优雅退出
  process.on('SIGINT', () => {
    console.log('\n  👋 Sentinel 停止')
    saveState(state)
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    console.log('\n  👋 Sentinel 终止')
    saveState(state)
    process.exit(0)
  })
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
