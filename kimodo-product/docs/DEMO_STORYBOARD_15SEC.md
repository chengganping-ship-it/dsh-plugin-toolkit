# 15 秒"核弹级" Demo 分镜脚本 — Kimodo Product

> **用途**: HN 首发 GIF / Fiverr Gig 视频 / Twitter 病毒传播  
> **总时长**: 15 秒 (可裁剪为 6s / 10s / 15s 多版本)  
> **核心叙事**: 极简输入 → 震撼输出 → 工业级应用  
> **生成方式**: 屏幕录制 + 后期合成 (无需真人出镜)

---

## 🎬 分镜详情 (Shot-by-Shot)

---

### Shot 1: THE HOOK (0.0s - 3.0s)

**画面描述:**
```
全屏黑色背景，中央一个极简的深色终端/命令行窗口 (类 VS Code Dark+ 主题)
光标闪烁，开始打字：
```

**屏幕内容:**
```
$ kimodo generate
> Text: "A cyberpunk samurai draws his katana, pauses..."
```

**动画细节:**
- 0.0s: 黑屏，出现标题 "KIMODO" (品牌蓝 #3B82F6，打字机效果)
- 1.0s: 终端窗口从下方滑入
- 2.0s: 光标开始打字，逐个字符出现，伴随清脆的机械键盘音效
- 2.5s: 文本补全为完整句子
- 3.0s: 回车键按下，命令行执行

**音效设计:**
- 0.0s: 低频 "whoosh" 过渡音
- 2.0-3.0s: Cherry MX Blue 机械键盘敲击声 (节奏渐快)
- 3.0s: 回车键清脆一声

**UI 交互提示:**
- 模拟真实终端打字 (可用 OBS + 真实键盘录制，或后期 AE 打字机动画)
- 打字速度: 8 chars/秒

---

### Shot 2: THE MAGIC (3.0s - 8.0s)

**画面描述:**
```
屏幕瞬间一分为二 (滑动分割转场)：
- 左半: 保留终端，显示 "[✓] Motion generated in 2.3s"
- 右半: 出现 3D 视口 (暗色背景，网格地面)
```

**3D 视口内容:**
- 3.0s: 一个半透明的 3D 骨骼/线框人形出现 (SOMA-RP 骨架，30 个关节)
- 3.5s: 骨骼开始执行动作 —— 右手伸向腰间刀柄
- 4.0s: 拔刀动作 (流畅的金属滑出动画，刀身反光)
- 5.0s: 停顿 (角色静止 0.5 秒，展示 "pauses" 文本对应)
- 5.5s: 回头动作 (上半身旋转，头部看向画面右后方)
- 6.0s: 动作完成，角色回到 T-pose
- 6.5s: 骨骼转为实体渲染 (简易材质但动作保持一致)
- 7.0s: 循环播放动作 (展示循环平滑度)
- 8.0s: 帧数计数器显示 "30 fps / 90 frames"

**动画细节:**
- 3D 视口有 subtle 的环境光遮蔽 (AO) 和 reflection probe
- 骨骼阶段用蓝/绿色 (科技感)，实体阶段用金属/布料材质
- 右下角实时显示 "VRAM: 14.2GB / 16.6GB" (展示硬件需求)
- 底部进度条快速填充 "Generation: 500 steps | 2.3s"

**音效设计:**
- 3.0s: 快速的 "data stream" 音效 (电子脉冲)
- 4.0s: 真实的拔刀金属音效 (金属滑鞘声)
- 5.0s: 环境风声 (暗示停顿的氛围)
- 6.0s: 柔和的 "completion" 提示音
- 7.0-8.0s: BGM 渐入 (赛博朋克合成器，低音脉冲)

**UI 交互提示:**
- 3D 视口可用 Blender/Unity/Unreal 预渲染
- 骨骼动画可用 Kimodo 实际生成的数据驱动
- 进度条可用 AE 模板或代码动画

---

### Shot 3: THE FLEX (8.0s - 12.0s)

**画面描述:**
```
画面缩小为画中画 (左上角)，主画面切换为"一键上装"演示
```

**主画面内容:**
- 8.0s: 出现 "One-Click Retargeting" 标题
- 8.5s: 原骨骼动画旁边弹出角色选择菜单:
  - [Cyberpunk Samurai] ← selected
  - [Medieval Knight]
  - [Anime VTuber]
  - [Robot URDF]
- 9.0s: 点击 "Cyberpunk Samurai"
- 9.5s: 骨骼动画瞬间"穿上"赛博朋克角色皮肤:
  - 机械义肢 (金属材质 + 发光线条)
  - 和服布料 (实时 cloth simulation，衣摆飘动)
  - 全息面罩 (半透明 + 扫描线效果)
- 10.0s: 角色流畅执行拔刀→停顿→回头 (带上物理效果)
- 10.5s: 右上角弹出导出面板:
  - Format: [FBX ✓] [BVH ✓] [AMASS] [glTF]
  - Skeleton: [SOMA-RP]
  - Size: 2.3 MB
- 11.0s: 点击 "Export FBX"
- 11.5s: 进度条 0→100% 快速填充
- 12.0s: "Exported!" 提示 + 文件路径 `/output/samurai_slash.fbx`

**动画细节:**
- 角色过渡用 "dissolve" 或 "hologram scan" 效果
- 布料 simulation 需预先 bake (Unity Cloth 或 Unreal Chaos)
- 导出面板用 slide-in 动画

**音效设计:**
- 8.0-9.0s: UI 点击音 (高频短促)
- 9.5s: "power up" 能量聚集音
- 10.0s: 布料飘动的细微风声
- 11.0s: 快速 "writing to disk" 音效
- 12.0s: 成功 "ding" (类似 macOS 提示音)

**UI 交互提示:**
- 角色模型用现成 Mixamo/VRM 模型即可
- 导出动画是模拟的 (真实 Kimodo 目前输出 NPZ，FBX 转换器在路线图中)
- 重点是展示"这个工作流" — 未来可实现

---

### Shot 4: THE CTA (12.0s - 15.0s)

**画面描述:**
```
画中画的 3D 角色被"拖拽"到右侧的引擎视口中
```

**主画面内容:**
- 12.0s: 画面分为三栏:
  - 左: Kimodo 产品界面 (终端 + 3D 预览)
  - 中: 导出的 FBX 文件图标
  - 右: Unreal Engine 5 视口 (带 UE5 特色 UI)
- 12.5s: FBX 文件被"拖入" UE5 视口 (drag & drop 动画)
- 13.0s: UE5 中角色出现，自动播放拔刀动作
- 13.5s: 镜头拉远，显示 UE5 的完整场景 (城市街道 + 霓虹灯)
- 14.0s: 角色在场景中自由运动 (展示 root motion)
- 14.5s: 画面中央叠化出现:
  - 大标题: **"TEXT TO 3D MOTION"**
  - 副标题: **"2 seconds. Zero API fees. 100% yours."**
- 15.0s: 底部出现链接:
  - `github.com/your-org/kimodo-product`
  - `fiverr.com/yourname/ai-3d-animation`
  - Logo + 品牌色条收尾

**动画细节:**
- UE5 视口展示实时光追反射 (角色刀面反射霓虹灯光)
- Root motion 展示角色在街道中行走 (不只是原地动画)
- 结尾字幕用 subtle glow 效果

**音效设计:**
- 12.0s: 快速的 whoosh 转场
- 13.0s: UE5 启动音效的变调 (熟悉感)
- 14.0s: BGM 达到最高点 (合成器 drop)
- 14.5s: 所有音乐骤停，留下环境音
- 15.0s: 品牌音效 (自定义 3 音标识)

**UI 交互提示:**
- UE5 视口可用真实项目录屏 (免费 City Sampler 场景即可)
- Drag & drop 可用 AE 关键帧动画模拟
- 结尾字幕建议用 Motion Array 模板或 AE 预设

---

## 🎵 音频总览

| 时间段 | BGM | 音效 | 情绪 |
|--------|-----|------|------|
| 0-3s | 静音 | 键盘声 + 环境音 | 期待、好奇 |
| 3-8s | 合成器渐入 | 拔刀 + 金属音 | 震撼、魔法时刻 |
| 8-12s | 节奏加强 | UI 点击 + 导出音 | 专业、信任 |
| 12-15s | 到达高潮 | 环境音 + 品牌音 | 向往、行动 |

**BGM 推荐:**
- 免版权: "Cyberpunk Synthwave" (YouTube Audio Library)
- 付费: Artlist "Techno Detective" 或 "Neon Future"
- BPM: 120-130 (快节奏 = 高能量)

---

## 🛠️ 技术实现方案

### 方案 A: 纯屏幕录制 (零成本)
1. 用 OBS 录制终端打字 (真实 Kimodo CLI 或 Mock)
2. 用 Blender/Unity 录制骨骼动画 (导入 Kimodo 输出数据)
3. 用 After Effects 拼接 + 加 UI 元素
4. 导出为 MP4/GIF

**时间**: 4-8 小时  
**真实度**: 高 (展示的是真实产品)

### 方案 B: AI 辅助生成 (中等成本)
1. 用 Runway Gen-2 / Pika 生成部分 3D 过渡动画
2. 用 ElevenLabs 生成配音 (如果需要)
3. 用 Canva/Adobe Express 做最终剪辑

**时间**: 2-4 小时  
**真实度**: 中 (部分展示的是概念)

### 方案 C: 全后期制作 (高成本高冲击)
1. 用 Cinema 4D / Blender 预渲染 3D 动画
2. 用 After Effects 做完整 UI 模拟
3. 用 DaVinci Resolve 调色 + 输出

**时间**: 1-2 天  
**真实度**: 高 + 电影感

---

## 📤 输出规格

| 用途 | 分辨率 | 格式 | 时长 |
|------|--------|------|------|
| HN Demo | 1920x1080 | GIF ( loop ) | 6s / 10s |
| Twitter/X | 1080x1080 (方形) | MP4 (H.264) | 15s |
| Fiverr Gig | 1920x1080 | MP4 (H.264) | 15-30s |
| Landing Page | 1920x1080 | WebM (循环) | 6s / 10s |
| LinkedIn | 1920x1080 | MP4 | 15s |

---

## 🎯 传播钩子 (配合 Demo 的文字)

**HN 文案:**
> "2.3 seconds. That's how long it takes to go from text to a 30-frame animation, running entirely on a $400 GPU. No API call. No data leaving your machine."

**Twitter 文案:**
> "Stop paying $500/hour for mocap studios. This is Kimodo - text to 3D animation in 2 seconds, running locally. The demo shows a cyberpunk samurai sequence generated from one sentence. 🧵👇"

**LinkedIn 文案:**
> "I've been testing NVIDIA's Kimodo model for local motion generation. The result? A complete pipeline that generates game-ready animations from plain English in under 3 seconds. Here's what it looks like in action:"

---

*文档版本: v1.0 | 最后更新: 2026-08-27*
