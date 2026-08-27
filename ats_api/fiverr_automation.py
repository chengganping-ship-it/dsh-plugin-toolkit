#!/usr/bin/env python3
"""
Fiverr ATS Automation Engine.

Monitors a Fiverr orders file (JSON), processes pending orders through the
ATS keyword gap analysis pipeline, generates tiered deliverable reports
(basic / standard / premium), and prepares ready-to-send client messages.

Directory layout created at run time:
    ats_api/
    ├── orders.json              # Source of truth for all orders
    ├── deliverables/
    │   └── FVR-XXX/
    │       ├── report.md       # Markdown report
    │       ├── report.html     # Styled HTML report
    │       ├── analysis.json   # Raw API analysis output
    │       └── message.txt     # Ready-to-send Fiverr message
    └── report_templates/       # Tier-specific Jinja-style templates
"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

# ---------------------------------------------------------------------------
# Paths — all resolved from this file's location for cross-platform safety
# ---------------------------------------------------------------------------

MODULE_DIR = Path(__file__).resolve().parent
ORDERS_FILE = MODULE_DIR / "orders.json"
DELIVERABLES_DIR = MODULE_DIR / "deliverables"
TEMPLATES_DIR = MODULE_DIR / "report_templates"

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DEFAULT_API_URL = os.getenv("ATS_API_URL", "http://localhost:8000")
DEFAULT_API_KEY = os.getenv("ATS_API_KEY", "test-key-id:test-key-secret")

# Tier definitions — controls keyword depth and deliverable complexity
TIER_CONFIG: Dict[str, Dict[str, Any]] = {
    "basic": {
        "max_keywords": 5,
        "includes": ["Executive Summary", "Top 5 Missing Keywords", "Quick Suggestions"],
        "description": "Quick keyword gap snapshot — 5 critical missing terms",
    },
    "standard": {
        "max_keywords": 15,
        "includes": [
            "Executive Summary",
            "Full Keyword Gap Analysis",
            "Domain Breakdown",
            "Action Plan",
            "Suggested Resume Bullets",
        ],
        "description": "Detailed gap analysis with skills mapping and action plan",
    },
    "premium": {
        "max_keywords": 0,  # unlimited
        "includes": [
            "Executive Summary",
            "Complete Keyword Gap Analysis",
            "Domain Breakdown",
            "ATS Optimization Tips",
            "Industry Keyword Injection",
            "Resume Rewrite Suggestions",
            "Before/After Examples",
            "Cover Letter Keyword Integration",
        ],
        "description": "Comprehensive rewrite guidance with ATS optimization mastery",
    },
}


# ---------------------------------------------------------------------------
# Order I/O
# ---------------------------------------------------------------------------

class OrderManager:
    """Read / write the orders.json file with in-process caching."""

    def __init__(self, orders_path: Path = ORDERS_FILE):
        self.orders_path = orders_path
        self._data: Dict[str, Any] = {"orders": []}

    # -- loading / saving ---------------------------------------------------

    def load(self) -> None:
        if not self.orders_path.exists():
            self._data = {"orders": []}
            return
        raw = self.orders_path.read_text(encoding="utf-8")
        self._data = json.loads(raw) if raw.strip() else {"orders": []}
        if "orders" not in self._data:
            self._data = {"orders": []}

    def save(self) -> None:
        self.orders_path.parent.mkdir(parents=True, exist_ok=True)
        self.orders_path.write_text(
            json.dumps(self._data, indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    # -- querying -----------------------------------------------------------

    @property
    def orders(self) -> List[Dict[str, Any]]:
        return self._data.get("orders", [])

    def get_order(self, order_id: str) -> Optional[Dict[str, Any]]:
        for o in self.orders:
            if o.get("order_id") == order_id:
                return o
        return None

    def get_pending(self) -> List[Dict[str, Any]]:
        return [o for o in self.orders if o.get("status") == "pending"]

    # -- mutations ----------------------------------------------------------

    def upsert_order(self, order: Dict[str, Any]) -> None:
        """Insert or update an order keyed by order_id."""
        for idx, existing in enumerate(self.orders):
            if existing.get("order_id") == order.get("order_id"):
                self._data["orders"][idx] = order
                return
        self._data["orders"].append(order)

    def update_status(self, order_id: str, status: str, **extra: Any) -> bool:
        order = self.get_order(order_id)
        if not order:
            return False
        order["status"] = status
        order["updated_at"] = datetime.now(timezone.utc).isoformat()
        for k, v in extra.items():
            order[k] = v
        self.upsert_order(order)
        return True


# ---------------------------------------------------------------------------
# Content Acquisition
# ---------------------------------------------------------------------------

def fetch_resume_content(resume_url: str) -> str:
    """
    Download resume text from a URL or read from a local path.

    Supports:
      - http(s) URLs  (via httpx)
      - Local file paths (relative to CWD or absolute)
    """
    parsed = urlparse(resume_url)
    if parsed.scheme in ("http", "https"):
        return _download_file(resume_url)
    # Treat as local file path
    path = Path(resume_url)
    if not path.is_absolute():
        path = MODULE_DIR / path
    if not path.exists():
        raise FileNotFoundError(f"Resume file not found: {path}")
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1")


def _download_file(url: str, timeout: float = 30.0) -> str:
    """Download text content from a URL."""
    try:
        import httpx
    except ImportError:
        raise RuntimeError("httpx is required for URL downloads. pip install httpx")
    with httpx.Client(timeout=timeout, follow_redirects=True) as client:
        resp = client.get(url)
        resp.raise_for_status()
        return resp.text


# ---------------------------------------------------------------------------
# ATS Analysis
# ---------------------------------------------------------------------------

def call_ats_api(
    resume_text: str,
    jd_text: str,
    job_title: str = "",
    company: str = "",
    api_url: str = DEFAULT_API_URL,
    api_key: str = DEFAULT_API_KEY,
) -> Dict[str, Any]:
    """
    Submit resume + JD to the ATS Keyword Gap Analysis API.
    Falls back to local analyzer if the API is unreachable.
    """
    # Try remote API first
    try:
        import httpx

        with httpx.Client(
            base_url=api_url.rstrip("/"),
            headers={
                "X-API-Key": api_key,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=30.0,
        ) as client:
            resp = client.post(
                "/analyze",
                json={
                    "resume_text": resume_text,
                    "job_description": jd_text,
                    "job_title": job_title,
                    "company": company,
                },
            )
            if resp.status_code == 200:
                return resp.json()
    except Exception:
        pass  # Fall through to local

    # Fallback: run the analyzer directly from src/
    sys.path.insert(0, str(MODULE_DIR))
    from src.analyzer import analyze, ATSAnalysisRequest  # type: ignore

    request = ATSAnalysisRequest(
        resume_text=resume_text,
        job_description=jd_text,
        job_title=job_title,
        company=company,
    )
    result = analyze(request)
    return result.to_dict()


# ---------------------------------------------------------------------------
# Report Generation
# ---------------------------------------------------------------------------

def generate_deliverable(
    analysis: Dict[str, Any],
    order: Dict[str, Any],
    tier: str = "standard",
) -> Dict[str, Path]:
    """
    Generate all deliverable files for an order.

    Returns a dict with keys: 'markdown', 'html', 'json', 'message'
    pointing to the saved file paths.
    """
    cfg = TIER_CONFIG.get(tier, TIER_CONFIG["standard"])
    max_kw = cfg["max_keywords"]

    # Determine keyword list based on tier cap
    all_missing = analysis.get("missing_keywords", [])
    if max_kw > 0:
        featured_missing = all_missing[:max_kw]
    else:
        featured_missing = all_missing

    # Build the report context
    ctx = _build_report_context(analysis, order, tier, all_missing, featured_missing)

    # Generate outputs
    order_id = order.get("order_id", "FVR-UNKNOWN")
    out_dir = DELIVERABLES_DIR / order_id
    out_dir.mkdir(parents=True, exist_ok=True)

    md_path = out_dir / "report.md"
    html_path = out_dir / "report.html"
    json_path = out_dir / "analysis.json"
    msg_path = out_dir / "message.txt"

    md_path.write_text(_render_markdown(ctx, tier), encoding="utf-8")
    html_path.write_text(_render_html(ctx, tier), encoding="utf-8")
    json_path.write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding="utf-8")
    msg_path.write_text(_render_message(ctx), encoding="utf-8")

    return {
        "markdown": md_path,
        "html": html_path,
        "json": json_path,
        "message": msg_path,
    }


def _build_report_context(
    analysis: Dict[str, Any],
    order: Dict[str, Any],
    tier: str,
    all_missing: List[Dict[str, Any]],
    featured_missing: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """Assemble the rendering context shared across templates."""
    ats_score = analysis.get("ats_score", 0)
    matched_kws = analysis.get("matched_keywords", [])
    missing_by_domain = analysis.get("missing_by_domain", {})
    suggestions = analysis.get("suggestions", [])

    # Assessment string
    if ats_score >= 80:
        assessment = "Excellent alignment. Minor tweaks will make your resume highly competitive."
    elif ats_score >= 60:
        assessment = "Good foundation. Address the critical gaps to significantly improve your match rate."
    elif ats_score >= 40:
        assessment = "Moderate gaps detected. Substantial resume tailoring is recommended."
    elif ats_score >= 20:
        assessment = "Significant gaps found. Major resume revision needed for this role."
    else:
        assessment = "Poor alignment. Consider whether this role matches your core skill set."

    # Score bar visualization (ASCII for markdown)
    filled = ats_score // 5
    empty = 20 - filled
    score_bar = "█" * filled + "░" * empty

    # Domain breakdown sorted by gap count
    domain_items = sorted(
        missing_by_domain.items(),
        key=lambda x: len(x[1]),
        reverse=True,
    )

    return {
        "tier": tier,
        "tier_config": TIER_CONFIG.get(tier, TIER_CONFIG["standard"]),
        "order_id": order.get("order_id", ""),
        "client": order.get("client", "Valued Client"),
        "job_title": order.get("job_title", ""),
        "company": order.get("company", ""),
        "generated_at": datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC"),
        "ats_score": ats_score,
        "score_bar": score_bar,
        "assessment": assessment,
        "match_percentage": analysis.get("match_percentage", 0),
        "total_jd_keywords": analysis.get("jd_keywords_total", 0),
        "matched_count": analysis.get("match_count", 0),
        "missing_count": len(all_missing),
        "matched_keywords": matched_kws,
        "featured_missing": featured_missing,
        "all_missing": all_missing,
        "missing_by_domain": domain_items,
        "suggestions": suggestions,
        "domain_labels": {
            "prog": "Programming Languages",
            "frontend": "Frontend & Web",
            "cloud_devops": "Cloud & DevOps",
            "data_ml": "Data & Machine Learning",
            "database": "Databases",
            "system_design": "System Design",
            "security": "Security",
            "general": "General / Soft Skills",
        },
    }


# ---------------------------------------------------------------------------
# Markdown Renderer
# ---------------------------------------------------------------------------

def _render_markdown(ctx: Dict[str, Any], tier: str) -> str:
    """Render the full markdown report based on tier."""
    lines: List[str] = []

    # Header
    lines.append(f"# ATS Keyword Gap Analysis Report")
    lines.append(f"")
    lines.append(f"> **Order:** {ctx['order_id']}  ")
    lines.append(f"> **Prepared for:** {ctx['client']}  ")
    lines.append(f"> **Target Role:** {ctx['job_title'] or 'N/A'}  ")
    lines.append(f"> **Target Company:** {ctx['company'] or 'N/A'}  ")
    lines.append(f"> **Service Tier:** {tier.title()}  ")
    lines.append(f"> **Generated:** {ctx['generated_at']}  ")
    lines.append(f"")

    # Executive Summary
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Executive Summary")
    lines.append(f"")
    lines.append(f"**ATS Match Score:** `{ctx['ats_score']}/100`")
    lines.append(f"")
    lines.append(f"```")
    lines.append(f"[{ctx['score_bar']}] {ctx['ats_score']}%")
    lines.append(f"```")
    lines.append(f"")
    lines.append(f"| Metric | Value |")
    lines.append(f"|--------|-------|")
    lines.append(f"| JD Keywords Found | {ctx['total_jd_keywords']} |")
    lines.append(f"| Matched on Resume | {ctx['matched_count']} |")
    lines.append(f"| Missing from Resume | {ctx['missing_count']} |")
    lines.append(f"| Match Rate | {ctx['match_percentage']}% |")
    lines.append(f"")
    lines.append(f"**Assessment:** {ctx['assessment']}")
    lines.append(f"")

    # Tier-specific sections
    if tier == "basic":
        lines.extend(_md_basic_sections(ctx))
    elif tier == "standard":
        lines.extend(_md_standard_sections(ctx))
    else:
        lines.extend(_md_premium_sections(ctx))

    # Footer
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"*This report was generated automatically using ATS keyword gap analysis. ")
    lines.append(f"For questions or revisions, please contact your seller.*")
    lines.append(f"")

    return "\n".join(lines)


def _md_basic_sections(ctx: Dict[str, Any]) -> List[str]:
    """Sections for the basic tier."""
    lines: List[str] = []

    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Top Missing Keywords")
    lines.append(f"")
    lines.append(f"The following keywords appear in the job description but are missing from your resume:")
    lines.append(f"")

    for kw in ctx["featured_missing"]:
        term = kw.get("term", "")
        imp = kw.get("importance", "medium")
        freq = kw.get("jd_frequency", 1)
        icon = {"critical": "🔴", "high": "🟡", "medium": "🟢"}.get(imp, "⚪")
        lines.append(f"- {icon} **{term}** — mentioned {freq}x in JD ({imp} priority)")

    lines.append(f"")
    lines.append(f"## Quick Suggestions")
    lines.append(f"")

    for i, suggestion in enumerate(ctx["suggestions"][:3], 1):
        lines.append(f"{i}. {suggestion}")

    lines.append(f"")
    return lines


def _md_standard_sections(ctx: Dict[str, Any]) -> List[str]:
    """Sections for the standard tier."""
    lines = _md_basic_sections(ctx)

    # Extend keyword list for standard
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Full Keyword Gap Analysis")
    lines.append(f"")
    lines.append(f"| Keyword | Frequency in JD | Importance | Domain |")
    lines.append(f"|---------|-----------------|------------|--------|")

    for kw in ctx["featured_missing"][:15]:
        term = kw.get("term", "")
        freq = kw.get("jd_frequency", 1)
        imp = kw.get("importance", "medium")
        domain = kw.get("domain", "general")
        label = ctx.get("domain_labels", {}).get(domain, domain)
        lines.append(f"| {term} | {freq} | {imp} | {label} |")

    # Domain Breakdown
    lines.append(f"")
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Domain Breakdown")
    lines.append(f"")
    lines.append(f"Missing keywords grouped by skill category:")
    lines.append(f"")

    for domain, terms in ctx["missing_by_domain"]:
        label = ctx.get("domain_labels", {}).get(domain, domain)
        lines.append(f"### {label} ({len(terms)} missing)")
        lines.append(f"")
        lines.append(f"{', '.join(f'`{t}`' for t in terms[:10])}")
        lines.append(f"")

    # Action Plan
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Action Plan")
    lines.append(f"")
    lines.append(f"### Immediate (Do First)")
    lines.append(f"")

    critical = [k for k in ctx["all_missing"] if k.get("importance") == "critical"]
    for kw in critical[:5]:
        lines.append(f"- Add **{kw.get('term', '')}** to your resume summary and relevant experience bullets")

    lines.append(f"")
    lines.append(f"### Recommended (Do Soon)")
    lines.append(f"")

    high = [k for k in ctx["all_missing"] if k.get("importance") == "high"]
    for kw in high[:8]:
        lines.append(f"- Incorporate **{kw.get('term', '')}** where you have relevant experience")

    lines.append(f"")
    lines.append(f"### All Suggestions")
    lines.append(f"")

    for i, suggestion in enumerate(ctx["suggestions"], 1):
        lines.append(f"{i}. {suggestion}")

    lines.append(f"")
    return lines


def _md_premium_sections(ctx: Dict[str, Any]) -> List[str]:
    """Sections for the premium tier — the full comprehensive report."""
    lines = _md_standard_sections(ctx)

    # ATS Optimization Tips
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## ATS Optimization Tips")
    lines.append(f"")
    lines.append(f"1. **Mirror the exact wording** from the job description where truthful. ")
    lines.append(f"   ATS systems do literal string matching — 'React.js' will not match 'React' in some parsers.")
    lines.append(f"2. **Place critical keywords** in your resume summary, skills section, and first 2 bullet points of each role.")
    lines.append(f"3. **Use standard section headings** like 'Experience', 'Skills', 'Education' — ATS parsers rely on them.")
    lines.append(f"4. **Avoid tables, columns, headers/footers** — many ATS systems cannot parse them.")
    lines.append(f"5. **Spell out acronyms at least once** — write 'Search Engine Optimization (SEO)' before using just 'SEO'.")
    lines.append(f"6. **Quantify achievements** with numbers — 'Reduced deployment time by 80%' beats 'Improved deployments'.")
    lines.append(f"7. **Include a dedicated 'Technical Skills' section** — this is the highest-density area for keyword matching.")
    lines.append(f"")

    # Industry Keywords
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Industry Standard Keywords")
    lines.append(f"")
    lines.append(f"Based on your target role, consider adding these industry-standard terms where applicable:")
    lines.append(f"")

    # Generate role-specific recommendations
    job_title_lower = ctx.get("job_title", "").lower()
    industry_kws = _suggest_industry_keywords(job_title_lower)
    for kw in industry_kws:
        lines.append(f"- {kw}")
    lines.append(f"")

    # Resume Rewrite Suggestions
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Resume Rewrite Suggestions")
    lines.append(f"")
    lines.append(f"Here is how to strengthen your resume for this specific role:")
    lines.append(f"")

    lines.append(f"### Before (Generic)")
    lines.append(f"")
    lines.append(f"```")
    lines.append(f"Experienced software developer with knowledge of various technologies")
    lines.append(f"```")
    lines.append(f"")
    lines.append(f"### After (Tailored)")
    lines.append(f"")
    top_terms = [k.get("term", "") for k in ctx["featured_missing"][:5]]
    lines.append(f"```")
    lines.append(
        f"Results-driven {ctx.get('job_title', 'professional')} "
        f"with deep expertise in {', '.join(ctx['matched_keywords'][:3]) if ctx['matched_keywords'] else 'modern technologies'}"
    )
    lines.append(f"```")
    lines.append(f"")

    if top_terms:
        lines.append(f"### Suggested Bullet Point Additions")
        lines.append(f"")
        for term in top_terms:
            lines.append(
                f"- Leveraged **{term}** to deliver measurable business outcomes, "
                f"aligning with {ctx.get('company', 'target organization')} requirements"
            )
        lines.append(f"")

    # Cover Letter Keyword Integration
    lines.append(f"---")
    lines.append(f"")
    lines.append(f"## Cover Letter Keyword Integration")
    lines.append(f"")
    lines.append(f"To maximize ATS impact across your entire application, weave these keywords into your cover letter:")
    lines.append(f"")

    featured_terms = [k.get("term", "") for k in ctx["featured_missing"][:10]]
    if featured_terms:
        para = (
            f"My background aligns closely with your requirements — I bring hands-on experience "
            f"with {', '.join(featured_terms[:5])}, directly addressing the key competencies "
            f"outlined in your job description. I am confident my expertise in "
            f"{', '.join(featured_terms[5:] if len(featured_terms) > 5 else featured_terms[:3])} "
            f"will enable me to contribute immediately to {ctx.get('company', 'your team')}."
        )
        lines.append(f"```")
        lines.append(para)
        lines.append(f"```")

    lines.append(f"")
    return lines


def _suggest_industry_keywords(job_title: str) -> List[str]:
    """Suggest role-specific keywords based on job title hints."""
    suggestions: List[str] = []

    if "python" in job_title or "backend" in job_title:
        suggestions.extend([
            "REST API Design", "Unit Testing (pytest)", "Type Hinting",
            "Async Programming (asyncio)", "Database Optimization",
            "API Documentation (OpenAPI/Swagger)",
        ])
    if "frontend" in job_title or "react" in job_title:
        suggestions.extend([
            "Component Architecture", "State Management", "Responsive Design",
            "Web Accessibility (WCAG)", "Performance Optimization",
            "Jest/React Testing Library",
        ])
    if "data" in job_title or "ml" in job_title or "machine learning" in job_title:
        suggestions.extend([
            "Feature Engineering", "Model Evaluation Metrics", "Cross-Validation",
            "Production ML Pipelines", "A/B Testing", "Statistical Analysis",
        ])
    if "devops" in job_title or "sre" in job_title or "platform" in job_title:
        suggestions.extend([
            "Infrastructure as Code", "GitOps", "Observability",
            "Incident Response", "Capacity Planning", "SLO/SLI Definition",
        ])
    if "full" in job_title or "fullstack" in job_title:
        suggestions.extend([
            "End-to-End Development", "System Integration", "Database Schema Design",
            "API Contract Testing", "CI/CD Pipeline Ownership",
        ])

    # Generic fallback
    if not suggestions:
        suggestions.extend([
            "Collaborative Development", "Specification Analysis",
            "Quality Assurance", "Stakeholder Communication",
            "Continuous Improvement", "Technical Documentation",
        ])

    return suggestions


# ---------------------------------------------------------------------------
# HTML Renderer
# ---------------------------------------------------------------------------

def _render_html(ctx: Dict[str, Any], tier: str) -> str:
    """Render a styled HTML version of the report."""
    md_text = _render_markdown(ctx, tier)

    # Simple, clean HTML with embedded CSS
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ATS Report — {ctx['order_id']}</title>
<style>
:root {{
  --primary: #1a73e8;
  --success: #0d904f;
  --warning: #e8a317;
  --danger: #d93025;
  --bg: #f8f9fa;
  --card: #ffffff;
  --text: #202124;
  --muted: #5f6368;
  --border: #dadce0;
}}
body {{
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  margin: 0;
  padding: 2rem;
  line-height: 1.6;
}}
.container {{
  max-width: 860px;
  margin: 0 auto;
  background: var(--card);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 2.5rem;
}}
h1 {{ color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 0.5rem; }}
h2 {{ color: var(--text); margin-top: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }}
h3 {{ color: var(--muted); }}
meta {{ color: var(--muted); font-size: 0.9rem; }}
.score-bar {{
  background: var(--border);
  border-radius: 10px;
  height: 24px;
  overflow: hidden;
  margin: 1rem 0;
}}
.score-fill {{
  height: 100%;
  background: linear-gradient(90deg, var(--danger), var(--warning), var(--success));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.85rem;
  transition: width 0.5s ease;
}}
table {{
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}}
th, td {{
  padding: 0.6rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border);
}}
th {{ background: var(--bg); font-weight: 600; }}
tr:hover td {{ background: var(--bg); }}
.keyword-tag {{
  display: inline-block;
  background: #e8f0fe;
  color: var(--primary);
  padding: 0.15rem 0.55rem;
  border-radius: 12px;
  font-size: 0.85rem;
  margin: 0.15rem;
}}
.missing-tag {{
  background: #fce8e6;
  color: var(--danger);
}}
.matched-tag {{
  background: #e6f4ea;
  color: var(--success);
}}
blockquote {{
  border-left: 4px solid var(--primary);
  background: var(--bg);
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  border-radius: 0 8px 8px 0;
}}
code {{
  background: var(--bg);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9rem;
}}
pre {{
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85rem;
}}
hr {{ border: none; border-top: 1px solid var(--border); margin: 2rem 0; }}
ul, ol {{ padding-left: 1.5rem; }}
li {{ margin: 0.35rem 0; }}
.tier-badge {{
  display: inline-block;
  background: var(--primary);
  color: white;
  padding: 0.2rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}}
@media print {{
  body {{ background: white; padding: 0; }}
  .container {{ box-shadow: none; padding: 1rem; }}
}}
</style>
</head>
<body>
<div class="container">
{_md_to_html(md_text)}
</div>
</body>
</html>"""
    return html


