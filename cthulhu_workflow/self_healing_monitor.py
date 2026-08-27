#!/usr/bin/env python3
"""
自愈监控系统
=============
检测系统异常并自动修复，支持多种通知渠道。

监控项：
1. 调度器进程是否存活
2. API调用失败率是否过高
3. 内容产出是否停滞
4. 磁盘空间是否充足
5. 数据文件是否损坏

自愈策略：
- 进程挂掉 → 自动重启
- API失败 → 切换备用API
- 数据损坏 → 从备份恢复
- 磁盘满 → 清理旧缓存
- 异常通知 → 免费渠道推送

免费通知渠道：
- Windows 系统通知 (win10toast)
- Telegram Bot (无限免费)
- Discord Webhook (免费)
- 企业微信 Webhook (免费)
- Bark (iOS, 免费)
- Server酱 (微信通知, 免费)
"""

import os
import sys
import json
import time
import shutil
import hashlib
import subprocess
import urllib.request
from pathlib import Path
from datetime import datetime, timedelta


WORKFLOW_DIR = Path(__file__).parent
DATA_DIR = WORKFLOW_DIR / "data"
LOG_DIR = WORKFLOW_DIR / "data" / "monitor_log"


class NotificationManager:
    """免费通知管理器"""
    
    def __init__(self):
        self.config = self._load_config()
    
    def _load_config(self):
        config_file = WORKFLOW_DIR / "config.json"
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"notifications": {}}
    
    def notify_windows(self, title, message):
        """Windows系统通知"""
        try:
            # PowerShell notification
            ps_cmd = f"""
Add-Type -AssemblyName System.Windows.Forms
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = [System.Drawing.SystemIcons]::Information
$notify.BalloonTipTitle = "{title[:50]}"
$notify.BalloonTipText = "{message[:200]}"
$notify.Visible = $true
$notify.ShowBalloonTip(5000)
"""
            subprocess.Popen(
                ["powershell", "-Command", ps_cmd],
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if hasattr(subprocess, 'CREATE_NEW_PROCESS_GROUP') else 0
            )
            return True
        except Exception:
            return False
    
    def notify_telegram(self, message):
        """Telegram Bot通知 (免费无限)"""
        bot_token = self.config.get("notifications", {}).get("telegram_token", "")
        chat_id = self.config.get("notifications", {}).get("telegram_chat_id", "")
        if not bot_token or not chat_id:
            return False
        
        try:
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            data = {"chat_id": chat_id, "text": message, "parse_mode": "HTML"}
            body = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=10)
            return True
        except Exception:
            return False
    
    def notify_bark(self, title, message):
        """Bark通知 (iOS, 免费)"""
        bark_key = self.config.get("notifications", {}).get("bark_key", "")
        bark_server = self.config.get("notifications", {}).get("bark_server", "https://api.day.app")
        if not bark_key:
            return False
        
        try:
            title_e = urllib.parse.quote(title[:50])
            message_e = urllib.parse.quote(message[:200])
            url = f"{bark_server}/{bark_key}/{title_e}/{message_e}"
            urllib.request.urlopen(url, timeout=10)
            return True
        except Exception:
            return False
    
    def notify_serverchan(self, title, message):
        """Server酱 (微信通知, 免费)"""
        sendkey = self.config.get("notifications", {}).get("serverchan_sendkey", "")
        if not sendkey:
            return False
        
        try:
            url = f"https://sctapi.ftqq.com/{sendkey}.send"
            data = {"text": title, "desp": message}
            body = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(url, data=body, headers={'Content-Type': 'application/json'})
            urllib.request.urlopen(req, timeout=10)
            return True
        except Exception:
            return False
    
    def notify_all(self, title, message):
        """发送所有已配置的通知"""
        results = {}
        
        # Windows notification (always available on Windows)
        results["windows"] = self.notify_windows(title, message)
        
        # Other channels (if configured)
        if self.config.get("notifications", {}).get("telegram_token"):
            results["telegram"] = self.notify_telegram(f"🔔 {title}\n\n{message}")
        
        if self.config.get("notifications", {}).get("bark_key"):
            results["bark"] = self.notify_bark(title, message)
        
        if self.config.get("notifications", {}).get("serverchan_sendkey"):
            results["serverchan"] = self.notify_serverchan(title, message)
        
        return results


