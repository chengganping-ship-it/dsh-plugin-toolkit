"""
全栈自主Agent系统 - 纯Agent接单完整闭环
无需人类注册，AI层面圈层，自主营销→接单→交付→收款

架构:
1. 产品定义引擎 - 定义Agent能提供的数字服务
2. 营销引擎 - 在Twitter/X等平台自动推广
3. 接单引擎 - 在Hive Protocol等平台自动投标
4. 执行引擎 - 调用AI完成任务
5. 交付引擎 - 自动提交交付物
6. 收款引擎 - USDC/Stripe自动收款
"""

import json
import os
import time
import hashlib
import datetime
import requests
from pathlib import Path
from typing import List, Dict, Optional, Any

# ============================================================
# 配置
# ============================================================
BASE_DIR = Path(__file__).parent
CONFIG_PATH = BASE_DIR / "agent_system_config.json"
WALLET_PATH = BASE_DIR / "hive_wallet.json"
TASK_CACHE_PATH = BASE_DIR / "task_cache.json"

# API端点
HIVE_API = "https://uphive.xyz/api"
VIRTUALS_API = "https://api.virtuals.io/api"

# ============================================================
# 产品定义引擎
# ============================================================
class ProductEngine:
    """定义Agent能提供的数字服务产品"""
    
    # 预定义服务产品（基于市场需求）
    PRODUCTS = [
        {
            "id": "ai_chatbot_dev",
            "name": "AI Chatbot Development",
            "description": "Custom AI chatbot for your business. Trained on your data, integrated with your website.",
            "price_usd": 150,
            "delivery_hours": 48,
            "category": "development",
            "skills": ["python", "openai", "langchain", "react"],
            "deliverables": ["Source code", "Documentation", "Deployment guide"]
        },
        {
            "id": "data_automation",
            "name": "Data Automation Pipeline",
            "description": "Automated data collection, processing, and reporting pipeline.",
            "price_usd": 200,
            "delivery_hours": 72,
            "category": "automation",
            "skills": ["python", "pandas", "airflow", "sql"],
            "deliverables": ["Pipeline code", "Dashboard", "Documentation"]
        },
        {
            "id": "api_development",
            "name": "REST API Development",
            "description": "Production-ready REST API with authentication, documentation, and tests.",
            "price_usd": 180,
            "delivery_hours": 48,
            "category": "development",
            "skills": ["python", "fastapi", "postgresql", "docker"],
            "deliverables": ["API code", "Swagger docs", "Docker setup"]
        },
        {
            "id": "ml_model_training",
            "name": "ML Model Training",
            "description": "Custom machine learning model training and deployment.",
            "price_usd": 300,
            "delivery_hours": 96,
            "category": "machine_learning",
            "skills": ["python", "pytorch", "sklearn", "mlflow"],
            "deliverables": ["Trained model", "Training code", "Evaluation report"]
        },
        {
            "id": "documentation",
            "name": "Technical Documentation",
            "description": "Comprehensive technical documentation for your project.",
            "price_usd": 80,
            "delivery_hours": 24,
            "category": "documentation",
            "skills": ["markdown", "openapi", "diagrams"],
            "deliverables": ["Full docs", "API reference", "User guide"]
        },
        {
            "id": "code_review",
            "name": "Code Review & Optimization",
            "description": "Professional code review with optimization suggestions.",
            "price_usd": 100,
            "delivery_hours": 24,
            "category": "code_review",
            "skills": ["python", "javascript", "performance", "security"],
            "deliverables": ["Review report", "Optimized code", "Best practices guide"]
        }
    ]
    
    def get_product(self, product_id: str) -> Optional[dict]:
        for p in self.PRODUCTS:
            if p["id"] == product_id:
                return p
        return None
    
    def get_all_products(self) -> List[dict]:
        return self.PRODUCTS
    
    def get_by_category(self, category: str) -> List[dict]:
        return [p for p in self.PRODUCTS if p["category"] == category]
    
    def get_cheapest(self) -> dict:
        return min(self.PRODUCTS, key=lambda x: x["price_usd"])
    
    def get_highest_value(self) -> dict:
        return max(self.PRODUCTS, key=lambda x: x["price_usd"])


