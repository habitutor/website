import { ArrowRightIcon, ListIcon, SignOutIcon, UserIcon, XIcon } from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { getAvatarSrc } from "@/lib/avatar";
import { LogoutDialog } from "@/components/logout-dialog";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(getAvatarSrc(session?.user.image));

  useEffect(() => {
    setAvatarSrc(getAvatarSrc(session?.user.image));
  }, [session?.user.image]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ src?: string; image?: string }>;
      if (customEvent.detail?.src) {
        setAvatarSrc(customEvent.detail.src);
        return;
      }

      if (customEvent.detail?.image) {
        setAvatarSrc(getAvatarSrc(customEvent.detail.image));
      }
    };

    window.addEventListener("avatarChanged", handler as EventListener);
    return () => {
      window.removeEventListener("avatarChanged", handler as EventListener);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {!session?.user.isPremium && (
        <div className="flex items-center justify-center gap-2 bg-primary-200 p-2 text-white max-sm:flex-col max-sm:text-center sm:gap-4">
          Dapatkan Semua Fitur dan Akses
          <Button variant="default" size={"sm"} asChild>
            <Link to="/premium">
              Premium Sekarang <ArrowRightIcon />
            </Link>
          </Button>
        </div>
      )}
      <div className="flex h-20 flex-row items-center justify-between gap-8 rounded-lg border-b-2 border-accent bg-white px-6 backdrop-blur-lg md:px-8">
        <Link to="/" className="relative size-12">
          <Image src="/logo.svg" alt="Habitutor Logo" layout="fullWidth" className="pointer-events-none select-none" />
        </Link>

        <div className="hidden h-full items-center md:flex">
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

        <div className="hidden md:flex md:items-center md:gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2">
              {session?.user.isPremium && (
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  Premium
                </Badge>
              )}
              <Avatar>
                <AvatarImage src={avatarSrc} alt="User Profile Picture" />
                <AvatarFallback>{session?.user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-50">
              <DropdownMenuLabel>{session?.user.name}</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link to="/profile">
                  <UserIcon />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}>
                <SignOutIcon />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(true)}>
          <ListIcon className="size-6" />
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-0 z-50 flex flex-col bg-white p-6 shadow-lg md:hidden">
          <div className="flex items-center justify-between">
            <Link to="/" className="relative size-12" onClick={() => setMobileMenuOpen(false)}>
              <Image
                src="/logo.svg"
                alt="Habitutor Logo"
                layout="fullWidth"
                className="pointer-events-none select-none"
              />
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <XIcon className="size-6" />
            </Button>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-md px-4 py-3 text-lg font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <div className="mb-4 flex items-center gap-3 px-4">
              <Avatar>
                <AvatarImage src={avatarSrc} alt="User Profile Picture" />
                <AvatarFallback>{session?.user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{session?.user.name}</span>
              {session?.user.isPremium && (
                <Badge variant="default" className="bg-primary text-primary-foreground">
                  Premium
                </Badge>
              )}
            </div>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => {
                setMobileMenuOpen(false);
                setOpen(true);
              }}
            >
              <SignOutIcon className="mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      )}

      <LogoutDialog open={open} onOpenChange={setOpen} />
    </header>
  );
}
