import { nanoid } from "nanoid";
import {
  aiOperationSchema,
  presentationSchema,
  slideElementSchema,
  type AiOperation,
  type PresentationDocument,
  type Slide,
  type SlideElement,
} from "./presentation-schema";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function assertUniqueIds(document: PresentationDocument) {
  const slideIds = new Set<string>();
  for (const slide of document.slides) {
    if (slideIds.has(slide.id)) throw new Error(`重复的页面 ID：${slide.id}`);
    slideIds.add(slide.id);
    const elementIds = new Set<string>();
    for (const element of slide.elements) {
      if (elementIds.has(element.id)) throw new Error(`页面 ${slide.title} 中存在重复元素 ID`);
      elementIds.add(element.id);
    }
  }
}

function clampElement(element: SlideElement, width: number, height: number): SlideElement {
  const next = clone(element);
  next.w = Math.max(8, Math.min(next.w, width * 1.5));
  next.h = Math.max(8, Math.min(next.h, height * 1.5));
  next.x = Math.max(-next.w * 0.8, Math.min(next.x, width - next.w * 0.2));
  next.y = Math.max(-next.h * 0.8, Math.min(next.y, height - next.h * 0.2));
  return slideElementSchema.parse(next);
}

function normalizeSlide(slide: Slide, document: PresentationDocument): Slide {
  return {
    ...slide,
    id: slide.id || nanoid(),
    elements: slide.elements.map((element) =>
      clampElement({ ...element, id: element.id || nanoid() } as SlideElement, document.size.width, document.size.height),
    ),
  };
}

export function normalizeDocument(input: unknown): PresentationDocument {
  const document = presentationSchema.parse(input);
  const next = clone(document);
  next.slides = next.slides.map((slide) => normalizeSlide(slide, next));
  next.updatedAt = new Date().toISOString();
  assertUniqueIds(next);
  return presentationSchema.parse(next);
}

export function applyOperations(document: PresentationDocument, input: AiOperation[]): PresentationDocument {
  let next = clone(document);

  for (const rawOperation of input) {
    const operation = aiOperationSchema.parse(rawOperation);

    if (operation.op === "replace_document") {
      next = normalizeDocument(operation.document);
      continue;
    }

    if (operation.op === "set_theme") {
      next.theme = { ...next.theme, ...operation.patch };
      continue;
    }

    if (operation.op === "reorder_slides") {
      if (operation.slideIds.length !== next.slides.length) throw new Error("AI 返回的页面顺序不完整");
      const current = new Map(next.slides.map((slide) => [slide.id, slide]));
      if (new Set(operation.slideIds).size !== next.slides.length) throw new Error("AI 返回了重复的页面 ID");
      next.slides = operation.slideIds.map((slideId) => {
        const slide = current.get(slideId);
        if (!slide) throw new Error(`找不到页面 ${slideId}`);
        return slide;
      });
      continue;
    }

    const slideIndex =
      "slideId" in operation ? next.slides.findIndex((slide) => slide.id === operation.slideId) : -1;

    if ("slideId" in operation && slideIndex < 0) {
      throw new Error(`AI 操作引用了不存在的页面：${operation.slideId}`);
    }

    switch (operation.op) {
      case "replace_slide":
        next.slides[slideIndex] = normalizeSlide(operation.slide, next);
        break;
      case "insert_slide": {
        const insertAt =
          operation.afterSlideId === null
            ? 0
            : next.slides.findIndex((slide) => slide.id === operation.afterSlideId) + 1;
        if (operation.afterSlideId !== null && insertAt === 0) throw new Error("AI 指定的插入位置不存在");
        next.slides.splice(insertAt, 0, normalizeSlide(operation.slide, next));
        break;
      }
      case "delete_slide":
        if (next.slides.length === 1) throw new Error("演示文稿至少需要保留一页");
        next.slides.splice(slideIndex, 1);
        break;
      case "patch_slide":
        next.slides[slideIndex] = { ...next.slides[slideIndex], ...operation.patch };
        break;
      case "insert_element":
        next.slides[slideIndex].elements.push(
          clampElement(operation.element, next.size.width, next.size.height),
        );
        break;
      case "delete_element":
        next.slides[slideIndex].elements = next.slides[slideIndex].elements.filter(
          (element) => element.id !== operation.elementId,
        );
        break;
      case "patch_element": {
        const elementIndex = next.slides[slideIndex].elements.findIndex(
          (element) => element.id === operation.elementId,
        );
        if (elementIndex < 0) throw new Error(`找不到元素 ${operation.elementId}`);
        const current = next.slides[slideIndex].elements[elementIndex];
        const protectedKeys = new Set(["id", "type"]);
        const safePatch = Object.fromEntries(
          Object.entries(operation.patch).filter(([key]) => !protectedKeys.has(key)),
        );
        next.slides[slideIndex].elements[elementIndex] = clampElement(
          { ...current, ...safePatch } as SlideElement,
          next.size.width,
          next.size.height,
        );
        break;
      }
    }
  }

  next.updatedAt = new Date().toISOString();
  return normalizeDocument(next);
}

export function duplicateSlide(slide: Slide): Slide {
  return {
    ...clone(slide),
    id: nanoid(),
    title: `${slide.title} 副本`,
    elements: slide.elements.map((element) => ({ ...element, id: nanoid() })),
  };
}
