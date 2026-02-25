import { useState } from "react";

export function useCursorPagination() {
	const [cursor, setCursor] = useState<string | null>(null);
	const [cursorHistory, setCursorHistory] = useState<string[]>([]);

	const handleNext = (nextCursor: string) => {
		if (cursor) {
			setCursorHistory((prev) => [...prev, cursor]);
		}
		setCursor(nextCursor);
	};

	const handlePrevious = () => {
		if (cursorHistory.length > 0) {
			const previousCursor = cursorHistory[cursorHistory.length - 1];
			setCursorHistory((prev) => prev.slice(0, -1));
			setCursor(previousCursor);
		} else {
			setCursor(null);
		}
	};

	const resetCursor = () => {
		setCursor(null);
		setCursorHistory([]);
	};

	const hasPrevious = cursor !== null || cursorHistory.length > 0;

	return {
		cursor,
		handleNext,
		handlePrevious,
		resetCursor,
		hasPrevious,
	};
}
