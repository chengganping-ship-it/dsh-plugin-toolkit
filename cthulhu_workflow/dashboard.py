#!/usr/bin/env python3
"""
克苏鲁有声书 运营看板
启动后访问 http://localhost:8899
"""

import csv
import json
import os
import sys
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = 8899
BASE_DIR = Path(__file__).parent


def get_data():
    """读取所有数据"""
    data = {
        "total_plays": 0,
        "total_revenue": 0,
        "total_likes": 0,
        "entries": [],
        "audio_files": [],
        "content_files": [],
        "latest_checklist": None,
    }

    # 读取 tracker
    tracker_file = BASE_DIR / "data" / "tracker.csv"
    if tracker_file.exists():
        with open(tracker_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                data["entries"].append(row)
                data["total_plays"] += int(row.get("播放量", 0))
                data["total_revenue"] += float(row.get("收益(元)", 0))
                data["total_likes"] += int(row.get("点赞", 0))

    # 读取音频文件
    audio_dir = BASE_DIR / "audio"
    if audio_dir.exists():
        for f in audio_dir.rglob("*.mp3"):
            data["audio_files"].append({
                "name": f.name,
                "path": str(f.relative_to(BASE_DIR)),
                "size_kb": round(f.stat().st_size / 1024, 1),
                "est_minutes": round(f.stat().st_size / 1024 / 30, 1),  # ~30KB/min
            })

    # 读取内容文件
    content_dir = BASE_DIR / "content"
    if content_dir.exists():
        for f in content_dir.glob("*.txt"):
            data["content_files"].append({
                "name": f.name,
                "size_kb": round(f.stat().st_size / 1024, 1),
                "chars": len(f.read_text(encoding='utf-8')),
            })

    # 读取最新 checklist
    publish_dir = BASE_DIR / "publish"
    if publish_dir.exists():
        checklists = sorted(publish_dir.glob("checklist_*.json"), reverse=True)
        if checklists:
            with open(checklists[0], 'r', encoding='utf-8') as f:
                data["latest_checklist"] = json.load(f)

    return data


HTML_PAGE = """
<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>🎙️ 克苏鲁有声书运营看板</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Microsoft YaHei', sans-serif; background: #0d1117; color: #c9d1d9; padding: 20px; }
h1 { text-align: center; color: #58a6ff; margin-bottom: 10px; font-size: 24px; }
.subtitle { text-align: center; color: #8b949e; margin-bottom: 30px; font-size: 14px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
.stat-card { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 20px; text-align: center; }
.stat-value { font-size: 36px; font-weight: bold; color: #58a6ff; }
.stat-label { font-size: 13px; color: #8b949e; margin-top: 5px; }
.section { background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
.section h2 { color: #7ee787; font-size: 16px; margin-bottom: 15px; border-bottom: 1px solid #30363d; padding-bottom: 10px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #21262d; font-size: 13px; }
th { color: #8b949e; font-weight: normal; }
.audio-item, .content-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #21262d; }
.tag { display: inline-block; background: #1f6feb33; color: #58a6ff; padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-right: 5px; }
.btn { display: inline-block; background: #238636; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px; margin-top: 10px; }
.btn:hover { background: #2ea043; }
</style>
</head>
<body>

<h1>🎙️ 克苏鲁有声书运营看板</h1>
<p class="subtitle">The Call of Cthulhu Audiobook Dashboard</p>

<div class="statistics">
<div class="stat-card">
  <div class="stat-value" id="total_plays">0</div>
  <div class="stat-label">总播放量</div>
</div>
<div class="stat-card">
  <div class="stat-value" id="total_likes">0</div>
  <div class="stat-label">总点赞</div>
</div>
<div class="stat-card">
  <div class="stat-value" id="total_revenue">¥0</div>
  <div class="stat-label">总收益</div>
</div>
<div class="stat-card">
  <div class="stat-value" id="audio_count">0</div>
  <div class="stat-label">音频数量</div>
</div>
</div>

<div class="section">
<h2>📖 内容库</h2>
<div id="content_list"></div>
</div>

<div class="section">
<h2>🎵 音频库</h2>
<div id="audio_list"></div>
</div>

<div class="section">
<h2>📊 数据记录</h2>
<table id="data_table">
<tr><th>日期</th><th>平台</th><th>播放量</th><th>点赞</th><th>收益</th><th>备注</th></tr>
</table>
</div>

<div class="section">
<h2>📋 最新发布清单</h2>
<div id="checklist"></div>
</div>

<script>
// 这里用 fetch 获取数据
const DATA = __DATA_PLACEHOLDER__;

// 填充统计
document.getElementById('total_plays').textContent = DATA.total_plays;
document.getElementById('total_likes').textContent = DATA.total_likes;
document.getElementById('total_revenue').textContent = '¥' + DATA.total_revenue.toFixed(2);
document.getElementById('audio_count').textContent = DATA.audio_files.length;

// 填充内容列表
let contentHtml = '';
DATA.content_files.forEach(f => {
  contentHtml += `<div class="content-item"><span>${f.name}</span><span>${f.chars}字 (${f.size_kb}KB)</span></div>`;
});
document.getElementById('content_list').innerHTML = contentHtml || '<p style="color:#8b949e">暂无内容，请将 .txt 文件放入 content/ 目录</p>';

// 填充音频列表
let audioHtml = '';
DATA.audio_files.forEach(f => {
  audioHtml += `<div class="audio-item"><span>${f.name}</span><span>${f.size_kb}KB ≈ ${f.est_minutes}分钟</span></div>`;
});
document.getElementById('audio_list').innerHTML = audioHtml || '<p style="color:#8b949e">暂无音频</p>';

// 填充数据表
let tableHtml = '';
DATA.entries.forEach(e => {
  tableHtml += `<tr><td>${e['日期']}</td><td>${e['平台']}</td><td>${e['播放量']}</td><td>${e['点赞']}</td><td>${e['收益(元)']}</td><td>${e['备注']||''}</td></tr>`;
});
document.getElementById('data_table').innerHTML = tableHtml || '<tr><td colspan="6" style="text-align:center;color:#8b949e">暂无数据</td></tr>';

// 填充清单
if (DATA.latest_checklist) {
  let cl = DATA.latest_checklist;
  let clHtml = `<p><strong>标题:</strong> ${cl.metadata.title}</p>`;
  clHtml += `<p><strong>分类:</strong> ${cl.metadata.category}</p>`;
  clHtml += `<p><strong>标签:</strong> `;
  cl.metadata.tags.forEach(t => clHtml += `<span class="tag">${t}</span>`);
  clHtml += `</p><p><strong>最佳发布时间:</strong> ${cl.metadata.best_publish_time}</p>`;
  clHtml += `<p style="margin-top:10px"><strong>发布步骤:</strong></p><ol style="padding-left:20px">`;
  cl.steps.forEach(s => {
    clHtml += `<li>${s.task} ${s.done?'✅':'⬜'}</li>`;
  });
  clHtml += '</ol>';
  document.getElementById('checklist').innerHTML = clHtml;
}
</script>

</body>
</html>
"""


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '/index.html':
            data = get_data()
            html = HTML_PAGE.replace('__DATA_PLACEHOLDER__', json.dumps(data, ensure_ascii=False))
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(html.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # 静默日志


def main():
    os.chdir(BASE_DIR)
    server = HTTPServer(('localhost', PORT), Handler)
    print(f"🎙️ 克苏鲁有声书运营看板已启动: http://localhost:{PORT}")
    print("按 Ctrl+C 停止")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")


if __name__ == '__main__':
    main()
