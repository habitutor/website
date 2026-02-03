import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface User {
	id: string;
	name: string;
	isPremium: boolean | null;
}

interface ManagePremiumDialogProps {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedDate: Date | undefined;
	onDateChange: (date: Date | undefined) => void;
	onConfirm: () => void;
}

export function ManagePremiumDialog({
	user,
	open,
	onOpenChange,
	selectedDate,
	onDateChange,
	onConfirm,
}: ManagePremiumDialogProps) {
	const isPremium = user.isPremium ?? false;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>{isPremium ? "Manage Premium" : "Grant Premium"}</DialogTitle>
					<DialogDescription>
						{isPremium ? `Update premium status for ${user.name}` : `Grant premium access to ${user.name}`}
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="space-y-2">
						<span className="font-medium text-sm">Premium Expiry Date</span>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
								>
									{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-auto p-0" align="start">
								<Calendar
									mode="single"
									selected={selectedDate}
									onSelect={onDateChange}
									initialFocus
									fromDate={new Date()}
								/>
							</PopoverContent>
						</Popover>
						<p className="text-muted-foreground text-xs">
							{isPremium
								? "Select a new expiry date to extend or modify premium access."
								: "Select an expiry date for the premium access."}
						</p>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={onConfirm} disabled={!selectedDate}>
						Continue
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
