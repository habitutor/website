import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/_admin/admin")({
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<SidebarProvider>
			<AdminSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2 px-4 lg:px-0">
						<SidebarTrigger className="-ml-1" />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0 lg:p-0 lg:pt-0">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
