import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

export const VideoPlayer = ({ videoUrl, title }: VideoPlayerProps) => {
  const [error, setError] = useState<string | null>(null);

  // Check if URL is valid
  if (!videoUrl || videoUrl.trim() === '') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No video URL provided</Text>
        </View>
      </View>
    );
  }

  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.play(); // Autoplay when video loads
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
        contentFit="contain"
        onError={(error) => {
          console.error('Video error:', error);
          setError('Failed to load video');
        }}
      />

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(200, 50, 50, 0.8)',
    padding: 16,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
