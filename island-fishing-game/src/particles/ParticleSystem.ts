/**
 * 《孤岛钩沉》高级粒子系统
 * 
 * 功能：
 * 1. 深海发光浮游生物（Bioluminescence）
 * 2. 动态气泡（Dynamic Bubbles）
 * 3. 抓钩入水水花（Splash Effect）
 * 4. 体积光遮罩（Volumetric Light）
 * 
 * 性能优化：
 * - 对象池复用
 * - 批量渲染
 * - 自动回收
 */

// ==================== 类型定义 ====================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  type: ParticleType;
  active: boolean;
  // 发光属性
  glowIntensity: number;
  glowPhase: number;
  glowSpeed: number;
  // 物理属性
  drag: number;
  gravity: number;
  // 轨迹
  trail: Array<{ x: number; y: number; alpha: number }>;
  trailLength: number;
}

enum ParticleType {
  PLANKTON = 'plankton',       // 浮游生物
  BUBBLE = 'bubble',           // 气泡
  SPLASH = 'splash',           // 水花
  LIGHT_RAY = 'light_ray',     // 光线
  DUST = 'dust',               // 尘埃
}

interface ParticleConfig {
  maxParticles: number;
  emissionRate: number;
  lifetime: number;
  speed: [number, number];
  size: [number, number];
  color: string[];
  alpha: [number, number];
  gravity: number;
  drag: number;
  glowIntensity: number;
  trailLength: number;
}

// ==================== 对象池 ====================

class ParticlePool {
  private pool: Particle[] = [];
  private activeCount: number = 0;
  
  constructor(private size: number) {
    for (let i = 0; i < size; i++) {
      this.pool.push(this.createEmptyParticle());
    }
  }
  
  private createEmptyParticle(): Particle {
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      life: 0, maxLife: 0, size: 0,
      color: '#ffffff', alpha: 0,
      rotation: 0, rotationSpeed: 0,
      type: ParticleType.PLANKTON,
      active: false,
      glowIntensity: 0, glowPhase: 0, glowSpeed: 0,
      drag: 0, gravity: 0,
      trail: [], trailLength: 0,
    };
  }
  
  acquire(): Particle | null {
    for (let i = 0; i < this.pool.length; i++) {
      if (!this.pool[i].active) {
        this.pool[i].active = true;
        this.activeCount++;
        return this.pool[i];
      }
    }
    return null; // 池已满
  }
  
  release(particle: Particle): void {
    particle.active = false;
    particle.trail = [];
    this.activeCount--;
  }
  
  getActive(): Particle[] {
    return this.pool.filter(p => p.active);
  }
  
  getActiveCount(): number {
    return this.activeCount;
  }
  
  clear(): void {
    for (const p of this.pool) {
      p.active = false;
      p.trail = [];
    }
    this.activeCount = 0;
  }
}

// ==================== 粒子系统主类 ====================

export class ParticleSystem {
  private pool: ParticlePool;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private time: number = 0;
  private emissionAccumulator: number = 0;
  
