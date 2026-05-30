import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAppTheme } from '@/components/app-theme';
import { useAuth } from '@/components/auth-context';
import { HapticTab } from '@/components/haptic-tab';

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.tint} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.subtle,
        tabBarStyle: {
          height: 82,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tutorials"
        options={{
          title: 'Tutoriais',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="book-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat-ia"
        options={{
          title: 'Chat IA',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="chatbubble-ellipses" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Comunidade',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="people-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="person-circle-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
