import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";

export const FlashcardCard = () => {
  const { data } = useQuery(orpc.flashcard.get.queryOptions());

  return <div>{data?.assignedQuestions[0].question.content}</div>;
};
