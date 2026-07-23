import { EmailUpdatesSection } from "@/components/email-updates-section";
import {
  MODULE_HEADER_BACKGROUNDS,
} from "@/components/module-card-art";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/video-player";
import { MODULE_THEMES } from "@/constants/module-themes";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { COURSE_INTRO_VIDEO } from "@/data/course-intro-video";
import { MODULE_VIDEOS } from "@/data/module-videos";
import { setOnboardingComplete } from "@/services/onboarding-storage";
import { hasProEntitlement } from "@/services/purchases";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowRight,
  Brain,
  Check,
  Heart,
  Quote,
  TrendingUp,
  type LucideIcon,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
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
import { RectButton } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  runOnJS,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TOTAL_COURSE_VIDEOS = Object.values(MODULE_VIDEOS).reduce(
  (sum, vids) => sum + vids.length,
  0,
);
/** Demo fill for the onboarding progress preview (not real user data). */
const PROGRESS_DEMO_PCT = 0.38;

const WELCOME_PILLS = [
  { key: "mind", label: "Mind", Icon: Brain, color: MAIN_PURPLE },
  { key: "body", label: "Body", Icon: Heart, color: "#E11D48" },
  { key: "soul", label: "Soul", Icon: TrendingUp, color: "#059669" },
] as const;

const WELCOME_PILL_FADE_START = 400;
const WELCOME_PILL_FADE_STAGGER = 380;
const WELCOME_PILL_FADE_DURATION = 700;
const WELCOME_PILL_PULSE_GAP = 500;
/** Soft scale peak — keep subtle. */
const WELCOME_PILL_PULSE_SCALE = 1.04;
const WELCOME_PILL_PULSE_UP_MS = 1100;
const WELCOME_PILL_PULSE_DOWN_MS = 1100;
/** Pause after one pill settles before the next starts. */
const WELCOME_PILL_PULSE_BETWEEN_MS = 280;
/** Quiet pause after Soul before Mind pulses again. */
const WELCOME_PILL_PULSE_CYCLE_REST_MS = 2800;
const WELCOME_PILL_PULSE_SLOT_MS =
  WELCOME_PILL_PULSE_UP_MS +
  WELCOME_PILL_PULSE_DOWN_MS +
  WELCOME_PILL_PULSE_BETWEEN_MS;
const WELCOME_PILL_PULSE_CYCLE_MS =
  WELCOME_PILLS.length * WELCOME_PILL_PULSE_SLOT_MS +
  WELCOME_PILL_PULSE_CYCLE_REST_MS;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 24;
const SLIDE_INNER = SCREEN_WIDTH - H_PADDING * 2;
const COLLAGE_IMAGE_HEIGHT = 432;
const COLLAGE_IMAGE_WIDTH = Math.min(
  SLIDE_INNER * 0.8,
  COLLAGE_IMAGE_HEIGHT * (960 / 1860),
);
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
  | "courseIntro"
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
  { id: "courseIntro", key: "courseIntro" },
  { id: "email", key: "email" },
];

const GOALS_SLIDE_INDEX = SLIDES.findIndex((s) => s.id === "goals");
const COURSE_INTRO_SLIDE_INDEX = SLIDES.findIndex(
  (s) => s.id === "courseIntro",
);

type GoalOption = {
  id: string;
  label: string;
  moduleSlug: keyof typeof MODULE_THEMES;
};

const GOALS: GoalOption[] = [
  { id: "sleep", label: "Sleep better", moduleSlug: "sleep" },
  {
    id: "mornings",
    label: "Better mornings",
    moduleSlug: "morning-routines",
  },
  {
    id: "energy",
    label: "More energy",
    moduleSlug: "energy-management",
  },
  { id: "focus", label: "Sharper focus", moduleSlug: "mindfulness" },
  {
    id: "stress",
    label: "Less stress",
    moduleSlug: "stress-management",
  },
  { id: "eat", label: "Eat better", moduleSlug: "fuel-2-perform" },
  { id: "move", label: "Move more", moduleSlug: "move-2-perform" },
  { id: "habits", label: "Build habits", moduleSlug: "habits" },
];

/** Lighter wash than home cards — enough for dark type, art still readable. */
const GOAL_BRIGHTEN_SCRIM = [
  "rgba(255,255,255,0.28)",
  "rgba(255,255,255,0.42)",
] as const;

