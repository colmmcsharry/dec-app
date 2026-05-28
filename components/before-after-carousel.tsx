import { BeforeAfterSlider } from "@/components/before-after-slider";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Platform, StyleSheet, Text, View, type ImageSourcePropType } from "react-native";
import { RectButton } from "react-native-gesture-handler";

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
        <RectButton
          onPress={goToPrevious}
          style={[styles.navButton, isDark && styles.navButtonDark]}
          underlayColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
          accessibilityRole="button"
          accessibilityLabel="Previous transformation"
        >
          <View style={styles.navButtonInner} pointerEvents="none">
            <ChevronLeft size={22} color={isDark ? "#E5E7EB" : "#1E2430"} />
          </View>
        </RectButton>

        <View style={styles.dots}>
          {TRANSFORMATION_SLIDES.map((item, index) => (
            <RectButton
              key={item.caption}
              onPress={() => setActiveIndex(index)}
              style={styles.dotHitArea}
              underlayColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
              accessibilityRole="button"
              accessibilityLabel={`Show transformation ${index + 1} of ${TRANSFORMATION_SLIDES.length}`}
              accessibilityState={{ selected: index === activeIndex }}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.dot,
                  isDark && styles.dotDark,
                  index === activeIndex && styles.dotActive,
                  index === activeIndex && isDark && styles.dotActiveDark,
                ]}
              />
            </RectButton>
          ))}
        </View>

        <RectButton
          onPress={goToNext}
          style={[styles.navButton, isDark && styles.navButtonDark]}
          underlayColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
          accessibilityRole="button"
          accessibilityLabel="Next transformation"
        >
          <View style={styles.navButtonInner} pointerEvents="none">
            <ChevronRight size={22} color={isDark ? "#E5E7EB" : "#1E2430"} />
          </View>
        </RectButton>
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
    zIndex: 2,
    ...Platform.select({
      android: { elevation: 2 },
    }),
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  navButtonInner: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDark: {
    backgroundColor: "#2A2D3E",
    borderColor: "#3A3D4E",
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  dotHitArea: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
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
