#!/usr/bin/env python3
"""
持久化记忆系统 — 跨会话记忆什么是有效的
=====================================
核心洞察（来自 Autonomous Research Agents 综述）：
真正的闭环不是"跑指标后机械重复"，而是"假设被验证后更新策略"。

这个模块就是系统的"大脑记忆"，记录：
- 哪些策略有效/无效（hypothesis testing results）
- 内容表现历史（what works）
- 策略进化路径（how we got here）
- 待验证的假设（what to try next）
"""

import json
import sqlite3
import time
from datetime import datetime
from pathlib import Path


MEMORY_DB = Path(__file__).parent / "data" / "memory.db"


class MemoryStore:
    """持久化记忆系统 — 跨会话记住什么是有效的"""

    def __init__(self, db_path=MEMORY_DB):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(str(self.db_path))
        self.conn.row_factory = sqlite3.Row
        self._init_db()

    def _init_db(self):
        """初始化记忆数据库"""
        cursor = self.conn.cursor()

        # 假设记录 — 我们猜测什么是有效的
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS hypotheses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                hypothesis TEXT NOT NULL,      -- 假设内容
                category TEXT,                  -- 类别: content/timing/voice/title/cover/platform
                status TEXT DEFAULT 'pending',  -- pending/testing/validated/invalidated
                test_method TEXT,               -- 如何测试
                result TEXT,                   -- 测试结果
                confidence REAL DEFAULT 0.5,   -- 置信度 0-1
                evidence TEXT,                  -- 证据
                parent_id INTEGER,             -- 父假设（进化来源）
                priority INTEGER DEFAULT 5     -- 优先级 1-10
            )
        """)

        # 内容表现历史
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS content_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                recorded_at TEXT DEFAULT (datetime('now', 'localtime')),
                content_title TEXT,
                content_source TEXT,
                voice TEXT,
                publish_time TEXT,
                platform TEXT,
                plays INTEGER DEFAULT 0,
                completion_rate REAL DEFAULT 0,
                likes INTEGER DEFAULT 0,
                comments INTEGER DEFAULT 0,
                revenue REAL DEFAULT 0,
                title_variant TEXT,            -- 标题变体（A/B测试）
                cover_variant TEXT,            -- 封面变体
                tags TEXT,                     -- JSON
                metadata TEXT                  -- JSON 额外信息
            )
        """)

        # 策略快照 — 在某个时间点我们用的是什么策略
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS strategy_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                strategy_json TEXT NOT NULL,
                reason TEXT,                   -- 为什么采用这个策略
                based_on_hypothesis INTEGER,   -- 基于哪个假设
                performance_score REAL,        -- 效果评分
                active INTEGER DEFAULT 1       -- 是否当前激活
            )
        """)

        # 进化日志 — 策略如何随时间变化
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS evolution_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                change_type TEXT,              -- what changed
                old_value TEXT,
                new_value TEXT,
                reason TEXT,                   -- 为什么这样改
                expected_improvement TEXT,     -- 预期改善
                actual_improvement TEXT        -- 实际改善
            )
        """)

        # 行动日志 — 系统做了什么
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS action_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                action TEXT NOT NULL,
                params TEXT,
                result TEXT,
                automated INTEGER DEFAULT 1    -- 自动化执行的
            )
        """)

        # To-do 列表 — 待完成的任务
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS todo_list (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT DEFAULT (datetime('now', 'localtime')),
                task TEXT NOT NULL,
                category TEXT,
                priority INTEGER DEFAULT 5,
                status TEXT DEFAULT 'pending',
                due_date TEXT,
                completed_at TEXT,
                result TEXT
            )
        """)

        self.conn.commit()

    # === 假设管理 ===

    def add_hypothesis(self, hypothesis, category="content", test_method="",
                       priority=5, parent_id=None):
        """添加待验证的假设"""
        self.conn.execute("""
            INSERT INTO hypotheses (hypothesis, category, test_method, priority, parent_id)
            VALUES (?, ?, ?, ?, ?)
        """, (hypothesis, category, test_method, priority, parent_id))
        self.conn.commit()
        return self.conn.execute("SELECT last_insert_rowid()").fetchone()[0]

    def test_hypothesis(self, hyp_id, result, evidence, confidence):
        """记录假设测试结果"""
        status = "validated" if confidence > 0.7 else "invalidated"
        self.conn.execute("""
            UPDATE hypotheses SET status=?, result=?, evidence=?, confidence=?
            WHERE id=?
        """, (status, result, evidence, confidence, hyp_id))
        self.conn.commit()

    def get_pending_hypotheses(self, category=None, limit=10):
        """获取待测试的假设"""
        if category:
            rows = self.conn.execute("""
                SELECT * FROM hypotheses WHERE status='pending' AND category=?
                ORDER BY priority ASC, created_at ASC LIMIT ?
            """, (category, limit)).fetchall()
        else:
            rows = self.conn.execute("""
                SELECT * FROM hypotheses WHERE status='pending'
                ORDER BY priority ASC, created_at ASC LIMIT ?
            """, (limit,)).fetchall()
        return [dict(r) for r in rows]

    def get_validated_hypotheses(self, category=None):
        """获取已验证的假设（我们知道什么是有效的）"""
        if category:
            rows = self.conn.execute("""
                SELECT * FROM hypotheses WHERE status='validated' AND category=?
                ORDER BY confidence DESC
            """, (category,)).fetchall()
        else:
            rows = self.conn.execute("""
                SELECT * FROM hypotheses WHERE status='validated'
                ORDER BY confidence DESC
            """).fetchall()
        return [dict(r) for r in rows]

    # === 内容表现记录 ===

    def record_performance(self, **kwargs):
        """记录内容表现数据"""
        columns = ", ".join(kwargs.keys())
        placeholders = ", ".join(["?"] * len(kwargs))
        self.conn.execute(f"""
            INSERT INTO content_performance ({columns}) VALUES ({placeholders})
        """, list(kwargs.values()))
        self.conn.commit()

    def get_best_performing(self, metric="plays", limit=5):
        """获取表现最好的内容"""
        rows = self.conn.execute(f"""
            SELECT * FROM content_performance
            ORDER BY {metric} DESC LIMIT ?
        """, (limit,)).fetchall()
        return [dict(r) for r in rows]

    def get_platform_comparison(self):
        """对比各平台表现"""
        rows = self.conn.execute("""
            SELECT platform,
                   SUM(plays) as total_plays,
                   AVG(completion_rate) as avg_completion,
                   SUM(revenue) as total_revenue,
                    COUNT(*) as content_count
            FROM content_performance
            GROUP BY platform
            ORDER BY total_plays DESC
        """).fetchall()
        return [dict(r) for r in rows]

    # === 策略管理 ===

    def save_strategy(self, strategy, reason="", based_on=None):
        """保存当前策略快照"""
        # 先停用旧策略
        self.conn.execute("UPDATE strategy_snapshots SET active=0 WHERE active=1")
        self.conn.execute("""
            INSERT INTO strategy_snapshots (strategy_json, reason, based_on_hypothesis, active)
            VALUES (?, ?, ?, 1)
        """, (json.dumps(strategy, ensure_ascii=False), reason, based_on))
        self.conn.commit()

    def get_current_strategy(self):
        """获取当前激活的策略"""
        row = self.conn.execute("""
            SELECT * FROM strategy_snapshots WHERE active=1
            ORDER BY created_at DESC LIMIT 1
        """).fetchone()
        if row:
            s = dict(row)
            s["strategy"] = json.loads(s["strategy_json"])
            return s
        return None

    def get_strategy_history(self):
        """获取策略进化历史"""
        rows = self.conn.execute("""
            SELECT * FROM strategy_snapshots ORDER BY created_at DESC LIMIT 20
        """).fetchall()
        return [dict(r) for r in rows]

    # === 进化日志 ===

    def log_evolution(self, change_type, old_val, new_val, reason, expected=""):
        """记录策略进化"""
        self.conn.execute("""
            INSERT INTO evolution_log (change_type, old_value, new_value, reason, expected_improvement)
            VALUES (?, ?, ?, ?, ?)
        """, (change_type, str(old_val), str(new_val), reason, expected))
        self.conn.commit()

    def get_evolution_path(self):
        """获取进化路径"""
        rows = self.conn.execute("""
            SELECT * FROM evolution_log ORDER BY created_at DESC LIMIT 50
        """).fetchall()
        return [dict(r) for r in rows]

    # === 行动日志 ===

    def log_action(self, action, params="", result="", automated=1):
        """记录系统行动"""
        self.conn.execute("""
            INSERT INTO action_log (action, params, result, automated)
            VALUES (?, ?, ?, ?)
        """, (action, str(params), str(result), automated))
        self.conn.commit()

    def get_recent_actions(self, limit=20):
        """获取最近的行动"""
        rows = self.conn.execute("""
            SELECT * FROM action_log ORDER BY created_at DESC LIMIT ?
        """, (limit,)).fetchall()
        return [dict(r) for r in rows]

    # === To-Do 管理 ===

    def add_todo(self, task, category="general", priority=5, due_date=None):
        """添加待办事项"""
        self.conn.execute("""
            INSERT INTO todo_list (task, category, priority, due_date)
            VALUES (?, ?, ?, ?)
        """, (task, category, priority, due_date))
        self.conn.commit()

    def get_pending_todos(self):
        """获取待办事项"""
        rows = self.conn.execute("""
            SELECT * FROM todo_list WHERE status='pending'
            ORDER BY priority ASC, created_at ASC
        """).fetchall()
        return [dict(r) for r in rows]

    def complete_todo(self, todo_id, result=""):
        """完成任务"""
        self.conn.execute("""
            UPDATE todo_list SET status='completed', completed_at=datetime('now', 'localtime'), result=?
            WHERE id=?
        """, (result, todo_id))
        self.conn.commit()

    # === 综合报告 ===

    def get_memory_summary(self):
        """获取记忆摘要 — 系统现在知道什么"""
        total_hyp = self.conn.execute("SELECT COUNT(*) FROM hypotheses").fetchone()[0]
        validated = self.conn.execute("SELECT COUNT(*) FROM hypotheses WHERE status='validated'").fetchone()[0]
        pending = self.conn.execute("SELECT COUNT(*) FROM hypotheses WHERE status='pending'").fetchone()[0]
        total_content = self.conn.execute("SELECT COUNT(*) FROM content_performance").fetchone()[0]
        total_plays = self.conn.execute("SELECT COALESCE(SUM(plays), 0) FROM content_performance").fetchone()[0]
        total_revenue = self.conn.execute("SELECT COALESCE(SUM(revenue), 0) FROM content_performance").fetchone()[0]
        evo_count = self.conn.execute("SELECT COUNT(*) FROM evolution_log").fetchone()[0]
        pending_todos = self.conn.execute("SELECT COUNT(*) FROM todo_list WHERE status='pending'").fetchone()[0]

        return {
            "hypotheses_total": total_hyp,
            "hypotheses_validated": validated,
            "hypotheses_pending": pending,
            "content_produced": total_content,
            "total_plays": total_plays,
            "total_revenue": total_revenue,
            "evolution_steps": evo_count,
            "pending_todos": pending_todos,
            "current_strategy": self.get_current_strategy(),
        }

    def close(self):
        self.conn.close()

    def __del__(self):
        try:
            self.conn.close()
        except Exception:
            pass


