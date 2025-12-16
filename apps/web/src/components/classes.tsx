import { PencilSimpleIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { BodyOutputs } from "@/utils/orpc";
import { buttonVariants } from "./ui/button";

export function KelasHeader({ path }: { path: string }) {
  const title =
    path === "/classes" ? "Kelas-Kelas UTBK" : "Subtest-Subtest UTBK";
  const description =
    path === "/classes"
      ? "Pilih kelas-kelas UTBK yang ingin kamu pelajari"
      : "Pilih subtest-subtest UTBK yang ingin kamu pelajari";

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

export function SubtestCard({
  subtest,
  path,
}: {
  subtest: SubtestListItem;
  path: string;
}) {
  const routePath =
    path === "/classes" ? "/classes/$shortName" : "/subtests/$id";

  return (
    <Card className="p-4 transition-colors">
      <div className="flex h-full justify-between">
        <div className="flex-1">
          <h3 className="font-medium">{subtest?.name}</h3>
        </div>
        <Link
          to={routePath}
          params={{ id: subtest?.id }}
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "mt-auto mb-0 hover:bg-muted/50",
          )}
        >
          <PencilSimpleIcon size={18} />
        </Link>
      </div>
    </Card>
  );
}
