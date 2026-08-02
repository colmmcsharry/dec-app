import { MAIN_PURPLE } from "@/constants/theme";
import { setOnboardingComplete } from "@/services/onboarding-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Entry router — soft-paywall experiment:
 *
 * Everyone (new + returning) goes straight to the main tabs so they see the
 * free modules first. Paywall still appears on gated taps elsewhere.
 *
 * Onboarding UI is kept at `/onboarding` (dev preview / future re-enable)
 * but is not used as the default first-run path.
 */
export default function Index() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Mark complete so other flows treat the user as past first-run setup.
      await setOnboardingComplete();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F8F6FC",
        }}
      >
        <ActivityIndicator size="large" color={MAIN_PURPLE} />
      </View>
    );
  }

  return <Redirect href="/(tabs)" />;
}
