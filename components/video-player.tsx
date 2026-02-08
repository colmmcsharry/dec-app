import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

export const VideoPlayer = ({ videoUrl, title }: VideoPlayerProps) => {
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

  // Extract Vimeo video ID from various URL formats
  const getVimeoEmbedUrl = (url: string) => {
    // If it's already a player embed URL
    if (url.includes('player.vimeo.com')) {
      return url + '?autoplay=1&title=0&byline=0&portrait=0';
    }
    // If it's a regular vimeo URL, extract the ID
    const match = url.match(/vimeo\.com\/(\d+)/);
    if (match) {
      return `https://player.vimeo.com/video/${match[1]}?autoplay=1&title=0&byline=0&portrait=0`;
    }
    // Fallback - try using it directly
    return url;
  };

  const embedUrl = getVimeoEmbedUrl(videoUrl);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
      <style>
        * { margin: 0; padding: 0; }
        body { background: #000; }
        iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <iframe
        src="${embedUrl}"
        allow="autoplay; fullscreen; picture-in-picture"
        allowfullscreen
      ></iframe>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        style={styles.video}
        source={{ html }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        javaScriptEnabled
      />
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
