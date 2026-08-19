# dsh-tool-vibecoder

Vibe Coding design system plugin for DeepSeek Harness (DSH). Provides 8 tools for end-to-end design system generation including design tokens, component specifications, style guides, responsive advice, accessibility auditing, version management, code generation, and design review.

## Installation

```bash
npm install
```

## Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `design_token_generator` | Generate design tokens (colors, typography, spacing, shadows, breakpoints, border radius) from a theme description |
| 2 | `component_spec_creator` | Create component specification documents with variants, props interface, states, and usage examples |
| 3 | `style_guide_builder` | Build complete style guides with color system, type scale, spacing rules, and elevation system |
| 4 | `responsive_breakpoint_advisor` | Get optimal responsive breakpoint configuration and layout strategy for target devices |
| 5 | `accessibility_auditor` | Audit designs for WCAG 2.1 AA/AAA compliance (contrast, font sizes, interactive elements) |
| 6 | `design_system_versioner` | Manage design system versioning with semver bump, changelog, and migration guide |
| 7 | `code_output_generator` | Generate production-ready component code for React, Vue, Svelte, or HTML+CSS |
| 8 | `design_review_checker` | Run structured design reviews against a checklist with pass/fail/warning scoring |

## Usage

Each tool accepts a JSON string parameter. Refer to the input interfaces in `src/index.ts` for exact schema requirements.

## Development

```bash
npx tsc --noEmit    # type check
npx tsc             # compile to lib/
```

## License

MIT
