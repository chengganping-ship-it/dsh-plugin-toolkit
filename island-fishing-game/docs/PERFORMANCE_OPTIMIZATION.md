# 《孤岛钩沉》性能优化与包体控制方案

## 目标

- **总资源包体 < 2MB**（微信小游戏限制）
- **首屏加载 < 1 秒**
- **运行时稳定 30fps+**

---

## 一、资产压缩策略

### 1.1 图片压缩

| 资产类型 | 原始尺寸 | 输出尺寸 | 格式 | 单张大小 | 数量 | 总计 |
|---------|---------|---------|------|---------|------|------|
| 背景图 | 1920x1080 | 512x288 | WebP@60 | ~30KB | 3 | 90KB |
| 鱼类精灵 | 512x512 | 128x128 | WebP@70 | ~8KB | 20 | 160KB |
| 道具图标 | 256x256 | 64x64 | WebP@75 | ~3KB | 30 | 90KB |
| UI 元素 | 1024x1024 | 256x256 | WebP@65 | ~15KB | 10 | 150KB |
| 粒子贴图 | 128x128 | 32x32 | PNG8 | ~2KB | 5 | 10KB |
| **合计** | | | | | | **~500KB** |

### 1.2 纹理图集（Texture Atlas）

将所有小图合并为 2-3 张大图集：
- `sprites_atlas.png` (1024x1024) - 鱼类 + 道具 ≈ 200KB
- `ui_atlas.png` (512x512) - UI 元素 ≈ 80KB
- `effects_atlas.png` (256x256) - 粒子效果 ≈ 30KB

**图集总大小：~310KB**

### 1.3 音频压缩

| 类型 | 格式 | 质量 | 大小 |
|------|------|------|------|
| 背景音乐 | MP3 | 96kbps | ~50KB (30s loop) |
| 音效 | OGG | 48kbps | ~5KB/个 |

**音频总计：~100KB**

---

## 二、包体预算分配

```
总预算：2MB (2048KB)
─────────────────────────────
图片资产（图集）：  310KB  (15%)
音频资产：         100KB  (5%)
字体文件：          50KB  (2%)
代码（JS/TS）：    300KB  (15%)
首屏资源：         200KB  (10%)
预留缓冲：         ~388KB (19%)
─────────────────────────────
压缩后总包体：     ~1.3MB
```

---

## 三、懒加载策略

### 3.1 分阶段加载

```
┌─────────────────────────────────────────────────────────┐
│ 阶段 0：首屏（< 200KB，< 1秒）                          │
│ - 启动画面 + Logo                                       │
│ - 主菜单背景 + 按钮                                     │
│ - 核心 UI 字体                                          │
├─────────────────────────────────────────────────────────┤
│ 阶段 1：游戏准备（后台加载）                             │
│ - 关卡 1 背景 + 鱼类精灵                                │
│ - 粒子效果资源                                          │
│ - 音效                                                  │
├─────────────────────────────────────────────────────────┤
│ 阶段 2：运行中（按需加载）                               │
│ - 后续关卡资源                                          │
│ - 特殊效果资源                                          │
│ - 奖励动画资源                                          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 实现代码

```typescript
// 资源加载管理器
class AssetLoader {
  private cache = new Map<string, any>();
  private loadQueue: string[] = [];
  
  // 预加载首屏资源
  async preloadCritical(): Promise<void> {
    const criticalAssets = [
      'atlas/sprites_atlas.png',
      'atlas/ui_atlas.png',
      'audio/bgm_main.mp3',
    ];
    
    await Promise.all(criticalAssets.map(url => this.load(url)));
  }
  
  // 后台加载非关键资源
  preloadBackground(): void {
    const backgroundAssets = [
      'atlas/effects_atlas.png',
      'audio/sfx_splash.ogg',
      'audio/sfx_bubble.ogg',
    ];
    
    // 使用 requestIdleCallback 在空闲时加载
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        backgroundAssets.forEach(url => this.load(url));
      });
    }
  }
  
  // 按需加载
  async loadOnDemand(level: number): Promise<void> {
    const levelAssets = [
      `backgrounds/level_${level}.webp`,
      `sprites/fish_level_${level}.webp`,
    ];
    
    await Promise.all(levelAssets.map(url => this.load(url)));
  }
  
  private async load(url: string): Promise<any> {
    if (this.cache.has(url)) return this.cache.get(url);
    
    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    
    this.cache.set(url, objectUrl);
    return objectUrl;
  }
}
```

---

## 四、运行时性能优化

### 4.1 粒子系统优化

| 优化项 | 方法 | 效果 |
|--------|------|------|
| 对象池 | 预分配粒子对象，避免 GC | 减少 80% 内存分配 |
| 批量渲染 | 按类型分组，减少状态切换 | 减少 60% Draw Call |
| 自动回收 | 超出屏幕自动释放 | 防止粒子无限累积 |
| LOD | 远处粒子降低更新频率 | 节省 30% CPU |

### 4.2 光照系统优化

| 优化项 | 方法 | 效果 |
|--------|------|------|
| 离屏 Canvas | 光照预渲染到离屏 | 避免每帧重复计算 |
| 光源限制 | 最大 16 个同时光源 | 控制 Draw Call |
| 精度控制 | 根据设备性能降级 | 低端机流畅运行 |

### 4.3 Canvas 渲染优化

```typescript
// 1. 使用整数坐标（避免亚像素渲染）
ctx.drawImage(img, Math.floor(x), Math.floor(y));

