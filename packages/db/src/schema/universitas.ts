import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

export const universitas = pgTable(
  "universitas",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    namaUniv: text("nama_univ").notNull(),
    rankUniv: integer("rank_univ").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [unique("universitas_nama_univ_unique").on(t.namaUniv), unique("universitas_rank_univ_unique").on(t.rankUniv)],
);

export const programStudi = pgTable("program_studi", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  nama: text().notNull(),
  passedGrade: integer("passed_grade").notNull(),
  univId: integer("univ_id")
    .notNull()
    .references(() => universitas.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const universitasRelations = relations(universitas, ({ many }) => ({
  programStudi: many(programStudi),
}));

export const programStudiRelations = relations(programStudi, ({ one }) => ({
  universitas: one(universitas, {
    fields: [programStudi.univId],
    references: [universitas.id],
  }),
}));
