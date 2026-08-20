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
interface FinancialStatement {
    period: string;
    revenue: number;
    gross_profit: number;
    operating_income: number;
    net_income: number;
    total_assets: number;
    total_liabilities: number;
    shareholders_equity: number;
    cash_and_equivalents: number;
    operating_cash_flow: number;
    capex: number;
    depreciation_amortization: number;
    interest_expense: number;
    tax_expense: number;
    ebitda: number;
    total_debt: number;
    inventory: number;
    accounts_receivable: number;
    accounts_payable: number;
}
interface TargetCompany {
    name: string;
    industry: string;
    sector: string;
    country: string;
    incorporation_jurisdiction: string;
    year_founded: number;
    employees: number;
    headquarters: string;
    subsidiaries: string[];
    key_executives: Array<{
        name: string;
        title: string;
        tenure_years: number;
    }>;
    ownership_structure: Array<{
        type: string;
        percentage: number;
        holder: string;
    }>;
    business_description: string;
    revenue_streams: Array<{
        name: string;
        percentage: number;
    }>;
    key_products: string[];
    primary_markets: string[];
    major_customers: Array<{
        name: string;
        revenue_percentage: number;
    }>;
    major_suppliers: Array<{
        name: string;
        dependency_level: string;
    }>;
}
interface TransactionRecord {
    id: string;
    date: string;
    amount: number;
    currency: string;
    counterparty: string;
    description: string;
    category: string;
    approval_authority: string;
    supporting_documents: string[];
    related_party: boolean;
    notes: string;
}
interface RiskIndicator {
    category: string;
    indicator: string;
    severity: string;
    frequency: string;
    data_source: string;
}
interface IndustryBenchmark {
    metric: string;
    industry_avg: number;
    industry_median: number;
    top_quartile: number;
    bottom_quartile: number;
    unit: string;
}
interface MacroFactor {
    factor: string;
    current_value: number;
    trend: string;
    impact_level: string;
    outlook_12m: string;
}
interface CompanyRecord {
    document_type: string;
    period: string;
    content: string;
    verified: boolean;
    verification_source?: string;
    gaps: string[];
}
interface ComparableTransaction {
    target: string;
    acquirer: string;
    date: string;
    deal_value: number;
    ev_revenue: number;
    ev_ebitda: number;
    description: string;
}
interface CashFlowStatement {
    period: string;
    operating_activities: {
        net_income: number;
        depreciation: number;
        amortization: number;
        working_capital_change: number;
        other_non_cash: number;
        total: number;
    };
    investing_activities: {
        capex: number;
        acquisitions: number;
        asset_sales: number;
        investments: number;
        total: number;
    };
    financing_activities: {
        debt_proceeds: number;
        debt_repayments: number;
        equity_issuance: number;
        dividends: number;
        share_repurchases: number;
        total: number;
    };
    net_change_cash: number;
    beginning_cash: number;
    ending_cash: number;
    free_cash_flow: number;
}
interface Projection {
    period: string;
    revenue: number;
    revenue_growth: number;
    ebitda_margin: number;
    capex: number;
    working_capital_change: number;
    free_cash_flow: number;
    probability: number;
}
interface DueDiligenceData {
    category: string;
    source: string;
    finding: string;
    materiality: string;
    verified: boolean;
    recommendation: string;
}
interface DealParameters {
    target_enterprise_value: number;
    target_equity_value: number;
    acquirer_currency: string;
    target_currency: string;
    fx_rate: number;
    synergies_estimate: number;
    integration_costs: number;
    timeline_months: number;
    deal_rationale: string;
    strategic_fit: string;
    control_premium_percentage: number;
}
interface TaxConsideration {
    jurisdiction: string;
    corporate_tax_rate: number;
    capital_gains_rate: number;
    withholding_tax_rate: number;
    tax_losses_available: number;
    tax_attributes_transferable: boolean;
    transfer_pricing_risk: string;
    tax_covenants_needed: string[];
}
interface RegulatoryConstraint {
    jurisdiction: string;
    regulator: string;
    approval_required: boolean;
    timeline_estimate_days: number;
    key_requirements: string[];
    historical_approval_rate: number;
    antitrust_concern: string;
}
interface ToolResult {
    status: string;
    tool_name: string;
    output: string;
    metadata: {
        generated_at: string;
        processing_time_ms: number;
        confidence_level: string;
        disclaimers_applied: string[];
    };
}
declare function deal_analyst(target_company: TargetCompany, deal_type: string, financial_statements: FinancialStatement[]): ToolResult;
declare function financial_risk_scorer(financial_data: FinancialStatement[], industry_benchmarks: IndustryBenchmark[], macro_factors: MacroFactor[]): ToolResult;
declare function compliance_auditor(company_records: CompanyRecord[], regulatory_scope: string[]): ToolResult;
declare function valuation_modeler(company_financials: FinancialStatement[], comparable_transactions: ComparableTransaction[], methodology: string): ToolResult;
declare function forensic_accountant(transaction_data: TransactionRecord[], investigation_scope: string[]): ToolResult;
declare function cash_flow_analyzer(cash_flow_statements: CashFlowStatement[], projections: Projection[]): ToolResult;
declare function red_flag_detector(due_diligence_data: DueDiligenceData[], risk_indicators: RiskIndicator[]): ToolResult;
declare function deal_structurer(deal_parameters: DealParameters, tax_considerations: TaxConsideration[], regulatory_constraints: RegulatoryConstraint[]): ToolResult;
export { deal_analyst, financial_risk_scorer, compliance_auditor, valuation_modeler, forensic_accountant, cash_flow_analyzer, red_flag_detector, deal_structurer };
//# sourceMappingURL=index.d.ts.map