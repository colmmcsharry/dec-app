import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { getPastelAccent, pastelBoxStyle, type PastelAccentVariant } from "@/constants/pastel-accents";
import type { StrengthStandardsOption } from "@/data/strength-standards-hub";
import { BarChart3, ChevronRight, Target } from "lucide-react-native";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type StrengthStandardsOptionCardProps = {
  option: StrengthStandardsOption;
  isDark: boolean;
  onPress: () => void;
};

export function StrengthStandardsOptionCard({
  option,
  isDark,
  onPress,
}: StrengthStandardsOptionCardProps) {
  const Icon = option.id === "basic" ? Target : BarChart3;
  const variant: PastelAccentVariant =
    option.id === "basic" ? "blue" : "lavender";
  const accent = getPastelAccent(variant, isDark);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pastelBoxStyle(variant, isDark),
        { opacity: pressed ? 0.85 : 1 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${option.title}`}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: accent.iconBackground,
              borderColor: accent.border,
            },
          ]}
        >
          <Icon size={32} color={accent.accent} strokeWidth={2.2} />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.title, isDark && styles.textDark]}>
            {option.title}
          </Text>
          <Text
            style={[styles.subtitle, isDark && styles.subtextDark]}
            numberOfLines={2}
          >
            {option.subtitle}
          </Text>
          <Text
            style={[styles.excerpt, isDark && styles.subtextDark]}
            numberOfLines={3}
          >
            {option.description}
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
