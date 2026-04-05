import type { BodyOutputs } from "@/utils/orpc";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  totalScore: number;
  image: string | null | undefined;
  isCurrentUser: boolean;
};

type LeaderboardApiResponse = NonNullable<BodyOutputs["flashcard"]["leaderboard"]>;

export function mapLeaderboardEntries(data: LeaderboardApiResponse | undefined): LeaderboardEntry[] {
  return (data?.entries ?? []).map((entry) => ({
    rank: entry.rank,
    userId: entry.userId,
    name: entry.name,
    totalScore: entry.totalScore,
    image:
      entry.rank === 1
        ? "/decorations/image1.png"
        : entry.rank === 2
          ? "/decorations/image2.png"
          : entry.rank === 3
            ? "/decorations/image3.png"
            : undefined,
    isCurrentUser: entry.isCurrentUser,
  }));
}
