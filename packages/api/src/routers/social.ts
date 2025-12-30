import { type } from "arktype";
import { premium } from "..";

export const socialRouter = premium
  .route({
    path: "/socials",
    method: "GET",
    tags: ["Socials", "Premium"],
  })
  .output(
    type({
      whatsapp: "string",
      discord: "string",
    }),
  )
  .handler(() => {
    return {
      whatsapp: process.env.WHATSAPP_LINK as string,
      discord: process.env.DISCORD_LINK as string,
    };
  });
