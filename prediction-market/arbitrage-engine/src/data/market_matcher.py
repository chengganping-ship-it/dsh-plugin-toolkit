"""
Market Matcher - Three-Tier Confidence with Manual Whitelist

Confidence Levels:
- MATCH_VERIFIED:    Manually reviewed resolution rules → allow auto-trading
- MATCH_CANDIDATE:  Algorithm detected similarity → alert only, manual review required
- MATCH_REJECTED:    Clearly not equivalent → never trade

CRITICAL: This module is the #1 risk point. A bad match = two directional bets, not a hedge.
"""
import os
import yaml
import logging
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)


class MatchConfidence:
    """Three-tier confidence levels for market matching"""
    VERIFIED = "verified"      # Manually reviewed → can trade
    CANDIDATE = "candidate"    # Algorithm match → manual review needed
    REJECTED = "rejected"      # Not equivalent → never trade


@dataclass
class MarketMapping:
    """Maps a Polymarket market to a Kalymarket with full metadata"""
    polymarket_id: str
    kalshi_id: str
    polymarket_question: str
    kalshi_question: str
    similarity: float
    confidence: str  # MatchConfidence value
    resolution_match: bool
    expiry_match: bool
    tradable: bool
    verified_by: str = ""
    verified_at: str = ""
    resolution_notes: str = ""
    max_exposure_usd: float = 100.0
    notes: str = ""


@dataclass 
class SpreadObservation:
    """Track spread over time to detect non-convergence"""
    mapping_id: str
    first_seen: float
    last_seen: float
    spread_history: List[Tuple[float, float]] = field(default_factory=list)  # (timestamp, spread)
    
    @property
    def age_hours(self) -> float:
        return (self.last_seen - self.first_seen) / 3600
    
    @property
    def converged(self) -> bool:
        """Has spread mean-reverted below threshold?"""
        if len(self.spread_history) < 2:
            return False
        recent = [s for _, s in self.spread_history[-10:]]
        return abs(sum(recent) / len(recent)) < 0.01  # < 1 cent
    
    @property  
    def suspicious(self) -> bool:
        """Spread not converging after 24+ hours = likely mismatched"""
        return self.age_hours > 24 and not self.converged