def _md_to_html(md: str) -> str:
    """
    Minimal markdown-to-HTML converter.
    Handles the subset of markdown used in our reports.
    """
    lines = md.split("\n")
    html_parts: List[str] = []
    in_table = False
    in_code = False
    in_ul = False

    for line in lines:
        stripped = line.strip()

        # Code blocks
        if stripped.startswith("```"):
            if in_code:
                html_parts.append("</code></pre>")
                in_code = False
            else:
                lang = stripped[3:].strip()
                html_parts.append(f'<pre><code class="language-{lang}">' if lang else "<pre><code>")
                in_code = True
            continue

        if in_code:
            html_parts.append(_escape_html(line))
            continue

        # Skip empty lines
        if not stripped:
            if in_table:
                html_parts.append("</tbody></table>")
                in_table = False
            if in_ul:
                html_parts.append("</ul>")
                in_ul = False
            html_parts.append("")
            continue

        # Horizontal rule
        if stripped == "---":
            html_parts.append("<hr>")
            continue

        # Headers
        if stripped.startswith("# "):
            html_parts.append(f"<h1>{_inline_md(stripped[2:])}</h1>")
            continue
        elif stripped.startswith("## "):
            html_parts.append(f"<h2>{_inline_md(stripped[3:])}</h2>")
            continue
        elif stripped.startswith("### "):
            html_parts.append(f"<h3>{_inline_md(stripped[4:])}</h3>")
            continue

        # Blockquote
        if stripped.startswith("> "):
            html_parts.append(f"<blockquote>{_inline_md(stripped[2:])}</blockquote>")
            continue

        # Table
        if "|" in stripped and stripped.startswith("|"):
            cells = [c.strip() for c in stripped.split("|")[1:-1]]
            if all(set(c) <= set("-: ") for c in cells):
                continue  # skip separator
            if not in_table:
                html_parts.append("<table><thead><tr>")
                for c in cells:
                    html_parts.append(f"<th>{_inline_md(c)}</th>")
                html_parts.append("</tr></thead><tbody>")
                in_table = True
            else:
                html_parts.append("<tr>")
                for c in cells:
                    html_parts.append(f"<td>{_inline_md(c)}</td>")
                html_parts.append("</tr>")
            continue
        else:
            if in_table:
                html_parts.append("</tbody></table>")
                in_table = False

        # Unordered list
        if stripped.startswith("- "):
            if not in_ul:
                html_parts.append("<ul>")
                in_ul = True
            html_parts.append(f"<li>{_inline_md(stripped[2:])}</li>")
            continue

        # Ordered list
        if re.match(r"^\d+\.\s", stripped):
            if not in_ul:
                html_parts.append("<ol>")
                in_ul = True
            content = re.sub(r"^\d+\.\s", "", stripped)
            html_parts.append(f"<li>{_inline_md(content)}</li>")
            continue
        else:
            if in_ul:
                html_parts.append("</ul>")  # or </ol>
                in_ul = False

        # Paragraph
        html_parts.append(f"<p>{_inline_md(stripped)}</p>")

    if in_table:
        html_parts.append("</tbody></table>")
    if in_ul:
        html_parts.append("</ul>")

    return "\n".join(html_parts)


