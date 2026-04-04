import { logger } from "@habitutor/shared";

export function convertToTiptap(text: string) {
  try {
    const parsed = JSON.parse(text);
    if (parsed && parsed.type === "doc") return parsed;
  } catch (error) {
    logger.warn("Failed to parse tiptap JSON, falling back to plain text document", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text }],
      },
    ],
  };
}
