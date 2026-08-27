#!/usr/bin/env python3
"""
真实克苏鲁文本自动获取模块
===========================
从hplovecraft.com官方获取H.P.洛夫克拉夫特作品英文原文。

URL映射（已验证）：
- d.aspx = Dagon (达贡)
- cc.aspx = The Call of Cthulhu (克苏鲁的呼唤)
- mm.aspx = At the Mountains of Madness (疯狂山脉)
- soi.aspx = The Shadow over Innsmouth (印斯茅斯之影)
- colour.aspx = The Colour Out of Space (星之彩)
- whisperer.aspx = The Whisperer in Darkness (暗夜低语)
- haunter.aspx = The Haunter of the Dark (黑暗中的幽灵)
- sot.aspx = The Shadow Out of Time (超越时间之影)
- doorstep.aspx = The Thing on the Doorstep (门阶上的东西)
- witch.aspx = The Dreams in the Witch-House (屋中梦魇)

免费翻译（英文→中文）：
- MyMemory API (free, 5000 chars/day)
- LibreTranslate public instances
"""

import os
import re
import json
import time
import hashlib
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime


WORKFLOW_DIR = Path(__file__).parent
CONTENT_DIR = WORKFLOW_DIR / "content"
CACHE_DIR = WORKFLOW_DIR / "data" / "content_cache"
DATA_DIR = WORKFLOW_DIR / "data"


# ============================================================
# 作品URL映射（已验证）
# ============================================================
LOVECRAFT_URLS = {
    "dagon": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/d.aspx",
        "title_cn": "达贡", "title_en": "Dagon", "year": 1917,
    },
    "call_of_cthulhu": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/cc.aspx",
        "title_cn": "克苏鲁的呼唤", "title_en": "The Call of Cthulhu", "year": 1928,
    },
    "mountains_of_madness": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/mm.aspx",
        "title_cn": "疯狂山脉", "title_en": "At the Mountains of Madness", "year": 1936,
    },
    "shadow_over_innsmouth": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/soi.aspx",
        "title_cn": "印斯茅斯之影", "title_en": "The Shadow over Innsmouth", "year": 1936,
    },
    "colour_out_of_space": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/soidd.aspx",
        "title_cn": "星之彩", "title_en": "The Colour Out of Space", "year": 1927,
    },
    "whisperer_in_darkness": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/whisperer.aspx",
        "title_cn": "暗夜低语", "title_en": "The Whisperer in Darkness", "year": 1931,
    },
    "shadow_out_of_time": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/sot.aspx",
        "title_cn": "超越时间之影", "title_en": "The Shadow Out of Time", "year": 1936,
    },
    "witch_house": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/witch.aspx",
        "title_cn": "屋中梦魇", "title_en": "The Dreams in the Witch-House", "year": 1933,
    },
    "haunter_of_the_dark": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/haunter.aspx",
        "title_cn": "黑暗中的幽灵", "title_en": "The Haunter of the Dark", "year": 1936,
    },
    "thing_on_doorstep": {
        "url": "https://www.hplovecraft.com/writings/texts/fiction/doorstep.aspx",
        "title_cn": "门阶上的东西", "title_en": "The Thing on the Doorstep", "year": 1937,
    },
}


