import { Image } from "@unpic/react";

export function Statistics() {
	return (
		<section className="overflow-x-hidden bg-background py-12">
			<div className="container mx-auto flex w-full max-w-4xl flex-col gap-6 px-4">
				<div className="relative overflow-hidden rounded-2xl bg-neutral-100 p-8 pb-40 shadow-sm md:pb-8 md:pl-56">
					<div className="absolute bottom-10 -left-3 -mb-8 -ml-4 md:-bottom-8 md:mb-8 md:-ml-6">
						<Image
							src="/avatar/study-avatar.webp"
							alt=""
							layout="constrained"
							width={200}
							height={200}
							className="h-auto w-40"
						/>
					</div>

					<div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-2">
						<div className="flex flex-col items-center gap-2 text-center">
							<h3 className="font-medium text-sm">Fokus Lulus PTN tetapi</h3>
							<span className="font-bold text-6xl text-primary-300">87%</span>
							<p className="text-sm leading-relaxed">
								Mahasiswa salah jurusan. Akibat belajar tanpa fondasi yang benar.
							</p>
						</div>

						<div className="flex flex-col items-center gap-2 text-center">
							<h3 className="font-medium text-sm">Tantangan pasca lulus</h3>
							<span className="font-bold text-6xl text-primary-300">40%</span>
							<p className="text-sm leading-relaxed">
								mengalami Academic Shock akibat tidak punya habit belajar mandiri.
							</p>
						</div>
					</div>
				</div>

				<div className="relative w-full">
					<div className="absolute -top-24 -right-10 z-20 md:-top-28 md:-right-20">
						<Image
							src="/decorations/acorn.webp"
							alt=""
							layout="constrained"
							width={200}
							height={200}
							className="h-auto w-24 md:w-32"
						/>
					</div>

					<div className="relative overflow-hidden rounded-2xl bg-primary-300 p-6 pb-12 text-white md:p-8 md:pr-80 md:pb-16">
						<div className="absolute -right-8 -bottom-12 hidden md:block">
							<Image
								src="/avatar/climb-avatar.webp"
								alt=""
								layout="constrained"
								width={300}
								height={300}
								className="h-auto w-72 opacity-90"
							/>
						</div>

						<div className="relative z-10 text-center md:text-left">
							<h3 className="mb-3 font-bold text-xl md:text-2xl">
								Habitutor Hadir <span className="text-[var(--tt-color-yellow-inc-3)] italic">Membangun Fondasi</span>,
								Bukan Sekadar Mengejar Nilai.
							</h3>
							<p className="text-sm leading-relaxed md:text-base">
								Tak cuma latihan soal. Kami bangun Study Habit & mental hingga kuliah.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
