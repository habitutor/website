import { PHONE_NUMBER_PATTERN } from "@/routes/_auth/-onboarding/constants";

export interface OnboardingProfileFields {
  dreamCampus?: string | null;
  dreamMajor?: string | null;
  age?: number | null;
  educationLevel?: string | null;
  difficultSubjects?: string[] | null;
  phoneNumber?: string | null;
}

export function isOnboardingComplete(profile: OnboardingProfileFields): boolean {
  if (!profile.dreamCampus || profile.dreamCampus.trim().length < 2) return false;
  if (!profile.dreamMajor || profile.dreamMajor.trim().length < 2) return false;
  if (!profile.age || profile.age < 10 || profile.age > 60) return false;
  if (!profile.educationLevel) return false;
  if (!profile.difficultSubjects || profile.difficultSubjects.length === 0) return false;
  if (!profile.phoneNumber || !PHONE_NUMBER_PATTERN.test(profile.phoneNumber.trim())) return false;
  return true;
}

export function profileToOnboardingAnswers(profile: OnboardingProfileFields) {
  return {
    dreamCampus: profile.dreamCampus?.trim() ?? "",
    dreamMajor: profile.dreamMajor?.trim() ?? "",
    age: profile.age ? String(profile.age) : "",
    educationLevel: profile.educationLevel ?? "",
    difficultSubjects: profile.difficultSubjects ?? [],
    phoneNumber: profile.phoneNumber?.trim() ?? "",
  };
}
