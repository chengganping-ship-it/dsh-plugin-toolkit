#!/usr/bin/env python3
"""
前沿信号 - 自动化数据采集器
每日运行，从多个信源抓取最新资讯
"""

import os
import json
import hashlib
import yaml
import feedparser
import requests
from datetime import datetime, timedelta
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# 项目根目录
BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"
REPORTS_DIR = BASE_DIR / "reports"
DATA_DIR = BASE_DIR / "data"

# 确保目录存在
REPORTS_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)


def load_sources():
    """加载信源配置"""
    config_path = CONFIG_DIR / "sources.yaml"
    if not config_path.exists():
        print("[ERROR] 信源配置文件不存在")
        return {}
    with open(config_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def fetch_rss(url, timeout=10):
    """抓取单个RSS源"""
    try:
        feed = feedparser.parse(url)
        entries = []
        for entry in feed.entries[:20]:  # 每个源最多取20条
            published = None
            if hasattr(entry, "published_parsed") and entry.published_parsed:
                published = datetime(*entry.published_parsed[:6])
            elif hasattr(entry, "updated_parsed") and entry.updated_parsed:
                published = datetime(*entry.updated_parsed[:6])
            
            # 只取最近48小时的内容
            if published and published < datetime.now() - timedelta(hours=48):
                continue
                
            entries.append({
                "title": getattr(entry, "title", ""),
                "link": getattr(entry, "link", ""),
                "summary": getattr(entry, "summary", "")[:500],
                "published": published.isoformat() if published else None,
                "source_url": url
            })
        return entries
    except Exception as e:
        print(f"[WARN] 抓取失败 {url}: {e}")
        return []


def deduplicate(articles):
    """基于标题相似度去重"""
    seen_hashes = set()
    unique = []
    for article in articles:
        title_norm = article["title"].lower().replace(" ", "")[:50]
        h = hashlib.md5(title_norm.encode()).hexdigest()[:12]
        if h not in seen_hashes:
            seen_hashes.add(h)
            unique.append(article)
    return unique


def collect_all():
    """采集所有信源"""
    sources = load_sources()
    all_articles = []
    
    # 收集所有RSS源URL
    rss_urls = []
    for category, source_list in sources.items():
        for source in source_list:
            if source.get("type") == "rss":
                rss_urls.append((category, source))
    
    print(f"[INFO] 共 {len(rss_urls)} 个信源待采集")
    
    # 并发采集
    with ThreadPoolExecutor(max_workers=8) as executor:
        future_map = {}
        for category, source in rss_urls:
            future = executor.submit(fetch_rss, source["url"])
            future_map[future] = (category, source["name"])
        
        for future in as_completed(future_map):
            category, name = future_map[future]
            try:
                articles = future.result()
                for a in articles:
                    a["category"] = category
                    a["source_name"] = name
                all_articles.extend(articles)
                print(f"[OK] {name}: {len(articles)} 条")
            except Exception as e:
                print(f"[FAIL] {name}: {e}")
    
    # 去重
    all_articles = deduplicate(all_articles)
    
    # 按发布时间排序
    all_articles.sort(key=lambda x: x.get("published", ""), reverse=True)
    
    return all_articles


def save_raw_data(articles):
    """保存原始数据"""
    today = datetime.now().strftime("%Y-%m-%d")
    output_path = DATA_DIR / f"raw_{today}.json"
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({
            "date": today,
            "total": len(articles),
            "articles": articles
        }, f, ensure_ascii=False, indent=2)
    
    print(f"[SAVE] 原始数据已保存: {output_path} ({len(articles)} 条)")
    return output_path


def main():
    print("=" * 60)
    print("前沿信号 - 数据采集器 v1.0")
    print(f"运行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    articles = collect_all()
    
    if not articles:
        print("[WARN] 未采集到任何文章")
        return
    
    output = save_raw_data(articles)
    
    # 统计各分类数量
    stats = {}
    for a in articles:
        cat = a.get("category", "unknown")
        stats[cat] = stats.get(cat, 0) + 1
    
    print("\n[统计]")
    for cat, count in sorted(stats.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count} 条")
    
    print(f"\n[完成] 共 {len(articles)} 条去重文章")


if __name__ == "__main__":
    main()
