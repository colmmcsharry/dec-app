import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { isTestFlightInstall } from "@/lib/is-testflight-install";
import {
  isTestFlightForceFreeActive,
  resetSubscriptionAndOnboardingForTestFlight,
  restoreRealSubscriptionStatusForTestFlight,
} from "@/services/purchases";
import { Crown, RotateCcw } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

/**
 * TestFlight-only QA controls. Hidden on App Store production builds, simulators,
 * dev builds, and Android.
 */
export function TestFlightResetSection({ isDark }: { isDark: boolean }) {
  const [busy, setBusy] = useState(false);
  const [simulatingFree, setSimulatingFree] = useState(false);

  const refreshStatus = useCallback(() => {
    void isTestFlightForceFreeActive().then(setSimulatingFree);
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  if (__DEV__ || Platform.OS !== "ios" || !isTestFlightInstall()) {
    return null;
  }

  const handleReset = () => {
    if (busy) return;
    Alert.alert(
      "Simulate free tier?",
      "This restarts the app as a Basic user so you can test onboarding and paywalls.\n\nYour sandbox subscription may still exist on this Apple ID — this uses a TestFlight-only override so the app ignores Premium until you tap “Use real subscription status”.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Simulate free",
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

  const handleRestore = () => {
    if (busy) return;
    Alert.alert(
      "Use real subscription status?",
      "This clears the free-tier simulation and shows your actual RevenueCat / sandbox subscription again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            setBusy(true);
            try {
              await restoreRealSubscriptionStatusForTestFlight();
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <Text style={[styles.eyebrow, isDark && styles.eyebrowDark]}>
        TestFlight only
      </Text>
      <Text style={[styles.title, isDark && styles.titleDark]}>QA tools</Text>
      <Text style={[styles.body, isDark && styles.bodyDark]}>
        These controls are only shown in TestFlight builds. They are not visible
        in the App Store release.
      </Text>
      {simulatingFree ? (
        <Text style={[styles.status, isDark && styles.statusDark]}>
          Currently simulating the Basic (free) tier.
        </Text>
      ) : null}
      <View style={styles.buttonRow}>
        <RectButton
          onPress={handleReset}
          enabled={!busy}
          style={styles.button}
          underlayColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
          accessibilityRole="button"
          accessibilityLabel="Simulate free tier for TestFlight testing"
        >
          <View pointerEvents="none" style={styles.buttonInner}>
            <RotateCcw size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.buttonText}>
              {busy ? "Working…" : "Simulate free tier"}
            </Text>
          </View>
        </RectButton>
        {simulatingFree ? (
          <RectButton
            onPress={handleRestore}
            enabled={!busy}
            style={[styles.button, styles.buttonSecondary]}
            underlayColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
            accessibilityRole="button"
            accessibilityLabel="Use real subscription status"
          >
            <View pointerEvents="none" style={styles.buttonInner}>
              <Crown size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.buttonText}>Use real subscription status</Text>
            </View>
          </RectButton>
        ) : null}
      </View>
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
  status: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    color: "#B45309",
    marginBottom: 12,
  },
  statusDark: {
    color: "#FCD34D",
  },
  buttonRow: {
    gap: 10,
  },
  button: {
    alignSelf: "flex-start",
    borderRadius: 10,
    backgroundColor: MAIN_PURPLE,
    minHeight: 44,
  },
  buttonSecondary: {
    backgroundColor: "#0D9488",
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
