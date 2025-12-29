import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BackButton } from "@/components/back-button";
import { NextButton } from "@/components/next-button";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { shortName, contentId } = Route.useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const queryClient = useQueryClient();

	const content = useQuery(
		orpc.subtest.getContentById.queryOptions({
			input: { contentId: Number(contentId) },
		}),
	);

	const trackViewMutation = useMutation(orpc.subtest.trackView.mutationOptions());

	// Track view when content is viewed
	// Always track to update viewedAt timestamp, even if already tracked in this session
	useEffect(() => {
		if (!content.data) return;

		// Use a debounce mechanism to avoid multiple rapid calls
		const storageKey = `tracking_content_${contentId}`;
		const lastTracked = sessionStorage.getItem(storageKey);
		const now = Date.now();
		const DEBOUNCE_MS = 2000; // Track at most once per 2 seconds per content

		if (!lastTracked || now - Number(lastTracked) > DEBOUNCE_MS) {
			trackViewMutation.mutate(
				{ id: Number(contentId) },
				{
					onSuccess: () => {
						// Update last tracked timestamp
						sessionStorage.setItem(storageKey, now.toString());
						queryClient.invalidateQueries({
							queryKey: orpc.subtest.getRecentViews.key(),
						});
					},
				},
			);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [content.data, contentId, queryClient.invalidateQueries, trackViewMutation.mutate]);

	const currentPath = location.pathname;
	const currentTab: "video" | "notes" | "latihan-soal" = currentPath.endsWith("/notes")
		? "notes"
		: currentPath.endsWith("/latihan-soal")
			? "latihan-soal"
			: "video";

	const handleTabChange = (value: string) => {
		navigate({
			to:
				value === "video"
					? `/classes/${shortName}/${contentId}/video`
					: value === "notes"
						? `/classes/${shortName}/${contentId}/notes`
						: `/classes/${shortName}/${contentId}/latihan-soal`,
			params: { shortName, contentId },
		});
	};

	return (
		<Container className="min-h-screen border-neutral-200 border-x bg-white pt-28 sm:gap-6">
			<div className="flex justify-between">
				<BackButton
					to={
						currentTab === "video"
							? `/classes/${shortName}`
							: currentTab === "notes"
								? `/classes/${shortName}/${contentId}/video`
								: `/classes/${shortName}/${contentId}/notes`
					}
				/>
				{currentTab === "video" && (
					<NextButton
						to={`/classes/${shortName}/${contentId}/notes`}
						className={!location.pathname.includes("/video") ? "hidden" : ""}
					/>
				)}
				{currentTab === "notes" && (
					<NextButton
						to={`/classes/${shortName}/${contentId}/latihan-soal`}
						className={!location.pathname.includes("/notes") ? "hidden" : ""}
					/>
				)}
			</div>

			<Tabs value={currentTab} onValueChange={handleTabChange}>
				<TabsContent value={currentTab}>
					<Outlet />
				</TabsContent>
			</Tabs>
		</Container>
	);
}