  // 配置
  private configs: Map<ParticleType, ParticleConfig> = new Map([
    [ParticleType.PLANKTON, {
      maxParticles: 80,
      emissionRate: 3,
      lifetime: 8,
      speed: [-0.3, 0.3],
      size: [1.5, 4],
      color: ['#00e5ff', '#39ff14', '#00ffcc', '#7fffd4'],
      alpha: [0.4, 0.9],
      gravity: -0.01,
      drag: 0.98,
      glowIntensity: 1.5,
      trailLength: 6,
    }],
    [ParticleType.BUBBLE, {
      maxParticles: 40,
      emissionRate: 2,
      lifetime: 5,
      speed: [-0.5, 0.5],
      size: [2, 8],
      color: ['#ffffff', '#e0f7ff', '#b3e5fc'],
      alpha: [0.3, 0.7],
      gravity: -0.03,
      drag: 0.99,
      glowIntensity: 0.5,
      trailLength: 0,
    }],
    [ParticleType.SPLASH, {
      maxParticles: 30,
      emissionRate: 0, // 手动触发
      lifetime: 1.2,
      speed: [-3, 3],
      size: [2, 6],
      color: ['#ffffff', '#e0f7ff', '#87ceeb'],
      alpha: [0.8, 1.0],
      gravity: 0.15,
      drag: 0.95,
      glowIntensity: 0.8,
      trailLength: 3,
    }],
    [ParticleType.LIGHT_RAY, {
      maxParticles: 12,
      emissionRate: 0.5,
      lifetime: 4,
      speed: [0, 0],
      size: [20, 60],
      color: ['#ffd700', '#ffeb3b', '#fff8e1'],
      alpha: [0.05, 0.15],
      gravity: 0,
      drag: 1,
      glowIntensity: 2.0,
      trailLength: 0,
    }],
    [ParticleType.DUST, {
      maxParticles: 50,
      emissionRate: 1,
      lifetime: 10,
      speed: [-0.2, 0.2],
      size: [0.5, 2],
      color: ['#e8d5b7', '#d4c4a8', '#c9a227'],
      alpha: [0.2, 0.5],
      gravity: -0.005,
      drag: 0.995,
      glowIntensity: 0,
      trailLength: 0,
    }],
  ]);
  
  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.pool = new ParticlePool(200);
  }
  
  // ==================== 发射控制 ====================
  
  /**
   * 发射单个粒子
   */
  private emit(type: ParticleType, x: number, y: number, overrides?: Partial<Particle>): void {
    const particle = this.pool.acquire();
    if (!particle) return;
    
    const config = this.configs.get(type)!;
    
    const speed = config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]);
    const angle = type === ParticleType.SPLASH 
      ? -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8
      : Math.random() * Math.PI * 2;
    
    particle.x = x;
    particle.y = y;
    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;
    particle.life = config.lifetime * (0.8 + Math.random() * 0.4);
    particle.maxLife = particle.life;
    particle.size = config.size[0] + Math.random() * (config.size[1] - config.size[0]);
    particle.color = config.color[Math.floor(Math.random() * config.color.length)];
    particle.alpha = config.alpha[0] + Math.random() * (config.alpha[1] - config.alpha[0]);
    particle.rotation = Math.random() * Math.PI * 2;
    particle.rotationSpeed = (Math.random() - 0.5) * 0.1;
    particle.type = type;
    particle.glowIntensity = config.glowIntensity;
    particle.glowPhase = Math.random() * Math.PI * 2;
    particle.glowSpeed = 2 + Math.random() * 3;
    particle.drag = config.drag;
    particle.gravity = config.gravity;
    particle.trail = [];
    particle.trailLength = config.trailLength;
    
    if (overrides) {
      Object.assign(particle, overrides);
    }
  }
  
  /**
   * 发射水花效果（抓钩入水）
   */
  emitSplash(x: number, y: number, intensity: number = 1): void {
    const count = Math.floor(15 * intensity);
    for (let i = 0; i < count; i++) {
      this.emit(ParticleType.SPLASH, x, y, {
        vx: (Math.random() - 0.5) * 6 * intensity,
        vy: -Math.random() * 4 * intensity - 1,
        size: 2 + Math.random() * 4 * intensity,
      });
    }
  }
  
  /**
   * 发射气泡
   */
  emitBubble(x: number, y: number, count: number = 1): void {
    for (let i = 0; i < count; i++) {
      this.emit(ParticleType.BUBBLE, x + (Math.random() - 0.5) * 20, y);
    }
  }
  
  /**
   * 发射光线粒子
   */
  emitLightRay(x: number, y: number, angle: number, length: number): void {
    this.emit(ParticleType.LIGHT_RAY, x, y, {
      vx: Math.cos(angle) * 0.2,
      vy: Math.sin(angle) * 0.2,
      size: length,
      rotation: angle,
      alpha: 0.08 + Math.random() * 0.08,
    });
  }
  
  // ==================== 更新与渲染 ====================
  
  /**
   * 更新所有粒子
   */
  update(dt: number): void {
    this.time += dt;
    this.emissionAccumulator += dt;
    
    const emissionInterval = 1 / 60; // 60fps 基准
    
    // 自动发射
    if (this.emissionAccumulator >= emissionInterval) {
      this.emissionAccumulator = 0;
      this.autoEmission();
    }
    
    // 更新粒子
    const particles = this.pool.getActive();
    for (const p of particles) {
      this.updateParticle(p, dt);
    }
  }
  
  /**
   * 自动发射环境粒子
   */
  private autoEmission(): void {
    // 浮游生物
    const planktonConfig = this.configs.get(ParticleType.PLANKTON)!;
    if (this.pool.getActiveCount() < planktonConfig.maxParticles) {
      for (let i = 0; i < planktonConfig.emissionRate; i++) {
        const x = Math.random() * this.width;
        const y = this.height * 0.3 + Math.random() * this.height * 0.7;
        this.emit(ParticleType.PLANKTON, x, y);
      }
    }
    
    // 气泡
    const bubbleConfig = this.configs.get(ParticleType.BUBBLE)!;
    if (Math.random() < 0.3) {
      const x = Math.random() * this.width;
      const y = this.height * 0.8 + Math.random() * this.height * 0.2;
      this.emit(ParticleType.BUBBLE, x, y);
    }
    
    // 尘埃
    const dustConfig = this.configs.get(ParticleType.DUST)!;
    if (Math.random() < 0.2) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height * 0.5;
      this.emit(ParticleType.DUST, x, y);
    }
  }
  
  /**
   * 更新单个粒子
   */
  private updateParticle(p: Particle, dt: number): void {
    // 记录轨迹
    if (p.trailLength > 0) {
      p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
      if (p.trail.length > p.trailLength) {
        p.trail.shift();
      }
    }
    
    // 物理更新
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.gravity;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.rotationSpeed;
    
    // 生命周期
    p.life -= dt;
    if (p.life <= 0) {
      this.pool.release(p);
      return;
    }
    
    // 呼吸效果（发光脉动）
    p.glowPhase += p.glowSpeed * dt;
    const breathe = 0.5 + 0.5 * Math.sin(p.glowPhase);
    
    // 生命周期透明度曲线
    const lifeRatio = p.life / p.maxLife;
    const fadeOut = lifeRatio < 0.2 ? lifeRatio / 0.2 : 1;
    const fadeIn = lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1;
    p.alpha = p.alpha * Math.min(fadeIn, fadeOut) * (0.7 + 0.3 * breathe);
    
    // 边界检查
    if (p.x < -50 || p.x > this.width + 50 || p.y < -50 || p.y > this.height + 50) {
      this.pool.release(p);
    }
  }
  
  /**
   * 渲染所有粒子
   */
  render(): void {
    const ctx = this.ctx;
    const particles = this.pool.getActive();
    
    // 按类型分组渲染（减少状态切换）
    const groups = new Map<ParticleType, Particle[]>();
    for (const p of particles) {
      if (!groups.has(p.type)) {
        groups.set(p.type, []);
      }
      groups.get(p.type)!.push(p);
    }
    
    // 渲染每组
    for (const [type, group] of groups) {
      this.renderGroup(type, group);
    }
  }
  
  /**
   * 渲染一组粒子
   */
  private renderGroup(type: ParticleType, particles: Particle[]): void {
    const ctx = this.ctx;
    
    switch (type) {
      case ParticleType.PLANKTON:
        this.renderPlankton(particles);
        break;
      case ParticleType.BUBBLE:
        this.renderBubbles(particles);
        break;
      case ParticleType.SPLASH:
        this.renderSplash(particles);
        break;
      case ParticleType.LIGHT_RAY:
        this.renderLightRays(particles);
        break;
      case ParticleType.DUST:
        this.renderDust(particles);
        break;
    }
  }
  
  /**
   * 渲染浮游生物（带发光效果）
   */
  private renderPlankton(particles: Particle[]): void {
    const ctx = this.ctx;
    
    for (const p of particles) {
      // 轨迹
      if (p.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.5;
        ctx.globalAlpha = p.alpha * 0.3;
        ctx.stroke();
      }
      
      // 发光核心
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.4, p.color + '80');
      gradient.addColorStop(1, p.color + '00');
      
      ctx.globalAlpha = p.alpha * p.glowIntensity;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // 核心点
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
  
  /**
   * 渲染气泡
   */
  private renderBubbles(particles: Particle[]): void {
    const ctx = this.ctx;
    
    for (const p of particles) {
      // 气泡主体
      ctx.globalAlpha = p.alpha * 0.3;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 高光
      ctx.globalAlpha = p.alpha * 0.8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
      ctx.fill();
      
      // 边缘
      ctx.globalAlpha = p.alpha * 0.5;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }
  
  /**
   * 渲染水花
   */
  private renderSplash(particles: Particle[]): void {
    const ctx = this.ctx;
    
    for (const p of particles) {
      // 轨迹
      if (p.trail.length > 0) {
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let i = 1; i < p.trail.length; i++) {
          ctx.lineTo(p.trail[i].x, p.trail[i].y);
        }
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size * 0.3;
        ctx.globalAlpha = p.alpha * 0.5;
        ctx.stroke();
      }
      
      // 水滴
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
  
  /**
   * 渲染光线
   */
  private renderLightRays(particles: Particle[]): void {
    const ctx = this.ctx;
    
    ctx.globalCompositeOperation = 'lighter';
    
    for (const p of particles) {
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(0.5, p.color + '40');
      gradient.addColorStop(1, p.color + '00');
      
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = gradient;
      
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.1);
      ctx.lineTo(p.size, 0);
      ctx.lineTo(0, p.size * 0.1);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    }
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
  
  /**
   * 渲染尘埃
   */
  private renderDust(particles: Particle[]): void {
    const ctx = this.ctx;
    
    for (const p of particles) {
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
  }
  
  // ==================== 公共方法 ====================
  
  /**
   * 重置系统
   */
  reset(): void {
    this.pool.clear();
    this.time = 0;
    this.emissionAccumulator = 0;
  }
  
  /**
   * 获取活跃粒子数
   */
  getActiveCount(): number {
    return this.pool.getActiveCount();
  }
  
  /**
   * 设置画布尺寸
   */
  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }
}

export { ParticleType, ParticleConfig, Particle };
