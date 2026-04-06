import type { BunSQLDatabase } from "drizzle-orm/bun-sql";
import { practicePack, practicePackQuestions, question, questionAnswerOption } from "../schema/practice-pack";

const QUESTION_DATA = [
  {
    content: "Semua运动员 adalah manusia. Beberapa manusia adalah大学生. Jadi, beberapa运动员是大学生?",
    discussion:
      "Penalaran induktif tidak dapat menyimpulkan hubungan baru. Premis pertama hanya menunjukkan bahwa semua atlet adalah manusia, premis kedua menunjukkan beberapa manusia adalah mahasiswa, tetapi tidak ada hubungan langsung antara atlet dan mahasiswa.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "YA", isCorrect: false },
      { code: "B", content: "TIDAK", isCorrect: false },
      { code: "C", content: "TIDAK DAPAT DIPASTIKAN", isCorrect: true },
      { code: "D", content: "SEMUA ATLET ADALAH MAHASISWA", isCorrect: false },
    ],
    packTitle: "TKA Saintek - Penalaran Logis",
  },
  {
    content: "Jika x² - 5x + 6 = 0, maka nilai x yang memenuhi adalah...",
    discussion:
      "Untuk menyelesaikan persamaan kuadrat x² - 5x + 6 = 0, kita gunakan faktorisasi: (x-2)(x-3) = 0, sehingga x = 2 atau x = 3.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "x = 1 atau x = 6", isCorrect: false },
      { code: "B", content: "x = 2 atau x = 3", isCorrect: true },
      { code: "C", content: "x = -2 atau x = -3", isCorrect: false },
      { code: "D", content: "x = 5 atau x = 1", isCorrect: false },
    ],
    packTitle: "Matematika Dasar - Persamaan Kuadrat",
  },
  {
    content: "Kata 'interaktif' memiliki makna yang serupa dengan...",
    discussion:
      "Interaktif berarti saling menguntungkan atau saling mempengaruhi dalam komunikasi. Jadi, kata yang paling dekat artinya adalah 'komunikatif' yang juga menggambarkan proses saling memberi dan menerima.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "Komunikatif", isCorrect: true },
      { code: "B", content: "Pasif", isCorrect: false },
      { code: "C", content: "Individual", isCorrect: false },
      { code: "D", content: "Statis", isCorrect: false },
    ],
    packTitle: "Bahasa Indonesia - Sinonim",
  },
  {
    content: "The word 'ubiquitous' most nearly means...",
    discussion:
      "Ubiquitous means existing or being everywhere at the same time. The closest synonym is 'omnipresent' which has the same meaning of being present everywhere.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "Rare", isCorrect: false },
      { code: "B", content: "Omnipresent", isCorrect: true },
      { code: "C", content: "Specific", isCorrect: false },
      { code: "D", content: "Temporary", isCorrect: false },
    ],
    packTitle: "English Literacy - Synonyms",
  },
  {
    content: "Hasil dari 2⁵ × 2³ adalah...",
    discussion:
      "Ketika mengalikan bilangan dengan basis sama, kita menjumlahkan eksponennya. 2⁵ × 2³ = 2^(5+3) = 2⁸ = 256.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "2⁸ = 256", isCorrect: true },
      { code: "B", content: "2¹⁵", isCorrect: false },
      { code: "C", content: "4⁸", isCorrect: false },
      { code: "D", content: "2¹⁵ = 32768", isCorrect: false },
    ],
    packTitle: "Matematika - Eksponen",
  },
  {
    content: "Yang bukan merupakan contoh dari teks deskripsi adalah...",
    discussion:
      "Teks deskripsi berfungsi menggambarkan sesuatu secara detail. Novel adalah teks naratif yang menceritakan alur cerita, bukan mendeskripsikan sesuatu secara mendalam.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "Deskripsi pantai matahari terbenam", isCorrect: false },
      { code: "B", content: "Deskripsi tokoh dalam drama", isCorrect: false },
      { code: "C", content: "Novel", isCorrect: true },
      { code: "D", content: "Deskripsi ruangan kelas", isCorrect: false },
    ],
    packTitle: "Bahasa Indonesia - Jenis Teks",
  },
  {
    content: "If it rains tomorrow, I ___ stay at home.",
    discussion:
      "First conditional structure: If + present simple, will + verb. 'If it rains' (present simple) is correct, then 'will stay' (will + verb) is the result.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "would", isCorrect: false },
      { code: "B", content: "will", isCorrect: true },
      { code: "C", content: "must", isCorrect: false },
      { code: "D", content: "should", isCorrect: false },
    ],
    packTitle: "English Grammar - Conditional",
  },
  {
    content: "Nilai rata-rata dari data: 7, 5, 8, 9, 6 adalah...",
    discussion: "Rata-rata = (jumlah semua data) / (banyak data) = (7 + 5 + 8 + 9 + 6) / 5 = 35 / 5 = 7.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "6", isCorrect: false },
      { code: "B", content: "7", isCorrect: true },
      { code: "C", content: "8", isCorrect: false },
      { code: "D", content: "9", isCorrect: false },
    ],
    packTitle: "Statistika - Mean",
  },
  {
    content: "Pasangan yang tepat untuk teori gravitasi adalah...",
    discussion:
      "Newton merumuskan hukum gravitasi universal yang menjelaskan tarikan antara benda-benda bermassa. Hukum ini menjadi fondasi fisika klasik tentang gaya gravitasi.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "Einstein - Relativitas", isCorrect: false },
      { code: "B", content: "Newton - Gravitasi", isCorrect: true },
      { code: "C", content: "Einstein - Komik", isCorrect: false },
      { code: "D", content: "Tesla - Listrik", isCorrect: false },
    ],
    packTitle: "Fisika - Tokoh dan Kontribusi",
  },
  {
    content: "Hasil integral ∫2x dx adalah...",
    discussion: "Integral dari 2x dx = 2 × (x²/2) + C = x² + C, karena aturan pangkat: ∫x^n dx = x^(n+1)/(n+1) + C.",
    isFlashcardQuestion: true,
    options: [
      { code: "A", content: "x + C", isCorrect: false },
      { code: "B", content: "x² + C", isCorrect: true },
      { code: "C", content: "2x² + C", isCorrect: false },
      { code: "D", content: "2 + C", isCorrect: false },
    ],
    packTitle: "Kalkulus - Integral Dasar",
  },
];

