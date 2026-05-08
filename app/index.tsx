import { MAIN_PURPLE } from "@/constants/theme";
import { hasCompletedOnboarding } from "@/services/onboarding-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

type Destination = "/onboarding" | "/(tabs)";

/**
 * Entry router. We use a *soft* paywall model:
 *
 * 1. New users (not onboarded) → onboarding flow → paywall at the end.
 * 2. Everyone else (whether or not they have Pro) → main tabs.
 *    Non-Pro users can still browse the home screen, modules list, daily
 *    quote, etc. The paywall only appears when they tap something gated
 *    (a video lesson, a workbook PDF, etc.) — see `requirePro()`.
 */
export default function Index() {
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const onboarded = await hasCompletedOnboarding();
      if (cancelled) return;
      setDestination(onboarded ? "/(tabs)" : "/onboarding");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!destination) {
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

  return <Redirect href={destination} />;
}
