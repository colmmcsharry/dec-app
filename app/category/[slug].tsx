import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { VideoPlayer } from '@/components/video-player';

// Sample video data structure
// Replace these with your actual Dropbox links
const categoryVideos: Record<string, Array<{ id: string; title: string; url: string; description?: string }>> = {
  sleep: [
    {
      id: '1',
      title: 'Sleep Meditation 1',
      url: 'https://www.dropbox.com/YOUR_VIDEO_LINK_HERE?dl=0',
      description: 'A calming meditation to help you fall asleep',
    },
    {
      id: '2',
      title: 'Sleep Meditation 2',
      url: 'https://www.dropbox.com/YOUR_VIDEO_LINK_HERE?dl=0',
      description: 'Deep relaxation for better sleep',
    },
  ],
  'morning-routines': [
    {
      id: '1',
      title: 'Morning Stretch Routine',
      url: 'https://www.dropbox.com/YOUR_VIDEO_LINK_HERE?dl=0',
      description: 'Start your day with energizing stretches',
    },
  ],
  'energy-management': [
    {
      id: '1',
      title: 'Energy Boost Workout',
      url: 'https://www.dropbox.com/YOUR_VIDEO_LINK_HERE?dl=0',
      description: 'Quick exercises to boost your energy',
    },
  ],
  'fuel-2-perform': [
    {
      id: '1',
      title: 'Nutrition Basics',
      url: 'https://www.dropbox.com/YOUR_VIDEO_LINK_HERE?dl=0',
      description: 'Learn the fundamentals of performance nutrition',
    },
  ],
  'move-2-perform': [
    {
      id: '1',
      title: 'Strength Training',
      url: 'https://www.dropbox.com/YOUR_VIDEO_LINK_HERE?dl=0',
      description: 'Build strength for peak performance',
    },
  ],
  'thinking-2-perform': [
    {
      id: '1',
      title: 'Mental Focus Techniques',
      url: 'https://www.dropbox.com/YOUR_VIDEO_LINK_HERE?dl=0',
      description: 'Improve your mental clarity and focus',
    },
  ],
};

const categoryInfo: Record<string, { title: string; color: string }> = {
  sleep: { title: 'Sleep', color: '#E5D9F2' },
  'morning-routines': { title: 'Morning Routines', color: '#FFF3DC' },
  'energy-management': { title: 'Energy Management', color: '#D4F1E8' },
  'fuel-2-perform': { title: 'Fuel 2 Perform', color: '#FFDDD9' },
  'move-2-perform': { title: 'Move 2 Perform', color: '#D9E9F7' },
  'thinking-2-perform': { title: 'Thinking 2 Perform', color: '#F7DBF0' },
};

export default function CategoryScreen() {
  const { slug, title } = useLocalSearchParams<{ slug: string; title: string }>();
  const videos = categoryVideos[slug] || [];
  const info = categoryInfo[slug] || { title: title || 'Videos', color: '#E5D9F2' };

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
          <Text style={styles.headerSubtitle}>
            {videos.length} video{videos.length !== 1 ? 's' : ''} available
          </Text>
        </View>

        {videos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No videos available yet</Text>
            <Text style={styles.emptySubtext}>Check back soon for new content!</Text>
          </View>
        ) : (
          <View style={styles.videoList}>
            {videos.map((video) => (
              <View key={video.id} style={styles.videoCard}>
                <VideoPlayer videoUrl={video.url} />
                <View style={styles.videoInfo}>
                  <Text style={styles.videoTitle}>{video.title}</Text>
                  {video.description && (
                    <Text style={styles.videoDescription}>{video.description}</Text>
                  )}
                </View>
              </View>
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
    gap: 24,
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
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 18,
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
});
