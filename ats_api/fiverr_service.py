#!/usr/bin/env python3
"""
Fiverr ATS Analysis Service CLI.

A command-line tool for Fiverr freelancers to deliver ATS keyword gap
analysis reports to clients. Reads a resume file and job description,
calls the ATS API, and produces a structured JSON deliverable.

Usage:
    python fiverr_service.py --resume resume.txt --jd "job description text"
    python fiverr_service.py --resume resume.txt --jd-file posting.txt --output report.json
    python fiverr_service.py --demo
"""

from __future__ import annotations

import argparse
import json
import sys
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

try:
    import httpx
except ImportError:
    print("Error: httpx is required. Install with: pip install httpx", file=sys.stderr)
    sys.exit(1)


# === Configuration ===

DEFAULT_API_URL = os.getenv("ATS_API_URL", "http://localhost:8000")
DEFAULT_API_KEY = os.getenv("ATS_API_KEY", "dev-key-id:dev-key-secret")


# === Demo Data ===

DEMO_RESUME = """
John Smith
Senior Software Engineer

Experienced software engineer with 7 years of experience building scalable
web applications. Proficient in Python, JavaScript, and cloud technologies.

Skills:
- Python, Django, Flask, FastAPI
- JavaScript, React, Node.js
- AWS (EC2, S3, Lambda, RDS)
- Docker, Kubernetes, CI/CD
- PostgreSQL, Redis, Elasticsearch
- Git, GitHub Actions, Terraform

Experience:
Senior Software Engineer at TechCorp (2020-Present)
- Built microservices architecture serving 10M+ daily requests
- Led migration from monolith to serverless on AWS
- Implemented CI/CD pipelines reducing deployment time by 80%

Software Engineer at StartupXYZ (2017-2020)
- Developed RESTful APIs using Django and FastAPI
- Managed PostgreSQL databases and Redis caching layers
- Collaborated with cross-functional teams using Agile/Scrum
"""

DEMO_JOB_DESCRIPTION = """
Senior Full Stack Engineer

We are looking for a Senior Full Stack Engineer to join our growing team.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in Python and TypeScript
- Experience with React and Next.js frameworks
- Deep knowledge of AWS services (ECS, DynamoDB, SQS, SNS)
- Experience with Docker and Kubernetes in production
- Strong understanding of CI/CD and GitHub Actions
- Experience with PostgreSQL and MongoDB
- Knowledge of GraphQL and REST API design
- Familiarity with Terraform and infrastructure as code
- Experience with monitoring tools like Datadog or Prometheus
- Understanding of distributed systems and microservices
- Strong problem-solving skills and collaboration

Nice to Have:
- Experience with machine learning or NLP
- Knowledge of Kafka or message queue systems
- Experience with Elasticsearch
- Familiarity with Go or Rust
"""


# === API Client ===

