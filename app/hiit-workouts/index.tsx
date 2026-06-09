import { HiitWorkoutListCard } from "@/components/hiit-workout-list-card";
import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import {
  FullscreenImageThumbnail,
  FullscreenImageViewer,
} from "@/components/fullscreen-image-viewer";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  HIIT_IMAGE_FOOTER,
  HIIT_WORKOUTS,
  HIIT_WORKOUTS_IMAGE,
  HIIT_WORKOUTS_INSTRUCTIONS,
  HIIT_WORKOUTS_INTRO,
} from "@/data/hiit-workouts";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HiitWorkoutsHubScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <ScreenBackButton color={isDark ? "#ECEDEE" : "#2C3E50"} />
        <Text
          pointerEvents="none"
          style={[styles.headerTitle, isDark && styles.textDark]}
        >
          HIIT Workouts
        </Text>
        <View pointerEvents="none" style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, isDark && styles.textDark]}>
          {HIIT_WORKOUTS_INTRO.title}
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtextDark]}>
          {HIIT_WORKOUTS_INTRO.subtitle}
        </Text>

        <View style={[styles.instructionsBox, isDark && styles.instructionsBoxDark]}>
          {HIIT_WORKOUTS_INSTRUCTIONS.map((paragraph) => (
            <Text
              key={paragraph}
              style={[styles.body, isDark && styles.subtextDark]}
            >
              {paragraph}
            </Text>
          ))}
        </View>

        <Text style={[styles.sectionLabel, isDark && styles.subtextDark]}>
          Choose a workout
        </Text>

        {HIIT_WORKOUTS.map((workout) => (
          <HiitWorkoutListCard
            key={workout.id}
            workout={workout}
            isDark={isDark}
            onPress={() =>
              router.push({
                pathname: "/hiit-workouts/[id]",
                params: { id: workout.id },
              })
            }
          />
        ))}

        <Text style={[styles.imageFooter, isDark && styles.textDark]}>
          {HIIT_IMAGE_FOOTER}
        </Text>

        <FullscreenImageThumbnail
          source={HIIT_WORKOUTS_IMAGE}
          accessibilityLabel="Peak Performance Code HIIT workout circuits"
          style={styles.workoutChart}
          isDark={isDark}
          hint="Tap to view full screen · Download to save"
          onPress={() => setViewerOpen(true)}
        />
      </ScrollView>

      <FullscreenImageViewer
        visible={viewerOpen}
        onClose={() => setViewerOpen(false)}
        source={HIIT_WORKOUTS_IMAGE}
        shareAssetModule={HIIT_WORKOUTS_IMAGE}
        shareTitle="Peak Performance Code HIIT Workouts"
        accessibilityLabel="Peak Performance Code HIIT workout circuits"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3FA",
  },
  containerDark: {
    backgroundColor: "#12121E",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    zIndex: 10,
  },
  headerTitle: {
    flex: 1,
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: "#1E2430",
    textAlign: "center",
  },
  headerSpacer: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  title: {
    fontFamily: AppFonts.headingBold,
    fontSize: 22,
    lineHeight: 28,
    color: "#1E2430",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    marginBottom: 20,
  },
  instructionsBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  instructionsBoxDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A3D55",
  },
  body: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: "#374151",
  },
  sectionLabel: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 13,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#6B7280",
    marginBottom: 12,
  },
  imageFooter: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 16,
    lineHeight: 22,
    color: "#1E2430",
    marginTop: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  workoutChart: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
});
