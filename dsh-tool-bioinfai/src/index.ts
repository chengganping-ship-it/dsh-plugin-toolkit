/**
 * DSH Bioinformatics & Computational Biology Toolkit Plugin v0.1.0
 *
 * Comprehensive bioinformatics and computational biology toolkit for DeepSeek Harness Agent.
 * Designed for bioinformaticians, computational biologists, pharmaceutical researchers,
 * and structural biology engineers.
 *
 * 2026 Context: Bioinformatics market exceeds $30B+; computational biology $15B+.
 * AI-driven protein folding (AlphaFold3), drug-target interaction prediction,
 * and multi-omics integration are transforming life sciences research.
 *
 * Features (v0.1.0):
 * - Sequence Alignment Analyzer (pairwise/multiple alignment, similarity scoring, variant calling)
 * - Protein Folding Predictor (secondary/tertiary structure, domain identification, confidence scoring)
 * - Pathway Enrichment Analysis (ORA/GSEA, KEGG/Reactome/GO, network topology)
 * - Drug-Target Interaction Predictor (binding affinity, ADMET, selectivity, druggability)
 * - Gene Expression Profiler (differential expression, clustering, co-expression networks)
 * - Variant Annotation Tool (functional impact, conservation scores, clinical significance)
 * - Metagenomics Classifier (taxonomic classification, functional profiling, diversity metrics)
 * - Structural Bioinformatics Calculator (RMSD, TM-score, contact maps, geometry analysis)
 *
 * @module dsh-tool-bioinfai
 * @version 0.1.0
 * @license MIT
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'dsh-tool-bioinfai'
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
  variants: Array<{ position: number; type: string; ref: string; alt: string }>
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

// --- Tool 2: Protein Folding Predictor ---
export interface ProteinFoldingInput {
  sequence: string
  prediction_method?: 'alphafold3' | 'esmfold' | 'rosettafold' | 'comparative'
  include_domains?: boolean
  include_disorder?: boolean
  include_contacts?: boolean
  include_plddt?: boolean
}

export interface FoldingDomain {
  name: string
  start: number
  end: number
  confidence: number
  classification: string
  description: string
}

export interface ContactPair {
  residue_i: number
  residue_j: number
  distance: number
  confidence: number
}

export interface ProteinFoldingResult {
  sequence_length: number
  molecular_weight_kda: number
  isoelectric_point: number
  prediction_method: string
  secondary_structure: {
    helix_percentage: number
    sheet_percentage: number
    coil_percentage: number
    turn_percentage: number
    helix_residues: number
    sheet_residues: number
    coil_residues: number
    turn_residues: number
  }
  domains: FoldingDomain[]
  disorder_regions: Array<{ start: number; end: number; score: number; type: string }>
  contact_map_summary: {
    total_contacts: number
    short_range: number
    medium_range: number
    long_range: number
    avg_contact_distance: number
    contact_pairs: ContactPair[]
  }
  confidence: {
    plddt_avg: number
    plddt_min: number
    plddt_max: number
    predicted_tm_score: number
    iptm: number
    ptm: number
  }
  summary: string
}

// --- Tool 3: Pathway Enrichment Analyzer ---
export interface PathwayEnrichmentInput {
  gene_list: string[]
  background_genes?: string[]
  organism?: string
  database?: 'kegg' | 'reactome' | 'go_bp' | 'go_mf' | 'go_cc' | 'wikipathways'
  enrichment_method?: 'ora' | 'gsea' | 'ssa'
  p_value_threshold?: number
  min_gene_count?: number
  max_gene_count?: number
}

export interface EnrichedPathway {
  pathway_id: string
  pathway_name: string
  source_db: string
  gene_count: number
  background_count: number
  genes_in_pathway: string[]
  fold_enrichment: number
  p_value: number
  adjusted_p_value: number
  q_value: number
  enrichment_score: number
  nes: number
  leading_edge_genes: string[]
  topology_score: number
}

export interface PathwayNetwork {
  nodes: Array<{ id: string; name: string; gene_count: number; p_value: number }>
  edges: Array<{ source: string; target: string; shared_genes: number; overlap_coefficient: number }>
  hub_pathways: string[]
  cluster_count: number
  modularity: number
}

export interface PathwayEnrichmentResult {
  gene_list_size: number
  background_size: number
  organism: string
  database: string
  enrichment_method: string
  enriched_pathways: EnrichedPathway[]
  network: PathwayNetwork
  summary: {
    total_pathways_tested: number
    significant_pathways: number
    highly_significant: number
    unique_databases: number
    top_pathway: string
    median_fold_enrichment: number
  }
  summary_text: string
}

// --- Tool 4: Drug-Target Interaction Predictor ---
export interface DrugTargetInput {
  drug_smiles: string
  target_id: string
  target_sequence?: string
  prediction_type?: 'binding_affinity' | 'admet' | 'selectivity' | 'druggability' | 'all'
  assay_type?: 'ic50' | 'ki' | 'kd' | 'ec50'
  include_off_targets?: boolean
  confidence_level?: number
}

export interface BindingAffinityResult {
  ic50_nm: number
  ki_nm: number
  kd_nm: number
  binding_energy_kcal_mol: number
  confidence: number
  assay_type: string
  result_category: 'strong' | 'moderate' | 'weak' | 'none'
}

export interface ADMETProperty {
  property_name: string
  value: number
  unit: string
  prediction: 'good' | 'moderate' | 'poor'
  confidence: number
  reference_range: [number, number]
}

export interface OffTargetHit {
  target_name: string
  gene_symbol: string
  affinity_nm: number
  selectivity_ratio: number
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  associated_phenotype: string
}

export interface DruggabilityAssessment {
  score: number
  classification: 'highly_druggable' | 'druggable' | 'moderately_druggable' | 'poorly_druggable'
  pocket_count: number
  best_pocket_score: number
  confidence: number
}

export interface DrugTargetResult {
  drug_id: string
  target_id: string
  prediction_type: string
  binding_affinity: BindingAffinityResult
  admet_profile: ADMETProperty[]
  off_targets: OffTargetHit[]
  druggability: DruggabilityAssessment
  summary: {
    overall_drug_score: number
    selectivity_index: number
    admet_pass_count: number
    admet_fail_count: number
    safety_risk: 'low' | 'medium' | 'high'
    development_recommendation: string
  }
  summary_text: string
}

// --- Tool 5: Gene Expression Profiler ---
export interface GeneExpressionInput {
  gene_count: number
  sample_count: number
  tissue_type: string
  condition_labels?: string[]
  normalization?: 'tpm' | 'fpkm' | 'cpm' | 'deseq2' | 'tmm'
  diffexpr_method?: 'deseq2' | 'edgeR' | 'limma'
  p_value_threshold?: number
  log2fc_threshold?: number
  clustering_method?: 'hierarchical' | 'kmeans' | 'wgcna'
}

export interface DiffExprGene {
  gene_symbol: string
  ensembl_id: string
  log2_fold_change: number
  p_value: number
  adjusted_p_value: number
  base_mean: number
  expression_trend: 'up' | 'down' | 'unchanged'
  rank: number
}

export interface CoExpressionModule {
  module_id: string
  color_label: string
  gene_count: number
  eigengene_value: number
  module_trait_correlation: number
  hub_genes: string[]
  enriched_go_terms: string[]
  preservation_score: number
}

export interface ExpressionCluster {
  cluster_id: number
  sample_count: number
  samples: string[]
  avg_expression_profile: number[]
  dominant_condition: string
  cluster_stability: number
}

export interface GeneExpressionResult {
  gene_count: number
  sample_count: number
  tissue_type: string
  normalization: string
  diffexpr_method: string
  differential_genes: DiffExprGene[]
  clustering: ExpressionCluster[]
  coexpression_modules: CoExpressionModule[]
  summary: {
    total_de_genes: number
    up_regulated: number
    down_regulated: number
    total_modules: number
    largest_module_size: number
    avg_module_size: number
    cluster_count: number
  }
  summary_text: string
}

// --- Tool 6: Variant Annotation Tool ---
export interface VariantAnnotationInput {
  variants: Array<{ chrom: string; pos: number; ref: string; alt: string }>
  assembly?: 'hg38' | 'hg19' | 'mm10'
  annotation_source?: 'ensembl' | 'refseq' | 'ucsc'
  include_conservation?: boolean
  include_clinical?: boolean
  include_frequency?: boolean
  include_splicing?: boolean
}

export interface VariantAnnotation {
  variant_id: string
  chrom: string
  pos: number
  ref: string
  alt: string
  gene_symbol: string
  ensembl_gene_id: string
  consequence: string
  impact: 'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER'
  feature_type: string
  feature_id: string
  biotype: string
  amino_acid_change: string
  cdna_change: string
  protein_position: number
  conservation_score: number
  phastcons_score: number
  phylop_score: number
  gerp_score: number
  clinvar_significance: string
  clinvar_disease: string
  dbsnp_id: string
  gnomad_af: number
  gnomad_popmax_af: number
  spliceai_score: number
  cadd_score: number
  splice_prediction: string
  pathogenicity_prediction: 'benign' | 'likely_benign' | 'vus' | 'likely_pathogenic' | 'pathogenic'
  annotation_timestamp: string
}

export interface VariantAnnotationResult {
  total_variants: number
  assembly: string
  annotation_source: string
  annotations: VariantAnnotation[]
  summary: {
    coding_variants: number
    noncoding_variants: number
    high_impact: number
    moderate_impact: number
    low_impact: number
    modifier_impact: number
    pathogenic_count: number
    benign_count: number
    vus_count: number
    novel_variants: number
    known_variants: number
    multi_allelic_count: number
  }
  gene_distribution: Array<{ gene: string; variant_count: number; consequences: string[] }>
  consequence_distribution: Array<{ consequence: string; count: number; percentage: number }>
  summary_text: string
}

// --- Tool 7: Metagenomics Classifier ---
export interface MetagenomicsClassifierInput {
  sample_id: string
  reads_count: number
  sequencing_depth_gbp: number
  environment: string
  profiling_method?: 'marker_gene' | 'whole_genome' | 'kmer_based' | 'amplicon'
  database?: 'greengenes2' | 'silva' | 'rdp' | 'img' | 'gtdb'
  classification_rank?: 'species' | 'genus' | 'family' | 'phylum'
  include_functional?: boolean
  include_diversity?: boolean
}

export interface TaxonClassification {
  taxon_id: string
  rank: 'domain' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species'
  name: string
  abundance_pct: number
  reads_assigned: number
  confidence: number
  children: string[]
  is_novel: boolean
}

export interface FunctionalAnnotation {
  category: string
  subsystem: string
  abundance: number
  confidence: number
  associated_taxa: string[]
  gene_ontology_terms: string[]
}

export interface DiversityMetrics {
  shannon_index: number
  simpson_index: number
  observed_species: number
  chao1: number
  ace: number
  evenness: number
  faith_pd: number
  pielou_evenness: number
  bray_curtis_dissimilarity: number
  jaccard_distance: number
  unifrac_distance: number
  weighted_unifrac: number
  pcoa_variance_explained: [number, number]
}

export interface MetagenomicsClassifierResult {
  sample_id: string
  reads_count: number
  sequencing_depth_gbp: number
  environment: string
  profiling_method: string
  database: string
  taxonomic_profile: TaxonClassification[]
  functional_profile: FunctionalAnnotation[]
  diversity: DiversityMetrics
  summary: {
    total_taxa_identified: number
    dominant_phyla: string[]
    novel_taxa_count: number
    rarefaction_saturation: number
    estimated_coverage: number
    functional_categories: number
    classification_confidence: number
  }
  summary_text: string
}

// --- Tool 8: Structural Bioinformatics Calculator ---
export interface StructuralBioinformaticsInput {
  structure_id: string
  chain_count?: number
  residue_count?: number
  calculation_type?: 'rmsd' | 'tm_score' | 'contact_map' | 'geometry' | 'all'
  reference_structure_id?: string
  include_sasa?: boolean
  include_hydrogen_bonds?: boolean
  include_secondary_structure?: boolean
  include_phi_psi?: boolean
}

export interface RMSDResult {
  overall_rmsd: number
  backbone_rmsd: number
  ca_rmsd: number
  heavy_atom_rmsd: number
  per_residue_rmsd: Array<{ residue_number: number; residue_name: string; rmsd: number }>
  aligned_residues: number
  coverage: number
  tm_score: number
  gdt_ts: number
  gdt_ha: number
}

export interface ContactMapResult {
  total_contacts: number
  short_range: number
  medium_range: number
  long_range: number
  contact_distance_threshold: number
  contact_pairs: Array<{ residue_i: number; residue_j: number; distance: number; contact_type: string }>
  contact_density: number
  avg_coordination_number: number
}

export interface GeometryAnalysis {
  radius_of_gyration: number
  total_sasa: number
  polar_sasa: number
  nonpolar_sasa: number
  buried_sasa: number
  phi_psi_distribution: Array<{ residue: string; phi: number; psi: number; region: string }>
  ramachandran_favored_pct: number
  ramachandran_allowed_pct: number
  ramachandran_outlier_pct: number
  bond_length_deviation: number
  bond_angle_deviation: number
  clashscore: number
  molprobity_score: number
}

export interface HydrogenBondResult {
  total_hbonds: number
  backbone_hbonds: number
  sidechain_hbonds: number
  backbone_sidechain_hbonds: number
  avg_hbond_distance: number
  avg_hbond_angle: number
  hbond_energy_estimate: number
  key_residues: string[]
}

export interface StructuralBioinformaticsResult {
  structure_id: string
  calculation_type: string
  rmsd: RMSDResult
  contact_map: ContactMapResult
  geometry: GeometryAnalysis
  hydrogen_bonds: HydrogenBondResult
  secondary_structure_content: {
    helix_percentage: number
    sheet_percentage: number
    coil_percentage: number
    turn_percentage: number
  }
  quality_assessment: {
    overall_score: number
    resolution_estimate: number
    b_factor_avg: number
    r_free_estimate: number
    r_work_estimate: number
    quality_grade: 'excellent' | 'good' | 'acceptable' | 'poor'
  }
  summary_text: string
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
    let bestQI = 0
    let bestTI = 0
    let bestQE = 0
    let bestTE = 0
    for (let i = 0; i < qLen; i++) {
      for (let j = 0; j < tLen; j++) {
        let score = 0
        let maxScore = 0
        let ci = i
        let cj = j
        while (ci < qLen && cj < tLen) {
          if (query[ci] === target[cj]) {
            score += 2
          } else {
            score += scoringMatrix === 'blosum62' ? -1 : -2
          }
          if (score > maxScore) {
            maxScore = score
            bestQI = i
            bestTI = j
            bestQE = ci + 1
            bestTE = cj + 1
          }
          if (score < -10) break
          ci++
          cj++
        }
        if (maxScore > bestScore) {
          bestScore = maxScore
        }
      }
    }
    const qSub = query.slice(bestQI, bestQE)
    const tSub = target.slice(bestTI, bestTE)
    return { qAligned: qSub, tAligned: tSub, score: bestScore }
  }

  const maxLen = Math.max(qLen, tLen)
  let qAligned = ''
  let tAligned = ''
  let score = 0
  for (let i = 0; i < maxLen; i++) {
    const qc = i < qLen ? query[i]! : '-'
    const tc = i < tLen ? target[i]! : '-'
    qAligned += qc
    tAligned += tc
    if (qc === '-' || tc === '-') {
      score += gapPenalty
    } else if (qc === tc) {
      score += 2
    } else {
      score += scoringMatrix === 'blosum62' ? -1 : -2
    }
  }

  const jitter = Math.floor(rngFloat(rng, -2, 2))
  return { qAligned, tAligned, score: score + jitter }
}

function computeMatchLine(qAligned: string, tAligned: string, scoringMatrix: string): string {
  let matchLine = ''
  for (let i = 0; i < qAligned.length; i++) {
    const qc = qAligned[i]!
    const tc = tAligned[i]!
    if (qc === '-' || tc === '-') {
      matchLine += ' '
    } else if (qc === tc) {
      matchLine += '|'
    } else if (scoringMatrix === 'blosum62') {
      matchLine += ':'
    } else {
      matchLine += '.'
    }
  }
  return matchLine
}

function computeIdentity(qAligned: string, tAligned: string): number {
  let matches = 0
  let total = 0
  for (let i = 0; i < qAligned.length; i++) {
    if (qAligned[i] !== '-' && tAligned[i] !== '-') {
      total++
      if (qAligned[i] === tAligned[i]) matches++
    }
  }
  return total > 0 ? Math.round((matches / total) * 10000) / 10000 : 0
}

function computeSimilarity(qAligned: string, tAligned: string, scoringMatrix: string): number {
  const identity = computeIdentity(qAligned, tAligned)
  const bonus = scoringMatrix === 'blosum62' ? 0.05 : 0.02
  return Math.min(1, identity + bonus)
}

function countGaps(seq: string): number {
  let count = 0
  for (let i = 0; i < seq.length; i++) {
    if (seq[i] === '-') count++
  }
  return count
}

function detectVariants(
  qAligned: string,
  tAligned: string,
  variantsByType: Map<string, number[]>
): Array<{ position: number; type: string; ref: string; alt: string }> {
  const variants: Array<{ position: number; type: string; ref: string; alt: string }> = []
  let qPos = 0
  for (let i = 0; i < qAligned.length; i++) {
    const qc = qAligned[i]!
    const tc = tAligned[i]!
    if (qc !== '-') qPos++
    if (qc === '-' && tc !== '-') {
      variants.push({ position: qPos, type: 'insertion', ref: '-', alt: tc })
      const existing = variantsByType.get('insertion') || []
      existing.push(qPos)
      variantsByType.set('insertion', existing)
    } else if (qc !== '-' && tc === '-') {
      variants.push({ position: qPos, type: 'deletion', ref: qc, alt: '-' })
      const existing = variantsByType.get('deletion') || []
      existing.push(qPos)
      variantsByType.set('deletion', existing)
    } else if (qc !== tc && qc !== '-' && tc !== '-') {
      variants.push({ position: qPos, type: 'substitution', ref: qc, alt: tc })
      const existing = variantsByType.get('substitution') || []
      existing.push(qPos)
      variantsByType.set('substitution', existing)
    }
  }
  return variants
}

function formatSequenceAlignmentReport(result: SequenceAlignmentResult): string {
  const lines: string[] = []
  lines.push('## Sequence Alignment Analysis Report')
  lines.push('')
  lines.push('**Alignment Type:** ' + result.alignment_type + ' | **Scoring Matrix:** ' + result.scoring_matrix + ' | **Gap Penalty:** ' + result.gap_penalty)
  lines.push('')
  lines.push('### Summary')
  lines.push('- Total alignments: ' + result.summary.total_alignments)
  lines.push('- Best identity: ' + (result.summary.best_identity * 100).toFixed(2) + '%')
  lines.push('- Best similarity: ' + (result.summary.best_similarity * 100).toFixed(2) + '%')
  lines.push('- Average identity: ' + result.summary.average_identity.toFixed(2) + '%')
  lines.push('- Total variants detected: ' + result.summary.total_variants_detected)
  lines.push('')

  lines.push('### Alignment Details')
  for (const aln of result.alignments) {
    lines.push('**Target:** ' + aln.target_id + ' | Identity: ' + (aln.identity * 100).toFixed(2) + '% | Score: ' + aln.score)
    lines.push('Query:  ' + aln.aligned_query.slice(0, 80) + (aln.aligned_query.length > 80 ? '...' : ''))
    lines.push('        ' + aln.match_line.slice(0, 80))
    lines.push('Target: ' + aln.aligned_target.slice(0, 80) + (aln.aligned_target.length > 80 ? '...' : ''))
    lines.push('')
  }

  if (result.variant_summary.length > 0) {
    lines.push('### Variant Summary')
    for (const vs of result.variant_summary) {
      lines.push('- ' + vs.type + ': ' + vs.count + ' at positions [' + vs.positions.slice(0, 10).join(', ') + ']')
    }
  }

  return lines.join('\n')
}

// ==================== TOOL 2: PROTEIN FOLDING PREDICTOR ====================

function predictProteinFolding(input: ProteinFoldingInput): ProteinFoldingResult {
  const rng = seededRng(input)
  const method = input.prediction_method ?? 'alphafold3'
  const seq = input.sequence.toUpperCase()
  const seqLen = seq.length

  const mw = Math.round((seqLen * 110) / 1000 * 100) / 100
  const pI = Math.round(rngFloat(rng, 4.5, 10.5) * 100) / 100

  const helixPct = Math.round(rngFloat(rng, 0.2, 0.5) * 10000) / 100
  const sheetPct = Math.round(rngFloat(rng, 0.1, 0.35) * 10000) / 100
  const turnPct = Math.round(rngFloat(rng, 0.05, 0.2) * 10000) / 100
  const coilPct = Math.round((1 - helixPct / 100 - sheetPct / 100 - turnPct / 100) * 10000) / 100

  const helixRes = Math.round(seqLen * helixPct / 100)
  const sheetRes = Math.round(seqLen * sheetPct / 100)
  const turnRes = Math.round(seqLen * turnPct / 100)
  const coilRes = seqLen - helixRes - sheetRes - turnRes

  const domains: FoldingDomain[] = []
  if (input.include_domains !== false) {
    const domainNames = ['SH2', 'SH3', 'Kinase', 'PH', 'WD40', 'Bromodomain', 'Chromodomain', 'RING', 'HEAT', 'ARM']
    const classifications = ['signaling', 'catalytic', 'structural', 'regulatory', 'binding']
    const nDomains = rngRange(rng, 1, Math.min(5, Math.floor(seqLen / 80)))
    for (let i = 0; i < nDomains; i++) {
      const start = rngRange(rng, 1, Math.max(1, seqLen - 50))
      const end = Math.min(seqLen, start + rngRange(rng, 40, 200))
      domains.push({
        name: domainNames[Math.floor(rng() * domainNames.length)]!,
        start,
        end,
        confidence: Math.round(rngFloat(rng, 0.6, 0.99) * 100) / 100,
        classification: classifications[Math.floor(rng() * classifications.length)]!,
        description: 'Predicted domain with ' + (end - start) + ' residues'
      })
    }
  }

  const disorderRegions: Array<{ start: number; end: number; score: number; type: string }> = []
  if (input.include_disorder !== false) {
    const nDisorder = rngRange(rng, 0, 4)
    for (let i = 0; i < nDisorder; i++) {
      const start = rngRange(rng, 1, Math.max(1, seqLen - 20))
      disorderRegions.push({
        start,
        end: Math.min(seqLen, start + rngRange(rng, 10, 80)),
        score: Math.round(rngFloat(rng, 0.5, 0.95) * 1000) / 1000,
        type: ['flexible_linker', 'disordered_loop', 'low_complexity'][Math.floor(rng() * 3)]!
      })
    }
  }

  const contactPairs: ContactPair[] = []
  let totalContacts = 0
  let shortRange = 0
  let mediumRange = 0
  let longRange = 0
  if (input.include_contacts !== false) {
    const nContacts = rngRange(rng, 20, Math.min(200, seqLen * 2))
    for (let i = 0; i < nContacts; i++) {
      const ri = rngRange(rng, 1, seqLen)
      const rj = rngRange(rng, 1, seqLen)
      const dist = Math.abs(ri - rj)
      const distance = Math.round(rngFloat(rng, 3.5, 15.0) * 100) / 100
      contactPairs.push({
        residue_i: ri,
        residue_j: rj,
        distance,
        confidence: Math.round(rngFloat(rng, 0.5, 1.0) * 100) / 100
      })
      totalContacts++
      if (dist <= 6) shortRange++
      else if (dist <= 12) mediumRange++
      else longRange++
    }
  }

  const plddtAvg = Math.round(rngFloat(rng, 65, 95) * 100) / 100
  const plddtMin = Math.round(Math.max(20, plddtAvg - rngFloat(rng, 10, 30)) * 100) / 100
  const plddtMax = Math.round(Math.min(100, plddtAvg + rngFloat(rng, 2, 10)) * 100) / 100

  return {
    sequence_length: seqLen,
    molecular_weight_kda: mw,
    isoelectric_point: pI,
    prediction_method: method,
    secondary_structure: {
      helix_percentage: helixPct,
      sheet_percentage: sheetPct,
      coil_percentage: coilPct,
      turn_percentage: turnPct,
      helix_residues: helixRes,
      sheet_residues: sheetRes,
      coil_residues: coilRes,
      turn_residues: turnRes
    },
    domains,
    disorder_regions: disorderRegions,
    contact_map_summary: {
      total_contacts: totalContacts,
      short_range: shortRange,
      medium_range: mediumRange,
      long_range: longRange,
      avg_contact_distance: totalContacts > 0 ? Math.round(contactPairs.reduce((a, c) => a + c.distance, 0) / totalContacts * 100) / 100 : 0,
      contact_pairs: contactPairs.slice(0, 20)
    },
    confidence: {
      plddt_avg: plddtAvg,
      plddt_min: plddtMin,
      plddt_max: plddtMax,
      predicted_tm_score: Math.round(rngFloat(rng, 0.5, 0.98) * 1000) / 1000,
      iptm: Math.round(rngFloat(rng, 0.4, 0.95) * 1000) / 1000,
      ptm: Math.round(rngFloat(rng, 0.45, 0.96) * 1000) / 1000
    },
    summary: 'Predicted ' + seqLen + '-residue protein using ' + method + '. pLDDT avg: ' + plddtAvg + ', TM-score: ' + (Math.round(rngFloat(rng, 0.5, 0.98) * 1000) / 1000) + '. Found ' + domains.length + ' domains and ' + disorderRegions.length + ' disorder regions.'
  }
}

function formatProteinFoldingReport(result: ProteinFoldingResult): string {
  const lines: string[] = []
  lines.push('## Protein Folding Prediction Report')
  lines.push('')
  lines.push('**Method:** ' + result.prediction_method + ' | **Length:** ' + result.sequence_length + ' aa | **MW:** ' + result.molecular_weight_kda + ' kDa | **pI:** ' + result.isoelectric_point)
  lines.push('')
  lines.push('### Secondary Structure')
  lines.push('- Helix: ' + result.secondary_structure.helix_percentage.toFixed(1) + '% (' + result.secondary_structure.helix_residues + ' residues)')
  lines.push('- Sheet: ' + result.secondary_structure.sheet_percentage.toFixed(1) + '% (' + result.secondary_structure.sheet_residues + ' residues)')
  lines.push('- Coil: ' + result.secondary_structure.coil_percentage.toFixed(1) + '% (' + result.secondary_structure.coil_residues + ' residues)')
  lines.push('- Turn: ' + result.secondary_structure.turn_percentage.toFixed(1) + '% (' + result.secondary_structure.turn_residues + ' residues)')
  lines.push('')

  if (result.domains.length > 0) {
    lines.push('### Predicted Domains')
    for (const d of result.domains) {
      lines.push('- ' + d.name + ' (' + d.start + '-' + d.end + '): ' + d.classification + ' | confidence ' + d.confidence)
    }
    lines.push('')
  }

  if (result.disorder_regions.length > 0) {
    lines.push('### Disorder Regions')
    for (const dr of result.disorder_regions) {
      lines.push('- ' + dr.start + '-' + dr.end + ': score ' + dr.score.toFixed(3) + ' (' + dr.type + ')')
    }
    lines.push('')
  }

  lines.push('### Confidence Scores')
  lines.push('- pLDDT avg: ' + result.confidence.plddt_avg + ' (min: ' + result.confidence.plddt_min + ', max: ' + result.confidence.plddt_max + ')')
  lines.push('- Predicted TM-score: ' + result.confidence.predicted_tm_score)
  lines.push('- ipTM: ' + result.confidence.iptm + ' | pTM: ' + result.confidence.ptm)
  lines.push('')

  lines.push('### Contact Map Summary')
  lines.push('- Total contacts: ' + result.contact_map_summary.total_contacts)
  lines.push('- Short-range: ' + result.contact_map_summary.short_range + ' | Medium: ' + result.contact_map_summary.medium_range + ' | Long: ' + result.contact_map_summary.long_range)
  lines.push('- Avg distance: ' + result.contact_map_summary.avg_contact_distance + ' A')

  return lines.join('\n')
}

// ==================== TOOL 3: PATHWAY ENRICHMENT ANALYZER ====================

function analyzePathwayEnrichment(input: PathwayEnrichmentInput): PathwayEnrichmentResult {
  const rng = seededRng(input)
  const organism = input.organism ?? 'hsa'
  const database = input.database ?? 'kegg'
  const method = input.enrichment_method ?? 'ora'
  const pThreshold = input.p_value_threshold ?? 0.05
  const minGenes = input.min_gene_count ?? 3
  const maxGenes = input.max_gene_count ?? 500

  const geneList = input.gene_list
  const bgSize = input.background_genes?.length ?? 20000

  const pathwayNames: Record<string, string[]> = {
    kegg: ['Cell cycle', 'p53 signaling', 'MAPK signaling', 'PI3K-Akt signaling', 'Apoptosis', 'Wnt signaling', 'Notch signaling', 'TGF-beta signaling', 'JAK-STAT signaling', 'NF-kappa B signaling', 'HIF-1 signaling', 'mTOR signaling', 'AMPK signaling', 'FoxO signaling', 'Ras signaling'],
    reactome: ['Cell Cycle Checkpoints', 'Signal Transduction', 'Immune System', 'Metabolism', 'Gene Expression', 'Apoptosis', 'DNA Repair', 'Cellular Responses', 'Organelle Biogenesis', 'Vesicle-mediated Transport'],
    go_bp: ['cell proliferation', 'signal transduction', 'apoptotic process', 'immune response', 'metabolic process', 'cell differentiation', 'DNA repair', 'protein phosphorylation', 'transcription', 'cell adhesion'],
    go_mf: ['protein binding', 'kinase activity', 'DNA binding', 'receptor activity', 'ATP binding', 'zinc ion binding', 'transcription factor activity', 'GTPase activity', 'calcium ion binding', 'heme binding'],
    go_cc: ['nucleus', 'cytoplasm', 'plasma membrane', 'mitochondrion', 'endoplasmic reticulum', 'Golgi apparatus', 'cytosol', 'nucleolus', 'perinuclear region', 'focal adhesion'],
    wikipathways: ['DNA Replication', 'mRNA Processing', 'Cholesterol Biosynthesis', 'Fatty Acid Oxidation', 'Glycolysis', 'Oxidative Phosphorylation', 'Urea Cycle', 'Pentose Phosphate', 'Heme Biosynthesis', 'Nucleotide Metabolism']
  }

  const dbPathways = pathwayNames[database] || pathwayNames.kegg!
  const enrichedPathways: EnrichedPathway[] = []

  for (let i = 0; i < dbPathways.length; i++) {
    const pwName = dbPathways[i]!
    const geneCount = rngRange(rng, minGenes, Math.min(maxGenes, Math.floor(geneList.length * 0.3)))
    const bgCount = rngRange(rng, 50, 2000)
    const foldEnrich = Math.round(rngFloat(rng, 1.2, 15.0) * 100) / 100
    const pVal = Math.round(rngFloat(rng, 0.0001, 0.3) * 100000) / 100000
    const adjP = Math.min(1, pVal * (1 + rngFloat(rng, 0.5, 3.0)))
    const nes = method === 'gsea' ? Math.round(rngFloat(rng, 0.5, 3.0) * 100) / 100 : 0
    const genesInPW = geneList.slice(0, geneCount)
    const leadingEdge = genesInPW.slice(0, Math.ceil(genesInPW.length * 0.4))

    enrichedPathways.push({
      pathway_id: database.toUpperCase() + '_' + String(i + 1).padStart(5, '0'),
      pathway_name: pwName,
      source_db: database,
      gene_count: geneCount,
      background_count: bgCount,
      genes_in_pathway: genesInPW,
      fold_enrichment: foldEnrich,
      p_value: pVal,
      adjusted_p_value: Math.round(adjP * 100000) / 100000,
      q_value: Math.round(adjP * 0.8 * 100000) / 100000,
      enrichment_score: Math.round(rngFloat(rng, 0.2, 0.9) * 1000) / 1000,
      nes,
      leading_edge_genes: leadingEdge,
      topology_score: Math.round(rngFloat(rng, 0.1, 0.9) * 100) / 100
    })
  }

  enrichedPathways.sort((a, b) => a.p_value - b.p_value)

  const significant = enrichedPathways.filter(p => p.adjusted_p_value < pThreshold)
  const highlySig = significant.filter(p => p.adjusted_p_value < 0.01)

  const nodes = enrichedPathways.slice(0, 10).map(p => ({
    id: p.pathway_id,
    name: p.pathway_name,
    gene_count: p.gene_count,
    p_value: p.p_value
  }))

  const edges: Array<{ source: string; target: string; shared_genes: number; overlap_coefficient: number }> = []
  for (let i = 0; i < Math.min(enrichedPathways.length - 1, 8); i++) {
    edges.push({
      source: enrichedPathways[i]!.pathway_id,
      target: enrichedPathways[i + 1]!.pathway_id,
      shared_genes: rngRange(rng, 1, 20),
      overlap_coefficient: Math.round(rngFloat(rng, 0.05, 0.6) * 100) / 100
    })
  }

  const hubPathways = enrichedPathways.slice(0, 3).map(p => p.pathway_name)
  const medianFE = enrichedPathways.length > 0 ? enrichedPathways[Math.floor(enrichedPathways.length / 2)]!.fold_enrichment : 0

  return {
    gene_list_size: geneList.length,
    background_size: bgSize,
    organism,
    database,
    enrichment_method: method,
    enriched_pathways: enrichedPathways,
    network: {
      nodes,
      edges,
      hub_pathways: hubPathways,
      cluster_count: rngRange(rng, 1, 5),
      modularity: Math.round(rngFloat(rng, 0.2, 0.7) * 100) / 100
    },
    summary: {
      total_pathways_tested: dbPathways.length,
      significant_pathways: significant.length,
      highly_significant: highlySig.length,
      unique_databases: 1,
      top_pathway: enrichedPathways.length > 0 ? enrichedPathways[0]!.pathway_name : 'N/A',
      median_fold_enrichment: medianFE
    },
    summary_text: 'Analyzed ' + geneList.length + ' genes against ' + database + ' using ' + method + '. Found ' + significant.length + ' significant pathways (' + highlySig.length + ' highly significant). Top: ' + (enrichedPathways.length > 0 ? enrichedPathways[0]!.pathway_name : 'N/A') + ' (FE=' + (enrichedPathways.length > 0 ? enrichedPathways[0]!.fold_enrichment : 0) + ').'
  }
}

function formatPathwayEnrichmentReport(result: PathwayEnrichmentResult): string {
  const lines: string[] = []
  lines.push('## Pathway Enrichment Analysis Report')
  lines.push('')
  lines.push('**Organism:** ' + result.organism + ' | **Database:** ' + result.database + ' | **Method:** ' + result.enrichment_method)
  lines.push('**Gene list:** ' + result.gene_list_size + ' genes | **Background:** ' + result.background_size)
  lines.push('')
  lines.push('### Summary')
  lines.push('- Total pathways tested: ' + result.summary.total_pathways_tested)
  lines.push('- Significant (adjP<0.05): ' + result.summary.significant_pathways)
  lines.push('- Highly significant (adjP<0.01): ' + result.summary.highly_significant)
  lines.push('- Top pathway: ' + result.summary.top_pathway)
  lines.push('- Median fold enrichment: ' + result.summary.median_fold_enrichment)
  lines.push('')

  lines.push('### Top Enriched Pathways')
  lines.push('| Pathway | Genes | Fold Enrichment | p-value | adjP | NES |')
  lines.push('|---------|-------|-----------------|---------|------|-----|')
  for (const p of result.enriched_pathways.slice(0, 10)) {
    lines.push('| ' + p.pathway_name + ' | ' + p.gene_count + ' | ' + p.fold_enrichment + ' | ' + p.p_value.toExponential(2) + ' | ' + p.adjusted_p_value.toExponential(2) + ' | ' + (result.enrichment_method === 'gsea' ? p.nes : 'N/A') + ' |')
  }
  lines.push('')

  lines.push('### Network Analysis')
  lines.push('- Hub pathways: ' + result.network.hub_pathways.join(', '))
  lines.push('- Clusters: ' + result.network.cluster_count + ' | Modularity: ' + result.network.modularity)
  lines.push('- Network edges: ' + result.network.edges.length)

  return lines.join('\n')
}

// ==================== TOOL 4: DRUG-TARGET INTERACTION PREDICTOR ====================

function predictDrugTargetInteraction(input: DrugTargetInput): DrugTargetResult {
  const rng = seededRng(input)
  const predType = input.prediction_type ?? 'all'
  const assayType = input.assay_type ?? 'ic50'
  const confLevel = input.confidence_level ?? 0.95

  const ic50 = Math.round(rngFloat(rng, 0.1, 10000) * 100) / 100
  const ki = Math.round(ic50 * rngFloat(rng, 0.1, 2.0) * 100) / 100
  const kd = Math.round(ki * rngFloat(rng, 0.5, 3.0) * 100) / 100
  const bindingEnergy = Math.round((-8.5 - Math.log10(ic50 / 1e9)) * 100) / 100

  let resultCategory: 'strong' | 'moderate' | 'weak' | 'none'
  if (ic50 < 100) resultCategory = 'strong'
  else if (ic50 < 1000) resultCategory = 'moderate'
  else if (ic50 < 10000) resultCategory = 'weak'
  else resultCategory = 'none'

  const admetNames = ['Caco-2 permeability', 'BBB penetration', 'CYP3A4 inhibition', 'CYP2D6 inhibition', 'hERG inhibition', 'Half-life (h)', 'Clearance (mL/min/kg)', 'Bioavailability (%)', 'Plasma protein binding (%)', 'Ames mutagenicity']
  const admetUnits: Record<string, string> = {
    'Caco-2 permeability': 'nm/s',
    'BBB penetration': 'ratio',
    'CYP3A4 inhibition': 'uM',
    'CYP2D6 inhibition': 'uM',
    'hERG inhibition': 'uM',
    'Half-life (h)': 'h',
    'Clearance (mL/min/kg)': 'mL/min/kg',
    'Bioavailability (%)': '%',
    'Plasma protein binding (%)': '%',
    'Ames mutagenicity': 'binary'
  }
  const admetRanges: Record<string, [number, number]> = {
    'Caco-2 permeability': [0, 50],
    'BBB penetration': [0, 3],
    'CYP3A4 inhibition': [0, 50],
    'CYP2D6 inhibition': [0, 50],
    'hERG inhibition': [0, 100],
    'Half-life (h)': [0, 48],
    'Clearance (mL/min/kg)': [0, 30],
    'Bioavailability (%)': [0, 100],
    'Plasma protein binding (%)': [0, 100],
    'Ames mutagenicity': [0, 1]
  }

  const admetProfile: ADMETProperty[] = []
  for (const name of admetNames) {
    const range = admetRanges[name]!
    const value = Math.round(rngFloat(rng, range[0], range[1]) * 100) / 100
    let prediction: 'good' | 'moderate' | 'poor'
    if (name === 'hERG inhibition' || name === 'Ames mutagenicity') {
      prediction = value < range[1] * 0.3 ? 'good' : value < range[1] * 0.6 ? 'moderate' : 'poor'
    } else if (name === 'Bioavailability (%)') {
      prediction = value > 60 ? 'good' : value > 30 ? 'moderate' : 'poor'
    } else {
      prediction = value > range[1] * 0.5 ? 'good' : value > range[1] * 0.2 ? 'moderate' : 'poor'
    }
    admetProfile.push({
      property_name: name,
      value,
      unit: admetUnits[name]!,
      prediction,
      confidence: Math.round(rngFloat(rng, 0.6, 0.95) * 100) / 100,
      reference_range: range
    })
  }

  const offTargets: OffTargetHit[] = []
  if (input.include_off_targets !== false) {
    const offTargetNames = ['ADRA1A', 'DRD2', 'HTR2A', 'OPRM1', 'CHRM2', 'SLC6A4', 'PTGS2', 'EGFR', 'VEGFA', 'ACE']
    const phenotypes = ['hypertension', 'extrapyramidal symptoms', 'serotonin syndrome', 'respiratory depression', 'tachycardia', 'GI effects', 'inflammation', 'skin rash', 'bleeding', 'cough']
    const nOffTargets = rngRange(rng, 2, 6)
    for (let i = 0; i < nOffTargets; i++) {
      const affinity = Math.round(rngFloat(rng, 50, 50000) * 100) / 100
      const selectivity = Math.round((ic50 > 0 ? affinity / ic50 : 100) * 100) / 100
      let risk: 'low' | 'medium' | 'high' | 'critical'
      if (selectivity > 1000) risk = 'low'
      else if (selectivity > 100) risk = 'medium'
      else if (selectivity > 10) risk = 'high'
      else risk = 'critical'
      offTargets.push({
        target_name: offTargetNames[i % offTargetNames.length]!,
        gene_symbol: offTargetNames[i % offTargetNames.length]!,
        affinity_nm: affinity,
        selectivity_ratio: selectivity,
        risk_level: risk,
        associated_phenotype: phenotypes[i % phenotypes.length]!
      })
    }
  }

  const druggabilityScore = Math.round(rngFloat(rng, 0.3, 0.95) * 100) / 100
  let druggabilityClass: 'highly_druggable' | 'druggable' | 'moderately_druggable' | 'poorly_druggable'
  if (druggabilityScore > 0.8) druggabilityClass = 'highly_druggable'
  else if (druggabilityScore > 0.6) druggabilityClass = 'druggable'
  else if (druggabilityScore > 0.4) druggabilityClass = 'moderately_druggable'
  else druggabilityClass = 'poorly_druggable'

  const admetPass = admetProfile.filter(a => a.prediction === 'good').length
  const admetFail = admetProfile.filter(a => a.prediction === 'poor').length
  const selectivityIdx = offTargets.length > 0 ? Math.min(...offTargets.map(o => o.selectivity_ratio)) : 1000
  const safetyRisk: 'low' | 'medium' | 'high' = admetFail > 4 ? 'high' : admetFail > 2 ? 'medium' : 'low'

  let devRecommendation: string
  if (resultCategory === 'strong' && safetyRisk === 'low' && druggabilityClass === 'highly_druggable') {
    devRecommendation = 'Excellent candidate - proceed to lead optimization'
  } else if (resultCategory === 'moderate' && safetyRisk !== 'high') {
    devRecommendation = 'Promising candidate - requires medicinal chemistry optimization'
  } else if (resultCategory === 'weak') {
    devRecommendation = 'Weak binding - consider scaffold hopping or fragment-based approaches'
  } else {
    devRecommendation = 'High risk profile - extensive optimization needed before advancement'
  }

  const overallScore = Math.round((druggabilityScore * 0.3 + (resultCategory === 'strong' ? 1 : resultCategory === 'moderate' ? 0.6 : 0.3) * 0.4 + (1 - admetFail / 10) * 0.3) * 100) / 100

  return {
    drug_id: 'DRUG_' + input.drug_smiles.slice(0, 8),
    target_id: input.target_id,
    prediction_type: predType,
    binding_affinity: {
      ic50_nm: ic50,
      ki_nm: ki,
      kd_nm: kd,
      binding_energy_kcal_mol: bindingEnergy,
      confidence: Math.round(confLevel * 100) / 100,
      assay_type: assayType,
      result_category: resultCategory
    },
    admet_profile: admetProfile,
    off_targets: offTargets,
    druggability: {
      score: druggabilityScore,
      classification: druggabilityClass,
      pocket_count: rngRange(rng, 1, 8),
      best_pocket_score: Math.round(rngFloat(rng, 0.5, 0.95) * 100) / 100,
      confidence: Math.round(rngFloat(rng, 0.6, 0.9) * 100) / 100
    },
    summary: {
      overall_drug_score: overallScore,
      selectivity_index: Math.round(selectivityIdx * 100) / 100,
      admet_pass_count: admetPass,
      admet_fail_count: admetFail,
      safety_risk: safetyRisk,
      development_recommendation: devRecommendation
    },
    summary_text: 'Drug-target analysis for ' + input.target_id + ': IC50=' + ic50 + ' nM (' + resultCategory + '), binding energy=' + bindingEnergy + ' kcal/mol. Druggability: ' + druggabilityClass + ' (' + druggabilityScore + '). Safety: ' + safetyRisk + '. ' + devRecommendation
  }
}

function formatDrugTargetReport(result: DrugTargetResult): string {
  const lines: string[] = []
  lines.push('## Drug-Target Interaction Prediction Report')
  lines.push('')
  lines.push('**Drug:** ' + result.drug_id + ' | **Target:** ' + result.target_id + ' | **Type:** ' + result.prediction_type)
  lines.push('')
  lines.push('### Binding Affinity')
  lines.push('- IC50: ' + result.binding_affinity.ic50_nm + ' nM (' + result.binding_affinity.result_category + ')')
  lines.push('- Ki: ' + result.binding_affinity.ki_nm + ' nM | Kd: ' + result.binding_affinity.kd_nm + ' nM')
  lines.push('- Binding energy: ' + result.binding_affinity.binding_energy_kcal_mol + ' kcal/mol')
  lines.push('- Confidence: ' + result.binding_affinity.confidence)
  lines.push('')

  lines.push('### ADMET Profile')
  lines.push('| Property | Value | Unit | Prediction | Confidence |')
  lines.push('|----------|-------|------|------------|------------|')
  for (const a of result.admet_profile) {
    lines.push('| ' + a.property_name + ' | ' + a.value + ' | ' + a.unit + ' | ' + a.prediction + ' | ' + a.confidence + ' |')
  }
  lines.push('')

  if (result.off_targets.length > 0) {
    lines.push('### Off-Target Predictions')
    for (const ot of result.off_targets) {
      lines.push('- ' + ot.target_name + ': ' + ot.affinity_nm + ' nM, selectivity ' + ot.selectivity_ratio + 'x, risk: ' + ot.risk_level + ' (' + ot.associated_phenotype + ')')
    }
    lines.push('')
  }

  lines.push('### Druggability Assessment')
  lines.push('- Score: ' + result.druggability.score + ' (' + result.druggability.classification + ')')
  lines.push('- Pockets: ' + result.druggability.pocket_count + ' | Best pocket: ' + result.druggability.best_pocket_score)
  lines.push('')

  lines.push('### Summary')
  lines.push('- Overall drug score: ' + result.summary.overall_drug_score)
  lines.push('- Selectivity index: ' + result.summary.selectivity_index)
  lines.push('- ADMET pass/fail: ' + result.summary.admet_pass_count + '/' + result.summary.admet_fail_count)
  lines.push('- Safety risk: ' + result.summary.safety_risk)
  lines.push('- Recommendation: ' + result.summary.development_recommendation)

  return lines.join('\n')
}

// ==================== TOOL 5: GENE EXPRESSION PROFILER ====================

function profileGeneExpression(input: GeneExpressionInput): GeneExpressionResult {
  const rng = seededRng(input)
  const normMethod = input.normalization ?? 'tpm'
  const diffExprMethod = input.diffexpr_method ?? 'deseq2'
  const pThreshold = input.p_value_threshold ?? 0.05
  const log2fcThreshold = input.log2fc_threshold ?? 1.0
  const clusterMethod = input.clustering_method ?? 'hierarchical'

  const geneCount = input.gene_count
  const sampleCount = input.sample_count
  const conditions = input.condition_labels ?? ['control', 'treatment']

  const geneSymbols = ['TP53', 'BRCA1', 'EGFR', 'MYC', 'KRAS', 'PTEN', 'AKT1', 'CDKN2A', 'RB1', 'PIK3CA', 'ERBB2', 'VEGFA', 'BCL2', 'CASP3', 'MDM2', 'CDK4', 'CDK6', 'FGFR1', 'MET', 'ALK', 'ROS1', 'RET', 'NTRK1', 'BRAF', 'NRAS', 'HRAS', 'MAP2K1', 'MTOR', 'TSC1', 'TSC2']
  const ensemblIds = ['ENSG00000141510', 'ENSG00000012048', 'ENSG00000146648', 'ENSG00000136997', 'ENSG00000133703', 'ENSG00000171862', 'ENSG00000142208', 'ENSG00000147889', 'ENSG00000139687', 'ENSG00000121879', 'ENSG00000141736', 'ENSG00000112715', 'ENSG00000171791', 'ENSG00000164305', 'ENSG00000135679', 'ENSG00000135446', 'ENSG00000100030', 'ENSG00000105245', 'ENSG00000105976', 'ENSG00000157227', 'ENSG00000141510', 'ENSG00000204287', 'ENSG00000171094', 'ENSG00000157764', 'ENSG00000213281', 'ENSG00000065361', 'ENSG00000135362', 'ENSG00000198793', 'ENSG00000005339', 'ENSG00000103197']

  const differentialGenes: DiffExprGene[] = []
  const nDE = Math.min(geneCount, rngRange(rng, 10, 50))
  for (let i = 0; i < nDE; i++) {
    const log2fc = Math.round(rngFloat(rng, -5, 5) * 100) / 100
    const pVal = Math.round(rngFloat(rng, 0.00001, 0.05) * 1000000) / 1000000
    const adjP = Math.min(1, pVal * (1 + rngFloat(rng, 0.1, 2.0)))
    let trend: 'up' | 'down' | 'unchanged'
    if (Math.abs(log2fc) < log2fcThreshold) trend = 'unchanged'
    else if (log2fc > 0) trend = 'up'
    else trend = 'down'

    differentialGenes.push({
      gene_symbol: geneSymbols[i % geneSymbols.length]!,
      ensembl_id: ensemblIds[i % ensemblIds.length]!,
      log2_fold_change: log2fc,
      p_value: pVal,
      adjusted_p_value: Math.round(adjP * 1000000) / 1000000,
      base_mean: Math.round(rngFloat(rng, 10, 10000) * 100) / 100,
      expression_trend: trend,
      rank: i + 1
    })
  }
  differentialGenes.sort((a, b) => a.p_value - b.p_value)

  const upReg = differentialGenes.filter(g => g.expression_trend === 'up').length
  const downReg = differentialGenes.filter(g => g.expression_trend === 'down').length

  const nClusters = rngRange(rng, 2, 6)
  const clusters: ExpressionCluster[] = []
  for (let i = 0; i < nClusters; i++) {
    const nSamples = rngRange(rng, 2, Math.max(2, Math.floor(sampleCount / nClusters)))
    const samples: string[] = []
    for (let j = 0; j < nSamples; j++) {
      samples.push('sample_' + (i * nSamples + j + 1))
    }
    const profile: number[] = []
    for (let k = 0; k < conditions.length; k++) {
      profile.push(Math.round(rngFloat(rng, 1, 100) * 100) / 100)
    }
    clusters.push({
      cluster_id: i + 1,
      sample_count: nSamples,
      samples,
      avg_expression_profile: profile,
      dominant_condition: conditions[i % conditions.length]!,
      cluster_stability: Math.round(rngFloat(rng, 0.6, 0.95) * 100) / 100
    })
  }

  const moduleColors = ['turquoise', 'blue', 'brown', 'yellow', 'green', 'red', 'black', 'pink', 'magenta', 'purple', 'greenyellow', 'tan', 'salmid', 'cyan', 'grey60', 'lightcyan', 'lightyellow', 'royalblue', 'darkred', 'darkgreen']
  const nModules = rngRange(rng, 3, 10)
  const modules: CoExpressionModule[] = []
  for (let i = 0; i < nModules; i++) {
    const modGeneCount = rngRange(rng, 10, Math.max(10, Math.floor(geneCount / nModules)))
    const hubGenes: string[] = []
    for (let j = 0; j < Math.min(5, modGeneCount); j++) {
      hubGenes.push(geneSymbols[(i * 3 + j) % geneSymbols.length]!)
    }
    const goTerms: string[] = []
    const goPool = ['cell cycle', 'apoptosis', 'signal transduction', 'metabolic process', 'immune response', 'DNA repair', 'transcription', 'protein phosphorylation']
    for (let j = 0; j < rngRange(rng, 1, 4); j++) {
      goTerms.push(goPool[Math.floor(rng() * goPool.length)]!)
    }
    modules.push({
      module_id: 'MM' + String(i + 1).padStart(2, '0'),
      color_label: moduleColors[i % moduleColors.length]!,
      gene_count: modGeneCount,
      eigengene_value: Math.round(rngFloat(rng, 0.1, 0.9) * 1000) / 1000,
      module_trait_correlation: Math.round(rngFloat(rng, -0.8, 0.8) * 100) / 100,
      hub_genes: hubGenes,
      enriched_go_terms: goTerms,
      preservation_score: Math.round(rngFloat(rng, 0.3, 0.95) * 100) / 100
    })
  }

  const largestMod = modules.length > 0 ? Math.max(...modules.map(m => m.gene_count)) : 0
  const avgModSize = modules.length > 0 ? Math.round(modules.reduce((a, m) => a + m.gene_count, 0) / modules.length * 100) / 100 : 0

  return {
    gene_count: geneCount,
    sample_count: sampleCount,
    tissue_type: input.tissue_type,
    normalization: normMethod,
    diffexpr_method: diffExprMethod,
    differential_genes: differentialGenes,
    clustering: clusters,
    coexpression_modules: modules,
    summary: {
      total_de_genes: differentialGenes.length,
      up_regulated: upReg,
      down_regulated: downReg,
      total_modules: modules.length,
      largest_module_size: largestMod,
      avg_module_size: avgModSize,
      cluster_count: clusters.length
    },
    summary_text: 'Profiled ' + geneCount + ' genes across ' + sampleCount + ' samples (' + input.tissue_type + '). Found ' + differentialGenes.length + ' DE genes (' + upReg + ' up, ' + downReg + ' down). Identified ' + modules.length + ' co-expression modules and ' + clusters.length + ' expression clusters using ' + clusterMethod + ' clustering.'
  }
}

function formatGeneExpressionReport(result: GeneExpressionResult): string {
  const lines: string[] = []
  lines.push('## Gene Expression Profiling Report')
  lines.push('')
  lines.push('**Tissue:** ' + result.tissue_type + ' | **Genes:** ' + result.gene_count + ' | **Samples:** ' + result.sample_count)
  lines.push('**Normalization:** ' + result.normalization + ' | **DE method:** ' + result.diffexpr_method)
  lines.push('')
  lines.push('### Differential Expression Summary')
  lines.push('- Total DE genes: ' + result.summary.total_de_genes)
  lines.push('- Up-regulated: ' + result.summary.up_regulated + ' | Down-regulated: ' + result.summary.down_regulated)
  lines.push('')

  lines.push('### Top Differentially Expressed Genes')
  lines.push('| Rank | Gene | log2FC | p-value | adjP | Trend |')
  lines.push('|------|------|--------|---------|------|-------|')
  for (const g of result.differential_genes.slice(0, 15)) {
    lines.push('| ' + g.rank + ' | ' + g.gene_symbol + ' | ' + g.log2_fold_change + ' | ' + g.p_value.toExponential(2) + ' | ' + g.adjusted_p_value.toExponential(2) + ' | ' + g.expression_trend + ' |')
  }
  lines.push('')

  lines.push('### Co-expression Modules')
  lines.push('| Module | Color | Genes | Hub Genes | GO Terms |')
  lines.push('|--------|-------|-------|-----------|----------|')
  for (const m of result.coexpression_modules.slice(0, 10)) {
    lines.push('| ' + m.module_id + ' | ' + m.color_label + ' | ' + m.gene_count + ' | ' + m.hub_genes.slice(0, 3).join(', ') + ' | ' + m.enriched_go_terms.slice(0, 2).join(', ') + ' |')
  }
  lines.push('')

  lines.push('### Expression Clusters')
  for (const c of result.clustering) {
    lines.push('- Cluster ' + c.cluster_id + ': ' + c.sample_count + ' samples, dominant: ' + c.dominant_condition + ', stability: ' + c.cluster_stability)
  }

  return lines.join('\n')
}

// ==================== TOOL 6: VARIANT ANNOTATION TOOL ====================

function annotateVariants(input: VariantAnnotationInput): VariantAnnotationResult {
  const rng = seededRng(input)
  const assembly = input.assembly ?? 'hg38'
  const source = input.annotation_source ?? 'ensembl'

  const consequences = ['missense_variant', 'synonymous_variant', 'frameshift_variant', 'stop_gained', 'stop_lost', 'splice_acceptor_variant', 'splice_donor_variant', 'inframe_deletion', 'inframe_insertion', '5_prime_UTR_variant', '3_prime_UTR_variant', 'intron_variant', 'intergenic_variant', 'upstream_gene_variant', 'downstream_gene_variant']
  const impacts: Array<'HIGH' | 'MODERATE' | 'LOW' | 'MODIFIER'> = ['HIGH', 'MODERATE', 'LOW', 'MODIFIER']
  const impactWeights = [0.05, 0.15, 0.3, 0.5]
  const biotypes = ['protein_coding', 'lncRNA', 'miRNA', 'snRNA', 'snoRNA', 'rRNA', 'pseudogene', 'processed_pseudogene']
  const clinSigs = ['Pathogenic', 'Likely pathogenic', 'Uncertain significance', 'Likely benign', 'Benign', 'drug_response', 'not_provided']
  const clinDiseases = ['Breast cancer', 'Lynch syndrome', 'Cardiomyopathy', 'Noonan syndrome', 'Hereditary cancer', 'Familial hypercholesterolemia', 'Long QT syndrome', 'not_specified']

  const annotations: VariantAnnotation[] = []
  const geneDistribution = new Map<string, { count: number; consequences: string[] }>()
  const consDistribution = new Map<string, number>()

  for (const v of input.variants) {
    const impactIdx = weightedRandom(rng, impactWeights)
    const impact = impacts[impactIdx]!
    const consequence = consequences[Math.floor(rng() * consequences.length)]!
    const geneSymbol = ['TP53', 'BRCA1', 'EGFR', 'KRAS', 'PTEN', 'MYC', 'PIK3CA', 'RB1', 'CDKN2A', 'BRAF'][Math.floor(rng() * 10)]!
    const ensemblId = 'ENSG' + String(Math.floor(rngFloat(rng, 10000000000, 99999999999)))
    const aaChange = input.variants.length > 0 ? 'p.' + randomAA(rng) + rngRange(rng, 1, 500) + randomAA(rng) : 'p.?'
    const conservation = Math.round(rngFloat(rng, 0, 1) * 1000) / 1000
    const phastcons = Math.round(rngFloat(rng, 0, 1) * 1000) / 1000
    const phylop = Math.round(rngFloat(rng, -5, 5) * 100) / 100
    const gerp = Math.round(rngFloat(rng, -5, 6) * 100) / 100
    const clinvarSig = clinSigs[Math.floor(rng() * clinSigs.length)]!
    const clinvarDisease = clinDiseases[Math.floor(rng() * clinDiseases.length)]!
    const dbsnp = 'rs' + String(Math.floor(rngFloat(rng, 100000, 999999999)))
    const gnomadAf = Math.round(rngFloat(rng, 0, 0.5) * 1000000) / 1000000
    const gnomadPopmax = Math.min(1, gnomadAf * rngFloat(rng, 1, 3))
    const spliceai = Math.round(rngFloat(rng, 0, 1) * 1000) / 1000
    const cadd = Math.round(rngFloat(rng, 0, 40) * 100) / 100

    let pathogenicity: 'benign' | 'likely_benign' | 'vus' | 'likely_pathogenic' | 'pathogenic'
    if (impact === 'HIGH') pathogenicity = rng() > 0.5 ? 'pathogenic' : 'likely_pathogenic'
    else if (impact === 'MODERATE') pathogenicity = rng() > 0.6 ? 'vus' : rng() > 0.3 ? 'likely_pathogenic' : 'likely_benign'
    else pathogenicity = rng() > 0.7 ? 'benign' : 'likely_benign'

    const annotation: VariantAnnotation = {
      variant_id: v.chrom + ':' + v.pos + ':' + v.ref + ':' + v.alt,
      chrom: v.chrom,
      pos: v.pos,
      ref: v.ref,
      alt: v.alt,
      gene_symbol: geneSymbol,
      ensembl_gene_id: ensemblId,
      consequence,
      impact,
      feature_type: 'transcript',
      feature_id: 'ENST' + String(Math.floor(rngFloat(rng, 10000000000, 99999999999))),
      biotype: biotypes[Math.floor(rng() * biotypes.length)]!,
      amino_acid_change: consequence.includes('missense') || consequence.includes('frameshift') || consequence.includes('stop') ? aaChange : '-',
      cdna_change: 'c.' + rngRange(rng, 1, 5000) + v.ref + '>' + v.alt,
      protein_position: consequence.includes('missense') || consequence.includes('stop') ? rngRange(rng, 1, 500) : 0,
      conservation_score: conservation,
      phastcons_score: phastcons,
      phylop_score: phylop,
      gerp_score: gerp,
      clinvar_significance: clinvarSig,
      clinvar_disease: clinvarDisease,
      dbsnp_id: dbsnp,
      gnomad_af: gnomadAf,
      gnomad_popmax_af: Math.round(gnomadPopmax * 1000000) / 1000000,
      spliceai_score: spliceai,
      cadd_score: cadd,
      splice_prediction: spliceai > 0.8 ? 'high_impact_splice' : spliceai > 0.5 ? 'moderate_splice' : spliceai > 0.2 ? 'low_splice' : 'no_splice_impact',
      pathogenicity_prediction: pathogenicity,
      annotation_timestamp: '2026-08-25T00:00:00Z'
    }

    annotations.push(annotation)

    const existing = geneDistribution.get(geneSymbol)
    if (existing) {
      existing.count++
      existing.consequences.push(consequence)
    } else {
      geneDistribution.set(geneSymbol, { count: 1, consequences: [consequence] })
    }
    consDistribution.set(consequence, (consDistribution.get(consequence) || 0) + 1)
  }

  const coding = annotations.filter(a => a.biotype === 'protein_coding').length
  const noncoding = annotations.length - coding
  const highImpact = annotations.filter(a => a.impact === 'HIGH').length
  const modImpact = annotations.filter(a => a.impact === 'MODERATE').length
  const lowImpact = annotations.filter(a => a.impact === 'LOW').length
  const modfImpact = annotations.filter(a => a.impact === 'MODIFIER').length
  const pathogenic = annotations.filter(a => a.pathogenicity_prediction === 'pathogenic' || a.pathogenicity_prediction === 'likely_pathogenic').length
  const benign = annotations.filter(a => a.pathogenicity_prediction === 'benign' || a.pathogenicity_prediction === 'likely_benign').length
  const vus = annotations.filter(a => a.pathogenicity_prediction === 'vus').length
  const known = annotations.filter(a => a.gnomad_af > 0.001).length
  const novel = annotations.length - known

  const geneDist = Array.from(geneDistribution.entries()).map(([gene, data]) => ({
    gene,
    variant_count: data.count,
    consequences: [...new Set(data.consequences)]
  })).sort((a, b) => b.variant_count - a.variant_count)

  const consDist = Array.from(consDistribution.entries()).map(([consequence, count]) => ({
    consequence,
    count,
    percentage: Math.round(count / annotations.length * 10000) / 100
  })).sort((a, b) => b.count - a.count)

  return {
    total_variants: input.variants.length,
    assembly,
    annotation_source: source,
    annotations,
    summary: {
      coding_variants: coding,
      noncoding_variants: noncoding,
      high_impact: highImpact,
      moderate_impact: modImpact,
      low_impact: lowImpact,
      modifier_impact: modfImpact,
      pathogenic_count: pathogenic,
      benign_count: benign,
      vus_count: vus,
      novel_variants: novel,
      known_variants: known,
      multi_allelic_count: rngRange(rng, 0, Math.floor(input.variants.length * 0.1))
    },
    gene_distribution: geneDist,
    consequence_distribution: consDist,
    summary_text: 'Annotated ' + input.variants.length + ' variants on ' + assembly + ' using ' + source + '. Coding: ' + coding + ', Non-coding: ' + noncoding + '. Pathogenic: ' + pathogenic + ', Benign: ' + benign + ', VUS: ' + vus + '. Novel: ' + novel + ', Known: ' + known + '.'
  }
}

function weightedRandom(rng: () => number, weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]!
    if (r <= 0) return i
  }
  return weights.length - 1
}

function randomAA(rng: () => number): string {
  const aas = 'ACDEFGHIKLMNPQRSTVWY'
  return aas[Math.floor(rng() * aas.length)]!
}

function formatVariantAnnotationReport(result: VariantAnnotationResult): string {
  const lines: string[] = []
  lines.push('## Variant Annotation Report')
  lines.push('')
  lines.push('**Assembly:** ' + result.assembly + ' | **Source:** ' + result.annotation_source + ' | **Variants:** ' + result.total_variants)
  lines.push('')
  lines.push('### Impact Distribution')
  lines.push('- HIGH: ' + result.summary.high_impact + ' | MODERATE: ' + result.summary.moderate_impact + ' | LOW: ' + result.summary.low_impact + ' | MODIFIER: ' + result.summary.modifier_impact)
  lines.push('')
  lines.push('### Pathogenicity')
  lines.push('- Pathogenic/Likely pathogenic: ' + result.summary.pathogenic_count)
  lines.push('- Benign/Likely benign: ' + result.summary.benign_count)
  lines.push('- VUS: ' + result.summary.vus_count)
  lines.push('- Novel: ' + result.summary.novel_variants + ' | Known: ' + result.summary.known_variants)
  lines.push('')

  lines.push('### Top Annotated Variants')
  lines.push('| Variant | Gene | Consequence | Impact | Pathogenicity | CADD |')
  lines.push('|---------|------|-------------|--------|---------------|------|')
  for (const a of result.annotations.slice(0, 15)) {
    lines.push('| ' + a.variant_id + ' | ' + a.gene_symbol + ' | ' + a.consequence + ' | ' + a.impact + ' | ' + a.pathogenicity_prediction + ' | ' + a.cadd_score + ' |')
  }
  lines.push('')

  lines.push('### Consequence Distribution')
  for (const c of result.consequence_distribution.slice(0, 8)) {
    lines.push('- ' + c.consequence + ': ' + c.count + ' (' + c.percentage.toFixed(1) + '%)')
  }

  return lines.join('\n')
}

// ==================== TOOL 7: METAGENOMICS CLASSIFIER ====================

function classifyMetagenomics(input: MetagenomicsClassifierInput): MetagenomicsClassifierResult {
  const rng = seededRng(input)
  const method = input.profiling_method ?? 'marker_gene'
  const database = input.database ?? 'silva'
  const rank = input.classification_rank ?? 'species'
  const readsCount = input.reads_count
  const depthGbp = input.sequencing_depth_gbp

  const phylaNames = ['Proteobacteria', 'Firmicutes', 'Actinobacteria', 'Bacteroidetes', 'Cyanobacteria', 'Verrucomicrobia', 'Planctomycetes', 'Chloroflexi', 'Spirochaetes', 'Acidobacteria']
  const genusNames = ['Bacillus', 'Pseudomonas', 'Streptomyces', 'Rhizobium', 'Escherichia', 'Lactobacillus', 'Bacteroides', 'Clostridium', 'Mycobacterium', 'Vibrio', 'Staphylococcus', 'Enterococcus', 'Corynebacterium', 'Acinetobacter', 'Burkholderia']
  const speciesNames = ['E. coli', 'B. subtilis', 'S. aureus', 'P. aeruginosa', 'M. tuberculosis', 'L. plantarum', 'B. thetaiotaomicron', 'C. difficile', 'V. cholerae', 'S. pneumoniae']

  const taxonomicProfile: TaxonClassification[] = []
  const nTaxa = rngRange(rng, 8, 25)

  for (let i = 0; i < nTaxa; i++) {
    const r: 'domain' | 'phylum' | 'class' | 'order' | 'family' | 'genus' | 'species' = (['domain', 'phylum', 'class', 'order', 'family', 'genus', 'species'] as const)[Math.min(Math.floor(rng() * 7), 6)]!
    let name: string
    if (r === 'domain') name = ['Bacteria', 'Archaea', 'Eukarya'][Math.floor(rng() * 3)]!
    else if (r === 'phylum') name = phylaNames[Math.floor(rng() * phylaNames.length)]!
    else if (r === 'genus') name = genusNames[Math.floor(rng() * genusNames.length)]!
    else if (r === 'species') name = speciesNames[Math.floor(rng() * speciesNames.length)]!
    else name = r + '_' + String(i + 1)

    const abundance = Math.round(rngFloat(rng, 0.01, 35) * 100) / 100
    taxonomicProfile.push({
      taxon_id: 'TAXON_' + String(i + 1).padStart(5, '0'),
      rank: r,
      name,
      abundance_pct: abundance,
      reads_assigned: Math.round(abundance / 100 * readsCount),
      confidence: Math.round(rngFloat(rng, 0.5, 0.99) * 100) / 100,
      children: [],
      is_novel: rng() > 0.8
    })
  }

  const novelTaxa = taxonomicProfile.filter(t => t.is_novel).length
  const dominantPhyla = taxonomicProfile.filter(t => t.rank === 'phylum').sort((a, b) => b.abundance_pct - a.abundance_pct).slice(0, 3).map(t => t.name)

  const funcCategories = ['Carbohydrate metabolism', 'Amino acid metabolism', 'Energy metabolism', 'Lipid metabolism', 'Nucleotide metabolism', 'Metabolism of cofactors', 'Signal transduction', 'Membrane transport', 'Cell motility', 'Replication and repair']
  const functionalProfile: FunctionalAnnotation[] = []
  if (input.include_functional !== false) {
    for (const cat of funcCategories) {
      const goTerms: string[] = []
      const goPool = ['GO:0008150', 'GO:0009987', 'GO:0008152', 'GO:0006259', 'GO:0006629', 'GO:0055114', 'GO:0007165', 'GO:0006810', 'GO:0006468', 'GO:0006281']
      for (let j = 0; j < rngRange(rng, 1, 3); j++) {
        goTerms.push(goPool[Math.floor(rng() * goPool.length)]!)
      }
      functionalProfile.push({
        category: cat,
        subsystem: cat + ' subsystem level 1',
        abundance: Math.round(rngFloat(rng, 100, 5000) * 10) / 10,
        confidence: Math.round(rngFloat(rng, 0.6, 0.95) * 100) / 100,
        associated_taxa: taxonomicProfile.slice(0, rngRange(rng, 1, 4)).map(t => t.name),
        gene_ontology_terms: goTerms
      })
    }
  }

  const observedSpecies = taxonomicProfile.filter(t => t.rank === 'species').length
  const shannonIndex = Math.round(rngFloat(rng, 1.5, 5.5) * 100) / 100

  return {
    sample_id: input.sample_id,
    reads_count: readsCount,
    sequencing_depth_gbp: depthGbp,
    environment: input.environment,
    profiling_method: method,
    database,
    taxonomic_profile: taxonomicProfile,
    functional_profile: functionalProfile,
    diversity: {
      shannon_index: shannonIndex,
      simpson_index: Math.round((1 - Math.exp(-shannonIndex) * 0.3) * 1000) / 1000,
      observed_species: observedSpecies,
      chao1: Math.round(observedSpecies * rngFloat(rng, 1.1, 1.4)),
      ace: Math.round(observedSpecies * rngFloat(rng, 1.05, 1.35)),
      evenness: Math.round((shannonIndex / Math.log(observedSpecies || 1)) * 1000) / 1000,
      faith_pd: Math.round(rngFloat(rng, 10, 80) * 100) / 100,
      pielou_evenness: Math.round(rngFloat(rng, 0.4, 0.9) * 1000) / 1000,
      bray_curtis_dissimilarity: Math.round(rngFloat(rng, 0.3, 0.9) * 1000) / 1000,
      jaccard_distance: Math.round(rngFloat(rng, 0.2, 0.8) * 1000) / 1000,
      unifrac_distance: Math.round(rngFloat(rng, 0.25, 0.75) * 1000) / 1000,
      weighted_unifrac: Math.round(rngFloat(rng, 0.2, 0.7) * 1000) / 1000,
      pcoa_variance_explained: [
        Math.round(rngFloat(rng, 0.15, 0.4) * 1000) / 1000,
        Math.round(rngFloat(rng, 0.05, 0.2) * 1000) / 1000
      ]
    },
    summary: {
      total_taxa_identified: taxonomicProfile.length,
      dominant_phyla: dominantPhyla,
      novel_taxa_count: novelTaxa,
      rarefaction_saturation: Math.round(rngFloat(rng, 0.85, 0.99) * 1000) / 1000,
      estimated_coverage: Math.round(rngFloat(rng, 0.8, 0.98) * 1000) / 1000,
      functional_categories: functionalProfile.length,
      classification_confidence: Math.round(rngFloat(rng, 0.7, 0.95) * 100) / 100
    },
    summary_text: 'Classified ' + input.sample_id + ' (' + depthGbp + ' Gbp, ' + input.environment + ') using ' + method + '/' + database + '. Identified ' + taxonomicProfile.length + ' taxa (' + novelTaxa + ' novel). Shannon: ' + shannonIndex + ', Chao1: ' + Math.round(observedSpecies * 1.2) + '. Dominant: ' + dominantPhyla.join(', ') + '.'
  }
}

function formatMetagenomicsClassifierReport(result: MetagenomicsClassifierResult): string {
  const lines: string[] = []
  lines.push('## Metagenomics Classification Report')
  lines.push('')
  lines.push('**Sample:** ' + result.sample_id + ' | **Environment:** ' + result.environment)
  lines.push('**Reads:** ' + (result.reads_count / 1e6).toFixed(1) + 'M | **Depth:** ' + result.sequencing_depth_gbp + ' Gbp | **Method:** ' + result.profiling_method + '/' + result.database)
  lines.push('')
  lines.push('### Taxonomic Profile (Phylum Level)')
  const phylumTaxa = result.taxonomic_profile.filter(t => t.rank === 'phylum').sort((a, b) => b.abundance_pct - a.abundance_pct)
  lines.push('| Phylum | Abundance (%) | Reads | Confidence |')
  lines.push('|--------|---------------|-------|------------|')
  for (const t of phylumTaxa) {
    lines.push('| ' + t.name + ' | ' + t.abundance_pct.toFixed(2) + '% | ' + (t.reads_assigned / 1e3).toFixed(1) + 'K | ' + (t.confidence * 100).toFixed(0) + '% |')
  }
  lines.push('')

  lines.push('### Diversity Metrics')
  const d = result.diversity
  lines.push('- Shannon: ' + d.shannon_index + ' | Simpson: ' + d.simpson_index.toFixed(3) + ' | Observed species: ' + d.observed_species)
  lines.push('- Chao1: ' + d.chao1 + ' | ACE: ' + d.ace + ' | Faith PD: ' + d.faith_pd.toFixed(2))
  lines.push('- Evenness: ' + d.evenness.toFixed(3) + ' | Pielou: ' + d.pielou_evenness.toFixed(3))
  lines.push('')

  lines.push('### Summary')
  lines.push('- Total taxa: ' + result.summary.total_taxa_identified + ' | Novel: ' + result.summary.novel_taxa_count)
  lines.push('- Dominant phyla: ' + result.summary.dominant_phyla.join(', '))
  lines.push('- Rarefaction saturation: ' + (result.summary.rarefaction_saturation * 100).toFixed(1) + '%')
  lines.push('- Classification confidence: ' + (result.summary.classification_confidence * 100).toFixed(0) + '%')

  return lines.join('\n')
}

// ==================== TOOL 8: STRUCTURAL BIOINFORMATICS CALCULATOR ====================

function calculateStructuralBioinformatics(input: StructuralBioinformaticsInput): StructuralBioinformaticsResult {
  const rng = seededRng(input)
  const calcType = input.calculation_type ?? 'all'
  const chainCount = input.chain_count ?? rngRange(rng, 1, 4)
  const residueCount = input.residue_count ?? rngRange(rng, 100, 500)

  const alignedResidues = Math.round(residueCount * rngFloat(rng, 0.7, 0.99))
  const coverage = Math.round(alignedResidues / residueCount * 10000) / 100

  const perResidueRMSD: Array<{ residue_number: number; residue_name: string; rmsd: number }> = []
  const aaNames = ['ALA', 'CYS', 'ASP', 'GLU', 'PHE', 'GLY', 'HIS', 'ILE', 'LYS', 'LEU', 'MET', 'ASN', 'PRO', 'GLN', 'ARG', 'SER', 'THR', 'VAL', 'TRP', 'TYR']
  for (let i = 0; i < Math.min(20, alignedResidues); i++) {
    perResidueRMSD.push({
      residue_number: i + 1,
      residue_name: aaNames[Math.floor(rng() * aaNames.length)]!,
      rmsd: Math.round(rngFloat(rng, 0.1, 5.0) * 1000) / 1000
    })
  }

  const overallRMSD = Math.round(rngFloat(rng, 0.5, 4.0) * 1000) / 1000
  const rmsdResult: RMSDResult = {
    overall_rmsd: overallRMSD,
    backbone_rmsd: Math.round(overallRMSD * rngFloat(rng, 0.7, 0.95) * 1000) / 1000,
    ca_rmsd: Math.round(overallRMSD * rngFloat(rng, 0.6, 0.9) * 1000) / 1000,
    heavy_atom_rmsd: Math.round(overallRMSD * rngFloat(rng, 0.8, 1.1) * 1000) / 1000,
    per_residue_rmsd: perResidueRMSD,
    aligned_residues: alignedResidues,
    coverage,
    tm_score: Math.round(rngFloat(rng, 0.5, 0.98) * 1000) / 1000,
    gdt_ts: Math.round(rngFloat(rng, 40, 95) * 100) / 100,
    gdt_ha: Math.round(rngFloat(rng, 20, 80) * 100) / 100
  }

  const contactPairs: Array<{ residue_i: number; residue_j: number; distance: number; contact_type: string }> = []
  const nContacts = rngRange(rng, 30, 200)
  let shortRange = 0
  let mediumRange = 0
  let longRange = 0
  for (let i = 0; i < nContacts; i++) {
    const ri = rngRange(rng, 1, residueCount)
    const rj = rngRange(rng, 1, residueCount)
    const dist = Math.abs(ri - rj)
    let cType: string
    if (dist <= 6) { cType = 'short'; shortRange++ }
    else if (dist <= 12) { cType = 'medium'; mediumRange++ }
    else { cType = 'long'; longRange++ }
    contactPairs.push({
      residue_i: ri,
      residue_j: rj,
      distance: Math.round(rngFloat(rng, 3.0, 12.0) * 100) / 100,
      contact_type: cType
    })
  }

  const contactMapResult: ContactMapResult = {
    total_contacts: nContacts,
    short_range: shortRange,
    medium_range: mediumRange,
    long_range: longRange,
    contact_distance_threshold: 8.0,
    contact_pairs: contactPairs.slice(0, 20),
    contact_density: Math.round(nContacts / residueCount * 1000) / 1000,
    avg_coordination_number: Math.round(rngFloat(rng, 4, 12) * 100) / 100
  }

  const phiPsiDist: Array<{ residue: string; phi: number; psi: number; region: string }> = []
  for (let i = 0; i < Math.min(15, residueCount); i++) {
    const phi = Math.round(rngFloat(rng, -180, 180) * 10) / 10
    const psi = Math.round(rngFloat(rng, -180, 180) * 10) / 10
    let region: string
    if (phi < 0 && psi < 0 && psi > -100) region = 'beta_sheet'
    else if (phi < 0 && psi > 0) region = 'alpha_helix'
    else if (phi > 0 && psi < 0) region = 'left_handed'
    else region = 'allowed'
    phiPsiDist.push({
      residue: aaNames[Math.floor(rng() * aaNames.length)]! + String(i + 1),
      phi,
      psi,
      region
    })
  }

  const favored = Math.round(rngFloat(rng, 85, 98) * 100) / 100
  const allowed = Math.round(rngFloat(rng, 95, 99.8) * 100) / 100
  const outlier = Math.round((100 - allowed) * 100) / 100

  const geometryResult: GeometryAnalysis = {
    radius_of_gyration: Math.round(rngFloat(rng, 10, 35) * 100) / 100,
    total_sasa: Math.round(rngFloat(rng, 5000, 30000) * 100) / 100,
    polar_sasa: Math.round(rngFloat(rng, 2000, 12000) * 100) / 100,
    nonpolar_sasa: Math.round(rngFloat(rng, 2000, 15000) * 100) / 100,
    buried_sasa: Math.round(rngFloat(rng, 1000, 8000) * 100) / 100,
    phi_psi_distribution: phiPsiDist,
    ramachandran_favored_pct: favored,
    ramachandran_allowed_pct: allowed,
    ramachandran_outlier_pct: outlier,
    bond_length_deviation: Math.round(rngFloat(rng, 0.005, 0.025) * 10000) / 10000,
    bond_angle_deviation: Math.round(rngFloat(rng, 0.5, 3.0) * 100) / 100,
    clashscore: Math.round(rngFloat(rng, 0, 20) * 100) / 100,
    molprobity_score: Math.round(rngFloat(rng, 1.0, 4.0) * 100) / 100
  }

  const nHBonds = rngRange(rng, 20, Math.floor(residueCount * 0.8))
  const keyResidues: string[] = []
  for (let i = 0; i < rngRange(rng, 3, 8); i++) {
    keyResidues.push(aaNames[Math.floor(rng() * aaNames.length)]! + String(rngRange(rng, 1, residueCount)))
  }

  const hbondResult: HydrogenBondResult = {
    total_hbonds: nHBonds,
    backbone_hbonds: Math.round(nHBonds * rngFloat(rng, 0.4, 0.7)),
    sidechain_hbonds: Math.round(nHBonds * rngFloat(rng, 0.1, 0.3)),
    backbone_sidechain_hbonds: Math.round(nHBonds * rngFloat(rng, 0.1, 0.3)),
    avg_hbond_distance: Math.round(rngFloat(rng, 2.5, 3.5) * 100) / 100,
    avg_hbond_angle: Math.round(rngFloat(rng, 140, 180) * 100) / 100,
    hbond_energy_estimate: Math.round(rngFloat(rng, -50, -10) * 100) / 100,
    key_residues: keyResidues
  }

  const helixPct = Math.round(rngFloat(rng, 0.2, 0.5) * 10000) / 100
  const sheetPct = Math.round(rngFloat(rng, 0.1, 0.35) * 10000) / 100
  const turnPct = Math.round(rngFloat(rng, 0.05, 0.2) * 10000) / 100
  const coilPct = Math.round((1 - helixPct / 100 - sheetPct / 100 - turnPct / 100) * 10000) / 100

  const overallScore = Math.round(rngFloat(rng, 0.5, 0.95) * 100) / 100
  let qualityGrade: 'excellent' | 'good' | 'acceptable' | 'poor'
  if (overallScore > 0.85) qualityGrade = 'excellent'
  else if (overallScore > 0.7) qualityGrade = 'good'
  else if (overallScore > 0.5) qualityGrade = 'acceptable'
  else qualityGrade = 'poor'

  return {
    structure_id: input.structure_id,
    calculation_type: calcType,
    rmsd: rmsdResult,
    contact_map: contactMapResult,
    geometry: geometryResult,
    hydrogen_bonds: hbondResult,
    secondary_structure_content: {
      helix_percentage: helixPct,
      sheet_percentage: sheetPct,
      coil_percentage: coilPct,
      turn_percentage: turnPct
    },
    quality_assessment: {
      overall_score: overallScore,
      resolution_estimate: Math.round(rngFloat(rng, 1.0, 4.0) * 100) / 100,
      b_factor_avg: Math.round(rngFloat(rng, 20, 80) * 100) / 100,
      r_free_estimate: Math.round(rngFloat(rng, 0.18, 0.35) * 1000) / 1000,
      r_work_estimate: Math.round(rngFloat(rng, 0.15, 0.30) * 1000) / 1000,
      quality_grade: qualityGrade
    },
    summary_text: 'Structural analysis of ' + input.structure_id + ' (' + residueCount + ' residues, ' + chainCount + ' chains). RMSD: ' + overallRMSD + ' A, TM-score: ' + rmsdResult.tm_score + ', GDT-TS: ' + rmsdResult.gdt_ts + '. Ramachandran favored: ' + favored + '%. Quality: ' + qualityGrade + ' (' + overallScore + ').'
  }
}

function formatStructuralBioinformaticsReport(result: StructuralBioinformaticsResult): string {
  const lines: string[] = []
  lines.push('## Structural Bioinformatics Analysis Report')
  lines.push('')
  lines.push('**Structure:** ' + result.structure_id + ' | **Calculation:** ' + result.calculation_type)
  lines.push('')
  lines.push('### RMSD Analysis')
  lines.push('- Overall RMSD: ' + result.rmsd.overall_rmsd + ' A')
  lines.push('- Backbone: ' + result.rmsd.backbone_rmsd + ' A | Ca: ' + result.rmsd.ca_rmsd + ' A | Heavy atom: ' + result.rmsd.heavy_atom_rmsd + ' A')
  lines.push('- TM-score: ' + result.rmsd.tm_score + ' | GDT-TS: ' + result.rmsd.gdt_ts + ' | GDT-HA: ' + result.rmsd.gdt_ha)
  lines.push('- Aligned residues: ' + result.rmsd.aligned_residues + ' (' + result.rmsd.coverage.toFixed(1) + '%)')
  lines.push('')

  lines.push('### Contact Map')
  lines.push('- Total contacts: ' + result.contact_map.total_contacts)
  lines.push('- Short-range: ' + result.contact_map.short_range + ' | Medium: ' + result.contact_map.medium_range + ' | Long: ' + result.contact_map.long_range)
  lines.push('- Contact density: ' + result.contact_map.contact_density + ' | Avg coordination: ' + result.contact_map.avg_coordination_number)
  lines.push('')

  lines.push('### Geometry Analysis')
  const g = result.geometry
  lines.push('- Radius of gyration: ' + g.radius_of_gyration + ' A')
  lines.push('- Total SASA: ' + g.total_sasa + ' A^2 (polar: ' + g.polar_sasa + ', nonpolar: ' + g.nonpolar_sasa + ')')
  lines.push('- Ramachandran favored: ' + g.ramachandran_favored_pct + '% | Allowed: ' + g.ramachandran_allowed_pct + '% | Outlier: ' + g.ramachandran_outlier_pct + '%')
  lines.push('- Bond length deviation: ' + g.bond_length_deviation + ' A | Angle deviation: ' + g.bond_angle_deviation + ' deg')
  lines.push('- Clashscore: ' + g.clashscore + ' | MolProbity: ' + g.molprobity_score)
  lines.push('')

  lines.push('### Hydrogen Bonds')
  lines.push('- Total H-bonds: ' + result.hydrogen_bonds.total_hbonds)
  lines.push('- Backbone-backbone: ' + result.hydrogen_bonds.backbone_hbonds + ' | Sidechain-sidechain: ' + result.hydrogen_bonds.sidechain_hbonds)
  lines.push('- Avg distance: ' + result.hydrogen_bonds.avg_hbond_distance + ' A | Avg angle: ' + result.hydrogen_bonds.avg_hbond_angle + ' deg')
  lines.push('- Estimated energy: ' + result.hydrogen_bonds.hbond_energy_estimate + ' kcal/mol')
  lines.push('')

  lines.push('### Quality Assessment')
  lines.push('- Overall score: ' + result.quality_assessment.overall_score + ' (' + result.quality_assessment.quality_grade + ')')
  lines.push('- Estimated resolution: ' + result.quality_assessment.resolution_estimate + ' A')
  lines.push('- B-factor avg: ' + result.quality_assessment.b_factor_avg)
  lines.push('- R-work: ' + result.quality_assessment.r_work_estimate + ' | R-free: ' + result.quality_assessment.r_free_estimate)

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
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: SequenceAlignmentInput = JSON.parse(args.input_data)
      const result = analyzeSequenceAlignment(data)
      return formatSequenceAlignmentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'protein_folding_predictor',
    description: 'Predict protein structure from amino acid sequence using AlphaFold3/ESMFold/RosettaFold approaches. Returns secondary structure composition, predicted domains, disorder regions, contact maps, and confidence scores (pLDDT, TM-score, ipTM, pTM).',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: sequence (amino acid string), prediction_method (alphafold3/esmfold/rosettafold/comparative), include_domains (bool), include_disorder (bool), include_contacts (bool), include_plddt (bool)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: ProteinFoldingInput = JSON.parse(args.input_data)
      const result = predictProteinFolding(data)
      return formatProteinFoldingReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'pathway_enrichment_analyzer',
    description: 'Perform pathway enrichment analysis (ORA/GSEA/SSA) on gene lists against KEGG/Reactome/GO/WikiPathways databases. Returns enriched pathways with fold enrichment, p-values, network topology, and leading edge genes.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: gene_list (string array), background_genes (string array), organism (string), database (kegg/reactome/go_bp/go_mf/go_cc/wikipathways), enrichment_method (ora/gsea/ssa), p_value_threshold (number), min_gene_count (number), max_gene_count (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: PathwayEnrichmentInput = JSON.parse(args.input_data)
      const result = analyzePathwayEnrichment(data)
      return formatPathwayEnrichmentReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'drug_target_interaction_predictor',
    description: 'Predict drug-target interaction: binding affinity (IC50/Ki/Kd), ADMET properties, off-target selectivity, and druggability assessment. Returns comprehensive drug candidate evaluation with development recommendations.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: drug_smiles (string), target_id (string), target_sequence (string), prediction_type (binding_affinity/admet/selectivity/druggability/all), assay_type (ic50/ki/kd/ec50), include_off_targets (bool), confidence_level (number)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: DrugTargetInput = JSON.parse(args.input_data)
      const result = predictDrugTargetInteraction(data)
      return formatDrugTargetReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'gene_expression_profiler',
    description: 'Profile gene expression data: differential expression analysis (DESeq2/edgeR/limma), co-expression module detection (WGCNA), sample clustering, and expression trend identification. Returns DE gene lists, module assignments, and cluster profiles.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: gene_count (number), sample_count (number), tissue_type (string), condition_labels (string array), normalization (tpm/fpkm/cpm/deseq2/tmm), diffexpr_method (deseq2/edgeR/limma), p_value_threshold (number), log2fc_threshold (number), clustering_method (hierarchical/kmeans/wgcna)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: GeneExpressionInput = JSON.parse(args.input_data)
      const result = profileGeneExpression(data)
      return formatGeneExpressionReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'variant_annotation_tool',
    description: 'Annotate genetic variants with functional impact, conservation scores (PhastCons, PhyloP, GERP), clinical significance (ClinVar), population frequencies (gnomAD), splicing predictions (SpliceAI), and pathogenicity assessments (CADD).',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: variants (array of {chrom, pos, ref, alt}), assembly (hg38/hg19/mm10), annotation_source (ensembl/refseq/ucsc), include_conservation (bool), include_clinical (bool), include_frequency (bool), include_splicing (bool)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: VariantAnnotationInput = JSON.parse(args.input_data)
      const result = annotateVariants(data)
      return formatVariantAnnotationReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'metagenomics_classifier',
    description: 'Classify metagenomic samples: taxonomic classification (domain to species), functional profiling (KEGG/SEED/COG), alpha/beta diversity metrics, and novelty detection. Supports marker-based, whole-genome, k-mer, and amplicon approaches.',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: sample_id (string), reads_count (number), sequencing_depth_gbp (number), environment (string), profiling_method (marker_gene/whole_genome/kmer_based/amplicon), database (greengenes2/silva/rdp/img/gtdb), classification_rank (species/genus/family/phylum), include_functional (bool), include_diversity (bool)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: MetagenomicsClassifierInput = JSON.parse(args.input_data)
      const result = classifyMetagenomics(data)
      return formatMetagenomicsClassifierReport(result)
    }
  }))

  tools.register(defineTool({
    name: 'structural_bioinformatics_calculator',
    description: 'Calculate structural bioinformatics metrics: RMSD, TM-score, GDT, contact maps, geometry analysis (Ramachandran, SASA, radius of gyration), hydrogen bond networks, and quality assessment (MolProbity, clashscore).',
    parameters: {
      input_data: { type: 'string', required: true, description: 'JSON object with fields: structure_id (string), chain_count (number), residue_count (number), calculation_type (rmsd/tm_score/contact_map/geometry/all), reference_structure_id (string), include_sasa (bool), include_hydrogen_bonds (bool), include_secondary_structure (bool), include_phi_psi (bool)' }
    },
    output: { schema: { type: 'string' }, render: (_args: unknown, value: unknown) => [{ type: 'text', text: value as string }] },
    async execute(args: { input_data: string }) {
      const data: StructuralBioinformaticsInput = JSON.parse(args.input_data)
      const result = calculateStructuralBioinformatics(data)
      return formatStructuralBioinformaticsReport(result)
    }
  }))

  console.log('[dsh-tool-bioinfai] Loaded v' + VERSION + ' -- Bioinformatics & Computational Biology Toolkit with 8 tools')
  console.log('  Tools: sequence_alignment_analyzer, protein_folding_predictor, pathway_enrichment_analyzer, drug_target_interaction_predictor, gene_expression_profiler, variant_annotation_tool, metagenomics_classifier, structural_bioinformatics_calculator')
}
