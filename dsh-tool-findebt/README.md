# dsh-tool-findebt

Financial Due Diligence Plugin for DeepSeek Harness (DSH)

Provides 8 specialized tools for M&A financial due diligence, including deal analysis, risk scoring, compliance audit, valuation modeling, forensic accounting, cash flow analysis, red flag detection, and deal structure design.

## Installation

```bash
npm install
npm run build
```

## Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `deal_analyst` | Transaction analysis and risk summarization |
| 2 | `financial_risk_scorer` | Multi-dimensional risk scoring with early warnings |
| 3 | `compliance_auditor` | Regulatory compliance audit and deficiency reporting |
| 4 | `valuation_modeler` | DCF, comparables, and precedent transaction valuation |
| 5 | `forensic_accountant` | Fraud detection and anomaly analysis |
| 6 | `cash_flow_analyzer` | Cash flow quality and sustainability assessment |
| 7 | `red_flag_detector` | Red flag identification and investigation planning |
| 8 | `deal_structurer` | Optimal deal structure design and term sheet recommendations |

## Usage

```typescript
import {
  deal_analyst,
  financial_risk_scorer,
  compliance_auditor,
  valuation_modeler,
  forensic_accountant,
  cash_flow_analyzer,
  red_flag_detector,
  deal_structurer
} from 'dsh-tool-findebt';

// Example: Deal Analysis
const result = deal_analyst(
  targetCompany,
  'acquisition',
  financialStatements
);
console.log(result.output);
```

## Architecture

- **Seeded Random**: All stochastic outputs use a seeded PRNG for reproducible results
- **Strict TypeScript**: Full type safety with comprehensive interfaces
- **Markdown Output**: Rich formatted reports with emoji indicators and tables
- **ToolResult Pattern**: Consistent return type with metadata and disclaimers

## License

MIT
