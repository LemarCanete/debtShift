import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { colors, typography, spacing } from '@/theme';
import { useDebts, useDebtStats, debtKeys } from '@/hooks/useDebts';
import { useMonthlyBudget, useSafeToExtra, budgetKeys } from '@/hooks/useBudget';
import {
  TotalDebtCard,
  BudgetSnapshot,
  UpcomingPayments,
  DailyQuote,
} from '@/components/dashboard';
import { getDailyQuote, getRandomQuote, type Quote } from '@/services/quotes';
import { useEffect } from 'react';

/**
 * Dashboard Screen - Primary home screen with financial overview
 * T089: Create app/(tabs)/dashboard.tsx composing all dashboard components
 * T090: Add pull-to-refresh functionality to dashboard
 */
export default function DashboardScreen() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(true);

  // Data hooks
  const {
    data: debts = [],
    isLoading: debtsLoading,
    refetch: refetchDebts,
  } = useDebts();

  const {
    data: debtStats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDebtStats();

  // Get current month for budget
  const currentMonth = format(new Date(), 'yyyy-MM');
  const {
    data: monthlyBudget,
    isLoading: budgetLoading,
    refetch: refetchBudget,
  } = useMonthlyBudget(currentMonth);

  const {
    data: safeToExtra,
    isLoading: safeToExtraLoading,
    refetch: refetchSafeToExtra,
  } = useSafeToExtra(currentMonth);

  // Load daily quote on mount
  useEffect(() => {
    loadDailyQuote();
  }, []);

  const loadDailyQuote = async () => {
    setQuoteLoading(true);
    const result = await getDailyQuote();
    if (result.data) {
      setQuote(result.data);
    }
    setQuoteLoading(false);
  };

  const handleRefreshQuote = async () => {
    const result = await getRandomQuote();
    if (result.data) {
      setQuote(result.data);
    }
  };

  // Pull-to-refresh handler (T090)
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      // Invalidate and refetch all dashboard data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: debtKeys.all }),
        queryClient.invalidateQueries({ queryKey: budgetKeys.all }),
        refetchDebts(),
        refetchStats(),
        refetchBudget(),
        refetchSafeToExtra(),
        loadDailyQuote(),
      ]);
    } catch (error) {
      console.error('Dashboard refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [
    queryClient,
    refetchDebts,
    refetchStats,
    refetchBudget,
    refetchSafeToExtra,
  ]);

  // Calculate budget values
  const totalIncome = monthlyBudget?.totalIncome || 0;
  const totalExpenses = monthlyBudget?.totalExpenses || 0;
  const safeToExtraAmount = safeToExtra?.safeToExtra || 0;

  const isLoading =
    debtsLoading || statsLoading || budgetLoading || safeToExtraLoading;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.title}>Your Progress</Text>
        </View>

        {/* Total Debt Card with Progress Ring */}
        <TotalDebtCard
          totalBalance={debtStats?.totalBalance || 0}
          totalOriginal={debtStats?.totalOriginal || 0}
          progressPercent={debtStats?.progressPercent || 0}
          debtCount={debtStats?.debtCount || 0}
          isLoading={statsLoading}
        />

        {/* Budget Snapshot */}
        <BudgetSnapshot
          income={totalIncome}
          expenses={totalExpenses}
          safeToExtra={safeToExtraAmount}
          monthLabel={format(new Date(), 'MMMM yyyy')}
          isLoading={budgetLoading || safeToExtraLoading}
        />

        {/* Upcoming Payments */}
        <UpcomingPayments
          debts={debts}
          daysAhead={7}
          isLoading={debtsLoading}
        />

        {/* Daily Quote */}
        <DailyQuote
          quote={quote}
          isLoading={quoteLoading}
          onRefresh={handleRefreshQuote}
        />

        {/* Empty state for new users */}
        {!isLoading && debts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Welcome to DebtShift!</Text>
            <Text style={styles.emptyText}>
              Add your first debt to get started on your journey to becoming debt-free.
            </Text>
          </View>
        )}
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
    paddingBottom: spacing.xl,
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
  emptyState: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
