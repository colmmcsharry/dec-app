import { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

const THUMB_SIZE = 84;

type ArticleListCardSkeletonProps = {
  isDark: boolean;
};

/** Placeholder matching `ArticleListCard` size to avoid Resources layout shift. */
export function ArticleListCardSkeleton({ isDark }: ArticleListCardSkeletonProps) {
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.9,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.45,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const bone = isDark ? styles.boneDark : styles.boneLight;

  return (
    <View
      style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
    >
      <View style={styles.row}>
        <Animated.View
          style={[styles.thumbnail, bone, { opacity: pulse }]}
        />
        <View style={styles.textWrap}>
          <Animated.View
            style={[styles.lineTitle, bone, { opacity: pulse }]}
          />
          <Animated.View
            style={[styles.lineTitleShort, bone, { opacity: pulse }]}
          />
          <Animated.View
            style={[styles.lineExcerpt, bone, { opacity: pulse }]}
          />
          <Animated.View
            style={[styles.lineExcerptShort, bone, { opacity: pulse }]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: THUMB_SIZE + 24,
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
  thumbnail: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: 8,
    paddingTop: 4,
  },
  lineTitle: {
    height: 14,
    borderRadius: 6,
    width: "92%",
  },
  lineTitleShort: {
    height: 14,
    borderRadius: 6,
    width: "68%",
  },
  lineExcerpt: {
    height: 11,
    borderRadius: 5,
    width: "100%",
    marginTop: 4,
  },
  lineExcerptShort: {
    height: 11,
    borderRadius: 5,
    width: "55%",
  },
  boneLight: {
    backgroundColor: "#E5E7EB",
  },
  boneDark: {
    backgroundColor: "#34364A",
  },
});
