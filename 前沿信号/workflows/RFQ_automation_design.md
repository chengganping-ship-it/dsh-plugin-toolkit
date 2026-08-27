# RFQ 自动化流程设计 (P0.5 精简版)

> **版本**: v1.1 (P0.5) | **创建日期**: 2026-08-08
> **状态**: [DRAFT BY CATPAW]
> **变化**: 从 12 节点群砍至 6 步最小闭环
> **引擎**: n8n (自托管 CE)
> **部署**: 单节点 Docker, 苏州/上海节点

---

## P1 只允许 6 步

```
 Step 1      Step 2        Step 3        Step 4        Step 5        Step 6
┌────────┐  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
│ TRIGGER│→ │ PARSE  │ → │EXTRACT │ → │VALIDATE│ → │ FEISHU │ → │  STOP  │
│ 邮件转发 │  │附件OCR │   │LLM抽取 │   │冲突检测│   │ 写入   │   │ 等人工 │
└────────┘  └────────┘   └────────┘   └────────┘   └────────┘   └────────┘
                                                                  ↓
                                                         人工在飞书复核
                                                         人工发送邮件
                                                         (系统绝不自动发信)
```

---

## Step 1: 触发 (Trigger)

**只做一种入口**: 邮件转发到指定测试邮箱 (如 rfq-test@客户域名)

```yaml
节点: n8n emailReadImap
配置:
  mailhost: 客户邮箱 IMAP
  criteria: UNSEEN
  attachBinaryData: true
失败:
  - 连接失败重试 3 次
  - 连续失败 3 次: 停止 + 飞书报警
```

**不做的入口 (P1 排除)**:
- ❌ Webhook 上传 (P2 再做)
- ❌ 飞书表单 (P2 再做)
- ❌ WhatsApp / 微信 (全阶段排除)

---

## Step 2: 解析 (Parse)

```yaml
节点: switch (按文件后缀路由)
路由:
  pdf → PyMuPDF 文本提取 (字符<50 时触发 PaddleOCR)
  xlsx → openpyxl 读前50行, 提取表头→值对
  docx → python-docx 提取段落
  png/jpg → PaddleOCR (英文优先)
  dwg/step/igs → 仅记录元数据 (文件名/修改时间), 不解析几何
  其他 → 标记"不支持", 不阻断后续
失败:
  - 加密 PDF/Excel → 标记"加密" + 通知人工
  - OCR avg_conf < 0.70 → confidence=low_ocr, 人工核对
```

**不做的解析**: CAD 实体识别、BOM 自动生成、3D 模型理解。

---

## Step 3: 抽取 (Extract)

```yaml
节点: LLM (Ollama 本地模型 或 国内合规 API)
system_prompt:
  "你是RFQ抽取工具。按给定Schema输出JSON。不知道返回null。
   所有数字附带原文证据。价格/交期/认证字段标记HUMAN_APPROVAL_REQUIRED。"
模型优先级:
  1. Ollama + Qwen3-72B (本地, 无数据出境)
  2. 国内合规 API (智谱/MiniMax) + DPA
  3. 禁用的模型: 所有境外 API (除非客户书面个别授权)
失败:
  - 输出非 JSON → 重试 1 次 → 仍失败转规则提取
  - 关键数字缺失 evidence → 置 null
```

**不做的抽取**: 工艺路线建议、可制造性判断、自动报价区间。

---

## Step 4: 校验 (Validate)

```yaml
节点: JavaScript 代码 (30 行, 无 LLM, 无第三方库)
节点类型: n8n Code (Run Once for All Items)
输入: Step 3 输出的 JSON ($input.all()[0].json)
输出: [{json: validated_json}] (附加 gaps[] + conflicts[] + approval_required)
硬性约束: 此节点必须是纯 JS, 禁止调 LLM 校验 LLM; 不依赖 Python 或 npm 包
实现 (代码见 § Step 4 Implementation)
```

**不做的校验**: "此单是否可接""利润是否合理""客户是否优质"。

---

### Step 4 Implementation (JavaScript, 直接复制到 n8n Code 节点)

