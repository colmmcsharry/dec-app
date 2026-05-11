import { setOnboardingComplete } from "@/services/onboarding-storage";
import { configurePurchases, hasProEntitlement } from "@/services/purchases";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const log = (...args: unknown[]) => {
  if (__DEV__) console.log("[Paywall]", ...args);
};

/**
 * Renders the RevenueCat-hosted paywall.
 *
 * Navigation strategy:
 *   - `/welcome` (post-purchase celebration) is reached from
 *     `onPurchaseCompleted` / `onRestoreCompleted`, or from `onDismiss`
 *     only when Pro became active **after** this screen opened (snapshot
 *     taken before showing the paywall). That way TestFlight / sandbox
 *     users who already have an active sub but tap X do not get the
 *     “congrats” flow.
 *
 *   - `routedRef` latches the first navigation so duplicate callbacks are
 *     ignored.
 */
export default function PaywallScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";

  const routedRef = useRef(false);
  /** Pro entitlement when this paywall instance became ready (before RC UI). */
  const hadProAtOpenRef = useRef(false);
  const [snapshotReady, setSnapshotReady] = useState(isPreview);
  /** True while a native purchase/restore flow is in progress (started → completed/error/cancel). */
  const billingFlowActiveRef = useRef(false);

  useEffect(() => {
    if (isPreview) return;
    let cancelled = false;
    void (async () => {
      const pro = await hasProEntitlement();
      if (cancelled) return;
      hadProAtOpenRef.current = pro;
      setSnapshotReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isPreview]);

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
    billingFlowActiveRef.current = false;
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
    billingFlowActiveRef.current = false;
    if (isPreview) {
      if (routedRef.current) return;
      routedRef.current = true;
      router.back();
      return;
    }
    goWelcome();
  }, [goWelcome, isPreview, router]);

  const onPurchaseStarted = useCallback(() => {
    log("onPurchaseStarted");
    billingFlowActiveRef.current = true;
  }, []);

  const onPurchaseError = useCallback(() => {
    log("onPurchaseError");
    billingFlowActiveRef.current = false;
  }, []);

  const onPurchaseCancelled = useCallback(() => {
    log("onPurchaseCancelled");
    billingFlowActiveRef.current = false;
  }, []);

  const onRestoreStarted = useCallback(() => {
    log("onRestoreStarted");
    billingFlowActiveRef.current = true;
  }, []);

  const onRestoreError = useCallback(() => {
    log("onRestoreError");
    billingFlowActiveRef.current = false;
  }, []);

  const onDismiss = useCallback(async () => {
    log("onDismiss fired (routed=", routedRef.current, ")");
    if (routedRef.current) return;
    if (isPreview) {
      routedRef.current = true;
      router.back();
      return;
    }

    // Give onPurchaseCompleted / onRestoreCompleted time to run first; RC
    // can call onDismiss in the same frame ordering as those callbacks.
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    if (routedRef.current) return;

    if (billingFlowActiveRef.current) {
      log("onDismiss: billing flow active, waiting for completion");
      for (let i = 0; i < 30; i++) {
        await new Promise<void>((r) => setTimeout(r, 100));
        if (routedRef.current) return;
        if (!billingFlowActiveRef.current) break;
      }
    }
    if (routedRef.current) return;

    const proNow = await hasProEntitlement();
    log("onDismiss after delay, proNow=", proNow, "hadProAtOpen=", hadProAtOpenRef.current);
    if (routedRef.current) return;

    // Already had Pro when they opened this paywall (e.g. sandbox sub) → X
    // means "not buying again / close", not post-purchase celebration.
    if (proNow && !hadProAtOpenRef.current) {
      goWelcome();
    } else {
      goBackOrTabs();
    }
  }, [goBackOrTabs, goWelcome, isPreview, router]);

  if (Platform.OS === "web") {
    void goTabs();
    return null;
  }

  configurePurchases();

  if (!snapshotReady) {
    return (
      <View style={[styles.container, styles.loadingCenter]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <RevenueCatUI.Paywall
        options={{ displayCloseButton: true }}
        onPurchaseStarted={onPurchaseStarted}
        onPurchaseCompleted={onPurchaseCompleted}
        onPurchaseError={onPurchaseError}
        onPurchaseCancelled={onPurchaseCancelled}
        onRestoreStarted={onRestoreStarted}
        onRestoreCompleted={onRestoreCompleted}
        onRestoreError={onRestoreError}
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
  loadingCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
});
