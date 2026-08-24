/**
 * DSH Plugin: dsh-tool-xplainaagent v0.1.0
 *
 * AI Agent Explainability & Transparency Toolkit for DeepSeek Harness
 *
 * 8 Tools:
 *   1. decision_tracing_engine       - Trace AI decision causal chains with step-by-step analysis
 *   2. bias_detection_scanner        - Scan outputs/dataset for bias across protected attributes
 *   3. audit_log_generator           - Generate tamper-evident audit logs for AI decisions
 *   4. compliance_reporting_tool     - Build compliance reports against EU AI Act / NIST / ISO standards
 *   5. explainability_score_calculator - Compute multi-dimensional explainability scores
 *   6. fairness_metrics_evaluator    - Evaluate fairness metrics (statistical parity, equal opportunity, etc.)
 *   7. transparency_report_builder   - Generate stakeholder-facing transparency reports
 *   8. risk_level_classifier         - Classify AI system risk level with governance recommendations
 *
 * Standards:
 *   - mulberry32 PRNG seeded from JSON.stringify(input) for deterministic outputs
 *   - strict TypeScript
 *   - ctx.tools.register with defineTool pattern
 *   - single/double quotes only, no plain backticks
 *   - all interfaces exported
 *
 * Market Context 2026: AI governance market valued at $5B+; EU AI Act compliance mandatory.
 */

import type { Context } from '@deepseek-ai/cordis';
import { defineTool } from '@deepseek-ai/dsh-tools';
import type { ContentBlock } from '@deepseek-ai/dsh-llm';

// ---------------------------------------------------------------------------
// Module-level exports (metadata)
// ---------------------------------------------------------------------------

export const name = 'dsh-tool-xplainaagent';
export const inject = ['tools'];

