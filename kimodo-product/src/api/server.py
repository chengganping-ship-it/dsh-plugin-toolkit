"""
Kimodo Product - FastAPI 中间件
提供 REST API + WebSocket 接口，调度 Kimodo 推理管道
"""

import uuid
import time
import json
from pathlib import Path
from typing import Optional, Literal
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel, Field

# ============ 配置 ============
DATA_DIR = Path(__file__).parent.parent.parent / "data"
OUTPUT_DIR = DATA_DIR / "output"
MODEL_DIR = DATA_DIR / "models"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============ 数据模型 ============
class MotionRequest(BaseModel):
    """动作生成请求"""
    input_text: str = Field(..., description="动作描述文本", example="a person waves hand and bows")
    duration_seconds: float = Field(3.0, ge=0.5, le=10.0, description="动作持续时间(秒)")
    skeleton: Literal["SOMA", "SOMA-RP", "Unitree-G1", "SMPL-X"] = Field("SOMA-RP", description="目标骨架")
    denoising_steps: int = Field(500, ge=50, le=1000, description="去噪步数 (越多越慢但越平滑)")
    seed: Optional[int] = Field(None, description="随机种子")
    output_format: Literal["npz", "fbx", "bvh", "amass", "mujoco"] = Field("npz", description="输出格式")

class MotionResponse(BaseModel):
    """动作生成响应"""
    request_id: str
    status: str
    message: str
    generation_time_ms: Optional[float] = None
    output_file: Optional[str] = None
    preview_url: Optional[str] = None

class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    gpu_available: bool
    gpu_name: Optional[str] = None
    gpu_vram_mb: Optional[int] = None
    kimodo_model_loaded: bool
    version: str = "0.1.0"

# ============ Pipeline 核心 ============
class KimodoPipeline:
    """Kimodo 推理管道封装"""

    def __init__(self):
        self.model = None
        self.device = None
        self.model_loaded = False
        self.gpu_available = False
        self._check_gpu()

    def _check_gpu(self):
        """检测 GPU 可用性"""
        try:
            import torch
            self.gpu_available = torch.cuda.is_available()
            if self.gpu_available:
                self.gpu_name = torch.cuda.get_device_name(0)
                self.gpu_vram_mb = torch.cuda.get_device_properties(0).total_mem // (1024**2)
                self.device = "cuda"
            else:
                self.device = "cpu"
        except ImportError:
            self.gpu_available = False
            self.device = "cpu"

    def load_model(self, model_path: Optional[Path] = None):
        """加载 Kimodo 模型"""
        try:
            # 实际实现会导入 kimodo 并加载权重
            # from kimodo import KimodoModel
            # self.model = KimodoModel.from_pretrained(model_path or "nvidia/Kimodo-SOMA-RP-v1.1")
            # self.model.to(self.device)
            self.model_loaded = True
            return True
        except Exception as e:
            self.model_loaded = False
            raise RuntimeError(f"模型加载失败: {e}")

    def generate(self, request: MotionRequest) -> dict:
        """执行动作生成"""
        start_time = time.time()

        if not self.model and not self.model_loaded:
            raise RuntimeError("模型未加载，请先调用 /api/model/load")

        # === Mock 实现 (用于演示和开发阶段) ===
        import numpy as np
        num_frames = int(request.duration_seconds * 30)
        num_joints = 30  # SOMA 骨架

        # 生成模拟动作数据（实际部署时替换为 Kimodo 推理）
        root_trans = np.random.randn(num_frames, 3).cumsum(axis=0) * 0.01
        joint_rots = np.random.randn(num_frames, num_joints, 3, 3) * 0.1
        # 正交化旋转矩阵
        for i in range(num_frames):
            for j in range(num_joints):
                u, _, vh = np.linalg.svd(joint_rots[i, j])
                joint_rots[i, j] = u @ vh

        # 保存输出
        request_id = str(uuid.uuid4())[:8]
        output_path = OUTPUT_DIR / f"motion_{request_id}.{request.output_format}"

        if request.output_format == "npz":
            np.savez(
                output_path,
                root_translation=root_trans,
                joint_rotations=joint_rots,
                fps=30,
                skeleton=request.skeleton,
                text=request.input_text
            )
        else:
            np.savez(
                OUTPUT_DIR / f"motion_{request_id}.npz",
                root_translation=root_trans,
                joint_rotations=joint_rots,
                fps=30,
                skeleton=request.skeleton
            )

        elapsed_ms = (time.time() - start_time) * 1000

        return {
            "request_id": request_id,
            "status": "success",
            "generation_time_ms": elapsed_ms,
            "output_file": str(output_path),
            "num_frames": num_frames,
            "preview_url": f"/api/preview/{request_id}"
        }

