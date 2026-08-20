"""
ATS Keyword Gap Analysis API — Main FastAPI Application.

Provides endpoints for programmatic ATS keyword analysis between
resumes and job descriptions. Designed for machine-to-machine
automation (agents, CI pipelines, browser extensions).
"""

from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, Header, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .config import get_settings, DEFAULT_API_KEY_ID, DEFAULT_API_KEY_SECRET
from .auth import verify_api_key, get_tier_for_key
from .analyzer import analyze, ATSAnalysisRequest

# In-memory call tracking (persist to SQLite in production)
_call_log: list[dict] = []

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Automated ATS keyword gap analysis for job seekers and recruiters. "
        "Upload a resume and job description, receive detailed keyword "
        "match analysis, missing terms, domain breakdown, and actionable suggestions."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# === Pydantic Models ===

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="Plain text content of the candidate's resume.", min_length=50)
    job_description: str = Field(..., description="Plain text of the job posting.", min_length=50)
    job_title: str = Field("", description="Optional job title for context.")
    company: str = Field("", description="Optional company name for context.")


class HealthResponse(BaseModel):
    status: str
    version: str
    uptime_seconds: float


class QuotaResponse(BaseModel):
    tier: str
    calls_made: int
    calls_remaining: int
    limit_per_month: int
    price_per_request_cents: int


# === Startup Time ===
_startup_time = time.time()


# === Endpoints ===

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Service health check."""
    return HealthResponse(
        status="ok",
        version=settings.APP_VERSION,
        uptime_seconds=round(time.time() - _startup_time, 2),
    )


@app.post("/analyze", dependencies=[Depends(verify_api_key)])
async def analyze_endpoint(req: AnalyzeRequest):
    """
    Perform ATS keyword gap analysis.

    Requires X-API-Key header. Returns structured analysis including:
    - `match_percentage`: % of JD keywords found in resume
    - `missing_keywords`: Keywords in JD but not in resume (with domain & importance)
    - `matched_keywords`: Keywords found in both
    - `ats_score`: 0-100 overall match score
    - `suggestions`: Actionable recommendations
    """
    try:
        analysis_req = ATSAnalysisRequest(
            resume_text=req.resume_text,
            job_description=req.job_description,
            job_title=req.job_title,
            company=req.company,
        )
        result = analyze(analysis_req)

        response = result.to_dict()
        response["request_id"] = str(uuid.uuid4())
        response["timestamp"] = datetime.now(timezone.utc).isoformat()

        return response

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "analysis_failed", "message": str(e)},
        )


@app.post("/analyze/file", dependencies=[Depends(verify_api_key)])
async def analyze_file_endpoint(
    resume_file: UploadFile = File(..., description="Resume file (TXT, Markdown)"),
    job_description: str = Form(..., description="Plain text of the job posting."),
    job_title: str = Form(""),
    company: str = Form(""),
):
    """Analyze a resume file upload against a job description."""
    content = await resume_file.read()
    try:
        resume_text = content.decode("utf-8")
    except UnicodeDecodeError:
        resume_text = content.decode("latin-1")

    req = AnalyzeRequest(
        resume_text=resume_text,
        job_description=job_description,
        job_title=job_title,
        company=company,
    )
    # Delegate to the main analyze handler
    return await analyze_endpoint(req)


@app.get("/quota", dependencies=[Depends(verify_api_key)])
async def get_quota(x_api_key: str = Header(None)):
    """Check your current usage quota and tier."""
    key_id = x_api_key.strip() if x_api_key else ""
    tier = get_tier_for_key(key_id)
    limit = get_settings().TIER_LIMITS.get(tier, 0)
    price = get_settings().TIER_PRICES.get(tier, 0)

    # Count calls for this key in current period
    calls_made = len(_call_log)
    remaining = max(0, limit - calls_made) if limit >= 0 else -1

    return QuotaResponse(
        tier=tier,
        calls_made=calls_made,
        calls_remaining=remaining,
        limit_per_month=limit,
        price_per_request_cents=price,
    )


@app.get("/", dependencies=[Depends(verify_api_key)])
async def root():
    """Root with quick instructions."""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "endpoints": {
            "POST /analyze": "Analyze resume text vs job description",
            "POST /analyze/file": "Analyze uploaded resume file vs JD",
            "GET /quota": "Check usage and tier",
            "GET /health": "Service health check",
        },
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
