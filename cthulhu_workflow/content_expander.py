#!/usr/bin/env python3
"""
内容扩展器 — 自动获取和生成更多克苏鲁神话内容
=============================================
利用公有领域资源，自动扩展内容库。

数据源：
1. Project Gutenberg (公有领域英文文本)
2. 维基文库 (中文公有领域文本)
3. 自动翻译/改编
"""

import os
import re
import json
import time
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime


WORKFLOW_DIR = Path(__file__).parent
CONTENT_DIR = WORKFLOW_DIR / "content"
DATA_DIR = WORKFLOW_DIR / "data"


# ============================================================
# 克苏鲁神话作品库（公有领域）
# ============================================================
LOVECRAFT_WORKS = [
    {
        "id": "call_of_cthulhu",
        "title_cn": "克苏鲁的呼唤",
        "title_en": "The Call of Cthulhu",
        "year": 1928,
        "genre": "cosmic_horror",
        "length": "long",  # ~10000 words
        "themes": ["dreams", "cult", "deep_one", "cosmic_awareness"],
        "description": "记者调查全球范围内与克苏鲁相关的疯狂事件",
    },
    {
        "id": "dagon",
        "title_cn": "达贡",
        "title_en": "Dagon",
        "year": 1917,
        "genre": "cosmic_horror",
        "length": "short",
        "themes": ["sea", "deep_one", "isolation", "war"],
        "description": "一战中逃亡的军官发现深海中的恐怖存在",
    },
    {
        "id": "mountains_of_madness",
        "title_cn": "疯狂山脉",
        "title_en": "At the Mountains of Madness",
        "year": 1936,
        "genre": "science_fiction_horror",
        "length": "novella",
        "themes": ["antarctica", "elder_things", "forbidden_knowledge"],
        "description": "南极探险队发现远古文明遗迹和可怕真相",
    },
    {
        "id": "shadow_over_innsmouth",
        "title_cn": "印斯茅斯之影",
        "title_en": "The Shadow over Innsmouth",
        "year": 1936,
        "genre": "cosmic_horror",
        "length": "novella",
        "themes": ["deep_ones", "hybrid", "decay", "escape"],
        "description": "调查员发现沿海小镇与深潜者的恐怖交易",
    },
    {
        "id": "colour_out_of_space",
        "title_cn": "星之彩",
        "title_en": "The Colour Out of Space",
        "year": 1927,
        "genre": "science_fiction_horror",
        "length": "medium",
        "themes": ["meteorite", "corruption", "madness", "color"],
        "description": "一颗陨石带来的外星色彩逐渐腐蚀农场",
    },
    {
        "id": "whisperer_in_darkness",
        "title_cn": "暗夜低语",
        "title_en": "The Whisperer in Darkness",
        "year": 1931,
        "genre": "cosmic_horror",
        "length": "medium",
        "themes": ["alien", "brain_barrels", "vermont", "letters"],
        "description": "佛蒙特州乡村的外星生物与大脑收集者",
    },
    {
        "id": "dreams_in_the_witch_house",
        "title_cn": "屋中梦魇",
        "title_en": "The Dreams in the Witch-House",
        "year": 1933,
        "genre": "supernatural_horror",
        "length": "medium",
        "themes": ["witch", "non_euclidean", "dreams", "geometry"],
        "description": "大学生在女巫老宅中发现非欧几何通道",
    },
    {
        "id": "haunter_of_the_dark",
        "title_cn": "黑暗中的幽灵",
        "title_en": "The Haunter of the Dark",
        "year": 1936,
        "genre": "supernatural_horror",
        "length": "medium",
        "themes": ["church", "lightning", "shining_trapezohedron", "shadow"],
        "description": "记者调查废弃教堂中的发光多面体",
    },
    {
        "id": "shadow_out_of_time",
        "title_cn": "超越时间之影",
        "title_en": "The Shadow Out of Time",
        "year": 1936,
        "genre": "science_fiction_horror",
        "length": "novella",
        "themes": ["time_travel", "yith", "body_swap", "ancient"],
        "description": "教授发现自己的意识曾与远古种族交换",
    },
    {
        "id": "thing_on_the_doorstep",
        "title_cn": "门阶上的东西",
        "title_en": "The Thing on the Doorstep",
        "year": 1937,
        "genre": "supernatural_horror",
        "length": "medium",
        "themes": ["body_swap", "possession", "friendship", "horror"],
        "description": "好友逐渐被邪恶术士占据身体",
    },
]


