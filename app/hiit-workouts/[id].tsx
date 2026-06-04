import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  getHiitWorkout,
  HIIT_FINISHER_PROTOCOL,
  HIIT_PAIR_PROTOCOL,
  HIIT_REST_BETWEEN_PAIRS,
} from "@/data/hiit-workouts";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HiitWorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const workout = id ? getHiitWorkout(id) : undefined;

  if (!workout) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <ScreenBackButton color={isDark ? "#ECEDEE" : "#2C3E50"} />
        </View>
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, isDark && styles.textDark]}>
            Workout not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <ScreenBackButton color={isDark ? "#ECEDEE" : "#2C3E50"} />
        <Text
          pointerEvents="none"
          style={[styles.headerTitle, isDark && styles.textDark]}
          numberOfLines={1}
        >
          {workout.title}
        </Text>
        <View pointerEvents="none" style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isDark && styles.textDark]}>
          {workout.title}
        </Text>
        <Text style={[styles.description, isDark && styles.subtextDark]}>
          {workout.description}
        </Text>
        <Text style={[styles.protocol, isDark && styles.subtextDark]}>
          {HIIT_PAIR_PROTOCOL}
        </Text>

        {workout.pairs.map((pair, index) => (
          <View key={`${pair.exerciseA}-${pair.exerciseB}`}>
            <View
              style={[styles.pairCard, isDark && styles.pairCardDark]}
            >
              <Text style={[styles.pairLabel, isDark && styles.subtextDark]}>
                Superset {index + 1}
              </Text>
              <Text style={[styles.exercise, isDark && styles.textDark]}>
                {pair.exerciseA}
              </Text>
              <Text style={[styles.exerciseDivider, isDark && styles.subtextDark]}>
                /
              </Text>
              <Text style={[styles.exercise, isDark && styles.textDark]}>
                {pair.exerciseB}
              </Text>
              <Text style={[styles.pairNote, isDark && styles.subtextDark]}>
                3 rounds · 30s on, 30s off each
              </Text>
            </View>
            {index < workout.pairs.length - 1 ? (
              <Text style={[styles.restLabel, isDark && styles.restLabelDark]}>
                {HIIT_REST_BETWEEN_PAIRS}
              </Text>
            ) : null}
          </View>
        ))}

        <Text style={[styles.restLabel, isDark && styles.restLabelDark]}>
          {HIIT_REST_BETWEEN_PAIRS}
        </Text>

        <View style={[styles.pairCard, isDark && styles.pairCardDark]}>
          <Text style={[styles.pairLabel, isDark && styles.subtextDark]}>
            Finisher
          </Text>
          <Text style={[styles.exercise, isDark && styles.textDark]}>
            {workout.finisher}
          </Text>
          <Text style={[styles.pairNote, isDark && styles.subtextDark]}>
            {HIIT_FINISHER_PROTOCOL}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FA",
  },
  containerDark: {
    backgroundColor: "#12121E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: "#1E2430",
    textAlign: "center",
  },
  headerSpacer: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: "#1E2430",
  },
  title: {
    fontFamily: AppFonts.headingBold,
    fontSize: 24,
    lineHeight: 30,
    color: "#1E2430",
    marginBottom: 8,
  },
  description: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
    marginBottom: 16,
  },
  protocol: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: MAIN_PURPLE,
    marginBottom: 20,
  },
  pairCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pairCardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A3D55",
  },
  pairLabel: {
    fontFamily: AppFonts.headingBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#6B7280",
    marginBottom: 10,
  },
  exercise: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 17,
    lineHeight: 24,
    color: "#1E2430",
  },
  exerciseDivider: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    color: "#9CA3AF",
    marginVertical: 2,
  },
  pairNote: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
    marginTop: 10,
  },
  restLabel: {
    fontFamily: AppFonts.headingBold,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: MAIN_PURPLE,
    textAlign: "center",
    marginVertical: 14,
  },
  restLabelDark: {
    color: "#B7A8E0",
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
});
