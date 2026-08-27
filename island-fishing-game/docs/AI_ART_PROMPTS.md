# 《孤岛钩沉》顶级美术素材 AI Prompt 集

## 视觉风格定义

**核心风格**：复古航海手账（手绘/版画感） + 深海生物发光（Bioluminescence）强对比

**统一要求**：
- 笔触：铜版画/木刻版画线条，粗细变化明显，有手工刻制的刀痕感
- 光影：单一光源（月光/提灯），强明暗对比，暗部偏冷蓝，暖光区域偏金黄
- 色调：以深海墨蓝（#1a3a5c）为基底，点缀生物发光青（#00e5cc）和铁锈红（#8b4513）
- 质感：羊皮纸泛黄边缘，轻微做旧污渍，复古手账的纸张纹理

---

## Prompt 1：深海背景（Deep Sea Background）

```
A vast deep ocean abyss scene in the style of an antique nautical journal illustration, 
copper plate engraving technique with bold cross-hatching and fine line work. 

The composition shows a vertical cross-section of the ocean: 
- Upper layer: dark indigo water (#0a1628) with faint moonlight filtering down from surface
- Middle layer: scattered bioluminescent plankton particles glowing in cyan (#00e5ff) and green (#39ff14)
- Lower layer: ancient submerged ruins of a fishing village, covered in seaweed and coral
- Bottom: dark abyssal plain with mysterious glowing runes

Lighting: Single moonlight source from upper right, creating dramatic chiaroscuro. 
Bioluminescent organisms emit soft ethereal glow. Strong contrast between deep shadows and luminous highlights.

Style: Vintage maritime logbook illustration, hand-engraved aesthetic, 
parchment texture overlay, slight yellowing at edges, 
ink wash tones of sepia and navy blue, 
visible plate mark border, 18th century naturalist documentation style.

Technical: 16:9 aspect ratio, 4K resolution, 
clean edges suitable for game background tiling, 
no text or watermarks, transparent areas for UI overlay.
```

**用途**：游戏主背景，深海场景的垂直全景图

---

## Prompt 2：发光鱼类与海洋生物（Bioluminescent Sea Creatures）

```
A collection of deep-sea bioluminescent creatures arranged in a naturalist study composition, 
antique scientific illustration style with copper plate engraving and hand-colored wash.

Subjects (arranged in specimen layout):
- Center: A ghostly anglerfish with elaborate bioluminescent lure glowing cyan (#00e5ff), 
  translucent body revealing internal organs, sharp needle-like teeth
- Upper left: A cluster of crystal jellyfish with pulsing green (#39ff14) inner glow, 
  trailing tentacles with stinging cells visible
- Upper right: A lanternfish with rows of blue photophores along its silver body
- Lower left: A vampire squid with webbed arms, red eyes glowing (#ff4444)
- Lower right: A comb jelly refracting light into rainbow ribbons

Each creature is depicted with anatomical precision, labeled with delicate cursive script, 
surrounded by measurement scales and observational notes.

Lighting: Each creature is self-illuminated with its bioluminescent glow, 
casting soft colored light on surrounding dark water. 
Background is pure deep ocean black (#050d1a) to make creatures pop.

Style: 18th century naturalist expedition journal, 
specimen plate aesthetic, hand-tinted engraving, 
aged parchment background with coffee stains and foxing marks, 
Latin nomenclature labels in elegant script.

Technical: Individual creatures on transparent background (PNG), 
each in separate layer, 512x512px minimum per creature, 
clean silhouettes for sprite extraction.
```

**用途**：游戏中的可收集鱼类、深海生物精灵图

---

## Prompt 3：神秘岛屿与航海元素（Mysterious Islands & Nautical Elements）

```
A dramatic seascape of mysterious islands emerging from misty ocean waters, 
in the style of an antique maritime exploration journal with woodblock print aesthetics.

Composition:
- Foreground: A rugged island cliff face with ancient carved symbols glowing faint gold (#c9a227), 
  weathered fishing huts perched on stilts, a weathered wooden dock with coiled ropes
- Middle ground: A traditional Chinese junk ship with tattered sails navigating through bioluminescent waters, 
  its lantern casting warm amber light (#ffd700) on the surrounding waves
- Background: Distant island silhouettes shrouded in mist, 
  a massive full moon hanging low on the horizon, 
  its reflection creating a golden path on the water
- Sky: Dramatic cloud formations with stars peeking through, 
  subtle aurora-like bioluminescence in the upper atmosphere

Details: 
- Waves rendered with Hokusai-inspired woodblock curves
- Foam and spray depicted with white ink splatter technique
- Island vegetation shows wind-swept pine trees and bamboo
- Ancient stone lanterns with glowing runes mark dangerous reefs

Lighting: Moonlight from behind creates dramatic backlighting and rim light on waves. 
Ship lantern provides warm foreground illumination. 
Bioluminescent water glows ethereal cyan in the ship's wake.

Style: Ukiyo-e woodblock print meets Victorian expedition sketchbook, 
bold outlines with flat color areas, 
bokashi gradient technique for sky and water, 
aged washi paper texture, red artist's seal stamp in corner.

Technical: 16:9 aspect ratio, 4K resolution, 
parallax-ready layers (foreground/midground/background separated), 
no text or modern elements, game asset quality.
```

**用途**：游戏关卡背景、岛屿场景、主视觉图

---

## 补充 Prompt：道具与 UI 元素

```
A set of antique nautical fishing equipment and navigation tools arranged on aged parchment, 
vintage scientific illustration style with copper plate engraving.

Subjects:
- A weathered brass fishing reel with glowing runic inscriptions
- A coiled fishing line with bioluminescent bait
- An antique compass with mother-of-pearl inlay
- A ship's lantern with blue flame
- A carved jade fish talisman
- Nautical charts with hand-drawn sea monsters

Style: Antique naturalist specimen plate, hand-colored engraving, 
aged paper background, Latin labels, measurement scales.
Technical: Transparent background, 256x256px per item, clean edges.
```

---

## 使用建议

1. **生成工具**：推荐使用 Midjourney v6 或 DALL-E 3，设置 `--style raw` 以获得更一致的版画效果
2. **后处理**：所有生成的图片需经过 `processAssets.cjs` 处理（抠图 → 色板统一 → 噪点 → 压缩）
3. **尺寸规范**：
   - 背景图：1920x1080（最终压缩至 512x288 用于微信小游戏）
   - 角色/鱼类：512x512（压缩至 128x128）
   - 道具：256x256（压缩至 64x64）
4. **命名规范**：`[类型]_[名称]_[变体].png`，如 `fish_anglerfish_glowing.png`
