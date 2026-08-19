"""
虚拟试穿 SaaS —— FastAPI 主服务
"""
import uuid
import shutil
import threading
import time
from pathlib import Path
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Header, status
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import hashlib

from .models import (
    init_db, get_db, User, CreditOrder, TryonTask, CreditLog,
    add_credits, try_claim_daily_free,
)
from .config import (
    JWT_SECRET, JWT_EXPIRE_HOURS, CREDITS_PER_GENERATION,
    UPLOAD_DIR, OUTPUT_DIR, STATIC_DIR,
    MAX_UPLOAD_MB, ALLOWED_IMAGE_TYPES, CREDIT_PACKAGES,
    FREE_CREDITS_ON_REGISTER,
)
from .product_modules import ModelGenerator, SceneGenerator, CopywritingEngine, VideoWorkflow
from .inference import get_engine

app = FastAPI(title="VTON 虚拟试穿 SaaS", version="0.1.0")
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== 后台任务队列 =====
_task_queue: list[str] = []
_queue_lock = threading.Lock()
_worker_running = False


# ------------------------------------------------------------------
#  密码哈希 (生产级应使用 bcrypt/passlib)
# ------------------------------------------------------------------
def _hash_pw(password: str) -> str:
    return hashlib.sha256((password + JWT_SECRET).encode()).hexdigest()


# ------------------------------------------------------------------
#  鉴权
# ------------------------------------------------------------------
class SignupBody(BaseModel):
    username: str
    password: str


class LoginBody(BaseModel):
    username: str
    password: str


class UserInfo(BaseModel):
    id: int
    username: str
    credits: int
    total_used: int

    class Config:
        from_attributes = True


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)) -> User:
    """从 Authorization: Bearer xxx 解析用户"""
    if not authorization:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "缺少认证头")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "认证格式错误")
    try:
        import json, base64
        payload = json.loads(base64.b64decode(token + "=="))
        user_id = payload["uid"]
    except Exception:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "token 无效")
    user = db.query(User).get(user_id)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "用户不存在")
    return user


# ===== 产品扩展 API (模特/场景/文案/工作流) =====
@app.get("/api/models")
def list_models():
    return ModelGenerator.get_preset_models()


@app.get("/api/scenes")
def list_scenes():
    return SceneGenerator().get_preset_scenes()


@app.post("/api/copywriting")
def gen_copy(data: dict, user=Depends(get_current_user)):
    eng = CopywritingEngine()
    return eng.generate_copy(
        data.get("name", ""),
        data.get("desc", ""),
        data.get("platform", "xiaohongshu"),
        data.get("tone", "professional"),
    )


@app.post("/api/workflow")
def create_workflow(data: dict, user=Depends(get_current_user)):
    wf = VideoWorkflow()
    brief = wf.create_video_brief(data.get("images", []), data.get("product_name", ""))
    return brief


def _make_token(user_id: int) -> str:
    import json, base64
    payload = {"uid": user_id, "exp": int(time.time()) + JWT_EXPIRE_HOURS * 3600}
    return base64.b64encode(json.dumps(payload).encode()).decode()


# ------------------------------------------------------------------
#  初始化
# ------------------------------------------------------------------
@app.on_event("startup")
def startup():
    init_db()
    _start_worker()


# ------------------------------------------------------------------
#  用户 API
# ------------------------------------------------------------------
@app.post("/api/signup")
def signup(body: SignupBody, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "用户名已存在")
    pwd_hash = _hash_pw(body.password)
    user = User(username=body.username, password_hash=pwd_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    add_credits(db, user, FREE_CREDITS_ON_REGISTER, "register")
    return {"token": _make_token(user.id), "user": UserInfo.model_validate(user).model_dump()}


@app.post("/api/login")
def login(body: LoginBody, db: Session = Depends(get_db)):
    pwd_hash = _hash_pw(body.password)
    user = db.query(User).filter(
        User.username == body.username,
        User.password_hash == pwd_hash,
    ).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "用户名或密码错误")
    return {"token": _make_token(user.id), "user": UserInfo.model_validate(user).model_dump()}


@app.get("/api/me")
def me(user: User = Depends(get_current_user)):
    return UserInfo.model_validate(user)


@app.post("/api/claim_daily")
def claim_daily(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    ok = try_claim_daily_free(db, user)
    return {"claimed": ok, "credits": user.credits}


# ------------------------------------------------------------------
#  积分 / 充值
# ------------------------------------------------------------------
@app.get("/api/packages")
def packages():
    return CREDIT_PACKAGES


@app.post("/api/order")
def create_order(pkg: str, user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)):
    if pkg not in CREDIT_PACKAGES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "未知套餐")
    info = CREDIT_PACKAGES[pkg]
    order_no = f"VT{datetime.now():%Y%m%d%H%M%S}{user.id:05d}{uuid.uuid4().hex[:6]}"
    order = CreditOrder(
        order_no=order_no, user_id=user.id, package_key=pkg,
        credits=info["credits"], price_rmb=info["price_rmb"],
    )
    db.add(order)
    db.commit()
    return {
        "order_no": order_no,
        "package": pkg,
        "credits": info["credits"],
        "price_rmb": info["price_rmb"],
        "label": info["label"],
        "tip": "测试模式: 直接调用 /api/order/{order_no}/pay 模拟支付到账",
    }


