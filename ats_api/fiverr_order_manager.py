#!/usr/bin/env python3
"""
Fiverr Order Manager CLI.

A command-line interface for managing Fiverr ATS analysis orders.
Wraps the OrderManager and automation engine with user-friendly commands.

Commands:
    add-order       Add a new order interactively or via flags
    list-orders     Display all orders and their status
    show <id>       Show full details of a specific order
    process <id>    Process a specific order
    process-all     Process all pending orders
    deliver <id>    Mark an order as delivered with notes
    update <id>     Update order fields
    delete <id>     Remove an order
    stats           Show order statistics
    export          Export orders to CSV

Usage:
    python fiverr_order_manager.py add-order
    python fiverr_order_manager.py list-orders
    python fiverr_order_manager.py process-all
    python fiverr_order_manager.py deliver FVR-001 --notes "Delivered with bonus tips"
    python fiverr_order_manager.py stats
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

# ---------------------------------------------------------------------------
# Import automation module (same directory)
# ---------------------------------------------------------------------------

try:
    from fiverr_automation import (
        OrderManager,
        ORDERS_FILE,
        TIER_CONFIG,
        process_order,
        process_orders,
        call_ats_api,
        generate_deliverable,
        fetch_resume_content,
    )
except ImportError:
    # Allow running from different CWD
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from fiverr_automation import (
        OrderManager,
        ORDERS_FILE,
        TIER_CONFIG,
        process_order,
        process_orders,
        call_ats_api,
        generate_deliverable,
        fetch_resume_content,
    )


# ---------------------------------------------------------------------------
# Formatting Helpers
# ---------------------------------------------------------------------------

STATUS_COLORS = {
    "pending": "\033[33m",     # yellow
    "processing": "\033[36m",  # cyan
    "completed": "\033[32m",   # green
    "delivered": "\033[34m",   # blue
    "error": "\033[31m",       # red
    "cancelled": "\033[90m",   # gray
}

RESET = "\033[0m"
BOLD = "\033[1m"


def _color_status(status: str) -> str:
    """Return ANSI-colored status string (disabled on non-TTY)."""
    if not sys.stdout.isatty():
        return status
    color = STATUS_COLORS.get(status.lower(), "")
    return f"{color}{status}{RESET}" if color else status


def _format_timestamp(ts: str) -> str:
    """Format ISO timestamp for display."""
    if not ts:
        return "—"
    try:
        dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M")
    except (ValueError, TypeError):
        return ts


def _print_separator(char: str = "─", width: int = 70) -> None:
    print(char * width)


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_add_order(args: argparse.Namespace) -> int:
    """Add a new order to the queue."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    # Gather order data
    order: Dict[str, Any] = {}

    if args.order_id:
        order["order_id"] = args.order_id
    else:
        # Auto-generate ID
        existing_ids = [o.get("order_id", "") for o in mgr.orders]
        counter = len(existing_ids) + 1
        while f"FVR-{counter:03d}" in existing_ids:
            counter += 1
        order["order_id"] = f"FVR-{counter:03d}"

    order["client"] = args.client or input("Client Fiverr username: ").strip()
    order["status"] = "pending"
    order["tier"] = args.tier if args.tier in TIER_CONFIG else "standard"
    order["job_title"] = args.job_title or input("Job title: ").strip()
    order["company"] = args.company or input("Company name: ").strip()
    order["created_at"] = datetime.now(timezone.utc).isoformat()
    order["updated_at"] = order["created_at"]

    # Resume
    if args.resume_url:
        order["resume_url"] = args.resume_url
    elif args.resume_file:
        order["resume_url"] = str(Path(args.resume_file).resolve())
    else:
        resume_input = input("Resume URL or file path (leave blank to add later): ").strip()
        if resume_input:
            order["resume_url"] = resume_input

    # Job description
    if args.jd_text:
        order["jd_text"] = args.jd_text
    elif args.jd_file:
        jd_path = Path(args.jd_file)
        if jd_path.exists():
            order["jd_text"] = jd_path.read_text(encoding="utf-8")
        else:
            print(f"Warning: JD file not found: {jd_path}")
            order["jd_text"] = ""
    else:
        print("Enter job description (end with a blank line or EOF):")
        jd_lines = []
        try:
            while True:
                line = input()
                if line == "":
                    break
                jd_lines.append(line)
        except EOFError:
            pass
        order["jd_text"] = "\n".join(jd_lines)

    # Validate
    if not order.get("jd_text"):
        print("Error: Job description is required.")
        return 1

    mgr.upsert_order(order)
    mgr.save()

    print(f"\n{BOLD}Order added successfully!{RESET}")
    print(f"  Order ID:  {order['order_id']}")
    print(f"  Client:    {order['client']}")
    print(f"  Tier:      {order['tier']}")
    print(f"  Job:       {order['job_title']} @ {order['company']}")
    print(f"  Status:    {_color_status('pending')}")
    print(f"\nRun '{sys.argv[0]} process {order['order_id']}' to analyze.")

    return 0


