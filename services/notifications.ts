/**
 * Local notifications for the daily quote reminder.
 * Scheduling matches Oz Speak (aussie-react): expo-notifications DAILY trigger.
 */

import { Alert, Linking, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const DAILY_REMINDER_ID = 'daily-diesel-reminder';
const ANDROID_CHANNEL_ID = 'daily-reminders';
const EXACT_ALARM_HINT_KEY = '__dd_exact_alarm_hint_shown';
/** Persist chosen time — iOS returns DAILY schedules as calendar triggers without top-level hour/minute. */
const REMINDER_TIME_KEY = '__dd_daily_reminder_time';

const isNotificationsAvailable =
  Platform.OS === 'ios' || Platform.OS === 'android';

/** Android NotificationManager.INTERRUPTION_FILTER_ALL */
const INTERRUPTION_FILTER_ALL = 1;

type ReminderTime = { hour: number; minute: number };

async function saveReminderTime(hour: number, minute: number): Promise<void> {
  try {
    await AsyncStorage.setItem(
      REMINDER_TIME_KEY,
      JSON.stringify({ hour, minute } satisfies ReminderTime),
    );
  } catch {
    /* ignore */
  }
}

async function loadReminderTime(): Promise<ReminderTime | null> {
  try {
    const raw = await AsyncStorage.getItem(REMINDER_TIME_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ReminderTime>;
    if (
      typeof parsed.hour !== 'number' ||
      typeof parsed.minute !== 'number' ||
      parsed.hour < 0 ||
      parsed.hour > 23 ||
      parsed.minute < 0 ||
      parsed.minute > 59
    ) {
      return null;
    }
    return { hour: parsed.hour, minute: parsed.minute };
  } catch {
    return null;
  }
}

async function clearReminderTime(): Promise<void> {
  try {
    await AsyncStorage.removeItem(REMINDER_TIME_KEY);
  } catch {
    /* ignore */
  }
}

/** Format a wall-clock reminder time for UI (never use OS “next fire” Date). */
export function formatReminderClockTime(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Read hour/minute from Android `daily` or iOS `calendar` trigger shapes. */
function reminderTimeFromTrigger(
  trigger: Notifications.NotificationTrigger | null,
): ReminderTime | null {
  if (!trigger || typeof trigger !== 'object') return null;

  if (
    'type' in trigger &&
    trigger.type === 'daily' &&
    'hour' in trigger &&
    typeof trigger.hour === 'number'
  ) {
    return {
      hour: trigger.hour,
      minute: typeof trigger.minute === 'number' ? trigger.minute : 0,
    };
  }

  if (
    'dateComponents' in trigger &&
    trigger.dateComponents &&
    typeof trigger.dateComponents === 'object'
  ) {
    const parts = trigger.dateComponents as {
      hour?: number;
      minute?: number;
    };
    if (typeof parts.hour === 'number') {
      return {
        hour: parts.hour,
        minute: typeof parts.minute === 'number' ? parts.minute : 0,
      };
    }
  }

  return null;
}

function setForegroundNotificationHandler(): void {
  if (!isNotificationsAvailable) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}
setForegroundNotificationHandler();

export const DEFAULT_REMINDER_HOUR = 9;
export const DEFAULT_REMINDER_MINUTE = 0;

async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Daily reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    enableVibrate: true,
    vibrationPattern: [0, 250, 250, 250],
  });
}

function warnIfDoNotDisturb(
  settings: Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>,
): void {
  if (Platform.OS !== 'android') return;
  const filter = settings.android?.interruptionFilter;
  if (filter == null || filter === INTERRUPTION_FILTER_ALL) return;
  Alert.alert(
    'Do Not Disturb is on',
    'Your phone is in Do Not Disturb mode, so reminders may not appear on the lock screen or while you use other apps. Turn off Do Not Disturb, or allow Peak Performance Code as an exception.',
  );
}

