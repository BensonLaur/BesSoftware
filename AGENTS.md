# BesSoftware 工作约定

## Git 与发布

- 创建提交、远程仓库、推送和发布分别按用户当次授权执行，不自动扩大操作范围。

## 项目与设计

- 这是 Bes 系列软件的静态介绍入口，目标部署平台为 GitHub Pages。
- 保留已经确认的个人作品陈列室设计、创作故事、暖白与绿色调。
- 作品区域文案不绑定作品数量；当前包含 BesLyric、Besktop、BesFuel、BesMapLab。
- 收款图片完整保留，禁止裁剪、重绘或替换收款主体。
- 打赏展开：落雨后，小芽逐步长成树；收起：沿同一生长进度逆向还原。快速切换需要取消旧任务并保持形态连续。
- 动画只表达展开与收起状态，不检测或表示付款成功。尊重减少动态效果的系统设置。
- 浏览时仅访问本站静态资源。新增外部运行依赖前考虑稳定性，并保留第三方许可。

## 修改与验证

- 文本使用 UTF-8、纯 CRLF；仅检查并规范化本次触及的文件。
- 为边界条件、动画生命周期与取舍写简短中文注释。
- `npm run dev` 启动本地预览；`npm run build` 生成 `dist/`；`npm test` 验证浏览器交互与项目子路径。
- `dist/` 与测试截图不提交。GitHub Pages 只上传 `dist/` 中的静态发布文件。

## Git 提交

- 提交前先阅读本文件与近期 `git log`，使用 Conventional Commits 标题。
- 标题后空一行，正文写 2–4 条 `-` 要点，说明主要行为、边界与验证结果。
- 提交前运行 `powershell -NoProfile -File C:\Users\Benso\.codex\scripts\get-current-model.ps1`，只使用其唯一标准输出作为实际模型标识；失败时说明情况，不猜测。
- 提交末尾署名：`Co-Authored-By: Codex <model-slug> <noreply@openai.com>`。
