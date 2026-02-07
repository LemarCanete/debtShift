import { supabase } from './supabase';
import { logPayment } from './payments';
import type { PlannedPayment, Debt } from '@/types/database';

/**
 * Payment Planner Service
 * T103: Create services/planner.ts with CRUD operations for planned payments
 */

export interface PlannedPaymentWithDebt extends PlannedPayment {
  debt?: Debt;
}

export interface PlannerError {
  message: string;
  code?: string;
}

export interface PlannerResult<T = void> {
  data: T | null;
  error: PlannerError | null;
}

export interface CreatePlannedPaymentInput {
  debt_id: string;
  planned_date: string;
  planned_amount: number;
  is_extra?: boolean;
}

export interface UpdatePlannedPaymentInput {
  planned_date?: string;
  planned_amount?: number;
  is_extra?: boolean;
}

/**
 * Get all planned payments for the current user
 */
export async function getPlannedPayments(): Promise<PlannerResult<PlannedPaymentWithDebt[]>> {
  const { data, error } = await supabase
    .from('planned_payments')
    .select(`
      *,
      debt:debts(id, name, creditor, balance, color, minimum_payment, due_day)
    `)
    .order('planned_date', { ascending: true });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: (data || []) as PlannedPaymentWithDebt[],
    error: null,
  };
}

/**
 * Get planned payments for a specific month
 */
export async function getPlannedPaymentsForMonth(
  month: string // Format: YYYY-MM
): Promise<PlannerResult<PlannedPaymentWithDebt[]>> {
  const startDate = `${month}-01`;
  const endDate = `${month}-31`;

  const { data, error } = await supabase
    .from('planned_payments')
    .select(`
      *,
      debt:debts(id, name, creditor, balance, color, minimum_payment, due_day)
    `)
    .gte('planned_date', startDate)
    .lte('planned_date', endDate)
    .order('planned_date', { ascending: true });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: (data || []) as PlannedPaymentWithDebt[],
    error: null,
  };
}

/**
 * Get a single planned payment by ID
 */
export async function getPlannedPayment(
  id: string
): Promise<PlannerResult<PlannedPaymentWithDebt>> {
  const { data, error } = await supabase
    .from('planned_payments')
    .select(`
      *,
      debt:debts(id, name, creditor, balance, color, minimum_payment, due_day)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: data as PlannedPaymentWithDebt,
    error: null,
  };
}

/**
 * Get upcoming planned payments (not completed)
 */
export async function getUpcomingPlannedPayments(
  daysAhead: number = 30
): Promise<PlannerResult<PlannedPaymentWithDebt[]>> {
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('planned_payments')
    .select(`
      *,
      debt:debts(id, name, creditor, balance, color, minimum_payment, due_day)
    `)
    .eq('is_completed', false)
    .gte('planned_date', today)
    .lte('planned_date', futureDateStr)
    .order('planned_date', { ascending: true });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: (data || []) as PlannedPaymentWithDebt[],
    error: null,
  };
}

/**
 * Create a new planned payment
 */
export async function createPlannedPayment(
  input: CreatePlannedPaymentInput
): Promise<PlannerResult<PlannedPayment>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'AUTH_ERROR' },
    };
  }

  const { data, error } = await supabase
    .from('planned_payments')
    .insert({
      user_id: user.id,
      debt_id: input.debt_id,
      planned_date: input.planned_date,
      planned_amount: input.planned_amount,
      is_extra: input.is_extra ?? false,
      is_completed: false,
    })
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: data as PlannedPayment,
    error: null,
  };
}

/**
 * Update a planned payment
 */
export async function updatePlannedPayment(
  id: string,
  input: UpdatePlannedPaymentInput
): Promise<PlannerResult<PlannedPayment>> {
  const { data, error } = await supabase
    .from('planned_payments')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return {
    data: data as PlannedPayment,
    error: null,
  };
}

/**
 * Delete a planned payment
 */
export async function deletePlannedPayment(
  id: string
): Promise<PlannerResult<void>> {
  const { error } = await supabase
    .from('planned_payments')
    .delete()
    .eq('id', id);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: undefined, error: null };
}

/**
 * Mark a planned payment as complete and create actual payment record
 * T110: Add markComplete action that creates actual payment record
 */
export async function markPlannedPaymentComplete(
  id: string
): Promise<PlannerResult<{ plannedPayment: PlannedPayment; paymentId: string }>> {
  // Get the planned payment
  const { data: plannedPayment, error: fetchError } = await supabase
    .from('planned_payments')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError || !plannedPayment) {
    return {
      data: null,
      error: { message: fetchError?.message || 'Planned payment not found', code: fetchError?.code },
    };
  }

  // Create actual payment record
  const paymentResult = await logPayment({
    debt_id: plannedPayment.debt_id,
    amount: plannedPayment.planned_amount,
    payment_date: plannedPayment.planned_date,
    is_extra: plannedPayment.is_extra ?? false,
    notes: 'Completed from planned payment',
  });

  if (paymentResult.error) {
    return {
      data: null,
      error: paymentResult.error,
    };
  }

  // Mark planned payment as complete
  const { data: updatedPlanned, error: updateError } = await supabase
    .from('planned_payments')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return {
      data: null,
      error: { message: updateError.message, code: updateError.code },
    };
  }

  return {
    data: {
      plannedPayment: updatedPlanned as PlannedPayment,
      paymentId: paymentResult.data!.id,
    },
    error: null,
  };
}

/**
 * Get payment calendar data for a month
 * Returns dates with planned payments
 */
export async function getCalendarData(
  month: string // Format: YYYY-MM
): Promise<PlannerResult<Record<string, PlannedPaymentWithDebt[]>>> {
  const result = await getPlannedPaymentsForMonth(month);

  if (result.error) {
    return { data: null, error: result.error };
  }

  // Group payments by date
  const calendar: Record<string, PlannedPaymentWithDebt[]> = {};
  for (const payment of result.data || []) {
    const date = payment.planned_date;
    if (!calendar[date]) {
      calendar[date] = [];
    }
    calendar[date].push(payment);
  }

  return { data: calendar, error: null };
}

/**
 * Calculate total planned payments for a month
 */
export async function getPlannedPaymentTotals(
  month: string
): Promise<PlannerResult<{ total: number; extra: number; minimum: number; count: number }>> {
  const result = await getPlannedPaymentsForMonth(month);

  if (result.error) {
    return { data: null, error: result.error };
  }

  const payments = result.data || [];
  const total = payments.reduce((sum, p) => sum + p.planned_amount, 0);
  const extra = payments
    .filter((p) => p.is_extra)
    .reduce((sum, p) => sum + p.planned_amount, 0);
  const minimum = total - extra;

  return {
    data: { total, extra, minimum, count: payments.length },
    error: null,
  };
}