# ============================================================
# 营销引擎 - Twitter/X自动推广
# ============================================================
class MarketingEngine:
    """在社交媒体上自动推广Agent服务"""
    
    def __init__(self, config: dict):
        self.config = config
        self.twitter_token = config.get("twitter_bearer_token", "")
        self.twitter_api_key = config.get("twitter_api_key", "")
        self.twitter_api_secret = config.get("twitter_api_secret", "")
        self.posted_tweets = self._load_posted()
    
    def _load_posted(self) -> list:
        cache_path = BASE_DIR / "posted_tweets.json"
        if cache_path.exists():
            return json.loads(cache_path.read_text())
        return []
    
    def _save_posted(self):
        cache_path = BASE_DIR / "posted_tweets.json"
        cache_path.write_text(json.dumps(self.posted_tweets, indent=2))
    
    def generate_tweet(self, product: dict) -> str:
        """生成推广推文"""
        templates = [
            f"🤖 Just launched: {product['name']}\n\n{product['description']}\n\n💰 ${product['price_usd']} | ⏱️ {product['delivery_hours']}h delivery\n\nBuilt by AI, for humans. DM or reply to order!\n\n#AI #Automation #BuildInPublic",
            
            f"Need a {product['name']}? I build them.\n\n✅ {product['description']}\n✅ ${product['price_usd']} flat rate\n✅ Delivered in {product['delivery_hours']} hours\n\nNo meetings. No revisions. Just results.\n\n#AI #SaaS #NoCode",
            
            f"🚀 New service: {product['name']}\n\n{product['description']}\n\n📦 What you get:\n" + "\n".join(f"  • {d}" for d in product["deliverables"]) + f"\n\n💰 ${product['price_usd']} | ⚡ Fast delivery\n\n#AI #Tech #Automation"
        ]
        import random
        return random.choice(templates)
    
    def post_tweet(self, product: dict) -> bool:
        """发布推文（需要Twitter API凭证）"""
        tweet = self.generate_tweet(product)
        
        if not self.twitter_api_key:
            # 模拟发布：保存到本地
            print(f"  [模拟推文] {tweet[:80]}...")
            self.posted_tweets.append({
                "product_id": product["id"],
                "tweet": tweet,
                "posted_at": datetime.datetime.now().isoformat(),
                "simulated": True
            })
            self._save_posted()
            return True
        
        # 实际Twitter API调用（需要凭证）
        try:
            # Twitter API v2 发布
            response = requests.post(
                "https://api.twitter.com/2/tweets",
                headers={"Authorization": f"Bearer {self.twitter_token}"},
                json={"text": tweet},
                timeout=15
            )
            if response.status_code == 201:
                self.posted_tweets.append({
                    "product_id": product["id"],
                    "tweet": tweet,
                    "posted_at": datetime.datetime.now().isoformat(),
                    "tweet_id": response.json().get("data", {}).get("id")
                })
                self._save_posted()
                return True
            else:
                print(f"  Twitter API错误: {response.status_code}")
                return False
        except Exception as e:
            print(f"  发布失败: {e}")
            return False
    
    def run_marketing_campaign(self, products: List[dict]):
        """运行营销活动"""
        print("\n📢 启动营销活动...")
        for product in products:
            success = self.post_tweet(product)
            if success:
                print(f"  ✅ 已推广: {product['name']}")
            time.sleep(2)  # 避免频率限制


