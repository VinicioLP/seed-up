import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { AppThemeProvider, useAppTheme } from '@/components/app-theme';
import { AuthProvider } from '@/components/auth-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

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
        <Stack.Screen name="tutorial/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="map-picker" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
