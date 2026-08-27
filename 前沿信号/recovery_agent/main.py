#!/usr/bin/env python3
"""
Recovery Agent - 主入口
命令行工具：加载数据 → 运行审计 → 输出报告 → 生成证据包

用法：
  python main.py --customer demo --orders data/sample/orders.csv --settlements data/sample/settlements.csv
  python main.py --customer demo --dir data/sample/
  python main.py --demo  # 运行演示
"""

import os
import sys
import json
import csv
import io
from pathlib import Path
from datetime import datetime, timedelta

# 加入项目路径
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT))

from engine.rules import RecoveryEngine, AuditResult, Anomaly


# ============================================
# 数据加载器
# ============================================

def load_csv(filepath: str) -> list:
    """加载CSV文件"""
    records = []
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # 尝试转换数字字段
                cleaned = {}
                for k, v in row.items():
                    if v is None:
                        cleaned[k] = ""
                        continue
                    v = v.strip()
                    # 尝试转为数字
                    try:
                        if '.' in v:
                            cleaned[k] = float(v)
                        elif v.replace('-', '').isdigit():
                            cleaned[k] = int(v)
                        else:
                            cleaned[k] = v
                    except:
                        cleaned[k] = v
                records.append(cleaned)
    except Exception as e:
        print(f"[错误] 加载 {filepath} 失败: {e}")
    return records


def load_directory(dirpath: str) -> dict:
    """加载目录下所有CSV"""
    data = {}
    dir_path = Path(dirpath)
    
    if not dir_path.exists():
        print(f"[错误] 目录不存在: {dirpath}")
        return data
    
    for csv_file in dir_path.glob("*.csv"):
        name = csv_file.stem.lower()
        records = load_csv(str(csv_file))
        
        # 智能识别类型
        if "order" in name:
            data["orders"] = data.get("orders", []) + records
        elif "settlement" in name or "settle" in name:
            data["settlements"] = data.get("settlements", []) + records
        elif "logistic" in name or "物流" in name:
            data["logistics"] = data.get("logistics", []) + records
        elif "refund" in name or "退款" in name:
            data["refunds"] = data.get("refunds", []) + records
        elif "claim" in name or "索赔" in name:
            data["claims"] = data.get("claims", []) + records
        else:
            data[name] = records
    
    return data


# ============================================
# 报告生成器
# ============================================

