import { type } from "arktype";
import { admin, authedRateLimited, pub } from "../..";
import {
  ACCESS_MODES,
  assertOptionalUrl,
  assertSlug,
  EVENT_CATEGORIES,
  isValidAssetUrl,
  MATERIAL_UNLOCKS,
  normalizeSubjects,
  SCHEDULE_STATUSES,
  SETTING_KEYS,
  parseDateOrThrow,
  PtnTourError,
} from "./logic";
import { uploadTryoutImage } from "../../lib/cloudinary";
import { ptnTourRepo } from "./repo";
import { notifyScheduleChange } from "./jobs";

const categoryType = "'Masterclass' | 'Kelas Gratis PTN Tour' | 'Intensif'";
const accessModeType = "'free' | 'premium' | 'mixed'";
const scheduleStatusType = "'normal' | 'rescheduled' | 'cancelled'";
const unlockType = "'after_register' | 'after_event'";

type Errors = Record<string, (data?: { message?: string }) => Error>;

/** Ubah PtnTourError (galat bisnis) menjadi galat oRPC dengan kode yang tepat. */
async function run<T>(errors: Errors, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof PtnTourError) throw errors[error.code]?.({ message: error.message }) ?? error;
    throw error;
  }
}

const blankToNull = (value: string | null | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

type EventFields = {
  slug?: string;
  title?: string;
  category?: string;
  subjects?: string[];
  description?: string;
  longDescription?: string | null;
  rundown?: string | null;
  tutor?: string;
  campus?: string;
  posterUrl?: string;
  startsAt?: string;
  durationMinutes?: number;
  quota?: number | null;
  whatsappGroupUrl?: string | null;
  zoomUrl?: string | null;
  recordingUrl?: string | null;
  recordingFreeDays?: number;
  accessMode?: string;
  scheduleStatus?: string;
  isPublished?: boolean;
};

function requireText(value: string | undefined, label: string) {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) throw new PtnTourError("BAD_REQUEST", `${label} wajib diisi.`);
  return trimmed;
}

/** Rapikan dan validasi masukan admin sebelum disimpan. Hanya field yang dikirim yang diproses. */
function normalizeEventInput(input: EventFields) {
  const out: Record<string, unknown> = {};
  if (input.slug !== undefined) {
    const slug = input.slug.trim();
    assertSlug(slug);
    out.slug = slug;
  }
  const title = requireText(input.title, "Judul");
  if (title !== undefined) out.title = title;
  if (input.category !== undefined) {
    if (!(EVENT_CATEGORIES as readonly string[]).includes(input.category)) throw new PtnTourError("BAD_REQUEST", "Kategori tidak valid.");
    out.category = input.category;
  }
  if (input.subjects !== undefined) out.subjects = normalizeSubjects(input.subjects);
  const description = requireText(input.description, "Deskripsi singkat");
  if (description !== undefined) {
    if (description.length > 160) throw new PtnTourError("BAD_REQUEST", "Deskripsi singkat maksimal 160 karakter.");
    out.description = description;
  }
  if (input.longDescription !== undefined) out.longDescription = blankToNull(input.longDescription);
  if (input.rundown !== undefined) out.rundown = blankToNull(input.rundown);
  const tutor = requireText(input.tutor, "Nama tutor");
  if (tutor !== undefined) out.tutor = tutor;
  const campus = requireText(input.campus, "Kampus/jurusan tutor");
  if (campus !== undefined) out.campus = campus;
  if (input.posterUrl !== undefined) {
    const poster = input.posterUrl.trim();
    if (!poster || !isValidAssetUrl(poster)) throw new PtnTourError("BAD_REQUEST", "Poster harus berupa tautan gambar yang valid.");
    out.posterUrl = poster;
  }
  if (input.startsAt !== undefined) out.startsAt = parseDateOrThrow(input.startsAt, "Tanggal dan jam");
  if (input.durationMinutes !== undefined) {
    if (input.durationMinutes < 15 || input.durationMinutes > 600) throw new PtnTourError("BAD_REQUEST", "Durasi harus 15-600 menit.");
    out.durationMinutes = input.durationMinutes;
  }
  if (input.quota !== undefined) {
    if (input.quota !== null && input.quota < 1) throw new PtnTourError("BAD_REQUEST", "Kuota minimal 1, atau kosongkan untuk tanpa batas.");
    out.quota = input.quota;
  }
  for (const key of ["whatsappGroupUrl", "zoomUrl", "recordingUrl"] as const) {
    if (input[key] !== undefined) {
      const value = blankToNull(input[key]);
      assertOptionalUrl(value, { whatsappGroupUrl: "Link grup WA", zoomUrl: "Link Zoom", recordingUrl: "Link rekaman" }[key]);
      out[key] = value;
    }
  }
  if (input.recordingFreeDays !== undefined) {
    if (input.recordingFreeDays < 0 || input.recordingFreeDays > 3650) throw new PtnTourError("BAD_REQUEST", "Batas rekaman gratis 0-3650 hari (0 = tanpa batas).");
    out.recordingFreeDays = input.recordingFreeDays;
  }
  if (input.accessMode !== undefined) {
    if (!(ACCESS_MODES as readonly string[]).includes(input.accessMode)) throw new PtnTourError("BAD_REQUEST", "Mode akses tidak valid.");
    out.accessMode = input.accessMode;
  }
  if (input.scheduleStatus !== undefined) {
    if (!(SCHEDULE_STATUSES as readonly string[]).includes(input.scheduleStatus)) throw new PtnTourError("BAD_REQUEST", "Status jadwal tidak valid.");
    out.scheduleStatus = input.scheduleStatus;
  }
  if (input.isPublished !== undefined) out.isPublished = input.isPublished;
  return out;
}

