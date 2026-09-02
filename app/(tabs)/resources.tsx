import { ArticleListCard } from "@/components/article-list-card";
import { ArticleListCardSkeleton } from "@/components/article-list-card-skeleton";
import { DownloadListCard } from "@/components/download-list-card";
import { GymRoutineCard } from "@/components/gym-routine-card";
import { HiitWorkoutsCard } from "@/components/hiit-workouts-card";
import { StrengthFitnessTargetsCard } from "@/components/strength-fitness-targets-card";
import { MainTabHeader } from "@/components/main-tab-header";
import { PageHeading } from "@/components/page-heading";
import { MODULE_THEMES } from "@/constants/module-themes";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { getFeaturedDownload } from "@/data/downloads";
import { getFeaturedGymRoutine } from "@/data/gym-routines";
import { requirePro } from "@/services/purchases";
import {
  loadWordpressArticles,
  type WordpressArticle,
} from "@/services/wordpress-posts";
import { useRouter } from "expo-router";
import {
  Download,
  Dumbbell,
  FileText,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import { type ReactNode, useEffect, useState } from "react";
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

type SectionVariant = "purple" | "blue" | "yellow" | "green" | "coral";

/** Same pastel fills as Home / Worksheets module cards. */
const SECTION_BACKGROUNDS: Record<SectionVariant, string> = {
  purple: MODULE_THEMES.sleep.backgroundColor,
  yellow: MODULE_THEMES["morning-routines"].backgroundColor,
  blue: MODULE_THEMES.recovery.backgroundColor,
  green: MODULE_THEMES["energy-management"].backgroundColor,
  coral: MODULE_THEMES["fuel-2-perform"].backgroundColor,
};

const SECTION_SHADOWS: Record<
  SectionVariant,
  { light: string; dark: string }
> = {
  purple: { light: MAIN_PURPLE, dark: MAIN_PURPLE },
  blue: { light: "#5B8BC4", dark: "#5B8BC4" },
  yellow: { light: "#B8943A", dark: "#C4A855" },
  green: { light: "#4A8A5C", dark: "#4A8A5C" },
  coral: { light: "#D97B7B", dark: "#D97B7B" },
};

type FeatureSectionProps = {
  title: string;
  titleIcon: LucideIcon;
  variant: SectionVariant;
  isDark: boolean;
  eyebrow?: string;
  viewAllLabel?: string;
  onViewAll?: () => void;
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
  const background = SECTION_BACKGROUNDS[variant];
  const shadow = SECTION_SHADOWS[variant][isDark ? "dark" : "light"];

  return (
    <View
      style={[
        styles.featureSection,
        styles.cardShell,
        {
          backgroundColor: background,
          ...Platform.select({
            ios: {
              shadowColor: shadow,
            },
            default: {},
          }),
        },
      ]}
    >
      <View style={styles.cardInner}>
        <View style={styles.sectionTitleRow}>
          <TitleIcon
            size={24}
            color={WORKBOOK_TEXT}
            strokeWidth={2.25}
          />
          <Text style={styles.sectionTitle}>
            {title}
          </Text>
        </View>
        {eyebrow ? (
          <Text style={styles.sectionEyebrow}>
            {eyebrow}
          </Text>
        ) : null}
        {children}
        {viewAllLabel && onViewAll ? (
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
        ) : null}
      </View>
    </View>
  );
}

export default function ResourcesScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const featuredDownload = getFeaturedDownload();
  const featuredGymRoutine = getFeaturedGymRoutine();
  const [featuredArticle, setFeaturedArticle] = useState<WordpressArticle | null>(
    null,
  );
  const [wpLoading, setWpLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { articles } = await loadWordpressArticles({
          onUpdate: (fresh) => {
            if (cancelled) return;
            setFeaturedArticle(
              fresh.find((p) => p.kind === "article") ?? null,
            );
            setWpLoading(false);
          },
        });
        if (cancelled) return;
        setFeaturedArticle(
          articles.find((p) => p.kind === "article") ?? null,
        );
        // Cache hit: hide skeleton immediately; cold start waited on network.
        setWpLoading(false);
      } catch {
        if (!cancelled) {
          setFeaturedArticle(null);
          setWpLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openStrengthTargets = async () => {
    if (!(await requirePro())) return;
    router.push("/strength-fitness-targets");
  };

  const openHiitWorkouts = async () => {
    if (!(await requirePro())) return;
    router.push("/hiit-workouts");
  };

  const openDownloads = () => router.push("/downloads");

  const openArticles = () =>
    router.push({
      pathname: "/articles",
      params: { kind: "article" },
    });

  const openArticle = async (slug: string) => {
    if (!(await requirePro())) return;
    router.push({
      pathname: "/article/[slug]",
      params: { slug },
    });
  };

  const openGymRoutines = () => router.push("/gym-routines");

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
        onViewAll={openDownloads}
      >
        <DownloadListCard
          download={featuredDownload}
          isDark={isDark}
          onPress={openDownloads}
        />
      </FeatureSection>

      {wpLoading || featuredArticle ? (
        <FeatureSection
          title="Articles"
          titleIcon={FileText}
          variant="yellow"
          eyebrow="Latest Article"
          isDark={isDark}
          viewAllLabel="View All Articles"
          onViewAll={openArticles}
        >
          {featuredArticle ? (
            <ArticleListCard
              article={featuredArticle}
              isDark={isDark}
              onPress={() => void openArticle(featuredArticle.slug)}
            />
          ) : (
            <ArticleListCardSkeleton isDark={isDark} />
          )}
        </FeatureSection>
      ) : null}

      <FeatureSection
        title="Gym Routines"
        titleIcon={Dumbbell}
        variant="green"
        eyebrow="Beginner Strength"
        isDark={isDark}
        viewAllLabel="View All Gym Routines"
        onViewAll={openGymRoutines}
      >
        <GymRoutineCard
          routine={featuredGymRoutine}
          isDark={isDark}
          onPress={openGymRoutines}
        />
      </FeatureSection>

      <FeatureSection
        title="Strength/Fitness Targets"
        titleIcon={Target}
        variant="blue"
        eyebrow="Benchmarks"
        isDark={isDark}
        viewAllLabel="View All Targets"
        onViewAll={() => void openStrengthTargets()}
      >
        <StrengthFitnessTargetsCard
          isDark={isDark}
          onPress={() => void openStrengthTargets()}
        />
      </FeatureSection>

      <FeatureSection
        title="HIIT Workouts"
        titleIcon={Zap}
        variant="coral"
        eyebrow="No Equipment"
        isDark={isDark}
        viewAllLabel="View HIIT Workouts"
        onViewAll={() => void openHiitWorkouts()}
      >
        <HiitWorkoutsCard
          isDark={isDark}
          onPress={() => void openHiitWorkouts()}
        />
      </FeatureSection>
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
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 4 },
    }),
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
