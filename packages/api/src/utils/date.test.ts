import { describe, expect, test } from "bun:test";
import { getStartOfDay } from "./date";

describe("getStartOfDay", () => {
	test("sets hours, minutes, seconds, and milliseconds to 0", () => {
		const date = new Date("2026-02-17T15:30:45.123");
		const result = getStartOfDay(date);

		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
		expect(result.getSeconds()).toBe(0);
		expect(result.getMilliseconds()).toBe(0);
	});

	test("preserves the date (year, month, day)", () => {
		const date = new Date("2026-02-17T15:30:45.123");
		const result = getStartOfDay(date);

		expect(result.getFullYear()).toBe(2026);
		expect(result.getMonth()).toBe(1);
		expect(result.getDate()).toBe(17);
	});

	test("returns a new date object (does not mutate input)", () => {
		const original = new Date("2026-02-17T15:30:45.123");
		const originalTime = original.getTime();

		getStartOfDay(original);

		expect(original.getTime()).toBe(originalTime);
		expect(original.getHours()).toBe(15);
	});

	test("uses current date when no argument provided", () => {
		const before = new Date();
		const result = getStartOfDay();
		const after = new Date();

		expect(result.getFullYear()).toBeGreaterThanOrEqual(before.getFullYear());
		expect(result.getFullYear()).toBeLessThanOrEqual(after.getFullYear());
		expect(result.getHours()).toBe(0);
		expect(result.getMinutes()).toBe(0);
	});

	test("handles midnight (already at start of day)", () => {
		const midnight = new Date("2026-02-17T00:00:00.000");
		const result = getStartOfDay(midnight);

		expect(result.getTime()).toBe(midnight.getTime());
	});

	test("handles end of day", () => {
		const endOfDay = new Date("2026-02-17T23:59:59.999");
		const result = getStartOfDay(endOfDay);

		expect(result.getFullYear()).toBe(2026);
		expect(result.getMonth()).toBe(1);
		expect(result.getDate()).toBe(17);
		expect(result.getHours()).toBe(0);
	});

	test("works with date string parsing edge cases", () => {
		const result = getStartOfDay(new Date("2026-12-31"));

		expect(result.getFullYear()).toBe(2026);
		expect(result.getMonth()).toBe(11);
		expect(result.getDate()).toBe(31);
	});
});
