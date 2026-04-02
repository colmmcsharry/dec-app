import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, router, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Check, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '@/context/theme-context';
import { getWatchedVideos } from '@/services/progress';
import { MODULE_VIDEOS, VideoEntry } from '@/data/module-videos';
import { AppFonts } from '@/constants/theme';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const categoryInfo: Record<string, { title: string; color: string; moduleNumber: number }> = {
  sleep: { title: 'Sleep', color: '#E5D9F2', moduleNumber: 1 },
  'morning-routines': { title: 'Morning Routines', color: '#FFF3DC', moduleNumber: 2 },
  'energy-management': { title: 'Energy Management', color: '#D4F1E8', moduleNumber: 3 },
  'mindfulness': { title: 'Mindfulness', color: '#EADBF7', moduleNumber: 4 },
  'move-2-perform': { title: 'Move 2 Perform', color: '#D9E9F7', moduleNumber: 5 },
  'thinking-2-perform': { title: 'Thinking 2 Perform', color: '#F7DBF0', moduleNumber: 6 },
  'recovery': { title: 'Recovery', color: '#DBE9F7', moduleNumber: 7 },
  'fuel-2-perform': { title: 'Fuel 2 Perform', color: '#FFDDD9', moduleNumber: 8 },
  'stress-management': { title: 'Stress Management', color: '#F7EADB', moduleNumber: 9 },
  'habits': { title: 'Building Habits', color: '#DBF7EA', moduleNumber: 10 },
};

export default function CategoryScreen() {
  const { slug, title } = useLocalSearchParams<{ slug: string; title: string }>();
  const info = categoryInfo[slug] || { title: title || 'Videos', color: '#E5D9F2', moduleNumber: 0 };
  const { isDark } = useTheme();
  const appRouter = useRouter();
  const insets = useSafeAreaInsets();

  const videos: VideoEntry[] = MODULE_VIDEOS[slug] || [];
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={[styles.customHeader, { paddingTop: insets.top, backgroundColor: isDark ? '#1A1A2E' : info.color }]}>
        <Pressable
          onPress={() => appRouter.back()}
          hitSlop={16}
          style={({ pressed }) => [
            styles.customBackButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={26} color={isDark ? '#ECEDEE' : '#2C3E50'} strokeWidth={2.5} />
          <Text style={[styles.customBackText, { color: isDark ? '#ECEDEE' : '#2C3E50' }]}>
            Back
          </Text>
        </Pressable>
        <Text style={[styles.customHeaderTitle, { color: isDark ? '#ECEDEE' : '#2C3E50' }]}>{info.title}</Text>
        <View style={styles.customHeaderSpacer} />
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
          <>
            <View style={styles.videoList}>
              {videos.map((video, index) => {
                const isWatched = watchedIds.includes(video.id);
                return (
                  <TouchableOpacity
                    key={video.id}
                    style={[styles.videoCard, isDark && styles.videoCardDark]}
                    onPress={() => {
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

            {slug === 'sleep' && (
              <View style={styles.workbookWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.workbookCard,
                    isDark && styles.workbookCardDark,
                    { opacity: pressed ? 0.8 : 1 },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/module-workbook/[slug]',
                      params: { slug },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Open module 1 workbook"
                >
                  <Text style={[styles.workbookEyebrow, isDark && styles.subtextDark]}>
                    MODULE 1 WORKBOOK
                  </Text>
                  <Text style={[styles.workbookTitle, isDark && styles.textDark]}>
                    Digital Sleep Workbook
                  </Text>
                  <Text style={[styles.workbookBody, isDark && styles.subtextDark]}>
                    Complete the sleep action plan, evening audit and journal prompts in the app. Your answers save automatically on this device.
                  </Text>
                  <View style={styles.workbookButton}>
                    <Text style={styles.workbookButtonText}>Open Workbook</Text>
                  </View>
                </Pressable>
              </View>
            )}
          </>
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
  customBackButton: {
    minWidth: 72,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBackText: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    marginLeft: 2,
  },
  customHeaderTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    textAlign: 'center',
    flex: 1,
  },
  customHeaderSpacer: {
    minWidth: 72,
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
