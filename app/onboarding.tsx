import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowRight,
  Brain,
  Heart,
  Quote,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line, Polyline } from "react-native-svg";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 24;
const SLIDE_INNER = SCREEN_WIDTH - H_PADDING * 2;

type SlideId = "welcome" | "growth" | "social" | "progress" | "cta";

type Slide = {
  id: SlideId;
  key: string;
};

const SLIDES: Slide[] = [
  { id: "welcome", key: "welcome" },
  { id: "growth", key: "growth" },
  { id: "social", key: "social" },
  { id: "progress", key: "progress" },
  { id: "cta", key: "cta" },
];

function ProgressWave() {
  const points = [
    [0, 80],
    [40, 55],
    [80, 70],
    [120, 35],
    [160, 48],
    [200, 25],
    [240, 40],
    [280, 15],
    [320, 30],
  ];
  const flat = points.map((p) => p.join(",")).join(" ");
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withDelay(200, withTiming(1, { duration: 1400 }));
  }, [progress]);

  const lineStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <View style={waveStyles.wrap}>
      <Svg width={SLIDE_INNER} height={100} viewBox="0 0 320 100">
        <Line
          x1="0"
          y1="85"
          x2="320"
          y2="85"
          stroke="#E5E7EB"
          strokeWidth="2"
        />
        <Polyline
          points={flat}
          fill="none"
          stroke={MAIN_PURPLE}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Animated.View style={[waveStyles.captionWrap, lineStyle]}>
        <Text style={waveStyles.caption}>Consistency compounds</Text>
      </Animated.View>
    </View>
  );
}

const waveStyles = StyleSheet.create({
  wrap: { marginTop: 8, alignItems: "center" },
  captionWrap: { marginTop: 12 },
  caption: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    color: "#6B7280",
  },
});

const BAR_TARGETS = [0.35, 0.55, 0.45, 0.72, 0.68, 0.92];

