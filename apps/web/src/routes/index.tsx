import { createFileRoute, Link } from "@tanstack/react-router";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

function HomeComponent() {
	return (
		<>
			<Header />
			<div className="container mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-2 pt-40 text-center">
				<h2 className="font-bold font-sans text-5xl">
					Ubah Persiapan Ujian Menjadi <span className="text-primary">Investasi Masa Depan</span>
				</h2>

				<p>
					Tidak hanya membantumu menaklukkan SNBT, tapi Habitutor juga membentuk growth mindset untuk tantangan masa
					depan.
				</p>

				<div className="flex items-center justify-center gap-2">
					<Button asChild>
						<Link to="/login">Mulai Sekarang</Link>
					</Button>
					<Button variant="outline">
						<Link to="/dashboard">Tombol satu Lagi</Link>
					</Button>
				</div>
			</div>
		</>
	);
}
