import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Asset } from "expo-asset";
import {
  cacheDirectory,
  copyAsync,
} from "expo-file-system";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";

import { useTheme } from "@/context/theme-context";
import { MODULE_PDFS } from "@/data/pdf-assets";

export default function PdfViewerScreen() {
  const { slug, pdfId, title } = useLocalSearchParams<{
    slug: string;
    pdfId: string;
    title: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const pdfs = MODULE_PDFS[slug ?? ""];
        const entry = pdfs?.find((p) => p.id === pdfId);
        if (!entry) {
          setError("PDF not found");
          return;
        }

        const asset = Asset.fromModule(entry.asset);
        await asset.downloadAsync();

        if (Platform.OS === "android") {
          const dest = `${cacheDirectory}${entry.id}.pdf`;
          if (asset.localUri) {
            await copyAsync({ from: asset.localUri, to: dest });
          }
          setLocalUri(dest);
        } else {
          setLocalUri(asset.localUri ?? null);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load PDF");
      }
    })();
  }, [slug, pdfId]);

  const displayTitle =
    typeof title === "string" ? title : "Document";

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
        <View style={[styles.header, isDark && styles.headerDark]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={12}
          >
            <ChevronLeft size={24} color={isDark ? "#E5E7EB" : "#374151"} />
          </TouchableOpacity>
          <Text
            style={[styles.headerTitle, isDark && styles.headerTitleDark]}
            numberOfLines={1}
          >
            {displayTitle}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {error ? (
          <View style={styles.center}>
            <Text style={[styles.errorText, isDark && { color: "#F87171" }]}>
              {error}
            </Text>
          </View>
        ) : !localUri ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={isDark ? "#818CF8" : "#6366F1"} />
            <Text style={[styles.loadingText, isDark && { color: "#9CA3AF" }]}>
              Loading PDF…
            </Text>
          </View>
        ) : (
          <WebView
            source={{ uri: localUri }}
            style={[styles.webview, isDark && { backgroundColor: "#1A1D2E" }]}
            originWhitelist={["*"]}
            startInLoadingState
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },
  headerDark: {
    borderBottomColor: "#2D3044",
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
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
    backgroundColor: "#F9FAFB",
  },
});
