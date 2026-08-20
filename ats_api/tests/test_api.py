"""Integration tests for the ATS API FastAPI endpoints."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient

from src.main import app
from src.config import DEFAULT_API_KEY_ID


client = TestClient(app)


# === Auth tests ===

def test_health_no_auth():
    """/health should not require auth."""
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"


def test_analyze_requires_auth():
    """POST /analyze should return 401 if no X-API-Key."""
    r = client.post("/analyze", json={
        "resume_text": "test " * 100,
        "job_description": "test " * 100,
    })
    assert r.status_code in (401, 403, 422)


def test_analyze_invalid_key():
    """POST /analyze with invalid key returns 403."""
    r = client.post(
        "/analyze",
        headers={"X-API-Key": "bogus-key"},
        json={
            "resume_text": "test " * 100,
            "job_description": "test " * 100,
        },
    )
    assert r.status_code == 403


def test_analyze_valid_key():
    """POST /analyze with valid key should return 200."""
    r = client.post(
        "/analyze",
        headers={"X-API-Key": DEFAULT_API_KEY_ID},
        json={
            "resume_text": "Python developer with 5 years of experience. "
                           "Skilled in Python, Java, AWS, Docker, Kubernetes...",
            "job_description": "Senior Backend Engineer. Must have Python, Go, "
                               "Kubernetes, Docker, PostgreSQL, Kafka, Redis. "
                               "AWS experience required.",
            "job_title": "Senior Backend Engineer",
        },
    )
    assert r.status_code == 200, f"Got {r.status_code}: {r.text}"
    data = r.json()
    assert "ats_score" in data
    assert "match_percentage" in data
    assert "missing_keywords" in data
    assert "suggestions" in data
    assert isinstance(data["ats_score"], int)


def test_analyze_too_short_text():
    """Short text should trigger validation errors."""
    r = client.post(
        "/analyze",
        headers={"X-API-Key": DEFAULT_API_KEY_ID},
        json={"resume_text": "short", "job_description": "also short"},
    )
    assert r.status_code == 422


def test_analyze_missing_fields():
    """Missing required fields should return 422."""
    r = client.post(
        "/analyze",
        headers={"X-API-Key": DEFAULT_API_KEY_ID},
        json={"resume_text": "x" * 100},  # missing job_description
    )
    assert r.status_code == 422


def test_quota_endpoint():
    """GET /quota requires valid key and returns quota data."""
    r = client.get("/quota", headers={"X-API-Key": DEFAULT_API_KEY_ID})
    assert r.status_code == 200
    data = r.json()
    assert "tier" in data
    assert "calls_made" in data
    assert "price_per_request_cents" in data


def test_root_endpoint():
    """GET / with auth returns service info."""
    r = client.get("/", headers={"X-API-Key": DEFAULT_API_KEY_ID})
    assert r.status_code == 200
    data = r.json()
    assert "service" in data
    assert "endpoints" in data
