import { describe, expect, test } from "bun:test";
import { getEarlyBirdCountdown } from "./early-bird-countdown";

describe("getEarlyBirdCountdown", () => {
  test("counts down to the fixed first deadline", () => {
    const now = new Date("2026-07-21T00:46:00+07:00").getTime();

    expect(getEarlyBirdCountdown(now)).toEqual({
      days: 2,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  test("starts another two-day window when a deadline passes", () => {
    const deadline = new Date("2026-07-23T00:46:00+07:00").getTime();

    expect(getEarlyBirdCountdown(deadline)).toEqual({
      days: 2,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  test("keeps restarting on the same fixed schedule", () => {
    const laterCycle = new Date("2026-07-27T12:46:00+07:00").getTime();

    expect(getEarlyBirdCountdown(laterCycle)).toEqual({
      days: 1,
      hours: 12,
      minutes: 0,
      seconds: 0,
    });
  });
});
