import { Directory, File, Paths } from "expo-file-system";
import { fetch } from "expo/fetch";
import { Platform } from "react-native";

import { getPdfCatalogEntry } from "@/data/pdf-catalog";
import { getPdfRemoteUrl, isPdfHostingConfigured } from "@/lib/pdf-hosting";

const PDF_CACHE_DIR_NAME = "pdf-cache";

function ensurePdfCacheDir(): Directory {
  const dir = new Directory(Paths.cache, PDF_CACHE_DIR_NAME);
  const info = Paths.info(dir.uri);

  if (info.exists) {
    if (info.isDirectory) {
      return dir;
    }

    // Older builds accidentally wrote a file named "pdfs" here — remove it.
    new File(dir.uri).delete();
  }

  dir.create({ idempotent: true, intermediates: true });
  return dir;
}

function getCacheFile(pdfKey: string): File {
  return new File(ensurePdfCacheDir(), `${pdfKey}.pdf`);
}

async function fetchPdfToCache(remoteUrl: string, pdfKey: string): Promise<string> {
  const dest = getCacheFile(pdfKey);
  if (dest.exists) {
    dest.delete();
  }

  const response = await fetch(remoteUrl);
  if (!response.ok) {
    throw new Error(`Failed to download PDF (${response.status})`);
  }

  dest.write(await response.bytes());

  if (!dest.exists || dest.size === 0) {
    throw new Error("Downloaded PDF is empty");
  }

  return dest.uri;
}

/** Public HTTPS URL for in-app viewing (WebView on Android). */
export function getPdfViewerRemoteUrl(pdfKey: string): string | null {
  const entry = getPdfCatalogEntry(pdfKey);
  if (!entry) return null;
  return getPdfRemoteUrl(entry.remotePath);
}

/**
 * Returns a local `file://` URI for sharing / offline reuse.
 * Uses on-device cache after the first successful download.
 */
export async function resolvePdfUri(pdfKey: string): Promise<string> {
  const entry = getPdfCatalogEntry(pdfKey);
  if (!entry) {
    throw new Error("PDF not found");
  }

  const cached = getCacheFile(pdfKey);
  if (cached.exists && cached.size > 0) {
    return cached.uri;
  }

  if (!isPdfHostingConfigured()) {
    throw new Error(
      "PDF hosting is not configured. Set extra.pdfBaseUrl in app.json.",
    );
  }

  const remoteUrl = getPdfRemoteUrl(entry.remotePath);
  if (!remoteUrl) {
    throw new Error("PDF download URL could not be resolved");
  }

  try {
    return await fetchPdfToCache(remoteUrl, pdfKey);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to download PDF";
    throw new Error(
      Platform.OS === "android"
        ? `${message}. Check your connection and pdfBaseUrl.`
        : message,
    );
  }
}

export async function clearPdfCache(pdfKey?: string): Promise<void> {
  if (pdfKey) {
    const file = getCacheFile(pdfKey);
    if (file.exists) file.delete();
    return;
  }

  const legacyDir = new Directory(Paths.cache, "pdfs");
  const legacyInfo = Paths.info(legacyDir.uri);
  if (legacyInfo.exists) {
    if (legacyInfo.isDirectory) {
      legacyDir.delete();
    } else {
      new File(legacyDir.uri).delete();
    }
  }

  const dir = new Directory(Paths.cache, PDF_CACHE_DIR_NAME);
  if (dir.exists) {
    dir.delete();
  }
}
