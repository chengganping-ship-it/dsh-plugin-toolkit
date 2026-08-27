# RFQ 虚构演示案例 (FICTIONAL DEMO)

> **⚠️⚠️⚠️ FICTIONAL DEMO — DO NOT CONTACT — DO NOT USE AS REAL LEAD ⚠️⚠️⚠️**
>
> **以下所有内容均为虚构。客户名、公司、邮箱、电话、图纸、价格、城市、街道、邮编、联系人职位 — 全部假设。**
> **本案例仅用于展示RFQ自动化输出的格式, 不可用于任何真实商业用途、不可作为真实客户线索、不可用于任何对外演示称其真实。**

---

## 演示目标

让一位机加工/钣金销售看 3 分钟后, 能说: "这就是我每天在手工整理的东西"。

---

## 1. 原始询盘邮件 (英文, 虚构)

**From:** austin.martin@autopart-sample.com *(虚构邮箱)*  
**To:** rfq-test@targetmfg-sample.cn *(虚构邮箱)*  
**Date:** 2026-08-07  
**Subject:** RFQ — Hydraulic Cylinder Mount Bracket, 2,000 pcs  

---

> Dear Sales,
>
> We are looking for a supplier for hydraulic cylinder mount brackets used in automotive lifts.
>
> - **Part name:** Hydraulic Cylinder Mount Bracket
> - **Material:** Carbon steel, preferably S355 or equivalent
> - **Finish:** Zinc plated, 8µm min, yellow chromate passivation
> - **Quantity:** 2,000 pcs (initial); expected repeat 5,000 pcs / quarter
> - **Dimensions:** See attached drawing. Key interface: Ø45H7 bore, 120mm hole spacing.
> - **Tolerance:** Bore +0.005/+0.015mm, hole spacing ±0.1mm
> - **Certification:** EN 10204 3.1 Mill Test Certificate required
> - **Target unit price:** Below USD 4.80 / pc *(虚构价格)*
> - **Delivery:** FOB Shanghai, 45 days after PO
> - **Sample:** 5 pre-production samples needed
>
> Please quote: FOB Shanghai unit price, MOQ, lead times for 2k and 5k.
>
> Regards,  
> **Austin Martin** *(虚构人名)*  
> AutoPart Sample Inc. *(虚构公司名)*

---

## 2. 附件清单 (虚构)

| 文件 | 类型 | 解析状态 |
|------|------|---------|
| bracket_drawing_v3.pdf | PDF 图纸 | ✅ OCR 完成 |
| spec_requirements.xlsx | Excel 规格表 | ✅ 结构提取 |

---

## 3. 结构化 RFQ 输出

### 必填层

| 字段 | 值 | 证据 |
|------|-----|------|
| 品名 | Hydraulic Cylinder Mount Bracket | 邮件正文 |
| 材料 | S355JR Carbon Steel | 图纸 + Excel |
| 初始数量 | 2,000 pcs | 邮件正文 |
| 后续预测 | 5,000 pcs/quarter | 邮件正文 |

### 影响报价层

| 字段 | 值 | 备注 |
|------|-----|------|
| 孔径+公差 | Ø45 +0.025/+0.040 mm | 图纸标注 |
| 孔距+公差 | 120 ±0.05 mm | 图纸标注 |
| 表面处理 | 镀锌 8µm + 黄钝化 | 邮件 + 图纸 |
| 材质证明 | EN 10204 3.1 | 邮件 |
| 贸易条款 | FOB Shanghai | 邮件 |
| 目标港 | Shanghai | 邮件 |
| 交期要求 | 45 天后 PO | 邮件 |

### 信息缺口 (Gaps)

| 严重度 | 字段 | 建议问题 (英文) |
|--------|------|-----------------|
| HIGH | 尺寸公差 | "邮件中 bore tolerance (+0.005/+0.015) 与图纸 H7 (+0.025/+0.040) 不一致, 哪个为准?" |
| HIGH | 孔距公差 | "邮件中 ±0.1mm 与图纸 ±0.05mm 不一致, 哪个为准?" |
| MEDIUM | 焊后热处理 | "图纸要求焊后去应力退火, 是否作为报价依据?" |
| MEDIUM | 盐雾测试 | "图纸要求 240h 盐雾测试, 是否作为报价依据?" |
| HIGH | 焊缝等级 | "图纸要求 ISO 5817-B, 是否作为报价依据?" |

