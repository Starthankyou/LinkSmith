# 📥 LinkSmith 批次輸入完全指南

本指南說明如何使用 LinkSmith 的批次輸入功能，讓你能快速匯入大量連結並自動添加標籤和說明。

---

## 🎯 三種批次輸入方式

### 方式一：網頁介面直接輸入（最簡單）

直接在 LinkSmith 的 Import 頁面輸入，支援兩種格式：

#### 格式 1：簡單格式（僅 URL）
```
https://www.youtube.com/watch?v=example1
https://medium.com/article-example
https://github.com/user/repo
```

#### 格式 2：結構化格式（含標題、標籤、描述）
```
URL | 標題 | 標籤 | 描述

https://www.youtube.com/watch?v=example | JavaScript 完整教學 | programming,js,tutorial | 很棒的教學影片
https://medium.com/article | | programming,article
https://github.com/user/repo | My Project | opensource,github
```

**格式說明：**
- 使用 `|` 分隔欄位
- 標籤用逗號分隔
- 標題留空會自動從 URL 生成
- 描述可選
- 以 `#` 開頭的行會被當作註解忽略

---

### 方式二：使用 Python 轉換腳本（適合大量資料）

適合當你有幾百或上千筆連結需要匯入時。

#### 步驟：

**1. 準備文本文件**

建立一個文本文件（例如 `my-links.txt`），使用結構化格式：

```
# 我的學習資源清單
# 格式：URL | 標題 | 標籤 | 描述

https://www.youtube.com/watch?v=example1 | JavaScript 基礎教學 | programming,javascript,tutorial
https://medium.com/@author/react-hooks | React Hooks 指南 | react,programming,tutorial
https://github.com/facebook/react | React 官方倉庫 | react,github,library
https://stackoverflow.com/questions/123 | | javascript,q&a
https://news.ycombinator.com/item?id=123 | Show HN: My Project | startup,discussion

# 也可以只放 URL，會自動生成標題和平台標籤
https://dev.to/some-article
https://twitter.com/user/status/123
```

**2. 執行 Python 腳本**

```bash
# 基本用法（合併到現有的 links.json）
python tools/batch_import_converter.py my-links.txt

# 指定輸出文件
python tools/batch_import_converter.py my-links.txt --output data/links.json

# 完全覆蓋（不合併）
python tools/batch_import_converter.py my-links.txt --no-merge
```

**3. 重新載入 LinkSmith**

腳本執行完後，重新整理網頁即可看到新匯入的連結。

---

### 方式三：使用 Node.js 轉換腳本

如果你偏好使用 Node.js：

```bash
# 基本用法
node tools/batch_import_converter.js my-links.txt

# 指定輸出文件
node tools/batch_import_converter.js my-links.txt --output data/links.json

# 完全覆蓋
node tools/batch_import_converter.js my-links.txt --no-merge
```

---

## 📝 實用範例

### 範例 1：匯入學習資源

```
# 前端開發學習資源

https://www.youtube.com/watch?v=abc123 | CSS Grid 完整教學 | css,frontend,tutorial
https://www.youtube.com/watch?v=def456 | Flexbox 實戰 | css,frontend,tutorial
https://developer.mozilla.org/en-US/docs/Web/CSS | MDN CSS 文檔 | css,documentation,reference
https://css-tricks.com/snippets/css/a-guide-to-flexbox/ | Flexbox 指南 | css,guide,flexbox
```

### 範例 2：混合格式匯入

```
# 可以混用簡單格式和結構化格式

# 重要文章（使用結構化格式）
https://medium.com/@author/article1 | 重要：React 最佳實踐 | react,best-practices,important

# 隨便看看的連結（簡單格式即可）
https://www.reddit.com/r/programming/comments/example
https://news.ycombinator.com/item?id=12345

# 需要標籤的連結
https://github.com/awesome/project | | opensource,tools,productivity
```

### 範例 3：按主題整理

```
# ===== AI 相關 =====
https://www.youtube.com/watch?v=ai1 | 深度學習入門 | ai,deep-learning,tutorial
https://www.youtube.com/watch?v=ai2 | Transformer 架構解析 | ai,nlp,tutorial
https://arxiv.org/abs/1234.5678 | | ai,paper,research

# ===== Web 開發 =====
https://www.youtube.com/watch?v=web1 | Next.js 13 新功能 | web-dev,nextjs,tutorial
https://vercel.com/blog/nextjs-13 | | web-dev,nextjs,blog

# ===== 設計 =====
https://dribbble.com/shots/example | UI 設計靈感 | design,ui,inspiration
https://www.figma.com/community/file/example | | design,figma,template
```

---

## 🎨 批次標籤技巧

### 技巧 1：在網頁介面使用「批次標籤」欄位

匯入時，在「Add tags to all」欄位輸入標籤，這些標籤會自動加到所有匯入的連結上。

