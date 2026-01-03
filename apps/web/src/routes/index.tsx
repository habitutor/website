import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import { createMeta } from "@/lib/seo-utils";
import { CallToAction } from "./-home/call-to-action";
import { Features } from "./-home/features";
import Footer from "./-home/footer";
import { Hero } from "./-home/hero";
import { Pricing } from "./-home/pricing";
import { Statistics } from "./-home/statistics";
import Testimone from "./-home/testimone";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: createMeta({
			title: "Persiapan SNBT Terbaik",
			description:
				"Ubah persiapan ujian SNBT/UTBK menjadi lebih mudah dan terstruktur dengan Habitutor. Materi lengkap, latihan soal interaktif, dan analisis progres belajar.",
			image: "/og-image.png",
		}),
	}),
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<>
			<Header />
			<Hero />
			<Statistics />
			<Features />
			<Pricing />
			<CallToAction />
			<Footer />
		</>
	);
}
