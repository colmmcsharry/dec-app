import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from "expo-router/react-navigation";
import { Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Karla_400Regular, Karla_500Medium, Karla_700Bold } from '@expo-google-fonts/karla';
import { Asset } from 'expo-asset';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { BrandedNoteHost } from '@/components/branded-note-modal';
import { NotificationResponseHandler } from '@/components/notification-response-handler';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { configurePurchases } from '@/services/purchases';
import { useEffect, useState } from 'react';

/** First-screen onboarding art — preload before the tree mounts. */
const ONBOARDING_WELCOME_MOUNTAINS = require('@/assets/images/onboarding/welcome-mountains.webp');

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const { isDark } = useTheme();

  useEffect(() => {
    configurePurchases();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        {Platform.OS !== 'web' && <NotificationResponseHandler />}
        <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerBackTitle: ' ' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="paywall-placeholder" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen
          name="daily-quote"
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="category/[slug]"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="video/[id]"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="pdf-viewer"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="article/[slug]"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="articles"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="downloads"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="gym-routines"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="strength-fitness-targets"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="hiit-workouts"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="two-day-beginner-guide"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="basic-beginner-guide"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="gzclp-guide"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="module-summary/[slug]"
          options={{
            headerShown: false,
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
        </View>
      <BrandedNoteHost />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Karla_400Regular,
    Karla_500Medium,
    Karla_700Bold,
  });
  const [welcomeArtReady, setWelcomeArtReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await Asset.fromModule(ONBOARDING_WELCOME_MOUNTAINS).downloadAsync();
      } catch {
        // Non-fatal — onboarding can still decode on demand.
      } finally {
        if (!cancelled) setWelcomeArtReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!fontsLoaded || !welcomeArtReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
