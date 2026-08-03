import { describe, expect, it } from "vitest";
import { translate } from "./editor-i18n";

describe("editor localization", () => {
  it("translates shared editor labels and interpolates values", () => {
    expect(translate("zh", "pageTitle", { count: 3 })).toBe("第 3 页");
    expect(translate("en", "pageTitle", { count: 3 })).toBe("Slide 3");
    expect(translate("en", "switchLanguageShort")).toBe("中文");
  });

  it("keeps the selected locale for status labels", () => {
    expect(translate("en", "saved")).toBe("Saved");
  });
});
