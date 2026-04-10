"use client";

import {
  BooksIcon,
  CaretRightIcon,
  ChatCircleIcon,
  FolderOpenIcon,
  HouseIcon,
  MegaphoneIcon,
  NotebookIcon,
  PackageIcon,
  QuestionIcon,
  SignOutIcon,
  TicketIcon,
  UserIcon,
  UserSwitchIcon,
} from "@phosphor-icons/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LogoutDialog } from "@/components/logout-dialog";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { getAvatarSrc } from "@/lib/avatar";
import { cn } from "@/lib/utils";

const adminNavGroups = [
  {
    name: "Content",
    icon: NotebookIcon,
    items: [
      {
        name: "Practice Packs",
        to: "/admin/practice-packs" as const,
        icon: PackageIcon,
      },
      {
        name: "Questions",
        to: "/admin/questions" as const,
        icon: QuestionIcon,
      },
      {
        name: "Dashboard Content",
        to: "/admin/dashboard-content" as const,
        icon: MegaphoneIcon,
      },
    ],
  },
  {
    name: "Management",
    icon: FolderOpenIcon,
    items: [
      {
        name: "Dashboard",
        to: "/admin/dashboard" as const,
        icon: HouseIcon,
      },
      {
        name: "Feedback",
        to: "/admin/feedback" as const,
        icon: ChatCircleIcon,
      },
      {
        name: "Classes",
        to: "/admin/classes" as const,
        icon: BooksIcon,
      },
      {
        name: "Users",
        to: "/admin/users" as const,
        icon: UserIcon,
      },
      {
        name: "Referral Transactions",
        to: "/admin/referrals" as const,
        icon: TicketIcon,
      },
    ],
  },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-0">
        <SidebarLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavGroups.map((group) => {
                const hasActiveChild = group.items.some((item) => location.pathname.startsWith(item.to));
                const GroupIcon = group.icon;

                return (
                  <Collapsible key={group.name} asChild defaultOpen={hasActiveChild} className="group/collapsible">
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={group.name}>
                          <GroupIcon className="size-5" />
                          <span>{group.name}</span>
                          <CaretRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {group.items.map((item) => {
                            const isActive = location.pathname.startsWith(item.to);
                            const Icon = item.icon;

                            return (
                              <SidebarMenuSubItem key={item.to}>
                                <SidebarMenuSubButton asChild isActive={isActive}>
                                  <Link to={item.to}>
                                    <Icon className="size-4" weight={isActive ? "fill" : "regular"} />
                                    <span>{item.name}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Other</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="User Dashboard">
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

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarUserProfile />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarLogout />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function SidebarLogout() {
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { state } = useSidebar();

  return (
    <>
      <SidebarMenuButton
        onClick={() => setLogoutDialogOpen(true)}
        tooltip={state === "collapsed" ? "Logout" : undefined}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <SignOutIcon className="size-5" />
        <span>Logout</span>
      </SidebarMenuButton>
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        redirectUrl="/login"
        description="Anda akan logout dari panel admin."
      />
    </>
  );
}

function SidebarUserProfile() {
  const { state } = useSidebar();
  const session = authClient.useSession();
  const user = session.data?.user;

  if (!user) return null;

  return (
    <div className="flex items-center gap-3 px-2 py-3">
      <Avatar className="size-8 shrink-0">
        <AvatarImage src={getAvatarSrc(user.image)} alt={user.name} />
        <AvatarFallback className="bg-primary/10 text-sm text-primary">
          {user.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {state !== "collapsed" && (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium">{user.name}</span>
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </div>
      )}
    </div>
  );
}

function SidebarLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className={cn("flex h-16 items-center", isCollapsed ? "justify-center" : "border-b px-4")}>
      <Link
        to="/admin/dashboard"
        className={cn(
          "flex items-center gap-2 text-lg font-bold text-primary",
          isCollapsed ? "justify-center" : "w-full",
        )}
        title="Habitutor Admin"
      >
        <Image
          src="/logo.svg"
          alt="Habitutor"
          layout="constrained"
          width={32}
          height={32}
          className="size-8 shrink-0"
        />
        {!isCollapsed && <span className="truncate">Habitutor Admin</span>}
      </Link>
    </div>
  );
}