def cmd_list_orders(args: argparse.Namespace) -> int:
    """List all orders with their status."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    orders = mgr.orders
    if not orders:
        print("No orders found. Use 'add-order' to create one.")
        return 0

    # Filter by status if requested
    if args.status:
        orders = [o for o in orders if o.get("status") == args.status]

    if not orders:
        print(f"No orders with status '{args.status}' found.")
        return 0

    # Sort: pending first, then by created_at
    status_order = {"pending": 0, "processing": 1, "completed": 2, "delivered": 3, "error": 4, "cancelled": 5}
    orders.sort(key=lambda o: (status_order.get(o.get("status"), 9), o.get("created_at", "")))

    # Display
    print(f"\n{BOLD}Fiverr ATS Orders{RESET}")
    _print_separator()
    print(f"{'ID':<15} {'Client':<18} {'Status':<14} {'Tier':<10} {'Job Title':<20} {'Created':<16}")
    _print_separator()

    for o in orders:
        oid = o.get("order_id", "?")
        client = o.get("client", "?")[:17]
        status = _color_status(o.get("status", "?"))
        tier = o.get("tier", "?")[:9]
        job = o.get("job_title", "?")[:19]
        created = _format_timestamp(o.get("created_at", ""))
        print(f"{oid:<15} {client:<18} {status:<23} {tier:<10} {job:<20} {created:<16}")

    _print_separator()
    print(f"Showing {len(orders)} order(s)")

    # Summary counts
    status_counts: Dict[str, int] = {}
    for o in orders:
        s = o.get("status", "unknown")
        status_counts[s] = status_counts.get(s, 0) + 1

    summary = " | ".join(f"{s}: {c}" for s, c in sorted(status_counts.items()))
    print(f"Summary: {summary}")

    return 0


def cmd_show_order(args: argparse.Namespace) -> int:
    """Show full details of a specific order."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    order = mgr.get_order(args.order_id)
    if not order:
        print(f"Order not found: {args.order_id}")
        return 1

    print(f"\n{BOLD}Order Details: {order['order_id']}{RESET}")
    _print_separator("═")

    for key, value in order.items():
        if key == "jd_text":
            # Truncate long JD for display
            display_val = value[:200] + "..." if len(str(value)) > 200 else value
            print(f"  {BOLD}{key:<16}{RESET} {display_val}")
        elif key == "resume_text":
            display_val = value[:200] + "..." if len(str(value)) > 200 else value
            print(f"  {BOLD}{key:<16}{RESET} {display_val}")
        elif key == "status":
            print(f"  {BOLD}{key:<16}{RESET} {_color_status(value)}")
        elif isinstance(value, str) and len(value) > 100:
            print(f"  {BOLD}{key:<16}{RESET} {value[:100]}...")
        else:
            print(f"  {BOLD}{key:<16}{RESET} {value}")

    _print_separator("═")

    # Check for deliverable
    deliverable_dir = order.get("deliverable_dir", "")
    if deliverable_dir and Path(deliverable_dir).exists():
        print(f"\n  {BOLD}Deliverables:{RESET}")
        for f in sorted(Path(deliverable_dir).iterdir()):
            size = f.stat().st_size
            print(f"    📄 {f.name} ({size:,} bytes)")
    elif order.get("status") == "completed":
        deliverable_dir = str(Path(__file__).resolve().parent / "deliverables" / args.order_id)
        if Path(deliverable_dir).exists():
            print(f"\n  {BOLD}Deliverables:{RESET}")
            for f in sorted(Path(deliverable_dir).iterdir()):
                size = f.stat().st_size
                print(f"    {f.name} ({size:,} bytes)")

    return 0


