import { describe, expect, it } from "vitest";
import { applyOperations, normalizeDocument } from "./document-operations";
import { createStarterDocument } from "./starter-document";
import { getLayoutCandidates } from "./layout-templates";

describe("presentation schema operations", () => {
  it("normalizes a valid starter document", () => {
    const document = normalizeDocument(createStarterDocument());
    expect(document.format).toBe("vibe-ppt/1");
    expect(document.slides[0].layout).toBe("cover");
  });

  it("applies a schema-checked element patch without allowing identity changes", () => {
    const document = createStarterDocument();
    const slide = document.slides[0];
    const element = slide.elements.find((candidate) => candidate.type === "text");
    expect(element).toBeTruthy();

    const next = applyOperations(document, [
      {
        op: "patch_element",
        slideId: slide.id,
        elementId: element!.id,
        patch: { text: "新的核心结论", id: "malicious-id", type: "shape" },
      },
    ]);

    const patched = next.slides[0].elements.find((candidate) => candidate.id === element!.id);
    expect(patched?.id).toBe(element!.id);
    expect(patched?.type).toBe("text");
    expect(patched && "text" in patched ? patched.text : "").toBe("新的核心结论");
  });

  it("rejects deleting the final slide", () => {
    const document = createStarterDocument();
    expect(() =>
      applyOperations(document, [{ op: "delete_slide", slideId: document.slides[0].id }]),
    ).toThrow("至少需要保留一页");
  });

  it("rejects incomplete slide reorders", () => {
    const document = createStarterDocument();
    const second = {
      ...document.slides[0],
      id: "second-slide",
      title: "第二页",
      elements: [],
    };
    const withTwo = { ...document, slides: [...document.slides, second] };
    expect(() =>
      applyOperations(withTwo, [{ op: "reorder_slides", slideIds: [document.slides[0].id] }]),
    ).toThrow("页面顺序不完整");
  });

  it("changes layout without changing slide content", () => {
    const document = createStarterDocument();
    const slide = document.slides[0];
    const textBefore = slide.elements
      .filter((element) => element.type === "text")
      .map((element) => ({ id: element.id, text: element.text }));

    const next = applyOperations(document, [
      { op: "apply_layout", slideId: slide.id, layout: "closing" },
    ]);

    expect(next.slides[0].layout).toBe("closing");
    expect(
      next.slides[0].elements
        .filter((element) => element.type === "text")
        .map((element) => ({ id: element.id, text: element.text })),
    ).toEqual(textBefore);
  });

  it("protects locked elements from AI patches and deletes", () => {
    const document = createStarterDocument();
    const slide = document.slides[0];
    const element = slide.elements.find((candidate) => candidate.type === "text")!;
    const locked = applyOperations(document, [{
      op: "patch_element",
      slideId: slide.id,
      elementId: element.id,
      patch: { locked: true },
    }]);
    expect(() => applyOperations(locked, [{
      op: "patch_element",
      slideId: slide.id,
      elementId: element.id,
      patch: { text: "不应被覆盖" },
    }])).toThrow("锁定元素不能修改");
    expect(() => applyOperations(locked, [{
      op: "delete_element",
      slideId: slide.id,
      elementId: element.id,
    }])).toThrow("锁定元素不能删除");
  });

  it("rejects a layout that cannot hold its content", () => {
    const document = createStarterDocument();
    const slide = document.slides[0];
    const tooManyText = {
      ...slide,
      elements: Array.from({ length: 7 }, (_, index) => ({
        ...slide.elements.find((element) => element.type === "text")!,
        id: `text-${index}`,
        text: `内容 ${index}`,
      })),
    };
    expect(() => applyOperations({ ...document, slides: [tooManyText] }, [{
      op: "apply_layout",
      slideId: tooManyText.id,
      layout: "cover",
    }])).toThrow("无法应用版式");
  });

  it("does not suggest chart or image layouts without those content types", () => {
    const slide = createStarterDocument().slides[0];
    const labels = getLayoutCandidates({ ...slide, elements: slide.elements.filter((element) => element.type === "text") });
    expect(labels.map((layout) => layout.id)).not.toContain("chart");
    expect(labels.map((layout) => layout.id)).not.toContain("image-text");
  });

  it("keeps layout slots inside a custom canvas", () => {
    const document = createStarterDocument();
    const compact = { ...document, size: { width: 640, height: 480 } };
    const next = applyOperations(compact, [{
      op: "apply_layout",
      slideId: compact.slides[0].id,
      layout: "cover",
    }]);
    for (const element of next.slides[0].elements) {
      expect(element.x + element.w).toBeLessThanOrEqual(640);
      expect(element.y + element.h).toBeLessThanOrEqual(480);
    }
  });
});
