import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../..";
import { adminDashboardContentRepo } from "./repo";

const normalizeDateInput = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split("-");
    return `${year}-${month}-${day}`;
  }
  return null;
};

const normalizeTimeInput = (value: string) => {
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
  return null;
};

const toScheduleDate = (date: string, time: string) => {
  const scheduledAt = new Date(`${date}T${time}:00`);
  return Number.isNaN(scheduledAt.getTime()) ? null : scheduledAt;
};

const list = admin
  .route({
    path: "/admin/dashboard-content",
    method: "GET",
    tags: ["Admin - Dashboard Content"],
  })
  .handler(async () => {
    await adminDashboardContentRepo.cleanupExpiredLiveClasses({});
    await adminDashboardContentRepo.ensurePrimaryAnnouncement({});

    const [liveClasses, announcements] = await Promise.all([
      adminDashboardContentRepo.listLiveClasses({}),
      adminDashboardContentRepo.listAnnouncements({}),
    ]);

    return {
      liveClasses,
      announcements,
    };
  });

const createLiveClass = admin
  .route({
    path: "/admin/dashboard-content/live-classes",
    method: "POST",
    tags: ["Admin - Dashboard Content"],
  })
  .input(
    type({
      title: "string",
      date: "string",
      time: "string",
      teacher: "string",
      link: "string",
      access: "'3x' | '5x'",
    }),
  )
  .handler(async ({ input }) => {
    const normalizedDate = normalizeDateInput(input.date);
    const normalizedTime = normalizeTimeInput(input.time);

    const existingLiveClassCount = await adminDashboardContentRepo.countLiveClasses({});
    if (existingLiveClassCount >= 10) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Maksimal 10 live class. Hapus kelas lama sebelum menambahkan yang baru.",
      });
    }

    if (!input.title.trim() || !input.teacher.trim() || !input.link.trim()) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Semua field live class wajib diisi",
      });
    }

    if (!normalizedDate || !normalizedTime) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Format tanggal/waktu tidak valid",
      });
    }

    const scheduledAt = toScheduleDate(normalizedDate, normalizedTime);
    if (!scheduledAt || scheduledAt <= new Date()) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Tanggal dan waktu live class harus di masa depan",
      });
    }

    const row = await adminDashboardContentRepo.createLiveClass({
      input: {
        title: input.title,
        date: normalizedDate,
        time: normalizedTime,
        teacher: input.teacher,
        link: input.link,
        access: input.access,
      },
    });

    if (!row) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal membuat live class",
      });
    }

    return row;
  });

const updateLiveClass = admin
  .route({
    path: "/admin/dashboard-content/live-classes/{id}",
    method: "PUT",
    tags: ["Admin - Dashboard Content"],
  })
  .input(
    type({
      id: "number",
      title: "string",
      date: "string",
      time: "string",
      teacher: "string",
      link: "string",
      access: "'3x' | '5x'",
    }),
  )
  .handler(async ({ input }) => {
    const { id, ...updatePayload } = input;
    const normalizedDate = normalizeDateInput(updatePayload.date);
    const normalizedTime = normalizeTimeInput(updatePayload.time);

    if (!updatePayload.title.trim() || !updatePayload.teacher.trim() || !updatePayload.link.trim()) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Semua field live class wajib diisi",
      });
    }

    if (!normalizedDate || !normalizedTime) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Format tanggal/waktu tidak valid",
      });
    }

    const scheduledAt = toScheduleDate(normalizedDate, normalizedTime);
    if (!scheduledAt || scheduledAt <= new Date()) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Tanggal dan waktu live class harus di masa depan",
      });
    }

    const row = await adminDashboardContentRepo.updateLiveClass({
      id,
      input: {
        title: updatePayload.title,
        date: normalizedDate,
        time: normalizedTime,
        teacher: updatePayload.teacher,
        link: updatePayload.link,
        access: updatePayload.access,
      },
    });

    if (!row) {
      throw new ORPCError("NOT_FOUND", {
        message: "Live class tidak ditemukan",
      });
    }

    return row;
  });

const deleteLiveClass = admin
  .route({
    path: "/admin/dashboard-content/live-classes/{id}",
    method: "DELETE",
    tags: ["Admin - Dashboard Content"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const row = await adminDashboardContentRepo.deleteLiveClass({
      id: input.id,
    });

    if (!row) {
      throw new ORPCError("NOT_FOUND", {
        message: "Live class tidak ditemukan",
      });
    }

    return { message: "Live class berhasil dihapus" };
  });

const createAnnouncement = admin
  .route({
    path: "/admin/dashboard-content/announcements",
    method: "POST",
    tags: ["Admin - Dashboard Content"],
  })
  .input(
    type({
      title: "string",
      description: "string",
    }),
  )
  .handler(async ({ input }) => {
    if (!input.title.trim() || !input.description.trim()) {
      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        message: "Judul dan deskripsi announcement wajib diisi",
      });
    }

    const row = await adminDashboardContentRepo.upsertPrimaryAnnouncement({
      input: {
        title: input.title,
        description: input.description,
      },
    });

    if (!row) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal membuat announcement",
      });
    }

    return row;
  });

const updateAnnouncement = admin
  .route({
    path: "/admin/dashboard-content/announcements/{id}",
    method: "PUT",
    tags: ["Admin - Dashboard Content"],
  })
  .input(
    type({
      id: "number",
      title: "string",
      description: "string",
    }),
  )
  .handler(async ({ input }) => {
    const existing = await adminDashboardContentRepo.getAnnouncementById({
      id: input.id,
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Announcement tidak ditemukan",
      });
    }

    if (existing.variant !== "primary") {
      throw new ORPCError("FORBIDDEN", {
        message: "Promo cashback tidak bisa diubah",
      });
    }

    const row = await adminDashboardContentRepo.updateAnnouncement({
      id: input.id,
      input: {
        title: input.title,
        description: input.description,
        variant: existing.variant,
        ctaLink: existing.ctaLink,
        ctaLabel: existing.ctaLabel,
        order: existing.order,
        isPublished: existing.isPublished,
      },
    });

    if (!row) {
      throw new ORPCError("NOT_FOUND", {
        message: "Announcement tidak ditemukan",
      });
    }

    return row;
  });

const deleteAnnouncement = admin
  .route({
    path: "/admin/dashboard-content/announcements/{id}",
    method: "DELETE",
    tags: ["Admin - Dashboard Content"],
  })
  .input(type({ id: "number" }))
  .handler(async ({ input }) => {
    const existing = await adminDashboardContentRepo.getAnnouncementById({
      id: input.id,
    });

    if (!existing) {
      throw new ORPCError("NOT_FOUND", {
        message: "Announcement tidak ditemukan",
      });
    }

    if (existing.variant !== "primary") {
      throw new ORPCError("FORBIDDEN", {
        message: "Promo cashback tidak bisa dihapus",
      });
    }

    const row = await adminDashboardContentRepo.deleteAnnouncement({
      id: input.id,
    });

    if (!row) {
      throw new ORPCError("NOT_FOUND", {
        message: "Announcement tidak ditemukan",
      });
    }

    return { message: "Announcement berhasil dihapus" };
  });

export const adminDashboardContentRouter = {
  list,
  liveClass: {
    create: createLiveClass,
    update: updateLiveClass,
    remove: deleteLiveClass,
  },
  announcement: {
    create: createAnnouncement,
    update: updateAnnouncement,
    remove: deleteAnnouncement,
  },
};
