import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { getUser } from "@/lib/get-user";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/latihan-soal/")({
  beforeLoad: async () => {
    const session = await getUser();

    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session)
      throw redirect({
        to: "/login",
      });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const packs = useQuery(orpc.practicePack.list.queryOptions());

  const startMutation = useMutation(
    orpc.practicePack.startAttempt.mutationOptions({
      onSuccess: (data, pack) => {
        toast.success(data.message);
        navigate({
          to: "/latihan-soal/$id",
          params: { id: pack.practicePackId },
        });
      },
      onError: (data) => {
        toast.error("Error", {
          description: () => <p>{data.message}</p>,
        });
      },
    }),
  );

  return (
    <Container className="pt-20">
      <h1 className="mb-6 font-bold text-2xl">Latihan Soal</h1>

      <div className="space-y-4">
        {packs.isLoading && (
          <p className="animate-pulse">Memasak Nasi Custom...</p>
        )}

        {packs.isError && (
          <p className="text-red-500">Error: {packs.error.message}</p>
        )}

        {packs.data && packs.data.length === 0 && (
          <p className="text-muted-foreground">No packs yet</p>
        )}

        <div className="grid grid-cols-3 gap-2">
          {packs.data?.map((pack) => (
            <Card key={pack.id} className="p-4">
              <div className="flex flex-col justify-between gap-4">
                <h3 className="font-medium text-lg">{pack.title}</h3>
                <Button
                  type="button"
                  variant={"secondary"}
                  className="flex-1"
                  onClick={() =>
                    startMutation.mutate({
                      practicePackId: pack.id,
                    })
                  }
                  disabled={startMutation.isPending}
                >
                  <Eye />
                  {startMutation.isPending ? "Starting..." : "Lihat"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
