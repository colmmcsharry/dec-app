import { ArticleListCard } from "@/components/article-list-card";
import { DownloadListCard } from "@/components/download-list-card";
import { MainTabHeader } from "@/components/main-tab-header";
import { PageHeading } from "@/components/page-heading";
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

type SectionVariant = "purple" | "blue" | "yellow";

const SECTION_THEMES: Record<
  SectionVariant,
  {
    light: { background: string; border: string; accent: string; shadow: string };
    dark: { background: string; border: string; accent: string };
  }
> = {
  purple: {
    light: {
      background: "#F3F2F7",
      border: "#EADBF7",
      accent: "#A8B4E8",
      shadow: MAIN_PURPLE,
    },
    dark: {
      background: "#1E1E32",
      border: "#3A2E5C",
      accent: MAIN_PURPLE,
    },
  },
  blue: {
    light: {
      background: "#EDF3FB",
      border: "#C8DAF2",
      accent: "#89AAD4",
      shadow: "#5B8BC4",
    },
    dark: {
      background: "#1A2438",
      border: "#2E4568",
      accent: "#5B8BC4",
    },
  },
  yellow: {
    light: {
      background: "#FBF7EC",
      border: "#EDE0B8",
      accent: "#D4B86A",
      shadow: "#B8943A",
    },
    dark: {
      background: "#2A2818",
      border: "#4A4528",
      accent: "#C4A855",
    },
  },
};

type FeatureSectionProps = {
  title: string;
  titleIcon: LucideIcon;
  eyebrow: string;
  variant: SectionVariant;
  isDark: boolean;
  viewAllLabel: string;
  onViewAll: () => void;
  children: ReactNode;
};

function FeatureSection({
  title,
  titleIcon: TitleIcon,
  eyebrow,
  variant,
  isDark,
  viewAllLabel,
  onViewAll,
  children,
}: FeatureSectionProps) {
  const theme = SECTION_THEMES[variant][isDark ? "dark" : "light"];

  return (
    <View
      style={[
        styles.featureSection,
        styles.cardShell,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
          ...Platform.select({
            ios: {
              shadowColor: isDark ? MAIN_PURPLE : theme.shadow,
            },
            default: {},
          }),
        },
      ]}
    >
      <View style={[styles.cardAccentBar, { backgroundColor: theme.accent }]} />
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
      params: { pdfKey: id, title },
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
      <PageHeading showPremiumBadge title="Resources" />

      <FeatureSection
        title="Downloads"
        titleIcon={Download}
        variant="purple"
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
          variant="yellow"
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
          variant="blue"
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
  featureSection: {
    marginBottom: 24,
  },
  cardShell: {
    borderRadius: 20,
    borderWidth: 2,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
    }),
  },
  cardAccentBar: {
    height: 5,
  },
  cardInner: {
    padding: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontFamily: AppFonts.headingBold,
    color: MAIN_PURPLE,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 4,
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
