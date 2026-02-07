import { create } from 'zustand';
import type {
  Expense,
  ExpenseCategory,
  IncomeLog,
  MonthlyBudget,
} from '@/types/database';
import {
  getExpenses,
  getExpenseCategories,
  getIncomeForMonth,
  getMonthlyBudget,
  createExpense,
  updateExpense,
  deleteExpense,
  logIncome,
  updateIncome,
  deleteIncome,
  getCurrentMonth,
  type MonthlyBudgetSummary,
} from '@/services/budget';

interface BudgetState {
  // State
  selectedMonth: string;
  monthlyBudget: MonthlyBudgetSummary | null;
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  incomeLogs: IncomeLog[];
  isLoading: boolean;
  error: string | null;

  // Computed values (cached)
  totalIncome: number;
  totalEssentials: number;
  totalNonEssentials: number;
  totalMinimums: number;
  safeToExtra: number;

  // Actions
  setSelectedMonth: (month: string) => void;
  fetchBudget: (month?: string) => Promise<void>;
  fetchExpenses: () => Promise<void>;
  fetchExpenseCategories: () => Promise<void>;
  fetchIncome: (month?: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  addIncome: (income: Omit<IncomeLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  editIncome: (id: string, updates: Partial<IncomeLog>) => Promise<void>;
  removeIncome: (id: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  selectedMonth: getCurrentMonth(),
  monthlyBudget: null,
  expenses: [],
  expenseCategories: [],
  incomeLogs: [],
  isLoading: false,
  error: null,
  totalIncome: 0,
  totalEssentials: 0,
  totalNonEssentials: 0,
  totalMinimums: 0,
  safeToExtra: 0,
};

export const useBudgetStore = create<BudgetState>((set, get) => ({
  ...initialState,

  setSelectedMonth: (month: string) => {
    set({ selectedMonth: month });
    get().fetchBudget(month);
    get().fetchIncome(month);
  },

  fetchBudget: async (month?: string) => {
    const targetMonth = month || get().selectedMonth;
    set({ isLoading: true, error: null });

    try {
      const result = await getMonthlyBudget(targetMonth);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      const budget = result.data;
      set({
        monthlyBudget: budget,
        totalIncome: budget?.total_income || 0,
        totalEssentials: budget?.total_essentials || 0,
        totalNonEssentials: budget?.total_non_essentials || 0,
        totalMinimums: budget?.total_minimums || 0,
        safeToExtra: budget?.safe_to_extra || 0,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch budget',
        isLoading: false,
      });
    }
  },

  fetchExpenses: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await getExpenses();

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      set({ expenses: result.data || [], isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch expenses',
        isLoading: false,
      });
    }
  },

  fetchExpenseCategories: async () => {
    try {
      const result = await getExpenseCategories();

      if (result.error) {
        set({ error: result.error.message });
        return;
      }

      set({ expenseCategories: result.data || [] });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : 'Failed to fetch categories',
      });
    }
  },

  fetchIncome: async (month?: string) => {
    const targetMonth = month || get().selectedMonth;
    set({ isLoading: true, error: null });

    try {
      const result = await getIncomeForMonth(targetMonth);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      set({ incomeLogs: result.data || [], isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch income',
        isLoading: false,
      });
    }
  },

  addExpense: async (expense) => {
    set({ isLoading: true, error: null });

    try {
      const result = await createExpense(expense);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      // Refresh expenses and budget
      await get().fetchExpenses();
      await get().fetchBudget();
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add expense',
        isLoading: false,
      });
    }
  },

  editExpense: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      const result = await updateExpense(id, updates);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      // Refresh expenses and budget
      await get().fetchExpenses();
      await get().fetchBudget();
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update expense',
        isLoading: false,
      });
    }
  },

  removeExpense: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const result = await deleteExpense(id);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      // Refresh expenses and budget
      await get().fetchExpenses();
      await get().fetchBudget();
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete expense',
        isLoading: false,
      });
    }
  },

  addIncome: async (income) => {
    set({ isLoading: true, error: null });

    try {
      const result = await logIncome(income);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      // Refresh income and budget
      await get().fetchIncome();
      await get().fetchBudget();
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add income',
        isLoading: false,
      });
    }
  },

  editIncome: async (id, updates) => {
    set({ isLoading: true, error: null });

    try {
      const result = await updateIncome(id, updates);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      // Refresh income and budget
      await get().fetchIncome();
      await get().fetchBudget();
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to update income',
        isLoading: false,
      });
    }
  },

  removeIncome: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const result = await deleteIncome(id);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      // Refresh income and budget
      await get().fetchIncome();
      await get().fetchBudget();
      set({ isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete income',
        isLoading: false,
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));

// Selector hooks for specific state slices
export const useBudget = () => useBudgetStore((state) => state.monthlyBudget);
export const useExpenses = () => useBudgetStore((state) => state.expenses);
export const useExpenseCategories = () =>
  useBudgetStore((state) => state.expenseCategories);
export const useIncomeLogs = () => useBudgetStore((state) => state.incomeLogs);
export const useSafeToExtra = () => useBudgetStore((state) => state.safeToExtra);
export const useBudgetLoading = () => useBudgetStore((state) => state.isLoading);
export const useBudgetError = () => useBudgetStore((state) => state.error);
export const useSelectedMonth = () =>
  useBudgetStore((state) => state.selectedMonth);
