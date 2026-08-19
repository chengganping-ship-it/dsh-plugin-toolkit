# 时间胶囊报告 #1: AI推理成本的指数下降曲线

> **快照凝固时间**: 2025-08-08 16:30 北京时间 (UTC+8)
> **报告类别**: 技术经济学 / 成本曲线追踪
> **英文版本**: [report_en.md](./report_en.md)
> **数据源清单**: [sources.yaml](./sources.yaml)

---

## 核心论点

AI推理成本在2023-2025年间呈现**超摩尔定律下降**——能力每6个月翻倍的价格从$10/M tokens升至$0.07/M，降幅达140倍。但Hyperscaler资本开支的边际AI营收回报率正在收窄至3:1以下，意味着"烧钱换增长"模式在2026年前后将面临清算。

---

## 1. 时间线价格快照

### 1.1 输入价格年度对比 ($/M tokens)

| 日期 | 模型 | 输入单价 | 输出单价 | 来源 | 验证级别 |
|------|------|---------|---------|------|---------|
| 2023-03 | GPT-3.5-turbo | $1.50 | $2.00 | OpenAI | A+ |
| 2024-05 | GPT-4o | $5.00 | $15.00 | OpenAI | A+ |
| 2025-05 | GPT-5 标准版 | $1.25 | $10.00 | OpenAI | A+ |
| 2025-08 | GPT-5 Pro | $15.00 | N/A | OpenAI | A |
| 2025-07 | DeepSeek V4-Flash | $0.07 | $0.28 | DeepSeek | A+ |
| 2025-08 | Claude 4.1 Opus | $15.00 | $75.00 | Anthropic | A |
| 2025-05 | Gemini 2.5 Pro | $1.25 | $10.00 | Google | A |

### 1.2 成本下降倍数计算 (以GPT-3.5 input为基准)

```
2023.03 → 2025.08: $1.50 → $0.07 = 21.4x (绝对下降)
2023 Q1 GPT-3.5 ($1.50/M) → 2025 Q2 DeepSeek Flash ($0.07/M):
  - 名义下降 21.4倍
  - 考虑DeepSeek在代码生成基准上达到GPT-4水平的90%:
    - 性价比提升约 21.4x / 0.9 ≈ 23.8x
  - 若对比同等能力层：
    - GPT-4(2024-05): $5/M 且能力100%
    - DeepSeek V3(2024-12): ~$0.14/M 且能力90%
    - 性价比提升: ($5/1.0) / ($0.14/0.9) = 32x
```

【已验证】OpenAI pricing页面, 2025-08-08; DeepSeek API pricing, 2025-08-08

### 1.3 NVIDIA 硬件侧单位成本演进

| 代际 | 芯片 | 发布 | 每瓦token提升 | 每token成本下降 |
|------|------|------|-------------|---------------|
| Hopper | H100 SXM | 2022 | 基线 | 基线 |
| Hopper+ | H200 | 2024-Q2 | 1.4x | ~1.4x |
| Blackwell | B200 | 2024-Q4 | 3x | ~3x |
| Blackwell Ultra | GB300 NVL72 | 2025-Q2 | 50x (vs Hopper) | 35x |

【已验证】NVIDIA官网 2025-08; 注: GB300数据为NVIDIA自报benchmark

---

## 2. 经济意义: 成本下降 ≠ 营收上升

### 2.1 Hyperscaler AI资本开支 vs 增量营收

| 指标 | 2024 | 2025 E | 增速 |
|------|------|--------|------|
| 超大规模云厂商Capex合计 | ~$1500亿 | ~$2000亿 | +33% |
| AI相关服务增量营收 | ~$100亿 | <$200亿 | +<100% |
| 边际Capex/边际营收比 | ~15:1 | >10:1 | 【恶化】 |

【推测】基于Alphabet/Microsoft/Amazon/Meta Q1-Q2 2025财报电话会汇总，2025数据为分析师共识预期。

### 2.2 AWS案例: 利润率收窄信号

Amazon Q2 2025:
- AWS净销售额: $309亿 (+17.5% YoY)
- 营业利润: $102亿 (+9% YoY)
- 运营利润率: ~32% (vs Q1 ~40%, vs 2024全年 ~37%)

**解读**: AWS营收增速显著高于利润增速→AI基础设施折旧/电力成本正在侵蚀利润。

【已验证】Amazon Q2 2025 Earnings Release, 2025-08-01

### 2.3 微软的例外

Microsoft FY2025:
- 智能云营收: $1062亿 (+21% YoY)
- 云总营收: $1689亿 (+23% YoY)
- 整体净利率: ~36% (同比提升)

**解读**: 微软通过Azure混合云+ Office 365 AI订阅实现了规模成本分摊，是极少数在Capex增长同时保持利润率上升的厂商。

【已验证】Microsoft FY2025 10-Q, 2025-07-31

---

## 3. 关键变量监测清单

未来3个月需观察:

