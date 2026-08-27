#!/usr/bin/env python3
"""
YouTube自动发布模块
====================
利用YouTube免费流量，将克苏鲁有声书变现。

收益模式：
1. YouTube广告收益 (4000小时观看 + 1000订阅)
2. 引流到其他平台（跨平台增长）
3. 有声书导流（免费→付费完整内容）

技术方案：
- 封面图 + MP3 → MP4视频 (ffmpeg)
- Playwright自动化上传（或YouTube API via OAuth）
- SEO优化标题/描述/标签
- 定时发布（每天/每周固定时间）

免费工具：
- ffmpeg: 图片+音频→视频
- YouTube Data API v3: 免费10K quota/天
- Playwright: 浏览器自动化上传

SEO关键：
- YouTube是全球第二大搜索引擎
- 恐怖/ASMR/睡眠内容需求巨大
- "有声书" "睡前故事" 关键词搜索量高
"""

import os
import re
import json
import time
import subprocess
from pathlib import Path
from datetime import datetime, timedelta


WORKFLOW_DIR = Path(__flow__).parent if '__flow__' in dir() else Path('.')
DATA_DIR = WORKFLOW_DIR / "data"
REVENUE_DIR = DATA_DIR / "revenue"
YOUTUBE_DIR = WORKFLOW_DIR / "youtube"


# ============================================================
# 视频合成器（封面图 + 音频 → MP4）
# ============================================================
class VideoComposer:
    """
    将封面图和音频合成为视频文件。
    
    使用ffmpeg命令行工具（免费），或使用Pillow+moviepy（纯Python）。
    """
    
    def __init__(self):
        YOUTUBE_DIR.mkdir(parents=True, exist_ok=True)
        self.ffmpeg_available = self._check_ffmpeg()
    
    def _check_ffmpeg(self):
        """检查ffmpeg是否可用"""
        try:
            result = subprocess.run(
                ['ffmpeg', '-version'],
                capture_output=True, text=True, timeout=10
            )
            return result.returncode == 0
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return False
    
    def compose_video(self, image_path, audio_path, output_path=None):
        """
        合成视频：静态图片 + 音频 → MP4
        
        Args:
            image_path: 封面图路径
            audio_path: 音频路径(mp3)
            output_path: 输出路径(可选)
        
        Returns:
            Path: 生成的视频文件路径
        """
        image_path = Path(image_path)
        audio_path = Path(audio_path)
        
        if not image_path.exists():
            raise FileNotFoundError(f"图片不存在: {image_path}")
        if not audio_path.exists():
            raise FileNotFoundError(f"音频不存在: {audio_path}")
        
        if output_path is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_path = YOUTUBE_DIR / f"video_{timestamp}.mp4"
        else:
            output_path = Path(output_path)
        
        if self.ffmpeg_available:
            return self._compose_with_ffmpeg(image_path, audio_path, output_path)
        else:
            return self._compose_with_moviepy(image_path, audio_path, output_path)
    
    def _compose_with_ffmpeg(self, image_path, audio_path, output_path):
        """使用ffmpeg合成视频（最快最可靠）"""
        cmd = [
            'ffmpeg', '-y',
            '-loop', '1',              # 循环图片
            '-i', str(image_path),     # 输入图片
            '-i', str(audio_path),     # 输入音频
            '-c:v', 'libx264',         # 视频编码
            '-tune', 'stillimage',     # 优化静态图片
            '-c:a', 'aac',             # 音频编码
            '-b:a', '192k',            # 音频比特率
            '-pix_fmt', 'yuv420p',     # 像素格式（YouTube兼容）
            '-shortest',               # 音频结束则停止
            '-movflags', '+faststart', # 优化网络播放
            str(output_path)
        ]
        
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=300
        )
        
        if result.returncode != 0:
            raise RuntimeError(f"ffmpeg失败: {result.stderr[:500]}")
        
        return output_path
    
    def _compose_with_moviepy(self, image_path, audio_path, output_path):
        """使用moviepy合成视频（纯Python备选）"""
        try:
            from moviepy.editor import ImageClip, AudioFileClip
        except ImportError:
            subprocess.run(['pip', 'install', 'moviepy', '-q'])
            from moviepy.editor import ImageClip, AudioFileClip
        
        audio = AudioFileClip(str(audio_path))
        video = ImageClip(str(image_path), duration=audio.duration)
        video = video.set_audio(audio)
        video.write_videofile(
            str(output_path),
            fps=1,                      # 静态图片用1fps足够
            codec='libx264',
            audio_codec='aac',
            bitrate='192k',
        )
        audio.close()
        video.close()
        
        return output_path
    
    def generate_cover_image(self, title, subtitle="", style="cthulhu"):
        """
        生成封面图（HTML→截图 或 使用Pillow直接绘制）
        
        免费方案：
        1. Pillow直接绘制文字+背景
        2. HTML截图（Playwright）
        """
        try:
            from PIL import Image, ImageDraw, ImageFont
        except ImportError:
            subprocess.run(['pip', 'install', 'Pillow', '-q'])
            from PIL import Image, ImageDraw, ImageFont
        
        # YouTube推荐尺寸: 1280x720 (16:9)
        width, height = 1280, 720
        
        # 创建暗色背景
        img = Image.new('RGB', (width, height), color=(10, 10, 20))
        draw = ImageDraw.Draw(img)
        
        # 添加简单的渐变效果
        for y in range(height):
            # 从深蓝到黑的渐变
            r = int(10 * (1 - y/height))
            g = int(10 * (1 - y/height))
            b = int(30 * (1 - y/height * 0.5))
            draw.line([(0, y), (width, y)], fill=(r, g, b))
        
        # 绘制文字
        # 尝试使用系统字体
        try:
            title_font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 72)
            subtitle_font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 36)
        except (IOError, OSError):
            try:
                title_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 72)
                subtitle_font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 36)
            except (IOError, OSError):
                title_font = ImageFont.load_default()
                subtitle_font = ImageFont.load_default()
        
        # 标题居中绘制
        title = title[:20]  # 限制长度
        bbox = draw.textbbox((0, 0), title, font=title_font)
        tw = bbox[2] - bbox[0]
        x = (width - tw) // 2
        y = height // 3
        
        # 文字阴影
        draw.text((x+3, y+3), title, fill=(0, 0, 0), font=title_font)
        draw.text((x, y), title, fill=(200, 180, 150), font=title_font)
        
        # 副标
        if subtitle:
            bbox2 = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            tw2 = bbox2[2] - bbox2[0]
            x2 = (width - tw2) // 2
            y2 = y + 120
            draw.text((x2+2, y2+2), subtitle, fill=(0, 0, 0), font=subtitle_font)
            draw.text((x2, y2), subtitle, fill=(150, 150, 170), font=subtitle_font)
        
        # 装饰元素：神秘符文风格
        # 画一个圆形符文
        circle_x, circle_y = width // 2, height * 3 // 4
        radius = 60
        draw.ellipse(
            [circle_x - radius, circle_y - radius, 
             circle_x + radius, circle_y + radius],
            outline=(100, 80, 60), width=2
        )
        
        # 保存
        output_path = YOUTUBE_DIR / f"cover_{int(time.time())}.jpg"
        img.save(str(output_path), "JPEG", quality=90)
        
        return output_path


