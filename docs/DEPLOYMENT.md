# GitHub Pages 发布准备

## 发布流程

1. 遵循 `AGENTS.md` 检查并创建本地提交。
2. 确认 `BensonLaur/BesSoftware` 仓库和 `origin` 配置，推送 `main`。
3. 在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
4. 首次推送若早于 Pages 设置，可在 **Actions → Publish GitHub Pages → Run workflow** 手动触发。
5. 等待工作流成功，再以它输出的实际地址核验页面。默认项目地址预期为 `https://bensonlaur.github.io/BesSoftware/`。

工作流使用 Node.js 22 和内置复制构建，无需安装 npm 开发依赖。只把 `dist/` 上传为站点。

## 发布前检查

- `npm test`、`npm run build` 通过。
- 确认作品链接与介绍符合当时的发布状态。
- 用真实手机分别扫描两张码并核对实际收款人。浏览器检查只能确认图片文件与显示，不代替支付应用识别。

## 自定义域名

最终域名尚未确认，当前没有 `CNAME` 文件。确认域名后在 GitHub Pages 设置中绑定，并按 GitHub 当时文档配置 DNS、域名验证与 HTTPS。页面资源使用相对路径，可适配项目路径和域名根目录。

## 本地模拟项目路径

```powershell
npm run dev -- --base /BesSoftware/ --port 4174
```

打开 `http://127.0.0.1:4174/BesSoftware/`。