def cmd_process_order(args: argparse.Namespace) -> int:
    """Process a specific order."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    order = mgr.get_order(args.order_id)
    if not order:
        print(f"Order not found: {args.order_id}")
        return 1

    if order.get("status") not in ("pending", "error"):
        print(f"Order status is '{order.get('status')}'. Only pending/error orders can be processed.")
        return 1

    # Mark as processing
    mgr.update_status(args.order_id, "processing")
    mgr.save()

    # Process
    api_url = args.api_url or "http://localhost:8000"
    api_key = args.api_key or "test-key-id:test-key-secret"

    result = process_order(order, mgr, api_url, api_key)

    if result.get("success"):
        print(f"\n{BOLD}Processing complete!{RESET}")
        print(f"  ATS Score: {result.get('ats_score')}/100")
        print(f"  Deliverables:")
        for key, path in result.get("files", {}).items():
            print(f"    {key}: {path}")
        return 0
    else:
        print(f"\n{BOLD}Processing failed:{RESET} {result.get('error')}")
        return 1


def cmd_process_all(args: argparse.Namespace) -> int:
    """Process all pending orders."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    pending = mgr.get_pending()
    if not pending:
        print("No pending orders to process.")
        return 0

    print(f"Processing {len(pending)} pending order(s)...\n")

    api_url = args.api_url or "http://localhost:8000"
    api_key = args.api_key or "test-key-id:test-key-secret"

    results = process_orders(mgr, api_url, api_key)

    # Report
    succeeded = sum(1 for r in results if r.get("success"))
    failed = len(results) - succeeded

    print(f"\n{BOLD}Batch Results:{RESET} {succeeded} succeeded, {failed} failed")

    return 0 if failed == 0 else 1


def cmd_deliver(args: argparse.Namespace) -> int:
    """Mark an order as delivered with optional notes."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    order = mgr.get_order(args.order_id)
    if not order:
        print(f"Order not found: {args.order_id}")
        return 1

    if order.get("status") != "completed":
        print(f"Only completed orders can be marked as delivered. Current status: {order.get('status')}")
        return 1

    # Update status
    notes = args.notes or input("Delivery notes (optional): ").strip()
    mgr.update_status(
        args.order_id,
        "delivered",
        delivered_at=datetime.now(timezone.utc).isoformat(),
        delivery_notes=notes,
    )
    mgr.save()

    print(f"Order {args.order_id} marked as {BOLD}delivered{RESET}.")
    if notes:
        print(f"  Notes: {notes}")

    return 0


def cmd_update_order(args: argparse.Namespace) -> int:
    """Update fields of an existing order."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    order = mgr.get_order(args.order_id)
    if not order:
        print(f"Order not found: {args.order_id}")
        return 1

    updated = False

    # Tier
    if args.tier:
        if args.tier not in TIER_CONFIG:
            print(f"Invalid tier: {args.tier}. Choose from: {', '.join(TIER_CONFIG.keys())}")
            return 1
        order["tier"] = args.tier
        updated = True

    # Status
    if args.status:
        valid_statuses = {"pending", "processing", "completed", "delivered", "error", "cancelled"}
        if args.status not in valid_statuses:
            print(f"Invalid status: {args.status}. Choose from: {', '.join(sorted(valid_statuses))}")
            return 1
        order["status"] = args.status
        updated = True

    # Job title
    if args.job_title:
        order["job_title"] = args.job_title
        updated = True

    # Company
    if args.company:
        order["company"] = args.company
        updated = True

    # Resume URL
    if args.resume_url:
        order["resume_url"] = args.resume_url
        updated = True

    # JD text
    if args.jd_file:
        jd_path = Path(args.jd_file)
        if jd_path.exists():
            order["jd_text"] = jd_path.read_text(encoding="utf-8")
            updated = True
        else:
            print(f"File not found: {jd_path}")
            return 1

    if not updated:
        print("No fields to update. Use flags like --tier, --status, --job-title, etc.")
        return 1

    order["updated_at"] = datetime.now(timezone.utc).isoformat()
    mgr.upsert_order(order)
    mgr.save()

    print(f"Order {args.order_id} updated successfully.")
    return 0