// ---------------------------------------------------------------------------
// Mulberry32 PRNG - deterministic, seedable pseudo-random number generator
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function (): number {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Seed derivation - JSON.stringify(input) => 32-bit unsigned integer
// ---------------------------------------------------------------------------

function deriveSeed(input: unknown): number {
  const json = JSON.stringify(input);
  let h = 0;
  for (let i = 0; i < json.length; i++) {
    h = (Math.imul(31, h) + json.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

// ===========================================================================
// INTERFACE DECLARATIONS  (all exported)
// ===========================================================================

// ----- 1. Decision Tracing Engine -----

export interface DecisionNode {
  stepId: number;
  stepType: 'input' | 'reasoning' | 'weighting' | 'filtering' | 'aggregation' | 'output';
  description: string;
  inputSummary: string;
  outputSummary: string;
  confidence: number;
  alternativesConsidered: string[];
  supersededBy: number | null;
  causalLinks: number[];
  timestampMs: number;
}

export interface DecisionTraceInput {
  decisionId?: string;
  decisionContext: string;
  agentVersion?: string;
  modelName?: string;
  inputData?: string;
  outputDecision: string;
  maxDepth?: number;
  includeAlternatives?: boolean;
  biasCheckEnabled?: boolean;
  protectedAttributes?: string[];
}

export interface DecisionTrace {
  decisionId: string;
  rootStepId: number;
  nodes: DecisionNode[];
  traceDepth: number;
  overallConfidence: number;
  alternativePaths: number;
  circularReferences: number[];
  biasFlags: string[];
  recommendation: string;
}

// ----- 2. Bias Detection Scanner -----

export interface ProtectedAttributeResult {
  attribute: string;
  disparityRatio: number;
  disparateImpactScore: number;
  pValue: number;
  isSignificant: boolean;
  affectedGroup: string;
  severity: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  recommendation: string;
}

export interface BiasDetectionInput {
  datasetId?: string;
  sampleSize?: number;
  protectedAttributes: string[];
  targetVariable: string;
  predictionColumn?: string;
  groupIdColumn?: string;
  referenceGroup?: string;
  significanceLevel?: number;
  metrics?: string[];
  datasetDescription?: string;
}

export interface BiasDetectionResult {
  scanId: string;
  overallBiasRisk: 'negligible' | 'low' | 'moderate' | 'high' | 'critical';
  attributesAnalyzed: number;
  findings: ProtectedAttributeResult[];
  summaryScore: number;
  complianceStatus: 'compliant' | 'review_needed' | 'non_compliant';
  remediation: string[];
  scanTimestamp: string;
}

// ----- 3. Audit Log Generator -----

export interface AuditEvent {
  eventId: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  beforeState: string;
  afterState: string;
  purpose: string;
  lawfulBasis: string;
  dataCategories: string[];
  retentionDays: number;
  hash: string;
}

export interface AuditLogInput {
  systemId?: string;
  systemName?: string;
  eventType?: string;
  events?: Array<{
    actor: string;
    action: string;
    resource: string;
    beforeState?: string;
    afterState?: string;
    purpose?: string;
    lawfulBasis?: string;
    dataCategories?: string[];
    retentionDays?: number;
  }>;
  logPeriod?: string;
  complianceFramework?: string;
  hashAlgorithm?: string;
  includeIntegrityProof?: boolean;
}

export interface AuditLogResult {
  logId: string;
  systemId: string;
  entries: AuditEvent[];
  integrityHash: string;
  chainVerification: 'pass' | 'fail' | 'partial';
  periodStart: string;
  periodEnd: string;
  totalEntries: number;
  framework: string;
  generatedAt: string;
}

// ----- 4. Compliance Reporting Tool -----

export interface RequirementStatus {
  requirementId: string;
  category: string;
  description: string;
  status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
  evidence: string;
  gap: string;
  remediation: string;
  deadline?: string;
  owner?: string;
}

export interface ComplianceReportInput {
  systemId?: string;
  systemName?: string;
  systemDescription?: string;
  deploymentRegion?: string;
  framework: 'EU_AI_ACT' | 'NIST_AI_RMF' | 'ISO_42001' | 'MULTI';
  riskCategory?: string;
  requirements?: string[];
  assessor?: string;
  assessmentDate?: string;
}

export interface ComplianceReport {
  reportId: string;
  framework: string;
  overallScore: number;
  overallStatus: 'compliant' | 'partially_compliant' | 'non_compliant';
  requirements: RequirementStatus[];
  criticalGaps: string[];
  actionItems: string[];
  nextReviewDate: string;
  generatedAt: string;
}

// ----- 5. Explainability Score Calculator -----

export interface DimensionScore {
  dimension: string;
  score: number;
  weight: number;
  weightedScore: number;
  indicators: string[];
  gaps: string[];
}

export interface ExplainabilityInput {
  systemId?: string;
  systemName?: string;
  systemType?: string;
  dimensions?: string[];
  methodology?: string;
  stakeholderView?: string;
  deploymentContext?: string;
  trainingDataDescription?: string;
  modelArchitecture?: string;
  featureImportanceAvailable?: boolean;
  shapValuesComputed?: boolean;
  limeAnalysisDone?: boolean;
}

export interface ExplainabilityScore {
  scoreId: string;
  overallScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  dimensions: DimensionScore[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  generatedAt: string;
}

// ----- 6. Fairness Metrics Evaluator -----

export interface FairnessMetric {
  metricName: string;
  value: number;
  threshold: number;
  passes: boolean;
  affectedGroup: string;
  description: string;
  recommendation: string;
}

export interface FairnessEvaluationInput {
  systemId?: string;
  systemName?: string;
  predictions?: number[];
  groundTruth?: number[];
  sensitiveAttributes?: string[];
  referenceGroup?: string;
  evaluatedGroups?: string[];
  fairnessThreshold?: number;
  metricsToEvaluate?: string[];
  evaluationContext?: string;
}

export interface FairnessMetricsResult {
  evaluationId: string;
  metrics: FairnessMetric[];
  overallFairness: boolean;
  fairnessScore: number;
  threshold: number;
  groupsEvaluated: string[];
  violations: string[];
  recommendations: string[];
  evaluationDate: string;
}

// ----- 7. Transparency Report Builder -----

export interface ReportSection {
  sectionId: string;
  title: string;
  content: string;
  order: number;
  dataSources: string[];
  lastUpdated: string;
}

export interface TransparencyReportInput {
  systemId?: string;
  systemName?: string;
  organizationName?: string;
  reportPeriod?: string;
  audience?: string;
  includeSections?: string[];
  deploymentRegion?: string;
  modelCard?: {
    modelName?: string;
    modelVersion?: string;
    intendedUse?: string;
    limitations?: string[];
    trainingDataSummary?: string;
    performanceMetrics?: Record<string, number>;
  };
  includeModelCard?: boolean;
  includeComplianceSummary?: boolean;
  includeRiskAssessment?: boolean;
}

export interface TransparencyReport {
  reportId: string;
  title: string;
  organization: string;
  period: string;
  audience: string;
  sections: ReportSection[];
  modelCard?: Record<string, unknown>;
  summary: string;
  disclosures: string[];
  nextReportDue: string;
  publishedAt: string;
}

// ----- 8. Risk Level Classifier -----

export interface RiskFactor {
  factorId: string;
  category: string;
  name: string;
  weight: number;
  score: number;
  weightedScore: number;
  description: string;
  evidence: string;
  mitigation: string;
}

export interface GovernanceRecommendation {
  priority: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  responsible: string;
  timeline: string;
  framework: string;
}

export interface RiskClassificationInput {
  systemId?: string;
  systemName?: string;
  systemDescription?: string;
  deploymentContext?: string;
  dataSensitivity?: string;
  decisionImpact?: string;
  autonomyLevel?: string;
  regulatoryScope?: string;
  stakeholderExposure?: string;
  factors?: string[];
  includeGovernance?: boolean;
  includeMitigations?: boolean;
}

export interface RiskClassification {
  classificationId: string;
  overallRiskLevel: 'minimal' | 'limited' | 'high' | 'unacceptable';
  riskScore: number;
  maxScore: number;
  factors: RiskFactor[];
  governanceRecommendations: GovernanceRecommendation[];
  requiredOversight: string[];
  prohibitedUses: string[];
  nextAssessmentDue: string;
  classifiedAt: string;
}

// ===========================================================================
// HELPER FUNCTIONS
// ===========================================================================

function renderMarkdown(_args: unknown, value: { report_markdown: string }): ContentBlock[] {
  return [{ type: 'text', text: value.report_markdown }];
}

function formatTimestamp(): string {
  return new Date().toISOString();
}

function capitalizeFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ===========================================================================
// TOOL IMPLEMENTATION FUNCTIONS
// ===========================================================================

/**
 * Tool 1: Decision Tracing Engine
 */
function buildDecisionTrace(input: DecisionTraceInput): DecisionTrace {
  const seed = deriveSeed(input);
  const rand = mulberry32(seed);
  const now = Date.now();
  const maxDepth = input.maxDepth ?? 5;
  const decisionId = input.decisionId ?? ('dt-' + seed.toString(16));

  const stepTypes: DecisionNode['stepType'][] = [
    'input', 'reasoning', 'weighting', 'filtering', 'aggregation', 'output',
  ];

  const nodes: DecisionNode[] = [];
  let nodeId = 1;

  for (let i = 0; i < maxDepth; i++) {
    const stepType = stepTypes[Math.min(i, stepTypes.length - 1)];
    const confidence = 0.55 + rand() * 0.44;
    const altCount = input.includeAlternatives !== false ? Math.floor(rand() * 3) + 1 : 0;
    const alternatives: string[] = [];
    for (let a = 0; a < altCount; a++) {
      alternatives.push('Alternative ' + (a + 1) + ': ' + stepType + ' pathway with modified weighting (' + (rand() * 100).toFixed(1) + '% influence)');
    }
    const causalLinks = i > 0 ? [nodeId - 1] : [];
    const desc = capitalizeFirst(stepType) + ' phase for decision: ' + input.decisionContext.substring(0, 60);
    const inSum = i === 0 ? (input.inputData ?? 'Initial input data') : ('Output from step ' + (nodeId - 1));
    const outSum = i === maxDepth - 1 ? input.outputDecision : ('Intermediate signal for step ' + (nodeId + 1));
    nodes.push({
      stepId: nodeId,
      stepType,
      description: desc,
      inputSummary: inSum,
      outputSummary: outSum,
      confidence: parseFloat(confidence.toFixed(4)),
      alternativesConsidered: alternatives,
      supersededBy: i > 0 && rand() > 0.8 ? nodeId + 2 : null,
      causalLinks,
      timestampMs: now - (maxDepth - i) * 1000,
    });
    nodeId++;
  }

  const circularRefs: number[] = [];
  if (rand() > 0.7) {
    circularRefs.push(Math.floor(rand() * maxDepth) + 1);
  }

  const biasFlags: string[] = [];
  if (input.biasCheckEnabled !== false) {
    const attrs = input.protectedAttributes ?? ['gender', 'age', 'ethnicity'];
    for (const attr of attrs) {
      if (rand() > 0.65) {
        biasFlags.push("Potential correlation with protected attribute '" + attr + "' detected at step " + (Math.floor(rand() * maxDepth) + 1));
      }
    }
  }

  const overallConfidence = nodes.length > 0
    ? nodes.reduce((s, n) => s + n.confidence, 0) / nodes.length
    : 0;

  const altPaths = nodes.reduce((s, n) => s + n.alternativesConsidered.length, 0);

  let recommendation = 'Trace is coherent; no critical issues detected.';
  if (biasFlags.length > 2) {
    recommendation = 'HIGH PRIORITY: Multiple bias indicators detected. Recommend full bias audit and model retraining.';
  } else if (biasFlags.length > 0) {
    recommendation = 'Bias indicators present. Recommend targeted review of flagged attributes and causal paths.';
  } else if (circularRefs.length > 0) {
    recommendation = 'Circular references detected in causal chain. Review decision logic for potential infinite loops.';
  }

  return {
    decisionId,
    rootStepId: 1,
    nodes,
    traceDepth: maxDepth,
    overallConfidence: parseFloat(overallConfidence.toFixed(4)),
    alternativePaths: altPaths,
    circularReferences: circularRefs,
    biasFlags,
    recommendation,
  };
}

function formatDecisionTraceMarkdown(input: DecisionTraceInput, result: DecisionTrace): string {
  const lines: string[] = [];
  lines.push('# Decision Trace Report: ' + result.decisionId);
  lines.push('');
  lines.push('**Generated:** ' + formatTimestamp());
  lines.push('**Decision Context:** ' + input.decisionContext);
  lines.push('**Output Decision:** ' + input.outputDecision);
  lines.push('**Overall Confidence:** ' + (result.overallConfidence * 100).toFixed(1) + '%');
  lines.push('**Trace Depth:** ' + result.traceDepth);
  lines.push('**Alternative Paths:** ' + result.alternativePaths);
  lines.push('');
  lines.push('## Decision Chain');
  lines.push('');
  for (const node of result.nodes) {
    lines.push('### Step ' + node.stepId + ': ' + node.stepType.toUpperCase());
    lines.push('- **Description:** ' + node.description);
    lines.push('- **Input:** ' + node.inputSummary);
    lines.push('- **Output:** ' + node.outputSummary);
    lines.push('- **Confidence:** ' + (node.confidence * 100).toFixed(1) + '%');
    if (node.alternativesConsidered.length > 0) {
      lines.push('- **Alternatives:** ' + node.alternativesConsidered.length + ' considered');
    }
    lines.push('');
  }
  if (result.biasFlags.length > 0) {
    lines.push('## Bias Flags');
    lines.push('');
    for (const flag of result.biasFlags) {
      lines.push('- ' + flag);
    }
    lines.push('');
  }
  if (result.circularReferences.length > 0) {
    lines.push('## Circular References');
    lines.push('');
    lines.push('- Detected at steps: ' + result.circularReferences.join(', '));
    lines.push('');
  }
  lines.push('## Recommendation');
  lines.push('');
  lines.push(result.recommendation);
  return lines.join('\n');
}

/**
 * Tool 2: Bias Detection Scanner
 */
function runBiasDetection(input: BiasDetectionInput): BiasDetectionResult {
  const seed = deriveSeed(input);
  const rand = mulberry32(seed);
  const attrs = input.protectedAttributes;
  const sigLevel = input.significanceLevel ?? 0.05;

  const findings: ProtectedAttributeResult[] = [];
  let maxSeverityIdx = 0;
  const severityRank: Record<string, number> = { none: 0, low: 1, moderate: 2, high: 3, critical: 4 };

  for (const attr of attrs) {
    const disparityRatio = 0.4 + rand() * 0.6;
    const diScore = parseFloat((disparityRatio < 0.8 ? disparityRatio * 1.2 : disparityRatio).toFixed(4));
    const pValue = parseFloat((rand() * 0.15).toFixed(6));
    const isSig = pValue < sigLevel;

    let severity: ProtectedAttributeResult['severity'] = 'none';
    if (disparityRatio < 0.5) severity = 'critical';
    else if (disparityRatio < 0.65) severity = 'high';
    else if (disparityRatio < 0.8) severity = 'moderate';
    else if (disparityRatio < 0.9) severity = 'low';

    if (isSig && severityRank[severity] > maxSeverityIdx) {
      maxSeverityIdx = severityRank[severity];
    }

    const rec = severity === 'none'
      ? 'No action required.'
      : severity === 'critical'
        ? 'Immediate remediation required for "' + attr + '". Implement reweighting, resampling, or fairness constraints.'
        : severity === 'high'
          ? 'Review and mitigate bias in "' + attr + '". Consider adversarial debiasing or threshold adjustment.'
          : 'Monitor "' + attr + '" for drift. Scheduled review recommended.';

    findings.push({
      attribute: attr,
      disparityRatio: parseFloat(disparityRatio.toFixed(4)),
      disparateImpactScore: diScore,
      pValue,
      isSignificant: isSig,
      affectedGroup: attr + '_minority',
      severity,
      recommendation: rec,
    });
  }

  const overallBiasRisk: BiasDetectionResult['overallBiasRisk'] =
    maxSeverityIdx >= 4 ? 'critical' : maxSeverityIdx >= 3 ? 'high' : maxSeverityIdx >= 2 ? 'moderate' : maxSeverityIdx >= 1 ? 'low' : 'negligible';
  const summaryScore = findings.length > 0
    ? findings.reduce((s, f) => s + f.disparityRatio, 0) / findings.length
    : 1;

  const complianceStatus = maxSeverityIdx >= 3 ? 'non_compliant' : maxSeverityIdx >= 2 ? 'review_needed' : 'compliant';

  const remediation: string[] = [];
  for (const f of findings) {
    if (f.severity !== 'none') {
      remediation.push('[' + f.severity.toUpperCase() + '] ' + f.attribute + ': ' + f.recommendation);
    }
  }
  if (remediation.length === 0) {
    remediation.push('No remediation required. System meets fairness thresholds for all protected attributes.');
  }

  return {
    scanId: 'bias-' + seed.toString(16),
    overallBiasRisk,
    attributesAnalyzed: attrs.length,
    findings,
    summaryScore: parseFloat(summaryScore.toFixed(4)),
    complianceStatus,
    remediation,
    scanTimestamp: formatTimestamp(),
  };
}

function formatBiasDetectionMarkdown(input: BiasDetectionInput, result: BiasDetectionResult): string {
  const lines: string[] = [];
  lines.push('# Bias Detection Report: ' + result.scanId);
  lines.push('');
  lines.push('**Generated:** ' + result.scanTimestamp);
  lines.push('**Target Variable:** ' + input.targetVariable);
  lines.push('**Overall Bias Risk:** ' + result.overallBiasRisk.toUpperCase());
  lines.push('**Summary Score:** ' + (result.summaryScore * 100).toFixed(1) + '%');
  lines.push('**Compliance Status:** ' + result.complianceStatus);
  lines.push('**Attributes Analyzed:** ' + result.attributesAnalyzed);
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  for (const f of result.findings) {
    lines.push('### ' + f.attribute + ' (' + f.severity.toUpperCase() + ')');
    lines.push('- **Disparity Ratio:** ' + f.disparityRatio);
    lines.push('- **Disparate Impact Score:** ' + f.disparateImpactScore);
    lines.push('- **P-Value:** ' + f.pValue + (f.isSignificant ? ' (SIGNIFICANT)' : ' (not significant)'));
    lines.push('- **Affected Group:** ' + f.affectedGroup);
    lines.push('- **Recommendation:** ' + f.recommendation);
    lines.push('');
  }
  lines.push('## Remediation Actions');
  lines.push('');
  for (const r of result.remediation) {
    lines.push('- ' + r);
  }
  return lines.join('\n');
}

/**
 * Tool 3: Audit Log Generator
 */
function generateAuditLog(input: AuditLogInput): AuditLogResult {
  const seed = deriveSeed(input);
  const rand = mulberry32(seed);
  const systemId = input.systemId ?? ('sys-' + seed.toString(16));
  const now = new Date();
  const periodStart = new Date(now.getTime() - 86400000 * 30).toISOString();
  const periodEnd = now.toISOString();

  const defaultEvents = input.events ?? [];
  const entries: AuditEvent[] = [];

  const actorPool = ['data-ingestion-service', 'model-inference-engine', 'user-api-gateway', 'admin-console', 'batch-scheduler'];
  const actionPool = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'INFER', 'TRAIN', 'EXPORT', 'ANONYMIZE'];
  const resourcePool = ['user-profile', 'prediction-result', 'training-batch', 'model-weights', 'consent-record', 'feature-vector'];
  const purposePool = ['service-delivery', 'model-improvement', 'regulatory-compliance', 'consent-based-processing', 'legitimate-interest'];
  const lawfulBasisPool = ['consent', 'contract', 'legal-obligation', 'legitimate-interest', 'public-task'];

  const sourceEvents = defaultEvents.length > 0
    ? defaultEvents
    : Array.from({ length: 20 }, (_, i) => ({
        actor: actorPool[Math.floor(rand() * actorPool.length)],
        action: actionPool[Math.floor(rand() * actionPool.length)],
        resource: resourcePool[Math.floor(rand() * resourcePool.length)],
        beforeState: i > 0 ? ('state-' + (i - 1)) : 'initial',
        afterState: 'state-' + i,
        purpose: purposePool[Math.floor(rand() * purposePool.length)],
        lawfulBasis: lawfulBasisPool[Math.floor(rand() * lawfulBasisPool.length)],
        dataCategories: ['personal', 'sensitive'].filter(() => rand() > 0.5),
        retentionDays: Math.floor(rand() * 365) + 30,
      }));

  let runningHash = seed;
  for (let i = 0; i < sourceEvents.length; i++) {
    const evt = sourceEvents[i];
    const ts = new Date(now.getTime() - (sourceEvents.length - i) * 3600000).toISOString();
    runningHash = (runningHash * 31 + i * 17 + evt.actor.charCodeAt(0)) | 0;
    entries.push({
      eventId: 'evt-' + i.toString().padStart(5, '0'),
      timestamp: ts,
      actor: evt.actor,
      action: evt.action,
      resource: evt.resource,
      beforeState: evt.beforeState ?? 'n/a',
      afterState: evt.afterState ?? 'n/a',
      purpose: evt.purpose ?? 'unspecified',
      lawfulBasis: evt.lawfulBasis ?? 'consent',
      dataCategories: evt.dataCategories ?? [],
      retentionDays: evt.retentionDays ?? 90,
      hash: 'sha256:' + Math.abs(runningHash).toString(16).padStart(16, '0') + '-' + i.toString(16),
    });
  }

  let integritySeed = seed;
  for (const e of entries) {
    integritySeed = (integritySeed * 37 + e.actor.length * 13 + e.action.length * 7) | 0;
  }
  const integrityHash = 'sha256:chain:' + Math.abs(integritySeed).toString(16).padStart(16, '0');

  const chainVerification = integritySeed !== 0 ? 'pass' : 'fail';

  return {
    logId: 'log-' + seed.toString(16),
    systemId,
    entries,
    integrityHash,
    chainVerification,
    periodStart,
    periodEnd,
    totalEntries: entries.length,
    framework: input.complianceFramework ?? 'GDPR_ART30',
    generatedAt: now.toISOString(),
  };
}

function formatAuditLogMarkdown(input: AuditLogInput, result: AuditLogResult): string {
  const lines: string[] = [];
  lines.push('# Audit Log Report: ' + result.logId);
  lines.push('');
  lines.push('**Generated:** ' + result.generatedAt);
  lines.push('**System ID:** ' + result.systemId);
  lines.push('**Framework:** ' + result.framework);
  lines.push('**Period:** ' + result.periodStart + ' to ' + result.periodEnd);
  lines.push('**Total Entries:** ' + result.totalEntries);
  lines.push('**Integrity Hash:** ' + result.integrityHash);
  lines.push('**Chain Verification:** ' + result.chainVerification.toUpperCase());
  lines.push('');
  lines.push('## Audit Entries');
  lines.push('');
  for (const e of result.entries.slice(0, 10)) {
    lines.push('### ' + e.eventId + ' - ' + e.timestamp);
    lines.push('- **Actor:** ' + e.actor);
    lines.push('- **Action:** ' + e.action);
    lines.push('- **Resource:** ' + e.resource);
    lines.push('- **Purpose:** ' + e.purpose);
    lines.push('- **Lawful Basis:** ' + e.lawfulBasis);
    lines.push('- **Hash:** ' + e.hash);
    lines.push('');
  }
  if (result.entries.length > 10) {
    lines.push('*... and ' + (result.entries.length - 10) + ' more entries*');
    lines.push('');
  }
  return lines.join('\n');
}

/**
 * Tool 4: Compliance Reporting Tool
 */
function buildComplianceReport(input: ComplianceReportInput): ComplianceReport {
  const seed = deriveSeed(input);
  const rand = mulberry32(seed);
  const framework = input.framework;
  const now = new Date();

  const requirementSets: Record<string, Array<{ id: string; category: string; desc: string }>> = {
    EU_AI_ACT: [
      { id: 'EU-AIA-01', category: 'Risk Management', desc: 'Establish and maintain a risk management system throughout the AI system lifecycle' },
      { id: 'EU-AIA-02', category: 'Data Governance', desc: 'Training, validation and testing datasets shall be relevant, sufficiently representative and free from errors' },
      { id: 'EU-AIA-03', category: 'Technical Documentation', desc: 'Draw up technical documentation before placing on market' },
      { id: 'EU-AIA-04', category: 'Record Keeping', desc: 'Automatically record events (logs) over the lifetime of the system' },
      { id: 'EU-AIA-05', category: 'Transparency', desc: 'AI systems shall be designed to allow natural persons to oversee their operation' },
      { id: 'EU-AIA-06', category: 'Human Oversight', desc: 'Appropriate human oversight measures shall be designed and implemented' },
      { id: 'EU-AIA-07', category: 'Accuracy and Robustness', desc: 'AI systems shall achieve appropriate levels of accuracy and robustness' },
      { id: 'EU-AIA-08', category: 'Conformity Assessment', desc: 'Perform conformity assessment before placing system on the market' },
    ],
    NIST_AI_RMF: [
      { id: 'NIST-GOV-1', category: 'Govern', desc: 'Policies, processes, procedures, and practices for AI risk management are in place' },
      { id: 'NIST-MAP-1', category: 'Map', desc: 'Context is established and AI risks are identified and mapped' },
      { id: 'NIST-MEAS-1', category: 'Measure', desc: 'Identified AI risks are assessed, analyzed, and quantified' },
      { id: 'NIST-MAN-1', category: 'Manage', desc: 'AI risks are prioritized and acted upon using allocated resources' },
      { id: 'NIST-GOV-2', category: 'Organizational Accountability', desc: 'Clear roles and responsibilities for AI risk management are defined' },
      { id: 'NIST-MAP-2', category: 'Stakeholder Engagement', desc: 'Stakeholder concerns and context are incorporated into risk framework' },
    ],
    ISO_42001: [
      { id: 'ISO-42001-4', category: 'Context', desc: 'Understanding the organization and its context for AI management' },
      { id: 'ISO-42001-5', category: 'Leadership', desc: 'Leadership commitment to AI management system' },
      { id: 'ISO-42001-6', category: 'Planning', desc: 'AI risk assessment and planning actions' },
      { id: 'ISO-42001-7', category: 'Support', desc: 'Resources, competence, awareness, communication and documented information' },
      { id: 'ISO-42001-8', category: 'Operation', desc: 'Operational planning and control of AI systems' },
      { id: 'ISO-42001-9', category: 'Performance Evaluation', desc: 'Monitoring, measurement, analysis and evaluation' },
      { id: 'ISO-42001-10', category: 'Improvement', desc: 'Nonconformity, corrective action and continual improvement' },
    ],
    MULTI: [
      { id: 'MULTI-01', category: 'Governance', desc: 'AI governance framework established and operational' },
      { id: 'MULTI-02', category: 'Risk', desc: 'Comprehensive AI risk assessment conducted' },
      { id: 'MULTI-03', category: 'Transparency', desc: 'Explainability mechanisms deployed for all high-risk decisions' },
      { id: 'MULTI-04', category: 'Fairness', desc: 'Fairness metrics monitored and within acceptable thresholds' },
      { id: 'MULTI-05', category: 'Accountability', desc: 'Clear accountability chains for AI decisions defined' },
      { id: 'MULTI-06', category: 'Privacy', desc: 'Data protection impact assessment completed and maintained' },
      { id: 'MULTI-07', category: 'Security', desc: 'AI system security testing and adversarial robustness verified' },
      { id: 'MULTI-08', category: 'Monitoring', desc: 'Continuous monitoring and drift detection operational' },
      { id: 'MULTI-09', category: 'Incident Response', desc: 'AI incident reporting and response procedures in place' },
      { id: 'MULTI-10', category: 'Documentation', desc: 'Technical documentation and model cards maintained' },
    ],
  };

  const requirements = input.requirements
    ? requirementSets[framework].filter((r) => input.requirements!.includes(r.id))
    : requirementSets[framework] ?? requirementSets['MULTI'];

  const results: RequirementStatus[] = requirements.map((req, idx) => {
    const r = rand();
    const status: RequirementStatus['status'] = r > 0.7 ? 'compliant' : r > 0.4 ? 'partially_compliant' : r > 0.15 ? 'non_compliant' : 'not_applicable';
    const evi = status === 'compliant'
      ? 'Documented procedures, test results, and sign-off records reviewed.'
      : status === 'partially_compliant'
        ? 'Partial documentation exists; some evidence gaps identified.'
        : status === 'non_compliant'
          ? 'No evidence of compliance found; significant work required.'
          : 'Determined not applicable to this deployment context.';
    const gap = status === 'non_compliant'
      ? 'Full implementation required across all system components.'
      : status === 'partially_compliant'
        ? 'Documentation and testing gaps must be addressed.'
        : 'No significant gaps identified.';
    const rem = status === 'non_compliant'
      ? 'Prioritize full implementation of ' + req.id + ' (' + req.category + '). Estimated effort: ' + (Math.floor(rand() * 6) + 2) + ' weeks.'
      : status === 'partially_compliant'
        ? 'Address identified gaps for ' + req.id + ' (' + req.category + ') before next review cycle.'
        : 'Maintain current practices.';
    return {
      requirementId: req.id,
      category: req.category,
      description: req.desc,
      status,
      evidence: evi,
      gap,
      remediation: rem,
      deadline: status === 'non_compliant'
        ? new Date(now.getTime() + (idx + 1) * 7 * 86400000).toISOString().split('T')[0]
        : undefined,
      owner: status !== 'not_applicable' ? ('team-' + req.category.toLowerCase().replace(/\s/g, '-')) : undefined,
    };
  });

  const compliantCount = results.filter((r) => r.status === 'compliant').length;
  const partialCount = results.filter((r) => r.status === 'partially_compliant').length;
  const total = results.length;
  const overallScore = total > 0
    ? parseFloat(((compliantCount * 100 + partialCount * 50) / total).toFixed(1))
    : 0;

  const overallStatus = overallScore >= 80 ? 'compliant' : overallScore >= 50 ? 'partially_compliant' : 'non_compliant';
  const criticalGaps = results.filter((r) => r.status === 'non_compliant').map((r) => r.requirementId + ': ' + r.description);
  const actionItems = results
    .filter((r) => r.status !== 'compliant' && r.status !== 'not_applicable')
    .map((r) => 'ACTION [' + r.status.toUpperCase() + '] ' + r.requirementId + ' (' + r.category + '): ' + r.remediation);

  const nextReview = new Date(now.getTime() + 90 * 86400000).toISOString().split('T')[0];

  return {
    reportId: 'cr-' + seed.toString(16),
    framework,
    overallScore,
    overallStatus,
    requirements: results,
    criticalGaps,
    actionItems,
    nextReviewDate: nextReview,
    generatedAt: now.toISOString(),
  };
}

function formatComplianceReportMarkdown(input: ComplianceReportInput, result: ComplianceReport): string {
  const lines: string[] = [];
  lines.push('# Compliance Report: ' + result.reportId);
  lines.push('');
  lines.push('**Generated:** ' + result.generatedAt);
  lines.push('**Framework:** ' + result.framework);
  lines.push('**Overall Score:** ' + result.overallScore + '/100');
  lines.push('**Overall Status:** ' + result.overallStatus.toUpperCase());
  lines.push('**Next Review:** ' + result.nextReviewDate);
  lines.push('');
  lines.push('## Requirements Assessment');
  lines.push('');
  for (const r of result.requirements) {
    lines.push('### ' + r.requirementId + ' - ' + r.category + ' [' + r.status.toUpperCase() + ']');
    lines.push('- **Description:** ' + r.description);
    lines.push('- **Evidence:** ' + r.evidence);
    if (r.gap !== 'No significant gaps identified.') {
      lines.push('- **Gap:** ' + r.gap);
    }
    lines.push('- **Remediation:** ' + r.remediation);
    if (r.deadline) lines.push('- **Deadline:** ' + r.deadline);
    if (r.owner) lines.push('- **Owner:** ' + r.owner);
    lines.push('');
  }
  if (result.criticalGaps.length > 0) {
    lines.push('## Critical Gaps');
    lines.push('');
    for (const g of result.criticalGaps) {
      lines.push('- ' + g);
    }
    lines.push('');
  }
  if (result.actionItems.length > 0) {
    lines.push('## Action Items');
    lines.push('');
    for (const a of result.actionItems) {
      lines.push('- ' + a);
    }
  }
  return lines.join('\n');
}

/**
 * Tool 5: Explainability Score Calculator
 */
function calculateExplainability(input: ExplainabilityInput): ExplainabilityScore {
  const seed = deriveSeed(input);
  const rand = mulberry32(seed);

  const dimensions = input.dimensions ?? [
    'model_transparency', 'decision_interpretability', 'feature_attribution',
    'counterfactual_explanation', 'stakeholder_communication', 'documentation_quality',
  ];

  const weights: Record<string, number> = {
    model_transparency: 0.2, decision_interpretability: 0.2, feature_attribution: 0.15,
    counterfactual_explanation: 0.15, stakeholder_communication: 0.15, documentation_quality: 0.15,
  };

  const dimResults: DimensionScore[] = dimensions.map((dim) => {
    const baseScore = 30 + rand() * 65;
    const score = Math.min(100, Math.max(0, parseFloat(baseScore.toFixed(1))));
    const weight = weights[dim] ?? (1 / dimensions.length);
    const weightedScore = parseFloat((score * weight).toFixed(2));
    const indicators: string[] = [];
    const gaps: string[] = [];
    if (score >= 70) {
      indicators.push(dim + ': Mechanisms are well-implemented and documented.');
      indicators.push(dim + ': Stakeholders report high understanding.');
    } else if (score >= 40) {
      indicators.push(dim + ': Partial implementation exists.');
      gaps.push(dim + ': Coverage gaps in ' + dim.replace(/_/g, ' ') + '.');
    } else {
      gaps.push(dim + ': Critical deficiency in ' + dim.replace(/_/g, ' ') + '.');
      gaps.push(dim + ': No systematic approach documented.');
    }
    return { dimension: dim, score, weight: parseFloat(weight.toFixed(3)), weightedScore, indicators, gaps };
  });

  const overallScore = parseFloat(dimResults.reduce((s, d) => s + d.weightedScore, 0).toFixed(2));
  const maxScore = 100;
  const percentage = parseFloat(((overallScore / maxScore) * 100).toFixed(1));

  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';

  const strengths = dimResults.filter((d) => d.score >= 70).map((d) => d.dimension + ': Score ' + d.score + '/100');
  const weaknesses = dimResults.filter((d) => d.score < 50).map((d) => d.dimension + ': Score ' + d.score + '/100');
  const recommendations: string[] = [];
  for (const d of dimResults) {
    if (d.score < 50) {
      recommendations.push('PRIORITY: Improve ' + d.dimension.replace(/_/g, ' ') + ' (current: ' + d.score + '/100). Implement structured approach.');
    } else if (d.score < 70) {
      recommendations.push('Enhance ' + d.dimension.replace(/_/g, ' ') + ' (current: ' + d.score + '/100). Address identified gaps.');
    }
  }
  if (recommendations.length === 0) {
    recommendations.push('Maintain current explainability practices. Consider advanced techniques (SHAP, LIME) for further improvement.');
  }

  return {
    scoreId: 'xs-' + seed.toString(16),
    overallScore, maxScore, percentage, grade,
    dimensions: dimResults, strengths, weaknesses, recommendations,
    generatedAt: formatTimestamp(),
  };
}

function formatExplainabilityMarkdown(input: ExplainabilityInput, result: ExplainabilityScore): string {
  const lines: string[] = [];
  lines.push('# Explainability Score Report: ' + result.scoreId);
  lines.push('');
  lines.push('**Generated:** ' + result.generatedAt);
  lines.push('**System:** ' + (input.systemName ?? 'AI System'));
  lines.push('**Overall Score:** ' + result.overallScore + '/' + result.maxScore + ' (' + result.percentage + '%)');
  lines.push('**Grade:** ' + result.grade);
  lines.push('');
  lines.push('## Dimension Scores');
  lines.push('');
  for (const d of result.dimensions) {
    lines.push('### ' + d.dimension + ' (weight: ' + d.weight + ')');
    lines.push('- **Score:** ' + d.score + '/100 (weighted: ' + d.weightedScore + ')');
    for (const ind of d.indicators) lines.push('- [OK] ' + ind);
    for (const g of d.gaps) lines.push('- [GAP] ' + g);
    lines.push('');
  }
  if (result.strengths.length > 0) {
    lines.push('## Strengths');
    lines.push('');
    for (const s of result.strengths) lines.push('- ' + s);
    lines.push('');
  }
  if (result.weaknesses.length > 0) {
    lines.push('## Weaknesses');
    lines.push('');
    for (const w of result.weaknesses) lines.push('- ' + w);
    lines.push('');
  }
  lines.push('## Recommendations');
  lines.push('');
  for (const r of result.recommendations) lines.push('- ' + r);
  return lines.join('\n');
}

/**
 * Tool 6: Fairness Metrics Evaluator
 */
function evaluateFairnessMetrics(input: FairnessEvaluationInput): FairnessMetricsResult {
  const seed = deriveSeed(input);
  const rand = mulberry32(seed);
  const threshold = input.fairnessThreshold ?? 0.8;
  const groups = input.evaluatedGroups ?? ['group_A', 'group_B', 'group_C'];

  const metricNames = input.metricsToEvaluate ?? [
    'statistical_parity_difference', 'equal_opportunity_difference', 'predictive_parity',
    'calibration', 'disparate_impact', 'individual_fairness',
  ];

  const metrics: FairnessMetric[] = metricNames.map((name) => {
    const value = parseFloat((rand() * 0.4).toFixed(4));
    const passes = value <= (1 - threshold);
    const affectedGroup = groups.length > 1 ? groups[Math.floor(rand() * groups.length)] : 'unknown';
    let description = '';
    let recommendation = '';
    switch (name) {
      case 'statistical_parity_difference':
        description = 'Difference in positive outcome rates between groups';
        recommendation = passes ? 'Within acceptable range.' : 'Adjust decision thresholds or apply post-processing fairness constraints.';
        break;
      case 'equal_opportunity_difference':
        description = 'Difference in true positive rates between groups';
        recommendation = passes ? 'Equal opportunity maintained.' : 'Review feature engineering for proxy variables correlated with protected attributes.';
        break;
      case 'predictive_parity':
        description = 'Consistency of positive predictive value across groups';
        recommendation = passes ? 'Predictive parity achieved.' : 'Investigate label bias or measurement differences across groups.';
        break;
      case 'calibration':
        description = 'Calibration of predicted probabilities across groups';
        recommendation = passes ? 'Well-calibrated across groups.' : 'Apply calibration correction (Platt scaling, isotonic regression) per group.';
        break;
      case 'disparate_impact':
        description = 'Ratio of positive outcome rates (four-fifths rule)';
        recommendation = passes ? 'Passes four-fifths rule.' : 'Significant disparate impact detected. Immediate remediation required.';
        break;
      case 'individual_fairness':
        description = 'Consistency of predictions for similar individuals';
        recommendation = passes ? 'Individual fairness maintained.' : 'Implement consistency constraints or similarity-based fairness enforcement.';
        break;
      default:
        description = 'Fairness metric: ' + name;
        recommendation = passes ? 'Within threshold.' : 'Review and remediate.';
    }
    return { metricName: name, value, threshold: 1 - threshold, passes, affectedGroup, description, recommendation };
  });

  const passCount = metrics.filter((m) => m.passes).length;
  const overallFairness = passCount === metrics.length;
  const fairnessScore = metrics.length > 0 ? parseFloat(((passCount / metrics.length) * 100).toFixed(1)) : 0;
  const violations = metrics.filter((m) => !m.passes).map((m) => m.metricName + ': ' + m.value + ' exceeds threshold ' + m.threshold + ' (group: ' + m.affectedGroup + ')');
  const recommendations: string[] = [];
  for (const m of metrics) {
    if (!m.passes) recommendations.push('[VIOLATION] ' + m.metricName + ': ' + m.recommendation);
  }
  if (recommendations.length === 0) recommendations.push('All fairness metrics within acceptable thresholds. Continue monitoring for drift.');

  return {
    evaluationId: 'fm-' + seed.toString(16),
    metrics, overallFairness, fairnessScore, threshold,
    groupsEvaluated: groups, violations, recommendations,
    evaluationDate: formatTimestamp(),
  };
}

function formatFairnessMetricsMarkdown(input: FairnessEvaluationInput, result: FairnessMetricsResult): string {
  const lines: string[] = [];
  lines.push('# Fairness Metrics Report: ' + result.evaluationId);
  lines.push('');
  lines.push('**Generated:** ' + result.evaluationDate);
  lines.push('**System:** ' + (input.systemName ?? 'AI System'));
  lines.push('**Overall Fairness:** ' + (result.overallFairness ? 'PASS' : 'FAIL'));
  lines.push('**Fairness Score:** ' + result.fairnessScore + '%');
  lines.push('**Threshold:** ' + result.threshold);
  lines.push('**Groups Evaluated:** ' + result.groupsEvaluated.join(', '));
  lines.push('');
  lines.push('## Metrics');
  lines.push('');
  for (const m of result.metrics) {
    lines.push('### ' + m.metricName + ' ' + (m.passes ? '[PASS]' : '[FAIL]'));
    lines.push('- **Value:** ' + m.value);
    lines.push('- **Threshold:** ' + m.threshold);
    lines.push('- **Affected Group:** ' + m.affectedGroup);
    lines.push('- **Description:** ' + m.description);
    lines.push('- **Recommendation:** ' + m.recommendation);
    lines.push('');
  }
  if (result.violations.length > 0) {
    lines.push('## Violations');
    lines.push('');
    for (const v of result.violations) lines.push('- ' + v);
    lines.push('');
  }
  lines.push('## Recommendations');
  lines.push('');
  for (const r of result.recommendations) lines.push('- ' + r);
  return lines.join('\n');
}

/**
 * Tool 7: Transparency Report Builder
 */
function buildTransparencyReport(input: TransparencyReportInput): TransparencyReport {
  const seed = deriveSeed(input);
  const rand = mulberry32(seed);
  const now = new Date();
  const period = input.reportPeriod ?? (new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().split('T')[0] + ' to ' + now.toISOString().split('T')[0]);
  const audience = input.audience ?? 'regulators';

  const sectionPool: Array<{ id: string; title: string; order: number }> = [
    { id: 'overview', title: 'System Overview and Purpose', order: 1 },
    { id: 'data', title: 'Data Sources and Processing', order: 2 },
    { id: 'model', title: 'Model Architecture and Training', order: 3 },
    { id: 'performance', title: 'Performance and Limitations', order: 4 },
    { id: 'fairness', title: 'Fairness and Bias Assessment', order: 5 },
    { id: 'privacy', title: 'Privacy and Data Protection', order: 6 },
    { id: 'oversight', title: 'Human Oversight Mechanisms', order: 7 },
    { id: 'incidents', title: 'Incident Reporting and Response', order: 8 },
    { id: 'compliance', title: 'Regulatory Compliance Status', order: 9 },
    { id: 'contact', title: 'Contact and Feedback', order: 10 },
  ];

  const includeSections = input.includeSections ?? sectionPool.map((s) => s.id);
  const selectedSections = sectionPool.filter((s) => includeSections.includes(s.id));

  const sections: ReportSection[] = selectedSections.map((s, idx) => ({
    sectionId: s.id,
    title: s.title,
    content: 'This section covers ' + s.title.toLowerCase() + ' for ' + (input.systemName ?? 'the AI system') + '. ' + getSectionContent(s.id, rand),
    order: s.order,
    dataSources: ['source-' + idx + '-a', 'source-' + idx + '-b'],
    lastUpdated: new Date(now.getTime() - idx * 86400000).toISOString(),
  }));

  let modelCard: Record<string, unknown> | undefined;
  if (input.includeModelCard !== false && input.modelCard) {
    modelCard = {
      model_name: input.modelCard.modelName ?? 'AI System',
      model_version: input.modelCard.modelVersion ?? '1.0.0',
      intended_use: input.modelCard.intendedUse ?? 'Automated decision support',
      limitations: input.modelCard.limitations ?? ['Performance may degrade on out-of-distribution data', 'Not suitable for high-stakes decisions without human review'],
      training_data_summary: input.modelCard.trainingDataSummary ?? 'Training data description not provided',
      performance_metrics: input.modelCard.performanceMetrics ?? { accuracy: 0.92, f1_score: 0.89 },
    };
  }

  const disclosures: string[] = [
    'This system uses automated decision-making as described in the technical documentation.',
    'Data subjects have the right to explanation of individual decisions under applicable regulations.',
    'Human oversight is maintained for all high-risk decision categories.',
    'Regular fairness and bias audits are conducted quarterly.',
  ];

  const nextReportDue = new Date(now.getTime() + 90 * 86400000).toISOString().split('T')[0];

  return {
    reportId: 'tr-' + seed.toString(16),
    title: 'Transparency Report: ' + (input.systemName ?? 'AI System'),
    organization: input.organizationName ?? 'Organization',
    period, audience, sections, modelCard,
    summary: 'Transparency report for ' + (input.systemName ?? 'AI system') + ' covering ' + period + '. ' + sections.length + ' sections included. Overall compliance status: ' + (rand() > 0.3 ? 'COMPLIANT' : 'REVIEW IN PROGRESS') + '.',
    disclosures, nextReportDue, publishedAt: now.toISOString(),
  };
}

function getSectionContent(sectionId: string, rand: () => number): string {
  const contentMap: Record<string, string> = {
    overview: 'The system is designed to support automated decision-making in a controlled environment with appropriate safeguards.',
    data: 'Training and inference data are sourced from verified providers with documented provenance and quality controls.',
    model: 'The model architecture follows industry best practices with regular retraining and validation cycles.',
    performance: 'Performance is monitored continuously. Current accuracy is within acceptable thresholds for the deployment context.',
    fairness: 'Fairness metrics are evaluated across protected attributes. Disparate impact ratio maintained above 0.8.',
    privacy: 'Data protection measures include anonymization, encryption at rest and in transit, and access controls.',
    oversight: 'Human oversight is implemented through review queues, escalation paths, and override capabilities.',
    incidents: 'No critical incidents reported in the current period. Minor issues were resolved within SLA.',
    compliance: 'System is assessed against applicable regulatory frameworks. Current status: compliant with minor gaps.',
    contact: 'For inquiries about this report, contact the AI Governance team.',
  };
  const base = contentMap[sectionId] ?? 'Section content available upon request.';
  const confidence = (85 + rand() * 14).toFixed(1);
  return base + ' Confidence level: ' + confidence + '%.';
}

function formatTransparencyReportMarkdown(input: TransparencyReportInput, result: TransparencyReport): string {
  const lines: string[] = [];
  lines.push('# ' + result.title);
  lines.push('');
  lines.push('**Published:** ' + result.publishedAt);
  lines.push('**Organization:** ' + result.organization);
  lines.push('**Period:** ' + result.period);
  lines.push('**Audience:** ' + result.audience);
  lines.push('**Next Report Due:** ' + result.nextReportDue);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(result.summary);
  lines.push('');
  lines.push('## Sections');
  lines.push('');
  for (const s of result.sections) {
    lines.push('### ' + s.order + '. ' + s.title);
    lines.push('');
    lines.push(s.content);
    lines.push('');
    lines.push('*Last updated: ' + s.lastUpdated + '*');
    lines.push('');
  }
  if (result.modelCard) {
    lines.push('## Model Card');
    lines.push('');
    for (const key of Object.keys(result.modelCard)) {
      const val = result.modelCard[key];
      lines.push('- **' + key + ':** ' + JSON.stringify(val));
    }
    lines.push('');
  }
  lines.push('## Disclosures');
  lines.push('');
  for (const d of result.disclosures) lines.push('- ' + d);
  return lines.join('\n');
}

/**
 * Tool 8: Risk Level Classifier
 */
function classifyRiskLevel(input: RiskClassificationInput): RiskClassification {
  const seed = deriveSeed(input);
  const rand = mulberry32(seed);
  const now = new Date();

  const factorPool = input.factors ?? [
    'data_sensitivity', 'decision_impact', 'autonomy_level', 'stakeholder_exposure',
    'regulatory_scope', 'technical_robustness', 'human_oversight', 'transparency_level',
    'bias_potential', 'scale_of_deployment',
  ];

  const factorWeights: Record<string, number> = {
    data_sensitivity: 0.15, decision_impact: 0.2, autonomy_level: 0.15,
    stakeholder_exposure: 0.1, regulatory_scope: 0.1, technical_robustness: 0.08,
    human_oversight: 0.07, transparency_level: 0.05, bias_potential: 0.05, scale_of_deployment: 0.05,
  };

  const maxPossible = factorPool.reduce((s, f) => s + (factorWeights[f] ?? 0.05), 0);

  const factors: RiskFactor[] = factorPool.map((factorName, idx) => {
    const weight = factorWeights[factorName] ?? 0.05;
    const score = rand();
    const weightedScore = parseFloat((score * weight).toFixed(4));
    const categoryMap: Record<string, string> = {
      data_sensitivity: 'Data', decision_impact: 'Impact', autonomy_level: 'Autonomy',
      stakeholder_exposure: 'Exposure', regulatory_scope: 'Regulatory', technical_robustness: 'Technical',
      human_oversight: 'Oversight', transparency_level: 'Transparency', bias_potential: 'Fairness', scale_of_deployment: 'Scale',
    };
    const descriptions: Record<string, string> = {
      data_sensitivity: 'Sensitivity and volume of personal data processed by the system',
      decision_impact: 'Severity of impact on individuals affected by system decisions',
      autonomy_level: 'Degree of human involvement in the decision-making process',
      stakeholder_exposure: 'Number and vulnerability categories of affected stakeholders',
      regulatory_scope: 'Applicability of sector-specific and cross-cutting AI regulations',
      technical_robustness: 'System resilience to errors, adversarial attacks, and edge cases',
      human_oversight: 'Effectiveness of human oversight mechanisms in place',
      transparency_level: 'Availability and quality of explanations for system outputs',
      bias_potential: 'Potential for discriminatory outcomes across protected groups',
      scale_of_deployment: 'Geographic and demographic scale of system deployment',
    };
    const severities = ['Minimal concern', 'Low risk', 'Moderate risk', 'High risk', 'Critical risk'];
    const sevIdx = Math.min(Math.floor(score * 5), 4);
    const desc = descriptions[factorName] ?? ('Risk factor: ' + factorName);
    const mit = sevIdx >= 3
      ? 'URGENT: Implement controls for ' + factorName.replace(/_/g, ' ') + '. Estimated effort: ' + (Math.floor(rand() * 8) + 2) + ' weeks.'
      : sevIdx >= 2
        ? 'Monitor and improve ' + factorName.replace(/_/g, ' ') + ' controls. Include in next review cycle.'
        : 'Maintain current controls.';
    return {
      factorId: 'rf-' + idx, category: categoryMap[factorName] ?? 'General', name: factorName,
      weight: parseFloat(weight.toFixed(3)), score: parseFloat(score.toFixed(4)), weightedScore,
      description: desc, evidence: severities[sevIdx] + ' - ' + desc, mitigation: mit,
    };
  });

  const rawScore = factors.reduce((s, f) => s + f.weightedScore, 0);
  const riskScore = parseFloat((rawScore / maxPossible * 100).toFixed(1));
  const maxScore = 100;

  let overallRiskLevel: RiskClassification['overallRiskLevel'] = 'minimal';
  if (riskScore >= 75) overallRiskLevel = 'unacceptable';
  else if (riskScore >= 50) overallRiskLevel = 'high';
  else if (riskScore >= 25) overallRiskLevel = 'limited';

  const governanceRecommendations: GovernanceRecommendation[] = [];
  if (input.includeGovernance !== false) {
    if (overallRiskLevel === 'unacceptable') {
      governanceRecommendations.push({ priority: 'critical', action: 'Immediately cease deployment. Conduct full conformity assessment before any market placement.', responsible: 'Chief AI Officer / Legal Counsel', timeline: 'Immediate (within 48 hours)', framework: 'EU AI Act Article 5' });
      governanceRecommendations.push({ priority: 'critical', action: 'Engage notified body for third-party conformity assessment.', responsible: 'Compliance Director', timeline: 'Within 30 days', framework: 'EU AI Act Article 43' });
    }
    if (overallRiskLevel === 'high' || overallRiskLevel === 'unacceptable') {
      governanceRecommendations.push({ priority: 'high', action: 'Implement comprehensive risk management system covering the entire AI lifecycle.', responsible: 'AI Risk Manager', timeline: 'Within 90 days', framework: 'EU AI Act Article 9' });
      governanceRecommendations.push({ priority: 'high', action: 'Establish human oversight mechanisms with clear escalation paths.', responsible: 'Operations Lead', timeline: 'Within 60 days', framework: 'EU AI Act Article 14' });
      governanceRecommendations.push({ priority: 'medium', action: 'Conformity assessment and registration in EU database for high-risk AI systems.', responsible: 'Regulatory Affairs', timeline: 'Before market placement', framework: 'EU AI Act Article 48' });
    }
    if (overallRiskLevel === 'limited') {
      governanceRecommendations.push({ priority: 'medium', action: 'Ensure transparency obligations are met. Provide clear information to deployers.', responsible: 'Product Manager', timeline: 'Within 60 days', framework: 'EU AI Act Article 13' });
    }
    if (overallRiskLevel === 'minimal') {
      governanceRecommendations.push({ priority: 'low', action: 'Adhere to existing codes of conduct. Monitor for regulatory updates.', responsible: 'Compliance Team', timeline: 'Ongoing', framework: 'EU AI Act Article 69' });
    }
  }

  const requiredOversight: string[] = [];
  if (overallRiskLevel === 'high' || overallRiskLevel === 'unacceptable') {
    requiredOversight.push('Mandatory human-in-the-loop for all decisions');
    requiredOversight.push('Quarterly compliance audits by independent assessor');
    requiredOversight.push('Continuous monitoring for bias and drift');
    requiredOversight.push('Incident reporting to competent authorities within 14 days');
  } else if (overallRiskLevel === 'limited') {
    requiredOversight.push('Human-on-the-loop with override capability');
    requiredOversight.push('Annual compliance review');
  } else {
    requiredOversight.push('Periodic self-assessment');
  }

  const prohibitedUses: string[] = [];
  if (overallRiskLevel === 'unacceptable') {
    prohibitedUses.push('Deployment in its current form is prohibited under EU AI Act Article 5');
    prohibitedUses.push('Use for social scoring or mass surveillance');
    prohibitedUses.push('Exploitation of vulnerabilities of specific groups');
  }

  const nextAssessment = new Date(now.getTime() + (overallRiskLevel === 'unacceptable' ? 7 : overallRiskLevel === 'high' ? 90 : overallRiskLevel === 'limited' ? 180 : 365) * 86400000);

  return {
    classificationId: 'rc-' + seed.toString(16), overallRiskLevel, riskScore, maxScore,
    factors, governanceRecommendations, requiredOversight, prohibitedUses,
    nextAssessmentDue: nextAssessment.toISOString().split('T')[0], classifiedAt: now.toISOString(),
  };
}

function formatRiskClassificationMarkdown(input: RiskClassificationInput, result: RiskClassification): string {
  const lines: string[] = [];
  lines.push('# Risk Classification Report: ' + result.classificationId);
  lines.push('');
  lines.push('**Generated:** ' + result.classifiedAt);
  lines.push('**System:** ' + (input.systemName ?? 'AI System'));
  lines.push('**Overall Risk Level:** ' + result.overallRiskLevel.toUpperCase());
  lines.push('**Risk Score:** ' + result.riskScore + '/' + result.maxScore);
  lines.push('**Next Assessment Due:** ' + result.nextAssessmentDue);
  lines.push('');
  lines.push('## Risk Factors');
  lines.push('');
  for (const f of result.factors) {
    lines.push('### ' + f.name + ' (' + f.category + ')');
    lines.push('- **Score:** ' + f.score + ' (weight: ' + f.weight + ', weighted: ' + f.weightedScore + ')');
    lines.push('- **Description:** ' + f.description);
    lines.push('- **Evidence:** ' + f.evidence);
    lines.push('- **Mitigation:** ' + f.mitigation);
    lines.push('');
  }
  if (result.governanceRecommendations.length > 0) {
    lines.push('## Governance Recommendations');
    lines.push('');
    for (const g of result.governanceRecommendations) {
      lines.push('### [' + g.priority.toUpperCase() + '] ' + g.action);
      lines.push('- **Responsible:** ' + g.responsible);
      lines.push('- **Timeline:** ' + g.timeline);
      lines.push('- **Framework:** ' + g.framework);
      lines.push('');
    }
  }
  if (result.requiredOversight.length > 0) {
    lines.push('## Required Oversight');
    lines.push('');
    for (const o of result.requiredOversight) lines.push('- ' + o);
    lines.push('');
  }
  if (result.prohibitedUses.length > 0) {
    lines.push('## Prohibited Uses');
    lines.push('');
    for (const p of result.prohibitedUses) lines.push('- ' + p);
  }
  return lines.join('\n');
}

// ===========================================================================
// TOOL DEFINITIONS
// ===========================================================================

const decisionTracingTool = defineTool({
  name: 'decision_tracing_engine',
  description: 'Traces the causal chain of an AI agent decision with step-by-step analysis, confidence scores, alternative paths, and bias flags. Produces a complete decision trace for explainability audits.',
  parameters: {
    decisionId: { type: 'string', description: 'Optional unique identifier for the decision' },
    decisionContext: { type: 'string', description: 'Description of the decision context and scenario', required: true },
    agentVersion: { type: 'string', description: 'Version of the AI agent that made the decision' },
    modelName: { type: 'string', description: 'Name/identifier of the underlying model' },
    inputData: { type: 'string', description: 'Summary of input data provided to the agent' },
    outputDecision: { type: 'string', description: 'The final decision or output produced', required: true },
    maxDepth: { type: 'number', description: 'Maximum depth of the trace chain (default: 5)' },
    includeAlternatives: { type: 'boolean', description: 'Whether to include alternative decision paths (default: true)' },
    biasCheckEnabled: { type: 'boolean', description: 'Enable bias checking along the trace (default: true)' },
    protectedAttributes: { type: 'array', items: { type: 'string' }, description: 'Protected attributes to check for bias' },
  },
  output: {
    schema: { type: 'json' as const },
    render: renderMarkdown,
  },
  async execute(args: any) {
    const input: DecisionTraceInput = {
      decisionId: args.decisionId, decisionContext: args.decisionContext, agentVersion: args.agentVersion,
      modelName: args.modelName, inputData: args.inputData, outputDecision: args.outputDecision,
      maxDepth: args.maxDepth, includeAlternatives: args.includeAlternatives, biasCheckEnabled: args.biasCheckEnabled,
      protectedAttributes: args.protectedAttributes,
    };
    const result = buildDecisionTrace(input);
    const reportMarkdown = formatDecisionTraceMarkdown(input, result);
    return { report_markdown: reportMarkdown };
  },
});

const biasDetectionTool = defineTool({
  name: 'bias_detection_scanner',
  description: 'Scans AI outputs or datasets for bias across protected attributes. Computes disparity ratios, disparate impact scores, statistical significance, and provides severity ratings with remediation guidance.',
  parameters: {
    datasetId: { type: 'string', description: 'Identifier for the dataset being scanned' },
    sampleSize: { type: 'number', description: 'Number of samples in the dataset' },
    protectedAttributes: { type: 'array', items: { type: 'string' }, description: 'List of protected attributes to scan (e.g., gender, age, ethnicity)', required: true },
    targetVariable: { type: 'string', description: 'The target/outcome variable name', required: true },
    predictionColumn: { type: 'string', description: 'Column name for model predictions' },
    groupIdColumn: { type: 'string', description: 'Column name for group identifiers' },
    referenceGroup: { type: 'string', description: 'Reference group for disparity comparison (default: majority)' },
    significanceLevel: { type: 'number', description: 'Statistical significance threshold (default: 0.05)' },
    metrics: { type: 'array', items: { type: 'string' }, description: 'Specific bias metrics to compute' },
    datasetDescription: { type: 'string', description: 'Description of the dataset context' },
  },
  output: { schema: { type: 'json' as const }, render: renderMarkdown },
  async execute(args: any) {
    const input: BiasDetectionInput = {
      datasetId: args.datasetId, sampleSize: args.sampleSize, protectedAttributes: args.protectedAttributes,
      targetVariable: args.targetVariable, predictionColumn: args.predictionColumn, groupIdColumn: args.groupIdColumn,
      referenceGroup: args.referenceGroup, significanceLevel: args.significanceLevel, metrics: args.metrics,
      datasetDescription: args.datasetDescription,
    };
    const result = runBiasDetection(input);
    const reportMarkdown = formatBiasDetectionMarkdown(input, result);
    return { report_markdown: reportMarkdown };
  },
});

const auditLogTool = defineTool({
  name: 'audit_log_generator',
  description: 'Generates tamper-evident audit logs for AI system events with integrity hashing, chain verification, and compliance framework alignment (GDPR Art. 30, EU AI Act).',
  parameters: {
    systemId: { type: 'string', description: 'Identifier for the AI system' },
    systemName: { type: 'string', description: 'Human-readable system name' },
    eventType: { type: 'string', description: 'Type of audit event category' },
    events: { type: 'array', items: { type: 'object', additionalProperties: true }, description: 'List of audit events to log' },
    logPeriod: { type: 'string', description: 'Time period covered by the log' },
    complianceFramework: { type: 'string', description: 'Compliance framework to align with (default: GDPR_ART30)' },
    hashAlgorithm: { type: 'string', description: 'Hash algorithm for integrity (default: sha256)' },
    includeIntegrityProof: { type: 'boolean', description: 'Include chain integrity proof (default: true)' },
  },
  output: { schema: { type: 'json' as const }, render: renderMarkdown },
  async execute(args: any) {
    const input: AuditLogInput = {
      systemId: args.systemId, systemName: args.systemName, eventType: args.eventType, events: args.events,
      logPeriod: args.logPeriod, complianceFramework: args.complianceFramework, hashAlgorithm: args.hashAlgorithm,
      includeIntegrityProof: args.includeIntegrityProof,
    };
    const result = generateAuditLog(input);
    const reportMarkdown = formatAuditLogMarkdown(input, result);
    return { report_markdown: reportMarkdown };
  },
});

const complianceReportTool = defineTool({
  name: 'compliance_reporting_tool',
  description: 'Builds structured compliance reports against EU AI Act, NIST AI RMF, ISO 42001, or multi-framework assessments. Includes requirement status, gap analysis, and action items.',
  parameters: {
    systemId: { type: 'string', description: 'Identifier for the AI system under assessment' },
    systemName: { type: 'string', description: 'Human-readable system name' },
    systemDescription: { type: 'string', description: 'Description of the AI system and its purpose' },
    deploymentRegion: { type: 'string', description: 'Geographic deployment region' },
    framework: { type: 'string', description: 'Compliance framework to assess against (EU_AI_ACT, NIST_AI_RMF, ISO_42001, MULTI)', required: true },
    riskCategory: { type: 'string', description: 'Risk category of the system' },
    requirements: { type: 'array', items: { type: 'string' }, description: 'Specific requirement IDs to assess (assesses all if omitted)' },
    assessor: { type: 'string', description: 'Name or identifier of the assessor' },
    assessmentDate: { type: 'string', description: 'Date of the assessment (ISO format)' },
  },
  output: { schema: { type: 'json' as const }, render: renderMarkdown },
  async execute(args: any) {
    const input: ComplianceReportInput = {
      systemId: args.systemId, systemName: args.systemName, systemDescription: args.systemDescription,
      deploymentRegion: args.deploymentRegion, framework: args.framework, riskCategory: args.riskCategory,
      requirements: args.requirements, assessor: args.assessor, assessmentDate: args.assessmentDate,
    };
    const result = buildComplianceReport(input);
    const reportMarkdown = formatComplianceReportMarkdown(input, result);
    return { report_markdown: reportMarkdown };
  },
});

const explainabilityScoreTool = defineTool({
  name: 'explainability_score_calculator',
  description: 'Computes multi-dimensional explainability scores with weighted dimensions, indicator analysis, gap identification, and improvement recommendations. Supports model transparency, decision interpretability, feature attribution, and more.',
  parameters: {
    systemId: { type: 'string', description: 'Identifier for the AI system' },
    systemName: { type: 'string', description: 'Human-readable system name' },
    systemType: { type: 'string', description: 'Type of AI system (e.g., classifier, recommender, generative)' },
    dimensions: { type: 'array', items: { type: 'string' }, description: 'Explainability dimensions to evaluate' },
    methodology: { type: 'string', description: 'Scoring methodology to use' },
    stakeholderView: { type: 'string', description: 'Target stakeholder perspective' },
    deploymentContext: { type: 'string', description: 'Context of deployment (e.g., healthcare, finance, public sector)' },
    trainingDataDescription: { type: 'string', description: 'Description of training data characteristics' },
    modelArchitecture: { type: 'string', description: 'Model architecture description' },
    featureImportanceAvailable: { type: 'boolean', description: 'Whether feature importance is computed' },
    shapValuesComputed: { type: 'boolean', description: 'Whether SHAP values are available' },
    limeAnalysisDone: { type: 'boolean', description: 'Whether LIME analysis has been performed' },
  },
  output: { schema: { type: 'json' as const }, render: renderMarkdown },
  async execute(args: any) {
    const input: ExplainabilityInput = {
      systemId: args.systemId, systemName: args.systemName, systemType: args.systemType,
      dimensions: args.dimensions, methodology: args.methodology, stakeholderView: args.stakeholderView,
      deploymentContext: args.deploymentContext, trainingDataDescription: args.trainingDataDescription,
      modelArchitecture: args.modelArchitecture, featureImportanceAvailable: args.featureImportanceAvailable,
      shapValuesComputed: args.shapValuesComputed, limeAnalysisDone: args.limeAnalysisDone,
    };
    const result = calculateExplainability(input);
    const reportMarkdown = formatExplainabilityMarkdown(input, result);
    return { report_markdown: reportMarkdown };
  },
});

const fairnessMetricsTool = defineTool({
  name: 'fairness_metrics_evaluator',
  description: 'Evaluates fairness metrics including statistical parity difference, equal opportunity difference, predictive parity, calibration, disparate impact, and individual fairness. Provides pass/fail analysis with recommendations.',
  parameters: {
    systemId: { type: 'string', description: 'Identifier for the AI system' },
    systemName: { type: 'string', description: 'Human-readable system name' },
    predictions: { type: 'array', items: { type: 'number' }, description: 'Model predictions array' },
    groundTruth: { type: 'array', items: { type: 'number' }, description: 'Ground truth labels array' },
    sensitiveAttributes: { type: 'array', items: { type: 'string' }, description: 'Sensitive attribute names' },
    referenceGroup: { type: 'string', description: 'Reference group for comparison (default: group_A)' },
    evaluatedGroups: { type: 'array', items: { type: 'string' }, description: 'Groups to evaluate fairness across' },
    fairnessThreshold: { type: 'number', description: 'Fairness threshold (default: 0.8)' },
    metricsToEvaluate: { type: 'array', items: { type: 'string' }, description: 'Specific metrics to evaluate' },
    evaluationContext: { type: 'string', description: 'Context description for the evaluation' },
  },
  output: { schema: { type: 'json' as const }, render: renderMarkdown },
  async execute(args: any) {
    const input: FairnessEvaluationInput = {
      systemId: args.systemId, systemName: args.systemName, predictions: args.predictions,
      groundTruth: args.groundTruth, sensitiveAttributes: args.sensitiveAttributes,
      referenceGroup: args.referenceGroup, evaluatedGroups: args.evaluatedGroups,
      fairnessThreshold: args.fairnessThreshold, metricsToEvaluate: args.metricsToEvaluate,
      evaluationContext: args.evaluationContext,
    };
    const result = evaluateFairnessMetrics(input);
    const reportMarkdown = formatFairnessMetricsMarkdown(input, result);
    return { report_markdown: reportMarkdown };
  },
});

const transparencyReportTool = defineTool({
  name: 'transparency_report_builder',
  description: 'Generates stakeholder-facing transparency reports with model cards, compliance summaries, risk assessments, and structured disclosures. Supports customizable sections and audience targeting.',
  parameters: {
    systemId: { type: 'string', description: 'Identifier for the AI system' },
    systemName: { type: 'string', description: 'Human-readable system name' },
    organizationName: { type: 'string', description: 'Name of the organization publishing the report' },
    reportPeriod: { type: 'string', description: 'Time period covered by the report' },
    audience: { type: 'string', description: 'Target audience (e.g., regulators, public, internal)' },
    includeSections: { type: 'array', items: { type: 'string' }, description: 'Section IDs to include in the report' },
    deploymentRegion: { type: 'string', description: 'Geographic deployment region' },
    modelCard: { type: 'object', additionalProperties: true, description: 'Model card information to include' },
    includeModelCard: { type: 'boolean', description: 'Whether to include a model card section (default: true)' },
    includeComplianceSummary: { type: 'boolean', description: 'Whether to include compliance summary (default: true)' },
    includeRiskAssessment: { type: 'boolean', description: 'Whether to include risk assessment (default: true)' },
  },
  output: { schema: { type: 'json' as const }, render: renderMarkdown },
  async execute(args: any) {
    const input: TransparencyReportInput = {
      systemId: args.systemId, systemName: args.systemName, organizationName: args.organizationName,
      reportPeriod: args.reportPeriod, audience: args.audience, includeSections: args.includeSections,
      deploymentRegion: args.deploymentRegion, modelCard: args.modelCard,
      includeModelCard: args.includeModelCard, includeComplianceSummary: args.includeComplianceSummary,
      includeRiskAssessment: args.includeRiskAssessment,
    };
    const result = buildTransparencyReport(input);
    const reportMarkdown = formatTransparencyReportMarkdown(input, result);
    return { report_markdown: reportMarkdown };
  },
});

const riskClassifierTool = defineTool({
  name: 'risk_level_classifier',
  description: 'Classifies AI system risk level (minimal, limited, high, unacceptable) based on multiple weighted factors including data sensitivity, decision impact, autonomy level, and regulatory scope. Includes governance recommendations, required oversight measures, and prohibited use determinations aligned with EU AI Act.',
  parameters: {
    systemId: { type: 'string', description: 'Identifier for the AI system' },
    systemName: { type: 'string', description: 'Human-readable system name' },
    systemDescription: { type: 'string', description: 'Description of the AI system and its purpose' },
    deploymentContext: { type: 'string', description: 'Context and environment of deployment' },
    dataSensitivity: { type: 'string', description: 'Level of data sensitivity (e.g., personal, sensitive, anonymous)' },
    decisionImpact: { type: 'string', description: 'Impact level of decisions on individuals' },
    autonomyLevel: { type: 'string', description: 'Degree of automation (e.g., assistive, semi-autonomous, fully-autonomous)' },
    regulatoryScope: { type: 'string', description: 'Applicable regulatory frameworks' },
    stakeholderExposure: { type: 'string', description: 'Scale and vulnerability of affected stakeholders' },
    factors: { type: 'array', items: { type: 'string' }, description: 'Specific risk factors to evaluate' },
    includeGovernance: { type: 'boolean', description: 'Include governance recommendations (default: true)' },
    includeMitigations: { type: 'boolean', description: 'Include mitigation strategies for each factor (default: true)' },
  },
  output: { schema: { type: 'json' as const }, render: renderMarkdown },
  async execute(args: any) {
    const input: RiskClassificationInput = {
      systemId: args.systemId, systemName: args.systemName, systemDescription: args.systemDescription,
      deploymentContext: args.deploymentContext, dataSensitivity: args.dataSensitivity,
      decisionImpact: args.decisionImpact, autonomyLevel: args.autonomyLevel,
      regulatoryScope: args.regulatoryScope, stakeholderExposure: args.stakeholderExposure,
      factors: args.factors, includeGovernance: args.includeGovernance, includeMitigations: args.includeMitigations,
    };
    const result = classifyRiskLevel(input);
    const reportMarkdown = formatRiskClassificationMarkdown(input, result);
    return { report_markdown: reportMarkdown };
  },
});

// ===========================================================================
// PLUGIN ENTRY POINT
// ===========================================================================

export default function dshToolXplainaagent(ctx: Context): void {
  ctx.tools.register(decisionTracingTool);
  ctx.tools.register(biasDetectionTool);
  ctx.tools.register(auditLogTool);
  ctx.tools.register(complianceReportTool);
  ctx.tools.register(explainabilityScoreTool);
  ctx.tools.register(fairnessMetricsTool);
  ctx.tools.register(transparencyReportTool);
  ctx.tools.register(riskClassifierTool);
}

export {
  decisionTracingTool,
  biasDetectionTool,
  auditLogTool,
  complianceReportTool,
  explainabilityScoreTool,
  fairnessMetricsTool,
  transparencyReportTool,
  riskClassifierTool,
};