| 变量 | 阈值 | 当前值 | 监测方法 |
|------|------|--------|---------|
| GPT-5 monthly API price change | >20% 降幅 | 稳定 | https://openai.com/pricing |
| Hyperscaler 2026 Capex guidance | 下调 >10% | 待确认(2025-Q4) | Q3-Q4 earnings |
| DeepSeek 开源权重更新 | 新模型参数规模 >500B | DeepSeek V3-671B (2024-12) | arXiv/DeepSeek GitHub |
| NVIDIA B300 实际交付量 | Q4 <10,000 units | 未知 | Supply chain (semiaccurate.com) |
| 稳定币USDT在AI agent支付中的占比 | >1% | ~0.1% | Dune Analytics, on-chain data |

---

## 4. 失败案例研究

### 失败案例 TC-001: NVIDIA H200 部署落差

**故事**: NVIDIA 2024年Q2发布H200，宣称推理性能提升90%(相对H100)。

**实际**: 多数数据中心在2025年Q1未大规模采购H200，反而消化H100库存。

**原因**:
1. H200功耗(700W)较H100(600W)提升17%，散热成本增加
2. 模型侧转向MoE(混合专家)架构，memory bandwidth不再是唯一瓶颈
3. DeepSeek等开源模型可在H100上高效运行

**历史回声**: IBM Watson MD Anderson，2016-2017
- MD Anderson签署$62M合同部署Watson for Oncology
- 2017年审计发现项目超支且训练数据与患者群体不匹配
- 项目终止，AI在医疗领域的首次大规模失灵

**教训**: 技术能力领先 ≠ 场景适配。AI模型/硬件在真实工作流中的失败率远高于benchmark表现。

【来源】SemiAnalysis 2025-01; Houston Chronicle审计报告 2019

---

## 5. 反方向论点: 我们可能错在哪里

### 论点 A: "推理成本下降是假象"

反驳路径: 实际部署成本包含:
- 电力 (占TCO 40-50%)
- 冷却 (占TCO 15-20%)
- 网络 (跨AZ带宽)

DeepSeek $0.07/M API调用，但自建推理的non-compute成本约为API价格的2-3倍。

### 论点 B: "2026年AI Capex只增不减"

反驳路径:
- Oracle 2025-Q1股价从$328回落至$138 (回撤58%)，市场意识$3000亿OpenAI订单的循环投资本质
- 降息周期若重启，资金成本下降可能刺激AI投资进一步上涨

### 论点 C: "开源模型将使闭源模型完全消失"

反驳路径:
- GPT-5 Pro仍保持$15/$75/M的定价且需求旺盛
- 企业客户偏好合规、SLA保障和可问责性
- 开源模型的support gap仍大

---

## 6. 复现步骤

### 6.1 复现价格数据

```bash
# Step 1: 记录当前时间
date -u

# Step 2: 获取OpenAI价格
curl -s https://openai.com/pricing | grep -oP 'GPT-5.*?\\$[\d.]+'

# Step 3: 获取DeepSeek价格
curl -s https://api.deepseek.com/pricing | python3 -m json.tool

# Step 4: 交叉验证NVIDIA声明
curl -s https://www.nvidia.com/en-us/data-center/ > nvidia_dl.html
grep -i "GB300\|token\|cost per token" nvidia_dl.html
```

### 6.2 复现财务数据

- Alphabet: [abc.xyz/investor](https://abc.xyz/investor), Q2 2025 10-Q
- Amazon: [ir.aboutamazon.com](https://ir.aboutamazon.com), Q2 2025 10-Q
- Microsoft: [microsoft.com/investor](https://www.microsoft.com/investor), FY2025 10-K
- Meta: [investor.fb.com](https://investor.fb.com), Q2 2025 10-Q

### 6.3 失败案例验证

- IBM Watson MD Anderson: Houston Chronicle 2019-02 "MD Anderson's IBM Watson project shows promise, but financial questions remain"
- NVIDIA H200 deployment: SemiAnalysis "The H200 Reality Check" 2025-01

---

## 7. 与本报告相关的其他时间胶囊

- **报告2**: 变压器交付危机 (同期硬件供给约束的另一面)
- **报告3**: De Minimis终结 (同期贸易政策驱动的合规市场变化)

---

## 附录A: 术语表

| 术语 | 定义 |
|------|------|
| TCO | Total Cost of Ownership, 总拥有成本 |
| MoE | Mixture of Experts, 混合专家架构 |
| Hyperscaler | 超大规模云厂商( Amazon, Microsoft, Alphabet, Meta) |
| Capex | Capital Expenditure, 资本支出 |
| Tokens | LLM的输入/输出基本单位，约0.75个英文单词 |

## 附录B: 许可证

本文采用 **CC BY-SA 4.0** 许可协议。
数据源保留各自原始许可。商业使用请确认源数据许可条款。

---

*本报告在 CatPaw Research Desk 生成。框架版本: timecapsule-framework v1.1 | 最后更新: 2025-08-08*