def _inline_md(text: str) -> str:
    """Apply inline markdown formatting (bold, code, links)."""
    # Bold
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    # Inline code
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return text


def _escape_html(text: str) -> str:
    """Escape HTML special characters."""
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


# ---------------------------------------------------------------------------
# Message Renderer
# ---------------------------------------------------------------------------

def create_response_message(ctx: Dict[str, Any]) -> str:
    """Generate the Fiverr message to send to the client."""
    tier = ctx["tier"]
    tier_cfg = ctx.get("tier_config", {})

    msg_lines: List[str] = []

    msg_lines.append(f"Hi {ctx['client']},")
    msg_lines.append(f"")
    msg_lines.append(
        f"Thank you for your order! I've completed your ATS Keyword Gap Analysis "
        f"for the **{ctx['job_title'] or 'target role'}** position."
    )
    msg_lines.append(f"")

    # Score summary
    msg_lines.append(f"**Your ATS Match Score: {ctx['ats_score']}/100**")
    msg_lines.append(f"")

    if ctx["ats_score"] >= 70:
        msg_lines.append(
            f"Great news — your resume already has solid alignment with this role! "
            f"The report highlights a few strategic additions that will push you into the top tier of candidates."
        )
    elif ctx["ats_score"] >= 40:
        msg_lines.append(
            f"Your resume has a good foundation, but there are several high-impact keywords "
            f"missing that ATS systems will look for. The report provides a clear action plan."
        )
    else:
        msg_lines.append(
            f"There are significant gaps between your resume and this job description. "
            f"The report includes detailed rewrite suggestions to dramatically improve your match rate."
        )

    msg_lines.append(f"")

    # What's included
    msg_lines.append(f"**What's included in your {tier.title()} report:**")
    msg_lines.append(f"")
    for item in tier_cfg.get("includes", []):
        msg_lines.append(f"- {item}")

    msg_lines.append(f"")

    # Top missing keywords preview
    featured = ctx.get("featured_missing", [])
    if featured:
        msg_lines.append(f"**Top missing keywords to add:**")
        msg_lines.append(f"")
        for kw in featured[:5]:
            msg_lines.append(f"- {kw.get('term', '')}")
        msg_lines.append(f"")

    msg_lines.append(f"Files attached:")
    msg_lines.append(f"- `report.md` — Full report (Markdown)")
    msg_lines.append(f"- `report.html` — Styled report (open in browser)")
    msg_lines.append(f"- `analysis.json` — Raw analysis data")
    msg_lines.append(f"")
    msg_lines.append(
        f"Please review and let me know if you have any questions or need clarifications. "
        f"I'm happy to help you implement the suggestions!"
    )
    msg_lines.append(f"")
    msg_lines.append(f"Best regards,")
    msg_lines.append(f"Your ATS Optimization Specialist")

    return "\n".join(msg_lines)


