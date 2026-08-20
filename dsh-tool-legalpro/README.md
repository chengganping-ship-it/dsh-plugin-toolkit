# dsh-tool-legalpro — Legal AI Pro

DeepSeek Harness plugin providing full-spectrum legal intelligence automation. Aligned with the YC W26 autonomous AI law firm trend.

## Installation

```bash
npm install
npm run build
```

## Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `legal_researcher` | Search case law and statutes by jurisdiction and practice area |
| 2 | `case_analyzer` | Assess win probability and evidence strength for litigation |
| 3 | `document_generator` | Draft NDAs, service agreements, MOUs, cease & desist letters |
| 4 | `compliance_reviewer` | Audit operations against regulatory frameworks (GDPR, CCPA, etc.) |
| 5 | `litigation_predictor` | Forecast outcomes with cost estimates and comparable verdicts |
| 6 | `ip_analyst` | Evaluate patentability, trademark clearance, copyright eligibility |
| 7 | `regulatory_tracker` | Monitor multi-jurisdiction regulatory changes and deadlines |
| 8 | `legal_strategist` | Develop dispute strategies with cost-benefit analysis |

## Usage

```typescript
import { apply } from 'dsh-tool-legalpro'
// Register via DeepSeek Harness plugin system
apply(context)
```

## Disclaimer

⚠️ **本分析不可替代专业法律建议。** This tool provides AI-generated analysis for informational purposes only. All outputs must be reviewed by a licensed attorney before use. Legal decisions should not be made solely on the basis of this tool's output.

## License

MIT