const eventFieldsSchema = {
  "slug?": "string",
  "title?": "string",
  "category?": categoryType,
  "subjects?": "string[]",
  "description?": "string",
  "longDescription?": "string | null",
  "rundown?": "string | null",
  "tutor?": "string",
  "campus?": "string",
  "posterUrl?": "string",
  "startsAt?": "string",
  "durationMinutes?": "number.integer",
  "quota?": "number.integer | null",
  "whatsappGroupUrl?": "string | null",
  "zoomUrl?": "string | null",
  "recordingUrl?": "string | null",
  "recordingFreeDays?": "number.integer",
  "accessMode?": accessModeType,
  "scheduleStatus?": scheduleStatusType,
  "isPublished?": "boolean",
} as const;

// ---------------------------------------------------------------- publik
const list = pub.route({ path: "/ptn-tour", method: "GET", tags: ["PTN Tour"] }).handler(({ context }) =>
  ptnTourRepo.list({ userId: context.session?.user.id }),
);

const detail = pub
  .route({ path: "/ptn-tour/{slug}", method: "GET", tags: ["PTN Tour"] })
  .input(type({ slug: "string" }))
  .handler(async ({ input, context, errors }) => {
    const event = await ptnTourRepo.getBySlug({ slug: input.slug, userId: context.session?.user.id });
    if (!event) throw errors.NOT_FOUND({ message: "Event tidak ditemukan." });
    return event;
  });

// Sengaja di luar /ptn-tour/{slug} supaya kata "me" tidak bentrok dengan slug.
const mine = authedRateLimited
  .route({ path: "/me/ptn-tour", method: "GET", tags: ["PTN Tour"] })
  .handler(({ context }) => ptnTourRepo.list({ userId: context.session.user.id, onlyRegistered: true }));

const materials = pub
  .route({ path: "/ptn-tour/{slug}/materials", method: "GET", tags: ["PTN Tour"] })
  .input(type({ slug: "string" }))
  .handler(({ input, context, errors }) =>
    run(errors as unknown as Errors, () =>
      ptnTourRepo.materials({
        slug: input.slug,
        userId: context.session?.user.id,
        isPremium: Boolean(context.session?.user.isPremium),
      }),
    ),
  );

const settings = pub
  .route({ path: "/ptn-tour-settings", method: "GET", tags: ["PTN Tour"] })
  .handler(() => ptnTourRepo.getSettings());

