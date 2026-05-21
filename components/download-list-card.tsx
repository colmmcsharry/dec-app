import { AppFonts } from "@/constants/theme";
import type { Download } from "@/data/downloads";
import { Image } from "expo-image";
import { ChevronRight } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type DownloadListCardProps = {
  download: Download;
  isDark: boolean;
  onPress: () => void;
};

export function DownloadListCard({
  download,
  isDark,
  onPress,
}: DownloadListCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open download: ${download.title}`}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.thumbnailWrap,
            isDark ? styles.thumbnailWrapDark : styles.thumbnailWrapLight,
          ]}
        >
          <Image
            source={download.thumbnail}
            style={styles.thumbnail}
            contentFit="cover"
            contentPosition="center"
            accessibilityIgnoresInvertColors
          />
        </View>

        <View style={styles.textWrap}>
          <Text
            style={[styles.title, isDark && styles.textDark]}
            numberOfLines={3}
          >
            {download.title}
          </Text>
          <Text
            style={[styles.excerpt, isDark && styles.subtextDark]}
            numberOfLines={2}
          >
            {download.description}
          </Text>
        </View>

        <ChevronRight
          size={18}
          color={isDark ? "#9090A8" : "#6B7280"}
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );
}

const THUMB_SIZE = 84;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  cardLight: {
    backgroundColor: "#FFFFFF",
  },
  cardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A3D55",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  thumbnailWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    flexShrink: 0,
    position: "relative",
  },
  thumbnailWrapLight: {
    borderColor: "#D1D5DB",
  },
  thumbnailWrapDark: {
    borderColor: "#4B5563",
  },
  thumbnail: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: "#2C3E50",
  },
  excerpt: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
  },
  chevron: {
    marginTop: 0,
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
});
