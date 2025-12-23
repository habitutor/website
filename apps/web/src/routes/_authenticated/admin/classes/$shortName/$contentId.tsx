import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { Container } from "@/components/ui/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute(
  "/_authenticated/admin/classes/$shortName/$contentId"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { shortName, contentId } = Route.useParams();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <Container className="space-y-6 pt-6">
      {/* Tabs yang terhubung ke nested routes */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="notes">Catatan</TabsTrigger>
          <TabsTrigger value="latihan-soal">Latihan Soal</TabsTrigger>
        </TabsList>

        {/* Konten sebenernya datang dari child routes via <Outlet /> */}
        <TabsContent value={currentTab} className="pt-4">
          <Outlet />
        </TabsContent>
      </Tabs>

      {/* Optional: link back ke list materi */}
      <div className="pt-4">
        <Link
          to="/admin/classes/$shortName"
          params={{ shortName }}
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Kembali ke daftar materi
        </Link>
      </div>
    </Container>
  );
}
