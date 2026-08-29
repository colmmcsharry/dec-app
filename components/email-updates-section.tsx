import type { MarketingEmailSource } from "@/constants/marketing-email";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  getMarketingEmailPrefs,
  isValidMarketingEmail,
  subscribeMarketingEmail,
  unsubscribeMarketingEmail,
} from "@/services/marketing-email";
import { useFocusEffect } from "expo-router/react-navigation";
import { Mail } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";

type EmailUpdatesSectionProps = {
  source: MarketingEmailSource;
  /** Onboarding slide uses a simpler layout without the outer card chrome. */
  variant?: "card" | "slide";
  /**
   * Home / welcome: hide the whole block once subscribed (About keeps unsubscribe).
   * Prefs stay shared so surfaces stay in sync.
   */
  hideWhenSubscribed?: boolean;
  /** Override the default card title. */
  title?: string;
  /** Override the default supporting line. Pass `null` to hide. */
  body?: string | null;
  /** Hide the small “Email updates” eyebrow row. */
  hideEyebrow?: boolean;
};

export function EmailUpdatesSection({
  source,
  variant = "card",
  hideWhenSubscribed = false,
  title,
  body,
  hideEyebrow = false,
}: EmailUpdatesSectionProps) {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");
  const [optedIn, setOptedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** Keep success UI visible after subscribe on hideWhenSubscribed surfaces. */
  const [justSubscribed, setJustSubscribed] = useState(false);

  const refresh = useCallback(async () => {
    const prefs = await getMarketingEmailPrefs();
    setEmail(prefs.email ?? "");
    setOptedIn(prefs.optedIn);
    setLoading(false);
  }, []);

  // Re-read on focus so Home hides/shows after About subscribe/unsubscribe.
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleSubscribe = async () => {
    // Dismiss first so the keyboard doesn't steal this press / the next one.
    Keyboard.dismiss();
    setError(null);
    if (!isValidMarketingEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    const result = await subscribeMarketingEmail(email, source);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setOptedIn(true);
    setJustSubscribed(true);
  };

  const handleUnsubscribe = () => {
    Alert.alert(
      "Unsubscribe from emails?",
      "You will stop receiving updates from Declan. You can re-subscribe here anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unsubscribe",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setSubmitting(true);
              const result = await unsubscribeMarketingEmail(email);
              setSubmitting(false);
              if (!result.ok) {
                setError(result.error);
                return;
              }
              setOptedIn(false);
            })();
          },
        },
      ],
    );
  };

  const isSlide = variant === "slide";

  // Already subscribed from a previous visit — hide. After a fresh subscribe
  // on this screen, keep the success state visible for feedback.
  if (hideWhenSubscribed && (loading || (optedIn && !justSubscribed))) {
    return null;
  }

  if (loading) {
    return (
      <View
        style={[isSlide ? styles.slideWrap : styles.card, styles.loadingWrap]}
      >
        <ActivityIndicator color={MAIN_PURPLE} />
      </View>
    );
  }

  const resolvedTitle =
    title ?? (isSlide ? "Stay in the loop" : "Get updates from Declan");
  const resolvedBody =
    body === null
      ? null
      : (body ??
        (isSlide
          ? "Optional — tips, new content, live workouts, and occasional offers."
          : "Regular tips, new content, and offers."));

  const content = (
    <>
      {!isSlide && !hideEyebrow ? (
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, isDark && styles.iconWrapDark]}>
            <Mail size={20} color={MAIN_PURPLE} strokeWidth={2.2} />
          </View>
          <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>
            Email updates
          </Text>
        </View>
      ) : null}

      {optedIn && hideWhenSubscribed ? (
        <View style={[styles.successBox, isDark && styles.successBoxDark]}>
          <Text style={[styles.successTitle, isDark && styles.successTextDark]}>
            You’re subscribed — thank you!
          </Text>
          <Text style={[styles.successText, isDark && styles.successTextDark]}>
            We’ll be in touch at {email}.
          </Text>
        </View>
      ) : (
        <>
          <Text
            style={[
              isSlide ? styles.slideTitle : styles.title,
              isDark && styles.titleDark,
            ]}
          >
            {resolvedTitle}
          </Text>
          {resolvedBody ? (
            <Text style={[styles.body, isDark && styles.bodyDark]}>
              {resolvedBody}
            </Text>
          ) : null}
        </>
      )}

      {optedIn && !hideWhenSubscribed ? (
        <View style={[styles.successBox, isDark && styles.successBoxDark]}>
          <Text style={[styles.successText, isDark && styles.successTextDark]}>
            ✓ Subscribed as {email}
          </Text>
          <Pressable
            onPress={handleUnsubscribe}
            disabled={submitting}
            accessibilityRole="button"
            accessibilityLabel="Unsubscribe from email updates"
          >
            <Text style={styles.unsubscribeLink}>
              {submitting ? "Updating…" : "Unsubscribe"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {!optedIn ? (
        <>
          <TextInput
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) setError(null);
            }}
            placeholder="Email address"
            placeholderTextColor={isDark ? "#7A7A94" : "#9CA3AF"}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="done"
            blurOnSubmit
            onSubmitEditing={() => void handleSubscribe()}
            editable={!submitting}
            style={[
              styles.input,
              isDark && styles.inputDark,
              error ? styles.inputError : null,
            ]}
            accessibilityLabel="Email address"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <RectButton
            onPress={() => void handleSubscribe()}
            enabled={!submitting}
            style={[
              styles.subscribeButton,
              submitting ? styles.subscribeButtonDisabled : null,
            ]}
            underlayColor="rgba(0,0,0,0.15)"
            accessibilityRole="button"
            accessibilityLabel="Subscribe to email updates"
          >
            <View pointerEvents="none" style={styles.subscribeButtonInner}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              )}
            </View>
          </RectButton>
        </>
      ) : null}
    </>
  );

  if (isSlide) {
    return (
      <View style={styles.slideWrap}>
        <View style={styles.slideContent}>{content}</View>
      </View>
    );
  }

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>{content}</View>
  );
}

