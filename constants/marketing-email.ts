import Constants from "expo-constants";

const PDF_BASE =
  (Constants.expoConfig?.extra?.pdfBaseUrl as string | undefined)?.replace(
    /\/$/,
    "",
  ) ?? "https://dailydiesel.netlify.app";

/** POST target for Kit subscribe / unsubscribe (Netlify function). */
export const KIT_SUBSCRIBE_URL = `${PDF_BASE}/.netlify/functions/kit-subscribe`;

export type MarketingEmailSource = "onboarding" | "about" | "home";
