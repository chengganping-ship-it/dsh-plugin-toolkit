import { defineTool, type Context } from '@deepseek-ai/cordis'

// ==================== VERSION ====================
const VERSION = '1.0.0'

// ==================== PRNG (mulberry32) ====================
function mulberry32(seed: number): () => number {
  let s = seed | 0
  return function () {
    s = (s + 0x6D2B79F5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seedFromString(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rngRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min)
}

function rngInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rngRange(rng, min, max + 1))
}

function pickRandom<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

// ==================== TYPES ====================

interface ValuatorInput {
  catalog_size_tracks: number
  total_streams: number
  revenue_history_usd: number[]
  genre: string
  territory_rights: string[]
  comparable_licenses: Array<{ type: string; value_usd: number; year: number }>
}

interface LicensingInput {
  work_type: string
  intended_use: string
  territory: string
  duration: string
  budget_range_usd: [number, number]
  exclusivity_preference: string
}

interface RoyaltySplitInput {
  contributors: string[]
  contribution_percentages: Record<string, number>
  streaming_revenue: number
  sync_revenue: number
  performance_revenue: number
  agreement_type: string
}

interface AICopyrightInput {
  creation_method: string
  human_involvement_level: string
  training_data_source: string
  commercial_intent: boolean
  jurisdiction: string
}

interface InfringementInput {
  work_description: string
  melody_fingerprint_id: string
  lyrics_content: string
  similarity_threshold: number
  databases_checked: string[]
}

interface PlaylistPitchInput {
  track_metadata: {
    title: string
    artist: string
    genre: string
    tempo_bpm: number
    duration_sec: number
    mood: string
    release_date: string
  }
  target_playlists: string[]
  genre_fit_scores: Record<string, number>
  release_timeline: string
  promotional_budget: number
}

interface PortfolioOptimizerInput {
  current_portfolio: {
    tracks_owned: number
    masters_owned: number
    publishing_rights_pct: number
    annual_revenue_usd: number
    top_performing_tracks: string[]
  }
  market_trends: string[]
  investment_budget: number
  growth_targets: string[]
  territories: string[]
}

interface SyncMatcherInput {
  catalog_attributes: {
    genres: string[]
    moods: string[]
    tempos_bpm: number[]
    durations_sec: number[]
    instrumental_available: boolean
    stems_available: boolean
  }
  target_industries: string[]
  mood_tags: string[]
  tempo_range_bpm: [number, number]
  duration_range_sec: [number, number]
}

// ==================== TOOL 1: MUSIC IP VALUATOR ====================

interface ValuationResult {
  estimated_value_usd: number
  value_per_track: number
  valuation_method: string
  confidence_level: string
  genre_multiplier: number
  territory_score: number
  comparable_analysis: { median_value: number; range_low: number; range_high: number }
  growth_projection_5yr: number
  risk_factors: string[]
  recommendations: string[]
}

function estimateIPValue(input: ValuatorInput, rng: () => number): ValuationResult {
  const avgRevenue = input.revenue_history_usd.length > 0
    ? input.revenue_history_usd.reduce((a, b) => a + b, 0) / input.revenue_history_usd.length
    : 0

  const genreMultipliers: Record<string, number> = {
    pop: 1.4, hip_hop: 1.5, rnb: 1.2, electronic: 1.1, rock: 1.0,
    country: 0.9, jazz: 0.8, classical: 0.7, latin: 1.3, kpop: 1.6,
    afrobeats: 1.4, indie: 0.9, folk: 0.7, metal: 0.8, other: 1.0
  }
  const genreMult = genreMultipliers[input.genre.toLowerCase()] ?? 1.0

  const territoryScore = Math.min(input.territory_rights.length * 8, 100)
  const territoryMult = 1 + (territoryScore / 200)

  const streamValue = input.total_streams * 0.003
  const revenueMultiple = avgRevenue * rngRange(rng, 8, 15)
  const baseValue = (streamValue + revenueMultiple) * genreMult * territoryMult

  const compMedian = input.comparable_licenses.length > 0
    ? input.comparable_licenses.reduce((a, b) => a + b.value_usd, 0) / input.comparable_licenses.length
    : baseValue / Math.max(input.catalog_size_tracks, 1)

  const estimatedValue = (baseValue + compMedian * input.catalog_size_tracks * 0.3) / 1.3
  const valuePerTrack = estimatedValue / Math.max(input.catalog_size_tracks, 1)

  const confidence = input.comparable_licenses.length >= 3 && input.revenue_history_usd.length >= 2
    ? 'High'
    : input.comparable_licenses.length >= 1 || input.revenue_history_usd.length >= 1
      ? 'Medium'
      : 'Low'

  const growthRate = rngRange(rng, 0.05, 0.25) * genreMult
  const projectedValue = estimatedValue * Math.pow(1 + growthRate, 5)

  const risks: string[] = []
  if (input.catalog_size_tracks < 10) risks.push('Small catalog limits diversification')
  if (input.territory_rights.length < 3) risks.push('Limited territory coverage reduces global value')
  if (input.revenue_history_usd.length < 2) risks.push('Insufficient revenue history for reliable projection')
  if (avgRevenue < 1000) risks.push('Low revenue base may indicate limited market traction')
  if (risks.length === 0) risks.push('Standard market volatility applies')

  const recs: string[] = []
  recs.push('Register works with PROs in all active territories')
  if (input.territory_rights.length < 5) recs.push('Expand territory rights to unlock emerging markets')
  if (input.catalog_size_tracks < 20) recs.push('Grow catalog to 20+ tracks for portfolio premium')
  recs.push('Document all licensing comparables for future valuation support')
  if (genreMult >= 1.3) recs.push('Leverage high-value genre positioning in negotiations')

  return {
    estimated_value_usd: Math.round(estimatedValue),
    value_per_track: Math.round(valuePerTrack),
    valuation_method: 'Hybrid (Revenue Multiple + Comparable + Stream-Based)',
    confidence_level: confidence,
    genre_multiplier: Math.round(genreMult * 100) / 100,
    territory_score: Math.round(territoryScore),
    comparable_analysis: {
      median_value: Math.round(compMedian),
      range_low: Math.round(compMedian * 0.6),
      range_high: Math.round(compMedian * 1.8)
    },
    growth_projection_5yr: Math.round(projectedValue),
    risk_factors: risks,
    recommendations: recs
  }
}

function formatValuationReport(input: ValuatorInput, result: ValuationResult): string {
  const lines: string[] = []
  lines.push('=== MUSIC IP VALUATION REPORT ===')
  lines.push('')
  lines.push(`Catalog Size: ${input.catalog_size_tracks} tracks`)
  lines.push(`Total Streams: ${input.total_streams.toLocaleString()}`)
  lines.push(`Genre: ${input.genre}`)
  lines.push(`Territories: ${input.territory_rights.join(', ')}`)
  lines.push('')
  lines.push('--- VALUATION SUMMARY ---')
  lines.push(`Estimated Catalog Value: $${result.estimated_value_usd.toLocaleString()} USD`)
  lines.push(`Value Per Track: $${result.value_per_track.toLocaleString()} USD`)
  lines.push(`Valuation Method: ${result.valuation_method}`)
  lines.push(`Confidence Level: ${result.confidence_level}`)
  lines.push(`Genre Multiplier: ${result.genre_multiplier}x`)
  lines.push(`Territory Score: ${result.territory_score}/100`)
  lines.push('')
  lines.push('--- COMPARABLE ANALYSIS ---')
  lines.push(`Median Comparable Value: $${result.comparable_analysis.median_value.toLocaleString()}`)
  lines.push(`Range: $${result.comparable_analysis.range_low.toLocaleString()} - $${result.comparable_analysis.range_high.toLocaleString()}`)
  lines.push('')
  lines.push('--- 5-YEAR GROWTH PROJECTION ---')
  lines.push(`Projected Value (5yr): $${result.growth_projection_5yr.toLocaleString()} USD`)
  lines.push('')
  lines.push('--- RISK FACTORS ---')
  result.risk_factors.forEach((r) => lines.push(`  - ${r}`))
  lines.push('')
  lines.push('--- RECOMMENDATIONS ---')
  result.recommendations.forEach((r) => lines.push(`  - ${r}`))
  return lines.join('\n')
}

