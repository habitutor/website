import { CopyIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";
import { DuplicateTryoutDialog } from "./duplicate-tryout-dialog";

/** True jika sudah ada siswa yang mengerjakan tryout ini (soalnya dikunci). */
export function useTryoutHasSesi(tryoutId: string, enabled: boolean) {
  const query = useQuery({
    ...orpc.admin.tryout.list.sesi.queryOptions({ input: { tryoutId, limit: 1 } }),
    enabled,
  });
  return { hasSesi: (query.data?.total ?? 0) > 0, isChecking: enabled && query.isPending };
}

export function LockedTryoutNotice({ tryoutId, onDone }: { tryoutId: string; onDone?: () => void }) {
  const { data: tryout } = useQuery(orpc.admin.tryout.detail.tryout.queryOptions({ input: { tryoutId } }));

  return (
    <div className="flex flex-col gap-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 sm:flex-row sm:items-center">
      <WarningCircleIcon weight="fill" size={20} className="shrink-0 text-amber-600" />
      <div className="flex-1">
        <p className="font-semibold">Try Out ini sudah dikerjakan siswa, jadi subtest dan soalnya dikunci.</p>
        <p className="text-xs">
          Agar nilai dan peringkat siswa tetap adil, buat salinan Try Out lalu ubah isinya di salinan. Try Out asli dan
          hasil siswa tidak berubah.
        </p>
      </div>
      <DuplicateTryoutDialog tryoutId={tryoutId} judul={tryout?.judul ?? "Try Out"} onDone={onDone}>
        <Button type="button" size="sm" className="shrink-0">
          <CopyIcon className="mr-1" /> Duplikat Try Out
        </Button>
      </DuplicateTryoutDialog>
    </div>
  );
}
