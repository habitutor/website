import { describe, expect, test } from "bun:test";
import { cursor } from "../../../utils/cursor";

describe("cursor utils", () => {
  test("encodes and decodes cursor payloads losslessly", () => {
    const payload = {
      createdAt: "2026-04-04T12:30:00.000Z",
      id: "usage_123",
    };

    const encoded = cursor.encode(payload);

    expect(encoded).toBeString();
    expect(cursor.decode(encoded)).toEqual(payload);
  });

  test("throws for invalid cursor input", () => {
    expect(() => cursor.decode("not-a-valid-cursor")).toThrow("Invalid cursor");
  });
});
