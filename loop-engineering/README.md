# DSH Loop Engineering Self-Verification Layer

> 2026 Loop Engineering: Build self-correcting agentic loops. Execute, verify, retry with feedback, escalate.

## Overview

The Loop Engineering Self-Verification Layer wraps DSH tools with a retry/verification loop, output validation, and self-critique scoring. Instead of trusting a single tool call, agents can now:

1. **Execute** a tool
2. **Verify** output against a suite of validators
3. **Retry** with feedback if validation fails
4. **Escalate** with best-effort results and warnings if max retries are exceeded

This is the foundational layer for building reliable, self-correcting agentic systems on the DSH platform.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Agent / MCP Bridge                 │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │          executeWithLoop()                     │  │
│  │                                               │  │
│  │  ┌─────────┐    ┌──────────────┐              │  │
│  │  │ Execute  │───>│  Validators   │             │  │
│  │  │ Tool     │    │  - markdown   │             │  │
│  │  └────┬─────┘    │  - JSON       │             │  │
│  │       │          │  - length     │             │  │
│  │       │          │  - keywords   │             │  │
│  │       │          │  - disclaimer │             │  │
│  │       │          │  - no-halluc  │             │  │
│  │       │          └──────┬───────┘             │  │
│  │       │                 │                     │  │
│  │       │           Pass? │                     │  │
│  │       │            /    │                     │  │
│  │       │           Yes   No                    │  │
│  │       │           │     │                     │  │
│  │       │           │  Retries                  │  │
│  │       │           │  remain?                  │  │
│  │       │           │  /    \                   │  │
│  │       │           │ Yes   No                  │  │
│  │       │           │  │     │                  │  │
│  │       │           │  │   Return               │  │
│  │       │           │  │   best-effort          │  │
│  │       │           │  │   + warnings           │  │
│  │       │           │  │                        │  │
│  │  ┌────▼─────┐     │  │                        │  │
│  │  │Self-     │     │  │                        │  │
│  │  │Critique  │<────┘  │                        │  │
│  │  │(score)   │        │                        │  │
│  │  └──────────┘        │                        │  │
│  └──────────────────────┘                        │  │
│                                                    │  │
└─────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────┐
│   LoopResult     │
│  - success       │
│  - output        │
│  - attempts[]    │
│  - finalScore    │
│  - warnings[]    │
└──────────────────┘
```

## Quick Start

```bash
npm install
npm run demo     # Run the carbon trading demo
npm run build    # Compile TypeScript
npm run typecheck # tsc --noEmit
```

## Installation

```bash
npm install dsh-loop-engineering
```

## Usage

### Basic Usage

```typescript
import {
  executeWithLoop,
  markdownStructureValidator,
  disclaimerValidator,
} from 'dsh-loop-engineering'

const result = await executeWithLoop(
  'carbon_price_predictor',
  async (input) => myTool.execute(input),
  '{"market":"CN-ETS","historical_prices":[50,55,60]}',
  {
    maxRetries: 3,
    backoffMs: 1000,
    validators: [
      markdownStructureValidator({ minHeaders: 2 }),
      disclaimerValidator(),
    ],
    selfCritique: true,
  }
)

