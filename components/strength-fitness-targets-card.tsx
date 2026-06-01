import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { STRENGTH_FITNESS_INTRO } from "@/data/strength-fitness-targets";
import { ChevronRight, Target } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type StrengthFitnessTargetsCardProps = {
  isDark: boolean;
  onPress: () => void;
};

export function StrengthFitnessTargetsCard({
  isDark,
  onPress,
}: StrengthFitnessTargetsCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${STRENGTH_FITNESS_INTRO.title}`}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconWrap,
            isDark ? styles.iconWrapDark : styles.iconWrapLight,
          ]}
        >
          <Target
            size={32}
            color={isDark ? "#89AAD4" : "#5B8BC4"}
            strokeWidth={2.2}
          />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {STRENGTH_FITNESS_INTRO.title}
          </Text>
          <Text
            style={[styles.subtitle, isDark && styles.subtextDark]}
            numberOfLines={2}
          >
            {STRENGTH_FITNESS_INTRO.subtitle}
          </Text>
          <Text
            style={[styles.excerpt, isDark && styles.subtextDark]}
            numberOfLines={2}
          >
            Beginner, intermediate, and advanced benchmarks — basic or detailed guides.
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
    backgroundColor: "#EDF3FB",
    borderColor: "#C8DAF2",
  },
  iconWrapDark: {
    backgroundColor: "#1A2438",
    borderColor: "#2E4568",
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
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
