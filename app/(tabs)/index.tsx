import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';

/**
 * Dashboard/Home Screen - Placeholder
 * Will be fully implemented in Phase 6 (US4)
 */
export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.title}>Dashboard</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Debt</Text>
          <Text style={styles.amount}>$0.00</Text>
          <Text style={styles.progress}>0% paid off</Text>
        </View>

        <Text style={styles.placeholder}>
          Full dashboard coming in Phase 6
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.body,
    color: colors.text.secondary,
  },
  title: {
    ...typography.hero,
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.hero,
    color: colors.text.primary,
  },
  progress: {
    ...typography.body,
    color: colors.success,
    marginTop: spacing.xs,
  },
  placeholder: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
