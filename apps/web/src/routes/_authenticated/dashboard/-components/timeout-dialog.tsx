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
				<div className="flex flex-col items-start rounded-[8px] bg-white py-[24px] pr-[36px] pl-[24px]">
					<div className="flex flex-col items-end justify-center gap-[27px]">
						<div className="flex flex-col items-start gap-[16px]">
							<div className="flex items-center justify-center">
								<p className="whitespace-nowrap font-bold text-[#18181b] text-[18px]">Waktu Habis!</p>
							</div>
							<div className="flex items-center justify-center">
								<p className="whitespace-nowrap font-medium text-[#71717a] text-[12px]">
									Ups, waktu habis, yuk cek hasil flashcard
								</p>
							</div>
						</div>
						<div className="flex items-start gap-[8px]">
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="relative flex h-[41px] w-[77px] cursor-pointer items-center justify-center rounded-[6px] px-[16px] py-[12px] transition-colors hover:bg-gray-50"
							>
								<div className="pointer-events-none absolute inset-0 rounded-[6px] border border-[#e4e4e7]" />
								<p className="whitespace-nowrap font-medium text-[#18181b] text-[14px]">Batal</p>
							</button>
							<button
								type="button"
								onClick={handleFinish}
								className="flex cursor-pointer items-center justify-center rounded-[6px] bg-[#3650a2] px-[16px] py-[12px] transition-colors hover:bg-[#2d4082]"
							>
								<p className="whitespace-nowrap font-medium text-[14px] text-white">Selesai</p>
							</button>
						</div>
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
