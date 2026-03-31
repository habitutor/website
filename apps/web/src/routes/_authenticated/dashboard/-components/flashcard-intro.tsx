import { useNavigate } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { useEffect } from "react";

export const FlashcardIntro = () => {
	const navigate = useNavigate();

	useEffect(() => {
		const timeout = setTimeout(() => {
			navigate({ to: "/dashboard/flashcard" });
		}, 5000);
		return () => clearTimeout(timeout);
	}, [navigate]);

	return (
		<div className="relative flex min-h-[70vh] w-full items-center justify-center">
			{/* Background rotated card kiri — hidden di mobile */}
			<m.div
				initial={{ opacity: 0, rotate: -6, scale: 0.85 }}
				animate={{ opacity: 1, rotate: -3.75, scale: 1 }}
				transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0 }}
				className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
				style={{ zIndex: 1 }}
			>
				<div className="h-[280px] w-[92vw] rounded-[10px] border-[#e1a902] border-[3px] border-solid bg-[#fdc10e] shadow-[0px_2px_2px_0px_rgba(54,80,162,0.2)] sm:h-[380px] sm:w-[700px] sm:border-[5px] lg:h-[466px] lg:w-[900px]" />
			</m.div>

			{/* Background rotated card kanan — hidden di mobile */}
			<m.div
				initial={{ opacity: 0, rotate: 10, scale: 0.85 }}
				animate={{ opacity: 1, rotate: 7.69, scale: 1 }}
				transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
				className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 sm:block"
				style={{ zIndex: 2 }}
			>
				<div className="h-[290px] w-[92vw] rounded-[10px] border-[#e1a902] border-[3px] border-solid bg-[#fdc10e] shadow-[0px_2px_2px_0px_rgba(54,80,162,0.2)] sm:h-[390px] sm:w-[700px] sm:border-[5px] lg:h-[477px] lg:w-[900px]" />
			</m.div>

			{/* Main white card */}
			<m.div
				initial={{ opacity: 0, scale: 0.75, y: 40 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
				className="relative w-[92vw] overflow-hidden rounded-[10px] border-2 border-[#d2d2d2] border-solid bg-white shadow-[0px_2px_2px_0px_rgba(54,80,162,0.2)] sm:h-[390px] sm:w-[700px] sm:border-4 lg:h-[477px] lg:w-[900px]"
				style={{ zIndex: 10 }}
			>
				{/* ── MOBILE LAYOUT (flex column, tinggi auto) ── */}
				<div className="flex h-full w-full flex-col sm:hidden">
					{/* Timer bar */}
					<div className="relative mx-4 mt-4 h-[44px] shrink-0 overflow-clip rounded-[5px] border border-green-700 bg-green-500">
						<div className="absolute top-[-18px] left-[-20px] size-[90px]">
							<svg className="absolute block size-full" fill="none" viewBox="0 0 157 149">
								<ellipse cx="78.5" cy="74.5" fill="#1CA35B" rx="78.5" ry="74.5" />
							</svg>
						</div>
						<p className="absolute top-1/2 left-[16px] -translate-y-1/2 whitespace-nowrap font-bold text-[16px] text-white tracking-widest">
							00:10:00
						</p>
					</div>

					{/* Character image — tengah di mobile */}
					<div className="relative mt-4 flex w-full shrink-0 justify-center">
						<div className="relative h-[160px] w-[160px]">
							<img
								alt=""
								className="pointer-events-none absolute inset-0 size-full object-contain"
								src="/decorations/image 25.png"
							/>
						</div>
					</div>

					{/* Text content */}
					<div className="flex flex-col gap-2 px-4 pt-3 pb-6">
						<p className="font-bold text-[#fdc10e] text-[36px] leading-tight">Mari Mulai!</p>
						<p className="font-medium text-[#333] text-[13px] leading-snug">
							Kamu punya sepuluh menit untuk mengerjakan semua soal
						</p>
					</div>
				</div>

				{/* ── TABLET & DESKTOP LAYOUT (absolute, sama seperti semula) ── */}
				<div className="hidden h-full w-full sm:block">
					{/* Timer bar */}
					<div className="absolute overflow-clip rounded-[5px] border border-green-700 bg-green-500 sm:top-[30px] sm:left-[32px] sm:h-[60px] sm:w-[calc(100%-64px)] lg:top-[44px] lg:left-[48px] lg:h-[76px] lg:w-[calc(100%-96px)]">
						<div className="absolute sm:top-[-24px] sm:left-[-28px] sm:size-[120px] lg:top-[-29px] lg:left-[-33px] lg:size-[152px]">
							<svg className="absolute block size-full" fill="none" viewBox="0 0 157 149">
								<ellipse cx="78.5" cy="74.5" fill="#1CA35B" rx="78.5" ry="74.5" />
							</svg>
						</div>
						<p className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap font-bold text-white tracking-widest sm:left-[20px] sm:text-[22px] lg:left-[25px] lg:text-[27px]">
							00:10:00
						</p>
					</div>

					{/* Mari Mulai text */}
					<p className="absolute font-bold text-[#fdc10e] leading-tight sm:top-[110px] sm:left-[32px] sm:w-[45%] sm:text-[54px] lg:top-[147px] lg:left-[47px] lg:text-[75px]">
						Mari Mulai!
					</p>

					{/* Description text */}
					<p className="absolute font-medium text-[#333] leading-snug sm:top-[200px] sm:left-[32px] sm:w-[45%] sm:text-[15px] lg:top-[259px] lg:left-[47px] lg:text-[20px]">
						Kamu punya sepuluh menit untuk mengerjakan semua soal
					</p>

					{/* Yellow ellipse decoration */}
					<div className="absolute sm:top-[120px] sm:right-[-10px] sm:h-[300px] sm:w-[45%] lg:top-[187px] lg:left-[499px] lg:h-[401px] lg:w-[404px]">
						<svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 404 401">
							<ellipse cx="202" cy="200" fill="#FEE086" rx="202" ry="200" stroke="#FED65E" strokeWidth="2" />
						</svg>
					</div>

					{/* Character image */}
					<div className="absolute right-0 bottom-0 sm:h-[260px] sm:w-[45%] lg:top-[53px] lg:left-[479px] lg:h-[500px] lg:w-[500px]">
						<img
							alt=""
							className="pointer-events-none absolute inset-0 size-full max-w-none object-contain"
							src="/decorations/image 25.png"
						/>
					</div>
				</div>
			</m.div>
		</div>
	);
};
