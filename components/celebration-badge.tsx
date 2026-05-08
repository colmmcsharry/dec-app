import { Check } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

const SPARKLE_COUNT = 8;
const SPARKLE_RADIUS = 64;
const ACCENT = "#5D9B8B";

interface CelebrationBadgeProps {
  /** When this becomes true, the entry animation plays. */
  active: boolean;
  /** Override the accent colour for the badge + sparkles. */
  accentColor?: string;
}

/**
 * Animated round check-mark badge with a ring of sparkles bursting outwards.
 * Used wherever we want to celebrate a milestone — module completion, post-purchase
 * welcome, etc. Drop it into any layout; it sizes itself to a 96×96 area.
 */
export function CelebrationBadge({
  active,
  accentColor = ACCENT,
}: CelebrationBadgeProps) {
  const checkAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    Array.from({ length: SPARKLE_COUNT }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (!active) {
      checkAnim.setValue(0);
      sparkleAnims.forEach((a) => a.setValue(0));
      return;
    }

    Animated.sequence([
      Animated.delay(140),
      Animated.spring(checkAnim, {
        toValue: 1,
        friction: 5,
        tension: 110,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.stagger(
      55,
      sparkleAnims.map((a) =>
        Animated.timing(a, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [active, checkAnim, sparkleAnims]);

  return (
    <View style={styles.wrap}>
      {sparkleAnims.map((a, i) => {
        const angle = (i / sparkleAnims.length) * Math.PI * 2;
        const tx = a.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * SPARKLE_RADIUS],
        });
        const ty = a.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * SPARKLE_RADIUS],
        });
        const opacity = a.interpolate({
          inputRange: [0, 0.2, 0.7, 1],
          outputRange: [0, 1, 1, 0],
        });
        const scale = a.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.4, 1, 0.6],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.sparkle,
              { backgroundColor: accentColor },
              {
                opacity,
                transform: [
                  { translateX: tx },
                  { translateY: ty },
                  { scale },
                ],
              },
            ]}
          />
        );
      })}
      <Animated.View
        style={[
          styles.badge,
          {
            backgroundColor: accentColor,
            shadowColor: accentColor,
            opacity: checkAnim,
            transform: [
              {
                scale: checkAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Check size={42} color="#FFFFFF" strokeWidth={3.5} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 96,
    height: 96,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  sparkle: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
