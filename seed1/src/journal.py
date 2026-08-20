"""JSONL decision journal for Seed-1 entity."""

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

JOURNAL_PATH = Path(__file__).resolve().parent.parent / "journal.jsonl"


def record(
    cycle: int,
    phase: str,
    decision: str,
    rationale: str,
    **extra: Any,
) -> dict:
    """Append a journal entry. Returns the entry."""
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "cycle": cycle,
        "phase": phase,
        "decision": decision,
        "rationale": rationale,
        **extra,
    }
    with open(JOURNAL_PATH, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return entry


def read_all() -> list[dict]:
    """Read all journal entries."""
    if not JOURNAL_PATH.exists():
        return []
    entries = []
    with open(JOURNAL_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return entries
