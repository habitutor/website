export function getStartOfDay(date = new Date()): Date {
	const result = new Date(date);
	result.setHours(0, 0, 0, 0);
	return result;
}