# ============================================================
# 接单引擎 - Hive Protocol自动投标
# ============================================================
class OrderEngine:
    """在Hive Protocol等平台上自动接单"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers["X-API-Key"] = api_key
        self.cache = self._load_cache()
    
    def _load_cache(self) -> dict:
        if TASK_CACHE_PATH.exists():
            return json.loads(TASK_CACHE_PATH.read_text())
        return {"bidded": [], "won": [], "completed": [], "ignored": []}
    
    def _save_cache(self):
        TASK_CACHE_PATH.write_text(json.dumps(self.cache, indent=2))
    
    def scan_tasks(self) -> List[dict]:
        """扫描Hive Protocol任务市场"""
        try:
            resp = self.session.get(f"{HIVE_API}/tasks", params={"status": "open"}, timeout=15)
            if resp.status_code == 200:
                return resp.json().get("tasks", [])
        except Exception as e:
            print(f"  扫描失败: {e}")
        return []
    
    def match_task_to_product(self, task: dict, products: List[dict]) -> Optional[dict]:
        """将任务匹配到产品"""
        task_category = task.get("category", "").lower()
        task_desc = task.get("description", "").lower()
        
        best_match = None
        best_score = 0
        
        for product in products:
            score = 0
            # 类别匹配
            if product["category"] in task_category or task_category in product["category"]:
                score += 30
            # 技能匹配
            for skill in product["skills"]:
                if skill in task_desc:
                    score += 10
            # 预算匹配
            task_budget = task.get("budget_usd", 0)
            if task_budget >= product["price_usd"] * 0.8:
                score += 20
            
            if score > best_score:
                best_score = score
                best_match = product
        
        return best_match if best_score >= 30 else None
    
    def submit_bid(self, task_id: str, product: dict, task: dict) -> bool:
        """提交投标"""
        proposal = f"""## Professional {product['name']} Service

I specialize in delivering high-quality {product['name'].lower()} solutions.

### My Approach
1. **Deep Analysis** - Understand your exact requirements
2. **Rapid Prototyping** - Quick proof of concept
3. **Full Implementation** - Production-ready delivery
4. **Documentation** - Complete guides and handover

### Deliverables
{chr(10).join(f'- {d}' for d in product['deliverables'])}

### Why Me
- AI-powered execution = faster delivery
- Flat rate: ${product['price_usd']}
- Delivery in {product['delivery_hours']} hours
- Unlimited revisions until satisfied

Let's build something great together!
"""
        
        try:
            resp = self.session.post(
                f"{HIVE_API}/tasks/{task_id}/bid",
                json={
                    "proposal": proposal,
                    "price_usd": product["price_usd"],
                    "delivery_hours": product["delivery_hours"]
                },
                timeout=15
            )
            if resp.status_code in [200, 201]:
                self.cache["bidded"].append(task_id)
                self._save_cache()
                return True
        except Exception as e:
            print(f"  投标失败: {e}")
        return False
    
    def auto_bid(self, products: List[dict]):
        """自动扫描并投标"""
        print("\n🔍 扫描任务市场...")
        tasks = self.scan_tasks()
        
        if not tasks:
            print("  😴 暂无开放任务")
            return
        
        bidded_count = 0
        for task in tasks:
            task_id = task.get("id", "")
            if task_id in self.cache["bidded"]:
                continue
            
            product = self.match_task_to_product(task, products)
            if product:
                print(f"  📤 投标: {task.get('title', 'Unknown')} → {product['name']}")
                if self.submit_bid(task_id, product, task):
                    bidded_count += 1
                time.sleep(1)
        
        print(f"  ✅ 已投标 {bidded_count} 个任务")


# ============================================================
# 执行引擎 - 调用AI完成任务
# ============================================================
class ExecutionEngine:
    """执行任务的核心引擎"""
    
    def __init__(self, workspace: Path):
        self.workspace = workspace
        self.workspace.mkdir(exist_ok=True)
    
    def execute(self, task: dict, product: dict) -> dict:
        """执行任务"""
        task_id = task.get("id", "unknown")
        task_dir = self.workspace / f"task_{task_id}"
        task_dir.mkdir(exist_ok=True)
        
        # 生成执行计划
        plan = self._create_plan(task, product)
        (task_dir / "PLAN.md").write_text(plan, encoding="utf-8")
        
        # 调用AI执行（这里可以接入Claude Code/Codex API）
        deliverables = self._execute_plan(plan, task_dir, product)
        
        return {
            "task_id": task_id,
            "product_id": product["id"],
            "output_dir": str(task_dir),
            "deliverables": deliverables,
            "completed_at": datetime.datetime.now().isoformat()
        }
    
    def _create_plan(self, task: dict, product: dict) -> str:
        """创建执行计划"""
        return f"""# 执行计划

## 任务: {task.get('title', 'Unknown')}
## 产品: {product['name']}
## 创建时间: {datetime.datetime.now().isoformat()}

## 需求
{task.get('description', 'No description')}

