import { ListIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";

import { useIsBreakpoint } from "@/hooks/use-is-breakpoint";
import { authClient } from "@/lib/auth-client";
import { DATA } from "@/routes/-home/data";

import { Button } from "./ui/button";

export default function Header() {
  const session = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsBreakpoint("max", 768);

  const menuItems = session.data?.user ? (
    <>
      <Button variant={"outline"} className="w-full border-0 md:w-auto" asChild>
        <Link to="/home-premium">Premium</Link>
      </Button>
      {session.data.user.role === "admin" && (
        <Button variant={"default"} className="w-full md:w-auto" asChild>
          <Link to="/admin/dashboard">Admin</Link>
        </Button>
      )}
      <Button variant={"outline"} className="w-full md:w-auto" asChild>
        <Link to="/dashboard">Lanjut Belajar</Link>
      </Button>
    </>
  ) : (
    <>
      <Button variant={"outline"} className="w-full border-0 md:w-auto" asChild>
        <Link to="/home-premium">Premium</Link>
      </Button>
      <Button variant={"outline"} className="w-full md:w-auto" asChild>
        <a href={DATA.footer.socials[2].url}>
          <WhatsappLogoIcon />
          Hubungi Kami
        </a>
      </Button>
      <Button variant={"default"} className="w-full md:w-auto" asChild>
        <Link to="/login">Coba Gratis</Link>
      </Button>
    </>
  );

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 flex h-20 flex-row items-center justify-between gap-8 border-b border-neutral-300 bg-white px-6 backdrop-blur-lg md:rounded-lg md:px-8">
        <Link to="/" className="relative size-12 text-primary">
          <Image
            src={"/logo.svg"}
            alt="Logo Habitutor"
            layout="fullWidth"
            className="pointer-events-none select-none"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden items-center gap-2 md:flex">{menuItems}</div>

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
            <ListIcon weight="bold" className="size-6" />
          </Button>
        )}
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobile && isOpen && (
        <div className="fixed inset-x-0 top-20 z-40 mx-1 animate-in rounded-b-lg border border-t-0 border-neutral-300 bg-white shadow-lg duration-300 fade-in slide-in-from-top-2">
          <div className="flex flex-col gap-2 p-4 text-center">{menuItems}</div>
        </div>
      )}
    </>
  );
}
