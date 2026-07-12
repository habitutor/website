import { db as defaultDb } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { eq } from "drizzle-orm";
import type { StreakState } from "./logic";
import { applyStreakActivity, hasCompletedToday, MAX_STREAK_SAVES, reconcileStreak } from "./logic";

type DrizzleDatabase = typeof defaultDb;

async function getStreakState({ db, userId }: { db: DrizzleDatabase; userId: string }): Promise<StreakState | null> {
  const [row] = await db
    .select({
      streak: user.streak,
      lastStreakAt: user.lastStreakAt,
      streakSaves: user.streakSaves,
      streakSavesUpdatedAt: user.streakSavesUpdatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return row ?? null;
}

async function persistStreakState({ db, userId, state }: { db: DrizzleDatabase; userId: string; state: StreakState }) {
  await db
    .update(user)
    .set({
      streak: state.streak,
      lastStreakAt: state.lastStreakAt,
      streakSaves: state.streakSaves,
      streakSavesUpdatedAt: state.streakSavesUpdatedAt,
    })
    .where(eq(user.id, userId));
}

/**
 * Records a qualifying activity for the user's learning streak.
 * Never throws: streak bookkeeping must not break the primary action.
 */
export async function recordStreakActivity({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) {
  try {
    const state = await getStreakState({ db, userId });
    if (!state) return;

    const result = applyStreakActivity(state);
    if (result.changed) {
      await persistStreakState({ db, userId, state: result.next });
    }
  } catch (error) {
    console.error("Failed to record streak activity", error);
  }
}

export async function getStreakStatus({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) {
  const state = await getStreakState({ db, userId });
  const fallback = { streak: 0, saves: MAX_STREAK_SAVES, maxSaves: MAX_STREAK_SAVES, completedToday: false };
  if (!state) return fallback;

  const { next, changed } = reconcileStreak(state);
  if (changed) {
    await persistStreakState({ db, userId, state: next });
  }

  return {
    streak: next.streak,
    saves: next.streakSaves,
    maxSaves: MAX_STREAK_SAVES,
    completedToday: hasCompletedToday(next.lastStreakAt),
  };
}
