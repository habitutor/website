import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SubtestCard, SubtestHeader } from "@/components/classes";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { createMeta } from "@/lib/seo-utils";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/classes/")({
  head: () => ({
    meta: createMeta({
      title: "Kelas",
      description: "Upgrade ke premium untuk akses penuh ke semua fitur dan materi Habitutor.",
      noIndex: true,
    }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();
  const userIsPremium = session.data?.user?.isPremium ?? false;
  const userRole = session.data?.user?.role;
  const subtests = useQuery(orpc.subtest.list.queryOptions({ input: {} }));
  const items = subtests.data?.data ?? [];
  const stats = subtests.data
    ? { subtests: items.length, contents: items.reduce((sum, item) => sum + (Number(item.totalContent) || 0), 0) }
    : undefined;

  return (
    <div className="space-y-8">
      <SubtestHeader stats={stats} />

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-sr-ink sm:text-xl">Pilih subtes</h2>
          <p className="text-sm text-sr-muted">
            Mulai dari subtes yang paling ingin kamu kuasai, satu BAB dulu juga keren.
          </p>
        </div>

        {subtests.isPending && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i.toString()} className="overflow-hidden rounded-sr-xl border border-sr-line bg-white">
                <Skeleton className="h-44 w-full rounded-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {subtests.isError && (
          <div className="flex flex-col items-center gap-3 rounded-sr-xl border border-dashed border-sr-line-2 bg-white/80 px-6 py-10 text-center">
            <img src="/avatar/confused-avatar.webp" alt="" className="h-32 w-auto" />
            <p className="text-lg font-extrabold text-sr-ink">Kelas gagal dimuat</p>
            <p className="max-w-sm text-sm text-sr-muted">Coba muat ulang halaman ini, ya.</p>
          </div>
        )}

        {subtests.data && items.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-sr-xl border border-dashed border-sr-line-2 bg-white/80 px-6 py-10 text-center">
            <img src="/avatar/confused-avatar.webp" alt="" className="h-32 w-auto motion-safe:animate-sr-drift" />
            <p className="text-lg font-extrabold text-sr-ink">Kelasnya lagi diracik</p>
            <p className="max-w-sm text-sm text-sr-muted">Subtes akan muncul di sini begitu materinya siap.</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {items.map((subtest, index) => (
              <SubtestCard
                key={subtest.id}
                subtest={subtest}
                index={index}
                userIsPremium={userIsPremium}
                userRole={userRole}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