**適用場景：**
- 一次匯入特定主題的連結（例如全部標記為 `react` 和 `tutorial`）
- 標記匯入時間（例如 `2025-11`, `to-read`）

**範例：**
```
網址列表：
https://www.youtube.com/watch?v=example1
https://medium.com/article-example
https://github.com/user/repo

批次標籤欄位：react,tutorial,important

結果：每個連結都會有 react, tutorial, important 三個標籤
```

### 技巧 2：結合結構化格式和批次標籤

```
輸入：
https://www.youtube.com/watch?v=ex1 | React Hooks | hooks
https://medium.com/article | | context-api

批次標籤：react,tutorial,2025

結果：
- 第一個連結的標籤：hooks, react, tutorial, 2025
- 第二個連結的標籤：context-api, react, tutorial, 2025
```

---

## 🔧 進階使用

### 自動生成標題規則

當標題欄位留空時，系統會自動從 URL 生成標題：

```
URL: https://example.com/blog/how-to-learn-javascript
自動生成標題：How To Learn Javascript

URL: https://github.com/facebook/react
自動生成標題：React

URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ
自動生成標題：youtube.com（無法從 URL 判斷）
```

### 平台自動偵測

系統會自動偵測平台並加上平台標籤：

| 網域 | 平台標籤 |
|------|---------|
| youtube.com, youtu.be | youtube |
| medium.com | medium |
| github.com | github |
| twitter.com, x.com | twitter |
| reddit.com | reddit |
| stackoverflow.com | stackoverflow |
| dev.to | dev |
| linkedin.com | linkedin |
| 包含 blog 的網域 | blog |
| 包含 news 的網域 | news |
| 其他 | article |

---

## 💡 最佳實踐

### 1. 使用註解組織連結

```
# ===== 本週要看 =====
https://...

# ===== 重要參考文檔 =====
https://...

# ===== 靈感收集 =====
https://...
```

### 2. 使用一致的標籤命名

```
好的命名：
- programming, web-dev, tutorial
- react, javascript, frontend
- ai, machine-learning, deep-learning

避免：
- Programming, PROGRAMMING, prog（不一致）
- react前端, react 前端（混用語言）
```

### 3. 定期分類匯入

不要一次匯入太雜亂的連結，建議：

```
每天匯入：
- 收集當天看到的有趣連結
- 使用批次標籤標記日期：2025-11-15

每週整理：
- 按主題分類已讀連結
- 清理不需要的連結

每月回顧：
- 匯出資料備份
- 檢視學習進度
```

### 4. 使用範本文件

建立一個 `templates/` 資料夾，儲存常用的匯入範本：

```
templates/
├── weekly-reading.txt      # 每週閱讀清單範本
├── tutorials.txt          # 教學影片範本
├── resources.txt          # 學習資源範本
└── inspiration.txt        # 靈感收集範本
```

---

## 🚀 快速開始範例

**複製以下內容到 Import 頁面試試看：**

```
# 測試批次輸入功能

# 簡單格式
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://github.com/facebook/react

# 結構化格式
https://medium.com/@author/article | 優秀的技術文章 | programming,article,must-read
https://dev.to/author/post | | web-dev,tutorial
https://stackoverflow.com/questions/123 | JavaScript 最佳實踐 | javascript,q&a,best-practices
```

**在批次標籤欄位輸入：** `test,imported-today`

---

## ❓ 常見問題

### Q: 可以一次匯入多少個連結？
A: 網頁介面建議一次不超過 100 個。大量匯入（幾百上千筆）請使用 Python 或 Node.js 腳本。

### Q: 匯入會覆蓋現有資料嗎？
A: 不會。預設是「合併」模式，新連結會加到現有連結前面。如果使用腳本，可以用 `--no-merge` 參數完全覆蓋。

### Q: 已經匯入的連結可以修改標籤嗎？
A: 目前 MVP 版本不支援在網頁中編輯。需要直接修改 `data/links.json` 文件。未來版本會加入編輯功能。

### Q: 標籤有數量限制嗎？
A: 沒有限制，但建議每個連結不超過 5-7 個標籤，保持簡潔。

### Q: 可以匯出資料嗎？
A: 可以。打開瀏覽器的開發者工具（F12），在 Console 輸入：
```javascript
linkSmithApp.storage.exportData()
```
會自動下載 JSON 格式的備份文件。

---

## 📚 相關文件

- [README.md](README.md) - 專案說明
- [batch-import-template.txt](batch-import-template.txt) - 批次匯入範本
- [tools/batch_import_converter.py](tools/batch_import_converter.py) - Python 轉換腳本
- [tools/batch_import_converter.js](tools/batch_import_converter.js) - Node.js 轉換腳本

---

**Happy Importing! 🎉**

有任何問題或建議，歡迎在 GitHub Issues 提出。
