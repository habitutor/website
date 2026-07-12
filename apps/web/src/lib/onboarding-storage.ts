export interface OnboardingAnswers {
  dreamCampus: string;
  dreamMajor: string;
  age: string;
  educationLevel: string;
  difficultSubjects: string[];
  phoneNumber: string;
}

export interface OnboardingDraft {
  answers: OnboardingAnswers;
  step: number;
}

export const EMPTY_ONBOARDING_ANSWERS: OnboardingAnswers = {
  dreamCampus: "",
  dreamMajor: "",
  age: "",
  educationLevel: "",
  difficultSubjects: [],
  phoneNumber: "",
};

const STORAGE_KEY = "habitutor-onboarding-draft";

export function loadOnboardingDraft(): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (!parsed || typeof parsed !== "object" || !parsed.answers) return null;
    return {
      answers: { ...EMPTY_ONBOARDING_ANSWERS, ...parsed.answers },
      step: typeof parsed.step === "number" ? parsed.step : 0,
    };
  } catch {
    return null;
  }
}

export function saveOnboardingDraft(draft: OnboardingDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage unavailable (private mode etc.) — resume simply won't work
  }
}

export function clearOnboardingDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function hasOnboardingAnswers(draft: OnboardingDraft | null): boolean {
  if (!draft) return false;
  const { answers } = draft;
  return Boolean(
    answers.dreamCampus ||
    answers.dreamMajor ||
    answers.age ||
    answers.educationLevel ||
    answers.difficultSubjects.length > 0 ||
    answers.phoneNumber,
  );
}

export function toProfileUpdateInput(answers: OnboardingAnswers) {
  const age = Number.parseInt(answers.age, 10);
  return {
    ...(answers.dreamCampus.trim() ? { dreamCampus: answers.dreamCampus.trim() } : {}),
    ...(answers.dreamMajor.trim() ? { dreamMajor: answers.dreamMajor.trim() } : {}),
    ...(Number.isFinite(age) && age > 0 ? { age } : {}),
    ...(answers.educationLevel ? { educationLevel: answers.educationLevel } : {}),
    ...(answers.difficultSubjects.length > 0 ? { difficultSubjects: answers.difficultSubjects } : {}),
    ...(answers.phoneNumber.trim() ? { phoneNumber: answers.phoneNumber.trim() } : {}),
  };
}