def seed_initial_hypotheses(memory):
    """种下初始假设 — 基于市场研究的先验知识"""
    initial = [
        # 内容方向假设
        ("克苏鲁题材在喜马拉雅的受众大于正统文学", "content",
         "对比克苏鲁内容 vs 正统文学的播放量和完播率", 9),
        ("中式克苏鲁（克苏鲁+中国民间怪谈）比纯翻译作品更受欢迎", "content",
         "制作两种内容，对比同一指标", 8),
        ("短篇故事（10-15分钟）比长篇连载有更高的完播率", "content",
         "对比不同长度内容的完播率", 7),
        ("洛夫克拉夫特全部60篇可以支撑长期内容输出", "content",
         "验证内容库是否足够", 6),

        # 发布策略假设
        ("22:00-24:00发布比白天发布播放量更高", "timing",
         "同一内容在不同时段发布，对比首6小时播放量", 8),
        ("固定每日更新比随机更新涨粉更快", "timing",
         "对比两种更新频率的订阅增长", 7),

        # 声音假设
        ("云扬男声比晓晓女声更适合恐怖题材", "voice",
         "同一内容用不同音色，对比完播率和评论", 9),
        ("语速-5%比正常语速更适合克苏鲁内容", "voice",
         "同一内容不同语速，对比完播率", 6),

        # 标题假设
         ("标题中包含'克苏鲁'关键词能带来更多搜索流量", "title",
         "对比含关键词 vs 不含关键词的搜索播放量", 8),
        ("悬念式标题比描述式标题点击率高", "title",
         "A/B测试两种标题风格", 7),

        # 平台假设
        ("喜马拉雅是克苏鲁内容最适合的首发平台", "platform",
         "同一内容多平台发布，对比各平台数据", 7),
    ]

    for hyp, cat, method, prio in initial:
        memory.add_hypothesis(hyp, cat, method, prio)

    # 初始策略
    initial_strategy = {
        "content_type": "lovecraft_public_domain",
        "voice": "zh-CN-YunyangNeural",
        "rate": "-5%",
        "publish_time": "22:30",
        "platforms": ["ximalaya"],
        "update_frequency": "daily",
        "title_template": "【克苏鲁神话】{title}丨洛夫克拉夫特经典",
        "tags": ["克苏鲁", "洛夫克拉夫特", "宇宙恐怖", "怪谈"],
        "content_length_target": "10-15min",
        "ab_test_enabled": True,
    }
    memory.save_strategy(initial_strategy, reason="初始策略：基于市场研究的先验最佳猜测")


if __name__ == "__main__":
    mem = MemoryStore()
    # 只在空数据库时种入初始假设
    summary = mem.get_memory_summary()
    if summary["hypotheses_total"] == 0:
        seed_initial_hypotheses(mem)
        print("✅ 已种入初始假设和策略")
    else:
        print(f"📊 数据库已有 {summary['hypotheses_total']} 个假设")
    print(json.dumps(mem.get_memory_summary(), ensure_ascii=False, indent=2))
