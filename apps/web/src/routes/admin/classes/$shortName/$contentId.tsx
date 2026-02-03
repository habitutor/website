import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/classes/$shortName/$contentId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { shortName, contentId } = Route.useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const content = useQuery(
		orpc.subtest.getContentById.queryOptions({
			input: { contentId: Number(contentId) },
		}),
	);

	// Biar tab sinkron sama URL child-nya
	const currentPath = location.pathname;
	const currentTab: "video" | "notes" | "latihan-soal" = currentPath.endsWith("/notes")
		? "notes"
		: currentPath.endsWith("/latihan-soal")
			? "latihan-soal"
			: "video"; // default ke video

	const handleTabChange = (value: string) => {
		navigate({
			to:
				value === "video"
					? "/admin/classes/$shortName/$contentId/video"
					: value === "notes"
						? "/admin/classes/$shortName/$contentId/notes"
						: "/admin/classes/$shortName/$contentId/latihan-soal",
			params: { shortName, contentId },
		});
	};

	const displayTitle = content.data?.title || contentId;

	return (
		<AdminContainer>
			{content.isPending ? (
				<Skeleton className="h-8 w-64" />
			) : content.isError ? (
				<AdminHeader title={`Error: ${content.error.message}`} />
			) : (
				<AdminHeader title={displayTitle} description="Manage video, notes, and practice questions" />
			)}

			<Tabs value={currentTab} onValueChange={handleTabChange} className="mt-6">
				<TabsList>
					<TabsTrigger value="video">Video</TabsTrigger>
					<TabsTrigger value="notes">Catatan</TabsTrigger>
					<TabsTrigger value="latihan-soal">Latihan Soal</TabsTrigger>
				</TabsList>

				<TabsContent value={currentTab} className="pt-4">
					<Outlet />
				</TabsContent>
			</Tabs>
		</AdminContainer>
	);
}
