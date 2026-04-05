import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { mapLeaderboardEntries } from "./flashcard-result-leaderboard-model";
import { LeaderboardView } from "./flashcard-result-leaderboard-view";

export function LeaderboardSection() {
  const { data: leaderboardData, isPending } = useQuery(orpc.flashcard.leaderboard.queryOptions());
  const leaderboard = mapLeaderboardEntries(leaderboardData);

  return <LeaderboardView leaderboard={leaderboard} isPending={isPending} />;
}
