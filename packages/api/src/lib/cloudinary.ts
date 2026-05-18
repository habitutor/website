import { v2 as cloudinary } from "cloudinary";

let isConfigured = false;

function ensureConfigured(): boolean {
  if (isConfigured) return true;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || cloudName === "your_cloud_name") {
    console.warn("CLOUDINARY_ENV_MISSING: Dummy or missing credentials. Image uploads will be ignored.");
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  isConfigured = true;
  return true;
}

export async function uploadTryoutImage(source: string, folder = "habitutor/tryout/misc") {
  const isConfiguredOk = ensureConfigured();
  if (!isConfiguredOk) {
    // Return original source (base64) so it doesn't crash, or null.
    // Base64 strings are too large for Postgres 'text' column if > 1GB, but usually they are a few MBs.
    // Better to return the base64 string so frontend can see it locally, even if it bloats DB slightly.
    return source;
  }
  const uploaded = await cloudinary.uploader.upload(source, {
    folder,
    resource_type: "image",
    transformation: [
      { width: 1600, height: 1600, crop: "limit" },
      { fetch_format: "auto", quality: "auto:good" },
    ],
  });
  return uploaded.secure_url;
}

export function getCloudinaryPublicIdFromUrl(url: string) {
  try {
    const parsed = new URL(url);
    const marker = "/upload/";
    const idx = parsed.pathname.indexOf(marker);
    if (idx === -1) return null;
    let rest = parsed.pathname.slice(idx + marker.length);
    rest = rest.replace(/^v\d+\//, "");
    const dot = rest.lastIndexOf(".");
    if (dot <= 0) return null;
    return rest.slice(0, dot);
  } catch {
    return null;
  }
}

export async function deleteCloudinaryImageByUrl(url: string | null | undefined) {
  if (!url) return;
  const isConfiguredOk = ensureConfigured();
  if (!isConfiguredOk) return; // Skip if local/dummy config
  const publicId = getCloudinaryPublicIdFromUrl(url);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true,
    });
  } catch (error) {
    console.error("Failed to delete Cloudinary image:", error);
  }
}
