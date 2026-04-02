import { AppFonts } from "@/constants/theme";
import {
  createInitialWorkbookData,
  MODULE_WORKBOOKS,
  type ModuleWorkbookData,
} from "@/data/module-workbooks";
import { useTheme } from "@/context/theme-context";
import {
  getModuleWorkbook,
  saveModuleWorkbook,
} from "@/services/module-workbooks";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
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
      setFormData(stored);
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

  const updatePlanDayNote = (
    sectionId: string,
    dayIndex: number,
    value: string
  ) => {
    setFormData((current) => {
      if (!current) return current;
      const nextNotes = [...current.weeklyPlan[sectionId].dayNotes];
      nextNotes[dayIndex] = value;
      return {
        ...current,
        weeklyPlan: {
          ...current.weeklyPlan,
          [sectionId]: {
            ...current.weeklyPlan[sectionId],
            dayNotes: nextNotes,
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
  const keyboardVerticalOffset = insets.top + 56;

  return (
    <>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
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
        <ScrollView
          style={[styles.container, isDark && styles.containerDark]}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
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
            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                1 Week for Better Sleep
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.subtextDark]}>
                Choose one manageable action in each category and track how it went across the week.
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
                    {formData.weeklyPlan[section.id].dayNotes.map((note, index) => (
                      <View key={`${section.id}-${index}`} style={styles.dayRow}>
                        <Text style={[styles.dayLabel, isDark && styles.subtextDark]}>
                          Day {index + 1}
                        </Text>
                        <TextInput
                          value={note}
                          onChangeText={(value) =>
                            updatePlanDayNote(section.id, index, value)
                          }
                          placeholder="Done / note"
                          placeholderTextColor={isDark ? "#7B7E95" : "#9CA3AF"}
                          style={[
                            styles.dayInput,
                            isDark && styles.inputDark,
                            isDark && styles.textDark,
                          ]}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                Evening-Time Audit
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.subtextDark]}>
                Log two real evenings from when you arrive home until you go to sleep so you can spot time sinks.
              </Text>

              {formData.eveningAudits.map((audit, auditIndex) => (
                <View key={`audit-${auditIndex}`} style={styles.auditBlock}>
                  <Text style={[styles.planTitle, isDark && styles.textDark]}>
                    Evening {auditIndex + 1}
                  </Text>
                  {audit.rows.map((row, rowIndex) => (
                    <View key={`audit-row-${auditIndex}-${rowIndex}`} style={styles.auditRow}>
                      <TextInput
                        value={row.time}
                        onChangeText={(value) =>
                          updateAuditRow(auditIndex, rowIndex, "time", value)
                        }
                        placeholder={rowIndex === 0 ? "Time" : "e.g. 7:30"}
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
                          updateAuditRow(auditIndex, rowIndex, "activity", value)
                        }
                        placeholder={
                          rowIndex === 0 ? "Activity" : "What were you doing?"
                        }
                        placeholderTextColor={isDark ? "#7B7E95" : "#9CA3AF"}
                        style={[
                          styles.activityInput,
                          isDark && styles.inputDark,
                          isDark && styles.textDark,
                        ]}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>

            <View
              style={[
                styles.sectionCard,
                isDark && styles.sectionCardDark,
              ]}
            >
              <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
                Journaling Made Simple
              </Text>
              <Text style={[styles.sectionBody, isDark && styles.subtextDark]}>
                Pick any of the prompts below and write for a minute or two, or longer if you want.
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
    </>
  );
}

const styles = StyleSheet.create({
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
    gap: 10,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dayLabel: {
    width: 46,
    fontSize: 14,
    color: "#6B7280",
    fontFamily: AppFonts.bodyMedium,
  },
  dayInput: {
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
  auditBlock: {
    marginTop: 18,
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
