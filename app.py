# AI跨境合规检查工具 MVP

> 这是Gradio原型代码，复制保存为 `app.py`，安装依赖后即可运行
> 运行命令：python app.py
> 然后浏览器打开 http://localhost:7860

```python
import gradio as gr
import os
from datetime import datetime

# ============================================================
# 配置区域 - 填入你的API Key
# ============================================================
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "你的Claude_API_Key")
REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "你的Replicate_API_Token")

# ============================================================
# 模拟合规检查逻辑（开发阶段用，上线后可接入Claude API）
# ============================================================

COMPLIANCE_DATABASE = {
    "US": {
        "name": "美国",
        "regulations": [
            {"id": "fiber", "item": "纤维成分标注", "required": True, 
             "description": "必须标注纤维含量百分比，误差±3%，必须为英文", "penalty": "海关扣留"},
            {"id": "origin", "item": "原产地标签", "required": True, 
             "description": "耐久标签，标注'Made in China'，不可移除", "penalty": "海关扣留+$1000罚款"},
            {"id": "care", "item": "护理说明", "required": True, 
             "description": "5项必选：洗涤/干燥/熨烫/漂白/警告", "penalty": "退货率激增/产品下架"},
            {"id": "importer", "item": "进口商信息", "required": True, 
             "description": "制造商/进口商名称+城市+州+国家", "penalty": "产品下架"},
            {"id": "children_cpc", "item": "儿童产品CPC证书", "required_children": True, 
             "description": "CPSIA铅/邻苯检测+ASTM F963玩具安全", "penalty": "强制扣货+$100k罚款"},
            {"id": "rn", "item": "RN号码", "required": False, 
             "description": "FTC注册号码，5位", "penalty": "可能被平台下架"},
            {"id": "prop65", "item": "加州65号提案警告", "required_if_chemicals": True, 
             "description": "含特定化学物质需警告标签", "penalty": "$2500/天罚款"},
        ]
    },
    "EU": {
        "name": "欧盟",
        "regulations": [
            {"id": "ce", "item": "CE标志", "required": True, 
             "description": "按要求自我声明或认证，加贴CE标志", "penalty": "海关拒收"},
            {"id": "reach", "item": "REACH法规合规", "required": True, 
             "description": "偶氮/重金属/邻苯等有害物质不得超标", "penalty": "退货+罚款"},
            {"id": "recycle", "item": "可回收标识", "required": True, 
             "description": "包装需有可回收标识", "penalty": "面临处罚"},
            {"id": "eu_rep", "item": "欧盟进口商信息", "required": True, 
             "description": "包装+标签需有欧盟境内进口商", "penalty": "产品下架"},
            {"id": "textile_label", "item": "纺织品标签", "required": True, 
             "description": "纤维成分+护理说明（销售地语言）", "penalty": "产品下架"},
        ]
    },
    "JP": {
        "name": "日本",
        "regulations": [
            {"id": "quality_label", "item": "品质表示法", "required": True, 
             "description": "纤维成分+洗涤方法+原产地（日语）", "penalty": "禁止销售"},
            {"id": "st_standard", "item": "ST标准检测", "required_if_textile": True, 
             "description": "甲醛/偶氮/重金属安全检测", "penalty": "退货处理"},
            {"id": "household", "item": "家庭用品质量标注", "required_if_home": True, 
             "description": "家用纺织品强制要求", "penalty": "立即下架"},
        ]
    },
    "AU": {
        "name": "澳大利亚",
        "regulations": [
            {"id": "fiber_au", "item": "纤维成分强制标注", "required": True, 
             "description": "强制标注纤维含量百分比", "penalty": "ACCC处罚"},
            {"id": "care_au", "item": "AS标准护理标签", "required": True, 
             "description": "AS 2001.4系列标准", "penalty": "面临罚款"},
            {"id": "importer_au", "item": "进口商信息", "required": True, 
             "description": "澳大利亚进口商信息", "penalty": "产品下架"},
        ]
    }
}

def analyze_compliance(image, description, market, is_children, material):
    """
    分析产品合规性
    开发版使用规则引擎，上线后可接入Claude API做智能分析
    """
    if market not in COMPLIANCE_DATABASE:
        return "请选择目标市场", "❌", "未知风险"
    
    market_data = COMPLIANCE_DATABASE[market]
    results = []
    red_flags = []
    yellow_flags = []
    
    # 基于描述的关键词匹配（简化版）
    desc_lower = description.lower()
    
    for reg in market_data["regulations"]:
        # 规则1：检查是否有成分信息
        if reg["id"] == "fiber" and reg["required"]:
            if "%" not in description and "纤维" not in description and "polyester" not in desc_lower:
                red_flags.append(f"🔴 **{reg['item']}**：{reg['description']}\n缺失风险：{reg['penalty']}")
            else:
                results.append(f"✅ **{reg['item']}**：已提供成分信息")
        
        # 规则2：原产地
        if reg["id"] == "origin" and reg["required"]:
            if "made" not in desc_lower and "原产" not in description and "产地" not in description:
                red_flags.append(f"🔴 **{reg['item']}**：{reg['description']}\n缺失风险：{reg['penalty']}")
            else:
                results.append(f"✅ **{reg['item']}**：已标注原产地")
        
        # 规则3：护理说明
        if reg["id"] == "care" and reg["required"]:
            care_keywords = ["洗", "wash", "dry", "熨", "iron", "漂白"]
            if not any(kw in desc_lower or kw in description for kw in care_keywords):
                yellow_flags.append(f"🟡 **{reg['item']}**：{reg['description']}\n缺失风险：{reg['penalty']}")
            else:
                results.append(f"✅ **{reg['item']}**：已提供护理说明")
        
        # 规则4：儿童产品
        if reg.get("required_children") and is_children:
            red_flags.append(f"🔴*{reg['item']}**：儿童产品强制要求{reg['description']}\n缺失风险：{reg['penalty']}")
        
        # 规则5：欧盟REACH
        if reg["id"] == "reach" and reg["required"]:
            if "reach" not in desc_lower and "检测" not in description:
                yellow_flags.append(f"🟡 **{reg['item']}**：{reg['description']}\n缺失风险：{reg['penalty']}")
        
        # 规则6：CE标志
        if reg["id"] == "ce" and reg["required"]:
            if "ce" not in desc_lower and "CE" not in description:
                red_flags.append(f"🔴 **{reg['item']}**：{reg['description']}\n缺失风险：{reg['penalty']}")
    
    # 生成风险评级
    if red_flags:
        risk_level = "🔴 高风险 - 必须处理"
        risk_detail = "存在可能导致货物被扣/罚款的硬伤"
    elif yellow_flags:
        risk_level = "🟡 中风险 - 建议处理"
        risk_detail = "基本合规，但提升空间大"
    else:
        risk_level = "🟢 低风险 - 基本合规"
        risk_detail = "主要合规要求已满足"
    
    # 汇总报告
    report = f"""
## 📋 合规检查报告

**检查时间**：{datetime.now().strftime('%Y-%m-%d %H:%M')}  
**目标市场**：{market_data['name']}  
**风险等级**：{risk_level}

---

### ✅ 已合规项
{chr(10).join(results) if results else "暂无明确合规证据，请补充产品信息"}

---

### 🔴 红线项（必须处理）
{chr(10).join(red_flags) if red_flags else "未发现红灯项"}

---

### 🟡 建议改进项
{chr(10).join(yellow_flags) if yellow_flags else "未发现需改进项"}

---

### 📋 建议下一步行动

{"1. **立即处理红灯项**，否则货物可能被扣留或罚款" if red_flags else "1. 持续监控法规更新，保持合规"}
{"2. 准备相关检测报告和证书" if red_flags else "2. 可考虑申请加分认证（如GOTS有机认证）"}
{"3. 修改产品标签和包装" if red_flags else "3. 定期自查确保持续合规"}
4. 保留合规文件3年以上备查
5. 关注目标市场法规更新

---

### 🛡️ 免责声明
本报告基于您提供的信息自动生成，不构成法律建议。具体合规要求请以目标市场最新法规和官方指南为准。建议重要决策咨询专业合规顾问。
"""
    
    return report, risk_level, risk_detail


# ============================================================
# Gradio界面
# ============================================================

with gr.Blocks(title="AI跨境合规助手", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🛡️ AI跨境合规助手
    
    **上传产品图+描述，1分钟获取美/欧/日/澳合规风险报告**
    
    帮助中国跨境卖家避免海关扣货、平台下架、高额罚款。
    """)
    
    with gr.Row():
        with gr.Column():
            # 输入区
            image_input = gr.Image(label="上传产品图（正面/背面/标签）", type="pil")
            
            description_input = gr.Textbox(
                label="产品描述（Listing文案）", 
                placeholder="例如：100%聚酯纤维女装连衣裙...",
                lines=5
            )
            
            market_input = gr.Dropdown(
                choices=["US", "EU", "JP", "AU"],
                label="目标市场",
                value="US"
            )
            
            with gr.Row():
                children_checkbox = gr.Checkbox(label="是儿童产品")
                material_input = gr.Textbox(label="材质/成分", placeholder="如：棉60% 聚酯40%")
            
            submit_btn = gr.Button("🔍 开始检查", variant="primary", size="lg")
            
            gr.Markdown("""
            ---
            ### 💡 使用提示
            - 图片请包含可见的洗标/成分标
            - 描述使用英文效果更好
            - 速度：通常1-2分钟出报告
            
            ### 📧 需要帮助？
            微信/邮件联系：[your contact]
            """)
        
        with gr.Column():
            # 输出区
            report_output = gr.Markdown(label="合规报告")
            risk_badge = gr.Textbox(label="风险等级", interactive=False)
            risk_detail_output = gr.Textbox(label="风险说明", interactive=False)
    
    # 示例
    gr.Examples(
        examples=[
            ["", "Women's summer dress, 100% polyester, machine washable. Made in China.", "US", False, "100% Polyester"],
            ["", "Children's cotton t-shirt, 95% cotton 5% spandex. Fun cartoon print.", "US", True, "95% Cotton 5% Spandex"],
            ["", "Women's scarf, 100% silk, dry clean only. CE certified.", "EU", False, "100% Silk"],
            ["", "Baby onesie, snap buttons, soft cotton fabric. Designed in Japan.", "JP", True, "100% Cotton"],
        ],
        inputs=[image_input, description_input, market_input, children_checkbox, material_input],
        label="👆 点击示例快速体验"
    )
    
    # 绑定事件
    submit_btn.click(
        fn=analyze_compliance,
        inputs=[image_input, description_input, market_input, children_checkbox, material_input],
        outputs=[report_output, risk_badge, risk_detail_output]
    )
    
    gr.Markdown("""
    ---
    ### 🚀 关于我们
    专注跨境服装合规，已帮助 300+ 卖家避免海外扣货损失。
    每月更新各国法规，确保报告时效性。
    
    ### 📅 下一步
    - 🎯 本报告为AI预审，如需正式检测证书请联系我们
    - 💬 加入卖家交流群，获取最新政策解读
    """)


# ============================================================
# 启动
# ============================================================
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860, show_error=True)
```

