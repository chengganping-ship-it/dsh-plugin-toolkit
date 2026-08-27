# 🔑 免费AI API Key 获取指南

所有API都可以**零成本**获取，无需信用卡，只需注册账号。

---

## 1. OpenRouter（推荐首选）

**免费额度**: 50-1000 req/day
**模型**: Llama 3.3 70B, Mistral 7B, DeepSeek R1（免费层）

**获取步骤**:
1. 打开 https://openrouter.ai/
2. 点击 "Sign In" -> 用Google/GitHub注册
3. 进入 https://openrouter.ai/keys
4. 点击 "Create Key"
5. 复制Key，格式: `sk-or-v1-xxxxx`

---

## 2. Groq（高速推理）

**免费额度**: 14,400 req/day
**模型**: Llama 3.1 8B instant

**获取步骤**:
1. 打开 https://console.groq.com/
2. 注册/登录
3. 进入 https://console.groq.com/keys
4. 点击 "Create API Key"
5. 复制Key，格式: `gsk_xxxxx`

---

## 3. Cerebras（超大Token额度）

**免费额度**: 1,000,000 tokens/day（约100万字）
**模型**: Llama 3.1 8B

**获取步骤**:
1. 打开 https://cloud.cerebras.ai/
2. 注册/登录
3. 进入 Platform -> API Keys
4. 创建Key
5. 复制Key

---

## 4. Google AI Studio（Gemini系列）

**免费额度**: Gemma 3 系列 14,400 req/day
**模型**: Gemma 3, Gemini 2.0 Flash

**获取步骤**:
1. 打开 https://aistudio.google.com/
2. 用Google账号登录
3. 进入 https://aistudio.google.com/apikey
4. 点击 "Create API Key"
5. 复制Key，格式: `AIzaSyxxxxx`

---

## 5. Cloudflare Workers AI

**免费额度**: 10,000 neurons/day
**模型**: Llama 3.1 8B, Qwen, GLM, Kimi

**获取步骤**:
1. 打开 https://dash.cloudflare.com/
2. 注册/登录
3. 进入 Workers & Pages -> Overview
4. 点击 "AI" -> "Use API"
5. 获取 Account ID 和 API Token

---

## 6. HuggingFace Inference

**免费额度**: $0.10/月（约100次调用）
**模型**: 数千种开源模型

**获取步骤**:
1. 打开 https://huggingface.co/
2. 注册/登录
3. 进入 https://huggingface.co/settings/tokens
4. 创建 "Read" Token

---

## 配置方式

编辑 `config.json`:

```json
{
  "api_keys": {
    "openrouter": "sk-or-v1-xxxxx",
    "groq": "gsk_xxxxx",
    "cerebras": "your_cerebras_key",
    "google": "AIzaSyxxxxx",
    "cloudflare": "your_cf_token"
  }
}
```

---

## 免费额度总览

| 平台 | 每日免费 | 累计/天 | 足够做什么 |
|------|----------|---------|-----------|
| Cerebras | 1M tokens | ~100万字分析 | 每日深度报告 |
| Groq | 14,400 req | 14,400次调用 | 快速标题生成 |
| Google | 14,400 req | 14,400次调用 | 内容分析 |
| OpenRouter | 50-1000 req | 50-1000次调用 | 备选方案 |
| Cloudflare | 10,000 neurons | 10,000次调用 | 备选方案 |
| **合计** | **~40,000+** | **~40,000次/天** | **覆盖全系统** |

---

## 注意事项

1. 免费额度每天都会重置
2. 不需要信用卡，纯注册即可
3. 即使是免费层，也建议不要公开你的API Key
4. 如果某个API额度用完，系统会自动切换到下一个
