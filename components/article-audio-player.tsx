import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { isMediaPathReady, mediaUrl } from "@/lib/media-base-url";
import { Audio, type AVPlaybackStatus } from "expo-av";
import { Pause, Play } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

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
  const [loading, setLoading] = useState(false);
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
      }
      return;
    }

    setPositionMs(status.positionMillis);
    setDurationMs(status.durationMillis ?? 0);
    setPlaying(status.isPlaying);

    if (status.didJustFinish) {
      setPlaying(false);
      setPositionMs(status.durationMillis ?? 0);
    }
  }, []);

  useEffect(() => {
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    return () => {
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, []);

  const ensureSound = useCallback(async () => {
    if (soundRef.current) return soundRef.current;
    if (!mediaReady) {
      setError("Media hosting is not configured yet.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate,
      );
      soundRef.current = sound;
      return sound;
    } catch {
      setError("Could not load this episode. Check your connection or try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  }, [mediaReady, onPlaybackStatusUpdate, uri]);

  const togglePlayback = async () => {
    const sound = await ensureSound();
    if (!sound) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
      return;
    }

    if (
      status.durationMillis != null &&
      status.positionMillis >= status.durationMillis - 500
    ) {
      await sound.setPositionAsync(0);
    }

    await sound.playAsync();
  };

  const progress =
    durationMs > 0 ? Math.min(1, positionMs / durationMs) : 0;

  return (
    <View
      style={[
        styles.player,
        isDark ? styles.playerDark : styles.playerLight,
      ]}
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
          <Pressable
            onPress={() => void togglePlayback()}
            disabled={loading || !mediaReady}
            style={({ pressed }) => [
              styles.playButton,
              { opacity: pressed ? 0.85 : loading || !mediaReady ? 0.5 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={playing ? "Pause podcast" : "Play podcast"}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : playing ? (
              <Pause size={22} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </Pressable>

          <View style={styles.progressWrap}>
            <View
              style={[
                styles.progressTrack,
                isDark && styles.progressTrackDark,
              ]}
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
