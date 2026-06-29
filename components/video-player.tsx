import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  /** Embed URL for the next video — queued inside the WebView for gapless autoplay. */
  nextVideoEmbedUrl?: string | null;
  /** Called when the Vimeo player fires `ended`. `continued` is true if the WebView started the next video. */
  onEnded?: (continued: boolean) => void;
}

const PLAYER_PARAMS: Record<string, string> = {
  autoplay: "0",
  title: "0",
  byline: "0",
  portrait: "0",
  quality_selector: "0",
  speed: "0",
  pip: "0",
  fullscreen: "1",
  playsinline: "1",
};

export function buildVimeoEmbedUrl(url: string) {
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
    (function () {
      var player = new Vimeo.Player("player", {
        url: "${safeUrl}",
        responsive: true,
        dnt: true,
      });

      window.__setPendingAutoplay = function (url) {
        if (url) {
          window.__pendingAutoplay = { url: url };
        } else {
          window.__pendingAutoplay = null;
        }
      };

      window.__loadAndPlay = function (url) {
        window.__pendingAutoplay = null;
        return player.loadVideo(url).then(function () {
          return player.play();
        });
      };

      player.on("ended", function () {
        var continued = false;
        if (window.__pendingAutoplay && window.__pendingAutoplay.url) {
          var target = window.__pendingAutoplay.url;
          window.__pendingAutoplay = null;
          continued = true;
          player.loadVideo(target).then(function () {
            return player.play();
          });
        }
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: "ended", continued: continued })
          );
        }
      });
    })();
  </script>
</body>
</html>`;
}

export type VideoPlayerHandle = {
  loadAndPlay: (embedUrl: string) => void;
};

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ videoUrl, title, nextVideoEmbedUrl, onEnded }, ref) {
  const webViewRef = useRef<WebView>(null);
  const initialEmbedUrlRef = useRef<string | null>(null);
  const hasUrl = Boolean(videoUrl?.trim());
  const embedUrl = useMemo(
    () => (hasUrl ? buildVimeoEmbedUrl(videoUrl) : ""),
    [hasUrl, videoUrl],
  );

  if (initialEmbedUrlRef.current === null && embedUrl) {
    initialEmbedUrlRef.current = embedUrl;
  }

  const html = useMemo(
    () =>
      initialEmbedUrlRef.current
        ? buildPlayerHtml(initialEmbedUrlRef.current)
        : "",
    [],
  );

  const syncPendingAutoplay = (nextUrl: string | null | undefined) => {
    const script = `
      (function () {
        if (window.__setPendingAutoplay) {
          window.__setPendingAutoplay(${nextUrl ? JSON.stringify(nextUrl) : "null"});
        }
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  useImperativeHandle(ref, () => ({
    loadAndPlay(embedUrl: string) {
      const script = `
        (function () {
          if (window.__loadAndPlay) {
            window.__loadAndPlay(${JSON.stringify(embedUrl)});
          }
        })();
        true;
      `;
      webViewRef.current?.injectJavaScript(script);
    },
  }));

  useEffect(() => {
    syncPendingAutoplay(nextVideoEmbedUrl);
  }, [nextVideoEmbedUrl]);

  const handleMessage = (event: WebViewMessageEvent) => {
    if (!onEnded) return;
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        continued?: boolean;
      };
      if (data.type === "ended") onEnded(Boolean(data.continued));
    } catch {
      /* ignore malformed messages */
    }
  };

  const handleLoadEnd = () => {
    syncPendingAutoplay(nextVideoEmbedUrl);
  };

  if (!hasUrl) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No video URL provided</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} accessibilityLabel={title ?? "Video player"}>
      <WebView
        ref={webViewRef}
        style={styles.video}
        source={{ html }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        onLoadEnd={handleLoadEnd}
      />
    </View>
  );
  },
);

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
