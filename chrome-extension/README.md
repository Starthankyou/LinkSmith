# LinkSmith YouTube Saver - Chrome Extension

🔗 一鍵保存 YouTube 影片到 LinkSmith，自動分類，跨裝置同步！

## 功能特點

### ✨ 核心功能
- **一鍵保存**：在 YouTube 頁面點擊浮動按鈕或擴充功能圖示，即可保存影片
- **自動提取**：自動抓取影片標題、描述、頻道名稱、縮圖等完整資訊
- **智能分類**：基於關鍵字自動分類到 17 個預設類別（技術、設計、商業等）
- **跨裝置同步**：使用 Chrome 內建的 `chrome.storage.sync` 免費同步
- **零成本**：完全免費，無需任何 API 金鑰或後端服務
- **隱私優先**：所有資料存儲在本地和 Chrome 同步空間，不經過第三方伺服器

### 🎯 使用場景
- 瀏覽 YouTube 時發現好影片，立即保存到 LinkSmith
- 自動分類，無需手動選擇標籤
- 在不同電腦/裝置間自動同步已保存的影片
- 與 LinkSmith 主應用無縫整合

## 安裝方法

### 步驟 1：準備圖示（可選）

擴充功能需要三個尺寸的圖示：
- `icons/icon16.png` (16x16 像素)
- `icons/icon48.png` (48x48 像素)
- `icons/icon128.png` (128x128 像素)

如果沒有圖示，Chrome 會使用預設佔位圖。你可以：
1. 使用線上工具生成：https://www.favicon-generator.org/
2. 設計建議：紫色漸層（#667eea to #764ba2）+ 鏈條圖示 🔗

### 步驟 2：載入擴充功能

1. 打開 Chrome 瀏覽器
2. 進入 `chrome://extensions/`
3. 開啟右上角的「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇 `LinkSmith/chrome-extension/` 資料夾
6. 擴充功能安裝完成！

### 步驟 3：固定擴充功能（建議）

1. 點擊瀏覽器工具列的拼圖圖示（擴充功能）
2. 找到「LinkSmith YouTube Saver」
3. 點擊圖釘圖示固定到工具列

## 使用方法

### 方法 1：使用浮動按鈕（推薦）

1. 打開任意 YouTube 影片頁面
2. 頁面右下角會出現紫色浮動按鈕「🔗 Save to LinkSmith」
3. 點擊按鈕即可保存
4. 按鈕會變成綠色「✅ Saved!」表示成功

### 方法 2：使用擴充功能彈窗

1. 打開任意 YouTube 影片頁面
2. 點擊瀏覽器工具列的 LinkSmith 圖示
3. 彈窗會顯示影片預覽和自動分類結果
4. 點擊「💾 Save to LinkSmith」保存

### 同步到 LinkSmith 主應用

1. 打開 LinkSmith 主應用（`index.html`）
2. 擴充功能保存的影片會自動導入並顯示
3. 同步後，擴充功能的暫存資料會自動清除
4. 影片會自動標記為「YouTube」並分配到相應類別

## 自動分類規則

擴充功能會分析影片標題和描述，自動匹配到以下類別：

| 類別 | 關鍵字範例 |
|------|------------|
| 技術 | 程式、編程、programming、coding、AI、Python、JavaScript |
| 設計 | design、UI、UX、Figma、Photoshop |
| 商業 | business、startup、創業、行銷、管理 |
| 生產力 | productivity、GTD、Notion、workflow |
| 健康 | health、fitness、workout、yoga |
| 理財 | finance、investment、股票、crypto |
| 教育 | education、learning、course、MOOC |
| 娛樂 | entertainment、movie、music、gaming |
| 旅遊 | travel、trip、tourism、adventure |
| 美食 | cooking、recipe、food、chef |
| 生活 | lifestyle、daily、routine、vlog |
| 科學 | science、physics、chemistry、research |
| 藝術 | art、painting、drawing、creative |
| 新聞 | news、politics、journalism |
| 哲學 | philosophy、思想、wisdom、ethics |
| 歷史 | history、ancient、civilization |
| 個人成長 | self improvement、motivation、habit |

