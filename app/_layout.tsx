import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/theme';
import { useAuthStore } from '@/stores/useAuthStore';
import { onAuthStateChange } from '@/services/auth';

import '../global.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Auth state routing logic
 * Redirects users based on authentication and onboarding status
 */
function useProtectedRoute() {
  const segments = useSegments();
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated, redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      if (!user?.onboarding_completed && !inOnboardingGroup) {
        // Authenticated but hasn't completed onboarding
        router.replace('/(onboarding)/income');
      } else if (user?.onboarding_completed && (inAuthGroup || inOnboardingGroup)) {
        // Authenticated and onboarded, but in auth/onboarding screens
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, user, isInitialized, segments]);
}

/**
 * Initialize authentication state
 */
function AuthProvider({ children }: { children: React.ReactNode }) {
  const { initialize, setUser, isInitialized } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount
    initialize();

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (userId) => {
      if (!userId) {
        setUser(null);
      }
      // When user changes, re-initialize to fetch profile
      await initialize();
    });

    return () => unsubscribe();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

/**
 * Navigation component with auth routing
 */
function RootNavigator() {
  useProtectedRoute();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="debt/[id]"
        options={{
          presentation: 'card',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="planner"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="reminders"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="journal/index"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="journal/new"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="lesson/[id]"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="playbook/[id]"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'card',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <View style={styles.container}>
              <StatusBar style="light" backgroundColor={colors.background} />
              <RootNavigator />
            </View>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
