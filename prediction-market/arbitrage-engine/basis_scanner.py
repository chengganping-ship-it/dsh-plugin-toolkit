"""Spot-to-delivery-futures basis scanner (read-only)."""
import urllib.request
import json
import csv
import os
import time
import sys
from datetime import datetime, timezone

EXCHANGE = "Gate.io"
QUANTO = {"BTC": 0.0001, "ETH": 0.01}
TARGET_USD = 1000.0

SPOT_TAKER_FEE = 0.001
DELIVERY_TAKER_FEE = 0.00025
SETTLE_FEE = 0.00015
CASH_BENCHMARK = 0.02
SAFETY_MARGIN = 0.0005

CSV_COLS = [
    "timestamp", "datetime_utc",
    "coin", "delivery_contract", "dte_days",
    "spot_bid", "spot_ask", "spot_ask_vwap", "spot_ask_depth_usd",
    "futures_bid", "futures_ask", "futures_bid_vwap", "futures_bid_depth_usd",
    "gross_basis_pct", "annualized_gross_pct",
    "total_cost_pct", "net_basis_pct", "annualized_net_pct",
    "breakeven_days", "verdict"
]

DELIVERY_CONTRACTS = {
    "BTC": ["BTC_USDT_20260925", "BTC_USDT_20261225"],
    "ETH": ["ETH_USDT_20260925", "ETH_USDT_20261225"],
}

SPOT_PAIRS = {"BTC": "BTC_USDT", "ETH": "ETH_USDT"}


def fetch(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode())


def parse_level(level):
    """Parse order book level. Spot uses [price, qty], delivery dicts use {p, s}."""
    if isinstance(level, (list, tuple)) and len(level) >= 2:
        return float(level[0]), float(level[1])
    elif isinstance(level, dict):
        p = level.get("p") or level.get("price")
        s = level.get("s") or level.get("size") or level.get("q") or level.get("quantity")
        if p is not None and s is not None:
            return float(p), float(s)
    return None, None


def calc_vwap(side_book, target_usd, quanto_mult=1.0, is_delivery=False):
    """VWAP for target USD notional from order book side.
    
    For delivery, qty is in contracts; 1 contract = quanto_mult base coins.
    Returns (vwap_price_in_usd, usd_filled, usd_unfilled).
    """
    if not side_book:
        return 0, 0, target_usd
    remaining = target_usd
    cost = 0.0
    filled_notional_usd = 0.0
    last_price = 0.0
    for level in side_book:
        price, qty = parse_level(level)
        if price is None or qty is None or price <= 0 or qty <= 0:
            continue
        last_price = price
        if is_delivery:
            level_usd = price * qty * quanto_mult  # total USD value of contracts
        else:
            level_usd = price * qty
        if level_usd <= 0:
            continue
        if level_usd >= remaining:
            portion = remaining / level_usd
            taken_usd = remaining
            cost += taken_usd
            filled_notional_usd += taken_usd
            remaining = 0
            break
        else:
            filled_notional_usd += level_usd
            cost += level_usd
            remaining -= level_usd
    # VWAP = weighted average price (USD per base coin for spot, USD per BTC for delivery)
    if is_delivery:
        # For delivery, VWAP price is in USD (same as spot)
        # cost / (filled_notional_usd / avg_price) — but simpler:
        # VWAP = cost / total_base_coins_notional
        # total_base_coins = sum(qty * quanto) for each level consumed
        # We can compute it directly from order book
        total_base = 0.0
        running_usd = 0.0
        for level in side_book:
            if running_usd >= filled_notional_usd:
                break
            p, q = parse_level(level)
            if p is None or q is None or p <= 0 or q <= 0:
                continue
            l_usd = p * q * quanto_mult
            if running_usd + l_usd > filled_notional_usd:
                port = (filled_notional_usd - running_usd) / l_usd
                total_base += q * port * quanto_mult
                running_usd = filled_notional_usd
                break
            else:
                total_base += q * quanto_mult
                running_usd += l_usd
        vwap = cost / total_base if total_base > 0 else last_price
    else:
        total_base = 0.0
        running_usd = 0.0
        for level in side_book:
            if running_usd >= filled_notional_usd:
                break
            p, q = parse_level(level)
            if p is None or q is None or p <= 0 or q <= 0:
                continue
            l_usd = p * q
            if running_usd + l_usd > filled_notional_usd:
                port = (filled_notional_usd - running_usd) / l_usd
                total_base += q * port
                running_usd = filled_notional_usd
                break
            else:
                total_base += q
                running_usd += l_usd
        vwap = cost / total_base if total_base > 0 else last_price
    return vwap, cost, remaining


def depth_usd(side_book, up_to_usd, quanto_mult=1.0, is_delivery=False):
    total = 0.0
    for level in side_book:
        price, qty = parse_level(level)
        if price is None or qty is None or price <= 0 or qty <= 0:
            continue
        if is_delivery:
            total += price * qty * quanto_mult
        else:
            total += price * qty
        if total >= up_to_usd:
            return up_to_usd
    return total


