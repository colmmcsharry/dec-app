import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Pressable } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { VideoPlayer } from '@/components/video-player';
import { useTheme } from '@/context/theme-context';
import { markVideoWatched, isVideoWatched } from '@/services/progress';
import { ChevronLeft } from 'lucide-react-native';

export default function VideoDetailScreen() {
  const { id, title, url, categoryColor, categorySlug } = useLocalSearchParams<{
    id: string;
    title: string;
    url: string;
    categoryColor?: string;
    categorySlug?: string;
  }>();
  const { isDark } = useTheme();
  const [watched, setWatched] = useState(false);

  const backgroundColor = isDark ? '#1A1A2E' : (categoryColor || '#E5D9F2');

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

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Now Playing',
          headerShown: true,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
              style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={22} color={isDark ? '#ECEDEE' : '#2C3E50'} style={{ marginLeft: -1 }} />
            </Pressable>
          ),
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: isDark ? '#ECEDEE' : '#2C3E50',
        }}
      />
      <ScrollView style={[styles.container, isDark && styles.containerDark]} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.header, { backgroundColor }]}>
          <Text style={[styles.videoTitle, isDark && styles.textDark]}>{title}</Text>
        </View>

        <View style={{ height: 80, backgroundColor: isDark ? '#121222' : '#FFFFFF' }} />

        <View style={styles.videoContainer}>
          <VideoPlayer videoUrl={url} />
        </View>

        <View style={styles.infoSection}>
          <TouchableOpacity
            style={[
              styles.watchedButton,
              watched && styles.watchedButtonDone,
            ]}
            onPress={handleMarkWatched}
            disabled={watched}
            activeOpacity={0.7}
          >
            <Text style={[styles.watchedButtonText, watched && styles.watchedButtonTextDone]}>
              {watched ? '✓  Marked as Watched' : 'Mark as Watched'}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.description, isDark && styles.subtextDark]}>
            Watch this video to improve your performance and well-being.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  header: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  videoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    lineHeight: 32,
  },
  videoContainer: {
    padding: 16,
    backgroundColor: '#000',
  },
  infoSection: {
    padding: 20,
  },
  watchedButton: {
    backgroundColor: '#6B5B8C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  watchedButtonDone: {
    backgroundColor: '#5D9B8B',
  },
  watchedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  watchedButtonTextDone: {
    opacity: 0.9,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
});
