import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { isMediaPathReady, mediaUrl } from "@/lib/media-base-url";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import { Pause, Play } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

type ArticleAudioPlayerProps = {
  title: string;
  path: string;
  isDark: boolean;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function ArticleAudioPlayer({
  title,
  path,
  isDark,
}: ArticleAudioPlayerProps) {
  const [startingPlayback, setStartingPlayback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uri = mediaUrl(path);
  const mediaReady = isMediaPathReady(path);
  const player = useAudioPlayer(mediaReady ? { uri } : null, {
    updateInterval: 250,
    downloadFirst: true,
  });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  useEffect(() => {
    setStartingPlayback(false);
    setError(null);
  }, [uri]);

  useEffect(() => {
    if (status.playing) {
      setStartingPlayback(false);
    }
  }, [status.playing]);

  const togglePlayback = useCallback(() => {
    if (!mediaReady) return;

    try {
      if (status.playing) {
        setStartingPlayback(false);
        player.pause();
        return;
      }

      setStartingPlayback(true);
      setError(null);

      const nearEnd =
        status.duration > 0 && status.currentTime >= status.duration - 0.5;
      if (nearEnd) {
        player.seekTo(0);
      }
      player.play();
    } catch {
      setStartingPlayback(false);
      setError("Could not play this episode.");
    }
  }, [mediaReady, player, status.currentTime, status.duration, status.playing]);

  const progress =
    status.duration > 0
      ? Math.min(1, status.currentTime / status.duration)
      : 0;
  const showSpinner =
    startingPlayback || (mediaReady && status.isBuffering && !status.playing);
  const showPause = status.playing && !showSpinner;

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
            onPress={togglePlayback}
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
              {formatTime(status.currentTime)} / {formatTime(status.duration)}
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
    gap: 4,
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
    backgroundColor: MAIN_PURPLE,
  },
  timeText: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 12,
    color: "#6B7280",
  },
});
