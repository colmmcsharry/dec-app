import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import {
  getDevPremiumUnlockForTesting,
  setDevPremiumUnlockForTesting,
} from "@/services/purchases";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Crown, PartyPopper, Play, RotateCcw } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Purchases from "react-native-purchases";

/**
 * Floating dev-only controls (only when `__DEV__` is true):
 * - **Unlock Pro** — sets a local flag so `hasProEntitlement()` / `requirePro()`
 *   succeed without RevenueCat (Expo Go, web, or when paywalls error).
 * - **Reset** — wipes AsyncStorage + RC logout and returns to `/`.
 *
 * - **Preview onboarding** — (`variant="inline"` only) opens the full carousel
 *   with `preview=1` so you can exit without marking onboarding complete.
 * - **Preview welcome** — (`variant="inline"` only) opens the post-purchase /
 *   post-trial thank-you screen (for Expo Go when paywalls are unavailable).
 */
export function DevResetButton({
  variant = "floating",
}: {
  variant?: "floating" | "inline";
}) {
  const [busy, setBusy] = useState(false);
  const [devProOn, setDevProOn] = useState(false);

  useEffect(() => {
    if (!__DEV__) return;
    void getDevPremiumUnlockForTesting().then(setDevProOn);
  }, []);

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

  const toggleDevPro = async () => {
    const next = !devProOn;
    await setDevPremiumUnlockForTesting(next);
    setDevProOn(next);
  };

  return (
    <View
      style={variant === "inline" ? styles.columnInline : styles.columnFloating}
      pointerEvents="box-none"
    >
      {variant === "inline" ? (
        <>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/onboarding", params: { preview: "1" } })
            }
            style={({ pressed }) => [
              styles.pill,
              styles.pillPreview,
              { opacity: pressed ? 0.85 : 0.95 },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Preview full onboarding flow"
          >
            <View pointerEvents="none">
              <Play size={12} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.pillText}>Preview onboarding</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/welcome")}
            style={({ pressed }) => [
              styles.pill,
              styles.pillWelcome,
              { opacity: pressed ? 0.85 : 0.95 },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Preview post-purchase welcome screen"
          >
            <View pointerEvents="none">
              <PartyPopper size={12} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <Text style={styles.pillText}>Preview welcome</Text>
          </Pressable>
        </>
      ) : null}
      <Pressable
        onPress={toggleDevPro}
        style={({ pressed }) => [
          styles.pill,
          styles.pillPro,
          { opacity: pressed ? 0.85 : 0.95 },
        ]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          devProOn ? "Disable dev premium unlock" : "Enable dev premium unlock"
        }
      >
        <Crown size={12} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.pillText}>
          {devProOn ? "Dev: Pro on" : "Dev: unlock Pro"}
        </Text>
      </Pressable>
      <Pressable
        onPress={handleReset}
        style={({ pressed }) => [
          styles.pill,
          styles.pillReset,
          { opacity: pressed || busy ? 0.7 : 0.92 },
        ]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Reset app state for testing"
      >
        <RotateCcw size={12} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.pillText}>Dev: reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  columnFloating: {
    position: "absolute",
    bottom: 24,
    left: 12,
    zIndex: 1000,
    gap: 8,
  },
  columnInline: {
    marginTop: 8,
    alignSelf: "flex-start",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  pillPro: {
    backgroundColor: "#0D9488",
  },
  pillReset: {
    backgroundColor: MAIN_PURPLE,
  },
  pillPreview: {
    backgroundColor: "#0284C7",
  },
  pillWelcome: {
    backgroundColor: "#C026D3",
  },
  pillText: {
    color: "#FFFFFF",
    fontFamily: AppFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
