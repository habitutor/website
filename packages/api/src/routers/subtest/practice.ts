import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { contentPracticeAnswer } from "@habitutor/db/schema/content-practice-answer";
import { questionAnswerOption } from "@habitutor/db/schema/question";
import { contentPracticeQuestions } from "@habitutor/db/schema/subtest";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { and, eq, isNull } from "drizzle-orm";
import { canAccessContent } from "@habitutor/shared/content-access";
import { authed } from "../../index";
import { subtestRepo } from "./repo";

type Session = { user: { id: string; isPremium?: boolean | null; role?: string | null } };

/** Aturan akses sama dengan halaman materi: konten Premium tidak bisa dijawab lewat jalan lain. */
async function assertAccess(contentId: number, session: Session) {
  const row = await subtestRepo.getContentWithMaterials({ contentId });
  if (!row) throw new ORPCError("NOT_FOUND", { message: "Konten tidak ditemukan" });
  if (!canAccessContent(Boolean(session.user.isPremium), session.user.role ?? "user", row.subtestOrder, row.order)) {
    throw new ORPCError("FORBIDDEN", { message: "Konten ini memerlukan akun premium" });
  }
}

const currentAttempt = (userId: string, contentId: number) =>
  and(
    eq(contentPracticeAnswer.userId, userId),
    eq(contentPracticeAnswer.contentItemId, contentId),
    isNull(contentPracticeAnswer.archivedAt),
  );

const listCurrent = (db: DrizzleDatabase, userId: string, contentId: number) =>
  db
    .select({
      questionId: contentPracticeAnswer.questionId,
      selectedAnswerId: contentPracticeAnswer.selectedAnswerId,
    })
    .from(contentPracticeAnswer)
    .where(currentAttempt(userId, contentId));

const answers = authed
  .route({ path: "/content/{contentId}/practice/answers", method: "GET", tags: ["Content"] })
  .input(type({ contentId: "number" }))
  .handler(async ({ input, context }) => {
    await assertAccess(input.contentId, context.session);
    return listCurrent(defaultDb, context.session.user.id, input.contentId);
  });

const answer = authed
  .route({ path: "/content/{contentId}/practice/answers", method: "POST", tags: ["Content"] })
  .input(type({ contentId: "number", questionId: "number", answerId: "number" }))
  .handler(async ({ input, context }) => {
    await assertAccess(input.contentId, context.session);
    const userId = context.session.user.id;

    // Pilihan harus milik soal itu, dan soal itu harus tertaut ke materi ini. Benar/salah ditentukan server.
    const [option] = await defaultDb
      .select({ isCorrect: questionAnswerOption.isCorrect })
      .from(questionAnswerOption)
      .innerJoin(contentPracticeQuestions, eq(contentPracticeQuestions.questionId, questionAnswerOption.questionId))
      .where(
        and(
          eq(contentPracticeQuestions.contentItemId, input.contentId),
          eq(questionAnswerOption.questionId, input.questionId),
          eq(questionAnswerOption.id, input.answerId),
        ),
      )
      .limit(1);
    if (!option) throw new ORPCError("NOT_FOUND", { message: "Pilihan jawaban tidak ditemukan di latihan ini" });

    // Jawaban pertama pada percobaan ini yang berlaku; kiriman ulang (mis. dari dua tab) tidak menimpanya.
    await defaultDb
      .insert(contentPracticeAnswer)
      .values({
        userId,
        contentItemId: input.contentId,
        questionId: input.questionId,
        selectedAnswerId: input.answerId,
        isCorrect: option.isCorrect,
      })
      .onConflictDoNothing();

    const saved = await listCurrent(defaultDb, userId, input.contentId);
    const linked = await subtestRepo.getPracticeQuestionsForContent({ contentId: input.contentId });
    const done = new Set(saved.map((row) => row.questionId));
    return { answers: saved, completed: linked.every((row) => done.has(row.questionId)) };
  });

const reset = authed
  .route({ path: "/content/{contentId}/practice/reset", method: "POST", tags: ["Content"] })
  .input(type({ contentId: "number" }))
  .handler(async ({ input, context }) => {
    await assertAccess(input.contentId, context.session);
    await defaultDb
      .update(contentPracticeAnswer)
      .set({ archivedAt: new Date() })
      .where(currentAttempt(context.session.user.id, input.contentId));
    return { message: "Latihan diulang" };
  });

export const practiceRouter = { answers, answer, reset };
