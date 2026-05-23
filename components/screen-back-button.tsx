import { AppFonts } from "@/constants/theme";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ScreenBackButtonProps = {
  onPress?: () => void;
  color?: string;
  accessibilityLabel?: string;
};

/**
 * Wide "Back" control with expanded hit area — not a tiny chevron-only target.
 * Matches `app/video/[id].tsx` and `app/pdf-viewer.tsx`.
 */
export function ScreenBackButton({
  onPress,
  color = "#2C3E50",
  accessibilityLabel = "Go back",
}: ScreenBackButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={16}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.65 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View pointerEvents="none" style={styles.content}>
        <ChevronLeft size={26} color={color} strokeWidth={2.5} />
        <Text style={[styles.label, { color }]}>Back</Text>
      </View>
    </Pressable>
  );
}

/** Use on the opposite side of a centered header title. */
export const SCREEN_BACK_BUTTON_WIDTH = 72;

const styles = StyleSheet.create({
  button: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    marginLeft: 2,
  },
});
