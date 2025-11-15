# 🔗 LinkSmith

> **Minimal management, maximum consumption.**
> 減少整理負擔，增加吸收效率。

一個部署於 GitHub Pages 的「個人化資訊池（Personal Knowledge Pool）」，專門用來管理大量收藏但未消化的網頁、影片、文章與社群連結。

---

## ✨ 核心特色

- 🚀 **批次匯入** - 支援簡單格式與結構化格式，一次匯入大量連結
- 🏷️ **智慧標籤** - 自動偵測平台標籤 + 自訂標籤系統
- 🔍 **強大搜尋** - 依標題、網域、標籤快速篩選
- 🎲 **隨機抽選** - 從篩選池中隨機挑選內容，避免選擇困難
- 📊 **進度管理** - 未讀/已讀/冷凍狀態追蹤
- ⏭️ **跳過 & 冷凍** - 暫時隱藏不想看的內容（30天冷凍期）
- 💾 **資料持久化** - links.json + LocalStorage 雙重儲存
- 🌐 **靜態網站** - 無需後端，可部署於 GitHub Pages

---

## 🎯 使用場景

LinkSmith 適合以下情境：

- ✅ 收藏了大量 YouTube 影片但都沒看
- ✅ Medium / Dev.to 文章收藏夾爆滿
- ✅ Twitter / Reddit 的好文章存了一堆
- ✅ 想跳脫平台演算法，自己掌控學習內容
- ✅ 需要一個私人的、可控的閱讀清單

---

## 📥 批次匯入功能

### 支援兩種格式：

#### 格式 1：簡單格式（僅 URL）
```
https://www.youtube.com/watch?v=example
https://medium.com/article
https://github.com/user/repo
```

#### 格式 2：結構化格式（含標題、標籤、描述）
```
URL | 標題 | 標籤 | 描述

https://www.youtube.com/watch?v=example | JavaScript 教學 | programming,js | 很棒的教學
https://medium.com/article | | programming,article
https://github.com/user/repo | My Project | opensource,github
```

**詳細說明請參閱：**
- 📚 [批次輸入完全指南](BATCH_IMPORT_GUIDE.md)
- 📝 [批次輸入範本](batch-import-template.txt)

---

## 🛠️ 技術架構

- **前端框架**: Vanilla JavaScript (ES6 Modules)
- **樣式**: CSS3 (Custom Properties + Flexbox/Grid)
- **資料儲存**:
  - `data/links.json` - 連結資料
  - `LocalStorage` - 使用者狀態（已讀、冷凍）
- **部署**: GitHub Pages (靜態網站)

### 模組化架構：
```
js/
├── main.js                 # 主控制器
└── modules/
    ├── storage.js          # 資料管理
    ├── import.js           # 匯入邏輯
    ├── linkCard.js         # 列表渲染
    ├── search.js           # 搜尋 & 篩選
    └── randomPicker.js     # 隨機抽選
```

---

## 🚀 快速開始

### 1. Clone 專案
```bash
git clone https://github.com/Starthankyou/LinkSmith.git
cd LinkSmith
```

### 2. 開啟網頁
直接用瀏覽器打開 `index.html`，或使用本地伺服器：

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# VS Code
# 使用 Live Server 擴充套件
```

### 3. 開始使用
1. 點選 **Import** 匯入連結
2. 在 **Dashboard** 搜尋、篩選、閱讀
3. 使用 **Random Pick** 隨機抽選下一個內容

---

## 📖 主要功能

### 1️⃣ Dashboard（儀表板）
- 📋 列表顯示所有連結
- 🔍 即時搜尋
- 🏷️ 標籤雲快速篩選
- 📊 狀態統計（總數、未讀數）
- 📄 分頁顯示（20筆/頁）
- 🔄 排序選項（最新、最舊、未讀優先）

### 2️⃣ Import（匯入）
- 📥 貼上多行 URL 批次匯入
- 🏷️ 批次標籤功能
- 🤖 自動擷取網域和平台標籤
- 📝 支援結構化格式（標題、標籤、描述）
- 💬 支援註解（# 開頭）

### 3️⃣ Random Pick（隨機抽選）
- 🎲 從目前篩選池隨機抽選
- ⏭️ 跳過功能（當前 session 不再出現）
- ❄️ 冷凍功能（30天內不再出現）
- 🚀 開啟連結自動標記已讀

### 4️⃣ 狀態管理
- ✅ **Unread（未讀）**: 預設狀態
- 📖 **Read（已讀）**: 已閱讀
- ❄️ **Frozen（冷凍）**: 暫時不想看（30天）
- ⏭️ **Skipped（跳過）**: Session 內跳過

---

## 🔧 進階工具

### 批次匯入轉換工具

適合匯入大量連結（數百上千筆）：

#### Python 版本
```bash
python tools/batch_import_converter.py my-links.txt
```

#### Node.js 版本
```bash
node tools/batch_import_converter.js my-links.txt
```

**詳細使用方法：** [BATCH_IMPORT_GUIDE.md](BATCH_IMPORT_GUIDE.md)

---

## 📊 資料格式

### links.json 結構
```json
{
  "links": [
    {
      "id": "1",
      "url": "https://www.youtube.com/watch?v=example",
      "title": "JavaScript Tutorial",
      "domain": "youtube.com",
      "platformTag": "youtube",
      "tags": ["programming", "javascript", "tutorial"],
      "status": "unread",
      "createdAt": "2025-11-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🎨 自訂與擴充

### 修改冷凍天數
編輯 `js/modules/storage.js`，找到 `freezeLink` 方法：
```javascript
freezeLink(id, days = 30) {  // 修改預設天數
    // ...
}
```

### 新增平台標籤
編輯 `js/modules/import.js`，在 `getPlatformTag` 方法中新增：
```javascript
const platformMap = {
    'example.com': 'example',  // 新增這一行
    // ...
};
```

### 調整每頁顯示數量
編輯 `js/modules/linkCard.js`：
```javascript
this.itemsPerPage = 20;  // 修改這個數字
```

---

## 🌐 部署到 GitHub Pages

1. 推送程式碼到 GitHub
2. 前往 Settings → Pages
3. 選擇分支和資料夾（通常是 `main` 和 `/root`）
4. 儲存

你的網站將會在 `https://<username>.github.io/LinkSmith/` 上線。

---

## 📝 版本規劃

### ✅ V1.1 (MVP - 已完成)
- 批次匯入（簡單 & 結構化格式）
- 搜尋、標籤、篩選
- 隨機抽選
- 未讀/已讀/冷凍狀態
- 轉換工具（Python & Node.js）

### 🔜 V1.2 (計劃中)
- 內嵌預覽
- 編輯功能（修改標題、標籤）
- 刪除功能
- 匯出/匯入備份

### 💡 V2 (未來版本)
- AI 自動分類
- AI 內容摘要
- Chrome 擴充套件
- 後端同步（多裝置）

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

## 📄 授權

MIT License

---

## 💬 聯繫

有問題或建議？歡迎開 Issue 討論！

---

**Built with ❤️ for knowledge seekers**
