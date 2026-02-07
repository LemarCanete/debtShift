import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { Button, Skeleton } from '@/components/ui';
import { DebtCard } from '@/components/debt';
import { useDebts, useDebtStats } from '@/hooks/useDebts';
import { formatCurrency, formatPercent } from '@/utils/formatters';
import type { Debt } from '@/types/database';

/**
 * Debts Tab - List all debts with FAB to add new debt
 */
export default function DebtsScreen() {
  const {
    data: debts,
    isLoading,
    isRefetching,
    refetch,
  } = useDebts({ activeOnly: true });

  const { data: stats } = useDebtStats();

  const handleDebtPress = (debt: Debt) => {
    router.push(`/debt/${debt.id}`);
  };

  const handleAddDebt = () => {
    router.push('/debt/new');
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={styles.emptyTitle}>No debts yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first debt to start tracking your journey to financial freedom
      </Text>
      <Button onPress={handleAddDebt} style={styles.emptyButton}>
        Add Your First Debt
      </Button>
    </View>
  );

  const renderHeader = () => {
    if (!stats || (debts?.length || 0) === 0) return null;

    return (
      <View style={styles.header}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Debt</Text>
            <Text style={styles.statValue}>
              {formatCurrency(stats.totalBalance)}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Progress</Text>
            <Text style={[styles.statValue, styles.progressValue]}>
              {formatPercent(stats.progressPercent / 100)}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(stats.progressPercent, 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {formatCurrency(stats.totalOriginal - stats.totalBalance)} paid of{' '}
            {formatCurrency(stats.totalOriginal)}
          </Text>
        </View>

        <View style={styles.countsRow}>
          <Text style={styles.countText}>
            {stats.debtCount} active debt{stats.debtCount !== 1 ? 's' : ''}
          </Text>
          {stats.paidOffCount > 0 && (
            <Text style={styles.paidOffCount}>
              {stats.paidOffCount} paid off 🎉
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderDebtItem = ({ item }: { item: Debt }) => (
    <DebtCard debt={item} onPress={() => handleDebtPress(item)} />
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={debts}
        keyExtractor={(item) => item.id}
        renderItem={renderDebtItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={[
          styles.listContent,
          (debts?.length || 0) === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {(debts?.length || 0) > 0 && (
        <Pressable onPress={handleAddDebt} style={styles.fab}>
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      )}
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl + 80,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.xxs,
  },
  statValue: {
    ...typography.h2,
    color: colors.text.primary,
  },
  progressValue: {
    color: colors.success,
  },
  progressContainer: {
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceHover,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  progressText: {
    ...typography.small,
    color: colors.text.muted,
    textAlign: 'center',
  },
  countsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    ...typography.small,
    color: colors.text.secondary,
  },
  paidOffCount: {
    ...typography.small,
    color: colors.success,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: {
    color: colors.background,
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 32,
  },
});
