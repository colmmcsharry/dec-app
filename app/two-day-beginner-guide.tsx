import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  TWO_DAY_BEGINNER_ALTERNATIVES,
  TWO_DAY_BEGINNER_INTRO,
  TWO_DAY_BEGINNER_LIFTS,
  TWO_DAY_BEGINNER_PDF_KEY,
  TWO_DAY_BEGINNER_REPS_EXPLAINED,
  TWO_DAY_BEGINNER_SCHEDULE,
  TWO_DAY_BEGINNER_STARTING_TIPS,
  TWO_DAY_BEGINNER_SUPERSET_TIP,
  TWO_DAY_BEGINNER_TIPS,
  TWO_DAY_BEGINNER_WARMUP,
  TWO_DAY_BEGINNER_WORKOUT,
  type TwoDayBeginnerWeights,
} from "@/data/two-day-beginner-program";
import {
  getTwoDayBeginnerWeights,
  saveTwoDayBeginnerWeights,
} from "@/services/two-day-beginner-log";
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

export default function TwoDayBeginnerGuideScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [weights, setWeights] = useState<TwoDayBeginnerWeights | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void getTwoDayBeginnerWeights().then(setWeights);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const persistWeights = useCallback((next: TwoDayBeginnerWeights) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveTwoDayBeginnerWeights(next);
    }, 400);
  }, []);

  const updateWeight = (key: keyof TwoDayBeginnerWeights, value: string) => {
    setWeights((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      persistWeights(next);
      return next;
    });
  };

  const openPdf = async () => {
    if (!(await requirePro())) return;
    router.push({
      pathname: "/pdf-viewer",
      params: {
        pdfKey: TWO_DAY_BEGINNER_PDF_KEY,
        title: TWO_DAY_BEGINNER_INTRO.title,
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
          <View style={[styles.levelBadge, isDark && styles.levelBadgeDark]}>
            <Text style={styles.levelBadgeText}>Beginner</Text>
          </View>

          <Text style={[styles.title, isDark && styles.textDark]}>
            {TWO_DAY_BEGINNER_INTRO.title}
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtextDark]}>
            {TWO_DAY_BEGINNER_INTRO.subtitle}
          </Text>
          <Text style={[styles.body, isDark && styles.subtextDark]}>
            {TWO_DAY_BEGINNER_INTRO.summary}
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

          <Section title="Schedule" isDark={isDark}>
            {TWO_DAY_BEGINNER_SCHEDULE.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="The Workout" isDark={isDark}>
            <Text style={[styles.hint, isDark && styles.subtextDark]}>
              Do this full session on both gym days each week.
            </Text>
            {TWO_DAY_BEGINNER_WORKOUT.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Warm Up" isDark={isDark}>
            {TWO_DAY_BEGINNER_WARMUP.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="What Does 3 × 8–12 Mean?" isDark={isDark}>
            {TWO_DAY_BEGINNER_REPS_EXPLAINED.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Superset Option" isDark={isDark}>
            {TWO_DAY_BEGINNER_SUPERSET_TIP.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Your Working Weights" isDark={isDark}>
            <Text style={[styles.hint, isDark && styles.subtextDark]}>
              Enter the weight you used in your last session (kg or lb — pick
              one and stick with it).
            </Text>
            {weights === null ? (
              <ActivityIndicator color={MAIN_PURPLE} style={styles.loader} />
            ) : (
              TWO_DAY_BEGINNER_LIFTS.map((lift) => (
                <View key={lift.id} style={styles.liftRow}>
                  <View style={styles.liftLabelWrap}>
                    <Text style={[styles.liftName, isDark && styles.textDark]}>
                      {lift.name}
                    </Text>
                    <Text
                      style={[styles.liftMeta, isDark && styles.subtextDark]}
                    >
                      {lift.setsReps}
                    </Text>
                  </View>
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
                    accessibilityLabel={`${lift.name} weight`}
                  />
                </View>
              ))
            )}
          </Section>

          <Section title="Starting Out" isDark={isDark}>
            {TWO_DAY_BEGINNER_STARTING_TIPS.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          <Section title="Exercise Alternatives" isDark={isDark}>
            <Text style={[styles.hint, isDark && styles.subtextDark]}>
              If you can’t do a lift as written, pick one alternative and stick
              with it for several months.
            </Text>
            {TWO_DAY_BEGINNER_ALTERNATIVES.map((group) => (
              <View key={group.primary} style={styles.altRow}>
                <Text style={[styles.altPrimary, isDark && styles.textDark]}>
                  {group.primary}
                </Text>
                {group.options.map((option) => (
                  <Text
                    key={option}
                    style={[styles.altOption, isDark && styles.subtextDark]}
                  >
                    · {option}
                  </Text>
                ))}
              </View>
            ))}
          </Section>

          <Section title="Tips" isDark={isDark}>
            {TWO_DAY_BEGINNER_TIPS.map((tip) => (
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
  children,
}: {
  title: string;
  isDark: boolean;
  children: ReactNode;
}) {
  return (
    <View
      style={[styles.section, isDark ? styles.sectionDark : styles.sectionLight]}
    >
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
    backgroundColor: "#EEF6F0",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#C5DFCB",
  },
  levelBadgeDark: {
    backgroundColor: "#1A2820",
    borderColor: "#2E4A38",
  },
  levelBadgeText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 11,
    color: "#4A8A5C",
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
  section: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  sectionLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  sectionDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A3D55",
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
    alignItems: "center",
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
  altRow: {
    marginBottom: 14,
  },
  altPrimary: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: "#1E2430",
    marginBottom: 4,
  },
  altOption: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    paddingLeft: 4,
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
