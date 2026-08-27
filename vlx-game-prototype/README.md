# VLX-Seek AI Native Game Prototype

基于端侧视觉语言模型的"AI Native"游戏概念验证原型。包含一个 FastAPI 裁判服务器和三个核心玩法 Demo。

## 项目结构

```
vlx-game-prototype/
├── services/
│   └── vlx-referee/
│       └── server.py          # FastAPI 裁判服务器
├── public/
│   ├── index.html             # 前端页面
│   └── demo.js                # 交互逻辑
├── requirements.txt           # Python 依赖
├── package.json               # npm 配置
├── start_server.py            # 一键启动脚本
└── README.md
```

## 快速启动

### 方式一：一键启动（推荐）

```bash
python start_server.py
```

然后访问 http://localhost:3000

### 方式二：分别启动

**终端 1 - 启动后端服务器：**
```bash
pip install -r requirements.txt
python services/vlx-referee/server.py
```

**终端 2 - 启动前端：**
```bash
# 使用 Python 内置 HTTP 服务器
cd public && python -m http.server 3000

# 或使用 npx
npx serve public -l 3000
```

访问 http://localhost:3000

## API 接口

### POST /api/grounding
视觉语义定位 - 接收图像和文本 Prompt，返回目标边界框。

**请求：**
```json
{
    "image_base64": "base64编码的图像",
    "prompt": "red cylinder",
    "threshold": 0.3
}
```

**响应：**
```json
{
    "request_id": "abc12345",
    "boxes": [
        {
            "x": 0.45,
            "y": 0.55,
            "width": 0.08,
            "height": 0.25,
            "confidence": 0.85,
            "label": "red cylinder"
        }
    ],
    "inference_time_ms": 12.5,
    "model_used": "MockGroundingModel",
    "prompt": "red cylinder"
}
```

### POST /api/verify-selection
验证玩家框选区域是否包含目标。

### GET /api/health
健康检查。

## 三个核心玩法

### Demo 1: 异常审查员 (Anomaly Inspector)
- 在复杂场景中找出"不属于这里"的物体
- 鼠标拖拽框选，提交审查
- 命中目标得分，失败触发画面故障特效

### Demo 2: 言灵黑客 (Word Spirit Hacker)
- 摄像头 AR 寻宝
- 实时检测并锁定目标物体
- 锁定 2 秒即收集成功

### Demo 3: 语义附身 (Semantic Possession)
- 输入文字指令瞬移到目标物体
- 摄像机视角缩放 + 闪光特效
- 完成"附身"视觉反馈

## 模型支持

| 模型 | 状态 | 说明 |
|------|------|------|
| MockGroundingModel | ✅ 默认 | 无需 GPU，关键词匹配模拟 |
| Grounding DINO | 🔧 可选 | 需安装 torch + transformers |
| Florence-2 | 🔧 可选 | 可扩展 |
| VLX-Seek | 🔧 目标 | 端侧 VLM，需适配接入 |

### 启用真实模型

取消 `requirements.txt` 中的注释安装依赖：
```bash
pip install torch torchvision transformers
```

服务器会自动检测并加载可用模型。

## 技术栈

- **后端**: FastAPI + Pillow + NumPy
- **前端**: 原生 HTML5 + Canvas + Vanilla JS
- **模型**: Grounding DINO / Florence-2 / VLX-Seek (via adapter)
- **通信**: REST API + Base64 图像传输

## 开发说明

- 坐标系统：所有边界框使用归一化坐标 (0-1)
- 置信度阈值：默认 0.3，可调
- IoU 计算：用于验证框选准确性
- CORS：已开启，支持跨域调用
