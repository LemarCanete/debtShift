import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';

/**
 * Debts Screen - Placeholder
 * Will be fully implemented in Phase 3 (US1)
 */
export default function DebtsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Debts</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No debts yet</Text>
          <Text style={styles.emptySubtitle}>
            Add your first debt to get started
          </Text>
        </View>
        <Text style={styles.placeholder}>
          Debt management coming in Phase 3
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
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  placeholder: {
    ...typography.small,
    color: colors.text.muted,
  },
});
