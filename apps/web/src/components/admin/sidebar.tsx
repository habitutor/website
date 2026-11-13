"use client";

import {
  BooksIcon,
  Broadcast,
  House,
  Megaphone,
  Package,
  Question,
  ReceiptIcon,
  SignOut,
  TagIcon,
  TicketIcon,
  User,
  VideoCameraIcon,
  UserSwitchIcon,
  CaretUp,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { motion } from "motion/react";
import { useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { getAvatarSrc } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const adminNavLinks = [
  {
    name: "Dashboard",
    to: "/admin/dashboard" as const,
    icon: House,
  },
  {
    name: "Try Out",
    to: "/admin/tryout" as const,
    icon: TicketIcon,
  },
  {
    name: "Practice Packs",
    to: "/admin/practice-packs" as const,
    icon: Package,
  },
  {
    name: "Bank Soal",
    to: "/admin/questions" as const,
    icon: Question,
  },
  {
    name: "Kelas",
    to: "/admin/classes" as const,
    icon: BooksIcon,
  },
  {
    name: "Live Class",
    to: "/admin/live-class" as const,
    icon: Broadcast,
  },
  {
    name: "Recordings",
    to: "/admin/recordings" as const,
    icon: VideoCameraIcon,
  },
  {
    name: "Pengumuman",
    to: "/admin/announcement" as const,
    icon: Megaphone,
  },
  {
    name: "Users",
    to: "/admin/users" as const,
    icon: User,
  },
  {
    name: "Referral Transactions",
    to: "/admin/referrals" as const,
    icon: TicketIcon,
  },
  {
    name: "Transactions",
    to: "/admin/transactions" as const,
    icon: ReceiptIcon,
  },
  {
    name: "Promo Codes",
    to: "/admin/promos" as const,
    icon: TagIcon,
  },
];

const workspaceLinks = adminNavLinks.slice(0, 8);
const businessLinks = adminNavLinks.slice(8);

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" variant="floating" className="border-sr-line bg-sidebar shadow-sr-2">
      <SidebarHeader className="p-0">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="gap-2 px-3 pt-5">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-[0.16em] text-sr-muted uppercase">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {workspaceLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                const Icon = link.icon;

                return (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.name}
                      className={cn(
                        "relative h-11 rounded-sr-sm px-3 text-sr-ink-2 transition-all duration-200 hover:translate-x-1 hover:bg-white hover:shadow-sr-1",
                        isActive && "bg-sr-blue-500 font-bold text-white shadow-sr-2 hover:bg-sr-blue-600",
                      )}
                    >
                      <Link to={link.to}>
                        {isActive && (
                          <motion.span
                            layoutId="admin-sidebar-active"
                            className="bg-sr-sun-300 absolute left-1 h-6 w-1 rounded-full"
                            transition={{ type: "spring", stiffness: 500, damping: 35 }}
                          />
                        )}
                        <motion.span whileHover={{ scale: 1.08 }} transition={{ duration: 0.15 }}>
                          <Icon className="size-5" weight={isActive ? "fill" : "regular"} />
                        </motion.span>
                        <span>{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="gap-2 px-3 pt-5">
          <SidebarGroupLabel className="px-3 text-[10px] font-bold tracking-[0.16em] text-sr-muted uppercase">
            Business
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {businessLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.to);
                const Icon = link.icon;
                return (
                  <SidebarMenuItem key={link.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.name}
                      className={cn(
                        "relative h-11 rounded-sr-sm px-3 text-sr-ink-2 transition-all duration-200 hover:translate-x-1 hover:bg-white hover:shadow-sr-1",
                        isActive && "bg-sr-blue-500 font-bold text-white shadow-sr-2 hover:bg-sr-blue-600",
                      )}
                    >
                      <Link to={link.to}>
                        {isActive && (
                          <motion.span
                            layoutId="admin-sidebar-active"
                            className="bg-sr-sun-300 absolute left-1 h-6 w-1 rounded-full"
                          />
                        )}
                        <Icon className="size-5" weight={isActive ? "fill" : "regular"} />
                        <span>{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="User Dashboard"
                  className="h-11 rounded-sr-sm px-3 text-sr-ink-2 transition-all hover:translate-x-1 hover:bg-white hover:shadow-sr-1"
                >
                  <Link to="/dashboard">
                    <UserSwitchIcon className="size-5" />
                    <span>User Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sr-line/70 bg-white/40 p-3">
        <SidebarMenu>
          <SidebarUserNav />
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function LogoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah anda yakin ingin keluar?</AlertDialogTitle>
          <AlertDialogDescription>Anda akan logout dari panel admin.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Kembali</AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault(); // Mencegah dialog tertutup sebelum proses selesai
              await authClient.signOut();
              queryClient.removeQueries();
              navigate({ to: "/login" });
            }}
            className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
          >
            <SignOut /> Keluar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SidebarUserNav() {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { state } = useSidebar();
  const session = authClient.useSession();
  const user = session.data?.user;

  if (!user) return null;

  return (
    <>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 shrink-0">
                <AvatarImage src={getAvatarSrc(user.image)} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-sm text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {state !== "collapsed" && (
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{user.name}</span>
                  <span className="truncate text-xs text-sr-muted">{user.email}</span>
                </div>
              )}
              {state !== "collapsed" && <CaretUp className="ml-auto size-4 shrink-0 opacity-50" />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={state === "collapsed" ? "right" : "top"}
            align="end"
            sideOffset={4}
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          >
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              onSelect={() => setLogoutDialogOpen(true)}
            >
              <SignOut className="mr-2 size-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </>
  );
}

function SidebarLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className={cn("flex h-20 items-center", isCollapsed ? "justify-center" : "border-b border-sr-line px-3 py-3")}>
      <Link
        to="/admin/dashboard"
        className={cn(
          "flex items-center gap-3 rounded-sr-md text-base font-bold text-primary transition-transform duration-200 hover:scale-[1.02]",
          isCollapsed ? "justify-center" : "w-full min-w-0 bg-sr-blue-50 px-3 py-2",
        )}
        title="Habitutor Admin"
      >
        <Image
          src="/logo.webp"
          alt="Habitutor"
          layout="constrained"
          width={32}
          height={32}
          className="size-9 shrink-0"
        />
        {!isCollapsed && <span className="whitespace-nowrap">Habitutor Admin</span>}
      </Link>
    </div>
  );
}
