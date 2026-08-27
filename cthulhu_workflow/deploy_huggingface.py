#!/usr/bin/env python3
"""
HuggingFace Spaces 部署配置
===========================
将仪表板部署到 HuggingFace Spaces，实现24/7在线。

免费额度：
- CPU: 2核, 16GB内存
- 存储: 50GB
- 流量: 无限

部署步骤：
1. 在 huggingface.co 注册账号
2. 创建 New Space -> Gradio -> CPU -> Public
3. 将本目录上传到 Space
4. 自动部署，获得永久在线URL

使用方法：
1. 安装 huggingface_hub: pip install huggingface_hub
2. 设置 token: huggingface-cli login
3. 运行: python deploy_huggingface.py
"""

import os
import shutil
from pathlib import Path

SPACE_APP = """
import gradio as gr
import json
import csv
from pathlib import Path
from datetime import datetime

# 读取数据
def load_data():
    data_dir = Path("data")
    tracker = data_dir / "tracker.csv"
    memory_db = data_dir / "memory.db"

    entries = []
    if tracker.exists():
        with open(tracker, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                entries.append(row)

    total_plays = sum(int(e.get("播放量", 0)) for e in entries)
    total_revenue = sum(float(e.get("收益(元)", 0)) for e in entries)

    return {
        "total_plays": total_plays,
        "total_revenue": total_revenue,
        "entries": entries[-10:]  # 最近10条
    }

def refresh():
    data = load_data()
    return (
        f"## 📊 总播放量: {data['total_plays']}",
        f"## 💰 总收益: ¥{data['total_revenue']:.2f}",
        f"## 📝 记录数: {len(data['entries'])}",
        data['entries']
    )

with gr.Blocks(title="克苏鲁有声书运营看板", theme=gr.themes.Soft()) as demo:
    gr.Markdown("# 🎙️ 克苏鲁有声书 运营看板")
    gr.Markdown("*Cthulhu Audiobook Dashboard*")

    with gr.Row():
        with gr.Column():
            plays_md = gr.Markdown("## 📊 总播放量: 0")
        with gr.Column():
            revenue_md = gr.Markdown("## 💰 总收益: ¥0.00")
        with gr.Column():
            count_md = gr.Markdown("## 📝 记录数: 0")

    refresh_btn = gr.Button("🔄 刷新数据", variant="primary")
    table = gr.Dataframe(
        headers=["日期", "平台", "播放量", "点赞", "收益", "备注"],
        datatype=["str", "str", "number", "number", "number", "str"],
        label="最近数据"
    )

    refresh_btn.click(fn=refresh, outputs=[plays_md, revenue_md, count_md, table])

    # 自动刷新
    demo.load(fn=refresh, outputs=[plays_md, revenue_md, count_md, table])

if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
"""

SPACE_README = """---
title: 克苏鲁有声书运营看板
emoji: 🎙️
colorFrom: purple
colorTo: black
sdk: gradio
sdk_version: 5.0.0
app_file: app.py
pinned: false
license: mit
---

# 🎙️ 克苏鲁有声书 运营看板

自动追踪有声书播放量、收益、内容表现。

## 功能
- 实时播放量追踪
- 收益统计
- 内容表现分析
- 自动刷新

## 数据
数据自动从 `data/tracker.csv` 读取。
"""


def create_space_files():
    """创建HuggingFace Space所需文件"""
    space_dir = Path(__file__).parent / "huggingface_space"
    space_dir.mkdir(exist_ok=True)

    # app.py
    (space_dir / "app.py").write_text(SPACE_APP, encoding='utf-8')

    # README.md
    (space_dir / "README.md").write_text(SPACE_README, encoding='utf-8')

    # requirements.txt
    (space_dir / "requirements.txt").write_text("gradio>=5.0.0\n", encoding='utf-8')

    # 复制数据目录
    data_src = Path(__file__).parent / "data"
    data_dst = space_dir / "data"
    if data_src.exists():
        if data_dst.exists():
            shutil.rmtree(data_dst)
        shutil.copytree(data_src, data_dst)

    print(f"✅ Space文件已创建: {space_dir}")
    print(f"   文件: app.py, README.md, requirements.txt, data/")
    print(f"")
    print(f"部署步骤:")
    print(f"1. 安装: pip install huggingface_hub")
    print(f"2. 登录: huggingface-cli login")
    print(f"3. 创建Space: https://huggingface.co/new-space")
    print(f"4. 上传: cd huggingface_space && git init && git add . && git commit -m 'init' && git push")
    print(f"")
    print(f"或使用API直接创建:")
    print(f"  from huggingface_hub import HfApi")
    print(f"  api = HfApi(token='your_token')")
    print(f"  api.create_repo(repo_id='your_username/cthulhu-audiobook', repo_type='space', space_sdk='gradio')")
    print(f"  api.upload_folder(folder_path='huggingface_space', repo_id='your_username/cthulhu-audiobook', repo_type='space')")


if __name__ == "__main__":
    create_space_files()
