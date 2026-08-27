"""
VLX-Seek Visual Semantic Referee Server
基于 FastAPI + 视觉语言模型的"视觉语义裁判服务器"
支持 Grounding DINO / Florence-2 / VLX-Seek 模型
当模型不可用时自动降级为 Mock 模式（用于 Demo 验证）
"""

import base64
import io
import json
import logging
import random
import time
import uuid
from typing import List, Optional

import numpy as np
from PIL import Image
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# ============================================================
# 数据模型
# ============================================================

class GroundingRequest(BaseModel):
    image_base64: str          # Base64 编码的图像
    prompt: str                # 文本 Prompt（如 "red cylinder"）
    threshold: float = 0.3     # 置信度阈值


class BoundingBox(BaseModel):
    x: float                   # 左上角 x (归一化 0-1)
    y: float                   # 左上角 y (归一化 0-1)
    width: float              # 宽度 (归一化 0-1)
    height: float             # 高度 (归一化 0-1)
    confidence: float         # 置信度
    label: str                # 识别标签


class GroundingResponse(BaseModel):
    request_id: str
    boxes: List[BoundingBox]
    inference_time_ms: float
    model_used: str
    prompt: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    mode: str                 # "real" or "mock"


# ============================================================
# 模型适配器接口
# ============================================================

class BaseGroundingModel:
    """视觉定位模型基类"""

    def __init__(self, name: str):
        self.name = name

    def predict(self, image: Image.Image, prompt: str, threshold: float) -> List[BoundingBox]:
        raise NotImplementedError


class MockGroundingModel(BaseGroundingModel):
    """
    Mock 模型 - 无需 GPU 即可运行
    根据 prompt 关键词生成模拟的边界框结果
    用于前端 Demo 验证和开发阶段
    """

    # 预定义的"模拟对象库" - 按场景分类
    MOCK_OBJECTS = {
        "room": [
            {"label": "chair", "x": 0.15, "y": 0.55, "w": 0.18, "h": 0.35},
            {"label": "table", "x": 0.45, "y": 0.60, "w": 0.30, "h": 0.25},
            {"label": "lamp", "x": 0.80, "y": 0.20, "w": 0.10, "h": 0.40},
            {"label": "bookshelf", "x": 0.05, "y": 0.15, "w": 0.20, "h": 0.60},
            {"label": "window", "x": 0.60, "y": 0.10, "w": 0.25, "h": 0.35},
            {"label": "blue alarm clock", "x": 0.70, "y": 0.45, "w": 0.08, "h": 0.10},
            {"label": "cat", "x": 0.30, "y": 0.75, "w": 0.12, "h": 0.15},
            {"label": "plant", "x": 0.90, "y": 0.55, "w": 0.08, "h": 0.30},
            {"label": "painting", "x": 0.35, "y": 0.05, "w": 0.20, "h": 0.20},
            {"label": "coffee cup", "x": 0.55, "y": 0.50, "w": 0.05, "h": 0.08},
        ],
        "outdoor": [
            {"label": "car", "x": 0.20, "y": 0.50, "w": 0.35, "h": 0.30},
            {"label": "person", "x": 0.60, "y": 0.40, "w": 0.12, "h": 0.50},
            {"label": "tree", "x": 0.80, "y": 0.20, "w": 0.18, "h": 0.70},
            {"label": "red cylinder", "x": 0.45, "y": 0.55, "w": 0.08, "h": 0.25},
            {"label": "traffic light", "x": 0.10, "y": 0.10, "w": 0.05, "h": 0.20},
            {"label": "bicycle", "x": 0.70, "y": 0.60, "w": 0.15, "h": 0.25},
        ],
        "default": [
            {"label": "object_a", "x": 0.25, "y": 0.30, "w": 0.20, "h": 0.25},
            {"label": "object_b", "x": 0.60, "y": 0.40, "w": 0.15, "h": 0.30},
            {"label": "object_c", "x": 0.40, "y": 0.65, "w": 0.25, "h": 0.20},
        ]
    }

    # 颜色关键词映射
    COLOR_KEYWORDS = ["red", "blue", "green", "yellow", "orange", "purple", "white", "black", "pink"]

    # 形状/物体关键词映射
    OBJECT_KEYWORDS = [
        "cylinder", "chair", "table", "lamp", "clock", "cat", "plant",
        "car", "person", "tree", "cup", "book", "bottle", "phone",
        "laptop", "mouse", "keyboard", "monitor", "door", "window",
        "shelf", "painting", "sofa", "bed", "bicycle", "traffic light"
    ]

    def __init__(self):
        super().__init__("MockGroundingModel")

    def predict(self, image: Image.Image, prompt: str, threshold: float) -> List[BoundingBox]:
        prompt_lower = prompt.lower()
        boxes = []

        # 根据 prompt 确定场景类型
        scene = "default"
        if any(w in prompt_lower for w in ["room", "indoor", "furniture", "home"]):
            scene = "room"
        elif any(w in prompt_lower for w in ["outdoor", "street", "city", "camera"]):
            scene = "outdoor"

        candidates = self.MOCK_OBJECTS[scene]

        # 按关键词匹配
        for obj in candidates:
            label_lower = obj["label"].lower()
            match_score = 0

            # 颜色匹配
            for color in self.COLOR_KEYWORDS:
                if color in prompt_lower and color in label_lower:
                    match_score += 2

            # 物体类型匹配
            for keyword in self.OBJECT_KEYWORDS:
                if keyword in prompt_lower and keyword in label_lower:
                    match_score += 3

            # 完全包含匹配
            if label_lower in prompt_lower or any(w in label_lower for w in prompt_lower.split() if len(w) > 3):
                match_score += 1

            if match_score > 0:
                confidence = min(0.5 + match_score * 0.1 + random.uniform(0, 0.2), 0.99)
                if confidence >= threshold:
                    boxes.append(BoundingBox(
                        x=obj["x"] + random.uniform(-0.02, 0.02),
                        y=obj["y"] + random.uniform(-0.02, 0.02),
                        width=obj["w"],
                        height=obj["h"],
                        confidence=round(confidence, 3),
                        label=obj["label"]
                    ))

        # 如果没有匹配到任何对象，随机返回 1-2 个（保持 Demo 可玩性）
        if not boxes:
            random_obj = random.choice(candidates)
            boxes.append(BoundingBox(
                x=random_obj["x"] + random.uniform(-0.03, 0.03),
                y=random_obj["y"] + random.uniform(-0.03, 0.03),
                width=random_obj["w"],
                height=random_obj["h"],
                confidence=round(random.uniform(0.35, 0.65), 3),
                label=random_obj["label"]
            ))

        # 按置信度排序
        boxes.sort(key=lambda b: b.confidence, reverse=True)
        return boxes