系統會自動選取最匹配的 1-3 個類別。

## 儲存空間說明

### Chrome Sync Storage
- 容量限制：100KB (約 50-100 個影片)
- 自動同步：所有登入同一 Google 帳號的 Chrome 瀏覽器
- 清除時機：影片同步到 LinkSmith 後自動清除

### 儲存空間監控
- 擴充功能彈窗底部會顯示當前使用百分比
- 超過 80% 會顯示警告，建議開啟 LinkSmith 同步
- 主控台會記錄詳細的儲存空間使用情況

## 技術架構

### 檔案結構
```
chrome-extension/
├── manifest.json           # 擴充功能配置（Manifest V3）
├── background.js           # 背景服務工作者（處理保存邏輯）
├── content/
│   └── youtube.js         # 內容腳本（提取影片資料）
├── popup/
│   ├── popup.html         # 彈窗介面
│   ├── popup.css          # 彈窗樣式
│   └── popup.js           # 彈窗邏輯
├── utils/
│   └── classifier.js      # 自動分類工具
└── icons/                 # 擴充功能圖示
```

### 資料流程
1. **保存**：YouTube 頁面 → Content Script → Background Worker → chrome.storage.sync
2. **同步**：chrome.storage.sync → LinkSmith → LocalStorage
3. **清除**：同步成功後，chrome.storage.sync 自動清空

### 跨裝置同步原理
- 電腦 A：保存影片到 chrome.storage.sync
- Chrome 自動同步：資料上傳到 Google 帳號
- 電腦 B：chrome.storage.sync 自動接收資料
- 電腦 B：打開 LinkSmith，自動導入影片

## 常見問題

### Q: 為什麼影片沒有出現在 LinkSmith？
A: 確保：
1. 擴充功能已成功保存（彈窗顯示成功訊息）
2. 打開 LinkSmith 主應用（`index.html`）
3. 檢查瀏覽器控制台是否有錯誤訊息

### Q: 如何知道影片已經保存過了？
A: 重複保存同一影片時，擴充功能會顯示「Already Saved」訊息。

### Q: 儲存空間滿了怎麼辦？
A: 打開 LinkSmith 主應用，系統會自動同步並清空擴充功能的暫存空間。

### Q: 可以離線使用嗎？
A: 可以！保存到 chrome.storage.sync 的資料會一直保留，直到同步到 LinkSmith。

### Q: 支援其他影片平台嗎？
A: 目前僅支援 YouTube。未來可擴展到 Vimeo、Bilibili 等平台。

### Q: 自動分類不準確怎麼辦？
A: 影片同步到 LinkSmith 後，可以在 Tags 頁面手動編輯標籤。

## 開發者資訊

### 調試
打開 Chrome DevTools 查看控制台日誌：
- Background Worker：`chrome://extensions/` → LinkSmith → 「檢查檢視」
- Content Script：YouTube 頁面 → F12 → Console
- Popup：右鍵點擊擴充功能圖示 → 檢查

### 修改分類規則
編輯 `utils/classifier.js` 中的 `categoryKeywords` 對象，添加或修改關鍵字。

### 自訂樣式
編輯 `popup/popup.css` 和 `content/youtube.js` 中的內聯樣式。

## 版本歷史

### v1.0.0 (2025)
- ✅ 初始版本
- ✅ YouTube 影片自動保存
- ✅ 智能分類（17 個類別）
- ✅ 跨裝置同步
- ✅ 浮動按鈕 + 彈窗兩種保存方式
- ✅ 與 LinkSmith 主應用整合

## 授權

與 LinkSmith 主專案相同。

---

**享受無縫的 YouTube 影片收藏體驗！ 🚀**
