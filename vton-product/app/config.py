"""虚拟试穿系统 - 配置"""
import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ===== 数据库 =====
DATABASE_URL = f"sqlite:///{BASE_DIR}/vton.db"

# ===== 文件上传 =====
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "output"
STATIC_DIR = BASE_DIR / "static"
MAX_UPLOAD_MB = 10
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
STATIC_DIR.mkdir(exist_ok=True)

# ===== 积分系统 =====
CREDITS_PER_GENERATION = 2       # 一次试穿消耗积分
FREE_CREDITS_ON_REGISTER = 10    # 注册送积分
FREE_DAILY_CREDITS = 2           # 每日免费积分
CREDIT_PACKAGES = {
    "basic":    {"credits": 50,   "price_rmb": 9.9,   "label": "50次 ￥9.9"},
    "standard": {"credits": 200,  "price_rmb": 29.9,  "label": "200次 ￥29.9"},
    "premium":  {"credits": 1000, "price_rmb": 99.0,  "label": "1000次 ￥99"},
}

# ===== JWT =====
JWT_SECRET = "vton-secret-change-in-prod-2026"
JWT_EXPIRE_HOURS = 720  # 30天

# ===== 推理引擎 =====
# 可选: "local"(本地GPU) / "siliconflow"(硅基流动API) / "mock"(mock测试)
INFERENCE_BACKEND = os.getenv("VTON_BACKEND", "mock")

# 硅基流动 API key (需要在环境变量或此处设置)
SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "")
SILICONFLOW_VTON_MODEL = "stabilityai/stable-diffusion-xl-base-1.0"  # 占位,待替换为VTON模型

# VTON 模型分辨率
VTON_WIDTH = 768
VTON_HEIGHT = 1024
