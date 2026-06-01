import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { ExternalLink } from "@/components/external-link";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { getPastelAccent, pastelBoxStyle } from "@/constants/pastel-accents";
import { useTheme } from "@/context/theme-context";
import {
  getExampleIntro,
  getGuideGenderContent,
  WEIGHT_LIFTING_GUIDE_BOTTOM_LINE,
  WEIGHT_LIFTING_GUIDE_INTRO,
  WEIGHT_LIFTING_GUIDE_LEVELS,
  WEIGHT_LIFTING_GUIDE_REP_NOTE,
  WEIGHT_LIFTING_GUIDE_SOURCE_URL,
  type GuideGenderSection,
  type WeightUnit,
} from "@/data/weight-lifting-goals-guide";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WeightLiftingGoalsGuideScreen() {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const noteAccent = getPastelAccent("yellow", isDark);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <ScreenBackButton color={isDark ? "#ECEDEE" : "#2C3E50"} />
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>
          Weight Lifting Goals
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isDark && styles.textDark]}>
          What Are Some Realistic Weight Lifting Goals To Aim For?
        </Text>

        {WEIGHT_LIFTING_GUIDE_INTRO.map((paragraph) => (
          <Text
            key={paragraph}
            style={[styles.paragraph, isDark && styles.subtextDark]}
          >
            {paragraph}
          </Text>
        ))}

        <Text
          style={[
            styles.note,
            {
              backgroundColor: noteAccent.background,
              borderColor: noteAccent.border,
              color: noteAccent.text,
            },
          ]}
        >
          {WEIGHT_LIFTING_GUIDE_REP_NOTE}
        </Text>

        <UnitToggle unit={unit} isDark={isDark} onChange={setUnit} />

        <Text style={[styles.unitHint, isDark && styles.subtextDark]}>
          {unit === "kg"
            ? "Showing example weights in kilograms (kg)."
            : "Showing example weights in pounds (lbs)."}
        </Text>

        {WEIGHT_LIFTING_GUIDE_LEVELS.map((level) => (
          <View key={level.id}>
            <GenderSection section={level.male} unit={unit} isDark={isDark} />
            <GenderSection section={level.female} unit={unit} isDark={isDark} />
          </View>
        ))}

        <View
          style={[styles.section, styles.sectionBase, pastelBoxStyle("peach", isDark)]}
        >
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            The Bottom Line On Weight Lifting Goals
          </Text>
          {WEIGHT_LIFTING_GUIDE_BOTTOM_LINE.map((paragraph) => (
            <Text
              key={paragraph}
              style={[styles.paragraph, isDark && styles.subtextDark]}
            >
              {paragraph}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function UnitToggle({
  unit,
  isDark,
  onChange,
}: {
  unit: WeightUnit;
  isDark: boolean;
  onChange: (unit: WeightUnit) => void;
}) {
  return (
    <View
      style={[
        styles.toggleRow,
        isDark ? styles.toggleRowDark : styles.toggleRowLight,
      ]}
    >
      {(["kg", "lb"] as const).map((option) => {
        const selected = unit === option;
        return (
          <Pressable
            key={option}
            style={[
              styles.toggleButton,
              selected &&
                (isDark ? styles.toggleButtonSelectedDark : styles.toggleButtonSelected),
            ]}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={
              option === "kg" ? "Show kilograms" : "Show pounds"
            }
          >
            <Text
              style={[
                styles.toggleText,
                selected && styles.toggleTextSelected,
                isDark && !selected && styles.toggleTextDark,
              ]}
            >
              {option === "kg" ? "KG" : "Pounds"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function GenderSection({
  section,
  unit,
  isDark,
}: {
  section: GuideGenderSection;
  unit: WeightUnit;
  isDark: boolean;
}) {
  const content = getGuideGenderContent(section, unit);

  return (
    <View
      style={[styles.section, styles.sectionBase, pastelBoxStyle("blue", isDark)]}
    >
      <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
        {content.title}
      </Text>
      <Text style={[styles.paragraph, isDark && styles.subtextDark]}>
        {content.intro}
      </Text>

      {content.liftLines.map((line) => (
        <View key={line} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, isDark && styles.subtextDark]}>•</Text>
          <Text style={[styles.bulletText, isDark && styles.subtextDark]}>
            {line}
          </Text>
        </View>
      ))}

      <Text style={[styles.exampleIntro, isDark && styles.subtextDark]}>
        {getExampleIntro(content.example)}
      </Text>

      {content.example.bullets.map((bullet) => (
        <View key={bullet} style={styles.bulletRow}>
          <Text style={[styles.bulletDot, isDark && styles.subtextDark]}>•</Text>
          <Text style={[styles.bulletText, isDark && styles.subtextDark]}>
            {bullet}
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
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
  },
  toggleRowLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  toggleRowDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A3D55",
  },
  toggleButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleButtonSelected: {
    backgroundColor: MAIN_PURPLE,
  },
  toggleButtonSelectedDark: {
    backgroundColor: MAIN_PURPLE,
  },
  toggleText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: "#6B7280",
  },
  toggleTextDark: {
    color: "#AEB3C4",
  },
  toggleTextSelected: {
    color: "#FFFFFF",
  },
  unitHint: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    marginBottom: 16,
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
    marginBottom: 10,
  },
  paragraph: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
    marginBottom: 12,
  },
  note: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
  },
  exampleIntro: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    lineHeight: 21,
    color: "#4B5563",
    marginBottom: 8,
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
  sourceLink: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: MAIN_PURPLE,
    textDecorationLine: "underline",
    marginTop: 4,
  },
  sourceLinkDark: {
    color: "#B7A8E0",
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
});
