# Kimodo Product - 技术架构文档

## 1. 系统概述

**产品定位**：本地化、隐私优先的文本→3D动作生成引擎  
**核心能力**：输入自然语言描述，2-5秒内生成高质量3D人体/机器人动作序列  
**目标硬件**：NVIDIA RTX 3090/4090 (16GB+ VRAM)，推荐 Linux

## 2. 技术栈分层

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户交互层 (Presentation)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  Web GUI      │  │  REST API    │  │  WebSocket Stream        │  │
│  │  (Gradio/     │  │  (FastAPI)   │  │  (实时预览)               │  │
│  │   Three.js)   │  │              │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                        编排调度层 (Orchestration)                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Pipeline Orchestrator                           │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │   │
│  │  │ ASR     │→ │ LLM      │→ │ Motion   │→ │ Retargeting │  │   │
│  │  │ Module  │  │ Module   │  │ Module   │  │ Module      │  │   │
│  │  └─────────┘  └──────────┘  └──────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────┤
│                        推理引擎层 (Inference)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ whisper.cpp  │  │ llama.cpp    │  │ Kimodo (PyTorch)         │  │
│  │ (语音→文本)   │  │ (意图理解)    │  │ (扩散模型→3D动作)         │  │
│  │ C++ / Vulkan │  │ C++ / Vulkan │  │ Python / CUDA            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────┤
│                        数据持久层 (Storage)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  SQLite      │  │  File System │  │  Model Weights           │  │
│  │  (任务/历史)  │  │  (动作文件)   │  │  (GGUF / safetensors)    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. 多模态 Pipeline 设计

### 3.1 数据流（文本→动作 核心路径）

```
用户输入 (文本/语音)
    │
    ▼
[可选] whisper.cpp ──ASR──→ 文本
    │
    ▼
[可选] llama.cpp ──LLM──→ 结构化意图
    │  输出: {"action": "wave hand", "duration": 3.0, "style": "friendly"}
    │
    ▼
Kimodo Pipeline (Python)
    │  1. 文本编码 (CLIP/内部编码器)
    │  2. Root Denoiser → 全局轨迹
    │  3. Body Denoiser → 关节旋转
    │  4. 后处理 (平滑/约束)
    ▼
动作数据 (NPZ: root_translation + joint_rotations)
    │
    ▼
[可选] Retargeting → VRM / Unitree G1 / SMPL-X
    │
    ▼
输出: FBX / BVH / AMASS / MuJoCo CSV
```

### 3.2 模块间通信协议

```json
// Pipeline Request
{
  "request_id": "uuid",
  "input": {
    "type": "text|audio|structured",
    "content": "a person walks forward then picks up a box",
    "audio_base64": null
  },
  "parameters": {
    "duration_frames": 90,
    "fps": 30,
    "skeleton": "SOMA|SOMA-RP|Unitree-G1|SMPL-X",
    "denoising_steps": 1000,
    "seed": 42
  },
  "output_format": "npz|fbx|bvh|amass|mujoco"
}

// Pipeline Response
{
  "request_id": "uuid",
  "status": "success|error",
  "motion_data": {
    "root_translation": [[x,y,z], ...],
    "joint_rotations": [[[r11,r12,r13], ...], ...],
    "num_frames": 90,
    "fps": 30,
    "skeleton": "SOMA",
    "joint_names": ["pelvis", "left_hip", ...]
  },
  "output_file": "/data/output/motion_001.npz",
  "generation_time_ms": 3200,
  "metadata": {
    "model_version": "Kimodo-SOMA-RP-v1.1",
    "vram_peak_mb": 16800
  }
}
```

## 4. 性能与显存优化策略

| 优化手段 | 实现方式 | 预期收益 |
|---------|---------|---------|
| 模型量化 | Kimodo 使用 FP16/INT8 推理 | VRAM ↓ 40% |
| 显存复用 | whisper/llama 推理后释放 → Kimodo 加载 | 峰值 VRAM ↓ 30% |
| 批处理 | 多段文本合并推理 | 吞吐 ↑ 2x |
| 缓存 | 相同文本直接返回缓存结果 | 延迟 → 0 |
| 流式输出 | 动作帧逐步生成+传输 | 首帧延迟 ↓ 80% |

## 5. 技术风险与规避

| 风险 | 概率 | 影响 | 规避方案 |
|-----|------|------|---------|
| VRAM 不足 (16GB 卡) | 高 | 无法运行 | 提供 LowVRAM 模式 (分块推理) |
| 动作拼接生硬 | 中 | 体验差 | 引入动作混合/过渡帧算法 |
| Windows 兼容性 | 中 | 部署困难 | Docker 容器化 + 详细安装指南 |
| 模型权重下载失败 | 低 | 无法启动 | 镜像站 + 断点续传 + 本地缓存 |
| 长文本动作质量下降 | 中 | 效果差 | 自动分段 + 时间线编辑 |

## 6. 开发优先级

**P0 (MVP 必须)**:
- Kimodo 本地推理跑通
- 文本→动作 REST API
- 基础 Web UI (输入文本 → 下载动作文件)

**P1 (产品化)**:
- 语音输入 (whisper.cpp 集成)
- 3D 预览 (Three.js 渲染骨骼)
- 动作导出 (FBX/BVH)

**P2 (差异化)**:
- LLM 意图增强 (llama.cpp)
- 多骨架重定向
- 时间线编辑
- 批量生成
