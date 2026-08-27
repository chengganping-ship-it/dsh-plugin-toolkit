/**
 * VLX-Seek AI Native Game Prototype - Frontend Demo
 * 三个核心玩法的交互逻辑
 */

// ============================================================
// 全局配置与状态
// ============================================================

const API_BASE = 'http://localhost:8765';
const REFRESH_INTERVAL = 5000; // 服务器状态刷新间隔

const state = {
    currentDemo: 1,
    serverConnected: false,
    // Demo 1: Anomaly Inspector
    demo1: {
        score: 0,
        found: 0,
        selectionStart: null,
        selectionEnd: null,
        isSelecting: false,
        currentImage: null
    },
    // Demo 2: Word Spirit Hacker
    demo2: {
        streaming: false,
        streamInterval: null,
        collected: 0,
        videoStream: null,
        lastFrameTime: 0,
        fps: 0
    },
    // Demo 3: Semantic Possession
    demo3: {
        currentImage: null,
        possessed: false
    }
};

// ============================================================
// 工具函数
// ============================================================

function log(message, type = 'info') {
    const logEl = document.getElementById('debug-log');
    const time = new Date().toLocaleTimeString();
    const color = type === 'error' ? '#ff4444' : type === 'success' ? '#00ff88' : '#666';
    logEl.innerHTML += `<div style="color:${color}">[${time}] ${message}</div>`;
    logEl.scrollTop = logEl.scrollHeight;
}

async function apiCall(endpoint, data = null) {
    const options = {
        method: data ? 'POST' : 'GET',
        headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);

    const start = performance.now();
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const latency = Math.round(performance.now() - start);

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const result = await response.json();
    result._latency = latency;
    return result;
}

function getCanvasBase64(canvasId) {
    const canvas = document.getElementById(canvasId);
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
}

// ============================================================
// 服务器状态检测
// ============================================================

async function checkServer() {
    try {
        const health = await apiCall('/api/health');
        state.serverConnected = true;
        document.getElementById('serverStatus').classList.add('connected');
        document.getElementById('statusText').textContent = `Connected (${health.mode})`;
        document.getElementById('server-model').textContent = `Model: ${health.model_name}`;
        document.getElementById('server-mode').textContent = `Mode: ${health.mode}`;
        return health;
    } catch (e) {
        state.serverConnected = false;
        document.getElementById('serverStatus').classList.remove('connected');
        document.getElementById('statusText').textContent = 'Disconnected';
        return null;
    }
}

// ============================================================
// Tab 切换
// ============================================================

