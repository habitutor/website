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
} from "./content-routes";
import { createSubtest, deleteSubtest, reorderSubtests, updateSubtest } from "./subtest-routes";

export const adminSubtestRouter = {
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
};
