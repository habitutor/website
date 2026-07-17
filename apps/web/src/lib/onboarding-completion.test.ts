import { describe, expect, test } from "bun:test";
import { isOnboardingComplete } from "./onboarding-completion";

const completeProfile = {
  dreamCampus: "Universitas Indonesia",
  dreamMajor: "Kedokteran",
  age: 17,
  educationLevel: "SMA Kelas 3",
  difficultSubjects: ["Penalaran Umum (PU)"],
  phoneNumber: "081234567890",
};

describe("isOnboardingComplete", () => {
  test("returns true when all required fields are present", () => {
    expect(isOnboardingComplete(completeProfile)).toBe(true);
  });

  test("returns false when any required field is missing", () => {
    expect(isOnboardingComplete({ ...completeProfile, dreamCampus: "" })).toBe(false);
    expect(isOnboardingComplete({ ...completeProfile, phoneNumber: "123" })).toBe(false);
    expect(isOnboardingComplete({ ...completeProfile, difficultSubjects: [] })).toBe(false);
  });
});
