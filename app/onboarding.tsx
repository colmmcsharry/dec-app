import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { EmailUpdatesSection } from "@/components/email-updates-section";
import { setOnboardingComplete } from "@/services/onboarding-storage";
import { hasProEntitlement } from "@/services/purchases";
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
  Sunrise,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
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
const TESTIMONIAL_CAROUSEL_GAP = 16;
const TESTIMONIAL_CAROUSEL_ITEM_WIDTH = SLIDE_INNER - TESTIMONIAL_CAROUSEL_GAP;
const TESTIMONIAL_CAROUSEL_STRIDE = SLIDE_INNER;
const TESTIMONIAL_CARD_HEIGHT = 272;
const TESTIMONIAL_CARD_RADIUS = 16;
const APP_LOGO = require("@/assets/images/icon-transparent.png");

type SlideId =
  | "welcome"
  | "growth"
  | "social"
  | "progress"
  | "goals"
  | "match"
  | "videos"
  | "workbooks"
  | "email";

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
  { id: "videos", key: "videos" },
  { id: "workbooks", key: "workbooks" },
  { id: "email", key: "email" },
];

const GOALS_SLIDE_INDEX = SLIDES.findIndex((s) => s.id === "goals");

type GoalOption = {
  id: string;
  label: string;
  icon: LucideIcon;
  iconColor: string;
  moduleSlug: string;
};

const GOALS: GoalOption[] = [
  {
    id: "sleep",
    label: "Sleep better",
    icon: Moon,
    iconColor: "#7C3AED",
    moduleSlug: "sleep",
  },
  {
    id: "mornings",
    label: "Better mornings",
    icon: Sunrise,
    iconColor: "#F59E0B",
    moduleSlug: "morning-routines",
  },
  {
    id: "energy",
    label: "More energy",
    icon: Zap,
    iconColor: "#10B981",
    moduleSlug: "energy-management",
  },
  {
    id: "focus",
    label: "Sharper focus",
    icon: Brain,
    iconColor: "#8B5CF6",
    moduleSlug: "mindfulness",
  },
  {
    id: "stress",
    label: "Less stress",
    icon: Heart,
    iconColor: "#EC4899",
    moduleSlug: "stress-management",
  },
  {
    id: "eat",
    label: "Eat better",
    icon: Apple,
    iconColor: "#EF4444",
    moduleSlug: "fuel-2-perform",
  },
  {
    id: "move",
    label: "Move more",
    icon: Activity,
    iconColor: "#0EA5E9",
    moduleSlug: "move-2-perform",
  },
  {
    id: "habits",
    label: "Build habits",
    icon: Target,
    iconColor: "#14B8A6",
    moduleSlug: "habits",
  },
];

const ONBOARDING_MODULES_IMAGE = require("@/assets/images/onboarding/modules.png");
const ONBOARDING_VIDEOS_IMAGE = require("@/assets/images/onboarding/videos.png");
const ONBOARDING_WORKBOOKS_IMAGE = require("@/assets/images/onboarding/workbooks.png");

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
      withTiming(0, { duration: 1400, easing: Easing.out(Easing.cubic) }),
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
    color: "#374151",
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
      "Would highly recommend to all professionals aiming at achieving a higher degree of wellbeing at work and in their personal lives.",
    name: "Lucyna Gutman-Grauer",
    role: "Head of employee training at Interel",
  },
  {
    quote:
      "Practical tips and simple exercises to improve your wellbeing across body, mind and soul. Declan is an engaging speaker and his positivity, energy, sense of humor, knowledge and enthusiasm for health and wellness topics are definitely inspiring.",
    name: "Stephanie Gerniers",
    role: "Digital Event Strategist, SWIFT",
  },
  {
    quote:
      "Declan is extremely well informed in his area of expertise. His lessons are not only informative, but fun. He offers lots of take away tips, including video and book recommendations.",
    name: "Karen Pritchard",
    role: "Corporate Social Responsibility at Kroll",
  },
];

const LOOPED_TESTIMONIALS = [
  TESTIMONIALS[TESTIMONIALS.length - 1]!,
  ...TESTIMONIALS,
  TESTIMONIALS[0]!,
];
const LOOPED_START_INDEX = 1;

function TestimonialCard({ testimonial }: { testimonial: (typeof TESTIMONIALS)[number] }) {
  return (
    <View style={styles.testimonialCard}>
      <View style={styles.testimonialCardBody}>
        <Text style={styles.testimonialQuoteMark} accessibilityElementsHidden>
          “
        </Text>
        <Text style={styles.testimonialQuoteText}>{testimonial.quote}</Text>
      </View>
      <View style={styles.testimonialCardFooter}>
        <View style={styles.testimonialAttribution}>
          <Text style={styles.testimonialName}>{testimonial.name}</Text>
          {testimonial.role ? (
            <Text style={styles.testimonialRole}>{testimonial.role}</Text>
          ) : null}
        </View>
        <Image
          source={APP_LOGO}
          style={styles.testimonialLogo}
          resizeMode="contain"
          accessibilityLabel="Peak Performance Code logo"
        />
      </View>
    </View>
  );
}

