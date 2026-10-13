import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../..";
import { recordingRepo } from "../../recording/repo";

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const normalizeYouTubeUrl = (url: string) => {
  const id = url.trim().match(YOUTUBE_ID)?.[1];
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
};

const validate = (input: { title: string; youtubeUrl: string; recordedAt: string }) => {
  if (!input.title.trim()) {
    throw new ORPCError("UNPROCESSABLE_CONTENT", { message: "Judul wajib diisi" });
  }
  const youtubeUrl = normalizeYouTubeUrl(input.youtubeUrl);
  if (!youtubeUrl) {
    throw new ORPCError("UNPROCESSABLE_CONTENT", { message: "Link YouTube tidak valid" });
  }
  if (!DATE_PATTERN.test(input.recordedAt)) {
    throw new ORPCError("UNPROCESSABLE_CONTENT", { message: "Format tanggal tidak valid" });
  }
  return youtubeUrl;
};

const list = admin
  .route({
    path: "/admin/recordings",
    method: "GET",
    tags: ["Admin - Recording"],
  })
  .handler(async () => {
    return recordingRepo.listAll({});
  });

const create = admin
  .route({
    path: "/admin/recordings",
    method: "POST",
    tags: ["Admin - Recording"],
  })
  .input(
    type({
      category: "'TKA' | 'SNBT' | 'MANDIRI'",
      title: "string",
      teacher: "string",
      youtubeUrl: "string",
      recordedAt: "string",
    }),
  )
  .handler(async ({ input }) => {
    const youtubeUrl = validate(input);
    const row = await recordingRepo.create({
      input: {
        category: input.category,
        title: input.title.trim(),
        teacher: input.teacher.trim() || null,
        youtubeUrl,
        recordedAt: input.recordedAt,
        isPublished: true,
      },
    });
    if (!row) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Gagal menyimpan rekaman" });
    }
    return row;
  });

const update = admin
  .route({
    path: "/admin/recordings/{id}",
    method: "PUT",
    tags: ["Admin - Recording"],
  })
  .input(
    type({
      id: "number",
      category: "'TKA' | 'SNBT' | 'MANDIRI'",
      title: "string",
      teacher: "string",
      youtubeUrl: "string",
      recordedAt: "string",
      isPublished: "boolean",
    }),
  )
  .handler(async ({ input }) => {
    const youtubeUrl = validate(input);
    const row = await recordingRepo.update({
      id: input.id,
      input: {
        category: input.category,
        title: input.title.trim(),
        teacher: input.teacher.trim() || null,
        youtubeUrl,
        recordedAt: input.recordedAt,
        isPublished: input.isPublished,
      },
    });
    if (!row) {
      throw new ORPCError("NOT_FOUND", { message: "Rekaman tidak ditemukan" });
    }
    return row;
  });

const remove = admin
  .route({
    path: "/admin/recordings/{id}",
    method: "DELETE",
    tags: ["Admin - Recording"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const row = await recordingRepo.remove({ id: input.id });
    if (!row) {
      throw new ORPCError("NOT_FOUND", { message: "Rekaman tidak ditemukan" });
    }
    return { message: "Rekaman berhasil dihapus" };
  });

export const adminRecordingRouter = { list, create, update, remove };