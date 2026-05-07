import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Activity,
  Apple,
  ArrowRight,
  Brain,
  Check,
  Heart,
  Moon,
  Quote,
  Sparkles,
  Sunrise,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line, Polyline } from "react-native-svg";

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 24;
const SLIDE_INNER = SCREEN_WIDTH - H_PADDING * 2;

type SlideId =
  | "welcome"
  | "growth"
  | "social"
  | "progress"
  | "goals"
  | "match"
  | "cta";

type Slide = {
  id: SlideId;
  key: string;
};

const SLIDES: Slide[] = [
  { id: "welcome", key: "welcome" },
  { id: "growth", key: "growth" },
  { id: "social", key: "social" },
  { id: "progress", key: "progress" },
  { id: "goals", key: "goals" },
  { id: "match", key: "match" },
  { id: "cta", key: "cta" },
];

type GoalOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  moduleSlug: string;
};

const GOALS: GoalOption[] = [
  { id: "sleep", label: "Sleep better", icon: Moon, iconColor: "#7C3AED", moduleSlug: "sleep" },
  { id: "mornings", label: "Better mornings", icon: Sunrise, iconColor: "#F59E0B", moduleSlug: "morning-routines" },
  { id: "energy", label: "More energy", icon: Zap, iconColor: "#10B981", moduleSlug: "energy-management" },
  { id: "focus", label: "Sharper focus", icon: Brain, iconColor: "#8B5CF6", moduleSlug: "mindfulness" },
  { id: "stress", label: "Less stress", icon: Heart, iconColor: "#EC4899", moduleSlug: "stress-management" },
  { id: "eat", label: "Eat better", icon: Apple, iconColor: "#EF4444", moduleSlug: "fuel-2-perform" },
  { id: "move", label: "Move more", icon: Activity, iconColor: "#0EA5E9", moduleSlug: "move-2-perform" },
  { id: "habits", label: "Build habits", icon: Target, iconColor: "#14B8A6", moduleSlug: "habits" },
];

const COLLAGE_IMAGE = require("@/assets/images/onboarding/modules-collage.png");

type FloatingCardData = {
  title: string;
  videoCount: number;
  guideCount: number;
  background: string;
  textColor: string;
  iconBg: string;
  icon: LucideIcon;
  iconColor: string;
  // Position as percentages of the parent container.
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  width: number;
  duration: number;
  delay: number;
  amplitude: number;
};

const FLOATING_CARDS: FloatingCardData[] = [
  {
    title: "Sleep",
    videoCount: 26,
    guideCount: 8,
    background: "#E5D9F2",
    textColor: "#6B5B8C",
    iconBg: "#FFFFFF",
    icon: Heart,
    iconColor: "#8B7AB8",
    top: "0%",
    left: "4%",
    width: 130,
    duration: 4000,
    delay: 0,
    amplitude: 6.4,
  },
  {
    title: "Fuel 2 Perform",
    videoCount: 31,
    guideCount: 16,
    background: "#FFDDD9",
    textColor: "#B85D5D",
    iconBg: "#FFFFFF",
    icon: Apple,
    iconColor: "#D97B7B",
    top: "-2%",
    left: "32%",
    width: 130,
    duration: 4500,
    delay: 250,
    amplitude: 7.2,
  },
  {
    title: "Recovery",
    videoCount: 19,
    guideCount: 9,
    background: "#DBE9F7",
    textColor: "#5278A8",
    iconBg: "#FFFFFF",
    icon: Heart,
    iconColor: "#7BA8C9",
    top: "2%",
    right: "4%",
    width: 130,
    duration: 3700,
    delay: 500,
    amplitude: 5.6,
  },
  {
    title: "Energy Management",
    videoCount: 17,
    guideCount: 10,
    background: "#D4F1E8",
    textColor: "#4A7D6F",
    iconBg: "#FFFFFF",
    icon: Zap,
    iconColor: "#5D9B8B",
    top: "44%",
    left: "2%",
    width: 132,
    duration: 4800,
    delay: 350,
    amplitude: 8,
  },
  {
    title: "Building Habits",
    videoCount: 28,
    guideCount: 13,
    background: "#DBF7EA",
    textColor: "#52997D",
    iconBg: "#FFFFFF",
    icon: Sunrise,
    iconColor: "#7BC9A8",
    top: "46%",
    right: "2%",
    width: 132,
    duration: 4200,
    delay: 150,
    amplitude: 6.4,
  },
  {
    title: "Morning Routines",
    videoCount: 13,
    guideCount: 12,
    background: "#FFF3DC",
    textColor: "#B8884D",
    iconBg: "#FFFFFF",
    icon: Sunrise,
    iconColor: "#D4A574",
    bottom: "1%",
    left: "4%",
    width: 130,
    duration: 4300,
    delay: 600,
    amplitude: 7.2,
  },
  {
    title: "Thinking 2 Perform",
    videoCount: 27,
    guideCount: 11,
    background: "#F7DBF0",
    textColor: "#A35D85",
    iconBg: "#FFFFFF",
    icon: Brain,
    iconColor: "#C97BA8",
    bottom: "-3%",
    left: "32%",
    width: 132,
    duration: 3800,
    delay: 100,
    amplitude: 5.6,
  },
  {
    title: "Stress Management",
    videoCount: 21,
    guideCount: 12,
    background: "#F7EADB",
    textColor: "#997D5C",
    iconBg: "#FFFFFF",
    icon: Zap,
    iconColor: "#C9A87B",
    bottom: "2%",
    right: "4%",
    width: 132,
    duration: 4700,
    delay: 450,
    amplitude: 7.2,
  },
];

