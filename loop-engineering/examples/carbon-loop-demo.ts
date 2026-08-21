/**
 * Loop Engineering Demo: Carbon Trading Analysis with Self-Verification
 *
 * Demonstrates using the loop executor with the carbon trading plugin's
 * carbon_price_predictor tool. Shows:
 * - Tool wrapping with retry/verification
 * - Multi-validator composition (markdown structure + disclaimer + no hallucination)
 * - Self-critique scoring
 * - Result inspection
 *
 * Run: npm run demo
 */

import {
  executeWithLoop,
  markdownStructureValidator,
  disclaimerValidator,
  noHallucinationMarkers,
  keywordPresenceValidator,
  lengthValidator,
  type LoopConfig,
  type LoopResult,
} from '../src/index'

// ===========================================================================
// Simulated carbon_price_predictor tool (mirrors the DSH plugin logic)
// ===========================================================================

interface PricePredictorInput {
  market: string
  allowance_type: string
  historical_prices: number[]
  forecast_periods: number
  policy_scenario?: 'baseline' | 'ambitious' | 'conservative'
  current_inventory?: number
}

// Seeded PRNG for deterministic demo results
class SeededRandom {
  private state: number
  constructor(seed: number) {
    this.state = seed | 0
  }
  next(): number {
    this.state |= 0
    this.state = (this.state + 0x6d2b79f5) | 0
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }
  static hashStr(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash) || 1
  }
}

const DISCLAIMER =
  '免责声明: 本分析基于AI模型推断与历史数据，仅供碳市场参考，不替代专业碳核查、金融投资和法律合规意见。碳价格预测具有固有不确定性，实际交易决策请咨询持牌碳交易顾问。'

function simulateCarbonPricePredictor(input: string): string {
  const data: PricePredictorInput = JSON.parse(input)
  const prices = data.historical_prices
  const rng = new SeededRandom(SeededRandom.hashStr(input))

  const currentPrice = prices[prices.length - 1] ?? 50
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const priceStd = Math.sqrt(
    prices.reduce((s, p) => s + Math.pow(p - avgPrice, 2), 0) / prices.length,
  )
  const volatilityPct = avgPrice > 0 ? (priceStd / avgPrice) * 100 : 15

  const firstAvg =
    prices.slice(0, Math.floor(prices.length / 2)).reduce((a, b) => a + b, 0) /
    Math.floor(prices.length / 2)
  const secondAvg =
    prices.slice(Math.floor(prices.length / 2)).reduce((a, b) => a + b, 0) /
    Math.ceil(prices.length / 2)
  const trendDiff = secondAvg - firstAvg

  let trend: 'bullish' | 'bearish' | 'sideways' = 'sideways'
  if (trendDiff > priceStd * 0.3) trend = 'bullish'
  else if (trendDiff < -priceStd * 0.3) trend = 'bearish'

  const trendStrength = Math.min(
    100,
    (Math.abs(trendDiff) / (priceStd + 0.01)) * 50 + rng.nextFloat(5, 15),
  )

  const policyMultipliers: Record<string, number> = {
    baseline: 1.0,
    ambitious: 1.15,
    conservative: 0.92,
  }
  const policyMult = policyMultipliers[data.policy_scenario ?? 'baseline']

  const forecasts: Array<{
    period: number
    predicted_price: number
    confidence_low: number
    confidence_high: number
  }> = []

  for (let i = 1; i <= data.forecast_periods; i++) {
    let changeRate = 0
    if (trend === 'bullish') changeRate = rng.nextFloat(0.02, 0.08) * policyMult
    else if (trend === 'bearish') changeRate = rng.nextFloat(-0.06, -0.01)
    else changeRate = rng.nextFloat(-0.02, 0.03)

    const adjustedRate = changeRate * (1 - i * 0.03)
    const predicted = currentPrice * (1 + adjustedRate)
    const spread = priceStd * (1 + i * 0.15)
    forecasts.push({
      period: i,
      predicted_price: Math.round(predicted * 100) / 100,
      confidence_low: Math.max(0, Math.round((predicted - spread) * 100) / 100),
      confidence_high: Math.round((predicted + spread) * 100) / 100,
    })
  }

  const support = Math.max(0, currentPrice - priceStd * 1.5)
  const resistance = currentPrice + priceStd * 1.5

  const riskFactors: string[] = []
  if (volatilityPct > 25) riskFactors.push('高价格波动率: 建议采用对冲策略')
  if (data.policy_scenario === 'ambitious')
    riskFactors.push('激进政策情景下价格上行风险增大')
  riskFactors.push('政策不确定性可能显著影响价格走势')
  riskFactors.push('宏观经济衰退风险可能降低配额需求')

  // Format as markdown report (matching the DSH plugin output format)
  const lines: string[] = []
  lines.push('## 碳配额价格预测与趋势分析报告')
  lines.push('')
  lines.push(
    `**市场:** ${data.market} | **当前价格:** ${currentPrice} 元/吨 | **趋势:** ${
      trend === 'bullish' ? '看涨 \u2191' : trend === 'bearish' ? '看跌 \u2193' : '震荡 \u2192'
    }`,
  )
  lines.push('')
  lines.push('### 技术指标')
  lines.push('| 指标 | 值 |')
  lines.push('|------|------|')
  lines.push(`| 趋势强度 | ${Math.round(trendStrength * 10) / 10}/100 |`)
  lines.push(`| 波动率 | ${Math.round(volatilityPct * 10) / 10}% |`)
  lines.push(`| 支撑位 | ${Math.round(support * 100) / 100} 元/吨 |`)
  lines.push(`| 阻力位 | ${Math.round(resistance * 100) / 100} 元/吨 |`)
  lines.push('')
  lines.push(
    `**政策影响:** ${
      policyMult > 1
        ? '政策加严推高价格预期'
        : policyMult < 1
          ? '政策宽松压制价格上行'
          : '政策中性维持当前价格区间'
    }`,
  )
  lines.push('')
  lines.push('### 价格预测')
  lines.push('| 预测期 | 价格(元/吨) | 95%置信区间(低) | 95%置信区间(高) |')
  lines.push('|--------|-------------|------------------|------------------|')
  for (const f of forecasts) {
    lines.push(
      `| 第${f.period}期 | ${f.predicted_price} | ${f.confidence_low} | ${f.confidence_high} |`,
    )
  }
  lines.push('')
  lines.push('### 风险因素')
  for (const risk of riskFactors) lines.push(`- ${risk}`)
  lines.push('')
  lines.push('---')
  lines.push(`_${DISCLAIMER}_`)
  return lines.join('\n')
}