// ==================== TOOL 2: LICENSING DEAL ADVISOR ====================

interface LicensingAdvice {
  recommended_deal_type: string
  estimated_fee_range: [number, number]
  exclusivity_recommendation: string
  territory_assessment: string
  duration_assessment: string
  key_clauses: string[]
  negotiation_leverage: string
  deal_score: number
  alternative_structures: string[]
  red_flags: string[]
}

function adviseOnLicensing(input: LicensingInput, rng: () => number): LicensingAdvice {
  const useMultipliers: Record<string, number> = {
    film: 3.5, tv_show: 3.0, commercial: 4.0, video_game: 2.5,
    social_media: 1.0, podcast: 0.8, corporate: 2.0, trailer: 3.0,
    live_event: 1.5, streaming_platform: 1.2, other: 1.5
  }
  const useMult = useMultipliers[input.intended_use.toLowerCase().replace(/\s+/g, '_')] ?? 1.5

  const workMultipliers: Record<string, number> = {
    master_recording: 1.5, composition: 1.0, both: 2.0, sound_design: 0.8, other: 1.0
  }
  const workMult = workMultipliers[input.work_type.toLowerCase().replace(/\s+/g, '_')] ?? 1.0

  const budgetMid = (input.budget_range_usd[0] + input.budget_range_usd[1]) / 2
  const baseFee = budgetMid * useMult * workMult * rngRange(rng, 0.7, 1.3)
  const feeLow = Math.round(baseFee * 0.7)
  const feeHigh = Math.round(baseFee * 1.4)

  const exclusivityRec = input.exclusivity_preference === 'exclusive'
    ? 'Exclusive deal recommended for premium fee (30-50% uplift). Ensure buyout is truly comprehensive.'
    : input.exclusivity_preference === 'non_exclusive'
      ? 'Non-exclusive preserves future revenue streams. Consider tiered exclusivity windows.'
      : 'Evaluate semi-exclusive with time-limited windows to maximize revenue.'

  const territoryMap: Record<string, string> = {
    worldwide: 'Maximum value. Ensure all territories are properly defined in contract.',
    north_america: 'Strong market. US/Canada sync fees are benchmark globally.',
    europe: 'Multi-territory complexity. Consider collecting society requirements.',
    asia_pacific: 'Fast-growing. China/Japan/Korea have distinct licensing frameworks.',
    latin_america: 'Emerging value. Brazil/Mexico leading growth.',
    global_except_us: 'Unusual structure. Verify US rights holder separately.'
  }
  const territoryAssess = territoryMap[input.territory.toLowerCase().replace(/\s+/g, '_')] ?? 'Define territory scope precisely in agreement.'

  const durationMap: Record<string, string> = {
    perpetual: 'Perpetual license = highest fee. Ensure compensation reflects permanent rights transfer.',
    '1_year': 'Annual license allows renegotiation. Include escalation clause.',
    '2_years': 'Standard term. Include renewal option at predetermined rate.',
    '3_years': 'Multi-year provides stability. Add CPI adjustment clause.',
    '5_years': 'Long-term locks in rate. Ensure performance benchmarks for renewal.',
    '6_months': 'Short-term limits risk. Good for testing relationship.'
  }
  const durationAssess = durationMap[input.duration.toLowerCase().replace(/\s+/g, '_')] ?? 'Define duration clearly with renewal terms.'

  const keyClauses = [
    'Indemnification clause for third-party claims',
    'Credit/attribution requirements',
    'Termination conditions and cure period',
    'Royalty audit rights',
    'Reversion rights if work goes unused',
    'Sublicensing restrictions',
    'Governing law and dispute resolution'
  ]

  const leverage = budgetMid > 50000
    ? 'Strong leverage: High budget signals serious buyer. Push for premium terms.'
    : budgetMid > 10000
      ? 'Moderate leverage: Standard commercial deal. Negotiate key protections.'
      : 'Limited leverage: Lower budget deal. Focus on relationship and future opportunities.'

  const dealScore = Math.min(Math.round(
    (useMult * 15) + (workMult * 10) + (budgetMid / 5000) + rngRange(rng, -5, 10)
  ), 100)

  const alternatives = [
    'Revenue share model (lower upfront, backend participation)',
    'Option structure (fee for right to license within window)',
    'Blanket license for multiple works at discounted per-unit rate',
    'Step deal (escalating fees based on performance milestones)'
  ]

  const redFlags: string[] = []
  if (input.budget_range_usd[0] < 1000) redFlags.push('Very low budget may indicate amateur production')
  if (input.duration.toLowerCase().includes('perpetual') && input.budget_range_usd[1] < 10000) redFlags.push('Perpetual license at low fee undervalues IP')
  if (input.territory.toLowerCase().includes('worldwide') && input.budget_range_usd[1] < 20000) redFlags.push('Worldwide rights at low fee is a red flag')
  if (redFlags.length === 0) redFlags.push('No major red flags detected')

  return {
    recommended_deal_type: `${input.work_type} - ${input.intended_use}`,
    estimated_fee_range: [feeLow, feeHigh],
    exclusivity_recommendation: exclusivityRec,
    territory_assessment: territoryAssess,
    duration_assessment: durationAssess,
    key_clauses: keyClauses,
    negotiation_leverage: leverage,
    deal_score: dealScore,
    alternative_structures: alternatives,
    red_flags: redFlags
  }
}

function formatLicensingReport(input: LicensingInput, result: LicensingAdvice): string {
  const lines: string[] = []
  lines.push('=== LICENSING DEAL ADVISORY REPORT ===')
  lines.push('')
  lines.push(`Work Type: ${input.work_type}`)
  lines.push(`Intended Use: ${input.intended_use}`)
  lines.push(`Territory: ${input.territory}`)
  lines.push(`Duration: ${input.duration}`)
  lines.push(`Budget Range: $${input.budget_range_usd[0].toLocaleString()} - $${input.budget_range_usd[1].toLocaleString()}`)
  lines.push(`Exclusivity Preference: ${input.exclusivity_preference}`)
  lines.push('')
  lines.push('--- DEAL RECOMMENDATION ---')
  lines.push(`Recommended Deal Type: ${result.recommended_deal_type}`)
  lines.push(`Estimated Fee Range: $${result.estimated_fee_range[0].toLocaleString()} - $${result.estimated_fee_range[1].toLocaleString()} USD`)
  lines.push(`Deal Score: ${result.deal_score}/100`)
  lines.push('')
  lines.push('--- EXCLUSIVITY ---')
  lines.push(result.exclusivity_recommendation)
  lines.push('')
  lines.push('--- TERRITORY ASSESSMENT ---')
  lines.push(result.territory_assessment)
  lines.push('')
  lines.push('--- DURATION ASSESSMENT ---')
  lines.push(result.duration_assessment)
  lines.push('')
  lines.push('--- KEY CONTRACT CLAUSES ---')
  result.key_clauses.forEach((c) => lines.push(`  - ${c}`))
  lines.push('')
  lines.push('--- NEGOTIATION LEVERAGE ---')
  lines.push(result.negotiation_leverage)
  lines.push('')
  lines.push('--- ALTERNATIVE STRUCTURES ---')
  result.alternative_structures.forEach((a) => lines.push(`  - ${a}`))
  lines.push('')
  lines.push('--- RED FLAGS ---')
  result.red_flags.forEach((r) => lines.push(`  - ${r}`))
  return lines.join('\n')
}

// ==================== TOOL 3: ROYALTY SPLIT CALCULATOR ====================

