import { APP_NAME, DAILY_QUOTE_BRAND, QUOTE_AUTHOR } from "@/constants/app-branding";
import { HomeGreetingArt } from "@/components/home-greeting-art";
import { MainTabHeader, ThemeToggle } from "@/components/main-tab-header";
import {
  MODULE_CARD_BACKGROUNDS,
  MODULE_CARD_BRIGHTEN_SCRIMS,
  MODULE_CARD_SCRIMS,
} from "@/components/module-card-art";
import { PremiumCrownButton } from "@/components/premium-crown-button";
import { PremiumStatusModal } from "@/components/premium-status-modal";
import { MODULE_ORDER, MODULE_THEMES } from "@/constants/module-themes";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_VIDEOS } from "@/data/module-videos";
import { MODULE_PDFS } from "@/data/pdf-assets";
import { getQuoteBackgroundOfTheDay, getQuoteOfTheDay } from "@/data/quotes";
import {
  cancelDailyReminder,
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
  getNextReminderDate,
  scheduleDailyReminder,
} from "@/services/notifications";
import { getAllProgress } from "@/services/progress";
import { requireVideoAccess } from "@/services/purchases";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ChevronRight, Flame, Maximize2 } from "lucide-react-native";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Svg, { Circle } from "react-native-svg";

const APP_LOGO = require("@/assets/images/icon-transparent.png");

interface CategoryCardProps {
  title: string;
  guideCount: number;
  icon: React.ReactNode;
  iconColor: string;
  textColor: string;
  /** True when the card art is dark enough for light foreground text. */
  lightForeground: boolean;
  slug: string;
  watchedCount: number;
  totalCount: number;
}

/** Modules whose background art is dark — keep light tinted text. */
const DARK_CARD_SLUGS = new Set<string>(["sleep"]);

/** Blend `hex` toward white — e.g. 0.2 = 20% lighter. */
function lightenHex(hex: string, amount: number): string {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * amount);
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

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

function greetingForNow(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 17) return "Good afternoon.";
  return "Good evening.";
}

type ContinueTarget = {
  moduleNumber: number;
  lessonNumber: number;
  slug: (typeof MODULE_ORDER)[number];
  categoryColor: string;
  videoId: string;
  videoTitle: string;
  videoUrl: string;
};

/**
 * Resume at the furthest relevant unwatched lesson.
 * Later modules win over earlier ones (e.g. Module 5 over Module 2), but we
 * only jump into a module if the user has started it or unlocked it by
 * finishing everything before it — so brand-new users land on Module 1.
 */
function getContinueTarget(
  progress: Record<string, string[]>,
): ContinueTarget | null {
  const previousComplete = (moduleIndex: number): boolean => {
    for (let j = 0; j < moduleIndex; j++) {
      const slug = MODULE_ORDER[j];
      const videos = MODULE_VIDEOS[slug] || [];
      const watched = progress[slug] || [];
      if (watched.length < videos.length) return false;
    }
    return true;
  };

  for (let i = MODULE_ORDER.length - 1; i >= 0; i--) {
    const slug = MODULE_ORDER[i];
    const videos = MODULE_VIDEOS[slug] || [];
    if (videos.length === 0) continue;
    const watchedSet = new Set(progress[slug] || []);
    const lessonIndex = videos.findIndex((video) => !watchedSet.has(video.id));
    if (lessonIndex < 0) continue;
    if (watchedSet.size === 0 && !previousComplete(i)) continue;

    const video = videos[lessonIndex];
    const theme = MODULE_THEMES[slug];
    return {
      moduleNumber: i + 1,
      lessonNumber: lessonIndex + 1,
      slug,
      categoryColor: theme.backgroundColor,
      videoId: video.id,
      videoTitle: video.title,
      videoUrl: video.url,
    };
  }
  return null;
}