def cmd_delete_order(args: argparse.Namespace) -> int:
    """Delete an order from the queue."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    order = mgr.get_order(args.order_id)
    if not order:
        print(f"Order not found: {args.order_id}")
        return 1

    if not args.force:
        confirm = input(f"Delete order {args.order_id} ({order.get('client', '?')})? [y/N]: ").strip().lower()
        if confirm != "y":
            print("Cancelled.")
            return 0

    mgr._data["orders"] = [o for o in mgr.orders if o.get("order_id") != args.order_id]
    mgr.save()

    print(f"Order {args.order_id} deleted.")
    return 0


def cmd_stats(args: argparse.Namespace) -> int:
    """Show order statistics."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    orders = mgr.orders
    if not orders:
        print("No orders found.")
        return 0

    total = len(orders)
    status_counts: Dict[str, int] = {}
    tier_counts: Dict[str, int] = {}
    scores: List[int] = []

    for o in orders:
        status_counts[o.get("status", "unknown")] = status_counts.get(o.get("status", "unknown"), 0) + 1
        tier_counts[o.get("tier", "unknown")] = tier_counts.get(o.get("tier", "unknown"), 0) + 1
        if o.get("ats_score") is not None:
            scores.append(o["ats_score"])

    print(f"\n{BOLD}Fiverr ATS Order Statistics{RESET}")
    _print_separator("═")

    print(f"\n  {BOLD}Total Orders:{RESET} {total}")

    print(f"\n  {BOLD}By Status:{RESET}")
    for status, count in sorted(status_counts.items()):
        pct = (count / total) * 100
        bar = "█" * int(pct / 5)
        print(f"    {_color_status(status):<25} {count:>4} ({pct:5.1f}%) {bar}")

    print(f"\n  {BOLD}By Tier:{RESET}")
    for tier, count in sorted(tier_counts.items()):
        pct = (count / total) * 100
        print(f"    {tier:<15} {count:>4} ({pct:5.1f}%)")

    if scores:
        avg_score = sum(scores) / len(scores)
        min_score = min(scores)
        max_score = max(scores)
        print(f"\n  {BOLD}ATS Scores:{RESET}")
        print(f"    Average: {avg_score:.1f}")
        print(f"    Range:   {min_score} - {max_score}")
        print(f"    Count:   {len(scores)} scored orders")

    # Revenue estimate (based on typical Fiverr pricing)
    tier_prices = {"basic": 10, "standard": 25, "premium": 50}
    estimated_revenue = sum(tier_prices.get(o.get("tier", "standard"), 25) for o in orders)
    print(f"\n  {BOLD}Estimated Revenue:${RESET} ${estimated_revenue}")

    _print_separator("═")
    return 0


