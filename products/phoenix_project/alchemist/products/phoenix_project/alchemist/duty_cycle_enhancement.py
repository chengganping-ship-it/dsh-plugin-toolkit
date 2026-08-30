import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


class HardNegativeGate:
    """Hard negative regression gate for duty cycle verification."""

    def __init__(self, regression_path: str = "hard_negative_regression.json"):
        self.regression_path = regression_path
        self.pairs = self._load_pairs()

    def _load_pairs(self) -> List[Dict]:
        path = Path(self.regression_path)
        if not path.exists():
            return []
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("pairs", [])

    def check(self, draft_code: str) -> Tuple[bool, Optional[str]]:
        if not draft_code or not draft_code.strip():
            return False, "empty code"
        for pair in self.pairs:
            trap = pair.get("trap", "")
            pair_id = pair.get("pair_id", "unknown")
            if trap and self._match_trap(draft_code.lower(), trap.lower()):
                return False, f"Matched {pair_id}"
        return True, None

    def _match_trap(self, code: str, trap: str) -> bool:
        trap_tokens = [t for t in trap.split() if len(t) > 4]
        if not trap_tokens:
            return False
        matches = sum(1 for t in trap_tokens if t in code)
        return matches > len(trap_tokens) * 0.6

    def get_stats(self) -> Dict[str, Any]:
        types = {}
        for p in self.pairs:
            t = p.get("type", "unknown")
            types[t] = types.get(t, 0) + 1
        return {"total_pairs": len(self.pairs), "types": types}
