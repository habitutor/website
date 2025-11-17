import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
	essayAnswer,
	multipleChoiceAnswer,
	practicePack,
	practicePackQuestions,
	question,
} from "../schema/practice";

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
			content:
				"Jika A lebih tinggi dari B, dan B lebih tinggi dari C, maka...",
			answers: [
				{ content: "A lebih tinggi dari C", isCorrect: true },
				{ content: "C lebih tinggi dari A", isCorrect: false },
				{ content: "A dan C sama tinggi", isCorrect: false },
				{ content: "Tidak dapat dibandingkan", isCorrect: false },
			],
		},
	],

	pack1_essay: [
		{
			content:
				"Jelaskan perbedaan antara argumen induktif dan deduktif, serta berikan contoh masing-masing!",
			correctAnswer:
				"Argumen deduktif adalah argumen yang kesimpulannya pasti benar jika premisnya benar (contoh: silogisme). Argumen induktif adalah argumen yang kesimpulannya mungkin benar berdasarkan observasi (contoh: generalisasi dari sampel). Deduktif bersifat pasti, induktif bersifat probabilitas.",
		},
		{
			content:
				"Analisis kekeliruan logika dalam pernyataan: 'Semua politisi korup, maka tidak ada politisi yang jujur.'",
			correctAnswer:
				"Pernyataan ini mengandung fallacy hasty generalization (generalisasi terburu-buru) dan false dichotomy. Premis 'semua politisi korup' sendiri sudah merupakan generalisasi yang tidak valid. Kesimpulan mengabaikan kemungkinan adanya politisi yang jujur, menciptakan dikotomi palsu antara korup dan jujur.",
		},
		{
			content:
				"Jika diketahui: (1) Semua A adalah B, (2) Semua B adalah C. Buatlah kesimpulan yang valid dan jelaskan alasannya!",
			correctAnswer:
				"Kesimpulan yang valid adalah 'Semua A adalah C'. Ini menggunakan silogisme kategorikal dengan pola transitif. Jika A termasuk dalam B, dan B termasuk dalam C, maka secara logis A juga termasuk dalam C. Contoh: Semua kucing adalah mamalia, semua mamalia adalah hewan, maka semua kucing adalah hewan.",
		},
		{
			content:
				"Evaluasi validitas argumen berikut: 'Cuaca panas menyebabkan orang membeli es krim. Penjualan es krim meningkat. Maka cuaca sedang panas.'",
			correctAnswer:
				"Argumen ini tidak valid karena mengandung fallacy affirming the consequent. Struktur logikanya: Jika P maka Q, Q benar, maka P benar. Ini keliru karena Q (penjualan meningkat) bisa disebabkan faktor lain selain P (cuaca panas), misalnya promosi, hari libur, atau acara khusus.",
		},
		{
			content:
				"Susun argumen yang logis untuk mendukung atau menolak pernyataan: 'Teknologi AI akan menggantikan semua pekerjaan manusia.'",
			correctAnswer:
				"Argumen menolak: (1) AI unggul dalam tugas berulang dan komputasi, tetapi lemah dalam kreativitas, empati, dan judgment kompleks. (2) Sejarah menunjukkan teknologi baru menciptakan jenis pekerjaan baru. (3) Banyak pekerjaan memerlukan interaksi manusia yang tidak bisa digantikan AI. (4) Regulasi dan etika akan membatasi penggunaan AI. Kesimpulan: AI akan mengubah, bukan menggantikan semua pekerjaan manusia.",
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

	pack2_essay: [
		{
			content:
				"Identifikasi dan jelaskan fallacy (kekeliruan logika) dalam pernyataan: 'Orang kaya sukses karena kerja keras. Jika kamu tidak sukses, berarti kamu tidak kerja keras.'",
			correctAnswer:
				"Pernyataan ini mengandung beberapa fallacy: (1) Post hoc ergo propter hoc - mengasumsikan korelasi adalah kausalitas, (2) Oversimplification - mengabaikan faktor lain seperti privilege, kesempatan, dan keberuntungan, (3) False dichotomy - seolah hanya ada dua kemungkinan (sukses karena kerja keras, atau tidak sukses karena malas), padahal ada banyak variabel lain yang mempengaruhi kesuksesan.",
		},
		{
			content:
				"Diberikan premis: (1) Jika hujan, jalanan basah, (2) Jalanan basah, (3) Mobil melaju lambat. Apakah valid menyimpulkan 'Karena hujan, mobil melaju lambat'? Jelaskan!",
			correctAnswer:
				"Tidak valid. Ini adalah fallacy affirming the consequent. Dari premis (1) dan (2), kita tidak bisa menyimpulkan pasti bahwa hujan (jalanan bisa basah karena dicuci, pipa bocor, dll). Premis (3) juga tidak memiliki hubungan kausal yang jelas dengan premis lain. Kesimpulan mengasumsikan hubungan kausal yang tidak terbukti dari premis yang ada.",
		},
		{
			content:
				"Analisis argumen berikut: 'Semakin banyak pemadam kebakaran di lokasi, semakin besar kerusakan yang terjadi. Maka pemadam kebakaran menyebabkan kerusakan.'",
			correctAnswer:
				"Argumen ini keliru karena confusing correlation with causation. Korelasi antara jumlah pemadam kebakaran dan kerusakan memang ada, tetapi bukan sebab-akibat. Keduanya disebabkan oleh variabel ketiga: besarnya kebakaran. Kebakaran besar memerlukan lebih banyak pemadam dan menyebabkan kerusakan lebih besar. Ini adalah contoh klasik dari spurious correlation.",
		},
		{
			content:
				"Buatlah silogisme yang valid dengan struktur: (1) Premis Mayor, (2) Premis Minor, (3) Kesimpulan. Gunakan tema pendidikan!",
			correctAnswer:
				"Contoh silogisme valid: (1) Premis Mayor: Semua mahasiswa yang lulus S1 mendapat gelar sarjana. (2) Premis Minor: Dewi adalah mahasiswa yang lulus S1. (3) Kesimpulan: Dewi mendapat gelar sarjana. Silogisme ini valid karena mengikuti struktur Barbara (All A are B, C is A, therefore C is B).",
		},
		{
			content:
				"Evaluasi kekuatan argumen: 'Dalam survei 100 responden di Jakarta, 80% menyukai kopi. Maka 80% orang Indonesia menyukai kopi.' Apa kelemahannya?",
			correctAnswer:
				"Argumen ini lemah karena: (1) Sampling bias - sampel hanya dari Jakarta, tidak representatif untuk seluruh Indonesia, (2) Hasty generalization - generalisasi dari sampel kecil ke populasi besar, (3) Mengabaikan variasi geografis, budaya, dan demografi Indonesia yang sangat beragam, (4) Ukuran sampel 100 terlalu kecil untuk populasi 270+ juta. Untuk kesimpulan yang valid, perlu sampel yang lebih besar, acak, dan tersebar secara geografis.",
		},
	],
};

export async function clearPractice(db: NodePgDatabase) {
	await db.delete(practicePackQuestions);
	await db.delete(multipleChoiceAnswer);
	await db.delete(essayAnswer);
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

		await db.insert(multipleChoiceAnswer).values(
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

	for (const essayData of SEED_DATA.pack1_essay) {
		const [q] = await db
			.insert(question)
			.values({ content: essayData.content, type: "essay" })
			.returning();

		if (!q) throw new Error("Failed to create question");

		await db.insert(essayAnswer).values({
			questionId: q.id,
			correctAnswer: essayData.correctAnswer,
		});

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

		await db.insert(multipleChoiceAnswer).values(
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

	for (const essayData of SEED_DATA.pack2_essay) {
		const [q] = await db
			.insert(question)
			.values({ content: essayData.content, type: "essay" })
			.returning();

		if (!q) throw new Error("Failed to create question");

		await db.insert(essayAnswer).values({
			questionId: q.id,
			correctAnswer: essayData.correctAnswer,
		});

		await db.insert(practicePackQuestions).values({
			practicePackId: pack2.id,
			questionId: q.id,
			order: order++,
		});
	}

	const totalQuestions =
		SEED_DATA.pack1_mcq.length +
		SEED_DATA.pack1_essay.length +
		SEED_DATA.pack2_mcq.length +
		SEED_DATA.pack2_essay.length;

	console.log(
		`Practice: ${packs.length} packs, ${totalQuestions} questions`,
	);
}