## 执行步骤
1. 分析需求
2. 设计解决方案
3. 实现核心功能
4. 测试和优化
5. 编写文档
6. 打包交付

## 交付物
{chr(10).join(f'- {d}' for d in product['deliverables'])}
"""
    
    def _execute_plan(self, plan: str, output_dir: Path, product: dict) -> List[str]:
        """执行计划（可替换为实际AI调用）"""
        deliverables = []
        
        for item in product["deliverables"]:
            file_path = output_dir / f"{item.replace(' ', '_').lower()}.md"
            content = f"""# {item}

## 产品: {product['name']}
## 生成时间: {datetime.datetime.now().isoformat()}

## 内容
这是自动生成的交付物。实际使用时，这里将包含：
- 完整的源代码/文档/设计
- 使用说明
- 部署指南

## 状态
✅ 已完成
"""
            file_path.write_text(content, encoding="utf-8")
            deliverables.append(str(file_path))
        
        return deliverables


# ============================================================
# 交付引擎
# ============================================================
class DeliveryEngine:
    """自动提交交付物"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers["X-API-Key"] = api_key
    
    def submit(self, task_id: str, deliverables: List[str], summary: str) -> bool:
        """提交交付物"""
        try:
            resp = self.session.post(
                f"{HIVE_API}/tasks/{task_id}/submit",
                json={
                    "deliverables": summary,
                    "attachments": deliverables
                },
                timeout=15
            )
            return resp.status_code in [200, 201]
        except Exception as e:
            print(f"  交付失败: {e}")
            return False


# ============================================================
# 收款引擎
# ============================================================
class PaymentEngine:
    """管理收款"""
    
    def __init__(self, wallet_address: str):
        self.wallet_address = wallet_address
        self.payments = self._load_payments()
    
    def _load_payments(self) -> list:
        path = BASE_DIR / "payments.json"
        if path.exists():
            return json.loads(path.read_text())
        return []
    
    def _save_payments(self):
        path = BASE_DIR / "payments.json"
        path.write_text(json.dumps(self.payments, indent=2))
    
    def record_payment(self, task_id: str, amount_usd: float, currency: str = "USDC"):
        """记录收款"""
        payment = {
            "task_id": task_id,
            "amount_usd": amount_usd,
            "currency": currency,
            "wallet": self.wallet_address,
            "received_at": datetime.datetime.now().isoformat(),
            "status": "pending"  # pending, confirmed
        }
        self.payments.append(payment)
        self._save_payments()
        return payment
    
    def get_total_earnings(self) -> float:
        return sum(p["amount_usd"] for p in self.payments if p["status"] == "confirmed")
    
    def get_pending_payments(self) -> List[dict]:
        return [p for p in self.payments if p["status"] == "pending"]


