import { BrainIcon, FloppyDiskIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { type } from "arktype";
import { lazy, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const TiptapSimpleEditor = lazy(() => import("@/components/tiptap/simple-editor"));

import { RequiredMarker } from "@/components/forms/required-marker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "../ui/separator";

const ANSWER_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;
const MIN_ANSWER_OPTIONS = 2;
const MAX_ANSWER_OPTIONS = 10;

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

type QuestionFormValidationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

type AnswerOptionsUpdateResult =
  | {
      ok: true;
      answerOptions: AnswerOption[];
    }
  | {
      ok: false;
      error: string;
    };

export function validateQuestionFormSubmission(
  value: Pick<QuestionFormData, "content" | "discussion">,
  answerOptions: AnswerOption[],
): QuestionFormValidationResult {
  const validation = type({
    content: "object",
    discussion: "object",
  })(value);

  if (validation instanceof type.errors) {
    return { ok: false, error: "Please fill all required fields" };
  }

  if (answerOptions.some((option) => !option.content.trim())) {
    return { ok: false, error: "All answer options must have content" };
  }

  if (!answerOptions.some((option) => option.isCorrect)) {
    return { ok: false, error: "Please mark at least one answer as correct" };
  }

  if (answerOptions.length < MIN_ANSWER_OPTIONS) {
    return { ok: false, error: "Please add at least 2 answer options" };
  }

  return { ok: true };
}

export function addAnswerOption(answerOptions: AnswerOption[]): AnswerOptionsUpdateResult {
  if (answerOptions.length >= MAX_ANSWER_OPTIONS) {
    return { ok: false, error: "Maximum 10 answer options allowed" };
  }

  const nextCode = ANSWER_CODES[answerOptions.length];
  if (!nextCode) {
    return { ok: false, error: "Maximum 10 answer options allowed" };
  }

  return {
    ok: true,
    answerOptions: [...answerOptions, { code: nextCode, content: "", isCorrect: false }],
  };
}

export function removeAnswerOption(answerOptions: AnswerOption[], index: number): AnswerOptionsUpdateResult {
  if (answerOptions.length <= MIN_ANSWER_OPTIONS) {
    return { ok: false, error: "Minimum 2 answer options required" };
  }

  const newOptions = answerOptions.filter((_, i) => i !== index);
  return {
    ok: true,
    answerOptions: newOptions.map((option, idx) => {
      const code = ANSWER_CODES[idx];
      if (!code) return option;
      return {
        ...option,
        code,
      };
    }),
  };
}

export function updateAnswerOption(
  answerOptions: AnswerOption[],
  index: number,
  field: keyof AnswerOption,
  value: string | boolean,
) {
  const newOptions = [...answerOptions];
  const currentOption = newOptions[index];
  if (!currentOption) return answerOptions;
  newOptions[index] = { ...currentOption, [field]: value };
  return newOptions;
}

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
      const validation = validateQuestionFormSubmission(value, answerOptions);
      if (!validation.ok) {
        toast.error(validation.error);
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

  const handleAddAnswerOption = () => {
    const result = addAnswerOption(answerOptions);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setAnswerOptions(result.answerOptions);
  };

  const handleRemoveAnswerOption = (index: number) => {
    const result = removeAnswerOption(answerOptions, index);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setAnswerOptions(result.answerOptions);
  };

  const handleUpdateAnswerOption = (index: number, field: keyof AnswerOption, value: string | boolean) => {
    setAnswerOptions(updateAnswerOption(answerOptions, index, field, value));
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
                      onCheckedChange={(checked) => handleUpdateAnswerOption(index, "isCorrect", !!checked)}
                    />
                  </div>
                  <Input
                    value={option.content}
                    onChange={(e) => handleUpdateAnswerOption(index, "content", e.target.value)}
                    placeholder={`Option ${option.code}`}
                    className="flex-1"
                  />
                  {answerOptions.length > 2 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveAnswerOption(index)}
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
              onClick={handleAddAnswerOption}
              disabled={answerOptions.length >= MAX_ANSWER_OPTIONS}
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
