import {
  ArrowRightIcon,
  BooksIcon,
  CrownIcon,
  ExamIcon,
  FilmStripIcon,
  HouseIcon,
  ListIcon,
  SignOutIcon,
  SparkleIcon,
  SpinnerIcon,
  UserCircleIcon,
  VideoCameraIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StreakIndicator } from "@/components/streak/streak-indicator";
import { authClient } from "@/lib/auth-client";
import { getAvatarSrc } from "@/lib/avatar";
import { shouldShowPremiumWhatsappInvite } from "@/lib/community-links";
import { WELCOME_VIDEO_ENABLED } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";

const links = [
  { name: "Dashboard", to: "/dashboard", icon: HouseIcon },
  { name: "Tryout", to: "/tryout", icon: ExamIcon },
  { name: "Kelas", to: "/classes", icon: BooksIcon },
  { name: "Live Class", to: "/live-class", icon: VideoCameraIcon },
  { name: "Live Recording", to: "/recordings", icon: FilmStripIcon },
  { name: "Premium", to: "/premium", icon: CrownIcon },
] as const;

export function HeaderDashboard({ session }: { session: typeof authClient.$Infer.Session | null }) {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard" || location.pathname === "/dashboard/";
  const { data: profile } = useQuery({
    ...orpc.profile.me.queryOptions(),
    enabled: isDashboard,
  });
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(getAvatarSrc(session?.user.image));
  const dashboardPopupPending =
    isDashboard &&
    (profile === undefined ||
      (WELCOME_VIDEO_ENABLED && !profile.hasSeenWelcomeVideo) ||
      shouldShowPremiumWhatsappInvite({ isPremium: session?.user.isPremium, profile }));

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

  const isActive = (to: string) => location.pathname.startsWith(to);
  const firstInitial = session?.user.name.charAt(0).toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {!session?.user.isPremium && !location.pathname.startsWith("/classes/") && (
        <div className="relative flex items-center justify-center gap-2 overflow-hidden bg-(image:--sr-grad-blue) p-2 text-sm font-medium text-white max-sm:flex-col max-sm:text-center sm:gap-4">
          <div className="pointer-events-none absolute -top-10 -left-6 size-28 animate-sr-drift rounded-full bg-white/10" />
          <span className="relative flex items-center gap-2">
            <SparkleIcon weight="fill" className="size-4 text-sr-sun-400" />
            Dapatkan Semua Fitur dan Akses
          </span>
          <Button variant="secondary" size="sm" className="sr-sheen relative" asChild>
            <Link to="/premium">
              Premium Sekarang <ArrowRightIcon weight="bold" />
            </Link>
          </Button>
        </div>
      )}
      <div className="flex h-20 flex-row items-center justify-between gap-6 border-b border-sr-line bg-white/85 px-6 shadow-sr-1 backdrop-blur-lg md:px-8">
        <Link to="/" className="relative size-12 shrink-0 transition-transform duration-300 hover:scale-105">
          <Image src="/logo.webp" alt="Habitutor Logo" layout="fullWidth" className="pointer-events-none select-none" />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-sr-line bg-sr-blue-50/80 p-1 lg:flex">
          {links.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors xl:px-4",
                  active ? "text-sr-blue-600" : "text-sr-ink-2 hover:text-sr-blue-600",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="dashboard-nav-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sr-1"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {session && <StreakIndicator autoOpenBlocked={dashboardPopupPending} />}
          <div className="hidden md:flex md:items-center md:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-0.5 transition-shadow hover:shadow-sr-2">
                {session?.user.isPremium && <PremiumBadge />}
                <Avatar className="ring-2 ring-sr-blue-100">
                  <AvatarImage src={avatarSrc} alt="User Profile Picture" />
                  <AvatarFallback>{firstInitial}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-sr-sm">
                <DropdownMenuLabel>{session?.user.name}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserCircleIcon />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => setOpen(true)}>
                  <SignOutIcon />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-sr-ink lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka menu"
          >
            <ListIcon weight="bold" className="size-6" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-sr-ink/30 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="fixed inset-x-0 top-0 z-50 flex max-h-dvh flex-col overflow-y-auto rounded-b-sr-xl bg-sr-ivory p-6 shadow-sr-3 lg:hidden"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <div className="flex items-center justify-between">
                <Link to="/" className="relative size-12" onClick={() => setMobileMenuOpen(false)}>
                  <Image
                    src="/logo.webp"
                    alt="Habitutor Logo"
                    layout="fullWidth"
                    className="pointer-events-none select-none"
                  />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-sr-ink"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Tutup menu"
                >
                  <XIcon weight="bold" className="size-6" />
                </Button>
              </div>

              <div className="mt-5 flex items-center gap-3 rounded-sr-md border border-sr-line bg-white p-3 shadow-sr-1">
                <Avatar className="ring-2 ring-sr-blue-100">
                  <AvatarImage src={avatarSrc} alt="User Profile Picture" />
                  <AvatarFallback>{firstInitial}</AvatarFallback>
                </Avatar>
                <span className="min-w-0 flex-1 truncate font-bold text-sr-ink">{session?.user.name}</span>
                {session?.user.isPremium && <PremiumBadge />}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {mobileLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "flex items-center gap-3 rounded-sr-sm border px-3 py-3 font-semibold transition-colors",
                        active
                          ? "border-transparent bg-sr-blue-500 text-white shadow-sr-2"
                          : "border-sr-line bg-white text-sr-ink hover:border-sr-blue-200 hover:bg-sr-blue-50",
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon weight={active ? "fill" : "duotone"} className="size-5 shrink-0" />
                      <span className="truncate text-sm">{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              <Button
                variant="destructive"
                className="mt-6 w-full rounded-sr-sm"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setOpen(true);
                }}
              >
                <SignOutIcon weight="bold" />
                Log Out
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LogoutDialog open={open} onOpenChange={setOpen} />
    </header>
  );
}

const mobileLinks = [...links, { name: "Profil", to: "/profile", icon: UserCircleIcon }] as const;

const PremiumBadge = () => (
  <Badge className="gap-1 border-0 bg-(image:--sr-grad-sun) text-sr-ink shadow-sr-sun">
    <CrownIcon weight="fill" />
    Premium
  </Badge>
);

const LogoutDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin ingin keluar?</AlertDialogTitle>
          <AlertDialogDescription>Kamu akan dikeluarkan dan harus login kembali.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Kembali</AlertDialogCancel>
          <Button
            onClick={async () => {
              setPending(true);
              await authClient.signOut();
              queryClient.removeQueries();
              navigate({ to: "/" });
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
                <SignOutIcon weight="bold" /> Keluar
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
