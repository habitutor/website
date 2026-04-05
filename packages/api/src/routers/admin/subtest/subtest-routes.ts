import { db } from "@habitutor/db";
import { ORPCError } from "@orpc/client";
import { type } from "arktype";
import { admin } from "../../../index";
import { adminSubtestRepo } from "./repo";

export const createSubtest = admin
  .route({
    path: "/admin/subtests",
    method: "POST",
    tags: ["Admin - Classes"],
  })
  .input(
    type({
      name: "string",
      shortName: "string",
      description: "string?",
      order: "number?",
    }),
  )
  .output(type({ message: "string", id: "number" }))
  .handler(async ({ input }) => {
    const created = await adminSubtestRepo.createSubtest({
      name: input.name,
      shortName: input.shortName,
      description: input.description ?? null,
      order: input.order ?? 1,
    });

    if (!created)
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Gagal membuat kelas",
      });

    return {
      message: "Kelas berhasil dibuat",
      id: created.id,
    };
  });

export const updateSubtest = admin
  .route({
    path: "/admin/subtests/{id}",
    method: "PATCH",
    tags: ["Admin - Classes"],
  })
  .input(
    type({
      id: "number",
      name: "string?",
      shortName: "string?",
      description: "string?",
      order: "number?",
    }),
  )
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    const updateData: {
      name?: string;
      shortName?: string;
      description?: string | null;
      order?: number;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.shortName !== undefined) updateData.shortName = input.shortName;
    if (input.description !== undefined) updateData.description = input.description ?? null;
    if (input.order !== undefined) updateData.order = input.order;

    const updatedRow = await adminSubtestRepo.updateSubtest({ id: input.id, data: updateData });

    if (!updatedRow)
      throw new ORPCError("NOT_FOUND", {
        message: "Kelas tidak ditemukan",
      });

    return { message: "Kelas berhasil diperbarui" };
  });

export const deleteSubtest = admin
  .route({
    path: "/admin/subtests/{id}",
    method: "DELETE",
    tags: ["Admin - Classes"],
  })
  .input(type({ id: "number" }))
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    const deletedRow = await adminSubtestRepo.deleteSubtest({ id: input.id });

    if (!deletedRow)
      throw new ORPCError("NOT_FOUND", {
        message: "Kelas tidak ditemukan",
      });

    return { message: "Kelas berhasil dihapus" };
  });

export const reorderSubtests = admin
  .route({
    path: "/admin/subtests/reorder",
    method: "PATCH",
    tags: ["Admin - Classes"],
  })
  .input(
    type({
      items: "unknown",
    }),
  )
  .output(type({ message: "string" }))
  .handler(async ({ input }) => {
    const items = input.items as { id: number; order: number }[];

    await db.transaction(async (tx) => {
      for (const item of items) {
        await adminSubtestRepo.updateSubtestOrder({ db: tx, id: item.id, order: item.order });
      }
    });

    return { message: "Urutan kelas berhasil diperbarui" };
  });
