"""
Kimodo Product - 模型下载与设置脚本
自动下载 Kimodo 权重文件到本地目录
"""

import os
import sys
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
MODEL_DIR = DATA_DIR / "models" / "kimodo"
OUTPUT_DIR = DATA_DIR / "output"

# Kimodo 模型配置
KIMODO_MODELS = {
    "SOMA-RP-v1.1": {
        "repo": "nvidia/Kimodo-SOMA-RP-v1.1",
        "files": [
            "model.safetensors",
            "config.yaml",
            "stats/motion/body/mean.npy",
            "stats/motion/body/std.npy",
            "stats/motion/global_root/mean.npy",
            "stats/motion/global_root/std.npy",
            "stats/motion/local_root/mean.npy",
            "stats/motion/local_root/std.npy",
        ],
        "total_size_gb": 2.5,
        "description": "SOMA-RP骨架，推荐用于内容创作（30关节）"
    }
}

def check_disk_space(required_gb: float) -> bool:
    """检查磁盘空间"""
    import shutil
    total, used, free = shutil.disk_usage(PROJECT_ROOT)
    free_gb = free / (1024**3)
    if free_gb < required_gb:
        print(f"❌ 磁盘空间不足: 需要 {required_gb:.1f}GB, 可用 {free_gb:.1f}GB")
        return False
    print(f"✅ 磁盘空间充足: 可用 {free_gb:.1f}GB (需要 {required_gb:.1f}GB)")
    return True

def download_from_hf(repo_id: str, files: list, dest_dir: Path):
    """从 Hugging Face 下载模型文件"""
    try:
        from huggingface_hub import hf_hub_download
    except ImportError:
        print("安装 huggingface_hub...")
        os.system(f"{sys.executable} -m pip install huggingface_hub")
        from huggingface_hub import hf_hub_download

    dest_dir.mkdir(parents=True, exist_ok=True)

    for file_path in files:
        print(f"  下载 {file_path}...")
        try:
            hf_hub_download(
                repo_id=repo_id,
                filename=file_path,
                local_dir=dest_dir,
                local_dir_use_symlinks=False,
                resume_download=True
            )
            print(f"  ✅ {file_path} 完成")
        except Exception as e:
            print(f"  ⚠️ {file_path} 下载失败: {e}")
            print(f"     尝试从镜像下载...")
            # 使用 HF 镜像
            os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"
            hf_hub_download(
                repo_id=repo_id,
                filename=file_path,
                local_dir=dest_dir,
                local_dir_use_symlinks=False,
                resume_download=True
            )

def setup():
    """执行完整设置"""
    print("=" * 60)
    print("🚀 Kimodo Product - 模型设置")
    print("=" * 60)

    # 创建目录结构
    print("\n📁 创建目录结构...")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    print(f"  数据目录: {DATA_DIR}")
    print(f"  模型目录: {MODEL_DIR}")
    print(f"  输出目录: {OUTPUT_DIR}")

    # 检查 GPU
    print("\n🔍 检查硬件...")
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            vram = torch.cuda.get_device_properties(0).total_mem / (1024**3)
            print(f"  ✅ GPU: {gpu_name} ({vram:.1f} GB VRAM)")
            if vram < 16:
                print(f"  ⚠️ 警告: 推荐至少 16GB VRAM，当前 {vram:.1f}GB")
                print(f"     可尝试 LowVRAM 模式 (分块推理)")
        else:
            print("  ❌ 未检测到 CUDA GPU")
            print("     Kimodo 需要 NVIDIA GPU (16GB+ VRAM)")
            print("     可改用 Kimodo API 云端版 (后续支持)")
            return False
    except ImportError:
        print("  ⚠️ PyTorch 未安装，跳过 GPU 检测")
        print("     安装: pip install torch torchvision")

    # 检查磁盘空间
    print("\n💾 检查磁盘空间...")
    if not check_disk_space(5.0):
        return False

    # 下载模型
    print("\n⬇️ 下载 Kimodo 模型...")
    for model_name, config in KIMODO_MODELS.items():
        print(f"\n模型: {model_name} ({config['description']})")
        print(f"大小: ~{config['total_size_gb']} GB")
        print(f"来源: Hugging Face {config['repo']}")

        model_dest = MODEL_DIR / model_name
        download_from_hf(config["repo"], config["files"], model_dest)

    # 验证
    print("\n🔍 验证安装...")
    model_path = MODEL_DIR / "SOMA-RP-v1.1"
    if (model_path / "model.safetensors").exists():
        size_mb = (model_path / "model.safetensors").stat().st_size / (1024**2)
        print(f"  ✅ model.safetensors ({size_mb:.0f} MB)")
    else:
        print("  ❌ model.safetensors 不存在")

    if (model_path / "config.yaml").exists():
        print(f"  ✅ config.yaml")

    print("\n" + "=" * 60)
    print("🎉 设置完成!")
    print("=" * 60)
    print("\n下一步:")
    print("  1. 启动 API 服务:  python -m src.api.server")
    print("  2. 启动 Web GUI:    python -m src.gui.app")
    print("  3. 访问界面:        http://localhost:7860")
    print("  4. API 文档:        http://localhost:8765/docs")

if __name__ == "__main__":
    setup()
