import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TITLE_TEXT = `
 █████╗ ███╗   ██╗██████╗ ██████╗ ███████╗
██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔════╝
███████║██╔██╗ ██║██║  ██║██████╔╝█████╗  
██╔══██║██║╚██╗██║██║  ██║██╔══██╗██╔══╝  
██║  ██║██║ ╚████║██████╔╝██║  ██║███████╗
╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝╚══════╝
`;

function HomeComponent() {
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());
  const greet = useMutation(
    orpc.greet.mutationOptions({
      onSuccess: () => {
        toast("bisa");
      },
      onError: () => {
        toast.error("peler");
      },
    }),
  );
  const users = useQuery(orpc.users.queryOptions());

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2 pt-20">
      <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
      <div className="grid gap-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">API Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${healthCheck.data ? "bg-green-500" : "bg-red-500"}`}
            />
            <span className="text-muted-foreground text-sm">
              {healthCheck.isLoading
                ? "Checking..."
                : healthCheck.data
                  ? "Connected"
                  : "Disconnected"}
            </span>
          </div>
        </section>
        <section className="rounded-lg border p-4">
          <h2 className="mb-2 font-medium">Contoh Query DB</h2>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">
              {users.isLoading
                ? "Checking..."
                : users.data
                  ? users.data.map((user) => `${user.name}, `)
                  : users.isError
                    ? "Disconnected"
                    : "No users found"}
            </span>
          </div>
        </section>
      </div>

      <Button
        onClick={() => {
          greet.mutate({ name: "andre" });
        }}
      >
        greet
      </Button>
    </div>
  );
}
