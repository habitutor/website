import { createFileRoute } from "@tanstack/react-router";
import { DashboardContentAdminPage } from "./-components/dashboard-content-admin-page";

export const Route = createFileRoute("/admin/dashboard-content")({
  staticData: { breadcrumb: "Dashboard Content" },
  component: DashboardContentAdminPage,
});
