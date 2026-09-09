import { describe, expect, it } from "vitest";
import { presentationSchema } from "./presentation-schema";
import { capacityViolations } from "./layout-templates";
import { inspectDocument } from "./presentation-quality";
import {
  createTemplateDocument,
  PRESENTATION_TEMPLATES,
  TEMPLATE_IDS,
} from "./template-library";

describe("presentation template library", () => {
  it("exposes the twelve curated style packs", () => {
    expect(PRESENTATION_TEMPLATES).toHaveLength(12);
    expect(PRESENTATION_TEMPLATES.map((template) => template.id)).toEqual([...TEMPLATE_IDS]);
    expect(new Set(PRESENTATION_TEMPLATES.map((template) => template.composition)).size).toBe(12);
  });

  it("creates schema-valid editable starter decks for every style", () => {
    for (const template of PRESENTATION_TEMPLATES) {
      const document = presentationSchema.parse(createTemplateDocument(template.id, "zh"));
      const slideIds = document.slides.map((slide) => slide.id);
      const elementIds = document.slides.flatMap((slide) => slide.elements.map((element) => element.id));

      expect(document.slides).toHaveLength(5);
      expect(new Set(slideIds).size).toBe(slideIds.length);
      expect(new Set(elementIds).size).toBe(elementIds.length);
      expect(document.slides[0].layout).toBe("cover");
      expect(document.slides.at(-1)?.layout).toBe("closing");
      expect(document.slides.flatMap((slide) => capacityViolations(slide))).toEqual([]);
      expect(inspectDocument(document).issues).toEqual([]);

      for (const element of document.slides.flatMap((slide) => slide.elements)) {
        if (element.type === "chart") {
          expect(element.series.every((series) => series.values.length === element.labels.length)).toBe(true);
        }
      }
    }
  });

  it("localizes the generated deck without changing its visual system", () => {
    const zh = createTemplateDocument("developer-deck", "zh");
    const en = createTemplateDocument("developer-deck", "en");

    expect(zh.title).toBe("代码工程方案");
    expect(en.title).toBe("Developer Systems");
    expect(zh.theme.background).toBe(en.theme.background);
    expect(zh.slides).toHaveLength(en.slides.length);
  });

  it("uses distinct compositions instead of only recoloring one slide skeleton", () => {
    const tech = createTemplateDocument("tech-launch", "zh");
    const premium = createTemplateDocument("premium-launch", "zh");
    const music = createTemplateDocument("music-neon", "zh");

    expect(tech.slides[1].layout).toBe("process");
    expect(premium.slides[1].elements.some((element) => element.name === "overview-card-0")).toBe(false);
    expect(music.slides[3].elements.find((element) => element.name === "trend-chart")?.type).toBe("chart");
    expect((music.slides[3].elements.find((element) => element.name === "trend-chart") as { chart?: string })?.chart).toBe("line");
  });
});
