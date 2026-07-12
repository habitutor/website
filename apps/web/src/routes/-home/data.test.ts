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

  test("faq entries keep unique IDs and required fields", () => {
    const ids = DATA.faq.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(DATA.faq.every((item) => item.question && item.answer)).toBe(true);
  });
});
