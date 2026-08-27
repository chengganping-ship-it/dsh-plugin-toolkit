#!/usr/bin/env python3
"""
定时调度器 — 让系统24/7自动运行
===============================
基于 APScheduler，无需人类触发。

功能：
- 每日02:00 运行自循环（复盘+策略进化）
- 每日03:00 生成音频（利用空闲时间）
- 每周一09:00 生成周报
- 每月1号10:00 生成月报+长期策略调整
"""

import os
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    from apscheduler.schedulers.blocking import BlockingScheduler
    from apscheduler.triggers.cron import CronTrigger
except ImportError:
    print("安装 APScheduler...")
    os.system(f"{sys.executable} -m pip install apscheduler --index-url https://pypi.org/simple/")
    from apscheduler.schedulers.blocking import BlockingScheduler
    from apscheduler.triggers.cron import CronTrigger

from memory_store import MemoryStore, seed_initial_hypotheses
from self_loop_engine import SelfLoopEngine


WORKFLOW_DIR = Path(__file__).parent
LOG_FILE = WORKFLOW_DIR / "data" / "scheduler.log"


def log(msg):
    """记录日志"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(line + "\n")


def job_self_loop():
    """每日自循环任务"""
    log("🔄 开始每日自循环")
    try:
        engine = SelfLoopEngine()
        obs, actions, report = engine.run_loop()
        log(f"自循环完成，生成 {len(actions)} 个行动")
    except Exception as e:
        log(f"自循环错误: {e}")


def job_ai_deep_analysis():
    """每日AI深度分析 — 利用免费API额度"""
    log("🤖 开始AI深度分析")
    try:
        engine = SelfLoopEngine()
        result = engine.ai_daily_analysis()
        if result:
            log(f"AI分析完成，长度: {len(result)} 字")
        else:
            log("AI分析跳过（无API key或额度用尽）")
    except Exception as e:
        log(f"AI分析错误: {e}")


def job_generate_content():
    """每日内容生成任务"""
    log("🎵 开始内容生成")
    try:
        # 调用 workflow engine 处理下一篇内容
        content_dir = WORKFLOW_DIR / "content"
        audio_dir = WORKFLOW_DIR / "audio"

        # 找出尚未处理的文本文件
        processed = set()
        for d in audio_dir.iterdir():
            if d.is_dir():
                processed.add(d.name)

        for txt_file in sorted(content_dir.glob("*.txt")):
            chapter_name = txt_file.stem
            if chapter_name not in processed:
                log(f"处理: {txt_file.name}")
                # 调用 workflow
                os.system(
                    f'cd "{WORKFLOW_DIR}" && '
                    f'"{sys.executable}" workflow_engine.py run --file "{txt_file}"'
                )
                log(f"完成: {txt_file.name}")
                break  # 每天只处理一篇
    except Exception as e:
        log(f"内容生成错误: {e}")


def job_data_collection():
    """每日数据采集"""
    log("📊 开始数据采集")
    try:
        from data_collector import DataCollector
        collector = DataCollector()
        results = collector.collect_all()
        log(f"数据采集完成: {len(results)} 个平台")
    except Exception as e:
        log(f"数据采集错误: {e}")


def job_auto_publish():
    """自动发布（需要登录态）"""
    log("📤 开始自动发布")
    try:
        from publish_automation import PublishAutomation
        # 找到最新的发布清单
        checklists = sorted((WORKFLOW_DIR / "publish").glob("checklist_*.json"), reverse=True)
        if not checklists:
            log("没有待发布的清单")
            return

        latest = checklists[0]
        log(f"发布清单: {latest.name}")

        pub = PublishAutomation(headless=True, auto_submit=False)
        try:
            pub._init_browser()
            results = pub.publish_from_checklist(str(latest))
            for r in results:
                log(f"  {r.get('platform')}: {r.get('status')}")
        finally:
            pub.close()

    except Exception as e:
        log(f"自动发布错误: {e}")


def job_weekly_report():
    """每周一生成周报"""
    log("📊 生成周报")
    try:
        engine = SelfLoopEngine()
        report = engine.generate_automated_report()
        log("周报已生成")
    except Exception as e:
        log(f"周报错误: {e}")


def job_monthly_strategy():
    """每月1号调整长期策略"""
    log("🧬 月度策略调整")
    try:
        memory = MemoryStore()
        # 获取月度数据
        platform_comparison = memory.get_platform_comparison()
        best_content = memory.get_best_performing("plays", 10)

        log(f"平台数据: {len(platform_comparison)} 个平台")
        log(f"最佳内容: {len(best_content)} 篇")

        # 记录到进化日志
        if platform_comparison:
            best_platoform = max(platform_comparison, key=lambda x: x.get("total_plays", 0))
            memory.log_evolution(
                "monthly_review",
                "ongoing",
                f"focus_on_{best_platoform.get('platform', 'unknown')}",
                f"月度数据驱动策略调整，最佳平台: {best_platoform.get('platform', 'unknown')}"
            )

        log("月度策略调整完成")
    except Exception as e:
        log(f"月度调整错误: {e}")


def main():
    """启动调度器"""
    # 确保目录和初始数据
    (WORKFLOW_DIR / "data").mkdir(exist_ok=True)
    memory = MemoryStore()
    summary = memory.get_memory_summary()
    if summary["hypotheses_total"] == 0:
        seed_initial_hypotheses(memory)
        log("已种入初始假设和策略")

    scheduler = BlockingScheduler(timezone="Asia/Shanghai")

    # 任务1：每日02:00 自循环（复盘+策略进化）
    scheduler.add_job(
        job_self_loop,
        CronTrigger(hour=2, minute=0),
        id="daily_self_loop",
        name="每日自循环",
        replace_existing=True,
    )

    # 任务2：每日02:30 AI深度分析
    scheduler.add_job(
        job_ai_deep_analysis,
        CronTrigger(hour=2, minute=30),
        id="daily_ai_analysis",
        name="每日AI深度分析",
        replace_existing=True,
    )

    # 任务3：每日03:00 内容生成
    scheduler.add_job(
        job_generate_content,
        CronTrigger(hour=3, minute=0),
        id="daily_content",
        name="每日内容生成",
        replace_existing=True,
    )

    # 任务4：每日09:00 数据采集（手动模式提醒）
    scheduler.add_job(
        job_data_collection,
        CronTrigger(hour=9, minute=0),
        id="daily_data_collection",
        name="每日数据采集",
        replace_existing=True,
    )

    # 任务5：每日22:00 自动发布
    scheduler.add_job(
        job_auto_publish,
        CronTrigger(hour=22, minute=0),
        id="daily_auto_publish",
        name="每日自动发布",
        replace_existing=True,
    )

    # 任务3：每周一09:00 周报
    scheduler.add_job(
        job_weekly_report,
        CronTrigger(day_of_week="mon", hour=9, minute=0),
        id="weekly_report",
        name="每周报告",
        replace_existing=True,
    )

    # 任务4：每月1号10:00 长期策略
    scheduler.add_job(
        job_monthly_strategy,
        CronTrigger(day=1, hour=10, minute=0),
        id="monthly_strategy",
        name="每月策略调整",
        replace_existing=True,
    )

    log("=" * 50)
    log("🚀 克苏鲁有声书 自动调度器已启动")
    log("   时区: Asia/Shanghai")
    log("   任务: 每日自循环(02:00) + 内容生成(03:00) + 周报(周一09:00) + 月策略(1号10:00)")
    log("   按 Ctrl+C 退出")
    log("=" * 50)

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        log("调度器已停止")
    except Exception as e:
        log(f"调度器错误: {e}")


if __name__ == "__main__":
    main()
