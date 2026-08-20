# dsh-tool-contractmaster

Contract lifecycle management plugin for DeepSeek Harness (DSH). Provides end-to-end contract management: drafting, clause analysis, obligation tracking, renewal management, risk assessment, compliance checking, amendment analysis, and contract summarization.

## Features

| Tool | Description |
|------|-------------|
| `contract_drafter` | Generate contract drafts with structured sections, party clauses, and jurisdiction-aware language |
| `clause_analyzer` | Extract, categorize, and annotate clauses with risk flags and modification suggestions |
| `obligation_tracker` | Track contractual obligations across counterparties with deadline monitoring and compliance scoring |
| `renewal_manager` | Manage renewal schedules, priority actions, negotiation points, and cost projections |
| `risk_assessor` | Multi-category risk scoring (liability, financial, operational, legal, market) with mitigation recommendations |
| `compliance_checker` | Verify contract clauses against regulatory requirements with gap analysis and revision guidance |
| `amendment_analyzer` | Analyze proposed amendments for impact, conflicts, and provide acceptance recommendations |
| `contract_summarizer` | Generate structured summaries with focus areas: financial, obligations, risks, key dates, termination |

## Installation

```bash
npm install
npm run build
```

## Usage

Register the plugin with DSH via cordis.yml configuration. Each tool accepts a JSON input string and returns a formatted markdown report with emoji indicators.

### Example: Contract Drafting

```json
{
  "contract_type": "service_agreement",
  "parties": [
    { "name": "Acme Corp", "role": "client", "jurisdiction": "Delaware" },
    { "name": "Widget LLC", "role": "provider", "jurisdiction": "California" }
  ],
  "key_terms": [
    { "field": "payment", "value": "$50,000 annually", "notes" : "Quarterly installments" },
    { "field": "term", "value": "24 months" }
  ],
  "jurisdiction": "Delaware",
  "effective_date": "2026-01-01",
  "duration_months": 24
}
```

### Example: Risk Assessment

```json
{
  "contract_terms": ["Unlimited liability", "30 day payment terms", "Arbitration in Delaware"],
  "industry": "technology",
  "financial_exposure": 500000,
  "counterparty_risk": "medium",
  "market_volatility": "medium"
}
```

## Architecture

- **Strict TypeScript** with complete interface definitions for all inputs/outputs
- **Seeded random** for deterministic risk scoring and projections
- **In-memory stores** for draft and obligation tracking
- **Semantic analysis** for clause extraction and compliance matching
- **Markdown + emoji** formatted output for each tool

## Dependencies

- `@deepseek-ai/cordis` ^4.0.1
- `@deepseek-ai/dsh-tools` ^0.0.1-rc.1
- `typescript` ^5.0.0 (dev)

## License

MIT License - see package.json for details.

## Author

chengganping-ship-it