def generate_report(result: AuditResult, output_dir: str = None) -> str:
    """生成审计报告"""
    
    lines = []
    lines.append("=" * 70)
    lines.append("  前沿信号 · Recovery Agent 审计报告")
    lines.append("=" * 70)
    lines.append(f"  审计ID: {result.audit_id}")
    lines.append(f"  客户ID: {result.customer_id}")
    lines.append(f"  运行时间: {result.created_at}")
    lines.append(f"  数据量: {result.total_records:,} 条记录")
    lines.append("")
    
    # 运行规则
    lines.append("─" * 70)
    lines.append("  规则运行结果")
    lines.append("─" * 70)
    for rule_name, count in result.summary.get("rules_run", []):
        status = "✓" if count > 0 else "·"
        label = {
            "duplicate_charges": "重复扣费检测",
            "lost_package": "物流丢件未索赔",
            "delay_claims": "延误未索赔",
            "missing_refunds": "退款未到账",
            "settlement_mismatch": "结算不一致"
        }.get(rule_name, rule_name)
        lines.append(f"  {status} {label}: {count} 条异常")
    lines.append("")
    
    # 异常汇总
    lines.append("─" * 70)
    lines.append(f"  异常汇总 (共 {len(result.anomalies)} 条)")
    lines.append("─" * 70)
    
    # 按类型分类展示
    by_type = result.by_type()
    
    type_labels = {
        "duplicate_charges": "🔴 重复扣费",
        "missing_refund": "🔴 退款未到账",
        "settlement_mismatch": "🟡 结算不一致",
        "lost_package": "🟠 物流丢件未索赔",
        "delay_claim": "🟠 延误未索赔"
    }
    
    for anomaly_type, anomalies in by_type.items():
        label = type_labels.get(anomaly_type, anomaly_type)
        total = sum(a.estimated_recovery for a in anomalies)
        lines.append(f"\n  {label}")
        lines.append(f"  异常数量: {len(anomalies)}条 | 预估可追回: ¥{total:,.2f}")
        lines.append(f"  {'─' * 60}")
        
        for a in anomalies[:10]:  # 最多显示10条
            lines.append(f"    [{a.severity.upper():8s}] {a.title}")
            lines.append(f"    {'':12s}预估追回: ¥{a.estimated_recovery:,.2f}")
            lines.append(f"    {'':12s}{a.description.split(chr(10))[0][:60]}")
            lines.append("")
        
        if len(anomalies) > 10:
            lines.append(f"    ... 还有 {len(anomalies) - 10} 条未显示")
            lines.append("")
    
    # 总结
    lines.append("=" * 70)
    lines.append("  总结")
    lines.append("=" * 70)
    lines.append(f"  异常总数: {len(result.anomalies)}")
    lines.append(f"  预估总可追回金额: ¥{result.total_estimated_recovery:,.2f}")
    lines.append(f"  服务费(20%): ¥{result.total_estimated_recovery * 0.2:,.2f}")
    lines.append("=" * 70)
    lines.append("")
    lines.append("  下一步：")
    lines.append("  1. 确认异常清单是否属实")
    lines.append("  2. 生成正式索赔材料")
    lines.append("  3. 向相关方提交索赔")
    lines.append("  4. 实际到账后收取服务费")
    lines.append("")
    lines.append("  本报告由前沿信号 Recovery Agent 自动生成")
    lines.append("  生成时间: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    
    report = "\n".join(lines)
    
    # 保存到文件
    if output_dir:
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        report_path = Path(output_dir) / f"report_{result.audit_id}.txt"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        # 同时保存JSON
        json_path = Path(output_dir) / f"report_{result.audit_id}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(result.to_dict(), f, ensure_ascii=False, indent=2)
        
        print(f"\n  报告已保存: {report_path}")
        print(f"  JSON已保存: {json_path}")
    
    return report


# ============================================
# 证据包生成器
# ============================================

def generate_evidence_package(anomaly: Anomaly, output_dir: str) -> str:
    """为单个异常生成证据包"""
    
    lines = []
    lines.append("=" * 60)
    lines.append(f"  证据包: {anomaly.anomaly_id}")
    lines.append("=" * 60)
    lines.append(f"  异常类型: {anomaly.type}")
    lines.append(f"  严重程度: {anomaly.severity}")
    lines.append(f"  标题: {anomaly.title}")
    lines.append(f"  描述:")
    for desc_line in anomaly.description.split("\n"):
        lines.append(f"    {desc_line}")
    lines.append(f"  预估可追回: ¥{anomaly.estimated_recovery:,.2f}")
    lines.append("")
    lines.append("  相关记录:")
    for i, record in enumerate(anomaly.affected_records):
        lines.append(f"    --- 记录 {i+1} ---")
        for k, v in record.items():
            lines.append(f"      {k}: {v}")
    lines.append("")
    lines.append("  证据元数据:")
    for k, v in anomaly.evidence.items():
        lines.append(f"    {k}: {v}")
    lines.append("=" * 60)
    
    report = "\n".join(lines)
    
    # 保存
    evidence_dir = Path(output_dir) / "evidence"
    evidence_dir.mkdir(parents=True, exist_ok=True)
    filepath = evidence_dir / f"evidence_{anomaly.anomaly_id}.txt"
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(report)
    
    return str(filepath)


# ============================================
# 演示模式
# ============================================

def generate_demo_data():
    """生成演示数据 - 模拟一家跨境电商的典型数据"""
    
    # 订单数据
    orders = []
    for i in range(100):
        order_date = datetime.now() - timedelta(days=i % 30)
        orders.append({
            "order_id": f"ORD-{20260000 + i}",
            "order_no": f"ORD-{20260000 + i}",
            "product": f"Product-{i % 10}",
            "quantity": (i % 3) + 1,
            "unit_price": 99.9 + (i % 5) * 50,
            "total_amount": (99.9 + (i % 5) * 50) * ((i % 3) + 1),
            "platform": ["Amazon", "eBay", "Shopify", "Shopee"][i % 4],
            "date": order_date.strftime("%Y-%m-%d"),
            "status": "completed",
            "customer": f"Customer-{i % 20}"
        })
    
    # 结算数据（故意制造异常）
    settlements = []
    for i in range(120):  # 比订单多，可能有重复
        order_idx = i % 100
        base_amount = (99.9 + (order_idx % 5) * 50) * ((order_idx % 3) + 1)
        
        # 故意制造异常
        amount = base_amount
        trans_type = "settlement"
        
        # 每10笔制造一个重复扣费
        if i >= 100 and i < 105:
            amount = base_amount  # 重复
            trans_type = "duplicate"
        # 每15笔制造一个金额不一致
        elif i % 15 == 0 and i < 100:
            amount = base_amount * 0.95  # 少算5%
        
        settle_date = datetime.now() - timedelta(days=i % 30)
        settlements.append({
            "settlement_id": f"STL-{20260000 + i}",
            "order_id": f"ORD-{20260000 + order_idx}",
            "order_no": f"ORD-{20260000 + order_idx}",
            "amount": round(amount, 2),
            "expected_amount": round(base_amount, 2),
            "fee": round(amount * 0.05, 2),
            "type": trans_type,
            "date": settle_date.strftime("%Y-%m-%d"),
            "status": "completed",
            "platform": ["Amazon", "eBay", "Shopify", "Shopee"][i % 4]
        })
    
    # 物流数据（故意制造丢件和延误）
    logistics = []
    for i in range(80):
        tracking_prefix = ["SF", "YT", "ZT", "JD", "UP"][i % 5]
        tracking = f"{tracking_prefix}{2026000000 + i}"
        
        # 制造异常
        status = "已签收"
        promised = 5
        actual = 3
        
        if i % 20 == 0 and i < 60:
            status = "丢件"
            actual = 0
        elif i % 25 == 0 and i < 60:
            status = "延误"
            actual = 12
        
        ship_date = datetime.now() - timedelta(days=i % 30)
        logistics.append({
            "tracking_no": tracking,
            "waybill": tracking,
            "order_id": f"ORD-{20260000 + i}" if i < 100 else f"ORD-{20260000 + (i % 100)}",
            "status": status,
            "carrier": ["顺丰", "圆通", "中通", "京东", "UPS"][i % 5],
            "weight": round(0.5 + (i % 10) * 0.3, 1),
            "shipping_fee": 15 + (i % 5) * 5,
            "goods_value": orders[i % 100]["total_amount"] if i < 100 else 200,
            "promised_days": promised,
            "actual_days": actual,
            "date": ship_date.strftime("%Y-%m-%d"),
            "update_time": (ship_date + timedelta(days=actual if actual > 0 else promised)).strftime("%Y-%m-%d")
        })
    
    # 退款数据（制造退款未到账异常）
    refunds = []
    for i in range(15):
        order_idx = (i * 7) % 100
        refund_date = datetime.now() - timedelta(days=i * 2)
        refunds.append({
            "refund_id": f"RFD-{20260000 + i}",
            "order_id": f"ORD-{20260000 + order_idx}",
            "order_no": f"ORD-{20260000 + order_idx}",
            "amount": 50 + i * 30,
            "refund_amount": 50 + i * 30,
            "reason": ["质量问题", "未收到", "买错", "发货慢", "其他"][i % 5],
            "status": "completed",
            "refund_time": refund_date.strftime("%Y-%m-%d %H:%M"),
            "complete_time": refund_date.strftime("%Y-%m-%d %H:%M"),
            "platform": ["Amazon", "eBay", "Shopify"][i % 3]
        })
    
    # 索赔数据（部分已索赔，部分未索赔）
    claims = []
    # 只索赔了几条物流异常
    lost_and_delayed = [i for i in range(80) if logistics[i]["status"] in ["丢件", "延误"]]
    for idx in lost_and_delayed[:3]:  # 只索赔了3条，留下异常未处理
        claims.append({
            "claim_id": f"CLM-{idx:04d}",
            "tracking_no": logistics[idx]["tracking_no"],
            "waybill": logistics[idx]["tracking_no"],
            "claim_type": "丢件赔偿" if logistics[idx]["status"] == "丢件" else "延误赔偿",
            "status": "已赔付",
            "amount": logistics[idx]["shipping_fee"] * 2
        })
    
    return {
        "orders": orders,
        "settlements": settlements,
        "logistics": logistics,
        "refunds": refunds,
        "claims": claims
    }


def run_demo():
    """运行演示"""
    print("")
    print("╔══════════════════════════════════════════════════════════════╗")
    print("║  前沿信号 · Recovery Agent / 现金流找回机器人              ║")
    print("║  演示模式：模拟100笔订单的异常审计                         ║")
    print("╚══════════════════════════════════════════════════════════════╝")
    print()
    
    # 生成演示数据
    print("[1/3] 生成模拟数据...")
    data = generate_demo_data()
    
    for name, records in data.items():
        print(f"  {name:12s}: {len(records):>5} 条记录")
    
    # 保存演示数据到文件
    sample_dir = PROJECT_ROOT / "data" / "sample"
    sample_dir.mkdir(parents=True, exist_ok=True)
    
    for name, records in data.items():
        filepath = sample_dir / f"{name}.csv"
        if records:
            with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
                writer = csv.DictWriter(f, fieldnames=records[0].keys())
                writer.writeheader()
                writer.writerows(records)
            print(f"  已保存: {filepath.name}")
    
    print()
    print("[2/3] 运行审计引擎...")
    
    # 运行审计
    engine = RecoveryEngine()
    result = engine.run_audit(
        customer_id="DEMO-001",
        orders=data["orders"],
        settlements=data["settlements"],
        logistics=data["logistics"],
        refunds=data["refunds"],
        claims=data["claims"]
    )
    
    print(f"  审计ID: {result.audit_id}")
    print(f"  运行规则: {len(result.summary['rules_run'])} 条")
    
    print()
    print("[3/3] 生成报告...")
    
    # 生成报告
    output_dir = str(PROJECT_ROOT / "data" / "output")
    report = generate_report(result, output_dir)
    print(report)
    
    # 生成证据包
    print("\n  生成证据包...")
    evidence_dir = str(Path(output_dir) / result.audit_id)
    
    for anomaly in result.anomalies[:5]:
        path = generate_evidence_package(anomaly, evidence_dir)
        print(f"  ✓ {anomaly.anomaly_id} ({anomaly.type}) → {Path(path).name}")
    
    print(f"\n  全部证据包已保存至: {evidence_dir}/evidence/")
    
    # 最终统计
    print()
    print("=" * 70)
    print("  演示完成！")
    print("=" * 70)
    print(f"  异常总数: {len(result.anomalies)}")
    print(f"  预估可追回: ¥{result.total_estimated_recovery:,.2f}")
    print(f"  服务费(20%): ¥{result.total_estimated_recovery * 0.2:,.2f}")
    print()
    print("  实际使用时:")
    print("  1. 拿到客户真实的订单/结算/物流数据")
    print("  2. 用相同方式加载数据并运行审计")
    print("  3. 将报告交给客户确认")
    print("  4. 确认后生成正式索赔材料")
    print("  5. 追回后收取15-25%服务费")
    print()
    
    return result


# ============================================
# 主函数
# ============================================

def main():
    """命令行入口"""
    
    # 简化参数处理
    if "--demo" in sys.argv or len(sys.argv) == 1:
        run_demo()
        return
    
    customer_id = "customer"
    data_dir = None
    output_dir = None
    
    # 简单参数解析
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] == "--customer" and i + 1 < len(args):
            customer_id = args[i + 1]
            i += 2
        elif args[i] == "--dir" and i + 1 < len(args):
            data_dir = args[i + 1]
            i += 2
        elif args[i] == "--output" and i + 1 < len(args):
            output_dir = args[i + 1]
            i += 2
        else:
            i += 1
    
    if data_dir:
        print(f"加载数据: {data_dir}")
        data = load_directory(data_dir)
        
        if not data:
            print("未找到数据文件，运行演示模式")
            run_demo()
            return
        
        engine = RecoveryEngine()
        result = engine.run_audit(
            customer_id=customer_id,
            orders=data.get("orders"),
            settlements=data.get("settlements"),
            logistics=data.get("logistics"),
            refunds=data.get("refunds"),
            claims=data.get("claims")
        )
        
        report = generate_report(result, output_dir or "data/output")
        print(report)
    else:
        run_demo()


if __name__ == "__main__":
    main()
