import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<section className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-start overflow-hidden bg-background pt-20">
			<div className="container mx-auto flex max-w-5xl shrink-0 flex-col items-center px-4 pt-8 md:pt-20">
				<div className="flex max-w-3xl flex-col items-center gap-3 text-center md:gap-4">
					<h2 className="font-bold font-sans text-3xl sm:text-4xl md:text-5xl">
						Ubah Persiapan Ujian Menjadi <span className="text-primary-300">Investasi Masa Depan</span>
					</h2>

					<p className="text-sm sm:text-base">
						Tidak hanya membantumu menaklukkan SNBT, tapi Habitutor juga membentuk growth mindset untuk tantangan masa
						depan.
					</p>

					<div className="grid w-full grid-cols-2 items-center justify-center gap-2 *:max-sm:text-xs sm:flex">
						<Button asChild size="sm" className="flex-1 px-3 sm:w-auto sm:flex-initial">
							<Link to="/login">Mulai Belajar Sekarang</Link>
						</Button>
						<Button variant="outline" size="sm" className="flex-1 px-3 sm:w-auto sm:flex-initial">
							<Link to="/dashboard">Cara Kerjanya</Link>
						</Button>
					</div>
				</div>
			</div>

			<Image
				src="/images/hero-image.webp"
				alt="Hero Illustration"
				layout="fullWidth"
				aspectRatio={16 / 9}
				className=""
			/>
		</section>
	);
}
