import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

export const APP_STORE_ID = "6761314761";

export const PLAY_STORE_PACKAGE =
  Constants.expoConfig?.android?.package ?? "com.colmmcs.dailydiesel";

const FIRST_MODULE_REVIEW_PROMPT_KEY = "__dd_first_module_review_prompted";

/** Delay before the review prompt so the completion UI can settle first. */
const FIRST_MODULE_REVIEW_DELAY_MS = 1500;

function getAppStoreReviewUrl(): string {
  return `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
}

function getPlayStoreListingUrl(): string {
  return (
    Constants.expoConfig?.android?.playStoreUrl ??
    `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`
  );
}

/** Opens the store listing / write-review page (reliable for explicit CTAs). */
export async function openStoreReviewPage(): Promise<void> {
  if (Platform.OS === "web") return;

  if (Platform.OS === "ios") {
    await Linking.openURL(getAppStoreReviewUrl());
    return;
  }

  if (Platform.OS === "android") {
    // Use the Play Store https URL — `market://` is a generic intent and
    // Samsung devices offer Galaxy Store as a handler even when we're not listed there.
    await Linking.openURL(getPlayStoreListingUrl());
  }
}

/**
 * Opportunistic native review (e.g. after finishing Module 1).
 * Explicit "Leave a review" buttons should use `openStoreReviewPage` —
 * on Android, Play's in-app API often reports available then shows nothing.
 */
export async function requestAppReview(): Promise<void> {
  if (Platform.OS === "web") return;

  if (Platform.OS === "ios" && (await StoreReview.hasAction())) {
    await StoreReview.requestReview();
    return;
  }

  await openStoreReviewPage();
}

export function getReviewStoreLabel(): string {
  if (Platform.OS === "android") return "Google Play Store";
  if (Platform.OS === "ios") return "App Store";
  return "app store";
}

/**
 * One-time review prompt after the user finishes Module 1 (all videos).
 * Safe to call repeatedly — only runs once per install.
 */
export async function maybeRequestReviewAfterFirstModuleCompleted(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const alreadyPrompted = await AsyncStorage.getItem(
      FIRST_MODULE_REVIEW_PROMPT_KEY,
    );
    if (alreadyPrompted === "1") return;

    await AsyncStorage.setItem(FIRST_MODULE_REVIEW_PROMPT_KEY, "1");

    await new Promise((resolve) =>
      setTimeout(resolve, FIRST_MODULE_REVIEW_DELAY_MS),
    );

    await requestAppReview();
  } catch {
    /* ignore */
  }
}
