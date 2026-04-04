import { describe, expect, test } from "bun:test";
import { canToggleHeadingDropdown } from "./heading-dropdown-menu";

describe("canToggleHeadingDropdown", () => {
  test("allows toggling only when editor exists and toggle is enabled", () => {
    expect(canToggleHeadingDropdown({ hasEditor: true, canToggle: true })).toBe(true);
    expect(canToggleHeadingDropdown({ hasEditor: false, canToggle: true })).toBe(false);
    expect(canToggleHeadingDropdown({ hasEditor: true, canToggle: false })).toBe(false);
  });
});
