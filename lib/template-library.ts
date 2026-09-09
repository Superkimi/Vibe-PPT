import { nanoid } from "nanoid";
import type {
  ChartElement,
  PresentationDocument,
  ShapeElement,
  Slide,
  SlideElement,
  TextElement,
} from "./presentation-schema";

export type TemplateLocale = "zh" | "en";

export const TEMPLATE_IDS = [
  "corporate-brief",
  "tech-launch",
  "developer-deck",
  "consumer-candy",
  "data-report",
  "strategy-dark",
  "research-white",
  "premium-launch",
  "editorial-blue",
  "finance-gold",
  "growth-electric",
  "music-neon",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type TemplateCategory =
  | "business"
  | "technology"
  | "research"
  | "brand"
  | "data"
  | "finance"
  | "creative";

export type TemplateComposition =
  | "cards"
  | "asymmetric"
  | "console"
  | "collage"
  | "data"
  | "atlas"
  | "research"
  | "minimal"
  | "editorial"
  | "ledger"
  | "growth"
  | "wave";

export interface TemplatePalette {
  background: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  accent3: string;
  line: string;
}

export interface PresentationTemplate {
  id: TemplateId;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  category: TemplateCategory;
  categoryEn: string;
  audience: string;
  audienceEn: string;
  sourceTheme: string;
  sourceLayouts: string[];
  palette: TemplatePalette;
  decoration: "soft" | "neon" | "code" | "candy" | "spectrum" | "atlas" | "research" | "gold" | "editorial" | "growth" | "wave";
  composition: TemplateComposition;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
}

const SANS = "var(--font-sans)";
const MONO = "var(--font-mono)";
const CANVAS = { width: 1280, height: 720 };

export const PRESENTATION_TEMPLATES: readonly PresentationTemplate[] = [
  {
    id: "corporate-brief",
    name: "轻拟态汇报",
    nameEn: "Soft Corporate Brief",
    description: "柔和留白、信息卡片和清晰的企业叙事。",
    descriptionEn: "Soft surfaces, generous whitespace, and a clear business narrative.",
    category: "business",
    categoryEn: "Business",
    audience: "企业汇报、产品介绍、方案说明",
    audienceEn: "Business updates, product introductions, and proposals",
    sourceTheme: "theme01",
    sourceLayouts: ["theme01_page001", "theme01_page003", "theme01_page007", "theme01_page084"],
    palette: { background: "#f7f5fb", surface: "#ffffff", text: "#211d28", muted: "#6c6575", accent: "#6650a4", accent2: "#46b083", accent3: "#e0a23a", line: "#e1dce8" },
    decoration: "soft",
    composition: "cards",
    title: "把复杂问题，讲成清晰方案。",
    titleEn: "Turn a complex problem into a clear plan.",
    subtitle: "一套适合团队汇报、产品介绍和内部决策的轻量模板。",
    subtitleEn: "A calm starting point for updates, product stories, and decisions.",
  },
  {
    id: "tech-launch",
    name: "炫光科技发布",
    nameEn: "Neon Tech Launch",
    description: "深色底、荧光色和大标题，适合让产品先被看见。",
    descriptionEn: "Dark surfaces, neon accents, and oversized type for product launches.",
    category: "technology",
    categoryEn: "Technology",
    audience: "AI、自动驾驶、机器人、科技发布",
    audienceEn: "AI, robotics, autonomy, and technology launches",
    sourceTheme: "theme02",
    sourceLayouts: ["theme02_page001", "theme02_page004", "theme02_page006", "theme02_page074"],
    palette: { background: "#151126", surface: "#211a3b", text: "#f8f5ff", muted: "#bbb2d3", accent: "#a6ff72", accent2: "#b18cff", accent3: "#ff6eb4", line: "#423665" },
    decoration: "neon",
    composition: "asymmetric",
    title: "下一代产品，正在发生。",
    titleEn: "The next product chapter is already happening.",
    subtitle: "用高对比度节奏呈现技术、突破和产品路线。",
    subtitleEn: "A high-contrast rhythm for technology, breakthroughs, and roadmap stories.",
  },
  {
    id: "developer-deck",
    name: "代码工程方案",
    nameEn: "Developer Systems",
    description: "代码感网格、等宽字体和结构化信息，适合技术方案。",
    descriptionEn: "Code-like grids, monospace labels, and structured technical storytelling.",
    category: "technology",
    categoryEn: "Technology",
    audience: "技术方案、架构评审、开发者大会",
    audienceEn: "Technical proposals, architecture reviews, and developer talks",
    sourceTheme: "theme03",
    sourceLayouts: ["theme03_page001", "theme03_page006", "theme03_page009", "theme03_page077"],
    palette: { background: "#0d1117", surface: "#151c26", text: "#e7edf5", muted: "#8995a6", accent: "#62d9a6", accent2: "#70a7ff", accent3: "#f3c969", line: "#2b3849" },
    decoration: "code",
    composition: "console",
    title: "系统如何把想法变成结果。",
    titleEn: "How the system turns an idea into an outcome.",
    subtitle: "把架构、依赖和交付路径放进同一张清晰的工程地图。",
    subtitleEn: "A structured canvas for architecture, dependencies, and delivery paths.",
  },
  {
    id: "consumer-candy",
    name: "玻璃糖果提案",
    nameEn: "Glass Candy Proposal",
    description: "明亮背景、半透明色块和轻快卡片，适合消费品牌。",
    descriptionEn: "Bright backgrounds, translucent color blocks, and playful product cards.",
    category: "brand",
    categoryEn: "Brand",
    audience: "消费产品、创意提案、社媒内容",
    audienceEn: "Consumer products, creative proposals, and social content",
    sourceTheme: "theme04",
    sourceLayouts: ["theme04_page001", "theme04_page004", "theme04_page006", "theme04_page074"],
    palette: { background: "#fff7fc", surface: "#ffffff", text: "#2e1f37", muted: "#806b88", accent: "#ff7cae", accent2: "#8dd8ff", accent3: "#ffd16b", line: "#f0dce9" },
    decoration: "candy",
    composition: "collage",
    title: "让品牌被看见，也被记住。",
    titleEn: "Make the brand visible and memorable.",
    subtitle: "用轻盈的视觉节奏承载品牌、用户和产品体验。",
    subtitleEn: "A light, expressive rhythm for brand, audience, and product experience.",
  },
  {
    id: "data-report",
    name: "色谱数据报告",
    nameEn: "Spectrum Data Report",
    description: "数据优先、彩色标记和清晰图表，适合研究与复盘。",
    descriptionEn: "Data-first layouts with spectrum accents for analysis and reviews.",
    category: "data",
    categoryEn: "Data",
    audience: "市场分析、KPI 复盘、行业研究",
    audienceEn: "Market analysis, KPI reviews, and industry research",
    sourceTheme: "theme05",
    sourceLayouts: ["theme05_page001", "theme05_page006", "theme05_page010", "theme05_page094"],
    palette: { background: "#f8fafc", surface: "#ffffff", text: "#172331", muted: "#637487", accent: "#ef5b5b", accent2: "#4d83e6", accent3: "#f4b942", line: "#dce5ee" },
    decoration: "spectrum",
    composition: "data",
    title: "数据把变化说清楚。",
    titleEn: "Let the data make the change clear.",
    subtitle: "把趋势、差异和结论组织成一份可以复盘的报告。",
    subtitleEn: "Organize trends, differences, and conclusions into a reviewable report.",
  },
  {
    id: "strategy-dark",
    name: "深色战略图谱",
    nameEn: "Dark Strategy Atlas",
    description: "深色地图式布局，适合战略、产业和高密度分析。",
    descriptionEn: "A dark atlas for strategy, industry maps, and dense analysis.",
    category: "business",
    categoryEn: "Business",
    audience: "战略分析、产业报告、投资人汇报",
    audienceEn: "Strategy analysis, industry reports, and investor updates",
    sourceTheme: "theme06",
    sourceLayouts: ["theme06_page001", "theme06_page006", "theme06_page015", "theme06_page083"],
    palette: { background: "#0c1628", surface: "#13243a", text: "#eef5ff", muted: "#9aadc4", accent: "#f4c95d", accent2: "#5da9ff", accent3: "#e776a7", line: "#2a405b" },
    decoration: "atlas",
    composition: "atlas",
    title: "在不确定性中做出选择。",
    titleEn: "Make a choice in the middle of uncertainty.",
    subtitle: "用地图、证据和优先级把战略判断放到同一张桌面上。",
    subtitleEn: "Put evidence, priorities, and strategic choices on the same table.",
  },
  {
    id: "research-white",
    name: "冷白调研白皮书",
    nameEn: "Cool White Research",
    description: "克制的冷白版式和细线结构，适合经得起追问的内容。",
    descriptionEn: "Restrained cool whites and fine rules for evidence-led reports.",
    category: "research",
    categoryEn: "Research",
    audience: "调研报告、白皮书、竞品分析",
    audienceEn: "Research reports, white papers, and competitive analysis",
    sourceTheme: "theme07",
    sourceLayouts: ["theme07_page001", "theme07_page006", "theme07_page010", "theme07_page071"],
    palette: { background: "#f3f5f6", surface: "#ffffff", text: "#1f2a32", muted: "#71808a", accent: "#2c7b87", accent2: "#d17b53", accent3: "#a6b9c3", line: "#d7e0e4" },
    decoration: "research",
    composition: "research",
    title: "一份经得起追问的研究。",
    titleEn: "A research story that holds up to questions.",
    subtitle: "先交代方法，再展示证据，最后留下可执行的判断。",
    subtitleEn: "Set the method, show the evidence, and leave a decision people can use.",
  },
  {
    id: "premium-launch",
    name: "黑金实验发布",
    nameEn: "Black Gold Launch",
    description: "黑底、金色线条和大留白，适合高端品牌与重要发布。",
    descriptionEn: "Black surfaces, gold rules, and spacious compositions for premium launches.",
    category: "brand",
    categoryEn: "Brand",
    audience: "高端发布、品牌提案、概念叙事",
    audienceEn: "Premium launches, brand proposals, and concept narratives",
    sourceTheme: "theme08",
    sourceLayouts: ["theme08_page001", "theme08_page005", "theme08_page009", "theme08_page084"],
    palette: { background: "#0b0a0c", surface: "#17151a", text: "#f5f0e7", muted: "#a39b91", accent: "#d9ad5b", accent2: "#f2d89b", accent3: "#7e6e8d", line: "#3b3230" },
    decoration: "gold",
    composition: "minimal",
    title: "把重要的事情，做成一次发布。",
    titleEn: "Turn the important thing into a launch.",
    subtitle: "为品牌、产品和创意概念保留足够的呼吸感与仪式感。",
    subtitleEn: "Leave room for ceremony, focus, and a premium product story.",
  },
  {
    id: "editorial-blue",
    name: "深蓝杂志专题",
    nameEn: "Deep Blue Editorial",
    description: "杂志式刊头、深蓝底和叙事化分栏，适合品牌故事。",
    descriptionEn: "Magazine mastheads, deep blue fields, and narrative columns for stories.",
    category: "brand",
    categoryEn: "Brand",
    audience: "品牌故事、人物访谈、深度专题",
    audienceEn: "Brand stories, interviews, and long-form features",
    sourceTheme: "theme09",
    sourceLayouts: ["theme09_page001", "theme09_page007", "theme09_page013", "theme09_page111"],
    palette: { background: "#0d2945", surface: "#143b5f", text: "#f0f5f8", muted: "#a8bdca", accent: "#ec9b62", accent2: "#70c3cf", accent3: "#dce46c", line: "#315773" },
    decoration: "editorial",
    composition: "editorial",
    title: "一个故事，值得被完整讲述。",
    titleEn: "A story worth telling in full.",
    subtitle: "用节奏、引文和章节让观众愿意继续往下读。",
    subtitleEn: "Use pacing, quotes, and chapters to keep people reading.",
  },
  {
    id: "finance-gold",
    name: "金色指数报告",
    nameEn: "Golden Index Report",
    description: "暖金、深棕和大数字，适合金融、投资与年度榜单。",
    descriptionEn: "Warm gold, deep brown, and large figures for finance and rankings.",
    category: "finance",
    categoryEn: "Finance",
    audience: "投资报告、商业指数、年度榜单",
    audienceEn: "Investment reports, business indices, and annual rankings",
    sourceTheme: "theme10",
    sourceLayouts: ["theme10_page001", "theme10_page005", "theme10_page009", "theme10_page095"],
    palette: { background: "#24180e", surface: "#352617", text: "#fff4dc", muted: "#c8ad88", accent: "#e7ad4b", accent2: "#f1d18b", accent3: "#78a9a1", line: "#5a4329" },
    decoration: "gold",
    composition: "ledger",
    title: "增长有轨迹，判断有依据。",
    titleEn: "Growth has a trail. Decisions need evidence.",
    subtitle: "让关键指标、排名和变化趋势成为一条可追溯的叙事线。",
    subtitleEn: "Make metrics, rankings, and movement part of a traceable story.",
  },
  {
    id: "growth-electric",
    name: "高能增长路演",
    nameEn: "Electric Growth Pitch",
    description: "明亮底色、强烈撞色和行动导向，适合增长与融资路演。",
    descriptionEn: "Bright fields, sharp color contrasts, and action-led pitch slides.",
    category: "business",
    categoryEn: "Business",
    audience: "增长复盘、商业计划、融资路演",
    audienceEn: "Growth reviews, business plans, and fundraising pitches",
    sourceTheme: "theme11",
    sourceLayouts: ["theme11_page001", "theme11_page006", "theme11_page010", "theme11_page087"],
    palette: { background: "#f1f0ea", surface: "#ffffff", text: "#172333", muted: "#687789", accent: "#2f6df6", accent2: "#ec5e73", accent3: "#f1b83b", line: "#d7dce3" },
    decoration: "growth",
    composition: "growth",
    title: "从增长信号，到下一步行动。",
    titleEn: "From growth signals to the next move.",
    subtitle: "把市场、产品和商业结果放进同一套有动作的叙事里。",
    subtitleEn: "Connect market, product, and business outcomes to a clear next move.",
  },
  {
    id: "music-neon",
    name: "声波霓虹现场",
    nameEn: "Neon Wave Live",
    description: "黑底、霓虹渐变和节奏线条，适合活动、音乐和年轻内容。",
    descriptionEn: "Black surfaces, neon gradients, and rhythmic lines for live content.",
    category: "creative",
    categoryEn: "Creative",
    audience: "音乐娱乐、潮流活动、直播内容",
    audienceEn: "Music, live events, streaming, and culture-led content",
    sourceTheme: "theme12",
    sourceLayouts: ["theme12_page001", "theme12_page006", "theme12_page010", "theme12_page086"],
    palette: { background: "#080b17", surface: "#11162b", text: "#f7f4ff", muted: "#a9a9ca", accent: "#ff55c7", accent2: "#64e8ff", accent3: "#b8ff67", line: "#2a3154" },
    decoration: "wave",
    composition: "wave",
    title: "让节奏成为记忆点。",
    titleEn: "Make the rhythm the memory.",
    subtitle: "适合把现场、内容和年轻品牌做成一场视觉演出。",
    subtitleEn: "Turn live moments, content, and youth culture into a visual performance.",
  },
] as const;

function localize(locale: TemplateLocale, zh: string, en: string) {
  return locale === "en" ? en : zh;
}

function id(prefix: string) {
  return `${prefix}-${nanoid(7)}`;
}

function shape(
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  options: Partial<Pick<ShapeElement, "radius" | "stroke" | "strokeWidth" | "shape" | "opacity" | "locked">> = {},
): ShapeElement {
  return {
    id: id(name),
    type: "shape",
    name,
    x,
    y,
    w,
    h,
    rotation: 0,
    opacity: options.opacity ?? 1,
    locked: options.locked ?? true,
    shape: options.shape ?? "rectangle",
    fill,
    stroke: options.stroke ?? "transparent",
    strokeWidth: options.strokeWidth ?? 0,
    radius: options.radius ?? 0,
  };
}

function text(
  name: string,
  content: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  options: Partial<Pick<TextElement, "fontFamily" | "fontSize" | "fontWeight" | "lineHeight" | "letterSpacing" | "align" | "valign" | "locked" | "opacity">> = {},
): TextElement {
  return {
    id: id(name),
    type: "text",
    name,
    x,
    y,
    w,
    h,
    rotation: 0,
    opacity: options.opacity ?? 1,
    locked: options.locked ?? false,
    text: content,
    fontFamily: options.fontFamily ?? SANS,
    fontSize: options.fontSize ?? 24,
    fontWeight: options.fontWeight ?? 500,
    lineHeight: options.lineHeight ?? 1.15,
    letterSpacing: options.letterSpacing ?? 0,
    color,
    align: options.align ?? "left",
    valign: options.valign ?? "top",
  };
}

function chart(
  name: string,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: TemplatePalette,
  locale: TemplateLocale,
): ChartElement {
  const labels = locale === "en" ? ["Jan", "Feb", "Mar", "Apr", "May"] : ["一月", "二月", "三月", "四月", "五月"];
  return {
    id: id(name),
    type: "chart",
    name,
    x,
    y,
    w,
    h,
    rotation: 0,
    opacity: 1,
    locked: false,
    chart: "bar",
    labels,
    series: [
      { name: "核心指标", values: [32, 48, 43, 68, 82], color: palette.accent },
      { name: "对照基线", values: [28, 35, 39, 45, 52], color: palette.accent2 },
    ],
    showLegend: true,
    showValues: false,
  };
}

function pageNumber(index: number, palette: TemplatePalette) {
  return text("page-number", String(index).padStart(2, "0"), 1120, 650, 72, 26, palette.accent, {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: 700,
    align: "right",
    valign: "middle",
  });
}

function decorations(template: PresentationTemplate, slideIndex: number) {
  const p = template.palette;
  const common: ShapeElement[] = [];
  switch (template.decoration) {
    case "soft":
      common.push(shape("soft-bar", 68, 72, 18, 575, p.accent, { radius: 9 }));
      common.push(shape("soft-orb", 920, 0, 360, 360, p.accent2, { shape: "ellipse", opacity: 0.11 }));
      common.push(shape("soft-card", 850, 510, 310, 100, p.surface, { radius: 22, stroke: p.line, strokeWidth: 1 }));
      break;
    case "neon":
      common.push(shape("neon-orb", 810, -145, 470, 470, p.accent2, { shape: "ellipse", opacity: 0.17 }));
      common.push(shape("neon-pill", 80, 612, 420, 5, p.accent, { radius: 3 }));
      common.push(shape("neon-diagonal", 1000, 420, 260, 18, p.accent3, { radius: 9, opacity: 0.8 }));
      break;
    case "code":
      for (let x = 48; x < CANVAS.width; x += 96) common.push(shape("grid-v", x, 0, 1, CANVAS.height, p.line, { locked: true }));
      for (let y = 48; y < CANVAS.height; y += 72) common.push(shape("grid-h", 0, y, CANVAS.width, 1, p.line, { locked: true }));
      common.push(shape("code-accent", 70, 72, 7, 510, p.accent, { radius: 4 }));
      break;
    case "candy":
      common.push(shape("candy-orb-a", 890, 0, 390, 390, p.accent2, { shape: "ellipse", opacity: 0.25 }));
      common.push(shape("candy-orb-b", 0, 420, 300, 300, p.accent, { shape: "ellipse", opacity: 0.18 }));
      common.push(shape("candy-pill", 76, 74, 145, 18, p.accent3, { radius: 9, opacity: 0.75 }));
      break;
    case "spectrum":
      common.push(shape("spectrum-a", 0, 0, 18, CANVAS.height, p.accent, { locked: true }));
      common.push(shape("spectrum-b", 18, 0, 7, CANVAS.height, p.accent3, { locked: true }));
      common.push(shape("spectrum-c", 25, 0, 5, CANVAS.height, p.accent2, { locked: true }));
      common.push(shape("spectrum-mark", 1030, 70, 160, 6, p.accent2, { radius: 3 }));
      break;
    case "atlas":
      common.push(shape("atlas-map", 760, 42, 460, 460, p.accent2, { shape: "ellipse", opacity: 0.12 }));
      common.push(shape("atlas-rule", 76, 622, 1120, 1, p.line, { locked: true }));
      common.push(shape("atlas-dot", 1070, 290, 18, 18, p.accent, { shape: "ellipse", opacity: 0.9 }));
      break;
    case "research":
      common.push(shape("research-rule", 76, 146, 1120, 1, p.line, { locked: true }));
      common.push(shape("research-column", 820, 0, 1, CANVAS.height, p.line, { locked: true }));
      common.push(shape("research-tag", 76, 66, 76, 22, p.accent, { radius: 3, opacity: 0.18 }));
      break;
    case "gold":
      common.push(shape("gold-frame", 56, 52, 1168, 610, "transparent", { radius: 2, stroke: p.accent, strokeWidth: 1 }));
      common.push(shape("gold-orb", 920, 0, 360, 360, p.accent, { shape: "ellipse", opacity: 0.08 }));
      common.push(shape("gold-rule", 90, 120, 210, 2, p.accent, { locked: true }));
      break;
    case "editorial":
      common.push(shape("editorial-band", 0, 0, 1280, 18, p.accent, { locked: true }));
      common.push(shape("editorial-rule", 78, 152, 1120, 2, p.accent2, { locked: true }));
      common.push(shape("editorial-stamp", 1035, 64, 130, 42, p.accent3, { radius: 3, opacity: 0.9 }));
      break;
    case "growth":
      common.push(shape("growth-bar", 82, 592, 250, 18, p.accent, { radius: 9 }));
      common.push(shape("growth-bar-2", 350, 592, 160, 18, p.accent2, { radius: 9 }));
      common.push(shape("growth-bar-3", 528, 592, 90, 18, p.accent3, { radius: 9 }));
      common.push(shape("growth-dot", 1070, 64, 74, 74, p.accent, { shape: "ellipse", opacity: 0.14 }));
      break;
    case "wave":
      for (let index = 0; index < 5; index += 1) {
        common.push(shape("wave-line", 680, 220 + index * 54, 500 - index * 46, 5, index % 2 ? p.accent2 : p.accent, { radius: 3, opacity: 0.8 - index * 0.08 }));
      }
      common.push(shape("wave-orb", 1020, 55, 120, 120, p.accent3, { shape: "ellipse", opacity: 0.15 }));
      break;
  }
  if (slideIndex === 4) common.push(shape("footer-rule", 78, 646, 1120, 1, p.line, { locked: true }));
  return common;
}

function makeSlide(template: PresentationTemplate, index: number, title: string, layout: Slide["layout"], elements: SlideElement[], locale: TemplateLocale): Slide {
  return {
    id: id(`slide-${template.id}`),
    title,
    layout,
    background: template.palette.background,
    transition: index === 1 ? "fade" : "slide",
    notes: localize(locale, `这一页使用「${template.name}」模板，可继续替换标题、数据和备注。`, `This slide uses the ${template.nameEn} template. Replace the title, data, and notes as needed.`),
    elements: [...decorations(template, index), ...elements, pageNumber(index, template.palette)],
  };
}

function patchElements(slide: Slide, names: string | string[], patch: Record<string, unknown>): Slide {
  const targets = new Set(Array.isArray(names) ? names : [names]);
  return {
    ...slide,
    elements: slide.elements.map((element) =>
      targets.has(element.name || "") ? ({ ...element, ...patch } as SlideElement) : element,
    ),
  };
}

function patchAllText(slide: Slide, patch: Record<string, unknown>): Slide {
  return {
    ...slide,
    elements: slide.elements.map((element) =>
      element.type === "text" ? ({ ...element, ...patch } as SlideElement) : element,
    ),
  };
}

function removeElements(slide: Slide, names: string[]): Slide {
  const targets = new Set(names);
  return { ...slide, elements: slide.elements.filter((element) => !targets.has(element.name || "")) };
}

function addShape(slide: Slide, element: ShapeElement): Slide {
  return { ...slide, elements: [...slide.elements, element] };
}

function patchOverviewRows(
  slide: Slide,
  palette: TemplatePalette,
  options: { layout?: Slide["layout"]; x?: number; y?: number; width?: number; rowHeight?: number; gap?: number; radius?: number } = {},
) {
  let next: Slide = { ...slide, layout: options.layout || "process" };
  const x = options.x ?? 92;
  const y = options.y ?? 182;
  const width = options.width ?? 1040;
  const rowHeight = options.rowHeight ?? 86;
  const gap = options.gap ?? 22;
  for (let index = 0; index < 4; index += 1) {
    const rowY = y + index * (rowHeight + gap);
    next = patchElements(next, `overview-card-${index}`, {
      x,
      y: rowY,
      w: width,
      h: rowHeight,
      radius: options.radius ?? 12,
      fill: index === 1 ? palette.surface : palette.surface,
      stroke: palette.line,
      strokeWidth: 1,
    });
    next = patchElements(next, `overview-copy-${index}`, {
      x: x + 24,
      y: rowY + 14,
      w: width - 48,
      h: rowHeight - 24,
      fontSize: 18,
      lineHeight: 1.3,
    });
  }
  return next;
}

function patchMetricsRows(slide: Slide, palette: TemplatePalette, options: { x?: number; y?: number; width?: number; rowHeight?: number; gap?: number } = {}) {
  let next: Slide = { ...slide, layout: "metrics" };
  const x = options.x ?? 92;
  const y = options.y ?? 190;
  const width = options.width ?? 650;
  const rowHeight = options.rowHeight ?? 84;
  const gap = options.gap ?? 20;
  for (let index = 0; index < 3; index += 1) {
    const rowY = y + index * (rowHeight + gap);
    next = patchElements(next, `metric-card-${index}`, {
      x,
      y: rowY,
      w: width,
      h: rowHeight,
      radius: 8,
      fill: index === 1 ? palette.accent : palette.surface,
      stroke: index === 1 ? palette.accent : palette.line,
      strokeWidth: index === 1 ? 0 : 1,
    });
    next = patchElements(next, `metric-copy-${index}`, {
      x: x + 24,
      y: rowY + 14,
      w: width - 48,
      h: rowHeight - 22,
      fontSize: 27,
      lineHeight: 1.12,
      color: index === 1 ? palette.background : palette.text,
    });
  }
  return patchElements(next, "metrics-insight", {
    x: 820,
    y: 196,
    w: 330,
    h: 220,
    fontSize: 22,
    lineHeight: 1.35,
  });
}

function patchLargeChart(
  slide: Slide,
  options: { x?: number; y?: number; w?: number; h?: number; insightX?: number; insightY?: number; insightW?: number; insightH?: number } = {},
) {
  let next = patchElements(slide, "trend-chart", {
    x: options.x ?? 92,
    y: options.y ?? 176,
    w: options.w ?? 1080,
    h: options.h ?? 380,
  });
  next = patchElements(next, "chart-insight", {
    x: options.insightX ?? 92,
    y: options.insightY ?? 580,
    w: options.insightW ?? 650,
    h: options.insightH ?? 52,
    fontSize: 22,
    lineHeight: 1.25,
  });
  return patchElements(next, "chart-footnote", {
    x: options.insightX ?? 850,
    y: options.insightY ?? 580,
    w: options.insightW ?? 300,
    h: options.insightH ?? 52,
    fontSize: 15,
    lineHeight: 1.35,
  });
}

function centeredCover(slide: Slide, titleSize = 64) {
  let next = patchElements(slide, "cover-kicker", { x: 120, y: 84, w: 1040, align: "center" });
  next = patchElements(next, "cover-title", { x: 140, y: 210, w: 1000, h: 150, align: "center", fontSize: titleSize });
  return patchElements(next, "cover-subtitle", { x: 220, y: 390, w: 840, h: 82, align: "center", fontSize: 22 });
}

function centeredClosing(slide: Slide) {
  let next = patchElements(slide, "closing-title", { x: 140, y: 220, w: 1000, h: 112, align: "center" });
  next = patchElements(next, "closing-subtitle", { x: 200, y: 380, w: 880, h: 72, align: "center" });
  return patchElements(next, "closing-next", { x: 200, y: 520, w: 880, align: "center" });
}

function cardNames(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => `${prefix}-${index}`);
}