class ATSAPIClient:
    """Client for the ATS Keyword Gap Analysis API."""

    def __init__(self, base_url: str, api_key: str, timeout: float = 30.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = httpx.Client(
            headers={
                "X-API-Key": api_key,
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=timeout,
        )

    def health_check(self) -> Dict[str, Any]:
        """Check if the API is reachable."""
        resp = self._client.get(f"{self.base_url}/health")
        resp.raise_for_status()
        return resp.json()

    def analyze(self, resume_text: str, job_description: str,
                job_title: str = "", company: str = "") -> Dict[str, Any]:
        """Submit resume and JD for analysis."""
        payload = {
            "resume_text": resume_text,
            "job_description": job_description,
            "job_title": job_title,
            "company": company,
        }
        resp = self._client.post(f"{self.base_url}/analyze", json=payload)
        if resp.status_code != 200:
            error_detail = resp.json().get("detail", resp.text)
            raise RuntimeError(f"API analysis failed (HTTP {resp.status_code}): {error_detail}")
        return resp.json()

    def close(self):
        self._client.close()


# === Report Builder ===

def build_fiverr_report(
    analysis_result: Dict[str, Any],
    resume_filename: str = "resume.txt",
    job_title: str = "",
    client_name: str = "",
) -> Dict[str, Any]:
    """
    Transform raw API analysis into a Fiverr-deliverable report.

    The output is structured JSON that can be:
    - Delivered directly to the client as a data file
    - Converted to PDF/Word by the freelancer
    - Used to create a visual summary
    """
    now = datetime.now(timezone.utc).isoformat()

    # Build prioritized action items
    action_items = []
    for kw in analysis_result.get("missing_keywords", []):
        importance = kw.get("importance", "medium")
        term = kw.get("term", "")
        domain = kw.get("domain", "general")
        freq = kw.get("jd_frequency", 1)
        action_items.append({
            "term": term,
            "importance": importance,
            "domain": domain,
            "jd_mentions": freq,
            "action": f"Add '{term}' to your resume in relevant experience bullets "
                      f"(mentioned {freq}x in JD, {importance} priority)",
        })

    # Sort by importance then frequency
    importance_order = {"critical": 0, "high": 1, "medium": 2}
    action_items.sort(key=lambda x: (importance_order.get(x["importance"], 3), -x["jd_mentions"]))

    # Build domain summary
    domain_summary = []
    for domain, terms in analysis_result.get("missing_by_domain", {}).items():
        domain_summary.append({
            "domain": domain,
            "missing_count": len(terms),
            "missing_terms": terms,
        })
    domain_summary.sort(key=lambda x: x["missing_count"], reverse=True)

    report = {
        "report_metadata": {
            "generated_at": now,
            "service": "ATS Keyword Gap Analysis",
            "version": "1.0.0",
            "client_name": client_name,
            "source_resume": resume_filename,
            "target_role": job_title,
        },
        "executive_summary": {
            "ats_score": analysis_result.get("ats_score", 0),
            "match_percentage": analysis_result.get("match_percentage", 0),
            "total_jd_keywords": analysis_result.get("jd_keywords_total", 0),
            "matched_keywords": analysis_result.get("match_count", 0),
            "missing_keywords": len(analysis_result.get("missing_keywords", [])),
            "overall_assessment": _get_assessment(analysis_result.get("ats_score", 0)),
        },
        "keyword_analysis": {
            "matched": analysis_result.get("matched_keywords", []),
            "missing_by_importance": {
                "critical": [a for a in action_items if a["importance"] == "critical"],
                "high": [a for a in action_items if a["importance"] == "high"],
                "medium": [a for a in action_items if a["importance"] == "medium"],
            },
            "missing_by_domain": domain_summary,
        },
        "action_plan": {
            "immediate_actions": [a for a in action_items if a["importance"] == "critical"][:5],
            "recommended_additions": [a for a in action_items if a["importance"] == "high"][:8],
            "suggestions": analysis_result.get("suggestions", []),
        },
        "raw_analysis": analysis_result,
    }

    return report


def _get_assessment(score: int) -> str:
    """Convert numeric score to human-readable assessment."""
    if score >= 80:
        return "Excellent alignment. Minor tweaks will make your resume highly competitive."
    elif score >= 60:
        return "Good foundation. Address the critical gaps to significantly improve your match rate."
    elif score >= 40:
        return "Moderate gaps detected. Substantial resume tailoring is recommended."
    elif score >= 20:
        return "Significant gaps found. Major resume revision needed for this role."
    else:
        return "Poor alignment. Consider whether this role matches your core skill set."


# === File I/O Helpers ===

def read_text_file(filepath: str) -> str:
    """Read a text file with encoding fallback."""
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"File not found: {filepath}")
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return path.read_text(encoding="latin-1")


def write_json_report(report: Dict[str, Any], output_path: str) -> None:
    """Write report to JSON file."""
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")


# === CLI Entry Point ===

def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="fiverr_service",
        description="Fiverr ATS Analysis Service - Generate keyword gap reports for clients",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --resume resume.txt --jd "Senior Python Developer role requiring Django, AWS..."
  %(prog)s --resume resume.txt --jd-file job_posting.txt --output report.json
  %(prog)s --demo
  %(prog)s --resume resume.txt --jd-file posting.txt --job-title "Senior Engineer" --client "John"
        """,
    )

    parser.add_argument(
        "--resume", "-r",
        help="Path to the resume file (TXT or Markdown)",
    )
    parser.add_argument(
        "--jd", "-j",
        help="Job description text (inline)",
    )
    parser.add_argument(
        "--jd-file", "-f",
        help="Path to a file containing the job description",
    )
    parser.add_argument(
        "--job-title", "-t",
        default="",
        help="Target job title for context",
    )
    parser.add_argument(
        "--company", "-c",
        default="",
        help="Target company name for context",
    )
    parser.add_argument(
        "--client",
        default="",
        help="Client name for the report header",
    )
    parser.add_argument(
        "--output", "-o",
        help="Output JSON file path (default: stdout)",
    )
    parser.add_argument(
        "--api-url",
        default=DEFAULT_API_URL,
        help=f"ATS API base URL (default: {DEFAULT_API_URL})",
    )
    parser.add_argument(
        "--api-key",
        default=DEFAULT_API_KEY,
        help="ATS API key (default: from ATS_API_KEY env var)",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Run in demo mode with sample data (no API needed)",
    )
    parser.add_argument(
        "--pretty",
        action="store_true",
        default=True,
        help="Pretty-print JSON output (default: True)",
    )

    return parser


def run_demo(output_path: Optional[str]) -> int:
    """Run demo analysis using local analyzer (no API call needed)."""
    print("[DEMO MODE] Running analysis with sample data...", file=sys.stderr)

    # Import analyzer directly for demo mode
    sys.path.insert(0, str(Path(__file__).parent))
    from src.analyzer import analyze, ATSAnalysisRequest

    request = ATSAnalysisRequest(
        resume_text=DEMO_RESUME,
        job_description=DEMO_JOB_DESCRIPTION,
        job_title="Senior Full Stack Engineer",
        company="Demo Corp",
    )
    result = analyze(request)

    # Wrap in report format
    result_dict = result.to_dict()
    report = build_fiverr_report(
        result_dict,
        resume_filename="demo_resume.txt",
        job_title="Senior Full Stack Engineer",
        client_name="Demo Client",
    )

    output = json.dumps(report, indent=2, ensure_ascii=False)

    if output_path:
        write_json_report(report, output_path)
        print(f"[DEMO] Report written to: {output_path}", file=sys.stderr)
    else:
        print(output)

    return 0


def run_analysis(args: argparse.Namespace) -> int:
    """Run the full analysis pipeline."""
    # Validate inputs
    if not args.resume:
        print("Error: --resume is required (or use --demo)", file=sys.stderr)
        return 1

    # Read resume
    try:
        resume_text = read_text_file(args.resume)
    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    # Read job description
    job_description = ""
    if args.jd_file:
        try:
            job_description = read_text_file(args.jd_file)
        except FileNotFoundError as e:
            print(f"Error: {e}", file=sys.stderr)
            return 1
    elif args.jd:
        job_description = args.jd
    else:
        print("Error: Either --jd or --jd-file is required", file=sys.stderr)
        return 1

    # Connect to API
    client = ATSAPIClient(args.api_url, args.api_key)

    # Health check
    try:
        health = client.health_check()
        print(f"[INFO] API Status: {health.get('status', 'unknown')} "
              f"(v{health.get('version', '?')})", file=sys.stderr)
    except Exception as e:
        print(f"[WARN] API health check failed: {e}", file=sys.stderr)
        print("[WARN] Ensure the API is running: docker compose up", file=sys.stderr)
        return 1

    # Run analysis
    print("[INFO] Analyzing resume against job description...", file=sys.stderr)
    try:
        result = client.analyze(
            resume_text=resume_text,
            job_description=job_description,
            job_title=args.job_title,
            company=args.company,
        )
    except RuntimeError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1
    finally:
        client.close()

    # Build report
    report = build_fiverr_report(
        result,
        resume_filename=Path(args.resume).name,
        job_title=args.job_title,
        client_name=args.client,
    )

    # Output
    output = json.dumps(report, indent=2, ensure_ascii=False)

    if args.output:
        write_json_report(report, args.output)
        print(f"[INFO] Report written to: {args.output}", file=sys.stderr)
    else:
        print(output)

    return 0


def main() -> int:
    parser = create_parser()
    args = parser.parse_args()

    if args.demo:
        return run_demo(args.output)

    return run_analysis(args)


if __name__ == "__main__":
    sys.exit(main())
