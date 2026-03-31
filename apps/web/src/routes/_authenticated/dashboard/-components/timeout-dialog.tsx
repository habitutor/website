import { useNavigate } from "@tanstack/react-router";
import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";

export function TimeoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();

  const handleFinish = () => {
    onOpenChange(false);
    navigate({ to: "/dashboard/flashcard/result" });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-fit max-w-none border-none p-0 shadow-lg">
        <div className="flex flex-col items-start rounded-xl bg-white py-6 pr-9 pl-6">
          <div className="flex flex-col items-end justify-center gap-6.75">
            <div className="flex flex-col items-start gap-4">
              <div className="flex items-center justify-center">
                <p className="text-[18px] font-bold whitespace-nowrap text-[#18181b]">Waktu Habis!</p>
              </div>
              <div className="flex items-center justify-center">
                <p className="text-[12px] font-medium whitespace-nowrap text-[#71717a]">
                  Ups, waktu habis, yuk cek hasil flashcard
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="relative flex h-10.25 w-19.25 cursor-pointer items-center justify-center rounded-[6px] px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <div className="pointer-events-none absolute inset-0 rounded-[6px] border border-[#e4e4e7]" />
                <p className="text-[14px] font-medium whitespace-nowrap text-[#18181b]">Batal</p>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex cursor-pointer items-center justify-center rounded-[6px] bg-primary-300 px-4 py-3 transition-colors hover:bg-[#2d4082]"
              >
                <p className="text-[14px] font-medium whitespace-nowrap text-white">Selesai</p>
              </button>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