# ============================================================
# YouTube SEO优化
# ============================================================
class YouTubeSEO:
    """YouTube SEO优化器"""
    
    # YouTube各品类热门关键词
    YOUTUBE_KEYWORDS = {
        "horror_audiobook": [
            "horror audiobook", "scary stories to sleep", "creepy podcast",
            "lovecraft audiobook", "cthulhu mythos", "cosmic horror",
            "睡前恐怖故事", "有声恐怖小说", "有声书", "催眠恐怖故事",
        ],
        "asmr_horror": [
            "dark asmr", "horror asmr", "scary asmr", "creepy ambient",
            "深海恐怖asmr", "宇宙恐怖asmr",
        ],
        "sleep_stories": [
            "stories to fall asleep", "boring stories to sleep", "sleep podcast",
            "睡前故事", "助眠故事", "深夜故事",
        ],
        "mythology": [
            "lovecraft mythology", "cthulhu explained", "lovecraft theory",
            "克苏鲁神话解读", "洛夫克拉夫特",
        ],
    }
    
    TITLE_TEMPLATES = [
        "{title} | 恐怖有声书 · 洛夫克拉夫特经典 | 睡前慎入",
        "{title} · 克苏鲁神话完整版 | Lovecraft Audiobook",
        "🌙 {title} | 深夜恐怖故事 · 无人敢听完 | 有声书",
        "【克苏鲁】{title} | 宇宙恐怖巅峰之作 | 完整朗读",
        "{title} | Horror Audiobook | Lovecraft | Full Length",
    ]
    
    def optimize(self, base_title, content_keywords=None):
        """生成YouTube优化的元数据"""
        # 选择最佳标题
        title_template = self.TITLE_TEMPLATES[hash(base_title) % len(self.TITLE_TEMPLATES)]
        title = title_template.format(title=base_title)
        
        # YouTube限制: 标题70字符，描述5000字符，标签500字符
        if len(title) > 70:
            title = title[:67] + "..."
        
        # 生成描述
        description = self._generate_description(base_title, content_keywords)
        
        # 生成标签
        tags = self._generate_tags(content_keywords)
        
        # 分类
        category_id = "22"  # People & Blogs
        # 备选: "24" Entertainment, "27" Education
        
        return {
            "title": title,
            "description": description,
            "tags": tags,
            "category_id": category_id,
            "privacy_status": "public",  # public, unlisted, private
        }
    
    def _generate_description(self, title, content_keywords=None):
        """生成视频描述"""
        desc = f"""{title}

🎧 完整克苏鲁神话有声书系列，带你体验洛夫克拉夫特的宇宙恐怖世界。

📖 本集内容: {title}

🔔 订阅频道，每周更新恐怖有声书:
[订阅链接]

📚 更多内容:
• 克苏鲁的呼唤完整系列
• 达贡 · 深海恐惧
• 疯狂山脉 · 南极恐怖
• 印斯茅斯之影 · 深海恐惧

🎙️ 关于本频道:
专注于经典恐怖文学有声录制，深夜收听效果最佳。

⏱️ 时间轴:
00:00 - 开始

---
#克苏鲁 #洛夫克拉夫特 #恐怖有声书 #Lovecraft #Cthulhu #有声书 #恐怖故事 #深夜故事
"""
        return desc
    
    def _generate_tags(self, content_keywords=None):
        """生成标签"""
        base_tags = [
            "lovecraft", "cthulhu", "horror", "audiobook", "克苏鲁",
            "洛夫克拉夫特", "恐怖有声书", "有声书", "恐怖故事",
            "cthulhu mythos", "cosmic horror", "宇宙恐怖", "深夜故事",
            "睡前故事", "scary stories", "lovecraft audiobook",
        ]
        
        if content_keywords:
            base_tags.extend(content_keywords[:10])
        
        # YouTube标签限制500字符
        tag_str = ",".join(base_tags)
        if len(tag_str) > 500:
            tag_str = tag_str[:497] + "..."
        
        return base_tags
    
    def get_best_publish_time(self, audience_region="CN"):
        """
        最佳发布时间（基于YouTube Analytics公开数据）
        """
        # 中文观众: 晚上21-23点（睡前时段）
        # 英文观众: 下午15-18点（美东早晨/欧洲中午）
        best_times = {
            "CN": {"hour": 22, "days": ["friday", "saturday", "sunday"]},
            "US": {"hour": 15, "days": ["friday", "saturday"]},
            "GLOBAL": {"hour": 18, "days": ["friday", "saturday", "sunday"]},
        }
        
        return best_times.get(audience_region, best_times["CN"])


