#!/usr/bin/env python3
"""
前沿信号 - MVP启动脚本
一个脚本解决：数据采集 + AI摘要生成 + 邮件发送
依赖最少、一键运行
"""

import json
import os
import sys
import hashlib
import smtplib
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path

# ============================================
# 配置区 - 修改这里即可
# ============================================
CONFIG = {
    # 邮件配置（用于发送日报）
    "email": {
        "enabled": False,  # 设为True启用邮件发送
        "smtp_server": "smtp.qq.com",
        "smtp_port": 465,
        "sender": "your_email@qq.com",
        "password": "your_auth_code",  # QQ邮箱授权码
    },
    
    # 内容配置
    "content": {
        "industry": "AI",  # AI / 跨境电商 / 新能源 / 生物医药 / 消费
        "language": "zh",  # zh / en
        "max_articles": 10,  # 每日最多推送文章数
    },
    
    # 订阅者列表
    "subscribers": [
        # "subscriber1@example.com",
        # "subscriber2@example.com",
    ]
}

# ============================================
# 核心逻辑
# ============================================

# 精选RSS信源（精简版，只保留最活跃的信源）
FEED_SOURCES = {
    "AI": [
        ("量子位", "https://www.qbitai.com/feed"),
        ("机器之心", "https://www.jiqizhixin.com/rss"),
        ("Hacker News", "https://hnrss.org/frontpage"),
        ("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/"),
        ("The Verge", "https://www.theverge.com/rss/index.xml"),
    ],
    "跨境电商": [
        ("雨果跨境", "https://www.cifnews.com/feed"),
        ("Shopify News", "https://news.shopify.com/news.rss"),
        ("电商报", "https://www.dsmbox.com/rss"),
    ],
    "新能源": [
        ("储能头条", "https://www.escn.com.cn/rss.xml"),
        ("光伏盒子", "https://www.pvbox.com/rss"),
    ],
    "生物医药": [
        ("生物谷", "https://www.bioon.com/rss"),
        ("丁香园", "https://www.dxy.cn/rss"),
    ],
    "消费": [
        ("36氪", "https://36kr.com/feed"),
        ("虎嗅", "https://www.huxiu.com/rss/0.xml"),
    ]
}

def fetch_feed(url, timeout=8):
    """抓取单个RSS源"""
    try:
        import urllib.request
        import ssl
        
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
            data = response.read()
        
        import xml.etree.ElementTree as ET
        root = ET.fromstring(data)
        
        items = []
        # RSS 2.0
        for item in root.iter('item'):
            title = item.findtext('title', '').strip()
            link = item.findtext('link', '').strip()
            desc = item.findtext('description', '').strip()[:300]
            pub_date = item.findtext('pubDate', '')
            
            if title:
                items.append({
                    'title': title,
                    'link': link,
                    'summary': desc,
                    'published': pub_date
                })
        
        # Atom
        if not items:
            ns = {'atom': 'http://www.w3.org/2005/Atom'}
            for entry in root.findall('.//atom:entry', ns):
                title = entry.findtext('atom:title', '', ns).strip()
                link = entry.find('atom:link', ns)
                link = link.get('href', '') if link is not None else ''
                summary = entry.findtext('atom:summary', '', ns).strip()[:300]
                
                if title:
                    items.append({
                        'title': title,
                        'link': link,
                        'summary': summary,
                        'published': ''
                    })
        
        return items[:15]
    except Exception as e:
        return []


def collect_all(industry="AI"):
    """采集指定行业的所有信源"""
    sources = FEED_SOURCES.get(industry, FEED_SOURCES["AI"])
    all_articles = []
    
    print(f"[采集] 行业: {industry}, 信源数: {len(sources)}")
    
    for name, url in sources:
        articles = fetch_feed(url)
        for a in articles:
            a['source'] = name
        all_articles.extend(articles)
        if articles:
            print(f"  ✓ {name}: {len(articles)} 条")
    
    # 去重
    seen = set()
    unique = []
    for a in all_articles:
        h = hashlib.md5(a['title'].encode()).hexdigest()[:8]
        if h not in seen:
            seen.add(h)
            unique.append(a)
    
    print(f"[完成] 共采集 {len(unique)} 条去重文章")
    return unique


def generate_daily_report(articles, industry="AI"):
    """生成日报内容"""
    today = datetime.now().strftime("%Y年%m月%d日")
    
    # 取前10条
    articles = articles[:CONFIG['content']['max_articles']]
    
    report = f"""# 前沿信号 | {industry}行业日报
**{today}** · 精选 {len(articles)} 条关键情报

---

## 🔥 今日TOP 5

"""
    
    for i, a in enumerate(articles[:5], 1):
        report += f"### {i}. [{a['title']}]({a['link']})\n"
        report += f"> 来源：{a['source']}\n\n"
    
    report += "---\n\n## 📋 更多值得关注\n\n"
    
    for a in articles[5:]:
        report += f"- [{a['title']}]({a['link']}) — *{a['source']}*\n"
    
    report += f"""

---

## 💡 今日洞察

> 以上内容由前沿信号自动采集生成。完整深度分析请订阅Pro版（¥299/月）。

📧 取消订阅请回复"退订"
"""
    
    return report


def save_report(report, industry="AI"):
    """保存报告到本地"""
    today = datetime.now().strftime("%Y-%m-%d")
    filename = f"reports/{industry}_{today}.md"
    
    Path("reports").mkdir(exist_ok=True)
    
    with open(filename, "w", encoding="utf-8") as f:
        f.write(report)
    
    print(f"[保存] {filename}")
    return filename


def email_report(report, subscribers):
    """发送邮件给订阅者"""
    email_cfg = CONFIG['email']
    
    if not email_cfg['enabled'] or not subscribers:
        print("[邮件] 未启用或无订阅者")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = email_cfg['sender']
        msg['To'] = ', '.join(subscribers)
        msg['Subject'] = f"前沿信号 | 行业日报 {datetime.now().strftime('%Y-%m-%d')}"
        
        msg.attach(MIMEText(report, 'plain', 'utf-8'))
        
        with smtplib.SMTP_SSL(email_cfg['smtp_server'], email_cfg['smtp_port']) as server:
            server.login(email_cfg['sender'], email_cfg['password'])
            server.send_message(msg)
        
        print(f"[邮件] 已发送给 {len(subscribers)} 位订阅者")
        return True
    except Exception as e:
        print(f"[邮件] 发送失败: {e}")
        return False


def main():
    print("=" * 60)
    print("前沿信号 MVP | 一键启动")
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # 1. 采集
    industry = CONFIG['content']['industry']
    articles = collect_all(industry)
    
    if not articles:
        print("[警告] 未采集到文章，请检查网络")
        return
    
    # 2. 生成日报
    report = generate_daily_report(articles, industry)
    
    # 3. 保存
    filename = save_report(report, industry)
    
    # 4. 输出到终端
    print("\n" + "=" * 60)
    print(report)
    print("=" * 60)
    
    # 5. 发送邮件（如启用）
    if CONFIG['subscribers']:
        email_report(report, CONFIG['subscribers'])
    
    print(f"\n[完成] 日报已生成: {filename}")
    print("[提示] 将以上内容复制到你的公众号/知乎/邮件发送")


if __name__ == "__main__":
    main()
