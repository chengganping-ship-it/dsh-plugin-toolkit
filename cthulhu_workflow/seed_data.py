#!/usr/bin/env python3
"""录入初始数据"""
from memory_store import MemoryStore

mem = MemoryStore()

# 录入已生成的内容
mem.record_performance(
    content_title="克苏鲁的呼唤 第一章",
    content_source="lovecraft_public_domain",
    voice="zh-CN-YunyangNeural",
    publish_time="",
    platform="ximalaya",
    plays=0,
    completion_rate=0,
    likes=0,
    comments=0,
    revenue=0,
    title_variant="",
    cover_variant="",
    tags='["克苏鲁","洛夫克拉夫特","恐怖"]',
    metadata='{"chapter":1,"chars":2150,"status":"generated_not_published"}'
)

print("✅ 已录入第一篇内容")
summary = mem.get_memory_summary()
print(f"假设总数: {summary['hypotheses_total']}")
print(f"内容数量: {summary['content_produced']}")
