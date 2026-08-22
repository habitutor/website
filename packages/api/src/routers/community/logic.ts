import { getJakartaDayNumber } from "../streak/logic";

export interface MemberStreakState {
  streak: number;
  lastStreakAt: Date | null;
}

function coversDay(member: MemberStreakState, day: number): boolean {
  if (!member.lastStreakAt || member.streak <= 0) return false;
  const lastActive = getJakartaDayNumber(member.lastStreakAt);
  return day <= lastActive && day > lastActive - member.streak;
}

/**
 * Group streak: consecutive Jakarta days (ending today, or yesterday if today
 * has no activity yet) on which at least one member was active. Derived from
 * each member's unbroken streak run, so no separate group state is stored.
 */
export function getGroupStreak(members: MemberStreakState[], now = new Date()): number {
  const today = getJakartaDayNumber(now);
  let day = members.some((m) => coversDay(m, today)) ? today : today - 1;
  let count = 0;
  while (count < 3650 && members.some((m) => coversDay(m, day))) {
    count += 1;
    day -= 1;
  }
  return count;
}

export type GroupLevel = "beginner" | "intermediate" | "advanced";

export function getGroupLevel(groupStreak: number): GroupLevel {
  if (groupStreak >= 30) return "advanced";
  if (groupStreak >= 7) return "intermediate";
  return "beginner";
}

export type LeaderboardPeriod = "all" | "weekly" | "monthly";

/**
 * Ranking value per period. Without a full activity history the weekly and
 * monthly boards rank by how much of the period the current streak covers.
 */
export function periodStreak(streak: number, period: LeaderboardPeriod): number {
  if (period === "weekly") return Math.min(streak, 7);
  if (period === "monthly") return Math.min(streak, 30);
  return streak;
}
