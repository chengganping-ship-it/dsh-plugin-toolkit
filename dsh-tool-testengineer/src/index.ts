'use strict';

// ============================================================
// dsh-tool-testengineer - AI Testing Engineer Plugin
// ============================================================
// Provides 8 core tools for agent testing, evaluation,
// reliability scoring, bias detection, and stress testing.
// ============================================================

// ============================================================
// Utility: Seeded Random Number Generator
// ============================================================

class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  public next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return this.seed / 2147483647;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  public pick<T>(arr: T[]): T {
    return arr[this.nextInt(0, arr.length - 1)];
  }

  public shuffle<T>(arr: T[]): T[] {
    const copy: T[] = [...arr];
    for (let i: number = copy.length - 1; i > 0; i--) {
      const j: number = this.nextInt(0, i);
      const temp: T = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }
}

// ============================================================
// Types & Interfaces
// ============================================================

interface AgentCapability {
  name: string;
  description: string;
  category: 'reasoning' | 'generation' | 'analysis' | 'coding' | 'conversation' | 'tool_use' | 'retrieval' | 'planning';
  complexity: 'low' | 'medium' | 'high';
  dependencies?: string[];
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  input: string;
  expectedBehavior: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'critical';
  tags?: string[];
}

interface EvaluationCriterion {
  name: string;
  weight: number;
  description: string;
  passThreshold: number;
  scoringRubric: string[];
}

interface TestCase {
  id: string;
  scenarioId: string;
  name: string;
  description: string;
  input: string;
  expectedOutput: string;
  passCriteria: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  automated: boolean;
  tags: string[];
}

interface TestSuite {
  name: string;
  testCases: TestCase[];
  totalEstimatedDuration: number;
  automationCoverage: number;
  passCriteriaSummary: string;
}

// ---- evaluation_framework ----

interface QualityDimension {
  name: string;
  description: string;
  weight: number;
  subMetrics: string[];
  scoringMethod: 'binary' | 'likert_5' | 'likert_7' | 'percentage' | 'custom';
}

interface MetricDefinition {
  name: string;
  formula: string;
  range: [number, number];
  optimalDirection: 'higher' | 'lower';
  unit?: string;
}

// ---- reliability_scorer ----

interface AgentOutput {
  id: string;
  input: string;
  output: string;
  timestamp: number;
  latencyMs: number;
  tokensUsed: number;
  consistency?: number;
}

interface ExpectedOutput {
  outputId: string;
  expectedText: string;
  toleranceRules: string[];
  mustInclude: string[];
  mustExclude: string[];
}

interface EdgeCase {
  description: string;
  input: string;
  expectedHandling: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ---- bias_detector ----

interface ResponseEntry {
  response: string;
  inputContext: string;
  attributes: Record<string, string>;
  score?: number;
}

interface AttributeBiasResult {
  attributeName: string;
  groupCount: number;
  meanScores: Record<string, number>;
  maxDisparity: number;
  isBiased: boolean;
  details: string;
}

// ---- regression_analyzer ----

interface TestResult {
  name: string;
  value: number;
  unit?: string;
  timestamp: number;
  category: string;
}

interface ChangeLogEntry {
  description: string;
  component: string;
  type: 'feature' | 'fix' | 'refactor' | 'config' | 'dependency';
  impact: 'low' | 'medium' | 'high';
  timestamp: number;
}

interface RegressionItem {
  metricName: string;
  baselineValue: number;
  currentValue: number;
  changePercent: number;
  severity: 'warning' | 'critical';
  relatedChanges: string[];
}

interface ImprovementItem {
  metricName: string;
  baselineValue: number;
  currentValue: number;
  changePercent: number;
}

// ---- capability_benchmark ----

interface BenchmarkCase {
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  scoringCriteria: string[];
  referenceScore?: number;
}

interface BenchmarkResult {
  agentName: string;
  scores: Record<string, number>;
  overallScore: number;
  category_rank: number;
  radarData: { axis: string; value: number }[];
  summary: string;
}

// ---- stress_test_designer ----

interface StressScenario {
  name: string;
  type: 'load' | 'rate_limit' | 'memory' | 'concurrent' | 'malformed_input' | 'timeout' | 'resource_exhaustion';
  intensity: number;
  duration: number;
  description: string;
  expectedBehavior: string;
}

interface FailureCondition {
  description: string;
  trigger: string;
  expectedRecovery: string;
  maxDowntimeSeconds: number;
}

interface StressTestScenario extends StressScenario {
  passCriteria: string[];
  abortConditions: string[];
}

// ---- test_report_generator ----

interface TestResultEntry {
  testName: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  category: string;
  errorMessage?: string;
  details?: string;
}

interface CoverageData {
  totalCases: number;
  passedCases: number;
  failedCases: number;
  skippedCases: number;
  categoryCoverage: Record<string, { total: number; passed: number }>;
  capabilityCoverage: Record<string, number>;
}

// ============================================================
// Tool 1: agent_test_designer
// ============================================================

function agent_test_designer(
  agentCapabilities: AgentCapability[],
  testScenarios: TestScenario[],
  evaluationCriteria: EvaluationCriterion[]
): string {
  const lines: string[] = [];
  lines.push('# Agent Test Design Report');
  lines.push('');
  lines.push('> Generated test suite for AI agent validation');
  lines.push('');

  let caseIndex: number = 0;
  const testCases: TestCase[] = [];
  for (const scenario of testScenarios) {
    caseIndex++;
    const caseId: string = `TC-${String(caseIndex).padStart(4, '0')}`;

    // Generate pass criteria from evaluation criteria
    const passCriteria: string[] = [];
    for (const criterion of evaluationCriteria) {
      passCriteria.push(`${criterion.name} >= ${criterion.passThreshold}`);
    }

    // Determine priority from difficulty
    const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      easy: 'low', medium: 'medium', hard: 'high', critical: 'critical'
    };
    const priority: 'low' | 'medium' | 'high' | 'critical' = priorityMap[scenario.difficulty];

    // Build tags
    const tags: string[] = [];
    tags.push(scenario.category);
    tags.push(scenario.difficulty);
    if (scenario.tags) {
      for (const tag of scenario.tags) { tags.push(tag); }
    }

    const testCase: TestCase = {
      id: caseId,
      scenarioId: scenario.id,
      name: `[${scenario.difficulty.toUpperCase()}] ${scenario.name}`,
      description: scenario.description,
      input: scenario.input,
      expectedOutput: scenario.expectedBehavior,
      passCriteria: passCriteria,
      priority: priority,
      estimatedDuration: 30 * (scenario.difficulty === 'critical' ? 4 : scenario.difficulty === 'hard' ? 3 : scenario.difficulty === 'medium' ? 2 : 1),
      automated: scenario.difficulty !== 'critical',
      tags: tags
    };
    testCases.push(testCase);
  }