### 冲突检测 (Conflicts)

| 类型 | 来源 A | 来源 B |
|------|--------|--------|
| 公差冲突 | 邮件: bore +0.005/+0.015 | 图纸: bore +0.025/+0.040 |
| 公差冲突 | 邮件: ±0.1mm | 图纸: ±0.05mm |

### 人工审批标记 (Approval Tags)

| 字段 | 状态 |
|------|------|
| 最终价格输出 | ❌ BLOCKED — 仅记录客户目标价 USD 4.80, 不输出我方价格 |
| 具体交期承诺 | ❌ BLOCKED |
| MOQ 承诺 | ❌ BLOCKED |
| 焊后热处理 / 盐雾 / 焊缝标准 | ⏳ 待客户确认 |

---

## 4. 中文内部摘要 (供苏州工厂内部流转)

---

**【RFQ-20260808-DEMO-001 内部摘要】**

**客户**: AutoPart Sample Inc *(虚构)*, 美国, 汽修设备经销商  
**品名**: 液压缸安装支架  
**材料**: S355JR碳钢  
**需求**: 首单2000 pcs, 后续5000 pcs/quarter  
**贸易条款**: FOB Shanghai, 交期要求45天  

**⚠️ 关键冲突:**
1. 邮件 bore tolerance (+0.005/+0.015) 与图纸 (+0.025/+0.040) **不一致, 必须确认**
2. 孔距公差邮件 (±0.1) vs 图纸 (±0.05) **不一致, 必须确认**
3. 图纸焊后热处理/ISO 5817-B/盐雾测试, 邮件未提及, **必须确认是否报价依据**

**启动部门:**
- 工程: 评估工艺
- 采购: 核算材料
- 质量: 评估盐雾/焊缝可行性
- 业务: 等内部信息齐全后, 根据确认结果回复客户

**下一步**: 内部会议后48小时内回复客户澄清问题

---

## 5. 英文回复草稿 (仅草稿, 绝不自动发送)

---

**Subject: Re: RFQ — Hydraulic Cylinder Mount Bracket**

> Dear Mr. Martin *(虚构)*
>
> Thank you for your inquiry. The part appears feasible.
>
> Before quoting, we need to clarify:
>
> 1. **Bore tolerance**: Your email says +0.005/+0.015 mm, but the drawing shows +0.025/+0.040 (H7). Which governs?
> 2. **Hole spacing tolerance**: Your email says ±0.1 mm, but the drawing shows ±0.05 mm. Which is correct?
> 3. **Additional drawing requirements**: The drawing specifies post-weld heat treatment, ISO 5817-B weld quality, and 240h salt spray. Should we include these in the quotation?
>
> Once clarified, we will quote within 3 business days.
>
> Best regards,
>
> **[待确认: 请选择对接销售]**  
> **[备选: 若库存不足可推荐 45# 钢替代, 待工程确认后更新]**  
> **[结算方式建议: T/T 30% + 70% B/L copy, 是否采纳?]**

---

## 6. 输出元数据 (供系统调试)

| 项 | 值 |
|----|-----|
| 抽取ID | RFQ-20260808-DEMO-001 |
| 附件数 | 2 |
| 已识别字段 | 14 / 17 个 |
| 缺口数 | 5 |
| 冲突数 | 2 |
| 报价承诺 | 无 |
| HUMAN_APPROVAL_REQUIRED 字段 | 4 项 |

---

## 7. 自检项

- [x] 邮件顶部有醒目的 FICTIONAL 标记
- [x] 所有"客户"/"公司"/"联系人名"明确标注虚构
- [x] 价格仅以"客户目标价"形式记录, 不做我方报价
- [x] 回复草稿中人名/公司名/电话均为占位符
- [x] 冲突检测仅限客观不一致, 不做主观工艺判断
- [x] 无任何自动发送的 SMTP/Webhook 调用
- [x] PDF几何不解析, 仅OCR文本和尺寸标注

---

> **状态**: [DRAFT BY CATPAW] — P0.5 加固 (全虚构+醒目警示+占位符)
> **使用**: 仅作为内部格式演示, 必须经真人审阅后才能对外展示
