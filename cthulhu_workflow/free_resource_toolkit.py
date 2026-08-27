#!/usr/bin/env python3
"""
免费资源利用工具集
====================
整合一切免费开源资源，为克苏鲁有声书赋能。

利用的免费资源:
1. VoxCPM 2 (清华) — 最佳开源中文TTS，支持情感控制
2. CosyVoice (阿里) — 3秒语音克隆
3. F5-TTS — 快速克隆
4. ChatTTS — 中文优化
5. Fish Speech — SOTA音质
6. Edge-TTS — 微软无限免费
7. Bing Image Creator — 免费AI封面
8. 588ku.com — 免费恐怖音效
9. Unsplash — 免费封面底图
10. GitHub Actions — 免费云端调度

使用建议:
- 小规模/测试: Edge-TTS (无限)
- 高品质中文: VoxCPM 2 (需要GPU)
- 语音克隆: CosyVoice (需要GPU)
- 快速产出: F5-TTS + ffmpeg
"""

import os
import re
import json
import time
import subprocess
from pathlib import Path
from datetime import datetime


WORKFLOW_DIR = Path(__file__).parent
DATA_DIR = WORKFLOW_DIR / "data"
TOOLS_DIR = WORKFLOW_DIR / "free_tools"


# ============================================================
# 多引擎TTS路由器
# ============================================================
class MultiEngineTTS:
    """
    多引擎TTS路由器 - 自动选择最佳免费引擎
    """
    
    ENGINES = {
        "edge_tts": {
            "name": "Edge-TTS",
            "quality": 3,
            "speed": 5,
            "cost": "free",
            "cloning": False,
            "emotion_control": False,
            "languages": ["zh", "en"],
        },
        "voxcpm2": {
            "name": "VoxCPM 2",
            "quality": 5,
            "speed": 2,
            "cost": "free",
            "cloning": True,
            "emotion_control": True,
            "languages": ["zh", "en", "30+"],
        },
        "cosyvoice": {
            "name": "CosyVoice",
            "quality": 5,
            "speed": 2,
            "cost": "free",
            "cloning": True,
            "emotion_control": True,
            "languages": ["zh", "en", "9langs"],
        },
        "f5_tts": {
            "name": "F5-TTS",
            "quality": 4,
            "speed": 4,
            "cost": "free",
            "cloning": True,
            "emotion_control": False,
            "languages": ["zh", "en"],
        },
        "chattts": {
            "name": "ChatTTS",
            "quality": 4,
            "speed": 4,
            "cost": "free",
            "cloning": False,
            "emotion_control": True,
            "languages": ["zh", "en"],
        },
        "fish_speech": {
            "name": "Fish Speech",
            "quality": 5,
            "speed": 3,
            "cost": "free",
            "cloning": True,
            "emotion_control": False,
            "languages": ["zh", "en", "ja"],
        },
        "google_tts": {
            "name": "Google Cloud TTS",
            "quality": 4,
            "speed": 4,
            "cost": "1M chars/mo",
            "cloning": False,
            "emotion_control": False,
            "languages": ["30langs"],
        },
        "elevenlabs": {
            "name": "ElevenLabs",
            "quality": 5,
            "speed": 5,
            "cost": "15min/mo",
            "cloning": True,
            "emotion_control": True,
            "languages": ["30langs"],
        },
    }
    
    def get_recommendation(self, use_case="general"):
        """
        根据使用场景推荐最佳引擎
        
        Args:
            use_case: "general" | "high_quality" | "voice_cloning" | "fast" | "free_forever"
        """
        recommendations = {
            "general": {
                "primary": ("edge_tts", "无限免费，中文质量好"),
                "secondary": ("google_tts", "每月100万字符"),
                "fallback": ("f5_tts", "快速产出"),
            },
            "high_quality": {
                "primary": ("voxcpm2", "SOTA音质，30语言，情感控制"),
                "secondary": ("cosyvoice", "情感控制，3秒克隆"),
                "fallback": ("elevenlabs", "15分钟/月免费"),
            },
            "voice_cloning": {
                "primary": ("voxcpm2", "只需3-5秒参考音频"),
                "secondary": ("cosyvoice", "3秒极速克隆"),
                "fallback": ("f5_tts", "快速克隆"),
            },
            "fast": {
                "primary": ("edge_tts", "无限量，直出"),
                "secondary": ("f5_tts", "本地快速"),
                "fallback": ("chattts", "中文快速"),
            },
            "free_forever": {
                "primary": ("edge_tts", "微软免费，无限量"),
                "secondary": ("f5_tts", "本地运行，完全免费"),
                "fallback": ("cosyvoice", "开源免费，需GPU"),
            },
        }
        
        return recommendations.get(use_case, recommendations["general"])
    
    def get_engine_info(self, engine_id):
        """获取引擎详细信息"""
        return self.ENGINES.get(engine_id, {})
    
    def list_engines(self, filter_cloning=None, filter_emotion=None):
        """按条件筛选引擎"""
        results = {}
        for eid, info in self.ENGINES.items():
            if filter_cloning is not None and info["cloning"] != filter_cloning:
                continue
            if filter_emotion is not None and info["emotion_control"] != filter_emotion:
                continue
            results[eid] = info
        return results