/** Static copy — lives outside HomeScreen so it isn't recreated every render. */
const CARD_TITLES: Record<(typeof MODULE_ORDER)[number], string> = {
  sleep: "Sleep",
  "morning-routines": "Morning Routines",
  "energy-management": "Energy Management",
  mindfulness: "Creativity",
  "move-2-perform": "Recovery",
  "thinking-2-perform": "Thinking 2 Perform",
  recovery: "Move 2 Perform",
  "fuel-2-perform": "Fuel 2 Perform",
  "stress-management": "Most Authentic You",
  habits: "Building Habits",
};

/**
 * Module cards never depend on light/dark theme — only on progress.
 * Memoised so toggling theme does not re-render all 10 cards (that was
 * causing multi-frame jank on device).
 */
const CategoryCard = memo(function CategoryCard({
  title,
  guideCount,
  icon,
  iconColor,
  textColor,
  lightForeground,
  slug,
  watchedCount,
  totalCount,
}: CategoryCardProps) {
  const handlePress = () => {
    router.push({
      pathname: "/category/[slug]",
      params: { slug, title },
    });
  };

  const label =
    watchedCount === 0
      ? "Not started"
      : watchedCount >= totalCount
        ? "Complete!"
        : `${watchedCount} / ${totalCount} lessons`;

  const metaLine = `${totalCount} videos${
    guideCount > 0 ? ` • ${guideCount} guides` : ""
  }`;

  // Dark cards → light tint. Light cards → darker theme text for contrast.
  const titleColor = lightForeground
    ? lightenHex(iconColor, 0.78)
    : darkenHex(textColor, 0.22);
  const labelColor = lightForeground
    ? lightenHex(iconColor, 0.62)
    : darkenHex(textColor, 0.12);
  const barFillColor = lightForeground
    ? lightenHex(iconColor, 0.35)
    : darkenHex(iconColor, 0.18);
  const barTrackColor = lightForeground
    ? lightenHex(iconColor, 0.12)
    : lightenHex(iconColor, 0.45);
  const metaColor = lightForeground
    ? lightenHex(iconColor, 0.68)
    : darkenHex(textColor, 0.18);
  const chevronColor = lightForeground
    ? lightenHex(iconColor, 0.55)
    : darkenHex(iconColor, 0.12);

  const background = MODULE_CARD_BACKGROUNDS[slug];
  const sleepScrim = MODULE_CARD_SCRIMS[slug];
  const brightenScrim = MODULE_CARD_BRIGHTEN_SCRIMS[slug];

  return (
    <RectButton
      style={styles.card}
      underlayColor="rgba(255,255,255,0.12)"
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${label}. ${metaLine}`}
    >
      {/* Inner clip: Android won't round ImageBackground inside RectButton alone. */}
      <View style={styles.cardClip}>
        {background ? (
          <ImageBackground
            source={background}
            style={StyleSheet.absoluteFillObject}
            imageStyle={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              styles.cardImage,
              { backgroundColor: MAIN_PURPLE },
            ]}
          />
        )}
        {slug === "sleep" && sleepScrim ? (
          <LinearGradient
            colors={[sleepScrim[0], sleepScrim[1]]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFillObject, styles.cardImage]}
            pointerEvents="none"
          />
        ) : null}
        {slug !== "sleep" && brightenScrim ? (
          <LinearGradient
            colors={[brightenScrim[0], brightenScrim[1]]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFillObject, styles.cardImage]}
            pointerEvents="none"
          />
        ) : null}
        <View style={styles.cardBody} pointerEvents="none">
          <View style={styles.iconContainer}>{icon}</View>
          <Text
            style={[styles.cardTitle, { color: titleColor }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            style={[styles.cardProgressLabel, { color: labelColor }]}
            numberOfLines={1}
          >
            {label}
          </Text>
          <View
            style={[
              styles.cardProgressBarBg,
              { backgroundColor: barTrackColor },
            ]}
          >
            <View
              style={[
                styles.cardProgressBarFill,
                {
                  width: `${
                    totalCount > 0 ? (watchedCount / totalCount) * 100 : 0
                  }%`,
                  backgroundColor: barFillColor,
                },
              ]}
            />
          </View>
        </View>
        <View style={styles.cardBottomBar} pointerEvents="none">
          <Text
            style={[styles.cardBottomMeta, { color: metaColor }]}
            numberOfLines={1}
          >
            {metaLine}
          </Text>
          <ChevronRight size={16} color={chevronColor} strokeWidth={2.4} />
        </View>
      </View>
    </RectButton>
  );
});

const MODULE_CATEGORY_ROWS = MODULE_ORDER.map((slug) => {
  const theme = MODULE_THEMES[slug];
  const Icon = theme.Icon;
  return {
    title: CARD_TITLES[slug],
    slug,
    guideCount: (MODULE_PDFS[slug] ?? []).length,
    iconColor: theme.iconColor,
    textColor: theme.textColor,
    lightForeground: DARK_CARD_SLUGS.has(slug),
    icon: <Icon size={22} color={theme.iconColor} strokeWidth={2.4} />,
  };
});

export default function HomeScreen() {
  const { isDark } = useTheme();

  const [showPremiumStatus, setShowPremiumStatus] = useState(false);
  const [quoteDate, setQuoteDate] = useState(() => new Date());
  const dailyQuote = useMemo(() => getQuoteOfTheDay(quoteDate), [quoteDate]);
  const quoteBackground = useMemo(
    () => getQuoteBackgroundOfTheDay(quoteDate),
    [quoteDate],
  );
  const [progress, setProgress] = useState<Record<string, string[]>>({});
  const [dailyReminderOn, setDailyReminderOn] = useState(false);
  const [nextReminderTime, setNextReminderTime] = useState<string | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(() => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  });
  const pickerTimeRef = useRef(pickerTime);

  const refreshReminderState = useCallback(async () => {
    const next = await getNextReminderDate();
    setDailyReminderOn(!!next);
    setNextReminderTime(
      next
        ? next.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
        : null,
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      setQuoteDate(new Date());
      refreshReminderState();
      getAllProgress().then(setProgress);
    }, [refreshReminderState]),
  );

  const openDailyQuote = useCallback(() => {
    router.push("/daily-quote");
  }, []);

  const continueTarget = useMemo(
    () => getContinueTarget(progress),
    [progress],
  );

  const openContinueCourse = useCallback(async () => {
    if (!continueTarget) return;
    if (
      !(await requireVideoAccess(
        continueTarget.slug,
        continueTarget.videoId,
      ))
    ) {
      return;
    }
    router.push({
      pathname: "/video/[id]",
      params: {
        id: continueTarget.videoId,
        title: continueTarget.videoTitle,
        url: continueTarget.videoUrl,
        categoryColor: continueTarget.categoryColor,
        categorySlug: continueTarget.slug,
      },
    });
  }, [continueTarget]);

  React.useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);

    const timeout = setTimeout(() => {
      setQuoteDate(new Date());
    }, nextMidnight.getTime() - now.getTime());

    return () => clearTimeout(timeout);
  }, [quoteDate]);

  const scheduleAt = useCallback(
    async (hour: number, minute: number, label: string) => {
      await cancelDailyReminder();
      const id = await scheduleDailyReminder(hour, minute);
      await refreshReminderState();
      if (id) {
        Alert.alert("Reminder set", `Daily reminder is now at ${label}.`);
      }
    },
    [refreshReminderState],
  );

  const enableDailyReminder = useCallback(async () => {
    if (Platform.OS === "android") {
      const value = new Date();
      value.setHours(DEFAULT_REMINDER_HOUR, DEFAULT_REMINDER_MINUTE, 0, 0);
      DateTimePickerAndroid.open({
        value,
        mode: "time",
        onChange: (event, date) => {
          if (event.type === "set" && date) {
            const lbl = date.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            });
            void scheduleAt(date.getHours(), date.getMinutes(), lbl);
          }
        },
      });
      return;
    }
    const id = await scheduleDailyReminder();
    if (id) {
      await refreshReminderState();
      Alert.alert(
        "Daily reminder on",
        'You\'ll get a notification every day. Tap "Change time" to pick a time that suits you.',
      );
    }
  }, [refreshReminderState, scheduleAt]);

  const showChangeTimePicker = useCallback(() => {
    if (Platform.OS === "web") {
      Alert.alert("Change reminder time", "Pick a time", [
        { text: "9:00 AM", onPress: () => scheduleAt(9, 0, "9:00 AM") },
        { text: "12:00 PM", onPress: () => scheduleAt(12, 0, "12:00 PM") },
        { text: "6:00 PM", onPress: () => scheduleAt(18, 0, "6:00 PM") },
        { text: "Cancel", style: "cancel" as const },
      ]);
      return;
    }
    if (Platform.OS === "android") {
      getNextReminderDate().then((initialDate) => {
        const value = initialDate ?? new Date(new Date().setHours(9, 0, 0, 0));
        DateTimePickerAndroid.open({
          value,
          mode: "time",
          onChange: (event, date) => {
            if (event.type === "set" && date) {
              const lbl = date.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              });
              scheduleAt(date.getHours(), date.getMinutes(), lbl);
            }
          },
        });
      });
      return;
    }
    getNextReminderDate().then((d) => {
      if (d) {
        pickerTimeRef.current = d;
        setPickerTime(d);
      }
      setShowTimePicker(true);
    });
  }, [scheduleAt]);

  const confirmPickerTime = useCallback(async () => {
    setShowTimePicker(false);
    const time = pickerTimeRef.current;
    const hour = time.getHours();
    const minute = time.getMinutes();
    const label = time.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    await scheduleAt(hour, minute, label);
  }, [scheduleAt]);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.headerSection}>
        <MainTabHeader />
        <View style={styles.homeHeader}>
          <Image
            source={APP_LOGO}
            style={styles.homeLogo}
            resizeMode="contain"
            accessibilityLabel={`${APP_NAME} logo`}
          />
          <View style={styles.headerActions}>
            <View style={styles.crownButtonWrap}>
              <PremiumCrownButton
                onShowPremiumStatus={() => setShowPremiumStatus(true)}
              />
            </View>
            <ThemeToggle />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
      {/* Greeting + mountain art */}
      <View style={styles.greetingSection}>
        <View style={styles.greetingCopy}>
          <Text
            style={[styles.greetingTitle, isDark && styles.greetingTitleDark]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {greetingForNow()}
          </Text>
          <Text
            style={[
              styles.greetingSubtitle,
              isDark && styles.greetingSubtitleDark,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            Small daily actions. Peak performance.
          </Text>
        </View>
        <HomeGreetingArt isDark={isDark} style={styles.greetingArt} />
      </View>

      {/* Overall Progress + continue CTA */}
      {(() => {
        const allTotal = Object.values(MODULE_VIDEOS).reduce(
          (sum, vids) => sum + vids.length,
          0,
        );
        const allWatched = Object.values(progress).reduce(
          (sum, ids) => sum + ids.length,
          0,
        );
        const pct = allTotal > 0 ? allWatched / allTotal : 0;
        const gaugeSize = 84;
        const strokeWidth = 9;
        const radius = (gaugeSize - strokeWidth) / 2;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference * (1 - pct);
        return (
          <View
            style={[
              styles.overallProgressCard,
              isDark && styles.overallProgressCardDark,
            ]}
          >
            <View style={styles.overallProgressRow}>
              <View style={styles.gaugeContainer}>
                <Svg width={gaugeSize} height={gaugeSize}>
                  <Circle
                    cx={gaugeSize / 2}
                    cy={gaugeSize / 2}
                    r={radius}
                    stroke={isDark ? "#2A2A3E" : "#EDE9FE"}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={gaugeSize / 2}
                    cy={gaugeSize / 2}
                    r={radius}
                    stroke={MAIN_PURPLE}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    rotation="-90"
                    origin={`${gaugeSize / 2}, ${gaugeSize / 2}`}
                  />
                </Svg>
                <View style={styles.gaugePctWrap} pointerEvents="none">
                  <Text
                    style={[styles.gaugePctText, isDark && { color: "#ECEDEE" }]}
                  >
                    {Math.round(pct * 100)}%
                  </Text>
                  <Text
                    style={[
                      styles.gaugePctCaption,
                      isDark && styles.overallProgressCountDark,
                    ]}
                  >
                    Complete
                  </Text>
                </View>
              </View>
              <View style={styles.overallProgressInfo}>
                <Text
                  style={[
                    styles.overallProgressLabel,
                    isDark && styles.overallProgressLabelDark,
                  ]}
                >
                  Overall Progress
                </Text>
                <Text
                  style={[
                    styles.overallProgressCount,
                    isDark && styles.overallProgressCountDark,
                  ]}
                >
                  {allWatched} of {allTotal} videos watched
                </Text>
                <View
                  style={[
                    styles.overallProgressBarBg,
                    isDark && styles.overallProgressBarBgDark,
                  ]}
                >
                  <View
                    style={[
                      styles.overallProgressBarFill,
                      { width: `${Math.max(pct * 100, pct > 0 ? 4 : 0)}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
            {continueTarget ? (
              <View
                style={[
                  styles.continueCourseBlock,
                  isDark && styles.continueCourseBlockDark,
                ]}
              >
                <Text
                  style={[
                    styles.continueCourseLabel,
                    isDark && styles.continueCourseLabelDark,
                  ]}
                >
                  Continue your journey
                </Text>
                <RectButton
                  style={styles.continueCourseBtn}
                  underlayColor="rgba(255,255,255,0.16)"
                  onPress={openContinueCourse}
                  accessibilityRole="button"
                  accessibilityLabel={`Continue your journey. Module ${continueTarget.moduleNumber}, lesson ${continueTarget.lessonNumber}`}
                >
                  <View style={styles.continueCourseBtnInner} pointerEvents="none">
                    <Text style={styles.continueCourseBtnText} numberOfLines={1}>
                      Module {continueTarget.moduleNumber}, lesson{" "}
                      {continueTarget.lessonNumber}
                    </Text>
                    <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
                  </View>
                </RectButton>
              </View>
            ) : null}
          </View>
        );
      })()}

      {/* Daily quote card — scenic image (cover, no stretch), white text */}
      <View style={styles.dieselCardOuter}>
        <ImageBackground
          source={quoteBackground}
          style={styles.dieselImageBg}
          resizeMode="cover"
        >
          <LinearGradient
            colors={[
              "rgba(0,0,0,0.57)",
              "rgba(0,0,0,0.37)",
              "rgba(0,0,0,0.63)",
            ]}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.dieselCardContent}>
            <View style={styles.dieselTopBar}>
              <View style={styles.dieselHeader}>
                <View style={styles.dieselIconWrap}>
                  <Flame size={22} color="#fff" strokeWidth={2.5} />
                </View>
                <Text style={styles.dieselLabel}>{DAILY_QUOTE_BRAND}</Text>
              </View>
              <RectButton
                onPress={openDailyQuote}
                style={styles.dieselFullscreenBtn}
                underlayColor="rgba(255,255,255,0.12)"
                hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
                accessibilityRole="button"
                accessibilityLabel="View quote full screen"
              >
                <View pointerEvents="none">
                  <Maximize2 size={22} color="#FFFFFF" strokeWidth={2.2} />
                </View>
              </RectButton>
            </View>
            <View style={styles.dieselQuoteCenter}>
              <Text
                style={[
                  styles.dieselQuote,
                  dailyQuote.author === QUOTE_AUTHOR &&
                    styles.dieselQuoteNoAuthor,
                ]}
                numberOfLines={3}
              >
                &ldquo;{dailyQuote.text}&rdquo;
              </Text>
              {dailyQuote.author !== QUOTE_AUTHOR ? (
                <Text style={styles.dieselAuthor}>— {dailyQuote.author}</Text>
              ) : null}
            </View>
            {dailyReminderOn ? (
              <View style={styles.reminderRow}>
                <Text style={styles.reminderLabel}>
                  Daily reminder at {nextReminderTime ?? "…"}
                </Text>
                <Pressable
                  onPress={showChangeTimePicker}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text style={styles.reminderChange}>Change time</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={enableDailyReminder}
                style={({ pressed }) => [
                  styles.reminderCtaButton,
                  { opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Flame size={16} color="#fff" strokeWidth={2.5} />
                <Text style={styles.reminderCtaText}>Remind me daily</Text>
              </Pressable>
            )}
          </View>
        </ImageBackground>
      </View>

      {/* iOS Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <Pressable
          style={styles.timePickerOverlay}
          onPress={() => setShowTimePicker(false)}
        >
          <Pressable
            style={[styles.timePickerCard, isDark && styles.timePickerCardDark]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={[
                styles.timePickerTitle,
                isDark && styles.timePickerTitleDark,
              ]}
            >
              Daily reminder time
            </Text>
            <DateTimePicker
              value={pickerTime}
              mode="time"
              onChange={(_, date) => {
                if (date) {
                  pickerTimeRef.current = date;
                  setPickerTime(date);
                }
              }}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              themeVariant={isDark ? "dark" : "light"}
              textColor={isDark ? "#FFFFFF" : "#2C3E50"}
            />
            <View style={styles.timePickerActions}>
              <TouchableOpacity
                style={[styles.timePickerButton, styles.timePickerButtonCancel]}
                onPress={() => setShowTimePicker(false)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.timePickerButtonTextCancel,
                    isDark && { color: "#ECEDEE" },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timePickerButton, styles.timePickerButtonSet]}
                onPress={confirmPickerTime}
                activeOpacity={0.8}
              >
                <Text style={styles.timePickerButtonTextSet}>Set reminder</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <View style={styles.modulesTitleRow}>
        <Text style={[styles.modulesTitle, isDark && styles.modulesTitleDark]}>
          Modules
        </Text>
      </View>

      {/* Categories Grid */}
      <View style={styles.grid}>
        {MODULE_CATEGORY_ROWS.map((category) => {
          const totalCount = (MODULE_VIDEOS[category.slug] || []).length;
          const watchedCount = (progress[category.slug] || []).length;
          return (
            <CategoryCard
              key={category.slug}
              {...category}
              totalCount={totalCount}
              watchedCount={watchedCount}
            />
          );
        })}
      </View>
      </ScrollView>

      <PremiumStatusModal
        visible={showPremiumStatus}
        onClose={() => setShowPremiumStatus(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F6FA",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    overflow: "visible",
  },
  homeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  homeLogo: {
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  crownButtonWrap: {
    marginLeft: -10,
  },
  greetingSection: {
    position: "relative",
    marginTop: 4,
    marginBottom: 0,
    minHeight: 148,
    justifyContent: "center",
    overflow: "visible",
    zIndex: 0,
  },
  greetingCopy: {
    maxWidth: "62%",
    paddingRight: 8,
    zIndex: 2,
  },
  greetingTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontFamily: AppFonts.headingBold,
    color: "#1F2937",
    marginBottom: 4,
  },
  greetingTitleDark: {
    color: "#F3F4F6",
  },
  greetingSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: AppFonts.bodyRegular,
    color: "#6B7280",
    paddingRight: 4,
  },
  greetingSubtitleDark: {
    color: "#A1A1B5",
  },
  continueCourseBlock: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8E4F5",
    gap: 8,
  },
  continueCourseBlockDark: {
    borderTopColor: "#2A2A3E",
  },
  continueCourseLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: AppFonts.headingSemiBold,
    color: "#1F2937",
  },
  continueCourseLabelDark: {
    color: "#ECEDEE",
  },
  continueCourseBtn: {
    width: "100%",
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: MAIN_PURPLE,
    justifyContent: "center",
    paddingHorizontal: 16,
    shadowColor: "#4C3F8F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  continueCourseBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  continueCourseBtnText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: AppFonts.headingSemiBold,
    color: "#FFFFFF",
  },
  /** Bleed past ScrollView horizontal padding to the true screen edge. */
  greetingArt: {
    position: "absolute",
    right: -20,
    top: 0,
    bottom: -28,
    width: 230,
    zIndex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "stretch",
  },
  card: {
    width: "47.5%",
    borderRadius: 22,
    alignSelf: "stretch",
    minHeight: 210,
    // Shadow on the outer pressable; clipping happens on cardClip (Android).
    shadowColor: "#2C1850",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4,
    backgroundColor: "transparent",
  },
  cardClip: {
    flex: 1,
    minHeight: 210,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "#1A1A2E",
  },
  cardImage: {
    borderRadius: 22,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: AppFonts.headingSemiBold,
    lineHeight: 20,
    // Always reserve 2 lines so the progress bar lines up across the grid.
    minHeight: 40,
    marginBottom: 4,
  },
  cardProgressLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: AppFonts.bodyMedium,
    minHeight: 17,
    marginBottom: 8,
  },
  cardProgressBarBg: {
    height: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  cardProgressBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  cardBottomBar: {
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: "auto",
    minHeight: 36,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.28)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
  },
  cardBottomMeta: {
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
    fontFamily: AppFonts.bodyMedium,
  },

  modulesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 14,
    marginLeft: 2,
  },
  modulesTitle: {
    fontSize: 20,
    fontFamily: AppFonts.headingBold,
    color: "#1F2937",
  },
  modulesTitleDark: {
    color: "#ECEDEE",
  },
  overallProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: -28,
    marginBottom: 20,
    zIndex: 2,
    shadowColor: "#4C3F8F",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  overallProgressCardDark: {
    backgroundColor: "#1E1E32",
  },
  overallProgressRow: {
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
  overallProgressInfo: {
    flex: 1,
    gap: 6,
  },
  overallProgressLabel: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    color: "#1F2937",
  },
  overallProgressLabelDark: {
    color: "#ECEDEE",
  },
  overallProgressCount: {
    fontSize: 14,
    fontFamily: AppFonts.bodyRegular,
    color: "#8E8EA0",
  },
  overallProgressCountDark: {
    color: "#9090A8",
  },
  overallProgressBarBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EDE9FE",
    overflow: "hidden",
    marginTop: 4,
  },
  overallProgressBarBgDark: {
    backgroundColor: "#2A2A3E",
  },
  overallProgressBarFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: MAIN_PURPLE,
  },
  dieselCardOuter: {
    width: "100%",
    borderRadius: 20,
    marginBottom: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  dieselImageBg: {
    width: "100%",
  },
  dieselCardContent: {
    padding: 20,
    height: 300,
  },
  dieselTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  dieselHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  dieselFullscreenBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  dieselQuoteCenter: {
    flex: 1,
    justifyContent: "center",
  },
  dieselIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
  },
  dieselLabel: {
    fontSize: 18,
    fontFamily: AppFonts.headingBold,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  dieselQuote: {
    fontSize: 19,
    fontFamily: AppFonts.bodyBold,
    fontStyle: "italic",
    lineHeight: 28,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  dieselQuoteNoAuthor: {
    marginBottom: 0,
  },
  dieselAuthor: {
    fontSize: 13,
    fontFamily: AppFonts.bodyMedium,
    color: "rgba(255,255,255,0.88)",
    textAlign: "right",
    marginBottom: 0,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reminderLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    fontFamily: AppFonts.bodyRegular,
  },
  reminderChange: {
    fontSize: 13,
    color: "#FFFFFF",
    textDecorationLine: "underline",
    fontFamily: AppFonts.bodyMedium,
  },
  reminderCtaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    backgroundColor: MAIN_PURPLE,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "center",
  },
  reminderCtaText: {
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
    color: "#fff",
  },
  timePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  timePickerCard: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  timePickerCardDark: {
    backgroundColor: "#1E1E2E",
  },
  timePickerTitle: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    marginBottom: 16,
    color: "#2C3E50",
  },
  timePickerTitleDark: {
    color: "#ECEDEE",
  },
  timePickerActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
    justifyContent: "center",
  },
  timePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  timePickerButtonCancel: {
    backgroundColor: "transparent",
  },
  timePickerButtonSet: {
    backgroundColor: "#5D9B8B",
  },
  timePickerButtonTextCancel: {
    fontSize: 16,
    fontFamily: AppFonts.bodyMedium,
    color: "#2C3E50",
  },
  timePickerButtonTextSet: {
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
    color: "#fff",
  },
});
