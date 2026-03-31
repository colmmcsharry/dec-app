import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { useOpenQuoteFromNotification } from '@/context/open-quote-from-notification';
import { DAILY_REMINDER_ID } from '@/services/notifications';

export function NotificationResponseHandler() {
  const router = useRouter();
  const { setOpenQuoteOnNextFocus } = useOpenQuoteFromNotification();
  const lastResponse = Notifications.useLastNotificationResponse();

  useEffect(() => {
    if (!lastResponse) return;
    const id = lastResponse.notification.request.identifier;
    const isDefaultAction =
      lastResponse.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER;
    if (id === DAILY_REMINDER_ID && isDefaultAction) {
      setOpenQuoteOnNextFocus(true);
      router.replace('/');
      void Notifications.clearLastNotificationResponseAsync();
    }
  }, [lastResponse, setOpenQuoteOnNextFocus, router]);

  return null;
}
