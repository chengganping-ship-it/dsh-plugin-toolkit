#!/usr/bin/env python3
# NovelWorld OS v0.1
# 世界模型驱动的长篇网文创作引擎 MVP

import argparse
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("缺少依赖 requests，请先执行: pip install requests")


BASE = Path.cwd()
DATA = BASE / "data"
OUTLINES = DATA / "outlines"
CHAPTERS = DATA / "chapters"
REVIEWS = DATA / "reviews"
MEMORY = DATA / "memory"
EXPORTS = DATA / "exports"

DIRS = [
    DATA,
    OUTLINES,
    CHAPTERS,
    REVIEWS,
    MEMORY,
    EXPORTS,
]


def load_env():
    env_path = BASE / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


load_env()


def ensure_dirs():
    for d in DIRS:
        Path(d).mkdir(parents=True, exist_ok=True)


def read_json(path, default=None):
    path = Path(path)
    if not path.exists():
        return default

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def write_json(path, obj):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(obj, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )


def read_text(path, default=""):
    path = Path(path)
    if not path.exists():
        return default
    return path.read_text(encoding="utf-8")


def write_text(path, text):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def chat(messages, temperature=0.8, max_tokens=4000):
    base_url = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
    api_key = os.getenv("LLM_API_KEY", "")
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    timeout = int(os.getenv("LLM_TIMEOUT", "180"))

    headers = {
        "Content-Type": "application/json"
    }

    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }

    url = f"{base_url}/chat/completions"

    try:
        resp = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=timeout
        )
    except Exception as e:
        raise RuntimeError(f"LLM 请求失败：{e}")

    if resp.status_code != 200:
        raise RuntimeError(
            f"LLM API 错误 {resp.status_code}: {resp.text[:1000]}"
        )

    data = resp.json()
    return data["choices"][0]["message"]["content"]


DEFAULT_WORLD = {
    "settings": {
        "世界类型": "待补充",
        "力量体系": "待补充",
        "主要势力": [],
        "主要地点": []
    },
    "characters": [
        {
            "name": "主角",
            "role": "主角",
            "realm": "待补充",
            "location": "待补充",
            "desire": "待补充",
            "fear": "待补充",
            "personality": [],
            "items": [],
            "skills": []
        }
    ],
    "rules": [
        "力量体系必须前后一致",
        "已死亡角色不能无理由复活",
        "物品不能凭空出现或消失",
        "时间线必须连续",
        "角色行为必须符合动机"
    ]
}


def init_project(title, genre):
    ensure_dirs()

    novel_path = DATA / "novel.json"
    world_path = DATA / "world.json"

    if novel_path.exists():
        print("项目已存在。如需重建，请先删除 data 目录。")
        return

    novel = {
        "title": title,
        "genre": genre,
        "style": [
            "快节奏",
            "强冲突",
            "网文爽感"
        ],
        "target_reader": "男频",
        "main_hook": "待补充",
        "main_conflict": "待补充",
        "created_at": datetime.now().isoformat()
    }

    write_json(novel_path, novel)
    write_json(world_path, DEFAULT_WORLD)

    write_json(MEMORY / "summaries.json", [])
    write_json(MEMORY / "events.json", [])
    write_json(MEMORY / "foreshadowing.json", [])
    write_json(MEMORY / "reader_expectations.json", [])
    write_json(MEMORY / "character_updates.json", [])

    print("项目初始化完成。")
    print("请编辑：")
    print("  data/novel.json")
    print("  data/world.json")


def load_context():
    novel = read_json(DATA / "novel.json", {})
    world = read_json(DATA / "world.json", {})
    summaries = read_json(MEMORY / "summaries.json", [])[-5:]
    events = read_json(MEMORY / "events.json", [])[-10:]
    foreshadowing = read_json(MEMORY / "foreshadowing.json", [])[-20:]
    expectations = read_json(MEMORY / "reader_expectations.json", [])[-20:]
    character_updates = read_json(MEMORY / "character_updates.json", [])[-20:]

    return {
        "novel": novel,
        "world": world,
        "recent_summaries": summaries,
        "recent_events": events,
        "foreshadowing": foreshadowing,
        "reader_expectations": expectations,
        "character_updates": character_updates
    }


def extract_json(text):
    text = text.strip()

    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.S)
    if fence:
        text = fence.group(1)

    for start, end in [("{", "}"), ("[", "]")]:
        s = text.find(start)
        e = text.rfind(end)

        if s != -1 and e != -1:
            candidate = text[s:e + 1]
            try:
                return json.loads(candidate)
            except Exception:
                pass

    try:
        return json.loads(text)
    except Exception:
        raise ValueError(f"无法解析 JSON：\n{text[:1000]}")


