import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<section className="relative flex flex-col items-center justify-start overflow-hidden bg-background pt-20 md:h-screen md:max-h-screen">
			<div className="container mx-auto flex max-w-5xl shrink-0 flex-col items-center px-4 pt-8 md:pt-20">
				<div className="flex max-w-3xl flex-col items-center gap-3 text-center md:gap-4">
					<h2 className="font-bold font-sans text-3xl sm:text-4xl md:text-5xl">
						Ubah Persiapan Ujian Menjadi <span className="text-primary-300">Investasi Masa Depan</span>
					</h2>

					<p className="text-sm sm:text-base">
						Tidak hanya membantumu menaklukkan SNBT, tapi Habitutor juga membentuk growth mindset untuk tantangan masa
						depan.
					</p>

					<div className="flex w-full items-center justify-center gap-2">
						<Button asChild size="sm" className="flex-1 sm:w-auto sm:flex-initial">
							<Link to="/login">Mulai Belajar Sekarang</Link>
						</Button>
						<Button variant="outline" size="sm" className="flex-1 sm:w-auto sm:flex-initial">
							<Link to="/dashboard">Cara Kerjanya</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* <div className="relative mt-10 w-full pb-8 md:mt-0 md:min-h-0 md:flex-1 md:pb-0">
				<Image
					src="/images/hero-image.webp"
					alt="Hero Illustration"
					layout="fullWidth"
					className="h-auto max-h-72 w-full object-cover sm:max-h-80 md:h-full md:max-h-full md:rounded-2xl md:object-contain md:px-4"
				/>
			</div> */}
		</section>
	);
}
