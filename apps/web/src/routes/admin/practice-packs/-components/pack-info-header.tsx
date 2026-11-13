import { ArrowLeftIcon, BrainIcon, CheckCircleIcon, PackageIcon, PencilSimpleIcon } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { EditPackDialog } from "./edit-pack-dialog";

type PackInfoHeaderProps = {
  packId: number;
  backTo?: string;
};

export function PackInfoHeader({ packId, backTo }: PackInfoHeaderProps) {
  const queryClient = useQueryClient();

  const { data: pack, isPending } = useQuery(
    orpc.admin.practicePack.find.queryOptions({
      input: { id: packId },
    }),
  );

  const { data: questionData } = useQuery(
    orpc.admin.practicePack.question.list.queryOptions({ input: { id: packId } }),
  );
  const questions = (questionData?.questions ?? []) as Array<{ isFlashcard?: boolean }>;
  const activeCount = questions.filter((question) => question.isFlashcard).length;
  const brainGymState =
    questions.length === 0 ? "empty" : activeCount === questions.length ? "on" : activeCount === 0 ? "off" : "mixed";

  const toggleFlashcardMutation = useMutation(
    orpc.admin.practicePack.toggleFlashcard.mutationOptions({
      onSuccess: (data) => {
        toast.success(data.message);
        queryClient.invalidateQueries(orpc.admin.practicePack.question.list.queryOptions({ input: { id: packId } }));
      },
      onError: (error) => {
        toast.error("Gagal memperbarui status flashcard", { description: String(error) });
      },
    }),
  );

  if (isPending) {
    return <Skeleton className="h-36 w-full rounded-sr-xl" />;
  }

  if (!pack) {
    return <p className="text-destructive">Practice pack tidak ditemukan</p>;
  }

  const setBrainGym = (isFlashcardQuestion: boolean) =>
    toggleFlashcardMutation.mutate({ id: packId, isFlashcardQuestion });
  const options = [
    { key: "on", label: "Aktif", value: true },
    { key: "off", label: "Nonaktif", value: false },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-sr-xl sr-card-blue p-5 shadow-sr-2 sm:p-7">
        <div aria-hidden className="pointer-events-none absolute -top-20 -right-12 size-56 rounded-full bg-white/10" />
        {backTo && (
          <Link
            to={backTo}
            className="relative mb-3 inline-flex sr-action items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold text-white ring-1 ring-white/25 hover:bg-white/25"
          >
            <ArrowLeftIcon size={14} weight="bold" />
            Kembali
          </Link>
        )}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-sr-md bg-white/15 text-sr-sun-400 ring-1 ring-white/20">
              <PackageIcon weight="fill" className="size-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{pack.title}</h1>
              <p className="mt-1 text-sm leading-relaxed text-white/80">{pack.description || "Belum ada deskripsi."}</p>
            </div>
          </div>
          <EditPackDialog
            packId={packId}
            trigger={
              <Button
                size="sm"
                className="shrink-0 border-transparent text-sr-ink shadow-sr-sun [background:var(--sr-grad-sun)]"
              >
                <PencilSimpleIcon className="size-4" />
                <span className="hidden sm:inline">Edit Pack</span>
                <span className="sr-only sm:hidden">Edit</span>
              </Button>
            }
          />
        </div>
      </div>

      <div className="flex sr-card-hover flex-col gap-4 rounded-sr-lg border border-sr-line bg-white p-4 shadow-sr-1 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-sr-md bg-sr-sun-100 text-sr-amber-700">
            <BrainIcon weight="fill" className="size-5" />
          </span>
          <div>
            <h2 className="font-black text-sr-ink">Tersedia di Brain Gym</h2>
            <p className="text-sm text-sr-muted">
              Atur apakah semua soal di pack ini muncul di latihan Brain Gym siswa.
              {brainGymState === "mixed" && (
                <span className="font-semibold text-sr-amber-700">
                  {" "}
                  Saat ini {activeCount} dari {questions.length} soal aktif.
                </span>
              )}
            </p>
          </div>
        </div>
        <div
          role="group"
          aria-label="Status Brain Gym"
          className="flex shrink-0 gap-1 rounded-full border border-sr-line bg-sr-ivory p-1"
        >
          {options.map((option) => {
            const selected = brainGymState === option.key;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={selected}
                disabled={toggleFlashcardMutation.isPending || questions.length === 0}
                onClick={() => setBrainGym(option.value)}
                className={cn(
                  "inline-flex min-w-28 flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all duration-200 disabled:opacity-60",
                  selected
                    ? option.key === "on"
                      ? "bg-sr-blue-500 text-white shadow-sr-1"
                      : "bg-sr-ink text-white shadow-sr-1"
                    : "text-sr-muted hover:bg-white hover:text-sr-ink",
                )}
              >
                {selected && <CheckCircleIcon weight="fill" className="size-4" />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
