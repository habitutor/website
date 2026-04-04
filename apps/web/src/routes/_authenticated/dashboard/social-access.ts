export function shouldRequirePremiumDialog({ socialLink, hasError }: { socialLink?: string; hasError: boolean }) {
  return !socialLink || hasError;
}
