# Hacker News 首发公关稿 (Show HN)

> **发布日期**: Day 1 冷启动  
> **目标板块**: Show HN (https://news.ycombinator.com/showhn.html)  
> **投稿时间**: 太平洋时间周二/周三 8:00-10:00 AM EST (流量高峰)

---

## 帖子标题 (Title)

```
Show HN: Kimodo – Generate 3D character animations from text, entirely on your machine
```

---

## 帖子正文 (Self-post 内容)

---

**URL:** https://github.com/your-org/kimodo-product

After seeing NVIDIA's Kimodo model drop last month (text-to-3D-motion diffusion, 700 hours of mocap data), I wanted to run it locally without paying per-API-call to some cloud provider.

So I built an open-source wrapper that:
- Runs Kimodo offline (no data leaves your machine)
- Wraps the pipeline in a FastAPI server with a simple Gradio UI
- Supports multiple skeleton formats (SOMA-RP, Unitree-G1, SMPL-X)
- Exports to FBX/BVH/AMASS/MuJoCo so it drops into existing animation workflows

The hook: type "a warrior draws their sword and performs a three-hit combo" and get back a 30-frame animation in approximately 3 seconds. No keyframing, no mocap suit, no per-API-call bill.

**Why this exists instead of using NVIDIA's web demo:**

1. **No API dependency** - Studios with unreleased IP can't send character data to cloud endpoints.
2. **No rate limits** - Generate 500 variations of a walk cycle if you want. GPU is yours.
3. **Pipeline integration** - REST API + WebSocket means you can call it from Unity/Unreal/Blender scripts directly.
4. **Cost reversal** - For moderate-to-heavy usage, hardware depreciation beats subscription costs within 6 months.

**Current state:**

MVP. Text-to-motion works. Voice input (whisper.cpp) and LLM intent parsing (llama.cpp) are stubbed but not wired yet. The Kimodo model weights are downloaded via a separate script (NVIDIA's license). Runs on RTX 3090 or better (16GB+ VRAM). LowVRAM mode for 10GB cards coming in v0.2.

**Repo:** https://github.com/your-org/kimodo-product

**Try it:**
```
git clone https://github.com/your-org/kimodo-product
cd kimodo-product
python scripts/setup_models.py
pip install -r requirements.txt
python scripts/start_all.py
# open http://localhost:7860
```

Curious what you all think - especially from anyone in gamedev or VTuber space. Is the "local-first AI motion generation" thesis compelling or are cloud APIs good enough?

---

## 评论回复模板 (Comment Responses)

### 回应 "Can't you just use Plask / DeepMotion / RADiCAD?"

Those are great products but they are cloud-as-a-service. The use case here is specifically: (1) studios with unreleased IP they cannot upload externally, (2) developers in regions with unreliable API access, (3) high-volume users where subscription costs exceed hardware payback within months. If none of those apply, the cloud options are probably the better developer experience.

### 回应 "What about model quality?"

Quality is identical to NVIDKimodo - we are running the exact same weights, just locally. The model was trained on 700 hours of Bones Rigplay mocap data. For complex multi-stage actions we chain multiple generations with our own blending pass.

### 回应 "I do not have a 16GB GPU"

You have a few options: our LowVRAM mode splits inference across time chunks (3x slower, works on 10GB), or for basic actions our quantized 8GB mode is coming in v0.2. Honestly, a used RTX 3090 is ~$400 on eBay and pays for itself vs cloud API in 3 months at moderate volume.

### 回应 "Is this legal commercially?"

Kimodo weights are under NVIDIA Open Model License - commercial use is explicitly allowed. The code is Apache-2.0.

### 回应 "The UI looks ugly"

Hah - on the list. v0.2 uses Three.js for real-time 3D preview instead of the Gradio proto. PR welcome. The API is what matters right now though.

---

## 发帖策略 (Launch Timeline)

| Time | Action |
|------|--------|
| T-24h | Teaser: Twitter/X 30s demo video (no product named) with text "Something is coming" |
| T-12h | Ensure README is perfect: animated GIF, Quick Start under 5 min, complete FAQ |
| T-2h | Check HN front page vibe: if it is all-AI day, wait for another window |
| T-0 (post) | Tuesday 9:00 AM Pacific. Reply to first 3 comments immediately (comment velocity = ranking algo) |
| T+30min | Cross-post to Reddit r/LocalLLaMA and r/gamedev (cross-pollinate without looking spammy) |
| T+2h | Monitor GitHub star velocity, track hourly |
| T+6h | If top 20: share in Discord/Telegram community for momentum |
| T+24h | Publish follow-up tech blog "Building a Local Motion Pipeline" |

---

## 数据指标 (Success Metrics)

| Metric | Target | Trigger Action |
|--------|--------|---------------|
| HN top 20 | Reach front page top 20 | Success, launch Phase 2 Twitter storm |
| GitHub Stars 24h | 500+ | Request Hacker News Digest inclusion |
| GitHub Stars 1wk | 1000+ | Pitch to Hacker News Newsletter |
| Issues 24h | 10+ | Community has real engagement, extract FAQ |
| Contributors 1wk | 5+ | Community believes in direction |
| Fiverr inquiries | 5+ | Validate commercial demand exists |

---

## Reddit 交叉发布模板

### r/LocalLLaMA

**Title:** [P] Kimodo wrapper: run NVIDIA text-to-motion model locally plus API  
**Body:** Similar to HN post but shorter. Add: "Would love feedback from the local LLM community - does motion generation use case make sense here?"

### r/gamedev

**Title:** Open-source text-to-3D animation using NVIDIA Kimodo (runs offline)  
**Body:** Focus on gamedev pain point (keyframe cost, mocap rental) plus direct animation workflow value.

---

## Twitter/X Thread 模板 (24 小时后发)

We just launched Kimodo Product on HN!

3 facts:
1. Text to 3D animation in 2 seconds, runs offline
2. We tested it: 5,000 animations/mo = $350+ on cloud API. Your GPU is already paid off.
3. Apache 2.0. Commercial-friendly.

3 questions:
1. What format do you need? (FBX/BVH/AMASS/glTF)
2. What game engine? (Unity/Unreal/Godot/Blender)
3. What action type are you struggling with?

Drop your answer, we will prioritize it.

github.com/your-org/kimodo-product

---

*Last updated: 2026-08-27*
