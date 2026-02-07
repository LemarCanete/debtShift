import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/theme';
import { borderRadius } from '@/theme/spacing';
import { formatCurrency } from '@/utils/formatters';
import type { PlannedPaymentWithDebt } from '@/services/planner';

/**
 * Planned Payment Card Component
 * T107: Create components/planner/PlannedPaymentCard.tsx with debt, amount, date, complete button
 */

interface PlannedPaymentCardProps {
  payment: PlannedPaymentWithDebt;
  onComplete: (id: string) => void;
  onPress?: (payment: PlannedPaymentWithDebt) => void;
  onDelete?: (id: string) => void;
  isCompleting?: boolean;
}

export function PlannedPaymentCard({
  payment,
  onComplete,
  onPress,
  onDelete,
  isCompleting = false,
}: PlannedPaymentCardProps) {
  const isCompleted = payment.is_completed;
  const paymentDate = new Date(payment.planned_date);
  const isOverdue = isPast(paymentDate) && !isToday(paymentDate) && !isCompleted;

  const getDateLabel = (): string => {
    if (isToday(paymentDate)) return 'Today';
    if (isTomorrow(paymentDate)) return 'Tomorrow';
    return format(paymentDate, 'MMM d, yyyy');
  };

  const handleComplete = () => {
    if (isCompleted || isCompleting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onComplete(payment.id);
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(payment);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete(payment.id);
    }
  };

  const debtColor = payment.debt?.color || colors.primary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCompleted && styles.containerCompleted,
        isOverdue && styles.containerOverdue,
      ]}
      onPress={handlePress}
      disabled={!onPress}
      accessibilityLabel={`${payment.debt?.name || 'Payment'}, ${formatCurrency(payment.planned_amount)}, ${getDateLabel()}${isCompleted ? ', completed' : ''}`}
    >
      {/* Color indicator */}
      <View style={[styles.colorIndicator, { backgroundColor: debtColor }]} />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.debtInfo}>
            <Text
              style={[
                styles.debtName,
                isCompleted && styles.textCompleted,
              ]}
              numberOfLines={1}
            >
              {payment.debt?.name || 'Unknown Debt'}
            </Text>
            {payment.is_extra && (
              <View style={styles.extraBadge}>
                <Text style={styles.extraBadgeText}>Extra</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.amount,
              isCompleted && styles.textCompleted,
            ]}
          >
            {formatCurrency(payment.planned_amount)}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.dateContainer}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={
                isOverdue
                  ? colors.danger
                  : isCompleted
                  ? colors.text.muted
                  : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.dateText,
                isOverdue && styles.dateTextOverdue,
                isCompleted && styles.textCompleted,
              ]}
            >
              {getDateLabel()}
            </Text>
          </View>

          <View style={styles.actions}>
            {!isCompleted && onDelete && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
                accessibilityLabel="Delete payment"
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.text.muted}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleComplete}
              style={[
                styles.completeButton,
                isCompleted && styles.completeButtonDone,
              ]}
              disabled={isCompleted || isCompleting}
              accessibilityLabel={isCompleted ? 'Payment completed' : 'Mark as complete'}
            >
              {isCompleting ? (
                <Ionicons
                  name="hourglass-outline"
                  size={20}
                  color={colors.text.muted}
                />
              ) : isCompleted ? (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.success}
                />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  containerCompleted: {
    opacity: 0.7,
  },
  containerOverdue: {
    borderWidth: 1,
    borderColor: colors.danger,
  },
  colorIndicator: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  debtInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.sm,
  },
  debtName: {
    ...typography.bodyBold,
    color: colors.text.primary,
    flex: 1,
  },
  textCompleted: {
    color: colors.text.muted,
    textDecorationLine: 'line-through',
  },
  extraBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  extraBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  amount: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  dateTextOverdue: {
    color: colors.danger,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  completeButton: {
    padding: spacing.xs,
  },
  completeButtonDone: {
    opacity: 1,
  },
});
