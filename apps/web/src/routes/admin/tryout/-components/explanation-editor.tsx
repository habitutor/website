import { PencilIcon, FloppyDisk, X } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface ExplanationEditorProps {
  questionId: string;
  currentExplanation?: string;
  onSave?: (explanation: string) => Promise<void>;
}

export function ExplanationEditor({
  questionId,
  currentExplanation = "",
  onSave,
}: ExplanationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [explanation, setExplanation] = useState(currentExplanation);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(explanation);
      }
      toast.success("Pembahasan berhasil disimpan");
      setIsEditing(false);
    } catch (error) {
      toast.error("Gagal menyimpan pembahasan");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setExplanation(currentExplanation);
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <PencilIcon className="mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tulis pembahasan soal di sini... Anda bisa menggunakan format markdown untuk formatting yang lebih baik."
              rows={8}
              className="font-mono"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
              >
                <FloppyDisk className="mr-2" />
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="mr-2" />
                Batal
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            {explanation ? (
              <div className="prose prose-sm max-w-none bg-muted/50 rounded-lg p-4 text-sm whitespace-pre-wrap">
                {explanation}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Belum ada pembahasan. Klik tombol Edit untuk menambahkan.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BulkExplanationManagerProps {
  subtestId: string;
  questions: Array<{
    id: string;
    content: string;
    explanation?: string;
  }>;
}

export function BulkExplanationManager({
  subtestId,
  questions,
}: BulkExplanationManagerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <Card key={question.id} className="overflow-hidden">
          <CardHeader
            className="cursor-pointer hover:bg-muted/50 transition-colors py-3"
            onClick={() => setExpandedId(expandedId === question.id ? null : question.id)}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <CardTitle className="text-base line-clamp-2">
                  {question.content}
                </CardTitle>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {question.explanation ? "Ada" : "Belum ada"} pembahasan
              </span>
            </div>
          </CardHeader>

          {expandedId === question.id && (
            <CardContent className="pt-4 border-t">
              <ExplanationEditor
                questionId={question.id}
                currentExplanation={question.explanation}
              />
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
