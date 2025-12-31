import Carousel from "@/components/carousel";
import { DATA } from "./data";

export default function Testimone() {
	return (
		<section className="overflow-x-clip">
			<div className="container relative mx-auto my-20 flex w-full max-w-4xl flex-col overflow-visible px-4">
				<main className="flex flex-col gap-y-32 rounded-2xl border border-neutral-200 bg-neutral-100 py-8">
					<div className="mb-4 text-center">
						<h2 className="font-bold text-2xl">
							Ruang Aman untuk <span className="text-primary-300">Bertanya & Tumbuh</span>
						</h2>
						<p className="font-medium text-sm">Ribuan siswa telah menemukan rumah kedua mereka di sini.</p>
					</div>
					<Carousel
						items={[...DATA.testimone]}
						showNavigation={true}
						showDots={true}
						autoPlay={false}
						gap={36}
						responsiveGap={true}
						className=""
					/>
				</main>
			</div>
		</section>
	);
}
