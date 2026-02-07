import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

/**
 * Signup Screen - Placeholder
 * Will be fully implemented in Phase 3 (US1)
 */
export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start your debt-free journey</Text>
        <Text style={styles.placeholder}>Signup screen coming in Phase 3</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    ...typography.hero,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  placeholder: {
    ...typography.small,
    color: colors.text.muted,
  },
});
