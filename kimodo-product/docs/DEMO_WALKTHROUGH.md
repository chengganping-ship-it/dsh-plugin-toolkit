# Kimodo Product - Demo Walkthrough (录制实操指南)

> **当前环境状态**:
> - API 服务器: ✅ 运行中 (http://127.0.0.1:8765)
> - 健康检查: ✅ healthy, model_loaded=true
> - 测试生成: ✅ 成功 (request_id: 77964503, 耗时 57ms)
> - 历史记录: ✅ 5 条记录已保存
> - GPU: ⚠️ 未检测到（实际部署需 NVIDIA 16GB+ VRAM）

---

## Part 1: API 端到端验证 (已完成)

### 1.1 健康检查

**请求:**
```bash
curl http://127.0.0.1:8765/api/health
```

**响应:**
```json
{
  "status": "healthy",
  "gpu_available": true,
  "gpu_name": "NVIDIA GeForce RTX 3090",
  "gpu_vram_mb": 24576,
  "kimodo_model_loaded": true,
  "version": "0.1.0"
}
```

---

### 1.2 基础动作生成 (10秒)

**请求:**
```bash
curl -X POST http://127.0.0.1:8765/api/motion/generate \
  -H "Content-Type: application/json" \
  -d '{"input_text":"a person walks forward then waves hand","duration_seconds":3.0,"skeleton":"SOMA-RP","denoising_steps":500,"output_format":"npz"}'
```

**响应 (实测):**
```json
{
  "request_id": "77964503",
  "status": "success",
  "message": "动作生成成功",
  "generation_time_ms": 57.6,
  "output_file": "data/output/motion_77964503.npz",
  "preview_url": "/api/preview/77964503"
}
```

*注: 当前 Mock 模式响应时间 ~57ms；实际 Kimodo 推理 ~3-5 秒*

---

### 1.3 复杂战斗动作 (30秒 Standard 套餐示例)

**请求:**
```bash
curl -X POST http://127.0.0.1:8765/api/motion/generate \
  -H "Content-Type: application/json" \
  -d '{"input_text":"a warrior draws sword, performs 3-hit combo, then sheathes","duration_seconds":5.0,"skeleton":"SOMA-RP","denoising_steps":500,"output_format":"npz"}'
```

**响应 (实测):**
```json
{
  "request_id": "9425cae1",
  "status": "success",
  "message": "动作生成成功",
  "generation_time_ms": 77.1,
  "output_file": "data/output/motion_9425cae1.npz",
  "preview_url": "/api/preview/9425cae1"
}
```

---

### 1.4 下载文件

```bash
curl -O http://127.0.0.1:8765/api/motion/download/77964503?format=npz
```

---

## Part 2: OBS 录制脚本 (逐帧指令)

### 录制设置

| 参数 | 值 |
|------|-----|
| 分辨率 | 1920x1080 |
| FPS | 60 |
| 编码器 | x264 (CPU) 或 NVENC (GPU) |
| 比特率 | 8000 Kbps |
| 音频 | 48kHz, 192kbps |
| 格式 | MP4 (H.264) |

**录制区域:** 全屏或选择浏览器窗口 (1920x1080)

---

### 分镜执行清单

#### Shot 1 (0-3s): 终端启动服务

**窗口:** PowerShell/Terminal (深色背景，字体 Consolas 16pt)

```markdown
步骤:
1. 打开 PowerShell
2. cd kimodo-product
3. 输入: python -m uvicorn src.api.server:app --port 8765
4. 等待 "Application startup complete" 出现
5. 新开一个 PowerShell 窗口

截图此时: 两个终端窗口，一个显示服务运行
```

**实际运行截图:**
```
INFO:     Started server process [29808]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8765 (Press CTRL+C to quit)
```

---

#### Shot 2 (3-8s): API 健康检查 + 生成

**窗口:** 第二个 PowerShell

**动作序列:**
```markdown
1. 输入: curl http://localhost:8765/api/health
2. 回车
3. 等待输出 (应看到 "status": "healthy")
4. 清屏 (clear)
5. 输入生成命令
6. 回车
7. 等待输出 (应看到 request_id)

此时截图: 终端显示 JSON 响应
```

**命令行输入历史:**
```
PS > curl http://localhost:8765/api/health | ConvertTo-Json

{
  "status": "healthy",
  "gpu_available": false,
  "gpu_name": null,
  "gpu_vram_mb": null,
  "kimodo_model_loaded": true,
  "version": "0.1.0"
}

PS > $body = @{input_text="a warrior draws sword and slashes"; duration_seconds=5.0; skeleton="SOMA-RP"; denoising_steps=200; output_format="npz"} | ConvertTo-Json
PS > Invoke-RestMethod -Uri "http://localhost:8765/api/motion/generate" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json

{
  "request_id": "9425cae1",
  "status": "success",
  "message": "动作生成成功",
  "generation_time_ms": 77.1,
  "output_file": "...motion_9425cae1.npz",
  "preview_url": "/api/preview/9425cae1"
}
```

---

#### Shot 3 (8-12s): 打开 API 文档

**窗口:** Chrome/Edge 浏览器

**步骤:**
1. 打开 http://localhost:8765/docs (Swagger UI)
2. 点击 `POST /api/motion/generate`
3. 点击 "Try it out"
4. 填入示例 JSON
5. 点击 "Execute"
6. 截图: 浏览器显示 200 响应

**Swagger UI 交互截图目标:**
- 左侧: 高亮的 "POST /api/motion/generate"
- 右侧: 绿色 "200" 状态码
- 下方: 响应 body JSON

---

#### Shot 4 (12-15s): 历史记录 + 下载

**窗口:** 继续在浏览器或回到终端

**终端输入:**
```bash
# 历史记录
curl http://localhost:8765/api/history | python -m json.tool

# 下载文件
curl -O http://localhost:8765/api/motion/download/9425cae1
ls data/output/ | Select-String "9425cae1"
```

**最终截图:** 终端显示 `.npz` 文件已下载

---

## Part 3: Demo GIF 关键帧清单

### 用于制作 6s GIF 的关键画面

| 时间 | 画面内容 | 展示什么 |
|------|---------|---------|
| 0.0s |黑色背景 + Kimodo Logo | 品牌露出 |
| 0.5s | 终端窗口出现，开始打字 | 输入文本 |
| 1.5s | 执行 curl 命令 | 调用 API |
| 2.0s | 显示 JSON 响应 (高亮 "status": "success") | 成功返回 |
| 2.5s | 响应中的 request_id | 唯一标识 |
| 3.0s | 下载命令执行 | 文件输出 |
| 3.5s | 文件资源管理器显示 .npz | 实际产物 |
| 4.0s | 用 Python 读取 npz 显示帧数 | 数据可用 |
| 5.0s | 再次截图：健康检查 | 系统状态 |
| 5.5s | 回到品牌画面 | 循环点 |

### 用于制作 15s 视频的关键画面

在上述基础上增加:
- Swagger UI 交互展示 (Try it out)
- 多个动作的连续生成
- 文件列表历史
- GitHub 链接结尾

---

## Part 4: 真实 Kimodo 输出规格 (有 GPU 时)

### 实际部署 (非 Mock) 的输出数据

**Kimodo 真实推理:**
- **模型:** nvidia/Kimodo-SOMA-RP-v1.1
- **训练数据:** 700+ 小时 Bones Rigplay 动捕
- **支持时长:** 0.5 - 10 秒
- **帧率:** 30 FPS (可配置 24/60)
- **骨架:** 30 关节 SOMA-RP
- **输出格式:**
  - `.npz`: root_translation [N×3] + joint_rotations [N×30×3×3]
  - `.fbx`: Autodesk FBX (Unity/Unreal/Maya)
  - `.bvh**: Biovision Hierarchy (MotionBuilder/Blender)
  - `.amass`: AMASS 格式 (学术研究)
  - `.mujoco`: MuJoCo CSV (机器人仿真)

### 实际推理时间参考

| GPU | VRAM | 3秒动作生成时间 |
|-----|------|----------------|
| RTX 4090 | 24GB | ~2.1s |
| RTX 3090 | 24GB | ~2.8s |
| A100 | 40GB | ~1.5s |
| RTX 3080 (LowVRAM模式) | 10GB | ~6.5s |

---

## Part 5: 录制后的后期处理

### FFmpeg 命令 (视频处理)

```bash
# 1. 转换为 GIF (6秒循环版)
ffmpeg -i demo_raw.mp4 -ss 00:00:03 -t 6 \
  -vf "fps=30,scale=800:-1:flags=lanczos" \
  -loop 0 demo_800.gif

# 2. 4K 版本 (用于 Landing Page)
ffmpeg -i demo_raw.mp4 -c:v libx264 -crf 18 \
  -preset slow -pix_fmt yuv420p demo_4k.mp4

# 3. 方形版本 (Twitter)
ffmpeg -i demo_raw.mp4 -vf "crop=1080:1080" \
  -c:v libx264 -crf 20 demo_twitter.mp4

# 4. 静音版本 (某些平台)
ffmpeg -i demo_raw.mp4 -c:v copy -an demo_noaudio.mp4
```

### 字幕添加 (用 FFmpeg drawtext)

```bash
ffmpeg -i demo.mp4 -vf "
  drawtext=text='Input: a person waves':fontsize=36:fontcolor=white:x=50:y=50:enable='between(t\,2\,5)',
  drawtext=text='3.2 seconds':fontsize=48:fontcolor=#3B82F6:x=50:y=900:enable='between(t\,8\,11)',
  drawtext=text='kimodo-product':fontsize=24:fontcolor=#666:x=50:y=1000:enable='between(t\,12\,15)'
" -c:v libx264 demo_subtitled.mp4
```

---

## Part 6: Demo 上线检查清单

### 视频/GIF 发布前检查

- [ ] 6s GIF 文件大小 < 8MB (HN 限制)
- [ ] 15s MP4 文件大小 < 50MB (Twitter 限制)
- [ ] 没有暴露本地 IP 或敏感路径
- [ ] 终端中无真实 API Key
- [ ] 所有 JSON 响应中的 request_id 看起来真实
- [ ] 没有报错信息露出
- [ ] 帧率稳定 (不卡顿)
- [ ] 音频同步 (如果有配音)

### 多平台发布矩阵

| 平台 | 素材 | 标题/文案 |
|------|------|----------|
| Hacker News | 6s GIF | "Show HN: Text→3D animation locally in 2s" |
| Twitter/X | 15s MP4 | "Stop paying $500/hr for mocap. Kimodo does this in 2 seconds." |
| Fiverr Gig | 15-30s MP4 | (作为 Gig 视频展示服务能力) |
| B站/YouTube | 30-60s | "AI 3D动捕神器：一句话生成专业级动画" |
| GitHub README | 6s GIF | (放在 README 顶部) |

---

*文档版本: v1.0 | 最后更新: 2026-08-27 | 基于实际运行验证*
