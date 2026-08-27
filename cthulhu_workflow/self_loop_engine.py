#!/usr/bin/env python3
"""
自循环引擎 — 系统的核心智能
============================
实现"触发→执行→反馈→优化"的闭环，无需人类介入。

设计灵感：
- Autonomous Research Agents 综述：真正的闭环 = 假设被验证后更新策略
- AiToEarn 的内容自动化思路
- 进化论：变异 → 选择 → 遗传

核心流程：
1. 观察现状（读取数据）
2. 发现问题（分析瓶颈）
3. 提出假设（生成改进方案）
4. 设计实验（A/B测试）
5. 执行行动（自动实施）
6. 收集数据（验证假设）
7. 更新策略（进化/淘汰）

增强功能（v2.1）：
- 集成免费AI API（Cerebras/Groq/OpenRouter/Google）做智能决策
- AI驱动的标题生成和A/B测试
- AI驱动的内容分析和选择
- 自动封面生成
"""

import json
import random
import time
from datetime import datetime, timedelta
from pathlib import Path

from memory_store import MemoryStore, seed_initial_hypotheses

# 尝试导入免费AI客户端
try:
    from free_ai_client import FreeAIClient, CoverGenerator
    HAS_AI = True
except ImportError:
    HAS_AI = False


class SelfLoopEngine:
    """自循环引擎 — 系统的核心智能"""

    def __init__(self):
        self.memory = MemoryStore()
        self.workflow_dir = Path(__file__).parent
        self._ensure_seeded()
        # 初始化AI客户端
        self.ai = FreeAIClient() if HAS_AI else None
        self.cover_gen = CoverGenerator() if HAS_AI else None

    def _ensure_seeded(self):
        """确保初始假设已种入"""
        summary = self.memory.get_memory_summary()
        if summary["hypotheses_total"] == 0:
            seed_initial_hypotheses(self.memory)
            self.memory.log_action("seed_hypotheses", "11 initial hypotheses", "seeded", 1)

    # ========== 第1步：观察 ==========
    def observe(self):
        """观察现状 — 系统的'感知'"""
        summary = self.memory.get_memory_summary()
        recent_actions = self.memory.get_recent_actions(10)
        pending_todos = self.memory.get_pending_todos()
        platform_comparison = self.memory.get_platform_comparison()
        best_content = self.memory.get_best_performing("plays", 5)

        observation = {
            "timestamp": datetime.now().isoformat(),
            "summary": summary,
            "recent_actions": recent_actions,
            "pending_todos": pending_todos,
            "platform_comparison": platform_comparison,
            "best_content": best_content,
        }

        # 诊断当前瓶颈
        observation["bottlenecks"] = self._diagnose_bottlenecks(observation)
        return observation

    def _diagnose_bottlenecks(self, obs):
        """诊断当前最大的瓶颈"""
        bottlenecks = []
        summary = obs["summary"]

        # 诊断1：内容产出不足
        if summary.get("content_produced", 0) < 3:
            bottlenecks.append({
                "type": "content_shortage",
                "severity": "high",
                "description": "内容产出不足3篇，无法获得足够数据",
                "action": "优先产出内容"
            })

        # 诊断2：总播放量低
        if summary.get("total_plays", 0) < 100:
            bottlenecks.append({
                "type": "low_plays",
                "severity": "high",
                "description": "总播放量<100，需要分析原因",
                "action": "检查标题、封面、发布时段"
            })

        # 诊断3：无平台数据
        if not obs.get("platform_comparison"):
            bottlenecks.append({
                "type": "no_platform_data",
                "severity": "medium",
                "description": "缺少平台数据对比",
                "action": "先发布至少1篇内容到1个平台"
            })

        # 诊断4：假设未测试
        if summary.get("hypotheses_pending", 0) > 0 and summary.get("hypotheses_validated", 0) == 0:
            bottlenecks.append({
                "type": "hypotheses_untested",
                "severity": "medium",
                "description": "有假设但未开始验证",
                "action": "启动A/B测试验证假设"
            })

        # 诊断5：内容多样性不足
        best = obs.get("best_content", [])
        if best and len(best) > 0:
            voices = set(c.get("voice", "") for c in best)
            if len(voices) < 2:
                bottlenecks.append({
                    "type": "low_diversity",
                    "severity": "low",
                    "description": "声音/内容类型单一",
                    "action": "尝试不同音色和内容风格"
                })

        # 如果没有明显瓶颈
        if not bottlenecks:
            bottlenecks.append({
                "type": "no_major_issue",
                "severity": "info",
                "description": "系统运行正常，继续执行当前策略",
                "action": "维持当前策略，收集更多数据"
            })

        return bottlenecks

    # ========== 第2步：假设生成 ==========
    def generate_hypotheses(self, observation):
        """基于观察生成新假设或选择待测试假设"""
        new_hypotheses = []

        for bottleneck in observation["bottlenecks"]:
            if bottleneck["type"] == "content_shortage":
                new_hypotheses.append({
                    "hypothesis": "批量生产5篇以上内容可以加速数据积累",
                    "category": "content",
                    "test_method": "一周内产出5篇并发布",
                    "priority": 10
                })

            elif bottleneck["type"] == "low_plays":
                new_hypotheses.extend([
                    {
                        "hypothesis": "标题中加入'恐怖''诡异'等词能提升点击率",
                        "category": "title",
                        "test_method": "同一内容用两种标题，对比点击",
                        "priority": 9
                    },
                    {
                        "hypothesis": "深夜发布（23:00）比22:00有更高初始播放量",
                        "category": "timing",
                        "test_method": "交替在22:00和23:00发布",
                        "priority": 7
                    },
                    {
                        "hypothesis": "添加封面图能显著提升点击率",
                        "category": "cover",
                        "test_method": "对比有封面vs无封面的点击率",
                        "priority": 8
                    }
                ])

            elif bottleneck["type"] == "hypotheses_untested":
                # 获取待测试的最高优先级假设
                pending = self.memory.get_pending_hypotheses(limit=3)
                for p in pending:
                    new_hypotheses.append({
                        "hypothesis": p["hypothesis"],
                        "category": p["category"],
                        "test_method": p["test_method"],
                        "priority": p["priority"],
                        "hypothesis_id": p["id"]
                    })

        # 去重
        existing = self.memory.get_pending_hypotheses(limit=50)
        existing_texts = set(h["hypothesis"] for h in existing)

        added = []
        for h in new_hypotheses:
            if h["hypothesis"] not in existing_texts:
                hid = self.memory.add_hypothesis(
                    h["hypothesis"], h["category"],
                    h.get("test_method", ""), h["priority"]
                )
                h["id"] = hid
                added.append(h)
                existing_texts.add(h["hypothesis"])

        return added

    # ========== 第3步：策略进化 ==========
    def evolve_strategy(self, observation):
        """基于数据和假设，进化当前策略"""
        current = self.memory.get_current_strategy()
        if not current:
            return None

        strategy = current.get("strategy", {})
        evolutions = []

        # 进化1：基于平台数据调整
        platform_data = observation.get("platform_comparison", [])
        if platform_data:
            best_platform = max(platform_data, key=lambda x: x.get("total_plays", 0))
            if best_platform.get("total_plays", 0) > 0:
                old_platforms = strategy.get("platforms", [])
                if best_platform["platform"] not in old_platforms:
                    strategy["platforms"] = list(set(old_platforms + [best_platform["platform"]]))
                    evolutions.append({
                        "type": "add_platform",
                        "old": old_platforms,
                        "new": strategy["platforms"],
                        "reason": f"{best_platform['platform']} 数据表现最好"
                    })

        # 进化2：基于最佳内容特征调整
        best_content = observation.get("best_content", [])
        if best_content:
            # 找出最佳内容的共性
            best_voices = {}
            for c in best_content:
                v = c.get("voice", "")
                best_voices[v] = best_voices.get(v, 0) + int(c.get("plays", 0))

            if best_voices:
                best_voice = max(best_voices, key=best_voices.get)
                if best_voice and best_voice != strategy.get("voice"):
                    evolutions.append({
                        "type": "voice_change",
                        "old": strategy.get("voice"),
                        "new": best_voice,
                        "reason": f"{best_voice} 的累计播放量最高"
                    })
                    strategy["voice"] = best_voice

        # 进化3：基于A/B测试结果
        # 对比不同标题变体的表现
        title_variants = self.memory.conn.execute("""
            SELECT title_variant, SUM(plays) as total_plays, COUNT(*) as count
            FROM content_performance WHERE title_variant != ''
            GROUP BY title_variant ORDER BY total_plays DESC
        """).fetchall()

        if len(title_variants) >= 2:
            winner = dict(title_variants[0])
            runner = dict(title_variants[1])
            # 需要足够的样本量
            if winner.get("total_plays", 0) > runner.get("total_plays", 0) * 1.2:
                new_template = winner.get("title_variant", strategy.get("title_template"))
                if new_template != strategy.get("title_template"):
                    evolutions.append({
                        "type": "title_template_change",
                        "old": strategy.get("title_template"),
                        "new": new_template,
                        "reason": f"新模板播放量比旧模板高20%+"
                    })
                    strategy["title_template"] = new_template

        # 进化4：内容长度优化
        completion_data = self.memory.conn.execute("""
            SELECT CASE
                WHEN plays = 0 THEN 'no_data'
                ELSE 'has_data'
            END as data_status,
            AVG(completion_rate) as avg_completion
            FROM content_performance
            GROUP BY data_status
        """).fetchall()

        if completion_data:
            for row in completion_data:
                d = dict(row)
                if d.get("data_status") == "has_data" and d.get("avg_completion", 0) < 0.3:
                    # 完播率太低，尝试缩短内容
                    old_target = strategy.get("content_length_target", "10-15min")
                    if old_target != "5-8min":
                        evolutions.append({
                            "type": "content_length_reduce",
                            "old": old_target,
                            "new": "5-8min",
                            "reason": f"完播率仅{d['avg_completion']:.0%}，需要缩短内容"
                        })
                        strategy["content_length_target"] = "5-8min"

        # 应用进化
        if evolutions:
            self.memory.save_strategy(strategy, reason=f"自动进化：{len(evolutions)}项调整")
            for evo in evolutions:
                self.memory.log_evolution(
                    evo["type"], evo["old"], evo["new"], evo["reason"]
                )
            self.memory.log_action("strategy_evolution",
                                  f"{len(evolutions)} changes", "applied", 1)

        return evolutions

    # ========== 第4步：行动生成 ==========
    def generate_actions(self, observation, hypotheses, evolutions):
        """生成具体的下一步行动清单"""
        actions = []
        bottlenecks = observation.get("bottlenecks", [])
        summary = observation.get("summary", {})

        # 行动优先级1：解决最大瓶颈
        for bn in bottlenecks:
            if bn["severity"] == "high":
                if bn["type"] == "content_shortage":
                    actions.append({
                        "priority": 1,
                        "action": "generate_content",
                        "description": "生成下一篇克苏鲁内容音频",
                        "params": {"voice": "zh-CN-YunyangNeural", "story": "next_lovecraft"},
                        "automated": True
                    })
                    actions.append({
                        "priority": 2,
                        "action": "prepare_publish",
                        "description": "准备发布素材（封面、标题、简介）",
                        "params": {},
                        "automated": False  # 需要人工审核
                    })

                elif bn["type"] == "low_plays":
                    actions.append({
                        "priority": 1,
                        "action": "optimize_title",
                        "description": "基于最佳表现内容的特征优化标题",
                        "params": {},
                        "automated": True
                    })
                    actions.append({
                        "priority": 2,
                        "action": "ab_test_timing",
                        "description": "设置A/B测试对比发布时段",
                        "params": {"time_a": "22:00", "time_b": "23:00"},
                        "automated": True
                    })

        # 行动优先级2：执行假设验证
        for hyp in hypotheses[:2]:  # 最多同时测试2个假设
            actions.append({
                "priority": 3,
                "action": "test_hypothesis",
                "description": f"开始测试: {hyp['hypothesis'][:30]}...",
                "params": {"hypothesis_id": hyp.get("id")},
                "automated": True
            })

        # 行动优先级3：数据收集
        if summary.get("content_produced", 0) > 0:
            actions.append({
                "priority": 4,
                "action": "collect_data",
                "description": "采集昨日各平台数据",
                "params": {},
                "automated": False  # 需要人工输入
            })

        # 行动优先级4：生成复盘报告
        actions.append({
            "priority": 5,
            "action": "generate_report",
            "description": "生成周报和下一步建议",
            "params": {},
            "automated": True
        })

        # 添加到todo列表
        for act in actions:
            self.memory.add_todo(
                act["description"],
                category=act["action"],
                priority=act["priority"]
            )

        self.memory.log_action("generate_actions", f"{len(actions)} actions", "generated", 1)
        return sorted(actions, key=lambda x: x["priority"])

    # ========== AI增强功能 ==========

    def ai_analyze_content(self, text):
        """使用免费AI分析内容质量"""
        if not self.ai:
            return None
        return self.ai.analyze_content(text[:2000])

    def ai_generate_titles(self, content_summary, count=3):
        """使用免费AI生成多个标题变体"""
        if not self.ai:
            return None
        return self.ai.generate_title_variants(content_summary, count)

    def ai_evaluate_hypothesis(self, hypothesis_id):
        """使用免费AI评估假设"""
        if not self.ai:
            return None
        # 获取假设
        hyp = self.memory.conn.execute(
            "SELECT * FROM hypotheses WHERE id=?", (hypothesis_id,)
        ).fetchone()
        if not hyp:
            return None

        # 获取相关数据
        data = self.memory.get_platform_comparison()
        data_summary = json.dumps(data, ensure_ascii=False) if data else "暂无数据"

        result = self.ai.evaluate_hypothesis(hyp["hypothesis"], data_summary)
        if result:
            # 解析结果
            if "成立" in result:
                confidence = 80 if "高" in result else 60
                self.memory.test_hypothesis(hypothesis_id, result, "AI分析", confidence / 100)
            self.memory.log_action("ai_evaluate", f"hypothesis {hypothesis_id}", result[:100], 1)
        return result

    def ai_suggest_content(self):
        """使用免费AI建议下一篇内容"""
        if not self.ai:
            return None
        # 获取历史表现
        best = self.memory.get_best_performing("plays", 5)
        history = json.dumps(best, ensure_ascii=False) if best else "暂无数据"

        result = self.ai.suggest_next_content(history)
        if result:
            self.memory.log_action("ai_suggest", "next_content", result[:100], 1)
        return result

    def ai_generate_cover(self, title, content_summary="", style="cthulhu_default"):
        """生成封面"""
        if not self.cover_gen:
            return None
        html_file = self.cover_gen.open_generator(title, content_summary, style)
        self.memory.log_action("ai_cover", title, str(html_file), 1)
        return html_file

    def ai_daily_analysis(self):
        """每日AI深度分析 — 使用Cerebras的1M tokens额度"""
        if not self.ai:
            return None

        # 获取所有数据
        summary = self.memory.get_memory_summary()
        best_content = self.memory.get_best_performing("plays", 10)
        platform_data = self.memory.get_platform_comparison()
        evolution = self.memory.get_evolution_path()

        # 构建分析prompt
        analysis_prompt = f"""
基于以下克苏鲁有声书运营数据，做深度分析：

## 核心指标
- 总播放量: {summary.get('total_plays', 0)}
- 总收益: ¥{summary.get('total_revenue', 0):.2f}
- 已产内容: {summary.get('content_produced', 0)} 篇
- 假设验证: {summary.get('hypotheses_validated', 0)}/{summary.get('hypotheses_total', 0)}

## 最佳内容
{json.dumps(best_content, ensure_ascii=False, indent=2)[:1000]}

## 平台对比
{json.dumps(platform_data, ensure_ascii=False, indent=2)[:500]}

## 进化历史
{json.dumps(evolution[:5], ensure_ascii=False, indent=2)[:500]}

请给出：
1. 当前最大的3个问题
2. 具体的改进建议（可执行）
3. 下一篇内容推荐
4. 策略调整建议
"""

        result = self.ai.chat([
            {"role": "system", "content": "你是一个有声书运营专家，擅长数据分析和策略优化。给出具体可执行的建议。"},
            {"role": "user", "content": analysis_prompt}
        ], max_tokens=2000)

        if result:
            # 保存深度分析
            analysis_file = self.workflow_dir / "data" / f"ai_deep_analysis_{datetime.now().strftime('%Y%m%d')}.txt"
            analysis_file.write_text(result, encoding='utf-8')
            self.memory.log_action("ai_deep_analysis", "daily", f"saved to {analysis_file.name}", 1)

        return result

    # ========== 第5步：执行（部分自动化）==========
    def execute_action(self, action):
        """执行行动 — 部分自动化，部分需要人工"""
        action_type = action["action"]

        if action_type == "generate_content":
            # 自动：调用workflow_engine生成音频
            self.memory.log_action("execute", "generate_content", "delegated", 1)
            return {"status": "delegated", "message": "请运行: python workflow_engine.py run"}

        elif action_type == "optimize_title":
            # 自动：基于历史数据生成优化后的标题
            best = self.memory.get_best_performing("plays", 1)
            if best:
                title = best[0].get("content_title", "")
                return {"status": "done", "optimized_title": title}

            return {"status": "no_data"}

        elif action_type == "generate_report":
            # 自动：生成报告
            report = self.generate_automated_report()
            return {"status": "done", "report": report}

        else:
            return {"status": "manual_required", "message": "需要人工操作"}

    # ========== 第6步：复盘报告 ==========
    def generate_automated_report(self):
        """生成自动化复盘报告"""
        obs = self.observe()
        summary = obs["summary"]

        report = f"""
╔══════════════════════════════════════════════════════════╗
║        🎙️ 克苏鲁有声书 自动化日报                      ║
║        {datetime.now().strftime('%Y-%m-%d %H:%M')}                                ║
╚══════════════════════════════════════════════════════════╝

📊 核心指标
  总播放量: {summary.get('total_plays', 0)}
  总收益: ¥{summary.get('total_revenue', 0):.2f}
  已产内容: {summary.get('content_produced', 0)} 篇
  假设验证: {summary.get('hypotheses_validated', 0)}/{summary.get('hypotheses_total', 0)}

🔍 当前瓶颈"""

        for bn in obs.get("bottlenecks", []):
            severity_icon = {"high": "🔴", "medium": "🟡", "info": "🟢"}.get(bn["severity"], "⚪")
            report += f"\n  {severity_icon} [{bn['type']}] {bn['description']}"

        # 平台对比
        platform_data = obs.get("platform_comparison", [])
        if platform_data:
            report += "\n\n📱 平台数据对比"
            for p in platform_data:
                report += f"\n  {p.get('platform', 'unknown')}: 播放 {p.get('total_plays', 0)} | 完播率 {p.get('avg_completion', 0):.0%}"

        # 最近进化
        evo = self.memory.get_evolution_path()
        if evo:
            report += "\n\n🧬 策略进化"
            for e in evo[:3]:
                report += f"\n  [{e['change_type']}] {e.get('old_value', '')} → {e.get('new_value', '')}"

        # 待办事项
        todos = self.memory.get_pending_todos()
        if todos:
            report += "\n\n📋 待办事项"
            for t in todos[:5]:
                report += f"\n  P{t['priority']} [{t['category']}] {t['task']}"

        report += "\n\n" + "=" * 56

        # 保存报告
        report_file = self.workflow_dir / "data" / f"daily_report_{datetime.now().strftime('%Y%m%d')}.txt"
        report_file.write_text(report, encoding='utf-8')

        self.memory.log_action("generate_report", f"saved to {report_file.name}", "done", 1)
        return report

    # ========== 主循环 ==========
    def run_loop(self):
        """执行一次完整的自循环"""
        print("=" * 60)
        print("🔄 自循环引擎启动")
        print(f"   {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)

        # Step 1: 观察
        print("\n👁️  Step 1: 观察现状...")
        obs = self.observe()
        print(f"   发现 {len(obs['bottlenecks'])} 个瓶颈")
        for bn in obs["bottlenecks"]:
            print(f"   {'🔴' if bn['severity']=='high' else '🟡'} {bn['description']}")

        # Step 2: 生成/选择假设
        print(f"\n💡 Step 2: 生成假设...")
        new_hyp = self.generate_hypotheses(obs)
        print(f"   新增 {len(new_hyp)} 个假设")

        # Step 3: 进化策略
        print(f"\n🧬 Step 3: 进化策略...")
        evolutions = self.evolve_strategy(obs)
        if evolutions:
            print(f"   策略进化 {len(evolutions)} 项:")
            for evo in evolutions:
                print(f"   • [{evo['type']}] {evo['reason']}")
        else:
            print("   当前策略无需调整")

        # Step 4: 生成行动
        print(f"\n🎯 Step 4: 生成行动清单...")
        actions = self.generate_actions(obs, new_hyp, evolutions)
        print(f"   生成 {len(actions)} 个行动:")
        for act in actions:
            auto_mark = "🤖" if act.get("automated") else "👤"
            print(f"   {auto_mark} P{act['priority']} {act['description']}")

        # Step 5: 自动执行可自动化的行动
        print(f"\n⚡ Step 5: 执行自动化行动...")
        for act in actions:
            if act.get("automated"):
                result = self.execute_action(act)
                print(f"   ✓ {act['action']}: {result.get('status', 'done')}")

        # Step 6: 生成报告
        print(f"\n📝 Step 6: 生成报告...")
        report = self.generate_automated_report()
        print(report)

        self.memory.log_action("self_loop_completed", "full cycle", "success", 1)
        return obs, actions, report


# ========== CLI ==========
if __name__ == "__main__":
    import sys
    engine = SelfLoopEngine()
    if len(sys.argv) > 1 and sys.argv[1] == "report":
        print(engine.generate_automated_report())
    elif len(sys.argv) > 1 and sys.argv[1] == "observe":
        obs = engine.observe()
        print(json.dumps(obs, ensure_ascii=False, indent=2))
    else:
        engine.run_loop()
