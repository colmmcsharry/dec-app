import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Check, ChevronRight, FileText } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { getWatchedVideos } from '@/services/progress';
import { requirePro } from '@/services/purchases';
import { MODULE_VIDEOS, VideoEntry } from '@/data/module-videos';
import { MODULE_WORKBOOKS } from '@/data/module-workbooks';
import { MODULE_PDFS, type PdfEntry } from '@/data/pdf-assets';
import { hrefModuleDigitalWorkbook } from '@/lib/module-workbook-route';
import { AppFonts } from '@/constants/theme';
import { pastelBoxStyle } from '@/constants/pastel-accents';
import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from '@/components/screen-back-button';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const categoryInfo: Record<string, { title: string; color: string; moduleNumber: number }> = {
  sleep: { title: 'Sleep', color: '#E5D9F2', moduleNumber: 1 },
  'morning-routines': { title: 'Morning Routines', color: '#FFF3DC', moduleNumber: 2 },
  'energy-management': { title: 'Energy Management', color: '#D4F1E8', moduleNumber: 3 },
  'mindfulness': { title: 'Creativity', color: '#EADBF7', moduleNumber: 4 },
  'move-2-perform': { title: 'Recovery', color: '#DBE9F7', moduleNumber: 5 },
  'thinking-2-perform': { title: 'Thinking 2 Perform', color: '#F7DBF0', moduleNumber: 6 },
  'recovery': { title: 'Move 2 Perform', color: '#D9E9F7', moduleNumber: 7 },
  'fuel-2-perform': { title: 'Fuel 2 Perform', color: '#FFDDD9', moduleNumber: 8 },
  'stress-management': { title: 'Most Authentic You', color: '#F7EADB', moduleNumber: 9 },
  'habits': { title: 'Building Habits', color: '#DBF7EA', moduleNumber: 10 },
};

