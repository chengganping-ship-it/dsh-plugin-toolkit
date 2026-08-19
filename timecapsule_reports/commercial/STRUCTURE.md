# GitHub Repository Structure — AI Era Time Capsule Intelligence

```
ai-era-timecapsule/
├── README.md (EN homepage)
├── README_CN.md (// 中文首页)
├── LICENSE (CC BY-SA 4.0)
├── CONTRIBUTING.md
├── ./
│   ├── data-provenance-tier-spec.md
│   └── replication-scripts/
│       ├── verify_inference.sh
│       ├── verify_transformer.sh
│       └── verify_deminimis.sh
│
├── snapshots/
│   ├── 2025-08-08-crisis-three/
│   │   ├── en/
│   │   │   ├── 01-inference-cost-collapse.md
│   │   │   ├── 02-transformer-crisis.md
│   │   │   └── 03-demise-of-de-minimis.md
│   │   ├── zh/
│   │   │   ├── 01-推理成本崩塌.md
│   │   │   ├── 02-变压器危机.md
│   │   │   └── 03-De-Minis终结.md
│   │   ├── sources.yaml (structured data points)
│   │   └── changelog.md (future revisions log)
│   │
│   └── 2025-Q4-next-snapshot/ (placeholder for future release)
│
├── failure-registry/
│   └── cross-snapshot-failures.md
│
├── commercial/
│   └── offer.md
│
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── data_stale_warning.md
    │   └── replication_failure.md
    └── workflows/
        └── verify-sources.yml (optional CI)
```

Naming convention:
- All reports ISO 8601 dated (`YYYY-MM-DD-`)
- Bilingual: mirror `/en/` and `/zh/` structure
- One `sources.yaml` per snapshot, machine-parseable
- Separate `./commercial/` for monetization offers (don't pollute research corpus)