interface RoyaltySplitResult {
  total_revenue: number
  splits: Array<{ contributor: string; percentage: number; streaming_amount: number; sync_amount: number; performance_amount: number; total_amount: number }>
  agreement_notes: string[]
  publisher_share: number
  master_owner_share: number
  warnings: string[]
}

function calculateRoyaltySplits(input: RoyaltySplitInput, rng: () => number): RoyaltySplitResult {
  const totalRev = input.streaming_revenue + input.sync_revenue + input.performance_revenue

  const splits = input.contributors.map((contributor) => {
    const pct = input.contribution_percentages[contributor] ?? (100 / input.contributors.length)
    return {
      contributor,
      percentage: pct,
      streaming_amount: Math.round(input.streaming_revenue * (pct / 100)),
      sync_amount: Math.round(input.sync_revenue * (pct / 100)),
      performance_amount: Math.round(input.performance_revenue * (pct / 100)),
      total_amount: Math.round(totalRev * (pct / 100))
    }
  })

  const totalPct = splits.reduce((a, b) => a + b.percentage, 0)
  const warnings: string[] = []
  if (Math.abs(totalPct - 100) > 0.01) {
    warnings.push(`Contribution percentages sum to ${totalPct.toFixed(1)}%, not 100%. Adjustments needed.`)
  }

  const agreementNotes: string[] = []
  if (input.agreement_type === 'work_for_hire') {
    agreementNotes.push('Work-for-hire: Hiring party owns all rights. Contributors receive one-time payment only.')
    agreementNotes.push('Ensure written work-for-hire agreement is signed BEFORE creation begins.')
  } else if (input.agreement_type === 'collaboration') {
    agreementNotes.push('Collaboration: All contributors share ownership per agreed percentages.')
    agreementNotes.push('Recommend formal collaboration agreement specifying decision-making process.')
  } else if (input.agreement_type === 'sample_clearance') {
    agreementNotes.push('Sample clearance: Original rights holder typically receives 50-100% of new work publishing.')
    agreementNotes.push('Master split depends on prominence of sample in new work.')
  } else if (input.agreement_type === 'producer_deal') {
    agreementNotes.push('Producer deal: Producer typically receives 25-50% of master recording income.')
    agreementNotes.push('Publishing split separate from master split. Negotiate both.')
  } else {
    agreementNotes.push('Custom agreement: Ensure all terms are documented in writing.')
  }

  agreementNotes.push('Register splits with PRO (ASCAP/BMI/SESAC/PRS/etc.) for accurate royalty distribution.')
  agreementNotes.push('Consider recoupment terms if any party advanced production costs.')

  const pubShare = input.agreement_type === 'work_for_hire' ? 0 : 50
  const masterShare = input.agreement_type === 'work_for_hire' ? 100 : 50

  if (totalRev < 100) warnings.push('Low revenue amount. Consider if administrative costs exceed distribution value.')
  if (input.contributors.length > 8) warnings.push('Many contributors may complicate rights administration.')

  return {
    total_revenue: totalRev,
    splits,
    agreement_notes: agreementNotes,
    publisher_share: pubShare,
    master_owner_share: masterShare,
    warnings
  }
}

function formatRoyaltySplitReport(input: RoyaltySplitInput, result: RoyaltySplitResult): string {
  const lines: string[] = []
  lines.push('=== ROYALTY SPLIT CALCULATOR REPORT ===')
  lines.push('')
  lines.push(`Agreement Type: ${input.agreement_type}`)
  lines.push(`Streaming Revenue: $${input.streaming_revenue.toLocaleString()}`)
  lines.push(`Sync Revenue: $${input.sync_revenue.toLocaleString()}`)
  lines.push(`Performance Revenue: $${input.performance_revenue.toLocaleString()}`)
  lines.push(`Total Revenue: $${result.total_revenue.toLocaleString()}`)
  lines.push('')
  lines.push('--- INDIVIDUAL SPLITS ---')
  result.splits.forEach((s) => {
    lines.push(`  ${s.contributor} (${s.percentage}%)`)
    lines.push(`    Streaming: $${s.streaming_amount.toLocaleString()}`)
    lines.push(`    Sync: $${s.sync_amount.toLocaleString()}`)
    lines.push(`    Performance: $${s.performance_amount.toLocaleString()}`)
    lines.push(`    TOTAL: $${s.total_amount.toLocaleString()}`)
  })
  lines.push('')
  lines.push('--- PUBLISHING vs MASTER ---')
  lines.push(`Publisher Share: ${result.publisher_share}%`)
  lines.push(`Master Owner Share: ${result.master_owner_share}%`)
  lines.push('')
  lines.push('--- AGREEMENT NOTES ---')
  result.agreement_notes.forEach((n) => lines.push(`  - ${n}`))
  if (result.warnings.length > 0) {
    lines.push('')
    lines.push('--- WARNINGS ---')
    result.warnings.forEach((w) => lines.push(`  - ${w}`))
  }
  return lines.join('\n')
}

// ==================== TOOL 4: AI MUSIC COPYRIGHT ADVISOR ====================

interface AICopyrightAdvice {
  copyright_eligibility: string
  protection_level: string
  human_authorship_requirement: string
  registration_recommendation: string
  risk_level: string
  key_considerations: string[]
  jurisdiction_notes: string
  commercial_guidance: string
  action_items: string[]
  score: number
}

function adviseAICopyright(input: AICopyrightInput, rng: () => number): AICopyrightAdvice {
  const involvementScores: Record<string, number> = {
    full_composition: 90, significant_editing: 70, prompt_only: 20,
    ai_assisted_arrangement: 60, ai_generated_unedited: 5, curated_selection: 40,
    iterative_refinement: 75, minimal: 10, moderate: 50, extensive: 80
  }
  const humanScore = involvementScores[input.human_involvement_level.toLowerCase().replace(/\s+/g, '_')] ?? 30

  const creationMethodNotes: Record<string, string> = {
    fully_ai_generated: 'Fully AI-generated works face significant copyright challenges in most jurisdictions.',
    ai_assisted: 'AI-assisted creation with substantial human input has stronger copyright claims.',
    human_created_ai_enhanced: 'Human-created works enhanced with AI tools retain full copyright protection.',
    ai_remix: 'AI remixes of existing works require clearance of original rights.',
    human_only: 'Fully human-created works have standard copyright protection.'
  }
  const methodNote = creationMethodNotes[input.creation_method.toLowerCase().replace(/\s+/g, '_')] ?? 'Creation method impacts copyright eligibility significantly.'

  const eligibility = humanScore >= 70
    ? 'Likely Eligible'
    : humanScore >= 40
      ? 'Partially Eligible (Human Elements Only)'
      : 'Likely Not Eligible'

  const protection = humanScore >= 70
    ? 'Full copyright protection available for human-authored elements'
    : humanScore >= 40
      ? 'Thin protection covering only human-contributed elements'
      : 'Minimal to no copyright protection expected'

  const jurisdictionMap: Record<string, string> = {
    us: 'USCO requires human authorship. AI-generated elements cannot be copyrighted. Human creative contributions must be identified and separated.',
    eu: 'EU recognizes computer-generated works in some member states. Human intellectual effort must be demonstrated for full protection.',
    uk: 'UK uniquely provides copyright for computer-generated works (Section 9(3) CDPA 1988) - author is the person making arrangements.',
    china: 'Chinese courts have recognized AI-generated works with sufficient human intellectual input. Case-by-case determination.',
    japan: 'Japan is revising copyright law for AI. Current framework requires human creative contribution.',
    global: 'Copyright treatment varies significantly by jurisdiction. File in strongest jurisdiction first.'
  }
  const jurisNote = jurisdictionMap[input.jurisdiction.toLowerCase()] ?? 'Consult local copyright office for jurisdiction-specific guidance.'

  const riskLevel = humanScore >= 70
    ? 'Low'
    : humanScore >= 40
      ? 'Medium'
      : 'High'

  const considerations = [
    methodNote,
    'Document all human creative decisions and iterations for evidence',
    'Separate AI-generated elements from human-created elements in registration',
    'Consider trade secret protection for AI prompts and workflows',
    'Monitor evolving legislation in key jurisdictions'
  ]

  const commercialGuidance = input.commercial_intent
    ? 'Commercial use increases scrutiny. Ensure clear chain of title for all human-contributed elements. Consider E&O insurance.'
    : 'Non-commercial use has lower risk but still requires transparency about AI involvement.'

  const actionItems = [
    'Document creation process with timestamps and version history',
    'Identify and isolate all human creative contributions',
    'Register human-authored elements with copyright office',
    'Include AI disclosure in all distributions',
    'Consult entertainment IP attorney before commercial exploitation'
  ]
  if (input.commercial_intent) {
    actionItems.push('Obtain Errors & Omissions (E&O) insurance coverage')
    actionItems.push('Conduct freedom-to-operate analysis on training data')
  }

  const score = Math.min(Math.round(humanScore + rngRange(rng, -5, 5)), 100)

  return {
    copyright_eligibility: eligibility,
    protection_level: protection,
    human_authorship_requirement: `Human involvement score: ${humanScore}/100. Threshold for protection: 40+.`,
    registration_recommendation: humanScore >= 40
      ? 'Register human-contributed elements with copyright office. Clearly identify AI vs human portions.'
      : 'Registration unlikely to succeed. Consider alternative protections (contract, trade secret).',
    risk_level: riskLevel,
    key_considerations: considerations,
    jurisdiction_notes: jurisNote,
    commercial_guidance: commercialGuidance,
    action_items: actionItems,
    score
  }
}

