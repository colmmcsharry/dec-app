import {
  MODULE_CARD_BRIGHTEN_SCRIMS,
  MODULE_CARD_DARK_SCRIMS,
  MODULE_HEADER_BACKGROUNDS,
} from "@/components/module-card-art";
import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { MODULE_THEMES } from "@/constants/module-themes";
import {
  getPastelAccent,
  mixHex,
  pastelBoxStyle,
} from "@/constants/pastel-accents";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_VIDEOS, VideoEntry } from "@/data/module-videos";
import { getModuleWholeVideo } from "@/data/module-whole-videos";
import { MODULE_WORKBOOKS } from "@/data/module-workbooks";
import { MODULE_PDFS, type PdfEntry } from "@/data/pdf-assets";
import {
  getModuleLinkResources,
  type ModuleLinkResource,
} from "@/data/supplemental-resources";
import { isFreeModule, isFreePreviewVideo } from "@/lib/free-preview-video";
import { hrefModuleDigitalWorkbook } from "@/lib/module-workbook-route";
import { getWatchedVideos } from "@/services/progress";
import {
  hasProEntitlement,
  requireModuleAccess,
  requireVideoAccess,
} from "@/services/purchases";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useIsFocused } from "expo-router/react-navigation";
import {
  BookOpen,
  Check,
  ChevronRight,
  FileText,
  Lock,
  Youtube,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RectButton, TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const categoryInfo: Record<
  string,
  { title: string; color: string; moduleNumber: number }
> = {
  sleep: { title: "Sleep", color: "#E5D9F2", moduleNumber: 1 },
  "morning-routines": {
    title: "Morning Routines",
    color: "#FFF3DC",
    moduleNumber: 2,
  },
  "energy-management": {
    title: "Energy Management",
    color: "#D4F1E8",
    moduleNumber: 3,
  },
  mindfulness: {
    title: "Creative Solutions",
    color: "#EADBF7",
    moduleNumber: 4,
  },
  "move-2-perform": { title: "Recovery", color: "#DBE9F7", moduleNumber: 5 },
  "thinking-2-perform": {
    title: "Thinking 2 Perform",
    color: "#F7DBF0",
    moduleNumber: 6,
  },
  recovery: { title: "Move 2 Perform", color: "#D9E9F7", moduleNumber: 7 },
  "fuel-2-perform": {
    title: "Fuel 2 Perform",
    color: "#FFDDD9",
    moduleNumber: 8,
  },
  "stress-management": {
    title: "Most Authentic You",
    color: "#F7EADB",
    moduleNumber: 9,
  },
  habits: { title: "Building Habits", color: "#DBF7EA", moduleNumber: 10 },
};

export default function CategoryScreen() {
  const { slug, title } = useLocalSearchParams<{
    slug: string;
    title: string;
  }>();
  const info = categoryInfo[slug] || {
    title: title || "Videos",
    color: "#E5D9F2",
    moduleNumber: 0,
  };
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const videos: VideoEntry[] = MODULE_VIDEOS[slug] || [];
  const wholeVideo = slug ? getModuleWholeVideo(slug) : undefined;
  const workbookDef = slug ? MODULE_WORKBOOKS[slug] : undefined;
  const modulePdfs: PdfEntry[] = slug ? (MODULE_PDFS[slug] ?? []) : [];
  const moduleLinks: ModuleLinkResource[] = slug
    ? getModuleLinkResources(slug)
    : [];
  const [watchedIds, setWatchedIds] = useState<string[]>([]);
  const [hasPro, setHasPro] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getWatchedVideos(slug).then((watched) => {
        setWatchedIds([...watched]);
      });
      void hasProEntitlement().then(setHasPro);
    }
  }, [isFocused, slug]);

  const watchedCount = watchedIds.length;
  const totalCount = videos.length;
  const videoLinkAccent = getPastelAccent("red", isDark);
  const videoLinkBackground = mixHex(
    videoLinkAccent.background,
    videoLinkAccent.accent,
    0.15,
  );
  const progressPercent = totalCount > 0 ? watchedCount / totalCount : 0;

  const moduleTheme = slug ? MODULE_THEMES[slug] : undefined;
  const ModuleIcon = moduleTheme?.Icon;
  const moduleBackground = slug ? MODULE_HEADER_BACKGROUNDS[slug] : undefined;
  const isSleep = slug === "sleep";
  // Sleep art is always dark — white type, no wash either way.
  const lightOnArt = isDark || isSleep;
  const overlayScrim =
    !slug || isSleep
      ? undefined
      : isDark
        ? MODULE_CARD_DARK_SCRIMS[slug]
        : MODULE_CARD_BRIGHTEN_SCRIMS[slug];

  const openModulePdf = async (pdf: PdfEntry) => {
    if (!slug) return;
    if (!(await requireModuleAccess(slug))) return;
    router.push({
      pathname: "/pdf-viewer",
      params: { pdfKey: pdf.id, title: pdf.title },
    });
  };

  const openModuleLink = async (link: ModuleLinkResource) => {
    if (!slug) return;
    if (!(await requireModuleAccess(slug))) return;
    await Linking.openURL(link.url);
  };

  const backColor = lightOnArt ? "#FFFFFF" : isDark ? "#ECEDEE" : "#2C3E50";

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View
        style={[
          styles.heroHeader,
          {
            paddingTop: insets.top + 4,
            backgroundColor: isDark ? "#1E1E32" : info.color,
          },
        ]}
      >
        {moduleBackground ? (
          <ImageBackground
            source={moduleBackground}
            style={StyleSheet.absoluteFill}
            imageStyle={styles.heroHeaderImage}
            resizeMode="cover"
          />
        ) : null}
        {overlayScrim ? (
          <LinearGradient
            colors={[overlayScrim[0], overlayScrim[1]]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        ) : null}

        <View style={styles.heroNavRow}>
          <ScreenBackButton color={backColor} />
          {totalCount > 0 ? (
            <Text
              pointerEvents="none"
              style={[
                styles.heroNavModuleLabel,
                lightOnArt ? styles.moduleLabelOnArt : null,
              ]}
            >
              MODULE {info.moduleNumber}
            </Text>
          ) : (
            <Text
              pointerEvents="none"
              style={[
                styles.heroNavCenterTitle,
                lightOnArt ? styles.textOnArt : null,
              ]}
              numberOfLines={1}
            >
              {info.title}
            </Text>
          )}
          <View pointerEvents="none" style={styles.heroNavSpacer} />
        </View>

        {totalCount > 0 ? (
          <View style={styles.heroProgressBody}>
            <View style={styles.progressHeader}>
              <View style={styles.progressTitleRow}>
                {ModuleIcon ? (
                  <View style={styles.progressIconWrap}>
                    <View pointerEvents="none">
                      <ModuleIcon
                        size={26}
                        color={moduleTheme?.iconColor ?? "#2C3E50"}
                        strokeWidth={2.4}
                      />
                    </View>
                  </View>
                ) : null}
                <Text
                  pointerEvents="none"
                  style={[
                    styles.progressTitle,
                    lightOnArt ? styles.textOnArt : null,
                  ]}
                >
                  {info.title}
                </Text>
              </View>
              <View pointerEvents="none" style={styles.progressCountBlock}>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text
                    style={[
                      styles.progressNumber,
                      lightOnArt ? styles.textOnArt : null,
                    ]}
                  >
                    {watchedCount}
                  </Text>
                  <Text
                    style={[
                      styles.progressTotal,
                      lightOnArt ? styles.textOnArt : null,
                    ]}
                  >
                    /{totalCount}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.progressLabel,
                    lightOnArt ? styles.textOnArt : null,
                  ]}
                >
                  watched
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.progressBarBg,
                lightOnArt ? styles.progressBarBgOnArt : null,
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progressPercent * 100}%`,
                    backgroundColor: lightOnArt ? "#A8D5C5" : "#5D9B8B",
                  },
                ]}
              />
            </View>
            {watchedCount === totalCount ? (
              <Text
                pointerEvents="none"
                style={[
                  styles.progressEncouragement,
                  { color: lightOnArt ? "#A8D5C5" : "#5D9B8B" },
                ]}
              >
                Module complete! Great work.
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.contentContainer}
      >
        {wholeVideo ? (
          <View style={styles.wholeVideoWrap}>
            <RectButton
              style={[
                styles.wholeVideoCard,
                isDark && styles.wholeVideoCardDark,
              ]}
              underlayColor={isDark ? "#2A2A42" : "#EDE8F7"}
              onPress={async () => {
                if (!(await requireVideoAccess(slug ?? "", wholeVideo.id))) {
                  return;
                }
                router.push({
                  pathname: "/video/[id]",
                  params: {
                    id: wholeVideo.id,
                    title: wholeVideo.title,
                    url: wholeVideo.url,
                    categoryColor: info.color,
                    categorySlug: slug,
                    whole: "1",
                  },
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Watch module ${info.moduleNumber} as one continuous video`}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.wholeVideoAccent,
                  {
                    backgroundColor: getPastelAccent("lavender", isDark).accent,
                  },
                ]}
              />
              <View pointerEvents="none" style={styles.wholeVideoThumb}>
                {wholeVideo.thumbnail ? (
                  <Image
                    source={{ uri: wholeVideo.thumbnail }}
                    style={styles.wholeVideoThumbImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.wholeVideoThumbFallback} />
                )}
                <View style={styles.wholeVideoPlayCircle}>
                  <Text style={styles.wholeVideoPlayIcon}>▶</Text>
                </View>
              </View>
              <View pointerEvents="none" style={styles.wholeVideoCopy}>
                <Text
                  style={[
                    styles.wholeVideoEyebrow,
                    isDark && styles.wholeVideoEyebrowDark,
                  ]}
                >
                  Watch entire module
                </Text>
                <Text
                  style={[styles.wholeVideoTitle, isDark && styles.textDark]}
                  numberOfLines={2}
                >
                  Prefer one long video?
                </Text>
                <Text
                  style={[styles.wholeVideoMeta, isDark && styles.subtextDark]}
                >
                  {wholeVideo.duration
                    ? `${Math.ceil(wholeVideo.duration / 60)} mins`
                    : "Full module in one sitting"}
                </Text>
              </View>
              <View pointerEvents="none" style={styles.wholeVideoChevron}>
                <ChevronRight
                  size={20}
                  color={isDark ? "#B7A8E0" : "#7187CE"}
                  strokeWidth={2.4}
                />
              </View>
            </RectButton>
          </View>
        ) : null}
        {videos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No videos available yet</Text>
            <Text style={styles.emptySubtext}>
              Check back soon for new content!
            </Text>
          </View>
        ) : (
          <View style={styles.videoList}>
            {videos.map((video, index) => {
              const isWatched = watchedIds.includes(video.id);
              const moduleIsFree = isFreeModule(slug);
              const isFreePreview = isFreePreviewVideo(slug, video.id);
              const isLocked = !hasPro && !isFreePreview;
              return (
                <TouchableOpacity
                  key={video.id}
                  style={[styles.videoCard, isDark && styles.videoCardDark]}
                  onPress={async () => {
                    if (!(await requireVideoAccess(slug ?? "", video.id)))
                      return;
                    router.push({
                      pathname: "/video/[id]",
                      params: {
                        id: video.id,
                        title: video.title,
                        url: video.url,
                        categoryColor: info.color,
                        categorySlug: slug,
                      },
                    });
                  }}
                >
                  <View style={styles.thumbnailContainer}>
                    {video.thumbnail ? (
                      <Image
                        source={{ uri: video.thumbnail }}
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                    ) : null}
                    {isLocked ? (
                      <>
                        <View
                          style={[
                            styles.lockedOverlay,
                            isDark && styles.lockedOverlayDark,
                          ]}
                        />
                        <View style={styles.lockIconCircle}>
                          <Lock size={26} color="#FFFFFF" strokeWidth={2.2} />
                        </View>
                      </>
                    ) : (
                      <View style={styles.playIconCircle}>
                        <Text style={styles.playIcon}>▶</Text>
                      </View>
                    )}
                    {video.duration ? (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>
                          {formatDuration(video.duration)}
                        </Text>
                      </View>
                    ) : null}
                    {moduleIsFree && index === 0 && !hasPro && !isWatched ? (
                      <View style={styles.freePreviewBadge}>
                        <Text style={styles.freePreviewBadgeText}>Free</Text>
                      </View>
                    ) : null}
                    {isWatched && (
                      <View style={styles.watchedBadge}>
                        <Text style={styles.watchedBadgeText}>✓ Watched</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.videoInfo}>
                    <View style={styles.videoTitleRow}>
                      <Text
                        style={[
                          styles.videoTitle,
                          isDark && styles.textDark,
                          { flex: 1 },
                        ]}
                      >
                        {index + 1}. {video.title}
                      </Text>
                      {isWatched && (
                        <View style={styles.watchedTick}>
                          <Check size={14} color="#fff" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    {video.description && (
                      <Text
                        style={[
                          styles.videoDescription,
                          isDark && styles.subtextDark,
                        ]}
                      >
                        {video.description}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {modulePdfs.length > 0 && (
          <View style={styles.moduleResourcesWrap}>
            <Text style={[styles.resourcesHeading, isDark && styles.textDark]}>
              Additional resources
            </Text>
            <Text style={[styles.resourcesSub, isDark && styles.subtextDark]}>
              Printable worksheets — same PDFs as in the Worksheets tab.
            </Text>
            {modulePdfs.map((pdf) => (
              <TouchableOpacity
                key={pdf.id}
                style={[styles.pdfRow, isDark && styles.pdfRowDark]}
                activeOpacity={0.7}
                onPress={() => openModulePdf(pdf)}
                accessibilityRole="button"
                accessibilityLabel={`Open PDF: ${pdf.title}`}
              >
                <View pointerEvents="none">
                  <FileText size={20} color={isDark ? "#FFFFFF" : "#7187CE"} />
                </View>
                <Text
                  style={[styles.pdfRowTitle, isDark && styles.textDark]}
                  numberOfLines={2}
                >
                  {pdf.title}
                </Text>
                <View pointerEvents="none">
                  <ChevronRight
                    size={18}
                    color={isDark ? "#9090A8" : "#2C3E50"}
                    style={{ opacity: isDark ? 1 : 0.55 }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {moduleLinks.length > 0 && (
          <View style={styles.moduleResourcesWrap}>
            <Text style={[styles.resourcesHeading, isDark && styles.textDark]}>
              Video links
            </Text>
            <Text style={[styles.resourcesSub, isDark && styles.subtextDark]}>
              Videos linked from lessons in this module.
            </Text>
            {moduleLinks.map((link) => (
              <TouchableOpacity
                key={link.url}
                style={[
                  styles.pdfRow,
                  {
                    backgroundColor: videoLinkBackground,
                    borderColor: videoLinkAccent.border,
                  },
                ]}
                activeOpacity={0.7}
                onPress={() => openModuleLink(link)}
                accessibilityRole="button"
                accessibilityLabel={`Open video link: ${link.title}`}
              >
                <View pointerEvents="none">
                  <Youtube size={20} color={isDark ? "#FFFFFF" : "#E11D48"} />
                </View>
                <View style={styles.linkRowText}>
                  <Text
                    style={[styles.pdfRowTitle, isDark && styles.textDark]}
                    numberOfLines={2}
                  >
                    {link.title}
                  </Text>
                  {link.description ? (
                    <Text
                      style={[
                        styles.linkRowDescription,
                        isDark && styles.subtextDark,
                      ]}
                      numberOfLines={2}
                    >
                      {link.description}
                    </Text>
                  ) : null}
                </View>
                <View pointerEvents="none">
                  <ChevronRight
                    size={18}
                    color={isDark ? "#9090A8" : "#2C3E50"}
                    style={{ opacity: isDark ? 1 : 0.55 }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {workbookDef && (
          <View style={styles.workbookWrap}>
            <Pressable
              style={({ pressed }) => [
                styles.workbookCard,
                isDark && styles.workbookCardDark,
                { opacity: pressed ? 0.8 : 1 },
              ]}
              onPress={async () => {
                if (!(await requireModuleAccess(slug))) return;
                router.push(hrefModuleDigitalWorkbook(slug));
              }}
              accessibilityRole="button"
              accessibilityLabel={`Open module ${workbookDef.moduleNumber} digital workbook`}
            >
              <Text
                style={[styles.workbookEyebrow, isDark && styles.subtextDark]}
              >
                MODULE {workbookDef.moduleNumber} DIGITAL WORKBOOK
              </Text>
              <Text style={[styles.workbookTitle, isDark && styles.textDark]}>
                {workbookDef.title} Workbook
              </Text>
              <Text style={[styles.workbookBody, isDark && styles.subtextDark]}>
                Don&apos;t want to use pen and paper? Here is the digital
                workbook, which saves on your phone.
              </Text>
              <View style={styles.workbookButton}>
                <View pointerEvents="none" style={styles.workbookButtonInner}>
                  <BookOpen size={18} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.workbookButtonText}>Open Workbook</Text>
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {slug === "recovery" && (
          <View style={styles.resourcesCalloutWrap}>
            <View
              style={[
                styles.resourcesCalloutCard,
                pastelBoxStyle("blue", isDark),
              ]}
            >
              <Text
                style={[
                  styles.resourcesCalloutTitle,
                  isDark && styles.textDark,
                ]}
              >
                Gym Routines & Strength Targets
              </Text>
              <Text
                style={[
                  styles.resourcesCalloutBody,
                  isDark && styles.subtextDark,
                ]}
              >
                You&apos;ll also find gym routines and strength & fitness
                targets in the Resources section — useful if you want structured
                programmes to follow or benchmark numbers to aim for.
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.resourcesCalloutLink,
                  { opacity: pressed ? 0.75 : 1 },
                ]}
                onPress={() => router.push("/(tabs)/resources")}
                accessibilityRole="link"
                accessibilityLabel="Go to Resources"
              >
                <Text
                  style={[
                    styles.resourcesCalloutLinkText,
                    isDark && styles.resourcesCalloutLinkTextDark,
                  ]}
                >
                  Go to Resources
                </Text>
                <ChevronRight
                  size={16}
                  color={isDark ? "#B7A8E0" : "#7187CE"}
                />
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  heroHeader: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    overflow: "hidden",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 20,
  },
  heroHeaderImage: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  heroNavRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -4,
    marginBottom: 8,
    minHeight: 44,
  },
  heroNavModuleLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontFamily: AppFonts.headingBold,
    color: "#8E8EA0",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroNavCenterTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
  },
  heroNavSpacer: {
    width: SCREEN_BACK_BUTTON_WIDTH,
  },
  heroProgressBody: {
    paddingHorizontal: 4,
  },
  progressIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  progressTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginRight: 12,
    minWidth: 0,
  },
  progressCountBlock: {
    alignItems: "flex-end",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
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
    paddingTop: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  moduleLabelOnArt: {
    color: "rgba(255,255,255,0.72)",
  },
  textOnArt: {
    color: "#FFFFFF",
  },
  subtextOnArt: {
    color: "rgba(255,255,255,0.72)",
  },
  progressBarBgOnArt: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  progressTitle: {
    flexShrink: 1,
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
  },
  progressNumber: {
    fontSize: 28,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
  },
  progressTotal: {
    fontSize: 16,
    color: "#2C3E50",
    marginTop: -4,
    fontFamily: AppFonts.bodyRegular,
  },
  progressLabel: {
    fontSize: 12,
    color: "#2C3E50",
    textAlign: "right",
    marginTop: 0,
    fontFamily: AppFonts.bodyRegular,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E8E8EE",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
    minWidth: 0,
  },
  progressEncouragement: {
    fontSize: 13,
    color: "#8E8EA0",
    marginTop: 10,
    fontFamily: AppFonts.bodyRegular,
  },
  videoList: {
    padding: 20,
    paddingTop: 12,
    gap: 30,
  },
  wholeVideoWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  wholeVideoCard: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 88,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4DFF0",
    overflow: "hidden",
    paddingRight: 10,
  },
  wholeVideoCardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#2D3044",
  },
  wholeVideoAccent: {
    width: 4,
    alignSelf: "stretch",
  },
  wholeVideoThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginLeft: 12,
    marginVertical: 10,
    overflow: "hidden",
    backgroundColor: "#D8D2E8",
  },
  wholeVideoThumbImage: {
    width: "100%",
    height: "100%",
  },
  wholeVideoThumbFallback: {
    flex: 1,
    backgroundColor: "#C8BEDC",
  },
  wholeVideoPlayCircle: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -16,
    marginLeft: -16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(107, 91, 140, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  wholeVideoPlayIcon: {
    fontSize: 13,
    color: "#FFFFFF",
    marginLeft: 2,
  },
  wholeVideoCopy: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 2,
  },
  wholeVideoEyebrow: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: AppFonts.bodyMedium,
    color: "#7187CE",
    marginBottom: 2,
  },
  wholeVideoEyebrowDark: {
    color: "#B7A8E0",
  },
  wholeVideoTitle: {
    fontSize: 16,
    lineHeight: 21,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
  },
  wholeVideoMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: AppFonts.bodyRegular,
    color: "#8E8EA0",
    marginTop: 2,
  },
  wholeVideoChevron: {
    width: 28,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  workbookWrap: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 4,
  },
  resourcesCalloutWrap: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  resourcesCalloutCard: {
    borderRadius: 16,
    padding: 20,
  },
  resourcesCalloutTitle: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
    marginBottom: 8,
  },
  resourcesCalloutBody: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: AppFonts.bodyRegular,
    color: "#6B7280",
  },
  resourcesCalloutLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 14,
    alignSelf: "flex-start",
  },
  resourcesCalloutLinkText: {
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: "#7187CE",
    textDecorationLine: "underline",
  },
  resourcesCalloutLinkTextDark: {
    color: "#B7A8E0",
  },
  moduleResourcesWrap: {
    paddingHorizontal: 20,
    marginTop: 8,
    paddingBottom: 8,
  },
  resourcesHeading: {
    fontSize: 18,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    marginBottom: 6,
  },
  resourcesSub: {
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
    fontFamily: AppFonts.bodyRegular,
    marginBottom: 12,
  },
  pdfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E8E8EE",
  },
  pdfRowDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#2D3044",
  },
  pdfRowTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: "#2C3E50",
  },
  linkRowText: {
    flex: 1,
    gap: 2,
  },
  linkRowDescription: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: AppFonts.bodyRegular,
    color: "#8E8EA0",
  },
  workbookCard: {
    backgroundColor: "#E6F5F0",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  workbookCardDark: {
    backgroundColor: "#1E1E32",
  },
  workbookEyebrow: {
    fontSize: 12,
    fontFamily: AppFonts.headingBold,
    color: "#8E8EA0",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  workbookTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
  },
  workbookBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    fontFamily: AppFonts.bodyRegular,
  },
  workbookButton: {
    marginTop: 16,
    backgroundColor: "#7187CE",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  workbookButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  workbookButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
  },
  videoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  videoCardDark: {
    backgroundColor: "#1E1E32",
  },
  thumbnailContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  thumbnailImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  lockedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(120, 120, 128, 0.55)",
    zIndex: 1,
  },
  lockedOverlayDark: {
    backgroundColor: "rgba(20, 20, 32, 0.65)",
  },
  lockIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  playIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(107, 91, 140, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  playIcon: {
    fontSize: 22,
    color: "#FFFFFF",
    marginLeft: 3,
  },
  durationBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 3,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: AppFonts.bodyMedium,
  },
  watchedBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(93, 155, 139, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    zIndex: 3,
  },
  watchedBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: AppFonts.bodyBold,
  },
  freePreviewBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(113, 135, 206, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    zIndex: 3,
  },
  freePreviewBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: AppFonts.bodyBold,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  watchedTick: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#5D9B8B",
    justifyContent: "center",
    alignItems: "center",
  },
  videoTitle: {
    fontSize: 16,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    fontFamily: AppFonts.bodyRegular,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#8E8EA0",
    textAlign: "center",
    fontFamily: AppFonts.bodyRegular,
  },
});
