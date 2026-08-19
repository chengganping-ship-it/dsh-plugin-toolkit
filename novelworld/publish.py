#!/usr/bin/env python3
# NovelWorld OS — 出版管线 (Publishing Pipeline)
# 为网文投稿平台生成标准格式稿件

import json
import re
import sys
from datetime import datetime
from pathlib import Path

# 同目录导入
from novelworld import (
    DATA, CHAPTERS, MEMORY, EXPORTS,
    read_json, write_json, read_text, write_text, ensure_dirs,
)


# ---------------------------------------------------------------------------
# 配置: 目标投稿平台规格
# ---------------------------------------------------------------------------

PLATFORM_SPECS = {
    "fanqie": {
        "name": "番茄小说",
        "chapter_header": "title",        # 每章用标题
        "paragraph_indent": True,         # 段首缩进2字符
        "summary_required": True,         # 需要大纲/设定集
        "min_chapters": 10,               # 最低投稿章节数
        "min_words_per_chapter": 2000,    # 每章最低字数
        "max_words_per_chapter": 5000,    # 每章最高字数
        "forbidden_patterns": [           # 平台敏感 (仅格式检查)
            "政治敏感", "色情", "暴力血腥描写过度",
        ],
        "output_encoding": "utf-8",
    },
    "qimao": {
        "name": "七猫小说",
        "chapter_header": "title",
        "paragraph_indent": True,
        "summary_required": True,
        "min_chapters": 10,
        "min_words_per_chapter": 1500,
        "max_words_per_chapter": 4000,
        "forbidden_patterns": [],
        "output_encoding": "utf-8",
    },
    "generic": {
        "name": "通用格式",
        "chapter_header": "title",
        "paragraph_indent": False,
        "summary_required": False,
        "min_chapters": 1,
        "min_words_per_chapter": 0,
        "max_words_per_chapter": 0,
        "forbidden_patterns": [],
        "output_encoding": "utf-8",
    },
}


# ---------------------------------------------------------------------------
# 文本处理工具
# ---------------------------------------------------------------------------

def estimate_chinese_chars(text: str) -> int:
    """估算中文字符数 (含标点，不含空白)."""
    return len(re.sub(r"\s", "", text))


def indent_paragraphs(text: str, indent: str = "　　") -> str:
    """为每段添加中文全角缩进."""
    lines = text.split("\n")
    result = []
    for line in lines:
        stripped = line.strip()
        if stripped and not stripped.startswith(indent):
            result.append(indent + stripped)
        else:
            result.append(line)
    return "\n".join(result)


def clean_prose(text: str) -> str:
    """清理段落格式: 去除多余空行、统一标点."""
    # 去除段首多余空格
    text = re.sub(r"^[\t ]+", "", text, flags=re.MULTILINE)
    # 合并3+空行为1空行
    text = re.sub(r"\n{3,}", "\n\n", text)
    # 确保中文标点不与英文空格混用 (段首缩进除外)
    text = re.sub(r"(?<!　) (?![\u3000-\u303f])", "", text)
    return text.strip()


# ---------------------------------------------------------------------------
# 投稿包生成
# ---------------------------------------------------------------------------

def generate_synopsis(novel: dict, word_count: int, chapter_count: int) -> str:
    """生成投稿简介 (Synopsis)."""
    title = novel.get("title", "未命名")
    genre = novel.get("genre", "其他")
    setting = novel.get("setting", "")
    protagonist = novel.get("protagonist", "")
    hook = novel.get("hook", "")
    themes = novel.get("themes", [])

    lines = [
        f"书名：{title}",
        f"类型：{genre}",
        f"字数：{word_count:,}字",
        f"章节：{chapter_count}章",
        "",
    ]

    if setting:
        lines.append(f"【世界观】{setting}")
        lines.append("")
    if protagonist:
        lines.append(f"【主角设定】{protagonist}")
        lines.append("")
    if hook:
        lines.append(f"【核心卖点】{hook}")
        lines.append("")

    lines.extend([
        "【故事简介】",
        f"这是一部{genre}题材的小说。" if not hook else hook,
        "",
    ])

    if themes:
        lines.append("【核心看点】")
        for t in themes:
            lines.append(f"- {t}")
        lines.append("")

    lines.extend([
        "【人物设定】",
        protagonist or "（详见正文）",
    ])

    return "\n".join(lines)