def safe_extract_json(text, fallback):
    try:
        return extract_json(text)
    except Exception:
        fallback["raw"] = text
        return fallback


def plan_chapter(chapter):
    context = load_context()

    system = """
你是顶级网文总编。
你的任务是根据小说当前状态规划一章内容。
你必须输出严格 JSON，不要输出解释。
JSON 格式如下：
{
  "title": "章节标题",
  "goal": "本章目标",
  "conflict": "核心冲突",
  "payoff": "本章爽点",
  "hook": "章末钩子",
  "scenes": [
    {
      "goal": "场景目标",
      "conflict": "场景冲突",
      "turn": "场景转折",
      "emotion": "情绪变化"
    }
  ]
}
""".strip()

    user = f"""
请规划第 {chapter} 章。

当前小说状态如下：
{json.dumps(context, ensure_ascii=False, indent=2)}

要求：
1. 必须承接已有剧情。
2. 必须有明确冲突。
3. 必须有爽点或悬念。
4. 章末必须有钩子。
5. scenes 至少 2 个，最多 4 个。
6. 只输出 JSON。
""".strip()

    result = chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.6,
        max_tokens=3000
    )

    try:
        outline = extract_json(result)
    except Exception:
        raw_path = OUTLINES / f"chapter_{chapter:03d}.raw.txt"
        write_text(raw_path, result)
        raise SystemExit(f"模型未返回有效 JSON，原始内容已保存到：{raw_path}")

    path = OUTLINES / f"chapter_{chapter:03d}.json"
    write_json(path, outline)

    print(f"第 {chapter} 章大纲已生成：{path}")


def write_chapter(chapter):
    outline_path = OUTLINES / f"chapter_{chapter:03d}.json"
    outline = read_json(outline_path, None)

    if not outline:
        raise SystemExit("没有章节大纲，请先执行 plan。")

    context = load_context()
    scenes = outline.get("scenes", [])

    if not scenes:
        scenes = [
            {
                "goal": outline.get("goal", ""),
                "conflict": outline.get("conflict", ""),
                "turn": "待补充",
                "emotion": "待补充"
            }
        ]

    parts = []

    for idx, scene in enumerate(scenes, 1):
        system = """
你是顶级网文写手。
你需要根据大纲和场景卡写出正文。
要求：
1. 语言自然，避免 AI 腔。
2. 多使用动作、对话、冲突推进。
3. 不要总结式旁白。
4. 保持人物性格一致。
5. 不要违反世界规则。
6. 每个场景至少 800 字。
""".strip()

        user = f"""
请写第 {chapter} 章的第 {idx} 个场景。

小说信息：
{json.dumps(context['novel'], ensure_ascii=False, indent=2)}

世界状态：
{json.dumps(context['world'], ensure_ascii=False, indent=2)}

最近摘要：
{json.dumps(context['recent_summaries'], ensure_ascii=False, indent=2)}

最近事件：
{json.dumps(context['recent_events'], ensure_ascii=False, indent=2)}

本章大纲：
{json.dumps(outline, ensure_ascii=False, indent=2)}

当前场景：
{json.dumps(scene, ensure_ascii=False, indent=2)}

请直接输出正文，不要输出解释。
""".strip()

        text = chat(
            [
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            temperature=0.9,
            max_tokens=3000
        )

        parts.append(text.strip())

    content = "\n\n".join(parts)

    # 钩子增强
    try:
        hook_system = """
你是网文断章钩子专家。
请根据章节内容写一个更强的章末钩子。
要求：
1. 只输出钩子段落。
2. 不要解释。
3. 必须制造强烈追读欲。
4. 可以是危机、悬念、反转、秘密暴露或强敌登场。
""".strip()

        hook_user = f"""
章节结尾内容如下：

{content[-1500:]}

请写一个更强的章末钩子段落。
""".strip()

        hook = chat(
            [
                {"role": "system", "content": hook_system},
                {"role": "user", "content": hook_user}
            ],
            temperature=0.8,
            max_tokens=600
        )

        if hook.strip():
            content += "\n\n" + hook.strip()

    except Exception as e:
        print(f"钩子增强失败，但不影响正文生成：{e}")

    title = outline.get("title", f"第{chapter}章")
    final = f"# 第{chapter}章 {title}\n\n{content}"

    path = CHAPTERS / f"chapter_{chapter:03d}.md"
    write_text(path, final)

    print(f"第 {chapter} 章正文已生成：{path}")


def review_chapter(chapter):
    chapter_path = CHAPTERS / f"chapter_{chapter:03d}.md"
    content = read_text(chapter_path, "")

    if not content:
        raise SystemExit("章节正文不存在，请先执行 write。")

    outline_path = OUTLINES / f"chapter_{chapter:03d}.json"
    outline = read_json(outline_path, {})
    context = load_context()

    system = """
你是网文审校编辑。
你需要检查章节内容是否存在问题。
你必须输出严格 JSON，不要输出解释。
JSON 格式如下：
{
  "consistency_errors": [],
  "style_issues": [],
  "hook_score": 0,
  "pacing_score": 0,
  "satisfaction_score": 0,
  "summary": "本章内容总结",
  "suggestions": []
}
""".strip()

    user = f"""
请审校第 {chapter} 章。

世界设定：
{json.dumps(context['world'], ensure_ascii=False, indent=2)}

最近事件：
{json.dumps(context['recent_events'], ensure_ascii=False, indent=2)}

本章大纲：
{json.dumps(outline, ensure_ascii=False, indent=2)}

本章正文：
{content[:20000]}

请重点检查：
1. 设定是否冲突。
2. 人物行为是否合理。
3. 时间地点是否连续。
4. 爽点是否足够。
5. 章末钩子是否足够。
6. 是否存在 AI 腔。

只输出 JSON。
""".strip()

    result = chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.2,
        max_tokens=3000
    )

    fallback = {
        "consistency_errors": [],
        "style_issues": [],
        "hook_score": 0,
        "pacing_score": 0,
        "satisfaction_score": 0,
        "summary": "",
        "suggestions": []
    }

    review = safe_extract_json(result, fallback)
    path = REVIEWS / f"chapter_{chapter:03d}.json"
    write_json(path, review)

    print(f"第 {chapter} 章审校报告已生成：{path}")


