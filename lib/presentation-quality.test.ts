import { describe, expect, it } from "vitest";
import { createStarterDocument } from "./starter-document";
import { inspectDocument, scanRenderedSlides } from "./presentation-quality";
import type { PresentationDocument } from "./presentation-schema";

describe("presentation quality checks", () => {
  it("detects empty slides and placeholder copy", () => {
    const document = createStarterDocument();
    const next = structuredClone(document) as PresentationDocument;
    const text = next.slides[0].elements.find((element) => element.type === "text");
    next.slides[0].elements = text ? [{ ...text, text: "双击编辑文字" }] : [];

    const report = inspectDocument(next);

    expect(report.issues.some((issue) => issue.kind === "placeholder-text")).toBe(true);
    expect(report.errors).toBe(0);
  });

  it("detects overflow and broken images in rendered slide markup", () => {
    document.body.innerHTML = `
      <div class="slide-renderer" data-slide-id="slide-1" data-slide-title="测试页">
        <div data-element-id="text-1"><div class="slide-text">内容</div></div>
        <div data-element-id="image-1"><img class="slide-image" /></div>
      </div>
    `;
    const text = document.querySelector<HTMLElement>('[data-element-id="text-1"] .slide-text')!;
    Object.defineProperties(text, {
      clientHeight: { value: 10 },
      clientWidth: { value: 100 },
      scrollHeight: { value: 30 },
      scrollWidth: { value: 100 },
    });
    const image = document.querySelector<HTMLImageElement>("img.slide-image")!;
    Object.defineProperties(image, {
      complete: { value: true },
      naturalWidth: { value: 0 },
    });

    const issues = scanRenderedSlides();

    expect(issues.map((issue) => issue.kind)).toEqual(["text-overflow", "image-load-failed"]);
  });

  it("detects chart data mismatches before rendering", () => {
    const document = createStarterDocument();
    const next = structuredClone(document) as PresentationDocument;
    next.slides[0].elements.push({
      id: "mismatched-chart",
      type: "chart",
      x: 100,
      y: 100,
      w: 500,
      h: 300,
      rotation: 0,
      opacity: 1,
      locked: false,
      chart: "bar",
      labels: ["一", "二"],
      series: [{ name: "数据", values: [1], color: "#6650a4" }],
      showLegend: false,
      showValues: false,
    } as never);

    const report = inspectDocument(next);

    expect(report.issues.some((issue) => issue.kind === "chart-data-mismatch")).toBe(true);
    expect(report.errors).toBeGreaterThan(0);
  });

  it("localizes quality messages for the English editor", () => {
    const document = createStarterDocument();
    const next = structuredClone(document) as PresentationDocument;
    const text = next.slides[0].elements.find((element) => element.type === "text");
    next.slides[0].elements = text ? [{ ...text, text: "Double-click to edit" }] : [];
    const report = inspectDocument(next, "en");
    expect(report.issues.find((issue) => issue.kind === "placeholder-text")?.message).toContain("Placeholder copy");
  });
});
