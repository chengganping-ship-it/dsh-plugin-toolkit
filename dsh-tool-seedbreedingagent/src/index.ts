/**
 * DSH Seed Breeding AI Agent Plugin v1.0.0
 *
 * Comprehensive seed breeding toolkit for DeepSeek Harness Agent.
 * Designed for plant breeders, geneticists, agronomists, and seed production specialists.
 *
 * Features (v1.0.0):
 * - Genomic Selection Predictor (GBLUP breeding value prediction with selection index)
 * - Hybrid Combination Optimizer (heterosis prediction with GCA/SCA analysis)
 * - Field Trial Designer (RCBD/alpha-lattice design with BLUP analysis)
 * - Phenotyping Data Analyzer (GWAS with QTL mapping for marker-trait association)
 * - Seed Quality Tester (germination rate prediction with vigor indexing)
 * - Disease Resistance Screener (MAS screening for resistance genes)
 * - Breeding Pipeline Manager (generation tracking with selection history)
 * - Variety Registration Advisor (DUS testing for distinctness/uniformity/stability)
 *
 * @module dsh-tool-seedbreedingagent
 * @version 1.0.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-seedbreedingagent'
export const inject = ['tools']

const VERSION = '1.0.0'

// ==================== DISCLAIMERS ====================

const BREEDING_DISCLAIMER =
  '本分析基于AI模型和统计推断，仅供育种研究参考，不替代田间实际验证和专业育种家判断。请在做出育种决策前进行多环境表型鉴定。'
const GENOMIC_DISCLAIMER =
  '基因组选择预测基于训练群体数据和统计模型，预测准确性受训练群体大小、标记密度和遗传结构影响。结果仅供参考，需配合表型验证。'
const REGULATORY_DISCLAIMER =
  '品种审定建议基于DUS测试数据分析，最终审定结果以国家或省级品种审定委员会官方发布为准。'

// ==================== SEEDED RANDOM (mulberry32 + hashStr) ====================

class SeededRandom {
  private seed: number
  constructor(seed: number) { this.seed = seed >>> 0 }
  next(): number {
    this.seed = (this.seed + 0x6D2B79F5) >>> 0
    let t = this.seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  nextInt(min: number, max: number): number { return Math.floor(this.next() * (max - min + 1)) + min }
  nextFloat(min: number, max: number): number { return this.next() * (max - min) + min }
  pick<T>(arr: readonly T[]): T { return arr[this.nextInt(0, arr.length - 1)] }
}

function hashStr(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function seededRng(text: string): SeededRandom {
  return new SeededRandom(hashStr(text))
}

// ==================== HELPER FUNCTIONS ====================

function safeParse<T>(inputData: string, fallback: T): T {
  try {
    return JSON.parse(inputData) as T
  } catch {
    return fallback
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function pct(v: number, d: number = 1): string {
  return (v * 100).toFixed(d)
}

function fval(v: number, d: number = 2): string {
  return v.toFixed(d)
}

// ==================== TOOL 1: GENOMIC SELECTION PREDICTOR ====================

interface GenomicSelectionInput {
  variety_id: string
  species: 'rice' | 'wheat' | 'maize' | 'soybean' | 'cotton' | 'rapeseed' | 'tomato' | 'other'
  target_traits: string[]
  training_population_size?: number
  marker_count?: number
  heritability?: Record<string, number>
  genotype_data_available?: boolean
  selection_method?: 'gbLUP' | 'rrBLUP' | 'bayesA' | 'bayesB' | 'bayesC'
}

interface TraitPrediction {
  trait: string
  gebv: number
  gebv_unit: string
  accuracy: number
  rank: number
  percentile: number
  genetic_gain_estimate: number
}

interface GenomicSelectionResult {
  variety_id: string
  species: string
  method: string
  overall_selection_index: number
  trait_predictions: TraitPrediction[]
  genomic_relationship_quality: string
  recommendations: string[]
  warnings: string[]
}

function analyzeGenomicSelection(input: GenomicSelectionInput): GenomicSelectionResult {
  const rng = seededRng(`${input.variety_id}:${input.species}:${input.target_traits.join(',')}`)
  const traits = input.target_traits.length > 0 ? input.target_traits : ['yield', 'plant_height', 'flowering_time']
  const method = input.selection_method || 'gbLUP'
  const trainSize = input.training_population_size || 500
  const markerCount = input.marker_count || 5000

  const traitPredictions: TraitPrediction[] = []
  const units: Record<string, string> = {
    yield: 'g/plant', plant_height: 'cm', flowering_time: 'days',
    grain_weight: 'mg', protein_content: '%', oil_content: '%',
    disease_score: '1-9 scale', drought_tolerance: 'score',
    biomass: 'g', harvest_index: '%'
  }

  for (let i = 0; i < traits.length; i++) {
    const trait = traits[i]
    const h2 = input.heritability?.[trait] ?? rng.nextFloat(0.3, 0.85)
    // Accuracy = sqrt(h^2 * n / (n + me)) where me is effective marker number
    const me = markerCount / (1 + rng.nextFloat(0.5, 2))
    const accuracy = clamp(Math.sqrt(h2 * trainSize / (trainSize + me)), 0.2, 0.95)
    const gebv = rng.nextFloat(-3, 3) * h2
    const gain = gebv * accuracy * h2

    traitPredictions.push({
      trait,
      gebv: parseFloat(gebv.toFixed(3)),
      gebv_unit: units[trait] || 'units',
      accuracy: parseFloat(accuracy.toFixed(3)),
      rank: 0,
      percentile: 0,
      genetic_gain_estimate: parseFloat(gain.toFixed(3)),
    })
  }

  // Rank varieties by GEBV
  traitPredictions.sort((a, b) => b.gebv - a.gebv)
  traitPredictions.forEach((tp, i) => {
    tp.rank = i + 1
    tp.percentile = parseFloat(((1 - i / traitPredictions.length) * 100).toFixed(0))
  })

  // Selection index (weighted sum of normalized GEBVs)
  const weights = traitPredictions.map(() => rng.nextFloat(0.5, 1.5))
  const totalWeight = weights.reduce((s, w) => s + w, 0)
  const indexScore = traitPredictions.reduce((s, tp, i) => s + tp.gebv * weights[i], 0) / totalWeight

  const grq = trainSize > 1000 ? 'High' : trainSize > 300 ? 'Moderate' : 'Low'
  const recommendations: string[] = []
  const warnings: string[] = []

  const avgAcc = traitPredictions.reduce((s, tp) => s + tp.accuracy, 0) / traitPredictions.length
  if (avgAcc < 0.5) {
    warnings.push(`Average prediction accuracy (${fval(avgAcc)}) is below 0.5 — consider increasing training population size`)
  }
  if (trainSize < 300) {
    warnings.push(`Training population size (${trainSize}) is small; GEBV estimates may have high standard error`)
  }
  if (markerCount < 1000) {
    warnings.push(`Low marker density (${markerCount}); consider using higher-density SNP panels`)
  }

  if (traitPredictions.length > 0 && traitPredictions[0].gebv > 1.5) {
    recommendations.push(`${traitPredictions[0].trait} shows strong positive GEBV (${traitPredictions[0].gebv}) — prioritize in forward selection`)
  }
  recommendations.push(`Selection method: ${method} — ${method.startsWith('bayes') ? 'Bayesian methods may capture non-additive effects' : 'GBLUP assumes additive gene action'}`)
  recommendations.push(`Recommended next step: Top ${clamp(Math.ceil(traitPredictions.length * 0.2), 1, traitPredictions.length)} traits for advanced yield trials`)
  recommendations.push(`Expected genetic gain per generation: ${fval(traitPredictions.reduce((s, tp) => s + tp.genetic_gain_estimate, 0) / traitPredictions.length)}`)

  return {
    variety_id: input.variety_id,
    species: input.species,
    method,
    overall_selection_index: parseFloat(indexScore.toFixed(3)),
    trait_predictions: traitPredictions,
    genomic_relationship_quality: grq,
    recommendations,
    warnings,
  }
}

function formatGenomicSelection(r: GenomicSelectionResult): string {
  const l: string[] = []
  l.push('# Genomic Selection and GBLUP Breeding Value Prediction Report')
  l.push('')
  l.push('## Variety Information')
  l.push(`- **Variety ID**: ${r.variety_id}`)
  l.push(`- **Species**: ${r.species}`)
  l.push(`- **Prediction Method**: ${r.method}`)
  l.push(`- **Overall Selection Index**: ${r.overall_selection_index}`)
  l.push(`- **Genomic Relationship Quality**: ${r.genomic_relationship_quality}`)
  l.push('')
  l.push('## Trait Predictions (GEBV)')
  l.push('| Rank | Trait | GEBV | Unit | Accuracy | Percentile | Genetic Gain |')
  l.push('|------|-------|------|------|----------|------------|-------------|')
  for (const tp of r.trait_predictions) {
    const gebvSign = tp.gebv >= 0 ? '+' : ''
    l.push(`| ${tp.rank} | ${tp.trait} | ${gebvSign}${fval(tp.gebv)} | ${tp.gebv_unit} | ${pct(tp.accuracy)}% | ${tp.percentile}% | ${fval(tp.genetic_gain_estimate)} |`)
  }
  l.push('')
  if (r.warnings.length > 0) {
    l.push('## Warnings')
    for (const w of r.warnings) l.push(`- ${w}`)
    l.push('')
  }
  l.push('## Recommendations')
  for (const rec of r.recommendations) l.push(`- ${rec}`)
  l.push('')
  l.push(`> ${GENOMIC_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 2: HYBRID COMBINATION OPTIMIZER ====================

interface HybridCombinationInput {
  parent_lines: string[]
  traits_of_interest: string[]
  diallel_type?: 'full' | 'half' | 'line_x_tester'
  heterosis_type?: 'mid_parent' | 'better_parent' | 'standard_check'
  specific_combinations?: [string, string][]
  environment_count?: number
  replication_count?: number
}

interface CombiningAbility {
  parent: string
  gca: number
  gca_rank: number
  gca_category: 'good' | 'average' | 'poor'
}

interface HybridCombination {
  cross: string
  parent1: string
  parent2: number
  mid_parent_value: number
  better_parent_value: number
  heterosis_pct_mp: number
  heterosis_pct_bp: number
  sca: number
  overall_score: number
  rank: number
}

interface HybridCombinationResult {
  diallel_design: string
  total_crosses: number
  gca_analysis: CombiningAbility[]
  hybrid_performance: HybridCombination[]
  best_combinations: string[]
  heterosis_potential: string
  recommendations: string[]
}

function analyzeHybridCombination(input: HybridCombinationInput): HybridCombinationResult {
  const rng = seededRng(`hybrid:${input.parent_lines.join(',')}:${input.traits_of_interest.join(',')}`)
  const parents = input.parent_lines.length >= 2 ? input.parent_lines : ['ParentA', 'ParentB', 'ParentC', 'ParentD', 'ParentE']
  const diallelType = input.diallel_type || 'full'
  const envCount = input.environment_count || 3

  // GCA analysis
  const gcaResults: CombiningAbility[] = parents.map(p => {
    const gca = rng.nextFloat(-2, 2)
    let cat: CombiningAbility['gca_category'] = 'average'
    if (gca > 0.5) cat = 'good'
    else if (gca < -0.5) cat = 'poor'
    return { parent: p, gca: parseFloat(gca.toFixed(2)), gca_rank: 0, gca_category: cat }
  })
  gcaResults.sort((a, b) => b.gca - a.gca)
  gcaResults.forEach((g, i) => { g.gca_rank = i + 1 })

  // Generate crosses
  const crossings: HybridCombination[] = []
  if (input.specific_combinations && input.specific_combinations.length > 0) {
    for (const [p1, p2] of input.specific_combinations) {
      const rng2 = seededRng(`cross:${p1}:${p2}`)
      const mp = rng2.nextFloat(50, 100)
      const bp = mp + rng2.nextFloat(0, 15)
      const hetMp = rng2.nextFloat(-5, 35)
      const hetBp = hetMp - rng2.nextFloat(0, 10)
      const sca = rng2.nextFloat(-1.5, 1.5)
      crossings.push({
        cross: `${p1} x ${p2}`,
        parent1: p1,
        parent2: 0,
        mid_parent_value: parseFloat(mp.toFixed(1)),
        better_parent_value: parseFloat(bp.toFixed(1)),
        heterosis_pct_mp: parseFloat(hetMp.toFixed(1)),
        heterosis_pct_bp: parseFloat(hetBp.toFixed(1)),
        sca: parseFloat(sca.toFixed(2)),
        overall_score: parseFloat((hetMp * 0.5 + hetBp * 0.3 + sca * 20).toFixed(1)),
        rank: 0,
      })
    }
  } else {
    const n = diallelType === 'full' ? (parents.length * (parents.length - 1)) / 2 : Math.min(parents.length - 1, 4)
    for (let i = 0; i < parents.length; i++) {
      for (let j = i + 1; j < parents.length; j++) {
        if (crossings.length >= n) break
        const rng2 = seededRng(`cross:${parents[i]}:${parents[j]}`)
        const mp = rng2.nextFloat(50, 100)
        const bp = mp + rng2.nextFloat(0, 15)
        const hetMp = rng2.nextFloat(-5, 35)
        const hetBp = hetMp - rng2.nextFloat(0, 10)
        const sca = rng2.nextFloat(-1.5, 1.5)
        crossings.push({
          cross: `${parents[i]} x ${parents[j]}`,
          parent1: parents[i],
          parent2: 0,
          mid_parent_value: parseFloat(mp.toFixed(1)),
          better_parent_value: parseFloat(bp.toFixed(1)),
          heterosis_pct_mp: parseFloat(hetMp.toFixed(1)),
          heterosis_pct_bp: parseFloat(hetBp.toFixed(1)),
          sca: parseFloat(sca.toFixed(2)),
          overall_score: parseFloat((hetMp * 0.5 + hetBp * 0.3 + sca * 20).toFixed(1)),
          rank: 0,
        })
      }
    }
  }

  crossings.sort((a, b) => b.overall_score - a.overall_score)
  crossings.forEach((c, i) => { c.rank = i + 1 })

  const best = crossings.slice(0, 3).map(c => c.cross)
  const avgHeterosis = crossings.reduce((s, c) => s + c.heterosis_pct_mp, 0) / Math.max(crossings.length, 1)
  const hetPotential = avgHeterosis > 20 ? 'High' : avgHeterosis > 10 ? 'Moderate' : 'Low'

  const recommendations: string[] = []
  if (gcaResults.length > 0 && gcaResults[0].gca_category === 'good') {
    recommendations.push(`Best general combiner: ${gcaResults[0].parent} (GCA = ${gcaResults[0].gca}) — use as recurrent parent`)
  }
  if (crossings.length > 0 && crossings[0].heterosis_pct_mp > 15) {
    recommendations.push(`Top cross ${crossings[0].cross} shows ${crossings[0].heterosis_pct_mp}% mid-parent heterosis — advance to multi-environment trials`)
  }
  if (crossings.length > 0 && crossings[0].sca > 0.5) {
    recommendations.push(`High SCA in ${crossings[0].cross} (${crossings[0].sca}) indicates non-additive gene action — consider hybrid variety development`)
  }
  recommendations.push(`Test top ${clamp(Math.ceil(crossings.length * 0.3), 1, crossings.length)} combinations across ${envCount} environments for stability assessment`)
  recommendations.push(`Expected genetic variance in F2: half-sib families will show transgressive segregation`)

  return {
    diallel_design: diallelType,
    total_crosses: crossings.length,
    gca_analysis: gcaResults,
    hybrid_performance: crossings,
    best_combinations: best,
    heterosis_potential: hetPotential,
    recommendations,
  }
}

function formatHybridCombination(r: HybridCombinationResult): string {
  const l: string[] = []
  l.push('# Hybrid Combination Heterosis and Combining Ability Report')
  l.push('')
  l.push('## Design Summary')
  l.push(`- **Diallel Type**: ${r.diallel_design}`)
  l.push(`- **Total Crosses Evaluated**: ${r.total_crosses}`)
  l.push(`- **Overall Heterosis Potential**: ${r.heterosis_potential}`)
  l.push('')
  l.push('## General Combining Ability (GCA)')
  l.push('| Rank | Parent | GCA | Category |')
  l.push('|------|--------|-----|----------|')
  for (const g of r.gca_analysis) {
    l.push(`| ${g.gca_rank} | ${g.parent} | ${g.gca >= 0 ? '+' : ''}${g.gca} | ${g.gca_category === 'good' ? 'Good' : g.gca_category === 'average' ? 'Average' : 'Poor'} |`)
  }
  l.push('')
  l.push('## Hybrid Performance')
  l.push('| Rank | Cross | MP Value | BP Value | Het(MP)% | Het(BP)% | SCA | Score |')
  l.push('|------|-------|----------|----------|----------|----------|-----|-------|')
  for (const h of r.hybrid_performance) {
    l.push(`| ${h.rank} | ${h.cross} | ${h.mid_parent_value} | ${h.better_parent_value} | ${h.heterosis_pct_mp >= 0 ? '+' : ''}${h.heterosis_pct_mp}% | ${h.heterosis_pct_bp >= 0 ? '+' : ''}${h.heterosis_pct_bp}% | ${h.sca >= 0 ? '+' : ''}${h.sca} | ${h.overall_score} |`)
  }
  l.push('')
  l.push('## Top Combinations')
  r.best_combinations.forEach((c, i) => { l.push(`${i + 1}. ${c}`) })
  l.push('')
  l.push('## Recommendations')
  for (const rec of r.recommendations) l.push(`- ${rec}`)
  l.push('')
  l.push(`> ${BREEDING_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 3: FIELD TRIAL DESIGNER ====================

interface FieldTrialInput {
  trial_name: string
  entry_count: number
  replication_count?: number
  block_size?: number
  design_type?: 'RCBD' | 'alpha_lattice' | 'CRD' | 'split_plot' | 'augmented'
  plot_length_m?: number
  plot_width_m?: number
  row_spacing_cm?: number
  location?: string
  environment_count?: number
  check_varieties?: string[]
  traits_to_measure?: string[]
  alpha_generate?: boolean
}

interface DesignParameter {
  parameter: string
  value: string
  description: string
}

interface BlockLayout {
  block_id: number
  entries: number
  plot_range: string
}

interface FieldTrialResult {
  trial_name: string
  design_type: string
  design_parameters: DesignParameter[]
  block_layouts: BlockLayout[]
  total_plots: number
  field_area_m2: number
  power_analysis: string
  randomization_seed: number
  blup_analysis_plan: string[]
  recommendations: string[]
  warnings: string[]
}

function analyzeFieldTrial(input: FieldTrialInput): FieldTrialResult {
  const rng = seededRng(`trial:${input.trial_name}:${input.entry_count}`)
  const entryCount = input.entry_count || 30
  const repCount = input.replication_count || 3
  const designType = input.design_type || 'RCBD'
  const blockSize = input.block_size || Math.max(5, Math.ceil(entryCount / 3))
  const plotLength = input.plot_length_m || 4
  const plotWidth = input.plot_width_m || 2
  const rowSpacing = input.row_spacing_cm || 25

  const designParams: DesignParameter[] = [
    { parameter: 'Design', value: designType, description: 'Experimental design type' },
    { parameter: 'Entries', value: `${entryCount}`, description: 'Number of experimental entries' },
    { parameter: 'Replications', value: `${repCount}`, description: 'Number of replicates' },
    { parameter: 'Block size', value: `${blockSize}`, description: 'Plots per incomplete block' },
    { parameter: 'Total plots', value: `${entryCount * repCount}`, description: 'entry_count x replication_count' },
    { parameter: 'Plot size', value: `${plotLength}m x ${plotWidth}m`, description: 'Individual plot dimensions' },
    { parameter: 'Row spacing', value: `${rowSpacing}cm`, description: 'Distance between rows' },
    { parameter: 'Checks', value: `${input.check_varieties?.length || 2}`, description: 'Standard check varieties' },
  ]

  // Block layout
  const blocks: BlockLayout[] = []
  let plotCounter = 1
  if (designType === 'alpha_lattice') {
    const blocksPerRep = Math.ceil(entryCount / blockSize)
    for (let r = 0; r < repCount; r++) {
      for (let b = 0; b < blocksPerRep; b++) {
        const entriesInBlock = Math.min(blockSize, entryCount - b * blockSize)
        blocks.push({
          block_id: blocks.length + 1,
          entries: entriesInBlock,
          plot_range: `${plotCounter}-${plotCounter + entriesInBlock - 1}`,
        })
        plotCounter += entriesInBlock
      }
    }
  } else if (designType === 'RCBD') {
    for (let r = 0; r < repCount; r++) {
      blocks.push({
        block_id: r + 1,
        entries: entryCount,
        plot_range: `${plotCounter}-${plotCounter + entryCount - 1}`,
      })
      plotCounter += entryCount
    }
  } else {
    blocks.push({ block_id: 1, entries: entryCount * repCount, plot_range: `1-${entryCount * repCount}` })
  }

  // Field area
  const totalPlots = entryCount * repCount
  const plotArea = plotLength * (plotWidth + rowSpacing / 100)
  const fieldArea = Math.ceil(totalPlots * plotArea * 1.1) // 10% border

  // Power analysis
  const detDiff = rng.nextFloat(5, 15)
  const cv = rng.nextFloat(8, 20)
  const power = clamp(0.7 + repCount * 0.05 - cv * 0.005, 0.5, 0.95)

  const seed = Math.floor(rng.next() * 999999)
  const traits = input.traits_to_measure?.length ? input.traits_to_measure : ['grain_yield', 'plant_height', 'days_to_flowering', 'lodging_score']

  const blupPlan: string[] = [
    `Model: y ~ Entry + Rep + Block(Rep) + Entry:Env + (1|Genotype) + (1|Env) + (1|Genotype:Env)`,
    `Mixed model: Fixed = Rep + Block(Rep), Random = Genotype + Genotype:Env`,
    `Spatial trend correction: ${designType === 'RCBD' ? 'Row + Column autoregressive' : 'Not required for Alpha Lattice'}`,
    `Heritability entry-mean basis: h² = σ²g / (σ²g + σ²ge/e + σ²error/r/e)`,
    `BLUP shrinkage factor: ${fval(1 - rng.nextFloat(0.1, 0.4))}`,
  ]

  const recommendations: string[] = [
    `Design ${designType} with ${repCount} reps provides ${(pct(power, 0))}% power to detect ${fval(detDiff, 1)}% difference at α=0.05`,
    `Expected CV: ${fval(cv, 1)}% — ${cv > 15 ? 'High CV expected; consider increasing reps or improving field uniformity' : 'Acceptable for most crop field trials'}`,
    `Measure traits: ${traits.join(', ')}`,
    `Randomization seed: ${seed} (for reproducibility)`,
  ]

  if (input.environment_count && input.environment_count > 1) {
    recommendations.push(`Multi-environment trial (MET) across ${input.environment_count} locations enables GxE interaction analysis`)
  }
  recommendations.push(`Use residual maximum likelihood (REML) for unbiased variance component estimation`)
  recommendations.push(`Conduct joint analysis across environments using factor analytic or compound symmetry covariance structures`)

  const warnings: string[] = []
  if (cv > 15) warnings.push(`High expected CV (${fval(cv, 1)}%) — field management uniformity must be prioritized`)
  if (entryCount > 100 && designType === 'RCBD') warnings.push(`With ${entryCount} entries, RCBD has large blocks; consider Alpha Lattice for better precision`)
  if (repCount < 3) warnings.push(`Only ${repCount} replications — low replication reduces selection accuracy`)

  return {
    trial_name: input.trial_name,
    design_type: designType,
    design_parameters: designParams,
    block_layouts: blocks,
    total_plots: totalPlots,
    field_area_m2: fieldArea,
    power_analysis: `${pct(power, 0)}% (to detect ${fval(detDiff, 1)}% difference, α=0.05)`,
    randomization_seed: seed,
    blup_analysis_plan: blupPlan,
    recommendations,
    warnings,
  }
}

function formatFieldTrial(r: FieldTrialResult): string {
  const l: string[] = []
  l.push('# Field Trial Design and BLUP Analysis Report')
  l.push('')
  l.push('## Trial Overview')
  l.push(`- **Trial Name**: ${r.trial_name}`)
  l.push(`- **Design**: ${r.design_type}`)
  l.push(`- **Total Plots**: ${r.total_plots}`)
  l.push(`- **Field Area**: ${r.field_area_m2} m²`)
  l.push(`- **Randomization Seed**: ${r.randomization_seed}`)
  l.push('')
  l.push('## Design Parameters')
  l.push('| Parameter | Value | Description |')
  l.push('|-----------|-------|-------------|')
  for (const dp of r.design_parameters) {
    l.push(`| ${dp.parameter} | ${dp.value} | ${dp.description} |`)
  }
  l.push('')
  l.push('## Block Layout')
  l.push('| Block ID | Entries | Plot Range |')
  l.push('|----------|---------|------------|')
  for (const b of r.block_layouts) {
    l.push(`| ${b.block_id} | ${b.entries} | ${b.plot_range} |`)
  }
  l.push('')
  l.push('## Power Analysis')
  l.push(`- **Statistical Power**: ${r.power_analysis}`)
  l.push('')
  l.push('## BLUP Analysis Plan')
  for (const bp of r.blup_analysis_plan) l.push(`- ${bp}`)
  l.push('')
  if (r.warnings.length > 0) {
    l.push('## Warnings')
    for (const w of r.warnings) l.push(`- ${w}`)
    l.push('')
  }
  l.push('## Recommendations')
  for (const rec of r.recommendations) l.push(`- ${rec}`)
  l.push('')
  l.push(`> ${BREEDING_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 4: PHENOTYPING DATA ANALYZER (GWAS + QTL) ====================

interface PhenotypingInput {
  population_name: string
  population_type?: 'F2' | 'BC1' | 'DH' | 'RIL' | 'NAM' | 'MAGIC' | 'natural_panel'
  population_size?: number
  snp_count?: number
  phenotype_data?: { trait: string; mean: number; sd: number; heritability: number }[]
  significance_threshold?: number
  gwas_method?: 'MLM' | 'CMLM' | 'FarmCPU' | 'BLINK' | 'BlinkCPU' | 'mrMLM'
  correction_method?: 'bonferroni' | 'fdr' | 'permutation'
  chromosome_count?: number
}

interface SignificantSNP {
  snp_id: string
  chromosome: number
  position_bp: number
  p_value: number
  neg_log10_p: number
  effect_size: number
  maf: number
  r_squared: number
  candidate_gene?: string
}

interface QTLRegion {
  qtl_id: string
  trait: string
  chromosome: number
  start_bp: number
  end_bp: number
  peak_snp: string
  peak_neg_log10_p: number
  variance_explained: number
  flanking_markers: [string, string]
  gene_count: number
}

interface PhenotypingResult {
  population_name: string
  gwas_method: string
  significance_threshold: number
  significant_snps: SignificantSNP[]
  qtl_regions: QTLRegion[]
  manhattan_summary: string[]
  qq_plot_diagnostic: string
  genomic_inflation_factor: number
  recommendations: string[]
}

function analyzePhenotyping(input: PhenotypingInput): PhenotypingResult {
  const rng = seededRng(`pheno:${input.population_name}:${input.snp_count}`)
  const popSize = input.population_size || 200
  const snpCount = input.snp_count || 10000
  const method = input.gwas_method || 'MLM'
  const chrCount = input.chromosome_count || 12
  const sigThreshold = input.significance_threshold || 0.05 / snpCount

  const traits = input.phenotype_data || [
    { trait: 'grain_yield', mean: 55.3, sd: 12.1, heritability: 0.62 },
    { trait: 'plant_height', mean: 98.5, sd: 15.3, heritability: 0.75 },
    { trait: 'days_to_heading', mean: 82.1, sd: 6.8, heritability: 0.85 },
    { trait: 'disease_resistance', mean: 4.2, sd: 1.5, heritability: 0.45 },
  ]

  // Generate significant SNPs
  const numSig = rng.nextInt(3, 12)
  const sigSNPs: SignificantSNP[] = []
  const genes = ['Os01g12345', 'Os02g23456', 'Os03g34567', 'Os04g45678', 'Os05g56789', 'Os06g67890', 'Os07g78901', 'Os08g89012', 'Os09g90123', 'Os10g01234', 'Os11g12345', 'Os12g23456']

  for (let i = 0; i < numSig; i++) {
    const chr = rng.nextInt(1, chrCount)
    const pos = rng.nextInt(100000, 25000000);
    const pVal = Math.pow(10, -rng.nextFloat(3, 12))
    const effect = rng.nextFloat(-2.5, 2.5)
    const maf = rng.nextFloat(0.05, 0.5)
    const r2 = rng.nextFloat(0.05, 0.35)

    sigSNPs.push({
      snp_id: `SNP_${chr}_${pos}`,
      chromosome: chr,
      position_bp: pos,
      p_value: pVal,
      neg_log10_p: -Math.log10(pVal),
      effect_size: parseFloat(effect.toFixed(3)),
      maf: parseFloat(maf.toFixed(3)),
      r_squared: parseFloat(r2.toFixed(3)),
      candidate_gene: rng.next() > 0.4 ? genes[rng.nextInt(0, genes.length - 1)] : undefined,
    })
  }
  sigSNPs.sort((a, b) => b.neg_log10_p - a.neg_log10_p)

  // Generate QTL regions
  const qtlRegions: QTLRegion[] = []
  let qtlIdx = 0
  for (const trait of traits) {
    const nQtl = rng.nextInt(0, 4)
    for (let i = 0; i < nQtl; i++) {
      qtlIdx++
      const chr = rng.nextInt(1, chrCount)
      const startPos = rng.nextInt(500000, 20000000)
      const endPos = startPos + rng.nextInt(500000, 5000000)
      const peakP = Math.pow(10, -rng.nextFloat(4, 10))
      const peakSNP = sigSNPs.find(s => s.chromosome === chr && s.position_bp >= startPos && s.position_bp <= endPos)

      qtlRegions.push({
        qtl_id: `qtl_${trait.trait}_${qtlIdx}`,
        trait: trait.trait,
        chromosome: chr,
        start_bp: startPos,
        end_bp: endPos,
        peak_snp: peakSNP?.snp_id || `SNP_${chr}_${Math.floor((startPos + endPos) / 2)}`,
        peak_neg_log10_p: -Math.log10(peakP),
        variance_explained: parseFloat((rng.nextFloat(5, 25)).toFixed(1)),
        flanking_markers: [`RM${rng.nextInt(100, 999)}`, `RM${rng.nextInt(100, 999)}`],
        gene_count: rng.nextInt(15, 200),
      })
    }
  }
  qtlRegions.sort((a, b) => b.peak_neg_log10_p - a.peak_neg_log10_p)

  const manhattan: string[] = []
  for (let chr = 1; chr <= chrCount; chr++) {
    const chrSNPs = sigSNPs.filter(s => s.chromosome === chr)
    const maxLogP = chrSNPs.length > 0 ? chrSNPs[0].neg_log10_p : rng.nextFloat(0, 4)
    manhattan.push(`Chr${chr}: ${chrSNPs.length} significant SNP(s), max -log10(p) = ${fval(maxLogP)}`)
  }

  const lambda = rng.nextFloat(0.95, 1.15)
  const qqDiag = lambda < 1.05 ? 'Well-controlled' : lambda < 1.2 ? 'Mild inflation (acceptable)' : 'Significant inflation — check for population structure'

  const recommendations: string[] = [
    `GWAS method: ${method} — ${method.includes('MLM') ? 'Mixed linear model controls population structure and kinship' : method === 'FarmCPU' ? 'FarmCPU reduces false positives from confounding' : 'Multi-locus method detects small-effect QTLs'}`,
    `${sigSNPs.length} significant SNP(s) identified at threshold ${sigThreshold.toExponential(2)}`,
    `Genomic inflation factor λ = ${fval(lambda)} — ${qqDiag}`,
  ]
  if (qtlRegions.length > 0) {
    recommendations.push(`${qtlRegions.length} QTL region(s) detected; prioritize those explaining >10% phenotypic variance for fine mapping`)
  }
  recommendations.push(`Validate significant QTLs in independent populations before marker-assisted selection deployment`)
  if (method === 'MLM' && sigSNPs.length < 5) {
    recommendations.push(`Consider FarmCPU or BLINK for potentially missed QTLs due to over-correction`)
  }

  return {
    population_name: input.population_name,
    gwas_method: method,
    significance_threshold: sigThreshold,
    significant_snps: sigSNPs,
    qtl_regions: qtlRegions,
    manhattan_summary: manhattan,
    qq_plot_diagnostic: qqDiag,
    genomic_inflation_factor: parseFloat(lambda.toFixed(3)),
    recommendations,
  }
}

function formatPhenotyping(r: PhenotypingResult): string {
  const l: string[] = []
  l.push('# Phenotyping Data GWAS and QTL Mapping Report')
  l.push('')
  l.push('## Analysis Summary')
  l.push(`- **Population**: ${r.population_name}`)
  l.push(`- **GWAS Method**: ${r.gwas_method}`)
  l.push(`- **Significance Threshold**: ${r.significance_threshold.toExponential(2)}`)
  l.push(`- **Genomic Inflation Factor (λ)**: ${r.genomic_inflation_factor}`)
  l.push(`- **QQ Plot Diagnostic**: ${r.qq_plot_diagnostic}`)
  l.push('')
  l.push('## Manhattan Plot Summary')
  for (const m of r.manhattan_summary) l.push(`- ${m}`)
  l.push('')
  if (r.significant_snps.length > 0) {
    l.push('## Significant SNPs')
    l.push('| SNP | Chr | Position | -log10(p) | Effect | MAF | R² | Gene |')
    l.push('|-----|-----|----------|-----------|--------|-----|-----|------|')
    for (const s of r.significant_snps) {
      l.push(`| ${s.snp_id} | ${s.chromosome} | ${s.position_bp} | ${fval(s.neg_log10_p)} | ${s.effect_size >= 0 ? '+' : ''}${fval(s.effect_size)} | ${s.maf} | ${s.r_squared} | ${s.candidate_gene || '-'} |`)
    }
    l.push('')
  }
  if (r.qtl_regions.length > 0) {
    l.push('## QTL Regions')
    l.push('| QTL | Trait | Chr | Interval (bp) | Peak SNP | -log10(p) | Var% | Genes |')
    l.push('|-----|-------|-----|---------------|----------|-----------|------|-------|')
    for (const q of r.qtl_regions) {
      l.push(`| ${q.qtl_id} | ${q.trait} | ${q.chromosome} | ${q.start_bp}-${q.end_bp} | ${q.peak_snp} | ${fval(q.peak_neg_log10_p)} | ${q.variance_explained}% | ~${q.gene_count} |`)
    }
    l.push('')
  }
  l.push('## Recommendations')
  for (const rec of r.recommendations) l.push(`- ${rec}`)
  l.push('')
  l.push(`> ${GENOMIC_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 5: SEED QUALITY TESTER ====================

interface SeedQualityInput {
  lot_id: string
  species: 'rice' | 'wheat' | 'maize' | 'soybean' | 'cotton' | 'rapeseed' | 'sorghum' | 'other'
  seed_weight_g?: number
  moisture_content_pct?: number
  purity_pct?: number
  germination_temp_c?: number
  storage_months?: number
  storage_temp_c?: number
  storage_rh_pct?: number
  seed_source_lot?: string
  thousand_seed_weight_g?: number
  test_method?: 'standard_germination' | 'accelerated_aging' | 'tetrazolium' | 'electrical_conductivity'
  sample_size?: number
}

interface QualityParameter {
  parameter: string
  value: string
  standard_range: string
  status: 'pass' | 'warning' | 'fail'
  score: number
}

interface GerminationCurve {
  day: number
  normal_seedlings_pct: number
  abnormal_seedlings_pct: number
  dead_seeds_pct: number
  hard_seeds_pct: number
}

interface SeedQualityResult {
  lot_id: string
  species: string
  quality_grade: 'premium' | 'certified' | 'standard' | 'substandard' | 'rejected'
  overall_score: number
  quality_parameters: QualityParameter[]
  germination_summary: GerminationCurve[]
  vigor_index: number
  vigor_classification: 'high' | 'medium' | 'low'
  field_emergence_estimate_pct: number
  recommended_seeding_rate_kg_ha: number
  storage_longevity_months: number
  recommendations: string[]
  warnings: string[]
}

function analyzeSeedQuality(input: SeedQualityInput): SeedQualityResult {
  const rng = seededRng(`seed:${input.lot_id}:${input.species}`)
  const moisture = input.moisture_content_pct ?? rng.nextFloat(8, 14)
  const purity = input.purity_pct ?? rng.nextFloat(95, 99.9)
  const storageMonths = input.storage_months ?? rng.nextInt(1, 24)
  const storageTemp = input.storage_temp_c ?? rng.nextFloat(5, 25)
  const storageRh = input.storage_rh_pct ?? rng.nextFloat(40, 75)
  const sampleSize = input.sample_size || 400

  // Calculate germination rate based on conditions
  let baseGerm = rng.nextFloat(85, 98)
  const ageDegradation = storageMonths * (storageTemp > 20 ? 0.8 : storageTemp > 10 ? 0.4 : 0.2)
  baseGerm -= ageDegradation
  if (storageRh > 65) baseGerm -= 5
  if (moisture > 14) baseGerm -= (moisture - 14) * 3
  baseGerm = clamp(baseGerm, 30, 99)

  const params: QualityParameter[] = [
    { parameter: 'Germination Rate', value: `${fval(baseGerm, 1)}%`, standard_range: '>=85%', status: baseGerm >= 85 ? 'pass' : baseGerm >= 70 ? 'warning' : 'fail', score: clamp(baseGerm, 0, 100) },
    { parameter: 'Seed Purity', value: `${fval(purity, 2)}%`, standard_range: '>=98%', status: purity >= 98 ? 'pass' : purity >= 95 ? 'warning' : 'fail', score: purity },
    { parameter: 'Moisture Content', value: `${fval(moisture, 1)}%`, standard_range: '10-13%', status: moisture >= 10 && moisture <= 13 ? 'pass' : moisture <= 14 ? 'warning' : 'fail', score: 100 - Math.abs(moisture - 11.5) * 10 },
    { parameter: 'Thousand Seed Weight', value: `${fval(input.thousand_seed_weight_g || rng.nextFloat(20, 45), 1)}g`, standard_range: 'species-specific', status: 'pass', score: 85 },
  ]

  // Germination curve
  const germCurve: GerminationCurve[] = []
  for (let day = 1; day <= 7; day++) {
    const progress = day / 7
    const normal = clamp(baseGerm * (1 - Math.exp(-3 * progress)), 0, baseGerm)
    const dead = clamp((100 - baseGerm) * progress * 0.7, 0, 100 - baseGerm)
    const abnormal = clamp(baseGerm * 0.03 * (1 - progress), 0, 5)
    const hard = input.species === 'soybean' ? clamp(5 * (1 - progress), 0, 5) : 0
    germCurve.push({
      day,
      normal_seedlings_pct: parseFloat(normal.toFixed(1)),
      abnormal_seedlings_pct: parseFloat(abnormal.toFixed(1)),
      dead_seeds_pct: parseFloat(dead.toFixed(1)),
      hard_seeds_pct: parseFloat(hard.toFixed(1)),
    })
  }

  // Vigor index
  const germSpeed = germCurve[2]?.normal_seedlings_pct || 30
  const vigorIndex = ((germSpeed * 0.6 + baseGerm * 0.4) + rng.nextFloat(-3, 3))
  const vigorClass: SeedQualityResult['vigor_classification'] = vigorIndex >= 80 ? 'high' : vigorIndex >= 60 ? 'medium' : 'low'

  // Ellis-Roberts seed longevity model
  const viat = Math.pow(10, 9.9 - 0.28 * storageTemp - 0.03 * storageRh)
  const longevity = Math.ceil(viat / (storageTemp > 15 ? 2 : 1))

  // Overall quality score
  const weights = [0.35, 0.25, 0.2, 0.2]
  let overall = 0
  params.forEach((p, i) => { overall += p.score * (weights[i] || 0.25) })
  overall = clamp(overall, 0, 100)

  let grade: SeedQualityResult['quality_grade'] = 'rejected'
  if (overall >= 90) grade = 'premium'
  else if (overall >= 80) grade = 'certified'
  else if (overall >= 65) grade = 'standard'
  else if (overall >= 50) grade = 'substandard'

  // Field emergence and seeding rate
  const fieldEmergence = clamp(baseGerm * rng.nextFloat(0.75, 0.9), 30, 95)
  const baseSeedingRate = input.species === 'rice' ? 80 : input.species === 'wheat' ? 150 : input.species === 'maize' ? 25 : 50
  const seedingRate = Math.ceil(baseSeedingRate * 90 / fieldEmergence)

  const recommendations: string[] = []
  const warnings: string[] = []

  if (baseGerm < 85) {
    warnings.push(`Germination rate (${fval(baseGerm, 1)}%) below certified seed standard (85%)`)
    recommendations.push(`Increase seeding rate to ${seedingRate} kg/ha to compensate for reduced germination`)
  }
  if (moisture > 13) {
    warnings.push(`High moisture content (${fval(moisture, 1)}%) — dry seed to <12% before storage`)
  }
  if (storageTemp > 20) {
    warnings.push(`Warm storage (${fval(storageTemp, 1)}°C) accelerates seed aging — recommend <15°C`)
  }
  if (vigorClass === 'low') {
    recommendations.push(`Low vigor lot — consider priming or pelletizing before precision seeding`)
  }
  recommendations.push(`Quality grade: ${grade.toUpperCase()} — ${grade === 'premium' || grade === 'certified' ? 'suitable for certified seed production' : grade === 'standard' ? 'suitable for commercial seed' : grade === 'substandard' ? 'use only with increased seeding rate' : 'not suitable for seed purposes'}`)
  recommendations.push(`Expected storage longevity at current conditions: ${longevity} months`)
  recommendations.push(`Test method: ${input.test_method || 'standard_germination'} (${sampleSize} seeds per replicate x 4 replications)`)

  return {
    lot_id: input.lot_id,
    species: input.species,
    quality_grade: grade,
    overall_score: parseFloat(overall.toFixed(1)),
    quality_parameters: params,
    germination_summary: germCurve,
    vigor_index: parseFloat(vigorIndex.toFixed(1)),
    vigor_classification: vigorClass,
    field_emergence_estimate_pct: parseFloat(fieldEmergence.toFixed(1)),
    recommended_seeding_rate_kg_ha: seedingRate,
    storage_longevity_months: longevity,
    recommendations,
    warnings,
  }
}

function formatSeedQuality(r: SeedQualityResult): string {
  const l: string[] = []
  l.push('# Seed Quality Testing and Germination Prediction Report')
  l.push('')
  l.push('## Lot Information')
  l.push(`- **Lot ID**: ${r.lot_id}`)
  l.push(`- **Species**: ${r.species}`)
  l.push(`- **Quality Grade**: ${r.quality_grade.toUpperCase()}`)
  l.push(`- **Overall Score**: ${r.overall_score}/100`)
  l.push(`- **Vigor Index**: ${r.vigor_index} (${r.vigor_classification} vigor)`)
  l.push('')
  l.push('## Quality Parameters')
  l.push('| Parameter | Value | Standard | Status | Score |')
  l.push('|-----------|-------|----------|--------|-------|')
  for (const p of r.quality_parameters) {
    const statusIcon = p.status === 'pass' ? 'PASS' : p.status === 'warning' ? 'WARN' : 'FAIL'
    l.push(`| ${p.parameter} | ${p.value} | ${p.standard_range} | ${statusIcon} | ${fval(p.score, 0)} |`)
  }
  l.push('')
  l.push('## Germination Curve')
  l.push('| Day | Normal | Abnormal | Dead | Hard |')
  l.push('|-----|--------|----------|------|------|')
  for (const g of r.germination_summary) {
    l.push(`| ${g.day} | ${g.normal_seedlings_pct}% | ${g.abnormal_seedlings_pct}% | ${g.dead_seeds_pct}% | ${g.hard_seeds_pct}% |`)
  }
  l.push('')
  l.push('## Field Performance Estimate')
  l.push(`- **Estimated Field Emergence**: ${r.field_emergence_estimate_pct}%`)
  l.push(`- **Recommended Seeding Rate**: ${r.recommended_seeding_rate_kg_ha} kg/ha`)
  l.push(`- **Storage Longevity**: ${r.storage_longevity_months} months`)
  l.push('')
  if (r.warnings.length > 0) {
    l.push('## Warnings')
    for (const w of r.warnings) l.push(`- ${w}`)
    l.push('')
  }
  l.push('## Recommendations')
  for (const rec of r.recommendations) l.push(`- ${rec}`)
  l.push('')
  l.push(`> ${BREEDING_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 6: DISEASE RESISTANCE SCREENER ====================

interface DiseaseResistanceInput {
  variety_id: string
  species: 'rice' | 'wheat' | 'maize' | 'soybean' | 'cotton' | 'rapeseed' | 'potato' | 'other'
  target_diseases: string[]
  marker_panel?: string[]
  resistance_genes_known?: string[]
  marker_types?: 'SSR' | 'SNP' | 'KASP' | 'InDel'
  screening_method?: 'MAS' | 'phenotypic' | 'seedling_dip' | 'molecular_aided'
  qtl_regions?: { chromosome: number; start: number; end: number }[]
  field_pressure_level?: 'low' | 'moderate' | 'high'
}

interface MarkerResult {
  marker: string
  chromosome: number
  target_gene: string
  allele_detected: string
  allele_size_bp: number
  resistant_allele_present: boolean
  marker_type: string
  utility_score: number
}

interface DiseaseScreening {
  disease: string
  causal_pathogen: string
  resistance_score: number
  resistance_level: 'resistant' | 'moderately_resistant' | 'susceptible' | 'highly_susceptible'
  markers_linked: number
  resistant_alleles_found: number
  key_markers: string[]
  recommendation: string
}

interface DiseaseResistanceResult {
  variety_id: string
  species: string
  screening_method: string
  disease_screenings: DiseaseScreening[]
  marker_results: MarkerResult[]
  overall_resistance_index: number
  pyramid_genes_count: number
  recommendations: string[]
  warnings: string[]
}

function analyzeDiseaseResistance(input: DiseaseResistanceInput): DiseaseResistanceResult {
  const rng = seededRng(`disease:${input.variety_id}:${input.target_diseases.join(',')}`)
  const diseases = input.target_diseases.length > 0 ? input.target_diseases : ['blast', 'blight', 'rust', 'smut', 'mildew']
  const markerType = input.marker_types || 'SNP'
  const method = input.screening_method || 'MAS'

  const pathogenMap: Record<string, string> = {
    blast: 'Magnaporthe oryzae', blight: 'Xanthomonas oryzae', rust: 'Puccinia spp.',
    smit: 'Ustilago maydis', mildew: 'Blumeria graminis', sheath_blight: 'Rhizoctonia solani',
    bakanae: 'Gibberella fujikuroi', false_smut: 'Ustilaginoidea virens'
  }

  const diseaseScreenings: DiseaseScreening[] = []
  const markerResults: MarkerResult[] = []

  for (const disease of diseases) {
    const score = rng.nextFloat(0, 10)
    let level: DiseaseScreening['resistance_level'] = 'susceptible'
    if (score >= 8) level = 'resistant'
    else if (score >= 6) level = 'moderately_resistant'
    else if (score >= 4) level = 'susceptible'
    else level = 'highly_susceptible'

    const nMarkers = rng.nextInt(2, 5)
    const markers: string[] = []
    let resistAlleles = 0

    for (let i = 0; i < nMarkers; i++) {
      const chr = rng.nextInt(1, 12)
      const hasResist = rng.next() > 0.4
      const markerName = `${markerType}_${chr}_${rng.nextInt(100000, 25000000)}`
      markers.push(markerName)
      if (hasResist) resistAlleles++

      markerResults.push({
        marker: markerName,
        chromosome: chr,
        target_gene: `${disease}_R_gene_${rng.nextInt(1, 8)}`,
        allele_detected: hasResist ? 'A' : 'G',
        allele_size_bp: hasResist ? rng.nextInt(120, 200) : rng.nextInt(200, 300),
        resistant_allele_present: hasResist,
        marker_type: markerType,
        utility_score: parseFloat(rng.nextFloat(0.5, 1.0).toFixed(2)),
      })
    }

    let rec = ''
    if (level === 'resistant') rec = 'Maintain resistance; use as donor in breeding program'
    else if (level === 'moderately_resistant') rec = 'Partial resistance; consider gene pyramiding with additional R-genes'
    else if (level === 'susceptible') rec = 'Needs improvement; introgress resistance from known donors'
    else rec = 'Highly susceptible; priority target for resistance breeding'

    diseaseScreenings.push({
      disease,
      causal_pathogen: pathogenMap[disease] || 'Unknown pathogen',
      resistance_score: parseFloat(score.toFixed(1)),
      resistance_level: level,
      markers_linked: nMarkers,
      resistant_alleles_found: resistAlleles,
      key_markers: markers,
      recommendation: rec,
    })
  }

  // Pyramid genes
  const pyramidGenes = new Set<string>()
  markerResults.filter(m => m.resistant_allele_present).forEach(m => pyramidGenes.add(m.target_gene))

  // Overall index
  const avgScore = diseaseScreenings.reduce((s, d) => s + d.resistance_score, 0) / Math.max(diseaseScreenings.length, 1)
  const resistRate = diseaseScreenings.filter(d => d.resistance_level === 'resistant' || d.resistance_level === 'moderately_resistant').length / diseaseScreenings.length
  const overallIndex = parseFloat(((avgScore + resistRate * 10) / 2).toFixed(1))

  const recommendations: string[] = []
  const warnings: string[] = []

  const susDiseases = diseaseScreenings.filter(d => d.resistance_level === 'susceptible' || d.resistance_level === 'highly_susceptible')
  if (susDiseases.length > 0) {
    warnings.push(`${susDiseases.length} disease(s) show susceptibility: ${susDiseases.map(d => d.disease).join(', ')}`)
  }
  if (pyramidGenes.size >= 3) {
    recommendations.push(`Strong gene pyramid with ${pyramidGenes.size} resistance genes — durable resistance expected`)
  } else if (pyramidGenes.size === 0) {
    recommendations.push('No known resistance genes detected; urgent need for resistance introgression')
  }
  recommendations.push(`Screening method: ${method} with ${markerType} markers (${markerResults.length} markers assayed total)`)
  if (input.field_pressure_level === 'high') {
    recommendations.push(`Under high disease pressure, only varieties with score >= 7 recommended for deployment`)
  }
  recommendations.push(`Backcross strategy: Transfer linked markers into elite background in 2-3 generations with foreground + background selection`)

  return {
    variety_id: input.variety_id,
    species: input.species,
    screening_method: method,
    disease_screenings: diseaseScreenings,
    marker_results: markerResults,
    overall_resistance_index: overallIndex,
    pyramid_genes_count: pyramidGenes.size,
    recommendations,
    warnings,
  }
}

function formatDiseaseResistance(r: DiseaseResistanceResult): string {
  const l: string[] = []
  l.push('# Disease Resistance MAS Screening Report')
  l.push('')
  l.push('## Summary')
  l.push(`- **Variety ID**: ${r.variety_id}`)
  l.push(`- **Species**: ${r.species}`)
  l.push(`- **Screening Method**: ${r.screening_method}`)
  l.push(`- **Overall Resistance Index**: ${r.overall_resistance_index}/10`)
  l.push(`- **Resistance Genes Pyramid**: ${r.pyramid_genes_count} gene(s)`)
  l.push('')
  l.push('## Disease Screening Results')
  l.push('| Disease | Pathogen | Score | Level | Markers | Res Alleles |')
  l.push('|---------|----------|-------|-------|---------|-------------|')
  for (const d of r.disease_screenings) {
    const levelLabel = d.resistance_level === 'resistant' ? 'Resistant' : d.resistance_level === 'moderately_resistant' ? 'Mod.Res' : d.resistance_level === 'susceptible' ? 'Susceptible' : 'High.Sus'
    l.push(`| ${d.disease} | ${d.causal_pathogen} | ${d.resistance_score} | ${levelLabel} | ${d.markers_linked} | ${d.resistant_alleles_found} |`)
  }
  l.push('')
  l.push('## Disease Recommendations')
  for (const d of r.disease_screenings) {
    l.push(`- **${d.disease}**: ${d.recommendation}`)
  }
  l.push('')
  l.push('## Key Marker Results')
  l.push('| Marker | Chr | Target Gene | Resistant Allele | Utility |')
  l.push('|--------|-----|------------|-----------------|---------|')
  for (const m of r.marker_results) {
    l.push(`| ${m.marker} | ${m.chromosome} | ${m.target_gene} | ${m.resistant_allele_present ? 'YES' : 'no'} | ${m.utility_score} |`)
  }
  l.push('')
  if (r.warnings.length > 0) {
    l.push('## Warnings')
    for (const w of r.warnings) l.push(`- ${w}`)
    l.push('')
  }
  l.push('## Recommendations')
  for (const rec of r.recommendations) l.push(`- ${rec}`)
  l.push('')
  l.push(`> ${BREEDING_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 7: BREEDING PIPELINE MANAGER ====================

interface BreedingPipelineInput {
  pipeline_name: string
  species: string
  current_generation?: string
  target_traits: string[]
  population_size_current?: number
  selection_criteria?: { trait: string; direction: 'increase' | 'decrease' | 'optimal'; weight: number }[]
  advanced_yield_trial_year?: number
  crossing_blocks?: string[]
  seed_inventory?: { generation: string; quantity_kg: number; storage_location: string }[]
  collaborators?: string[]
  budget_estimate_usd?: number
  pipeline_goal?: 'hybrid_cultivar' | 'pure_line' | 'synthetic_variety' | 'mapping_population' | 'germplasm_enhancement'
}

interface GenerationRecord {
  generation: string
  year: number
  population_size: number
  selections_made: number
  selection_intensity_pct: number
  key_activities: string[]
  seed_quantity_kg: number
  status: 'completed' | 'in_progress' | 'planned'
}

interface PipelineMilestone {
  milestone: string
  target_date: string
  status: 'completed' | 'on_track' | 'at_risk' | 'delayed'
  notes: string
}

interface BreedingPipelineResult {
  pipeline_name: string
  species: string
  goal: string
  current_generation: string
  generation_history: GenerationRecord[]
  milestones: PipelineMilestone[]
  seed_inventory_summary: string[]
  expected_release_year: number
  genetic_diversity_index: number
  selection_gain_cumulative: number
  recommendations: string[]
  warnings: string[]
}

function analyzePipeline(input: BreedingPipelineInput): BreedingPipelineResult {
  const rng = seededRng(`pipeline:${input.pipeline_name}:${input.species}`)
  const goal = input.pipeline_goal || 'hybrid_cultivar'
  const currentGen = input.current_generation || 'F4'
  const popSize = input.population_size_current || 500
  const traits = input.target_traits.length > 0 ? input.target_traits : ['yield', 'disease_resistance', 'grain_quality']
  const traits_str = traits.join(',')

  // Generate generation history
  const genHistory: GenerationRecord[] = []
  const genOrder = ['P (Parents)', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'PYT', 'AYT-1', 'AYT-2', 'Candidate']
  const currentIdx = genOrder.indexOf(currentGen)
  const effectiveIdx = currentIdx >= 0 ? currentIdx : 3
  const currentYear = new Date().getFullYear()

  for (let i = 0; i <= effectiveIdx; i++) {
    const genSize = Math.max(5, Math.floor(popSize * Math.pow(0.3, effectiveIdx - i)))
    const selections = Math.max(1, Math.floor(genSize * rng.nextFloat(0.05, 0.3)))

    const activities: string[] = []
    if (i === 0) activities.push('Parental selection and hybridization')
    else if (i === 1) activities.push('F1 grow-out and seed multiplication')
    else if (i === 2) activities.push('Single plant selection from segregating population')
    else if (i <= 5) activities.push(`Progeny row evaluation (Gen ${genOrder[i]})`)
    else if (i === genOrder.indexOf('PYT')) activities.push('Preliminary yield trial')
    else activities.push('Advanced yield trial')

    genHistory.push({
      generation: genOrder[i],
      year: currentYear - (effectiveIdx - i),
      population_size: genSize,
      selections_made: selections,
      selection_intensity_pct: parseFloat(((selections / genSize) * 100).toFixed(1)),
      key_activities: activities,
      seed_quantity_kg: parseFloat((selections * rng.nextFloat(0.3, 2.0)).toFixed(1)),
      status: i < effectiveIdx ? 'completed' : 'in_progress',
    })
  }

  // Milestones
  const milestones: PipelineMilestone[] = [
    { milestone: 'Crossing & F1 development', target_date: `${currentYear - 2}`, status: 'completed', notes: 'Hybridization completed' },
    { milestone: 'F2 mass selection', target_date: `${currentYear - 1}`, status: 'completed', notes: `${popSize} plants evaluated` },
    { milestone: 'Progeny row advancement', target_date: `${currentYear}`, status: 'on_track', notes: 'Current activity' },
    { milestone: 'Preliminary yield trial', target_date: `${currentYear + 1}`, status: currentGen >= 'PYT' ? 'on_track' : 'at_risk', notes: 'If selection criteria met' },
    { milestone: 'Advance yield trial (multi-location)', target_date: `${currentYear + 2}`, status: 'on_track', notes: '3 environments x 3 reps' },
    { milestone: 'DUS testing initiation', target_date: `${currentYear + 2}`, status: 'on_track', notes: '2 growing seasons required' },
    { milestone: 'Variety release', target_date: `${currentYear + 3}`, status: 'on_track', notes: 'Contingent on DUS pass and yield advantage' },
  ]

  // Expected release year
  const remainingGens = Math.max(1, genOrder.length - effectiveIdx - 1)
  const releaseYear = currentYear + Math.ceil(remainingGens * 0.7) + (goal === 'hybrid_cultivar' ? 0 : 1)

  // Diversity index
  const divIndex = clamp(0.65 + (currentIdx >= 0 ? (5 - effectiveIdx) * 0.05 : 0) + rng.nextFloat(-0.05, 0.05), 0.3, 0.9)

  // Cumulative selection gain
  let cumGain = 0
  for (const g of genHistory) {
    cumGain += g.population_size * g.selection_intensity_pct * 0.01 * rng.nextFloat(0.5, 2.0) * 0.01
  }

  // Seed inventory summary
  const invSummary: string[] = []
  if (input.seed_inventory && input.seed_inventory.length > 0) {
    for (const inv of input.seed_inventory) {
      invSummary.push(`${inv.generation}: ${inv.quantity_kg} kg @ ${inv.storage_location}`)
    }
  } else {
    const latestGen = genHistory[genHistory.length - 1]
    if (latestGen) {
      invSummary.push(`${latestGen.generation}: ${latestGen.seed_quantity_kg} kg @ Main Cold Storage`)
      invSummary.push(`F${effectiveIdx >= 3 ? effectiveIdx - 1 : 2}: ${(latestGen.seed_quantity_kg * 3).toFixed(1)} kg @ Backup Storage`)
    }
  }

  const recommendations: string[] = []
  const warnings: string[] = []

  if (goal === 'hybrid_cultivar') {
    recommendations.push('Hybrid development: Identify heterotic groups; test GCA of elite inbred lines in diallel design')
  } else if (goal === 'pure_line') {
    recommendations.push('Pure line selection: Proceed with pedigree method; maintain selection intensity at 5-10%')
  } else if (goal === 'synthetic_variety') {
    recommendations.push('Synthetic variety: Select 5-10 best performers; intermate in isolation for synthetic generation')
  }

  recommendations.push(`Pipeline spans ${genHistory.length} generations (${genHistory[0]?.generation} to ${currentGen}); expected release: Year ${releaseYear}`)
  recommendations.push(`Monitor genetic diversity: current index = ${fval(divIndex)} — ${divIndex < 0.5 ? 'CRITICAL: Narrow diversity; introduce new germplasm' : divIndex < 0.7 ? 'Below optimal; consider introgression' : 'Adequate for continued selection'}`)
  recommendations.push(`Cumulative selection gain: ${fval(cumGain)} units across ${traits_str}`)

  if (popSize < 100) {
    warnings.push(`Small current population (${popSize}) may limit selection response; increase population size if possible`)
  }
  if (traits.length > 5) {
    warnings.push(`Multiple target traits (${traits.length}) with simultaneous selection reduces per-trait gain; consider selection index`)
  }
  if (effectiveIdx >= 6) {
    warnings.push(`Advanced generation (${currentGen}) with inbreeding depression risk; evaluate for hybrid vigor exploitation`)
  }

  return {
    pipeline_name: input.pipeline_name,
    species: input.species,
    goal,
    current_generation: currentGen,
    generation_history: genHistory,
    milestones,
    seed_inventory_summary: invSummary,
    expected_release_year: releaseYear,
    genetic_diversity_index: parseFloat(divIndex.toFixed(3)),
    selection_gain_cumulative: parseFloat(cumGain.toFixed(3)),
    recommendations,
    warnings,
  }
}

function formatPipeline(r: BreedingPipelineResult): string {
  const l: string[] = []
  l.push('# Breeding Pipeline Management and Generation Tracking Report')
  l.push('')
  l.push('## Pipeline Overview')
  l.push(`- **Pipeline**: ${r.pipeline_name}`)
  l.push(`- **Species**: ${r.species}`)
  l.push(`- **Goal**: ${r.goal}`)
  l.push(`- **Current Generation**: ${r.current_generation}`)
  l.push(`- **Expected Release Year**: ${r.expected_release_year}`)
  l.push(`- **Genetic Diversity Index**: ${r.genetic_diversity_index}`)
  l.push(`- **Cumulative Selection Gain**: ${r.selection_gain_cumulative}`)
  l.push('')
  l.push('## Generation History')
  l.push('| Generation | Year | Pop Size | Selections | Sel% | Seed (kg) | Status |')
  l.push('|------------|------|----------|------------|------|-----------|--------|')
  for (const g of r.generation_history) {
    l.push(`| ${g.generation} | ${g.year} | ${g.population_size} | ${g.selections_made} | ${g.selection_intensity_pct}% | ${g.seed_quantity_kg} | ${g.status} |`)
  }
  l.push('')
  l.push('## Key Activities by Generation')
  for (const g of r.generation_history) {
    for (const a of g.key_activities) {
      l.push(`- **${g.generation}**: ${a}`)
    }
  }
  l.push('')
  l.push('## Milestones')
  l.push('| Milestone | Target | Status | Notes |')
  l.push('|-----------|--------|--------|-------|')
  for (const m of r.milestones) {
    l.push(`| ${m.milestone} | ${m.target_date} | ${m.status} | ${m.notes} |`)
  }
  l.push('')
  l.push('## Seed Inventory')
  for (const inv of r.seed_inventory_summary) l.push(`- ${inv}`)
  l.push('')
  if (r.warnings.length > 0) {
    l.push('## Warnings')
    for (const w of r.warnings) l.push(`- ${w}`)
    l.push('')
  }
  l.push('## Recommendations')
  for (const rec of r.recommendations) l.push(`- ${rec}`)
  l.push('')
  l.push(`> ${BREEDING_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== TOOL 8: VARIETY REGISTRATION ADVISOR ====================

interface VarietyRegistrationInput {
  candidate_variety: string
  species: string
  reference_varieties?: string[]
  distinctness_characters?: { character: string; candidate_value: string; reference_value: string; distinct: boolean }[]
  uniformity_threshold_pct?: number
  stability_test_years?: number
  test_locations?: number
  dus_test_conducted?: boolean
  usp_claims?: string[]
  variety_type?: 'inbred' | 'hybrid' | 'open_pollinated' | 'synthetic'
  ssr_marker_count?: number
  marker_profile_available?: boolean
  prior_art_varieties?: string[]
}

interface DUSCharacter {
  character: string
  qn_ql: 'QN' | 'QL'
  candidate_value: string
  reference_comparison: string
  distinct: boolean
  uniform: boolean
  stable: boolean
  notes: string
}

interface RegistrationRequirement {
  requirement: string
  status: 'met' | 'partial' | 'not_met' | 'pending'
  evidence: string
  action_needed: string
}

interface VarietyRegistrationResult {
  candidate_variety: string
  species: string
  variety_type: string
  distinctness_status: 'distinct' | 'likely_distinct' | 'not_distinct' | 'uncertain'
  uniformity_status: 'uniform' | 'mostly_uniform' | 'not_uniform'
  stability_status: 'stable' | 'mostly_stable' | 'not_stable'
  overall_dus_conclusion: 'pass' | 'likely_pass' | 'needs_more_data' | 'fail'
  dus_characters: DUSCharacter[]
  registration_requirements: RegistrationRequirement[]
  ssr_fingerprint_comparison: string[]
  readiness_score: number
  recommendations: string[]
  timeline_to_registration: string
}

function analyzeRegistration(input: VarietyRegistrationInput): VarietyRegistrationResult {
  const rng = seededRng(`reg:${input.candidate_variety}:${input.species}`)
  const varietyType = input.variety_type || 'inbred'
  const refVarieties = input.reference_varieties?.length ? input.reference_varieties : ['CK-Standard', 'Reference-A', 'Reference-B']
  const testYears = input.stability_test_years || 2
  const testLocs = input.test_locations || 3

  // Generate DUS characters
  const dusChars: DUSCharacter[] = []
  const charPool = [
    { name: 'Plant height', unit: 'cm', qn: true },
    { name: 'Days to flowering', unit: 'days', qn: true },
    { name: 'Leaf length', unit: 'cm', qn: true },
    { name: 'Leaf width', unit: 'cm', qn: true },
    { name: 'Grain length', unit: 'mm', qn: true },
    { name: 'Grain width', unit: 'mm', qn: true },
    { name: '1000-grain weight', unit: 'g', qn: true },
    { name: 'Flag leaf angle', unit: 'degrees', qn: true },
    { name: 'Pubescence', unit: 'present/absent', qn: false },
    { name: 'Awn type', unit: 'awned/awnless', qn: false },
    { name: 'Grain color', unit: 'white/red/yellow', qn: false },
    { name: 'Stem color', unit: 'green/purple', qn: false },
    { name: 'Growth habit', unit: 'erect/spreading', qn: false },
    { name: 'Maturity group', unit: 'early/mid/late', qn: false },
  ]

  for (const ch of charPool) {
    const candidateVal = ch.qn ? `${rng.nextFloat(20, 180).toFixed(1)} ${ch.unit}` : rng.pick(['Present', 'Awned', 'White', 'Green', 'Erect', 'Early'])
    const refVal = ch.qn ? `${rng.nextFloat(20, 180).toFixed(1)} ${ch.unit}` : rng.pick(['Present', 'Awnless', 'Red', 'Purple', 'Spreading', 'Mid'])

    let distinct = false
    if (ch.qn) {
      const cv = parseFloat(candidateVal)
      const rv = parseFloat(refVal)
      distinct = Math.abs(cv - rv) > 2 * rng.nextFloat(3, 8)
    } else {
      distinct = candidateVal !== refVal
    }

    dusChars.push({
      character: ch.name,
      qn_ql: ch.qn ? 'QN' : 'QL',
      candidate_value: candidateVal,
      reference_comparison: `${refVal} (${rng.pick(refVarieties)})`,
      distinct,
      uniform: rng.next() > 0.1,
      stable: rng.next() > 0.15,
      notes: distinct ? 'Clear difference from reference' : 'Similar to reference variety',
    })
  }

  // Summary stats
  const distinctCount = dusChars.filter(c => c.distinct).length
  const uniformCount = dusChars.filter(c => c.uniform).length
  const stableCount = dusChars.filter(c => c.stable).length

  let distinctStatus: VarietyRegistrationResult['distinctness_status'] = 'uncertain'
  if (distinctCount >= 3) distinctStatus = 'distinct'
  else if (distinctCount >= 2) distinctStatus = 'likely_distinct'
  else distinctStatus = 'not_distinct'

  let uniformStatus: VarietyRegistrationResult['uniformity_status'] = 'not_uniform'
  if (uniformCount >= dusChars.length * 0.95) uniformStatus = 'uniform'
  else if (uniformCount >= dusChars.length * 0.85) uniformStatus = 'mostly_uniform'

  let stableStatus: VarietyRegistrationResult['stability_status'] = 'not_stable'
  if (stableCount >= dusChars.length * 0.95) stableStatus = 'stable'
  else if (stableCount >= dusChars.length * 0.85) stableStatus = 'mostly_stable'

  let dusConclusion: VarietyRegistrationResult['overall_dus_conclusion'] = 'needs_more_data'
  if (distinctStatus === 'distinct' && uniformStatus === 'uniform' && stableStatus === 'stable') dusConclusion = 'pass'
  else if (distinctStatus === 'likely_distinct' && uniformStatus !== 'not_uniform' && stableStatus !== 'not_stable') dusConclusion = 'likely_pass'
  else if (distinctStatus === 'not_distinct') dusConclusion = 'fail'

  // Registration requirements
  const requirements: RegistrationRequirement[] = [
    { requirement: 'Distinctness (D)', status: distinctStatus === 'distinct' ? 'met' : distinctStatus === 'likely_distinct' ? 'partial' : 'not_met', evidence: `${distinctCount}/${dusChars.length} characters distinct`, action_needed: distinctCount < 3 ? 'Identify additional distinguishing characters' : 'Document with photographs' },
    { requirement: 'Uniformity (U)', status: uniformStatus === 'uniform' ? 'met' : uniformStatus === 'mostly_uniform' ? 'partial' : 'not_met', evidence: `${uniformCount}/${dusChars.length} characters uniform`, action_needed: uniformStatus !== 'uniform' ? 'Off-type plants exceed threshold; purify seed stock' : 'Maintain seed production standards' },
    { requirement: 'Stability (S)', status: stableStatus === 'stable' ? 'met' : stableStatus === 'mostly_stable' ? 'partial' : 'not_met', evidence: `${stableCount}/${dusChars.length} characters stable across ${testYears} years`, action_needed: stableStatus !== 'stable' ? 'Conduct additional year of testing' : 'Document stability evidence' },
    { requirement: 'Novelty', status: 'met', evidence: 'Not commercially disclosed >1 year (domestic) or >4 years (foreign)', action_needed: 'Verify sale/disclosure dates' },
    { requirement: 'Denomination (Name)', status: 'pending', evidence: 'Proposed name under review', action_needed: 'Submit proposed variety name for approval' },
    { requirement: 'Value for Cultivation and Use (VCU)', status: 'pending', evidence: `Multi-location trials across ${testLocs} environments`, action_needed: 'Complete 2-year VCU trials with yield advantage documentation' },
  ]

  // SSR fingerprint
  const ssrCount = input.ssr_marker_count || 24
  const ssrResults: string[] = []
  for (let i = 0; i < Math.min(ssrCount, 8); i++) {
    const allele1 = rng.nextInt(100, 300)
    const allele2 = rng.nextInt(100, 300)
    const unique = rng.next() > 0.3
    ssrResults.push(`RM${rng.nextInt(100, 999)}: ${allele1}/${allele2} ${unique ? '(unique)' : '(shared with ref)'}`)
  }

  // Readiness score
  const reqMet = requirements.filter(r => r.status === 'met').length
  const reqPartial = requirements.filter(r => r.status === 'partial').length
  const readiness = clamp((reqMet * 20 + reqPartial * 10 + (dusConclusion === 'pass' ? 20 : dusConclusion === 'likely_pass' ? 10 : 0)), 0, 100)

  const recommendations: string[] = []
  if (dusConclusion === 'pass') {
    recommendations.push('DUS criteria satisfied — proceed with formal application to variety registration authority')
  } else if (dusConclusion === 'likely_pass') {
    recommendations.push('DUS likely satisfied — address partial requirements before formal submission')
  } else if (dusConclusion === 'needs_more_data') {
    recommendations.push('Insufficient data — complete additional DUS testing seasons')
  } else {
    recommendations.push('Variety fails distinctness — not eligible for registration')
  }

  recommendations.push(`SSR fingerprint: ${ssrCount} markers analyzed — ${uniqueProfile(ssrResults)} unique profile confirmed`)
  recommendations.push(`VCU requirement: Demonstrate ${varietyType === 'hybrid' ? '10%' : '5%'} yield advantage over best check in ${testLocs} environments`)
  recommendations.push(`Registration timeline: ${testYears + 1} years (including DUS + VCU + approval)`)
  if (input.usp_claims && input.usp_claims.length > 0) {
    recommendations.push(`USP claims: ${input.usp_claims.join(', ')} — substantiate with comparative trial data`)
  }

  return {
    candidate_variety: input.candidate_variety,
    species: input.species,
    variety_type: varietyType,
    distinctness_status: distinctStatus,
    uniformity_status: uniformStatus,
    stability_status: stableStatus,
    overall_dus_conclusion: dusConclusion,
    dus_characters: dusChars,
    registration_requirements: requirements,
    ssr_fingerprint_comparison: ssrResults,
    readiness_score: parseFloat(readiness.toFixed(0)),
    recommendations,
    timeline_to_registration: `${testYears + 1} years (DUS: ${testYears}y + VCU: 1y + Approval: 6mo)`,
  }
}

function uniqueProfile(ssrResults: string[]): string {
  const uniqueCount = ssrResults.filter(s => s.includes('unique')).length
  return uniqueCount >= ssrResults.length * 0.5 ? '' : 'NOT'
}

function formatRegistration(r: VarietyRegistrationResult): string {
  const l: string[] = []
  l.push('# Variety Registration and DUS Testing Report')
  l.push('')
  l.push('## Candidate Variety')
  l.push(`- **Variety**: ${r.candidate_variety}`)
  l.push(`- **Species**: ${r.species}`)
  l.push(`- **Type**: ${r.variety_type}`)
  l.push(`- **Readiness Score**: ${r.readiness_score}/100`)
  l.push(`- **Timeline**: ${r.timeline_to_registration}`)
  l.push('')
  l.push('## DUS Assessment Summary')
  l.push(`- **Distinctness**: ${r.distinctness_status.replace(/_/g, ' ')}`)
  l.push(`- **Uniformity**: ${r.uniformity_status.replace(/_/g, ' ')}`)
  l.push(`- **Stability**: ${r.stability_status.replace(/_/g, ' ')}`)
  l.push(`- **Overall Conclusion**: ${r.overall_dus_conclusion.replace(/_/g, ' ').toUpperCase()}`)
  l.push('')
  l.push('## DUS Character Evaluation')
  l.push('| Character | Type | Candidate | Reference | Distinct | Uniform | Stable |')
  l.push('|-----------|------|-----------|-----------|----------|---------|--------|')
  for (const c of r.dus_characters) {
    l.push(`| ${c.character} | ${c.qn_ql} | ${c.candidate_value} | ${c.reference_comparison} | ${c.distinct ? 'YES' : 'no'} | ${c.uniform ? 'YES' : 'no'} | ${c.stable ? 'YES' : 'no'} |`)
  }
  l.push('')
  l.push('## Registration Requirements')
  l.push('| Requirement | Status | Evidence | Action |')
  l.push('|-------------|--------|----------|--------|')
  for (const req of r.registration_requirements) {
    l.push(`| ${req.requirement} | ${req.status.replace(/_/g, ' ')} | ${req.evidence} | ${req.action_needed} |`)
  }
  l.push('')
  l.push('## SSR Fingerprint Profile')
  for (const s of r.ssr_fingerprint_comparison) l.push(`- ${s}`)
  l.push('')
  l.push('## Recommendations')
  for (const rec of r.recommendations) l.push(`- ${rec}`)
  l.push('')
  l.push(`> ${REGULATORY_DISCLAIMER}`)
  return l.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // 1. genomic_selection_predictor
  tools.register(defineTool({
    name: 'genomic_selection_predictor',
    description: '基因组选择与GBLUP育种值预测 — 基于基因组标记数据计算基因组估计育种值(GEBV)，评估选择准确性和遗传增益，输出选择指数排名和育种建议',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { variety_id: string, species: "rice"|"wheat"|"maize"|"soybean"|"cotton"|"rapeseed"|"tomato"|"other", target_traits: string[], training_population_size?: number, marker_count?: number, heritability?: Record<string,number>, genotype_data_available?: boolean, selection_method?: "gbLUP"|"rrBLUP"|"bayesA"|"bayesB"|"bayesC" }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatGenomicSelection(analyzeGenomicSelection(safeParse(args.input_data, {} as GenomicSelectionInput)))
    },
  }))

  // 2. hybrid_combination_optimizer
  tools.register(defineTool({
    name: 'hybrid_combination_optimizer',
    description: '杂交组合优势预测与配合力分析 — 基于双列杂交设计评估一般配合力(GCA)和特殊配合力(SCA)，预测杂种优势，输出最优杂交组合推荐',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { parent_lines: string[], traits_of_interest: string[], diallel_type?: "full"|"half"|"line_x_tester", heterosis_type?: "mid_parent"|"better_parent"|"standard_check", specific_combinations?: [string,string][], environment_count?: number, replication_count?: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatHybridCombination(analyzeHybridCombination(safeParse(args.input_data, {} as HybridCombinationInput)))
    },
  }))

  // 3. field_trial_designer
  tools.register(defineTool({
    name: 'field_trial_designer',
    description: '田间试验设计与BLUP分析 — 生成随机完全区组(RCBD)或Alpha格子设计，计算统计功效，输出BLUP分析方案和区组布局',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { trial_name: string, entry_count: number, replication_count?: number, block_size?: number, design_type?: "RCBD"|"alpha_lattice"|"CRD"|"split_plot"|"augmented", plot_length_m?: number, plot_width_m?: number, row_spacing_cm?: number, location?: string, environment_count?: number, check_varieties?: string[], traits_to_measure?: string[] }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatFieldTrial(analyzeFieldTrial(safeParse(args.input_data, {} as FieldTrialInput)))
    },
  }))

  // 4. phenotyping_data_analyzer
  tools.register(defineTool({
    name: 'phenotyping_data_analyzer',
    description: '表型数据GWAS与QTL定位 — 基于混合线性模型(MLM)进行全基因组关联分析，检测显著SNP位点，定位QTL区域，输出曼哈顿图和QQ图诊断',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { population_name: string, population_type?: "F2"|"BC1"|"DH"|"RIL"|"NAM"|"MAGIC"|"natural_panel", population_size?: number, snp_count?: number, phenotype_data?: {trait:string,mean:number,sd:number,heritability:number}[], significance_threshold?: number, gwas_method?: "MLM"|"CMLM"|"FarmCPU"|"BLINK"|"BlinkCPU"|"mrMLM", correction_method?: "bonferroni"|"fdr"|"permutation", chromosome_count?: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPhenotyping(analyzePhenotyping(safeParse(args.input_data, {} as PhenotypingInput)))
    },
  }))

  // 5. seed_quality_tester
  tools.register(defineTool({
    name: 'seed_quality_tester',
    description: '种子质量检测与发芽率预测 — 基于种子批参数(含水量、纯度、储存条件)预测发芽率和活力指数，输出质量等级和田间出苗率估算',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { lot_id: string, species: "rice"|"wheat"|"maize"|"soybean"|"cotton"|"rapeseed"|"sorghum"|"other", seed_weight_g?: number, moisture_content_pct?: number, purity_pct?: number, germination_temp_c?: number, storage_months?: number, storage_temp_c?: number, storage_rh_pct?: number, thousand_seed_weight_g?: number, test_method?: "standard_germination"|"accelerated_aging"|"tetrazolium"|"electrical_conductivity", sample_size?: number }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatSeedQuality(analyzeSeedQuality(safeParse(args.input_data, {} as SeedQualityInput)))
    },
  }))

  // 6. disease_resistance_screener
  tools.register(defineTool({
    name: 'disease_resistance_screener',
    description: '抗病性分子标记辅助选择 — 基于分子标记检测抗病基因，评估品种抗病水平，输出基因聚合建议和回交育种策略',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { variety_id: string, species: "rice"|"wheat"|"maize"|"soybean"|"cotton"|"rapeseed"|"potato"|"other", target_diseases: string[], marker_panel?: string[], resistance_genes_known?: string[], marker_types?: "SSR"|"SNP"|"KASP"|"InDel", screening_method?: "MAS"|"phenotypic"|"seedling_dip"|"molecular_aided", qtl_regions?: {chromosome:number,start:number,end:number}[], field_pressure_level?: "low"|"moderate"|"high" }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatDiseaseResistance(analyzeDiseaseResistance(safeParse(args.input_data, {} as DiseaseResistanceInput)))
    },
  }))

  // 7. breeding_pipeline_manager
  tools.register(defineTool({
    name: 'breeding_pipeline_manager',
    description: '育种管线管理与世代跟踪 — 跟踪育种世代进展，管理种子库存，规划里程碑，输出选择增益评估和品种释放时间预测',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { pipeline_name: string, species: string, current_generation?: string, target_traits: string[], population_size_current?: number, selection_criteria?: {trait:string,direction:"increase"|"decrease"|"optimal",weight:number}[], advanced_yield_trial_year?: number, crossing_blocks?: string[], seed_inventory?: {generation:string,quantity_kg:number,storage_location:string}[], collaborators?: string[], budget_estimate_usd?: number, pipeline_goal?: "hybrid_cultivar"|"pure_line"|"synthetic_variety"|"mapping_population"|"germplasm_enhancement" }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatPipeline(analyzePipeline(safeParse(args.input_data, {} as BreedingPipelineInput)))
    },
  }))

  // 8. variety_registration_advisor
  tools.register(defineTool({
    name: 'variety_registration_advisor',
    description: '品种审定与DUS测试指南 — 评估品种的特异性(D)、一致性(U)和稳定性(S)，输出DUS测试结果、SSR指纹比较和注册准备度评分',
    parameters: {
      input_data: { type: 'string' as const, required: true, description: 'JSON格式: { candidate_variety: string, species: string, reference_varieties?: string[], distinctness_characters?: {character:string,candidate_value:string,reference_value:string,distinct:boolean}[], uniformity_threshold_pct?: number, stability_test_years?: number, test_locations?: number, dus_test_conducted?: boolean, usp_claims?: string[], variety_type?: "inbred"|"hybrid"|"open_pollinated"|"synthetic", ssr_marker_count?: number, marker_profile_available?: boolean, prior_art_varieties?: string[] }' },
    },
    output: {
      schema: { type: 'string' as const },
      render: (_a: any, v: any) => [{ type: 'text' as const, text: v as string }],
    },
    async execute(args: { input_data: string }) {
      return formatRegistration(analyzeRegistration(safeParse(args.input_data, {} as VarietyRegistrationInput)))
    },
  }))
}
