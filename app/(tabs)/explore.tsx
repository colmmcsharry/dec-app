import { Asset } from "expo-asset";
import { MODULE_THEMES, MODULE_ORDER } from "@/constants/module-themes";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_PDFS, type PdfEntry } from "@/data/pdf-assets";
import { MODULE_WORKBOOKS } from "@/data/module-workbooks";
import { hrefModuleDigitalWorkbook } from "@/lib/module-workbook-route";
import { requirePro } from "@/services/purchases";
import { useRouter } from "expo-router";
import {
  BookOpen,
  FileText,
  Download,
  ExternalLink,
  ChevronRight,
} from "lucide-react-native";
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

  const openPdf = async (slug: string, pdf: PdfEntry) => {
    if (!(await requirePro())) return;
    router.push({
      pathname: "/pdf-viewer",
      params: { slug, pdfId: pdf.id, title: pdf.title },
    });
  };

  const openDigitalWorkbook = async (slug: string) => {
    if (!(await requirePro())) return;
    router.push(hrefModuleDigitalWorkbook(slug));
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
      <View
        style={[styles.card, isDark ? styles.cardDark : styles.downloadsCardLight]}
      >
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
        Open your digital workbook (typed answers save on this device) or tap a
        worksheet to view its PDF — each module uses one workbook document
        everywhere in the app.
      </Text>

      {MODULE_ORDER.map((slug) => {
        const pdfs = MODULE_PDFS[slug];
        const def = MODULE_WORKBOOKS[slug];
        const theme = MODULE_THEMES[slug];
        if (!pdfs || pdfs.length === 0 || !def || !theme) return null;
        const Icon = theme.Icon;

        return (
          <View
            key={slug}
            style={[
              styles.moduleCard,
              { backgroundColor: theme.backgroundColor },
              isDark && styles.moduleCardDark,
            ]}
          >
            <View style={styles.moduleCardHeader}>
              <View style={styles.moduleIconCircle}>
                <Icon size={26} color={theme.iconColor} strokeWidth={2.5} />
              </View>
              <View style={styles.moduleHeaderText}>
                <Text
                  style={[
                    styles.moduleLabel,
                    {
                      color: isDark ? "#D8D8E5" : theme.textColor,
                      opacity: 0.75,
                    },
                  ]}
                >
                  Module {def.moduleNumber}
                </Text>
                <Text
                  style={[
                    styles.moduleTitle,
                    { color: isDark ? "#FFFFFF" : theme.textColor },
                  ]}
                >
                  {def.title}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.pdfRow,
                isDark && styles.pdfRowDark,
                styles.digitalWorkbookRow,
              ]}
              activeOpacity={0.7}
              onPress={() => openDigitalWorkbook(slug)}
              accessibilityRole="button"
              accessibilityLabel={`Open module ${def.moduleNumber} digital workbook for ${def.title}`}
            >
              <BookOpen
                size={20}
                color={isDark ? "#FFFFFF" : theme.iconColor}
              />
              <View style={styles.workbookRowText}>
                <Text
                  style={[
                    styles.pdfTitle,
                    { color: isDark ? "#FFFFFF" : theme.textColor },
                  ]}
                  numberOfLines={2}
                >
                  {def.title} Workbook
                </Text>
                <Text
                  style={[
                    styles.workbookRowHint,
                    { color: isDark ? "#A8A8BC" : theme.textColor },
                  ]}
                  numberOfLines={2}
                >
                  Module {def.moduleNumber} digital workbook
                </Text>
              </View>
              <ChevronRight
                size={18}
                color={isDark ? "#9090A8" : theme.textColor}
                opacity={isDark ? 1 : 0.55}
                style={styles.workbookRowChevron}
              />
            </TouchableOpacity>

            {pdfs.map((pdf) => (
              <TouchableOpacity
                key={pdf.id}
                style={[
                  styles.pdfRow,
                  isDark && styles.pdfRowDark,
                ]}
                activeOpacity={0.7}
                onPress={() => openPdf(slug, pdf)}
              >
                <FileText
                  size={20}
                  color={isDark ? "#FFFFFF" : theme.iconColor}
                />
                <Text
                  style={[
                    styles.pdfTitle,
                    { color: isDark ? "#FFFFFF" : theme.textColor },
                  ]}
                  numberOfLines={2}
                >
                  {pdf.title}
                </Text>
                <ChevronRight
                  size={18}
                  color={isDark ? "#9090A8" : theme.textColor}
                  opacity={isDark ? 1 : 0.55}
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
    /** Match Home tab (`app/(tabs)/index.tsx` container). */
    backgroundColor: "#FFFFFF",
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
  downloadsCardLight: {
    backgroundColor: "#F3F4F6",
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

  moduleCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  moduleCardDark: {
    backgroundColor: "#1E1E32",
  },
  moduleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  },
  moduleIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  moduleHeaderText: {
    flex: 1,
  },
  moduleLabel: {
    fontSize: 11,
    fontFamily: AppFonts.bodyBold,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  moduleTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    lineHeight: 22,
  },

  pdfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  workbookRowText: {
    flex: 1,
    gap: 4,
  },
  workbookRowHint: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: AppFonts.bodyRegular,
    opacity: 0.72,
  },
  pdfRowDark: {
    backgroundColor: "#262940",
  },
  /** Taller row + top alignment so title + hint line up with the icon. */
  digitalWorkbookRow: {
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  workbookRowChevron: {
    marginTop: 4,
    alignSelf: "center",
  },
  pdfTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
  },
});