def revise_chapter(chapter):
    chapter_path = CHAPTERS / f"chapter_{chapter:03d}.md"
    content = read_text(chapter_path, "")

    if not content:
        raise SystemExit("章节正文不存在，请先执行 write。")

    review_path = REVIEWS / f"chapter_{chapter:03d}.json"
    review = read_json(review_path, {})

    outline_path = OUTLINES / f"chapter_{chapter:03d}.json"
    outline = read_json(outline_path, {})

    system = """
你是网文修订编辑。
请根据审校意见修订章节。
要求：
1. 保留主线和关键事件。
2. 修复设定冲突。
3. 提升节奏。
4. 降低 AI 腔。
5. 加强爽点和钩子。
6. 只输出修订后的完整正文。
""".strip()

    user = f"""
本章大纲：
{json.dumps(outline, ensure_ascii=False, indent=2)}

审校意见：
{json.dumps(review, ensure_ascii=False, indent=2)}

原章节正文：
{content[:20000]}

请输出修订后的完整章节正文。
""".strip()

    result = chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.7,
        max_tokens=5000
    )

    title = outline.get("title", f"第{chapter}章")
    final = f"# 第{chapter}章 {title}\n\n{result.strip()}"

    path = CHAPTERS / f"chapter_{chapter:03d}_revised.md"
    write_text(path, final)

    print(f"第 {chapter} 章修订版已生成：{path}")


def commit_chapter(chapter):
    chapter_path = CHAPTERS / f"chapter_{chapter:03d}.md"
    content = read_text(chapter_path, "")

    if not content:
        raise SystemExit("章节正文不存在，无法提交记忆。")

    outline_path = OUTLINES / f"chapter_{chapter:03d}.json"
    outline = read_json(outline_path, {})

    system = """
你是小说记忆管理 Agent。
你需要从章节中抽取长期记忆。
你必须输出严格 JSON，不要输出解释。
JSON 格式如下：
{
  "summary": "章节摘要",
  "events": [
    {
      "title": "事件标题",
      "cause": "原因",
      "result": "结果"
    }
  ],
  "character_updates": [
    {
      "name": "角色名",
      "update": "状态变化"
    }
  ],
  "new_foreshadowing": [
    {
      "content": "新伏笔",
      "importance": "low/medium/high"
    }
  ],
  "reader_expectations": [
    {
      "content": "读者可能产生的期待",
      "urgency": "low/medium/high"
    }
  ]
}
""".strip()

    user = f"""
请从第 {chapter} 章中抽取记忆。

本章大纲：
{json.dumps(outline, ensure_ascii=False, indent=2)}

本章正文：
{content[:20000]}

只输出 JSON。
""".strip()

    result = chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.1,
        max_tokens=3000
    )

    fallback = {
        "summary": "",
        "events": [],
        "character_updates": [],
        "new_foreshadowing": [],
        "reader_expectations": []
    }

    memory_update = safe_extract_json(result, fallback)

    summaries = read_json(MEMORY / "summaries.json", [])
    events = read_json(MEMORY / "events.json", [])
    foreshadowing = read_json(MEMORY / "foreshadowing.json", [])
    expectations = read_json(MEMORY / "reader_expectations.json", [])
    character_updates = read_json(MEMORY / "character_updates.json", [])

    summaries.append({
        "chapter": chapter,
        "summary": memory_update.get("summary", ""),
        "created_at": datetime.now().isoformat()
    })

    for event in memory_update.get("events", []):
        events.append({
            "chapter": chapter,
            **event
        })

    for f in memory_update.get("new_foreshadowing", []):
        foreshadowing.append({
            "chapter": chapter,
            "status": "pending",
            **f
        })

    for exp in memory_update.get("reader_expectations", []):
        expectations.append({
            "chapter": chapter,
            "status": "pending",
            **exp
        })

    for c in memory_update.get("character_updates", []):
        character_updates.append({
            "chapter": chapter,
            **c
        })

    write_json(MEMORY / "summaries.json", summaries)
    write_json(MEMORY / "events.json", events)
    write_json(MEMORY / "foreshadowing.json", foreshadowing)
    write_json(MEMORY / "reader_expectations.json", expectations)
    write_json(MEMORY / "character_updates.json", character_updates)

    print(f"第 {chapter} 章记忆已提交。")


