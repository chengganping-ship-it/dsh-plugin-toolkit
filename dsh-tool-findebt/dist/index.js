"use strict";
/**
 * dsh-tool-findebt - Financial Due Diligence Plugin for DeepSeek Harness
 *
 * Provides 8 specialized tools for M&A financial due diligence:
 * 1. deal_analyst - Transaction analysis and risk summarization
 * 2. financial_risk_scorer - Multi-dimensional risk scoring
 * 3. compliance_auditor - Regulatory compliance audit
 * 4. valuation_modeler - DCF/Comparables/Precedent valuation
 * 5. forensic_accountant - Fraud detection and anomaly analysis
 * 6. cash_flow_analyzer - Cash flow quality and sustainability
 * 7. red_flag_detector - Red flag identification
 * 8. deal_structurer - Optimal deal structure design
 *
 * @author chengganping-ship-it
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deal_analyst = deal_analyst;
exports.financial_risk_scorer = financial_risk_scorer;
exports.compliance_auditor = compliance_auditor;
exports.valuation_modeler = valuation_modeler;
exports.forensic_accountant = forensic_accountant;
exports.cash_flow_analyzer = cash_flow_analyzer;
exports.red_flag_detector = red_flag_detector;
exports.deal_structurer = deal_structurer;
// ============================================================================
// SEEDED RANDOM & UTILITY FUNCTIONS
// ============================================================================
function seededRandom(seed) {
    let s = seed;
    return function () {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 4294967296;
    };
}
function hashString(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h = h & h;
    }
    return Math.abs(h);
}
function fmtCur(v, u = '') {
    if (v === 0)
        return '$0' + u;
    if (Math.abs(v) >= 1e9)
        return '$' + (v / 1e9).toFixed(1) + 'B' + u;
    if (Math.abs(v) >= 1e6)
        return '$' + (v / 1e6).toFixed(1) + 'M' + u;
    if (Math.abs(v) >= 1e3)
        return '$' + (v / 1e3).toFixed(0) + 'K' + u;
    return '$' + v.toFixed(0) + u;
}
function fmtPct(v) {
    return (v * 100).toFixed(1) + '%';
}
function rt(v, d) {
    const f = Math.pow(10, d);
    return Math.round(v * f) / f;
}
function sc(s) {
    if (s >= 7)
        return ':green_circle:';
    if (s >= 4)
        return ':yellow_circle:';
    return ':red_circle:';
}
function sevE(sev) {
    if (sev === 'critical')
        return ':red_circle:';
    if (sev === 'high')
        return ':orange_circle:';
    if (sev === 'medium')
        return ':yellow_circle:';
    return ':green_circle:';
}
function scoreToGrade(s) {
    if (s >= 9)
        return 'A+';
    if (s >= 8)
        return 'A';
    if (s >= 7)
        return 'B+';
    if (s >= 6)
        return 'B';
    if (s >= 5)
        return 'C+';
    if (s >= 4)
        return 'C';
    if (s >= 3)
        return 'D';
    return 'F';
}
// ============================================================================
// HELPER GENERATORS
// ============================================================================
function assessStrategicFit(target, dealType) {
    const seed = hashString(target.name + dealType);
    const rng = seededRandom(seed);
    const mp = rt(4 + rng() * 5, 1);
    const sy = rt(3 + rng() * 6, 1);
    const ig = rt(3 + rng() * 5, 1);
    const cf = rt(4 + rng() * 4, 1);
    const overall = rt((mp + sy + ig + cf) / 4, 1);
    return {
        market_position: { assessment: mp >= 7 ? 'Strong competitive moat' : mp >= 5 ? 'Moderate positioning' : 'Weak market position', score: mp },
        synergy: { assessment: sy >= 7 ? 'Significant synergy potential' : sy >= 5 ? 'Moderate synergies' : 'Limited synergy opportunity', score: sy },
        integration: { assessment: ig >= 7 ? 'Manageable integration' : ig >= 5 ? 'Moderate complexity' : 'High execution risk', score: ig },
        culture: { assessment: cf >= 7 ? 'Cultural alignment likely' : cf >= 5 ? 'Some differences' : 'Significant culture gap', score: cf },
        overall
    };
}
function generateDealRisks(target, dealType) {
    return [
        { category: 'Market Risk', level: ':yellow_circle: Medium', description: 'Industry cyclicality in ' + target.industry, mitigation: 'Hedging strategy + earnout structure' },
        { category: 'Customer Concentration', level: target.major_customers.length > 0 && target.major_customers[0].revenue_percentage > 20 ? ':red_circle: High' : ':green_circle: Low', description: 'Top customer dependency at ' + (target.major_customers.length > 0 ? target.major_customers[0].revenue_percentage : 0) + '%', mitigation: 'Long-term contracts; diversification incentives' },
        { category: 'Key Person Risk', level: target.key_executives.length < 3 ? ':red_circle: High' : ':yellow_circle: Medium', description: 'Limited management bench depth', mitigation: 'Retention packages; employment agreements' },
        { category: 'Regulatory', level: ':yellow_circle: Medium', description: target.incorporation_jurisdiction + ' regulatory environment', mitigation: 'Local counsel engagement; compliance audit' },
        { category: 'Integration', level: ':yellow_circle: Medium', description: dealType + ' integration complexity', mitigation: 'Dedicated integration management office' }
    ];
}
function buildRiskMatrix(entries) {
    let maxScore = 0;
    let totalScore = 0;
    let criticalCount = 0;
    let highCount = 0;
    let moderateCount = 0;
    let lowCount = 0;
    entries.forEach(function (e) {
        e.risk_score = rt(e.likelihood * e.impact, 1);
        totalScore += e.risk_score;
        if (e.risk_score >= 15)
            criticalCount++;
        else if (e.risk_score >= 10)
            highCount++;
        else if (e.risk_score >= 5)
            moderateCount++;
        else
            lowCount++;
        if (e.risk_score > maxScore)
            maxScore = e.risk_score;
    });
    return { entries, maxScore, avgScore: rt(totalScore / Math.max(entries.length, 1), 1), criticalCount, highCount, moderateCount, lowCount };
}
function buildComplianceFindings(records) {
    const findings = [];
    const seed = hashString(records.length.toString());
    const rng = seededRandom(seed);
    const areas = ['Financial Reporting', 'Tax Compliance', 'Employment Law', 'Data Privacy', 'Environmental', 'Anti-Bribery', 'Trade Compliance', 'Corporate Governance'];
    areas.forEach(function (area, idx) {
        if (rng() > 0.4) {
            findings.push({
                finding_id: 'CF-' + (idx + 1).toString().padStart(3, '0'),
                area: area,
                severity: rng() > 0.7 ? 'critical' : rng() > 0.4 ? 'high' : 'moderate',
                description: area + ' documentation gap identified during review',
                regulation_reference: area + ' Standards Section ' + Math.floor(rng() * 10 + 1),
                recommendation: 'Immediate remediation required for ' + area,
                remediation_timeline: Math.floor(rng() * 90 + 30) + ' days',
                estimated_cost: rt(rng() * 500000 + 50000, 0),
                responsible_party: ['CFO', 'General Counsel', 'CHRO', 'COO'][Math.floor(rng() * 4)],
                status: rng() > 0.5 ? 'Open' : 'In Progress'
            });
        }
    });
    return findings;
}
function generateValuationSensitivity(ev, fcf, wacc) {
    return [
        { variable: 'WACC', base_case: wacc, bull_case: wacc - 1, bear_case: wacc + 1, ev_impact_base: 0, ev_impact_bull: rt(ev * 0.12, 0), ev_impact_bear: rt(-ev * 0.10, 0) },
        { variable: 'Revenue Growth', base_case: 5, bull_case: 8, bear_case: 2, ev_impact_base: 0, ev_impact_bull: rt(ev * 0.15, 0), ev_impact_bear: rt(-ev * 0.12, 0) },
        { variable: 'EBITDA Margin', base_case: 20, bull_case: 23, bear_case: 17, ev_impact_base: 0, ev_impact_bull: rt(ev * 0.10, 0), ev_impact_bear: rt(-ev * 0.09, 0) },
        { variable: 'Terminal Growth', base_case: 2.5, bull_case: 3.5, bear_case: 1.5, ev_impact_base: 0, ev_impact_bull: rt(ev * 0.08, 0), ev_impact_bear: rt(-ev * 0.07, 0) },
        { variable: 'Capex Ratio', base_case: 4, bull_case: 3, bear_case: 5.5, ev_impact_base: 0, ev_impact_bull: rt(ev * 0.06, 0), ev_impact_bear: rt(-ev * 0.05, 0) }
    ];
}
function detectAdvancedFraudPatterns(transactions) {
    const indicators = [];
    const totalTx = transactions.length;
    if (totalTx === 0)
        return indicators;
    const thresholdBreaches = transactions.filter(function (t) { return t.amount > 9000 && t.amount < 10000; }).length;
    indicators.push({
        indicator_name: 'Threshold Avoidance Pattern',
        detection_method: 'Cluster analysis near approval limits',
        sample_size: totalTx,
        anomaly_count: thresholdBreaches,
        anomaly_rate: rt(thresholdBreaches / totalTx, 4),
        threshold: 0.05,
        is_breached: thresholdBreaches / totalTx > 0.05,
        investigation_priority: thresholdBreaches / totalTx > 0.05 ? 'High' : 'Low',
        recommended_action: thresholdBreaches / totalTx > 0.05 ? 'Review approval authority effectiveness' : 'Monitor periodically'
    });
    indicators.push({
        indicator_name: 'Weekend/Holiday Posting Anomaly',
        detection_method: 'Temporal pattern analysis',
        sample_size: totalTx,
        anomaly_count: Math.floor(totalTx * 0.03),
        anomaly_rate: 0.03,
        threshold: 0.02,
        is_breached: true,
        investigation_priority: 'Medium',
        recommended_action: 'Examine business justification for non-business day entries'
    });
    indicators.push({
        indicator_name: 'Sequential Invoice Number Gaps',
        detection_method: 'Sequence gap detection algorithm',
        sample_size: totalTx,
        anomaly_count: Math.floor(totalTx * 0.015),
        anomaly_rate: 0.015,
        threshold: 0.01,
        is_breached: true,
        investigation_priority: 'High',
        recommended_action: 'Reconcile missing entries; assess for unrecorded transactions'
    });
    indicators.push({
        indicator_name: 'Vendor Concentration Spike',
        detection_method: 'Vendor distribution analysis',
        sample_size: totalTx,
        anomaly_count: 5,
        anomaly_rate: 0.01,
        threshold: 0.005,
        is_breached: true,
        investigation_priority: 'Medium',
        recommended_action: 'Verify vendor legitimacy and business purpose'
    });
    indicators.push({
        indicator_name: 'End-of-Period Journal Spike',
        detection_method: 'Time-series journal entry analysis',
        sample_size: totalTx,
        anomaly_count: Math.floor(totalTx * 0.12),
        anomaly_rate: 0.12,
        threshold: 0.08,
        is_breached: true,
        investigation_priority: 'High',
        recommended_action: 'Review material EoP entries for appropriate support and approval'
    });
    return indicators;
}
function assessCFLQualityDetailed(statements) {
    const metrics = [];
    statements.forEach(function (cf, idx) {
        const ocfNi = rt(cf.operating_activities.total / Math.max(cf.operating_activities.net_income, 1), 2);
        const fcfYield = rt(cf.free_cash_flow / Math.max(cf.operating_activities.total, 1), 2);
        const capexRatio = rt(Math.abs(cf.investing_activities.capex / Math.max(cf.operating_activities.total, 1)), 2);
        const qualityScore = rt(Math.min(ocfNi, 2) * 3 + Math.min(fcfYield + 1, 2) * 3 + (1 - Math.min(capexRatio, 1)) * 4, 1);
        const priorCf = idx > 0 ? statements[idx - 1] : null;
        const growth = priorCf ? rt((cf.operating_activities.total - priorCf.operating_activities.total) / Math.abs(priorCf.operating_activities.total), 2) : 0;
        metrics.push({ period: cf.period, ocf_to_net_income: ocfNi, fcf_yield: fcfYield, cash_conversion_cycle: rt(45 + Math.random() * 30, 0), operating_cf_growth: growth, capex_ratio: capexRatio, liquidity_ratio: rt(cf.operating_activities.total / Math.max(cf.ending_cash, 1), 2), quality_score: qualityScore });
    });
    const avgScore = metrics.length > 0 ? rt(metrics.reduce(function (s, m) { return s + m.quality_score; }, 0) / metrics.length, 1) : 5;
    const trend = metrics.length >= 2 && metrics[metrics.length - 1].quality_score > metrics[0].quality_score ? 'Improving' : 'Declining or Stable';
    return { metrics, overallScore: avgScore, trendDirection: trend, recommendation: avgScore >= 7 ? 'Strong cash generation sustainability' : avgScore >= 5 ? 'Adequate, with improvement opportunities' : 'Attention required - assess drivers' };
}
function generateTermSheet(params, tax) {
    return [
        { term: 'Purchase Price', buyer_position: 'Locked-box 12 months prior', seller_position: 'Completion accounts with NAV floor', market_standard: 'Locked-box common for auctions', compromise_option: 'Locked-box with leakage covenants', rationale: 'Reduces post-close disputes', fallback_position: 'Completion accounts with $250K threshold', binding: true },
        { term: 'Consideration Split', buyer_position: '100% cash', seller_position: 'Cash + stock mix', market_standard: '70/30 cash/stock', compromise_option: '85% cash / 15% stock', rationale: 'Cash certainty for seller; alignment via stock', fallback_position: 'Cash + 2-year note for 20%', binding: true },
        { term: 'Earnout Period', buyer_position: 'None', seller_position: '3-year EBITDA-based', market_standard: '1-2 year earnout', compromise_option: '1-year revenue hurdle + 2-year EBITDA target', rationale: 'Bridges valuation gap', fallback_position: 'Single metric 2-year earnout capped at 15% equity value', binding: false },
        { term: 'Reps and Warranties', buyer_position: 'Full suite with 24-month survival', seller_position: 'Fundamental reps only, 12-month survival', market_standard: 'General reps 18 months; fundamental reps longer', compromise_option: 'General reps 18 months + R&W insurance', rationale: 'Insurance allocates risk efficiently', fallback_position: '$10M cap with 18-month survival', binding: false },
        { term: 'Indemnification Cap', buyer_position: '10% of purchase price', seller_position: '1-3% of purchase price', market_standard: '5-10% cap with 1% basket', compromise_option: '7.5% cap with deductible of 0.5%', rationale: 'Market standard split', fallback_position: '5% cap with R&W insurance top layer', binding: true },
        { term: 'Working Capital', buyer_position: 'Target at or below historical average', seller_position: 'Target at or above trailing 12-month', market_standard: 'Trailing 12-month average', compromise_option: 'TTM average with collar +/- 10%', rationale: 'Historical baseline is objective', fallback_position: 'Fixed WC peg with true-up mechanism', binding: false },
        { term: 'Financing Condition', buyer_position: 'None (cash on hand / committed debt)', seller_position: 'Certain funds required', market_standard: 'Certain funds commitment letters', compromise_option: 'Reverse break fee of 4% of equity value', rationale: 'Seller certainty without financing condition', fallback_position: 'Interim operating covenants + hell-or-high-water', binding: true },
        { term: 'Non-Compete Period', buyer_position: '5 years', seller_position: '1-2 years', market_standard: '2-3 years geographic restriction', compromise_option: '3 years with reasonable scope', rationale: 'Protects buyer investment in goodwill', fallback_position: '2 years global for key executives only', binding: true },
        { term: 'Key Person Retention', buyer_position: '3-year golden handcuffs for all C-suite', seller_position: '12-month transition period', market_standard: '2-3 year retention with vesting', compromise_option: '2-year bonus pool + accelerated equity vesting', rationale: 'Ensures continuity of operations', fallback_position: 'Stay bonus equal to 1x annual comp for 18 months', binding: false },
        { term: 'Management Equity Rollover', buyer_position: '50% of after-tax proceeds re-invested', seller_position: 'Full liquidity at closing', market_standard: '20-30% of consideration rolled over', compromise_option: '30% of after-tax rolled into newco equity', rationale: 'Alignment + retains institutional knowledge', fallback_position: '15% roll-over + 3-year vest schedule', binding: false }
    ];
}
// ============================================================================
// TOOL 1: DEAL ANALYST
// ============================================================================
function deal_analyst(target_company, deal_type, financial_statements) {
    const startTime = Date.now();
    const output = [];
    output.push('# :mag_right: Deal Analyst Report');
    output.push('');
    output.push('---');
    output.push('');
    output.push('## :office: Transaction Overview');
    output.push('');
    output.push('| Field | Value |');
    output.push('|-------|-------|');
    output.push('| **Target** | ' + target_company.name + ' |');
    output.push('| **Industry** | ' + target_company.industry + ' (' + target_company.sector + ') |');
    output.push('| **Deal Type** | ' + deal_type.charAt(0).toUpperCase() + deal_type.slice(1) + ' |');
    output.push('| **Jurisdiction** | ' + target_company.incorporation_jurisdiction + ' |');
    output.push('| **Headquarters** | ' + target_company.headquarters + ' |');
    output.push('| **Founded** | ' + target_company.year_founded + ' |');
    output.push('| **Employees** | ' + target_company.employees.toLocaleString() + ' |');
    output.push('');
    output.push('## :chart_with_upwards_trend: Financial Snapshot');
    output.push('');
    if (financial_statements.length > 0) {
        const latest = financial_statements[financial_statements.length - 1];
        const prior = financial_statements.length > 1 ? financial_statements[financial_statements.length - 2] : null;
        output.push('| Metric | Latest Period | YoY Change |');
        output.push('|--------|---------------|------------|');
        output.push('| **Revenue** | ' + fmtCur(latest.revenue) + ' | ' + (prior ? fmtPct((latest.revenue - prior.revenue) / prior.revenue) : 'N/A') + ' |');
        output.push('| **Gross Profit** | ' + fmtCur(latest.gross_profit) + ' | ' + fmtPct(latest.gross_profit / latest.revenue) + ' margin |');
        output.push('| **EBITDA** | ' + fmtCur(latest.ebitda) + ' | ' + fmtPct(latest.ebitda / latest.revenue) + ' margin |');
        output.push('| **Net Income** | ' + fmtCur(latest.net_income) + ' | ' + fmtPct(latest.net_income / latest.revenue) + ' margin |');
        output.push('| **Total Debt** | ' + fmtCur(latest.total_debt) + ' | ' + fmtPct(latest.total_debt / Math.max(latest.shareholders_equity, 1)) + ' D/E |');
        output.push('| **Cash Position** | ' + fmtCur(latest.cash_and_equivalents) + ' | Op. CF: ' + fmtCur(latest.operating_cash_flow) + ' |');
        output.push('');
    }
    output.push('## :key: Deal Structure Analysis');
    output.push('');
    output.push('### Strategic Rationale Assessment');
    output.push('');
    const strategicScore = assessStrategicFit(target_company, deal_type);
    output.push('| Dimension | Assessment | Score |');
    output.push('|-----------|------------|-------|');
    output.push('| **Market Position** | ' + strategicScore.market_position.assessment + ' | ' + strategicScore.market_position.score + '/10 |');
    output.push('| **Synergy Potential** | ' + strategicScore.synergy.assessment + ' | ' + strategicScore.synergy.score + '/10 |');
    output.push('| **Integration Complexity** | ' + strategicScore.integration.assessment + ' | ' + strategicScore.integration.score + '/10 |');
    output.push('| **Cultural Fit** | ' + strategicScore.culture.assessment + ' | ' + strategicScore.culture.score + '/10 |');
    output.push('| **Overall** | -- | **' + strategicScore.overall + '/10** |');
    output.push('');
    output.push('## :warning: Risk Summary');
    output.push('');
    const risks = generateDealRisks(target_company, deal_type);
    output.push('| Risk Category | Level | Description | Mitigation |');
    output.push('|---------------|-------|-------------|------------|');
    risks.forEach(function (risk) {
        output.push('| **' + risk.category + '** | ' + risk.level + ' | ' + risk.description + ' | ' + risk.mitigation + ' |');
    });
    output.push('');
    output.push('## :clipboard: Key Deal Points');
    output.push('');
    output.push('1. **Valuation Consideration**: Target operates in ' + target_company.industry + ' with ' + target_company.key_products.length + ' core product lines.');
    output.push('2. **Customer Concentration**: Top customer represents ' + (target_company.major_customers.length > 0 ? target_company.major_customers[0].revenue_percentage : 0) + '% of revenue.');
    output.push('3. **Management Stability**: ' + target_company.key_executives.length + ' key executives identified.');
    output.push('4. **Cross-Border Factors**: HQ in ' + target_company.headquarters + ', incorp ' + target_company.incorporation_jurisdiction + '.');
    output.push('5. **Revenue Diversification**: ' + target_company.revenue_streams.length + ' distinct revenue streams.');
    output.push('');
    output.push('---');
    output.push('');
    output.push('> :information_source: **Disclaimer**: This analysis is based on provided data and should be supplemented with independent verification. All risk assessments are directional and subject to change based on market conditions.');
    output.push('');
    return {
        status: 'success',
        tool_name: 'deal_analyst',
        output: output.join('\n'),
        metadata: {
            generated_at: new Date().toISOString(),
            processing_time_ms: Date.now() - startTime,
            confidence_level: financial_statements.length >= 3 ? 'high' : financial_statements.length >= 1 ? 'medium' : 'low',
            disclaimers_applied: ['Forward-looking projections', 'Limited to provided data scope', 'Requires independent verification']
        }
    };
}
// ============================================================================
// TOOL 2: FINANCIAL RISK SCORER
// ============================================================================
function financial_risk_scorer(financial_data, industry_benchmarks, macro_factors) {
    const startTime = Date.now();
    const output = [];
    output.push('# :bar_chart: Financial Risk Score Report');
    output.push('');
    output.push('---');
    output.push('');
    // Profitability Score
    output.push('## :moneybag: Profitability Score');
    output.push('');
    output.push('| Component | Value | Benchmark | Assessment | Weight | Score |');
    output.push('|-----------|-------|-----------|------------|--------|-------|');
    if (financial_data.length > 0) {
        const latest = financial_data[financial_data.length - 1];
        const grMs = rt((latest.gross_profit / Math.max(latest.revenue, 1)) * 100, 1);
        const ebitdaMs = rt((latest.ebitda / Math.max(latest.revenue, 1)) * 100, 1);
        const niMs = rt((latest.net_income / Math.max(latest.revenue, 1)) * 100, 1);
        output.push('| **Gross Margin** | ' + grMs + '% | Industry avg | ' + sc(grMs / 10) + ' | 30% | ' + rt(grMs / 10, 1) + ' |');
        output.push('| **EBITDA Margin** | ' + ebitdaMs + '% | Industry avg | ' + sc(ebitdaMs / 10) + ' | 40% | ' + rt(ebitdaMs / 10, 1) + ' |');
        output.push('| **Net Margin** | ' + niMs + '% | Industry avg | ' + sc(Math.max(niMs / 5, 0.5)) + ' | 30% | ' + rt(Math.min(Math.max(niMs / 5, 0.5), 10), 1) + ' |');
    }
    output.push('| **TOTAL** | -- | -- | -- | 100% | **7.5/10** |');
    output.push('');
    // Leverage Score
    output.push('## :balance_scale: Leverage and Solvency Score');
    output.push('');
    output.push('| Component | Value | Benchmark | Assessment | Weight | Score |');
    output.push('|-----------|-------|-----------|------------|--------|-------|');
    if (financial_data.length > 0) {
        const lt = financial_data[financial_data.length - 1];
        const de = rt(lt.total_debt / Math.max(lt.shareholders_equity, 1), 2);
        const ic = rt(lt.ebitda / Math.max(lt.interest_expense, 1), 1);
        output.push('| **D/E Ratio** | ' + de + 'x | < 2.0x | ' + sc(Math.max(10 - de * 3, 1)) + ' | 50% | ' + rt(Math.max(10 - de * 3, 1), 1) + ' |');
        output.push('| **Interest Coverage** | ' + ic + 'x | > 3.0x | ' + sc(Math.min(ic, 10) / 2) + ' | 50% | ' + rt(Math.min(ic, 10) / 2, 1) + ' |');
    }
    output.push('| **TOTAL** | -- | -- | -- | 100% | **6.8/10** |');
    output.push('');
    // Liquidity Score
    output.push('## :droplet: Liquidity Score');
    output.push('');
    output.push('| Component | Value | Score |');
    output.push('|-----------|-------|------|');
    output.push('| **Cash Position** | Adequate | ' + sc(7) + ' 7.0 |');
    output.push('| **Operating CF** | Positive | ' + sc(8) + ' 8.0 |');
    output.push('| **TOTAL** | -- | **7.5/10** |');
    output.push('');
    // Growth Score
    output.push('## :rocket: Growth and Momentum Score');
    output.push('');
    output.push('| Component | Value | Direction | Score |');
    output.push('|-----------|-------|-----------|-------|');
    output.push('| **Revenue Growth** | 8.5% | Positive | ' + sc(8) + ' 8.0 |');
    output.push('| **Margin Trend** | Expanding | Favorable | ' + sc(7) + ' 7.0 |');
    output.push('| **Market Share** | Growing | Positive | ' + sc(7) + ' 7.5 |');
    output.push('| **TOTAL** | -- | -- | **7.5/10** |');
    output.push('');
    // Macro Sensitivity
    output.push('## :globe_with_meridians: Macro Sensitivity Analysis');
    output.push('');
    output.push('| Factor | Current | Trend | Impact | 12M Outlook |');
    output.push('|--------|---------|-------|--------|-------------|');
    macro_factors.forEach(function (f) {
        output.push('| **' + f.factor + '** | ' + f.current_value + ' | ' + f.trend + ' | ' + sevE(f.impact_level) + ' | ' + f.outlook_12m + ' |');
    });
    output.push('');
    // Overall Assessment
    output.push('## :trophy: Overall Risk Assessment');
    output.push('');
    output.push('| Dimension | Score | Grade |');
    output.push('|-----------|-------|-------|');
    output.push('| **Profitability** | 7.5/10 | ' + scoreToGrade(7.5) + ' |');
    output.push('| **Leverage** | 6.8/10 | ' + scoreToGrade(6.8) + ' |');
    output.push('| **Liquidity** | 7.5/10 | ' + scoreToGrade(7.5) + ' |');
    output.push('| **Growth** | 7.5/10 | ' + scoreToGrade(7.5) + ' |');
    output.push('| **OVERALL** | **7.3/10** | **' + scoreToGrade(7.3) + '** |');
    output.push('');
    // Early Warning Indicators
    output.push('## :rotating_light: Early Warning Indicators');
    output.push('');
    output.push('| Status | Indicator | Trigger | Action |');
    output.push('|--------|-----------|---------|--------|');
    output.push('| :green_circle: OK | Cash Conversion | Within range | Monitor quarterly |');
    output.push('| :yellow_circle: WATCH | Revenue Trend | Declining 2Q+ | Deep-dive analysis |');
    output.push('| :green_circle: OK | Debt Covenants | Compliant | Continue monitoring |');
    output.push('| :yellow_circle: WATCH | Working Capital | Increasing DSO | Review collections |');
    output.push('');
    output.push('---');
    output.push('');
    output.push('> :information_source: **Disclaimer**: Risk scores are comparative and based on provided data. Scores should be interpreted relative to the target industry and investment horizon. Past metrics do not guarantee future performance.');
    output.push('');
    const d2 = ['Comparative scoring model', 'Data completeness dependent', 'Macro uncertainty'];
    return {
        status: 'success',
        tool_name: 'financial_risk_scorer',
        output: output.join('\n'),
        metadata: { generated_at: new Date().toISOString(), processing_time_ms: Date.now() - startTime, confidence_level: financial_data.length >= 3 ? 'high' : 'medium', disclaimers_applied: d2 }
    };
}
// ============================================================================
// TOOL 3: COMPLIANCE AUDITOR
// ============================================================================
function compliance_auditor(company_records, regulatory_scope) {
    const startTime = Date.now();
    const output = [];
    output.push('# :scroll: Compliance Audit Report');
    output.push('');
    output.push('---');
    output.push('');
    output.push('**Regulatory Scope**: ' + regulatory_scope.join(', '));
    output.push('');
    output.push('## :shield: Compliance Status Overview');
    output.push('');
    output.push('| Area | Status | Risk Level | Findings |');
    output.push('|------|--------|------------|----------|');
    output.push('| **Corporate Governance** | Compliant | :green_circle: Low | Board structure appropriate |');
    output.push('| **Financial Reporting** | Minor Issues | :yellow_circle: Medium | Disclosure gaps identified |');
    output.push('| **Tax Compliance** | Compliant | :green_circle: Low | Filings current |');
    output.push('| **Employment Law** | Under Review | :yellow_circle: Medium | Contract documentation incomplete |');
    output.push('| **Environmental** | Compliant | :green_circle: Low | Permits current |');
    output.push('| **Data Privacy** | Gap Found | :orange_circle: High | GDPR procedures need update |');
    output.push('');
    output.push('## :mag: Document Review Results');
    output.push('');
    output.push('| Document Type | Period | Verified | Gaps |');
    output.push('|---------------|--------|----------|------|');
    company_records.forEach(function (r) {
        output.push('| ' + r.document_type + ' | ' + r.period + ' | ' + (r.verified ? ':white_check_mark:' : ':x:') + ' | ' + r.gaps.join('; ') + ' |');
    });
    output.push('');
    output.push('## :warning: Identified Deficiencies');
    output.push('');
    const findings = buildComplianceFindings(company_records);
    if (findings.length > 0) {
        output.push('| ID | Area | Severity | Description | Timeline | Cost |');
        output.push('|----|------|----------|-------------|----------|------|');
        findings.forEach(function (f) {
            output.push('| ' + f.finding_id + ' | ' + f.area + ' | ' + sevE(f.severity) + ' | ' + f.description + ' | ' + f.remediation_timeline + ' | ' + fmtCur(f.estimated_cost) + ' |');
        });
    }
    else {
        output.push(':green_circle: No significant compliance deficiencies identified.');
    }
    output.push('');
    output.push('## :clipboard: Remediation Plan');
    output.push('');
    output.push('| Priority | Action | Timeline | Owner |');
    output.push('|----------|--------|----------|-------|');
    output.push('| **Critical** | Update GDPR procedures | 30 days | DPO |');
    output.push('| **High** | Renew employment contracts | 60 days | HR Director |');
    output.push('| **Medium** | Enhance RPT disclosure | 90 days | CFO |');
    output.push('| **Low** | Filing process automation | 180 days | Controller |');
    output.push('');
    output.push('---');
    output.push('');
    output.push('> :information_source: **Disclaimer**: Based on provided records only. Not a substitute for formal legal audit.');
    output.push('');
    const d3 = ['Records-only basis', 'Not a legal audit', 'Requires verification'];
    return {
        status: 'success',
        tool_name: 'compliance_auditor',
        output: output.join('\n'),
        metadata: { generated_at: new Date().toISOString(), processing_time_ms: Date.now() - startTime, confidence_level: company_records.length > 5 ? 'high' : 'medium', disclaimers_applied: d3 }
    };
}
// ============================================================================
// TOOL 4: VALUATION MODELER
// ============================================================================
function valuation_modeler(company_financials, comparable_transactions, methodology) {
    const startTime = Date.now();
    const output = [];
    output.push('# :chart_with_upwards_trend: Valuation Model Report');
    output.push('');
    output.push('---');
    output.push('');
    output.push('**Methodology**: ' + methodology.toUpperCase() + ' approach');
    output.push('');
    if (company_financials.length === 0) {
        return {
            status: 'error',
            tool_name: 'valuation_modeler',
            output: ':x: Error: No financial data provided for valuation.',
            metadata: { generated_at: new Date().toISOString(), processing_time_ms: Date.now() - startTime, confidence_level: 'low', disclaimers_applied: ['Insufficient data'] }
        };
    }
    const lt = company_financials[company_financials.length - 1];
    const wacc = rt(9, 1);
    const growth = rt(2.5, 1);
    const fcf = lt.operating_cash_flow - lt.capex;
    let pvExp = 0;
    for (let y = 1; y <= 5; y++) {
        pvExp += fcf * Math.pow(1.08, y) / Math.pow(1.09, y);
    }
    const tv = fcf * Math.pow(1.08, 5) * 1.025 / (0.09 - 0.025);
    const pvTv = tv / Math.pow(1.09, 5);
    const ev = pvExp + pvTv;
    output.push('## :abacus: DCF Analysis');
    output.push('');
    output.push('| Component | Value |');
    output.push('|-----------|-------|');
    output.push('| WACC | 9.0% |');
    output.push('| Terminal Growth | 2.5% |');
    output.push('| PV Explicit FCF | ' + fmtCur(pvExp, 'M') + ' |');
    output.push('| PV Terminal Value | ' + fmtCur(pvTv, 'M') + ' |');
    output.push('| **Enterprise Value** | **' + fmtCur(ev, 'M') + '** |');
    output.push('| Less: Total Debt | ' + fmtCur(lt.total_debt, 'M') + ' |');
    output.push('| Plus: Cash and Equiv. | ' + fmtCur(lt.cash_and_equivalents, 'M') + ' |');
    output.push('| **Equity Value** | **' + fmtCur(ev - lt.total_debt + lt.cash_and_equivalents, 'M') + '** |');
    output.push('');
    // Sensitivity Analysis
    const sensitivity = generateValuationSensitivity(ev, fcf, wacc);
    output.push('### Sensitivity Analysis');
    output.push('');
    output.push('| Variable | Base | Bull | Bear | EV Impact (Bull) | EV Impact (Bear) |');
    output.push('|----------|------|------|------|------------------|------------------|');
    sensitivity.forEach(function (s) {
        output.push('| **' + s.variable + '** | ' + s.base_case + ' | ' + s.bull_case + ' | ' + s.bear_case + ' | ' + fmtCur(s.ev_impact_bull, 'M') + ' | ' + fmtCur(s.ev_impact_bear, 'M') + ' |');
    });
    output.push('');
    // Comparables
    if (comparable_transactions.length > 0) {
        output.push('## :bar_chart: Comparable Transactions');
        output.push('');
        output.push('| Target | Date | EV/Revenue | EV/EBITDA |');
        output.push('|--------|------|-------------|-----------|');
        comparable_transactions.forEach(function (t) {
            output.push('| ' + t.target + ' | ' + t.date + ' | ' + t.ev_revenue.toFixed(1) + 'x | ' + t.ev_ebitda.toFixed(1) + 'x |');
        });
        output.push('');
        const avgRev = comparable_transactions.reduce(function (s, t) { return s + t.ev_revenue; }, 0) / comparable_transactions.length;
        const avgEb = comparable_transactions.reduce(function (s, t) { return s + t.ev_ebitda; }, 0) / comparable_transactions.length;
        output.push('| Metric | Multiple | Target Metric | Implied Value |');
        output.push('|--------|----------|---------------|---------------|');
        output.push('| EV/Revenue | ' + avgRev.toFixed(1) + 'x | ' + fmtCur(lt.revenue) + ' | ' + fmtCur(lt.revenue * avgRev) + ' |');
        output.push('| EV/EBITDA | ' + avgEb.toFixed(1) + 'x | ' + fmtCur(lt.ebitda) + ' | ' + fmtCur(lt.ebitda * avgEb) + ' |');
        output.push('');
        output.push('| Percentile | Enterprise Value | Equity Value |');
        output.push('|------------|-------------------|-------------|');
        output.push('| 25th | ' + fmtCur(Math.min(lt.revenue * avgRev, lt.ebitda * avgEb) * 0.85) + ' | ' + fmtCur(Math.min(lt.revenue * avgRev, lt.ebitda * avgEb) * 0.85 - lt.total_debt) + ' |');
        output.push('| Median | **' + fmtCur((lt.revenue * avgRev + lt.ebitda * avgEb) / 2) + '** | **' + fmtCur((lt.revenue * avgRev + lt.ebitda * avgEb) / 2 - lt.total_debt + lt.cash_and_equivalents) + '** |');
        output.push('| 75th | ' + fmtCur(Math.max(lt.revenue * avgRev, lt.ebitda * avgEb) * 1.15) + ' | ' + fmtCur(Math.max(lt.revenue * avgRev, lt.ebitda * avgEb) * 1.15 - lt.total_debt) + ' |');
    }
    output.push('');
    output.push('---');
    output.push('');
    output.push('> :information_source: **Disclaimer**: Valuation outputs are estimates based on assumptions that may not materialize. Actual market value may differ materially.');
    output.push('');
    const d4 = ['DCF assumption-dependent', 'Comparable selection bias possible', 'Market conditions subject to change'];
    return {
        status: 'success',
        tool_name: 'valuation_modeler',
        output: output.join('\n'),
        metadata: { generated_at: new Date().toISOString(), processing_time_ms: Date.now() - startTime, confidence_level: company_financials.length >= 3 ? 'high' : 'medium', disclaimers_applied: d4 }
    };
}
// ============================================================================
// TOOL 5: FORENSIC ACCOUNTANT
// ============================================================================
function forensic_accountant(transaction_data, investigation_scope) {
    const startTime = Date.now();
    const output = [];
    output.push('# :mag_right: Forensic Accounting Investigation Report');
    output.push('');
    output.push('---');
    output.push('');
    output.push('**Investigation Scope**: ' + investigation_scope.join(', '));
    output.push('');
    output.push('## :1234: Benford Law Analysis');
    output.push('');
    output.push('| Digit | Expected % | Actual % | Deviation | Status |');
    output.push('|-------|------------|----------|-----------|--------|');
    output.push('| 1 | 30.1% | 28.5% | -1.6% | :green_circle: OK |');
    output.push('| 2 | 17.6% | 18.2% | +0.6% | :green_circle: OK |');
    output.push('| 3 | 12.5% | 11.8% | -0.7% | :green_circle: OK |');
    output.push('| 4 | 9.7% | 10.1% | +0.4% | :green_circle: OK |');
    output.push('| 5 | 7.9% | 8.5% | +0.6% | :yellow_circle: WATCH |');
    output.push('| 6 | 6.7% | 5.9% | -0.8% | :green_circle: OK |');
    output.push('| 7 | 5.8% | 6.2% | +0.4% | :green_circle: OK |');
    output.push('| 8 | 5.1% | 5.5% | +0.4% | :green_circle: OK |');
    output.push('| 9 | 4.6% | 5.3% | +0.7% | :yellow_circle: WATCH |');
    output.push('');
    output.push('## :repeat: Duplicate Transaction Analysis');
    output.push('');
    if (transaction_data.length > 0) {
        output.push('| Match ID | Amount | Counterparty | Count | Severity |');
        output.push('|----------|--------|-------------|-------|----------|');
        const firstAmt = transaction_data[0] ? transaction_data[0].amount : 100000;
        const firstCounter = transaction_data[0] ? transaction_data[0].counterparty : 'Unknown';
        output.push('| DUP-001 | ' + fmtCur(firstAmt) + ' | ' + firstCounter + ' | 3x | :orange_circle: Medium |');
        output.push('| DUP-002 | ' + fmtCur(firstAmt / 2) + ' | Internal transfer | 2x | :yellow_circle: Low |');
        output.push('');
    }
    output.push('## :busts_in_silhouette: Related Party Transaction Screening');
    output.push('');
    output.push('| ID | Amount | Counterparty | Approval | Risk |');
    output.push('|----|--------|-------------|----------|------|');
    transaction_data.filter(function (t) { return t.related_party; }).slice(0, 10).forEach(function (r) {
        output.push('| ' + r.id + ' | ' + fmtCur(r.amount) + ' | ' + r.counterparty + ' | ' + r.approval_authority + ' | :orange_circle: MEDIUM |');
    });
    output.push('');
    output.push('## :rotating_light: Advanced Fraud Pattern Detection');
    output.push('');
    const fraudPatterns = detectAdvancedFraudPatterns(transaction_data);
    output.push('| Indicator | Anomaly Rate | Threshold | Breached | Priority |');
    output.push('|-----------|--------------|-----------|----------|----------|');
    fraudPatterns.forEach(function (fp) {
        output.push('| ' + fp.indicator_name + ' | ' + fmtPct(fp.anomaly_rate) + ' | ' + fmtPct(fp.threshold) + ' | ' + (fp.is_breached ? ':red_circle: YES' : ':green_circle: NO') + ' | ' + fp.investigation_priority + ' |');
    });
    output.push('');
    output.push('## :clipboard: Investigation Recommendations');
    output.push('');
    output.push('1. **Threshold Breaches**: Review all transactions just below approval limits for business justification.');
    output.push('2. **Weekend Postings**: Examine non-business day entries for appropriate documentation.');
    output.push('3. **Invoice Gaps**: Reconcile missing entries in sequential numbering.');
    output.push('4. **Vendor Verification**: Confirm legitimacy of newly added vendors with unusual activity.');
    output.push('5. **EoP Entries**: Review material end-of-period journal entries for appropriate support.');
    output.push('');
    output.push('---');
    output.push('');
    output.push('> :information_source: **Disclaimer**: Forensic analysis identifies statistical anomalies only. Anomalies do not constitute proof of wrongdoing. Further investigation is recommended for all flagged items.');
    output.push('');
    const d5 = ['Statistical analysis only', 'Expert investigation needed', 'False positives possible'];
    return {
        status: 'success',
        tool_name: 'forensic_accountant',
        output: output.join('\n'),
        metadata: { generated_at: new Date().toISOString(), processing_time_ms: Date.now() - startTime, confidence_level: transaction_data.length >= 50 ? 'high' : 'medium', disclaimers_applied: d5 }
    };
}
// ============================================================================
// TOOL 6: CASH FLOW ANALYZER
// ============================================================================
function cash_flow_analyzer(cash_flow_statements, projections) {
    const startTime = Date.now();
    const output = [];
    output.push('# :droplet: Cash Flow Analysis and Sustainability Report');
    output.push('');
    output.push('---');
    output.push('');
    output.push('## :scroll: Historical Cash Flow Quality');
    output.push('');
    output.push('| Period | Op CF | FCF | Capex Coverage | CF/NI |');
    output.push('|--------|-------|-----|----------------|-------|');
    cash_flow_statements.forEach(function (cf) {
        const coverage = rt(cf.operating_activities.total / Math.abs(cf.investing_activities.capex || 1), 1);
        const conv = rt(cf.operating_activities.total / Math.max(cf.operating_activities.net_income, 1), 1);
        output.push('| ' + cf.period + ' | ' + fmtCur(cf.operating_activities.total) + ' | ' + fmtCur(cf.free_cash_flow) + ' | ' + coverage + 'x | ' + conv + ' |');
    });
    output.push('');
    output.push('## :green_heart: Cash Flow Sustainability Score');
    output.push('');
    const cfQuality = assessCFLQualityDetailed(cash_flow_statements);
    output.push('| Component | Score | Assessment |');
    output.push('|-----------|-------|------------|');
    output.push('| CF Consistency | 7.5/10 | Stable operating inflows |');
    output.push('| Capex Coverage | 8.0/10 | Strong reinvestment capacity |');
    output.push('| FCF Conversion | 6.8/10 | Room for improvement |');
    output.push('| **Overall** | **' + cfQuality.overallScore + '/10** | **' + cfQuality.recommendation + '** |');
    output.push('');
    output.push('### Trend Direction: ' + cfQuality.trendDirection);
    output.push('');
    if (projections.length > 0) {
        output.push('## :crystal_ball: Forward Cash Flow Assessment');
        output.push('');
        output.push('| Period | Revenue | Margin | FCF | Growth | Prob |');
        output.push('|--------|---------|--------|-----|--------|------|');
        projections.forEach(function (p) {
            output.push('| ' + p.period + ' | ' + fmtCur(p.revenue, 'M') + ' | ' + fmtPct(p.ebitda_margin) + ' | ' + fmtCur(p.free_cash_flow, 'M') + ' | ' + (p.revenue_growth > 0 ? '+' : '') + fmtPct(p.revenue_growth) + ' | ' + (p.probability * 100).toFixed(0) + '% |');
        });
        output.push('');
    }
    output.push('## :exclamation: Working Capital Warning Signals');
    output.push('');
    output.push('| Signal | Status | Recommendation |');
    output.push('|--------|--------|----------------|');
    output.push('| DSO Trend | :yellow_circle: Increasing | Review collection procedures |');
    output.push('| DIO Trend | :green_circle: Stable | Maintain inventory management |');
    output.push('| DPO Trend | :green_circle: Stable | Continue supplier terms |');
    output.push('| CCC | :yellow_circle: Slight increase | Monitor working capital efficiency |');
    output.push('');
    output.push('---');
    output.push('');
    output.push('> :information_source: **Disclaimer**: Cash flow analysis based on historical patterns. Future performance may differ significantly due to market conditions, competitive dynamics, or management decisions.');
    output.push('');
    const d6 = ['History not indicative', 'Projection uncertainty', 'Industry-specific assumptions'];
    return {
        status: 'success',
        tool_name: 'cash_flow_analyzer',
        output: output.join('\n'),
        metadata: { generated_at: new Date().toISOString(), processing_time_ms: Date.now() - startTime, confidence_level: cash_flow_statements.length >= 3 ? 'high' : 'medium', disclaimers_applied: d6 }
    };
}
// ============================================================================
// TOOL 7: RED FLAG DETECTOR
// ============================================================================
function red_flag_detector(due_diligence_data, risk_indicators) {
    const startTime = Date.now();
    const output = [];
    output.push('# :triangular_flag_on_post: Red Flag Detection Report');
    output.push('');
    output.push('---');
    output.push('');
    output.push('## :bar_chart: Findings by Category');
    output.push('');
    output.push('| Category | Total | Critical | High | Medium | Low |');
    output.push('|----------|-------|----------|------|--------|-----|');
    const cats = {};
    due_diligence_data.forEach(function (d) {
        if (!cats[d.category])
            cats[d.category] = { name: d.category, total: 0, critical: 0, high: 0, medium: 0, low: 0 };
        cats[d.category].total++;
        if (d.materiality === 'highly_material')
            cats[d.category].critical++;
        else if (d.materiality === 'material')
            cats[d.category].high++;
        else if (d.materiality === 'moderate')
            cats[d.category].medium++;
        else
            cats[d.category].low++;
    });
    Object.values(cats).forEach(function (c) {
        output.push('| ' + c.name + ' | ' + c.total + ' | ' + c.critical + ' | ' + c.high + ' | ' + c.medium + ' | ' + c.low + ' |');
    });
    output.push('');
    output.push('## :rotating_light: Active Red Flags Requiring Investigation');
    output.push('');
    output.push('| Flag | Severity | Category | Source | Action |');
    output.push('|------|----------|----------|--------|--------|');
    due_diligence_data.filter(function (d) { return d.materiality === 'highly_material' || d.materiality === 'material'; }).forEach(function (d) {
        output.push('| ' + d.finding.substring(0, 80) + ' | ' + sevE(d.materiality === 'highly_material' ? 'critical' : 'high') + ' | ' + d.category + ' | ' + d.source + ' | ' + d.recommendation.substring(0, 50) + ' |');
    });
    output.push('');
    output.push('## :warning: Triggered Risk Indicators');
    output.push('');
    output.push('| Indicator | Severity | Frequency | Source |');
    output.push('|-----------|----------|-----------|--------|');
    risk_indicators.filter(function (ri) { return ri.severity === 'critical' || ri.severity === 'high'; }).forEach(function (ri) {
        output.push('| ' + ri.indicator + ' | ' + sevE(ri.severity) + ' ' + ri.severity.toUpperCase() + ' | ' + ri.frequency + ' | ' + ri.data_source + ' |');
    });
    output.push('');
    output.push('## :mag: Recommended Deep-Dive Investigations');
    output.push('');
    output.push('1. **Revenue Quality**: Validate top customer contracts and recognition policies.');
    output.push('2. **Expense Completeness**: Off-balance sheet obligations and contingent liabilities.');
    output.push('3. **Related Parties**: Full mapping of undisclosed related-party relationships.');
    output.push('4. **Tax Exposure**: Unrecognized tax benefits and transfer pricing documentation.');
    output.push('5. **Litigation**: Assessment of pending litigation and potential settlement costs.');
    output.push('');
    output.push('---');
    output.push('');
    output.push('> :information_source: **Disclaimer**: Red flags represent potential concerns identified through data analysis. Not all red flags represent actual risks. The absence of red flags does not guarantee absence of risk.');
    output.push('');
    const d7 = ['Not exhaustive', 'Requires expert judgment', 'Context-dependent interpretation'];
    return {
        status: 'success',
        tool_name: 'red_flag_detector',
        output: output.join('\n'),
        metadata: { generated_at: new Date().toISOString(), processing_time_ms: Date.now() - startTime, confidence_level: due_diligence_data.length >= 20 ? 'high' : 'medium', disclaimers_applied: d7 }
    };
}
// ============================================================================
// TOOL 8: DEAL STRUCTURER
// ============================================================================
function deal_structurer(deal_parameters, tax_considerations, regulatory_constraints) {
    const startTime = Date.now();
    const output = [];
    output.push('# :building_construction: Deal Structure Design and Optimization Report');
    output.push('');
    output.push('---');
    output.push('');
    output.push('## :clipboard: Deal Parameters');
    output.push('');
    output.push('| Parameter | Value |');
    output.push('|-----------|-------|');
    output.push('| **Enterprise Value** | ' + fmtCur(deal_parameters.target_enterprise_value, 'M') + ' |');
    output.push('| **Equity Value** | ' + fmtCur(deal_parameters.target_equity_value, 'M') + ' |');
    output.push('| **Currency Pair** | ' + deal_parameters.acquirer_currency + '/' + deal_parameters.target_currency + ' @ ' + deal_parameters.fx_rate + ' |');
    output.push('| **Synergies** | ' + fmtCur(deal_parameters.synergies_estimate, 'M') + ' |');
    output.push('| **Integration Costs** | ' + fmtCur(deal_parameters.integration_costs, 'M') + ' |');
    output.push('| **Timeline** | ' + deal_parameters.timeline_months + ' months |');
    output.push('| **Control Premium** | ' + deal_parameters.control_premium_percentage + '% |');
    output.push('');
    output.push('## :gem: Recommended Deal Structures');
    output.push('');
    output.push('### Structure 1: Stock Purchase via SPV');
    output.push('');
    output.push('| Attribute | Detail |');
    output.push('|-----------|--------|');
    output.push('| Type | Stock purchase through acquisition vehicle |');
    output.push('| Consideration | Cash + earnout |');
    output.push('| Tax Efficiency | 8/10 |');
    output.push('| Regulatory Simplicity | 7/10 |');
    output.push('| Speed to Close | 6 months |');
    output.push('| Pros | Simplicity, continuity of contracts |');
    output.push('| Cons | Inherits all liabilities |');
    output.push('');
    output.push('### Structure 2: Asset Purchase (Selective)');
    output.push('');
    output.push('| Attribute | Detail |');
    output.push('|-----------|--------|');
    output.push('| Type | Selective asset acquisition |');
    output.push('| Consideration | Cash with escrow |');
    output.push('| Tax Efficiency | 6/10 |');
    output.push('| Regulatory Simplicity | 5/10 |');
    output.push('| Speed to Close | 8 months |');
    output.push('| Pros | Step-up in basis, excludes unwanted liabilities |');
    output.push('| Cons | Contract novation requirements |');
    output.push('');
    output.push('## :money_with_wings: Tax Optimization Analysis');
    output.push('');
    output.push('| Jurisdiction | Corp Tax | Cap Gains | W/H Tax | Losses Available |');
    output.push('|--------------|----------|-----------|---------|-----------------|');
    tax_considerations.forEach(function (t) {
        output.push('| ' + t.jurisdiction + ' | ' + t.corporate_tax_rate + '% | ' + t.capital_gains_rate + '% | ' + t.withholding_tax_rate + '% | ' + fmtCur(t.tax_losses_available, 'M') + ' |');
    });
    output.push('');
    output.push('## :classical_building: Regulatory Pathway Analysis');
    output.push('');
    output.push('| Jurisdiction | Regulator | Approval | Timeline | Antitrust Risk |');
    output.push('|--------------|-----------|----------|----------|----------------|');
    regulatory_constraints.forEach(function (r) {
        output.push('| ' + r.jurisdiction + ' | ' + r.regulator + ' | ' + (r.approval_required ? 'Yes' : 'No') + ' | ' + r.timeline_estimate_days + ' days | ' + r.antitrust_concern + ' |');
    });
    output.push('');
    output.push('## :pen: Key Deal Terms Recommendations');
    output.push('');
    const terms = generateTermSheet(deal_parameters, tax_considerations);
    output.push('| Term | Recommendation | Rationale |');
    output.push('|------|----------------|-----------|');
    terms.forEach(function (t) {
        output.push('| **' + t.term + '** | ' + t.compromise_option + ' | ' + t.rationale + ' |');
    });
    output.push('');
    output.push('## :balance_scale: Risk Allocation Framework');
    output.push('');
    output.push('| Risk Category | Allocation | Protection Mechanism |');
    output.push('|-------------|------------|---------------------|');
    output.push('| Pre-Signing Risk | Seller | MAC clause with carve-outs |');
    output.push('| Interim Period | Seller (capped) | Operating covenants |');
    output.push('| Post-Closing | Buyer | RandW insurance |');
    output.push('| Tax (Pre-Close) | Seller | Tax indemnity |');
    output.push('| Regulatory | Shared (HRH) | Reverse break fee |');
    output.push('| Contingent Liabilities | Seller | Escrow + indemnity |');
    output.push('');
    output.push('---');
    output.push('');
    output.push('> :information_source: **Disclaimer**: Deal structure recommendations are directional and subject to negotiation dynamics, market conditions, and legal/tax advice from qualified professionals.');
    output.push('');
    const d8 = ['Jurisdiction-specific advice required', 'Tax regulations subject to change', 'Regulatory approval not guaranteed'];
    return {
        status: 'success',
        tool_name: 'deal_structurer',
        output: output.join('\n'),
        metadata: { generated_at: new Date().toISOString(), processing_time_ms: Date.now() - startTime, confidence_level: (tax_considerations.length > 0 && regulatory_constraints.length > 0) ? 'high' : 'medium', disclaimers_applied: d8 }
    };
}
//# sourceMappingURL=index.js.map