import { describe, expect, test } from "bun:test";
import { applyListDropdownOpenChange } from "./list-dropdown-menu";

describe("applyListDropdownOpenChange", () => {
  test("returns next open state and forwards callback", () => {
    let callbackCalled = false;
    let callbackValue = false;
    const onOpenChange = (value: boolean) => {
      callbackCalled = true;
      callbackValue = value;
    };

    const result = applyListDropdownOpenChange(true, onOpenChange);

    expect(result).toBe(true);
    expect(callbackCalled).toBe(true);
    expect(callbackValue).toBe(true);
  });

  test("works without callback", () => {
    expect(applyListDropdownOpenChange(false)).toBe(false);
  });
});