function GrowthBars({ active }: { active: boolean }) {
  const h0 = useSharedValue(0);
  const h1 = useSharedValue(0);
  const h2 = useSharedValue(0);
  const h3 = useSharedValue(0);
  const h4 = useSharedValue(0);
  const h5 = useSharedValue(0);
  const bars = [h0, h1, h2, h3, h4, h5];

  // Bars are fixed SharedValue refs; only `active` should retrigger the entrance animation.
  React.useEffect(() => {
    if (!active) return;
    BAR_TARGETS.forEach((target, i) => {
      bars[i].value = withDelay(
        i * 80,
        withSpring(target, { damping: 14, stiffness: 120 }),
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- h0–h5 are stable SharedValues
  }, [active]);

  return (
    <View style={barStyles.row}>
      {bars.map((sv, i) => (
        <AnimatedBar key={i} heightSv={sv} />
      ))}
    </View>
  );
}

function AnimatedBar({ heightSv }: { heightSv: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    height: Math.max(8, heightSv.value * 120),
  }));
  return (
    <View style={barStyles.barBg}>
      <Animated.View style={[barStyles.barFill, style]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 130,
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 8,
  },
  barBg: {
    flex: 1,
    height: 120,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: MAIN_PURPLE,
    borderRadius: 8,
  },
});

const TESTIMONIALS = [
  {
    quote:
      "Finally something that connects sleep, energy, and mindset in one place.",
    name: "Alex M.",
    role: "Product lead",
  },
  {
    quote:
      "The modules are short enough for busy weeks but deep enough to actually change habits.",
    name: "Jordan K.",
    role: "Consultant",
  },
  {
    quote:
      "I use the daily quote and reminders — small nudges, big difference.",
    name: "Sam R.",
    role: "Athlete",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [growthActive, setGrowthActive] = useState(false);

  const goPaywall = useCallback(() => {
    router.push({
      pathname: "/paywall-placeholder",
      params: isPreview ? { preview: "1" } : {},
    });
  }, [router, isPreview]);

  const skip = useCallback(() => {
    if (isPreview) {
      router.back();
      return;
    }
    goPaywall();
  }, [goPaywall, isPreview, router]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const i = viewableItems[0]?.index;
      if (i == null) return;
      setIndex(i);
      const slide = SLIDES[i];
      setGrowthActive(slide?.id === "growth");
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 65,
  }).current;

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({
        index: index + 1,
        animated: true,
      });
    } else {
      goPaywall();
    }
  };

  const onScrollToIndexFailed = (info: {
    index: number;
    averageItemLength: number;
  }) => {
    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: info.index,
        animated: true,
      });
    }, 100);
  };

  const renderSlide = ({ item }: { item: Slide }) => {
    switch (item.id) {
      case "welcome":
        return (
          <View style={styles.slide}>
            <Animated.View
              entering={FadeInDown.duration(500).springify()}
              style={styles.heroIcon}
            >
              <Sparkles size={48} color={MAIN_PURPLE} strokeWidth={2} />
            </Animated.View>
            <Animated.Text
              entering={FadeIn.delay(120).duration(450)}
              style={styles.heroTitle}
            >
              Welcome to your{"\n"}performance journey
            </Animated.Text>
            <Text style={styles.heroBody}>
              Science-backed modules for sleep, energy, mindset, movement, and
              more — designed to fit real life.
            </Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}>
                <Brain size={16} color={MAIN_PURPLE} />
                <Text style={styles.pillText}>Mind</Text>
              </View>
              <View style={styles.pill}>
                <Heart size={16} color="#E11D48" />
                <Text style={styles.pillText}>Body</Text>
              </View>
              <View style={styles.pill}>
                <TrendingUp size={16} color="#059669" />
                <Text style={styles.pillText}>Soul</Text>
              </View>
            </View>
          </View>
        );
      case "growth":
        return (
          <View style={styles.slide}>
            <Text style={styles.slideTitle}>Momentum builds over time</Text>
            <Text style={styles.slideBody}>
              Users who stack small wins week after week report the biggest
              shifts in energy and focus — here&apos;s what that can look like.
            </Text>
            <GrowthBars active={growthActive} />
            <Text style={styles.chartFoot}>
              Illustrative — your path is personal
            </Text>
          </View>
        );
      case "social":
        return (
          <View style={styles.slide}>
            <Quote size={28} color={MAIN_PURPLE} strokeWidth={2} />
            <Text style={[styles.slideTitle, { marginTop: 12 }]}>
              Trusted by people who want more from their day
            </Text>
            <View style={styles.testimonialList}>
              {TESTIMONIALS.map((t, i) => (
                <Animated.View
                  key={t.name}
                  entering={FadeInUp.delay(i * 100).duration(400)}
                  style={styles.testimonialCard}
                >
                  <Text style={styles.stars}>★★★★★</Text>
                  <Text style={styles.quoteText}>&ldquo;{t.quote}&rdquo;</Text>
                  <Text style={styles.quoteMeta}>
                    {t.name} · {t.role}
                  </Text>
                </Animated.View>
              ))}
            </View>
          </View>
        );
      case "progress":
        return (
          <View style={styles.slide}>
            <Text style={styles.slideTitle}>See your progress add up</Text>
            <Text style={styles.slideBody}>
              Track modules completed, celebrate streaks, and spot where to
              double down next.
            </Text>
            <ProgressWave />
          </View>
        );
      case "cta":
        return (
          <View style={styles.slide}>
            <Text style={styles.slideTitle}>You&apos;re one step away</Text>
            <Text style={styles.slideBody}>
              Next, we&apos;ll show you how to unlock the full library and keep
              your momentum going.
            </Text>
            <View style={styles.ctaCard}>
              <Text style={styles.ctaCardTitle}>Inside the app</Text>
              <Text style={styles.ctaBullet}>✓ 10 focused performance modules</Text>
              <Text style={styles.ctaBullet}>✓ Video guides & digital workbooks</Text>
              <Text style={styles.ctaBullet}>✓ Daily Diesel quotes & reminders</Text>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={SLIDES[i].key}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>
        <Pressable onPress={skip} hitSlop={12}>
          <Text style={styles.skip}>{isPreview ? "Close" : "Skip"}</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderSlide}
        getItemLayout={(_, i) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * i,
          index: i,
        })}
        onScrollToIndexFailed={onScrollToIndexFailed}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const x = e.nativeEvent.contentOffset.x;
          setIndex(Math.round(x / SCREEN_WIDTH));
        }}
      />

      <View style={styles.footer}>
        <Pressable
          onPress={next}
          style={({ pressed }) => [
            styles.primaryBtn,
            { opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <Text style={styles.primaryBtnText}>
            {index === SLIDES.length - 1 ? "Continue" : "Next"}
          </Text>
          <ArrowRight size={22} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F6FC",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PADDING,
    paddingBottom: 8,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 22,
    backgroundColor: MAIN_PURPLE,
  },
  skip: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 16,
    color: "#6B7280",
  },
  slide: {
    width: SCREEN_WIDTH,
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#EDE8F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  heroTitle: {
    fontFamily: AppFonts.headingBold,
    fontSize: 30,
    lineHeight: 38,
    color: "#111827",
    marginBottom: 16,
  },
  heroBody: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 17,
    lineHeight: 26,
    color: "#4B5563",
    marginBottom: 24,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: "#374151",
  },
  slideTitle: {
    fontFamily: AppFonts.headingBold,
    fontSize: 26,
    lineHeight: 34,
    color: "#111827",
    marginBottom: 12,
  },
  slideBody: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
    marginBottom: 8,
  },
  chartFoot: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 12,
    textAlign: "center",
  },
  testimonialList: {
    gap: 12,
    marginTop: 16,
  },
  testimonialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stars: {
    fontSize: 14,
    color: "#FBBF24",
    marginBottom: 8,
    letterSpacing: 2,
  },
  quoteText: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
    marginBottom: 10,
  },
  quoteMeta: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 13,
    color: "#9CA3AF",
  },
  ctaCard: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  ctaCardTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 17,
    color: "#111827",
    marginBottom: 4,
  },
  ctaBullet: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
  },
  footer: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 20,
    paddingTop: 8,
  },
  primaryBtn: {
    backgroundColor: MAIN_PURPLE,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  primaryBtnText: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: "#FFFFFF",
  },
});