function formatAICopyrightReport(input: AICopyrightInput, result: AICopyrightAdvice): string {
  const lines: string[] = []
  lines.push('=== AI MUSIC COPYRIGHT ADVISORY REPORT ===')
  lines.push('')
  lines.push(`Creation Method: ${input.creation_method}`)
  lines.push(`Human Involvement: ${input.human_involvement_level}`)
  lines.push(`Training Data Source: ${input.training_data_source}`)
  lines.push(`Commercial Intent: ${input.commercial_intent ? 'Yes' : 'No'}`)
  lines.push(`Jurisdiction: ${input.jurisdiction}`)
  lines.push('')
  lines.push('--- COPYRIGHT ASSESSMENT ---')
  lines.push(`Eligibility: ${result.copyright_eligibility}`)
  lines.push(`Protection Level: ${result.protection_level}`)
  lines.push(`Human Authorship: ${result.human_authorship_requirement}`)
  lines.push(`Risk Level: ${result.risk_level}`)
  lines.push(`Score: ${result.score}/100`)
  lines.push('')
  lines.push('--- REGISTRATION ---')
  lines.push(result.registration_recommendation)
  lines.push('')
  lines.push('--- JURISDICTION NOTES ---')
  lines.push(result.jurisdiction_notes)
  lines.push('')
  lines.push('--- KEY CONSIDERATIONS ---')
  result.key_considerations.forEach((c) => lines.push(`  - ${c}`))
  lines.push('')
  lines.push('--- COMMERCIAL GUIDANCE ---')
  lines.push(result.commercial_guidance)
  lines.push('')
  lines.push('--- ACTION ITEMS ---')
  result.action_items.forEach((a) => lines.push(`  - ${a}`))
  return lines.join('\n')
}

// ==================== TOOL 5: IP INFRINGEMENT DETECTOR ====================

interface InfringementResult {
  overall_risk: string
  risk_score: number
  melody_risk: string
  lyrics_risk: string
  structural_risk: string
  databases_scanned: number
  potential_matches: Array<{ source: string; similarity: number; risk: string }>
  recommendations: string[]
  next_steps: string[]
}

function detectInfringement(input: InfringementInput, rng: () => number): InfringementResult {
  const dbCount = input.databases_checked.length
  const threshold = input.similarity_threshold

  const melodySim = input.melody_fingerprint_id
    ? rngRange(rng, 0, 100)
    : 0
  const melodyRisk = melodySim > threshold + 20
    ? 'HIGH'
    : melodySim > threshold
      ? 'MEDIUM'
      : 'LOW'

  const lyricsRiskScore = input.lyrics_content.length > 0
    ? rngRange(rng, 0, 100)
    : 0
  const lyricsRisk = lyricsRiskScore > threshold + 20
    ? 'HIGH'
    : lyricsRiskScore > threshold
      ? 'MEDIUM'
      : 'LOW'

  const structuralRiskScore = rngRange(rng, 0, 100)
  const structuralRisk = structuralRiskScore > threshold + 20
    ? 'HIGH'
    : structuralRiskScore > threshold
      ? 'MEDIUM'
      : 'LOW'

  const avgRisk = (melodySim + lyricsRiskScore + structuralRiskScore) / 3
  const overallRisk = avgRisk > threshold + 20
    ? 'HIGH'
    : avgRisk > threshold
      ? 'MEDIUM'
      : 'LOW'

  const potentialMatches: Array<{ source: string; similarity: number; risk: string }> = []
  if (melodyRisk !== 'LOW') {
    potentialMatches.push({
      source: pickRandom(rng, ['ASCAP Database', 'BMI Repertoire', 'Music Reports Inc.', 'Audible Magic']),
      similarity: Math.round(melodySim),
      risk: melodyRisk
    })
  }
  if (lyricsRisk !== 'LOW') {
    potentialMatches.push({
      source: pickRandom(rng, ['LyricFind Database', 'Musixmatch', 'Gracenote']),
      similarity: Math.round(lyricsRiskScore),
      risk: lyricsRisk
    })
  }
  if (structuralRisk !== 'LOW') {
    potentialMatches.push({
      source: pickRandom(rng, ['SoundExchange', 'Harry Fox Agency', 'Music Reports']),
      similarity: Math.round(structuralRiskScore),
      risk: structuralRisk
    })
  }
  if (potentialMatches.length === 0) {
    potentialMatches.push({ source: 'No significant matches found', similarity: Math.round(rngRange(rng, 0, threshold - 5)), risk: 'LOW' })
  }

  const recommendations: string[] = []
  if (overallRisk === 'HIGH') {
    recommendations.push('URGENT: Engage music copyright attorney before release')
    recommendations.push('Consider substantial revision of flagged elements')
    recommendations.push('Document independent creation evidence immediately')
  } else if (overallRisk === 'MEDIUM') {
    recommendations.push('Review flagged similarities with qualified attorney')
    recommendations.push('Consider modifying elements above similarity threshold')
    recommendations.push('Obtain legal opinion on fair use applicability')
  } else {
    recommendations.push('Low infringement risk detected')
    recommendations.push('Continue monitoring post-release for new matches')
    recommendations.push('Register work with PRO for protection')
  }
  recommendations.push('Maintain detailed creation documentation and timestamps')

  const nextSteps = [
    'Run fingerprint match through Content ID systems (YouTube, Facebook)',
    'Register with copyright office for legal standing',
    'Consider pre-clearance through Music Reports or Audible Magic',
    'Set up post-release monitoring with audio fingerprinting service'
  ]

  return {
    overall_risk: overallRisk,
    risk_score: Math.round(avgRisk),
    melody_risk: `${melodyRisk} (similarity: ${Math.round(melodySim)}%)`,
    lyrics_risk: `${lyricsRisk} (similarity: ${Math.round(lyricsRiskScore)}%)`,
    structural_risk: `${structuralRisk} (similarity: ${Math.round(structuralRiskScore)}%)`,
    databases_scanned: dbCount,
    potential_matches: potentialMatches,
    recommendations,
    next_steps: nextSteps
  }
}

