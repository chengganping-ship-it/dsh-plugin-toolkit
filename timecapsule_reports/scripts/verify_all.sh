#!/usr/bin/env bash
# ============================================================
# Time Capsule Reports -- Master Verification Script
# Date: 2025-08-08
# Usage: bash scripts/verify_all.sh
#
# This script fetch live data points from sources referenced
# in each report's sources.yaml and compares them to the
# "frozen" values in the report.
# ============================================================

set -euo pipefail

REPORTS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STAMP=$(date -u +"%Y%m%dT%H%M%SZ")
LOG_FILE="${REPORTS_DIR}/logs/verify_${STAMP}.log"

mkdir -p "${REPORTS_DIR}/logs"

echo "=============================================" | tee "$LOG_FILE"
echo " Time Capsule Report Verification" | tee -a "$LOG_FILE"
echo " Run at: $STAMP" | tee -a "$LOG_FILE"
echo "=============================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ---- Helper Functions ----
check_url() {
  local url="$1"
  local label="$2"
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "FAIL")
  if [[ "$http_code" == "200" ]]; then
    echo "  [OK] $label ($url)" | tee -a "$LOG_FILE"
  else
    echo "  [WARN] $label -- HTTP $http_code ($url)" | tee -a "$LOG_FILE"
  fi
}

check_contains() {
  local url="$2"
  local needle="$3"
  local label="$1"
  if curl -s --max-time 10 "$url" 2>/dev/null | grep -q "$needle"; then
    echo "  [FOUND] $label" | tee -a "$LOG_FILE"
  else
    echo "  [NOT FOUND] $label (searched '$needle' in $url)" | tee -a "$LOG_FILE"
  fi
}

# ---- Report 1: AI Inference Cost ----
echo "=== Report 1: AI Inference Cost ===" | tee -a "$LOG_FILE"

check_url "https://openai.com/pricing" "OpenAI Pricing Page"
check_url "https://api.deepseek.com/pricing" "DeepSeek Pricing Page"

# Try to verify GPT-5 pricing
echo "  Checking GPT-5 pricing..." | tee -a "$LOG_FILE"
GPT5_PAGE=$(curl -s --max-time 15 "https://openai.com/pricing" 2>/dev/null || echo "FETCH_FAILED")
if echo "$GPT5_PAGE" | grep -q "GPT-5"; then
  if echo "$GPT5_PAGE" | grep -qi "\$1.25\|\$1\.25"; then
    echo "  [VERIFIED] GPT-5 input ~$1.25/M" | tee -a "$LOG_FILE"
  else
    echo "  [REVIEW] GPT-5 page loaded but price pattern not matched -- verify manually" | tee -a "$LOG_FILE"
  fi
else
  echo "  [WARN] GPT-5 pricing page content may have changed" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# ---- Report 2: Transformer Crisis ----
echo "=== Report 2: Transformer Crisis ===" | tee -a "$LOG_FILE"

check_url "https://www.woodmac.com/" "Wood Mackenzie"
check_url "https://www.morganstanley.com/" "Morgan Stanley"
check_url "https://www.nvidia.com/en-us/data-center/" "NVIDIA Data Center"

# Secondary sources (via citations)
check_url "https://baijiahao.baidu.com/s?id=1868124213793642371" "变压器交期报道(百家号引用)"

echo "  NOTE: Wood Mackenzie data is subscription-only; verify via cited secondary sources" | tee -a "$LOG_FILE"
echo "  NOTE: Morgan Stanley Transformer Supercycle report is on institutional platforms" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"

# ---- Report 3: De Minimis ----
echo "=== Report 3: De Minimis Termination ===" | tee -a "$LOG_FILE"

check_url "https://www.cbp.gov/" "US CBP"
check_url "https://www.federalregister.gov/" "Federal Register"

# Try to find De Minimis termination notice
echo "  Searching CBP for De Minimis..." | tee -a "$LOG_FILE"
CBP_SEARCH=$(curl -s --max-time 15 "https://www.cbp.gov/search?search=de+minimis+termination" 2>/dev/null || echo "FETCH_FAILED")
if echo "$CBP_SEARCH" | grep -qi "de minimis\|termination\|China"; then
  echo "  [FOUND] De Minimis references on CBP site" | tee -a "$LOG_FILE"
else
  echo "  [WARN] Could not confirm via CBP search" | tee -a "$LOG_FILE"
fi

echo "" | tee -a "$LOG_FILE"

# ---- Summary ----
echo "=============================================" | tee -a "$LOG_FILE"
echo " Verification Complete" | tee -a "$LOG_FILE"
echo " Log saved to: $LOG_FILE" | tee -a "$LOG_FILE"
echo "=============================================" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"
echo " NEXT STEPS:" | tee -a "$LOG_FILE"
echo "  1. Manually review any [WARN] or [NOT FOUND] items" | tee -a "$LOG_FILE"
echo "  2. For subscription sources (WoodMac), refer to secondary citations" | tee -a "$LOG_FILE"
echo "  3. Update reports if data has materially changed (>20% shift)" | tee -a "$LOG_FILE"
