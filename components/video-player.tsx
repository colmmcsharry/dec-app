import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  /** Shown until the Vimeo WebView finishes loading. */
  posterUrl?: string;
  /** Embed URL for the next video — queued inside the WebView for gapless autoplay. */
  nextVideoEmbedUrl?: string | null;
  /** Called when the Vimeo player fires `ended`. `continued` is true if the next video started playing. */
  onEnded?: (continued: boolean) => void;
}

const PLAYER_PARAMS: Record<string, string> = {
  autoplay: "1",
  muted: "0",
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

/**
 * Inline Vimeo player. Autoplay chaining must only report `continued: true`
 * after play() actually starts — otherwise RN advances UI while Vimeo stays paused
 * (common under memory pressure / audio session contention from other apps).
 */
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
      function sleep(ms) {
        return new Promise(function (resolve) { setTimeout(resolve, ms); });
      }

      /** Prefer id+hash — more reliable than a full embed URL for loadVideo. */
      function parseVimeoTarget(url) {
        var idMatch = String(url).match(/\\/video\\/(\\d+)/);
        var hashMatch = String(url).match(/[?&]h=([a-zA-Z0-9]+)/);
        if (idMatch) {
          var spec = { id: Number(idMatch[1]) };
          if (hashMatch) spec.hash = hashMatch[1];
          return spec;
        }
        return url;
      }

      function playWithRetry(player, attemptsLeft) {
        return player.play().catch(function () {
          if (attemptsLeft <= 1) {
            return Promise.reject(new Error("play failed"));
          }
          return sleep(400).then(function () {
            return playWithRetry(player, attemptsLeft - 1);
          });
        });
      }

      function confirmPlaying(player) {
        return sleep(450).then(function () {
          return player.getPaused();
        }).then(function (paused) {
          if (!paused) return;
          return playWithRetry(player, 3).then(function () {
            return sleep(300).then(function () {
              return player.getPaused();
            });
          }).then(function (stillPaused) {
            if (stillPaused) {
              return Promise.reject(new Error("still paused"));
            }
          });
        });
      }

      function loadAndPlayInternal(targetUrl) {
        var spec = parseVimeoTarget(targetUrl);
        return player.loadVideo(spec)
          .then(function () { return player.ready(); })
          .then(function () { return sleep(100); })
          .then(function () { return playWithRetry(player, 5); })
          .then(function () { return confirmPlaying(player); });
      }

      function post(payload) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }
      }

      var player = new Vimeo.Player("player", {
        url: "${safeUrl}",
        responsive: true,
        dnt: true,
        autopause: false,
        playsinline: true,
        autoplay: true,
      });

      // Start playback when the lesson page opens (thumbnail tap → this screen).
      player.ready().then(function () {
        return playWithRetry(player, 6);
      }).catch(function () {});

      window.__pendingAutoplay = null;

      window.__setPendingAutoplay = function (url) {
        window.__pendingAutoplay = url ? { url: url } : null;
      };

      window.__loadAndPlay = function (url) {
        window.__pendingAutoplay = null;
        return loadAndPlayInternal(url).catch(function () {
          /* RN may show play UI; user can tap play */
        });
      };

      window.__pause = function () {
        try { player.pause(); } catch (e) {}
      };

      window.__ensurePlaying = function () {
        return player.getPaused().then(function (paused) {
          if (!paused) return;
          return playWithRetry(player, 4);
        }).catch(function () {});
      };

      player.on("ended", function () {
        var pending = window.__pendingAutoplay;
        window.__pendingAutoplay = null;

        if (!pending || !pending.url) {
          post({ type: "ended", continued: false });
          return;
        }

        loadAndPlayInternal(pending.url)
          .then(function () {
            post({ type: "ended", continued: true });
          })
          .catch(function () {
            // Tell RN autoplay did not stick so it can retry via loadAndPlay.
            post({ type: "ended", continued: false, autoplayFailed: true });
          });
      });
    })();
  </script>
</body>
</html>`;
}

export type VideoPlayerHandle = {
  loadAndPlay: (embedUrl: string) => void;
  pause: () => void;
  ensurePlaying: () => void;
};

export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer(
    { videoUrl, title, posterUrl, nextVideoEmbedUrl, onEnded },
    ref,
  ) {
    const webViewRef = useRef<WebView>(null);
    const initialEmbedUrlRef = useRef<string | null>(null);
    const [showPoster, setShowPoster] = useState(Boolean(posterUrl));
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
      loadAndPlay(nextEmbedUrl: string) {
        const script = `
        (function () {
          if (window.__loadAndPlay) {
            window.__loadAndPlay(${JSON.stringify(nextEmbedUrl)});
          }
        })();
        true;
      `;
        webViewRef.current?.injectJavaScript(script);
      },
      pause() {
        const script = `
        (function () {
          if (window.__pause) {
            window.__pause();
          }
        })();
        true;
      `;
        webViewRef.current?.injectJavaScript(script);
      },
      ensurePlaying() {
        const script = `
        (function () {
          if (window.__ensurePlaying) {
            window.__ensurePlaying();
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
      if (posterUrl) setShowPoster(false);
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
        {showPoster && posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={styles.poster}
            resizeMode="cover"
            pointerEvents="none"
          />
        ) : null}
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
  poster: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
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