def export_novel():
    files = sorted(
        CHAPTERS.glob("chapter_*.md"),
        key=lambda p: int(re.search(r"chapter_(\d+)", p.stem).group(1))
    )

    if not files:
        raise SystemExit("没有可导出章节。")

    contents = []
    for f in files:
        contents.append(read_text(f, ""))

    novel = read_json(DATA / "novel.json", {})
    title = novel.get("title", "未命名小说")
    safe_title = re.sub(r'[\\/:*?"<>|]', "_", title)

    header = f"# {title}\n\n"
    final = header + "\n\n".join(contents)

    out = EXPORTS / f"{safe_title}.md"
    write_text(out, final)

    print(f"导出完成：{out}")


def status():
    novel = read_json(DATA / "novel.json", {})

    if not novel:
        print("项目未初始化，请先执行 init。")
        return

    chapters = sorted(CHAPTERS.glob("chapter_*.md"))
    outlines = sorted(OUTLINES.glob("chapter_*.json"))
    reviews = sorted(REVIEWS.glob("chapter_*.json"))
    summaries = read_json(MEMORY / "summaries.json", [])
    events = read_json(MEMORY / "events.json", [])
    foreshadowing = read_json(MEMORY / "foreshadowing.json", [])
    expectations = read_json(MEMORY / "reader_expectations.json", [])

    print("=" * 40)
    print(f"小说：{novel.get('title', '未命名')}")
    print(f"题材：{novel.get('genre', '未填写')}")
    print("=" * 40)
    print(f"大纲数量：{len(outlines)}")
    print(f"正文数量：{len(chapters)}")
    print(f"审校数量：{len(reviews)}")
    print(f"摘要数量：{len(summaries)}")
    print(f"事件数量：{len(events)}")
    print(f"伏笔数量：{len(foreshadowing)}")
    print(f"读者期待数量：{len(expectations)}")
    print("=" * 40)


def main():
    parser = argparse.ArgumentParser(
        prog="novelworld",
        description="NovelWorld OS v0.1"
    )

    sub = parser.add_subparsers(dest="command", required=True)

    p_init = sub.add_parser("init", help="初始化小说项目")
    p_init.add_argument("--title", required=True)
    p_init.add_argument("--genre", required=True)

    p_plan = sub.add_parser("plan", help="生成章节大纲")
    p_plan.add_argument("--chapter", type=int, required=True)

    p_write = sub.add_parser("write", help="生成章节正文")
    p_write.add_argument("--chapter", type=int, required=True)

    p_review = sub.add_parser("review", help="审校章节")
    p_review.add_argument("--chapter", type=int, required=True)

    p_revise = sub.add_parser("revise", help="修订章节")
    p_revise.add_argument("--chapter", type=int, required=True)

    p_commit = sub.add_parser("commit", help="提交章节记忆")
    p_commit.add_argument("--chapter", type=int, required=True)

    sub.add_parser("export", help="导出小说")
    sub.add_parser("status", help="查看项目状态")

    args = parser.parse_args()

    if args.command == "init":
        init_project(args.title, args.genre)

    elif args.command == "plan":
        plan_chapter(args.chapter)

    elif args.command == "write":
        write_chapter(args.chapter)

    elif args.command == "review":
        review_chapter(args.chapter)

    elif args.command == "revise":
        revise_chapter(args.chapter)

    elif args.command == "commit":
        commit_chapter(args.chapter)

    elif args.command == "export":
        export_novel()

    elif args.command == "status":
        status()


if __name__ == "__main__":
    main()
