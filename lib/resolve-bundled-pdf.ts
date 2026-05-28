import { Asset } from "expo-asset";
import { File, Paths } from "expo-file-system";
import { fetch } from "expo/fetch";
import { Image, Platform } from "react-native";

const ANDROID_EMBEDDED_PREFIX = "file:///android_res/";

function isBareAndroidResource(uri: string): boolean {
  return !uri.includes("://");
}

function toAndroidEmbeddedRawUri(resourceName: string): string {
  const normalized = resourceName.startsWith("assets_")
    ? resourceName
    : `assets_${resourceName}`;
  return `${ANDROID_EMBEDDED_PREFIX}raw/${normalized}.pdf`;
}

async function copyToAndroidCache(sourceUri: string, cacheKey: string): Promise<string> {
  const dest = new File(Paths.cache, `${cacheKey}.pdf`);
  if (dest.exists) {
    dest.delete();
  }
  new File(sourceUri).copy(dest);
  return dest.uri;
}

async function fetchToAndroidCache(sourceUri: string, cacheKey: string): Promise<string> {
  const dest = new File(Paths.cache, `${cacheKey}.pdf`);
  if (dest.exists) {
    dest.delete();
  }

  const response = await fetch(sourceUri);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF (${response.status})`);
  }

  dest.write(await response.bytes());
  return dest.uri;
}

async function resolveEmbeddedAndroidPdf(
  uri: string,
  cacheKey: string,
): Promise<string> {
  const embeddedUri = uri.startsWith(ANDROID_EMBEDDED_PREFIX)
    ? uri
    : toAndroidEmbeddedRawUri(uri);

  const embeddedAsset = Asset.fromURI(embeddedUri);
  await embeddedAsset.downloadAsync();

  if (!embeddedAsset.localUri) {
    throw new Error("PDF asset missing local URI");
  }

  // Normalise to a stable cache filename for sharing / reloads.
  return copyToAndroidCache(embeddedAsset.localUri, cacheKey);
}

/**
 * Resolves a Metro `require()` asset id to a local `file://` URI for viewing.
 * Avoids `Asset.downloadAsync()` on Android, which often rejects for bundled PDFs.
 */
export async function resolveBundledPdfUri(
  moduleId: number,
  cacheKey: string,
): Promise<string> {
  const resolved = Image.resolveAssetSource(moduleId);
  if (!resolved?.uri) {
    throw new Error("PDF asset not found");
  }

  const uri = resolved.uri;

  if (Platform.OS === "ios") {
    if (uri.startsWith("file://") && !uri.startsWith(ANDROID_EMBEDDED_PREFIX)) {
      return uri;
    }

    const asset = Asset.fromModule(moduleId);
    await asset.downloadAsync();
    if (!asset.localUri) {
      throw new Error("PDF asset missing local URI");
    }
    return asset.localUri;
  }

  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    return fetchToAndroidCache(uri, cacheKey);
  }

  if (uri.startsWith("file://") && !uri.startsWith(ANDROID_EMBEDDED_PREFIX)) {
    return copyToAndroidCache(uri, cacheKey);
  }

  if (isBareAndroidResource(uri) || uri.startsWith(ANDROID_EMBEDDED_PREFIX)) {
    return resolveEmbeddedAndroidPdf(uri, cacheKey);
  }

  throw new Error("Unsupported PDF asset URI");
}
