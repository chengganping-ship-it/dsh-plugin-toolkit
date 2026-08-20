# dsh-tool-clmengine

Contract Lifecycle Management (CLM) Engine for DeepSeek Harness (DSH). Provides end-to-end AI-powered contract management: drafting, negotiation, obligation tracking, renewal management, analysis, AI clause negotiation, signature orchestration, and compliance verification.

**Navy blue contract theme throughout.**

## TermScout 2026 + Icertis CLM Benchmarked

Built against industry signals:

- **38% of NDAs** now include AI-specific clauses (TermScout 2026 Contract Signals Report)
- **AI disclosure obligations** growing **+240%** YoY
- **Icertis CLM** enterprise-grade capabilities as functional benchmark

## Features (8 Tools)

| Tool | Description | Key Capabilities |
|------|-------------|------------------|
| `contract_author` | AI-Powered Contract Drafting | Template library (7+ types), clause recommendation, variable auto-fill, multi-language, format standardization, brand consistency |
| `negotiation_assistant` | Negotiation Companion | Historical concession analysis, clause risk assessment, red-line marking, strategy recommendation (4 strategies), multi-round simulation, negotiation scorecard |
| `obligation_tracker` | Obligation Fulfillment Tracking | Key date reminders, fulfillment status monitoring, consequence prediction, auto-reminders, fulfillment score, compliance archive, Gantt chart visualization |
| `renewal_manager` | Renewal Management | Expiry alerts, condition change detection, market benchmarking, renewal strategy (3 modes), price renegotiation advice, alternative evaluation |
| `contract_analyzer` | Contract Analysis & Insights | Full-text search, clause comparison, anomaly detection, aggregated portfolio view, risk map visualization, value leakage identification |
| `ai_clause_negotiator` | AI Clause Specialist | Data processing clauses, AI usage restrictions, IP ownership, liability caps, insurance requirements, regulatory compliance mapping |
| `signature_orchestrator` | Signature Workflow Management | Multi-signer routing, eSignature integration, conditional signing, notarization scheduling, EU eIDAS + US ESIGN/UETA global compliance |
| `compliance_verifier` | Compliance Verification Engine | Internal policy comparison, regulatory mapping, third-party risk assessment, anti-corruption clauses, FCPA/UKBA compliance, sanctions screening |

## Installation

```bash
cd dsh-tool-clmengine
npm install
npm run build
```

## Usage

Register the plugin with DSH via `cordis.yml` configuration. Each tool accepts a JSON input string and returns a formatted markdown report with navy blue ANSI theme and emoji indicators.

### Example: Contract Drafting

```json
{
  "contract_type": "nda_mutual",
  "parties": [
    { "name": "Acme Corp", "role": "disclosing_party", "jurisdiction": "Delaware" },
    { "name": "Widget LLC", "role": "receiving_party", "jurisdiction": "California" }
  ],
  "variables": [
    { "key": "term", "value": "3 years", "category": "term" },
    { "key": "purpose", "value": "Evaluation of potential business collaboration" }
  ],
  "jurisdiction": "Delaware",
  "effective_date": "2026-01-01",
  "language": "en",
  "brand_profile": {
    "company_name": "Acme Corporation",
    "formatting_style": "formal"
  }
}
```

### Example: Obligation Tracking with Gantt

```json
{
  "obligations": [
    { "obligation_id": "OBJ-001", "description": "Quarterly SLA review", "responsible_party": "Vendor", "deadline": "2026-03-31", "status": "in_progress", "priority": "high", "completion_percentage": 60 },
    { "obligation_id": "OBJ-002", "description": "Annual data protection impact assessment", "responsible_party": "DPO Office", "deadline": "2026-06-15", "status": "pending", "priority": "critical" }
  ],
  "gantt_view": true,
  "alert_days_before": 30
}
```

### Example: AI Clause Negotiation

```json
{
  "negotiation_area": "data_processing",
  "ai_system_description": "Customer-facing chatbot using LLMs for support automation",
  "use_case": "Automated customer service responses",
  "jurisdiction": "EU",
  "counterparty_type": "SaaS vendor",
  "risk_tolerance": "medium"
}
```

### Example: Signature Orchestration

```json
{
  "signatories": [
    { "party_id": "P1", "party_name": "Acme Corp", "role": "Licensor", "email": "legal@acme.com", "signing_order": 1, "authentication_method": "email_otp", "country": "DE" },
    { "party_id": "P2", "party_name": "Widget LLC", "role": "Licensee", "email": "cto@widget.com", "signing_order": 2, "authentication_method": "id_document", "country": "US" }
  ],
  "document_reference": "DOC-MSA-2026-001",
  "signature_type": "advanced",
  "notarization_required": false
}
```

## Architecture

- **TypeScript strict mode** with complete interface definitions for all inputs/outputs
- **Seeded random** for deterministic risk scoring and projections
- **Template library** with 7+ contract types and expandable clause templates
- **Navy blue ANSI theme** (`\u001b[38;5;27m`) consistent across all tools
- **Markdown + emoji** formatted output for each tool
- **State machine flow**: Contract lifecycle states (draft -> negotiate -> execute -> track -> renew -> archive)
- **Gantt chart visualization** for obligation timelines
- **In-memory stores** with structured data interfaces

## Tool Input/Output Schema

| Tool | Input Key | Output Type |
|------|-----------|-------------|
| `contract_author` | `author_input` (JSON string) | Markdown formatted draft |
| `negotiation_assistant` | `negotiation_input` (JSON string) | Markdown scorecard + simulation |
| `obligation_tracker` | `obligation_input` (JSON string) | Markdown + Gantt chart |
| `renewal_manager` | `renewal_input` (JSON string) | Markdown renewal report |
| `contract_analyzer` | `analyzer_input` (JSON string) | Markdown analysis report |
| `ai_clause_negotiator` | `ai_clause_input` (JSON string) | Markdown clause guidance |
| `signature_orchestrator` | `signature_input` (JSON string) | Markdown signing instructions |
| `compliance_verifier` | `compliance_input` (JSON string) | Markdown compliance report |

## Dependencies

- `@deepseek-ai/cordis` ^4.0.1
- `@deepseek-ai/dsh-tools` ^0.0.1-rc.1
- `typescript` ^5.0.0 (dev)

## License

MIT License - see package.json for details.

## Author

chengganping-ship-it
