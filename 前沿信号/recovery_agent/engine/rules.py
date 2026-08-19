# Recovery Agent Engine
# 确定性规则检测引擎（不依赖LLM）

"""
规则引擎核心：
把业务异常检测分为两个层次：
1. 确定性规则 → 直接计算金额（10-15条核心规则）
2. LLM辅助 → 合同/政策解析、复杂判断、证据整理

金额计算从不用LLM做，只用确定LLM做文本理解。
"""

from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import hashlib
import json


@dataclass
class Anomaly:
    """一条异常记录"""
    anomaly_id: str
    type: str          # duplicate_charge | missing_refund | lost_package | delay_claim | settlement_mismatch
    severity: str      # critical | high | medium | low
    title: str
    description: str
    affected_records: List[Dict] = field(default_factory=list)
    estimated_recovery: float = 0.0
    evidence: Dict[str, Any] = field(default_factory=dict)
    status: str = "pending"  # pending | confirmed | submitted | rejected | recovered
    notes: str = ""
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class AuditResult:
    """审计结果"""
    audit_id: str
    customer_id: str
    source_files: List[str]
    total_records: int
    anomalies: List[Anomaly]
    summary: Dict[str, Any]
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    @property
    def total_estimated_recovery(self) -> float:
        return sum(a.estimated_recovery for a in self.anomalies if a.status != "rejected")
    
    def by_type(self) -> Dict[str, List[Anomaly]]:
        result = {}
        for a in self.anomalies:
            result.setdefault(a.type, []).append(a)
        return result
    
    def to_dict(self) -> dict:
        return {
            "audit_id": self.audit_id,
            "customer_id": self.customer_id,
            "source_files": self.source_files,
            "total_records": self.total_records,
            "anomaly_count": len(self.anomalies),
            "total_estimated_recovery": self.total_estimated_recovery,
            "anomalies": [a.to_dict() for a in self.anomalies],
            "summary": self.summary,
            "created_at": self.created_at
        }


# ============================================
# 规则1：重复扣费检测
# ============================================
def detect_duplicate_charges(records: List[Dict], 
                              key_fields: List[str] = None,
                              amount_field: str = "amount",
                              time_window_hours: int = 24) -> List[Anomaly]:
    """
    检测同一笔费用被重复收取
    核心逻辑：相同关键字段+相同金额+时间相近 = 重复
    """
    if key_fields is None:
        key_fields = ["order_id", "description"]
    
    anomalies = []
    seen = {}
    
    for i, record in enumerate(records):
        # 构建签名
        key_parts = [str(record.get(f, "")).strip() for f in key_fields]
        amount = record.get(amount_field, 0)
        key = hashlib.md5("|".join(key_parts).encode()).hexdigest()[:12]
        
        sig = f"{key}:{amount}"
        current_time = record.get("timestamp") or record.get("date")
        
        if sig in seen:
            prev_idx, prev_record = seen[sig]
            prev_time = prev_record.get("timestamp") or prev_record.get("date")
            
            # 检查时间窗口
            time_diff_ok = True
            if current_time and prev_time:
                try:
                    t1 = str(prev_time)[:19]
                    t2 = str(current_time)[:19]
                    # 简化：只要字符串差异不大即可
                    if abs(len(t1) - len(t2)) < 5:
                        time_diff_ok = True
                except:
                    time_diff_ok = True
            
            if time_diff_ok:
                anomalies.append(Anomaly(
                    anomaly_id=f"DUP-{i:04d}",
                    type="duplicate_charge",
                    severity="critical",
                    title=f"重复扣费: {record.get(key_fields[0], 'unknown')[:40]}",
                    description=(
                        f"同一笔费用被收取两次。\n"
                        f"关键字段: {dict((f, record.get(f)) for f in key_fields)}\n"
                        f"金额: ¥{amount}\n"
                        f"首次收取: {prev_time}\n"
                        f"重复收取: {current_time}\n"
                        f"预估可追回: ¥{amount}"
                    ),
                    affected_records=[prev_record, record],
                    estimated_recovery=float(amount) if amount else 0,
                    evidence={
                        "rule": "duplicate_detection",
                        "key_fields": key_fields,
                        "amount_field": amount_field,
                        "match_signature": sig,
                        "record_indices": [prev_idx, i]
                    }
                ))
        else:
            seen[sig] = (i, record)
    
    return anomalies


