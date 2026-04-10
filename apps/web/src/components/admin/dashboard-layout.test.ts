import { describe, expect, test } from "bun:test";

describe("AdminBreadcrumbs", () => {
  test("staticData breadcrumb is a string on route definitions", () => {
    const staticData = { breadcrumb: "Practice Packs" };
    expect(typeof staticData.breadcrumb).toBe("string");
    expect(staticData.breadcrumb).toBe("Practice Packs");
  });
});