function FloatingMiniCard({ data }: { data: FloatingCardData }) {
  const drift = useSharedValue(-data.amplitude);

  React.useEffect(() => {
    drift.value = withDelay(
      data.delay,
      withRepeat(
        withTiming(data.amplitude, {
          duration: data.duration,
          easing: Easing.inOut(Easing.quad),
        }),
        -1,
        true
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: drift.value }],
  }));

  const Icon = data.icon;
  const positionStyle = {
    top: data.top as `${number}%` | undefined,
    left: data.left as `${number}%` | undefined,
    right: data.right as `${number}%` | undefined,
    bottom: data.bottom as `${number}%` | undefined,
    width: data.width,
  };

  return (
    <Animated.View
      style={[
        floatingStyles.card,
        positionStyle,
        { backgroundColor: data.background },
        animatedStyle,
      ]}
    >
      <View style={[floatingStyles.iconWrap, { backgroundColor: data.iconBg }]}>
        <Icon size={16} color={data.iconColor} strokeWidth={2.5} />
      </View>
      <Text
        style={[floatingStyles.title, { color: data.textColor }]}
        numberOfLines={2}
      >
        {data.title}
      </Text>
      <Text
        style={[floatingStyles.sub, { color: data.textColor, opacity: 0.55 }]}
        numberOfLines={1}
      >
        {data.videoCount} videos · {data.guideCount} guides
      </Text>
    </Animated.View>
  );
}

const floatingStyles = StyleSheet.create({
  card: {
    position: "absolute",
    borderRadius: 14,
    padding: 10,
    opacity: 0.65,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontFamily: AppFonts.headingBold,
    fontSize: 12,
    lineHeight: 14,
    marginBottom: 6,
  },
  sub: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 9,
  },
});

