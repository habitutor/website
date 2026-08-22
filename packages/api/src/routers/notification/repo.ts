import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { notification, pushToken } from "@habitutor/db/schema/notification";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export const notificationRepo = {
  list: async ({ db = defaultDb, userId, limit = 50 }: { db?: DrizzleDatabase; userId: string; limit?: number }) => {
    return db
      .select({
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      })
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(limit);
  },

  unreadCount: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const [row] = await db
      .select({ total: count() })
      .from(notification)
      .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
    return row?.total ?? 0;
  },

  markAllRead: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
  },

  create: async ({
    db = defaultDb,
    userId,
    type,
    title,
    body,
    data,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    type: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) => {
    const [row] = await db.insert(notification).values({ userId, type, title, body, data }).returning();
    return row;
  },

  upsertPushToken: async ({
    db = defaultDb,
    userId,
    token,
    platform,
  }: {
    db?: DrizzleDatabase;
    userId: string;
    token: string;
    platform: string;
  }) => {
    await db
      .insert(pushToken)
      .values({ userId, token, platform })
      .onConflictDoUpdate({
        target: [pushToken.token],
        set: { userId, platform, updatedAt: new Date() },
      });
  },

  deletePushToken: async ({ db = defaultDb, token }: { db?: DrizzleDatabase; token: string }) => {
    await db.delete(pushToken).where(eq(pushToken.token, token));
  },

  getTokensForUser: async ({ db = defaultDb, userId }: { db?: DrizzleDatabase; userId: string }) => {
    const rows = await db.select({ token: pushToken.token }).from(pushToken).where(eq(pushToken.userId, userId));
    return rows.map((row) => row.token);
  },
};
