#!/usr/bin/env python3
"""
前沿信号 - 邮件发送器
读取当日日报并通过 SMTP 发送给配置的收件人
"""

import os
import sys
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from pathlib import Path

try:
    import yaml
except ImportError:
    print("[ERROR] 缺少 PyYAML 库，请运行: pip install pyyaml")
    sys.exit(1)

# 路径配置 - 使用 pathlib 实现跨平台兼容
BASE_DIR = Path(__file__).resolve().parent.parent
REPORTS_DIR = BASE_DIR / "reports"
CONFIG_DIR = BASE_DIR / "config"
EMAIL_CONFIG_FILE = CONFIG_DIR / "email_config.yaml"

# 确保目录存在
CONFIG_DIR.mkdir(exist_ok=True)


# 默认配置文件内容
DEFAULT_EMAIL_CONFIG = """# 前沿信号 - 邮件配置
# 收件人列表（逗号分隔多个地址）
recipients:
  - "your-email@example.com"

# 邮件主题前缀
subject_prefix: "[前沿信号]"

# 发件人显示名称
sender_name: "前沿信号日报"

# SMTP 配置说明：
# 推荐使用应用专用密码（非登录密码）
# Gmail: 开启两步验证后生成应用密码
# QQ邮箱: 使用授权码
# 163邮箱: 使用授权码
"""


def create_default_config():
    """创建默认配置文件（如果不存在）"""
    if not EMAIL_CONFIG_FILE.exists():
        with open(EMAIL_CONFIG_FILE, "w", encoding="utf-8") as f:
            f.write(DEFAULT_EMAIL_CONFIG)
        print(f"[CONFIG] 已创建默认邮件配置: {EMAIL_CONFIG_FILE}")
        print("[CONFIG] 请编辑该文件设置收件人地址")
    return True


def load_email_config():
    """加载邮件配置"""
    if not EMAIL_CONFIG_FILE.exists():
        create_default_config()
        return None

    with open(EMAIL_CONFIG_FILE, "r", encoding="utf-8") as f:
        config = yaml.safe_load(f)

    if not config:
        return None

    recipients = config.get("recipients", [])
    if not recipients or recipients == ["your-email@example.com"]:
        print("[WARN] 收件人未配置，请编辑 config/email_config.yaml")
        return None

    return config


def get_smtp_config():
    """从环境变量获取 SMTP 配置"""
    smtp_host = os.environ.get("SMTP_HOST", "")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    use_tls = os.environ.get("SMTP_TLS", "true").lower() in ("true", "1", "yes")

    if not smtp_host:
        print("[ERROR] 未设置 SMTP_HOST 环境变量")
        return None

    if not smtp_user or not smtp_pass:
        print("[ERROR] 未设置 SMTP_USER 或 SMTP_PASS 环境变量")
        return None

    return {
        "host": smtp_host,
        "port": smtp_port,
        "user": smtp_user,
        "password": smtp_pass,
        "use_tls": use_tls,
    }


def find_latest_report():
    """查找最新的日报文件"""
    date_str = datetime.now().strftime("%Y-%m-%d")
    report_file = REPORTS_DIR / f"daily_{date_str}.md"

    if report_file.exists():
        return report_file

    # 如果今天的报告不存在，尝试找最近的报告
    reports = sorted(REPORTS_DIR.glob("daily_*.md"), reverse=True)
    if reports:
        print(f"[WARN] 今日报告不存在，使用最近的报告: {reports[0].name}")
        return reports[0]

    return None


def read_report(report_path):
    """读取报告内容"""
    with open(report_path, "r", encoding="utf-8") as f:
        return f.read()


def send_email(smtp_config, recipients, subject, body, sender_name="前沿信号日报"):
    """通过 SMTP 发送邮件"""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{sender_name} <{smtp_config['user']}>"
    msg["To"] = ", ".join(recipients)

    # 添加纯文本和 HTML 版本
    text_part = MIMEText(body, "plain", "utf-8")
    msg.attach(text_part)

    try:
        if smtp_config["use_tls"]:
            server = smtplib.SMTP(smtp_config["host"], smtp_config["port"], timeout=30)
            server.starttls()
        else:
            server = smtplib.SMTP_SSL(smtp_config["host"], smtp_config["port"], timeout=30)

        server.login(smtp_config["user"], smtp_config["password"])
        server.sendmail(smtp_config["user"], recipients, msg.as_string())
        server.quit()

        print(f"[OK] 邮件发送成功 -> {', '.join(recipients)}")
        return True

    except smtplib.SMTPAuthenticationError:
        print("[ERROR] SMTP 认证失败，请检查用户名和密码")
        print("[HINT] 大多数邮箱需要使用授权码/应用专用密码，而非登录密码")
        return False
    except smtplib.SMTPConnectError:
        print(f"[ERROR] 无法连接到 SMTP 服务器: {smtp_config['host']}:{smtp_config['port']}")
        return False
    except Exception as e:
        print(f"[ERROR] 邮件发送失败: {e}")
        return False


def main():
    print("=" * 60)
    print("前沿信号 - 邮件发送器 v1.0")
    print(f"运行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 1. 获取 SMTP 配置
    smtp_config = get_smtp_config()
    if smtp_config is None:
        print("[EXIT] SMTP 未配置，跳过邮件发送")
        print("[HINT] 设置环境变量: SMTP_HOST, SMTP_USER, SMTP_PASS")
        sys.exit(0)

    # 2. 加载邮件配置
    email_config = load_email_config()
    if email_config is None:
        print("[EXIT] 邮件配置无效，跳过发送")
        sys.exit(0)

    recipients = email_config.get("recipients", [])
    subject_prefix = email_config.get("subject_prefix", "[前沿信号]")
    sender_name = email_config.get("sender_name", "前沿信号日报")

    # 3. 查找并读取报告
    report_path = find_latest_report()
    if report_path is None:
        print("[ERROR] 未找到日报文件，请先生成日报")
        sys.exit(1)

    report_content = read_report(report_path)
    date_str = report_path.stem.replace("daily_", "")

    # 4. 构建邮件主题
    subject = f"{subject_prefix} 每日情报 {date_str}"

    # 5. 发送邮件
    success = send_email(
        smtp_config=smtp_config,
        recipients=recipients,
        subject=subject,
        body=report_content,
        sender_name=sender_name,
    )

    if success:
        print(f"\n[完成] 日报已发送至 {len(recipients)} 位收件人")
    else:
        print("\n[失败] 邮件发送失败")
        sys.exit(1)


if __name__ == "__main__":
    main()
