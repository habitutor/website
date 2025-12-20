import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import di bawah nanti bisa diisi kalau kamu mau fetch detail konten, dll
// import { useQuery } from "@tanstack/react-query";
// import { orpc } from "@/utils/orpc";

export const Route = createFileRoute(
  "/_authenticated/classes/$shortName/$contentId"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { shortName, contentId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Biar tab sinkron sama URL child-nya
  const currentPath = location.pathname;
  const _basePath = `/_authenticated/classes/${shortName}/${contentId}`;
  const currentTab: "video" | "notes" | "quiz" = currentPath.endsWith("/notes")
    ? "notes"
    : currentPath.endsWith("/quiz")
    ? "quiz"
    : "video"; // default ke video

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
    <Container className="space-y-6 pt-6">
      {/* Di sini kamu bisa taruh header materi kalau sudah punya data */}
      {/* <ClassMaterialHeader ... /> */}

      {/* Tabs yang terhubung ke nested routes */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="notes">Catatan</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>

        {/* Konten sebenernya datang dari child routes via <Outlet /> */}
        <TabsContent value={currentTab} className="pt-4">
          <Outlet />
        </TabsContent>
      </Tabs>

      {/* Optional: link back ke list materi */}
      <div className="pt-4">
        <Link
          to="/classes/$shortName"
          params={{ shortName }}
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Kembali ke daftar materi
        </Link>
      </div>
    </Container>
  );
}
