import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { Skeleton } from '@/components/ui';
import {
  MonthSelector,
  IncomeCard,
  ExpenseList,
  SafeToPayCard,
} from '@/components/budget';
import {
  useMonthlyBudget,
  useIncomeForMonth,
  useExpenses,
} from '@/hooks/useBudget';
import { getCurrentMonth } from '@/services/budget';
import type { Expense, IncomeLog } from '@/types/database';

/**
 * Budget Tab - Monthly budget overview with income, expenses, and safe-to-extra
 */
export default function BudgetScreen() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // Fetch data for selected month
  const {
    data: budget,
    isLoading: budgetLoading,
    isRefetching: budgetRefetching,
    refetch: refetchBudget,
  } = useMonthlyBudget(selectedMonth);

  const {
    data: incomeLogs,
    isLoading: incomeLoading,
    refetch: refetchIncome,
  } = useIncomeForMonth(selectedMonth);

  const {
    data: expenses,
    isLoading: expensesLoading,
    refetch: refetchExpenses,
  } = useExpenses();

  const isLoading = budgetLoading || incomeLoading || expensesLoading;
  const isRefetching = budgetRefetching;

  const handleRefresh = useCallback(async () => {
    await Promise.all([refetchBudget(), refetchIncome(), refetchExpenses()]);
  }, [refetchBudget, refetchIncome, refetchExpenses]);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  const handleAddIncome = () => {
    router.push({
      pathname: '/income/log',
      params: { month: selectedMonth },
    });
  };

  const handleEditIncome = (income: IncomeLog) => {
    router.push({
      pathname: '/income/log',
      params: { id: income.id, month: selectedMonth },
    });
  };

  const handleAddExpense = () => {
    router.push('/expense/new');
  };

  const handleEditExpense = (expense: Expense) => {
    router.push(`/expense/${expense.id}`);
  };

  const handleMakePayment = (debtId: string) => {
    router.push({
      pathname: `/debt/${debtId}`,
      params: { openPayment: 'true' },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Month Navigation */}
        <MonthSelector month={selectedMonth} onMonthChange={handleMonthChange} />

        {/* Safe to Pay Extra - Main Focus */}
        <SafeToPayCard
          safeToExtra={budget?.safe_to_extra || 0}
          totalMinimums={budget?.total_minimums || 0}
          suggestedDebt={budget?.suggestedDebt}
          onMakePayment={handleMakePayment}
        />

        {/* Income Section */}
        <IncomeCard
          incomeLogs={incomeLogs || []}
          totalIncome={budget?.total_income || 0}
          onAddIncome={handleAddIncome}
          onEditIncome={handleEditIncome}
        />

        {/* Expenses Section */}
        <ExpenseList
          expenses={expenses || []}
          totalEssentials={budget?.total_essentials || 0}
          totalNonEssentials={budget?.total_non_essentials || 0}
          onAddExpense={handleAddExpense}
          onEditExpense={handleEditExpense}
        />

        {/* Budget Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Month Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={[styles.summaryValue, styles.incomeValue]}>
              +{budget?.total_income?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }) || '$0.00'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Essential Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>
              -{budget?.total_essentials?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }) || '$0.00'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Non-Essential Expenses</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>
              -{budget?.total_non_essentials?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }) || '$0.00'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Minimum Debt Payments</Text>
            <Text style={[styles.summaryValue, styles.expenseValue]}>
              -{budget?.total_minimums?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }) || '$0.00'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.summaryLabelBold]}>
              Available for Extra Payments
            </Text>
            <Text
              style={[
                styles.summaryValue,
                styles.summaryValueBold,
                (budget?.safe_to_extra || 0) >= 0
                  ? styles.incomeValue
                  : styles.expenseValue,
              ]}
            >
              {budget?.safe_to_extra?.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              }) || '$0.00'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 80,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.md,
  },
  summaryTitle: {
    ...typography.h4,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  summaryLabelBold: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
  },
  summaryValueBold: {
    ...typography.h4,
    fontWeight: '700',
  },
  incomeValue: {
    color: colors.success,
  },
  expenseValue: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
