import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import {
  SCREEN_BACK_BUTTON_WIDTH,
  ScreenBackButton,
} from "@/components/screen-back-button";
import {
  createInitialWorkbookData,
  EVENING_AUDIT_PRESET_TIMES,
  mergeModuleWorkbookData,
  MODULE_WORKBOOKS,
  type ModuleWorkbookData,
  type WorkbookPlanSection,
  type WorkbookPlanSectionData,
} from "@/data/module-workbooks";
import { useTheme } from "@/context/theme-context";
import {
  getModuleWorkbook,
  saveModuleWorkbook,
} from "@/services/module-workbooks";
import { Image } from "expo-image";
import { Picker } from "@react-native-picker/picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronDown, ChevronRight, ChevronUp, Check } from "lucide-react-native";
import { RectButton } from "react-native-gesture-handler";
import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  BackHandler,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
  UIManager,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** PDF-aligned strip colours (navy + app purple). */
const WORKBOOK_BRAND_NAVY = "#2B2F4A";
const WORKBOOK_TEXT = "#1E2430";
const WORKBOOK_TEXT_BODY = "#363C48";

const WORKBOOK_LOGO = require("@/assets/images/icon.png");

function dismissWorkbookKeyboard() {
  Keyboard.dismiss();
}

const RATING_SCALE_1_5 = [1, 2, 3, 4, 5] as const;

const AUDIT_TIME_PICKER_NONE = "__audit_time_none__";

const EVENING_AUDIT_PRESET_SET = new Set<string>([
  ...EVENING_AUDIT_PRESET_TIMES,
]);

/** Maps stored values to 1–5 for display; migrates legacy 6–10 from the old 1–10 scale. */
function normalizeStoredEnergyRating1to5(raw: string): string {
  const t = raw.trim();
  if (t === "") return "";
  const n = Number(t);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return "";
  if (n >= 1 && n <= 5) return String(n);
  if (n >= 6 && n <= 10) {
    return String(Math.min(5, Math.max(1, Math.round((n / 10) * 5))));
  }
  return "";
}

type SaveState = "loading" | "saving" | "saved";

function useAndroidKeyboardScroll(scrollRef: RefObject<ScrollView | null>) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isEditingText, setIsEditingText] = useState(false);
  const scrollYRef = useRef(0);
  const keyboardHeightRef = useRef(0);
  const lastFocusedTargetRef = useRef<number | null>(null);
  const blurClearTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const scrollTargetIntoView = useCallback(
    (target: number, kbHeight: number) => {
      UIManager.measureInWindow(target, (_x, y, _width, height) => {
        const windowHeight = Dimensions.get("window").height;
        const visibleBottom = windowHeight - kbHeight - 24;
        const inputBottom = y + height;

        if (inputBottom > visibleBottom) {
          scrollRef.current?.scrollTo({
            y: scrollYRef.current + (inputBottom - visibleBottom),
            animated: true,
          });
        }
      });
    },
    [scrollRef],
  );

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      keyboardHeightRef.current = event.endCoordinates.height;
      setKeyboardHeight(event.endCoordinates.height);
      setIsEditingText(true);
      if (Platform.OS !== "android") return;
      const target = lastFocusedTargetRef.current;
      if (target != null) {
        setTimeout(() => {
          scrollTargetIntoView(target, event.endCoordinates.height);
        }, 50);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      keyboardHeightRef.current = 0;
      setKeyboardHeight(0);
      setIsEditingText(false);
      lastFocusedTargetRef.current = null;
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [scrollTargetIntoView]);

  useEffect(() => {
    return () => {
      if (blurClearTimeoutRef.current) {
        clearTimeout(blurClearTimeoutRef.current);
      }
    };
  }, []);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  }, []);

  const scrollInputIntoView = useCallback(
    (event: NativeSyntheticEvent<TextInputFocusEventData>) => {
      if (blurClearTimeoutRef.current) {
        clearTimeout(blurClearTimeoutRef.current);
        blurClearTimeoutRef.current = null;
      }
      setIsEditingText(true);

      if (Platform.OS !== "android") return;

      const target = event.nativeEvent.target;
      if (typeof target !== "number") return;

      lastFocusedTargetRef.current = target;
      setTimeout(() => {
        scrollTargetIntoView(
          target,
          keyboardHeightRef.current || 280,
        );
      }, 120);
    },
    [scrollTargetIntoView],
  );

  const onInputBlur = useCallback(() => {
    if (blurClearTimeoutRef.current) {
      clearTimeout(blurClearTimeoutRef.current);
    }
    // Delay so moving focus between fields does not flash the scroll FAB.
    blurClearTimeoutRef.current = setTimeout(() => {
      setIsEditingText(false);
      blurClearTimeoutRef.current = null;
    }, 150);
  }, []);

  return {
    keyboardHeight,
    isEditingText,
    onScroll,
    scrollInputIntoView,
    onInputBlur,
    scrollYRef,
    contentPaddingBottom: Platform.OS === "android" ? 40 + keyboardHeight : 40,
  };
}