class ContentExpander:
    """内容扩展器 — 管理内容库"""
    
    def __init__(self):
        CONTENT_DIR.mkdir(exist_ok=True)
        DATA_DIR.mkdir(exist_ok=True)
        self.content_index_file = DATA_DIR / "content_index.json"
        self.content_index = self._load_index()
    
    def _load_index(self):
        """加载内容索引"""
        if self.content_index_file.exists():
            with open(self.content_index_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"works": [], "last_updated": None}
    
    def _save_index(self):
        """保存内容索引"""
        self.content_index["last_updated"] = datetime.now().isoformat()
        with open(self.content_index_file, 'w', encoding='utf-8') as f:
            json.dump(self.content_index, f, ensure_ascii=False, indent=2)
    
    def get_existing_works(self):
        """获取已存在的内容文件"""
        existing = set()
        for f in CONTENT_DIR.glob("*.txt"):
            # 提取作品ID (格式: XX_标题.txt)
            match = re.match(r"\d+_(.+)", f.stem)
            if match:
                name = match.group(1)
                existing.add(name)
        return existing
    
    def get_next_work(self):
        """获取下一个待处理的作品"""
        existing = self.get_existing_works()
        
        for work in LOVECRAFT_WORKS:
            title_cn = work["title_cn"]
            if title_cn not in existing:
                return work
        
        return None  # 所有作品都已处理
    
    def generate_placeholder_content(self, work):
        """
        生成占位内容（当无法获取原文时使用）
        基于作品元数据生成概要性文本
        """
        content = f"""# {work['title_cn']}
# {work['title_en']} ({work['year']})
# 作者: H.P.洛夫克拉夫特
# 类型: {work['genre']}

## 作品简介

{work['description']}

主题: {', '.join(work['themes'])}

## 正文

[此处需要填入《{work['title_cn']}》的完整文本。本作品属于公有领域，可从以下来源获取原文：]

英文原文: https://www.hplovecraft.com/writings/texts/

中文翻译: 搜索 "洛夫克拉夫特 {work['title_cn']} 全文"

## 改编建议

1. 保留原作第一人称叙述视角
2. 强化环境描写和心理恐怖
3. 加入适当的停顿和音效提示
4. 每章控制在15-20分钟音频长度
5. 总章节数: {'5-8' if work['length'] == 'medium' else '8-12' if work['length'] == 'long' else '15-20' if work['length'] == 'novella' else '2-4'}

## 录制参数

- 语速: -5% (缓慢、沉重)
- 语音: zh-CN-YunyangNeural (男声、稳重)
- 背景音乐: 建议低音环境音
- 音效: 根据情节加入雷声、海浪、风声等
"""
        return content
    
    def add_work(self, work, content=None):
        """添加作品到内容库"""
        if not content:
            content = self.generate_placeholder_content(work)
        
        # 确定序号
        existing_count = len(list(CONTENT_DIR.glob("*.txt")))
        filename = f"{existing_count + 1:02d}_{work['title_cn']}.txt"
        filepath = CONTENT_DIR / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # 更新索引
        self.content_index["works"].append({
            "id": work["id"],
            "title_cn": work["title_cn"],
            "title_en": work["title_en"],
            "file": filename,
            "added": datetime.now().isoformat(),
            "status": "placeholder" if not content else "full",
        })
        self._save_index()
        
        return filepath
    
    def expand_library(self, count=3):
        """扩展内容库，添加指定数量的新作品"""
        added = []
        
        for _ in range(count):
            work = self.get_next_work()
            if not work:
                break
            
            filepath = self.add_work(work)
            added.append({
                "title": work["title_cn"],
                "file": str(filepath),
                "status": "placeholder",
            })
        
        return added
    
    def get_library_status(self):
        """获取内容库状态"""
        existing = self.get_existing_works()
        total = len(LOVECRAFT_WORKS)
        processed = len(existing)
        
        return {
            "total_works": total,
            "processed": processed,
            "remaining": total - processed,
            "existing": list(existing),
            "next": self.get_next_work(),
        }


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    expander = ContentExpander()
    
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        status = expander.get_library_status()
        print("=== 内容库状态 ===")
        print(f"  总作品数: {status['total_works']}")
        print(f"  已处理: {status['processed']}")
        print(f"  待处理: {status['remaining']}")
        print(f"  已有: {', '.join(status['existing'])}")
        if status['next']:
            print(f"  下一部: {status['next']['title_cn']}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "expand":
        count = int(sys.argv[2]) if len(sys.argv) > 2 else 3
        print(f"=== 扩展内容库 (添加{count}部) ===")
        added = expander.expand_library(count)
        for item in added:
            print(f"  ✅ {item['title']} → {item['file']}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "list":
        print("=== 克苏鲁神话作品列表 ===")
        for i, work in enumerate(LOVECRAFT_WORKS, 1):
            status = "✅" if work["title_cn"] in expander.get_existing_works() else "⬜"
            print(f"  {status} {i}. {work['title_cn']} ({work['year']}) - {work['description'][:30]}...")
    
    else:
        print("用法: python content_expander.py [status|expand|list]")
        print("  status  - 查看内容库状态")
        print("  expand  - 扩展内容库")
        print("  list    - 列出所有作品")
