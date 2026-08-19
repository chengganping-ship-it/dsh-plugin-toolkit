"""
服装电商 AI 产品矩阵模块
包含: 模特素材 / 场景 / 文案 / 视频脚本
全部调用云端 API, 本地无需 GPU
"""
import os
import random
from pathlib import Path


class ModelGenerator:
    """AI 模特素材生成 — fal.ai / siliconflow"""

    def __init__(self):
        self.fal_key = os.getenv("FAL_KEY", "")
        self.silicon_key = os.getenv("SILICONFLOW_API_KEY", "")

    def generate_model(self, description: str, output_dir: Path,
                       width: int = 768, height: int = 1024) -> str:
        """生成 AI 模特图"""
        out_path = str(output_dir / f"model_{random.randint(1000,9999)}.png")
        # placeholder: 调用 fal.ai FLUX 或硅基 SDXL
        # 实际实现需要 requests 调用云端 API
        return out_path

    @staticmethod
    def get_preset_models():
        """预置模特库 (站图/Pexels 免费图片)"""
        return [
            {"id": "model_01", "name": "亚洲女模特", "ethnicity": "asian", "gender": "female", "age": 25},
            {"id": "model_02", "name": "亚洲男模特", "ethnicity": "asian", "gender": "male", "age": 28},
            {"id": "model_03", "name": "欧美女模特", "ethnicity": "caucasian", "gender": "female", "age": 24},
            {"id": "model_04", "name": "欧美男模特", "ethnicity": "caucasian", "gender": "male", "age": 30},
            {"id": "model_05", "name": "非裔模特", "ethnicity": "african", "gender": "female", "age": 26},
        ]


class SceneGenerator:
    """场景背景生成 — 免费素材 + AI 场景生成"""

    def get_preset_scenes(self):
        return [
            {"id": "scene_white", "name": "白底棚拍", "color": "#FFFFFF", "en": "studio_white"},
            {"id": "scene_street", "name": "街头休闲", "color": "#87CEEB", "en": "street"},
            {"id": "scene_beach", "name": "沙滩度假", "color": "#F4A460", "en": "beach"},
            {"id": "scene_office", "name": "商务职场", "color": "#4682B4", "en": "office"},
            {"id": "scene_cafe", "name": "咖啡厅", "color": "#D2B48C", "en": "cafe"},
            {"id": "scene_park", "name": "公园户外", "color": "#90EE90", "en": "park"},
            {"id": "scene_gradient", "name": "渐变时尚", "color": "#E6E6FA", "en": "gradient"},
            {"id": "scene_night", "name": "夜景都市", "color": "#191970", "en": "night_city"},
        ]

    def apply_scene(self, person_image_path: str, scene_id: str, output_dir: Path) -> str:
        """把人物合成到指定场景 (用 PIL 简单实现, 后期可调用 rembg + 背景替换)"""
        try:
            from PIL import Image
            person = Image.open(person_image_path).convert("RGBA")
            out = person  # placeholder
            out_path = str(output_dir / f"scene_{scene_id}_{random.randint(1000,9999)}.png")
            out.save(out_path, "PNG")
            return out_path
        except Exception as e:
            return person_image_path


class CopywritingEngine:
    """AI 文案引擎 — DeepSeek / LLM"""

    def __init__(self):
        self.api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self.base_url = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
        self.enabled = bool(self.api_key)

    def generate_copy(self, product_name: str, product_desc: str,
                      platform: str = "xiaohongshu", tone: str = "professional") -> dict:
        """生成电商文案"""
        if not self.enabled:
            return self._mock_copy(product_name, product_desc, platform)

        try:
            import requests
            prompt = self._build_prompt(product_name, product_desc, platform, tone)
            res = requests.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.8,
                },
                timeout=30
            )
            text = res.json()["choices"][0]["message"]["content"]
            return {"ok": True, "text": text}
        except Exception as e:
            return self._mock_copy(product_name, product_desc, platform)

    def _mock_copy(self, name, desc, platform):
        templates = {
            "xiaohongshu": f"✨【{name}】{desc}\n\n姐妹们这件真的绝了！版型超级正,面料摸起来很有质感,穿上直接气质翻倍～\n\n#穿搭分享 #好物推荐 #这件真的好看",
            "douyin": f"家人们看过来！{name}到手真的惊喜,{desc},这个价格太值了！评论区告诉我你们想什么颜色？",
            "taobao": f"【{name}】{desc}\n\n限时特惠,全国包邮,七天无理由退换,这件衣服你值得拥有！",
            "amazon": f"{name} - Perfect for any occasion. {desc} Premium fabric, comfortable fit. Order now with fast shipping!",
        }
        return {"ok": False, "text": templates.get(platform, templates["xiaohongshu"])}

    def _build_prompt(self, name, desc, platform, tone):
        tones = {
            "professional": "专业、信任感强",
            "casual": "接地气、朋友聊天感",
            "luxury": "高端、轻奢调性",
            "youth": "年轻、活泼、网络热梗",
        }
        platform_hints = {
            "xiaohongshu": "写种草笔记, 用 emoji 点缀, 突出质感和上身效果",
            "douyin": "短视频口播稿, 节奏快, 有反转钩子, 引导评论互动",
            "taobao": "商品详情文案, 突出性价比和促销紧迫感",
            "amazon": "English product listing, SEO optimized, highlight features",
        }
        return (
            f"你是资深电商文案。为以下商品写一篇 {platform} 文案:\n"
            f"商品名: {name}\n"
            f"卖点: {desc}\n"
            f"语气风格: {tones.get(tone, tone)}\n"
            f"格式要求: {platform_hints.get(platform, '')}\n"
            f"直接输出文案, 不要解释。"
        )


class VideoWorkflow:
    """视频工作流 — 编排: 试穿图 + 配音 + 数字人"""

    def __init__(self):
        self.eleven_key = os.getenv("ELEVENLABS_API_KEY", "")

    def create_video_brief(self, images: list, product_name: str) -> dict:
        """创建视频制作 brief, 输出给即梦/可灵等数字人 API"""
        return {
            "product": product_name,
            "slides": len(images),
            "duration_estimate": len(images) * 4,  # 4 秒/张
            "voiceover": f"Hi everyone! Let me show you our {product_name}...",
            "platforms": ["jimeng", "keling"],
        }

    def generate_tts(self, text: str, voice_id: str = "female_01",
                     output_dir: Path = None) -> str:
        """生成配音 (Edge-TTS 免费 / ElevenLabs 高质量)"""
        if output_dir is None:
            output_dir = Path("/tmp/tts")
        output_dir.mkdir(parents=True, exist_ok=True)
        out = str(output_dir / f"tts_{random.randint(10000,99999)}.mp3")

        if self.eleven_key:
            try:
                import requests
                res = requests.post(
                    f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                    headers={"xi-api-key": self.eleven_key},
                    json={"text": text, "voice_settings": {"stability": 0.5, "similarity_boost": 0.7}},
                    timeout=30
                )
                with open(out, "wb") as f:
                    f.write(res.content)
                return out
            except Exception as e:
                print(f"[TTS] ElevenLabs 失败: {e}, 用 Edge-TTS 兜底")

        # Edge-TTS (完全免费)
        try:
            import asyncio
            import edge_tts
            asyncio.run(edge_tts.Communicate(text, "zh-CN-XiaoxiaoNeural").save(out))
            return out
        except Exception as e:
            print(f"[TTS] Edge-TTS 失败: {e}")
            return ""
