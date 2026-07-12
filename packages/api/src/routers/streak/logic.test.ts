import { describe, expect, test } from "bun:test";
import { applyStreakActivity, getJakartaDayNumber, MAX_STREAK_SAVES, reconcileStreak, type StreakState } from "./logic";

// 2026-03-10 12:00 Jakarta time (UTC+7)
const NOW = new Date("2026-03-10T05:00:00.000Z");

function daysAgo(days: number, base = NOW): Date {
  return new Date(base.getTime() - days * 24 * 60 * 60 * 1000);
}

function state(overrides: Partial<StreakState> = {}): StreakState {
  return {
    streak: 5,
    lastStreakAt: daysAgo(1),
    streakSaves: 3,
    streakSavesUpdatedAt: null,
    ...overrides,
  };
}

describe("Jakarta day boundaries", () => {
  test("23:30 Jakarta and 00:30 Jakarta next day are different days", () => {
    // 23:30 Jakarta = 16:30 UTC; 00:30 Jakarta next day = 17:30 UTC same UTC day
    const lateNight = new Date("2026-03-10T16:30:00.000Z");
    const earlyMorning = new Date("2026-03-10T17:30:00.000Z");
    expect(getJakartaDayNumber(earlyMorning)).toBe(getJakartaDayNumber(lateNight) + 1);
  });
});

describe("applyStreakActivity", () => {
  test("first ever activity starts streak at 1", () => {
    const result = applyStreakActivity(state({ streak: 0, lastStreakAt: null }), NOW);
    expect(result.incremented).toBe(true);
    expect(result.next.streak).toBe(1);
  });

  test("consecutive day increments streak", () => {
    const result = applyStreakActivity(state({ streak: 5, lastStreakAt: daysAgo(1) }), NOW);
    expect(result.incremented).toBe(true);
    expect(result.next.streak).toBe(6);
  });

  test("multiple qualifying actions in one day increment only once", () => {
    const first = applyStreakActivity(state({ streak: 5, lastStreakAt: daysAgo(1) }), NOW);
    const second = applyStreakActivity(first.next, new Date(NOW.getTime() + 60_000));
    expect(second.incremented).toBe(false);
    expect(second.next.streak).toBe(6);
  });

  test("missed day is covered by a save and streak continues", () => {
    const result = applyStreakActivity(state({ streak: 5, lastStreakAt: daysAgo(2), streakSaves: 3 }), NOW);
    expect(result.savesConsumed).toBe(1);
    expect(result.next.streakSaves).toBe(2);
    expect(result.next.streak).toBe(6);
  });

  test("streak resets when misses exceed available saves", () => {
    const result = applyStreakActivity(state({ streak: 10, lastStreakAt: daysAgo(5), streakSaves: 2 }), NOW);
    expect(result.savesConsumed).toBe(0);
    expect(result.next.streakSaves).toBe(2);
    expect(result.next.streak).toBe(1);
  });
});

describe("reconcileStreak", () => {
  test("no change when last activity was today", () => {
    const result = reconcileStreak(state({ lastStreakAt: NOW }), NOW);
    expect(result.changed).toBe(false);
    expect(result.next.streak).toBe(5);
  });

  test("no change when last activity was yesterday (streak still alive)", () => {
    const result = reconcileStreak(state({ lastStreakAt: daysAgo(1) }), NOW);
    expect(result.changed).toBe(false);
  });

  test("consumes one save per missed day", () => {
    const result = reconcileStreak(state({ lastStreakAt: daysAgo(3), streakSaves: 3 }), NOW);
    expect(result.savesConsumed).toBe(2);
    expect(result.next.streakSaves).toBe(1);
    expect(result.next.streak).toBe(5);
  });

  test("does not consume saves twice for the same missed day", () => {
    const first = reconcileStreak(state({ lastStreakAt: daysAgo(2), streakSaves: 3 }), NOW);
    expect(first.savesConsumed).toBe(1);
    const second = reconcileStreak(first.next, new Date(NOW.getTime() + 60_000));
    expect(second.savesConsumed).toBe(0);
    expect(second.next.streakSaves).toBe(2);
  });

  test("resets streak to 0 when saves are insufficient", () => {
    const result = reconcileStreak(state({ streak: 20, lastStreakAt: daysAgo(10), streakSaves: 3 }), NOW);
    expect(result.next.streak).toBe(0);
    expect(result.next.lastStreakAt).toBeNull();
    expect(result.next.streakSaves).toBe(3);
  });

  test("regenerates one save per 7 days", () => {
    const result = reconcileStreak(
      state({ lastStreakAt: daysAgo(1), streakSaves: 1, streakSavesUpdatedAt: daysAgo(8) }),
      NOW,
    );
    expect(result.next.streakSaves).toBe(2);
  });

  test("regeneration caps at max even after a long absence", () => {
    const result = reconcileStreak(
      state({ streak: 0, lastStreakAt: null, streakSaves: 0, streakSavesUpdatedAt: daysAgo(100) }),
      NOW,
    );
    expect(result.next.streakSaves).toBe(MAX_STREAK_SAVES);
  });

  test("regenerated saves can cover missed days in the same reconcile", () => {
    const result = reconcileStreak(
      state({ streak: 5, lastStreakAt: daysAgo(2), streakSaves: 0, streakSavesUpdatedAt: daysAgo(7) }),
      NOW,
    );
    expect(result.next.streak).toBe(5);
    expect(result.next.streakSaves).toBe(0);
    expect(result.savesConsumed).toBe(1);
  });

  test("keeps partial regen progress by advancing the anchor in whole periods", () => {
    const result = reconcileStreak(
      state({ lastStreakAt: daysAgo(1), streakSaves: 0, streakSavesUpdatedAt: daysAgo(10) }),
      NOW,
    );
    expect(result.next.streakSaves).toBe(1);
    // Anchor advanced by exactly 7 days, keeping 3 days of progress toward the next save
    expect(result.next.streakSavesUpdatedAt?.getTime()).toBe(daysAgo(3).getTime());
  });
});
