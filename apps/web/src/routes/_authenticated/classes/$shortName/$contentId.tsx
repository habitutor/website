import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Container } from "@/components/ui/container";
import { BackButton } from "@/components/back-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NextButton } from "@/components/next-button";

export const Route = createFileRoute(
  "/_authenticated/classes/$shortName/$contentId"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { shortName, contentId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const currentTab: "video" | "notes" | "quiz" = currentPath.endsWith("/notes")
    ? "notes"
    : currentPath.endsWith("/quiz")
    ? "quiz"
    : "video";

  const handleTabChange = (value: string) => {
    navigate({
      to:
        value === "video"
          ? "/classes/$shortName/$contentId/video"
          : value === "notes"
          ? "/classes/$shortName/$contentId/notes"
          : "/classes/$shortName/$contentId/quiz",
      params: { shortName, contentId },
    });
  };

  return (
    <Container className="bg-white border-x border-neutral-200 pt-28 min-h-screen sm:gap-6">
      <div className="flex justify-between">
        <BackButton
          to={
            currentTab === "video"
              ? "/classes/$shortName"
              : currentTab === "notes"
              ? "/classes/$shortName/$contentId/video"
              : "/classes/$shortName/$contentId/notes"
          }
          params={
            currentTab === "video" ? { shortName } : { shortName, contentId }
          }
        />
        {currentTab === "video" && (
          <NextButton
            to="/classes/$shortName/$contentId/notes"
            params={{ shortName, contentId }}
            className={!location.pathname.includes("/video") ? "hidden" : ""}
          />
        )}
        {currentTab === "notes" && (
          <NextButton
            to="/classes/$shortName/$contentId/quiz"
            params={{ shortName, contentId }}
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
