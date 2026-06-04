import { AppFonts } from "@/constants/theme";
import type { HiitWorkout } from "@/data/hiit-workouts";
import { ChevronRight, Zap } from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

type HiitWorkoutListCardProps = {
  workout: HiitWorkout;
  isDark: boolean;
  onPress: () => void;
};

export function HiitWorkoutListCard({
  workout,
  isDark,
  onPress,
}: HiitWorkoutListCardProps) {
  return (
    <RectButton
      onPress={onPress}
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
      underlayColor={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}
      accessibilityRole="button"
      accessibilityLabel={`Open ${workout.title}`}
    >
      <View pointerEvents="none" style={styles.row}>
        <View
          style={[
            styles.iconWrap,
            isDark ? styles.iconWrapDark : styles.iconWrapLight,
          ]}
        >
          <Zap
            size={28}
            color={isDark ? "#E8A0A0" : "#D97B7B"}
            strokeWidth={2.2}
          />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {workout.title}
          </Text>
          <Text
            style={[styles.subtitle, isDark && styles.subtextDark]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {workout.description}
          </Text>
        </View>

        <ChevronRight
          size={18}
          color={isDark ? "#9090A8" : "#6B7280"}
          style={styles.chevron}
        />
      </View>
    </RectButton>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  cardLight: {
    backgroundColor: "#FFFFFF",
  },
  cardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A3D55",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  iconWrapLight: {
    backgroundColor: "#FFEBE8",
    borderColor: "#F5C4C4",
  },
  iconWrapDark: {
    backgroundColor: "#2E2020",
    borderColor: "#5C3A3A",
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: "#2C3E50",
  },
  subtitle: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
    color: "#6B7280",
  },
  chevron: {
    marginTop: 4,
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
});
