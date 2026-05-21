import { DownloadListCard } from "@/components/download-list-card";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { DOWNLOADS } from "@/data/downloads";
import { requirePro } from "@/services/purchases";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function DownloadsScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const openDownload = async (id: string, title: string) => {
    if (!(await requirePro())) return;
    router.push({
      pathname: "/pdf-viewer",
      params: { downloadId: id, title },
    });
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, paddingBottom: 12 },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ChevronLeft size={24} color={isDark ? "#ECEDEE" : MAIN_PURPLE} />
        </Pressable>
        <Text style={[styles.headerTitle, isDark && styles.textDark]}>
          Downloads
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.subtitle, isDark && styles.subtextDark]}>
          Guides, meal plans and course materials
        </Text>

        {DOWNLOADS.map((download) => (
          <DownloadListCard
            key={download.id}
            download={download}
            isDark={isDark}
            onPress={() => void openDownload(download.id, download.title)}
          />
        ))}
      </ScrollView>
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
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: "#1E2430",
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  subtitle: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    marginBottom: 16,
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#AEB3C4",
  },
});
