import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChatCircleDots,
  CheckCircle,
  DownloadSimple,
  FilePpt,
  Layout,
  MagicWand,
  NotePencil,
  ShieldCheck,
  SlidersHorizontal,
} from "@phosphor-icons/react/dist/ssr";
import { BASE_PATH } from "@/lib/base-path";

const capabilities = [
  {
    title: "像聊天一样改 PPT",
    text: "重写当前页、补一张图表，或统一整套叙事。每次修改都能撤销。",
    icon: ChatCircleDots,
    className: "cap-chat",
  },
  {
    title: "画布仍然属于你",
    text: "文字、形状、图片和图表都可选择、拖拽、缩放与精细配置。",
    icon: Layout,
    className: "cap-canvas",
  },
  {
    title: "Schema 先行",
    text: "AI 输出先校验，再原子写入文档。错误响应不会破坏已有内容。",
    icon: ShieldCheck,
    className: "cap-schema",
  },
  {
    title: "可编辑 PPTX",
    text: "带着演讲者备注导出，继续在 PowerPoint 里交付。",
    icon: FilePpt,
    className: "cap-export",
  },
  {
    title: "模型由你配置",
    text: "连接 OpenAI 兼容接口，也能在开发环境使用本地模型。",
    icon: SlidersHorizontal,
    className: "cap-model",
  },
];

export default function HomePage() {
  return (
    <main className="marketing-page">
      <nav className="marketing-nav" aria-label="主导航">
        <Link href="/" className="marketing-brand">
          <span>V</span>
          <b>Vibe PPT</b>
        </Link>
        <div className="marketing-links">
          <a href="#workflow">工作方式</a>
          <a href="#capabilities">功能</a>
          <a href="#models">模型</a>
        </div>
        <Link href="/studio" className="nav-cta">开始创作 <ArrowRight size={15} /></Link>
      </nav>

      <section className="marketing-hero">
        <div className="hero-copy">
          <span className="hero-eyebrow"><MagicWand size={15} /> VIBE-NATIVE PRESENTATIONS</span>
          <h1><span>一句话，</span><span>长成好演示。</span></h1>
          <p>把目标、材料和反馈交给 AI，在同一画布里生成、修改并导出 PPTX。</p>
          <div className="hero-actions">
            <Link href="/studio" className="primary-cta">开始创作 <ArrowRight size={18} /></Link>
            <a href="#workflow" className="secondary-cta">看看怎么工作</a>
          </div>
        </div>
        <div className="hero-product" aria-label="Vibe PPT 编辑器实时预览">
          <div className="product-browser">
            <div className="browser-bar">
              <span /><span /><span />
              <b>vibe-ppt / studio</b>
            </div>
            <iframe src={`${BASE_PATH}/studio`} title="Vibe PPT 编辑器" tabIndex={-1} />
          </div>
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-image">
          <Image
            src={`${BASE_PATH}/images/presentation-editorial.png`}
            width={1536}
            height={1024}
            alt="六张淡紫、炭黑和珊瑚色的演示页面印在厚纸上，展示图表、摄影和几何版式"
            priority
          />
        </div>
        <div className="workflow-copy">
          <h2>先聊清楚，再动手。</h2>
          <p>好的演示不从模板开始。它从受众、结论和行动开始。</p>
          <div className="workflow-list">
            <article>
              <MagicWand size={20} />
              <div><b>生成整套叙事</b><span>从主题、材料或大纲出发，建立页面节奏和演讲备注。</span></div>
            </article>
            <article>
              <NotePencil size={20} />
              <div><b>对话修改局部</b><span>选中当前页或元素，告诉 AI 哪一点需要更清楚。</span></div>
            </article>
            <article>
              <DownloadSimple size={20} />
              <div><b>继续编辑和交付</b><span>保留画布控制权，完成后导出 JSON 或可编辑 PPTX。</span></div>
            </article>
          </div>
        </div>
      </section>

      <section className="schema-section">
        <div className="schema-copy">
          <h2>AI 不直接碰画布。</h2>
          <p>每轮对话先变成明确的结构化操作。校验通过后，文档才会更新。</p>
          <ul>
            <li><CheckCircle size={17} weight="fill" /> 稳定页面和元素 ID</li>
            <li><CheckCircle size={17} weight="fill" /> 小范围修改优先</li>
            <li><CheckCircle size={17} weight="fill" /> 完整历史记录与撤销</li>
          </ul>
        </div>
        <div className="schema-code" aria-label="Vibe PPT schema 操作示例">
          <header><span>operation.json</span><i>validated</i></header>
          <pre>{`{
  "op": "patch_element",
  "slideId": "market-proof",
  "elementId": "headline",
  "patch": {
    "text": "让结论先被看见。",
    "fontSize": 72,
    "color": "#211d28"
  }
}`}</pre>
        </div>
      </section>

      <section className="capabilities-section" id="capabilities">
        <div className="section-heading">
          <h2>从第一句话，到最后一页。</h2>
          <p>生成速度和手工控制，不需要二选一。</p>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ title, text, icon: Icon, className }) => (
            <article key={title} className={className}>
              <Icon size={25} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="models-section" id="models">
        <div>
          <h2>模型由你决定，作品留在你的工作流。</h2>
          <p>配置 OpenAI 兼容的 API 地址、模型和 Key。密钥只保存在当前浏览器，不写入仓库。</p>
        </div>
        <div className="provider-list" aria-label="兼容模型类型">
          <span>OpenAI</span>
          <span>OpenRouter</span>
          <span>兼容 API</span>
          <span>Localhost</span>
        </div>
      </section>

      <section className="closing-section">
        <div>
          <ChatCircleDots size={31} />
          <h2>下一份演示，从一句话开始。</h2>
          <p>打开画布，告诉 Vibe AI 你要说服谁。</p>
        </div>
        <Link href="/studio" className="primary-cta">开始创作 <ArrowRight size={18} /></Link>
      </section>

      <footer className="marketing-footer">
        <Link href="/" className="marketing-brand"><span>V</span><b>Vibe PPT</b></Link>
        <p>由 aihubhub 打造。让想法更清楚地抵达。</p>
        <a href="https://github.com/Superkimi/Vibe-PPT" target="_blank" rel="noreferrer">GitHub</a>
      </footer>
    </main>
  );
}
