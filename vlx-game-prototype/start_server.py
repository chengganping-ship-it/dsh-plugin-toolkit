"""
一键启动脚本 - 同时启动后端服务器和前端静态服务
"""
import subprocess
import sys
import time
import os
import signal

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))

    print("=" * 60)
    print("  VLX-Seek AI Native Game Prototype - 启动器")
    print("=" * 60)

    # 启动后端
    print("\n[1/2] 启动裁判服务器 (FastAPI :8765)...")
    backend = subprocess.Popen(
        [sys.executable, "services/vlx-referee/server.py"],
        cwd=base_dir,
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
    )

    # 等待后端启动
    time.sleep(2)

    # 启动前端
    print("[2/2] 启动前端服务 (HTTP :3000)...")
    frontend = subprocess.Popen(
        [sys.executable, "-m", "http.server", "3000"],
        cwd=os.path.join(base_dir, "public"),
        creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if sys.platform == 'win32' else 0
    )

    print("\n" + "=" * 60)
    print("  启动完成!")
    print("  前端: http://localhost:3000")
    print("  后端: http://localhost:8765")
    print("  API文档: http://localhost:8765/docs")
    print("=" * 60)
    print("\n按 Ctrl+C 停止所有服务...\n")

    try:
        # 等待子进程
        while True:
            backend.poll()
            frontend.poll()
            if backend.returncode is not None or frontend.returncode is not None:
                break
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n正在停止服务...")
        backend.terminate()
        frontend.terminate()
        backend.wait(timeout=5)
        frontend.wait(timeout=5)
        print("服务已停止")

if __name__ == "__main__":
    main()
