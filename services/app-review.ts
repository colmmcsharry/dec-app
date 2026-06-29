import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as StoreReview from "expo-store-review";
import { Linking, Platform } from "react-native";

export const APP_STORE_ID = "6761314761";

export const PLAY_STORE_PACKAGE =
  Constants.expoConfig?.android?.package ?? "com.colmmcs.dailydiesel";

const FIRST_VIDEO_REVIEW_PROMPT_KEY = "__dd_first_video_review_prompted";

/** Delay before the native review sheet so the "Watched" state is visible first. */
const FIRST_VIDEO_REVIEW_DELAY_MS = 1500;

function getAppStoreReviewUrl(): string {
  return `https://apps.apple.com/app/id${APP_STORE_ID}?action=write-review`;
}

function getPlayStoreReviewUrl(): string {
  return (
    Constants.expoConfig?.android?.playStoreUrl ??
    `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE}`
  );
}

/**
 * Native in-app review when available (iOS + Android).
 * Falls back to the App Store / Play Store listing page.
 */
export async function requestAppReview(): Promise<void> {
  if (Platform.OS === "web") return;

  if (await StoreReview.hasAction()) {
    await StoreReview.requestReview();
    return;
  }

  const url =
    Platform.OS === "ios" ? getAppStoreReviewUrl() : getPlayStoreReviewUrl();
  await Linking.openURL(url);
}

export function getReviewStoreLabel(): string {
  if (Platform.OS === "android") return "Google Play Store";
  if (Platform.OS === "ios") return "App Store";
  return "app store";
}

/**
 * One-time native review prompt after the user completes the first app video
 * (Course Intro). Safe to call repeatedly — only runs once per install.
 */
export async function maybeRequestReviewAfterFirstVideoCompleted(): Promise<void> {
  if (Platform.OS === "web") return;

  try {
    const alreadyPrompted = await AsyncStorage.getItem(
      FIRST_VIDEO_REVIEW_PROMPT_KEY,
    );
    if (alreadyPrompted === "1") return;

    await AsyncStorage.setItem(FIRST_VIDEO_REVIEW_PROMPT_KEY, "1");

    await new Promise((resolve) =>
      setTimeout(resolve, FIRST_VIDEO_REVIEW_DELAY_MS),
    );

    await requestAppReview();
  } catch {
    /* ignore */
  }
}