export async function clearQuestion(db: BunSQLDatabase) {
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
    ["practice_pack_questions", () => db.delete(practicePackQuestions)],
    ["question_answer_option", () => db.delete(questionAnswerOption)],
    ["question", () => db.delete(question)],
    ["practice_pack", () => db.delete(practicePack)],
  ] as const;

  for (const [label, deleter] of cleanupSteps) {
    await deleteIfPresent(label, deleter);
  }
}

export async function seedQuestion(db: BunSQLDatabase) {
  await db.transaction(async (tx) => {
    const packMap: Record<string, number> = {};

    for (const data of QUESTION_DATA) {
      if (!packMap[data.packTitle]) {
        const [pack] = await tx
          .insert(practicePack)
          .values({
            title: data.packTitle,
            description: `Practice pack untuk ${data.packTitle}`,
          })
          .returning({ id: practicePack.id });
        if (!pack) throw new Error(`Failed to create practice pack: ${data.packTitle}`);
        packMap[data.packTitle] = pack.id;
      }
    }

    console.log(`Practice packs: ${Object.keys(packMap).length} created`);

    for (const data of QUESTION_DATA) {
      const [insertedQuestion] = await tx
        .insert(question)
        .values({
          content: data.content,
          discussion: data.discussion,
          isFlashcardQuestion: data.isFlashcardQuestion,
        })
        .returning({ id: question.id });

      if (!insertedQuestion) throw new Error("Failed to insert question");

      const insertedOptions = await tx
        .insert(questionAnswerOption)
        .values(
          data.options.map((opt) => ({
            code: opt.code,
            questionId: insertedQuestion.id,
            content: opt.content,
            isCorrect: opt.isCorrect,
          })),
        )
        .returning({ id: questionAnswerOption.id, code: questionAnswerOption.code });

      const correctOption = insertedOptions.find((o) => o.code === data.options.find((opt) => opt.isCorrect)?.code);
      if (!correctOption) {
        throw new Error(`No correct option found for question ${insertedQuestion.id}`);
      }

      const packId = packMap[data.packTitle]!;

      await tx.insert(practicePackQuestions).values({
        practicePackId: packId,
        questionId: insertedQuestion.id,
        order: 1,
      } as never);
    }

    console.log(`Questions: ${QUESTION_DATA.length} created`);
  });
}
