import { describe, expect, test } from "bun:test";
import { decodeCursor, encodeCursor } from "./index";

describe("admin referrals cursor helpers", () => {
  test("encodes and decodes cursor payloads losslessly", () => {
    const payload = {
      createdAt: "2026-04-04T12:30:00.000Z",
      id: "usage_123",
    };

    const encoded = encodeCursor(payload);

    expect(encoded).toBeString();
    expect(decodeCursor(encoded)).toEqual(payload);
  });

  test("throws for invalid cursor input", () => {
    expect(() => decodeCursor("not-a-valid-cursor")).toThrow("Invalid cursor");
  });
});
