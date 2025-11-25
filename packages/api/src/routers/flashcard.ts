import { authed } from "..";
import { db } from "../../../db/src";
import { userFlashcard } from "../../../db/src/schema/flashcard";

const today = authed
  .route({
    path: "/flashcard/today",
    method: "GET",
    tags: ["Flashcard"],
  })
  .handler(async ({ context }) => {
    const [flashcard] = await db.select().from(userFlashcard).limit(1);

    return flashcard;
  });

export const flashcardRouter = {
  today,
};