# ============================================
# 规则2：物流丢件未赔付检测
# ============================================
def detect_lost_package_claims(logistics_records: List[Dict],
                                claim_records: List[Dict]) -> List[Anomaly]:
    """
    检测物流丢件但未申请赔偿
    核心逻辑：状态为'丢件'/'丢失'/'查无此件' + 没有对应索赔记录
    """
    anomalies = []
    
    # 提取已索赔的运单号
    claimed_tracking = set()
    for cr in claim_records:
        tracking = str(cr.get("tracking_no", "") or cr.get("waybill", "")).strip()
        if tracking:
            claimed_tracking.add(tracking)
    
    for i, record in enumerate(logistics_records):
        status = str(record.get("status", "") or record.get("logistics_status", "")).lower()
        tracking = str(record.get("tracking_no", "") or record.get("waybill", "")).strip()
        
        # 检测丢件状态
        lost_keywords = ["丢", "丢失", "查无", "找不到", "损毁", "破损", "丢失"]
        is_lost = any(kw in status for kw in lost_keywords)
        
        # 特殊：已赔偿的也算已处理
        is_claimed = tracking in claimed_tracking or "赔" in status or "已处理" in status
        
        if is_lost and not is_claimed and tracking:
            cargo_value = record.get("cargo_value", record.get("goods_value", record.get("declared_value", 0)))
            weight = record.get("weight", 0)
            
            # 计算预估赔偿：货物价值 vs 运费×3（取低者）
            shipping_fee = record.get("shipping_fee", record.get("freight", 0))
            estimated_min = min(float(cargo_value or 0), float(shipping_fee or 0) * 3)
            estimated = max(estimated_min, float(shipping_fee or 0))  # 至少赔运费
            
            anomalies.append(Anomaly(
                anomaly_id=f"LOST-{i:04d}",
                type="lost_package",
                severity="high",
                title=f"物流丢件未索赔: {tracking}",
                description=(
                    f"运单 {tracking} 状态为丢件/丢失，但未发现索赔申请。\n"
                    f"货物价值: ¥{cargo_value}\n"
                    f"运费: ¥{shipping_fee}\n"
                    f"重量: {weight}kg\n"
                    f"丢件日期: {record.get('update_time', record.get('date', 'unknown'))}\n"
                    f"预估最低可赔: ¥{estimated:.0f}"
                ),
                affected_records=[record],
                estimated_recovery=estimated,
                evidence={
                    "rule": "lost_package_unclaimed",
                    "tracking_no": tracking,
                    "logistics_status": status,
                    "claimed": False,
                    "cargo_value": cargo_value,
                    "shipping_fee": shipping_fee
                }
            ))
    
    return anomalies


# ============================================
# 规则3：延误未申请赔偿
# ============================================
def detect_delay_claims(logistics_records: List[Dict],
                         claim_records: List[Dict],
                         sla_days: int = 7) -> List[Anomaly]:
    """
    检测到件延误且未申请延误赔偿
    核心逻辑：实际时效 > SLA + 未赔偿
    """
    anomalies = []
    
    claimed_tracking = set()
    for cr in claim_records:
        t = str(cr.get("tracking_no", "") or cr.get("waybill", "")).strip()
        claim_type = str(cr.get("claim_type", ""))
        if t and ("延误" in claim_type or "delay" in claim_type.lower()):
            claimed_tracking.add(t)
    
    for i, record in enumerate(logistics_records):
        tracking = str(record.get("tracking_no", "") or record.get("waybill", "")).strip()
        if not tracking or tracking in claimed_tracking:
            continue
        
        promised_days = record.get("promised_days", record.get("sla_days", sla_days))
        actual_days = record.get("actual_days", record.get("transit_days", 0))
        
        # 判断延误
        is_delayed = False
        if actual_days and promised_days:
            try:
                is_delayed = float(actual_days) > float(promised_days)
            except:
                pass
        
        # 检查状态关键词
        status = str(record.get("status", "")).lower()
        delay_keywords = ["延误", "超时", "延迟", "delay", "late"]
        if not is_delayed and any(kw in status for kw in delay_keywords):
            is_delayed = True
        
        if is_delayed:
            shipping_fee = float(record.get("shipping_fee", record.get("freight", 0)) or 0)
            # 延误赔偿通常为运费30-50%
            estimated = shipping_fee * 0.3
            
            anomalies.append(Anomaly(
                anomaly_id=f"DELAY-{i:04d}",
                type="delay_claim",
                severity="medium",
                title=f"物流延误未索赔: {tracking}",
                description=(
                    f"运单 {tracking} 存在延误，但未申请延误赔偿。\n"
                    f"承诺时效: {promised_days}天\n"
                    f"实际时效: {actual_days}天\n"
                    f"延误天数: {float(actual_days) - float(promised_days):.0f}天\n"
                    f"运费: ¥{shipping_fee}\n"
                    f"预估可赔(30%): ¥{estimated:.0f}"
                ),
                affected_records=[record],
                estimated_recovery=estimated,
                evidence={
                    "rule": "delay_unclaimed",
                    "tracking_no": tracking,
                    "promised_days": promised_days,
                    "actual_days": actual_days,
                    "shipping_fee": shipping_fee
                }
            ))
    
    return anomalies


