import { BeforeAfterSlider } from "@/components/before-after-slider";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from "react-native";

type TransformationSlide = {
  before: ImageSourcePropType;
  after: ImageSourcePropType;
  caption: string;
};

/** Same frame size for every client — taller originals crop with `cover`. */
const SLIDE_ASPECT_RATIO = 3 / 4;

const TRANSFORMATION_SLIDES: TransformationSlide[] = [
  {
    before: require("@/assets/images/about/roux-before.png"),
    after: require("@/assets/images/about/roux-after.png"),
    caption: "Rory, a happy client of mine",
  },
  {
    before: require("@/assets/images/about/dave-before.png"),
    after: require("@/assets/images/about/dave-after.png"),
    caption: "Dave, another client and football teammate",
  },
  {
    before: require("@/assets/images/about/claire-before.png"),
    after: require("@/assets/images/about/claire-after.png"),
    caption: "Claire got into great running shape",
  },
];

type BeforeAfterCarouselProps = {
  isDark?: boolean;
};

export function BeforeAfterCarousel({ isDark = false }: BeforeAfterCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = TRANSFORMATION_SLIDES[activeIndex];
  const lastIndex = TRANSFORMATION_SLIDES.length - 1;

  const goToPrevious = () => {
    setActiveIndex((index) => (index === 0 ? lastIndex : index - 1));
  };

  const goToNext = () => {
    setActiveIndex((index) => (index === lastIndex ? 0 : index + 1));
  };

  return (
    <View>
      <BeforeAfterSlider
        key={activeIndex}
        before={slide.before}
        after={slide.after}
        aspectRatio={SLIDE_ASPECT_RATIO}
      />

      <View style={styles.controls}>
        <Pressable
          onPress={goToPrevious}
          style={({ pressed }) => [
            styles.navButton,
            isDark && styles.navButtonDark,
            pressed && styles.navButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Previous transformation"
        >
          <ChevronLeft size={20} color={isDark ? "#E5E7EB" : "#1E2430"} />
        </Pressable>

        <View style={styles.dots}>
          {TRANSFORMATION_SLIDES.map((item, index) => (
            <Pressable
              key={item.caption}
              onPress={() => setActiveIndex(index)}
              style={[
                styles.dot,
                isDark && styles.dotDark,
                index === activeIndex && styles.dotActive,
                index === activeIndex && isDark && styles.dotActiveDark,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Show transformation ${index + 1} of ${TRANSFORMATION_SLIDES.length}`}
              accessibilityState={{ selected: index === activeIndex }}
            />
          ))}
        </View>

        <Pressable
          onPress={goToNext}
          style={({ pressed }) => [
            styles.navButton,
            isDark && styles.navButtonDark,
            pressed && styles.navButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Next transformation"
        >
          <ChevronRight size={20} color={isDark ? "#E5E7EB" : "#1E2430"} />
        </Pressable>
      </View>

      <Text
        style={[styles.caption, isDark && styles.captionDark]}
        accessibilityLiveRegion="polite"
      >
        {slide.caption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 14,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  navButtonDark: {
    backgroundColor: "#2A2D3E",
    borderColor: "#3A3D4E",
  },
  navButtonPressed: {
    opacity: 0.75,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotDark: {
    backgroundColor: "#4B5563",
  },
  dotActive: {
    width: 20,
    backgroundColor: MAIN_PURPLE,
  },
  dotActiveDark: {
    backgroundColor: "#B7A8E0",
  },
  caption: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 16,
    lineHeight: 25,
    color: "#2E343F",
    fontFamily: AppFonts.bodyRegular,
    textAlign: "center",
  },
  captionDark: {
    color: "#D1D5DB",
  },
});
