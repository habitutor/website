export const MAX_STREAK_SAVES = 3;
export const STREAK_SAVE_REGEN_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;
// Day boundaries follow Asia/Jakarta (UTC+7, no DST)
const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000;

export function getJakartaDayNumber(date: Date): number {
  return Math.floor((date.getTime() + JAKARTA_OFFSET_MS) / DAY_MS);
}

export function jakartaDayNumberToDate(dayNumber: number): Date {
  return new Date(dayNumber * DAY_MS - JAKARTA_OFFSET_MS);
}

export interface StreakState {
  streak: number;
  lastStreakAt: Date | null;
  streakSaves: number;
  streakSavesUpdatedAt: Date | null;
}

export interface StreakReconcileResult {
  next: StreakState;
  changed: boolean;
  savesConsumed: number;
}

/**
 * Brings a streak state up to date for "now":
 * - Regenerates 1 save per 7 elapsed days (capped at MAX_STREAK_SAVES, never stacking past the cap).
 * - Auto-consumes 1 save per missed day to keep the streak alive; resets the streak when saves run out.
 */
export function reconcileStreak(state: StreakState, now = new Date()): StreakReconcileResult {
  const today = getJakartaDayNumber(now);
  let { streak, lastStreakAt, streakSaves, streakSavesUpdatedAt } = state;
  let changed = false;
  let savesConsumed = 0;

  if (streakSaves < MAX_STREAK_SAVES) {
    const anchor = streakSavesUpdatedAt ?? now;
    const elapsedDays = today - getJakartaDayNumber(anchor);
    const gained = Math.floor(elapsedDays / STREAK_SAVE_REGEN_DAYS);
    if (gained > 0) {
      const regenerated = Math.min(MAX_STREAK_SAVES, streakSaves + gained);
      streakSavesUpdatedAt =
        regenerated >= MAX_STREAK_SAVES ? now : new Date(anchor.getTime() + gained * STREAK_SAVE_REGEN_DAYS * DAY_MS);
      streakSaves = regenerated;
      changed = true;
    }
  }

  if (streak > 0 && lastStreakAt) {
    const missedDays = today - getJakartaDayNumber(lastStreakAt) - 1;
    if (missedDays > 0) {
      if (streakSaves >= missedDays) {
        const wasAtCap = streakSaves >= MAX_STREAK_SAVES;
        streakSaves -= missedDays;
        savesConsumed = missedDays;
        // Regeneration timer starts counting once a save is spent from a full bank
        if (wasAtCap) streakSavesUpdatedAt = now;
        // Treat the covered days as active so they are not charged twice
        lastStreakAt = jakartaDayNumberToDate(today - 1);
      } else {
        streak = 0;
        lastStreakAt = null;
      }
      changed = true;
    }
  }

  return {
    next: { streak, lastStreakAt, streakSaves, streakSavesUpdatedAt },
    changed,
    savesConsumed,
  };
}

export interface StreakActivityResult {
  next: StreakState;
  changed: boolean;
  incremented: boolean;
  savesConsumed: number;
}

/**
 * Applies a qualifying activity (course material, Brain Gym, or Tryout).
 * Increments the streak at most once per Jakarta day.
 */
export function applyStreakActivity(state: StreakState, now = new Date()): StreakActivityResult {
  const { next, changed, savesConsumed } = reconcileStreak(state, now);
  const today = getJakartaDayNumber(now);
  const lastDay = next.lastStreakAt ? getJakartaDayNumber(next.lastStreakAt) : null;

  if (lastDay === today) {
    return { next, changed, incremented: false, savesConsumed };
  }

  return {
    next: { ...next, streak: next.streak + 1, lastStreakAt: now },
    changed: true,
    incremented: true,
    savesConsumed,
  };
}

export function hasCompletedToday(lastStreakAt: Date | null, now = new Date()): boolean {
  if (!lastStreakAt) return false;
  return getJakartaDayNumber(lastStreakAt) === getJakartaDayNumber(now);
}
