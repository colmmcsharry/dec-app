import { setOnboardingComplete } from "@/services/onboarding-storage";
import {
  addCustomerInfoListener,
  configurePurchases,
  customerInfoHasPro,
  hasProEntitlement,
} from "@/services/purchases";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { InteractionManager, Platform, StyleSheet, View } from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const log = (...args: unknown[]) => {
  if (__DEV__) console.log("[Paywall]", ...args);
};

/**
 * Renders the RevenueCat-hosted paywall.
 *
 * Navigation strategy:
 *   - We "navigate first, persist later". The moment we know the user has
 *     bought (or already has) the entitlement, we route synchronously to
 *     /welcome. Persisting the onboarding flag happens fire-and-forget.
 *     This avoids races where the RC paywall's auto-dismiss fires before
 *     our async work finishes.
 *
 *   - A `routedRef` latches the first navigation so any later callback
 *     (onDismiss after onPurchaseCompleted, customer-info listener, etc.)
 *     becomes a no-op.
 *
 *   - onDismiss is treated as a *cancellation* by default and routes back
 *     to /onboarding. If the user actually purchased, onPurchaseCompleted
 *     OR the customer-info listener will have already latched routedRef
 *     and we never reach the onboarding fallback.
 */
export default function PaywallScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";

  const routedRef = useRef(false);

  /**
   * Defer the navigation until *after* RC's paywall sheet has finished its
   * native dismiss animation. If we navigate synchronously inside RC's
   * callbacks, the replace gets clobbered/dropped because the paywall is
   * popping itself off the native stack at the same moment.
   *
   * We schedule on InteractionManager (covers RN animations) AND a small
   * setTimeout (covers RC's native sheet animation, which RN doesn't know
   * about). Belt-and-braces.
   */
  const scheduleNavigate = useCallback(
    (href: "/welcome" | "/(tabs)" | "/onboarding") => {
      log("scheduling navigate →", href);
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          log("executing navigate →", href);
          router.replace(href);
        }, 450);
      });
    },
    [router],
  );

  const goWelcome = useCallback(() => {
    if (routedRef.current) {
      log("goWelcome skipped — already routed");
      return;
    }
    routedRef.current = true;
    scheduleNavigate("/welcome");
    void setOnboardingComplete();
  }, [scheduleNavigate]);

  const goTabs = useCallback(() => {
    if (routedRef.current) {
      log("goTabs skipped — already routed");
      return;
    }
    routedRef.current = true;
    scheduleNavigate("/(tabs)");
    void setOnboardingComplete();
  }, [scheduleNavigate]);

  const goBackOrTabs = useCallback(() => {
    if (routedRef.current) {
      log("goBackOrTabs skipped — already routed");
      return;
    }
    routedRef.current = true;
    // Dismiss is user-initiated — navigate immediately. No InteractionManager /
    // setTimeout wrapper here because the paywall route is being torn down by
    // the user's tap, not racing with a purchase animation.
    if (router.canGoBack()) {
      log("executing back");
      router.back();
    } else {
      log("no back stack — replacing with /(tabs)");
      router.replace("/(tabs)");
    }
  }, [router]);

  const onPurchaseCompleted = useCallback(() => {
    log("onPurchaseCompleted");
    if (isPreview) {
      if (routedRef.current) return;
      routedRef.current = true;
      router.back();
      return;
    }
    goWelcome();
  }, [goWelcome, isPreview, router]);

  const onRestoreCompleted = useCallback(() => {
    log("onRestoreCompleted");
    if (isPreview) {
      if (routedRef.current) return;
      routedRef.current = true;
      router.back();
      return;
    }
    goWelcome();
  }, [goWelcome, isPreview, router]);

  const onDismiss = useCallback(async () => {
    log("onDismiss fired (routed=", routedRef.current, ")");
    if (routedRef.current) return;
    if (isPreview) {
      routedRef.current = true;
      router.back();
      return;
    }

    // The user closed without purchasing — but RC sometimes dispatches
    // onDismiss before onPurchaseCompleted lands, so do a single fast
    // entitlement check before treating this as a real cancellation.
    // We deliberately don't add a wall-clock delay here because the paywall
    // sheet stays on screen until we navigate, and any delay makes the X
    // feel broken (user re-taps, getting redundant onDismiss events).
    // Race protection comes from:
    //   1. onPurchaseCompleted firing first and latching routedRef.
    //   2. The customer-info listener (above) catching late entitlements
    //      while this route is still mounted.
    const pro = await hasProEntitlement();
    log("onDismiss settle check, pro=", pro);
    if (routedRef.current) return;
    if (pro) {
      goWelcome();
    } else {
      // Real cancellation — drop them back wherever they came from
      // (previous screen if there's a back stack, otherwise tabs).
      goBackOrTabs();
    }
  }, [goBackOrTabs, goWelcome, isPreview, router]);

  // Defensive backup: if the entitlement flips active at any time while we're
  // on the paywall (out-of-band purchase, deferred sandbox transaction, etc.)
  // navigate to welcome immediately.
  useEffect(() => {
    if (isPreview) return;
    if (Platform.OS === "web") return;
    log("subscribing to customer info updates");
    const unsubscribe = addCustomerInfoListener((info) => {
      const hasPro = customerInfoHasPro(info);
      log("customer info update, hasPro=", hasPro);
      if (hasPro) goWelcome();
    });
    return () => {
      log("unsubscribing customer info listener");
      unsubscribe();
    };
  }, [goWelcome, isPreview]);

  if (Platform.OS === "web") {
    void goTabs();
    return null;
  }

  configurePurchases();

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        options={{ displayCloseButton: true }}
        onPurchaseCompleted={onPurchaseCompleted}
        onRestoreCompleted={onRestoreCompleted}
        onDismiss={onDismiss}
      />
    </View>
  );
}

void PAYWALL_RESULT;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
