# Kimodo Product - Docker 构建文件
# 基于 NVIDIA PyTorch 镜像，包含 CUDA 支持

FROM nvidia/cuda:12.1.0-devel-ubuntu22.04

# 基础工具
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    git \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 设置工作目录
WORKDIR /app

# 安装 Python 依赖
COPY requirements.txt /app/
RUN pip3 install --no-cache-dir -r requirements.txt

# 安装 Kimodo 依赖 (从源码编译)
RUN pip3 install --no-cache-dir \
    viser \
    tyro \
    numpy \
    scipy \
    transforms3d

# 复制应用代码
COPY src/ /app/src/
COPY config/ /app/config/

# 创建数据目录
RUN mkdir -p /app/data/output /app/data/models

# 环境变量
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV CUDA_VISIBLE_DEVICES=0

# 暴露端口
EXPOSE 8765 7860

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8765/api/health || exit 1

# 启动命令
CMD ["python3", "-m", "uvicorn", "src.api.server:app", "--host", "0.0.0.0", "--port", "8765"]
