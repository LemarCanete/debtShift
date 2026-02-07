import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import { Card } from '@/components/ui';

interface SafeToPayCardProps {
  safeToExtra: number;
  totalMinimums: number;
  suggestedDebt?: {
    id: string;
    name: string;
    reason: string;
  } | null;
  onMakePayment?: (debtId: string) => void;
}

/**
 * Prominent card showing safe-to-extra amount with suggested debt
 * Includes compassionate messaging for "tough months" (negative safe-to-extra)
 */
export function SafeToPayCard({
  safeToExtra,
  totalMinimums,
  suggestedDebt,
  onMakePayment,
}: SafeToPayCardProps) {
  const isToughMonth = safeToExtra < 0;
  const canMakeExtra = safeToExtra > 0 && suggestedDebt;

  const getStatusColor = () => {
    if (isToughMonth) return colors.error;
    if (safeToExtra === 0) return colors.warning;
    return colors.success;
  };

  const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
    if (isToughMonth) return 'heart';
    if (safeToExtra === 0) return 'remove-circle';
    return 'checkmark-circle';
  };

  return (
    <Card
      style={[
        styles.container,
        { borderColor: getStatusColor() + '40' },
      ]}
    >
      {/* Main Safe to Extra Section */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name={getStatusIcon()} size={20} color={getStatusColor()} />
          <Text style={styles.label}>Safe to Pay Extra</Text>
        </View>
        <Text
          style={[
            styles.amount,
            { color: getStatusColor() },
          ]}
        >
          {formatCurrency(Math.max(0, safeToExtra))}
        </Text>
      </View>

      {/* Minimums reminder */}
      <View style={styles.minimumsRow}>
        <Text style={styles.minimumsLabel}>Minimum payments covered:</Text>
        <Text style={styles.minimumsAmount}>
          {formatCurrency(totalMinimums)}
        </Text>
      </View>

      {/* Tough Month Message (T073) */}
      {isToughMonth && (
        <View style={styles.toughMonthCard}>
          <View style={styles.toughMonthHeader}>
            <Ionicons name="heart" size={24} color={colors.warning} />
            <Text style={styles.toughMonthTitle}>It's a tough month</Text>
          </View>
          <Text style={styles.toughMonthText}>
            Your expenses exceed your income by{' '}
            <Text style={styles.toughMonthAmount}>
              {formatCurrency(Math.abs(safeToExtra))}
            </Text>
            . That's okay - some months are harder than others.
          </Text>
          <Text style={styles.toughMonthAdvice}>
            Focus on making your minimum payments. Consider reviewing your
            non-essential expenses, or logging additional income if available.
          </Text>
          <View style={styles.toughMonthActions}>
            <Ionicons name="bulb" size={16} color={colors.primary} />
            <Text style={styles.toughMonthTip}>
              Tip: Even small wins count. You're still making progress!
            </Text>
          </View>
        </View>
      )}

      {/* Debt Suggestion (T074) */}
      {canMakeExtra && (
        <View style={styles.suggestion}>
          <View style={styles.suggestionHeader}>
            <Ionicons name="flash" size={16} color={colors.primary} />
            <Text style={styles.suggestionTitle}>Recommended</Text>
          </View>
          <Text style={styles.suggestionText}>
            Put your extra toward{' '}
            <Text style={styles.debtName}>{suggestedDebt.name}</Text>
          </Text>
          <Text style={styles.suggestionReason}>{suggestedDebt.reason}</Text>

          {onMakePayment && (
            <Pressable
              style={({ pressed }) => [
                styles.payButton,
                pressed && styles.payButtonPressed,
              ]}
              onPress={() => onMakePayment(suggestedDebt.id)}
            >
              <Ionicons name="add-circle" size={18} color={colors.background} />
              <Text style={styles.payButtonText}>Make Extra Payment</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Zero safe-to-extra message */}
      {safeToExtra === 0 && !isToughMonth && (
        <View style={styles.zeroMessage}>
          <Ionicons name="checkmark-done" size={16} color={colors.success} />
          <Text style={styles.zeroText}>
            Your budget is balanced. Great job covering your essentials!
          </Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    borderWidth: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.body,
    color: colors.text.muted,
    fontWeight: '600',
  },
  amount: {
    ...typography.hero,
    fontWeight: '700',
  },
  minimumsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.sm,
  },
  minimumsLabel: {
    ...typography.small,
    color: colors.text.muted,
  },
  minimumsAmount: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  toughMonthCard: {
    backgroundColor: colors.warning + '15',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  toughMonthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toughMonthTitle: {
    ...typography.h4,
    color: colors.warning,
    fontWeight: '600',
  },
  toughMonthText: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  toughMonthAmount: {
    color: colors.error,
    fontWeight: '700',
  },
  toughMonthAdvice: {
    ...typography.small,
    color: colors.text.muted,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  toughMonthActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.warning + '30',
  },
  toughMonthTip: {
    ...typography.small,
    color: colors.primary,
    flex: 1,
  },
  suggestion: {
    backgroundColor: colors.primary + '10',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  suggestionTitle: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestionText: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  debtName: {
    fontWeight: '700',
    color: colors.primary,
  },
  suggestionReason: {
    ...typography.small,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  payButtonPressed: {
    opacity: 0.8,
  },
  payButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  zeroMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success + '10',
    borderRadius: spacing.borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  zeroText: {
    ...typography.small,
    color: colors.success,
    flex: 1,
  },
});

export default SafeToPayCard;
