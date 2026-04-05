export type PracticePackAnswer = {
  id: number;
  content: string;
  code?: string;
  isCorrect?: boolean;
};

export type PracticePackQuestion = {
  id: number;
  content: unknown;
  discussion: unknown;
  order: number | null;
  answers: PracticePackAnswer[];
  selectedAnswerId?: number | null;
  isFlashcard?: boolean;
};

export type PracticePackQuestionForRemoval = Pick<PracticePackQuestion, "id" | "content" | "discussion" | "order">;
