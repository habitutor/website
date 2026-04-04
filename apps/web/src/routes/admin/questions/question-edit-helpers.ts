import type { AnswerOption, QuestionFormData } from "@/components/admin/question-form";

const ANSWER_CODES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;
const CODE_ORDER = new Map<string, number>(ANSWER_CODES.map((code, index) => [code, index]));

type QuestionAnswer = {
  id: number;
  code: string;
  content: string;
  isCorrect: boolean;
};

type QuestionWithAnswers = {
  answers: QuestionAnswer[];
};

type SyncQuestionAnswersInput = {
  questionId: number;
  question: QuestionWithAnswers | undefined;
  data: QuestionFormData;
  updateQuestion: () => Promise<unknown>;
  updateAnswer: (payload: { id: number; content: string; isCorrect: boolean }) => Promise<unknown>;
  createAnswer: (payload: {
    questionId: number;
    code: string;
    content: string;
    isCorrect: boolean;
  }) => Promise<unknown>;
  deleteAnswer: (payload: { id: number }) => Promise<unknown>;
};

export function getInitialAnswerOptions(question: QuestionWithAnswers | undefined): AnswerOption[] {
  if (!question) return [];

  const sortedAnswers = [...question.answers].sort((a, b) => {
    const codeA = CODE_ORDER.get(a.code) ?? 0;
    const codeB = CODE_ORDER.get(b.code) ?? 0;
    return codeA - codeB;
  });

  return sortedAnswers.map((answer) => ({
    id: answer.id,
    code: answer.code,
    content: answer.content,
    isCorrect: answer.isCorrect,
  }));
}

export async function syncQuestionAndAnswers({
  questionId,
  question,
  data,
  updateQuestion,
  updateAnswer,
  createAnswer,
  deleteAnswer,
}: SyncQuestionAnswersInput) {
  await updateQuestion();

  const existingAnswerIds = new Set(question?.answers.map((answer) => answer.id) ?? []);
  const currentAnswerIds = new Set(data.answerOptions.map((option) => option.id).filter(Boolean));
  const answersToDelete = question?.answers.filter((answer) => !currentAnswerIds.has(answer.id)) ?? [];
  await Promise.all(answersToDelete.map((answer) => deleteAnswer({ id: answer.id })));

  await Promise.all(
    data.answerOptions.map((option) => {
      if (option.id && existingAnswerIds.has(option.id)) {
        return updateAnswer({
          id: option.id,
          content: option.content,
          isCorrect: option.isCorrect,
        });
      }
      return createAnswer({
        questionId,
        code: option.code,
        content: option.content,
        isCorrect: option.isCorrect,
      });
    }),
  );
}