// 2. 批量绘制相同类型
ctx.beginPath();
for (const obj of objects) {
  ctx.moveTo(obj.x, obj.y);
  ctx.lineTo(obj.x2, obj.y2);
}
ctx.stroke(); // 一次性绘制所有线条

// 3. 使用 willReadFrequent 优化 getImageData
const ctx = canvas.getContext('2d', { willReadFrequent: true });

// 4. 避免频繁的状态保存/恢复
// 不好：
for (const obj of objects) {
  ctx.save();
  ctx.translate(obj.x, obj.y);
  // ...
  ctx.restore();
}

// 好：
ctx.save();
for (const obj of objects) {
  ctx.translate(obj.x, obj.y);
  // ...
}
ctx.restore();
```

---

## 五、内存管理

### 5.1 资源释放策略

```typescript
class MemoryManager {
  // 关卡切换时释放旧资源
  releaseLevelAssets(level: number): void {
    const assetsToRelease = this.getAssetsByLevel(level);
    for (const asset of assetsToRelease) {
      URL.revokeObjectURL(asset.url);
      this.cache.delete(asset.key);
    }
  }
  
  // 内存警告时释放缓存
  onMemoryWarning(): void {
    // 释放最近最少使用的资源
    const lru = this.getLRUResources(10);
    for (const asset of lru) {
      this.release(asset);
    }
  }
}
```

### 5.2 内存预算

| 资源 | 预算 |
|------|------|
| 纹理内存 | < 64MB |
| 音频内存 | < 8MB |
| 粒子系统 | < 4MB |
| 其他 | < 8MB |
| **总计** | < 84MB |

---

## 六、首屏加载优化

### 6.1 加载流程优化

```
用户点击 → 显示启动画面（内联 CSS）
         → 并行加载核心资源
         → 资源就绪 → 隐藏启动画面
         → 显示主菜单
         
目标：< 1 秒完成首屏
```

### 6.2 关键优化点

1. **内联关键 CSS**：启动画面样式直接内联到 HTML
2. **预加载核心资源**：`<link rel="preload">` 关键资源
3. **压缩传输**：启用 Gzip/Brotli 压缩
4. **CDN 加速**：静态资源使用 CDN
5. **Service Worker**：缓存核心资源，支持离线

### 6.3 启动画面实现

```html
<!-- 内联关键 CSS，避免阻塞 -->
<style>
  #splash {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: linear-gradient(180deg, #0a1628 0%, #050d1a 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }
  #splash .logo {
    width: 200px;
    height: 100px;
    background: url('data:image/svg+xml;base64,...') center no-repeat;
    background-size: contain;
  }
</style>
```

---

## 七、性能监控

### 7.1 运行时监控

```typescript
class PerformanceMonitor {
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  
  update(): void {
    // 每 60 帧采样一次
    if (this.frameCount % 60 === 0) {
      const fps = this.getCurrentFPS();
      const memory = (performance as any).memory?.usedJSHeapSize || 0;
      
      this.fpsHistory.push(fps);
      this.memoryHistory.push(memory);
      
      // 性能降级
      if (fps < 25) {
        this.triggerDowngrade();
      }
    }
  }
  
  private triggerDowngrade(): void {
    // 降低粒子数量
    particleSystem.setMaxParticles(50);
    // 降低光照质量
    lighting.setQuality('low');
  }
}
```

---

## 八、测试清单

- [ ] 总资源包体 < 2MB
- [ ] 首屏加载 < 1 秒（4G 网络）
- [ ] 运行时 FPS > 30（中端机型）
- [ ] 内存占用 < 100MB
- [ ] 无内存泄漏（连续运行 30 分钟）
- [ ] 低端机降级后仍可运行
- [ ] 资源加载失败有优雅降级
