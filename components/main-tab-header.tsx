import { useTheme } from "@/context/theme-context";
import { Moon, Sun } from "lucide-react-native";
import {
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LOGO = require("@/assets/images/icon-transparent.png");

type MainTabHeaderProps = {
  showThemeToggle?: boolean;
};

export function MainTabHeader({ showThemeToggle = false }: MainTabHeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.row, { paddingTop: insets.top + 8 }]}>
      <Image
        source={LOGO}
        style={styles.logo}
        resizeMode="contain"
        accessibilityLabel="Performance Treanor"
      />
      {showThemeToggle ? (
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
              <Sun size={20} color="#FDB813" strokeWidth={2.5} />
            ) : (
              <Moon size={20} color="#6B5B8C" strokeWidth={2.5} />
            )}
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  logo: {
    width: 44,
    height: 44,
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
});
