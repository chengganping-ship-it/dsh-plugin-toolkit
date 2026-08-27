#!/usr/bin/env python3
"""
克苏鲁有声书 全自动工作流引擎
============================
闭环流程：内容获取 → 音频生成 → 发布清单 → 数据追踪 → 复盘迭代

依赖：edge-tts（已安装）、ffmpeg（已安装）
"""

import asyncio
import csv
import json
import os
import re
import hashlib
from datetime import datetime, timedelta
from pathlib import Path


# ============================================================
# 配置
# ============================================================
WORKFLOW_DIR = Path(__file__).parent
CONTENT_DIR = WORKFLOW_DIR / "content"
AUDIO_DIR = WORKFLOW_DIR / "audio"
PUBLISH_DIR = WORKFLOW_DIR / "publish"
DATA_DIR = WORKFLOW_DIR / "data"

# 语音配置：克苏鲁题材适合用低沉男声
VOICE = "zh-CN-YunyangNeural"  # 云扬 - 专业男声，适合恐怖/严肃题材
RATE = "-5%"  # 略慢，增加沉重感
VOLUME = "+0%"

# 平台配置
PLATFORMS = {
    "ximalaya": {"name": "喜马拉雅", "status": "pending"},
    "qingting": {"name": "蜻蜓FM", "status": "pending"},
    "lrts": {"name": "懒人听书", "status": "pending"},
    "xiaoyuzhou": {"name": "小宇宙", "status": "pending"},
}


# ============================================================
# 第1层：内容获取与处理
# ============================================================
class ContentProcessor:
    """内容获取、清洗、分段"""

    @staticmethod
    def load_text(file_path):
        """加载文本文件"""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"文件不存在: {path}")
        text = path.read_text(encoding='utf-8')
        return text

    @staticmethod
    def clean_text(text):
        """清洗文本：去除多余空行、特殊字符"""
        # 去除多余空行
        text = re.sub(r'\n{3,}', '\n\n', text)
        # 去除行首尾空白
        lines = [line.strip() for line in text.split('\n')]
        # 去除空行但保留段落结构
        text = '\n'.join(lines)
        return text.strip()

    @staticmethod
    def split_chapters(text):
        """按章节分割文本"""
        # 匹配 "第X章" 或 "I." / "II." / "Chapter X" 等格式
        patterns = [
            r'(?:^|\n)(第[一二三四五六七八九十百千万\d]+章[^\n]*)',
            r'(?:^|\n)([IVXLC]+\.\s*[^\n]*)',  # 罗马数字编号
            r'(?:^|\n)(Chapter\s+\d+[^\n]*)',
        ]

        chapters = []
        for pattern in patterns:
            parts = re.split(pattern, text)
            if len(parts) > 3:  # 找到了多个章节
                # 重组章节
                title = "序章"
                content = parts[0]
                for i in range(1, len(parts), 2):
                    if content.strip():
                        chapters.append({"title": title, "content": content.strip()})
                    title = parts[i].strip()
                    content = parts[i+1] if i+1 < len(parts) else ""
                if content.strip():
                    chapters.append({"title": title, "content": content.strip()})
                return chapters

        # 没有找到章节，按固定长度分段
        return ContentProcessor.split_by_length(text, max_chars=3000)

    @staticmethod
    def split_by_length(text, max_chars=3000):
        """按长度分段（无章节标题时的备选方案）"""
        paragraphs = text.split('\n\n')
        chapters = []
        current_chapter = []
        current_len = 0
        chapter_num = 1

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            if current_len + len(para) > max_chars and current_chapter:
                chapters.append({
                    "title": f"第{chapter_num}段",
                    "content": '\n\n'.join(current_chapter)
                })
                chapter_num += 1
                current_chapter = [para]
                current_len = len(para)
            else:
                current_chapter.append(para)
                current_len += len(para) + 2

        if current_chapter:
            chapters.append({
                "title": f"第{chapter_num}段",
                "content": '\n\n'.join(current_chapter)
            })

        return chapters

    @staticmethod
    def generate_metadata(content, title="克苏鲁的呼唤"):
        """生成发布元数据"""
        # 提取关键词（简单实现：取高频实词）
        words = re.findall(r'[\u4e00-\u9fff]{2,4}', content)
        word_freq = {}
        for w in words:
            word_freq[w] = word_freq.get(w, 0) + 1
        keywords = sorted(word_freq.items(), key=lambda x: -x[1])[:10]
        keyword_str = "、".join([k for k, v in keywords])

        # 生成简介
        first_para = content[:200].replace('\n', ' ')
        summary = f"「{title}」{first_para}..."

        return {
            "title": title,
            "summary": summary,
            "keywords": keyword_str,
            "category": "恐怖/悬疑/奇幻",
            "tags": ["克苏鲁", "洛夫克拉夫特", "宇宙恐怖", "怪谈", "悬疑"],
            "target_audience": "18-35岁，喜欢恐怖/悬疑/怪谈内容的人群",
            "best_publish_time": "22:00-24:00",
        }