const ONBOARDING_MODULES_IMAGE = require("@/assets/images/onboarding/modules.png");
const ONBOARDING_VIDEOS_IMAGE = require("@/assets/images/onboarding/videos.png");
const ONBOARDING_WORKBOOKS_IMAGE = require("@/assets/images/onboarding/workbooks.png");
const ONBOARDING_WELCOME_MOUNTAINS = require("@/assets/images/onboarding/welcome-mountains.webp");

/** Blend `hex` toward black — e.g. 0.2 = 20% darker. */
function darkenHex(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel * (1 - amount));
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

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

function WelcomePill({
  label,
  Icon,
  color,
  index,
  active,
}: {
  label: string;
  Icon: LucideIcon;
  color: string;
  index: number;
  active: boolean;
}) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (!active) {
      cancelAnimation(opacity);
      cancelAnimation(scale);
      opacity.value = 0;
      scale.value = 1;
      return;
    }

    const fadeDelay =
      WELCOME_PILL_FADE_START + index * WELCOME_PILL_FADE_STAGGER;
    const pulseStart =
      WELCOME_PILL_FADE_START +
      (WELCOME_PILLS.length - 1) * WELCOME_PILL_FADE_STAGGER +
      WELCOME_PILL_FADE_DURATION +
      WELCOME_PILL_PULSE_GAP +
      index * WELCOME_PILL_PULSE_SLOT_MS;

    opacity.value = 0;
    scale.value = 1;
    opacity.value = withDelay(
      fadeDelay,
      withTiming(1, {
        duration: WELCOME_PILL_FADE_DURATION,
        easing: Easing.out(Easing.cubic),
      }),
    );
    scale.value = withDelay(
      pulseStart,
      withRepeat(
        withSequence(
          withTiming(WELCOME_PILL_PULSE_SCALE, {
            duration: WELCOME_PILL_PULSE_UP_MS,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1, {
            duration: WELCOME_PILL_PULSE_DOWN_MS,
            easing: Easing.inOut(Easing.sin),
          }),
          // Hold still while the other pills pulse + cycle rest.
          withTiming(1, {
            duration: WELCOME_PILL_PULSE_CYCLE_MS - WELCOME_PILL_PULSE_SLOT_MS,
          }),
        ),
        -1,
        false,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared values are stable refs
  }, [active, index]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <View style={styles.pill}>
        <View pointerEvents="none">
          <Icon size={16} color={color} />
        </View>
        <Text style={styles.pillText}>{label}</Text>
      </View>
    </Animated.View>
  );
}

function WelcomePills({ active }: { active: boolean }) {
  return (
    <View style={styles.pillRow}>
      {WELCOME_PILLS.map((pill, i) => (
        <WelcomePill
          key={pill.key}
          label={pill.label}
          Icon={pill.Icon}
          color={pill.color}
          index={i}
          active={active}
        />
      ))}
    </View>
  );
}

