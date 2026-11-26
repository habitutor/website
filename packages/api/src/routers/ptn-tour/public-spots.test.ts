import { describe, expect, test } from "bun:test";
import { toPublicSpots } from "./logic";

const base = { quota: 100, registered: 40, shownByAdmin: null, ended: false };

describe("toPublicSpots", () => {
  test("shows the real count when the admin leaves the field empty", () => {
    expect(toPublicSpots(base).registrationCount).toBe(40);
  });

  test("shows the admin's number when filled", () => {
    expect(toPublicSpots({ ...base, shownByAdmin: 250 }).registrationCount).toBe(250);
  });

  test("never sends the quota or remaining seats to students", () => {
    expect(toPublicSpots(base)).toMatchObject({ quota: null, spotsLeft: null });
  });

  test("decides full from real registrations, not from the admin's number", () => {
    expect(toPublicSpots({ ...base, shownByAdmin: 500 }).isFull).toBe(false);
    expect(toPublicSpots({ ...base, registered: 100, shownByAdmin: 5 }).isFull).toBe(true);
  });

  test("is never full without a quota or after the event ended", () => {
    expect(toPublicSpots({ ...base, quota: null, registered: 999 }).isFull).toBe(false);
    expect(toPublicSpots({ ...base, registered: 100, ended: true }).isFull).toBe(false);
  });
});
