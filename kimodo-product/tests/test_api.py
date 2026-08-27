"""
Kimodo Product - API 测试
验证 FastAPI 服务端点正常工作
"""

import pytest
import sys
from pathlib import Path

# 添加项目根目录到路径
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

# 测试前检查依赖
fastapi_available = False
try:
    from fastapi.testclient import TestClient
    from src.api.server import app, pipeline
    fastapi_available = True
except ImportError:
    pass

@pytest.mark.skipif(not fastapi_available, reason="FastAPI not installed")
class TestAPI:
    """API 端点测试"""

    @pytest.fixture(autouse=True)
    def setup(self):
        # 直接创建并注入一个 mock pipeline
        import src.api.server as server_mod
        mock_pl = server_mod.KimodoPipeline()
        mock_pl.model_loaded = True  # 跳过真实模型加载
        # 替换全局 pipeline
        self._original_pipeline = server_mod.pipeline
        server_mod.pipeline = mock_pl
        self.client = TestClient(app)

    def teardown_method(self):
        # 恢复原始 pipeline
        import src.api.server as server_mod
        server_mod.pipeline = getattr(self, '_original_pipeline', None)

    def test_health_check(self):
        """健康检查"""
        response = self.client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] in ["healthy", "initializing"]
        assert "version" in data

    def test_generate_motion(self):
        """生成动作"""
        payload = {
            "input_text": "a person walks forward",
            "duration_seconds": 2.0,
            "skeleton": "SOMA-RP",
            "denoising_steps": 500,
            "output_format": "npz"
        }
        response = self.client.post("/api/motion/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["request_id"] is not None
        assert data["generation_time_ms"] > 0

    def test_generate_motion_validation(self):
        """参数验证"""
        # 缺少必填字段 input_text
        response = self.client.post("/api/motion/generate", json={
            "duration_seconds": 1.0
        })
        assert response.status_code == 422, f"缺少必填字段应返回 422, 实际 {response.status_code}"

        # 持续时间超出范围 (>10.0)
        response = self.client.post("/api/motion/generate", json={
            "input_text": "test motion",
            "duration_seconds": 20.0
        })
        assert response.status_code == 422, f"超范围应返回 422, 实际 {response.status_code}"

        # 持续时间低于范围 (<0.5)
        response = self.client.post("/api/motion/generate", json={
            "input_text": "test motion",
            "duration_seconds": 0.1
        })
        assert response.status_code == 422, f"低于范围应返回 422, 实际 {response.status_code}"

        # 无效的 enum 值
        response = self.client.post("/api/motion/generate", json={
            "input_text": "test motion",
            "skeleton": "InvalidSkeleton"
        })
        assert response.status_code == 422, f"无效枚举应返回 422, 实际 {response.status_code}"

    def test_download_not_found(self):
        """下载不存在的文件"""
        response = self.client.get("/api/motion/download/nonexistent")
        assert response.status_code == 404

    def test_history(self):
        """历史记录"""
        response = self.client.get("/api/history")
        assert response.status_code == 200
        data = response.json()
        assert "history" in data

    def test_preview_not_found(self):
        """预览不存在的动作"""
        response = self.client.get("/api/preview/nonexistent")
        assert response.status_code == 404

class TestPipeline:
    """Pipeline 单元测试"""

    def test_gpu_detection(self):
        """GPU 检测"""
        try:
            from src.api.server import KimodoPipeline
            p = KimodoPipeline()
            # 不要求一定有 GPU，但不应崩溃
            assert p.device in ["cuda", "cpu"]
        except ImportError:
            pytest.skip("Pipeline 依赖未安装")

    def test_mock_generation(self):
        """Mock 生成测试"""
        try:
            from src.api.server import KimodoPipeline, MotionRequest
            p = KimodoPipeline()
            p.model_loaded = True  # 跳过真实模型加载

            request = MotionRequest(
                input_text="test motion",
                duration_seconds=1.0,
                skeleton="SOMA-RP",
                denoising_steps=100
            )
            result = p.generate(request)
            assert result["status"] == "success"
            assert result["num_frames"] == 30  # 1秒 * 30fps
        except ImportError:
            pytest.skip("Pipeline 依赖未安装")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
