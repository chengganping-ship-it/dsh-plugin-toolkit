"""
ATS Keyword Gap Analyzer Core Engine.

Extracts technical and domain-specific keywords from a job description,
compares them against a candidate's resume, and returns structured
gap analysis with actionable suggestions.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field, asdict
from typing import Any, List, Dict, Set, Tuple


@dataclass
class ATSAnalysisRequest:
    resume_text: str
    job_description: str
    job_title: str = ""
    company: str = ""


@dataclass
class ATSAnalysisResult:
    resume_keywords_found: List[str] = field(default_factory=list)
    jd_keywords_total: int = 0
    match_count: int = 0
    match_percentage: float = 0.0
    missing_keywords: List[Dict[str, Any]] = field(default_factory=list)
    missing_by_domain: Dict[str, List[str]] = field(default_factory=dict)
    matched_keywords: List[str] = field(default_factory=list)
    suggestions: List[str] = field(default_factory=list)
    ats_score: int = 0  # 0-100 overall match score

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def chunk_text(text: str, chunk_size: int = 3000) -> List[str]:
    """Split large text into chunks on sentence boundaries."""
    if len(text) <= chunk_size:
        return [text]
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks: List[str] = []
    current = ""
    for s in sentences:
        if len(current) + len(s) > chunk_size and current:
            chunks.append(current)
            current = s
        else:
            current = (current + " " + s).strip() if current else s
    if current:
        chunks.append(current)
    return chunks


def _compile_skill_patterns() -> List[Tuple[str, str]]:
    """
    Compile skill patterns with canonical aliases.
    Returns list of (compiled_regex, canonical_name) tuples.
    """
    from .config import SKILL_KEYWORDS

    compiled = []
    for pattern in SKILL_KEYWORDS:
        try:
            compiled.append((re.compile(pattern, re.IGNORECASE), pattern))
        except re.error:
            continue
    return compiled


# Module-level compiled patterns (compiled once)
_COMPILED_PATTERNS = None


def _get_compiled_patterns():
    global _COMPILED_PATTERNS
    if _COMPILED_PATTERNS is None:
        _COMPILED_PATTERNS = _compile_skill_patterns()
    return _COMPILED_PATTERNS


def extract_keywords(text: str) -> Dict[str, int]:
    """
    Extract known skill keywords from text.
    Returns {canonical_keyword: frequency}.
    """
    lowered = text.lower()
    found: Dict[str, int] = {}

    for compiled, canonical in _get_compiled_patterns():
        matches = compiled.findall(lowered)
        if matches:
            found[canonical] = len(matches)

    return found


def extract_bigrams(text: str) -> Set[str]:
    """Extract significant bigrams (two-word phrases) from text."""
    from .config import STOPWORDS

    words = re.findall(r'[a-z][a-z+\-.#]*', text.lower())
    result = set()
    for i in range(len(words) - 1):
        w1, w2 = words[i], words[i + 1]
        if (w1 not in STOPWORDS and w2 not in STOPWORDS
                and len(w1) > 1 and len(w2) > 1):
            result.add(f"{w1} {w2}")
    return result


def _categorize_domain(keyword: str) -> str:
    """Categorize a keyword into a skill domain."""
    domain_map = {
        "prog": ["python", "java", "javascript", "typescript", "c++", "go", "rust",
                  "ruby", "php", "swift", "kotlin", "scala", "perl", "elixir", "clojure",
                  "haskell", "lua", "dart", "matlab", "r programming", "r language"],
        "frontend": ["react", "angular", "vue", "svelte", "next.js", "node.js", "express",
                      "django", "flask", "rails", "spring", "graphql", "rest", "restful",
                      "websocket", "webpack", "babel", "jquery", "bootstrap", "tailwind",
                      "tailwindcss", "sass", "less", "html5", "html", "css3", "css",
                      "redux", "mobx"],
        "cloud_devops": ["aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
                         "terraform", "ansible", "jenkins", "circleci", "travis",
                         "github actions", "ci/cd", "microservices", "serverless", "lambda",
                         "cloud functions", "azure functions", "datadog", "grafana", "prometheus"],
        "data_ml": ["machine learning", "deep learning", "neural network", "nlp",
                     "natural language processing", "computer vision", "tensorflow",
                     "pytorch", "keras", "scikit-learn", "pandas", "numpy", "scipy",
                     "matplotlib", "seaborn", "plotly", "tableau", "power bi",
                     "snowflake", "redshift", "bigquery", "spark", "hadoop", "airflow",
                     "dagster", "mlflow", "kubeflow", "databricks", "dbt", "looker"],
        "database": ["sql", "mysql", "postgresql", "postgres", "mongodb", "dynamodb",
                     "cassandra", "redis", "elasticsearch", "neo4j", "sqlite", "oracle",
                     "sql server", "supabase", "firebase", "realm"],
        "system_design": ["distributed system", "high availability", "scalability",
                           "load balancing", "caching", "cdn", "message queue",
                           "rabbitmq", "kafka", "event-driven", "design pattern",
                           "solid principles", "cap theorem", "sharding", "partitioning"],
        "security": ["oauth", "jwt", "ssl", "tls", "encryption", "authentication",
                     "authorization", "penetration testing", "vulnerability", "xss",
                     "csrf", "sql injection", "cybersecurity", "security"],
    }
    for domain, keywords in domain_map.items():
        if keyword in keywords:
            return domain
    return "general"


def _calc_importance(jd_frequency: int) -> str:
    """Determine importance based on frequency in JD."""
    if jd_frequency >= 3:
        return "critical"
    elif jd_frequency >= 2:
        return "high"
    else:
        return "medium"


def analyze(request: ATSAnalysisRequest) -> ATSAnalysisResult:
    """
    Perform full ATS keyword gap analysis.

    1. Extract keywords from JD and resume
    2. Compute match vs missing using normalized matched strings
    3. Group missing by domain
    4. Generate actionable suggestions
    5. Compute overall ATS score
    """
    jd_text = request.job_description
    res_text = request.resume_text

    if not jd_text.strip() or not res_text.strip():
        return ATSAnalysisResult(suggestions=["Both resume and job description must be non-empty."])

    # Extract keywords
    jd_keywords = extract_keywords(jd_text)
    res_keywords = extract_keywords(res_text)

    # Build reverse mapping: canonical -> whether in resume
    matched = []
    missing_terms = []

    for kw, freq in sorted(jd_keywords.items(), key=lambda x: x[1], reverse=True):
        if kw in res_keywords:
            matched.append(kw)
        else:
            domain = _categorize_domain(kw)
            missing_terms.append({
                "term": kw,
                "jd_frequency": freq,
                "in_resume": False,
                "domain": domain,
                "importance": _calc_importance(freq),
            })

    # Bigram analysis
    jd_bigrams = extract_bigrams(jd_text)
    res_bigrams = extract_bigrams(res_text)

    # Group missing by domain
    by_domain: Dict[str, List[str]] = {}
    for mt in missing_terms:
        d = mt.get("domain", "general")
        if d not in by_domain:
            by_domain[d] = []
        by_domain[d].append(mt["term"])

    # Generate suggestions
    suggestions = _generate_suggestions(matched, missing_terms, request)

    # Calculate ATS score
    ats_score = _compute_score(
        jd_keywords=jd_keywords,
        matched_count=len(matched),
        missing_terms=missing_terms,
        jd_bigrams=jd_bigrams,
        res_bigrams=res_bigrams,
    )

    # Compute match percentage
    total_jd_kws = len(jd_keywords) if jd_keywords else 1
    match_pct = round((len(matched) / total_jd_kws) * 100, 1)

    return ATSAnalysisResult(
        resume_keywords_found=sorted(res_keywords.keys()),
        jd_keywords_total=len(jd_keywords),
        match_count=len(matched),
        match_percentage=match_pct,
        missing_keywords=missing_terms,
        missing_by_domain=by_domain,
        matched_keywords=matched,
        suggestions=suggestions,
        ats_score=ats_score,
    )


def _generate_suggestions(
    matched: List[str],
    missing_terms: List[Dict[str, Any]],
    request: ATSAnalysisRequest,
) -> List[str]:
    """Generate actionable resume improvement suggestions."""
    suggestions: List[str] = []

    critical_missing = [t for t in missing_terms if t.get("importance") == "critical"]
    high_missing = [t for t in missing_terms if t.get("importance") == "high"]

    if critical_missing:
        terms = ", ".join(t["term"] for t in critical_missing[:5])
        suggestions.append(
            f"Critical gap: The JD prominently mentions [{terms}] "
            f"but your resume lacks these. Add them to your summary and experience sections."
        )

    if high_missing:
        areas = set(t.get("domain", "general") for t in high_missing)
        for area in sorted(areas):
            area_terms = [t["term"] for t in high_missing if t.get("domain") == area]
            if len(area_terms) >= 2:
                suggestions.append(
                    f"Strengthen your {area} profile. Consider adding: {', '.join(area_terms[:4])}."
                )

    if len(matched) > len(missing_terms):
        suggestions.append(
            "Good alignment overall. Emphasize your matched skills more prominently "
            "in your resume summary and the first few bullet points of each role."
        )

    if request.job_title:
        suggestions.append(
            f"Tailor your resume headline to include '{request.job_title}' or a close variation "
            f"to show direct role alignment with the job posting."
        )

    if not suggestions:
        suggestions.append(
            "Review the JD for specific tools/technologies and ensure they appear "
            "verbatim in your resume where you have relevant experience."
        )

    return suggestions


def _compute_score(
    jd_keywords: Dict[str, int],
    matched_count: int,
    missing_terms: List[Dict[str, Any]],
    jd_bigrams: Set[str],
    res_bigrams: Set[str],
) -> int:
    """
    Compute overall ATS match score (0-100).
    - Keyword match: 60% of score
    - Bigram overlap: 30% of score
    - Critical missing penalty: -10% per critical term (max -30)
    """
    if not jd_keywords:
        return 0

    kw_rate = matched_count / len(jd_keywords)
    kw_score = min(60, int(kw_rate * 60))

    if jd_bigrams:
        bigram_overlap = len(jd_bigrams & res_bigrams) / len(jd_bigrams)
        bigram_score = min(30, int(bigram_overlap * 30))
    else:
        bigram_score = 0

    critical_count = sum(1 for t in missing_terms if t.get("importance") == "critical")
    penalty = min(30, critical_count * 10)

    raw_score = kw_score + bigram_score - penalty
    return max(0, min(100, raw_score))
