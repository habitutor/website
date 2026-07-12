import { boolean, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("user"),
  isPremium: boolean("is_premium").default(false),
  premiumTier: text("premium_tier"),
  flashcardStreak: integer("flashcard_streak").default(0),
  totalScore: integer("total_score").default(0).notNull(),
  lastCompletedFlashcardAt: timestamp("last_completed_flashcard_at"),
  premiumExpiresAt: timestamp("premium_expires_at"),
  phoneNumber: text("phone_number"),
  referralCode: text("referral_code"),
  referralUsage: integer("referral_usage").default(0),
  dreamCampus: text("dream_campus"),
  dreamMajor: text("dream_major"),
  age: integer("age"),
  educationLevel: text("education_level"),
  difficultSubjects: text("difficult_subjects").array(),
  hasSeenWelcomeVideo: boolean("has_seen_welcome_video").default(false).notNull(),
  streak: integer("streak").default(0).notNull(),
  lastStreakAt: timestamp("last_streak_at"),
  streakSaves: integer("streak_saves").default(3).notNull(),
  streakSavesUpdatedAt: timestamp("streak_saves_updated_at"),
});
