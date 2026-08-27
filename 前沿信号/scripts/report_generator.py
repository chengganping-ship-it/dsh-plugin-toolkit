#!/usr/bin/env python3
"""
前沿信号 - 日报生成器
读取原始采集数据，基于模板生成结构化日报
"""

import json
import sys
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# 路径配置 - 使用 pathlib 实现跨平台兼容
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports"

# 确保目录存在
REPORTS_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

# 分类显示名称映射
CATEGORY_DISPLAY = {
    "ai_tech": ("🤖 AI/大模型动态", "ai_tech"),
    "startup_vc": ("💰 创业与融资", "startup_vc"),
    "ecommerce_crossboard": ("🌍 跨境电商 + 出海", "cross_border"),
    "macro_economy": ("📊 宏观与政策", "regulation"),
}

# 分类排序优先级
CATEGORY_ORDER = ["ai_tech", "startup_vc", "ecommerce_crossboard", "macro_economy"]


def load_raw_data(date_str=None):
    """加载指定日期的原始采集数据，默认为今天"""
    if date_str is None:
        date_str = datetime.now().strftime("%Y-%m-%d")

    data_file = DATA_DIR / f"raw_{date_str}.json"
    if not data_file.exists():
        print(f"[ERROR] 原始数据文件不存在: {data_file}")
        print(f"[HINT] 请先运行 collector.py 采集数据")
        return None

    with open(data_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"[LOAD] 已加载 {data.get('total', 0)} 条文章 ({date_str})")
    return data


def group_by_category(articles):
    """按分类对文章进行分组"""
    groups = defaultdict(list)
    for article in articles:
        category = article.get("category", "unknown")
        groups[category].append(article)
    return groups


def format_article_summary(article, index):
    """格式化单篇文章为 markdown 摘要"""
    title = article.get("title", "无标题")
    source = article.get("source_name", article.get("source_url", "未知来源"))
    summary = article.get("summary", "").strip()
    link = article.get("link", "")
    published = article.get("published", "")

    # 截断过长的摘要
    if len(summary) > 200:
        summary = summary[:200] + "..."

    lines = []
    lines.append(f"**{index}. {title}**")
    if summary:
        lines.append(f"> {summary}")
    meta_parts = [f"来源：{source}"]
    if published:
        # 只显示日期部分
        meta_parts.append(published[:10])
    lines.append(f"> {' | '.join(meta_parts)}")
    if link:
        lines.append(f"> 🔗 [阅读原文]({link})")
    lines.append("")

    return "\n".join(lines)


def generate_top3_section(articles):
    """生成今日必读 TOP 3 部分"""
    lines = ["## 🔥 今日必读 TOP 3", ""]

    # 取前3篇（已按发布时间排序）
    top_articles = articles[:3]
    fallback_titles = [
        "AI 大模型竞争加速，行业格局持续演变",
        "跨境电商政策动态，卖家需关注合规变化",
        "科技融资市场活跃，早期项目值得关注",
    ]

    for i, article in enumerate(top_articles, 1):
        title = article.get("title", fallback_titles[i - 1] if i <= len(fallback_titles) else "行业动态")
        source = article.get("source_name", "前沿信号")
        link = article.get("link", "")
        summary = article.get("summary", "").strip()

        lines.append(f"### {i}. {title}")
        if summary:
            # 取第一句话作为核心概括
            first_sentence = summary.split("。")[0].split(".")[0][:100]
            lines.append(f"> **核心一句话概括：** {first_sentence}")
        lines.append(f"> **为什么重要：** 该动态对跨境电商从业者和AI创业者具有直接参考价值，建议持续关注后续发展。")
        lines.append(f"> **行动建议：** 评估对自身业务的潜在影响，必要时调整策略。")
        if link:
            lines.append(f"> 📎 来源：[{source}]({link})")
        else:
            lines.append(f"> 📎 来源：{source}")
        lines.append("")

    return "\n".join(lines)


def generate_category_section(category, articles):
    """生成单个分类的 markdown 部分"""
    if category not in CATEGORY_DISPLAY:
        display_name = f"📌 {category}"
    else:
        display_name = CATEGORY_DISPLAY[category][0]

    lines = [f"## {display_name}", ""]

    if not articles:
        lines.append("*今日暂无相关动态*")
        lines.append("")
        return "\n".join(lines)

    # 每类最多展示 5 条
    display_articles = articles[:5]
    for i, article in enumerate(display_articles, 1):
        lines.append(format_article_summary(article, i))

    # 添加前沿洞察
    if display_articles:
        first_title = display_articles[0].get("title", "")
        lines.append("**前沿洞察：**")
        lines.append(f"> 本批次 {display_name} 共收录 {len(articles)} 条动态。重点关注「{first_title[:30]}」等方向，建议结合自身业务持续跟踪。")
        lines.append("")

    return "\n".join(lines)


