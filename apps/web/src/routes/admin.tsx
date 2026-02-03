import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AdminBreadcrumbs } from "@/components/admin/dashboard-layout";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { $getSession } from "@/lib/get-user";
import { createMeta } from "@/lib/seo-utils";

export const Route = createFileRoute("/admin")({
	head: () => ({
		meta: createMeta({
			title: "Admin",
			description: "Panel admin untuk mengelola konten Habitutor.",
			noIndex: true,
		}),
	}),
	beforeLoad: async ({ context, preload }) => {
		if (preload) return;
		const { session } = await $getSession(context.queryClient);

		return { session };
	},
	loader: ({ location, context }) => {
		if (!context.session)
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		if (context.session.user.role !== "admin")
			throw redirect({
				to: "/dashboard",
				search: {
					redirect: location.href,
				},
			});
	},
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<SidebarProvider>
			<AdminSidebar />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-4 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<SidebarTrigger />
					<AdminBreadcrumbs />
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
