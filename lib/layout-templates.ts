import type { Slide, SlideElement, TextElement } from "./presentation-schema";
import {
  LAYOUT_IDS,
  type LayoutCapacity,
  type LayoutId,
  type LayoutMeta,
} from "./layout-types";

export const LAYOUT_TEMPLATES: Record<LayoutId, LayoutMeta> = {
  cover: {
    id: "cover",
    label: "封面",
    labelEn: "Cover",
    description: "标题、摘要和少量定调信息",
    descriptionEn: "Title, subtitle, and a small amount of framing",
    capacity: { maxTextElements: 3, maxContentElements: 4 },
  },
  bullets: {
    id: "bullets",
    label: "要点",
    labelEn: "Bullets",
    description: "一个标题和三到五个要点",
    descriptionEn: "One title and three to five key points",
    capacity: { maxTextElements: 6, maxContentElements: 6 },
  },
  metrics: {
    id: "metrics",
    label: "指标",
    labelEn: "Metrics",
    description: "标题加三到四个重点数字",
    descriptionEn: "A title with three to four highlighted metrics",
    capacity: { maxTextElements: 5, maxContentElements: 8 },
  },
  comparison: {
    id: "comparison",
    label: "对比",
    labelEn: "Comparison",
    description: "两列信息或方案对照",
    descriptionEn: "Two columns for options or evidence",
    capacity: { maxTextElements: 7, maxContentElements: 8 },
  },
  process: {
    id: "process",
    label: "流程",
    labelEn: "Process",
    description: "三到五个按顺序排列的步骤",
    descriptionEn: "Three to five ordered steps",
    capacity: { maxTextElements: 6, maxContentElements: 8 },
  },
  chart: {
    id: "chart",
    label: "图表",
    labelEn: "Chart",
    description: "一个主要图表和一句结论",
    descriptionEn: "One main chart and a concise takeaway",
    capacity: { maxTextElements: 3, maxCharts: 2, maxContentElements: 4 },
  },
  "image-text": {
    id: "image-text",
    label: "图文",
    labelEn: "Image + text",
    description: "一张主图和一组说明文字",
    descriptionEn: "One hero image and supporting copy",
    capacity: { maxTextElements: 4, maxImages: 2, maxContentElements: 6 },
  },
  closing: {
    id: "closing",
    label: "结尾",
    labelEn: "Closing",
    description: "一个结论和下一步行动",
    descriptionEn: "A conclusion and a next action",
    capacity: { maxTextElements: 3, maxContentElements: 4 },
  },
};

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DEFAULT_CANVAS = { width: 1280, height: 720 };

function isText(element: SlideElement): element is TextElement {
  return element.type === "text";
}

// Page numbers are part of the visual chrome of a slide, not content that a
// layout needs to make room for. Keeping this distinction in the capacity
// check prevents every generated starter deck from opening with a false
// warning while preserving strict counts for user-authored copy.
function isAuxiliaryText(element: SlideElement) {
  return element.type === "text" && element.name === "page-number";
}

function titleScore(element: TextElement) {
  const name = (element.name || "").toLowerCase();
  const namedTitle = /title|headline|标题|主标题/.test(name) && !/subtitle|副标题/.test(name) ? 1000 : 0;
  return namedTitle + element.fontSize;
}

function getTextGroups(slide: Slide) {
  const text = slide.elements.filter(isText);
  const title = [...text].sort((a, b) => titleScore(b) - titleScore(a))[0];
  return { title, body: text.filter((element) => element.id !== title?.id) };
}

function move(element: SlideElement | undefined, box: Box) {
  if (!element || element.locked) return element;
  return { ...element, ...box };
}

function placeById(elements: SlideElement[], id: string | undefined, box: Box) {
  if (!id) return;
  const index = elements.findIndex((element) => element.id === id);
  if (index >= 0) elements[index] = move(elements[index], box) as SlideElement;
}

function placeTextList(elements: SlideElement[], text: TextElement[], boxes: Box[]) {
  text.slice(0, boxes.length).forEach((element, index) => placeById(elements, element.id, boxes[index]));
}

function gridBoxes(count: number, columns: number, startY: number, rowHeight: number, width: number, gap = 24, margin = 90): Box[] {
  const availableWidth = (width - 2 * margin - (columns - 1) * gap) / columns;
  return Array.from({ length: count }, (_, index) => ({
    x: margin + (index % columns) * (availableWidth + gap),
    y: startY + Math.floor(index / columns) * (rowHeight + gap),
    w: availableWidth,
    h: rowHeight,
  }));
}