def _render_message(ctx: Dict[str, Any]) -> str:
    """Alias for create_response_message for internal use."""
    return create_response_message(ctx)


# ---------------------------------------------------------------------------
# Save Deliverable
# ---------------------------------------------------------------------------

def save_deliverable(
    order_id: str,
    files: Dict[str, Path],
) -> Path:
    """
    Confirm deliverables are saved and return the output directory path.
    Files are already written by generate_deliverable(); this validates them.
    """
    out_dir = DELIVERABLES_DIR / order_id
    if not out_dir.exists():
        raise FileNotFoundError(f"Deliverable directory not found: {out_dir}")

    # Verify all expected files exist
    for key, path in files.items():
        if not path.exists():
            raise FileNotFoundError(f"Expected deliverable file missing ({key}): {path}")

    return out_dir


# ---------------------------------------------------------------------------
# Main Processing Pipeline
# ---------------------------------------------------------------------------

def process_order(
    order: Dict[str, Any],
    orders_mgr: OrderManager,
    api_url: str = DEFAULT_API_URL,
    api_key: str = DEFAULT_API_KEY,
) -> Dict[str, Any]:
    """
    Process a single order end-to-end:
    1. Fetch resume content
    2. Call ATS API
    3. Generate deliverables
    4. Update order status
    """
    order_id = order.get("order_id", "UNKNOWN")
    tier = order.get("tier", "standard")

    print(f"[{order_id}] Processing order (tier: {tier})...")

    # Step 1: Get resume text
    resume_text = ""
    resume_url = order.get("resume_url", "")
    if resume_url:
        try:
            print(f"[{order_id}] Downloading resume from: {resume_url}")
            resume_text = fetch_resume_content(resume_url)
        except Exception as e:
            print(f"[{order_id}] ERROR downloading resume: {e}")
            orders_mgr.update_status(order_id, "error", error=f"Resume download failed: {e}")
            orders_mgr.save()
            return {"success": False, "error": str(e)}
    else:
        # Check if resume text is embedded in the order
        resume_text = order.get("resume_text", "")
        if not resume_text:
            error_msg = "No resume_url or resume_text provided"
            print(f"[{order_id}] ERROR: {error_msg}")
            orders_mgr.update_status(order_id, "error", error=error_msg)
            orders_mgr.save()
            return {"success": False, "error": error_msg}

    # Step 2: Get JD text
    jd_text = order.get("jd_text", "")
    if not jd_text:
        error_msg = "No job description (jd_text) provided"
        print(f"[{order_id}] ERROR: {error_msg}")
        orders_mgr.update_status(order_id, "error", error=error_msg)
        orders_mgr.save()
        return {"success": False, "error": error_msg}

    # Step 3: Call ATS API
    print(f"[{order_id}] Running ATS analysis...")
    try:
        analysis = call_ats_api(
            resume_text=resume_text,
            jd_text=jd_text,
            job_title=order.get("job_title", ""),
            company=order.get("company", ""),
            api_url=api_url,
            api_key=api_key,
        )
    except Exception as e:
        print(f"[{order_id}] ERROR during analysis: {e}")
        orders_mgr.update_status(order_id, "error", error=f"Analysis failed: {e}")
        orders_mgr.save()
        return {"success": False, "error": str(e)}

    # Step 4: Generate deliverables
    print(f"[{order_id}] Generating {tier} deliverable...")
    try:
        files = generate_deliverable(analysis, order, tier)
    except Exception as e:
        print(f"[{order_id}] ERROR generating deliverable: {e}")
        orders_mgr.update_status(order_id, "error", error=f"Report generation failed: {e}")
        orders_mgr.save()
        return {"success": False, "error": str(e)}

    # Step 5: Save and update status
    out_dir = save_deliverable(order_id, files)
    orders_mgr.update_status(
        order_id,
        "completed",
        completed_at=datetime.now(timezone.utc).isoformat(),
        deliverable_dir=str(out_dir),
        ats_score=analysis.get("ats_score", 0),
    )
    orders_mgr.save()

    print(f"[{order_id}] Complete! Deliverables saved to: {out_dir}")

    return {
        "success": True,
        "order_id": order_id,
        "ats_score": analysis.get("ats_score", 0),
        "deliverable_dir": str(out_dir),
        "files": {k: str(v) for k, v in files.items()},
    }


