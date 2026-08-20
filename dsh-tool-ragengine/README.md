# dsh-tool-ragengine

Enterprise RAG Knowledge Engine Plugin for DeepSeek Harness (DSH).

Provides 8 intelligent tools covering the full lifecycle of retrieval-augmented generation: document indexing, semantic search, context injection, knowledge fusion, chunk optimization, retrieval evaluation, embedding advice, and knowledge graph construction.

## Installation

```bash
npm install
npm run build
```

## Tools

| # | Tool | Description |
|---|------|-------------|
| 1 | `document_indexer` | Analyzes documents and produces optimal indexing configuration with chunking strategy |
| 2 | `semantic_searcher` | Performs semantic search with ranked results and context window suggestions |
| 3 | `context_injector` | Injects search results into prompt templates with optimal token allocation |
| 4 | `knowledge_fuser` | Fuses knowledge from multiple sources with conflict detection and resolution |
| 5 | `chunk_optimizer` | Recommends optimal chunking parameters from document samples |
| 6 | `retrieval_evaluator` | Evaluates retrieval performance with precision/recall/F1 metrics |
| 7 | `embedding_advisor` | Recommends optimal embedding model based on data and constraints |
| 8 | `knowledge_graph_builder` | Builds knowledge graphs with entity-relation inference paths |

## Architecture

```
RAG Pipeline Flow:
  document_indexer -> semantic_searcher -> context_injector
                      chunk_optimizer  -> embedding_advisor
                      retrieval_evaluator (feedback loop)
  knowledge_fuser -> knowledge_graph_builder
```

## Configuration

See `cordis.yml` for plugin metadata and tool registration.

## License

MIT
