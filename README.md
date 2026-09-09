# Vibe PPT

一个 Schema 驱动的在线 AI 演示编辑器。你可以通过对话生成或修改整套演示，也可以在画布中继续拖拽、缩放和精细编辑，最后导出 JSON 或可编辑的 PPTX。

## 能力

- 对话生成整套演示或局部修改当前页
- 稳定的页面与元素 ID，AI 操作先校验再写入
- 文字、形状、图片、柱状图、折线图和饼图
- 页面排序、复制、撤销、重做和演讲者备注
- IndexedDB 优先的本地自动保存（带恢复副本）、JSON 导入导出和 PPTX 导出
- 自定义 OpenAI 兼容接口、模型、API Key 和温度
- 8 种按内容容量约束的页面版式，换版式时保留文字、数据和图片
- 12 套可直接创建的风格模板：企业汇报、科技发布、技术方案、调研、数据、金融、品牌和潮流内容
- AI 生成后的文字溢出、占位文案、图片加载和图表数据质量检查

API Key 只保存在当前会话内存中，不会写入文档或 `localStorage`。请求经过项目自身的服务端路由转发到用户填写的模型地址；公开部署不会使用服务器兜底 Key。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:30241`。进入编辑器后，在右侧 Vibe AI 面板配置模型。

首次进入编辑器会打开模板库。也可以在顶部工具栏点击“模板”重新打开，按场景筛选后创建一份五页可编辑起始演示；应用模板会进入撤销历史，不会锁定后续编辑。

默认生产地址：

- 宣传页：`https://aihubhub.com/vibe-ppt`
- 编辑器：`https://aihubhub.com/vibe-ppt/studio`

## 工程检查

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

部署到子路径时，在构建阶段设置：

```bash
NEXT_PUBLIC_BASE_PATH=/vibe-ppt npm run build
```

## 文档格式

文档格式版本为 `vibe-ppt/1`，定义在 `lib/presentation-schema.ts`。AI 不直接输出任意 React 或 HTML，而是返回经过 Zod 校验的文档操作。这让撤销、重做、局部修改和未来格式迁移保持可控。

页面还会记录 `layout`（封面、要点、指标、对比、流程、图表、图文或结尾）。版式候选会按内容容量过滤；版式只调整元素位置和尺寸，不改写页面中的文字、数字、单位、图表数据或图片。生成和导入后，编辑器会在画布底部报告空页、占位文案、越界、文字容量、图表数据和图片加载问题，并可点击定位。

模板来源和复刻边界见 [`docs/template-sources.md`](docs/template-sources.md)；完整的参考项目、开源依赖和许可证记录见 [`docs/reference-projects.md`](docs/reference-projects.md)。模板使用 Vibe PPT 自己的 schema 和可编辑元素实现，没有把外部模板运行时或素材清单打包进应用。

## License

MIT
