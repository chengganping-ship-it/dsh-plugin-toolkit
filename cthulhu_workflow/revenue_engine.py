#!/usr/bin/env python3
"""
收益引擎 — 内容二次利用+收益追踪+听众漏斗
============================================
将单一内容转化为多重收益流。

核心理念: 一次制作，多次变现

内容二次利用矩阵:
┌─────────────┬──────────────────────────────────────┐
│ 原始内容    │ → 衍生内容                            │
├─────────────┼──────────────────────────────────────┤
│ 有声书(长)  │ → 短视频片段(抖音/B站/YouTube Shorts) │
│             │ → 金句图文(小红书/微博)               │
│             │ → 文章(公众号/知乎)                   │
│             │ → ASMR白噪音版(助眠)                  │
├─────────────┼──────────────────────────────────────┤
│ 纯音频      │ → 视频版(YouTube/静态图)              │
│             │ → 播客版(Apple Podcast/Spotify)       │
├─────────────┼──────────────────────────────────────┤
│ 文字        │ → AI图像(Midjourney/Bing)             │
│             │ → 封面/海报                           │
└─────────────┴──────────────────────────────────────┘

收益追踪:
- 平台: 喜马拉雅, 小宇宙, 蜻蜓FM, YouTube, 抖音, B站
- 指标: 播放量, 完播率, 收益, 粉丝增长
- ROI分析: 每小时制作产生多少收益

听众漏斗:
认知(曝光) → 兴趣(点击) → 收听(完播) → 关注(订阅) → 付费(打赏/会员)
"""


import os
import re
import json
import time
import random
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from collections import defaultdict


WORKFLOW_DIR = Path(__file__).parent
DATA_DIR = WORKFLOW_DIR / "data"
REVENUE_DIR = DATA_DIR / "revenue"
CONTENT_DIR = WORKFLOW_DIR / "content"


