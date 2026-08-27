# ATS Keyword Gap API - Deployment & Integration Guide

Production-ready API for automated ATS keyword gap analysis between resumes and job descriptions. Built with FastAPI, containerized with Docker, and designed for Fiverr service delivery.

---

## Quick Start

### Prerequisites

- Docker Engine 24.0+
- Docker Compose v2.0+

### 1. Launch the API

```bash
cd ats_api/
docker compose up --build -d
```

The API will be available at `http://localhost:8000`.

### 2. Verify Health

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime_seconds": 3.21
}
```

### 3. Interactive Documentation

Open `http://localhost:8000/docs` in your browser for the Swagger UI.

---

## API Usage

### Authentication

All endpoints (except `/health`) require the `X-API-Key` header.

**Default dev key:** `dev-key-id:dev-key-secret`

### Analyze Resume vs Job Description

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key-id:dev-key-secret" \
  -d '{
    "resume_text": "Experienced Python developer with 5 years in Django, FastAPI, AWS, Docker...",
    "job_description": "We are hiring a Senior Python Engineer. Requirements: Python, Django, AWS, Kubernetes, PostgreSQL...",
    "job_title": "Senior Python Engineer",
    "company": "Acme Corp"
  }'
```

**Response:**

```json
{
  "resume_keywords_found": ["python", "django", "fastapi", "aws", "docker"],
  "jd_keywords_total": 8,
  "match_count": 5,
  "match_percentage": 62.5,
  "missing_keywords": [
    {
      "term": "kubernetes",
      "jd_frequency": 3,
      "in_resume": false,
      "domain": "cloud_devops",
      "importance": "critical"
    }
  ],
  "missing_by_domain": {
    "cloud_devops": ["kubernetes"],
    "database": ["postgresql"]
  },
  "matched_keywords": ["python", "django", "fastapi", "aws", "docker"],
  "suggestions": [
    "Critical gap: The JD prominently mentions [kubernetes] but your resume lacks these..."
  ],
  "ats_score": 58,
  "request_id": "a1b2c3d4-...",
  "timestamp": "2025-01-15T10:30:00+00:00"
}
```

### File Upload Analysis

```bash
curl -X POST http://localhost:8000/analyze/file \
  -H "X-API-Key: dev-key-id:dev-key-secret" \
  -F "resume_file=@/path/to/resume.txt" \
  -F "job_description=We are hiring a Senior Python Engineer..." \
  -F "job_title=Senior Python Engineer"
```

### Check Quota

```bash
curl http://localhost:8000/quota \
  -H "X-API-Key: dev-key-id:dev-key-secret"
```

---

## Fiverr Integration Guide

### Service Workflow

1. **Client submits** their resume (TXT/PDF copy-paste) and the job description URL or text.
2. **Run the analysis** using `fiverr_service.py`:
   ```bash
   python fiverr_service.py \
     --resume client_resume.txt \
     --jd-file job_posting.txt \
     --job-title "Senior Full Stack Engineer" \
     --client "John D." \
     --output reports/john_d_report.json
   ```
3. **Deliver the JSON report** to the client, or convert it to a formatted PDF/Word document.

### Demo Mode (No API Required)

Test the service with built-in sample data:

```bash
python fiverr_service.py --demo --output demo_report.json
```

### CLI Reference

| Flag | Description |
|------|-------------|
| `--resume`, `-r` | Path to resume file (required) |
| `--jd`, `-j` | Job description text (inline) |
| `--jd-file`, `-f` | Path to job description file |
| `--job-title`, `-t` | Target job title |
| `--company`, `-c` | Target company name |
| `--client` | Client name for report header |
| `--output`, `-o` | Output JSON file path |
| `--api-url` | API base URL (default: `http://localhost:8000`) |
| `--api-key` | API key (default: env var or dev key) |
| `--demo` | Run with sample data |

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ATS_API_URL` | API base URL | `http://localhost:8000` |
| `ATS_API_KEY` | API key for authentication | `dev-key-id:dev-key-secret` |
| `ATS_API_KEYS` | Comma-separated `key_id:secret` pairs (server) | dev + test keys |
| `ATS_KEY_TIERS` | Comma-separated `key_id:tier` mappings (server) | dev=pro, test=basic |

---

## Pricing Suggestions

Based on analysis depth and delivery format:

| Tier | Deliverable | Price |
|------|-------------|-------|
| **Basic** | JSON report with keyword gaps and match score | $15 |
| **Standard** | JSON report + formatted PDF summary + top 10 action items | $20 |
| **Premium** | Standard + rewritten resume bullets incorporating missing keywords | $30 |
| **Add-on** | Additional job description comparison (per extra JD) | $5 |

### Value Proposition

- Faster than manual keyword comparison (30 seconds vs 30+ minutes)
- Data-driven resume optimization
- Objective match scoring (0-100)
- Domain-specific gap identification

---

## Production Deployment

### Security Checklist

- [ ] Change default API keys (`ATS_API_KEYS` env var)
- [ ] Use HTTPS (reverse proxy with nginx/traefik)
- [ ] Set up rate limiting (configure `ATS_RATE_LIMIT_PER_MINUTE`)
- [ ] Replace in-memory call log with SQLite/PostgreSQL
- [ ] Enable request logging and monitoring
- [ ] Rotate API keys quarterly

### Recommended Stack

```
[Cloudflare] -> [nginx/traefik :443] -> [ats-api :8000]
                     |
              [SSL termination]
```

### Docker Compose for Production

```yaml
# Override with docker-compose.prod.yml
services:
  ats-api:
    environment:
      - ATS_API_KEYS=${PROD_KEY_ID}:${PROD_SECRET}
      - ATS_KEY_TIERS=${PROD_KEY_ID}:pro
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"
```

### Scaling

The API is stateless (except for the in-memory call log). For horizontal scaling:

1. Replace `_call_log` with Redis or a database
2. Deploy multiple containers behind a load balancer
3. Use `docker compose up --scale ats-api=3`

---

## Project Structure

```
ats_api/
├── Dockerfile              # Multi-stage build (python:3.12-slim)
├── docker-compose.yml      # Service orchestration
├── .dockerignore           # Build context exclusions
├── requirements.txt        # Python dependencies
├── fiverr_service.py       # CLI tool for Fiverr delivery
├── README_DEPLOY.md        # This file
└── src/
    ├── __init__.py
    ├── main.py             # FastAPI application & endpoints
    ├── analyzer.py         # Core keyword analysis engine
    ├── auth.py             # API key verification
    └── config.py           # Settings & skill taxonomy
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Connection refused` on port 8000 | Ensure containers are running: `docker compose ps` |
| `401 Unauthorized` | Include `X-API-Key` header in requests |
| `403 Forbidden` | API key is invalid; check `ATS_API_KEYS` env var |
| Analysis returns empty results | Ensure resume and JD are at least 50 characters |
| Container won't start | Check logs: `docker compose logs ats-api` |

---

## License

MIT License. Use freely for commercial and personal projects.
