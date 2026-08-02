import { CelebrationBadge } from "@/components/celebration-badge";
import { EmailUpdatesSection } from "@/components/email-updates-section";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  getMarketingEmailPrefs,
  markMarketingEmailPremiumThankYou,
} from "@/services/marketing-email";
import { useRouter } from "expo-router";
import { Calendar, Sparkles, Target } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TEXT_PRIMARY = "#1F2A3A";
const TEXT_SECONDARY = "#3B4B5E";

interface TipItem {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  title: string;
  body: string;
  iconBg: string;
  iconColor: string;
}

const TIPS: TipItem[] = [
  {
    icon: Calendar,
    title: "One module per week",
    body:
      "Each module is designed to be absorbed over seven days, not seven minutes. Don't rush — the magic is in the practice.",
    iconBg: "#EADBF7",
    iconColor: "#7187CE",
  },
  {
    icon: Target,
    title: "Implement step by step",
    body:
      "Pick one habit, action, or insight per video and try it the same day. Small consistent reps beat big bursts every time.",
    iconBg: "#D4F1E8",
    iconColor: "#3F8E76",
  },
  {
    icon: Sparkles,
    title: "Use the workbooks",
    body:
      "Every module has a digital workbook with prompts, plans, and reflections. They're where insight turns into change.",
    iconBg: "#FFF3DC",
    iconColor: "#C99100",
  },
];

/**
 * Post-purchase welcome screen. Reached only after the RevenueCat paywall
 * reports a successful purchase or restore. Plays the same celebration
 * badge animation as the module-completion modal, then walks the new
 * subscriber through a few "how to get the most out of the app" tips.
 */
export default function WelcomeScreen() {
  const router = useRouter();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const [emailReady, setEmailReady] = useState(false);

  const cardAnim = useRef(new Animated.Value(0)).current;
  const tipAnims = useRef(TIPS.map(() => new Animated.Value(0))).current;
  const ctaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const prefs = await getMarketingEmailPrefs();
      if (cancelled) return;

      if (prefs.optedIn && prefs.email) {
        setExistingEmail(prefs.email);
        // Silent Kit mark for thank-you automation (does not change signup_source).
        void markMarketingEmailPremiumThankYou();
      }
      setEmailReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      friction: 7,
      tension: 80,
      useNativeDriver: true,
    }).start();

    Animated.stagger(
      120,
      tipAnims.map((a) =>
        Animated.timing(a, {
          toValue: 1,
          duration: 480,
          delay: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();

    Animated.timing(ctaAnim, {
      toValue: 1,
      duration: 360,
      delay: 1400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [cardAnim, tipAnims, ctaAnim]);

  const enterApp = () => router.replace("/(tabs)");

  return (
    <View
      style={[
        styles.root,
        isDark && styles.rootDark,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.bgBlobOne} pointerEvents="none" />
      <View style={styles.bgBlobTwo} pointerEvents="none" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroCard,
            isDark && styles.heroCardDark,
            {
              opacity: cardAnim,
              transform: [
                {
                  scale: cardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.badgeWrap}>
            <CelebrationBadge active accentColor={MAIN_PURPLE} />
          </View>
          <Text style={[styles.title, isDark && styles.textDark]}>
            Welcome aboard!
          </Text>
          <Text style={styles.subtitle}>
            Your Peak Performance Code journey starts now
          </Text>
          <Text style={[styles.body, isDark && styles.bodyDark]}>
            You&apos;ve unlocked all 10 modules, every video, and the full
            set of digital workbooks.
          </Text>
        </Animated.View>

        {emailReady && existingEmail ? (
          <View style={[styles.existingEmailCard, isDark && styles.existingEmailCardDark]}>
            <Text
              style={[styles.existingEmailTitle, isDark && styles.textDark]}
            >
              You’re on the list — thank you!
            </Text>
            <Text
              style={[styles.existingEmailBody, isDark && styles.bodyDark]}
            >
              We’ll send a thank-you note to {existingEmail}.
            </Text>
          </View>
        ) : null}

        {emailReady && !existingEmail ? (
          <EmailUpdatesSection
            source="welcome"
            hideWhenSubscribed
            hideEyebrow
            title="We'd like to send you a thank you e-mail!"
            body="Optional — leave your email and we’ll send a thank-you note plus occasional updates."
          />
        ) : null}

        <Text style={[styles.sectionLabel, isDark && styles.sectionLabelDark]}>
          A few tips before you dive in
        </Text>

        <View style={styles.tipsList}>
          {TIPS.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <Animated.View
                key={tip.title}
                style={[
                  styles.tipCard,
                  isDark && styles.tipCardDark,
                  {
                    opacity: tipAnims[i],
                    transform: [
                      {
                        translateY: tipAnims[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: [16, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={[styles.tipIcon, { backgroundColor: tip.iconBg }]}>
                  <Icon size={22} color={tip.iconColor} strokeWidth={2.4} />
                </View>
                <View style={styles.tipText}>
                  <Text style={[styles.tipTitle, isDark && styles.textDark]}>
                    {tip.title}
                  </Text>
                  <Text style={[styles.tipBody, isDark && styles.bodyDark]}>
                    {tip.body}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>

      <Animated.View
        style={[
          styles.ctaWrap,
          {
            opacity: ctaAnim,
            transform: [
              {
                translateY: ctaAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.ctaButton,
            { opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={enterApp}
          accessibilityRole="button"
          accessibilityLabel="Let's go"
        >
          <Text style={styles.ctaText}>Let&apos;s go</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4EEFF",
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  rootDark: {
    backgroundColor: "#11121B",
  },
  bgBlobOne: {
    position: "absolute",
    top: -120,
    right: -90,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: "#D4F1E8",
    opacity: 0.55,
  },
  bgBlobTwo: {
    position: "absolute",
    bottom: -140,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: "#FFDDD9",
    opacity: 0.45,
  },
  scroll: {
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingTop: 32,
    paddingBottom: 26,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#EADBF7",
    shadowColor: MAIN_PURPLE,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 8,
    marginBottom: 28,
  },
  heroCardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A2E5C",
    shadowOpacity: 0.5,
  },
  badgeWrap: {
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontFamily: AppFonts.headingBold,
    color: TEXT_PRIMARY,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: AppFonts.bodyBold,
    color: MAIN_PURPLE,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontFamily: AppFonts.bodyMedium,
    color: TEXT_SECONDARY,
    textAlign: "center",
  },
  bodyDark: {
    color: "#D8DAE6",
  },
  existingEmailCard: {
    backgroundColor: "#E6F5F0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#C5E8DA",
    gap: 6,
  },
  existingEmailCardDark: {
    backgroundColor: "#1A2E28",
    borderColor: "#2A4A3C",
  },
  existingEmailTitle: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 16,
    color: TEXT_PRIMARY,
  },
  existingEmailBody: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    color: TEXT_SECONDARY,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: AppFonts.bodyBold,
    color: MAIN_PURPLE,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionLabelDark: {
    color: "#B7A8E0",
  },
  tipsList: {
    gap: 12,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: "#F1ECFA",
    shadowColor: MAIN_PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  tipCardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#2E2740",
    shadowOpacity: 0.35,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  tipText: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  tipBody: {
    fontSize: 14,
    lineHeight: 21,
    fontFamily: AppFonts.bodyMedium,
    color: TEXT_SECONDARY,
  },
  textDark: {
    color: "#ECEDEE",
  },
  ctaWrap: {
    paddingTop: 16,
  },
  ctaButton: {
    backgroundColor: MAIN_PURPLE,
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: MAIN_PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
    letterSpacing: 0.4,
  },
});
