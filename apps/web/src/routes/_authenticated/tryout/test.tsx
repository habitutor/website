import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
	ArrowLeftIcon,
	ArrowRightIcon,
	CheckSquare,
	ListIcon,
	Square,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createMeta } from "@/lib/seo-utils";
import { cn } from "@/lib/utils";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/tryout/test")({
	head: () => ({
		meta: createMeta({
			title: "Tryout Test",
			description: "Pengerjaan Soal Tryout",
			noIndex: true,
		}),
	}),
	component: TryoutTestPage,
});

function TryoutTestPage() {
	const [activeQuestion, setActiveQuestion] = useState(1);

	// Mock testing state based on the images
	const [answers, setAnswers] = useState<
		Record<number | string, number | number[]>
	>({
		1: 1,
		2: 2,
	});
	const [doubtfuls, setDoubtfuls] = useState<Record<number, boolean>>({
		6: true,
		7: true,
	});

	const isDoubtful = doubtfuls[activeQuestion] || false;

	const toggleDoubtful = () => {
		setDoubtfuls((prev) => ({
			...prev,
			[activeQuestion]: !prev[activeQuestion],
		}));
	};

	const selectAnswer = (optionIdx: number | number[]) => {
		setAnswers((prev) => ({
			...prev,
			[activeQuestion]: optionIdx,
		}));
	};

	// Dummy options
	const options = [
		"Bergerak cepat",
		"Bergerak lambat",
		"Bergerak bersama",
		"Bergerak sendiri",
	];

	return (
		<div className="flex w-full flex-col py-6">
			<div className="mx-auto w-full max-w-6xl rounded-2xl bg-[#fff8db] p-6 shadow-sm">
				{/* Header Section */}
				<div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
					<div>
						<h1 className="text-xl font-bold text-gray-900">
							Soal Nomor {activeQuestion}
						</h1>
						<p className="text-sm text-gray-600">Bahasa Indonesia</p>
					</div>
					<div className="flex items-center gap-4">
						{isDoubtful && (
							<div className="rounded bg-[#eab308] px-3 py-1.5 text-sm font-bold text-black shadow-sm">
								Ragu-Ragu
							</div>
						)}
						<div className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-800 shadow-sm">
							Sisa waktu: <span className="font-bold">00:14:05</span>
						</div>

						<Dialog>
							<DialogTrigger asChild>
								<Button className="bg-[#3b5998] text-white hover:bg-[#3b5998]/90">
									<ListIcon weight="bold" className="mr-2" /> Daftar Soal
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle className="text-xl font-bold">
										Daftar Soal
									</DialogTitle>
								</DialogHeader>
								<div className="grid grid-cols-5 gap-3 border-t pt-4">
									{Array.from({ length: 10 }).map((_, idx) => {
										const qNum = idx + 1;
										const isItemDoubtful = doubtfuls[qNum];
										const isItemAnswered = !!answers[qNum];

										return (
											<button
												key={qNum}
												type="button"
												onClick={() => setActiveQuestion(qNum)}
												className={cn(
													"flex h-12 w-full items-center justify-center rounded-lg border text-lg font-medium transition-colors",
													isItemDoubtful
														? "border-[#facc15] bg-[#fde047] text-gray-900"
														: isItemAnswered
															? "border-[#7dd3fc] bg-[#bae6fd] text-gray-900"
															: "border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
													activeQuestion === qNum &&
														"ring-2 ring-[#3b5998] ring-offset-2",
												)}
											>
												{qNum}
											</button>
										);
									})}
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Content Section */}
				<div className="flex min-h-100 flex-col gap-0 rounded-xl bg-white shadow-sm md:flex-row">
					{/* Left Panel: Reading Material */}
					<div className="flex-1 border-dashed border-gray-300 p-6 md:border-r-2 md:p-8">
						<h2 className="mb-4 text-lg font-bold text-gray-900">
							Teks untuk soal nomor {activeQuestion} s.d. 4
						</h2>
						{activeQuestion === 1 ? (
							<div className="prose prose-sm max-w-none space-y-4 text-gray-700">
								<p>
									Untuk memastikan pengalaman pengguna di Habitutor benar-benar
									relevan dengan kondisi lapangan, saya ingin menyesuaikan alur
									Tryout kita dengan pelaksanaan UTBK 2025 yang sebenarnya.
									Karena itu, saya ingin menanyakan beberapa hal terkait flow
									dan teknis pelaksanaannya:
								</p>
								<p>
									Apakah ada referensi tryout online (gratis/open access) yang
									menurut Kakak paling mendekati alur UTBK asli?
									<br />
									Mulai dari proses masuk tes, navigasi soal, timer, hingga
									perpindahan antar subtes.
								</p>
								<p>
									Apakah ada dokumen, panduan resmi, atau catatan teknis yang
									bisa kami pelajari untuk memahami detail-detail UTBK
									sebenarnya (misalnya aturan pengerjaan, sistem timer, atau
									struktur soal)?
									<br />
									Untuk desain produk:
								</p>
								<p>
									Di UTBK asli tidak ada jeda antar subtes.
									<br />
									Apakah di Tryout Habitutor juga ingin mengikuti format tanpa
									jeda, atau justru ingin diberikan jeda (misalnya 1-2 menit)
									agar lebih nyaman untuk siswa?
								</p>
								<p>
									Apakah Habitutor memiliki preferensi atau permintaan khusus
									terkait pengalaman tryout?
									<br />
									Misalnya highlight soal terlewat, mode latihan tambahan, fitur
									penandaan dsb.
								</p>
							</div>
						) : (
							<div className="flex flex-col gap-6">
								<div className="rounded-xl border border-[#e5e5e5] bg-[#fdfbf6] p-4">
									<h3 className="mb-2 text-xl font-bold tracking-tight text-[#1e293b] uppercase">
										How to study in the library
									</h3>
									<p className="mb-6 text-sm text-gray-600">
										Studying in the library is a good way to focus and learn.
										Follow these steps to use your time well:
									</p>

									<ul className="space-y-6">
										<li className="flex gap-4">
											<div className="text-3xl font-black text-[#64748b]">
												1
											</div>
											<div>
												<h4 className="font-bold text-[#1e293b] uppercase">
													Prepare your materials
												</h4>
												<p className="text-sm text-gray-600">
													Bring your books, notes, stationery, and water. Make
													sure you also have your library card.
												</p>
											</div>
										</li>
										<li className="flex gap-4">
											<div className="text-3xl font-black text-[#64748b]">
												2
											</div>
											<div>
												<h4 className="font-bold text-[#1e293b] uppercase">
													Choose quiet spot
												</h4>
												<p className="text-sm text-gray-600">
													Find a table with good light and little noise. Avoid
													sitting too close to the entrance or the restroom.
												</p>
											</div>
										</li>
										<li className="flex gap-4">
											<div className="text-3xl font-black text-[#64748b]">
												3
											</div>
											<div>
												<h4 className="font-bold text-[#1e293b] uppercase">
													Set a study goal
												</h4>
												<p className="text-sm text-gray-600">
													Decide what you want to finish, such as reading two
													chapters or writing an essay
												</p>
											</div>
										</li>
									</ul>
								</div>
							</div>
						)}
					</div>

					{/* Right Panel: Question and Options */}
					<div className="flex-1 p-6 md:p-8">
						{activeQuestion === 1 && (
							<>
								<p className="mb-6 font-medium text-gray-800">
									Makna dari istilah mobilisasi dari teks tersebut adalah...
								</p>

								<div className="flex flex-col gap-4">
									{options.map((opt, i) => (
										<button
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={i}
											type="button"
											onClick={() => selectAnswer(i)}
											className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 text-left hover:bg-gray-50"
										>
											<div className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-white">
												{answers[activeQuestion] === i && (
													<div className="size-3 rounded-full bg-blue-500" />
												)}
											</div>
											<span className="text-gray-700">{opt}</span>
										</button>
									))}
								</div>
							</>
						)}

						{activeQuestion === 2 && (
							<>
								<p className="mb-6 font-medium text-gray-800">
									The following activities are suggested in the infographic.
									Categorize
								</p>

								<div className="overflow-x-auto">
									<table className="w-full border-collapse text-left text-sm text-gray-700">
										<thead>
											<tr>
												<th className="w-1/2 border-b border-gray-300 p-3 font-semibold">
													Activities
												</th>
												<th className="w-1/4 border-b border-gray-300 p-3 text-center font-semibold">
													Preparation
												</th>
												<th className="w-1/4 border-b border-gray-300 p-3 text-center font-semibold">
													Breaks
												</th>
											</tr>
										</thead>
										<tbody>
											{["Standing Up", "Standing Up", "Standing Up"].map(
												(activity, idx) => (
													<tr key={idx} className="hover:bg-gray-50">
														<td className="border-b border-gray-200 p-3">
															{activity}
														</td>
														<td className="border-b border-gray-200 p-3">
															<div className="flex justify-center">
																<button
																	type="button"
																	aria-label="Preparation"
																	onClick={() =>
																		setAnswers((prev) => ({
																			...prev,
																			[`${activeQuestion}_cat_${idx}`]: 0,
																		}))
																	}
																	className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-white"
																>
																	{answers[`${activeQuestion}_cat_${idx}`] ===
																		0 && (
																		<div className="size-3 rounded-full bg-blue-500" />
																	)}
																</button>
															</div>
														</td>
														<td className="border-b border-gray-200 p-3">
															<div className="flex justify-center">
																<button
																	type="button"
																	aria-label="Breaks"
																	onClick={() =>
																		setAnswers((prev) => ({
																			...prev,
																			[`${activeQuestion}_cat_${idx}`]: 1,
																		}))
																	}
																	className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-white"
																>
																	{answers[`${activeQuestion}_cat_${idx}`] ===
																		1 && (
																		<div className="size-3 rounded-full bg-blue-500" />
																	)}
																</button>
															</div>
														</td>
													</tr>
												),
											)}
										</tbody>
									</table>
								</div>
							</>
						)}

						{activeQuestion === 3 && (
							<>
								<p className="mb-6 font-medium text-gray-800">
									The following activities are suggested in the infographic.
									Categorize
								</p>

								<div className="flex flex-col gap-6">
									{[
										{
											id: 1,
											diagramLabel1: "Dampak ekonomi digital",
											diagramLabel2: "Manfaat teknis yang diperoleh",
										},
										{
											id: 2,
											diagramLabel1:
												"Tantangan adaptasi teknologi dan keamanan digital",
											diagramLabel2:
												"Peluang pertumbuhan dan berkelanjutan UKM",
										},
										{
											id: 3,
											diagramLabel1: "Dampak ekonomi digital",
											diagramLabel2: "Manfaat teknis yang diperoleh",
										},
									].map((opt, i) => (
										<button
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={i}
											type="button"
											onClick={() => selectAnswer(i)}
											className="flex cursor-pointer items-start gap-4 rounded-lg border border-transparent p-2 text-left hover:bg-gray-50"
										>
											<div className="mt-8 flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-400 bg-white">
												{answers[activeQuestion] === i && (
													<div className="size-3 rounded-full bg-blue-500" />
												)}
											</div>
											<div className="relative flex min-h-30 flex-1 items-center justify-between rounded-2xl border-2 border-gray-300 bg-white p-6">
												{/* Simplified mock diagram */}
												<div className="w-40 rounded-xl border-2 border-gray-300 bg-gray-50 p-2 text-center text-xs">
													{opt.diagramLabel1}
												</div>
												<div className="absolute top-1/2 left-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-center text-sm font-bold">
													Ekonomi
													<br />
													Digital
												</div>
												<div className="w-40 rounded-xl border-2 border-gray-300 bg-gray-50 p-2 text-center text-xs">
													{opt.diagramLabel2}
												</div>
												{/* Lines connecting them */}
												<div className="absolute top-1/2 left-0 -z-10 h-0.5 w-full bg-gray-300" />
											</div>
										</button>
									))}
								</div>
							</>
						)}

						{activeQuestion > 3 && (
							<>
								<p className="mb-6 font-medium text-gray-800">
									The following activities are suggested in the infographic.
									Categorize
								</p>

								<div className="flex flex-col gap-4">
									{options.map((opt, i) => (
										<button
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											key={i}
											type="button"
											onClick={() => {
												const currentAnswers = Array.isArray(
													answers[activeQuestion],
												)
													? answers[activeQuestion]
													: [];
												const newAnswers = (
													currentAnswers as number[]
												).includes(i)
													? (currentAnswers as number[]).filter(
															(val) => val !== i,
														)
													: [...(currentAnswers as number[]), i];
												selectAnswer(newAnswers);
											}}
											className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 text-left hover:bg-gray-50"
										>
											<div className="flex size-6 shrink-0 items-center justify-center rounded border-2 border-gray-400 bg-white">
												{Array.isArray(answers[activeQuestion]) &&
													(answers[activeQuestion] as number[]).includes(i) && (
														<CheckSquare
															weight="fill"
															className="h-5 w-5 text-blue-500"
														/>
													)}
											</div>
											<span className="text-gray-700">{opt}</span>
										</button>
									))}
								</div>
							</>
						)}
					</div>
				</div>

				{/* Footer Section: Controls */}
				<div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
					<Button
						variant="outline"
						onClick={() => setActiveQuestion(Math.max(1, activeQuestion - 1))}
						className="h-12 w-full border-gray-300 bg-white px-6 shadow-sm md:w-auto"
					>
						<ArrowLeftIcon weight="bold" className="mr-2" /> Sebelumnya
					</Button>

					<Button
						onClick={toggleDoubtful}
						className={cn(
							"h-12 w-full px-8 font-semibold shadow-sm md:w-auto",
							isDoubtful
								? "bg-[#eab308] text-black hover:bg-[#ca8a04]"
								: "bg-[#eab308] text-black hover:bg-[#ca8a04]",
						)}
					>
						{isDoubtful ? (
							<CheckSquare weight="fill" className="mr-2 h-5 w-5" />
						) : (
							<Square weight="bold" className="mr-2 h-5 w-5" />
						)}
						Ragu-Ragu
					</Button>

					<Button
						onClick={() => setActiveQuestion(Math.min(10, activeQuestion + 1))}
						className="h-12 w-full bg-[#3b5998] px-6 text-white shadow-sm hover:bg-[#273f72] md:w-auto"
					>
						Selanjutnya <ArrowRightIcon weight="bold" className="ml-2" />
					</Button>
				</div>
			</div>
		</div>
	);
}
