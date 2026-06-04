import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
}

const PLAYER_PARAMS: Record<string, string> = {
  autoplay: "1",
  title: "0",
  byline: "0",
  portrait: "0",
  quality_selector: "0",
  speed: "0",
  pip: "0",
  fullscreen: "1",
  playsinline: "1",
};

function buildVimeoEmbedUrl(url: string) {
  if (url.includes("player.vimeo.com")) {
    const [base, existingQuery = ""] = url.split("?");
    const merged = new URLSearchParams(existingQuery);
    for (const [key, value] of Object.entries(PLAYER_PARAMS)) {
      merged.set(key, value);
    }
    return `${base}?${merged.toString()}`;
  }

  const match = url.match(/vimeo\.com\/(\d+)/);
  if (match) {
    const merged = new URLSearchParams(PLAYER_PARAMS);
    return `https://player.vimeo.com/video/${match[1]}?${merged.toString()}`;
  }

  return url;
}

function buildPlayerHtml(embedUrl: string) {
  const safeUrl = embedUrl.replace(/\\/g, "\\\\").replace(/'/g, "\\'");

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <script src="https://player.vimeo.com/api/player.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; }
    #player { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="player"></div>
  <script>
    new Vimeo.Player("player", {
      url: "${safeUrl}",
      responsive: true,
      dnt: true,
    });
  </script>
</body>
</html>`;
}

export const VideoPlayer = ({ videoUrl, title }: VideoPlayerProps) => {
  if (!videoUrl || videoUrl.trim() === "") {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No video URL provided</Text>
        </View>
      </View>
    );
  }

  const embedUrl = useMemo(() => buildVimeoEmbedUrl(videoUrl), [videoUrl]);
  const html = useMemo(() => buildPlayerHtml(embedUrl), [embedUrl]);

  return (
    <View style={styles.container} accessibilityLabel={title ?? "Video player"}>
      <WebView
        style={styles.video}
        source={{ html }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(200, 50, 50, 0.8)",
    padding: 16,
  },
  errorText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
