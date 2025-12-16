import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/sidebar";

export const Route = createFileRoute("/_admin/admin/dashboard")({
    component: AdminDashboard,
});

function AdminDashboard() {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="ml-64 flex-1 p-8">
                <div className="mb-8">
                    <h1 className="font-bold text-3xl">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Selamat datang di panel admin Habitutor</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-muted-foreground text-sm">Total Users</h3>
                        <p className="font-bold text-3xl">-</p>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-muted-foreground text-sm">Practice Packs</h3>
                        <p className="font-bold text-3xl">-</p>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-muted-foreground text-sm">Total Questions</h3>
                        <p className="font-bold text-3xl">-</p>
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-muted-foreground text-sm">Active Sessions</h3>
                        <p className="font-bold text-3xl">-</p>
                    </div>
                </div>
            </main>
        </div>
    );
}