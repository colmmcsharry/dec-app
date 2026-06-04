import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@dec_app_onboarding_complete";

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, "true");
  } catch {
    /* ignore */
  }
}

export async function clearOnboardingComplete(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