function GoalsPicker({
  selectedGoals,
  onToggle,
}: {
  selectedGoals: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View style={styles.goalsGrid}>
      {GOALS.map((g) => {
        const selected = selectedGoals.includes(g.id);
        const theme = MODULE_THEMES[g.moduleSlug];
        const Icon = theme.Icon;
        const background = MODULE_HEADER_BACKGROUNDS[g.moduleSlug];
        const isSleep = g.moduleSlug === "sleep";
        const labelColor = isSleep
          ? "#FFFFFF"
          : darkenHex(theme.textColor, 0.42);

        return (
          <View key={g.id} style={styles.goalCellWrap}>
            <RectButton
              onPress={() => onToggle(g.id)}
              underlayColor={
                isSleep ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)"
              }
              style={[styles.goalCell, selected && styles.goalCellSelected]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={g.label}
            >
              {/* Inner clip: Android won't round Image inside RectButton alone. */}
              <View style={styles.goalCellClip}>
                <Image
                  source={background}
                  style={styles.goalCellImage}
                  contentFit="cover"
                  pointerEvents="none"
                />
                {!isSleep ? (
                  <LinearGradient
                    colors={[GOAL_BRIGHTEN_SCRIM[0], GOAL_BRIGHTEN_SCRIM[1]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.goalCellScrim}
                    pointerEvents="none"
                  />
                ) : null}
                <View style={styles.goalCellInner} pointerEvents="none">
                  <Icon size={20} color={labelColor} strokeWidth={2.2} />
                  <Text style={[styles.goalCellLabel, { color: labelColor }]}>
                    {g.label}
                  </Text>
                </View>
                {selected ? (
                  <View style={styles.goalCheck} pointerEvents="none">
                    <Check size={12} color="#FFFFFF" strokeWidth={3.5} />
                  </View>
                ) : null}
              </View>
            </RectButton>
          </View>
        );
      })}
    </View>
  );
}

function OverallProgressPreview({ active }: { active: boolean }) {
  const gaugeSize = 84;
  const strokeWidth = 9;
  const radius = (gaugeSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const barTrackWidth = useSharedValue(0);
  const [displayPct, setDisplayPct] = useState(0);
  const [displayWatched, setDisplayWatched] = useState(0);

  React.useEffect(() => {
    if (!active) {
      progress.value = 0;
      setDisplayPct(0);
      setDisplayWatched(0);
      return;
    }
    progress.value = 0;
    progress.value = withDelay(
      180,
      withTiming(PROGRESS_DEMO_PCT, {
        duration: 1500,
        easing: Easing.out(Easing.cubic),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shared value is a stable ref
  }, [active]);

  useAnimatedReaction(
    () => Math.round(progress.value * 100),
    (pct, prev) => {
      if (pct === prev) return;
      runOnJS(setDisplayPct)(pct);
      runOnJS(setDisplayWatched)(Math.round((pct / 100) * TOTAL_COURSE_VIDEOS));
    },
  );

  const circleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const barStyle = useAnimatedStyle(() => {
    const track = barTrackWidth.value;
    if (track <= 0) return { width: 0 };
    return {
      width: Math.max(progress.value * track, progress.value > 0.001 ? 4 : 0),
    };
  });

  return (
    <View style={overallPreviewStyles.card}>
      <View style={overallPreviewStyles.row}>
        <View style={overallPreviewStyles.gaugeContainer}>
          <Svg width={gaugeSize} height={gaugeSize}>
            <Circle
              cx={gaugeSize / 2}
              cy={gaugeSize / 2}
              r={radius}
              stroke="#EDE9FE"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <AnimatedCircle
              cx={gaugeSize / 2}
              cy={gaugeSize / 2}
              r={radius}
              stroke={MAIN_PURPLE}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              animatedProps={circleProps}
              rotation="-90"
              origin={`${gaugeSize / 2}, ${gaugeSize / 2}`}
            />
          </Svg>
          <View style={overallPreviewStyles.gaugePctWrap} pointerEvents="none">
            <Text style={overallPreviewStyles.gaugePctText}>{displayPct}%</Text>
            <Text style={overallPreviewStyles.gaugePctCaption}>Complete</Text>
          </View>
        </View>
        <View style={overallPreviewStyles.info}>
          <Text style={overallPreviewStyles.label}>Overall Progress</Text>
          <Text style={overallPreviewStyles.count}>
            {displayWatched} of {TOTAL_COURSE_VIDEOS} videos watched
          </Text>
          <View
            style={overallPreviewStyles.barBg}
            onLayout={(e) => {
              barTrackWidth.value = e.nativeEvent.layout.width;
            }}
          >
            <Animated.View style={[overallPreviewStyles.barFill, barStyle]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const overallPreviewStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: 12,
    shadowColor: "#4C3F8F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  gaugeContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    width: 84,
    height: 84,
  },
  gaugePctWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  gaugePctText: {
    fontSize: 18,
    fontFamily: AppFonts.headingBold,
    color: "#1F2937",
  },
  gaugePctCaption: {
    fontSize: 10,
    fontFamily: AppFonts.bodyMedium,
    color: "#8E8EA0",
    marginTop: -1,
  },
  info: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    color: "#1F2937",
  },
  count: {
    fontSize: 14,
    fontFamily: AppFonts.bodyRegular,
    color: "#8E8EA0",
  },
  barBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EDE9FE",
    overflow: "hidden",
    marginTop: 4,
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: MAIN_PURPLE,
  },
});

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

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof TESTIMONIALS)[number];
}) {
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
          contentFit="contain"
          accessibilityLabel="Peak Performance Code logo"
        />
      </View>
    </View>
  );
}

