import { Stack } from 'expo-router';
import { colors } from '@/theme';

/**
 * Onboarding Stack Layout
 * Contains income, expenses, goal, and first-debt screens
 */
export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="income" />
      <Stack.Screen name="expenses" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="first-debt" />
    </Stack>
  );
}
