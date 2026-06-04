import { MAIN_PURPLE } from "@/constants/theme";
import {
  hasCompletedOnboarding,
  setOnboardingComplete,
} from "@/services/onboarding-storage";
import { hasProEntitlement } from "@/services/purchases";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

type Destination = "/onboarding" | "/(tabs)";

/**
 * Entry router. We use a *soft* paywall model:
 *
 * 1. Pro subscribers → tabs (skip onboarding + paywall even after reinstall).
 * 2. New free users → onboarding → paywall at the end.
 * 3. Returning free users (onboarded, no Pro) → tabs; paywall only on gated taps.
 */
export default function Index() {
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pro = await hasProEntitlement();
      if (cancelled) return;
      if (pro) {
        void setOnboardingComplete();
        setDestination("/(tabs)");
        return;
      }
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
