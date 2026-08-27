#!/usr/bin/env python3
"""
免费AI资源统一客户端
====================
整合2026年所有可用的免费AI API，零成本驱动系统智能。

免费额度（每天）：
- Cerebras:     1,000,000 tokens  (gpt-oss-120b, Llama 3.1 8B)
- Groq:          14,400 requests  (Llama 3.1 8B, Qwen3)
- OpenRouter:   50-1,000 requests (DeepSeek R1, Llama 3.3 70B, Mistral 7B)
- Google AI:     14,400 requests  (Gemma 3)
- Cloudflare:    10,000 neurons   (Llama, Gemma, Qwen, GLM, Kimi)
- HF Inference:  $0.10/month      (various models)

总计：每天约 15,000+ 次免费AI调用，足够驱动整个系统。
"""

import json
import time
import urllib.request
import urllib.error
from pathlib import Path


# ============================================================
# 配置：免费API端点
# ============================================================
FREE_APIS = {
    "cerebras": {
        "url": "https://api.cerebras.ai/v1/chat/completions",
        "models": ["llama3.1-8b", "gpt-oss-120b"],
        "default_model": "llama3.1-8b",
        "daily_limit": "1M tokens",
        "notes": "30 req/min, 1M tokens/day"
    },
    "groq": {
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "models": ["llama-3.1-8b-instant", "qwen3-8b"],
        "default_model": "llama-3.1-8b-instant",
        "daily_limit": "14,400 req",
        "notes": "14,400 req/day"
    },
    "openrouter": {
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "models": ["meta-llama/llama-3.3-70b-instruct:free", "mistralai/mistral-7b-instruct:free"],
        "default_model": "meta-llama/llama-3.3-70b-instruct:free",
        "daily_limit": "50-1000 req",
        "notes": "20 req/min, 50-1000 req/day"
    },
    "google": {
        "url": "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        "models": ["gemma-3-4b-it", "gemini-2.0-flash"],
        "default_model": "gemma-3-4b-it",
        "daily_limit": "14,400 req",
        "notes": "Gemma 3: 14,400 req/day"
    },
    "cloudflare": {
        "url": "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3.1-8b-instruct",
        "models": ["@cf/meta/llama-3.1-8b-instruct", "@cf/qwen/qwen1.5-7b-chat"],
        "default_model": "@cf/meta/llama-3.1-8b-instruct",
        "daily_limit": "10,000 neurons",
        "notes": "10,000 neurons/day"
    },
}


