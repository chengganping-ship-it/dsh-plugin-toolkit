# Google 登录 → 激活云端 AI 能力

使用你的 Google 账号注册以下服务，获取 API Key 填入 `.env` 即可。

## 1. fal.ai — ⭐ 首选 (VTON + 模特生成)

**注册时间：** 2 分钟（支持 Google 一键登录）
**免费额度：** 注册即送 $10 试用金，按需计费（约 $0.02-1/次调用）

步骤：
1. 访问 https://fal.ai
2. 点击 "Sign in with Google" → 授权
3. 进入 Dashboard → Profile → API Keys → 复制 Key
4. 填入 `.env` 的 `FAL_KEY=`

支持的模型：
- VTON 换装（fal-ai/clo-v）
- FLUX 模特/场景生成（fal-ai/flux）
- SDXL 图像生成（fal-ai/sdxl）
- 背景移除（fal-ai/imageutils）

## 2. Replicate — VTON 大模型

**注册时间：** 3 分钟
**免费额度：** 需信用卡（Visa/MC）验证，但试用免费

步骤：
1. 访问 https://replicate.com
2. Google 登录
3. 进入 Account Settings → API Tokens → Create Token
4. 填入 `.env` 的 `REPLICATE_API_TOKEN=`

## 3. ElevenLabs — AI 配音

**注册时间：** 2 分钟
**免费额度：** 每月 1 万字符免费

步骤：
1. 访问 https://elevenlabs.io
2. Google 登录 → Profile → API Keys → 复制
3. 填入 `.env` 的 `ELEVENLABS_API_KEY=`

## 4. SiliconFlow 国际站 — SDXL + DeepSeek

**注册时间：** 2 分钟
**免费额度：** 新用户 ￥14（支持微信/支付宝/Google 登录）

步骤：
1. 访问 https://siliconflow.cn
2. 登录 → API Keys → 创建
3. 填入 `.env` 的 `SILICONFLOW_API_KEY=`

## 5. DeepSeek — 文案生成

**注册时间：** 需手机号（国内）
**免费额度：** 注册送 ￥50

步骤：
1. 访问 https://platform.deepseek.com
2. 手机号注册 → API Keys → 创建
3. 填入 `.env` 的 `DEEPSEEAP_API_KEY=`

## 启动

写完 `.env` 后：
```bash
conda run -n idm python run.py
```

访问 http://localhost:8000 即可。

**优先级：fal.ai + ElevenLabs 两个免费额度足够测试第一笔单，10 分钟内可完成注册。**