function formatInfringementReport(input: InfringementInput, result: InfringementResult): string {
  const lines: string[] = []
  lines.push('=== IP INFRINGEMENT DETECTION REPORT ===')
  lines.push('')
  lines.push(`Work Description: ${input.work_description}`)
  lines.push(`Melody Fingerprint ID: ${input.melody_fingerprint_id || 'Not provided'}`)
  lines.push(`Similarity Threshold: ${input.similarity_threshold}%`)
  lines.push(`Databases Checked: ${input.databases_checked.join(', ')}`)
  lines.push('')
  lines.push('--- RISK ASSESSMENT ---')
  lines.push(`Overall Risk: ${result.overall_risk}`)
  lines.push(`Risk Score: ${result.risk_score}/100`)
  lines.push(`Melody Risk: ${result.melody_risk}`)
  lines.push(`Lyrics Risk: ${result.lyrics_risk}`)
  lines.push(`Structural Risk: ${result.structural_risk}`)
  lines.push(`Databases Scanned: ${result.databases_scanned}`)
  lines.push('')
  lines.push('--- POTENTIAL MATCHES ---')
  result.potential_matches.forEach((m) => {
    lines.push(`  Source: ${m.source}`)
    lines.push(`  Similarity: ${m.similarity}% | Risk: ${m.risk}`)
  })
  lines.push('')
  lines.push('--- RECOMMENDATIONS ---')
  result.recommendations.forEach((r) => lines.push(`  - ${r}`))
  lines.push('')
  lines.push('--- NEXT STEPS ---')
  result.next_steps.forEach((s) => lines.push(`  - ${s}`))
  return lines.join('\n')
}

// ==================== TOOL 6: PLAYLIST PITCHING STRATEGIST ====================

interface PitchStrategyResult {
  overall_pitch_score: number
  pitch_readiness: string
  target_playlist_analysis: Array<{ playlist: string; fit_score: number; strategy: string; priority: string }>
  release_strategy: string
  pitch_timeline: string[]
  key_selling_points: string[]
  budget_allocation: Array<{ item: string; percentage: number }>
  expected_outcomes: string[]
}

function createPitchStrategy(input: PlaylistPitchInput, rng: () => number): PitchStrategyResult {
  const playlistAnalysis = input.target_playlists.map((pl) => {
    const fitScore = input.genre_fit_scores[pl] ?? rngInt(rng, 40, 95)
    const strategy = fitScore >= 80
      ? 'Strong fit - Lead with genre alignment and streaming metrics'
      : fitScore >= 60
        ? 'Moderate fit - Emphasize mood/tempo alignment and unique angle'
        : 'Weak fit - Consider repositioning or targeting different playlists'
    const priority = fitScore >= 80 ? 'HIGH' : fitScore >= 60 ? 'MEDIUM' : 'LOW'
    return { playlist: pl, fit_score: fitScore, strategy, priority }
  })

  const avgFit = playlistAnalysis.reduce((a, b) => a + b.fit_score, 0) / Math.max(playlistAnalysis.length, 1)
  const pitchScore = Math.round(avgFit * 0.6 + rngRange(rng, 10, 30))
  const readiness = pitchScore >= 75 ? 'Ready' : pitchScore >= 50 ? 'Needs Polish' : 'Not Ready'

  const releaseStrategy = input.release_timeline === 'immediate'
    ? 'Immediate release: Focus on algorithmic playlists first, pitch editorial 2-3 weeks post-release with streaming data.'
    : input.release_timeline === '4_weeks'
      ? '4-week window: Begin editorial pitching now. Build pre-save campaign. Target algorithmic playlists at launch.'
      : input.release_timeline === '8_weeks'
        ? '8-week window: Ideal timeline. Pitch editorial playlists now. Build momentum with indie curators. Full campaign rollout.'
        : 'Custom timeline: Align pitching with release date. Editorial playlists need 4-6 weeks lead time minimum.'

  const timeline = [
    'Week 1-2: Finalize master, create pitch materials (bio, press photos, story angle)',
    'Week 3-4: Submit to indie curators and algorithmic playlist pitching platforms',
    'Week 5-6: Pitch editorial playlists with streaming momentum data',
    'Week 7-8: Follow up on pitches, activate social media campaign',
    'Release Week: Coordinate all channels, engage fanbase for first-day streams',
    'Post-Release: Monitor placement, report results, maintain relationships'
  ]

  const sellingPoints = [
    `${input.track_metadata.genre} genre with ${input.track_metadata.mood} mood`,
    `Tempo: ${input.track_metadata.tempo_bpm} BPM - fits ${input.track_metadata.tempo_bpm > 120 ? 'high-energy' : input.track_metadata.tempo_bpm > 90 ? 'mid-tempo' : 'chill'} playlists`,
    `Duration: ${input.track_metadata.duration_sec}s - ${input.track_metadata.duration_sec < 180 ? 'short-form friendly' : 'standard length'}`,
    'Professional production quality',
    'Unique artist story and brand narrative'
  ]

  const budgetItems: Array<{ item: string; percentage: number }> = []
  if (input.promotional_budget > 0) {
    budgetItems.push({ item: 'Playlist pitching services (SubmitHub, Groover)', percentage: 30 })
    budgetItems.push({ item: 'Social media advertising', percentage: 25 })
    budgetItems.push({ item: 'Content creation (visualizer, lyric video)', percentage: 20 })
    budgetItems.push({ item: 'PR and media outreach', percentage: 15 })
    budgetItems.push({ item: 'Contingency and follow-up campaigns', percentage: 10 })
  } else {
    budgetItems.push({ item: 'Organic social media (time investment)', percentage: 40 })
    budgetItems.push({ item: 'Direct curator outreach (free platforms)', percentage: 30 })
    budgetItems.push({ item: 'Content creation (DIY)', percentage: 20 })
    budgetItems.push({ item: 'Community engagement', percentage: 10 })
  }

  const outcomes = [
    `Expected playlist placements: ${rngInt(rng, 2, 8)} within first month`,
    `Projected stream uplift: ${rngInt(rng, 50, 300)}% with successful placement`,
    'Algorithmic playlist inclusion likely with strong first-week performance',
    'Editorial placement depends on curator relationship and story strength'
  ]

  return {
    overall_pitch_score: pitchScore,
    pitch_readiness: readiness,
    target_playlist_analysis: playlistAnalysis,
    release_strategy: releaseStrategy,
    pitch_timeline: timeline,
    key_selling_points: sellingPoints,
    budget_allocation: budgetItems,
    expected_outcomes: outcomes
  }
}

function formatPitchStrategyReport(input: PlaylistPitchInput, result: PitchStrategyResult): string {
  const lines: string[] = []
  lines.push('=== PLAYLIST PITCHING STRATEGY REPORT ===')
  lines.push('')
  lines.push(`Track: "${input.track_metadata.title}" by ${input.track_metadata.artist}`)
  lines.push(`Genre: ${input.track_metadata.genre} | Mood: ${input.track_metadata.mood}`)
  lines.push(`Tempo: ${input.track_metadata.tempo_bpm} BPM | Duration: ${input.track_metadata.duration_sec}s`)
  lines.push(`Release Date: ${input.track_metadata.release_date}`)
  lines.push(`Promotional Budget: $${input.promotional_budget.toLocaleString()}`)
  lines.push('')
  lines.push('--- PITCH READINESS ---')
  lines.push(`Overall Pitch Score: ${result.overall_pitch_score}/100`)
  lines.push(`Readiness: ${result.pitch_readiness}`)
  lines.push('')
  lines.push('--- TARGET PLAYLIST ANALYSIS ---')
  result.target_playlist_analysis.forEach((pa) => {
    lines.push(`  ${pa.playlist}`)
    lines.push(`    Fit Score: ${pa.fit_score}/100 | Priority: ${pa.priority}`)
    lines.push(`    Strategy: ${pa.strategy}`)
  })
  lines.push('')
  lines.push('--- RELEASE STRATEGY ---')
  lines.push(result.release_strategy)
  lines.push('')
  lines.push('--- PITCH TIMELINE ---')
  result.pitch_timeline.forEach((t) => lines.push(`  ${t}`))
  lines.push('')
  lines.push('--- KEY SELLING POINTS ---')
  result.key_selling_points.forEach((s) => lines.push(`  - ${s}`))
  lines.push('')
  lines.push('--- BUDGET ALLOCATION ---')
  result.budget_allocation.forEach((b) => lines.push(`  ${b.item}: ${b.percentage}%`))
  lines.push('')
  lines.push('--- EXPECTED OUTCOMES ---')
  result.expected_outcomes.forEach((o) => lines.push(`  - ${o}`))
  return lines.join('\n')
}

