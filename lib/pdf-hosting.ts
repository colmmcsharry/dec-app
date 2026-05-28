import Constants from "expo-constants";

/** Public Netlify host — bundled fallback when manifest extra is unavailable (e.g. Expo Go). */
export const DEFAULT_PDF_BASE_URL = "https://dailydiesel.netlify.app";

/**
 * Base URL for hosted PDFs (Dropbox direct links, Netlify, etc.).
 * Set EXPO_PUBLIC_PDF_BASE_URL or app.json extra.pdfBaseUrl — no trailing slash.
 *
 * Dropbox: use a folder mirrored to Netlify, or set per-file URLs in the catalog.
 * Shared links must use direct download (`dl=1` or dl.dropboxusercontent.com).
 */
export function getPdfBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_PDF_BASE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const extra =
    Constants.expoConfig?.extra ??
    Constants.manifest2?.extra?.expoClient?.extra ??
    Constants.manifest?.extra;

  const fromExtra = extra?.pdfBaseUrl;
  if (typeof fromExtra === "string" && fromExtra.trim()) {
    return fromExtra.trim().replace(/\/$/, "");
  }

  return DEFAULT_PDF_BASE_URL;
}

export function isPdfHostingConfigured(): boolean {
  return getPdfBaseUrl().length > 0;
}

/** Ensure Dropbox share links download rather than preview in a browser tab. */
export function toDirectDownloadUrl(url: string): string {
  if (/dropbox\.com\//i.test(url) && !/dropboxusercontent\.com/i.test(url)) {
    return url.replace(/(\?dl=)0\b/, "$1").replace(/\?$/, "") + (url.includes("?") ? "&dl=1" : "?dl=1");
  }
  return url;
}

/** Resolve a catalog `remotePath` to a fetch URL under pdfBaseUrl. */
export function getPdfRemoteUrl(remotePath: string): string | null {
  const base = getPdfBaseUrl();
  if (!base) return null;

  const encoded = remotePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return toDirectDownloadUrl(`${base}/${encoded}`);
}