# ============================================
# 规则4：退款未到账检测
# ============================================
def detect_missing_refunds(order_records: List[Dict],
                            refund_records: List[Dict],
                            settlement_records: List[Dict] = None) -> List[Anomaly]:
    """
    检测已退款但结算中未退回
    核心逻辑：退款记录中有，但结算记录中没有对应的退款项
    """
    anomalies = []
    
    # 提取已结算的退款订单号
    settled_refund_orders = set()
    if settlement_records:
        for sr in settlement_records:
            order_id = str(sr.get("order_id", "") or sr.get("order_no", "")).strip()
            trans_type = str(sr.get("type", "") or sr.get("transaction_type", "")).lower()
            if order_id and ("退" in trans_type or "refund" in trans_type.lower()):
                settled_refund_orders.add(order_id)
    
    for i, refund in enumerate(refund_records):
        order_id = str(refund.get("order_id", "") or refund.get("order_no", "")).strip()
        refund_status = str(refund.get("status", "")).lower()
        
        # 只关注已完成的退款
        is_completed = "完成" in refund_status or "success" in refund_status or "成功" in refund_status
        if not is_completed and refund_status:
            continue
        
        # 检查是否已计入结算
        if order_id and order_id not in settled_refund_orders:
            refund_amount = float(refund.get("amount", refund.get("refund_amount", 0)) or 0)
            
            anomalies.append(Anomaly(
                anomaly_id=f"REF-{i:04d}",
                type="missing_refund",
                severity="critical",
                title=f"退款未到账: {order_id}",
                description=(
                    f"订单 {order_id} 已完成退款，但结算记录中未找到对应退款项。\n"
                    f"退款金额: ¥{refund_amount}\n"
                    f"退款完成时间: {refund.get('refund_time', refund.get('complete_time', 'unknown'))}\n"
                    f"退款原因: {refund.get('reason', 'unknown')}\n"
                    f"平台/渠道: {refund.get('channel', 'unknown')}\n"
                    f"预估可追回: ¥{refund_amount}"
                ),
                affected_records=[refund],
                estimated_recovery=refund_amount,
                evidence={
                    "rule": "missing_settlement_refund",
                    "order_id": order_id,
                    "refund_amount": refund_amount,
                    "refund_status": refund_status,
                    "found_in_settlement": False
                }
            ))
    
    return anomalies


