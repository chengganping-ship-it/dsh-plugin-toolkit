#!/usr/bin/env python3
"""
轻量级有声书生成器 - 基于 edge-tts
功能：将文本文件或 EPUB 转换为有声书 MP3
依赖：edge-tts（已安装），可选：ebooklib（EPUB 支持）
"""

import asyncio
import os
import re
import sys
import argparse
from pathlib import Path


# ========== 配置 ==========
DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural"  # 晓晓，女声，适合新闻/小说
DEFAULT_RATE = "+0%"  # 语速
DEFAULT_VOLUME = "+0%"  # 音量
DEFAULT_OUTPUT_DIR = "audiobook_output"

# 中文优质语音推荐
VOICE_OPTIONS = {
    "xiaoxiao": "zh-CN-XiaoxiaoNeural",    # 晓晓 - 温暖女声，适合小说
    "xiaoyi": "zh-CN-XiaoyiNeural",        # 晓伊 - 活泼女声，适合卡通
    "yunjian": "zh-CN-YunjianNeural",      # 云健 - 男声，激情，适合体育
    "yunxi": "zh-CN-YunxiNeural",          # 云希 - 男声，阳光，适合小说
    "yunyang": "zh-CN-YunyangNeural",      # 云扬 - 男声，专业，适合新闻
    "xiaobei": "zh-CN-liaoning-XiaobeiNeural",  # 晓北 - 东北方言，幽默
    "xiaoni": "zh-CN-shaanxi-XiaoniNeural",     # 晓妮 - 陕西方言，明亮
}


def split_text(text, max_chars=2000):
    """将长文本按句子边界拆分成适合 TTS 的段落"""
    # 按段落分割
    paragraphs = text.split('\n')
    chunks = []
    current_chunk = ""
    
    for para in paragraphs:
        para = para.strip()
        if not para:
            continue
        
        # 如果当前段落加上新段落不超过限制，合并
        if len(current_chunk) + len(para) + 1 <= max_chars:
            current_chunk += para + " "
        else:
            # 保存当前块，开始新块
            if current_chunk:
                chunks.append(current_chunk.strip())
            # 如果单个段落超过限制，按句子切分
            if len(para) > max_chars:
                sentences = re.split(r'([。！？.!?])', para)
                current_chunk = ""
                for i in range(0, len(sentences), 2):
                    sentence = sentences[i] + (sentences[i+1] if i+1 < len(sentences) else "")
                    if len(current_chunk) + len(sentence) <= max_chars:
                        current_chunk += sentence
                    else:
                        if current_chunk:
                            chunks.append(current_chunk.strip())
                        current_chunk = sentence
            else:
                current_chunk = para + " "
    
    if current_chunk.strip():
        chunks.append(current_chunk.strip())
    
    return chunks


async def text_to_speech(text, output_file, voice=DEFAULT_VOICE, rate=DEFAULT_RATE, volume=DEFAULT_VOLUME):
    """使用 edge-tts 将文本转为语音"""
    import edge_tts
    
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
        rate=rate,
        volume=volume,
    )
    await communicate.save(str(output_file))


async def process_text_file(input_file, output_dir, voice, rate, volume):
    """处理文本文件"""
    input_path = Path(input_file)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 读取文件
    text = input_path.read_text(encoding='utf-8')
    
    # 尝试按章节标题拆分
    chapter_pattern = re.compile(r'^(?:第[一二三四五六七八九十百千万\d]+章|Chapter\s+\d+)[^\n]*', re.MULTILINE)
    matches = list(chapter_pattern.finditer(text))
    
    if len(matches) >= 2:  # 找到了至少2个章节
        print(f"检测到 {len(matches)} 个章节")
        chapter_list = []
        for i, match in enumerate(matches):
            title = match.group().strip()
            # 内容从当前匹配结束到下一个匹配开始
            start = match.end()
            end = matches[i+1].start() if i+1 < len(matches) else len(text)
            content = text[start:end].strip()
            if title and content:
                chapter_list.append((title, content))
    elif len(matches) == 1:
        # 只有一个章节标题
        title = matches[0].group().strip()
        content = text[matches[0].end():].strip()
        chapter_list = [(title, content)] if content else [(input_path.stem, text)]
    else:
        # 没有章节标题，当作一整章
        chapter_list = [(input_path.stem, text)]
    
    # 逐章转换
    for idx, (title, content) in enumerate(chapter_list, 1):
        print(f"\n处理第 {idx}/{len(chapter_list)} 章: {title[:30]}...")
        
        # 拆分长文本
        chunks = split_text(content, max_chars=2000)
        
        # 合并短 chunks 以提高效率
        merged_chunks = []
        current = ""
        for chunk in chunks:
            if len(current) + len(chunk) < 3000:
                current += chunk + " "
            else:
                if current:
                    merged_chunks.append(current.strip())
                current = chunk + " "
        if current.strip():
            merged_chunks.append(current.strip())
        
        # 生成每段的音频文件名
        safe_title = re.sub(r'[^\w\u4e00-\u9fff]', '_', title)[:30]
        chapter_dir = output_path / f"{idx:02d}_{safe_title}"
        chapter_dir.mkdir(exist_ok=True)
        
        for chunk_idx, chunk in enumerate(merged_chunks, 1):
            output_file = chapter_dir / f"part_{chunk_idx:03d}.mp3"
            if output_file.exists():
                print(f"  跳过已存在: {output_file.name}")
                continue
            
            await text_to_speech(chunk, output_file, voice, rate, volume)
            print(f"  生成: {output_file.name} ({len(chunk)} 字)")
    
    print(f"\n✅ 完成！输出目录: {output_path.absolute()}")
    return output_path


