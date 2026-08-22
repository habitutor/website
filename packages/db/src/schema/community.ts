import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

export const matchRequestStatusEnum = pgEnum("match_request_status_enum", ["pending", "accepted", "declined"]);

/** Community squad: a small study group sharing a streak and leaderboard. */
export const studyGroup = pgTable(
  "study_group",
  {
    id: uuid().defaultRandom().primaryKey(),
    name: text().notNull(),
    inviteCode: text("invite_code").notNull(),
    creatorUserId: text("creator_user_id").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("study_group_invite_code_unique").on(t.inviteCode)],
);

export const studyGroupMember = pgTable(
  "study_group_member",
  {
    id: uuid().defaultRandom().primaryKey(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => studyGroup.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    joinedAt: timestamp("joined_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("study_group_member_unique").on(t.groupId, t.userId),
    index("study_group_member_user_idx").on(t.userId),
  ],
);

/** "Connect" on the match screen: a study-buddy request between two users. */
export const matchRequest = pgTable(
  "match_request",
  {
    id: uuid().defaultRandom().primaryKey(),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: matchRequestStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("match_request_unique").on(t.fromUserId, t.toUserId),
    index("match_request_to_idx").on(t.toUserId),
  ],
);