# ============ FastAPI 应用 ============
pipeline: Optional[KimodoPipeline] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    global pipeline
    pipeline = KimodoPipeline()
    try:
        pipeline.load_model()
        print("✅ Kimodo 模型自动加载成功")
    except Exception as e:
        print(f"⚠️ 模型未自动加载: {e}")
        print("   请先运行: python scripts/setup_models.py")
    yield
    pipeline = None

app = FastAPI(
    title="Kimodo Product API",
    description="本地化文本→3D动作生成引擎",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ API 端点 ============

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """健康检查"""
    return HealthResponse(
        status="healthy" if pipeline else "initializing",
        gpu_available=pipeline.gpu_available if pipeline else False,
        gpu_name=getattr(pipeline, 'gpu_name', None) if pipeline else None,
        gpu_vram_mb=getattr(pipeline, 'gpu_vram_mb', None) if pipeline else None,
        kimodo_model_loaded=pipeline.model_loaded if pipeline else False
    )

def get_pipeline():
    """依赖注入：获取 pipeline 实例"""
    if pipeline is None:
        raise HTTPException(status_code=503, detail="Pipeline 未初始化")
    if not pipeline.model_loaded:
        raise HTTPException(status_code=503, detail="模型未加载，请先调用 POST /api/model/load")
    return pipeline

@app.post("/api/motion/generate", response_model=MotionResponse)
async def generate_motion(request: MotionRequest):
    """生成 3D 动作"""
    try:
        pl = get_pipeline()
        result = pl.generate(request)
        return MotionResponse(
            request_id=result["request_id"],
            status="success",
            message="动作生成成功",
            generation_time_ms=result["generation_time_ms"],
            output_file=result["output_file"],
            preview_url=result["preview_url"]
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失败: {str(e)}")

@app.get("/api/motion/download/{request_id}")
async def download_motion(request_id: str, format: str = "npz"):
    """下载生成的动作文件"""
    file_path = OUTPUT_DIR / f"motion_{request_id}.{format}"
    if not file_path.exists():
        file_path = OUTPUT_DIR / f"motion_{request_id}.npz"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    media_types = {
        "npz": "application/octet-stream",
        "fbx": "application/octet-stream",
        "bvh": "text/plain",
        "amass": "application/octet-stream",
        "mujoco": "text/csv"
    }

    return FileResponse(
        path=file_path,
        filename=f"kimodo_motion_{request_id}.{format}",
        media_type=media_types.get(format, "application/octet-stream")
    )

@app.get("/api/preview/{request_id}")
async def preview_motion(request_id: str):
    """获取动作预览数据 (供 Three.js 渲染)"""
    npz_path = OUTPUT_DIR / f"motion_{request_id}.npz"
    if not npz_path.exists():
        raise HTTPException(status_code=404, detail="动作数据不存在")

    import numpy as np
    data = np.load(npz_path)
    return {
        "request_id": request_id,
        "fps": int(data["fps"]),
        "num_frames": data["root_translation"].shape[0],
        "skeleton": str(data["skeleton"]),
        "root_translation": data["root_translation"].tolist(),
        "joint_rotations": data["joint_rotations"].tolist()
    }

@app.post("/api/model/load")
async def load_model(model_path: Optional[str] = None):
    """手动触发模型加载"""
    global pipeline
    if not pipeline:
        raise HTTPException(status_code=503, detail="Pipeline 未初始化")

    path = Path(model_path) if model_path else None
    try:
        pipeline.load_model(path)
        return {"status": "success", "message": "模型加载成功"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history(limit: int = 20):
    """获取生成历史"""
    history = []
    for f in sorted(OUTPUT_DIR.glob("motion_*.npz"), reverse=True)[:limit]:
        request_id = f.stem.replace("motion_", "")
        history.append({
            "request_id": request_id,
            "file": str(f),
            "created": f.stat().st_mtime
        })
    return {"history": history}

# ============ 启动入口 ============
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.api.server:app",
        host="0.0.0.0",
        port=8765,
        reload=True,
        log_level="info"
    )