function OnboardingTestimonialCarousel({ active }: { active: boolean }) {
  const scrollRef = useRef<ScrollView>(null);
  const isJumpingRef = useRef(false);
  const scrollIndexRef = useRef(LOOPED_START_INDEX);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    requestAnimationFrame(() => {
      scrollIndexRef.current = LOOPED_START_INDEX;
      scrollRef.current?.scrollTo({
        x: TESTIMONIAL_CAROUSEL_STRIDE * LOOPED_START_INDEX,
        animated: false,
      });
    });
  }, []);

  useEffect(() => {
    if (!active || !autoplay) return;

    const id = setInterval(() => {
      if (isJumpingRef.current) return;
      const nextIndex = scrollIndexRef.current + 1;
      scrollIndexRef.current = nextIndex;
      scrollRef.current?.scrollTo({
        x: TESTIMONIAL_CAROUSEL_STRIDE * nextIndex,
        animated: true,
      });
    }, 2000);

    return () => clearInterval(id);
  }, [active, autoplay]);

  const toLogicalIndex = (scrollIndex: number) => {
    if (scrollIndex === 0) return TESTIMONIALS.length - 1;
    if (scrollIndex === LOOPED_TESTIMONIALS.length - 1) return 0;
    return scrollIndex - 1;
  };

  const handleCarouselScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    if (isJumpingRef.current) return;

    let scrollIndex = Math.round(
      e.nativeEvent.contentOffset.x / TESTIMONIAL_CAROUSEL_STRIDE,
    );
    setActiveIndex(toLogicalIndex(scrollIndex));

    if (scrollIndex === 0) {
      isJumpingRef.current = true;
      scrollIndex = TESTIMONIALS.length;
      scrollIndexRef.current = scrollIndex;
      scrollRef.current?.scrollTo({
        x: TESTIMONIAL_CAROUSEL_STRIDE * scrollIndex,
        animated: false,
      });
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
      return;
    }

    if (scrollIndex === LOOPED_TESTIMONIALS.length - 1) {
      isJumpingRef.current = true;
      scrollIndex = LOOPED_START_INDEX;
      scrollIndexRef.current = scrollIndex;
      scrollRef.current?.scrollTo({
        x: TESTIMONIAL_CAROUSEL_STRIDE * scrollIndex,
        animated: false,
      });
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
      return;
    }

    scrollIndexRef.current = scrollIndex;
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
          onScrollBeginDrag={() => setAutoplay(false)}
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
      <Text style={styles.testimonialCarouselHint}>Swipe to change</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";
  const listRef = useRef<FlatList>(null);
  const courseIntroPlayerRef = useRef<VideoPlayerHandle>(null);
  const [index, setIndex] = useState(0);
  const [growthActive, setGrowthActive] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const [welcomeActive, setWelcomeActive] = useState(true);
  const [socialActive, setSocialActive] = useState(false);
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

  // Warm the course-intro poster as soon as onboarding opens.
  useEffect(() => {
    if (COURSE_INTRO_VIDEO.thumbnail) {
      void Image.prefetch(COURSE_INTRO_VIDEO.thumbnail);
    }
  }, []);

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

  const stopCourseIntroVideo = useCallback(() => {
    courseIntroPlayerRef.current?.pause();
  }, []);

  const skip = useCallback(() => {
    stopCourseIntroVideo();
    if (isPreview) {
      router.back();
      return;
    }
    goPaywall();
  }, [goPaywall, isPreview, router, stopCourseIntroVideo]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const i = viewableItems[0]?.index;
      if (i == null) return;
      if (selectedGoals.length === 0 && i > GOALS_SLIDE_INDEX) return;
      if (i !== COURSE_INTRO_SLIDE_INDEX) {
        courseIntroPlayerRef.current?.pause();
      }
      setIndex(i);
      const slide = SLIDES[i];
      setWelcomeActive(slide?.id === "welcome");
      setGrowthActive(slide?.id === "growth");
      setSocialActive(slide?.id === "social");
      setProgressActive(slide?.id === "progress");
    },
    [selectedGoals.length],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 65,
  }).current;

  const next = () => {
    if (SLIDES[index]?.id === "courseIntro") {
      stopCourseIntroVideo();
    }
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
                  contentFit="contain"
                  accessibilityLabel="DEC app logo"
                />
              </Animated.View>
              <Animated.Text
                entering={FadeIn.delay(120).duration(450)}
                style={styles.heroTitle}
              >
                Welcome to your <Text style={styles.heroTitlePeak}>peak</Text>{" "}
                performance journey
              </Animated.Text>
              <WelcomePills active={welcomeActive} />
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
                  style={[
                    styles.slideTitleWithIcon,
                    styles.slideTitleBelowIcon,
                  ]}
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
                <OnboardingTestimonialCarousel active={socialActive} />
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
                <OverallProgressPreview active={progressActive} />
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
                <Text style={styles.slideTitle}>What do you want to improve?</Text>
                <Text style={styles.slideBody}>Select all that apply</Text>
              </View>
              <View style={styles.slideVisual}>
                <GoalsPicker
                  selectedGoals={selectedGoals}
                  onToggle={toggleGoal}
                />
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
                  <Text
                    style={[styles.slideTitle, styles.slideTitleBesideIcon]}
                  >
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
                    contentFit="contain"
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
                    contentFit="contain"
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
                  keep you accountable
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
                    contentFit="contain"
                    accessibilityLabel="Preview of a module workbook"
                  />
                </Animated.View>
              </View>
            </View>
          </View>
        );
      case "courseIntro":
        return (
          <View style={styles.slide}>
            <View style={styles.slideContent}>
              <View style={styles.slideCopy}>
                <Text style={styles.slideTitle}>
                  {COURSE_INTRO_VIDEO.title}
                </Text>
                <Text style={[styles.slideBody, styles.slideBodyBeforeVisual]}>
                  Tap for a welcome from coach Declan
                </Text>
              </View>
              <View style={styles.slideVisual}>
                <Animated.View
                  entering={FadeInUp.duration(450)}
                  style={styles.courseIntroPlayerWrap}
                >
                  {/* Keep mounted so Vimeo can warm while earlier slides are shown. */}
                  <VideoPlayer
                    ref={courseIntroPlayerRef}
                    videoUrl={COURSE_INTRO_VIDEO.url}
                    title={COURSE_INTRO_VIDEO.title}
                    posterUrl={COURSE_INTRO_VIDEO.thumbnail}
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
      {index === 0 ? (
        <View style={styles.welcomeMountainsBackdrop} pointerEvents="none">
          <Image
            source={ONBOARDING_WELCOME_MOUNTAINS}
            style={styles.welcomeMountains}
            contentFit="cover"
            priority="high"
            cachePolicy="memory-disk"
            accessibilityLabel="Mountain landscape illustration"
          />
        </View>
      ) : null}

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
        // Mount every slide up front so the course-intro WebView preloads
        // before the user reaches it (avoids a blank second on that slide).
        initialNumToRender={SLIDES.length}
        maxToRenderPerBatch={SLIDES.length}
        windowSize={SLIDES.length}
        removeClippedSubviews={false}
        getItemLayout={(_, i) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * i,
          index: i,
        })}
        onScrollToIndexFailed={onScrollToIndexFailed}
      />

      <View style={[styles.footer, index === 0 && styles.footerOverMountains]}>
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
  welcomeMountainsBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    // Sit a bit above the Next label so the button still overlaps the art.
    bottom: 66,
    height: Math.min(300, Math.round(SCREEN_WIDTH * 0.62)),
    zIndex: 0,
    overflow: "hidden",
  },
  welcomeMountains: {
    width: "100%",
    height: "100%",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: H_PADDING,
    paddingBottom: 8,
    zIndex: 2,
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
    zIndex: 1,
    backgroundColor: "transparent",
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: H_PADDING,
    paddingVertical: 12,
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: "transparent",
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
    borderRadius: 16,
    borderWidth: 2,
    // Match page bg so unselected keeps the same outer radius/geometry as selected.
    borderColor: "#F8F6FC",
    backgroundColor: "transparent",
  },
  goalCellSelected: {
    borderColor: MAIN_PURPLE,
  },
  goalCellClip: {
    minHeight: 72,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#1A1A2E",
    position: "relative",
  },
  goalCellImage: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  goalCellScrim: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
  },
  goalCellInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    paddingRight: 28,
    minHeight: 72,
  },
  goalCellLabel: {
    flex: 1,
    flexShrink: 1,
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 19,
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
  heroTitlePeak: {
    color: MAIN_PURPLE,
    fontFamily: AppFonts.headingBold,
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
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
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
    zIndex: 2,
  },
  footerOverMountains: {
    backgroundColor: "transparent",
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
  collageImageWrap: {
    height: COLLAGE_IMAGE_HEIGHT,
    // Break out of slide padding and center against the full screen width.
    width: SCREEN_WIDTH,
    marginLeft: -H_PADDING,
    position: "relative",
  },
  collageImage: {
    // Fixed box so all three mockups share identical on-screen size
    // (assets are normalized to the same 960×1860 canvas).
    position: "absolute",
    top: 0,
    height: COLLAGE_IMAGE_HEIGHT,
    width: COLLAGE_IMAGE_WIDTH,
    left: (SCREEN_WIDTH - COLLAGE_IMAGE_WIDTH) / 2,
  },
  courseIntroPlayerWrap: {
    width: "100%",
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#000",
  },
});
