import { describe, expect, test } from "bun:test";
import { shouldRequirePremiumDialog } from "./social-access";

describe("shouldRequirePremiumDialog", () => {
  test("requires dialog when social link is missing", () => {
    expect(shouldRequirePremiumDialog({ socialLink: undefined, hasError: false })).toBe(true);
    expect(shouldRequirePremiumDialog({ socialLink: "", hasError: false })).toBe(true);
  });

  test("requires dialog when request has error", () => {
    expect(shouldRequirePremiumDialog({ socialLink: "https://wa.me/123", hasError: true })).toBe(true);
  });

  test("does not require dialog when link exists and request is healthy", () => {
    expect(shouldRequirePremiumDialog({ socialLink: "https://wa.me/123", hasError: false })).toBe(false);
  });
});