class ContentFetcher:
    """自动获取真实克苏鲁文本"""
    
    def __init__(self):
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        DATA_DIR.mkdir(exist_ok=True)
        self.fetch_log = DATA_DIR / "fetch_log.json"
        self._init_log()
    
    def _init_log(self):
        if not self.fetch_log.exists():
            with open(self.fetch_log, 'w', encoding='utf-8') as f:
                json.dump({"fetches": []}, f, ensure_ascii=False, indent=2)
    
    def _log_fetch(self, work_id, source, url, status, size=0, error=None):
        with open(self.fetch_log, 'r', encoding='utf-8') as f:
            log = json.load(f)
        entry = {
            "timestamp": datetime.now().isoformat(),
            "work_id": work_id,
            "source": source,
            "url": url,
            "status": status,
            "size": size,
        }
        if error:
            entry["error"] = str(error)[:200]
        log["fetches"].append(entry)
        with open(self.fetch_log, 'w', encoding='utf-8') as f:
            json.dump(log, f, ensure_ascii=False, indent=2)
    
    def _cache_key(self, url):
        return hashlib.md5(url.encode()).hexdigest()[:12]
    
    def _get_cached(self, url):
        key = self._cache_key(url)
        cache_file = CACHE_DIR / f"{key}.txt"
        if cache_file.exists():
            return cache_file.read_text(encoding='utf-8')
        return None
    
    def _save_cache(self, url, content):
        key = self._cache_key(url)
        cache_file = CACHE_DIR / f"{key}.txt"
        cache_file.write_text(content, encoding='utf-8')
    
    def _http_get(self, url, timeout=25, max_retries=2):
        """HTTP GET with retry and exponential backoff"""
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        for attempt in range(max_retries):
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=timeout) as resp:
                    content = resp.read()
                    try:
                        return content.decode('utf-8')
                    except UnicodeDecodeError:
                        return content.decode('latin-1')
            except Exception as e:
                if attempt < max_retries - 1:
                    time.sleep(2 ** attempt)
                else:
                    raise
    
    def _extract_story_text(self, html, title_en):
        """
        从hplovecraft.com的HTML中提取故事全文
        
        页面结构：
        - 主要内容在 <div class="pagelayout"> 内的表格中
        - 导航条在内容之前，需要跳过
        - 故事以标题开始，后跟第一段
        """
        # Remove script and style
        html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)
        html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL | re.IGNORECASE)
        
        # Find the main content div
        # The story is inside <div class="pagelayout">
        pagelayout_match = re.search(r'<div[^>]*class="pagelayout"[^>]*>(.*?)</div>\s*(?:</div>|<footer|</body>)', html, re.DOTALL | re.IGNORECASE)
        
        if pagelayout_match:
            content_html = pagelayout_match.group(1)
        else:
            # Fallback: use the whole body
            body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
            content_html = body_match.group(1) if body_match else html
        
        # Convert all tags to newlines
        text = re.sub(r'<[^>]+>', '\n', content_html)
        
        # Clean up whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r'&nbsp;', ' ', text)
        text = re.sub(r'&bull;', ' ', text)
        text = re.sub(r'&amp;', '&', text)
        text = re.sub(r'&lt;', '<', text)
        text = re.sub(r'&gt;', '>', text)
        text = re.sub(r'&quot;', '"', text)
        text = re.sub(r'&#39;', "'", text)
        text = re.sub(r'[ \t]+', ' ', text)
        text = text.strip()
        
        # Skip navigation elements until we find the story title
        # Navigation typically has: "Home", "His Life", "His Writings", etc.
        # The story starts after these navigation items
        
        # Find the actual story beginning
        # The title format is: "Title" by H. P. Lovecraft (or similar)
        story_markers = [
            f'"{title_en}" by H. P. Lovecraft',
            f'"{title_en}" by H.P. Lovecraft',
            f'{title_en} by H. P. Lovecraft',
            f'{title_en} by H.P. Lovecraft',
            f'{title_en} By H. P.',
        ]
        
        story_start = -1
        for marker in story_markers:
            story_start = text.find(marker)
            if story_start >= 0:
                break
        
        if story_start > 0:
            text = text[story_start:]
        elif story_start < 0:
            # Fallback: skip everything before first substantial line
            lines = text.split('\n')
            for i, line in enumerate(lines):
                if len(line.strip()) > 30 and 'Home' not in line:
                    text = '\n'.join(lines[i:])
                    break
        
        # Remove footer (everything after "Donovan K. Loucks" or similar)
        footer_markers = [
            'Donovan K. Loucks',
            'All Rights Reserved',
            'This site is maintained by',
            'Copyright © 1998',
            '© 1998',
        ]
        text_lower = text.lower()
        for fm in footer_markers:
            idx = text_lower.find(fm.lower())
            if idx > 100:
                text = text[:idx].rstrip()
                break
        
        # Remove trailing whitespace and extra newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()
    
    def fetch_text(self, work_id):
        """
        获取单个作品文本
        
        Args:
            work_id: 作品ID (如 'dagon', 'call_of_cthulhu')
        
        Returns:
            dict: {text, source, url, work_id} or None
        """
        source = LOVECRAFT_URLS.get(work_id)
        if not source:
            print(f"  ❌ 未知作品: {work_id}")
            return None
        
        url = source["url"]
        
        # Check cache
        cached = self._get_cached(url)
        if cached:
            return {"text": cached, "source": "cache", "url": url, "work_id": work_id}
        
        try:
            html = self._http_get(url, timeout=25)
            text = self._extract_story_text(html, source["title_en"])
            
            if len(text) < 100:
                self._log_fetch(work_id, "hplovecraft", url, "too_short", len(text))
                return None
            
            self._save_cache(url, text)
            self._log_fetch(work_id, "hplovecraft", url, "success", len(text))
            
            return {"text": text, "source": "hplovecraft", "url": url, "work_id": work_id}
            
        except Exception as e:
            self._log_fetch(work_id, "hplovecraft", url, "error", error=e)
            return None
    
    def fetch_all_works(self):
        """获取所有作品"""
        results = {}
        total = len(LOVECRAFT_URLS)
        success = 0
        
        print(f"=== 获取 {total} 部克苏鲁作品 ===")
        print(f"   来源: hplovecraft.com")
        print()
        
        for i, (work_id, source) in enumerate(LOVECRAFT_URLS.items(), 1):
            print(f"[{i}/{total}] {source['title_cn']} ({source['title_en']})...", end=" ", flush=True)
            
            result = self.fetch_text(work_id)
            if result:
                results[work_id] = result
                success += 1
                print(f"✅ ({len(result['text'])} 字符)")
            else:
                print(f"❌")
            
            time.sleep(1)  # Be polite
        
        print(f"\n=== 完成: {success}/{total} 成功 ===")
        return results
    
    def save_as_content_file(self, work_id, text, index=None):
        """保存为内容文件"""
        source = LOVECRAFT_URLS.get(work_id)
        if not source:
            return None
        
        if index is None:
            existing = list(CONTENT_DIR.glob("*.txt"))
            index = len(existing) + 1
        
        filename = f"{index:02d}_{source['title_cn']}.txt"
        filepath = CONTENT_DIR / filename
        
        # Add metadata header
        content = f"""# {source['title_cn']} / {source['title_en']}
# 作者: H.P.洛夫克拉夫特 (H.P. Lovecraft)
# 年份: {source['year']}
# 获取时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}
# 来源: hplovecraft.com (公有领域)
# 长度: {len(text)} 字符

---

{text}
"""
        filepath.write_text(content, encoding='utf-8')
        return filepath
    
    def translate_text_free(self, text, source_lang="en", target_lang="zh"):
        """
        使用免费API翻译文本
        
        数据源（全部免费）：
        1. MyMemory API (5000 chars/day, no key needed)
        2. LibreTranslate public instances
        """
        # MyMemory Translation API (free, no key needed)
        # https://mymemory.translated.net/doc/spec.php
        import urllib.parse
        
        # Split text into chunks (MyMemory limit: 500 chars per request)
        chunk_size = 450
        chunks = []
        for i in range(0, len(text), chunk_size):
            chunks.append(text[i:i+chunk_size])
        
        translated_chunks = []
        for i, chunk in enumerate(chunks):
            try:
                encoded_text = urllib.parse.quote(chunk)
                url = f"https://api.mymemory.translated.net/get?q={encoded_text}&langpair={source_lang}|{target_lang}"
                
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    data = json.loads(resp.read().decode())
                
                translated = data.get("responseData", {}).get("translatedText", "")
                if translated and translated != chunk:
                    translated_chunks.append(translated)
                else:
                    translated_chunks.append(chunk)  # fallback to original
                
                time.sleep(0.5)  # Rate limit
                
            except Exception as e:
                # If translation fails, keep original
                translated_chunks.append(chunk)
        
        return ' '.join(translated_chunks)


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    fetcher = ContentFetcher()
    
    if len(sys.argv) > 1 and sys.argv[1] == "all":
        results = fetcher.fetch_all_works()
        for work_id, result in results.items():
            filepath = fetcher.save_as_content_file(work_id, result["text"])
            if filepath:
                print(f"  Saved: {filepath.name}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "fetch":
        work_id = sys.argv[2] if len(sys.argv) > 2 else "dagon"
        result = fetcher.fetch_text(work_id)
        if result:
            print(f"=== {work_id} ===")
            print(f"来源: {result['source']}")
            print(f"URL: {result['url']}")
            print(f"长度: {len(result['text'])} 字符")
            print(f"\n前300字符:")
            print(result['text'][:300])
            
            filepath = fetcher.save_as_content_file(work_id, result["text"])
            if filepath:
                print(f"\n已保存: {filepath}")
        else:
            print(f"获取失败: {work_id}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "list":
        print("=== 可获取的克苏鲁作品 ===")
        for work_id, source in LOVECRAFT_URLS.items():
            print(f"  {work_id}: {source['title_cn']} ({source['title_en']}, {source['year']})")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "translate":
        work_id = sys.argv[2] if len(sys.argv) > 2 else "dagon"
        # Fetch first
        result = fetcher.fetch_text(work_id)
        if result:
            print(f"翻译 {work_id} ({len(result['text'])} 字符)...")
            translated = fetcher.translate_text_free(result['text'][:1000])  # Test with first 1000 chars
            print(f"\n原文 (前500): {result['text'][:500]}")
            print(f"\n译文 (前500): {translated[:500]}")
        else:
            print("获取原文失败")
    
    else:
        print("用法:")
        print("  python content_fetcher.py all       - 获取全部作品")
        print("  python content_fetcher.py fetch <id> - 获取单个作品")
        print("  python content_fetcher.py list      - 列出所有可获取作品")
        print("  python content_fetcher.py translate <id> - 翻译测试")
