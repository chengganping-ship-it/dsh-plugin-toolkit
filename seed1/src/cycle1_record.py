import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent / "src"))
import journal as J

# ---- Cycle 1: SCAN findings ----
J.record(
    cycle=1, phase="scan",
    decision="marketplace candidates evaluated: Fiverr / Etsy / PromptBase / Creative Market",
    rationale=(
        "Etsy: RULED OUT — platform purged ~30k China-mainland shops opened via Payoneer loophole "
        "by 2026-06-04; no compliant entry channel for mainland individuals exists. "
        "PromptBase: payout requires Stripe; Stripe individual accounts from China are effectively "
        "unusable (frozen/limited), needs overseas LLC — too heavy for $100 capital. "
        "Creative Market: seller application is curated, slow approval, payout PayPal (China personal "
        "PayPal accounts are high freeze risk). "
        "Fiverr: open to China sellers, payout via Payoneer (supported), traffic comes from the "
        "marketplace itself — no audience needed. Prior failed attempt (fiverr_state.json, captcha "
        "war during seller onboarding) teaches: signature steps belong to the human, not to automation."
    ),
    evidence_sources=[
        "Etsy purge: finance.sina.com.cn 2026-05-28; cifnews.com/article/186324",
        "Stripe/PayPal China constraints: zhihu 2026 payout comparison guide",
        "Fiverr seller onboarding pages (fiverr.com/start_selling)",
    ],
)

# ---- Cycle 1: JUDGMENT ----
J.record(
    cycle=1, phase="judge",
    decision="FIRST VENUE = Fiverr. FIRST GIG = ATS resume keyword-gap analysis & rewrite (targeted at a specific job description), entry price $15-25, 48h delivery.",
    rationale=(
        "1) Only venue where $100 capital + zero audience + China identity can legally sell with "
        "built-in buyer traffic. 2) Delivery is ~90% AI-executable (JD parse -> keyword gap -> "
        "rewrite), human bottleneck only at final QA. 3) User memory already flags ATS keyword-gap "
        "analysis as a pre-validated direction with a full prompt kit on disk (AI_Job_Search_Kit/). "
        "4) Low price point lowers first-buyer friction for a zero-review account; first goal is "
        "ONE real order with evidence, not margin. 5) Competitive moat is honesty: fast delivery "
        "and per-JD specificity, both are AI comparative advantages."
    ),
)

# ---- Cycle 1: ACTION assigned ----
J.record(
    cycle=1, phase="act",
    decision="HANDOFF TO HUMAN (signature-only): complete Fiverr seller onboarding manually (email, profile, payout=Payoneer). AI prepares all gig copy, pricing, FAQ, portfolio samples offline so onboarding is a 20-minute typing job.",
    rationale=(
        "Prior automation attempt died at captcha/anti-bot. Contract law: signature actions belong "
        "to the human. Everything that is NOT signature (gig title, description, 3-tier pricing, "
        "FAQ, 2 sample deliverables) will be prepared by the entity and staged in gigs/ folder "
        "before the human sits down."
    ),
)
print("cycle 1 journal entries written")
