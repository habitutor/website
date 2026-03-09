import { useCallback, useState } from "react";

export function useCursorPagination() {
	const [cursor, setCursor] = useState<string | null>(null);
	const [cursorHistory, setCursorHistory] = useState<string[]>([]);

	const handleNext = useCallback(
		(nextCursor: string) => {
			if (cursor) {
				setCursorHistory((prev) => [...prev, cursor]);
			}
			setCursor(nextCursor);
		},
		[cursor],
	);

	const handlePrevious = useCallback(() => {
		setCursorHistory((prev) => {
			if (prev.length > 0) {
				const previousCursor = prev[prev.length - 1];
				setCursor(previousCursor);
				return prev.slice(0, -1);
			}
			setCursor(null);
			return prev;
		});
	}, []);

	const resetCursor = useCallback(() => {
		setCursor(null);
		setCursorHistory((prev) => (prev.length === 0 ? prev : []));
	}, []);

	const hasPrevious = cursor !== null || cursorHistory.length > 0;

	return {
		cursor,
		handleNext,
		handlePrevious,
		resetCursor,
		hasPrevious,
	};
}
