import { BrainIcon, FloppyDiskIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { lazy, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

const TiptapSimpleEditor = lazy(() => import("@/components/tiptap-simple-editor"));

import { RequiredMarker } from "@/components/forms/required-marker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { Separator } from "../ui/separator";

const ANSWER_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

export type AnswerOption = {
  id?: number;
  code: string;
  content: string;
  isCorrect: boolean;
};

export interface QuestionFormData {
  content: unknown;
  discussion: unknown;
  isFlashcardQuestion: boolean;
  answerOptions: AnswerOption[];
}

interface QuestionFormProps {
  title: string;
  initialData?: Partial<QuestionFormData>;
  onSubmit: (data: QuestionFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const DEFAULT_ANSWER_OPTIONS: AnswerOption[] = [
  { code: "A", content: "", isCorrect: false },
  { code: "B", content: "", isCorrect: false },
  { code: "C", content: "", isCorrect: false },
  { code: "D", content: "", isCorrect: false },
];

export function QuestionForm({
  title,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save",
}: QuestionFormProps) {
  const [answerOptions, setAnswerOptions] = useState<AnswerOption[]>(DEFAULT_ANSWER_OPTIONS);

  const form = useForm({
    defaultValues: {
      content: (initialData?.content ?? {}) as unknown,
      discussion: (initialData?.discussion ?? {}) as unknown,
      isFlashcardQuestion: initialData?.isFlashcardQuestion ?? true,
    },
    onSubmit: async ({ value }) => {
      const validation = type({
        content: "object",
        discussion: "object",
      })(value);

      if (validation instanceof type.errors) {
        toast.error("Please fill all required fields");
        return;
      }

      const hasEmptyContent = answerOptions.some((option) => !option.content.trim());
      if (hasEmptyContent) {
        toast.error("All answer options must have content");
        return;
      }

      const hasCorrectAnswer = answerOptions.some((option) => option.isCorrect);
      if (!hasCorrectAnswer) {
        toast.error("Please mark at least one answer as correct");
        return;
      }

      if (answerOptions.length < 2) {
        toast.error("Please add at least 2 answer options");
        return;
      }

      await onSubmit({
        content: value.content,
        discussion: value.discussion,
        isFlashcardQuestion: value.isFlashcardQuestion,
        answerOptions,
      });
    },
  });

  useEffect(() => {
    if (initialData?.answerOptions && initialData.answerOptions.length > 0) {
      setAnswerOptions(initialData.answerOptions);
    }
  }, [initialData?.answerOptions]);

  const addAnswerOption = () => {
    if (answerOptions.length >= 10) {
      toast.error("Maximum 10 answer options allowed");
      return;
    }
    const nextCode = ANSWER_CODES[answerOptions.length];
    if (!nextCode) return;
    setAnswerOptions([...answerOptions, { code: nextCode, content: "", isCorrect: false }]);
  };

  const removeAnswerOption = (index: number) => {
    if (answerOptions.length <= 2) {
      toast.error("Minimum 2 answer options required");
      return;
    }
    const newOptions = answerOptions.filter((_, i) => i !== index);
    const reassignedOptions = newOptions.map((option, idx) => {
      const code = ANSWER_CODES[idx];
      if (!code) return option;
      return {
        ...option,
        code,
      };
    });
    setAnswerOptions(reassignedOptions);
  };

  const updateAnswerOption = (index: number, field: keyof AnswerOption, value: string | boolean) => {
    const newOptions = [...answerOptions];
    const currentOption = newOptions[index];
    if (!currentOption) return;
    newOptions[index] = { ...currentOption, [field]: value };
    setAnswerOptions(newOptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          <form.Field name="isFlashcardQuestion">
            {(field) => (
              <Item variant="outline">
                <ItemMedia variant="icon">
                  <BrainIcon className="text-pink-500" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>Available for Brain Gym</ItemTitle>
                  <ItemDescription>
                    Make this question available for Brain Gym. If disabled, this question will only be available in
                    Practice Packs
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="shrink-0">
                  <Switch checked={field.state.value} onCheckedChange={(checked) => field.handleChange(checked)} />
                </ItemActions>
              </Item>
            )}
          </form.Field>

          <Separator />

          <form.Field name="content">
            {(field) => (
              <div>
                <Label htmlFor="content">
                  Question Content <RequiredMarker />
                </Label>
                <div className="mt-2 rounded-md border">
                  <Suspense fallback={<div className="h-40 w-full animate-pulse rounded bg-muted" />}>
                    <TiptapSimpleEditor
                      content={field.state.value as object}
                      onChange={(content) => field.handleChange(content)}
                    />
                  </Suspense>
                </div>
              </div>
            )}
          </form.Field>

          <div className="flex flex-col gap-2">
            <Label>
              Answer Options <RequiredMarker />
            </Label>
            <div className="space-y-3">
              <Item variant="outline">
                <ItemMedia variant="icon">
                  <span className="text-sm text-muted-foreground">ℹ️</span>
                </ItemMedia>
                <ItemContent>
                  <ItemDescription>
                    Check the box to mark as correct answer. At least 2 options required.
                  </ItemDescription>
                </ItemContent>
              </Item>

              {answerOptions.map((option, index) => (
                <div key={option.code} className="flex items-start gap-2">
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-sm font-medium">{option.code}.</span>
                    <Checkbox
                      checked={option.isCorrect}
                      onCheckedChange={(checked) => updateAnswerOption(index, "isCorrect", !!checked)}
                    />
                  </div>
                  <Input
                    value={option.content}
                    onChange={(e) => updateAnswerOption(index, "content", e.target.value)}
                    placeholder={`Option ${option.code}`}
                    className="flex-1"
                  />
                  {answerOptions.length > 2 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => removeAnswerOption(index)}
                      className="mt-1 size-8 shrink-0"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addAnswerOption}
              disabled={answerOptions.length >= 10}
              className="mt-2 w-fit border"
            >
              <PlusIcon className="size-4" />
              Add Option
            </Button>
          </div>

          <Separator />

          <form.Field name="discussion">
            {(field) => (
              <div>
                <Label htmlFor="discussion">
                  Discussion / Explanation <RequiredMarker />
                </Label>
                <div className="mt-2 rounded-md border">
                  <Suspense fallback={<div className="h-40 w-full animate-pulse rounded bg-muted" />}>
                    <TiptapSimpleEditor
                      content={field.state.value as object}
                      onChange={(content) => field.handleChange(content)}
                    />
                  </Suspense>
                </div>
              </div>
            )}
          </form.Field>

          <div className="mt-8 flex gap-2">
            <Button type="submit" isPending={isSubmitting} disabled={isSubmitting}>
              {isSubmitting ? (
                <>Saving...</>
              ) : (
                <>
                  <FloppyDiskIcon />
                  {submitLabel}
                </>
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