const WAVE_POINTS: [number, number][] = [
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
const WAVE_POINTS_FLAT = WAVE_POINTS.map((p) => p.join(",")).join(" ");
const WAVE_PATH_LENGTH = WAVE_POINTS.reduce((acc, point, i) => {
  if (i === 0) return acc;
  const [x1, y1] = WAVE_POINTS[i - 1];
  const [x2, y2] = point;
  return acc + Math.hypot(x2 - x1, y2 - y1);
}, 0);

function ProgressWave({ active }: { active: boolean }) {
  const draw = useSharedValue(1);
  const captionOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (!active) return;
    draw.value = 1;
    captionOpacity.value = 0;
    draw.value = withDelay(
      200,
      withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) })
    );
    captionOpacity.value = withDelay(1500, withTiming(1, { duration: 400 }));
  // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values are stable refs
  }, [active]);

  const polylineProps = useAnimatedProps(() => ({
    strokeDashoffset: draw.value * WAVE_PATH_LENGTH,
  }));

  const captionStyle = useAnimatedStyle(() => ({
    opacity: captionOpacity.value,
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
        <AnimatedPolyline
          points={WAVE_POINTS_FLAT}
          fill="none"
          stroke={MAIN_PURPLE}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${WAVE_PATH_LENGTH}`}
          animatedProps={polylineProps}
        />
      </Svg>
      <Animated.View style={[waveStyles.captionWrap, captionStyle]}>
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
  const [progressActive, setProgressActive] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = useCallback((id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }, []);

  const currentSlideId = SLIDES[index]?.id;
  const isNextDisabled =
    currentSlideId === "goals" && selectedGoals.length === 0;

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
      setProgressActive(slide?.id === "progress");
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
            <ProgressWave active={progressActive} />
          </View>
        );
      case "goals":
        return (
          <View style={styles.slide}>
            <Text style={styles.slideTitle}>What do you want to improve?</Text>
            <Text style={styles.slideBody}>
              Pick everything that matters to you — we&apos;ll show which
              modules will help most.
            </Text>
            <View style={styles.goalsGrid}>
              {GOALS.map((g, i) => {
                const selected = selectedGoals.includes(g.id);
                const Icon = g.icon;
                return (
                  <Animated.View
                    key={g.id}
                    entering={FadeInUp.delay(i * 40).duration(320)}
                    style={styles.goalCellWrap}
                  >
                    <Pressable
                      onPress={() => toggleGoal(g.id)}
                      style={({ pressed }) => [
                        styles.goalCell,
                        selected && styles.goalCellSelected,
                        { opacity: pressed ? 0.85 : 1 },
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      accessibilityLabel={g.label}
                    >
                      <View
                        style={[
                          styles.goalIconWrap,
                          { backgroundColor: g.iconColor + "1F" },
                        ]}
                      >
                        <Icon size={20} color={g.iconColor} strokeWidth={2.2} />
                      </View>
                      <Text
                        style={[
                          styles.goalLabel,
                          selected && styles.goalLabelSelected,
                        ]}
                        numberOfLines={1}
                      >
                        {g.label}
                      </Text>
                      {selected && (
                        <View style={styles.goalCheck}>
                          <Check size={12} color="#FFFFFF" strokeWidth={3.5} />
                        </View>
                      )}
                    </Pressable>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        );
      case "match":
        return (
          <View style={styles.slide}>
            <Sparkles size={28} color={MAIN_PURPLE} strokeWidth={2} />
            <Text style={[styles.slideTitle, { marginTop: 12 }]}>
              {selectedGoals.length > 0
                ? "We've got you covered"
                : "10 focused modules inside"}
            </Text>
            <Text style={styles.slideBody}>
              {selectedGoals.length > 0
                ? `We have modules to help with ${selectedGoals.length === 1 ? "that area" : "all of your main problem areas"}.`
                : "Explore the full library — there's something here for every part of your day."}
            </Text>
            <Animated.View
              entering={FadeInUp.duration(450)}
              style={styles.collageImageWrap}
            >
              <View
                style={styles.floatingLayer}
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              >
                {FLOATING_CARDS.map((card) => (
                  <FloatingMiniCard key={card.title} data={card} />
                ))}
              </View>
              <Image
                source={COLLAGE_IMAGE}
                style={styles.collageImage}
                resizeMode="contain"
                accessibilityLabel="Preview of modules, sleep videos, and now playing screens"
              />
            </Animated.View>
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
        style={styles.list}
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
          disabled={isNextDisabled}
          accessibilityState={{ disabled: isNextDisabled }}
          style={({ pressed }) => [
            styles.primaryBtn,
            isNextDisabled && styles.primaryBtnDisabled,
            { opacity: isNextDisabled ? 1 : pressed ? 0.92 : 1 },
          ]}
        >
          <Text
            style={[
              styles.primaryBtnText,
              isNextDisabled && styles.primaryBtnTextDisabled,
            ]}
          >
            {index === SLIDES.length - 1 ? "Continue" : "Next"}
          </Text>
          <ArrowRight
            size={22}
            color={isNextDisabled ? "#C7C2D6" : "#FFFFFF"}
            strokeWidth={2.5}
          />
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
  list: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingTop: 12,
    paddingBottom: 24,
    justifyContent: "center",
    overflow: "hidden",
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
  primaryBtnDisabled: {
    backgroundColor: "#E5E1F1",
  },
  primaryBtnTextDisabled: {
    color: "#C7C2D6",
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  goalCellWrap: {
    width: "48%",
  },
  goalCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    position: "relative",
  },
  goalCellSelected: {
    borderColor: MAIN_PURPLE,
    backgroundColor: "#F4F0FB",
  },
  goalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  goalLabel: {
    flex: 1,
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: "#374151",
  },
  goalLabelSelected: {
    color: "#1F1248",
    fontFamily: AppFonts.bodyBold,
  },
  goalCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: MAIN_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
  collageImageWrap: {
    marginTop: 16,
    marginHorizontal: -H_PADDING,
    alignItems: "center",
    justifyContent: "center",
    height: 540,
    position: "relative",
  },
  floatingLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  collageImage: {
    width: "100%",
    height: 540,
    zIndex: 2,
  },
});
