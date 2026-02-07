import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import {
  getPlannedPayments,
  getPlannedPaymentsForMonth,
  getUpcomingPlannedPayments,
  getPlannedPayment,
  createPlannedPayment,
  updatePlannedPayment,
  deletePlannedPayment,
  markPlannedPaymentComplete,
  getCalendarData,
  getPlannedPaymentTotals,
  type PlannedPaymentWithDebt,
  type CreatePlannedPaymentInput,
  type UpdatePlannedPaymentInput,
} from '@/services/planner';
import { usePlannerStore } from '@/stores/usePlannerStore';
import { debtKeys } from './useDebts';
import { paymentKeys } from './usePayments';

/**
 * Planner Hooks for Payment Planning
 * T105: Create hooks/usePlanner.ts with React Query hooks
 */

// Query keys
export const plannerKeys = {
  all: ['planner'] as const,
  lists: () => [...plannerKeys.all, 'list'] as const,
  list: (month: string) => [...plannerKeys.lists(), month] as const,
  upcoming: (days: number) => [...plannerKeys.all, 'upcoming', days] as const,
  detail: (id: string) => [...plannerKeys.all, 'detail', id] as const,
  calendar: (month: string) => [...plannerKeys.all, 'calendar', month] as const,
  totals: (month: string) => [...plannerKeys.all, 'totals', month] as const,
};

/**
 * Hook to get all planned payments
 */
export function usePlannedPayments() {
  const { setPlannedPayments, setLoading, setError } = usePlannerStore();

  const query = useQuery({
    queryKey: plannerKeys.lists(),
    queryFn: async () => {
      const result = await getPlannedPayments();
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      setPlannedPayments(query.data);
    }
  }, [query.data, setPlannedPayments]);

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.error) {
      setError(query.error.message);
    }
  }, [query.error, setError]);

  return query;
}

/**
 * Hook to get planned payments for a specific month
 */
export function usePlannedPaymentsForMonth(month: string) {
  return useQuery({
    queryKey: plannerKeys.list(month),
    queryFn: async () => {
      const result = await getPlannedPaymentsForMonth(month);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get upcoming planned payments
 */
export function useUpcomingPlannedPayments(daysAhead: number = 30) {
  return useQuery({
    queryKey: plannerKeys.upcoming(daysAhead),
    queryFn: async () => {
      const result = await getUpcomingPlannedPayments(daysAhead);
      if (result.error) throw new Error(result.error.message);
      return result.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to get a single planned payment
 */
export function usePlannedPayment(id: string) {
  return useQuery({
    queryKey: plannerKeys.detail(id),
    queryFn: async () => {
      const result = await getPlannedPayment(id);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    enabled: !!id,
  });
}

/**
 * Hook to get calendar data for a month
 */
export function useCalendarData(month: string) {
  const { setCalendarData } = usePlannerStore();

  const query = useQuery({
    queryKey: plannerKeys.calendar(month),
    queryFn: async () => {
      const result = await getCalendarData(month);
      if (result.error) throw new Error(result.error.message);
      return result.data || {};
    },
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      setCalendarData(query.data);
    }
  }, [query.data, setCalendarData]);

  return query;
}

/**
 * Hook to get planned payment totals for a month
 */
export function usePlannedPaymentTotals(month: string) {
  return useQuery({
    queryKey: plannerKeys.totals(month),
    queryFn: async () => {
      const result = await getPlannedPaymentTotals(month);
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to create a planned payment
 */
export function useCreatePlannedPayment() {
  const queryClient = useQueryClient();
  const { addPlannedPayment, setError } = usePlannerStore();

  return useMutation({
    mutationFn: async (input: CreatePlannedPaymentInput) => {
      const result = await createPlannedPayment(input);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      addPlannedPayment(data as PlannedPaymentWithDebt);
      queryClient.invalidateQueries({ queryKey: plannerKeys.all });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      setError(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Hook to update a planned payment
 */
export function useUpdatePlannedPayment() {
  const queryClient = useQueryClient();
  const { updatePlannedPayment: updateStore, setError } = usePlannerStore();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdatePlannedPaymentInput;
    }) => {
      const result = await updatePlannedPayment(id, updates);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      updateStore(data.id, data as PlannedPaymentWithDebt);
      queryClient.invalidateQueries({ queryKey: plannerKeys.all });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onError: (error) => {
      setError(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Hook to delete a planned payment
 */
export function useDeletePlannedPayment() {
  const queryClient = useQueryClient();
  const { removePlannedPayment, setError } = usePlannerStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deletePlannedPayment(id);
      if (result.error) throw new Error(result.error.message);
      return id;
    },
    onSuccess: (id) => {
      removePlannedPayment(id);
      queryClient.invalidateQueries({ queryKey: plannerKeys.all });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      setError(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}

/**
 * Hook to mark a planned payment as complete
 * T110: Add markComplete action that creates actual payment record
 */
export function useMarkPlannedPaymentComplete() {
  const queryClient = useQueryClient();
  const { markComplete, setError } = usePlannerStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await markPlannedPaymentComplete(id);
      if (result.error) throw new Error(result.error.message);
      return result.data!;
    },
    onSuccess: (data) => {
      // Update local store
      markComplete(data.plannedPayment.id);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: plannerKeys.all });
      queryClient.invalidateQueries({ queryKey: debtKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });

      // Celebration haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      setError(error.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });
}
