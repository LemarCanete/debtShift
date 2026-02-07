import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Payment, TablesInsert } from '@/types/database';
import {
  getPayments,
  getPaymentsForDebt,
  logPayment,
  deletePayment,
  getPaymentStats,
  getMonthlyPayments,
  type PaymentWithDebt,
} from '@/services/payments';
import { debtKeys } from './useDebts';

// ============================================
// Query Keys
// ============================================

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...paymentKeys.lists(), filters] as const,
  forDebt: (debtId: string) => [...paymentKeys.all, 'debt', debtId] as const,
  stats: () => [...paymentKeys.all, 'stats'] as const,
  monthly: (months: number) => [...paymentKeys.all, 'monthly', months] as const,
};

// ============================================
// Payment Queries
// ============================================

/**
 * Hook to fetch all payments with optional filters
 */
export function usePaymentList(options?: {
  debtId?: string;
  fromDate?: string;
  toDate?: string;
  isExtra?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: paymentKeys.list(options || {}),
    queryFn: async () => {
      const result = await getPayments(options);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch payments for a specific debt
 */
export function usePaymentsForDebt(debtId: string, limit: number = 20) {
  return useQuery({
    queryKey: paymentKeys.forDebt(debtId),
    queryFn: async () => {
      const result = await getPaymentsForDebt(debtId, limit);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data || [];
    },
    enabled: !!debtId,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch payment statistics
 */
export function usePaymentStats() {
  return useQuery({
    queryKey: paymentKeys.stats(),
    queryFn: async () => {
      const result = await getPaymentStats();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch monthly payment data for charts
 */
export function useMonthlyPayments(months: number = 6) {
  return useQuery({
    queryKey: paymentKeys.monthly(months),
    queryFn: async () => {
      const result = await getMonthlyPayments(months);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ============================================
// Payment Mutations
// ============================================

/**
 * Hook to log a payment with optimistic updates
 */
export function useLogPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payment: Omit<TablesInsert<'payments'>, 'user_id'>
    ) => {
      const result = await logPayment(payment);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onMutate: async (newPayment) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: paymentKeys.forDebt(newPayment.debt_id),
      });

      // Snapshot previous values
      const previousPayments = queryClient.getQueryData<Payment[]>(
        paymentKeys.forDebt(newPayment.debt_id)
      );

      // Optimistically add the new payment
      queryClient.setQueryData<Payment[]>(
        paymentKeys.forDebt(newPayment.debt_id),
        (old) => [
          {
            ...newPayment,
            id: `temp-${Date.now()}`,
            user_id: 'temp',
            created_at: new Date().toISOString(),
          } as Payment,
          ...(old || []),
        ]
      );

      return { previousPayments, debtId: newPayment.debt_id };
    },
    onError: (err, newPayment, context) => {
      // Rollback on error
      if (context?.previousPayments) {
        queryClient.setQueryData(
          paymentKeys.forDebt(context.debtId),
          context.previousPayments
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({
        queryKey: paymentKeys.forDebt(variables.debt_id),
      });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });

      // Also invalidate debt queries since balance changed
      queryClient.invalidateQueries({
        queryKey: debtKeys.detail(variables.debt_id),
      });
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.stats() });
    },
  });
}

/**
 * Hook to delete a payment
 */
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      debtId,
    }: {
      id: string;
      debtId: string;
    }) => {
      const result = await deletePayment(id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return null;
    },
    onMutate: async ({ id, debtId }) => {
      await queryClient.cancelQueries({
        queryKey: paymentKeys.forDebt(debtId),
      });

      const previousPayments = queryClient.getQueryData<Payment[]>(
        paymentKeys.forDebt(debtId)
      );

      // Optimistically remove the payment
      queryClient.setQueryData<Payment[]>(
        paymentKeys.forDebt(debtId),
        (old) => old?.filter((p) => p.id !== id) || []
      );

      return { previousPayments, debtId };
    },
    onError: (err, variables, context) => {
      if (context?.previousPayments) {
        queryClient.setQueryData(
          paymentKeys.forDebt(context.debtId),
          context.previousPayments
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.forDebt(variables.debtId),
      });
      queryClient.invalidateQueries({ queryKey: paymentKeys.stats() });
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });

      // Also invalidate debt queries since balance changed
      queryClient.invalidateQueries({
        queryKey: debtKeys.detail(variables.debtId),
      });
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.stats() });
    },
  });
}
