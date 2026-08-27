#!/usr/bin/env python3
"""
增长黑客引擎
=============
自动化用户增长和曝光提升，零成本或极低成本。

核心策略：
1. A/B测试框架 — 标题/封面/时段系统对比
2. SEO优化 — 平台搜索关键词自动优化
3. 跨平台分发 — 一次制作多平台适配
4. 社群互动 — 自动回复/互动模板
5. 病毒传播 — 金句卡片/片段预告
6. 数据驱动 — 增长指标自动追踪

增长飞轮：
优质内容 → 多平台分发 → 数据反馈 → 优化迭代 → 更多曝光 → 更多听众
"""

import os
import json
import time
import random
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from collections import Counter


WORKFLOW_DIR = Path(__file__).parent
DATA_DIR = WORKFLOW_DIR / "data"
GROWTH_DIR = DATA_DIR / "growth"


# ============================================================
# A/B测试框架
# ============================================================
class ABTestFramework:
    """A/B测试框架 — 科学对比不同方案的效果"""
    
    def __init__(self):
        GROWTH_DIR.mkdir(parents=True, exist_ok=True)
        self.tests_file = GROWTH_DIR / "ab_tests.jsonl"
        self.results_file = GROWTH_DIR / "ab_results.jsonl"
    
    def create_test(self, test_name, variants, test_type="title"):
        """
        创建A/B测试
        
        Args:
            test_name: 测试名称
            variants: 变体列表 [{"id": "a", "content": "标题A"}, ...]
            test_type: 测试类型 (title/cover/time/description)
        """
        test = {
            "id": hashlib.md5(f"{test_name}_{time.time()}".encode()).hexdigest()[:8],
            "name": test_name,
            "type": test_type,
            "variants": variants,
            "created": datetime.now().isoformat(),
            "status": "running",
            "winner": None,
        }
        
        with open(self.tests_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(test, ensure_ascii=False) + '\n')
        
        return test
    
    def record_result(self, test_id, variant_id, metric_name, metric_value):
        """记录测试结果"""
        result = {
            "timestamp": datetime.now().isoformat(),
            "test_id": test_id,
            "variant_id": variant_id,
            "metric": metric_name,
            "value": metric_value,
        }
        
        with open(self.results_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(result, ensure_ascii=False) + '\n')
    
    def analyze_test(self, test_id, min_samples=10):
        """分析A/B测试结果"""
        if not self.results_file.exists():
            return None
        
        results = []
        with open(self.results_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    r = json.loads(line)
                    if r.get("test_id") == test_id:
                        results.append(r)
        
        if not results:
            return {"status": "no_data"}
        
        # Group by variant
        variant_data = {}
        for r in results:
            vid = r.get("variant_id")
            if vid not in variant_data:
                variant_data[vid] = []
            variant_data[vid].append(r.get("value", 0))
        
        # Calculate averages
        stats = {}
        for vid, values in variant_data.items():
            stats[vid] = {
                "count": len(values),
                "avg": sum(values) / len(values) if values else 0,
                "total": sum(values),
            }
        
        # Find winner
        if stats:
            winner = max(stats.items(), key=lambda x: x[1]["avg"])
            return {
                "status": "complete" if winner[1]["count"] >= min_samples else "running",
                "winner": winner[0],
                "winner_avg": winner[1]["avg"],
                "stats": stats,
            }
        
        return {"status": "no_data"}
    
    def get_active_tests(self):
        """获取进行中的测试"""
        if not self.tests_file.exists():
            return []
        
        tests = []
        with open(self.tests_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    t = json.loads(line)
                    if t.get("status") == "running":
                        tests.append(t)
        
        return tests


# ============================================================
# SEO优化引擎
# ============================================================
class SEOOptimizer:
    """平台SEO优化 — 自动关键词和标题优化"""
    
    # 各平台热门恐怖/悬疑关键词（基于公开趋势）
    PLATFORM_KEYWORDS = {
        "ximalaya": {
            "hot": ["恐怖小说", "睡前故事", "悬疑推理", "灵异事件", "鬼故事"],
            "niche": ["克苏鲁", "洛夫克拉夫特", "深海恐怖", "宇宙恐怖", "哥特风"],
            "long_tail": ["克苏鲁神话完整解读", "睡前恐怖故事合集", "宇宙恐怖小说推荐"],
        },
        "xiaoyuzhou": {
            "hot": ["真实案件", "灵异", "悬疑", "恐怖", "猎奇"],
            "niche": ["克苏鲁神话", "SCP基金会", "怪谈", "都市传说", "深海恐惧"],
            "long_tail": ["克苏鲁的呼唤有声完整版", "疯狂山脉有声书"],
        },
        "qingting": {
            "hot": ["有声小说", "评书", "故事", "夜话", "奇谈"],
            "niche": ["克苏鲁", "恐怖悬疑", "神话传说", "未解之谜"],
            "long_tail": ["克苏鲁神话有声书", "洛夫克拉夫特作品朗读"],
        },
    }
    
    # 高点击率标题模式（基于内容营销数据）
    TITLE_PATTERNS = [
        "{emotion}！{keyword}的{truth}终于被公开",
        "深夜慎入 ‖ {keyword}第{n}期 | {result}",
        "没人敢听完的{keyword} | {outcome}",
        "{number}个{keyword}，第{n}个最{horror}",
        "真实{keyword}事件：{phenomenon}",
        "🔥 {title} — {subtitle}",
        "🌙 睡前别听 ‖ {title}",
    ]
    
    def __init__(self):
        GROWTH_DIR.mkdir(parents=True, exist_ok=True)
        self.seo_log = GROWTH_DIR / "seo_history.jsonl"
    
    def suggest_keywords(self, platform="ximalaya", content_theme="克苏鲁"):
        """为平台推荐关键词"""
        platform_kws = self.PLATFORM_KEYWORDS.get(platform, {})
        
        # Mix hot + niche for best results
        suggestions = {
            "primary": platform_kws.get("hot", [])[:3],
            "secondary": platform_kws.get("niche", [])[:3],
            "long_tail": platform_kws.get("long_tail", [])[:2],
        }
        
        # Add content-specific keywords
        if "克苏鲁" in content_theme or "cthulhu" in content_theme.lower():
            suggestions["content_specific"] = ["克苏鲁神话", "克苏鲁的呼唤", "Cthulhu", "宇宙恐怖"]
        
        return suggestions
    
    def generate_seo_title(self, base_title, platform="ximalaya", content_keywords=None):
        """生成SEO优化的标题"""
        templates = {
            "ximalaya": [
                "【克苏鲁神话】{title} | 洛夫克拉夫特经典｜宇宙恐怖巅峰之作",
                "{title} — 克苏鲁神话系列 | 深夜恐怖有声书",
                "🌙 睡前慎入 | {title} · 克苏鲁神话",
            ],
            "xiaoyuzhou": [
                "{title} — 克苏鲁神话 | 有声书",
                "深渊回响 ‖ {title}",
                "恐怖故事 | {title}",
            ],
            "qingting": [
                "【有声书】{title} | 克苏鲁神话",
                "{title} · 恐怖悬疑 | 有声小说",
                "夜话奇谈 | {title}",
            ],
        }
        
        platform_templates = templates.get(platform, templates["ximalaya"])
        title = random.choice(platform_templates).format(title=base_title)
        
        return title
    
    def generate_seo_description(self, content_summary, platform="ximalaya"):
        """生成SEO优化的描述"""
        templates = [
            "🔥 {summary} | 克苏鲁神话经典有声书，洛夫克拉夫特原著，深夜收听效果最佳。订阅不迷路！",
            "🌙 {summary} | 一部让你彻夜难眠的宇宙恐怖作品。克苏鲁神话系列，持续更新中。",
            "⚠️ 胆小勿入！{summary} | 克苏鲁神话巅峰之作，体验来自深海的恐惧。",
        ]
        
        template = random.choice(templates)
        return template.format(summary=content_summary[:50])
    
    def generate_tags(self, platform="ximalaya", count=5):
        """生成平台标签"""
        platform_kws = self.PLATFORM_KEYWORDS.get(platform, {})
        
        # Combine hot + niche
        all_kws = platform_kws.get("hot", []) + platform_kws.get("niche", [])
        
        # Pick random subset
        if len(all_kws) >= count:
            return random.sample(all_kws, count)
        return all_kws


# ============================================================
# 跨平台分发优化器
# ============================================================
class CrossPlatformOptimizer:
    """一次制作，多平台适配优化"""
    
    # 各平台最佳规格
    PLATFORM_SPECS = {
        "ximalaya": {
            "title_max": 50,
            "desc_max": 500,
            "audio_format": "mp3",
            "audio_bitrate": "128kbps",
            "cover_size": (3000, 3000),
            "best_time": [22, 23, 0, 1],
            "content_category": "有声书-恐怖悬疑",
        },
        "xiaoyuzhou": {
            "title_max": 40,
            "desc_max": 300,
            "audio_format": "mp3",
            "audio_bitrate": "128kbps",
            "cover_size": (1400, 1400),
            "best_time": [21, 22, 23],
            "content_category": "悬疑恐怖",
        },
        "qingting": {
            "title_max": 60,
            "desc_max": 800,
            "audio_format": "mp3",
            "audio_bitrate": "192kbps",
            "cover_size": (1400, 1400),
            "best_time": [22, 23, 0],
            "content_category": "有声书-悬疑",
        },
    }
    
    def optimize_for_platform(self, content, platform):
        """
        为特定平台优化内容
        
        Returns: {title, description, tags, category, best_time}
        """
        specs = self.PLATFORM_SPECS.get(platform, {})
        seo = SEOOptimizer()
        
        # Truncate title
        title = content.get("title", "")
        title_max = specs.get("title_max", 50)
        if len(title) > title_max:
            title = title[:title_max-3] + "..."
        
        # Generate platform-specific metadata
        result = {
            "title": seo.generate_seo_title(title, platform),
            "description": seo.generate_seo_description(content.get("summary", ""), platform),
            "tags": seo.generate_tags(platform, 5),
            "category": specs.get("content_category", "有声书"),
            "best_time": specs.get("best_time", [22]),
            "cover_size": specs.get("cover_size", (1400, 1400)),
            "audio_bitrate": specs.get("audio_bitrate", "128kbps"),
        }
        
        return result
    
    def create_all_platform_variants(self, content):
        """为所有平台生成优化变体"""
        variants = {}
        for platform in self.PLATFORM_SPECS:
            variants[platform] = self.optimize_for_platform(content, platform)
        return variants
    
    def generate_publish_plan(self, content_title, platforms=None):
        """生成发布排期"""
        if platforms is None:
            platforms = list(self.PLATFORM_SPECS.keys())
        
        plan = []
        base_date = datetime.now()
        
        for i, platform in enumerate(platforms):
            specs = self.PLATFORM_SPECS.get(platform, {})
            best_hour = random.choice(specs.get("best_time", [22]))
            
            # Stagger platforms by 15 minutes to avoid simultaneous posting
            publish_time = base_date.replace(hour=best_hour, minute=i*15, second=0)
            
            plan.append({
                "platform": platform,
                "scheduled_time": publish_time.isoformat(),
                "hour": best_hour,
                "minute": i * 15,
            })
        
        return plan


# ============================================================
# 病毒传播卡片生成器
# ============================================================
class ViralContentGenerator:
    """生成适合社交传播的片段/卡片"""
    
    # 恐怖金句模板
    QUOTE_TEMPLATES = [
        "「{quote}」\n— 洛夫克拉夫特《{title}》",
        "🌙 {quote}\n\n—— H.P.洛夫克拉夫特",
        "\"{quote}\"\n\n{title} | 克苏鲁神话",
    ]
    
    # 引发好奇的文案
    HOOK_TEMPLATES = [
        "地球上最深的海沟里，沉睡着一个你无法理解的存在...",
        "他曾是哈佛的教授，直到他发现了那本禁书...",
        "当你凝视深渊时，深渊也在凝视你。但如果你凝视的是深海呢？",
        "1928年，一个调查员在档案中发现了不该存在的真相...",
        "太平洋底有一座城，地图上没有标注，但它在那里等待了亿万年...",
    ]
    
    def generate_quote_card(self, quote, title, template_idx=0):
        """生成金句卡片"""
        template = self.QUOTE_TEMPLATES[template_idx % len(self.QUOTE_TEMPLATES)]
        return template.format(quote=quote[:80], title=title)
    
    def generate_hook(self):
        """生成引子/悬念文案"""
        return random.choice(self.HOOK_TEMPLATES)
    
    def generate_30s_trailer_script(self, content_title, key_moment):
        """生成30秒预告脚本"""
        return f"""🎬 30秒预告脚本 — {content_title}

[0-5秒] 黑屏+音效（水声/心跳声）
旁白: "{self.generate_hook()}"

[5-15秒] 渐入内容高潮片段（选取最恐怖的30秒音频）
旁白: "这是{content_title}..."

[15-25秒] 加入渐强的背景音乐
旁白: "洛夫克拉夫特笔下的宇宙恐怖..."

[25-30秒] 结尾呼吁
旁白: "...完整内容，订阅收听。深夜慎入。"

[字幕] #克苏鲁 #恐怖故事 #有声书 #洛夫克拉夫特"""
    
    def generate_social_post(self, platform, content_title, hook_type="curiosity"):
        """生成社交平台短文案"""
        hooks = {
            "curiosity": f"🤔 {self.generate_hook()}",
            "fear": f"⚠️ 没人敢听完这个故事... | 《{content_title}》",
            "authority": f"🔥 克苏鲁神话巅峰之作 | 《{content_title}》有声书上线",
            "story": f"📖 {content_title}\n\n一切要从那封信说起...",
        }
        
        hook = hooks.get(hook_type, hooks["curiosity"])
        
        platform_templates = {
            "xhs": f"{hook}\n\n🎧 收听: 喜马拉雅/小宇宙/蜻蜓FM\n\n#克苏鲁 #恐怖故事 #有声书 #深夜读物 #洛夫克拉夫特",
            "weibo": f"{hook}\n\n#克苏鲁神话# 全文有声版已上线，评论区告诉我你听完的感受👇",
            "douyin": f"{hook}\n\n#克苏鲁 #恐怖故事 #有声书",
        }
        
        return platform_templates.get(platform, platform_templates["xhs"])


# ============================================================
# 增长仪表盘
# ============================================================
class GrowthDashboard:
    """增长指标追踪"""
    
    def __init__(self):
        GROWTH_DIR.mkdir(parents=True, exist_ok=True)
        self.metrics_file = GROWTH_DIR / "growth_metrics.jsonl"
    
    def record_metric(self, metric_name, value, platform="all", content_id=None):
        """记录增长指标"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "metric": metric_name,
            "value": value,
            "platform": platform,
            "content_id": content_id,
        }
        
        with open(self.metrics_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    def get_growth_summary(self, days=7):
        """获取增长摘要"""
        if not self.metrics_file.exists():
            return {"status": "no_data"}
        
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        
        metrics = []
        with open(self.metrics_file, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    m = json.loads(line)
                    if m.get("timestamp", "") > cutoff:
                        metrics.append(m)
        
        # Aggregate
        metric_totals = {}
        for m in metrics:
            name = m.get("metric", "unknown")
            if name not in metric_totals:
                metric_totals[name] = {"total": 0, "count": 0, "avg": 0}
            metric_totals[name]["total"] += m.get("value", 0)
            metric_totals[name]["count"] += 1
            metric_totals[name]["avg"] = metric_totals[name]["total"] / metric_totals[name]["count"]
        
        return {
            "period_days": days,
            "total_records": len(metrics),
            "metrics": metric_totals,
        }


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "seo":
        platform = sys.argv[2] if len(sys.argv) > 2 else "ximalaya"
        seo = SEOOptimizer()
        
        print(f"=== {platform} SEO优化建议 ===")
        
        keywords = seo.suggest_keywords(platform)
        print("\n📊 关键词建议:")
        for kw_type, kws in keywords.items():
            print(f"  {kw_type}: {', '.join(kws)}")
        
        title = seo.generate_seo_title("克苏鲁的呼唤", platform)
        print(f"\n📝 SEO标题: {title}")
        
        desc = seo.generate_seo_description("沉睡在太平洋底的古老城市，克苏鲁等待群星归位", platform)
        print(f"\n📄 SEO描述: {desc[:100]}...")
        
        tags = seo.generate_tags(platform, 5)
        print(f"\n🏷️ 标签: {', '.join(tags)}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "plan":
        content = {"title": "克苏鲁的呼唤", "summary": "沉睡在太平洋底的古老城市"}
        optimizer = CrossPlatformOptimizer()
        
        variants = optimizer.create_all_platform_variants(content)
        print("=== 多平台发布方案 ===")
        for platform, meta in variants.items():
            print(f"\n📱 {platform}:")
            print(f"  标题: {meta['title'][:50]}...")
            print(f"  标签: {', '.join(meta['tags'])}")
            print(f"  最佳时段: {meta['best_time']}")
        
        plan = optimizer.generate_publish_plan("克苏鲁的呼唤")
        print(f"\n📅 发布排期:")
        for p in plan:
            print(f"  {p['platform']}: {p['hour']}:{p['minute']:02d}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "viral":
        viral = ViralContentGenerator()
        
        print("=== 病毒传播素材 ===")
        
        print("\n📝 引子:")
        print(f"  {viral.generate_hook()}")
        
        print("\n🃏 金句卡片:")
        card = viral.generate_quote_card(
            "人类最古老最强烈的情感是恐惧，而最古老最强烈的恐惧是对未知的恐惧",
            "克苏鲁的呼唤"
        )
        print(f"  {card}")
        
        print("\n🎬 预告脚本:")
        script = viral.generate_30s_trailer_script("克苏鲁的呼唤", "发现海底城市")
        print(script)
        
        print("\n📱 社交文案:")
        for platform in ["xhs", "weibo", "douyin"]:
            post = viral.generate_social_post(platform, "克苏鲁的呼唤")
            print(f"\n  [{platform}]")
            print(f"  {post[:100]}...")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "abtest":
        ab = ABTestFramework()
        
        # Create a title A/B test
        test = ab.create_test(
            "克苏鲁标题测试",
            [
                {"id": "a", "content": "【克苏鲁】克苏鲁的呼唤 | 洛夫克拉夫特经典"},
                {"id": "b", "content": "🌙 睡前慎入 · 克苏鲁的呼唤 | 没人敢听完的恐怖故事"},
                {"id": "c", "content": "🔥 宇宙恐怖巅峰之作 — 克苏鲁的呼唤"},
            ],
            "title"
        )
        
        print(f"=== 创建A/B测试 ===")
        print(f"测试ID: {test['id']}")
        print(f"测试名: {test['name']}")
        print(f"变体:")
        for v in test["variants"]:
            print(f"  [{v['id']}] {v['content']}")
        
        # Simulate some results
        import random
        for _ in range(5):
            variant = random.choice(["a", "b", "c"])
            plays = random.randint(10, 100)
            ab.record_result(test["id"], variant, "plays", plays)
        
        # Analyze
        result = ab.analyze_test(test["id"])
        if result:
            print(f"\n测试结果: {result}")
    
    else:
        print("增长黑客引擎")
        print()
        print("用法:")
        print("  python growth_engine.py seo [platform]  - SEO优化建议")
        print("  python growth_engine.py plan             - 生成多平台发布方案")
        print("  python growth_engine.py viral            - 生成病毒传播素材")
        print("  python growth_engine.py abtest           - A/B测试框架")