# ============================================================
# YouTube自动化上传器
# ============================================================
class YouTubeUploader:
    """YouTube自动化上传（Playwright浏览器自动化）"""
    
    UPLOAD_URL = "https://www.youtube.com/upload"
    STUDIO_URL = "https://studio.youtube.com"
    
    def __init__(self):
        self.browser = None
        self.page = None
    
    def upload_video(self, video_path, metadata, credentials_path=None):
        """
        上传视频到YouTube
        
        两种方式:
        1. YouTube Data API v3 (需要OAuth 2.0, 免费10K quota/天)
        2. Playwright浏览器自动化(无需API key)
        
        默认: 浏览器自动化（无需配置）
        """
        if credentials_path and Path(credentials_path).exists():
            return self._upload_with_api(video_path, metadata, credentials_path)
        else:
            return self._upload_with_browser(video_path, metadata)
    
    def _upload_with_browser(self, video_path, metadata):
        """Playwright自动化上传"""
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            return {"status": "error", "message": "Playwright未安装"}
        
        results = {"status": "starting"}
        
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False)
            context = browser.new_context(
                viewport={'width': 1920, 'height': 1080}
            )
            page = context.new_page()
            
            try:
                # 1. 去YouTube Studio
                page.goto(self.STUDIO_URL, wait_until="networkidle", timeout=30000)
                
                # 检查是否需要登录
                if "signin" in page.url.lower() or "accounts.google" in page.url.lower():
                    results["status"] = "login_required"
                    results["message"] = "需要登录Google账号，请在浏览器中完成登录"
                    return results
                
                # 2. 点击"创建"按钮
                page.click('button:has-text("创建")', timeout=10000)
                time.sleep(1)
                page.click('text=上传视频', timeout=10000)
                time.sleep(2)
                
                # 3. 上传文件
                page.set_input_files('input[type="file"]', video_path)
                time.sleep(5)
                
                # 4. 填写标题
                title_input = page.query_selector('ytcp-social-suggestions-textbox #textbox')
                if title_input:
                    title_input.fill(metadata.get("title", ""))
                
                # 5. 填写描述
                desc_input = page.query_selector('ytcp-social-suggestions-textbox #textbox')
                if desc_input:
                    desc_input.nth(1).fill(metadata.get("description", "")[:5000])
                
                # 6. 填写标签
                tags_input = page.query_selector('ytcp-chip-bar #text-input')
                if tags_input:
                    tags_input.fill(",".join(metadata.get("tags", [])[:30]))
                
                # 7. 设置隐私
                page.click(f'ytcp-video-metadata-visibility tp-yt-paper-radio-button:has-text("{metadata.get("privacy_status", "public")}")')
                
                # 8. 保存
                page.click('ytcp-button:has-text("保存")')
                
                results["status"] = "uploaded"
                results["message"] = "视频已上传"
                results["title"] = metadata.get("title", "")
                
            except Exception as e:
                results["status"] = "error"
                results["message"] = str(e)[:200]
            
            finally:
                browser.close()
        
        return results
    
    def _upload_with_api(self, video_path, metadata, credentials_path):
        """YouTube Data API v3上传（需要OAuth）"""
        try:
            from googleapiclient.discovery import build
            from googleapiclient.http import MediaFileUpload
        except ImportError:
            subprocess.run(['pip', 'install', 'google-api-python-client', 'google-auth-oauthlib', '-q'])
            from googleapiclient.discovery import build
            from googleapiclient.http import MediaFileUpload
        
        # 需要OAuth 2.0凭证（额外配置）
        results = {"status": "not_implemented", "message": "API上传需要OAuth凭证，请先用浏览器方式登录"}
        return results


