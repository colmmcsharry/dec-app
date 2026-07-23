import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { isMediaPathReady, mediaUrl } from "@/lib/media-base-url";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { Pause, Play } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

type ArticleAudioPlayerProps = {
  title: string;
  path: string;
  isDark: boolean;
};

function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ArticleAudioPlayer({
  title,
  path,
  isDark,
}: ArticleAudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const loadPromiseRef = useRef<Promise<Audio.Sound | null> | null>(null);
  const playRequestIdRef = useRef(0);
  const [loading, setLoading] = useState(false);
  const [startingPlayback, setStartingPlayback] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uri = mediaUrl(path);
  const mediaReady = isMediaPathReady(path);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        setError("Could not play this episode.");
        setStartingPlayback(false);
        setLoading(false);
      }
      return;
    }

    setPositionMs(status.positionMillis);
    if (status.durationMillis != null && status.durationMillis > 0) {
      setDurationMs(status.durationMillis);
    }
    setPlaying(status.isPlaying);
    if (status.isPlaying) {
      setStartingPlayback(false);
      setLoading(false);
    }

    if (status.didJustFinish) {
      setPlaying(false);
      setStartingPlayback(false);
      setPositionMs(status.durationMillis ?? 0);
    }
  }, []);

  useEffect(() => {
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      // Keep podcasts playing when the screen locks / app backgrounds.
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      playRequestIdRef.current += 1;
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
      loadPromiseRef.current = null;
    };
  }, []);

  // Drop sound when the track URL changes.
  useEffect(() => {
    playRequestIdRef.current += 1;
    const existing = soundRef.current;
    soundRef.current = null;
    loadPromiseRef.current = null;
    setPlaying(false);
    setStartingPlayback(false);
    setPositionMs(0);
    setDurationMs(0);
    setError(null);
    if (existing) {
      void existing.unloadAsync();
    }
  }, [uri]);

  const ensureSound = useCallback(
    async (shouldPlay: boolean) => {
      if (soundRef.current) return soundRef.current;
      if (!mediaReady) {
        setError("Media hosting is not configured yet.");
        return null;
      }

      if (loadPromiseRef.current) {
        return loadPromiseRef.current;
      }

      loadPromiseRef.current = (async () => {
        setLoading(true);
        setError(null);

        try {
          const { sound } = await Audio.Sound.createAsync(
            { uri },
            {
              shouldPlay,
              progressUpdateIntervalMillis: 250,
              androidImplementation: "MediaPlayer",
            },
            onPlaybackStatusUpdate,
          );
          soundRef.current = sound;

          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            if (status.durationMillis != null && status.durationMillis > 0) {
              setDurationMs(status.durationMillis);
            }
            setPlaying(status.isPlaying);
            if (status.isPlaying) {
              setStartingPlayback(false);
            }
          }

          return sound;
        } catch {
          setError(
            "Could not load this episode. Check your connection or try again later.",
          );
          return null;
        } finally {
          setLoading(false);
          loadPromiseRef.current = null;
        }
      })();

      return loadPromiseRef.current;
    },
    [mediaReady, onPlaybackStatusUpdate, uri],
  );

  // Warm the file so the first tap can play immediately.
  useEffect(() => {
    if (!mediaReady) return;
    void ensureSound(false);
  }, [ensureSound, mediaReady]);

  const togglePlayback = useCallback(async () => {
    if (!mediaReady) return;

    const requestId = ++playRequestIdRef.current;

    if (soundRef.current) {
      const currentStatus = await soundRef.current.getStatusAsync();
      if (requestId !== playRequestIdRef.current) return;

      if (currentStatus.isLoaded && currentStatus.isPlaying) {
        setStartingPlayback(false);
        await soundRef.current.pauseAsync();
        return;
      }

      setStartingPlayback(true);
      setError(null);
      try {
        if (
          currentStatus.isLoaded &&
          currentStatus.durationMillis != null &&
          currentStatus.positionMillis >= currentStatus.durationMillis - 500
        ) {
          await soundRef.current.setPositionAsync(0);
        }
        await soundRef.current.playAsync();
      } catch {
        if (requestId === playRequestIdRef.current) {
          setStartingPlayback(false);
          setError("Could not play this episode.");
        }
      }
      return;
    }

    setStartingPlayback(true);
    setError(null);

    // First tap: create already playing so we don't need a second gesture.
    const sound = await ensureSound(true);
    if (requestId !== playRequestIdRef.current) return;

    if (!sound) {
      setStartingPlayback(false);
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        setStartingPlayback(false);
        return;
      }
      if (!status.isPlaying) {
        await sound.playAsync();
      }
    } catch {
      if (requestId === playRequestIdRef.current) {
        setStartingPlayback(false);
        setError("Could not play this episode.");
      }
    }
  }, [ensureSound, mediaReady]);

  const progress = durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;
  const showSpinner = loading || startingPlayback;
  const showPause = playing && !showSpinner;

  return (
    <View
      style={[styles.player, isDark ? styles.playerDark : styles.playerLight]}
    >
      <Text style={[styles.trackTitle, isDark && styles.textDark]}>{title}</Text>

      {!mediaReady ? (
        <Text style={[styles.hint, isDark && styles.subtextDark]}>
          Podcast streaming will be available once media hosting is connected.
        </Text>
      ) : null}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.controlsRow}>
          <RectButton
            onPress={() => void togglePlayback()}
            enabled={mediaReady && !showSpinner}
            style={[
              styles.playButton,
              (!mediaReady || showSpinner) && styles.playButtonDisabled,
            ]}
            underlayColor="rgba(255,255,255,0.18)"
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            accessibilityRole="button"
            accessibilityLabel={showPause ? "Pause podcast" : "Play podcast"}
          >
            <View pointerEvents="none" style={styles.playButtonInner}>
              {showSpinner ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : showPause ? (
                <Pause size={22} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </View>
          </RectButton>

          <View style={styles.progressWrap}>
            <View
              style={[styles.progressTrack, isDark && styles.progressTrackDark]}
            >
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
            <Text style={[styles.timeText, isDark && styles.subtextDark]}>
              {formatTime(positionMs)} / {formatTime(durationMs)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  player: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  playerLight: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  playerDark: {
    backgroundColor: "#262940",
    borderWidth: 1,
    borderColor: "#3A3D55",
  },
  trackTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 15,
    color: "#1E2430",
    marginBottom: 10,
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
  hint: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: "#6B7280",
  },
  errorText: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: "#DC2626",
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MAIN_PURPLE,
    overflow: "hidden",
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playButtonInner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  progressWrap: {
    flex: 1,
    gap: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressTrackDark: {
    backgroundColor: "#3A3D55",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: MAIN_PURPLE,
  },
  timeText: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 12,
    color: "#6B7280",
  },
});
