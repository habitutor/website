import { sendExpoPush } from "../../lib/expo-push";
import { notificationRepo } from "./repo";

/** Writes an inbox row and pushes to the user's devices (best-effort). */
export async function notifyUser({
  userId,
  type,
  title,
  body,
  data,
}: {
  userId: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<void> {
  await notificationRepo.create({ userId, type, title, body, data });
  const tokens = await notificationRepo.getTokensForUser({ userId });
  await sendExpoPush(tokens, { title, body, data });
}
