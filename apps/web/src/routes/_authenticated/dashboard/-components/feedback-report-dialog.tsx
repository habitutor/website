import { FlagIcon } from "@phosphor-icons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/utils/orpc";

type FeedbackCategory = "wrong_answer" | "bug_in_question" | "unclear_discussion" | "missing_option" | "other";

const categoryLabels: Record<FeedbackCategory, { label: string; icon: string }> = {
  wrong_answer: { label: "Jawaban Salah", icon: "✗" },
  bug_in_question: { label: "Error di Soal", icon: "🐛" },
  unclear_discussion: { label: "Pembahasan Kurang Jelas", icon: "❓" },
  missing_option: { label: "Opsi Jawaban Kurang", icon: "➕" },
  other: { label: "Lainnya", icon: "📝" },
};

interface FeedbackReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId?: number | null;
  selectedAnswerId?: number | null;
  attemptId?: number | null;
  path?: string | null;
}

function FeedbackForm({
  onSubmit,
  onCancel,
  isSubmitting,
  category,
  setCategory,
  description,
  setDescription,
  className,
}: {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  category: FeedbackCategory;
  setCategory: (cat: FeedbackCategory) => void;
  description: string;
  setDescription: (desc: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4 py-4">
        {/* Category Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Kategori Masalah</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(categoryLabels) as FeedbackCategory[]).map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                    isSelected
                      ? "bg-primary-50 text-primary-700 border-primary-300"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{categoryLabels[cat].icon}</span>
                  <span className="text-left">{categoryLabels[cat].label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Deskripsi <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="description"
            placeholder="Jelaskan masalah yang kamu temukan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minLength={10}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">Minimal 10 karakter</p>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting || description.trim().length < 10}>
          {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
        </Button>
      </div>
    </div>
  );
}

export function FeedbackReportDialog({
  open,
  onOpenChange,
  questionId,
  selectedAnswerId,
  attemptId,
  path,
}: FeedbackReportDialogProps) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<FeedbackCategory>("other");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const mutation = useMutation(
    orpc.feedback.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Laporan berhasil dikirim!");
        setCategory("other");
        setDescription("");
        onOpenChange(false);
        await queryClient.invalidateQueries({ queryKey: orpc.feedback.listMine.key() });
      },
      onError: () => {
        toast.error("Gagal mengirim laporan. Silakan coba lagi.");
      },
    }),
  );

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      toast.error("Deskripsi harus memiliki minimal 10 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      await mutation.mutateAsync({
        category,
        description: description.trim(),
        path: path ?? "/dashboard/flashcard",
        questionId: questionId ?? undefined,
        selectedAnswerId: selectedAnswerId ?? undefined,
        attemptId: attemptId ?? undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCategory("other");
      setDescription("");
    }
    onOpenChange(newOpen);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlagIcon className="size-5 text-orange-500" />
              Laporkan Masalah Soal
            </DialogTitle>
            <DialogDescription>
              Bantu kami meningkatkan kualitas soal dengan melaporkan masalah yang kamu temukan.
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm
            onSubmit={handleSubmit}
            onCancel={() => handleOpenChange(false)}
            isSubmitting={isSubmitting}
            category={category}
            setCategory={setCategory}
            description={description}
            setDescription={setDescription}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <FlagIcon className="size-5 text-orange-500" />
            Laporkan Masalah Soal
          </DrawerTitle>
          <DrawerDescription>
            Bantu kami meningkatkan kualitas soal dengan melaporkan masalah yang kamu temukan.
          </DrawerDescription>
        </DrawerHeader>
        <FeedbackForm
          onSubmit={handleSubmit}
          onCancel={() => handleOpenChange(false)}
          isSubmitting={isSubmitting}
          category={category}
          setCategory={setCategory}
          description={description}
          setDescription={setDescription}
          className="px-4"
        />
      </DrawerContent>
    </Drawer>
  );
}
