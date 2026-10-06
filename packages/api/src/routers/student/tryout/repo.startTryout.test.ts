import { describe, expect, test } from "bun:test";
import { tryoutRepo } from "./repo";

describe("tryoutRepo.startTryout", () => {
  test("should resume the session returned by findFirst", async () => {
    const oldSession = {
      id: "old-session",
      userId: "user-1",
      tryoutId: "tryout-1",
    };

    const oldSubtest = {
      id: "old-subtest",
      sesiId: "old-session",
      status: "berjalan",
      deadlineAt: new Date(Date.now() + 60 * 60 * 1000),
      urutanPengerjaan: 1,
    };

    const mockDb = {
      query: {
        tryoutSesi: {
          findFirst: async () => oldSession,
        },
        tryoutSesiSubtes: {
          findFirst: async () => oldSubtest,
        },
      },
    } as unknown as Parameters<typeof tryoutRepo.startTryout>[0]["db"];

    const result = await tryoutRepo.startTryout({
      db: mockDb,
      userId: "user-1",
      tryoutId: "tryout-1",
    });

    expect(result.sesi.id).toBe("old-session");
    expect(result.sesiSubtes?.id).toBe("old-subtest");
  });
});
