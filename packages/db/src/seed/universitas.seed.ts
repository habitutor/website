import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { programStudi, universitas } from "../schema/universitas";

const UNIVERSITAS_DATA = [
  { namaUniv: "Universitas Indonesia", rankUniv: 1 },
  { namaUniv: "Institut Teknologi Bandung", rankUniv: 2 },
  { namaUniv: "Universitas Gadjah Mada", rankUniv: 3 },
  { namaUniv: "Universitas Padjadjaran", rankUniv: 4 },
  { namaUniv: "Institut Teknologi Sepuluh Nopember", rankUniv: 5 },
  { namaUniv: "Universitas Diponegoro", rankUniv: 6 },
  { namaUniv: "Universitas Airlangga", rankUniv: 7 },
];

const PROGRAM_STUDI_DATA = {
  "Universitas Indonesia": [
    { nama: "Ilmu Komputer", passedGrade: 744 },
    { nama: "Pendidikan Dokter", passedGrade: 729 },
  ],
  "Institut Teknologi Bandung": [
    { nama: "Sekolah Teknik Elektro dan Informatika (STEI)", passedGrade: 755 },
    { nama: "Fakultas Teknik Pertambangan dan Perminyakan (FTTM)", passedGrade: 730 },
  ],
  "Universitas Gadjah Mada": [
    { nama: "Kedokteran", passedGrade: 733 },
    { nama: "Ilmu Hubungan Internasional", passedGrade: 698 },
  ],
  "Universitas Padjadjaran": [{ nama: "Ilmu Komunikasi", passedGrade: 685 }],
  "Institut Teknologi Sepuluh Nopember": [{ nama: "Teknik Informatika", passedGrade: 712 }],
  "Universitas Diponegoro": [{ nama: "Hukum", passedGrade: 680 }],
  "Universitas Airlangga": [{ nama: "Manajemen", passedGrade: 672 }],
};

export async function clearUniversitas(db: NodePgDatabase) {
  const isMissingTableError = (error: unknown) => {
    if (!(error instanceof Error)) return false;
    if ("code" in error && (error as { code?: string }).code === "42P01") return true;
    return error.message.toLowerCase().includes("does not exist");
  };

  const deleteIfPresent = async (label: string, deleter: () => Promise<unknown>) => {
    try {
      await deleter();
    } catch (error) {
      if (isMissingTableError(error)) {
        console.warn(`${label} table not found, skipping clear`);
        return;
      }
      throw error;
    }
  };

  const cleanupSteps = [
    ["program_studi", () => db.delete(programStudi)],
    ["universitas", () => db.delete(universitas)],
  ] as const;

  for (const [label, deleter] of cleanupSteps) {
    await deleteIfPresent(label, deleter);
  }
}

export async function seedUniversitas(db: NodePgDatabase) {
  await db.transaction(async (tx) => {
    const insertedUniversitas = await tx.insert(universitas).values(UNIVERSITAS_DATA).returning({
      id: universitas.id,
      namaUniv: universitas.namaUniv,
    });

    console.log(`Universitas: ${insertedUniversitas.length} created`);

    const programStudiValues: Array<{ nama: string; passedGrade: number; univId: number }> = [];

    for (const univ of insertedUniversitas) {
      const prodis = PROGRAM_STUDI_DATA[univ.namaUniv as keyof typeof PROGRAM_STUDI_DATA] || [];
      for (const prodi of prodis) {
        programStudiValues.push({
          nama: prodi.nama,
          passedGrade: prodi.passedGrade,
          univId: univ.id,
        });
      }
    }

    if (programStudiValues.length > 0) {
      const insertedProdi = await tx.insert(programStudi).values(programStudiValues).returning({ id: programStudi.id });
      console.log(`Program Studi: ${insertedProdi.length} created`);
    }
  });
}
