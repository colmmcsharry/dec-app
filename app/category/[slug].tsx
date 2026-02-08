import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { getVideosFromFolder, parseVideoMetadata, VimeoVideo } from '@/services/vimeo';
import { VIMEO_CONFIG } from '@/config/vimeo.config';

// Import thumbnails
const thumbnails = [
  require('@/assets/images/thumbnail1.jpeg'),
  require('@/assets/images/thumbnail2.jpeg'),
  require('@/assets/images/thumbnail3.jpeg'),
];

interface Video {
  id: string;
  title: string;
  url: string;
  description?: string;
}

const categoryInfo: Record<string, { title: string; color: string }> = {
  sleep: { title: 'Sleep', color: '#E5D9F2' },
  'morning-routines': { title: 'Morning Routines', color: '#FFF3DC' },
  'energy-management': { title: 'Energy Management', color: '#D4F1E8' },
  'fuel-2-perform': { title: 'Fuel 2 Perform', color: '#FFDDD9' },
  'move-2-perform': { title: 'Move 2 Perform', color: '#D9E9F7' },
  'thinking-2-perform': { title: 'Thinking 2 Perform', color: '#F7DBF0' },
  'recovery': { title: 'Recovery', color: '#DBE9F7' },
  'mindfulness': { title: 'Mindfulness', color: '#EADBF7' },
  'stress-management': { title: 'Stress Management', color: '#F7EADB' },
  'habits': { title: 'Building Habits', color: '#DBF7EA' },
};

export default function CategoryScreen() {
  const { slug, title } = useLocalSearchParams<{ slug: string; title: string }>();
  const info = categoryInfo[slug] || { title: title || 'Videos', color: '#E5D9F2' };
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, [slug]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the Vimeo folder ID for this category
      const folderId = VIMEO_CONFIG.categoryFolders[slug as keyof typeof VIMEO_CONFIG.categoryFolders];
      
      if (!folderId) {
        setVideos([]);
        setLoading(false);
        return;
      }

      // Check if access token is configured
      if (VIMEO_CONFIG.accessToken === 'YOUR_VIMEO_ACCESS_TOKEN_HERE') {
        setError('Vimeo access token not configured. Please see config/vimeo.config.ts');
        setLoading(false);
        return;
      }

      // Fetch videos from Vimeo
      console.log('Fetching videos from Vimeo folder:', folderId);
      const vimeoVideos = await getVideosFromFolder(folderId);
      console.log('Received videos from Vimeo:', vimeoVideos.length);
      
      // Transform to our video format
      const transformedVideos: Video[] = vimeoVideos.map((video) => {
        const metadata = parseVideoMetadata(video.name);
        return {
          id: video.id,
          title: metadata.displayName || video.name,
          url: video.playerEmbedUrl,
          description: video.description || metadata.description,
        };
      });

      console.log('Total videos to display:', transformedVideos.length);
      setVideos(transformedVideos);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos. Please check your Vimeo configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: info.title,
          headerShown: true,
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: info.color,
          },
          headerTintColor: '#2C3E50',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.header, { backgroundColor: info.color }]}>
          <Text style={styles.headerTitle}>{info.title}</Text>
          {!loading && (
            <Text style={styles.headerSubtitle}>
              {videos.length} video{videos.length !== 1 ? 's' : ''} available
            </Text>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B5B8C" />
            <Text style={styles.loadingText}>Loading videos...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadVideos} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : videos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No videos available yet</Text>
            <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
          </View>
        ) : (
          <View style={styles.videoList}>
            {videos.map((video, index) => (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => {
                  router.push({
                    pathname: '/video/[id]',
                    params: {
                      id: video.id,
                      title: video.title,
                      url: video.url,
                      categoryColor: info.color,
                    },
                  });
                }}
              >
                <View style={styles.thumbnailContainer}>
                  <Image
                    source={thumbnails[index % 3]}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                  <View style={styles.playIconCircle}>
                    <Text style={styles.playIcon}>▶</Text>
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>Video</Text>
                  </View>
                </View>
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  {video.description && (
                    <Text style={styles.videoDescription}>{video.description}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B5B8C',
    opacity: 0.8,
  },
  videoList: {
    padding: 20,
    gap: 16,
  },
  videoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(107, 91, 140, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginLeft: 4,
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
    fontWeight: '600',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8EA0',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B5B8C',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#D97B7B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6B5B8C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
