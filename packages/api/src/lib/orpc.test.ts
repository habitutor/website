import { describe, expect, test } from "bun:test";
import { ORPC_ERROR_MESSAGES } from "./orpc";

describe("ORPC error contract", () => {
  test("exposes expected error keys", () => {
    expect(Object.keys(ORPC_ERROR_MESSAGES).sort()).toEqual(
      [
        "FORBIDDEN",
        "INTERNAL_SERVER_ERROR",
        "NOT_FOUND",
        "TOO_MANY_REQUESTS",
        "UNAUTHORIZED",
        "UNPROCESSABLE_CONTENT",
      ].sort(),
    );
  });

  test("uses explicit Indonesian-facing error messages", () => {
    expect(ORPC_ERROR_MESSAGES.NOT_FOUND.message).toContain("resource");
    expect(ORPC_ERROR_MESSAGES.UNAUTHORIZED.message).toContain("akses");
    expect(ORPC_ERROR_MESSAGES.TOO_MANY_REQUESTS.message).toContain("permintaan");
  });
});
