import { SignOutIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectUrl?: string;
  description?: string;
}

export function LogoutDialog({
  open,
  onOpenChange,
  redirectUrl = "/",
  description = "Kamu akan dikeluarkan dan harus login kembali.",
}: LogoutDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin ingin keluar?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Kembali</AlertDialogCancel>
          <Button
            onClick={async () => {
              setPending(true);
              await authClient.signOut();
              queryClient.removeQueries();
              navigate({ to: redirectUrl });
              setPending(false);
            }}
            disabled={pending}
            variant="destructive"
          >
            {pending ? (
              <>
                <SpinnerIcon className="animate-spin" />
                Memasak...
              </>
            ) : (
              <>
                <SignOutIcon weight="bold" /> Keluar
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
