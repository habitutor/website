import { describe, expect, it } from "bun:test";
import {
  assertSlug,
  getEndsAt,
  getPhase,
  getRecordingAccess,
  isJoinWindowOpen,
  isMaterialUnlocked,
  normalizePhone,
  PtnTourError,
} from "./logic";

const startsAt = new Date("2026-11-20T12:30:00.000Z"); // 19.30 WIB
const event = { startsAt, durationMinutes: 120 };
const at = (iso: string) => new Date(iso);

describe("ptn tour phase", () => {
  it("moves from upcoming to live to ended", () => {
    expect(getPhase(event, at("2026-11-20T12:29:59.000Z"))).toBe("upcoming");
    expect(getPhase(event, at("2026-11-20T12:30:00.000Z"))).toBe("live");
    expect(getPhase(event, at("2026-11-20T14:29:59.000Z"))).toBe("live");
    expect(getPhase(event, at("2026-11-20T14:30:00.000Z"))).toBe("ended");
    expect(getEndsAt(startsAt, 120).toISOString()).toBe("2026-11-20T14:30:00.000Z");
  });

  it("opens the join window 15 minutes before start until the event ends", () => {
    expect(isJoinWindowOpen(event, at("2026-11-20T12:14:59.000Z"))).toBe(false);
    expect(isJoinWindowOpen(event, at("2026-11-20T12:15:00.000Z"))).toBe(true);
    expect(isJoinWindowOpen(event, at("2026-11-20T14:29:00.000Z"))).toBe(true);
    expect(isJoinWindowOpen(event, at("2026-11-20T14:30:00.000Z"))).toBe(false);
  });
});

describe("recording access", () => {
  const endsAt = at("2026-11-20T14:30:00.000Z");

  it("lets premium watch forever without registering", () => {
    expect(getRecordingAccess({ isPremium: true, registered: false, endsAt, freeDays: 30, now: at("2030-01-01T00:00:00.000Z") })).toEqual({
      allowed: true,
      expiresAt: null,
    });
  });

  it("requires registration for free accounts", () => {
    expect(getRecordingAccess({ isPremium: false, registered: false, endsAt, freeDays: 30, now: at("2026-11-21T00:00:00.000Z") })).toEqual({
      allowed: false,
      reason: "not_registered",
    });
  });

  it("limits free accounts to the configured number of days", () => {
    const ok = getRecordingAccess({ isPremium: false, registered: true, endsAt, freeDays: 30, now: at("2026-12-20T14:30:00.000Z") });
    expect(ok.allowed).toBe(true);
    const late = getRecordingAccess({ isPremium: false, registered: true, endsAt, freeDays: 30, now: at("2026-12-20T14:30:01.000Z") });
    expect(late).toEqual({ allowed: false, reason: "expired" });
  });

  it("treats 0 free days as unlimited", () => {
    expect(getRecordingAccess({ isPremium: false, registered: true, endsAt, freeDays: 0, now: at("2035-01-01T00:00:00.000Z") })).toEqual({
      allowed: true,
      expiresAt: null,
    });
  });
});

describe("material unlock", () => {
  it("keeps everything locked until the viewer is eligible", () => {
    expect(isMaterialUnlocked({ eligible: false, unlockAt: "after_register", phase: "ended" })).toBe(false);
  });

  it("opens after registration or after the event depending on the setting", () => {
    expect(isMaterialUnlocked({ eligible: true, unlockAt: "after_register", phase: "upcoming" })).toBe(true);
    expect(isMaterialUnlocked({ eligible: true, unlockAt: "after_event", phase: "live" })).toBe(false);
    expect(isMaterialUnlocked({ eligible: true, unlockAt: "after_event", phase: "ended" })).toBe(true);
  });
});

describe("input helpers", () => {
  it("normalizes Indonesian phone numbers", () => {
    expect(normalizePhone("0812-3456-7890")).toBe("081234567890");
    expect(normalizePhone("+62 812 3456 7890")).toBe("081234567890");
    expect(normalizePhone("6281234567890")).toBe("081234567890");
    expect(() => normalizePhone("12345")).toThrow(PtnTourError);
  });

  it("accepts only url-safe slugs", () => {
    expect(() => assertSlug("intro-snbt-2027")).not.toThrow();
    expect(() => assertSlug("Intro SNBT")).toThrow(PtnTourError);
    expect(() => assertSlug("-salah")).toThrow(PtnTourError);
  });
});
