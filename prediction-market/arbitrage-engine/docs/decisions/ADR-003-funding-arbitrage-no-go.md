# ADR-003: Funding Rate Arbitrage — NO-GO Decision

**Date:** 2026-08-08  
**Status:** Decided — NO-GO under current conditions  
**Decided by:** Systematic verification (data-driven)

## Context

Funding rate arbitrage exploits the difference in perpetual swap funding rates 
between two exchanges. When Exchange A has a high positive funding rate (longs pay 
shorts) and Exchange B has a low or negative rate, one can simultaneously:
- Go LONG spot + SHORT perp on Exchange B (earning the funding)
- Go SHORT perp on Exchange A (earning the higher funding)
- Net BTC/ETH exposure ≈ 0

## What We Tested

### Data Sources
- **Gate.io** (api.gateio.ws): Working. 30-day historical funding rates 
  via `/futures/usdt/funding_rate?contract={SYMBOL}&limit=100`
- **MEXC** (contract.mexc.com): Endpoint returns ALL symbols' CURRENT rates, 
  not filtered by symbol parameter. No historical endpoint available.
- **OKX**: Historical endpoint returned empty data (instrument ID format 
  issue or requires specific permissions).
- **Binance**: HTTP 451 (Unavailable for legal reasons - geographic block)
- **Bybit**: HTTP 403 (Forbidden)

### Gate.io 30-Day Funding Rate Summary

| Coin | Mean Rate/8h | Median | Annualized | Positive Periods |
|------|-------------|--------|-----------|-----------------|
| BTC  | +0.0031%    | +0.0032% | +3.4%   | 82%             |
| ETH  | +0.0025%    | +0.0022% | +2.7%   | 78%             |
| XRP  | +0.0030%    | +0.0028% | +3.3%   | 76%             |
| BNB  | +0.0030%    | +0.0030% | +3.2%   | 71%             |
| ADA  | +0.0024%    | +0.0047% | +2.6%   | 67%             |
| SOL  | +0.0000%    | -0.0001% | +0.0%   | 47%             |

### Initial Errors Found (and Fixed)

1. **MEXC symbol filter bug**: MEXC `/contract/funding_rate?symbol=ADA_USDT` 
   returns ALL symbols (1093 coins), not just ADA. This caused incorrect 
   rates to be attributed to BTC/ETH/ADA/XRP (-21.9% annualized artifact).

2. **Funding rate unit confusion**: Calculating annualization requires 
   knowing: (a) the funding interval (8h for Gate, variable for others), 
   (b) whether rate is already expressed as percentage or decimal.

### Cross-Venue Spread Snapshot (Current)

After correcting MEXC data, current Gate vs MEXC spread:

| Coin | Gate Rate | MEXC Rate | Spread/8h | Spread Annualized |
|------|-----------|-----------|-----------|-------------------|
| BTC  | +0.0033%  | +0.0063%  | +0.0030%  | +3.3%             |
| ETH  | +0.0017%  | -0.0005%  | -0.0022%  | -2.4%             |
| XRP  | +0.0085%  | -0.0007%  | -0.0092%  | -10.1%            |
| BNB  | +0.0015%  | +0.0035%  | +0.0020%  | +2.2%             |
| ADA  | -0.0058%  | +0.0031%  | +0.0089%  | +9.8%             |
| SOL  | -0.0003%  | +0.0092%  | +0.0095%  | +10.4%            |

Maximum spread: **~10% annualized** (SOL). This is broken down by:
- Entry/exit taker fees: ~0.1-0.2% per leg × 4 trades = 0.4-0.8%
- Slippage on low-depth markets: variable, 0.1-1.0%
- Capital lockup opportunity cost: varies
- Counterparty risk premium: MEXC is a mid-tier exchange

**Net spread after costs: ≈ 0% or negative for most pairs.**

## Decision: NO-GO

### Primary Reasons
1. **Cross-venue spread (max ~10% annual) barely covers costs** for most pairs.
2. **No verifiable historical spread stability** — MEXC has no public history endpoint,
   we cannot compute direction stability, max drawdown, or duration metrics.
3. **MEXC counterparty risk** — mid-tier exchange with known withdrawal friction.
4. **Single-exchange funding rates are unstable** — Gate rates fluctuate between 
   positive and negative, making "earn funding" unreliable.

### Conditions That Would Reopen This Research
- A major exchange (Binance/Bybit) becomes accessible from the deployment region
- A reliable historical cross-venue funding data source (e.g., Coinglass API)
- Market stress event that widens cross-venue spreads to >20% annualized sustained
- MEXC-tier exchange proves reliable over 6+ months of withdrawals

## Files Preserved

- `data/validated/gate_funding_history_30d.csv` — Clean 30-day Gate funding series
- `data/rejected/incorrect_mexc_rates.csv` — Record of filtering bug for future reference
- `data/raw/mexc_api_behavior.json` — Notes on MEXC API quirks
