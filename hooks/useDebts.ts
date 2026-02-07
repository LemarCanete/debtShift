import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as debtService from '@/services/debts';
import type { Debt, TablesInsert, TablesUpdate } from '@/types/database';

// Query keys
export const debtKeys = {
  all: ['debts'] as const,
  lists: () => [...debtKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...debtKeys.lists(), filters] as const,
  details: () => [...debtKeys.all, 'detail'] as const,
  detail: (id: string) => [...debtKeys.details(), id] as const,
  stats: () => [...debtKeys.all, 'stats'] as const,
};

/**
 * Hook to fetch all debts
 */
export function useDebts(options?: {
  activeOnly?: boolean;
  orderBy?: 'balance' | 'apr' | 'due_day' | 'created_at';
  orderDirection?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: debtKeys.list(options || {}),
    queryFn: async () => {
      const { data, error } = await debtService.getDebts(options);
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single debt
 */
export function useDebt(id: string | undefined) {
  return useQuery({
    queryKey: debtKeys.detail(id || ''),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await debtService.getDebt(id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch debt statistics
 */
export function useDebtStats() {
  return useQuery({
    queryKey: debtKeys.stats(),
    queryFn: async () => {
      const { data, error } = await debtService.getDebtStats();
      if (error) throw new Error(error.message);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to create a new debt
 */
export function useCreateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (debt: Omit<TablesInsert<'debts'>, 'user_id'>) => {
      const { data, error } = await debtService.createDebt(debt);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (newDebt) => {
      // Optimistically update the list
      queryClient.setQueryData<Debt[]>(debtKeys.lists(), (old) => {
        if (!old || !newDebt) return old;
        return [newDebt, ...old];
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.stats() });
    },
  });
}

/**
 * Hook to update a debt
 */
export function useUpdateDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: TablesUpdate<'debts'>;
    }) => {
      const { data, error } = await debtService.updateDebt(id, updates);
      if (error) throw new Error(error.message);
      return data;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: debtKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: debtKeys.lists() });

      // Snapshot previous value
      const previousDebt = queryClient.getQueryData<Debt>(debtKeys.detail(id));
      const previousDebts = queryClient.getQueryData<Debt[]>(debtKeys.lists());

      // Optimistically update
      if (previousDebt) {
        queryClient.setQueryData<Debt>(debtKeys.detail(id), {
          ...previousDebt,
          ...updates,
        });
      }

      if (previousDebts) {
        queryClient.setQueryData<Debt[]>(debtKeys.lists(), (old) =>
          old?.map((d) => (d.id === id ? { ...d, ...updates } : d))
        );
      }

      return { previousDebt, previousDebts };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousDebt) {
        queryClient.setQueryData(debtKeys.detail(id), context.previousDebt);
      }
      if (context?.previousDebts) {
        queryClient.setQueryData(debtKeys.lists(), context.previousDebts);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: debtKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.stats() });
    },
  });
}

/**
 * Hook to delete a debt (soft delete)
 */
export function useDeleteDebt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await debtService.deleteDebt(id);
      if (error) throw new Error(error.message);
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: debtKeys.lists() });

      const previousDebts = queryClient.getQueryData<Debt[]>(debtKeys.lists());

      // Optimistically remove from list
      queryClient.setQueryData<Debt[]>(debtKeys.lists(), (old) =>
        old?.filter((d) => d.id !== id)
      );

      return { previousDebts };
    },
    onError: (err, id, context) => {
      if (context?.previousDebts) {
        queryClient.setQueryData(debtKeys.lists(), context.previousDebts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.stats() });
    },
  });
}

/**
 * Hook to mark a debt as paid off
 */
export function useMarkDebtPaidOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await debtService.markDebtAsPaidOff(id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: debtKeys.lists() });
      queryClient.invalidateQueries({ queryKey: debtKeys.stats() });
    },
  });
}

/**
 * Hook to get debts by strategy
 */
export function useDebtsByStrategy(strategy: 'snowball' | 'avalanche') {
  return useQuery({
    queryKey: [...debtKeys.lists(), 'strategy', strategy],
    queryFn: async () => {
      const { data, error } = await debtService.getDebtsByStrategy(strategy);
      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