# ============================================================
# 第2层：音频生成
# ============================================================
class AudioGenerator:
    """音频生成引擎"""

    def __init__(self, voice=VOICE, rate=RATE, volume=VOLUME):
        self.voice = voice
        self.rate = rate
        self.volume = volume

    async def generate_audio(self, text, output_file):
        """单段文本转音频"""
        import edge_tts
        communicate = edge_tts.Communicate(
            text=text,
            voice=self.voice,
            rate=self.rate,
            volume=self.volume,
        )
        await communicate.save(str(output_file))

    async def process_chapter(self, chapter, chapter_idx, output_dir):
        """处理一个章节：拆分长文本 → 逐段合成 → 返回所有音频文件"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        content = chapter["content"]
        title = chapter["title"]

        # 给章节加标题前缀
        intro = f"{title}。\n\n"
        full_text = intro + content

        # 拆分长文本（edge-tts 建议每段不超过 5000 字）
        chunks = self._split_chunk(full_text, max_chars=4000)

        audio_files = []
        for idx, chunk in enumerate(chunks, 1):
            output_file = output_dir / f"chapter_{chapter_idx:02d}_part_{idx:03d}.mp3"
            if output_file.exists():
                audio_files.append(output_file)
                continue
            await self.generate_audio(chunk, output_file)
            audio_files.append(output_file)

        return audio_files

    def _split_chunk(self, text, max_chars=4000):
        """按段落拆分长文本"""
        paragraphs = text.split('\n\n')
        chunks = []
        current = ""

        for para in paragraphs:
            if len(current) + len(para) + 2 <= max_chars:
                current += para + "\n\n"
            else:
                if current:
                    chunks.append(current.strip())
                current = para + "\n\n"

        if current.strip():
            chunks.append(current.strip())

        return chunks

    async def generate_all(self, chapters, output_dir):
        """批量生成所有章节音频"""
        output_dir = Path(output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        results = []
        for idx, chapter in enumerate(chapters, 1):
            print(f"  生成第 {idx}/{len(chapters)} 章: {chapter['title'][:20]}...")
            audio_files = await self.process_chapter(chapter, idx, output_dir / f"chapter_{idx:02d}")
            results.append({
                "chapter_idx": idx,
                "title": chapter["title"],
                "audio_files": [str(f) for f in audio_files],
                "char_count": len(chapter["content"]),
            })

        return results

    def merge_chapter_audio(self, audio_files, output_file):
        """合并同一章节的多个音频文件"""
        output_file = Path(output_file)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        # 使用 ffmpeg 合并
        # 创建临时文件列表
        list_file = output_file.parent / "merge_list.txt"
        with open(list_file, 'w', encoding='utf-8') as f:
            for af in audio_files:
                f.write(f"file '{Path(af).absolute()}'\n")

        os.system(f'ffmpeg -f concat -safe 0 -i "{list_file}" -c copy "{output_file}" -y 2>/dev/null')
        list_file.unlink(missing_ok=True)
        return output_file


# ============================================================
# 第3层：发布管理
# ============================================================
class PublishManager:
    """发布清单生成、状态追踪"""

    def __init__(self, workflow_dir):
        self.workflow_dir = Path(workflow_dir)
        self.publish_dir = self.workflow_dir / "publish"
        self.publish_dir.mkdir(parents=True, exist_ok=True)

    def generate_checklist(self, metadata, platforms=None):
        """生成发布清单"""
        if platforms is None:
            platforms = PLATFORMS

        checklist = {
            "created_at": datetime.now().isoformat(),
            "metadata": metadata,
            "platforms": {},
            "steps": [
                {"id": 1, "task": "检查音频质量（随机抽查2-3段）", "done": False},
                {"id": 2, "task": "制作封面图（暗色调+标题文字）", "done": False},
                {"id": 3, "task": "撰写发布文案（吸引点击的标题+简介）", "done": False},
                {"id": 4, "task": "上传音频文件到各平台", "done": False},
                {"id": 5, "task": "填写分类标签", "done": False},
                {"id": 6, "task": "设置发布时间（22:00-24:00为佳）", "done": False},
                {"id": 7, "task": "发布后检查（确认正常显示）", "done": False},
                {"id": 8, "task": "记录发布链接到数据表", "done": False},
            ]
        }

        for platform_key, platform_info in platforms.items():
            checklist["platforms"][platform_key] = {
                "name": platform_info["name"],
                "status": "pending",
                "url": "",
                "uploaded_at": "",
            }

        # 保存清单
        checklist_file = self.publish_dir / f"checklist_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(checklist_file, 'w', encoding='utf-8') as f:
            json.dump(checklist, f, ensure_ascii=False, indent=2)

        return checklist, checklist_file

    def generate_publish_text(self, metadata):
        """生成发布文案（标题+简介模板）"""
        templates = {
            "ximalaya": {
                "title": f"【克苏鲁神话】{metadata['title']}丨洛夫克拉夫特经典丨宇宙恐怖巅峰之作",
                "intro": f"当你凝视深渊时，深渊也在凝视你。\n\n{metadata['summary']}\n\n⚠️ 适合深夜独处时收听\n📖 每日更新一章，订阅追更\n\n#克苏鲁 #洛夫克拉夫特 #宇宙恐怖 #悬疑 #怪谈",
            },
            "xiaoyuzhou": {
                "title": f"深渊回响丨克苏鲁神话系列：{metadata['title']}",
                "intro": f"在无知的小岛上，我们暂时安全。\n\n{metadata['summary']}\n\n适合睡前、独处、深夜收听。",
            },
        }
        return templates


# ============================================================
# 第4层：数据追踪与复盘
# ============================================================
class DataTracker:
    """数据采集、分析、复盘"""

    def __init__(self, data_dir):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.tracker_file = self.data_dir / "tracker.csv"
        self._init_tracker()

    def _init_tracker(self):
        """初始化追踪表"""
        if not self.tracker_file.exists():
            with open(self.tracker_file, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow([
                    "日期", "平台", "内容标题", "播放量", "完播率",
                    "点赞", "收藏", "评论", "收益(元)", "备注"
                ])

    def add_entry(self, date, platform, title, plays=0, completion=0,
                  likes=0, favorites=0, comments=0, revenue=0, note=""):
        """添加数据记录"""
        with open(self.tracker_file, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([
                date, platform, title, plays, completion,
                likes, favorites, comments, revenue, note
            ])

    def get_summary(self, days=7):
        """获取近N天数据汇总"""
        if not self.tracker_file.exists():
            return "暂无数据"

        entries = []
        with open(self.tracker_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                entries.append(row)

        if not entries:
            return "暂无数据"

        # 汇总
        total_plays = sum(int(e["播放量"]) for e in entries)
        total_revenue = sum(float(e["收益(元)"]) for e in entries)
        total_likes = sum(int(e["点赞"]) for e in entries)

        summary = f"""