export function getLayoutMeta(layout: LayoutId) {
  return LAYOUT_TEMPLATES[layout];
}

export function getLayoutCandidates(slide: Slide): LayoutMeta[] {
  const textCount = slide.elements.filter(isText).length;
  const chartCount = slide.elements.filter((element) => element.type === "chart").length;
  const imageCount = slide.elements.filter((element) => element.type === "image").length;
  const scores: Record<LayoutId, number> = {
    cover: textCount <= 3 ? 50 : 10,
    bullets: textCount >= 2 && textCount <= 6 ? 60 : 12,
    metrics: textCount >= 3 && textCount <= 5 ? 55 : 12,
    comparison: textCount >= 3 ? 45 : 10,
    process: textCount >= 3 && textCount <= 6 ? 48 : 10,
    chart: chartCount > 0 ? 100 : 5,
    "image-text": imageCount > 0 ? 95 : 5,
    closing: textCount <= 3 ? 42 : 8,
  };

  const eligible = LAYOUT_IDS
    .map((id) => LAYOUT_TEMPLATES[id])
    .filter((meta) => {
      if (meta.id === "chart" && chartCount === 0) return false;
      if (meta.id === "image-text" && imageCount === 0) return false;
      if (["metrics", "comparison", "process"].includes(meta.id) && textCount < 3) return false;
      return capacityViolations(slide, meta.id).length === 0;
    })
    .sort((a, b) => scores[b.id] - scores[a.id]);
  return eligible.length > 0 ? eligible : [LAYOUT_TEMPLATES.bullets];
}

export function inferLayout(slide: Slide): LayoutId {
  return slide.layout || getLayoutCandidates(slide)[0]?.id || "bullets";
}

export function applyLayoutToSlide(slide: Slide, layout: LayoutId, size = DEFAULT_CANVAS): Slide {
  const violations = capacityViolations(slide, layout);
  if (violations.length > 0) throw new Error(`无法应用版式：${violations.join("；")}`);
  const next = structuredClone(slide);
  next.layout = layout;
  const elements = next.elements;
  const margin = Math.max(32, Math.round(size.width * 0.07));
  const contentWidth = size.width - margin * 2;
  const { title, body } = getTextGroups(next);
  const charts = elements.filter((element) => element.type === "chart");
  const images = elements.filter((element) => element.type === "image");

  if (layout === "cover") {
    placeById(elements, title?.id, { x: margin + 40, y: 160, w: contentWidth - 80, h: 150 });
    placeTextList(elements, body, [
      { x: margin + 44, y: 345, w: contentWidth - 120, h: 100 },
      { x: margin + 44, y: 500, w: contentWidth - 120, h: 70 },
    ]);
  } else if (layout === "bullets") {
    placeById(elements, title?.id, { x: margin, y: 70, w: contentWidth, h: 92 });
    placeTextList(elements, body, gridBoxes(Math.min(body.length, 5), 1, 190, 72, size.width, 16, margin));
  } else if (layout === "metrics") {
    placeById(elements, title?.id, { x: margin, y: 65, w: contentWidth, h: 88 });
    placeTextList(elements, body, gridBoxes(Math.min(body.length, 4), Math.min(body.length, 4) || 1, 230, 210, size.width, 20, margin));
  } else if (layout === "comparison") {
    placeById(elements, title?.id, { x: margin, y: 65, w: contentWidth, h: 88 });
    const boxes = body.map((_, index) => ({
      x: index % 2 === 0 ? margin : size.width / 2 + 18,
      y: 205 + Math.floor(index / 2) * 112,
      w: size.width / 2 - margin - 18,
      h: 86,
    }));
    placeTextList(elements, body, boxes);
  } else if (layout === "process") {
    placeById(elements, title?.id, { x: margin, y: 65, w: contentWidth, h: 88 });
    const count = Math.min(body.length, 5);
    const gap = 22;
    const width = (contentWidth - (Math.max(count, 1) - 1) * gap) / Math.max(count, 1);
    placeTextList(
      elements,
      body,
      Array.from({ length: count }, (_, index) => ({ x: margin + index * (width + gap), y: 240, w: width, h: 220 })),
    );
  } else if (layout === "chart") {
    placeById(elements, title?.id, { x: margin, y: 55, w: contentWidth, h: 86 });
    if (charts[0]) placeById(elements, charts[0].id, { x: margin + 20, y: 170, w: contentWidth - 40, h: Math.max(260, size.height - 290) });
    placeTextList(elements, body.filter((element) => element.id !== charts[0]?.id), [
      { x: margin + 20, y: size.height - 96, w: contentWidth - 40, h: 54 },
      { x: margin + 20, y: size.height - 40, w: contentWidth - 40, h: 32 },
    ]);
  } else if (layout === "image-text") {
    placeById(elements, title?.id, { x: margin, y: 55, w: contentWidth, h: 86 });
    if (images[0]) placeById(elements, images[0].id, { x: size.width * 0.54, y: 175, w: size.width * 0.38, h: size.height - 260 });
    placeTextList(elements, body, [
      { x: margin, y: 205, w: size.width * 0.38, h: 100 },
      { x: margin, y: 330, w: size.width * 0.38, h: 100 },
      { x: margin, y: size.height - 190, w: size.width * 0.38, h: 90 },
    ]);
  } else if (layout === "closing") {
    placeById(elements, title?.id, { x: margin + 48, y: 220, w: contentWidth - 96, h: 130 });
    placeTextList(elements, body, [{ x: margin + 80, y: 390, w: contentWidth - 160, h: 90 }, { x: margin + 80, y: 520, w: contentWidth - 160, h: 70 }]);
  }

  // A document may use a custom aspect ratio. Keep every movable slot inside the
  // actual canvas even when a template's authored geometry was designed for 16:9.
  for (const element of elements) {
    if (element.locked) continue;
    element.x = Math.max(0, Math.min(element.x, Math.max(0, size.width - 8)));
    element.y = Math.max(0, Math.min(element.y, Math.max(0, size.height - 8)));
    element.w = Math.max(8, Math.min(element.w, size.width - element.x));
    element.h = Math.max(8, Math.min(element.h, size.height - element.y));
  }

  return next;
}

