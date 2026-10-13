# Bes 软件 · BesSoftware

**从热爱出发，做值得分享的软件。**

Bes 系列软件的个人作品入口，包含 BesLyric、Besktop、BesFuel、BesMapLab、BesTools，以及作品背后的创作故事。

## 本地预览

需要 Node.js 20 或更新版本。预览和构建仅使用 Node.js 内置模块，无需先安装依赖：

```powershell
cd D:\Projects\Benson\BesSoftware
npm run dev
```

打开 <http://127.0.0.1:4173/>。按 `Ctrl+C` 停止服务器。

所有运行资源均在项目内：系统字体、本地图标、地图数据、地图库与收款原图。请通过 HTTP 预览；直接双击 HTML 时，浏览器可能阻止地图数据加载。

## 页面内容

- 作品小体验：歌词打轴、桌面图标动画、油费估算、地图投影切换。
- BesTools：个人顺手工具集入口，可直接进入独立的随机密码生成器。
- 「热爱，慢慢有了模样。」不依赖作品数量，便于继续增加软件。
- 创作手记：BesLyric 从个人需求、学习到分享、跨平台的真实经历。
- 自愿支持：完整微信、支付宝收款图；展开时落雨并长成大树，收起时逆向变回小芽。
- 支持窄屏、深浅色、键盘操作和系统减少动态效果设置。

油费卡片使用固定演示参数，并明确标注为非当前油价。打赏动画只反映展开、收起，不检测付款。

## 验证

安装浏览器测试依赖后运行：

```powershell
npm ci
npm test
```

Windows 默认使用已安装的 Microsoft Edge。其他环境可先执行 `npx playwright install chromium`，再使用空的 `BES_BROWSER_CHANNEL` 环境变量选择 Playwright Chromium。也可指定 `BES_BROWSER_CHANNEL=chrome`。

浏览器测试会检查页面在 `/BesSoftware/` 子路径下的资源、四个体验、BesTools 入口、打赏图片、可逆动画、快速切换、320px 窄屏和减少动态效果；截图保存在不提交的 `test-results/`。

## 构建与发布

```powershell
npm run build
```

发布目录为 `dist/`。工作流只上传该目录，不上传文档、测试、开发依赖。

仓库使用 GitHub Actions 构建 GitHub Pages；启用 Pages 和检查发布结果的步骤见 [部署说明](docs/DEPLOYMENT.md)。

## 主要文件

| 文件 | 用途 |
| --- | --- |
| `index.html` | 页面文案、作品卡片、创作故事和支持入口 |
| `styles.css` | 响应式布局、深浅色和动画样式 |
| `app.js` | 作品体验、收款方式和生长动画 |
| `map.js` | 本地地图数据与投影切换 |
| `assets/support/` | 作者提供的收款原图 |
| `assets/vendor/` | 固定版本的前端依赖和许可 |
| `assets/data/` | Natural Earth 衍生的世界陆地数据 |

增加作品时，在 `index.html` 的 `.bes-grid` 中新增作品卡片，并按需要为体验补充脚本、样式；区域标题无需修改。

第三方资源与收款图片的归属见 [使用边界](docs/RIGHTS.md) 和 [第三方资源说明](assets/THIRD_PARTY_NOTICES.md)。
