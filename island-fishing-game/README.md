# 《孤岛钩沉》— 获奖级美术资产管线 & 高级 Canvas 渲染增强系统

## 项目概述

《孤岛钩沉》是一款以深海钓鱼为主题的微信小游戏，采用"复古航海手账 + 深海生物发光"的独特视觉风格，目标冲击 IGF/TapTap 独立游戏大奖。

## 项目结构

```
island-fishing-game/
├── scripts/
│   └── processAssets.cjs      # 资产自动化处理脚本
├── src/
│   ├── particles/
│   │   └── ParticleSystem.ts  # 高级粒子系统
│   └── renderer/
│       ├── DynamicLighting.ts # 2D 动态光照系统
│       └── GameRenderer.ts    # 主渲染器
├── assets/
│   ├── raw/                   # 原始 AI 生成图片
│   └── processed/             # 处理后输出
│       └── atlas/             # 纹理图集
├── docs/
│   ├── AI_ART_PROMPTS.md      # AI 美术 Prompt 集
│   └── PERFORMANCE_OPTIMIZATION.md # 性能优化方案
└── README.md
```

## 核心功能

### 1. 资产自动化处理管线 (`scripts/processAssets.cjs`)

- **自动抠图**：智能背景移除，保留主体
- **统一色板**：将颜色映射到复古航海手账色调
- **复古噪点**：添加版画/手账质感
- **极致压缩**：输出 WebP 格式，大幅减少体积
- **纹理图集**：自动打包小图为大图集，减少 Draw Call

### 2. 高级粒子系统 (`src/particles/ParticleSystem.ts`)

- **深海发光浮游生物**：带轨迹的呼吸发光效果
- **动态气泡**：上升、漂浮、破裂动画
- **抓钩入水水花**：物理模拟的水花飞溅
- **体积光遮罩**：提灯的光锥效果
- **尘埃粒子**：环境氛围增强

### 3. 2D 动态光照系统 (`src/renderer/DynamicLighting.ts`)

- **提灯体积光**：带闪烁和呼吸效果的光源
- **生物发光**：自发光海洋生物
- **月光照明**：环境基础照明
- **动态阴影**：简化版阴影投射
- **呼吸感动画**：所有光源都有脉动效果

### 4. 主渲染器 (`src/renderer/GameRenderer.ts`)

- 整合粒子系统 + 光照系统
- 统一渲染管线
- 性能监控
- 自动降级策略

## 视觉风格

**复古航海手账 + 深海生物发光**

- 铜版画/木刻版画笔触
- 单一光源强明暗对比
- 深海墨蓝基底 + 生物发光青绿点缀
- 羊皮纸泛黄边缘质感

## 性能指标

| 指标 | 目标 |
|------|------|
| 总资源包体 | < 2MB |
| 首屏加载 | < 1 秒 |
| 运行时 FPS | > 30 |
| 内存占用 | < 100MB |
| 最大粒子数 | 200 |
| 最大光源数 | 16 |

## 使用方法

### 资产处理

```bash
# 安装依赖
npm install sharp canvas

# 将 AI 生成的图片放入 assets/raw/
# 运行处理脚本
node scripts/processAssets.cjs
```

### 渲染系统集成

```typescript
import { GameRenderer } from './src/renderer/GameRenderer';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const renderer = new GameRenderer(canvas);

// 启动渲染
renderer.start();

// 添加玩家提灯
renderer.addPlayerLantern(400, 300);

// 发射水花（抓钩入水时）
renderer.emitSplash(400, 500, 1.5);

// 发射气泡
renderer.emitBubbles(200, 400, 5);
```

## 美术 Prompt

详见 [docs/AI_ART_PROMPTS.md](docs/AI_ART_PROMPTS.md)

包含 3 个核心 Prompt：
1. 深海背景（Deep Sea Background）
2. 发光鱼类与海洋生物（Bioluminescent Sea Creatures）
3. 神秘岛屿与航海元素（Mysterious Islands & Nautical Elements）

## 性能优化

详见 [docs/PERFORMANCE_OPTIMIZATION.md](docs/PERFORMANCE_OPTIMIZATION.md)

核心策略：
- 纹理图集合并
- WebP 极致压缩
- 分阶段懒加载
- 对象池复用
- 运行时性能监控与降级

## 技术栈

- **渲染**：Canvas 2D
- **粒子系统**：自研（对象池 + 批量渲染）
- **光照系统**：自研（离屏 Canvas + 加性混合）
- **资产处理**：Sharp + Node.js Canvas
- **平台**：微信小游戏

## 许可证

MIT License
