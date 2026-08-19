"""数据库模型"""
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Enum, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import enum

from .config import DATABASE_URL, FREE_CREDITS_ON_REGISTER, FREE_DAILY_CREDITS

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


class TaskStatus(str, enum.Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    credits = Column(Integer, default=FREE_CREDITS_ON_REGISTER)
    total_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_free_credit = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)


class CreditOrder(Base):
    __tablename__ = "credit_orders"
    id = Column(Integer, primary_key=True)
    order_no = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    package_key = Column(String(32), nullable=False)
    credits = Column(Integer, nullable=False)
    price_rmb = Column(Float, nullable=False)
    status = Column(String(16), default=OrderStatus.PENDING.value)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class TryonTask(Base):
    __tablename__ = "tryon_tasks"
    id = Column(Integer, primary_key=True)
    task_id = Column(String(64), unique=True, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    status = Column(String(16), default=TaskStatus.QUEUED.value)
    person_image = Column(String(256), nullable=False)
    cloth_image = Column(String(256), nullable=False)
    garment_type = Column(String(16), default="upperbody")  # upperbody / lowerbody / dress
    result_image = Column(String(256), nullable=True)
    error_msg = Column(Text, nullable=True)
    credits_charged = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    finished_at = Column(DateTime, nullable=True)


class CreditLog(Base):
    __tablename__ = "credit_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False, index=True)
    amount = Column(Integer, nullable=False)  # 正=充值/赠送, 负=消费
    reason = Column(String(64), nullable=False)  # register / recharge / tryon / daily_free
    ref_id = Column(String(64), nullable=True)  # 关联订单或任务
    balance_after = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def add_credits(db, user: User, amount: int, reason: str, ref_id: str = None):
    """原子性加/扣积分并写日志"""
    user.credits += amount
    if amount < 0:
        user.total_used += abs(amount)
    log = CreditLog(
        user_id=user.id, amount=amount, reason=reason,
        ref_id=ref_id, balance_after=user.credits
    )
    db.add(log)
    db.commit()
    return user.credits


def try_claim_daily_free(db, user: User) -> bool:
    """尝试领取每日免费积分，24h限一次"""
    now = datetime.utcnow()
    if now - user.last_free_credit >= timedelta(hours=24):
        add_credits(db, user, FREE_DAILY_CREDITS, "daily_free")
        user.last_free_credit = now
        db.commit()
        return True
    return False