async def process_epub(input_file, output_dir, voice, rate, volume):
    """处理 EPUB 文件（需要 ebooklib）"""
    try:
        import ebooklib
        from ebooklib import epub
    except ImportError:
        print("EPUB 支持需要 ebooklib，正在安装...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "ebooklib",
                               "--index-url", "https://pypi.org/simple/"])
        import ebooklib
        from ebooklib import epub
    
    from bs4 import BeautifulSoup
    
    input_path = Path(input_file)
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 读取 EPUB
    book = epub.read_epub(str(input_path))
    
    # 获取书名
    title = book.get_metadata('DC', 'title')
    book_title = title[0][0] if title else input_path.stem
    print(f"书名: {book_title}")
    
    # 获取所有文档章节
    chapters = []
    for item in book.get_items():
        if isinstance(item, ebooklib.epub.EpubHtml):
            soup = BeautifulSoup(item.get_content(), 'html.parser')
            text = soup.get_text(strip=True)
            if len(text) > 50:  # 过滤太短的片段
                # 尝试获取标题
                title_tag = soup.find(['h1', 'h2', 'h3', 'title'])
                title = title_tag.get_text(strip=True) if title_tag else item.get_name()
                chapters.append((title, text))
    
    if not chapters:
        print("未找到有效的章节内容")
        return None
    
    print(f"共 {len(chapters)} 个章节")
    
    # 逐章转换
    for idx, (chapter_name, content) in enumerate(chapters, 1):
        print(f"\n处理第 {idx}/{len(chapters)} 章: {chapter_name}")
        
        chunks = split_text(content, max_chars=2000)
        
        # 合并短 chunks
        merged_chunks = []
        current = ""
        for chunk in chunks:
            if len(current) + len(chunk) < 3000:
                current += chunk + " "
            else:
                if current:
                    merged_chunks.append(current.strip())
                current = chunk + " "
        if current.strip():
            merged_chunks.append(current.strip())
        
        chapter_dir = output_path / f"{idx:02d}_{chapter_name}"
        chapter_dir.mkdir(exist_ok=True)
        
        for chunk_idx, chunk in enumerate(merged_chunks, 1):
            output_file = chapter_dir / f"part_{chunk_idx:03d}.mp3"
            if output_file.exists():
                print(f"  跳过已存在: {output_file.name}")
                continue
            
            await text_to_speech(chunk, output_file, voice, rate, volume)
            print(f"  生成: {output_file.name} ({len(chunk)} 字)")
    
    print(f"\n✅ 完成！输出目录: {output_path.absolute()}")
    return output_path


def merge_mp3_files(output_dir):
    """将同一章节的多个 MP3 文件合并为一个"""
    output_path = Path(output_dir)
    merged_dir = output_path / "merged"
    merged_dir.mkdir(exist_ok=True)
    
    for chapter_dir in sorted(output_path.iterdir()):
        if not chapter_dir.is_dir() or chapter_dir.name == "merged":
            continue
        
        mp3_files = sorted(chapter_dir.glob("*.mp3"))
        if not mp3_files:
            continue
        
        # 使用 copy /b 合并 MP3（简单二进制拼接，edge-tts 输出兼容）
        output_file = merged_dir / f"{chapter_dir.name}.mp3"
        if output_file.exists():
            print(f"跳过已合并: {output_file.name}")
            continue
        
        print(f"合并: {chapter_dir.name} ({len(mp3_files)} 段)")
        
        # Python 方式合并
        with open(output_file, 'wb') as outfile:
            for mp3_file in mp3_files:
                with open(mp3_file, 'rb') as infile:
                    outfile.write(infile.read())
    
    print(f"\n合并完成，文件在: {merged_dir}")
    return merged_dir


async def main():
    parser = argparse.ArgumentParser(description="轻量级有声书生成器（基于 edge-tts）")
    parser.add_argument("input", help="输入文件路径 (.txt 或 .epub)")
    parser.add_argument("-o", "--output", default=DEFAULT_OUTPUT_DIR, help="输出目录")
    parser.add_argument("-v", "--voice", default="xiaoxiao", 
                        choices=list(VOICE_OPTIONS.keys()),
                        help="语音选择")
    parser.add_argument("-r", "--rate", default=DEFAULT_RATE, help="语速，如 +0%, -10%, +20%")
    parser.add_argument("--volume", default=DEFAULT_VOLUME, help="音量，如 +0%, -10%")
    parser.add_argument("--merge", action="store_true", help="合并每个章节的 MP3 为单个文件")
    
    args = parser.parse_args()
    
    voice = VOICE_OPTIONS[args.voice]
    print(f"=== 有声书生成器 ===")
    print(f"输入: {args.input}")
    print(f"输出: {args.output}")
    print(f"语音: {args.voice} ({voice})")
    print(f"语速: {args.rate}")
    print()
    
    input_file = Path(args.input)
    if not input_file.exists():
        print(f"❌ 文件不存在: {input_file}")
        sys.exit(1)
    
    if input_file.suffix.lower() == '.epub':
        output_path = await process_epub(args.input, args.output, voice, args.rate, args.volume)
    else:
        output_path = await process_text_file(args.input, args.output, voice, args.rate, args.volume)
    
    if args.merge and output_path:
        merge_mp3_files(output_path)


if __name__ == "__main__":
    asyncio.run(main())
