import { isAdminRole } from "./auth-domain";

/**
 * Content access control helpers
 * Centralized logic for determining content access based on premium status and role
 */

/**
 * Check if a user can access specific content detail (video, notes, practice questions)
 * - Admin users can access all content
 * - Premium users can access all content
 * - Free users can only access the first content per category (order=1) in any subtest
 *
 * @param userIsPremium - Whether the user has premium access
 * @param userRole - The user's role (e.g., "admin", "user")
 * @param subtestOrder - The order of the subtest (1 = first subtest)
 * @param contentOrder - The order of the content within its category (1 = first content)
 * @returns Whether the user can access the content
 */
export function canAccessContent(
  userIsPremium: boolean,
  userRole: string | undefined,
  _subtestOrder: number,
  contentOrder: number,
): boolean {
  // Admin can access everything
  if (isAdminRole(userRole)) return true;
  // Premium users can access everything
  if (userIsPremium) return true;
  // Free users: first lesson of every course
  return isFirstContent(contentOrder);
}

/**
 * Check if the subtest is the first one (free for all users)
 * @param subtestOrder - The order of the subtest
 */
export function isFirstSubtest(subtestOrder: number): boolean {
  return subtestOrder === 1;
}

/**
 * Check if the content is the first one in its category (free for first subtest)
 * @param contentOrder - The order of the content within its category
 */
export function isFirstContent(contentOrder: number): boolean {
  return contentOrder === 1;
}

/**
 * Check if a subtest requires premium access (for UI display)
 * Free users can open every subtest (first lesson is free); individual content locks apply per item.
 *
 * @param _subtestOrder - The order of the subtest (unused; kept for call-site compatibility)
 * @param userRole - The user's role
 * @param userIsPremium - Whether the user has premium access
 */
export function isSubtestPremium(_subtestOrder: number, userRole?: string, userIsPremium?: boolean): boolean {
  if (isAdminRole(userRole) || userIsPremium) return false;
  return false;
}
