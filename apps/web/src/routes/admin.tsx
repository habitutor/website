import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { isAdminRole } from "@habitutor/shared/auth-domain";
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
    if (!isAdminRole(context.session.user.role))
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
  // Panel admin: hover tetap beranimasi, tetapi tombol/kartu tidak "memantul" saat diklik (lihat index.css).
  // Dipasang di <html> agar ikut berlaku pada dialog yang dirender lewat portal.
  useEffect(() => {
    document.documentElement.setAttribute("data-admin-calm", "");
    return () => document.documentElement.removeAttribute("data-admin-calm");
  }, []);

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-sidebar px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <AdminBreadcrumbs />
        </header>
        <div className="flex flex-1 flex-col overflow-auto p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
