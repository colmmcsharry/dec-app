import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { DAILY_DIESEL_QUOTES, getQuoteOfTheDay } from "@/data/quotes";
import { hasProEntitlement } from "@/services/purchases";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronRight, Sparkles, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Pool of full-bleed scenic backgrounds used behind the daily quote.
 * Add more images to assets/images/quotes/ and append to this array — the
 * screen will start rotating through them automatically (one per day).
 */
const BACKGROUNDS = [
  require("@/assets/images/quotes/scenic-1.jpg"),
  require("@/assets/images/quotes/scenic-2.jpg"),
  require("@/assets/images/quotes/scenic-3.png"),
  require("@/assets/images/quotes/scenic-4.png"),
  require("@/assets/images/quotes/scenic-5.jpeg"),
];

function getBackgroundOfTheDay(date: Date = new Date()) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return BACKGROUNDS[dayOfYear % BACKGROUNDS.length];
}

/**
 * Standalone daily-quote screen — full-bleed scenic background, white text,
 * gradient darkening overlay for legibility. Reachable by everyone (no
 * entitlement / onboarding gate). Lands here when the user taps the daily
 * push notification, or it can be navigated to manually.
 *
 * For non-paying users, a "Want access to the whole course?" CTA at the
 * bottom routes them to the paywall. Paying users see a "Continue to app"
 * button instead.
 */
export default function DailyQuoteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [hasPro, setHasPro] = useState<boolean | null>(null);
  const [fade] = useState(() => new Animated.Value(0));

  // Dev preview: when set, override the quote-of-day + background-of-day
  // selection so we can flick through every combination to QA the layout
  // and gradient against each background. Only the floating dev pill writes
  // to this state, and it only renders in __DEV__.
  const [devCycleIndex, setDevCycleIndex] = useState<number | null>(null);

  const totalCombinations =
    DAILY_DIESEL_QUOTES.length * BACKGROUNDS.length;

  const quote =
    devCycleIndex == null
      ? getQuoteOfTheDay()
      : DAILY_DIESEL_QUOTES[devCycleIndex % DAILY_DIESEL_QUOTES.length];

  const background =
    devCycleIndex == null
      ? getBackgroundOfTheDay()
      : BACKGROUNDS[
          Math.floor(devCycleIndex / DAILY_DIESEL_QUOTES.length) %
            BACKGROUNDS.length
        ];

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const pro = await hasProEntitlement();
      if (!cancelled) setHasPro(pro);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fade]);

  const close = () => {
    if (hasPro) {
      router.replace("/(tabs)");
    } else {
      router.replace("/");
    }
  };

  const goPaywall = () => {
    router.push("/paywall-placeholder");
  };

  const goApp = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ImageBackground
        source={background}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Soft top-to-bottom darkening gradient for legibility.
            pointerEvents="none" so it can never intercept taps on the
            controls that sit on top of it (close button, dev pill, etc.). */}
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.35)",
            "rgba(0,0,0,0.15)",
            "rgba(0,0,0,0.55)",
            "rgba(0,0,0,0.85)",
          ]}
          locations={[0, 0.35, 0.7, 1]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View
          style={[
            styles.contentWrap,
            {
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={styles.brand}>Daily Diesel</Text>
            <View style={styles.topBarRight}>
              {__DEV__ && (
                <Pressable
                  style={({ pressed }) => [
                    styles.devCycleBtn,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}
                  onPress={() =>
                    setDevCycleIndex((i) =>
                      i == null ? 0 : (i + 1) % totalCombinations,
                    )
                  }
                  hitSlop={2}
                  accessibilityRole="button"
                  accessibilityLabel="Cycle preview"
                >
                  <Text style={styles.devCycleText}>
                    {devCycleIndex == null
                      ? "Preview"
                      : `${(devCycleIndex % DAILY_DIESEL_QUOTES.length) + 1}/${DAILY_DIESEL_QUOTES.length} · bg ${
                          (Math.floor(
                            devCycleIndex / DAILY_DIESEL_QUOTES.length,
                          ) %
                            BACKGROUNDS.length) +
                          1
                        }/${BACKGROUNDS.length}`}
                  </Text>
                  <ChevronRight size={14} color="#FFFFFF" strokeWidth={2.4} />
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.closeBtn,
                  { opacity: pressed ? 0.6 : 1 },
                ]}
                onPress={close}
                hitSlop={{ top: 12, bottom: 12, left: 4, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <X size={22} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>

          {/* Quote, anchored toward the bottom */}
          <Animated.View
            style={[
              styles.quoteBlock,
              {
                opacity: fade,
                transform: [
                  {
                    translateY: fade.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.label}>Today&apos;s Reflection</Text>
            <Text style={styles.quoteText}>“{quote.text}”</Text>
            <Text style={styles.author}>— {quote.author}</Text>
          </Animated.View>

          {/* Bottom CTA */}
          <View style={styles.cta}>
            {hasPro === null ? null : hasPro ? (
              <Pressable
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={goApp}
                accessibilityRole="button"
              >
                <Text style={styles.primaryBtnText}>Continue to app</Text>
              </Pressable>
            ) : (
              <View style={styles.upgradeWrap}>
                <Text style={styles.upgradeLead}>
                  Want access to the whole Daily Diesel course? 10 Modules, 300+ Videos, Plus Additional Resources.
                </Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { opacity: pressed ? 0.9 : 1 },
                  ]}
                  onPress={goPaywall}
                  accessibilityRole="button"
                  accessibilityLabel="See plans"
                >
                  <Sparkles size={18} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.primaryBtnText}>See plans</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    color: "#FFFFFF",
    fontFamily: AppFonts.headingBold,
    fontSize: 14,
    letterSpacing: 2,
    textTransform: "uppercase",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  devCycleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  devCycleText: {
    color: "#FFFFFF",
    fontFamily: AppFonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  quoteBlock: {
    marginBottom: 24,
  },
  label: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: AppFonts.bodyBold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 18,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  quoteText: {
    color: "#FFFFFF",
    fontFamily: AppFonts.headingBold,
    fontSize: 30,
    lineHeight: 40,
    marginBottom: 18,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  author: {
    color: "rgba(255,255,255,0.92)",
    fontFamily: AppFonts.bodyMedium,
    fontSize: 16,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  cta: {
    paddingTop: 8,
  },
  upgradeWrap: {
    alignItems: "center",
    gap: 14,
  },
  upgradeLead: {
    color: "#FFFFFF",
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: MAIN_PURPLE,
    paddingVertical: 17,
    borderRadius: 16,
    alignSelf: "stretch",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontFamily: AppFonts.bodyBold,
    fontSize: 16,
    letterSpacing: 0.4,
  },
});
