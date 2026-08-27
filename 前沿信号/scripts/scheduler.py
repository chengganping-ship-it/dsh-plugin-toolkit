#!/usr/bin/env python3
"""
前沿信号 - 定时任务调度器
每日自动采集 + 生成报告 + 发送邮件
"""

import os
import sys
import time
import subprocess
from datetime import datetime
from pathlib import Path

try:
    import schedule
except ImportError:
    print("[ERROR] 缺少 schedule 库，请运行: pip install schedule")
    sys.exit(1)

# 路径配置 - 使用 pathlib 实现跨平台兼容
BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = BASE_DIR / "scripts"
COLLECTOR_SCRIPT = SCRIPTS_DIR / "collector.py"
REPORT_GENERATOR_SCRIPT = SCRIPTS_DIR / "report_generator.py"
EMAIL_SENDER_SCRIPT = SCRIPTS_DIR / "email_sender.py"


def run_collection():
    """执行数据采集"""
    print(f"[{datetime.now()}] 开始数据采集...")
    if not COLLECTOR_SCRIPT.exists():
        print(f"[ERROR] 采集脚本不存在: {COLLECTOR_SCRIPT}")
        return False
    result = subprocess.run(
        [sys.executable, str(COLLECTOR_SCRIPT)],
        cwd=str(BASE_DIR),
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"[ERROR] 采集失败: {result.stderr}")
        return False
    return True


def run_report():
    """生成日报"""
    print(f"[{datetime.now()}] 开始生成日报...")
    if not REPORT_GENERATOR_SCRIPT.exists():
        print(f"[ERROR] 报告生成脚本不存在: {REPORT_GENERATOR_SCRIPT}")
        return False
    result = subprocess.run(
        [sys.executable, str(REPORT_GENERATOR_SCRIPT)],
        cwd=str(BASE_DIR),
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"[ERROR] 报告生成失败: {result.stderr}")
        return False
    return True


def run_email():
    """发送邮件"""
    print(f"[{datetime.now()}] 开始发送邮件...")
    # 检查 SMTP 环境变量是否配置
    if not os.environ.get("SMTP_HOST"):
        print("[SKIP] SMTP 未配置（缺少 SMTP_HOST 环境变量），跳过邮件发送")
        return True
    if not EMAIL_SENDER_SCRIPT.exists():
        print(f"[ERROR] 邮件发送脚本不存在: {EMAIL_SENDER_SCRIPT}")
        return False
    result = subprocess.run(
        [sys.executable, str(EMAIL_SENDER_SCRIPT)],
        cwd=str(BASE_DIR),
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"[ERROR] 邮件发送失败: {result.stderr}")
        return False
    return True


def run_weekly():
    """生成周报"""
    print(f"[{datetime.now()}] 开始生成周报...")
    # TODO: 接入AI API生成深度周报
    pass


def run_daily_pipeline():
    """每日完整流程：采集 -> 生成报告 -> 发送邮件"""
    print(f"\n{'='*60}")
    print(f"前沿信号 - 每日流程启动 | {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")

    # Step 1: 采集
    if not run_collection():
        print("[PIPELINE] 采集失败，终止流程")
        return

    # Step 2: 生成报告
    if not run_report():
        print("[PIPELINE] 报告生成失败，终止流程")
        return

    # Step 3: 发送邮件（可选）
    run_email()

    print(f"\n[PIPELINE] 每日流程完成 | {datetime.now().strftime('%H:%M:%S')}")


# 每日早上7点执行完整流程
schedule.every().day.at("07:00").do(run_daily_pipeline)

# 每周一早上8点生成周报
schedule.every().monday.at("08:00").do(run_weekly)

print("[启动] 前沿信号定时任务已启动")
print(f"  项目目录: {BASE_DIR}")
print(f"  采集脚本: {COLLECTOR_SCRIPT}")
print(f"  报告脚本: {REPORT_GENERATOR_SCRIPT}")
print(f"  邮件脚本: {EMAIL_SENDER_SCRIPT}")
print("  - 每日 07:00 采集 + 生成报告 + 发送邮件")
print("  - 每周一 08:00 生成周报")
print("")

while True:
    schedule.run_pending()
    time.sleep(60)
