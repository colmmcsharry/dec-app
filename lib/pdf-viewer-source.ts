import { Platform } from "react-native";
import type { WebViewSource } from "react-native-webview/lib/WebViewTypes";

/** Last-resort Android fallback when the native PDF module is unavailable (Expo Go). */
function googlePdfViewerUrl(pdfUrl: string): string {
  return `https://docs.google.com/gviewer?embedded=true&url=${encodeURIComponent(pdfUrl)}`;
}

export function getPdfWebViewSource(opts: {
  localUri: string | null;
  remoteUrl: string | null;
}): WebViewSource | null {
  const { localUri, remoteUrl } = opts;

  if (localUri) {
    return { uri: localUri };
  }

  if (Platform.OS === "android" && remoteUrl) {
    return { uri: googlePdfViewerUrl(remoteUrl) };
  }

  if (remoteUrl) {
    return { uri: remoteUrl };
  }

  return null;
}