export default function CategoryScreen() {
  const { slug, title } = useLocalSearchParams<{ slug: string; title: string }>();
  const info = categoryInfo[slug] || { title: title || 'Videos', color: '#E5D9F2', moduleNumber: 0 };
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const videos: VideoEntry[] = MODULE_VIDEOS[slug] || [];
  const workbookDef = slug ? MODULE_WORKBOOKS[slug] : undefined;
  const modulePdfs: PdfEntry[] = slug ? (MODULE_PDFS[slug] ?? []) : [];
  const [watchedIds, setWatchedIds] = useState<string[]>([]);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      getWatchedVideos(slug).then((watched) => {
        setWatchedIds([...watched]);
      });
    }
  }, [isFocused, slug]);

  const watchedCount = watchedIds.length;
  const totalCount = videos.length;
  const progressPercent = totalCount > 0 ? watchedCount / totalCount : 0;

  const openModulePdf = async (pdf: PdfEntry) => {
    if (!slug) return;
    if (!(await requirePro())) return;
    router.push({
      pathname: '/pdf-viewer',
      params: { pdfKey: pdf.id, title: pdf.title },
    });
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={[styles.customHeader, { paddingTop: insets.top, backgroundColor: isDark ? '#1A1A2E' : info.color }]}>
        <ScreenBackButton color={isDark ? '#ECEDEE' : '#2C3E50'} />
        <Text
          pointerEvents="none"
          style={[styles.customHeaderTitle, { color: isDark ? '#ECEDEE' : '#2C3E50' }]}
        >
          {info.title}
        </Text>
        <View pointerEvents="none" style={styles.customHeaderSpacer} />
      </View>
      <ScrollView style={[styles.container, isDark && styles.containerDark]} contentContainerStyle={styles.contentContainer}>
        {/* Progress Card */}
        {totalCount > 0 && (
          <View style={[styles.progressCard, { backgroundColor: isDark ? '#1E1E32' : '#FFFFFF' }]}>
            <Text style={[styles.moduleLabel, isDark && styles.subtextDark]}>
              MODULE {info.moduleNumber}
            </Text>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressTitle, isDark && styles.textDark]}>
                {info.title}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={[styles.progressNumber, isDark && styles.textDark]}>{watchedCount}</Text>
                <Text style={[styles.progressTotal, isDark && styles.subtextDark]}>/{totalCount}</Text>
              </View>
            </View>
            <Text style={[styles.progressLabel, isDark && styles.subtextDark]}>watched</Text>
            <View style={[styles.progressBarBg, isDark && { backgroundColor: '#2A2A3E' }]}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercent * 100}%`, backgroundColor: '#5D9B8B' },
                ]}
              />
            </View>
            {watchedCount > 0 && watchedCount < totalCount && (
              <Text style={[styles.progressEncouragement, isDark && styles.subtextDark]}>
                You&apos;re on track! Complete {totalCount - watchedCount} more to finish this module.
              </Text>
            )}
            {watchedCount === totalCount && totalCount > 0 && (
              <Text style={[styles.progressEncouragement, { color: '#5D9B8B' }]}>
                Module complete! Great work.
              </Text>
            )}
          </View>
        )}

        {videos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No videos available yet</Text>
            <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
          </View>
        ) : (
          <View style={styles.videoList}>
            {videos.map((video, index) => {
              const isWatched = watchedIds.includes(video.id);
              return (
                <TouchableOpacity
                  key={video.id}
                  style={[styles.videoCard, isDark && styles.videoCardDark]}
                  onPress={async () => {
                    if (!(await requirePro())) return;
                    router.push({
                      pathname: '/video/[id]',
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
                    <View style={styles.playIconCircle}>
                      <Text style={styles.playIcon}>▶</Text>
                    </View>
                    {video.duration ? (
                      <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{formatDuration(video.duration)}</Text>
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
                      <Text style={[styles.videoTitle, isDark && styles.textDark, { flex: 1 }]}>{index + 1}. {video.title}</Text>
                      {isWatched && (
                        <View style={styles.watchedTick}>
                          <Check size={14} color="#fff" strokeWidth={3} />
                        </View>
                      )}
                    </View>
                    {video.description && (
                      <Text style={[styles.videoDescription, isDark && styles.subtextDark]}>{video.description}</Text>
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
                <FileText
                  size={20}
                  color={isDark ? '#FFFFFF' : '#7187CE'}
                />
                <Text
                  style={[styles.pdfRowTitle, isDark && styles.textDark]}
                  numberOfLines={2}
                >
                  {pdf.title}
                </Text>
                <ChevronRight
                  size={18}
                  color={isDark ? '#9090A8' : '#2C3E50'}
                  style={{ opacity: isDark ? 1 : 0.55 }}
                />
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
                if (!(await requirePro())) return;
                router.push(hrefModuleDigitalWorkbook(slug));
              }}
              accessibilityRole="button"
              accessibilityLabel={`Open module ${workbookDef.moduleNumber} digital workbook`}
            >
              <Text style={[styles.workbookEyebrow, isDark && styles.subtextDark]}>
                MODULE {workbookDef.moduleNumber} DIGITAL WORKBOOK
              </Text>
              <Text style={[styles.workbookTitle, isDark && styles.textDark]}>
                {workbookDef.title} Workbook
              </Text>
              <Text style={[styles.workbookBody, isDark && styles.subtextDark]}>
                Don&apos;t want to use pen and paper? Here is the digital workbook,
                which saves on your phone.
              </Text>
              <View style={styles.workbookButton}>
                <Text style={styles.workbookButtonText}>Open Workbook</Text>
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
              <Text style={[styles.resourcesCalloutTitle, isDark && styles.textDark]}>
                Gym Routines & Strength Targets
              </Text>
              <Text style={[styles.resourcesCalloutBody, isDark && styles.subtextDark]}>
                You&apos;ll also find gym routines and strength & fitness targets in
                the Resources section — useful if you want structured programmes to
                follow or benchmark numbers to aim for.
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 20,
  },
  customHeaderTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    textAlign: 'center',
    flex: 1,
  },
  customHeaderSpacer: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  containerDark: {
    backgroundColor: '#121222',
  },
  textDark: {
    color: '#ECEDEE',
  },
  subtextDark: {
    color: '#9090A8',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  progressCard: {
    margin: 16,
    marginTop: 30,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  moduleLabel: {
    fontSize: 12,
    fontFamily: AppFonts.headingBold,
    color: '#8E8EA0',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  progressTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: '#2C3E50',
  },
  progressCount: {
    alignItems: 'flex-end',
  },
  progressNumber: {
    fontSize: 28,
    fontFamily: AppFonts.headingBold,
    color: '#2C3E50',
  },
  progressTotal: {
    fontSize: 16,
    color: '#8E8EA0',
    marginTop: -4,
    fontFamily: AppFonts.bodyRegular,
  },
  progressLabel: {
    fontSize: 12,
    color: '#8E8EA0',
    textAlign: 'right',
    marginTop: 0,
    marginBottom: 4,
    fontFamily: AppFonts.bodyRegular,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E8E8EE',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 14,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    minWidth: 0,
  },
  progressEncouragement: {
    fontSize: 13,
    color: '#8E8EA0',
    marginTop: 12,
    fontFamily: AppFonts.bodyRegular,
  },
  videoList: {
    padding: 20,
    paddingTop: 12,
    gap: 30,
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
    color: '#2C3E50',
    marginBottom: 8,
  },
  resourcesCalloutBody: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: AppFonts.bodyRegular,
    color: '#6B7280',
  },
  resourcesCalloutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  resourcesCalloutLinkText: {
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: '#7187CE',
    textDecorationLine: 'underline',
  },
  resourcesCalloutLinkTextDark: {
    color: '#B7A8E0',
  },
  moduleResourcesWrap: {
    paddingHorizontal: 20,
    marginTop: 8,
    paddingBottom: 8,
  },
  resourcesHeading: {
    fontSize: 18,
    fontFamily: AppFonts.headingBold,
    color: '#2C3E50',
    marginBottom: 6,
  },
  resourcesSub: {
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    fontFamily: AppFonts.bodyRegular,
    marginBottom: 12,
  },
  pdfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8E8EE',
  },
  pdfRowDark: {
    backgroundColor: '#1E1E32',
    borderColor: '#2D3044',
  },
  pdfRowTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: '#2C3E50',
  },
  workbookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  workbookCardDark: {
    backgroundColor: '#1E1E32',
  },
  workbookEyebrow: {
    fontSize: 12,
    fontFamily: AppFonts.headingBold,
    color: '#8E8EA0',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  workbookTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: '#2C3E50',
  },
  workbookBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
    fontFamily: AppFonts.bodyRegular,
  },
  workbookButton: {
    marginTop: 16,
    backgroundColor: '#7187CE',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  workbookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  videoCardDark: {
    backgroundColor: '#1E1E32',
  },
  thumbnailContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  thumbnailImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  playIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(107, 91, 140, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    marginLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: AppFonts.bodyMedium,
  },
  watchedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(93, 155, 139, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  watchedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: AppFonts.bodyBold,
  },
  videoInfo: {
    padding: 16,
  },
  videoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  watchedTick: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5D9B8B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 16,
    fontFamily: AppFonts.headingSemiBold,
    color: '#2C3E50',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontFamily: AppFonts.bodyRegular,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8EA0',
    textAlign: 'center',
    fontFamily: AppFonts.bodyRegular,
  },
});
