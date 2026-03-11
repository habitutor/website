type AttemptLike = {
  startedAt: Date;
  submittedAt: Date | null;
};

type AnswerLike = {
  id: number;
  isCorrect: boolean;
};

type AssignedQuestionLike = {
  selectedAnswerId: number | null;
  question: {
    answerOptions: Array<AnswerLike>;
  };
};

export function shouldBlockStartSession({
  latestAttempt,
  isPremium,
  today,
}: {
  latestAttempt: AttemptLike | undefined;
  isPremium: boolean;
  today: Date;
}): boolean {
  if (!latestAttempt) return false;
  const isAttemptToday = latestAttempt.startedAt.getTime() >= today.getTime();
  if (!isAttemptToday) return false;
  if (!isPremium) return true;
  return !latestAttempt.submittedAt;
}

export function isAttemptExpired({
  deadline,
  now,
  gracePeriodSeconds,
}: {
  deadline: Date;
  now: number;
  gracePeriodSeconds: number;
}): boolean {
  return now > deadline.getTime() + gracePeriodSeconds * 1000;
}

export function shouldIncrementFlashcardStreak({
  lastCompletedFlashcardAt,
  today,
}: {
  lastCompletedFlashcardAt: Date | null;
  today: Date;
}): boolean {
  if (!lastCompletedFlashcardAt) return true;
  return lastCompletedFlashcardAt.getTime() < today.getTime();
}

export function resolveAttemptAnswer({ answers, userAnswerId }: { answers: Array<AnswerLike>; userAnswerId: number }):
  | {
      correctAnswerId: number;
      userAnswerId: number;
      isCorrect: boolean;
    }
  | undefined {
  const correctAnswer = answers.find((answer) => answer.isCorrect);
  const userAnswer = answers.find((answer) => answer.id === userAnswerId);
  if (!correctAnswer || !userAnswer) return undefined;
  return {
    correctAnswerId: correctAnswer.id,
    userAnswerId: userAnswer.id,
    isCorrect: userAnswer.isCorrect,
  };
}

export function countCorrectAnswers(assignedQuestions: Array<AssignedQuestionLike>): number {
  let correct = 0;
  for (const assignedQuestion of assignedQuestions) {
    if (assignedQuestion.selectedAnswerId === null) continue;
    const selectedAnswer = assignedQuestion.question.answerOptions.find(
      (answerOption) => answerOption.id === assignedQuestion.selectedAnswerId,
    );
    if (selectedAnswer?.isCorrect) correct++;
  }
  return correct;
}
