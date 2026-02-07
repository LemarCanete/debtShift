import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import { ProgressRing } from './ProgressRing';

interface TotalDebtCardProps {
  totalBalance: number;
  totalOriginal: number;
  progressPercent: number;
  debtCount: number;
  isLoading?: boolean;
}

/**
 * TotalDebtCard - Primary dashboard card showing total debt and progress
 * T084: Create components/dashboard/TotalDebtCard.tsx
 */
export function TotalDebtCard({
  totalBalance,
  totalOriginal,
  progressPercent,
  debtCount,
  isLoading = false,
}: TotalDebtCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push('/(tabs)/debts');
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  const paidAmount = totalOriginal - totalBalance;
  const isDebtFree = totalBalance === 0 && totalOriginal > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      accessibilityLabel={`Total debt ${formatCurrency(totalBalance)}, ${Math.round(progressPercent)}% paid off`}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <View style={styles.textSection}>
          <Text style={styles.label}>Total Debt</Text>
          <Text style={styles.amount}>{formatCurrency(totalBalance)}</Text>

          {totalOriginal > 0 && (
            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                {formatCurrency(paidAmount)} paid
              </Text>
              <Text style={styles.statDivider}>•</Text>
              <Text style={styles.statText}>
                {debtCount} {debtCount === 1 ? 'debt' : 'debts'}
              </Text>
            </View>
          )}

          {isDebtFree && (
            <View style={styles.celebrationBanner}>
              <Text style={styles.celebrationText}>
                You're debt-free!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.progressSection}>
          <ProgressRing
            progress={progressPercent}
            size={80}
            strokeWidth={8}
          />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceElevated,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    marginRight: spacing.md,
  },
  label: {
    ...typography.small,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  amount: {
    ...typography.hero,
    color: colors.text.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  statDivider: {
    ...typography.caption,
    color: colors.text.muted,
    marginHorizontal: spacing.xs,
  },
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationBanner: {
    backgroundColor: colors.success,
    borderRadius: spacing.borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  celebrationText: {
    ...typography.caption,
    color: colors.text.inverse,
    fontWeight: '600',
  },
  skeleton: {
    height: 100,
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.borderRadius.md,
  },
});
