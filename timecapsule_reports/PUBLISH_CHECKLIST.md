# 发布准备清单 (Substack / GitHub)

> 更新日期: 2025-08-08

---

## Pre-Publish 自查

### 数据层面
- [ ] 所有 Tier 1 (【已验证】) 数据在访问日期 URL 仍然有效(200)
- [ ] 所有 Tier 2 (【推测】) 数据附推算逻辑
- [ ] 所有 Tier 3 (【未验证】) 数据已标注"未验证"
- [ ] 数值在合理范围内 (无数量级错误，如 $0.7 vs $0.07)
- [ ] 中英文版本关键数值一致

### 文字层面
- [ ] 中文报告无"可能"、"或许"等模糊词汇(或已替换为概率估计)
- [ ] 所有引用来源有可追溯 URL
- [ ] 失败案例 TC-xxx 在 failure_registry.md 中有对应条目
- [ ] 版权声明(CC BY-SA 4.0)在每篇末尾

### 技术层面
- [ ] Markdown 表格在 GitHub/Substack 正确渲染
- [ ] 所有相对路径链接正确 (report_zh.md ↔ report_en.md ↔ sources.yaml)
- [ ] YAML sources 文件可正确解析
- [ ] 脚本 `scripts/verify_all.sh` 无语法错误

---

## Substack 发布优化

### 文章结构
- [ ] 标题含数字(强烈建议)
- [ ] 副标题含"为什么/如何/引爆点"等动词
- [ ] 前140字符作为预览文本可见核心论点
- [ ] 每节 H2 级标题独立成段

### 可视化
- [ ] 关键数值用内联高亮: `**$0.07/M tokens**`
- [ ] 表格至少1个(推荐价格对比表或时间线)
- [ ] 避免超过7列的表格(S移动端友好)

### Engagement
- [ ] 篇末 CTA: "[加入讨论] 你最近是否在..."
- [ ] 标签5个以内: #AI #SupplyChain #Energy #TradeCompliance #Geopolitics
- [ ] 评论区预先准备1-2个回复模板

### 多语种策略
- [ ] 中文首发 Substack 中文版(独立URL)
- [ ] 英文发布英文版
- [ ] 双语交叉: 中文篇末附 EN 链接，反之亦然

---

## GitHub 发布优化

### Repository 组织
- [ ] 仓库名: `timecapsule-reports`(全局) 或 `2025-08-08-crisis-three`(单期)
- [ ] README 中的徽章生效(Last Updated, Data Verified)
- [ ] LICENSE 文件附加(CC BY-SA 4.0)
- [ ] CONTRIBUTING.md 提供 Issue 模板

### Release 管理
- [ ] Tag: `v2025.08.08` (严格日历化)
- [ ] Release title: "Time Capsule Vol. 1 -- 三篇 2025-Q3 深度快照"
- [ ] Release notes: 简版执行摘要(每篇<100字)

### 社区维护
- [ ] Issues 模板 `data_stale_warning.md` 已创建
- [ ] 设置 GitHub Actions 定时触发 `verify_all.sh`(可选)
- [ ] Changelog 文件维护

---

## 发布后监测 (Post-Publish)

### 第一周
- [ ] Substack open rate >30% (行业基准)
- [ ] GitHub Stars >5(初始)
- [ ] Social shares: 至少 1 个被行业 KOL 引用
- [ ] 无任何数据量级错误反馈

### 月度
- [ ] 脚本复现结果无 `[WARN]` 出现
- [ ] 关键变量超出阈值时更新报告或发新版
- [ ] 根据读者报告新出版物更新"失败案例"

### 季度
- [ ] 新快照报告整合进同一个 release 周期
- [ ] 历史报告归档为 `archive/2025-Q3/` (仍检索但不置顶)

---

## 多平台同步策略

| 平台 | 优先级 | 格式 | 发布频率 |
|------|--------|------|---------|
| Substack(中文) | P0 | Markdown+图示 | 首发 |
| Substack(EN) | P0 | Markdown | +3天 |
| GitHub | P1 | 首版Markdown | 首发同步 |
| 知乎/微信公众号 | P1 | HTML格式 | +1天 |
| LinkedIn | P0(EN) | 文字简述+链接 | 即时 |
| Twitter/X | P1 | 关键数字卡片图 | 即时 |

---

## 风险控制

### 潜在问题
1. **数据来源方撤回或修改公开页面**: 已使用 Wayback Machine 归档
2. **数值单位错误(如百万vs十亿)**: 多级人工 + 脚本交叉验证
3. **政治敏感性误判**: 标注"推测"而非事实陈述
4. **版权图片侵权**: 仅用 CC0 或自制图表

### 应急响应
- 关键数据被质疑 → 24小时内回应 + 发布修订
- 整篇论点被证伪 → 发布"Postmortem: Why We Were Wrong"
- 持续采纳反馈的失误 → 更新 failure_registry.md

---

*本清单随首版发布检验后迭代 | v1.0*
