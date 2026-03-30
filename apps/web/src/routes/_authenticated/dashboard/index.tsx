import { ArrowCircleRightIcon } from "@phosphor-icons/react";
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
	const { data: profile } = useQuery(orpc.profile.get.queryOptions());
	const [showDialog, setShowDialog] = useState(false);
	const dreamText = [profile?.dreamMajor, profile?.dreamCampus].filter(Boolean).join(", ");

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

			<MotionStagger className="relative z-10 flex flex-col gap-6">
				<MotionStaggerItem>
					<section className="flex w-full items-center justify-between gap-0 max-sm:flex-col-reverse max-sm:items-start">
						<div className="flex items-center gap-2">
							<img src="/avatar/profile/tupai-1.webp" alt="Tupai" className="h-auto w-40  object-cover" />
							<div className="text-primary space-y-1">
								<h1 className="text-4xl">
									Halo, <strong>{session?.user.name.split(" ")[0]}!</strong>
								</h1>
								<p className="">
									<strong>{dreamText || "Dream major, dream campus"}</strong> menunggumu!
								</p>
							</div>
						</div>

						<div className="grid grid-cols-1 gap-2 max-sm:w-full [&>a]:flex [&>a]:justify-between [&>a]:gap-4 [&>a]:rounded-lg [&>a]:p-4 [&>a]:text-white [&>a]:transition-colors">
							<a
								href={data?.whatsapp || "#"}
								rel={data?.whatsapp ? "noopener noreferrer" : undefined}
								target={data?.whatsapp ? "_blank" : undefined}
								onClick={(e) => handleSocialClick(e, data?.whatsapp ?? undefined)}
								className="group relative overflow-clip bg-whatsapp hover:bg-whatsapp/80"
							>
								<p className="z-10">Join Whatsapp</p>
								<ArrowCircleRightIcon size={24} className="z-10" />
								<Image
									src="/icons/whatsapp.svg"
									width={70}
									height={70}
									className="absolute right-0 -bottom-[40%] opacity-50 transition-transform group-hover:-translate-y-1"
								/>
							</a>
						</div>
					</section>
					<UserProgress />
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
