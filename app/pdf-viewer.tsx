import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SymbolView } from "expo-symbols";

import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { NativePdfView } from "@/components/native-pdf-view";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { getPdfCatalogEntry } from "@/data/pdf-catalog";
import { hasBundledPdf } from "@/lib/bundled-pdf-assets";
import { canUseNativePdfViewer } from "@/lib/native-pdf-capability";
import { getPdfViewerRemoteUrl, resolvePdfUri } from "@/lib/resolve-pdf-uri";
import { getPdfWebViewSource } from "@/lib/pdf-viewer-source";
import { requirePdfAccess } from "@/services/purchases";

const LARGE_PDF_LOADING_MESSAGE =
  "This is a very large document. Please be patient, the first load can take 20 - 40 seconds.";

function resolvePdfKey(params: {
  pdfKey?: string;
  downloadId?: string;
  pdfId?: string;
}): string | null {
  if (typeof params.pdfKey === "string" && params.pdfKey.length > 0) {
    return params.pdfKey;
  }
  if (typeof params.downloadId === "string" && params.downloadId.length > 0) {
    return params.downloadId;
  }
  if (typeof params.pdfId === "string" && params.pdfId.length > 0) {
    return params.pdfId;
  }
  return null;
}

function LoadingState({
  isDark,
  isDownloading,
  showPatientMessage,
}: {
  isDark: boolean;
  isDownloading: boolean;
  showPatientMessage: boolean;
}) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#6366F1"} />
      <Text style={[styles.loadingText, isDark && { color: "#9CA3AF" }]}>
        {isDownloading ? "Downloading PDF…" : "Opening PDF…"}
      </Text>
      {showPatientMessage ? (
        <Text style={[styles.patientText, isDark && { color: "#9CA3AF" }]}>
          {LARGE_PDF_LOADING_MESSAGE}
        </Text>
      ) : null}
    </View>
  );
}

