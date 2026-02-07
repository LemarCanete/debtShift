import { supabase } from './supabase';
import type { Payment, TablesInsert, TablesUpdate, Debt } from '@/types/database';

export interface PaymentError {
  message: string;
  code?: string;
}

export interface PaymentResult<T = void> {
  data: T | null;
  error: PaymentError | null;
}

export interface PaymentWithDebt extends Payment {
  debt?: {
    id: string;
    name: string;
    creditor: string;
    color: string | null;
  };
}

/**
 * Log a new payment for a debt
 */
export async function logPayment(
  payment: Omit<TablesInsert<'payments'>, 'user_id'>
): Promise<
  PaymentResult<{
    payment: Payment;
    newBalance: number;
    milestoneAchieved?: {
      type: string;
      message: string;
    };
  }>
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated' },
    };
  }

  // First, get the current debt balance to validate
  const { data: debt, error: debtError } = await supabase
    .from('debts')
    .select('balance, name')
    .eq('id', payment.debt_id)
    .single();

  if (debtError) {
    return {
      data: null,
      error: { message: 'Debt not found', code: debtError.code },
    };
  }

  // Cap payment at current balance
  const cappedAmount = Math.min(payment.amount, debt.balance);

  // Insert the payment
  const { data: paymentData, error: paymentError } = await supabase
    .from('payments')
    .insert({
      ...payment,
      amount: cappedAmount,
      user_id: user.id,
    })
    .select()
    .single();

  if (paymentError) {
    return {
      data: null,
      error: { message: paymentError.message, code: paymentError.code },
    };
  }

  // Calculate new balance
  const newBalance = Math.max(0, debt.balance - cappedAmount);

  // Update the debt balance
  const { error: updateError } = await supabase
    .from('debts')
    .update({
      balance: newBalance,
      paid_off_at: newBalance === 0 ? new Date().toISOString() : null,
    })
    .eq('id', payment.debt_id);

  if (updateError) {
    return {
      data: null,
      error: { message: updateError.message, code: updateError.code },
    };
  }

  // Check for milestones via the database function
  const { data: progressData } = await supabase.rpc('calculate_debt_progress', {
    p_user_id: user.id,
  });

  let milestoneAchieved: { type: string; message: string } | undefined;

  // Check common milestone thresholds
  const progress = progressData || 0;
  if (progress >= 100) {
    milestoneAchieved = {
      type: 'progress_100',
      message: "You're debt-free! Incredible achievement!",
    };
  } else if (progress >= 75 && progress < 100) {
    milestoneAchieved = {
      type: 'progress_75',
      message: "75% paid off! The finish line is in sight!",
    };
  } else if (progress >= 50 && progress < 75) {
    milestoneAchieved = {
      type: 'progress_50',
      message: "Halfway there! You're doing amazing!",
    };
  } else if (progress >= 25 && progress < 50) {
    milestoneAchieved = {
      type: 'progress_25',
      message: "25% paid off! Great progress!",
    };
  } else if (progress >= 10 && progress < 25) {
    milestoneAchieved = {
      type: 'progress_10',
      message: "10% down! Every payment counts!",
    };
  }

  return {
    data: {
      payment: paymentData,
      newBalance,
      milestoneAchieved,
    },
    error: null,
  };
}

/**
 * Get all payments for the current user
 */
export async function getPayments(options?: {
  debtId?: string;
  fromDate?: string;
  toDate?: string;
  isExtra?: boolean;
  limit?: number;
  cursor?: string;
}): Promise<PaymentResult<PaymentWithDebt[]>> {
  const {
    debtId,
    fromDate,
    toDate,
    isExtra,
    limit = 50,
  } = options || {};

  let query = supabase
    .from('payments')
    .select(`
      *,
      debt:debts(id, name, creditor, color)
    `)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (debtId) {
    query = query.eq('debt_id', debtId);
  }

  if (fromDate) {
    query = query.gte('payment_date', fromDate);
  }

  if (toDate) {
    query = query.lte('payment_date', toDate);
  }

  if (isExtra !== undefined) {
    query = query.eq('is_extra', isExtra);
  }

  const { data, error } = await query;

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data || [], error: null };
}

/**
 * Get payments for a specific debt
 */
export async function getPaymentsForDebt(
  debtId: string,
  limit: number = 20
): Promise<PaymentResult<Payment[]>> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('debt_id', debtId)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: data || [], error: null };
}

/**
 * Update a payment
 */
export async function updatePayment(
  id: string,
  updates: TablesUpdate<'payments'>
): Promise<PaymentResult<Payment>> {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data, error: null };
}

/**
 * Delete a payment (and restore debt balance)
 */
export async function deletePayment(id: string): Promise<PaymentResult> {
  // First get the payment to know the amount
  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('amount, debt_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    return {
      data: null,
      error: { message: 'Payment not found', code: fetchError.code },
    };
  }

  // Delete the payment
  const { error: deleteError } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return {
      data: null,
      error: { message: deleteError.message, code: deleteError.code },
    };
  }

  // Restore the debt balance
  const { data: debt } = await supabase
    .from('debts')
    .select('balance, original_balance')
    .eq('id', payment.debt_id)
    .single();

  if (debt) {
    // Restore balance but don't exceed original
    const newBalance = Math.min(
      debt.balance + payment.amount,
      debt.original_balance
    );

    await supabase
      .from('debts')
      .update({
        balance: newBalance,
        paid_off_at: null, // Remove paid off status since we're restoring balance
      })
      .eq('id', payment.debt_id);
  }

  return { data: null, error: null };
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(): Promise<
  PaymentResult<{
    totalPaid: number;
    totalExtraPaid: number;
    paymentCount: number;
    extraPaymentCount: number;
    lastPaymentDate: string | null;
  }>
> {
  const { data, error } = await supabase.from('payments').select('amount, is_extra, payment_date');

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  const payments = data || [];

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const extraPayments = payments.filter((p) => p.is_extra);
  const totalExtraPaid = extraPayments.reduce((sum, p) => sum + p.amount, 0);

  // Get most recent payment date
  const sortedDates = payments
    .map((p) => p.payment_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return {
    data: {
      totalPaid,
      totalExtraPaid,
      paymentCount: payments.length,
      extraPaymentCount: extraPayments.length,
      lastPaymentDate: sortedDates[0] || null,
    },
    error: null,
  };
}

/**
 * Get monthly payment totals for charts
 */
export async function getMonthlyPayments(
  months: number = 6
): Promise<
  PaymentResult<
    Array<{
      month: string;
      total: number;
      extra: number;
    }>
  >
> {
  // Calculate start date (X months ago)
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('payments')
    .select('amount, is_extra, payment_date')
    .gte('payment_date', startDateStr)
    .order('payment_date', { ascending: true });

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  // Group by month
  const monthlyData = (data || []).reduce(
    (acc, payment) => {
      const month = payment.payment_date.substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, extra: 0 };
      }
      acc[month].total += payment.amount;
      if (payment.is_extra) {
        acc[month].extra += payment.amount;
      }
      return acc;
    },
    {} as Record<string, { total: number; extra: number }>
  );

  // Convert to array with all months
  const result: Array<{ month: string; total: number; extra: number }> = [];
  const currentDate = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    result.push({
      month,
      total: monthlyData[month]?.total || 0,
      extra: monthlyData[month]?.extra || 0,
    });
  }

  return { data: result, error: null };
}
