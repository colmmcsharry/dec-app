import {
  MODULE_CARD_BRIGHTEN_SCRIMS,
  MODULE_CARD_DARK_SCRIMS,
  MODULE_HEADER_BACKGROUNDS,
} from "@/components/module-card-art";
import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { MODULE_THEMES } from "@/constants/module-themes";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_SUMMARIES } from "@/data/module-summaries";
import { MODULE_WORKBOOKS } from "@/data/module-workbooks";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Sparkles } from "lucide-react-native";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function ModuleSummaryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const theme = slug ? MODULE_THEMES[slug] : undefined;
  const workbook = slug ? MODULE_WORKBOOKS[slug] : undefined;
  const sections = slug ? (MODULE_SUMMARIES[slug] ?? []) : [];

  if (!slug || !theme || !workbook || sections.length === 0) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <ScreenBackButton color={isDark ? "#ECEDEE" : "#1E2430"} />
          <Text
            pointerEvents="none"
            style={[styles.headerTitle, isDark && styles.textDark]}
          >
            Module summary
          </Text>
          <View pointerEvents="none" style={styles.headerSpacer} />
        </View>
        <Text style={[styles.missingText, isDark && styles.mutedDark]}>
          Summary not available for this module.
        </Text>
      </View>
    );
  }

  const Icon = theme.Icon;
  const accent = theme.iconColor;
  const softBg = theme.backgroundColor;
  const headerArt = MODULE_HEADER_BACKGROUNDS[slug];
  const isSleep = slug === "sleep";
  const lightOnArt = isDark || isSleep;
  const overlayScrim = isSleep
    ? undefined
    : isDark
      ? MODULE_CARD_DARK_SCRIMS[slug]
      : MODULE_CARD_BRIGHTEN_SCRIMS[slug];

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: isDark ? "#1A1A2E" : softBg,
          },
        ]}
      >
        <ScreenBackButton color={isDark ? "#ECEDEE" : "#1E2430"} />
        <Text
          pointerEvents="none"
          style={[styles.headerTitle, isDark && styles.textDark]}
          numberOfLines={1}
        >
          Module summary
        </Text>
        <View pointerEvents="none" style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            {
              backgroundColor: isDark ? "#1E1E32" : softBg,
            },
          ]}
        >
          {headerArt ? (
            <ImageBackground
              source={headerArt}
              style={StyleSheet.absoluteFillObject}
              imageStyle={styles.heroArtImage}
              resizeMode="cover"
            />
          ) : null}
          {overlayScrim ? (
            <LinearGradient
              colors={[overlayScrim[0], overlayScrim[1]]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[StyleSheet.absoluteFillObject, styles.heroArtImage]}
              pointerEvents="none"
            />
          ) : null}
          <View style={styles.heroTop}>
            <View
              style={[
                styles.heroIconWrap,
                { backgroundColor: isDark ? "#2A2A3E" : "#FFFFFF" },
              ]}
            >
              <View pointerEvents="none">
                <Icon size={28} color={accent} strokeWidth={2.4} />
              </View>
            </View>
            <View style={styles.heroCopy}>
              <Text
                style={[
                  styles.heroEyebrow,
                  { color: lightOnArt ? "#FFFFFF" : accent },
                ]}
              >
                MODULE {workbook.moduleNumber}
              </Text>
              <Text
                style={[
                  styles.heroTitle,
                  lightOnArt ? styles.textOnArt : null,
                  !lightOnArt && isDark ? styles.textDark : null,
                ]}
                numberOfLines={3}
              >
                {workbook.title}
              </Text>
            </View>
          </View>
          <View style={styles.heroChipRow}>
            <View
              style={[
                styles.heroChip,
                {
                  backgroundColor: lightOnArt
                    ? "rgba(255,255,255,0.18)"
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.75)",
                },
              ]}
            >
              <View pointerEvents="none">
                <Sparkles
                  size={14}
                  color={lightOnArt ? "#FFFFFF" : accent}
                  strokeWidth={2.4}
                />
              </View>
              <Text
                style={[
                  styles.heroChipText,
                  { color: lightOnArt ? "#FFFFFF" : accent },
                ]}
              >
                {sections.length} key ideas
              </Text>
            </View>
          </View>
        </View>

        {sections.map((section, index) => {
          const paragraphs = splitParagraphs(section.body);
          return (
            <View
              key={`${slug}-${index}`}
              style={[
                styles.ideaCard,
                isDark && styles.ideaCardDark,
                { borderLeftColor: accent },
              ]}
            >
              <View style={styles.ideaHeader}>
                <View
                  style={[
                    styles.ideaIndex,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.08)"
                        : softBg,
                    },
                  ]}
                >
                  <Text style={[styles.ideaIndexText, { color: accent }]}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
                <Text
                  style={[styles.ideaHeading, isDark && styles.textDark]}
                >
                  {section.heading}
                </Text>
              </View>
              {paragraphs.map((paragraph, pIndex) => (
                <Text
                  key={`p-${pIndex}`}
                  style={[
                    styles.ideaBody,
                    isDark && styles.ideaBodyDark,
                    pIndex > 0 && styles.ideaBodySpaced,
                  ]}
                >
                  {paragraph}
                </Text>
              ))}
              {section.link ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.ideaLink,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                  onPress={() => router.push(section.link!.route as never)}
                  accessibilityRole="link"
                  accessibilityLabel={section.link.label}
                >
                  <Text style={[styles.ideaLinkText, { color: MAIN_PURPLE }]}>
                    {section.link.label}
                  </Text>
                  <View pointerEvents="none">
                    <ChevronRight size={16} color={MAIN_PURPLE} />
                  </View>
                </Pressable>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6FA",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    color: "#1E2430",
  },
  headerSpacer: {
    width: SCREEN_BACK_BUTTON_WIDTH,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
  },
  missingText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 15,
    fontFamily: AppFonts.bodyRegular,
    color: "#6B7280",
    paddingHorizontal: 24,
  },
  textDark: {
    color: "#ECEDEE",
  },
  mutedDark: {
    color: "#A1A1B5",
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 4,
    overflow: "hidden",
  },
  heroArtImage: {
    borderRadius: 24,
  },
  textOnArt: {
    color: "#FFFFFF",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroEyebrow: {
    fontSize: 11,
    fontFamily: AppFonts.bodyBold,
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: AppFonts.headingBold,
    color: "#1E2430",
  },
  heroChipRow: {
    marginTop: 16,
    flexDirection: "row",
  },
  heroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  heroChipText: {
    fontSize: 13,
    fontFamily: AppFonts.bodyMedium,
  },
  ideaCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderLeftWidth: 4,
    shadowColor: "#2C1850",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  ideaCardDark: {
    backgroundColor: "#1E1E32",
  },
  ideaHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  ideaIndex: {
    minWidth: 36,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  ideaIndexText: {
    fontSize: 12,
    fontFamily: AppFonts.headingBold,
    letterSpacing: 0.4,
  },
  ideaHeading: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontFamily: AppFonts.headingSemiBold,
    color: "#1E2430",
    paddingTop: 2,
  },
  ideaBody: {
    fontSize: 15,
    lineHeight: 24,
    fontFamily: AppFonts.bodyRegular,
    color: "#1F2937",
  },
  ideaBodyDark: {
    color: "#E5E7EB",
  },
  ideaBodySpaced: {
    marginTop: 12,
  },
  ideaLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 14,
    alignSelf: "flex-start",
  },
  ideaLinkText: {
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    textDecorationLine: "underline",
  },
});
