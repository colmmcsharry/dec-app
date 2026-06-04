import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { resetSubscriptionAndOnboardingForTestFlight } from "@/services/purchases";
import { isTestFlight } from "expo-testflight";
import { RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

/**
 * TestFlight-only QA controls. Hidden on App Store production builds, simulators,
 * dev builds, and Android.
 */
export function TestFlightResetSection({ isDark }: { isDark: boolean }) {
  const [busy, setBusy] = useState(false);

  if (__DEV__ || Platform.OS !== "ios" || !isTestFlight) {
    return null;
  }

  const handleReset = () => {
    if (busy) return;
    Alert.alert(
      "Reset subscription state?",
      "This clears onboarding progress and your RevenueCat customer ID on this device, then restarts the app from the first-launch screen.\n\nIt does not remove sandbox purchases tied to your Apple ID. To test as a free user, use a different sandbox account or clear sandbox purchase history in Settings → App Store → Sandbox Account.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await resetSubscriptionAndOnboardingForTestFlight();
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View
      style={[
        styles.card,
        isDark && styles.cardDark,
      ]}
    >
      <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>
        TestFlight only
      </Text>
      <Text style={[styles.title, isDark && styles.titleDark]}>
        QA tools
      </Text>
      <Text style={[styles.body, isDark && styles.bodyDark]}>
        These controls are only shown in TestFlight builds. They are not visible
        in the App Store release.
      </Text>
      <RectButton
        onPress={handleReset}
        enabled={!busy}
        style={styles.button}
        underlayColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
        accessibilityRole="button"
        accessibilityLabel="Reset subscription state for TestFlight testing"
      >
        <View pointerEvents="none" style={styles.buttonInner}>
          <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.buttonText}>
            {busy ? "Resetting…" : "Reset subscription state"}
          </Text>
        </View>
      </RectButton>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    marginBottom: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
  },
  cardDark: {
    borderColor: "#92400E",
    backgroundColor: "#292524",
  },
  eyebrow: {
    fontFamily: AppFonts.headingBold,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: "#B45309",
    marginBottom: 4,
  },
  eyebrowDark: {
    color: "#FCD34D",
  },
  title: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    color: "#78350F",
    marginBottom: 8,
  },
  titleDark: {
    color: "#FEF3C7",
  },
  body: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 19,
    color: "#92400E",
    marginBottom: 12,
  },
  bodyDark: {
    color: "#D6D3D1",
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: MAIN_PURPLE,
    minHeight: 44,
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  buttonText: {
    fontFamily: AppFonts.bodyBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});
