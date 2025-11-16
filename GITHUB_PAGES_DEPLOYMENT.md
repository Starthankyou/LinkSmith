# 🚀 GitHub Pages 部署指南

LinkSmith 现已支持 GitHub Pages 部署！部署后不需要启动本地服务器即可使用。

---

## ✅ 已完成的配置

Extension 已配置完成，支持以下环境：

- ✅ **GitHub Pages（生产环境）**：`https://starthankyou.github.io/LinkSmith/`
- ✅ **Localhost（开发环境）**：`http://localhost:8000`

**Popup 按钮**：点击后打开 GitHub Pages

---

## 📋 GitHub Pages 设置步骤（5 分钟）

### 步骤 1：进入仓库设置

1. 打开浏览器，前往：https://github.com/Starthankyou/LinkSmith
2. 点击页面右上角的「**Settings**」（齿轮图标）

### 步骤 2：启用 GitHub Pages

1. 在左侧菜单找到「**Pages**」（在「Code and automation」分类下）
2. 在「**Build and deployment**」区域：
   - **Source**：选择「Deploy from a branch」
   - **Branch**：选择「`claude/linksmith-prd-setup-01Di6W2fZaTqRayDQAf6aeqQ`」
   - **Folder**：选择「`/ (root)`」
3. 点击「**Save**」按钮

### 步骤 3：等待部署完成

1. 页面会显示：「Your site is being built from the `claude/linksmith-prd-setup-01Di6W2fZaTqRayDQAf6aeqQ` branch」
2. 刷新页面，等待出现绿色背景的提示：
   ```
   ✅ Your site is live at https://starthankyou.github.io/LinkSmith/
   ```
3. 通常需要 **1-2 分钟**完成部署

### 步骤 4：验证部署成功

点击上方显示的 URL：`https://starthankyou.github.io/LinkSmith/`

应该会看到 LinkSmith 主页面载入成功。

---

## 🔄 更新 Chrome Extension（必须）

由于修改了 Extension 配置，需要更新 Extension：

### 方法 1：重新载入 Extension（如果本地有最新代码）

```bash
# 1. 拉取最新代码
cd 桌面/LinkSmith
git pull origin claude/linksmith-prd-setup-01Di6W2fZaTqRayDQAf6aeqQ

# 2. 前往 chrome://extensions/
# 3. 找到「LinkSmith YouTube Saver」
# 4. 点击重新载入按钮 🔄
```

### 方法 2：重新下载并安装（推荐）

```
1. 从 GitHub 下载最新 ZIP：
   https://github.com/Starthankyou/LinkSmith
   分支：claude/linksmith-prd-setup-01Di6W2fZaTqRayDQAf6aeqQ

2. 解压缩到桌面

3. 前往 chrome://extensions/

4. 移除旧的「LinkSmith YouTube Saver」

5. 点击「载入未封装项目」

6. 选择：桌面\LinkSmith\chrome-extension\

7. 完成！
```

---

## 🧪 完整测试流程

### 测试 1：在 YouTube 保存影片

```
1. 打开任意 YouTube 影片

2. 点击右下角浮动按钮「🔗 Save to LinkSmith」

3. 看到「✅ Saved!」

4. 完成！
```

### 测试 2：在 GitHub Pages 查看影片

```
1. 点击 Extension 图标（工具列）

2. 点击「🚀 Open LinkSmith」按钮

3. 会自动打开：https://starthankyou.github.io/LinkSmith/

4. 按 F12 查看 Console，应该显示：
   🔍 Checking for LinkSmith Extension...
   📨 Page ready, announcing extension presence
   🔗 LinkSmith Extension detected: [Extension ID]
   📤 Requesting sync from Extension
   📨 Received sync request from page
   📤 Syncing 1 links to web app
   ✅ Imported 1 new links from Chrome Extension
   🔄 Synced and cleared Chrome Extension storage

5. 关闭开发者工具，影片应该显示在列表中！
```

### 测试 3：验证所有功能

在 GitHub Pages 上测试：

- ✅ Dashboard 页面显示影片卡片
- ✅ 可以点击 ▶️ Play 内嵌播放
- ✅ 可以评分（点击星星）
- ✅ Random Picker 功能正常
- ✅ Tags 页面显示分类统计
- ✅ Import 页面可以批次导入

