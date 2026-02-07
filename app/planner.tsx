import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { colors, typography, spacing } from '@/theme';
import { borderRadius } from '@/theme/spacing';
import { CalendarView, PlannedPaymentCard, PayoffTimeline } from '@/components/planner';
import { Modal, Button } from '@/components/ui';
import {
  usePlannedPayments,
  useCalendarData,
  useMarkPlannedPaymentComplete,
  useDeletePlannedPayment,
  useCreatePlannedPayment,
  plannerKeys,
} from '@/hooks/usePlanner';
import { useDebts } from '@/hooks/useDebts';
import { useSafeToExtra } from '@/hooks/useBudget';
import { usePlannerStore } from '@/stores/usePlannerStore';
import { useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/formatters';
import type { PlannedPaymentWithDebt } from '@/services/planner';

/**
 * Payment Planner Screen
 * T109: Create app/planner.tsx with CalendarView, PlannedPaymentCard list, add button
 */

export default function PlannerScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isExtra, setIsExtra] = useState(false);

  const { calendarData } = usePlannerStore();
  const { data: plannedPayments = [], isLoading, refetch } = usePlannedPayments();
  const { refetch: refetchCalendar } = useCalendarData(selectedMonth);
  const { data: debts = [] } = useDebts();
  const { data: safeToExtra } = useSafeToExtra(selectedMonth);
  const { mutate: markComplete, isPending: isCompleting } = useMarkPlannedPaymentComplete();
  const { mutate: deletePayment } = useDeletePlannedPayment();
  const { mutate: createPayment, isPending: isCreating } = useCreatePlannedPayment();

  const activeDebts = debts.filter((d) => d.is_active && d.balance > 0);
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const paymentsForSelectedDate = calendarData[selectedDateStr] || [];

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetch(),
      refetchCalendar(),
      queryClient.invalidateQueries({ queryKey: plannerKeys.all }),
    ]);
    setIsRefreshing(false);
  }, [refetch, refetchCalendar, queryClient]);

  const handleMonthChange = useCallback(
    (month: string) => {
      setSelectedMonth(month);
    },
    []
  );

  const handleComplete = useCallback(
    (id: string) => {
      Alert.alert(
        'Complete Payment',
        'This will log an actual payment and update your debt balance. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            onPress: () => markComplete(id),
          },
        ]
      );
    },
    [markComplete]
  );

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        'Delete Planned Payment',
        'Are you sure you want to delete this planned payment?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deletePayment(id),
          },
        ]
      );
    },
    [deletePayment]
  );

  const handleAddPayment = useCallback(() => {
    if (!selectedDebtId || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid payment amount.');
      return;
    }

    createPayment(
      {
        debt_id: selectedDebtId,
        planned_date: selectedDateStr,
        planned_amount: amount,
        is_extra: isExtra,
      },
      {
        onSuccess: () => {
          setShowAddModal(false);
          setSelectedDebtId(null);
          setPaymentAmount('');
          setIsExtra(false);
        },
      }
    );
  }, [selectedDebtId, paymentAmount, selectedDateStr, isExtra, createPayment]);

  const upcomingPayments = plannedPayments
    .filter((p) => !p.is_completed)
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Planner</Text>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
          accessibilityLabel="Add planned payment"
        >
          <Ionicons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar */}
        <CalendarView
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onMonthChange={handleMonthChange}
          calendarData={calendarData}
          isLoading={isLoading}
        />

        {/* Payments for selected date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
          {paymentsForSelectedDate.length === 0 ? (
            <View style={styles.emptyDate}>
              <Text style={styles.emptyDateText}>
                No payments planned for this date
              </Text>
              <TouchableOpacity
                style={styles.addDateButton}
                onPress={() => setShowAddModal(true)}
              >
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addDateButtonText}>Add Payment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            paymentsForSelectedDate.map((payment) => (
              <PlannedPaymentCard
                key={payment.id}
                payment={payment}
                onComplete={handleComplete}
                onDelete={handleDelete}
                isCompleting={isCompleting}
              />
            ))
          )}
        </View>

        {/* Payoff Timeline */}
        <View style={styles.section}>
          <PayoffTimeline
            debts={debts}
            monthlyExtra={safeToExtra?.safeToExtra || 0}
            monthsToProject={12}
            isLoading={isLoading}
          />
        </View>

        {/* Upcoming Payments */}
        {upcomingPayments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Payments</Text>
            {upcomingPayments.map((payment) => (
              <PlannedPaymentCard
                key={payment.id}
                payment={payment}
                onComplete={handleComplete}
                onDelete={handleDelete}
                isCompleting={isCompleting}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Payment Modal */}
      <Modal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Planned Payment"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalLabel}>Date</Text>
          <Text style={styles.modalValue}>
            {format(selectedDate, 'MMMM d, yyyy')}
          </Text>

          <Text style={styles.modalLabel}>Select Debt</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.debtSelector}>
              {activeDebts.map((debt) => (
                <TouchableOpacity
                  key={debt.id}
                  style={[
                    styles.debtOption,
                    selectedDebtId === debt.id && styles.debtOptionSelected,
                    { borderColor: debt.color || colors.primary },
                  ]}
                  onPress={() => {
                    setSelectedDebtId(debt.id);
                    setPaymentAmount(debt.minimum_payment.toString());
                  }}
                >
                  <Text
                    style={[
                      styles.debtOptionText,
                      selectedDebtId === debt.id && styles.debtOptionTextSelected,
                    ]}
                  >
                    {debt.name}
                  </Text>
                  <Text style={styles.debtOptionBalance}>
                    {formatCurrency(debt.balance)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {selectedDebtId && (
            <>
              <Text style={styles.modalLabel}>Amount</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <Text style={styles.amountValue}>{paymentAmount || '0'}</Text>
              </View>

              <View style={styles.amountButtons}>
                {['50', '100', '200', '500'].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.amountButton}
                    onPress={() => setPaymentAmount(amount)}
                  >
                    <Text style={styles.amountButtonText}>${amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.extraToggle}
                onPress={() => setIsExtra(!isExtra)}
              >
                <View
                  style={[
                    styles.checkbox,
                    isExtra && styles.checkboxChecked,
                  ]}
                >
                  {isExtra && (
                    <Ionicons name="checkmark" size={14} color={colors.text.inverse} />
                  )}
                </View>
                <Text style={styles.extraToggleText}>Extra payment (above minimum)</Text>
              </TouchableOpacity>

              <Button
                title="Add Planned Payment"
                onPress={handleAddPayment}
                loading={isCreating}
                disabled={!selectedDebtId || !paymentAmount}
              />
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...typography.subtitle,
    color: colors.text.primary,
  },
  addButton: {
    padding: spacing.xs,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  emptyDate: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyDateText: {
    ...typography.body,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  addDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  addDateButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  modalContent: {
    paddingTop: spacing.md,
  },
  modalLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  modalValue: {
    ...typography.body,
    color: colors.text.primary,
  },
  debtSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  debtOption: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 2,
    minWidth: 120,
  },
  debtOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  debtOptionText: {
    ...typography.smallBold,
    color: colors.text.primary,
  },
  debtOptionTextSelected: {
    color: colors.primary,
  },
  debtOptionBalance: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  currencySymbol: {
    ...typography.title,
    color: colors.text.muted,
    marginRight: spacing.xs,
  },
  amountValue: {
    ...typography.title,
    color: colors.text.primary,
  },
  amountButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  amountButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  amountButtonText: {
    ...typography.small,
    color: colors.primary,
  },
  extraToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  extraToggleText: {
    ...typography.body,
    color: colors.text.primary,
  },
});