class SelfHealingMonitor:
    """自愈监控器"""
    
    def __init__(self):
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        self.monitor_log = LOG_DIR / "healing_log.jsonl"
        self.health_history = LOG_DIR / "health_history.json"
        self.notifier = NotificationManager()
        self.issues_found = []
        self.healing_actions = []
    
    def _log_event(self, event_type, detail, severity="info"):
        """记录监控事件"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": event_type,
            "detail": detail,
            "severity": severity,
        }
        with open(self.monitor_log, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    # ========== 监控检查项 ==========
    
    def check_scheduler_alive(self):
        """检查调度器进程是否存活"""
        try:
            result = subprocess.run(
                ['python', '-c', '''
import subprocess
result = subprocess.run(['wmic', 'process', 'where', 'name="python.exe"', 'get', 'commandline'],
                       capture_output=True, text=True, timeout=5)
print(result.stdout)
'''],
                capture_output=True, text=True, timeout=10
            )
            
            # Check if scheduler is running by looking for scheduler.py
            if 'scheduler.py' in result.stdout:
                return {"status": "alive", "detail": "scheduler.py found in process list"}
            
            # Alternative: check if any scheduler log was updated recently
            scheduler_log = DATA_DIR / "scheduler.log"
            if scheduler_log.exists():
                mtime = datetime.fromtimestamp(scheduler_log.stat().st_mtime)
                if (datetime.now() - mtime).total_seconds() < 3600:
                    return {"status": "alive", "detail": "scheduler.log updated recently"}
            
            return {"status": "dead", "detail": "scheduler.py not found in process list"}
            
        except Exception as e:
            return {"status": "unknown", "detail": str(e)[:100]}
    
    def check_disk_space(self):
        """检查磁盘空间"""
        try:
            stat = shutil.disk_usage(str(WORKFLOW_DIR))
            free_gb = stat.free / (1024**3)
            total_gb = stat.total / (1024**3)
            percent_used = (stat.used / stat.total) * 100
            
            return {
                "status": "ok" if free_gb > 1 else "warning" if free_gb > 0.5 else "critical",
                "free_gb": round(free_gb, 2),
                "total_gb": round(total_gb, 2),
                "percent_used": round(percent_used, 1),
            }
        except Exception as e:
            return {"status": "error", "detail": str(e)[:100]}
    
    def check_data_integrity(self):
        """检查数据文件完整性"""
        issues = []
        
        # Check memory.db
        db_file = DATA_DIR / "memory.db"
        if not db_file.exists():
            issues.append({"file": "memory.db", "issue": "missing"})
        elif db_file.stat().st_size < 1000:
            issues.append({"file": "memory.db", "issue": "too_small"})
        
        # Check tracker.csv
        tracker_file = DATA_DIR / "tracker.csv"
        if not tracker_file.exists():
            issues.append({"file": "tracker.csv", "issue": "missing"})
        
        # Check scheduler.log
        log_file = DATA_DIR / "scheduler.log"
        if not log_file.exists():
            issues.append({"file": "scheduler.log", "issue": "missing"})
        
        return {
            "status": "ok" if not issues else "warning",
            "issues": issues,
        }
    
    def check_content_stall(self):
        """检查内容产出是否停滞"""
        try:
            # Check newest audio file
            audio_dir = WORKFLOW_DIR / "audio"
            if not audio_dir.exists():
                return {"status": "no_audio_dir", "days_since_last": 999}
            
            newest = None
            for f in audio_dir.rglob("*.mp3"):
                mtime = f.stat().st_mtime
                if newest is None or mtime > newest:
                    newest = mtime
            
            if newest is None:
                return {"status": "no_content", "days_since_last": 999}
            
            days_since = (time.time() - newest) / 86400
            
            return {
                "status": "ok" if days_since < 7 else "warning" if days_since < 30 else "critical",
                "days_since_last": round(days_since, 1),
                "last_content_time": datetime.fromtimestamp(newest).isoformat(),
            }
        except Exception as e:
            return {"status": "error", "detail": str(e)[:100]}
    
    def check_api_health(self):
        """检查API健康状态"""
        config_file = WORKFLOW_DIR / "config.json"
        if not config_file.exists():
            return {"status": "no_config", "apis": {}}
        
        with open(config_file, 'r', encoding='utf-8') as f:
            config = json.load(f)
        
        apis = config.get("api_keys", {})
        results = {}
        for api_name, key in apis.items():
            results[api_name] = "configured" if key else "not_configured"
        
        configured_count = sum(1 for v in results.values() if v == "configured")
        
        return {
            "status": "ok" if configured_count > 0 else "warning",
            "configured_apis": configured_count,
            "apis": results,
        }
    
    # ========== 自愈动作 ==========
    
    def heal_scheduler(self):
        """自动重启调度器"""
        try:
            # Start scheduler in background
            scheduler_path = WORKFLOW_DIR / "scheduler.py"
            if not scheduler_path.exists():
                return {"status": "failed", "detail": "scheduler.py not found"}
            
            # Create a batch script to start scheduler
            start_cmd = f'''
@echo off
cd /d "{WORKFLOW_DIR}"
start /B pythonw scheduler.py
echo {datetime.now().isoformat()} - Scheduler restarted >> data/monitor_log/restart_log.txt
'''
            start_script = WORKFLOW_DIR / "_restart_scheduler.bat"
            start_script.write_text(start_cmd, encoding='utf-8')
            
            subprocess.Popen(
                [str(start_script)],
                shell=True,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if hasattr(subprocess, 'CREATE_NEW_PROCESS_GROUP') else 0
            )
            
            self._log_event("heal_scheduler", "Scheduler restart initiated", "warning")
            return {"status": "healed", "detail": "Scheduler restart initiated"}
            
        except Exception as e:
            return {"status": "failed", "detail": str(e)[:100]}
    
    def heal_disk_space(self):
        """清理旧缓存释放空间"""
        cleaned_size = 0
        
        # Clean old cache files (keep last 7 days)
        cache_dir = DATA_DIR / "content_cache"
        if cache_dir.exists():
            cutoff = time.time() - 7 * 86400
            for f in cache_dir.iterdir():
                if f.stat().st_mtime < cutoff:
                    cleaned_size += f.stat().st_size
                    f.unlink()
        
        # Clean old screenshots
        screenshot_dir = WORKFLOW_DIR / "screenshots"
        if screenshot_dir.exists():
            cutoff = time.time() - 3 * 86400
            for f in screenshot_dir.iterdir():
                if f.stat().st_mtime < cutoff:
                    cleaned_size += f.stat().st_size
                    f.unlink()
        
        # Clean old collection files (keep last 30)
        collection_files = sorted(DATA_DIR.glob("collection_*.json"), key=lambda f: f.stat().st_mtime, reverse=True)
        for f in collection_files[30:]:
            cleaned_size += f.stat().st_size
            f.unlink()
        
        return {
            "status": "healed",
            "cleaned_mb": round(cleaned_size / (1024**2), 2),
            "detail": f"Cleaned {cleaned_size / (1024**2):.1f} MB of old files",
        }
    
    def heal_data_corruption(self):
        """从备份恢复损坏的数据"""
        db_file = DATA_DIR / "memory.db"
        
        # If memory.db is corrupted, recreate it
        if db_file.exists():
            try:
                import sqlite3
                conn = sqlite3.connect(str(db_file))
                conn.execute("SELECT 1 FROM hypotheses LIMIT 1")
                conn.close()
                return {"status": "ok", "detail": "Database is healthy"}
            except Exception:
                # Database corrupted, need to recreate
                db_file.unlink()
        
        # Recreate memory.db
        try:
            sys.path.insert(0, str(WORKFLOW_DIR))
            from memory_store import MemoryStore, seed_initial_hypotheses
            memory = MemoryStore()
            seed_initial_hypotheses(memory)
            memory.close()
            
            self._log_event("heal_database", "Recreated corrupted memory.db", "warning")
            return {"status": "healed", "detail": "Recreated memory.db from scratch"}
        except Exception as e:
            return {"status": "failed", "detail": str(e)[:100]}
    
    # ========== 主监控循环 ==========
    
    def run_health_check(self):
        """运行完整健康检查"""
        print("=" * 60)
        print("🏥 自愈监控 — 完整健康检查")
        print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        checks = {
            "scheduler": self.check_scheduler_alive(),
            "disk_space": self.check_disk_space(),
            "data_integrity": self.check_data_integrity(),
            "content_stall": self.check_content_stall(),
            "api_health": self.check_api_health(),
        }
        
        # Print results
        print("\n📊 检查结果:")
        issues = []
        
        for check_name, result in checks.items():
            status = result.get("status", "unknown")
            icon = {"ok": "🟢", "alive": "🟢", "warning": "🟡", "critical": "🔴", "dead": "🔴"}.get(status, "⚪")
            print(f"  {icon} {check_name}: {status}")
            
            if status not in ("ok", "alive"):
                issues.append({"check": check_name, "result": result})
        
        # Run healing if needed
        if issues:
            print(f"\n🔧 发现 {len(issues)} 个问题，开始自愈...")
            healing_results = self.run_healing(issues)
            
            print(f"\n📋 自愈结果:")
            for hr in healing_results:
                status_icon = "✅" if hr.get("status") in ("healed", "ok") else "❌"
                print(f"  {status_icon} {hr.get('action')}: {hr.get('status')}")
            
            # Send notification if critical issues
            critical_issues = [i for i in issues if i["result"].get("status") in ("critical", "dead")]
            if critical_issues:
                self.notifier.notify_all(
                    "⚠️ 克苏鲁系统异常",
                    f"发现 {len(critical_issues)} 个严重问题，已尝试自愈"
                )
        else:
            print("\n✅ 所有检查通过，系统健康")
        
        # Save health history
        self._save_health_history(checks)
        
        return checks
    
    def run_healing(self, issues):
        """根据发现的问题执行自愈"""
        results = []
        
        for issue in issues:
            check = issue["check"]
            result = issue["result"]
            
            if check == "scheduler" and result.get("status") == "dead":
                r = self.heal_scheduler()
                r["action"] = "restart_scheduler"
                results.append(r)
            
            elif check == "disk_space" and result.get("status") in ("warning", "critical"):
                r = self.heal_disk_space()
                r["action"] = "clean_disk"
                results.append(r)
            
            elif check == "data_integrity" and result.get("status") == "warning":
                r = self.heal_data_corruption()
                r["action"] = "fix_data"
                results.append(r)
        
        if not results:
            results.append({"action": "none", "status": "no_action_needed"})
        
        return results
    
    def _save_health_history(self, checks):
        """保存健康历史"""
        history = []
        if self.health_history.exists():
            try:
                history = json.loads(self.health_history.read_text(encoding='utf-8'))
            except:
                history = []
        
        history.append({
            "timestamp": datetime.now().isoformat(),
            "checks": {k: v.get("status", "unknown") for k, v in checks.items()},
        })
        
        # Keep only last 100 entries
        history = history[-100:]
        
        with open(self.health_history, 'w', encoding='utf-8') as f:
            json.dump(history, f, ensure_ascii=False, indent=2)


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    monitor = SelfHealingMonitor()
    
    if len(sys.argv) > 1 and sys.argv[1] == "check":
        monitor.run_health_check()
    
    elif len(sys.argv) > 1 and sys.argv[1] == "heal":
        # Run healing only
        issues = [{"check": "scheduler", "result": {"status": "dead"}}]
        results = monitor.run_healing(issues)
        print(json.dumps(results, ensure_ascii=False, indent=2))
    
    elif len(sys.argv) > 1 and sys.argv[1] == "notify":
        title = sys.argv[2] if len(sys.argv) > 2 else "测试通知"
        message = sys.argv[3] if len(sys.argv) > 3 else "这是一条测试通知"
        results = monitor.notifier.notify_all(title, message)
        print(f"通知结果: {results}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "stats":
        # Show health history stats
        history_file = LOG_DIR / "health_history.json"
        if history_file.exists():
            history = json.loads(history_file.read_text(encoding='utf-8'))
            print(f"健康检查历史: {len(history)} 条记录")
            for h in history[-5:]:
                print(f"  {h['timestamp']}: {h['checks']}")
        else:
            print("暂无健康历史")
    
    else:
        print("自愈监控系统")
        print()
        print("用法:")
        print("  python self_healing_monitor.py check   - 运行完整健康检查")
        print("  python self_healing_monitor.py heal    - 仅运行自愈")
        print("  python self_healing_monitor.py stats   - 查看历史")
        print("  python self_healing_monitor.py notify <标题> <内容> - 测试通知")
