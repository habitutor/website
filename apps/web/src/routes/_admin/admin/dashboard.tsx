import { createFileRoute } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/sidebar";
import { orpc } from "@/utils/orpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_admin/admin/dashboard")({
    component: AdminDashboard,
});

function AdminDashboard() {
    const { data: stats, isLoading } = useQuery(
        orpc.admin.practicePack.getStatistics.queryOptions()
    );

    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="ml-64 flex-1 p-8">
                <div className="mb-8">
                    <h1 className="font-bold text-3xl">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Selamat datang di panel admin Habitutor</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-muted-foreground text-sm">Total Users</h3>
                        {isLoading ? (
                            <Skeleton className="mt-2 h-10 w-20" />
                        ) : (
                            <p className="font-bold text-3xl">{stats?.totalUsers || 0}</p>
                        )}
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-muted-foreground text-sm">Practice Packs</h3>
                        {isLoading ? (
                            <Skeleton className="mt-2 h-10 w-20" />
                        ) : (
                            <p className="font-bold text-3xl">{stats?.totalPracticePacks || 0}</p>
                        )}
                    </div>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <h3 className="font-medium text-muted-foreground text-sm">Total Questions</h3>
                        {isLoading ? (
                            <Skeleton className="mt-2 h-10 w-20" />
                        ) : (
                            <p className="font-bold text-3xl">{stats?.totalQuestions || 0}</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}