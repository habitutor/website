import { PencilIcon, FloppyDisk, X } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImageUploadPreview, fileToBase64 } from "./soal-dialogs";
import { orpc, queryClient } from "@/utils/orpc";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Image } from "@unpic/react";
import { Skeleton } from "@/components/ui/skeleton";

interface ExplanationEditorProps {
  questionId: string;
  subtestId: string;
  currentExplanation?: string | null;
  currentGambarUrl?: string | null;
}

export function ExplanationEditor({
  questionId,
  subtestId,
  currentExplanation = "",
  currentGambarUrl = null,
}: ExplanationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [explanation, setExplanation] = useState(currentExplanation || "");
  const [gambarUrl, setGambarUrl] = useState<string | null>(currentGambarUrl);

  const updateSoalMutation = useMutation(
    orpc.admin.tryout.update.soal.mutationOptions({
      onSuccess: () => {
        toast.success("Pembahasan berhasil disimpan");
        queryClient.invalidateQueries({
          queryKey: orpc.admin.tryout.list.soal.queryKey({ input: { subtesId: subtestId } }),
        });
        setIsEditing(false);
      },
      onError: (err) => {
        toast.error("Gagal menyimpan pembahasan", { description: err.message });
      },
    }),
  );

  const handleSave = async () => {
    updateSoalMutation.mutate({
      soalId: questionId,
      pembahasan: explanation,
      pembahasanGambar: gambarUrl,
    });
  };

  const handleCancel = () => {
    setExplanation(currentExplanation || "");
    setGambarUrl(currentGambarUrl);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pembahasan Soal</CardTitle>
            <CardDescription>Penjelasan detail jawaban untuk siswa premium</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <PencilIcon className="mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Tulis pembahasan soal di sini..."
                rows={8}
                className="font-mono"
              />
              <ImageUploadPreview
                url={gambarUrl}
                onUpload={async (f) => setGambarUrl(await fileToBase64(f))}
                onRemove={() => setGambarUrl(null)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateSoalMutation.isPending}>
                <FloppyDisk className="mr-2" />
                {updateSoalMutation.isPending ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={updateSoalMutation.isPending}>
                <X className="mr-2" />
                Batal
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {explanation || gambarUrl ? (
              <div className="prose prose-sm max-w-none rounded-lg bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                {explanation && <div>{explanation}</div>}
                {gambarUrl && (
                  <div className="mt-4">
                    <Image
                      src={gambarUrl}
                      alt="Gambar Pembahasan"
                      width={400}
                      height={300}
                      className="rounded border bg-white object-contain"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>Belum ada pembahasan. Klik tombol Edit untuk menambahkan.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SubtestExplanationManager({ subtestId }: { subtestId: string }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: questions, isPending } = useQuery({
    ...orpc.admin.tryout.list.soal.queryOptions({ input: { subtesId: subtestId } }),
  });

  if (isPending) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-lg border bg-gray-50/50 py-4 text-center text-muted-foreground">
        Belum ada soal pada subtes ini.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map(
        (question: {
          id: string;
          pertanyaan: string;
          pembahasan?: string | null;
          pembahasanGambar?: string | null;
        }) => (
          <Card key={question.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer py-3 transition-colors hover:bg-muted/50"
              onClick={() => setExpandedId(expandedId === question.id ? null : question.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <CardTitle className="line-clamp-2 text-base">{question.pertanyaan}</CardTitle>
                </div>
                <span className="text-xs whitespace-nowrap text-muted-foreground">
                  {question.pembahasan || question.pembahasanGambar ? "Ada" : "Belum ada"} pembahasan
                </span>
              </div>
            </CardHeader>

            {expandedId === question.id && (
              <CardContent className="border-t bg-gray-50/30 pt-4">
                <ExplanationEditor
                  subtestId={subtestId}
                  questionId={question.id}
                  currentExplanation={question.pembahasan}
                  currentGambarUrl={question.pembahasanGambar}
                />
              </CardContent>
            )}
          </Card>
        ),
      )}
    </div>
  );
}
