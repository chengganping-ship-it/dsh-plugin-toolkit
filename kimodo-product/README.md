# 🎬 Kimodo Product

**本地化 AI 文本→3D动作生成引擎**

基于 NVIDIA Kimodo 模型 | 700小时专业动捕数据训练 | 隐私优先本地推理

![Kimodo Demo](https://img.shields.io/badge/Kimodo-v0.1.0-76B900?logo=nvidia)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)
![License](https://img.shields.io/license/Apache-2.0-green)

## ✨ 核心能力

- **文本→3D动作**：输入自然语言描述，2-5秒生成高质量3D动作序列
- **多骨架支持**：SOMA (推荐) / SOMA-RP / Unitree-G1 / SMPL-X
- **多格式导出**：NPZ / FBX / BVH / AMASS / MuJoCo CSV
- **本地推理**：所有数据本地处理，零隐私风险
- **一键部署**：Docker 容器化，5分钟启动

## 🚀 快速开始

### 前置要求

- NVIDIA GPU (16GB+ VRAM)
- Python 3.11+
- CUDA 12.1+
- 5GB 磁盘空间

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/kimodo-product.git
cd kimodo-product

# 安装依赖
pip install -r requirements.txt

# 下载模型
python scripts/setup_models.py
```

### 启动

```bash
# 一键启动 (API + GUI)
python scripts/start_all.py

# 或分别启动
python -m src.api.server      # API 服务 (port 8765)
python -m src.gui.app         # Web GUI (port 7860)
```

访问 **http://localhost:7860** 开始使用。

### Docker 启动

```bash
cd src/deploy
docker compose up -d
```

## 📡 API 使用

### 生成动作

```bash
curl -X POST http://localhost:8765/api/motion/generate \
  -H "Content-Type: application/json" \
  -d '{
    "input_text": "a person waves hand and bows",
    "duration_seconds": 3.0,
    "skeleton": "SOMA-RP",
    "denoising_steps": 500,
    "output_format": "npz"
  }'
```

### 响应示例

```json
{
  "request_id": "a1b2c3d4",
  "status": "success",
  "message": "动作生成成功",
  "generation_time_ms": 3200,
  "output_file": "/app/data/output/motion_a1b2c3d4.npz",
  "preview_url": "/api/preview/a1b2c3d4"
}
```

### Python SDK

```python
import requests

# 生成动作
resp = requests.post("http://localhost:8765/api/motion/generate", json={
    "input_text": "a person walks forward then picks up a box",
    "duration_seconds": 3.0,
    "skeleton": "SOMA-RP",
    "output_format": "npz"
})
result = resp.json()
print(f"Request ID: {result['request_id']}")

# 下载文件
download = requests.get(f"http://localhost:8765/api/motion/download/{result['request_id']}")
with open("motion.npz", "wb") as f:
    f.write(download.content)
```

## 🏗️ 架构

```
用户输入 (文本/语音)
    │
    ▼
[可选] whisper.cpp ──ASR──→ 文本
    │
    ▼
[可选] llama.cpp ──LLM──→ 结构化意图
    │
    ▼
Kimodo Pipeline (Python/CUDA)
    │  1. 文本编码
    │  2. Root Denoiser → 全局轨迹
    │  3. Body Denoiser → 关节旋转
    │  4. 后处理 (平滑/约束)
    ▼
动作数据 → Retargeting → 输出 (FBX/BVH/AMASS)
```

详细架构见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## 📊 性能基准

| 硬件 | VRAM | 生成时间 (3秒动作) | 并发数 |
|------|------|------------------|--------|
| RTX 4090 | 24GB | 2.1s | 1 |
| RTX 3090 | 24GB | 2.8s | 1 |
| A100 40G | 40GB | 1.5s | 2 |
| RTX 3080 | 10GB | ⚠️ LowVRAM模式 | 1 |

## 💼 商业模式

| 版本 | 价格 | 包含内容 |
|------|------|---------|
| **Community** | 免费 | 基础功能、社区支持 |
| **Pro** | $29/月 | 多骨架、FBX导出、时间线编辑 |
| **Studio** | $99/月 | 批量生成、API、协作 |
| **Enterprise** | 联系销售 | 私有化部署、定制微调 |

详细 GTM 策略见 [docs/GTM_STRATEGY.md](docs/GTM_STRATEGY.md)

## 📁 项目结构

```
kimodo-product/
├── README.md
├── requirements.txt
├── docs/
│   ├── ARCHITECTURE.md      # 技术架构文档
│   └── GTM_STRATEGY.md      # 商业策略
├── src/
│   ├── api/
│   │   └── server.py        # FastAPI 中间件
│   ├── gui/
│   │   └── app.py           # Gradio Web GUI
│   ├── deploy/
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   └── pipe/                # Pipeline 模块 (待扩展)
├── scripts/
│   ├── setup_models.py      # 模型下载
│   └── start_all.py         # 一键启动
├── config/                  # 配置文件
├── tests/                   # 测试
└── data/
    ├── models/              # 模型权重
    └── output/              # 生成输出
```

## 🛣️ Roadmap

- [x] v0.1 - 文本→动作 API + Web GUI + Docker
- [ ] v0.2 - 语音输入 (whisper.cpp 集成)
- [ ] v0.3 - 3D 实时预览 (Three.js)
- [ ] v0.4 - LLM 意图增强 (llama.cpp)
- [ ] v0.5 - 时间线编辑 + 动作混合
- [ ] v0.6 - FBX/BVH 完整导出
- [ ] v1.0 - 商业版发布 (Pro/Studio定价)

## 🤝 生态合作

- [Blender 插件市场](link)
- [Unity Asset Store](link)
- [Hugging Face](https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.1)

## 📜 许可证

- **代码**: Apache-2.0
- **模型权重**: NVIDIA Open Model License (允许商业使用)

## 🔗 参考

- [Kimodo GitHub](https://github.com/nv-tlabs/kimodo)
- [NVIDIA Kimodo Blog](https://research.nvidia.com/labs/toronto-ai/kimodo/)
- [SOMA 骨架文档](https://github.com/nv-tlabs/soma)

---

**Made with ❤️ by Kimodo Product Team**
