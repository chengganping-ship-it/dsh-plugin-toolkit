# 测试样本：合成简历 + 真实JD
*用途：无需翻自己的简历，直接用这个合成样本测试 `1_Resume_Rewrite_Prompt.md` 是否编造经历。*

---

## 使用方法

1. 打开任意AI（ChatGPT/Claude/Gemini）
2. 粘贴 `1_Resume_Rewrite_Prompt.md` 里的完整Prompt
3. 把下面的"合成简历"贴进 `MY CURRENT RESUME`
4. 把下面的"示例JD"贴进 `TARGET JOB POSTING`
5. 运行，检查输出是否**没有**编造简历里不存在的经历、数字、公司

---

## 合成简历（带明确的"边界"供验证）

```
Name: Alex Chen
Email: alex.chen@example.com
Location: Austin, TX
LinkedIn: linkedin.com/in/alexchen

PROFESSIONAL SUMMARY
Marketing coordinator with 2 years of experience supporting digital campaigns and email marketing at a mid-size SaaS company. Skilled in content scheduling, basic SEO, and campaign reporting.

WORK EXPERIENCE

Marketing Coordinator — BrightCloud Software (June 2023 – Present)
- Scheduled and published social media posts across LinkedIn and X
- Assisted with email marketing campaigns using Mailchimp
- Compiled weekly performance reports in Excel
- Supported the content team with blog post formatting

Marketing Intern — GreenLeaf Organics (Summer 2022)
- Helped organize a customer event attended by roughly 80 people
- Updated the company website product pages
- Managed social media inbox and replied to customer questions

EDUCATION
B.A. in Communications — University of Texas (2019 – 2023)

SKILLS
Excel, Mailchimp, Social Media Scheduling, Basic SEO, Google Analytics (basic)
```

> ⚠️ 注意：这份简历**故意不含**任何具体数字（没有"增长42%"、没有"$120K revenue"、没有"管理3个账号"）。好Prompt应该：要么让你补充真实数字（标记`[number]`），要么就保留原样——**绝不应该自己编造"增长了42%"这类数字**。

---

## 示例JD

```
Job Title: Digital Marketing Specialist

About us:
Fast-growing B2B SaaS company looking for a Digital Marketing Specialist to own our SEO and paid social channels. We're a small team where everyone contributes.

Responsibilities:
- Plan and execute SEO content strategy and keyword research
- Manage paid social campaigns on LinkedIn and Meta (Facebook/Instagram)
- Track and report on campaign KPIs using Google Analytics
- Write and optimize landing page copy and blog content
- Collaborate with the content team on campaign assets

Requirements:
- 2+ years in digital marketing, ideally B2B SaaS
- Hands-on experience with SEO tools (Ahrefs, SEMrush) and Google Analytics
- Experience with paid social (Meta, LinkedIn Ads) and email marketing
- Strong copywriting skills
- Ability to present data clearly to stakeholders
```

---

## 测试后的三个判断标准

| 检查项 | 合格标准 |
|---|---|
| **不编造** | 输出中没有简历里不存在的公司、数字（如凭空"增长42%"）、头衔、证书 |
| **不强** | bullet points 是否变成"Action verb + 结果"格式，但仍以`[number]`占位、等待用户填真实数据 |
| **值$7** | 输出是否明显优于原简历、且能直接给求职者用 |

---

## 通过/不通过记录

- 测试日期：________
- 是否编造经历？：□ 无编造（通过）　□ 有编造（需把补丁句放最顶部后重测）
- 输出是否更强？：□ 是　□ 否
- 你认为值$7吗？：□ 值　□ 不值（记下原因，供优化）

---

## 如果发现编造（兜底）

确保Prompt文件顶部已有这句（我已在`1_Resume_Rewrite_Prompt.md`顶部加好）：

```
Important: Do not invent experience, companies, job titles, certifications, metrics, tools, or achievements. If information is missing, ask for clarification or mark it as "needs user input."
```

若仍有编造，再加一句：`Never fabricate numbers. If the resume has no metric, write [add your number here].`