import { AppFonts } from "@/constants/theme";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

type ScreenBackButtonProps = {
  onPress?: () => void;
  color?: string;
  accessibilityLabel?: string;
};

/**
 * Wide "Back" control — chevron + label share one RectButton target.
 * Inner content uses pointerEvents="none" so SVG icons never steal taps.
 */
export function ScreenBackButton({
  onPress,
  color = "#2C3E50",
  accessibilityLabel = "Go back",
}: ScreenBackButtonProps) {
  const router = useRouter();

  return (
    <RectButton
      onPress={onPress ?? (() => router.back())}
      hitSlop={{ top: 16, bottom: 16, left: 12, right: 24 }}
      style={styles.button}
      underlayColor="rgba(0,0,0,0.06)"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View pointerEvents="none" style={styles.content}>
        <ChevronLeft size={26} color={color} strokeWidth={2.5} />
        <Text style={[styles.label, { color }]}>Back</Text>
      </View>
    </RectButton>
  );
}

/** Use on the opposite side of a centered header title. */
export const SCREEN_BACK_BUTTON_WIDTH = 96;

const styles = StyleSheet.create({
  button: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 4,
    paddingRight: 8,
    zIndex: 50,
    elevation: 50,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    marginLeft: 2,
  },
});