---

## 🎯 日常使用流程（不需要本地服务器）

### 保存影片

```
1. 在 YouTube 浏览影片
2. 看到想保存的，点击浮动按钮
3. 完成！
```

### 查看和管理

```
1. 点击 Extension 图标
2. 点击「Open LinkSmith」
3. 自动打开 GitHub Pages
4. 影片自动同步并显示
```

**不需要**：
- ❌ 启动本地服务器
- ❌ 打开终端
- ❌ 输入任何命令

**只需要**：
- ✅ 点击 Extension 图标
- ✅ 打开网页
- ✅ 一切自动完成

---

## 🔧 如果需要本地开发

开发新功能时，仍然可以使用 localhost：

```bash
# 1. 启动本地服务器
cd 桌面/LinkSmith
npx http-server -p 8000

# 2. 打开浏览器
http://localhost:8000

# 3. 测试功能
# Extension 同样可以与 localhost 通讯
```

两个环境可以**同时存在**，互不影响。

---

## 📊 环境对比

| 项目 | GitHub Pages | Localhost |
|------|--------------|-----------|
| **URL** | https://starthankyou.github.io/LinkSmith/ | http://localhost:8000 |
| **需要启动服务器** | ❌ 不需要 | ✅ 需要 |
| **随时可访问** | ✅ 是 | ❌ 需要运行服务器 |
| **跨设备访问** | ✅ 可以 | ❌ 只能本机 |
| **Extension 同步** | ✅ 支持 | ✅ 支持 |
| **修改代码立即生效** | ❌ 需要推送 | ✅ 立即生效 |
| **适合场景** | 日常使用 | 开发测试 |

---

## 🌐 跨设备使用

部署到 GitHub Pages 后，可以：

### 在其他电脑使用

```
1. 安装 Chrome 并登录同一 Google 账号
2. 安装「LinkSmith YouTube Saver」Extension
3. 打开 https://starthankyou.github.io/LinkSmith/
4. 自动同步所有影片（通过 chrome.storage.sync）
```

### 在手机/平板查看（只读）

虽然 Extension 只能在桌面 Chrome 运行，但可以：

```
1. 用手机浏览器打开：
   https://starthankyou.github.io/LinkSmith/

2. 可以查看所有已保存的影片（通过 LocalStorage）

3. 注意：手机无法使用 Extension 保存新影片
```

---

## ❓ 常见问题

### Q: GitHub Pages 部署失败怎么办？

**检查步骤**：
1. 确认分支名称正确：`claude/linksmith-prd-setup-01Di6W2fZaTqRayDQAf6aeqQ`
2. 等待 1-2 分钟让部署完成
3. 刷新 Settings → Pages 页面查看状态
4. 如果显示错误，查看「Actions」标签页的详细日志

### Q: 打开 GitHub Pages 显示 404？

**可能原因**：
- 部署还在进行中（等待 1-2 分钟）
- 分支选择错误
- 仓库设置为 Private（需要改为 Public）

**解决方法**：
1. 确认仓库是 Public
2. 重新检查 Pages 设置
3. 清除浏览器缓存并重新访问

### Q: Extension 无法与 GitHub Pages 通讯？

**检查清单**：
- ✅ Extension 已更新到最新版本
- ✅ 在 GitHub Pages 按 F12 查看 Console
- ✅ 应该看到「🔗 LinkSmith Extension helper loaded」
- ✅ 如果没有，重新载入 Extension

### Q: 影片没有自动同步？

**调试步骤**：
1. 打开 GitHub Pages
2. 按 F12 打开 Console
3. 查看是否有错误讯息
4. 手动刷新页面（F5）
5. 检查 Extension 是否有影片待同步（点击图标查看统计）

---

## 🎉 完成！

现在你可以：

- ✅ 在任何有网络的地方访问 LinkSmith
- ✅ 不需要启动本地服务器
- ✅ 点击 Extension 直接打开
- ✅ 自动同步所有影片
- ✅ 完整功能都可使用

**享受无缝的使用体验！** 🚀

---

**更新日期**：2025-01-16
**Commit**：f8f0479 - Add GitHub Pages support for production deployment
