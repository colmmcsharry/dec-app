import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { VideoPlayer } from '@/components/video-player';

export default function VideoDetailScreen() {
  const { id, title, url, categoryColor } = useLocalSearchParams<{
    id: string;
    title: string;
    url: string;
    categoryColor?: string;
  }>();

  const backgroundColor = categoryColor || '#E5D9F2';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Now Playing',
          headerShown: true,
          headerBackTitle: 'Back',
          headerStyle: {
            backgroundColor: backgroundColor,
          },
          headerTintColor: '#2C3E50',
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.header, { backgroundColor }]}>
          <Text style={styles.videoTitle}>{title}</Text>
        </View>

        <View style={styles.videoContainer}>
          <VideoPlayer videoUrl={url} />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About this video</Text>
          <Text style={styles.description}>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
});
