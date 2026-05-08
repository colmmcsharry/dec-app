import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { DAILY_REMINDER_ID } from '@/services/notifications';

/**
 * Handles taps on the daily-reminder notification. Routes the user to the
 * standalone /daily-quote screen, which is reachable to all users (paid or
 * not) so the daily quote works as a free-tier surface that also funnels
 * non-entitled users into the paywall.
 */
export function NotificationResponseHandler() {
  const router = useRouter();
  const lastResponse = Notifications.useLastNotificationResponse();

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
