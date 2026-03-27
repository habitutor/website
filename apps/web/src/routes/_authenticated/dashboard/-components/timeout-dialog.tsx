import { useNavigate } from "@tanstack/react-router";
import {
	AlertDialog,
	AlertDialogContent,
} from "@/components/ui/alert-dialog";

export function TimeoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
	const navigate = useNavigate();

	const handleFinish = () => {
		onOpenChange(false);
		navigate({ to: "/dashboard/flashcard/result" });
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent className="p-0 w-fit max-w-none border-none shadow-lg">
				<div className="bg-white flex flex-col items-start pl-[24px] pr-[36px] py-[24px] rounded-[8px]">
					<div className="flex flex-col gap-[27px] items-end justify-center">
						<div className="flex flex-col gap-[16px] items-start">
							<div className="flex items-center justify-center">
								<p className="font-bold text-[#18181b] text-[18px] whitespace-nowrap">Waktu Habis!</p>
							</div>
							<div className="flex items-center justify-center">
								<p className="font-medium text-[#71717a] text-[12px] whitespace-nowrap">
									Ups, waktu habis, yuk cek hasil flashcard
								</p>
							</div>
						</div>
						<div className="flex gap-[8px] items-start">
							<button
								type="button"
								onClick={() => onOpenChange(false)}
								className="relative flex h-[41px] items-center justify-center px-[16px] py-[12px] rounded-[6px] w-[77px] cursor-pointer hover:bg-gray-50 transition-colors"
							>
								<div className="absolute border border-[#e4e4e7] inset-0 pointer-events-none rounded-[6px]" />
								<p className="font-medium text-[#18181b] text-[14px] whitespace-nowrap">Batal</p>
							</button>
							<button
								type="button"
								onClick={handleFinish}
								className="bg-[#3650a2] flex items-center justify-center px-[16px] py-[12px] rounded-[6px] cursor-pointer hover:bg-[#2d4082] transition-colors"
							>
								<p className="font-medium text-[14px] text-white whitespace-nowrap">Selesai</p>
							</button>
						</div>
					</div>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}