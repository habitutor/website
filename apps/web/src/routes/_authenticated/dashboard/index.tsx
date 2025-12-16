import { ArrowCircleRightIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
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
					<a href="https://discord.com" rel="noopener norefferer" target="_blank" className="bg-blue-400 hover:bg-blue-400/80">
						Join Discord
						<ArrowCircleRightIcon size={24} />
					</a>
					<a href="https://whatsapp.com" rel="noopener norefferer" target="_blank" className="bg-green-500 hover:bg-green-500/80">
						Join Whatsapp
						<ArrowCircleRightIcon size={24} />
					</a>
				</div>
			</section>

			<DismissableAlert />
			<UserProgress />
			<LastClasses />
		</>
	);
}
