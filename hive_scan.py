"""
Hive Protocol - 单次扫描任务市场
自动扫描并显示当前可接的任务
"""

import json
import requests
import datetime

HIVE_API_BASE = "https://uphive.xyz/api"

def load_config():
    """加载Agent配置"""
    try:
        with open("hive_agent_config.json") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def scan_tasks():
    """扫描任务市场"""
    config = load_config()
    api_key = config.get("api_key", "")
    
    print("=" * 60)
    print("🔍 Hive Protocol 任务市场扫描")
    print(f"⏰ {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    headers = {}
    if api_key:
        headers["X-API-Key"] = api_key
    
    # 获取开放任务
    try:
        resp = requests.get(f"{HIVE_API_BASE}/tasks", params={"status": "open"}, headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            tasks = data.get("tasks", [])
        else:
            print(f"❌ API错误: {resp.status_code}")
            print(resp.text[:500])
            return []
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return []
    
    if not tasks:
        print("😴 当前没有开放任务")
        return []
    
    print(f"📊 发现 {len(tasks)} 个开放任务:\n")
    
    for i, t in enumerate(tasks, 1):
        title = t.get("title", "Untitled")
        category = t.get("category", "general")
        budget = t.get("budget_usd", 0)
        task_id = t.get("id", "")
        description = t.get("description", "")[:100]
        proposals = t.get("proposal_count", 0)
        
        print(f"  [{i}] {title}")
        print(f"      📁 类别: {category} | 💰 预算: ${budget} | 📝 投标: {proposals}")
        print(f"      📝 {description}...")
        print(f"      🔗 ID: {task_id}")
        print()
    
    return tasks

def show_leaderboard():
    """显示排行榜"""
    print("\n" + "=" * 60)
    print("🏆 Hive Protocol 排行榜")
    print("=" * 60)
    
    try:
        resp = requests.get(f"{HIVE_API_BASE}/leaderboard", timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            agents = data.get("agents", [])
            for i, a in enumerate(agents[:10], 1):
                name = a.get("name", "Unknown")
                reputation = a.get("reputation", 0)
                tasks_done = a.get("tasks_completed", 0)
                print(f"  {i}. {name} | 声誉: {reputation} | 完成任务: {tasks_done}")
        else:
            print(f"❌ API错误: {resp.status_code}")
    except Exception as e:
        print(f"❌ 请求失败: {e}")

if __name__ == "__main__":
    tasks = scan_tasks()
    show_leaderboard()
    
    print("\n" + "=" * 60)
    print("💡 提示:")
    print("  - 运行 'python hive_agent.py' 进行交互式操作")
    print("  - 运行 'python hive_agent.py' 选择模式1可自动投标")
    print("=" * 60)
