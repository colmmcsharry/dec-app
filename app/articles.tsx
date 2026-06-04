import { ArticleListCard } from "@/components/article-list-card";
import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { ARTICLES } from "@/data/articles";
import { requirePro } from "@/services/purchases";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ArticlesScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { kind } = useLocalSearchParams<{ kind?: string }>();

  const filteredArticles = ARTICLES.filter((article) => {
    if (kind === "article" || kind === "podcast") {
      return article.kind === kind;
    }
    return true;
  });

  const headerTitle =
    kind === "article"
      ? "Articles"
      : kind === "podcast"
        ? "Podcasts"
        : "Articles & Podcasts";

  const subtitle =
    kind === "article"
      ? "Articles from Declan and guest contributors"
      : kind === "podcast"
        ? "Podcast episodes and interviews"
        : "Articles and podcast episodes";

  const openArticle = async (slug: string) => {
    if (!(await requirePro())) return;
    router.push({
      pathname: "/article/[slug]",
      params: { slug },
    });
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <ScreenBackButton color={isDark ? "#ECEDEE" : "#2C3E50"} />
        <Text
          pointerEvents="none"
          style={[styles.headerTitle, isDark && styles.textDark]}
        >
          {headerTitle}
        </Text>
        <View pointerEvents="none" style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, isDark && styles.subtextDark]}>
          {subtitle}
        </Text>

        {filteredArticles.map((article) => (
          <ArticleListCard
            key={article.slug}
            article={article}
            isDark={isDark}
            onPress={() => void openArticle(article.slug)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FA",
  },
  containerDark: {
    backgroundColor: "#12121E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: "#1E2430",
    textAlign: "center",
  },
  headerSpacer: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  subtitle: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 16,
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
});
