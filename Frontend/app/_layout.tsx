import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AppThemeProvider, useAppTheme } from '@/components/app-theme';
import { AuthProvider } from '@/components/auth-context';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';

export const unstable_settings = {
  anchor: '(tabs)',
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function openNotificationDestination(response: Notifications.NotificationResponse | null) {
  const data = response?.notification.request.content.data;

  if (data?.screen === 'community' && typeof data.postId === 'string') {
    router.push({
      pathname: '/community',
      params: { postId: data.postId },
    });
  }
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </AppThemeProvider>
  );
}

function RootLayoutContent() {
  const { isDark } = useAppTheme();
  useNotificationScheduler();

  useEffect(() => {
    openNotificationDestination(Notifications.getLastNotificationResponse());

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      openNotificationDestination(response);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    async function hideAndroidNavigationBar() {
      await NavigationBar.setBehaviorAsync('overlay-swipe');
      await NavigationBar.setVisibilityAsync('hidden');
    }

    hideAndroidNavigationBar();
  }, []);

  useEffect(() => {
    async function requestStartupPermissions() {
      await Promise.allSettled([
        Location.requestForegroundPermissionsAsync(),
        Camera.requestCameraPermissionsAsync(),
        ImagePicker.requestMediaLibraryPermissionsAsync(),
      ]);
    }

    requestStartupPermissions();
  }, []);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="tutorial/new" options={{ headerShown: false }} />
        <Stack.Screen name="tutorial/saved" options={{ headerShown: false }} />
        <Stack.Screen name="tutorial/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="map-picker" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
