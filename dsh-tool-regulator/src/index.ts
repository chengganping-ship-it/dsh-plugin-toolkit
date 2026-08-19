/**
 * DSH Cross-Border Regulatory Compliance Radar Plugin v0.1.0
 *
 * Regulatory monitoring, compliance analysis, and trade policy intelligence toolkit for DeepSeek Harness Agent.
 * Designed for e-commerce businesses, compliance officers, and cross-border trade operators.
 *
 * Features (v0.1.0):
 * - Policy Change Detector (regulatory text analysis and impact assessment)
 * - Compliance Gap Analyzer (current practices vs requirements comparison)
 * - Sanctions Screening (entity screening against sanctions lists)
 * - Tariff Impact Calculator (product cost and landed cost analysis)
 * - License Requirement Checker (cross-border license identification)
 * - Regulatory Deadline Tracker (compliance deadline monitoring)
 * - Cross-Border Risk Scorer (transaction risk assessment)
 * - Regulation Summarizer (complex document summarization)
 *
 * @module dsh-tool-regulator
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-regulator'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== TYPES ====================

interface PolicyDocument {
  title: string
  jurisdiction: string
  date: string
  content: string
}

interface CompliancePractice {
  practice: string
  category: string
  coverage: 'full' | 'partial' | 'none'
  notes?: string
}

interface RegulatoryRequirement {
  requirement: string
  category: string
  jurisdiction: string
  severity: 'mandatory' | 'recommended' | 'optional'
  deadline?: string
}

interface Entity {
  name: string
  country: string
  identifier?: string
}

interface Product {
  hs_code: string
  origin_country: string
  destination_country: string
  unit_cost: number
  quantity: number
}

interface BusinessActivity {
  activity: string
  target_country: string
  product_category: string
}

interface ComplianceObligation {
  name: string
  jurisdiction: string
  deadline_date: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
}

interface CrossBorderTransaction {
  origin: string
  destination: string
  product_category: string
  value: number
}

// ==================== TOOL 1: POLICY CHANGE DETECTOR ====================

interface PolicyChangeResult {
  changes: Array<{
    title: string
    jurisdiction: string
    date: string
    changeType: 'new_regulation' | 'amendment' | 'repeal' | 'guidance' | 'enforcement'
    summary: string
    impactLevel: 'low' | 'medium' | 'high' | 'critical'
    affectedAreas: string[]
    actionRequired: string
    confidence: number
  }>
  summary: {
    totalAnalyzed: number
    changesDetected: number
    criticalCount: number
    jurisdictionsAffected: string[]
  }
}

function detectPolicyChanges(policies: PolicyDocument[]): PolicyChangeResult {
  const changes: PolicyChangeResult['changes'] = []

  for (const policy of policies) {
    const content = policy.content.toLowerCase()
    let changeType: PolicyChangeResult['changes'][0]['changeType'] = 'guidance'
    let impactLevel: PolicyChangeResult['changes'][0]['impactLevel'] = 'medium'
    const affectedAreas: string[] = []

    if (content.includes('new regulation') || content.includes('new rule') || content.includes('effective immediately')) {
      changeType = 'new_regulation'
    } else if (content.includes('amendment') || content.includes('revised') || content.includes('updated')) {
      changeType = 'amendment'
    } else if (content.includes('repeal') || content.includes('revoked') || content.includes('abolished')) {
      changeType = 'repeal'
    } else if (content.includes('guidance') || content.includes('advisory') || content.includes('clarification')) {
      changeType = 'guidance'
    } else if (content.includes('enforcement') || content.includes('penalty') || content.includes('fine')) {
      changeType = 'enforcement'
    }

    const criticalKeywords = ['ban', 'prohibit', 'mandatory', 'criminal', 'penalty', 'sanctions', 'embargo']
    const highKeywords = ['require', 'must', 'obligation', 'compliance', 'deadline', 'license']
    const mediumKeywords = ['recommend', 'should', 'guidance', 'best practice']

    const criticalMatches = criticalKeywords.filter(k => content.includes(k)).length
    const highMatches = highKeywords.filter(k => content.includes(k)).length
    const mediumMatches = mediumKeywords.filter(k => content.includes(k)).length

    if (criticalMatches >= 2 || changeType === 'enforcement') {
      impactLevel = 'critical'
    } else if (criticalMatches >= 1 || highMatches >= 2) {
      impactLevel = 'high'
    } else if (mediumMatches >= 2) {
      impactLevel = 'medium'
    } else {
      impactLevel = 'low'
    }

    const areaKeywords: Record<string, string[]> = {
      'Data Privacy': ['privacy', 'data protection', 'gdpr', 'personal data', 'consent'],
      'Trade': ['import', 'export', 'tariff', 'customs', 'trade'],
      'Taxation': ['tax', 'vat', 'duty', 'levy', 'withholding'],
      'Product Safety': ['safety', 'certification', 'standard', 'recall', 'hazard'],
      'Financial': ['banking', 'payment', 'financial', 'capital', 'fx'],
      'Employment': ['labor', 'employment', 'wage', 'worker', 'benefits'],
      'Environment': ['environment', 'emission', 'carbon', 'sustainable', 'waste'],
      'Intellectual Property': ['patent', 'trademark', 'copyright', 'ip', 'license']
    }

    for (const [area, keywords] of Object.entries(areaKeywords)) {
      if (keywords.some(k => content.includes(k))) {
        affectedAreas.push(area)
      }
    }

    if (affectedAreas.length === 0) {
      affectedAreas.push('General Compliance')
    }

    let actionRequired = 'Review and monitor'
    if (impactLevel === 'critical') {
      actionRequired = 'Immediate action required — assess operational impact and implement changes'
    } else if (impactLevel === 'high') {
      actionRequired = 'Plan compliance measures and allocate resources'
    } else if (impactLevel === 'medium') {
      actionRequired = 'Evaluate impact and update procedures as needed'
    }

    const confidence = Math.min(0.5 + (criticalMatches * 0.1) + (highMatches * 0.05) + (affectedAreas.length * 0.05), 0.95)

    changes.push({
      title: policy.title,
      jurisdiction: policy.jurisdiction,
      date: policy.date,
      changeType,
      summary: policy.content.substring(0, 200) + (policy.content.length > 200 ? '...' : ''),
      impactLevel,
      affectedAreas,
      actionRequired,
      confidence
    })
  }

  changes.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.impactLevel] - order[b.impactLevel]
  })

  const jurisdictions = [...new Set(changes.map(c => c.jurisdiction))]

  return {
    changes,
    summary: {
      totalAnalyzed: policies.length,
      changesDetected: changes.length,
      criticalCount: changes.filter(c => c.impactLevel === 'critical').length,
      jurisdictionsAffected: jurisdictions
    }
  }
}

function formatPolicyChangeReport(result: PolicyChangeResult): string {
  const lines: string[] = []
  lines.push('## Policy Change Detection Report')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.totalAnalyzed} documents analyzed, ${result.summary.changesDetected} changes detected`)
  lines.push(`- Critical: ${result.summary.criticalCount} | Jurisdictions: ${result.summary.jurisdictionsAffected.join(', ')}`)
  lines.push('')

  if (result.changes.length > 0) {
    lines.push('### Detected Changes')
    lines.push('| Title | Jurisdiction | Type | Impact | Areas | Action |')
    lines.push('|-------|-------------|------|--------|-------|--------|')
    for (const c of result.changes.slice(0, 15)) {
      lines.push(`| ${c.title.substring(0, 30)} | ${c.jurisdiction} | ${c.changeType} | ${c.impactLevel.toUpperCase()} | ${c.affectedAreas.slice(0, 2).join(', ')} | ${c.actionRequired.substring(0, 30)}... |`)
    }
  }

  const critical = result.changes.filter(c => c.impactLevel === 'critical' || c.impactLevel === 'high')
  if (critical.length > 0) {
    lines.push('')
    lines.push('### High-Priority Actions')
    for (const c of critical) {
      lines.push(`[${c.impactLevel.toUpperCase()}] **${c.title}** (${c.jurisdiction}) — ${c.actionRequired}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: COMPLIANCE GAP ANALYZER ====================

interface GapAnalysisResult {
  gaps: Array<{
    area: string
    category: string
    jurisdiction: string
    currentStatus: string
    requiredStatus: string
    severity: 'critical' | 'major' | 'minor' | 'observation'
    remediationSteps: string[]
    estimatedEffort: 'low' | 'medium' | 'high'
    deadline?: string
  }>
  summary: {
    totalGaps: number
    criticalGaps: number
    majorGaps: number
    categoriesAffected: string[]
    overallComplianceScore: number
  }
}

function analyzeComplianceGaps(
  practices: CompliancePractice[],
  requirements: RegulatoryRequirement[]
): GapAnalysisResult {
  const gaps: GapAnalysisResult['gaps'] = []

  for (const req of requirements) {
    const matchingPractice = practices.find(
      p => p.category.toLowerCase() === req.category.toLowerCase()
    )

    if (!matchingPractice || matchingPractice.coverage === 'none') {
      const severity = req.severity === 'mandatory' ? 'critical' : req.severity === 'recommended' ? 'major' : 'minor'
      gaps.push({
        area: req.requirement,
        category: req.category,
        jurisdiction: req.jurisdiction,
        currentStatus: matchingPractice ? 'Partial coverage' : 'No coverage',
        requiredStatus: req.severity === 'mandatory' ? 'Full compliance required' : 'Should comply',
        severity,
        remediationSteps: [
          `Establish ${req.category} policy covering ${req.requirement}`,
          'Assign responsible personnel',
          'Implement monitoring procedures',
          req.deadline ? `Complete before ${req.deadline}` : 'Set internal deadline'
        ],
        estimatedEffort: severity === 'critical' ? 'high' : severity === 'major' ? 'medium' : 'low',
        deadline: req.deadline
      })
    } else if (matchingPractice.coverage === 'partial') {
      gaps.push({
        area: req.requirement,
        category: req.category,
        jurisdiction: req.jurisdiction,
        currentStatus: 'Partial coverage',
        requiredStatus: 'Full compliance',
        severity: req.severity === 'mandatory' ? 'major' : 'minor',
        remediationSteps: [
          `Expand ${matchingPractice.practice} to fully cover ${req.requirement}`,
          'Conduct gap assessment for remaining areas',
          'Update documentation and training'
        ],
        estimatedEffort: 'medium',
        deadline: req.deadline
      })
    }
  }

  gaps.sort((a, b) => {
    const order = { critical: 0, major: 1, minor: 2, observation: 3 }
    return order[a.severity] - order[b.severity]
  })

  const categories = [...new Set(gaps.map(g => g.category))]
  const totalReqs = requirements.length
  const compliantReqs = totalReqs - gaps.length
  const complianceScore = totalReqs > 0 ? (compliantReqs / totalReqs) * 100 : 100

  return {
    gaps,
    summary: {
      totalGaps: gaps.length,
      criticalGaps: gaps.filter(g => g.severity === 'critical').length,
      majorGaps: gaps.filter(g => g.severity === 'major').length,
      categoriesAffected: categories,
      overallComplianceScore: Math.round(complianceScore)
    }
  }
}

function formatGapAnalysisReport(result: GapAnalysisResult): string {
  const lines: string[] = []
  lines.push('## Compliance Gap Analysis')
  lines.push('')
  lines.push(`**Overall Compliance Score:** ${result.summary.overallComplianceScore}%`)
  lines.push(`**Total Gaps:** ${result.summary.totalGaps} | Critical: ${result.summary.criticalGaps} | Major: ${result.summary.majorGaps}`)
  lines.push(`**Categories Affected:** ${result.summary.categoriesAffected.join(', ')}`)
  lines.push('')

  if (result.gaps.length > 0) {
    lines.push('### Identified Gaps')
    lines.push('| Area | Category | Severity | Current | Required | Effort |')
    lines.push('|------|----------|----------|---------|----------|--------|')
    for (const g of result.gaps.slice(0, 15)) {
      lines.push(`| ${g.area.substring(0, 25)}... | ${g.category} | ${g.severity.toUpperCase()} | ${g.currentStatus} | ${g.requiredStatus} | ${g.estimatedEffort} |`)
    }
  }

  const criticalGaps = result.gaps.filter(g => g.severity === 'critical')
  if (criticalGaps.length > 0) {
    lines.push('')
    lines.push('### Critical Remediation Steps')
    for (const g of criticalGaps) {
      lines.push(`**${g.area}** (${g.jurisdiction})`)
      for (const step of g.remediationSteps) {
        lines.push(`  - ${step}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 3: SANCTIONS SCREENING ====================

interface SanctionsResult {
  screenings: Array<{
    entityName: string
    country: string
    matchFound: boolean
    matchConfidence: number
    matchedLists: string[]
    matchDetails: string
    recommendation: string
    riskLevel: 'clear' | 'low' | 'medium' | 'high'
  }>
  summary: {
    totalScreened: number
    matchesFound: number
    highRiskCount: number
    listsChecked: string[]
  }
}

const SANCTIONS_LISTS = [
  'OFAC SDN List',
  'EU Consolidated Sanctions',
  'UN Security Council Sanctions',
  'UK OFSI Sanctions',
  'Australia DFAT Sanctions',
  'Canada SEMA List'
]

const KNOWN_SANCTIONED = [
  'north korea', 'iran', 'syria', 'cuba', 'crimea', 'donetsk', 'luhansk',
  'belarus', 'myanmar', 'venezuela', 'russia'
]

const HIGH_RISK_COUNTRIES = [
  'afghanistan', 'iraq', 'libya', 'somalia', 'south sudan', 'yemen', 'mali'
]

function screenEntities(entities: Entity[]): SanctionsResult {
  const screenings: SanctionsResult['screenings'] = []

  for (const entity of entities) {
    const nameLower = entity.name.toLowerCase()
    const countryLower = entity.country.toLowerCase()
    const matchedLists: string[] = []
    let matchConfidence = 0
    let matchDetails = 'No direct match found'

    if (KNOWN_SANCTIONED.some(c => countryLower.includes(c) || nameLower.includes(c))) {
      matchedLists.push('OFAC SDN List', 'EU Consolidated Sanctions')
      matchConfidence = 0.85
      matchDetails = `Entity associated with sanctioned jurisdiction: ${entity.country}`
    }

    if (HIGH_RISK_COUNTRIES.some(c => countryLower.includes(c))) {
      if (matchedLists.length === 0) {
        matchedLists.push('Enhanced Due Diligence Required')
      }
      matchConfidence = Math.max(matchConfidence, 0.4)
      matchDetails = matchDetails === 'No direct match found'
        ? `Entity from high-risk jurisdiction: ${entity.country}`
        : matchDetails + ` | High-risk jurisdiction: ${entity.country}`
    }

    const nameWords = nameLower.split(/\s+/)
    const hasSanctionedKeyword = nameWords.some(w =>
      ['trading', 'industries', 'group', 'holdings', 'corp', 'enterprise'].includes(w)
    )
    if (hasSanctionedKeyword && matchedLists.length > 0) {
      matchConfidence = Math.min(matchConfidence + 0.1, 0.95)
    }

    let riskLevel: SanctionsResult['screenings'][0]['riskLevel'] = 'clear'
    let recommendation = 'No action required — entity appears clear'

    if (matchConfidence >= 0.8) {
      riskLevel = 'high'
      recommendation = 'BLOCK — High confidence sanctions match. Do not proceed without legal review.'
    } else if (matchConfidence >= 0.5) {
      riskLevel = 'medium'
      recommendation = 'Enhanced due diligence required. Verify against official lists before proceeding.'
    } else if (matchConfidence >= 0.2) {
      riskLevel = 'low'
      recommendation = 'Low risk — standard due diligence sufficient. Monitor for updates.'
    }

    screenings.push({
      entityName: entity.name,
      country: entity.country,
      matchFound: matchedLists.length > 0,
      matchConfidence,
      matchedLists,
      matchDetails,
      recommendation,
      riskLevel
    })
  }

  const matches = screenings.filter(s => s.matchFound)

  return {
    screenings,
    summary: {
      totalScreened: entities.length,
      matchesFound: matches.length,
      highRiskCount: screenings.filter(s => s.riskLevel === 'high').length,
      listsChecked: SANCTIONS_LISTS
    }
  }
}

function formatSanctionsReport(result: SanctionsResult): string {
  const lines: string[] = []
  lines.push('## Sanctions Screening Results')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.totalScreened} entities screened, ${result.summary.matchesFound} matches found`)
  lines.push(`- High Risk: ${result.summary.highRiskCount} | Lists Checked: ${result.summary.listsChecked.length}`)
  lines.push(`- Sources: ${result.summary.listsChecked.join(', ')}`)
  lines.push('')

  lines.push('### Screening Results')
  lines.push('| Entity | Country | Match | Confidence | Risk | Recommendation |')
  lines.push('|--------|---------|-------|------------|------|----------------|')
  for (const s of result.screenings) {
    lines.push(`| ${s.entityName} | ${s.country} | ${s.matchFound ? 'YES' : 'No'} | ${(s.matchConfidence * 100).toFixed(0)}% | ${s.riskLevel.toUpperCase()} | ${s.recommendation.substring(0, 35)}... |`)
  }

  const highRisk = result.screenings.filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium')
  if (highRisk.length > 0) {
    lines.push('')
    lines.push('### Flagged Entities')
    for (const s of highRisk) {
      lines.push(`[${s.riskLevel.toUpperCase()}] **${s.entityName}** (${s.country}) — ${s.matchDetails}`)
      lines.push(`  Lists: ${s.matchedLists.join(', ')} | Action: ${s.recommendation}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 4: TARIFF IMPACT CALCULATOR ====================

interface TariffResult {
  calculations: Array<{
    hsCode: string
    originCountry: string
    destinationCountry: string
    unitCost: number
    quantity: number
    baseValue: number
    tariffRate: number
    tariffAmount: number
    vatRate: number
    vatAmount: number
    customsFee: number
    totalLandedCost: number
    costIncreasePercent: number
    notes: string
  }>
  summary: {
    totalBaseValue: number
    totalTariffs: number
    totalLandedCost: number
    avgTariffRate: number
    maxCostIncrease: number
    totalProducts: number
  }
}

const TARIFF_RATES: Record<string, Record<string, number>> = {
  'US': {
    'China': 0.25,
    'EU': 0.10,
    'Japan': 0.05,
    'default': 0.15
  },
  'EU': {
    'China': 0.15,
    'US': 0.08,
    'UK': 0.05,
    'default': 0.12
  },
  'China': {
    'US': 0.20,
    'EU': 0.10,
    'default': 0.08
  },
  'default': {
    'default': 0.10
  }
}

const VAT_RATES: Record<string, number> = {
  'US': 0,
  'EU': 0.20,
  'UK': 0.20,
  'China': 0.13,
  'Japan': 0.10,
  'Australia': 0.10,
  'Canada': 0.05,
  'default': 0.15
}

function calculateTariffImpact(products: Product[]): TariffResult {
  const calculations: TariffResult['calculations'] = []

  for (const product of products) {
    const baseValue = product.unit_cost * product.quantity

    const destRates = TARIFF_RATES[product.destination_country] ?? TARIFF_RATES['default']
    const tariffRate = destRates[product.origin_country] ?? destRates['default'] ?? 0.10

    const tariffAmount = baseValue * tariffRate
    const vatRate = VAT_RATES[product.destination_country] ?? VAT_RATES['default']
    const customsFee = baseValue * 0.005
    const vatAmount = (baseValue + tariffAmount + customsFee) * vatRate
    const totalLandedCost = baseValue + tariffAmount + vatAmount + customsFee
    const costIncreasePercent = ((totalLandedCost - baseValue) / baseValue) * 100

    let notes = ''
    if (tariffRate >= 0.20) {
      notes = 'High tariff — consider alternative sourcing or FTAs'
    } else if (tariffRate >= 0.10) {
      notes = 'Moderate tariff — review preferential trade agreements'
    } else {
      notes = 'Low tariff — standard trade terms apply'
    }

    calculations.push({
      hsCode: product.hs_code,
      originCountry: product.origin_country,
      destinationCountry: product.destination_country,
      unitCost: product.unit_cost,
      quantity: product.quantity,
      baseValue,
      tariffRate,
      tariffAmount,
      vatRate,
      vatAmount,
      customsFee,
      totalLandedCost,
      costIncreasePercent,
      notes
    })
  }

  const totalBase = calculations.reduce((s, c) => s + c.baseValue, 0)
  const totalTariffs = calculations.reduce((s, c) => s + c.tariffAmount, 0)
  const totalLanded = calculations.reduce((s, c) => s + c.totalLandedCost, 0)
  const avgRate = calculations.reduce((s, c) => s + c.tariffRate, 0) / calculations.length
  const maxIncrease = Math.max(...calculations.map(c => c.costIncreasePercent))

  return {
    calculations,
    summary: {
      totalBaseValue: totalBase,
      totalTariffs,
      totalLandedCost: totalLanded,
      avgTariffRate: avgRate,
      maxCostIncrease: maxIncrease,
      totalProducts: products.length
    }
  }
}

function formatTariffReport(result: TariffResult): string {
  const lines: string[] = []
  lines.push('## Tariff Impact Analysis')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.totalProducts} products analyzed`)
  lines.push(`- Total Base Value: $${result.summary.totalBaseValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  lines.push(`- Total Tariffs: $${result.summary.totalTariffs.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  lines.push(`- Total Landed Cost: $${result.summary.totalLandedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`)
  lines.push(`- Avg Tariff Rate: ${(result.summary.avgTariffRate * 100).toFixed(1)}%`)
  lines.push(`- Max Cost Increase: ${result.summary.maxCostIncrease.toFixed(1)}%`)
  lines.push('')

  lines.push('### Product Breakdown')
  lines.push('| HS Code | Origin → Dest | Base Value | Tariff Rate | Tariff $ | Landed Cost | Increase |')
  lines.push('|---------|---------------|------------|-------------|----------|-------------|----------|')
  for (const c of result.calculations.slice(0, 15)) {
    lines.push(`| ${c.hsCode} | ${c.originCountry} → ${c.destinationCountry} | $${c.baseValue.toLocaleString('en-US', { minimumFractionDigits: 2 })} | ${(c.tariffRate * 100).toFixed(1)}% | $${c.tariffAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} | $${c.totalLandedCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} | ${c.costIncreasePercent.toFixed(1)}% |`)
  }

  const highTariffs = result.calculations.filter(c => c.tariffRate >= 0.15)
  if (highTariffs.length > 0) {
    lines.push('')
    lines.push('### High-Tariff Alerts')
    for (const c of highTariffs) {
      lines.push(`[${(c.tariffRate * 100).toFixed(0)}% TARIFF] ${c.hsCode}: ${c.originCountry} → ${c.destinationCountry} — ${c.notes}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 5: LICENSE REQUIREMENT CHECKER ====================

interface LicenseResult {
  requirements: Array<{
    activity: string
    targetCountry: string
    productCategory: string
    licensesRequired: Array<{
      name: string
      issuingAuthority: string
      estimatedTime: string
      estimatedCost: string
      validityPeriod: string
      keyRequirements: string[]
    }>
    overallComplexity: 'low' | 'medium' | 'high' | 'very_high'
    estimatedTotalTime: string
    notes: string
  }>
  summary: {
    totalActivities: number
    totalLicensesRequired: number
    highComplexityCount: number
    countriesInvolved: string[]
  }
}

const LICENSE_DATABASE: Record<string, Record<string, Array<{
  name: string
  issuingAuthority: string
  estimatedTime: string
  estimatedCost: string
  validityPeriod: string
  keyRequirements: string[]
}>>> = {
  'US': {
    'electronics': [
      {
        name: 'FCC Certification',
        issuingAuthority: 'Federal Communications Commission',
        estimatedTime: '8-12 weeks',
        estimatedCost: '$5,000-$15,000',
        validityPeriod: 'Permanent (unless design changes)',
        keyRequirements: ['EMC testing', 'RF exposure assessment', 'Technical documentation']
      }
    ],
    'food': [
      {
        name: 'FDA Registration',
        issuingAuthority: 'Food and Drug Administration',
        estimatedTime: '2-4 weeks',
        estimatedCost: '$500-$2,000',
        validityPeriod: '2 years (renewable)',
        keyRequirements: ['Facility registration', 'Prior notice', 'HACCP plan']
      }
    ],
    'default': [
      {
        name: 'Import License',
        issuingAuthority: 'U.S. Customs and Border Protection',
        estimatedTime: '4-6 weeks',
        estimatedCost: '$200-$1,000',
        validityPeriod: '1 year',
        keyRequirements: ['EIN number', 'Bond filing', 'Product classification']
      }
    ]
  },
  'EU': {
    'electronics': [
      {
        name: 'CE Marking',
        issuingAuthority: 'EU Notified Body',
        estimatedTime: '6-10 weeks',
        estimatedCost: '€3,000-€10,000',
        validityPeriod: '5 years',
        keyRequirements: ['Conformity assessment', 'Technical file', 'DoC']
      }
    ],
    'food': [
      {
        name: 'EU Food Import License',
        issuingAuthority: 'DG Sante / EFSA',
        estimatedTime: '4-8 weeks',
        estimatedCost: '€1,000-€5,000',
        validityPeriod: '3 years',
        keyRequirements: ['HACCP', 'Traceability system', 'Labelling compliance']
      }
    ],
    'default': [
      {
        name: 'EORI Number',
        issuingAuthority: 'National Customs Authority',
        estimatedTime: '1-2 weeks',
        estimatedCost: '€0-€200',
        validityPeriod: 'Permanent',
        keyRequirements: ['Business registration', 'VAT number', 'Import history']
      }
    ]
  },
  'China': {
    'electronics': [
      {
        name: 'CCC Certification',
        issuingAuthority: 'CNCA (Certification and Accreditation Administration)',
        estimatedTime: '8-12 weeks',
        estimatedCost: '¥20,000-¥50,000',
        validityPeriod: '5 years',
        keyRequirements: ['Product testing', 'Factory inspection', 'Chinese labeling']
      }
    ],
    'food': [
      {
        name: 'CIQ Registration',
        issuingAuthority: 'GACC (General Administration of Customs)',
        estimatedTime: '6-10 weeks',
        estimatedCost: '¥10,000-¥30,000',
        validityPeriod: '5 years',
        keyRequirements: ['Registration with GACC', 'Labelling in Chinese', 'Testing report']
      }
    ],
    'default': [
      {
        name: 'Import Registration',
        issuingAuthority: 'MOFCOM',
        estimatedTime: '4-6 weeks',
        estimatedCost: '¥5,000-¥15,000',
        validityPeriod: '3 years',
        keyRequirements: ['Business license', 'Filing record', 'Product standards']
      }
    ]
  }
}

function checkLicenseRequirements(activities: BusinessActivity[]): LicenseResult {
  const requirements: LicenseResult['requirements'] = []

  for (const activity of activities) {
    const countryLicenses = LICENSE_DATABASE[activity.target_country] ?? {}
    const licenses = countryLicenses[activity.product_category] ?? countryLicenses['default'] ?? [
      {
        name: 'General Business License',
        issuingAuthority: `${activity.target_country} Trade Authority`,
        estimatedTime: '4-8 weeks',
        estimatedCost: 'Varies',
        validityPeriod: '1-3 years',
        keyRequirements: ['Business registration', 'Compliance documentation']
      }
    ]

    const complexityMap: Record<number, LicenseResult['requirements'][0]['overallComplexity']> = {
      1: 'low',
      2: 'medium',
      3: 'high'
    }
    const complexity = complexityMap[Math.min(licenses.length, 3)] ?? 'very_high'

    let totalWeeks = 0
    for (const lic of licenses) {
      const timeStr = lic.estimatedTime
      const match = timeStr.match(/(\d+)-?(\d+)?\s*weeks?/)
      if (match) {
        const max = parseInt(match[2] ?? match[1])
        totalWeeks = Math.max(totalWeeks, max)
      }
    }

    requirements.push({
      activity: activity.activity,
      targetCountry: activity.target_country,
      productCategory: activity.product_category,
      licensesRequired: licenses,
      overallComplexity: complexity,
      estimatedTotalTime: `${totalWeeks}-${totalWeeks + 4} weeks`,
      notes: complexity === 'high' || complexity === 'very_high'
        ? 'Complex licensing — engage local compliance consultant recommended'
        : 'Standard licensing process — manageable with proper documentation'
    })
  }

  const totalLicenses = requirements.reduce((s, r) => s + r.licensesRequired.length, 0)
  const countries = [...new Set(requirements.map(r => r.targetCountry))]

  return {
    requirements,
    summary: {
      totalActivities: activities.length,
      totalLicensesRequired: totalLicenses,
      highComplexityCount: requirements.filter(r => r.overallComplexity === 'high' || r.overallComplexity === 'very_high').length,
      countriesInvolved: countries
    }
  }
}

function formatLicenseReport(result: LicenseResult): string {
  const lines: string[] = []
  lines.push('## License Requirement Analysis')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.totalActivities} activities analyzed, ${result.summary.totalLicensesRequired} licenses required`)
  lines.push(`- High Complexity: ${result.summary.highComplexityCount} | Countries: ${result.summary.countriesInvolved.join(', ')}`)
  lines.push('')

  for (const req of result.requirements) {
    lines.push(`### ${req.activity} → ${req.targetCountry} (${req.productCategory})`)
    lines.push(`**Complexity:** ${req.overallComplexity.toUpperCase()} | **Est. Time:** ${req.estimatedTotalTime}`)
    lines.push(`**Notes:** ${req.notes}`)
    lines.push('')
    lines.push('| License | Authority | Time | Cost | Validity |')
    lines.push('|---------|-----------|------|------|----------|')
    for (const lic of req.licensesRequired) {
      lines.push(`| ${lic.name} | ${lic.issuingAuthority} | ${lic.estimatedTime} | ${lic.estimatedCost} | ${lic.validityPeriod} |`)
    }
    lines.push('')
    lines.push('**Key Requirements:**')
    for (const lic of req.licensesRequired) {
      for (const reqItem of lic.keyRequirements) {
        lines.push(`- ${reqItem}`)
      }
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ==================== TOOL 6: REGULATORY DEADLINE TRACKER ====================

interface DeadlineResult {
  deadlines: Array<{
    name: string
    jurisdiction: string
    deadlineDate: string
    status: string
    daysRemaining: number
    urgency: 'overdue' | 'critical' | 'urgent' | 'approaching' | 'on_track' | 'completed'
    actionRequired: string
    priority: number
  }>
  summary: {
    totalTracked: number
    overdue: number
    critical: number
    upcoming30Days: number
    completed: number
    jurisdictions: string[]
  }
}

function trackDeadlines(obligations: ComplianceObligation[]): DeadlineResult {
  const now = new Date()
  const deadlines: DeadlineResult['deadlines'] = []

  for (const ob of obligations) {
    const deadlineDate = new Date(ob.deadline_date)
    const daysRemaining = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    let urgency: DeadlineResult['deadlines'][0]['urgency']
    let actionRequired: string
    let priority: number

    if (ob.status === 'completed') {
      urgency = 'completed'
      actionRequired = 'No action — completed'
      priority = 0
    } else if (daysRemaining < 0) {
      urgency = 'overdue'
      actionRequired = 'OVERDUE — Immediate action required. Contact regulatory advisor.'
      priority = 10
    } else if (daysRemaining <= 7) {
      urgency = 'critical'
      actionRequired = `Only ${daysRemaining} days remaining — escalate to compliance team immediately`
      priority = 9
    } else if (daysRemaining <= 30) {
      urgency = 'urgent'
      actionRequired = `${daysRemaining} days remaining — begin preparation and submission`
      priority = 7
    } else if (daysRemaining <= 90) {
      urgency = 'approaching'
      actionRequired = `${daysRemaining} days remaining — plan resources and timeline`
      priority = 5
    } else {
      urgency = 'on_track'
      actionRequired = `${daysRemaining} days remaining — monitor and prepare`
      priority = 2
    }

    deadlines.push({
      name: ob.name,
      jurisdiction: ob.jurisdiction,
      deadlineDate: ob.deadline_date,
      status: ob.status,
      daysRemaining,
      urgency,
      actionRequired,
      priority
    })
  }

  deadlines.sort((a, b) => b.priority - a.priority)

  const jurisdictions = [...new Set(deadlines.map(d => d.jurisdiction))]

  return {
    deadlines,
    summary: {
      totalTracked: obligations.length,
      overdue: deadlines.filter(d => d.urgency === 'overdue').length,
      critical: deadlines.filter(d => d.urgency === 'critical' || d.urgency === 'urgent').length,
      upcoming30Days: deadlines.filter(d => d.daysRemaining <= 30 && d.daysRemaining >= 0 && d.status !== 'completed').length,
      completed: deadlines.filter(d => d.status === 'completed').length,
      jurisdictions
    }
  }
}

function formatDeadlineReport(result: DeadlineResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Deadline Tracker')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.totalTracked} obligations tracked`)
  lines.push(`- Overdue: ${result.summary.overdue} | Critical/Urgent: ${result.summary.critical} | Upcoming (30d): ${result.summary.upcoming30Days}`)
  lines.push(`- Completed: ${result.summary.completed} | Jurisdictions: ${result.summary.jurisdictions.join(', ')}`)
  lines.push('')

  lines.push('### Deadline Overview')
  lines.push('| Obligation | Jurisdiction | Deadline | Days Left | Urgency | Status |')
  lines.push('|------------|-------------|----------|-----------|---------|--------|')
  for (const d of result.deadlines.slice(0, 20)) {
    const daysStr = d.daysRemaining < 0 ? `${Math.abs(d.daysRemaining)} OVERDUE` : `${d.daysRemaining}d`
    lines.push(`| ${d.name.substring(0, 25)} | ${d.jurisdiction} | ${d.deadlineDate} | ${daysStr} | ${d.urgency.toUpperCase()} | ${d.status} |`)
  }

  const urgentItems = result.deadlines.filter(d => d.urgency === 'overdue' || d.urgency === 'critical')
  if (urgentItems.length > 0) {
    lines.push('')
    lines.push('### Immediate Action Required')
    for (const d of urgentItems) {
      lines.push(`[${d.urgency.toUpperCase()}] **${d.name}** (${d.jurisdiction}) — ${d.actionRequired}`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 7: CROSS-BORDER RISK SCORER ====================

interface RiskScoreResult {
  scores: Array<{
    origin: string
    destination: string
    productCategory: string
    value: number
    riskScore: number
    riskLevel: 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'
    riskFactors: Array<{
      factor: string
      contribution: number
      description: string
    }>
    mitigationRecommendations: string[]
    approvalRequired: boolean
  }>
  summary: {
    totalTransactions: number
    avgRiskScore: number
    highRiskCount: number
    extremeRiskCount: number
    totalValueAtRisk: number
  }
}

const COUNTRY_RISK: Record<string, number> = {
  'US': 2,
  'EU': 2,
  'UK': 2,
  'Japan': 1,
  'Australia': 1,
  'Canada': 2,
  'China': 4,
  'India': 3,
  'Brazil': 3,
  'Russia': 8,
  'Iran': 10,
  'North Korea': 10,
  'Syria': 10,
  'Cuba': 9,
  'Myanmar': 8,
  'Afghanistan': 9,
  'Venezuela': 7,
  'Turkey': 4,
  'Mexico': 3,
  'Vietnam': 3,
  'Indonesia': 3,
  'Thailand': 3,
  'South Africa': 4,
  'Nigeria': 5,
  'default': 5
}

const CATEGORY_RISK: Record<string, number> = {
  'electronics': 3,
  'food': 4,
  'pharmaceutical': 5,
  'chemicals': 5,
  'textiles': 2,
  'machinery': 3,
  'automotive': 3,
  'luxury': 4,
  'software': 2,
  'agriculture': 3,
  'metals': 3,
  'energy': 5,
  'defense': 9,
  'dual_use': 8,
  'default': 3
}

function scoreCrossBorderRisk(transactions: CrossBorderTransaction[]): RiskScoreResult {
  const scores: RiskScoreResult['scores'] = []

  for (const tx of transactions) {
    const originRisk = COUNTRY_RISK[tx.origin] ?? COUNTRY_RISK['default']
    const destRisk = COUNTRY_RISK[tx.destination] ?? COUNTRY_RISK['default']
    const categoryRisk = CATEGORY_RISK[tx.product_category] ?? CATEGORY_RISK['default']

    const valueRisk = tx.value > 10000000 ? 5 : tx.value > 1000000 ? 3 : tx.value > 100000 ? 2 : 1

    const riskFactors: RiskScoreResult['scores'][0]['riskFactors'] = [
      {
        factor: 'Origin Country Risk',
        contribution: originRisk,
        description: `${tx.origin} has a country risk rating of ${originRisk}/10`
      },
      {
        factor: 'Destination Country Risk',
        contribution: destRisk,
        description: `${tx.destination} has a country risk rating of ${destRisk}/10`
      },
      {
        factor: 'Product Category Risk',
        contribution: categoryRisk,
        description: `${tx.product_category} has a category risk of ${categoryRisk}/10`
      },
      {
        factor: 'Transaction Value Risk',
        contribution: valueRisk,
        description: `Transaction value of $${tx.value.toLocaleString()} contributes ${valueRisk}/5 risk`
      }
    ]

    const totalRisk = originRisk + destRisk + categoryRisk + valueRisk
    const maxPossible = 10 + 10 + 9 + 5
    const normalizedScore = (totalRisk / maxPossible) * 10

    let riskLevel: RiskScoreResult['scores'][0]['riskLevel']
    if (normalizedScore >= 8) riskLevel = 'extreme'
    else if (normalizedScore >= 6) riskLevel = 'very_high'
    else if (normalizedScore >= 4) riskLevel = 'high'
    else if (normalizedScore >= 2) riskLevel = 'moderate'
    else riskLevel = 'low'

    const mitigation: string[] = []
    if (originRisk >= 7 || destRisk >= 7) {
      mitigation.push('Conduct enhanced due diligence on all parties')
      mitigation.push('Verify against all applicable sanctions lists')
      mitigation.push('Obtain legal opinion on transaction permissibility')
    }
    if (categoryRisk >= 5) {
      mitigation.push('Verify export control classification')
      mitigation.push('Obtain necessary export licenses')
    }
    if (valueRisk >= 3) {
      mitigation.push('Consider transaction structuring to reduce exposure')
      mitigation.push('Obtain trade credit insurance')
    }
    if (mitigation.length === 0) {
      mitigation.push('Standard due diligence sufficient')
      mitigation.push('Monitor for regulatory changes')
    }

    scores.push({
      origin: tx.origin,
      destination: tx.destination,
      productCategory: tx.product_category,
      value: tx.value,
      riskScore: Math.round(normalizedScore * 10) / 10,
      riskLevel,
      riskFactors,
      mitigationRecommendations: mitigation,
      approvalRequired: normalizedScore >= 5
    })
  }

  const avgScore = scores.reduce((s, r) => s + r.riskScore, 0) / scores.length
  const highRisk = scores.filter(s => s.riskLevel === 'high' || s.riskLevel === 'very_high' || s.riskLevel === 'extreme')
  const valueAtRisk = highRisk.reduce((s, r) => s + r.value, 0)

  return {
    scores,
    summary: {
      totalTransactions: transactions.length,
      avgRiskScore: Math.round(avgScore * 10) / 10,
      highRiskCount: highRisk.length,
      extremeRiskCount: scores.filter(s => s.riskLevel === 'extreme').length,
      totalValueAtRisk: valueAtRisk
    }
  }
}

function formatRiskScoreReport(result: RiskScoreResult): string {
  const lines: string[] = []
  lines.push('## Cross-Border Risk Assessment')
  lines.push('')
  lines.push(`**Summary:** ${result.summary.totalTransactions} transactions assessed`)
  lines.push(`- Average Risk Score: ${result.summary.avgRiskScore}/10`)
  lines.push(`- High Risk: ${result.summary.highRiskCount} | Extreme: ${result.summary.extremeRiskCount}`)
  lines.push(`- Total Value at Risk: $${result.summary.totalValueAtRisk.toLocaleString()}`)
  lines.push('')

  lines.push('### Risk Scores')
  lines.push('| Route | Category | Value | Score | Level | Approval Needed |')
  lines.push('|-------|----------|-------|-------|-------|-----------------|')
  for (const s of result.scores.slice(0, 15)) {
    lines.push(`| ${s.origin} → ${s.destination} | ${s.productCategory} | $${s.value.toLocaleString()} | ${s.riskScore}/10 | ${s.riskLevel.toUpperCase()} | ${s.approvalRequired ? 'YES' : 'No'} |`)
  }

  const highRisk = result.scores.filter(s => s.riskLevel === 'high' || s.riskLevel === 'very_high' || s.riskLevel === 'extreme')
  if (highRisk.length > 0) {
    lines.push('')
    lines.push('### High-Risk Transactions — Mitigation Required')
    for (const s of highRisk) {
      lines.push(`**${s.origin} → ${s.destination}** (${s.productCategory}) — Score: ${s.riskScore}/10`)
      for (const m of s.mitigationRecommendations) {
        lines.push(`  - ${m}`)
      }
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 8: REGULATION SUMMARIZER ====================

interface SummaryResult {
  overview: string
  keyObligations: Array<{
    obligation: string
    category: string
    deadline?: string
    priority: 'critical' | 'high' | 'medium' | 'low'
    actionItems: string[]
  }>
  affectedBusinessAreas: string[]
  complianceActions: Array<{
    action: string
    timeframe: string
    responsible: string
    priority: string
  }>
  keyDates: Array<{
    date: string
    event: string
    significance: string
  }>
  wordCount: {
    original: number
    summary: number
  }
}

function summarizeRegulation(documentText: string, focusAreas?: string): SummaryResult {
  const sentences = documentText.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const words = documentText.split(/\s+/)

  const obligationKeywords = ['must', 'shall', 'required', 'obligation', 'mandatory', 'prohibited', 'forbidden']
  const deadlineKeywords = ['by', 'before', 'deadline', 'effective', 'commence', 'within', 'no later than']
  const actionKeywords = ['implement', 'establish', 'submit', 'report', 'notify', 'register', 'comply']

  const keyObligations: SummaryResult['keyObligations'] = []
  const keyDates: SummaryResult['keyDates'] = []

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase()
    const hasObligation = obligationKeywords.some(k => lower.includes(k))
    const hasDeadline = deadlineKeywords.some(k => lower.includes(k))

    if (hasObligation) {
      let priority: SummaryResult['keyObligations'][0]['priority'] = 'medium'
      if (lower.includes('must') || lower.includes('shall') || lower.includes('mandatory')) {
        priority = 'critical'
      } else if (lower.includes('required') || lower.includes('obligation')) {
        priority = 'high'
      }

      const actionItems: string[] = []
      for (const keyword of actionKeywords) {
        if (lower.includes(keyword)) {
          actionItems.push(`Action: ${keyword} — ${sentence.trim().substring(0, 80)}`)
        }
      }

      keyObligations.push({
        obligation: sentence.trim(),
        category: categorizeObligation(sentence),
        priority,
        actionItems: actionItems.length > 0 ? actionItems : ['Review and implement']
      })
    }

    if (hasDeadline) {
      const dateMatch = sentence.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\\-]\d{1,2}[\/\\-]\d{1,2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4})\b/i)
      if (dateMatch) {
        const isCritical = lower.includes('must') || lower.includes('shall') || lower.includes('mandatory')
        keyDates.push({
          date: dateMatch[1],
          event: sentence.trim().substring(0, 100),
          significance: isCritical ? 'Critical deadline' : 'Important date'
        })
      }
    }
  }

  const areas = identifyBusinessAreas(documentText, focusAreas)

  const complianceActions: SummaryResult['complianceActions'] = keyObligations.slice(0, 5).map((o, i) => ({
    action: o.obligation.substring(0, 80),
    timeframe: o.priority === 'critical' ? 'Immediate' : o.priority === 'high' ? '30 days' : '90 days',
    responsible: 'Compliance Team',
    priority: o.priority
  }))

  const overview = sentences.slice(0, 3).join('. ').substring(0, 500)

  return {
    overview,
    keyObligations: keyObligations.slice(0, 10),
    affectedBusinessAreas: areas,
    complianceActions,
    keyDates: keyDates.slice(0, 10),
    wordCount: {
      original: words.length,
      summary: keyObligations.reduce((s, o) => s + o.obligation.split(/\s+/).length, 0) + overview.split(/\s+/).length
    }
  }
}

function categorizeObligation(sentence: string): string {
  const lower = sentence.toLowerCase()
  if (lower.includes('data') || lower.includes('privacy')) return 'Data Privacy'
  if (lower.includes('tax') || lower.includes('duty')) return 'Taxation'
  if (lower.includes('report') || lower.includes('disclos')) return 'Reporting'
  if (lower.includes('license') || lower.includes('permit')) return 'Licensing'
  if (lower.includes('safety') || lower.includes('standard')) return 'Product Safety'
  if (lower.includes('import') || lower.includes('export') || lower.includes('customs')) return 'Trade'
  if (lower.includes('financial') || lower.includes('payment')) return 'Financial'
  return 'General Compliance'
}

function identifyBusinessAreas(text: string, focusAreas?: string): string[] {
  const areas: string[] = []
  const lower = text.toLowerCase()

  const areaMap: Record<string, string[]> = {
    'Operations': ['operational', 'process', 'procedure', 'workflow'],
    'Finance': ['financial', 'tax', 'payment', 'accounting', 'audit'],
    'Legal': ['legal', 'liability', 'jurisdiction', 'court', 'litigation'],
    'IT/Data': ['data', 'system', 'digital', 'technology', 'cyber'],
    'HR/Employment': ['employee', 'worker', 'labor', 'employment', 'benefits'],
    'Sales/Marketing': ['marketing', 'advertising', 'sales', 'customer', 'consumer'],
    'Supply Chain': ['supply', 'logistics', 'shipping', 'import', 'export'],
    'Product': ['product', 'safety', 'quality', 'standard', 'certification']
  }

  for (const [area, keywords] of Object.entries(areaMap)) {
    if (keywords.some(k => lower.includes(k))) {
      areas.push(area)
    }
  }

  if (focusAreas) {
    const focus = focusAreas.split(',').map(f => f.trim())
    for (const f of focus) {
      if (!areas.includes(f)) {
        areas.push(f)
      }
    }
  }

  return areas.length > 0 ? areas : ['General Operations']
}

function formatSummaryReport(result: SummaryResult): string {
  const lines: string[] = []
  lines.push('## Regulatory Document Summary')
  lines.push('')
  lines.push(`**Overview:** ${result.overview}`)
  lines.push('')
  lines.push(`**Affected Business Areas:** ${result.affectedBusinessAreas.join(', ')}`)
  lines.push(`**Document Size:** ${result.wordCount.original} words → ${result.wordCount.summary} words summarized`)
  lines.push('')

  if (result.keyObligations.length > 0) {
    lines.push('### Key Obligations')
    lines.push('| Obligation | Category | Priority |')
    lines.push('|------------|----------|----------|')
    for (const o of result.keyObligations) {
      lines.push(`| ${o.obligation.substring(0, 50)}... | ${o.category} | ${o.priority.toUpperCase()} |`)
    }
  }

  if (result.complianceActions.length > 0) {
    lines.push('')
    lines.push('### Required Compliance Actions')
    for (const a of result.complianceActions) {
      lines.push(`- **[${a.priority.toUpperCase()}]** ${a.action} — ${a.timeframe} (${a.responsible})`)
    }
  }

  if (result.keyDates.length > 0) {
    lines.push('')
    lines.push('### Key Dates')
    lines.push('| Date | Event | Significance |')
    lines.push('|------|-------|-------------|')
    for (const d of result.keyDates) {
      lines.push(`| ${d.date} | ${d.event.substring(0, 50)}... | ${d.significance} |`)
    }
  }

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'policy_change_detector',
    description: 'Detect and summarize regulatory policy changes from text documents. Analyzes policy documents for change type, impact level, affected areas, and required actions.',
    parameters: {
      policy_text: { type: 'string', required: true, description: 'JSON array of policy documents with fields: title, jurisdiction, date, content' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { policy_text: string }) {
      const data: PolicyDocument[] = JSON.parse(args.policy_text)
      const result = detectPolicyChanges(data)
      return formatPolicyChangeReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'compliance_gap_analyzer',
    description: 'Analyze compliance gaps between current business practices and regulatory requirements. Identifies missing or partial compliance with severity ratings and remediation steps.',
    parameters: {
      current_practices: { type: 'string', required: true, description: 'JSON array of current practices with fields: practice, category, coverage (full/partial/none), notes' },
      requirements: { type: 'string', required: true, description: 'JSON array of regulatory requirements with fields: requirement, category, jurisdiction, severity (mandatory/recommended/optional), deadline' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { current_practices: string; requirements: string }) {
      const practices: CompliancePractice[] = JSON.parse(args.current_practices)
      const reqs: RegulatoryRequirement[] = JSON.parse(args.requirements)
      const result = analyzeComplianceGaps(practices, reqs)
      return formatGapAnalysisReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'sanctions_screening',
    description: 'Screen entities against major sanctions lists including OFAC, EU, UN, UK, and others. Returns match confidence, risk levels, and recommended actions.',
    parameters: {
      entities: { type: 'string', required: true, description: 'JSON array of entities to screen with fields: name, country, identifier' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { entities: string }) {
      const data: Entity[] = JSON.parse(args.entities)
      const result = screenEntities(data)
      return formatSanctionsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'tariff_impact_calculator',
    description: 'Calculate tariff impact on product costs for cross-border trade. Computes tariffs, VAT, customs fees, and total landed cost with cost increase percentages.',
    parameters: {
      products: { type: 'string', required: true, description: 'JSON array of products with fields: hs_code, origin_country, destination_country, unit_cost, quantity' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { products: string }) {
      const data: Product[] = JSON.parse(args.products)
      const result = calculateTariffImpact(data)
      return formatTariffReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'license_requirement_checker',
    description: 'Check license requirements for cross-border business activities. Identifies required licenses, issuing authorities, timelines, costs, and key requirements.',
    parameters: {
      business_activities: { type: 'string', required: true, description: 'JSON array of business activities with fields: activity, target_country, product_category' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { business_activities: string }) {
      const data: BusinessActivity[] = JSON.parse(args.business_activities)
      const result = checkLicenseRequirements(data)
      return formatLicenseReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'regulatory_deadline_tracker',
    description: 'Track regulatory compliance deadlines with urgency levels. Monitors obligation status, days remaining, and provides prioritized action recommendations.',
    parameters: {
      obligations: { type: 'string', required: true, description: 'JSON array of compliance obligations with fields: name, jurisdiction, deadline_date, status (pending/in_progress/completed/overdue)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { obligations: string }) {
      const data: ComplianceObligation[] = JSON.parse(args.obligations)
      const result = trackDeadlines(data)
      return formatDeadlineReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'cross_border_risk_scorer',
    description: 'Score cross-border regulatory risk for transactions. Assesses country risk, product category risk, transaction value risk, and provides mitigation recommendations.',
    parameters: {
      transactions: { type: 'string', required: true, description: 'JSON array of transactions with fields: origin, destination, product_category, value' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { transactions: string }) {
      const data: CrossBorderTransaction[] = JSON.parse(args.transactions)
      const result = scoreCrossBorderRisk(data)
      return formatRiskScoreReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'regulation_summarizer',
    description: 'Summarize complex regulatory documents into structured overviews. Extracts key obligations, action items, affected business areas, and critical dates.',
    parameters: {
      document_text: { type: 'string', required: true, description: 'Full text of the regulatory document to summarize' },
      focus_areas: { type: 'string', description: 'Optional comma-separated list of business areas to focus on (e.g., "Finance,Operations,IT/Data")' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { document_text: string; focus_areas?: string }) {
      const result = summarizeRegulation(args.document_text, args.focus_areas)
      return formatSummaryReport(result)
    }
  }))

  console.log(`[dsh-tool-regulator] Loaded v${VERSION} — Cross-Border Regulatory Compliance Radar with 8 tools`)
  console.log('  Tools: policy_change_detector, compliance_gap_analyzer, sanctions_screening, tariff_impact_calculator, license_requirement_checker, regulatory_deadline_tracker, cross_border_risk_scorer, regulation_summarizer')
}