# ============================================================
# YouTube收益追踪
# ============================================================
class YouTubeRevenueTracker:
    """YouTube收益估算和追踪"""
    
    # 每千次观看收益（RPM，美元），恐怖/教育类较高
    RPM_BY_NICHE = {
        "horror_education": 3.0,    # $3 CPM
        "horror_entertainment": 2.0, # $2 CPM
        "general": 1.5,              # $1.5 CPM
        "asmr": 4.0,                 # $4 CPM
    }
    
    def estimate_revenue(self, views, niche="horror_education"):
        """估算收益"""
        rpm = self.RPM_BY_NICHE.get(niche, 2.0)
        return (views / 1000) * rpm
    
    def estimate_time_to_monetization(self, current_stats):
        """
        估算达到YouTube合作伙伴条件所需时间
        
        条件:
        - 1000 订阅
        - 4000 小时观看时长（12个月内）
        """
        current_subs = current_stats.get("subscribers", 0)
        current_hours = current_stats.get("watch_hours", 0)
        
        # 假设每视频获得X小时观看
        avg_hours_per_video = current_stats.get("avg_hours_per_video", 0)
        videos_per_month = current_stats.get("videos_per_month", 4)
        
        if avg_hours_per_video <= 0:
            return {"status": "no_data", "message": "没有足够数据估算"}
        
        # 估算
        subs_needed = max(0, 1000 - current_subs)
        hours_needed = max(0, 4000 - current_hours)
        
        if subs_needed == 0 and hours_needed == 0:
            return {"status": "qualified", "message": "已满足条件！申请YouTube合作伙伴"}
        
        months_by_hours = hours_needed / (avg_hours_per_video * videos_per_month)
        
        return {
            "status": "growing",
            "subs_needed": subs_needed,
            "hours_needed": hours_needed,
            "estimated_months": round(months_by_hours, 1),
            "on_track": months_by_hours <= 12,
        }


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "compose":
        # 合成视频
        video_composer = VideoComposer()
        print(f"ffmpeg可用: {video_composer.ffmpeg_available}")
        
        # 测试生成封面
        cover = video_composer.generate_cover_image("克苏鲁的呼唤", "宇宙恐怖巅峰")
        print(f"封面生成: {cover}")
        
        # 如果音频存在，合成视频
        audio_files = list(Path("audio").rglob("*.mp3"))
        if audio_files:
            newest_audio = sorted(audio_files, key=lambda x: x.stat().st_mtime, reverse=True)[0]
            print(f"最新音频: {newest_audio}")
            try:
                video = video_composer.compose_video(cover, newest_audio)
                print(f"视频合成: {video}")
            except Exception as e:
                print(f"合成失败: {e}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "seo":
        seo = YouTubeSEO()
        result = seo.optimize("克苏鲁的呼唤", ["恐怖", "洛夫克拉夫特"])
        print("=== YouTube SEO ===")
        print(f"标题: {result['title']}")
        print(f"标签: {', '.join(result['tags'][:10])}")
        print(f"描述预览: {result['description'][:200]}...")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "time":
        seo = YouTubeSEO()
        for region in ["CN", "US", "GLOBAL"]:
            best = seo.get_best_publish_time(region)
            print(f"{region}: {best['hour']}时, 最佳日期: {', '.join(best['days'])}")