export function capacityViolations(slide: Slide, requestedLayout?: LayoutId, locale: "zh" | "en" = "zh") {
  const layout = requestedLayout || inferLayout(slide);
  const capacity: LayoutCapacity = getLayoutMeta(layout).capacity;
  const textCount = slide.elements.filter((element) => isText(element) && !isAuxiliaryText(element)).length;
  const chartCount = slide.elements.filter((element) => element.type === "chart").length;
  const imageCount = slide.elements.filter((element) => element.type === "image").length;
  const contentCount = slide.elements.filter((element) => element.type !== "shape" && !isAuxiliaryText(element)).length;
  const violations: string[] = [];
  const layoutName = locale === "en" ? getLayoutMeta(layout).labelEn : getLayoutMeta(layout).label;

  if (capacity.maxTextElements !== undefined && textCount > capacity.maxTextElements) {
    violations.push(locale === "en"
      ? `${textCount} text elements exceed the ${layoutName} capacity of ${capacity.maxTextElements}`
      : `文字元素 ${textCount} 个，超过 ${layoutName}版式容量 ${capacity.maxTextElements} 个`);
  }
  if (capacity.maxCharts !== undefined && chartCount > capacity.maxCharts) {
    violations.push(locale === "en"
      ? `${chartCount} charts exceed the ${layoutName} capacity of ${capacity.maxCharts}`
      : `图表 ${chartCount} 个，超过 ${layoutName}版式容量 ${capacity.maxCharts} 个`);
  }
  if (capacity.maxImages !== undefined && imageCount > capacity.maxImages) {
    violations.push(locale === "en"
      ? `${imageCount} images exceed the ${layoutName} capacity of ${capacity.maxImages}`
      : `图片 ${imageCount} 张，超过 ${layoutName}版式容量 ${capacity.maxImages} 张`);
  }
  if (capacity.maxContentElements !== undefined && contentCount > capacity.maxContentElements) {
    violations.push(locale === "en"
      ? `${contentCount} content elements exceed the ${layoutName} capacity of ${capacity.maxContentElements}`
      : `内容元素 ${contentCount} 个，超过 ${layoutName}版式容量 ${capacity.maxContentElements} 个`);
  }
  return violations;
}
