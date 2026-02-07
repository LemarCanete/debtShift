import { create } from 'zustand';
import type { Debt, TablesInsert, TablesUpdate } from '@/types/database';
import * as debtService from '@/services/debts';

interface DebtState {
  debts: Debt[];
  selectedDebt: Debt | null;
  isLoading: boolean;
  error: string | null;
  stats: {
    totalBalance: number;
    totalOriginal: number;
    totalMinimumPayments: number;
    debtCount: number;
    paidOffCount: number;
    progressPercent: number;
  } | null;
}

interface DebtActions {
  fetchDebts: (options?: {
    activeOnly?: boolean;
    orderBy?: 'balance' | 'apr' | 'due_day' | 'created_at';
    orderDirection?: 'asc' | 'desc';
  }) => Promise<void>;
  fetchDebt: (id: string) => Promise<Debt | null>;
  createDebt: (debt: Omit<TablesInsert<'debts'>, 'user_id'>) => Promise<boolean>;
  updateDebt: (id: string, updates: TablesUpdate<'debts'>) => Promise<boolean>;
  deleteDebt: (id: string) => Promise<boolean>;
  markAsPaidOff: (id: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  setSelectedDebt: (debt: Debt | null) => void;
  clearError: () => void;
  reset: () => void;
}

type DebtStore = DebtState & DebtActions;

const initialState: DebtState = {
  debts: [],
  selectedDebt: null,
  isLoading: false,
  error: null,
  stats: null,
};

export const useDebtStore = create<DebtStore>((set, get) => ({
  ...initialState,

  fetchDebts: async (options) => {
    set({ isLoading: true, error: null });

    const { data, error } = await debtService.getDebts(options);

    if (error) {
      set({ isLoading: false, error: error.message });
      return;
    }

    set({ debts: data || [], isLoading: false });
  },

  fetchDebt: async (id: string) => {
    set({ isLoading: true, error: null });

    const { data, error } = await debtService.getDebt(id);

    if (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }

    set({ selectedDebt: data, isLoading: false });
    return data;
  },

  createDebt: async (debt) => {
    set({ isLoading: true, error: null });

    const { data, error } = await debtService.createDebt(debt);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    if (data) {
      set((state) => ({
        debts: [data, ...state.debts],
        isLoading: false,
      }));
    }

    return true;
  },

  updateDebt: async (id, updates) => {
    set({ isLoading: true, error: null });

    const { data, error } = await debtService.updateDebt(id, updates);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    if (data) {
      set((state) => ({
        debts: state.debts.map((d) => (d.id === id ? data : d)),
        selectedDebt: state.selectedDebt?.id === id ? data : state.selectedDebt,
        isLoading: false,
      }));
    }

    return true;
  },

  deleteDebt: async (id) => {
    set({ isLoading: true, error: null });

    const { error } = await debtService.deleteDebt(id);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    set((state) => ({
      debts: state.debts.filter((d) => d.id !== id),
      selectedDebt: state.selectedDebt?.id === id ? null : state.selectedDebt,
      isLoading: false,
    }));

    return true;
  },

  markAsPaidOff: async (id) => {
    set({ isLoading: true, error: null });

    const { data, error } = await debtService.markDebtAsPaidOff(id);

    if (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }

    if (data) {
      set((state) => ({
        debts: state.debts.map((d) => (d.id === id ? data : d)),
        selectedDebt: state.selectedDebt?.id === id ? data : state.selectedDebt,
        isLoading: false,
      }));
    }

    return true;
  },

  fetchStats: async () => {
    const { data, error } = await debtService.getDebtStats();

    if (error) {
      set({ error: error.message });
      return;
    }

    set({ stats: data });
  },

  setSelectedDebt: (debt) => set({ selectedDebt: debt }),

  clearError: () => set({ error: null }),

  reset: () => set(initialState),
}));

// Selector hooks
export const useDebts = () => useDebtStore((state) => state.debts);
export const useSelectedDebt = () => useDebtStore((state) => state.selectedDebt);
export const useDebtStats = () => useDebtStore((state) => state.stats);
export const useDebtLoading = () => useDebtStore((state) => state.isLoading);
export const useDebtError = () => useDebtStore((state) => state.error);

// Computed selectors
export const useTotalDebt = () =>
  useDebtStore((state) =>
    state.debts.reduce((sum, debt) => sum + (debt.balance || 0), 0)
  );

export const useDebtProgress = () =>
  useDebtStore((state) => {
    const totalOriginal = state.debts.reduce(
      (sum, d) => sum + (d.original_balance || d.balance || 0),
      0
    );
    const totalBalance = state.debts.reduce(
      (sum, d) => sum + (d.balance || 0),
      0
    );
    if (totalOriginal === 0) return 0;
    return ((totalOriginal - totalBalance) / totalOriginal) * 100;
  });
