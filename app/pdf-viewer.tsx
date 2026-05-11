import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Asset } from "expo-asset";
import {
  cacheDirectory,
  copyAsync,
} from "expo-file-system";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { ChevronLeft, Share2 } from "lucide-react-native";

import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_PDFS } from "@/data/pdf-assets";

export default function PdfViewerScreen() {
  const { slug, pdfId, assetId, title } = useLocalSearchParams<{
    slug?: string;
    pdfId?: string;
    assetId?: string;
    title?: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const resolvedAsset = useMemo<{ module: number; id: string } | null>(() => {
    if (assetId) {
      const moduleId = Number(assetId);
      if (!Number.isFinite(moduleId)) return null;
      return { module: moduleId, id: `asset-${moduleId}` };
    }

    if (slug && pdfId) {
      const pdfs = MODULE_PDFS[slug];
      const entry = pdfs?.find((p) => p.id === pdfId);
      if (!entry) return null;
      return { module: entry.asset, id: entry.id };
    }

    return null;
  }, [assetId, slug, pdfId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        if (!resolvedAsset) {
          setError("PDF not found");
          return;
        }

        const asset = Asset.fromModule(resolvedAsset.module);
        await asset.downloadAsync();

        let finalUri: string | null = null;
        if (Platform.OS === "android") {
          const dest = `${cacheDirectory}${resolvedAsset.id}.pdf`;
          if (asset.localUri) {
            await copyAsync({ from: asset.localUri, to: dest });
          }
          finalUri = dest;
        } else {
          finalUri = asset.localUri ?? null;
        }

        if (!cancelled) setLocalUri(finalUri);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load PDF");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedAsset]);

  const displayTitle =
    typeof title === "string" && title.length > 0 ? title : "Document";

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
      Alert.alert(
        "Unable to share",
        "Please try again in a moment."
      );
    } finally {
      setSharing(false);
    }
  };

  const viewerSource = useMemo(() => {
    if (!localUri) return null;
    if (Platform.OS === "android") {
      // Android WebView can't render file:// PDFs natively; use Google's viewer.
      const encoded = encodeURIComponent(localUri);
      return { uri: `https://docs.google.com/gview?embedded=1&url=${encoded}` };
    }
    return { uri: localUri };
  }, [localUri]);

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
          <Pressable
            onPress={() => router.back()}
            hitSlop={16}
            style={({ pressed }) => [
              styles.backRow,
              { opacity: pressed ? 0.65 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <View pointerEvents="none">
              <ChevronLeft
                size={26}
                color={isDark ? "#ECEDEE" : "#2C3E50"}
                strokeWidth={2.5}
              />
            </View>
            <Text
              style={[styles.backLabel, { color: isDark ? "#ECEDEE" : "#2C3E50" }]}
            >
              Back
            </Text>
          </Pressable>
          <Text
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
              <Share2
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
            </View>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, isDark && { color: "#F87171" }]}>
              {error}
            </Text>
          </View>
        ) : !viewerSource ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#6366F1"} />
            <Text style={[styles.loadingText, isDark && { color: "#9CA3AF" }]}>
              Loading PDF…
            </Text>
          </View>
        ) : (
          <WebView
            source={viewerSource}
            style={[styles.webview, isDark && { backgroundColor: "#1A1D2E" }]}
            originWhitelist={["*"]}
            startInLoadingState
            androidLayerType="hardware"
            renderLoading={() => (
              <View style={[styles.center, StyleSheet.absoluteFill]}>
                <ActivityIndicator size="large" color="#6366F1" />
              </View>
            )}
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
  /** Same tap target pattern as `app/video/[id].tsx` — wide row, not a tiny chevron-only hit area. */
  backRow: {
    minWidth: 72,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  backLabel: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    marginLeft: 2,
  },
  /** Mirrors back row width so the title stays visually centred. */
  shareHit: {
    minWidth: 72,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
  },
  loadingText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    color: "#EF4444",
  },
  webview: {
    flex: 1,
    zIndex: 0,
    backgroundColor: "#F9FAFB",
  },
});
