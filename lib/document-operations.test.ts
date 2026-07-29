import { describe, expect, it } from "vitest";
import { applyOperations, normalizeDocument } from "./document-operations";
import { createStarterDocument } from "./starter-document";

describe("presentation schema operations", () => {
  it("normalizes a valid starter document", () => {
    const document = createStarterDocument();
    expect(normalizeDocument(document).format).toBe("vibe-ppt/1");
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
});