# ============================================================
# 免费资源的安装/部署指南
# ============================================================
class FreeResourceInstaller:
    """一键安装/配置免费资源"""
    
    INSTALL_GUIDES = {
        "voxcpm2": {
            "name": "VoxCPM 2 安装",
            "requirements": ["Python 3.10+", "PyTorch", "NVIDIA GPU (推荐)"],
            "commands": "# 安装VoxCPM 2\npip install voxcpm\n\n# 或从源码安装\ngit clone https://github.com/OpenBMB/VoxCPM.git\ncd VoxCPM\npip install -e .\n\n# 启动Gradio界面\npython app.py",
        },
        "cosyvoice": {
            "name": "CosyVoice 安装",
            "requirements": ["Python 3.8+", "PyTorch", "NVIDIA GPU"],
            "commands": "# 安装CosyVoice\npip install cosyvoice\n\n# 或从源码\ngit clone https://github.com/FunAudioLLM/CosyVoice.git\ncd CosyVoice\npip install -e .\n\n# 启动WebUI\npython webui.py",
        },
        "f5_tts": {
            "name": "F5-TTS 安装",
            "requirements": ["Python 3.8+", "PyTorch", "GPU"],
            "commands": "pip install f5-tts\n\n# 或从源码\ngit clone https://github.com/SWIFTSparrow/F5-TTS.git\ncd F5-TTS\npip install -e .",
        },
        "chattts": {
            "name": "ChatTTS 安装",
            "requirements": ["Python 3.8+", "PyTorch", "GPU"],
            "commands": "pip install ChatTTS\n\n# 或从源码\ngit clone https://github.com/2noise/ChatTTS.git\ncd ChatTTS\npip install -r requirements.txt",
        },
        "fish_speech": {
            "name": "Fish Speech 安装",
            "requirements": ["Python 3.10+", "PyTorch", "GPU"],
            "commands": "# 从源码安装\ngit clone https://github.com/fishaudio/fish-speech.git\ncd fish-speech\npip install -e .\n\n# 启动WebUI\npython tools/webui.py",
        },
        "voice_pro": {
            "name": "Voice-Pro (一站式工具)",
            "requirements": ["Windows", "NVIDIA GPU"],
            "commands": "# Voice-Pro是Windows下的开源语音工作站\n# 支持: 语音翻译、AI克隆、人声分离、YouTube下载\n# 下载: https://github.com/abus-aikorea/voice-pro/releases",
        },
    }
    
    def get_install_guide(self, tool_name):
        """获取安装指南"""
        return self.INSTALL_GUIDES.get(tool_name, {})
    
    def list_all(self):
        """列出所有可安装工具"""
        return {k: v["name"] for k, v in self.INSTALL_GUIDES.items()}
    
    def check_installed(self, tool_name):
        """检查工具是否已安装"""
        commands = {
            "voxcpm2": ["python", "-c", "import voxcpm; print('VoxCPM installed')"],
            "cosyvoice": ["python", "-c", "import cosyvoice; print('CosyVoice installed')"],
            "f5_tts": ["python", "-c", "import f5_tts; print('F5-TTS installed')"],
            "chattts": ["python", "-c", "import ChatTTS; print('ChatTTS installed')"],
            "fish_speech": ["python", "-c", "import fish_speech; print('Fish Speech installed')"],
            "ffmpeg": ["ffmpeg", "-version"],
        }
        
        if tool_name not in commands:
            return {"installed": None, "version": None}
        
        try:
            result = subprocess.run(
                commands[tool_name],
                capture_output=True, text=True, timeout=15
            )
            return {
                "installed": result.returncode == 0,
                "output": result.stdout[:200] if result.returncode == 0 else result.stderr[:200],
            }
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return {"installed": False, "output": "not found"}


