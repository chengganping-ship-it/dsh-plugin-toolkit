#!/usr/bin/env python3
"""
系统健康检查 — 全面诊断和报告
==============================
检查所有模块、依赖、数据完整性，生成健康报告。
"""

import os
import sys
import json
import sqlite3
import importlib
from pathlib import Path
from datetime import datetime


WORKFLOW_DIR = Path(__file__).parent
DATA_DIR = WORKFLOW_DIR / "data"


class SystemHealth:
    """系统健康检查器"""
    
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "modules": {},
            "dependencies": {},
            "data_integrity": {},
            "directories": {},
            "overall_status": "unknown",
        }
    
    def check_all(self):
        """运行所有检查"""
        self.check_modules()
        self.check_dependencies()
        self.check_data_integrity()
        self.check_directories()
        self.check_scheduler_status()
        self.determine_overall_status()
        return self.results
    
    def check_modules(self):
        """检查所有模块是否可导入"""
        modules = [
            "workflow_engine",
            "memory_store",
            "self_loop_engine",
            "free_ai_client",
            "cover_generator",
            "publish_automation",
            "data_collector",
            "full_autopilot",
            "scheduler",
            "dashboard",
            "content_expander",
            "promotion_engine",
        ]
        
        for mod in modules:
            try:
                importlib.import_module(mod)
                self.results["modules"][mod] = "ok"
            except Exception as e:
                self.results["modules"][mod] = f"error: {str(e)[:100]}"
    
    def check_dependencies(self):
        """检查关键依赖"""
        deps = {
            "edge_tts": "edge_tts",
            "playwright": "playwright",
            "apscheduler": "apscheduler",
            "sqlite3": "sqlite3",
        }
        
        for name, package in deps.items():
            try:
                mod = importlib.import_module(package)
                version = getattr(mod, "__version__", "installed")
                self.results["dependencies"][name] = f"ok ({version})"
            except ImportError:
                self.results["dependencies"][name] = "missing"
    
    def check_data_integrity(self):
        """检查数据完整性"""
        db_file = DATA_DIR / "memory.db"
        
        if not db_file.exists():
            self.results["data_integrity"]["database"] = "missing"
            return
        
        try:
            conn = sqlite3.connect(str(db_file))
            cursor = conn.cursor()
            
            # Check tables
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            self.results["data_integrity"]["tables"] = tables
            
            # Check each table
            for table in ["hypotheses", "content_performance", "strategy_snapshots", "evolution_log", "action_log"]:
                if table in tables:
                    cursor.execute(f"SELECT COUNT(*) FROM {table}")
                    count = cursor.fetchone()[0]
                    self.results["data_integrity"][f"{table}_count"] = count
                else:
                    self.results["data_integrity"][f"{table}_count"] = 0
            
            conn.close()
            self.results["data_integrity"]["database"] = "ok"
            
        except Exception as e:
            self.results["data_integrity"]["database"] = f"error: {str(e)[:100]}"
    
    def check_directories(self):
        """检查目录结构"""
        dirs = {
            "content": WORKFLOW_DIR / "content",
            "audio": WORKFLOW_DIR / "audio",
            "data": WORKFLOW_DIR / "data",
            "publish": WORKFLOW_DIR / "publish",
            "covers": WORKFLOW_DIR / "covers",
            "promotion": WORKFLOW_DIR / "promotion",
        }
        
        for name, path in dirs.items():
            if path.exists():
                file_count = len(list(path.iterdir()))
                self.results["directories"][name] = f"ok ({file_count} items)"
            else:
                self.results["directories"][name] = "missing"
    
    def check_scheduler_status(self):
        """检查调度器状态"""
        log_file = DATA_DIR / "scheduler.log"
        
        if log_file.exists():
            with open(log_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if lines:
                # Get last few lines
                last_lines = lines[-5:]
                self.results["scheduler"] = {
                    "status": "running",
                    "log_lines": len(lines),
                    "last_entry": last_lines[-1].strip() if last_lines else "empty",
                }
            else:
                self.results["scheduler"] = {"status": "empty", "log_lines": 0}
        else:
            self.results["scheduler"] = {"status": "not_found"}
    
    def determine_overall_status(self):
        """确定总体状态"""
        issues = []
        
        # Check modules
        for mod, status in self.results["modules"].items():
            if status != "ok":
                issues.append(f"Module {mod}: {status}")
        
        # Check dependencies
        for dep, status in self.results["dependencies"].items():
            if status == "missing":
                issues.append(f"Dependency {dep} missing")
        
        # Check data
        if self.results["data_integrity"].get("database") != "ok":
            issues.append("Database issue")
        
        if issues:
            self.results["overall_status"] = "degraded"
            self.results["issues"] = issues
        else:
            self.results["overall_status"] = "healthy"
            self.results["issues"] = []
    
    def print_report(self):
        """打印健康报告"""
        print("=" * 60)
        print("🏥 系统健康报告")
        print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Overall status
        status_icon = {"healthy": "🟢", "degraded": "🟡", "unknown": "⚪"}
        icon = status_icon.get(self.results["overall_status"], "❓")
        print(f"\n{icon} 总体状态: {self.results['overall_status'].upper()}")
        
        if self.results["issues"]:
            print("\n⚠️ 发现问题:")
            for issue in self.results["issues"]:
                print(f"   - {issue}")
        
        # Modules
        print("\n📦 模块状态:")
        for mod, status in self.results["modules"].items():
            icon = "✅" if status == "ok" else "❌"
            print(f"   {icon} {mod}: {status}")
        
        # Dependencies
        print("\n📚 依赖状态:")
        for dep, status in self.results["dependencies"].items():
            icon = "✅" if "ok" in status else "❌"
            print(f"   {icon} {dep}: {status}")
        
        # Data
        print("\n💾 数据完整性:")
        for key, value in self.results["data_integrity"].items():
            print(f"   {key}: {value}")
        
        # Directories
        print("\n📁 目录结构:")
        for name, status in self.results["directories"].items():
            icon = "✅" if "ok" in status else "❌"
            print(f"   {icon} {name}: {status}")
        
        # Scheduler
        scheduler = self.results.get("scheduler", {})
        print(f"\n⏰ 调度器: {scheduler.get('status', 'unknown')}")
        if scheduler.get("last_entry"):
            print(f"   最新: {scheduler['last_entry']}")
        
        print("\n" + "=" * 60)
    
    def save_report(self):
        """保存报告到文件"""
        report_file = DATA_DIR / f"health_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.results, f, ensure_ascii=False, indent=2)
        return report_file


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    health = SystemHealth()
    health.check_all()
    health.print_report()
    
    report_file = health.save_report()
    print(f"\n📁 报告已保存: {report_file.name}")
