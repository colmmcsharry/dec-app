import { PRO_ENTITLEMENT_ID } from "@/constants/revenuecat";
import {
  isFreeModule,
  isFreeModulePdf,
  isFreePreviewVideo,
} from "@/lib/free-preview-video";
import { isTestFlightInstall } from "@/lib/is-testflight-install";
import { clearOnboardingComplete } from "@/services/onboarding-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Platform } from "react-native";
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
} from "react-native-purchases";

/**
 * Dev-only local flag so Expo Go / web / environments where RC paywalls fail
 * can still open gated content. Never honored when `__DEV__` is false.
 */
const DEV_PREMIUM_UNLOCK_KEY = "__dd_dev_premium_unlock";
/** TestFlight-only: pretend the user is on the free tier for QA. */
const TESTFLIGHT_FORCE_FREE_KEY = "__dd_testflight_force_free";

let testFlightForceFreeCached: boolean | null = null;

async function readTestFlightForceFreeFlag(): Promise<boolean> {
  if (__DEV__ || Platform.OS !== "ios" || !isTestFlightInstall()) {
    testFlightForceFreeCached = false;
    return false;
  }
  if (testFlightForceFreeCached !== null) return testFlightForceFreeCached;
  try {
    testFlightForceFreeCached =
      (await AsyncStorage.getItem(TESTFLIGHT_FORCE_FREE_KEY)) === "1";
  } catch {
    testFlightForceFreeCached = false;
  }
  return testFlightForceFreeCached;
}

export async function isTestFlightForceFreeActive(): Promise<boolean> {
  return readTestFlightForceFreeFlag();
}

async function setTestFlightForceFreeFlag(enabled: boolean): Promise<void> {
  if (__DEV__ || Platform.OS !== "ios" || !isTestFlightInstall()) return;
  testFlightForceFreeCached = enabled;
  try {
    if (enabled) {
      await AsyncStorage.setItem(TESTFLIGHT_FORCE_FREE_KEY, "1");
    } else {
      await AsyncStorage.removeItem(TESTFLIGHT_FORCE_FREE_KEY);
    }
  } catch {
    /* ignore */
  }
}

async function readDevPremiumUnlockFlag(): Promise<boolean> {
  if (!__DEV__) return false;
  try {
    return (await AsyncStorage.getItem(DEV_PREMIUM_UNLOCK_KEY)) === "1";
  } catch {
    return false;
  }
}

/** Toggle fake Pro for local testing (development builds only). */
export async function setDevPremiumUnlockForTesting(
  enabled: boolean,
): Promise<void> {
  if (!__DEV__) return;
  try {
    if (enabled) {
      await AsyncStorage.setItem(DEV_PREMIUM_UNLOCK_KEY, "1");
    } else {
      await AsyncStorage.removeItem(DEV_PREMIUM_UNLOCK_KEY);
    }
  } catch {
    /* ignore */
  }
}

export async function getDevPremiumUnlockForTesting(): Promise<boolean> {
  return readDevPremiumUnlockFlag();
}

export { PRO_ENTITLEMENT_ID };

let configured = false;

function getApiKey(): string | undefined {
  const extra = Constants.expoConfig?.extra ?? {};
  if (Platform.OS === "ios") return extra.revenueCatIosKey as string | undefined;
  if (Platform.OS === "android")
    return extra.revenueCatAndroidKey as string | undefined;
  return undefined;
}

/**
 * Configure RevenueCat. Safe to call multiple times — only configures once.
 * Returns false on web or when keys are missing so callers can skip purchase flows.
 */
export function configurePurchases(): boolean {
  if (configured) return true;
  if (Platform.OS === "web") return false;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn(
      "[Purchases] No API key configured for platform",
      Platform.OS,
    );
    return false;
  }

  try {
    Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.WARN);
    Purchases.configure({ apiKey });
    configured = true;
    return true;
  } catch (e) {
    console.warn("[Purchases] configure failed", e);
    return false;
  }
}

export function arePurchasesConfigured(): boolean {
  return configured;
}

/**
 * Returns true if the customer info contains the Pro entitlement in active state.
 * On web/unsupported platforms always returns false.
 */
