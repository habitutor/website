import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { orpc } from "@/utils/orpc";

interface RevokePremiumDialogProps {
  user: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RevokePremiumDialog({ user, open, onOpenChange }: RevokePremiumDialogProps) {
  const queryClient = useQueryClient();
  const mutation = useMutation(
    orpc.admin.users.premium.update.mutationOptions({
      onSuccess: async () => {
        toast.success(`Premium access revoked from ${user.name}`);
        await queryClient.invalidateQueries({ queryKey: orpc.admin.users.list.queryKey({ input: {} }) });
        onOpenChange(false);
      },
      onError: (error) => toast.error("Failed to revoke premium access", { description: error.message }),
    }),
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke premium access?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{user.name}</strong> will immediately lose premium access. Their transaction history will not be
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
            isPending={mutation.isPending}
            onClick={() =>
              mutation.mutate({
                id: user.id,
                isPremium: false,
              })
            }
          >
            Revoke premium
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
