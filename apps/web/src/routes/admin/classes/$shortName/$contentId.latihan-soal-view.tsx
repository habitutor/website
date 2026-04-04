import { CaretUpDown, Check, MagnifyingGlass } from "@phosphor-icons/react";
import { AdminContainer, AdminHeader } from "@/components/admin/dashboard-layout";
import { TiptapRenderer } from "@/components/tiptap/renderer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";

export type ExistingQuestion = {
  questionId: number;
  order: number;
  question: unknown;
  discussion: unknown;
  answers: Array<{
    id: number;
    content: string;
    code: string;
    isCorrect: boolean;
  }>;
};

export type PackQuestion = {
  id: number;
  content: unknown;
  answers: Array<{
    id: number;
    content: string;
    isCorrect: boolean;
  }>;
};

export type PracticePackOption = {
  id: number;
  title: string;
};

type PracticeQuestionLinkingViewProps = {
  hasPracticeQuestions: boolean;
  existingQuestions: ExistingQuestion[];
  existingQuestionIds: number[];
  selectedQuestionIds: number[];
  selectedPackId: number | null;
  selectedPack: PracticePackOption | undefined;
  searchQuery: string;
  dropdownOpen: boolean;
  searchInputRef: RefObject<HTMLInputElement | null>;
  practicePacksPending: boolean;
  practicePacks: PracticePackOption[];
  packQuestionsPending: boolean;
  packQuestions: PackQuestion[] | undefined;
  savePending: boolean;
  deletePending: boolean;
  onSave: () => void;
  onDelete: () => void;
  onQuestionToggle: (questionId: number) => void;
  onPackSelect: (packId: number) => void;
  onSearchQueryChange: (value: string) => void;
  onDropdownOpenChange: (open: boolean) => void;
  onSelectAllPackQuestions: () => void;
  onClearPackQuestions: () => void;
};

export function PracticeQuestionLinkingView({
  hasPracticeQuestions,
  existingQuestions,
  existingQuestionIds,
  selectedQuestionIds,
  selectedPackId,
  selectedPack,
  searchQuery,
  dropdownOpen,
  searchInputRef,
  practicePacksPending,
  practicePacks,
  packQuestionsPending,
  packQuestions,
  savePending,
  deletePending,
  onSave,
  onDelete,
  onQuestionToggle,
  onPackSelect,
  onSearchQueryChange,
  onDropdownOpenChange,
  onSelectAllPackQuestions,
  onClearPackQuestions,
}: PracticeQuestionLinkingViewProps) {
  return (
    <AdminContainer>
      <AdminHeader title="Edit Practice Questions" description="Link practice questions to this content" />
      <div className="mt-6 space-y-6">
        <div className="flex flex-col items-start justify-between space-y-1 sm:flex-row sm:items-center">
          <h2 className="text-lg font-semibold">Edit Latihan Soal</h2>

          <div className="flex gap-4">
            <Button type="button" onClick={onSave} size="sm" disabled={selectedQuestionIds.length === 0 || savePending}>
              {savePending ? "Menyimpan..." : "Simpan Latihan Soal"}
            </Button>

            {hasPracticeQuestions && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={deletePending}
                    size="sm"
                    className="w-1/2 sm:w-auto"
                  >
                    Hapus Latihan Soal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Latihan Soal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus latihan soal ini? Tindakan ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>Hapus</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {existingQuestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Soal yang Sudah Terhubung</Label>
                  <p className="text-sm text-muted-foreground">
                    {existingQuestions.length} soal sudah terhubung dengan konten ini
                  </p>
                </div>
              </div>
              <div className="max-h-125 space-y-2 overflow-y-auto">
                {existingQuestions.map((question) => {
                  const isSelected = selectedQuestionIds.includes(question.questionId);
                  return (
                    <Card key={question.questionId} className="border-2 border-primary p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={isSelected} onCheckedChange={() => onQuestionToggle(question.questionId)} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              <TiptapRenderer content={question.question} />
                            </div>
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Sudah Terhubung
                            </span>
                          </div>
                          {question.answers && question.answers.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {question.answers.map((answer) => (
                                <p
                                  key={answer.id}
                                  className={`text-sm ${
                                    answer.isCorrect ? "font-semibold text-green-600" : "text-muted-foreground"
                                  }`}
                                >
                                  {answer.isCorrect ? "✓ " : "  "}
                                  {answer.content}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {existingQuestions.length > 0 && <Separator />}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pilih Practice Pack untuk Menambah Soal</Label>
              <DropdownMenu open={dropdownOpen} onOpenChange={onDropdownOpenChange}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedPack ? selectedPack.title : "Pilih Practice Pack"}
                    <CaretUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] p-0" align="start">
                  <div className="flex items-center border-b px-3">
                    <MagnifyingGlass className="mr-2 size-4 shrink-0 opacity-50" />
                    <input
                      ref={searchInputRef}
                      placeholder="Cari practice pack..."
                      value={searchQuery}
                      onChange={(event) => onSearchQueryChange(event.target.value)}
                      className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1">
                    {practicePacksPending && (
                      <p className="py-6 text-center text-sm text-muted-foreground">Memuat...</p>
                    )}
                    {practicePacks.length === 0 && (
                      <p className="py-6 text-center text-sm text-muted-foreground">Tidak ada hasil</p>
                    )}
                    {practicePacks.map((pack) => (
                      <DropdownMenuItem key={pack.id} onSelect={() => onPackSelect(pack.id)} className="cursor-pointer">
                        <Check
                          className={cn("mr-2 size-4", selectedPackId === pack.id ? "opacity-100" : "opacity-0")}
                        />
                        {pack.title}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {packQuestions && packQuestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Pilih Soal Baru (dipilih: {selectedQuestionIds.length})</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={onSelectAllPackQuestions}>
                      Pilih Semua
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={onClearPackQuestions}>
                      Hapus Semua dari Pack
                    </Button>
                  </div>
                </div>
                <div className="max-h-125 space-y-2 overflow-y-auto">
                  {packQuestions.map((question) => {
                    const isLinked = existingQuestionIds.includes(question.id);
                    const isSelected = selectedQuestionIds.includes(question.id);
                    return (
                      <Card key={question.id} className={`p-4 ${isLinked ? "border-2 border-primary" : ""}`}>
                        <div className="flex items-start gap-3">
                          <Checkbox checked={isSelected} onCheckedChange={() => onQuestionToggle(question.id)} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">
                                <TiptapRenderer content={question.content} />
                              </div>
                              {isLinked && (
                                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                  Sudah Terhubung
                                </span>
                              )}
                            </div>
                            {question.answers && question.answers.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {question.answers.map((answer) => (
                                  <p
                                    key={answer.id}
                                    className={`text-sm ${
                                      answer.isCorrect ? "font-semibold text-green-600" : "text-muted-foreground"
                                    }`}
                                  >
                                    {answer.isCorrect ? "✓ " : "  "}
                                    {answer.content}
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {packQuestionsPending && <p className="text-sm text-muted-foreground">Memuat soal...</p>}
          </div>
        </div>
      </div>
    </AdminContainer>
  );
}
