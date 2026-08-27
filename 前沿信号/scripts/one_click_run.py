#!/usr/bin/env python3
"""
前沿信号 - 一键运行流水线
Single command pipeline: collect → generate report → optionally send email

用法 Usage:
    python scripts/one_click_run.py
    python scripts/one_click_run.py --date 2026-08-28
    python scripts/one_click_run.py --email
    python scripts/one_click_run.py --verbose
    python scripts/one_click_run.py --date 2026-08-28 --email --verbose
"""

import os
import sys
import argparse
import subprocess
import time
from datetime import datetime
from pathlib import Path

# 路径配置
BASE_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = BASE_DIR / "scripts"
DATA_DIR = BASE_DIR / "data"
REPORTS_DIR = BASE_DIR / "reports"

# 确保目录存在
REPORTS_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)


class Colors:
    """终端颜色代码"""
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    END = '\033[0m'


def supports_color():
    """检测终端是否支持颜色"""
    if os.name == 'nt':
        return os.environ.get('TERM') or os.environ.get('WT_SESSION')
    return hasattr(sys.stdout, 'isatty') and sys.stdout.isatty()


def cprint(text, color=None, bold=False):
    """带颜色的打印输出"""
    if supports_color() and color:
        prefix = Colors.BOLD if bold else ""
        print(f"{prefix}{color}{text}{Colors.END}")
    else:
        print(f"{'** ' if bold else ''}{text}")


def print_stage(stage_num, total, title):
    """打印阶段分隔线"""
    print()
    cprint(f"[{stage_num}/{total}] {title}", Colors.CYAN, bold=True)
    cprint("-" * 50, Colors.DIM)


def print_success(text):
    cprint(f"  ✓ {text}", Colors.GREEN)


def print_warning(text):
    cprint(f"  ⚠ {text}", Colors.YELLOW)


def print_error(text):
    cprint(f"  ✗ {text}", Colors.RED)


def print_info(text):
    cprint(f"  ℹ {text}", Colors.BLUE)


def run_script(script_name, args=None, verbose=False):
    """
    运行指定的脚本，返回 (success, stdout, stderr)
    """
    script_path = SCRIPTS_DIR / script_name
    if not script_path.exists():
        return False, "", f"脚本不存在: {script_path}"

    cmd = [sys.executable, str(script_path)]
    if args:
        cmd.extend(args)

    try:
        result = subprocess.run(
            cmd,
            cwd=str(BASE_DIR),
            capture_output=True,
            text=True,
            timeout=120  # 2分钟超时
        )

        if verbose and result.stdout:
            for line in result.stdout.strip().split('\n'):
                print(f"    {line}")

        if result.returncode != 0:
            return False, result.stdout, result.stderr

        return True, result.stdout, result.stderr

    except subprocess.TimeoutExpired:
        return False, "", f"脚本执行超时: {script_name}"
    except Exception as e:
        return False, "", str(e)


def stage_collect(date_str=None, verbose=False):
    """阶段1: 数据采集"""
    print_stage(1, 3, "数据采集 Data Collection")

    args = []
    if date_str:
        args.append(date_str)

    success, stdout, stderr = run_script("collector.py", args, verbose)

    if success:
        # 解析采集结果
        for line in stdout.split('\n'):
            if '去重文章' in line or '完成' in line:
                print_success(line.strip())
                break
        else:
            print_success("数据采集完成")
        return True
    else:
        print_error("数据采集失败")
        if stderr:
            print_error(stderr.strip())
        return False


def stage_generate_report(date_str=None, verbose=False):
    """阶段2: 生成报告"""
    print_stage(2, 3, "生成日报 Report Generation")

    # 检查原始数据是否存在
    if date_str:
        data_file = DATA_DIR / f"raw_{date_str}.json"
    else:
        today = datetime.now().strftime("%Y-%m-%d")
        data_file = DATA_DIR / f"raw_{today}.json"

    if not data_file.exists():
        print_warning(f"原始数据文件不存在: {data_file}")
        print_info("尝试使用最近的数据文件...")

        # 查找最近的数据文件
        data_files = sorted(DATA_DIR.glob("raw_*.json"), reverse=True)
        if data_files:
            print_info(f"使用: {data_file.name}")
        else:
            print_error("没有找到任何原始数据文件")
            print_info("请先运行 collector.py 采集数据")
            return False

    args = []
    if date_str:
        args.append(date_str)

    success, stdout, stderr = run_script("report_generator.py", args, verbose)

    if success:
        for line in stdout.split('\n'):
            if '日报生成完毕' in line or '完成' in line:
                print_success(line.strip())
                break
        else:
            print_success("日报生成完成")

        # 显示报告路径
        if date_str:
            report_file = REPORTS_DIR / f"daily_{date_str}.md"
        else:
            today = datetime.now().strftime("%Y-%m-%d")
            report_file = REPORTS_DIR / f"daily_{today}.md"

        if report_file.exists():
            print_info(f"报告路径: {report_file}")
        return True
    else:
        print_error("日报生成失败")
        if stderr:
            print_error(stderr.strip())
        return False


