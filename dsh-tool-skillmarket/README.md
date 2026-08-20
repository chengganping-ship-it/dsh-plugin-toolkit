# dsh-tool-skillmarket

> Golden Skill Marketplace Plugin for DeepSeek Harness — 8 Tools for Agent Skill Economy

SkillMarket is a comprehensive golden-themed skill marketplace plugin that powers the agent skill economy with registration, discovery, transactions, ratings, disputes, bundles, analytics, and certification. Aligned with GitHub TrendingSkills ecosystem (agent-skills/pm-skills/google/skills with 4400+ daily stars).

## Installation

```bash
npm install
npm run build
```

## Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `skill_registry` | Publish & register skills with metadata, categories, pricing, versioning, and dependency declarations |
| 2 | `skill_discovery` | Semantic skill search with intent matching, compatibility checks, and alternative recommendations |
| 3 | `skill_transaction` | Purchase & billing engine supporting one-time, subscription, pay-per-use, free tiers, and refunds |
| 4 | `skill_rating` | Multi-dimensional rating system: quality, documentation, maintenance, compatibility with intelligent weighted stars |
| 5 | `skill_dispute` | Automated dispute arbitration for quality mismatch, infringement, and unmet specifications |
| 6 | `skill_bundle` | Skill bundling sales with workflow packages, complementary skill recommendations, and bundle discounts |
| 7 | `skill_analytics` | Market trend analytics: search heat, conversion funnel, category growth curves |
| 8 | `skill_certification` | Skill certification with security audits, official badges, and performance benchmarking |

## Golden Theme Features

- **Leaderboard System**: Top skills by sales, rating, and trending score
- **Transaction Dashboard**: Real-time revenue, volume, and conversion visualization
- **Market Pulse**: Category growth rates, emerging skill alerts, demand signals

## Usage

Install via DeepSeek Harness:

```bash
dsh plugin install dsh-tool-skillmarket
```

Or add to your `cordis.yml`:

```yaml
plugins:
  - dsh-tool-skillmarket
```

## Architecture

```
dsh-tool-skillmarket/
├── package.json        # NPM package config (MIT license)
├── tsconfig.json       # TypeScript ES2022 strict config
├── cordis.yml          # DSH plugin manifest
├── README.md           # This file
├── src/
│   └── index.ts        # Plugin source — 8 tools, all interfaces, utility functions
└── lib/                # Compiled output (after npm run build)
```

## Technical Highlights

- **Seeded random** generation for deterministic output across all tools
- **Complete TypeScript interfaces** for all inputs and outputs
- **Gold market theme** with ASCII charts, leaderboards, and data visualization panels
- **Multi-dimensional scoring** with weighted algorithms (Wilson score, Bayesian average)
- **Automated dispute resolution** with evidence-based adjudication
- **Bundle optimization** with complementary skill graph analysis
- **Conversion funnel analytics** with cohort-based analysis

## Author

chengganping-ship-it

## License

MIT
