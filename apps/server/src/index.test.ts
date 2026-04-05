import { describe, expect, test } from "bun:test";
import server, { normalizeForwardedRequest } from "./index";

describe("server entry module", () => {
  test("normalizes protocol when forwarded as https", () => {
    const normalized = normalizeForwardedRequest(
      new Request("http://localhost/rpc", {
        headers: { "x-forwarded-proto": "https" },
      }),
    );
    expect(new URL(normalized.url).protocol).toBe("https:");
  });

  test("keeps protocol unchanged without forwarded https", () => {
    const normalized = normalizeForwardedRequest(new Request("http://localhost/rpc"));
    expect(new URL(normalized.url).protocol).toBe("http:");
  });

  test("exposes configured port", () => {
    expect(server.port).toBe(process.env.PORT || 3001);
  });
});