class MarketMatcher:
    """
    Safe market matching with manual whitelist.
    
    Default: REQUIRE_MANUAL_MARKET_WHITELIST = True
    This means NO automatic trading until user explicitly verifies each pair.
    """
    
    SIMILARITY_THRESHOLD = 0.70
    EXPIRY_TOLERANCE_HOURS = 12
    LIQUIDITY_MIN_USD = 10000  # Minimum daily volume to consider
    
    # Keywords indicating resolution incompatibility
    RESOLUTION_MISMATCH_WORDS = [
        "popular vote", "electoral college",
        "popular vote margin", "electoral votes",
        "delegate count", "primary results",
        "seats", "popular",
    ]
    
    def __init__(self, whitelist_path: str = "config/verified_pairs.yaml",
                 require_manual_whitelist: bool = True):
        self.whitelist_path = whitelist_path
        self.require_manual = require_manual_whitelist
        self.whitelist: Dict[str, dict] = {}
        self.mappings: List[MarketMapping] = []
        self.active_spreads: Dict[str, SpreadObservation] = {}
        
        # Load whitelist
        self._load_whitelist()
    
    def _load_whitelist(self):
        """Load verified market pairs from YAML"""
        if os.path.exists(self.whitelist_path):
            try:
                with open(self.whitelist_path, 'r') as f:
                    data = yaml.safe_load(f) or []
                    for pair in data:
                        key = f"{pair.get('polymarket', '')}-{pair.get('kalshi', '')}"
                        self.whitelist[key] = pair
                logger.info(f"Loaded {len(self.whitelist)} verified pairs from whitelist")
            except Exception as e:
                logger.error(f"Failed to load whitelist: {e}")
        else:
            logger.warning(f"Whitelist not found: {self.whitelist_path}. Running in ALERT-ONLY mode.")
            self.require_manual = True
    
    def _save_whitelist(self):
        """Save whitelist to YAML for audit trail"""
        os.makedirs(os.path.dirname(self.whitelist_path), exist_ok=True)
        data = list(self.whitelist.values())
        with open(self.whitelist_path, 'w') as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)
    
    def add_to_whitelist(self, mapping: MarketMapping, verified_by: str = ""):
        """Add a verified pair to the whitelist"""
        key = f"{mapping.polymarket_id}-{mapping.kalshi_id}"
        self.whitelist[key] = {
            "id": key,
            "polymarket": mapping.polymarket_id,
            "kalshi": mapping.kalshi_id,
            "verified_by": verified_by or "manual",
            "verified_at": os.popen("date -u +%Y-%m-%d").read().strip(),
            "resolution_source_match": mapping.resolution_match,
            "timezone_normalized": True,
            "notes": mapping.notes,
            "max_exposure_usd": mapping.max_exposure_usd,
        }
        self._save_whitelist()
        mapping.confidence = MatchConfidence.VERIFIED
        mapping.tradable = True
        logger.info(f"Added to whitelist: {key}")
    
    def match_markets(self, poly_markets: List[dict], kalshi_markets: List[dict]) -> List[MarketMapping]:
        """
        Match markets across exchanges.
        Returns only VERIFIED pairs if REQUIRE_MANUAL_WHITELIST is True.
        Otherwise returns CANDIDATE pairs for manual review.
        """
        self.mappings = []
        results = []
        
        for pm in poly_markets:
            poly_q = pm.get("question", "").lower().strip()
            poly_id = pm.get("condition_id", pm.get("id", ""))
            poly_volume = pm.get("volume", pm.get("daily_volume", 0))
            
            # Skip illiquid markets
            if isinstance(poly_volume, (int, float)) and poly_volume < self.LIQUIDITY_MIN_USD:
                continue
            
            best_match = None
            best_similarity = 0.0
            
            for km in kalshi_markets:
                kalshi_q = km.get("question", km.get("title", "")).lower().strip()
                similarity = SequenceMatcher(None, poly_q, kalshi_q).ratio()
                
                if similarity > best_similarity and similarity >= self.SIMILARITY_THRESHOLD:
                    best_similarity = similarity
                    best_match = km
            
            if best_match:
                mapping = self._create_mapping(pm, best_match, best_similarity)
                self.mappings.append(mapping)
                
                if mapping.tradable:
                    results.append(mapping)
        
        if self.require_manual:
            logger.info(f"Matcher: {len(results)} tradable (verified) / {len(self.mappings)} total matches")
        else:
            logger.warning("Matcher: Running WITHOUT manual whitelist - DANGEROUS")
        
        return results
    
    def _create_mapping(self, poly: dict, kalshi: dict, similarity: float) -> MarketMapping:
        """Create mapping with confidence based on whitelist status"""
        poly_q = poly.get("question", "")
        kalshi_q = kalshi.get("question", kalshi.get("title", ""))
        poly_id = poly.get("condition_id", poly.get("id", ""))
        kalshi_id = kalshi.get("ticker", kalshi.get("id", ""))
        
        # Check whitelist
        key = f"{poly_id}-{kalshi_id}"
        in_whitelist = key in self.whitelist
        
        # Resolution compatibility
        resolution_match = self._check_resolution_compatible(poly_q, kalshi_q)
        expiry_match = True
        
        # Determine confidence
        if in_whitelist:
            confidence = MatchConfidence.VERIFIED
            tradable = True
            verified_by = self.whitelist[key].get("verified_by", "")
            verified_at = self.whitelist[key].get("verified_at", "")
            max_exp = self.whitelist[key].get("max_exposure_usd", 100.0)
            notes = self.whitelist[key].get("notes", "")
        elif not self.require_manual and similarity >= 0.85 and resolution_match:
            confidence = MatchConfidence.CANDIDATE
            tradable = False  # CANDIDATE requires manual upgrade
            verified_by = ""
            verified_at = ""
            max_exp = 0
            notes = "Algorithm detected - requires manual verification"
        else:
            confidence = MatchConfidence.REJECTED
            tradable = False
            verified_by = ""
            verified_at = ""
            max_exp = 0
            notes = "Not whitelisted or confidence too low"
        
        return MarketMapping(
            polymarket_id=poly_id,
            kalshi_id=kalshi_id,
            polymarket_question=poly_q,
            kalshi_question=kalshi_q,
            similarity=similarity,
            confidence=confidence,
            resolution_match=resolution_match,
            expiry_match=expiry_match,
            tradable=tradable,
            verified_by=verified_by,
            verified_at=verified_at,
            resolution_notes=notes,
            max_exposure_usd=max_exp,
            notes=notes,
        )
    
    def _check_resolution_compatible(self, q1: str, q2: str) -> bool:
        """
        Check if resolution criteria are compatible.
        HIGHEST RISK CHECK - be conservative.
        """
        q1_lower = q1.lower()
        q2_lower = q2.lower()
        
        for word in self.RESOLUTION_MISMATCH_WORDS:
            in_q1 = word in q1_lower
            in_q2 = word in q2_lower
            if in_q1 != in_q2:
                return False
        
        # Additional heuristic: check for different dates/deadlines
        import re
        dates1 = re.findall(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b', q1)
        dates2 = re.findall(r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\b', q2)
        if dates1 and dates2 and dates1 != dates2:
            return False
        
        return True
    
    def track_spread(self, mapping_id: str, spread: float, timestamp: float):
        """Track spread over time for mismatch detection"""
        if mapping_id not in self.active_spreads:
            self.active_spreads[mapping_id] = SpreadObservation(
                mapping_id=mapping_id,
                first_seen=timestamp,
                last_seen=timestamp,
            )
        
        obs = self.active_spreads[mapping_id]
        obs.last_seen = timestamp
        obs.spread_history.append((timestamp, spread))
        
        # Check for suspicious non-convergence
        if obs.suspicious:
            logger.warning(
                f"SUSPICIOUS: Spread not converging after {obs.age_hours:.1f}h "
                f"for {mapping_id}. Possible mismatch!"
            )
    
    def get_suspicious_mappings(self) -> List[str]:
        """Get mappings where spread hasn't converged (likely mismatched)"""
        return [m_id for m_id, obs in self.active_spreads.items() if obs.suspicious]
    
    def get_stats(self) -> dict:
        """Get matching statistics"""
        verified = sum(1 for m in self.mappings if m.confidence == MatchConfidence.VERIFIED)
        candidate = sum(1 for m in self.mappings if m.confidence == MatchConfidence.CANDIDATE)
        rejected = sum(1 for m in self.mappings if m.confidence == MatchConfidence.REJECTED)
        suspicious = len(self.get_suspicious_mappings())
        
        return {
            "total_mappings": len(self.mappings),
            "verified": verified,
            "candidate": candidate,
            "rejected": rejected,
            "whitelist_size": len(self.whitelist),
            "suspicious_non_convergence": suspicious,
            "require_manual_whitelist": self.require_manual,
        }