def generate_character_profiles() -> str:
    """从记忆文件中提取人物设定."""
    characters = read_json(MEMORY / "character_updates.json", [])
    if not characters:
        return "（暂无详细人物设定）"

    lines = ["# 人物设定集", ""]
    seen = set()
    for char in characters:
        name = char.get("name", "")
        if not name or name in seen:
            continue
        seen.add(name)

        desc = char.get("description", char.get("role", ""))
        background = char.get("background", "")
        ability = char.get("ability", char.get("power", ""))
        personality = char.get("personality", "")

        lines.append(f"## {name}")
        if desc:
            lines.append(f"定位：{desc}")
        if background:
            lines.append(f"背景：{background}")
        if ability:
            lines.append(f"能力：{ability}")
        if personality:
            lines.append(f"性格：{personality}")
        lines.append("")

    return "\n".join(lines)


def generate_foreshadowing_doc() -> str:
    """生成伏笔/悬念清单."""
    foreshadowing = read_json(MEMORY / "foreshadowing.json", [])
    expectations = read_json(MEMORY / "reader_expectations.json", [])

    lines = ["# 伏笔与悬念", ""]
    if foreshadowing:
        lines.append("## 已埋设伏笔")
        for f in foreshadowing:
            if isinstance(f, dict):
                lines.append(f"- {f.get('content', f.get('description', str(f)))}")
            else:
                lines.append(f"- {f}")
        lines.append("")

    if expectations:
        lines.append("## 读者期待")
        for e in expectations:
            if isinstance(e, dict):
                lines.append(f"- {e.get('content', e.get('description', str(e)))}")
            else:
                lines.append(f"- {e}")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# 平台格式导出
# ---------------------------------------------------------------------------

def export_for_platform(platform: str = "generic") -> Path:
    """导出为指定平台格式的完整投稿包."""
    spec = PLATFORM_SPECS.get(platform, PLATFORM_SPECS["generic"])

    novel = read_json(DATA / "novel.json", {})
    if not novel:
        raise SystemExit("项目未初始化")

    title = novel.get("title", "未命名")

    # 收集章节
    chapter_files = sorted(
        CHAPTERS.glob("chapter_*.md"),
        key=lambda p: int(re.search(r"chapter_(\d+)", p.stem).group(1))
    )
    if not chapter_files:
        raise SystemExit("没有可导出的章节")

    # 章节内容
    chapters = []
    total_chars = 0
    for f in chapter_files:
        content = read_text(f, "")
        chapters.append(content)
        total_chars += estimate_chinese_chars(content)

    # 创建投稿包目录
    safe_title = re.sub(r'[\\/:*?"<>|]', "_", title)
    timestamp = datetime.now().strftime("%Y%m%d")
    publish_dir = EXPORTS / f"{safe_title}_{platform}_{timestamp}"
    publish_dir.mkdir(parents=True, exist_ok=True)

    # 1. 完整正文 (平台格式)
    formatted_chapters = []
    for i, content in enumerate(chapters, start=1):
        cleaned = clean_prose(content)
        if spec["paragraph_indent"]:
            cleaned = indent_paragraphs(cleaned)

        chapter_title = f"第{i}章"
        # 尝试从内容中提取章节标题
        first_line = content.strip().split("\n")[0] if content.strip() else ""
        if first_line.startswith("#"):
            chapter_title = first_line.lstrip("#").strip() or chapter_title

        formatted_chapters.append(f"{chapter_title}\n\n{cleaned}")

    body_text = "\n\n".join(formatted_chapters)

    # 写入完整稿
    body_path = publish_dir / f"正文_{safe_title}.txt"
    body_path.write_text(body_text, encoding=spec["output_encoding"])

    # 2. 分章文件 (便于逐章上传)
    chapters_dir = publish_dir / "分章"
    chapters_dir.mkdir(exist_ok=True)
    for i, content in enumerate(chapters, start=1):
        cleaned = clean_prose(content)
        if spec["paragraph_indent"]:
            cleaned = indent_paragraphs(cleaned)
        (chapters_dir / f"第{i}章.txt").write_text(
            cleaned, encoding=spec["output_encoding"]
        )

    # 3. 投稿简介
    synopsis = generate_synopsis(novel, total_chars, len(chapters))
    (publish_dir / f"投稿简介_{safe_title}.txt").write_text(
        synopsis, encoding="utf-8"
    )

    # 4. 人物设定
    characters = generate_character_profiles()
    (publish_dir / f"人物设定_{safe_title}.txt").write_text(
        characters, encoding="utf-8"
    )

    # 5. 伏笔/悬念清单 (如存在)
    foreshadowing_doc = generate_foreshadowing_doc()
    if "暂无" not in foreshadowing_doc:
        (publish_dir / f"伏笔清单_{safe_title}.txt").write_text(
            foreshadowing_doc, encoding="utf-8"
        )

    # 6. 投稿元数据 (供第三方工具/自己参考)
    meta = {
        "title": title,
        "genre": novel.get("genre", ""),
        "platform": platform,
        "platform_name": spec["name"],
        "chapter_count": len(chapters),
        "total_chars": total_chars,
        "avg_chars_per_chapter": total_chars // max(len(chapters), 1),
        "export_timestamp": datetime.now().isoformat(timespec="seconds"),
        "chapters": [
            {
                "index": i + 1,
                "chars": estimate_chinese_chars(content),
                "word_count_readable": f"{estimate_chinese_chars(content):,}",
            }
            for i, content in enumerate(chapters)
        ],
        "files": {
            "body": f"正文_{safe_title}.txt",
            "synopsis": f"投稿简介_{safe_title}.txt",
            "characters": f"人物设定_{safe_title}.txt",
            "chapters_dir": "分章/",
        },
    }
    write_json(publish_dir / "metadata.json", meta)

    # 7. 投稿检查清单
    checklist = generate_checklist(meta, spec)
    (publish_dir / "投稿检查清单.txt").write_text(checklist, encoding="utf-8")

    return publish_dir