def scan_once(now):
    """Do one scan iteration. Returns list of row dicts."""
    rows = []
    ts_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")

    spot_books = {}
    for coin, pair in SPOT_PAIRS.items():
        url = (
            "https://api.gateio.ws/api/v4/spot/order_book?"
            f"currency_pair={pair}&limit=50&interval=0"
        )
        try:
            spot_books[coin] = fetch(url)
        except Exception as e:
            print(f"\n[WARN] spot {coin}: {e}", flush=True)
            spot_books[coin] = {}
        time.sleep(0.15)

    deliv_books = {}
    for coin, contracts in DELIVERY_CONTRACTS.items():
        deliv_books[coin] = {}
        for c in contracts:
            url = (
                "https://api.gateio.ws/api/v4/delivery/usdt/order_book?"
                f"contract={c}&limit=50&interval=0"
            )
            try:
                deliv_books[coin][c] = fetch(url)
            except Exception as e:
                print(f"\n[WARN] delivery {coin} {c}: {e}", flush=True)
                deliv_books[coin][c] = {}
            time.sleep(0.15)

    for coin in ["BTC", "ETH"]:
        spot = spot_books.get(coin, {})
        s_bids = spot.get("bids", [])
        s_asks = spot.get("asks", [])
        if not s_bids or not s_asks:
            continue

        spot_bid_top = float(s_bids[0][0]) if isinstance(s_bids[0], list) else float(s_bids[0].get("p", 0))
        spot_ask_top = float(s_asks[0][0]) if isinstance(s_asks[0], list) else float(s_asks[0].get("p", 0))

        spot_ask_vwap, _, spot_unfilled = calc_vwap(
            s_asks, TARGET_USD, quanto_mult=1.0, is_delivery=False
        )
        spot_ask_depth = depth_usd(s_asks, TARGET_USD)

        for cname, book in deliv_books.get(coin, {}).items():
            if not book:
                continue
            f_bids = book.get("bids", [])
            f_asks = book.get("asks", [])
            if not f_bids or not f_asks:
                continue

            fut_bid_top = float(f_bids[0].get("p", 0)) if isinstance(f_bids[0], dict) else float(f_bids[0][0])
            fut_ask_top = float(f_asks[0].get("p", 0)) if isinstance(f_asks[0], dict) else float(f_asks[0][0])

            q = QUANTO.get(coin, 0.0001)
            fut_bid_vwap, _, fut_unfilled = calc_vwap(
                f_bids, TARGET_USD, quanto_mult=q, is_delivery=True
            )
            fut_bid_depth = depth_usd(f_bids, TARGET_USD, quanto_mult=q, is_delivery=True)

            exp_str = cname.split("_")[-1]
            try:
                exp_dt = datetime.strptime(exp_str, "%Y%m%d").replace(tzinfo=timezone.utc)
                dte = (exp_dt - now).total_seconds() / 86400
            except Exception:
                dte = 90

            if spot_ask_vwap > 0 and fut_bid_vwap > 0:
                gross = (fut_bid_vwap - spot_ask_vwap) / spot_ask_vwap
            else:
                gross = 0.0

            cost = (
                SPOT_TAKER_FEE
                + DELIVERY_TAKER_FEE
                + SETTLE_FEE
                + CASH_BENCHMARK * max(dte, 1) / 365
                + SAFETY_MARGIN
            )
            net = gross - cost
            ann_gross = (gross * 365 / dte * 100) if dte > 0 else 0
            ann_net = (net * 365 / dte * 100) if dte > 0 else 0

            breakeven = (cost / gross * dte) if gross > 0 else float("inf")

            if net > 0.001 and dte > 7 and spot_unfilled == 0 and fut_unfilled == 0:
                verdict = "GO"
            elif net > 0 and dte > 7:
                verdict = "MARGINAL"
            else:
                verdict = "NO-GO"

            rows.append({
                "timestamp": int(now.timestamp()),
                "datetime_utc": ts_str,
                "coin": coin,
                "delivery_contract": cname,
                "dte_days": round(dte, 1),
                "spot_bid": round(spot_bid_top, 2),
                "spot_ask": round(spot_ask_top, 2),
                "spot_ask_vwap": round(spot_ask_vwap, 2),
                "spot_ask_depth_usd": round(spot_ask_depth, 2),
                "futures_bid": round(fut_bid_top, 2),
                "futures_ask": round(fut_ask_top, 2),
                "futures_bid_vwap": round(fut_bid_vwap, 2),
                "futures_bid_depth_usd": round(fut_bid_depth, 2),
                "gross_basis_pct": round(gross * 100, 4),
                "annualized_gross_pct": round(ann_gross, 2),
                "total_cost_pct": round(cost * 100, 4),
                "net_basis_pct": round(net * 100, 4),
                "annualized_net_pct": round(ann_net, 2),
                "breakeven_days": round(breakeven, 1),
                "verdict": verdict,
            })

    return rows


def main():
    days = float(sys.argv[1]) if len(sys.argv) > 1 else 1.0
    out_dir = "data/basis_snapshots"
    os.makedirs(out_dir, exist_ok=True)
    tag = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M")
    csv_path = os.path.join(out_dir, f"basis_{tag}.csv")

    with open(csv_path, "w", newline="") as f:
        csv.DictWriter(f, fieldnames=CSV_COLS).writeheader()

    print(f"Basis Scanner -- {days}d, 30s interval, ${TARGET_USD} target")
    print(f"Coins: {list(SPOT_PAIRS.keys())}")
    print(f"Output: {csv_path}")

    start = time.time()
    end = start + days * 86400
    count = 0

    while time.time() < end:
        now = datetime.now(timezone.utc)
        try:
            rows = scan_once(now)
            if rows:
                with open(csv_path, "a", newline="") as f:
                    csv.DictWriter(f, fieldnames=CSV_COLS).writerows(rows)
                count += len(rows)
            sys.stdout.write(f"\r{now.strftime('%H:%M')} rows={count}  ")
            sys.stdout.flush()
        except KeyboardInterrupt:
            print("\nStopped.")
            break
        except Exception as e:
            print(f"\n[ERROR] {e}", flush=True)
            time.sleep(5)
            continue

        elapsed = time.time() - now.timestamp()
        time.sleep(max(30 - elapsed, 0.5))

    print(f"\n\nDone. {count} rows -> {csv_path}")


if __name__ == "__main__":
    main()
