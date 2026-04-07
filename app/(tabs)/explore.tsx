import { Asset } from "expo-asset";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_PDFS, type PdfEntry } from "@/data/pdf-assets";
import { MODULE_WORKBOOKS } from "@/data/module-workbooks";
import { useRouter } from "expo-router";
import { FileText, Download, ExternalLink, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COURSE_LEAFLET = require("@/assets/documents/course-leaflet.pdf");

const MODULE_ORDER = [
  "sleep",
  "morning-routines",
  "energy-management",
  "mindfulness",
  "move-2-perform",
  "thinking-2-perform",
  "recovery",
  "fuel-2-perform",
  "stress-management",
  "habits",
] as const;

export default function ResourcesScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isPreparingLeaflet, setIsPreparingLeaflet] = useState(false);

  const handleDownloadLeaflet = async () => {
    if (isPreparingLeaflet) return;
    try {
      setIsPreparingLeaflet(true);
      const asset = Asset.fromModule(COURSE_LEAFLET);
      if (!asset.localUri) await asset.downloadAsync();
      const leafletUri = asset.localUri ?? asset.uri;
      if (!leafletUri) throw new Error("URI unavailable");

      if (Platform.OS === "web") {
        await Linking.openURL(asset.uri);
        return;
      }
      await Share.share({
        title: "Daily Diesel Course Leaflet",
        message: "Daily Diesel Course Leaflet",
        url: leafletUri,
      });
    } catch {
      Alert.alert("Unable to open leaflet", "Please try again in a moment.");
    } finally {
      setIsPreparingLeaflet(false);
    }
  };

  const openPdf = (slug: string, pdf: PdfEntry) => {
    router.push({
      pathname: "/pdf-viewer",
      params: { slug, pdfId: pdf.id, title: pdf.title },
    });
  };

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 },
      ]}
    >
      <Text style={[styles.pageTitle, isDark && styles.textDark]}>
        Resources
      </Text>

      {/* Downloads & Links */}
      <View style={[styles.card, isDark && styles.cardDark]}>
        <View style={styles.cardHeader}>
          <Download size={20} color={isDark ? "#818CF8" : MAIN_PURPLE} />
          <Text style={[styles.cardTitle, isDark && styles.textDark]}>
            Downloads & Links
          </Text>
        </View>
        <Text style={[styles.cardBody, isDark && styles.subtextDark]}>
          Download the course leaflet to keep a copy on your device.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.primaryButton,
            { opacity: pressed || isPreparingLeaflet ? 0.7 : 1 },
          ]}
          onPress={handleDownloadLeaflet}
          disabled={isPreparingLeaflet}
          accessibilityRole="button"
          accessibilityLabel="Download course leaflet PDF"
        >
          <View style={styles.actionButtonContent}>
            {isPreparingLeaflet && (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
                style={{ marginRight: 10 }}
              />
            )}
            <Text style={styles.actionButtonText}>
              {isPreparingLeaflet
                ? "Preparing…"
                : "Download Course Leaflet (PDF)"}
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            styles.primaryButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() =>
            Linking.openURL("https://performancetreanor.wordpress.com")
          }
        >
          <View style={styles.actionButtonContent}>
            <ExternalLink size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>
              Blog — Performance Treanor
            </Text>
          </View>
        </Pressable>
      </View>

      {/* Module PDFs */}
      <Text style={[styles.sectionHeading, isDark && styles.textDark]}>
        Module Worksheets
      </Text>
      <Text style={[styles.sectionSubtitle, isDark && styles.subtextDark]}>
        Tap to view the original formatted worksheets from each module.
      </Text>

      {MODULE_ORDER.map((slug) => {
        const pdfs = MODULE_PDFS[slug];
        const def = MODULE_WORKBOOKS[slug];
        if (!pdfs || pdfs.length === 0 || !def) return null;

        return (
          <View key={slug} style={[styles.card, isDark && styles.cardDark]}>
            <Text style={[styles.moduleLabel, isDark && styles.subtextDark]}>
              Module {def.moduleNumber}
            </Text>
            <Text style={[styles.moduleTitle, isDark && styles.textDark]}>
              {def.title}
            </Text>
            {pdfs.map((pdf) => (
              <TouchableOpacity
                key={pdf.id}
                style={[styles.pdfRow, isDark && styles.pdfRowDark]}
                activeOpacity={0.7}
                onPress={() => openPdf(slug, pdf)}
              >
                <FileText
                  size={20}
                  color={isDark ? "#818CF8" : MAIN_PURPLE}
                />
                <Text
                  style={[styles.pdfTitle, isDark && styles.textDark]}
                  numberOfLines={2}
                >
                  {pdf.title}
                </Text>
                <ChevronRight
                  size={18}
                  color={isDark ? "#4B5563" : "#9CA3AF"}
                />
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8ECF6",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  content: {
    paddingHorizontal: 20,
  },
  textDark: { color: "#ECEDEE" },
  subtextDark: { color: "#9BA1A6" },

  pageTitle: {
    fontSize: 28,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  cardDark: {
    backgroundColor: "#1E1E32",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4A5568",
    marginBottom: 14,
    fontFamily: AppFonts.bodyRegular,
  },

  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: MAIN_PURPLE,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
  },

  sectionHeading: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
    marginTop: 8,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: AppFonts.bodyRegular,
    marginBottom: 16,
  },

  moduleLabel: {
    fontSize: 12,
    fontFamily: AppFonts.bodyMedium,
    color: "#8E8EA0",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
    marginBottom: 12,
  },

  pdfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  pdfRowDark: {
    backgroundColor: "#262940",
  },
  pdfTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: "#374151",
  },
});
