# GitHub Actions 云端调度指南

## 为什么需要GitHub Actions？

| 特性 | 本地运行 | GitHub Actions |
|------|---------|----------------|
| 费用 | 电费+网费 | 免费 2000分钟/月 |
| 在线率 | 取决于电脑 | 99.9% |
| 稳定性 | 可能关机 | 永不关机 |
| 维护 | 需要打理 | 全自动 |

## 启用步骤

### 1. 创建GitHub仓库

```bash
git init
git add .
git commit -m "初始提交"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cthulhu-audiobook.git
git push -u origin main
```

### 2. 配置Secrets (可选)

在仓库 Settings → Secrets and variables → Actions 中添加：

- `TELEGRAM_TOKEN` — Telegram Bot Token (通知用)
- `TELEGRAM_CHAT_ID` — Telegram Chat ID
- `BARK_KEY` — Bark通知Key (iOS)
- `SERVERCHAN_SENDKEY` — Server酱SendKey (微信)

### 3. 启用GitHub Actions

1. 进入仓库的 Actions 标签
2. 点击 "I understand my workflows, go ahead and enable them"
3. 选择 "克苏鲁每日自动闭环"
4. 点击 "Enable workflow"

### 4. 手动测试

1. Actions → 选择 "克苏鲁每日自动闭环"
2. 点击 "Run workflow"
3. 查看运行日志

## 每日自动流程

```
02:00 北京时间 → GitHub Actions启动
  ↓
健康检查 → 系统健康度
  ↓
内容获取 → 从hplovecraft.com获取原文
  ↓
自动复盘 → 数据分析+策略更新
  ↓
增长建议 → SEO+社交文案
  ↓
提交变更 → 数据文件更新
  ↓
上传产物 → 报告存档
```

## 配置API Key (增强AI功能)

在 `config.json` 中填入以下免费API Key可解锁AI功能：

| API | 免费额度 | 申请地址 |
|-----|---------|---------|
| Groq | 14,400次/天 | https://console.groq.com/ |
| Cerebras | 100万token/天 | https://cloud.cerebras.ai/ |
| OpenRouter | 50-1000次/天 | https://openrouter.ai/ |
| Google AI | 14,400次/天 | https://aistudio.google.com/ |
| Cloudflare | 10000神经元/天 | https://dash.cloudflare.com/ |

## 免费额度计算

GitHub Actions 免费套餐：
- 2000分钟/月 (ubuntu runner)
- 每次运行约10-20分钟
- 每天运行2次 = 约60分钟/天 = 1800分钟/月

足够支撑每日自动运行！

## 故障排除

1. **Actions不运行** → 检查是否启用了Workflow
2. **超时** → 在workflow中增加 timeout-minutes
3. **pip失败** → 检查requirements.txt格式
4. **推送失败** → 检查GITHUB_TOKEN权限