def generate_action_section(articles):
    """生成今日行动建议部分"""
    lines = ["## 💡 今日行动建议", ""]

    # 根据文章内容动态生成建议
    has_ai = any(a.get("category") == "ai_tech" for a in articles[:10])
    has_ecom = any(a.get("category") == "ecommerce_crossboard" for a in articles[:10])
    has_finance = any(a.get("category") == "startup_vc" for a in articles[:10])

    lines.append("1. **今天就可以做的1件事：** ", "")
    if has_ai:
        lines[-1] = "1. **今天就可以做的1件事：** 浏览今日AI动态，评估是否有可应用于自身业务的新工具或新模型。"
    elif has_ecom:
        lines[-1] = "1. **今天就可以做的1件事：** 检查跨境电商平台政策变化，确认店铺合规状态。"
    else:
        lines[-1] = "1. **今天就可以做的1件事：** 花3分钟浏览今日情报，标记需要深度阅读的文章。"

    lines.append("2. **本周需要关注的信号：** ")
    signals = []
    if has_ai:
        signals.append("AI领域新模型发布")
    if has_ecom:
        signals.append("跨境电商平台规则调整")
    if has_finance:
        signals.append("一级市场融资动向")
    if signals:
        lines[-1] += "、".join(signals) + "。"
    else:
        lines[-1] += "行业政策变化、技术趋势演进。"

    lines.append("")
    lines.append("3. **推荐的深度阅读：** ")
    if articles:
        top = articles[0]
        link = top.get("link", "")
        title = top.get("title", "")
        if link:
            lines[-1] += f"[{title}]({link})"
        else:
            lines[-1] += title
    lines.append("")

    return "\n".join(lines)


def generate_report(data):
    """根据原始数据生成完整的日报 markdown"""
    date_str = data.get("date", datetime.now().strftime("%Y-%m-%d"))
    articles = data.get("articles", [])

    if not articles:
        print("[WARN] 没有文章数据，生成空报告")

    # 按分类分组
    grouped = group_by_category(articles)

    # 构建报告各部分
    sections = []

    # 报告头部
    sections.append(f"# 前沿信号 · 每日情报速报")
    sections.append(f"")
    sections.append(f"**日期：** {date_str}  ")
    sections.append(f"**覆盖：** AI/大模型、创业融资、跨境电商、宏观趋势  ")
    sections.append(f"**阅读时间：** 3分钟")
    sections.append(f"")
    sections.append(f"---")
    sections.append(f"")

    # TOP 3
    if articles:
        sections.append(generate_top3_section(articles))
        sections.append("---")
        sections.append("")

    # 各分类详情
    for category in CATEGORY_ORDER:
        cat_articles = grouped.get(category, [])
        sections.append(generate_category_section(category, cat_articles))
        sections.append("---")
        sections.append("")

    # 行动建议
    sections.append(generate_action_section(articles))

    # 报告尾部
    sections.append("---")
    sections.append("")
    sections.append(f"*本期由前沿信号 AI+人工团队出品 | 数据采集时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}*")

    return "\n".join(sections)


def save_report(content, date_str):
    """保存报告到文件"""
    output_path = REPORTS_DIR / f"daily_{date_str}.md"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[SAVE] 日报已保存: {output_path}")
    return output_path


def main():
    print("=" * 60)
    print("前沿信号 - 日报生成器 v1.0")
    print(f"运行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 支持命令行参数指定日期
    date_str = None
    if len(sys.argv) > 1:
        date_str = sys.argv[1]

    # 加载数据
    data = load_raw_data(date_str)
    if data is None:
        sys.exit(1)

    actual_date = data.get("date", date_str or datetime.now().strftime("%Y-%m-%d"))

    # 生成报告
    report_content = generate_report(data)

    # 保存报告
    output_path = save_report(report_content, actual_date)

    # 统计信息
    articles = data.get("articles", [])
    grouped = group_by_category(articles)
    print("\n[统计]")
    for cat in CATEGORY_ORDER:
        count = len(grouped.get(cat, []))
        display_name = CATEGORY_DISPLAY.get(cat, (cat,))[0]
        print(f"  {display_name}: {count} 条")
    print(f"\n[完成] 日报生成完毕，共 {len(articles)} 条")


if __name__ == "__main__":
    main()
