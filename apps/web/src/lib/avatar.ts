/**
 * Convert a stored avatar value (ID like "3" or legacy path) to a full image URL.
 */
export function getAvatarSrc(image: string | null | undefined): string {
  if (!image) return "/avatar/profile/tupai-1.webp";
  // Already a full path (legacy data)
  if (image.startsWith("/")) return image;
  // Just the ID
  return `/avatar/profile/tupai-${image}.webp`;
}

/**
 * Extract the avatar ID from a stored value (supports both "3" and legacy "/avatar/profile/tupai-3.webp").
 */
export function getAvatarId(image: string | null | undefined): number {
  if (!image) return 1;
  // Already just an ID
  const num = Number(image);
  if (!Number.isNaN(num)) return num;
  // Legacy full path
  const match = image.match(/tupai-(\d+)/);
  return match ? Number(match[1]) : 1;
}