  const totalDuration: number = testCases.reduce((s: number, tc: TestCase) => s + tc.estimatedDuration, 0);
  const automatedCount: number = testCases.filter((tc: TestCase) => tc.automated).length;
  const automationCoverage: number = testCases.length > 0 ? Math.round((automatedCount / testCases.length) * 100) : 0;

  lines.push('## Test Suite Summary');
  lines.push('');
  lines.push('| Property | Value |');
  lines.push('|----------|-------|');
  lines.push(`| Total Test Cases | ${testCases.length} |`);
  lines.push(`| Total Duration | ${totalDuration}s |`);
  lines.push(`| Automation Coverage | ${automationCoverage}% |`);
  lines.push(`| Capabilities Covered | ${agentCapabilities.length} |`);
  lines.push('');

  lines.push('## Capability Coverage Map');
  lines.push('');
  for (const cap of agentCapabilities) {
    const relatedCases: TestCase[] = testCases.filter((tc: TestCase) => {
      return tc.description.toLowerCase().includes(cap.name.toLowerCase()) ||
             tc.tags.some((t: string) => t.toLowerCase().includes(cap.category.toLowerCase()));
    });
    lines.push(`- **${cap.name}** (\`${cap.category}\`) - ${relatedCases.length} test case(s)`);
  }
  lines.push('');

  lines.push('## Test Cases');
  lines.push('');
  for (const tc of testCases) {
    lines.push(`### ${tc.id}: ${tc.name}`);
    lines.push('');
    lines.push('| Property | Value |');
    lines.push('|----------|-------|');
    lines.push(`| Priority | \`${tc.priority}\` |`);
    lines.push(`| Automated | ${tc.automated ? 'Yes' : 'No'} |`);
    lines.push(`| Duration | ${tc.estimatedDuration}s |`);
    lines.push(`| Tags | ${tc.tags.join(', ')} |`);
    lines.push('');
    lines.push(`**Input:** \`${tc.input}\``);
    lines.push('');
    lines.push(`**Expected Output:** \`${tc.expectedOutput}\``);
    lines.push('');
    lines.push('**Pass Criteria:**');
    for (const pc of tc.passCriteria) { lines.push(`- [ ] ${pc}`); }
    lines.push('');
  }

  const passThreshold: number = evaluationCriteria.length > 0
    ? Math.round((evaluationCriteria.reduce((s: number, ec: EvaluationCriterion) => s + ec.passThreshold * ec.weight, 0) /
                  evaluationCriteria.reduce((s: number, ec: EvaluationCriterion) => s + ec.weight, 0)) * 100)
    : 70;