# ============================================================
# 免费音乐/音效下载器
# ============================================================
class FreeMusicDownloader:
    """免费音乐/音效下载（通过API或链接抓取）"""
    
    SOURCES = {
        "pixabay": {
            "name": "Pixabay Music",
            "url": "https://pixabay.com/music/",
            "api": "https://pixabay.com/api/",
            "free": True,
            "api_key": "免费注册获取",  # 注册即可获得API Key
        },
        "freemusicarchive": {
            "name": "Free Music Archive",
            "url": "https://freemusicarchive.org/",
            "free": True,
        },
        "incompetech": {
            "name": "Incompetech (Kevin MacLeod)",
            "url": "https://incompetech.com/",
            "free": True,
            "note": "需署名",
        },
        "ncs": {
            "name": "NoCopyrightSounds",
            "url": "https://ncs.io/",
            "free": True,
            "note": "需署名",
        },
        "588ku": {
            "name": "588ku恐怖音效(中文)",
            "url": "https://588ku.com/audio/kongbufenweiyinxiao.html",
            "free": True,
            "format": "MP3/WAV",
        },
        "chinaz": {
            "name": "素材中国恐怖音乐",
            "url": "https://sc.chinaz.com/tag_yinxiao/kongbu.html",
            "free": True,
            "format": "MP3",
        },
    }
    
    def search_horror_mood(self, mood="dark_ambient"):
        """搜索恐怖氛围音乐链接"""
        mood_urls = {
            "dark_ambient": [
                "https://588ku.com/audio/kongbufenweiyinxiao.html",
                "https://pixabay.com/music/search/dark%20ambient/",
                "https://freemusicarchive.org/search/?adv=1&genre_id=39",
            ],
            "horror_atmosphere": [
                "https://588ku.com/audio/kongbujiaosheng.html",
                "https://pixabay.com/music/search/horror/",
                "https://incompetech.com/music/royalty-free/index.html?genre=Horror",
            ],
            "cinematic_tension": [
                "https://pixabay.com/music/search/cinematic%20tension/",
                "https://freemusicarchive.org/genre/Cinematic/",
            ],
            "deep_sea": [
                "https://pixabay.com/music/search/deep%20ocean/",
                "https://pixabay.com/music/search/underwater/",
            ],
            "creepy_piano": [
                "https://pixabay.com/music/search/dark%20piano/",
                "https://incompetech.com/music/royalty-free/index.html?genre=Horror",
            ],
        }
        
        return mood_urls.get(mood, mood_urls["dark_ambient"])
    
    def get_sources(self):
        """获取所有可用音源"""
        return self.SOURCES


