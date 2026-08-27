#!/usr/bin/env python3
"""录入疯狂山脉数据"""
from memory_store import MemoryStore

mem = MemoryStore()

mem.record_performance(
    content_title="疯狂山脉",
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
    tags='["克苏鲁","洛夫克拉夫特","疯狂山脉","南极"]',
    metadata='{"chapter":3,"chars":2612,"status":"generated_not_published"}'
)

print("✅ 已录入疯狂山脉")
summary = mem.get_memory_summary()
print(f"假设总数: {summary['hypotheses_total']}")
print(f"内容数量: {summary['content_produced']}")
