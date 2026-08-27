/**
 * 《孤岛钩沉》主渲染器
 * 
 * 整合粒子系统 + 动态光照系统
 * 提供统一的游戏渲染管线
 */

import { ParticleSystem, ParticleType } from '../particles/ParticleSystem';
import { DynamicLightingSystem, LightType } from './DynamicLighting';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  
  // 子系统
  public particles: ParticleSystem;
  public lighting: DynamicLightingSystem;
  
  // 渲染状态
  private isRunning: boolean = false;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private fps: number = 0;
  private fpsUpdateTime: number = 0;
  
  // 性能监控
  private stats = {
    drawCalls: 0,
    particleCount: 0,
    lightCount: 0,
  };
  
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.width = canvas.width;
    this.height = canvas.height;
    
    // 初始化子系统
    this.particles = new ParticleSystem(this.ctx, this.width, this.height);
    this.lighting = new DynamicLightingSystem(this.ctx, this.width, this.height);
    
    // 设置默认场景
    this.setupDefaultScene();
  }
  
  /**
   * 设置默认场景
   */
  private setupDefaultScene(): void {
    // 添加月光
    this.lighting.addMoonlight(this.width * 0.7, this.height * 0.15);
    
    // 添加环境生物发光
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * this.width;
      const y = this.height * 0.5 + Math.random() * this.height * 0.4;
      const colors = ['#00e5ff', '#39ff14', '#00ffcc', '#7fffd4'];
      this.lighting.addBioluminescence(x, y, colors[i % colors.length]);
    }
    
    // 添加生物发光实体（发光鱼群）
    for (let i = 0; i < 8; i++) {
      this.lighting.addBiolumEntity({
        x: Math.random() * this.width,
        y: this.height * 0.4 + Math.random() * this.height * 0.5,
        size: 4 + Math.random() * 6,
        color: ['#00e5ff', '#39ff14', '#00ffcc'][Math.floor(Math.random() * 3)],
        glowRadius: 20 + Math.random() * 20,
        pulseSpeed: 1 + Math.random() * 2,
        pattern: ['pulse', 'wave', 'random'][Math.floor(Math.random() * 3)] as any,
      });
    }
  }
  
  /**
   * 启动渲染循环
   */
  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }
  
  /**
   * 停止渲染循环
   */
  stop(): void {
    this.isRunning = false;
  }
  
  /**
   * 主渲染循环
   */
  private loop = (): void => {
    if (!this.isRunning) return;
    
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1); // 限制最大 dt
    this.lastTime = now;
    
    // 更新 FPS
    this.frameCount++;
    if (now - this.fpsUpdateTime > 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = now;
    }
    
    // 更新子系统
    this.particles.update(dt);
    this.lighting.update(dt);
    
    // 渲染
    this.render(dt);
    
    requestAnimationFrame(this.loop);
  };
  
  /**
   * 渲染一帧
   */
  private render(dt: number): void {
    const ctx = this.ctx;
    this.stats.drawCalls = 0;
    
    // 1. 清空画布（深海背景）
    this.renderBackground(ctx);
    
    // 2. 渲染光照（在场景之前，作为基础照明）
    this.lighting.renderLights();
    
    // 3. 渲染游戏场景（这里由外部注入）
    // this.renderScene(ctx);
    
    // 4. 渲染粒子效果（在场景之上）
    this.particles.render();
    
    // 5. 更新统计
    this.stats.particleCount = this.particles.getActiveCount();
    this.stats.lightCount = this.lighting.getLightCount();
  }
  
  /**
   * 渲染深海背景
   */
  private renderBackground(ctx: CanvasRenderingContext2D): void {
    // 深海渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(0.3, '#0d1f3c');
    gradient.addColorStop(0.6, '#0a1a2e');
    gradient.addColorStop(1, '#050d1a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
    this.stats.drawCalls++;
    
    // 添加微妙的噪点纹理
    this.renderNoiseOverlay(ctx);
  }
  
  /**
   * 渲染噪点叠加层（复古质感）
   */
  private renderNoiseOverlay(ctx: CanvasRenderingContext2D): void {
    // 使用预计算的噪点图案（性能优化）
    // 这里简化处理，实际项目中应使用预渲染的噪点贴图
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#ffffff';
    
    // 随机噪点（每 4 帧渲染一次以节省性能）
    if (this.frameCount % 4 === 0) {
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    
    ctx.globalAlpha = 1;
    this.stats.drawCalls++;
  }
  
  // ==================== 公共 API ====================
  
  /**
   * 添加提灯（玩家光源）
   */
  addPlayerLantern(x: number, y: number): void {
    this.lighting.addLantern(x, y, 1.0);
  }
  
  /**
   * 发射水花（抓钩入水）
   */
  emitSplash(x: number, y: number, intensity: number = 1): void {
    this.particles.emitSplash(x, y, intensity);
  }
  
  /**
   * 发射气泡
   */
  emitBubbles(x: number, y: number, count: number = 1): void {
    this.particles.emitBubble(x, y, count);
  }
  
  /**
   * 渲染场景（供外部注入自定义渲染逻辑）   */
  private sceneRenderer: ((ctx: CanvasRenderingContext2D) => void) | null = null;
  
  setSceneRenderer(renderer: (ctx: CanvasRenderingContext2D) => void): void {
    this.sceneRenderer = renderer;
  }
  
  /**
   * 调整画布大小
   */
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.particles.setSize(width, height);
    this.lighting.setSize(width, height);
  }
  
  /**
   * 获取性能统计
   */
  getStats() {
    return {
      ...this.stats,
      fps: this.fps,
    };
  }
  
  /**
   * 重置渲染器
   */
  reset(): void {
    this.particles.reset();
    this.lighting.clear();
    this.setupDefaultScene();
  }
}

export default GameRenderer;
