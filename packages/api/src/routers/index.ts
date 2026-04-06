import type { RouterClient } from "@orpc/server";
import { type } from "arktype";
import { pub } from "../index";
import { adminDashboardContentRouter } from "./admin/dashboard-content";
import { adminPracticePackRouter } from "./admin/practice-pack";
import { adminQuestionRouter } from "./admin/question";
import { adminReferralRouter } from "./admin/referrals";
import { adminStatisticsRouter } from "./admin/statistics";
import { adminUserRouter } from "./admin/users";
import {
  createContent,
  deleteContent,
  deleteNote,
  deleteVideo,
  linkPracticeQuestions,
  reorderContent,
  unlinkPracticeQuestions,
  updateContent,
  upsertNote,
  upsertVideo,
} from "./admin/subtest/content-routes";
import { createSubtest, deleteSubtest, reorderSubtests, updateSubtest } from "./admin/subtest/subtest-routes";
import { dashboardRouter } from "./dashboard";
import { flashcardRouter } from "./flashcard";
import { practicePackRouter } from "./practice-pack";
import { profileRouter } from "./profile";
import { referralRouter } from "./referral";
import { socialRouter } from "./social";
import { subtestRouter } from "./subtest";
import { transactionRouter } from "./transaction";
import { feedbackRouter, adminFeedbackRouter } from "./feedback";

export const appRouter = {
  healthCheck: pub
    .route({
      path: "/healthcheck",
      method: "GET",
      tags: ["Uncategorized"],
    })
    .output(type({ message: "string" }))
    .handler(() => {
      return { message: "OK" };
    }),
  social: socialRouter,
  dashboard: dashboardRouter,
  profile: profileRouter,
  // Learning feature boundaries:
  // - subtest: curriculum + content navigation
  // - practicePack: structured pack attempts (start/save/submit/history)
  // - flashcard: short daily retention sessions with streak logic
  practicePack: practicePackRouter,
  flashcard: flashcardRouter,
  subtest: subtestRouter,
  feedback: feedbackRouter,
  admin: {
    statistics: adminStatisticsRouter,
    practicePack: adminPracticePackRouter,
    question: adminQuestionRouter,
    subtest: {
      subtest: {
        create: createSubtest,
        update: updateSubtest,
        remove: deleteSubtest,
        reorder: reorderSubtests,
      },
      content: {
        create: createContent,
        update: updateContent,
        remove: deleteContent,
        reorder: reorderContent,
        video: {
          update: upsertVideo,
          remove: deleteVideo,
        },
        note: {
          update: upsertNote,
          remove: deleteNote,
        },
        question: {
          link: linkPracticeQuestions,
          unlink: unlinkPracticeQuestions,
        },
      },
    },
    users: adminUserRouter,
    referrals: adminReferralRouter,
    dashboardContent: adminDashboardContentRouter,
    feedback: adminFeedbackRouter,
  },
  transaction: transactionRouter,
  referral: referralRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
