import { Asset } from "expo-asset";
import { VideoPlayer } from "@/components/video-player";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { SUPPLEMENTAL_RESOURCES } from "@/data/supplemental-resources";
import { isVideoWatched, markVideoWatched } from "@/services/progress";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const YT_PROXY_BASE = "https://irishslang.ie/yt.html";

function getYouTubeEmbedUrl(url: string) {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );

  if (!match) return url;

  const search = new URLSearchParams({ v: match[1] });
  return `${YT_PROXY_BASE}?${search.toString()}`;
}

function isYouTubeUrl(url?: string) {
  return Boolean(url && /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url));
}

export default function VideoDetailScreen() {
  const { id, title, url, categoryColor, categorySlug } = useLocalSearchParams<{
    id: string;
    title: string;
    url: string;
    categoryColor?: string;
    categorySlug?: string;
  }>();
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [watched, setWatched] = useState(false);
  const [openingResourceKey, setOpeningResourceKey] = useState<string | null>(null);

  const backgroundColor = isDark ? "#1A1A2E" : categoryColor || "#E5D9F2";
  const supplementalResources =
    SUPPLEMENTAL_RESOURCES[`${categorySlug ?? ""}:${id ?? ""}`] ?? [];

  useEffect(() => {
    if (categorySlug && id) {
      isVideoWatched(categorySlug, id).then(setWatched);
    }
  }, [categorySlug, id]);

  const handleMarkWatched = async () => {
    if (categorySlug && id) {
      await markVideoWatched(categorySlug, id);
      setWatched(true);
    }
  };

  const handleOpenResource = async (
    resourceKey: string,
    resource: (typeof supplementalResources)[number]
  ) => {
    if (openingResourceKey) return;

    try {
      setOpeningResourceKey(resourceKey);

      if (resource.assetModule) {
        const asset = Asset.fromModule(resource.assetModule);

        if (!asset.localUri) {
          await asset.downloadAsync();
        }

        const resourceUri = asset.localUri ?? asset.uri;
        if (!resourceUri) {
          throw new Error("Resource URI unavailable");
        }

        if (Platform.OS === "web") {
          await Linking.openURL(asset.uri);
          return;
        }

        await Share.share({
          title: resource.title,
          message: resource.title,
          url: resourceUri,
        });
        return;
      }

      if (resource.url) {
        await Linking.openURL(resource.url);
      }
    } catch {
      Alert.alert(
        "Unable to open resource",
        "Please try again in a moment."
      );
    } finally {
      setOpeningResourceKey(null);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={[styles.customHeader, { paddingTop: insets.top, backgroundColor }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={16}
          style={({ pressed }) => [
            styles.customBackButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={26} color={isDark ? "#ECEDEE" : "#2C3E50"} strokeWidth={2.5} />
          <Text style={[styles.customBackText, { color: isDark ? "#ECEDEE" : "#2C3E50" }]}>
            Back
          </Text>
        </Pressable>
        <Text style={[styles.customHeaderTitle, { color: isDark ? "#ECEDEE" : "#2C3E50" }]}>Now Playing</Text>
        <View style={styles.customHeaderSpacer} />
      </View>
      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.header, { backgroundColor }]}>
          <Text style={[styles.videoTitle, isDark && styles.textDark]}>
            {title}
          </Text>
        </View>

        <View
          style={{
            height: 80,
            backgroundColor: isDark ? "#121222" : "#FFFFFF",
          }}
        />

        <View style={styles.videoContainer}>
          <VideoPlayer videoUrl={url} />
        </View>

        <View style={styles.infoSection}>
          <TouchableOpacity
            style={[styles.watchedButton, watched && styles.watchedButtonDone]}
            onPress={handleMarkWatched}
            disabled={watched}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.watchedButtonText,
                watched && styles.watchedButtonTextDone,
              ]}
            >
              {watched ? "✓  Marked as Watched" : "Mark as Watched"}
            </Text>
          </TouchableOpacity>

          {supplementalResources.length > 0 && (
            <View style={styles.resourcesSection}>
              <Text style={[styles.resourcesTitle, isDark && styles.textDark]}>
                Additional Resources
              </Text>

              {supplementalResources.map((resource, index) => {
                const resourceKey = `${resource.title}-${index}`;
                const isOpening = openingResourceKey === resourceKey;

                return (
                  <View
                    key={`${resource.url ?? resource.title}-${index}`}
                    style={[styles.resourceCard, isDark && styles.resourceCardDark]}
                  >
                    <Text
                      style={[styles.resourceLabel, isDark && styles.subtextDark]}
                    >
                      {resource.title}
                    </Text>
                    {resource.description ? (
                      <Text
                        style={[styles.resourceDescription, isDark && styles.subtextDark]}
                      >
                        {resource.description}
                      </Text>
                    ) : null}

                    {isYouTubeUrl(resource.url) ? (
                      <View style={styles.resourcePlayerWrap}>
                        <WebView
                          style={styles.resourcePlayer}
                          source={{ uri: getYouTubeEmbedUrl(resource.url ?? "") }}
                          allowsInlineMediaPlayback
                          mediaPlaybackRequiresUserAction
                          allowsFullscreenVideo
                          javaScriptEnabled
                        />
                      </View>
                    ) : (
                      <Pressable
                        style={({ pressed }) => [
                          styles.resourceLinkButton,
                          { opacity: pressed || isOpening ? 0.75 : 1 },
                        ]}
                        onPress={() => handleOpenResource(resourceKey, resource)}
                        disabled={isOpening}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${resource.title}`}
                      >
                        <Text style={styles.resourceLinkButtonText}>
                          {isOpening
                            ? "Preparing..."
                            : resource.buttonLabel ??
                              (resource.assetModule ? "Open PDF" : "Open Resource")}
                        </Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 20,
  },
  customBackButton: {
    minWidth: 72,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  customBackText: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    marginLeft: 2,
  },
  customHeaderTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    textAlign: "center",
    flex: 1,
  },
  customHeaderSpacer: {
    minWidth: 72,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#9090A8",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  videoTitle: {
    fontSize: 24,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    lineHeight: 32,
  },
  videoContainer: {
    padding: 16,
    backgroundColor: "#000",
  },
  infoSection: {
    padding: 20,
  },
  watchedButton: {
    backgroundColor: "#7187CE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  watchedButtonDone: {
    backgroundColor: "#5D9B8B",
  },
  watchedButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
  },
  watchedButtonTextDone: {
    opacity: 0.9,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    fontFamily: AppFonts.bodyRegular,
  },
  resourcesSection: {
    marginTop: 12,
    gap: 16,
  },
  resourcesTitle: {
    fontSize: 20,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
  },
  resourceCard: {
    backgroundColor: "#F5F5F7",
    borderRadius: 16,
    padding: 14,
  },
  resourceCardDark: {
    backgroundColor: "#1E1E32",
  },
  resourceLabel: {
    fontSize: 14,
    fontFamily: AppFonts.bodyMedium,
    color: "#6B7280",
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    fontFamily: AppFonts.bodyRegular,
    marginBottom: 12,
  },
  resourcePlayerWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  resourcePlayer: {
    flex: 1,
    backgroundColor: "#000",
  },
  resourceLinkButton: {
    backgroundColor: "#7187CE",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  resourceLinkButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
  },
});
