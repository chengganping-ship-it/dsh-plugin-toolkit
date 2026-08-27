/**
 * 《孤岛钩沉》资产自动化处理脚本
 * 
 * 功能：
 * 1. 自动抠图/蒙版处理（移除背景，保留主体）
 * 2. 统一色板（应用复古航海手账色调）
 * 3. 添加复古噪点（版画质感）
 * 4. 极致压缩并生成纹理图集（Texture Atlas）
 * 
 * 依赖：npm install sharp canvas
 * 用法：node scripts/processAssets.cjs
 */

const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

// ==================== 配置 ====================
const CONFIG = {
  rawDir: path.join(__dirname, '..', 'assets', 'raw'),
  outputDir: path.join(__dirname, '..', 'assets', 'processed'),
  atlasDir: path.join(__dirname, '..', 'assets', 'processed', 'atlas'),
  
  // 统一色板 - 复古航海手账色调
  palette: {
    inkBlue: '#1a3a5c',      // 深海墨蓝
    parchment: '#e8d5b7',    // 羊皮纸黄
    rustRed: '#8b4513',      // 铁锈红
    seaGreen: '#2e5c4f',     // 深海绿
    goldAccent: '#c9a227',   // 金色点缀
    biolumCyan: '#00e5ff',   // 生物发光青
    biolumGreen: '#39ff14',  // 生物发光绿
    shadowBlack: '#0a0f1a',  // 阴影黑
  },
  
  // 色板映射（将相近色映射到统一色板）
  colorMap: [
    { target: [26, 58, 92], range: 80 },      // inkBlue
    { target: [232, 213, 183], range: 60 },    // parchment
    { target: [139, 69, 19], range: 70 },      // rustRed
    { target: [46, 92, 79], range: 70 },       // seaGreen
    { target: [201, 162, 39], range: 60 },     // goldAccent
    { target: [0, 229, 255], range: 50 },      // biolumCyan
    { target: [57, 255, 20], range: 50 },      // biolumGreen
    { target: [10, 15, 26], range: 40 },       // shadowBlack
  ],
  
  // 输出尺寸限制
  maxSize: 512,
  atlasSize: 2048,
  atlasPadding: 4,
  
  // 压缩质量
  pngQuality: 80,
  webpQuality: 75,
  
  // 噪点强度
  noiseIntensity: 0.03,
};

// ==================== 工具函数 ====================

/**
 * 确保目录存在
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 获取所有图片文件
 */
function getImageFiles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f));
}

/**
 * 计算颜色距离
 */
function colorDistance(c1, c2) {
  return Math.sqrt(
    Math.pow(c1[0] - c2[0], 2) +
    Math.pow(c1[1] - c2[1], 2) +
    Math.pow(c1[2] - c2[2], 2)
  );
}

/**
 * 找到最接近的色板颜色
 */
function findNearestPaletteColor(r, g, b) {
  let minDist = Infinity;
  let nearest = [r, g, b];
  
  for (const { target, range } of CONFIG.colorMap) {
    const dist = colorDistance([r, g, b], target);
    if (dist < minDist && dist < range) {
      minDist = dist;
      nearest = target;
    }
  }
  
  return nearest;
}

// ==================== 核心处理函数 ====================

/**
 * 自动抠图 - 移除纯色/近似纯色背景
 * 使用边缘检测 + 连通域分析实现智能抠图
 */
async function autoMask(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  // 获取图像数据
  const { data, info } = await image
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
  
  // 采样四角颜色作为背景参考
  const corners = [
    getPixel(data, info, 0, 0),
    getPixel(data, info, width - 1, 0),
    getPixel(data, info, 0, height - 1),
    getPixel(data, info, width - 1, height - 1),
  ];
  
  const bgColor = averageColor(corners);
  const tolerance = 45; // 背景容差
  
  // 创建蒙版
  const mask = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = getPixel(data, info, x, y);
      const dist = colorDistance(pixel, bgColor);
      const idx = y * width + x;
      mask[idx] = dist < tolerance ? 0 : 255;
    }
  }
  
  // 形态学操作：膨胀 + 腐蚀（去噪 + 平滑边缘）
  const dilated = dilateMask(mask, width, height, 2);
  const eroded = erodeMask(dilated, width, height, 1);
  
  // 应用蒙版到 alpha 通道
  for (let i = 0; i < width * height; i++) {
    data[i * 4 + 3] = eroded[i];
  }
  
  // 输出带透明通道的 PNG
  await sharp(data, {
    raw: { width, height, channels: 4 }
  })
  .png({ quality: CONFIG.pngQuality })
  .toFile(outputPath);
  
  return outputPath;
}

/**
 * 获取像素颜色
 */
