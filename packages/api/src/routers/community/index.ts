import { db } from "@habitutor/db";
import { user } from "@habitutor/db/schema/user";
import { type } from "arktype";
import { eq } from "drizzle-orm";
import { authed } from "../../index";
import { notifyUser } from "../notification/service";
import { hasCompletedToday, reconcileStreak } from "../streak/logic";
import { getGroupLevel, getGroupStreak, type LeaderboardPeriod, periodStreak } from "./logic";
import { communityRepo } from "./repo";

const MAX_GROUP_MEMBERS = 20;

function generateInviteCode() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}

/** Live streak per member without persisting (read paths stay cheap). */
function liveMemberStreak(member: { streak: number; lastStreakAt: Date | null }) {
  const { next } = reconcileStreak({
    streak: member.streak,
    lastStreakAt: member.lastStreakAt,
    streakSaves: 0,
    streakSavesUpdatedAt: null,
  });
  return { streak: next.streak, lastStreakAt: next.lastStreakAt };
}

async function buildGroupSummary(group: { id: string; name: string; inviteCode: string }) {
  const members = await communityRepo.getGroupMembers({ groupId: group.id });
  const live = members.map((member) => ({ ...member, ...liveMemberStreak(member) }));

  return {
    id: group.id,
    name: group.name,
    inviteCode: group.inviteCode,
    memberCount: live.length,
    membersActiveToday: live.filter((member) => hasCompletedToday(member.lastStreakAt)).length,
    groupStreak: getGroupStreak(live),
    memberPreviews: live.slice(0, 4).map((member) => ({ name: member.name, image: member.image })),
  };
}

const overview = authed
  .route({
    path: "/community/overview",
    method: "GET",
    tags: ["Community"],
  })
  .handler(async ({ context }) => {
    const groups = await communityRepo.getGroupsForUser({ userId: context.session.user.id });
    const summaries = await Promise.all(groups.map(buildGroupSummary));
    return { groups: summaries };
  });

const createGroup = authed
  .route({
    path: "/community/groups",
    method: "POST",
    tags: ["Community"],
  })
  .input(type({ name: "2 <= string <= 40" }))
  .handler(async ({ input, context, errors }) => {
    const group = await communityRepo.createGroup({
      name: input.name.trim(),
      inviteCode: generateInviteCode(),
      creatorUserId: context.session.user.id,
    });
    if (!group) throw errors.INTERNAL_SERVER_ERROR({ message: "Gagal membuat grup. Silahkan coba lagi." });
    await communityRepo.addMember({ groupId: group.id, userId: context.session.user.id });
    return buildGroupSummary(group);
  });

const joinGroup = authed
  .route({
    path: "/community/groups/join",
    method: "POST",
    tags: ["Community"],
  })
  .input(type({ inviteCode: "string" }))
  .handler(async ({ input, context, errors }) => {
    const group = await communityRepo.getGroupByInviteCode({ inviteCode: input.inviteCode.trim().toUpperCase() });
    if (!group) throw errors.NOT_FOUND({ message: "Grup tidak ditemukan. Periksa kode undanganmu." });

    const alreadyMember = await communityRepo.isMember({ groupId: group.id, userId: context.session.user.id });
    if (alreadyMember) throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu sudah tergabung di grup ini." });

    const memberCount = await communityRepo.countMembers({ groupId: group.id });
    if (memberCount >= MAX_GROUP_MEMBERS) throw errors.UNPROCESSABLE_CONTENT({ message: "Grup ini sudah penuh." });

    await communityRepo.addMember({ groupId: group.id, userId: context.session.user.id });
    return buildGroupSummary(group);
  });

const leaderboard = authed
  .route({
    path: "/community/leaderboard",
    method: "GET",
    tags: ["Community"],
  })
  .input(type({ groupId: "string", "period?": "'all' | 'weekly' | 'monthly'" }))
  .handler(async ({ input, context, errors }) => {
    const group = await communityRepo.getGroupById({ groupId: input.groupId });
    if (!group) throw errors.NOT_FOUND({ message: "Grup tidak ditemukan." });

    const isMember = await communityRepo.isMember({ groupId: group.id, userId: context.session.user.id });
    if (!isMember) throw errors.FORBIDDEN({ message: "Kamu bukan anggota grup ini." });

    const period: LeaderboardPeriod = input.period ?? "all";
    const members = await communityRepo.getGroupMembers({ groupId: group.id });
    const live = members.map((member) => ({ ...member, ...liveMemberStreak(member) }));
    const groupStreak = getGroupStreak(live);

    const ranked = live
      .map((member) => ({
        userId: member.userId,
        name: member.name,
        image: member.image,
        streak: periodStreak(member.streak, period),
        isMe: member.userId === context.session.user.id,
      }))
      .sort((a, b) => b.streak - a.streak);

    return {
      group: {
        id: group.id,
        name: group.name,
        inviteCode: group.inviteCode,
        level: getGroupLevel(groupStreak),
        groupStreak,
        memberCount: live.length,
        membersActiveToday: live.filter((member) => hasCompletedToday(member.lastStreakAt)).length,
        memberPreviews: live.slice(0, 4).map((member) => ({ name: member.name, image: member.image })),
      },
      members: ranked,
    };
  });

const match = authed
  .route({
    path: "/community/match",
    method: "GET",
    tags: ["Community"],
  })
  .input(type({ "search?": "string" }))
  .handler(async ({ input, context }) => {
    const [me] = await db
      .select({ dreamCampus: user.dreamCampus, dreamMajor: user.dreamMajor })
      .from(user)
      .where(eq(user.id, context.session.user.id))
      .limit(1);

    const [candidates, requestedIds] = await Promise.all([
      communityRepo.getMatchCandidates({
        userId: context.session.user.id,
        dreamCampus: me?.dreamCampus ?? null,
        dreamMajor: me?.dreamMajor ?? null,
        search: input.search?.trim() || undefined,
      }),
      communityRepo.getSentRequestUserIds({ userId: context.session.user.id }),
    ]);

    const requested = new Set(requestedIds);
    return {
      candidates: candidates.map((candidate) => ({
        userId: candidate.userId,
        name: candidate.name,
        image: candidate.image,
        campus: candidate.dreamCampus,
        major: candidate.dreamMajor,
        subjects: candidate.difficultSubjects ?? [],
        score: candidate.totalScore,
        requested: requested.has(candidate.userId),
      })),
    };
  });

const connect = authed
  .route({
    path: "/community/match/connect",
    method: "POST",
    tags: ["Community"],
  })
  .input(type({ userId: "string" }))
  .handler(async ({ input, context, errors }) => {
    if (input.userId === context.session.user.id)
      throw errors.UNPROCESSABLE_CONTENT({ message: "Kamu tidak bisa terhubung dengan dirimu sendiri." });
    const request = await communityRepo.createMatchRequest({
      fromUserId: context.session.user.id,
      toUserId: input.userId,
    });
    // Only notify on the first request (conflict-ignored repeats return nothing)
    if (request) {
      await notifyUser({
        userId: input.userId,
        type: "match_request",
        title: "Permintaan belajar bareng 🎯",
        body: `${context.session.user.name} ingin belajar bersamamu. Buka tab Komunitas untuk melihat.`,
        data: { fromUserId: context.session.user.id },
      });
    }
    return { ok: true };
  });

export const communityRouter = {
  overview,
  createGroup,
  joinGroup,
  leaderboard,
  match,
  connect,
};