const register = authedRateLimited
  .route({ path: "/ptn-tour/{eventId}/register", method: "POST", tags: ["PTN Tour"] })
  .input(
    type({
      eventId: "number.integer",
      schoolName: "string",
      classLevel: "string",
      phoneNumber: "string",
      dreamCampus: "string",
      educationLevel: "string",
      consent: "boolean",
      followProofs: "string[]",
      shareProofs: "string[]",
    }),
  )
  .handler(({ input, context, errors }) =>
    run(errors as unknown as Errors, () =>
      ptnTourRepo.register({
        ...input,
        dreamCampus: input.dreamCampus.trim(),
        educationLevel: input.educationLevel.trim() || "SMA",
        userId: context.session.user.id,
        isPremium: Boolean(context.session.user.isPremium),
      }),
    ),
  );

const join = authedRateLimited
  .route({ path: "/ptn-tour/{eventId}/join", method: "POST", tags: ["PTN Tour"] })
  .input(type({ eventId: "number.integer" }))
  .handler(({ input, context, errors }) =>
    run(errors as unknown as Errors, () =>
      ptnTourRepo.join({
        eventId: input.eventId,
        userId: context.session.user.id,
        isPremium: Boolean(context.session.user.isPremium),
      }),
    ),
  );

const watch = authedRateLimited
  .route({ path: "/ptn-tour/{slug}/recording", method: "GET", tags: ["PTN Tour"] })
  .input(type({ slug: "string" }))
  .handler(({ input, context, errors }) =>
    run(errors as unknown as Errors, () =>
      ptnTourRepo.watch({
        slug: input.slug,
        userId: context.session.user.id,
        isPremium: Boolean(context.session.user.isPremium),
      }),
    ),
  );

// ----------------------------------------------------------------- admin
const adminList = admin
  .route({ path: "/admin/ptn-tour", method: "GET", tags: ["Admin - PTN Tour"] })
  .handler(() => ptnTourRepo.adminList());

const adminGet = admin
  .route({ path: "/admin/ptn-tour/{id}", method: "GET", tags: ["Admin - PTN Tour"] })
  .input(type({ id: "number.integer" }))
  .handler(async ({ input, errors }) => {
    const event = await ptnTourRepo.adminGet({ id: input.id });
    if (!event) throw errors.NOT_FOUND({ message: "Event tidak ditemukan." });
    return event;
  });

const adminCreate = admin
  .route({ path: "/admin/ptn-tour", method: "POST", tags: ["Admin - PTN Tour"] })
  .input(
    type({
      slug: "string",
      title: "string",
      category: categoryType,
      "subjects?": "string[]",
      description: "string",
      "longDescription?": "string | null",
      "rundown?": "string | null",
      tutor: "string",
      campus: "string",
      posterUrl: "string",
      startsAt: "string",
      "durationMinutes?": "number.integer",
      "quota?": "number.integer | null",
      "whatsappGroupUrl?": "string | null",
      "zoomUrl?": "string | null",
      "recordingUrl?": "string | null",
      "recordingFreeDays?": "number.integer",
      "accessMode?": accessModeType,
      "isPublished?": "boolean",
    }),
  )
  .handler(({ input, errors }) =>
    run(errors as unknown as Errors, () =>
      ptnTourRepo.adminCreate({ input: normalizeEventInput(input) as Parameters<typeof ptnTourRepo.adminCreate>[0]["input"] }),
    ),
  );

const adminUpdate = admin
  .route({ path: "/admin/ptn-tour/{id}", method: "PUT", tags: ["Admin - PTN Tour"] })
  .input(type({ ...eventFieldsSchema, id: "number.integer" }))
  .handler(({ input, errors }) =>
    run(errors as unknown as Errors, async () => {
      const { id, ...fields } = input;
      const before = await ptnTourRepo.getRaw({ id });
      const event = await ptnTourRepo.adminUpdate({ id, input: normalizeEventInput(fields) });
      if (!event) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");
      if (before && event.isPublished) {
        const kind =
          event.scheduleStatus === "cancelled" && before.scheduleStatus !== "cancelled"
            ? "cancelled"
            : event.startsAt.getTime() !== before.startsAt.getTime() && event.scheduleStatus !== "cancelled"
              ? "rescheduled"
              : null;
        if (kind) void notifyScheduleChange({ eventId: id, kind }).catch(() => {});
      }
      return event;
    }),
  );

