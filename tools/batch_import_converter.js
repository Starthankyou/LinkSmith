#!/usr/bin/env node
/**
 * LinkSmith Batch Import Converter (Node.js version)
 * 將結構化的文本文件轉換為 links.json 格式
 */

const fs = require('fs');
const path = require('path');

/**
 * 從 URL 提取域名
 */
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch {
        return 'unknown';
    }
}

/**
 * 根據域名判斷平台標籤
 */
function getPlatformTag(domain) {
    const platformMap = {
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
    };

    for (const [key, value] of Object.entries(platformMap)) {
        if (domain.includes(key)) {
            return value;
        }
    }

    // 根據模式分類
    if (domain.includes('blog') || domain.includes('medium')) {
        return 'blog';
    }
    if (domain.includes('news')) {
        return 'news';
    }

    return 'article';
}

/**
 * 從 URL 生成標題
 */
function generateTitleFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const path = urlObj.pathname;

        if (path && path.length > 1) {
            const parts = path.split('/').filter(p => p);
            if (parts.length > 0) {
                const lastPart = parts[parts.length - 1];
                // 移除副檔名
                const title = lastPart.split('.')[0]
                    .replace(/[-_]/g, ' ')
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                if (title.length > 3) {
                    return title;
                }
            }
        }

        // Fallback 使用域名
        return urlObj.hostname.replace('www.', '');
    } catch {
        return url;
    }
}

/**
 * 解析單行輸入
 */
function parseLine(line) {
    line = line.trim();

    // 跳過註解和空行
    if (!line || line.startsWith('#')) {
        return null;
    }

    // 分割欄位
    const parts = line.split('|').map(p => p.trim());

    const url = parts[0] || '';
    let title = parts[1] || '';
    const tags = parts[2] || '';
    const description = parts[3] || '';

    // 驗證 URL
    if (!url.startsWith('http')) {
        return null;
    }

    // 如果沒有標題，自動生成
    if (!title) {
        title = generateTitleFromUrl(url);
    }

    // 處理標籤
    const tagList = tags
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];

    // 提取域名和平台標籤
    const domain = extractDomain(url);
    const platformTag = getPlatformTag(domain);

    return {
        url,
        title,
        domain,
        platformTag,
        tags: tagList,
        description,
        status: 'unread'
    };
}

/**
 * 轉換文件
 */
function convertFile(inputFile, outputFile = 'data/links.json', merge = true) {
    console.log(`📖 讀取文件: ${inputFile}`);

    // 讀取輸入文件
    let lines;
    try {
        const content = fs.readFileSync(inputFile, 'utf-8');
        lines = content.split('\n');
    } catch (error) {
        console.error(`❌ 錯誤: 找不到文件 ${inputFile}`);
        return false;
    }

    // 解析每一行
    const newLinks = [];
    lines.forEach((line, i) => {
        const linkData = parseLine(line);
        if (linkData) {
            newLinks.push(linkData);
        }
    });

    console.log(`✅ 成功解析 ${newLinks.length} 個連結`);

    // 讀取現有的 links.json（如果要合併）
    let existingLinks = [];
    let maxId = 0;

    if (merge) {
        try {
            const data = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
            existingLinks = data.links || [];

            // 找出最大 ID
            if (existingLinks.length > 0) {
                maxId = Math.max(...existingLinks.map(link => parseInt(link.id) || 0));
            }

            console.log(`📋 找到 ${existingLinks.length} 個現有連結，最大 ID: ${maxId}`);
        } catch {
            console.log('📋 沒有找到現有的 links.json，將創建新文件');
        }
    }

    // 為新連結分配 ID 和時間戳
    const now = new Date();
    newLinks.forEach((link, i) => {
        link.id = String(maxId + i + 1);
        // 錯開時間（每個相差幾小時）
        const createdAt = new Date(now - (newLinks.length - i) * 3600000);
        link.createdAt = createdAt.toISOString();
    });

    // 合併連結（新的在前面）
    const allLinks = merge ? [...newLinks, ...existingLinks] : newLinks;

    // 寫入 JSON
    const outputData = {
        links: allLinks
    };

    try {
        // 確保輸出目錄存在
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2), 'utf-8');

        console.log(`✅ 成功寫入 ${outputFile}`);
        console.log(`📊 總共 ${allLinks.length} 個連結`);
        console.log(`   - 新增: ${newLinks.length}`);
        console.log(`   - 現有: ${existingLinks.length}`);

        // 顯示平台統計
        const platformStats = {};
        allLinks.forEach(link => {
            const platform = link.platformTag || 'unknown';
            platformStats[platform] = (platformStats[platform] || 0) + 1;
        });

        console.log('\n📈 平台分佈:');
        Object.entries(platformStats)
            .sort((a, b) => b[1] - a[1])
            .forEach(([platform, count]) => {
                console.log(`   ${platform}: ${count}`);
            });

        return true;
    } catch (error) {
        console.error(`❌ 寫入錯誤: ${error.message}`);
        return false;
    }
}

/**
 * 主函數
 */
function main() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log(`
LinkSmith 批次輸入轉換工具

使用方法:
    node batch_import_converter.js <輸入文件> [選項]

選項:
    --output <文件>    指定輸出文件 (預設: data/links.json)
    --no-merge         不合併現有連結，完全覆蓋

範例:
    node batch_import_converter.js batch-import-template.txt
    node batch_import_converter.js my-links.txt --output custom.json
    node batch_import_converter.js my-links.txt --no-merge
        `);
        return;
    }

    const inputFile = args[0];
    let outputFile = 'data/links.json';
    let merge = true;

    // 解析參數
    for (let i = 1; i < args.length; i++) {
        if (args[i] === '--output' && i + 1 < args.length) {
            outputFile = args[i + 1];
            i++;
        } else if (args[i] === '--no-merge') {
            merge = false;
        }
    }

    // 執行轉換
    const success = convertFile(inputFile, outputFile, merge);

    if (success) {
        console.log('\n✨ 轉換完成！現在可以重新載入 LinkSmith 查看新連結。');
    } else {
        console.log('\n❌ 轉換失敗，請檢查錯誤訊息。');
    }
}

// 如果直接執行此腳本
if (require.main === module) {
    main();
}

module.exports = { convertFile, parseLine };
