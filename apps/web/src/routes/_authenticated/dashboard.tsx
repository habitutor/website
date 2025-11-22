import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session } = authClient.useSession();

  return (
    <>
      <h1 className="font-bold text-lg">Dashboard</h1>

      <p>Welcome {session?.user.name}</p>

      <div className="flex flex-col gap-2 rounded-md border bg-background p-4">
        <h2 className="font-bold">API:</h2>
      </div>
    </>
  );
}
