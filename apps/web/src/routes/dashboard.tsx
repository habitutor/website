import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUser } from "@/functions/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getUser();
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function RouteComponent() {
  const { session } = Route.useRouteContext();

  const privateData = useQuery(orpc.privateData.queryOptions());

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 pt-20">
      <h1 className="font-bold text-lg">Dashboard</h1>
      <p>Welcome {session?.user.name}</p>
      <div className="flex flex-col gap-2 rounded-md border bg-background p-4">
        <h2 className="font-bold">API:</h2>
        {privateData.data?.message}
      </div>
    </div>
  );
}
