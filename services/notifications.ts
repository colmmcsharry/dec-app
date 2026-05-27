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

const isNotificationsAvailable =
  Platform.OS === 'ios' || Platform.OS === 'android';

/** Android NotificationManager.INTERRUPTION_FILTER_ALL */
const INTERRUPTION_FILTER_ALL = 1;

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
    'Your phone is in Do Not Disturb mode, so reminders may not appear on the lock screen or while you use other apps. Turn off Do Not Disturb, or allow Daily Diesel as an exception.',
  );
}

function promptOpenNotificationSettings(): void {
  Alert.alert(
    'Turn on notifications',
    'Enable notifications for Daily Diesel in Settings, then try setting your reminder again.',
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
      title: 'Your Daily Diesel is ready!',
      body: "Tap to read today's motivational quote.",
      sound: true,
      ...(Platform.OS === 'android'
        ? { priority: Notifications.AndroidNotificationPriority.HIGH }
        : {}),
    },
    trigger,
  });

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
        'On Android 12+, open Settings → Daily Diesel → Alarms & reminders and turn it on so your daily reminder fires when the app is in the background.',
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
}

export async function getNextReminderDate(): Promise<Date | null> {
  if (!isNotificationsAvailable) return null;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const daily = scheduled.find((t) => t.identifier === DAILY_REMINDER_ID);
  if (!daily) return null;
  const trigger = daily.trigger as { hour?: number; minute?: number } | null;
  const hour = trigger?.hour ?? DEFAULT_REMINDER_HOUR;
  const minute = trigger?.minute ?? DEFAULT_REMINDER_MINUTE;
  const next = await Notifications.getNextTriggerDateAsync({
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
    ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
  });
  return next ? new Date(next) : null;
}
