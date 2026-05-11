import { ORPCError } from "@orpc/server";
import { type } from "arktype";
import { admin } from "../../../index";
import { adminUniversitasRepo } from "./repo";

function normalizeNamaUniv(raw: string) {
  const namaUniv = raw.trim();
  if (namaUniv.length < 2 || namaUniv.length > 120) {
    throw new ORPCError("BAD_REQUEST", { message: "namaUniv harus 2-120 karakter" });
  }
  return namaUniv;
}

function validateRankUniv(rankUniv: number) {
  if (!Number.isInteger(rankUniv) || rankUniv < 1) {
    throw new ORPCError("BAD_REQUEST", { message: "rankUniv harus bilangan bulat >= 1" });
  }
}

function parsePathId(rawId: string) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) {
    throw new ORPCError("BAD_REQUEST", { message: "id harus bilangan bulat >= 1" });
  }
  return id;
}

const listUniversitas = admin
  .route({
    path: "/admin/universitas",
    method: "GET",
    tags: ["Admin - Universitas"],
  })
  .handler(async () => {
    return adminUniversitasRepo.listUniversitas({});
  });

const getUniversitasById = admin
  .route({
    path: "/admin/universitas/{id}",
    method: "GET",
    tags: ["Admin - Universitas"],
  })
  .input(type({ id: "string" }))
  .handler(async ({ input }) => {
    const id = parsePathId(input.id);
    const row = await adminUniversitasRepo.getUniversitasById({ id });
    if (!row) throw new ORPCError("NOT_FOUND", { message: "Universitas tidak ditemukan" });
    return row;
  });

const createUniversitas = admin
  .route({
    path: "/admin/universitas",
    method: "POST",
    tags: ["Admin - Universitas"],
  })
  .input(
    type({
      namaUniv: "string",
      rankUniv: "number",
    }),
  )
  .handler(async ({ input }) => {
    const namaUniv = normalizeNamaUniv(input.namaUniv);
    validateRankUniv(input.rankUniv);

    const existingByNama = await adminUniversitasRepo.getUniversitasByNama({ namaUniv });
    if (existingByNama) throw new ORPCError("CONFLICT", { message: "nama universitas sudah digunakan" });

    const existingByRank = await adminUniversitasRepo.getUniversitasByRank({ rankUniv: input.rankUniv });
    if (existingByRank) throw new ORPCError("CONFLICT", { message: "rank universitas sudah digunakan" });

    return adminUniversitasRepo.createUniversitas({
      namaUniv,
      rankUniv: input.rankUniv,
    });
  });

const updateUniversitas = admin
  .route({
    path: "/admin/universitas/{id}",
    method: "PUT",
    tags: ["Admin - Universitas"],
  })
  .input(
    type({
      id: "string",
      "namaUniv?": "string",
      "rankUniv?": "number",
    }),
  )
  .handler(async ({ input }) => {
    const id = parsePathId(input.id);
    const existing = await adminUniversitasRepo.getUniversitasById({ id });
    if (!existing) throw new ORPCError("NOT_FOUND", { message: "Universitas tidak ditemukan" });

    const namaUniv = input.namaUniv !== undefined ? normalizeNamaUniv(input.namaUniv) : undefined;
    if (input.rankUniv !== undefined) validateRankUniv(input.rankUniv);

    if (namaUniv !== undefined) {
      const duplicateNama = await adminUniversitasRepo.getUniversitasByNama({ namaUniv, excludeId: id });
      if (duplicateNama) throw new ORPCError("CONFLICT", { message: "nama universitas sudah digunakan" });
    }

    if (input.rankUniv !== undefined) {
      const duplicateRank = await adminUniversitasRepo.getUniversitasByRank({
        rankUniv: input.rankUniv,
        excludeId: id,
      });
      if (duplicateRank) throw new ORPCError("CONFLICT", { message: "rank universitas sudah digunakan" });
    }

    const updated = await adminUniversitasRepo.updateUniversitas({
      id,
      data: {
        namaUniv,
        rankUniv: input.rankUniv,
        updatedAt: new Date(),
      },
    });

    if (!updated) throw new ORPCError("NOT_FOUND", { message: "Universitas tidak ditemukan" });
    return updated;
  });

const deleteUniversitas = admin
  .route({
    path: "/admin/universitas/{id}",
    method: "DELETE",
    tags: ["Admin - Universitas"],
  })
  .input(type({ id: "string" }))
  .handler(async ({ input }) => {
    const id = parsePathId(input.id);
    const deleted = await adminUniversitasRepo.deleteUniversitas({ id });
    if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Universitas tidak ditemukan" });
    return { message: "Universitas berhasil dihapus" };
  });

const listProgramStudi = admin
  .route({
    path: "/admin/program-studi",
    method: "GET",
    tags: ["Admin - Program Studi"],
  })
  .handler(async () => {
    return adminUniversitasRepo.listProgramStudi({});
  });