function switchTab(demoNum) {
    state.currentDemo = demoNum;

    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-demo="${demoNum}"]`).classList.add('active');

    document.querySelectorAll('.demo-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`demo${demoNum}-panel`).classList.remove('hidden');

    log(`切换到 Demo ${demoNum}`);

    // Demo 2 离开时停止摄像头
    if (demoNum !== 2 && state.demo2.streaming) {
        stopCamera();
    }
}

// ============================================================
// Demo 1: 异常审查员 (Anomaly Inspector)
// ============================================================

const DEMO1_INSTRUCTIONS = [
    "找出画面中不属于这个房间的东西",
    "找到与整体风格最违和的物体",
    "哪个东西不应该出现在这里？",
    "找出最可疑的物品",
    "谁不属于这个场景？"
];

const DEMO1_SCENE_COLORS = [
    { bg: '#2a1810', furniture: '#8b5e3c', accent: '#d4a574' },
    { bg: '#1a2a1a', furniture: '#4a7a4a', accent: '#8fbc8f' },
    { bg: '#1a1a2a', furniture: '#5e5e8b', accent: '#a5a5d4' }
];

function drawScene1() {
    const canvas = document.getElementById('demo1-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;

    const scene = DEMO1_SCENE_COLORS[Math.floor(Math.random() * DEMO1_SCENE_COLORS.length)];

    // 背景
    ctx.fillStyle = scene.bg;
    ctx.fillRect(0, 0, 800, 500);

    // 地板
    ctx.fillStyle = adjustColor(scene.furniture, -30);
    ctx.fillRect(0, 380, 800, 120);

    // 墙壁装饰线
    ctx.strokeStyle = adjustColor(scene.bg, 20);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 380); ctx.lineTo(800, 380); ctx.stroke();

    // 绘制家具 - 这里会随机产生"异常"元素
    const furniture = [
        { type: 'bookshelf', x: 50, y: 100, w: 120, h: 280 },
        { type: 'table', x: 300, y: 280, w: 200, h: 100 },
        { type: 'chair', x: 550, y: 300, w: 80, h: 80 },
        { type: 'lamp', x: 700, y: 150, w: 40, h: 200 },
        { type: 'painting', x: 200, y: 80, w: 150, h: 100 },
        { type: 'clock', x: 600, y: 100, w: 60, h: 60 },
        { type: 'plant', x: 720, y: 320, w: 50, h: 60 },
        { type: 'sofa', x: 250, y: 350, w: 250, h: 30 }
    ];

    furniture.forEach(f => {
        ctx.fillStyle = scene.furniture;
        ctx.fillRect(f.x, f.y, f.w, f.h);
        // 简单的高光
        ctx.fillStyle = adjustColor(scene.furniture, 30);
        ctx.fillRect(f.x, f.y, f.w, 5);
    });

    // 添加一个"异常物体"（颜色/形状明显不同）
    const anomalyX = 400 + Math.random() * 100 - 50;
    const anomalyY = 200 + Math.random() * 100;
    ctx.fillStyle = '#ff3366'; // 异常物体用醒目颜色
    ctx.beginPath();
    ctx.arc(anomalyX, anomalyY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff6699';
    ctx.beginPath();
    ctx.arc(anomalyX - 8, anomalyY - 8, 10, 0, Math.PI * 2);
    ctx.fill();

    // 添加一些纹理
    for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
        ctx.fillRect(Math.random() * 800, Math.random() * 500, 2, 2);
    }

    state.demo1.currentImage = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    return canvas;
}

function adjustColor(hex, amount) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

function initDemo1() {
    drawScene1();
    document.getElementById('demo1-instruction').textContent =
        DEMO1_INSTRUCTIONS[Math.floor(Math.random() * DEMO1_INSTRUCTIONS.length)];

    const canvas = document.getElementById('demo1-canvas');

    // 鼠标事件 - 框选
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        state.demo1.selectionStart = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
        state.demo1.isSelecting = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!state.demo1.isSelecting) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        state.demo1.selectionEnd = {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
        updateSelectionBox();
    });

    canvas.addEventListener('mouseup', () => {
        state.demo1.isSelecting = false;
    });

    // 按钮事件
    document.getElementById('demo1-submit').addEventListener('click', submitDemo1);
    document.getElementById('demo1-reset').addEventListener('click', () => {
        drawScene1();
        document.getElementById('demo1-instruction').textContent =
            DEMO1_INSTRUCTIONS[Math.floor(Math.random() * DEMO1_INSTRUCTIONS.length)];
        document.getElementById('demo1-selection-box').classList.add('hidden');
        document.getElementById('demo1-result').classList.add('hidden');
        state.demo1.selectionStart = null;
        state.demo1.selectionEnd = null;
        log('Demo1: 场景已重置');
    });
}

function updateSelectionBox() {
    const canvas = document.getElementById('demo1-canvas');
    const box = document.getElementById('demo1-selection-box');
    const rect = canvas.getBoundingClientRect();

    if (!state.demo1.selectionStart || !state.demo1.selectionEnd) return;

    const x = Math.min(state.demo1.selectionStart.x, state.demo1.selectionEnd.x) / canvas.width * rect.width;
    const y = Math.min(state.demo1.selectionStart.y, state.demo1.selectionEnd.y) / canvas.height * rect.height;
    const w = Math.abs(state.demo1.selectionEnd.x - state.demo1.selectionStart.x) / canvas.width * rect.width;
    const h = Math.abs(state.demo1.selectionEnd.y - state.demo1.selectionStart.y) / canvas.height * rect.height;

    box.style.left = `${x}px`;
    box.style.top = `${y}px`;
    box.style.width = `${w}px`;
    box.style.height = `${h}px`;
    box.classList.remove('hidden');
}

async function submitDemo1() {
    if (!state.demo1.selectionStart || !state.demo1.selectionEnd) {
        alert('请先框选可疑区域！');
        return;
    }

    const canvas = document.getElementById('demo1-canvas');
    const resultEl = document.getElementById('demo1-result');
    resultEl.classList.add('hidden');

    // 计算归一化选择区域
    const selection = {
        x: Math.min(state.demo1.selectionStart.x, state.demo1.selectionEnd.x) / canvas.width,
        y: Math.min(state.demo1.selectionStart.y, state.demo1.selectionEnd.y) / canvas.height,
        width: Math.abs(state.demo1.selectionEnd.x - state.demo1.selectionStart.x) / canvas.width,
        height: Math.abs(state.demo1.selectionEnd.y - state.demo1.selectionStart.y) / canvas.height
    };

    const prompt = document.getElementById('demo1-instruction').textContent;

    try {
        log(`Demo1: 提交审查 - "${prompt}"`);
        const result = await apiCall('/api/verify-selection', {
            image_base64: state.demo1.currentImage,
            prompt: prompt,
            selection: selection,
            threshold: 0.3
        });

        resultEl.classList.remove('hidden');

        if (result.hit) {
            resultEl.className = 'result-display result-success';
            resultEl.textContent = `审查通过! IoU=${result.iou} | 延迟=${result.inference_time_ms}ms`;
            state.demo1.score += 100;
            state.demo1.found++;
            document.getElementById('demo1-score').textContent = state.demo1.score;
            document.getElementById('demo1-found').textContent = state.demo1.found;
            document.getElementById('demo1-state').textContent = '发现异常!';
            log(`Demo1: 命中目标! IoU=${result.iou}`, 'success');
        } else {
            resultEl.className = 'result-display result-fail';
            resultEl.textContent = `审查失败! 未命中目标 (IoU=${result.iou})`;
            document.getElementById('demo1-state').textContent = '审查失败';
            // 故障特效
            canvas.classList.add('glitch-effect');
            setTimeout(() => canvas.classList.remove('glitch-effect'), 1000);
            log(`Demo1: 未命中 (IoU=${result.iou})`, 'error');
        }
    } catch (e) {
        log(`Demo1: 错误 - ${e.message}`, 'error');
        resultEl.classList.remove('hidden');
        resultEl.className = 'result-display result-fail';
        resultEl.textContent = `服务器错误: ${e.message}`;
    }
}

// ============================================================
// Demo 2: 言灵黑客 (Word Spirit Hacker)
// ============================================================

const DEMO2_TARGETS = [
    "red cylinder",
    "blue object",
    "green plant",
    "white cup",
    "yellow item",
    "black device",
    "colorful object",
    "metallic surface"
];

function initDemo2() {
    document.getElementById('demo2-start').addEventListener('click', toggleCamera);
    document.getElementById('demo2-change').addEventListener('click', () => {
        document.getElementById('demo2-instruction').textContent =
            "寻找一个" + DEMO2_TARGETS[Math.floor(Math.random() * DEMO2_TARGETS.length)];
        state.demo2.collected = 0;
        document.getElementById('demo2-collected').textContent = '0';
        log('Demo2: 目标已更换');
    });
}

async function toggleCamera() {
    if (state.demo2.streaming) {
        stopCamera();
    } else {
        startCamera();
    }
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: 640, height: 480 }
        });
        state.demo2.videoStream = stream;
        const video = document.getElementById('demo2-video');
        video.srcObject = stream;
        state.demo2.streaming = true;
        document.getElementById('demo2-start').textContent = '关闭摄像头';
        log('Demo2: 摄像头已开启');

        // 开始抽帧循环
        state.demo2.streamInterval = setInterval(captureAndAnalyze, 500);
    } catch (e) {
        log(`Demo2: 摄像头错误 - ${e.message}`, 'error');
        alert('无法访问摄像头: ' + e.message);
    }
}

function stopCamera() {
    if (state.demo2.streamInterval) {
        clearInterval(state.demo2.streamInterval);
        state.demo2.streamInterval = null;
    }
    if (state.demo2.videoStream) {
        state.demo2.videoStream.getTracks().forEach(t => t.stop());
        state.demo2.videoStream = null;
    }
    state.demo2.streaming = false;
    document.getElementById('demo2-start').textContent = '开启摄像头';
    document.getElementById('demo2-video').srcObject = null;

    // 清除 overlay
    const overlay = document.getElementById('demo2-overlay');
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    log('Demo2: 摄像头已关闭');
}

async function captureAndAnalyze() {
    const video = document.getElementById('demo2-video');
    if (!video.videoWidth) return;

    // FPS 计算
    const now = performance.now();
    if (state.demo2.lastFrameTime) {
        state.demo2.fps = Math.round(1000 / (now - state.demo2.lastFrameTime));
    }
    state.demo2.lastFrameTime = now;
    document.getElementById('demo2-fps').textContent = state.demo2.fps;

    // 绘制到临时 canvas 获取 base64
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(video, 0, 0);
    const base64 = tempCanvas.toDataURL('image/jpeg', 0.6).split(',')[1];

    const prompt = document.getElementById('demo2-instruction').textContent
        .replace('寻找一个', '');

    try {
        const result = await apiCall('/api/grounding', {
            image_base64: base64,
            prompt: prompt,
            threshold: 0.3
        });

        document.getElementById('demo2-latency').textContent = result._latency;
        drawDetectionOverlay(result.boxes);

        // 检查是否锁定成功（置信度 > 0.5 持续检测）
        if (result.boxes.length > 0 && result.boxes[0].confidence > 0.5) {
            const box = result.boxes[0];
            if (!box._lockStart) box._lockStart = now;
            const lockDuration = now - box._lockStart;

            if (lockDuration > 2000) { // 锁定 2 秒
                state.demo2.collected++;
                document.getElementById('demo2-collected').textContent = state.demo2.collected;
                log(`Demo2: 收集成功! (${state.demo2.collected}/5)`, 'success');

                // 重置目标
                box._lockStart = null;
                if (state.demo2.collected < 5) {
                    setTimeout(() => {
                        document.getElementById('demo2-instruction').textContent =
                            "寻找一个" + DEMO2_TARGETS[Math.floor(Math.random() * DEMO2_TARGETS.length)];
                    }, 1000);
                }
            }
        }
    } catch (e) {
        log(`Demo2: 分析错误 - ${e.message}`, 'error');
    }
}

function drawDetectionOverlay(boxes) {
    const overlay = document.getElementById('demo2-overlay');
    const container = document.getElementById('demo2-container');
    const video = document.getElementById('demo2-video');

    overlay.width = container.clientWidth;
    overlay.height = container.clientHeight;
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (!video.videoWidth) return;

    const scaleX = overlay.width / video.videoWidth;
    const scaleY = overlay.height / video.videoHeight;

    boxes.forEach(box => {
        const x = box.x * video.videoWidth * scaleX;
        const y = box.y * video.videoHeight * scaleY;
        const w = box.width * video.videoWidth * scaleX;
        const h = box.height * video.videoHeight * scaleY;

        // 锁定框
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);

        // 角标
        const cornerSize = 15;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#00d4ff';
        // 左上
        ctx.beginPath();
        ctx.moveTo(x, y + cornerSize); ctx.lineTo(x, y); ctx.lineTo(x + cornerSize, y);
        ctx.stroke();
        // 右下
        ctx.beginPath();
        ctx.moveTo(x + w - cornerSize, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerSize);
        ctx.stroke();

        // 标签
        ctx.fillStyle = 'rgba(0, 212, 255, 0.8)';
        ctx.fillRect(x, y - 25, w, 22);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${box.label} ${(box.confidence * 100).toFixed(0)}%`, x + 5, y - 9);
    });
}