export default function PdfViewerScreen() {
  const { pdfKey, downloadId, pdfId, title } = useLocalSearchParams<{
    pdfKey?: string;
    downloadId?: string;
    pdfId?: string;
    title?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const useNativePdf = canUseNativePdfViewer();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [viewerReady, setViewerReady] = useState(false);
  const [showPatientMessage, setShowPatientMessage] = useState(false);

  const resolvedPdfKey = useMemo(
    () => resolvePdfKey({ pdfKey, downloadId, pdfId }),
    [pdfKey, downloadId, pdfId],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (!resolvedPdfKey) {
        if (!cancelled) router.back();
        return;
      }
      const allowed = await requirePdfAccess(resolvedPdfKey);
      if (cancelled) return;
      if (!allowed) {
        router.back();
        return;
      }
      setAccessChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedPdfKey, router]);

  const catalogEntry = useMemo(
    () => (resolvedPdfKey ? getPdfCatalogEntry(resolvedPdfKey) : undefined),
    [resolvedPdfKey],
  );

  const isLargePdf = catalogEntry?.large === true;

  const remoteViewerUrl = useMemo(
    () => (resolvedPdfKey ? getPdfViewerRemoteUrl(resolvedPdfKey) : null),
    [resolvedPdfKey],
  );

  useEffect(() => {
    if (!accessChecked) return;
    if (!resolvedPdfKey) {
      setError("PDF not found");
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        if (
          !remoteViewerUrl &&
          Platform.OS === "android" &&
          !useNativePdf &&
          !hasBundledPdf(resolvedPdfKey)
        ) {
          throw new Error("PDF download URL could not be resolved");
        }

        if (!cancelled) {
          setLocalUri(null);
          setError(null);
          setViewerError(null);
          setViewerReady(false);
          setIsDownloading(true);
        }

        const finalUri = await resolvePdfUri(resolvedPdfKey);

        if (!cancelled) {
          setLocalUri(finalUri);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load PDF");
        }
      } finally {
        if (!cancelled) {
          setIsDownloading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedPdfKey, accessChecked, remoteViewerUrl, useNativePdf]);

  useEffect(() => {
    if (!isLargePdf) {
      setShowPatientMessage(false);
      return;
    }

    if (viewerReady) {
      setShowPatientMessage(false);
      return;
    }

    setShowPatientMessage(true);
  }, [isLargePdf, viewerReady, isDownloading, localUri]);

  const displayTitle =
    typeof title === "string" && title.length > 0
      ? title
      : catalogEntry?.title ?? "Document";

  const handleShare = async () => {
    if (!localUri || sharing) return;
    try {
      setSharing(true);
      if (Platform.OS === "web") {
        window.open(localUri, "_blank");
        return;
      }
      await Share.share({
        title: displayTitle,
        message: displayTitle,
        url: localUri,
      });
    } catch {
      Alert.alert("Unable to share", "Please try again in a moment.");
    } finally {
      setSharing(false);
    }
  };

  const handleOpenInBrowser = () => {
    if (!remoteViewerUrl) return;
    void Linking.openURL(remoteViewerUrl);
  };

  const webViewSource = useMemo(
    () =>
      getPdfWebViewSource({
        localUri,
        remoteUrl: remoteViewerUrl,
      }),
    [localUri, remoteViewerUrl],
  );

  const waitingForDownload = accessChecked && !error && !localUri;

  const showViewer =
    accessChecked &&
    !error &&
    !viewerError &&
    (useNativePdf ? !!localUri : webViewSource != null);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={[
          styles.container,
          isDark && styles.containerDark,
          { paddingTop: insets.top },
        ]}
      >
        <View
          style={[
            styles.header,
            isDark && styles.headerDark,
            { zIndex: 10, elevation: 10 },
          ]}
        >
          <ScreenBackButton color={isDark ? "#ECEDEE" : "#2C3E50"} />
          <Text
            pointerEvents="none"
            style={[styles.headerTitle, isDark && styles.headerTitleDark]}
            numberOfLines={1}
          >
            {displayTitle}
          </Text>
          <TouchableOpacity
            onPress={handleShare}
            style={[
              styles.shareHit,
              (!localUri || sharing) && styles.iconBtnDisabled,
            ]}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            disabled={!localUri || sharing}
            accessibilityRole="button"
            accessibilityLabel="Share or save PDF"
          >
            <View pointerEvents="none">
              <SymbolView
                name="square.and.arrow.up"
                size={22}
                tintColor={
                  !localUri || sharing
                    ? isDark
                      ? "#4B5563"
                      : "#9CA3AF"
                    : isDark
                      ? "#E5E7EB"
                      : "#374151"
                }
                fallback={
                  <Ionicons
                    name="share-outline"
                    size={22}
                    color={
                      !localUri || sharing
                        ? isDark
                          ? "#4B5563"
                          : "#9CA3AF"
                        : isDark
                          ? "#E5E7EB"
                          : "#374151"
                    }
                  />
                }
              />
            </View>
          </TouchableOpacity>
        </View>

        {error || viewerError ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, isDark && { color: "#F87171" }]}>
              {error ?? viewerError}
            </Text>
            {viewerError && remoteViewerUrl ? (
              <TouchableOpacity
                onPress={handleOpenInBrowser}
                style={styles.fallbackBtn}
                accessibilityRole="button"
                accessibilityLabel="Open PDF in browser"
              >
                <Text style={[styles.fallbackBtnText, isDark && { color: "#A5B4FC" }]}>
                  Open in browser
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : waitingForDownload ? (
          <LoadingState
            isDark={isDark}
            isDownloading={isDownloading}
            showPatientMessage={showPatientMessage}
          />
        ) : showViewer && useNativePdf && localUri ? (
          <View style={styles.viewerWrap}>
            <NativePdfView
              uri={localUri}
              isDark={isDark}
              onError={(message) => setViewerError(message)}
              onLoadComplete={() => setViewerReady(true)}
            />
            {!viewerReady && showPatientMessage ? (
              <View style={[styles.patientOverlay, isDark && styles.patientOverlayDark]}>
                <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#6366F1"} />
                <Text style={[styles.patientText, isDark && { color: "#D1D5DB" }]}>
                  {LARGE_PDF_LOADING_MESSAGE}
                </Text>
              </View>
            ) : null}
          </View>
        ) : showViewer ? (
          <View style={styles.viewerWrap}>
            <WebView
              source={webViewSource!}
              style={[styles.webview, isDark && { backgroundColor: "#1A1D2E" }]}
              originWhitelist={["*"]}
              startInLoadingState
              javaScriptEnabled
              domStorageEnabled
              allowFileAccess
              allowFileAccessFromFileURLs
              allowUniversalAccessFromFileURLs
              onError={() => setViewerError("Failed to display PDF")}
              onHttpError={() => setViewerError("Failed to display PDF")}
              onLoadEnd={() => setViewerReady(true)}
              renderLoading={() => (
                <View style={[styles.center, StyleSheet.absoluteFill]}>
                  <ActivityIndicator size="large" color="#6366F1" />
                </View>
              )}
            />
            {!viewerReady && showPatientMessage ? (
              <View style={[styles.patientOverlay, isDark && styles.patientOverlayDark]}>
                <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#6366F1"} />
                <Text style={[styles.patientText, isDark && { color: "#D1D5DB" }]}>
                  {LARGE_PDF_LOADING_MESSAGE}
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <LoadingState
            isDark={isDark}
            isDownloading={isDownloading}
            showPatientMessage={showPatientMessage}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  containerDark: {
    backgroundColor: "#1A1D2E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  headerDark: {
    borderBottomColor: "#2D3044",
  },
  shareHit: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  iconBtnDisabled: {
    opacity: 0.6,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    color: "#1F2937",
    marginHorizontal: 4,
  },
  headerTitleDark: {
    color: "#F3F4F6",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  patientText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    textAlign: "center",
    fontFamily: AppFonts.bodyRegular,
    marginTop: 4,
  },
  errorText: {
    fontSize: 15,
    color: "#EF4444",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  fallbackBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  fallbackBtnText: {
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
    color: "#6366F1",
  },
  viewerWrap: {
    flex: 1,
  },
  patientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 32,
    backgroundColor: "rgba(249, 250, 251, 0.92)",
  },
  patientOverlayDark: {
    backgroundColor: "rgba(26, 29, 46, 0.92)",
  },
  webview: {
    flex: 1,
    zIndex: 0,
    backgroundColor: "#F9FAFB",
  },
});
