import type { RouterClient } from "@orpc/server";
import { type } from "arktype";
import { pub } from "../index";
import { adminDashboardContentRouter } from "./admin/dashboard-content";
import { adminPracticePackRouter } from "./admin/practice-pack";
import { adminQuestionRouter } from "./admin/question";
import { adminReferralRouter } from "./admin/referrals";
import { adminStatisticsRouter } from "./admin/statistics";
import { adminTryoutRouter } from "./admin/tryout";
import { adminUniversitasRouter } from "./admin/universitas";
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
import { studentTryoutRouter } from "./student/tryout";
import { subtestRouter } from "./subtest";
import { transactionRouter } from "./transaction";

const healthCheck = pub
  .route({
    path: "/healthcheck",
    method: "GET",
    tags: ["Uncategorized"],
  })
  .output(type({ message: "string" }))
  .handler(() => {
    return { message: "OK" };
  });

const adminRouter = {
  statistics: adminStatisticsRouter,
  universitas: adminUniversitasRouter,
  practicePack: adminPracticePackRouter,
  question: adminQuestionRouter,
  tryout: adminTryoutRouter,
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
};

export const appRouter: {
  healthCheck: typeof healthCheck;
  social: typeof socialRouter;
  dashboard: typeof dashboardRouter;
  profile: typeof profileRouter;
  practicePack: typeof practicePackRouter;
  flashcard: typeof flashcardRouter;
  subtest: typeof subtestRouter;
  tryout: typeof studentTryoutRouter;
  admin: typeof adminRouter;
  transaction: typeof transactionRouter;
  referral: typeof referralRouter;
} = {
  healthCheck,
  social: socialRouter,
  dashboard: dashboardRouter,
  profile: profileRouter,
  practicePack: practicePackRouter,
  flashcard: flashcardRouter,
  subtest: subtestRouter,
  tryout: studentTryoutRouter,
  admin: adminRouter,
  transaction: transactionRouter,
  referral: referralRouter,
};

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
