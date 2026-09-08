import { describe, expect, it } from "vitest";
import { safePresentationIndex } from "./PresentOverlay";

describe("presentation index safety", () => {
  it("clamps stale selection after an undo or delete", () => {
    expect(safePresentationIndex(-1, 2)).toBe(0);
    expect(safePresentationIndex(9, 2)).toBe(1);
    expect(safePresentationIndex(0, 0)).toBe(0);
  });
});
