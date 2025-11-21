import { useMutation, useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { ArrowRight, Check, Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getUser } from "@/lib/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/latihan-soal/")({
	beforeLoad: async () => {
		const session = await getUser();

		return { session };
	},
	loader: async ({ context }) => {
		if (!context.session)
			throw redirect({
				to: "/login",
			});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const packs = useQuery(
		orpc.practicePack.list.queryOptions(),
	);
	console.log("data", packs.data);

	return (
		<Container className="pt-20">
			<h1 className="mb-6 font-bold text-2xl">Latihan Soal</h1>

			<div className="space-y-4">
				{packs.isLoading && (
					<p className="animate-pulse">Memasak Nasi Custom...</p>
				)}

				{packs.isError && (
					<p className="text-red-500">Error: {packs.error.message}</p>
				)}

				{packs.data && packs.data.length === 0 && (
					<p className="text-muted-foreground">No packs yet</p>
				)}

				<div className="grid grid-cols-3 gap-2">
					{packs.data?.map((pack) => (
						<PacketCard
							key={pack.id}
							title={pack.title}
							packId={pack.id}
							packStatus={pack.status}
						/>
					))}
				</div>
			</div>
		</Container>
	);
}

const PacketCard = (props: {
	title: string;
	packId: number;
	packStatus: "not_started" | "ongoing" | "finished" | null;
}) => {
	const navigate = useNavigate();
	const startMutation = useMutation(
		orpc.practicePack.startAttempt.mutationOptions({
			onSuccess: (data, pack) => {
				toast.success(data.message);
				navigate({
					to: "/latihan-soal/$id",
					params: { id: pack.practicePackId },
				});
			},
			onError: (data) => {
				toast.error("Error", {
					description: () => <p>{data.message}</p>,
				});
			},
		}),
	);

	return (
		<Card className="p-4">
			<div className="flex flex-col justify-between gap-4">
				<h3 className="font-medium text-lg">{props.title}</h3>
				{props.packStatus === "ongoing" ? (
					<Button
						asChild
						type="button"
						variant={"secondary"}
						className="flex-1 hover:cursor-pointer"
					>
						<Link
							to="/latihan-soal/$id"
							params={{
								id: props.packId,
							}}
						>
							<ArrowRight />
							Lanjutkan
						</Link>
					</Button>
				) : props.packStatus === "finished" ? (
					<Button
						type="button"
						variant={"secondary"}
						className="flex-1 hover:cursor-pointer"
						disabled={true}
					>
						<Check />
						Sudah Dikerjakan
					</Button>
				) : (
					<Button
						type="button"
						variant={"secondary"}
						className="flex-1 hover:cursor-pointer"
						onClick={() =>
							startMutation.mutate({
								practicePackId: props.packId,
							})
						}
						disabled={startMutation.isPending}
					>
						<Eye />
						{startMutation.isPending ? "Memasak..." : "Kerjakan"}
					</Button>
				)}
			</div>
		</Card>
	);
};
