# Time Capsule Reports (时间胶囊报告)

> 基于 2025-08-08 真实快照数据的深度分析报告集

[![Last Updated](https://img.shields.io/badge/updated-2025--08--08-blue)](.)
[![Data Verified](https://img.shields.io/badge/data-初步%20verified-green)](.)

---

## 概述

本目录收录三篇"时间胶囊"研究报告，每篇以特定日期的快照数据为基础，分析结构性趋势并附带:

- **原始数据路径**: 每条数据附来源、级别、复现方法
- **复现步骤**: 如何独立核实文中数据
- **失败案例**: 历史教训与对比分析
- **双语版本**: 中文 + English
- **发布准备**: Substack / GitHub 优化建议

---

## 报告列表

| # | 标题 | 核心论点 | 文件 |
|---|------|---------|------|
| 1 | AI推理成本的指数下降曲线 | 推理成本18个月下降21.4倍，但Hyperscaler边际Capex/营收比>10:1 | [CN](report1_ai_inference_cost/report_zh.md) / [EN](report1_ai_inference_cost/report_en.md) |
| 2 | 变压器交付危机——AI数据中心的物理监狱 | 变压器交期128周+进口依赖85%，形成"软件铲子"的结构性机会 | [CN](report2_transformer_crisis/report_zh.md) / [EN](report2_transformer_crisis/report_en.md) |
| 3 | De Minimis终结——跨境电商合规市场的核聚变时刻 | 单政策强制300万票/天新增报关，创造12-18个月合规自动化窗口 | [CN](report3_demise_minimis/report_zh.md) / [EN](report3_demise_minimis/report_en.md) |

---

## 目录结构

```
timecapsule_reports/
├── README.md                              ← 本文件
├── data_provenance_framework.md           ← 数据溯源分级与方法论
├── failure_registry.md                    ← 跨报告共享失败案例目录
├── scripts/
│   └── verify_all.sh                      ← 数据源批量复现脚本
├── report1_ai_inference_cost/
│   ├── report_zh.md / report_en.md
│   └── sources.yaml
├── report2_transformer_crisis/
│   ├── report_zh.md / report_en.md
│   └── sources.yaml
└── report3_demise_minimis/
    ├── report_zh.md / report_en.md
    └── sources.yaml
```

---

## 数据溯源标准

本系列采用三级验证体系:

| 级别 | 标注 | 来源要求 |
|------|------|---------|
| Tier 1 | 【已验证】 | 官方源 + URL + 时间戳 + 可复现 |
| Tier 2 | 【推测】 | ≥2个已验证点推算，附推算逻辑 |
| Tier 3 | 【未验证】 | 单一来源，需进一步核实 |

详见 [data_provenance_framework.md](data_provenance_framework.md)。

---

## 复现所有数据

```bash
# Linux/WSL/macOS
bash scripts/verify_all.sh

# Windows PowerShell (Git Bash available)
# Or use web_fetch tool to manually check URLs in sources.yaml
```

---

## 调用 Substack 发布

1. **首图**: 每篇文章选取一张核心图表，导出为 1200×630 PNG
2. **标题格式**: "数字 + 为什么/如何" 结构，如 "$0.07/M Tokens: 为什么AI推理成本正在经历超摩尔定律崩溃"
3. **标签**: #AI #SupplyChain #Energy #TradeCompliance
4. **CTA**: 篇末加一个开放问题引导评论区讨论
5. **Newsletter订阅**: 使用 Substack 原生转化钩子

---

## 调用 GitHub 发布

```bash
git init
git add .
git commit -m "feat: add snapshot reports 2025-08-08"
git tag v2025.08.08
git push origin main --tag v2025.08.08
```

建议创建 `issues_template.md`:
```markdown
## 数据过时警告
- [ ] 报告名称: 
- [ ] 受影响数据点: 
- [ ] 原值: 
- [ ] 新值 (附来源): 
- [ ] 影响范围:
```

---

## 许可证

- 文本内容: **CC BY-SA 4.0**
- 数据源保留各自原始许可
- 商业使用请确认数据来源许可条款

---

## 更新频率

| 事件 | 动作 |
|------|------|
| 政策大更新 | 新快照报告 |
| 单变量超阈值 | 该报告修订版 + Changelog |
| 季度例行核查 | 通过脚本批量复现 |

---

*框架版本: timecapsule-framework v1.1 | 维护者: CatPaw Research Desk*