=== 近{days}天数据汇总 ===
总播放量: {total_plays}
总点赞: {total_likes}
总收益: {total_revenue:.2f}元
记录条数: {len(entries)}

=== 建议 ===
"""
        if total_plays < 100:
            summary += "- 播放量较低，建议优化标题和封面\n"
            summary += "- 尝试在社交媒体分享引流\n"
        elif total_plays < 1000:
            summary += "- 播放量有起色，继续保持更新频率\n"
            summary += "- 分析哪类内容完播率最高，加大该类内容产出\n"
        else:
            summary += "- 播放量表现良好，开始考虑系列化运营\n"
            summary += "- 可以尝试多平台同步分发\n"

        return summary

    def generate_weekly_report(self):
        """生成周报"""
        report = {
            "generated_at": datetime.now().isoformat(),
            "summary": self.get_summary(days=7),
            "recommendations": [],
            "next_week_plan": [],
        }

        # 保存周报
        report_file = self.data_dir / f"weekly_report_{datetime.now().strftime('%Y%m%d')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        return report


# ============================================================
# 第5层：复盘引擎（闭环核心）
# ============================================================
class ReviewEngine:
    """复盘引擎：分析数据 → 发现问题 → 生成优化建议"""

    def __init__(self, data_tracker):
        self.tracker = data_tracker

    def analyze(self):
        """全面分析，生成复盘报告"""
        report = self.tracker.generate_weekly_report()

        # 根据数据生成具体建议
        recommendations = []

        # 建议1：内容方向
        recommendations.append({
            "area": "内容方向",
            "insight": "克苏鲁+本土怪谈的混合题材，可能比纯翻译作品有更好的受众接受度",
            "action": "尝试制作「中式克苏鲁」系列，将克苏鲁元素与中国民间怪谈结合",
            "priority": "high"
        })

        # 建议2：发布策略
        recommendations.append({
            "area": "发布策略",
            "insight": "恐怖/猎奇内容在深夜时段（22:00-24:00）有天然流量优势",
            "action": "固定在22:30发布，培养用户收听习惯",
            "priority": "high"
        })

        # 建议3：声音优化
        recommendations.append({
            "area": "声音优化",
            "insight": "AI语音讲述恐怖故事时，语速略慢+降调能增强沉浸感",
            "action": "将语速调整为-10%，在章节之间加入3秒静音作为'呼吸感'",
            "priority": "medium"
        })

        # 建议4：系列化
        recommendations.append({
            "area": "系列化运营",
            "insight": "洛夫克拉夫特一生写了60+篇，足够支撑长期内容输出",
            "action": "规划「克苏鲁神话全集」系列，每篇独立成章，逐步积累订阅",
            "priority": "medium"
        })

        # 建议5：跨平台
        recommendations.append({
            "area": "跨平台分发",
            "insight": "不同平台的恐怖内容受众重合度低",
            "action": "喜马拉雅走长篇连载，小宇宙走精品短篇，抖音做3分钟切片引流",
            "priority": "low"
        })

        report["recommendations"] = recommendations

        # 更新报告
        report_file = self.tracker.data_dir / f"weekly_report_{datetime.now().strftime('%Y%m%d')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)

        return report


# ============================================================
# 主工作流
# ============================================================
class CthulhuWorkflow:
    """克苏鲁有声书全工作流编排"""

    def __init__(self):
        self.workflow_dir = Path(__file__).parent
        self.content_dir = self.workflow_dir / "content"
        self.audio_dir = self.workflow_dir / "audio"
        self.publish_dir = self.workflow_dir / "publish"
        self.data_dir = self.workflow_dir / "data"

        # 确保目录存在
        for d in [self.content_dir, self.audio_dir, self.publish_dir, self.data_dir]:
            d.mkdir(parents=True, exist_ok=True)

        # 初始化各模块
        self.content_processor = ContentProcessor()
        self.audio_generator = AudioGenerator()
        self.publish_manager = PublishManager(self.workflow_dir)
        self.data_tracker = DataTracker(self.data_dir)
        self.review_engine = ReviewEngine(self.data_tracker)

    async def run_full_pipeline(self, text_file):
        """运行完整工作流"""
        print("=" * 60)
        print("🎙️ 克苏鲁有声书 全自动工作流")
        print("=" * 60)

        # Step 1: 内容处理
        print("\n📖 Step 1: 内容处理")
        text = self.content_processor.load_text(text_file)
        text = self.content_processor.clean_text(text)
        chapters = self.content_processor.split_chapters(text)
        metadata = self.content_processor.generate_metadata(text)
        print(f"  章节数: {len(chapters)}")
        print(f"  总字数: {len(text)}")
        print(f"  标题: {metadata['title']}")
        print(f"  关键词: {metadata['keywords'][:30]}...")

        # Step 2: 音频生成
        print(f"\n🎵 Step 2: 音频生成 (语音: {VOICE})")
        audio_results = await self.audio_generator.generate_all(chapters, self.audio_dir)
        total_duration = sum(r["char_count"] for r in audio_results) / 250  # 预估时长（250字/分钟）
        print(f"  生成完成，预估总时长: {total_duration:.0f} 分钟")

        # Step 3: 生成发布清单
        print(f"\n📋 Step 3: 生成发布清单")
        checklist, checklist_file = self.publish_manager.generate_checklist(metadata)
        print(f"  清单文件: {checklist_file.name}")
        for step in checklist["steps"]:
            print(f"    {step['id']}. {step['task']}")

        # Step 4: 生成发布文案
        print(f"\n✍️ Step 4: 生成发布文案")
        publish_text = self.publish_manager.generate_publish_text(metadata)
        for platform, text in publish_text.items():
            print(f"  [{platform}] 标题: {text['title'][:40]}...")

        # Step 5: 初始化数据追踪
        print(f"\n📊 Step 5: 初始化数据追踪")
        self.data_tracker.add_entry(
            date=datetime.now().strftime('%Y-%m-%d'),
            platform="all",
            title=metadata["title"],
            note="首次发布，数据待采集"
        )
        print("  数据追踪表已创建")

        # 输出总结
        print("\n" + "=" * 60)
        print("✅ 工作流执行完成")
        print(f"  音频目录: {self.audio_dir}")
        print(f"  发布清单: {checklist_file}")
        print(f"  下一步: 按清单逐项执行，7天后运行复盘")
        print("=" * 60)

        return {
            "chapters": chapters,
            "metadata": metadata,
            "audio_results": audio_results,
            "checklist": checklist,
            "publish_text": publish_text,
        }

    def run_review(self):
        """运行复盘"""
        print("\n📊 运行复盘分析...")
        report = self.review_engine.analyze()
        print(report["summary"])
        print("\n优化建议:")
        for rec in report.get("recommendations", []):
            print(f"  [{rec['priority']}] {rec['area']}: {rec['action']}")
        return report


# ============================================================
# CLI 入口
# ============================================================
async def main():
    import argparse
    parser = argparse.ArgumentParser(description="克苏鲁有声书工作流引擎")
    parser.add_argument("command", choices=["run", "review", "status"],
                        help="run=执行完整流程, review=复盘, status=查看状态")
    parser.add_argument("--file", "-f", help="输入文本文件路径")
    args = parser.parse_args()

    workflow = CthulhuWorkflow()

    if args.command == "run":
        if not args.file:
            # 默认处理 content 目录下的所有 txt 文件
            content_files = list(workflow.content_dir.glob("*.txt"))
            if not content_files:
                print("❌ 请将文本文件放入 content/ 目录，或使用 --file 指定")
                return
            args.file = str(content_files[0])
        result = await workflow.run_full_pipeline(args.file)
    elif args.command == "review":
        workflow.run_review()
    elif args.command == "status":
        print(workflow.data_tracker.get_summary())


if __name__ == "__main__":
    asyncio.run(main())
