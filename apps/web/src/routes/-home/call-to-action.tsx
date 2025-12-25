import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CallToAction() {
	return (
		<div className="container mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-2 pt-40 text-center">
			<h2 className="font-bold font-sans text-5xl">
				Kamu Punya <span className="text-primary-300">Potensi</span>,<br />
				Kami Punya <span className="text-primary-300">Strateginya</span>!
			</h2>

			<p className="text-pretty">
				Berhenti menebak-nebak cara belajar yang benar. Biarkan kami membimbingmu memaksimalkan setiap potensi yang kamu
				miliki.
			</p>

			<div className="flex items-center justify-center gap-2">
				<Button asChild>
					<Link to="/login">Mulai Perjalananmu</Link>
				</Button>
			</div>
		</div>
	);
}