function applyTemplateComposition(template: PresentationTemplate, sourceSlides: Slide[]) {
  const p = template.palette;
  return sourceSlides.map((sourceSlide, index) => {
    let slide = sourceSlide;
    switch (template.composition) {
      case "cards":
        break;
      case "asymmetric":
        if (index === 0) {
          slide = patchElements(slide, "cover-kicker", { x: 682, y: 82, w: 480, align: "right" });
          slide = patchElements(slide, "cover-title", { x: 640, y: 190, w: 500, h: 180, align: "right", fontSize: 58 });
          slide = patchElements(slide, "cover-subtitle", { x: 700, y: 405, w: 440, h: 90, align: "right", fontSize: 21 });
          slide = addShape(slide, shape("asymmetric-rail", 600, 80, 3, 540, p.accent2, { radius: 2, opacity: 0.72 }));
        } else if (index === 1) {
          slide = patchOverviewRows(slide, p, { layout: "process", x: 92, y: 180, width: 1040, rowHeight: 84, gap: 20, radius: 10 });
          slide = patchElements(slide, "overview-title", { x: 92, y: 62, w: 1040, fontSize: 40 });
        } else if (index === 2) {
          slide = patchMetricsRows(slide, p, { x: 92, y: 184, width: 650, rowHeight: 86, gap: 18 });
        } else if (index === 3) {
          slide = patchLargeChart(slide, { x: 92, y: 180, w: 700, h: 350, insightX: 850, insightY: 208, insightW: 300, insightH: 150 });
        } else {
          slide = patchElements(slide, "closing-title", { x: 640, y: 220, w: 520, h: 160, align: "right", fontSize: 52 });
          slide = patchElements(slide, "closing-subtitle", { x: 720, y: 385, w: 430, align: "right" });
          slide = patchElements(slide, "closing-next", { x: 700, y: 535, w: 450, align: "right" });
        }
        break;
      case "console":
        slide = patchAllText(slide, { fontFamily: MONO });
        slide = addShape(slide, shape(`console-rule-${index}`, 92, 150, 1096, 3, p.accent, { radius: 2, opacity: 0.85 }));
        if (index === 0) {
          slide = patchElements(slide, "cover-title", { x: 92, y: 220, w: 1060, h: 140, fontSize: 54, letterSpacing: -1.4 });
          slide = patchElements(slide, "cover-subtitle", { x: 96, y: 395, w: 760, h: 78, fontSize: 20 });
        } else if (index === 1) {
          slide = patchOverviewRows(slide, p, { layout: "process", x: 92, y: 182, width: 1040, rowHeight: 84, gap: 18, radius: 0 });
        } else if (index === 2) {
          slide = patchMetricsRows(slide, p, { x: 92, y: 184, width: 720, rowHeight: 78, gap: 16 });
        } else if (index === 3) {
          slide = patchElements(slide, "trend-chart", { chart: "line", x: 92, y: 185, w: 1060, h: 350 });
          slide = patchElements(slide, "chart-insight", { x: 92, y: 568, w: 680, h: 48, fontSize: 19 });
          slide = patchElements(slide, "chart-footnote", { x: 840, y: 568, w: 310, h: 48, fontFamily: MONO, fontSize: 14 });
        } else {
          slide = patchElements(slide, "closing-title", { x: 92, y: 228, w: 1060, h: 120, fontSize: 52 });
          slide = patchElements(slide, "closing-subtitle", { x: 96, y: 392, w: 820, h: 72, fontSize: 21 });
        }
        break;
      case "collage":
        if (index === 0) {
          slide = centeredCover(slide, 58);
          slide = addShape(slide, shape("collage-sticker", 1000, 178, 150, 150, p.accent3, { shape: "ellipse", opacity: 0.22 }));
        } else if (index === 1) {
          slide = patchElements(slide, "overview-title", { x: 92, y: 60, w: 1050, align: "center", fontSize: 40 });
          for (let item = 0; item < 4; item += 1) {
            const x = item % 2 === 0 ? 92 : 650;
            const y = item < 2 ? 190 : 410;
            slide = patchElements(slide, `overview-card-${item}`, { x, y, w: 510, h: 150, radius: 34, fill: item % 2 ? p.accent2 : p.surface, stroke: item % 2 ? p.accent2 : p.line, strokeWidth: 1 });
            slide = patchElements(slide, `overview-copy-${item}`, { x: x + 26, y: y + 28, w: 458, h: 96, align: "center", color: item % 2 ? p.text : p.text, fontSize: 20 });
          }
        } else if (index === 2) {
          slide = patchElements(slide, cardNames("metric-card", 3), { radius: 72 });
          slide = patchElements(slide, cardNames("metric-copy", 3), { align: "center", fontSize: 29 });
        } else if (index === 3) {
          slide = patchLargeChart(slide, { x: 100, y: 180, w: 760, h: 350, insightX: 900, insightY: 220, insightW: 260, insightH: 150 });
        } else {
          slide = centeredClosing(slide);
        }
        break;
      case "data":
        if (index === 0) {
          slide = patchElements(slide, "cover-title", { x: 92, y: 166, w: 850, h: 160, fontSize: 60 });
          slide = patchElements(slide, "cover-subtitle", { x: 96, y: 360, w: 680, h: 90, fontSize: 22 });
        } else if (index === 1) {
          slide = patchOverviewRows(slide, p, { layout: "comparison", x: 92, y: 188, width: 1040, rowHeight: 82, gap: 18, radius: 4 });
        } else if (index === 2) {
          slide = patchElements(slide, cardNames("metric-card", 3), { radius: 6, h: 190, y: 206 });
          slide = patchElements(slide, cardNames("metric-copy", 3), { y: 248, fontSize: 35 });
          slide = patchElements(slide, "metrics-insight", { x: 96, y: 520, w: 980, h: 54, fontSize: 19 });
        } else if (index === 3) {
          slide = patchElements(slide, "trend-chart", { x: 92, y: 178, w: 1080, h: 382, showValues: true });
          slide = patchElements(slide, "chart-insight", { x: 92, y: 584, w: 710, h: 42, fontSize: 21 });
          slide = patchElements(slide, "chart-footnote", { x: 850, y: 584, w: 320, h: 42, fontSize: 14 });
        } else {
          slide = patchElements(slide, "closing-title", { x: 92, y: 202, w: 860, h: 126, fontSize: 54 });
        }
        break;
      case "atlas":
        if (index === 0) {
          slide = patchElements(slide, "cover-title", { x: 92, y: 188, w: 650, h: 160, fontSize: 58 });
          slide = patchElements(slide, "cover-subtitle", { x: 96, y: 382, w: 540, h: 92, fontSize: 21 });
        } else if (index === 1) {
          slide = patchElements(slide, "overview-title", { x: 92, y: 62, w: 820, fontSize: 40 });
          for (let item = 0; item < 4; item += 1) {
            const x = item % 2 === 0 ? 92 : 520;
            const y = item < 2 ? 190 : 392;
            slide = patchElements(slide, `overview-card-${item}`, { x, y, w: 380, h: 140, radius: 4, fill: item === 1 ? p.accent : p.surface, stroke: p.line, strokeWidth: 1 });
            slide = patchElements(slide, `overview-copy-${item}`, { x: x + 22, y: y + 22, w: 336, h: 98, color: item === 1 ? p.background : p.text, fontSize: 19 });
          }
        } else if (index === 2) {
          slide = patchElements(slide, "metric-card-1", { x: 500, y: 190, w: 330, h: 250, radius: 4, fill: p.accent });
          slide = patchElements(slide, "metric-copy-1", { x: 532, y: 240, w: 266, h: 140, fontSize: 38, color: p.background });
          slide = patchElements(slide, "metrics-insight", { x: 870, y: 220, w: 280, h: 160, fontSize: 20 });
        } else if (index === 3) {
          slide = patchLargeChart(slide, { x: 92, y: 182, w: 700, h: 350, insightX: 852, insightY: 210, insightW: 290, insightH: 160 });
        } else {
          slide = patchElements(slide, "closing-title", { x: 92, y: 216, w: 820, h: 128, fontSize: 56 });
        }
        break;
      case "research":
        if (index === 0) {
          slide = patchElements(slide, "cover-kicker", { x: 92, y: 74, w: 300, fontFamily: MONO });
          slide = patchElements(slide, "cover-title", { x: 92, y: 188, w: 760, h: 150, fontSize: 58 });
          slide = patchElements(slide, "cover-subtitle", { x: 96, y: 382, w: 650, h: 90, fontSize: 21 });
        } else if (index === 1) {
          slide = patchElements(slide, cardNames("overview-card", 4), { fill: "transparent", radius: 0, stroke: p.line, strokeWidth: 1 });
          slide = patchElements(slide, cardNames("overview-copy", 4), { fontSize: 18 });
        } else if (index === 2) {
          slide = patchElements(slide, cardNames("metric-card", 3), { fill: "transparent", radius: 0, stroke: p.line, strokeWidth: 1 });
          slide = patchElements(slide, cardNames("metric-copy", 3), { fontSize: 29 });
          slide = patchElements(slide, "metrics-insight", { x: 96, y: 520, w: 1000, h: 54, fontSize: 19 });
        } else if (index === 3) {
          slide = patchLargeChart(slide, { x: 92, y: 186, w: 690, h: 344, insightX: 842, insightY: 218, insightW: 300, insightH: 150 });
        } else {
          slide = patchElements(slide, "closing-title", { x: 92, y: 216, w: 760, h: 128, fontSize: 54 });
          slide = patchElements(slide, "closing-subtitle", { x: 96, y: 380, w: 680, h: 70, fontSize: 22 });
        }
        break;
      case "minimal":
        if (index === 0) slide = centeredCover(slide, 62);
        if (index === 1) {
          slide = removeElements(slide, cardNames("overview-card", 4));
          slide = patchOverviewRows(slide, p, { layout: "process", x: 110, y: 190, width: 980, rowHeight: 78, gap: 18, radius: 0 });
          slide = removeElements(slide, cardNames("overview-card", 4));
          slide = patchElements(slide, cardNames("overview-copy", 4), { x: 110, w: 980, align: "center", fontSize: 20 });
        }
        if (index === 2) {
          slide = patchMetricsRows(slide, p, { x: 110, y: 190, width: 980, rowHeight: 80, gap: 18 });
          slide = removeElements(slide, cardNames("metric-card", 3));
          slide = patchElements(slide, cardNames("metric-copy", 3), { x: 110, y: 204, w: 980, h: 68, align: "center", fontSize: 26, color: p.text });
        }
        if (index === 3) {
          slide = removeElements(slide, ["chart-footnote"]);
          slide = patchElements(slide, "trend-chart", { x: 110, y: 190, w: 980, h: 360 });
          slide = patchElements(slide, "chart-insight", { x: 160, y: 584, w: 880, h: 42, align: "center", fontSize: 20 });
        }
        if (index === 4) slide = centeredClosing(slide);
        break;
      case "editorial":
        if (index === 0) {
          slide = patchElements(slide, "cover-kicker", { x: 116, y: 70, w: 400, fontFamily: MONO });
          slide = patchElements(slide, "cover-title", { x: 116, y: 190, w: 700, h: 170, fontSize: 58 });
          slide = patchElements(slide, "cover-subtitle", { x: 120, y: 404, w: 660, h: 78, fontSize: 21 });
        } else if (index === 1) {
          slide = patchElements(slide, cardNames("overview-card", 4), { fill: "transparent", radius: 0, stroke: p.line, strokeWidth: 1 });
          slide = patchElements(slide, cardNames("overview-copy", 4), { fontSize: 19 });
        } else if (index === 2) {
          slide = patchElements(slide, cardNames("metric-card", 3), { radius: 0, fill: p.surface, stroke: p.line, strokeWidth: 1 });
          slide = patchElements(slide, "metric-card-1", { fill: p.accent, stroke: p.accent });
        } else if (index === 3) {
          slide = patchLargeChart(slide, { x: 112, y: 188, w: 650, h: 340, insightX: 840, insightY: 208, insightW: 300, insightH: 150 });
        } else {
          slide = patchElements(slide, "closing-title", { x: 116, y: 216, w: 740, h: 128, fontSize: 54 });
          slide = patchElements(slide, "closing-subtitle", { x: 120, y: 382, w: 680, h: 72, fontSize: 22 });
        }
        break;
      case "ledger":
        slide = patchAllText(slide, { fontFamily: MONO });
        if (index === 0) {
          slide = patchElements(slide, "cover-title", { x: 92, y: 190, w: 760, h: 154, fontSize: 56 });
          slide = patchElements(slide, "cover-subtitle", { x: 96, y: 390, w: 650, h: 84, fontSize: 20 });
        } else if (index === 1) {
          slide = patchOverviewRows(slide, p, { layout: "process", x: 92, y: 182, width: 1040, rowHeight: 80, gap: 18, radius: 0 });
        } else if (index === 2) {
          slide = patchMetricsRows(slide, p, { x: 92, y: 184, width: 720, rowHeight: 76, gap: 16 });
          slide = patchElements(slide, cardNames("metric-copy", 3), { h: 64, fontSize: 24 });
        } else if (index === 3) {
          slide = patchElements(slide, "trend-chart", { chart: "line", x: 92, y: 180, w: 1080, h: 370, showValues: true });
          slide = patchElements(slide, "chart-insight", { x: 92, y: 580, w: 700, h: 44, fontSize: 19 });
          slide = patchElements(slide, "chart-footnote", { x: 860, y: 580, w: 300, h: 44, fontSize: 14 });
        } else {
          slide = patchElements(slide, "closing-title", { x: 92, y: 228, w: 980, h: 116, fontSize: 54 });
        }
        break;
      case "growth":
        if (index === 0) {
          slide = patchElements(slide, "cover-title", { x: 92, y: 166, w: 820, h: 160, fontSize: 62 });
          slide = patchElements(slide, "cover-subtitle", { x: 96, y: 366, w: 720, h: 88, fontSize: 22 });
        } else if (index === 1) {
          slide = patchOverviewRows(slide, p, { layout: "process", x: 92, y: 182, width: 1040, rowHeight: 82, gap: 18, radius: 40 });
        } else if (index === 2) {
          for (let item = 0; item < 3; item += 1) {
            const x = 92 + item * 70;
            const width = 840 - item * 140;
            const y = 205 + item * 86;
            slide = patchElements(slide, `metric-card-${item}`, { x, y, w: width, h: 76, radius: 38, fill: item === 1 ? p.accent2 : p.surface, stroke: item === 1 ? p.accent2 : p.line, strokeWidth: 1 });
            slide = patchElements(slide, `metric-copy-${item}`, { x: x + 28, y: y + 12, w: width - 56, h: 60, fontSize: 24 });
          }
          slide = patchElements(slide, "metrics-insight", { x: 92, y: 560, w: 970, h: 44, fontSize: 19 });
        } else if (index === 3) {
          slide = patchElements(slide, "trend-chart", { chart: "line", x: 92, y: 178, w: 1080, h: 380, showValues: true });
          slide = patchElements(slide, "chart-insight", { x: 92, y: 586, w: 720, h: 38, fontSize: 21 });
          slide = patchElements(slide, "chart-footnote", { x: 860, y: 586, w: 300, h: 38, fontSize: 14 });
        } else {
          slide = patchElements(slide, "closing-title", { x: 92, y: 216, w: 820, h: 120, fontSize: 56 });
        }
        break;
      case "wave":
        if (index === 0) slide = centeredCover(slide, 60);
        if (index === 1) {
          slide = removeElements(slide, cardNames("overview-card", 4));
          slide = patchElements(slide, cardNames("overview-copy", 4), { x: 140, w: 1000, align: "center", fontSize: 22 });
          const waveRule = shape("wave-overview-rule", 140, 365, 1000, 4, p.accent2, { radius: 2, opacity: 0.72 });
          slide = addShape(slide, waveRule);
        }
        if (index === 2) {
          slide = patchElements(slide, cardNames("metric-card", 3), { radius: 60 });
          slide = patchElements(slide, cardNames("metric-copy", 3), { align: "center", fontSize: 29 });
        }
        if (index === 3) {
          slide = patchElements(slide, "trend-chart", { chart: "line", x: 92, y: 180, w: 1080, h: 380, showLegend: false, showValues: false });
          slide = patchElements(slide, "chart-insight", { x: 120, y: 588, w: 760, h: 38, fontSize: 21 });
          slide = patchElements(slide, "chart-footnote", { x: 920, y: 588, w: 240, h: 38, fontSize: 14 });
        }
        if (index === 4) slide = centeredClosing(slide);
        break;
    }
    return slide;
  });
}