export default function ModuleWorkbookScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const definition = slug ? MODULE_WORKBOOKS[slug] : undefined;
  const digitalWorkbookPageTitles = useMemo(() => {
    if (!definition) return [] as string[];
    const labels: string[] = [];
    for (const ws of definition.worksheetDefinitions) {
      if (
        ws.digitalPageLabel &&
        labels[labels.length - 1] !== ws.digitalPageLabel
      ) {
        labels.push(ws.digitalPageLabel);
      }
    }
    return labels;
  }, [definition]);

  const initialData = useMemo(
    () => (definition ? createInitialWorkbookData(definition) : null),
    [definition]
  );

  const [formData, setFormData] = useState<ModuleWorkbookData | null>(initialData);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const hasHydratedRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<string, View | null>>({});
  const {
    keyboardHeight,
    isEditingText,
    onScroll,
    scrollInputIntoView,
    onInputBlur,
    contentPaddingBottom,
    scrollYRef,
  } = useAndroidKeyboardScroll(scrollRef);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [auditTimePickerTarget, setAuditTimePickerTarget] = useState<{
    auditIndex: number;
    rowIndex: number;
  } | null>(null);

  const workbookIndexItems = useMemo(() => {
    if (!definition) return [];
    const items: { id: string; label: string }[] = [];
    if (definition.weeklyPlanSections.length > 0) {
      items.push({
        id: "section-weekly",
        label: definition.weeklyPlanCardTitle,
      });
    }
    if (
      definition.includeEveningAudit &&
      (formData?.eveningAudits?.length ?? 0) > 0
    ) {
      items.push({
        id: "section-audit",
        label: definition.eveningAuditCardTitle,
      });
    }
    for (const ws of definition.worksheetDefinitions) {
      items.push({
        id: `section-ws-${ws.id}`,
        label: ws.title,
      });
    }
    if (definition.journalCardTitle) {
      items.push({
        id: "section-journal",
        label: definition.journalCardTitle,
      });
    }
    return items;
  }, [definition, formData?.eveningAudits?.length]);

  const bindSectionRef = useCallback(
    (id: string) => (node: View | null) => {
      sectionRefs.current[id] = node;
    },
    [],
  );

  const scrollToSection = useCallback(
    (id: string, attempt = 0) => {
      const sectionView = sectionRefs.current[id];
      const scrollView = scrollRef.current;
      if (!sectionView || !scrollView) {
        if (attempt < 4) {
          requestAnimationFrame(() => scrollToSection(id, attempt + 1));
        }
        return;
      }

      sectionView.measureInWindow((_x, sectionY) => {
        scrollView.measureInWindow((_sx, scrollViewportY) => {
          const y = scrollYRef.current + (sectionY - scrollViewportY) - 12;
          scrollView.scrollTo({ y: Math.max(0, y), animated: true });
        });
      });
    },
    [scrollYRef],
  );

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScroll(event);
      const y = event.nativeEvent.contentOffset.y;
      setShowScrollTop((prev) => {
        const next = y > 360;
        return prev === next ? prev : next;
      });
    },
    [onScroll],
  );

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, []);

  const closeAuditTimePicker = useCallback(() => {
    requestAnimationFrame(() => {
      setAuditTimePickerTarget(null);
    });
  }, []);

  useEffect(() => {
    if (auditTimePickerTarget === null) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeAuditTimePicker();
      return true;
    });
    return () => sub.remove();
  }, [auditTimePickerTarget, closeAuditTimePicker]);

  const updatePlanAction = useCallback((sectionId: string, value: string) => {
    setFormData((current) => {
      if (!current) return current;
      return {
        ...current,
        weeklyPlan: {
          ...current.weeklyPlan,
          [sectionId]: {
            ...current.weeklyPlan[sectionId],
            action: value,
          },
        },
      };
    });
  }, []);

  const togglePlanDayCompleted = useCallback(
    (sectionId: string, dayIndex: number) => {
      setFormData((current) => {
        if (!current) return current;
        const section = current.weeklyPlan[sectionId];
        if (!section) return current;
        const nextDays = [...section.daysCompleted];
        nextDays[dayIndex] = !nextDays[dayIndex];
        return {
          ...current,
          weeklyPlan: {
            ...current.weeklyPlan,
            [sectionId]: {
              ...section,
              daysCompleted: nextDays,
            },
          },
        };
      });
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    async function loadWorkbook() {
      if (!slug || !initialData) return;
      const stored = await getModuleWorkbook(slug, initialData);
      if (!isMounted) return;
      setFormData(mergeModuleWorkbookData(stored, initialData));
      setSaveState("saved");
      hasHydratedRef.current = true;
    }

    loadWorkbook();

    return () => {
      isMounted = false;
    };
  }, [slug, initialData]);

  useEffect(() => {
    if (!slug || !formData || !hasHydratedRef.current) return;

    const timeout = setTimeout(async () => {
      setSaveState("saving");
      try {
        await saveModuleWorkbook(slug, formData);
      } finally {
        setSaveState("saved");
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [formData, slug]);

  if (!definition || !initialData || !formData) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View
          style={[
            styles.missingState,
            { backgroundColor: isDark ? "#121222" : "#F5F5F7" },
          ]}
        >
          <Text style={[styles.missingTitle, isDark && styles.textDark]}>
            Workbook not available
          </Text>
        </View>
      </>
    );
  }

  const updateAuditRow = (
    auditIndex: number,
    rowIndex: number,
    field: "time" | "activity",
    value: string
  ) => {
    setFormData((current) => {
      if (!current) return current;
      const nextAudits = current.eveningAudits.map((audit, currentAuditIndex) => {
        if (currentAuditIndex !== auditIndex) return audit;
        return {
          ...audit,
          rows: audit.rows.map((row, currentRowIndex) =>
            currentRowIndex === rowIndex ? { ...row, [field]: value } : row
          ),
        };
      });

      return {
        ...current,
        eveningAudits: nextAudits,
      };
    });
  };

  const updateWorksheetField = (
    worksheetId: string,
    fieldId: string,
    value: string
  ) => {
    setFormData((current) => {
      if (!current) return current;
      return {
        ...current,
        worksheets: {
          ...current.worksheets,
          [worksheetId]: {
            ...(current.worksheets?.[worksheetId] ?? {}),
            [fieldId]: value,
          },
        },
      };
    });
  };

  const updateJournalEntry = (value: string) => {
    setFormData((current) =>
      current
        ? {
            ...current,
            journalEntry: value,
          }
        : current
    );
  };

  const saveStatusText =
    saveState === "loading"
      ? "Loading your saved answers..."
      : saveState === "saving"
        ? "Saving..."
        : "Answers are saved on this device";
  /**
   * `KeyboardAvoidingView` only wraps the scroll area — the custom header is a
   * sibling above it. Do NOT pass the header height as `keyboardVerticalOffset`
   * (that was inflating bottom padding on iOS and showing a large empty band
   * above the keyboard). Use 0; the KAV’s frame already starts below the header.
   */
  const keyboardVerticalOffset = 0;

  const auditTimePickerRow =
    auditTimePickerTarget !== null
      ? formData.eveningAudits[auditTimePickerTarget.auditIndex]?.rows[
          auditTimePickerTarget.rowIndex
        ]
      : undefined;
  const auditTimePickerValueRaw = auditTimePickerRow?.time?.trim() ?? "";
  const auditTimePickerSelectedValue =
    auditTimePickerValueRaw === ""
      ? AUDIT_TIME_PICKER_NONE
      : auditTimePickerValueRaw;
  const auditTimePickerHasLegacyValue =
    auditTimePickerValueRaw !== "" &&
    !EVENING_AUDIT_PRESET_SET.has(auditTimePickerValueRaw);

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={styles.screenRoot}>
        <View
          style={[
            styles.customHeader,
            {
              paddingTop: insets.top,
              backgroundColor: isDark ? "#1A1A2E" : WORKBOOK_BRAND_NAVY,
            },
          ]}
        >
          <ScreenBackButton color={isDark ? "#ECEDEE" : "#FFFFFF"} />
          <Text
            pointerEvents="none"
            style={[
              styles.customHeaderTitle,
              { color: isDark ? "#ECEDEE" : "#FFFFFF" },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            Module {definition.moduleNumber} Workbook
          </Text>
          <View pointerEvents="none" style={styles.customHeaderSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          enabled={Platform.OS === "ios"}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {/**
           * Do NOT use `automaticallyAdjustKeyboardInsets` on iOS: it fights
           * KeyboardAvoidingView and can scroll the focused field under
           * the header or yank content to the top of the screen.
           * On Android, enable it plus extra bottom padding + focus scroll.
           */}
          <ScrollView
            ref={scrollRef}
            style={[styles.container, isDark && styles.containerDark]}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: contentPaddingBottom },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            automaticallyAdjustKeyboardInsets={Platform.OS === "android"}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
          <View
            style={[styles.heroCard, isDark && styles.heroCardDarkShell]}
            collapsable={false}
          >
            <View
              style={[styles.heroBrandBand, isDark && styles.heroBrandBandDark]}
            >
              <View style={styles.heroBrandTopRow}>
                <Image
                  source={WORKBOOK_LOGO}
                  style={styles.heroBrandLogo}
                  contentFit="contain"
                  accessibilityLabel="Course branding"
                />
                <View style={styles.heroBrandTitles}>
                  <Text style={styles.heroModuleLabelOnBrand}>
                    MODULE {definition.moduleNumber}
                  </Text>
                  <Text
                    style={styles.heroTitleOnBrand}
                    numberOfLines={4}
                  >
                    {definition.title}
                  </Text>
                </View>
              </View>
              <Text style={styles.heroTagline}>Unlock your potential</Text>
            </View>
            <View
              style={[styles.heroAccentBar, isDark && styles.heroAccentBarDark]}
            />
            <View
              style={[
                styles.heroIntroBlock,
                isDark && styles.heroIntroBlockDark,
              ]}
            >
              <Text
                style={[styles.heroBody, isDark && styles.heroBodyDark]}
              >
                {definition.intro}
              </Text>
              <Text
                style={[styles.saveState, isDark && styles.saveStateOnDark]}
              >
                {saveStatusText}
              </Text>
            </View>
          </View>

          <View style={styles.sectionStack} collapsable={false}>
            {/* ── Contents / index ── */}
            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                In this workbook
              </Text>
              <Text
                style={[styles.sectionBody, isDark && styles.sectionBodyDark]}
              >
                Jump to a section.
              </Text>
              <View
                style={[
                  styles.indexList,
                  isDark && styles.indexListDark,
                ]}
              >
                {workbookIndexItems.map((item, rowIndex) => (
                  <RectButton
                    key={item.id}
                    onPress={() => scrollToSection(item.id)}
                    style={[
                      styles.indexRow,
                      isDark && styles.indexRowDark,
                      rowIndex === workbookIndexItems.length - 1 &&
                        styles.indexRowLast,
                    ]}
                    underlayColor={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}
                    accessibilityRole="button"
                    accessibilityLabel={`Go to ${item.label}`}
                  >
                    <View style={styles.indexRowInner} pointerEvents="none">
                      <Text
                        style={[styles.indexRowLabel, isDark && styles.textDark]}
                        numberOfLines={2}
                      >
                        {item.label}
                      </Text>
                      <ChevronRight
                        size={20}
                        color={isDark ? "#A8ACBF" : MAIN_PURPLE}
                        strokeWidth={2}
                      />
                    </View>
                  </RectButton>
                ))}
              </View>
            </View>

            {/* ── Weekly Plan ── */}
            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
              ref={bindSectionRef("section-weekly")}
              collapsable={false}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                {definition.weeklyPlanCardTitle}
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.sectionBodyDark]}>
                {definition.weeklyPlanCardDescription}
              </Text>

              {definition.weeklyPlanSections.map((section) => (
                <WeeklyPlanSectionView
                  key={section.id}
                  section={section}
                  plan={formData.weeklyPlan[section.id]}
                  isDark={isDark}
                  onToggleDay={togglePlanDayCompleted}
                  onPlanAction={updatePlanAction}
                  onInputFocus={scrollInputIntoView}
                  onInputBlur={onInputBlur}
                />
              ))}
            </View>

            {definition.includeEveningAudit && formData.eveningAudits.length > 0 && (
            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
              ref={bindSectionRef("section-audit")}
              collapsable={false}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                {definition.eveningAuditCardTitle}
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.sectionBodyDark]}>
                {definition.eveningAuditCardDescription}
              </Text>

              {formData.eveningAudits.map((audit, auditIndex) => (
                <View key={`audit-${auditIndex}`} style={styles.auditBlock}>
                  <Text style={[styles.planTitle, isDark && styles.textDark]}>
                    {definition.auditBlockLabel(auditIndex)}
                  </Text>
                  {audit.rows.map((row, rowIndex) =>
                    rowIndex === 0 ? (
                      <View
                        key={`audit-row-${auditIndex}-${rowIndex}`}
                        style={styles.auditHeaderRow}
                      >
                        <Text
                          style={[
                            styles.auditColumnHeader,
                            styles.auditColumnHeaderTime,
                            isDark && styles.mutedDark,
                          ]}
                        >
                          Time
                        </Text>
                        <Text
                          style={[
                            styles.auditColumnHeader,
                            styles.auditColumnHeaderActivity,
                            isDark && styles.mutedDark,
                          ]}
                        >
                          Activity
                        </Text>
                      </View>
                    ) : (
                      <View
                        key={`audit-row-${auditIndex}-${rowIndex}`}
                        style={styles.auditRow}
                      >
                        <RectButton
                          onPress={() => {
                            setAuditTimePickerTarget({
                              auditIndex,
                              rowIndex,
                            });
                          }}
                          style={[
                            styles.ratingPickerTrigger,
                            styles.auditTimePickerTrigger,
                            isDark && styles.ratingPickerTriggerDark,
                          ]}
                          underlayColor={
                            isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"
                          }
                          accessibilityRole="button"
                          accessibilityLabel={
                            row.time.trim()
                              ? `Time ${row.time}, change`
                              : "Choose time"
                          }
                        >
                          <View
                            style={styles.auditTimePickerInner}
                            pointerEvents="none"
                          >
                            <Text
                              style={[
                                styles.ratingPickerTriggerText,
                                !row.time.trim() &&
                                  styles.ratingPickerTriggerPlaceholder,
                                isDark &&
                                  !!row.time.trim() &&
                                  styles.textDark,
                                isDark &&
                                  !row.time.trim() &&
                                  styles.ratingPickerTriggerPlaceholderDark,
                              ]}
                              numberOfLines={1}
                            >
                              {row.time.trim()
                                ? row.time.trim()
                                : "Choose time…"}
                            </Text>
                            <ChevronDown
                              size={20}
                              color={isDark ? "#A8ACBF" : MAIN_PURPLE}
                              strokeWidth={2}
                            />
                          </View>
                        </RectButton>
                        <TextInput
                          value={row.activity}
                          onChangeText={(value) =>
                            updateAuditRow(
                              auditIndex,
                              rowIndex,
                              "activity",
                              value,
                            )
                          }
                          onFocus={scrollInputIntoView}
                          onBlur={onInputBlur}
                          placeholder="What were you doing?"
                          placeholderTextColor={isDark ? "#7B7E95" : "#9CA3AF"}
                          multiline
                          textAlignVertical="top"
                          style={[
                            styles.activityInput,
                            isDark && styles.inputDark,
                            isDark && styles.textDark,
                          ]}
                        />
                      </View>
                    ),
                  )}
                </View>
              ))}
            </View>
            )}

            {/* ── Interactive Worksheets (grouped into PDF-aligned pages) ── */}
            {definition.worksheetDefinitions.map((ws, worksheetIndex) => {
              const prevLabel =
                definition.worksheetDefinitions[worksheetIndex - 1]
                  ?.digitalPageLabel;
              const showPageBreak =
                !!ws.digitalPageLabel && ws.digitalPageLabel !== prevLabel;
              const pageNum =
                ws.digitalPageLabel &&
                digitalWorkbookPageTitles.length > 0
                  ? digitalWorkbookPageTitles.indexOf(ws.digitalPageLabel) + 1
                  : 0;

              return (
                <Fragment key={ws.id}>
                  {showPageBreak ? (
                    <View
                      style={[
                        styles.workbookPageBreak,
                        isDark && styles.workbookPageBreakDark,
                      ]}
                    >
                      <Text
                        style={[
                          styles.workbookPageEyebrow,
                          isDark
                            ? styles.workbookPageEyebrowDark
                            : styles.workbookPageEyebrowLight,
                        ]}
                      >
                        Digital workbook
                        {pageNum > 0
                          ? ` · Page ${pageNum} of ${digitalWorkbookPageTitles.length}`
                          : ""}
                      </Text>
                      <Text
                        style={[
                          styles.workbookPageTitle,
                          isDark && styles.textDark,
                        ]}
                      >
                        {ws.digitalPageLabel}
                      </Text>
                    </View>
                  ) : null}
                  <View
                    style={[
                      styles.sectionCard,
                      isDark && styles.sectionCardDark,
                    ]}
                    ref={bindSectionRef(`section-ws-${ws.id}`)}
                    collapsable={false}
                  >
                    <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                      {ws.title}
                    </Text>
                    <Text
                      style={[
                        styles.sectionBody,
                        isDark && styles.sectionBodyDark,
                      ]}
                    >
                      {ws.description}
                    </Text>
                    {ws.fields.map((field) => {
                      const storedValue =
                        formData.worksheets?.[ws.id]?.[field.id] ?? "";

                      if (field.inputKind === "rating1to5") {
                        const display =
                          normalizeStoredEnergyRating1to5(storedValue);
                        return (
                          <View key={field.id} style={styles.worksheetField}>
                            <Text
                              style={[
                                styles.worksheetLabel,
                                isDark && styles.textDark,
                              ]}
                            >
                              {field.label}
                            </Text>
                            <View style={styles.ratingChipRow}>
                              {RATING_SCALE_1_5.map((n) => {
                                const selected = display === String(n);
                                return (
                                  <RectButton
                                    key={n}
                                    onPress={() =>
                                      updateWorksheetField(
                                        ws.id,
                                        field.id,
                                        String(n),
                                      )
                                    }
                                    style={[
                                      styles.ratingChip,
                                      isDark && styles.ratingChipDark,
                                      selected && styles.ratingChipSelected,
                                      selected &&
                                        isDark &&
                                        styles.ratingChipSelectedDark,
                                    ]}
                                    underlayColor={
                                      isDark
                                        ? "rgba(255,255,255,0.1)"
                                        : "rgba(108,99,255,0.12)"
                                    }
                                    accessibilityRole="button"
                                    accessibilityState={{ selected }}
                                    accessibilityLabel={`Energy rating ${n} of 5`}
                                  >
                                    <View pointerEvents="none">
                                      <Text
                                        style={[
                                          styles.ratingChipText,
                                          isDark && styles.ratingChipTextDark,
                                          selected &&
                                            styles.ratingChipTextSelected,
                                          selected &&
                                            isDark &&
                                            styles.ratingChipTextSelectedDark,
                                        ]}
                                      >
                                        {n}
                                      </Text>
                                    </View>
                                  </RectButton>
                                );
                              })}
                            </View>
                          </View>
                        );
                      }

                      const singleLine = field.multiline === false;
                      return (
                        <View key={field.id} style={styles.worksheetField}>
                          <Text
                            style={[
                              styles.worksheetLabel,
                              isDark && styles.textDark,
                            ]}
                          >
                            {field.label}
                          </Text>
                          <TextInput
                            value={storedValue}
                            onChangeText={(v) =>
                              updateWorksheetField(ws.id, field.id, v)
                            }
                            onFocus={scrollInputIntoView}
                            onBlur={onInputBlur}
                            placeholder={field.placeholder ?? "Type here"}
                            placeholderTextColor={
                              isDark ? "#7B7E95" : "#9CA3AF"
                            }
                            multiline={!singleLine}
                            returnKeyType={singleLine ? "done" : "default"}
                            blurOnSubmit={singleLine}
                            onSubmitEditing={
                              singleLine ? dismissWorkbookKeyboard : undefined
                            }
                            style={[
                              singleLine
                                ? styles.textInputSingle
                                : styles.textArea,
                              isDark && styles.inputDark,
                              isDark && styles.textDark,
                            ]}
                          />
                        </View>
                      );
                    })}
                  </View>
                </Fragment>
              );
            })}

            {/* ── Journal ── */}
            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
              ref={bindSectionRef("section-journal")}
              collapsable={false}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                {definition.journalCardTitle}
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.sectionBodyDark]}>
                {definition.journalCardDescription}
              </Text>
              <View style={styles.promptList}>
                {definition.journalPrompts.map((prompt, index) => (
                  <Text
                    key={`prompt-${index}`}
                    style={[styles.promptItem, isDark && styles.promptItemDark]}
                  >
                    {index + 1}. {prompt}
                  </Text>
                ))}
              </View>
              <TextInput
                value={formData.journalEntry}
                onChangeText={updateJournalEntry}
                onFocus={scrollInputIntoView}
                onBlur={onInputBlur}
                placeholder="Write your reflection here"
                placeholderTextColor={isDark ? "#7B7E95" : "#9CA3AF"}
                multiline
                textAlignVertical="top"
                style={[
                  styles.journalInput,
                  isDark && styles.inputDark,
                  isDark && styles.textDark,
                ]}
              />
            </View>
          </View>
        </ScrollView>

          {/**
           * Android already resizes/insets for the keyboard, so pin Done to the
           * bottom of this layout (not `bottom: keyboardHeight`, which jumps it
           * to the top of the screen).
           */}
          {Platform.OS === "android" && isEditingText ? (
            <View
              style={[
                styles.keyboardDoneBarAndroid,
                isDark && styles.keyboardDoneBarDark,
              ]}
            >
              <RectButton
                onPress={dismissWorkbookKeyboard}
                underlayColor="rgba(108, 99, 255, 0.12)"
                accessibilityRole="button"
                accessibilityLabel="Done editing"
                style={styles.keyboardDoneButton}
              >
                <View pointerEvents="none">
                  <Text
                    style={[
                      styles.keyboardDoneLabel,
                      isDark && styles.keyboardDoneLabelDark,
                    ]}
                  >
                    Done
                  </Text>
                </View>
              </RectButton>
            </View>
          ) : null}
      </KeyboardAvoidingView>

        {/**
         * iOS InputAccessoryView is unreliable (often missing). Pin Done just
         * above the keyboard using keyboard frame height instead.
         */}
        {Platform.OS === "ios" && keyboardHeight > 0 ? (
          <View
            style={[
              styles.keyboardDoneBarIos,
              isDark && styles.keyboardDoneBarDark,
              { bottom: keyboardHeight },
            ]}
          >
            <Pressable
              onPress={dismissWorkbookKeyboard}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Done editing"
              style={styles.keyboardDoneButton}
            >
              <View pointerEvents="none">
                <Text
                  style={[
                    styles.keyboardDoneLabel,
                    isDark && styles.keyboardDoneLabelDark,
                  ]}
                >
                  Done
                </Text>
              </View>
            </Pressable>
          </View>
        ) : null}

        {showScrollTop && !isEditingText ? (
          <RectButton
            style={[
              styles.scrollTopFab,
              { bottom: Math.max(insets.bottom, 12) + 16 },
            ]}
            underlayColor="rgba(255,255,255,0.18)"
            onPress={scrollToTop}
            accessibilityRole="button"
            accessibilityLabel="Scroll to top"
          >
            <View pointerEvents="none">
              <ChevronUp size={28} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          </RectButton>
        ) : null}

        {auditTimePickerTarget !== null ? (
          <View
            style={styles.ratingModalRoot}
            accessibilityViewIsModal
          >
            <Pressable
              style={styles.ratingModalBackdrop}
              onPress={closeAuditTimePicker}
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
            />
            <View
              style={[
                styles.ratingModalSheet,
                isDark && styles.ratingModalSheetDark,
                { paddingBottom: Math.max(insets.bottom, 12) + 8 },
              ]}
            >
              <View style={styles.ratingModalHeader}>
                <Text
                  style={[
                    styles.ratingModalTitle,
                    isDark && styles.textDark,
                  ]}
                  pointerEvents="none"
                >
                  Time
                </Text>
                <Pressable
                  onPress={closeAuditTimePicker}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Done"
                  style={styles.keyboardDoneButton}
                >
                  <View pointerEvents="none">
                    <Text style={styles.ratingModalDone}>Done</Text>
                  </View>
                </Pressable>
              </View>
              <Picker
                selectedValue={auditTimePickerSelectedValue}
                onValueChange={(itemValue) => {
                  if (!auditTimePickerTarget) return;
                  const v =
                    itemValue === AUDIT_TIME_PICKER_NONE
                      ? ""
                      : String(itemValue);
                  updateAuditRow(
                    auditTimePickerTarget.auditIndex,
                    auditTimePickerTarget.rowIndex,
                    "time",
                    v
                  );
                }}
                style={styles.ratingPickerWheel}
                {...(Platform.OS === "ios"
                  ? {
                      itemStyle: {
                        color: isDark ? "#ECEDEE" : WORKBOOK_TEXT,
                      },
                    }
                  : {})}
              >
                <Picker.Item
                  label="— Not set"
                  value={AUDIT_TIME_PICKER_NONE}
                  color={isDark ? "#ECEDEE" : WORKBOOK_TEXT}
                />
                {auditTimePickerHasLegacyValue ? (
                  <Picker.Item
                    label={`${auditTimePickerValueRaw} (saved)`}
                    value={auditTimePickerValueRaw}
                    color={isDark ? "#ECEDEE" : WORKBOOK_TEXT}
                  />
                ) : null}
                {EVENING_AUDIT_PRESET_TIMES.map((t) => (
                  <Picker.Item
                    key={t}
                    label={t}
                    value={t}
                    color={isDark ? "#ECEDEE" : WORKBOOK_TEXT}
                  />
                ))}
              </Picker>
            </View>
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
  },
  keyboardWrap: {
    flex: 1,
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 12,
    zIndex: 20,
  },
  customHeaderTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    textAlign: "center",
    flex: 1,
  },
  customHeaderSpacer: {
    minWidth: SCREEN_BACK_BUTTON_WIDTH,
  },
  scrollTopFab: {
    position: "absolute",
    right: 18,
    zIndex: 30,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MAIN_PURPLE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 6,
  },
  keyboardDoneBarIos: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 40,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C8C7CC",
    backgroundColor: "#F2F2F7",
  },
  keyboardDoneBarAndroid: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    minHeight: 44,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C8C7CC",
    backgroundColor: "#F2F2F7",
    elevation: 8,
  },
  keyboardDoneBarDark: {
    backgroundColor: "#1C1C1E",
    borderTopColor: "#3A3A3C",
  },
  keyboardDoneButton: {
    minHeight: 44,
    minWidth: 64,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  keyboardDoneLabel: {
    fontSize: 17,
    fontFamily: AppFonts.bodyBold,
    color: MAIN_PURPLE,
  },
  keyboardDoneLabelDark: {
    color: "#B8B4FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F3F2F7",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  contentContainer: {
    padding: 16,
  },
  textDark: {
    color: "#ECEDEE",
  },
  mutedDark: {
    color: "#AEB3C4",
  },
  sectionBodyDark: {
    color: "#CFD2E0",
  },
  planPromptDark: {
    color: "#C4C8D8",
  },
  promptItemDark: {
    color: "#C8CBD8",
  },
  workbookPageEyebrowLight: {
    color: MAIN_PURPLE,
  },
  workbookPageEyebrowDark: {
    color: "#A8B4E8",
  },
  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 0,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heroCardDarkShell: {
    backgroundColor: "#1A1D30",
  },
  heroBrandBand: {
    backgroundColor: WORKBOOK_BRAND_NAVY,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  heroBrandBandDark: {
    backgroundColor: "#242742",
  },
  heroBrandTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  heroBrandLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
  },
  heroBrandTitles: {
    flex: 1,
  },
  heroModuleLabelOnBrand: {
    fontSize: 11,
    fontFamily: AppFonts.headingBold,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroTitleOnBrand: {
    marginTop: 4,
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: "#FFFFFF",
    lineHeight: 28,
  },
  heroTagline: {
    marginTop: 14,
    fontSize: 14,
    fontFamily: AppFonts.bodyMedium,
    fontStyle: "italic",
    color: "rgba(255,255,255,0.9)",
  },
  heroAccentBar: {
    height: 5,
    backgroundColor: "#A8B4E8",
  },
  heroAccentBarDark: {
    backgroundColor: MAIN_PURPLE,
  },
  heroIntroBlock: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  heroIntroBlockDark: {
    backgroundColor: "#1E1E32",
  },
  heroBody: {
    fontSize: 15,
    lineHeight: 24,
    paddingBottom: 1,
    color: WORKBOOK_TEXT_BODY,
    fontFamily: AppFonts.bodyRegular,
  },
  heroBodyDark: {
    color: "#D8DBE8",
  },
  saveState: {
    marginTop: 14,
    fontSize: 13,
    color: "#3D8B7A",
    fontFamily: AppFonts.bodyBold,
  },
  saveStateOnDark: {
    color: "#7DCEB8",
  },
  sectionStack: {
    marginTop: 16,
    gap: 16,
  },
  indexList: {
    marginTop: 8,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E8EF",
  },
  indexListDark: {
    borderColor: "#2A2A3E",
  },
  indexRow: {
    backgroundColor: "#F9FAFB",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    overflow: "hidden",
  },
  indexRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  indexRowDark: {
    backgroundColor: "#141425",
    borderBottomColor: "#2A2A3E",
  },
  indexRowLast: {
    borderBottomWidth: 0,
  },
  indexRowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: WORKBOOK_TEXT,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionCardDark: {
    backgroundColor: "#1E1E32",
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: AppFonts.headingBold,
    color: WORKBOOK_TEXT,
  },
  sectionBody: {
    marginTop: 8,
    fontSize: 14,
    // RN 0.81 iOS Fabric can clip the last wrapped line (#53450).
    lineHeight: 22,
    paddingBottom: 1,
    color: WORKBOOK_TEXT_BODY,
    fontFamily: AppFonts.bodyRegular,
  },
  planSection: {
    marginTop: 18,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    color: WORKBOOK_TEXT,
  },
  planPrompt: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 22,
    paddingBottom: 1,
    color: WORKBOOK_TEXT_BODY,
    fontFamily: AppFonts.bodyRegular,
  },
  textArea: {
    minHeight: 84,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    color: WORKBOOK_TEXT,
    fontFamily: AppFonts.bodyRegular,
  },
  inputDark: {
    backgroundColor: "#141425",
    borderColor: "#34364A",
  },
  dayRows: {
    marginTop: 12,
    gap: 8,
  },
  dayRow: {
    borderRadius: 10,
    overflow: "hidden",
  },
  dayRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    minHeight: 48,
  },
  dayLabel: {
    flex: 1,
    fontSize: 14,
    color: WORKBOOK_TEXT_BODY,
    fontFamily: AppFonts.bodyMedium,
  },
  dayCheckbox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCheckboxDark: {
    backgroundColor: "#141425",
    borderColor: "#4B4D66",
  },
  dayCheckboxChecked: {
    backgroundColor: MAIN_PURPLE,
    borderColor: MAIN_PURPLE,
  },
  auditBlock: {
    marginTop: 18,
  },
  auditHeaderRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    alignItems: "center",
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  auditColumnHeader: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    color: WORKBOOK_TEXT_BODY,
    letterSpacing: 0.3,
  },
  auditColumnHeaderTime: {
    /** Narrow column — compact labels (“6 AM”) + chevron; frees width for Activity. */
    width: 84,
  },
  auditColumnHeaderActivity: {
    flex: 1,
  },
  auditRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    alignItems: "flex-start",
  },
  activityInput: {
    flex: 1,
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 20,
    color: WORKBOOK_TEXT,
    fontFamily: AppFonts.bodyRegular,
  },
  worksheetField: {
    marginTop: 14,
  },
  ratingChipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6,
  },
  ratingChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ratingChipDark: {
    backgroundColor: "#141425",
    borderColor: "#34364A",
  },
  ratingChipSelected: {
    borderColor: MAIN_PURPLE,
    backgroundColor: "#F4F0FB",
  },
  ratingChipSelectedDark: {
    borderColor: MAIN_PURPLE,
    backgroundColor: "#2A2540",
  },
  ratingChipText: {
    fontSize: 16,
    fontFamily: AppFonts.headingSemiBold,
    color: WORKBOOK_TEXT,
  },
  ratingChipTextDark: {
    color: "#D8DBE8",
  },
  ratingChipTextSelected: {
    color: MAIN_PURPLE,
  },
  ratingChipTextSelectedDark: {
    color: "#E9E4FA",
  },
  ratingPickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  ratingPickerTriggerDark: {
    backgroundColor: "#141425",
    borderColor: "#34364A",
  },
  ratingPickerTriggerText: {
    flex: 1,
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: WORKBOOK_TEXT,
  },
  ratingPickerTriggerPlaceholder: {
    color: "#9CA3AF",
    fontFamily: AppFonts.bodyRegular,
  },
  ratingPickerTriggerPlaceholderDark: {
    color: "#7B7E95",
  },
  auditTimePickerTrigger: {
    width: 84,
    flexGrow: 0,
    flexShrink: 0,
    paddingHorizontal: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  auditTimePickerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    minHeight: 44,
  },
  ratingModalRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    justifyContent: "flex-end",
  },
  ratingModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  ratingModalSheet: {
    zIndex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  ratingModalSheetDark: {
    backgroundColor: "#252838",
  },
  ratingModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 0,
    paddingBottom: 8,
  },
  ratingModalTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    color: WORKBOOK_TEXT,
  },
  ratingModalDone: {
    fontSize: 16,
    fontFamily: AppFonts.bodyBold,
    color: MAIN_PURPLE,
  },
  ratingPickerWheel: {
    width: "100%",
  },
  workbookPageBreak: {
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: MAIN_PURPLE,
    backgroundColor: "rgba(113, 135, 206, 0.1)",
  },
  workbookPageBreakDark: {
    backgroundColor: "rgba(113, 135, 206, 0.14)",
    borderLeftColor: "#A8B4E8",
  },
  workbookPageEyebrow: {
    fontSize: 12,
    fontFamily: AppFonts.bodyBold,
    letterSpacing: 0.4,
  },
  workbookPageTitle: {
    marginTop: 6,
    fontSize: 20,
    fontFamily: AppFonts.headingBold,
    color: WORKBOOK_TEXT,
  },
  textInputSingle: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: WORKBOOK_TEXT,
    fontFamily: AppFonts.bodyRegular,
  },
  worksheetLabel: {
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: WORKBOOK_TEXT,
    marginBottom: 8,
  },
  promptList: {
    marginTop: 14,
    gap: 8,
  },
  promptItem: {
    fontSize: 14,
    lineHeight: 22,
    paddingBottom: 1,
    color: WORKBOOK_TEXT_BODY,
    fontFamily: AppFonts.bodyRegular,
  },
  journalInput: {
    marginTop: 14,
    minHeight: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    lineHeight: 22,
    color: WORKBOOK_TEXT,
    fontFamily: AppFonts.bodyRegular,
  },
  missingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  missingTitle: {
    fontSize: 20,
    color: WORKBOOK_TEXT,
    fontFamily: AppFonts.headingBold,
  },
});

