import { type } from "arktype";
import { premium } from "../..";
import { recordingRepo } from "./repo";

const list = premium
  .route({
    path: "/recordings",
    method: "GET",
    tags: ["Recording"],
  })
  .input(type({ category: "'TKA' | 'SNBT' | 'MANDIRI'" }))
  .handler(async ({ input }) => {
    return recordingRepo.listPublishedByCategory({ category: input.category });
  });

export const recordingRouter = { list };