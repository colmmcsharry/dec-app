import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { WeightUnitToggle } from "@/components/weight-unit-toggle";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { getPastelAccent, pastelBoxStyle, type PastelAccentVariant } from "@/constants/pastel-accents";
import { useTheme } from "@/context/theme-context";
import {
  BASIC_BEGINNER_CARDIO,
  BASIC_BEGINNER_FAQ,
  getBasicBeginnerFaqAnswer,
  BASIC_BEGINNER_HOW_LONG,
  BASIC_BEGINNER_INTRO,
  BASIC_BEGINNER_LIFTS,
  BASIC_BEGINNER_PDF_KEY,
  getBasicBeginnerProgression,
  BASIC_BEGINNER_SCHEDULE,
  BASIC_BEGINNER_TIPS,
  BASIC_BEGINNER_WHO_FOR,
  getBasicBeginnerWorkingWeightsHint,
  BASIC_BEGINNER_WORKOUT_A,
  BASIC_BEGINNER_WORKOUT_B,
  EMPTY_BASIC_BEGINNER_WEIGHTS,
  type BasicBeginnerWeights,
} from "@/data/basic-beginner-program";
import {
  convertWeightsRecord,
  weightUnitHint,
  weightUnitShortLabel,
  type WeightUnit,
} from "@/lib/weight-unit";
import {
  getBasicBeginnerLog,
  saveBasicBeginnerLog,
} from "@/services/basic-beginner-log";
import { requirePro } from "@/services/purchases";
import { useRouter } from "expo-router";
import { FileText } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BasicBeginnerGuideScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [weights, setWeights] = useState<BasicBeginnerWeights | null>(null);
  const [unit, setUnit] = useState<WeightUnit>("kg");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void getBasicBeginnerLog().then((log) => {
      setUnit(log.unit);
      setWeights(log.weights);
    });
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const persistLog = useCallback(
    (nextUnit: WeightUnit, nextWeights: BasicBeginnerWeights) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveBasicBeginnerLog({ unit: nextUnit, weights: nextWeights });
      }, 400);
    },
    []
  );

  const changeUnit = (nextUnit: WeightUnit) => {
    if (nextUnit === unit) return;
    const previousUnit = unit;
    setUnit(nextUnit);
    setWeights((prev) => {
      const base = prev ?? { ...EMPTY_BASIC_BEGINNER_WEIGHTS };
      const converted = convertWeightsRecord(base, previousUnit, nextUnit);
      persistLog(nextUnit, converted);
      return converted;
    });
  };

  const updateWeight = (key: keyof BasicBeginnerWeights, value: string) => {
    setWeights((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      persistLog(unit, next);
      return next;
    });
  };

  const openPdf = async () => {
    if (!(await requirePro())) return;
    router.push({
      pathname: "/pdf-viewer",
      params: {
        pdfKey: BASIC_BEGINNER_PDF_KEY,
        title: BASIC_BEGINNER_INTRO.title,
      },
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
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>
          Beginner Guide
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[styles.levelBadge, pastelBoxStyle("green", isDark)]}
          >
            <Text
              style={[
                styles.levelBadgeText,
                { color: getPastelAccent("green", isDark).accent },
              ]}
            >
              Beginner
            </Text>
          </View>

          <Text style={[styles.title, isDark && styles.textDark]}>
            {BASIC_BEGINNER_INTRO.title}
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtextDark]}>
            {BASIC_BEGINNER_INTRO.subtitle}
          </Text>
          <Text style={[styles.body, isDark && styles.subtextDark]}>
            {BASIC_BEGINNER_INTRO.summary}
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.pdfButton,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => void openPdf()}
            accessibilityRole="button"
            accessibilityLabel="Open full training guide PDF"
          >
            <FileText size={20} color="#FFFFFF" />
            <Text style={styles.pdfButtonText}>Open Training Guide PDF</Text>
          </Pressable>

          <WeightUnitToggle unit={unit} isDark={isDark} onChange={changeUnit} />
          <Text style={[styles.unitHint, isDark && styles.subtextDark]}>
            {weightUnitHint(unit)}
          </Text>

          <Section title="Who Is This For?" isDark={isDark}>
            {BASIC_BEGINNER_WHO_FOR.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="How Long Should I Run It?" isDark={isDark}>
            {BASIC_BEGINNER_HOW_LONG.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Workout A" isDark={isDark}>
            {BASIC_BEGINNER_WORKOUT_A.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Workout B" isDark={isDark}>
            {BASIC_BEGINNER_WORKOUT_B.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Schedule" isDark={isDark}>
            {BASIC_BEGINNER_SCHEDULE.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Your Working Weights" isDark={isDark}>
            <Text style={[styles.hint, isDark && styles.subtextDark]}>
              {getBasicBeginnerWorkingWeightsHint(unit)}
            </Text>
            {weights === null ? (
              <ActivityIndicator color={MAIN_PURPLE} style={styles.loader} />
            ) : (
              BASIC_BEGINNER_LIFTS.map((lift) => (
                <View key={lift.id} style={styles.liftRow}>
                  <View style={styles.liftLabelWrap}>
                    <Text style={[styles.liftName, isDark && styles.textDark]}>
                      {lift.name}
                    </Text>
                    <Text
                      style={[styles.liftMeta, isDark && styles.subtextDark]}
                    >
                      Workout {lift.workout} · {lift.setsReps} ·{" "}
                      {lift.progression[unit]}
                    </Text>
                  </View>
                  <View style={styles.weightInputWrap}>
                    <TextInput
                      style={[
                        styles.weightInput,
                        isDark && styles.weightInputDark,
                      ]}
                      value={weights[lift.id]}
                      onChangeText={(value) => updateWeight(lift.id, value)}
                      placeholder="0"
                      placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      accessibilityLabel={`${lift.name} weight in ${weightUnitShortLabel(unit)}`}
                    />
                    <Text
                      style={[styles.weightUnitLabel, isDark && styles.subtextDark]}
                    >
                      {weightUnitShortLabel(unit)}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Section>

          <Section title="Progression" isDark={isDark}>
            {getBasicBeginnerProgression(unit).map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Cardio & Conditioning" isDark={isDark}>
            {BASIC_BEGINNER_CARDIO.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Common Questions" isDark={isDark}>
            {BASIC_BEGINNER_FAQ.map((item) => (
              <View key={item.question} style={styles.faqRow}>
                <Text style={[styles.faqQuestion, isDark && styles.textDark]}>
                  {item.question}
                </Text>
                <Text style={[styles.faqAnswer, isDark && styles.subtextDark]}>
                  {getBasicBeginnerFaqAnswer(item, unit)}
                </Text>
              </View>
            ))}
          </Section>

          <Section title="Tips" isDark={isDark} variant="green">
            {BASIC_BEGINNER_TIPS.map((tip) => (
              <Bullet key={tip} text={tip} isDark={isDark} />
            ))}
          </Section>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Section({
  title,
  isDark,
  variant = "blue",
  children,
}: {
  title: string;
  isDark: boolean;
  variant?: PastelAccentVariant;
  children: ReactNode;
}) {
  return (
    <View style={[styles.section, pastelBoxStyle(variant, isDark)]}>
      <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Bullet({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletDot, isDark && styles.subtextDark]}>•</Text>
      <Text style={[styles.bulletText, isDark && styles.subtextDark]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  levelBadge: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  levelBadgeText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
    marginBottom: 16,
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: MAIN_PURPLE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pdfButtonText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
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
  sectionTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    color: "#1E2430",
    marginBottom: 10,
  },
  hint: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    marginBottom: 12,
  },
  loader: {
    marginVertical: 12,
  },
  liftRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  liftLabelWrap: {
    flex: 1,
  },
  liftName: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: "#1E2430",
  },
  liftMeta: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  weightInputWrap: {
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },
  weightInput: {
    width: 88,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontFamily: AppFonts.bodyMedium,
    fontSize: 16,
    color: "#1E2430",
    textAlign: "center",
    backgroundColor: "#F9FAFB",
  },
  weightInputDark: {
    borderColor: "#4B5563",
    backgroundColor: "#252540",
    color: "#ECEDEE",
  },
  weightUnitLabel: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 11,
    color: "#6B7280",
    textTransform: "uppercase",
  },
  faqRow: {
    marginBottom: 12,
  },
  faqQuestion: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: "#1E2430",
    marginBottom: 4,
  },
  faqAnswer: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
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
});