def process_orders(
    orders_mgr: Optional[OrderManager] = None,
    api_url: str = DEFAULT_API_URL,
    api_key: str = DEFAULT_API_KEY,
) -> List[Dict[str, Any]]:
    """
    Process all pending orders in the queue.
    Returns a list of result dicts for each order processed.
    """
    if orders_mgr is None:
        orders_mgr = OrderManager()
        orders_mgr.load()

    pending = orders_mgr.get_pending()

    if not pending:
        print("[INFO] No pending orders to process.")
        return []

    print(f"[INFO] Processing {len(pending)} pending order(s)...")

    results = []
    for order in pending:
        result = process_order(order, orders_mgr, api_url, api_key)
        results.append(result)

    # Summary
    succeeded = sum(1 for r in results if r.get("success"))
    failed = len(results) - succeeded
    print(f"[INFO] Batch complete: {succeeded} succeeded, {failed} failed")

    return results


# ---------------------------------------------------------------------------
# CLI Entry Point (when run directly)
# ---------------------------------------------------------------------------

def main() -> int:
    """Quick CLI for running the automation pipeline directly."""
    import argparse

    parser = argparse.ArgumentParser(
        prog="fiverr_automation",
        description="Fiverr ATS Automation Engine — process pending orders",
    )
    parser.add_argument(
        "--orders-file",
        type=Path,
        default=ORDERS_FILE,
        help="Path to orders.json file",
    )
    parser.add_argument(
        "--api-url",
        default=DEFAULT_API_URL,
        help="ATS API base URL",
    )
    parser.add_argument(
        "--api-key",
        default=DEFAULT_API_KEY,
        help="ATS API key",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Create a sample orders.json and process it (for testing)",
    )

    args = parser.parse_args()

    if args.demo:
        return _run_demo(args.orders_file, args.api_url, args.api_key)

    mgr = OrderManager(args.orders_file)
    mgr.load()
    results = process_orders(mgr, args.api_url, args.api_key)
    return 0 if all(r.get("success") for r in results) else 1