class GroundingDINOModel(BaseGroundingModel):
    """
    Grounding DINO 模型适配器
    需要安装: pip install torch torchvision transformers
    模型自动从 HuggingFace 下载
    """

    def __init__(self, model_id: str = "IDEA-Research/grounding-dino-tiny"):
        super().__init__("GroundingDINO")
        self.model_id = model_id
        self.model = None
        self.processor = None
        self._load_model()

    def _load_model(self):
        try:
            import torch
            from transformers import AutoModelForZeroShotObjectDetection, AutoProcessor

            logger.info(f"Loading Grounding DINO model: {self.model_id}")
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {self.device}")

            self.processor = AutoProcessor.from_pretrained(self.model_id)
            self.model = AutoModelForZeroShotObjectDetection.from_pretrained(self.model_id)
            self.model.to(self.device)
            self.model.eval()
            logger.info("Grounding DINO model loaded successfully")
        except Exception as e:
            logger.warning(f"Failed to load Grounding DINO: {e}")
            raise RuntimeError(f"Grounding DINO 加载失败: {e}")

    @torch.no_grad()
    def predict(self, image: Image.Image, prompt: str, threshold: float) -> List[BoundingBox]:
        import torch

        # 将 prompt 转换为以句号分隔的短语格式
        text = prompt.strip()
        if not text.endswith('.'):
            text += '.'

        inputs = self.processor(images=image, text=text, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        outputs = self.model(**inputs)

        results = self.processor.post_process_grounded_object_detection(
            outputs,
            inputs['input_ids'],
            box_threshold=threshold,
            text_threshold=threshold,
            target_sizes=[image.size[::-1]]
        )[0]

        boxes = []
        for box, score, label in zip(results["boxes"], results["scores"], results["labels"]):
            x1, y1, x2, y2 = box.tolist()
            img_w, img_h = image.size
            boxes.append(BoundingBox(
                x=round(x1 / img_w, 4),
                y=round(y1 / img_h, 4),
                width=round((x2 - x1) / img_w, 4),
                height=round((y2 - y1) / img_h, 4),
                confidence=round(score.item(), 3),
                label=label
            ))

        return boxes


# ============================================================
# 模型管理器
# ============================================================

class ModelManager:
    """模型管理器 - 自动选择和加载模型"""

    def __init__(self):
        self.model: Optional[BaseGroundingModel] = None
        self.mode = "mock"
        self._initialize()

    def _initialize(self):
        # 尝试加载真实模型（按优先级）
        model_candidates = [
            ("grounding-dino", self._try_load_grounding_dino),
            ("florence-2", self._try_load_florence2),
        ]

        for name, loader in model_candidates:
            try:
                self.model = loader()
                self.mode = "real"
                logger.info(f"Successfully loaded model: {name}")
                return
            except Exception as e:
                logger.info(f"Could not load {name}: {e}")

        # 全部失败，使用 Mock
        logger.info("No real model available, falling back to Mock mode")
        self.model = MockGroundingModel()
        self.mode = "mock"

    def _try_load_grounding_dino(self) -> GroundingDINOModel:
        return GroundingDINOModel()

    def _try_load_florence2(self) -> BaseGroundingModel:
        # Florence-2 适配器可以在此扩展
        raise NotImplementedError("Florence-2 adapter not yet implemented")

    def predict(self, image: Image.Image, prompt: str, threshold: float) -> tuple:
        """返回 (boxes, model_name, inference_time_ms)"""
        start = time.time()
        boxes = self.model.predict(image, prompt, threshold)
        elapsed = (time.time() - start) * 1000
        return boxes, self.model.name, elapsed


# ============================================================
# FastAPI 应用
# ============================================================

app = FastAPI(
    title="VLX-Seek Referee Server",
    description="视觉语义裁判服务器 - AI Native 游戏原型验证",
    version="1.0.0"
)

# CORS 配置 - 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局模型管理器
model_manager = ModelManager()


def decode_base64_image(base64_str: str) -> Image.Image:
    """解码 Base64 图像数据"""
    try:
        # 移除 data URL 前缀
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        image_data = base64.b64decode(base64_str)
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"图像解码失败: {str(e)}")


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """健康检查端点"""
    return HealthResponse(
        status="healthy",
        model_loaded=model_manager.model is not None,
        model_name=model_manager.model.name if model_manager.model else "none",
        mode=model_manager.mode
    )


