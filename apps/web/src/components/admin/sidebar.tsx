"use client";

import { BooksIcon, House, Package, Question, SignOut, User, UserSwitchIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Image } from "@unpic/react";
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
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const adminNavLinks = [
	{
		name: "Dashboard",
		to: "/admin/dashboard" as const,
		icon: House,
	},
	{
		name: "Practice Packs",
		to: "/admin/practice-packs" as const,
		icon: Package,
	},
	{
		name: "Questions",
		to: "/admin/questions" as const,
		icon: Question,
	},
	{
		name: "Classes",
		to: "/admin/classes" as const,
		icon: BooksIcon,
	},
	{
		name: "Users",
		to: "/admin/users" as const,
		icon: User,
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
							{adminNavLinks.map((link) => {
								const isActive = location.pathname.startsWith(link.to);
								const Icon = link.icon;

								return (
									<SidebarMenuItem key={link.to}>
										<SidebarMenuButton asChild isActive={isActive} tooltip={link.name}>
											<Link to={link.to}>
												<Icon className="size-5" weight={isActive ? "fill" : "regular"} />
												<span>{link.name}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
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
					<AlertDialogAction asChild>
						<Button
							onClick={async () => {
								await authClient.signOut();
								queryClient.removeQueries();
								navigate({ to: "/login" });
							}}
							variant="destructive"
						>
							<SignOut /> Keluar
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
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
				<SignOut className="size-5" />
				<span>Logout</span>
			</SidebarMenuButton>
			<LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
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
				<AvatarImage src={user.image ?? undefined} alt={user.name} />
				<AvatarFallback className="bg-primary/10 text-primary text-sm">
					{user.name.charAt(0).toUpperCase()}
				</AvatarFallback>
			</Avatar>
			{state !== "collapsed" && (
				<div className="flex min-w-0 flex-col">
					<span className="truncate font-medium text-sm">{user.name}</span>
					<span className="truncate text-muted-foreground text-xs">{user.email}</span>
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
					"flex items-center gap-2 font-bold text-lg text-primary",
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
