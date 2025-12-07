import { Link, useLocation, useRouterState } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { authClient } from "@/lib/auth-client";

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

export default function HeaderDashboard() {
  const location = useLocation();
  const session = authClient.useSession();

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

      <Avatar>
        <AvatarImage
          src={session.data?.user.image as string}
          alt="User Profile Picture"
        />
        <AvatarFallback>{session.data?.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
    </div>
  );
}
