import { describe, expect, test } from "bun:test";
import { canAccessContent, isFirstContent, isFirstSubtest } from "./content-access";

describe("canAccessContent", () => {
	describe("admin access", () => {
		test("admin can access any content", () => {
			expect(canAccessContent(false, "admin", 5, 10)).toBe(true);
		});

		test("admin can access first content", () => {
			expect(canAccessContent(false, "admin", 1, 1)).toBe(true);
		});
	});

	describe("premium access", () => {
		test("premium user can access any content", () => {
			expect(canAccessContent(true, "user", 5, 10)).toBe(true);
		});

		test("premium user can access first content", () => {
			expect(canAccessContent(true, "user", 1, 1)).toBe(true);
		});
	});

	describe("free user access", () => {
		test("free user can access first content of first subtest", () => {
			expect(canAccessContent(false, "user", 1, 1)).toBe(true);
		});

		test("free user cannot access second content of first subtest", () => {
			expect(canAccessContent(false, "user", 1, 2)).toBe(false);
		});

		test("free user cannot access first content of second subtest", () => {
			expect(canAccessContent(false, "user", 2, 1)).toBe(false);
		});

		test("free user cannot access arbitrary content", () => {
			expect(canAccessContent(false, "user", 3, 5)).toBe(false);
		});
	});

	describe("undefined role", () => {
		test("undefined role is treated as regular user", () => {
			expect(canAccessContent(false, undefined, 1, 1)).toBe(true);
			expect(canAccessContent(false, undefined, 2, 1)).toBe(false);
		});
	});
});

describe("isFirstSubtest", () => {
	test("returns true for order 1", () => {
		expect(isFirstSubtest(1)).toBe(true);
	});

	test("returns false for order > 1", () => {
		expect(isFirstSubtest(2)).toBe(false);
		expect(isFirstSubtest(10)).toBe(false);
	});

	test("returns false for order 0", () => {
		expect(isFirstSubtest(0)).toBe(false);
	});

	test("returns false for negative order", () => {
		expect(isFirstSubtest(-1)).toBe(false);
	});
});

describe("isFirstContent", () => {
	test("returns true for order 1", () => {
		expect(isFirstContent(1)).toBe(true);
	});

	test("returns false for order > 1", () => {
		expect(isFirstContent(2)).toBe(false);
		expect(isFirstContent(10)).toBe(false);
	});

	test("returns false for order 0", () => {
		expect(isFirstContent(0)).toBe(false);
	});

	test("returns false for negative order", () => {
		expect(isFirstContent(-1)).toBe(false);
	});
});
