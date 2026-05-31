import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { Karla_400Regular, Karla_500Medium, Karla_700Bold } from '@expo-google-fonts/karla';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { NotificationResponseHandler } from '@/components/notification-response-handler';
import { ThemeProvider, useTheme } from '@/context/theme-context';
import { configurePurchases } from '@/services/purchases';
import { useEffect } from 'react';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const { isDark } = useTheme();

  useEffect(() => {
    configurePurchases();
  }, []);

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {Platform.OS !== 'web' && <NotificationResponseHandler />}
      <Stack screenOptions={{ headerBackTitleVisible: false, headerBackTitle: ' ' }}>
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
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavThemeProvider>
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

  if (!fontsLoaded) {
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
