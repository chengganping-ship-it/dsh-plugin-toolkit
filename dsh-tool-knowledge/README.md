# dsh-tool-knowledge

**Persistent Knowledge Management Plugin for DeepSeek Harness (DSH)**

Aligned with the planning-with-files paradigm pioneered by Manus -- every planning artifact, memory snapshot, decision record, and learning entry is persisted as structured markdown, enabling session-independent continuity and compounding knowledge intelligence.

## Installation

```bash
npm install
npm run build
```

## Tools

### 1. plan_creator
Creates structured Markdown project plans with task trees, milestone timelines, dependency mapping, and constraint documentation.

**Input:** `project_goal`, `milestones[]`, `constraints[]`

### 2. memory_journal
Append-only session event journal capturing decisions, discoveries, lessons, context snapshots, and milestones.

**Input:** `session_events[]`, `project_id`

### 3. decision_logger
Architecture Decision Record (ADR) generator. Documents context, options with pros/cons, chosen path, and rationale.

**Input:** `decision_context`, `options_considered[]`, `chosen_option`, `rationale`

### 4. learning_accumulator
Deduplicating knowledge base with automatic merging, topic clustering, and relationship detection.

**Input:** `new_learnings[]`, `existing_knowledge[]`

### 5. context_restorer
Reconstructs full working context from checkpoints. Generates restoration prompts and quick reference cards.

**Input:** `session_id`, `checkpoint_id`, `checkpoint_data`

### 6. knowledge_linker
Semantic knowledge graph builder with similarity scoring, link suggestions, and orphan detection.

**Input:** `new_entry`, `existing_entries[]`

### 7. progress_tracker
Plan completion metrics with milestone breakdown, workload estimation, bottleneck identification, and trend analysis.

**Input:** `plan_id`, `current_status`, `tasks[]`

### 8. insight_extractor
Pattern-matching insight extraction from raw notes. Identifies risks, opportunities, trends, and produces prioritized action items.

**Input:** `raw_notes[]`, `patterns_to_find[]`

## Architecture

```
dsh-tool-knowledge/
  package.json
  tsconfig.json
  cordis.yml
  src/
    index.ts    # All 8 tools + interfaces + formatters
  lib/          # Compiled output (after build)
```

## License

MIT
