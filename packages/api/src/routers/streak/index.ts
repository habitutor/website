import { type } from "arktype";
import { authed } from "../../index";
import { getStreakStatus } from "./service";

const get = authed
  .route({
    path: "/streak",
    method: "GET",
    tags: ["Streak"],
  })
  .output(
    type({
      streak: "number",
      saves: "number",
      maxSaves: "number",
      completedToday: "boolean",
    }),
  )
  .handler(({ context }) => getStreakStatus({ userId: context.session.user.id }));

export const streakRouter = {
  get,
};
