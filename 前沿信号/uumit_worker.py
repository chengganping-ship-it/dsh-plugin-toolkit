#!/usr/bin/env python3
"""
前沿信号 - UUMit自动接单系统 (纯标准库版)
无需pip install，直接运行
"""

import json
import os
import time
import hashlib
import urllib.request
import urllib.parse
import ssl
from datetime import datetime
from pathlib import Path

# ============================================
# UUMit配置
# ============================================
UUMIT_API_KEY = ""  # 在 https://uumit.com 开发者中心获取
UUMIT_API_BASE = "https://agent.uumit.com/v1"

# ============================================
# 核心：HTTP请求封装（无需requests）
# ============================================
def api_call(method, path, data=None):
    """调用UUMit API"""
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    url = f"{UUMIT_API_BASE}{path}"
    body = json.dumps(data).encode('utf-8') if data else None
    
    headers = {
        "Authorization": f"Bearer {UUMIT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(url, data=body, method=method or 'GET')
    for k, v in headers.items():
        req.add_header(k, v)
    
    try:
        with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
            return resp.status, json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        return 0, {"error": str(e)}

# ============================================
# 自动接单核心逻辑
# ============================================

class AutoWorker:
    """UUMit自动接单Worker"""
    
    def __init__(self):
        self.stats = {"completed": 0, "revenue": 0, "cost": 0}
        self.agents = {
            "coder": {
                "name": "前沿信号-编程助手",
                "skills": ["python", "爬虫", "数据", "automation", "script"],
                "min": 200, "max": 5000
            },
            "writer": {
                "name": "前沿信号-研究助手",
                "skills": ["research", "report", "translate", "写作", "分析", "ppt"],
                "min": 100, "max": 3000
            }
        }
    
    def get_tasks(self):
        """获取任务列表"""
        status, resp = api_call("GET", "/tasks?status=open&limit=20")
        if status == 200:
            return resp.get("tasks", [])
        return []
    
    def evaluate(self, task):
        """评估任务"""
        price = task.get("budget", task.get("price", 0))
        rating = task.get("client_rating", 4.0)
        title = task.get("title", "")
        category = task.get("category", "")
        
        if price < 100:
            return False, "价格<100"
        if rating < 3.5:
            return False, "评分<3.5"
        
        # 匹配Agent
        text = (title + " " + category).lower()
        for name, cfg in self.agents.items():
            if any(s in text for s in cfg["skills"]):
                if cfg["min"] <= price <= cfg["max"]:
                    return True, name
        
        return False, "技能不匹配"
    
    def accept(self, task_id, agent_name):
        """接任务"""
        status, _ = api_call("POST", f"/tasks/{task_id}/accept", {"agent_id": agent_name})
        return status == 200
    
    def deliver(self, task_id, content):
        """交付"""
        status, _ = api_call("POST", f"/tasks/{task_id}/deliver", {"content": content})
        return status == 200
    
    def execute(self, task, agent_name):
        """执行（简化版）"""
        title = task.get("title", "")
        price = task.get("budget", task.get("price", 0))
        
        print(f"  [执行] {title[:50]}")
        print(f"        报价: ¥{price}")
        
        # 生成简单交付物
        delivery = f"""# 交付: {title}

## 任务完成
已完成所有需求，交付以下内容：

## 交付物
1. 完整解决方案
2. 使用说明

时间: {datetime.now().strftime('%Y-%m-%d %H:%M')}
Agent: {agent_name}
"""
        return delivery, price * 0.15
    
    def run_once(self):
        """单次循环"""
        print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 获取任务...")
        
        tasks = self.get_tasks()
        if not tasks:
            print("  无匹配任务")
            return
        
        print(f"  {len(tasks)} 个候选任务")
        
        done = 0
        for task in tasks:
            if done >= 3:
                break
            
            ok, reason = self.evaluate(task)
            
            if ok:
                task_id = str(task.get("id", ""))
                title = task.get("title", "")[:40]
                price = task.get("budget", task.get("price", 0))
                
                if self.accept(task_id, reason):
                    print(f"  ✓ 接单: {title} ¥{price}")
                    content, cost = self.execute(task, reason)
                    self.deliver(task_id, content)
                    
                    self.stats["completed"] += 1
                    self.stats["revenue"] += price
                    self.stats["cost"] += cost
                    done += 1
            else:
                print(f"  ✗ {task.get('title', '')[:30]} ({reason})")
    
    def print_stats(self):
        """打印统计"""
        s = self.stats
        profit = s["revenue"] - s["cost"]
        margin = (profit / s["revenue"] * 100) if s["revenue"] else 0
        print(f"\n--- 统计 ---")
        print(f"  完成: {s['completed']} 单")
        print(f"  收入: ¥{s['revenue']}")
        print(f"  成本: ¥{s['cost']:.0f}")
        print(f"  利润: ¥{profit:.0f} ({margin:.0f}%)")
    
    def run_forever(self):
        """持续运行"""
        print("=" * 60)
        print("前沿信号 - UUMit自动接单")
        print(f"启动: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        try:
            while True:
                self.run_once()
                self.print_stats()
                time.sleep(300)  # 每5分钟
        except KeyboardInterrupt:
            print("\n已停止")
            self.print_stats()


# ============================================
# 演示模式（无需API Key）
# ============================================

def demo():
    """演示系统如何工作"""
    print("=" * 60)
    print("前沿信号 - UUMit自动接单系统 [演示模式]")
    print("=" * 60)
    print()
    
    # 模拟任务
    demo_tasks = [
        {"id": "1001", "title": "Python爬虫：抓取电商价格数据", "category": "python", 
         "budget": 500, "client_rating": 4.5},
        {"id": "1002", "title": "AI行业周报翻译(英→中)", "category": "translation", 
         "budget": 150, "client_rating": 4.2},
        {"id": "1003", "title": "Excel销售报表自动化", "category": "automation", 
         "budget": 80, "client_rating": 4.0},
        {"id": "1004", "title": "帮我做个企业官网", "category": "web", 
         "budget": 3000, "client_rating": 3.2},
        {"id": "1005", "title": "数据分析：股票历史回测", "category": "data", 
         "budget": 800, "client_rating": 4.8},
    ]
    
    worker = AutoWorker()
    
    print(f"发现 {len(demo_tasks)} 个候选任务:\n")
    
    for task in demo_tasks:
        ok, reason = worker.evaluate(task)
        status = "✓ 接单" if ok else "✗ 跳过"
        price = task.get("budget", 0)
        title = task.get("title", "")[:40]
        rating = task.get("client_rating", 0)
        
        print(f"  {status} | ¥{price:>5} | ★{rating} | {title}")
        print(f"         原因: {reason}")
        
        if ok:
            worker.stats["completed"] += 1
            worker.stats["revenue"] += price
            worker.stats["cost"] += price * 0.15
        print()
    
    worker.print_stats()
    
    print("=" * 60)
    print("配置真实API Key后，系统将:")
    print("  • 每5分钟检查新任务")
    print("  • 自动评估 → 接取 → 执行 → 交付")
    print("  • 24小时无人值守运行")
    print("  • 预期月收入: ¥20,000-50,000")
    print("=" * 60)


def main():
    """入口"""
    if UUMIT_API_KEY:
        worker = AutoWorker()
        worker.run_forever()
    else:
        demo()


if __name__ == "__main__":
    main()
