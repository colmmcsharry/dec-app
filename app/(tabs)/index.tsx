import { APP_NAME, DAILY_QUOTE_BRAND, QUOTE_AUTHOR } from "@/constants/app-branding";
import { MainTabHeader, ThemeToggle } from "@/components/main-tab-header";
import { PremiumCrownButton } from "@/components/premium-crown-button";
import { PremiumStatusModal } from "@/components/premium-status-modal";
import { MODULE_ORDER, MODULE_THEMES } from "@/constants/module-themes";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_VIDEOS } from "@/data/module-videos";
import { getQuoteBackgroundOfTheDay, getQuoteOfTheDay } from "@/data/quotes";
import {
  cancelDailyReminder,
  DEFAULT_REMINDER_HOUR,
  DEFAULT_REMINDER_MINUTE,
  getNextReminderDate,
  scheduleDailyReminder,
} from "@/services/notifications";
import { getAllProgress } from "@/services/progress";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Crown, Flame, Maximize2 } from "lucide-react-native";
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
  backgroundColor: string;
  textColor: string;
  slug: string;
  watchedCount: number;
  totalCount: number;
}

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

/** Static copy — lives outside HomeScreen so it isn't recreated every render. */
const CARD_TITLES: Record<(typeof MODULE_ORDER)[number], string> = {
  sleep: "Sleep",
  "morning-routines": "Morning\nRoutines",
  "energy-management": "Energy\nManagement",
  mindfulness: "Creativity",
  "move-2-perform": "Recovery",
  "thinking-2-perform": "Thinking 2\nPerform",
  recovery: "Move 2\nPerform",
  "fuel-2-perform": "Fuel 2\nPerform",
  "stress-management": "Most Authentic\nYou",
  habits: "Building\nHabits",
};

const GUIDE_COUNTS: Record<(typeof MODULE_ORDER)[number], number> = {
  sleep: 8,
  "morning-routines": 12,
  "energy-management": 10,
  mindfulness: 10,
  "move-2-perform": 14,
  "thinking-2-perform": 11,
  recovery: 9,
  "fuel-2-perform": 15,
  "stress-management": 12,
  habits: 13,
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
  backgroundColor,
  textColor,
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

  const percent = totalCount > 0 ? watchedCount / totalCount : 0;
  const progressBarColor = lightenHex(textColor, 0.2);
  const label =
    watchedCount === 0
      ? "Not started"
      : watchedCount >= totalCount
        ? "Complete!"
        : `${watchedCount}/${totalCount}`;

  const metaLine = `${totalCount} videos${
    guideCount > 0 ? ` • ${guideCount} guides` : ""
  }`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text
          style={[styles.cardTitle, { color: textColor }]}
          numberOfLines={4}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
          {...(Platform.OS === "android"
            ? ({ textBreakStrategy: "simple" } as const)
            : {})}
        >
          {title}
        </Text>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.cardProgressBarBg}>
          <View
            style={[
              styles.cardProgressBarFill,
              { width: `${percent * 100}%`, backgroundColor: progressBarColor },
            ]}
          />
        </View>
        <Text
          style={[styles.cardProgressLabel, { color: textColor, opacity: 0.7 }]}
          numberOfLines={2}
        >
          {label}
        </Text>
        <Text
          style={[styles.cardSubtitle, { color: textColor, opacity: 0.7 }]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
        >
          {metaLine}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const MODULE_CATEGORY_ROWS = MODULE_ORDER.map((slug) => {
  const theme = MODULE_THEMES[slug];
  const Icon = theme.Icon;
  return {
    title: CARD_TITLES[slug],
    slug,
    guideCount: GUIDE_COUNTS[slug],
    icon: <Icon size={28} color={theme.iconColor} strokeWidth={2.5} />,
    backgroundColor: theme.backgroundColor,
    textColor: theme.textColor,
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

      {/* Modules Title */}
      <View style={styles.modulesTitleRow}>
        <Text style={[styles.modulesTitle, isDark && styles.modulesTitleDark]}>
          Modules
        </Text>
        <Crown
          size={18}
          color={isDark ? "#C4B5E8" : MAIN_PURPLE}
          strokeWidth={2.2}
          accessibilityLabel="Premium content"
        />
      </View>

      {/* Overall Progress */}
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
        const gaugeSize = 100;
        const strokeWidth = 10;
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
                    stroke={isDark ? "#2A2A3E" : "#E8E8EE"}
                    strokeWidth={strokeWidth}
                    fill="none"
                  />
                  <Circle
                    cx={gaugeSize / 2}
                    cy={gaugeSize / 2}
                    r={radius}
                    stroke="#5D9B8B"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    rotation="-90"
                    origin={`${gaugeSize / 2}, ${gaugeSize / 2}`}
                  />
                </Svg>
                <Text
                  style={[styles.gaugePctText, isDark && { color: "#ECEDEE" }]}
                >
                  {Math.round(pct * 100)}%
                </Text>
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
              </View>
            </View>
          </View>
        );
      })()}

      {/* Categories Grid */}
      <View style={styles.grid}>
        {MODULE_CATEGORY_ROWS.map((category, index) => {
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
    backgroundColor: "#FFFFFF",
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "stretch",
  },
  card: {
    width: "47%",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    justifyContent: "space-between",
    alignSelf: "stretch",
    minHeight: 168,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexGrow: 0,
    flexShrink: 1,
  },
  cardFooter: {
    marginTop: 10,
    gap: 5,
    paddingTop: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    lineHeight: 21,
    minHeight: 40,
    ...(Platform.OS === "web"
      ? ({
          wordBreak: "normal",
          overflowWrap: "normal",
          whiteSpace: "pre-line",
        } as object)
      : {}),
  },
  cardProgressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 0,
    marginBottom: 0,
  },
  cardProgressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardProgressLabel: {
    fontSize: 13,
    lineHeight: 17,
    fontFamily: AppFonts.bodyRegular,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: AppFonts.bodyRegular,
    ...(Platform.OS === "web"
      ? ({
          wordBreak: "normal",
          overflowWrap: "normal",
        } as object)
      : {}),
  },

  modulesTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 14,
    marginLeft: 4,
  },
  modulesTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
  },
  modulesTitleDark: {
    color: "#ECEDEE",
  },
  overallProgressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
  },
  gaugePctText: {
    position: "absolute",
    fontSize: 20,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
  },
  overallProgressInfo: {
    flex: 1,
    gap: 4,
  },
  overallProgressLabel: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
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
  dieselCardOuter: {
    width: "100%",
    borderRadius: 20,
    marginBottom: 30,
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
