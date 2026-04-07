import { type } from "arktype";
import { admin, authed } from "../../index";
import { feedbackRepo } from "./repo";
import {
  createFeedbackInputSchema,
  listFeedbackByUserInputSchema,
  listFeedbackForAdminInputSchema,
  priority,
  status,
} from "./model";

const create = authed
  .route({
    path: "/feedback",
    method: "POST",
    tags: ["Feedback"],
  })
  .input(createFeedbackInputSchema)
  .handler(async ({ context, input, errors }) => {
    const feedback = await feedbackRepo.create({
      userId: context.session.user.id,
      path: input.path,
      questionId: input.questionId,
      category: input.category ?? "other",
      description: input.description,
      selectedAnswerId: input.selectedAnswerId,
      attemptId: input.attemptId,
    });
    if (!feedback) throw errors.UNPROCESSABLE_CONTENT();
    return { id: feedback.id, message: "Laporan berhasil dikirim!" };
  });

const listMine = authed
  .route({
    path: "/feedback/mine",
    method: "GET",
    tags: ["Feedback"],
  })
  .input(listFeedbackByUserInputSchema)
  .handler(async ({ context, input }) => {
    return await feedbackRepo.listByUser({
      userId: context.session.user.id,
      limit: input.limit,
      afterId: input.after,
    });
  });

const markSeen = authed
  .route({
    path: "/feedback/mark-seen",
    method: "POST",
    tags: ["Feedback"],
  })
  .input(type({ ids: "number[]" }))
  .handler(async ({ input }) => {
    await feedbackRepo.markSeen({ ids: input.ids });
    return { success: true };
  });

const unseenResolvedCount = authed
  .route({
    path: "/feedback/unseen-resolved-count",
    method: "GET",
    tags: ["Feedback"],
  })
  .handler(async ({ context }) => {
    const count = await feedbackRepo.countUnseenResolved({
      userId: context.session.user.id,
    });
    return { count };
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
    await feedbackRepo.update({
      id: input.id,
      status: input.status,
      priority: input.priority,
      adminNotes: input.adminNotes,
      ...(input.status && { resolvedBy: context.session.user.id }),
    });
    return { success: true };
  });

const adminCountOpen = admin
  .route({
    path: "/feedback/count-open",
    method: "GET",
    tags: ["Admin Feedback"],
  })
  .handler(async () => {
    const count = await feedbackRepo.countOpen({});
    return { count };
  });

export const feedbackRouter = {
  create,
  listMine,
  markSeen,
  unseenResolvedCount,
};

export const adminFeedbackRouter = {
  list: adminList,
  find: adminFind,
  update: adminUpdate,
  countOpen: adminCountOpen,
};
