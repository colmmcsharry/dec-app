import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { RotateCcw } from "lucide-react-native";
import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text } from "react-native";
import Purchases from "react-native-purchases";

/**
 * Floating "reset for testing" pill, rendered only when `__DEV__` is true.
 * Wipes local app state so we can re-walk the onboarding + paywall flow
 * without uninstalling the app.
 *
 * What it does:
 *   1. Clears AsyncStorage (onboarding flag, watched videos, journal entries…)
 *   2. Tells RevenueCat to log out the current anonymous user so a fresh
 *      Customer ID is generated — no entitlements carry over.
 *   3. Bounces the router back to "/" which then re-evaluates the entitlement.
 *
 * NOTE: this can NOT clear StoreKit transactions in the local .storekit
 * configuration file. To re-test a fresh purchase, also open Xcode →
 * Debug → StoreKit → Manage Transactions and delete the entry there.
 */
export function DevResetButton() {
  const [busy, setBusy] = useState(false);

  if (!__DEV__) return null;

  const handleReset = async () => {
    if (busy) return;
    Alert.alert(
      "Reset app state?",
      "This wipes onboarding, progress, and the RevenueCat customer ID for this device. StoreKit transactions in Xcode are NOT cleared — do that from the Xcode menu separately.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            try {
              await AsyncStorage.clear();
              if (Platform.OS !== "web") {
                try {
                  // logOut throws / warns when the user is already anonymous,
                  // so check first — there's nothing to do in that case.
                  const isAnonymous = await Purchases.isAnonymous();
                  if (!isAnonymous) {
                    await Purchases.logOut();
                  }
                } catch {
                  /* not configured — fine */
                }
              }
              router.replace("/");
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Pressable
      onPress={handleReset}
      style={({ pressed }) => [
        styles.pill,
        { opacity: pressed || busy ? 0.7 : 0.92 },
      ]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Reset app state for testing"
    >
      <RotateCcw size={12} color="#FFFFFF" strokeWidth={2.5} />
      <Text style={styles.pillText}>Dev: reset</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    bottom: 24,
    left: 12,
    zIndex: 1000,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: MAIN_PURPLE,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  pillText: {
    color: "#FFFFFF",
    fontFamily: AppFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
