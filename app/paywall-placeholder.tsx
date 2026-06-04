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
 *   - `/welcome` (post-purchase celebration) is reached only from
 *     `onPurchaseCompleted` / `onRestoreCompleted`. Tapping X always closes
 *     the paywall without that flow, even if RevenueCat synced entitlements
 *     in the background (e.g. sandbox restore on the same Apple ID).
 *
 *   - `routedRef` latches the first navigation so duplicate callbacks are
 *     ignored.
 */
export default function PaywallScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";

  const routedRef = useRef(false);
  /** Pro entitlement when this paywall opened (after RC sync). */
  const hadProAtOpenRef = useRef(false);
  const [snapshotReady, setSnapshotReady] = useState(isPreview);
  /** True while a native purchase/restore flow is in progress (started → completed/error/cancel). */
  const billingFlowActiveRef = useRef(false);

  useEffect(() => {
    if (isPreview) return;
    let cancelled = false;
    void (async () => {
      // Wait for RevenueCat's initial customer-info sync before mounting the
      // paywall UI so entitlement state is stable.
      const pro = await hasProEntitlement();
      if (cancelled) return;
      hadProAtOpenRef.current = pro;
      setSnapshotReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isPreview]);

  useEffect(() => {
    if (!snapshotReady || isPreview || !hadProAtOpenRef.current) return;
    if (routedRef.current) return;
    routedRef.current = true;
    log("already Pro when paywall opened — skipping to tabs");
    void setOnboardingComplete();
    router.replace("/(tabs)");
  }, [isPreview, router, snapshotReady]);

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

  const finishBillingSuccess = useCallback(
    async (fromBillingCallback = false) => {
      const userInitiatedBilling =
        billingFlowActiveRef.current || fromBillingCallback;
      billingFlowActiveRef.current = false;

      if (!userInitiatedBilling) {
        log(
          "purchase/restore completed callback without a started event — ignoring",
        );
        return;
      }

      const pro = await hasProEntitlement();
      if (!pro) {
        log(
          "billing flow finished but Pro entitlement is inactive — not routing",
        );
        return;
      }

      if (hadProAtOpenRef.current) {
        log(
          "Pro was already active when paywall opened — closing without welcome",
        );
        goBackOrTabs();
        return;
      }

      if (isPreview) {
        if (routedRef.current) return;
        routedRef.current = true;
        router.back();
        return;
      }

      goWelcome();
    },
    [goBackOrTabs, goWelcome, isPreview, router],
  );

  const onPurchaseCompleted = useCallback(() => {
    log("onPurchaseCompleted");
    void finishBillingSuccess(true);
  }, [finishBillingSuccess]);

  const onRestoreCompleted = useCallback(() => {
    log("onRestoreCompleted");
    void finishBillingSuccess(true);
  }, [finishBillingSuccess]);

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

    // User tapped X — always close without the post-purchase welcome flow,
    // even if RevenueCat synced a sandbox entitlement in the background.
    // Purchase / restore success is handled only in those callbacks.
    log("onDismiss → closing paywall");
    goBackOrTabs();
  }, [goBackOrTabs, isPreview, router]);

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
