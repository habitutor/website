import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	practicePack,
	practicePackAttempt,
	practicePackQuestions,
	practicePackUserAnswer,
	question,
	questionAnswerOption,
} from "../schema/practice-pack";

const SEED_DATA = {
	packs: [{ title: "Penalaran Umum #1" }, { title: "Penalaran Umum #2" }],

	pack1_mcq: [
		{
			content:
				"Semua siswa yang rajin belajar akan lulus ujian. Budi tidak lulus ujian. Kesimpulan yang tepat adalah...",
			answers: [
				{ content: "Budi tidak rajin belajar", isCorrect: true },
				{ content: "Budi rajin belajar", isCorrect: false },
				{ content: "Budi tidak ikut ujian", isCorrect: false },
				{ content: "Ujian terlalu sulit", isCorrect: false },
			],
		},
		{
			content:
				"Jika hari ini hujan, maka jalanan akan basah. Jalanan tidak basah. Kesimpulan yang tepat adalah...",
			answers: [
				{ content: "Hari ini tidak hujan", isCorrect: true },
				{ content: "Hari ini hujan", isCorrect: false },
				{ content: "Jalanan kering", isCorrect: false },
				{ content: "Akan turun hujan nanti", isCorrect: false },
			],
		},
		{
			content:
				"Dalam suatu kelas, setiap siswa yang suka matematika juga suka fisika. Ana suka matematika. Maka...",
			answers: [
				{ content: "Ana pasti suka fisika", isCorrect: true },
				{ content: "Ana tidak suka fisika", isCorrect: false },
				{ content: "Ana mungkin suka fisika", isCorrect: false },
				{ content: "Tidak dapat disimpulkan", isCorrect: false },
			],
		},
		{
			content:
				"Semua bunga mawar berwarna merah. Beberapa tanaman di taman adalah bunga mawar. Kesimpulan yang tepat adalah...",
			answers: [
				{
					content: "Beberapa tanaman di taman berwarna merah",
					isCorrect: true,
				},
				{ content: "Semua tanaman di taman berwarna merah", isCorrect: false },
				{ content: "Tidak ada tanaman merah di taman", isCorrect: false },
				{ content: "Semua tanaman adalah bunga mawar", isCorrect: false },
			],
		},
		{
			content: "Jika A lebih tinggi dari B, dan B lebih tinggi dari C, maka...",
			answers: [
				{ content: "A lebih tinggi dari C", isCorrect: true },
				{ content: "C lebih tinggi dari A", isCorrect: false },
				{ content: "A dan C sama tinggi", isCorrect: false },
				{ content: "Tidak dapat dibandingkan", isCorrect: false },
			],
		},
	],

	pack2_mcq: [
		{
			content:
				"Tidak ada ikan yang bisa hidup di darat. Hiu adalah ikan. Kesimpulan yang tepat adalah...",
			answers: [
				{ content: "Hiu tidak bisa hidup di darat", isCorrect: true },
				{ content: "Hiu bisa hidup di darat", isCorrect: false },
				{ content: "Beberapa hiu bisa hidup di darat", isCorrect: false },
				{ content: "Hiu bukan ikan", isCorrect: false },
			],
		},
		{
			content:
				"Semua dokter adalah sarjana. Beberapa sarjana adalah peneliti. Kesimpulan yang PASTI BENAR adalah...",
			answers: [
				{ content: "Tidak dapat disimpulkan dengan pasti", isCorrect: true },
				{ content: "Semua dokter adalah peneliti", isCorrect: false },
				{ content: "Beberapa dokter adalah peneliti", isCorrect: false },
				{ content: "Semua peneliti adalah dokter", isCorrect: false },
			],
		},
		{
			content:
				"Jika cuaca cerah, maka Andi pergi ke pantai. Andi pergi ke pantai. Maka...",
			answers: [
				{
					content: "Tidak dapat disimpulkan tentang cuaca",
					isCorrect: true,
				},
				{ content: "Cuaca pasti cerah", isCorrect: false },
				{ content: "Cuaca tidak cerah", isCorrect: false },
				{ content: "Andi tidak suka cuaca mendung", isCorrect: false },
			],
		},
		{
			content:
				"Urutan yang benar dari yang terbesar ke terkecil: P > Q, R < Q, S > P. Maka urutan yang benar adalah...",
			answers: [
				{ content: "S > P > Q > R", isCorrect: true },
				{ content: "P > S > Q > R", isCorrect: false },
				{ content: "S > Q > P > R", isCorrect: false },
				{ content: "R > Q > P > S", isCorrect: false },
			],
		},
		{
			content:
				"Dalam sebuah lomba, A lebih cepat dari B tetapi lebih lambat dari C. D lebih cepat dari C. Siapa yang tercepat?",
			answers: [
				{ content: "D", isCorrect: true },
				{ content: "C", isCorrect: false },
				{ content: "A", isCorrect: false },
				{ content: "B", isCorrect: false },
			],
		},
	],
};

export async function clearPractice(db: NodePgDatabase) {
	await db.delete(practicePackUserAnswer);
	await db.delete(questionAnswerOption);
	await db.delete(practicePackQuestions);
	await db.delete(practicePackAttempt);
	await db.delete(question);
	await db.delete(practicePack);
}

export async function seedPractice(db: NodePgDatabase) {
	const packs = await db
		.insert(practicePack)
		.values(SEED_DATA.packs)
		.returning();

	const [pack1, pack2] = packs;

	if (!pack1 || !pack2) {
		throw new Error("Failed to create practice packs");
	}

	let order = 1;
	for (const mcqData of SEED_DATA.pack1_mcq) {
		const [q] = await db
			.insert(question)
			.values({ content: mcqData.content, type: "mcq" })
			.returning();

		if (!q) throw new Error("Failed to create question");

		await db.insert(questionAnswerOption).values(
			mcqData.answers.map((ans) => ({
				questionId: q.id,
				content: ans.content,
				isCorrect: ans.isCorrect,
			})),
		);

		await db.insert(practicePackQuestions).values({
			practicePackId: pack1.id,
			questionId: q.id,
			order: order++,
		});
	}

	order = 1;
	for (const mcqData of SEED_DATA.pack2_mcq) {
		const [q] = await db
			.insert(question)
			.values({ content: mcqData.content, type: "mcq" })
			.returning();

		if (!q) throw new Error("Failed to create question");

		await db.insert(questionAnswerOption).values(
			mcqData.answers.map((ans) => ({
				questionId: q.id,
				content: ans.content,
				isCorrect: ans.isCorrect,
			})),
		);

		await db.insert(practicePackQuestions).values({
			practicePackId: pack2.id,
			questionId: q.id,
			order: order++,
		});
	}

	const totalQuestions =
		SEED_DATA.pack1_mcq.length + SEED_DATA.pack2_mcq.length;

	console.log(`Practice: ${packs.length} packs, ${totalQuestions} questions`);
}
