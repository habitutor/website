import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

interface User {
	id: string;
	name: string;
	isPremium: boolean | null;
}

interface ConfirmPremiumDialogProps {
	user: User;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	selectedDate: Date | undefined;
	onSuccess: () => void;
}

export function ConfirmPremiumDialog({ user, open, onOpenChange, selectedDate, onSuccess }: ConfirmPremiumDialogProps) {
	const queryClient = useQueryClient();
	const isPremium = user.isPremium ?? false;

	const mutation = useMutation(
		orpc.admin.users.updateUserPremium.mutationOptions({
			onSuccess: () => {
				toast.success(isPremium ? `Premium status updated for ${user.name}` : `Premium granted to ${user.name}`);
				queryClient.invalidateQueries({
					queryKey: orpc.admin.users.listUsers.queryKey({ input: {} }),
				});
				onSuccess();
			},
			onError: (error) => {
				toast.error("Failed to update premium status", {
					description: error.message,
				});
			},
		}),
	);

	const handleConfirm = () => {
		if (!selectedDate) return;

		mutation.mutate({
			id: user.id,
			isPremium: true,
			premiumExpiresAt: selectedDate.toISOString(),
		});
	};

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Confirm Premium Update</AlertDialogTitle>
					<AlertDialogDescription>
						{isPremium ? (
							<>
								Are you sure you want to update the premium status for <strong>{user.name}</strong>?
								<br />
								<br />
								New expiry date: <strong>{selectedDate ? format(selectedDate, "PPP") : "-"}</strong>
							</>
						) : (
							<>
								Are you sure you want to grant premium access to <strong>{user.name}</strong>?
								<br />
								<br />
								Expiry date: <strong>{selectedDate ? format(selectedDate, "PPP") : "-"}</strong>
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => onOpenChange(false)}>Cancel</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button onClick={handleConfirm} disabled={mutation.isPending}>
							{mutation.isPending ? "Updating..." : "Confirm"}
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
