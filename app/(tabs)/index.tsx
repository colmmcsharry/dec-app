import { QuoteDetailModal } from "@/components/quote-detail-modal";
import { AppFonts } from "@/constants/theme";
import { useOpenQuoteFromNotification } from "@/context/open-quote-from-notification";
import { useTheme } from "@/context/theme-context";
import { MODULE_VIDEOS } from "@/data/module-videos";
import { getQuoteOfTheDay } from "@/data/quotes";
import { getAllProgress } from "@/services/progress";
import {
  cancelDailyReminder,
  getNextReminderDate,
  requestNotificationPermission,
  scheduleDailyReminder,
} from "@/services/notifications";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import {
  Apple,
  Brain,
  Dumbbell,
  Flame,
  Heart,
  Moon,
  Sun,
  Sunrise,
  Zap,
} from "lucide-react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

const CategoryCard = ({
  title,
  guideCount,
  icon,
  backgroundColor,
  textColor,
  slug,
  watchedCount,
  totalCount,
}: CategoryCardProps) => {
  const handlePress = () => {
    router.push({
      pathname: "/category/[slug]",
      params: { slug, title },
    });
  };

  const percent = totalCount > 0 ? watchedCount / totalCount : 0;
  const label =
    watchedCount === 0
      ? "Not started"
      : watchedCount >= totalCount
        ? "Complete!"
        : `${watchedCount}/${totalCount}`;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }]}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={[styles.cardTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.cardProgressBarBg}>
        <View
          style={[styles.cardProgressBarFill, { width: `${percent * 100}%` }]}
        />
      </View>
      <Text
        style={[styles.cardProgressLabel, { color: textColor, opacity: 0.7 }]}
      >
        {label}
      </Text>
      <Text style={[styles.cardSubtitle, { color: textColor, opacity: 0.7 }]}>
        {totalCount} videos{guideCount > 0 ? ` • ${guideCount} guides` : ""}
      </Text>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const { isDark, toggleTheme } = useTheme();
  const { consumeOpenQuote } = useOpenQuoteFromNotification();

  const today = useMemo(() => new Date(), []);
  const dailyQuote = useMemo(() => getQuoteOfTheDay(today), [today]);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
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
      refreshReminderState();
      getAllProgress().then(setProgress);
      if (consumeOpenQuote()) setShowQuoteModal(true);
    }, [refreshReminderState, consumeOpenQuote]),
  );

  const scheduleAt = useCallback(
    async (hour: number, minute: number, label: string) => {
      await cancelDailyReminder();
      const id = await scheduleDailyReminder(hour, minute);
      if (id) {
        setDailyReminderOn(true);
        setNextReminderTime(label);
        Alert.alert("Reminder set", `Daily reminder is now at ${label}.`);
      }
    },
    [],
  );

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

  const enableDailyReminder = useCallback(async () => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        "Notifications off",
        "Enable notifications in your device Settings to get daily reminders.",
      );
      return;
    }
    if (Platform.OS === "android") {
      const value = new Date();
      value.setHours(9, 0, 0, 0);
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
      return;
    }
    const defaultTime = new Date(new Date().setHours(9, 0, 0, 0));
    pickerTimeRef.current = defaultTime;
    setPickerTime(defaultTime);
    setShowTimePicker(true);
  }, [scheduleAt]);

  const categories = [
    {
      title: "Sleep",
      slug: "sleep",
      guideCount: 8,
      icon: <Heart size={28} color="#8B7AB8" strokeWidth={2.5} />,
      backgroundColor: "#E5D9F2",
      textColor: "#6B5B8C",
    },
    {
      title: "Morning\nRoutines",
      slug: "morning-routines",
      guideCount: 12,
      icon: <Sunrise size={28} color="#D4A574" strokeWidth={2.5} />,
      backgroundColor: "#FFF3DC",
      textColor: "#B8884D",
    },
    {
      title: "Energy\nManagement",
      slug: "energy-management",
      guideCount: 10,
      icon: <Zap size={28} color="#5D9B8B" strokeWidth={2.5} />,
      backgroundColor: "#D4F1E8",
      textColor: "#4A7D6F",
    },
    {
      title: "Fuel 2 Perform",
      slug: "fuel-2-perform",
      guideCount: 15,
      icon: <Apple size={28} color="#D97B7B" strokeWidth={2.5} />,
      backgroundColor: "#FFDDD9",
      textColor: "#B85D5D",
    },
    {
      title: "Move 2\nPerform",
      slug: "move-2-perform",
      guideCount: 14,
      icon: <Dumbbell size={28} color="#6B9BD1" strokeWidth={2.5} />,
      backgroundColor: "#D9E9F7",
      textColor: "#5278A8",
    },
    {
      title: "Thinking 2\nPerform",
      slug: "thinking-2-perform",
      guideCount: 11,
      icon: <Brain size={28} color="#C97BA8" strokeWidth={2.5} />,
      backgroundColor: "#F7DBF0",
      textColor: "#A35D85",
    },
    {
      title: "Recovery",
      slug: "recovery",
      guideCount: 9,
      icon: <Heart size={28} color="#7BA8C9" strokeWidth={2.5} />,
      backgroundColor: "#DBE9F7",
      textColor: "#5278A8",
    },
    {
      title: "Mindfulness",
      slug: "mindfulness",
      guideCount: 10,
      icon: <Brain size={28} color="#A87BC9" strokeWidth={2.5} />,
      backgroundColor: "#EADBF7",
      textColor: "#7B5299",
    },
    {
      title: "Stress\nManagement",
      slug: "stress-management",
      guideCount: 12,
      icon: <Zap size={28} color="#C9A87B" strokeWidth={2.5} />,
      backgroundColor: "#F7EADB",
      textColor: "#997D5C",
    },
    {
      title: "Building\nHabits",
      slug: "habits",
      guideCount: 13,
      icon: <Sunrise size={28} color="#7BC9A8" strokeWidth={2.5} />,
      backgroundColor: "#DBF7EA",
      textColor: "#52997D",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.welcomeText, isDark && styles.welcomeTextDark]}>
            Welcome Back, Declan
          </Text>
          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.themeToggle, isDark && styles.themeToggleDark]}
            activeOpacity={0.7}
          >
            {isDark ? (
              <Sun size={20} color="#FDB813" strokeWidth={2.5} />
            ) : (
              <Moon size={20} color="#6B5B8C" strokeWidth={2.5} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={[styles.mainTitle, isDark && styles.mainTitleDark]}>
          Mind • Body • Soul
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          Your holistic journey to peak performance
        </Text>
      </View>

      {/* Daily Diesel Quote Card */}
      <Pressable
        style={[styles.dieselCard, isDark && styles.dieselCardDark]}
        onPress={() => setShowQuoteModal(true)}
      >
        <View style={styles.dieselHeader}>
          <View style={styles.dieselIconWrap}>
            <Flame size={22} color="#fff" strokeWidth={2.5} />
          </View>
          <Text style={[styles.dieselLabel, isDark && styles.dieselLabelDark]}>
            Daily Diesel
          </Text>
        </View>
        <Text
          style={[styles.dieselQuote, isDark && styles.dieselQuoteDark]}
          numberOfLines={3}
        >
          "{dailyQuote.text}"
        </Text>
        <Text style={[styles.dieselAuthor, isDark && styles.dieselAuthorDark]}>
          — {dailyQuote.author}
        </Text>
        <Pressable
          onPress={() => setShowQuoteModal(true)}
          style={({ pressed }) => [
            styles.readQuoteButton,
            isDark && styles.readQuoteButtonDark,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text
            style={[styles.readQuoteText, isDark && styles.readQuoteTextDark]}
          >
            Read full quote
          </Text>
        </Pressable>
        {dailyReminderOn ? (
          <View style={styles.reminderRow}>
            <Text
              style={[styles.reminderLabel, isDark && styles.reminderLabelDark]}
            >
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
      </Pressable>

      <QuoteDetailModal
        visible={showQuoteModal}
        quote={dailyQuote}
        onClose={() => setShowQuoteModal(false)}
        isDark={isDark}
      />

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
      <Text style={[styles.modulesTitle, isDark && styles.modulesTitleDark]}>
        Modules
      </Text>

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
        return (
          <View
            style={[
              styles.overallProgressCard,
              isDark && styles.overallProgressCardDark,
            ]}
          >
            <View style={styles.overallProgressHeader}>
              <Text
                style={[
                  styles.overallProgressLabel,
                  isDark && styles.overallProgressLabelDark,
                ]}
              >
                Overall progress — {Math.round(pct * 100)}%
              </Text>
              <Text
                style={[
                  styles.overallProgressCount,
                  isDark && styles.overallProgressCountDark,
                ]}
              >
                {allWatched}/{allTotal} videos
              </Text>
            </View>
            <View
              style={[
                styles.overallProgressBarBg,
                isDark && styles.overallProgressBarBgDark,
              ]}
            >
              <View
                style={[
                  styles.overallProgressBarFill,
                  { width: `${pct * 100}%` },
                ]}
              />
            </View>
          </View>
        );
      })()}

      {/* Categories Grid */}
      <View style={styles.grid}>
        {categories.map((category, index) => {
          const totalCount = (MODULE_VIDEOS[category.slug] || []).length;
          const watchedCount = (progress[category.slug] || []).length;
          return (
            <CategoryCard
              key={index}
              {...category}
              totalCount={totalCount}
              watchedCount={watchedCount}
            />
          );
        })}
      </View>
    </ScrollView>
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
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: "#8E8EA0",
    fontFamily: AppFonts.bodyRegular,
  },
  welcomeTextDark: {
    color: "#9090A8",
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  mainTitleDark: {
    color: "#ECEDEE",
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8EA0",
    lineHeight: 20,
    fontFamily: AppFonts.bodyRegular,
  },
  subtitleDark: {
    color: "#9090A8",
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0ECF7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggleDark: {
    backgroundColor: "#2A2A3E",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  card: {
    width: "47%",
    aspectRatio: 0.85,
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    marginBottom: 4,
    lineHeight: 22,
    height: 44,
  },
  cardProgressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 6,
  },
  cardProgressBarFill: {
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#5D9B8B",
  },
  cardProgressLabel: {
    fontSize: 14,
    fontFamily: AppFonts.bodyRegular,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 16,
    marginTop: 2,
    fontFamily: AppFonts.bodyRegular,
  },

  modulesTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    marginTop: 8,
    marginBottom: 14,
    marginLeft: 4,
  },
  modulesTitleDark: {
    color: "#ECEDEE",
  },
  overallProgressCard: {
    backgroundColor: "#f0faf1",
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  overallProgressCardDark: {
    backgroundColor: "#1E1E32",
  },
  overallProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  overallProgressLabel: {
    fontSize: 15,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
  },
  overallProgressLabelDark: {
    color: "#ECEDEE",
  },
  overallProgressCount: {
    fontSize: 14,
    fontFamily: AppFonts.bodyMedium,
    color: "#8E8EA0",
  },
  overallProgressCountDark: {
    color: "#9090A8",
  },
  overallProgressBarBg: {
    height: 10,
    backgroundColor: "#E8E8EE",
    borderRadius: 5,
    overflow: "hidden",
  },
  overallProgressBarBgDark: {
    backgroundColor: "#2A2A3E",
  },
  overallProgressBarFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#5D9B8B",
  },
  dieselCard: {
    width: "100%",
    backgroundColor: "#D4F1E8",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dieselCardDark: {
    backgroundColor: "#1E2E2A",
  },
  dieselHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  dieselIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#5D9B8B",
    justifyContent: "center",
    alignItems: "center",
  },
  dieselLabel: {
    fontSize: 18,
    fontFamily: AppFonts.headingBold,
    color: "#4A7D6F",
    letterSpacing: 0.3,
  },
  dieselLabelDark: {
    color: "#7BC9A8",
  },
  dieselQuote: {
    fontSize: 17,
    fontFamily: AppFonts.bodyMedium,
    fontStyle: "italic",
    lineHeight: 25,
    color: "#2C3E50",
    marginBottom: 8,
  },
  dieselQuoteDark: {
    color: "#ECEDEE",
  },
  dieselAuthor: {
    fontSize: 13,
    fontFamily: AppFonts.bodyMedium,
    color: "#8E8EA0",
    textAlign: "right",
    marginBottom: 16,
  },
  dieselAuthorDark: {
    color: "#9BA1A6",
  },
  readQuoteButton: {
    alignSelf: "center",
    paddingVertical: 10,
    width: "100%",
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#5D9B8B",
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  readQuoteButtonDark: {
    borderColor: "#7BC9A8",
  },
  readQuoteText: {
    fontSize: 14,
    fontFamily: AppFonts.bodyBold,
    color: "#5D9B8B",
    textAlign: "center",
  },
  readQuoteTextDark: {
    color: "#7BC9A8",
  },
  reminderRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  reminderLabel: {
    fontSize: 13,
    color: "#8E8EA0",
    textAlign: "center",
    fontFamily: AppFonts.bodyRegular,
  },
  reminderLabelDark: {
    color: "#9BA1A6",
  },
  reminderChange: {
    fontSize: 13,
    color: "#5D9B8B",
    textDecorationLine: "underline",
    fontFamily: AppFonts.bodyMedium,
  },
  reminderCtaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    marginTop: 12,
    backgroundColor: "#5D9B8B",
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
