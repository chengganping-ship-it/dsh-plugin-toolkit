#!/usr/bin/env python3
"""
推广引擎 — 社交媒体自动推广
============================
利用免费平台和自动化手段进行内容推广。

平台：
1. 小红书 (手动+自动发布)
2. 抖音 (短视频预告)
3. B站 (预告+幕后)
4. 微博 (话题推广)
5. 知乎 (悬疑/恐怖话题)

免费工具：
- 草料二维码 (生成推广二维码)
- Canva (免费设计)
- 剪映 (免费剪辑)
"""

import os
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime


WORKFLOW_DIR = Path(__file__).parent
DATA_DIR = WORKFLOW_DIR / "data"
PROMO_DIR = WORKFLOW_DIR / "promotion"


# ============================================================
# 推广模板库
# ============================================================
PROMO_TEMPLATES = {
    "xhs_post": {
        "platform": "小红书",
        "title_patterns": [
            "🌙 深夜恐怖故事｜{title} | 克苏鲁神话",
            "🔥 胆大者入！{title}有声书来了",
            "🤫 没人敢听完的恐怖故事：{title}",
        ],
        "content_template": """🕯️ {title}
——克苏鲁神话经典 · 第{chapter}期

{description}

🎧 收听渠道：喜马拉雅 | 小宇宙 | 蜻蜓FM

#克苏鲁 #恐怖故事 #有声书 #深夜读物 #洛夫克拉夫特

👇 评论区告诉我你的感受""",
        "tags": ["克苏鲁", "恐怖故事", "有声书", "深夜读物", "洛夫克拉夫特"],
    },
    "weibo_post": {
        "platform": "微博",
        "title_patterns": [
            "#克苏鲁的呼唤# {title} 有声版来了",
            "深夜恐怖故事｜{title}",
        ],
        "content_template": """#克苏鲁神话#{chapter}期
{title}

{description}

🎧 收听：喜马拉雅/小宇宙/蜻蜓FM

谁敢听完评论区打卡👇""",
        "tags": ["克苏鲁神话", "恐怖故事", "有声书"],
    },
    "zhihu_post": {
        "platform": "知乎",
        "title_patterns": [
            "如何评价洛夫克拉夫特的《{title}》？",
            "《{title}》讲了什么？最详细的解读来了",
        ],
        "content_template": """最近把洛夫克拉夫特的经典作品《{title}》做成了有声书。

这部作品写于{year}年，是克苏鲁神话中最著名的篇章之一。

【故事简介】
{description}

【收听地址】
喜马拉雅 | 小宇宙 | 蜻蜓FM 搜索「克苏鲁有声书」

【我读出的恐怖】
1. 人类在宇宙中的渺小
2. 不可名状的恐惧比具体怪物更可怕
3. 知识的代价可能是疯狂

感兴趣的可以去听，睡前慎入。""",
        "tags": ["克苏鲁", "文学解读", "有声书", "洛夫克拉夫特"],
    },
    "bilibili_post": {
        "platform": "B站",
        "title_patterns": [
            "【有声书】《{title}》克苏鲁神话经典",
            "深夜慎入｜{title} | 克苏鲁有声书",
        ],
        "content_template": """《{title}》
——H.P.洛夫克拉夫特 经典克苏鲁神话

{description}

🔊 本系列将持续更新克苏鲁神话经典作品
🔔 订阅+小铃铛 不错过更新

#克苏鲁 #恐怖故事 #有声书 #洛夫克拉夫特""",
        "tags": ["克苏鲁", "有声书", "恐怖故事"],
    },
}


class PromotionEngine:
    """推广引擎 — 自动生成推广内容"""
    
    def __init__(self):
        DATA_DIR.mkdir(exist_ok=True)
        PROMO_DIR.mkdir(exist_ok=True)
        self.promo_log = DATA_DIR / "promotion_log.json"
        self._init_log()
    
    def _init_log(self):
        if not self.promo_log.exists():
            with open(self.promo_log, 'w', encoding='utf-8') as f:
                json.dump({"posts": []}, f, ensure_ascii=False, indent=2)
    
    def generate_promo(self, title, description="", chapter=1, year=1928):
        """
        为一条内容生成全平台的推广文案
        
        Returns:
            dict: 各平台的推广内容
        """
        results = {}
        
        for platform, template in PROMO_TEMPLATES.items():
            # 选择标题变体
            title_idx = (chapter - 1) % len(template["title_patterns"])
            post_title = template["title_patterns"][title_idx].format(title=title)
            
            # 填充内容模板
            content = template["content_template"].format(
                title=title,
                description=description,
                chapter=chapter,
                year=year,
            )
            
            results[platform] = {
                "platform": template["platform"],
                "title": post_title,
                "content": content,
                "tags": template["tags"],
            }
        
        return results
    
    def save_promo(self, content_title, promo_data):
        """保存推广内容到文件"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        for platform, data in promo_data.items():
            filename = f"{platform}_{content_title}_{timestamp}.md"
            filepath = PROMO_DIR / filename
            
            md_content = f"""# [{data['platform']}] {data['title']}