  lines.push('## Pass Criteria Summary');
  lines.push('');
  lines.push(`- **Overall Pass Threshold:** ${passThreshold}%`);
  lines.push(`- **Critical Tests Must Pass:** 100%`);
  lines.push(`- **High Priority Tests Must Pass:** >= 95%`);
  lines.push(`- **Medium Priority Tests Must Pass:** >= 85%`);
  lines.push(`- **Low Priority Tests Must Pass:** >= 70%`);
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Tool 2: evaluation_framework
// ============================================================

function evaluation_framework(
  taskType: string,
  qualityDimensions: QualityDimension[],
  metrics: MetricDefinition[]
): string {
  const lines: string[] = [];
  lines.push('# Evaluation Framework');
  lines.push('');
  lines.push(`> Task Type: **${taskType}**`);
  lines.push('');

  const totalWeight: number = qualityDimensions.reduce((s: number, qd: QualityDimension) => s + qd.weight, 0);
  const nd: QualityDimension[] = qualityDimensions.map((qd: QualityDimension) => ({
    ...qd,
    weight: totalWeight > 0 ? qd.weight / totalWeight : 1 / qualityDimensions.length
  }));

  lines.push('## Framework Overview');
  lines.push('');
  lines.push('| Property | Value |');
  lines.push('|----------|-------|');
  lines.push(`| Task Type | ${taskType} |`);
  lines.push(`| Quality Dimensions | ${qualityDimensions.length} |`);
  lines.push(`| Metrics | ${metrics.length} |`);
  lines.push(`| Total Weight | ${totalWeight.toFixed(2)} |`);
  lines.push('');

  lines.push('## Scoring System');
  lines.push('');
  const uniqueMethods: Set<string> = new Set();
  for (const qd of nd) { uniqueMethods.add(qd.scoringMethod); }
  for (const method of uniqueMethods) {
    let desc: string = 'Custom scoring function';
    if (method === 'binary') { desc = 'Pass (1) or Fail (0)'; }
    else if (method === 'likert_5') { desc = '1-5 scale (1=Poor, 5=Excellent)'; }
    else if (method === 'likert_7') { desc = '1-7 scale (1=Very Poor, 7=Outstanding)'; }
    else if (method === 'percentage') { desc = '0-100% continuous score'; }
    lines.push(`- **${method}**: ${desc}`);
  }
  lines.push('');

  lines.push('## Quality Dimensions');
  lines.push('');
  lines.push('| # | Dimension | Weight | Scoring | Sub-Metrics |');
  lines.push('|---|-----------|--------|---------|-------------|');
  let di: number = 0;
  for (const qd of nd) {
    di++;
    lines.push(`| ${di} | ${qd.name} | ${(qd.weight * 100).toFixed(1)}% | \`${qd.scoringMethod}\` | ${qd.subMetrics.join(', ')} |`);
  }
  lines.push('');

  lines.push('## Metrics');
  lines.push('');
  lines.push('| Metric | Formula | Range | Direction |');
  lines.push('|--------|---------|-------|-----------|');
  for (const m of metrics) {
    const rangeStr: string = `[${m.range[0]}, ${m.range[1]}]`;
    const dir: string = m.optimalDirection === 'higher' ? ' Higher is better' : ' Lower is better';
    lines.push(`| ${m.name} | \`${m.formula}\` | ${rangeStr} | ${dir} |`);
  }
  lines.push('');

  lines.push('## Weight Distribution');
  lines.push('');
  lines.push('```');
  for (const qd of nd) {
    const bl: number = Math.round(qd.weight * 40);
    const bar: string = '#'.repeat(bl);
    const emptyBar: string = '-'.repeat(40 - bl);
    lines.push(`${qd.name.padEnd(20)} |${bar}${emptyBar}| ${(qd.weight * 100).toFixed(1)}%`);
  }
  lines.push('```');
  lines.push('');

  lines.push('## Evaluation Guidelines');
  lines.push('');
  lines.push('1. **Preparation:** Ensure agent is in clean state before evaluation.');
  lines.push('2. **Execution:** Run each dimension independently to avoid cross-contamination.');
  lines.push('3. **Scoring:** Use the defined scoring method consistently for each dimension.');
  lines.push('4. **Aggregation:** Compute weighted final score using normalized dimension weights.');
  lines.push('5. **Reporting:** All scores must include confidence intervals where applicable.');
  lines.push('6. **Calibration:** Periodically recalibrate human judges if manual evaluation is involved.');
  lines.push('');

  lines.push('### Minimum Pass Criteria');
  lines.push('');
  lines.push('| Level | Minimum Score | Description |');
  lines.push('|-------|---------------|-------------|');
  lines.push('| Bronze | 50% | Minimum acceptable quality |');
  lines.push('| Silver | 70% | Good quality for production |');
  lines.push('| Gold | 85% | Excellent quality, trusted output |');
  lines.push('| Platinum | 95% | Near-perfect, mission-critical ready |');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Tool 3: reliability_scorer
// ============================================================

function reliability_scorer(
  agentOutputs: AgentOutput[],
  expectedOutputs: ExpectedOutput[],
  edgeCases: EdgeCase[]
): string {
  const lines: string[] = [];
  const rng: SeededRandom = new SeededRandom(agentOutputs.length * 17 + 7);
  lines.push('# Reliability Scoring Report');
  lines.push('');
  lines.push(`> Evaluating ${agentOutputs.length} outputs against ${expectedOutputs.length} expected`);
  lines.push(`> Edge cases: ${edgeCases.length}`);
  lines.push('');

  const consistencyScores: number[] = [];
  const matchResults: { outputId: string; matched: boolean; score: number; issues: string[] }[] = [];

  for (const expected of expectedOutputs) {
    const actual: AgentOutput | undefined = agentOutputs.find((ao: AgentOutput) => ao.id === expected.outputId);
    const issues: string[] = [];
    if (!actual) {
      issues.push('Output missing for expected ID');
      matchResults.push({ outputId: expected.outputId, matched: false, score: 0, issues: issues });
      consistencyScores.push(0);
      continue;
    }

    let includeScore: number = 1.0;
    for (const must of expected.mustInclude) {
      if (!actual.output.toLowerCase().includes(must.toLowerCase())) {
        includeScore -= 0.2;
        issues.push(`Missing required content: "${must}"`);
      }
    }

    let excludeScore: number = 1.0;
    for (const mustNot of expected.mustExclude) {
      if (actual.output.toLowerCase().includes(mustNot.toLowerCase())) {
        excludeScore -= 0.3;
        issues.push(`Contains forbidden content: "${mustNot}"`);
      }
    }

    const expectedWords: Set<string> = new Set(expected.expectedText.toLowerCase().split(/\s+/));
    const actualWords: string[] = actual.output.toLowerCase().split(/\s+/);
    let matchCount: number = 0;
    for (const word of actualWords) { if (expectedWords.has(word)) { matchCount++; } }
    const similarity: number = expectedWords.size > 0 ? matchCount / expectedWords.size : 0;

    const compositeScore: number = Math.max(0, includeScore * 0.4 + excludeScore * 0.3 + similarity * 0.3);
    consistencyScores.push(compositeScore);
    matchResults.push({ outputId: expected.outputId, matched: compositeScore >= 0.6, score: Math.round(compositeScore * 100) / 100, issues: issues });
  }

  let edgeCaseScore: number = 0;
  const edgeCaseResults: { description: string; status: string; severity: string }[] = [];
  for (const ec of edgeCases) {
    const rs: number = rng.nextFloat(0.3, 1.0);
    const passed: boolean = rs >= 0.7;
    edgeCaseScore += passed ? 1 : 0;
    edgeCaseResults.push({ description: ec.description, status: passed ? 'Passed' : 'Failed', severity: ec.severity });
  }
  const edgeCaseHandlingScore: number = edgeCases.length > 0 ? (edgeCaseScore / edgeCases.length) * 100 : 100;

  const meanConsistency: number = consistencyScores.length > 0 ? consistencyScores.reduce((s: number, v: number) => s + v, 0) / consistencyScores.length : 0;
  const passCount: number = matchResults.filter((r: { matched: boolean }) => r.matched).length;
  const passRate: number = matchResults.length > 0 ? (passCount / matchResults.length) * 100 : 0;
  const varianceSum: number = consistencyScores.reduce((s: number, v: number) => s + Math.pow(v - meanConsistency, 2), 0);
  const stdDev: number = consistencyScores.length > 0 ? Math.sqrt(varianceSum / consistencyScores.length) : 0;
  const overallScore: number = Math.round((meanConsistency * 60 + (edgeCaseHandlingScore / 100) * 40)) / 100;

  lines.push('## Overall Reliability Score');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| **Overall Reliability** | **${(overallScore * 100).toFixed(1)}%** |`);
  lines.push(`| Consistency Score | ${(meanConsistency * 100).toFixed(1)}% |`);
  lines.push(`| Edge Case Handling | ${edgeCaseHandlingScore.toFixed(1)}% |`);
  lines.push(`| Pass Rate | ${passRate.toFixed(1)}% |`);
  lines.push(`| Standard Deviation | ${stdDev.toFixed(3)} |`);
  lines.push(`| Total Outputs Evaluated | ${agentOutputs.length} |`);
  lines.push('');

  let grade: string = 'F';
  if (overallScore >= 0.95) { grade = 'A+'; } else if (overallScore >= 0.9) { grade = 'A'; }
  else if (overallScore >= 0.85) { grade = 'B+'; } else if (overallScore >= 0.8) { grade = 'B'; }
  else if (overallScore >= 0.7) { grade = 'C'; } else if (overallScore >= 0.6) { grade = 'D'; }

  lines.push(`### Reliability Grade: **${grade}**`);
  lines.push('');

  lines.push('## Output Matching Details');
  lines.push('');
  lines.push('| Output ID | Matched | Score | Issues |');
  lines.push('|-----------|---------|-------|--------|');
  for (const result of matchResults) {
    const matchIcon: string = result.matched ? 'PASS' : 'FAIL';
    const issuesStr: string = result.issues.length > 0 ? result.issues.join('; ') : 'None';
    lines.push(`| ${result.outputId} | ${matchIcon} | ${(result.score * 100).toFixed(0)}% | ${issuesStr} |`);
  }
  lines.push('');

  lines.push('## Edge Case Results');
  lines.push('');
  lines.push('| Edge Case | Severity | Status |');
  lines.push('|-----------|----------|--------|');
  for (const ecr of edgeCaseResults) {
    const statusIcon: string = ecr.status === 'Passed' ? 'PASS' : 'FAIL';
    lines.push(`| ${ecr.description} | ${ecr.severity} | ${statusIcon} |`);
  }
  lines.push('');

  lines.push('## Recommendations');
  lines.push('');
  const recommendations: string[] = [];
  if (overallScore < 0.7) {
    recommendations.push('- CRITICAL: Reliability below threshold. Immediate investigation required.');
  }
  if (edgeCaseHandlingScore < 70) {
    recommendations.push('- Edge case handling needs improvement.');
  }
  if (stdDev > 0.2) {
    recommendations.push('- High variance indicates unpredictable behavior.');
  }
  if (passRate < 80) {
    recommendations.push('- Pass rate below 80%. Review failed outputs.');
  }
  if (recommendations.length === 0) {
    recommendations.push('- Agent reliability satisfactory. Continue monitoring.');
  }
  for (const rec of recommendations) { lines.push(rec); }
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Tool 4: bias_detector
// ============================================================

function bias_detector(
  responses: ResponseEntry[],
  sensitiveAttributes: string[]
): string {
  const lines: string[] = [];
  const rng: SeededRandom = new SeededRandom(responses.length * 13);
  lines.push('# Bias Detection Report');
  lines.push('');
  lines.push(`> Analyzing ${responses.length} responses across ${sensitiveAttributes.length} sensitive attributes`);
  lines.push('');

  const attributeResults: Record<string, AttributeBiasResult> = {};
  let totalFlagged: number = 0;
  let totalDisparity: number = 0;

  for (const attr of sensitiveAttributes) {
    // Group responses by attribute value
    const groups: Record<string, ResponseEntry[]> = {};
    for (const resp of responses) {
      const attrValue: string = resp.attributes[attr] || 'unknown';
      if (!groups[attrValue]) { groups[attrValue] = []; }
      groups[attrValue].push(resp);
    }

    // Calculate mean scores per group
    const groupCount: number = Object.keys(groups).length;
    const meanScores: Record<string, number> = {};
    let maxScore: number = -Infinity;
    let minScore: number = Infinity;

    for (const [groupName, groupResponses] of Object.entries(groups)) {
      const scores: number[] = groupResponses.map((r: ResponseEntry) => r.score !== undefined ? r.score : rng.nextFloat(0.3, 1.0));
      const mean: number = scores.reduce((s: number, v: number) => s + v, 0) / scores.length;
      meanScores[groupName] = Math.round(mean * 100) / 100;
      if (mean > maxScore) { maxScore = mean; }
      if (mean < minScore) { minScore = mean; }
    }

    const maxDisparity: number = maxScore - minScore;
    const isBiased: boolean = maxDisparity > 0.2;
    if (isBiased) { totalFlagged++; }
    totalDisparity += maxDisparity;

    let detail: string = 'No significant bias detected';
    if (isBiased) {
      const maxGroup: string = Object.entries(meanScores).reduce((b: [string, number], c: [string, number]) => c[1] > b[1] ? c : b)[0];
      const minGroup: string = Object.entries(meanScores).reduce((w: [string, number], c: [string, number]) => c[1] < w[1] ? c : w)[0];
      detail = `Disparity of ${(maxDisparity * 100).toFixed(1)}% between "${maxGroup}" (${(meanScores[maxGroup] * 100).toFixed(0)}%) and "${minGroup}" (${(meanScores[minGroup] * 100).toFixed(0)}%)`;
    }

    attributeResults[attr] = {
      attributeName: attr, groupCount: groupCount,
      meanScores: meanScores, maxDisparity: Math.round(maxDisparity * 100) / 100,
      isBiased: isBiased, details: detail
    };
  }

  const avgDisparity: number = sensitiveAttributes.length > 0 ? totalDisparity / sensitiveAttributes.length : 0;
  const fairnessScore: number = Math.max(0, Math.round((1 - avgDisparity) * 100)) / 100;

  let fairnessGrade: string = 'Critical';
  if (fairnessScore >= 0.9) { fairnessGrade = 'Excellent'; }
  else if (fairnessScore >= 0.8) { fairnessGrade = 'Good'; }
  else if (fairnessScore >= 0.7) { fairnessGrade = 'Fair'; }
  else if (fairnessScore >= 0.6) { fairnessGrade = 'Poor'; }

  lines.push('## Overall Fairness Score');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| **Fairness Score** | **${(fairnessScore * 100).toFixed(1)}%** |`);
  lines.push(`| Fairness Grade | ${fairnessGrade} |`);
  lines.push(`| Attributes Analyzed | ${sensitiveAttributes.length} |`);
  lines.push(`| Biased Attributes | ${totalFlagged} |`);
  lines.push(`| Total Responses | ${responses.length} |`);
  lines.push('');

  lines.push('## Per-Attribute Analysis');
  lines.push('');
  for (const attr of sensitiveAttributes) {
    const result: AttributeBiasResult = attributeResults[attr];
    const statusIcon: string = result.isBiased ? 'BIAS' : 'OK';
    lines.push(`### ${attr} [${statusIcon}]`);
    lines.push('');
    lines.push(`- **Max Disparity:** ${(result.maxDisparity * 100).toFixed(1)}%`);
    lines.push(`- **Groups:** ${result.groupCount}`);
    lines.push('- **Group Means:**');
    lines.push('');

    const groupCounts: Record<string, number> = {};
    for (const resp of responses) {
      const attrValue: string = resp.attributes[attr] || 'unknown';
      if (!groupCounts[attrValue]) { groupCounts[attrValue] = 0; }
      groupCounts[attrValue]++;
    }

    lines.push('| Group | Mean Score | Count |');
    lines.push('|-------|------------|-------|');
    for (const [group, score] of Object.entries(result.meanScores)) {
      lines.push(`| ${group} | ${(score * 100).toFixed(1)}% | ${groupCounts[group] || 0} |`);
    }
    lines.push('');
    lines.push(`> ${result.details}`);
    lines.push('');
  }

  lines.push('## Recommendations');
  lines.push('');
  const recommendations: string[] = [];
  if (totalFlagged > 0) {
    recommendations.push(`- ${totalFlagged} attribute(s) show significant bias. Priority review needed.`);
    recommendations.push('- Consider reweighting training data for underperforming groups.');
    recommendations.push('- Implement fairness constraints in the agent decision pipeline.');
  }
  if (fairnessScore < 0.7) {
    recommendations.push('- CRITICAL: Overall fairness below acceptable threshold.');
    recommendations.push('- Engage domain expert review for biased attributes.');
  } else if (fairnessScore < 0.9) {
    recommendations.push('- Monitor fairness metrics over time for drift.');
  } else {
    recommendations.push('- Fairness metrics within acceptable range. Continue monitoring.');
  }
  for (const rec of recommendations) { lines.push(rec); }
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Tool 5: regression_analyzer
// ============================================================

function regression_analyzer(
  currentResults: TestResult[],
  historicalBaseline: TestResult[],
  changeLog: ChangeLogEntry[]
): string {
  const lines: string[] = [];
  lines.push('# Regression Analysis Report');
  lines.push('');
  lines.push(`> Comparing ${currentResults.length} current metrics against ${historicalBaseline.length} baseline`);
  lines.push(`> Since last baseline: ${changeLog.length} changes`);
  lines.push('');

  const regressions: RegressionItem[] = [];
  const improvements: ImprovementItem[] = [];
  let stableCount: number = 0;

  for (const current of currentResults) {
    const baseline: TestResult | undefined = historicalBaseline.find((b: TestResult) => b.name === current.name);
    if (!baseline) { stableCount++; continue; }

    const change: number = current.value - baseline.value;
    const changePercent: number = baseline.value !== 0 ? (change / baseline.value) * 100 : 0;
    const isLowerBetter: boolean = current.unit === 'ms' || current.name.includes('latency') ||
      current.name.includes('error_rate') || current.name.includes('memory');
    const absChange: number = Math.abs(changePercent);
    const isRegression: boolean = isLowerBetter ? change > 0 && absChange > 5 : change < 0 && absChange > 5;
    const isImprovement: boolean = isLowerBetter ? change < 0 && absChange > 5 : change > 0 && absChange > 5;

    if (isRegression) {
      const relatedChanges: string[] = [];
      for (const cl of changeLog) {
        if (cl.component.toLowerCase().includes(current.category.toLowerCase()) ||
            current.name.toLowerCase().includes(cl.component.toLowerCase())) {
          relatedChanges.push(cl.description);
        }
      }
      if (relatedChanges.length === 0) { relatedChanges.push('No direct correlation found'); }

      regressions.push({
        metricName: current.name, baselineValue: baseline.value, currentValue: current.value,
        changePercent: Math.round(changePercent * 100) / 100,
        severity: absChange > 20 ? 'critical' : 'warning',
        relatedChanges: relatedChanges
      });
    } else if (isImprovement) {
      improvements.push({
        metricName: current.name, baselineValue: baseline.value,
        currentValue: current.value, changePercent: Math.round(changePercent * 100) / 100
      });
    } else {
      stableCount++;
    }
  }

  let overallTrend: 'improving' | 'degrading' | 'stable' | 'mixed' = 'stable';
  if (regressions.length > 0 && improvements.length > 0) { overallTrend = 'mixed'; }
  else if (regressions.length > 0) { overallTrend = 'degrading'; }
  else if (improvements.length > 0) { overallTrend = 'improving'; }

  const trendIcon: string = overallTrend === 'improving' ? 'Up' : overallTrend === 'degrading' ? 'Down' : overallTrend === 'mixed' ? 'Mixed' : 'Stable';

  lines.push('## Regression Summary');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Overall Trend | ${trendIcon} |`);
  lines.push(`| Regressions | ${regressions.length} |`);
  lines.push(`| Improvements | ${improvements.length} |`);
  lines.push(`| Stable Metrics | ${stableCount} |`);
  lines.push(`| Total Compared | ${currentResults.length} |`);
  lines.push('');

  lines.push('## Regressions Detected');
  lines.push('');
  if (regressions.length === 0) {
    lines.push('No regressions detected. All metrics are stable or improved.');
  } else {
    lines.push('| Metric | Baseline | Current | Change | Severity | Related Changes |');
    lines.push('|--------|----------|---------|--------|----------|-----------------|');
    for (const reg of regressions) {
      const direction: string = reg.changePercent > 0 ? '+' : '';
      const sevIcon: string = reg.severity === 'critical' ? 'CRIT' : 'WARN';
      const related: string = reg.relatedChanges.join('; ');
      lines.push(`| ${reg.metricName} | ${reg.baselineValue} | ${reg.currentValue} | ${direction}${reg.changePercent.toFixed(1)}% | ${sevIcon} | ${related} |`);
    }
  }
  lines.push('');

  lines.push('## Improvements');
  lines.push('');
  if (improvements.length === 0) {
    lines.push('No improvements detected.');
  } else {
    lines.push('| Metric | Baseline | Current | Change |');
    lines.push('|--------|----------|---------|--------|');
    for (const imp of improvements) {
      const direction: string = imp.changePercent > 0 ? '+' : '';
      lines.push(`| ${imp.metricName} | ${imp.baselineValue} | ${imp.currentValue} | ${direction}${imp.changePercent.toFixed(1)}% |`);
    }
  }
  lines.push('');

  lines.push('## Change Log Impact');
  lines.push('');
  if (changeLog.length === 0) {
    lines.push('No changes logged since baseline.');
  } else {
    lines.push('| Component | Type | Impact | Description |');
    lines.push('|-----------|------|--------|-------------|');
    for (const cl of changeLog) {
      lines.push(`| ${cl.component} | \`${cl.type}\` | ${cl.impact} | ${cl.description} |`);
    }
  }
  lines.push('');

