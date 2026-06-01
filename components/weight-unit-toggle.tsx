import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import type { WeightUnit } from "@/lib/weight-unit";
import { Pressable, StyleSheet, Text, View } from "react-native";

type WeightUnitToggleProps = {
  unit: WeightUnit;
  isDark: boolean;
  onChange: (unit: WeightUnit) => void;
};

export function WeightUnitToggle({
  unit,
  isDark,
  onChange,
}: WeightUnitToggleProps) {
  return (
    <View
      style={[
        styles.toggleRow,
        isDark ? styles.toggleRowDark : styles.toggleRowLight,
      ]}
    >
      {(["kg", "lb"] as const).map((option) => {
        const selected = unit === option;
        return (
          <Pressable
            key={option}
            style={[
              styles.toggleButton,
              selected &&
                (isDark ? styles.toggleButtonSelectedDark : styles.toggleButtonSelected),
            ]}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={
              option === "kg" ? "Show kilograms" : "Show pounds"
            }
          >
            <Text
              style={[
                styles.toggleText,
                selected && styles.toggleTextSelected,
                isDark && !selected && styles.toggleTextDark,
              ]}
            >
              {option === "kg" ? "KG" : "Pounds"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
    borderWidth: 1,
  },
  toggleRowLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
  },
  toggleRowDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A3D55",
  },
  toggleButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleButtonSelected: {
    backgroundColor: MAIN_PURPLE,
  },
  toggleButtonSelectedDark: {
    backgroundColor: MAIN_PURPLE,
  },
  toggleText: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 14,
    color: "#6B7280",
  },
  toggleTextDark: {
    color: "#AEB3C4",
  },
  toggleTextSelected: {
    color: "#FFFFFF",
  },
});