def _run_demo(orders_file: Path, api_url: str, api_key: str) -> int:
    """Create sample data and run a demo processing."""
    print("[DEMO] Creating sample orders.json...")

    sample_orders = {
        "orders": [
            {
                "order_id": "FVR-DEMO-001",
                "client": "demo_client",
                "status": "pending",
                "resume_url": "",
                "resume_text": (
                    "John Smith\n"
                    "Senior Software Engineer\n\n"
                    "Experienced software engineer with 7 years of experience building "
                    "scalable web applications. Proficient in Python, JavaScript, and cloud technologies.\n\n"
                    "Skills:\n"
                    "- Python, Django, Flask, FastAPI\n"
                    "- JavaScript, React, Node.js\n"
                    "- AWS (EC2, S3, Lambda, RDS)\n"
                    "- Docker, Kubernetes, CI/CD\n"
                    "- PostgreSQL, Redis, Elasticsearch\n"
                    "- Git, GitHub Actions, Terraform\n\n"
                    "Experience:\n"
                    "Senior Software Engineer at TechCorp (2020-Present)\n"
                    "- Built microservices architecture serving 10M+ daily requests\n"
                    "- Led migration from monolith to serverless on AWS\n"
                    "- Implemented CI/CD pipelines reducing deployment time by 80%\n"
                ),
                "jd_text": (
                    "Senior Full Stack Engineer\n\n"
                    "We are looking for a Senior Full Stack Engineer to join our growing team.\n\n"
                    "Requirements:\n"
                    "- 5+ years of experience in software development\n"
                    "- Strong proficiency in Python and TypeScript\n"
                    "- Experience with React and Next.js frameworks\n"
                    "- Deep knowledge of AWS services (ECS, DynamoDB, SQS, SNS)\n"
                    "- Experience with Docker and Kubernetes in production\n"
                    "- Strong understanding of CI/CD and GitHub Actions\n"
                    "- Experience with PostgreSQL and MongoDB\n"
                    "- Knowledge of GraphQL and REST API design\n"
                    "- Familiarity with Terraform and infrastructure as code\n"
                    "- Experience with monitoring tools like Datadog or Prometheus\n"
                    "- Understanding of distributed systems and microservices\n"
                    "- Strong problem-solving skills and collaboration\n\n"
                    "Nice to Have:\n"
                    "- Experience with machine learning or NLP\n"
                    "- Knowledge of Kafka or message queue systems\n"
                    "- Experience with Elasticsearch\n"
                    "- Familiarity with Go or Rust\n"
                ),
                "job_title": "Senior Full Stack Engineer",
                "company": "DemoCorp",
                "tier": "standard",
                "created_at": "2026-08-24T10:00:00Z",
            }
        ],
    }

    orders_file.parent.mkdir(parents=True, exist_ok=True)
    orders_file.write_text(json.dumps(sample_orders, indent=2), encoding="utf-8")
    print(f"[DEMO] Sample orders written to: {orders_file}")

    mgr = OrderManager(orders_file)
    mgr.load()
    results = process_orders(mgr, api_url, api_key)

    for r in results:
        if r.get("success"):
            print(f"\n[DEMO] Success! Deliverables at: {r.get('deliverable_dir')}")
        else:
            print(f"\n[DEMO] Failed: {r.get('error')}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
