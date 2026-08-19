#!/usr/bin/env python3
import sqlite3
conn = sqlite3.connect("agent_data.db")
c = conn.cursor()
total = c.execute("SELECT COUNT(*) FROM demand_signals").fetchone()[0]
commented = c.execute("SELECT COUNT(*) FROM demand_signals WHERE processed_action='comment_sent'").fetchone()[0]
pending = c.execute("SELECT COUNT(*) FROM demand_signals WHERE processed=0 AND intent IN ('resume_help','career_advice','linkedin_opt')").fetchone()[0]
print(f"Total signals: {total}")
print(f"Commented: {commented}")
print(f"Pending: {pending}")
