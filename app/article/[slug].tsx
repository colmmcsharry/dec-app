import { ArticleAudioPlayer } from "@/components/article-audio-player";
import { ScreenBackButton } from "@/components/screen-back-button";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { getArticleBySlug, type ArticleBlock } from "@/data/articles";
import { mediaUrl } from "@/lib/media-base-url";
import { requirePro } from "@/services/purchases";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { FileText, Headphones } from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMemo, useState, useEffect } from "react";

function ArticleImage({
  block,
  uri,
  isDark,
}: {
  block: Extract<ArticleBlock, { type: "image" }>;
  uri: string;
  isDark: boolean;
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  return (
    <View style={styles.imageWrap}>
      {!imageError ? (
        <>
          {imageLoading ? (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator color={MAIN_PURPLE} />
            </View>
          ) : null}
          <Image
            source={{ uri }}
            style={[
              styles.articleImage,
              aspectRatio != null && { aspectRatio },
              imageLoading && styles.articleImageHidden,
            ]}
            resizeMode="contain"
            accessibilityLabel={block.alt ?? block.caption ?? "Article image"}
            onLoad={(event) => {
              const { width, height } = event.nativeEvent.source;
              if (width > 0 && height > 0) {
                setAspectRatio(width / height);
              }
              setImageLoading(false);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
        </>
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={[styles.imageFallback, isDark && styles.subtextDark]}>
            Image unavailable
          </Text>
        </View>
      )}
      {block.caption ? (
        <Text style={[styles.imageCaption, isDark && styles.subtextDark]}>
          {block.caption}
        </Text>
      ) : null}
    </View>
  );
}

function ArticleBlockView({
  block,
  isDark,
}: {
  block: ArticleBlock;
  isDark: boolean;
}) {
  switch (block.type) {
    case "heading":
      return (
        <Text
          style={[
            block.level === 3 ? styles.heading3 : styles.heading2,
            isDark && styles.textDark,
          ]}
        >
          {block.text}
        </Text>
      );
    case "quote":
      return (
        <View
          style={[
            styles.quoteBlock,
            isDark ? styles.quoteBlockDark : styles.quoteBlockLight,
          ]}
        >
          <Text style={[styles.quoteText, isDark && styles.textDark]}>
            {block.text}
          </Text>
        </View>
      );
    case "emphasis":
      return (
        <Text style={[styles.emphasis, isDark && styles.textDark]}>
          {block.text}
        </Text>
      );
    case "list":
      return (
        <View style={styles.listBlock}>
          {block.items.map((item, itemIndex) => (
            <Text
              key={`${itemIndex}-${item.slice(0, 12)}`}
              style={[styles.listItem, isDark && styles.bodyDark]}
            >
              {"\u2022 "}
              {item}
            </Text>
          ))}
        </View>
      );
    case "image": {
      const uri = mediaUrl(block.path);
      return (
        <ArticleImage block={block} uri={uri} isDark={isDark} />
      );
    }
    case "paragraph":
    default:
      return (
        <Text style={[styles.paragraph, isDark && styles.bodyDark]}>
          {block.text}
        </Text>
      );
  }
}

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const allowed = await requirePro();
      if (cancelled) return;
      if (!allowed) {
        router.back();
        return;
      }
      setAccessChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const article = useMemo(
    () => (slug ? getArticleBySlug(slug) : undefined),
    [slug],
  );

  if (!accessChecked) {
    return (
      <View style={[styles.centered, isDark && styles.screenDark]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={MAIN_PURPLE} />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={[styles.centered, isDark && styles.screenDark]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={[styles.errorTitle, isDark && styles.textDark]}>
          Article not found
        </Text>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.screen, isDark && styles.screenDark]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
            paddingHorizontal: 16,
          },
        ]}
      >
        <ScreenBackButton color={isDark ? "#ECEDEE" : "#1E2430"} />
        <View style={styles.kindBadge}>
          {article.kind === "podcast" ? (
            <Headphones size={14} color={MAIN_PURPLE} />
          ) : (
            <FileText size={14} color={MAIN_PURPLE} />
          )}
          <Text style={styles.kindBadgeText}>
            {article.kind === "podcast" ? "Podcast & Article" : "Article"}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isDark && styles.textDark]}>
          {article.title}
        </Text>

        {article.podcasts && article.podcasts.length > 0 ? (
          <View style={styles.podcastSection}>
            <Text style={[styles.sectionLabel, isDark && styles.textDark]}>
              Listen
            </Text>
            {article.podcasts.map((track) => (
              <ArticleAudioPlayer
                key={track.id}
                title={track.title}
                path={track.path}
                isDark={isDark}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.bodySection}>
          {article.blocks.map((block, index) => (
            <ArticleBlockView
              key={`${block.type}-${index}`}
              block={block}
              isDark={isDark}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const WORKBOOK_TEXT = "#1E2430";
const WORKBOOK_TEXT_BODY = "#363C48";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  screenDark: {
    backgroundColor: "#121222",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
    zIndex: 10,
  },
  kindBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EDE8F8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  kindBadgeText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12,
    color: MAIN_PURPLE,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontFamily: AppFonts.headingBold,
    fontSize: 26,
    lineHeight: 34,
    color: WORKBOOK_TEXT,
    marginBottom: 20,
  },
  textDark: {
    color: "#ECEDEE",
  },
  bodyDark: {
    color: "#D1D5DB",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
  podcastSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: WORKBOOK_TEXT,
    marginBottom: 10,
  },
  bodySection: {
    gap: 0,
  },
  paragraph: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 16,
    lineHeight: 26,
    color: WORKBOOK_TEXT_BODY,
    marginBottom: 16,
  },
  heading2: {
    fontFamily: AppFonts.headingBold,
    fontSize: 20,
    lineHeight: 28,
    color: WORKBOOK_TEXT,
    marginTop: 8,
    marginBottom: 12,
  },
  heading3: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: WORKBOOK_TEXT,
    marginTop: 8,
    marginBottom: 10,
  },
  emphasis: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: WORKBOOK_TEXT,
    marginBottom: 16,
  },
  listBlock: {
    marginBottom: 16,
    gap: 8,
  },
  listItem: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 16,
    lineHeight: 26,
    color: WORKBOOK_TEXT_BODY,
  },
  quoteBlock: {
    borderLeftWidth: 3,
    borderLeftColor: MAIN_PURPLE,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  quoteBlockLight: {
    backgroundColor: "#F3F4F6",
  },
  quoteBlockDark: {
    backgroundColor: "#1E1E32",
  },
  quoteText: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 24,
    color: WORKBOOK_TEXT_BODY,
    fontStyle: "italic",
  },
  imageWrap: {
    marginBottom: 16,
  },
  articleImage: {
    width: "100%",
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  articleImageHidden: {
    opacity: 0,
    height: 0,
  },
  imagePlaceholder: {
    width: "100%",
    minHeight: 160,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  imageFallback: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    color: "#6B7280",
  },
  imageCaption: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  errorTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: WORKBOOK_TEXT,
    marginBottom: 12,
  },
  backLink: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 16,
    color: MAIN_PURPLE,
  },
});