function OnboardingTestimonialCarousel() {
  const scrollRef = useRef<ScrollView>(null);
  const isJumpingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: TESTIMONIAL_CAROUSEL_STRIDE * LOOPED_START_INDEX,
        animated: false,
      });
    });
  }, []);

  const toLogicalIndex = (scrollIndex: number) => {
    if (scrollIndex === 0) return TESTIMONIALS.length - 1;
    if (scrollIndex === LOOPED_TESTIMONIALS.length - 1) return 0;
    return scrollIndex - 1;
  };

  const handleCarouselScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (isJumpingRef.current) return;

    const scrollIndex = Math.round(
      e.nativeEvent.contentOffset.x / TESTIMONIAL_CAROUSEL_STRIDE,
    );
    setActiveIndex(toLogicalIndex(scrollIndex));

    if (scrollIndex === 0) {
      isJumpingRef.current = true;
      scrollRef.current?.scrollTo({
        x: TESTIMONIAL_CAROUSEL_STRIDE * TESTIMONIALS.length,
        animated: false,
      });
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
      return;
    }

    if (scrollIndex === LOOPED_TESTIMONIALS.length - 1) {
      isJumpingRef.current = true;
      scrollRef.current?.scrollTo({
        x: TESTIMONIAL_CAROUSEL_STRIDE * LOOPED_START_INDEX,
        animated: false,
      });
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
    }
  };

  return (
    <View style={styles.testimonialCarouselWrap}>
      <View style={styles.testimonialCarouselViewport}>
        <ScrollView
          ref={scrollRef}
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={TESTIMONIAL_CAROUSEL_STRIDE}
          snapToAlignment="start"
          disableIntervalMomentum
          onMomentumScrollEnd={handleCarouselScrollEnd}
          onScrollEndDrag={handleCarouselScrollEnd}
          style={styles.testimonialCarouselScroll}
          contentContainerStyle={styles.testimonialCarouselContent}
        >
          {LOOPED_TESTIMONIALS.map((t, loopIndex) => (
            <View
              key={`${t.name}-${loopIndex}`}
              style={[
                styles.testimonialCarouselSlide,
                {
                  width: TESTIMONIAL_CAROUSEL_ITEM_WIDTH,
                  height: TESTIMONIAL_CARD_HEIGHT,
                  marginRight: TESTIMONIAL_CAROUSEL_GAP,
                },
              ]}
            >
              <TestimonialCard testimonial={t} />
            </View>
          ))}
        </ScrollView>
      </View>
      <View style={styles.testimonialCarouselDots}>
        {TESTIMONIALS.map((_, dotIndex) => (
          <View
            key={dotIndex}
            style={[
              styles.testimonialCarouselDot,
              dotIndex === activeIndex && styles.testimonialCarouselDotActive,
            ]}
          />
        ))}
      </View>
      <Text style={styles.testimonialCarouselHint}>Swipe for more</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [growthActive, setGrowthActive] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  useEffect(() => {
    if (isPreview) return;
    let cancelled = false;
    void (async () => {
      const pro = await hasProEntitlement();
      if (cancelled || !pro) return;
      void setOnboardingComplete();
      router.replace("/(tabs)");
    })();
    return () => {
      cancelled = true;
    };
  }, [isPreview, router]);

  const toggleGoal = useCallback((id: string) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );
  }, []);

  const currentSlideId = SLIDES[index]?.id;
  const isNextDisabled =
    currentSlideId === "goals" && selectedGoals.length === 0;

  const goPaywall = useCallback(() => {
    void (async () => {
      if (!isPreview) {
        const pro = await hasProEntitlement();
        if (pro) {
          void setOnboardingComplete();
          router.replace("/(tabs)");
          return;
        }
      }
      // Navigate first, persist later. AsyncStorage writes can take 500ms+ on
      // real devices (especially fresh installs) and awaiting that before
      // navigation makes the Continue button feel broken — users tap multiple
      // times. The paywall route also calls setOnboardingComplete() defensively
      // when its dismiss path runs, so this fire-and-forget is safe even if it
      // hasn't finished by the time the paywall is dismissed.
      router.replace({
        pathname: "/paywall-placeholder",
        params: isPreview ? { preview: "1" } : {},
      });
      if (!isPreview) {
        void setOnboardingComplete();
      }
    })();
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
      if (selectedGoals.length === 0 && i > GOALS_SLIDE_INDEX) return;
      setIndex(i);
      const slide = SLIDES[i];
      setGrowthActive(slide?.id === "growth");
      setProgressActive(slide?.id === "progress");
    },
    [selectedGoals.length],
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
            <View style={styles.slideContent}>
            <Animated.View
              entering={FadeInDown.duration(500).springify()}
              style={styles.heroIcon}
            >
              <Image
                source={APP_LOGO}
                style={styles.heroLogo}
                resizeMode="contain"
                accessibilityLabel="DEC app logo"
              />
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
          </View>
        );
      case "growth":
        return (
          <View style={styles.slide}>
            <View style={styles.slideContent}>
            <View style={styles.slideCopy}>
              <Text style={styles.slideTitle}>Momentum builds over time</Text>
              <Text style={styles.slideBody}>
                Users who stack small wins week after week report the biggest
                improvements in energy and focus
              </Text>
            </View>
            <View style={styles.slideVisual}>
              <GrowthBars active={growthActive} />
            </View>
            </View>
          </View>
        );
      case "social":
        return (
          <View style={styles.slide}>
            <View style={styles.slideContent}>
            <View style={styles.slideCopy}>
              <View style={styles.slideQuoteIcon}>
                <Quote size={28} color={MAIN_PURPLE} strokeWidth={2} />
              </View>
              <View
                style={[styles.slideTitleWithIcon, styles.slideTitleBelowIcon]}
              >
                <Text
                  style={[styles.slideTitle, styles.slideTitleBesideIcon]}
                  numberOfLines={4}
                >
                  Trusted by people who want more from their day
                </Text>
              </View>
            </View>
            <View style={styles.slideVisual}>
              <OnboardingTestimonialCarousel />
            </View>
            </View>
          </View>
        );
      case "progress":
        return (
          <View style={styles.slide}>
            <View style={styles.slideContent}>
            <View style={styles.slideCopy}>
              <Text style={styles.slideTitle}>See your progress add up</Text>
              <Text style={styles.slideBody}>
                Track modules completed, celebrate streaks, and spot where to
                double down next.
              </Text>
            </View>
            <View style={styles.slideVisual}>
              <ProgressWave active={progressActive} />
            </View>
            </View>
          </View>
        );
      case "goals":
        return (
          <View style={styles.slide}>
            <View style={styles.slideContent}>
            <View style={styles.slideCopy}>
              <Text style={styles.slideTitle}>
                What do you want to improve?
              </Text>
              <Text style={styles.slideBody}>
                Pick everything that matters to you
              </Text>
            </View>
            <View style={styles.slideVisual}>
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
                          <Icon
                            size={20}
                            color={g.iconColor}
                            strokeWidth={2.2}
                          />
                        </View>
                        <Text
                          style={[
                            styles.goalLabel,
                            selected && styles.goalLabelSelected,
                          ]}
                        >
                          {g.label}
                        </Text>
                        {selected && (
                          <View style={styles.goalCheck}>
                            <Check
                              size={12}
                              color="#FFFFFF"
                              strokeWidth={3.5}
                            />
                          </View>
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>
            </View>
            </View>
          </View>
        );
      case "match":
        return (
          <View style={styles.slide}>
            <View style={styles.slideContent}>
            <View style={styles.slideCopy}>
              <View style={styles.slideTitleWithIcon}>
                <Text style={[styles.slideTitle, styles.slideTitleBesideIcon]}>
                  {selectedGoals.length > 0
                    ? "We've got you covered"
                    : "10 focused modules inside"}
                </Text>
              </View>
              <Text style={styles.slideBody}>
                {selectedGoals.length > 0
                  ? `We have modules to help with ${selectedGoals.length === 1 ? "that area" : "all of your main problem areas"}.`
                  : "Something here for every part of your day."}
              </Text>
            </View>
            <View style={styles.slideVisual}>
              <Animated.View
                entering={FadeInUp.duration(450)}
                style={styles.collageImageWrap}
              >
                <Image
                  source={ONBOARDING_MODULES_IMAGE}
                  style={styles.collageImage}
                  resizeMode="contain"
                  accessibilityLabel="Preview of the modules grid"
                />
              </Animated.View>
            </View>
            </View>
          </View>
        );
      case "videos":
        return (
          <View style={styles.slide}>
            <View style={styles.slideContent}>
            <View style={styles.slideCopy}>
              <Text style={styles.slideTitle}>Video lessons</Text>
              <Text style={[styles.slideBody, styles.slideBodyBeforeVisual]}>
                Each module contains dozens of bite-sized educational videos,
                easy to digest and implement.
              </Text>
            </View>
            <View style={styles.slideVisual}>
              <Animated.View
                entering={FadeInUp.duration(450)}
                style={styles.collageImageWrap}
              >
                <Image
                  source={ONBOARDING_VIDEOS_IMAGE}
                  style={styles.collageImage}
                  resizeMode="contain"
                  accessibilityLabel="Preview of module video lessons"
                />
              </Animated.View>
            </View>
            </View>
          </View>
        );
      case "workbooks":
        return (
          <View style={styles.slide}>
            <View style={styles.slideContent}>
            <View style={styles.slideCopy}>
              <Text style={styles.slideTitle}>Workbooks</Text>
              <Text style={[styles.slideBody, styles.slideBodyBeforeVisual]}>
                Each module contains a workbook to solidify your learnings and
                keep you accountable, available in paper or on your phone.
              </Text>
            </View>
            <View style={styles.slideVisual}>
              <Animated.View
                entering={FadeInUp.duration(450)}
                style={styles.collageImageWrap}
              >
                <Image
                  source={ONBOARDING_WORKBOOKS_IMAGE}
                  style={styles.collageImage}
                  resizeMode="contain"
                  accessibilityLabel="Preview of a module workbook"
                />
              </Animated.View>
            </View>
            </View>
          </View>
        );
      case "email":
        return (
          <View style={styles.slide}>
            <EmailUpdatesSection source="onboarding" variant="slide" />
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
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
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
    color: "#4B5563",
  },
  list: {
    flex: 1,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingVertical: 12,
    justifyContent: "center",
    overflow: "hidden",
  },
  slideContent: {
    width: "100%",
  },
  slideCopy: {
    width: "100%",
  },
  slideVisual: {
    width: "100%",
    paddingTop: 8,
  },
  slideTitleWithIcon: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
  },
  slideTitleBesideIcon: {
    flex: 1,
    marginBottom: 12,
  },
  slideTitleBelowIcon: {
    marginTop: 10,
  },
  slideQuoteIcon: {
    alignSelf: "flex-start",
    transform: [{ scaleX: -1 }],
  },
  heroIcon: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  heroLogo: {
    width: 96,
    height: 96,
    borderRadius: 22,
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
    color: "#374151",
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
    color: "#374151",
    marginBottom: 8,
  },
  slideBodyBeforeVisual: {
    marginBottom: 16,
  },
  chartFoot: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    color: "#4B5563",
    marginTop: 12,
    textAlign: "center",
  },
  testimonialCarouselWrap: {
    width: "100%",
    alignItems: "center",
  },
  testimonialCarouselViewport: {
    width: SLIDE_INNER,
    height: TESTIMONIAL_CARD_HEIGHT,
  },
  testimonialCarouselScroll: {
    width: SLIDE_INNER,
    height: TESTIMONIAL_CARD_HEIGHT,
  },
  testimonialCarouselContent: {
    flexGrow: 0,
  },
  testimonialCarouselSlide: {
    height: TESTIMONIAL_CARD_HEIGHT,
  },
  testimonialCarouselDots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  testimonialCarouselDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  testimonialCarouselDotActive: {
    width: 20,
    backgroundColor: MAIN_PURPLE,
  },
  testimonialCarouselHint: {
    marginTop: 10,
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    color: "#4B5563",
    textAlign: "center",
  },
  testimonialCard: {
    width: "100%",
    height: TESTIMONIAL_CARD_HEIGHT,
    backgroundColor: "#1F1F35",
    borderRadius: TESTIMONIAL_CARD_RADIUS,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    overflow: "hidden",
    flexDirection: "column",
    ...(Platform.OS === "ios"
      ? { borderCurve: "continuous" as const }
      : null),
  },
  testimonialQuoteMark: {
    fontFamily: AppFonts.headingBold,
    fontSize: 44,
    lineHeight: 44,
    color: "#6E78A8",
    marginBottom: 4,
  },
  testimonialCardBody: {
    flex: 1,
    justifyContent: "center",
  },
  testimonialQuoteText: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
  testimonialCardFooter: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexShrink: 0,
  },
  testimonialAttribution: {
    flex: 1,
  },
  testimonialName: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
    color: "#A4AED0",
  },
  testimonialRole: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: "italic",
    color: "#A4AED0",
    marginTop: 2,
  },
  testimonialLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
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
    width: "100%",
  },
  goalCellWrap: {
    width: "48%",
  },
  goalCell: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingRight: 28,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    position: "relative",
    minHeight: 52,
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
    marginTop: 1,
  },
  goalLabel: {
    flex: 1,
    flexShrink: 1,
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
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
    marginTop: 0,
    marginHorizontal: -H_PADDING,
    alignItems: "center",
    justifyContent: "center",
    height: 432,
    position: "relative",
  },
  collageImage: {
    width: "80%",
    height: 432,
    alignSelf: "center",
  },
});
