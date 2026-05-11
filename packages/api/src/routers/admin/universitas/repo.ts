import { type DrizzleDatabase, db as defaultDb } from "@habitutor/db";
import { programStudi, universitas } from "@habitutor/db/schema/universitas";
import { and, asc, eq, ne } from "drizzle-orm";

export const adminUniversitasRepo = {
  listUniversitas: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    return db.query.universitas.findMany({
      orderBy: (u, { asc: ascFn }) => [ascFn(u.rankUniv), ascFn(u.id)],
      with: {
        programStudi: {
          orderBy: (p, { asc: ascFn }) => [ascFn(p.id)],
        },
      },
    });
  },

  getUniversitasById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    return db.query.universitas.findFirst({
      where: eq(universitas.id, id),
      with: {
        programStudi: {
          orderBy: (p, { asc: ascFn }) => [ascFn(p.id)],
        },
      },
    });
  },

  getUniversitasByNama: async ({
    db = defaultDb,
    namaUniv,
    excludeId,
  }: {
    db?: DrizzleDatabase;
    namaUniv: string;
    excludeId?: number;
  }) => {
    const [row] = await db
      .select()
      .from(universitas)
      .where(and(eq(universitas.namaUniv, namaUniv), excludeId !== undefined ? ne(universitas.id, excludeId) : undefined))
      .limit(1);
    return row;
  },

  getUniversitasByRank: async ({
    db = defaultDb,
    rankUniv,
    excludeId,
  }: {
    db?: DrizzleDatabase;
    rankUniv: number;
    excludeId?: number;
  }) => {
    const [row] = await db
      .select()
      .from(universitas)
      .where(and(eq(universitas.rankUniv, rankUniv), excludeId !== undefined ? ne(universitas.id, excludeId) : undefined))
      .limit(1);
    return row;
  },

  createUniversitas: async ({
    db = defaultDb,
    namaUniv,
    rankUniv,
  }: {
    db?: DrizzleDatabase;
    namaUniv: string;
    rankUniv: number;
  }) => {
    const [created] = await db
      .insert(universitas)
      .values({
        namaUniv,
        rankUniv,
      })
      .returning();
    return created;
  },

  updateUniversitas: async ({
    db = defaultDb,
    id,
    data,
  }: {
    db?: DrizzleDatabase;
    id: number;
    data: {
      namaUniv?: string;
      rankUniv?: number;
      updatedAt?: Date;
    };
  }) => {
    const [updated] = await db.update(universitas).set(data).where(eq(universitas.id, id)).returning();
    return updated;
  },

  deleteUniversitas: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [deleted] = await db.delete(universitas).where(eq(universitas.id, id)).returning();
    return deleted;
  },

  listProgramStudi: async ({ db = defaultDb }: { db?: DrizzleDatabase }) => {
    return db.select().from(programStudi).orderBy(asc(programStudi.univId), asc(programStudi.id));
  },

  getProgramStudiById: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [row] = await db.select().from(programStudi).where(eq(programStudi.id, id)).limit(1);
    return row;
  },

  createProgramStudi: async ({
    db = defaultDb,
    nama,
    passedGrade,
    univId,
  }: {
    db?: DrizzleDatabase;
    nama: string;
    passedGrade: number;
    univId: number;
  }) => {
    const [created] = await db
      .insert(programStudi)
      .values({
        nama,
        passedGrade,
        univId,
      })
      .returning();
    return created;
  },

  createProgramStudiBulk: async ({
    db = defaultDb,
    univId,
    items,
  }: {
    db?: DrizzleDatabase;
    univId: number;
    items: Array<{ nama: string; passedGrade: number }>;
  }) => {
    return db.insert(programStudi).values(items.map((item) => ({ ...item, univId }))).returning();
  },

  updateProgramStudi: async ({
    db = defaultDb,
    id,
    data,
  }: {
    db?: DrizzleDatabase;
    id: number;
    data: {
      nama?: string;
      passedGrade?: number;
      univId?: number;
      updatedAt?: Date;
    };
  }) => {
    const [updated] = await db.update(programStudi).set(data).where(eq(programStudi.id, id)).returning();
    return updated;
  },

  deleteProgramStudi: async ({ db = defaultDb, id }: { db?: DrizzleDatabase; id: number }) => {
    const [deleted] = await db.delete(programStudi).where(eq(programStudi.id, id)).returning();
    return deleted;
  },
};
