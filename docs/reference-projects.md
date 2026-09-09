# Vibe PPT 参考项目与来源记录

更新时间：2026-09-08

这份记录区分三类来源：模板/产品设计参考、运行时开源依赖，以及只用于调研的外部资料。它不把“功能相似”误写成代码来源，也不把 npm 依赖误写成模板来源。

## 模板与产品设计参考

### Dashi PPT Skill

- 仓库：[chuspeeism/dashi-ppt-skill](https://github.com/chuspeeism/dashi-ppt-skill)
- 许可证：AGPL-3.0
- README 公布的规模：12 套视觉主题、1020 个版式页面、8576 个可调控件和 20 种页面角色。
- 参考内容：主题命名、页面角色、内容容量和“先选视觉系统再生成演示”的使用流程。
- Vibe PPT 当前实现：以 Vibe 自己的 `PresentationDocument` schema 重新实现 12 套可编辑起始模板，见 [`template-sources.md`](./template-sources.md)。
- 未复制内容：Dashi 的代码、HTML 运行时、`layout-manifest`、素材和导出引擎均未打包进 Vibe PPT。

由于许可证和运行时不同，当前实现是“风格与结构的重新实现”，不是把 Dashi 页面文件直接搬进来。

### Vibe PPT 自身

- 仓库：[Superkimi/Vibe-PPT](https://github.com/Superkimi/Vibe-PPT)
- 项目本身不是外部参考来源；它是本项目的基础代码。
- 原有可复用能力包括 schema-first 文档模型、8 种容量约束版式、编辑器状态、质量检查和 PPTX 导出。

## 运行时开源依赖

这些项目通过 `package.json`/lockfile 被 Vibe PPT 使用，但不代表它们提供了 Vibe 的视觉模板：

| 项目 | 用途 | 许可证 |
| --- | --- | --- |
| [Next.js](https://github.com/vercel/next.js) / [React](https://github.com/facebook/react) | 页面、API 路由和 UI 运行时 | MIT |
| [Phosphor Icons](https://github.com/phosphor-icons/react) | 界面图标 | MIT |
| [react-rnd](https://github.com/bokuweb/react-rnd) | 画布元素拖拽和缩放 | MIT |
| [nanoid](https://github.com/ai/nanoid) | 页面和元素 ID | MIT |
| [Zod](https://github.com/colinhacks/zod) / [zod-to-json-schema](https://github.com/StefanTerdell/zod-to-json-schema) | 文档和 AI 响应校验 | MIT / ISC |
| [PptxGenJS](https://github.com/gitbrent/PptxGenJS) | PPTX 导出 | MIT |

## 调研资料（不是代码或模板来源）

- [Beautiful.ai Smart Slides](https://www.beautiful.ai/smart-slides)：用于理解内容容量和自动排版的产品思路。
- [Gamma 导出说明](https://help.gamma.app/en/articles/8022861-what-s-the-easiest-way-to-export-my-gamma)：用于明确网页编辑效果与 PPTX 导出的差异边界。
- [OWASP SSRF 防护指南](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)：用于 BYOK 自定义模型地址的安全设计。

这些资料没有被复制进代码，也不改变 Vibe PPT 的 MIT 许可证。

## 历史核查结论

在引入 Dashi 参考之前，Vibe PPT 仓库没有发现 fork、`Based on`、`Inspired by`、NOTICE 或第三方模板致谢记录；原有报告曾把这一点记录在工作区父目录的 `VIBE-PPT-REPORT.md`。从现在开始，以本文件和 `docs/template-sources.md` 作为仓库内的来源记录。

最早提交是 [`7c392de`](https://github.com/Superkimi/Vibe-PPT/commit/7c392de)，提交信息为 `feat: launch schema-driven AI presentation studio`。该提交一次性加入了完整应用，但没有声明上游仓库、模板来源、fork 关系或“基于某项目创建”。因此，**仅凭当前 Git 历史无法确认项目最初参考了哪个项目**；可以确认的只有上面的运行时依赖和后来明确引入的 Dashi 设计参考。
