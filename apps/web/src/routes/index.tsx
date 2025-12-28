import { createFileRoute } from "@tanstack/react-router";
import Header from "@/components/header";
import { CallToAction } from "./-home/call-to-action";
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
			<Pricing />
			<CallToAction />
			<Footer />
		</>
	);
}
