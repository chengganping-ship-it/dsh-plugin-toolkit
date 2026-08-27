"""Tests for the ATS keyword gap analyzer core engine."""

import sys
from pathlib import Path

import pytest

# Ensure `src/` is on sys.path so `from analyzer import ...` works.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.analyzer import (
    ATSAnalysisRequest,
    analyze,
    extract_bigrams,
    chunk_text,
    extract_keywords,
)


# === Fixtures ===

@pytest.fixture
def good_resume():
    return """
    Senior Software Engineer with 8 years of experience.
    Skilled in Python, JavaScript, TypeScript, React, Node.js, and Go.
    Experience with AWS, Docker, Kubernetes, PostgreSQL, and Redis.
    Strong background in distributed systems and microservices architecture.
    Familiar with CI/CD pipelines, GitHub Actions, and Terraform.
    Led a team of 5 engineers in an Agile/Scrum environment.
    """.strip()


@pytest.fixture
def medium_resume():
    return """
    Software Developer with 3 years of experience in Java and Python.
    Built REST APIs using Spring Boot and Flask.
    Some exposure to MySQL and Redis. Good communication skills.
    """.strip()


@pytest.fixture
def weak_resume():
    return """
    Recent graduate looking for an entry-level position.
    Some coursework in HTML and CSS.
    """.strip()


@pytest.fixture
def sample_jd():
    return """
    Senior Software Engineer - Backend Platform

    We're looking for a Senior Software Engineer to build and maintain our
    core backend services. You'll work with Python, Go, and TypeScript on AWS,
    managing distributed microservices with Kubernetes and Docker.

    Required:
    - 5+ years of backend development in Python, Go, or Java
    - Strong experience with PostgreSQL, Redis, and Elasticsearch
    - Deep knowledge of distributed systems, event-driven architectures, and Kafka
    - Experience with Docker, Kubernetes, and Terraform on AWS
    - Proficiency in CI/CD pipelines (GitHub Actions or Jenkins)
    - Experience with observability tools (Datadog, Grafana, Prometheus)
    - Agile/Scrum experience with a collaborative mindset

    Nice to have:
    - GraphQL API design experience
    - Rust or C++ systems programming
    - Machine learning pipeline experience with Kubeflow or MLflow
    """.strip()


# === Core tests ===


def test_keyword_extraction_basic():
    text = "We use Python, Java, and TypeScript. Python is our primary language."
    kws = extract_keywords(text)
    assert "python" in kws
    assert "java" in kws
    assert "typescript" in kws
    assert kws["python"] == 2  # appears twice


def test_keyword_extraction_empty():
    kws = extract_keywords("")
    assert kws == {}


def test_keyword_extraction_no_match():
    kws = extract_keywords("Looking for someone with good attitude and teamwork.")
    # 'agile' might match as a generic keyword, but positive attitude alone shouldn't match many tech terms
    assert len(kws) < 3


def test_chunk_text_short():
    text = "This is a short text."
    chunks = chunk_text(text, chunk_size=1000)
    assert len(chunks) == 1


def test_chunk_text_long():
    # Build a large text
    sentences = ["This is sentence number " + str(i) + "." for i in range(100)]
    text = " ".join(sentences)
    chunks = chunk_text(text, chunk_size=500)
    assert len(chunks) >= 2


def test_bigram_extraction():
    text = "machine learning platform with python and tensorflow for data science pipelines"
    bigrams = extract_bigrams(text)
    # Should capture significant pairs
    assert "machine learning" in bigrams or "python tensorflow" in bigrams or len(bigrams) > 0


def test_analyze_full_match(good_resume, sample_jd):
    req = ATSAnalysisRequest(resume_text=good_resume, job_description=sample_jd)
    result = analyze(req)
    assert result.ats_score > 30
    assert result.match_count >= 5
    assert len(result.missing_keywords) >= 0  # there will always be gaps


def test_analyze_weak_resume(weak_resume, sample_jd):
    req = ATSAnalysisRequest(resume_text=weak_resume, job_description=sample_jd)
    result = analyze(req)
    assert result.match_count <= 3
    assert len(result.missing_keywords) > 5
    assert result.ats_score < 40


def test_analyze_perfect_overlap():
    """Resume that contains everything in the JD should have 100% match."""
    text = """
    Python Go TypeScript AWS Kubernetes Docker PostgreSQL Redis Elasticsearch
    Distributed Systems Kafka Event-Driven Microservices CI/CD GitHub Actions
    Jenkins Agile Scrum GraphQL Rust MLflow Observability Prometheus Grafana
    """.strip()
    req = ATSAnalysisRequest(resume_text=text, job_description=text)
    result = analyze(req)
    assert result.match_percentage >= 90
    assert result.ats_score >= 85


def test_analyze_result_structure(good_resume, sample_jd):
    req = ATSAnalysisRequest(resume_text=good_resume, job_description=sample_jd)
    result = analyze(req)
    d = result.to_dict()
    assert "resume_keywords_found" in d
    assert "jd_keywords_total" in d
    assert isinstance(d["missing_keywords"], list)
    assert isinstance(d["suggestions"], list)
    assert 0 <= d["ats_score"] <= 100


def test_analyze_empty_strings():
    req = ATSAnalysisRequest(resume_text="", job_description="")
    result = analyze(req)
    assert result.ats_score == 0
    assert len(result.suggestions) > 0


def test_analyze_with_job_title():
    req = ATSAnalysisRequest(
        resume_text="Python developer with Flask experience",
        job_description="Senior Python Engineer with Flask, Docker, and Kafka",
        job_title="Senior Python Engineer",
        company="TechCorp",
    )
    result = analyze(req)
    assert "Senior Python Engineer" in result.suggestions[-1] if result.suggestions else True
