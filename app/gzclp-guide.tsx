import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { ExternalLink } from "@/components/external-link";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  GZCLP_INTRO,
  GZCLP_LIFTS,
  GZCLP_PDF_KEY,
  GZCLP_POPULAR_NOTE,
  GZCLP_DETAILED_GUIDE_URL,
  GZCLP_STARTER_TIPS,
  GZCLP_TIER_GUIDE,
  GZCLP_WEEKLY_SCHEDULE,
  GZCLP_WORKOUTS,
  type GzclpWeights,
} from "@/data/gzclp-program";
import { getGzclpWeights, saveGzclpWeights } from "@/services/gzclp-log";
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

export default function GzclpGuideScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [weights, setWeights] = useState<GzclpWeights | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    void getGzclpWeights().then(setWeights);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const persistWeights = useCallback((next: GzclpWeights) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveGzclpWeights(next);
    }, 400);
  }, []);

  const updateWeight = (key: keyof GzclpWeights, value: string) => {
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
        pdfKey: GZCLP_PDF_KEY,
        title: GZCLP_INTRO.title,
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
          Intermediate Guide
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
            <Text style={styles.levelBadgeText}>Intermediate</Text>
          </View>

          <Text style={[styles.title, isDark && styles.textDark]}>
            {GZCLP_INTRO.title}
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtextDark]}>
            {GZCLP_INTRO.subtitle}
          </Text>
          <Text style={[styles.body, isDark && styles.subtextDark]}>
            {GZCLP_INTRO.summary}
          </Text>

          <Text style={[styles.popularNote, isDark && styles.subtextDark]}>
            {GZCLP_POPULAR_NOTE}
          </Text>

          <ExternalLink href={GZCLP_DETAILED_GUIDE_URL}>
            <Text style={[styles.externalLink, isDark && styles.externalLinkDark]}>
              Read the full GZCLP guide on The Fitness Wiki →
            </Text>
          </ExternalLink>

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

          <Section title="How the Tiers Work" isDark={isDark}>
            {GZCLP_TIER_GUIDE.map((line) => (
              <Bullet key={line} text={line} isDark={isDark} />
            ))}
          </Section>

          {GZCLP_WORKOUTS.map((workout) => (
            <Section key={workout.id} title={workout.label} isDark={isDark}>
              {workout.exercises.map((exercise) => (
                <Bullet
                  key={`${workout.id}-${exercise.liftId}-${exercise.tier}`}
                  text={`${exercise.tier}: ${exercise.name} — ${exercise.setsReps}`}
                  isDark={isDark}
                />
              ))}
            </Section>
          ))}

          <Section title="Weekly Schedule" isDark={isDark}>
            {GZCLP_WEEKLY_SCHEDULE.map((line) => (
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
              GZCLP_LIFTS.map((lift) => (
                <View key={lift.id} style={styles.liftRow}>
                  <View style={styles.liftLabelWrap}>
                    <Text style={[styles.liftName, isDark && styles.textDark]}>
                      {lift.name}
                    </Text>
                    <Text
                      style={[styles.liftMeta, isDark && styles.subtextDark]}
                    >
                      {lift.roles}
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

          <Section title="Progression Rules" isDark={isDark}>
            {GZCLP_LIFTS.map((lift) => (
              <View key={lift.id} style={styles.ruleRow}>
                <Text style={[styles.ruleName, isDark && styles.textDark]}>
                  {lift.name}
                </Text>
                <Text style={[styles.ruleText, isDark && styles.subtextDark]}>
                  {lift.progression}
                </Text>
              </View>
            ))}
          </Section>

          <Section title="Starter Tips" isDark={isDark}>
            {GZCLP_STARTER_TIPS.map((tip) => (
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
    backgroundColor: "#F3F0FA",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EADBF7",
  },
  levelBadgeDark: {
    backgroundColor: "#252540",
    borderColor: "#3A2E5C",
  },
  levelBadgeText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 11,
    color: MAIN_PURPLE,
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
    marginBottom: 12,
  },
  popularNote: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
    marginBottom: 10,
  },
  externalLink: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: MAIN_PURPLE,
    marginBottom: 26,
    textDecorationLine: "underline",
  },
  externalLinkDark: {
    color: "#B7A8E0",
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
    marginTop: 20,
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
  ruleRow: {
    marginBottom: 10,
  },
  ruleName: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: "#1E2430",
  },
  ruleText: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    marginTop: 2,
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
