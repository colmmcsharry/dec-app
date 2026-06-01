import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import type { GymRoutine } from "@/data/gym-routines";
import { Dumbbell, ChevronRight } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type GymRoutineCardProps = {
  routine: GymRoutine;
  isDark: boolean;
  onPress: () => void;
};

export function GymRoutineCard({
  routine,
  isDark,
  onPress,
}: GymRoutineCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${routine.title}`}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconWrap,
            isDark ? styles.iconWrapDark : styles.iconWrapLight,
          ]}
        >
          <Dumbbell
            size={32}
            color={isDark ? "#B7A8E0" : MAIN_PURPLE}
            strokeWidth={2.2}
          />
        </View>

        <View style={styles.textWrap}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, isDark && styles.textDark]}
              numberOfLines={2}
            >
              {routine.title}
            </Text>
            <View
              style={[
                styles.levelPill,
                routine.level === "Beginner"
                  ? isDark
                    ? styles.levelPillBeginnerDark
                    : styles.levelPillBeginner
                  : isDark
                    ? styles.levelPillIntermediateDark
                    : styles.levelPillIntermediate,
              ]}
            >
              <Text
                style={[
                  styles.levelPillText,
                  routine.level === "Beginner"
                    ? styles.levelPillTextBeginner
                    : styles.levelPillTextIntermediate,
                ]}
              >
                {routine.level}
              </Text>
            </View>
          </View>
          <Text
            style={[styles.subtitle, isDark && styles.subtextDark]}
            numberOfLines={2}
          >
            {routine.subtitle}
          </Text>
          <Text
            style={[styles.excerpt, isDark && styles.subtextDark]}
            numberOfLines={2}
          >
            {routine.description}
          </Text>
        </View>

        <ChevronRight
          size={18}
          color={isDark ? "#9090A8" : "#6B7280"}
          style={styles.chevron}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
    width: 84,
    height: 84,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    flexShrink: 0,
  },
  iconWrapLight: {
    backgroundColor: "#F3F0FA",
    borderColor: "#EADBF7",
  },
  iconWrapDark: {
    backgroundColor: "#252540",
    borderColor: "#3A2E5C",
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  levelPill: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    flexShrink: 0,
    marginTop: 1,
  },
  levelPillBeginner: {
    backgroundColor: "#EEF6F0",
    borderColor: "#C5DFCB",
  },
  levelPillBeginnerDark: {
    backgroundColor: "#1A2820",
    borderColor: "#2E4A38",
  },
  levelPillIntermediate: {
    backgroundColor: "#F3F0FA",
    borderColor: "#EADBF7",
  },
  levelPillIntermediateDark: {
    backgroundColor: "#252540",
    borderColor: "#3A2E5C",
  },
  levelPillText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  levelPillTextBeginner: {
    color: "#4A8A5C",
  },
  levelPillTextIntermediate: {
    color: MAIN_PURPLE,
  },
  title: {
    flex: 1,
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 15,
    lineHeight: 20,
    color: "#2C3E50",
  },
  subtitle: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: MAIN_PURPLE,
  },
  excerpt: {
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
