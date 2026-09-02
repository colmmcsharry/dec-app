import { showBrandedNote } from "@/components/branded-note-modal";
import { AppFonts, MAIN_PURPLE } from "@/constants/theme";
import { useTheme } from "@/context/theme-context";
import {
  formatReminderClockTime,
  getHabitReminderDefaults,
  getHabitReminderPickerDate,
  getHabitReminderStatus,
  scheduleHabitReminder,
  cancelHabitReminder,
  type HabitReminderKind,
  type DailyReminderStatus,
} from "@/services/notifications";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { Bell, Moon, Sun } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type HabitRemindersModalProps = {
  visible: boolean;
  onClose: () => void;
  onChanged?: () => void;
};

type SlotState = DailyReminderStatus | null;

/**
 * Same pattern as Home Daily Diesel change-time: RN Modal + dimmed flex overlay.
 */
export function HabitRemindersModal({
  visible,
  onClose,
  onChanged,
}: HabitRemindersModalProps) {
  const { isDark } = useTheme();
  const [morning, setMorning] = useState<SlotState>(null);
  const [nighttime, setNighttime] = useState<SlotState>(null);
  const [editingKind, setEditingKind] = useState<HabitReminderKind | null>(
    null,
  );
  const [pickerTime, setPickerTime] = useState(() => {
    const d = new Date();
    d.setHours(7, 0, 0, 0);
    return d;
  });
  const pickerTimeRef = useRef(pickerTime);

  const refresh = useCallback(async () => {
    const [m, n] = await Promise.all([
      getHabitReminderStatus("morning"),
      getHabitReminderStatus("nighttime"),
    ]);
    setMorning(m);
    setNighttime(n);
  }, []);

  useEffect(() => {
    if (!visible) {
      setEditingKind(null);
      return;
    }
    void refresh();
  }, [visible, refresh]);

  const dismiss = () => {
    onClose();
  };

  const scheduleAt = async (
    kind: HabitReminderKind,
    hour: number,
    minute: number,
  ) => {
    const id = await scheduleHabitReminder(kind, hour, minute);
    if (id) {
      const label = formatReminderClockTime(hour, minute);
      // Defer so we don't stack a second overlay mid-Modal interaction.
      requestAnimationFrame(() => {
        showBrandedNote({
          title: "Reminder set",
          body: `You'll get a daily habit nudge at ${label}.`,
          buttonLabel: "Got it",
          variant: "check",
        });
      });
    }
    setEditingKind(null);
    await refresh();
    onChanged?.();
  };

  const openTimePicker = async (kind: HabitReminderKind) => {
    const value = await getHabitReminderPickerDate(kind);
    if (Platform.OS === "web") {
      const defaults = getHabitReminderDefaults(kind);
      Alert.alert("Pick a time", undefined, [
        {
          text: formatReminderClockTime(defaults.hour, defaults.minute),
          onPress: () =>
            void scheduleAt(kind, defaults.hour, defaults.minute),
        },
        {
          text: "7:00 AM",
          onPress: () => void scheduleAt(kind, 7, 0),
        },
        {
          text: "9:00 PM",
          onPress: () => void scheduleAt(kind, 21, 0),
        },
        { text: "Cancel", style: "cancel" },
      ]);
      return;
    }
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode: "time",
        onChange: (event, date) => {
          if (event.type === "set" && date) {
            void scheduleAt(kind, date.getHours(), date.getMinutes());
          }
        },
      });
      return;
    }
    pickerTimeRef.current = value;
    setPickerTime(value);
    setEditingKind(kind);
  };

  const confirmPicker = async () => {
    if (!editingKind) return;
    const time = pickerTimeRef.current;
    await scheduleAt(editingKind, time.getHours(), time.getMinutes());
  };

  const removeReminder = async (kind: HabitReminderKind) => {
    await cancelHabitReminder(kind);
    if (editingKind === kind) setEditingKind(null);
    await refresh();
    onChanged?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={dismiss}
    >
      <Pressable style={styles.overlay} onPress={dismiss}>
        <Pressable
          style={[styles.card, isDark && styles.cardDark]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.iconWrap, isDark && styles.iconWrapDark]}>
            <View pointerEvents="none">
              <Bell size={26} color={MAIN_PURPLE} strokeWidth={2.2} />
            </View>
          </View>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Want daily reminders?
          </Text>
          <Text style={[styles.body, isDark && styles.bodyDark]}>
            In case you forget your good intentions!
          </Text>

          <HabitSlot
            kind="morning"
            label="Reminder 1"
            Icon={Sun}
            status={morning}
            isDark={isDark}
            onSet={() => void openTimePicker("morning")}
            onChangeTime={() => void openTimePicker("morning")}
            onRemove={() => void removeReminder("morning")}
          />
          <HabitSlot
            kind="nighttime"
            label="Reminder 2"
            Icon={Moon}
            status={nighttime}
            isDark={isDark}
            onSet={() => void openTimePicker("nighttime")}
            onChangeTime={() => void openTimePicker("nighttime")}
            onRemove={() => void removeReminder("nighttime")}
          />

          {editingKind && Platform.OS === "ios" ? (
            <View style={styles.iosPickerBlock}>
              <Text style={[styles.iosPickerLabel, isDark && styles.titleDark]}>
                {editingKind === "morning"
                  ? "Reminder 1 time"
                  : "Reminder 2 time"}
              </Text>
              <DateTimePicker
                value={pickerTime}
                mode="time"
                onChange={(_, date) => {
                  if (date) {
                    pickerTimeRef.current = date;
                    setPickerTime(date);
                  }
                }}
                display="spinner"
                themeVariant={isDark ? "dark" : "light"}
                textColor={isDark ? "#FFFFFF" : "#2C3E50"}
              />
              <View style={styles.iosPickerActions}>
                <Pressable
                  onPress={() => setEditingKind(null)}
                  style={({ pressed }) => [
                    styles.secondaryBtn,
                    { opacity: pressed ? 0.75 : 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.secondaryBtnText,
                      isDark && { color: "#ECEDEE" },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => void confirmPicker()}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    { opacity: pressed ? 0.88 : 1 },
                  ]}
                >
                  <Text style={styles.primaryBtnText}>Set reminder</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <Pressable
            onPress={dismiss}
            style={({ pressed }) => [
              styles.doneBtn,
              isDark && styles.doneBtnDark,
              { opacity: pressed ? 0.88 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Done"
          >
            <Text
              style={[styles.doneBtnText, isDark && styles.doneBtnTextDark]}
            >
              Done
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function HabitSlot({
  label,
  Icon,
  status,
  isDark,
  onSet,
  onChangeTime,
  onRemove,
}: {
  kind: HabitReminderKind;
  label: string;
  Icon: typeof Sun;
  status: SlotState;
  isDark: boolean;
  onSet: () => void;
  onChangeTime: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={[styles.slot, isDark && styles.slotDark]}>
      <View style={styles.slotHeader}>
        <View style={[styles.slotIcon, isDark && styles.slotIconDark]}>
          <View pointerEvents="none">
            <Icon
              size={18}
              color={isDark ? "#C4B5E8" : MAIN_PURPLE}
              strokeWidth={2.2}
            />
          </View>
        </View>
        <View style={styles.slotText}>
          <Text style={[styles.slotTitle, isDark && styles.titleDark]}>
            {label}
          </Text>
          <Text style={[styles.slotMeta, isDark && styles.bodyDark]}>
            {status ? `Daily at ${status.label}` : "Off — optional"}
          </Text>
        </View>
      </View>
      {status ? (
        <View style={styles.slotActions}>
          <Pressable
            onPress={onChangeTime}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.linkAction}>Change time</Text>
          </Pressable>
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={styles.removeAction}>Remove</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          onPress={onSet}
          style={({ pressed }) => [
            styles.setBtn,
            { opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Text style={styles.setBtnText}>Set reminder</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 18,
    borderWidth: 2,
    borderColor: "#EADBF7",
  },
  cardDark: {
    backgroundColor: "#1E1E32",
    borderColor: "#3A2E5C",
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F4EEFF",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 14,
  },
  iconWrapDark: {
    backgroundColor: "#2A2440",
  },
  title: {
    fontSize: 19,
    fontFamily: AppFonts.headingBold,
    color: "#1F2A3A",
    textAlign: "center",
    marginBottom: 8,
  },
  titleDark: {
    color: "#ECEDEE",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: AppFonts.bodyMedium,
    color: "#5C6370",
    textAlign: "center",
    marginBottom: 18,
  },
  bodyDark: {
    color: "#C4C8D4",
  },
  slot: {
    borderRadius: 16,
    backgroundColor: "#F7F5FB",
    padding: 14,
    marginBottom: 10,
  },
  slotDark: {
    backgroundColor: "#2A2440",
  },
  slotHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  slotIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  slotIconDark: {
    backgroundColor: "#1E1E32",
  },
  slotText: {
    flex: 1,
    minWidth: 0,
  },
  slotTitle: {
    fontSize: 15,
    fontFamily: AppFonts.headingSemiBold,
    color: "#1F2A3A",
  },
  slotMeta: {
    fontSize: 13,
    fontFamily: AppFonts.bodyRegular,
    color: "#5C6370",
    marginTop: 2,
  },
  slotActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingHorizontal: 2,
  },
  linkAction: {
    fontSize: 14,
    fontFamily: AppFonts.bodyBold,
    color: MAIN_PURPLE,
  },
  removeAction: {
    fontSize: 14,
    fontFamily: AppFonts.bodyBold,
    color: "#C45C5C",
  },
  setBtn: {
    marginTop: 12,
    backgroundColor: MAIN_PURPLE,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  setBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: AppFonts.bodyBold,
  },
  iosPickerBlock: {
    marginTop: 4,
    marginBottom: 8,
    alignItems: "center",
  },
  iosPickerLabel: {
    fontSize: 15,
    fontFamily: AppFonts.headingSemiBold,
    color: "#2C3E50",
    marginBottom: 4,
  },
  iosPickerActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
    marginTop: 4,
  },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontFamily: AppFonts.bodyMedium,
    color: "#2C3E50",
  },
  primaryBtn: {
    backgroundColor: "#5D9B8B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  primaryBtnText: {
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
    color: "#FFFFFF",
  },
  doneBtn: {
    marginTop: 8,
    alignSelf: "stretch",
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: MAIN_PURPLE,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },
  doneBtnDark: {
    borderColor: "#C4B5E8",
  },
  doneBtnText: {
    color: MAIN_PURPLE,
    fontSize: 15,
    fontFamily: AppFonts.bodyBold,
  },
  doneBtnTextDark: {
    color: "#C4B5E8",
  },
});