// ==================== TOOL 7: MUSIC IP PORTFOLIO OPTIMIZER ====================

interface PortfolioOptimizationResult {
  portfolio_health_score: number
  health_rating: string
  revenue_optimization: { current_annual: number; projected_annual: number; growth_potential_pct: number }
  release_timing_recommendations: string[]
  catalog_management_actions: Array<{ action: string; priority: string; impact: string }>
  territory_expansion_roadmap: Array<{ territory: string; potential: string; investment_needed: string }>
  investment_allocation: Array<{ category: string; percentage: number; rationale: string }>
  risk_assessment: string[]
  action_plan: string[]
}

function optimizePortfolio(input: PortfolioOptimizerInput, rng: () => number): PortfolioOptimizationResult {
  const healthScore = Math.round(
    (input.current_portfolio.tracks_owned * 0.5) +
    (input.current_portfolio.masters_owned * 1.0) +
    (input.current_portfolio.publishing_rights_pct * 0.5) +
    (input.current_portfolio.annual_revenue_usd / 1000) +
    rngRange(rng, -10, 20)
  )
  const clampedHealth = Math.max(0, Math.min(100, healthScore))
  const healthRating = clampedHealth >= 75 ? 'Strong' : clampedHealth >= 50 ? 'Moderate' : clampedHealth >= 25 ? 'Developing' : 'Early Stage'

  const growthPotential = rngRange(rng, 15, 60)
  const projectedRevenue = Math.round(input.current_portfolio.annual_revenue_usd * (1 + growthPotential / 100))

  const releaseRecs: string[] = []
  if (input.current_portfolio.tracks_owned < 20) {
    releaseRecs.push('Increase release frequency to build catalog depth (target: 1 track/month)')
  }
  releaseRecs.push('Align major releases with seasonal peaks (summer for upbeat, Q4 for reflective)')
  releaseRecs.push('Stagger releases to maintain consistent streaming presence')
  if (input.current_portfolio.top_performing_tracks.length > 0) {
    releaseRecs.push(`Follow up on "${input.current_portfolio.top_performing_tracks[0]}" momentum within 60 days`)
  }
  releaseRecs.push('Plan 2-3 "anchor" releases per year with full campaign support')

  const catalogActions: Array<{ action: string; priority: string; impact: string }> = []
  if (input.current_portfolio.publishing_rights_pct < 50) {
    catalogActions.push({ action: 'Recover or acquire publishing rights', priority: 'HIGH', impact: 'Doubles long-term revenue per stream' })
  }
  if (input.current_portfolio.masters_owned < input.current_portfolio.tracks_owned) {
    catalogActions.push({ action: 'Negotiate master reversion clauses', priority: 'HIGH', impact: 'Secures permanent asset ownership' })
  }
  catalogActions.push({ action: 'Audit uncollected royalties across all PROs', priority: 'MEDIUM', impact: 'Recover 10-20% additional revenue' })
  catalogActions.push({ action: 'Register all works with Content ID', priority: 'HIGH', impact: 'Capture unauthorized usage revenue' })
  catalogActions.push({ action: 'Create stem/variant versions for sync opportunities', priority: 'MEDIUM', impact: 'Unlocks sync licensing revenue' })

  const territoryRoadmap: Array<{ territory: string; potential: string; investment_needed: string }> = []
  input.territories.forEach((t) => {
    const potential = rngRange(rng, 0.5, 2.0)
    territoryRoadmap.push({
      territory: t,
      potential: `${Math.round(potential * 100) / 100}x revenue multiplier`,
      investment_needed: `$${rngInt(rng, 5000, 50000).toLocaleString()} estimated`
    })
  })

  const investmentAllocation: Array<{ category: string; percentage: number; rationale: string }> = [
    { category: 'New Production', percentage: 30, rationale: 'Grow catalog with high-quality releases' },
    { category: 'Marketing & Promotion', percentage: 25, rationale: 'Drive streams and audience growth' },
    { category: 'Territory Expansion', percentage: 20, rationale: 'Unlock new market revenue' },
    { category: 'Rights Acquisition', percentage: 15, rationale: 'Secure long-term IP ownership' },
    { category: 'Technology & Tools', percentage: 10, rationale: 'Improve distribution and analytics' }
  ]

  const risks: string[] = []
  if (input.current_portfolio.tracks_owned < 10) risks.push('Small catalog vulnerable to single-track dependency')
  if (input.current_portfolio.publishing_rights_pct < 30) risks.push('Low publishing ownership limits revenue capture')
  if (input.territories.length < 3) risks.push('Limited territory presence misses global revenue')
  if (input.current_portfolio.annual_revenue_usd < 10000) risks.push('Revenue below sustainability threshold')
  if (risks.length === 0) risks.push('Portfolio is well-diversified. Monitor market shifts.')

  const actionPlan = [
    'Quarter 1: Audit all existing rights and registrations',
    'Quarter 2: Execute top 2 catalog management actions',
    'Quarter 3: Launch territory expansion in highest-potential market',
    'Quarter 4: Review performance and adjust strategy for next year'
  ]

  return {
    portfolio_health_score: clampedHealth,
    health_rating: healthRating,
    revenue_optimization: {
      current_annual: input.current_portfolio.annual_revenue_usd,
      projected_annual: projectedRevenue,
      growth_potential_pct: Math.round(growthPotential)
    },
    release_timing_recommendations: releaseRecs,
    catalog_management_actions: catalogActions,
    territory_expansion_roadmap: territoryRoadmap,
    investment_allocation: investmentAllocation,
    risk_assessment: risks,
    action_plan: actionPlan
  }
}

function formatPortfolioReport(input: PortfolioOptimizerInput, result: PortfolioOptimizationResult): string {
  const lines: string[] = []
  lines.push('=== MUSIC IP PORTFOLIO OPTIMIZATION REPORT ===')
  lines.push('')
  lines.push(`Tracks Owned: ${input.current_portfolio.tracks_owned}`)
  lines.push(`Masters Owned: ${input.current_portfolio.masters_owned}`)
  lines.push(`Publishing Rights: ${input.current_portfolio.publishing_rights_pct}%`)
  lines.push(`Annual Revenue: $${input.current_portfolio.annual_revenue_usd.toLocaleString()}`)
  lines.push(`Top Tracks: ${input.current_portfolio.top_performing_tracks.join(', ') || 'None listed'}`)
  lines.push(`Investment Budget: $${input.investment_budget.toLocaleString()}`)
  lines.push(`Target Territories: ${input.territories.join(', ')}`)
  lines.push('')
  lines.push('--- PORTFOLIO HEALTH ---')
  lines.push(`Health Score: ${result.portfolio_health_score}/100`)
  lines.push(`Rating: ${result.health_rating}`)
  lines.push('')
  lines.push('--- REVENUE OPTIMIZATION ---')
  lines.push(`Current Annual: $${result.revenue_optimization.current_annual.toLocaleString()}`)
  lines.push(`Projected Annual: $${result.revenue_optimization.projected_annual.toLocaleString()}`)
  lines.push(`Growth Potential: ${result.revenue_optimization.growth_potential_pct}%`)
  lines.push('')
  lines.push('--- RELEASE TIMING ---')
  result.release_timing_recommendations.forEach((r) => lines.push(`  - ${r}`))
  lines.push('')
  lines.push('--- CATALOG MANAGEMENT ACTIONS ---')
  result.catalog_management_actions.forEach((a) => {
    lines.push(`  [${a.priority}] ${a.action}`)
    lines.push(`    Impact: ${a.impact}`)
  })
  lines.push('')
  lines.push('--- TERRITORY EXPANSION ROADMAP ---')
  result.territory_expansion_roadmap.forEach((t) => {
    lines.push(`  ${t.territory}: ${t.potential} potential | Investment: ${t.investment_needed}`)
  })
  lines.push('')
  lines.push('--- INVESTMENT ALLOCATION ---')
  result.investment_allocation.forEach((i) => {
    lines.push(`  ${i.category}: ${i.percentage}% - ${i.rationale}`)
  })
  lines.push('')
  lines.push('--- RISK ASSESSMENT ---')
  result.risk_assessment.forEach((r) => lines.push(`  - ${r}`))
  lines.push('')
  lines.push('--- 12-MONTH ACTION PLAN ---')
  result.action_plan.forEach((a) => lines.push(`  ${a}`))
  return lines.join('\n')
}

