import { relations } from "drizzle-orm";
import { boolean, char, index, integer, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { user } from "./user";

export const tryoutStatusEnum = pgEnum("tryout_status", ["draft", "published", "archived"]);
export const tryoutQuestionTypeEnum = pgEnum("tryout_question_type", ["pilgan", "multiple"]);
export const tryoutSessionStatusEnum = pgEnum("tryout_session_status", ["berjalan", "selesai", "expired"]);
export const tryoutSessionSubtestStatusEnum = pgEnum("tryout_session_subtest_status", [
  "menunggu",
  "berjalan",
  "selesai",
  "expired",
]);

export const tryout = pgTable(
  "tryout",
  {
    id: uuid().defaultRandom().primaryKey(),
    dibuatOleh: text("dibuat_oleh")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    judul: text("judul").notNull(),
    deskripsi: text("deskripsi"),
    status: tryoutStatusEnum("status").notNull().default("draft"),
    mulaiAt: timestamp("mulai_at"),
    selesaiAt: timestamp("selesai_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_tryout_dibuat_oleh").on(t.dibuatOleh), index("idx_tryout_status").on(t.status)],
);

export const tryoutSubtes = pgTable(
  "tryout_subtes",
  {
    id: uuid().defaultRandom().primaryKey(),
    tryoutId: uuid("tryout_id")
      .notNull()
      .references(() => tryout.id, { onDelete: "cascade" }),
    namaSubtes: text("nama_subtes").notNull(),
    jumlahSoal: integer("jumlah_soal").notNull(),
    durasiMenit: integer("durasi_menit").notNull(),
    urutan: integer("urutan").notNull(),
    nilaiMinimum: integer("nilai_minimum"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_tryout_subtes_tryout_id").on(t.tryoutId),
    unique("tryout_subtes_tryout_id_urutan_unique").on(t.tryoutId, t.urutan),
  ],
);

export const tryoutSoal = pgTable(
  "tryout_soal",
  {
    id: uuid().defaultRandom().primaryKey(),
    subtesId: uuid("subtes_id")
      .notNull()
      .references(() => tryoutSubtes.id, { onDelete: "cascade" }),
    pertanyaan: text("pertanyaan").notNull(),
    gambarUrl: text("gambar_url"),
    tipe: tryoutQuestionTypeEnum("tipe").notNull().default("pilgan"),
    poin: integer("poin").notNull().default(0),
    pembahasan: text("pembahasan"),
    pembahasanGambar: text("pembahasan_gambar"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_tryout_soal_subtes_id").on(t.subtesId)],
);

export const tryoutPilihanJawaban = pgTable(
  "tryout_pilihan_jawaban",
  {
    id: uuid().defaultRandom().primaryKey(),
    soalId: uuid("soal_id")
      .notNull()
      .references(() => tryoutSoal.id, { onDelete: "cascade" }),
    label: char("label", { length: 1 }).notNull(),
    isi: text("isi").notNull(),
    gambarUrl: text("gambar_url"),
    isBenar: boolean("is_benar").notNull().default(false),
  },
  (t) => [
    index("idx_tryout_pilihan_soal_id").on(t.soalId),
    unique("tryout_pilihan_soal_id_label_unique").on(t.soalId, t.label),
  ],
);

export const tryoutSesi = pgTable(
  "tryout_sesi",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tryoutId: uuid("tryout_id")
      .notNull()
      .references(() => tryout.id, { onDelete: "cascade" }),
    mulaiAt: timestamp("mulai_at").notNull().defaultNow(),
    selesaiAt: timestamp("selesai_at"),
    totalSkor: integer("total_skor"),
    peringkat: integer("peringkat"),
    status: tryoutSessionStatusEnum("status").notNull().default("berjalan"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("idx_tryout_sesi_user_id").on(t.userId), index("idx_tryout_sesi_tryout_id").on(t.tryoutId)],
);

export const tryoutSesiSubtes = pgTable(
  "tryout_sesi_subtes",
  {
    id: uuid().defaultRandom().primaryKey(),
    sesiId: uuid("sesi_id")
      .notNull()
      .references(() => tryoutSesi.id, { onDelete: "cascade" }),
    subtesId: uuid("subtes_id")
      .notNull()
      .references(() => tryoutSubtes.id, { onDelete: "cascade" }),
    urutanPengerjaan: integer("urutan_pengerjaan").notNull(),
    mulaiAt: timestamp("mulai_at").notNull(),
    deadlineAt: timestamp("deadline_at").notNull(),
    selesaiAt: timestamp("selesai_at"),
    skorSubtes: integer("skor_subtes"),
    isLulus: boolean("is_lulus"),
    status: tryoutSessionSubtestStatusEnum("status").notNull().default("menunggu"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_tryout_sesi_subtes_sesi_id").on(t.sesiId),
    unique("tryout_sesi_subtes_sesi_id_subtes_id_unique").on(t.sesiId, t.subtesId),
  ],
);

export const tryoutSesiSoal = pgTable(
  "tryout_sesi_soal",
  {
    id: uuid().defaultRandom().primaryKey(),
    sesiSubtesId: uuid("sesi_subtes_id")
      .notNull()
      .references(() => tryoutSesiSubtes.id, { onDelete: "cascade" }),
    soalId: uuid("soal_id")
      .notNull()
      .references(() => tryoutSoal.id, { onDelete: "cascade" }),
    urutanTampil: integer("urutan_tampil").notNull(),
    isRagu: boolean("is_ragu").notNull().default(false),
    isDijawab: boolean("is_dijawab").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("idx_tryout_sesi_soal_sesi_subtes_id").on(t.sesiSubtesId),
    unique("tryout_sesi_soal_sesi_subtes_id_soal_id_unique").on(t.sesiSubtesId, t.soalId),
  ],
);

export const tryoutJawaban = pgTable(
  "tryout_jawaban",
  {
    id: uuid().defaultRandom().primaryKey(),
    sesiId: uuid("sesi_id")
      .notNull()
      .references(() => tryoutSesi.id, { onDelete: "cascade" }),
    sesiSoalId: uuid("sesi_soal_id")
      .notNull()
      .references(() => tryoutSesiSoal.id, { onDelete: "cascade" }),
    pilihanId: uuid("pilihan_id").references(() => tryoutPilihanJawaban.id, { onDelete: "set null" }),
    dijawabAt: timestamp("dijawab_at"),
    isBenar: boolean("is_benar"),
    poinDapat: integer("poin_dapat"),
  },
  (t) => [
    index("idx_tryout_jawaban_sesi_id").on(t.sesiId),
    unique("tryout_jawaban_sesi_soal_id_unique").on(t.sesiSoalId),
  ],
);

export const tryoutRelations = relations(tryout, ({ one, many }) => ({
  admin: one(user, {
    fields: [tryout.dibuatOleh],
    references: [user.id],
  }),
  subtes: many(tryoutSubtes),
  sesi: many(tryoutSesi),
}));

export const tryoutSubtesRelations = relations(tryoutSubtes, ({ one, many }) => ({
  tryout: one(tryout, {
    fields: [tryoutSubtes.tryoutId],
    references: [tryout.id],
  }),
  soal: many(tryoutSoal),
  sesiSubtes: many(tryoutSesiSubtes),
}));

export const tryoutSoalRelations = relations(tryoutSoal, ({ one, many }) => ({
  subtes: one(tryoutSubtes, {
    fields: [tryoutSoal.subtesId],
    references: [tryoutSubtes.id],
  }),
  pilihanJawaban: many(tryoutPilihanJawaban),
  sesiSoal: many(tryoutSesiSoal),
}));

export const tryoutPilihanJawabanRelations = relations(tryoutPilihanJawaban, ({ one, many }) => ({
  soal: one(tryoutSoal, {
    fields: [tryoutPilihanJawaban.soalId],
    references: [tryoutSoal.id],
  }),
  jawaban: many(tryoutJawaban),
}));

export const tryoutSesiRelations = relations(tryoutSesi, ({ one, many }) => ({
  user: one(user, {
    fields: [tryoutSesi.userId],
    references: [user.id],
  }),
  tryout: one(tryout, {
    fields: [tryoutSesi.tryoutId],
    references: [tryout.id],
  }),
  sesiSubtes: many(tryoutSesiSubtes),
  jawaban: many(tryoutJawaban),
}));

export const tryoutSesiSubtesRelations = relations(tryoutSesiSubtes, ({ one, many }) => ({
  sesi: one(tryoutSesi, {
    fields: [tryoutSesiSubtes.sesiId],
    references: [tryoutSesi.id],
  }),
  subtes: one(tryoutSubtes, {
    fields: [tryoutSesiSubtes.subtesId],
    references: [tryoutSubtes.id],
  }),
  sesiSoal: many(tryoutSesiSoal),
}));

export const tryoutSesiSoalRelations = relations(tryoutSesiSoal, ({ one, many }) => ({
  sesiSubtes: one(tryoutSesiSubtes, {
    fields: [tryoutSesiSoal.sesiSubtesId],
    references: [tryoutSesiSubtes.id],
  }),
  soal: one(tryoutSoal, {
    fields: [tryoutSesiSoal.soalId],
    references: [tryoutSoal.id],
  }),
  jawaban: many(tryoutJawaban),
}));

export const tryoutJawabanRelations = relations(tryoutJawaban, ({ one }) => ({
  sesi: one(tryoutSesi, {
    fields: [tryoutJawaban.sesiId],
    references: [tryoutSesi.id],
  }),
  sesiSoal: one(tryoutSesiSoal, {
    fields: [tryoutJawaban.sesiSoalId],
    references: [tryoutSesiSoal.id],
  }),
  pilihan: one(tryoutPilihanJawaban, {
    fields: [tryoutJawaban.pilihanId],
    references: [tryoutPilihanJawaban.id],
  }),
}));
