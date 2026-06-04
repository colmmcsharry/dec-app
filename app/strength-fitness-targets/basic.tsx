import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { StrengthTargetsTable } from "@/components/strength-targets-table";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { getPastelAccent, pastelBoxStyle } from "@/constants/pastel-accents";
import { useTheme } from "@/context/theme-context";
import {
  STRENGTH_FITNESS_INTRO,
  STRENGTH_FITNESS_DISCLAIMER,
  STRENGTH_FITNESS_LEVELS,
  STRENGTH_FITNESS_TIPS,
  type StrengthTargetLevel,
} from "@/data/strength-fitness-targets";
import { STRENGTH_STANDARDS_MORE_DETAILS_PROMPT } from "@/data/strength-standards-hub";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BasicStrengthTargetsScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const disclaimerAccent = getPastelAccent("red", isDark);

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
          Basic Targets
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
        <Text style={[styles.title, isDark && styles.textDark]}>
          {STRENGTH_FITNESS_INTRO.title}
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtextDark]}>
          {STRENGTH_FITNESS_INTRO.subtitle}
        </Text>
        <Text style={[styles.body, isDark && styles.subtextDark]}>
          {STRENGTH_FITNESS_INTRO.summary}
        </Text>

        <View
          style={[
            styles.disclaimer,
            {
              backgroundColor: disclaimerAccent.background,
              borderColor: disclaimerAccent.border,
            },
          ]}
        >
          <Text
            style={[styles.disclaimerText, { color: disclaimerAccent.text }]}
          >
            {STRENGTH_FITNESS_DISCLAIMER}
          </Text>
        </View>

        {STRENGTH_FITNESS_LEVELS.map((level) => (
          <LevelSection key={level.id} level={level} isDark={isDark} />
        ))}

        <View
          style={[
            styles.section,
            styles.sectionBase,
            pastelBoxStyle("green", isDark),
          ]}
        >
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            Tips
          </Text>
          {STRENGTH_FITNESS_TIPS.map((tip) => (
            <View key={tip} style={styles.bulletRow}>
              <Text style={[styles.bulletDot, isDark && styles.subtextDark]}>
                •
              </Text>
              <Text style={[styles.bulletText, isDark && styles.subtextDark]}>
                {tip}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.moreDetailsPrompt, isDark && styles.subtextDark]}>
          {STRENGTH_STANDARDS_MORE_DETAILS_PROMPT}
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.guideButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => router.push("/strength-fitness-targets/detailed")}
          accessibilityRole="button"
          accessibilityLabel="Open detailed strength standards guide"
        >
          <Text style={styles.guideButtonText}>
            Read Detailed Strength Standards Guide
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function LevelSection({
  level,
  isDark,
}: {
  level: StrengthTargetLevel;
  isDark: boolean;
}) {
  const noteAccent = getPastelAccent("yellow", isDark);

  return (
    <View
      style={[
        styles.section,
        styles.sectionBase,
        pastelBoxStyle("blue", isDark),
      ]}
    >
      <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
        {level.title}
      </Text>

      {level.table ? (
        <StrengthTargetsTable rows={level.table} isDark={isDark} />
      ) : null}

      {level.note ? (
        <View
          style={[
            styles.disclaimer,
            styles.levelDisclaimer,
            {
              backgroundColor: noteAccent.background,
              borderColor: noteAccent.border,
            },
          ]}
        >
          <Text style={[styles.disclaimerText, { color: noteAccent.text }]}>
            {level.note}
          </Text>
        </View>
      ) : null}

      {level.runningGoals ? (
        <GoalList
          title="Running (both genders)"
          goals={level.runningGoals}
          isDark={isDark}
        />
      ) : null}
    </View>
  );
}

function GoalList({
  title,
  goals,
  isDark,
}: {
  title: string;
  goals: string[];
  isDark: boolean;
}) {
  return (
    <View style={styles.goalList}>
      <Text style={[styles.goalListTitle, isDark && styles.textDark]}>
        {title}
      </Text>
      {goals.map((goal) => (
        <View key={goal} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, isDark && styles.subtextDark]}>•</Text>
          <Text style={[styles.bulletText, isDark && styles.subtextDark]}>
            {goal}
          </Text>
        </View>
      ))}
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
  title: {
    fontFamily: AppFonts.headingBold,
    fontSize: 22,
    lineHeight: 28,
    color: "#1E2430",
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: MAIN_PURPLE,
    marginBottom: 12,
  },
  body: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
    marginBottom: 14,
  },
  disclaimer: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  disclaimerText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  levelDisclaimer: {
    marginTop: 12,
    marginBottom: 0,
  },
  section: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  sectionBase: {
    borderWidth: 1,
  },
  sectionTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    color: "#1E2430",
    marginBottom: 12,
  },
  goalList: {
    marginTop: 12,
  },
  goalListTitle: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: MAIN_PURPLE,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  bulletDot: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
  moreDetailsPrompt: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
    marginTop: 6,
    marginBottom: 12,
    textAlign: "center",
  },
  guideButton: {
    backgroundColor: MAIN_PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  guideButtonText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: "#FFFFFF",
  },
});
