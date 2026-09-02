import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, InteractionManager } from 'react-native';

import { showBrandedNote } from '@/components/branded-note-modal';
import {
  DAILY_REMINDER_ID,
  HABIT_REMINDER_NOTE,
  isExpoGoAndroid,
  isHabitReminderId,
} from '@/services/notifications';

/**
 * Daily reminder tap → /daily-quote.
 * Habit reminder tap → branded in-app note (no worksheet deep-link).
 *
 * Skipped on Android Expo Go (SDK 53+): importing expo-notifications throws there.
 */
export function NotificationResponseHandler() {
  if (isExpoGoAndroid) {
    return null;
  }
  return <NotificationResponseHandlerInner />;
}

function showHabitReminderNote(): void {
  showBrandedNote({
    title: 'Habit reminder',
    body: HABIT_REMINDER_NOTE,
    buttonLabel: 'Got it',
    variant: 'bell',
  });
}

function responseKey(
  response: {
    notification: { date?: unknown; request: { identifier: string } };
    actionIdentifier: string;
  },
): string {
  return `${response.notification.request.identifier}:${String(response.notification.date)}:${response.actionIdentifier}`;
}

function NotificationResponseHandlerInner() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notifications = require('expo-notifications') as typeof import('expo-notifications');
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();
  const handledKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      const id = notification.request.identifier;
      if (AppState.currentState !== 'active') return;

      if (id === DAILY_REMINDER_ID) {
        router.push('/daily-quote');
        return;
      }
      if (isHabitReminderId(id)) {
        showHabitReminderNote();
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!lastResponse) return;

    const isDefaultAction =
      lastResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER;
    if (!isDefaultAction) return;

    const key = responseKey(lastResponse);
    if (handledKeyRef.current === key) return;
    handledKeyRef.current = key;

    const id = lastResponse.notification.request.identifier;

    if (id === DAILY_REMINDER_ID) {
      router.replace('/daily-quote');
      void Notifications.clearLastNotificationResponseAsync();
      return;
    }

    if (isHabitReminderId(id)) {
      void Notifications.clearLastNotificationResponseAsync();
      // Wait for navigation/settling so opening the note doesn't race tab switches.
      InteractionManager.runAfterInteractions(() => {
        showHabitReminderNote();
      });
    }
  }, [lastResponse, router]);

  return null;
}
