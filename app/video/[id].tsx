import { CelebrationBadge } from "@/components/celebration-badge";
import {
  MODULE_CARD_BRIGHTEN_SCRIMS,
  MODULE_CARD_DARK_SCRIMS,
  MODULE_HEADER_BACKGROUNDS,
} from "@/components/module-card-art";
import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { VideoPlayer, buildVimeoEmbedUrl, type VideoPlayerHandle } from "@/components/video-player";
import { MODULE_ORDER, MODULE_THEMES } from "@/constants/module-themes";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_VIDEOS } from "@/data/module-videos";
import { MODULE_WORKBOOKS } from "@/data/module-workbooks";
import { SUPPLEMENTAL_RESOURCES } from "@/data/supplemental-resources";
import {
  isVideoWatched,
  markVideoWatched,
} from "@/services/progress";
import {
  getVideoAutoplayEnabled,
  setVideoAutoplayEnabled,
} from "@/services/video-autoplay";
import { maybeRequestReviewAfterFirstModuleCompleted } from "@/services/app-review";
import {
  hasProEntitlement,
  requireModuleAccess,
  requirePro,
} from "@/services/purchases";
import { isFreeModule, isFreePreviewVideo } from "@/lib/free-preview-video";
import { useLowPowerMode } from "expo-battery";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Check, ChevronRight, Lock } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  ImageBackground,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const YT_PROXY_BASE = "https://irishslang.ie/yt.html";
const COMPLETION_COUNTDOWN_SECONDS = 5;

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
  const isLowPowerMode = useLowPowerMode();
  const scrollRef = useRef<ScrollView | null>(null);
  const videoPlayerRef = useRef<VideoPlayerHandle>(null);
  const [streamIndex, setStreamIndex] = useState<number | null>(null);
  const [watched, setWatched] = useState(false);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [hasPro, setHasPro] = useState(false);
  const [openingResourceKey, setOpeningResourceKey] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionCountdown, setCompletionCountdown] = useState(
    COMPLETION_COUNTDOWN_SECONDS,
  );

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const completionNavigatedRef = useRef(false);
  const endedHandledRef = useRef(false);
  const autoplayEnabledRef = useRef(autoplayEnabled);
  autoplayEnabledRef.current = autoplayEnabled;

  const backgroundColor = isDark ? "#1A1A2E" : categoryColor || "#E5D9F2";
  const moduleBackground = categorySlug
    ? MODULE_HEADER_BACKGROUNDS[categorySlug]
    : undefined;
  const isSleep = categorySlug === "sleep";
  const lightOnArt = Boolean(moduleBackground) && (isDark || isSleep);
  const overlayScrim =
    !categorySlug || !moduleBackground || isSleep
      ? undefined
      : isDark
        ? MODULE_CARD_DARK_SCRIMS[categorySlug]
        : MODULE_CARD_BRIGHTEN_SCRIMS[categorySlug];
  const headerFg = lightOnArt
    ? "#FFFFFF"
    : isDark
      ? "#ECEDEE"
      : "#2C3E50";
  const pageBackground = isDark ? "#121222" : "#FFFFFF";

  const moduleVideos = categorySlug ? (MODULE_VIDEOS[categorySlug] ?? []) : [];
  const routeVideoIndex = useMemo(
    () => moduleVideos.findIndex((v) => v.id === id),
    [id, moduleVideos],
  );
  const currentIndex =
    streamIndex ?? (routeVideoIndex >= 0 ? routeVideoIndex : 0);
  const activeVideo = moduleVideos[currentIndex] ?? {
    id: id ?? "",
    title: title ?? "",
    url: url ?? "",
  };
  const activeVideoId = activeVideo.id;
  const activeVideoTitle = activeVideo.title;
  const activeVideoUrl = activeVideo.url;

  const supplementalResources =
    SUPPLEMENTAL_RESOURCES[`${categorySlug ?? ""}:${activeVideoId}`] ?? [];

  const nextVideo = useMemo(() => {
    if (moduleVideos.length === 0) return null;
    if (currentIndex < 0 || currentIndex >= moduleVideos.length - 1) return null;
    return moduleVideos[currentIndex + 1];
  }, [currentIndex, moduleVideos]);

  const moduleIsFree = isFreeModule(categorySlug);
  // Free modules can chain fully; premium modules need Pro.
  const canChainToNextVideo = hasPro || moduleIsFree;

  const nextVideoEmbedUrl = useMemo(() => {
    if (!autoplayEnabled || !nextVideo || !canChainToNextVideo) return null;
    return buildVimeoEmbedUrl(nextVideo.url);
  }, [autoplayEnabled, canChainToNextVideo, nextVideo]);

  const moduleDef = categorySlug ? MODULE_WORKBOOKS[categorySlug] : undefined;

  const nextModuleInfo = useMemo(() => {
    if (!categorySlug) return null;
    const idx = (MODULE_ORDER as readonly string[]).indexOf(categorySlug);
    if (idx < 0 || idx >= MODULE_ORDER.length - 1) return null;
    const slug = MODULE_ORDER[idx + 1];
    const theme = MODULE_THEMES[slug];
    return {
      slug,
      title: theme.shortName,
      moduleNumber: idx + 2,
    };
  }, [categorySlug]);

  useEffect(() => {
    endedHandledRef.current = false;
    setStreamIndex(null);
    setWatched(false);
    setOpeningResourceKey(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    if (categorySlug && id) {
      isVideoWatched(categorySlug, id).then(setWatched);
    }
  }, [categorySlug, id]);

  useEffect(() => {
    if (streamIndex === null) return;

    endedHandledRef.current = false;
    setWatched(false);
    setOpeningResourceKey(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });

    if (categorySlug && activeVideoId) {
      isVideoWatched(categorySlug, activeVideoId).then(setWatched);
    }
  }, [activeVideoId, categorySlug, streamIndex]);

  useEffect(() => {
    void getVideoAutoplayEnabled().then(setAutoplayEnabled);
  }, []);

  useEffect(() => {
    void hasProEntitlement().then(setHasPro);
  }, [activeVideoId, categorySlug, streamIndex]);

  useEffect(() => {
    if (!categorySlug || !activeVideoId) return;
    if (isFreeModule(categorySlug)) return;
    if (isFreePreviewVideo(categorySlug, activeVideoId)) return;
    void (async () => {
      const pro = await hasProEntitlement();
      if (!pro) router.replace("/paywall-placeholder");
    })();
  }, [activeVideoId, categorySlug, router]);

  const clearCompletionTimers = useCallback(() => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearCompletionTimers();
    };
  }, [clearCompletionTimers]);

  const hideCompletionOverlay = useCallback(
    (afterHide?: () => void) => {
      clearCompletionTimers();
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
      ]).start(() => {
        setShowCompletion(false);
        requestAnimationFrame(() => {
          afterHide?.();
        });
      });
    },
    [backdropAnim, cardAnim, clearCompletionTimers],
  );

  const goToNextModule = useCallback(async () => {
    if (completionNavigatedRef.current || !nextModuleInfo) return;
    if (!(await requireModuleAccess(nextModuleInfo.slug))) return;
    completionNavigatedRef.current = true;
    hideCompletionOverlay(() => {
      router.replace({
        pathname: "/category/[slug]",
        params: {
          slug: nextModuleInfo.slug,
          title: nextModuleInfo.title,
        },
      });
    });
  }, [hideCompletionOverlay, nextModuleInfo, router]);

  const dismissCompletion = useCallback(() => {
    hideCompletionOverlay();
  }, [hideCompletionOverlay]);

  const triggerCompletion = useCallback(() => {
    completionNavigatedRef.current = false;
    backdropAnim.setValue(0);
    cardAnim.setValue(0);
    setCompletionCountdown(COMPLETION_COUNTDOWN_SECONDS);
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

    clearCompletionTimers();

    if (nextModuleInfo) {
      countdownIntervalRef.current = setInterval(() => {
        setCompletionCountdown((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
              countdownIntervalRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      dismissTimerRef.current = setTimeout(() => {
        dismissCompletion();
      }, COMPLETION_COUNTDOWN_SECONDS * 1000);
    }
  }, [
    backdropAnim,
    cardAnim,
    clearCompletionTimers,
    dismissCompletion,
    nextModuleInfo,
  ]);

  useEffect(() => {
    if (!showCompletion || !nextModuleInfo) return;
    if (completionCountdown === 0) {
      goToNextModule();
    }
  }, [
    completionCountdown,
    goToNextModule,
    nextModuleInfo,
    showCompletion,
  ]);

  const handleNextVideo = useCallback(() => {
    if (!nextVideo || moduleVideos.length === 0) return;
    const embedUrl = buildVimeoEmbedUrl(nextVideo.url);
    setStreamIndex((prev) => {
      const base = prev ?? (routeVideoIndex >= 0 ? routeVideoIndex : 0);
      return base + 1;
    });
    videoPlayerRef.current?.loadAndPlay(embedUrl);
  }, [moduleVideos.length, nextVideo, routeVideoIndex]);

  const markCurrentVideoWatched = useCallback(async () => {
    if (!categorySlug || !activeVideoId) {
      return { finishedLastVideo: false };
    }

    await markVideoWatched(categorySlug, activeVideoId);
    setWatched(true);

    const isLastVideoInModule =
      moduleVideos.length > 0 &&
      moduleVideos[moduleVideos.length - 1].id === activeVideoId;

    if (isLastVideoInModule) {
      // Review prompt only after finishing Module 1 end-to-end.
      if (categorySlug === MODULE_ORDER[0]) {
        void maybeRequestReviewAfterFirstModuleCompleted();
      }
      triggerCompletion();
      return { finishedLastVideo: true };
    }
    return { finishedLastVideo: false };
  }, [activeVideoId, categorySlug, moduleVideos, triggerCompletion]);

  const handleMarkWatched = async () => {
    await markCurrentVideoWatched();
  };

  const handleVideoEnded = useCallback(
    async (continued: boolean) => {
      if (endedHandledRef.current || !categorySlug || !activeVideoId) return;
      endedHandledRef.current = true;

      const { finishedLastVideo } = await markCurrentVideoWatched();
      if (finishedLastVideo) return;

      // Free users stop at the end of free modules; Pro/trial continue.
      if (!canChainToNextVideo) return;

      if (continued && canChainToNextVideo) {
        setStreamIndex((prev) => {
          const base = prev ?? (routeVideoIndex >= 0 ? routeVideoIndex : 0);
          return base + 1;
        });
        // If play() briefly stalled after loadVideo, nudge it again.
        setTimeout(() => {
          videoPlayerRef.current?.ensurePlaying();
        }, 700);
        return;
      }

      if (autoplayEnabledRef.current && nextVideo && canChainToNextVideo) {
        handleNextVideo();
        setTimeout(() => {
          videoPlayerRef.current?.ensurePlaying();
        }, 900);
      }
    },
    [
      activeVideoId,
      canChainToNextVideo,
      categorySlug,
      handleNextVideo,
      markCurrentVideoWatched,
      nextVideo,
      routeVideoIndex,
    ],
  );

  const handlePlayNextVideo = async () => {
    if (!nextVideo) return;
    if (!moduleIsFree && !(await requirePro())) return;
    handleNextVideo();
  };

  const handleAutoplayToggle = (enabled: boolean) => {
    setAutoplayEnabled(enabled);
    void setVideoAutoplayEnabled(enabled);
  };

  const handleOpenResource = async (
    resourceKey: string,
    resource: (typeof supplementalResources)[number]
  ) => {
    if (openingResourceKey) return;
    if (!(await requireModuleAccess(categorySlug ?? ""))) return;

    try {
      setOpeningResourceKey(resourceKey);

      if (resource.pdfKey) {
        router.push({
          pathname: "/pdf-viewer",
          params: {
            pdfKey: resource.pdfKey,
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
      <View style={{ flex: 1, backgroundColor: pageBackground }}>
      <View
        style={[
          styles.heroHeader,
          {
            paddingTop: insets.top + 4,
            backgroundColor,
          },
        ]}
      >
        {moduleBackground ? (
          <ImageBackground
            source={moduleBackground}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
        ) : null}
        {overlayScrim ? (
          <LinearGradient
            colors={[overlayScrim[0], overlayScrim[1]]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        ) : null}

        <View style={styles.heroNavRow}>
          <ScreenBackButton color={headerFg} />
          <Text
            pointerEvents="none"
            style={[styles.customHeaderTitle, { color: headerFg }]}
          >
            Now Playing
          </Text>
          {moduleVideos.length > 0 ? (
            <Text
              pointerEvents="none"
              style={[styles.videoCounter, { color: headerFg }]}
            >
              {currentIndex + 1}/{moduleVideos.length}
            </Text>
          ) : (
            <View pointerEvents="none" style={styles.customHeaderSpacer} />
          )}
        </View>

        <Text
          pointerEvents="none"
          style={[
            styles.videoTitle,
            lightOnArt ? styles.videoTitleOnArt : null,
            !lightOnArt && isDark ? styles.textDark : null,
          ]}
        >
          {activeVideoTitle}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.videoContainer}>
          <VideoPlayer
            ref={videoPlayerRef}
            key={`${categorySlug ?? ""}-${id ?? ""}`}
            videoUrl={activeVideoUrl}
            nextVideoEmbedUrl={nextVideoEmbedUrl}
            onEnded={handleVideoEnded}
          />
        </View>

        <View style={styles.infoSection}>
          {canChainToNextVideo ? (
            <View style={[styles.autoplayRow, isDark && styles.autoplayRowDark]}>
              <View style={styles.autoplayCopy}>
                <Text
                  style={[
                    styles.autoplayLabel,
                    isDark && styles.textDark,
                    Platform.OS === "ios" && isLowPowerMode
                      ? null
                      : styles.autoplayLabelSolo,
                  ]}
                >
                  Autoplay next video
                </Text>
                {Platform.OS === "ios" && isLowPowerMode ? (
                  <Text
                    style={[
                      styles.autoplayHint,
                      styles.autoplayHintWarning,
                      isDark && styles.autoplayHintWarningDark,
                    ]}
                  >
                    Autoplay may not work while Low Power Mode is on
                  </Text>
                ) : null}
              </View>
              <Switch
                value={autoplayEnabled}
                onValueChange={handleAutoplayToggle}
                trackColor={{ false: "#D1D5DB", true: "#A8B8E8" }}
                thumbColor={autoplayEnabled ? "#7187CE" : "#F4F4F5"}
                accessibilityLabel="Autoplay next video"
                accessibilityRole="switch"
              />
            </View>
          ) : null}

          {watched ? (
            <View
              style={styles.watchedStatus}
              accessibilityRole="text"
            >
              <Check
                size={18}
                color={isDark ? "#7CB8A8" : "#5D9B8B"}
                strokeWidth={3}
              />
              <Text
                style={[
                  styles.watchedStatusText,
                  isDark && styles.watchedStatusTextDark,
                ]}
              >
                Watched
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.watchedButton}
              onPress={handleMarkWatched}
              activeOpacity={0.7}
            >
              <Text style={styles.watchedButtonText}>Mark as Watched</Text>
            </TouchableOpacity>
          )}

          {watched && (
            nextVideo ? (
              <Pressable
                style={({ pressed }) => [
                  styles.nextVideoButton,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => void handlePlayNextVideo()}
                accessibilityRole="button"
                accessibilityLabel={
                  canChainToNextVideo
                    ? `Play next video, ${nextVideo.title}`
                    : "Unlock premium to continue"
                }
              >
                <Text style={styles.nextVideoTitle} numberOfLines={1}>
                  {canChainToNextVideo
                    ? `Next: ${nextVideo.title}`
                    : "Unlock premium to continue"}
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
                const resourceLocked = !hasPro && !moduleIsFree;
                const iconColor = isDark ? "#ECEDEE" : "#7187CE";

                const cardBody = (
                  <>
                    <View style={styles.resourceTitleRow} pointerEvents="none">
                      <IconSymbol
                        name="doc.text.fill"
                        size={18}
                        color={iconColor}
                      />
                      <Text
                        style={[
                          styles.resourceLabel,
                          isDark && styles.textDark,
                        ]}
                      >
                        {resource.title}
                      </Text>
                    </View>
                    {resource.description ? (
                      <Text
                        pointerEvents="none"
                        style={[
                          styles.resourceDescription,
                          isDark && styles.subtextDark,
                          resourceLocked && styles.resourceDescriptionLocked,
                        ]}
                      >
                        {resource.description}
                      </Text>
                    ) : null}

                    {!resourceLocked && isYouTubeUrl(resource.url) ? (
                      <View style={styles.resourcePlayerWrap}>
                        <WebView
                          style={styles.resourcePlayer}
                          source={{
                            uri: getYouTubeEmbedUrl(resource.url ?? ""),
                          }}
                          allowsInlineMediaPlayback
                          mediaPlaybackRequiresUserAction
                          allowsFullscreenVideo
                          javaScriptEnabled
                          // Nested scroll inside ScrollView — keep YouTube controls tappable.
                          nestedScrollEnabled
                          scrollEnabled={false}
                        />
                      </View>
                    ) : null}

                    {!resourceLocked && !isYouTubeUrl(resource.url) ? (
                      <Pressable
                        style={({ pressed }) => [
                          styles.resourceLinkButton,
                          { opacity: pressed || isOpening ? 0.75 : 1 },
                        ]}
                        onPress={() =>
                          void handleOpenResource(resourceKey, resource)
                        }
                        disabled={isOpening}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${resource.title}`}
                      >
                        <Text style={styles.resourceLinkButtonText}>
                          {isOpening
                            ? "Preparing..."
                            : resource.buttonLabel ??
                              (resource.pdfKey ? "Open PDF" : "Open Resource")}
                        </Text>
                      </Pressable>
                    ) : null}

                    {resourceLocked ? (
                      <>
                        <View
                          style={styles.resourceLockedMediaPlaceholder}
                          pointerEvents="none"
                        />
                        <View
                          style={[
                            styles.resourceLockedOverlay,
                            isDark && styles.resourceLockedOverlayDark,
                          ]}
                          pointerEvents="none"
                        />
                        <View
                          style={styles.resourceLockCenter}
                          pointerEvents="none"
                        >
                          <View style={styles.resourceLockCircle}>
                            <Lock size={26} color="#FFFFFF" strokeWidth={2.2} />
                          </View>
                        </View>
                      </>
                    ) : null}
                  </>
                );

                return resourceLocked ? (
                  <Pressable
                    key={`${resource.url ?? resource.title}-${index}`}
                    style={[
                      styles.resourceCard,
                      styles.resourceCardLocked,
                      isDark && styles.resourceCardDark,
                    ]}
                    onPress={() =>
                      void handleOpenResource(resourceKey, resource)
                    }
                    disabled={isOpening}
                    accessibilityRole="button"
                    accessibilityLabel={`Unlock ${resource.title}`}
                  >
                    {cardBody}
                  </Pressable>
                ) : (
                  <View
                    key={`${resource.url ?? resource.title}-${index}`}
                    style={[
                      styles.resourceCard,
                      isDark && styles.resourceCardDark,
                    ]}
                  >
                    {cardBody}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {showCompletion ? (
        <View
          style={styles.completionOverlay}
          accessibilityViewIsModal
          pointerEvents="box-none"
        >
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              styles.completionBackdrop,
              { opacity: backdropAnim },
            ]}
          />
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={dismissCompletion}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
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
            <View style={styles.completionBadgeWrap} pointerEvents="none">
              <CelebrationBadge active={showCompletion} />
            </View>
            <Text
              pointerEvents="none"
              style={[styles.completionTitle, isDark && styles.textDark]}
            >
              {moduleDef
                ? `Congrats on finishing Module ${moduleDef.moduleNumber}`
                : "Module Complete!"}
            </Text>
            <Text
              pointerEvents="none"
              style={[styles.completionBody, isDark && styles.subtextDark]}
            >
              Be sure to complete the exercises in the Worksheets to solidify
              your learnings.
            </Text>
            {nextModuleInfo ? (
              <>
                <View style={styles.completionCountdownWrap} pointerEvents="none">
                  <Text
                    style={[
                      styles.completionCountdownLabel,
                      isDark && styles.subtextDark,
                    ]}
                  >
                    {completionCountdown > 0
                      ? `Module ${nextModuleInfo.moduleNumber} starting in`
                      : `Starting Module ${nextModuleInfo.moduleNumber}`}
                  </Text>
                  {completionCountdown > 0 ? (
                    <Text
                      style={[
                        styles.completionCountdownNumber,
                        isDark && styles.textDark,
                      ]}
                    >
                      {completionCountdown}
                    </Text>
                  ) : null}
                </View>
                <Pressable
                  onPress={goToNextModule}
                  style={({ pressed }) => [
                    styles.completionButton,
                    { opacity: pressed ? 0.88 : 1 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Continue to Module ${nextModuleInfo.moduleNumber}`}
                >
                  <View pointerEvents="none" style={styles.completionButtonInner}>
                    <Text style={styles.completionButtonText}>
                      Continue to Module {nextModuleInfo.moduleNumber}
                    </Text>
                    <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={dismissCompletion}
                style={({ pressed }) => [
                  styles.completionButton,
                  { opacity: pressed ? 0.88 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Done"
              >
                <Text style={styles.completionButtonText} pointerEvents="none">
                  Done
                </Text>
              </Pressable>
            )}
          </Animated.View>
        </View>
      ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    paddingHorizontal: 12,
    paddingBottom: 16,
    overflow: "hidden",
    zIndex: 20,
  },
  heroNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    minHeight: 44,
  },
  customHeaderTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    textAlign: "center",
    flex: 1,
  },
  customHeaderSpacer: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
  },
  videoCounter: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
    textAlign: "right",
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
    paddingTop: 24,
  },
  videoTitle: {
    fontSize: 24,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    lineHeight: 32,
    paddingHorizontal: 8,
  },
  videoTitleOnArt: {
    color: "#FFFFFF",
  },
  videoContainer: {
    padding: 16,
    backgroundColor: "#000",
  },
  infoSection: {
    padding: 20,
  },
  autoplayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backgroundColor: "#F5F5F7",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  autoplayRowDark: {
    backgroundColor: "#1E1E32",
  },
  autoplayCopy: {
    flex: 1,
  },
  autoplayLabel: {
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
    color: "#2C3E50",
    marginBottom: 4,
  },
  autoplayLabelSolo: {
    marginBottom: 0,
  },
  autoplayHint: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: AppFonts.bodyRegular,
  },
  autoplayHintWarning: {
    color: "#B45309",
  },
  autoplayHintWarningDark: {
    color: "#FCD34D",
  },
  watchedButton: {
    backgroundColor: "#7187CE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  watchedButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
  },
  watchedStatus: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    marginBottom: 20,
  },
  watchedStatusText: {
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
    color: "#5D9B8B",
  },
  watchedStatusTextDark: {
    color: "#7CB8A8",
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
    overflow: "hidden",
    position: "relative",
  },
  resourceCardLocked: {
    minHeight: 120,
    justifyContent: "center",
  },
  resourceCardDark: {
    backgroundColor: "#1E1E32",
  },
  resourceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    paddingRight: 4,
  },
  resourceLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
    color: "#2C3E50",
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    fontFamily: AppFonts.bodyRegular,
    marginBottom: 12,
  },
  resourceDescriptionLocked: {
    marginBottom: 0,
  },
  resourcePlayerWrap: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    position: "relative",
  },
  resourcePlayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  /** Gives locked cards height so the padlock overlay has something to cover. */
  resourceLockedMediaPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: "#D1D5DB",
  },
  resourceLockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(120, 120, 128, 0.55)",
    zIndex: 1,
  },
  resourceLockedOverlayDark: {
    backgroundColor: "rgba(20, 20, 32, 0.65)",
  },
  resourceLockCenter: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  resourceLockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
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
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
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
    zIndex: 1,
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
    marginBottom: 10,
  },
  completionBody: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: AppFonts.bodyRegular,
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 16,
  },
  completionCountdownWrap: {
    alignItems: "center",
    marginBottom: 18,
  },
  completionCountdownLabel: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: AppFonts.bodyBold,
    color: "#5D9B8B",
    textAlign: "center",
  },
  completionCountdownNumber: {
    marginTop: 6,
    fontSize: 40,
    lineHeight: 46,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    textAlign: "center",
  },
  completionButton: {
    alignSelf: "stretch",
    minHeight: 48,
    backgroundColor: MAIN_PURPLE,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  completionButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completionButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
    textAlign: "center",
  },
});
