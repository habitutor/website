import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { orpc } from "@/utils/orpc";

type FeedbackCategory = "error" | "question_bug" | "other";

const categoryLabels: Record<FeedbackCategory, string> = {
  error: "Error",
  question_bug: "Kesalahan di Soal",
  other: "Lainnya",
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
  isSubmitting,
  isSuccess,
  category,
  setCategory,
  description,
  setDescription,
  className,
}: {
  onSubmit: () => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  category: FeedbackCategory;
  setCategory: (cat: FeedbackCategory) => void;
  description: string;
  setDescription: (desc: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Kategori Masalah</label>
          <Select value={category} onValueChange={(val) => setCategory(val as FeedbackCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(categoryLabels) as FeedbackCategory[]).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabels[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            maxLength={250}
            rows={4}
            className="resize-none"
          />
          <p
            className={`text-xs ${description.length > 0 && (description.length < 10 || description.length > 250) ? "text-red-500" : "text-gray-500"}`}
          >
            {description.length}/250 karakter
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Laporan kamu sangat membantu kami untuk memperbaiki kualitas soal dan pembahasan. Setiap masukan akan ditinjau
          oleh tim kami.
        </p>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || isSuccess || description.trim().length < 10 || description.length > 250}
          className={isSuccess ? "border-green-500 text-green-600" : undefined}
        >
          {isSuccess ? "Terkirim!" : isSubmitting ? "Mengirim..." : "Kirim Laporan"}
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
  const [category, setCategory] = useState<FeedbackCategory>("other");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const resetForm = useCallback(() => {
    setCategory("other");
    setDescription("");
    setIsSuccess(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const mutation = useMutation(
    orpc.feedback.create.mutationOptions({
      onSuccess: async () => {
        setIsSuccess(true);
        timeoutRef.current = setTimeout(() => {
          resetForm();
          onOpenChange(false);
        }, 1000);
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

    if (description.length > 250) {
      toast.error("Deskripsi tidak boleh lebih dari 250 karakter.");
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
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="">Laporkan Masalah Soal</DialogTitle>
            <DialogDescription>
              Bantu kami meningkatkan kualitas soal dengan melaporkan masalah yang kamu temukan.
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
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
          <DrawerTitle className="">Laporkan Masalah Soal</DrawerTitle>
          <DrawerDescription>
            Bantu kami meningkatkan kualitas soal dengan melaporkan masalah yang kamu temukan.
          </DrawerDescription>
        </DrawerHeader>
        <FeedbackForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
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
