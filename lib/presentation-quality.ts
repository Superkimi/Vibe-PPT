import type { PresentationDocument, SlideElement } from "./presentation-schema";
import { capacityViolations, inferLayout } from "./layout-templates";

export type QualityIssueKind =
  | "empty-slide"
  | "placeholder-text"
  | "chart-data-mismatch"
  | "text-capacity"
  | "text-overflow"
  | "image-load-failed"
  | "layout-capacity";

export interface QualityIssue {
  kind: QualityIssueKind;
  severity: "warning" | "error";
  slideId: string;
  slideTitle?: string;
  elementId?: string;
  message: string;
}

export interface PresentationQualityReport {
  issues: QualityIssue[];
  errors: number;
  warnings: number;
}

const PLACEHOLDER_TEXT = [
  "双击编辑文字",
  "这一页的核心观点",
  "请输入文本",
  "请输入",
  "Double-click to edit",
  "The core idea for this slide",
  "Untitled presentation",
  "未命名演示",
];

function issue(
  kind: QualityIssueKind,
  severity: QualityIssue["severity"],
  slideId: string,
  slideTitle: string,
  message: string,
  elementId?: string,
): QualityIssue {
  return { kind, severity, slideId, slideTitle, elementId, message };
}

function hasVisibleContent(element: SlideElement) {
  if (element.opacity <= 0 || element.w <= 0 || element.h <= 0) return false;
  return element.type !== "text" || element.text.trim().length > 0;
}

function estimateTextOverflow(element: Extract<SlideElement, { type: "text" }>) {
  const averageCharacterWidth = Math.max(element.fontSize * 0.52, 4);
  const charactersPerLine = Math.max(1, Math.floor(element.w / averageCharacterWidth));
  const estimatedLines = element.text.split("\n").reduce((total, line) => {
    return total + Math.max(1, Math.ceil([...line].length / charactersPerLine));
  }, 0);
  const estimatedHeight = estimatedLines * element.fontSize * element.lineHeight;
  return estimatedHeight > element.h * 1.08;
}

export function inspectDocument(document: PresentationDocument): PresentationQualityReport {
  const issues: QualityIssue[] = [];

  for (const slide of document.slides) {
    const visibleElements = slide.elements.filter(hasVisibleContent);
    if (visibleElements.length === 0) {
      issues.push(issue("empty-slide", "error", slide.id, slide.title, "这一页没有可见内容"));
    }

    const layout = inferLayout(slide);
    for (const violation of capacityViolations(slide)) {
      issues.push(issue("layout-capacity", "warning", slide.id, slide.title, `${layout}：${violation}`));
    }

    for (const element of slide.elements) {
      if (element.type === "text") {
        const text = element.text.trim();
        if (PLACEHOLDER_TEXT.some((placeholder) => text === placeholder || text.startsWith(`${placeholder}：`))) {
          issues.push(issue("placeholder-text", "warning", slide.id, slide.title, `发现占位文案：${text}`, element.id));
        }
        if (text && estimateTextOverflow(element)) {
          issues.push(issue("text-capacity", "warning", slide.id, slide.title, "文字可能超出当前文本框容量", element.id));
        }
      }

      if (element.type === "chart") {
        const invalidSeries = element.series.filter((series) => series.values.length !== element.labels.length);
        if (invalidSeries.length > 0) {
          issues.push(issue("chart-data-mismatch", "error", slide.id, slide.title, "图表标签和数据数量不一致", element.id));
        }
      }
    }
  }

  return summarizeQuality(issues);
}

export function scanRenderedSlides(root?: ParentNode): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const scope = root || (typeof document === "undefined" ? null : document);
  if (!scope) return issues;
  const seenSlides = new Set<string>();
  const renderers = scope.querySelectorAll<HTMLElement>(".slide-renderer[data-slide-id]");

  for (const renderer of renderers) {
    const slideId = renderer.dataset.slideId;
    if (!slideId || seenSlides.has(slideId)) continue;
    seenSlides.add(slideId);
    const slideTitle = renderer.dataset.slideTitle || slideId;
    const elements = renderer.querySelectorAll<HTMLElement>("[data-element-id]");

    for (const element of elements) {
      const elementId = element.dataset.elementId;
      if (!elementId) continue;
      const text = element.querySelector<HTMLElement>(".slide-text");
      if (text && (text.scrollHeight > text.clientHeight + 2 || text.scrollWidth > text.clientWidth + 2)) {
        issues.push(issue("text-overflow", "error", slideId, slideTitle, "渲染后文字超出文本框", elementId));
      }

      const image = element.querySelector<HTMLImageElement>("img.slide-image");
      if (image?.complete && image.naturalWidth === 0) {
        issues.push(issue("image-load-failed", "error", slideId, slideTitle, "图片加载失败", elementId));
      }
    }
  }

  return issues;
}

export function mergeQualityReports(
  documentReport: PresentationQualityReport,
  renderedIssues: QualityIssue[],
): PresentationQualityReport {
  const seen = new Set<string>();
  const issues = [...documentReport.issues, ...renderedIssues].filter((current) => {
    const key = [current.kind, current.slideId, current.elementId, current.message].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return summarizeQuality(issues);
}

function summarizeQuality(issues: QualityIssue[]): PresentationQualityReport {
  return {
    issues,
    errors: issues.filter((current) => current.severity === "error").length,
    warnings: issues.filter((current) => current.severity === "warning").length,
  };
}