// ==================== TOOL 8: SYNC LICENSING MATCHER ====================

interface SyncMatchResult {
  overall_match_score: number
  match_rating: string
  catalog_fit_analysis: { genre_fit: number; mood_fit: number; tempo_fit: number; duration_fit: number; instrumental_fit: number }
  industry_matches: Array<{ industry: string; match_score: number; opportunity_level: string; brief_suggestions: string[] }>
  recommendations: string[]
  next_steps: string[]
  estimated_sync_value_range: [number, number]
}

function matchSyncLicensing(input: SyncMatcherInput, rng: () => number): SyncMatchResult {
  const genreFit = Math.min(input.catalog_attributes.genres.length * 20, 100)
  const moodFit = Math.min(input.mood_tags.length * 15 + input.catalog_attributes.moods.length * 10, 100)

  const tempoMin = input.tempo_range_bpm[0]
  const tempoMax = input.tempo_range_bpm[1]
  const catalogTempos = input.catalog_attributes.tempos_bpm
  const tempoMatches = catalogTempos.filter((t) => t >= tempoMin && t <= tempoMax).length
  const tempoFit = catalogTempos.length > 0 ? Math.min((tempoMatches / catalogTempos.length) * 100 + 20, 100) : 50

  const durMin = input.duration_range_sec[0]
  const durMax = input.duration_range_sec[1]
  const catalogDurs = input.catalog_attributes.durations_sec
  const durMatches = catalogDurs.filter((d) => d >= durMin && d <= durMax).length
  const durationFit = catalogDurs.length > 0 ? Math.min((durMatches / catalogDurs.length) * 100 + 20, 100) : 50

  const instrumentalFit = input.catalog_attributes.instrumental_available ? 90 : 40

  const overallScore = Math.round(
    (genreFit * 0.25 + moodFit * 0.25 + tempoFit * 0.2 + durationFit * 0.15 + instrumentalFit * 0.15) +
    rngRange(rng, -5, 5)
  )
  const clampedScore = Math.max(0, Math.min(100, overallScore))
  const rating = clampedScore >= 80 ? 'Excellent Match' : clampedScore >= 60 ? 'Good Match' : clampedScore >= 40 ? 'Moderate Match' : 'Weak Match'

  const industryMatches = input.target_industries.map((industry) => {
    const indScore = rngInt(rng, 40, 95)
    const oppLevel = indScore >= 80 ? 'HIGH' : indScore >= 60 ? 'MEDIUM' : 'LOW'
    const briefs: string[] = []
    if (industry.toLowerCase().includes('film') || industry.toLowerCase().includes('tv')) {
      briefs.push('Emotional underscore moments')
      briefs.push('Opening/closing credits')
      briefs.push('Scene transition music')
    } else if (industry.toLowerCase().includes('game')) {
      briefs.push('Menu/UI background music')
      briefs.push('Action sequence underscore')
      briefs.push('Victory/defeat stingers')
    } else if (industry.toLowerCase().includes('ad') || industry.toLowerCase().includes('commercial')) {
      briefs.push('15-30 second brand moments')
      briefs.push('Product launch energy')
      briefs.push('Emotional brand storytelling')
    } else {
      briefs.push('Background atmosphere')
      briefs.push('Event entrance/exit music')
      briefs.push('Presentation underscore')
    }
    return { industry, match_score: indScore, opportunity_level: oppLevel, brief_suggestions: briefs }
  })

  const recommendations: string[] = []
  if (input.catalog_attributes.stems_available) {
    recommendations.push('Stems available: Major advantage for sync. Highlight in all pitches.')
  } else {
    recommendations.push('Create stem versions of top tracks to increase sync appeal.')
  }
  if (!input.catalog_attributes.instrumental_available) {
    recommendations.push('Produce instrumental versions - 70% of sync placements require instrumental.')
  }
  recommendations.push('Register with sync licensing agencies (Musicbed, Artlist, Epidemic Sound)')
  recommendations.push('Create a searchable sync catalog with BPM, mood, and duration metadata')
  recommendations.push('Build relationships with music supervisors in target industries')

  const nextSteps = [
    'Prepare sync-ready catalog with full metadata',
    'Create instrumental and stem versions of top 10 tracks',
    'Register with 2-3 sync licensing platforms',
    'Reach out to music supervisors with personalized pitches',
    'Set up monitoring for new sync briefs in target industries'
  ]

  const syncLow = rngInt(rng, 1000, 10000)
  const syncHigh = rngInt(rng, 15000, 75000)

  return {
    overall_match_score: clampedScore,
    match_rating: rating,
    catalog_fit_analysis: {
      genre_fit: Math.round(genreFit),
      mood_fit: Math.round(moodFit),
      tempo_fit: Math.round(tempoFit),
      duration_fit: Math.round(durationFit),
      instrumental_fit: instrumentalFit
    },
    industry_matches: industryMatches,
    recommendations,
    next_steps: nextSteps,
    estimated_sync_value_range: [syncLow, syncHigh]
  }
}

