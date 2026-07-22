import {
  Image,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

/** Transparent PNG — top/left/bottom fade to alpha; right edge stays solid for bleed. */
const GREETING_ART = require("@/assets/images/home/home-greeting-mountains-original.png");

type HomeGreetingArtProps = {
  isDark?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Mountain art that bleeds to the screen edge on the right.
 * Soft edges come from the PNG alpha; no CSS gradient fades.
 */
export function HomeGreetingArt({
  isDark = false,
  style,
}: HomeGreetingArtProps) {
  return (
    <View
      style={[styles.wrap, style]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Image
        source={GREETING_ART}
        style={[styles.image, isDark && styles.imageDark]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "visible",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  imageDark: {
    opacity: 0.72,
  },
});
