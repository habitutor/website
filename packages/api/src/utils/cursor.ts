import { ORPCError } from "@orpc/server";

export interface CursorData {
  createdAt: string;
  id: string;
}

export const cursor = {
  encode(data: CursorData): string {
    return Buffer.from(JSON.stringify(data)).toString("base64url");
  },

  decode(raw: string): CursorData {
    try {
      return JSON.parse(Buffer.from(raw, "base64url").toString());
    } catch {
      throw new ORPCError("BAD_REQUEST", { message: "Invalid cursor" });
    }
  },
};
