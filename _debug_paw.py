#!/usr/bin/env python3
import json, subprocess, sys
PAW_ps1 = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"
payload = json.dumps({"action": "evaluate", "script": "window.location.href"})
escaped = payload.replace("'", "''")
ps_cmd = f"& '{PAW_ps1}' browser-action '{escaped}'"
cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
print("PAYLOAD:", payload[:200])
print("PS_CMD:", ps_cmd[:300])
print("---")
r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
print("RC:", r.returncode)
print("OUT:", r.stdout[:800])
print("ERR:", r.stderr[:800])
