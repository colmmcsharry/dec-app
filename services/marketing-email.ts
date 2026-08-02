import {
  KIT_SUBSCRIBE_URL,
  type MarketingEmailSource,
} from "@/constants/marketing-email";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EMAIL_KEY = "__dd_marketing_email";
const OPT_IN_KEY = "__dd_marketing_opt_in";
const SUBSCRIBED_AT_KEY = "__dd_marketing_subscribed_at";
const SOURCE_KEY = "__dd_marketing_source";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface MarketingEmailPrefs {
  email: string | null;
  optedIn: boolean;
  subscribedAt: string | null;
  source: MarketingEmailSource | null;
}

export function isValidMarketingEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export async function getMarketingEmailPrefs(): Promise<MarketingEmailPrefs> {
  try {
    const [email, optedIn, subscribedAt, source] = await Promise.all([
      AsyncStorage.getItem(EMAIL_KEY),
      AsyncStorage.getItem(OPT_IN_KEY),
      AsyncStorage.getItem(SUBSCRIBED_AT_KEY),
      AsyncStorage.getItem(SOURCE_KEY),
    ]);

    return {
      email,
      optedIn: optedIn === "1",
      subscribedAt,
      source:
        source === "about" || source === "onboarding" || source === "home"
          ? source
          : null,
    };
  } catch {
    return {
      email: null,
      optedIn: false,
      subscribedAt: null,
      source: null,
    };
  }
}

async function persistMarketingPrefs(
  email: string,
  source: MarketingEmailSource,
): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(EMAIL_KEY, email),
    AsyncStorage.setItem(OPT_IN_KEY, "1"),
    AsyncStorage.setItem(SUBSCRIBED_AT_KEY, new Date().toISOString()),
    AsyncStorage.setItem(SOURCE_KEY, source),
  ]);
}

async function clearMarketingPrefs(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(EMAIL_KEY),
    AsyncStorage.removeItem(OPT_IN_KEY),
    AsyncStorage.removeItem(SUBSCRIBED_AT_KEY),
    AsyncStorage.removeItem(SOURCE_KEY),
  ]);
}

export type SubscribeResult =
  | { ok: true }
  | { ok: false; error: string };

export async function subscribeMarketingEmail(
  rawEmail: string,
  source: MarketingEmailSource,
): Promise<SubscribeResult> {
  const email = rawEmail.trim().toLowerCase();
  if (!isValidMarketingEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  try {
    const response = await fetch(KIT_SUBSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, action: "subscribe" }),
    });

    const text = await response.text();
    let data: { error?: string } | null = null;
    if (text) {
      try {
        data = JSON.parse(text) as { error?: string };
      } catch {
        data = null;
      }
    }

    if (!response.ok) {
      if (response.status === 404) {
        return {
          ok: false,
          error:
            "Email signup service is not deployed yet. Redeploy the Netlify site with the kit-subscribe function.",
        };
      }
      return {
        ok: false,
        error: data?.error ?? "Could not subscribe right now. Try again.",
      };
    }

    await persistMarketingPrefs(email, source);
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Check your connection and retry." };
  }
}

export async function unsubscribeMarketingEmail(
  rawEmail?: string,
): Promise<SubscribeResult> {
  const prefs = await getMarketingEmailPrefs();
  const email = (rawEmail ?? prefs.email ?? "").trim().toLowerCase();

  if (!email || !isValidMarketingEmail(email)) {
    await clearMarketingPrefs();
    return { ok: true };
  }

  try {
    const response = await fetch(KIT_SUBSCRIBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, action: "unsubscribe" }),
    });

    const data = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    if (!response.ok) {
      return {
        ok: false,
        error: data?.error ?? "Could not unsubscribe right now. Try again.",
      };
    }

    await clearMarketingPrefs();
    return { ok: true };
  } catch {
    return { ok: false, error: "Network error. Check your connection and retry." };
  }
}