console.log(`Success: ${result.success}`)
console.log(`Score: ${result.finalScore}/100`)
console.log(`Attempts: ${result.attempts.length}`)
console.log(result.output)
```

### With Retry Callback

```typescript
const result = await executeWithLoop(
  'my_tool',
  executeFn,
  input,
  {
    maxRetries: 5,
    backoffMs: 500,
    validators: [lengthValidator({ minChars: 50 })],
    selfCritique: true,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}: ${error}`)
    },
  }
)
```

### Checking Attempts

```typescript
for (const attempt of result.attempts) {
  console.log(`Attempt ${attempt.attempt}:`)
  console.log(`  Duration: ${attempt.durationMs}ms`)
  console.log(`  Errors: ${attempt.validationErrors.join(', ')}`)
  console.log(`  Critique: ${attempt.critiqueScore}/100`)
}
```

## Configuration

### `LoopConfig`

| Property       | Type       | Default | Description                                          |
| -------------- | ---------- | ------- | ---------------------------------------------------- |
| `maxRetries`   | `number`   | 3       | Maximum number of attempts before returning          |
| `backoffMs`    | `number`   | 1000    | Base backoff in ms (grows linearly with attempt)     |
| `validators`   | `Validator[]` | []   | List of validation functions to run on each output   |
| `onRetry`      | `(attempt, error) => void` | — | Callback fired on each retry               |
| `selfCritique` | `boolean`  | false   | Enable heuristic self-critique scoring               |

## Built-in Validators

### `jsonValidator(options?)`
Validates output is valid JSON. Optionally requires specific top-level keys.

```typescript
jsonValidator({ requireObject: true, requiredKeys: ['price', 'trend'] })
```

### `markdownStructureValidator(options?)`
Validates markdown structure: minimum header count, optional table requirement.

```typescript
markdownStructureValidator({ minHeaders: 2, requireTable: true })
```

### `noHallucinationMarkers()`
Detects AI hallucination patterns: embedded AI disclaimers, placeholder text, excessive absolutes.

```typescript
noHallucinationMarkers()
```

### `lengthValidator(options?)`
Validates output length in characters and/or words.

```typescript
lengthValidator({ minChars: 100, maxChars: 10000, minWords: 20 })
```

### `keywordPresenceValidator(options?)`
Validates keyword presence: require all, any of, or forbid specific keywords.

```typescript
keywordPresenceValidator({
  required: ['预测', '价格'],
  anyOf: ['CN-ETS', 'EU-ETS'],
  forbidden: ['guaranteed'],
})
```

### `disclaimerValidator()`
Validates that output contains a disclaimer marker (for financial/medical/legal tools).

```typescript
disclaimerValidator()
```

## Self-Critique Module

The self-critique module performs heuristic analysis without requiring LLM calls:

```typescript
import { analyzeCritique } from 'dsh-loop-engineering'

const critique = analyzeCritique(output)
console.log(critique.score)         // 0-100
console.log(critique.dimensions)    // { completeness, consistency, actionability }
console.log(critique.suggestions)   // Improvement suggestions
```

### Critique Dimensions

| Dimension       | Weight | What it measures                                |
| --------------- | ------ | ------------------------------------------------ |
| Completeness    | 35%    | Structured formatting, quantitative data, depth  |
| Consistency     | 30%    | Internal contradictions, formatting hierarchy    |
| Actionability   | 35%    | Recommendations, specific targets, next steps    |

## Integration with MCP Bridge

The Loop Engineering layer integrates with the DSH MCP Bridge to provide verified tool execution:

```typescript
import { executeWithLoop, disclaimerValidator, noHallucinationMarkers } from 'dsh-loop-engineering'

// Wrap any MCP Bridge tool with verification
async function verifiedToolCall(toolName: string, input: string) {
  return executeWithLoop(
    toolName,
    async (inp) => mcpBridge.callTool(toolName, inp),
    input,
    {
      maxRetries: 3,
      validators: [noHallucinationMarkers(), disclaimerValidator()],
      selfCritique: true,
    }
  )
}
```

## LoopResult Reference

```typescript
interface LoopResult {
  success: boolean           // True if any attempt passed all validators
  output: string             // Best output found
  attempts: AttemptRecord[]  // Full history of all attempts
  totalDurationMs: number    // Total wall-clock time
  finalScore: number         // Quality score 0-100
  warnings: string[]         // Warnings (e.g., max retries exceeded)
}

interface AttemptRecord {
  attempt: number            // 1-based attempt number
  output: string             // Raw output
  durationMs: number         // Execution time
  validationErrors: string[] // Validation error messages
  critiqueScore?: number     // Self-critique score (if enabled)
}
```

## File Structure

```
loop-engineering/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Main exports
│   ├── loop-executor.ts   # Core retry/verification loop
│   ├── validators.ts      # Built-in output validators
│   ├── self-critique.ts   # Heuristic self-critique engine
│   └── types.ts           # Shared TypeScript types
├── examples/
│   └── carbon-loop-demo.ts  # Carbon trading demo
└── README.md
```

## License

MIT