# ============================================================
# 内容二次利用引擎
# ============================================================
class ContentRepurposer:
    """将长内容转化为多种短格式内容"""
    
    # 短视频平台规格
    SHORT_VIDEO_SPECS = {
        "douyin": {
            "ratio": "9:16",
            "resolution": (1080, 1920),
            "duration": "15s-3min",
            "format": "mp4",
        },
        "bilibili": {
            "ratio": "9:16 or 16:9",
            "resolution": (1080, 1920),
            "duration": "15s-10min",
            "format": "mp4",
        },
        "youtube_shorts": {
            "ratio": "9:16",
            "resolution": (1080, 1920),
            "duration": "≤60s",
            "format": "mp4",
        },
        "kuaishou": {
            "ratio": "9:16",
            "resolution": (1080, 1920),
            "duration": "15s-5min",
            "format": "mp4",
        },
    }
    
    def extract_clips(self, text, num_clips=5, min_length=50, max_length=150):
        """
        从长文本中提取高潮片段（用于短视频）
        
        策略:
        1. 找有情绪张力的句子
        2. 找有悬念的结尾
        3. 找金句/哲理句
        """
        # Split into sentences
        sentences = re.split(r'[.!?。！？\n]+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]
        
        clips = []
        
        for sentence in sentences:
            # Score each sentence
            score = 0
            
            # 情绪关键词
            emotion_words = ['恐惧', '恐怖', '疯狂', '尖叫', '死亡', '黑暗', '噩梦',
                           'fear', 'terror', 'madness', 'death', 'dark', 'dream',
                           'horror', 'creepy', 'scary', 'damn', 'hell']
            for word in emotion_words:
                if word.lower() in sentence.lower():
                    score += 2
            
            # 悬疑词
            mystery_words = ['真相', '秘密', '隐藏', '发现', '未知', '神秘',
                           'truth', 'secret', 'hidden', 'discover', 'unknown', 'mystery']
            for word in mystery_words:
                if word.lower() in sentence.lower():
                    score += 3
            
            # 长度适中
            if min_length <= len(sentence) <= max_length:
                score += 1
            
            if score >= 3:
                clips.append({
                    "text": sentence,
                    "score": score,
                    "length": len(sentence),
                })
        
        # Sort by score and return top clips
        clips.sort(key=lambda x: x["score"], reverse=True)
        return clips[:num_clips]
    
    def generate_article(self, text, title, platform="zhihu"):
        """
        将音频文字转化为适合平台的长文
        
        平台风格:
        - zhihu: 分析深度，带解读
        - wechat: 故事性强，分段清晰
        - xiaohongshu: 短段落，多emoji
        """
        articles = {
            "zhihu": self._generate_zhihu_article(text, title),
            "wechat": self._generate_wechat_article(text, title),
            "xiaohongshu": self._generate_xhs_article(text, title),
        }
        
        return articles.get(platform, articles["zhihu"])
    
    def _generate_zhihu_article(self, text, title):
        """知乎风格：深度分析"""
        article = f"""# 如何评价洛夫克拉夫特的《{title}》？

最近把这部经典做成了有声书，花了不少时间打磨。

## 《{title}》讲了什么？

{text[:500]}

## 我的解读

1. **人类中心主义的瓦解**
洛夫克拉夫特最核心的恐怖不是怪物，而是"宇宙中存在远超人类理解的力量"这一事实。

2. **知识的代价**
主角获得真相的过程，也是失去理智的过程。知识不总是带来力量，有时带来的是疯狂。

3. **不可名状的恐怖**
最恐怖的不是看到怪物，而是意识到"有东西存在于你无法理解的维度"。

## 收听体验

完整有声书版本可以在以下平台搜索「克苏鲁有声书」：
- 喜马拉雅
- 小宇宙
- 蜻蜓FM
- YouTube

睡前慎入。

---
*持续更新克苏鲁神话系列有声书，关注不迷路。*
"""
        return article
    
    def _generate_wechat_article(self, text, title):
        """公众号风格：故事性强"""
        article = f"""🌙 《{title}》— 克苏鲁神话系列

深夜，你一个人躺在床上。

耳边传来深海般的低语...

【故事开始】

{text[:800]}

...

【未完待续】

📻 完整有声书，请关注公众号搜索「克苏鲁有声书」

🔔 深夜收听效果最佳

#克苏鲁 #洛夫克拉夫特 #有声书 #深夜故事
"""
        return article
    
    def _generate_xhs_article(self, text, title):
        """小红书风格：短段落+emoji"""
        article = f"""🌙 深夜恐怖故事｜{title}

⚠️ 胆小勿入！

这是我最喜欢的克苏鲁神话之一...

{text[:300]}

💭 听完感受？
人类在宇宙中真的太渺小了...

🎧 完整有声书：
搜「克苏鲁有声书」喜马拉雅/小宇宙

#克苏鲁 #洛夫克拉夫特 #恐怖故事 #有声书 #深夜读物 #宇宙恐怖 #睡前故事"""
        return article
    
    def generate_short_script(self, clip_text, platform="douyin", duration=30):
        """
        生成短视频脚本
        
        Args:
            clip_text: 片段文字
            platform: 平台
            duration: 目标时长（秒）
        """
        scripts = {
            "douyin": self._generate_douyin_script(clip_text, duration),
            "bilibili": self._generate_bilibili_script(clip_text, duration),
            "youtube_shorts": self._generate_youtube_short_script(clip_text, duration),
        }
        
        return scripts.get(platform, scripts["douyin"])
    
    def _generate_douyin_script(self, clip_text, duration):
        """抖音脚本"""
        return f"""📱 抖音短视频脚本 ({duration}s)

【开头0-3s - 钩子】
画面: 暗屏+心跳声
文字: "没人敢听完这个故事..."

【中间3-{duration-5}s - 正片】
画面: 暗色背景+克苏鲁相关图像
配音: "{clip_text[:100]}"
背景音乐: 低音环境音

【结尾-{duration}s - 引导】
文字: "完整版在主页 | 订阅不迷路"
画面: 封面图+频道名

---
配音语速: 缓慢、沉重
BGM推荐: 深海音效/低音环境音
标签: #克苏鲁 #恐怖故事 #有声书 #睡前慎入
"""
    
    def _generate_bilibili_script(self, clip_text, duration):
        """B站脚本"""
        return f"""📺 B站短视频脚本 ({duration}s)

【0-5s 引入】
画面: 黑屏+字幕
🔊 "你能坚持听完吗？"

【5-{duration-5}s 内容】
画面: 静态图片+字幕
🔊 "{clip_text[:150]}"

【结尾 互动】
🔊 "你猜到结局了吗？评论区告诉我"

---
标题模板: "《XXX》| 克苏鲁神话 | 宇宙恐怖"
分区: 科普人文 / 影视剪辑 / 有声书
"""
    
    def _generate_youtube_short_script(self, clip_text, duration):
        """YouTube Shorts脚本"""
        return f"""📱 YouTube Shorts脚本 ({duration}s)

【HOOK 0-2s】
🔊 "This is the scariest story ever written..."
📝 Text overlay: "The Call of Cthulhu"

【STORY 2-{duration-3}s】
🔊 "{clip_text[:120]}"
📝 Dark background + subtle animation

【CTA结束】
🔊 "Full audiobook on my channel!"
📝 Subscribe reminder overlay

---
Tags: #lovecraft #cthulhu #horror #audiobook #shorts
"""
    
    def generate_tweet_thread(self, text, title):
        """生成Twitter/微博话题帖"""
        tweets = []
        
        # 第一条：引子
        tweets.append(f"🧵 刚刚读完了洛夫克拉夫特的《{title}》\n\n这是我对克苏鲁神话最深的理解...\n\n(1/5)")
        
        # 中间：要点
        tweets.append(f"核心观点：\n\n人类最古老最强烈的恐惧，是对未知的恐惧。\n\n而洛夫克拉夫特笔下最恐怖的，不是怪物，而是'宇宙中存在你永远无法理解的存在'这一事实。\n\n(2/5)")
        
        tweets.append(f"书中最让我印象深刻的一段：\n\n\"{text[:200]}\"\n\n(3/5)")
        
        tweets.append(f"这部作品写于上世纪20年代，但在今天读来依然震撼。\n\n因为它触及了一个永恒的哲学问题：\n\n人类在宇宙中到底扮演什么角色？\n\n答案可能是：什么角色都不是。\n\n(4/5)")
        
        tweets.append(f"完整有声书已上线，搜索「克苏鲁有声书」\n\n🌙 深夜收听效果最佳\n\n(5/5)")
        
        return tweets
    
    def generate_pin(self, quote, title):
        """生成小红书/ Pinterest 图文卡片文案"""
        return f"""🕯️ "{quote[:80]}"

—— 洛夫克拉夫特《{title}》

🌙 克苏鲁神话 | 有声书

🎧 完整收听: 搜索「克苏鲁有声书」

#克苏鲁 #洛夫克拉夫特 #恐怖文学 #有声书 #深夜读物 #宇宙恐怖"""


# ============================================================
# 收益追踪器
# ============================================================
class RevenueTracker:
    """追踪各平台收益"""
    
    def __init__(self):
        REVENUE_DIR.mkdir(parents=True, exist_ok=True)
        self.revenue_file = REVENUE_DIR / "revenue_data.jsonl"
        self.daily_file = REVENUE_DIR / "daily_summary.jsonl"
    
    def record_revenue(self, date, platform, content_title, plays, revenue, followers=0):
        """记录收益"""
        entry = {
            "date": date,
            "platform": platform,
            "content_title": content_title,
            "plays": plays,
            "revenue": revenue,
            "followers": followers,
            "recorded_at": datetime.now().isoformat(),
        }
        
        with open(self.revenue_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    def get_monthly_summary(self, year=None, month=None):
        """获取月度汇总"""
        if not self.revenue_file.exists():
            return {"status": "no_data"}
        
        now = datetime.now()
        year = year or now.year
        month = month or now.month
        
        monthly_data = defaultdict(lambda: {"plays": 0, "revenue": 0, "contents": set()})
        
        with open(self.revenue_file, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip():
                    continue
                entry = json.loads(line)
                entry_date = entry.get("date", "")
                if entry_date.startswith(f"{year}-{month:02d}"):
                    platform = entry.get("platform", "unknown")
                    monthly_data[platform]["plays"] += entry.get("plays", 0)
                    monthly_data[platform]["revenue"] += entry.get("revenue", 0)
                    monthly_data[platform]["contents"].add(entry.get("content_title", ""))
        
        # Convert sets to counts
        result = {}
        total_revenue = 0
        for platform, data in monthly_data.items():
            result[platform] = {
                "plays": data["plays"],
                "revenue": round(data["revenue"], 2),
                "contents": len(data["contents"]),
            }
            total_revenue += data["revenue"]
        
        result["total"] = {
            "revenue": round(total_revenue, 2),
            "platforms": len(monthly_data),
        }
        
        return result
    
    def get_top_content(self, metric="plays", limit=5):
        """获取最佳表现内容"""
        if not self.revenue_file.exists():
            return []
        
        content_stats = defaultdict(lambda: {"plays": 0, "revenue": 0, "platforms": set()})
        
        with open(self.revenue_file, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip():
                    continue
                entry = json.loads(line)
                title = entry.get("content_title", "unknown")
                content_stats[title]["plays"] += entry.get("plays", 0)
                content_stats[title]["revenue"] += entry.get("revenue", 0)
                content_stats[title]["platforms"].add(entry.get("platform", ""))
        
        # Sort by metric
        sorted_content = sorted(content_stats.items(), key=lambda x: x[1][metric], reverse=True)
        
        return [
            {
                "title": title,
                "plays": stats["plays"],
                "revenue": round(stats["revenue"], 2),
                "platforms": len(stats["platforms"]),
            }
            for title, stats in sorted_content[:limit]
        ]
    
    def estimate_projected_revenue(self, months=3):
        """估算未来收益"""
        monthly = self.get_monthly_summary()
        if monthly.get("status") == "no_data":
            return {"status": "no_data"}
        
        current_revenue = monthly.get("total", {}).get("revenue", 0)
        
        # Simple projection: assume 10-20% monthly growth
        projections = []
        projected = current_revenue
        for month in range(1, months + 1):
            projected *= 1.15  # 15% growth assumption
            projections.append({
                "month": month,
                "projected": round(projected, 2),
            })
        
        return {
            "current_monthly": current_revenue,
            "projections": projections,
            "growth_rate": "15%",
        }


# ============================================================
# 听众漏斗
# ============================================================
class AudienceFunnel:
    """
    自动化听众漏斗
    
    漏斗层级:
    1. AugaWareness（认知）: 曝光 -> 点击率
    2. Interest（兴趣）: 点击 -> 收听率
    3. Engagement（互动）: 收听 -> 完播率
    4. Loyalty（忠诚）: 完播 -> 关注率
    5. Conversion（转化）: 关注 -> 付费率
    
    自动化策略:
    - 自动回复评论（提高互动率）
    - 引导关注（每n期提醒一次）
    - 付费引导（免费提供80%内容，20%付费）
    """
    
    def __init__(self):
        REVENUE_DIR.mkdir(parents=True, exist_ok=True)
        self.funnel_file = REVENUE_DIR / "funnel_data.jsonl"
    
    def calculate_funnel(self, stats):
        """
        计算漏斗各层级转化率
        
        Args:
            stats: {impressions, clicks, listeners, completions, subscribers, paying}
        """
        impressions = max(stats.get("impressions", 1), 1)
        clicks = stats.get("clicks", 0)
        listeners = stats.get("listeners", 0)
        completions = stats.get("completions", 0)
        subscribers = stats.get("subscribers", 0)
        paying = stats.get("paying", 0)
        
        funnel = {
            "impressions": impressions,
            "clicks": clicks,
            "listeners": listeners,
            "completions": completions,
            "subscribers": subscribers,
            "paying": paying,
            "rates": {
                "ctr": round(clicks / impressions * 100, 2),            # 点击率
                "listen_rate": round(listeners / max(clicks, 1) * 100, 2),  # 收听率
                "completion_rate": round(completions / max(listeners, 1) * 100, 2),  # 完播率
                "sub_rate": round(subscribers / max(completions, 1) * 100, 2),  # 关注率
                "pay_rate": round(paying / max(subscribers, 1) * 100, 2),  # 付费率
            }
        }
        
        return funnel
    
    def get_bottleneck(self, funnel):
        """识别漏斗瓶颈"""
        rates = funnel.get("rates", {})
        
        # Find the lowest rate
        min_rate_name = min(rates, key=rates.get)
        min_rate_value = rates[min_rate_name]
        
        recommendations = {
            "ctr": "优化标题和封面，提升点击率",
            "listen_rate": "优化开头30秒，提升留存",
            "completion_rate": "控制时长，加入更多悬念",
            "sub_rate": "增加关注引导频次，提供订阅福利",
            "pay_rate": "设计更多付费专享内容",
        }
        
        return {
            "bottleneck": min_rate_name,
            "rate": min_rate_value,
            "recommendation": recommendations.get(min_rate_name, "持续优化"),
        }
    
    def generate_cta_sequence(self, content_number):
        """
        生成CTA（行动号召）序列
        
        每n期插入一次CTA，避免过度打扰
        """
        ctas = []
        
        # 每3期: 提醒关注
        if content_number % 3 == 0:
            ctas.append({
                "type": "subscribe",
                "text": "🔔 喜欢这类内容？订阅频道，每周更新克苏鲁神话有声书",
                "position": "end",
            })
        
        # 每5期: 引导评论
        if content_number % 5 == 0:
            ctas.append({
                "type": "comment",
                "text": "💬 评论区告诉我：你最害怕哪种恐怖？深海、宇宙还是未知？",
                "position": "end",
            })
        
        # 每10期: 付费引导
        if content_number % 10 == 0:
            ctas.append({
                "type": "monetize",
                "text": "🌟 想要完整版+未公开番外？请在平台支持作者",
                "position": "middle",
            })
        
        # 每期结尾: 通用CTA
        ctas.append({
            "type": "generic",
            "text": "🌙 深夜收听效果最佳 | 克苏鲁神话系列",
            "position": "end",
        })
        
        return ctas
    
    def generate_auto_reply(self, comment, tone="friendly"):
        """自动生成评论回复"""
        # 关键词匹配回复
        replies = {
            "恐怖": "谢谢！下一期会更恐怖哦 🌙",
            "害怕": "就是要这个效果～ 晚上听更有感觉",
            "好听": "感谢支持！持续更新中",
            "更新": "每周固定更新，订阅不迷路！",
            "克苏鲁": "克苏鲁神话爱好者！下一期更硬核",
            "洛夫克拉夫特": "/lovecraft 粉丝！宇宙恐怖的世界观太宏大了",
            "睡前": "最佳收听时间就是深夜 🌙",
            "催更": "在做了在做了！下一期很快就来",
            "好听": "声音好听是AI配音的功劳哈哈",
            "喜欢": "感谢喜欢！你的支持是我更新的动力",
        }
        
        for keyword, reply in replies.items():
            if keyword in comment:
                return reply
        
        # 默认回复
        default_replies = [
            "感谢收听！🌙",
            "谢谢支持，持续更新中！",
            "深夜好！感谢收听克苏鲁系列 🌙",
            "您的收听就是我更新的动力！",
        ]
        
        return random.choice(default_replies)


# ============================================================
# 收益策略分析器
# ============================================================
class RevenueStrategyAnalyzer:
    """分析收益策略，给出优化建议"""
    
    STRATEGIES = {
        "content_mix": {
            "name": "内容组合策略",
            "description": "70%短篇引流 + 20%中篇留存 + 10%长篇付费",
            "expected_uplift": "30-50%",
        },
        "cross_platform": {
            "name": "跨平台分发策略",
            "description": "一次制作，分发到6+平台，最大化曝光",
            "expected_uplift": "200-500%",
        },
        "release_schedule": {
            "name": "发布节奏策略",
            "description": "固定发布时间，建立听众收听习惯",
            "expected_uplift": "20-30%",
        },
        "community": {
            "name": "社群运营策略",
            "description": "评论互动+粉丝群+投稿征集",
            "expected_uplift": "40-60%",
        },
        "monetization_tiers": {
            "name": "阶梯变现策略",
            "description": "免费试听→完整付费→番外付费→周边",
            "expected_uplift": "100-300%",
        },
    }
    
    def analyze(self, current_stats):
        """基于当前数据给出策略建议"""
        recommendations = []
        
        # Check content diversity
        content_count = current_stats.get("total_contents", 0)
        if content_count < 5:
            recommendations.append({
                "priority": 1,
                "strategy": "content_mix",
                "advice": "内容太少，先堆量到10+篇再考虑变现",
            })
        
        # Check platform diversity
        platforms = current_stats.get("platforms", [])
        if len(platforms) < 3:
            recommendations.append({
                "priority": 2,
                "strategy": "cross_platform",
                "advice": f"当前仅{len(platforms)}个平台，建议扩展到至少4个",
            })
        
        # Check release frequency
        weekly_releases = current_stats.get("weekly_releases", 0)
        if weekly_releases < 1:
            recommendations.append({
                "priority": 3,
                "strategy": "release_schedule",
                "advice": "建立固定发布节奏（至少周更），培养听众习惯",
            })
        
        # Check engagement
        if current_stats.get("avg_completion_rate", 0) < 0.3:
            recommendations.append({
                "priority": 4,
                "strategy": "content_quality",
                "advice": "完播率偏低，建议缩短单期时长或优化内容节奏",
            })
        
        # Check monetization
        if current_stats.get("paying_ratio", 0) < 0.01:
            recommendations.append({
                "priority": 5,
                "strategy": "monetization_tiers",
                "advice": "付费率极低，考虑设计付费专享内容或番外",
            })
        
        return sorted(recommendations, key=lambda x: x["priority"])
    
    def generate_action_plan(self, stats):
        """生成具体行动计划"""
        analysis = self.analyze(stats)
        
        plan = []
        for rec in analysis:
            strategy = self.STRATEGIES.get(rec["strategy"], {})
            plan.append({
                "action": rec["advice"],
                "strategy": strategy.get("name", rec["strategy"]),
                "expected_impact": strategy.get("expected_uplift", "未知"),
                "difficulty": "低" if rec["priority"] <= 2 else "中",
            })
        
        return plan


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "repurpose":
        title = sys.argv[2] if len(sys.argv) > 2 else "克苏鲁的呼唤"
        
        # Sample text
        sample_text = """
        I am writing this under an appreciable mental strain, since by tonight I shall be no more.
        Penniless, and at the end of my supply of the drug which alone makes life endurable, I can
        bear the torture no longer; and shall cast myself from this garret window into the squalid
        street below.
        """
        
        repurposer = ContentRepurposer()
        
        print("=== 内容二次利用 ===")
        
        # Extract clips
        clips = repurposer.extract_clips(sample_text * 10, num_clips=3)
        print(f"\n📌 提取 {len(clips)} 个高潮片段:")
        for c in clips:
            print(f"  [{c['score']}分] {c['text'][:60]}...")
        
        # Generate article
        article = repurposer.generate_article(sample_text, title, "zhihu")
        print(f"\n📝 知乎文章 ({len(article)} 字符):")
        print(article[:300] + "...")
        
        # Generate short script
        if clips:
            script = repurposer.generate_short_script(clips[0]["text"], "douyin", 30)
            print(f"\n🎬 抖音脚本:")
            print(script[:200] + "...")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "revenue":
        tracker = RevenueTracker()
        
        # Sample data
        tracker.record_revenue("2026-08-23", "ximalaya", "克苏鲁的呼唤", 150, 5.20, 3)
        tracker.record_revenue("2026-08-23", "youtube", "克苏鲁的呼唤", 80, 0.50, 1)
        tracker.record_revenue("2026-08-23", "xiaoyuzhou", "达贡", 50, 0, 0)
        
        summary = tracker.get_monthly_summary()
        print("=== 月度收益汇总 ===")
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        
        top = tracker.get_top_content("plays", 3)
        print(f"\n最佳内容: {top}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "funnel":
        funnel = AudienceFunnel()
        
        stats = {
            "impressions": 10000,
            "clicks": 800,
            "listeners": 600,
            "completions": 300,
            "subscribers": 50,
            "paying": 5,
        }
        
        result = funnel.calculate_funnel(stats)
        print("=== 听众漏斗 ===")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
        bottleneck = funnel.get_bottleneck(result)
        print(f"\n⚠️ 漏斗瓶颈: {bottleneck['bottleneck']} ({bottleneck['rate']}%)")
        print(f"建议: {bottleneck['recommendation']}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "strategy":
        analyzer = RevenueStrategyAnalyzer()
        
        stats = {
            "total_contents": 3,
            "platforms": ["ximalaya", "youtube"],
            "weekly_releases": 0.5,
            "avg_completion_rate": 0.25,
            "paying_ratio": 0,
        }
        
        plan = analyzer.generate_action_plan(stats)
        print("=== 收益策略行动计划 ===")
        for i, action in enumerate(plan, 1):
            print(f"\n{i}. [{action['difficulty']}] {action['action']}")
            print(f"   策略: {action['strategy']}")
            print(f"   预期效果: {action['expected_impact']}")
    
    else:
        print("收益引擎")
        print()
        print("用法:")
        print("  python revenue_engine.py repurpose <标题>  - 内容二次利用")
        print("  python revenue_engine.py revenue           - 收益追踪")
        print("  python revenue_engine.py funnel            - 听众漏斗分析")
        print("  python revenue_engine.py strategy          - 策略建议")
