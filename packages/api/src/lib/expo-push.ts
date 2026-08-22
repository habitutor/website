import { logger } from "@habitutor/shared/logger";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 100;

export interface ExpoPushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Best-effort delivery via Expo's push service. Failures are logged and
 * swallowed: the in-app inbox row is the source of truth, push is a bonus.
 */
export async function sendExpoPush(tokens: string[], message: ExpoPushMessage): Promise<void> {
  const valid = tokens.filter((token) => token.startsWith("ExponentPushToken"));
  if (valid.length === 0) return;

  for (let i = 0; i < valid.length; i += CHUNK_SIZE) {
    const chunk = valid.slice(i, i + CHUNK_SIZE);
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          chunk.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            data: message.data,
            sound: "default",
          })),
        ),
      });
      if (!response.ok) {
        logger.error(`Expo push send failed with status ${response.status}`);
      }
    } catch (error) {
      logger.error(`Expo push send failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
