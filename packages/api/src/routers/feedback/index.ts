import { type } from "arktype";
import { admin, authed } from "../../index";
import { feedbackRepo } from "./repo";
import { createFeedbackInputSchema, listFeedbackForAdminInputSchema, priority, status } from "./model";

const create = authed
  .route({
    path: "/feedback",
    method: "POST",
    tags: ["Feedback"],
  })
  .input(createFeedbackInputSchema)
  .handler(async ({ context, input, errors }) => {
    const feedback = await feedbackRepo.create({
      values: {
        userId: context.session.user.id,
        path: input.path,
        questionId: input.questionId,
        category: input.category ?? "other",
        description: input.description,
        selectedAnswerId: input.selectedAnswerId,
        attemptId: input.attemptId,
      },
    });
    if (!feedback) throw errors.UNPROCESSABLE_CONTENT();
    return { id: feedback.id, message: "Laporan berhasil dikirim!" };
  });

// Admin routes
const adminList = admin
  .route({
    path: "/feedback",
    method: "GET",
    tags: ["Admin Feedback"],
  })
  .input(listFeedbackForAdminInputSchema)
  .handler(async ({ input }) => {
    return await feedbackRepo.listForAdmin({
      limit: input.limit,
      after: input.after,
      before: input.before,
      status: input.status,
      category: input.category,
      priority: input.priority,
    });
  });

const adminFind = admin
  .route({
    path: "/feedback/:id",
    method: "GET",
    tags: ["Admin Feedback"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input, errors }) => {
    const feedback = await feedbackRepo.getById({ id: input.id });
    if (!feedback) throw errors.NOT_FOUND();
    return feedback;
  });

const adminUpdate = admin
  .route({
    path: "/feedback/:id",
    method: "PATCH",
    tags: ["Admin Feedback"],
  })
  .input(
    type({
      id: "number",
      "status?": status,
      "priority?": priority,
      "adminNotes?": "string",
    }),
  )
  .handler(async ({ context, input }) => {
    const resolvedAt = input.status === "resolved" ? new Date() : null;

    return feedbackRepo.update({
      id: input.id,
      data: {
        ...input,
        resolvedAt,
        ...(input.status && { resolvedBy: context.session.user.id }),
      },
    });
  });

export const feedbackRouter = {
  create,
};

export const adminFeedbackRouter = {
  list: adminList,
  find: adminFind,
  update: adminUpdate,
};
