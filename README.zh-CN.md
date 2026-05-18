# MosaicElem

<p align="center">
  <b><a href="README.md">English</a></b>
  &nbsp;·&nbsp;
  <b>中文</b>
</p>

基于 **Manifest V3** 的 Chromium 扩展：在网页上**点选元素**，对其施加**模糊或马赛克式遮挡**，适合截图、录屏前的快速隐私处理。

## 插件官网（在线体验）

**线上地址：** [GitHub Pages](https://qdabiliuq.github.io/mosaic-elem/)（推送到 `main` 后由 [`.github/workflows/deploy-website.yml`](.github/workflows/deploy-website.yml) 自动部署）。

**本地预览：**

```bash
bash scripts/build-website.sh
npx --yes serve .website-dist
```

页面使用与扩展相同的打码引擎（`shared/mosaic-engine.js`）。扩展弹窗内 **插件官网 · 在线体验** 可打开扩展内置首页。

### 开启 GitHub Pages（首次）

1. 仓库 **Settings → Pages**
2. **Build and deployment → Source** 选 **GitHub Actions**
3. 推送到 `main`，等待 **Deploy website** 工作流完成

## 预览

<p align="center">
  <img src="screenshots/preview.png" alt="MosaicElem 扩展弹窗" width="360" />
  &nbsp;&nbsp;
  <img src="screenshots/preview2.png" alt="MosaicElem 网页打码效果" width="360" />
</p>

## 功能

- **点选模式** — 悬停高亮，点击目标切换打码；**Esc** 退出点选。
- **单一开关** — 弹窗内一键开启/关闭点选（可配合快捷键）。
- **多种遮挡样式** — 高斯模糊、像素格马赛克、纯色块、点阵/网点、斜条纹等。
- **模式记忆** — 所选样式写入存储，并在多标签间同步。
- **国际化** — 英文（`en`）与简体中文（`zh_CN`）。
- **稳定绘制** — 使用独立遮罩层，减少与页面 `::after`（如 Tailwind `after:`）冲突；对 `textarea`、`select`、常见文本类 `input` 使用包裹层，保证打码可用。

## 环境要求

- **Google Chrome**、**Microsoft Edge** 或其他 **Chromium MV3** 内核浏览器。

## 源码安装

1. 克隆仓库（或下载 ZIP 解压）。
2. 打开扩展管理页：
   - Chrome：`chrome://extensions`
   - Edge：`edge://extensions`
3. 开启 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择包含 `manifest.json` 的项目目录。

## 使用说明

1. 可按需固定 **MosaicElem** 图标。
2. 打开弹窗，选择**遮挡样式**，再点击 **开启选择元素 / 关闭选择元素**（或使用快捷键）。
3. 在页面上移动鼠标，**单击**目标元素施加打码；再次单击同一已打码区域可**取消**。
4. **Esc** 退出点选模式。
5. **清除全部马赛克** 会移除当前页面上所有已打码节点。

若安装或更新扩展时标签页已打开，请**刷新该标签页**一次以便内容脚本注入。

## 默认快捷键

| 平台 | 快捷键 |
| ---- | ------ |
| Windows / Linux / ChromeOS | **Ctrl + Shift + 1** |
| macOS | **Command + Shift + 1** |

可在扩展快捷键设置中修改：

- Chrome：`chrome://extensions/shortcuts`
- Edge：`edge://extensions/shortcuts`

`manifest.json` 中的建议键**不会**覆盖你已在浏览器里改过的绑定。

## 权限说明

| 权限 | 用途 |
| ---- | ---- |
| `storage` | 保存当前选择的遮挡样式。 |
| `activeTab` | 在你主动使用扩展时，让弹窗/快捷键能向当前活动标签页发消息。 |
| `<all_urls>`（主机权限） | 在访问的页面上注入内容脚本以实现点选与打码；本项目**不**连接外部统计服务器。 |

## 仓库结构

```
├── manifest.json
├── background.js
├── content.js
├── page-pick.js
├── popup.html / popup.css / popup.js
├── website/              # 官网与在线演示
├── shared/mosaic-engine.js
├── .github/workflows/    # GitHub Pages 部署
├── icons/
├── screenshots/          # 文档 / README 配图（可选）
└── _locales/
```

## 本地化

文案位于 `_locales/<语言>/messages.json`，默认语言见 `manifest.json` 中的 `default_locale`。

## 贡献

欢迎 Issue 与 PR；请尽量保持改动范围小、风格与现有代码一致。

## 许可证

仓库内暂未附带 `LICENSE` 文件；若公开发布，请自行补充（如 MIT 等）。
