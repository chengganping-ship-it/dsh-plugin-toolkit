# 🎯 Lead Gen 自动化 - 详细教程

> 工作流文件：`3-lead-gen-automation.json`
> 功能：定时抓取潜在客户 → GPT 评分 → 高意向客户推送到 Sheets + Telegram 通知

---

## 工作流架构图

```
[Schedule - Every 6 Hours] → [HTTP - Fetch Leads from Apollo] → [GPT-4o Lead Scorer] → [Score >= 70?]
                                                                            ├─ Yes → [Save Hot Leads to Sheets] → [Telegram Alert]
                                                                            └─ No → [Archive Cold Leads]
```

---

## 适用场景

- **B2B 销售团队**：自动挖掘目标公司决策者
- **外包/自由职业者**：找到需要你服务的潜在客户
- **SaaS 创业公司**：建立 Outbound 销售流程
- **营销机构**：为客户提供 Lead Gen 服务

---

## 详细配置步骤

### 1. 配置 Apollo.io（数据源）

**注册**：前往 apollo.io 注册（免费版每月 50 个积分）

**获取 API Key**：
1. 登录 Apollo → Settings → API
2. 生成 API Key → 复制
3. 替换节点中的 `YOUR_APOLLO_API_KEY`

**搜索结果示例**：
默认搜索的是使用 Shopify/Stripe/Notion 的公司的创始人/增长负责人。你可以修改为：

```json
{
  "q_organization_domains": "your-target-domain.com",
  "person_titles": ["head of", "director of", "VP", "Chief"],
  "organization_num_employees_range": ["51,200", "201,1000"],
  "q_organization_locations": ["United States", "United Kingdom"]
}
```

### 2. 自定义评分逻辑

默认评分标准（1-100）：
- 职位相关性 30分
- 公司规模 20分
- 技术栈匹配 20分
- 意向信号 30分

**示例：Web 代理机构版**
```
你是 B2B 销售线索评分专家。评分标准：

1. 职位权力（40分）：
   - CEO/Founder: 40
   - VP/Director: 30
   - Manager: 20
   - Other: 5

2. 公司规模（25分）：
   - 1-50人: 25（决策快，预算灵活）
   - 51-200人: 20
   - 201-1000人: 15
   - 1000+人: 10

3. 行业匹配（20分）：
   - 电商/SaaS/科技: 20
   - 金融/教育: 15
   - 制造业: 10
   - 其他: 5

4. 意向信号（15分）：
   - 近期招聘开发/设计岗: 15
   - 近期融资: 10
   - 无明确信号: 5

JSON 输出格式：[{"name":"...","title":"...","company":"...","score":N,"reason":"...","suggested_action":"email/LinkedIn/call"}]
```

### 3. 配置 Google Sheets（CRM）

创建 Google Sheet，包含两个 Tab：

**Tab 1: Hot Leads**
| Date | Name | Title | Company | Score | Action | Email | LinkedIn |
|------|------|-------|---------|-------|--------|-------|----------|

**Tab 2: Cold Leads Archive**
| Date | Name | Score | Status |

**获取 Spreadsheet ID**：
URL 格式：`https://docs.google.com/spreadsheets/d/`**`SPREADSHEET_ID_HERE`**`/edit`

### 4. 修改执行频率

双击 **Schedule - Every 6 Hours** 节点：
- 每 2 小时：`Hours Interval` = 2
- 每天一次（工作日 9:00）：选择 `Days` + `Trigger at` = `09:00`
- 每周一：选择 `Weekly` + `Monday`

---

## 替代数据源（如果不用 Apollo）

### LinkedIn + Phantom Buster
1. 使用 Phantom Buster 抓取 LinkedIn 搜索结果
2. 将数据发送到 n8n Webhook
3. 其余流程相同

### 手动 CSV 导入
1. 在 n8n 中添加 **Read Binary Files** 或 **Spreadsheet File** 节点
2. 上传 CSV 文件
3. 后续流程不变

### 免费替代数据源
- **Clearbit**（免费额度）
- **Hunter.io**（域名搜索）
- **Snov.io**（免费 50 积分/月）

---

## 高级玩法

### 自动发送 Cold Email

在 "Save Hot Leads" 后添加：
1. **Gmail/Email 节点**：发送个性化开发信
2. **Delay 节点**：3 天后
3. **Follow-up 节点**：如果没有回复，自动发送跟进邮件

### LinkedIn 自动连接

配合 Phantom Buster：
1. 获取高意向客户 LinkedIn URL
2. 发送连接请求（附带个性化消息）
3. 对方通过后自动发送开发信

### 竞品客户挖掘

修改 Apollo 搜索条件为目标竞品的客户：
```json
{
  "q_organization_domains": "competitor1.com,competitor2.com",
  "person_titles": ["head of", "director", "VP"]
}
```

---

## 成本估算

| 服务 | 免费额度 | 超出费用 |
|------|---------|---------|
| Apollo.io | 50 积分/月 | $49/月起 |
| n8n | 5,000 执行/月 | $20/月起 |
| GPT-4o-mini | 每次评分约 $0.01 | - |
| **每月 500 条线索** | **约 $5-10** | - |

---

## 故障排除

| 问题 | 解决方案 |
|------|---------|
| Apollo API 返回空结果 | 检查搜索条件是否太窄，扩大职位/行业范围 |
| HTTP 节点 401 错误 | API Key 可能过期，重新生成 |
| GPT 评分不稳定 | 降低 temperature 到 0.2，加入更多评分示例 |
| Sheets 写入报错 | 确认 Tab 名称存在且有权限 |
