import { type } from "arktype";
import { admin, authed, pub } from "../..";
import { ptnTourRepo } from "./repo";

const list = pub.route({ path: "/ptn-tour", method: "GET", tags: ["PTN Tour"] }).handler(() => ptnTourRepo.list({}));

const adminList = admin
  .route({ path: "/admin/ptn-tour", method: "GET", tags: ["Admin - PTN Tour"] })
  .handler(() => ptnTourRepo.adminList());
const adminCreate = admin
  .route({ path: "/admin/ptn-tour", method: "POST", tags: ["Admin - PTN Tour"] })
  .input(
    type({
      slug: "string",
      title: "string",
      category: "string",
      description: "string",
      tutor: "string",
      campus: "string",
      posterUrl: "string",
      startsAt: "string",
      "quota?": "number",
      "whatsappGroupUrl?": "string",
      "zoomUrl?": "string",
      "recordingUrl?": "string",
      "isPublished?": "boolean",
    }),
  )
  .handler(({ input }) => ptnTourRepo.adminCreate({ input: { ...input, startsAt: new Date(input.startsAt) } }));
const adminUpdate = admin
  .route({ path: "/admin/ptn-tour/{id}", method: "PUT", tags: ["Admin - PTN Tour"] })
  .input(
    type({
      id: "number",
      "title?": "string",
      "category?": "string",
      "description?": "string",
      "tutor?": "string",
      "campus?": "string",
      "posterUrl?": "string",
      "startsAt?": "string",
      "quota?": "number",
      "whatsappGroupUrl?": "string",
      "zoomUrl?": "string",
      "recordingUrl?": "string",
      "isPublished?": "boolean",
    }),
  )
  .handler(({ input, errors }) => {
    const { id, startsAt, ...rest } = input;
    return ptnTourRepo
      .adminUpdate({ id, input: { ...rest, ...(startsAt ? { startsAt: new Date(startsAt) } : {}) } })
      .then((event) => event ?? errors.NOT_FOUND({ message: "Event tidak ditemukan" }));
  });
const adminDuplicate = admin
  .route({ path: "/admin/ptn-tour/{id}/duplicate", method: "POST", tags: ["Admin - PTN Tour"] })
  .input(type({ id: "number", slug: "string" }))
  .handler(async ({ input, errors }) => {
    const event = await ptnTourRepo.adminDuplicate(input);
    if (!event) throw errors.NOT_FOUND({ message: "Event tidak ditemukan" });
    return event;
  });
const adminParticipants = admin
  .route({ path: "/admin/ptn-tour/{eventId}/participants", method: "GET", tags: ["Admin - PTN Tour"] })
  .input(type({ eventId: "number" }))
  .handler(({ input }) => ptnTourRepo.adminParticipants({ eventId: input.eventId }));

const detail = pub
  .route({ path: "/ptn-tour/{slug}", method: "GET", tags: ["PTN Tour"] })
  .input(type({ slug: "string" }))
  .handler(({ input }) => ptnTourRepo.getBySlug({ slug: input.slug }));

const myList = authed
  .route({ path: "/ptn-tour/me", method: "GET", tags: ["PTN Tour"] })
  .handler(({ context }) => ptnTourRepo.list({ userId: context.session.user.id }));

const register = authed
  .route({ path: "/ptn-tour/{eventId}/register", method: "POST", tags: ["PTN Tour"] })
  .input(
    type({
      eventId: "number",
      schoolName: "string",
      classLevel: "string",
      phoneNumber: "string",
      dreamCampus: "string",
      educationLevel: "string",
    }),
  )
  .handler(async ({ input, context, errors }) => {
    const result = await ptnTourRepo.register({ ...input, userId: context.session.user.id });
    if (!result) throw errors.NOT_FOUND({ message: "Event tidak ditemukan" });
    return result;
  });

const join = authed
  .route({ path: "/ptn-tour/{eventId}/join", method: "POST", tags: ["PTN Tour"] })
  .input(type({ eventId: "number" }))
  .handler(async ({ input, context, errors }) => {
    try {
      const result = await ptnTourRepo.join({ eventId: input.eventId, userId: context.session.user.id });
      if (!result) throw errors.NOT_FOUND({ message: "Link Zoom belum tersedia" });
      return result;
    } catch (error) {
      if (error instanceof Error) throw errors.BAD_REQUEST({ message: error.message });
      throw error;
    }
  });

const watch = authed
  .route({ path: "/ptn-tour/{slug}/recording", method: "GET", tags: ["PTN Tour"] })
  .input(type({ slug: "string" }))
  .handler(async ({ input, context, errors }) => {
    try {
      const result = await ptnTourRepo.watch({
        slug: input.slug,
        userId: context.session.user.id,
        isPremium: Boolean(context.session.user.isPremium),
      });
      if (!result) throw errors.NOT_FOUND({ message: "Rekaman belum tersedia" });
      return result;
    } catch (error) {
      if (error instanceof Error) throw errors.FORBIDDEN({ message: error.message });
      throw error;
    }
  });

const materials = authed
  .route({ path: "/ptn-tour/{slug}/materials", method: "GET", tags: ["PTN Tour"] })
  .input(type({ slug: "string" }))
  .handler(async ({ input, context, errors }) => {
    try {
      const result = await ptnTourRepo.materials({ slug: input.slug, userId: context.session.user.id });
      if (!result) throw errors.NOT_FOUND({ message: "Event tidak ditemukan" });
      return result;
    } catch (error) {
      if (error instanceof Error) throw errors.FORBIDDEN({ message: error.message });
      throw error;
    }
  });

export const ptnTourRouter = {
  list,
  detail,
  me: myList,
  register,
  join,
  watch,
  materials,
  admin: {
    list: adminList,
    create: adminCreate,
    update: adminUpdate,
    duplicate: adminDuplicate,
    participants: adminParticipants,
  },
};
