#!/usr/bin/env python3
import json, subprocess
PAW_ps1 = r"C:\Users\123\.meituan-catpaw\bin\paw.ps1"
payload = json.dumps({"action": "evaluate", "script": "window.location.href"}).replace("'", "''")
ps_cmd = f"& '{PAW_ps1}' browser-action '{payload}'"
cmd = ["pwsh", "-NoProfile", "-Command", ps_cmd]
r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
print("RC:", r.returncode)
print("OUT:", r.stdout[:500])
print("ERR:", r.stderr[:300])