# ============================================================
# 免费AI图像生成器
# ============================================================
class FreeImageGenerator:
    """免费AI图像生成（封面/插图）"""
    
    GENERATORS = {
        "bing_image_creator": {
            "name": "Bing Image Creator (DALL-E 3)",
            "url": "https://www.bing.com/create",
            "free": "无限(有每日boost限制)",
            "quality": 5,
            "note": "DALL-E 3驱动，质量极高",
        },
        "leonardo_ai": {
            "name": "Leonardo AI",
            "url": "https://leonardo.ai/",
            "free": "150积分/天",
            "quality": 5,
            "note": "多种模型，风格丰富",
        },
        "ideogram": {
            "name": "ideogram.ai",
            "url": "https://ideogram.ai/",
            "free": "无限",
            "quality": 4,
            "note": "文字渲染好",
        },
        "playgroundai": {
            "name": "Playground AI",
            "url": "https://playgroundai.com/",
            "free": "500张/天",
            "quality": 4,
        },
        "seaart": {
            "name": "SeaArt",
            "url": "https://seaart.ai/",
            "free": "无限(有限制)",
            "quality": 4,
        },
        "liblib": {
            "name": "LiblibAI(中文)",
            "url": "https://liblib.art/",
            "free": "100积分/天",
            "quality": 4,
        },
        "tusiart": {
            "name": "吐司Art",
            "url": "https://tusiart.com/",
            "free": "免费额度",
            "quality": 4,
        },
    }
    
    def get_cover_prompt(self, title, style="dark_horror"):
        """生成封面提示词"""
        prompts = {
            "dark_horror": f"""A dark cosmic horror book cover for "{title}", 
                Cthulhu mythos style, deep ocean abyss, ancient tentacles emerging from darkness, 
                eldritch atmosphere, dark blue and black color scheme, mysterious glowing runes, 
                vintage book cover art, highly detailed, 4k""",
            "lovecraft": f"""Vintage Lovecraftian book cover art for "{title}",
                1920s pulp horror style, tentacles and ancient symbols, 
                yellowed paper texture, occult imagery, dark and ominous""",
            "minimalist": f"""Minimalist dark book cover for "{title}",
                single glowing eye in darkness, subtle tentacle shadows,
                matte black background, elegant typography""",
            "chinese_dark": f"""暗黑中国风书籍封面，{title},
                水墨风格，深海恐惧，古老神兽，暗色调，
                恐怖氛围，高质量插画""",
        }
        
        return prompts.get(style, prompts["dark_horror"])
    
    def get_generators(self):
        return self.GENERATORS


# ============================================================
# 一键部署脚本生成器
# ============================================================
class DeploymentScriptGenerator:
    """生成一键部署脚本"""
    
    @staticmethod
    def generate_setup_script():
        """生成完整环境搭建脚本"""
        return '''@echo off
REM 克苏鲁有声书系统 - 一键环境搭建
REM 所有工具都是免费的！

echo ============================================
echo  克苏鲁有声书系统 - 免费工具一键安装
echo ============================================
echo.

REM 1. 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到Python，请先安装Python 3.10+
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python已安装

REM 2. 安装核心依赖
echo.
echo [1/5] 安装核心依赖...
pip install edge-tts apscheduler playwright Pillow

REM 3. 安装浏览器
echo.
echo [2/5] 安装Playwright浏览器...
python -m playwright install chromium

REM 4. 安装ffmpeg
echo.
echo [3/5] 检查ffmpeg...
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo [提示] ffmpeg未安装，视频合成功能将不可用
    echo 下载地址: https://ffmpeg.org/download.html
    echo 或使用: winget install ffmpeg
) else (
    echo [OK] ffmpeg已安装
)

REM 5. 创建目录
echo.
echo [4/5] 创建目录结构...
mkdir content audio data publish screenshots promotion youtube 2>nul
mkdir data\\content_cache data\\growth data\\monitor_log data\\consensus_log 2>nul

REM 6. 完成
echo.
echo [5/5] 安装完成！
echo.
echo ============================================
echo  下一步:
echo  1. 运行: python system_health.py (健康检查)
echo  2. 运行: python content_fetcher.py all (获取内容)
echo  3. 运行: python full_autopilot.py --once (测试闭环)
echo  4. 运行: start_scheduler.bat (启动调度器)
echo ============================================
pause
'''
    
    @staticmethod
    def generate_github_actions_setup():
        """生成GitHub Actions配置"""
        return {
            "filename": ".github/workflows/daily_autopilot.yml",
            "content": '''name: 克苏鲁每日自动闭环
on:
  schedule:
    - cron: '0 18 * * *'  # 北京时间02:00
  workflow_dispatch:

permissions:
  contents: write

jobs:
  autopilot:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
          cache: 'pip'
      - name: 安装依赖
        run: |
          pip install edge-tts apscheduler playwright
          playwright install chromium --with-deps
      - name: 运行闭环
        run: python full_autopilot.py --once
      - name: 提交变更
        run: |
          git config user.name "Bot"
          git config user.email "bot@github.com"
          git add -A data/ content/
          git diff --cached --quiet || git commit -m "auto update" && git push
'''
        }


