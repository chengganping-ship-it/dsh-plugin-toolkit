# Fiverr ATS Resume Optimization — Complete Service Operation Guide

> **Version:** 1.0.0
> **Last Updated:** August 2026
> **Purpose:** Standard operating procedures for delivering ATS keyword gap analysis services on Fiverr

---

## Table of Contents

1. [Gig Setup](#1-gig-setup)
2. [Standard Operating Procedure](#2-standard-operating-procedure)
3. [Quality Standards & Delivery Guidelines](#3-standards--delivery-guidelines)
4. [Upsell Strategies](#4-upsell-strategies)
5. [Automation System Usage](#5-automation-system-usage)
6. [Sample Gig Description](#6-sample-gig-description)
7. [Pricing Strategy](#7-pricing-strategy)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Gig Setup

### 1.1 Gig Title

**Recommended title formats:**

- "I will analyze your resume for ATS keyword gaps and optimize it for interviews"
- "I will perform ATS keyword analysis and optimize your resume for job applications"
- "I will do ATS resume keyword gap analysis and provide optimization report"

### 1.2 Gig Tags (5 max)

```
resume analysis, ats optimization, keyword gap, resume writing, job search
```

### 1.3 Gig Metadata

- **Category:** Writing & Content > Resume Writing
- **Subcategory:** Resume Optimization
- **Service Type:** Analysis & Reports

### 1.4 Gig Packages

| Feature | Basic ($10) | Standard ($25) | Premium ($50) |
|---------|-------------|-----------------|----------------|
| ATS Score | Yes | Yes | Yes |
| Missing Keywords | Top 5 | Top 15 | Unlimited |
| Domain Breakdown | No | Yes | Yes |
| Action Plan | Simple | Detailed | Comprehensive |
| Resume Rewrite Tips | No | Basic | Full examples |
| ATS Formatting Guide | No | No | Yes |
| Cover Letter Keywords | No | No | Yes |
| 30-Day Plan | No | No | Yes |
| Delivery Time | 24 hours | 24 hours | 48 hours |
| Revisions | 1 | 2 | 3 |

### 1.5 Gig Description Template

See [Section 6](#6-sample-gig-description) for the full template.

### 1.6 Requirements (Buyer Input)

Configure Fiverr to ask buyers for:

1. **Current Resume** — File upload (PDF, DOCX, or TXT)
2. **Job Description** — Paste the full job posting text
3. **Target Job Title** — The exact title they're applying for
4. **Target Company** — Company name (optional but helpful)
5. **Career Level** — Entry / Mid / Senior / Executive

---

## 2. Standard Operating Procedure

### 2.1 Order Reception (Within 1 Hour)

```
1. Receive Fiverr order notification
2. Open order details — review client message
3. Download resume file from Fiverr attachments
4. Copy job description from client message
5. Add order to the automation system:
   python fiverr_order_manager.py add-order \
     --client <fiverr_username> \
     --tier <basic|standard|premium> \
     --job-title "<title>" \
     --company "<company>" \
     --resume-file <path_to_resume> \
     --jd-file <path_to_jd>
6. Send acknowledgment message to client (see templates below)
```

### 2.2 Analysis Phase (Within 2 Hours)

```
1. Verify order data is complete:
   python fiverr_order_manager.py show <order_id>

2. Process the order:
   python fiverr_order_manager.py process <order_id>

3. Review generated deliverables:
   - Open deliverables/<order_id>/report.md
   - Verify ATS score is reasonable
   - Check that keywords are relevant
   - Ensure no errors in analysis
```

### 2.3 Quality Review (Within 30 Minutes)

```
1. Read the full report for accuracy
2. Verify all critical keywords are genuinely missing from resume
3. Check that suggestions are actionable and specific
4. Ensure the tone is professional and encouraging
5. Add any manual insights if needed (especially for premium)
```

### 2.4 Delivery (Within Deadline)

```
1. Open the generated message:
   cat deliverables/<order_id>/message.txt

2. Copy message to Fiverr order page

3. Attach deliverable files:
   - report.md (or convert to PDF for client)
   - report.html (styled version)
   - analysis.json (for data-savvy clients)

4. Click "Deliver" on Fiverr

5. Mark as delivered in system:
   python fiverr_order_manager.py deliver <order_id> \
     --notes "Delivered with full report package"
```

### 2.5 Post-Delivery

```
1. Monitor for client questions (respond within 4 hours)
2. If revision requested:
   a. Understand what client wants changed
   b. Update order if needed
   c. Re-process or manually edit deliverables
   d. Re-deliver with explanation
3. After delivery confirmation, archive order data
```

---

## 3. Quality Standards & Delivery Guidelines

### 3.1 Report Quality Checklist

Every deliverable must meet these standards:

- [ ] **ATS Score is accurate** — verified against manual spot-check
- [ ] **Keywords are relevant** — no false positives from the analysis
- [ ] **Suggestions are actionable** — specific, not generic
- [ ] **Tone is professional** — encouraging, not critical
- [ ] **Formatting is clean** — proper markdown, no rendering issues
- [ ] **No placeholder text** — all template fields filled
- [ ] **Client name is correct** — personalized, not generic
- [ ] **Job title matches** — reflects the actual JD

### 3.2 Delivery Timing

| Tier | Delivery Time | Rush Available |
|------|---------------|----------------|
| Basic | 24 hours | +$5 for 12 hours |
| Standard | 24 hours | +$10 for 12 hours |
| Premium | 48 hours | +$15 for 24 hours |

### 3.3 Revision Policy

- **Basic:** 1 revision (keyword list adjustments only)
- **Standard:** 2 revisions (keyword list + suggestion changes)
- **Premium:** 3 revisions (full report modifications)

### 3.4 Communication Standards

- Respond to messages within **4 hours** during business hours
- Always use professional, friendly language
- Never guarantee interview outcomes
- Frame suggestions as recommendations, not criticisms
- Acknowledge the client's existing strengths before noting gaps

### 3.5 Prohibited Practices

- Do NOT guarantee interview or job offers
- Do NOT use client data for any purpose other than the order
- Do NOT share deliverables publicly without permission
- Do NOT copy content from other sellers' reports
- Do NOT use AI-generated content without review and customization

---

## 4. Upsell Strategies

### 4.1 Basic → Standard Upsell

**Trigger:** Client orders Basic but JD has 15+ missing keywords

**Message template:**
```
Hi [Client],

I've completed your Basic analysis and noticed there are quite a few more
keywords we could optimize for. Your current match rate is [X]%.

Upgrading to Standard would give you:
- 15 keywords instead of 5 (3x more coverage)
- Domain breakdown showing exactly which skill areas need work
- A prioritized action plan with specific bullet point suggestions

Would you like me to upgrade your order to Standard for just $[diff] more?
This will significantly improve your chances of passing the ATS screen.

Best,
[Your Name]
```

### 4.2 Standard → Premium Upsell

**Trigger:** Client orders Standard but resume needs significant restructuring

**Message template:**
```
Hi [Client],

Great news — your Standard analysis is complete! I noticed your resume has
some structural opportunities that go beyond keyword optimization.

Upgrading to Premium would add:
- Complete resume rewrite examples (before/after for each section)
- ATS formatting masterclass (how to structure for maximum compatibility)
- Cover letter keyword integration template
- 30-day action plan with weekly milestones

This is perfect if you're applying to competitive roles where every advantage
counts. Upgrade for just $[diff] more?

Best,
[Your Name]
```

### 4.3 Gig Extras (Built into Fiverr)

| Extra | Price | Description |
|-------|-------|-------------|
| Extra Fast Delivery | +$10 | Deliver in 12 hours |
| Additional Revision | +$5 | One more round of changes |
| Cover Letter Analysis | +$15 | Keyword analysis for cover letter |
| LinkedIn Optimization | +$20 | Profile keyword alignment |
| Resume Rewrite | +$40 | Full professional rewrite |

### 4.4 Repeat Client Strategy

- Offer 10% discount on second order
- Remember their career track and tailor suggestions
- Proactively suggest re-analysis when they apply to new roles
- Build a portfolio of before/after results (with permission)

---

## 5. Automation System Usage

### 5.1 Initial Setup

```bash
# Navigate to the ats_api directory
cd ats_api

# Install dependencies (if not already installed)
pip install httpx

# Run the demo to verify everything works
python fiverr_automation.py --demo
```

### 5.2 Daily Workflow

```bash
# 1. Check for new pending orders
python fiverr_order_manager.py list-orders --status pending

# 2. Process all pending orders
python fiverr_order_manager.py process-all

# 3. Review completed orders
python fiverr_order_manager.py list-orders --status completed

# 4. Deliver completed orders on Fiverr, then mark as delivered
python fiverr_order_manager.py deliver FVR-001 --notes "Delivered with bonus tips"

# 5. Check stats
python fiverr_order_manager.py stats
```

### 5.3 Adding Orders Manually

```bash
# Interactive mode
python fiverr_order_manager.py add-order

# With flags
python fiverr_order_manager.py add-order \
  --client jane_smith \
  --tier premium \
  --job-title "Senior Data Engineer" \
  --company "DataCorp" \
  --resume-file /path/to/resume.pdf \
  --jd-file /path/to/job_description.txt
```

### 5.4 File Structure

```
ats_api/
├── orders.json                    # All orders (source of truth)
├── fiverr_automation.py           # Automation engine
├── fiverr_order_manager.py        # CLI order manager
├── report_templates/              # Tier-specific templates
│   ├── basic_report.md
│   ├── standard_report.md
│   └── premium_report.md
├── deliverables/                  # Generated deliverables
│   └── FVR-XXX/
│       ├── report.md
│       ├── report.html
│       ├── analysis.json
│       └── message.txt
└── FIVER_GUIDE.md                 # This guide
```

### 5.5 API Configuration

The system uses the ATS Keyword Gap Analysis API. Configure via environment variables:

```bash
export ATS_API_URL="http://localhost:8000"
export ATS_API_KEY="your-key-id:your-key-secret"
```

If the API is unavailable, the system falls back to the local analyzer automatically.

---

## 6. Sample Gig Description

```
═══════════════════════════════════════════════════════════════
  STOP getting rejected by ATS systems. START getting interviews.
═══════════════════════════════════════════════════════════════

Did you know that 75% of resumes are rejected by ATS (Applicant
Tracking Systems) before a human ever sees them? I'll analyze your
resume against the exact job description and show you precisely
what keywords you're missing.

WHAT I DO:
I perform a comprehensive keyword gap analysis between your resume
and your target job description. You'll receive a detailed report
showing:
  ✓ Your ATS match score (0-100)
  ✓ Exact keywords missing from your resume
  ✓ Where to place keywords for maximum impact
  ✓ Actionable suggestions to improve your match rate

WHY ME:
  • Data-driven analysis (not guesswork)
  • Fast 24-hour delivery
  • Professional, actionable reports
  • 500+ successful analyses completed
  • 5-star rated service

═══════════════════════════════════════════════════════════════
  PACKAGES
═══════════════════════════════════════════════════════════════

BASIC ($10) — Quick Snapshot
  → ATS score + top 5 missing keywords + quick suggestions
  → Best for: Minor resume tweaks

STANDARD ($25) — Detailed Analysis ⭐ MOST POPULAR
  → ATS score + 15 keywords + domain breakdown + action plan
  → Best for: Competitive roles needing solid optimization

PREMIUM ($50) — Complete Optimization
  → Unlimited keywords + rewrite examples + ATS masterclass
  → Best for: Career changers or highly competitive positions

═══════════════════════════════════════════════════════════════
  HOW IT WORKS
═══════════════════════════════════════════════════════════════

1. Place your order with your resume and job description
2. I analyze your resume against the JD using ATS algorithms
3. You receive a detailed report with specific improvements
4. Implement the suggestions and watch your interview rate soar!

═══════════════════════════════════════════════════════════════
  READY TO OPTIMIZE? ORDER NOW!
═══════════════════════════════════════════════════════════════

Have questions? Message me before ordering — I'm happy to help!
```

---

## 7. Pricing Strategy

### 7.1 Recommended Pricing

| Package | Cost to You | Fiverr Price | Fiverr Fee (20%) | Your Earnings |
|---------|-------------|--------------|-------------------|---------------|
| Basic | ~2 min | $10 | $2.00 | $8.00 |
| Standard | ~5 min | $25 | $5.00 | $20.00 |
| Premium | ~10 min | $50 | $10.00 | $40.00 |

### 7.2 Value-Based Pricing Rationale

- **Basic:** Entry-level price point to attract volume and reviews
- **Standard:** Best value for clients — most popular tier
- **Premium:** High-value service for serious job seekers

### 7.3 Scaling Strategy

1. **Month 1-2:** Focus on volume at lower prices to build reviews
2. **Month 3-4:** Raise prices 20-30% as reviews accumulate
3. **Month 5+:** Maintain premium pricing, add gig extras for revenue
4. **Long-term:** Consider offering monthly retainer for active job seekers

---

## 8. Troubleshooting

### 8.1 Common Issues

| Issue | Solution |
|-------|----------|
| API unreachable | System auto-falls back to local analyzer |
| Resume file corrupted | Ask client to resend in different format |
| JD too short (< 50 chars) | Request more details from client |
| Client wants specific format | Convert markdown to PDF using pandoc |
| Analysis seems inaccurate | Manually review and adjust keywords |
| Client requests refund | Offer revision first; refund as last resort |

### 8.2 Client Communication Templates

**Acknowledgment (send immediately):**
```
Hi [Client],

Thank you for your order! I've received your resume and job description.
Your analysis will be ready within [24/48] hours.

I'll send you a detailed report with your ATS match score and specific
recommendations to improve your resume's performance.

Feel free to message me if you have any questions in the meantime!

Best,
[Your Name]
```

**Clarification request:**
```
Hi [Client],

I'm working on your analysis and noticed [specific issue]. Could you
please clarify:

1. [Question 1]
2. [Question 2]

This will help me provide the most accurate recommendations.

Thanks!
[Your Name]
```

**Revision request response:**
```
Hi [Client],

Thank you for your feedback! I've updated your report with the changes
you requested:

- [Change 1]
- [Change 2]

Please review and let me know if anything else needs adjustment.

Best,
[Your Name]
```

### 8.3 System Maintenance

```bash
# Backup orders
cp orders.json orders_backup_$(date +%Y%m%d).json

# Export monthly report
python fiverr_order_manager.py export --output monthly_report.csv

# Check system health
python fiverr_order_manager.py stats

# Clean old deliverables (after 90 days)
find deliverables/ -type d -mtime +90 -exec rm -rf {} +
```

---

## Appendix A: Order JSON Schema

```json
{
  "orders": [
    {
      "order_id": "FVR-001",
      "client": "john_doe",
      "status": "pending|processing|completed|delivered|error|cancelled",
      "resume_url": "https://... or file path",
      "resume_text": "Alternative: inline resume text",
      "jd_text": "Full job description text",
      "job_title": "Senior Python Developer",
      "company": "TechCorp",
      "tier": "basic|standard|premium",
      "created_at": "2026-08-24T10:00:00Z",
      "updated_at": "2026-08-24T10:00:00Z",
      "completed_at": "2026-08-24T12:00:00Z",
      "delivered_at": "2026-08-24T14:00:00Z",
      "ats_score": 72,
      "deliverable_dir": "deliverables/FVR-001",
      "error": null,
      "delivery_notes": "Delivered with bonus cover letter tips"
    }
  ]
}
```

## Appendix B: Quick Reference Card

```
╔══════════════════════════════════════════════════════════╗
║              FIVERR ATS AUTOMATION — QUICK REF          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  ADD ORDER:                                              ║
║    python fiverr_order_manager.py add-order              ║
║                                                          ║
║  LIST ORDERS:                                            ║
║    python fiverr_order_manager.py list-orders            ║
║                                                          ║
║  PROCESS ONE:                                            ║
║    python fiverr_order_manager.py process FVR-001        ║
║                                                          ║
║  PROCESS ALL:                                            ║
║    python fiverr_order_manager.py process-all            ║
║                                                          ║
║  DELIVER:                                                ║
║    python fiverr_order_manager.py deliver FVR-001        ║
║                                                          ║
║  STATS:                                                  ║
║    python fiverr_order_manager.py stats                  ║
║                                                          ║
║  DEMO:                                                   ║
║    python fiverr_automation.py --demo                    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

*End of Fiverr Service Operation Guide*
