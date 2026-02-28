import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/auth";
import { type } from "arktype";
import { eq } from "drizzle-orm";
import { authed } from "..";

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
      "referralUsage?": "number | null",
    }),
  )
  .handler(async ({ context }) => {
    const { id, email } = context.session.user;
    const [row] = await db
      .select({
        name: user.name,
        image: user.image,
        phoneNumber: user.phoneNumber,
        referralCode: user.referralCode,
        referralUsage: user.referralUsage,
      })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    return {
      id,
      name: row?.name ?? context.session.user.name,
      email,
      phoneNumber: row?.phoneNumber ?? null,
      image: row?.image ?? null,
      referralCode: row?.referralCode ?? null,
      referralUsage: row?.referralUsage ?? 0,
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
      "phoneNumber?": "string",
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
    if (input.phoneNumber !== undefined)
      updates.phoneNumber = input.phoneNumber;
    if (Object.keys(updates).length > 0) {
      await db
        .update(user)
        .set(updates)
        .where(eq(user.id, context.session.user.id));
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
    // Store only the avatar ID (e.g. "3"), strip legacy path if provided
    const match = input.image.match(/tupai-(\d+)/);
    const avatarId = match ? match[1]! : input.image;
    await db
      .update(user)
      .set({ image: avatarId })
      .where(eq(user.id, context.session.user.id));
    return { image: avatarId };
  });

export const profileRouter = {
  get: getProfile,
  update: updateProfile,
  updateAvatar,
};
