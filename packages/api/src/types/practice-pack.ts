export type Question = {
  id: number;
  order: number;
  content: string;
  selectedAnswerId: number | null;
  answers: Answer[];
};

export type Answer = {
  id: number;
  content: string;
};