def generate_checklist(meta: dict, spec: dict) -> str:
    """生成投稿前检查清单."""
    lines = [
        f"=== 投稿检查清单 ({spec['name']}) ===",
        f"书名：{meta['title']}",
        f"日期：{meta['export_timestamp']}",
        "",
        "【基本要求】",
    ]

    checks = []

    # 章节数
    chapter_ok = meta["chapter_count"] >= spec["min_chapters"]
    checks.append(
        f"{'✅' if chapter_ok else '❌'} 章节数: {meta['chapter_count']}"
        f" (要求 ≥ {spec['min_chapters']})"
    )

    # 每章字数
    for ch in meta["chapters"]:
        wc = ch["chars"]
        min_w = spec["min_words_per_chapter"]
        max_w = spec["max_words_per_chapter"]
        if min_w > 0:
            if wc < min_w:
                checks.append(f"❌ 第{ch['index']}章: {wc}字 (不足 {min_w})")
            elif max_w > 0 and wc > max_w:
                checks.append(f"⚠️ 第{ch['index']}章: {wc}字 (超出 {max_w})")
            else:
                checks.append(f"✅ 第{ch['index']}章: {wc}字")

    lines.extend(checks)
    lines.extend([
        "",
        "【投稿前确认】",
        "□ 已检查所有章节无明显AI痕迹",
        "□ 简介已针对目标平台优化",
        "□ 人物设定无侵权风险",
        "□ 已通过平台敏感词检测",
        "□ 备份原始工程文件",
        "",
        "【平台须知】",
        f"- {spec['name']}投稿入口: 作家后台",
        "- 建议先投10章+1万字的量级签约",
        "- 保持每日4000字以上更新频率",
    ])

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI 入口
# ---------------------------------------------------------------------------

def main():
    import argparse

    parser = argparse.ArgumentParser(prog="nw-publish", description="NovelWorld 出版管线")
    parser.add_argument(
        "--platform",
        choices=list(PLATFORM_SPECS.keys()),
        default="generic",
        help="目标投稿平台 (默认: generic)",
    )
    parser.add_argument(
        "--list-platforms",
        action="store_true",
        help="列出所有支持的投稿平台",
    )

    args = parser.parse_args()

    if args.list_platforms:
        print("支持的投稿平台：")
        for key, spec in PLATFORM_SPECS.items():
            print(f"  {key:12s} → {spec['name']}")
        return

    ensure_dirs()

    print(f"正在生成 {args.platform} 格式投稿包...")
    try:
        path = export_for_platform(args.platform)
        print(f"投稿包已生成：{path}")
        print()
        print("文件清单：")
        for f in sorted(path.iterdir()):
            if f.is_file():
                print(f"  📄 {f.name}")
            elif f.is_dir():
                count = len(list(f.iterdir()))
                print(f"  📁 {f.name}/ ({count} 个文件)")
    except SystemExit as e:
        print(f"错误：{e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"失败：{e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
