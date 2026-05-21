import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { getArticleThumbnail } from "@/data/articles";
import type { Article } from "@/data/articles/types";
import { ChevronRight, FileText, Headphones } from "lucide-react-native";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";

type ArticleListCardProps = {
  article: Article;
  isDark: boolean;
  onPress: () => void;
};

export function ArticleListCard({
  article,
  isDark,
  onPress,
}: ArticleListCardProps) {
  const thumbnail = getArticleThumbnail(article);
  const kindLabel = article.kind === "podcast" ? "Podcast" : "Article";
  const KindIcon = article.kind === "podcast" ? Headphones : FileText;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${kindLabel.toLowerCase()}: ${article.title}`}
    >
      <View style={styles.row}>
        <View style={styles.mediaCol}>
          {thumbnail ? (
            <View
              style={[
                styles.thumbnailWrap,
                isDark ? styles.thumbnailWrapDark : styles.thumbnailWrapLight,
              ]}
            >
              <Image
                source={{ uri: thumbnail }}
                style={styles.thumbnail}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
            </View>
          ) : (
            <View
              style={[styles.iconCircle, isDark && styles.iconCircleDark]}
            >
              <KindIcon size={28} color={isDark ? "#ECEDEE" : MAIN_PURPLE} />
            </View>
          )}

          <View style={styles.kindRow}>
            <KindIcon
              size={18}
              color={isDark ? "#C4B5E8" : MAIN_PURPLE}
              strokeWidth={2.25}
            />
            <Text style={[styles.kindText, isDark && styles.kindTextDark]}>
              {kindLabel}
            </Text>
          </View>
        </View>

        <View style={styles.textWrap}>
          <Text
            style={[styles.title, isDark && styles.textDark]}
            numberOfLines={3}
            includeFontPadding={false}
          >
            {article.title}
          </Text>
          <Text
            style={[styles.excerpt, isDark && styles.subtextDark]}
            numberOfLines={2}
          >
            {article.excerpt}
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
  mediaCol: {
    width: THUMB_SIZE,
    alignItems: "flex-start",
    gap: 6,
  },
  thumbnailWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
  },
  thumbnailWrapLight: {
    borderColor: "#D1D5DB",
  },
  thumbnailWrapDark: {
    borderColor: "#4B5563",
  },
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  kindRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 5,
  },
  kindText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12,
    color: MAIN_PURPLE,
  },
  kindTextDark: {
    color: "#C4B5E8",
  },
  iconCircle: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    backgroundColor: "#EDE8F8",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleDark: {
    backgroundColor: "#2A2A45",
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