@app.post("/api/order/{order_no}/pay")
def pay_order(order_no: str, user: User = Depends(get_current_user),
              db: Session = Depends(get_db)):
    """模拟支付回调——直接入账积分"""
    order = db.query(CreditOrder).filter(
        CreditOrder.order_no == order_no,
        CreditOrder.user_id == user.id,
    ).first()
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "订单不存在")
    if order.status == "paid":
        return {"credits": user.credits, "msg": "订单已支付过"}
    user = db.query(User).get(user.id)
    add_credits(db, user, order.credits, "recharge", ref_id=order_no)
    order.status = "paid"
    order.paid_at = datetime.utcnow()
    db.commit()
    return {"credits": user.credits, "added": order.credits}


@app.get("/api/credit_logs")
def credit_logs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    logs = db.query(CreditLog).filter(CreditLog.user_id == user.id) \
        .order_by(CreditLog.created_at.desc()).limit(50).all()
    return [{
        "amount": l.amount, "reason": l.reason,
        "balance": l.balance_after, "time": l.created_at.isoformat(),
    } for l in logs]


# ------------------------------------------------------------------
#  试穿 API
# ------------------------------------------------------------------
@app.post("/api/tryon")
async def tryon(
    person_image: UploadFile = File(...),
    cloth_image: UploadFile = File(...),
    garment_type: str = Form("upperbody"),
    seed: int = Form(-1),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 检查积分
    if user.credits < CREDITS_PER_GENERATION:
        raise HTTPException(
            status.HTTP_402_PAYMENT_REQUIRED,
            f"积分不足, 需要 {CREDITS_PER_GENERATION}, 当前 {user.credits}",
        )

    # 校验文件
    for f in (person_image, cloth_image):
        if f.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, f"不支持的图片格式: {f.content_type}")

    # 保存文件
    task_id = uuid.uuid4().hex[:12]
    task_dir = UPLOAD_DIR / task_id
    task_dir.mkdir(parents=True, exist_ok=True)
    person_path = task_dir / "person.jpg"
    cloth_path = task_dir / "cloth.jpg"

    with open(person_path, "wb") as fp:
        shutil.copyfileobj(person_image.file, fp)
    with open(cloth_path, "wb") as fp:
        shutil.copyfileobj(cloth_image.file, fp)

    # 创建任务
    task = TryonTask(
        task_id=task_id, user_id=user.id,
        person_image=str(person_path), cloth_image=str(cloth_path),
        garment_type=garment_type, status="queued",
    )
    db.add(task)
    # 扣积分
    add_credits(db, user, -CREDITS_PER_GENERATION, "tryon", ref_id=task_id)
    task.credits_charged = CREDITS_PER_GENERATION
    db.commit()

    # 入队
    with _queue_lock:
        _task_queue.append(task_id)

    return {"task_id": task_id, "credits_left": user.credits}


@app.get("/api/tryon/{task_id}")
def get_task(task_id: str, user: User = Depends(get_current_user),
             db: Session = Depends(get_db)):
    task = db.query(TryonTask).filter(
        TryonTask.task_id == task_id, TryonTask.user_id == user.id,
    ).first()
    if not task:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "任务不存在")
    return {
        "task_id": task.task_id,
        "status": task.status,
        "garment_type": task.garment_type,
        "result_image": f"/api/image/{task.task_id}" if task.result_image else None,
        "error_msg": task.error_msg,
        "created_at": task.created_at.isoformat(),
        "finished_at": task.finished_at.isoformat() if task.finished_at else None,
    }


@app.get("/api/image/{task_id}")
def get_image(task_id: str, db: Session = Depends(get_db)):
    task = db.query(TryonTask).filter(TryonTask.task_id == task_id).first()
    if not task or not task.result_image or not Path(task.result_image).exists():
        raise HTTPException(status.HTTP_404_NOT_FOUND, "图片不存在")
    return FileResponse(task.result_image, media_type="image/png")


@app.get("/api/tasks")
def list_tasks(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(TryonTask).filter(TryonTask.user_id == user.id) \
        .order_by(TryonTask.created_at.desc()).limit(20).all()
    return [{
        "task_id": t.task_id, "status": t.status,
        "garment_type": t.garment_type,
        "result": f"/api/image/{t.task_id}" if t.result_image else None,
    } for t in tasks]


# ------------------------------------------------------------------
#  后台工作线程
# ------------------------------------------------------------------
def _worker():
    """后台消费任务队列"""
    while True:
        task_id = None
        with _queue_lock:
            if _task_queue:
                task_id = _task_queue.pop(0)
        if task_id is None:
            time.sleep(0.5)
            continue

        db = next(get_db())
        task = db.query(TryonTask).filter(TryonTask.task_id == task_id).first()
        if not task:
            continue
        task.status = "processing"
        db.commit()

        try:
            engine = get_engine()
            result_path = engine.generate(
                task.person_image, task.cloth_image,
                garment_type=task.garment_type,
            )
            task.result_image = result_path
            task.status = "done"
            task.finished_at = datetime.utcnow()
            print(f"[Worker] 任务 {task_id} 完成 → {result_path}")
        except Exception as e:
            task.status = "failed"
            task.error_msg = str(e)
            print(f"[Worker] 任务 {task_id} 失败: {e}")
        finally:
            db.commit()
            db.close()


def _start_worker():
    global _worker_running
    if _worker_running:
        return
    _worker_running = True
    t = threading.Thread(target=_worker, daemon=True, name="vton-worker")
    t.start()
    print("[Worker] 后台消费者已启动")


#  首页
@app.get("/", response_class=HTMLResponse)
def index():
    with open(STATIC_DIR / "index.html", encoding="utf-8") as fp:
        return fp.read()
