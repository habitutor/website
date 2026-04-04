import { describe, expect, test } from "bun:test";
import { generateResetPasswordEmail } from "./reset-password";

describe("generateResetPasswordEmail", () => {
  test("embeds recipient name and reset URL in the email body", () => {
    const html = generateResetPasswordEmail("Budi", "https://habitutor.id/reset?token=abc", "abc");

    expect(html).toContain("Halo Budi");
    expect(html).toContain("https://habitutor.id/reset?token=abc");
    expect(html).toContain("Atur Ulang Kata Sandi");
  });

  test("keeps the provided token out of rendered body when only URL should be shown", () => {
    const html = generateResetPasswordEmail("Sinta", "https://habitutor.id/reset", "raw-token-123");

    expect(html).not.toContain("raw-token-123");
  });
});