# ============================================================
# 主控制器 - 全栈自主Agent
# ============================================================
class AutonomousAgent:
    """全栈自主Agent系统"""
    
    def __init__(self):
        self.config = self._load_config()
        self.product_engine = ProductEngine()
        self.marketing_engine = MarketingEngine(self.config)
        self.order_engine = OrderEngine(self.config.get("hive_api_key", ""))
        self.execution_engine = ExecutionEngine(BASE_DIR / "workspace")
        self.delivery_engine = DeliveryEngine(self.config.get("hive_api_key", ""))
        self.payment_engine = PaymentEngine(self.config.get("wallet_address", ""))
    
    def _load_config(self) -> dict:
        if CONFIG_PATH.exists():
            return json.loads(CONFIG_PATH.read_text())
        return {}
    
    def _save_config(self):
        CONFIG_PATH.write_text(json.dumps(self.config, indent=2))
    
    def setup(self):
        """初始化系统"""
        print("=" * 70)
        print("🤖 全栈自主Agent系统初始化")
        print("=" * 70)
        
        # 加载Hive配置
        if not self.config.get("hive_api_key"):
            # 尝试从hive_agent_config.json加载
            hive_config_path = BASE_DIR / "hive_agent_config.json"
            if hive_config_path.exists():
                hive_config = json.loads(hive_config_path.read_text())
                self.config["hive_api_key"] = hive_config.get("api_key", "")
                self.config["wallet_address"] = hive_config.get("wallet_address", "")
                self.config["agent_name"] = hive_config.get("agent_name", "AutoCoderAgent")
                self._save_config()
        
        print(f"  Agent名称: {self.config.get('agent_name', 'Unknown')}")
        print(f"  Hive API: {self.config.get('hive_api_key', 'Not set')[:20]}...")
        print(f"  钱包地址: {self.config.get('wallet_address', 'Not set')[:20]}...")
        print(f"  产品数量: {len(self.product_engine.get_all_products())}")
        
        return True
    
    def run_full_cycle(self):
        """运行完整周期：营销→接单→执行→交付→收款"""
        print("\n" + "=" * 70)
        print(f"🔄 开始完整周期 - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 70)
        
        products = self.product_engine.get_all_products()
        
        # 阶段1: 营销
        print("\n📢 阶段1: 自动营销")
        self.marketing_engine.run_marketing_campaign(products[:3])
        
        # 阶段2: 接单
        print("\n📋 阶段2: 自动接单")
        self.order_engine.auto_bid(products)
        
        # 阶段3: 检查中标（模拟）
        print("\n🏆 阶段3: 检查中标状态")
        # 实际应从API获取中标状态
        print("  等待中标通知...")
        
        # 阶段4: 执行（如果有中标任务）
        print("\n⚙️ 阶段4: 执行任务")
        # 实际应从API获取中标任务并执行
        print("  等待执行任务...")
        
        # 阶段5: 交付
        print("\n📦 阶段5: 交付")
        print("  等待交付...")
        
        # 阶段6: 收款
        print("\n💰 阶段6: 收款")
        earnings = self.payment_engine.get_total_earnings()
        pending = len(self.payment_engine.get_pending_payments())
        print(f"  已确认收入: ${earnings}")
        print(f"  待确认收款: {pending}笔")
        
        print("\n" + "=" * 70)
        print("✅ 周期完成")
        print("=" * 70)
    
    def show_dashboard(self):
        """显示仪表板"""
        print("\n" + "=" * 70)
        print("📊 Agent系统仪表板")
        print("=" * 70)
        
        print(f"\n🤖 Agent: {self.config.get('agent_name', 'Unknown')}")
        print(f"💰 总收入: ${self.payment_engine.get_total_earnings()}")
        print(f"📋 投标数: {len(self.order_engine.cache.get('bidded', []))}")
        print(f"✅ 完成数: {len(self.order_engine.cache.get('completed', []))}")
        print(f"📢 营销推文: {len(self.marketing_engine.posted_tweets)}")
        
        print(f"\n📦 产品列表:")
        for p in self.product_engine.get_all_products():
            print(f"  • {p['name']} - ${p['price_usd']} - {p['category']}")
        
        print(f"\n💳 钱包: {self.config.get('wallet_address', 'Not set')}")
        print(f"🔗 Hive API: {self.config.get('hive_api_key', 'Not set')[:20]}...")


# ============================================================
# 入口
# ============================================================
def main():
    agent = AutonomousAgent()
    
    if not agent.setup():
        print("❌ 初始化失败")
        return
    
    while True:
        print("\n" + "=" * 70)
        print("🎮 选择操作:")
        print("1. 运行完整周期（营销→接单→执行→交付→收款）")
        print("2. 仅运行营销")
        print("3. 仅扫描任务并投标")
        print("4. 查看仪表板")
        print("5. 查看产品列表")
        print("6. 退出")
        print("=" * 70)
        
        choice = input("\n请选择 (1-6): ").strip()
        
        if choice == "1":
            agent.run_full_cycle()
        elif choice == "2":
            products = agent.product_engine.get_all_products()
            agent.marketing_engine.run_marketing_campaign(products)
        elif choice == "3":
            products = agent.product_engine.get_all_products()
            agent.order_engine.auto_bid(products)
        elif choice == "4":
            agent.show_dashboard()
        elif choice == "5":
            for p in agent.product_engine.get_all_products():
                print(f"\n  {p['name']} (${p['price_usd']})")
                print(f"  {p['description']}")
                print(f"  交付: {', '.join(p['deliverables'])}")
        elif choice == "6":
            print("👋 再见!")
            break
        else:
            print("无效选择")


if __name__ == "__main__":
    main()
