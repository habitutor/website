export function extractYouTubeId(url?: string | null): string {
  if (!url) return "";

  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&/#]|$)/);

  return match?.[1] ?? "";
}
