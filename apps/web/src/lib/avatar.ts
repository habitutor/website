function toAvatarId(value: string | number | null | undefined): number {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 1;
}

export function getAvatarSrc(value: string | number | null | undefined): string {
  return `/avatar/profile/tupai-${toAvatarId(value)}.webp`;
}

export function getAvatarId(value: string | number | null | undefined): number {
  return toAvatarId(value);
}
