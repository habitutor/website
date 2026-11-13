import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout rute event: halaman edit ($id.index) dan peserta ($id.participants) tampil lewat Outlet.
export const Route = createFileRoute("/admin/ptntour/$id")({ component: () => <Outlet /> });
