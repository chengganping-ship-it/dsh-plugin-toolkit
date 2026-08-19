# ADR-004: Gate.io 现货—交割合约基差套利 NO-GO

**Date**: 2026-08-08
**Status**: ACCEPTED (Direction 4 falsified)
**Decider**: solo operator + AI co-analysis
**Scope**: Gate.io spot vs. quarterly delivery futures — "buy spot, short delivery, carry to expiry" basis strategy

---

## Context

Direction 4 was the most promising of the four crypto arb avenues after the previous three failed:

1. Polymarket intra-market arb → falsified (CTF enforces YES+NO=1.0000)
2. Polymarket ↔ Kalshi cross-market → falsified (net spread ≤ 1.6% vs combined fees)
3. CEX cross-venue funding rate → falsified (spreads < costs; MEXC counterparty risk)
4. **Same-exchange spot-delivery basis → THIS DOCUMENT**

The intuition: if Gate.io's quarterly futures trade above spot, I can lock in "risk-free" yield by buying spot and shorting the future. No mark price, no liquidation, just hold to settlement.

---

## Data Collection

- **Instrument**: `basis_scanner.py` — read-only REST polls every 30s
- **Coins**: BTC, ETH
- **Contracts**: `BTC_USDT_20260925`, `BTC_USDT_20261225`, `ETH_USDT_20260925`, `ETH_USDT_20261225`
- **Window**: 2.4 hours → 1,152 samples (288 per coin/contract pair)
- **Sampling**: Gate.io `/api/v1/` spot `/order_book` + delivery `/order_book` + `/contracts`

---

## Results

### BTC / Dec 25 quarterly (DTE ~139d, highest liquidity)

| Metric | Value |
|--------|-------|
| Gross basis avg | +1.616% |
| Net-after-cost avg | +0.666% |
| Annualized net | **+1.75%** |
| Net-positive samples | **288/288 (100%)** |
| Net range | [+0.57%, +0.69%] — very tight |

This is the only coin/contract that met the "stable positive basis" technical criterion.

### All others

- BTC/Sep 25 — net +0.06% (too thin, MARGINAL)
- ETH/Sep 25 — net **-0.19%** (negative)
- ETH/Dec 25 — net **-0.02%** (negative, touched +0.015% briefly but not sustained)

---

## Decision Criteria & Verdict

The operator set a standard exceeding the prior framework:

> **required_return = cash_benchmark + venue_risk_premium + operational_cost**

where:
- `cash_benchmark` = 2% per year (US Treasury / stablecoin lending baseline)
- `venue_risk_premium` = 1% per year (Gate.io counterparty / regulatory risk — not proof-of-reserves audited, not top-3 by volume)
- `operational_cost` = locked capital for DTE days (~139 for Dec quarterly)

Applied to BTC/Dec 25:

- Realized cash yield: 1.616% over 139 days = 4.25% annualized gross
- Minus cash opportunity cost (2% × 139/365): −0.761%
- Minus venue risk (1% × 139/365): −0.381%
- Minus fees (spot taker 0.1% + delivery taker 0.025% + settle 0.015% + safety 0.05%): −0.190%
- **Net excess over risk-free after all costs: −0.334% → annualized −0.88%**

### Verdict: NO-GO

The strategy "pays" +1.75% annualized on paper, but this figure already **includes** the 2% cash benchmark baked into cost. When venue-specific risk (Gate.io counterparty, 139-day capital lock, withdrawal queue risk during market stress) is added, the excess turns **negative**. The operator is better off holding the capital in a 2% risk-free instrument and avoiding exchange-specific tail risk.

The 100%-positive-net result is technically elegant but economically meaningless — it's like finding a coin that lands on its edge 288 times. The spread is already priced by professionals with lower latency and lower venue risk (CME BTB, institutional custody). The residual left for a solo operator is scraps.

---

## Why not "just do it for +1.75%"?

1. **139-day capital lock** — USDT on Gate.io for 4.5 months is invisible, uninsurable, unregulated. Exchange hack, seizure, or solvency event during that window → total loss.
2. **No early exit** — Gate quarterly contracts settle at spot index on expiry date; you can't unwind early without giving back the basis.
3. **Counterparty concentration** — all capital on one non-top-3 exchange.
4. **Alpha already extracted** — if +1.75% annualized real yield existed for solo access, CTAs and market makers would have compressed it to <0.3% via basis trades. The fact we see 1.6% gross basis means professionals **can't** arbitrage it away (access barriers, KYC, entity requirements), which is itself a signal that the "easy" version isn't there for solo operators either.

---

## Data Preservation

- `data/basis_snapshots/basis_20260808_0253.csv` — 1,152 rows, 2.4h, canonical snapshot for Direction 4 falsification
- `basis_scanner.py` — reusable for future exchanges/contacts if venue risk changes
- `tests/permanent/test_funding_validation.py` — residual from funding arb, partially reusable for basis validation

---

## Conditions that would reopen Direction 4

| Condition | Probability | Trigger |
|-----------|-------------|---------|
| Gate.io quarterly basis exceeds +4% gross (equivalent to +8-10% annualized) | Low | Major futures dislocation (e.g., exchange hack on competitor, spot shortage) |
| CME BTB accessible to retail solo via 3rd-party | Near-zero | Regulatory change |
| Stable <200bps basis on quarterlies paid as coupon via structured product | Low | Yield aggregator (BFXDAO, Ribbon-style) releases retail wrapper |
| Gate.io gets tier-1 proof-of-reserves (Mazars, Armanino) | Medium | Would cut venue risk premium from 1% to ~0.2%, net turn positive |

---

## Aftermath: This is the End of the Road for "Pure Arb"

All four crypto arb directions are now falsified:

- ADR-001: Polymarket intra-market (mathematical)
- ADR-002: Polymarket ↔ Kalshi cross-market (net spread < costs)
- ADR-003: CEX funding rate (data + counterparty)
- ADR-004: Gate.io basis (insufficient spread above cash + venue risk)

**Conclusion**: There is no open window for a solo Chinese operator with a VPS and 2-5 RMB capital to earn "risk-free" or even "mild-risk" yield via cross-market / cross-venue / cross-contract arbitrage on liquid crypto markets. The efficient market hypothesis, at least in its weak form, holds for these venues at this time.

---

## What This Enables (Meta-observation)

The operator now has a closed list of what **doesn't** work. That is worth more than any single positive result, because it prevents wasted cycles chasing false positives. The next phase should pivot to:

1. **Direction 5 — directional / momentum strategies** (accept risk, manage it with sizing + stop)
2. **Direction 6 — tooling / data** (sell base infrastructure to traders who do have edge)
3. **Direction 7 — non-crypto online income** (freelance matching, agency, content + productized services)

The operator's honest constraint ("全职时间、VPN和服务器资源，但缺乏行业背景人脉，启动资金有限") plus the falsification of all pure-arb directions implies the highest-EV path is likely **Direction 7** — using operator time + AI agents to deliver services that other people want, rather than trying to find alpha in liquid markets where the operator has no edge.
