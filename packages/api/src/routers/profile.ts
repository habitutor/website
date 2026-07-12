import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { referralCode } from "@habitutor/db/schema/referral";
import { type } from "arktype";
import { eq } from "drizzle-orm";
import { authed } from "..";

const LEGACY_AVATAR_PATH_PATTERN = /\/avatar\/profile\/tupai-(\d+)\.webp$/;

function toCanonicalAvatarId(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^\d+$/.test(value)) return value;
  const match = value.match(LEGACY_AVATAR_PATH_PATTERN);
  return match ? match[1]! : null;
}

const getProfile = authed
  .route({
    path: "/profile",
    method: "GET",
    tags: ["Profile"],
  })
  .output(
    type({
      id: "string",
      name: "string",
      email: "string",
      "phoneNumber?": "string | null",
      "image?": "string | null",
      "referralCode?": "string | null",
      referralUsage: "number",
      "dreamCampus?": "string | null",
      "dreamMajor?": "string | null",
      "age?": "number | null",
      "educationLevel?": "string | null",
      "difficultSubjects?": "string[] | null",
      hasSeenWelcomeVideo: "boolean",
    }),
  )
  .handler(async ({ context }) => {
    const { id, email } = context.session.user;
    const [row] = await db
      .select({
        name: user.name,
        image: user.image,
        phoneNumber: user.phoneNumber,
        referralCode: referralCode.code,
        referralUsage: referralCode.referralCount,
        dreamCampus: user.dreamCampus,
        dreamMajor: user.dreamMajor,
        age: user.age,
        educationLevel: user.educationLevel,
        difficultSubjects: user.difficultSubjects,
        hasSeenWelcomeVideo: user.hasSeenWelcomeVideo,
      })
      .from(user)
      .leftJoin(referralCode, eq(user.id, referralCode.userId))
      .where(eq(user.id, id))
      .limit(1);

    const canonicalImage = toCanonicalAvatarId(row?.image);
    if (row?.image && canonicalImage && canonicalImage !== row.image) {
      await db.update(user).set({ image: canonicalImage }).where(eq(user.id, id));
    }

    return {
      id,
      name: row?.name ?? context.session.user.name,
      email,
      phoneNumber: row?.phoneNumber ?? null,
      image: canonicalImage,
      referralCode: row?.referralCode ?? null,
      referralUsage: row?.referralUsage ?? 0,
      dreamCampus: row?.dreamCampus ?? null,
      dreamMajor: row?.dreamMajor ?? null,
      age: row?.age ?? null,
      educationLevel: row?.educationLevel ?? null,
      difficultSubjects: row?.difficultSubjects ?? null,
      hasSeenWelcomeVideo: row?.hasSeenWelcomeVideo ?? false,
    };
  });

const updateProfile = authed
  .route({
    path: "/profile",
    method: "PUT",
    tags: ["Profile"],
  })
  .input(
    type({
      "name?": "string",
      "phoneNumber?": "string | null",
      "dreamCampus?": "string",
      "dreamMajor?": "string",
      "age?": "number",
      "educationLevel?": "string",
      "difficultSubjects?": "string[]",
    }),
  )
  .output(
    type({
      success: "boolean",
    }),
  )
  .handler(async ({ input, context }) => {
    const updates: Partial<typeof user.$inferInsert> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.phoneNumber !== undefined) {
      const normalizedPhone = typeof input.phoneNumber === "string" ? input.phoneNumber.trim() : input.phoneNumber;
      updates.phoneNumber = normalizedPhone === "" ? null : normalizedPhone;
    }
    if (input.dreamCampus !== undefined) updates.dreamCampus = input.dreamCampus;
    if (input.dreamMajor !== undefined) updates.dreamMajor = input.dreamMajor;
    if (input.age !== undefined) updates.age = input.age;
    if (input.educationLevel !== undefined) updates.educationLevel = input.educationLevel;
    if (input.difficultSubjects !== undefined) updates.difficultSubjects = input.difficultSubjects;
    if (Object.keys(updates).length > 0) {
      await db.update(user).set(updates).where(eq(user.id, context.session.user.id));
    }
    return { success: true };
  });

const updateAvatar = authed
  .route({
    path: "/profile/avatar",
    method: "PUT",
    tags: ["Profile"],
  })
  .input(
    type({
      image: "string",
    }),
  )
  .output(
    type({
      image: "string",
    }),
  )
  .handler(async ({ input, context }) => {
    const avatarId = input.image.trim();
    await db.update(user).set({ image: avatarId }).where(eq(user.id, context.session.user.id));
    return { image: avatarId };
  });

const markWelcomeVideoSeen = authed
  .route({
    path: "/profile/welcome-video-seen",
    method: "POST",
    tags: ["Profile"],
  })
  .output(
    type({
      success: "boolean",
    }),
  )
  .handler(async ({ context }) => {
    await db.update(user).set({ hasSeenWelcomeVideo: true }).where(eq(user.id, context.session.user.id));
    return { success: true };
  });

export const profileRouter = {
  me: getProfile,
  update: updateProfile,
  avatar: { update: updateAvatar },
  markWelcomeVideoSeen,
};
