import { Redirect } from 'expo-router';

/**
 * Root index - redirects to the appropriate screen based on auth state.
 * For now, redirect to auth/login. This will be updated when auth is implemented.
 */
export default function Index() {
  // TODO: Check auth state and redirect accordingly
  // - If authenticated and onboarding complete → (tabs)
  // - If authenticated and onboarding incomplete → (onboarding)
  // - If not authenticated → (auth)
  return <Redirect href="/(auth)/login" />;
}