**发布时间建议**: 21:00-23:00 (恐怖内容深夜效果最佳)

---

{data['content']}

---

**Tags**: {', '.join(data['tags'])}

**封面建议**: 使用深色+克苏鲁元素的封面图
**音频预告**: 30秒高潮片段
"""
            filepath.write_text(md_content, encoding='utf-8')
        
        # 记录到推广日志
        with open(self.promo_log, 'r', encoding='utf-8') as f:
            log = json.load(f)
        
        log["posts"].append({
            "content_title": content_title,
            "timestamp": datetime.now().isoformat(),
            "platforms": list(promo_data.keys()),
        })
        
        with open(self.promo_log, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
    
    def get_promo_schedule(self, content_list):
        """
        为多个内容生成推广排期
        每天发布1-2个平台，避免刷屏
        """
        schedule = []
        platforms = list(PROMO_TEMPLATES.keys())
        
        for i, content in enumerate(content_list):
            # 每个内容选择2个平台交替推广
            day_platforms = platforms[i % len(platforms): (i % len(platforms)) + 2]
            if len(day_platforms) < 2:
                day_platforms += platforms[:2 - len(day_platforms)]
            
            schedule.append({
                "day_offset": i,
                "content": content,
                "platforms": day_platforms,
            })
        
        return schedule
    
    def get_total_posts(self):
        """获取总推广数"""
        with open(self.promo_log, 'r', encoding='utf-8') as f:
            log = json.load(f)
        return len(log["posts"])


# ============================================================
# 链接追踪器
# ============================================================
class LinkTracker:
    """追踪各平台链接点击率"""
    
    def __init__(self):
        self.links_file = DATA_DIR / "tracked_links.json"
        self._init_links()
    
    def _init_links_file(self):
        if not self.links_file.exists():
            with open(self.links_file, 'w', encoding='utf-8') as f:
                json.dump({"links": []}, f, ensure_ascii=False, indent=2)
    
    def create_tracking_link(self, platform, content_title, url):
        """创建追踪链接（使用免费短链服务）"""
        link_id = hashlib.md5(f"{platform}_{content_title}_{time.time()}".encode()).hexdigest()[:8]
        
        tracked = {
            "id": link_id,
            "platform": platform,
            "content": content_title,
            "url": url,
            "clicks": 0,
            "created": datetime.now().isoformat(),
        }
        
        return tracked
    
    def get_utm_url(self, url, source, medium="social", campaign="cthulhu_audiobook"):
        """生成UTM追踪链接"""
        import urllib.parse
        params = {
            "utm_source": source,
            "utm_medium": medium,
            "utm_campaign": campaign,
        }
        query_string = urllib.parse.urlencode(params)
        return f"{url}?{query_string}"


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    engine = PromotionEngine()
    
    if len(sys.argv) > 1 and sys.argv[1] == "generate":
        title = sys.argv[2] if len(sys.argv) > 2 else "克苏鲁的呼唤"
        desc = sys.argv[3] if len(sys.argv) > 3 else "一座沉睡在太平洋底的古老城市"
        chapter = int(sys.argv[4]) if len(sys.argv) > 4 else 1
        
        print(f"=== 生成推广内容: {title} ===")
        promo = engine.generate_promo(title, desc, chapter)
        
        for platform, data in promo.items():
            print(f"\n{'='*40}")
            print(f"📱 {data['platform']}")
            print(f"标题: {data['title']}")
            print(f"内容:\n{data['content'][:100]}...")
        
        # Save to files
        engine.save_promo(title, promo)
        print(f"\n✅ 推广内容已保存到 promotion/ 目录")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "schedule":
        content_list = [
            {"title": "克苏鲁的呼唤", "desc": "沉睡在太平洋底的古老城市"},
            {"title": "达贡", "desc": "深海中的恐怖存在"},
            {"title": "疯狂山脉", "desc": "南极洲的远古恐怖"},
        ]
        schedule = engine.get_promo_schedule(content_list)
        print("=== 推广排期 ===")
        for item in schedule:
            print(f"  Day +{item['day_offset']}: {item['content']['title']} → {', '.join(item['platforms'])}")
    
    else:
        print("用法: python promotion_engine.py generate <标题> <描述> [章节号]")
        print("      python promotion_engine.py schedule")
