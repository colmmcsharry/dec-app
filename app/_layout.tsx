import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { NotificationResponseHandler } from '@/components/notification-response-handler';
import { OpenQuoteFromNotificationProvider } from '@/context/open-quote-from-notification';
import { ThemeProvider, useTheme } from '@/context/theme-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <OpenQuoteFromNotificationProvider>
        {Platform.OS !== 'web' && <NotificationResponseHandler />}
        <Stack screenOptions={{ headerBackTitleVisible: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="category/[slug]" options={{ headerShown: true }} />
          <Stack.Screen name="video/[id]" options={{ headerShown: true }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      </OpenQuoteFromNotificationProvider>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
