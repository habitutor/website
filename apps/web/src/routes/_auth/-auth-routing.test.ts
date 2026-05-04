import { describe, expect, test } from "bun:test";
import { getPostLoginRedirectPath, getPostRegisterRedirectPath } from "./-auth-routing";

describe("getPostLoginRedirectPath", () => {
  test("routes admin to admin dashboard", () => {
    expect(getPostLoginRedirectPath("admin")).toBe("/admin/dashboard");
  });

  test("routes non-admin users to dashboard", () => {
    expect(getPostLoginRedirectPath("user")).toBe("/dashboard");
    expect(getPostLoginRedirectPath(undefined)).toBe("/dashboard");
  });
});

describe("getPostRegisterRedirectPath", () => {
  test("returns base dashboard when referral code is empty", () => {
    expect(getPostRegisterRedirectPath("")).toBe("/dashboard");
    expect(getPostRegisterRedirectPath("   ")).toBe("/dashboard");
  });

  test("returns encoded referral dashboard query when referral exists", () => {
    expect(getPostRegisterRedirectPath("AB CD")).toBe("/dashboard?referralCode=AB%20CD");
  });
});
