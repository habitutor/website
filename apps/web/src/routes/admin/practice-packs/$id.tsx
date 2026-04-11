import { MagnifyingGlassIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AdminContainer } from "@/components/admin/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { orpc } from "@/utils/orpc";
import { AddExistingQuestionModal } from "./-components/add-existing-modal";
import { CreateQuestionForm } from "./-components/create-question-form";
import { PackInfoHeader } from "./-components/pack-info-header";
import { QuestionsList } from "./-components/questions-list";

export const Route = createFileRoute("/admin/practice-packs/$id")({
  staticData: {
    breadcrumb: [
      { label: "Practice Packs", href: "/admin/practice-packs" },
      { label: "Pack Detail", href: "" },
    ],
  },
  component: PracticePackDetailPage,
});

function PracticePackDetailPage() {
  const { id } = Route.useParams();
  const packId = Number.parseInt(id, 10);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddExisting, setShowAddExisting] = useState(false);

  const { data } = useQuery(
    orpc.admin.practicePack.question.list.queryOptions({
      input: { id: packId },
    }),
  );

  const existingQuestionIds = data?.questions?.map((q) => q.id) || [];

  if (Number.isNaN(packId)) throw notFound();

  return (
    <AdminContainer>
      <div className="space-y-6 sm:space-y-8">
        <PackInfoHeader packId={packId} backTo="/admin/practice-packs" />

        <div className="space-y-4">
          <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-center gap-4 text-xl font-bold tracking-tight sm:text-2xl">
              Questions ({data?.questions?.length || 0})
            </h2>
            {data?.questions && data.questions.length > 0 && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={() => setShowAddExisting(true)}
                  variant="lightBlue"
                  className="gap-2 text-xs sm:text-sm"
                >
                  <MagnifyingGlassIcon className="size-3.5 sm:size-4" />
                  Tambah Soal
                </Button>
                <Button onClick={() => setShowCreateForm(true)} className="gap-2 text-xs shadow-sm sm:text-sm">
                  <PlusIcon className="size-3.5 sm:size-4" />
                  Buat Soal Baru
                </Button>
              </div>
            )}
          </div>

          <AddExistingQuestionModal
            practicePackId={packId}
            existingQuestionIds={existingQuestionIds}
            open={showAddExisting}
            onOpenChange={setShowAddExisting}
          />

          <Sheet open={showCreateForm} onOpenChange={setShowCreateForm}>
            <SheetContent side="right" className="overflow-y-auto sm:max-w-xl">
              <CreateQuestionForm
                practicePackId={packId}
                onSuccess={() => setShowCreateForm(false)}
                onCancel={() => setShowCreateForm(false)}
              />
            </SheetContent>
          </Sheet>

          <QuestionsList
            packId={packId}
            onCreateNew={() => setShowCreateForm(true)}
            onAddExisting={() => setShowAddExisting(true)}
          />
        </div>
      </div>
    </AdminContainer>
  );
}
