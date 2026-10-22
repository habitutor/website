/**
 * Adds calendar months in UTC and clamps to the last day of the target month,
 * so 31 Dec + 2 months is 28/29 Feb instead of overflowing into March.
 */
export function addMonthsUtc(date: Date, months: number) {
  const result = new Date(date.getTime());
  const targetMonthIndex = result.getUTCMonth() + months;
  const dayOfMonth = result.getUTCDate();

  result.setUTCDate(1);
  result.setUTCMonth(targetMonthIndex);

  const lastDayOfTargetMonth = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(dayOfMonth, lastDayOfTargetMonth));

  return result;
}

/**
 * Never shorten premium the user already has: a late-settling short package
 * must not overwrite a longer active plan.
 */
export function resolveExpiryWithoutShortening({
  computedExpiresAt,
  currentIsPremium,
  currentExpiresAt,
  now = new Date(),
}: {
  computedExpiresAt: Date;
  currentIsPremium: boolean | null | undefined;
  currentExpiresAt: Date | null | undefined;
  now?: Date;
}) {
  const currentStillActive = Boolean(currentIsPremium) && currentExpiresAt != null && currentExpiresAt > now;

  return currentStillActive && currentExpiresAt > computedExpiresAt ? currentExpiresAt : computedExpiresAt;
}