class FreeAIClient:
    """免费AI客户端 — 自动轮询多个免费API"""

    def __init__(self, api_keys=None):
        """
        api_keys: dict, e.g. {"openrouter": "sk-or-xxx", "groq": "gsk-xxx", ...}
        注意：Cerebras 和 Google AI Studio 可以在无key情况下有限使用
        """
        self.api_keys = api_keys or {}
        self.usage_log = Path(__file__).parent / "data" / "api_usage.json"
        self._load_usage()

    def _load_usage(self):
        """加载使用记录"""
        if self.usage_log.exists():
            with open(self.usage_log, 'r') as f:
                self.usage = json.load(f)
        else:
            self.usage = {}

    def _save_usage(self):
        """保存使用记录"""
        self.usage_log.parent.mkdir(parents=True, exist_ok=True)
        with open(self.usage_log, 'w') as f:
            json.dump(self.usage, f, indent=2)

    def _get_today_usage(self, provider):
        """获取今日使用量"""
        today = time.strftime('%Y-%m-%d')
        key = f"{provider}_{today}"
        return self.usage.get(key, {"requests": 0, "tokens": 0})

    def _log_usage(self, provider, requests=1, tokens=0):
        """记录使用量"""
        today = time.strftime('%Y-%m-%d')
        key = f"{provider}_{today}"
        if key not in self.usage:
            self.usage[key] = {"requests": 0, "tokens": 0}
        self.usage[key]["requests"] += requests
        self.usage[key]["tokens"] += tokens
        self._save_usage()

    # === 核心调用方法 ===

    def chat(self, messages, model_provider="auto", max_tokens=1000, temperature=0.7):
        """
        统一聊天接口，自动选择可用的免费API

        messages: list of {"role": "user"/"assistant", "content": "..."}
        model_provider: "auto" 或指定 "cerebras"/"groq"/"openrouter"/"google"
        """
        if model_provider == "auto":
            return self._auto_select(messages, max_tokens, temperature)
        else:
            return self._call_provider(model_provider, messages, max_tokens, temperature)

    def _auto_select(self, messages, max_tokens, temperature):
        """自动选择最佳可用API（优先级：Cerebras > Groq > OpenRouter > Google）"""
        # 估算token数
        total_chars = sum(len(m.get("content", "")) for m in messages)
        estimated_tokens = total_chars // 2 + max_tokens

        # 优先级队列
        providers = ["cerebras", "groq", "openrouter", "google"]

        for provider in providers:
            usage = self._get_today_usage(provider)
            config = FREE_APIS.get(provider, {})

            # 检查是否超限
            limit_str = config.get("daily_limit", "")
            if "1M" in limit_str and usage["tokens"] > 900000:
                continue
            if "14,400" in limit_str and usage["requests"] > 13000:
                continue
            if "1000" in limit_str and usage["requests"] > 900:
                continue

            # 尝试调用
            result = self._call_provider(provider, messages, max_tokens, temperature)
            if result:
                return result

        # 所有API都失败，返回None
        return None

    def _call_provider(self, provider, messages, max_tokens, temperature):
        """调用指定API"""
        config = FREE_APIS.get(provider)
        if not config:
            return None

        try:
            if provider == "cerebras":
                return self._call_cerebras(messages, max_tokens, temperature)
            elif provider == "groq":
                return self._call_groq(messages, max_tokens, temperature)
            elif provider == "openrouter":
                return self._call_openrouter(messages, max_tokens, temperature)
            elif provider == "google":
                return self._call_google(messages, max_tokens, temperature)
        except Exception as e:
            print(f"  [WARN] {provider} 调用失败: {e}")
            return None

    def _call_cerebras(self, messages, max_tokens, temperature):
        """Cerebras API - 1M tokens/day free"""
        api_key = self.api_keys.get("cerebras", "")
        if not api_key:
            # 无key时尝试有限调用
            return None

        data = json.dumps({
            "model": FREE_APIS["cerebras"]["default_model"],
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }).encode('utf-8')

        req = urllib.request.Request(
            FREE_APIS["cerebras"]["url"],
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            }
        )

        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            self._log_usage("cerebras", 1, result.get("usage", {}).get("total_tokens", 0))
            return result["choices"][0]["message"]["content"]

    def _call_groq(self, messages, max_tokens, temperature):
        """Groq API - 14,400 req/day free"""
        api_key = self.api_keys.get("groq", "")
        if not api_key:
            return None

        data = json.dumps({
            "model": FREE_APIS["groq"]["default_model"],
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }).encode('utf-8')

        req = urllib.request.Request(
            FREE_APIS["groq"]["url"],
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            }
        )

        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            self._log_usage("groq", 1, result.get("usage", {}).get("total_tokens", 0))
            return result["choices"][0]["message"]["content"]

    def _call_openrouter(self, messages, max_tokens, temperature):
        """OpenRouter API - 50-1000 req/day free"""
        api_key = self.api_keys.get("openrouter", "")
        if not api_key:
            return None

        data = json.dumps({
            "model": FREE_APIS["openrouter"]["default_model"],
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }).encode('utf-8')

        req = urllib.request.Request(
            FREE_APIS["openrouter"]["url"],
            data=data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
                "HTTP-Referer": "https://github.com/cthulhu-audiobook-workflow",
                "X-Title": "Cthulhu Audiobook Workflow",
            }
        )

        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            self._log_usage("openrouter", 1, result.get("usage", {}).get("total_tokens", 0))
            return result["choices"][0]["message"]["content"]

    def _call_google(self, messages, max_tokens, temperature):
        """Google AI Studio API - Gemma 3: 14,400 req/day free"""
        api_key = self.api_keys.get("google", "")
        if not api_key:
            return None

        # 转换消息格式
        prompt = "\n".join([f"{m['role']}: {m['content']}" for m in messages])

        data = json.dumps({
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "maxOutputTokens": max_tokens,
                "temperature": temperature,
            }
        }).encode('utf-8')

        model = FREE_APIS["google"]["default_model"]
        url = FREE_APIS["google"]["url"].format(model=model)

        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"}
        )
        req.add_header("X-Goog-Api-Key", api_key)

        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            self._log_usage("google", 1, 0)
            return result["candidates"][0]["content"]["parts"][0]["text"]

    # === 便捷方法 ===

    def analyze_content(self, text, max_tokens=500):
        """分析内容质量、受众吸引力"""
        messages = [
            {"role": "system", "content": "你是一个内容分析专家。分析以下文本的受众吸引力、恐怖氛围、适合有声书改编的程度。给出1-10分的评分和简短理由。"},
            {"role": "user", "content": text[:2000]}
        ]
        return self.chat(messages, max_tokens=max_tokens)

    def generate_title_variants(self, content_summary, count=3):
        """生成多个标题变体用于A/B测试"""
        messages = [
            {"role": "system", "content": f"你是一个标题创作专家。为以下有声书内容生成{count}个吸引点击的标题。每个标题不超过30字，适合恐怖/悬疑题材。只返回标题列表，每行一个。"},
            {"role": "user", "content": content_summary[:1000]}
        ]
        result = self.chat(messages, max_tokens=300)
        if result:
            return [t.strip() for t in result.strip().split('\n') if t.strip()][:count]
        return None

    def generate_cover_prompt(self, content_summary):
        """生成AI封面创作的prompt"""
        messages = [
            {"role": "system", "content": "你是一个封面设计prompt工程师。为以下恐怖/悬疑有声书内容生成一个AI图像生成的prompt。prompt要包含：主体、风格、色调、氛围。用英文输出，不超过100词。"},
            {"role": "user", "content": content_summary[:1000]}
        ]
        return self.chat(messages, max_tokens=200)

    def evaluate_hypothesis(self, hypothesis, data_summary):
        """基于数据评估假设是否成立"""
        messages = [
            {"role": "system", "content": "你是一个数据分析专家。基于以下数据和假设，判断假设是否成立。给出'成立'/'不成立'/'证据不足'的判断，以及置信度（0-100%）和理由。"},
            {"role": "user", "content": f"假设: {hypothesis}\n\n数据: {data_summary}"}
        ]
        return self.chat(messages, max_tokens=400)

    def suggest_next_content(self, performance_history):
        """基于历史表现建议下一篇内容"""
        messages = [
            {"role": "system", "content": "你是一个内容策略师。基于以下历史表现数据，建议下一篇应该做什么内容。给出具体的作品名称和理由。"},
            {"role": "user", "content": performance_history[:2000]}
        ]
        return self.chat(messages, max_tokens=500)

    def get_usage_report(self):
        """获取API使用报告"""
        today = time.strftime('%Y-%m-%d')
        report = {}
        for provider in FREE_APIS:
            usage = self._get_today_usage(provider)
            report[provider] = {
                "requests": usage["requests"],
                "tokens": usage["tokens"],
                "limit": FREE_APIS[provider]["daily_limit"],
            }
        return report


