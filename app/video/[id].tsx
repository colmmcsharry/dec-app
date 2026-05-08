import { CelebrationBadge } from "@/components/celebration-badge";
import { VideoPlayer } from "@/components/video-player";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_VIDEOS } from "@/data/module-videos";
import { MODULE_WORKBOOKS } from "@/data/module-workbooks";
import { SUPPLEMENTAL_RESOURCES } from "@/data/supplemental-resources";
import {
  getWatchedVideos,
  isVideoWatched,
  markVideoWatched,
} from "@/services/progress";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Modal,
  Pressable,
  ScrollView,
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
  const scrollRef = useRef<ScrollView | null>(null);
  const [watched, setWatched] = useState(false);
  const [openingResourceKey, setOpeningResourceKey] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const backgroundColor = isDark ? "#1A1A2E" : categoryColor || "#E5D9F2";
  const supplementalResources =
    SUPPLEMENTAL_RESOURCES[`${categorySlug ?? ""}:${id ?? ""}`] ?? [];

  const nextVideo = useMemo(() => {
    if (!categorySlug || !id) return null;
    const list = MODULE_VIDEOS[categorySlug];
    if (!list) return null;
    const index = list.findIndex((v) => v.id === id);
    if (index === -1 || index >= list.length - 1) return null;
    return list[index + 1];
  }, [categorySlug, id]);

  const moduleDef = categorySlug ? MODULE_WORKBOOKS[categorySlug] : undefined;

  useEffect(() => {
    setWatched(false);
    setOpeningResourceKey(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    if (categorySlug && id) {
      isVideoWatched(categorySlug, id).then(setWatched);
    }
  }, [categorySlug, id]);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const dismissCompletion = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setShowCompletion(false));
  }, [backdropAnim, cardAnim]);

  const triggerCompletion = useCallback(() => {
    backdropAnim.setValue(0);
    cardAnim.setValue(0);
    setShowCompletion(true);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(cardAnim, {
        toValue: 1,
        friction: 7,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      dismissCompletion();
    }, 4400);
  }, [backdropAnim, cardAnim, dismissCompletion]);

  const handleMarkWatched = async () => {
    if (!categorySlug || !id) return;
    await markVideoWatched(categorySlug, id);
    setWatched(true);

    const list = MODULE_VIDEOS[categorySlug];
    if (!list || list.length === 0) return;
    const allWatched = await getWatchedVideos(categorySlug);
    const watchedSet = new Set(allWatched);
    const moduleNowComplete = list.every((v) => watchedSet.has(v.id));
    if (moduleNowComplete) {
      triggerCompletion();
    }
  };

  const handleNextVideo = () => {
    if (!nextVideo) return;
    router.replace({
      pathname: "/video/[id]",
      params: {
        id: nextVideo.id,
        title: nextVideo.title,
        url: nextVideo.url,
        categoryColor: categoryColor ?? "",
        categorySlug: categorySlug ?? "",
      },
    });
  };

  const handleOpenResource = async (
    resourceKey: string,
    resource: (typeof supplementalResources)[number]
  ) => {
    if (openingResourceKey) return;

    try {
      setOpeningResourceKey(resourceKey);

      if (resource.assetModule) {
        router.push({
          pathname: "/pdf-viewer",
          params: {
            assetId: String(resource.assetModule),
            title: resource.title,
          },
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
        ref={scrollRef}
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

          {watched && (
            nextVideo ? (
              <Pressable
                style={({ pressed }) => [
                  styles.nextVideoButton,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={handleNextVideo}
                accessibilityRole="button"
                accessibilityLabel={`Play next video, ${nextVideo.title}`}
              >
                <Text style={styles.nextVideoTitle} numberOfLines={1}>
                  Next: {nextVideo.title}
                </Text>
                <ChevronRight size={20} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.backToModuleButton,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back to module"
              >
                <Text style={styles.backToModuleButtonText}>
                  Back to Module
                </Text>
              </Pressable>
            )
          )}

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

      <Modal
        visible={showCompletion}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={dismissCompletion}
      >
        <Pressable style={styles.completionRoot} onPress={dismissCompletion}>
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              styles.completionBackdrop,
              { opacity: backdropAnim },
            ]}
          />
          <Animated.View
            style={[
              styles.completionCard,
              isDark && styles.completionCardDark,
              {
                opacity: cardAnim,
                transform: [
                  {
                    scale: cardAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.85, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.completionBadgeWrap}>
              <CelebrationBadge active={showCompletion} />
            </View>
            <Text
              style={[styles.completionTitle, isDark && styles.textDark]}
            >
              Module Complete!
            </Text>
            {moduleDef && (
              <Text
                style={[
                  styles.completionSubtitle,
                  isDark && styles.subtextDark,
                ]}
              >
                Module {moduleDef.moduleNumber} · {moduleDef.title}
              </Text>
            )}
            <Text
              style={[styles.completionBody, isDark && styles.subtextDark]}
            >
              You&apos;ve finished every video in this module. Thanks for showing up — keep the momentum going!
            </Text>
          </Animated.View>
        </Pressable>
      </Modal>
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
  nextVideoButton: {
    backgroundColor: "#7187CE",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: -8,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  nextVideoTitle: {
    flexShrink: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
    textAlign: "center",
  },
  backToModuleButton: {
    backgroundColor: "#7187CE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: -8,
    marginBottom: 20,
  },
  backToModuleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
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
  completionRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  completionBackdrop: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  completionCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  completionCardDark: {
    backgroundColor: "#1E1E32",
  },
  completionBadgeWrap: {
    marginBottom: 18,
  },
  completionTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 6,
  },
  completionSubtitle: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    color: "#5D9B8B",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  completionBody: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: AppFonts.bodyRegular,
    color: "#6B7280",
    textAlign: "center",
  },
});
