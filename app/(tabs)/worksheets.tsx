import { HabitRemindersModal } from "@/components/habit-reminders-modal";
import { MainTabHeader } from "@/components/main-tab-header";
import { MODULE_CARD_BACKGROUNDS } from "@/components/module-card-art";
import { PageHeading } from "@/components/page-heading";
import { MODULE_ORDER, MODULE_THEMES } from "@/constants/module-themes";
import { mixHex } from "@/constants/pastel-accents";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import { MODULE_SUMMARIES } from "@/data/module-summaries";
import { MODULE_WORKBOOKS } from "@/data/module-workbooks";
import { MODULE_PDFS, type PdfEntry } from "@/data/pdf-assets";
import { FREE_MODULE_SLUGS } from "@/lib/free-preview-video";
import { hrefModuleDigitalWorkbook } from "@/lib/module-workbook-route";
import { hasAnyHabitReminder } from "@/services/notifications";
import { requireModuleAccess } from "@/services/purchases";
import { useFocusEffect, useRouter } from "expo-router";
import {
  AlignLeft,
  Bell,
  ChevronRight,
  Crown,
  FileText,
  Smartphone,
} from "lucide-react-native";
import { Fragment, useCallback, useState } from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FREE_MODULE_COUNT = FREE_MODULE_SLUGS.length;

/** Module worksheet cards: neutral ink over illustrated art. */
const MODULE_INK_LIGHT = "#1E2430";
const MODULE_MUTED_LIGHT = "#5C6370";
const MODULE_ICON_LIGHT = "#374151";
const MODULE_CHEVRON_LIGHT = "#6B7280";
/** Sleep art stays dark — light type for headings only. */
const SLEEP_TITLE = "#FFFFFF";
const SLEEP_MUTED = "rgba(255,255,255,0.78)";