const getProgramStudiById = admin
  .route({
    path: "/admin/program-studi/{id}",
    method: "GET",
    tags: ["Admin - Program Studi"],
  })
  .input(type({ id: "string" }))
  .handler(async ({ input }) => {
    const id = parsePathId(input.id);
    const row = await adminUniversitasRepo.getProgramStudiById({ id });
    if (!row) throw new ORPCError("NOT_FOUND", { message: "Program studi tidak ditemukan" });
    return row;
  });

const createProgramStudi = admin
  .route({
    path: "/admin/program-studi",
    method: "POST",
    tags: ["Admin - Program Studi"],
  })
  .input(
    type({
      univId: "number",
      "nama?": "string",
      "passedGrade?": "number",
      "items?": "unknown",
    }),
  )
  .handler(async ({ input }) => {
    const univ = await adminUniversitasRepo.getUniversitasById({ id: input.univId });
    if (!univ) throw new ORPCError("NOT_FOUND", { message: "Universitas tidak ditemukan" });

    if (input.items !== undefined) {
      if (input.nama !== undefined || input.passedGrade !== undefined) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Gunakan mode single (nama, passedGrade) atau mode bulk (items), tidak boleh bersamaan",
        });
      }

      if (!Array.isArray(input.items)) {
        throw new ORPCError("BAD_REQUEST", { message: "items harus berupa array" });
      }

      const items = input.items as Array<{ nama?: unknown; passedGrade?: unknown }>;
      if (items.length === 0) {
        throw new ORPCError("BAD_REQUEST", { message: "items tidak boleh kosong" });
      }

      const normalizedItems = items.map((item, index) => {
        if (typeof item?.nama !== "string" || item.nama.trim().length === 0) {
          throw new ORPCError("BAD_REQUEST", { message: `items[${index}].nama tidak valid` });
        }
        if (typeof item?.passedGrade !== "number") {
          throw new ORPCError("BAD_REQUEST", { message: `items[${index}].passedGrade tidak valid` });
        }

        return {
          nama: item.nama.trim(),
          passedGrade: item.passedGrade,
        };
      });

      return adminUniversitasRepo.createProgramStudiBulk({
        univId: input.univId,
        items: normalizedItems,
      });
    }

    if (typeof input.nama !== "string" || input.nama.trim().length === 0) {
      throw new ORPCError("BAD_REQUEST", { message: "nama tidak valid" });
    }
    if (typeof input.passedGrade !== "number") {
      throw new ORPCError("BAD_REQUEST", { message: "passedGrade tidak valid" });
    }

    return adminUniversitasRepo.createProgramStudi({
      nama: input.nama.trim(),
      passedGrade: input.passedGrade,
      univId: input.univId,
    });
  });

const createProgramStudiBulk = createProgramStudi;

const updateProgramStudi = admin
  .route({
    path: "/admin/program-studi/{id}",
    method: "PUT",
    tags: ["Admin - Program Studi"],
  })
  .input(
    type({
      id: "string",
      "nama?": "string",
      "passedGrade?": "number",
      "univId?": "number",
    }),
  )
  .handler(async ({ input }) => {
    const id = parsePathId(input.id);
    if (input.univId !== undefined) {
      const univ = await adminUniversitasRepo.getUniversitasById({ id: input.univId });
      if (!univ) throw new ORPCError("NOT_FOUND", { message: "Universitas tidak ditemukan" });
    }

    const updated = await adminUniversitasRepo.updateProgramStudi({
      id,
      data: {
        nama: input.nama,
        passedGrade: input.passedGrade,
        univId: input.univId,
        updatedAt: new Date(),
      },
    });

    if (!updated) throw new ORPCError("NOT_FOUND", { message: "Program studi tidak ditemukan" });
    return updated;
  });

const deleteProgramStudi = admin
  .route({
    path: "/admin/program-studi/{id}",
    method: "DELETE",
    tags: ["Admin - Program Studi"],
  })
  .input(type({ id: "string" }))
  .handler(async ({ input }) => {
    const id = parsePathId(input.id);
    const deleted = await adminUniversitasRepo.deleteProgramStudi({ id });
    if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Program studi tidak ditemukan" });
    return { message: "Program studi berhasil dihapus" };
  });

export const adminUniversitasRouter = {
  universitas: {
    list: listUniversitas,
    find: getUniversitasById,
    create: createUniversitas,
    update: updateUniversitas,
    remove: deleteUniversitas,
  },
  programStudi: {
    list: listProgramStudi,
    find: getProgramStudiById,
    create: createProgramStudi,
    bulkCreate: createProgramStudiBulk,
    update: updateProgramStudi,
    remove: deleteProgramStudi,
  },
};
