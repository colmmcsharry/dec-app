import { VideoPlayer } from "@/components/video-player";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { isVideoWatched, markVideoWatched } from "@/services/progress";
import { useNavigation } from "@react-navigation/native";
import { Stack, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VideoDetailScreen() {
  const { id, title, url, categoryColor, categorySlug } = useLocalSearchParams<{
    id: string;
    title: string;
    url: string;
    categoryColor?: string;
    categorySlug?: string;
  }>();
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [watched, setWatched] = useState(false);

  const backgroundColor = isDark ? "#1A1A2E" : categoryColor || "#E5D9F2";

  useEffect(() => {
    if (categorySlug && id) {
      isVideoWatched(categorySlug, id).then(setWatched);
    }
  }, [categorySlug, id]);

  const handleMarkWatched = async () => {
    if (categorySlug && id) {
      await markVideoWatched(categorySlug, id);
      setWatched(true);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={[styles.customHeader, { paddingTop: insets.top, backgroundColor }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={16}
          style={({ pressed }) => [
            styles.customBackButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <ChevronLeft size={26} color={isDark ? "#ECEDEE" : "#2C3E50"} strokeWidth={2.5} />
        </Pressable>
        <Text style={[styles.customHeaderTitle, { color: isDark ? "#ECEDEE" : "#2C3E50" }]}>Now Playing</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.header, { backgroundColor }]}>
          <Text style={[styles.videoTitle, isDark && styles.textDark]}>
            {title}
          </Text>
        </View>

        <View
          style={{
            height: 80,
            backgroundColor: isDark ? "#121222" : "#FFFFFF",
          }}
        />

        <View style={styles.videoContainer}>
          <VideoPlayer videoUrl={url} />
        </View>

        <View style={styles.infoSection}>
          <TouchableOpacity
            style={[styles.watchedButton, watched && styles.watchedButtonDone]}
            onPress={handleMarkWatched}
            disabled={watched}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.watchedButtonText,
                watched && styles.watchedButtonTextDone,
              ]}
            >
              {watched ? "✓  Marked as Watched" : "Mark as Watched"}
            </Text>
          </TouchableOpacity>

          <Text style={[styles.description, isDark && styles.subtextDark]}>
            Any additional worksheets or guides will be added below here.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  customBackButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  customHeaderTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    textAlign: "center",
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#9090A8",
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  videoTitle: {
    fontSize: 24,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    lineHeight: 32,
  },
  videoContainer: {
    padding: 16,
    backgroundColor: "#000",
  },
  infoSection: {
    padding: 20,
  },
  watchedButton: {
    backgroundColor: "#7187CE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  watchedButtonDone: {
    backgroundColor: "#5D9B8B",
  },
  watchedButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
  },
  watchedButtonTextDone: {
    opacity: 0.9,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    fontFamily: AppFonts.bodyRegular,
  },
});
