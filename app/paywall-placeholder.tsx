import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { setOnboardingComplete } from "@/services/onboarding-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Crown, Sparkles } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Replace this screen with RevenueCat paywall UI when ready.
 * Preview mode (from Home) skips persistence and returns to the app.
 */
export default function PaywallPlaceholderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const isPreview = preview === "1" || preview === "true";

  const enterApp = async () => {
    if (!isPreview) {
      await setOnboardingComplete();
    }
    router.replace("/(tabs)");
  };

  return (
    <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 },
        ]}
      >
        <View style={styles.iconRing}>
          <Crown size={40} color={MAIN_PURPLE} strokeWidth={2} />
        </View>
        <Text style={styles.title}>Unlock the full experience</Text>
        <Text style={styles.subtitle}>
          Get unlimited access to every module, workbook, and guided video.
          Subscription billing will be handled here with RevenueCat.
        </Text>

        <View style={styles.card}>
          <Sparkles size={20} color={MAIN_PURPLE} strokeWidth={2} />
          <Text style={styles.cardTitle}>What you&apos;ll get</Text>
          <Text style={styles.bullet}>• All 10 performance modules & videos</Text>
          <Text style={styles.bullet}>• Digital workbooks & resources</Text>
          <Text style={styles.bullet}>• Progress sync & reminders</Text>
        </View>

        <Text style={styles.placeholderLabel}>Paywall UI placeholder</Text>

        <Pressable
          style={({ pressed }) => [styles.primary, { opacity: pressed ? 0.9 : 1 }]}
          onPress={enterApp}
        >
          <Text style={styles.primaryText}>
            {isPreview ? "Close preview" : "Continue to app"}
          </Text>
        </Pressable>

        {!isPreview && (
          <Text style={styles.hint}>
            RevenueCat: present offerings & packages on this screen later.
          </Text>
        )}
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#F8F6FC",
  },
  content: {
    paddingHorizontal: 24,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#EDE8F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    alignSelf: "center",
  },
  title: {
    fontFamily: AppFonts.headingBold,
    fontSize: 28,
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 18,
    color: "#111827",
    marginTop: 4,
    marginBottom: 4,
  },
  bullet: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
    color: "#4B5563",
  },
  placeholderLabel: {
    fontFamily: AppFonts.bodyMedium,
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginBottom: 16,
  },
  primary: {
    backgroundColor: MAIN_PURPLE,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: {
    fontFamily: AppFonts.headingSemiBold,
    fontSize: 17,
    color: "#FFFFFF",
  },
  hint: {
    fontFamily: AppFonts.bodyRegular,
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
});
