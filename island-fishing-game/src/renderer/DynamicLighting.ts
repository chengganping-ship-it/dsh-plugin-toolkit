/**
 * 《孤岛钩沉》2D 动态光照系统
 * 
 * 功能：
 * 1. 提灯体积光遮罩（Volumetric Light）
 * 2. 深海生物自发光效果（Bioluminescence Glow）
 * 3. 环境光遮蔽（Ambient Occlusion）
 * 4. 动态阴影投射
 * 
 * 技术要点：
 * - 使用 Canvas 2D 的 globalCompositeOperation 实现光照混合
 * - 径向渐变模拟体积光
 * - 呼吸动画实现"呼吸感"
 */

// ==================== 类型定义 ====================

interface LightSource {
  x: number;
  y: number;
  radius: number;
  color: string;
  intensity: number;
  phase: number;
  speed: number;
  type: LightType;
  active: boolean;
  // 体积光参数
  volumetricStrength: number;
  rayCount: number;
  rayLength: number;
  // 闪烁参数
  flickerEnabled: boolean;
  flickerAmount: number;
  flickerSpeed: number;
}

enum LightType {
  LANTERN = 'lantern',           // 提灯
  BIOLUMINESCENCE = 'biolum',    // 生物发光
  MOONLIGHT = 'moonlight',       // 月光
  FIREFLY = 'firefly',           // 萤火虫
  CAMPFIRE = 'campfire',         // 篝火
}

interface BiolumEntity {
  x: number;
  y: number;
  size: number;
  color: string;
  glowRadius: number;
  pulsePhase: number;
  pulseSpeed: number;
  pattern: 'constant' | 'pulse' | 'wave' | 'random';
}

// ==================== 动态光照系统 ====================

export class DynamicLightingSystem {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private time: number = 0;
  
  // 光源列表
  private lights: LightSource[] = [];
  
  // 生物发光实体
  private biolumEntities: BiolumEntity[] = [];
  
  // 离屏 Canvas 用于光照贴图
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;
  
  // 环境光
  private ambientColor: string = '#0a0f1a';
  private ambientIntensity: number = 0.4;
  