function buildTemplateSlides(template: PresentationTemplate, locale: TemplateLocale) {
  const p = template.palette;
  const title = localize(locale, template.title, template.titleEn);
  const subtitle = localize(locale, template.subtitle, template.subtitleEn);
  const sectionTitle = localize(locale, "叙事结构与重点", "Narrative structure and focus");
  const metricTitle = localize(locale, "关键指标", "Key metrics");
  const chartTitle = localize(locale, "变化趋势与结论", "Trend and takeaway");
  const closingTitle = localize(locale, "下一步，从这里开始。", "The next move starts here.");
  const cover = makeSlide(template, 1, localize(locale, "封面", "Cover"), "cover", [
    text("cover-kicker", localize(locale, `${template.name} / VIBE PPT`, `${template.nameEn} / VIBE PPT`), 102, 76, 500, 24, p.accent, { fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: 1.2 }),
    text("cover-title", title, 102, 178, 850, 160, p.text, { fontFamily: SANS, fontSize: 64, fontWeight: 760, lineHeight: 1.04, letterSpacing: -2.4 }),
    text("cover-subtitle", subtitle, 106, 370, 680, 82, p.muted, { fontSize: 24, lineHeight: 1.42 }),
  ], locale);
  const overview = makeSlide(template, 2, sectionTitle, "comparison", [
    text("overview-title", sectionTitle, 92, 70, 840, 76, p.text, { fontSize: 44, fontWeight: 730, letterSpacing: -1.4 }),
    ...[
      ["01", localize(locale, "背景", "Context"), localize(locale, "听众需要先理解问题为什么值得解决。", "Explain why the problem deserves attention first.")],
      ["02", localize(locale, "发现", "Finding"), localize(locale, "把证据整理成一句可以复述的判断。", "Turn the evidence into a conclusion people can repeat.")],
      ["03", localize(locale, "方案", "Plan"), localize(locale, "把选择、路径和资源放进同一张图。", "Put choices, path, and resources on one map.")],
      ["04", localize(locale, "行动", "Action"), localize(locale, "用清楚的下一步结束这一轮讨论。", "End the discussion with a concrete next step."),],
    ].map(([number, label, detail], index) => {
      const x = index % 2 === 0 ? 92 : 650;
      const y = index < 2 ? 195 : 405;
      return [
        shape(`overview-card-${index}`, x, y, 510, 148, p.surface, { radius: template.decoration === "gold" ? 2 : 18, stroke: p.line, strokeWidth: 1 }),
        text(`overview-copy-${index}`, `${number}  ${label}\n${detail}`, x + 26, y + 25, 456, 96, p.text, { fontSize: 21, fontWeight: 560, lineHeight: 1.36 }),
      ];
    }).flat(),
  ], locale);
  const metrics = makeSlide(template, 3, metricTitle, "metrics", [
    text("metrics-title", metricTitle, 92, 68, 700, 76, p.text, { fontSize: 44, fontWeight: 730, letterSpacing: -1.4 }),
    ...[
      ["72%", localize(locale, "重点结论被看见", "Key conclusion visible")],
      ["4.8×", localize(locale, "内容复述效率", "Message recall")],
      ["01", localize(locale, "明确下一步", "Clear next move")],
    ].map(([value, label], index) => {
      const x = 92 + index * 365;
      return [
        shape(`metric-card-${index}`, x, 210, 325, 220, index === 1 ? p.accent : p.surface, { radius: template.decoration === "gold" ? 2 : 20, stroke: index === 1 ? p.accent : p.line, strokeWidth: index === 1 ? 0 : 1 }),
        text(`metric-copy-${index}`, `${value}\n${label}`, x + 28, 250, 270, 130, index === 1 ? template.palette.background : p.text, { fontSize: 31, fontWeight: 740, lineHeight: 1.25 }),
      ];
    }).flat(),
    text("metrics-insight", localize(locale, "先让核心数字形成节奏，再把证据放到下一页。", "Let the key numbers set the rhythm before the evidence arrives."), 96, 520, 860, 58, p.muted, { fontSize: 20, lineHeight: 1.35 }),
  ], locale);
  const chartSlide = makeSlide(template, 4, chartTitle, "chart", [
    text("chart-title", chartTitle, 92, 68, 720, 76, p.text, { fontSize: 44, fontWeight: 730, letterSpacing: -1.4 }),
    chart("trend-chart", 90, 178, 700, 350, p, locale),
    text("chart-insight", localize(locale, "趋势正在加速，差距来自执行节奏。", "The trend is accelerating. The gap comes from execution pace."), 850, 218, 320, 140, p.text, { fontSize: 28, fontWeight: 690, lineHeight: 1.18 }),
    text("chart-footnote", localize(locale, "数据可在右侧检查器中直接替换。", "Replace the data directly in the inspector."), 850, 392, 300, 70, p.muted, { fontSize: 16, lineHeight: 1.4 }),
  ], locale);
  const closing = makeSlide(template, 5, localize(locale, "结尾", "Closing"), "closing", [
    text("closing-title", closingTitle, 112, 218, 900, 112, p.text, { fontSize: 58, fontWeight: 760, lineHeight: 1.06, letterSpacing: -2 }),
    text("closing-subtitle", localize(locale, "把今天的判断，变成下一次可验证的行动。", "Turn today’s judgment into the next testable action."), 118, 370, 720, 72, p.muted, { fontSize: 25, lineHeight: 1.35 }),
    text("closing-next", localize(locale, "NEXT / 确认负责人 · 时间点 · 交付物", "NEXT / Owner · timing · deliverable"), 118, 525, 700, 40, p.accent, { fontFamily: MONO, fontSize: 14, fontWeight: 700, letterSpacing: 0.8 }),
  ], locale);
  return applyTemplateComposition(template, [cover, overview, metrics, chartSlide, closing]);
}

export function getPresentationTemplate(idValue: TemplateId) {
  return PRESENTATION_TEMPLATES.find((template) => template.id === idValue) || PRESENTATION_TEMPLATES[0];
}

export function createTemplateDocument(templateId: TemplateId, locale: TemplateLocale = "zh"): PresentationDocument {
  const template = getPresentationTemplate(templateId);
  const title = localize(locale, template.name, template.nameEn);
  const now = new Date().toISOString();
  return {
    format: "vibe-ppt/1",
    version: 1,
    id: id(`document-${template.id}`),
    title,
    size: CANVAS,
    theme: {
      background: template.palette.background,
      surface: template.palette.surface,
      text: template.palette.text,
      muted: template.palette.muted,
      accent: template.palette.accent,
      fontFamily: SANS,
      headingFamily: SANS,
    },
    slides: buildTemplateSlides(template, locale),
    createdAt: now,
    updatedAt: now,
  };
}