const adminDelete = admin
  .route({ path: "/admin/ptn-tour/{id}", method: "DELETE", tags: ["Admin - PTN Tour"] })
  .input(type({ id: "number.integer" }))
  .handler(async ({ input, errors }) => {
    const deleted = await ptnTourRepo.adminDelete({ id: input.id });
    if (!deleted) throw errors.NOT_FOUND({ message: "Event tidak ditemukan." });
    return { message: "Event dihapus." };
  });

const adminDuplicate = admin
  .route({ path: "/admin/ptn-tour/{id}/duplicate", method: "POST", tags: ["Admin - PTN Tour"] })
  .input(type({ id: "number.integer" }))
  .handler(({ input, errors }) =>
    run(errors as unknown as Errors, async () => {
      const source = await ptnTourRepo.adminGet({ id: input.id });
      if (!source) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");
      const slug = `${source.slug}-salinan-${Math.random().toString(36).slice(2, 7)}`;
      const event = await ptnTourRepo.adminDuplicate({ id: input.id, slug });
      if (!event) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");
      return event;
    }),
  );

const adminParticipants = admin
  .route({ path: "/admin/ptn-tour/{eventId}/participants", method: "GET", tags: ["Admin - PTN Tour"] })
  .input(type({ eventId: "number.integer" }))
  .handler(({ input }) => ptnTourRepo.adminParticipants({ eventId: input.eventId }));

const adminSettingsUpdate = admin
  .route({ path: "/admin/ptn-tour-settings", method: "PUT", tags: ["Admin - PTN Tour"] })
  .input(
    type({
      "whatsapp_channel_url?": "string",
      "promo_title?": "string",
      "promo_text?": "string",
      "promo_cta_label?": "string",
      "promo_cta_url?": "string",
    }),
  )
  .handler(({ input, errors }) =>
    run(errors as unknown as Errors, async () => {
      const values: Record<string, string> = {};
      for (const key of SETTING_KEYS) {
        const value = (input as Record<string, string | undefined>)[key];
        if (value === undefined) continue;
        const trimmed = value.trim();
        if (!trimmed) throw new PtnTourError("BAD_REQUEST", "Pengaturan tidak boleh kosong.");
        if ((key === "whatsapp_channel_url") && !isValidAssetUrl(trimmed)) throw new PtnTourError("BAD_REQUEST", "Link channel WhatsApp tidak valid.");
        if (key === "promo_cta_url" && !isValidAssetUrl(trimmed)) throw new PtnTourError("BAD_REQUEST", "Link tombol promo tidak valid.");
        values[key] = trimmed;
      }
      return ptnTourRepo.updateSettings({ values });
    }),
  );

const adminProofs = admin
  .route({ path: "/admin/ptn-tour/registrations/{registrationId}/proofs", method: "GET", tags: ["Admin - PTN Tour"] })
  .input(type({ registrationId: "number.integer" }))
  .handler(({ input }) => ptnTourRepo.adminProofs({ registrationId: input.registrationId }));

const adminUploadPoster = admin
  .route({ path: "/admin/ptn-tour/poster", method: "POST", tags: ["Admin - PTN Tour"] })
  .input(type({ image: "string" }))
  .handler(({ input, errors }) =>
    run(errors as unknown as Errors, async () => {
      if (!/^data:image\/(png|jpe?g|webp);base64,/.test(input.image) || input.image.length > 8_000_000) {
        throw new PtnTourError("BAD_REQUEST", "Poster harus gambar PNG, JPG, atau WebP di bawah ±6 MB.");
      }
      const url = await uploadTryoutImage(input.image, "habitutor/ptn-tour/poster");
      return { url };
    }),
  );

const adminMaterials = admin
  .route({ path: "/admin/ptn-tour/{eventId}/materials", method: "GET", tags: ["Admin - PTN Tour"] })
  .input(type({ eventId: "number.integer" }))
  .handler(({ input }) => ptnTourRepo.adminMaterials({ eventId: input.eventId }));