// ===========================================================================
// A "broken" tool that fails on first attempt to demonstrate retry logic
// ===========================================================================

let brokenToolCallCount = 0

function simulateBrokenTool(_input: string): string {
  brokenToolCallCount++
  if (brokenToolCallCount <= 1) {
    // First call returns invalid output (missing headers, no disclaimer)
    return 'Carbon price is 65 RMB/ton. The market looks good. Buy now.'
  }
  // Subsequent calls return valid output
  return simulateCarbonPricePredictor(_input)
}

// ===========================================================================
// Demo runner
// ===========================================================================

async function runDemo(): Promise<void> {
  const separator = '='.repeat(72)
  const thinSep = '-'.repeat(72)

  console.log(separator)
  console.log(' Loop Engineering Self-Verification Demo')
  console.log(' Carbon Trading: carbon_price_predictor')
  console.log(separator)
  console.log()

  // --- Demo 1: Normal execution with validation ----------
  console.log(thinSep)
  console.log(' DEMO 1: Normal execution with multi-validator verification')
  console.log(thinSep)
  console.log()

  const input = JSON.stringify({
    market: 'CN-ETS',
    allowance_type: 'CEA',
    historical_prices: [52, 55, 58, 54, 60, 63, 65, 62, 68, 70, 72, 75],
    forecast_periods: 6,
    policy_scenario: 'ambitious' as const,
    current_inventory: 50000,
  })

  const config1: LoopConfig = {
    maxRetries: 3,
    backoffMs: 500,
    validators: [
      markdownStructureValidator({ minHeaders: 2, requireTable: true }),
      disclaimerValidator(),
      noHallucinationMarkers(),
      keywordPresenceValidator({ anyOf: ['价格', '预测', '风险'] }),
      lengthValidator({ minChars: 100, minWords: 50 }),
    ],
    selfCritique: true,
    onRetry: (attempt: number, error: string) => {
      console.log(`  [Retry ${attempt}] Validation failed: ${error.slice(0, 80)}...`)
    },
  }

  const result1 = await executeWithLoop(
    'carbon_price_predictor',
    async (inp) => simulateCarbonPricePredictor(inp),
    input,
    config1,
  )

  printResult(result1)

  // --- Demo 2: Retry scenario with broken tool -----------
  console.log()
  console.log(thinSep)
  console.log(' DEMO 2: Retry scenario (tool fails on first attempt)')
  console.log(thinSep)
  console.log()

  brokenToolCallCount = 0 // Reset counter

  const config2: LoopConfig = {
    maxRetries: 3,
    backoffMs: 500,
    validators: [
      markdownStructureValidator({ minHeaders: 2 }),
      disclaimerValidator(),
    ],
    selfCritique: true,
    onRetry: (attempt: number, error: string) => {
      console.log(`  [Retry ${attempt}] Reason: ${error.slice(0, 80)}...`)
    },
  }

  const result2 = await executeWithLoop(
    'carbon_price_predictor (mock-fail)',
    async (inp) => simulateBrokenTool(inp),
    input,
    config2,
  )

  printResult(result2)

  // --- Demo 3: Max retries exceeded ----------------------
  console.log()
  console.log(thinSep)
  console.log(' DEMO 3: Max retries exceeded (always-invalid output)')
  console.log(thinSep)
  console.log()

  const config3: LoopConfig = {
    maxRetries: 2,
    backoffMs: 200,
    validators: [
      markdownStructureValidator({ minHeaders: 3 }),
      disclaimerValidator(),
    ],
    selfCritique: true,
    onRetry: (attempt: number, error: string) => {
      console.log(`  [Retry ${attempt}] Reason: ${error.slice(0, 80)}...`)
    },
  }

  const result3 = await executeWithLoop(
    'carbon_price_predictor (always-invalid)',
    async (_inp) => 'Price: 65 RMB. No risk.',
    input,
    config3,
  )

  printResult(result3)

  // --- Summary -------------------------------------------
  console.log()
  console.log(separator)
  console.log(' Demo Summary')
  console.log(separator)
  console.log(` Demo 1 (normal):       success=${result1.success}, score=${result1.finalScore}, attempts=${result1.attempts.length}`)
  console.log(` Demo 2 (retry):        success=${result2.success}, score=${result2.finalScore}, attempts=${result2.attempts.length}`)
  console.log(` Demo 3 (max retries):  success=${result3.success}, score=${result3.finalScore}, attempts=${result3.attempts.length}`)
  console.log(separator)
}

