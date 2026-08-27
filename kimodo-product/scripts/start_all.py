"""
Kimodo Product - 一键启动脚本
同时启动 API 服务和 Web GUI
"""

import subprocess
import sys
import time
import os
import signal
from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
os.chdir(PROJECT_ROOT)

def check_dependencies():
    """检查依赖是否安装"""
    required = ["fastapi", "uvicorn", "gradio", "requests", "numpy"]
    missing = []
    for pkg in required:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)

    if missing:
        print(f"❌ 缺少依赖: {', '.join(missing)}")
        print(f"   运行: pip install -r requirements.txt")
        return False
    return True

def start_api():
    """启动 API 服务"""
    print("🚀 启动 API 服务 (port 8765)...")
    return subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "src.api.server:app",
         "--host", "0.0.0.0", "--port", "8765", "--log-level", "info"],
        cwd=PROJECT_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

def start_gui():
    """启动 GUI"""
    print("🎨 启动 Web GUI (port 7860)...")
    return subprocess.Popen(
        [sys.executable, "-m", "src.gui.app"],
        cwd=PROJECT_ROOT,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

def main():
    print("=" * 60)
    print("🎬 Kimodo Product - 一键启动")
    print("=" * 60)

    # 检查依赖
    if not check_dependencies():
        sys.exit(1)

    # 启动服务
    api_process = None
    gui_process = None

    try:
        api_process = start_api()
        time.sleep(3)  # 等待 API 启动

        gui_process = start_gui()
        time.sleep(2)

        print("\n" + "=" * 60)
        print("✅ 所有服务已启动!")
        print("=" * 60)
        print(f"\n  🌐 Web GUI:     http://localhost:7860")
        print(f"  📡 API 服务:    http://localhost:8765")
        print(f"  📚 API 文档:    http://localhost:8765/docs")
        print(f"\n  按 Ctrl+C 停止所有服务\n")

        # 监控输出
        while True:
            if api_process.poll() is not None:
                print("⚠️ API 服务退出")
                break
            if gui_process and gui_process.poll() is not None:
                print("⚠️ GUI 服务退出")
                break
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n\n🛑 正在停止服务...")

    finally:
        if api_process:
            api_process.terminate()
            api_process.wait(timeout=5)
        if gui_process:
            gui_process.terminate()
            gui_process.wait(timeout=5)
        print("✅ 所有服务已停止")

if __name__ == "__main__":
    main()
