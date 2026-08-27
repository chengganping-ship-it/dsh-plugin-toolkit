"""
Kimodo Product - Web GUI (Simplified)
避免 Gradio 版本兼容性问题，使用基础组件
"""

import requests
import gradio as gr

API_BASE = "http://127.0.0.1:8765"

def generate_motion(text, duration, skeleton, steps, fmt):
    """调用 API 生成动作"""
    if not text.strip():
        return "Please enter a motion description", None

    payload = {
        "input_text": text,
        "duration_seconds": float(duration),
        "skeleton": skeleton,
        "denoising_steps": int(steps),
        "output_format": fmt
    }

    try:
        resp = requests.post(
            f"{API_BASE}/api/motion/generate",
            json=payload,
            timeout=300
        )
        data = resp.json()

        if resp.status_code == 200:
            result = f"Success! ID: {data['request_id']}\nTime: {data['generation_time_ms']:.0f}ms\nFile: {data['output_file']}"
            return result, data['request_id']
        else:
            return f"Error: {data.get('detail', 'Unknown error')}", None

    except requests.ConnectionError:
        return "Cannot connect to API. Start backend first.", None
    except Exception as e:
        return f"Request failed: {str(e)}", None

def check_health():
    """检查 API 健康状态"""
    try:
        resp = requests.get(f"{API_BASE}/api/health", timeout=3)
        d = resp.json()
        return f"Status: {d['status']}\nGPU: {'Yes' if d['gpu_available'] else 'No'}\nModel: {'Loaded' if d['kimodo_model_loaded'] else 'Not loaded'}\nVersion: {d['version']}"
    except Exception:
        return "API not running"

# Build simple interface
with gr.Blocks(title="Kimodo Product") as demo:
    gr.Markdown("# Kimodo Product - Text to 3D Motion")
    gr.Markdown("Generate 3D character animations from text using NVIDIA Kimodo model")

    with gr.Row():
        with gr.Column():
            input_text = gr.Textbox(
                label="Motion Description",
                placeholder="a person waves hand and bows",
                lines=2
            )
            duration = gr.Dropdown(
                choices=["1", "2", "3", "5", "10"],
                value="3",
                label="Duration (seconds)"
            )
            skeleton = gr.Dropdown(
                choices=["SOMA-RP", "SOMA", "Unitree-G1", "SMPL-X"],
                value="SOMA-RP",
                label="Skeleton Type"
            )
            steps = gr.Dropdown(
                choices=["50", "100", "200", "500"],
                value="100",
                label="Denoising Steps"
            )
            fmt = gr.Dropdown(
                choices=["npz", "fbx", "bvh"],
                value="npz",
                label="Output Format"
            )
            btn = gr.Button("Generate Motion", variant="primary")

        with gr.Column():
            result = gr.Textbox(label="Result", lines=8, interactive=False)
            req_id = gr.Textbox(visible=False)

    with gr.Row():
        health_btn = gr.Button("Check API Status")
        health_out = gr.Textbox(label="API Status", lines=5, interactive=False)

    # Events
    btn.click(
        fn=generate_motion,
        inputs=[input_text, duration, skeleton, steps, fmt],
        outputs=[result, req_id]
    )
    health_btn.click(fn=check_health, outputs=health_out)

if __name__ == "__main__":
    demo.launch(
        server_name="127.0.0.1",
        server_port=7860
    )
