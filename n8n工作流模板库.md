# n8n工作流模板库（可直接导入）

> 这些JSON文件可以直接在n8n中导入使用
> 导入方式：n8n工作台 → 导入工作流 → 粘贴JSON

---

## 工作流1：每日新闻聚合→Telegram推送

```json
{
  "name": "📰 每日跨境合规新闻",
  "nodes": [
    {
      "parameters": {},
      "id": "schedule-trigger",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [0, 0],
      "parameters": {
        "rule": [
          {
            "field": "cronExpression",
            "expression": "0 7 * * 1-5"
          }
        ]
      }
    },
    {
      "parameters": {
        "url": "https://www.cpsc.gov/Newsroom/RSS",
        "options": {}
      },
      "id": "cpsc-rss",
      "name": "CPSC法规RSS",
      "type": "n8n-nodes-base.rssFeedRead",
      "typeVersion": 1,
      "position": [220, 0]
    },
    {
      "parameters": {
        "url": "https://www.federalregister.gov/articles.rss?conditions%5Bterm%5D=consumer+product+safety",
        "options": {}
      },
      "id": "federal-register",
      "name": "联邦法规RSS",
      "type": "n8n-nodes-base.rssFeedRead",
      "typeVersion": 1,
      "position": [220, 200]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "id": "filter-relevant",
              "rightValue": "服装|纺织|textile|apparel|children|儿童|CPSC",
              "operator": {
                "type": "string",
                "operation": "contains"
              }
            }
          ],
          "combinator": "or"
        }
      },
      "id": "filter",
      "name": "筛选相关文章",
      "type": "n8n-nodes-base.filter",
      "typeVersion": 2,
      "position": [440, 100]
    },
    {
      "parameters": {
        "model": "claude-sonnet-4-20250514",
        "messages": [
          {
            "role": "system",
            "content": "你是跨境合规新闻分析师。基于今日新闻，输出3条最有价值的信息给中国服装卖家。每条格式：【标题】一句话解读+建议行动。按重要性排序，用中文输出。"
          },
          {
            "role": "user",
            "content": "今日新闻：{{$json.title}} - {{$json.content}}"
          }
        ]
      },
      "id": "claude-analyze",
      "name": "Claude分析",
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "typeVersion": 1,
      "position": [660, 100],
      "credentials": {
        "anthropicApi": {
          "id": "your-credential-id",
          "name": "Claude API"
        }
      }
    },
    {
      "parameters": {
        "chatId": "YOUR_TELEGRAM_CHAT_ID",
        "text": "📰 早安！今日跨境合规动态：\n\n{{$json.choices[0].message.content}}\n\n---\n需要我写篇文章详细解读哪一条？回复编号即可。"
      },
      "id": "telegram-send",
      "name": "Telegram推送",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [880, 100],
      "credentials": {
        "telegramApi": {
          "id": "your-credential-id",
          "name": "Telegram Bot"
        }
      }
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          { "node": "CPSC法规RSS", "type": "main", "index": 0 },
          { "node": "联邦法规RSS", "type": "main", "index": 0 }
        ]
      ]
    },
    "CPSC法规RSS": {
      "main": [[{ "node": "筛选相关文章", "type": "main", "index": 0 }]]
    },
    "联邦法规RSS": {
      "main": [[{ "node": "筛选相关文章", "type": "main", "index": 0 }]]
    },
    "筛选相关文章": {
      "main": [[{ "node": "Claude分析", "type": "main", "index": 0 }]]
    },
    "Claude分析": {
      "main": [[{ "node": "Telegram推送", "type": "main", "index": 0 }]]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}
```

---

## 工作流2：新客Webhook→Notion+邮件自动化序列

> 这是一个简化版的JSON，实际使用时需要替换YOUR_*占位符

