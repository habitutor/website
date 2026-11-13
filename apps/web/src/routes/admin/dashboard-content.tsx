import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/dashboard-content")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/live-class", replace: true });
  },
});
