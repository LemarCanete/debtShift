import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type {
  Expense,
  ExpenseCategory,
  IncomeLog,
  TablesInsert,
  TablesUpdate,
} from '@/types/database';
import {
  getMonthlyBudget,
  getIncomeForMonth,
  getExpenses,
  getExpenseCategories,
  logIncome,
  updateIncome,
  deleteIncome,
  createExpense,
  updateExpense,
  deleteExpense,
  getSafeToExtra,
  getCurrentMonth,
  type MonthlyBudgetSummary,
  type BudgetResult,
} from '@/services/budget';

// ============================================
// Query Keys
// ============================================

export const budgetKeys = {
  all: ['budget'] as const,
  month: (month: string) => [...budgetKeys.all, 'month', month] as const,
  income: (month: string) => [...budgetKeys.all, 'income', month] as const,
  expenses: () => [...budgetKeys.all, 'expenses'] as const,
  categories: () => [...budgetKeys.all, 'categories'] as const,
  safeToExtra: () => [...budgetKeys.all, 'safeToExtra'] as const,
};

// ============================================
// Budget Queries
// ============================================

/**
 * Hook to fetch monthly budget summary
 */
export function useMonthlyBudget(
  month: string = getCurrentMonth(),
  options?: Omit<UseQueryOptions<MonthlyBudgetSummary | null>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: budgetKeys.month(month),
    queryFn: async () => {
      const result = await getMonthlyBudget(month);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
}

/**
 * Hook to fetch safe-to-extra amount
 */
export function useSafeToExtra() {
  return useQuery({
    queryKey: budgetKeys.safeToExtra(),
    queryFn: async () => {
      const result = await getSafeToExtra();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

// ============================================
// Income Queries & Mutations
// ============================================

/**
 * Hook to fetch income for a specific month
 */
export function useIncomeForMonth(month: string = getCurrentMonth()) {
  return useQuery({
    queryKey: budgetKeys.income(month),
    queryFn: async () => {
      const result = await getIncomeForMonth(month);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to log income with optimistic updates
 */
export function useLogIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (income: Omit<TablesInsert<'income_logs'>, 'user_id'>) => {
      const result = await logIncome(income);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onMutate: async (newIncome) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: budgetKeys.income(newIncome.month),
      });

      // Snapshot the previous value
      const previousIncome = queryClient.getQueryData<IncomeLog[]>(
        budgetKeys.income(newIncome.month)
      );

      // Optimistically update
      queryClient.setQueryData<IncomeLog[]>(
        budgetKeys.income(newIncome.month),
        (old) => [
          {
            ...newIncome,
            id: `temp-${Date.now()}`,
            user_id: 'temp',
            created_at: new Date().toISOString(),
          } as IncomeLog,
          ...(old || []),
        ]
      );

      return { previousIncome, month: newIncome.month };
    },
    onError: (err, newIncome, context) => {
      // Rollback on error
      if (context?.previousIncome) {
        queryClient.setQueryData(
          budgetKeys.income(context.month),
          context.previousIncome
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to sync with server
      queryClient.invalidateQueries({
        queryKey: budgetKeys.income(variables.month),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.month(variables.month),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.safeToExtra(),
      });
    },
  });
}

/**
 * Hook to update income
 */
export function useUpdateIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      month,
    }: {
      id: string;
      updates: TablesUpdate<'income_logs'>;
      month: string;
    }) => {
      const result = await updateIncome(id, updates);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: budgetKeys.income(variables.month),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.month(variables.month),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.safeToExtra(),
      });
    },
  });
}

/**
 * Hook to delete income
 */
export function useDeleteIncome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, month }: { id: string; month: string }) => {
      const result = await deleteIncome(id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return null;
    },
    onMutate: async ({ id, month }) => {
      await queryClient.cancelQueries({
        queryKey: budgetKeys.income(month),
      });

      const previousIncome = queryClient.getQueryData<IncomeLog[]>(
        budgetKeys.income(month)
      );

      queryClient.setQueryData<IncomeLog[]>(
        budgetKeys.income(month),
        (old) => old?.filter((i) => i.id !== id) || []
      );

      return { previousIncome, month };
    },
    onError: (err, variables, context) => {
      if (context?.previousIncome) {
        queryClient.setQueryData(
          budgetKeys.income(context.month),
          context.previousIncome
        );
      }
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: budgetKeys.income(variables.month),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.month(variables.month),
      });
      queryClient.invalidateQueries({
        queryKey: budgetKeys.safeToExtra(),
      });
    },
  });
}

// ============================================
// Expense Queries & Mutations
// ============================================

/**
 * Hook to fetch all expenses
 */
export function useExpenses() {
  return useQuery({
    queryKey: budgetKeys.expenses(),
    queryFn: async () => {
      const result = await getExpenses();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch expense categories
 */
export function useExpenseCategories() {
  return useQuery({
    queryKey: budgetKeys.categories(),
    queryFn: async () => {
      const result = await getExpenseCategories();
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour (categories rarely change)
  });
}

/**
 * Hook to create expense with optimistic updates
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expense: Omit<TablesInsert<'expenses'>, 'user_id'>) => {
      const result = await createExpense(expense);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onMutate: async (newExpense) => {
      await queryClient.cancelQueries({
        queryKey: budgetKeys.expenses(),
      });

      const previousExpenses =
        queryClient.getQueryData<Expense[]>(budgetKeys.expenses());

      queryClient.setQueryData<Expense[]>(budgetKeys.expenses(), (old) => [
        {
          ...newExpense,
          id: `temp-${Date.now()}`,
          user_id: 'temp',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Expense,
        ...(old || []),
      ]);

      return { previousExpenses };
    },
    onError: (err, newExpense, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(budgetKeys.expenses(), context.previousExpenses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}

/**
 * Hook to update expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: TablesUpdate<'expenses'>;
    }) => {
      const result = await updateExpense(id, updates);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: budgetKeys.expenses() });

      const previousExpenses =
        queryClient.getQueryData<Expense[]>(budgetKeys.expenses());

      queryClient.setQueryData<Expense[]>(budgetKeys.expenses(), (old) =>
        old?.map((e) => (e.id === id ? { ...e, ...updates } : e)) || []
      );

      return { previousExpenses };
    },
    onError: (err, variables, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(budgetKeys.expenses(), context.previousExpenses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}

/**
 * Hook to delete expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteExpense(id);
      if (result.error) {
        throw new Error(result.error.message);
      }
      return null;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: budgetKeys.expenses() });

      const previousExpenses =
        queryClient.getQueryData<Expense[]>(budgetKeys.expenses());

      queryClient.setQueryData<Expense[]>(budgetKeys.expenses(), (old) =>
        old?.filter((e) => e.id !== id) || []
      );

      return { previousExpenses };
    },
    onError: (err, id, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(budgetKeys.expenses(), context.previousExpenses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.expenses() });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}
