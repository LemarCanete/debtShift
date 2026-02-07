import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { colors, typography, spacing } from '@/theme';
import { Button, Card, Skeleton, Modal } from '@/components/ui';
import { DebtForm } from '@/components/debt';
import { PayoffChart } from '@/components/debt/PayoffChart';
import { useDebt, useUpdateDebt, useDeleteDebt } from '@/hooks/useDebts';
import { formatCurrency, formatPercent, formatDate } from '@/utils/formatters';
import { getDebtTypeLabel } from '@/utils/constants';
import { calculatePayoffDate, calculateMonthsUntilDebtFree } from '@/utils/calculations';
import type { TablesUpdate } from '@/types/database';

/**
 * Debt Detail Screen - View and manage individual debt
 */
export default function DebtDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: debt, isLoading, refetch, isRefetching } = useDebt(id);
  const updateMutation = useUpdateDebt();
  const deleteMutation = useDeleteDebt();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  if (!debt) {
    return (
      <View style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Debt not found</Text>
          <Button onPress={() => router.back()}>Go Back</Button>
        </View>
      </View>
    );
  }

  const originalBalance = debt.original_balance || debt.balance || 0;
  const currentBalance = debt.balance || 0;
  const progressPercent =
    originalBalance > 0
      ? Math.min(((originalBalance - currentBalance) / originalBalance) * 100, 100)
      : 0;

  const isPaidOff = debt.paid_off_at !== null || currentBalance === 0;

  // Calculate payoff projection
  const payoffDate = calculatePayoffDate(
    currentBalance,
    debt.apr || 0,
    debt.minimum_payment || 0
  );

  const monthsUntilFree = calculateMonthsUntilDebtFree(
    currentBalance,
    debt.apr || 0,
    debt.minimum_payment || 0
  );

  const handleUpdate = async (updates: TablesUpdate<'debts'>) => {
    const success = await updateMutation.mutateAsync({ id: debt.id, updates });
    if (success) {
      setIsEditing(false);
    }
    return !!success;
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    const success = await deleteMutation.mutateAsync(debt.id);
    if (success) {
      router.back();
    }
  };

  if (isEditing) {
    return (
      <>
        <Stack.Screen options={{ title: 'Edit Debt' }} />
        <DebtForm
          initialData={debt}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isLoading={updateMutation.isPending}
          submitLabel="Save Changes"
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: debt.name,
          headerRight: () => (
            <Pressable onPress={() => setIsEditing(true)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Edit</Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View
              style={[
                styles.colorIndicator,
                { backgroundColor: debt.color || colors.primary },
              ]}
            />
            <View style={styles.headerInfo}>
              <Text style={styles.debtName}>{debt.name}</Text>
              <Text style={styles.debtCreditor}>
                {debt.creditor} • {getDebtTypeLabel(debt.debt_type as any)}
              </Text>
            </View>
            {isPaidOff && (
              <View style={styles.paidOffBadge}>
                <Text style={styles.paidOffText}>Paid Off!</Text>
              </View>
            )}
          </View>

          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={[styles.balanceAmount, isPaidOff && styles.balancePaidOff]}>
              {formatCurrency(currentBalance)}
            </Text>
          </View>

          {!isPaidOff && (
            <View style={styles.progressSection}>
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
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>
                  {progressPercent.toFixed(0)}% paid off
                </Text>
                <Text style={styles.progressText}>
                  {formatCurrency(originalBalance - currentBalance)} of{' '}
                  {formatCurrency(originalBalance)}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Details Card */}
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>APR</Text>
              <Text style={styles.detailValue}>
                {formatPercent((debt.apr || 0) / 100)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Minimum Payment</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(debt.minimum_payment || 0)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Due Day</Text>
              <Text style={styles.detailValue}>
                {debt.due_day ? `${debt.due_day}th of each month` : 'Not set'}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Original Balance</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(originalBalance)}
              </Text>
            </View>
          </View>
        </Card>

        {/* Payoff Projection */}
        {!isPaidOff && payoffDate && (
          <Card style={styles.projectionCard}>
            <Text style={styles.sectionTitle}>Payoff Projection</Text>

            <View style={styles.projectionContent}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>Debt-Free Date</Text>
                <Text style={styles.projectionValue}>
                  {formatDate(payoffDate, 'MMMM yyyy')}
                </Text>
              </View>

              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>Time Remaining</Text>
                <Text style={styles.projectionValue}>
                  {monthsUntilFree} month{monthsUntilFree !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            <PayoffChart
              balance={currentBalance}
              apr={debt.apr || 0}
              minimumPayment={debt.minimum_payment || 0}
              color={debt.color || colors.primary}
            />

            <Text style={styles.projectionHint}>
              Paying minimum only. Extra payments will speed this up!
            </Text>
          </Card>
        )}

        {/* Payment History Section Placeholder */}
        <Card style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyHistoryText}>
              No payments logged yet
            </Text>
            <Button variant="secondary" size="sm">
              Log a Payment
            </Button>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.actions}>
          <Button variant="secondary" onPress={() => setIsEditing(true)} fullWidth>
            Edit Debt
          </Button>

          <Button
            variant="danger"
            onPress={() => setShowDeleteConfirm(true)}
            fullWidth
          >
            Delete Debt
          </Button>
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.deleteModal}>
          <Text style={styles.deleteTitle}>Delete Debt?</Text>
          <Text style={styles.deleteMessage}>
            Are you sure you want to delete "{debt.name}"? This action cannot be
            undone.
          </Text>
          <View style={styles.deleteActions}>
            <Button
              variant="secondary"
              onPress={() => setShowDeleteConfirm(false)}
              style={styles.deleteButton}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onPress={handleDelete}
              isLoading={deleteMutation.isPending}
              style={styles.deleteButton}
            >
              Delete
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  notFoundText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  headerButton: {
    paddingHorizontal: spacing.sm,
  },
  headerButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  headerCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  colorIndicator: {
    width: 4,
    height: 48,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  debtName: {
    ...typography.h2,
    color: colors.text.primary,
  },
  debtCreditor: {
    ...typography.body,
    color: colors.text.muted,
    marginTop: 2,
  },
  paidOffBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
  },
  paidOffText: {
    ...typography.small,
    color: colors.success,
    fontWeight: '600',
  },
  balanceSection: {
    marginBottom: spacing.md,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.xxs,
  },
  balanceAmount: {
    ...typography.hero,
    color: colors.text.primary,
  },
  balancePaidOff: {
    color: colors.success,
  },
  progressSection: {},
  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceHover,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    ...typography.caption,
    color: colors.text.muted,
  },
  detailsCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  detailsGrid: {
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  detailValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  projectionCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  projectionContent: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  projectionItem: {
    flex: 1,
  },
  projectionLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginBottom: spacing.xxs,
  },
  projectionValue: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: '600',
  },
  projectionHint: {
    ...typography.caption,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  historyCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  emptyHistoryText: {
    ...typography.body,
    color: colors.text.muted,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  deleteModal: {
    padding: spacing.lg,
  },
  deleteTitle: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  deleteMessage: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  deleteActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deleteButton: {
    flex: 1,
  },
});