const styles = StyleSheet.create({
  slideWrap: {
    width: "100%",
    flex: 1,
  },
  slideContent: {
    flex: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },
  slideTitle: {
    fontFamily: AppFonts.headingBold,
    fontSize: 28,
    lineHeight: 34,
    color: "#1F2937",
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EDE8F5",
  },
  cardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#2A2D3E",
  },
  loadingWrap: {
    minHeight: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapDark: {
    backgroundColor: "#2A2540",
  },
  eyebrow: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "#6B7280",
  },
  eyebrowDark: {
    color: "#9090A8",
  },
  title: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 20,
    color: "#1F2937",
    marginBottom: 6,
  },
  titleDark: {
    color: "#ECEDEE",
  },
  body: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 14,
  },
  bodyDark: {
    color: "#9090A8",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: AppFonts.bodyRegular,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  inputDark: {
    borderColor: "#3A3A52",
    backgroundColor: "#121222",
    color: "#ECEDEE",
  },
  inputError: {
    borderColor: "#DC2626",
  },
  errorText: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    color: "#DC2626",
    marginBottom: 8,
  },
  subscribeButton: {
    backgroundColor: MAIN_PURPLE,
    borderRadius: 12,
    minHeight: 48,
    overflow: "hidden",
  },
  subscribeButtonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonInner: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  subscribeButtonText: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 16,
    color: "#FFFFFF",
  },
  successBox: {
    backgroundColor: "#E6F5F0",
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  successBoxDark: {
    backgroundColor: "#1A2E28",
  },
  successTitle: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 16,
    color: "#1F2937",
  },
  successText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: "#1F2937",
  },
  successTextDark: {
    color: "#ECEDEE",
  },
  unsubscribeLink: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: MAIN_PURPLE,
    textDecorationLine: "underline",
  },
});
