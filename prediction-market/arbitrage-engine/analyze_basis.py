"""Analyze basis scan results."""
import csv
import sys

csv_path = sys.argv[1] if len(sys.argv) > 1 else "data/basis_snapshots/latest.csv"

rows = []
with open(csv_path) as f:
    rows = list(csv.DictReader(f))

print("=== BASIS SCAN ANALYSIS ===")
print(f"File: {csv_path}")
print(f"Records: {len(rows)}")
if not rows:
    sys.exit(0)

coins = sorted(set(r["coin"] for r in rows))
contracts = sorted(set(r["delivery_contract"] for r in rows))
print(f"Coins: {coins}")
print(f"Contracts: {contracts}")
print(f"Period: {rows[0]['datetime_utc']} -> {rows[-1]['datetime_utc']}")

groups = {}
for r in rows:
    key = f"{r['coin']}/{r['delivery_contract']}"
    groups.setdefault(key, []).append(r)

print()
REQUIRED_RETURN = 2.0  # cash_benchmark % annual

for key in sorted(groups):
    recs = groups[key]
    n = len(recs)
    grosses = [float(r["gross_basis_pct"]) for r in recs]
    nets = [float(r["net_basis_pct"]) for r in recs]
    anns = [float(r["annualized_net_pct"]) for r in recs]

    avg_g = sum(grosses) / n
    avg_net = sum(nets) / n
    avg_ann = sum(anns) / n
    pos_net = sum(1 for x in nets if x > 0)
    go = sum(1 for r in recs if r["verdict"] == "GO")

    print(f"--- {key} ({n} periods) ---")
    print(f"  Gross: avg={avg_g:+.4f}%  pos={pos_net}/{n} ({pos_net/n:.0%})")
    print(f"  Net:   avg={avg_net:+.4f}%  max={max(nets):+.4f}%  min={min(nets):+.4f}%")
    print(f"  Annual: avg={avg_ann:+.2f}%  GO={go}/{n}")
    if pos_net / n > 0.7 and avg_net > 0.1:
        print("  => STABLE POSITIVE BASIS ✅")
    elif pos_net / n > 0.5:
        print("  => PARTIALLY STABLE ⚠️")
    else:
        print("  => UNSTABLE / NEGATIVE ❌")

print()
print("OVERALL:")
positive = sum(1 for key, recs in groups.items()
               if sum(float(r["net_basis_pct"]) for r in recs) / len(recs) > 0.05)
total = len(groups)
print(f"  Positive groups: {positive}/{total}")
if positive == total:
    print("  => PROCEED to paper")
elif positive > 0:
    print("  => Some opportunities")
else:
    print("  => NO-GO: no actionable basis")
