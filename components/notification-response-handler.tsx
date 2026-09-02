import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import {
  DAILY_REMINDER_ID,
  isExpoGoAndroid,
} from '@/services/notifications';

/**
 * Daily reminder tap → /daily-quote.
 * When the app is open, Android often skips the banner — open the quote screen directly.
 *
 * Skipped on Android Expo Go (SDK 53+): importing expo-notifications throws there.
 */
export function NotificationResponseHandler() {
  if (isExpoGoAndroid) {
    return null;
  }
  return <NotificationResponseHandlerInner />;
}

function NotificationResponseHandlerInner() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notifications = require('expo-notifications') as typeof import('expo-notifications');
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener((notification) => {
      if (notification.request.identifier !== DAILY_REMINDER_ID) return;
      if (AppState.currentState === 'active') {
        router.push('/daily-quote');
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (!lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    const isDefaultAction =
      lastResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER;
    if (id === DAILY_REMINDER_ID && isDefaultAction) {
      router.replace('/daily-quote');
      void Notifications.clearLastNotificationResponseAsync();
    }
  }, [lastResponse, router]);

  return null;
}
