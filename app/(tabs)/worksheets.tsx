import { MainTabHeader } from "@/components/main-tab-header";
import { MODULE_ORDER, MODULE_THEMES } from "@/constants/module-themes";
import { AppFonts } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_WORKBOOKS } from "@/data/module-workbooks";
import { MODULE_PDFS, type PdfEntry } from "@/data/pdf-assets";
import { hrefModuleDigitalWorkbook } from "@/lib/module-workbook-route";
import { requirePro } from "@/services/purchases";
import { useRouter } from "expo-router";
import { BookOpen, ChevronRight, FileText } from "lucide-react-native";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Module worksheet cards: neutral ink (pastel card bg only; no theme-coloured type). */
const MODULE_INK_LIGHT = "#1E2430";
const MODULE_MUTED_LIGHT = "#5C6370";
const MODULE_ICON_LIGHT = "#374151";
const MODULE_CHEVRON_LIGHT = "#6B7280";
const MODULE_INK_DARK = "#ECEDEE";
const MODULE_MUTED_DARK = "#AEB3C4";
const MODULE_ICON_DARK = "#E5E7EB";
const MODULE_CHEVRON_DARK = "#9090A8";

export default function WorksheetsScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
        { paddingTop: 8, paddingBottom: insets.bottom + 40 },
      ]}
    >
      <MainTabHeader />

      <Text style={[styles.sectionHeading, isDark && styles.textDark]}>
        Module Worksheets
      </Text>
      <Text style={[styles.sectionSubtitle, isDark && styles.subtextDark]}>
        View and Print the worksheets or use the Digital Workbook if you prefer
        typed answers — they save on this device.
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
                <Icon
                  size={26}
                  color={isDark ? MODULE_ICON_DARK : MODULE_ICON_LIGHT}
                  strokeWidth={2.5}
                />
              </View>
              <View style={styles.moduleHeaderText}>
                <Text
                  style={[
                    styles.moduleLabel,
                    {
                      color: isDark ? MODULE_MUTED_DARK : MODULE_MUTED_LIGHT,
                    },
                  ]}
                >
                  Module {def.moduleNumber}
                </Text>
                <Text
                  style={[
                    styles.moduleTitle,
                    { color: isDark ? MODULE_INK_DARK : MODULE_INK_LIGHT },
                  ]}
                >
                  {def.title}
                </Text>
              </View>
            </View>

            {pdfs.map((pdf) => (
              <TouchableOpacity
                key={pdf.id}
                style={[styles.pdfRow, isDark && styles.pdfRowDark]}
                activeOpacity={0.7}
                onPress={() => openPdf(slug, pdf)}
              >
                <FileText
                  size={20}
                  color={isDark ? MODULE_ICON_DARK : MODULE_ICON_LIGHT}
                />
                <Text
                  style={[
                    styles.pdfTitle,
                    { color: isDark ? MODULE_INK_DARK : MODULE_INK_LIGHT },
                  ]}
                  numberOfLines={2}
                >
                  {pdf.title}
                </Text>
                <ChevronRight
                  size={18}
                  color={isDark ? MODULE_CHEVRON_DARK : MODULE_CHEVRON_LIGHT}
                />
              </TouchableOpacity>
            ))}

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
                color={isDark ? MODULE_ICON_DARK : MODULE_ICON_LIGHT}
              />
              <View style={styles.workbookRowText}>
                <Text
                  style={[
                    styles.pdfTitle,
                    { color: isDark ? MODULE_INK_DARK : MODULE_INK_LIGHT },
                  ]}
                  numberOfLines={2}
                >
                  {def.title} Workbook
                </Text>
                <Text
                  style={[
                    styles.workbookRowHint,
                    { color: isDark ? MODULE_MUTED_DARK : MODULE_MUTED_LIGHT },
                  ]}
                  numberOfLines={2}
                >
                  Module {def.moduleNumber} digital workbook
                </Text>
              </View>
              <ChevronRight
                size={18}
                color={isDark ? MODULE_CHEVRON_DARK : MODULE_CHEVRON_LIGHT}
                style={styles.workbookRowChevron}
              />
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  pdfRowDark: {
    backgroundColor: "#262940",
  },
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