type PlanDayRowProps = {
  sectionId: string;
  dayIndex: number;
  done: boolean;
  isDark: boolean;
  onToggle: (sectionId: string, dayIndex: number) => void;
};

const PlanDayRow = memo(function PlanDayRow({
  sectionId,
  dayIndex,
  done,
  isDark,
  onToggle,
}: PlanDayRowProps) {
  return (
    <RectButton
      onPress={() => onToggle(sectionId, dayIndex)}
      style={styles.dayRow}
      underlayColor="transparent"
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={`Day ${dayIndex + 1}${
        done ? ", marked done" : ", not marked done"
      }`}
    >
      <View style={styles.dayRowInner} pointerEvents="none">
        <Text style={[styles.dayLabel, isDark && styles.mutedDark]}>
          Day {dayIndex + 1}
        </Text>
        <View
          style={[
            styles.dayCheckbox,
            isDark && styles.dayCheckboxDark,
            done && styles.dayCheckboxChecked,
          ]}
        >
          {done ? <Check size={18} color="#FFFFFF" strokeWidth={3} /> : null}
        </View>
      </View>
    </RectButton>
  );
});

type WeeklyPlanSectionViewProps = {
  section: WorkbookPlanSection;
  plan: WorkbookPlanSectionData;
  isDark: boolean;
  onToggleDay: (sectionId: string, dayIndex: number) => void;
  onPlanAction: (sectionId: string, value: string) => void;
  onInputFocus: (event: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onInputBlur: () => void;
};

const WeeklyPlanSectionView = memo(function WeeklyPlanSectionView({
  section,
  plan,
  isDark,
  onToggleDay,
  onPlanAction,
  onInputFocus,
  onInputBlur,
}: WeeklyPlanSectionViewProps) {
  return (
    <View style={styles.planSection}>
      <Text style={[styles.planTitle, isDark && styles.textDark]}>
        {section.title}
      </Text>
      <Text style={[styles.planPrompt, isDark && styles.planPromptDark]}>
        {section.prompt}
      </Text>
      <TextInput
        value={plan.action}
        onChangeText={(value) => onPlanAction(section.id, value)}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        placeholder="Type your plan here"
        placeholderTextColor={isDark ? "#7B7E95" : "#9CA3AF"}
        multiline
        style={[
          styles.textArea,
          isDark && styles.inputDark,
          isDark && styles.textDark,
        ]}
      />
      <View style={styles.dayRows}>
        {plan.daysCompleted.map((done, index) => (
          <PlanDayRow
            key={`${section.id}-day-${index}`}
            sectionId={section.id}
            dayIndex={index}
            done={done}
            isDark={isDark}
            onToggle={onToggleDay}
          />
        ))}
      </View>
    </View>
  );
});