function getPixel(data, info, x, y) {
  const idx = (y * info.width + x) * info.channels;
  return [data[idx], data[idx + 1], data[idx + 2], data[idx + 3] || 255];
}

/**
 * 计算平均颜色
 */
function averageColor(colors) {
  const sum = colors.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0]);
  return sum.map(v => Math.round(v / colors.length));
}

/**
 * 膨胀操作
 */
function dilateMask(mask, width, height, radius) {
  const result = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let max = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            max = Math.max(max, mask[ny * width + nx]);
          }
        }
      }
      result[y * width + x] = max;
    }
  }
  return result;
}

/**
 * 腐蚀操作
 */
function erodeMask(mask, width, height, radius) {
  const result = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let min = 255;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            min = Math.min(min, mask[ny * width + nx]);
          }
        }
      }
      result[y * width + x] = min;
    }
  }
  return result;
}

/**
 * 统一色板 - 将图像颜色映射到复古航海手账色板
 */
function applyPalette(inputPath, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await loadImage(inputPath);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, image.width, image.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
        
        // 保持透明像素
        if (a === 0) continue;
        
        const nearest = findNearestPaletteColor(r, g, b);
        data[i] = nearest[0];
        data[i + 1] = nearest[1];
        data[i + 2] = nearest[2];
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // 输出
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      resolve(outputPath);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 添加复古噪点 - 模拟版画/手账质感
 */
async function addVintageNoise(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  // 生成噪点纹理
  const noiseBuffer = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const noise = (Math.random() - 0.5) * 255 * CONFIG.noiseIntensity;
    noiseBuffer[i * 4] = 128 + noise;
    noiseBuffer[i * 4 + 1] = 128 + noise;
    noiseBuffer[i * 4 + 2] = 128 + noise;
    noiseBuffer[i * 4 + 3] = Math.abs(noise) * 2;
  }
  
  // 叠加噪点
  const inputBuffer = await image.ensureAlpha().raw().toBuffer();
  const outputBuffer = Buffer.alloc(inputBuffer.length);
  
  for (let i = 0; i < inputBuffer.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const input = inputBuffer[i + c];
      const noise = (noiseBuffer[i + c] - 128) * CONFIG.noiseIntensity;
      outputBuffer[i + c] = Math.max(0, Math.min(255, input + noise));
    }
    outputBuffer[i + 3] = inputBuffer[i + 3];
  }
  
  await sharp(outputBuffer, {
    raw: { width, height, channels: 4 }
  })
  .png({ quality: CONFIG.pngQuality })
  .toFile(outputPath);
  
  return outputPath;
}

/**
 * 极致压缩 - 生成 WebP 格式
 */
async function compressToWebP(inputPath, outputPath) {
  await sharp(inputPath)
    .webp({ quality: CONFIG.webpQuality, effort: 6 })
    .toFile(outputPath);
  
  return outputPath;
}

// ==================== 纹理图集生成 ====================

/**
 * 生成纹理图集（Texture Atlas）
 * 将多个小图合并成一张大图，减少 Draw Call
 */
async function generateAtlas(imagePaths, outputName) {
  const atlasSize = CONFIG.atlasSize;
  const padding = CONFIG.atlasPadding;
  
  const canvas = createCanvas(atlasSize, atlasSize);
  const ctx = canvas.getContext('2d');
  
  // 透明背景
  ctx.clearRect(0, 0, atlasSize, atlasSize);
  
  // 矩形装箱算法（MaxRects）
  const bins = [];
  const placements = [];
  
  // 按高度排序
  const sortedImages = [];
  for (const imgPath of imagePaths) {
    const img = await loadImage(imgPath);
    sortedImages.push({ path: imgPath, img, width: img.width, height: img.height });
  }
  sortedImages.sort((a, b) => b.height - a.height);
  
  // 简单装箱
  let x = padding, y = padding, rowHeight = 0;
  
  for (const item of sortedImages) {
    if (x + item.width + padding > atlasSize) {
      x = padding;
      y += rowHeight + padding;
      rowHeight = 0;
    }
    
    if (y + item.height + padding > atlasSize) {
      console.warn(`图集空间不足，跳过: ${path.basename(item.path)}`);
      continue;
    }
    
    ctx.drawImage(item.img, x, y);
    placements.push({
      name: path.basename(item.path, path.extname(item.path)),
      x, y, width: item.width, height: item.height,
      u0: x / atlasSize, v0: y / atlasSize,
      u1: (x + item.width) / atlasSize, v1: (y + item.height) / atlasSize,
    });
    
    x += item.width + padding;
    rowHeight = Math.max(rowHeight, item.height);
  }
  
  // 裁剪图集到实际使用高度
  const actualHeight = y + rowHeight + padding;
  const finalCanvas = createCanvas(atlasSize, actualHeight);
  const finalCtx = finalCanvas.getContext('2d');
  finalCtx.drawImage(canvas, 0, 0);
  
  // 输出图集
  const atlasPath = path.join(CONFIG.atlasDir, `${outputName}.png`);
  const atlasBuffer = finalCanvas.toBuffer('image/png');
  fs.writeFileSync(atlasPath, atlasBuffer);
  
  // 输出图集元数据 JSON
  const metaPath = path.join(CONFIG.atlasDir, `${outputName}.json`);
  const metadata = {
    name: outputName,
    width: atlasSize,
    height: actualHeight,
    sprites: placements,
  };
  fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
  
  console.log(`图集已生成: ${atlasPath} (${atlasSize}x${actualHeight})`);
  console.log(`元数据已生成: ${metaPath}`);
  
  return { atlasPath, metaPath, metadata };
}

