import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SubtestCard, SubtestHeader } from "@/components/classes";
import { MotionStagger, MotionStaggerItem } from "@/components/motion/motion-components";
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

  return (
    <MotionStagger className="mt-4 sm:-mt-3">
      <MotionStaggerItem>
        <SubtestHeader />
      </MotionStaggerItem>

      <MotionStaggerItem>
        <div className="mt-6 sm:mt-8">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-extrabold text-sr-ink sm:text-xl">Pilih subtes</h2>
            {subtests.data && (
              <span className="rounded-full bg-sr-blue-50 px-3 py-1 text-xs font-bold text-sr-blue-700">
                {subtests.data.data.length} subtes
              </span>
            )}
          </div>
          {subtests.isPending && (
            <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <Skeleton key={i.toString()} className="h-56 w-full rounded-sr-lg" />
              ))}
            </div>
          )}

          {subtests.isError && <p className="text-red-500">Error: {subtests.error.message}</p>}

          {subtests.data && subtests.data.data.length === 0 && <p className="text-muted-foreground">No subtests yet</p>}

          {subtests.data && subtests.data.data.length > 0 && (
            <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
              {subtests.data.data.map((subtest) => (
                <SubtestCard key={subtest.id} subtest={subtest} userIsPremium={userIsPremium} userRole={userRole} />
              ))}
            </div>
          )}
        </div>
      </MotionStaggerItem>
    </MotionStagger>
  );
}
