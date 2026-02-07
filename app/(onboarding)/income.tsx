import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

/**
 * Onboarding Income Screen - Placeholder
 * Will be fully implemented in Phase 3 (US1)
 */
export default function OnboardingIncomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.step}>Step 1 of 4</Text>
        <Text style={styles.title}>Your Income</Text>
        <Text style={styles.subtitle}>Tell us about your income situation</Text>
        <Text style={styles.placeholder}>Income form coming in Phase 3</Text>
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
  step: {
    ...typography.small,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
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
