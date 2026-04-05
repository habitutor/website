import { describe, expect, test } from "bun:test";
import { DATA } from "./data";

describe("home DATA module contracts", () => {
  test("testimonials keep unique IDs and required display fields", () => {
    const ids = DATA.testimonials.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(DATA.testimonials.every((item) => item.name && item.title && item.desc && item.avatar)).toBe(true);
  });

  test("mentor entries keep unique IDs and required profile fields", () => {
    const ids = DATA.mentor.map((mentor) => mentor.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(DATA.mentor.every((mentor) => mentor.name && mentor.major && mentor.university && mentor.image)).toBe(true);
  });

  test("tryout pricing entries have features and CTA metadata", () => {
    for (const plan of Object.values(DATA.pricing_tryout)) {
      expect(plan.features.length).toBeGreaterThan(0);
      expect(plan.cta.label.length).toBeGreaterThan(0);
      expect(plan.cta.url.length).toBeGreaterThan(0);
    }
  });
});
