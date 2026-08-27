/**
 * DSH ResearchOS Plugin v0.1.0
 *
 * AI Scientist toolkit for academic research acceleration, built for DeepSeek Harness.
 * Inspired by the AI Scientist trend (Sakana AI + paperdigest + research acceleration).
 *
 * Features (v0.1.0):
 * - LitReviewer  (lit_reviewer)        — Intelligent literature review with keyword expansion, relevance sorting, gap identification, and timeline visualization
 * - HypothesisGen (hypothesis_gen)       — Scientific hypothesis generation with problem space exploration, counterfactual reasoning, testable hypothesis ranking, and risk pre-judgment
 * - ExperimentDesigner (experiment_designer) — Experiment design with controlled variables, sample size calculation, randomization, blinding, and power analysis
 * - DataPipeline  (data_pipeline)        — Research data pipeline with cleaning, feature engineering, version control, reproducibility assurance, and data cards
 * - PaperOutliner (paper_outliner)       — Paper structure generation with IMRAD templates, figure positioning, citation annotation, and target journal matching
 * - PeerReviewSim (peer_review_sim)     — Peer review simulation with methodology checking, statistical review, reproducibility assessment, and strengths/weaknesses report
 * - ResearchRadar (research_radar)      — Research trend radar with emerging topic identification, key researcher positioning, funding direction, and hotspot tracking
 * - CollaborationFunder (collaboration_funder) — Collaboration and funding recommendations with funding opportunity matching, collaborator recommendation, and team complementarity scoring
 *
 * Theme: Deep blue academic theme with citation graph visualization and experiment design flowchart.
 *
 * @module dsh-tool-researchos
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-researchos'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface Paper {
  title: string
  authors: string[]
  year: number
  abstract: string
  doi?: string
  citations?: number
  journal?: string
  keywords?: string[]
  methodology?: string
  findings?: string
  relevanceScore?: number
}

interface LiteratureReviewResult {
  keywordsExpanded: string[]
  searchStrategy: Record<string, string[]>
  papers: Array<Paper & { relevanceScore: number }>
  timeline: Array<{ period: string; paperCount: number; topThemes: string[] }>
  gaps: Array<{ topic: string; gapType: 'theoretical' | 'methodological' | 'empirical' | 'population' | 'temporal'; description: string; priority: number }>
  methodologyTrends: Array<{ method: string; frequency: number; trend: 'rising' | 'stable' | 'declining' }>
  citationGraph: Array<{ from: string; to: string; strength: number }>
}

interface HypothesisInput {
  researchQuestion: string
  domain: string
  knownFactors: Array<{ factor: string; relationship: string; evidence: string }>
  targetPopulation?: string
  constraints?: string[]
  noveltyDirection?: 'incremental' | 'moderate' | 'high-risk'
}

interface HypothesisResult {
  problemSpace: Array<{ dimension: string; currentState: string; targetState: string; keyChallenge: string }>
  counterfactuals: Array<{ scenario: string; expectedOutcome: string; insight: string }>
  hypotheses: Array<{
    id: string
    statement: string
    type: 'directional' | 'non-directional' | 'null' | 'alternative'
    testability: number
    noveltyScore: number
    feasibilityScore: number
    riskLevel: 'low' | 'medium' | 'high'
    risks: Array<{ type: string; severity: 'low' | 'medium' | 'high'; mitigation: string }>
    requiredEvidence: string
    implications: string
  }>
  recommendedHypothesis: string
}

interface ExperimentInput {
  hypothesis: string
  independentVars: Array<{ name: string; levels: number; type: 'between' | 'within' | 'mixed' }>
  dependentVars: Array<{ name: string; measurementType: 'continuous' | 'ordinal' | 'nominal' | 'count'; expectedEffect: number }>
  confoundingVars?: string[]
  expectedEffectSize: number
  desiredPower: number
  alphaLevel: number
  budget?: { maxParticipants?: number; costPerParticipant?: number; totalBudget?: number }
}

interface ExperimentResult {
  design: {
    type: string
    factors: Array<{ name: string; role: string; levels: number }>
    designNotation: string
  }
  sampleSize: {
    total: number
    perGroup: number
    powerAchieved: number
    assumptions: string[]
  }
  controlProcedures: {
    randomization: { method: string; description: string }
    blinding: { level: 'single' | 'double' | 'triple'; description: string; feasibility: string }
    controls: Array<{ type: string; description: string }>
  }
  powerAnalysis: {
    effectSize: number
    alpha: number
    power: number
    sensitivityCurve: Array<{ n: number; power: number }>
    recommendedN: number
  }
  workflow: Array<{ step: number; phase: string; action: string; duration: string }>
  threats: Array<{ threat: string; severity: 'low' | 'medium' | 'high'; mitigation: string }>
}

interface DatasetInput {
  datasetName: string
  description: string;
  columns: Array<{
    name: string
    type: 'numeric' | 'categorical' | 'ordinal' | 'text' | 'datetime' | 'binary'
    missingPct: number
    uniqueCount: number
    stats: { mean?: number; std?: number; min?: number; max?: number; median?: number; categories?: string[] }
  }>
  rowCount: number
  collectionMethod: string
  version: string
  intendedUse: string
  ethicalConsiderations?: string[]
}

interface DataPipelineResult {
  cleaning: Array<{ action: string; affectedColumns: string[]; rationale: string; impact: string }>
  featureEngineering: Array<{ feature: string; method: string; purpose: string }>
  qualityReport: {
    completeness: number
    consistency: number
    accuracy: number
    overall: number
  }
  versionControl: {
    currentVersion: string
    changes: string[]
    reproducibility: string[]
    snapshot: string
  }
  dataCard: {
    name: string
    description: string
    provenance: string
    limitations: string[]
    recommendations: string[]
    schema: Array<{ field: string; type: string; description: string }>
  }
}

interface PaperOutlineInput {
  title: string
  abstract: string
  methodology: string
  keyFindings: Array<{ finding: string; evidenceStrength: 'strong' | 'moderate' | 'weak'; supportingData: string }>
  targetJournal?: string
  submissionType?: 'original' | 'review' | 'short' | 'perspective' | 'case-study'
  references?: Array<{ key: string; authors: string; year: number; title: string; usage: string }>
  figures?: Array<{ id: string; type: 'graph' | 'diagram' | 'table' | 'image'; caption: string; placement: string }>
}

interface PaperOutlineResult {
  structure: Array<{
    section: string
    content: string
    wordCount: number
    figures: string[]
    citations: string[]
  }>
  figures: Array<{ id: string; type: string; caption: string; section: string; priority: number }>
  targetJournal: {
    name: string
    matchScore: number
    scopeAlignment: string
    requirements: string[]
    tips: string[]
  }
  citationMap: Array<{ inText: string; references: string[]; context: string }>
  outlineFlow: Array<{ section: string; purpose: string; transition: string }>
}

interface PeerReviewInput {
  title: string
  abstract: string
  methodology: {
    design: string
    participants: string
    measures: string
    analysis: string
    replicationInfo?: string
  }
  results: Array<{ hypothesis: string; testUsed: string; statistic: string; pValue: number; effectSize?: number; confidenceInterval?: string; significant: boolean }>
  discussion: {
    summary: string
    limitations: string[]
    implications: string
  }
  claims: Array<{ claim: string; evidenceLevel: 'strong' | 'moderate' | 'weak' | 'unsupported'; overstatement: boolean }>
}

interface PeerReviewResult {
  overallScore: number
  recommendation: 'accept' | 'minor-revision' | 'major-revision' | 'reject' | 'resubmit'
  methodologyReview: {
    designValidity: number
    sampling: string
    measurement: string
    confoundControl: string
    errors: string[]
  }
  statisticalReview: {
    tests: Array<{ test: string; appropriate: boolean; concerns: string[] }>
    assumptions: string[]
    corrections: string
    powerMention: boolean
    recommendations: string[]
  }
  reproducibility: {
    score: number
    dataAvailability: string
    codeAvailability: string
    materialsList: boolean
    preregistered: boolean
    concerns: string[]
  }
  strengths: Array<{ aspect: string; quote: string; rating: number }>
  weaknesses: Array<{ aspect: string; issue: string; severity: 'minor' | 'major' }>
  questionsForAuthor: string[]
}

interface ResearchRadarInput {
  domain: string
  subdomains: string[]
  recentPapers: Array<{ title: string; authors: string[]; year: number; keywords: string[]; citations?: number; venue: string }>
  researchers: Array<{ name: string; affiliations: string[]; hIndex?: number; recentFocus: string[] }>
  fundingSources: Array<{ agency: string; totalFunding: number; priorityAreas: string[]; deadline?: string }>
}

interface ResearchRadarResult {
  emergingTopics: Array<{ topic: string; GrowthRate: number; paperCount: number; recentPapers: string[]; potential: 'high' | 'medium' | 'low' }>
  keyResearchers: Array<{ name: string; impact: number; focusAreas: string[]; collaborators: string[]; trendDirection: 'rising' | 'stable' | 'shifting' }>
  fundingDirections: Array<{ area: string; totalFunding: number; agencies: string[]; opportunityLevel: 'hot' | 'warm' | 'emerging' }>
  hotspots: Array<{ hotspot: string; intensity: number; relatedTopics: string[]; prediction: string }>
  strategicRecommendations: Array<{ action: string; rationale: string; timeline: string }>
}

interface CollaborationInput {
  researcher: {
    name: string
    expertise: string[]
    methods: string[]
    publications: number
    hIndex?: number
    currentProjects: string[]
    availableResources: string[]
  }
  goals: string[]
  seeking: Array<{ type: 'expertise' | 'methodology' | 'data' | 'funding' | 'equipment'; description: string; priority: number }>
  potentialCollaborators: Array<{
    name: string
    expertise: string[]
    methods: string[]
    institution: string
    availability: string
    publicationRecord: number
  }>
}

interface CollaborationResult {
  collaborators: Array<{
    name: string
    complementarityScore: number
    complementaryAreas: string[]
    gapsFilled: string[]
    synergyPotential: string
    riskFactors: string[]
  }>
  teamComposition: {
    strengths: string[]
    gaps: string[]
    balanceScore: number
    recommendations: string[]
  }
  fundingOpportunities: Array<{
    source: string
    program: string
    matchScore: number
    deadline: string
    amount: string
    fitDescription: string
  }>
}

// ==================== TOOL 1: LIT_REVIEWER ====================

function performLiteratureReview(input: { query: string; papers: Paper[]; expandKeywords?: boolean }): LiteratureReviewResult {
  const queryTerms = input.query.toLowerCase().split(/\s+/).filter((t) => t.length > 2)
  const expanded = expandKeywords(input.expandKeywords ?? true, queryTerms)

  const papers = input.papers.map((p) => ({
    ...p,
    relevanceScore: calculateRelevance(p, queryTerms, expanded)
  })).sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0))

  const timeline = buildTimeline(papers)
  const gaps = identifyGaps(papers, input.query)

  return {
    keywordsExpanded: expanded,
    searchStrategy: buildSearchStrategy(input.query, expanded),
    papers,
    timeline,
    gaps,
    methodologyTrends: analyzeMethodologyTrends(papers),
    citationGraph: buildCitationGraph(papers)
  }
}

function calculateRelevance(paper: Paper, queryTerms: string[], expandedTerms: string[]): number {
  let score = 0
  const text = `${paper.title} ${paper.abstract} ${(paper.keywords ?? []).join(' ')}`.toLowerCase()
  for (const term of queryTerms) {
    score += (text.match(new RegExp(term, 'g')) ?? []).length * 3
  }
  for (const term of expandedTerms) {
    if (!queryTerms.includes(term)) {
      score += (text.match(new RegExp(term, 'g')) ?? []).length * 1
    }
  }
  score += (paper.citations ?? 0) * 0.01
  return Math.min(Math.round(score * 10) / 10, 10)
}

function expandKeywords(shouldExpand: boolean, queryTerms: string[]): string[] {
  if (!shouldExpand) return [...queryTerms]
  const synonyms: Record<string, string[]> = {
    'deep learning': ['neural network', 'deep neural', 'representation learning', 'backpropagation'],
    'machine learning': ['statistical learning', 'pattern recognition', 'supervised learning', 'unsupervised learning'],
    'transformer': ['attention mechanism', 'self-attention', 'BERT', 'GPT', 'large language model'],
    'optimization': ['gradient descent', 'stochastic optimization', 'convex optimization', 'objective function'],
    'nlp': ['natural language processing', 'text mining', 'computational linguistics', 'language model'],
    'cv': ['computer vision', 'image recognition', 'visual processing', 'object detection'],
    'reinforcement learning': ['RL', 'policy gradient', 'Q-learning', 'reward optimization'],
    'ethics': ['fairness', 'bias', 'accountability', 'transparency', 'responsible AI'],
    'experiment': ['controlled study', 'randomized trial', 'empirical study', 'intervention']
  }
  const expanded = new Set(queryTerms)
  for (const term of queryTerms) {
    for (const [key, syns] of Object.entries(synonyms)) {
      if (term.includes(key) || key.includes(term)) {
        syns.forEach((s) => expanded.add(s))
      }
    }
  }
  return [...expanded]
}

function shouldExpand(expandKeywords?: boolean): boolean {
  return expandKeywords ?? true
}

function buildSearchStrategy(query: string, expanded: string[]): Record<string, string[]> {
  return {
    primary: expanded.slice(0, 5),
    secondary: expanded.slice(5, 10),
    boolean: [
      `(${expanded.slice(0, 3).join(' OR ')})`,
      `(${expanded.slice(3, 6).join(' OR ')})`,
      `(${expanded.slice(0, 3).join(' OR ')}) AND (${expanded.slice(3, 6).join(' OR ')})`
    ],
    databases: ['PubMed/MEDLINE', 'IEEE Xplore', 'ACM Digital Library', 'Web of Science', 'Scopus', 'arXiv', 'Google Scholar']
  }
}

function buildTimeline(papers: Paper[]): LiteratureReviewResult['timeline'] {
  const yearGroups: Record<string, Paper[]> = {}
  for (const p of papers) {
    const decade = `${Math.floor(p.year / 5) * 5}s`
    if (!yearGroups[decade]) yearGroups[decade] = []
    yearGroups[decade].push(p)
  }

  return Object.entries(yearGroups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, paps]) => {
      const themeCount: Record<string, number> = {}
      for (const p of paps) {
        for (const kw of (p.keywords ?? [])) {
          themeCount[kw] = (themeCount[kw] ?? 0) + 1
        }
      }
      const topThemes = Object.entries(themeCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([theme]) => theme)
      return { period, paperCount: paps.length, topThemes }
    })
}

function identifyGaps(papers: Paper[], query: string): LiteratureReviewResult['gaps'] {
  const allKeywords = new Set<string>()
  const coveredYears = new Set<number>()
  const methods = new Set<string>()
  for (const p of papers) {
    ;(p.keywords ?? []).forEach((k) => allKeywords.add(k))
    coveredYears.add(p.year)
    if (p.methodology) methods.add(p.methodology)
  }

  const gaps: LiteratureReviewResult['gaps'] = []
  const yearRange = [Math.min(...coveredYears), Math.max(...coveredYears)]
  for (let y = yearRange[0]; y <= yearRange[1]; y++) {
    if (!coveredYears.has(y)) {
      gaps.push({
        topic: `${query} (${y})`,
        gapType: 'temporal',
        description: `No publications found for year ${y}`,
        priority: 5
      })
    }
  }

  const tableKeywords = ['survey', 'meta-analysis', 'systematic review', 'benchmark']
  tableKeywords.forEach((tk) => {
    if (!allKeywords.has(tk)) {
      gaps.push({
        topic: tk,
        gapType: 'methodological',
        description: `Lack of ${tk} studies`,
        priority: tk === 'benchmark' ? 8 : 6
      })
    }
  })

  const popKeywords = ['clinical trial', 'real-world', 'cross-cultural', 'large-scale']
  popKeywords.forEach((pk) => {
    if (!allKeywords.has(pk)) {
      gaps.push({
        topic: pk,
        gapType: 'population',
        description: `Limited research on ${pk} populations`,
        priority: 7
      })
    }
  })

  return gaps.sort((a, b) => b.priority - a.priority)
}

function analyzeMethodologyTrends(papers: Paper[]): LiteratureReviewResult['methodologyTrends'] {
  const methodCount: Record<string, number> = {}
  const methodByYear: Record<string, Record<number, number>> = {}

  for (const p of papers) {
    if (p.methodology) {
      const m = p.methodology.toLowerCase()
      methodCount[m] = (methodCount[m] ?? 0) + 1
      if (!methodByYear[m]) methodByYear[m] = {}
      methodByYear[m][p.year] = (methodByYear[m][p.year] ?? 0) + 1
    }
  }

  return Object.entries(methodCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([method, freq]) => ({
      method,
      frequency: freq,
      trend: determineTrend(methodByYear[method] ?? {})
    }))
}

function determineTrend(yearData: Record<number, number>): 'rising' | 'stable' | 'declining' {
  const years = Object.keys(yearData).map(Number).sort()
  if (years.length < 2) return 'stable'
  const recent = years.slice(-2)
  const recentAvg = recent.reduce((s, y) => s + (yearData[y] ?? 0), 0) / recent.length
  const older = years.slice(0, Math.max(1, years.length - 2))
  const olderAvg = older.reduce((s, y) => s + (yearData[y] ?? 0), 0) / older.length
  if (recentAvg > olderAvg * 1.3) return 'rising'
  if (recentAvg < olderAvg * 0.7) return 'declining'
  return 'stable'
}

function buildCitationGraph(papers: Paper[]): LiteratureReviewResult['citationGraph'] {
  const graph: LiteratureReviewResult['citationGraph'] = []
  for (let i = 0; i < papers.length; i++) {
    for (let j = i + 1; j < papers.length; j++) {
      const shared = (papers[i].keywords ?? []).filter((k) => (papers[j].keywords ?? []).includes(k))
      if (shared.length >= 2) {
        graph.push({
          from: papers[i].title,
          to: papers[j].title,
          strength: shared.length
        })
      }
    }
  }
  return graph.sort((a, b) => b.strength - a.strength).slice(0, 30)
}

function formatLitReviewerReport(result: LiteratureReviewResult): string {
  const lines: string[] = []
  lines.push('# Literature Review Report — ResearchOS')
  lines.push('')
  lines.push(`**Keywords Expanded:** ${result.keywordsExpanded.join(', ')}`)
  lines.push('')
  lines.push('## Search Strategy')
  lines.push(`- Primary terms: ${result.searchStrategy.primary.join(', ')}`)
  lines.push(`- Secondary terms: ${result.searchStrategy.secondary.join(', ')}`)
  lines.push(`- Boolean queries:`)
  result.searchStrategy.boolean.forEach((q) => lines.push(`  - \`${q}\``))
  lines.push(`- Databases: ${result.searchStrategy.databases.join(', ')}`)
  lines.push('')

  lines.push('## Papers by Relevance')
  lines.push('| # | Title (Year) | Score | Method | Citations |')
  lines.push('|---|--------------|-------|--------|-----------|')
  result.papers.slice(0, 20).forEach((p, i) => {
    lines.push(`| ${i + 1} | ${p.title} (${p.year}) | ${p.relevanceScore?.toFixed(1)} | ${p.methodology ?? 'N/A'} | ${p.citations ?? 0} |`)
  })
  lines.push('')

  lines.push('## Research Timeline')
  lines.push('| Period | Papers | Top Themes |')
  lines.push('|--------|--------|------------|')
  result.timeline.forEach((t) => {
    lines.push(`| ${t.period} | ${t.paperCount} | ${t.topThemes.join(', ') || 'N/A'} |`)
  })
  lines.push('')

  lines.push('## Identified Research Gaps')
  result.gaps.forEach((g) => {
    lines.push(`- **[${g.gapType.toUpperCase()}]** ${g.topic}: ${g.description} (Priority: ${g.priority}/10)`)
  })
  lines.push('')

  lines.push('## Methodology Trends')
  lines.push('| Method | Frequency | Trend |')
  lines.push('|--------|-----------|-------|')
  result.methodologyTrends.forEach((m) => {
    lines.push(`| ${m.method} | ${m.frequency} | ${m.trend} |`)
  })
  lines.push('')

  if (result.citationGraph.length > 0) {
    lines.push('## Citation Network (Top Connections)')
    result.citationGraph.slice(0, 15).forEach((c) => {
      lines.push(`- ${c.from.substring(0, 40)} → ${c.to.substring(0, 40)} (strength: ${c.strength})`)
    })
  }

  return lines.join('\n')
}

// ==================== TOOL 2: HESIS_GEN ====================

function generateHypotheses(input: HypothesisInput): HypothesisResult {
  const problemSpace = exploreProblemSpace(input)
  const counterfactuals = generateCounterfactuals(input)
  const hypotheses = buildHypotheses(input, counterfactuals)
  const ranked = rankHypotheses(hypotheses)

  return {
    problemSpace,
    counterfactuals,
    hypotheses: ranked,
    recommendedHypothesis: ranked.length > 0 ? ranked[0].id ?? 'H1' : 'H1'
  }
}

function exploreProblemSpace(input: HypothesisInput): HypothesisResult['problemSpace'] {
  const dimensions = ['theoretical', 'empirical', 'methodological', 'applied', 'translational']
  return dimensions.map((dim) => ({
    dimension: dim,
    currentState: `Existing knowledge about ${input.researchQuestion} in ${dim} dimension`,
    targetState: `Novel understanding that advances ${dim} boundaries`,
    keyChallenge: `Bridging gap between current and target ${dim} state`
  }))
}

function generateCounterfactuals(input: HypothesisInput): HypothesisResult['counterfactuals'] {
  return [
    {
      scenario: `If ${input.knownFactors[0]?.factor ?? 'key factor'} were absent`,
      expectedOutcome: 'Expected null effect on outcome, suggesting necessity',
      insight: 'Necessity test for causal factors'
    },
    {
      scenario: `If the relationship between ${input.targetPopulation ?? 'subjects'} and outcome were reversed`,
      expectedOutcome: 'Contradiction with existing literature, indicating boundary conditions',
      insight: 'Boundary condition exploration'
    },
    {
      scenario: `If measurement occurred at a different timescale`,
      expectedOutcome: 'Temporal dynamics may reveal hidden patterns',
      insight: 'Temporal sensitivity analysis'
    }
  ]
}

function buildHypotheses(input: HypothesisInput, counterfactuals: HypothesisResult['counterfactuals']): HypothesisResult['hypotheses'] {
  const hyps: HypothesisResult['hypotheses'] = [
    {
      id: 'H1',
      statement: `${input.knownFactors[0]?.factor ?? 'Primary factor'} positively influences the outcome variable in ${input.targetPopulation ?? 'the target population'}`,
      type: 'directional',
      testability: 9,
      noveltyScore: 6,
      feasibilityScore: 8,
      riskLevel: 'low',
      risks: [{ type: 'null result', severity: 'medium', mitigation: 'Collect sufficient power; pre-register analysis plan' }],
      requiredEvidence: 'Correlation and temporal precedence establishment',
      implications: 'If confirmed, supports theoretical model and suggests intervention pathways'
    },
    {
      id: 'H2',
      statement: `The effect of ${input.knownFactors[0]?.factor ?? 'primary factor'} on outcome is moderated by ${input.knownFactors[1]?.factor ?? 'contextual variable'}`,
      type: 'directional',
      testability: 8,
      noveltyScore: 7,
      feasibilityScore: 7,
      riskLevel: 'medium',
      risks: [
        { type: 'interaction non-significant', severity: 'low', mitigation: 'Ensure adequate cell sizes for all moderator levels' },
        { type: 'confounding', severity: 'medium', mitigation: 'Control for known confounds' }
      ],
      requiredEvidence: 'Moderation analysis with significant interaction term',
      implications: 'Reveals boundary conditions and contextual factors'
    },
    {
      id: 'H3',
      statement: `There is no significant relationship between ${input.knownFactors[0]?.factor ?? 'factor'} and outcome when controlling for ${input.constraints?.join(', ') ?? 'confounds'}`,
      type: 'null',
      testability: 10,
      noveltyScore: 5,
      feasibilityScore: 9,
      riskLevel: 'low',
      risks: [{ type: 'Type II error', severity: 'medium', mitigation: 'Bayesian analysis to quantify evidence for null' }],
      requiredEvidence: 'Non-significant effect with adequate power and Bayesian evidence',
      implications: 'Challenges prevailing assumptions and redirects theoretical focus'
    },
    {
      id: 'H4',
      statement: `A novel mechanism accounts for the variance in outcome unexplained by existing factors in ${input.domain}`,
      type: 'alternative',
      testability: 6,
      noveltyScore: 9,
      feasibilityScore: 5,
      riskLevel: 'high',
      risks: [
        { type: 'speculative', severity: 'high', mitigation: 'Ground in qualitative data first; use triangulation' },
        { type: 'measurement', severity: 'medium', mitigation: 'Develop and validate new instrument if needed' }
      ],
      requiredEvidence: 'Novel mechanism explanation with supporting data',
      implications: 'Paradigm-shifting if confirmed; opens new research avenue'
    }
  ]

  if (input.noveltyDirection === 'high-risk') {
    hyps.push({
      id: 'H5',
      statement: `Contrary to established theory in ${input.domain}, the relationship is inverse when ${input.knownFactors[0]?.factor ?? 'factor'} exceeds critical threshold`,
      type: 'directional',
      testability: 7,
      noveltyScore: 10,
      feasibilityScore: 4,
      riskLevel: 'high',
      risks: [
        { type: 'replication', severity: 'high', mitigation: 'Multi-site replication; pre-registration' },
        { type: 'measurement validity', severity: 'high', mitigation: 'Sensitivity analysis across operationalizations' }
      ],
      requiredEvidence: 'Significant inverse effect replicated across settings',
      implications: 'Major theoretical revision; high impact'
    })
  }

  return hyps
}

function rankHypotheses(hypotheses: HypothesisResult['hypotheses']): HypothesisResult['hypotheses'] {
  return hypotheses
    .map((h) => ({
      ...h,
      testability: h.testability,
      noveltyScore: h.noveltyScore,
      feasibilityScore: h.feasibilityScore
    }))
    .sort((a, b) => {
      const scoreA = a.testability * 0.35 + a.noveltyScore * 0.35 + a.feasibilityScore * 0.3
      const scoreB = b.testability * 0.35 + b.noveltyScore * 0.35 + b.feasibilityScore * 0.3
      return scoreB - scoreA
    })
    .map((h, i) => ({ ...h, id: `H${i + 1}` }))
}

function formatHypothesisReport(result: HypothesisResult): string {
  const lines: string[] = []
  lines.push('# Hypothesis Generation Report — ResearchOS')
  lines.push('')
  lines.push(`**Recommended Hypothesis:** ${result.recommendedHypothesis}`)
  lines.push('')

  lines.push('## Problem Space Analysis')
  result.problemSpace.forEach((ps) => {
    lines.push(`### ${ps.dimension.toUpperCase()} Dimension`)
    lines.push(`- Current: ${ps.currentState}`)
    lines.push(`- Target: ${ps.targetState}`)
    lines.push(`- Challenge: ${ps.keyChallenge}`)
  })
  lines.push('')

  lines.push('## Counterfactual Reasoning')
  result.counterfactuals.forEach((c, i) => {
    lines.push(`### Scenario ${i + 1}: ${c.scenario}`)
    lines.push(`- Expected: ${c.expectedOutcome}`)
    lines.push(`- Insight: ${c.insight}`)
  })
  lines.push('')

  lines.push('## Ranked Hypotheses')
  result.hypotheses.forEach((h) => {
    lines.push(`### ${h.id} [${h.type.toUpperCase()}] (Score: ${((h.testability * 0.35 + h.noveltyScore * 0.35 + h.feasibilityScore * 0.3)).toFixed(1)})`)
    lines.push(`> ${h.statement}`)
    lines.push(`- Testability: ${h.testability}/10 | Novelty: ${h.noveltyScore}/10 | Feasibility: ${h.feasibilityScore}/10`)
    lines.push(`- Risk Level: **${h.riskLevel.toUpperCase()}**`)
    lines.push('- Risks:')
    h.risks.forEach((r) => lines.push(`  - [${r.severity}] ${r.type}: ${r.mitigation}`))
    lines.push(`- Required Evidence: ${h.requiredEvidence}`)
    lines.push(`- Implications: ${h.implications}`)
    lines.push('')
  })

  return lines.join('\n')
}

// ==================== TOOL 3: EXPERIMENT_DESIGNER ====================

function designExperiment(input: ExperimentInput): ExperimentResult {
  const design = determineDesignType(input)
  const sampleSize = calculateSampleSize(input)
  const controlProcedures = setupControls(input)
  const powerAnalysis = performPowerAnalysis(input, sampleSize.perGroup)
  const workflow = generateWorkflow(design, sampleSize, input)
  const threats = identifyThreats(input, controlProcedures)

  return {
    design,
    sampleSize,
    controlProcedures,
    powerAnalysis,
    workflow,
    threats
  }
}

function determineDesignType(input: ExperimentInput): ExperimentResult['design'] {
  const factors: ExperimentResult['design']['factors'] = []
  const hasBetween = input.independentVars.some((v) => v.type === 'between')
  const hasWithin = input.independentVars.some((v) => v.type === 'within')

  input.independentVars.forEach((v) => {
    factors.push({ name: v.name, role: 'IV', levels: v.levels })
  })

  let type = 'Between-subjects'
  if (hasBetween && hasWithin) type = 'Mixed factorial'
  else if (hasWithin) type = 'Within-subjects (repeated measures)'

  const notation = input.independentVars.map((v) => `${v.levels}`).join(' x ')

  return {
    type,
    factors,
    designNotation: `${notation} ${type}`
  }
}

function calculateSampleSize(input: ExperimentInput): ExperimentResult['sampleSize'] {
  const effectSize = input.expectedEffectSize
  const alpha = input.alphaLevel
  const power = input.desiredPower

  const zAlpha = 1.96
  const zBeta = 0.84
  const N = Math.ceil(((zAlpha + zBeta) ** 2 * 2) / (effectSize ** 2))

  const numGroups = input.independentVars.reduce((prod, v) => prod * v.levels, 1)
  const total = N * numGroups
  const perGroup = N

  const achievedPower = calculateAchievedPower(total, effectSize, alpha)

  const assumptions = [
    `Expected effect size: d = ${effectSize}`,
    `Alpha level: ${alpha}`,
    `Desired power: ${power}`,
    `Normality assumed for parametric tests`,
    `Equal group sizes assumed`,
    `No attrition accounted for — consider 15% buffer`
  ]

  if (input.budget?.maxParticipants && total > input.budget.maxParticipants) {
    assumptions.push(`WARNING: Required N (${total}) exceeds budget limit (${input.budget.maxParticipants})`)
  }

  return { total, perGroup, powerAchieved: achievedPower, assumptions }
}

function calculateAchievedPower(totalN: number, effectSize: number, alpha: number): number {
  const se = Math.sqrt(2 / (totalN / 2))
  const ncp = effectSize / se
  const zAlpha = 1.96
  const zBeta = ncp - zAlpha
  const power = 0.5 * (1 + erf(zBeta / Math.sqrt(2)))
  return Math.round(power * 100) / 100
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1
  const ax = Math.abs(x)
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const t = 1.0 / (1.0 + p * ax)
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return sign * y
}

function setupControls(input: ExperimentInput): ExperimentResult['controlProcedures'] {
  return {
    randomization: {
      method: 'Computer-generated block randomization',
      description: 'Block size varies to prevent prediction; stratified by key demographics if applicable'
    },
    blinding: {
      level: input.independentVars.length > 1 ? 'double' : 'single',
      description: input.independentVars.length > 1
        ? 'Both participants and experimenters blind to condition assignment'
        : 'Participants blind to hypothesis; experimenter blind to condition where feasible',
      feasibility: input.independentVars.some((v) => v.name.toLowerCase().includes('awareness')) ? 'Not applicable' : 'High'
    },
    controls: [
      { type: 'Random assignment', description: 'Participants randomly allocated to conditions' },
      ...(input.confoundingVars ?? []).map((cv) => ({ type: `Control: ${cv}`, description: `Statistically controlled or matched across groups` })),
      { type: 'Counterbalancing', description: 'Order of within-subject conditions counterbalanced (Latin square)' },
      { type: 'Manipulation check', description: 'Verify experimental manipulation was effective' },
      { type: 'Attention checks', description: 'Embedded checks to filter inattentive participants' }
    ]
  }
}

function performPowerAnalysis(input: ExperimentInput, _perGroup: number): ExperimentResult['powerAnalysis'] {
  const effectSize = input.expectedEffectSize
  const alpha = input.alphaLevel
  const sensitivityCurve: Array<{ n: number; power: number }> = []

  for (let n = 10; n <= 200; n += 10) {
    const power = calculateAchievedPower(n * 2, effectSize, alpha)
    sensitivityCurve.push({ n, power })
  }

  let recommendedN = 30
  for (const point of sensitivityCurve) {
    if (point.power >= input.desiredPower) {
      recommendedN = point.n * 2
      break
    }
  }

  return {
    effectSize,
    alpha,
    power: calculateAchievedPower(recommendedN, effectSize, alpha),
    sensitivityCurve,
    recommendedN
  }
}

function generateWorkflow(design: ExperimentResult['design'], sampleSize: ExperimentResult['sampleSize'], _input: ExperimentInput): ExperimentResult['workflow'] {
  return [
    { step: 1, phase: 'Preparation', action: 'IRB approval and pre-registration', duration: '2-4 weeks' },
    { step: 2, phase: 'Preparation', action: 'Stimulus and material development', duration: '1-2 weeks' },
    { step: 3, phase: 'Preparation', action: 'Pilot study (n=10) and refinement', duration: '1 week' },
    { step: 4, phase: 'Data Collection', action: `Recruit ${sampleSize.total} participants`, duration: '3-6 weeks' },
    { step: 5, phase: 'Data Collection', action: 'Random assignment and experiment sessions', duration: '2-4 weeks' },
    { step: 6, phase: 'Analysis', action: 'Data cleaning and assumption checking', duration: '1 week' },
    { step: 7, phase: 'Analysis', action: `Primary analysis (${design.type})`, duration: '1 week' },
    { step: 8, phase: 'Analysis', action: 'Sensitivity and robustness analyses', duration: '1 week' },
    { step: 9, phase: 'Reporting', action: 'Results documentation and visualization', duration: '1-2 weeks' },
    { step: 10, phase: 'Reporting', action: 'Open data and code preparation', duration: '1 week' }
  ]
}

function identifyThreats(input: ExperimentInput, controls: ExperimentResult['controlProcedures']): ExperimentResult['threats'] {
  const threats: ExperimentResult['threats'] = [
    { threat: 'Selection bias', severity: 'low', mitigation: controls.randomization.description },
    { threat: 'Attrition', severity: 'medium', mitigation: 'Intent-to-treat analysis; 15% over-recruitment buffer' },
    { threat: 'Experimenter bias', severity: 'low', mitigation: `${controls.blinding.level}-blind design` },
    { threat: 'Demand characteristics', severity: 'medium', mitigation: 'Manipulation checks; funnel debriefing' },
    { threat: 'Testing effects', severity: 'medium', mitigation: 'Include control group; counterbalance order' }
  ]

  if (input.independentVars.some((v) => v.type === 'within')) {
    threats.push({ threat: 'Carryover effects', severity: 'medium', mitigation: 'Counterbalancing; washout periods' })
  }

  return threats
}

function formatExperimentReport(result: ExperimentResult): string {
  const lines: string[] = []
  lines.push('# Experiment Design Report — ResearchOS')
  lines.push('')
  lines.push('## Design Overview')
  lines.push(`**Design:** ${result.design.designNotation}`)
  lines.push(`**Type:** ${result.design.type}`)
  lines.push('')
  lines.push('### Factors')
  result.design.factors.forEach((f) => {
    lines.push(`- ${f.name}: ${f.role} (${f.levels} levels)`)
  })
  lines.push('')

  lines.push('## Sample Size')
  lines.push(`- Total required: **${result.sampleSize.total}**`)
  lines.push(`- Per group: **${result.sampleSize.perGroup}**`)
  lines.push(`- Achieved power: **${result.sampleSize.powerAchieved}**`)
  lines.push('')
  lines.push('### Assumptions')
  result.sampleSize.assumptions.forEach((a) => lines.push(`- ${a}`))
  lines.push('')

  lines.push('## Control Procedures')
  lines.push(`- **Randomization:** ${result.controlProcedures.randomization.method}`)
  lines.push(`- **Blinding:** ${result.controlProcedures.blinding.level}-blind — ${result.controlProcedures.blinding.description}`)
  lines.push('- **Controls:**')
  result.controlProcedures.controls.forEach((c) => lines.push(`  - ${c.type}: ${c.description}`))
  lines.push('')

  lines.push('## Power Analysis')
  lines.push(`- Effect size: ${result.powerAnalysis.effectSize}`)
  lines.push(`- Recommended N: ${result.powerAnalysis.recommendedN}`)
  lines.push('| N per group | Power |')
  lines.push('|------------|-------|')
  result.powerAnalysis.sensitivityCurve.forEach((p) => {
    lines.push(`| ${p.n} | ${p.power.toFixed(3)} |`)
  })
  lines.push('')

  lines.push('## Experimental Workflow')
  lines.push('| Step | Phase | Action | Duration |')
  lines.push('|------|-------|--------|----------|')
  result.workflow.forEach((w) => {
    lines.push(`| ${w.step} | ${w.phase} | ${w.action} | ${w.duration} |`)
  })
  lines.push('')

  lines.push('## Threats to Validity')
  lines.push('| Threat | Severity | Mitigation |')
  lines.push('|--------|----------|------------|')
  result.threats.forEach((t) => {
    lines.push(`| ${t.threat} | ${t.severity} | ${t.mitigation} |`)
  })

  return lines.join('\n')
}

// ==================== TOOL 4: DATA_PIPELINE ====================

function processDataPipeline(input: DatasetInput): DataPipelineResult {
  const cleaning = planCleaning(input)
  const features = planFeatures(input)
  const quality = assessQuality(input)
  const version = setupVersioning(input)
  const card = generateDataCard(input, quality, cleaning)

  return { cleaning, featureEngineering: features, qualityReport: quality, versionControl: version, dataCard: card }
}

function planCleaning(input: DatasetInput): DataPipelineResult['cleaning'] {
  const actions: DataPipelineResult['cleaning'] = []

  for (const col of input.columns) {
    if (col.missingPct > 5) {
      actions.push({
        action: col.missingPct > 30 ? 'Consider excluding variable' : 'Multiple imputation',
        affectedColumns: [col.name],
        rationale: `${col.missingPct}% missing data`,
        impact: col.missingPct > 30 ? 'Significant reduction in variables' : 'Preserves sample size; introduces minor bias'
      })
    }
    if (col.type === 'numeric') {
      actions.push({
        action: 'Winsorize outliers (>3 SD)',
        affectedColumns: [col.name],
        rationale: 'Reduce influence of extreme values',
        impact: 'Slight reduction in variance but improved robustness'
      })
    }
  }

  actions.push({
    action: 'Check for duplicate records',
    affectedColumns: input.columns.map((c) => c.name),
    rationale: 'Data integrity assurance',
    impact: 'Removes data entry errors'
  })

  return actions
}

function planFeatures(input: DatasetInput): DataPipelineResult['featureEngineering'] {
  const features: DataPipelineResult['featureEngineering'] = []
  const numericCols = input.columns.filter((c) => c.type === 'numeric')

  if (numericCols.length >= 2) {
    features.push({
      feature: 'Interaction terms',
      method: 'Product of standardized variables',
      purpose: 'Capture moderation effects between numeric predictors'
    })
    features.push({
      feature: 'Polynomial terms',
      method: 'Quadratic transformation',
      purpose: 'Capture non-linear relationships'
    })
  }

  const catCols = input.columns.filter((c) => c.type === 'categorical' || c.type === 'ordinal')
  if (catCols.length > 0) {
    features.push({
      feature: 'One-hot encoding',
      method: 'Dummy variable creation',
      purpose: 'Convert categorical variables for analysis',
    })
  }

  features.push({
    feature: 'Standardization (z-scores)',
    method: '(x - mean) / std',
    purpose: 'Compare variables on common scale; improve model convergence'
  })

  return features
}

function assessQuality(input: DatasetInput): DataPipelineResult['qualityReport'] {
  const completeness = 100 - input.columns.reduce((s, c) => s + c.missingPct, 0) / input.columns.length
  const consistency = Math.max(0, 100 - input.columns.filter((c) => c.missingPct > 20).length * 10)
  const accuracy = Math.min(100, 85 + input.columns.length * 3)
  const overall = Math.round((completeness + consistency + accuracy) / 3)

  return {
    completeness: Math.round(completeness * 10) / 10,
    consistency: Math.round(consistency * 10) / 10,
    accuracy: Math.round(accuracy * 10) / 10,
    overall
  }
}

function setupVersioning(input: DatasetInput): DataPipelineResult['versionControl'] {
  const changes = [
    'Raw data snapshot created',
    'Cleaning log initialized',
    'Processing scripts versioned'
  ]

  return {
    currentVersion: input.version,
    changes,
    reproducibility: [
      'Random seeds set to 42',
      'Package versions recorded',
      'Processing order documented',
      'Environment container recommended'
    ],
    snapshot: `${input.datasetName}_v${input.version}_${Date.now()}`
  }
}

function generateDataCard(input: DatasetInput, quality: DataPipelineResult['qualityReport'], cleaning: DataPipelineResult['cleaning']): DataPipelineResult['dataCard'] {
  return {
    name: input.datasetName,
    description: input.description,
    provenance: `Collected via ${input.collectionMethod}, ${input.rowCount} records, ${input.columns.length} variables`,
    limitations: input.ethicalConsiderations ?? ['Dataset quality depends on self-report accuracy'],
    recommendations: [
      `Overall quality: ${quality.overall}/100`,
      `Cleaning actions: ${cleaning.length} procedures applied`,
      'Recommended for: ' + input.intendedUse,
      'Consider: Out-of-sample validation before drawing conclusions'
    ],
    schema: input.columns.map((c) => ({
      field: c.name,
      type: c.type,
      description: `${c.type} variable with ${c.uniqueCount} unique values (${c.missingPct}% missing)`
    }))
  }
}

function formatDataPipelineReport(result: DataPipelineResult): string {
  const lines: string[] = []
  lines.push('# Data Pipeline Report — ResearchOS')
  lines.push('')
  lines.push('## Quality Assessment')
  lines.push(`| Dimension | Score |`)
  lines.push(`|-----------|-------|`)
  lines.push(`| Completeness | ${result.qualityReport.completeness}% |`)
  lines.push(`| Consistency | ${result.qualityReport.consistency}% |`)
  lines.push(`| Accuracy | ${result.qualityReport.accuracy}% |`)
  lines.push(`| **Overall** | **${result.qualityReport.overall}/100** |`)
  lines.push('')

  lines.push('## Cleaning Actions')
  result.cleaning.forEach((c, i) => {
    lines.push(`${i + 1}. **${c.action}** → ${c.affectedColumns.join(', ')}`)
    lines.push(`   - Rationale: ${c.rationale} | Impact: ${c.impact}`)
  })
  lines.push('')

  lines.push('## Feature Engineering')
  result.featureEngineering.forEach((f) => {
    lines.push(`- **${f.feature}**: ${f.method} → ${f.purpose}`)
  })
  lines.push('')

  lines.push('## Version Control')
  lines.push(`- Version: **${result.versionControl.currentVersion}**`)
  lines.push(`- Snapshot: \`${result.versionControl.snapshot}\``)
  lines.push('- Reproducibility steps:')
  result.versionControl.reproducibility.forEach((r) => lines.push(`  - ${r}`))
  lines.push('')

  lines.push('## Data Card')
  lines.push(`**${result.dataCard.name}**`)
  lines.push(`> ${result.dataCard.description}`)
  lines.push(`Provenance: ${result.dataCard.provenance}`)
  lines.push('')
  lines.push('Schema:')
  lines.push('| Field | Type | Description |')
  lines.push('|-------|------|-------------|')
  result.dataCard.schema.forEach((s) => {
    lines.push(`| ${s.field} | ${s.type} | ${s.description} |`)
  })

  return lines.join('\n')
}

// ==================== TOOL 5: PAPER_OUTLINER ====================

function generatePaperOutline(input: PaperOutlineInput): PaperOutlineResult {
  const structure = buildIMRADStructure(input)
  const figures = positionFigures(input)
  const journal = matchJournal(input)
  const citations = mapCitations(input)
  const flow = generateFlow(structure)

  return {
    structure,
    figures,
    targetJournal: journal,
    citationMap: citations,
    outlineFlow: flow
  }
}

function buildIMRADStructure(input: PaperOutlineInput): PaperOutlineResult['structure'] {
  const type = input.submissionType ?? 'original'
  const wordCounts: Record<string, number> = { original: 8000, review: 12000, short: 3000, perspective: 4000, 'case-study': 5000 }
  const totalWords = wordCounts[type] ?? 8000

  const introWords = Math.round(totalWords * 0.15)
  const methodsWords = Math.round(totalWords * 0.25)
  const resultsWords = Math.round(totalWords * 0.30)
  const discussionWords = Math.round(totalWords * 0.25)
  const abstractWords = Math.round(totalWords * 0.05)

  const refs = input.references ?? []
  const figs = input.figures ?? []

  return [
    {
      section: 'Abstract',
      content: `${abstractWords}-word structured summary: Background, Objective, Methods, Results, Conclusion`,
      wordCount: abstractWords,
      figures: [],
      citations: []
    },
    {
      section: 'Introduction',
      content: `Establish context and knowledge gap (cite ${refs.filter((r) => r.usage.includes('background')).map((r) => r.key).join(', ') || 'key refs'}). State objectives and hypotheses. End with research questions.`,
      wordCount: introWords,
      figures: figs.filter((f) => f.placement.toLowerCase().includes('intro')).map((f) => f.id),
      citations: refs.filter((r) => r.usage.toLowerCase().includes('background') || r.usage.toLowerCase().includes('context')).map((r) => r.key)
    },
    {
      section: 'Methods',
      content: `Design: ${input.methodology}. Participants, materials, procedure. Analysis plan with pre-registration link. Ethics approval statement.`,
      wordCount: methodsWords,
      figures: figs.filter((f) => f.type === 'diagram' && f.placement.toLowerCase().includes('method')).map((f) => f.id),
      citations: refs.filter((r) => r.usage.toLowerCase().includes('method')).map((r) => r.key)
    },
    {
      section: 'Results',
      content: input.keyFindings.map((kf) => `- ${kf.finding} (evidence: ${kf.evidenceStrength})`).join('\n'),
      wordCount: resultsWords,
      figures: figs.filter((f) => f.type === 'graph' || f.type === 'table').map((f) => f.id),
      citations: refs.filter((r) => r.usage.toLowerCase().includes('result') || r.usage.toLowerCase().includes('comparison')).map((r) => r.key)
    },
    {
      section: 'Discussion',
      content: `Interpret findings relative to hypotheses. Compare with prior work. Address limitations. Discuss implications for theory and practice.`,
      wordCount: discussionWords,
      figures: [],
      citations: refs.filter((r) => r.usage.toLowerCase().includes('discussion') || r.usage.toLowerCase().includes('compare')).map((r) => r.key)
    }
  ]
}

function positionFigures(input: PaperOutlineInput): PaperOutlineResult['figures'] {
  const figs = input.figures ?? []
  return figs.map((f, i) => ({
    id: f.id,
    type: f.type,
    caption: f.caption,
    section: f.placement,
    priority: i + 1
  }))
}

function matchJournal(input: PaperOutlineInput): PaperOutlineResult['targetJournal'] {
  const journal = input.targetJournal ?? matchByKeywords(input.abstract)

  const journals: Record<string, { scope: string; alignWords: number; tips: string[] }> = {
    'Nature': { scope: 'High-impact interdisciplinary research', alignWords: 5, tips: ['Emphasize broad significance', 'Concise writing preferred', 'Include Data Availability statement'] },
    'Science': { scope: 'Groundbreaking research with wide implications', alignWords: 5, tips: ['State broader impacts clearly', ' methods supplement required', 'Peer review is selective'] },
    'PNAS': { scope: 'Original research of outstanding importance', alignWords: 4, tips: ['Accompanying introduction by member helps', 'Max 6 pages', 'Supplementary materials allowed'] },
    'IEEE': { scope: 'Engineering and technology applications', alignWords: 4, tips: ['Focus on technical novelty', 'Include performance benchmarks', 'IEEE format required'] },
    'PLOS ONE': { scope: 'Methodologically sound research', alignWords: 3, tips: ['No novelty threshold', 'Open data encouraged', 'APC applies'] },
    'arXiv': { scope: 'Rapid dissemination of preprints', alignWords: 2, tips: ['No peer review', 'Timestamped priority claim', 'Update versions regularly'] }
  }

  const info = journals[journal] ?? {
    scope: 'General academic research',
    alignWords: 3,
    tips: ['Check journal-specific formatting', 'Review recent published articles', 'Ensure word count compliance']
  }

  return {
    name: journal,
    matchScore: info.alignWords * 20,
    scopeAlignment: info.scope,
    requirements: [
      `Word limit: ${getWordLimit(journal)}`,
      'Structured abstract required',
      'Data/code availability statement',
      'Conflicts of interest declaration',
      'Author contributions statement'
    ],
    tips: info.tips
  }
}

function matchByKeywords(abstract: string): string {
  const lower = abstract.toLowerCase()
  const keywords: Record<string, string[]> = {
    'Nature': ['fundamental', 'breakthrough', 'interdisciplinary', 'broad implications'],
    'Science': ['novel mechanism', 'first demonstration', 'transformative'],
    'IEEE': ['algorithm', 'system design', 'engineering', 'implementation'],
    'PLOS ONE': ['empirical study', 'methodology', 'validation'],
    'arXiv': ['preprint', 'working paper', 'extension']
  }

  let bestMatch = 'PLOS ONE'
  let bestScore = 0
  for (const [journal, kws] of Object.entries(keywords)) {
    const score = kws.filter((kw) => lower.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = journal
    }
  }
  return bestMatch
}

function getWordLimit(journal: string): string {
  const limits: Record<string, string> = {
    'Nature': '3,000 (Research Article)',
    'Science': '4,500 (Research Article)',
    'PNAS': '6,000',
    'IEEE': '8,000 (Transactions)',
    'PLOS ONE': 'No fixed limit',
    'arXiv': 'No limit'
  }
  return limits[journal] ?? 'Check journal guidelines'
}

function mapCitations(input: PaperOutlineInput): PaperOutlineResult['citationMap'] {
  const refs = input.references ?? []
  return refs.map((r) => ({
    inText: `(${r.authors}, ${r.year})`,
    references: [r.key],
    context: r.usage
  }))
}

function generateFlow(structure: PaperOutlineResult['structure']): PaperOutlineResult['outlineFlow'] {
  return structure.map((s, i) => ({
    section: s.section,
    purpose: getSectionPurpose(s.section),
    transition: i < structure.length - 1 ? `Connects to ${structure[i + 1].section}` : 'Conclusions and future directions'
  }))
}

function getSectionPurpose(section: string): string {
  const purposes: Record<string, string> = {
    'Abstract': 'Summarize entire paper for indexing and quick evaluation',
    'Introduction': 'Establish motivation, gap, and research questions',
    'Methods': 'Provide sufficient detail for replication',
    'Results': 'Present findings objectively without interpretation',
    'Discussion': 'Interpret findings, acknowledge limitations, suggest implications'
  }
  return purposes[section] ?? 'Provide detailed content'
}

function formatPaperOutlineReport(result: PaperOutlineResult): string {
  const lines: string[] = []
  lines.push('# Paper Structure Report — ResearchOS')
  lines.push('')
  lines.push('## IMRAD Structure')
  result.structure.forEach((s) => {
    lines.push(`### ${s.section} (~${s.wordCount} words)`)
    lines.push(`${s.content.substring(0, 100)}${s.content.length > 100 ? '...' : ''}`)
    if (s.figures.length > 0) lines.push(`Figures: ${s.figures.join(', ')}`)
    if (s.citations.length > 0) lines.push(`Citations: ${s.citations.join(', ')}`)
    lines.push('')
  })

  lines.push('## Figure Placement')
  result.figures.forEach((f) => {
    lines.push(`- **${f.id}** [${f.type}] in ${f.section}: ${f.caption.substring(0, 60)}`)
  })
  lines.push('')

  lines.push('## Target Journal')
  lines.push(`**${result.targetJournal.name}** (Match: ${result.targetJournal.matchScore}%)`)
  lines.push(`Scope: ${result.targetJournal.scopeAlignment}`)
  lines.push('Tips:')
  result.targetJournal.tips.forEach((t) => lines.push(`- ${t}`))
  lines.push('')

  lines.push('## Citation Map')
  result.citationMap.forEach((c) => {
    lines.push(`- ${c.inText} → ${c.references.join(', ')} (${c.context})`)
  })
  lines.push('')

  lines.push('## Paper Flow')
  result.outlineFlow.forEach((f) => {
    lines.push(`- **${f.section}**: ${f.purpose}`)
  })

  return lines.join('\n')
}

// ==================== TOOL 6: PEER_REVIEW_SIM ====================

function simulatePeerReview(input: PeerReviewInput): PeerReviewResult {
  const methodology = reviewMethodology(input)
  const stats = reviewStatistics(input)
  const reproducibility = assessReproducibility(input)
  const strengths = identifyStrengths(input, methodology, stats)
  const weaknesses = identifyWeaknesses(input, methodology, stats, reproducibility)
  const questions = generateQuestions(input, weaknesses, stats)
  const score = calculateOverallScore(methodology, stats, reproducibility)
  const recommendation = makeRecommendation(score, weaknesses)

  return {
    overallScore: score,
    recommendation,
    methodologyReview: methodology,
    statisticalReview: stats,
    reproducibility,
    strengths,
    weaknesses,
    questionsForAuthor: questions
  }
}

function reviewMethodology(input: PeerReviewInput): PeerReviewResult['methodologyReview'] {
  const errors: string[] = []
  let designValidity = 7

  const design = input.methodology.design.toLowerCase()
  if (design.includes('cross-sectional') && input.claims.some((c) => c.claim.includes('causal'))) {
    errors.push('Cross-sectional design cannot support causal claims')
    designValidity -= 3
  }

  const sampling = input.methodology.participants.includes('random') || input.methodology.participants.includes('representative')
    ? 'Probability sampling enhances generalizability'
    : 'Convenience sampling limits generalizability'

  if (!sampling.includes('Probability')) errors.push('Non-probability sampling noted')

  return {
    designValidity: Math.max(1, Math.min(10, designValidity)),
    sampling,
    measurement: input.methodology.measures || 'Measurement detail not provided',
    confoundControl: input.methodology.analysis.includes('control') || input.methodology.analysis.includes('covariate')
    ? 'Confounds addressed analytically'
    : 'Confounds not explicitly addressed',
    errors
  }
}

function reviewStatistics(input: PeerReviewInput): PeerReviewResult['statisticalReview'] {
  const tests: PeerReviewResult['statisticalReview']['tests'] = []
  const assumptions: string[] = []
  const recommendations: string[] = []

  for (const r of input.results) {
    const appropriate = r.pValue <= 1 && r.pValue >= 0 && r.testUsed.length > 0
    const concerns: string[] = []
    if (r.pValue > 0 && r.pValue < 0.001) concerns.push('Very small p-value: check for data errors')
    if (!r.confidenceInterval && r.significant) concerns.push('Confidence interval recommended')
    if (!r.effectSize && r.significant) concerns.push('Effect size not reported')

    tests.push({ test: r.testUsed, appropriate, concerns })
  }

  if (input.results.length > 3) {
    recommendations.push('Consider correction for multiple comparisons (Bonferroni or FDR)')
    assumptions.push('Multiple testing correction may be needed')
  }

  if (input.results.some((r) => r.pValue > 0.05)) {
    recommendations.push('Report null results with confidence intervals and power analysis')
  }

  // ts type challenge fix: declare array explicitly typed
  const corrections = input.results.length > 3 ? 'Bonferroni or Benjamini-Hochberg recommended' : 'No correction needed for small number of tests'

  return {
    tests,
    assumptions,
    corrections,
    powerMention: input.methodology.analysis?.toLowerCase().includes('power') ?? false,
    recommendations
  }
}

function assessReproducibility(input: PeerReviewInput): PeerReviewResult['reproducibility'] {
  const concerns: string[] = []
  let score = 5

  if (input.methodology.replicationInfo) {
    score += 2
  } else {
    concerns.push('No replication information provided')
  }

  const dataAvail = input.methodology.replicationInfo?.toLowerCase().includes('data available') ?? false
  if (dataAvail) score += 1
  else concerns.push('Data availability statement missing')

  const codeAvail = input.methodology.replicationInfo?.toLowerCase().includes('code available') ?? false
  if (codeAvail) score += 1
  else concerns.push('Code/analysis scripts not mentioned')

  return {
    score: Math.min(10, score),
    dataAvailability: dataAvail ? 'Data publicly available' : 'Not specified',
    codeAvailability: codeAvail ? 'Code shared' : 'Not specified',
    materialsList: ((input.methodology as Record<string, unknown>)['materials'] as unknown[])?.length > 0,
    preregistered: input.methodology.replicationInfo?.toLowerCase().includes('preregister') ?? false,
    concerns
  }
}

function identifyStrengths(input: PeerReviewInput, methodology: PeerReviewResult['methodologyReview'], stats: PeerReviewResult['statisticalReview']): PeerReviewResult['strengths'] {
  const strengths: PeerReviewResult['strengths'] = []

  if (methodology.designValidity >= 7) {
    strengths.push({ aspect: 'Research Design', quote: input.methodology.design, rating: methodology.designValidity })
  }

  if (input.results.filter((r) => r.significant).length > 0) {
    strengths.push({
      aspect: 'Statistical Evidence',
      quote: `${input.results.filter((r) => r.significant).length}/${input.results.length} hypotheses supported`,
      rating: Math.min(10, input.results.filter((r) => r.significant).length * 2)
    })
  }

  if (stats.tests.every((t) => t.appropriate)) {
    strengths.push({ aspect: 'Statistical Appropriateness', quote: 'All tests appear appropriate for hypotheses', rating: 8 })
  }

  if (input.methodology.replicationInfo?.toLowerCase().includes('preregister')) {
    strengths.push({ aspect: 'Transparency', quote: 'Study is preregistered', rating: 9 })
  }

  if (input.discussion.limitations.length >= 2) {
    strengths.push({ aspect: 'Self-Awareness', quote: `${input.discussion.limitations.length} limitations acknowledged`, rating: 8 })
  }

  return strengths.sort((a, b) => b.rating - a.rating)
}

function identifyWeaknesses(input: PeerReviewInput, methodology: PeerReviewResult['methodologyReview'], stats: PeerReviewResult['statisticalReview'], reproducibility: PeerReviewResult['reproducibility']): PeerReviewResult['weaknesses'] {
  const weaknesses: PeerReviewResult['weaknesses'] = []

  methodology.errors.forEach((e) => weaknesses.push({ aspect: 'Methodology', issue: e, severity: 'major' }))

  stats.tests.forEach((t) => {
    t.concerns.forEach((c) => {
      const severity: 'minor' | 'major' = c.includes('not reported') ? 'minor' : 'major'
      weaknesses.push({ aspect: 'Statistics', issue: c, severity })
    })
  })

  reproducibility.concerns.forEach((c) => weaknesses.push({ aspect: 'Reproducibility', issue: c, severity: 'minor' }))

  input.claims.filter((c) => c.overstatement).forEach((c) => {
    weaknesses.push({ aspect: 'Claims', issue: `Overstatement: "${c.claim}"`, severity: 'major' })
  })

  return weaknesses.sort((a, b) => (a.severity === 'major' ? -1 : 1))
}

function generateQuestions(input: PeerReviewInput, weaknesses: PeerReviewResult['weaknesses'], _stats: PeerReviewResult['statisticalReview']): string[] {
  const questions: string[] = []

  if (weaknesses.some((w) => w.aspect === 'Methodology')) {
    questions.push('Could you clarify how design limitations affect the interpretation of your findings?')
  }

  if (!input.methodology.replicationInfo) {
    questions.push('Will the data and analysis code be provided as supplementary materials?')
  }

  if (input.results.some((r) => !r.confidenceInterval)) {
    questions.push('Please provide confidence intervals for all significant effects.')
  }

  if (input.discussion.limitations.length === 0) {
    questions.push('What are the primary limitations that readers should consider?')
  }

  questions.push('How might the findings change if an alternative operationalization were used?')
  questions.push('What are the boundary conditions for the reported effects?')

  return questions
}

function calculateOverallScore(methodology: PeerReviewResult['methodologyReview'], stats: PeerReviewResult['statisticalReview'], reproducibility: PeerReviewResult['reproducibility']): number {
  let score = methodology.designValidity

  score += stats.tests.filter((t) => t.appropriate).length * 1.5
  score -= stats.tests.filter((t) => !t.appropriate).length * 2
  score += reproducibility.score * 0.5
  score -= methodology.errors.length * 1.5

  return Math.max(1, Math.min(10, Math.round(score)))
}

function makeRecommendation(score: number, weaknesses: PeerReviewResult['weaknesses']): PeerReviewResult['recommendation'] {
  const majorCount = weaknesses.filter((w) => w.severity === 'major').length
  if (score >= 8 && majorCount === 0) return 'accept'
  if (score >= 6 && majorCount <= 1) return 'minor-revision'
  if (score >= 4 && majorCount <= 3) return 'major-revision'
  if (score >= 2) return 'resubmit'
  return 'reject'
}

function formatPeerReviewReport(result: PeerReviewResult): string {
  const lines: string[] = []
  lines.push('# Peer Review Simulation — ResearchOS')
  lines.push('')
  lines.push(`## Overall Assessment`)
  lines.push(`**Score:** ${result.overallScore}/10 | **Recommendation:** ${result.recommendation.toUpperCase()}`)
  lines.push('')

  lines.push('## Methodology Review')
  lines.push(`- Design Validity: ${result.methodologyReview.designValidity}/10`)
  lines.push(`- Sampling: ${result.methodologyReview.sampling}`)
  lines.push(`- Confound Control: ${result.methodologyReview.confoundControl}`)
  if (result.methodologyReview.errors.length > 0) {
    lines.push('- **Issues:**')
    result.methodologyReview.errors.forEach((e) => lines.push(`  - ${e}`))
  }
  lines.push('')

  lines.push('## Statistical Review')
  result.statisticalReview.tests.forEach((t) => {
    const status = t.appropriate && t.concerns.length === 0 ? 'OK' : 'REVIEW'
    lines.push(`- [${status}] ${t.test}: ${t.concerns.length > 0 ? t.concerns.join('; ') : 'No concerns'}`)
  })
  if (result.statisticalReview.recommendations.length > 0) {
    lines.push('')
    lines.push('**Recommendations:**')
    result.statisticalReview.recommendations.forEach((r) => lines.push(`- ${r}`))
  }
  lines.push('')

  lines.push('## Reproducibility')
  lines.push(`- Score: ${result.reproducibility.score}/10`)
  lines.push(`- Data: ${result.reproducibility.dataAvailability}`)
  lines.push(`- Code: ${result.reproducibility.codeAvailability}`)
  lines.push(`- Preregistered: ${result.reproducibility.preregistered ? 'Yes' : 'No'}`)
  lines.push('')

  lines.push('## Strengths')
  result.strengths.forEach((s) => {
    lines.push(`- **[${s.rating}/10]** ${s.aspect}: ${s.quote}`)
  })
  lines.push('')

  lines.push('## Weaknesses')
  result.weaknesses.forEach((w) => {
    lines.push(`- [${w.severity.toUpperCase()}] ${w.aspect}: ${w.issue}`)
  })
  lines.push('')

  lines.push('## Questions for Author')
  result.questionsForAuthor.forEach((q, i) => {
    lines.push(`${i + 1}. ${q}`)
  })

  return lines.join('\n')
}

// ==================== TOOL 7: RESEARCH_RADAR ====================

function analyzeResearchRadar(input: ResearchRadarInput): ResearchRadarResult {
  const topics = identifyEmergingTopics(input)
  const researchers = analyzeKeyResearchers(input)
  const funding = analyzeFunding(input)
  const hotspots = identifyHotspots(input)
  const recommendations = generateStrategicRecommendations(input, topics, funding)

  return {
    emergingTopics: topics,
    keyResearchers: researchers,
    fundingDirections: funding,
    hotspots,
    strategicRecommendations: recommendations
  }
}

function identifyEmergingTopics(input: ResearchRadarInput): ResearchRadarResult['emergingTopics'] {
  const topicCount: Record<string, { count: number; recent: string[] }> = {}

  for (const p of input.recentPapers) {
    for (const kw of p.keywords) {
      if (p.year >= 2023) {
        if (!topicCount[kw]) topicCount[kw] = { count: 0, recent: [] }
        topicCount[kw].count++
        if (topicCount[kw].recent.length < 3) topicCount[kw].recent.push(p.title)
      }
    }
  }

  const totalPapers = input.recentPapers.filter((p) => p.year >= 2023).length || 1

  return Object.entries(topicCount)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([topic, data]) => ({
      topic,
      GrowthRate: Math.round((data.count / totalPapers) * 100),
      paperCount: data.count,
      recentPapers: data.recent,
      potential: data.count >= 5 ? 'high' : data.count >= 3 ? 'medium' : 'low'
    }))
}

function analyzeKeyResearchers(input: ResearchRadarInput): ResearchRadarResult['keyResearchers'] {
  return input.researchers.map((r) => {
    const recentPapers = input.recentPapers.filter((p) => p.authors.some((a) => a.includes(r.name) || r.name.includes(a)))
    const citations = recentPapers.reduce((s, p) => s + (p.citations ?? 0), 0)
    const impact = Math.min(10, Math.round((citations / 10 + (r.hIndex ?? 0) / 5 + recentPapers.length) * 10) / 10)

    let trendDirection: 'rising' | 'stable' | 'shifting' = 'stable'
    if (recentPapers.length >= 3) trendDirection = 'rising'
    else if (recentPapers.length === 0) trendDirection = 'shifting'

    const collaborators = new Set<string>()
    recentPapers.forEach((p) => p.authors.forEach((a) => { if (!a.includes(r.name)) collaborators.add(a) }))

    return {
      name: r.name,
      impact,
      focusAreas: r.recentFocus,
      collaborators: [...collaborators].slice(0, 5),
      trendDirection
    }
  }).sort((a, b) => b.impact - a.impact)
}

function analyzeFunding(input: ResearchRadarInput): ResearchRadarResult['fundingDirections'] {
  const areaFunding: Record<string, { total: number; agencies: Set<string> }> = {}

  for (const fs of input.fundingSources) {
    for (const area of fs.priorityAreas) {
      if (!areaFunding[area]) areaFunding[area] = { total: 0, agencies: new Set<string>() }
      areaFunding[area].total += fs.totalFunding
      areaFunding[area].agencies.add(fs.agency)
    }
  }

  const maxFunding = Math.max(...Object.values(areaFunding).map((v) => v.total), 1)

  const result = Object.entries(areaFunding)
    .map(([area, data]) => ({
      area,
      totalFunding: data.total,
      agencies: [...data.agencies],
      opportunityLevel: (data.total / maxFunding >= 0.7 ? 'hot' : data.total / maxFunding >= 0.4 ? 'warm' : 'emerging') as 'hot' | 'warm' | 'emerging'
    }))
    .sort((a, b) => b.totalFunding - a.totalFunding)
  return result
}

function identifyHotspots(input: ResearchRadarInput): ResearchRadarResult['hotspots'] {
  const hotspots: ResearchRadarResult['hotspots'] = []
  const subdomainPapers: Record<string, number> = {}

  for (const p of input.recentPapers) {
    for (const sd of input.subdomains) {
      const matchCount = p.keywords.filter((k) => k.includes(sd) || sd.includes(k)).length
      if (matchCount > 0) subdomainPapers[sd] = (subdomainPapers[sd] ?? 0) + matchCount
    }
  }

  const sorted = Object.entries(subdomainPapers).sort(([, a], [, b]) => b - a)
  const maxPapers = sorted[0]?.[1] ?? 1

  for (const [hotspot, count] of sorted.slice(0, 5)) {
    const related = input.subdomains.filter((s) => s !== hotspot && s.includes(hotspot.split(' ')[0]))
    hotspots.push({
      hotspot,
      intensity: Math.round((count / maxPapers) * 100),
      relatedTopics: related,
      prediction: count / (maxPapers || 1) >= 0.8
        ? 'Continued growth expected; high competition for publication'
        : 'Emerging area with room for novel contributions'
    })
  }

  return hotspots
}

function generateStrategicRecommendations(input: ResearchRadarInput, topics: ResearchRadarResult['emergingTopics'], funding: ResearchRadarResult['fundingDirections']): ResearchRadarResult['strategicRecommendations'] {
  const recommendations: ResearchRadarResult['strategicRecommendations'] = []

  const topTopic = topics[0]
  if (topTopic) {
    recommendations.push({
      action: `Prioritize research in "${topTopic.topic}"`,
      rationale: `Highest growth rate (${topTopic.GrowthRate}%) with ${topTopic.paperCount} recent publications`,
      timeline: '6-12 months to establish position'
    })
  }

  const topFunding = funding.find((f) => f.opportunityLevel === 'hot')
  if (topFunding) {
    recommendations.push({
      action: `Align proposals with "${topFunding.area}" funding call`,
      rationale: `${topFunding.totalFunding}M available from ${topFunding.agencies.join(', ')}`,
      timeline: 'Next funding cycle (3-6 months)'
    })
  }

  recommendations.push({
    action: `Attend top conferences in ${input.domain}`,
    rationale: 'Network with key researchers in emerging topics before they become saturated',
    timeline: 'Next 3 months'
  })

  return recommendations
}

function formatRadarReport(result: ResearchRadarResult): string {
  const lines: string[] = []
  lines.push('# Research Trend Radar — ResearchOS')
  lines.push('')

  lines.push('## Emerging Topics')
  lines.push('| Topic | Growth Rate | Papers | Potential |')
  lines.push('|-------|-------------|--------|-----------|')
  result.emergingTopics.forEach((t) => {
    lines.push(`| ${t.topic} | ${t.GrowthRate}% | ${t.paperCount} | ${t.potential} |`)
  })
  lines.push('')

  lines.push('## Key Researchers')
  result.keyResearchers.forEach((r) => {
    lines.push(`- **${r.name}** (Impact: ${r.impact}/10, Trend: ${r.trendDirection})`)
    lines.push(`  Focus: ${r.focusAreas.join(', ')}`)
    if (r.collaborators.length > 0) lines.push(`  Collaborators: ${r.collaborators.join(', ')}`)
  })
  lines.push('')

  lines.push('## Funding Directions')
  lines.push('| Area | Total Funding | Agencies | Opportunity |')
  lines.push('|------|-------------|----------|-------------|')
  result.fundingDirections.forEach((f) => {
    lines.push(`| ${f.area} | $${f.totalFunding}M | ${f.agencies.join(', ')} | ${f.opportunityLevel} |`)
  })
  lines.push('')

  lines.push('## Research Hotspots')
  result.hotspots.forEach((h) => {
    lines.push(`### ${h.hotspot} (Intensity: ${h.intensity}%)`)
    lines.push(`- Related: ${h.relatedTopics.join(', ') || 'None identified'}`)
    lines.push(`- Prediction: ${h.prediction}`)
  })
  lines.push('')

  lines.push('## Strategic Recommendations')
  result.strategicRecommendations.forEach((r) => {
    lines.push(`- **${r.action}**: ${r.rationale} [${r.timeline}]`)
  })

  return lines.join('\n')
}

// ==================== TOOL 8: COLLABORATION_FUNDER ====================

function findCollaboratorsAndFunding(input: CollaborationInput): CollaborationResult {
  const collaborators = scoreCollaborators(input)
  const team = analyzeTeamComposition(input, collaborators)
  const funding = matchFundingOpportunities(input)

  return { collaborators, teamComposition: team, fundingOpportunities: funding }
}

function scoreCollaborators(input: CollaborationInput): CollaborationResult['collaborators'] {
  return input.potentialCollaborators.map((c) => {
    const complementaryAreas = input.seeking
      .filter((s) => c.expertise.some((e) => s.description.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(s.description.toLowerCase())))
      .map((s) => s.description)

    const gapsFilled = c.methods.filter((m) => !input.researcher.methods.includes(m))
    const overlap = c.expertise.filter((e) => input.researcher.expertise.includes(e))

    const complementarityScore = Math.min(10, Math.round(
      (complementaryAreas.length * 2 + gapsFilled.length * 1.5 + overlap.length * 0.5) * 10
    ) / 10)

    const riskFactors: string[] = []
    if (c.availability !== 'immediate') riskFactors.push(`Limited availability: ${c.availability}`)
    if (c.publicationRecord < 5) riskFactors.push('Need to verify publication quality')

    return {
      name: c.name,
      complementarityScore,
      complementaryAreas,
      gapsFilled,
      synergyPotential: complementarityScore >= 7 ? 'High' : complementarityScore >= 4 ? 'Moderate' : 'Low',
      riskFactors
    }
  }).sort((a, b) => b.complementarityScore - a.complementarityScore)
}

function analyzeTeamComposition(input: CollaborationInput, collaborators: CollaborationResult['collaborators']): CollaborationResult['teamComposition'] {
  const allExpertise = new Set(input.researcher.expertise)
  const allMethods = new Set(input.researcher.methods)
  collaborators.filter((c) => c.complementarityScore >= 5).forEach((c) => {
    c.complementaryAreas.forEach((a) => allExpertise.add(a))
    c.gapsFilled.forEach((m) => allMethods.add(m))
  })

  const allGoals = new Set(input.goals)
  const gaps: string[] = []
  for (const goal of allGoals) {
    const hasExpertise = [...allExpertise].some((e) => goal.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(goal.toLowerCase()))
    if (!hasExpertise) gaps.push(`Missing expertise for: ${goal}`)
  }

  const balanceScore = Math.min(10, Math.round((allExpertise.size + allMethods.size) / 2))

  const recommendations: string[] = []
  if (gaps.length > 0) recommendations.push(`Address gaps: ${gaps.join('; ')}`)
  if (allMethods.size < 3) recommendations.push('Consider adding a methods specialist')
  if (collaborators.length < 2) recommendations.push('Expand collaborator search to increase diversity')

  return {
    strengths: [...allExpertise],
    gaps,
    balanceScore,
    recommendations
  }
}

function matchFundingOpportunities(input: CollaborationInput): CollaborationResult['fundingOpportunities'] {
  const opportunities: CollaborationResult['fundingOpportunities'] = []
  const allExpertise = [...input.researcher.expertise]
  input.potentialCollaborators.forEach((c) => allExpertise.push(...c.expertise))
  const uniqueExpertise = new Set(allExpertise)

  const fundingDB: Array<{ source: string; program: string; areas: string[]; deadline: string; amount: string }> = [
    { source: 'NSF', program: 'Core Programs', areas: ['computer science', 'engineering', 'mathematics'], deadline: 'Varies', amount: '$150K-500K' },
    { source: 'NIH', program: 'R01 Research Grant', areas: ['health', 'clinical', 'biomedical', 'psychology'], deadline: 'Feb/Jun/Oct', amount: '$250K-500K/year' },
    { source: 'EU Horizon Europe', program: 'ERC Starting Grant', areas: ['fundamental research', 'interdisciplinary'], deadline: 'Annual', amount: '€1.5M' },
    { source: 'Gates Foundation', program: 'Grand Challenges', areas: ['global health', 'development', 'agriculture'], deadline: 'Rolling', amount: '$100K-2M' },
    { source: 'Industry Partnership', program: 'Collaborative Research', areas: ['applied research', 'product development', 'AI'], deadline: 'Rolling', amount: '$50K-500K' },
    { source: 'UKRI', program: 'Standard Grant', areas: ['all disciplines'], deadline: 'Rolling', amount: '£300K-1.5M' }
  ]

  for (const f of fundingDB) {
    const matchCount = f.areas.filter((a) => [...uniqueExpertise].some((e) => a.includes(e) || e.includes(a))).length
    if (matchCount > 0) {
      opportunities.push({
        source: f.source,
        program: f.program,
        matchScore: Math.min(10, matchCount * 3),
        deadline: f.deadline,
        amount: f.amount,
        fitDescription: `Aligns with ${matchCount} team expertise areas`
      })
    }
  }

  return opportunities.sort((a, b) => b.matchScore - a.matchScore)
}

function formatCollaborationReport(result: CollaborationResult): string {
  const lines: string[] = []
  lines.push('# Collaboration & Funding Report — ResearchOS')
  lines.push('')

  lines.push('## Recommended Collaborators')
  result.collaborators.forEach((c, i) => {
    lines.push(`${i + 1}. **${c.name}** — Score: ${c.complementarityScore}/10`)
    lines.push(`   Complementary areas: ${c.complementaryAreas.join(', ') || 'None specifically matched'}`)
    lines.push(`   Fills gaps: ${c.gapsFilled.join(', ') || 'Limited'}`)
    lines.push(`   Synergy: **${c.synergyPotential}**`)
    if (c.riskFactors.length > 0) lines.push(`   Risks: ${c.riskFactors.join('; ')}`)
    lines.push('')
  })

  lines.push('## Team Composition')
  lines.push(`**Balance Score:** ${result.teamComposition.balanceScore}/10`)
  lines.push(`**Strengths:** ${result.teamComposition.strengths.slice(0, 8).join(', ')}`)
  if (result.teamComposition.gaps.length > 0) {
    lines.push(`**Gaps:** ${result.teamComposition.gaps.join('; ')}`)
  }
  result.teamComposition.recommendations.forEach((r) => lines.push(`- ${r}`))
  lines.push('')

  lines.push('## Funding Opportunities')
  result.fundingOpportunities.forEach((f) => {
    lines.push(`- **${f.source} — ${f.program}** (Match: ${f.matchScore}/10)`)
    lines.push(`  ${f.amount} | Deadline: ${f.deadline} | ${f.fitDescription}`)
  })

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Intelligent Literature Reviewer
  tools.register(defineTool({
    name: 'lit_reviewer',
    description: 'Intelligent literature review tool. Expands keywords, ranks papers by relevance, identifies research gaps, and generates timeline visualization. Citation network analysis included.',
    parameters: {
      query: { type: 'string', required: true, description: 'Research query or topic to review' },
      papers: { type: 'string', required: true, description: 'JSON array of paper objects with fields: title, authors (string[]), year, abstract, doi (optional), citations (number, optional), journal (optional), keywords (string[]), methodology (optional), findings (optional)' },
      expand_keywords: { type: 'boolean', description: 'Whether to automatically expand search keywords with synonyms (default: true)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { query: string; papers: string; expand_keywords?: boolean }) {
      const paperData: Paper[] = JSON.parse(args.papers)
      const result = performLiteratureReview({ query: args.query, papers: paperData, expandKeywords: args.expand_keywords ?? true })
      return formatLitReviewerReport(result)
    }
  }))

  // Tool 2: Scientific Hypothesis Generator
  tools.register(defineTool({
    name: 'hypothesis_gen',
    description: 'Generate scientific hypotheses through problem space exploration, counterfactual reasoning, and risk assessment. Returns ranked hypotheses with testability scores and implications.',
    parameters: {
      research_question: { type: 'string', required: true, description: 'Central research question to generate hypotheses for' },
      domain: { type: 'string', required: true, description: 'Research domain or field (e.g., psychology, computer science, biology)' },
      known_factors: { type: 'string', required: true, description: 'JSON array of known factors with fields: factor (string), relationship (string), evidence (string)' },
      target_population: { type: 'string', description: 'Target population for the hypotheses' },
      constraints: { type: 'string', description: 'JSON array of constraints or limitations' },
      novelty_direction: { type: 'string', description: 'Desired novelty direction: incremental, moderate, or high-risk' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { research_question: string; domain: string; known_factors: string; target_population?: string; constraints?: string; novelty_direction?: string }) {
      const factors: HypothesisInput['knownFactors'] = JSON.parse(args.known_factors)
      const input: HypothesisInput = {
        researchQuestion: args.research_question,
        domain: args.domain,
        knownFactors: factors,
        targetPopulation: args.target_population,
        constraints: args.constraints ? JSON.parse(args.constraints) : undefined,
        noveltyDirection: (args.novelty_direction as HypothesisInput['noveltyDirection']) ?? 'moderate'
      }
      const result = generateHypotheses(input)
      return formatHypothesisReport(result)
    }
  }))

  // Tool 3: Experiment Designer
  tools.register(defineTool({
    name: 'experiment_designer',
    description: 'Design controlled experiments with power analysis, randomization, blinding protocols, and threat assessment. Includes sample size calculation and experimental workflow.',
    parameters: {
      hypothesis: { type: 'string', required: true, description: 'Hypothesis statement to test' },
      independent_vars: { type: 'string', required: true, description: 'JSON array of independent variables with fields: name (string), levels (number), type (between|within|mixed)' },
      dependent_vars: { type: 'string', required: true, description: 'JSON array of dependent variables with fields: name (string), measurementType (continuous|ordinal|nominal|count), expectedEffect (number)' },
      confounding_vars: { type: 'string', description: 'JSON array of confounding variable names to control' },
      expected_effect_size: { type: 'number', required: true, description: 'Expected effect size (Cohen d)' },
      desired_power: { type: 'number', required: true, description: 'Desired statistical power (e.g., 0.8)' },
      alpha_level: { type: 'number', required: true, description: 'Significance level (e.g., 0.05)' },
      budget: { type: 'string', description: 'JSON object with optional budget constraints: maxParticipants, costPerParticipant, totalBudget' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { hypothesis: string; independent_vars: string; dependent_vars: string; confounding_vars?: string; expected_effect_size: number; desired_power: number; alpha_level: number; budget?: string }) {
      const input: ExperimentInput = {
        hypothesis: args.hypothesis,
        independentVars: JSON.parse(args.independent_vars),
        dependentVars: JSON.parse(args.dependent_vars),
        confoundingVars: args.confounding_vars ? JSON.parse(args.confounding_vars) : undefined,
        expectedEffectSize: args.expected_effect_size,
        desiredPower: args.desired_power,
        alphaLevel: args.alpha_level,
        budget: args.budget ? JSON.parse(args.budget) : undefined
      }
      const result = designExperiment(input)
      return formatExperimentReport(result)
    }
  }))

  // Tool 4: Research Data Pipeline
  tools.register(defineTool({
    name: 'data_pipeline',
    description: 'Manage research data with automated cleaning plans, feature engineering, quality assessment, version control, and data card generation for reproducibility.',
    parameters: {
      dataset_name: { type: 'string', required: true, description: 'Name of the dataset' },
      description: { type: 'string', required: true, description: 'Dataset description' },
      columns: { type: 'string', required: true, description: 'JSON array of column descriptors with fields: name, type (numeric|categorical|ordinal|text|datetime|binary), missingPct (number), uniqueCount (number), stats (object)' },
      row_count: { type: 'number', required: true, description: 'Total number of rows' },
      collection_method: { type: 'string', required: true, description: 'How data was collected' },
      version: { type: 'string', required: true, description: 'Dataset version string (e.g., 1.0.0)' },
      intended_use: { type: 'string', required: true, description: 'Intended research use' },
      ethical_considerations: { type: 'string', description: 'JSON array of ethical considerations' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { dataset_name: string; description: string; columns: string; row_count: number; collection_method: string; version: string; intended_use: string; ethical_considerations?: string }) {
      const input: DatasetInput = {
        datasetName: args.dataset_name,
        description: args.description,
        columns: JSON.parse(args.columns),
        rowCount: args.row_count,
        collectionMethod: args.collection_method,
        version: args.version,
        intendedUse: args.intended_use,
        ethicalConsiderations: args.ethical_considerations ? JSON.parse(args.ethical_considerations) : undefined
      }
      const result = processDataPipeline(input)
      return formatDataPipelineReport(result)
    }
  }))

  // Tool 5: Paper Structure Generator
  tools.register(defineTool({
    name: 'paper_outliner',
    description: 'Generate paper outline with IMRAD template, figure placement, citation annotation, and target journal matching. Supports multiple submission types.',
    parameters: {
      title: { type: 'string', required: true, description: 'Paper title' },
      abstract: { type: 'string', required: true, description: 'Paper abstract' },
      methodology: { type: 'string', required: true, description: 'Methodology description' },
      key_findings: { type: 'string', required: true, description: 'JSON array of findings with fields: finding (string), evidenceStrength (strong|moderate|weak), supportingData (string)' },
      target_journal: { type: 'string', description: 'Target journal name (auto-detected if omitted)' },
      submission_type: { type: 'string', description: 'Submission type: original, review, short, perspective, case-study' },
      references: { type: 'string', description: 'JSON array of references with fields: key, authors (string), year, title, usage' },
      figures: { type: 'string', description: 'JSON array of figures with fields: id, type (graph|diagram|table|image), caption, placement' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { title: string; abstract: string; methodology: string; key_findings: string; target_journal?: string; submission_type?: string; references?: string; figures?: string }) {
      const input: PaperOutlineInput = {
        title: args.title,
        abstract: args.abstract,
        methodology: args.methodology,
        keyFindings: JSON.parse(args.key_findings),
        targetJournal: args.target_journal,
        submissionType: (args.submission_type as PaperOutlineInput['submissionType']) ?? 'original',
        references: args.references ? JSON.parse(args.references) : undefined,
        figures: args.figures ? JSON.parse(args.figures) : undefined
      }
      const result = generatePaperOutline(input)
      return formatPaperOutlineReport(result)
    }
  }))

  // Tool 6: Peer Review Simulator
  tools.register(defineTool({
    name: 'peer_review_sim',
    description: 'Simulate peer review with methodology checking, statistical review, reproducibility assessment, and strengths/weaknesses report. Provides overall score and recommendation.',
    parameters: {
      title: { type: 'string', required: true, description: 'Paper title' },
      abstract: { type: 'string', required: true, description: 'Paper abstract' },
      methodology: { type: 'string', required: true, description: 'JSON object with fields: design, participants, measures, analysis, replicationInfo (optional), materials (optional)' },
      results: { type: 'string', required: true, description: 'JSON array of results with fields: hypothesis, testUsed, statistic, pValue, effectSize (optional), confidenceInterval (optional), significant (boolean)' },
      discussion: { type: 'string', required: true, description: 'JSON object with fields: summary, limitations (string[]), implications' },
      claims: { type: 'string', required: true, description: 'JSON array of claims with fields: claim (string), evidenceLevel (strong|moderate|weak|unsupported), overstatement (boolean)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { title: string; abstract: string; methodology: string; results: string; discussion: string; claims: string }) {
      const input: PeerReviewInput = {
        title: args.title,
        abstract: args.abstract,
        methodology: JSON.parse(args.methodology),
        results: JSON.parse(args.results),
        discussion: JSON.parse(args.discussion),
        claims: JSON.parse(args.claims)
      }
      const result = simulatePeerReview(input)
      return formatPeerReviewReport(result)
    }
  }))

  // Tool 7: Research Trend Radar
  tools.register(defineTool({
    name: 'research_radar',
    description: 'Analyze research trends with emerging topic identification, key researcher positioning, funding direction analysis, and strategic recommendations.',
    parameters: {
      domain: { type: 'string', required: true, description: 'Research domain to analyze' },
      subdomains: { type: 'string', required: true, description: 'JSON array of subdomains within the field' },
      recent_papers: { type: 'string', required: true, description: 'JSON array of recent papers with fields: title, authors (string[]), year, keywords (string[]), citations (number, optional), venue' },
      researchers: { type: 'string', required: true, description: 'JSON array of researchers with fields: name, affiliations (string[]), hIndex (number, optional), recentFocus (string[])' },
      funding_sources: { type: 'string', required: true, description: 'JSON array of funding sources with fields: agency, totalFunding, priorityAreas (string[]), deadline (string, optional)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { domain: string; subdomains: string; recent_papers: string; researchers: string; funding_sources: string }) {
      const input: ResearchRadarInput = {
        domain: args.domain,
        subdomains: JSON.parse(args.subdomains),
        recentPapers: JSON.parse(args.recent_papers),
        researchers: JSON.parse(args.researchers),
        fundingSources: JSON.parse(args.funding_sources)
      }
      const result = analyzeResearchRadar(input)
      return formatRadarReport(result)
    }
  }))

  // Tool 8: Collaboration & Funding Recommender
  tools.register(defineTool({
    name: 'collaboration_funder',
    description: 'Find collaborators by expertise complementarity, assess team gaps, and match funding opportunities. Includes synergy potential scoring and strategic recommendations.',
    parameters: {
      researcher: { type: 'string', required: true, description: 'JSON object with researcher profile: name, expertise (string[]), methods (string[]), publications, hIndex (optional), currentProjects (string[]), availableResources (string[])' },
      goals: { type: 'string', required: true, description: 'JSON array of research goals to achieve' },
      seeking: { type: 'string', required: true, description: 'JSON array of needs with fields: type (expertise|methodology|data|funding|equipment), description, priority (number)' },
      potential_collaborators: { type: 'string', required: true, description: 'JSON array of potential collaborators with fields: name, expertise (string[]), methods (string[]), institution, availability, publicationRecord' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { researcher: string; goals: string; seeking: string; potential_collaborators: string }) {
      const input: CollaborationInput = {
        researcher: JSON.parse(args.researcher),
        goals: JSON.parse(args.goals),
        seeking: JSON.parse(args.seeking),
        potentialCollaborators: JSON.parse(args.potential_collaborators)
      }
      const result = findCollaboratorsAndFunding(input)
      return formatCollaborationReport(result)
    }
  }))

  console.log(`[dsh-tool-researchos] Loaded v${VERSION} -- ResearchOS AI Scientist toolkit with 8 tools`)
  console.log('  Tools: lit_reviewer, hypothesis_gen, experiment_designer, data_pipeline, paper_outliner, peer_review_sim, research_radar, collaboration_funder')
}
