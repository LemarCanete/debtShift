import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/theme';

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

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={styles.container}>
            <StatusBar style="light" backgroundColor={colors.background} />
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
          </View>
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
});