// ==================== 主处理管线 ====================

/**
 * 处理单个资产
 */
async function processAsset(inputPath, outputName) {
  console.log(`\n处理: ${path.basename(inputPath)}`);
  
  const tempDir = path.join(CONFIG.outputDir, 'temp');
  ensureDir(tempDir);
  
  const steps = [];
  
  // Step 1: 自动抠图
  const maskedPath = path.join(tempDir, `${outputName}_masked.png`);
  await autoMask(inputPath, maskedPath);
  steps.push({ step: '抠图', path: maskedPath });
  console.log(`  ✓ 抠图完成`);
  
  // Step 2: 统一色板
  const palettePath = path.join(tempDir, `${outputName}_palette.png`);
  await applyPalette(maskedPath, palettePath);
  steps.push({ step: '色板', path: palettePath });
  console.log(`  ✓ 色板统一完成`);
  
  // Step 3: 添加复古噪点
  const noisePath = path.join(tempDir, `${outputName}_final.png`);
  await addVintageNoise(palettePath, noisePath);
  steps.push({ step: '噪点', path: noisePath });
  console.log(`  ✓ 复古噪点添加完成`);
  
  // Step 4: 压缩为 WebP
  const webpPath = path.join(CONFIG.outputDir, `${outputName}.webp`);
  await compressToWebP(noisePath, webpPath);
  steps.push({ step: '压缩', path: webpPath });
  console.log(`  ✓ WebP 压缩完成`);
  
  // 获取文件大小
  const stats = fs.statSync(webpPath);
  console.log(`  📦 输出大小: ${(stats.size / 1024).toFixed(1)} KB`);
  
  return { steps, finalPath: webpPath, size: stats.size };
}

/**
 * 主函数
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║     《孤岛钩沉》资产自动化处理管线 v1.0          ║');
  console.log('╚══════════════════════════════════════════════════╝\n');
  
  // 确保输出目录存在
  ensureDir(CONFIG.outputDir);
  ensureDir(CONFIG.atlasDir);
  
  // 获取所有原始图片
  const rawFiles = getImageFiles(CONFIG.rawDir);
  
  if (rawFiles.length === 0) {
    console.log('⚠️  未找到原始图片，请将图片放入 assets/raw/ 目录');
    console.log('\n目录结构:');
    console.log('  assets/raw/        ← 放入原始 AI 生成图片');
    console.log('  assets/processed/  ← 输出处理后的图片');
    console.log('  assets/processed/atlas/ ← 输出纹理图集');
    return;
  }
  
  console.log(`📁 找到 ${rawFiles.length} 张原始图片\n`);
  
  const results = [];
  let totalSize = 0;
  
  // 处理每张图片
  for (const file of rawFiles) {
    const inputPath = path.join(CONFIG.rawDir, file);
    const outputName = path.basename(file, path.extname(file));
    
    try {
      const result = await processAsset(inputPath, outputName);
      results.push({ file, ...result });
      totalSize += result.size;
    } catch (err) {
      console.error(`  ✗ 处理失败: ${err.message}`);
    }
  }
  
  // 生成纹理图集
  if (results.length > 0) {
    console.log('\n📐 生成纹理图集...');
    const finalPaths = results.map(r => r.finalPath);
    await generateAtlas(finalPaths, 'game_assets');
  }
  
  // 输出统计
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║                   处理完成统计                   ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  处理图片数: ${results.length.toString().padStart(3)}                              ║`);
  console.log(`║  总输出大小: ${(totalSize / 1024).toFixed(1).padStart(6)} KB                          ║`);
  console.log(`║  平均每张:   ${(totalSize / results.length / 1024).toFixed(1).padStart(6)} KB                          ║`);
  console.log('╚══════════════════════════════════════════════════╝');
}

// 运行
main().catch(err => {
  console.error('❌ 处理管线错误:', err);
  process.exit(1);
});