# ============================================================
# CLI
# ============================================================
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "recommend":
        router = MultiEngineTTS()
        use_case = sys.argv[2] if len(sys.argv) > 2 else "general"
        rec = router.get_recommendation(use_case)
        print(f"=== TTS引擎推荐 ({use_case}) ===")
        for role, (engine, reason) in rec.items():
            info = router.get_engine_info(engine)
            print(f"  {role}: {info.get('name', engine)}")
            print(f"    原因: {reason}")
            print(f"    音质: {info.get('quality', '?')}/5, 速度: {info.get('speed', '?')}/5")
            print()
    
    elif len(sys.argv) > 1 and sys.argv[1] == "install":
        installer = FreeResourceInstaller()
        tool = sys.argv[2] if len(sys.argv) > 2 else "all"
        if tool == "all":
            print("=== 可安装的免费工具 ===")
            for k, v in installer.list_all().items():
                print(f"  {k}: {v}")
        else:
            guide = installer.get_install_guide(tool)
            if guide:
                print(f"=== {guide.get('name', tool)} ===")
                print(f"需求: {guide.get('requirements', [])}")
                print(guide.get('commands', ''))
    
    elif len(sys.argv) > 1 and sys.argv[1] == "music":
        downloader = FreeMusicDownloader()
        mood = sys.argv[2] if len(sys.argv) > 2 else "dark_ambient"
        urls = downloader.search_horror_mood(mood)
        print(f"=== 恐怖音乐资源 ({mood}) ===")
        for url in urls:
            print(f"  {url}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "cover":
        gen = FreeImageGenerator()
        title = sys.argv[2] if len(sys.argv) > 2 else "克苏鲁的呼唤"
        style = sys.argv[3] if len(sys.argv) > 3 else "dark_horror"
        prompt = gen.get_cover_prompt(title, style)
        print(f"=== 封面提示词 ({style}) ===")
        print(prompt)
        print()
        print("=== 可用生成器 ===")
        for gid, info in gen.get_generators().items():
            print(f"  {info['name']}: {info['free']} - {info.get('note', '')}")
    
    elif len(sys.argv) > 1 and sys.argv[1] == "setup":
        script = DeploymentScriptGenerator.generate_setup_script()
        with open("一键安装.bat", "w", encoding="utf-8") as f:
            f.write(script)
        print("已生成: 一键安装.bat")
    
    else:
        print("免费资源利用工具集")
        print()
        print("用法:")
        print("  python free_resource_toolkit.py recommend [use_case]  - TTS引擎推荐")
        print("  python free_resource_toolkit.py install [tool]       - 安装指南")
        print("  python free_resource_toolkit.py music [mood]         - 音乐资源")
        print("  python free_resource_toolkit.py cover [title] [style]- 封面提示词")
        print("  python free_resource_toolkit.py setup                - 生成安装脚本")
        print()
        print("use_case: general | high_quality | voice_cloning | fast | free_forever")
        print("mood: dark_ambient | horror_atmosphere | cinematic_tension | deep_sea | creepy_piano")
        print("style: dark_horror | lovecraft | minimalist | chinese_dark")