```json
{
  "name": "🎯 新客自动培育序列",
  "nodes": [
    {
      "parameters": {
        "path": "new-lead",
        "httpMethod": "POST",
        "responseMode": "lastNode",
        "options": {}
      },
      "id": "webhook",
      "name": "新客注册Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "databaseId": "YOUR_NOTION_DATABASE_ID",
        "properties": {
          "title": {
            "title": [
              {
                "text": {
                  "content": "={{{$json.body.name}}}"
                }
              }
            ]
          },
          "email": {
            "email": "={{{$json.body.email}}}"
          },
          "source": {
            "rich_text": [
              {
                "text": {
                  "content": "={{{$json.body.utm_source || 'unknown'}}}"
                }
              }
            ]
          },
          "status": {
            "select": {
              "name": "新客-待培育"
            }
          }
        }
      },
      "id": "notion-create",
      "name": "Notion记录客户",
      "type": "n8n-nodes-base.notion",
      "typeVersion": 2.3,
      "position": [220, 0],
      "credentials": {
        "notionApi": {
          "id": "your-credential-id",
          "name": "Notion"
        }
      }
    },
    {
      "parameters": {
        "subject": "【免费】跨境服装合规自查清单 + AI工具1次",
        "toEmail": "={{{$json.body.email}}}",
        "fromEmail": "YOUR_FROM_EMAIL",
        "fromName": "小保 | AI跨境合规",
        "html": "<h3>Hi{{{{$json.body.name}}}}，欢迎来到跨境合规大家庭！</h3><p>我是小保，给你准备了3份礼物：</p><ol><li>📋 <strong>美/欧/日/澳合规自查清单</strong> - <a href='YOUR_PDF_LINK'>下载</a></li><li>🤖 <strong>AI合规检查工具 免费1次</strong> - <a href='YOUR_TOOL_LINK'>试用</a></li><li>💬 <strong>加入卖家交流群</strong> - 扫码加入</li></ol><p>有任何问题，回复这封邮件就行。</p><p>小保</p>"
      },
      "id": "email-welcome",
      "name": "发送欢迎邮件",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [440, 0],
      "credentials": {
        "smtp": {
          "id": "your-credential-id",
          "name": "SMTP"
        }
      }
    },
    {
      "parameters": {
        "amount": 2,
        "unit": "days"
      },
      "id": "wait-day3",
      "name": "等待2天",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [660, 0]
    },
    {
      "parameters": {
        "subject": "被罚款$12,500的案例复盘（成分标注篇）",
        "toEmail": "={{{$json.body.email}}}",
        "html": "<p>Hi{{{{$json.body.name}}}}，</p><p>2天前给你发了自查清单，看了吗？</p><p>这周有卖家因为<strong>成分标注误差超3%</strong>被CPSC罚款$12,500。整理了份《成分标注避坑指南》。</p><p>需要回复'成分'获取。</p><p>小保</p>"
      },
      "id": "email-followup1",
      "name": "Day3跟进邮件",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [880, 0],
      "credentials": {
        "smtp": { "id": "your-credential-id", "name": "SMTP" }
      }
    },
    {
      "parameters": {
        "amount": 5,
        "unit": "days"
      },
      "id": "wait-day8",
      "name": "再等5天",
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [1100, 0]
    },
    {
      "parameters": {
        "subject": "⏰ 3天后截止 | AI合规工具早鸟优惠",
        "toEmail": "={{{$json.body.email}}}",
        "html": "<p>Hi{{{{$json.body.name}}}}，</p><p>一周了，给你发了2封邮件，不知收到没？</p><p>如果你对我们的AI合规工具感兴趣，这周有个<strong>早鸟优惠（3天限时）</strong>：</p><ul><li>Starter $19/月（原价$29）</li><li>Pro $59/月（原价$79）</li></ul><p>回复'优惠'获取折扣码。</p><p>小保</p>"
      },
      "id": "email-followup2",
      "name": "Day8转化邮件",
      "type": "n8n-nodes-base.emailSend",
      "typeVersion": 2,
      "position": [1320, 0],
      "credentials": {
        "smtp": { "id": "your-credential-id", "name": "SMTP" }
      }
    }
  ],
  "connections": {
    "新客注册Webhook": {
      "main": [[
        { "node": "Notion记录客户", "type": "main", "index": 0 },
        { "node": "发送欢迎邮件", "type": "main", "index": 0 }
      ]]
    },
    "发送欢迎邮件": {
      "main": [[{ "node": "等待2天", "type": "main", "index": 0 }]]
    },
    "等待2天": {
      "main": [[{ "node": "Day3跟进邮件", "type": "main", "index": 0 }]]
    },
    "Day3跟进邮件": {
      "main": [[{ "node": "再等5天", "type": "main", "index": 0 }]]
    },
    "再等5天": {
      "main": [[{ "node": "Day8转化邮件", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## 工作流3：AI客服自动分类+回复

```json
{
  "name": "🤖 AI客服Agent",
  "nodes": [
    {
      "parameters": {
        "path": "customer-message",
        "httpMethod": "POST",
        "responseMode": "lastNode"
      },
      "id": "webhook",
      "name": "客服消息Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1.1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "model": "claude-sonnet-4-20250514",
        "messages": [
          {
            "role": "system",
            "content": "你是跨境服装电商的智能客服'小保'。请完成：\n1. 意图分类：size/material/shipping/return/complaint/other\n2. 生成回复草稿\n\n输出JSON格式（仅JSON，不要其他内容）：\n{\"intent\":\"分类\",\"confidence\":\"high/medium/low\",\"draft\":\"回复草稿\",\"need_human\":true/false}\n\n回复规则：\n- 尺码问题：给出具体尺码对照+体型建议\n- 材质问题：解释成分+特性+护理\n- 物流问题：引导查询物流单号\n- 退换货：说明政策+协助升级\n- 投诉/纠纷：立即升级人工（need_human=true）\n\ndraft保持专业简洁，不超过150字。"
          },
          {
            "role": "user",
            "content": "客户消息：{{{json.body.message}}}\n历史对话：{{{json.body.history}}}"
          }
        ]
      },
      "id": "claude-classify",
      "name": "Claude分类+生成",
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "typeVersion": 1,
      "position": [220, 0],
      "credentials": {
        "anthropicApi": { "id": "your-credential-id", "name": "Claude API" }
      }
    },
    {
      "parameters": {
        "conditions": {
          "conditions": [
            {
              "leftValue": "={{json.need_human}}",
              "rightValue": true,
              "operator": { "type": "boolean", "operation": "equals" }
            }
          ]
        }
      },
      "id": "check-human",
      "name": "需要人工？",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [440, 0]
    },
    {
      "parameters": {
        "channel": "#客服升级",
        "text": "⚠️ 需要人工处理\n\n客户：{{{json.body.customer_name}}}\n问题：{{{json.body.message}}}\n分类：{{{json.intent}}}\n原因：需要人工判断"
      },
      "id": "telegram-alert",
      "name": "Telegram通知你",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [660, -100],
      "credentials": {
        "telegramApi": { "id": "your-credential-id", "name": "Telegram" }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{json.draft}}"
      },
      "id": "response-auto",
      "name": "自动回复",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [660, 100]
    }
  ],
  "connections": {
    "客服消息Webhook": {
      "main": [[{ "node": "Claude分类+生成", "type": "main", "index": 0 }]]
    },
    "Claude分类+生成": {
      "main": [[{ "node": "需要人工？", "type": "main", "index": 0 }]]
    },
    "需要人工？": {
      "main": [
        [{ "node": "Telegram通知你", "type": "main", "index": 0 }],
        [{ "node": "自动回复", "type": "main", "index": 0 }]
      ]
    }
  }
}
```

---

## 工作流4：竞品价格监控（简化版）

```json
{
  "name": "🔍 竞品价格监控",
  "nodes": [
    {
      "parameters": {
        "rule": [{ "field": "cronExpression", "expression": "0 */2 * * *" }]
      },
      "id": "schedule",
      "name": "每2小时执行",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.1,
      "position": [0, 0]
    },
    {
      "parameters": {
        "method": "GET",
        "url": "https://api.keepa.com/productkey=YOURKEY&domain=1&asin=B0XXXXXXX"
      },
      "id": "fetch-price",
      "name": "获取竞品价格",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [220, 0]
    },
    {
      "parameters": {
        "model": "claude-sonnet-4-20250514",
        "messages": [
          {
            "role": "system",
            "content": "你是竞品价格分析师。分析竞品价格变动，输出：1.一句话总结 2.对我们有利/不利的信号 3.建议行动。格式：summary/opportunities/risks/suggestions"
          },
          {
            "role": "user",
            "content": "竞品数据：{{json}}"
          }
        ]
      },
      "id": "claude-analyze",
      "name": "Claude分析趋势",
      "type": "@n8n/n8n-nodes-langchain.lmChatAnthropic",
      "typeVersion": 1,
      "position": [440, 0],
      "credentials": {
        "anthropicApi": { "id": "your-credential-id", "name": "Claude API" }
      }
    },
    {
      "parameters": {
        "channel": "#竞品警报",
        "text": "📊 竞品动态：\n\n{{json.choices[0].message.content}}"
      },
      "id": "telegram-alert",
      "name": "Telegram推送",
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1,
      "position": [660, 0],
      "credentials": {
        "telegramApi": { "id": "your-credential-id", "name": "Telegram" }
      }
    }
  ],
  "connections": {
    "每2小时执行": { "main": [[{ "node": "获取竞品价格", "type": "main", "index": 0 }]] },
    "获取竞品价格": { "main": [[{ "node": "Claude分析趋势", "type": "main", "index": 0 }]] },
    "Claude分析趋势": { "main": [[{ "node": "Telegram推送", "type": "main", "index": 0 }]] }
  }
}
```

---

## 如何使用这些工作流

1. 打开 n8n（本地或云端）
2. 点击右上角 "Import workflow"
3. 粘贴上面的JSON代码
4. 替换所有 `YOUR_*` 占位符为你的实际值
5. 添加Credential（API Key）
6. 保存并激活工作流
