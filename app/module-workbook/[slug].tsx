import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import {
  createInitialWorkbookData,
  mergeModuleWorkbookData,
  MODULE_WORKBOOKS,
  type ModuleWorkbookData,
} from "@/data/module-workbooks";
import { useTheme } from "@/context/theme-context";
import {
  getModuleWorkbook,
  saveModuleWorkbook,
} from "@/services/module-workbooks";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Check } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SaveState = "loading" | "saving" | "saved";

export default function ModuleWorkbookScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();

  const definition = slug ? MODULE_WORKBOOKS[slug] : undefined;
  const initialData = useMemo(
    () => (definition ? createInitialWorkbookData(definition) : null),
    [definition]
  );

  const [formData, setFormData] = useState<ModuleWorkbookData | null>(initialData);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const hasHydratedRef = useRef(false);

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

    setSaveState("saving");
    const timeout = setTimeout(async () => {
      await saveModuleWorkbook(slug, formData);
      setSaveState("saved");
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

  const updatePlanAction = (sectionId: string, value: string) => {
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
  };

  const togglePlanDayCompleted = (sectionId: string, dayIndex: number) => {
    setFormData((current) => {
      if (!current) return current;
      const section = current.weeklyPlan[sectionId];
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
  };

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
        : "Saved on this device";
  /** Header tall enough for safe area + back row (see `customHeader` styles). */
  const keyboardVerticalOffset = insets.top + 12 + 44;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <View style={styles.screenRoot}>
        <View
          style={[
            styles.customHeader,
            {
              paddingTop: insets.top,
              backgroundColor: isDark ? "#1A1A2E" : definition.color,
            },
          ]}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={16}
            style={({ pressed }) => [
              styles.customBackButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft
              size={26}
              color={isDark ? "#ECEDEE" : "#2C3E50"}
              strokeWidth={2.5}
            />
            <Text
              style={[
                styles.customBackText,
                { color: isDark ? "#ECEDEE" : "#2C3E50" },
              ]}
            >
              Back
            </Text>
          </Pressable>
          <Text
            style={[
              styles.customHeaderTitle,
              { color: isDark ? "#ECEDEE" : "#2C3E50" },
            ]}
          >
            Module Workbook
          </Text>
          <View style={styles.customHeaderSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          {/**
           * Do NOT use `automaticallyAdjustKeyboardInsets` here: it fights
           * KeyboardAvoidingView on iOS and can scroll the focused field under
           * the header or yank content to the top of the screen.
           */}
          <ScrollView
            style={[styles.container, isDark && styles.containerDark]}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            automaticallyAdjustKeyboardInsets={false}
          >
          <View
            style={[
              styles.heroCard,
              { backgroundColor: isDark ? "#1E1E32" : "#FFFFFF" },
            ]}
          >
            <Text style={[styles.moduleLabel, isDark && styles.subtextDark]}>
              MODULE {definition.moduleNumber}
            </Text>
            <Text style={[styles.heroTitle, isDark && styles.textDark]}>
              {definition.title}
            </Text>
            <Text style={[styles.heroBody, isDark && styles.subtextDark]}>
              {definition.intro}
            </Text>
            <Text style={[styles.saveState, isDark && styles.subtextDark]}>
              {saveStatusText}
            </Text>
          </View>

          <View style={styles.sectionStack}>
            {/* ── Educational Content ── */}
            {definition.contentSections.length > 0 && (
              <View
                style={[
                  styles.sectionCard,
                  isDark && styles.sectionCardDark,
                ]}
              >
                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                  Course Content
                </Text>
                {definition.contentSections.map((cs, i) => (
                  <View key={`cs-${i}`} style={styles.contentBlock}>
                    <Text
                      style={[styles.contentHeading, isDark && styles.textDark]}
                    >
                      {cs.heading}
                    </Text>
                    <Text
                      style={[
                        styles.contentBody,
                        isDark && styles.subtextDark,
                      ]}
                    >
                      {cs.body}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* ── Weekly Plan ── */}
            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                {definition.weeklyPlanCardTitle}
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.subtextDark]}>
                {definition.weeklyPlanCardDescription}
              </Text>

              {definition.weeklyPlanSections.map((section) => (
                <View key={section.id} style={styles.planSection}>
                  <Text style={[styles.planTitle, isDark && styles.textDark]}>
                    {section.title}
                  </Text>
                  <Text style={[styles.planPrompt, isDark && styles.subtextDark]}>
                    {section.prompt}
                  </Text>
                  <TextInput
                    value={formData.weeklyPlan[section.id].action}
                    onChangeText={(value) => updatePlanAction(section.id, value)}
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
                    {formData.weeklyPlan[section.id].daysCompleted.map(
                      (done, index) => (
                        <View
                          key={`${section.id}-day-${index}`}
                          style={styles.dayRow}
                        >
                          <Text
                            style={[styles.dayLabel, isDark && styles.subtextDark]}
                          >
                            Day {index + 1}
                          </Text>
                          <Pressable
                            onPress={() =>
                              togglePlanDayCompleted(section.id, index)
                            }
                            style={({ pressed }) => [
                              styles.dayCheckHit,
                              { opacity: pressed ? 0.88 : 1 },
                            ]}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: done }}
                            accessibilityLabel={`Day ${index + 1}${
                              done ? ", marked done" : ", not marked done"
                            }`}
                            hitSlop={8}
                          >
                            <View
                              style={[
                                styles.dayCheckbox,
                                isDark && styles.dayCheckboxDark,
                                done && styles.dayCheckboxChecked,
                              ]}
                            >
                              {done ? (
                                <View pointerEvents="none">
                                  <Check
                                    size={18}
                                    color="#FFFFFF"
                                    strokeWidth={3}
                                  />
                                </View>
                              ) : null}
                            </View>
                          </Pressable>
                        </View>
                      ),
                    )}
                  </View>
                </View>
              ))}
            </View>

            {definition.includeEveningAudit && formData.eveningAudits.length > 0 && (
            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                {definition.eveningAuditCardTitle}
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.subtextDark]}>
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
                            isDark && styles.subtextDark,
                          ]}
                        >
                          Time
                        </Text>
                        <Text
                          style={[
                            styles.auditColumnHeader,
                            styles.auditColumnHeaderActivity,
                            isDark && styles.subtextDark,
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
                        <TextInput
                          value={row.time}
                          onChangeText={(value) =>
                            updateAuditRow(auditIndex, rowIndex, "time", value)
                          }
                          placeholder="e.g. 7:30"
                          placeholderTextColor={isDark ? "#7B7E95" : "#9CA3AF"}
                          style={[
                            styles.timeInput,
                            isDark && styles.inputDark,
                            isDark && styles.textDark,
                          ]}
                        />
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
                          placeholder="What were you doing?"
                          placeholderTextColor={isDark ? "#7B7E95" : "#9CA3AF"}
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

            {/* ── Interactive Worksheets ── */}
            {definition.worksheetDefinitions.map((ws) => (
              <View
                key={ws.id}
                style={[
                  styles.sectionCard,
                  isDark && styles.sectionCardDark,
                ]}
              >
                <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                  {ws.title}
                </Text>
                <Text style={[styles.sectionBody, isDark && styles.subtextDark]}>
                  {ws.description}
                </Text>
                {ws.fields.map((field) => (
                  <View key={field.id} style={styles.worksheetField}>
                    <Text
                      style={[styles.worksheetLabel, isDark && styles.textDark]}
                    >
                      {field.label}
                    </Text>
                    <TextInput
                      value={formData.worksheets?.[ws.id]?.[field.id] ?? ""}
                      onChangeText={(v) =>
                        updateWorksheetField(ws.id, field.id, v)
                      }
                      placeholder={field.placeholder ?? "Type here"}
                      placeholderTextColor={isDark ? "#7B7E95" : "#9CA3AF"}
                      multiline
                      style={[
                        styles.textArea,
                        isDark && styles.inputDark,
                        isDark && styles.textDark,
                      ]}
                    />
                  </View>
                ))}
              </View>
            ))}

            {/* ── Journal ── */}
            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                {definition.journalCardTitle}
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.subtextDark]}>
                {definition.journalCardDescription}
              </Text>
              <View style={styles.promptList}>
                {definition.journalPrompts.map((prompt, index) => (
                  <Text
                    key={`prompt-${index}`}
                    style={[styles.promptItem, isDark && styles.subtextDark]}
                  >
                    {index + 1}. {prompt}
                  </Text>
                ))}
              </View>
              <TextInput
                value={formData.journalEntry}
                onChangeText={updateJournalEntry}
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
      </KeyboardAvoidingView>
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
  customBackButton: {
    minWidth: 72,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  customBackText: {
    fontSize: 13,
    fontFamily: AppFonts.bodyBold,
    marginLeft: 2,
  },
  customHeaderTitle: {
    fontSize: 17,
    fontFamily: AppFonts.headingSemiBold,
    textAlign: "center",
    flex: 1,
  },
  customHeaderSpacer: {
    minWidth: 72,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
  },
  containerDark: {
    backgroundColor: "#121222",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  textDark: {
    color: "#ECEDEE",
  },
  subtextDark: {
    color: "#9090A8",
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  moduleLabel: {
    fontSize: 12,
    fontFamily: AppFonts.headingBold,
    color: "#8E8EA0",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: AppFonts.headingBold,
    color: "#2C3E50",
  },
  heroBody: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: "#6B7280",
    fontFamily: AppFonts.bodyRegular,
  },
  saveState: {
    marginTop: 14,
    fontSize: 13,
    color: "#5D9B8B",
    fontFamily: AppFonts.bodyBold,
  },
  sectionStack: {
    marginTop: 16,
    gap: 16,
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
    color: "#2C3E50",
  },
  sectionBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
    fontFamily: AppFonts.bodyRegular,
  },
  planSection: {
    marginTop: 18,
  },
  planTitle: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
  },
  planPrompt: {
    marginTop: 6,
    marginBottom: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
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
    color: "#2C3E50",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  dayLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: AppFonts.bodyMedium,
  },
  dayCheckHit: {
    padding: 4,
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
    color: "#6B7280",
    letterSpacing: 0.3,
  },
  auditColumnHeaderTime: {
    width: 96,
  },
  auditColumnHeaderActivity: {
    flex: 1,
  },
  auditRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  timeInput: {
    width: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: "#2C3E50",
    fontFamily: AppFonts.bodyRegular,
  },
  activityInput: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: "#2C3E50",
    fontFamily: AppFonts.bodyRegular,
  },
  contentBlock: {
    marginTop: 18,
  },
  contentHeading: {
    fontSize: 18,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
    marginBottom: 8,
  },
  contentBody: {
    fontSize: 15,
    lineHeight: 23,
    color: "#4B5563",
    fontFamily: AppFonts.bodyRegular,
  },
  worksheetField: {
    marginTop: 14,
  },
  worksheetLabel: {
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: "#2C3E50",
    marginBottom: 8,
  },
  promptList: {
    marginTop: 14,
    gap: 8,
  },
  promptItem: {
    fontSize: 14,
    lineHeight: 21,
    color: "#6B7280",
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
    color: "#2C3E50",
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
    color: "#2C3E50",
    fontFamily: AppFonts.headingBold,
  },
});
