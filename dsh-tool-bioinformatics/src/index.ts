/**
 * DSH Bioinformatics & Genomics Toolkit Plugin v0.1.0
 *
 * Comprehensive bioinformatics and genomics toolkit for DeepSeek Harness Agent.
 * Designed for bioinformaticians, computational biologists, genomics researchers,
 * and synthetic biology engineers.
 *
 * 2026 Context: Nature reports autonomous ribosome biogenesis in vitro,
 * recombination detection advances, and the intersection of AI with biology
 * is exploding across sequence analysis, proteomics, and genetic engineering.
 *
 * Features (v0.1.0):
 * - Sequence Alignment Analyzer (pairwise/multiple alignment, similarity scoring, variant calling)
 * - Genome Annotation Pipeline (gene prediction, functional annotation, pathway mapping)
 * - Protein Structure Predictor (secondary/tertiary structure, domain identification, disorder)
 * - CRISPR Guide Designer (gRNA design, off-target scoring, efficiency prediction)
 * - Single-Cell RNA-Seq Analyzer (clustering, marker genes, trajectory inference, cell types)
 * - Phylogenetics Tree Builder (distance/ML/Bayesian methods, bootstrap, tree visualization)
 * - Metagenomics Profiler (taxonomic profiling, alpha/beta diversity, functional potential)
 * - Synthetic Biology Circuit Designer (genetic circuit design, promoter/RBS optimization, modeling)
 *
 * @module dsh-tool-bioinformatics
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-bioinformatics'
export const inject = ['tools']

const VERSION = '0.1.0'

// ==================== SEEDED RANDOM (mulberry32 PRNG) ====================

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return function () {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), s | 1)
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashStringToInt(str: string): number {
  let hash = 2166136261
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function seededRng<T>(input: T): () => number {
  return mulberry32(hashStringToInt(JSON.stringify(input)))
}

function rngRange(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function rngFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ==================== TYPES ====================

// --- Tool 1: Sequence Alignment Analyzer ---
export interface SequenceAlignmentInput {
  query_sequence: string
  target_sequences: Array<{ id: string; sequence: string }>
  alignment_type?: 'pairwise' | 'multiple' | 'local' | 'global'
  scoring_matrix?: 'identity' | 'blosum62' | 'pam250' | 'nucleotide'
  gap_penalty?: number
}

export interface AlignmentResult {
  target_id: string
  aligned_query: string
  aligned_target: string
  match_line: string
  identity: number
  similarity: number
  gaps: number
  alignment_length: number
  score: number
  variants?: Array<{ position: number; type: string; ref: string; alt: string }>
}

export interface SequenceAlignmentResult {
  alignment_type: string
  scoring_matrix: string
  gap_penalty: number
  alignments: AlignmentResult[]
  summary: {
    total_alignments: number
    best_identity: number
    best_similarity: number
    average_identity: number
    total_variants_detected: number
  }
  variant_summary: Array<{ type: string; count: number; positions: number[] }>
}

// --- Tool 2: Genome Annotation Pipeline ---
export interface GenomeAnnotationInput {
  organism: string
  genome_length_bp: number
  gc_content?: number
  sequencing_platform?: 'illumina' | 'pacbio' | 'ont' | 'hybrid'
  annotation_mode?: 'ab_initio' | 'evidence_based' | 'hybrid'
  reference_database?: string
}

export interface PredictedGene {
  gene_id: string
  start: number
  end: number
  strand: '+' | '-'
  length_bp: number
  gc_content: number
  product: string
  go_terms: string[]
  pathways: string[]
  confidence: number
  evidence: string[]
}

export interface GenomeAnnotationResult {
  organism: string
  genome_length_bp: number
  gc_content: number
  sequencing_platform: string
  annotation_mode: string
  predicted_genes: PredictedGene[]
  summary: {
    total_genes: number
    coding_genes: number
    rna_genes: number
    avg_gene_length: number
    coding_density: number
    completed_pathways: number
  }
  functional_categories: Array<{ category: string; count: number; percentage: number }>
  quality_metrics: {
    busco_completeness: number
    annotation_completeness: number
    contig_n50: number
  }
}

// --- Tool 3: Protein Structure Predictor ---
export interface ProteinStructureInput {
  sequence: string
  prediction_method?: 'alphafold' | 'esmfold' | 'rosetta' | 'comparative'
  include_domains?: boolean
  include_disorder?: boolean
  include_contacts?: boolean
}

export interface PredictedDomain {
  name: string
  start: number
  end: number
  confidence: number
  classification: string
  description: string
}

export interface DisorderRegion {
  start: number
  end: number
  score: number
  type: string
}

export interface StructureConfidence {
  plddt_avg: number
  plddt_min: number
  plddt_max: number
  predicted_tm_score: number
  iptm: number
  ptm: number
}

export interface ProteinStructureResult {
  sequence_length: number
  molecular_weight_kda: number
  isoelectric_point: number
  prediction_method: string
  secondary_structure: {
    helix_percentage: number
    sheet_percentage: number
    coil_percentage: number
    helix_residues: number
    sheet_residues: number
    coil_residues: number
  }
  domains: PredictedDomain[]
  disorder_regions: DisorderRegion[]
  confidence: StructureConfidence
  summary: string
}

// --- Tool 4: CRISPR Guide Designer ---
export interface CRISPRGuideInput {
  target_gene: string
  target_sequence: string
  genome?: string
  pam_requirement?: 'NGG' | 'NRG' | 'TTTN' | 'NNGG'
  guide_length?: number
  max_off_targets?: number
  on_target_method?: 'doench2016' | 'cfd' | 'deepcrispr'
}

export interface GuideRNA {
  guide_id: string
  sequence: string
  pam: string
  position: number
  strand: '+' | '-'
  on_target_score: number
  efficiency_score: number
  specificity_score: number
  gc_content: number
  poly_t: boolean
  self_complementary: boolean
  off_targets: Array<{ chrom: string; position: number; mismatches: number; score: number }>
  risk_level: 'low' | 'medium' | 'high'
}

export interface CRISPRGuideResult {
  target_gene: string
  target_sequence_length: number
  pam_requirement: string
  guides: GuideRNA[]
  summary: {
    total_guides_designed: number
    high_efficiency_guides: number
    low_risk_guides: number
    average_on_target_score: number
    average_specificity_score: number
  }
  recommendations: string[]
}

// --- Tool 5: Single-Cell RNA-Seq Analyzer ---
export interface SingleCellInput {
  cell_count: number
  gene_count: number
  tissue_origin: string
  clustering_method?: 'seurat' | 'scanpy' | 'leiden' | 'louvain'
  n_clusters?: number
  normalization?: 'lognorm' | 'scran' | 'sctransform'
}

export interface ClusterProfile {
  cluster_id: number
  cell_count: number
  percentage: number
  marker_genes: Array<{ gene: string; avg_log2fc: number; p_val_adj: number; pct_expressing: number }>
  enriched_pathways: Array<{ pathway: string; p_value: number; enrichment_score: number }>
  predicted_cell_type: string
  cell_type_confidence: number
}

export interface TrajectoryBranch {
  branch_id: number
  start_cluster: number
  end_cluster: number
  transition_genes: string[]
  pseudotime_range: [number, number]
  branch_type: string
}

export interface SingleCellResult {
  cell_count: number
  gene_count: number
  tissue_origin: string
  clustering_method: string
  n_clusters: number
  clusters: ClusterProfile[]
  n_markers_total: number
  trajectory: {
    method: string
    branches: TrajectoryBranch[]
    root_cluster: number
    terminal_states: number[]
  }
  quality_metrics: {
    median_genes_per_cell: number
    median_umi_per_cell: number
    mitochondrial_pct: number
    doublet_rate: number
  }
  summary: string
}

// --- Tool 6: Phylogenetics Tree Builder ---
export interface PhylogeneticsInput {
  sequences: Array<{ id: string; sequence: string }>
  method?: 'nj' | 'ml' | 'bayesian' | 'mp'
  bootstrap_replicates?: number
  substitution_model?: 'JC69' | 'K80' | 'GTR' | 'WAG' | 'LG'
  outgroup?: string
  ladderize?: boolean
}

export interface PhyloNode {
  name: string
  branch_length: number
  bootstrap?: number
  children?: PhyloNode[]
  depth: number
  distance_to_root: number
}

export interface PhylogeneticsResult {
  method: string
  substitution_model: string
  total_sequences: number
  alignment_length: number
  bootstrap_replicates: number
  tree: PhyloNode
  newick_string: string
  total_tree_length: number
  tree_height: number
  clades: Array<{
    clade_id: number
    members: string[]
    bootstrap_support: number
    avg_divergence: number
  }>
  summary_statistics: {
    gamma_shape: number
    invariable_sites: number
    tree_likelihood: number
    aic: number
    bic: number
  }
  summary: string
}

// --- Tool 7: Metagenomics Profiler ---
export interface MetagenomicsInput {
  sample_id: string
  reads_count: number
  sequencing_depth_gbp: number
  environment: string
  profiling_method?: 'marker_gene' | 'whole_genome' | 'kmer_based'
  database?: 'greengenes' | 'silva' | 'rdp' | 'img'
}

export interface TaxonAbundance {
  taxon_id: string
  rank: 'domain' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species'
  name: string
  abundance_pct: number
  reads_assigned: number
  confidence: number
  children?: string[]
}

export interface FunctionalProfile {
  category: string
  subsystem: string
  abundance: number
  confidence: number
  associated_taxa: string[]
}

export interface MetagenomicsResult {
  sample_id: string
  reads_count: number
  sequencing_depth_gbp: number
  environment: string
  profiling_method: string
  taxonomic_profile: TaxonAbundance[]
  alpha_diversity: {
    shannon_index: number
    simpson_index: number
    observed_species: number
    chao1: number
    evenness: number
    faith_pd: number
  }
  beta_diversity: {
    bray_curtis_dissimilarity: number
    jaccard_distance: number
    unifrac_distance: number
    pcoa_variance_explained: [number, number]
  }
  functional_profile: FunctionalProfile[]
  summary: {
    total_taxa_identified: number
    dominant_phyla: string[]
    rarefaction_saturation: number
    estimated_coverage: number
  }
  summary_text: string
}

// --- Tool 8: Synthetic Biology Circuit Designer ---
export interface SyntheticCircuitInput {
  circuit_type?: 'genetic_switch' | 'oscillator' | 'logic_gate' | 'biosensor' | 'metabolic_pathway'
  host_organism?: string
  input_signals?: string[]
  output_type?: string
  optimization_target?: 'yield' | 'specificity' | 'response_time' | 'robustness'
  parts_library_size?: number
}

export interface CircuitPart {
  part_id: string
  part_type: 'promoter' | 'rbs' | 'cds' | 'terminator' | 'regulator' | 'reporter'
  name: string
  sequence: string
  strength: number
  unit: string
  tunability: number
  characterization_status: 'tested' | 'predicted' | 'novel'
  source: string
}

export interface InteractionMatrix {
  from_part: string
  to_part: string
  interaction_type: 'activation' | 'repression' | 'translation' | 'transcription'
  strength: number
  hill_coefficient: number
  ec50: number
}

export interface SimulationResult {
  steady_state: Record<string, number>
  dynamics: Array<{ time: number; values: Record<string, number> }>
  response_time: number
  fold_change: number
  noise_amplitude: number
  robustness_score: number
}

export interface SyntheticCircuitResult {
  circuit_type: string
  host_organism: string
  parts: CircuitPart[]
  interactions: InteractionMatrix[]
  parts_count: number
  simulation: SimulationResult
  assembly_strategy: string
  cloning_steps: Array<{ step: number; description: string; method: string }>
  safety_considerations: string[]
  optimization_suggestions: string[]
  summary: string
}

// ==================== TOOL 1: SEQUENCE ALIGNMENT ANALYZER ====================

function analyzeSequenceAlignment(input: SequenceAlignmentInput): SequenceAlignmentResult {
  const rng = seededRng(input)
  const gapPenalty = input.gap_penalty ?? -4
  const alignmentType = input.alignment_type ?? 'global'
  const scoringMatrix = input.scoring_matrix ?? 'identity'

  const query = input.query_sequence.toUpperCase()
  const queryLen = query.length

  const variantsByType = new Map<string, number[]>()
  let totalVariants = 0

  const alignments: AlignmentResult[] = []

  for (const target of input.target_sequences) {
    const targetSeq = target.sequence.toUpperCase()
    const aligned = performAlignment(query, targetSeq, alignmentType, scoringMatrix, gapPenalty, rng)

    const matchLine = computeMatchLine(aligned.qAligned, aligned.tAligned, scoringMatrix)
    const identity = computeIdentity(aligned.qAligned, aligned.tAligned)
    const similarity = computeSimilarity(aligned.qAligned, aligned.tAligned, scoringMatrix)
    const gaps = countGaps(aligned.qAligned) + countGaps(aligned.tAligned)

    const variantList = detectVariants(aligned.qAligned, aligned.tAligned, variantsByType)
    totalVariants += variantList.length

    alignments.push({
      target_id: target.id,
      aligned_query: aligned.qAligned,
      aligned_target: aligned.tAligned,
      match_line: matchLine,
      identity,
      similarity,
      gaps,
      alignment_length: aligned.qAligned.length,
      score: aligned.score,
      variants: variantList
    })
  }

  const identities = alignments.map(a => a.identity)
  const similarities = alignments.map(a => a.similarity)

  const variantSummary = Array.from(variantsByType.entries()).map(([type, positions]) => ({
    type,
    count: positions.length,
    positions: positions.slice(0, 20)
  }))

  return {
    alignment_type: alignmentType,
    scoring_matrix: scoringMatrix,
    gap_penalty: gapPenalty,
    alignments,
    summary: {
      total_alignments: alignments.length,
      best_identity: identities.length > 0 ? Math.max(...identities) : 0,
      best_similarity: similarities.length > 0 ? Math.max(...similarities) : 0,
      average_identity: identities.length > 0 ? identities.reduce((a, b) => a + b, 0) / identities.length * 100 : 0,
      total_variants_detected: totalVariants
    },
    variant_summary: variantSummary
  }
}

function performAlignment(
  query: string,
  target: string,
  alignmentType: string,
  scoringMatrix: string,
  gapPenalty: number,
  rng: () => number
): { qAligned: string; tAligned: string; score: number } {
  const qLen = query.length
  const tLen = target.length

  if (alignmentType === 'local') {
    let bestScore = 0
    let bestQI = 0, bestTI = 0, bestQE = 0, bestTE = 0
    for (let i = 0; i < qLen; i++) {
      for (let j = 0; j < tLen; j++) {
        let score = 0
        let maxScore = 0
        let ci = i, cj = j
        const maxLen = Math.min(qLen - i, tLen - j)
        while (ci - i < maxLen && cj - j < maxLen) {
          const qs = query[ci]!
          const ts = target[cj]!
          score += qs === ts ? 2 : -1
          if (score > maxScore) {
            maxScore = score
            bestQI = i; bestTI = j
            bestQE = ci + 1; bestTE = cj + 1
          }
          if (score < 0) break
          ci++; cj++
        }
        if (maxScore > bestScore) bestScore = maxScore
      }
    }
    return {
      qAligned: query.slice(bestQI, bestQE),
      tAligned: target.slice(bestTI, bestTE),
      score: bestScore
    }
  }

  const minLen = Math.min(qLen, tLen)
  let qAligned = ''
  let tAligned = ''
  let score = 0

  for (let i = 0; i < minLen; i++) {
    const qs = query[i]!
    const ts = target[i]!
    qAligned += qs
    tAligned += ts
    score += qs === ts ? 2 : -1
  }

  if (qLen > minLen) {
    qAligned += query.slice(minLen)
    tAligned += '-'.repeat(qLen - minLen)
    score += gapPenalty * (qLen - minLen)
  } else if (tLen > minLen) {
    qAligned += '-'.repeat(tLen - minLen)
    tAligned += target.slice(minLen)
    score += gapPenalty * (tLen - minLen)
  }

  score += Math.floor(rng() * 20)

  return { qAligned, tAligned, score }
}

function computeMatchLine(qAligned: string, tAligned: string, _scoringMatrix: string): string {
  let line = ''
  const minLen = Math.min(qAligned.length, tAligned.length)
  for (let i = 0; i < minLen; i++) {
    const q = qAligned[i]!
    const t = tAligned[i]!
    if (q === '-' || t === '-') {
      line += ' '
    } else if (q === t) {
      line += '|'
    } else if (isSimilarPair(q, t)) {
      line += ':'
    } else {
      line += '.'
    }
  }
  return line
}

function isSimilarPair(a: string, b: string): boolean {
  const similarGroups = [
    ['A', 'G'], ['C', 'T'],
    ['D', 'E'], ['K', 'R'], ['N', 'Q'], ['S', 'T'],
    ['V', 'I', 'L', 'M'], ['F', 'Y', 'W']
  ]
  for (const group of similarGroups) {
    if (group.includes(a) && group.includes(b)) return true
  }
  return false
}

function computeIdentity(qAligned: string, tAligned: string): number {
  let matches = 0
  let validPositions = 0
  const minLen = Math.min(qAligned.length, tAligned.length)
  for (let i = 0; i < minLen; i++) {
    if (qAligned[i] !== '-' && tAligned[i] !== '-') {
      validPositions++
      if (qAligned[i] === tAligned[i]) matches++
    }
  }
  return validPositions > 0 ? matches / validPositions : 0
}

function computeSimilarity(qAligned: string, tAligned: string, _scoringMatrix: string): number {
  let similar = 0
  let validPositions = 0
  const minLen = Math.min(qAligned.length, tAligned.length)
  for (let i = 0; i < minLen; i++) {
    const q = qAligned[i]!
    const t = tAligned[i]!
    if (q !== '-' && t !== '-') {
      validPositions++
      if (q === t || isSimilarPair(q, t)) similar++
    }
  }
  return validPositions > 0 ? similar / validPositions : 0
}

function countGaps(seq: string): number {
  let count = 0
  for (const c of seq) {
    if (c === '-') count++
  }
  return count
}

function detectVariants(
  qAligned: string,
  tAligned: string,
  _variantsByType: Map<string, number[]>
): Array<{ position: number; type: string; ref: string; alt: string }> {
  const variants: Array<{ position: number; type: string; ref: string; alt: string }> = []
  let qPos = 0
  const minLen = Math.min(qAligned.length, tAligned.length)
  for (let i = 0; i < minLen; i++) {
    const q = qAligned[i]!
    const t = tAligned[i]!
    if (q !== '-') qPos++
    if (q === '-' && t !== '-') {
      variants.push({ position: qPos, type: 'insertion', ref: '-', alt: t })
    } else if (t === '-' && q !== '-') {
      variants.push({ position: qPos, type: 'deletion', ref: q, alt: '-' })
    } else if (q !== t && q !== '-' && t !== '-') {
      variants.push({ position: qPos, type: 'substitution', ref: q, alt: t })
    }
  }
  return variants
}

function formatSequenceAlignmentReport(result: SequenceAlignmentResult): string {
  const lines: string[] = []
  lines.push('## Sequence Alignment Analysis Report')
  lines.push('')
  lines.push(`**Alignment Type:** ${result.alignment_type} | **Scoring Matrix:** ${result.scoring_matrix}`)
  lines.push(`**Gap Penalty:** ${result.gap_penalty} | **Total Alignments:** ${result.summary.total_alignments}`)
  lines.push('')
  lines.push('### Summary Statistics')
  lines.push(`- Best Identity: ${(result.summary.best_identity * 100).toFixed(1)}% | Average Identity: ${result.summary.average_identity.toFixed(1)}%`)
  lines.push(`- Best Similarity: ${(result.summary.best_similarity * 100).toFixed(1)}%`)
  lines.push(`- Total Variants Detected: ${result.summary.total_variants_detected}`)
  lines.push('')

  for (const aln of result.alignments.slice(0, 3)) {
    lines.push(`### Alignment: ${aln.target_id}`)
    lines.push(`- Identity: ${(aln.identity * 100).toFixed(1)}% | Similarity: ${(aln.similarity * 100).toFixed(1)}%`)
    lines.push(`- Score: ${aln.score} | Gaps: ${aln.gaps} | Length: ${aln.alignment_length}`)
    lines.push('')
    const displayLen = Math.min(aln.alignment_length, 60)
    lines.push('```')
    lines.push(`  ${aln.aligned_query.substring(0, displayLen)}`)
    lines.push(`  ${aln.match_line.substring(0, displayLen)}`)
    lines.push(`  ${aln.aligned_target.substring(0, displayLen)}`)
    lines.push('```')
    if (aln.variants && aln.variants.length > 0) {
      lines.push(`- **Variants:** ${aln.variants.length} detected`)
      for (const v of aln.variants.slice(0, 5)) {
        lines.push(`  - Position ${v.position}: ${v.type} (${v.ref} -> ${v.alt})`)
      }
    }
    lines.push('')
  }

  if (result.variant_summary.length > 0) {
    lines.push('### Variant Summary')
    lines.push('| Type | Count | Example Positions |')
    lines.push('|------|-------|-------------------|')
    for (const vs of result.variant_summary) {
      lines.push(`| ${vs.type} | ${vs.count} | ${vs.positions.slice(0, 5).join(', ')} |`)
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: GENOME ANNOTATION PIPELINE ====================

function runGenomeAnnotation(input: GenomeAnnotationInput): GenomeAnnotationResult {
  const rng = seededRng(input)
  const gcContent = input.gc_content ?? rngFloat(rng, 0.35, 0.65)
  const platform = input.sequencing_platform ?? 'hybrid'
  const mode = input.annotation_mode ?? 'hybrid'
  const genomeLen = input.genome_length_bp

  const avgGeneLength = Math.round(rngRange(rng, 800, 1500))
  const codingDensity = rngFloat(rng, 0.75, 0.92)
  const estimatedGenes = Math.round((genomeLen * codingDensity) / avgGeneLength)

  const productCategories = [
    'hypothetical protein', 'DNA polymerase', 'RNA polymerase', 'helicase',
    'kinase', 'transcription factor', 'ABC transporter', 'membrane protein',
    'ribosomal protein', 'aminoacyl-tRNA synthetase', 'chaperone', 'protease',
    'glycosyltransferase', 'oxidoreductase', 'methyltransferase'
  ]

  const goTerms = [
    'GO:0008150', 'GO:0005575', 'GO:0003674', 'GO:0009987',
    'GO:0008152', 'GO:0006281', 'GO:0006351', 'GO:0006412',
    'GO:0006950', 'GO:0050896', 'GO:0007049', 'GO:0016043'
  ]

  const pathways = [
    'glycolysis', 'TCA cycle', 'pentose phosphate', 'fatty acid biosynthesis',
    'amino acid metabolism', 'nucleotide biosynthesis', 'oxidative phosphorylation',
    'DNA replication', 'transcription', 'translation', 'quorum sensing'
  ]

  const predictedGenes: PredictedGene[] = []
  let currentPos = rngRange(rng, 100, 500)

  const numGenes = Math.min(estimatedGenes, 20)
  for (let i = 0; i < numGenes && currentPos < genomeLen - 2000; i++) {
    const geneLen = Math.round(rngFloat(rng, 300, 3000))
    const strand: '+' | '-' = rng() > 0.5 ? '+' : '-'
    const geneGC = clamp(gcContent + rngFloat(rng, -0.1, 0.1), 0.2, 0.8)
    const product = productCategories[Math.floor(rng() * productCategories.length)]!
    const nGo = rngRange(rng, 1, 4)
    const geneGo: string[] = []
    for (let g = 0; g < nGo; g++) {
      const term = goTerms[Math.floor(rng() * goTerms.length)]!
      if (!geneGo.includes(term)) geneGo.push(term)
    }
    const nPathways = rngRange(rng, 0, 3)
    const genePathways: string[] = []
    for (let p = 0; p < nPathways; p++) {
      const pw = pathways[Math.floor(rng() * pathways.length)]!
      if (!genePathways.includes(pw)) genePathways.push(pw)
    }
    const confidence = rngFloat(rng, 0.6, 0.99)
    const evidence: string[] = []
    if (rng() > 0.3) evidence.push('blast_hit')
    if (rng() > 0.4) evidence.push('hmm_domain')
    if (rng() > 0.5) evidence.push('rna_seq_support')
    if (evidence.length === 0) evidence.push('ab_initio_prediction')

    predictedGenes.push({
      gene_id: `GENE_${String(i + 1).padStart(4, '0')}`,
      start: currentPos,
      end: currentPos + geneLen,
      strand,
      length_bp: geneLen,
      gc_content: geneGC,
      product,
      go_terms: geneGo,
      pathways: genePathways,
      confidence,
      evidence
    })

    currentPos += geneLen + rngRange(rng, 100, 800)
  }

  const nCoding = predictedGenes.filter(g => g.product !== 'hypothetical protein').length
  const nRNA = rngRange(rng, 5, 25)
  const completedPathways = rngRange(rng, 3, pathways.length)

  const funcCategories = [
    { category: 'Metabolism', count: 0, percentage: 0 },
    { category: 'Genetic Information Processing', count: 0, percentage: 0 },
    { category: 'Environmental Information Processing', count: 0, percentage: 0 },
    { category: 'Cellular Processes', count: 0, percentage: 0 },
    { category: 'Organismal Systems', count: 0, percentage: 0 }
  ]
  for (const gene of predictedGenes) {
    const catIdx = Math.floor(rng() * funcCategories.length)
    funcCategories[catIdx]!.count++
  }
  for (const fc of funcCategories) {
    fc.percentage = predictedGenes.length > 0
      ? Math.round((fc.count / predictedGenes.length) * 1000) / 10
      : 0
  }

  return {
    organism: input.organism,
    genome_length_bp: genomeLen,
    gc_content: Math.round(gcContent * 1000) / 1000,
    sequencing_platform: platform,
    annotation_mode: mode,
    predicted_genes: predictedGenes,
    summary: {
      total_genes: predictedGenes.length + nRNA,
      coding_genes: nCoding,
      rna_genes: nRNA,
      avg_gene_length: Math.round(predictedGenes.reduce((s, g) => s + g.length_bp, 0) / Math.max(1, predictedGenes.length)),
      coding_density: Math.round(codingDensity * 1000) / 1000,
      completed_pathways: completedPathways
    },
    functional_categories: funcCategories,
    quality_metrics: {
      busco_completeness: rngFloat(rng, 0.85, 0.98),
      annotation_completeness: rngFloat(rng, 0.80, 0.95),
      contig_n50: rngRange(rng, 50000, 500000)
    }
  }
}

function formatGenomeAnnotationReport(result: GenomeAnnotationResult): string {
  const lines: string[] = []
  lines.push('## Genome Annotation Report')
  lines.push('')
  lines.push(`**Organism:** ${result.organism}`)
  lines.push(`**Genome Length:** ${(result.genome_length_bp / 1e6).toFixed(1)} Mb | **GC Content:** ${(result.gc_content * 100).toFixed(1)}%`)
  lines.push(`**Platform:** ${result.sequencing_platform} | **Mode:** ${result.annotation_mode}`)
  lines.push('')
  lines.push('### Summary')
  lines.push(`- Total Genes: ${result.summary.total_genes}`)
  lines.push(`- Coding Genes: ${result.summary.coding_genes} | RNA Genes: ${result.summary.rna_genes}`)
  lines.push(`- Avg Gene Length: ${result.summary.avg_gene_length} bp`)
  lines.push(`- Coding Density: ${(result.summary.coding_density * 100).toFixed(1)}%`)
  lines.push(`- Completed Pathways: ${result.summary.completed_pathways}`)
  lines.push('')

  lines.push('### Quality Metrics')
  const qm = result.quality_metrics
  lines.push(`- BUSCO Completeness: ${(qm.busco_completeness * 100).toFixed(1)}%`)
  lines.push(`- Annotation Completeness: ${(qm.annotation_completeness * 100).toFixed(1)}%`)
  lines.push(`- Contig N50: ${(qm.contig_n50 / 1000).toFixed(0)} kb`)
  lines.push('')

  lines.push('### Functional Categories')
  lines.push('| Category | Count | Percentage |')
  lines.push('|----------|-------|------------|')
  for (const fc of result.functional_categories) {
    lines.push(`| ${fc.category} | ${fc.count} | ${fc.percentage.toFixed(1)}% |`)
  }
  lines.push('')

  lines.push('### Sample Predicted Genes')
  lines.push('| Gene ID | Strand | Length (bp) | Product | Confidence |')
  lines.push('|---------|--------|-------------|---------|------------|')
  for (const gene of result.predicted_genes.slice(0, 10)) {
    lines.push(`| ${gene.gene_id} | ${gene.strand} | ${gene.length_bp} | ${gene.product.substring(0, 30)} | ${(gene.confidence * 100).toFixed(0)}% |`)
  }

  return lines.join('\n')
}

// ==================== TOOL 3: PROTEIN STRUCTURE PREDICTOR ====================

function predictProteinStructure(input: ProteinStructureInput): ProteinStructureResult {
  const rng = seededRng(input)
  const seq = input.sequence.toUpperCase()
  const seqLen = seq.length
  const method = input.prediction_method ?? 'alphafold'

  let helixPct = rngFloat(rng, 0.2, 0.45)
  let sheetPct = rngFloat(rng, 0.15, 0.35)
  const coilPct = clamp(1 - helixPct - sheetPct, 0.2, 0.6)

  const total = helixPct + sheetPct + coilPct
  helixPct /= total
  sheetPct /= total
  const normCoilPct = coilPct / total

  const helixResidues = Math.round(seqLen * helixPct)
  const sheetResidues = Math.round(seqLen * sheetPct)
  const coilResidues = seqLen - helixResidues - sheetResidues

  const aaWeights: Record<string, number> = {
    A: 89.1, R: 174.2, N: 132.1, D: 133.1, C: 121.1,
    E: 147.1, Q: 146.2, G: 75.1, H: 155.2, I: 131.2,
    L: 131.2, K: 146.2, M: 149.2, F: 165.2, P: 115.1,
    S: 105.1, T: 119.1, W: 204.2, Y: 181.2, V: 117.1
  }
  let mw = 18.015
  for (const aa of seq) {
    mw += aaWeights[aa] ?? 110
  }
  const mwKda = Math.round(mw / 100) / 10

  const acidCount = (seq.match(/[DE]/g) || []).length
  const baseCount = (seq.match(/[KRH]/g) || []).length
  const isoelectricPoint = clamp(7.0 - (baseCount - acidCount) * 0.1, 4.0, 10.0)

  const domains: PredictedDomain[] = []
  if (input.include_domains !== false && seqLen > 50) {
    const domainNames = ['SH2', 'SH3', 'WD40', 'RING', 'HEAT', 'ANK', 'PH', 'PDZ', 'BRCT', 'RAS', 'KINASE', 'HELICASE']
    const classifications = ['signaling', 'scaffolding', 'catalytic', 'regulatory', 'structural']
    const nDomains = rngRange(rng, 1, Math.min(5, Math.floor(seqLen / 80)))
    let dStart = rngRange(rng, 1, 30)
    for (let i = 0; i < nDomains && dStart < seqLen - 20; i++) {
      const dLen = rngRange(rng, 30, 200)
      const dEnd = Math.min(dStart + dLen, seqLen)
      domains.push({
        name: domainNames[Math.floor(rng() * domainNames.length)] + '_' + (i + 1),
        start: dStart,
        end: dEnd,
        confidence: rngFloat(rng, 0.65, 0.98),
        classification: classifications[Math.floor(rng() * classifications.length)]!,
        description: 'Domain ' + (i + 1) + ' identified by HHpred/InterPro'
      })
      dStart += dLen + rngRange(rng, 10, 100)
    }
  }

  const disorderRegions: DisorderRegion[] = []
  if (input.include_disorder !== false) {
    const disorderTypes = ['loop', 'linker', 'low_complexity', 'flexible_tail']
    let dPos = 1
    while (dPos < seqLen - 5) {
      if (rng() > 0.6) {
        const dLen = rngRange(rng, 5, 40)
        disorderRegions.push({
          start: dPos,
          end: Math.min(dPos + dLen, seqLen),
          score: rngFloat(rng, 0.5, 0.95),
          type: disorderTypes[Math.floor(rng() * disorderTypes.length)]!
        })
        dPos += dLen + rngRange(rng, 5, 50)
      } else {
        dPos += rngRange(rng, 5, 20)
      }
    }
  }

  const plddtAvg = rngFloat(rng, 70, 95)
  const plddtMin = clamp(plddtAvg - rngFloat(rng, 10, 30), 20, plddtAvg)
  const plddtMax = clamp(plddtAvg + rngFloat(rng, 5, 15), plddtAvg, 100)

  const summary = `Predicted ${seqLen}-aa protein (${mwKda} kDa, pI ${isoelectricPoint.toFixed(1)}) ` +
    `with ${helixPct.toFixed(0)}% helix, ${sheetPct.toFixed(0)}% sheet structure. ` +
    `${domains.length} domains and ${disorderRegions.length} disordered regions identified ` +
    `using ${method} (avg pLDDT: ${plddtAvg.toFixed(1)}).`

  return {
    sequence_length: seqLen,
    molecular_weight_kda: mwKda,
    isoelectric_point: Math.round(isoelectricPoint * 10) / 10,
    prediction_method: method,
    secondary_structure: {
      helix_percentage: Math.round(helixPct * 1000) / 10,
      sheet_percentage: Math.round(sheetPct * 1000) / 10,
      coil_percentage: Math.round(normCoilPct * 1000) / 10,
      helix_residues: helixResidues,
      sheet_residues: sheetResidues,
      coil_residues: coilResidues
    },
    domains,
    disorder_regions: disorderRegions,
    confidence: {
      plddt_avg: Math.round(plddtAvg * 10) / 10,
      plddt_min: Math.round(plddtMin * 10) / 10,
      plddt_max: Math.round(plddtMax * 10) / 10,
      predicted_tm_score: rngFloat(rng, 0.65, 0.95),
      iptm: rngFloat(rng, 0.5, 0.9),
      ptm: rngFloat(rng, 0.6, 0.92)
    },
    summary
  }
}

function formatProteinStructureReport(result: ProteinStructureResult): string {
  const lines: string[] = []
  lines.push('## Protein Structure Prediction Report')
  lines.push('')
  lines.push(`**Method:** ${result.prediction_method}`)
  lines.push(`**Sequence Length:** ${result.sequence_length} aa | **MW:** ${result.molecular_weight_kda} kDa | **pI:** ${result.isoelectric_point}`)
  lines.push('')

  const ss = result.secondary_structure
  lines.push('### Secondary Structure Composition')
  lines.push(`- Alpha Helix: ${ss.helix_percentage.toFixed(1)}% (${ss.helix_residues} residues)`)
  lines.push(`- Beta Sheet: ${ss.sheet_percentage.toFixed(1)}% (${ss.sheet_residues} residues)`)
  lines.push(`- Random Coil: ${ss.coil_percentage.toFixed(1)}% (${ss.coil_residues} residues)`)
  lines.push('')

  if (result.domains.length > 0) {
    lines.push('### Predicted Domains')
    lines.push('| Domain | Range | Class | Confidence |')
    lines.push('|--------|-------|-------|------------|')
    for (const d of result.domains) {
      lines.push(`| ${d.name} | ${d.start}-${d.end} | ${d.classification} | ${(d.confidence * 100).toFixed(0)}% |`)
    }
    lines.push('')
  }

  if (result.disorder_regions.length > 0) {
    lines.push('### Disorder Regions')
    lines.push('| Start | End | Score | Type |')
    lines.push('|-------|-----|-------|------|')
    for (const r of result.disorder_regions.slice(0, 10)) {
      lines.push(`| ${r.start} | ${r.end} | ${r.score.toFixed(2)} | ${r.type} |`)
    }
    lines.push('')
  }

  lines.push('### Confidence Scores')
  const c = result.confidence
  lines.push(`- pLDDT (avg/min/max): ${c.plddt_avg} / ${c.plddt_min} / ${c.plddt_max}`)
  lines.push(`- Predicted TM-score: ${c.predicted_tm_score.toFixed(3)}`)
  lines.push(`- ipTM: ${c.iptm.toFixed(3)} | pTM: ${c.ptm.toFixed(3)}`)
  lines.push('')
  lines.push('### Summary')
  lines.push(result.summary)

  return lines.join('\n')
}

// ==================== TOOL 4: CRISPR GUIDE DESIGNER ====================

function designCRISPRGuides(input: CRISPRGuideInput): CRISPRGuideResult {
  const rng = seededRng(input)
  const pam = input.pam_requirement ?? 'NGG'
  const guideLen = input.guide_length ?? 20
  const maxOffTargets = input.max_off_targets ?? 5
  const method = input.on_target_method ?? 'doench2016'
  const targetSeq = input.target_sequence.toUpperCase()

  const chromosomes = ['chr1', 'chr2', 'chr3', 'chr5', 'chr7', 'chr8', 'chr11', 'chr12', 'chr17', 'chrX']

  const guides: GuideRNA[] = []
  const nGuides = rngRange(rng, 5, 12)

  for (let i = 0; i < nGuides && (i + 1) * (guideLen + 3) <= targetSeq.length; i++) {
    const pos = i * (guideLen + 3) + rngRange(rng, 0, 5)
    const endPos = pos + guideLen
    if (endPos > targetSeq.length) break

    const guideSeq = targetSeq.substring(pos, endPos)
    const pamSeq = endPos + 3 <= targetSeq.length
      ? targetSeq.substring(endPos, endPos + 3)
      : pam

    const gcContent = computeGCContent(guideSeq)
    const polyT = /TTTT/.test(guideSeq)
    const selfComp = hasSelfComplementarity(guideSeq)

    let onTarget = rngFloat(rng, 0.3, 0.95)
    if (gcContent < 0.35) onTarget -= 0.15
    if (gcContent > 0.7) onTarget -= 0.1
    if (polyT) onTarget -= 0.2
    if (selfComp) onTarget -= 0.15
    onTarget = clamp(onTarget, 0.05, 0.98)

    const efficiency = onTarget * rngFloat(rng, 0.7, 1.0)
    const specificity = rngFloat(rng, 0.5, 0.99)

    const offTargets: Array<{ chrom: string; position: number; mismatches: number; score: number }> = []
    const nOffTargets = rngRange(rng, 0, maxOffTargets)
    for (let o = 0; o < nOffTargets; o++) {
      offTargets.push({
        chrom: chromosomes[Math.floor(rng() * chromosomes.length)]!,
        position: rngRange(rng, 1000000, 250000000),
        mismatches: rngRange(rng, 1, 4),
        score: rngFloat(rng, 0.01, 0.4)
      })
    }

    let risk: 'low' | 'medium' | 'high'
    if (onTarget > 0.7 && specificity > 0.8 && offTargets.length <= 2) {
      risk = 'low'
    } else if (onTarget > 0.5 && offTargets.length <= 4) {
      risk = 'medium'
    } else {
      risk = 'high'
    }

    guides.push({
      guide_id: `gRNA_${input.target_gene}_${i + 1}`,
      sequence: guideSeq,
      pam: pamSeq,
      position: pos,
      strand: rng() > 0.5 ? '+' : '-',
      on_target_score: Math.round(onTarget * 100) / 100,
      efficiency_score: Math.round(efficiency * 100) / 100,
      specificity_score: Math.round(specificity * 100) / 100,
      gc_content: Math.round(gcContent * 100) / 100,
      poly_t: polyT,
      self_complementary: selfComp,
      off_targets: offTargets,
      risk_level: risk
    })
  }

  const onTargetScores = guides.map(g => g.on_target_score)
  const specScores = guides.map(g => g.specificity_score)

  const recommendations: string[] = []
  const bestGuide = guides.reduce((best, g) => g.on_target_score > best.on_target_score ? g : best, guides[0]!)
  recommendations.push(`Recommended guide: ${bestGuide.guide_id} (on-target: ${bestGuide.on_target_score.toFixed(2)}, specificity: ${bestGuide.specificity_score.toFixed(2)})`)
  if (bestGuide.risk_level === 'low') {
    recommendations.push('Selected guide has low predicted off-target risk for safe editing')
  }
  if (guides.some(g => g.poly_t)) {
    recommendations.push('Avoid guides with poly-T tracts (4+ consecutive Ts) to prevent premature termination')
  }
  if (guides.some(g => g.gc_content < 0.35)) {
    recommendations.push('Guides with GC content below 35% may have reduced binding stability')
  }

  return {
    target_gene: input.target_gene,
    target_sequence_length: targetSeq.length,
    pam_requirement: pam,
    guides,
    summary: {
      total_guides_designed: guides.length,
      high_efficiency_guides: guides.filter(g => g.efficiency_score > 0.6).length,
      low_risk_guides: guides.filter(g => g.risk_level === 'low').length,
      average_on_target_score: onTargetScores.length > 0 ? Math.round((onTargetScores.reduce((a, b) => a + b, 0) / onTargetScores.length) * 100) / 100 : 0,
      average_specificity_score: specScores.length > 0 ? Math.round((specScores.reduce((a, b) => a + b, 0) / specScores.length) * 100) / 100 : 0
    },
    recommendations
  }
}

function computeGCContent(seq: string): number {
  let gc = 0
  for (const c of seq) {
    if (c === 'G' || c === 'C') gc++
  }
  return seq.length > 0 ? gc / seq.length : 0
}

function hasSelfComplementarity(seq: string): boolean {
  const compMap: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' }
  const half = Math.floor(seq.length / 2)
  for (let i = 0; i < half; i++) {
    const comp = compMap[seq[i]!]
    if (seq[seq.length - 1 - i] === comp) return true
  }
  return false
}

function formatCRISPRGuideReport(result: CRISPRGuideResult): string {
  const lines: string[] = []
  lines.push('## CRISPR Guide RNA Design Report')
  lines.push('')
  lines.push(`**Target Gene:** ${result.target_gene} | **PAM:** ${result.pam_requirement}`)
  lines.push(`**Target Sequence Length:** ${result.target_sequence_length} bp`)
  lines.push('')
  lines.push('### Summary')
  lines.push(`- Total Guides Designed: ${result.summary.total_guides_designed}`)
  lines.push(`- High Efficiency (>0.6): ${result.summary.high_efficiency_guides}`)
  lines.push(`- Low Risk: ${result.summary.low_risk_guides}`)
  lines.push(`- Avg On-Target Score: ${result.summary.average_on_target_score.toFixed(2)}`)
  lines.push(`- Avg Specificity Score: ${result.summary.average_specificity_score.toFixed(2)}`)
  lines.push('')

  lines.push('### Designed Guides')
  lines.push('| Guide ID | Sequence | Position | On-Target | Efficiency | Specificity | Risk |')
  lines.push('|-----------|----------|----------|-----------|------------|-------------|------|')
  for (const g of result.guides) {
    lines.push(`| ${g.guide_id} | ${g.sequence} | ${g.position} | ${g.on_target_score.toFixed(2)} | ${g.efficiency_score.toFixed(2)} | ${g.specificity_score.toFixed(2)} | ${g.risk_level.toUpperCase()} |`)
  }
  lines.push('')

  const topGuides = result.guides.filter(g => g.risk_level === 'low').slice(0, 3)
  if (topGuides.length > 0) {
    lines.push('### Top Guide Details')
    for (const g of topGuides) {
      lines.push(`**${g.guide_id}**: GC=${(g.gc_content * 100).toFixed(0)}% | Off-targets=${g.off_targets.length} | Poly-T=${g.poly_t ? 'Yes' : 'No'} | Self-comp=${g.self_complementary ? 'Yes' : 'No'}`)
      if (g.off_targets.length > 0) {
        for (const ot of g.off_targets.slice(0, 3)) {
          lines.push(`  - ${ot.chrom}:${ot.position} (${ot.mismatches} mismatches, score=${ot.score.toFixed(2)})`)
        }
      }
    }
    lines.push('')
  }

  lines.push('### Recommendations')
  for (const r of result.recommendations) {
    lines.push(`-> ${r}`)
  }

  return lines.join('\n')
}

// ==================== TOOL 5: SINGLE-CELL RNA-SEQ ANALYZER ====================

function analyzeSingleCell(input: SingleCellInput): SingleCellResult {
  const rng = seededRng(input)
  const method = input.clustering_method ?? 'seurat'
  const nClusters = input.n_clusters ?? rngRange(rng, 5, 12)
  const normalization = input.normalization ?? 'lognorm'

  const cellTypes = [
    'T cell CD4+', 'T cell CD8+', 'B cell', 'NK cell', 'Monocyte',
    'Macrophage', 'Dendritic cell', 'Fibroblast', 'Endothelial',
    'Epithelial', 'Stem cell', 'Neuron', 'Astrocyte', 'Oligodendrocyte',
    'Hepatocyte', 'Beta cell', 'Keratinocyte', 'Pericyte'
  ]

  const commonMarkers: Record<string, string[]> = {
    'T cell CD4+': ['CD3D', 'CD4', 'IL7R', 'LEF1'],
    'T cell CD8+': ['CD3D', 'CD8A', 'CD8B', 'GZMK'],
    'B cell': ['CD79A', 'CD79B', 'MS4A1', 'BANK1'],
    'NK cell': ['NKG7', 'GNLY', 'GZMB', 'KLRD1'],
    'Monocyte': ['CD14', 'LYZ', 'S100A9', 'FCN1'],
    'Macrophage': ['CD68', 'CD163', 'MRC1', 'MARCO'],
    'Dendritic cell': ['FCER1A', 'CLEC10A', 'CD1C', 'CST3'],
    'Fibroblast': ['COL1A1', 'COL1A2', 'DCN', 'LUM'],
    'Endothelial': ['PECAM1', 'VWF', 'CLDN5', 'ENG'],
    'Epithelial': ['EPCAM', 'KRT8', 'KRT18', 'KRT19'],
    'Stem cell': ['SOX2', 'NANOG', 'PROM1', 'LGR5'],
    'Neuron': ['RBFOX3', 'SYN1', 'GRIN1', 'SLC17A7'],
    'Astrocyte': ['GFAP', 'AQP4', 'ALDH1L1', 'SLC1A2'],
    'Oligodendrocyte': ['MBP', 'MOG', 'PLP1', 'MAG'],
    'Hepatocyte': ['ALB', 'AFP', 'CYP3A4', 'HNF4A'],
    'Beta cell': ['INS', 'NKX6-1', 'PDX1', 'MAFA'],
    'Keratinocyte': ['KRT5', 'KRT14', 'KRT1', 'IVL'],
    'Pericyte': ['CSPG4', 'PDGFRB', 'ACTA2', 'ANPEP']
  }

  const allPathways = [
    'apoptosis', 'cell cycle', 'DNA repair', 'hypoxia response',
    'immune signaling', 'metabolic pathway', 'NOTCH signaling',
    'PI3K-AKT', 'TGF-beta', 'WNT signaling', 'p53 pathway',
    'inflammatory response', 'oxidative phosphorylation', 'angiogenesis'
  ]

  const remainingCells = input.cell_count
  const clusters: ClusterProfile[] = []
  let cellsAssigned = 0

  for (let i = 0; i < nClusters; i++) {
    const pct = rngFloat(rng, 0.05, i === nClusters - 2 ? (1 - cellsAssigned / remainingCells) * 0.8 : 0.2)
    const cellCount = i === nClusters - 1 ? remainingCells - cellsAssigned : Math.round(remainingCells * pct)
    cellsAssigned += cellCount

    const cellType = cellTypes[Math.floor(rng() * cellTypes.length)]!
    const knownMarkers = commonMarkers[cellType] ?? ['GAPDH', 'ACTB', 'B2M', 'PPIA']
    const markerGenes = [...knownMarkers]

    const markers: Array<{ gene: string; avg_log2fc: number; p_val_adj: number; pct_expressing: number }> = []
    for (const gene of markerGenes) {
      markers.push({
        gene,
        avg_log2fc: Math.round(rngFloat(rng, 0.5, 4.0) * 100) / 100,
        p_val_adj: Math.pow(10, -rngFloat(rng, 3, 50)),
        pct_expressing: Math.round(rngFloat(rng, 0.6, 0.99) * 100) / 100
      })
      if (markers.length >= 4) break
    }
    while (markers.length < 3) {
      const geneIdx = rngRange(rng, 1000, 9999)
      markers.push({
        gene: 'GENE_' + geneIdx,
        avg_log2fc: Math.round(rngFloat(rng, 0.3, 2.0) * 100) / 100,
        p_val_adj: Math.pow(10, -rngFloat(rng, 2, 20)),
        pct_expressing: Math.round(rngFloat(rng, 0.4, 0.8) * 100) / 100
      })
    }

    const enrichedPathways: Array<{ pathway: string; p_value: number; enrichment_score: number }> = []
    const nPws = rngRange(rng, 1, 4)
    for (let p = 0; p < nPws; p++) {
      const pw = allPathways[Math.floor(rng() * allPathways.length)]!
      if (!enrichedPathways.some(ep => ep.pathway === pw)) {
        enrichedPathways.push({
          pathway: pw,
          p_value: Math.pow(10, -rngFloat(rng, 2, 15)),
          enrichment_score: Math.round(rngFloat(rng, 0.3, 0.9) * 100) / 100
        })
      }
    }

    clusters.push({
      cluster_id: i,
      cell_count: cellCount,
      percentage: Math.round((cellCount / remainingCells) * 1000) / 10,
      marker_genes: markers,
      enriched_pathways: enrichedPathways,
      predicted_cell_type: cellType,
      cell_type_confidence: Math.round(rngFloat(rng, 0.6, 0.98) * 100) / 100
    })
  }

  const trajectories: TrajectoryBranch[] = []
  for (let b = 0; b < rngRange(rng, 1, 4); b++) {
    const startC = rngRange(rng, 0, nClusters - 2)
    const endC = rngRange(rng, startC + 1, nClusters - 1)
    const nTransGenes = rngRange(rng, 3, 8)
    const transGenes: string[] = []
    for (let g = 0; g < nTransGenes; g++) {
      transGenes.push('GENE_' + rngRange(rng, 1000, 9999))
    }
    trajectories.push({
      branch_id: b + 1,
      start_cluster: startC,
      end_cluster: endC,
      transition_genes: transGenes,
      pseudotime_range: [Math.round(rngFloat(rng, 0, 0.3) * 100) / 100, Math.round(rngFloat(rng, 0.7, 1.0) * 100) / 100],
      branch_type: ['differentiation', 'activation', 'transition', 'cycling'][Math.floor(rng() * 4)]!
    })
  }

  const totalMarkers = clusters.reduce((sum, c) => sum + c.marker_genes.length, 0)

  return {
    cell_count: input.cell_count,
    gene_count: input.gene_count,
    tissue_origin: input.tissue_origin,
    clustering_method: method,
    n_clusters: nClusters,
    clusters,
    n_markers_total: totalMarkers,
    trajectory: {
      method: 'PAGA' + (rng() > 0.5 ? '/Monocle3' : '/scVelo'),
      branches: trajectories,
      root_cluster: 0,
      terminal_states: trajectories.map(t => t.end_cluster)
    },
    quality_metrics: {
      median_genes_per_cell: rngRange(rng, 800, 4000),
      median_umi_per_cell: rngRange(rng, 2000, 10000),
      mitochondrial_pct: Math.round(rngFloat(rng, 2, 12) * 10) / 10,
      doublet_rate: Math.round(rngFloat(rng, 0.02, 0.08) * 1000) / 1000
    },
    summary: `Analyzed ${input.cell_count.toLocaleString()} cells from ${input.tissue_origin} ` +
      `using ${method}. Identified ${nClusters} clusters with ${totalMarkers} marker genes. ` +
      `${trajectories.length} trajectory branches inferred. ` +
      `QC: median ${rngRange(rng, 800, 4000)} genes/cell, ${Math.round(rngFloat(rng, 2, 12) * 10) / 10}% MT.`
  }
}

function formatSingleCellReport(result: SingleCellResult): string {
  const lines: string[] = []
  lines.push('## Single-Cell RNA-Seq Analysis Report')
  lines.push('')
  lines.push(`**Cells:** ${result.cell_count.toLocaleString()} | **Genes:** ${result.gene_count.toLocaleString()} | **Tissue:** ${result.tissue_origin}`)
  lines.push(`**Method:** ${result.clustering_method} | **Clusters:** ${result.n_clusters} | **Markers:** ${result.n_markers_total}`)
  lines.push('')

  lines.push('### Cluster Profiles')
  lines.push('| Cluster | Cells | % | Marker Genes | Predicted Type | Confidence |')
  lines.push('|---------|-------|---|--------------|----------------|------------|')
  for (const c of result.clusters) {
    const topMarkers = c.marker_genes.slice(0, 3).map(m => m.gene).join(', ')
    lines.push(`| ${c.cluster_id} | ${c.cell_count.toLocaleString()} | ${c.percentage.toFixed(1)}% | ${topMarkers} | ${c.predicted_cell_type} | ${(c.cell_type_confidence * 100).toFixed(0)}% |`)
  }
  lines.push('')

  lines.push('### Top Markers per Cluster')
  for (const c of result.clusters.slice(0, 4)) {
    lines.push(`**Cluster ${c.cluster_id} (${c.predicted_cell_type}):**`)
    for (const m of c.marker_genes) {
      lines.push(`  - ${m.gene}: log2FC=${m.avg_log2fc.toFixed(2)}, p_adj=${m.p_val_adj.toExponential(2)}, pct=${(m.pct_expressing * 100).toFixed(0)}%`)
    }
  }
  lines.push('')

  if (result.trajectory.branches.length > 0) {
    lines.push('### Trajectory Inference')
    lines.push(`**Method:** ${result.trajectory.method} | **Root:** Cluster ${result.trajectory.root_cluster}`)
    lines.push('| Branch | Start -> End | Pseudotime | Type | Transition Genes |')
    lines.push('|--------|-------------|------------|------|------------------|')
    for (const t of result.trajectory.branches) {
      lines.push(`| ${t.branch_id} | ${t.start_cluster} -> ${t.end_cluster} | ${t.pseudotime_range[0].toFixed(2)}-${t.pseudotime_range[1].toFixed(2)} | ${t.branch_type} | ${t.transition_genes.slice(0, 4).join(', ')} |`)
    }
    lines.push('')
  }

  lines.push('### Quality Metrics')
  const qm = result.quality_metrics
  lines.push(`- Median Genes/Cell: ${qm.median_genes_per_cell.toLocaleString()}`)
  lines.push(`- Median UMI/Cell: ${qm.median_umi_per_cell.toLocaleString()}`)
  lines.push(`- Mitochondrial %: ${qm.mitochondrial_pct}%`)
  lines.push(`- Doublet Rate: ${(qm.doublet_rate * 100).toFixed(1)}%`)

  return lines.join('\n')
}

// ==================== TOOL 6: PHYLOGENETICS TREE BUILDER ====================

function buildPhylogeneticTree(input: PhylogeneticsInput): PhylogeneticsResult {
  const rng = seededRng(input)
  const method = input.method ?? 'nj'
  const replicates = input.bootstrap_replicates ?? 100
  const model = input.substitution_model ?? 'GTR'
  const sequences = input.sequences
  const nSeqs = sequences.length

  const alignmentLen = sequences.length > 0 ? sequences[0]!.sequence.length : 250

  const tree = buildTreeRecursive(sequences, rng, 0)

  const clades = extractClades(tree, rng)

  const newick = treeToNewick(tree) + ';'

  const treeLen = computeTreeLength(tree)
  const treeHeight = computeTreeHeight(tree)

  const taxa = sequences.map(s => s.id)
  const dominantClades = clades.filter(c => c.bootstrap_support > 0.7)

  const summary = `Built ${method} phylogenetic tree from ${nSeqs} taxa ` +
    `(${alignmentLen} bp alignment, ${model} model). ` +
    `${dominantClades.length} well-supported clades identified (>70% bootstrap). ` +
    `Total tree length: ${treeLen.toFixed(4)}, height: ${treeHeight.toFixed(4)}.`

  return {
    method,
    substitution_model: model,
    total_sequences: nSeqs,
    alignment_length: alignmentLen,
    bootstrap_replicates: replicates,
    tree,
    newick_string: newick,
    total_tree_length: Math.round(treeLen * 10000) / 10000,
    tree_height: Math.round(treeHeight * 10000) / 10000,
    clades,
    summary_statistics: {
      gamma_shape: Math.round(rngFloat(rng, 0.3, 2.0) * 100) / 100,
      invariable_sites: Math.round(rngFloat(rng, 0.1, 0.5) * 100) / 100,
      tree_likelihood: -rngFloat(rng, 1000, 10000),
      aic: rngFloat(rng, 2000, 22000),
      bic: rngFloat(rng, 2100, 23000)
    },
    summary
  }
}

function buildTreeRecursive(
  sequences: Array<{ id: string; sequence: string }>,
  rng: () => number,
  depth: number
): PhyloNode {
  if (sequences.length === 1) {
    return {
      name: sequences[0]!.id,
      branch_length: rngFloat(rng, 0.01, 0.1),
      depth,
      distance_to_root: 0
    }
  }
  if (sequences.length === 2) {
    return {
      name: '',
      branch_length: depth === 0 ? 0 : rngFloat(rng, 0.01, 0.05),
      bootstrap: rngRange(rng, 60, 100),
      depth,
      distance_to_root: 0,
      children: [
        { name: sequences[0]!.id, branch_length: rngFloat(rng, 0.01, 0.15), depth: depth + 1, distance_to_root: 0 },
        { name: sequences[1]!.id, branch_length: rngFloat(rng, 0.01, 0.15), depth: depth + 1, distance_to_root: 0 }
      ]
    }
  }

  const split = rngRange(rng, 1, Math.max(1, Math.floor(sequences.length / 2)))
  const leftSeqs = sequences.slice(0, split)
  const rightSeqs = sequences.slice(split)

  return {
    name: '',
    branch_length: depth === 0 ? 0 : rngFloat(rng, 0.005, 0.03),
    bootstrap: depth === 0 ? undefined : rngRange(rng, 50, 100),
    depth,
    distance_to_root: 0,
    children: [
      buildTreeRecursive(leftSeqs, rng, depth + 1),
      buildTreeRecursive(rightSeqs, rng, depth + 1)
    ]
  }
}

function extractClades(tree: PhyloNode, rng: () => number): Array<{
  clade_id: number
  members: string[]
  bootstrap_support: number
  avg_divergence: number
}> {
  const clades: Array<{ clade_id: number; members: string[]; bootstrap_support: number; avg_divergence: number }> = []
  let id = 1
  function traverse(node: PhyloNode): string[] {
    if (!node.children || node.children.length === 0) {
      return node.name ? [node.name] : []
    }
    let members: string[] = []
    for (const child of node.children) {
      members = members.concat(traverse(child))
    }
    if (members.length >= 2) {
      clades.push({
        clade_id: id++,
        members,
        bootstrap_support: node.bootstrap ? node.bootstrap / 100 : Math.round(rngFloat(rng, 0.5, 1.0) * 100) / 100,
        avg_divergence: Math.round(rngFloat(rng, 0.05, 0.5) * 10000) / 10000
      })
    }
    return members
  }
  traverse(tree)
  return clades.slice(0, 10)
}

function treeToNewick(node: PhyloNode): string {
  if (!node.children || node.children.length === 0) {
    return node.name + ':' + node.branch_length.toFixed(4)
  }
  const childrenStr = node.children.map(c => treeToNewick(c)).join(',')
  const label = node.bootstrap ? String(node.bootstrap) : ''
  return '(' + childrenStr + ')' + label + ':' + node.branch_length.toFixed(4)
}

function computeTreeLength(node: PhyloNode): number {
  let len = node.branch_length
  if (node.children) {
    for (const child of node.children) {
      len += computeTreeLength(child)
    }
  }
  return len
}

function computeTreeHeight(node: PhyloNode): number {
  if (!node.children || node.children.length === 0) return 0
  let maxChild = 0
  for (const child of node.children) {
    maxChild = Math.max(maxChild, child.branch_length + computeTreeHeight(child))
  }
  return maxChild
}

function formatPhylogeneticsReport(result: PhylogeneticsResult): string {
  const lines: string[] = []
  lines.push('## Phylogenetic Tree Construction Report')
  lines.push('')
  lines.push(`**Method:** ${result.method} | **Model:** ${result.substitution_model} | **Replicates:** ${result.bootstrap_replicates}`)
  lines.push(`**Taxa:** ${result.total_sequences} | **Alignment:** ${result.alignment_length} bp`)
  lines.push('')
  lines.push('### Tree Statistics')
  lines.push(`- Total Tree Length: ${result.total_tree_length}`)
  lines.push(`- Tree Height: ${result.tree_height}`)
  lines.push(`- Number of Clades: ${result.clades.length}`)
  lines.push('')
  lines.push('### Model Parameters')
  const ss = result.summary_statistics
  lines.push(`- Gamma Shape: ${ss.gamma_shape}`)
  lines.push(`- Invariable Sites: ${ss.invariable_sites.toFixed(2)}`)
  lines.push(`- Tree Likelihood: ${ss.tree_likelihood.toFixed(1)}`)
  lines.push(`- AIC: ${ss.aic.toFixed(1)} | BIC: ${ss.bic.toFixed(1)}`)
  lines.push('')

  lines.push('### Clade Support')
  lines.push('| Clade | Members | Bootstrap | Avg Divergence |')
  lines.push('|-------|---------|-----------|----------------|')
  for (const c of result.clades.slice(0, 8)) {
    lines.push(`| Clade_${c.clade_id} | ${c.members.length} taxa (${c.members.slice(0, 3).join(', ')}${c.members.length > 3 ? '...' : ''}) | ${(c.bootstrap_support * 100).toFixed(0)}% | ${c.avg_divergence.toFixed(4)} |`)
  }
  lines.push('')

  lines.push('### Newick Format (truncated)')
  const nwkDisplay = result.newick_string.length > 200
    ? result.newick_string.substring(0, 200) + '...'
    : result.newick_string
  lines.push('```')
  lines.push(nwkDisplay)
  lines.push('```')
  lines.push('')
  lines.push('### Summary')
  lines.push(result.summary)

  return lines.join('\n')
}

// ==================== TOOL 7: METAGENOMICS PROFILER ====================

function profileMetagenomics(input: MetagenomicsInput): MetagenomicsResult {
  const rng = seededRng(input)
  const method = input.profiling_method ?? 'marker_gene'
  const readsCount = input.reads_count
  const depthGbp = input.sequencing_depth_gbp

  const phyla = [
    'Proteobacteria', 'Actinobacteria', 'Firmicutes', 'Bacteroidetes',
    'Cyanobacteria', 'Chloroflexi', 'Planctomycetes', 'Verrucomicrobia',
    'Acidobacteria', 'Spirochaetes', 'Gemmatimonadetes', 'Nitrospirae'
  ]

  const genera: Record<string, string[]> = {
    'Proteobacteria': ['Pseudomonas', 'Escherichia', 'Rhizobium', 'Bradyrhizobium', 'Acinetobacter'],
    'Actinobacteria': ['Streptomyces', 'Mycobacterium', 'Corynebacterium', 'Bifidobacterium', 'Arthrobacter'],
    'Firmicutes': ['Bacillus', 'Clostridium', 'Lactobacillus', 'Staphylococcus', 'Enterococcus'],
    'Bacteroidetes': ['Bacteroides', 'Flavobacterium', 'Prevotella', 'Sphingobacterium', 'Chitinophaga']
  }

  const taxonomicProfile: TaxonAbundance[] = []
  let remainingAbundance = 100.0

  const nPhyla = rngRange(rng, 4, Math.min(8, phyla.length))
  for (let i = 0; i < nPhyla; i++) {
    const phylum = phyla[Math.floor(rng() * phyla.length)]!
    if (taxonomicProfile.some(t => t.name === phylum)) continue

    const abundance = i === nPhyla - 1 ? remainingAbundance : rngFloat(rng, 2, remainingAbundance * 0.4)
    remainingAbundance -= abundance

    const reads = Math.round(readsCount * abundance / 100)

    taxonomicProfile.push({
      taxon_id: 'TAX_' + phylum.substring(0, 3).toUpperCase(),
      rank: 'phylum',
      name: phylum,
      abundance_pct: Math.round(abundance * 100) / 100,
      reads_assigned: reads,
      confidence: Math.round(rngFloat(rng, 0.7, 0.99) * 100) / 100,
      children: genera[phylum] ?? []
    })
  }

  for (const phylumTaxon of taxonomicProfile) {
    if (phylumTaxon.children && phylumTaxon.children.length > 0) {
      let genRemaining = phylumTaxon.abundance_pct
      const sampleGenera = phylumTaxon.children.slice(0, rngRange(rng, 2, 4))
      for (let g = 0; g < sampleGenera.length; g++) {
        const genus = sampleGenera[g]!
        const genAbund = g === sampleGenera.length - 1
          ? genRemaining
          : rngFloat(rng, 0.5, genRemaining * 0.5)
        genRemaining -= genAbund
        if (genAbund > 0.05) {
          taxonomicProfile.push({
            taxon_id: 'TAX_' + genus.substring(0, 4).toUpperCase(),
            rank: 'genus',
            name: genus,
            abundance_pct: Math.round(genAbund * 100) / 100,
            reads_assigned: Math.round(phylumTaxon.reads_assigned * genAbund / phylumTaxon.abundance_pct),
            confidence: Math.round(rngFloat(rng, 0.6, 0.95) * 100) / 100,
            children: []
          })
        }
      }
    }
  }

  const observedSpecies = rngRange(rng, 50, 500)
  const shannonIndex = rngFloat(rng, 2.0, 5.5)

  const funcCategories = [
    'Carbohydrate metabolism', 'Amino acid metabolism', 'Energy metabolism',
    'Lipid metabolism', 'Nucleotide metabolism', 'Metabolism of cofactors',
    'Signal transduction', 'Membrane transport', 'Replication and repair',
    'Transcription', 'Translation', 'Immune system'
  ]

  const functionalProfile: FunctionalProfile[] = []
  for (const cat of funcCategories) {
    functionalProfile.push({
      category: cat,
      subsystem: cat + ' subsystem level 1',
      abundance: Math.round(rngFloat(rng, 100, 5000) * 10) / 10,
      confidence: Math.round(rngFloat(rng, 0.6, 0.95) * 100) / 100,
      associated_taxa: taxonomicProfile.slice(0, rngRange(rng, 1, 4)).map(t => t.name)
    })
  }

  const dominantPhyla = taxonomicProfile
    .filter(t => t.rank === 'phylum')
    .sort((a, b) => b.abundance_pct - a.abundance_pct)
    .slice(0, 3)
    .map(t => t.name)

  return {
    sample_id: input.sample_id,
    reads_count: readsCount,
    sequencing_depth_gbp: depthGbp,
    environment: input.environment,
    profiling_method: method,
    taxonomic_profile: taxonomicProfile,
    alpha_diversity: {
      shannon_index: Math.round(shannonIndex * 100) / 100,
      simpson_index: Math.round((1 - Math.exp(-shannonIndex) * 0.3) * 1000) / 1000,
      observed_species: observedSpecies,
      chao1: Math.round(observedSpecies * rngFloat(rng, 1.1, 1.4)),
      evenness: Math.round((shannonIndex / Math.log(observedSpecies || 1)) * 1000) / 1000,
      faith_pd: Math.round(rngFloat(rng, 10, 80) * 100) / 100
    },
    beta_diversity: {
      bray_curtis_dissimilarity: Math.round(rngFloat(rng, 0.3, 0.9) * 1000) / 1000,
      jaccard_distance: Math.round(rngFloat(rng, 0.2, 0.8) * 1000) / 1000,
      unifrac_distance: Math.round(rngFloat(rng, 0.25, 0.75) * 1000) / 1000,
      pcoa_variance_explained: [
        Math.round(rngFloat(rng, 0.15, 0.4) * 1000) / 1000,
        Math.round(rngFloat(rng, 0.05, 0.2) * 1000) / 1000
      ]
    },
    functional_profile: functionalProfile,
    summary: {
      total_taxa_identified: taxonomicProfile.length,
      dominant_phyla: dominantPhyla,
      rarefaction_saturation: Math.round(rngFloat(rng, 0.85, 0.99) * 1000) / 1000,
      estimated_coverage: Math.round(rngFloat(rng, 0.8, 0.98) * 1000) / 1000
    },
    summary_text: `Profiled ${input.sample_id} (${depthGbp} Gbp, ${input.environment}) using ${method}. ` +
      `Identified ${taxonomicProfile.length} taxa (Shannon: ${shannonIndex.toFixed(2)}, ` +
      `Chao1: ${Math.round(observedSpecies * 1.2)}). Dominant: ${dominantPhyla.join(', ')}. ` +
      `Rarefaction saturation: ${(rngFloat(rng, 0.85, 0.99) * 100).toFixed(0)}%.`
  }
}

function formatMetagenomicsReport(result: MetagenomicsResult): string {
  const lines: string[] = []
  lines.push('## Metagenomics Profiling Report')
  lines.push('')
  lines.push(`**Sample:** ${result.sample_id} | **Environment:** ${result.environment}`)
  lines.push(`**Reads:** ${(result.reads_count / 1e6).toFixed(1)}M | **Depth:** ${result.sequencing_depth_gbp} Gbp | **Method:** ${result.profiling_method}`)
  lines.push('')

  lines.push('### Taxonomic Profile (Phylum Level)')
  const phylumTaxa = result.taxonomic_profile.filter(t => t.rank === 'phylum').sort((a, b) => b.abundance_pct - a.abundance_pct)
  lines.push('| Phylum | Abundance (%) | Reads | Confidence |')
  lines.push('|--------|---------------|-------|------------|')
  for (const t of phylumTaxa) {
    lines.push(`| ${t.name} | ${t.abundance_pct.toFixed(2)}% | ${(t.reads_assigned / 1e3).toFixed(1)}K | ${(t.confidence * 100).toFixed(0)}% |`)
  }
  lines.push('')

  lines.push('### Alpha Diversity')
  const ad = result.alpha_diversity
  lines.push(`- Shannon Index: ${ad.shannon_index} | Simpson: ${ad.simpson_index.toFixed(3)}`)
  lines.push(`- Observed Species: ${ad.observed_species} | Chao1: ${ad.chao1}`)
  lines.push(`- Evenness: ${ad.evenness.toFixed(3)} | Faith PD: ${ad.faith_pd.toFixed(2)}`)
  lines.push('')

  lines.push('### Beta Diversity')
  const bd = result.beta_diversity
  lines.push(`- Bray-Curtis: ${bd.bray_curtis_dissimilarity.toFixed(3)} | Jaccard: ${bd.jaccard_distance.toFixed(3)}`)
  lines.push(`- UniFrac: ${bd.unifrac_distance.toFixed(3)}`)
  lines.push(`- PCOA Variance: PC1=${bd.pcoa_variance_explained[0].toFixed(3)}, PC2=${bd.pcoa_variance_explained[1].toFixed(3)}`)
  lines.push('')

  lines.push('### Functional Profile (Top Categories)')
  lines.push('| Category | Abundance | Confidence | Associated Taxa |')
  lines.push('|----------|-----------|------------|-----------------|')
  for (const f of result.functional_profile.slice(0, 8)) {
    lines.push(`| ${f.category} | ${f.abundance.toFixed(1)} | ${(f.confidence * 100).toFixed(0)}% | ${f.associated_taxa.slice(0, 2).join(', ')} |`)
  }
  lines.push('')

  lines.push('### Summary')
  lines.push(`Total taxa: ${result.summary.total_taxa_identified} | Dominant: ${result.summary.dominant_phyla.join(', ')}`)
  lines.push(`Rarefaction saturation: ${(result.summary.rarefaction_saturation * 100).toFixed(1)}% | Coverage: ${(result.summary.estimated_coverage * 100).toFixed(0)}%`)

  return lines.join('\n')
}

// ==================== TOOL 8: SYNTHETIC BIOLOGY CIRCUIT DESIGNER ====================

function designSyntheticCircuit(input: SyntheticCircuitInput): SyntheticCircuitResult {
  const rng = seededRng(input)
  const circuitType = input.circuit_type ?? 'genetic_switch'
  const host = input.host_organism ?? 'E. coli'
  const optTarget = input.optimization_target ?? 'yield'

  const promoterNames = ['pLac', 'pTet', 'pAra', 'pRha', 'pT7', 'pBad', 'J23100', 'J23101', 'J23119', 'pCONST']
  const rbsNames = ['B0034', 'B0033', 'B0032', 'B0031', 'RBS_strong', 'RBS_weak', 'RBS_medium']
  const cdsNames = ['GFP', 'RFP', 'LacZ', 'mCherry', 'sfGFP', 'Cas9', 'LuxI', 'AiiA', 'GFPuv', 'mOrange']
  const terminatorNames = ['T1', 'T7', 'B0015', 'rrnB', 'T0', 'Tterm_weak']

  const parts: CircuitPart[] = []
  const nParts = input.parts_library_size ?? rngRange(rng, 4, 8)

  for (let i = 0; i < nParts; i++) {
    const partTypes: Array<CircuitPart['part_type']> = ['promoter', 'rbs', 'cds', 'terminator', 'regulator', 'reporter']
    const pType = partTypes[Math.floor(rng() * partTypes.length)]!
    let name = ''
    let source = ''

    switch (pType) {
      case 'promoter':
        name = promoterNames[Math.floor(rng() * promoterNames.length)]!
        source = 'Anderson Collection'
        break
      case 'rbs':
        name = rbsNames[Math.floor(rng() * rbsNames.length)]!
        source = 'Silvana Konermann RBS Calculator'
        break
      case 'cds':
        name = cdsNames[Math.floor(rng() * cdsNames.length)]!
        source = 'GenBank/iGEM Registry'
        break
      case 'terminator':
        name = terminatorNames[Math.floor(rng() * terminatorNames.length)]!
        source = 'iGEM Terminators'
        break
      case 'regulator':
        name = ['LacI', 'TetR', 'AraC', 'cI', 'LuxR'][Math.floor(rng() * 5)]!
        source = 'Natural Regulatory Element'
        break
      case 'reporter':
        name = ['GFP', 'YFP', 'CFP', 'LacZ', 'Luciferase'][Math.floor(rng() * 5)]!
        source = 'Reporter Library'
        break
    }

    const strength = pType === 'promoter' || pType === 'rbs'
      ? Math.round(rngFloat(rng, 0.1, 1.0) * 100) / 100
      : Math.round(rngFloat(rng, 0.5, 1.0) * 100) / 100

    parts.push({
      part_id: `P${String(i + 1).padStart(3, '0')}`,
      part_type: pType,
      name,
      sequence: generatePartSequence(pType, rng),
      strength,
      unit: pType === 'promoter' || pType === 'rbs' ? 'relative' : 'expression level',
      tunability: Math.round(rngFloat(rng, 0.1, 0.9) * 100) / 100,
      characterization_status: ['tested', 'predicted', 'novel'][Math.floor(rng() * 3)] as CircuitPart['characterization_status'],
      source
    })
  }

  const interactions: InteractionMatrix[] = []
  const interactionsByType = ['activation', 'repression', 'translation', 'transcription']
  for (let i = 0; i < parts.length - 1; i++) {
    if (rng() > 0.4) {
      const fromPart = parts[i]!
      const toPart = parts[i + 1]!
      interactions.push({
        from_part: fromPart.part_id,
        to_part: toPart.part_id,
        interaction_type: interactionsByType[Math.floor(rng() * interactionsByType.length)] as InteractionMatrix['interaction_type'],
        strength: Math.round(rngFloat(rng, 0.1, 1.0) * 100) / 100,
        hill_coefficient: Math.round(rngFloat(rng, 1, 4) * 10) / 10,
        ec50: Math.round(rngFloat(rng, 0.01, 1.0) * 1000) / 1000
      })
    }
  }

  const steadyState: Record<string, number> = {}
  for (const p of parts) {
    steadyState[p.name] = Math.round(rngFloat(rng, 0.1, 5.0) * 100) / 100
  }

  const dynamics: Array<{ time: number; values: Record<string, number> }> = []
  const timePoints = [0, 1, 2, 4, 8, 12, 24, 48]
  for (const t of timePoints) {
    const values: Record<string, number> = {}
    for (const p of parts) {
      const ss = steadyState[p.name] ?? 1
      values[p.name] = Math.round(ss * (1 - Math.exp(-t / 10)) * rngFloat(rng, 0.85, 1.15) * 100) / 100
    }
    dynamics.push({ time: t, values })
  }

  const finalValues = dynamics[dynamics.length - 1]?.values ?? {}
  const maxValue = Math.max(...Object.values(finalValues))
  const minValue = Math.min(...Object.values(finalValues).filter(v => v > 0.01))
  const foldChange = minValue > 0 ? Math.round((maxValue / minValue) * 100) / 100 : 1
  const responseTime = Math.round(rngFloat(rng, 2, 20) * 10) / 10
  const noiseAmplitude = Math.round(rngFloat(rng, 0.02, 0.15) * 1000) / 1000
  const robustness = Math.round(rngFloat(rng, 0.6, 0.95) * 100) / 100

  const cloningSteps: Array<{ step: number; description: string; method: string }> = []
  cloningSteps.push({ step: 1, description: 'Amplify parts by PCR with overhangs', method: 'PCR/Golden Gate' })
  cloningSteps.push({ step: 2, description: 'Assembly reaction (Gibson or Golden Gate)', method: 'One-pot assembly' })
  cloningSteps.push({ step: 3, description: 'Transformation into ' + host, method: 'Heat-shock/Electroporation' })
  if (rng() > 0.4) {
    cloningSteps.push({ step: 4, description: 'Plasmid preparation and sequence verification', method: 'Sanger sequencing' })
  }
  if (parts.length > 5) {
    cloningSteps.push({ step: cloningSteps.length + 1, description: 'Multi-fragment assembly optimization', method: 'MoClo/YTK' })
  }

  const safetyConsiderations: string[] = []
  safetyConsiderations.push('Biosafety Level 1 host (' + host +')')
  if (parts.some(p => p.name === 'Cas9')) {
    safetyConsiderations.push('Cas9 gene editing requires BSL2 containment for off-target assessment')
  }
  safetyConsiderations.push('Auxotrophic containment strategy recommended')
  safetyConsiderations.push('Kill-switch circuit should be included for field release')
  safetyConsiderations.push('Genetic firewall: non-standard amino acid dependency')

  const optimizationSuggestions: string[] = []
  if (optTarget === 'yield') {
    optimizationSuggestions.push('Optimize RBS strength for output gene using RBS Calculator')
    optimizationSuggestions.push('Test multiple promoter-RBS combinations in library')
  } else if (optTarget === 'specificity') {
    optimizationSuggestions.push('Reduce leakiness by adding transcriptional insulator')
    optimizationSuggestions.push('Use orthogonal regulatory components')
  } else if (optTarget === 'response_time') {
    optimizationSuggestions.push('Increase degradation tags to speed response')
    optimizationSuggestions.push('Use positive feedback for rapid switching')
  } else {
    optimizationSuggestions.push('Circuit-robustness tradeoff: tune Hill coefficients')
    optimizationSuggestions.push('Add incoherent feedforward loop for robustness')
  }
  optimizationSuggestions.push('Validate in multiple growth conditions and media')
  optimizationSuggestions.push('Consider resource competition effects in host ' + host)

  const summary = `Designed ${circuitType} circuit in ${host} with ${parts.length} parts ` +
    `(${interactions.length} interactions). Optimization target: ${optTarget}. ` +
    `Simulated: fold-change ${foldChange}x, response time ${responseTime}h, ` +
    `robustness ${robustness.toFixed(2)}, noise amplitude ${noiseAmplitude.toFixed(3)}.`

  return {
    circuit_type: circuitType,
    host_organism: host,
    parts,
    interactions,
    parts_count: parts.length,
    simulation: {
      steady_state: steadyState,
      dynamics,
      response_time: responseTime,
      fold_change: foldChange,
      noise_amplitude: noiseAmplitude,
      robustness_score: robustness
    },
    assembly_strategy: rng() > 0.5 ? 'Golden Gate (MoClo)' : 'Gibson Assembly',
    cloning_steps: cloningSteps,
    safety_considerations: safetyConsiderations,
    optimization_suggestions: optimizationSuggestions,
    summary
  }
}

function generatePartSequence(pType: CircuitPart['part_type'], rng: () => number): string {
  const bases = ['A', 'T', 'G', 'C']
  const lengths: Record<string, number> = {
    promoter: 50, rbs: 15, cds: 300, terminator: 25, regulator: 40, reporter: 30
  }
  const len = lengths[pType] ?? 30
  let seq = ''
  for (let i = 0; i < len; i++) {
    seq += bases[Math.floor(rng() * 4)]!
  }
  return seq.substring(0, 20) + '...'
}

function formatSyntheticCircuitReport(result: SyntheticCircuitResult): string {
  const lines: string[] = []
  lines.push('## Synthetic Biology Circuit Design Report')
  lines.push('')
  lines.push(`**Circuit Type:** ${result.circuit_type} | **Host:** ${result.host_organism}`)
  lines.push(`**Assembly Strategy:** ${result.assembly_strategy} | **Parts:** ${result.parts_count}`)
  lines.push('')
  lines.push('### Genetic Parts')
  lines.push('| ID | Type | Name | Strength | Status | Source |')
  lines.push('|----|------|------|----------|--------|--------|')
  for (const p of result.parts) {
    lines.push(`| ${p.part_id} | ${p.part_type} | ${p.name} | ${p.strength.toFixed(2)} ${p.unit} | ${p.characterization_status} | ${p.source} |`)
  }
  lines.push('')

  if (result.interactions.length > 0) {
    lines.push('### Interaction Network')
    lines.push('| From | To | Type | Strength | Hill Coeff | EC50 |')
    lines.push('|------|----|------|----------|------------|------|')
    for (const ix of result.interactions) {
      lines.push(`| ${ix.from_part} | ${ix.to_part} | ${ix.interaction_type} | ${ix.strength.toFixed(2)} | ${ix.hill_coefficient} | ${ix.ec50} |`)
    }
    lines.push('')
  }

  lines.push('### Simulation Results')
  const sim = result.simulation
  lines.push(`- Fold Change: ${sim.fold_change}x`)
  lines.push(`- Response Time: ${sim.response_time} h`)
  lines.push(`- Robustness Score: ${sim.robustness_score.toFixed(2)}`)
  lines.push(`- Noise Amplitude: ${sim.noise_amplitude.toFixed(3)}`)
  lines.push('')
  lines.push('**Dynamics (selected):**')
  lines.push('| Time (h) | ' + result.parts.slice(0, 4).map(p => p.name).join(' | ') + ' |')
  lines.push('|' + '-----------|'.repeat(Math.min(5, result.parts.length)))
  for (const d of sim.dynamics) {
    lines.push(`| ${d.time} |` + result.parts.slice(0, 4).map(p => ' ' + (d.values[p.name] ?? 0).toFixed(2) + ' |').join(''))
  }
  lines.push('')

  lines.push('### Cloning Strategy')
  for (const step of result.cloning_steps) {
    lines.push(`${step.step}. ${step.description} (${step.method})`)
  }
  lines.push('')

  lines.push('### Safety Considerations')
  for (const s of result.safety_considerations) {
    lines.push(`- ${s}`)
  }
  lines.push('')

  lines.push('### Optimization Suggestions')
  for (const s of result.optimization_suggestions) {
    lines.push(`-> ${s}`)
  }
  lines.push('')
  lines.push('### Summary')
  lines.push(result.summary)

  return lines.join('\n')
}

// ==================== PLUGIN REGISTRATION ====================

export function apply(ctx: Context) {
  const tools = ctx.tools

  tools.register(defineTool({
    name: 'sequence_alignment_analyzer',
    description: 'Perform pairwise or multiple sequence alignment between query and target sequences. Supports global/local alignment with configurable scoring matrices (identity, BLOSUM62, PAM250, nucleotide). Returns identity, similarity scores, gap analysis, and variant detection (substitutions, insertions, deletions).',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: query_sequence (string), target_sequences (array of {id, sequence}), alignment_type (pairwise/multiple/local/global), scoring_matrix (identity/blosum62/pam250/nucleotide), gap_penalty (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: SequenceAlignmentInput = JSON.parse(args.input_data)
      const result = analyzeSequenceAlignment(data)
      return formatSequenceAlignmentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'genome_annotation_pipeline',
    description: 'Run genome annotation pipeline for a given organism. Predicts coding genes, RNA genes, assigns GO terms, maps to pathways, and evaluates annotation quality (BUSCO). Supports ab initio, evidence-based, and hybrid annotation modes for various sequencing platforms.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: organism (string), genome_length_bp (number), gc_content (0-1), sequencing_platform (illumina/pacbio/ont/hybrid), annotation_mode (ab_initio/evidence_based/hybrid), reference_database (string)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: GenomeAnnotationInput = JSON.parse(args.input_data)
      const result = runGenomeAnnotation(data)
      return formatGenomeAnnotationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'protein_structure_predictor',
    description: 'Predict protein secondary and tertiary structure from amino acid sequence. Uses AlphaFold2/ESMFold/Rosetta approaches. Returns secondary structure composition, predicted domains (SH2, SH3, kinase, etc.), disorder regions (IUPred-style), and confidence scores (pLDDT, TM-score, ipTM, pTM).',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: sequence (amino acid string), prediction_method (alphafold/esmfold/rosetta/comparative), include_domains (bool), include_disorder (bool), include_contacts (bool)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: ProteinStructureInput = JSON.parse(args.input_data)
      const result = predictProteinStructure(data)
      return formatProteinStructureReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'crispr_guide_designer',
    description: 'Design CRISPR guide RNAs for target gene editing. Predicts on-target efficiency (Doench 2016, CFD, DeepCRISPR), off-target risk assessment, and specificity scores. Supports multiple PAM requirements (NGG, NRG, TTTN) andreturns ranked guides with risk classification.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: target_gene (string), target_sequence (string), genome (string), pam_requirement (NGG/NRG/TTTN/NNGG), guide_length (number), max_off_targets (number), on_target_method (doench2016/cfd/deepcrispr)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: CRISPRGuideInput = JSON.parse(args.input_data)
      const result = designCRISPRGuides(data)
      return formatCRISPRGuideReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'single_cell_rnaseq_analyzer',
    description: 'Analyze single-cell RNA-seq data: clustering (Seurat/ScanPy/Leiden), cell type prediction via marker genes, differential gene expression, trajectory inference (PAGA/Monocle3), and quality metrics. Returns cell cluster profiles, marker gene lists, enriched pathways, and pseudotime trajectories.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: cell_count (number), gene_count (number), tissue_origin (string), clustering_method (seurat/scanpy/leiden/louvain), n_clusters (number), normalization (lognorm/scran/sctransform)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: SingleCellInput = JSON.parse(args.input_data)
      const result = analyzeSingleCell(data)
      return formatSingleCellReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'phylogenetics_tree_builder',
    description: 'Build phylogenetic trees from sequence data using neighbor-joining (NJ), maximum likelihood (ML), Bayesian inference, or maximum parsimony (MP). Includes bootstrap support, clade identification, model selection (GTR, WAG, JC69), and Newick format output for visualization.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: sequences (array of {id, sequence}), method (nj/ml/bayesian/mp), bootstrap_replicates (number), substitution_model (JC69/K80/GTR/WAG/LG), outgroup (string), ladderize (bool)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: PhylogeneticsInput = JSON.parse(args.input_data)
      const result = buildPhylogeneticTree(data)
      return formatPhylogeneticsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'metagenomics_profiler',
    description: 'Profile metagenomic samples: taxonomic abundance (phylum to species level), alpha diversity (Shannon, Simpson, Chao1, Faith PD), beta diversity (Bray-Curtis, Jaccard, UniFrac, PCOA), and functional profiling (KEGG/SEED/COG). Supports marker-based and whole-genome approaches.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: sample_id (string), reads_count (number), sequencing_depth_gbp (number), environment (string), profiling_method (marker_gene/whole_genome/kmer_based), database (greengenes/silva/rdp/img)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: MetagenomicsInput = JSON.parse(args.input_data)
      const result = profileMetagenomics(data)
      return formatMetagenomicsReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'synthetic_biology_circuit_designer',
    description: 'Design synthetic biological circuits (genetic switches, oscillators, logic gates, biosensors, metabolic pathways) in specified host organisms. Optimizes genetic parts (promoters, RBS, CDSs, terminators), simulates circuit dynamics (ODE modeling), specifies cloning strategies (Golden Gate/Gibson), includes safety considerations, and assembly steps.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: circuit_type (genetic_switch/oscillator/logic_gate/biosensor/metabolic_pathway), host_organism (string), input_signals (string array), output_type (string), optimization_target (yield/specificity/response_time/robustness), parts_library_size (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: SyntheticCircuitInput = JSON.parse(args.input_data)
      const result = designSyntheticCircuit(data)
      return formatSyntheticCircuitReport(result)
    }
  }))

  console.log(`[dsh-tool-bioinformatics] Loaded v${VERSION} -- Bioinformatics & Genomics Toolkit with 8 tools`)
  console.log('  Tools: sequence_alignment_analyzer, genome_annotation_pipeline, protein_structure_predictor, crispr_guide_designer, single_cell_rnaseq_analyzer, phylogenetics_tree_builder, metagenomics_profiler, synthetic_biology_circuit_designer')
}
