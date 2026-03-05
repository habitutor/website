import { ArrowRightIcon,XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { useState } from "react";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";
import { LastClasses } from "../-components/last-classes";
import { UserProgress } from "../-components/user-progress";

export const Route = createFileRoute("/_authenticated/dashboard/")({
	head: () => ({
		meta: createMeta({
			title: "Dashboard",
			description: "Dashboard belajar Habitutor untuk persiapan SNBT/UTBK.",
			noIndex: true,
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const { data, error } = useQuery(orpc.social.queryOptions());
	const [showDialog, setShowDialog] = useState(false);
	const [showPremiumSection, setShowPremiumSection] = useState(true);


	const handleSocialClick = (e: React.MouseEvent, socialLink?: string) => {
		if (!socialLink || error) {
			e.preventDefault();
			setShowDialog(true);
		}
	};

	return (
		<>
			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Ups, belum premium!</DialogTitle>
						<DialogDescription>Untuk bergabung bersama grup discord dan whatsapp, kamu perlu Premium</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDialog(false)}>
							Cancel
						</Button>
						<Link to="/premium">
							<Button>Continue</Button>
						</Link>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<MotionStagger className="flex flex-col gap-6	">
				<MotionStaggerItem>
					<section className="flex w-full items-center justify-between gap-8 max-sm:flex-col-reverse max-sm:items-start">
						<div className="flex items-center gap-2">
							<Image
								src="/avatar/Tupai-dashboard.webp"
								alt="Dashboard Avatar"
								width={140}
								height={140}
								className="object-cover"
							/>
							<div className="text-primary">
								<h1 className="text-4xl">
									Halo, <strong>{session?.user.name.split(" ")[0]}!</strong>
								</h1>
								<p className="text-lg"><strong>{session?.user.dreamMajor}, {session?.user.dreamCampus}</strong> menantimu!</p>
							</div>
						</div>

						<div className="flex gap-2 max-sm:w-full [&>a]:flex [&>a]:justify-between [&>a]:gap-4 [&>a]:rounded-lg [&>a]:p-4 [&>a]:text-white [&>a]:transition-colors">
							<a
								href={data?.whatsapp || "#"}
								rel={data?.whatsapp ? "noopener noreferrer" : undefined}
								target={data?.whatsapp ? "_blank" : undefined}
								onClick={(e) => handleSocialClick(e, data?.whatsapp ?? undefined)}
								className="group relative overflow-clip bg-whatsapp hover:bg-whatsapp/80 border border-fourtiary-300 max-sm:fixed max-sm:bottom-4 max-sm:right-4 max-sm:z-50 max-sm:w-auto"
							>
								<p className="z-10 pr-30 max-sm:pr-18  font-semibold">Join 
									<br />
									Whatsapp</p>
								<ArrowRightIcon weight="bold" size={24} className="z-10 absolute top-2 right-3" />
								<Image
									src="/icons/whatsapp.svg"
									width={60}
									height={60}
									className="absolute right-[10%] -bottom-[25%] transition-transform group-hover:-translate-y-1"
								/>
							</a>
						</div>
					</section>
						{session?.user.isPremium && showPremiumSection && (
							<MotionStaggerItem>
								<section className="bg-secondary-400 relative overflow-hidden py-4 pl-6 pr-4 hidden lg:block mb-6">
									<div className="flex items-center justify-between max-sm:flex-col max-sm:gap-4">
										<div className="flex flex-col gap-2 text-neutral-1000">
											<div className="flex items-center gap-2">
												<h2 className="text-2xl font-bold">Pindahkan ke Layar Utamamu!</h2>
											</div>
											<p className="">Gunakan di Mobile. Akses Kapanpun</p>
										</div>
										<div className="flex flex-col gap-4 z-10">
											<button
												onClick={() => setShowPremiumSection(false)}
												className="z-10 p-2 hover:bg-black/10 rounded-lg flex justify-center"
												aria-label="Close"
											>
												<XIcon weight="bold" size={24} className="text-neutral-1000" />
											</button>
											<Link to="/premium" className="max-sm:w-full">
												<Button className="max-sm:w-full bg-secondary-1000 hover:bg-secondary-900">
													<ArrowRightIcon weight="bold" size={20} />
												</Button>
											</Link>
										</div>
									</div>
										<div className="absolute -bottom-[40%] right-0 aspect-square z-0 w-60 h-full bg-secondary-600" />
										<Image
											src="/avatar/testi-avatar-3.webp"
											alt="Dashboard Mobile Avatar"
											width={200}
											height={200}
											className="object-contain absolute -bottom-2 right-[5%] z-0"
										/>
								</section>
							</MotionStaggerItem>
						)}
					<UserProgress />
				</MotionStaggerItem>

				<MotionStaggerItem>
					<LastClasses />
				</MotionStaggerItem>

				<div className="fixed top-[25%] right-[10%] -z-2 w-50 h-50 rounded-full bg-tertiary-100 border border-tertiary-200" />
				<div className="fixed top-[15%] right-[8%] -z-2 w-20 h-20 rounded-full bg-tertiary-100 border border-tertiary-200" />


				<div className="fixed bottom-130 -left-[2%] -z-2 w-30 h-30 rounded-full bg-tertiary-100 border border-tertiary-200" />
				<div className="fixed -bottom-20 -left-[5%] -z-2 w-150 h-150 rounded-full bg-tertiary-100 border border-tertiary-200" />
				<Image
					src="/decorations/dashboard-bg.webp"
					width={140}
					height={140}
					className="fixed bottom-0 left-0 w-screen -z-1 pointer-events-none"
				/>
			</MotionStagger>
		</>
	);
}
