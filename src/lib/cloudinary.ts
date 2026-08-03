import { createHash } from "node:crypto";

export function cloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  }
) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return publicId;

  const transforms: string[] = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);
  if (options?.quality) transforms.push(`q_${options.quality}`);
  if (options?.format) transforms.push(`f_${options.format}`);

  const transformStr = transforms.length > 0 ? transforms.join(",") + "/" : "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${publicId}`;
}

/**
 * Signs upload-widget parameters with the Cloudinary API secret.
 *
 * Cloudinary's scheme: drop empty values and the params it excludes from
 * signing, sort the rest by key, join as `k=v&k=v`, append the secret, SHA-1.
 * Implemented directly so the server bundle doesn't need the `cloudinary` SDK.
 */
const UNSIGNED_KEYS = new Set([
  "file",
  "cloud_name",
  "resource_type",
  "api_key",
]);

export function signUploadParams(params: Record<string, unknown>): string {
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!secret) throw new Error("CLOUDINARY_API_SECRET is not configured");

  const toSign = Object.entries(params)
    .filter(
      ([key, value]) =>
        !UNSIGNED_KEYS.has(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
    )
    .map(([key, value]) => [key, Array.isArray(value) ? value.join(",") : String(value)])
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1").update(toSign + secret).digest("hex");
}

export function cloudinaryConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}
