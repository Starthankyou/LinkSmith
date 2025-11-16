# 🚀 Chrome Extension 快速開始指南

恭喜！LinkSmith Chrome Extension 已經完成開發並成功推送到 Git 倉庫。

## ✅ 已完成的功能

### 核心功能
- ✅ **一鍵保存 YouTube 影片**：在 YouTube 頁面直接保存影片到 LinkSmith
- ✅ **自動提取資料**：自動抓取標題、描述、頻道、縮圖等完整資訊
- ✅ **智能自動分類**：基於關鍵字自動匹配 17 個類別（技術、設計、商業等）
- ✅ **跨裝置免費同步**：使用 Chrome 內建 storage.sync，無需 API
- ✅ **雙重操作方式**：浮動按鈕 + 擴充功能彈窗
- ✅ **完美整合**：與 LinkSmith 主應用無縫同步

### 技術特點
- ✅ Manifest V3（最新標準）
- ✅ 完全免費（無需任何 API 金鑰）
- ✅ 隱私優先（資料不經過第三方）
- ✅ 100KB 跨裝置同步空間
- ✅ 儲存空間監控
- ✅ 重複檢測

## 📦 檔案結構

```
chrome-extension/
├── manifest.json              # 擴充功能配置
├── background.js              # 背景服務（處理保存和分類）
├── content/
│   └── youtube.js            # YouTube 頁面腳本（提取資料 + 浮動按鈕）
├── popup/
│   ├── popup.html            # 彈窗介面
│   ├── popup.css             # 彈窗樣式
│   └── popup.js              # 彈窗邏輯
├── utils/
│   └── classifier.js         # 自動分類引擎（17 個類別）
├── icons/
│   └── README.md             # 圖示說明（需自行添加）
└── README.md                 # 完整文檔
```

## 🔧 安裝步驟（3 分鐘）

### 步驟 1：準備圖示（可選）

擴充功能需要 3 個圖示檔案：
- `chrome-extension/icons/icon16.png` (16x16)
- `chrome-extension/icons/icon48.png` (48x48)
- `chrome-extension/icons/icon128.png` (128x128)

**沒有圖示也可以運行**，Chrome 會顯示預設佔位圖。

**快速生成圖示**：
1. 使用 https://www.favicon-generator.org/
2. 上傳任意圖片（建議：紫色鏈條圖示）
3. 下載並重命名為上述檔名

### 步驟 2：載入擴充功能

1. 打開 Chrome 瀏覽器
2. 前往 `chrome://extensions/`
3. 開啟右上角「**開發人員模式**」
4. 點擊「**載入未封裝項目**」
5. 選擇 `LinkSmith/chrome-extension/` 資料夾
6. 完成！擴充功能已安裝

### 步驟 3：固定到工具列（建議）

1. 點擊瀏覽器工具列的拼圖圖示（擴充功能）
2. 找到「LinkSmith YouTube Saver」
3. 點擊圖釘圖示固定

## 🎯 使用方法

### 方法 A：浮動按鈕（最快）

1. 打開任意 YouTube 影片頁面
2. 頁面右下角會出現紫色浮動按鈕：**🔗 Save to LinkSmith**
3. 點擊按鈕
4. 按鈕變成綠色 **✅ Saved!** 表示成功

### 方法 B：擴充功能彈窗

1. 打開任意 YouTube 影片頁面
2. 點擊工具列的 LinkSmith 圖示
3. 查看影片預覽和自動分類結果
4. 點擊「💾 Save to LinkSmith」

### 同步到 LinkSmith

1. 打開 LinkSmith 主應用（`index.html`）
2. 擴充功能保存的影片會**自動導入**
3. 導入後會在控制台顯示：`✅ Imported X new links from Chrome Extension`
4. 擴充功能的暫存空間會自動清空

## 🔍 自動分類範例

