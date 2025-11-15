#!/usr/bin/env python3
"""
LinkSmith Batch Import Converter
將結構化的文本文件轉換為 links.json 格式
"""

import json
import sys
from datetime import datetime, timedelta
from urllib.parse import urlparse
import random

def extract_domain(url):
    """從 URL 提取域名"""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.replace('www.', '')
        return domain
    except:
        return 'unknown'

def get_platform_tag(domain):
    """根據域名判斷平台標籤"""
    platform_map = {
        'youtube.com': 'youtube',
        'youtu.be': 'youtube',
        'vimeo.com': 'vimeo',
        'twitter.com': 'twitter',
        'x.com': 'twitter',
        'facebook.com': 'facebook',
        'instagram.com': 'instagram',
        'linkedin.com': 'linkedin',
        'reddit.com': 'reddit',
        'medium.com': 'medium',
        'github.com': 'github',
        'stackoverflow.com': 'stackoverflow',
        'dev.to': 'dev',
        'substack.com': 'substack',
        'tiktok.com': 'tiktok',
        'twitch.tv': 'twitch',
        'news.ycombinator.com': 'hackernews',
        'techcrunch.com': 'news',
    }

    for key, value in platform_map.items():
        if key in domain:
            return value

    # 根據模式分類
    if 'blog' in domain or 'medium' in domain:
        return 'blog'
    if 'news' in domain:
        return 'news'

    return 'article'

def generate_title_from_url(url):
    """從 URL 生成標題"""
    try:
        parsed = urlparse(url)
        path = parsed.path

        if path and len(path) > 1:
            parts = [p for p in path.split('/') if p]
            if parts:
                last_part = parts[-1]
                # 移除副檔名
                title = last_part.rsplit('.', 1)[0]
                # 替換分隔符
                title = title.replace('-', ' ').replace('_', ' ')
                # 首字母大寫
                title = ' '.join(word.capitalize() for word in title.split())

                if len(title) > 3:
                    return title

        # Fallback 使用域名
        return parsed.netloc.replace('www.', '')
    except:
        return url

def parse_line(line):
    """解析單行輸入
    格式：URL | 標題 | 標籤 | 描述
    """
    line = line.strip()

    # 跳過註解和空行
    if not line or line.startswith('#'):
        return None

    # 分割欄位
    parts = line.split('|')

    url = parts[0].strip()
    title = parts[1].strip() if len(parts) > 1 else ''
    tags = parts[2].strip() if len(parts) > 2 else ''
    description = parts[3].strip() if len(parts) > 3 else ''

    # 驗證 URL
    if not url.startswith('http'):
        return None

    # 如果沒有標題，自動生成
    if not title:
        title = generate_title_from_url(url)

    # 處理標籤
    tag_list = []
    if tags:
        tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]

    # 提取域名和平台標籤
    domain = extract_domain(url)
    platform_tag = get_platform_tag(domain)

    return {
        'url': url,
        'title': title,
        'domain': domain,
        'platformTag': platform_tag,
        'tags': tag_list,
        'description': description,
        'status': 'unread'
    }

def convert_file(input_file, output_file='data/links.json', merge=True):
    """轉換文本文件為 links.json

    Args:
        input_file: 輸入的文本文件
        output_file: 輸出的 JSON 文件
        merge: 是否合併到現有的 links.json
    """
    print(f"📖 讀取文件: {input_file}")

    # 讀取輸入文件
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        print(f"❌ 錯誤: 找不到文件 {input_file}")
        return False

    # 解析每一行
    new_links = []
    for i, line in enumerate(lines, 1):
        link_data = parse_line(line)
        if link_data:
            new_links.append(link_data)

    print(f"✅ 成功解析 {len(new_links)} 個連結")

    # 讀取現有的 links.json（如果要合併）
    existing_links = []
    max_id = 0

    if merge:
        try:
            with open(output_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                existing_links = data.get('links', [])

                # 找出最大 ID
                if existing_links:
                    max_id = max(int(link.get('id', 0)) for link in existing_links)

            print(f"📋 找到 {len(existing_links)} 個現有連結，最大 ID: {max_id}")
        except FileNotFoundError:
            print("📋 沒有找到現有的 links.json，將創建新文件")

    # 為新連結分配 ID 和時間戳
    now = datetime.now()
    for i, link in enumerate(new_links):
        link['id'] = str(max_id + i + 1)
        # 錯開時間（每個相差幾小時）
        created_at = now - timedelta(hours=len(new_links) - i)
        link['createdAt'] = created_at.isoformat() + 'Z'

    # 合併連結（新的在前面）
    all_links = new_links + existing_links if merge else new_links

    # 寫入 JSON
    output_data = {
        'links': all_links
    }

    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)

        print(f"✅ 成功寫入 {output_file}")
        print(f"📊 總共 {len(all_links)} 個連結")
        print(f"   - 新增: {len(new_links)}")
        print(f"   - 現有: {len(existing_links)}")

        # 顯示平台統計
        platform_stats = {}
        for link in all_links:
            platform = link.get('platformTag', 'unknown')
            platform_stats[platform] = platform_stats.get(platform, 0) + 1

        print(f"\n📈 平台分佈:")
        for platform, count in sorted(platform_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"   {platform}: {count}")

        return True

    except Exception as e:
        print(f"❌ 寫入錯誤: {e}")
        return False

def main():
    """主函數"""
    if len(sys.argv) < 2:
        print("""
LinkSmith 批次輸入轉換工具

使用方法:
    python batch_import_converter.py <輸入文件> [選項]

選項:
    --output <文件>    指定輸出文件 (預設: data/links.json)
    --no-merge         不合併現有連結，完全覆蓋

範例:
    python batch_import_converter.py batch-import-template.txt
    python batch_import_converter.py my-links.txt --output custom.json
    python batch_import_converter.py my-links.txt --no-merge
        """)
        return

    input_file = sys.argv[1]
    output_file = 'data/links.json'
    merge = True

    # 解析參數
    i = 2
    while i < len(sys.argv):
        if sys.argv[i] == '--output' and i + 1 < len(sys.argv):
            output_file = sys.argv[i + 1]
            i += 2
        elif sys.argv[i] == '--no-merge':
            merge = False
            i += 1
        else:
            i += 1

    # 執行轉換
    success = convert_file(input_file, output_file, merge)

    if success:
        print("\n✨ 轉換完成！現在可以重新載入 LinkSmith 查看新連結。")
    else:
        print("\n❌ 轉換失敗，請檢查錯誤訊息。")

if __name__ == '__main__':
    main()
