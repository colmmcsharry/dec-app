import { ArticleListCard } from "@/components/article-list-card";
import { DownloadListCard } from "@/components/download-list-card";
import { MainTabHeader } from "@/components/main-tab-header";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { getFeaturedArticle, getFeaturedPodcast } from "@/data/articles";
import { getFeaturedDownload } from "@/data/downloads";
import { requirePro } from "@/services/purchases";
import { useRouter } from "expo-router";
import { Download, FileText, Headphones, type LucideIcon } from "lucide-react-native";
import type { ReactNode } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WORKBOOK_TEXT = "#1E2430";

type FeatureSectionProps = {
  title: string;
  titleIcon: LucideIcon;
  eyebrow: string;
  isDark: boolean;
  viewAllLabel: string;
  onViewAll: () => void;
  children: ReactNode;
};

function FeatureSection({
  title,
  titleIcon: TitleIcon,
  eyebrow,
  isDark,
  viewAllLabel,
  onViewAll,
  children,
}: FeatureSectionProps) {
  return (
    <View
      style={[
        styles.featureSection,
        isDark && styles.cardDark,
        styles.cardShell,
        isDark && styles.cardShellDark,
      ]}
    >
      <View style={[styles.cardAccentBar, isDark && styles.cardAccentBarDark]} />
      <View style={styles.cardInner}>
        <View style={styles.sectionTitleRow}>
          <TitleIcon
            size={24}
            color={isDark ? "#ECEDEE" : WORKBOOK_TEXT}
            strokeWidth={2.25}
          />
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            {title}
          </Text>
        </View>
        <Text
          style={[styles.sectionEyebrow, isDark && styles.sectionEyebrowDark]}
        >
          {eyebrow}
        </Text>
        {children}
        <Pressable
          style={({ pressed }) => [
            styles.viewAllButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onViewAll}
          accessibilityRole="button"
          accessibilityLabel={viewAllLabel}
        >
          <Text style={styles.viewAllButtonText}>{viewAllLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ResourcesScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const featuredDownload = getFeaturedDownload();
  const featuredArticle = getFeaturedArticle();
  const featuredPodcast = getFeaturedPodcast();

  const openDownload = async (id: string, title: string) => {
    if (!(await requirePro())) return;
    router.push({
      pathname: "/pdf-viewer",
      params: { downloadId: id, title },
    });
  };

  const openArticle = async (slug: string) => {
    if (!(await requirePro())) return;
    router.push({
      pathname: "/article/[slug]",
      params: { slug },
    });
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: 8, paddingBottom: insets.bottom + 40 },
      ]}
    >
      <MainTabHeader />

      <FeatureSection
        title="Downloads"
        titleIcon={Download}
        eyebrow="Latest Download"
        isDark={isDark}
        viewAllLabel="View All Downloads"
        onViewAll={() => router.push("/downloads")}
      >
        <DownloadListCard
          download={featuredDownload}
          isDark={isDark}
          onPress={() =>
            void openDownload(featuredDownload.id, featuredDownload.title)
          }
        />
      </FeatureSection>

      {featuredArticle ? (
        <FeatureSection
          title="Articles"
          titleIcon={FileText}
          eyebrow="Latest Article"
          isDark={isDark}
          viewAllLabel="View All Articles"
          onViewAll={() =>
            router.push({
              pathname: "/articles",
              params: { kind: "article" },
            })
          }
        >
          <ArticleListCard
            article={featuredArticle}
            isDark={isDark}
            onPress={() => void openArticle(featuredArticle.slug)}
          />
        </FeatureSection>
      ) : null}

      {featuredPodcast ? (
        <FeatureSection
          title="Podcasts"
          titleIcon={Headphones}
          eyebrow="Latest Podcast"
          isDark={isDark}
          viewAllLabel="View All Podcasts"
          onViewAll={() =>
            router.push({
              pathname: "/articles",
              params: { kind: "podcast" },
            })
          }
        >
          <ArticleListCard
            article={featuredPodcast}
            isDark={isDark}
            onPress={() => void openArticle(featuredPodcast.slug)}
          />
        </FeatureSection>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  content: {
    paddingHorizontal: 20,
  },
  cardDark: {
    backgroundColor: "#1E1E32",
  },
  featureSection: {
    marginBottom: 24,
    backgroundColor: "#F3F2F7",
  },
  cardShell: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#EADBF7",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: MAIN_PURPLE,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
    }),
  },
  cardShellDark: {
    borderColor: "#3A2E5C",
    ...Platform.select({
      ios: {
        shadowOpacity: 0.35,
      },
    }),
  },
  cardAccentBar: {
    height: 5,
    backgroundColor: "#A8B4E8",
  },
  cardAccentBarDark: {
    backgroundColor: MAIN_PURPLE,
  },
  cardInner: {
    padding: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: AppFonts.headingBold,
    color: MAIN_PURPLE,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  sectionEyebrowDark: {
    color: "#B7A8E0",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: WORKBOOK_TEXT,
  },
  sectionTitleDark: {
    color: "#ECEDEE",
  },
  viewAllButton: {
    marginTop: 4,
    backgroundColor: MAIN_PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  viewAllButtonText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: "#FFFFFF",
  },
});