```javascript
// =============================================================
// RFQ Step 4: Validate
// 纯硬代码校验, 不依赖 LLM, 不依赖第三方库
// 节点类型: Code (Run Once for All Items)
// 输入: Step 3 输出的 JSON ($input.all()[0].json)
// 输出: [{json: {validated result}}]
// =============================================================

const item = $input.all()[0].json;
const gaps = [];
const conflicts = [];
const approval_required = [];

const products = item.products || [];
if (products.length === 0) {
  gaps.push({field: "products_empty", severity: "high", msg: "未识别到任何产品"});
}

for (const p of products) {
  // V1 必填字段检测
  if (!p.name) {
    gaps.push({field: "product_name", severity: "high"});
  }
  if (!p.material) {
    gaps.push({field: "material", severity: "high"});
  }
  const qty = p.quantity || {};
  if (!qty.value || qty.value <= 0) {
    gaps.push({field: "quantity", severity: "high"});
  }
  const validUnits = ["pcs","sets","kgs","sqm","m","ton","pair","lot"];
  if (qty.unit && !validUnits.includes(qty.unit)) {
    gaps.push({field: "unit_unsupported", severity: "medium"});
  }

  // V2 数量跨文件冲突
  const sources = qty.all_mentions || [];
  if (sources.length > 1 && new Set(sources).size > 1) {
    conflicts.push({type: "quantity_mismatch", sources: sources});
  }

  // V3 材质-表面处理冲突 (静态规则表)
  const badCombos = {
    "aluminum": ["hot_dip_galvanizing"],
    "stainless steel": ["zinc_plating"],
    "sus304": ["zinc_plating"],
    "sus316": ["zinc_plating"]
  };
  const surf = (p.surface_treatment || "").toLowerCase();
  const mat = (p.material || "").toLowerCase();
  for (const [badMat, badSurfs] of Object.entries(badCombos)) {
    if (mat.includes(badMat) && badSurfs.includes(surf)) {
      conflicts.push({
        type: "material_surface_conflict",
        detail: `${mat} + ${surf} 工艺不可行`
      });
    }
  }

  // V4 交期物理不可能
  const delivery = p.delivery || {};
  if (delivery.target_date) {
    const targetDate = new Date(delivery.target_date);
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    if (!isNaN(targetDate.getTime()) && targetDate < minDate) {
      conflicts.push({
        type: "delivery_impossible",
        detail: `交期 ${delivery.target_date} 不早于最早可能日期`
      });
    }
  }
}

// 强制 HUMAN_APPROVAL_REQUIRED (所有承诺字段)
const approvalFields = [
  "final_price", "delivery_promise", "moq_commitment",
  "certification_promise", "contract_terms", "bank_info"
];
for (const field of approvalFields) {
  approval_required.push({
    field: field,
    value_presented: null,
    approval_status: "pending"
  });
}

// 输出更新
item.gaps = gaps;
item.conflicts = conflicts;
item.approval_required_for = approval_required;
item.validation_passed = gaps.length === 0 && conflicts.length === 0;
item.validated_at = new Date().toISOString();

return [{json: item}];
```

**部署要点**: n8n 新建 **Code** 节点 → Run Once for All Items → 复制上面 JS → 无需任何 npm 包 → 直接可用。

---

## Step 5: 写入 (Write)

```yaml
节点: feishu bitable (多维表格)
写入字段:
  - 询盘编号 (RFQ-YYYYMMDD-XXXX)
  - 客户国家 (仅国家)
  - 品名 + 图号
  - 数量+单位
  - 材料 + 表面处理
  - 交期要求
  - 目标价 → 标注"客户提及, 未经我方确认"
  - 附件数
  - 信息缺口数
  - 冲突数
  - 抽取状态
失败:
  - 飞书 API 限速 → 指数退避重试
```

**不做的写入**: CRM 新客户创建、ERP 报价单生成、邮件草稿物理保存到发件箱。

---

## Step 6: 停止 (STOP) — 等人工

```
┌─────────────────────────────────────────────────────┐
│  系统在此停止。生成以下内容供人工复核:                    │
│  1. 飞书看板中新行 (Step 5 写入)                       │
│  2. 飞书机器人在工作群推送 "新询盘待复核: RFQ-xxx"       │
│  3. 回复草稿以飞书文档形式生成, 由人复制粘贴              │
│                                                     │
│  ⛔ 系统绝不:                                         │
│  - 调用 SMTP 发送邮件                                  │
│  - 调用任何消息 API (邮件/微信/WhatsApp)                │
│  - 修改飞书看板上的任何审批字段                          │
│  - 删除任何数据                                        │
│  - 自动回复客户                                        │
└─────────────────────────────────────────────────────┘
```

---

## P1 完成标准 (Go/No-Go)

| 指标 | 通过线 |
|------|--------|
| 连续 10 封虚构邮件跑通 6 步 | ✅ |
| 每封产出结构化摘要 + 缺口 + 冲突 + 草稿 | ✅ |
| 关键字段 (数量/材料/尺寸) 准确率 ≥ 95% | ✅ |
| 数字字段准确率 ≥ 98% | ✅ |
| 价格/交期字段 100% 标记 HUMAN_APPROVAL_REQUIRED | ✅ |
| 全程无自动 SMTP / 自动发送 | ✅ |
| 单次处理耗时 ≤ 10 分钟 (不含人工复核) | ✅ |

---

## P1 排除清单 (必须 HOLD)

| 排除项 | 原因 |
|--------|------|
| 自动 SMTP 发送 | 风险极高, P3 阶段再议 |
| 多入口 (WhatsApp/微信/Shopify) | P1 只接邮件转发 |
| ERP/CRM 直接写入 | P1 只写飞书 |
| 历史邮件批量抓取 | 首批只用客户专门提供的测试邮箱 |
| 外汇实时换算 | 仅供内部参考, 系统不主动做 |
| 客户名单跨越隔离 | 不同客户数据物理独立 |
| 产出反馈训练 | 不做自动闭环学习 |

---

> **状态**: [DRAFT BY CATPAW] — P0.5 精简完成 (6步)
> **下一步**: 真人审阅 → P1 部署
