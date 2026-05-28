import { VideoPlayer } from "@/components/video-player";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { VIDEO_TESTIMONIALS } from "@/data/video-testimonials";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";

type VideoTestimonialCarouselProps = {
  isDark?: boolean;
};

export function VideoTestimonialCarousel({
  isDark = false,
}: VideoTestimonialCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = VIDEO_TESTIMONIALS[activeIndex];
  const lastIndex = VIDEO_TESTIMONIALS.length - 1;

  const goToPrevious = () => {
    setActiveIndex((index) => (index === 0 ? lastIndex : index - 1));
  };

  const goToNext = () => {
    setActiveIndex((index) => (index === lastIndex ? 0 : index + 1));
  };

  return (
    <View>
      <VideoPlayer key={slide.id} videoUrl={slide.url} title={slide.title} />

      <View style={styles.controls}>
        <RectButton
          onPress={goToPrevious}
          style={[styles.navButton, isDark && styles.navButtonDark]}
          underlayColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
          accessibilityRole="button"
          accessibilityLabel="Previous video testimonial"
        >
          <View style={styles.navButtonInner} pointerEvents="none">
            <ChevronLeft size={22} color={isDark ? "#E5E7EB" : "#1E2430"} />
          </View>
        </RectButton>

        <View style={styles.dots}>
          {VIDEO_TESTIMONIALS.map((item, index) => (
            <RectButton
              key={item.id}
              onPress={() => setActiveIndex(index)}
              style={styles.dotHitArea}
              underlayColor={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}
              accessibilityRole="button"
              accessibilityLabel={`Show video testimonial ${index + 1} of ${VIDEO_TESTIMONIALS.length}`}
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
          accessibilityLabel="Next video testimonial"
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
        {activeIndex + 1} of {VIDEO_TESTIMONIALS.length}
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
