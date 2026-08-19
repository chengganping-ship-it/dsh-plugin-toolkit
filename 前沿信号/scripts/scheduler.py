#!/usr/bin/env python3
"""
前沿信号 - 定时任务调度器
每日自动采集 + 生成报告 + 发送邮件
"""

import schedule
import time
import subprocess
from datetime import datetime


def run_collection():
    """执行数据采集"""
    print(f"[{datetime.now()}] 开始数据采集...")
    result = subprocess.run(
        ["python", "collector.py"],
        cwd="/mnt/d/前沿信号/scripts",
        capture_output=True,
        text=True
    )
    print(result.stdout)
    if result.returncode != 0:
        print(f"[ERROR] 采集失败: {result.stderr}")


def run_report():
    """生成日报"""
    print(f"[{datetime.now()}] 开始生成日报...")
    # TODO: 接入AI API生成结构化日报
    pass


def run_weekly():
    """生成周报"""
    print(f"[{datetime.now()}] 开始生成周报...")
    # TODO: 接入AI API生成深度周报
    pass


# 每日早上7点执行采集+日报
schedule.every().day.at("07:00").do(run_collection)
schedule.every().day.at("07:30").do(run_report)

# 每周一早上8点生成周报
schedule.every().monday.at("08:00").do(run_weekly)

print("[启动] 前沿信号定时任务已启动")
print("  - 每日 07:00 数据采集")
print("  - 每日 07:30 生成日报")
print("  - 每周一 08:00 生成周报")

while True:
    schedule.run_pending()
    time.sleep(60)