function promptOpenNotificationSettings(): void {
  Alert.alert(
    'Turn on notifications',
    'Enable notifications for Peak Performance Code in Settings, then try setting your reminder again.',
    [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Open Settings',
        onPress: () => {
          void Linking.openSettings();
        },
      },
    ],
  );
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationsAvailable) return false;

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    warnIfDoNotDisturb(existing);
    return true;
  }

  const updated = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  if (updated.granted) {
    warnIfDoNotDisturb(updated);
    return true;
  }

  promptOpenNotificationSettings();
  return false;
}

export async function hasNotificationPermission(): Promise<boolean> {
  if (!isNotificationsAvailable) return false;
  const { granted } = await Notifications.getPermissionsAsync();
  return granted;
}

export async function scheduleDailyReminder(
  hour: number = DEFAULT_REMINDER_HOUR,
  minute: number = DEFAULT_REMINDER_MINUTE,
): Promise<string | null> {
  if (!isNotificationsAvailable) return null;
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  await ensureAndroidNotificationChannel();
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);

  const trigger =
    Platform.OS === 'android'
      ? {
          type: Notifications.SchedulableTriggerInputTypes.DAILY as const,
          hour,
          minute,
          channelId: ANDROID_CHANNEL_ID,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.DAILY as const,
          hour,
          minute,
        };

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: "Your Daily Diesel is ready!",
      body: "Tap to read today's motivational quote.",
      sound: true,
      ...(Platform.OS === 'android'
        ? { priority: Notifications.AndroidNotificationPriority.HIGH }
        : {}),
    },
    trigger,
  });

  await saveReminderTime(hour, minute);

  if (Platform.OS === 'android' && Platform.Version >= 31) {
    void (async () => {
      try {
        if ((await AsyncStorage.getItem(EXACT_ALARM_HINT_KEY)) === '1') return;
        await AsyncStorage.setItem(EXACT_ALARM_HINT_KEY, '1');
      } catch {
        /* ignore */
      }
      Alert.alert(
        'Allow alarms & reminders',
        'On Android 12+, open Settings → Peak Performance Code → Alarms & reminders and turn it on so your daily reminder fires when the app is in the background.',
        [
          { text: 'Not now', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              void Linking.openSettings();
            },
          },
        ],
      );
    })();
  }

  return identifier;
}

export async function cancelDailyReminder(): Promise<void> {
  if (!isNotificationsAvailable) return;
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);
  await clearReminderTime();
}

export type DailyReminderStatus = {
  hour: number;
  minute: number;
  label: string;
};

/**
 * Active reminder for UI. Prefer the time the user saved — never format
 * `getNextTriggerDateAsync()` for the label (Expo Go / iOS often returns a
 * wrong wall-clock time even when scheduling is fine).
 */
export async function getDailyReminderStatus(): Promise<DailyReminderStatus | null> {
  if (!isNotificationsAvailable) return null;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const daily = scheduled.find((t) => t.identifier === DAILY_REMINDER_ID);
  if (!daily) return null;

  const stored = await loadReminderTime();
  // Stored wins. iOS calendar `dateComponents` can disagree with what the user picked.
  const fromTrigger = stored ? null : reminderTimeFromTrigger(daily.trigger);
  const hour = stored?.hour ?? fromTrigger?.hour ?? DEFAULT_REMINDER_HOUR;
  const minute = stored?.minute ?? fromTrigger?.minute ?? DEFAULT_REMINDER_MINUTE;

  if (!stored) {
    await saveReminderTime(hour, minute);
  }

  return {
    hour,
    minute,
    label: formatReminderClockTime(hour, minute),
  };
}

/** Date at today's reminder clock time — for seeding the time picker only. */
export async function getNextReminderDate(): Promise<Date | null> {
  const status = await getDailyReminderStatus();
  if (!status) return null;
  const d = new Date();
  d.setHours(status.hour, status.minute, 0, 0);
  return d;
}
