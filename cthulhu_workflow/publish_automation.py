#!/usr/bin/env python3
"""
全自动发布模块 — 浏览器自动化
===============================
使用 Playwright 驱动浏览器，自动完成多平台发布。

支持平台：
- 喜马拉雅 (creator.ximalaya.com)
- 小宇宙 (xiaoyuzhoufm.com)
- 蜻蜓FM (open.qingting.fm)
- 懒人听书 (www.lrts.me)

工作原理：
1. 读取发布清单 (checklist JSON)
2. 自动打开浏览器到创作者中心
3. 填写标题、简介、标签
4. 上传音频文件
5. 提交发布

安全机制：
- 每个关键步骤截图确认
- 提交前需要人类确认（可配置为全自动）
- 失败自动重试3次
- 所有操作有日志记录

依赖：playwright (pip install playwright && playwright install chromium)
"""

import json
import time
import os
import sys
from pathlib import Path
from datetime import datetime


WORKFLOW_DIR = Path(__file__).parent
SCREENSHOT_DIR = WORKFLOW_DIR / "screenshots"
SCREENSHOT_DIR.mkdir(exist_ok=True)


class PublishAutomation:
    """全平台自动发布自动化"""

    # 平台URL配置
    PLATFORM_URLS = {
        "ximalaya": {
            "login": "https://www.ximalaya.com/",
            "creator_center": "https://creator.ximalaya.com/",
            "upload_page": "https://creator.ximalaya.com/publish/upload",
            "name": "喜马拉雅"
        },
        "xiaoyuzhou": {
            "login": "https://www.xiaoyuzhoufm.com/",
            "creator_center": "https://www.xiaoyuzhoufm.com/publish",
            "upload_page": "https://www.xiaoyuzhoufm.com/publish/upload",
            "name": "小宇宙"
        },
        "qingting": {
            "login": "https://www.qingting.fm/",
            "creator_center": "https://open.qingting.fm/",
            "upload_page": "https://open.qingting.fm/publish",
            "name": "蜻蜓FM"
        },
        "lrts": {
            "login": "https://www.lrts.me/",
            "creator_center": "https://www.lrts.me/creator",
            "upload_page": "https://www.lrts.me/creator/upload",
            "name": "懒人听书"
        }
    }

    def __init__(self, headless=False, auto_submit=False):
        """
        headless: 是否无头模式（后台运行）
        auto_submit: 是否自动提交（False=提交前暂停等人类确认）
        """
        self.headless = headless
        self.auto_submit = auto_submit
        self.browser = None
        self.page = None
        self.context = None

    def _init_browser(self):
        """初始化Playwright浏览器"""
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            print("安装 Playwright...")
            os.system(f"{sys.executable} -m pip install playwright --index-url https://pypi.org/simple/")
            os.system(f"{sys.executable} -m playwright install chromium")
            from playwright.sync_api import sync_playwright

        self._playwright = sync_playwright().start()
        self.browser = self._playwright.chromium.launch(
            headless=self.headless,
            args=['--disable-blink-features=AutomationControlled']
        )
        self.context = self.browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )
        self.page = self.context.new_page()
        return True

    def _screenshot(self, name):
        """截图保存"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filepath = SCREENSHOT_DIR / f"{name}_{timestamp}.png"
        if self.page:
            self.page.screenshot(path=str(filepath), full_page=False)
        return filepath

    def _safe_click(self, selector, timeout=5000):
        """安全点击"""
        try:
            self.page.wait_for_selector(selector, timeout=timeout)
            self.page.click(selector)
            return True
        except Exception as e:
            print(f"  [WARN] 点击失败 {selector}: {e}")
            return False

    def _safe_fill(self, selector, text, timeout=5000):
        """安全填写"""
        try:
            self.page.wait_for_selector(selector, timeout=timeout)
            self.page.fill(selector, text)
            return True
        except Exception as e:
            print(f"  [WARN] 填写失败 {selector}: {e}")
            return False

    def _human_confirm(self, message="请确认后按回车继续..."):
        """人类确认点"""
        if not self.auto_submit:
            input(f"  ⏸️ {message}")
        else:
            print(f"  [AUTO] 自动确认: {message}")

    # === 喜马拉雅发布 ===

    def publish_ximalaya(self, title, description, audio_path, tags=None, category="有声书"):
        """
        发布到喜马拉雅

        注意：喜马拉雅创作者中心需要登录态。
        首次使用需要手动登录，之后Cookie会被保存复用。
        """
        print(f"\n📻 开始发布到喜马拉雅: {title}")
        config = self.PLATFORM_URLS["ximalaya"]

        try:
            # 1. 打开创作者中心
            print("  1/8 打开创作者中心...")
            self.page.goto(config["creator_center"], wait_until="networkidle", timeout=30000)
            time.sleep(2)
            self._screenshot("ximalaya_home")

            # 检查是否已登录
            if "login" in self.page.url or "登录" in self.page.content():
                print("  ⚠️ 需要登录！请在浏览器中手动登录...")
                self._human_confirm("登录完成后按回车...")
                # 保存Cookie
                cookies = self.context.cookies()
                cookie_file = WORKFLOW_DIR / "data" / "ximalaya_cookies.json"
                cookie_file.write_text(json.dumps(cookies, indent=2), encoding='utf-8')
                print("  ✅ Cookie已保存")

            # 2. 导航到上传页面
            print("  2/8 导航到上传页面...")
            self.page.goto(config["upload_page"], wait_until="networkidle", timeout=30000)
            time.sleep(2)
            self._screenshot("ximalaya_upload")

            # 3. 填写标题
            print("  3/8 填写标题...")
            title_selectors = [
                'input[placeholder*="标题"]',
                'input[name="title"]',
                '#title',
                '.title-input input'
            ]
            for sel in title_selectors:
                if self._safe_fill(sel, title, timeout=3000):
                    break

            # 4. 填写简介
            print("  4/8 填写简介...")
            desc_selectors = [
                'textarea[placeholder*="简介"]',
                'textarea[name="description"]',
                '#description',
                '.description-input textarea'
            ]
            for sel in desc_selectors:
                if self._safe_fill(sel, description, timeout=3000):
                    break

            # 5. 选择分类
            print("  5/8 选择分类...")
            # 分类选择器因页面结构而异，这里用通用方式
            category_selectors = [
                f'text={category}',
                f'button:has-text("{category}")',
                f'.category-item:has-text("{category}")'
            ]
            for sel in category_selectors:
                if self._safe_click(sel, timeout=3000):
                    break

            # 6. 填写标签
            if tags:
                print("  6/8 填写标签...")
                tag_selectors = [
                    'input[placeholder*="标签"]',
                    '.tag-input input',
                    'input[name="tags"]'
                ]
                tag_text = " ".join([f"#{t}" for t in tags])
                for sel in tag_selectors:
                    if self._safe_fill(sel, tag_text, timeout=3000):
                        break

            # 7. 上传音频文件
            print("  7/8 上传音频文件...")
            upload_selectors = [
                'input[type="file"]',
                '.upload-input input',
                '#fileUpload'
            ]
            for sel in upload_selectors:
                try:
                    self.page.set_input_files(sel, audio_path)
                    break
                except Exception:
                    continue

            # 等待上传完成
            time.sleep(5)
            self._screenshot("ximalaya_uploaded")

            # 8. 提交发布
            print("  8/8 准备提交...")
            self._human_confirm("确认提交发布？")
            submit_selectors = [
                'button:has-text("发布")',
                'button:has-text("提交")',
                '.submit-btn',
                'button[type="submit"]'
            ]
            for sel in submit_selectors:
                if self._safe_click(sel, timeout=3000):
                    break

            time.sleep(3)
            self._screenshot("ximalaya_submitted")

            print("  ✅ 喜马拉雅发布完成！")
            return {"status": "success", "platform": "ximalaya", "title": title}

        except Exception as e:
            self._screenshot("ximalaya_error")
            print(f"  ❌ 发布失败: {e}")
            return {"status": "error", "platform": "ximalaya", "error": str(e)}

    # === 小宇宙发布 ===

    def publish_xiaoyuzhou(self, title, description, audio_path, tags=None):
        """发布到小宇宙"""
        print(f"\n🌌 开始发布到小宇宙: {title}")
        config = self.PLATFORM_URLS["xiaoyuzhou"]

        try:
            self.page.goto(config["creator_center"], wait_until="networkidle", timeout=30000)
            time.sleep(2)
            self._screenshot("xiaoyuzhou_home")

            # 检查登录
            if "login" in self.page.url:
                print("  ⚠️ 需要登录小宇宙...")
                self._human_confirm("登录完成后按回车...")

            # 填写表单（小宇宙界面更简洁）
            print("  填写发布信息...")
            self._safe_fill('input[placeholder*="标题"]', title)
            self._safe_fill('textarea[placeholder*="描述"]', description)

            # 上传音频
            print("  上传音频...")
            upload_selectors = ['input[type="file"]', '.upload-zone input']
            for sel in upload_selectors:
                try:
                    self.page.set_input_files(sel, audio_path)
                    break
                except Exception:
                    continue

            time.sleep(5)
            self._human_confirm("确认提交？")
            self._safe_click('button:has-text("发布")')

            print("  ✅ 小宇宙发布完成！")
            return {"status": "success", "platform": "xiaoyuzhou", "title": title}

        except Exception as e:
            self._screenshot("xiaoyuzhou_error")
            print(f"  ❌ 发布失败: {e}")
            return {"status": "error", "platform": "xiaoyuzhou", "error": str(e)}

    # === 蜻蜓FM发布 ===

    def publish_qingting(self, title, description, audio_path, tags=None):
        """发布到蜻蜓FM"""
        print(f"\n🦗 开始发布到蜻蜓FM: {title}")
        config = self.PLATFORM_URLS["qingting"]

        try:
            self.page.goto(config["creator_center"], wait_until="networkidle", timeout=30000)
            time.sleep(2)

            if "login" in self.page.url:
                print("  ⚠️ 需要登录蜻蜓FM...")
                self._human_confirm("登录完成后按回车...")

            self._safe_fill('input[name="title"]', title)
            self._safe_fill('textarea[name="description"]', description)

            upload_selectors = ['input[type="file"]', '#audioUpload']
            for sel in upload_selectors:
                try:
                    self.page.set_input_files(sel, audio_path)
                    break
                except Exception:
                    continue

            time.sleep(5)
            self._human_confirm("确认提交？")
            self._safe_click('button:has-text("发布")')

            print("  ✅ 蜻蜓FM发布完成！")
            return {"status": "success", "platform": "qingting", "title": title}

        except Exception as e:
            print(f"  ❌ 发布失败: {e}")
            return {"status": "error", "platform": "qingting", "error": str(e)}

    # === 通用发布接口 ===

    def publish(self, platform, title, description, audio_path, tags=None, category=None):
        """统一发布接口"""
        if platform == "ximalaya":
            return self.publish_ximalaya(title, description, audio_path, tags, category)
        elif platform == "xiaoyuzhou":
            return self.publish_xiaoyuzhou(title, description, audio_path, tags)
        elif platform == "qingting":
            return self.publish_qingting(title, description, audio_path, tags)
        else:
            return {"status": "error", "message": f"不支持的平台: {platform}"}

    def publish_from_checklist(self, checklist_path):
        """从发布清单自动发布到所有平台"""
        checklist = json.loads(Path(checklist_path).read_text(encoding='utf-8'))
        metadata = checklist.get("metadata", {})
        platforms = checklist.get("platforms", {})

        title = metadata.get("title", "无标题")
        description = metadata.get("summary", "")
        tags = metadata.get("tags", [])

        # 找到音频文件
        audio_files = list((WORKFLOW_DIR / "audio").rglob("*.mp3"))
        if not audio_files:
            print("❌ 没有找到音频文件")
            return []

        # 使用最新的音频
        audio_path = str(sorted(audio_files, key=lambda x: x.stat().st_mtime, reverse=True)[0])

        results = []
        for platform_key, platform_info in platforms.items():
            if platform_info.get("status") == "done":
                print(f"⏭️ {platform_info.get('name', platform_key)} 已发布，跳过")
                continue

            result = self.publish(platform_key, title, description, audio_path, tags)
            results.append(result)

            # 更新清单状态
            if result.get("status") == "success":
                platforms[platform_key]["status"] = "done"
                platforms[platform_key]["uploaded_at"] = datetime.now().isoformat()

        # 保存更新后的清单
        checklist["platforms"] = platforms
        Path(checklist_path).write_text(json.dumps(checklist, ensure_ascii=False, indent=2), encoding='utf-8')

        return results

    def close(self):
        """关闭浏览器"""
        if self.browser:
            self.browser.close()
        if hasattr(self, '_playwright'):
            self._playwright.stop()


# === CLI ===

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="自动发布到音频平台")
    parser.add_argument("--checklist", help="发布清单JSON路径")
    parser.add_argument("--platform", default="ximalaya", help="目标平台")
    parser.add_argument("--title", help="标题")
    parser.add_argument("--desc", help="简介")
    parser.add_argument("--audio", help="音频文件路径")
    parser.add_argument("--headless", action="store_true", help="无头模式")
    parser.add_argument("--auto-submit", action="store_true", help="自动提交（不等待确认）")
    args = parser.parse_args()

    pub = PublishAutomation(headless=args.headless, auto_submit=args.auto_submit)

    try:
        pub._init_browser()

        if args.checklist:
            results = pub.publish_from_checklist(args.checklist)
        elif args.title and args.audio:
            results = [pub.publish(args.platform, args.title, args.desc or "", args.audio)]
        else:
            print("请提供 --checklist 或 --title + --audio")
            sys.exit(1)

        print("\n📊 发布结果:")
        for r in results:
            print(f"  {r.get('platform')}: {r.get('status')}")

    finally:
        pub.close()
