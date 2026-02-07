import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '@/theme';
import { Button, Card, Skeleton, Modal, Input } from '@/components/ui';
import { DebtForm } from '@/components/debt';
import { PayoffChart } from '@/components/debt/PayoffChart';
import { useDebt, useUpdateDebt, useDeleteDebt } from '@/hooks/useDebts';
import { usePaymentsForDebt, useLogPayment, useDeletePayment } from '@/hooks/usePayments';
import { formatCurrency, formatPercent, formatDate, formatShortDate } from '@/utils/formatters';
import { getDebtTypeLabel } from '@/utils/constants';
import { calculatePayoffDate, calculateMonthsUntilDebtFree } from '@/utils/calculations';
import type { TablesUpdate, Payment } from '@/types/database';

/**
 * Debt Detail Screen - View and manage individual debt with payment tracking
 */
export default function DebtDetailScreen() {
  const { id, openPayment } = useLocalSearchParams<{ id: string; openPayment?: string }>();
  const { data: debt, isLoading, refetch, isRefetching } = useDebt(id);
  const { data: payments, refetch: refetchPayments } = usePaymentsForDebt(id);
  const updateMutation = useUpdateDebt();
  const deleteMutation = useDeleteDebt();
  const logPaymentMutation = useLogPayment();
  const deletePaymentMutation = useDeletePayment();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(openPayment === 'true');
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isExtraPayment, setIsExtraPayment] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentError, setPaymentError] = useState('');

  // Reset form when closing
  useEffect(() => {
    if (!showPaymentForm) {
      setPaymentAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setIsExtraPayment(false);
      setPaymentNotes('');
      setPaymentError('');
    }
  }, [showPaymentForm]);

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchPayments()]);
  };

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

  const handleLogPayment = async () => {
    setPaymentError('');

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setPaymentError('Please enter a valid amount');
      return;
    }

    if (amount > currentBalance) {
      setPaymentError(`Payment cannot exceed balance of ${formatCurrency(currentBalance)}`);
      return;
    }

    try {
      const result = await logPaymentMutation.mutateAsync({
        debt_id: debt.id,
        amount,
        payment_date: paymentDate,
        is_extra: isExtraPayment,
        notes: paymentNotes || undefined,
      });

      // Haptic feedback on success (T081)
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setShowPaymentForm(false);

      // Show celebration for extra payments (T083)
      if (isExtraPayment) {
        setCelebrationMessage("You made an extra payment! Every extra dollar counts!");
        setShowCelebration(true);
      } else if (result?.milestoneAchieved) {
        // Show milestone celebration
        setCelebrationMessage(result.milestoneAchieved.message);
        setShowCelebration(true);
      }

      // Refresh data
      handleRefresh();
    } catch (error) {
      setPaymentError(
        error instanceof Error ? error.message : 'Failed to log payment'
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDeletePayment = (payment: Payment) => {
    Alert.alert(
      'Delete Payment',
      `Are you sure you want to delete this ${formatCurrency(payment.amount)} payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePaymentMutation.mutateAsync({
              id: payment.id,
              debtId: debt.id,
            });
            handleRefresh();
          },
        },
      ]
    );
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
            onRefresh={handleRefresh}
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
            <>
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

              {/* Log Payment Button */}
              <Button
                onPress={() => setShowPaymentForm(true)}
                style={styles.logPaymentButton}
              >
                <View style={styles.logPaymentContent}>
                  <Ionicons name="add-circle" size={20} color={colors.background} />
                  <Text style={styles.logPaymentText}>Log Payment</Text>
                </View>
              </Button>
            </>
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

        {/* Payment History Section (T079) */}
        <Card style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            {(payments?.length || 0) > 0 && (
              <Text style={styles.historyCount}>
                {payments?.length} payment{payments?.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>

          {(payments?.length || 0) > 0 ? (
            <View style={styles.paymentList}>
              {payments?.map((payment) => (
                <Pressable
                  key={payment.id}
                  style={({ pressed }) => [
                    styles.paymentItem,
                    pressed && styles.paymentItemPressed,
                  ]}
                  onLongPress={() => handleDeletePayment(payment)}
                >
                  <View style={styles.paymentInfo}>
                    <View style={styles.paymentMain}>
                      <Text style={styles.paymentAmount}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      {payment.is_extra && (
                        <View style={styles.extraBadge}>
                          <Ionicons name="flash" size={10} color={colors.primary} />
                          <Text style={styles.extraBadgeText}>Extra</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.paymentDate}>
                      {formatShortDate(payment.payment_date)}
                    </Text>
                    {payment.notes && (
                      <Text style={styles.paymentNotes} numberOfLines={1}>
                        {payment.notes}
                      </Text>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.text.muted}
                  />
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyHistoryText}>
                No payments logged yet
              </Text>
              {!isPaidOff && (
                <Button
                  variant="secondary"
                  size="sm"
                  onPress={() => setShowPaymentForm(true)}
                >
                  Log a Payment
                </Button>
              )}
            </View>
          )}
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

      {/* Payment Form Modal (T078) */}
      <Modal
        visible={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.paymentModal}>
            <View style={styles.paymentModalHeader}>
              <Text style={styles.paymentModalTitle}>Log Payment</Text>
              <Text style={styles.paymentModalSubtitle}>
                Balance: {formatCurrency(currentBalance)}
              </Text>
            </View>

            <Input
              label="Amount"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              leftIcon="cash-outline"
              isCurrency
              error={paymentError}
            />

            <Input
              label="Date"
              value={paymentDate}
              onChangeText={setPaymentDate}
              placeholder="YYYY-MM-DD"
              leftIcon="calendar-outline"
            />

            <View style={styles.extraToggle}>
              <View style={styles.extraToggleInfo}>
                <Ionicons
                  name="flash"
                  size={20}
                  color={isExtraPayment ? colors.primary : colors.text.muted}
                />
                <View>
                  <Text style={styles.extraToggleLabel}>Extra Payment</Text>
                  <Text style={styles.extraToggleHint}>
                    Above minimum payment
                  </Text>
                </View>
              </View>
              <Switch
                value={isExtraPayment}
                onValueChange={setIsExtraPayment}
                trackColor={{ false: colors.surfaceHover, true: colors.primary }}
                thumbColor={colors.background}
              />
            </View>

            <Input
              label="Notes (optional)"
              value={paymentNotes}
              onChangeText={setPaymentNotes}
              placeholder="e.g., Tax refund, bonus payment"
              multiline
            />

            <View style={styles.paymentModalActions}>
              <Button
                variant="secondary"
                onPress={() => setShowPaymentForm(false)}
                style={styles.paymentModalButton}
              >
                Cancel
              </Button>
              <Button
                onPress={handleLogPayment}
                isLoading={logPaymentMutation.isPending}
                style={styles.paymentModalButton}
              >
                Log Payment
              </Button>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Celebration Modal (T083) */}
      <Modal
        visible={showCelebration}
        onClose={() => setShowCelebration(false)}
      >
        <View style={styles.celebrationModal}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>Amazing!</Text>
          <Text style={styles.celebrationMessage}>{celebrationMessage}</Text>
          <Button onPress={() => setShowCelebration(false)} fullWidth>
            Keep Going!
          </Button>
        </View>
      </Modal>

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
  progressSection: {
    marginBottom: spacing.md,
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
  logPaymentButton: {
    marginTop: spacing.sm,
  },
  logPaymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logPaymentText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
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
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  historyCount: {
    ...typography.small,
    color: colors.text.muted,
  },
  paymentList: {
    gap: spacing.xs,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.sm,
    backgroundColor: colors.surfaceHover,
    borderRadius: spacing.borderRadius.md,
  },
  paymentItemPressed: {
    opacity: 0.7,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentAmount: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  extraBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  extraBadgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  paymentDate: {
    ...typography.small,
    color: colors.text.muted,
    marginTop: 2,
  },
  paymentNotes: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: 2,
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
  paymentModal: {
    padding: spacing.lg,
  },
  paymentModalHeader: {
    marginBottom: spacing.lg,
  },
  paymentModalTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  paymentModalSubtitle: {
    ...typography.body,
    color: colors.text.muted,
  },
  extraToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    marginBottom: spacing.md,
  },
  extraToggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  extraToggleLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  extraToggleHint: {
    ...typography.small,
    color: colors.text.muted,
  },
  paymentModalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  paymentModalButton: {
    flex: 1,
  },
  celebrationModal: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  celebrationTitle: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  celebrationMessage: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
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
