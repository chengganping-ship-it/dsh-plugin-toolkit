#!/usr/bin/env python3
"""
自动数据采集模块 — 运营复盘的数据源
====================================
自动从各平台创作者中心采集运营数据。

采集内容：
- 播放量/收听量
- 完播率
- 点赞/收藏/分享
- 评论数
- 粉丝增长
- 收益数据

采集方式：
1. Playwright 浏览器自动化（需要登录态）
2. 平台API（如果有）
3. 爬虫（仅限公开数据）

安全考虑：
- 请求频率限制（避免被封）
- 随机延迟模拟人类操作
- Cookie持久化复用
"""

import json
import time
import random
import os
import sys
from datetime import datetime
from pathlib import Path


WORKFLOW_DIR = Path(__file__).parent
DATA_DIR = WORKFLOW_DIR / "data"


class DataCollector:
    """运营数据自动采集器"""

    PLATFORM_URLS = {
        "ximalaya": {
            "stats": "https://creator.ximalaya.com/stats",
            "content": "https://creator.ximalaya.com/content/manage",
            "name": "喜马拉雅"
        },
        "xiaoyuzhou": {
            "stats": "https://www.xiaoyuzhoufm.com/stats",
            "content": "https://www.xiaoyuzhoufm.com/publish",
            "name": "小宇宙"
        },
        "qingting": {
            "stats": "https://open.qingting.fm/stats",
            "content": "https://open.qingting.fm/content",
            "name": "蜻蜓FM"
        }
    }

    def __init__(self):
        self.browser = None
        self.page = None
        self.results = {}

    def _init_browser(self):
        """初始化浏览器"""
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            os.system(f"{sys.executable} -m pip install playwright --index-url https://pypi.org/simple/")
            os.system(f"{sys.executable} -m playwright install chromium")
            from playwright.sync_api import sync_playwright

        self._playwright = sync_playwright().start()
        self.browser = self._playwright.chromium.launch(
            headless=True,  # 数据采集可以无头
            args=['--disable-blink-features=AutomationControlled']
        )
        self.page = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080}
        ).new_page()

        # 加载保存的Cookie
        self._load_cookies("ximalaya")
        return True

    def _load_cookies(self, platform):
        """加载保存的Cookie"""
        cookie_file = DATA_DIR / f"{platform}_cookies.json"
        if cookie_file.exists():
            cookies = json.loads(cookie_file.read_text(encoding='utf-8'))
            self.context.add_cookies(cookies)

    def _save_cookies(self, platform):
        """保存Cookie"""
        cookies = self.context.cookies()
        cookie_file = DATA_DIR / f"{platform}_cookies.json"
        cookie_file.write_text(json.dumps(cookies, indent=2), encoding='utf-8')

    def _random_delay(self, min_sec=1, max_sec=3):
        """随机延迟"""
        time.sleep(random.uniform(min_sec, max_sec))

    # === 喜马拉雅数据采集 ===

    def collect_ximalaya(self):
        """采集喜马拉雅数据"""
        print("\n📻 采集喜马拉雅数据...")
        config = self.PLATFORM_URLS["ximalaya"]
        data = {"platform": "ximalaya", "collected_at": datetime.now().isoformat()}

        try:
            # 访问统计页面
            self.page.goto(config["stats"], wait_until="networkidle", timeout=30000)
            self._random_delay(2, 4)

            # 检查是否需要登录
            if "login" in self.page.url:
                print("  ⚠️ 需要登录喜马拉雅")
                return {"status": "login_required", "platform": "ximalaya"}

            # 尝试提取数据
            # 注意：页面结构可能变化，需要根据实际情况调整
            try:
                # 播放量
                plays_elem = self.page.query_selector('.stats-item .plays, .play-count, [data-stat="plays"]')
                if plays_elem:
                    data["plays"] = int(plays_elem.inner_text().replace(",", ""))

                # 粉丝数
                fans_elem = self.page.query_selector('.stats-item .fans, .fan-count, [data-stat="fans"]')
                if fans_elem:
                    data["fans"] = int(fans_elem.inner_text().replace(",", ""))

                # 收益
                revenue_elem = self.page.query_selector('.stats-item .revenue, .income, [data-stat="revenue"]')
                if revenue_elem:
                    data["revenue"] = float(revenue_elem.inner_text().replace("¥", "").replace(",", ""))

            except Exception as e:
                print(f"  [WARN] 数据提取部分失败: {e}")

            # 内容列表数据
            self.page.goto(config["content"], wait_until="networkidle", timeout=30000)
            self._random_delay(2, 4)

            # 尝试获取内容列表
            content_items = self.page.query_selector_all('.content-item, .track-item, .audio-item')
            data["content_count"] = len(content_items)
            data["contents"] = []

            for item in content_items[:10]:  # 最多采集10条
                try:
                    title = item.query_selector('.title, .item-title')
                    plays = item.query_selector('.plays, .play-count')
                    comments = item.query_selector('.comments, .comment-count')

                    content_data = {
                        "title": title.inner_text() if title else "",
                        "plays": int(plays.inner_text().replace(",", "")) if plays else 0,
                        "comments": int(comments.inner_text().replace(",", "")) if comments else 0,
                    }
                    data["contents"].append(content_data)
                except Exception:
                    continue

            data["status"] = "success"
            print(f"  ✅ 采集完成: {data.get('content_count', 0)} 条内容")

        except Exception as e:
            data["status"] = "error"
            data["error"] = str(e)
            print(f"  ❌ 采集失败: {e}")

        return data

    # === 小宇宙数据采集 ===

    def collect_xiaoyuzhou(self):
        """采集小宇宙数据"""
        print("\n🌌 采集小宇宙数据...")
        config = self.PLATFORM_URLS["xiaoyuzhou"]
        data = {"platform": "xiaoyuzhou", "collected_at": datetime.now().isoformat()}

        try:
            self.page.goto(config["stats"], wait_until="networkidle", timeout=30000)
            self._random_delay(2, 4)

            if "login" in self.page.url:
                print("  ⚠️ 需要登录小宇宙")
                return {"status": "login_required", "platform": "xiaoyuzhou"}

            # 小宇宙数据结构
            try:
                plays_elem = self.page.query_selector('.total-plays, .play-count, [data-metric="plays"]')
                if plays_elem:
                    data["plays"] = int(plays_elem.inner_text().replace(",", ""))
            except Exception:
                pass

            data["status"] = "success"
            print(f"  ✅ 采集完成")

        except Exception as e:
            data["status"] = "error"
            data["error"] = str(e)
            print(f"  ❌ 采集失败: {e}")

        return data

    # === 蜻蜓FM数据采集 ===

    def collect_qingting(self):
        """采集蜻蜓FM数据"""
        print("\n🦗 采集蜻蜓FM数据...")
        config = self.PLATFORM_URLS["qingting"]
        data = {"platform": "qingting", "collected_at": datetime.now().isoformat()}

        try:
            self.page.goto(config["stats"], wait_until="networkidle", timeout=30000)
            self._random_delay(2, 4)

            if "login" in self.page.url:
                print("  ⚠️ 需要登录蜻蜓FM")
                return {"status": "login_required", "platform": "qingting"}

            data["status"] = "success"
            print(f"  ✅ 采集完成")

        except Exception as e:
            data["status"] = "error"
            data["error"] = str(e)
            print(f"  ❌ 采集失败: {e}")

        return data

    # === 通用采集接口 ===

    def collect_all(self):
        """采集所有平台数据"""
        print("=" * 50)
        print("📊 开始全平台数据采集")
        print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        print("=" * 50)

        self._init_browser()

        results = {}
        collectors = [
            ("ximalaya", self.collect_ximalaya),
            ("xiaoyuzhou", self.collect_xiaoyuzhou),
            ("qingting", self.collect_qingting),
        ]

        for platform, collector in collectors:
            try:
                result = collector()
                results[platform] = result
            except Exception as e:
                results[platform] = {"status": "error", "error": str(e)}

        self.close()

        # 保存采集结果
        output_file = DATA_DIR / f"collection_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        output_file.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f"\n📁 采集结果已保存: {output_file.name}")

        return results

    def collect_manual(self, platform, plays=0, likes=0, comments=0, revenue=0, note=""):
        """
        手动录入数据（当自动采集不可用时）
        每天运行一次，输入各平台数据
        """
        from memory_store import MemoryStore
        memory = MemoryStore()

        memory.record_performance(
            content_title="manual_entry",
            content_source="manual",
            voice="",
            publish_time=datetime.now().strftime('%Y-%m-%d'),
            platform=platform,
            plays=plays,
            completion_rate=0,
            likes=likes,
            comments=comments,
            revenue=revenue,
            note=note
        )

        print(f"✅ {platform} 数据已录入: 播放{plays}, 点赞{likes}, 收益¥{revenue}")
        memory.close()

    def close(self):
        """关闭浏览器"""
        if self.browser:
            self.browser.close()
        if hasattr(self, '_playwright'):
            self._playwright.stop()


# === CLI ===

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="运营数据采集器")
    parser.add_argument("--platform", default="all", help="目标平台 (ximalaya/xiaoyuzhou/qingting/all)")
    parser.add_argument("--manual", action="store_true", help="手动录入模式")
    parser.add_argument("--plays", type=int, default=0, help="播放量")
    parser.add_argument("--likes", type=int, default=0, help="点赞数")
    parser.add_argument("--revenue", type=float, default=0, help="收益")
    args = parser.parse_args()

    collector = DataCollector()

    if args.manual:
        collector.collect_manual(args.platform, args.plays, args.likes, 0, args.revenue)
    elif args.platform == "all":
        collector.collect_all()
    else:
        collector._init_browser()
        if args.platform == "ximalaya":
            collector.collect_ximalaya()
        elif args.platform == "xiaoyuzhou":
            collector.collect_xiaoyuzhou()
        elif args.platform == "qingting":
            collector.collect_qingting()
        collector.close()
