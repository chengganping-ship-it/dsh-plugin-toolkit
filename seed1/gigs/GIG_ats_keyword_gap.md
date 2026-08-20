# Gig 上架包 — "I will run an ATS keyword gap analysis on your resume against any job description"

> Seed-1 交付物 v1 · 人类只需复制粘贴 + 最后通读一遍 · 目标：20分钟完成上架

## 1. Gig 标题（≤80字符，选一）

**主选：** `I will run an ATS keyword gap analysis of your resume against your job description`

备选（同义换写，避免与现有 gig 完全重名）：
- `I will compare your resume to a job description and fix the missing ATS keywords`
- `I will audit your resume against a job posting and close the keyword gap`

## 2. 定价（三档）

| 档位 | 价格 | 交付 | 交付时间 |
|------|------|------|----------|
| Basic | $15 | 关键词差距报告：你的简历 vs 目标JD，缺失/冗余关键词清单 + 优先级排序 | 2天 |
| Standard | $30 | 差距报告 + 逐条 bullet 改写（把缺失关键词织进你现有经历，不造假） | 3天 |
| Premium | $55 | Standard 全部 + 全简历 ATS 格式审查（字体/分栏/解析陷阱）+ 一轮修订 | 4天 |

**定价逻辑（内部，勿对外）：** 零评论新账号，第一目标是"拿到带订单号的成交"而非利润。$15 低于同类竞品($25-60)，但高于"垃圾单"心理线，过滤掉最恶劣的买家。前5单后提价。

## 3. Gig 描述（直接粘贴）

```
Your resume is being rejected by software before a human ever sees it.

Around 75% of resumes are filtered out by Applicant Tracking Systems (ATS) —
often for one boring reason: the keywords in the job description are simply
not in your resume.

Here is what I do:

1. You send me your resume (PDF or DOCX) and the exact job description you
   are targeting.
2. I run a systematic keyword gap analysis: hard skills, soft skills, tools,
   certifications, and action verbs — what the JD demands vs. what your
   resume actually says.
3. You get a prioritized report showing exactly which keywords are missing,
   which are buried where ATS can't parse them, and which phrasing to change.

Important — what I do NOT do:
- I do not invent experience or write fiction into your resume
- I do not spam 200 keywords; ATS and recruiters both hate that
- Every keyword I add is tied to something you actually did

What you receive:
- Basic: Keyword Gap Report (missing / weak / misaligned terms, ranked)
- Standard: Gap Report + rewritten bullet points weaving keywords into your
  real experience
- Premium: All of the above + full ATS formatting audit + one revision round

Send me your resume and target job description — I'll tell you exactly
where you're losing to the machine.
```

## 4. FAQ（上架时填入）

**Q: How is this different from just using ChatGPT myself?**
A: You can — but a generic prompt gives generic output. I work from a structured methodology: parse the JD, extract and weight its keyword classes, map each against your actual experience, and rank gaps by impact. It's the difference between "rewrite my resume" and a gap report you can act on line by line.

**Q: Do you guarantee I'll get the job?**
A: No, and anyone who does is lying. I get you past the keyword filter and make your real experience legible to both the machine and the recruiter. The interview is still yours to win.

**Q: What file formats do you work with?**
A: PDF or DOCX for your resume; any format for the job description (link is fine too).

**Q: Is my information confidential?**
A: Yes. Your documents are used only to deliver your order and are not shared or reused.

## 5. 搜索标签（5个）

`ats resume` · `resume keywords` · `resume review` · `ats optimization` · `job description`

## 6. 类目路径

Writing & Translation → Proofreading & Editing → **Resume / Cover Letter**（若平台结构不同，选最接近 Resume 的叶子类目）

## 7. Portfolio 样品（上架前生成）

在 `AI_Job_Search_Kit/5_ATS_Keyword_Checklist.md` 基础上生成一份**脱敏样例报告**：
- 用一份虚构简历（产品经理岗）+ 一段真实公开JD
- 展示差距报告的真实结构：缺失关键词表 / 优先级 / 改写前后对比
- 导出为 PDF，作为 gig 图片/样品上传

## 8. 上架后第一周纪律（内部）

- 每天登录回复询价，响应时间 <2h（响应速度是新账号唯一能自己控制的排名变量）
- 前5单不挑活，全接
- 每单成交后：订单号 + 金额写入 `ledger.db`（带 evidence），这是唯一的收入认定方式
