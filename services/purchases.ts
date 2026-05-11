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

/**
 * The entitlement identifier configured in RevenueCat (Product catalog → Entitlements).
 * A user must have this entitlement active to access paid app content.
 */
export const PRO_ENTITLEMENT_ID = "Daily Diesel Pro";

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
 * Fetch the latest customer info from RevenueCat and check if the Pro entitlement is active.
 * Returns false on web or if the SDK isn't configured / network fails.
 */
export async function hasProEntitlement(): Promise<boolean> {
  if (await readDevPremiumUnlockFlag()) return true;
  if (Platform.OS === "web") return false;
  if (!configurePurchases()) return false;
  try {
    const info = await Purchases.getCustomerInfo();
    return customerInfoHasPro(info);
  } catch (e) {
    console.warn("[Purchases] getCustomerInfo failed", e);
    return false;
  }
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
 * Subscribe to customer info changes so the app can react when a purchase
 * completes, a subscription expires, or the user is restored.
 *
 * Returns an unsubscribe function.
 */
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
