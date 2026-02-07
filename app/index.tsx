import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Root index - redirects to the appropriate screen based on auth state.
 * The auth routing logic in _layout.tsx handles the actual navigation,
 * this just provides an initial redirect target.
 */
export default function Index() {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  // Wait for auth to initialize
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Redirect based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user?.onboarding_completed) {
    return <Redirect href="/(onboarding)/income" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