  // 配置
  private config = {
    maxLights: 16,
    shadowMapResolution: 256,
    glowQuality: 'medium', // 'low' | 'medium' | 'high'
  };
  
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    
    // 创建离屏 Canvas
    this.lightCanvas = document.createElement('canvas');
    this.lightCanvas.width = width;
    this.lightCanvas.height = height;
    this.lightCtx = this.lightCanvas.getContext('2d')!;
  }
  
  // ==================== 光源管理 ====================
  
  /**
   * 添加提灯光源
   */
  addLantern(x: number, y: number, intensity: number = 1): LightSource {
    const lantern: LightSource = {
      x, y,
      radius: 120,
      color: '#ffd700',
      intensity,
      phase: Math.random() * Math.PI * 2,
      speed: 1.5,
      type: LightType.LANTERN,
      active: true,
      volumetricStrength: 0.6,
      rayCount: 8,
      rayLength: 80,
      flickerEnabled: true,
      flickerAmount: 0.15,
      flickerSpeed: 8,
    };
    this.lights.push(lantern);
    return lantern;
  }
  
  /**
   * 添加生物发光源
   */
  addBioluminescence(x: number, y: number, color: string = '#00e5ff'): LightSource {
    const biolum: LightSource = {
      x, y,
      radius: 60,
      color,
      intensity: 0.8,
      phase: Math.random() * Math.PI * 2,
      speed: 2 + Math.random() * 2,
      type: LightType.BIOLUMINESCENCE,
      active: true,
      volumetricStrength: 0.3,
      rayCount: 0,
      rayLength: 0,
      flickerEnabled: false,
      flickerAmount: 0,
      flickerSpeed: 0,
    };
    this.lights.push(biolum);
    return biolum;
  }
  
  /**
   * 添加月光
   */
  addMoonlight(x: number, y: number): LightSource {
    const moon: LightSource = {
      x, y,
      radius: 300,
      color: '#b3e5fc',
      intensity: 0.3,
      phase: 0,
      speed: 0.2,
      type: LightType.MOONLIGHT,
      active: true,
      volumetricStrength: 0.1,
      rayCount: 0,
      rayLength: 0,
      flickerEnabled: false,
      flickerAmount: 0,
      flickerSpeed: 0,
    };
    this.lights.push(moon);
    return moon;
  }
  
  /**
   * 移除光源
   */
  removeLight(light: LightSource): void {
    const idx = this.lights.indexOf(light);
    if (idx >= 0) {
      this.lights.splice(idx, 1);
    }
  }
  
  /**
   * 清除所有光源
   */
  clearLights(): void {
    this.lights = [];
  }
  
  // ==================== 生物发光实体 ====================
  
  /**
   * 添加生物发光实体（如发光鱼、水母等）
   */
  addBiolumEntity(config: Partial<BiolumEntity> & { x: number; y: number }): BiolumEntity {
    const entity: BiolumEntity = {
      x: config.x,
      y: config.y,
      size: config.size || 10,
      color: config.color || '#00e5ff',
      glowRadius: config.glowRadius || 30,
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: config.pulseSpeed || 2,
      pattern: config.pattern || 'pulse',
    };
    this.biolumEntities.push(entity);
    return entity;
  }
  
  // ==================== 更新与渲染 ====================
  
  /**
   * 更新光照系统
   */
  update(dt: number): void {
    this.time += dt;
    
    // 更新光源动画
    for (const light of this.lights) {
      light.phase += light.speed * dt;
    }
    
    // 更新生物发光动画
    for (const entity of this.biolumEntities) {
      entity.pulsePhase += entity.pulseSpeed * dt;
    }
  }
  
  /**
   * 渲染光照（在主渲染循环中调用）
   */
  renderLights(): void {
    const ctx = this.lightCtx;
    
    // 清空光照贴图
    ctx.clearRect(0, 0, this.width, this.height);
    
    // 填充环境光
    ctx.fillStyle = this.ambientColor;
    ctx.globalAlpha = this.ambientIntensity;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.globalAlpha = 1;
    
    // 启用加性混合
    ctx.globalCompositeOperation = 'lighter';
    
    // 渲染每个光源
    for (const light of this.lights) {
      if (!light.active) continue;
      this.renderLight(ctx, light);
    }
    
    // 渲染生物发光实体
    for (const entity of this.biolumEntities) {
      this.renderBiolumEntity(ctx, entity);
    }
    
    // 恢复混合模式
    ctx.globalCompositeOperation = 'source-over';
    
    // 将光照贴图绘制到主 Canvas
    this.ctx.drawImage(this.lightCanvas, 0, 0);
  }
  
  /**
   * 渲染单个光源
   */
  private renderLight(ctx: CanvasRenderingContext2D, light: LightSource): void {
    // 计算呼吸强度
    const breathe = 0.8 + 0.2 * Math.sin(light.phase);
    
    // 计算闪烁
    let flicker = 1;
    if (light.flickerEnabled) {
      flicker = 1 - light.flickerAmount * Math.random();
    }
    
    const intensity = light.intensity * breathe * flicker;
    
    switch (light.type) {
      case LightType.LANTERN:
        this.renderLanternLight(ctx, light, intensity);
        break;
      case LightType.BIOLUMINESCENCE:
        this.renderBiolumLight(ctx, light, intensity);
        break;
      case LightType.MOONLIGHT:
        this.renderMoonlight(ctx, light, intensity);
        break;
      default:
        this.renderGenericLight(ctx, light, intensity);
    }
  }
  
  /**
   * 渲染提灯体积光
   */
  private renderLanternLight(ctx: CanvasRenderingContext2D, light: LightSource, intensity: number): void {
    const { x, y, radius, color } = light;
    
    // 1. 核心光晕
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 0.3);
    coreGradient.addColorStop(0, color);
    coreGradient.addColorStop(0.5, color + '80');
    coreGradient.addColorStop(1, color + '00');
    
    ctx.globalAlpha = intensity;
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // 2. 体积光锥
    if (light.volumetricStrength > 0) {
      ctx.globalAlpha = intensity * light.volumetricStrength;
      
      for (let i = 0; i < light.rayCount; i++) {
        const angle = (i / light.rayCount) * Math.PI * 2 + light.phase * 0.1;
        const rayLen = light.rayLength * (0.8 + 0.2 * Math.sin(light.phase * 3 + i));
        
        const endX = x + Math.cos(angle) * rayLen;
        const endY = y + Math.sin(angle) * rayLen;
        
        const rayGradient = ctx.createLinearGradient(x, y, endX, endY);
        rayGradient.addColorStop(0, color + '60');
        rayGradient.addColorStop(1, color + '00');
        
        ctx.strokeStyle = rayGradient;
        ctx.lineWidth = 8 + 4 * Math.sin(light.phase * 2 + i);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    }
    
    // 3. 外圈柔光
    const outerGradient = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius);
    outerGradient.addColorStop(0, color + '20');
    outerGradient.addColorStop(0.6, color + '08');
    outerGradient.addColorStop(1, color + '00');
    
    ctx.globalAlpha = intensity * 0.5;
    ctx.fillStyle = outerGradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
  
  /**
   * 渲染生物发光
   */
  private renderBiolumLight(ctx: CanvasRenderingContext2D, light: LightSource, intensity: number): void {
    const { x, y, radius, color } = light;
    
    // 多层发光效果
    for (let i = 3; i >= 0; i--) {
      const layerRadius = radius * (0.5 + i * 0.5);
      const layerAlpha = intensity * (0.3 - i * 0.06);
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, layerRadius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.3, color + '80');
      gradient.addColorStop(0.7, color + '20');
      gradient.addColorStop(1, color + '00');
      
      ctx.globalAlpha = layerAlpha;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 核心亮点
    ctx.globalAlpha = intensity;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
  
  /**
   * 渲染月光
   */
  private renderMoonlight(ctx: CanvasRenderingContext2D, light: LightSource, intensity: number): void {
    const { x, y, radius, color } = light;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.3, color + '40');
    gradient.addColorStop(0.7, color + '10');
    gradient.addColorStop(1, color + '00');
    
    ctx.globalAlpha = intensity;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
  
  /**
   * 渲染通用光源
   */
  private renderGenericLight(ctx: CanvasRenderingContext2D, light: LightSource, intensity: number): void {
    const { x, y, radius, color } = light;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color + '60');
    gradient.addColorStop(1, color + '00');
    
    ctx.globalAlpha = intensity;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
  
  /**
   * 渲染生物发光实体
   */
  private renderBiolumEntity(ctx: CanvasRenderingContext2D, entity: BiolumEntity): void {
    const { x, y, size, color, glowRadius, pulsePhase, pattern } = entity;
    
    // 根据模式计算亮度
    let brightness: number;
    switch (pattern) {
      case 'constant':
        brightness = 0.8;
        break;
      case 'pulse':
        brightness = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(pulsePhase));
        break;
      case 'wave':
        brightness = 0.5 + 0.5 * Math.sin(pulsePhase * 2) * Math.sin(pulsePhase * 0.5);
        break;
      case 'random':
        brightness = 0.3 + 0.7 * Math.abs(Math.sin(pulsePhase * 1.1) * Math.cos(pulsePhase * 0.7));
        break;
      default:
        brightness = 0.8;
    }
    
    // 渲染发光
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.4, color + '80');
    gradient.addColorStop(1, color + '00');
    
    ctx.globalAlpha = brightness * 0.8;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 核心
    ctx.globalAlpha = brightness;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;
  }
  
  // ==================== 阴影投射 ====================
  
  /**
   * 渲染动态阴影（简化版）
   */
  renderShadow(casterX: number, casterY: number, casterSize: number, lightX: number, lightY: number): void {
    const ctx = this.ctx;
    
    // 计算阴影方向
    const dx = casterX - lightX;
    const dy = casterY - lightY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // 阴影长度与距离成正比
    const shadowLength = Math.min(casterSize * 2, dist * 0.5);
    
    ctx.save();
    ctx.translate(casterX, casterY);
    ctx.rotate(angle);
    
    // 绘制椭圆形阴影
    const gradient = ctx.createRadialGradient(casterSize * 0.5, 0, 0, casterSize * 0.5, 0, shadowLength);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(casterSize * 0.5, 0, shadowLength, casterSize * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // ==================== 公共方法 ====================
  
  /**
   * 设置环境光
   */
  setAmbient(color: string, intensity: number): void {
    this.ambientColor = color;
    this.ambientIntensity = intensity;
  }
  
  /**
   * 设置画布尺寸
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.lightCanvas.width = width;
    this.lightCanvas.height = height;
  }
  
  /**
   * 获取光源数量
   */
  getLightCount(): number {
    return this.lights.length;
  }
  
  /**
   * 清除所有光源和实体
   */
  clear(): void {
    this.lights = [];
    this.biolumEntities = [];
  }
  
  /**
   * 获取当前时间（用于外部同步）
   */
  getTime(): number {
    return this.time;
  }
}

export { LightSource, LightType, BiolumEntity };