def stage_send_email(verbose=False):
    """阶段3: 发送邮件 (可选)"""
    print_stage(3, 3, "发送邮件 Email Delivery")

    # 检查SMTP配置
    smtp_host = os.environ.get("SMTP_HOST", "")
    if not smtp_host:
        print_warning("SMTP 未配置，跳过邮件发送")
        print_info("设置环境变量 SMTP_HOST, SMTP_USER, SMTP_PASS 启用邮件功能")
        return True  # 不视为失败

    # 检查邮件配置文件
    email_config = BASE_DIR / "config" / "email_config.yaml"
    if not email_config.exists():
        print_warning("邮件配置文件不存在，跳过邮件发送")
        print_info("运行 email_sender.py 创建默认配置")
        return True

    success, stdout, stderr = run_script("email_sender.py", None, verbose)

    if success:
        for line in stdout.split('\n'):
            if '发送成功' in line or '完成' in line:
                print_success(line.strip())
                break
        else:
            print_success("邮件发送完成")
        return True
    else:
        print_warning("邮件发送失败（非致命错误）")
        if stderr and "未配置" in stderr:
            print_info("SMTP 未配置，跳过")
        return True  # 邮件发送失败不终止流程


def print_summary(start_time, stages_ok, date_str):
    """打印执行摘要"""
    elapsed = time.time() - start_time
    today = date_str or datetime.now().strftime("%Y-%m-%d")

    print()
    cprint("=" * 50, Colors.CYAN)
    cprint("执行摘要 Execution Summary", Colors.CYAN, bold=True)
    cprint("=" * 50, Colors.CYAN)
    print()

    # 各阶段状态
    stage_names = [
        ("数据采集 Data Collection", stages_ok.get("collect", False)),
        ("日报生成 Report Generation", stages_ok.get("report", False)),
        ("邮件发送 Email Delivery", stages_ok.get("email", False)),
    ]

    for name, ok in stage_names:
        status = "✓ 成功 OK" if ok else "✗ 失败 FAIL"
        color = Colors.GREEN if ok else Colors.RED
        cprint(f"  {name}: {status}", color)

    print()
    cprint(f"  日期 Date: {today}", Colors.BLUE)
    cprint(f"  耗时 Duration: {elapsed:.1f}s", Colors.BLUE)

    # 输出文件
    data_file = DATA_DIR / f"raw_{today}.json"
    report_file = REPORTS_DIR / f"daily_{today}.md"

    print()
    cprint("  输出文件 Output Files:", Colors.BOLD)
    if data_file.exists():
        size = data_file.stat().st_size
        print(f"    数据: {data_file} ({size/1024:.1f}KB)")
    if report_file.exists():
        size = report_file.stat().st_size
        print(f"    报告: {report_file} ({size/1024:.1f}KB)")

    print()
    all_ok = all(ok for _, ok in stage_names)
    if all_ok:
        cprint("  ✓ 全部完成 All stages completed successfully!", Colors.GREEN, bold=True)
    else:
        cprint("  ⚠ 部分阶段失败，请检查上方日志", Colors.YELLOW, bold=True)

    print()


def main():
    """主函数"""
    parser = argparse.ArgumentParser(
        description="前沿信号 - 一键运行流水线 | Frontier Signals Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例 Examples:
  python scripts/one_click_run.py                     # 运行完整流程
  python scripts/one_click_run.py --date 2026-08-28   # 指定日期
  python scripts/one_click_run.py --email             # 包含邮件发送
  python scripts/one_click_run.py --verbose           # 显示详细输出
  python scripts/one_click_run.py --skip-collect      # 跳过采集（使用已有数据）
  python scripts/one_click_run.py --skip-email        # 跳过邮件发送
        """
    )

    parser.add_argument(
        "--date",
        type=str,
        default=None,
        help="指定日期 (格式: YYYY-MM-DD)，默认为今天"
    )
    parser.add_argument(
        "--email",
        action="store_true",
        default=False,
        help="采集完成后发送邮件"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        default=False,
        help="显示详细输出"
    )
    parser.add_argument(
        "--skip-collect",
        action="store_true",
        default=False,
        help="跳过数据采集（使用已有数据生成报告）"
    )
    parser.add_argument(
        "--skip-email",
        action="store_true",
        default=False,
        help="跳过邮件发送"
    )

    args = parser.parse_args()

    # 打印启动信息
    print()
    cprint("=" * 50, Colors.CYAN)
    cprint("  前沿信号 Frontier Signals", Colors.CYAN, bold=True)
    cprint("  一键运行流水线 v1.0", Colors.CYAN)
    cprint(f"  启动时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", Colors.DIM)
    cprint("=" * 50, Colors.CYAN)

    if args.date:
        print_info(f"指定日期: {args.date}")

    start_time = time.time()
    stages_ok = {}

    # 阶段1: 数据采集
    if not args.skip_collect:
        stages_ok["collect"] = stage_collect(args.date, args.verbose)
        if not stages_ok["collect"]:
            print_error("数据采集失败，终止流程")
            print_summary(start_time, stages_ok, args.date)
            sys.exit(1)
    else:
        print_info("跳过数据采集")
        stages_ok["collect"] = True

    # 阶段2: 生成报告
    stages_ok["report"] = stage_generate_report(args.date, args.verbose)
    if not stages_ok["report"]:
        print_error("日报生成失败，终止流程")
        print_summary(start_time, stages_ok, args.date)
        sys.exit(1)

    # 阶段3: 发送邮件
    if args.email and not args.skip_email:
        stages_ok["email"] = stage_send_email(args.verbose)
    else:
        if args.skip_email:
            print_info("跳过邮件发送")
        stages_ok["email"] = True

    # 打印摘要
    print_summary(start_time, stages_ok, args.date)


if __name__ == "__main__":
    main()