export default function WorksheetsScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [habitRemindersOn, setHabitRemindersOn] = useState(false);

  const refreshHabitBell = useCallback(() => {
    void hasAnyHabitReminder().then(setHabitRemindersOn);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshHabitBell();
    }, [refreshHabitBell]),
  );

  const openPdf = async (slug: string, pdf: PdfEntry) => {
    if (!(await requireModuleAccess(slug))) return;
    router.push({
      pathname: "/pdf-viewer",
      params: { pdfKey: pdf.id, title: pdf.title },
    });
  };

  const openDigitalWorkbook = async (slug: string) => {
    if (!(await requireModuleAccess(slug))) return;
    router.push(hrefModuleDigitalWorkbook(slug));
  };

  const openModuleSummary = async (slug: string) => {
    if (!(await requireModuleAccess(slug))) return;
    router.push({
      pathname: "/module-summary/[slug]",
      params: { slug },
    });
  };

  return (
    <View style={[styles.screen, isDark && styles.containerDark]}>
      <ScrollView
        style={[styles.container, isDark && styles.containerDark]}
        contentContainerStyle={[
          styles.content,
          { paddingTop: 8, paddingBottom: insets.bottom + 40 },
        ]}
      >
        <MainTabHeader />
        <PageHeading
          showPremiumBadge
          title="Module Worksheets"
          subtitle="Read module summaries, print PDFs, or use the Digital Workbooks for typed answers that save on this device."
          trailing={
            <Pressable
              onPress={() => setHabitModalOpen(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={({ pressed }) => [
                styles.bellButton,
                isDark && styles.bellButtonDark,
                habitRemindersOn && styles.bellButtonActive,
                { opacity: pressed ? 0.75 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Habit reminders"
            >
              <View pointerEvents="none">
                <Bell
                  size={22}
                  color={
                    habitRemindersOn
                      ? "#FFFFFF"
                      : isDark
                        ? "#C4B5E8"
                        : MAIN_PURPLE
                  }
                  strokeWidth={2.2}
                  fill={habitRemindersOn ? "#FFFFFF" : "transparent"}
                />
              </View>
            </Pressable>
          }
        />

        {MODULE_ORDER.map((slug, index) => {
          const pdfs = MODULE_PDFS[slug] ?? [];
          const def = MODULE_WORKBOOKS[slug];
          const theme = MODULE_THEMES[slug];
          const summary = MODULE_SUMMARIES[slug] ?? [];
          if (!def || !theme) return null;
          const Icon = theme.Icon;
          const background = MODULE_CARD_BACKGROUNDS[slug];
          const isSleep = slug === "sleep";
          const headingColor = isSleep ? SLEEP_TITLE : MODULE_INK_LIGHT;
          const headingMuted = isSleep ? SLEEP_MUTED : MODULE_MUTED_LIGHT;
          const showPremiumHeader = index === FREE_MODULE_COUNT;

          return (
            <Fragment key={slug}>
              {showPremiumHeader ? (
                <View
                  style={styles.premiumModulesHeader}
                  accessibilityRole="header"
                  accessibilityLabel="Premium Only modules"
                >
                  <View pointerEvents="none">
                    <Crown
                      size={18}
                      color={isDark ? "#8B75C4" : "#3D348B"}
                      strokeWidth={2.2}
                    />
                  </View>
                  <Text
                    style={[
                      styles.premiumModulesLabel,
                      isDark && styles.premiumModulesLabelDark,
                    ]}
                  >
                    Premium Only
                  </Text>
                </View>
              ) : null}
              <ImageBackground
                source={background}
                style={[
                  styles.moduleCard,
                  { backgroundColor: theme.backgroundColor },
                ]}
                imageStyle={styles.moduleCardImage}
                resizeMode="cover"
              >
                <View style={styles.moduleCardContent}>
                  <View style={styles.moduleCardHeader}>
                    <View style={styles.moduleIconCircle}>
                      <View pointerEvents="none">
                        <Icon
                          size={26}
                          color={MODULE_ICON_LIGHT}
                          strokeWidth={2.5}
                        />
                      </View>
                    </View>
                    <View style={styles.moduleHeaderText}>
                      <Text
                        style={[styles.moduleLabel, { color: headingMuted }]}
                      >
                        Module {def.moduleNumber} — {theme.shortName}
                      </Text>
                      <Text
                        style={[styles.moduleTitle, { color: headingColor }]}
                      >
                        {def.title}
                      </Text>
                    </View>
                  </View>

                  {summary.length > 0 ? (
                    <View style={styles.sectionBlock}>
                      <Text
                        style={[styles.sectionTitle, { color: headingColor }]}
                      >
                        Module summary
                      </Text>
                      <TouchableOpacity
                        style={styles.pdfRow}
                        activeOpacity={0.7}
                        onPress={() => openModuleSummary(slug)}
                        accessibilityRole="button"
                        accessibilityLabel={`Open module ${def.moduleNumber} summary`}
                      >
                        <View pointerEvents="none">
                          <AlignLeft size={20} color={MODULE_ICON_LIGHT} />
                        </View>
                        <View style={styles.workbookRowText}>
                          <Text
                            style={[
                              styles.pdfTitle,
                              { color: MODULE_INK_LIGHT },
                            ]}
                            numberOfLines={2}
                          >
                            Read module summary
                          </Text>
                          <Text
                            style={[
                              styles.workbookRowHint,
                              { color: MODULE_MUTED_LIGHT },
                            ]}
                            numberOfLines={1}
                          >
                            {summary.length} key ideas from this module
                          </Text>
                        </View>
                        <View pointerEvents="none">
                          <ChevronRight
                            size={18}
                            color={MODULE_CHEVRON_LIGHT}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {pdfs.length > 0 ? (
                    <View style={styles.sectionBlock}>
                      <Text
                        style={[styles.sectionTitle, { color: headingColor }]}
                      >
                        Printable worksheets
                      </Text>
                      {pdfs.map((pdf) => (
                        <TouchableOpacity
                          key={pdf.id}
                          style={styles.pdfRow}
                          activeOpacity={0.7}
                          onPress={() => openPdf(slug, pdf)}
                          accessibilityRole="button"
                          accessibilityLabel={`Open PDF: ${pdf.title}`}
                        >
                          <View pointerEvents="none">
                            <FileText size={20} color={MODULE_ICON_LIGHT} />
                          </View>
                          <Text
                            style={[
                              styles.pdfTitle,
                              { color: MODULE_INK_LIGHT },
                            ]}
                            numberOfLines={2}
                          >
                            {pdf.title}
                          </Text>
                          <View pointerEvents="none">
                            <ChevronRight
                              size={18}
                              color={MODULE_CHEVRON_LIGHT}
                            />
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}

                  <View style={styles.sectionBlock}>
                    <Text
                      style={[styles.sectionTitle, { color: headingColor }]}
                    >
                      Digital Workbook
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.pdfRow,
                        styles.digitalWorkbookRow,
                        {
                          backgroundColor: mixHex(
                            mixHex(
                              theme.backgroundColor,
                              theme.iconColor,
                              0.88,
                            ),
                            "#000000",
                            0.1,
                          ),
                        },
                      ]}
                      activeOpacity={0.7}
                      onPress={() => openDigitalWorkbook(slug)}
                      accessibilityRole="button"
                      accessibilityLabel={`Open module ${def.moduleNumber} digital workbook for ${def.title}`}
                    >
                      <View
                        pointerEvents="none"
                        style={styles.digitalWorkbookIcon}
                      >
                        <Smartphone size={20} color="#FFFFFF" />
                      </View>
                      <View style={styles.workbookRowText}>
                        <Text
                          style={[styles.pdfTitle, styles.digitalWorkbookTitle]}
                          numberOfLines={2}
                        >
                          {def.title} Workbook
                        </Text>
                      </View>
                      <View
                        pointerEvents="none"
                        style={styles.workbookRowChevron}
                      >
                        <ChevronRight size={18} color="#FFFFFF" />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </ImageBackground>
            </Fragment>
          );
        })}
      </ScrollView>

      <HabitRemindersModal
        visible={habitModalOpen}
        onClose={() => setHabitModalOpen(false)}
        onChanged={refreshHabitBell}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
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
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F4EEFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: -10,
  },
  bellButtonDark: {
    backgroundColor: "#2A2440",
  },
  bellButtonActive: {
    backgroundColor: MAIN_PURPLE,
  },
  premiumModulesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 2,
  },
  premiumModulesLabel: {
    fontSize: 16,
    fontFamily: AppFonts.headingBold,
    color: "#3D348B",
  },
  premiumModulesLabelDark: {
    color: "#8B75C4",
  },
  moduleCard: {
    borderRadius: 22,
    marginBottom: 16,
    overflow: "hidden",
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
  moduleCardImage: {
    borderRadius: 22,
  },
  moduleCardContent: {
    padding: 18,
  },
  moduleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
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
  sectionBlock: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  pdfRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
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
  digitalWorkbookRow: {
    alignItems: "flex-start",
    paddingVertical: 12,
    marginBottom: 0,
  },
  digitalWorkbookIcon: {
    marginTop: 3,
  },
  digitalWorkbookTitle: {
    color: "#FFFFFF",
  },
  digitalWorkbookHint: {
    color: "rgba(255,255,255,0.85)",
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
