import { ChevronsLeftRight } from "lucide-react-native";
import { Image, type ImageContentPosition } from "expo-image";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  clamp,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const HANDLE_SIZE = 40;
const DEFAULT_ASPECT_RATIO = 576 / 961;

type BeforeAfterSliderProps = {
  before: ImageSourcePropType;
  after: ImageSourcePropType;
  aspectRatio?: number;
  borderRadius?: number;
  /** Where to anchor `cover` cropping — use `top` for tall portraits. */
  contentPosition?: ImageContentPosition;
};

export function BeforeAfterSlider({
  before,
  after,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  borderRadius = 16,
  contentPosition = "center",
}: BeforeAfterSliderProps) {
  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const containerWidth = useSharedValue(0);
  const sliderX = useSharedValue(0);
  const startX = useSharedValue(0);
  const hasInitialized = useSharedValue(false);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    containerWidth.value = width;
    setLayoutWidth(width);
    setLayoutHeight(width / aspectRatio);

    if (!hasInitialized.value && width > 0) {
      sliderX.value = width / 2;
      hasInitialized.value = true;
    }
  };

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onStart(() => {
      startX.value = sliderX.value;
    })
    .onUpdate((event) => {
      sliderX.value = clamp(
        startX.value + event.translationX,
        0,
        containerWidth.value,
      );
    });

  const beforeClipStyle = useAnimatedStyle(() => ({
    width: sliderX.value,
  }));

  const handleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value - HANDLE_SIZE / 2 }],
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: sliderX.value - 1 }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <View
        style={[
          styles.container,
          { aspectRatio, borderRadius },
        ]}
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel="Before and after photo comparison. Drag horizontally to reveal before or after."
      >
        <Image
          source={after}
          style={[
            styles.image,
            layoutHeight > 0 && { width: layoutWidth, height: layoutHeight },
          ]}
          contentFit="cover"
          contentPosition={contentPosition}
          accessibilityLabel="After photo"
        />

        <Animated.View
          style={[styles.beforeClip, beforeClipStyle, { height: layoutHeight }]}
        >
          <Image
            source={before}
            style={[
              styles.beforeImage,
              layoutHeight > 0 && { width: layoutWidth, height: layoutHeight },
            ]}
            contentFit="cover"
            contentPosition={contentPosition}
            accessibilityLabel="Before photo"
          />
        </Animated.View>

        <Animated.View style={[styles.divider, dividerStyle]} />

        <Animated.View style={[styles.handle, handleStyle]}>
          <ChevronsLeftRight size={18} color="#1E2430" strokeWidth={2.5} />
        </Animated.View>

        <View style={styles.labelBefore} pointerEvents="none">
          <Text style={styles.labelText}>Before</Text>
        </View>
        <View style={styles.labelAfter} pointerEvents="none">
          <Text style={styles.labelText}>After</Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  beforeImage: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  beforeClip: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
  divider: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  handle: {
    position: "absolute",
    top: "50%",
    marginTop: -HANDLE_SIZE / 2,
    width: HANDLE_SIZE,
    height: HANDLE_SIZE,
    borderRadius: HANDLE_SIZE / 2,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  labelBefore: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(30, 36, 48, 0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  labelAfter: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(30, 36, 48, 0.65)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  labelText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
