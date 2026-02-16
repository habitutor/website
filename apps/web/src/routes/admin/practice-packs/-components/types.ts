export type Answer = {
	id: number;
	code: string;
	content: string;
	isCorrect: boolean;
};

export type Question = {
	id: number;
	content: unknown;
	discussion: unknown;
	order: number | null;
	isFlashcard: boolean;
	answers?: Answer[];
};

export type QuestionForRemoval = Pick<Question, "id" | "content" | "discussion" | "order">;
