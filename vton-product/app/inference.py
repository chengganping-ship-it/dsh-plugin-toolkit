"""
VTON 虚拟试穿推理引擎 — 多云端适配
支持: mock / fal / replicate / siliconflow
"""
import os
import time
import uuid
import random
import base64
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw

from .config import OUTPUT_DIR

_engine = None


def get_engine(backend: str = None):
    global _engine
    if _engine is None:
        if backend is None:
            backend = os.getenv("VTON_BACKEND", "mock")
        _engine = VTONEngine(backend)
    return _engine


class VTONEngine:
    def __init__(self, backend: str = "mock"):
        self.backend = backend
        self.fal_key = os.getenv("FAL_KEY", "")
        self.replicate_token = os.getenv("REPLICATE_API_TOKEN", "")
        self.silicon_key = os.getenv("SILICONFLOW_API_KEY", "")

        # Auto-fallback if desired backend has no key
        if backend == "cloud":
            if self.fal_key:
                self.backend = "fal"
            elif self.replicate_token:
                self.backend = "replicate"
            elif self.silicon_key:
                self.backend = "siliconflow"
            else:
                print("[VTON] cloud 模式无 API Key, 回退到 mock")
                self.backend = "mock"

        print(f"[VTONEngine] 后端: {self.backend}")

    def generate(self, person_path: str, cloth_path: str,
                 garment_type: str = "upperbody", seed: int = -1) -> str:
        if seed == -1:
            seed = random.randint(0, 2 ** 31)

        out_name = f"result_{uuid.uuid4().hex[:8]}.png"
        out_path = str(OUTPUT_DIR / out_name)

        try:
            if self.backend == "mock":
                self._mock(person_path, cloth_path, out_path, seed)
            elif self.backend == "fal":
                self._fal(person_path, cloth_path, out_path, garment_type)
            elif self.backend == "replicate":
                self._replicate(person_path, cloth_path, out_path)
            elif self.backend == "siliconflow":
                self._siliconflow(person_path, cloth_path, out_path)
            else:
                self._mock(person_path, cloth_path, out_path, seed)
        except Exception as e:
            print(f"[{self.backend}] 推理失败: {e}, 降级到 mock")
            self._mock(person_path, cloth_path, out_path, seed)

        return out_path

    def _mock(self, person_path, cloth_path, out_path, seed):
        """本地贴效果图（无 API Key 时的 fallback）"""
        random.seed(seed)
        time.sleep(0.8)
        person = Image.open(person_path).convert("RGBA")
        cloth = Image.open(cloth_path).convert("RGBA")
        w, h = person.size
        cloth_r = cloth.resize((int(w * 0.35), int(h * 0.35)), Image.LANCZOS)
        cx, cy = (w - cloth_r.width) // 2, int(h * 0.25)
        person.paste(cloth_r, (cx, cy), cloth_r)
        draw = ImageDraw.Draw(person)
        draw.text((10, h - 28), f"seed={seed}", fill=(255, 255, 255, 200))
        person.save(out_path, "PNG")

    def _fal(self, person_path, cloth_path, out_path, garment_type):
        """fal.ai 云端 — 需要 FAL_KEY"""
        import requests
        # fal.ai 上传图片
        with open(person_path, "rb") as f:
            person_resp = requests.post(
                "https://fal.ai/api/storage/upload",
                headers={"Authorization": f"Key {self.fal_key}"},
                files={"file": ("person.jpg", f, "image/jpeg")}
            )
        with open(cloth_path, "rb") as f:
            cloth_resp = requests.post(
                "https://fal.ai/api/storage/upload",
                headers={"Authorization": f"Key {self.fal_key}"},
                files={"file": ("cloth.jpg", f, "image/jpeg")}
        )
        person_url = person_resp.json()["url"]
        cloth_url = cloth_resp.json()["url"]

        # 调用 fal VTON (示例用 fal-ai 虚拟试穿或 SDXL inpainting)
        result = requests.post(
            "https://fal.run/fal-ai/game-mask",
            headers={"Authorization": f"Key {self.fal_key}"},
            json={"image_url": person_url, "mask": cloth_url}  # placeholder
        )
        # 实际应调用具体模型, 以下为占位
        # 下载结果
        result_url = result.json()["images"][0]["url"]
        img_data = requests.get(result_url).content
        with open(out_path, "wb") as f:
            f.write(img_data)

    def _replicate(self, person_path, cloth_path, out_path):
        """Replicate 云端 — 需要 REPLICATE_API_TOKEN"""
        start = time.time()
        with open(person_path, "rb") as pf, open(cloth_path, "rb") as cf:
            import requests
            resp = requests.post(
                "https://api.replicate.com/v1/predictions",
                headers={"Authorization": f"Token {self.replicate_token}"},
                json={
                    "version": "yisol/IDM-VTON",  # placeholder hash
                    "input": {
                        "human_img": f"data:image/jpeg;base64,{base64.b64encode(pf.read()).decode()}",
                        "garm_img": f"data:image/jpeg;base64,{base64.b64encode(cf.read()).decode()}",
                    }
                }
            )
            prediction = resp.json()
            # 轮询等待
            while prediction["status"] not in ("succeeded", "failed"):
                time.sleep(1)
                prediction = requests.get(
                    prediction["urls"]["get"],
                    headers={"Authorization": f"Token {self.replicate_token}"}
                ).json()
            if prediction["status"] == "succeeded":
                img_url = prediction["output"][-1]
                img_data = requests.get(img_url).content
                with open(out_path, "wb") as f:
                    f.write(img_data)
        print(f"[Replicate] 耗时 {time.time() - start:.1f}s")

    def _siliconflow(self, person_path, cloth_path, out_path):
        """硅基流动云端 — 需要 SILICONFLOW_API_KEY"""
        self._mock(person_path, cloth_path, out_path, 0)  # placeholder
