import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { matchRequest, studyGroup, studyGroupMember } from "@habitutor/db/schema/community";
import { user } from "@habitutor/db/schema/user";
import { and, count, desc, eq, ne, sql } from "drizzle-orm";

export const communityRepo = {
  getGroupsForUser: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    return db
      .select({
        id: studyGroup.id,
        name: studyGroup.name,
        inviteCode: studyGroup.inviteCode,
        createdAt: studyGroup.createdAt,
      })
      .from(studyGroupMember)
      .innerJoin(studyGroup, eq(studyGroupMember.groupId, studyGroup.id))
      .where(eq(studyGroupMember.userId, userId))
      .orderBy(studyGroup.createdAt);
  },

  /** Members with the streak fields needed for group streak + leaderboard. */
  getGroupMembers: async ({ db = defaultDb, groupId }: { db?: DrizzleDatabase; groupId: string }) => {
    return db
      .select({
        userId: user.id,
        name: user.name,
        image: user.image,
        streak: user.streak,
        lastStreakAt: user.lastStreakAt,
      })
      .from(studyGroupMember)
      .innerJoin(user, eq(studyGroupMember.userId, user.id))
      .where(eq(studyGroupMember.groupId, groupId))
      .orderBy(studyGroupMember.joinedAt);
  },

  getGroupById: async ({ db = defaultDb, groupId }: { db?: DrizzleDatabase; groupId: string }) => {
    const [group] = await db.select().from(studyGroup).where(eq(studyGroup.id, groupId)).limit(1);
    return group;
  },

  getGroupByInviteCode: async ({ db = defaultDb, inviteCode }: { db?: DrizzleDatabase; inviteCode: string }) => {
    const [group] = await db.select().from(studyGroup).where(eq(studyGroup.inviteCode, inviteCode)).limit(1);
    return group;
  },

  isMember: async ({ db = defaultDb, groupId, userId }: { db?: DrizzleDatabase; groupId: string; userId: string }) => {
    const [row] = await db
      .select({ id: studyGroupMember.id })
      .from(studyGroupMember)
      .where(and(eq(studyGroupMember.groupId, groupId), eq(studyGroupMember.userId, userId)))
      .limit(1);
    return Boolean(row);
  },

  createGroup: async ({
    db = defaultDb,
    name,
    inviteCode,
    creatorUserId,
  }: {
    db?: DrizzleDatabase;
    name: string;
    inviteCode: string;
    creatorUserId: string;
  }) => {
    const [group] = await db.insert(studyGroup).values({ name, inviteCode, creatorUserId }).returning();
    return group;
  },

  addMember: async ({ db = defaultDb, groupId, userId }: { db?: DrizzleDatabase; groupId: string; userId: string }) => {
    const [member] = await db
      .insert(studyGroupMember)
      .values({ groupId, userId })
      .onConflictDoNothing()
      .returning();
    return member;
  },

  countMembers: async ({ db = defaultDb, groupId }: { db?: DrizzleDatabase; groupId: string }) => {
    const [row] = await db
      .select({ total: count() })
      .from(studyGroupMember)
      .where(eq(studyGroupMember.groupId, groupId));
    return row?.total ?? 0;
  },

  /**
   * Match candidates: other users with a completed profile, users sharing the
   * requester's dream campus/major first, then by total score.
   */
  getMatchCandidates: async ({
    db = defaultDb,
    userId,
    dreamCampus,
    dreamMajor,
    search,
    limit = 10,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    dreamCampus: string | null;
    dreamMajor: string | null;
    search?: string;
    limit?: number;
  }) => {
    // Bindings must not be nullable: Postgres cannot infer the type of a null
    // parameter inside a CASE expression in ORDER BY.
    const campusAffinity = dreamCampus
      ? sql`CASE WHEN ${user.dreamCampus} = ${dreamCampus} THEN 2 ELSE 0 END`
      : sql`0`;
    const majorAffinity = dreamMajor
      ? sql`CASE WHEN ${user.dreamMajor} = ${dreamMajor} THEN 1 ELSE 0 END`
      : sql`0`;
    const affinity = sql<number>`(${campusAffinity} + ${majorAffinity})`;

    return db
      .select({
        userId: user.id,
        name: user.name,
        image: user.image,
        dreamCampus: user.dreamCampus,
        dreamMajor: user.dreamMajor,
        difficultSubjects: user.difficultSubjects,
        totalScore: user.totalScore,
      })
      .from(user)
      .where(
        and(
          ne(user.id, userId),
          sql`${user.role} = 'user'`,
          sql`${user.dreamCampus} IS NOT NULL`,
          search ? sql`${user.name} ILIKE ${`%${search}%`}` : undefined,
        ),
      )
      .orderBy(desc(affinity), desc(user.totalScore))
      .limit(limit);
  },

  getSentRequestUserIds: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const rows = await db
      .select({ toUserId: matchRequest.toUserId })
      .from(matchRequest)
      .where(eq(matchRequest.fromUserId, userId));
    return rows.map((row) => row.toUserId);
  },

  createMatchRequest: async ({
    db = defaultDb,
    fromUserId,
    toUserId,
  }: {
    db?: DrizzleDatabase;
    fromUserId: string;
    toUserId: string;
  }) => {
    const [request] = await db
      .insert(matchRequest)
      .values({ fromUserId, toUserId })
      .onConflictDoNothing()
      .returning();
    return request;
  },
};