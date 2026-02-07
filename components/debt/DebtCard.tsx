import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, typography, spacing } from '@/theme';
import { Card } from '@/components/ui';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import { getDebtTypeLabel } from '@/utils/constants';
import type { Debt } from '@/types/database';

interface DebtCardProps {
  debt: Debt;
  onPress?: () => void;
  showProgress?: boolean;
  compact?: boolean;
}

/**
 * Card component displaying debt information with progress bar
 */
export function DebtCard({
  debt,
  onPress,
  showProgress = true,
  compact = false,
}: DebtCardProps) {
  const originalBalance = debt.original_balance || debt.balance || 0;
  const currentBalance = debt.balance || 0;
  const progressPercent =
    originalBalance > 0
      ? Math.min(((originalBalance - currentBalance) / originalBalance) * 100, 100)
      : 0;

  const isPaidOff = debt.paid_off_at !== null || currentBalance === 0;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Card
        variant="default"
        style={[styles.card, compact && styles.cardCompact]}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: debt.color || colors.primary },
              ]}
            />
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>
                {debt.name}
              </Text>
              <Text style={styles.creditor} numberOfLines={1}>
                {debt.creditor} • {getDebtTypeLabel(debt.debt_type as any)}
              </Text>
            </View>
          </View>

          {isPaidOff && (
            <View style={styles.paidOffBadge}>
              <Text style={styles.paidOffText}>Paid Off!</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={[styles.balance, isPaidOff && styles.balancePaidOff]}>
              {formatCurrency(currentBalance)}
            </Text>
          </View>

          {!compact && (
            <View style={styles.detailsRow}>
              <View style={styles.detail}>
                <Text style={styles.detailLabel}>APR</Text>
                <Text style={styles.detailValue}>
                  {formatPercent(debt.apr || 0)}
                </Text>
              </View>

              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Min Payment</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(debt.minimum_payment || 0)}
                </Text>
              </View>

              <View style={styles.detail}>
                <Text style={styles.detailLabel}>Due</Text>
                <Text style={styles.detailValue}>
                  {debt.due_day ? `${debt.due_day}th` : '-'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {showProgress && !isPaidOff && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: debt.color || colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {progressPercent.toFixed(0)}% paid off
            </Text>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardCompact: {
    padding: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  creditor: {
    ...typography.small,
    color: colors.text.muted,
    marginTop: 2,
  },
  paidOffBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.borderRadius.full,
  },
  paidOffText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  body: {
    marginBottom: spacing.sm,
  },
  balanceContainer: {
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 2,
  },
  balance: {
    ...typography.h2,
    color: colors.text.primary,
  },
  balancePaidOff: {
    color: colors.success,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  detail: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceHover,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xxs,
    textAlign: 'right',
  },
});

export default DebtCard;
