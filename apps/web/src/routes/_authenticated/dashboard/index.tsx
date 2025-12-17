import { ArrowCircleRightIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { DismissableAlert } from "../-components/dismissable-alert";
import { LastClasses } from "../-components/last-classes";
import { UserProgress } from "../-components/user-progress";

export const Route = createFileRoute("/_authenticated/dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();

	return (
		<>
			<section className="flex w-full items-center justify-between gap-8 max-sm:flex-col-reverse max-sm:items-start">
				<div className="flex items-center gap-2">
					<p className="text-5xl">👋</p>
					<div className="text-primary">
						<h1 className="text-xl">
							Halo, <strong>{session?.user.name.split(" ")[0]}</strong>
						</h1>
						<p className="text-sm">Yuk lanjutkan perjalanan harimu</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-2 max-sm:w-full [&>a]:flex [&>a]:justify-between [&>a]:gap-4 [&>a]:rounded-lg [&>a]:p-4 [&>a]:text-white [&>a]:transition-colors">
					<a
						href="https://discord.com"
						rel="noopener norefferer"
						target="_blank"
						className="group relative overflow-clip bg-discord hover:bg-discord/80"
					>
						<p className="z-10">Join Discord</p>
						<ArrowCircleRightIcon size={24} />
						<Image
							src="/icons/discord.svg"
							width={70}
							height={70}
							className="absolute right-0 -bottom-[40%] opacity-50 transition-colors group-hover:-translate-y-1"
						/>
					</a>
					<a
						href="https://whatsapp.com"
						rel="noopener norefferer"
						target="_blank"
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

			<DismissableAlert />
			<UserProgress />
			<LastClasses />
		</>
	);
}
