# 数据溯源与共享方法论 (Time Capsule Reports)

## 1. 数据分类层级

### Tier 1: 已验证 (Verified)
- **定义**: 直接来自官方来源、带时间戳、可通过URL复现
- **标注**: 【已验证】
- **必需字段**: 来源机构、发布日期、URL、数值、访问日期

### Tier 2: 推测 (Inferred)
- **定义**: 基于至少2个已验证数据点推算得出
- **标注**: 【推测】
- **必需字段**: 推算逻辑、输入数据点、置信区间

### Tier 3: 未验证 (Unverified)
- **定义**: 单一来源或无法通过公开渠道核实的声明
- **标注**: 【未验证】
- **必需字段**: 已尝试的搜索路径、最后尝试日期

---

## 2. 标准数据来源评级

| 评级 | 来源类型 | 示例 |
|------|---------|------|
| A+ | 一级官方源 | 美联储FRED、美国CBP、世界银行WDI |
| A | 行业权威机构 | Wood Mackenzie、IEA、半导体行业协会 |
| B+ | 上市公司财报 | NVIDIA 10-K/Q、TSMC IR |
| B | 主流研究机构 | 麦肯锡、德勤、PwC公开报告 |
| C | 新闻媒体（需交叉验证） | Reuters、Bloomberg、财新 |
| D | 二手引用（不直接使用） | 未注明来源的行业论坛帖 |

---

## 3. 复现路径模板

每条数据必须附带复现路径：

```yaml
data_point:
  claim: "大型电力变压器平均交期达128周"
  value: 128 (weeks)
  source:
    name: "Wood Mackenzie"
    title: "Q4 2024 / Q2 2025 Equipment Lead Time Survey"
    date: 2025-06
    url: "https://www.woodmac.com/reports/..." (或DOI)
  replication:
    - step: "访问 woodmac.com 搜索 'Transformer Lead Time 2025'"
    - step: "下载行业简报 PDF (需付费订阅，或引用二手引用)"
    - step: "交叉验证：摩根士丹利 2025-01 报告引用相同数据"
  caveat: "Wood Mackenzie 为付费数据库；公开引用见 baijiahao.baidu.com 2025-06-04"
  verification_status: tier_1
```

---

## 4. IEEE 时间与地理标注规范

- 所有日期使用 ISO 8601: `YYYY-MM-DD`
- 货币使用 USD，原始币种标注于方括号
- 地区使用 ISO 3166-1 alpha-3: USA, CHN, DEU, JPN, GBR
- 时区为 UTC，敏感政策日期标注本地时区

---

## 5. 报告结构标准

每篇时间胶囊报告必须包含：

1. **Snapshot 标题与时间戳** —— "本快照冻结于 YYYY-MM-DD 北京时间 XX:XX UTC+8"
2. **核心论点** (50词以内)
3. **证据矩阵** (表格形式，每条带溯源)
4. **关键变量监测清单** —— 未来3个月需检查什么来判断趋势是否成立
5. **失败案例研究** (至少1个)
6. **反方向论点** —— 我们可能错在哪里
7. **英文版附录或独立链接**

---

## 6. 附录：失败案例目录

跨报告共享的失败案例库，详见 `failure_registry.md`：

- **TC-001**: 2025年初NVIDIA H200实际部署量低于媒体预期（推理：散热/功耗）
- **TC-002**: 美国《基础设施法案》承诺的变压器产能未落地（2023→2025）
- **TC-003**: 中国跨境电商2023年集体"出走东南亚"但多数回流（关税筹划失效）
- **TC-004**: 欧盟AI Act 高风险条款在2025年8月才生效但企业合规提前完成（过度乐观的合规紧迫感）
- **TC-005**: IBM Watson MD Anderson 癌症项目 $6200万 合同终止——AI在医疗领域的历史性失灵

---

## 7. 发布清单 (Substack / GitHub)

### Substack 发布优化
- 首图: 使用信息可视化图 (需导出为 JPG/PNG)
- 标题: 含数字和"为什么"结构，如 "变压器交期达128周: AI数据中心如何用软件逃脱物理监狱"
- 标签: 最多5个，含 #AI #SupplyChain #Energy
- Newsletter 集成: 添加"本周评论区开放"的讨论问题

### GitHub 发布优化
- 仓库名: `timecapsule-reports`（全局）/ 单篇用 `YYYY-MM-topic`
- README 徽章: 添加 "Last Updated" 和 "Data Verified" 徽章
- Issues 模板: 为"数据过时警告"创建专用模板
- Releases: 每次快照以日期打标签 `v2025.08.08`

---

*本框架版本: v1.0 | 创建于 2025-08-08 | 维护者: CatPaw Research Desk*
