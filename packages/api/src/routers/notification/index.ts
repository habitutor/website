import { type } from "arktype";
import { authed } from "../../index";
import { notificationRepo } from "./repo";

const list = authed
  .route({
    path: "/notifications",
    method: "GET",
    tags: ["Notification"],
  })
  .handler(async ({ context }) => {
    const userId = context.session.user.id;
    const [items, unread] = await Promise.all([
      notificationRepo.list({ userId }),
      notificationRepo.unreadCount({ userId }),
    ]);
    return { items, unread: Number(unread) };
  });

const markAllRead = authed
  .route({
    path: "/notifications/read-all",
    method: "POST",
    tags: ["Notification"],
  })
  .output(type({ message: "string" }))
  .handler(async ({ context }) => {
    await notificationRepo.markAllRead({ userId: context.session.user.id });
    return { message: "OK" };
  });

const registerPushToken = authed
  .route({
    path: "/notifications/push-token",
    method: "POST",
    tags: ["Notification"],
  })
  .input(
    type({
      token: "string > 0",
      platform: "'ios' | 'android'",
    }),
  )
  .output(type({ message: "string" }))
  .handler(async ({ input, context }) => {
    await notificationRepo.upsertPushToken({
      userId: context.session.user.id,
      token: input.token,
      platform: input.platform,
    });
    return { message: "OK" };
  });

const unregisterPushToken = authed
  .route({
    path: "/notifications/push-token/delete",
    method: "POST",
    tags: ["Notification"],
  })
  .input(type({ token: "string > 0" }))
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    await notificationRepo.deletePushToken({ token: input.token });
    return { message: "OK" };
  });

export const notificationRouter = {
  list,
  markAllRead,
  registerPushToken,
  unregisterPushToken,
};
