import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ClassHeader,ContentList } from "@/components/classes";
import { Container } from "@/components/ui/container";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/admin/classes/$shortName/")({
	params: {
		parse: (raw) => ({
			shortName: raw.shortName?.toLowerCase(),
		}),
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { shortName } = Route.useParams();

	const subtests = useQuery(orpc.subtest.listSubtests.queryOptions());
	const matchedClass = subtests.data?.find((item) => item.shortName?.toLowerCase() === shortName);

	const materialContents = useQuery(
		orpc.subtest.listContentByCategory.queryOptions({
			input: { subtestId: matchedClass?.id ?? 0, category: "material" },
			enabled: Boolean(matchedClass?.id),
		}),
	)

	const tipsContents = useQuery(
		orpc.subtest.listContentByCategory.queryOptions({
			input: { subtestId: matchedClass?.id ?? 0, category: "tips_and_trick" },
			enabled: Boolean(matchedClass?.id),
		}),
	)

	if (subtests.isPending) {
		return (
			<Container className="pt-12">
				<p className="animate-pulse text-sm">Memuat kelas...</p>
			</Container>
		)
	}

	if (subtests.isError) {
		return (
			<Container className="pt-12">
				<p className="text-red-500 text-sm">Error: {subtests.error.message}</p>
			</Container>
		)
	}
	if (!matchedClass) return notFound();

	return (
		<Container className="space-y-6">
			<ClassHeader subtest={matchedClass} />
			<div className="space-y-4">
				<ContentList
					title="Materi"
					items={materialContents.data}
					isLoading={materialContents.isPending}
					error={materialContents.isError ? materialContents.error.message : undefined}
				/>
				<ContentList
					title="Tips & Trick"
					items={tipsContents.data}
					isLoading={tipsContents.isPending}
					error={tipsContents.isError ? tipsContents.error.message : undefined}
				/>
			</div>
		</Container>
	)
}
	