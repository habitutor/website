import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { BackButton } from "@/components/back-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
  "/_authenticated/admin/classes/$shortName/$contentId"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { shortName, contentId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const content = useQuery(
    orpc.subtest.getContentById.queryOptions({
      input: { contentId: Number(contentId) },
    })
  );

  // Biar tab sinkron sama URL child-nya
  const currentPath = location.pathname;
  const currentTab: "video" | "notes" | "latihan-soal" = currentPath.endsWith(
    "/notes"
  )
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
    <>
      <div className="w-fit">
        <BackButton to={"/admin/classes"} />
        {content.isPending ? (
          <h1 className="animate-pulse font-bold text-2xl">Memuat...</h1>
        ) : content.isError ? (
          <h1 className="font-bold text-2xl text-red-500">
            Error: {content.error.message}
          </h1>
        ) : (
          <h1 className="font-bold text-2xl">{displayTitle}</h1>
        )}
      </div>

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="notes">Catatan</TabsTrigger>
          <TabsTrigger value="latihan-soal">Latihan Soal</TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} className="pt-4">
          <Outlet />
        </TabsContent>
      </Tabs>
    </>
  );
}
