import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { File, Paths } from 'expo-file-system';

export const DAILY_REMINDER_ID = 'daily-diesel-reminder';

const REMINDER_TIME_FILE = 'reminder_time.json';

function getReminderFile(): File {
  return new File(Paths.document, REMINDER_TIME_FILE);
}

async function saveReminderTime(hour: number, minute: number): Promise<void> {
  try {
    const file = getReminderFile();
    if (!file.exists) file.create();
    file.write(JSON.stringify({ hour, minute }));
  } catch {}
}

async function loadReminderTime(): Promise<{ hour: number; minute: number } | null> {
  try {
    const file = getReminderFile();
    if (!file.exists) return null;
    const content = await file.text();
    return JSON.parse(content);
  } catch {
    return null;
  }
}

const isNotificationsAvailable =
  Platform.OS === 'ios' || Platform.OS === 'android';

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

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationsAvailable) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyReminder(
  hour: number = DEFAULT_REMINDER_HOUR,
  minute: number = DEFAULT_REMINDER_MINUTE
): Promise<string | null> {
  if (!isNotificationsAvailable) return null;
  const granted = await requestNotificationPermission();
  if (!granted) return null;

  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID);

  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID,
    content: {
      title: 'Your Daily Diesel is ready!',
      body: 'Tap to read today\'s motivational quote.',
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });

  await saveReminderTime(hour, minute);
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

  const saved = await loadReminderTime();
  const hour = saved?.hour ?? DEFAULT_REMINDER_HOUR;
  const minute = saved?.minute ?? DEFAULT_REMINDER_MINUTE;

  const next = await Notifications.getNextTriggerDateAsync({
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour,
    minute,
  });
  return next ? new Date(next) : null;
}
