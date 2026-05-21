import { useTheme } from "@/context/theme-context";
import { Moon, Sun } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.themeToggle, isDark && styles.themeToggleDark]}
      activeOpacity={0.65}
      hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
      accessibilityRole="button"
      accessibilityLabel={
        isDark ? "Switch to light mode" : "Switch to dark mode"
      }
    >
      <View pointerEvents="none">
        {isDark ? (
          <Sun size={22} color="#FDB813" strokeWidth={2.5} />
        ) : (
          <Moon size={22} color="#6B5B8C" strokeWidth={2.5} />
        )}
      </View>
    </TouchableOpacity>
  );
}

export function MainTabHeader() {
  const insets = useSafeAreaInsets();

  return <View style={{ paddingTop: insets.top + 8, marginBottom: 12 }} />;
}

const styles = StyleSheet.create({
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0ECF7",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  themeToggleDark: {
    backgroundColor: "#2A2A3E",
  },
});
