import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { orpc } from "@/utils/orpc";
import { EMPTY_EVENT_FORM, EventForm, toEventPayload } from "./-components/event-form";

export const Route = createFileRoute("/admin/ptntour/create")({ component: CreatePtnTourPage });

function CreatePtnTourPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const create = useMutation(
    orpc.ptnTour.admin.create.mutationOptions({
      onSuccess: async (event) => {
        await queryClient.invalidateQueries({ queryKey: orpc.ptnTour.admin.list.queryKey() });
        toast.success("Event berhasil dibuat", { description: "Tambahkan materi dan bonus dari halaman edit." });
        navigate({ to: "/admin/ptntour/$id", params: { id: String(event.id) } });
      },
      onError: (error) => toast.error("Gagal membuat event", { description: error.message }),
    }),
  );

  return (
    <AdminContainer>
      <AdminHeader
        title="Buat Event"
        description="Isi informasi event gratis yang akan ditayangkan"
        backTo="/admin/ptntour"
      />
      <EventForm
        mode="create"
        initial={EMPTY_EVENT_FORM}
        submitting={create.isPending}
        onSubmit={(values) => create.mutate(toEventPayload(values))}
        onCancel={() => navigate({ to: "/admin/ptntour" })}
      />
    </AdminContainer>
  );
}
