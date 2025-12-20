import { CaretRightIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/utils/is-admin";
import type { BodyOutputs } from "@/utils/orpc";
import { buttonVariants } from "./ui/button";

export function SubtestHeader() {
  const isAdmin = useIsAdmin();
  const title = isAdmin ? "Subtest-Subtest UTBK" : "Kelas-Kelas UTBK";
  const description = isAdmin
    ? "Pilih subtest-subtest UTBK yang ingin kamu pelajari"
    : "Pilih kelas-kelas UTBK yang ingin kamu pelajari";

  return (
    <div className="flex min-h-40 flex-col items-center justify-center bg-amber-300">
      <h1 className="font-bold text-2xl">{title}</h1>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}

type SubtestListItem = NonNullable<
  BodyOutputs["subtest"]["listSubtests"]
>[number];

export function SubtestCard({ subtest }: { subtest: SubtestListItem }) {
  const isAdmin = useIsAdmin();

  return (
    <Card className="p-4 transition-colors">
      <div className="flex h-full justify-between">
        <div className="flex-1">
          <h3 className="font-medium">{subtest?.name}</h3>
        </div>
        <Link
          to={isAdmin ? "/admin/classes/$shortName" : "/classes/$shortName"}
          params={{ shortName: subtest?.shortName?.toLowerCase() }}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "mt-auto mb-0 hover:bg-muted/50"
          )}
        >
          {isAdmin ? (
            <PencilSimpleIcon size={18} />
          ) : (
            <CaretRightIcon size={18} />
          )}
        </Link>
      </div>
    </Card>
  );
}

export function ClassHeader({ subtest }: { subtest: SubtestListItem }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center bg-amber-300">
      <h1 className="font-bold text-2xl">{subtest?.name}</h1>
      <p className="text-gray-500 text-sm">{subtest?.description}</p>
    </div>
  );
}

type ContentListItem = NonNullable<
  BodyOutputs["subtest"]["listContentByCategory"]
>[number];

const CONTENT_ACTIONS = [
  {
    key: "video",
    label: "Video",
    enabled: (i: ContentListItem) => i.hasVideo,
  },
  {
    key: "notes",
    label: "Catatan",
    enabled: (i: ContentListItem) => i.hasNote,
  },
  {
    key: "quiz",
    label: "Quiz",
    enabled: (i: ContentListItem) => i.hasQuiz,
  },
] as const;

function ContentCard({ item }: { item: ContentListItem }) {
  const isAdmin = useIsAdmin();
  const basePath = isAdmin ? "/admin/classes" : "/classes";
  const shortNameIndex = isAdmin ? 3 : 2;
  const shortName = location.pathname.split("/")[shortNameIndex];

  const params = {
    shortName,
    contentId: item.id.toString(),
  };

  return (
    <Card className="p-3 transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{item.title}</p>

          <div className="mt-1 flex flex-wrap gap-2 text-muted-foreground text-xs">
            {CONTENT_ACTIONS.map(
              ({ key, label, enabled }) =>
                enabled(item) && (
                  <Link
                    key={key}
                    to={`${basePath}/$shortName/$contentId/${key}`}
                    params={params}
                    className="rounded bg-muted px-2 py-0.5"
                  >
                    {label}
                  </Link>
                )
            )}
          </div>
        </div>

        <div className="text-right text-muted-foreground text-xs">
          {item.lastViewedAt ? "Sudah dibuka" : "Belum dibuka"}
        </div>
      </div>
    </Card>
  );
}

export function ContentList({
  title,
  items,
  isLoading,
  error,
}: {
  title: string;
  items?: ContentListItem[];
  isLoading?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">{title}</h2>
        {isLoading && (
          <p className="text-muted-foreground text-xs">Memuat...</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!isLoading && !error && (!items || items.length === 0) && (
        <p className="text-muted-foreground text-sm">Belum ada konten.</p>
      )}

      <div className="space-y-2">
        {items?.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