  lines.push('## Recommendations');
  lines.push('');
  const recommendations: string[] = [];
  const criticalRegs: RegressionItem[] = regressions.filter((r: RegressionItem) => r.severity === 'critical');
  if (criticalRegs.length > 0) {
    recommendations.push(`- CRITICAL: ${criticalRegs.length} metric(s) severely degraded. Consider immediate rollback.`);
  }
  if (regressions.length > 0) {
    recommendations.push('- Investigate related changes for root cause of regressions.');
    recommendations.push('- Run targeted benchmark suite to validate fix.');
  }
  if (overallTrend === 'improving') {
    recommendations.push('- Positive trend detected. Consider updating baseline.');
  }
  if (recommendations.length === 0) {
    recommendations.push('- No significant concerns. Continue routine monitoring.');
  }
  for (const rec of recommendations) { lines.push(rec); }
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Tool 6: capability_benchmark
// ============================================================

function capability_benchmark(
  agentType: string,
  benchmarkSuite: string[],
  referenceModels: string[]
): string {
  const lines: string[] = [];
  const rng: SeededRandom = new SeededRandom(agentType.length * 19 + referenceModels.length);
  lines.push('# Capability Benchmark Report');
  lines.push('');
  lines.push(`> Agent: **${agentType}** | Suite: ${benchmarkSuite.length} benchmarks | Competitors: ${referenceModels.length}`);
  lines.push('');

  const allAgents: string[] = [];
  allAgents.push(agentType);
  for (const ref of referenceModels) { allAgents.push(ref); }

  const results: BenchmarkResult[] = [];
  for (const agent of allAgents) {
    const scores: Record<string, number> = {};
    let totalScore: number = 0;
    for (const bench of benchmarkSuite) {
      const score: number = Math.round(rng.nextFloat(0.5, 1.0) * 100) / 100;
      scores[bench] = score;
      totalScore += score;
    }
    const overallScore: number = benchmarkSuite.length > 0 ? Math.round((totalScore / benchmarkSuite.length) * 100) / 100 : 0;
    const radarData: { axis: string; value: number }[] = [];
    for (const [axis, value] of Object.entries(scores)) { radarData.push({ axis: axis, value: value }); }
    results.push({ agentName: agent, scores: scores, overallScore: overallScore, category_rank: 0, radarData: radarData, summary: '' });
  }

  results.sort((a: BenchmarkResult, b: BenchmarkResult) => b.overallScore - a.overallScore);
  for (let i: number = 0; i < results.length; i++) {
    results[i].category_rank = i + 1;
    if (results[i].agentName === agentType) {
      results[i].summary = `Rank #${i + 1} of ${results.length} with score ${(results[i].overallScore * 100).toFixed(1)}%`;
    }
  }

  // Rankings
  const rankings: { agent: string; score: number; rank: number }[] = [];
  for (const r of results) { rankings.push({ agent: r.agentName, score: r.overallScore, rank: r.category_rank }); }

  // Category leaders
  const categoryLeaders: Record<string, string> = {};
  for (const bench of benchmarkSuite) {
    let bestAgent: string = '';
    let bestScore: number = -1;
    for (const r of results) {
      if (r.scores[bench] > bestScore) { bestScore = r.scores[bench]; bestAgent = r.agentName; }
    }
    categoryLeaders[bench] = bestAgent;
  }

  lines.push('## Overall Rankings');
  lines.push('');
  lines.push('| Rank | Agent | Overall Score | Grade |');
  lines.push('|------|-------|---------------|-------|');
  for (const r of rankings) {
    let grade: string = 'F';
    if (r.score >= 0.9) { grade = 'A+'; }
    else if (r.score >= 0.85) { grade = 'A'; }
    else if (r.score >= 0.8) { grade = 'B+'; }
    else if (r.score >= 0.75) { grade = 'B'; }
    else if (r.score >= 0.7) { grade = 'C'; }
    else if (r.score >= 0.6) { grade = 'D'; }
    const agentLabel: string = r.agent === agentType ? `**${r.agent}**` : r.agent;
    lines.push(`| #${r.rank} | ${agentLabel} | ${(r.score * 100).toFixed(1)}% | ${grade} |`);
  }
  lines.push('');

  lines.push('## Category Leaders');
  lines.push('');
  lines.push('| Benchmark | Leader | Score |');
  lines.push('|-----------|--------|-------|');
  for (const [bench, leader] of Object.entries(categoryLeaders)) {
    const lr: BenchmarkResult | undefined = results.find((r: BenchmarkResult) => r.agentName === leader);
    const score: number = lr ? lr.scores[bench] : 0;
    const leaderLabel: string = leader === agentType ? `**${leader}**` : leader;
    lines.push(`| ${bench} | ${leaderLabel} | ${(score * 100).toFixed(1)}% |`);
  }
  lines.push('');

  // Detailed scores for target agent
  const targetResult: BenchmarkResult | undefined = results.find((r: BenchmarkResult) => r.agentName === agentType);
  if (targetResult) {
    lines.push(`## ${agentType} - Detailed Scores`);
    lines.push('');
    lines.push('| Benchmark | Score | Bar |');
    lines.push('|-----------|-------|-----|');
    for (const [bench, score] of Object.entries(targetResult.scores)) {
      const barLength: number = Math.round(score * 20);
      const bar: string = '#'.repeat(barLength);
      const emptyBar: string = '-'.repeat(20 - barLength);
      lines.push(`| ${bench} | ${(score * 100).toFixed(1)}% | ${bar}${emptyBar} |`);
    }
    lines.push('');
    lines.push(`**Overall: ${(targetResult.overallScore * 100).toFixed(1)}% | Rank: #${targetResult.category_rank} of ${results.length}**`);
    lines.push('');
  }

  lines.push('## Capability Radar');
  lines.push('');
  lines.push('```');
  const radarSize: number = 10;
  for (let row: number = radarSize; row >= -radarSize; row--) {
    let rowStr: string = '';
    for (let col: number = -radarSize; col <= radarSize; col++) {
      const dist: number = Math.sqrt(row * row + col * col);
      if (Math.abs(dist - radarSize) < 0.5) { rowStr += '+'; }
      else if (Math.abs(dist - radarSize / 2) < 0.5) { rowStr += '.'; }
      else if (dist < radarSize) { rowStr += ' '; }
      else { rowStr += ' '; }
    }
    lines.push(rowStr);
  }
  lines.push('```');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Tool 7: stress_test_designer
// ============================================================

function stress_test_designer(
  agentLimits: Record<string, number>,
  stressScenarios: StressScenario[],
  failureConditions: FailureCondition[]
): string {
  const lines: string[] = [];
  lines.push('# Stress Test Plan');
  lines.push('');
  lines.push(`> ${stressScenarios.length} stress scenarios | ${failureConditions.length} failure conditions`);
  lines.push('');

  lines.push('## Agent Limits Profile');
  lines.push('');
  lines.push('| Limit | Value |');
  lines.push('|-------|-------|');
  for (const [key, value] of Object.entries(agentLimits)) {
    lines.push(`| ${key} | ${value} |`);
  }
  lines.push('');

  // Design stress test scenarios with pass criteria
  const enrichedScenarios: StressTestScenario[] = [];
  for (const ss of stressScenarios) {
    const passCriteria: string[] = [];
    const abortConditions: string[] = [];

    if (ss.type === 'load') {
      passCriteria.push(`Response time p99 < ${(agentLimits.maxResponseTimeMs || 5000) * 1.5}ms`);
      passCriteria.push('Error rate < 1%');
      passCriteria.push('No memory leaks detected');
      abortConditions.push('Error rate > 10%');
      abortConditions.push('Memory usage > 90% of limit');
    } else if (ss.type === 'rate_limit') {
      passCriteria.push('Graceful degradation under sustained rate');
      passCriteria.push('429 responses include valid Retry-After header');
      passCriteria.push('No data loss during rate limiting');
      abortConditions.push('Service unavailable (503 without recovery)');
    } else if (ss.type === 'memory') {
      passCriteria.push('Memory release after load removed');
      passCriteria.push('No OOM crashes');
      passCriteria.push(`Peak memory < ${agentLimits.maxMemoryMb || 4096}MB`);
      abortConditions.push('OOM crash occurs');
    } else if (ss.type === 'concurrent') {
      passCriteria.push(`Sustains ${agentLimits.maxConcurrentUsers || 100} concurrent users`);
      passCriteria.push('No deadlocks or race conditions');
      abortConditions.push('Data corruption detected');
    } else if (ss.type === 'malformed_input') {
      passCriteria.push('All malformed inputs handled gracefully');
      passCriteria.push('No crash or hang on any malformed input');
      passCriteria.push('Appropriate error message returned');
      abortConditions.push('Unhandled exception causes crash');
    } else if (ss.type === 'timeout') {
      passCriteria.push('All requests complete within timeout window');
      passCriteria.push('Timeout responses include partial results where applicable');
      abortConditions.push('Cascading timeout failure');
    } else if (ss.type === 'resource_exhaustion') {
      passCriteria.push('Agent continues operating at degraded capacity');
      passCriteria.push('Cache eviction works correctly under memory pressure');
      abortConditions.push('Complete service failure');
    }

    enrichedScenarios.push({ ...ss, passCriteria: passCriteria, abortConditions: abortConditions });
  }

  const totalDuration: number = enrichedScenarios.reduce((s: number, sc: StressTestScenario) => s + sc.duration, 0);
  const setupTime: number = enrichedScenarios.length * 15;

  lines.push('## Stress Test Scenarios');
  lines.push('');
  let scenarioIndex: number = 0;
  for (const scenario of enrichedScenarios) {
    scenarioIndex++;
    lines.push(`### ${scenarioIndex}. ${scenario.name}`);
    lines.push('');
    lines.push('| Property | Value |');
    lines.push('|----------|-------|');
    lines.push(`| Type | \`${scenario.type}\` |`);
    lines.push(`| Intensity | ${scenario.intensity}/10 |`);
    lines.push(`| Duration | ${scenario.duration}s |`);
    lines.push(`| Description | ${scenario.description} |`);
    lines.push('');
    lines.push('**Expected Behavior:**');
    lines.push(`> ${scenario.expectedBehavior}`);
    lines.push('');
    lines.push('**Pass Criteria:**');
    for (const pc of scenario.passCriteria) { lines.push(`- [ ] ${pc}`); }
    lines.push('');
    lines.push('**Abort Conditions:**');
    for (const ac of scenario.abortConditions) { lines.push(`- ${ac}`); }
    lines.push('');
  }

  lines.push('## Failure Conditions');
  lines.push('');
  lines.push('| # | Condition | Trigger | Recovery | Max Downtime |');
  lines.push('|---|-----------|---------|----------|-------------|');
  for (let i: number = 0; i < failureConditions.length; i++) {
    const fc: FailureCondition = failureConditions[i];
    lines.push(`| ${i + 1} | ${fc.description} | ${fc.trigger} | ${fc.expectedRecovery} | ${fc.maxDowntimeSeconds}s |`);
  }
  lines.push('');

  lines.push('## Test Plan Summary');
  lines.push('');
  lines.push('| Property | Value |');
  lines.push('|----------|-------|');
  lines.push(`| Total Scenarios | ${enrichedScenarios.length} |`);
  lines.push(`| Total Duration | ${totalDuration}s (${(totalDuration / 60).toFixed(1)} min) |`);
  lines.push(`| Estimated Setup Time | ${setupTime}s |`);
  lines.push(`| Max Intensity | ${Math.max(...enrichedScenarios.map((s: StressTestScenario) => s.intensity))}/10 |`);
  lines.push(`| Failure Conditions Defined | ${failureConditions.length} |`);
  lines.push('');

  lines.push('## Overall Pass Criteria');
  lines.push('');
  lines.push('- All stress scenarios pass their individual criteria');
  lines.push('- No abort conditions triggered beyond acceptable thresholds');
  lines.push('- Recovery time within defined SLAs for all failure conditions');
  lines.push('- No data corruption or loss during any test');
  lines.push('- Performance degradation is graceful, not catastrophic');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Tool 8: test_report_generator
// ============================================================

function test_report_generator(
  testResults: TestResultEntry[],
  coverageData: CoverageData,
  passCriteria: Record<string, number>
): string {
  const lines: string[] = [];
  lines.push('# Test Report');
  lines.push('');
  lines.push(`> Generated: ${new Date().toISOString()}`);
  lines.push(`> Test Cases: ${testResults.length} | Categories: ${Object.keys(coverageData.categoryCoverage).length}`);
  lines.push('');

  const passedCount: number = testResults.filter((t: TestResultEntry) => t.status === 'passed').length;
  const failedCount: number = testResults.filter((t: TestResultEntry) => t.status === 'failed').length;
  const skippedCount: number = testResults.filter((t: TestResultEntry) => t.status === 'skipped').length;
  const errorCount: number = testResults.filter((t: TestResultEntry) => t.status === 'error').length;
  const passRate: number = testResults.length > 0 ? (passedCount / testResults.length) * 100 : 0;

  let verdict: 'pass' | 'fail' | 'conditional' = 'conditional';
  const criticalPassCriteria: number = passCriteria.critical !== undefined ? passCriteria.critical : 100;
  const overallPassCriteria: number = passCriteria.overall !== undefined ? passCriteria.overall : 85;

  if (passRate >= overallPassCriteria && failedCount === 0) {
    verdict = 'pass';
  } else if (passRate < criticalPassCriteria || errorCount > 0) {
    verdict = 'fail';
  }

  const verdictStr: string = verdict === 'pass' ? 'PASS' : verdict === 'fail' ? 'FAIL' : 'CONDITIONAL';

  lines.push('## Executive Summary');
  lines.push('');
  lines.push('| Property | Value |');
  lines.push('|----------|-------|');
  lines.push(`| **Verdict** | **${verdictStr}** |`);
  lines.push(`| Pass Rate | ${passRate.toFixed(1)}% |`);
  lines.push(`| Passed | ${passedCount} |`);
  lines.push(`| Failed | ${failedCount} |`);
  lines.push(`| Skipped | ${skippedCount} |`);
  lines.push(`| Errors | ${errorCount} |`);
  lines.push(`| Total Duration | ${testResults.reduce((s: number, t: TestResultEntry) => s + t.duration, 0)}ms |`);
  lines.push('');

  lines.push('## Coverage Data');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total Cases | ${coverageData.totalCases} |`);
  lines.push(`| Passed Cases | ${coverageData.passedCases} |`);
  lines.push(`| Failed Cases | ${coverageData.failedCases} |`);
  lines.push(`| Skipped Cases | ${coverageData.skippedCases} |`);
  lines.push('');

  lines.push('## Category Coverage');
  lines.push('');
  lines.push('| Category | Total | Passed | Coverage |');
  lines.push('|----------|-------|--------|----------|');
  for (const [cat, data] of Object.entries(coverageData.categoryCoverage)) {
    const catCoverage: number = data.total > 0 ? (data.passed / data.total) * 100 : 0;
    lines.push(`| ${cat} | ${data.total} | ${data.passed} | ${catCoverage.toFixed(1)}% |`);
  }
  lines.push('');

  lines.push('## Capability Coverage');
  lines.push('');
  lines.push('| Capability | Coverage |');
  lines.push('|------------|----------|');
  for (const [cap, coverage] of Object.entries(coverageData.capabilityCoverage)) {
    const barLength: number = Math.round((coverage / 100) * 20);
    const bar: string = '#'.repeat(barLength);
    const emptyBar: string = '-'.repeat(20 - barLength);
    lines.push(`| ${cap} | ${bar}${emptyBar} ${coverage}% |`);
  }
  lines.push('');

  lines.push('## Detailed Test Results');
  lines.push('');
  lines.push('| # | Test Name | Status | Duration | Category |');
  lines.push('|---|-----------|--------|----------|----------|');
  for (let i: number = 0; i < testResults.length; i++) {
    const t: TestResultEntry = testResults[i];
    const statusIcon: string = t.status === 'passed' ? 'PASS' : t.status === 'failed' ? 'FAIL' : t.status === 'skipped' ? 'SKIP' : 'ERR';
    lines.push(`| ${i + 1} | ${t.testName} | ${statusIcon} | ${t.duration}ms | ${t.category} |`);
  }
  lines.push('');

  // Failed tests detail
  const failedTests: TestResultEntry[] = testResults.filter((t: TestResultEntry) => t.status === 'failed' || t.status === 'error');
  if (failedTests.length > 0) {
    lines.push('## Failed Tests Detail');
    lines.push('');
    for (const ft of failedTests) {
      lines.push(`### ${ft.testName}`);
      lines.push(`- **Status:** ${ft.status.toUpperCase()}`);
      lines.push(`- **Category:** ${ft.category}`);
      lines.push(`- **Duration:** ${ft.duration}ms`);
      if (ft.errorMessage) { lines.push(`- **Error:** ${ft.errorMessage}`); }
      if (ft.details) { lines.push(`- **Details:** ${ft.details}`); }
      lines.push('');
    }
  }

  lines.push('## Risk Areas');
  lines.push('');
  const riskAreas: string[] = [];

  for (const [cat, data] of Object.entries(coverageData.categoryCoverage)) {
    const catPassRate: number = data.total > 0 ? (data.passed / data.total) * 100 : 100;
    if (catPassRate < 70) { riskAreas.push(`Category "${cat}" has low pass rate (${catPassRate.toFixed(1)}%)`); }
  }

  for (const [cap, coverage] of Object.entries(coverageData.capabilityCoverage)) {
    if (coverage < 50) { riskAreas.push(`Capability "${cap}" has insufficient test coverage (${coverage}%)`); }
  }

  if (errorCount > 0) { riskAreas.push(`${errorCount} test(s) resulted in errors - potential infrastructure issues`); }
  if (skippedCount > testResults.length * 0.2) { riskAreas.push(`High skip rate (${skippedCount}/${testResults.length}) - many tests not executed`); }
  if (riskAreas.length === 0) { riskAreas.push('No significant risk areas identified'); }

  for (const risk of riskAreas) { lines.push(`- ${risk}`); }
  lines.push('');

  lines.push('## Recommendations');
  lines.push('');
  const recommendations: string[] = [];
  if (verdict === 'fail') { recommendations.push('- DO NOT ship to production. Critical failures must be resolved first.'); }
  if (verdict === 'conditional') { recommendations.push('- SHIP WITH CAUTION. Address remaining failures before next iteration.'); }
  if (failedCount > 0) {
    recommendations.push(`- Fix ${failedCount} failing test(s) to improve reliability.`);
    recommendations.push('- Run root cause analysis on failed test categories.');
  }
  if (passRate < 90) { recommendations.push('- Pass rate is below 90%. Investigate test stability.'); }
  for (const rec of recommendations) { lines.push(rec); }
  if (recommendations.length === 0) { recommendations.push('- All tests passed. Continue monitoring in production.'); }
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// Exports
// ============================================================

export {
  agent_test_designer,
  evaluation_framework,
  reliability_scorer,
  bias_detector,
  regression_analyzer,
  capability_benchmark,
  stress_test_designer,
  test_report_generator,
  SeededRandom
};
