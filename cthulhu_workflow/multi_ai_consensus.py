#!/usr/bin/env python3
"""
多AI共识决策引擎
=================
同时查询多个免费LLM，基于投票/共识做出最优决策。

为什么需要多AI共识：
- 单一AI可能有偏见或幻觉
- 多个AI的共识更可靠
- 不同AI擅长不同任务（推理、创意、分析）
- 当某个AI不可用时自动降级

免费AI源：
1. Groq (14,400 req/day) - 快速推理
2. Cerebras (1M tokens/day) - 深度分析
3. OpenRouter (50-1000/day) - 多模型
4. Google AI/Gemma (14,400/day) - 通用
5. Cloudflare Workers (10K/day) - 轻量

决策流程：
1. 发送问题到所有可用AI
2. 收集回答
3. 分析共识度
4. 输出最终决策+置信度
"""

import os
import json
import time
import hashlib
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime
from collections import Counter


WORKFLOW_DIR = Path(__file__).parent
DATA_DIR = WORKFLOW_DIR / "data"
CONSENSUS_DIR = DATA_DIR / "consensus_log"


class FreeAIBackend:
    """免费AI后端封装"""
    
    def __init__(self):
        self.config = self._load_config()
    
    def _load_config(self):
        config_file = WORKFLOW_DIR / "config.json"
        if config_file.exists():
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"api_keys": {}}
    
    def _http_post(self, url, data, headers=None, timeout=30):
        """HTTP POST"""
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        
        body = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=body, headers=headers)
        
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8', errors='replace')
            return {"error": f"HTTP {e.code}: {error_body[:200]}"}
        except Exception as e:
            return {"error": str(e)[:200]}
    
    def call_groq(self, messages, max_tokens=500):
        """调用Groq API (快速)"""
        key = self.config.get("api_keys", {}).get("groq", "")
        if not key:
            return None
        
        url = "https://api.groq.com/openai/v1/chat/completions"
        data = {
            "model": "llama-3.3-70b-versatile",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        
        result = self._http_post(url, data, headers)
        if "choices" in result:
            return result["choices"][0]["message"]["content"]
        return None
    
    def call_cerebras(self, messages, max_tokens=500):
        """调用Cerebras API (1M tokens/day)"""
        key = self.config.get("api_keys", {}).get("cerebras", "")
        if not key:
            return None
        
        url = "https://api.cerebras.ai/v1/chat/completions"
        data = {
            "model": "llama3.1-70b",
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        
        result = self._http_post(url, data, headers)
        if "choices" in result:
            return result["choices"][0]["message"]["content"]
        return None
    
    def call_openrouter(self, messages, max_tokens=500, model="meta-llama/llama-3.3-70b-instruct:free"):
        """调用OpenRouter API (免费模型)"""
        key = self.config.get("api_keys", {}).get("openrouter", "")
        if not key:
            return None
        
        url = "https://openrouter.ai/api/v1/chat/completions"
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.7,
        }
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://cthulhu-audiobook.local",
            "X-Title": "Cthulhu Audiobook Workflow",
        }
        
        result = self._http_post(url, data, headers)
        if "choices" in result:
            return result["choices"][0]["message"]["content"]
        return None
    
    def call_google_ai(self, messages, max_tokens=500):
        """调用Google AI Studio API (Gemini/Gemma)"""
        key = self.config.get("api_keys", {}).get("google", "")
        if not key:
            return None
        
        # Convert messages to Google AI format
        prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
        data = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": 0.7,
            }
        }
        
        result = self._http_post(url, data)
        if "candidates" in result:
            candidate = result["candidates"][0]
            if "content" in candidate:
                return candidate["content"]["parts"][0]["text"]
        return None
    
    def call_cloudflare(self, messages, max_tokens=500):
        """调用Cloudflare Workers AI"""
        key = self.config.get("api_keys", {}).get("cloudflare", "")
        account_id = self.config.get("api_keys", {}).get("cloudflare_account", "")
        if not key or not account_id:
            return None
        
        url = f"https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3.1-8b-instruct"
        
        prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
        data = {"prompt": prompt, "max_tokens": max_tokens}
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        
        result = self._http_post(url, data, headers)
        if isinstance(result, dict) and "result" in result:
            return result["result"].get("response", "")
        return None
    
    def get_all_available(self):
        """获取所有可用的AI后端"""
        available = []
        for name, key in self.config.get("api_keys", {}).items():
            if key and name in ["groq", "cerebras", "openrouter", "google", "cloudflare"]:
                available.append(name)
        return available