@app.post("/api/grounding", response_model=GroundingResponse)
async def grounding(request: GroundingRequest):
    """
    视觉语义定位 API

    - **image_base64**: Base64 编码的图像
    - **prompt**: 文本描述（如 "red cylinder"）
    - **threshold**: 置信度阈值 (默认 0.3)

    返回检测到的目标边界框列表
    """
    if not request.image_base64:
        raise HTTPException(status_code=400, detail="缺少图像数据")
    if not request.prompt:
        raise HTTPException(status_code=400, detail="缺少 prompt")

    image = decode_base64_image(request.image_base64)
    boxes, model_name, inference_time = model_manager.predict(
        image, request.prompt, request.threshold
    )

    return GroundingResponse(
        request_id=str(uuid.uuid4())[:8],
        boxes=boxes,
        inference_time_ms=round(inference_time, 2),
        model_used=model_name,
        prompt=request.prompt
    )


@app.post("/api/verify-selection")
async def verify_selection(request: dict):
    """
    验证玩家的框选区域是否包含目标

    - **image_base64**: 原始图像
    - **prompt**: 目标描述
    - **selection**: 玩家框选的归一化坐标 {x, y, width, height}

    返回是否命中目标
    """
    image_base64 = request.get("image_base64", "")
    prompt = request.get("prompt", "")
    selection = request.get("selection", {})
    threshold = request.get("threshold", 0.3)

    if not image_base64 or not prompt:
        raise HTTPException(status_code=400, detail="缺少必要参数")

    image = decode_base64_image(image_base64)
    boxes, model_name, inference_time = model_manager.predict(image, prompt, threshold)

    # 计算玩家选择区域与检测框的 IoU
    sel_x = selection.get("x", 0)
    sel_y = selection.get("y", 0)
    sel_w = selection.get("width", 0)
    sel_h = selection.get("height", 0)

    hit = False
    best_iou = 0
    best_box = None

    for box in boxes:
        iou = _compute_iou(
            (sel_x, sel_y, sel_w, sel_h),
            (box.x, box.y, box.width, box.height)
        )
        if iou > best_iou:
            best_iou = iou
            best_box = box
        if iou > 0.3:  # IoU > 0.3 视为命中
            hit = True

    return {
        "hit": hit,
        "iou": round(best_iou, 4),
        "selection": selection,
        "detected_boxes": [b.model_dump() for b in boxes],
        "best_match": best_box.model_dump() if best_box else None,
        "inference_time_ms": round(inference_time, 2),
        "model_used": model_name
    }


def _compute_iou(box_a: tuple, box_b: tuple) -> float:
    """计算两个边界框的 IoU"""
    ax1, ay1, aw, ah = box_a
    bx1, by1, bw, bh = box_b
    ax2, ay2 = ax1 + aw, ay1 + ah
    bx2, by2 = bx1 + bw, by1 + bh

    inter_x1 = max(ax1, bx1)
    inter_y1 = max(ay1, by1)
    inter_x2 = min(ax2, bx2)
    inter_y2 = min(ay2, by2)

    if inter_x2 <= inter_x1 or inter_y2 <= inter_y1:
        return 0.0

    inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
    area_a = aw * ah
    area_b = bw * bh
    union_area = area_a + area_b - inter_area

    return inter_area / union_area if union_area > 0 else 0.0


@app.get("/")
async def root():
    return {"message": "VLX-Seek Referee Server", "docs": "/docs", "health": "/api/health"}


# ============================================================
# 启动入口
# ============================================================

if __name__ == "__main__":
    import uvicorn

    print("=" * 60)
    print("  VLX-Seek Visual Semantic Referee Server")
    print("  视觉语义裁判服务器")
    print("=" * 60)
    print(f"  Model: {model_manager.model.name if model_manager.model else 'N/A'}")
    print(f"  Mode:  {model_manager.mode}")
    print(f"  URL:   http://localhost:8765")
    print(f"  Docs:  http://localhost:8765/docs")
    print("=" * 60)

    uvicorn.run(app, host="0.0.0.0", port=8765, log_level="info")
