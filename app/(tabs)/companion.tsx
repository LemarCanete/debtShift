import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';

/**
 * AI Companion "Shift" Screen - Placeholder
 * Will be fully implemented in Phase 7 (US5)
 */
export default function CompanionScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Shift</Text>
        <Text style={styles.subtitle}>Your AI debt companion</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>🤖</Text>
        </View>
        <Text style={styles.greeting}>
          Hi! I'm Shift, your personal debt advisor.
        </Text>
        <Text style={styles.placeholder}>
          AI companion coming in Phase 7
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    fontSize: 40,
  },
  greeting: {
    ...typography.body,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  placeholder: {
    ...typography.small,
    color: colors.text.muted,
  },
});
