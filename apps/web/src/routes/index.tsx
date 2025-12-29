import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import { CallToAction } from "./-home/call-to-action";
import { Features } from "./-home/features";
import Footer from "./-home/footer";
import { Hero } from "./-home/hero";
import { Pricing } from "./-home/pricing";
import { Statistics } from "./-home/statistics";

export const Route = createFileRoute("/")({
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
