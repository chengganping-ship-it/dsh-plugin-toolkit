# RFQ 结构化抽取 Schema (精简版)

> **版本**: v1.1 (P0.5 瘦身) | **创建日期**: 2026-08-08
> **状态**: [DRAFT BY CATPAW]
> **变化**: 按 P0.5 反馈瘦身为 3 层字段, 删除过度设计的状态机和泛行业字段

---

## 字段分层: 只留最小可报价字段集

### 必填层 (HIGH — 无此字段无法报价)

| 字段 | 路径 | 说明 |
|------|------|------|
| 产品名 | `products[].name` | 客户声明的零件名 |
| 材料 | `products[].specifications.material` | 必须具体牌号, 如"SUS304"/"AL6061-T6" |
| 数量+单位 | `products[].quantity.value` + `.unit` | 含首单与后续预测 |

### 影响报价层 (MEDIUM — 缺失会降低报价精度)

| 字段 | 路径 | 说明 |
|------|------|------|
| 关键尺寸 | `products[].specifications.dimensions` | 长/宽/高/孔径 + 单位(mm/inch) |
| 公差 | `products[].specifications.tolerance` | 形位公差或尺寸公差 |
| 表面处理 | `products[].specifications.surface_treatment` | 如 anodized / zinc_plating / powder_coating |
| 认证要求 | `products[].certification_required[]` | 仅供内部判断成本, 不输出给客户 |
| 交期 | `products[].delivery.target_date` | 仅记录, 不承诺 |
| 贸易条款 | `products[].delivery.incoterm` | FOB/CIF/EXW 等 |
| 目标港 | `products[].delivery.target_port` | 用途: 核算运费参考 |

### 仅归档层 (LOW — 不直接影响报价, 仅内部流转)

| 字段 | 路径 | 说明 |
|------|------|------|
| 客户提及的目标价 | `products[].price_mentioned.value` | **仅内部参考**, 不写入对外输出 |
| 客户国家/地区 | `customer.country_region` | 可用于判断认证要求, 但不主动输出 |
| 客户行业推断 | `customer.industry_hint` | 仅归档 |
| 包装要求 | `products[].packaging` | 仅当客户指定时记录 |
| 图纸元数据 | `attachments[].filename + file_type` | 不解析CAD几何, 仅记录附件清单 |

---

## HUMAN_APPROVAL_REQUIRED 强制标记

以下字段**永远不能**由 AI 输出到对外文本:

| 字段 | 原因 |
|------|------|
| 我方最终价格 | 商业决策 |
| 具体交期承诺 | 履约风险 |
| MOQ 承诺 | 产能与条款 |
| 产品认证结论 | 法律责任 |
| HS 编码 / 税率 | 归类资格 |
| 合同条款 | 法律效力 |
| 银行信息 | 资金安全 |
| 技术可行性判断 | 工程资质 |
| 出口管制结论 | 刑事风险 |

**实现方式**: 输出 JSON 中, 上述字段要么为 `null`, 要么必须附带 `"approval_status": "pending"`。

---

## 冲突检测规则 (只做客观冲突)

仅做以下 4 类客观冲突, **不做**主观判断 (如"是否可制造""是否接单"):

| 规则编号 | 冲突类型 | 检测方式 |
|----------|---------|---------|
| C-01 | 数量不一致 | 邮件正文 vs Excel vs PDF 提到同一产品数量不同 |
| C-02 | 尺寸公差冲突 | 邮件 vs 图纸的公差标注明显不一致 |
| C-03 | 材质-表面处理冲突 | 如"铝合金" + "热镀锌" (工艺上不可行) |
| C-04 | 交期物理不可能 | 客户指定交期 < 日期校验阈值 (只提示, 不替客户判断能否赶工) |

**不做的冲突**:
- "价格是否合理" (商业判断)
- "工艺是否可制造" (工程判断)
- "客户是否优质" (销售判断)

---

## 最小 JSON 输出结构

```json
{
  "rfq_id": "RFQ-YYYYMMDD-XXXX",
  "source": {
    "type": "email",
    "received_at": "ISO8601"
  },
  "customer": {
    "country": "US (inferred from domain)",
    "company": null
  },
  "products": [
    {
      "name": "Aluminum bracket",
      "quantity": { "value": 2000, "unit": "pcs", "confidence": "exact" },
      "material": "AL6061-T6",
      "dimensions": { "length": 120, "width": 80, "height": 25, "unit": "mm" },
      "tolerance": null,
      "surface_treatment": "anodized",
      "certifications_required": [],
      "delivery": { "incoterm": "FOB", "port": "Los Angeles" },
      "price_mentioned_by_customer": { "value": null, "currency": null }
    }
  ],
  "gaps": [
    { "field": "tolerance", "severity": "high", "suggested_question_en": "Please specify the tolerance requirement." }
  ],
  "conflicts": [
    { "type": "quantity_mismatch", "sources": ["email: 2000 pcs", "excel: 5000 pcs"] }
  ],
  "approval_required_for": ["final_price", "delivery_period", "moq"],
  "audit": {
    "model_used": "Qwen3-72B-local",
    "extracted_at": "ISO8601",
    "human_review_status": "pending"
  }
}
```

**约束**: 任何数值字段为 null 时, evidence 字段也必为 null。不允许有 "数字存在但 source 缺失" 的状态。

---

## 不做的事 (已删除的过度设计)

| 删除项 | 原因 |
|--------|------|
| CRM/ERP 通用字段 | 不在 RFQ 抽取范围 |
| 复杂状态机 (7 种状态) | 初期只用 pending → approved/rejected |
| 跨客户历史匹配 | P1 不碰历史数据库 |
| 自动外汇换算 | 仅供内部参考, 系统不主动做 |
| 建议报价区间 | 这是销售/工程师的工作 |
| 可制造性判定 | AI 不做工艺判断 |

---

> **状态**: [DRAFT BY CATPAW] — P0.5 瘦身完成
> **下一步**: 真人审阅后进入 P1
