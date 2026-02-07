import { supabase } from './supabase';
import type { Debt, TablesInsert, TablesUpdate } from '@/types/database';

export interface DebtError {
  message: string;
  code?: string;
}

export interface DebtResult<T = void> {
  data: T | null;
  error: DebtError | null;
}

/**
 * Create a new debt
 */
export async function createDebt(
  debt: Omit<TablesInsert<'debts'>, 'user_id'>
): Promise<DebtResult<Debt>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated' },
    };
  }

  const { data, error } = await supabase
    .from('debts')
    .insert({ ...debt, user_id: user.id })
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
 * Get all debts for the current user
 */
export async function getDebts(options?: {
  activeOnly?: boolean;
  orderBy?: 'balance' | 'apr' | 'due_day' | 'created_at';
  orderDirection?: 'asc' | 'desc';
}): Promise<DebtResult<Debt[]>> {
  const {
    activeOnly = true,
    orderBy = 'created_at',
    orderDirection = 'desc',
  } = options || {};

  let query = supabase.from('debts').select('*');

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  query = query.order(orderBy, { ascending: orderDirection === 'asc' });

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
 * Get a single debt by ID
 */
export async function getDebt(id: string): Promise<DebtResult<Debt>> {
  const { data, error } = await supabase
    .from('debts')
    .select('*')
    .eq('id', id)
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
 * Update a debt
 */
export async function updateDebt(
  id: string,
  updates: TablesUpdate<'debts'>
): Promise<DebtResult<Debt>> {
  const { data, error } = await supabase
    .from('debts')
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
 * Delete a debt (soft delete by setting is_active to false)
 */
export async function deleteDebt(id: string): Promise<DebtResult> {
  const { error } = await supabase
    .from('debts')
    .update({ is_active: false })
    .eq('id', id);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Permanently delete a debt (hard delete)
 */
export async function permanentlyDeleteDebt(id: string): Promise<DebtResult> {
  const { error } = await supabase.from('debts').delete().eq('id', id);

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  return { data: null, error: null };
}

/**
 * Mark a debt as paid off
 */
export async function markDebtAsPaidOff(id: string): Promise<DebtResult<Debt>> {
  const { data, error } = await supabase
    .from('debts')
    .update({
      balance: 0,
      paid_off_at: new Date().toISOString(),
    })
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
 * Get debts sorted by payoff strategy
 */
export async function getDebtsByStrategy(
  strategy: 'snowball' | 'avalanche'
): Promise<DebtResult<Debt[]>> {
  const orderBy = strategy === 'avalanche' ? 'apr' : 'balance';
  const orderDirection = strategy === 'avalanche' ? 'desc' : 'asc';

  return getDebts({
    activeOnly: true,
    orderBy,
    orderDirection,
  });
}

/**
 * Get total debt statistics
 */
export async function getDebtStats(): Promise<
  DebtResult<{
    totalBalance: number;
    totalOriginal: number;
    totalMinimumPayments: number;
    debtCount: number;
    paidOffCount: number;
    progressPercent: number;
  }>
> {
  const { data: debts, error } = await supabase
    .from('debts')
    .select('balance, original_balance, minimum_payment, paid_off_at');

  if (error) {
    return {
      data: null,
      error: { message: error.message, code: error.code },
    };
  }

  const activeDebts = debts?.filter((d) => !d.paid_off_at) || [];
  const paidOffDebts = debts?.filter((d) => d.paid_off_at) || [];

  const totalBalance = activeDebts.reduce((sum, d) => sum + (d.balance || 0), 0);
  const totalOriginal = debts?.reduce(
    (sum, d) => sum + (d.original_balance || d.balance || 0),
    0
  ) || 0;
  const totalMinimumPayments = activeDebts.reduce(
    (sum, d) => sum + (d.minimum_payment || 0),
    0
  );

  const progressPercent =
    totalOriginal > 0 ? ((totalOriginal - totalBalance) / totalOriginal) * 100 : 0;

  return {
    data: {
      totalBalance,
      totalOriginal,
      totalMinimumPayments,
      debtCount: activeDebts.length,
      paidOffCount: paidOffDebts.length,
      progressPercent: Math.round(progressPercent * 10) / 10,
    },
    error: null,
  };
}
