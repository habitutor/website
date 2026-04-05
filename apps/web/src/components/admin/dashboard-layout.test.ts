import { describe, expect, test } from "bun:test";
import { generateBreadcrumbs } from "./dashboard-layout";

describe("generateBreadcrumbs", () => {
  test("creates labeled breadcrumbs for static admin paths", () => {
    const breadcrumbs = generateBreadcrumbs("/admin/practice-packs/create", []);
    expect(breadcrumbs).toEqual([
      { label: "Admin", href: "/admin/dashboard" },
      { label: "Practice Packs", href: "/admin/practice-packs" },
      { label: "Create" },
    ]);
  });

  test("maps contentId routes to content label", () => {
    const breadcrumbs = generateBreadcrumbs("/admin/questions/123456789", [
      {
        pathname: "/admin/questions/123456789",
        routeId: "/_authenticated/admin/questions/$contentId",
      },
    ]);
    expect(breadcrumbs.at(-1)).toEqual({ label: "Content" });
  });

  test("maps shortName routes to uppercase token", () => {
    const breadcrumbs = generateBreadcrumbs("/admin/classes/$ipa", [
      {
        pathname: "/admin/classes/$ipa",
        routeId: "/_authenticated/admin/classes/$shortName",
      },
    ]);
    expect(breadcrumbs.at(-1)).toEqual({ label: "IPA" });
  });

  test("uses shortened hash for numeric params without route hints", () => {
    const breadcrumbs = generateBreadcrumbs("/admin/users/123456789", []);
    expect(breadcrumbs.at(-1)).toEqual({ label: "#123456" });
  });
});
