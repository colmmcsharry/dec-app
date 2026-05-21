import Constants from "expo-constants";

/**
 * Base URL for streamed media (Netlify now, performancetreanor.com later).
 * Set EXPO_PUBLIC_MEDIA_BASE_URL or app.json extra.mediaBaseUrl — no trailing slash.
 * Example: https://your-site.netlify.app
 */
export function getMediaBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_MEDIA_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const fromExtra = Constants.expoConfig?.extra?.mediaBaseUrl;
  if (typeof fromExtra === "string" && fromExtra.trim()) {
    return fromExtra.trim().replace(/\/$/, "");
  }

  return "";
}

/** Resolve a site-relative media path or pass through an absolute URL. */
export function mediaUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;

  const base = getMediaBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}

export function isMediaConfigured(): boolean {
  return getMediaBaseUrl().length > 0;
}

/** True when a media path can be loaded (absolute URL or configured base host). */
export function isMediaPathReady(path: string): boolean {
  if (/^https?:\/\//i.test(path)) return true;
  return isMediaConfigured();
}
