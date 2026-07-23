import { ArticleListCard } from "@/components/article-list-card";
import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { requirePro } from "@/services/purchases";
import {
  fetchWordpressArticles,
  type WordpressArticle,
} from "@/services/wordpress-posts";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
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
  const [posts, setPosts] = useState<WordpressArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        const next = await fetchWordpressArticles();
        if (!cancelled) setPosts(next);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Could not load WordPress posts",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredArticles = useMemo(() => {
    if (kind === "article" || kind === "podcast") {
      return posts.filter((article) => article.kind === kind);
    }
    return posts;
  }, [kind, posts]);

  const headerTitle =
    kind === "article"
      ? "Articles"
      : kind === "podcast"
        ? "Podcasts"
        : "Articles & Podcasts";

  const subtitle =
    kind === "article"
      ? "The latest blogs and articles from Declan"
      : kind === "podcast"
        ? "Podcast episodes pulled from WordPress"
        : "Live WordPress feed";

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

        {loading ? (
          <View style={styles.stateBlock}>
            <ActivityIndicator size="large" color={MAIN_PURPLE} />
            <Text style={[styles.stateText, isDark && styles.subtextDark]}>
              Loading from Declan's blog…
            </Text>
          </View>
        ) : null}

        {error && !loading ? (
          <View style={styles.stateBlock}>
            <Text style={[styles.errorText, isDark && styles.textDark]}>
              {error}
            </Text>
            <Pressable
              onPress={() => {
                setLoading(true);
                setError(null);
                void fetchWordpressArticles()
                  .then(setPosts)
                  .catch((e) =>
                    setError(
                      e instanceof Error
                        ? e.message
                        : "Could not load WordPress posts",
                    ),
                  )
                  .finally(() => setLoading(false));
              }}
              style={styles.retryBtn}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && filteredArticles.length === 0 ? (
          <Text style={[styles.stateText, isDark && styles.subtextDark]}>
            No {kind === "podcast" ? "podcasts" : "articles"} found yet.
          </Text>
        ) : null}

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
    gap: 12,
  },
  subtitle: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 4,
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#A1A1B5",
  },
  stateBlock: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 32,
  },
  stateText: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
  },
  errorText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: "#1E2430",
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: MAIN_PURPLE,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryText: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
});