| 影片內容 | 自動分類結果 |
|----------|--------------|
| "Python Tutorial for Beginners" | 技術、教育 |
| "How to Design a Logo in Figma" | 設計 |
| "Stock Market Analysis 2024" | 理財、商業 |
| "Morning Routine for Productivity" | 生產力、個人成長 |
| "Cooking Pasta Like a Chef" | 美食 |
| "Travel Vlog - Tokyo Japan" | 旅遊、生活 |

完整分類規則請參考 `chrome-extension/README.md`。

## 🔄 跨裝置同步原理

```
電腦 A（YouTube）→ 擴充功能保存 → chrome.storage.sync
                                          ↓ (Chrome 自動同步)
電腦 B（YouTube）← chrome.storage.sync ← Google 帳號
                    ↓
              打開 LinkSmith → 自動導入 → LocalStorage
```

**重點**：
- 必須使用相同 Google 帳號登入 Chrome
- 同步是自動的，無需手動操作
- 每台電腦打開 LinkSmith 時會自動導入新影片

## 📊 儲存空間管理

### 限制
- **chrome.storage.sync**：100KB（約 50-100 個影片）
- **LocalStorage**：5-10MB（幾千個連結）

### 監控
- 擴充功能彈窗底部顯示使用百分比
- 超過 80% 會顯示警告
- 主控台會記錄詳細日誌

### 清空策略
- 影片同步到 LinkSmith 後，擴充功能暫存會**自動清空**
- 建議定期打開 LinkSmith 以觸發同步

## 🐛 常見問題排查

### Q1: 擴充功能載入失敗
**檢查**：
- 是否選擇了正確的 `chrome-extension/` 資料夾
- manifest.json 是否完整（不要手動編輯）
- Chrome 版本是否 ≥ 88（支援 Manifest V3）

### Q2: 浮動按鈕沒有出現
**檢查**：
- 是否在 YouTube 影片頁面（非首頁或搜尋頁）
- 控制台是否有錯誤訊息（F12 → Console）
- 嘗試重新整理頁面（Ctrl+Shift+R 硬重整理）

### Q3: 影片沒有導入到 LinkSmith
**檢查**：
- 擴充功能是否顯示「Saved!」成功訊息
- 打開 LinkSmith 主應用（`index.html`）
- 查看控制台日誌（應顯示 `✅ Imported X new links`）
- 檢查是否有 JavaScript 錯誤

### Q4: 跨裝置沒有同步
**檢查**：
- 是否使用相同 Google 帳號登入 Chrome
- 是否開啟 Chrome 同步功能（設定 → 同步和 Google 服務）
- 網路連線是否正常

## 🔧 開發者調試

### 查看背景服務日誌
1. 前往 `chrome://extensions/`
2. 找到 LinkSmith YouTube Saver
3. 點擊「檢查檢視」→「service worker」
4. 查看 Console

### 查看內容腳本日誌
1. 打開 YouTube 影片頁面
2. 按 F12 打開開發者工具
3. 查看 Console

### 修改分類規則
編輯 `chrome-extension/utils/classifier.js`：
```javascript
'tech': {
    name: '技術',
    keywords: ['程式', 'programming', 'AI', ...] // 添加更多關鍵字
}
```

## 📝 Git 提交記錄

已成功提交並推送到分支：
```
Branch: claude/linksmith-prd-setup-01Di6W2fZaTqRayDQAf6aeqQ
Commit: 4b359fb - Add Chrome Extension for YouTube video saving with auto-classification
Files: 10 files changed, 1312 insertions(+)
```

查看詳細變更：
```bash
git log --oneline -1
git show 4b359fb --stat
```

## 🎉 下一步

1. **安裝擴充功能**（3 分鐘）
2. **測試保存功能**：打開 YouTube 影片並保存
3. **檢查自動分類**：查看是否正確分類
4. **測試同步**：在另一台電腦登入相同 Google 帳號並測試
5. **自訂圖示**（可選）：製作專屬的擴充功能圖示

## 📚 完整文檔

詳細資訊請參考：
- `chrome-extension/README.md` - 完整文檔
- `chrome-extension/icons/README.md` - 圖示指南

---

**祝你使用愉快！ 🚀**

有任何問題歡迎隨時提出。