export function customerInfoHasPro(info: CustomerInfo | null | undefined): boolean {
  if (!info) return false;
  return Boolean(info.entitlements?.active?.[PRO_ENTITLEMENT_ID]);
}

/**
 * Premium status for UI and routing. Honors TestFlight force-free QA override.
 */
export async function resolvePremiumStatus(
  info?: CustomerInfo | null,
): Promise<boolean> {
  if (await readDevPremiumUnlockFlag()) return true;
  if (await readTestFlightForceFreeFlag()) return false;
  if (info !== undefined) return customerInfoHasPro(info);
  if (Platform.OS === "web") return false;
  if (!configurePurchases()) return false;
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfoHasPro(customerInfo);
  } catch (e) {
    console.warn("[Purchases] getCustomerInfo failed", e);
    return false;
  }
}

/**
 * Fetch the latest customer info from RevenueCat and check if the Pro entitlement is active.
 * Returns false on web or if the SDK isn't configured / network fails.
 */
export async function hasProEntitlement(): Promise<boolean> {
  return resolvePremiumStatus();
}

/**
 * Pro gate for premium content. Call before navigating to any paywalled
 * screen (video lesson, PDF, workbook, etc.).
 *
 *   if (!(await requirePro())) return;
 *   router.push({ pathname: "/video/[id]", params: { id } });
 *
 * If the user already has Pro, returns true and the caller proceeds.
 * Otherwise pushes the paywall and returns false — the caller short-circuits
 * and the paywall stays on top of wherever they were. Dismissing the paywall
 * (without buying) drops them right back where they started.
 */
export async function requirePro(): Promise<boolean> {
  const pro = await hasProEntitlement();
  if (pro) return true;
  router.push("/paywall-placeholder");
  return false;
}

/**
 * Pro gate for a module video. Modules 1–2 (Sleep, Morning Routines) are free.
 */
export async function requireVideoAccess(
  categorySlug: string,
  videoId: string,
): Promise<boolean> {
  if (isFreePreviewVideo(categorySlug, videoId)) return true;
  return requirePro();
}

/** Pro gate for module workbooks, PDFs, and lesson links. */
export async function requireModuleAccess(
  categorySlug: string,
): Promise<boolean> {
  if (isFreeModule(categorySlug)) return true;
  return requirePro();
}

/** Pro gate for a PDF — free when it belongs to Module 1 or 2. */
export async function requirePdfAccess(pdfKey: string): Promise<boolean> {
  if (isFreeModulePdf(pdfKey)) return true;
  return requirePro();
}

export {
  isFreeModule,
  isFreeModulePdf,
  isFreePreviewVideo,
} from "@/lib/free-preview-video";

/**
 * TestFlight QA: simulate the free tier and restart from first-launch routing.
 * RevenueCat / Apple may still have a sandbox subscription on the device — this
 * sets a local TestFlight-only override so the app behaves as Basic until cleared.
 */
export async function resetSubscriptionAndOnboardingForTestFlight(): Promise<void> {
  await setTestFlightForceFreeFlag(true);
  await clearOnboardingComplete();

  if (Platform.OS !== "web" && configurePurchases()) {
    try {
      await Purchases.logIn(`$tfqa_${Date.now()}`);
      await Purchases.invalidateCustomerInfoCache();
    } catch (e) {
      console.warn("[Purchases] TestFlight reset failed", e);
    }
  }

  router.replace("/");
}

/** TestFlight QA: stop simulating free tier and use real RevenueCat status again. */
export async function restoreRealSubscriptionStatusForTestFlight(): Promise<void> {
  await setTestFlightForceFreeFlag(false);

  if (Platform.OS !== "web" && configurePurchases()) {
    try {
      await Purchases.invalidateCustomerInfoCache();
      await Purchases.getCustomerInfo();
    } catch (e) {
      console.warn("[Purchases] TestFlight restore status failed", e);
    }
  }

  router.replace("/");
}

export function addCustomerInfoListener(
  listener: (info: CustomerInfo) => void,
): () => void {
  if (Platform.OS === "web") return () => {};
  if (!configurePurchases()) return () => {};
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    try {
      Purchases.removeCustomerInfoUpdateListener(listener);
    } catch {
      /* ignore */
    }
  };
}
