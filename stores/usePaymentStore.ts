import { create } from 'zustand';
import type { Payment } from '@/types/database';
import {
  getPayments,
  getPaymentsForDebt,
  logPayment,
  deletePayment,
  getPaymentStats,
  type PaymentWithDebt,
} from '@/services/payments';

interface PaymentState {
  // State
  payments: PaymentWithDebt[];
  recentPayments: Payment[];
  isLoading: boolean;
  error: string | null;

  // Stats
  totalPaid: number;
  totalExtraPaid: number;
  paymentCount: number;
  extraPaymentCount: number;
  lastPaymentDate: string | null;

  // Last milestone achieved (for celebration)
  lastMilestone: {
    type: string;
    message: string;
  } | null;

  // Actions
  fetchPayments: (options?: { debtId?: string; limit?: number }) => Promise<void>;
  fetchPaymentsForDebt: (debtId: string) => Promise<void>;
  logPayment: (payment: {
    debt_id: string;
    amount: number;
    payment_date: string;
    is_extra?: boolean;
    notes?: string;
  }) => Promise<{
    success: boolean;
    newBalance?: number;
    milestone?: { type: string; message: string };
  }>;
  removePayment: (id: string) => Promise<boolean>;
  fetchStats: () => Promise<void>;
  clearMilestone: () => void;
  reset: () => void;
}

const initialState = {
  payments: [],
  recentPayments: [],
  isLoading: false,
  error: null,
  totalPaid: 0,
  totalExtraPaid: 0,
  paymentCount: 0,
  extraPaymentCount: 0,
  lastPaymentDate: null,
  lastMilestone: null,
};

export const usePaymentStore = create<PaymentState>((set, get) => ({
  ...initialState,

  fetchPayments: async (options) => {
    set({ isLoading: true, error: null });

    try {
      const result = await getPayments(options);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      set({ payments: result.data || [], isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch payments',
        isLoading: false,
      });
    }
  },

  fetchPaymentsForDebt: async (debtId: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await getPaymentsForDebt(debtId);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return;
      }

      set({ recentPayments: result.data || [], isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch payments',
        isLoading: false,
      });
    }
  },

  logPayment: async (payment) => {
    set({ isLoading: true, error: null });

    try {
      const result = await logPayment(payment);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return { success: false };
      }

      const { newBalance, milestoneAchieved } = result.data!;

      // Update state with milestone if achieved
      if (milestoneAchieved) {
        set({ lastMilestone: milestoneAchieved });
      }

      // Refresh payments and stats
      await get().fetchStats();

      set({ isLoading: false });

      return {
        success: true,
        newBalance,
        milestone: milestoneAchieved,
      };
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to log payment',
        isLoading: false,
      });
      return { success: false };
    }
  },

  removePayment: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await deletePayment(id);

      if (result.error) {
        set({ error: result.error.message, isLoading: false });
        return false;
      }

      // Refresh stats
      await get().fetchStats();

      set({ isLoading: false });
      return true;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to delete payment',
        isLoading: false,
      });
      return false;
    }
  },

  fetchStats: async () => {
    try {
      const result = await getPaymentStats();

      if (result.error) {
        return;
      }

      set({
        totalPaid: result.data?.totalPaid || 0,
        totalExtraPaid: result.data?.totalExtraPaid || 0,
        paymentCount: result.data?.paymentCount || 0,
        extraPaymentCount: result.data?.extraPaymentCount || 0,
        lastPaymentDate: result.data?.lastPaymentDate || null,
      });
    } catch {
      // Silently fail for stats
    }
  },

  clearMilestone: () => {
    set({ lastMilestone: null });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selector hooks
export const usePayments = () => usePaymentStore((state) => state.payments);
export const useRecentPayments = () =>
  usePaymentStore((state) => state.recentPayments);
export const usePaymentLoading = () =>
  usePaymentStore((state) => state.isLoading);
export const usePaymentError = () => usePaymentStore((state) => state.error);
export const useTotalPaid = () => usePaymentStore((state) => state.totalPaid);
export const useTotalExtraPaid = () =>
  usePaymentStore((state) => state.totalExtraPaid);
export const useLastMilestone = () =>
  usePaymentStore((state) => state.lastMilestone);
