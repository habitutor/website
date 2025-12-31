import { SignOut, SpinnerIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
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
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const links = [
  {
    name: "Dashboard",
    to: "/dashboard",
  },
  {
    name: "Kelas",
    to: "/classes",
  },
  {
    name: "Premium",
    to: "/premium",
  },
] as const;

export function HeaderDashboard({ session }: { session: typeof authClient.$Infer.Session | null }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex h-20 flex-row items-center justify-between gap-8 rounded-lg border-accent border-b-2 bg-white px-6 backdrop-blur-lg md:px-8">
        <Link to="/" className="relative size-12">
          <Image src="/logo.svg" alt="Habitutor Logo" layout="fullWidth" className="pointer-events-none select-none" />
        </Link>

        <div className="flex h-full items-center">
          {links.map((link) => (
            <Button
              key={link.to}
              variant={"navbar"}
              size={"full"}
              data-active={location.pathname.startsWith(link.to) ? "true" : "false"}
              asChild
            >
              <Link to={link.to}>{link.name}</Link>
            </Button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src={session?.user.image as string} alt="User Profile Picture" />
              <AvatarFallback>{session?.user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{session?.user.name}</DropdownMenuLabel>
            <DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}>
              <SignOut />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <LogoutDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

const LogoutDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin ingin keluar?</AlertDialogTitle>
          <AlertDialogDescription>Kamu akan logout dan harus masuk lagi. Andre tolong rapihin</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Kembali</AlertDialogCancel>
          <Button
            onClick={async () => {
              setPending(true);
              await authClient.signOut().then(() => {
                navigate({ to: "/" });
              });
              queryClient.removeQueries();
              setPending(false);
            }}
            disabled={pending}
            variant={"destructive"}
          >
            {pending ? (
              <>
                <SpinnerIcon className="animate-spin" />
                Memasak...
              </>
            ) : (
              <>
                <SignOut /> Keluar
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
