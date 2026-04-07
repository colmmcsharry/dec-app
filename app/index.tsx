import { MAIN_PURPLE } from "@/constants/theme";
import { hasCompletedOnboarding } from "@/services/onboarding-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

/**
 * Entry: send first-time users through onboarding, everyone else to the main tabs.
 */
export default function Index() {
  const [ready, setReady] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const done = await hasCompletedOnboarding();
      if (!cancelled) {
        setComplete(done);
        setReady(true);
      }
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

  if (complete) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
