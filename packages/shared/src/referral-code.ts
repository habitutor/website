/** Huruf tanpa karakter yang mirip (0/O, 1/I/L) supaya kode mudah diketik dari screenshot. */
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const FRIENDLY_CODE_LENGTH = 8;
export const LEGACY_CODE_LENGTH = 11;

export function generateFriendlyCode(
  random: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n)),
) {
  return Array.from(random(FRIENDLY_CODE_LENGTH))
    .map((byte) => CODE_CHARS[byte % CODE_CHARS.length])
    .join("");
}
