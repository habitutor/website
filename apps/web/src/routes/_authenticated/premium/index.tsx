import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";
import { FeatureComparisonTable } from "./-components/feature-comparison-table";
import { PremiumHeader } from "./-components/premium-header";
import { TierCard } from "./-components/tier-card";

export const Route = createFileRoute("/_authenticated/premium/")({
	head: () => ({
		meta: createMeta({
			title: "Premium",
			description: "Upgrade ke premium untuk akses penuh ke semua fitur dan materi Habitutor.",
			noIndex: true,
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const { session } = Route.useRouteContext();
	const transactionMutation = useMutation(orpc.transaction.subscribe.mutationOptions());

	const isPremium = session?.user.isPremium ?? false;

	return (
		<MotionStagger className="mt-4 flex flex-col gap-6 sm:-mt-3">
			<MotionStaggerItem>
				<PremiumHeader />
			</MotionStaggerItem>

			<MotionStaggerItem>
				<div className="grid gap-6 sm:grid-cols-2">
					<TierCard variant="free" isPremium={isPremium} />
					<TierCard
						variant="premium"
						isPremium={isPremium}
						isPending={transactionMutation.isPending}
						mutate={transactionMutation.mutate}
					/>
				</div>
			</MotionStaggerItem>

			<MotionStaggerItem>
				<div className="space-y-4">
					<h2 className="font-medium text-neutral-1000">Perbandingan Fitur</h2>
					<FeatureComparisonTable />
				</div>
			</MotionStaggerItem>
		</MotionStagger>
	);
}
