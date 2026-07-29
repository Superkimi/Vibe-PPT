# Vibe PPT

一个 Schema 驱动的在线 AI 演示编辑器。你可以通过对话生成或修改整套演示，也可以在画布中继续拖拽、缩放和精细编辑，最后导出 JSON 或可编辑的 PPTX。

## 能力

- 对话生成整套演示或局部修改当前页
- 稳定的页面与元素 ID，AI 操作先校验再写入
- 文字、形状、图片、柱状图、折线图和饼图
- 页面排序、复制、撤销、重做和演讲者备注
- 本地自动保存、JSON 导入导出和 PPTX 导出
- 自定义 OpenAI 兼容接口、模型、API Key 和温度

API Key 只保存在当前浏览器的 `localStorage`，请求经过项目自身的服务端路由转发，不会写入仓库。

## 本地运行

```bash
npm install
npm run dev
```

打开 `http://localhost:30241`。进入编辑器后，在右侧 Vibe AI 面板配置模型。

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

## License

MIT
