#!/usr/bin/env python3
"""
全自动驾驶模块 — 一键启动整个闭环
====================================
用户只需运行这一个文件，系统就会自动：
1. 生成音频
2. 发布到所有平台
3. 采集数据
4. 复盘分析
5. 进化策略

这是整个系统的"大脑"，协调所有子模块工作。

使用方式：
  python full_autopilot.py          # 完整运行一次
  python full_autopilot.py --loop   # 持续循环运行
  python full_autopilot.py --once   # 只运行一次
"""

import os
import sys
import time
import json
from datetime import datetime
from pathlib import Path


WORKFLOW_DIR = Path(__file__).parent


def run_full_cycle():
    """运行一次完整的闭环"""
    print("=" * 60)
    print("🚀 克苏鲁有声书 全自动驾驶 — 完整闭环")
    print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    results = {
        "timestamp": datetime.now().isoformat(),
        "steps": {}
    }

    # === Step 1: 内容生产 ===
    print("\n📖 Step 1: 内容生产")
    print("-" * 40)
    try:
        from workflow_engine import CthulhuWorkflow
        workflow = CthulhuWorkflow()

        # 找到下一篇待处理的文本
        content_dir = WORKFLOW_DIR / "content"
        audio_dirs = set()
        for d in (WORKFLOW_DIR / "audio").iterdir():
            if d.is_dir():
                audio_dirs.add(d.name)

        next_content = None
        for txt_file in sorted(content_dir.glob("*.txt")):
            if txt_file.stem not in audio_dirs:
                next_content = str(txt_file)
                break

        if next_content:
            print(f"  处理: {Path(next_content).name}")
            import asyncio
            result = asyncio.run(workflow.run_full_pipeline(next_content))
            results["steps"]["content"] = {"status": "success", "result": str(result)[:200]}
            print(f"  ✅ 内容生产完成")
        else:
            results["steps"]["content"] = {"status": "skipped", "reason": "无新内容"}
            print("  ⏭️ 没有新内容需要处理")

    except Exception as e:
        results["steps"]["content"] = {"status": "error", "error": str(e)}
        print(f"  ❌ 内容生产失败: {e}")

    # === Step 2: 发布上架 ===
    print("\n📤 Step 2: 发布上架")
    print("-" * 40)
    try:
        from publish_automation import PublishAutomation
        checklists = sorted((WORKFLOW_DIR / "publish").glob("checklist_*.json"), reverse=True)

        if checklists:
            pub = PublishAutomation(headless=True, auto_submit=False)
            try:
                pub._init_browser()
                pub_results = pub.publish_from_checklist(str(checklists[0]))
                results["steps"]["publish"] = {"status": "success", "results": pub_results}
                print(f"  ✅ 发布完成: {len(pub_results)} 个平台")
            finally:
                pub.close()
        else:
            results["steps"]["publish"] = {"status": "skipped", "reason": "无发布清单"}
            print("  ⏭️ 没有待发布的清单")

    except Exception as e:
        results["steps"]["publish"] = {"status": "error", "error": str(e)}
        print(f"  ❌ 发布失败: {e}")

    # === Step 3: 数据采集 ===
    print("\n📊 Step 3: 数据采集")
    print("-" * 40)
    try:
        from data_collector import DataCollector
        collector = DataCollector()
        collect_results = collector.collect_all()
        results["steps"]["data"] = {"status": "success", "platforms": len(collect_results)}
        print(f"  ✅ 数据采集完成: {len(collect_results)} 个平台")

    except Exception as e:
        results["steps"]["data"] = {"status": "error", "error": str(e)}
        print(f"  ❌ 数据采集失败: {e}")

    # === Step 4: 复盘分析 ===
    print("\n📝 Step 4: 复盘分析")
    print("-" * 40)
    try:
        from self_loop_engine import SelfLoopEngine
        engine = SelfLoopEngine()
        obs, actions, report = engine.run_loop()
        results["steps"]["review"] = {"status": "success", "actions": len(actions)}
        print(f"  ✅ 复盘完成: 生成 {len(actions)} 个行动")

    except Exception as e:
        results["steps"]["review"] = {"status": "error", "error": str(e)}
        print(f"  ❌ 复盘失败: {e}")

    # === Step 5: 总结 ===
    print("\n" + "=" * 60)
    print("📋 闭环运行报告")
    print("=" * 60)

    for step_name, step_result in results["steps"].items():
        status_icon = {"success": "✅", "error": "❌", "skipped": "⏭️"}.get(step_result.get("status"), "❓")
        print(f"  {status_icon} {step_name}: {step_result.get('status')}")

    # 保存报告
    report_file = WORKFLOW_DIR / "data" / f"autopilot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    report_file.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f"\n📁 报告已保存: {report_file.name}")

    return results


def run_continuous(interval_hours=24):
    """持续循环运行"""
    print("🔄 启动持续循环模式")
    print(f"   间隔: {interval_hours} 小时")
    print(f"   按 Ctrl+C 停止")
    print()

    cycle = 0
    while True:
        cycle += 1
        print(f"\n{'='*60}")
        print(f"🔄 第 {cycle} 次循环")
        print(f"{'='*60}")

        try:
            run_full_cycle()
        except Exception as e:
            print(f"❌ 循环 {cycle} 出错: {e}")

        next_run = datetime.now().timestamp() + interval_hours * 3600
        next_run_str = datetime.fromtimestamp(next_run).strftime('%Y-%m-%d %H:%M')
        print(f"\n⏰ 下次运行: {next_run_str}")
        print(f"   等待 {interval_hours} 小时...")

        try:
            time.sleep(interval_hours * 3600)
        except KeyboardInterrupt:
            print("\n\n⏹️ 用户中断，停止循环")
            break


# === CLI ===

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="克苏鲁有声书 全自动驾驶")
    parser.add_argument("--loop", action="store_true", help="持续循环运行")
    parser.add_argument("--interval", type=int, default=24, help="循环间隔(小时)")
    parser.add_argument("--once", action="store_true", help="只运行一次(默认)")
    args = parser.parse_args()

    if args.loop:
        run_continuous(args.interval)
    else:
        run_full_cycle()
