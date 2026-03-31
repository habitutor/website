import { ArrowCircleRightIcon, ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
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
import { PWATutorialDialog } from "./-components/pwa-tutorial-dialog";
import { LiveClass } from "../-components/live-class";
import { Announcement } from "../-components/announcement";

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
	const { data: profile } = useQuery(orpc.profile.get.queryOptions());
	const [showDialog, setShowDialog] = useState(false);
	const [showPremiumBanner, setShowPremiumBanner] = useState(true);
	const dreamText = [profile?.dreamMajor, profile?.dreamCampus].filter(Boolean).join(", ");
	const [pwaDialog, setPwaDialog] = useState(false);

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
						<DialogDescription>Untuk bergabung bersama grup whatsapp, kamu perlu Premium</DialogDescription>
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

			<PWATutorialDialog open={pwaDialog} onOpenChange={setPwaDialog} />

			<MotionStagger className="relative z-10 flex flex-col gap-6">
				<MotionStaggerItem>
					<section className="flex w-full items-center justify-between gap-0 max-sm:flex-col-reverse max-sm:items-start">
						<div className="flex items-center gap-2">
							<img src="/avatar/profile/tupai-1.webp" alt="Tupai" className="h-auto w-40 object-cover" />
							<div className="space-y-1 text-primary">
								<h1 className="text-4xl">
									Halo, <strong>{session?.user.name.split(" ")[0]}!</strong>
								</h1>
								<p className="">
									<strong>{dreamText || "Dream major, dream campus"}</strong> menunggumu!
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 md:static fixed z-20 bottom-10 right-4 [&>a]:flex [&>a]:justify-between [&>a]:gap-10 [&>a]:rounded-lg [&>a]:p-4 [&>a]:text-white [&>a]:transition-colors">
							<a
								href={data?.whatsapp || "#"}
								rel={data?.whatsapp ? "noopener noreferrer" : undefined}
								target={data?.whatsapp ? "_blank" : undefined}
								onClick={(e) => handleSocialClick(e, data?.whatsapp ?? undefined)}
								className="group relative overflow-clip bg-whatsapp hover:bg-whatsapp/80"
							>
								<p className="z-10 w-[50%] md:w-full font-bold">Join Whatsapp</p>
								<ArrowCircleRightIcon size={24} className="z-10" />
								<Image
									src="/icons/whatsapp.svg"
									width={70}
									height={70}
									className="absolute right-0 -bottom-[40%] opacity-100 transition-transform group-hover:-translate-y-1"
								/>
							</a>
						</div>
					</section>

					{session?.user.isPremium && showPremiumBanner ? (
						<div className="mb-6 gap-6 flex flex-col">
							<div className="w-full relative overflow-hidden bg-secondary-400 p-4 md:p-6 flex-row flex justify-between items-end">
								<button
									type="button"
									onClick={() => setShowPremiumBanner(false)}
									className="absolute right-0 p-2 z-10 hidden md:block top-0 text-secondary-1000 cursor-pointer"
									aria-label="Close banner"
								>
									<XIcon weight="bold" size={20} />
								</button>
								<div className="z-10">
									<h5 className="md:text-2xl font-bold">Pindahkan ke Layar Utamamu!</h5>
									<p className="md:text-base text-[10px]">Gunakan di Mobile. Akses kapanpun</p>
								</div>
								<Button variant="default" size="icon" className="z-10 bg-secondary-1000 hover:bg-secondary-900" onClick={() => setPwaDialog(true)}>
									<ArrowRightIcon weight="bold" />
								</Button>
								<div className="md:h-18 h-8 absolute right-0 bottom-0 bg-secondary-600 w-20 md:w-60" />
								<Image
									src="/avatar/tutorial-avatar.webp"
									alt=""
									width={75}
									height={75}
									className="absolute md:block hidden -bottom-18 right-10 h-auto w-55 object-contain"
								/>
							</div>
							<MotionStaggerItem>
								<UserProgress />
							</MotionStaggerItem>
						</div>
					) : (<UserProgress />
					)}
				</MotionStaggerItem>
				<MotionStaggerItem>
					<Announcement />
				</MotionStaggerItem>
				<MotionStaggerItem>
					<LiveClass />
				</MotionStaggerItem>
				<MotionStaggerItem>
					<LastClasses />
				</MotionStaggerItem>
			</MotionStagger>

			<div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0">
				<img src="/dashboard-background.webp" alt="" className="block h-auto w-full" />
			</div>
		</>
	);
}