class MultiAIConsensus:
    """多AI共识决策引擎"""
    
    def __init__(self):
        CONSENSUS_DIR.mkdir(parents=True, exist_ok=True)
        self.backend = FreeAIBackend()
        self.consensus_log = CONSENSUS_DIR / "history.jsonl"
    
    def _log_consensus(self, task, votes, decision, confidence):
        """记录共识决策"""
        entry = {
            "timestamp": datetime.now().isoformat(),
            "task": task,
            "votes": votes,
            "decision": decision,
            "confidence": confidence,
            "num_models": len(votes),
        }
        with open(self.consensus_log, 'a', encoding='utf-8') as f:
            f.write(json.dumps(entry, ensure_ascii=False) + '\n')
    
    def query_all(self, messages, task_name="general", timeout=20):
        """
        查询所有可用AI，返回各模型的回答
        """
        results = {}
        
        # Query all backends in sequence
        callers = {
            "groq": self.backend.call_groq,
            "cerebras": self.backend.call_cerebras,
            "openrouter": self.backend.call_openrouter,
            "google": self.backend.call_google_ai,
            "cloudflare": self.backend.call_cloudflare,
        }
        
        for name, caller in callers.items():
            try:
                result = caller(messages, max_tokens=500)
                if result:
                    results[name] = result.strip()
            except Exception as e:
                pass  # Skip failed calls
        
        return results
    
    def decide_content_topic(self, history_summary):
        """
        多AI投票决定下一个内容主题
        
        返回: {decision, confidence, votes}
        """
        system_msg = {
            "role": "system",
            "content": "你是一个克苏鲁有声书运营专家。根据历史数据，推荐下一个最值得制作的克苏鲁故事。只返回故事ID，不要解释。"
        }
        user_msg = {
            "role": "user",
            "content": f"""基于以下历史数据，推荐下一个克苏鲁故事ID。
可选故事ID: dagon, call_of_cthulhu, mountains_of_madness, shadow_over_innsmouth, colour_out_of_space, whisperer_in_darkness, shadow_out_of_time, witch_house, haunter_of_the_dark, thing_on_doorstep

历史数据: {json.dumps(history_summary, ensure_ascii=False)[:500]}

只返回一个故事ID，不要其他内容。"""
        }
        
        messages = [system_msg, user_msg]
        votes = self.query_all(messages, task_name="content_topic")
        
        if not votes:
            return {"decision": "dagon", "confidence": 0, "votes": {}, "note": "no_ai_available"}
        
        # Count votes
        vote_counts = Counter(votes.values())
        top_choice = vote_counts.most_common(1)[0]
        decision = top_choice[0]
        confidence = top_choice[1] / len(votes)
        
        self._log_consensus("content_topic", votes, decision, confidence)
        
        return {
            "decision": decision,
            "confidence": round(confidence, 2),
            "votes": votes,
            "vote_counts": dict(vote_counts),
        }
    
    def decide_title(self, content_title, content_keywords, style="悬念"):
        """
        多AI投票决定最佳标题
        
        返回: {titles, votes, best_title, confidence}
        """
        system_msg = {
            "role": "system",
            "content": f"你是一个中文标题专家。为克苏鲁有声书生成一个{style}风格的标题。只返回标题，不要解释。"
        }
        user_msg = {
            "role": "user",
            "content": f"故事: {content_title}\n关键词: {', '.join(content_keywords[:5]) if content_keywords else '恐怖,神秘'}\n生成1个标题（20字以内）："
        }
        
        messages = [system_msg, user_msg]
        votes = self.query_all(messages, task_name="title_generation")
        
        if not votes:
            return {"best_title": f"深夜恐怖：{content_title}", "confidence": 0, "votes": {}}
        
        # Count/voting - for titles, we use the most common pattern
        vote_counts = Counter(votes.values())
        
        # If all different, pick the shortest (titles should be concise)
        if len(vote_counts) == len(votes):
            best = min(votes.values(), key=len)
        else:
            best = vote_counts.most_common(1)[0][0]
        
        confidence = vote_counts.get(best, 1) / len(votes)
        
        self._log_consensus("title_generation", votes, best, confidence)
        
        return {
            "best_title": best,
            "confidence": round(confidence, 2),
            "titles": list(votes.values()),
            "votes": votes,
        }
    
    def analyze_strategy(self, performance_data):
        """
        多AI分析运营策略
        
        返回: {consensus_analysis, action_items, confidence}
        """
        system_msg = {
            "role": "system",
            "content": "你是一个有声书运营分析师。基于数据给出一条最重要的改进建议。用一句话回答。"
        }
        user_msg = {
            "role": "user",
            "content": f"""克苏鲁有声书运营数据：
{json.dumps(performance_data, ensure_ascii=False)[:1000]}

最重要的一条改进建议是什么？（一句话回答）"""
        }
        
        messages = [system_msg, user_msg]
        votes = self.query_all(messages, task_name="strategy_analysis")
        
        if not votes:
            return {"consensus_analysis": "暂无AI可用", "confidence": 0, "votes": {}}
        
        # For analysis, we combine all unique insights
        unique_insights = list(set(votes.values()))
        
        # Pick the most actionable one (shortest tends to be most direct)
        best = min(unique_insights, key=len)
        
        self._log_consensus("strategy_analysis", votes, best, 0.8)
        
        return {
            "consensus_analysis": best,
            "all_insights": unique_insights,
            "confidence": round(len(votes) / 5, 2),  # More models = higher confidence
            "votes": votes,
        }
    
    def decide_publish_time(self, historical_data=None):
        """
        多AI决定最佳发布时间
        """
        system_msg = {
            "role": "system",
            "content": "你是音频平台运营专家。恐怖有声书最佳发布时间是几点？只返回小时数字(0-23)。"
        }
        user_msg = {
            "role": "user",
            "content": "考虑因素: 1)恐怖内容晚上收听率高 2)睡前时段(22-1点)流量大 3)深夜用户更容易沉浸。只返回一个数字。"
        }
        
        messages = [system_msg, user_msg]
        votes = self.query_all(messages, task_name="publish_time")
        
        if not votes:
            return {"best_hour": 22, "confidence": 0, "votes": {}}
        
        # Parse hours and average
        hours = []
        for v in votes.values():
            try:
                h = int(''.join(c for c in v if c.isdigit())[:2])
                if 0 <= h <= 23:
                    hours.append(h)
            except:
                pass
        
        if hours:
            avg_hour = round(sum(hours) / len(hours))
            return {"best_hour": avg_hour, "confidence": round(len(hours) / len(votes), 2), "votes": votes}
        
        return {"best_hour": 22, "confidence": 0, "votes": votes}
    
    def get_consensus_stats(self):
        """获取共识引擎统计"""
        if not self.consensus_log.exists():
            return {"total_decisions": 0}
        
        count = 0
        with open(self.consensus_log, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    count += 1
        
        return {
            "total_decisions": count,
            "available_models": len(self.backend.get_all_available()),
            "log_file": str(self.consensus_log),
        }


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    engine = MultiAIConsensus()
    
    if len(sys.argv) > 1 and sys.argv[1] == "stats":
        stats = engine.get_consensus_stats()
        print("=== 共识引擎统计 ===")
        for k, v in stats.items():
            print(f"  {k}: {v}")
        print(f"\n可用模型: {engine.backend.get_all_available()}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "content":
        result = engine.decide_content_topic({"total_plays": 0, "last_content": "dagon"})
        print("=== 内容决策 ===")
        print(f"决策: {result['decision']}")
        print(f"置信度: {result['confidence']}")
        print(f"各模型投票: {json.dumps(result['votes'], ensure_ascii=False, indent=2)}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "title":
        result = engine.decide_title("克苏鲁的呼唤", ["恐怖", "深海", "宇宙"])
        print("=== 标题决策 ===")
        print(f"最佳标题: {result['best_title']}")
        print(f"置信度: {result['confidence']}")
        print(f"所有提案: {result.get('titles', [])}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "strategy":
        result = engine.analyze_strategy({"plays": [10, 5, 20], "revenue": [0, 0, 0]})
        print("=== 策略分析 ===")
        print(f"共识: {result['consensus_analysis']}")
        print(f"所有见解: {result.get('all_insights', [])}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "time":
        result = engine.decide_publish_time()
        print("=== 发布时间决策 ===")
        print(f"最佳时间: {result['best_hour']}时")
        print(f"置信度: {result['confidence']}")
    
    else:
        print("多AI共识决策引擎")
        print()
        print("用法:")
        print("  python multi_ai_consensus.py stats    - 引擎统计")
        print("  python multi_ai_consensus.py content  - 内容主题决策")
        print("  python multi_ai_consensus.py title    - 标题决策")
        print("  python multi_ai_consensus.py strategy - 策略分析")
        print("  python multi_ai_consensus.py time     - 发布时间决策")
        print()
        print(f"当前可用模型: {engine.backend.get_all_available() or '无（需配置API Key）'}")
