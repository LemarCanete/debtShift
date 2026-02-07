import { create } from 'zustand';
import { format } from 'date-fns';
import type { PlannedPaymentWithDebt } from '@/services/planner';

/**
 * Planner Store for Payment Planning
 * T104: Create stores/usePlannerStore.ts with plannedPayments state and actions
 */

interface PlannerState {
  plannedPayments: PlannedPaymentWithDebt[];
  selectedMonth: string; // Format: YYYY-MM
  calendarData: Record<string, PlannedPaymentWithDebt[]>;
  isLoading: boolean;
  error: string | null;
}

interface PlannerActions {
  setPlannedPayments: (payments: PlannedPaymentWithDebt[]) => void;
  addPlannedPayment: (payment: PlannedPaymentWithDebt) => void;
  updatePlannedPayment: (id: string, updates: Partial<PlannedPaymentWithDebt>) => void;
  removePlannedPayment: (id: string) => void;
  markComplete: (id: string) => void;
  setSelectedMonth: (month: string) => void;
  setCalendarData: (data: Record<string, PlannedPaymentWithDebt[]>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getPaymentsForDate: (date: string) => PlannedPaymentWithDebt[];
  getUpcomingPayments: () => PlannedPaymentWithDebt[];
}

type PlannerStore = PlannerState & PlannerActions;

export const usePlannerStore = create<PlannerStore>((set, get) => ({
  // Initial state
  plannedPayments: [],
  selectedMonth: format(new Date(), 'yyyy-MM'),
  calendarData: {},
  isLoading: false,
  error: null,

  // Actions
  setPlannedPayments: (payments) =>
    set({
      plannedPayments: payments,
      calendarData: groupByDate(payments),
    }),

  addPlannedPayment: (payment) =>
    set((state) => {
      const newPayments = [...state.plannedPayments, payment];
      return {
        plannedPayments: newPayments,
        calendarData: groupByDate(newPayments),
      };
    }),

  updatePlannedPayment: (id, updates) =>
    set((state) => {
      const newPayments = state.plannedPayments.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      return {
        plannedPayments: newPayments,
        calendarData: groupByDate(newPayments),
      };
    }),

  removePlannedPayment: (id) =>
    set((state) => {
      const newPayments = state.plannedPayments.filter((p) => p.id !== id);
      return {
        plannedPayments: newPayments,
        calendarData: groupByDate(newPayments),
      };
    }),

  markComplete: (id) =>
    set((state) => {
      const newPayments = state.plannedPayments.map((p) =>
        p.id === id
          ? { ...p, is_completed: true, completed_at: new Date().toISOString() }
          : p
      );
      return {
        plannedPayments: newPayments,
        calendarData: groupByDate(newPayments),
      };
    }),

  setSelectedMonth: (month) => set({ selectedMonth: month }),

  setCalendarData: (data) => set({ calendarData: data }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  getPaymentsForDate: (date) => {
    const { calendarData } = get();
    return calendarData[date] || [];
  },

  getUpcomingPayments: () => {
    const { plannedPayments } = get();
    const today = new Date().toISOString().split('T')[0];
    return plannedPayments
      .filter((p) => !p.is_completed && p.planned_date >= today)
      .sort((a, b) => a.planned_date.localeCompare(b.planned_date))
      .slice(0, 5);
  },
}));

// Helper function to group payments by date
function groupByDate(
  payments: PlannedPaymentWithDebt[]
): Record<string, PlannedPaymentWithDebt[]> {
  const grouped: Record<string, PlannedPaymentWithDebt[]> = {};
  for (const payment of payments) {
    const date = payment.planned_date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(payment);
  }
  return grouped;
}

// Selector hooks
export const usePlannedPayments = () =>
  usePlannerStore((state) => state.plannedPayments);
export const useSelectedMonth = () =>
  usePlannerStore((state) => state.selectedMonth);
export const useCalendarData = () =>
  usePlannerStore((state) => state.calendarData);
export const usePlannerLoading = () =>
  usePlannerStore((state) => state.isLoading);
export const usePlannerError = () =>
  usePlannerStore((state) => state.error);
export const useUpcomingPlannedPayments = () =>
  usePlannerStore((state) => state.getUpcomingPayments());
