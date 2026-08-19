#!/usr/bin/env python3
import sqlite3
conn = sqlite3.connect("agent_data.db")
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM demand_signals WHERE processed=0 AND intent IN ('resume_help','career_advice','linkedin_opt')")
print("Pending signals:", c.fetchone()[0])
c.execute("SELECT COUNT(*) FROM demand_signals WHERE processed=1 AND processed_action='comment_sent'")
print("Already commented:", c.fetchone()[0])