def cmd_export(args: argparse.Namespace) -> int:
    """Export orders to CSV."""
    mgr = OrderManager(Path(args.orders_file) if args.orders_file else ORDERS_FILE)
    mgr.load()

    orders = mgr.orders
    if not orders:
        print("No orders to export.")
        return 0

    output_path = Path(args.output) if args.output else Path("fiverr_orders_export.csv")

    # Define CSV columns
    columns = [
        "order_id", "client", "status", "tier", "job_title", "company",
        "ats_score", "created_at", "updated_at", "delivered_at",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        for order in orders:
            writer.writerow({col: order.get(col, "") for col in columns})

    print(f"Exported {len(orders)} orders to: {output_path}")
    return 0


# ---------------------------------------------------------------------------
# Argument Parser
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    """Build the CLI argument parser."""
    parser = argparse.ArgumentParser(
        prog="fiverr_order_manager",
        description="Fiverr ATS Order Manager — manage and process ATS analysis orders",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s add-order --client john_doe --tier standard --job-title "Senior Python Dev"
  %(prog)s list-orders
  %(prog)s list-orders --status pending
  %(prog)s show FVR-001
  %(prog)s process FVR-001
  %(prog)s process-all
  %(prog)s deliver FVR-001 --notes "Added bonus cover letter tips"
  %(prog)s update FVR-001 --tier premium
  %(prog)s delete FVR-001
  %(prog)s stats
  %(prog)s export --output orders.csv
        """,
    )

    parser.add_argument(
        "--orders-file",
        type=Path,
        default=None,
        help="Path to orders.json (default: ats_api/orders.json)",
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # --- add-order ---
    p_add = subparsers.add_parser("add-order", help="Add a new order to the queue")
    p_add.add_argument("--order-id", help="Custom order ID (auto-generated if omitted)")
    p_add.add_argument("--client", "-c", help="Client Fiverr username")
    p_add.add_argument("--tier", "-t", default="standard", choices=list(TIER_CONFIG.keys()))
    p_add.add_argument("--job-title", "-j", help="Target job title")
    p_add.add_argument("--company", help="Target company name")
    p_add.add_argument("--resume-url", help="URL or file path to resume")
    p_add.add_argument("--resume-file", help="Local file path to resume")
    p_add.add_argument("--jd-text", help="Job description text (inline)")
    p_add.add_argument("--jd-file", help="File containing job description")
    p_add.set_defaults(func=cmd_add_order)

    # --- list-orders ---
    p_list = subparsers.add_parser("list-orders", help="List all orders")
    p_list.add_argument("--status", "-s", help="Filter by status")
    p_list.set_defaults(func=cmd_list_orders)

    # --- show ---
    p_show = subparsers.add_parser("show", help="Show order details")
    p_show.add_argument("order_id", help="Order ID to display")
    p_show.set_defaults(func=cmd_show_order)

    # --- process ---
    p_proc = subparsers.add_parser("process", help="Process a specific order")
    p_proc.add_argument("order_id", help="Order ID to process")
    p_proc.add_argument("--api-url", default="http://localhost:8000")
    p_proc.add_argument("--api-key", default="test-key-id:test-key-secret")
    p_proc.set_defaults(func=cmd_process_order)

    # --- process-all ---
    p_pall = subparsers.add_parser("process-all", help="Process all pending orders")
    p_pall.add_argument("--api-url", default="http://localhost:8000")
    p_pall.add_argument("--api-key", default="test-key-id:test-key-secret")
    p_pall.set_defaults(func=cmd_process_all)

    # --- deliver ---
    p_del = subparsers.add_parser("deliver", help="Mark order as delivered")
    p_del.add_argument("order_id", help="Order ID to deliver")
    p_del.add_argument("--notes", "-n", help="Delivery notes")
    p_del.set_defaults(func=cmd_deliver)

    # --- update ---
    p_upd = subparsers.add_parser("update", help="Update order fields")
    p_upd.add_argument("order_id", help="Order ID to update")
    p_upd.add_argument("--tier", choices=list(TIER_CONFIG.keys()))
    p_upd.add_argument("--status", choices=["pending", "processing", "completed", "delivered", "error", "cancelled"])
    p_upd.add_argument("--job-title", help="New job title")
    p_upd.add_argument("--company", help="New company name")
    p_upd.add_argument("--resume-url", help="New resume URL")
    p_upd.add_argument("--jd-file", help="File with updated job description")
    p_upd.set_defaults(func=cmd_update_order)

    # --- delete ---
    p_del_o = subparsers.add_parser("delete", help="Delete an order")
    p_del_o.add_argument("order_id", help="Order ID to delete")
    p_del_o.add_argument("--force", "-f", action="store_true", help="Skip confirmation")
    p_del_o.set_defaults(func=cmd_delete_order)

    # --- stats ---
    p_stats = subparsers.add_parser("stats", help="Show order statistics")
    p_stats.set_defaults(func=cmd_stats)

    # --- export ---
    p_exp = subparsers.add_parser("export", help="Export orders to CSV")
    p_exp.add_argument("--output", "-o", help="Output CSV file path")
    p_exp.set_defaults(func=cmd_export)

    return parser


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 0

    if hasattr(args, "func"):
        return args.func(args)

    parser.print_help()
    return 0


if __name__ == "__main__":
    sys.exit(main())
