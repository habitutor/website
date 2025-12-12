import { useState } from "react";
import { SignOut } from "@phosphor-icons/react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
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
    name: "Tryout",
    to: "/tryouts",
  },
  {
    name: "Premium",
    to: "/premium",
  },
] as const;

export function HeaderDashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session | null;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 top-0 flex h-20 flex-row items-center justify-between gap-8 rounded-lg border-accent border-b-2 bg-white px-6 backdrop-blur-lg md:px-8">
        <Link to="/" className="text-primary">
          logo
        </Link>

        <div className="flex h-full items-center">
          {links.map((link) => (
            <Button
              key={link.to}
              variant={"navbar"}
              size={"full"}
              data-active={location.pathname === link.to ? "true" : "false"}
              asChild
            >
              <Link to={link.to}>{link.name}</Link>
            </Button>
          ))}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage
                src={session?.user.image as string}
                alt="User Profile Picture"
              />
              <AvatarFallback>
                {session?.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{session?.user.name}</DropdownMenuLabel>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setOpen(true)}
            >
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

const LogoutDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const navigate = useNavigate();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin ingin keluar?</AlertDialogTitle>
          <AlertDialogDescription>
            Kamu akan logout dan harus masuk lagi. Andre tolong rapihin
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Kembali</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={async () => {
                await authClient.signOut().then(() => {
                  navigate({ to: "/" });
                });
              }}
              variant={"destructive"}
            >
              <SignOut /> Keluar
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
