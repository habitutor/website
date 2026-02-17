import { describe, expect, test } from "bun:test";
import { createTestFlashcardAttempt } from "../__tests__/factories/flashcard";
import { getStartOfDay } from "../utils/date";

const GRACE_PERIOD_SECONDS = 5;

describe("Flashcard Router - Start Handler Logic", () => {
	describe("today validation", () => {
		test("getStartOfDay returns midnight for comparison", () => {
			const now = new Date("2026-02-17T15:30:00");
			const startOfDay = getStartOfDay(now);
			expect(startOfDay.getHours()).toBe(0);
			expect(startOfDay.getMinutes()).toBe(0);
		});

		test("attempt from earlier today should be detected", () => {
			const today = getStartOfDay();
			const attemptTime = new Date(today.getTime() + 60 * 60 * 1000);

			expect(attemptTime.getTime() >= today.getTime()).toBe(true);
		});

		test("attempt from yesterday should not block new session", () => {
			const today = getStartOfDay();
			const yesterdayAttempt = new Date(today.getTime() - 24 * 60 * 60 * 1000);

			expect(yesterdayAttempt.getTime() >= today.getTime()).toBe(false);
		});
	});

	describe("premium vs free user logic", () => {
		test("free user should be blocked if attempt exists today", () => {
			const isPremium = false;
			const today = getStartOfDay();
			const latestAttempt = createTestFlashcardAttempt({
				startedAt: new Date(today.getTime() + 60 * 60 * 1000),
			});

			const shouldBlock = !isPremium && latestAttempt.startedAt.getTime() >= today.getTime();
			expect(shouldBlock).toBe(true);
		});

		test("premium user with ongoing session should be blocked", () => {
			const isPremium = true;
			const today = getStartOfDay();
			const latestAttempt = createTestFlashcardAttempt({
				startedAt: new Date(today.getTime() + 60 * 60 * 1000),
				submittedAt: null,
			});

			const shouldBlock =
				isPremium && !latestAttempt.submittedAt && latestAttempt.startedAt.getTime() >= today.getTime();
			expect(shouldBlock).toBe(true);
		});

		test("premium user with submitted session can start new one", () => {
			const isPremium = true;
			const today = getStartOfDay();
			const latestAttempt = createTestFlashcardAttempt({
				startedAt: new Date(today.getTime() + 60 * 60 * 1000),
				submittedAt: new Date(),
			});

			const shouldBlock =
				isPremium && !latestAttempt.submittedAt && latestAttempt.startedAt.getTime() >= today.getTime();
			expect(shouldBlock).toBe(false);
		});
	});
});

describe("Flashcard Router - Submit Handler Logic", () => {
	describe("deadline validation", () => {
		test("submission within deadline should succeed", () => {
			const deadline = new Date(Date.now() + 5 * 60 * 1000);
			const isExpired = Date.now() > deadline.getTime() + GRACE_PERIOD_SECONDS * 1000;
			expect(isExpired).toBe(false);
		});

		test("submission after deadline + grace period should fail", () => {
			const deadline = new Date(Date.now() - 10 * 60 * 1000);
			const isExpired = Date.now() > deadline.getTime() + GRACE_PERIOD_SECONDS * 1000;
			expect(isExpired).toBe(true);
		});

		test("submission within grace period should succeed", () => {
			const deadline = new Date(Date.now() - 3 * 1000);
			const isExpired = Date.now() > deadline.getTime() + GRACE_PERIOD_SECONDS * 1000;
			expect(isExpired).toBe(false);
		});
	});

	describe("streak logic", () => {
		test("user who completed flashcard today should not increment streak", () => {
			const today = getStartOfDay();
			const lastCompletedFlashcardAt = new Date(today.getTime() + 60 * 60 * 1000);
			const hasDoneToday = lastCompletedFlashcardAt.getTime() >= today.getTime();

			expect(hasDoneToday).toBe(true);
		});

		test("user who has not completed flashcard today should increment streak", () => {
			const today = getStartOfDay();
			const lastCompletedFlashcardAt = new Date(today.getTime() - 24 * 60 * 60 * 1000);
			const hasDoneToday = lastCompletedFlashcardAt && lastCompletedFlashcardAt.getTime() >= today.getTime();

			expect(hasDoneToday).toBe(false);
		});
	});
});

describe("Flashcard Router - Save Handler Logic", () => {
	describe("answer validation", () => {
		test("correct answer identified properly", () => {
			const answers = [
				{ id: 1, isCorrect: false },
				{ id: 2, isCorrect: true },
				{ id: 3, isCorrect: false },
			];

			const correctAnswer = answers.find((a) => a.isCorrect);
			expect(correctAnswer?.id).toBe(2);
		});

		test("user answer matched correctly", () => {
			const answers = [
				{ id: 1, isCorrect: false },
				{ id: 2, isCorrect: true },
			];
			const userAnswerId = 1;

			const userAnswer = answers.find((a) => a.id === userAnswerId);
			expect(userAnswer?.isCorrect).toBe(false);
		});

		test("non-existent answer returns undefined", () => {
			const answers = [
				{ id: 1, isCorrect: false },
				{ id: 2, isCorrect: true },
			];
			const userAnswerId = 999;

			const userAnswer = answers.find((a) => a.id === userAnswerId);
			expect(userAnswer).toBeUndefined();
		});
	});
});

describe("Flashcard Router - Result Handler Logic", () => {
	describe("score calculation", () => {
		test("counts correct answers correctly", () => {
			const assignedQuestions = [
				{ selectedAnswerId: 1, question: { answerOptions: [{ id: 1, isCorrect: true }] } },
				{ selectedAnswerId: 2, question: { answerOptions: [{ id: 2, isCorrect: false }] } },
				{ selectedAnswerId: 3, question: { answerOptions: [{ id: 3, isCorrect: true }] } },
			];

			let correct = 0;
			for (const q of assignedQuestions) {
				const answerMap = new Map(
					q.question.answerOptions.map((a: { id: number; isCorrect: boolean }) => [a.id, a.isCorrect]),
				);
				if (answerMap.get(q.selectedAnswerId || 0)) correct++;
			}

			expect(correct).toBe(2);
		});

		test("handles unanswered questions", () => {
			const assignedQuestions = [
				{ selectedAnswerId: null, question: { answerOptions: [{ id: 1, isCorrect: true }] } },
				{ selectedAnswerId: 1, question: { answerOptions: [{ id: 1, isCorrect: true }] } },
			];

			let correct = 0;
			for (const q of assignedQuestions) {
				if (q.selectedAnswerId === null) continue;
				const answerMap = new Map(
					q.question.answerOptions.map((a: { id: number; isCorrect: boolean }) => [a.id, a.isCorrect]),
				);
				if (answerMap.get(q.selectedAnswerId)) correct++;
			}

			expect(correct).toBe(1);
		});
	});
});