# ============================================
# 规则5：订单-结算金额不一致
# ============================================
def detect_settlement_mismatch(order_records: List[Dict],
                                settlement_records: List[Dict],
                                tolerance: float = 0.01) -> List[Anomaly]:
    """
    检测订单实收金额与结算金额不一致
    核心逻辑：order.settlement_amount ≠ settlement.actual_amount
    """
    anomalies = []
    
    # 建立订单→结算的映射
    order_amounts = {}
    for o in order_records:
        order_id = str(o.get("order_id", "") or o.get("order_no", "")).strip()
        amount = float(o.get("settlement_amount", o.get("actual_amount", o.get("total", 0))) or 0)
        if order_id:
            order_amounts[order_id] = amount
    
    for i, sr in enumerate(settlement_records):
        order_id = str(sr.get("order_id", "") or sr.get("order_no", "")).strip()
        actual_amount = float(sr.get("actual_amount", sr.get("settlement_amount", sr.get("amount", 0))) or 0)
        
        if not order_id or order_id not in order_amounts:
            continue
        
        expected = order_amounts[order_id]
        diff = actual_amount - expected
        
        # 差异超过容差（默认0.01元）
        if abs(diff) > tolerance:
            severity = "critical" if abs(diff) > 100 else ("high" if abs(diff) > 10 else "medium")
            
            anomalies.append(Anomaly(
                anomaly_id=f"MISM-{i:04d}",
                type="settlement_mismatch",
                severity=severity,
                title=f"结算不一致: {order_id}",
                description=(
                    f"订单 {order_id} 的结算金额存在差异。\n"
                    f"订单应收: ¥{expected:.2f}\n"
                    f"结算实收: ¥{actual_amount:.2f}\n"
                    f"差额: ¥{diff:+.2f}\n"
                    f"差异类型: {'少收' if diff < 0 else '多收'}\n"
                    f"预估可追回: ¥{abs(diff):.2f}"
                ),
                affected_records=[sr],
                estimated_recovery=abs(diff),
                evidence={
                    "rule": "settlement_mismatch",
                    "order_id": order_id,
                    "expected_amount": expected,
                    "actual_amount": actual_amount,
                    "difference": diff
                }
            ))
    
    return anomalies


# ============================================
# 统一审计入口
# ============================================
class RecoveryEngine:
    """审计引擎 - 运行全部规则"""
    
    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.rules_run = []
        self.anomalies: List[Anomaly] = []
    
    def run_audit(self, 
                   customer_id: str,
                   orders: List[Dict] = None,
                   settlements: List[Dict] = None,
                   logistics: List[Dict] = None,
                   refunds: List[Dict] = None,
                   claims: List[Dict] = None) -> AuditResult:
        """运行完整审计"""
        
        audit_id = f"A-{datetime.now().strftime('%Y%m%d%H%M')}-{customer_id[:6]}"
        self.anomalies = []
        
        # 运行所有规则
        # 规则1：重复扣费
        if settlements:
            dup_anomalies = detect_duplicate_charges(settlements)
            self.anomalies.extend(dup_anomalies)
            self.rules_run.append(("duplicate_charges", len(dup_anomalies)))
        
        # 规则2-3：物流异常
        if logistics:
            lost_anomalies = detect_lost_package_claims(logistics, claims or [])
            delay_anomalies = detect_delay_claims(logistics, claims or [])
            self.anomalies.extend(lost_anomalies)
            self.rules_run.extend([
                ("lost_package", len(lost_anomalies)),
                ("delay_claims", len(delay_anomalies))
            ])
        
        # 规则4：退款异常
        if refunds:
            refund_anomalies = detect_missing_refunds(orders or [], refunds, settlements)
            self.anomalies.extend(refund_anomalies)
            self.rules_run.append(("missing_refunds", len(refund_anomalies)))
        
        # 规则5：结算不一致
        if orders and settlements:
            mismatch_anomalies = detect_settlement_mismatch(orders, settlements)
            self.anomalies.extend(mismatch_anomalies)
            self.rules_run.append(("settlement_mismatch", len(mismatch_anomalies)))
        
        # 汇总
        total_records = sum(len(x) for x in [orders, settlements, logistics, refunds, claims] if x)
        
        type_summary = {}
        for a in self.anomalies:
            t = a.type
            if t not in type_summary:
                type_summary[t] = {"count": 0, "total_recovery": 0.0}
            type_summary[t]["count"] += 1
            type_summary[t]["total_recovery"] += a.estimated_recovery
        
        result = AuditResult(
            audit_id=audit_id,
            customer_id=customer_id,
            source_files=[],
            total_records=total_records,
            anomalies=self.anomalies,
            summary={
                "rules_run": self.rules_run,
                "total_anomalies": len(self.anomalies),
                "total_recovery": self.total_estimated_recovery,
                "by_type": type_summary,
                "run_at": datetime.now().isoformat()
            }
        )
        
        return result
    
    @property
    def total_estimated_recovery(self) -> float:
        return sum(a.estimated_recovery for a in self.anomalies if a.status != "rejected")
