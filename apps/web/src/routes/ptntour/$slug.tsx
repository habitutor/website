import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";

// Layout rute event: memuat data di server supaya pratinjau link (WhatsApp/IG) memakai judul dan poster event.
export const Route = createFileRoute("/ptntour/$slug")({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(
        orpc.ptnTour.detail.queryOptions({ input: { slug: params.slug } }),
      );
    } catch {
      return null;
    }
  },
  head: ({ loaderData }) => ({
    meta: createMeta({
      title: loaderData ? loaderData.title : "Event PTN Tour",
      description: loaderData?.description ?? "Event gratis Habitutor.",
      image: loaderData?.posterUrl,
    }),
  }),
  component: () => <Outlet />,
});
