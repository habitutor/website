import { describe, expect, test } from "bun:test";
import { getSpotsLabel, parseHeroParticipants, type PtnEvent } from "./-lib";

const event = { phase: "upcoming", registrationCount: 40, isFull: false } as PtnEvent;
const full = { ...event, isFull: true } as PtnEvent;

describe("getSpotsLabel", () => {
  test("shows the participant count, never remaining seats", () => {
    expect(getSpotsLabel(event, true)).toBe("40 terdaftar");
    expect(getSpotsLabel({ ...event, phase: "ended" }, true)).toBe("40 peserta");
  });

  test("shows nothing while the admin hides participant counts", () => {
    expect(getSpotsLabel(event, false)).toBeNull();
    expect(getSpotsLabel({ ...event, phase: "ended" }, false)).toBeNull();
  });

  test("always says an event is full, so students know why they cannot register", () => {
    expect(getSpotsLabel(full, true)).toBe("Kuota penuh");
    expect(getSpotsLabel(full, false)).toBe("Kuota penuh");
  });
});

describe("parseHeroParticipants", () => {
  test("reads the admin's total and hides empty or invalid values", () => {
    expect(parseHeroParticipants("500")).toBe(500);
    expect(parseHeroParticipants("")).toBeNull();
    expect(parseHeroParticipants(undefined)).toBeNull();
    expect(parseHeroParticipants("0")).toBeNull();
    expect(parseHeroParticipants("abc")).toBeNull();
  });
});
