import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { formatCurrency } from '@/utils/formatters';

interface BudgetSnapshotProps {
  income: number;
  expenses: number;
  safeToExtra: number;
  monthLabel?: string;
  isLoading?: boolean;
}

/**
 * BudgetSnapshot - Compact budget summary for dashboard
 * T086: Create components/dashboard/BudgetSnapshot.tsx
 */
export function BudgetSnapshot({
  income,
  expenses,
  safeToExtra,
  monthLabel,
  isLoading = false,
}: BudgetSnapshotProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/(tabs)/budget');
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  const isToughMonth = safeToExtra < 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      accessibilityLabel={`Budget snapshot: ${formatCurrency(safeToExtra)} safe to put toward debt`}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Budget</Text>
        {monthLabel && <Text style={styles.monthLabel}>{monthLabel}</Text>}
      </View>

      <View style={styles.row}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Income</Text>
          <Text style={[styles.statValue, styles.incomeValue]}>
            {formatCurrency(income)}
          </Text>
        </View>

        <View style={styles.stat}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={[styles.statValue, styles.expenseValue]}>
            {formatCurrency(expenses)}
          </Text>
        </View>
      </View>

      <View style={styles.safeToExtraSection}>
        <Text style={styles.safeToExtraLabel}>Safe to pay extra</Text>
        <Text
          style={[
            styles.safeToExtraValue,
            isToughMonth && styles.safeToExtraNegative,
          ]}
        >
          {formatCurrency(Math.abs(safeToExtra))}
          {isToughMonth && ' short'}
        </Text>
        {isToughMonth && (
          <Text style={styles.toughMonthHint}>
            Focus on minimums this month
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceElevated,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  monthLabel: {
    ...typography.caption,
    color: colors.text.muted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 2,
  },
  statValue: {
    ...typography.body,
    fontWeight: '600',
  },
  incomeValue: {
    color: colors.success,
  },
  expenseValue: {
    color: colors.text.secondary,
  },
  safeToExtraSection: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  safeToExtraLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 2,
  },
  safeToExtraValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
  },
  safeToExtraNegative: {
    color: colors.danger,
  },
  toughMonthHint: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 4,
  },
  skeleton: {
    height: 120,
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.borderRadius.md,
  },
});
