import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

const GREETING_ART = require("@/assets/images/home/home-greeting-mountains.png");

function withAlpha(hex: string, alphaHex: string): string {
  const normalized = hex.replace("#", "");
  if (normalized.length === 6) return `#${normalized}${alphaHex}`;
  if (normalized.length === 8) return `#${normalized.slice(0, 6)}${alphaHex}`;
  return hex;
}

type HomeGreetingArtProps = {
  /** Page background color so edge fades blend into the screen. */
  fadeColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Mountain art that bleeds to the screen edge on the right.
 * Soft left / top / bottom fades (same-hue alpha — avoids muddy black edges).
 */
export function HomeGreetingArt({
  fadeColor = "#F7F6FA",
  style,
}: HomeGreetingArtProps) {
  const opaque = withAlpha(fadeColor, "FF");
  const clear = withAlpha(fadeColor, "00");

  return (
    <View
      style={[styles.wrap, style]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Image source={GREETING_ART} style={styles.image} resizeMode="cover" />

      {/* Blend into greeting text */}
      <LinearGradient
        colors={[opaque, clear]}
        locations={[0, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.fadeLeft}
      />
      {/* Soft top / bottom like the mockup */}
      <LinearGradient
        colors={[opaque, clear]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fadeTop}
      />
      <LinearGradient
        colors={[clear, opaque]}
        locations={[0, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.fadeBottom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  fadeLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 56,
  },
  fadeTop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 36,
  },
  fadeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 40,
  },
});