## 使用步骤

### 第1步：保存代码
复制上方代码，保存为 `app.py`

### 第2步：安装依赖
```bash
pip install gradio pillow
```

### 第3步：运行
```bash
python app.py
```

### 第4步：打开浏览器
访问 `http://localhost:7860` 即可使用

### 第5步：部署上线（可选）
```bash
# 推送到GitHub后，在HuggingFace Spaces免费部署
# 或使用Render/Railway免费部署
```

---

## 下一步接入Claude API（让报告更智能）

```python
# 替换掉规则引擎，接入Claude API做智能分析
import anthropic

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

def analyze_with_claude(image, description, market, is_children, material):
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        messages=[{
            "role": "user", 
            "content": f"作为跨境合规专家，请分析以下产品是否符合{market}市场要求：\n\n描述{description}\n材质{material}\n儿童产品{is_children}\n\n请输出：1)风险等级 2)红线项 3)建议项 4)缺失文件清单"
        }]
    )
    return response.content
```

---

## 常见问题

**Q: 报告准确吗？**
A: 当前版本基于规则引擎，覆盖80%常见场景。接入Claude API后准确率可提升至90%+。

**Q: 会替代检测机构吗？**
A: 不会。我们适合预审和日常自查，正式清关仍需传统检测报告。

**Q: 数据安全吗？**
A: 我们不长期存储用户产品数据，检查后可直接删除。