// ============================================================
// Demo 3: 语义附身 (Semantic Possession)
// ============================================================

function drawScene3() {
    const canvas = document.getElementById('demo3-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;

    // 背景 - 房间
    const gradient = ctx.createLinearGradient(0, 0, 0, 500);
    gradient.addColorStop(0, '#2a2a3a');
    gradient.addColorStop(1, '#1a1a2a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 500);

    // 地板
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(0, 380, 800, 120);
    // 地板纹理
    ctx.strokeStyle = '#4a3a2a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 45, 380);
        ctx.lineTo(i * 45 + 20, 500);
        ctx.stroke();
    }

    // 绘制房间物品
    const objects = [
        { name: 'blue alarm clock', x: 600, y: 200, w: 50, h: 50, color: '#4488ff', type: 'circle' },
        { name: 'red book', x: 150, y: 300, w: 60, h: 40, color: '#ff4444', type: 'rect' },
        { name: 'green plant', x: 50, y: 250, w: 70, h: 130, color: '#44aa44', type: 'plant' },
        { name: 'yellow cup', x: 400, y: 320, w: 35, h: 45, color: '#ffcc00', type: 'cup' },
        { name: 'white lamp', x: 700, y: 100, w: 40, h: 150, color: '#eeeeee', type: 'lamp' },
        { name: 'purple pillow', x: 280, y: 350, w: 80, h: 50, color: '#9944cc', type: 'rect' },
        { name: 'orange ball', x: 500, y: 360, w: 40, h: 40, color: '#ff8844', type: 'circle' },
        { name: 'black tv', x: 300, y: 100, w: 120, h: 80, color: '#222222', type: 'rect' },
        { name: 'pink teddy', x: 680, y: 300, w: 55, h: 70, color: '#ff88aa', type: 'circle' },
        { name: 'silver laptop', x: 450, y: 250, w: 80, h: 50, color: '#aaaaaa', type: 'rect' }
    ];

    objects.forEach(obj => {
        ctx.fillStyle = obj.color;
        if (obj.type === 'circle') {
            ctx.beginPath();
            ctx.ellipse(obj.x + obj.w/2, obj.y + obj.h/2, obj.w/2, obj.h/2, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.type === 'plant') {
            ctx.fillRect(obj.x + 10, obj.y + 50, obj.w - 20, obj.h - 50);
            ctx.beginPath();
            ctx.arc(obj.x + obj.w/2, obj.y + 30, 35, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.type === 'cup') {
            ctx.fillRect(obj.x, obj.y + 10, obj.w, obj.h - 10);
            ctx.beginPath();
            ctx.arc(obj.x + obj.w/2, obj.y + 10, obj.w/2, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.type === 'lamp') {
            ctx.fillRect(obj.x + 15, obj.y, obj.w - 30, obj.h - 30);
            ctx.beginPath();
            ctx.moveTo(obj.x, obj.y + obj.h);
            ctx.lineTo(obj.x + obj.w, obj.y + obj.h);
            ctx.lineTo(obj.x + obj.w/2, obj.y + obj.h - 20);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(obj.x, obj.y, obj.w, obj.h);
        }

        // 物品名称标签
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '10px sans-serif';
        ctx.fillText(obj.name, obj.x, obj.y - 5);
    });

    state.demo3.currentImage = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    state.demo3.objects = objects;
    return canvas;
}

function initDemo3() {
    drawScene3();

    document.getElementById('demo3-execute').addEventListener('click', executePossession);
    document.getElementById('demo3-reset').addEventListener('click', () => {
        drawScene3();
        document.getElementById('demo3-result').classList.add('hidden');
        state.demo3.possessed = false;
        log('Demo3: 场景已重置');
    });

    // 回车执行
    document.getElementById('demo3-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executePossession();
    });
}

async function executePossession() {
    const input = document.getElementById('demo3-input').value.trim();
    if (!input) {
        alert('请输入附身指令！');
        return;
    }

    const resultEl = document.getElementById('demo3-result');
    resultEl.classList.add('hidden');

    // 从输入中提取目标物体
    const prompt = input.replace(/变成|那个|这个|我想|要/g, '').trim();

    try {
        log(`Demo3: 执行附身 - "${prompt}"`);
        const result = await apiCall('/api/grounding', {
            image_base64: state.demo3.currentImage,
            prompt: prompt,
            threshold: 0.3
        });

        if (result.boxes.length > 0) {
            const target = result.boxes[0];
            const canvas = document.getElementById('demo3-canvas');
            const ctx = canvas.getContext('2d');

            // 附身特效
            const targetX = (target.x + target.width / 2) * canvas.width;
            const targetY = (target.y + target.height / 2) * canvas.height;

            // 闪屏效果
            const flash = document.createElement('div');
            flash.className = 'possess-flash';
            flash.style.left = `${targetX - 100}px`;
            flash.style.top = `${targetY - 100}px`;
            flash.style.width = '200px';
            flash.style.height = '200px';
            document.getElementById('demo3-container').appendChild(flash);
            setTimeout(() => flash.remove(), 1000);

            // 瞬移动画 - 缩放并聚焦到目标
            animatePossession(targetX, targetY);

            resultEl.classList.remove('hidden');
            resultEl.className = 'result-display result-success';
            resultEl.textContent = `附身成功! → ${target.label} (${(target.confidence * 100).toFixed(0)}%) | 延迟=${result.inference_time_ms}ms`;
            log(`Demo3: 附身成功 → ${target.label}`, 'success');
        } else {
            resultEl.classList.remove('hidden');
            resultEl.className = 'result-display result-fail';
            resultEl.textContent = '未找到匹配的物体，附身失败！';
            log('Demo3: 未找到目标物体', 'error');
        }
    } catch (e) {
        log(`Demo3: 错误 - ${e.message}`, 'error');
        resultEl.classList.remove('hidden');
        resultEl.className = 'result-display result-fail';
        resultEl.textContent = `服务器错误: ${e.message}`;
    }
}

function animatePossession(targetX, targetY) {
    const canvas = document.getElementById('demo3-canvas');
    const container = document.getElementById('demo3-container');
    const centerX = container.clientWidth / 2;
    const centerY = container.clientHeight / 2;

    // 计算偏移使目标居中
    const scale = 1.8;
    const offsetX = centerX - targetX * scale;
    const offsetY = centerY - targetY * scale;

    // CSS 动画实现瞬移效果
    canvas.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;

    // 3秒后恢复
    setTimeout(() => {
        canvas.style.transform = 'translate(0, 0) scale(1)';
    }, 3000);
}

// ============================================================
// 初始化
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Tab 切换
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(parseInt(tab.dataset.demo));
        });
    });

    // 初始化所有 Demo
    initDemo1();
    initDemo2();
    initDemo3();

    // 服务器状态检测
    checkServer();
    setInterval(checkServer, REFRESH_INTERVAL);

    log('VLX-Seek Game Prototype 已加载');
    log(`API: ${API_BASE}`);
});
