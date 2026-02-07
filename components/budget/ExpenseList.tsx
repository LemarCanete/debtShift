import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '@/theme';
import { formatCurrency } from '@/utils/formatters';
import { Card } from '@/components/ui';
import type { Expense } from '@/types/database';

interface ExpenseListProps {
  expenses: Expense[];
  totalEssentials: number;
  totalNonEssentials: number;
  onAddExpense: () => void;
  onEditExpense?: (expense: Expense) => void;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Housing: 'home',
  Utilities: 'flash',
  Groceries: 'cart',
  Transport: 'car',
  Insurance: 'shield-checkmark',
  Subscriptions: 'refresh',
  Dining: 'restaurant',
  Entertainment: 'game-controller',
  Shopping: 'bag',
  Other: 'ellipsis-horizontal',
};

/**
 * Expense list grouped by essential vs non-essential
 */
export function ExpenseList({
  expenses,
  totalEssentials,
  totalNonEssentials,
  onAddExpense,
  onEditExpense,
}: ExpenseListProps) {
  const essentialExpenses = expenses.filter((e) => e.is_essential);
  const nonEssentialExpenses = expenses.filter((e) => !e.is_essential);

  const renderExpenseItem = (expense: Expense) => {
    const categoryName = (expense as any).category?.name || 'Other';
    const icon = CATEGORY_ICONS[categoryName] || 'ellipsis-horizontal';

    return (
      <Pressable
        key={expense.id}
        style={({ pressed }) => [
          styles.expenseRow,
          pressed && onEditExpense && styles.expenseRowPressed,
        ]}
        onPress={() => onEditExpense?.(expense)}
        disabled={!onEditExpense}
      >
        <View style={styles.expenseInfo}>
          <View style={styles.expenseIcon}>
            <Ionicons name={icon} size={16} color={colors.text.muted} />
          </View>
          <View style={styles.expenseDetails}>
            <Text style={styles.expenseName} numberOfLines={1}>
              {expense.name}
            </Text>
            {expense.is_recurring && (
              <View style={styles.recurringBadge}>
                <Ionicons name="refresh" size={10} color={colors.text.muted} />
                <Text style={styles.recurringText}>Monthly</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.expenseAmount}>
          {formatCurrency(expense.amount)}
        </Text>
      </Pressable>
    );
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="trending-down" size={20} color={colors.error} />
          <Text style={styles.title}>Expenses</Text>
        </View>
        <Text style={styles.total}>
          {formatCurrency(totalEssentials + totalNonEssentials)}
        </Text>
      </View>

      {expenses.length > 0 ? (
        <>
          {/* Essential Expenses */}
          {essentialExpenses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="alert-circle" size={14} color={colors.warning} />
                  <Text style={styles.sectionTitle}>Essential</Text>
                </View>
                <Text style={styles.sectionTotal}>
                  {formatCurrency(totalEssentials)}
                </Text>
              </View>
              {essentialExpenses.map(renderExpenseItem)}
            </View>
          )}

          {/* Non-Essential Expenses */}
          {nonEssentialExpenses.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="sparkles" size={14} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Non-Essential</Text>
                </View>
                <Text style={styles.sectionTotal}>
                  {formatCurrency(totalNonEssentials)}
                </Text>
              </View>
              {nonEssentialExpenses.map(renderExpenseItem)}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No expenses added yet</Text>
          <Text style={styles.emptyHint}>
            Add your recurring expenses to track your budget
          </Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          pressed && styles.addButtonPressed,
        ]}
        onPress={onAddExpense}
        accessibilityLabel="Add expense"
      >
        <Ionicons name="add-circle" size={20} color={colors.primary} />
        <Text style={styles.addButtonText}>Add Expense</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  total: {
    ...typography.h3,
    color: colors.error,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    ...typography.small,
    color: colors.text.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionTotal: {
    ...typography.body,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  expenseRowPressed: {
    backgroundColor: colors.surfaceHover,
    marginHorizontal: -spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: spacing.borderRadius.sm,
  },
  expenseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  expenseIcon: {
    width: 32,
    height: 32,
    borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseDetails: {
    flex: 1,
  },
  expenseName: {
    ...typography.body,
    color: colors.text.primary,
  },
  recurringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 2,
  },
  recurringText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  expenseAmount: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  emptyHint: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default ExpenseList;
