import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CallToAction() {
	return (
		<div className="relative overflow-hidden pb-44 sm:pb-36">
			{/* Left Avatar */}
			<div className="absolute bottom-0 left-0">
				<img src="/avatar/footer-left.webp" alt="" className="w-[200px] xl:w-[280px]" />
			</div>

			{/* Right Avatar & Decorations */}
			<div className="absolute right-0 bottom-0">
				<div className="relative">
					<img src="/avatar/footer-right.webp" alt="" className="relative z-10 w-[200px] xl:w-[280px]" />

					{/* Decorative Circles (Buletan) */}
					{/* <div className="absolute -top-10 -right-4 flex items-center justify-center">
						<div className="size-[91px] rounded-full bg-[#76E8AC]" />
					</div>
					<div className="absolute -top-4 right-16 flex items-center justify-center">
						<div className="size-[35px] rounded-full bg-[#FFDB43]" />
					</div> */}
					<div className="absolute -right-20 -bottom-10 z-0 size-40 rounded-full bg-tertiary-100 md:size-80" />
				</div>
			</div>

			<div className="container relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-2 pt-40 pb-26 text-center">
				<h2 className="font-bold font-sans text-4xl">
					Kamu Punya <span className="text-primary-300">Potensi</span>,<br />
					Kami Punya <span className="text-primary-300">Strateginya</span>!
				</h2>

				<p className="text-pretty">
					Berhenti menebak-nebak cara belajar yang benar. Biarkan kami membimbingmu memaksimalkan setiap potensi yang
					kamu miliki.
				</p>

				<div className="flex items-center justify-center gap-2">
					<Button asChild>
						<Link to="/login">Mulai Perjalananmu</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
