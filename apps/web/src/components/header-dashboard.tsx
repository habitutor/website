import { Link, useLocation } from "@tanstack/react-router";
import type { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const links = [
  {
    name: "Dashboard",
    to: "/dashboard",
  },
  {
    name: "Kelas",
    to: "/dashboard#2",
  },
  {
    name: "Tryout",
    to: "/dashboard#4",
  },
  {
    name: "Premium",
    to: "/dashboard#5",
  },
] as const;

export function HeaderDashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session | null;
}) {
  const location = useLocation();

  return (
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
            <AvatarFallback>{session?.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem variant="destructive">Log Out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
