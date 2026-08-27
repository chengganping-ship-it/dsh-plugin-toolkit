#!/usr/bin/env python3
"""
AI封面生成器
============
利用免费AI图像生成服务为有声书生成封面。

免费工具：
1. Bing Image Creator (DALL-E 3) - 每天15次快速生成
2. Leonardo AI - 每天150 tokens
3. Ideogram AI - 每天生成
4. Fotor AI - 每天免费额度
5. AImageGen - 无需登录

使用方式：
- 直接打开HTML文件，复制prompt到各平台
- 或使用 Playwright 自动打开并截图
"""

import os
import webbrowser
from pathlib import Path


class CoverGenerator:
    """有声书封面生成器"""

    # 封面模板库 — 针对不同克苏鲁故事
    COVER_TEMPLATES = {
        "cthulhu_default": {
            "prompt": "A dark cosmic horror book cover. A massive tentacled creature emerging from an ancient underwater city. Purple and black color scheme. Mysterious geometric patterns. No text. Cinematic lighting. 4K. Lovecraftian style.",
            "style": "cosmic_horror",
            "colors": ["#1a0a2e", "#0d0221", "#2d1b4e", "#000000"],
        },
        "mountains_of_madness": {
            "prompt": "A forbidden Antarctic mountain range under a sickly green sky. Ancient alien ruins carved into impossible geometry. A lone explorer figure silhouetted against the vastness. Dark purple, ice blue, black. No text. Cinematic. Lovecraftian horror.",
            "style": "antarctic_horror",
            "colors": ["#0a1628", "#1a3a4a", "#2d1b4e", "#0d0221"],
        },
        "dagon": {
            "prompt": "A monstrous sea creature rising from dark ocean waves. An ancient reef covered in alien carvings. A shipwreck in the foreground. Deep ocean blues, sickly greens, black. Tentacles everywhere. No text. Cosmic horror. 4K.",
            "style": "ocean_horror",
            "colors": ["#0a0a2d", "#0d1b2a", "#1b263b", "#000000"],
        },
        "call_of_cthulhu": {
            "prompt": "The dreaming city of R'leyh with impossible non-Euclidean geometry. A colossal Cthulhu silhouette sleeping beneath bioluminescent waves. Purple, deep green, black. Ancient runes glow in the darkness. No text. 4K. Lovecraftian.",
            "style": "rlyeh",
            "colors": ["#0d0221", "#1a0a2e", "#0a1628", "#000000"],
        },
    }

    def __init__(self, output_dir=None):
        self.output_dir = Path(output_dir or Path(__file__).parent / "covers")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def get_cover_prompt(self, title, content_summary="", style="cthulhu_default"):
        """获取封面prompt"""
        template = self.COVER_TEMPLATES.get(style, self.COVER_TEMPLATES["cthulhu_default"])
        prompt = template["prompt"]

        # 如果有内容摘要，增强prompt
        if content_summary:
            # 提取关键词
            keywords = self._extract_keywords(content_summary)
            if keywords:
                prompt = prompt.replace("No text.", f"Elements: {keywords}. No text.")

        return prompt

    def _extract_keywords(self, text, max_words=5):
        """提取视觉关键词"""
        horror_keywords = {
            "海": "ocean waves", "水": "water", "渊": "abyss",
            "山": "mountain", "冰": "ice", "雪": "snow",
            "城": "ancient city", "神": "ancient god", "殿": "temple",
            "触": "tentacles", "眼": "eyeless face", "梦": "dreamscape",
            "尸": "ancient remains", "血": "dark red accents",
            "夜": "night", "月": "eerie moon", "雾": "fog",
        }
        found = []
        for cn, en in horror_keywords.items():
            if cn in text:
                found.append(en)
        return ", ".join(found[:max_words])

    def generate_html_generator(self, title, content_summary="", style="cthulhu_default"):
        """生成一个HTML文件，包含直达各免费生成平台的链接"""
        prompt = self.get_cover_prompt(title, content_summary, style)
        template = self.COVER_TEMPLATES.get(style, self.COVER_TEMPLATES["cthulhu_default"])

        # URL encode the prompt
        import urllib.parse
        encoded_prompt = urllib.parse.quote(prompt)

        html = f"""<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<title>🎨 封面生成: {title}</title>
<style>
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{ font-family: 'Microsoft YaHei', sans-serif; background: #0d1117; color: #c9d1d9; padding: 20px; }}
h1 {{ color: #58a6ff; margin-bottom: 10px; }}
h2 {{ color: #7ee787; margin: 20px 0 10px; }}
.prompt-box {{ background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 15px; margin: 10px 0; font-size: 14px; line-height: 1.6; }}
.platform-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0; }}
.platform-card {{ background: #161b22; border: 1px solid #30363d; border-radius: 10px; padding: 15px; text-align: center; transition: border-color 0.2s; }}
.platform-card:hover {{ border-color: #58a6ff; }}
.platform-card a {{ color: #58a6ff; text-decoration: none; font-weight: bold; }}
.platform-card a:hover {{ text-decoration: underline; }}
.platform-card .free {{ color: #7ee787; font-size: 12px; }}
.color-palette {{ display: flex; gap: 10px; margin: 10px 0; }}
.color-swatch {{ width: 40px; height: 40px; border-radius: 8px; border: 1px solid #30363d; }}
.copy-btn {{ background: #238636; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin-top: 10px; }}
.copy-btn:hover {{ background: #2ea043; }}
</style>
</head>
<body>

<h1>🎙️ 有声书封面生成器</h1>
<h2>《{title}》</h2>

<h2>📝 生成Prompt（复制到以下平台）</h2>
<div class="prompt-box" id="prompt">{prompt}</div>
<button class="copy-btn" onclick="copyPrompt()">📋 复制Prompt</button>

<h2>🎨 免费生成平台（点击直达）</h2>
<div class="platform-grid">
<div class="platform-card">
<a href="https://www.bing.com/images/create?kic=1&showselective=1&q={encoded_prompt}" target="_blank">🖼️ Bing Image Creator</a>
<p class="free">免费: 15次/天 (DALL-E 3)</p>
<p>质量最高，推荐首选</p>
</div>
<div class="platform-card">
<a href="https://ideogram.ai/t/explore?q={encoded_prompt}" target="_blank">✍️ Ideogram AI</a>
<p class="free">免费: 每日额度</p>
<p>文字渲染最好</p>
</div>
<div class="platform-card">
<a href="https://leonardo.ai/ai-generations?prompt={encoded_prompt}" target="_blank">🎭 Leonardo AI</a>
<p class="free">免费: 150 tokens/天</p>
<p>风格最多变</p>
</div>
<div class="platform-card">
<a href="https://www.fotor.com/features/ai-image-generator/?prompt={encoded_prompt}" target="_blank">🖌️ Fotor AI</a>
<p class="free">免费: 每日额度</p>
<p>多模型选择</p>
</div>
<div class="platform-card">
<a href="https://aimagegen.com/?prompt={encoded_prompt}" target="_blank">⚡ AImageGen</a>
<p class="free">免费: 无限</p>
<p>无需登录</p>
</div>
</div>

<h2>🎨 推荐配色方案</h2>
<div class="color-palette">
"""
        for color in template["colors"]:
            html += f'<div class="color-swatch" style="background:{color}" title="{color}"></div>'

        html += """
</div>

<script>
function copyPrompt() {
    const prompt = document.getElementById('prompt').textContent;
    navigator.clipboard.writeText(prompt).then(() => {
        alert('✅ Prompt已复制！粘贴到任意平台即可生成');
    });
}
</script>

</body>
</html>"""

        # 保存HTML文件
        output_file = self.output_dir / f"cover_{style}.html"
        output_file.write_text(html, encoding='utf-8')
        return output_file

    def open_generator(self, title, content_summary="", style="cthulhu_default"):
        """在浏览器中打开封面生成器"""
        html_file = self.generate_html_generator(title, content_summary, style)
        webbrowser.open(f"file:///{html_file.absolute()}")
        return html_file


if __name__ == "__main__":
    gen = CoverGenerator()
    # 为克苏鲁的呼唤生成封面
    html = gen.open_generator(
        "克苏鲁的呼唤",
        "一座沉睡在太平洋底的古老城市，克苏鲁等待群星归位",
        "call_of_cthulhu"
    )
    print(f"封面生成器已打开: {html}")
