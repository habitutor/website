import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@habitutor/db";
import { tryout, tryoutSubtes, tryoutSesi, tryoutSesiSubtes } from "@habitutor/db/schema/tryout";
import { user } from "@habitutor/db/schema/user";
import { eq } from "drizzle-orm";
import { tryoutRepo } from "./repo";

const TEST_USER_ID = "integration-test-user-start-tryout";
const TEST_TRYOUT_ID = "00000000-0000-0000-0000-000000000101";
const TEST_SUBTES_ID = "00000000-0000-0000-0000-000000000102";
let expectedSessionId: string;

describe("tryoutRepo.startTryout - integration", () => {
  beforeAll(async () => {
    await db.delete(user).where(eq(user.id, TEST_USER_ID));

    await db.insert(user).values({
      id: TEST_USER_ID,
      name: "Integration Test User",
      email: "integration-start-tryout@test.local",
      emailVerified: false,
    });

    await db.insert(tryout).values({
      id: TEST_TRYOUT_ID,
      dibuatOleh: TEST_USER_ID,
      judul: "Integration Test Tryout",
      deskripsi: "Temporary test data",
      status: "published",
      mulaiAt: new Date(),
    });

    await db.insert(tryoutSubtes).values({
      id: TEST_SUBTES_ID,
      tryoutId: TEST_TRYOUT_ID,
      namaSubtes: "Integration Test Subtes",
      jumlahSoal: 0,
      durasiMenit: 60,
      urutan: 1,
      nilaiMinimum: 0,
    });

    const oldSession = await db
      .insert(tryoutSesi)
      .values({
        userId: TEST_USER_ID,
        tryoutId: TEST_TRYOUT_ID,
        mulaiAt: new Date(Date.now() - 60 * 60 * 1000),
        status: "berjalan",
      })
      .returning({ id: tryoutSesi.id });

    await db.insert(tryoutSesiSubtes).values({
      sesiId: oldSession[0]!.id,
      subtesId: TEST_SUBTES_ID,
      urutanPengerjaan: 1,
      mulaiAt: new Date(Date.now() - 60 * 60 * 1000),
      deadlineAt: new Date(Date.now() + 60 * 60 * 1000),
      status: "berjalan",
    });

    const newSession = await db
      .insert(tryoutSesi)
      .values({
        userId: TEST_USER_ID,
        tryoutId: TEST_TRYOUT_ID,
        mulaiAt: new Date(),
        status: "berjalan",
      })
      .returning({ id: tryoutSesi.id });

    expectedSessionId = newSession[0]!.id;

    await db.insert(tryoutSesiSubtes).values({
      sesiId: newSession[0]!.id,
      subtesId: TEST_SUBTES_ID,
      urutanPengerjaan: 1,
      mulaiAt: new Date(),
      deadlineAt: new Date(Date.now() + 60 * 60 * 1000),
      status: "berjalan",
    });

    console.log("OLD SESSION     :", oldSession[0]!.id);
    console.log("NEW SESSION     :", newSession[0]!.id);
  });

  afterAll(async () => {
    const sessions = await db.select({ id: tryoutSesi.id }).from(tryoutSesi).where(eq(tryoutSesi.userId, TEST_USER_ID));

    for (const session of sessions) {
      await db.delete(tryoutSesiSubtes).where(eq(tryoutSesiSubtes.sesiId, session.id));
    }

    await db.delete(tryoutSesi).where(eq(tryoutSesi.userId, TEST_USER_ID));

    await db.delete(tryoutSubtes).where(eq(tryoutSubtes.id, TEST_SUBTES_ID));

    await db.delete(tryout).where(eq(tryout.id, TEST_TRYOUT_ID));

    await db.delete(user).where(eq(user.id, TEST_USER_ID));
  });

  test("shows which session startTryout() actually resumes", async () => {
    const result = await tryoutRepo.startTryout({
      db,
      userId: TEST_USER_ID,
      tryoutId: TEST_TRYOUT_ID,
    });

    console.log("SESSION RETURNED:", result.sesi.id);
    console.log("SUBTEST RETURNED:", result.sesiSubtes?.id);

    expect(result.sesi.id).toBe(expectedSessionId);
    expect(result.sesiSubtes?.status).toBe("berjalan");
  });
});
