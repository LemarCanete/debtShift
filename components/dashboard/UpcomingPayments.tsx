import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { format, addDays, isBefore, isToday, isTomorrow } from 'date-fns';
import { colors, typography, spacing } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import type { Debt } from '@/types/database';

interface UpcomingPayment {
  debtId: string;
  debtName: string;
  creditor: string;
  dueDate: Date;
  minimumPayment: number;
  color: string | null;
}

interface UpcomingPaymentsProps {
  debts: Debt[];
  daysAhead?: number;
  isLoading?: boolean;
}

/**
 * UpcomingPayments - Shows payments due in the next N days
 * T087: Create components/dashboard/UpcomingPayments.tsx
 */
export function UpcomingPayments({
  debts,
  daysAhead = 7,
  isLoading = false,
}: UpcomingPaymentsProps) {
  const router = useRouter();

  // Calculate upcoming payment dates
  const getUpcomingPayments = (): UpcomingPayment[] => {
    const today = new Date();
    const endDate = addDays(today, daysAhead);
    const upcoming: UpcomingPayment[] = [];

    debts.forEach((debt) => {
      if (!debt.due_day || debt.paid_off_at) return;

      // Get this month's due date
      const thisMonthDue = new Date(
        today.getFullYear(),
        today.getMonth(),
        debt.due_day
      );

      // Get next month's due date
      const nextMonthDue = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        debt.due_day
      );

      // Check if this month's due date is within range
      if (!isBefore(thisMonthDue, today) && isBefore(thisMonthDue, endDate)) {
        upcoming.push({
          debtId: debt.id,
          debtName: debt.name,
          creditor: debt.creditor,
          dueDate: thisMonthDue,
          minimumPayment: debt.minimum_payment,
          color: debt.color,
        });
      }

      // Check if next month's due date is within range (for month boundaries)
      if (isBefore(nextMonthDue, endDate) && !isBefore(nextMonthDue, today)) {
        upcoming.push({
          debtId: debt.id,
          debtName: debt.name,
          creditor: debt.creditor,
          dueDate: nextMonthDue,
          minimumPayment: debt.minimum_payment,
          color: debt.color,
        });
      }
    });

    // Sort by due date
    return upcoming.sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
    );
  };

  const upcomingPayments = getUpcomingPayments();

  const handlePaymentPress = (payment: UpcomingPayment) => {
    router.push(`/debt/${payment.debtId}`);
  };

  const formatDueDate = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE, MMM d');
  };

  const getDueDateStyle = (date: Date) => {
    if (isToday(date)) return styles.dueDateToday;
    if (isTomorrow(date)) return styles.dueDateSoon;
    return {};
  };

  if (isLoading) {
    return (
      <View style={styles.card}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  const renderPayment = ({ item }: { item: UpcomingPayment }) => (
    <Pressable
      style={({ pressed }) => [
        styles.paymentItem,
        pressed && styles.paymentItemPressed,
      ]}
      onPress={() => handlePaymentPress(item)}
      accessibilityLabel={`${item.debtName}, ${formatCurrency(item.minimumPayment)} due ${formatDueDate(item.dueDate)}`}
      accessibilityRole="button"
    >
      <View
        style={[
          styles.colorIndicator,
          { backgroundColor: item.color || colors.primary },
        ]}
      />
      <View style={styles.paymentInfo}>
        <Text style={styles.debtName} numberOfLines={1}>
          {item.debtName}
        </Text>
        <Text style={styles.creditor} numberOfLines={1}>
          {item.creditor}
        </Text>
      </View>
      <View style={styles.paymentDetails}>
        <Text style={styles.amount}>
          {formatCurrency(item.minimumPayment)}
        </Text>
        <Text style={[styles.dueDate, getDueDateStyle(item.dueDate)]}>
          {formatDueDate(item.dueDate)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Payments</Text>
        <Text style={styles.subtitle}>Next {daysAhead} days</Text>
      </View>

      {upcomingPayments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No payments due in the next {daysAhead} days
          </Text>
        </View>
      ) : (
        <FlatList
          data={upcomingPayments}
          renderItem={renderPayment}
          keyExtractor={(item) => `${item.debtId}-${item.dueDate.getTime()}`}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.text.muted,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  paymentItemPressed: {
    opacity: 0.7,
  },
  colorIndicator: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  paymentInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  debtName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  creditor: {
    ...typography.caption,
    color: colors.text.muted,
  },
  paymentDetails: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  dueDate: {
    ...typography.caption,
    color: colors.text.muted,
  },
  dueDateToday: {
    color: colors.danger,
    fontWeight: '600',
  },
  dueDateSoon: {
    color: colors.warning,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: spacing.md + 4, // Align with text after color indicator
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'center',
  },
  skeleton: {
    height: 100,
    backgroundColor: colors.surfaceElevated,
    borderRadius: spacing.borderRadius.md,
  },
});