// ===========================================================================
// Result printer
// ===========================================================================

function printResult(result: LoopResult): void {
  console.log()
  console.log('  Result:')
  console.log('  ' + '-'.repeat(68))
  console.log(`  Success:       ${result.success}`)
  console.log(`  Final Score:   ${result.finalScore}/100`)
  console.log(`  Attempts:      ${result.attempts.length}`)
  console.log(`  Total Time:    ${result.totalDurationMs}ms`)
  console.log(`  Warnings:      ${result.warnings.length > 0 ? result.warnings.join('; ') : 'none'}`)
  console.log()
  console.log('  Attempts Detail:')
  for (const attempt of result.attempts) {
    const status = attempt.validationErrors.length === 0 ? 'PASS' : 'FAIL'
    const critique = attempt.critiqueScore !== undefined ? ` | critique: ${attempt.critiqueScore}` : ''
    console.log(
      `    #${attempt.attempt} [${status}] ${attempt.durationMs}ms | ${attempt.validationErrors.length} error(s)${critique}`,
    )
    if (attempt.validationErrors.length > 0) {
      for (const err of attempt.validationErrors) {
        console.log(`        - ${err}`)
      }
    }
  }
  console.log()
  console.log('  Output Preview (first 200 chars):')
  console.log('  ' + '-'.repeat(68))
  const preview = result.output.slice(0, 200).replace(/\n/g, '\n  ')
  console.log(`  ${preview}${result.output.length > 200 ? '...' : ''}`)
  console.log('  ' + '-'.repeat(68))
}

// ===========================================================================
// Run
// ===========================================================================

runDemo().catch((err) => {
  console.error('Demo failed:', err)
  process.exit(1)
})
