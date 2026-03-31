import { Image } from "@unpic/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PWATutorialDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function PWATutorialDialog({ open, onOpenChange }: PWATutorialDialogProps) {
	const [step, setStep] = useState(1);

	const nextStep = () => {
		if (step < 3) setStep(step + 1);
	};
	const prevStep = () => {
		if (step > 1) setStep(step - 1);
	};

	const steps = [
		{
			title: "Buka Menu Browser",
			description: "Ketuk ikon Bagikan (Safari/iOS) atau titik tiga (Chrome/Android).",
			image: "/images/dialog-1.png",
		},
		{
			title: 'Pilih "Tambah ke Layar Utama"',
			description: "Scroll ke bawah sampai kamu menemukan opsi tersebut di daftar menu.",
			image: "/images/dialog-2.png",
		},
		{
			title: "Konfirmasi & Selesai",
			description: 'Ketuk "Tambah" di pojok kanan atas untuk memunculkan shortcut.',
			image: "/images/dialog-3.png",
		},
	];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-[95vw] gap-0 overflow-hidden p-0 sm:max-w-114">
				<div className="p-6">
					<DialogHeader>
						<DialogTitle className="text-left font-bold text-xl">{steps[step - 1].title}</DialogTitle>

						<div className="mt-4 flex gap-2">
							{[1, 2, 3].map((i) => (
								<div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
									<div
										className={cn("h-full transition-all duration-300", step === i ? "w-full bg-[#3650A2]" : "w-0")}
									/>
								</div>
							))}
						</div>
					</DialogHeader>

					<div className="flex flex-col items-start gap-4 pt-6">
						<div className="relative aspect-408/160 w-full overflow-hidden rounded-md border border-slate-100 bg-slate-50">
							<Image src={steps[step - 1].image} layout="fullWidth" className="h-full w-full object-cover" />
						</div>
						<p className="text-left text-muted-foreground text-sm leading-relaxed">{steps[step - 1].description}</p>
					</div>
				</div>

				<DialogFooter className="flex flex-row items-center justify-end gap-3 p-4">
					<Button
						variant="outline"
						onClick={prevStep}
						className={cn(
							"h-10 border border-[#E4E4E7] bg-transparent px-6 font-medium text-slate-600 transition-opacity hover:border-[#E4E4E7] hover:bg-transparent hover:text-slate-600",
							step === 1 ? "pointer-events-none opacity-0" : "opacity-100",
						)}
					>
						Previous
					</Button>
					<Button
						onClick={() => (step === 3 ? onOpenChange(false) : nextStep())}
						className="h-10 bg-[#3650A2] px-6 font-medium text-white hover:bg-[#2e448a]"
					>
						{step === 3 ? "Finish" : "Continue"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
