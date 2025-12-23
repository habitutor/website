import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { BackButton } from "@/components/back-button";
import { NextButton } from "@/components/next-button";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authenticated/classes/$shortName/$contentId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { shortName, contentId } = Route.useParams();
	const navigate = useNavigate();
	const location = useLocation();

  const currentPath = location.pathname;
  const currentTab: "video" | "notes" | "latihan-soal" = currentPath.endsWith(
    "/notes"
  )
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