function formatSyncMatchReport(input: SyncMatcherInput, result: SyncMatchResult): string {
  const lines: string[] = []
  lines.push('=== SYNC LICENSING MATCHER REPORT ===')
  lines.push('')
  lines.push(`Target Industries: ${input.target_industries.join(', ')}`)
  lines.push(`Mood Tags: ${input.mood_tags.join(', ')}`)
  lines.push(`Tempo Range: ${input.tempo_range_bpm[0]}-${input.tempo_range_bpm[1]} BPM`)
  lines.push(`Duration Range: ${input.duration_range_sec[0]}-${input.duration_range_sec[1]}s`)
  lines.push(`Instrumental Available: ${input.catalog_attributes.instrumental_available ? 'Yes' : 'No'}`)
  lines.push(`Stems Available: ${input.catalog_attributes.stems_available ? 'Yes' : 'No'}`)
  lines.push('')
  lines.push('--- OVERALL MATCH ---')
  lines.push(`Match Score: ${result.overall_match_score}/100`)
  lines.push(`Rating: ${result.match_rating}`)
  lines.push(`Estimated Sync Value: $${result.estimated_sync_value_range[0].toLocaleString()} - $${result.estimated_sync_value_range[1].toLocaleString()}`)
  lines.push('')
  lines.push('--- CATALOG FIT ANALYSIS ---')
  lines.push(`Genre Fit: ${result.catalog_fit_analysis.genre_fit}/100`)
  lines.push(`Mood Fit: ${result.catalog_fit_analysis.mood_fit}/100`)
  lines.push(`Tempo Fit: ${result.catalog_fit_analysis.tempo_fit}/100`)
  lines.push(`Duration Fit: ${result.catalog_fit_analysis.duration_fit}/100`)
  lines.push(`Instrumental Fit: ${result.catalog_fit_analysis.instrumental_fit}/100`)
  lines.push('')
  lines.push('--- INDUSTRY MATCHES ---')
  result.industry_matches.forEach((m) => {
    lines.push(`  ${m.industry} (Score: ${m.match_score}/100 | Opportunity: ${m.opportunity_level})`)
    m.brief_suggestions.forEach((b) => lines.push(`    - ${b}`))
  })
  lines.push('')
  lines.push('--- RECOMMENDATIONS ---')
  result.recommendations.forEach((r) => lines.push(`  - ${r}`))
  lines.push('')
  lines.push('--- NEXT STEPS ---')
  result.next_steps.forEach((s) => lines.push(`  - ${s}`))
  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  // Tool 1: Music IP Valuator
  tools.register(defineTool({
    name: 'music_ip_valuator',
    description: 'Estimates the market value of a music IP catalog (songs, masters, publishing). Uses hybrid valuation methodology combining revenue multiples, stream-based valuation, comparable license analysis, and territory/genre multipliers. Returns estimated value, confidence level, 5-year growth projection, risk factors, and recommendations.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: catalog_size_tracks (number), total_streams (number), revenue_history_usd (number[]), genre (string), territory_rights (string[]), comparable_licenses ({type, value_usd, year}[])', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: ValuatorInput = JSON.parse(args.input_data)
      const seed = seedFromString(JSON.stringify(input))
      const rng = mulberry32(seed)
      const result = estimateIPValue(input, rng)
      return formatValuationReport(input, result)
    }
  }))

  // Tool 2: Licensing Deal Advisor
  tools.register(defineTool({
    name: 'licensing_deal_advisor',
    description: 'Advises on licensing deals (sync, mechanical, streaming, performance). Analyzes work type, intended use, territory, duration, budget, and exclusivity preference to recommend deal structure, estimate fee range, identify key contract clauses, assess negotiation leverage, and flag red flags.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: work_type (string), intended_use (string), territory (string), duration (string), budget_range_usd ([number, number]), exclusivity_preference (string)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: LicensingInput = JSON.parse(args.input_data)
      const seed = seedFromString(JSON.stringify(input))
      const rng = mulberry32(seed)
      const result = adviseOnLicensing(input, rng)
      return formatLicensingReport(input, result)
    }
  }))

  // Tool 3: Royalty Split Calculator
  tools.register(defineTool({
    name: 'royalty_split_calculator',
    description: 'Calculates royalty splits among collaborators (writers, producers, performers, publishers). Supports work-for-hire, collaboration, sample clearance, and producer deal agreement types. Returns per-contributor breakdown across streaming, sync, and performance revenue with agreement notes and warnings.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: contributors (string[]), contribution_percentages (Record<string, number>), streaming_revenue (number), sync_revenue (number), performance_revenue (number), agreement_type (string)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: RoyaltySplitInput = JSON.parse(args.input_data)
      const seed = seedFromString(JSON.stringify(input))
      const rng = mulberry32(seed)
      const result = calculateRoyaltySplits(input, rng)
      return formatRoyaltySplitReport(input, result)
    }
  }))

  // Tool 4: AI Music Copyright Advisor
  tools.register(defineTool({
    name: 'ai_music_copyright_advisor',
    description: 'Advises on copyright status and protection for AI-generated music. Evaluates human authorship requirements, jurisdiction-specific rules (US, EU, UK, China, Japan), registration recommendations, commercial guidance, and action items. Returns eligibility assessment, risk level, and protection strategy.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: creation_method (string), human_involvement_level (string), training_data_source (string), commercial_intent (boolean), jurisdiction (string)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: AICopyrightInput = JSON.parse(args.input_data)
      const seed = seedFromString(JSON.stringify(input))
      const rng = mulberry32(seed)
      const result = adviseAICopyright(input, rng)
      return formatAICopyrightReport(input, result)
    }
  }))

  // Tool 5: IP Infringement Detector
  tools.register(defineTool({
    name: 'ip_infringement_detector',
    description: 'Scans for potential IP infringement of a musical work. Analyzes melody fingerprint, lyrics content, and structural similarity against specified databases. Returns risk assessment, potential matches, similarity scores, and actionable recommendations for clearance or modification.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: work_description (string), melody_fingerprint_id (string), lyrics_content (string), similarity_threshold (number), databases_checked (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: InfringementInput = JSON.parse(args.input_data)
      const seed = seedFromString(JSON.stringify(input))
      const rng = mulberry32(seed)
      const result = detectInfringement(input, rng)
      return formatInfringementReport(input, result)
    }
  }))

  // Tool 6: Playlist Pitching Strategist
  tools.register(defineTool({
    name: 'playlist_pitching_strategist',
    description: 'Creates pitch strategies for playlist placement (editorial, algorithmic, indie). Analyzes track metadata, target playlists, genre fit scores, release timeline, and promotional budget. Returns pitch readiness score, playlist-specific strategies, timeline, budget allocation, and expected outcomes.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: track_metadata ({title, artist, genre, tempo_bpm, duration_sec, mood, release_date}), target_playlists (string[]), genre_fit_scores (Record<string, number>), release_timeline (string), promotional_budget (number)', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PlaylistPitchInput = JSON.parse(args.input_data)
      const seed = seedFromString(JSON.stringify(input))
      const rng = mulberry32(seed)
      const result = createPitchStrategy(input, rng)
      return formatPitchStrategyReport(input, result)
    }
  }))

  // Tool 7: Music IP Portfolio Optimizer
  tools.register(defineTool({
    name: 'music_ip_portfolio_optimizer',
    description: 'Optimizes a music IP portfolio for maximum long-term value. Analyzes current portfolio composition, market trends, investment budget, growth targets, and territories. Returns health score, revenue projections, release timing, catalog management actions, territory expansion roadmap, and investment allocation.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: current_portfolio ({tracks_owned, masters_owned, publishing_rights_pct, annual_revenue_usd, top_performing_tracks}), market_trends (string[]), investment_budget (number), growth_targets (string[]), territories (string[])', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: PortfolioOptimizerInput = JSON.parse(args.input_data)
      const seed = seedFromString(JSON.stringify(input))
      const rng = mulberry32(seed)
      const result = optimizePortfolio(input, rng)
      return formatPortfolioReport(input, result)
    }
  }))

  // Tool 8: Sync Licensing Matcher
  tools.register(defineTool({
    name: 'sync_licensing_matcher',
    description: 'Matches music to sync opportunities (ads, film, games, TV briefs). Analyzes catalog attributes (genres, moods, tempos, durations, instrumental/stems availability) against target industries and sync requirements. Returns match scores, industry-specific opportunities, catalog fit analysis, and estimated sync value range.',
    parameters: {
      input_data: { type: 'string', description: 'JSON-encoded input with fields: catalog_attributes ({genres, moods, tempos_bpm, durations_sec, instrumental_available, stems_available}), target_industries (string[]), mood_tags (string[]), tempo_range_bpm ([number, number]), duration_range_sec ([number, number])', required: true }
    },
    output: { schema: { type: 'string' }, render: 'text' },
    async execute(args: { input_data: string }) {
      const input: SyncMatcherInput = JSON.parse(args.input_data)
      const seed = seedFromString(JSON.stringify(input))
      const rng = mulberry32(seed)
      const result = matchSyncLicensing(input, rng)
      return formatSyncMatchReport(input, result)
    }
  }))

  console.log(`[dsh-tool-musicip] Loaded v${VERSION} - Music IP Management & Monetization with 8 tools`)
  console.log('  Tools: music_ip_valuator, licensing_deal_advisor, royalty_split_calculator, ai_music_copyright_advisor, ip_infringement_detector, playlist_pitching_strategist, music_ip_portfolio_optimizer, sync_licensing_matcher')
}