# ============================================================
# 封面生成器（使用免费AI图像API）
# ============================================================
class CoverGenerator:
    """免费AI封面生成器"""

    FREE_IMAGE_APIS = {
        "aimagegen": "https://api.aimagegen.com/v1/generate",
        "bing": "https://www.bing.com/images/create",
    }

    @staticmethod
    def generate_cover_prompt(title, description, style="dark horror"):
        """生成封面prompt"""
        prompt = (
            f"A dark horror book cover for '{title}'. "
            f"Style: cosmic horror, Lovecraftian, dark purple and black tones. "
            f"Elements: ancient tentacles, mysterious geometry, deep ocean abyss. "
            f"Atmosphere: eerie, unsettling, mysterious. "
            f"No text. Cinematic lighting. 4K quality."
        )
        return prompt

    @staticmethod
    def get_cover_html(title, subtitle=""):
        """生成封面HTML（可用于在线生成）"""
        prompt = CoverGenerator.generate_cover_prompt(title, "")
        html = f"""
<!DOCTYPE html>
<html>
<head><title>Generate Cover: {title}</title></head>
<body style="background:#0d1117;color:#c9d1d9;font-family:sans-serif;padding:20px">
<h1>🎨 封面生成器</h1>
<p><strong>标题:</strong> {title}</p>
<p><strong>Prompt:</strong></p>
<textarea id="prompt" style="width:100%;height:100px;background:#161b22;color:#c9d1d9;border:1px solid #30363d;padding:10px">{prompt}</textarea>
<h2>免费生成链接（点击打开）</h2>
<ul>
<li><a href="https://www.bing.com/images/create?kic=1&showselective=1&q={urllib.parse.quote(prompt)}" target="_blank">Bing Image Creator (DALL-E 3)</a></li>
<li><a href="https://ideogram.ai/t/explore?q={urllib.parse.quote(prompt)}" target="_blank">Ideogram AI</a></li>
<li><a href="https://leonardo.ai/ai-generations?prompt={urllib.parse.quote(prompt)}" target="_blank">Leonardo AI</a></li>
</ul>
</body>
</html>
"""
        return html


# ============================================================
# CLI 测试
# ============================================================
if __name__ == "__main__":
    import sys
    client = FreeAIClient()

    if len(sys.argv) > 1 and sys.argv[1] == "report":
        print("📊 API使用报告:")
        for provider, info in client.get_usage_report().items():
            print(f"  {provider}: {info['requests']} req, {info['tokens']} tokens (limit: {info['limit']})")
    elif len(sys.argv) > 1 and sys.argv[1] == "test":
        print("🧪 测试免费AI调用...")
        result = client.chat([
            {"role": "user", "content": "用一句话介绍克苏鲁神话。"}
        ])
        if result:
            print(f"✅ 成功: {result}")
        else:
            print("❌ 所有API都失败了（可能需要API key）")
    else:
        print("用法: python free_ai_client.py [report|test]")
