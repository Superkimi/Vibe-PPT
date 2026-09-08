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

const CANVAS_WIDTH = 1280;

function isText(element: SlideElement): element is TextElement {
  return element.type === "text";
}

function titleScore(element: TextElement) {
  const name = (element.name || "").toLowerCase();
  const namedTitle = /title|headline|标题|主标题/.test(name) ? 1000 : 0;
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

function gridBoxes(count: number, columns: number, startY: number, rowHeight: number, gap = 24): Box[] {
  const width = (CANVAS_WIDTH - 2 * 90 - (columns - 1) * gap) / columns;
  return Array.from({ length: count }, (_, index) => ({
    x: 90 + (index % columns) * (width + gap),
    y: startY + Math.floor(index / columns) * (rowHeight + gap),
    w: width,
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

  return LAYOUT_IDS
    .map((id) => LAYOUT_TEMPLATES[id])
    .sort((a, b) => scores[b.id] - scores[a.id]);
}

export function inferLayout(slide: Slide): LayoutId {
  return slide.layout || getLayoutCandidates(slide)[0]?.id || "bullets";
}

export function applyLayoutToSlide(slide: Slide, layout: LayoutId): Slide {
  const next = structuredClone(slide);
  next.layout = layout;
  const elements = next.elements;
  const { title, body } = getTextGroups(next);
  const charts = elements.filter((element) => element.type === "chart");
  const images = elements.filter((element) => element.type === "image");

  if (layout === "cover") {
    placeById(elements, title?.id, { x: 132, y: 160, w: 960, h: 150 });
    placeTextList(elements, body, [
      { x: 136, y: 345, w: 850, h: 100 },
      { x: 136, y: 500, w: 850, h: 70 },
    ]);
  } else if (layout === "bullets") {
    placeById(elements, title?.id, { x: 92, y: 70, w: 1080, h: 92 });
    placeTextList(elements, body, gridBoxes(Math.min(body.length, 5), 1, 190, 72, 16));
  } else if (layout === "metrics") {
    placeById(elements, title?.id, { x: 92, y: 65, w: 1080, h: 88 });
    placeTextList(elements, body, gridBoxes(Math.min(body.length, 4), Math.min(body.length, 4) || 1, 230, 210, 20));
  } else if (layout === "comparison") {
    placeById(elements, title?.id, { x: 92, y: 65, w: 1080, h: 88 });
    const boxes = body.map((_, index) => ({
      x: index % 2 === 0 ? 92 : 658,
      y: 205 + Math.floor(index / 2) * 112,
      w: 500,
      h: 86,
    }));
    placeTextList(elements, body, boxes);
  } else if (layout === "process") {
    placeById(elements, title?.id, { x: 92, y: 65, w: 1080, h: 88 });
    const count = Math.min(body.length, 5);
    const gap = 22;
    const width = (CANVAS_WIDTH - 184 - (Math.max(count, 1) - 1) * gap) / Math.max(count, 1);
    placeTextList(
      elements,
      body,
      Array.from({ length: count }, (_, index) => ({ x: 92 + index * (width + gap), y: 240, w: width, h: 220 })),
    );
  } else if (layout === "chart") {
    placeById(elements, title?.id, { x: 92, y: 55, w: 1080, h: 86 });
    if (charts[0]) placeById(elements, charts[0].id, { x: 112, y: 170, w: 1056, h: 430 });
    placeTextList(elements, body.filter((element) => element.id !== charts[0]?.id), [
      { x: 112, y: 615, w: 1056, h: 54 },
    ]);
  } else if (layout === "image-text") {
    placeById(elements, title?.id, { x: 92, y: 55, w: 1080, h: 86 });
    if (images[0]) placeById(elements, images[0].id, { x: 690, y: 175, w: 480, h: 390 });
    placeTextList(elements, body, [{ x: 92, y: 205, w: 500, h: 300 }, { x: 92, y: 530, w: 500, h: 90 }]);
  } else if (layout === "closing") {
    placeById(elements, title?.id, { x: 140, y: 220, w: 1000, h: 130 });
    placeTextList(elements, body, [{ x: 220, y: 390, w: 840, h: 90 }, { x: 220, y: 520, w: 840, h: 70 }]);
  }

  return next;
}

export function capacityViolations(slide: Slide) {
  const layout = inferLayout(slide);
  const capacity: LayoutCapacity = getLayoutMeta(layout).capacity;
  const textCount = slide.elements.filter(isText).length;
  const chartCount = slide.elements.filter((element) => element.type === "chart").length;
  const imageCount = slide.elements.filter((element) => element.type === "image").length;
  const contentCount = slide.elements.filter((element) => element.type !== "shape").length;
  const violations: string[] = [];

  if (capacity.maxTextElements !== undefined && textCount > capacity.maxTextElements) {
    violations.push(`文字元素 ${textCount} 个，超过 ${getLayoutMeta(layout).label}版式容量 ${capacity.maxTextElements} 个`);
  }
  if (capacity.maxCharts !== undefined && chartCount > capacity.maxCharts) {
    violations.push(`图表 ${chartCount} 个，超过 ${getLayoutMeta(layout).label}版式容量 ${capacity.maxCharts} 个`);
  }
  if (capacity.maxImages !== undefined && imageCount > capacity.maxImages) {
    violations.push(`图片 ${imageCount} 张，超过 ${getLayoutMeta(layout).label}版式容量 ${capacity.maxImages} 张`);
  }
  if (capacity.maxContentElements !== undefined && contentCount > capacity.maxContentElements) {
    violations.push(`内容元素 ${contentCount} 个，超过 ${getLayoutMeta(layout).label}版式容量 ${capacity.maxContentElements} 个`);
  }
  return violations;
}