function normalizeMaterial(input: {
  label?: string;
  fileUrl?: string;
  fileType?: string;
  unlockAt?: string;
  sortOrder?: number;
  isPublished?: boolean;
}) {
  const out: Record<string, unknown> = {};
  const label = requireText(input.label, "Label materi");
  if (label !== undefined) out.label = label;
  if (input.fileUrl !== undefined) {
    const url = input.fileUrl.trim();
    if (!url || !isValidAssetUrl(url)) throw new PtnTourError("BAD_REQUEST", "Tautan file harus berupa URL http(s) yang valid.");
    out.fileUrl = url;
  }
  const fileType = requireText(input.fileType, "Jenis file");
  if (fileType !== undefined) out.fileType = fileType.toUpperCase();
  if (input.unlockAt !== undefined) {
    if (!(MATERIAL_UNLOCKS as readonly string[]).includes(input.unlockAt)) throw new PtnTourError("BAD_REQUEST", "Waktu buka materi tidak valid.");
    out.unlockAt = input.unlockAt;
  }
  if (input.sortOrder !== undefined) out.sortOrder = input.sortOrder;
  if (input.isPublished !== undefined) out.isPublished = input.isPublished;
  return out;
}

const materialSchema = {
  "label?": "string",
  "fileUrl?": "string",
  "fileType?": "string",
  "unlockAt?": unlockType,
  "sortOrder?": "number.integer",
  "isPublished?": "boolean",
} as const;

const adminMaterialCreate = admin
  .route({ path: "/admin/ptn-tour/{eventId}/materials", method: "POST", tags: ["Admin - PTN Tour"] })
  .input(
    type({
      eventId: "number.integer",
      label: "string",
      fileUrl: "string",
      "fileType?": "string",
      "unlockAt?": unlockType,
      "sortOrder?": "number.integer",
      "isPublished?": "boolean",
    }),
  )
  .handler(({ input, errors }) =>
    run(errors as unknown as Errors, async () => {
      const { eventId, ...fields } = input;
      const event = await ptnTourRepo.adminGet({ id: eventId });
      if (!event) throw new PtnTourError("NOT_FOUND", "Event tidak ditemukan.");
      return ptnTourRepo.adminMaterialCreate({
        input: { ...(normalizeMaterial(fields) as { label: string; fileUrl: string }), eventId },
      });
    }),
  );

const adminMaterialUpdate = admin
  .route({ path: "/admin/ptn-tour/materials/{id}", method: "PUT", tags: ["Admin - PTN Tour"] })
  .input(type({ ...materialSchema, id: "number.integer" }))
  .handler(({ input, errors }) =>
    run(errors as unknown as Errors, async () => {
      const { id, ...fields } = input;
      const material = await ptnTourRepo.adminMaterialUpdate({ id, input: normalizeMaterial(fields) });
      if (!material) throw new PtnTourError("NOT_FOUND", "Materi tidak ditemukan.");
      return material;
    }),
  );

const adminMaterialDelete = admin
  .route({ path: "/admin/ptn-tour/materials/{id}", method: "DELETE", tags: ["Admin - PTN Tour"] })
  .input(type({ id: "number.integer" }))
  .handler(async ({ input, errors }) => {
    const deleted = await ptnTourRepo.adminMaterialDelete({ id: input.id });
    if (!deleted) throw errors.NOT_FOUND({ message: "Materi tidak ditemukan." });
    return { message: "Materi dihapus." };
  });

export const ptnTourRouter = {
  list,
  detail,
  me: mine,
  materials,
  register,
  join,
  watch,
  settings,
  admin: {
    list: adminList,
    get: adminGet,
    create: adminCreate,
    update: adminUpdate,
    delete: adminDelete,
    duplicate: adminDuplicate,
    participants: adminParticipants,
    proofs: adminProofs,
    settings: { update: adminSettingsUpdate },
    uploadPoster: adminUploadPoster,
    materials: {
      list: adminMaterials,
      create: adminMaterialCreate,
      update: adminMaterialUpdate,
      delete: adminMaterialDelete,
    },
  },
};
